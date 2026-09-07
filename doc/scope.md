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

**Done means** a level can be lost as well as cleared — a trap destroys the ball, the last of a
player's five lives ends the level, and the page draws a new room — and no bat can leave the ball on
a path that repeats for ever.

**Lives belong to a player, not to a level.** A level is drawn, played and replaced; a player is what
a later arcade mode would carry a life count across from one room to the next, so this is where that
separation starts rather than something arcade mode would have to retrofit into a level that never
expected to outlive one room. This scope does not build arcade mode and decides nothing about it —
only that the count this goal adds is asked of the right thing from the rule that first reads it.

**The path is part of the edge rather than a goal beside it.** A ball keeps the heading it was
launched on until something turns it, and today only the long face of a bat does: an end reverses one
component and leaves the rest, so a ball can be put on a circuit it never leaves. Such a ball meets
no trap and costs no life. A level that can be lost while still holding a state in which losing
cannot happen is not the thing, so the two finish together or neither does.

**Where it stops.** The glass refractor and the monster generator get no behaviour and stay conceded;
they are a later scope's. A run's lives and score are remembered across the rooms it draws, and
nothing else is — a new run starts exactly as the page's own first one does, and there is still no
map and no selection.

**It carries no unmade technology decision.** Nothing in it needs one.

| ✓ | Step | What it delivers |
|---|---|---|
| ☐ | **A bat's ends turn the ball** | A ball that meets the end of a bat leaves on a heading it was not on, so no launch produces a circuit. Stands on its own, and is provable before anything else here exists. |
| ☐ | **A trap destroys the ball** | Both trap kinds stop being carried and inert, and become the first thing in the world that can take the ball. Ends **P-3**, and the two kinds need telling apart by eye for the first time. |
| ☐ | **A run has lives, a score, and a way to continue** | A run starts with five lives and no score. A ball destroyed spends one life; a level cleared adds a point and lets the player continue into the run's next level, keeping both. |
| ☐ | **A run can end, and be started again** | A run out of lives shows its score, styled as a loss where a clear is styled as a win, and space starts a new run — five lives, no score, and a level of its own. |
