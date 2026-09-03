---
name: domain
description: Write or extend doc/spec-domain.md — choose which activities this pass needs, run them, and scrutinise what they produce before it is called a specification. Use when the goal is to write or change the rules of the game world.
---

# Domain

**Owns.** How `doc/spec-domain.md` gets written and extended: which activities a pass runs, who
proposes what, and what has to be true before the result is called a specification.

**Not here.** What the domain *is* — that is the specification itself. The material it is written
from is `doc/brainstorm/`, which is draft and binds nothing. How the code is shaped is
[guide-design.md](../../../doc/guide-design.md); what a document may own is routed in
[CLAUDE.md](../../CLAUDE.md).

**`spec-app.md` is not this routine's business.** It wants story mapping where this wants event
storming, so it gets a routine of its own when it is the goal in front of us. One consequence is
worth naming rather than discovering: the concerns that belong to neither specification — screen
size, chrome, whether a thing lives in a menu — are not caught here, and nothing yet catches them.

---

## The specification states the desired state

**No marker says who proposed a term, or how sure anyone is of it.** The specification asserts; the
question *whose word was this* is answered by `doc/brainstorm/` and by the history.

This is the failure worth naming, because it looks like diligence while it happens. A sibling project
grew a vocabulary table with a *"Whose word"* column — rows reading *the owner's*, *coined*, *coined
— the owner has not named this* — and markers for decided-but-unbuilt. Every one of those is **a
scrutiny question left parked in the finished document instead of being resolved**. The scrutiny below
asks them; its answers become the names, never a column.

## Not every pass needs every activity

Four activities. **The first step is choosing which this pass runs, and saying why in one line** —
*"maybe not all are always needed"* is the owner's, and a pass that silently runs all four spends
attention it did not need to.

| Activity | Produces | Skip it when |
|---|---|---|
| **Ubiquitous language** | The words the domain and the code both use | Nothing is being named or renamed |
| **Event storming**, high level | What happens, in order, and what causes each | The change is inside one rule and moves nothing |
| **Business rules** — the game's rules | The numbered rules the code and tests cite | The pass is only naming or modelling |
| **Data and reference data** | What a thing *is* as data, and what is authored rather than played | No rule this pass touches needs data that does not exist |

## Name the mode before running an activity, not after

The mode differs per activity, and it is the owner's call each time. **Say which one you are in
before starting**, because discovering it afterwards is how a proposal gets accepted as though it
had been asked for.

- **The owner proposes** where the words are already theirs — the vocabulary usually is.
- **The agent proposes and the owner corrects** where the material is thin or absent, which is
  usually the data model and often the event flow.
- **Already settled** where a brainstorm records it as *said*; then this is transcription with
  scrutiny, not an interview, and interviewing about it wastes the scarce thing.

These are defaults and starting points, not a rule. The owner confirmed that mode varies by activity;
the split above is the agent's and has not been tested by use.

## Scrutiny — the step between raw thought and a specification

**A brainstorm is raw thought, and may be inconsistent or incomplete.** Transcribing it does not work,
and skipping this step does not save the work; it moves the work into a long tail of corrections
discovered one at a time.

Four passes. **The first is the owner's**, given as the one that catches a whole category. The second
addresses the second category they named. The last two are the agent's and are untested.

1. **Every rule's inputs exist.** For each rule, name the data it needs. Each must be a term in the
   vocabulary or a stated primitive. *A rule that needs something with no name is the finding.*
   Both of the sibling project's failures surface here: a prune activity taking a mandatory plant
   with unexamined logic for picking it, and a weed action taking free text where a weed wanted an
   identity.
2. **The flow connects end to end.** State the sequence as steps — *pick a mode → play level →
   navigate*. For each step name what starts it and what it leaves changed. *A step with no cause, or
   one whose result nothing consumes, is the finding.*
3. **The vocabulary has no orphans.** Every term used by a rule appears in the vocabulary; every term
   in the vocabulary is used by a rule or by the data model. *An orphan either way is a term nobody
   needs or a rule nobody wrote.*
4. **Every invented name has been put to the owner.** Note which terms came from the agent rather
   than from the owner, and ask. The answer replaces the name or confirms it — **and then the note is
   discarded.** This pass is the one whose output must not survive into the document.
5. **Every name is the thing that happened, not one of its results.** *A finding: the name describes
   an effect.* The first run of this routine called an event `rebound`, which is one outcome of a
   ball meeting something — a removed brick is another, and a name covering only the first hides the
   second. It is `collision`. A term named for a result is also the term that quietly decides there
   is only one.

## Revision here is the work; revision after implementation is the failure

**A draft that changes several times while being written is this routine succeeding.** Understanding
arrives by writing, and the passes above exist to make it arrive now.

What must not happen is arriving at it *after* code, tests and cited identifiers stand on the earlier
version — then every correction is a specification update as well, and they are found by hitting
them. **The deadline for understanding is the start of implementation, not the start of writing.**

## The shape of the work

**One branch, one commit per activity.** The commits stay task-sized, and the branch is where the
group lands as one consistent unit — both already in [CLAUDE.md](../../CLAUDE.md).

The reason for the split is not tidiness: it gives the owner a place to stop after the vocabulary,
**before rules are founded on names that may be wrong**, which is where the long tail of corrections
starts.

**That stop is a checkpoint, not a settling.** A name cannot be fully judged until an activity uses
it — the first run of this routine had the vocabulary agreed, and event storming then renamed a term
and added three more. Expect that, and do not treat a term as final because it survived the pass that
invented it. **A term is settled when it has survived the activities that use it**, which is the end
of the goal rather than the end of its own activity.

## When not to run it

- **The change is to a rule the specification already owns**, and nothing is being named, sequenced
  or modelled. That is an edit to `spec-domain.md`, argued on its merits.
- **The goal is implementation.** [build](../build/SKILL.md) owns that, and it will send you here if
  the behaviour has no specification to sit in.
- **`spec-app.md`.** Different technique, different routine.
