# Scope

**Owns.** The overarching goal — what is being built now, where it stops, and what done means.

**Not here.** How any of it works. The rules of the world are [spec-domain.md](spec-domain.md), what
the player meets [spec-app.md](spec-app.md), how it looks [spec-style.md](spec-style.md), what it is
built with [spec-tech.md](spec-tech.md).

**Replaced, not appended to.** One overarching goal at a time; when it is reached this content is
deleted rather than archived, because the commit history already records what landed.

**Expected to change mid-flight**, on the branch of whatever found the reason.

**No backlog, no parked list, no next-up** — `.claude/skills/land/SKILL.md` carries the argument.

**A specification outranks this document the moment it exists.** An answer is recorded here only
while the document that owns it is unwritten — see *Where each answer ends up*.

---

## The goal — a game starts

**Done means:** one level appears, the ball is in play, both bat groups answer the keyboard, and the
level is cleared when every removable brick has been removed.

## In

- One authored level.
- Removable bricks, which the ball destroys, and permanent bricks, which clearing ignores.
- Bats on both axes. All horizontal bats move together; all vertical bats move together.
- Arrow keys split by axis — left/right drives the horizontal group, up/down the vertical. Both are
  live at once: no switch key and no active-group state to display.
- A closed playfield. The ball cannot leave.
- Tron. Neon on black.
- A fixed-step simulation, per [spec-tech.md](spec-tech.md) **A-1**, tested over plain state.

## Out

- Losing the ball, lives, game over.
- Hazards — they cost the ball, and a closed playfield has nothing for them to cost.
- Arcade and journey, and everything downstream of them: runs, unlocks, once-per-run, and returning
  to selection after dying.
- The map, level selection, and choosing a direction.
- Persistence of any kind.
- Sound.
- More than one level.

## The first goal inside it — choose the stack

[spec-tech.md](spec-tech.md) chooses nothing today: no runtime, no framework, no renderer, no test
runner. That choice is the goal in front of everything else, proven by the smallest thing that
genuinely exercises it.

**A-1 sets the bar.** Anything that insists on owning the game loop, or that couples the simulation
to frame time, is excluded before the comparison starts.

## What this gives up

- **A bat cannot fail.** With a closed playfield the ball is never lost, so a bat is an aiming tool
  and not a defensive one. Version one proves that clearing a level by aiming works, and says
  nothing about whether keeping the ball in play is fun.
- **Nothing is cut from the game, only deferred.** No feature has been dropped relative to Traz and
  Arkanoid. The first version is narrow; the game is not yet.

## Where each answer ends up

Each moves on the day its specification is written, and leaves this table when it does.

| Answer | Owner once written |
|---|---|
| Removable and permanent bricks; clearing ignores the permanent ones | `spec-domain.md` |
| Bats grouped by orientation; a closed playfield with no loss | `spec-domain.md` |
| Arrow keys split by axis, both groups live at once | `spec-app.md` |
| One level, no selection, no persistence | `spec-app.md` |
| Tron — neon on black | `spec-style.md` |
| The stack, once chosen | `spec-tech.md` |
