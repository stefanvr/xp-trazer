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
  UNBEHAVED_KINDS,
  type Bat,
  type ElementKind,
  type Footprint,
  type Level,
  type PlacedElement,
} from '../src/domain/level';
import { portedKind } from '../src/levels/porting';
import { OBJECT_KINDS } from '../src/import/convert';
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
 * **A DS-7.1 kind is shown as a real played room would show it, not as the raw carried state.** A
 * level placing one of the five directly is unplayable — nothing here disputes that — but nothing a
 * player meets is that raw level either: `src/levels/porting.ts`'s concession runs first. Glass
 * refractor and both traps are left out entirely; monster generator and bumper stand in as a real,
 * collidable permanent brick. This page calls that same `portedKind`, so a panel is exactly what the
 * concession produces rather than a second guess at it — drawing a shape nothing here would actually
 * collide with was rejected for the same reason **guide-design.md** rejects a silent wrong answer.
 *
 * **Every panel is at the original's own shape, and none of them is one cell.** The rooms hold no
 * 1×1 element anywhere — a destructible brick is 2×1 or 1×2, a solid block 2×1 only, and the five
 * DS-7.1 kinds are larger still. The shapes are read from `src/import/convert.ts`'s own table
 * rather than restated here, so a footprint corrected at the border is corrected on this page too.
 *
 * **The `?level=clearing-proof` seam is untouched.** doc/spec-tech.md's **A-2** is a seam that
 * substitutes a level and reaches nothing else; this page does not go through it; it is a second, dev-
 * only route, gated the way `dev/style.html` is — left out of `vite build`.
 */

// Room for the widest kind the original has (the glass refractor's four columns) beside the anchor
// brick, and wide enough that CLEARED_WORD is not clipped — at ten columns it read as "LEARE".
const COLUMNS = 12;
const ROWS = 6;
// The bat's low end sits at column 0 and spans three cells, so column 1 is under its middle —
// where a held ball rests. Pressing Space with no steering meets this brick, the same way
// `src/levels/clearing-proof.ts` puts its one brick under the bat with nothing to steer.
const ANCHOR_COLUMN = 1;
const ANCHOR_ROW = 3;
// Away from the bat's resting column, so reaching the kind under test takes steering right first —
// exercising the bats as well as the ball, rather than everything happening on one keypress. Row 1
// leaves the tallest kind (three rows) clear of the bat's own row.
const UNDER_TEST_COLUMN = 6;
const UNDER_TEST_ROW = 1;

type Panel = {
  readonly label: string;
  readonly kind: ElementKind;
  readonly footprint: Footprint;
};

/**
 * One panel per object the original has — the import's table is the list, so the two bricks appear
 * as the two shapes they are and nothing here decides what the inventory is.
 */
const PANELS: readonly Panel[] = [...OBJECT_KINDS].map(([label, { kind, footprint }]) => ({
  label,
  kind,
  footprint,
}));

/** What sits under the bat in every panel: the commonest shape the original has. */
function named(label: string): { readonly kind: ElementKind; readonly footprint: Footprint } {
  const found = OBJECT_KINDS.get(label);
  if (found === undefined) throw new Error(`the import no longer names ${label}`);
  return found;
}

const ANCHOR = named('Horizontal brick');

/**
 * What a panel's caption says happened to the kind under test. `undefined` for the two bricks —
 * `portedKind` only ever concedes a **DS-7.1** kind, and a brick passes through it unchanged, so
 * asking would say nothing a reader does not already see on the canvas.
 */
function concessionNote(kind: ElementKind): string | undefined {
  if (kind === 'destructible' || kind === 'permanent') return undefined;
  const after = portedKind(kind);
  return after === undefined
    ? 'left out of the played level — doc/spec-domain-porting-todo.md'
    : `stands in as a ${after} brick, keeping its footprint — doc/spec-domain-porting-todo.md`;
}

/**
 * One level per panel, always with a bat on the last row (its low end at column 0, so **DS-1.6**'s
 * blocked side is the boundary) and always with a horizontal brick — **DS-1.8** — under the bat's
 * resting column, so Space alone clears it with nothing steered.
 *
 * The object under test sits away from that column, reachable by steering the bat there first — as
 * whatever `portedKind` turns it into, keeping the footprint the original gave it. For the two
 * bricks and the solid block that is the kind itself; for the five **DS-7.1** kinds it is what
 * `src/levels/porting.ts` actually does with them, so a level here is never one this page invented
 * a behaviour for. The horizontal brick's own panel adds nothing, because the anchor already is one.
 */
function levelFor(panel: Panel): Level {
  const elements: PlacedElement[] = [
    {
      kind: ANCHOR.kind,
      column: ANCHOR_COLUMN,
      row: ANCHOR_ROW,
      footprint: ANCHOR.footprint,
      colorId: undefined,
    },
  ];

  const after = portedKind(panel.kind);
  const isTheAnchorItself =
    panel.kind === ANCHOR.kind &&
    panel.footprint.columns === ANCHOR.footprint.columns &&
    panel.footprint.rows === ANCHOR.footprint.rows;

  if (after !== undefined && !isTheAnchorItself) {
    elements.push({
      kind: after,
      column: UNDER_TEST_COLUMN,
      row: UNDER_TEST_ROW,
      footprint: panel.footprint,
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
    throw new Error(`doc/spec-domain.md's DS-7.1 names ${kind}; the import places no such object`);
  }
}

/** A stable handle for a panel, for the picker's markup — the labels are the import's own names. */
function testIdOf(panel: Panel): string {
  return `panel-${panel.label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
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
const shapeReadout = required('[data-testid="shape"]');
const concessionReadout = required('[data-testid="concession"]');

const held = new Set<string>();
const ARROWS = new Set(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown']);
let launchRequested = false;

let state: GameState;

function loadPanel(panel: Panel): void {
  held.clear();
  launchRequested = false;

  const level = levelFor(panel);
  state = createGameState(level, Date.now());

  const extent = boundaryOf(state);
  canvas.width = extent.width;
  canvas.height = extent.height;

  const { columns, rows } = panel.footprint;
  shapeReadout.textContent = `${columns}×${rows}`;
  concessionReadout.textContent = concessionNote(panel.kind) ?? '—';

  const chosen = testIdOf(panel);
  for (const button of picker.querySelectorAll<HTMLButtonElement>('button')) {
    button.setAttribute('aria-pressed', String(button.dataset['testid'] === chosen));
  }
}

for (const panel of PANELS) {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = panel.label;
  button.dataset['testid'] = testIdOf(panel);
  button.setAttribute('data-testid', testIdOf(panel));
  button.addEventListener('click', () => loadPanel(panel));
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

loadPanel(PANELS[0]!);
requestAnimationFrame(frame);
