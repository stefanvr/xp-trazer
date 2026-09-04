/**
 * A level — doc/spec-domain.md. Pure functions over plain types, importing nothing.
 *
 * A level is a grid of cells, and a cell is either empty or holds one element. Every element
 * occupies exactly one cell, so every surface in a level is a cell face — which is what makes
 * **DS-2.4**'s reflection exact rather than approximate.
 *
 * A level also authors its bats: **DS-1.2**, and **DS-1.3** — a level has at least one, or the ball
 * has nothing to be held by.
 */

/** A cell has a fixed size, so a level's extent follows from its grid — doc/spec-domain.md. */
export const CELL_PIXELS = 32;

/** **Every bat is the same length** — doc/spec-domain.md. How long is this module's to say. */
export const BAT_LENGTH_CELLS = 3;
export const BAT_LENGTH_PIXELS = BAT_LENGTH_CELLS * CELL_PIXELS;

export type BrickKind = 'destructible' | 'permanent';

/** A fixed thing a level places. In version one, every element is a brick. */
export type Element = { readonly kind: BrickKind };

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

export type Level = {
  readonly columns: number;
  readonly rows: number;
  /** Row-major, of length `columns * rows`. */
  readonly cells: readonly Cell[];
  readonly bats: readonly Bat[];
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

/** Every destructible element still standing. **DS-5.1** is asked of this. */
export function destructibleCount(level: Level): number {
  return level.cells.filter((cell) => cell?.kind === 'destructible').length;
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
const ELEMENT_FOR_GLYPH = new Map<string, Element>([
  ['d', { kind: 'destructible' }],
  ['p', { kind: 'permanent' }],
]);
const ORIENTATION_FOR_GLYPH = new Map<string, Orientation>([
  ['-', 'horizontal'],
  ['|', 'vertical'],
]);
const EMPTY_GLYPH = '.';

export function levelFromRows(rows: readonly string[]): Level {
  const first = rows[0];
  if (first === undefined) throw new Error('a level needs at least one row');

  const columns = first.length;
  if (columns === 0) throw new Error('a level needs at least one column');

  const cells: Cell[] = [];
  const bats: Bat[] = [];

  for (const [row, line] of rows.entries()) {
    if (line.length !== columns) {
      throw new Error(`row ${row} is ${line.length} cells wide; row 0 is ${columns}`);
    }
    for (const [column, glyph] of [...line].entries()) {
      const orientation = ORIENTATION_FOR_GLYPH.get(glyph);
      if (orientation !== undefined) {
        cells.push(undefined);
        bats.push({
          orientation,
          line: orientation === 'horizontal' ? row : column,
          position: (orientation === 'horizontal' ? column : row) * CELL_PIXELS,
        });
        continue;
      }
      if (glyph === EMPTY_GLYPH) {
        cells.push(undefined);
        continue;
      }
      const element = ELEMENT_FOR_GLYPH.get(glyph);
      if (element === undefined) throw new Error(`unknown cell glyph ${JSON.stringify(glyph)}`);
      cells.push(element);
    }
  }

  if (bats.length === 0) throw new Error('a level has at least one bat (DS-1.3)');

  return { columns, rows: rows.length, cells, bats };
}
