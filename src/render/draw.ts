import { boundaryOf, isCleared, type GameState } from '../domain/simulation';
import { batRect } from '../domain/collision';
import { CELL_PIXELS, type Bat, type Level } from '../domain/level';
import {
  BACKGROUND,
  BALL,
  BOUNDARY,
  CLEARED_FACE,
  CLEARED_TEXT,
  CLEARED_TEXT_CELLS,
  CLEARED_TRACKING,
  CLEARED_WORD,
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

/**
 * spec-style's one piece of text, and spec-app's reason for it: a ball that has merely stopped is
 * indistinguishable from a ball that has stopped working.
 *
 * Letters are placed one at a time rather than through the context's `letterSpacing`, which is recent
 * enough that not every browser has it — and it fails by silently ignoring the value, which would
 * leave the word set solid with nothing to show that a decision had been dropped.
 */
function drawCleared(context: CanvasRenderingContext2D, width: number, height: number): void {
  const size = CELL_PIXELS * CLEARED_TEXT_CELLS;
  const tracking = size * CLEARED_TRACKING;
  const letters = [...CLEARED_WORD];

  context.font = `${size}px ${CLEARED_FACE}`;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.shadowColor = CLEARED_TEXT;
  context.fillStyle = CLEARED_TEXT;

  const widths = letters.map((letter) => context.measureText(letter).width);
  const across = widths.reduce((sum, each) => sum + each, 0) + tracking * (letters.length - 1);

  let at = (width - across) / 2;
  for (const [index, letter] of letters.entries()) {
    const advance = widths[index]!;
    context.fillText(letter, at + advance / 2, height / 2);
    at += advance + tracking;
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

  // Over everything, and over nothing else: spec-style wants the level left lit behind it.
  if (isCleared(state)) drawCleared(context, width, height);

  context.restore();
}
