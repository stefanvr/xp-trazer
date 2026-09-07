/**
 * The concessions that let an imported room be played before every rule it needs exists.
 *
 * **The import stays faithful and this is where fidelity is given up**, deliberately and in one
 * place. `rooms.generated.ts` holds what the original actually places; nothing is dropped there, so
 * every concession below can be withdrawn by deleting a line rather than by importing again.
 *
 * **Every concession here is temporary, and each one is listed in
 * `doc/spec-domain-porting-todo.md`** with what would end it. A concession with no entry there is a
 * rule being decided in code, which is the thing the import is not allowed to do.
 *
 * What it does not touch: two elements sharing a cell (**DS-4.4**), which leaves room 29 unplayable
 * because a cell holding two elements has no answer for which one was met. A bat standing free of
 * both its perpendicular sides was the other, and is not a problem any more — **DS-7.5** and the
 * **DS-1.6** that gave it force are both withdrawn.
 */

import { levelFrom, type ElementKind, type Level, type PlacedElement } from '../domain/level';
import type { ImportedRoom } from './room-notation';

/**
 * What becomes of an element of a kind no rule gives behaviour to — **DS-7.1**.
 *
 * `undefined` is a kind left out of the played level altogether: the room is played with a hole
 * where it stood. The others stand in the level as the kind named, keeping their footprint, their
 * place and their color id.
 */
const PORTED_KIND: Partial<Record<ElementKind, ElementKind | undefined>> = {
  glassRefractor: undefined,
  monsterGenerator: 'permanent',
  bumper: 'permanent',
};

/**
 * The one place this concession is decided — exported so a second caller (`dev/elements.ts`'s test
 * bed) can show what it does without holding a second copy of the table. A kind not in it is not a
 * concession at all, and passes through unchanged.
 */
export function portedKind(kind: ElementKind): ElementKind | undefined {
  return kind in PORTED_KIND ? PORTED_KIND[kind] : kind;
}

function ported(element: PlacedElement): PlacedElement | undefined {
  const kind = portedKind(element.kind);
  return kind === undefined ? undefined : { ...element, kind };
}

/**
 * The level a room is played as, which is not the room as imported.
 *
 * **The ball start is kept.** It used to be dropped, which was **P-1** — the concession that stood
 * in for a rule that would read it. **DS-1.4** is that rule, so there is nothing left to concede and
 * the room's own start is where the ball waits.
 */
export function portedLevel(room: ImportedRoom): Level {
  const elements = room.elements.flatMap((element) => {
    const kept = ported(element);
    return kept === undefined ? [] : [kept];
  });

  return levelFrom({ ...room, elements });
}
