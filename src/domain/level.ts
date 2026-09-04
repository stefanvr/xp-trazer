/**
 * A level — doc/spec-domain.md. Pure functions over plain types, importing nothing.
 *
 * A level is a grid of cells, and a cell is either empty or holds one element. Every element
 * occupies exactly one cell, so every surface in a level is a cell face — which is what makes
 * **DS-2.4**'s reflection exact rather than approximate.
 */

/** A cell has a fixed size, so a level's extent follows from its grid — doc/spec-domain.md. */
export const CELL_PIXELS = 32;

export type BrickKind = 'destructible' | 'permanent';

/** A fixed thing a level places. In version one, every element is a brick. */
export type Element = { readonly kind: BrickKind };

/** A cell is either empty or holds one element. */
export type Cell = Element | undefined;

export type Level = {
  readonly columns: number;
  readonly rows: number;
  /** Row-major, of length `columns * rows`. */
  readonly cells: readonly Cell[];
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
 * whose cells hold elements; how one is written down is this module's business, and a different
 * format would change nothing the specification claims.
 */
const ELEMENT_FOR_GLYPH = new Map<string, Element | undefined>([
  ['.', undefined],
  ['d', { kind: 'destructible' }],
  ['p', { kind: 'permanent' }],
]);

export function levelFromRows(rows: readonly string[]): Level {
  const first = rows[0];
  if (first === undefined) throw new Error('a level needs at least one row');

  const columns = first.length;
  if (columns === 0) throw new Error('a level needs at least one column');

  const cells: Cell[] = [];
  for (const [index, row] of rows.entries()) {
    if (row.length !== columns) {
      throw new Error(`row ${index} is ${row.length} cells wide; row 0 is ${columns}`);
    }
    for (const glyph of row) {
      if (!ELEMENT_FOR_GLYPH.has(glyph)) throw new Error(`unknown cell glyph ${JSON.stringify(glyph)}`);
      cells.push(ELEMENT_FOR_GLYPH.get(glyph));
    }
  }

  return { columns, rows: rows.length, cells };
}
