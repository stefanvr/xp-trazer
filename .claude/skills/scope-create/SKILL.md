---
name: scope-create
description: Set the overarching goal in the scope document — what is being built now, where it stops, and what done means. Bootstrap step 2, run separately and whenever the owner chooses. Use when setting a new scope, never inside a landing.
---

# Scope create

**Owns.** Setting the overarching goal in `doc/scope.md`: its edge, its steps, and what it replaces.

**Not here.** Marking what a landing finished, asking whether the goal is reached, and clearing it is
[scope-check](../scope-check/SKILL.md). The cleanup a goal needs when it lands is
[land](../land/SKILL.md). What the scope's answers become once written is routed in
[CLAUDE.md](../../CLAUDE.md); the principles a goal is judged against are
[guide-general.md](../../../doc/guide-general.md).

**Optional, and never automatic.** Nothing forces a new goal to exist the moment an old one ends. A
scope holding no goal is a true statement about the project, and it is allowed to sit there until the
owner chooses otherwise.

---

## Set the overarching goal

**Optionally, start by discovering.** [todo-discovery](../todo-discovery/SKILL.md) says what the
documents have left open, and the specifications say what is written but not yet built. Neither of
them chooses the goal — they supply material, and the owner chooses.

**Don't decide on the owner's behalf.** Options and a recommendation, then wait. Confirm before it is
recorded, not after.

**A goal without an edge can only be abandoned, not finished**, so *Done means* is written in one
sentence, and it is written first. If it cannot be said in one sentence, the goal is more than one
goal.

**Say what a person can do that they could not before, and notice when the answer is nothing.** Being
next in a dependency chain is not the same as being worth doing. Note that
[guide-override.md](../../../doc/guide-override.md) may outrank this bullet — read it before applying
it.

**A scope may carry an unmade technology decision, and an ordinary goal may not.** guide-general
forbids it of a goal; the scope is the container those goals sit inside, so it can hold the choice
and resolve it by making it the first goal within itself.

**A goal broken into steps writes them as a table with a column to tick**, every row unticked, because
`scope-check` marks them as they land and a table with nowhere to record that leaves the marking to
prose.

**Replace, do not append.** What this writes goes where the pointer left by `scope-check` is, under
the document's own rules, which stay. One overarching goal at a time — the commit history is what
records the ones before it.

## What it touches

`doc/scope.md`, and nothing else.

## When not to run it

- **Inside a landing.** That is the violation these two skills were separated to prevent: a landing
  that decided what gets built next would be doing two jobs, and this is bootstrap step 2 with its own
  place in the sequence.
