import { describe, expect, it } from 'vitest';

import { ROOMS } from './rooms.generated';
import { portedLevel } from './porting';
import { bat as placedBat, element as placedElement, levelOf, type ImportedRoom } from './room-notation';
import { unplayableReasons } from '../domain/playable';
import { isBrickKind } from '../domain/level';

/**
 * The concessions listed in doc/spec-domain-porting-todo.md, asserted one at a time. That document
 * is the authority on which they are and what would end each; this file is what stops one being made
 * quietly, or one being withdrawn without the document noticing.
 */
const room = (number: number) => {
  const found = ROOMS.find((candidate) => candidate.origin.room === number);
  if (found === undefined) throw new Error(`no room ${number}`);
  return found;
};

const kindsIn = (number: number) =>
  new Set(portedLevel(room(number)).elements.map((element) => element.kind));

describe('what an imported room gives up so that it can be played', () => {
  it('keeps the ball start the room authors, which DS-1.4 now reads (P-1 ended)', () => {
    for (const imported of ROOMS) {
      expect(imported.ballStart).not.toBeUndefined();
      expect(portedLevel(imported).ballStart).toEqual(imported.ballStart);
    }
  });

  it('leaves out the refractor and the traps, and keeps nothing of them (P-2, P-3)', () => {
    for (const imported of ROOMS) {
      const kinds = kindsIn(imported.origin.room);
      expect(kinds.has('glassRefractor')).toBe(false);
      expect(kinds.has('horizontalTrap')).toBe(false);
      expect(kinds.has('verticalTrap')).toBe(false);
    }
  });

  it('stands a bumper as a permanent brick, where it stood and as big (P-5)', () => {
    const imported = ROOMS.find((candidate) =>
      candidate.elements.some((element) => element.kind === 'bumper'),
    );
    const original = imported?.elements.find((element) => element.kind === 'bumper');
    const stood = portedLevel(imported!).elements.find(
      (element) => element.column === original?.column && element.row === original?.row,
    );

    expect(original).not.toBeUndefined();
    expect(stood?.kind).toBe('permanent');
    expect(stood?.footprint).toEqual(original?.footprint);
    expect(stood?.colorId).toBe(original?.colorId);
  });

  /**
   * The corrected export places no monster generator anywhere in the stock 64 rooms —
   * `src/import/convert.ts`'s own note on `OBJECT_KINDS` says why — so there is no room to find one
   * in, and the concession is asserted over a level built for the purpose instead.
   */
  it('stands a monsterGenerator as a permanent brick, where it stood and as big (P-4)', () => {
    const original = placedElement('monsterGenerator', 2, 2, 4, 3, 5);
    const synthetic: ImportedRoom = {
      origin: { room: -1 },
      columns: 8,
      rows: 8,
      colorId: 0,
      ballStart: { column: 0, row: 0 },
      bats: [placedBat('horizontal', 0, 7)],
      elements: [original],
    };
    const stood = portedLevel(synthetic).elements.find(
      (element) => element.column === original.column && element.row === original.row,
    );

    expect(stood?.kind).toBe('permanent');
    expect(stood?.footprint).toEqual(original.footprint);
    expect(stood?.colorId).toBe(original.colorId);
  });

  it('gives a played room only kinds the rules read', () => {
    for (const imported of ROOMS) {
      for (const kind of kindsIn(imported.origin.room)) expect(isBrickKind(kind)).toBe(true);
    }
  });

  it('changes nothing about the rooms in the tree, which stay as the original placed them', () => {
    const untouched = ROOMS.some((imported) =>
      imported.elements.some((element) => !isBrickKind(element.kind)),
    );
    expect(untouched).toBe(true);
  });
});

describe('how many of the original rooms can be played', () => {
  const playable = ROOMS.filter((imported) => unplayableReasons(portedLevel(imported)).length === 0);

  it('plays 63 of the 64', () => {
    expect(playable).toHaveLength(63);
  });

  it('refuses the rest only for two elements on one cell', () => {
    const refused = ROOMS.filter((imported) => !playable.includes(imported));
    for (const imported of refused) {
      expect(unplayableReasons(portedLevel(imported)).join(' ')).toMatch(/DS-4\.4/);
    }
  });

  it('keeps room 29 unplayable, because two of its elements share a cell', () => {
    expect(unplayableReasons(portedLevel(room(29)))).toContain('DS-4.4 two elements share a cell');
  });

  it('plays no room that the import alone would have played, since none of them is playable', () => {
    expect(ROOMS.filter((imported) => unplayableReasons(levelOf(imported)).length === 0)).toEqual([]);
  });
});
