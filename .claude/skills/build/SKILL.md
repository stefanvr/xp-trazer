---
name: build
description: Write or change implementation code to this project's rules. Decides first whether the code is a proof of wiring or product functionality, because only the second needs a specification to exist before it is written. Use when a goal will produce or change code.
---

# Build

**Owns.** How implementation work is done here: what has to be true before code is written, and what
has to be true before it is called finished.

**Not here.** How the code is *shaped* — [guide-design.md](../../../doc/guide-design.md) owns modules,
seams and what stays testable, and this skill points at it rather than repeating it. This project's
own architectural rules are [spec-tech.md](../../../doc/spec-tech.md), and the git mechanics are in
[CLAUDE.md](../../CLAUDE.md).

**This routine exists because it was once skipped.** A goal that read *choose the stack* produced a
working program carrying wall reflection, a bounce count and an acceleration model, at a point where
`spec-domain.md` did not exist to own any of them. Nothing was wrong with the code. What was wrong is
that the game's physics got decided in a commit about a toolchain, by whoever was typing.

---

## Name the kind of code, first and out loud

Everything below depends on this answer, so it is given before anything is written.

| Kind | What it is for | What it requires to exist first |
|---|---|---|
| **Proof of wiring** | Showing a toolchain, a seam or an integration works | The seams it must exercise, named |
| **Product functionality** | Behaviour someone will play or use | The specification that owns that behaviour |
| **Repair** | Making existing code match what already owns it | The document it is being matched to |

**If you cannot name the document that owns the behaviour you are about to write, you are writing a
specification in code.** Stop and say so. That is the moment this routine exists for — a
specification is the expensive place to be wrong, and code that quietly becomes one was never
reviewed as one.

## Break the goal into checkable tasks, in the scratchpad

**Before the first line of code**, write the breakdown to a file in `doc/scratchpad/`: two columns,
the task and **what makes it checkable**. Checkable means the observable thing the owner can look at
and judge — *"bats answer the keyboard"*, not *"the bat module"*. A task that can only be checked by
reading the diff is a layer, and layers are not tasks.

**Remove a task once it is implemented.** The file then always reads as what is left, which is what
it is for. What was done is already in the commit history, and a file that keeps both goes stale in
the half nobody rereads.

**This is not the backlog [land](../land/SKILL.md) refuses.** It holds only the goal in front of us,
it shrinks to nothing as that goal completes, and landing clears the scratchpad. A backlog outlives
its goal and accumulates; this one is deleted by being finished.

Keep it in its own file, separate from the note that collects findings as the work goes. The two run
opposite ways — the breakdown shrinks, and the findings accumulate until each is given a fate at
landing.

## A proof contains no product decisions

**The test is mechanical: remove a rule, and ask whether any seam stopped being proven.** A ball that
bounces off a wall proves nothing about a fixed-step loop that a dot moving in a straight line does
not. If deleting a rule leaves every seam still exercised, that rule was product functionality
wearing a proof's clothes.

So a proof **names its seams before it is written**, and every line afterwards is answerable to one
of them.

## A goal phrased as a choice ends at the choice

*Choose X* is finished when X is chosen and proven. Extending it into working software is a second
step, and it is the owner's to ask for — **ask before crossing that line**, rather than building and
letting them find out afterwards.

## Before it is called finished

- **The test sits where the behaviour is** — over plain state, no surface, milliseconds. Surface
  tests prove wiring only. Both are [guide-design.md](../../../doc/guide-design.md)'s rules.
- **Verify the artefact, not the claim — and do it through the suite.** A unit test says the code
  ran; what the product actually does in a browser is the end-to-end suite's to assert, screenshots
  included. Where something is worth looking at and nothing asserts it, that is a test to write,
  not a page to drive by hand —
  [guide-general.md](../../../doc/guide-general.md) carries the argument.
- **A check that has never failed is a claim, not evidence.** Make it fail on purpose once, and say
  what you did to make it fail.
- **Mutate from a copy, and end by re-running unmutated.** `git checkout --` reverts to the last
  commit, not to what you had, so on an uncommitted change it deletes the very thing being proven —
  and every mutation still fails exactly as predicted, which reads as the proof succeeding. Observed
  here: a two-mutation proof of the clearing test where both mutations failed correctly and the seam
  had already been erased before the first one ran. **The final unmutated run is the only step that
  separates a proof from a deletion**, so it is not optional. Commit first, or revert from a copy.
- **A departure from guide-design is recorded in spec-tech in one line** — that document's own
  instruction. A rule broken quietly becomes the new rule by accident, and nobody ever decides to
  make that change.
- **A silent failure gets written down**: what succeeded, what it actually did, and the check that
  separates the two. It goes to [setup-ai-env.md](../../../doc/setup-ai-env.md) if it is true
  whatever the project is built with, and to `doc/lessons/<technology>.md` if it is not. **If that
  lesson file is new and its technology is chosen, CLAUDE.md's active list gains it** — that is one
  of the two moments the list can change.

## When not to run it

- **A goal that touches no code.** A document, a specification, a skill.
- **To re-open the sizing question halfway.** The kind is named once, at the start. Discovering
  mid-change that a proof has grown product functionality is a reason to stop and ask the owner, not
  to quietly re-classify what is already written.
