import { describe, expect, it } from 'vitest';

import { levelFor, PANELS } from './panels';
import { heldAt } from '../src/domain/ball';
import { BAT_LENGTH_PIXELS, isReadableKind } from '../src/domain/level';
import { unplayableReasons } from '../src/domain/playable';
import { portedKind } from '../src/levels/porting';

/**
 * `dev/elements.html` is a dev page, and this is not a test of the page — it is a test of the levels
 * the page builds, which are plain state and are where the page's one real claim lives: that a panel
 * is a *real, playable* level, driven by the same loop `src/main.ts` runs.
 *
 * **It exists because the page was broken for two landings and nothing said so.** **DS-1.4** arrived
 * with goal 4 and made a ball start compulsory; these levels authored none, so the page threw before
 * it drew anything, and no test in the tree could tell — the end-to-end suite runs against the built
 * page, and dev pages are deliberately left out of the build.
 */
describe('the levels the elements page plays', () => {
  it('gives every panel a level the rules can actually play', () => {
    for (const panel of PANELS) {
      expect([panel.label, ...unplayableReasons(levelFor(panel))]).toEqual([panel.label]);
    }
  });

  it('holds the ball on the bat, so Space alone sends it into the anchor brick', () => {
    for (const panel of PANELS) {
      const level = levelFor(panel);
      const bat = level.bats[0];
      const held = heldAt(level);

      expect(bat).not.toBeUndefined();
      expect(held.x).toBeGreaterThanOrEqual(bat!.position);
      expect(held.x).toBeLessThanOrEqual(bat!.position + BAT_LENGTH_PIXELS);
    }
  });

  it('shows each kind as the concession leaves it, never as the raw kind', () => {
    for (const panel of PANELS) {
      const placed = levelFor(panel).elements.map((element) => element.kind);
      const after = portedKind(panel.kind);

      // A kind the concession drops leaves the anchor brick alone in the level; one it stands in for
      // appears as what it stands in as; a trap now reaches the canvas as itself. Either way no
      // still-unbehaved DS-7.1 kind ever does.
      expect(placed.filter((kind) => !isReadableKind(kind))).toEqual([]);
      if (after !== undefined) expect(placed).toContain(after);
    }
  });
});
