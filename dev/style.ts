import { createGameState, boundaryOf, type GameState } from '../src/domain/simulation';
import { levelFromRows, type Level } from '../src/domain/level';
import { draw, drawGameOver } from '../src/render/draw';
import {
  BACKGROUND,
  BALL,
  BOUNDARY,
  DESTRUCTIBLE_BRICK,
  HORIZONTAL_BAT,
  PERMANENT_BRICK,
  TRAP,
  VERTICAL_BAT,
} from '../src/render/palette';

/**
 * The `preview` skill's page: doc/spec-style.md's palette table, as a table, and the one word its
 * typography section decides.
 *
 * **Every colour is the real value from src/render/palette.ts** — imported, never re-typed — so a
 * row's swatch can never show a colour the game does not paint with. A swatch is a flat chip with a
 * CSS glow standing in for the canvas `shadowBlur` the real renderer uses: a table row is not a
 * canvas, and the point of this page is the colours, not a second, smaller game.
 *
 * **Typography is the one thing a chip cannot show.** CLEARED and the game-over score are both text,
 * so those two panels still call the real renderer — `draw()` against a real, cleared `GameState` for
 * the first, and `draw()` beside the real `drawGameOver()` for the second — the only rendering this
 * page still does.
 */

type Row = { readonly name: string; readonly role: string; readonly color: string };

/** One row per line of doc/spec-style.md's palette table, in the document's own order. */
const PALETTE: readonly Row[] = [
  { name: 'Level background', role: 'The void everything else sits on', color: BACKGROUND },
  {
    name: 'Boundary / wall',
    role: 'Marks the closed level without competing with play elements',
    color: BOUNDARY,
  },
  { name: 'Ball', role: 'The one thing that must read first, everywhere, at any speed', color: BALL },
  {
    name: 'Destructible brick',
    role: 'The objective — what clearing removes',
    color: DESTRUCTIBLE_BRICK,
  },
  {
    name: 'Permanent brick',
    role: 'Reads as structure, not as a target',
    color: PERMANENT_BRICK,
  },
  { name: 'Horizontal bats', role: 'One control group', color: HORIZONTAL_BAT },
  {
    name: 'Vertical bats',
    role: 'The other control group, told apart from horizontal by hue alone',
    color: VERTICAL_BAT,
  },
  { name: 'Trap', role: 'The one hazard colour in the palette', color: TRAP },
];

function required<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) throw new Error(`the document is missing ${selector}`);
  return element;
}

const body = required('#palette tbody');

for (const row of PALETTE) {
  const tr = document.createElement('tr');

  const swatchCell = document.createElement('td');
  const swatch = document.createElement('span');
  swatch.className = 'swatch';
  swatch.style.setProperty('--swatch', row.color);
  swatchCell.append(swatch);

  const nameCell = document.createElement('td');
  nameCell.textContent = row.name;

  const roleCell = document.createElement('td');
  roleCell.textContent = row.role;

  tr.append(swatchCell, nameCell, roleCell);
  body.append(tr);
}

// Typography — the one word a cleared level shows, drawn by the real renderer against a real,
// cleared GameState, since a colour chip has no face, size or tracking to show.
function everyDestructible(level: Level): ReadonlySet<number> {
  return new Set(
    level.cells.flatMap((cell) => (cell?.kind === 'destructible' ? [cell.element] : [])),
  );
}

function context2dOf(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const context = canvas.getContext('2d');
  if (!context) throw new Error('this browser has no 2d canvas context');
  return context;
}

const clearedLevel = levelFromRows(['-...........', '.*..........', '....dddd....', '............', '............']);
const clearedState: GameState = {
  ...createGameState(clearedLevel, 0),
  destroyed: everyDestructible(clearedLevel),
};

const clearedCanvas = required<HTMLCanvasElement>('#cleared');
const clearedExtent = boundaryOf(clearedState);
clearedCanvas.width = clearedExtent.width;
clearedCanvas.height = clearedExtent.height;
draw(context2dOf(clearedCanvas), clearedState);

// Game over — the same level, played but not cleared, with the run's score drawn over it the way
// drawGameOver actually draws it: a separate call, over draw()'s own, never inside it.
const gameOverState = createGameState(clearedLevel, 0);
const gameOverCanvas = required<HTMLCanvasElement>('#game-over');
const gameOverExtent = boundaryOf(gameOverState);
gameOverCanvas.width = gameOverExtent.width;
gameOverCanvas.height = gameOverExtent.height;
const gameOverContext = context2dOf(gameOverCanvas);
draw(gameOverContext, gameOverState);
drawGameOver(gameOverContext, gameOverExtent.width, gameOverExtent.height, 3);
