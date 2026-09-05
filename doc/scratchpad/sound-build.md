# Build breakdown — the game is heard

**Working notes.** The breakdown for this goal, and nothing else — findings go in
`sound.md`, which runs the other way. **A task is removed once it is implemented**, so this file
always reads as what is left. Cleared when the goal lands.

**Kind of code:** product functionality, plus repair. Every behaviour below has a document that owns
it — DS-6 in `spec-domain.md`, the sound table in `spec-style.md`, Web Audio in `spec-tech.md`.

---

| Task | What makes it checkable |
|---|---|
| **1 · A step yields its events** | Unit, over plain state. A ball meeting the boundary yields one collision naming the boundary · a ball destroying a brick yields a collision with *destroyed* true **and** an element destroyed naming its cell · a step where nothing happens yields none · a bat moved into a travelling ball yields a collision |
| **2 · An event has a sound, or none** | Unit, pure. A collision that destroyed nothing → the collision sound · an element destroyed → the destruction sound · a collision that destroyed what it met → nothing |
| **3 · The page makes the noise** | End-to-end against the built page, with `AudioContext` replaced by a recorder: destroying a brick produces the destruction sound and not the collision one, and a bounce produces the collision sound. The page also runs when there is no `AudioContext` at all |
| **4 · The audio check can fail** | Break the mapping on purpose, watch task 3's assertion fail, revert, watch it pass unmutated. A check that has never failed is a claim |
| **5 · Repairs carried from `sound.md`** | `Obstacle`'s comment says it is a code-internal helper · `simulation.ts`'s module comment describes what is actually there · nothing in `src/` cites the deleted spec-tech paragraph |

## The verification question the scope deferred to this goal

**Answered: the suite, in three layers, and no new readout.**

- The events are plain data, so DS-6 is asserted in Vitest with no surface — *coverage sits where the
  state is*.
- The mapping from an event to a sound is pure, and is asserted the same way. That is where
  spec-style's silence rule lives, so it is tested without any audio at all.
- What only the surface can prove is that the page reaches Web Audio. The end-to-end test replaces
  `window.AudioContext` before the app loads and asserts what was asked of it.

**No readout, and no dev-only affordance.** The substitution lives entirely in the test, so nothing
ships that needs gating and `spec-app`'s layout is untouched — which is what was decided when the
layout activity was skipped.

**What it cannot prove: that a human hears anything.** The check asserts the page asked for the right
sound, not that a speaker made it. That is the honest ceiling of an automated check here, and it is
worth writing down rather than letting the green tick imply more than it means.
