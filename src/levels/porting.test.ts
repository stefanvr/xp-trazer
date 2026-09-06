import { describe, expect, it } from 'vitest';

import { ROOMS } from './rooms.generated';
import { portedLevel } from './porting';
import { levelOf } from './room-notation';
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
  it('leaves the authored ball start behind, so DS-1.4 draws from the seed (P-1)', () => {
    for (const imported of ROOMS) {
      expect(imported.ballStart).not.toBeUndefined();
      expect(portedLevel(imported).ballStart).toBeUndefined();
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

  it.each(['monsterGenerator', 'bumper'] as const)(
    'stands a %s as a permanent brick, where it stood and as big (P-4, P-5)',
    (kind) => {
      const imported = ROOMS.find((candidate) =>
        candidate.elements.some((element) => element.kind === kind),
      );
      const original = imported?.elements.find((element) => element.kind === kind);
      const stood = portedLevel(imported!).elements.find(
        (element) => element.column === original?.column && element.row === original?.row,
      );

      expect(original).not.toBeUndefined();
      expect(stood?.kind).toBe('permanent');
      expect(stood?.footprint).toEqual(original?.footprint);
      expect(stood?.colorId).toBe(original?.colorId);
    },
  );

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

  it('plays 28 of the 64', () => {
    expect(playable).toHaveLength(28);
  });

  it('refuses the rest only for a free-standing bat or two elements on one cell', () => {
    const refused = ROOMS.filter((imported) => !playable.includes(imported));
    for (const imported of refused) {
      expect(unplayableReasons(portedLevel(imported)).join(' ')).toMatch(/DS-7\.5|DS-4\.4/);
    }
  });

  it('keeps room 29 unplayable, because two of its elements share a cell', () => {
    expect(unplayableReasons(portedLevel(room(29)))).toContain('DS-4.4 two elements share a cell');
  });

  it('plays no room that the import alone would have played, since none of them is playable', () => {
    expect(ROOMS.filter((imported) => unplayableReasons(levelOf(imported)).length === 0)).toEqual([]);
  });
});
