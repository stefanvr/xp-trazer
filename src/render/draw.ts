import { boundaryOf, type GameState } from '../domain/simulation';
import { batRect } from '../domain/collision';
import { CELL_PIXELS, type Bat, type Level } from '../domain/level';
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

function drawElements(
  context: CanvasRenderingContext2D,
  level: Level,
  destroyed: ReadonlySet<number>,
): void {
  for (const [index, cell] of level.cells.entries()) {
    if (cell === undefined || destroyed.has(index)) continue;

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

/**
 * Drawn from the same rectangle the collision asks about, so the two cannot disagree.
 *
 * They did: this inset the bat by four pixels to make it look thinner, while `batRect` spanned the
 * whole cell — so the ball turned away from a surface four pixels from the one on screen, and the
 * bounce looked like a dropped frame. A renderer that draws a different shape from the one the
 * domain models is telling the player something untrue about where things are.
 */
function drawBats(context: CanvasRenderingContext2D, bats: readonly Bat[]): void {
  for (const bat of bats) {
    const color = bat.orientation === 'horizontal' ? HORIZONTAL_BAT : VERTICAL_BAT;
    const rect = batRect(bat);

    context.shadowColor = color;
    context.fillStyle = color;
    context.fillRect(rect.x, rect.y, rect.w, rect.h);
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

  drawElements(context, state.level, state.destroyed);
  drawBats(context, state.bats);

  context.shadowColor = BALL;
  context.fillStyle = BALL;
  context.beginPath();
  context.arc(ball.position.x, ball.position.y, ball.radius, 0, Math.PI * 2);
  context.fill();

  context.restore();
}
