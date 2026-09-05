---
name: style
description: Write or extend doc/spec-style.md — the reference it is measured against, the rules for when something is seen or heard, and the values that decide what it is. Use when the goal is to write or change how the project looks, sounds or feels.
---

# Style

**Owns.** How `doc/spec-style.md` gets written and extended: which activities a pass runs, who
proposes what, and what has to be true before the result is called a specification.

**Not here.** Showing what the document decides — that is [preview](../preview/SKILL.md), which keeps
the pages that draw and play it. *When* a thing happens is [domain](../domain/SKILL.md)'s or
[app](../app/SKILL.md)'s; *how* it is produced is [tech](../tech/SKILL.md)'s. This document says what
should be seen and heard, and nothing about what causes it.

**A specification states the desired state**, with no marker saying who proposed something or how
settled it is. The [domain](../domain/SKILL.md) skill carries the full argument; it holds here
unchanged.

**The document's remit is *look, sound and feel*** — the routing's words. A pass that touches only
one of the three is normal; a pass that forgets the other two exist is how sound went unwritten for
four goals.

---

## The four activities

**The first step is choosing which this pass runs, and saying why in one line.**

| Activity | Produces | Skip it when |
|---|---|---|
| **Reference** | What this should be mistaken for, per sense | The pass adds nothing to a sense that has no reference yet |
| **Rules** | When a thing is seen or heard, and when it is deliberately not | Nothing is conditional — a value that always applies is a value |
| **Values** | The numbers and names that decide what it *is* — hues, sizes, waveforms, envelopes | The pass changes no value |
| **What this leaves open** | What is named as undecided, so a later goal knows it is deciding rather than discovering | Nothing was left open and nothing that was is now closed |

**A reference is per sense, and they may disagree.** This project's do: Tron in the eye, the C64 in
the ear. That is a split rather than an inconsistency, and it was worth writing down as one — a
reader meeting both without the sentence would take one for a mistake.

**The Rules activity is the one that gets skipped and should not be.** A silence, an element that
deliberately shares another's look, a thing shown only in one mode — all are rules, and all read as
oversights if the document only lists values.

## Name the mode before running an activity, not after

- **The owner proposes the reference.** It is a feeling and a memory of something seen or heard, and
  an agent proposing one is an agent choosing the product's character.
- **The agent proposes the values, and the owner corrects.** These are craft, and the owner
  correcting a proposal is cheaper for them than producing twenty numbers.
- **Rules are put as options with a recommendation, and waited on.** They are the ones that change
  what the player perceives.

**Observed:** writing spec-style's sound section, the agent asked about three decisions and then made
three more inside the writing, reporting them only once they were in the document. Naming the mode
out loud is what makes that visible while there is still time to *confirm before it is recorded*.

## Scrutiny

1. **Every value has exactly one home in code, and the document points at it.** A hue or a waveform
   the specification decides must live in one module — [palette.ts](../../../src/render/palette.ts)
   for the eye, [sounds.ts](../../../src/audio/sounds.ts) for the ear — imported by everything that
   uses it. *A value with no module, or a second copy of one, is the finding*, and it is the drift
   the preview pages exist to catch.
2. **Every decision in the document was put to the owner before it was written.** *A decision that
   appears in the diff without appearing in the conversation is the finding.*
3. **Nothing here decides what another specification owns.** *A rule about when something happens,
   what causes it, or which technology produces it is the finding* — it belongs to spec-domain,
   spec-app or spec-tech, and this document asks rather than answers.
4. **Everything named can be demonstrated, or the gap is named.** Run [preview](../preview/SKILL.md)
   after this pass. *Something the specification names that no page shows is the finding* — and if it
   cannot be shown yet, the skill says so rather than the reader discovering it.
5. **What this leaves open is still open.** *An entry that a later pass closed, and left listed, is
   the finding.* Observed: the sound pass had to correct both a bullet saying there was no sound and
   one saying the document committed to Tron outright.

## When not to run it

- **To change what a page looks like without changing what is decided.** That is
  [preview](../preview/SKILL.md).
- **The goal is implementation.** [build](../build/SKILL.md) owns that, and will send you here if
  what is being drawn or played has no specification to sit in.
