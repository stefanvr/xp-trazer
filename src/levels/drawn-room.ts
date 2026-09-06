/**
 * Which room the player is dropped into — doc/spec-app.md: one of the original's rooms, drawn at
 * random when the page opens, and only ever one the rules can play.
 *
 * **The draw is over the *played* level, not the imported room.** A room as imported carries what
 * **DS-7** holds and no rule reads, and every one of them authors where the ball starts, so no
 * imported room is playable as it stands. `portedLevel` is what a room is played as, and asking
 * `unplayableReasons` of that is the only question whose answer means *a player could be given
 * this*.
 *
 * **Nothing here decides what playable means.** It asks the domain, so a rule arriving — a trap
 * gaining behaviour, an authored ball start being read — widens this set in the same edit that adds
 * the rule, with nothing to remember to update here.
 */

import { unplayableReasons } from '../domain/playable';
import type { Level } from '../domain/level';
import { ROOMS } from './rooms.generated';
import { portedLevel } from './porting';

/**
 * Every room the player could be given, as it would be played.
 *
 * Computed once from the tree rather than listed: a list of room numbers would be a second place
 * the rules are decided, and it would go stale silently the day one of them changes.
 */
export const PLAYABLE_ROOMS: readonly Level[] = ROOMS.map(portedLevel).filter(
  (level) => unplayableReasons(level).length === 0,
);

/**
 * The room a given seed draws.
 *
 * Seeded rather than reaching for `Math.random`, which is guide-design.md's rule for anything
 * random: the edge supplies the seed, exactly as it does for **DS-1.4**'s draw of the bat that
 * holds the ball, and the same seed always gives the same room.
 */
export function roomDrawnFrom(seed: number): Level {
  const room = PLAYABLE_ROOMS[Math.abs(Math.trunc(seed)) % PLAYABLE_ROOMS.length];
  if (room === undefined) throw new Error('no room in the tree can be played');
  return room;
}
