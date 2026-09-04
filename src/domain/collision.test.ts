import { describe, expect, it } from 'vitest';
import { batRect, obstacleAt, overlaps } from './collision';
import { BAT_LENGTH_PIXELS, CELL_PIXELS, levelFromRows } from './level';

/** Tests are named as the behaviour claimed, not as the function under test — guide-design.md. */

const NOTHING_DESTROYED: ReadonlySet<number> = new Set();
const RADIUS = 9;

// Four columns, four rows. A destructible brick at (1,1) and a permanent one at (2,1).
const LEVEL = levelFromRows(['-...', '.dp.', '....', '....']);
const NO_BATS = LEVEL.bats.map((bat) => ({ ...bat, position: -1000 }));

const at = (x: number, y: number, bats = NO_BATS) =>
  obstacleAt(LEVEL, NOTHING_DESTROYED, bats, x, y, RADIUS);

describe('a circle against a rectangle', () => {
  const rect = { x: 10, y: 10, w: 20, h: 20 };

  it('overlaps when its edge reaches inside', () => {
    expect(overlaps(rect, 5, 20, 6)).toBe(true);
  });

  it('does not overlap when it only touches', () => {
    expect(overlaps(rect, 4, 20, 6)).toBe(false);
  });

  it('overlaps a corner by the corner, not by the bounding box', () => {
    // Both circles' bounding boxes reach the rectangle; only the second one actually touches it.
    expect(overlaps(rect, 5, 5, 6)).toBe(false); // corner is 7.07 away
    expect(overlaps(rect, 8, 8, 6)).toBe(true); // corner is 2.83 away
  });
});

describe('what the ball is inside', () => {
  it('finds nothing in an empty part of the level', () => {
    expect(at(3 * CELL_PIXELS + 16, 3 * CELL_PIXELS + 16)).toBeUndefined();
  });

  it('finds the boundary beyond any edge', () => {
    expect(at(RADIUS - 1, 50)).toEqual({ kind: 'boundary' });
    expect(at(4 * CELL_PIXELS - RADIUS + 1, 50)).toEqual({ kind: 'boundary' });
    expect(at(50, RADIUS - 1)).toEqual({ kind: 'boundary' });
  });

  it('finds a destructible brick, and says it is one', () => {
    const hit = at(CELL_PIXELS + 16, CELL_PIXELS + 16);

    expect(hit).toEqual({ kind: 'element', index: 4 + 1, destructible: true });
  });

  it('finds a permanent brick, and says it is not destructible', () => {
    const hit = at(2 * CELL_PIXELS + 16, CELL_PIXELS + 16);

    expect(hit).toEqual({ kind: 'element', index: 4 + 2, destructible: false });
  });

  it('finds nothing where a brick has already been destroyed', () => {
    const gone = new Set([4 + 1]);

    expect(
      obstacleAt(LEVEL, gone, NO_BATS, CELL_PIXELS + 16, CELL_PIXELS + 16, RADIUS),
    ).toBeUndefined();
  });

  it('finds a bat where one is', () => {
    const bat = { orientation: 'horizontal', line: 3, position: 0 } as const;

    expect(at(16, 3 * CELL_PIXELS + 16, [bat])).toEqual({ kind: 'bat' });
  });

  it('finds nothing beside a bat it does not reach', () => {
    const bat = { orientation: 'horizontal', line: 3, position: 0 } as const;

    expect(at(BAT_LENGTH_PIXELS + RADIUS + 1, 3 * CELL_PIXELS + 16, [bat])).toBeUndefined();
  });
});

describe('the rectangle a bat occupies', () => {
  it('runs along the row for a horizontal bat', () => {
    expect(batRect({ orientation: 'horizontal', line: 2, position: 40 })).toEqual({
      x: 40,
      y: 2 * CELL_PIXELS,
      w: BAT_LENGTH_PIXELS,
      h: CELL_PIXELS,
    });
  });

  it('runs down the column for a vertical bat', () => {
    expect(batRect({ orientation: 'vertical', line: 2, position: 40 })).toEqual({
      x: 2 * CELL_PIXELS,
      y: 40,
      w: CELL_PIXELS,
      h: BAT_LENGTH_PIXELS,
    });
  });
});
