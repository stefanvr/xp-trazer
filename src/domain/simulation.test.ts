import { describe, expect, it } from 'vitest';
import {
  createGameState,
  isCleared,
  isHeld,
  step,
  STEP_SECONDS,
  type GameState,
  type Input,
} from './simulation';
import { CELL_PIXELS, levelFromRows } from './level';
import { obstacleAt } from './collision';

const NOTHING_HELD: Input = { left: false, right: false, up: false, down: false, launch: false };

/**
 * Most of these tests ask what state a step left, not what it announced. **DS-6.1** makes a step
 * yield both, so this takes the half they are about. The tests about events call `step` itself.
 */
const advance = (state: GameState, input: Input): GameState => step(state, input).state;

/**
 * A far corner of every test level holds one destructible brick, out of reach of anything these
 * tests do. Without it the level is cleared before it starts — DS-5.1 is satisfied by a level with
 * nothing to destroy — and DS-5.2 then stops the step these tests are about.
 */
const IN_THE_CORNER = (columns: number, rows: number) =>
  Array.from({ length: rows }, (_, row) =>
    row === rows - 2 ? `${'.'.repeat(columns - 2)}d.` : '.'.repeat(columns),
  );

// 20 x 15 cells of 32 pixels — a 640 x 480 level, the size the earlier tests were written against.
const LEVEL = levelFromRows([`-${'.'.repeat(19)}`, ...IN_THE_CORNER(20, 14)]);
// One bat on each axis, both with room to move.
const BOTH_AXES = levelFromRows([
  `-${'.'.repeat(19)}`,
  `|${'.'.repeat(19)}`,
  ...IN_THE_CORNER(20, 13),
]);

/** Tests are named as the behaviour claimed, not as the function under test — guide-design.md. */

/** A travelling ball unless a test says otherwise — most of these predate holding. */
function stateWith(ball: Partial<GameState['ball']>): GameState {
  const state = createGameState(LEVEL, 0);
  return { ...state, ball: { ...state.ball, heldBy: undefined, ...ball } };
}

describe('a ball meeting the boundary', () => {
  it('comes back with its horizontal direction reversed', () => {
    const state = stateWith({ position: { x: 12, y: 240 }, velocity: { x: -600, y: 0 } });

    const next = advance(state, NOTHING_HELD);

    expect(next.ball.velocity.x).toBeGreaterThan(0);
    expect(next.ball.position.x).toBeGreaterThanOrEqual(next.ball.radius);
  });

  it('comes back with its vertical direction reversed', () => {
    const state = stateWith({ position: { x: 320, y: 12 }, velocity: { x: 0, y: -600 } });

    const next = advance(state, NOTHING_HELD);

    expect(next.ball.velocity.y).toBeGreaterThan(0);
    expect(next.ball.position.y).toBeGreaterThanOrEqual(next.ball.radius);
  });

  it('counts one collision per boundary it meets', () => {
    const state = stateWith({ position: { x: 12, y: 240 }, velocity: { x: -600, y: 0 } });

    expect(advance(state, NOTHING_HELD).collisions).toBe(1);
  });

  // The far corner, because the near one is inside the bat this level puts on row 0 — a ball that
  // starts inside something is not the thing this claims.
  it('stays inside the boundary however fast it arrives', () => {
    const state = stateWith({ position: { x: 20, y: 460 }, velocity: { x: -9000, y: 9000 } });

    const next = advance(state, NOTHING_HELD);

    expect(next.ball.position.x).toBeGreaterThanOrEqual(next.ball.radius);
    expect(next.ball.position.y).toBeLessThanOrEqual(480 - next.ball.radius);
  });

  it('turns at the surface it met, not where the step happened to leave it', () => {
    // Closer to the boundary than one step of travel, so the offered move overshoots it.
    const state = stateWith({ position: { x: 10.5, y: 240 }, velocity: { x: -260, y: 0 } });

    const next = advance(state, NOTHING_HELD);

    expect(next.ball.position.x).toBeCloseTo(next.ball.radius, 1);
  });
});

describe('a ball crossing open space', () => {
  it('keeps its velocity and counts no collision', () => {
    const state = stateWith({ position: { x: 320, y: 240 }, velocity: { x: 100, y: 200 } });

    const next = advance(state, NOTHING_HELD);

    expect(next.ball.velocity).toEqual({ x: 100, y: 200 });
    expect(next.collisions).toBe(0);
    expect(next.ball.position.x).toBeCloseTo(320 + 100 * STEP_SECONDS);
  });
});

describe('a step with a direction held', () => {
  const horizontal = (state: GameState) =>
    state.bats.find((bat) => bat.orientation === 'horizontal')?.position ?? 0;
  const vertical = (state: GameState) =>
    state.bats.find((bat) => bat.orientation === 'vertical')?.position ?? 0;

  it('moves the horizontal group rightwards while right is held', () => {
    const state = createGameState(BOTH_AXES, 0);

    expect(horizontal(advance(state, { ...NOTHING_HELD, right: true }))).toBeGreaterThan(
      horizontal(state),
    );
  });

  it('moves the vertical group downwards while down is held', () => {
    const state = createGameState(BOTH_AXES, 0);

    expect(vertical(advance(state, { ...NOTHING_HELD, down: true }))).toBeGreaterThan(vertical(state));
  });

  it('drives both groups at once, because both are live', () => {
    const state = createGameState(BOTH_AXES, 0);

    const next = advance(state, { ...NOTHING_HELD, right: true, down: true });

    expect(horizontal(next)).toBeGreaterThan(horizontal(state));
    expect(vertical(next)).toBeGreaterThan(vertical(state));
  });

  it('leaves a group alone when both of its directions are held', () => {
    const state = createGameState(BOTH_AXES, 0);

    expect(horizontal(advance(state, { ...NOTHING_HELD, left: true, right: true }))).toBe(
      horizontal(state),
    );
  });

  it('moves bats whether the ball is travelling or not, which is DS-3.4', () => {
    const still = { ...createGameState(BOTH_AXES, 0) };
    const stopped = { ...still, ball: { ...still.ball, velocity: { x: 0, y: 0 } } };

    expect(horizontal(advance(stopped, { ...NOTHING_HELD, right: true }))).toBeGreaterThan(
      horizontal(stopped),
    );
  });
});

describe('a bat moving into a travelling ball', () => {
  /** Nothing the ball is inside — DS-2.7, asked of the state the step returned. */
  const insideSomething = (state: GameState) =>
    obstacleAt(
      state.level,
      state.destroyed,
      state.bats,
      state.ball.position.x,
      state.ball.position.y,
      state.ball.radius,
    );

  // Beside the far end of the bat this level puts on row 0, in its row, one step of the bat's
  // travel away — the ball is where the bat is about to be.
  const beside = () => stateWith({ position: { x: 106, y: 16 }, velocity: { x: -260, y: 0 } });

  it('puts the ball outside itself rather than closing over it', () => {
    const next = advance(beside(), { ...NOTHING_HELD, right: true });

    expect(insideSomething(next)).toBeUndefined();
  });

  it('sends the ball away from the side it left on', () => {
    const next = advance(beside(), { ...NOTHING_HELD, right: true });

    expect(next.ball.velocity.x).toBeGreaterThan(0);
  });

  it('counts it as the collision it is', () => {
    expect(advance(beside(), { ...NOTHING_HELD, right: true }).collisions).toBe(1);
  });

  it('never traps the ball, however long it keeps coming', () => {
    // The bat is faster than the ball, so it catches it again and again, and drives it the length
    // of the level into the corner. That is the case that trapped it: no room on the near side.
    let state = beside();
    for (let taken = 0; taken < 600; taken += 1) {
      state = advance(state, { ...NOTHING_HELD, right: true });
      expect(insideSomething(state)).toBeUndefined();
    }
  });
});

describe('clearing a level', () => {
  // One destructible brick at column 2 of row 2, one permanent one at column 4, and a bat with
  // room to move so that a step that changed anything would show.
  const level = levelFromRows(['-.....', '......', '..d.p.', '......', '......', '......']);
  const brick = 2 * 6 + 2;

  const withDestroyed = (destroyed: readonly number[]): GameState => {
    const state = createGameState(level, 0);
    return { ...state, destroyed: new Set(destroyed), ball: { ...state.ball, heldBy: undefined } };
  };

  it('is not cleared while a destructible brick still stands', () => {
    expect(isCleared(withDestroyed([]))).toBe(false);
  });

  it('is cleared when the last destructible brick has been destroyed', () => {
    expect(isCleared(withDestroyed([brick]))).toBe(true);
  });

  it('counts no permanent brick towards it, which is DS-4.3', () => {
    // The permanent brick is still standing, and the level is cleared regardless.
    expect(withDestroyed([brick]).level.cells[2 * 6 + 4]?.kind).toBe('permanent');
    expect(isCleared(withDestroyed([brick]))).toBe(true);
  });

  it('does not advance once cleared, whatever the player holds down', () => {
    const cleared = {
      ...withDestroyed([brick]),
      ball: { ...withDestroyed([brick]).ball, velocity: { x: 240, y: 120 } },
    };

    expect(advance(cleared, { ...NOTHING_HELD, right: true, down: true, launch: true })).toBe(cleared);
  });

  it('becomes cleared on the step that destroys the last brick', () => {
    const last = {
      ...withDestroyed([]),
      ball: { ...withDestroyed([]).ball, position: { x: 54, y: 80 }, velocity: { x: 240, y: 0 } },
    };

    const next = advance(last, NOTHING_HELD);

    expect(isCleared(next)).toBe(true);
    // The collision still happened in full — DS-2.4 turns the ball away from what it destroyed.
    expect(next.ball.velocity.x).toBeLessThan(0);
  });
});

describe('the step itself', () => {
  it('gives the same result every time for the same state and input', () => {
    const state = stateWith({ position: { x: 100, y: 100 }, velocity: { x: 37, y: -91 } });

    expect(advance(state, NOTHING_HELD)).toEqual(advance(state, NOTHING_HELD));
  });

  it('does not mutate the state it was given', () => {
    const state = stateWith({ position: { x: 100, y: 100 }, velocity: { x: 37, y: -91 } });
    const before = structuredClone(state);

    advance(state, { ...NOTHING_HELD, right: true });

    expect(state).toEqual(before);
  });

  it('advances by a fixed amount, never by elapsed time', () => {
    const state = stateWith({ position: { x: 320, y: 240 }, velocity: { x: 120, y: 0 } });

    const twice = advance(advance(state, NOTHING_HELD), NOTHING_HELD);

    expect(twice.ball.position.x).toBeCloseTo(320 + 2 * 120 * STEP_SECONDS);
  });
});

describe('the smallest level that can hold a bat', () => {
  // Two rows, because DS-1.6 wants one side of the bat open and a single row is blocked on both.
  it('holds the ball too, so no guard for that is needed', () => {
    const state = createGameState(levelFromRows(['-..', '..d']), 0);

    expect(state.ball.radius * 2).toBeLessThan(CELL_PIXELS);
  });

  // Each of these levels carries a destructible brick it does not otherwise need, so that the
  // refusal under test is the only one available and the message proves which rule spoke.
  it('refuses a level whose bat has less room than its own length', () => {
    expect(() => createGameState(levelFromRows(['-.', '.d']), 0)).toThrow(
      /less room than its own length/,
    );
  });

  it('refuses a level whose bat has nothing to rest against, which DS-1.6 forbids', () => {
    expect(() => createGameState(levelFromRows(['...', '-..', '..d']), 0)).toThrow(
      /nothing on either side/,
    );
  });

  it('refuses a level that authors one bat inside another, which DS-1.7 forbids', () => {
    // The vertical bat runs down column 1 from row 0, through the horizontal bat lying on row 0.
    expect(() => createGameState(levelFromRows(['-|..', '....', '...d']), 0)).toThrow(
      /authored inside/,
    );
  });

  it('refuses a level with nothing to destroy, which DS-1.8 forbids', () => {
    expect(() => createGameState(levelFromRows(['-..', '...']), 0)).toThrow(
      /no destructible element/,
    );
  });
});

describe('a ball that has not been launched', () => {
  const level = levelFromRows(['-...........', ...IN_THE_CORNER(12, 9)]);

  it('starts held by one of the level\'s bats', () => {
    expect(isHeld(createGameState(level, 0))).toBe(true);
  });

  it('moves with the bat holding it, rather than under its own power', () => {
    const state = createGameState(level, 0);

    const next = advance(state, { ...NOTHING_HELD, right: true });

    expect(next.ball.position.x).toBeGreaterThan(state.ball.position.x);
    expect(isHeld(next)).toBe(true);
  });

  it('goes nowhere at all while nothing is held down', () => {
    const state = createGameState(level, 0);

    expect(advance(state, NOTHING_HELD).ball.position).toEqual(state.ball.position);
  });

  it('is travelling once launched, and no longer held', () => {
    const state = createGameState(level, 0);

    const next = advance(state, { ...NOTHING_HELD, launch: true });

    expect(isHeld(next)).toBe(false);
    expect(Math.hypot(next.ball.velocity.x, next.ball.velocity.y)).toBeGreaterThan(0);
  });

  it('keeps travelling after the launch key is let go', () => {
    const launched = advance(createGameState(level, 0), { ...NOTHING_HELD, launch: true });

    const later = advance(launched, NOTHING_HELD);

    expect(isHeld(later)).toBe(false);
    expect(later.ball.position.y).not.toBe(launched.ball.position.y);
  });

  it('starts the same way every time for the same seed', () => {
    expect(createGameState(level, 4242)).toEqual(createGameState(level, 4242));
  });
});

describe('a travelling ball meeting something', () => {
  // A destructible brick at column 2 and a permanent one at column 4, both on row 2 — and a second
  // destructible one in the corner, so that destroying the first does not clear the level and stop
  // the very step these tests are about.
  const level = levelFromRows(['-.....', '......', '..d.p.', '......', '.....d', '......']);

  /** Travelling, at a place and speed the test chooses. */
  const travelling = (position: { x: number; y: number }, velocity: { x: number; y: number }) => {
    const state = createGameState(level, 0);
    return { ...state, ball: { ...state.ball, position, velocity, heldBy: undefined } };
  };

  it('destroys a destructible brick and turns away from it', () => {
    const next = advance(travelling({ x: 54, y: 80 }, { x: 240, y: 0 }), NOTHING_HELD);

    expect(next.destroyed.size).toBe(1);
    expect(next.ball.velocity.x).toBeLessThan(0);
    expect(next.collisions).toBe(1);
  });

  it('turns away from a permanent brick and destroys nothing, which is DS-4.3', () => {
    const next = advance(travelling({ x: 118, y: 80 }, { x: 240, y: 0 }), NOTHING_HELD);

    expect(next.destroyed.size).toBe(0);
    expect(next.ball.velocity.x).toBeLessThan(0);
    expect(next.collisions).toBe(1);
  });

  it('turns away from a bat', () => {
    const next = advance(travelling({ x: 40, y: 42 }, { x: 0, y: -240 }), NOTHING_HELD);

    expect(next.ball.velocity.y).toBeGreaterThan(0);
    expect(next.collisions).toBe(1);
  });

  it('leaves a bat on a heading it did not arrive on, which is what makes it playable', () => {
    // Straight up into the bat's near third. Without DS-2.6 it would come straight back down and
    // retrace the same line for ever, and no amount of playing could change that.
    const next = advance(travelling({ x: 8, y: 42 }, { x: 0, y: -240 }), NOTHING_HELD);

    expect(next.ball.velocity.x).not.toBe(0);
    expect(next.ball.velocity.y).not.toBe(0);
  });

  it('comes straight back off the middle of a bat', () => {
    const next = advance(travelling({ x: 48, y: 42 }, { x: 0, y: -240 }), NOTHING_HELD);

    expect(next.ball.velocity.x).toBe(0);
  });

  it('reverses only the component that met the surface, which is the law of reflection here', () => {
    const next = advance(travelling({ x: 54, y: 80 }, { x: 240, y: 120 }), NOTHING_HELD);

    expect(next.ball.velocity.x).toBe(-240);
    expect(next.ball.velocity.y).toBe(120);
  });

  it('does not destroy the same brick twice', () => {
    const first = advance(travelling({ x: 54, y: 80 }, { x: 240, y: 0 }), NOTHING_HELD);
    const again = advance({ ...first, ball: { ...first.ball, velocity: { x: 240, y: 0 } } }, NOTHING_HELD);

    expect(again.destroyed.size).toBe(1);
  });

  it('meets a bat at its face, not short of it', () => {
    // The bat this level puts on row 0 ends at y = 32, so the ball's face meets it at y = 41.
    const next = advance(travelling({ x: 40, y: 42.5 }, { x: 0, y: -260 }), NOTHING_HELD);

    expect(next.ball.position.y).toBeCloseTo(41, 1);
  });

  it('passes through where a brick used to be', () => {
    const destroyed = advance(travelling({ x: 54, y: 80 }, { x: 240, y: 0 }), NOTHING_HELD).destroyed;
    const returning = {
      ...travelling({ x: 54, y: 80 }, { x: 240, y: 0 }),
      destroyed,
    };

    expect(advance(returning, NOTHING_HELD).ball.position.x).toBeGreaterThan(54);
  });
});

describe('what a step announces', () => {
  // The same shape the collision tests use: a destructible brick at column 2 of row 2, a permanent
  // one at column 4, and a second destructible one in the corner so destroying the first does not
  // clear the level and stop the step under test.
  const level = levelFromRows(['-.....', '......', '..d.p.', '......', '.....d', '......']);

  const travelling = (position: { x: number; y: number }, velocity: { x: number; y: number }) => {
    const state = createGameState(level, 0);
    return { ...state, ball: { ...state.ball, position, velocity, heldBy: undefined } };
  };

  it('says nothing when nothing happened', () => {
    // Crossing open space, meeting none of the three things a collision can be with.
    expect(step(travelling({ x: 48, y: 176 }, { x: 60, y: 0 }), NOTHING_HELD).events).toEqual([]);
  });

  it('names the boundary when the ball meets it', () => {
    const { events } = step(travelling({ x: 12, y: 176 }, { x: -600, y: 0 }), NOTHING_HELD);

    expect(events).toEqual([{ kind: 'collision', met: 'boundary', destroyed: false }]);
  });

  it('names a bat when the ball meets one', () => {
    const { events } = step(travelling({ x: 40, y: 42 }, { x: 0, y: -240 }), NOTHING_HELD);

    expect(events).toEqual([{ kind: 'collision', met: 'bat', destroyed: false }]);
  });

  it('names a brick and destroys nothing where the brick is permanent, which is DS-4.3', () => {
    const { events } = step(travelling({ x: 118, y: 80 }, { x: 240, y: 0 }), NOTHING_HELD);

    expect(events).toEqual([{ kind: 'collision', met: 'brick', destroyed: false }]);
  });

  it('announces both the collision and the destruction when a brick goes, which is DS-6.6', () => {
    const { events } = step(travelling({ x: 54, y: 80 }, { x: 240, y: 0 }), NOTHING_HELD);

    expect(events).toEqual([
      { kind: 'collision', met: 'brick', destroyed: true },
      { kind: 'element-destroyed', cell: { column: 2, row: 2 } },
    ]);
  });

  it('puts the collision before the destruction it caused', () => {
    const { events } = step(travelling({ x: 54, y: 80 }, { x: 240, y: 0 }), NOTHING_HELD);

    expect(events.map((event) => event.kind)).toEqual(['collision', 'element-destroyed']);
  });

  it('announces a collision for a bat that moved into the ball, which is DS-2.7', () => {
    // The ball is where the bat is about to be: it did not move into the bat, the bat moved into it,
    // and spec-domain says that is the same collision.
    const beside = stateWith({ position: { x: 106, y: 16 }, velocity: { x: -260, y: 0 } });

    const { events } = step(beside, { ...NOTHING_HELD, right: true });

    expect(events).toEqual([{ kind: 'collision', met: 'bat', destroyed: false }]);
  });

  it('says nothing once the level is cleared, because nothing advances', () => {
    const onlyBrick = levelFromRows(['-....', '..d..', '.....', '.....', '.....']);
    const state = createGameState(onlyBrick, 0);
    const cleared = { ...state, destroyed: new Set([1 * 5 + 2]) };

    expect(step(cleared, { ...NOTHING_HELD, right: true, launch: true }).events).toEqual([]);
  });

  it('says nothing while the ball is still held', () => {
    expect(step(createGameState(level, 0), NOTHING_HELD).events).toEqual([]);
  });

  it('counts the same collisions it announces', () => {
    const before = travelling({ x: 54, y: 80 }, { x: 240, y: 0 });

    const { state: after, events } = step(before, NOTHING_HELD);

    const announced = events.filter((event) => event.kind === 'collision').length;
    expect(after.collisions - before.collisions).toBe(announced);
  });
});
