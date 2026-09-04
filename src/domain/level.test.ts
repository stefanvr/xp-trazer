import { describe, expect, it } from 'vitest';
import {
  CELL_PIXELS,
  destructibleCount,
  elementAt,
  extentOf,
  levelFromRows,
} from './level';

/** Tests are named as the behaviour claimed, not as the function under test — guide-design.md. */

describe('a level authored from rows', () => {
  it('is as wide and as tall as the rows it was written with', () => {
    const level = levelFromRows(['...', '...']);

    expect(level.columns).toBe(3);
    expect(level.rows).toBe(2);
  });

  it('puts each element in the cell its glyph sat in', () => {
    const level = levelFromRows(['.d.', 'p..']);

    expect(elementAt(level, 1, 0)).toEqual({ kind: 'destructible' });
    expect(elementAt(level, 0, 1)).toEqual({ kind: 'permanent' });
  });

  it('leaves a cell empty where nothing was written', () => {
    const level = levelFromRows(['.d.']);

    expect(elementAt(level, 0, 0)).toBeUndefined();
    expect(elementAt(level, 2, 0)).toBeUndefined();
  });
});

describe('a level that cannot be read', () => {
  it('fails loudly on rows of different widths', () => {
    expect(() => levelFromRows(['...', '..'])).toThrow(/row 1 is 2 cells wide/);
  });

  it('fails loudly on a glyph that names nothing', () => {
    expect(() => levelFromRows(['.x.'])).toThrow(/unknown cell glyph/);
  });

  it('fails loudly on no rows at all', () => {
    expect(() => levelFromRows([])).toThrow(/at least one row/);
  });

  it('fails loudly on a row with no cells', () => {
    expect(() => levelFromRows([''])).toThrow(/at least one column/);
  });
});

describe('asking about a cell outside the grid', () => {
  it('answers empty rather than failing, so callers need not bounds-check', () => {
    const level = levelFromRows(['d']);

    expect(elementAt(level, -1, 0)).toBeUndefined();
    expect(elementAt(level, 1, 0)).toBeUndefined();
    expect(elementAt(level, 0, -1)).toBeUndefined();
    expect(elementAt(level, 0, 1)).toBeUndefined();
  });
});

describe("a level's extent", () => {
  it('follows from its grid and the fixed cell size', () => {
    const level = levelFromRows(['...', '...']);

    expect(extentOf(level)).toEqual({ width: 3 * CELL_PIXELS, height: 2 * CELL_PIXELS });
  });
});

describe('counting what clearing is waiting for', () => {
  it('counts the destructible elements and ignores the permanent ones', () => {
    const level = levelFromRows(['dpd', '.p.']);

    expect(destructibleCount(level)).toBe(2);
  });

  it('is zero for a level with nothing to destroy', () => {
    expect(destructibleCount(levelFromRows(['ppp']))).toBe(0);
  });
});
