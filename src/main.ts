import { createWorld, step, STEP_SECONDS, type Input } from './domain/simulation';
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

const bounceReadout = required('[data-testid="bounce-count"]');
const velocityReadout = required('[data-testid="velocity-x"]');
required('[data-testid="build-identifier"]').textContent = __BUILD_IDENTIFIER__;

let world = createWorld({ width: canvas.width, height: canvas.height });

const held = new Set<string>();
addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    held.add(event.key);
    event.preventDefault();
  }
});
addEventListener('keyup', (event) => held.delete(event.key));

let previous = performance.now();
let unspent = 0;

function frame(now: number): void {
  // Clamped, so a backgrounded tab does not come back to thousands of catch-up steps.
  unspent += Math.min((now - previous) / 1000, LONGEST_CATCH_UP_SECONDS);
  previous = now;

  const input: Input = { left: held.has('ArrowLeft'), right: held.has('ArrowRight') };
  while (unspent >= STEP_SECONDS) {
    world = step(world, input);
    unspent -= STEP_SECONDS;
  }

  bounceReadout.textContent = String(world.bounces);
  velocityReadout.textContent = world.velocity.x.toFixed(1);
  draw(context, world);

  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
