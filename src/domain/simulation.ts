import { awayFrom, batHoldingTheBall, deflectedByBat, launchVelocity, restingOn } from './ball';
import { BAT_PIXELS_PER_SECOND, moveGroup, spanFor } from './bat';
import { batRect, meets, obstacleAt, overlaps } from './collision';
import {
  BAT_LENGTH_PIXELS,
  destructibleCount,
  destructibleRemaining,
  extentOf,
  type Bat,
  type Extent,
  type Level,
} from './level';

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

/**
 * How finely the contact point is found — **DS-2.7**, the ball turns at the surface it met. Halving
 * the offered move ten times puts it within a five-hundredth of a pixel of the surface, which is
 * two orders below anything a screen can show.
 *
 * Halving rather than solving, because it asks the same question `obstacleAt` already answers and so
 * works the same for a boundary, a bat and a brick. A solve would need each surface's geometry a
 * second time, in a second place, able to disagree with the first.
 */
const CONTACT_HALVINGS = 10;

/**
 * A hair beyond touching. A ball exactly on a surface is clear of it, but floating point cannot be
 * relied on to land exactly there, and a ball a millionth of a pixel inside a bat is a ball that
 * cannot move. Used only where a position is computed rather than approached.
 */
const CLEARANCE_PIXELS = 1 / 64;

export type Vector = { readonly x: number; readonly y: number };

/**
 * What the player is holding down this step. spec-app: left and right move the horizontal bat
 * group, up and down the vertical one, and both are live at once.
 */
export type Input = {
  readonly left: boolean;
  readonly right: boolean;
  readonly up: boolean;
  readonly down: boolean;
  /** Space — spec-app. */
  readonly launch: boolean;
};

export type Ball = {
  readonly position: Vector;
  readonly velocity: Vector;
  readonly radius: number;
  /**
   * The bat holding it, or undefined once launched. DS-1.5's first two states: the ball is held,
   * or the ball is travelling.
   */
  readonly heldBy: number | undefined;
};

/** Everything that changes while a level is played. The level itself does not. */
export type GameState = {
  readonly level: Level;
  readonly bats: readonly Bat[];
  readonly ball: Ball;
  readonly collisions: number;
  /**
   * Which destructible elements have gone. The level itself never changes while a game runs —
   * doc/spec-domain.md puts it among the things that do not — so what is left is held beside it.
   */
  readonly destroyed: ReadonlySet<number>;
};

/** DS-1.5 — the ball is held, or it is travelling. */
export function isHeld(state: GameState): boolean {
  return state.ball.heldBy !== undefined;
}

/**
 * **DS-5.1** — a level is cleared when every destructible element has been destroyed. Permanent
 * ones are not counted, which is **DS-4.3**: clearing ignores them.
 *
 * Asked of what is destroyed rather than stored beside it, the same way `isHeld` is asked of the
 * ball. spec-domain lists both among what a game holds, and a state that holds the answer as well
 * as the facts it follows from can hold a wrong one.
 */
export function isCleared(state: GameState): boolean {
  return destructibleRemaining(state.level, state.destroyed) === 0;
}

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
export function createGameState(level: Level, seed: number): GameState {
  const radius = 9;
  /**
   * DS-1.7 — bats block each other, so two authored in the same place is a position no move could
   * have reached and none can undo. Asked before anything else, because a bat overlapping another
   * also has no room to slide, and *that* is the answer a reader would be misled by.
   */
  for (const [index, bat] of level.bats.entries()) {
    for (const other of level.bats.slice(index + 1)) {
      if (!meets(batRect(bat), batRect(other))) continue;
      throw new Error(
        `a ${bat.orientation} bat on line ${bat.line} is authored inside a ${other.orientation} bat on line ${other.line}`,
      );
    }
  }

  for (const bat of level.bats) {
    // DS-1.6 — throws where a bat has nothing, or something on both sides, to rest against.
    awayFrom(level, bat);

    // DS-1.7 — a bat that cannot slide its own length is authored into a place play cannot use.
    const span = spanFor(level, level.bats, bat);
    if (span.high < span.low) {
      throw new Error(
        `a ${bat.orientation} bat on line ${bat.line} has less room than its own length`,
      );
    }
  }

  /**
   * DS-1.8 — asked last, because whether a level can be played at all is the more fundamental
   * answer than whether playing it can finish, and a reader met by the second question first would
   * fix the wrong thing.
   */
  if (destructibleCount(level) === 0) {
    throw new Error('a level authors no destructible element, so it is cleared before it is played');
  }

  // DS-1.4 — a level starts with the ball held by one of its bats, drawn from the seed.
  const heldBy = batHoldingTheBall(level, seed);
  const bat = level.bats[heldBy]!;

  return {
    level,
    bats: level.bats,
    ball: {
      position: restingOn(level, bat, radius),
      velocity: { x: 0, y: 0 },
      radius,
      heldBy,
    },
    collisions: 0,
    destroyed: new Set(),
  };
}

/**
 * **DS-2.7** — a bat that has moved into the ball puts the ball outside itself.
 *
 * Bats move before the ball does, so a bat can close over a ball that was clear of it a moment
 * earlier. Left there, the ball is inside: every move it is then offered is blocked, so it reverses
 * without going anywhere, again and every step after — trapped in the bat rather than bounced off
 * it, which is what a player sees.
 *
 * **A bat moves along its own axis (DS-3.2), so it can only ever meet the ball end-on**, and the way
 * out is along that same axis. The ball leaves by the end it is nearer to, travelling away from the
 * bat; **DS-2.6** then turns it exactly as it turns a ball that arrived under its own power, and at
 * an end that is the outer third, which sends it away from the bat rather than back along it.
 *
 * The far end is tried where the near one is occupied — a bat driving the ball into the corner has
 * nowhere to put it on the side it is going. Where neither end is free there is no place outside to
 * put the ball, and it stays where it is; nothing else is true.
 */
function pushedOutOfBats(
  level: Level,
  destroyed: ReadonlySet<number>,
  bats: readonly Bat[],
  ball: Ball,
): { readonly position: Vector; readonly velocity: Vector } | undefined {
  for (const bat of bats) {
    const rect = batRect(bat);
    if (!overlaps(rect, ball.position.x, ball.position.y, ball.radius)) continue;

    const horizontal = bat.orientation === 'horizontal';
    const across = horizontal ? ball.position.y : ball.position.x;
    const along = horizontal ? ball.position.x : ball.position.y;
    const low = (horizontal ? rect.x : rect.y) - ball.radius - CLEARANCE_PIXELS;
    const high =
      (horizontal ? rect.x + rect.w : rect.y + rect.h) + ball.radius + CLEARANCE_PIXELS;

    const nearest = along < (low + high) / 2 ? [low, high] : [high, low];
    for (const escaped of nearest) {
      const position = horizontal ? { x: escaped, y: across } : { x: across, y: escaped };
      if (obstacleAt(level, destroyed, bats, position.x, position.y, ball.radius)) continue;

      // Away from the bat, at the speed it arrived with — DS-2.5, a collision never changes that.
      const leaving = escaped === low ? -1 : 1;
      const departing = horizontal
        ? { x: leaving * Math.abs(ball.velocity.x), y: ball.velocity.y }
        : { x: ball.velocity.x, y: leaving * Math.abs(ball.velocity.y) };
      const met = Math.min(Math.max((escaped - bat.position) / BAT_LENGTH_PIXELS, 0), 1);

      return { position, velocity: deflectedByBat(departing, bat.orientation, met) };
    }
  }

  return undefined;
}

/** Advances one fixed step. The same state and the same input always give the same result. */
export function step(state: GameState, input: Input): GameState {
  const { ball, level } = state;

  /**
   * DS-5.2 — a cleared level does not advance. Asked before anything else, because *nothing*
   * advances: DS-3.4 moves bats while the ball is held or travelling, and cleared is neither.
   */
  if (isCleared(state)) return state;

  // DS-3.4: bats move whether the ball is held or travelling, so this happens every step.
  const reach = BAT_PIXELS_PER_SECOND * STEP_SECONDS;
  let bats = moveGroup(level, state.bats, 'horizontal', ((input.right ? 1 : 0) - (input.left ? 1 : 0)) * reach);
  bats = moveGroup(level, bats, 'vertical', ((input.down ? 1 : 0) - (input.up ? 1 : 0)) * reach);

  // DS-2.1 — a held ball rests on its bat and moves with it, so it has no motion of its own.
  if (ball.heldBy !== undefined) {
    const bat = bats[ball.heldBy]!;
    const resting = restingOn(level, bat, ball.radius);

    if (!input.launch) {
      return { ...state, bats, ball: { ...ball, position: resting } };
    }

    // DS-2.2 — launching sets it travelling, perpendicular to the bat and away from it.
    return {
      ...state,
      bats,
      ball: { ...ball, position: resting, velocity: launchVelocity(level, bat), heldBy: undefined },
    };
  }

  // DS-2.7 — a bat that moved into the ball puts it out, before the ball is asked to move at all.
  const escape = pushedOutOfBats(level, state.destroyed, bats, ball);
  const from = escape?.position ?? ball.position;
  const going = escape?.velocity ?? ball.velocity;

  let velocityX = going.x;
  let velocityY = going.y;
  let x = from.x;
  let y = from.y;
  let collisions = state.collisions + (escape === undefined ? 0 : 1);
  let destroyed = state.destroyed;

  /**
   * One axis at a time, because every surface is a cell face — **DS-2.4**. Meeting something on the
   * way reverses that component and leaves the other, which is the law of reflection where the only
   * normals are along the axes.
   *
   * **DS-2.7** — where the move is blocked the ball goes as far of it as it can and turns there, so
   * it turns at the surface rather than wherever the step happened to leave it. The largest part of
   * the move that stays clear is found by halving, since the ball starts the step outside everything
   * and the offered end of the move is inside something.
   */
  const advance = (dx: number, dy: number, reverse: () => void): void => {
    const asFarAs = (part: number) =>
      obstacleAt(level, destroyed, bats, x + dx * part, y + dy * part, ball.radius);

    const hit = asFarAs(1);
    if (hit === undefined) {
      x += dx;
      y += dy;
      return;
    }

    let clear = 0;
    let blocked = 1;
    for (let halving = 0; halving < CONTACT_HALVINGS; halving += 1) {
      const between = (clear + blocked) / 2;
      if (asFarAs(between) === undefined) clear = between;
      else blocked = between;
    }
    x += dx * clear;
    y += dy * clear;

    reverse();
    collisions += 1;

    // DS-2.6 — a bat also turns the ball, by where along it the ball arrived.
    if (hit.kind === 'bat') {
      const turned = deflectedByBat({ x: velocityX, y: velocityY }, hit.orientation, hit.along);
      velocityX = turned.x;
      velocityY = turned.y;
    }

    // DS-4.2 — a destructible brick is destroyed by a collision. DS-4.3 leaves a permanent one.
    if (hit.kind === 'element' && hit.destructible) {
      const gone = new Set(destroyed);
      gone.add(hit.index);
      destroyed = gone;
    }
  };

  advance(velocityX * STEP_SECONDS, 0, () => {
    velocityX = -velocityX;
  });
  advance(0, velocityY * STEP_SECONDS, () => {
    velocityY = -velocityY;
  });

  return {
    ...state,
    bats,
    ball: { ...ball, position: { x, y }, velocity: { x: velocityX, y: velocityY } },
    collisions,
    destroyed,
  };
}
