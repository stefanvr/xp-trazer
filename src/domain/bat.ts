import {
  BAT_LENGTH_PIXELS,
  CELL_PIXELS,
  elementAt,
  type Bat,
  type Level,
  type Orientation,
} from './level';

/**
 * How a bat group moves — doc/spec-domain.md **DS-3.1** to **DS-3.4**. Pure functions over plain
 * types.
 *
 * How fast is this module's to say; the specification says only that a group moves along its own
 * axis and stops at the boundary and at an element.
 */
export const BAT_PIXELS_PER_SECOND = 340;

/** The range a bat's low end may take along its own axis. */
export type Span = { readonly low: number; readonly high: number };

function cellsAlongAxis(level: Level, bat: Bat): number {
  return bat.orientation === 'horizontal' ? level.columns : level.rows;
}

/**
 * **DS-3.3** — whether a bat of the other orientation is lying across this cell of the bat's line.
 *
 * A bat is exactly one cell thick and sits square on its line, so it covers exactly one cell of any
 * line that crosses it — which is what lets a bat block another the same way an element does, at a
 * cell, rather than needing a geometry of its own. It covers that cell only while its length reaches
 * the crossing line, so the same pair blocks or does not as the other group slides.
 *
 * Bats of one orientation are never asked about: a group moves as one thing (**DS-3.1**), so its
 * members keep whatever distance the level gave them and can never close on each other.
 */
function crossedBy(bats: readonly Bat[], bat: Bat, index: number): boolean {
  const across = bat.line * CELL_PIXELS;

  return bats.some(
    (other) =>
      other.orientation !== bat.orientation &&
      other.line === index &&
      other.position < across + CELL_PIXELS &&
      other.position + BAT_LENGTH_PIXELS > across,
  );
}

function occupied(level: Level, bats: readonly Bat[], bat: Bat, index: number): boolean {
  if (crossedBy(bats, bat, index)) return true;

  return bat.orientation === 'horizontal'
    ? elementAt(level, index, bat.line) !== undefined
    : elementAt(level, bat.line, index) !== undefined;
}

/**
 * **DS-3.3** — a bat stops at the boundary, at an element and at another bat. All three are the same
 * question asked of one line: the free run of cells the bat sits in, less the bat's own length. A run
 * that ends at the grid's edge gives the boundary, one that ends at an occupied cell gives the
 * element, and one that ends at a cell another bat lies across gives the bat.
 *
 * `high` is below `low` where the run is shorter than a bat. Such a bat cannot move at all, and
 * `createGameState` refuses to start a level that authors one — **DS-1.7**.
 */
export function spanFor(level: Level, bats: readonly Bat[], bat: Bat): Span {
  const count = cellsAlongAxis(level, bat);
  const from = Math.floor(bat.position / CELL_PIXELS);

  let first = from;
  while (first - 1 >= 0 && !occupied(level, bats, bat, first - 1)) first -= 1;

  let last = from;
  while (last + 1 < count && !occupied(level, bats, bat, last + 1)) last += 1;

  return { low: first * CELL_PIXELS, high: (last + 1) * CELL_PIXELS - BAT_LENGTH_PIXELS };
}

/** How far one bat could travel of the distance asked for. */
function possibleFor(level: Level, bats: readonly Bat[], bat: Bat, delta: number): number {
  const span = spanFor(level, bats, bat);
  if (span.high < span.low) return 0;

  const clamped = Math.min(Math.max(bat.position + delta, span.low), span.high);
  return clamped - bat.position;
}

/**
 * Moves every bat of one orientation by the same amount — **DS-3.1**, a bat group moves as one
 * thing. **So the most constrained member limits every member**: where one bat has reached an
 * element and another has room, neither moves, because a group that let its members separate would
 * stop being one thing.
 *
 * Bats of the other orientation are untouched — **DS-3.2** — but they are read, because **DS-3.3**
 * stops a bat at one of them. The group that moves therefore sees the other group where it is now:
 * the two groups are moved one after the other, and the second is offered whatever the first left.
 * That is what keeps them apart when both are driven at once, and it makes moving right-then-down
 * differ from down-then-right by a step's travel where the two would otherwise cross — a price paid
 * for never having to undo an overlap.
 */
export function moveGroup(
  level: Level,
  bats: readonly Bat[],
  orientation: Orientation,
  delta: number,
): readonly Bat[] {
  if (delta === 0) return bats;

  let allowed = delta;
  for (const bat of bats) {
    if (bat.orientation !== orientation) continue;
    const possible = possibleFor(level, bats, bat, delta);
    allowed = delta > 0 ? Math.min(allowed, possible) : Math.max(allowed, possible);
  }

  if (allowed === 0) return bats;
  return bats.map((bat) =>
    bat.orientation === orientation ? { ...bat, position: bat.position + allowed } : bat,
  );
}
