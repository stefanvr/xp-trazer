import { describe, expect, it } from 'vitest';

import { convertRoom, ROOM_COLUMNS, ROOM_ROWS, type SourceRoom } from './convert.ts';
import { ROOMS } from '../levels/rooms.generated';
import source from './room-24.source.json';

/**
 * The record of room 24 as the export decoded it, committed beside the converter so that *a
 * converted room is asserted against its source* is a claim the suite can make on any machine. The
 * export itself is not in this tree, so without this file the assertion could only be made by hand,
 * once, here.
 *
 * **Room 24 because it places every object kind the export uses**, both bat orientations among
 * them. The first fixture chosen was the lightest room instead, and a deliberate mistake in a kind
 * that room does not place passed the whole suite — a fixture asserts only what it contains.
 */
const room24 = source as unknown as SourceRoom;

describe('converting a room of the original', () => {
  it('reproduces the room committed in the tree, so the two cannot drift apart', () => {
    expect(convertRoom(room24)).toEqual(ROOMS[24]);
  });

  it('keeps every object the export holds', () => {
    expect(convertRoom(room24).elements).toHaveLength(room24.objects.length);
  });

  it('places each object at the cell the export gives it', () => {
    const [first] = room24.objects;
    const converted = convertRoom(room24).elements[0];
    expect(converted?.column).toBe(first?.col);
    expect(converted?.row).toBe(first?.row);
    expect(converted?.colorId).toBe(first?.color_index);
  });

  it('carries the ball start the room authors', () => {
    expect(convertRoom(room24).ballStart).toEqual({
      column: room24.ball_start?.x_col,
      row: room24.ball_start?.y_row,
    });
  });

  it('lays the room out on the screen the original used', () => {
    expect(convertRoom(room24).columns).toBe(ROOM_COLUMNS);
    expect(convertRoom(room24).rows).toBe(ROOM_ROWS);
  });

  it('says which room it came from', () => {
    expect(convertRoom(room24).origin).toEqual({ room: 24 });
  });

  it('fails loudly on an object kind it has no name for', () => {
    const strange = { ...room24, objects: [{ type: 'Wormhole', color_index: 1, row: 2, col: 3 }] };
    expect(() => convertRoom(strange)).toThrow(/no kind for: Wormhole/);
  });

  it('fails loudly on a bat lying along no axis', () => {
    const strange = { ...room24, bats: [{ x_col: 1, y_row: 2, orientation: 'diagonal' }] };
    expect(() => convertRoom(strange)).toThrow(/lying along no axis/);
  });
});
