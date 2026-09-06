import { describe, expect, it } from 'vitest';

import { PLAYABLE_ROOMS, roomDrawnFrom } from './drawn-room';
import { unplayableReasons } from '../domain/playable';
import { CELL_PIXELS, destructibleCount, extentOf } from '../domain/level';
import { ROOM_COLUMNS, ROOM_ROWS } from '../import/convert.ts';

describe('the room a player is dropped into', () => {
  it('offers only rooms that can actually be played', () => {
    expect(PLAYABLE_ROOMS.length).toBeGreaterThan(0);
    for (const level of PLAYABLE_ROOMS) expect(unplayableReasons(level)).toEqual([]);
  });

  it('offers every room that can be played, and no more', () => {
    // The count is the tree's answer, not a number kept by hand — doc/spec-domain-porting-todo.md
    // quotes it, and says the suite is what decides where the two disagree.
    expect(PLAYABLE_ROOMS).toHaveLength(28);
  });

  it('gives every drawable room the original screen, so what is drawn is a real room', () => {
    for (const level of PLAYABLE_ROOMS) {
      expect([level.columns, level.rows]).toEqual([ROOM_COLUMNS, ROOM_ROWS]);
      expect(extentOf(level)).toEqual({
        width: ROOM_COLUMNS * CELL_PIXELS,
        height: ROOM_ROWS * CELL_PIXELS,
      });
    }
  });

  it('gives every drawable room something to clear and something to clear it with', () => {
    for (const level of PLAYABLE_ROOMS) {
      expect(destructibleCount(level)).toBeGreaterThan(0);
      expect(level.bats.length).toBeGreaterThan(0);
    }
  });

  it('says which room of the original it came from', () => {
    for (const level of PLAYABLE_ROOMS) expect(level.origin).not.toBeUndefined();
  });

  it('draws the same room from the same seed', () => {
    expect(roomDrawnFrom(7).origin).toEqual(roomDrawnFrom(7).origin);
  });

  it('reaches every drawable room across enough seeds, so none is unreachable', () => {
    const reached = new Set<number>();
    for (let seed = 0; seed < PLAYABLE_ROOMS.length * 4; seed += 1) {
      reached.add(roomDrawnFrom(seed).origin!.room);
    }
    expect(reached.size).toBe(PLAYABLE_ROOMS.length);
  });

  it('draws a playable room from any seed, however large or negative', () => {
    for (const seed of [0, 1, -1, -9999, Date.now(), Number.MAX_SAFE_INTEGER]) {
      expect(unplayableReasons(roomDrawnFrom(seed))).toEqual([]);
    }
  });
});
