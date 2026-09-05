---
name: scope
description: Own doc/scope.md at both moments it changes — checking whether the overarching goal is reached and marking it so (`check`), and setting the next overarching goal (`create`). Use when a landing looks like it reaches the goal, when asked whether the goal is reached, or when setting a new scope.
---

# Scope

**Owns.** The overarching goal in `doc/scope.md`, at both moments it changes: **`check`** asks
whether it is reached and marks it so, **`create`** sets the next one. Nothing else writes that goal.
The document's own header rules are the document's, and are edited like any other document's.

**Not here.** The cleanup a goal needs when it lands — clearing `doc/scratchpad/` — is
[land](../land/SKILL.md), which calls `check` rather than doing any of this itself. What the scope's
answers become once written is routed in [CLAUDE.md](../../CLAUDE.md); the principles a goal is
judged against are [guide-general.md](../../../doc/guide-general.md).

**The two modes are deliberately not one routine.** Ending a goal and choosing the next one arrive at
the same moment in time, and that is the whole of what they share. Folding them together makes a
landing decide what gets built next — a single-responsibility violation, and a workflow one, since
setting the overarching goal is bootstrap step 2 and has its own place in the sequence.

**`create` is optional, and never automatic.** Nothing forces a new goal to exist the moment an old
one ends. A scope marked reached and not yet replaced is a true statement about the project, and it
is allowed to sit there.

---

## Which mode

| Argument | Use it when |
|---|---|
| `check` | A landing looks like it reaches the goal, or someone asks whether it is reached |
| `create` | Setting the overarching goal — bootstrap step 2, or after a `check` marked one reached |

With no argument, read the document and say which you chose before doing anything: a goal not marked
reached wants `check`, a goal marked reached wants `create`.

---

## `check` — is the goal reached, and say so in the document

**Read the scope's *Done means* and ask whether it is now true.** That sentence is the edge, and it is
the only thing being answered. Most goals land *inside* the overarching goal and the answer is no.

**Answer it from the suites, not from the commit log.** The edge is a claim about what the program
does, and the unit and end-to-end suites are what say so. **Do not drive the running product to
settle it** — that is expensive, it proves one thing once, and it leaves nothing behind. Where a
clause of *Done means* is asserted nowhere, that is a gap in the tests: close it there.

**Confirm the scope has finished moving out.** Its *Where each answer ends up* table checks off each
answer the day its specification is written, without removing the row. Every row must be checked
before the goal is marked reached — a row still unchecked is an answer that exists nowhere but here.

**It is a proposal, not a finding.** Put it to the owner and wait. Say that the edge reads as met and
what it was answered against. Reporting that it looks reached is not the approval, and an overarching
goal is the owner's to declare over.

**On approval, mark it reached in place.** One line, immediately above the goal's own heading:

```markdown
**Reached.** The next overarching goal is not set yet — `scope create` sets it.
```

Nothing else in the document changes. **The goal's text stays, every word of it.** It is what the
next scope is chosen against, and deleting it the moment it is finished throws that away at exactly
the moment it is most useful.

**Write no new goal here.** That is `create`, it is a separate decision, and it is the owner's.

## `create` — set the overarching goal

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
[guide-override.md](../../../doc/guide-override.md) currently outranks this bullet — read it before
applying it.

**A scope may carry an unmade technology decision, and an ordinary goal may not.** guide-general
forbids it of a goal; the scope is the container those goals sit inside, so it can hold the choice
and resolve it by making it the first goal within itself.

**Replace, do not append.** Everything from the goal's heading down belonged to the goal that ended,
the reached marker included. The header above it is the document's own rules and stays. One
overarching goal at a time — the commit history is what records the ones before it.

## What it touches

`doc/scope.md`, and nothing else. **In `check` it writes one line, and only after the owner agrees.**

## When not to run it

- **`check` mid-goal, as a status report.** Reading the edge is free; writing the marker is what this
  is for, and the marker is a landing's business.
- **`create` inside a landing.** That is the violation this skill was split in two to prevent.
