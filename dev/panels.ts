import {
  levelFrom,
  UNBEHAVED_KINDS,
  type Bat,
  type ElementKind,
  type Footprint,
  type Level,
  type PlacedElement,
} from '../src/domain/level';
import { portedKind } from '../src/levels/porting';
import { OBJECT_KINDS } from '../src/import/convert';

/**
 * The levels `dev/elements.html` plays, one per object kind the original has.
 *
 * **Separate from the page so that a panel's level is plain state.** doc/spec-tech.md's **A-1** puts
 * behaviour outside the surface, and what a panel is made of is behaviour: it obeys **DS-1.3**,
 * **DS-1.4** and **DS-1.8** exactly as a room does, and it is asserted in `panels.test.ts` in
 * milliseconds. `dev/elements.ts` is then the DOM half alone. The pages were once written the other
 * way round, and both of them broke on a rule they were never brought to.
 */

// Room for the widest kind the original has (three columns) beside the anchor brick, and wide
// enough that CLEARED_WORD is not clipped — at ten columns it read as "LEARE".
const COLUMNS = 12;
const ROWS = 6;
// The bat's low end sits at column 0 and spans three cells, so column 1 is under its middle —
// where a held ball rests. Pressing Space with no steering meets this brick, the same way
// `src/levels/clearing-proof.ts` puts its one brick under the bat with nothing to steer.
const ANCHOR_COLUMN = 1;
const ANCHOR_ROW = 3;
// Away from the bat's resting column, so reaching the kind under test takes steering right first —
// exercising the bats as well as the ball, rather than everything happening on one keypress. Row 1
// leaves the tallest kind (four rows) clear of the bat's own row.
const UNDER_TEST_COLUMN = 6;
const UNDER_TEST_ROW = 1;

export type Panel = {
  readonly label: string;
  readonly kind: ElementKind;
  readonly footprint: Footprint;
};

/**
 * One panel per object the original has — the import's table is the list, so the two bricks appear
 * as the two shapes they are and nothing here decides what the inventory is.
 */
export const PANELS: readonly Panel[] = [...OBJECT_KINDS.values()];

/** What sits under the bat in every panel: the commonest shape the original has. */
function named(label: string): Panel {
  const found = PANELS.find((panel) => panel.label === label);
  if (found === undefined) throw new Error(`the import no longer names ${label}`);
  return found;
}

const ANCHOR = named('Horizontal brick');

/**
 * One level per panel, always with a bat on the last row (its low end at column 0, so **DS-1.6**'s
 * blocked side is the boundary) and always with a horizontal brick — **DS-1.8** — under the bat's
 * resting column, so Space alone clears it with nothing steered.
 *
 * The object under test sits away from that column, reachable by steering the bat there first — as
 * whatever `portedKind` turns it into, keeping the footprint the original gave it. For the two
 * bricks and the solid block that is the kind itself; for the five **DS-7.1** kinds it is what
 * `src/levels/porting.ts` actually does with them, so a level here is never one this page invented
 * a behaviour for. The horizontal brick's own panel adds nothing, because the anchor already is one.
 *
 * **The ball starts on the bat's resting middle — DS-1.4.** A level that authors no start is not a
 * level with the ball somewhere sensible; it is one `heldAt` refuses, which is what these panels
 * used to be.
 */
export function levelFor(panel: Panel): Level {
  const elements: PlacedElement[] = [
    {
      kind: ANCHOR.kind,
      column: ANCHOR_COLUMN,
      row: ANCHOR_ROW,
      footprint: ANCHOR.footprint,
      colorId: undefined,
    },
  ];

  const after = portedKind(panel.kind);
  const isTheAnchorItself =
    panel.kind === ANCHOR.kind &&
    panel.footprint.columns === ANCHOR.footprint.columns &&
    panel.footprint.rows === ANCHOR.footprint.rows;

  if (after !== undefined && !isTheAnchorItself) {
    elements.push({
      kind: after,
      column: UNDER_TEST_COLUMN,
      row: UNDER_TEST_ROW,
      footprint: panel.footprint,
      colorId: undefined,
    });
  }

  const bats: Bat[] = [{ orientation: 'horizontal', line: ROWS - 1, position: 0 }];

  return levelFrom({
    columns: COLUMNS,
    rows: ROWS,
    elements,
    bats,
    ballStart: { column: ANCHOR_COLUMN, row: ROWS - 2 },
  });
}

// Sanity against DS-7.1's own list, so a sixth unbehaved kind added there is a panel missing here
// rather than one silently never reached.
for (const kind of UNBEHAVED_KINDS) {
  if (!PANELS.some((panel) => panel.kind === kind)) {
    throw new Error(`doc/spec-domain.md's DS-7.1 names ${kind}; the import places no such object`);
  }
}
