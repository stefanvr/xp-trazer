import { boundaryOf, isCleared, type GameState } from '../domain/simulation';
import { batRect } from '../domain/collision';
import { CELL_PIXELS, cellsOf, elementAt, isTrapKind, type Bat, type Level } from '../domain/level';
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
  GAME_OVER_TEXT,
  GAME_OVER_WORD,
  GLOW_PIXELS,
  HORIZONTAL_BAT,
  PERMANENT_BRICK,
  SCORE_LABEL,
  TRAP,
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
  // One element is one shape, whatever its footprint — DS-4.5. Only what the rules read is drawn,
  // which is what reaches the grid: a brick, and the cells of it that are inside the level.
  for (const [index, element] of level.elements.entries()) {
    if (destroyed.has(index)) continue;

    const cells = cellsOf(level, index);
    const first = cells[0];
    const last = cells[cells.length - 1];
    if (first === undefined || last === undefined) continue;
    if (elementAt(level, first.column, first.row)?.element !== index) continue;

    const color = element.kind === 'destructible'
      ? DESTRUCTIBLE_BRICK
      : isTrapKind(element.kind)
        ? TRAP
        : PERMANENT_BRICK;

    context.shadowColor = color;
    context.fillStyle = color;
    context.fillRect(
      first.column * CELL_PIXELS + BRICK_INSET,
      first.row * CELL_PIXELS + BRICK_INSET,
      (last.column - first.column + 1) * CELL_PIXELS - BRICK_INSET * 2,
      (last.row - first.row + 1) * CELL_PIXELS - BRICK_INSET * 2,
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
 * Draws one line of tracked, centred text — spec-style's `CLEARED` and both lines of its *Game
 * over*, which all track the same way.
 *
 * Letters are placed one at a time rather than through the context's `letterSpacing`, which is recent
 * enough that not every browser has it — and it fails by silently ignoring the value, which would
 * leave the word set solid with nothing to show that a decision had been dropped.
 *
 * Assumes `font`, `textAlign: 'center'` and `textBaseline: 'middle'` are already set: every caller
 * shares them, so setting them once per caller rather than once per line is not repetition, it is one
 * fewer place the two could disagree.
 */
function drawTrackedLine(
  context: CanvasRenderingContext2D,
  text: string,
  centerX: number,
  y: number,
  tracking: number,
): void {
  const letters = [...text];
  const widths = letters.map((letter) => context.measureText(letter).width);
  const across = widths.reduce((sum, each) => sum + each, 0) + tracking * (letters.length - 1);

  let at = centerX - across / 2;
  for (const [index, letter] of letters.entries()) {
    const advance = widths[index]!;
    context.fillText(letter, at + advance / 2, y);
    at += advance + tracking;
  }
}

/**
 * spec-style's `Cleared`, and spec-app's reason for it: a ball that has merely stopped is
 * indistinguishable from a ball that has stopped working.
 */
function drawCleared(context: CanvasRenderingContext2D, width: number, height: number): void {
  const size = CELL_PIXELS * CLEARED_TEXT_CELLS;

  context.font = `${size}px ${CLEARED_FACE}`;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.shadowColor = CLEARED_TEXT;
  context.fillStyle = CLEARED_TEXT;

  drawTrackedLine(context, CLEARED_WORD, width / 2, height / 2, size * CLEARED_TRACKING);
}

/**
 * spec-style's *Game over*: two lines where **Cleared** draws one, in `GAME_OVER_TEXT` rather than
 * `CLEARED_TEXT`, tracked the same way.
 *
 * A run and a level are separate things (doc/spec-domain.md's **DS-9**), so this takes what it needs
 * rather than a `GameState` — nothing here is the renderer of a level.
 */
export function drawGameOver(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  score: number,
): void {
  const size = CELL_PIXELS * CLEARED_TEXT_CELLS;
  const tracking = size * CLEARED_TRACKING;
  // Half a line's height apart, so the two sit stacked rather than overlapping or drifting loose.
  const lineOffset = size * 0.6;

  context.save();
  context.shadowBlur = GLOW_PIXELS;
  context.shadowColor = GAME_OVER_TEXT;
  context.fillStyle = GAME_OVER_TEXT;
  context.font = `${size}px ${CLEARED_FACE}`;
  context.textAlign = 'center';
  context.textBaseline = 'middle';

  drawTrackedLine(context, GAME_OVER_WORD, width / 2, height / 2 - lineOffset, tracking);
  drawTrackedLine(context, `${SCORE_LABEL} ${score}`, width / 2, height / 2 + lineOffset, tracking);
  context.restore();
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
