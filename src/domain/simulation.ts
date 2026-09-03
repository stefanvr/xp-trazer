/**
 * The domain. Pure functions over plain types, importing nothing — guide-design.md.
 *
 * It never reads a clock. `STEP_SECONDS` is a constant the program controls, which is A-1 in
 * spec-tech.md: the simulation advances by a fixed amount, never by wall-clock time measured
 * between frames. The accumulator that decides *how often* to call `step` lives at the edge, in
 * main.ts, because that is the part that has to know what time it is.
 */

export const STEP_SECONDS = 1 / 120;
export const NUDGE_PIXELS_PER_SECOND = 240;

export type Vector = { readonly x: number; readonly y: number };
export type Box = { readonly width: number; readonly height: number };

/** What the player is holding down this step. The renderer's keyboard is not the domain's problem. */
export type Input = { readonly left: boolean; readonly right: boolean };

export type World = {
  readonly box: Box;
  readonly position: Vector;
  readonly velocity: Vector;
  readonly radius: number;
  readonly bounces: number;
};

/**
 * Starts vertically, so the side walls are only ever reached by input. That keeps the surface smoke
 * test deterministic: nothing changes horizontal velocity except an arrow key.
 */
export function createWorld(box: Box): World {
  const radius = 9;
  if (box.width <= radius * 2 || box.height <= radius * 2) {
    throw new Error(`a ${box.width}x${box.height} box cannot hold a ball of radius ${radius}`);
  }
  return {
    box,
    position: { x: box.width / 2, y: box.height / 2 },
    velocity: { x: 0, y: 260 },
    radius,
    bounces: 0,
  };
}

/** Advances the world one fixed step. Same world and same input always give the same result. */
export function step(world: World, input: Input): World {
  const nudge = (input.right ? 1 : 0) - (input.left ? 1 : 0);

  let velocityX = world.velocity.x + nudge * NUDGE_PIXELS_PER_SECOND * STEP_SECONDS;
  let velocityY = world.velocity.y;
  let x = world.position.x + velocityX * STEP_SECONDS;
  let y = world.position.y + velocityY * STEP_SECONDS;
  let bounces = world.bounces;

  const lowX = world.radius;
  const highX = world.box.width - world.radius;
  if (x < lowX) {
    x = lowX + (lowX - x);
    velocityX = -velocityX;
    bounces += 1;
  } else if (x > highX) {
    x = highX - (x - highX);
    velocityX = -velocityX;
    bounces += 1;
  }

  const lowY = world.radius;
  const highY = world.box.height - world.radius;
  if (y < lowY) {
    y = lowY + (lowY - y);
    velocityY = -velocityY;
    bounces += 1;
  } else if (y > highY) {
    y = highY - (y - highY);
    velocityY = -velocityY;
    bounces += 1;
  }

  return {
    ...world,
    position: { x, y },
    velocity: { x: velocityX, y: velocityY },
    bounces,
  };
}
