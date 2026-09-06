import { heldAt } from '../src/domain/ball';
import { extentOf, type Level } from '../src/domain/level';
import { unplayableReasons } from '../src/domain/playable';
import type { GameState } from '../src/domain/simulation';
import { ROOMS } from '../src/levels/rooms.generated';
import { portedLevel } from '../src/levels/porting';
import { draw } from '../src/render/draw';
import { BACKGROUND, BOUNDARY } from '../src/render/palette';

/**
 * The preview goal 5 asks for — doc/scope.md. Every room in `rooms.generated.ts`, played as
 * `porting.ts`'s `portedLevel` plays it — the same conversion `drawn-room.ts` draws the game's own
 * room from, never a second copy of it. ArrowUp and ArrowDown step through all of them, including the
 * ones `unplayableReasons` marks unplayable — a room the game never draws is exactly what a preview
 * exists to show.
 *
 * **This draws a room; it does not play one.** `createGameState` throws for a room DS-1's own reasons
 * mark unplayable — that is what makes it unplayable — so stepping a simulation over every room
 * would crash on most of them. A level is drawn once per keypress by the real `draw`, with a `GameState`
 * built here rather than run: no collisions yet, nothing destroyed, the ball at its authored start
 * where one exists.
 */

const LEVELS: readonly Level[] = ROOMS.map(portedLevel);

function required<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) throw new Error(`the document is missing ${selector}`);
  return element;
}

function context2dOf(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const context = canvas.getContext('2d');
  if (!context) throw new Error('this browser has no 2d canvas context');
  return context;
}

document.documentElement.style.setProperty('--ground', BACKGROUND);
document.documentElement.style.setProperty('--line', BOUNDARY);

const canvas = required<HTMLCanvasElement>('#stage');
const context = context2dOf(canvas);
const roomReadout = required('[data-testid="room"]');
const playableReadout = required('[data-testid="playable"]');

/**
 * The ball a preview shows. A held ball rests at the level's own start where DS-1.4 gives it one;
 * a level with none has nothing for `heldAt` to answer, so this page centres it instead rather than
 * asking a rule for a position no rule promises — the readout beside it already says why.
 */
function previewBall(level: Level) {
  const hasStart = level.ballStart !== undefined;
  const extent = extentOf(level);
  return {
    position: hasStart ? heldAt(level) : { x: extent.width / 2, y: extent.height / 2 },
    velocity: { x: 0, y: 0 },
    radius: 9,
    held: true,
  };
}

let index = 0;

function showRoom(next: number): void {
  index = ((next % LEVELS.length) + LEVELS.length) % LEVELS.length;
  const level = LEVELS[index]!;

  const extent = extentOf(level);
  canvas.width = extent.width;
  canvas.height = extent.height;

  const state: GameState = {
    level,
    seed: 0,
    bats: level.bats,
    ball: previewBall(level),
    collisions: 0,
    destroyed: new Set(),
  };
  draw(context, state);

  roomReadout.textContent = level.origin === undefined ? '—' : String(level.origin.room);
  const reasons = unplayableReasons(level);
  playableReadout.textContent = reasons.length === 0 ? 'playable' : reasons.join('; ');
}

addEventListener('keydown', (event) => {
  if (event.key === 'ArrowDown') {
    showRoom(index + 1);
    event.preventDefault();
  } else if (event.key === 'ArrowUp') {
    showRoom(index - 1);
    event.preventDefault();
  }
});

showRoom(0);
