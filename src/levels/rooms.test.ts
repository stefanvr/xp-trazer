import { describe, expect, it } from 'vitest';

import { ROOMS } from './rooms.generated';
import { levelOf } from './room-notation';
import { unplayableReasons } from '../domain/playable';
import { ROOM_COLUMNS, ROOM_ROWS } from '../import/convert.ts';

describe('the original\'s rooms, in the tree', () => {
  it('holds every room the original has, in order', () => {
    expect(ROOMS).toHaveLength(64);
    expect(ROOMS.map((room) => room.origin.room)).toEqual([...Array(64).keys()]);
  });

  it('lays every room out on the screen the original used', () => {
    for (const room of ROOMS) {
      expect([room.columns, room.rows]).toEqual([ROOM_COLUMNS, ROOM_ROWS]);
    }
  });

  it('gives every room at least one bat and one element', () => {
    for (const room of ROOMS) {
      expect(room.bats.length).toBeGreaterThan(0);
      expect(room.elements.length).toBeGreaterThan(0);
    }
  });

  it('gives every element and every room a color id', () => {
    for (const room of ROOMS) {
      expect(room.colorId).not.toBeUndefined();
      for (const element of room.elements) expect(element.colorId).not.toBeUndefined();
    }
  });

  it('says of every room whether it can be played, and 11 of them already can be as imported', () => {
    // Asked of the room *as imported*, which still places the kinds DS-7.1 gives no behaviour to.
    // What a room is played as is the ported level, and src/levels/porting.test.ts asks it there.
    // 11 place nothing DS-7.1 still refuses — a trap alone no longer stands in the way, since DS-8
    // gives it a rule — so the import plays them unmodified, before porting does anything at all.
    const playable = ROOMS.filter((room) => unplayableReasons(levelOf(room)).length === 0);
    expect(playable).toHaveLength(11);
  });

  it('names DS-7.1 for every other room, as the rule still between it and being played as imported', () => {
    for (const room of ROOMS) {
      const reasons = unplayableReasons(levelOf(room));
      if (reasons.length === 0) continue; // One of the 11 above — DS-8 already plays this one.
      expect(reasons).toContain(
        'DS-7.1 the level places an element of a kind no rule gives behaviour to',
      );
    }
  });

  it('no longer refuses a room for the size of what it places', () => {
    for (const room of ROOMS) {
      expect(unplayableReasons(levelOf(room)).join(' ')).not.toContain('DS-7.2');
    }
  });

  /**
   * **The only assertion here that the table which generated these rooms cannot satisfy by itself.**
   * Every other one compares the rooms against that table, so swapping two names in it and
   * regenerating passes all of them — tried, and it did. These numbers come from the original
   * instead, which is the only place the answer exists: three separate decodes of the export name
   * these layers three different ways, and all three are wrong.
   *
   * So a renamed layer fails here and nowhere else. The shapes are in the same assertion because a
   * name and a footprint move together when a layer is misread — nine characters occupy 3×3, four
   * occupy 2×2 — and the bumper's absence is asserted by there being no line for it.
   */
  it('places what the original places — each kind, its shape, and how many', () => {
    const counted = new Map<string, number>();
    for (const room of ROOMS) {
      for (const element of room.elements) {
        const kind = `${element.kind} ${element.footprint.columns}×${element.footprint.rows}`;
        counted.set(kind, (counted.get(kind) ?? 0) + 1);
      }
    }

    expect(Object.fromEntries([...counted].sort())).toEqual({
      'destructible 1×2': 774,
      'destructible 2×1': 5236,
      'glassRefractor 2×2': 375,
      'horizontalTrap 2×1': 586,
      'monsterGenerator 3×3': 141,
      'permanent 2×1': 817,
      'verticalTrap 1×2': 363,
    });
  });

  it('refuses only the one room that places two elements on one cell (DS-4.4)', () => {
    const sharing = ROOMS.filter((room) =>
      unplayableReasons(levelOf(room)).includes('DS-4.4 two elements share a cell'),
    );
    expect(sharing.map((room) => room.origin.room)).toEqual([29]);
  });
});
