import { levelFrom, ONE_CELL, type Level } from '../domain/level';

/**
 * A level whose only purpose is to prove, on the surface, that clearing reaches the page.
 *
 * Nothing about it is left to chance, and since **DS-2.2** draws the launch heading from the seed
 * that takes some arranging: **the ball starts in the brick's own cell**, so the first step it
 * travels meets the brick whichever way it was sent. doc/spec-domain.md contemplates a ball start
 * inside an element and refuses it, precisely because launching drives the ball straight into it —
 * which is a defect in a level someone plays and the whole mechanism in a level built to be cleared.
 *
 * **One destructible element**, so meeting it is clearing the level. **One bat**, because
 * **DS-1.3** wants one and nothing here uses it.
 *
 * **Nobody plays this.** `doc/spec-tech.md`'s **A-2** records the seam that reaches it and why it
 * exists.
 */
export function clearingProofLevel(): Level {
  return levelFrom({
    columns: 5,
    rows: 5,
    elements: [
      { kind: 'destructible', column: 2, row: 2, footprint: ONE_CELL, colorId: undefined },
    ],
    bats: [{ orientation: 'horizontal', line: 4, position: 0 }],
    ballStart: { column: 2, row: 2 },
  });
}
