---
name: app
description: Write or extend doc/spec-app.md — story-map what the player does, decide where each step surfaces, and lay out the screens it needs. Use when the goal is to write or change what the player meets: screens, input, flow.
---

# App

**Owns.** How `doc/spec-app.md` gets written and extended: which activities a pass runs, and what
has to be true before the result is called a specification.

**Not here.** The rules of the world — `doc/spec-domain.md` and the [domain](../domain/SKILL.md)
skill. How anything looks, a logo's placement included — `doc/spec-style.md`. How sound or animation
is technically produced, and every other technology choice — `doc/spec-tech.md`. Git mechanics —
[CLAUDE.md](../../CLAUDE.md).

**The player, not the developer.** A story map is about tasks a user does in the product, and a
developer is not one. What a developer meets is already owned: `doc/guide-design.md` says dev-only
affordances are built, gated, and documented as they are built, and the [style](../style/SKILL.md)
skill does exactly that for `dev/style.html`.

**A specification states the desired state**, with no marker saying who proposed something or how
settled it is. The [domain](../domain/SKILL.md) skill carries the full argument; it holds here
unchanged.

---

## The three activities

**The first step is choosing which this pass runs, and saying why in one line.** Not every pass needs
all three.

| Activity | Produces | Skip it when |
|---|---|---|
| **Story map** | What a player does, in three levels | Nothing new is being done, only moved or restyled |
| **Interaction design** | Where and how each step surfaces, and what triggers sound or animation | The pass adds no step and moves none |
| **Layout** | Which screens exist, their modes, and whether there is chrome | Nothing changes what surfaces exist |

### The story map has three levels

1. **Activities** — high-level tasks a player can do in the product.
2. **Steps** — what a player goes through to complete an activity.
3. **Details** — the granular, discrete interactions that complete a step.

**Every level is the minimum that completes the level above.** Details are the smallest set that
completes the step; activities are tested against `doc/scope.md` the same way. **The next iteration
is the minimal extension**, not the next tranche of a design that was worked out in advance.

### Layout sits beside interaction on purpose

Layout is which surfaces exist and what shape they take — for a browser usually two modes, small and
large; whether there is a header or a footer, and whether always.

It lives with interaction because the two go back and forth. *A placeholder in the topbar, clicked,
becomes a profile picture; clicked again, it logs out* is a step with details, and it touches layout
only because layout is where interaction happens. Across a document boundary that loop becomes two
edits and a disagreement.

**What layout is not**: how sound or animation is produced (`spec-tech`), or where a logo sits as a
visual choice (`spec-style`).

## Name the mode before running an activity, not after

As in the [domain](../domain/SKILL.md) skill: **the owner proposes** where the words or the wants are
already theirs, **the agent proposes and the owner corrects** where the material is thin, and a
brainstorm entry marked *said* is **already settled** — transcription with scrutiny, not an
interview. Say which before starting; discovering it afterwards is how a proposal gets accepted as
though it had been asked for.

## Scrutiny

The first two are the owner's discipline, stated as checks. **The last two are the agent's and are
untested.**

1. **Every detail is the minimum that completes its step.** *A detail the step would still be
   complete without is the finding* — it belongs to a later iteration, as a minimal extension.
2. **Every activity is in the scope.** Test the top level against `doc/scope.md`. *An activity the
   scope puts out is the finding*, however obviously the product will want it later.
3. **Every step surfaces somewhere.** Interaction design must say where each step happens. *A step
   with no surface is a gap*, and it is the one that reaches implementation as a guess.
4. **Nothing here decides what another specification owns.** *A rule about how a thing looks, what
   the world's rules are, or which technology produces something is the finding* — it belongs to
   spec-style, spec-domain or spec-tech, and this document asks rather than answers.

**This routine is what catches the concerns nobody owned.** Screen size, a header, a footer, whether
something lives in a menu — these went unwritten on a sibling project because no routine ever asked.
Listing Layout as an activity with a stated *skip it when* means a pass either runs it or says why
not, which is the point at which their absence becomes visible.

## Revision here is the work

A draft that changes while being written is this routine succeeding. What must not happen is arriving
at the understanding *after* implementation stands on the earlier version — the
[domain](../domain/SKILL.md) skill carries the full argument.

## The shape of the work

**One branch, one commit per activity.** The story map comes first, because interaction and layout
are both founded on its steps, and a step that turns out wrong invalidates whatever was arranged
around it.

## When not to run it

- **The change is to something the specification already owns**, and no activity is being added,
  moved or surfaced. That is an edit to `spec-app.md`, argued on its merits.
- **The goal is implementation.** [build](../build/SKILL.md) owns that, and will send you here if the
  behaviour has no specification to sit in.
- **`spec-domain.md`.** Different technique, different routine.
