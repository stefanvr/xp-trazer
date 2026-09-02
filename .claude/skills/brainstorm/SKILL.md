---
name: brainstorm
description: Interview the owner about their ideas for the project and write the result to doc/brainstorm/ as draft. Step 1 of the bootstrap sequence, before the first-version scope and the four minimal specs. Use when starting a project or a major part of one, when the specs need material, or when asked to brainstorm, explore the idea, or work out what the game is.
---

# Brainstorm

**Owns.** How the owner's ideas get out of their head and onto a page the specifications can be
written from.

**Not here.** The specifications themselves, and the first-version scope — those are the steps after
this one. What a document may own is routed in [CLAUDE.md](../../CLAUDE.md); how the code is shaped is
[guide-design.md](../../../doc/guide-design.md).

**Everything this produces is draft, and binds nothing.** That is the whole licence the step runs on.
*Don't specify further than the goal in front of you needs* is a rule about what gets **recorded as
decided** — so a brainstorm is the one place ranging ahead is free, provided what comes out is
labelled draft and stays out of the documents that own decisions.

**An interview extracts; it does not supply.** The failure mode is an agent that proposes a game, the
owner says "yes, fine", and a fortnight later nobody can tell which parts were ever chosen. Guard it
mechanically: **write down who said each thing**, and never let a suggestion the owner merely
tolerated read like something they wanted.

---

## How to run it

- **One topic at a time.** A batch of ten questions comes back with one answer, and it will be to the
  easiest question.
- **Ask about the thing, not about the document.** *"What does the player do in the first ten
  seconds?"* — never *"what should spec-domain say?"* Routing an answer to its document is your job,
  and asking the owner to do it changes what they tell you.
- **Ground every question in something that exists.** The owner has references — Traz, Arkanoid, a
  screenshot, a game they bounced off. Comparative questions get real answers where blank-page
  questions get a shrug.
- **Where you have a view, give options and a recommendation, then wait** — *don't decide on the
  owner's behalf*. Then mark the result as yours-accepted, not theirs-stated.
- **Follow the energy, and treat a shrug as data.** Where the owner elaborates unprompted, dig. Where
  they do not care, stop and record it as *free* — a decision nobody minds is worth knowing about,
  because it is the cheapest place to move later.
- **Chase the edge on anything that sounds like a goal.** *What would make this done?* in one
  sentence. *A goal without an edge can only be abandoned, not finished.*
- **Play it back in their words before writing it down.** *Confirm before it is recorded, not after.*
- **Leave tensions standing.** Two wishes that cannot both hold are the most useful thing an interview
  produces. Resolving them quietly makes the draft look finished and loses the choice.

## Coverage: the four specs are the checklist, not the agenda

Follow the owner through the conversation; check coverage against these at the end, and name the gaps
rather than filling them.

| Feeds | Ask about | Seed questions |
|---|---|---|
| **spec-domain** | the rules of the world, independent of any screen | What does the player do in the first ten seconds, and what makes them do it again? · Traz and Arkanoid are both paddle-and-brick — what does yours have that neither had, and what does it drop? · What can the player lose, and what does losing cost? · What moves that the player does not control? |
| **spec-app** | what a player and a developer actually meet | What does the player meet before play starts, if anything? · What input is assumed, and does it survive without a keyboard, or without a mouse? · What is still there tomorrow, and what is gone when the window closes? · What state are they in when they stop for the night? |
| **spec-style** | how it looks, sounds and feels | Name a screenshot you would be happy to have it mistaken for. · Is the C64 palette a constraint or a flavour — sixteen colours, or merely that feeling? · Is sound part of the feel or the last thing added? · What single visual choice would make it wrong? |
| **spec-tech** | **constraints only — never the choice** | Where does it have to run, on what, for whom? · What must be true whatever the stack is? · What is ruled out, and why? |

**Do not settle the stack here.** *A goal never carries an unmade technology decision* — the choice
becomes a goal of its own, proven by the smallest thing that exercises it. What the brainstorm
collects is what **rules technologies out**, which is the shape
[spec-tech.md](../../../doc/spec-tech.md) already records under A-1.

**Scope is the next step, but seed it while the owner is warm:** if only one level ships, which, and
what does it have to prove? · What gets cut first under pressure? · What is the smallest version you
would still enjoy playing?

## Recording

One file per session: `doc/brainstorm/<YYYY-MM-DD>.md`. Group by the spec that will consume it, and
in each group keep three things apart, because in a later session they read identically:

- **Said** — the owner's own words, quoted where the phrasing carries something.
- **Suggested and accepted** — yours, that they agreed to. Weaker evidence, and it must look weaker.
- **Open** — asked and not answered, not asked, or answered *don't care*. Say which of the three.

Then, separately: **tensions** left standing, and **what a spec cannot yet be written from**.

**Do not produce a coherent design at the end.** Coherence is the specification's job, and a tidy
synthesis hides which parts were chosen and which were smoothed over to make the summary read well.

## Superseding

A brainstorm is superseded by the specifications it feeds, not maintained. Once a spec owns an
answer, that document is the truth and the draft is only a record of how it got there — so **never
cite a brainstorm as authority**, and do not edit an old one to keep it current. Run it again instead;
a second interview on a project the owner now understands better is a different conversation, and
worth having as its own file.

## When not to run it

- **The owner already knows and wants it written.** Then write the spec and let them correct it —
  an interview about a settled question wastes the one thing this step spends, which is their
  attention.
- **To reopen something already decided.** That is a change to the document that owns it, argued on
  its merits.
