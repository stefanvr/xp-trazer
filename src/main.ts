import { boundaryOf, isCleared, STEP_SECONDS, type Event, type Input } from './domain/simulation';
import { continueRun, createRun, isGameOver, stepRun, type Run } from './domain/run';
import { destructibleRemaining, type Level } from './domain/level';
import { clearingProofLevel } from './levels/clearing-proof';
import { collisionProofLevel } from './levels/collision-proof';
import { gameOverProofLevel } from './levels/game-over-proof';
import { roomDrawnFrom } from './levels/drawn-room';
import { draw, drawGameOver } from './render/draw';
import { BACKGROUND, BOUNDARY } from './render/palette';
import { soundFor } from './audio/sounds';
import { play } from './audio/play';

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
const batGroupReadout = required('[data-testid="bat-group"]');
const bricksReadout = required('[data-testid="bricks-left"]');
const roomReadout = required('[data-testid="room"]');
const livesReadout = required('[data-testid="lives-left"]');
const scoreReadout = required('[data-testid="score"]');
required('[data-testid="build-identifier"]').textContent = __BUILD_IDENTIFIER__;

/**
 * The level the player meets is one of the original's rooms, drawn at random — doc/spec-app.md, for
 * the run's first level and for every one after it. Three names reach a level built for the
 * end-to-end suite instead of a room: `?level=clearing-proof` watches a level be cleared,
 * `?level=collision-proof` watches a collision that destroys nothing reach the page, and
 * `?level=game-over-proof` watches a run reach game over. Neither is something a test can rely on a
 * real room, drawn at random, to do in reasonable time — clearing-proof.ts, collision-proof.ts and
 * game-over-proof.ts say why each needed one.
 *
 * The seam substitutes a level and can do nothing else: no rule, no constant, no behaviour is
 * reachable through it, and any value but these three names draws a room. It is not room selection —
 * the parameter names no room and cannot. `doc/spec-tech.md`'s **A-2** records it.
 */
function chosenLevel(seed: number): Level {
  const asked = new URLSearchParams(window.location.search).get('level');
  if (asked === 'clearing-proof') return clearingProofLevel();
  if (asked === 'collision-proof') return collisionProofLevel();
  if (asked === 'game-over-proof') return gameOverProofLevel();
  return roomDrawnFrom(seed);
}

/**
 * Which bat group the position readout follows — doc/spec-app.md. A level may author only one of
 * the two, so a readout fixed to the horizontal group reads zero for ever in every level without
 * one. Horizontal wherever a level has it, so a level holding both reads as it always did.
 *
 * The *orientation* is what is kept, never a bat: a step replaces every bat, so a bat held from
 * before the first step would report the position it started at for the rest of the game. A group
 * moves as one thing — **DS-3.1** — so any bat of that orientation reports it.
 *
 * Recomputed every time a level starts, not only the first: a run's later levels are drawn the same
 * way its first one was, and may not author the same bats.
 */
let reportedGroup: 'horizontal' | 'vertical' | undefined;

/**
 * What starts fresh whenever a level does, whether the run's first or one reached by continuing or
 * restarting — doc/spec-app.md's readouts, and the canvas the level is drawn at its own size on.
 */
function beginLevel(run: Run): void {
  reportedGroup =
    run.game.bats.find((bat) => bat.orientation === 'horizontal')?.orientation ??
    run.game.bats[0]?.orientation;
  batGroupReadout.textContent = reportedGroup ?? 'none';
  roomReadout.textContent =
    run.game.level.origin === undefined ? '—' : String(run.game.level.origin.room);

  // The level decides how big the play area is, so the canvas takes its size from the level.
  const extent = boundaryOf(run.game);
  canvas.width = extent.width;
  canvas.height = extent.height;
}

/**
 * One seed, read once per level, for both draws it makes: which room the player gets, and the
 * heading the ball launches on. The clock is the edge's to read — the domain never asks what time
 * it is.
 */
let run = createRun(chosenLevel(Date.now()), Date.now());
beginLevel(run);

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

  /**
   * spec-app.md's **Continue** step: the same latch **Launch** uses, read instead as continue while
   * the level is cleared or the run is over — never passed to `stepRun`, which would only find a
   * level or a run that has already stopped advancing (DS-5.2, DS-9.6).
   *
   * Game over is asked first because it can never coincide with a freshly cleared level on the same
   * run: once a run is over `stepRun` stops advancing it, so nothing can clear a level out from under
   * it afterwards, and a trap destroying the ball short-circuits the same step's chance to clear one.
   */
  if (launchRequested && isGameOver(run)) {
    // DS-9.2 — a restart is a fresh run: five lives, no score, drawn the same way the first was.
    run = createRun(chosenLevel(Date.now()), Date.now());
    beginLevel(run);
    launchRequested = false;
  } else if (launchRequested && isCleared(run.game)) {
    // DS-9.1 — the run continues: lives and score carry over, and only the level is replaced.
    run = continueRun(run, chosenLevel(Date.now()), Date.now());
    beginLevel(run);
    launchRequested = false;
  } else {
    /**
     * A frame can cover several steps, and each announces its own events — so they are collected
     * across the whole frame and heard together. Dropping the ones from every step but the last would
     * silence a brick destroyed in a frame that happened to run twice.
     */
    const announced: Event[] = [];
    let anyStepTaken = false;
    while (unspent >= STEP_SECONDS) {
      const stepped = stepRun(run, input);
      run = stepped.run;
      announced.push(...stepped.events);
      unspent -= STEP_SECONDS;
      anyStepTaken = true;
    }

    /**
     * **Cleared only once a step has actually seen it.** A frame can arrive with less than one step's
     * worth of time owing — the first few after load, or any of them where the display runs faster
     * than the simulation — and it then takes no step at all. Clearing the latch there swallows the
     * press, and spec-app's *"Space, pressed once, launches"* silently stops being true: the ball
     * stays held and nothing says why.
     *
     * Observed as a 30% failure rate in an end-to-end test that pressed Space immediately after the
     * page loaded. The tests that happened to await something first were not affected, which is what
     * made it look like flakiness rather than a dropped input.
     */
    if (anyStepTaken) launchRequested = false;

    // What the world did back — doc/spec-app.md. `soundFor` is spec-style's table, and it answers
    // `undefined` for a collision that destroyed what it met, whose destruction is heard instead.
    for (const event of announced) {
      const sound = soundFor(event);
      if (sound !== undefined) play(sound);
    }
  }

  collisionReadout.textContent = String(run.game.collisions);
  const reported = run.game.bats.find((bat) => bat.orientation === reportedGroup);
  batReadout.textContent = (reported?.position ?? 0).toFixed(0);
  bricksReadout.textContent = String(destructibleRemaining(run.game.level, run.game.destroyed));
  livesReadout.textContent = String(run.lives);
  scoreReadout.textContent = String(run.score);

  draw(context, run.game);
  // Over everything drawn above, the same way CLEARED is — spec-style.md's Game over.
  if (isGameOver(run)) drawGameOver(context, canvas.width, canvas.height, run.score);

  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
