import { describe, expect, it } from 'vitest';
import { draw } from './draw';
import { batRect } from '../domain/collision';
import { createGameState } from '../domain/simulation';
import { CELL_PIXELS, elementAt, levelFrom, levelFromRows } from '../domain/level';
import { CLEARED_WORD } from './palette';

/** Tests are named as the behaviour claimed, not as the function under test — guide-design.md. */

type Rect = { x: number; y: number; w: number; h: number };

/**
 * A context that records rather than paints. The renderer decides nothing, so the only thing worth
 * asserting about it is that what it draws is the shape the domain models — which is exactly what
 * went wrong: the bat was drawn four pixels thinner than the one the collision asked about, and the
 * ball turned away from a surface that was not the one on screen.
 */
function recordingContext(): {
  context: CanvasRenderingContext2D;
  rects: Rect[];
  letters: string[];
} {
  const rects: Rect[] = [];
  const letters: string[] = [];
  const context = {
    fillRect: (x: number, y: number, w: number, h: number) => void rects.push({ x, y, w, h }),
    fillText: (text: string) => void letters.push(text),
    // Every letter the same width, which is all the placement arithmetic needs to be exercised.
    measureText: () => ({ width: 20 }),
    strokeRect: () => {},
    beginPath: () => {},
    arc: () => {},
    fill: () => {},
    save: () => {},
    restore: () => {},
    fillStyle: '',
    strokeStyle: '',
    shadowColor: '',
    shadowBlur: 0,
    lineWidth: 0,
    font: '',
    textAlign: '',
    textBaseline: '',
  };
  return { context: context as unknown as CanvasRenderingContext2D, rects, letters };
}

describe('the renderer', () => {
  // A bat on the top row, one destructible brick, and room for neither to be confused with the other.
  const level = levelFromRows(['-....', '.....', '..d..', '.....']);

  // What is destroyed is an element, not a cell — DS-4.5.
  const brickAt = (column: number, row: number) => elementAt(level, column, row)?.element ?? -1;

  it('draws a bat as the rectangle the collision asks about', () => {
    const state = createGameState(level, 0);
    const { context, rects } = recordingContext();

    draw(context, state);

    for (const bat of state.bats) {
      expect(rects).toContainEqual(batRect(bat));
    }
  });

  it('says nothing while the level is still being played', () => {
    const { context, letters } = recordingContext();

    draw(context, createGameState(level, 0));

    expect(letters).toEqual([]);
  });

  it('says the level is cleared once it is, rather than only stopping', () => {
    const state = createGameState(level, 0);
    const { context, letters } = recordingContext();

    draw(context, { ...state, destroyed: new Set([brickAt(2, 2)]) });

    expect(letters.join('')).toBe(CLEARED_WORD);
  });

  it('draws nothing where a brick has been destroyed', () => {
    const state = createGameState(level, 0);
    const brick = brickAt(2, 2);
    const whole = recordingContext();
    const short = recordingContext();

    draw(whole.context, state);
    draw(short.context, { ...state, destroyed: new Set([brick]) });

    expect(short.rects.length).toBe(whole.rects.length - 1);
  });

  it('draws an element that covers two cells as one shape, a cell wider than a one-cell brick', () => {
    const brickOfWidth = (columns: number) =>
      levelFrom({
        columns: 5,
        rows: 4,
        elements: [
          {
            kind: 'destructible',
            column: 2,
            row: 2,
            footprint: { columns, rows: 1 },
            colorId: undefined,
          },
        ],
        bats: [{ orientation: 'horizontal', line: 0, position: 0 }],
      });
    const widthsDrawn = (columns: number) => {
      const { context, rects } = recordingContext();
      draw(context, createGameState(brickOfWidth(columns), 0));
      return rects;
    };

    // The brick is the rectangle starting inside column 2 — the only one drawn there.
    const brickIn = (rects: readonly Rect[]) =>
      rects.find((rect) => rect.x > 2 * CELL_PIXELS && rect.x < 3 * CELL_PIXELS);

    const one = widthsDrawn(1);
    const two = widthsDrawn(2);

    expect(two.length).toBe(one.length);
    expect(brickIn(two)?.w).toBe((brickIn(one)?.w ?? 0) + CELL_PIXELS);
    expect(brickIn(two)?.h).toBe(brickIn(one)?.h);
  });
});
