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
- **Verify the artefact, not the claim.** Run it; where there is anything to look at, screenshot it
  and open the screenshot. A passing test says the code ran, not that the output is right.
- **A check that has never failed is a claim, not evidence.** Make it fail on purpose once, and say
  what you did to make it fail.
- **A departure from guide-design is recorded in spec-tech in one line** — that document's own
  instruction. A rule broken quietly becomes the new rule by accident, and nobody ever decides to
  make that change.
- **A silent failure goes to [setup-ai-env.md](../../../doc/setup-ai-env.md)**: what succeeded, what
  it actually did, and the check that separates the two.

## When not to run it

- **A goal that touches no code.** A document, a specification, a skill.
- **To re-open the sizing question halfway.** The kind is named once, at the start. Discovering
  mid-change that a proof has grown product functionality is a reason to stop and ask the owner, not
  to quietly re-classify what is already written.
