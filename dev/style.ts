import { createGameState, step, boundaryOf, type GameState, type Input } from '../src/domain/simulation';
import { levelFromRows, type Level } from '../src/domain/level';
import { draw } from '../src/render/draw';
import { BACKGROUND } from '../src/render/palette';

/**
 * The `style` skill's page: one panel per row doc/spec-style.md names — its palette table, and the
 * one word its typography section decides.
 *
 * **Everything the domain models is drawn by calling the real render function**, against a real
 * `GameState` reached by real steps. Nothing here re-implements a shape or repeats a color: a panel
 * that painted its own brick could go on looking right after the renderer stopped, which is the
 * drift this page exists to catch.
 *
 * The consequence is that no panel shows its element alone — a level always has a bat, a ball, a
 * boundary and something to destroy, because the rules require all four. Each panel is arranged so
 * that its own row is what the eye lands on, and says what else is in frame.
 */

const NOTHING_HELD: Input = { left: false, right: false, up: false, down: false, launch: false };

type Panel = {
  readonly name: string;
  readonly role: string;
  readonly note?: string;
  /** Absent for the one row the domain does not model — the void itself. */
  readonly rows?: readonly string[];
  readonly arrange?: (state: GameState) => GameState;
  /** Spans the gallery, for a panel that has to be seen at its own size. */
  readonly wide?: boolean;
};

/** A real state, reached by real steps — never assembled by hand. */
function after(state: GameState, times: number, input: Partial<Input>): GameState {
  let reached = state;
  for (let taken = 0; taken < times; taken += 1) {
    reached = step(reached, { ...NOTHING_HELD, ...input });
  }
  return reached;
}

function everyDestructible(level: Level): ReadonlySet<number> {
  return new Set(
    level.cells.flatMap((cell, index) => (cell?.kind === 'destructible' ? [index] : [])),
  );
}

// Seven cells by five, which is the smallest that leaves a bat room to move and a brick room to sit.
const PLAIN = ['-......', '.......', '...d...', '.......', '.......'];

const panels: readonly Panel[] = [
  {
    name: 'Level background',
    role: 'The void everything else sits on',
    note: 'The one panel not drawn by the renderer — the void is not an element the domain models',
  },
  {
    name: 'Boundary / wall',
    role: 'Marks the closed level without competing with play elements',
    note: 'Its bat, ball and brick are in frame because a level cannot be built without them',
    rows: PLAIN,
  },
  {
    name: 'Ball',
    role: 'The one thing that must read first, everywhere, at any speed',
    note: 'Launched and left to travel, so it is out in the open rather than resting on its bat',
    rows: PLAIN,
    arrange: (state) => after(after(state, 1, { launch: true }), 40, {}),
  },
  {
    name: 'Destructible brick',
    role: 'The objective — what clearing removes',
    // Row 1 is left clear: a brick directly under the bat would be where the held ball rests.
    rows: ['-......', '.......', '.ddddd.', '.ddddd.', '.......'],
  },
  {
    name: 'Permanent brick',
    role: 'Reads as structure, not as a target',
    note: 'The single green brick is the one DS-1.8 requires — and it is the comparison the spec asks for',
    rows: ['-......', '.......', '.ppppp.', '.ppppp.', '......d'],
  },
  {
    name: 'Horizontal bats',
    role: 'One control group',
    note: 'Driven right by real steps, so it sits where the player could put it',
    rows: PLAIN,
    arrange: (state) => after(state, 23, { right: true }),
  },
  {
    name: 'Vertical bats',
    role: 'The other control group — told apart from horizontal by hue alone',
    note: 'Driven down by real steps',
    rows: ['|......', '.......', '...d...', '.......', '.......'],
    arrange: (state) => after(state, 23, { down: true }),
  },
  {
    name: 'CLEARED',
    role: 'What a cleared level says — spec-style.md’s typography section',
    note: 'Shown at its own size, because the whole decision is how the type reads',
    rows: ['-...........', '............', '....dddd....', '............', '............'],
    arrange: (state) => ({ ...state, destroyed: everyDestructible(state.level) }),
    wide: true,
  },
];

const PLAIN_WIDTH = 224;
const PLAIN_HEIGHT = 160;

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

const gallery = required('#gallery');

for (const panel of panels) {
  const canvas = document.createElement('canvas');

  if (panel.rows === undefined) {
    canvas.width = PLAIN_WIDTH;
    canvas.height = PLAIN_HEIGHT;
    const context = context2dOf(canvas);
    context.fillStyle = BACKGROUND;
    context.fillRect(0, 0, canvas.width, canvas.height);
  } else {
    const started = createGameState(levelFromRows(panel.rows), 0);
    const state = panel.arrange ? panel.arrange(started) : started;
    const extent = boundaryOf(state);
    canvas.width = extent.width;
    canvas.height = extent.height;
    draw(context2dOf(canvas), state);
  }

  const figure = document.createElement('figure');
  if (panel.wide) figure.className = 'wide';
  figure.append(canvas);

  const caption = document.createElement('figcaption');
  const name = document.createElement('span');
  name.className = 'name';
  name.textContent = panel.name;
  const role = document.createElement('span');
  role.className = 'role';
  role.textContent = panel.role;
  caption.append(name, role);

  if (panel.note) {
    const note = document.createElement('span');
    note.className = 'note';
    note.textContent = panel.note;
    caption.append(note);
  }

  figure.append(caption);
  gallery.append(figure);
}
