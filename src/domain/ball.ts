import { BAT_LENGTH_PIXELS, CELL_PIXELS, type Bat, type Level } from './level';

/**
 * Where a held ball sits, and where it goes when launched — **DS-2.1** and **DS-2.2**. Pure
 * functions over plain types.
 *
 * **DS-2.5**: the ball's speed never changes, so there is one of it.
 */
export const BALL_PIXELS_PER_SECOND = 260;

/**
 * How hard a bat's outer third turns the ball — **DS-2.6**. Sideways speed added before the vector
 * is scaled back to one speed, so it sets the angle rather than the pace. Balancing, not rule.
 */
export const BAT_DEFLECTION_PIXELS_PER_SECOND = 90;

export type Vector = { readonly x: number; readonly y: number };

/**
 * Which way the ball leaves its bat — the open side, per **DS-1.6** and **DS-2.2**.
 *
 * **DS-1.6** says a bat has something the ball cannot pass on one perpendicular side. The ball rests
 * on the other, and leaves that way. Today the only such thing is the level's edge; when a hazard
 * can sit against a bat, this is where it is read.
 *
 * A bat with both sides open, or neither, has no answer. That is a level that **DS-1.6** forbids, so
 * this fails loudly rather than picking one — `createGameState` asks for every bat at start, which is
 * where such a level is refused.
 */
export function awayFrom(level: Level, bat: Bat): Vector {
  const last = bat.orientation === 'horizontal' ? level.rows - 1 : level.columns - 1;
  const blockedBefore = bat.line === 0;
  const blockedAfter = bat.line === last;

  if (blockedBefore === blockedAfter) {
    const sides = blockedBefore ? 'both sides blocked' : 'nothing on either side';
    throw new Error(
      `a ${bat.orientation} bat on line ${bat.line} has ${sides}; DS-1.6 wants exactly one`,
    );
  }

  const forwards = blockedBefore;
  if (bat.orientation === 'horizontal') return { x: 0, y: forwards ? 1 : -1 };
  return { x: forwards ? 1 : -1, y: 0 };
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
/**
 * **DS-2.6** — a bat turns the ball by where along it the ball was met. The outer thirds send it
 * away from the middle; the middle third leaves the angle reflection gave it.
 *
 * **This is what makes the game playable at all.** Launching is perpendicular and reflection off an
 * axis-aligned surface only reverses one component, so without a bat to turn it the ball would
 * retrace one line for ever.
 */
export function deflectedByBat(
  velocity: Vector,
  orientation: 'horizontal' | 'vertical',
  along: number,
): Vector {
  const third = Math.min(2, Math.floor(along * 3));
  if (third === 1) return velocity;

  const sideways = third === 0 ? -BAT_DEFLECTION_PIXELS_PER_SECOND : BAT_DEFLECTION_PIXELS_PER_SECOND;
  const turned =
    orientation === 'horizontal'
      ? { x: velocity.x + sideways, y: velocity.y }
      : { x: velocity.x, y: velocity.y + sideways };

  // DS-2.5 — scaled back to the one speed, so this turns the ball rather than pushing it.
  const speed = Math.hypot(turned.x, turned.y);
  if (speed === 0) return velocity;
  return {
    x: (turned.x / speed) * BALL_PIXELS_PER_SECOND,
    y: (turned.y / speed) * BALL_PIXELS_PER_SECOND,
  };
}

export function batHoldingTheBall(level: Level, seed: number): number {
  return Math.abs(Math.trunc(seed)) % level.bats.length;
}
