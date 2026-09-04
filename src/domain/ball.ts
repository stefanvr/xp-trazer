import { BAT_LENGTH_PIXELS, CELL_PIXELS, type Bat, type Level } from './level';

/**
 * Where a held ball sits, and where it goes when launched — **DS-2.1** and **DS-2.2**. Pure
 * functions over plain types.
 *
 * **DS-2.5**: the ball's speed never changes, so there is one of it.
 */
export const BALL_PIXELS_PER_SECOND = 260;

export type Vector = { readonly x: number; readonly y: number };

/**
 * Which way the ball leaves its bat.
 *
 * **DS-2.2** says perpendicular to the bat and away from it, which fixes the axis but not the sign —
 * a bat with level on both sides could throw either way. The side taken is the one with more level
 * behind it, so a bat in the top half throws downwards and one in the bottom half throws up. That
 * keeps **DS-1.1** — nothing leaves the level — true for a bat hard against an edge, where the other
 * side is outside.
 */
export function awayFrom(level: Level, bat: Bat): Vector {
  if (bat.orientation === 'horizontal') {
    return bat.line < level.rows / 2 ? { x: 0, y: 1 } : { x: 0, y: -1 };
  }
  return bat.line < level.columns / 2 ? { x: 1, y: 0 } : { x: -1, y: 0 };
}

/** **DS-2.1** — a held ball rests on its bat, so its place is the bat's place. */
export function restingOn(level: Level, bat: Bat, radius: number): Vector {
  const away = awayFrom(level, bat);
  const middle = bat.position + BAT_LENGTH_PIXELS / 2;
  const near = bat.line * CELL_PIXELS;
  const far = near + CELL_PIXELS;

  if (bat.orientation === 'horizontal') {
    return { x: middle, y: away.y > 0 ? far + radius : near - radius };
  }
  return { x: away.x > 0 ? far + radius : near - radius, y: middle };
}

/** **DS-2.2** — launching sets it travelling, at the one speed **DS-2.5** allows. */
export function launchVelocity(level: Level, bat: Bat): Vector {
  const away = awayFrom(level, bat);
  return { x: away.x * BALL_PIXELS_PER_SECOND, y: away.y * BALL_PIXELS_PER_SECOND };
}

/**
 * **DS-1.4** — one of the level's bats, drawn from the seed.
 *
 * guide-design: anything random is seeded, and ties break deterministically. The same seed and the
 * same level always name the same bat, which is what makes a level start reproducible in a test.
 */
export function batHoldingTheBall(level: Level, seed: number): number {
  return Math.abs(Math.trunc(seed)) % level.bats.length;
}
