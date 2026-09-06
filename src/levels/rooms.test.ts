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

  it('says of every room whether it can be played, and no room as imported can be', () => {
    // Asked of the room *as imported*, which still places the kinds DS-7.1 gives no behaviour to.
    // What a room is played as is the ported level, and src/levels/porting.test.ts asks it there.
    const playable = ROOMS.filter((room) => unplayableReasons(levelOf(room)).length === 0);
    expect(playable).toEqual([]);
  });

  it('names, for every room, the rule that stands between it and being played as imported', () => {
    for (const room of ROOMS) {
      expect(unplayableReasons(levelOf(room))).toContain(
        'DS-7.1 the level places an element of a kind no rule gives behaviour to',
      );
    }
  });

  it('no longer refuses a room for the size of what it places', () => {
    for (const room of ROOMS) {
      expect(unplayableReasons(levelOf(room)).join(' ')).not.toContain('DS-7.2');
    }
  });

  it('refuses only the one room that places two elements on one cell (DS-4.4)', () => {
    const sharing = ROOMS.filter((room) =>
      unplayableReasons(levelOf(room)).includes('DS-4.4 two elements share a cell'),
    );
    expect(sharing.map((room) => room.origin.room)).toEqual([29]);
  });
});
