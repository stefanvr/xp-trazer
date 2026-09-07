import { levelFrom, ONE_CELL, type Level } from '../domain/level';

/**
 * A level whose only purpose is to prove, on the surface, that a collision destroying nothing
 * reaches the page as the collision sound.
 *
 * **Nothing about it is left to chance, the same way as `clearing-proof.ts`, but for the opposite
 * outcome.** The ball starts in a corner, so the nearest thing to meet on most headings is the
 * boundary itself, within the first few steps whichever way **DS-2.2** sent it. Two destructible
 * bricks sit in the far corner instead, out of the ball's way for every heading but a sliver of
 * them — **two, not one**: a level with only one is cleared the moment a heading in that sliver
 * meets it, and **DS-5.2** stops a cleared level from ever advancing again, so the ball would meet
 * nothing further and this level would prove nothing on exactly the heading it was built to survive.
 * With a second brick left standing, destroying the first still leaves the room otherwise empty, so
 * the very next thing the ball can meet is the boundary. Either way a plain collision is reached in
 * bounded time, which a room the page might draw at random cannot promise: **DS-8** lets a trap send
 * the ball back to held, and a real room can now hold one on the only heading a fixed seed ever
 * draws, looping it back into the same trap forever rather than ever reaching a wall.
 *
 * **One bat**, out of the way in the last row, because **DS-1.3** wants one and nothing here uses
 * it.
 *
 * **Nobody plays this.** `doc/spec-tech.md`'s **A-2** records the seam that reaches it and why it
 * exists.
 */
export function collisionProofLevel(): Level {
  return levelFrom({
    columns: 8,
    rows: 8,
    elements: [
      { kind: 'destructible', column: 7, row: 7, footprint: ONE_CELL, colorId: undefined },
      { kind: 'destructible', column: 6, row: 7, footprint: ONE_CELL, colorId: undefined },
    ],
    bats: [{ orientation: 'horizontal', line: 7, position: 0 }],
    ballStart: { column: 0, row: 0 },
  });
}
