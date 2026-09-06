# Scope

**Owns.** The overarching goal — what is being built now, where it stops, and what done means.

**Not here.** How any of it works. The rules of the world are [spec-domain.md](spec-domain.md), what
the player meets [spec-app.md](spec-app.md), how it looks [spec-style.md](spec-style.md), what it is
built with [spec-tech.md](spec-tech.md).

**Replaced, not appended to.** One overarching goal at a time; a reached goal is cleared rather than
archived, because the commit history already records what landed.

**Reaching a goal and setting the next one are two steps, not one.** The goal is cleared when it is
reached, leaving only a pointer to what comes next; the next goal is set later, whenever a new scope
is chosen. A skill owns each — `.claude/skills/scope-check/SKILL.md` and
`.claude/skills/scope-create/SKILL.md` — and neither happens inside a landing.

**Expected to change mid-flight**, on the branch of whatever found the reason.

**A goal broken into steps ticks each one as it lands**, in place and with its wording untouched, so
what is left is read here rather than reconstructed from the history. The tick is written by
`.claude/skills/scope-check/SKILL.md`, which every landing runs.

**No backlog, no parked list, no next-up** — `.claude/skills/land/SKILL.md` carries the argument.

**A specification outranks this document the moment it exists.** An answer is recorded here only
while the document that owns it is unwritten, so a goal that holds any tracks where each of its
answers ends up, and checks them off as they leave.

**No specification cites this document.** Not as justification, and not as routing. A goal is cleared
when it is reached, so every citation of it becomes a pointer to nothing — while still reading as
authority to anyone who does not open the file. A specification states its decisions as its own,
which is what owning them means, and how a decision was reached is in the history.

---

## A level you can lose

**Done means** a level can be lost as well as cleared — a trap destroys the ball, the last of five
lives ends the level, and the page draws a new room — and no bat can leave the ball on a path that
repeats for ever.

**The path is part of the edge rather than a goal beside it.** A ball keeps the heading it was
launched on until something turns it, and today only the long face of a bat does: an end reverses one
component and leaves the rest, so a ball can be put on a circuit it never leaves. Such a ball meets
no trap and costs no life. A level that can be lost while still holding a state in which losing
cannot happen is not the thing, so the two finish together or neither does.

**Where it stops.** The glass refractor and the monster generator get no behaviour and stay conceded;
they are a later scope's. Nothing is remembered between rooms — a lost level draws a new one the way
opening the page does — and there is still no map and no selection.

**It carries no unmade technology decision.** Nothing in it needs one.

| ✓ | Step | What it delivers |
|---|---|---|
| ☐ | **A bat's ends turn the ball** | A ball that meets the end of a bat leaves on a heading it was not on, so no launch produces a circuit. Stands on its own, and is provable before anything else here exists. |
| ☐ | **A trap destroys the ball** | Both trap kinds stop being carried and inert, and become the first thing in the world that can take the ball. Ends **P-3**, and the two kinds need telling apart by eye for the first time. |
| ☐ | **A level has lives, and runs out of them** | A destroyed ball costs one of five, and the level goes on until the last is gone. This is the state the domain says today does not exist, and the count has to be readable from outside or nothing can assert it. |
| ☐ | **Losing is shown, and the page draws a new room** | The player is told the level was lost, where they are already looking, and then meets another room as though the page had been opened again. |
