# Scope

**Owns.** The overarching goal — what is being built now, where it stops, and what done means.

**Not here.** How any of it works. The rules of the world belong to [spec-domain.md](spec-domain.md),
what the player meets to [spec-app.md](spec-app.md), how it looks to [spec-style.md](spec-style.md),
and what it is built with to [spec-tech.md](spec-tech.md). This document says *which of those are in
and where the line is*, never *how*.

**This document is replaced, not appended to.** It holds one overarching goal. When that goal is
reached its content is deleted and the next one takes its place. That is safe because the commit
history already records what landed and when, and a second hand-maintained copy of that is the one
that goes stale.

**It is expected to change mid-flight.** A finding that moves the line is an edit on the goal's own
branch, so the move shows up in history rather than happening silently. A scope that could only be
written at the start would be a prediction, not a decision.

**No backlog, no parked list, no next-up.** `.claude/skills/land/SKILL.md` already argues this out
under *No permanent todo list*: such a list is a cache of something computable, it goes stale in the
direction nobody sees, and it competes with `doc/` as a second source of truth. Only the goal in
front of us is written down here.

**A specification outranks this document the moment it exists.** Several answers below are recorded
here because the specification that owns them has not been written yet. When it is, it takes the
decision and this document stops restating it — see *Where each answer ends up* at the foot.

---

## The goal — a game starts

**Done means:** one level appears, the ball is in play, both bat groups answer the keyboard, and the
level is cleared when every removable brick has been removed.

That edge is the owner's, unchanged from the brainstorm: *"being able to start a game"*, with the
clear condition added so that a level has an end and [spec-domain](spec-domain.md)'s central rule is
testable rather than merely written down.

## In

- **One level.** Authored, single, no map and no selection.
- **No mode.** Neither arcade nor journey — a mode is a frame around a game that does not exist yet.
- **No persistence.** Nothing is saved between runs, because nothing yet has anything to remember.
- **Removable bricks**, which the ball destroys, and **permanent bricks**, which are level structure
  and which clearing ignores.
- **Bats on both axes.** All horizontal bats move together; all vertical bats move together.
- **Arrow keys, split by axis.** Left/right drives the horizontal group, up/down drives the vertical
  group. Both groups are live at once — no mode, no switch key, no active-group state to display.
- **A closed playfield.** The ball cannot leave. There is no loss, no lives and no game over.
- **Tron.** Neon on black, glow, line.
- **A fixed-step simulation**, per [spec-tech.md](spec-tech.md) **A-1**, tested over plain state with
  no surface. Surface tests stay smoke tests that prove wiring.

## Out

Everything else the brainstorm describes, named rather than left implied, because *out* is only
useful when it is specific:

- **Hazards.** They cost the ball, and a closed playfield has nothing for them to cost.
- **Losing the ball**, lives, and game over.
- **Both modes** — arcade and journey — and everything downstream of them: runs, unlocks,
  once-per-run, and returning to selection after dying.
- **The map**, level selection, and the choice of direction.
- **Persistence** of any kind.
- **Sound.** Still open in the brainstorm, and nothing here needs it resolved.
- **More than one level.**

## The goal in front of every other — choose the stack

[spec-tech.md](spec-tech.md) chooses nothing today: no runtime, no framework, no renderer, no test
runner. [guide-general.md](guide-general.md) settles what that means for an ordinary goal — the
choice becomes the goal in front of it, proven by the smallest thing that genuinely exercises it.

**A scope may carry that unmade decision where a single goal may not**, because it is the container
the goals sit inside. So it is carried here, and it is discharged by making the choice the first goal
under this scope rather than by letting it be made mid-feature, under delivery pressure, by whoever
needed it first.

**A-1 sets the bar the choice has to clear.** Anything that insists on owning the game loop, or that
couples the simulation to frame time, is excluded before the comparison starts.

**Nothing further is listed.** The goals after that one are cut from this scope as it is reached, not
enumerated now — a goal written three goals early is written from a worse understanding, and
enumerating them here would rebuild the backlog this document just refused.

## What this deliberately gives up

- **A bat cannot fail.** With a closed playfield the ball is never lost, so the bat is an aiming
  tool and not a defensive one. Version one will therefore prove that clearing a level by aiming
  works, and will say nothing at all about whether keeping the ball in play is fun. That is the
  known cost of an edge with no loss in it, accepted rather than overlooked.
- **Nothing has been cut from the game.** Asked three times in the brainstorm, the owner found no
  feature to drop relative to Traz and Arkanoid. This scope narrows the *first version* instead, so
  the question is still unanswered for the game — *don't build further than the goal in front of you
  needs* remains the only thing doing that job.

## Where each answer ends up

Recorded here only because the owning document does not exist yet. Each moves on the day its
specification is written, and is removed from this list when it does.

| Answer | Owner once written |
|---|---|
| Removable and permanent bricks; clearing ignores the permanent ones | `spec-domain.md` |
| Bats grouped by orientation; a closed playfield with no loss | `spec-domain.md` |
| Arrow keys split by axis, both groups live at once | `spec-app.md` |
| One level, no selection, no persistence | `spec-app.md` |
| Tron — neon on black | `spec-style.md` |
| The stack, once chosen | `spec-tech.md` |

## What this closed in the brainstorm

Two of the brainstorm's open items are answered for version one, and only for version one:

- **How the two bat groups are driven** — one input each, split by axis. The brainstorm's own first
  option, chosen.
- **Tron against the C64 heritage** — the tension it recorded as *"not put to the owner"* has now
  been put to the owner. Tron, for this level.
