/**
 * Version one's one authored level.
 *
 * One character per cell: `.` empty, `d` a destructible brick, `p` a permanent one, `-` and `|` the
 * low end of a horizontal or vertical bat. A target with a permanent core, set away from every edge
 * so a bat on any of the four can reach it.
 *
 * **Every bat sits against the level's edge**, which is what **DS-1.6** requires: a bat needs
 * something the ball cannot pass on one side, so that the side the ball rests and launches from is
 * decided rather than arbitrary.
 */
export const FIRST_LEVEL = [
  '........-...........',
  '....................',
  '....................',
  '.....dddddddddd.....',
  '.....d........d.....',
  '.....d..pppp..d.....',
  '|....d..pppp..d....|',
  '.....d........d.....',
  '.....dddddddddd.....',
  '....................',
  '....................',
  '....................',
  '....................',
  '....................',
  '........-...........',
] as const;
