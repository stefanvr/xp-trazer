import {
  createGameState,
  step,
  boundaryOf,
  STEP_SECONDS,
  type GameState,
  type Event,
  type Input,
} from '../src/domain/simulation';
import {
  levelFrom,
  destructibleRemaining,
  ONE_CELL,
  UNBEHAVED_KINDS,
  type Bat,
  type ElementKind,
  type Level,
  type PlacedElement,
} from '../src/domain/level';
import { unplayableReasons } from '../src/domain/playable';
import { draw } from '../src/render/draw';
import { BACKGROUND, BOUNDARY } from '../src/render/palette';
import { soundFor } from '../src/audio/sounds';
import { play } from '../src/audio/play';

/**
 * The test bed goal 2 asks for — doc/scope.md. `dev/style.ts` shows every row spec-style.md's
 * palette names, but five of spec-domain.md's element kinds have no row there: **DS-7.1** gives them
 * no color, so a page that draws only what spec-style decides cannot reach them. This page reaches
 * them instead, by building a real, playable level for every `ElementKind` and driving it with the
 * same loop `src/main.ts` runs — real `createGameState`, `step`, `draw`, `soundFor` and `play`, never
 * a second copy of any of them.
 *
 * **The `?level=clearing-proof` seam is untouched.** doc/spec-tech.md's **A-2** is a seam that
 * substitutes a level and reaches nothing else; this page does not go through it; it is a second, dev-
 * only route, gated the way `dev/style.html` is — left out of `vite build`.
 *
 * **A level here is real, not a mockup.** Every one carries a bat and a destructible brick, so every
 * panel but the one under test is exactly what makes the others playable — a level demonstrating a
 * kind DS-7.1 gives no rule to is unplayable for that reason alone, which `unplayableReasons` says
 * without this page inventing a second way to say it.
 */

const COLUMNS = 7;
const ROWS = 5;
// The bat's low end sits at column 0 and spans three cells, so column 1 is under its middle —
// where a held ball rests. Pressing Space with no steering meets this brick, the same way
// `src/levels/clearing-proof.ts` puts its one brick under the bat with nothing to steer.
const DESTRUCTIBLE_COLUMN = 1;
const DESTRUCTIBLE_ROW = 2;
// Away from the bat's resting column, so reaching the kind under test takes steering right first —
// exercising the bats as well as the ball, rather than everything happening on one keypress.
const UNDER_TEST_COLUMN = 5;
const UNDER_TEST_ROW = 2;

type Panel = { readonly kind: ElementKind; readonly label: string };

const PANELS: readonly Panel[] = [
  { kind: 'destructible', label: 'Destructible brick' },
  { kind: 'permanent', label: 'Permanent brick' },
  { kind: 'glassRefractor', label: 'Glass refractor' },
  { kind: 'monsterGenerator', label: 'Monster generator' },
  { kind: 'horizontalTrap', label: 'Horizontal trap' },
  { kind: 'verticalTrap', label: 'Vertical trap' },
  { kind: 'bumper', label: 'Bumper' },
];

/**
 * One level per panel, always with a bat on the last row (its low end at column 0, so **DS-1.6**'s
 * blocked side is the boundary) and always with a destructible brick — **DS-1.8** — under the bat's
 * resting column, so Space alone clears it with nothing steered. The kind under test sits away from
 * that column, reachable by steering the bat there first; for the `destructible` panel itself the
 * kind under test *is* that one brick, so nothing is added twice.
 */
function levelFor(kind: ElementKind): Level {
  const elements: PlacedElement[] = [
    {
      kind: 'destructible',
      column: DESTRUCTIBLE_COLUMN,
      row: DESTRUCTIBLE_ROW,
      footprint: ONE_CELL,
      colorId: undefined,
    },
  ];
  if (kind !== 'destructible') {
    elements.push({
      kind,
      column: UNDER_TEST_COLUMN,
      row: UNDER_TEST_ROW,
      footprint: ONE_CELL,
      colorId: undefined,
    });
  }

  const bats: Bat[] = [{ orientation: 'horizontal', line: ROWS - 1, position: 0 }];

  return levelFrom({ columns: COLUMNS, rows: ROWS, elements, bats });
}

// Sanity against DS-7.1's own list, so a sixth unbehaved kind added there is a panel missing here
// rather than one silently never reached.
for (const kind of UNBEHAVED_KINDS) {
  if (!PANELS.some((panel) => panel.kind === kind)) {
    throw new Error(`doc/spec-domain.md's DS-7.1 names ${kind}; no panel here reaches it`);
  }
}

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
const picker = required<HTMLElement>('#picker');
const collisionReadout = required('[data-testid="collision-count"]');
const bricksReadout = required('[data-testid="bricks-left"]');
const playableReadout = required('[data-testid="playable"]');
const reasonsReadout = required('[data-testid="unplayable-reasons"]');

const held = new Set<string>();
const ARROWS = new Set(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown']);
let launchRequested = false;

let state: GameState;

function loadPanel(kind: ElementKind): void {
  held.clear();
  launchRequested = false;

  const level = levelFor(kind);
  state = createGameState(level, Date.now());

  const extent = boundaryOf(state);
  canvas.width = extent.width;
  canvas.height = extent.height;

  const reasons = unplayableReasons(level);
  playableReadout.textContent = reasons.length === 0 ? 'yes' : 'no';
  reasonsReadout.textContent = reasons.length === 0 ? '—' : reasons.join('; ');

  for (const button of picker.querySelectorAll<HTMLButtonElement>('button')) {
    button.setAttribute('aria-pressed', String(button.dataset['kind'] === kind));
  }
}

for (const panel of PANELS) {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = panel.label;
  button.dataset['kind'] = panel.kind;
  button.setAttribute('data-testid', `panel-${panel.kind}`);
  button.addEventListener('click', () => loadPanel(panel.kind));
  picker.append(button);
}

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

const LONGEST_CATCH_UP_SECONDS = 0.25;
let previous = performance.now();
let unspent = 0;

function frame(now: number): void {
  unspent += Math.min((now - previous) / 1000, LONGEST_CATCH_UP_SECONDS);
  previous = now;

  const input: Input = {
    left: held.has('ArrowLeft'),
    right: held.has('ArrowRight'),
    up: held.has('ArrowUp'),
    down: held.has('ArrowDown'),
    launch: launchRequested,
  };

  const announced: Event[] = [];
  let anyStepTaken = false;
  while (unspent >= STEP_SECONDS) {
    const stepped = step(state, input);
    state = stepped.state;
    announced.push(...stepped.events);
    unspent -= STEP_SECONDS;
    anyStepTaken = true;
  }
  if (anyStepTaken) launchRequested = false;

  for (const event of announced) {
    const sound = soundFor(event);
    if (sound !== undefined) play(sound);
  }

  collisionReadout.textContent = String(state.collisions);
  bricksReadout.textContent = String(destructibleRemaining(state.level, state.destroyed));
  draw(context, state);

  requestAnimationFrame(frame);
}

loadPanel(PANELS[0]!.kind);
requestAnimationFrame(frame);
