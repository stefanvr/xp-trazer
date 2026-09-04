import { boundaryOf, type GameState } from '../domain/simulation';
import { BAT_LENGTH_PIXELS, CELL_PIXELS, type Bat, type Level } from '../domain/level';
import {
  BACKGROUND,
  BALL,
  BOUNDARY,
  DESTRUCTIBLE_BRICK,
  GLOW_PIXELS,
  HORIZONTAL_BAT,
  PERMANENT_BRICK,
  VERTICAL_BAT,
} from './palette';

/**
 * The renderer. It reads the state and draws it, and decides nothing — replacing this should mean
 * replacing a draw function, not rewriting the interaction (guide-design.md).
 *
 * Colors come from ./palette, doc/spec-style.md's one place in code — not repeated here.
 */

const BRICK_INSET = 1;
const BAT_INSET = 4;

function drawElements(context: CanvasRenderingContext2D, level: Level): void {
  for (const [index, cell] of level.cells.entries()) {
    if (cell === undefined) continue;

    const color = cell.kind === 'destructible' ? DESTRUCTIBLE_BRICK : PERMANENT_BRICK;
    const column = index % level.columns;
    const row = Math.floor(index / level.columns);

    context.shadowColor = color;
    context.fillStyle = color;
    context.fillRect(
      column * CELL_PIXELS + BRICK_INSET,
      row * CELL_PIXELS + BRICK_INSET,
      CELL_PIXELS - BRICK_INSET * 2,
      CELL_PIXELS - BRICK_INSET * 2,
    );
  }
}

function drawBats(context: CanvasRenderingContext2D, bats: readonly Bat[]): void {
  for (const bat of bats) {
    const horizontal = bat.orientation === 'horizontal';
    const color = horizontal ? HORIZONTAL_BAT : VERTICAL_BAT;

    context.shadowColor = color;
    context.fillStyle = color;
    context.fillRect(
      horizontal ? bat.position : bat.line * CELL_PIXELS + BAT_INSET,
      horizontal ? bat.line * CELL_PIXELS + BAT_INSET : bat.position,
      horizontal ? BAT_LENGTH_PIXELS : CELL_PIXELS - BAT_INSET * 2,
      horizontal ? CELL_PIXELS - BAT_INSET * 2 : BAT_LENGTH_PIXELS,
    );
  }
}

export function draw(context: CanvasRenderingContext2D, state: GameState): void {
  const { width, height } = boundaryOf(state);
  const { ball } = state;

  context.fillStyle = BACKGROUND;
  context.fillRect(0, 0, width, height);

  context.save();
  context.shadowBlur = GLOW_PIXELS;

  context.shadowColor = BOUNDARY;
  context.strokeStyle = BOUNDARY;
  context.lineWidth = 2;
  context.strokeRect(1, 1, width - 2, height - 2);

  drawElements(context, state.level);
  drawBats(context, state.bats);

  context.shadowColor = BALL;
  context.fillStyle = BALL;
  context.beginPath();
  context.arc(ball.position.x, ball.position.y, ball.radius, 0, Math.PI * 2);
  context.fill();

  context.restore();
}
