# Build breakdown — the game is heard

**Working notes.** The breakdown for this goal, and nothing else — findings go in
`sound.md`, which runs the other way. **A task is removed once it is implemented**, so this file
always reads as what is left. Cleared when the goal lands.

**Kind of code:** product functionality, plus repair. Every behaviour below has a document that owns
it — DS-6 in `spec-domain.md`, the sound table in `spec-style.md`, Web Audio in `spec-tech.md`.

---

| Task | What makes it checkable |
|---|---|
| *(none left — every task is implemented)* | |

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
