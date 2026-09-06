import { describe, expect, it } from 'vitest';

import {
  CELL_PIXELS,
  cellsOf,
  destructibleCount,
  destructibleRemaining,
  elementAt,
  levelFrom,
  type PlacedElement,
} from './level';
import { obstacleAt } from './collision';
import { BALL_PIXELS_PER_SECOND } from './ball';
import { createGameState, isCleared, step, type GameState, type Input } from './simulation';

/**
 * An element that occupies more than one cell — **DS-4.4** and **DS-4.5**. One brick two cells wide,
 * played, is the whole of what these rules add, so one level is what they are asked of.
 *
 * The ball starts below the brick's left half. **DS-2.2** draws the launch heading from the seed, so
 * the direction is not something a level can arrange — the travelling ball is given its heading here
 * instead, aimed at that half, which is the only thing these two rules are being asked about.
 */
const WIDE_BRICK: PlacedElement = {
  kind: 'destructible',
  column: 1,
  row: 1,
  footprint: { columns: 2, rows: 1 },
  colorId: undefined,
};

const LEVEL = levelFrom({
  columns: 6,
  rows: 6,
  elements: [WIDE_BRICK],
  bats: [{ orientation: 'horizontal', line: 5, position: 0 }],
  ballStart: { column: 1, row: 3 },
});

const NOTHING_HELD: Input = {
  left: false,
  right: false,
  up: false,
  down: false,
  launch: false,
};

const middleOf = (column: number, row: number) => ({
  x: column * CELL_PIXELS + CELL_PIXELS / 2,
  y: row * CELL_PIXELS + CELL_PIXELS / 2,
});

/** A ball travelling straight up from the ball start, into the brick's left half. */
function launched(): GameState {
  const held = createGameState(LEVEL, 0);
  return {
    ...held,
    ball: { ...held.ball, held: false, velocity: { x: 0, y: -BALL_PIXELS_PER_SECOND } },
  };
}

/** Steps until the events say something happened, or gives up. */
function untilSomethingHappens(state: GameState): { state: GameState; events: readonly unknown[] } {
  let reached = state;
  for (let taken = 0; taken < 600; taken += 1) {
    const { state: next, events } = step(reached, NOTHING_HELD);
    reached = next;
    if (events.length > 0) return { state: next, events };
  }
  throw new Error('the ball reached nothing in 600 steps');
}

describe('an element that occupies more than one cell', () => {
  it('fills every cell of its footprint', () => {
    expect(elementAt(LEVEL, 1, 1)?.kind).toBe('destructible');
    expect(elementAt(LEVEL, 2, 1)?.kind).toBe('destructible');
    expect(elementAt(LEVEL, 3, 1)).toBeUndefined();
  });

  it('is the same element in each of them, which is DS-4.5', () => {
    expect(elementAt(LEVEL, 1, 1)?.element).toBe(elementAt(LEVEL, 2, 1)?.element);
  });

  it('knows the cells it covers', () => {
    expect(cellsOf(LEVEL, 0)).toEqual([
      { column: 1, row: 1 },
      { column: 2, row: 1 },
    ]);
  });

  it('counts once towards clearing, however many cells it covers', () => {
    expect(destructibleCount(LEVEL)).toBe(1);
    expect(destructibleRemaining(LEVEL, new Set([0]))).toBe(0);
  });

  it('is met as one element from either of its cells', () => {
    const left = middleOf(1, 1);
    const right = middleOf(2, 1);
    const at = (where: { x: number; y: number }) =>
      obstacleAt(LEVEL, new Set(), [], where.x, where.y, 9);

    expect(at(left)).toEqual({ kind: 'element', index: 0, destructible: true });
    expect(at(right)).toEqual(at(left));
  });

  it('is gone from both its cells once destroyed', () => {
    const gone = new Set([0]);
    const at = (where: { x: number; y: number }) => obstacleAt(LEVEL, gone, [], where.x, where.y, 9);

    expect(at(middleOf(1, 1))).toBeUndefined();
    expect(at(middleOf(2, 1))).toBeUndefined();
  });

  it('goes as a whole when the ball meets one half of it', () => {
    const { state, events } = untilSomethingHappens(launched());

    expect(events).toEqual([
      { kind: 'collision', met: 'brick', destroyed: true },
      {
        kind: 'element-destroyed',
        cells: [
          { column: 1, row: 1 },
          { column: 2, row: 1 },
        ],
      },
    ]);
    expect(isCleared(state)).toBe(true);
  });
});
