/**
 * How an imported room is written down in the tree.
 *
 * **The format is implementation, not specification.** doc/spec-domain.md says what a level holds;
 * how one is written down is this module's business, exactly as the glyph rows in `level.ts` are.
 * These two helpers exist so that `rooms.generated.ts` can hold six thousand elements and still be
 * read and diffed — one element is one short line, and every field it carries is spelled out rather
 * than inferred from its kind.
 *
 * A room is a level's parts and not a level: the grid the rules read is derived by `levelFrom`, so
 * nothing derived is committed and nothing committed can disagree with it.
 */

import {
  CELL_PIXELS,
  levelFrom,
  type Bat,
  type ColorId,
  type ElementKind,
  type Level,
  type LevelParts,
  type Orientation,
  type PlacedElement,
} from '../domain/level.ts';

export type ImportedRoom = LevelParts & {
  readonly origin: { readonly room: number };
};

/** One element: what it is, the cell it is anchored at, the cells it occupies, its color id. */
export function element(
  kind: ElementKind,
  column: number,
  row: number,
  columns: number,
  rows: number,
  colorId: ColorId,
): PlacedElement {
  return { kind, column, row, footprint: { columns, rows }, colorId };
}

/** One bat, placed by the cell its low end sits in rather than by pixels. */
export function bat(orientation: Orientation, column: number, row: number): Bat {
  return {
    orientation,
    line: orientation === 'horizontal' ? row : column,
    position: (orientation === 'horizontal' ? column : row) * CELL_PIXELS,
  };
}

export function levelOf(room: ImportedRoom): Level {
  return levelFrom(room);
}
