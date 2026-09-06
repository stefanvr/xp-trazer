/**
 * A level — doc/spec-domain.md. Pure functions over plain types, importing nothing.
 *
 * A level is a grid of cells, and a cell is either empty or holds one element. An element the rules
 * read occupies exactly one cell, so every surface in a level is a cell face — which is what makes
 * **DS-2.4**'s reflection exact rather than approximate.
 *
 * A level also authors its bats: **DS-1.2**, and **DS-1.3** — a level has at least one, or the ball
 * has nothing to be held by.
 *
 * **What a level places is `elements`; what the rules read is `cells`.** Everything **DS-7** carries
 * lives in the first — a kind no rule gives behaviour to (**DS-7.1**), a footprint larger than one
 * cell (**DS-7.2**), a color id (**DS-7.3**) — and the grid is derived from it, holding only the
 * one-cell bricks the rules can read. That is the whole of the difference between the two, and it is
 * why nothing carried is dropped and nothing carried reaches a rule.
 */

/** A cell has a fixed size, so a level's extent follows from its grid — doc/spec-domain.md. */
export const CELL_PIXELS = 32;

/** **Every bat is the same length** — doc/spec-domain.md. How long is this module's to say. */
export const BAT_LENGTH_CELLS = 3;
export const BAT_LENGTH_PIXELS = BAT_LENGTH_CELLS * CELL_PIXELS;

export type BrickKind = 'destructible' | 'permanent';

/**
 * The five kinds **DS-7.1** carries. A level may place one; it occupies its cells and nothing else
 * about it is true — it is not a brick, so **DS-4.2**, **DS-4.3** and **DS-5.1** say nothing about
 * it.
 */
export type UnbehavedKind =
  | 'glassRefractor'
  | 'monsterGenerator'
  | 'horizontalTrap'
  | 'verticalTrap'
  | 'bumper';

export type ElementKind = BrickKind | UnbehavedKind;

export const UNBEHAVED_KINDS: readonly UnbehavedKind[] = [
  'glassRefractor',
  'monsterGenerator',
  'horizontalTrap',
  'verticalTrap',
  'bumper',
];

export function isBrickKind(kind: ElementKind): kind is BrickKind {
  return kind === 'destructible' || kind === 'permanent';
}

/**
 * What an element or a level is authored to be colored — **DS-7.3**. An id and not a color;
 * doc/spec-style.md says what an id is drawn in, and today nothing does. `undefined` is a level that
 * authored none, which the two hand-authored levels are.
 */
export type ColorId = number | undefined;

/** The cells one element occupies — **DS-7.2**. One by one is the only footprint a rule reads. */
export type Footprint = { readonly columns: number; readonly rows: number };

export const ONE_CELL: Footprint = { columns: 1, rows: 1 };

/**
 * A fixed thing a level places, where it places it. Anchored at its top-left cell, which is where
 * the export the rooms come from puts it.
 */
export type PlacedElement = {
  readonly kind: ElementKind;
  readonly column: number;
  readonly row: number;
  readonly footprint: Footprint;
  readonly colorId: ColorId;
};

/**
 * What a cell holds: a brick, and only ever one that occupies exactly that cell. Everything else a
 * level places is in `elements` and reaches no rule.
 */
export type Element = { readonly kind: BrickKind; readonly colorId: ColorId };

/** A cell is either empty or holds one element. */
export type Cell = Element | undefined;

/** Which axis a bat lies along, and therefore which axis its group moves on — **DS-3.2**. */
export type Orientation = 'horizontal' | 'vertical';

export type Bat = {
  readonly orientation: Orientation;
  /** The row a horizontal bat lies on; the column a vertical one lies on. */
  readonly line: number;
  /** Where the bat's low end sits along its own axis, in pixels. Continuous — doc/spec-domain.md. */
  readonly position: number;
};

/** Where a level authors the ball to start, in cells — **DS-7.4**. Nothing reads it. */
export type BallStart = { readonly column: number; readonly row: number };

/** Which room of the original a level was imported from — **DS-7.6**. Nothing reads it. */
export type Origin = { readonly room: number };

export type Level = {
  readonly columns: number;
  readonly rows: number;
  /** Everything the level places, whether or not a rule reads it. */
  readonly elements: readonly PlacedElement[];
  /** Row-major, of length `columns * rows`. Derived from `elements` — see this module's head. */
  readonly cells: readonly Cell[];
  readonly bats: readonly Bat[];
  /** The level's own color id — **DS-7.3**. */
  readonly colorId: ColorId;
  /** **DS-7.4**, or `undefined` where the level authors no start. */
  readonly ballStart: BallStart | undefined;
  /** **DS-7.6**, or `undefined` where the level came from nowhere. */
  readonly origin: Origin | undefined;
};

export type Extent = { readonly width: number; readonly height: number };

export function extentOf(level: Level): Extent {
  return { width: level.columns * CELL_PIXELS, height: level.rows * CELL_PIXELS };
}

/** Empty outside the grid, so a caller need not bounds-check before asking. */
export function elementAt(level: Level, column: number, row: number): Cell {
  if (column < 0 || column >= level.columns) return undefined;
  if (row < 0 || row >= level.rows) return undefined;
  return level.cells[row * level.columns + column];
}

/** Every destructible element a level authors. */
export function destructibleCount(level: Level): number {
  return level.cells.filter((cell) => cell?.kind === 'destructible').length;
}

/** Every destructible element still standing. **DS-5.1** is asked of this. */
export function destructibleRemaining(level: Level, destroyed: ReadonlySet<number>): number {
  let standing = 0;
  for (const [index, cell] of level.cells.entries()) {
    if (cell?.kind === 'destructible' && !destroyed.has(index)) standing += 1;
  }
  return standing;
}

/**
 * Authors a level from one character per cell.
 *
 * **The format is implementation, not specification.** doc/spec-domain.md says a level is a grid
 * whose cells hold elements and that it authors its bats; how one is written down is this module's
 * business, and a different format would change nothing the specification claims.
 *
 * `.` empty · `d` destructible brick · `p` permanent brick · `-` a horizontal bat's low end ·
 * `|` a vertical bat's low end. A bat glyph leaves its cell empty: a bat is not an element.
 */
const ELEMENT_FOR_GLYPH = new Map<string, BrickKind>([
  ['d', 'destructible'],
  ['p', 'permanent'],
]);
const ORIENTATION_FOR_GLYPH = new Map<string, Orientation>([
  ['-', 'horizontal'],
  ['|', 'vertical'],
]);
const EMPTY_GLYPH = '.';

/** What a level is made of, before the grid the rules read is derived from it. */
export type LevelParts = {
  readonly columns: number;
  readonly rows: number;
  readonly elements: readonly PlacedElement[];
  readonly bats: readonly Bat[];
  readonly colorId?: ColorId;
  readonly ballStart?: BallStart | undefined;
  readonly origin?: Origin | undefined;
};

/**
 * Builds a level from what it places, deriving the grid the rules read.
 *
 * **A cell holds an element only where a rule can read it**: a brick, one cell, inside the grid.
 * A kind with no behaviour (**DS-7.1**) and a footprint larger than one cell (**DS-7.2**) stay in
 * `elements` and reach nothing — which is what carrying them means. `unplayableReasons` is what
 * makes that answerable rather than invisible.
 *
 * It refuses none of it. A level assembled here may break **DS-1.3**, **DS-1.7** or **DS-1.8**;
 * those are questions about whether it can be played, and a level that cannot be played is still
 * imported rather than dropped.
 */
export function levelFrom(parts: LevelParts): Level {
  const { columns, rows, elements, bats } = parts;
  if (rows <= 0) throw new Error('a level needs at least one row');
  if (columns <= 0) throw new Error('a level needs at least one column');

  const cells: Cell[] = Array.from({ length: columns * rows }, () => undefined);
  for (const element of elements) {
    if (!isBrickKind(element.kind)) continue;
    if (element.footprint.columns !== 1 || element.footprint.rows !== 1) continue;
    if (element.column < 0 || element.column >= columns) continue;
    if (element.row < 0 || element.row >= rows) continue;
    cells[element.row * columns + element.column] = {
      kind: element.kind,
      colorId: element.colorId,
    };
  }

  return {
    columns,
    rows,
    elements,
    cells,
    bats,
    colorId: parts.colorId,
    ballStart: parts.ballStart,
    origin: parts.origin,
  };
}

export function levelFromRows(rows: readonly string[]): Level {
  const first = rows[0];
  if (first === undefined) throw new Error('a level needs at least one row');

  const columns = first.length;
  if (columns === 0) throw new Error('a level needs at least one column');

  const elements: PlacedElement[] = [];
  const bats: Bat[] = [];

  for (const [row, line] of rows.entries()) {
    if (line.length !== columns) {
      throw new Error(`row ${row} is ${line.length} cells wide; row 0 is ${columns}`);
    }
    for (const [column, glyph] of [...line].entries()) {
      const orientation = ORIENTATION_FOR_GLYPH.get(glyph);
      if (orientation !== undefined) {
        bats.push({
          orientation,
          line: orientation === 'horizontal' ? row : column,
          position: (orientation === 'horizontal' ? column : row) * CELL_PIXELS,
        });
        continue;
      }
      if (glyph === EMPTY_GLYPH) continue;

      const kind = ELEMENT_FOR_GLYPH.get(glyph);
      if (kind === undefined) throw new Error(`unknown cell glyph ${JSON.stringify(glyph)}`);
      elements.push({ kind, column, row, footprint: ONE_CELL, colorId: undefined });
    }
  }

  if (bats.length === 0) throw new Error('a level has at least one bat (DS-1.3)');

  return levelFrom({ columns, rows: rows.length, elements, bats });
}
