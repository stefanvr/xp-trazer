/**
 * Whether a level can be played, and where it is not — doc/spec-domain.md. Pure functions over
 * plain types, importing nothing outside the domain.
 *
 * **DS-7** carries what a level authored elsewhere holds and no rule reads, and says that a level
 * carrying **DS-7.1** cannot be played, because the rule it needs does not exist. This module is
 * where that becomes an answer instead of a paragraph.
 *
 * **DS-7.2, DS-7.4 and DS-7.5 were once answered here and are not any more**, which is this module
 * shrinking as intended: the first two gained rules that read them, and the third lost the rule that
 * gave it force when **DS-1.6** was withdrawn. **DS-7.1 itself now shrinks the same way, one kind at
 * a time**: a trap no longer produces this reason, because **DS-8** reads it — the reason still
 * fires for the three kinds that remain in DS-7.1's own table.
 *
 * **It is derived, never stored.** A level says what it places; whether that can be played follows
 * from the rules, so a level cannot carry a marker that has gone stale against them. When a rule
 * arrives, the reason it answers stops being produced here, and every level holding only that reason
 * becomes playable in the same edit.
 *
 * The **DS-1** reasons are here for the same purpose. They are not what **DS-7** carries; they are
 * what a level assembled from carried data can turn out to break, and a level that breaks one of
 * them is unplayable for a reason worth naming rather than for none.
 */

import {
  BAT_LENGTH_CELLS,
  CELL_PIXELS,
  destructibleCount,
  isReadableKind,
  type Bat,
  type Level,
} from './level';

/** Each reason names the rule that is not satisfied, so a citation resolves to spec-domain. */
export type UnplayableReason =
  | 'DS-1.3 the level authors no bat'
  | 'DS-1.4 the level authors no ball start'
  | 'DS-1.7 two bats share a place, or one has less room to slide than its own length'
  | 'DS-1.8 the level authors no destructible element'
  | 'DS-4.4 two elements share a cell'
  | 'DS-7.1 the level places an element of a kind no rule gives behaviour to';

/** Where a bat's low end sits along its own axis, counted in cells rather than pixels. */
function lowEndCell(bat: Bat): number {
  return Math.round(bat.position / CELL_PIXELS);
}

/** Two bats of one orientation on one line, closer than a bat is long, share a place — **DS-1.7**. */
function batsShareAPlace(level: Level): boolean {
  const byLine = new Map<string, number[]>();
  for (const bat of level.bats) {
    const key = `${bat.orientation}:${bat.line}`;
    const others = byLine.get(key) ?? [];
    if (others.some((other) => Math.abs(other - lowEndCell(bat)) < BAT_LENGTH_CELLS)) return true;
    byLine.set(key, [...others, lowEndCell(bat)]);
  }
  return false;
}

/** A bat whose own length does not fit on its line, or that hangs off the end of it — **DS-1.7**. */
function batHasNoRoom(level: Level): boolean {
  return level.bats.some((bat) => {
    const along = bat.orientation === 'horizontal' ? level.columns : level.rows;
    return along < BAT_LENGTH_CELLS || lowEndCell(bat) + BAT_LENGTH_CELLS > along;
  });
}

/**
 * Two elements placed on one cell — **DS-4.4**. Asked of what the level places rather than of the
 * grid, because the grid keeps only the last one placed and so cannot show the collision.
 *
 * Every kind counts, not only the ones the rules read: a brick sharing its cell with a bumper is as
 * unanswerable as two bricks sharing one.
 */
function elementsShareACell(level: Level): boolean {
  const taken = new Set<number>();
  for (const element of level.elements) {
    for (let row = element.row; row < element.row + element.footprint.rows; row += 1) {
      for (
        let column = element.column;
        column < element.column + element.footprint.columns;
        column += 1
      ) {
        const cell = row * level.columns + column;
        if (taken.has(cell)) return true;
        taken.add(cell);
      }
    }
  }
  return false;
}

/**
 * Every rule the level does not satisfy. Empty is a level that can be played — nothing else is.
 *
 * The order is the order the rules are numbered in, so two levels' reasons read the same way.
 */
export function unplayableReasons(level: Level): readonly UnplayableReason[] {
  const reasons: UnplayableReason[] = [];

  if (level.bats.length === 0) reasons.push('DS-1.3 the level authors no bat');
  if (level.ballStart === undefined) reasons.push('DS-1.4 the level authors no ball start');
  if (batsShareAPlace(level) || batHasNoRoom(level)) {
    reasons.push('DS-1.7 two bats share a place, or one has less room to slide than its own length');
  }
  if (destructibleCount(level) === 0) {
    reasons.push('DS-1.8 the level authors no destructible element');
  }
  if (elementsShareACell(level)) reasons.push('DS-4.4 two elements share a cell');
  if (level.elements.some((element) => !isReadableKind(element.kind))) {
    reasons.push('DS-7.1 the level places an element of a kind no rule gives behaviour to');
  }

  return reasons;
}

export function isPlayable(level: Level): boolean {
  return unplayableReasons(level).length === 0;
}
