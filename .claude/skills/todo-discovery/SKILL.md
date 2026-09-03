---
name: todo-discovery
description: Audit this project's process and documents for structural and reference inconsistency, and record the result as a dated snapshot in doc/scratchpad/. Covers documents contradicting each other, references to things that do not exist, claims that have gone stale, and gaps in the routing. Does not cover missing specification content or unbuilt implementation. Use when asked what is inconsistent, what is open in the documents, or to check the doc set against itself.
---

# TODO discovery

**Owns.** Whether this project's **process and documents** hold together: what they claim about each
other, what they point at, and whether every kind of decision has exactly one owner.

**Not here.** What the documents should *say*. Content is the specifications' business, and ranking
findings is the owner's — this routine reports and does not order.

**Absence is not a finding.** This project builds and specifies no further than the goal in front of
it, and [CLAUDE.md](../../CLAUDE.md) records the bootstrap sequence that makes that deliberate. A
specification that does not exist means the sequence has not reached it. **Never report a
specification the sequence has not reached as missing — `spec-domain.md` and `spec-app.md` today —
and never report that something has not been built yet** — those are the plan working, and reporting
them hands the project its own method back as a fault.

**The greppable half is the smallest half.** The findings are in what the documents say *about each
other*. A run that only greps for the word `TODO` reports that there is nothing to do.

---

## What a finding is

A **structural or referential inconsistency between the project's own artefacts**, that cites the file
and line proving it, and that names what would close it. Three tests, all of them:

- **Structural or referential** — about how the documents fit together, not about what they decide.
- **Cited** — file and line, on every side. A finding without a citation is an opinion, and gets
  dropped rather than softened.
- **Closeable** — one sentence saying what would end it, and that sentence is an edit to a document.

### The four kinds

| Kind | The test |
|---|---|
| **Contradiction** | Two documents say incompatible things. One is stale, and it goes on reading as authority until someone names it. |
| **Dangling reference** | A document names an artefact — file, directory, script, section, rule — that does not exist. |
| **Stale claim** | A document describes the project's structure as it no longer is. Common right after the structure is fixed somewhere else. |
| **Routing gap** | A kind of decision with no owning document, or one document owning two kinds. |

**There is deliberately no "admitted gap" kind.** An earlier version of this skill had one — *a
document states that a decision is not made* — and its first run duly reported that the stack was
unchosen and that no document owned the game. Both were true and neither was a finding: the project
had simply not reached them. That kind was removed rather than qualified, because a qualified version
would have been argued back into scope on the next run.

## What a finding is not

- **Missing specification content.** An unchosen technology, an unwritten rule, an unanswered
  question inside a document that exists.
- **Unbuilt implementation.** Whatever the goal in front of you has not needed yet — the sequence has
  not reached it.
- **A specification that does not exist yet.** See above; this is the most tempting one.
- **An idea nobody committed to**, or the next link in a dependency chain.
- **A live decision that names its expiry.** An override with an *ends when* is being held.
- **An accepted state with a written remedy.** `core.fileMode` starts noisy in a fresh clone; SF-12
  says so and the checklist repairs it. Written down and handled is closed.
- **Cosmetics.** A missing trailing newline has no done worth naming.

**When the specifications exist, this may widen.** Once `spec-domain` and `spec-app` join `spec-style`
and `spec-tech`, checking them against each other becomes a legitimate target of the same shape —
documents disagreeing. That is a possibility the owner has raised, not a decision, and it stays out of
scope until they make it one.

## Where to look

1. **Read every document end to end** — `doc/` and `.claude/CLAUDE.md`. Not grep: contradictions are
   prose, and prose does not announce itself.
2. **List every artefact any document names** — file, directory, script, command, section, named rule
   — and test that each exists. `git ls-files` against that list, not memory.
3. **List every claim one document makes about another's contents**, then open the other and read it.
   *"X is settled in Y"* is a claim about Y, and Y is where it is confirmed or broken.
4. **Follow the attributions.** *"A chose B"* asserts that A's file records B. Check A.
5. **Re-read whatever was changed most recently.** A structural fix in one document is the usual cause
   of a stale claim in another.
6. **Then grep** — `todo|fixme|tbd` — and expect it to find little.

Every step reads the file. *Report what was verified, not what is believed — the two read identically
and only one of them is worth anything.*

## Recording

One file per run: `doc/scratchpad/todo-<YYYY-MM-DD>.md`, entries numbered `D-n`, each carrying:

- **The claim** — one sentence, stated as fact about the project.
- **Kind** — one of the four.
- **Evidence** — file and line. A contradiction cites *both* sides.
- **Done when** — one sentence, and it is an edit to a document.

No priority, no estimate, no recommendation of what to take. Where one finding blocks another, record
that as a fact, separately from the entries, so ordering stays the owner's.

**Say what was examined and excluded**, with the reason. The exclusions are what make a short list
trustworthy — without them it reads as a shallow look rather than a decided boundary.

## The result is a working note

It lives in `doc/scratchpad/` because it decides nothing: it is a snapshot of what the documents
already say, regenerated by re-running this skill, and cleared when the goal it belongs to lands.
Two consequences:

- **Do not maintain it.** Supersede it with a later run rather than editing it towards the truth.
- **Do not cite it as authority.** If a finding turns out to be a decision, it belongs in the document
  that owns that kind.
