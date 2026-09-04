import { createGameState, step, boundaryOf, STEP_SECONDS, type Input } from './domain/simulation';
import { destructibleRemaining, levelFromRows } from './domain/level';
import { FIRST_LEVEL } from './levels/first';
import { draw } from './render/draw';
import { BACKGROUND, BOUNDARY } from './render/palette';

/**
 * The edge. Everything the domain is not allowed to know lives here: the clock, the keyboard, the
 * canvas and the document. This is the only file that reads the time.
 */

const LONGEST_CATCH_UP_SECONDS = 0.25;

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

// The stylesheet names no color of its own; spec-style's palette reaches it through these.
// The readout wears BOUNDARY because it is page chrome, not a play element, and spec-style says
// every play element gets a hue of its own — so chrome may not borrow one.
document.documentElement.style.setProperty('--ground', BACKGROUND);
document.documentElement.style.setProperty('--line', BOUNDARY);

const canvas = required<HTMLCanvasElement>('#stage');
const context = context2dOf(canvas);

const collisionReadout = required('[data-testid="collision-count"]');
const batReadout = required('[data-testid="bat-position"]');
const bricksReadout = required('[data-testid="bricks-left"]');
required('[data-testid="build-identifier"]').textContent = __BUILD_IDENTIFIER__;

// The seed comes from outside the level — one that authored its own would draw the same bat every
// time, which is not a draw (doc/spec-domain.md).
let state = createGameState(levelFromRows(FIRST_LEVEL), Date.now());

// The level decides how big the play area is, so the canvas takes its size from the level.
const extent = boundaryOf(state);
canvas.width = extent.width;
canvas.height = extent.height;

const held = new Set<string>();
const ARROWS = new Set(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown']);

/**
 * A direction is held; a launch is done. spec-app says Space is pressed once, so it is latched here
 * and cleared after the steps that saw it — sampling it like a direction drops a press that begins
 * and ends between two frames, which is most of them.
 */
let launchRequested = false;

addEventListener('keydown', (event) => {
  if (event.key === ' ') {
    launchRequested = true;
    event.preventDefault();
    return;
  }
  if (ARROWS.has(event.key)) {
    held.add(event.key);
    event.preventDefault();
  }
});
addEventListener('keyup', (event) => held.delete(event.key));

/**
 * spec-app.md: a touch button holds exactly the state its key holds, and nothing else — `touchstart`
 * sets the same flag `keydown` does, and `touchend` clears it, into the very same `held` set. There
 * is no second input path for `frame` to read below; there is one, fed from two places.
 *
 * `touchcancel` clears it the same way `touchend` does, for the same reason `keyup` needs no
 * counterpart: a finger the browser takes the gesture away from (a system swipe, an incoming call)
 * must not leave a direction stuck held for the rest of the game.
 */
function wireHeldButton(testId: string, key: string): void {
  const button = required<HTMLButtonElement>(`[data-testid="${testId}"]`);
  button.addEventListener('touchstart', (event) => {
    held.add(key);
    event.preventDefault();
  });
  button.addEventListener('touchend', () => held.delete(key));
  button.addEventListener('touchcancel', () => held.delete(key));
}

wireHeldButton('touch-left', 'ArrowLeft');
wireHeldButton('touch-right', 'ArrowRight');
wireHeldButton('touch-up', 'ArrowUp');
wireHeldButton('touch-down', 'ArrowDown');

required<HTMLButtonElement>('[data-testid="touch-launch"]').addEventListener('touchstart', (event) => {
  launchRequested = true;
  event.preventDefault();
});

let previous = performance.now();
let unspent = 0;

function frame(now: number): void {
  // Clamped, so a backgrounded tab does not come back to thousands of catch-up steps.
  unspent += Math.min((now - previous) / 1000, LONGEST_CATCH_UP_SECONDS);
  previous = now;

  const input: Input = {
    left: held.has('ArrowLeft'),
    right: held.has('ArrowRight'),
    up: held.has('ArrowUp'),
    down: held.has('ArrowDown'),
    launch: launchRequested,
  };
  while (unspent >= STEP_SECONDS) {
    state = step(state, input);
    unspent -= STEP_SECONDS;
  }
  launchRequested = false;

  collisionReadout.textContent = String(state.collisions);
  const horizontal = state.bats.find((bat) => bat.orientation === 'horizontal');
  batReadout.textContent = (horizontal?.position ?? 0).toFixed(0);
  bricksReadout.textContent = String(destructibleRemaining(state.level, state.destroyed));
  draw(context, state);

  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
