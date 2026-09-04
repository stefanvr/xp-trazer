import { extentOf, type Extent, type Level } from './level';

/**
 * The domain. Pure functions over plain types, importing no infrastructure — guide-design.md.
 *
 * It never reads a clock. `STEP_SECONDS` is a constant the program controls, which is A-1 in
 * spec-tech.md: the simulation advances by a fixed amount, never by wall-clock time measured
 * between frames. The accumulator that decides *how often* to call `step` lives at the edge, in
 * main.ts, because that is the part that has to know what time it is.
 *
 * **The names here are doc/spec-domain.md's; the behaviour is not yet.** Ball, boundary and
 * collision are that document's words and this module uses them. Everything else it describes — a
 * level of cells, elements, bats and bat groups, holding and launching, a seed, clearing — is
 * absent, and spec-tech.md records what is here as the stack proof's scaffolding rather than a
 * domain decision. **A spec-domain name in this file does not mean the rule behind it is built.**
 */

export const STEP_SECONDS = 1 / 120;
export const NUDGE_PIXELS_PER_SECOND = 240;

export type Vector = { readonly x: number; readonly y: number };

/** What the player is holding down this step. */
export type Input = { readonly left: boolean; readonly right: boolean };

export type Ball = {
  readonly position: Vector;
  readonly velocity: Vector;
  readonly radius: number;
};

/** Everything that changes while a level is played. The level itself does not. */
export type GameState = {
  readonly level: Level;
  readonly ball: Ball;
  readonly collisions: number;
};

/** The level's edge, which its extent decides. */
export function boundaryOf(state: GameState): Extent {
  return extentOf(state.level);
}

/**
 * Starts vertically, so the side boundaries are only ever reached by input. That keeps the surface
 * smoke test deterministic: nothing changes horizontal velocity except an arrow key.
 */
/**
 * No guard that the level is big enough for the ball: `levelFromRows` will not build one smaller
 * than a single cell, and a cell is wider than the ball. The check that used to be here could no
 * longer fail, and a check that cannot fail is a claim rather than evidence.
 */
export function createGameState(level: Level): GameState {
  const radius = 9;
  const { width, height } = extentOf(level);
  return {
    level,
    ball: {
      position: { x: width / 2, y: height / 2 },
      velocity: { x: 0, y: 260 },
      radius,
    },
    collisions: 0,
  };
}

/** Advances one fixed step. The same state and the same input always give the same result. */
export function step(state: GameState, input: Input): GameState {
  const { ball } = state;
  const boundary = boundaryOf(state);
  const nudge = (input.right ? 1 : 0) - (input.left ? 1 : 0);

  let velocityX = ball.velocity.x + nudge * NUDGE_PIXELS_PER_SECOND * STEP_SECONDS;
  let velocityY = ball.velocity.y;
  let x = ball.position.x + velocityX * STEP_SECONDS;
  let y = ball.position.y + velocityY * STEP_SECONDS;
  let collisions = state.collisions;

  const lowX = ball.radius;
  const highX = boundary.width - ball.radius;
  if (x < lowX) {
    x = lowX + (lowX - x);
    velocityX = -velocityX;
    collisions += 1;
  } else if (x > highX) {
    x = highX - (x - highX);
    velocityX = -velocityX;
    collisions += 1;
  }

  const lowY = ball.radius;
  const highY = boundary.height - ball.radius;
  if (y < lowY) {
    y = lowY + (lowY - y);
    velocityY = -velocityY;
    collisions += 1;
  } else if (y > highY) {
    y = highY - (y - highY);
    velocityY = -velocityY;
    collisions += 1;
  }

  return {
    ...state,
    ball: { ...ball, position: { x, y }, velocity: { x: velocityX, y: velocityY } },
    collisions,
  };
}
