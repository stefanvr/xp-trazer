---
name: scope-check
description: Mark the steps of the scope document's goal that a landing finished, then ask whether the overarching goal is reached and, on approval, clear it and leave a pointer to what comes next. Use on every landing, and when someone asks whether the goal is reached.
---

# Scope check

**Owns.** The overarching goal in `doc/scope.md` at the moment a landing changes it: marking the
steps that landed, asking whether the goal is reached, and clearing it once the owner agrees. Nothing
else writes that goal, except the skill that sets one.

**Not here.** Setting the next overarching goal is [scope-create](../scope-create/SKILL.md). The
cleanup a goal needs when it lands — clearing the working notes — is [land](../land/SKILL.md), which
calls this rather than doing any of it itself. What the scope's answers become once written is routed
in [CLAUDE.md](../../CLAUDE.md); the principles a goal is judged against are
[guide-general.md](../../../doc/guide-general.md).

**Kept apart from `scope-create`, and that is the point of two skills.** Ending a goal and choosing
the next one arrive at the same moment in time, and that is the whole of what they share. One routine
doing both makes a landing decide what gets built next — a single-responsibility violation, and a
workflow one, since setting the overarching goal is bootstrap step 2 and has its own place in the
sequence. A landing then also loads only the half it uses.

**Nothing forces a new goal to exist the moment an old one ends.** A scope holding no goal is a true
statement about the project, and it is allowed to sit there.

---

## Mark what landed, then ask whether the goal is reached

**First, tick the steps this landing finished.** A goal broken into steps carries them as a table,
and a step that is done is marked done in place — the row stays, with its wording untouched. Read
each unticked row against what the landing actually delivered, judged the way the edge is judged:
from the suites, not from the commit log. Ticking is a write to this document, so it happens here
rather than in the landing that prompted it.

**A tick is a fact about the tree, not a reward for the branch.** A landing may finish more than one
step, or none. Where a row is only partly delivered it stays unticked; splitting it to tick half of
it is rewriting the goal, which is `scope-create`'s business.

**Unticked steps are the reason the marking exists.** A goal whose steps are all ticked while *Done
means* is still not true says plainly that the breakdown was incomplete, and a goal still holding
unticked steps is the fastest answer to *what is left* — otherwise recoverable only by reading the
whole history.

**Then read the scope's *Done means* and ask whether it is now true.** That sentence is the edge, and
it is the only thing being answered. Most goals land *inside* the overarching goal and the answer is
no.

**Answer it from the suites, not from the commit log.** The edge is a claim about what the program
does, and the unit and end-to-end suites are what say so. **Do not drive the running product to
settle it** — that is expensive, it proves one thing once, and it leaves nothing behind. Where a
clause of *Done means* is asserted nowhere, that is a gap in the tests: close it there.

**Confirm the scope has finished moving out**, where the goal tracks that. A goal holding answers
carries a *Where each answer ends up* table, checking each off the day its specification is written
without removing the row; a goal that held none has no such table and nothing to confirm. Every row
that exists must be checked before the goal is cleared — a row still unchecked is an answer that
exists nowhere but here, and clearing the section under it would lose it outright.

**It is a proposal, not a finding.** Put it to the owner and wait. Say that the edge reads as met and
what it was answered against. Reporting that it looks reached is not the approval, and an overarching
goal is the owner's to declare over.

**On approval, clear the goal and say what comes next.** Everything from the goal's own heading down
is replaced by this. The header above it is the document's own rules and stays:

```markdown
**No goal is set.** The last one was reached and cleared. Run `todo-discovery` for what the documents
have left open, then `scope-create` to set the next one.
```

**The goal's text goes, every word of it.** The commit history already records what landed, and a
document still full of a finished goal is what makes the next goal *less* obvious — it goes on
reading as though something is being built. An emptied scope is the signal that one must be set, and
it is the one signal that cannot be skim-read past.

**Write no new goal here.** That is `scope-create`, it is a separate decision, and it is the owner's.
What this leaves behind points at that skill; it does not anticipate it.

## What it touches

`doc/scope.md`, and nothing else. It ticks the steps that landed, and clears the goal only after the
owner agrees.

## When not to run it

- **Mid-goal, as a status report.** Reading the edge is free, and so is reading which steps are
  ticked; writing to the document is what this is for, and a step is ticked when it lands, not when
  it looks nearly done.
- **On a scope holding no goal.** Open the document, find no goal, and move on. It is not a finding,
  and it is not a reason to set one.
