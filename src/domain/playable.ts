/**
 * Whether a level can be played, and where it is not — doc/spec-domain.md. Pure functions over
 * plain types, importing nothing outside the domain.
 *
 * **DS-7** carries what a level authored elsewhere holds and no rule reads, and says that a level
 * carrying **DS-7.1**, **DS-7.2**, **DS-7.4** or **DS-7.5** cannot be played, because the rule it
 * needs does not exist. This module is where that becomes an answer instead of a paragraph.
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
  elementAt,
  isBrickKind,
  type Bat,
  type Level,
} from './level';

/** Each reason names the rule that is not satisfied, so a citation resolves to spec-domain. */
export type UnplayableReason =
  | 'DS-1.3 the level authors no bat'
  | 'DS-1.7 two bats share a place, or one has less room to slide than its own length'
  | 'DS-1.8 the level authors no destructible element'
  | 'DS-7.1 the level places an element of a kind no rule gives behaviour to'
  | 'DS-7.2 the level places an element occupying more than one cell'
  | 'DS-7.4 the level authors where the ball starts'
  | 'DS-7.5 a bat has nothing on either of its perpendicular sides';

/** The line one cell to each perpendicular side of a bat, low side first. */
function perpendicularSides(bat: Bat): readonly number[] {
  return [bat.line - 1, bat.line + 1];
}

/**
 * How many of a bat's two perpendicular sides the ball cannot pass — **DS-1.6**. The level's edge is
 * what blocks a side today, and an element sitting on that line does the same; a bat standing free
 * of both is **DS-7.5**, carried and unplayable.
 */
function sidesBlocked(level: Level, bat: Bat): number {
  const acrossLimit = bat.orientation === 'horizontal' ? level.rows : level.columns;
  const along = bat.orientation === 'horizontal' ? level.columns : level.rows;

  let blocked = 0;
  for (const side of perpendicularSides(bat)) {
    if (side < 0 || side >= acrossLimit) {
      blocked += 1;
      continue;
    }
    for (let index = 0; index < along; index += 1) {
      const cell =
        bat.orientation === 'horizontal'
          ? elementAt(level, index, side)
          : elementAt(level, side, index);
      if (cell !== undefined) {
        blocked += 1;
        break;
      }
    }
  }
  return blocked;
}

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
 * Every rule the level does not satisfy. Empty is a level that can be played — nothing else is.
 *
 * The order is the order the rules are numbered in, so two levels' reasons read the same way.
 */
export function unplayableReasons(level: Level): readonly UnplayableReason[] {
  const reasons: UnplayableReason[] = [];

  if (level.bats.length === 0) reasons.push('DS-1.3 the level authors no bat');
  if (batsShareAPlace(level) || batHasNoRoom(level)) {
    reasons.push('DS-1.7 two bats share a place, or one has less room to slide than its own length');
  }
  if (destructibleCount(level) === 0) {
    reasons.push('DS-1.8 the level authors no destructible element');
  }
  if (level.elements.some((element) => !isBrickKind(element.kind))) {
    reasons.push('DS-7.1 the level places an element of a kind no rule gives behaviour to');
  }
  if (
    level.elements.some((element) => element.footprint.columns !== 1 || element.footprint.rows !== 1)
  ) {
    reasons.push('DS-7.2 the level places an element occupying more than one cell');
  }
  if (level.ballStart !== undefined) {
    reasons.push('DS-7.4 the level authors where the ball starts');
  }
  if (level.bats.some((bat) => sidesBlocked(level, bat) === 0)) {
    reasons.push('DS-7.5 a bat has nothing on either of its perpendicular sides');
  }

  return reasons;
}

export function isPlayable(level: Level): boolean {
  return unplayableReasons(level).length === 0;
}
