/**
 * The one authored level.
 *
 * One character per cell: `.` empty, `d` a destructible brick, `p` a permanent one, `-` and `|` the
 * low end of a horizontal or vertical bat, `*` where the ball starts. A target with a permanent core,
 * set away from every edge so a bat on any of the four can reach it.
 *
 * **Nobody opens the page into this any more.** doc/spec-app.md drops the player into a room of the
 * original, drawn at random; this is the level this project authored for itself before it had any,
 * and it is kept as the one level here whose every cell was chosen rather than decoded.
 */
export const FIRST_LEVEL = [
  '........-...........',
  '.........*..........',
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
