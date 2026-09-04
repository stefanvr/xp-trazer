import { describe, expect, it } from 'vitest';
import { createGameState, step, STEP_SECONDS, type GameState, type Input } from './simulation';
import { CELL_PIXELS, levelFromRows } from './level';

const NOTHING_HELD: Input = { left: false, right: false, up: false, down: false };
// 20 x 15 cells of 32 pixels — a 640 x 480 level, the size the earlier tests were written against.
const LEVEL = levelFromRows([...Array.from({ length: 14 }, () => '.'.repeat(20)), `-${'.'.repeat(19)}`]);
// One bat on each axis, both with room to move.
const BOTH_AXES = levelFromRows([`-|${'.'.repeat(18)}`, ...Array.from({ length: 14 }, () => '.'.repeat(20))]);

/** Tests are named as the behaviour claimed, not as the function under test — guide-design.md. */

function stateWith(ball: Partial<GameState['ball']>): GameState {
  const state = createGameState(LEVEL);
  return { ...state, ball: { ...state.ball, ...ball } };
}

describe('a ball meeting the boundary', () => {
  it('comes back with its horizontal direction reversed', () => {
    const state = stateWith({ position: { x: 12, y: 240 }, velocity: { x: -600, y: 0 } });

    const next = step(state, NOTHING_HELD);

    expect(next.ball.velocity.x).toBeGreaterThan(0);
    expect(next.ball.position.x).toBeGreaterThanOrEqual(next.ball.radius);
  });

  it('comes back with its vertical direction reversed', () => {
    const state = stateWith({ position: { x: 320, y: 12 }, velocity: { x: 0, y: -600 } });

    const next = step(state, NOTHING_HELD);

    expect(next.ball.velocity.y).toBeGreaterThan(0);
    expect(next.ball.position.y).toBeGreaterThanOrEqual(next.ball.radius);
  });

  it('counts one collision per boundary it meets', () => {
    const state = stateWith({ position: { x: 12, y: 240 }, velocity: { x: -600, y: 0 } });

    expect(step(state, NOTHING_HELD).collisions).toBe(1);
  });

  it('stays inside the boundary however fast it arrives', () => {
    const state = stateWith({ position: { x: 20, y: 20 }, velocity: { x: -9000, y: -9000 } });

    const next = step(state, NOTHING_HELD);

    expect(next.ball.position.x).toBeGreaterThanOrEqual(next.ball.radius);
    expect(next.ball.position.y).toBeGreaterThanOrEqual(next.ball.radius);
  });
});

describe('a ball crossing open space', () => {
  it('keeps its velocity and counts no collision', () => {
    const state = stateWith({ position: { x: 320, y: 240 }, velocity: { x: 100, y: 200 } });

    const next = step(state, NOTHING_HELD);

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
    const state = createGameState(BOTH_AXES);

    expect(horizontal(step(state, { ...NOTHING_HELD, right: true }))).toBeGreaterThan(
      horizontal(state),
    );
  });

  it('moves the vertical group downwards while down is held', () => {
    const state = createGameState(BOTH_AXES);

    expect(vertical(step(state, { ...NOTHING_HELD, down: true }))).toBeGreaterThan(vertical(state));
  });

  it('drives both groups at once, because both are live', () => {
    const state = createGameState(BOTH_AXES);

    const next = step(state, { ...NOTHING_HELD, right: true, down: true });

    expect(horizontal(next)).toBeGreaterThan(horizontal(state));
    expect(vertical(next)).toBeGreaterThan(vertical(state));
  });

  it('leaves a group alone when both of its directions are held', () => {
    const state = createGameState(BOTH_AXES);

    expect(horizontal(step(state, { ...NOTHING_HELD, left: true, right: true }))).toBe(
      horizontal(state),
    );
  });

  it('moves bats whether the ball is travelling or not, which is DS-3.4', () => {
    const still = { ...createGameState(BOTH_AXES) };
    const stopped = { ...still, ball: { ...still.ball, velocity: { x: 0, y: 0 } } };

    expect(horizontal(step(stopped, { ...NOTHING_HELD, right: true }))).toBeGreaterThan(
      horizontal(stopped),
    );
  });
});

describe('the step itself', () => {
  it('gives the same result every time for the same state and input', () => {
    const state = stateWith({ position: { x: 100, y: 100 }, velocity: { x: 37, y: -91 } });

    expect(step(state, NOTHING_HELD)).toEqual(step(state, NOTHING_HELD));
  });

  it('does not mutate the state it was given', () => {
    const state = stateWith({ position: { x: 100, y: 100 }, velocity: { x: 37, y: -91 } });
    const before = structuredClone(state);

    step(state, { ...NOTHING_HELD, right: true });

    expect(state).toEqual(before);
  });

  it('advances by a fixed amount, never by elapsed time', () => {
    const state = stateWith({ position: { x: 320, y: 240 }, velocity: { x: 120, y: 0 } });

    const twice = step(step(state, NOTHING_HELD), NOTHING_HELD);

    expect(twice.ball.position.x).toBeCloseTo(320 + 2 * 120 * STEP_SECONDS);
  });
});

describe('the smallest level that can hold a bat', () => {
  it('holds the ball too, so no guard for that is needed', () => {
    const state = createGameState(levelFromRows(['-..']));

    expect(state.ball.radius * 2).toBeLessThan(CELL_PIXELS);
  });

  it('refuses a level whose bat has less room than its own length', () => {
    expect(() => createGameState(levelFromRows(['-.']))).toThrow(/less room than its own length/);
  });
});
