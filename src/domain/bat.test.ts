import { describe, expect, it } from 'vitest';
import { moveGroup, spanFor } from './bat';
import { BAT_LENGTH_PIXELS, CELL_PIXELS, levelFromRows, type Bat } from './level';

/** Tests are named as the behaviour claimed, not as the function under test — guide-design.md. */

const horizontalAt = (position: number, line = 0): Bat => ({
  orientation: 'horizontal',
  line,
  position,
});

describe('where a bat may slide', () => {
  it('runs the whole row when nothing is in the way', () => {
    const level = levelFromRows(['-.......']);

    expect(spanFor(level, level.bats, level.bats[0]!)).toEqual({
      low: 0,
      high: 8 * CELL_PIXELS - BAT_LENGTH_PIXELS,
    });
  });

  it('stops at the boundary, which is where the row ends', () => {
    const level = levelFromRows(['-...']);

    expect(spanFor(level, level.bats, level.bats[0]!).high).toBe(4 * CELL_PIXELS - BAT_LENGTH_PIXELS);
  });

  it('stops at an element, wherever in the row it sits', () => {
    const level = levelFromRows(['-....d..']);

    expect(spanFor(level, level.bats, level.bats[0]!).high).toBe(5 * CELL_PIXELS - BAT_LENGTH_PIXELS);
  });

  it('is bounded on both sides by whatever it meets first', () => {
    const level = levelFromRows(['p.-...d.']);

    expect(spanFor(level, level.bats, level.bats[0]!)).toEqual({
      low: 1 * CELL_PIXELS,
      high: 6 * CELL_PIXELS - BAT_LENGTH_PIXELS,
    });
  });

  it('answers for a vertical bat down its column', () => {
    const level = levelFromRows(['|.', '..', '..', 'd.']);

    expect(spanFor(level, level.bats, level.bats[0]!)).toEqual({
      low: 0,
      high: 3 * CELL_PIXELS - BAT_LENGTH_PIXELS,
    });
  });
});

describe('a bat group moving', () => {
  it('moves along its own axis by the distance asked for', () => {
    const level = levelFromRows(['-.......']);

    const moved = moveGroup(level, level.bats, 'horizontal', 10);

    expect(moved[0]?.position).toBe(10);
  });

  it('goes no further than the boundary allows', () => {
    const level = levelFromRows(['-...']);

    const moved = moveGroup(level, level.bats, 'horizontal', 9999);

    expect(moved[0]?.position).toBe(4 * CELL_PIXELS - BAT_LENGTH_PIXELS);
  });

  it('goes no further than an element allows', () => {
    const level = levelFromRows(['-....d..']);

    const moved = moveGroup(level, level.bats, 'horizontal', 9999);

    expect(moved[0]?.position).toBe(5 * CELL_PIXELS - BAT_LENGTH_PIXELS);
  });

  it('leaves the other orientation where it was', () => {
    const level = levelFromRows(['-...', '|...', '....', '....']);

    const moved = moveGroup(level, level.bats, 'horizontal', 16);

    const vertical = moved.find((bat) => bat.orientation === 'vertical');
    expect(vertical?.position).toBe(CELL_PIXELS);
  });

  it('changes nothing when asked for no distance', () => {
    const level = levelFromRows(['-.......']);

    expect(moveGroup(level, level.bats, 'horizontal', 0)).toBe(level.bats);
  });
});

describe('a bat group whose members disagree about how far they can go', () => {
  // The constrained bat must have *some* room, or the group never moves and the rule that every
  // member takes the same distance is never exercised.
  const blockedAndFree = levelFromRows(['-...d...', '-.......']);

  it('moves every member by what the most constrained one allows', () => {
    const moved = moveGroup(blockedAndFree, blockedAndFree.bats, 'horizontal', 9999);

    const positions = moved.map((bat) => bat.position);
    expect(new Set(positions).size).toBe(1);
    expect(positions[0]).toBe(4 * CELL_PIXELS - BAT_LENGTH_PIXELS);
  });

  it('does not move at all when one member is already against something', () => {
    const level = levelFromRows(['d-..', '.-..']);
    const stuck = level.bats.map((bat) => ({ ...bat, position: CELL_PIXELS }));

    expect(moveGroup(level, stuck, 'horizontal', -9999)).toEqual(
      stuck.map((bat) => ({ ...bat, position: CELL_PIXELS })),
    );
  });
});

describe('a bat with less room than its own length', () => {
  it('cannot move, rather than sliding through what blocks it', () => {
    const level = levelFromRows(['d-d.....']);

    expect(moveGroup(level, [horizontalAt(CELL_PIXELS)], 'horizontal', 9999)).toEqual([
      horizontalAt(CELL_PIXELS),
    ]);
  });
});

describe('a bat meeting a bat of the other orientation', () => {
  const only = (bats: readonly Bat[], orientation: 'horizontal' | 'vertical') =>
    bats.find((bat) => bat.orientation === orientation)!;

  // A vertical bat down column 5, long enough to lie across the horizontal bat's row.
  const acrossTheRow = levelFromRows(['-....|..', '........', '........', '........']);

  // A horizontal bat along row 4, long enough to lie across the vertical bat's column.
  const acrossTheColumn = levelFromRows([
    '.....|..',
    '........',
    '........',
    '........',
    '...-....',
    '........',
  ]);

  it('stops against it, exactly as it stops against an element', () => {
    const moved = moveGroup(acrossTheRow, acrossTheRow.bats, 'horizontal', 9999);

    expect(only(moved, 'horizontal').position).toBe(5 * CELL_PIXELS - BAT_LENGTH_PIXELS);
  });

  it('blocks the other way round too, so neither can be walked through', () => {
    const moved = moveGroup(acrossTheColumn, acrossTheColumn.bats, 'vertical', 9999);

    expect(only(moved, 'vertical').position).toBe(4 * CELL_PIXELS - BAT_LENGTH_PIXELS);
  });

  it('is not blocked by a bat on its line that stops short of it', () => {
    // The vertical bat is down column 5, which the horizontal bat's run crosses — but it lies over
    // rows 0 to 2 and the horizontal bat is on row 4, so it reaches nowhere near.
    const moved = moveGroup(acrossTheColumn, acrossTheColumn.bats, 'horizontal', 9999);

    expect(only(moved, 'horizontal').position).toBe(8 * CELL_PIXELS - BAT_LENGTH_PIXELS);
  });

  it('passes where that bat no longer reaches', () => {
    // Slid one cell down its column, which takes it clear of row 0 altogether.
    const clear = acrossTheRow.bats.map((bat) =>
      bat.orientation === 'vertical' ? { ...bat, position: CELL_PIXELS } : bat,
    );

    const moved = moveGroup(acrossTheRow, clear, 'horizontal', 9999);

    expect(only(moved, 'horizontal').position).toBe(8 * CELL_PIXELS - BAT_LENGTH_PIXELS);
  });

  it('stops the whole group, the way an element does', () => {
    // The vertical bat lies across row 0 and not row 3, so one member of the group is blocked and
    // the other is not — DS-3.1 makes the blocked one speak for both.
    const paired = levelFromRows(['-....|..', '........', '........', '-.......']);

    const moved = moveGroup(paired, paired.bats, 'horizontal', 9999);

    const positions = moved
      .filter((bat) => bat.orientation === 'horizontal')
      .map((bat) => bat.position);
    expect(new Set(positions).size).toBe(1);
    expect(positions[0]).toBe(5 * CELL_PIXELS - BAT_LENGTH_PIXELS);
  });
});
