import { CELL_PIXELS, type Level } from './level';

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
 * **DS-2.1** — a held ball waits at the ball start the level authors, and nothing moves it.
 *
 * The middle of that cell, so the ball sits where the author pointed rather than in its corner. A
 * cell is wider than the ball, so the middle of one is always clear of the boundary and there is
 * nothing to clamp.
 */
export function heldAt(level: Level): Vector {
  const start = level.ballStart;
  if (start === undefined) {
    throw new Error('a level authors no ball start, and DS-1.4 says every level authors one');
  }
  return { x: (start.column + 0.5) * CELL_PIXELS, y: (start.row + 0.5) * CELL_PIXELS };
}

/**
 * A fraction in [0, 1) from a seed, spread so that seeds one apart are not answers one apart.
 *
 * The seed is a clock reading at the edge, and two page loads a moment apart differ only in their
 * last digits — so using it directly would launch every ball of a session on nearly one heading,
 * which is a draw in name alone.
 */
function fractionFrom(seed: number): number {
  let value = Math.abs(Math.trunc(seed)) % 2147483647;
  value = (value ^ 61) ^ (value >>> 16);
  value = value + (value << 3);
  value = value ^ (value >>> 4);
  value = Math.imul(value, 0x27d4eb2d);
  value = value ^ (value >>> 15);
  return (value >>> 0) / 4294967296;
}

/**
 * **DS-2.2** — launching sets the ball travelling on a heading drawn from the seed, at the one speed
 * **DS-2.5** allows.
 *
 * Any heading over the whole circle: the rule says the seed decides and says nothing further, and
 * narrowing it here — excluding the headings along an axis, say — would be a rule invented in code.
 * The same seed always launches the same way, which is guide-design's *anything random is seeded*
 * and what lets a test repeat a start exactly.
 */
export function launchVelocity(seed: number): Vector {
  const angle = fractionFrom(seed) * Math.PI * 2;
  return {
    x: Math.cos(angle) * BALL_PIXELS_PER_SECOND,
    y: Math.sin(angle) * BALL_PIXELS_PER_SECOND,
  };
}

/**
 * **DS-2.5** — scaled back to the one speed the ball ever has, so a deflection turns it rather than
 * pushing it. Shared by both of a bat's ways of turning the ball, which differ only in which axis
 * they add `sideways` to before this runs.
 */
function atBallSpeed(turned: Vector, ifZero: Vector): Vector {
  const speed = Math.hypot(turned.x, turned.y);
  if (speed === 0) return ifZero;
  return {
    x: (turned.x / speed) * BALL_PIXELS_PER_SECOND,
    y: (turned.y / speed) * BALL_PIXELS_PER_SECOND,
  };
}

/**
 * **DS-2.6** — a bat turns the ball by where along it the ball was met. The outer thirds send it
 * away from the middle; the middle third leaves the angle reflection gave it.
 *
 * **This is what makes the game playable at all.** Reflection off an axis-aligned surface only
 * reverses one component, so without a bat to turn it the ball keeps the heading it was launched on
 * for as long as it travels — and one launched along an axis retraces a single line for ever.
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

  return atBallSpeed(turned, velocity);
}

/**
 * **DS-2.8** — a bat's end turns the ball too, by where across the bat's own thickness it was met.
 * Two zones and not three: **DS-2.4** has already reversed the axis along the bat's own length when
 * an end is met, so there is no axis left for a middle zone to leave alone. This turns the *other*
 * axis instead — the one **DS-2.6** turns on the long face — the near half one way and the far half
 * the other.
 *
 * Without this, an end only ever reversed the axis it was met on and left the other exactly as it
 * found it, which is what let a ball meeting only ends, or only the boundary, retrace a line for
 * ever.
 */
export function deflectedByEnd(
  velocity: Vector,
  orientation: 'horizontal' | 'vertical',
  across: number,
): Vector {
  const sideways = across < 0.5 ? -BAT_DEFLECTION_PIXELS_PER_SECOND : BAT_DEFLECTION_PIXELS_PER_SECOND;
  const turned =
    orientation === 'horizontal'
      ? { x: velocity.x, y: velocity.y + sideways }
      : { x: velocity.x + sideways, y: velocity.y };

  return atBallSpeed(turned, velocity);
}

