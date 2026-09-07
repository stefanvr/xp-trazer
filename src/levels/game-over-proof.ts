import { levelFrom, ONE_CELL, type Level } from '../domain/level';

/**
 * A level whose only purpose is to prove, on the surface, that a run reaching game over reaches the
 * page — the same shape `clearing-proof.ts` uses for clearing, aimed at a trap instead of a brick.
 *
 * **The ball starts in the trap's own cell**, so the first step it travels meets the trap whichever
 * way it was sent — every launch costs a life, deterministically, without steering anything.
 *
 * **One destructible element elsewhere**, never reachable: **DS-1.8** wants one, and the level must
 * never clear out from under a test that means to run it to game over. **One bat**, because **DS-1.3**
 * wants one and nothing here uses it.
 *
 * **Nobody plays this.** `doc/spec-tech.md`'s **A-2** records the seam that reaches it and why it
 * exists.
 */
export function gameOverProofLevel(): Level {
  return levelFrom({
    columns: 5,
    rows: 5,
    elements: [
      { kind: 'horizontalTrap', column: 2, row: 2, footprint: ONE_CELL, colorId: undefined },
      { kind: 'destructible', column: 0, row: 0, footprint: ONE_CELL, colorId: undefined },
    ],
    bats: [{ orientation: 'horizontal', line: 4, position: 0 }],
    ballStart: { column: 2, row: 2 },
  });
}
