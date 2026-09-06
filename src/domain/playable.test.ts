import { describe, expect, it } from 'vitest';

import { CELL_PIXELS, levelFrom, levelFromRows, ONE_CELL, type PlacedElement } from './level';
import { isPlayable, unplayableReasons } from './playable';
import { FIRST_LEVEL } from '../levels/first';
import { clearingProofLevel } from '../levels/clearing-proof';

const brick = (column: number, row: number): PlacedElement => ({
  kind: 'destructible',
  column,
  row,
  footprint: ONE_CELL,
  colorId: undefined,
});

/** A level that can be played, to change one thing about per test. */
const playableParts = {
  columns: 6,
  rows: 6,
  elements: [brick(1, 1)],
  bats: [{ orientation: 'horizontal', line: 5, position: 0 }],
  ballStart: { column: 3, row: 3 },
} as const;

describe('a level says whether it can be played', () => {
  it('says nothing is wrong with the authored level', () => {
    expect(unplayableReasons(levelFromRows(FIRST_LEVEL))).toEqual([]);
    expect(isPlayable(levelFromRows(FIRST_LEVEL))).toBe(true);
  });

  it('says nothing is wrong with the level the clearing proof plays', () => {
    expect(unplayableReasons(clearingProofLevel())).toEqual([]);
  });

  it('refuses a level that places a kind no rule gives behaviour to (DS-7.1)', () => {
    const level = levelFrom({
      ...playableParts,
      elements: [...playableParts.elements, { ...brick(3, 3), kind: 'bumper' }],
    });
    expect(unplayableReasons(level)).toContain(
      'DS-7.1 the level places an element of a kind no rule gives behaviour to',
    );
  });

  it('plays a level whose element occupies more than one cell, which DS-4.4 now answers', () => {
    const level = levelFrom({
      ...playableParts,
      elements: [{ ...brick(1, 1), footprint: { columns: 2, rows: 1 } }],
    });
    expect(unplayableReasons(level)).toEqual([]);
  });

  it('refuses a level where two elements share a cell (DS-4.4)', () => {
    const level = levelFrom({
      ...playableParts,
      elements: [{ ...brick(1, 1), footprint: { columns: 2, rows: 1 } }, brick(2, 1)],
    });
    expect(unplayableReasons(level)).toContain('DS-4.4 two elements share a cell');
  });

  it('refuses a level authoring no ball start, which DS-1.4 requires of every level', () => {
    const level = levelFrom({ ...playableParts, ballStart: undefined });
    expect(unplayableReasons(level)).toContain('DS-1.4 the level authors no ball start');
  });

  it('plays a level whose bat stands free of both its perpendicular sides', () => {
    // DS-1.6 required one blocked side and was withdrawn: nothing reads a bat's sides now, so a bat
    // in open ground is an ordinary bat. Not one bat in the original's 64 rooms sits against an edge.
    const level = levelFrom({
      ...playableParts,
      bats: [{ orientation: 'horizontal', line: 3, position: 0 }],
    });
    expect(unplayableReasons(level)).toEqual([]);
  });

  it('refuses a level with no destructible element (DS-1.8)', () => {
    const level = levelFrom({ ...playableParts, elements: [{ ...brick(1, 1), kind: 'permanent' }] });
    expect(unplayableReasons(level)).toContain(
      'DS-1.8 the level authors no destructible element',
    );
  });

  it('refuses a level with no bat (DS-1.3)', () => {
    expect(unplayableReasons(levelFrom({ ...playableParts, bats: [] }))).toContain(
      'DS-1.3 the level authors no bat',
    );
  });

  it('refuses two bats of one orientation sharing a place (DS-1.7)', () => {
    const level = levelFrom({
      ...playableParts,
      bats: [
        { orientation: 'horizontal', line: 5, position: 0 },
        { orientation: 'horizontal', line: 5, position: CELL_PIXELS },
      ],
    });
    expect(unplayableReasons(level)).toContain(
      'DS-1.7 two bats share a place, or one has less room to slide than its own length',
    );
  });

  it('refuses a bat hanging off the end of its line (DS-1.7)', () => {
    const level = levelFrom({
      ...playableParts,
      bats: [{ orientation: 'horizontal', line: 5, position: 5 * CELL_PIXELS }],
    });
    expect(unplayableReasons(level)).toContain(
      'DS-1.7 two bats share a place, or one has less room to slide than its own length',
    );
  });

  it('names every rule a level breaks, in the order they are numbered', () => {
    const level = levelFrom({
      columns: 6,
      rows: 6,
      elements: [
        { ...brick(1, 1), kind: 'bumper', footprint: { columns: 2, rows: 2 } },
        { ...brick(2, 2), kind: 'bumper' },
      ],
      bats: [{ orientation: 'horizontal', line: 3, position: 0 }],
      ballStart: undefined,
    });
    expect(unplayableReasons(level)).toEqual([
      'DS-1.4 the level authors no ball start',
      'DS-1.8 the level authors no destructible element',
      'DS-4.4 two elements share a cell',
      'DS-7.1 the level places an element of a kind no rule gives behaviour to',
    ]);
  });
});
