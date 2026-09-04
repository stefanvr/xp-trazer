import {
  BAT_LENGTH_PIXELS,
  CELL_PIXELS,
  extentOf,
  type Bat,
  type Level,
  type Orientation,
} from './level';

/**
 * What the ball is touching — doc/spec-domain.md's **Collision**: the ball meeting a boundary, a bat
 * or a brick. Pure functions over plain types.
 *
 * Every surface here is axis-aligned, because an element occupies exactly one cell and a bat lies
 * along one. That is what lets **DS-2.4**'s reflection be exact: a collision reverses one component
 * and leaves the other alone, and there is no other kind of surface to meet.
 */

export type Rect = { readonly x: number; readonly y: number; readonly w: number; readonly h: number };

export type Obstacle =
  | { readonly kind: 'boundary' }
  /** `along` is where the ball met the bat, 0 at its low end and 1 at its high one — **DS-2.6**. */
  | { readonly kind: 'bat'; readonly orientation: Orientation; readonly along: number }
  | { readonly kind: 'element'; readonly index: number; readonly destructible: boolean };

export function batRect(bat: Bat): Rect {
  const across = bat.line * CELL_PIXELS;
  return bat.orientation === 'horizontal'
    ? { x: bat.position, y: across, w: BAT_LENGTH_PIXELS, h: CELL_PIXELS }
    : { x: across, y: bat.position, w: CELL_PIXELS, h: BAT_LENGTH_PIXELS };
}

/** A circle overlaps a rectangle when the nearest point of the rectangle is inside it. */
export function overlaps(rect: Rect, x: number, y: number, radius: number): boolean {
  const nearestX = Math.max(rect.x, Math.min(x, rect.x + rect.w));
  const nearestY = Math.max(rect.y, Math.min(y, rect.y + rect.h));
  return Math.hypot(x - nearestX, y - nearestY) < radius;
}

/**
 * What the ball would be inside at this place, or nothing.
 *
 * The boundary is asked first because it can never be destroyed and never moves, so a hit there
 * needs no further search. Elements come next, then bats.
 */
export function obstacleAt(
  level: Level,
  destroyed: ReadonlySet<number>,
  bats: readonly Bat[],
  x: number,
  y: number,
  radius: number,
): Obstacle | undefined {
  const { width, height } = extentOf(level);
  if (x - radius < 0 || x + radius > width || y - radius < 0 || y + radius > height) {
    return { kind: 'boundary' };
  }

  const firstColumn = Math.max(0, Math.floor((x - radius) / CELL_PIXELS));
  const lastColumn = Math.min(level.columns - 1, Math.floor((x + radius) / CELL_PIXELS));
  const firstRow = Math.max(0, Math.floor((y - radius) / CELL_PIXELS));
  const lastRow = Math.min(level.rows - 1, Math.floor((y + radius) / CELL_PIXELS));

  for (let row = firstRow; row <= lastRow; row += 1) {
    for (let column = firstColumn; column <= lastColumn; column += 1) {
      const index = row * level.columns + column;
      const cell = level.cells[index];
      if (cell === undefined || destroyed.has(index)) continue;

      const rect = {
        x: column * CELL_PIXELS,
        y: row * CELL_PIXELS,
        w: CELL_PIXELS,
        h: CELL_PIXELS,
      };
      if (overlaps(rect, x, y, radius)) {
        return { kind: 'element', index, destructible: cell.kind === 'destructible' };
      }
    }
  }

  for (const bat of bats) {
    if (!overlaps(batRect(bat), x, y, radius)) continue;

    const reached = bat.orientation === 'horizontal' ? x : y;
    const along = (reached - bat.position) / BAT_LENGTH_PIXELS;
    return { kind: 'bat', orientation: bat.orientation, along: Math.min(Math.max(along, 0), 1) };
  }

  return undefined;
}
