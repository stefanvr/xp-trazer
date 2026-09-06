import { describe, expect, it } from 'vitest';
import { deflectedByBat, heldAt, launchVelocity, BALL_PIXELS_PER_SECOND } from './ball';
import { CELL_PIXELS, levelFrom, levelFromRows } from './level';

/** Tests are named as the behaviour claimed, not as the function under test — guide-design.md. */

const TALL = levelFromRows([
  '-....',
  '.*...',
  ...Array.from({ length: 7 }, () => '.....'),
  '-....',
]);

describe('a held ball', () => {
  it('waits in the middle of the cell the level authors', () => {
    expect(heldAt(TALL)).toEqual({ x: 1.5 * CELL_PIXELS, y: 1.5 * CELL_PIXELS });
  });

  it('waits where the level says rather than anywhere near a bat', () => {
    const elsewhere = levelFromRows(['-....', '.....', '...*d', '.....', '.....']);

    expect(heldAt(elsewhere)).toEqual({ x: 3.5 * CELL_PIXELS, y: 2.5 * CELL_PIXELS });
  });

  it('has no place to wait in a level authoring no ball start, which DS-1.4 requires', () => {
    const startless = levelFrom({
      columns: 5,
      rows: 5,
      elements: [],
      bats: [{ orientation: 'horizontal', line: 4, position: 0 }],
    });

    expect(() => heldAt(startless)).toThrow(/no ball start/);
  });
});

describe('launching', () => {
  it('leaves at the one speed the ball ever has, whatever the seed', () => {
    for (const seed of [0, 1, 7, 12345, Date.now()]) {
      expect(Math.hypot(launchVelocity(seed).x, launchVelocity(seed).y)).toBeCloseTo(
        BALL_PIXELS_PER_SECOND,
      );
    }
  });

  it('sends the same seed the same way, so a start can be repeated exactly', () => {
    expect(launchVelocity(99)).toEqual(launchVelocity(99));
  });

  it('sends neighbouring seeds different ways, so a clock is a draw and not a queue', () => {
    // Two page loads a moment apart differ only in their last digits. Without spreading, every
    // launch of a session would leave on nearly one heading.
    const headings = [0, 1, 2, 3, 4, 5].map((step) => {
      const velocity = launchVelocity(1_700_000_000_000 + step);
      return Math.atan2(velocity.y, velocity.x);
    });

    for (const [index, heading] of headings.entries()) {
      for (const other of headings.slice(index + 1)) {
        expect(Math.abs(heading - other)).toBeGreaterThan(0.2);
      }
    }
  });

  it('reaches headings all around the circle across many seeds', () => {
    const quadrants = new Set<number>();
    for (let seed = 0; seed < 200; seed += 1) {
      const velocity = launchVelocity(seed);
      quadrants.add((velocity.x >= 0 ? 1 : 0) * 2 + (velocity.y >= 0 ? 1 : 0));
    }

    expect(quadrants.size).toBe(4);
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

