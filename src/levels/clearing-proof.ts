/**
 * A level whose only purpose is to prove, on the surface, that clearing reaches the page.
 *
 * Nothing about it is left to chance. **One bat**, so DS-1.4's draw from the seed has a single
 * candidate and the seed stops mattering. **One destructible element**, in the column the resting
 * ball sits under — a horizontal bat's low end at column 0 puts the ball at the middle of column 1
 * — so DS-2.2's launch, straight away from the bat, meets it head on with nothing in between.
 *
 * The bat is on the last row, which is what DS-1.6 wants: exactly one side blocked, so *away* is
 * decided rather than arbitrary.
 *
 * **Nobody plays this.** The authored level is `first.ts`; `doc/spec-tech.md` records the seam that
 * reaches this one and why it exists.
 */
export const CLEARING_PROOF_LEVEL = [
  '.....',
  '.d...',
  '.....',
  '.....',
  '-....',
] as const;
