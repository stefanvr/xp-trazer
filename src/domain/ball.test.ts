import { describe, expect, it } from 'vitest';
import {
  awayFrom,
  batHoldingTheBall,
  deflectedByBat,
  launchVelocity,
  restingOn,
  BALL_PIXELS_PER_SECOND,
} from './ball';
import { BAT_LENGTH_PIXELS, CELL_PIXELS, levelFromRows, type Bat } from './level';

/** Tests are named as the behaviour claimed, not as the function under test — guide-design.md. */

// Bats against an edge, as DS-1.6 requires.
const TALL = levelFromRows([
  '-....',
  ...Array.from({ length: 8 }, () => '.....'),
  '-....',
]);
const WIDE = levelFromRows(['|...|', '.....', '.....']);

const horizontal = (line: number, position = 0): Bat => ({ orientation: 'horizontal', line, position });
const vertical = (line: number, position = 0): Bat => ({ orientation: 'vertical', line, position });

describe('which way a bat throws', () => {
  it('throws away from the edge above it', () => {
    expect(awayFrom(TALL, horizontal(0))).toEqual({ x: 0, y: 1 });
  });

  it('throws away from the edge below it', () => {
    expect(awayFrom(TALL, horizontal(9))).toEqual({ x: 0, y: -1 });
  });

  it('throws away from the edge to its left', () => {
    expect(awayFrom(WIDE, vertical(0))).toEqual({ x: 1, y: 0 });
  });

  it('throws away from the edge to its right', () => {
    expect(awayFrom(WIDE, vertical(4))).toEqual({ x: -1, y: 0 });
  });

  it('has no answer for a bat with nothing on either side, which DS-1.6 forbids', () => {
    expect(() => awayFrom(TALL, horizontal(4))).toThrow(/nothing on either side/);
  });

  it('has no answer for a bat with both sides blocked', () => {
    const oneRow = levelFromRows(['-....']);

    expect(() => awayFrom(oneRow, horizontal(0))).toThrow(/both sides blocked/);
  });
});

describe('a held ball', () => {
  it('sits along the middle of the bat holding it', () => {
    const resting = restingOn(TALL, horizontal(0, 64), 9);

    expect(resting.x).toBe(64 + BAT_LENGTH_PIXELS / 2);
  });

  it('rests against the side the bat throws towards', () => {
    const resting = restingOn(TALL, horizontal(0, 0), 9);

    expect(resting.y).toBe(CELL_PIXELS + 9);
  });

  it('rests on the other side for a bat against the far edge', () => {
    const resting = restingOn(TALL, horizontal(9, 0), 9);

    expect(resting.y).toBe(9 * CELL_PIXELS - 9);
  });

  it('rests beside a vertical bat rather than above it', () => {
    const resting = restingOn(WIDE, vertical(0, 0), 9);

    expect(resting).toEqual({ x: CELL_PIXELS + 9, y: BAT_LENGTH_PIXELS / 2 });
  });
});

describe('launching', () => {
  it('sends the ball perpendicular to its bat, away from it', () => {
    expect(launchVelocity(TALL, horizontal(0))).toEqual({ x: 0, y: BALL_PIXELS_PER_SECOND });
  });

  it('sends it along the other axis from a vertical bat', () => {
    expect(launchVelocity(WIDE, vertical(0))).toEqual({ x: BALL_PIXELS_PER_SECOND, y: 0 });
  });

  it('leaves at the one speed the ball ever has', () => {
    const velocity = launchVelocity(TALL, horizontal(9));

    expect(Math.hypot(velocity.x, velocity.y)).toBe(BALL_PIXELS_PER_SECOND);
  });
});

describe('a bat turning the ball', () => {
  const straightUp = { x: 0, y: -BALL_PIXELS_PER_SECOND };

  it('sends it leftwards when met on the near third', () => {
    expect(deflectedByBat(straightUp, 'horizontal', 0.1).x).toBeLessThan(0);
  });

  it('sends it rightwards when met on the far third', () => {
    expect(deflectedByBat(straightUp, 'horizontal', 0.9).x).toBeGreaterThan(0);
  });

  it('leaves the angle alone when met in the middle', () => {
    expect(deflectedByBat(straightUp, 'horizontal', 0.5)).toEqual(straightUp);
  });

  it('turns along the other axis for a vertical bat', () => {
    const straightRight = { x: BALL_PIXELS_PER_SECOND, y: 0 };

    expect(deflectedByBat(straightRight, 'vertical', 0.1).y).toBeLessThan(0);
    expect(deflectedByBat(straightRight, 'vertical', 0.9).y).toBeGreaterThan(0);
  });

  it('turns the ball without speeding it up, which DS-2.5 forbids', () => {
    for (const along of [0, 0.1, 0.5, 0.9, 1]) {
      const turned = deflectedByBat(straightUp, 'horizontal', along);

      expect(Math.hypot(turned.x, turned.y)).toBeCloseTo(BALL_PIXELS_PER_SECOND);
    }
  });

  it('gives a ball that was travelling on one axis a heading off it', () => {
    // The whole point: without this the ball retraces one line for ever.
    expect(deflectedByBat(straightUp, 'horizontal', 0.1).x).not.toBe(0);
  });
});

describe('choosing the bat that holds the ball', () => {
  const four = levelFromRows(['-...|', '.....', '-...|']);

  it('names a bat the level actually has', () => {
    for (const seed of [0, 1, 7, 12345]) {
      expect(batHoldingTheBall(four, seed)).toBeLessThan(four.bats.length);
      expect(batHoldingTheBall(four, seed)).toBeGreaterThanOrEqual(0);
    }
  });

  it('names the same bat every time for the same seed', () => {
    expect(batHoldingTheBall(four, 12345)).toBe(batHoldingTheBall(four, 12345));
  });

  it('does not name the same bat for every seed', () => {
    const chosen = new Set([0, 1, 2, 3].map((seed) => batHoldingTheBall(four, seed)));

    expect(chosen.size).toBeGreaterThan(1);
  });
});
