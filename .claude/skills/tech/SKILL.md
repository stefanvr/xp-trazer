---
name: tech
description: Write or extend doc/spec-tech.md — a stack choice with what it beat, or an architecture rule, and the scrutiny pass that keeps the document's claims true. Use when the goal chooses a technology, adds an architectural rule, or when spec-tech needs checking against the tree.
---

# Tech

**Owns.** How `doc/spec-tech.md` gets written and extended: which activities a pass runs, and what
has to be true before the result is called a specification.

**Not here.** How code is shaped in general, on any project —
[guide-design.md](../../../doc/guide-design.md), which this document's architecture rules are the
application of, and which it outranks. What the machine does and what lies to you is
`doc/setup-ai-env.md`; what has gone wrong with a technology before is `doc/lessons/<technology>.md`.
Neither of those is a choice, and this document is nothing but choices.

**A specification states the desired state.** The [domain](../domain/SKILL.md) skill carries the full
argument; it holds here unchanged.

**This document is cited from the code.** `A-1` and `A-2` appear in comments, and the identifiers it
fixes are what tests assert against. That is what makes being wrong here expensive, and it is why the
scrutiny pass below is not optional.

---

## The three activities

**The first step is choosing which this pass runs, and saying why in one line.** Most passes run one.

| Activity | Produces | Skip it when |
|---|---|---|
| **Stack choice** | A row in the table, what it beat, and the argument where the loser was close | Nothing is being chosen |
| **Architecture rule** | An `A-n`, where [guide-general.md](../../../doc/guide-general.md)'s test for a principle is met | The change rules nothing out and departs from nothing |
| **Scrutiny** | The document's claims, checked against the tree and the world | **Never.** Run it on every pass |

**Scrutiny is not optional here and is on every pass, which is a departure from the other spec
skills.** Their scrutiny checks a document against itself; this one checks it against a tree that
moves underneath it. Left alone the document does not become wrong loudly — it goes on describing a
project that has changed, in sentences that still read as authority.

**Refusing an `A-n` is a result, not a non-result.** Say so, and say what the candidate failed — in
the commit, not in the document.

## Name the mode before running an activity

- **A stack choice is options with a recommendation, and then the owner's.** The technology a project
  is built on is not the agent's to pick, and *a goal never carries an unmade technology decision*
  means the choice becomes a goal rather than a detail settled while building something else.
- **An architecture rule is the agent's to propose**, because it usually comes out of having just
  hit the thing it rules out.

## Scrutiny

The five passes, and every one of them has caught something.

1. **Every claim about the tree is still true.** Read each sentence that describes what the code does
   or does not have, and check it. *A sentence describing a project two goals ago is the finding.*
   Observed: a paragraph listing cells, elements, bats, holding, launching, a seed and clearing as
   *unbuilt* while `src/` cited DS-1 through DS-5 and 118 tests passed over them.
2. **Every claim about the outside world was verified, not remembered.** Hosting, visibility,
   pricing, a platform's behaviour. *A claim nobody has checked since it was written is the finding* —
   and check it by fetching the artefact, never by asking a control API, which reports "not there"
   and "not allowed to ask" identically.
3. **The header describes the whole document.** *An `Owns` line that names less than the document
   contains is the finding.* Observed: `Owns` claimed the stack alone while the architecture rules
   had been living below it for goals.
4. **It renders as markdown.** *A paragraph directly above a `---` with no blank line is the
   finding* — it renders as a heading, silently. Observed here, in this document's own `Not here`.
5. **Every `A-n` still has code that means it, and no number was reused.** *A rule nothing cites is
   either unbuilt or unnecessary, and a citation resolving to nothing is a rule dropped without
   saying so.*

## When not to run it

- **A technology has gone wrong and you want it written down.** That is `doc/lessons/<technology>.md`,
  and it is not a choice.
- **The behaviour of this machine.** `doc/setup-ai-env.md`, and it decides nothing.
- **The goal is implementation.** [build](../build/SKILL.md) owns that, and will send you here if a
  technology is about to be chosen while something else is being built.
