import { describe, expect, it } from 'vitest';
import { createWorld, step, STEP_SECONDS, type Input, type World } from './simulation';

const NOTHING_HELD: Input = { left: false, right: false };
const BOX = { width: 640, height: 480 };

/** Tests are named as the behaviour claimed, not as the function under test — guide-design.md. */

function worldAt(overrides: Partial<World>): World {
  return { ...createWorld(BOX), ...overrides };
}

describe('a ball meeting a wall', () => {
  it('comes back with its horizontal direction reversed', () => {
    const world = worldAt({ position: { x: 12, y: 240 }, velocity: { x: -600, y: 0 } });

    const next = step(world, NOTHING_HELD);

    expect(next.velocity.x).toBeGreaterThan(0);
    expect(next.position.x).toBeGreaterThanOrEqual(next.radius);
  });

  it('comes back with its vertical direction reversed', () => {
    const world = worldAt({ position: { x: 320, y: 12 }, velocity: { x: 0, y: -600 } });

    const next = step(world, NOTHING_HELD);

    expect(next.velocity.y).toBeGreaterThan(0);
    expect(next.position.y).toBeGreaterThanOrEqual(next.radius);
  });

  it('counts one bounce per wall it meets', () => {
    const world = worldAt({ position: { x: 12, y: 240 }, velocity: { x: -600, y: 0 } });

    expect(step(world, NOTHING_HELD).bounces).toBe(1);
  });

  it('stays inside the box however fast it arrives', () => {
    const world = worldAt({ position: { x: 20, y: 20 }, velocity: { x: -9000, y: -9000 } });

    const next = step(world, NOTHING_HELD);

    expect(next.position.x).toBeGreaterThanOrEqual(next.radius);
    expect(next.position.y).toBeGreaterThanOrEqual(next.radius);
  });
});

describe('a ball crossing open space', () => {
  it('keeps its velocity and counts no bounce', () => {
    const world = worldAt({ position: { x: 320, y: 240 }, velocity: { x: 100, y: 200 } });

    const next = step(world, NOTHING_HELD);

    expect(next.velocity).toEqual({ x: 100, y: 200 });
    expect(next.bounces).toBe(0);
    expect(next.position.x).toBeCloseTo(320 + 100 * STEP_SECONDS);
  });
});

describe('input', () => {
  it('speeds the ball rightwards while right is held', () => {
    const world = worldAt({ position: { x: 320, y: 240 }, velocity: { x: 0, y: 0 } });

    expect(step(world, { left: false, right: true }).velocity.x).toBeGreaterThan(0);
  });

  it('speeds the ball leftwards while left is held', () => {
    const world = worldAt({ position: { x: 320, y: 240 }, velocity: { x: 0, y: 0 } });

    expect(step(world, { left: true, right: false }).velocity.x).toBeLessThan(0);
  });

  it('leaves the ball alone when both directions are held', () => {
    const world = worldAt({ position: { x: 320, y: 240 }, velocity: { x: 0, y: 0 } });

    expect(step(world, { left: true, right: true }).velocity.x).toBe(0);
  });
});

describe('the step itself', () => {
  it('gives the same result every time for the same world and input', () => {
    const world = worldAt({ position: { x: 100, y: 100 }, velocity: { x: 37, y: -91 } });

    expect(step(world, NOTHING_HELD)).toEqual(step(world, NOTHING_HELD));
  });

  it('does not mutate the world it was given', () => {
    const world = worldAt({ position: { x: 100, y: 100 }, velocity: { x: 37, y: -91 } });
    const before = structuredClone(world);

    step(world, { left: false, right: true });

    expect(world).toEqual(before);
  });

  it('advances by a fixed amount, never by elapsed time', () => {
    const world = worldAt({ position: { x: 320, y: 240 }, velocity: { x: 120, y: 0 } });

    const twice = step(step(world, NOTHING_HELD), NOTHING_HELD);

    expect(twice.position.x).toBeCloseTo(320 + 2 * 120 * STEP_SECONDS);
  });
});

describe('a box too small for the ball', () => {
  it('fails loudly rather than starting a game that cannot work', () => {
    expect(() => createWorld({ width: 4, height: 4 })).toThrow(/cannot hold a ball/);
  });
});
