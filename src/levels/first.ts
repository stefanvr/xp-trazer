/**
 * Version one's one authored level — `doc/scope.md`.
 *
 * One character per cell: `.` empty, `d` a destructible brick, `p` a permanent one, `-` and `|` the
 * low end of a horizontal or vertical bat. A target with a permanent core, set away from every edge
 * so a bat on any of the four can reach it, and a bat on each axis.
 */
export const FIRST_LEVEL = [
  '....................',
  '........-...........',
  '....................',
  '.....dddddddddd.....',
  '.....d........d.....',
  '.....d..pppp..d.....',
  '.|...d..pppp..d...|.',
  '.....d........d.....',
  '.....dddddddddd.....',
  '....................',
  '....................',
  '....................',
  '....................',
  '........-...........',
  '....................',
] as const;
