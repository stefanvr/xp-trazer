# Design guidelines

**Owns.** How the code is shaped: its modules, its seams, and what has to stay testable.

**Not here.** Which technologies implement any of it — [spec-tech.md](spec-tech.md) — and this
project's own architectural rules, which are its application of what follows. What the project is
about — its subject matter, and the rules of the world it models — belongs to the specifications and
never here. Which principle wins when two rules *within this document* disagree is
[guide-general.md](guide-general.md).

**On how code is shaped, this document outranks [guide-general.md](guide-general.md).** That is the
one direction the routing did not previously state, and it is the direction that matters: a general
principle is written without knowing what a seam costs, so it loses to a design rule on a design
question. It still wins everywhere else, and it is still what settles a tie between two rules here.

**Precedence, in one line.** [spec-tech.md](spec-tech.md) beats this document, which beats
[guide-general.md](guide-general.md) on the shape of code — and guide-general beats everything on
anything else.

**[spec-tech.md](spec-tech.md) outranks this document wherever the two disagree.** What follows is
written to hold on any project; a project's own architecture is written knowing what is being built,
which is the better information. Record the departure in spec-tech in one line, so the next reader
meets a decision rather than a rule being quietly ignored.

**The test for belonging here.** A rule belongs here if it would still be true on a completely
different project. If it names a technology, a store, or a domain concept, it is this project's rule
and belongs in spec-tech. *"The domain imports no infrastructure"* is here; *"the simulation steps at
a fixed interval"* is not.

**Every rule carries its "when not to".** A rule with no stated exception eventually meets a case it
does not fit, gets quietly ignored, and takes the credibility of every other rule here with it. The
exception is what makes the rule survivable.

**This document ships filled in**, unlike the specifications. It is a standing preference rather than
a per-project decision: amend it when a convention proves itself, do not empty it to start.

---

## Structure

- **Build modular.** The test is whether a unit can be tested and replaced without opening its
  neighbours — not whether it has a file of its own.
- **Single responsibility at every level**: a function, a module, a document, a commit, a goal. Can
  you name what it does without using "and"? *Not when* two things always change together — splitting
  those produces coupling with extra steps.
- **The domain imports no infrastructure.** Domain logic is pure functions over plain types.
  Everything outside the process — a store, the network, the clock, the filesystem, the screen — is
  reached through an interface the **domain** owns and an adapter supplies, wired at the edge. The
  payoff is not swappability, which is usually hypothetical; it is that the domain becomes testable
  at all. *Not when* there is exactly one such dependency, never swapped, with no logic worth testing
  without it — record that in spec-tech in one line, so the next reader sees a decision rather than
  an oversight.
- **The clock is an input.** Code that reads "now" for itself cannot be tested for what it does at
  midnight.
- **Pure computation lives outside the renderer.** Replacing a renderer should mean replacing a draw
  function, not rewriting the interaction.
- **Commands mutate, queries read.** A function either changes state or answers a question, never
  both. A query that quietly mutates is the defect that survives every review, because the call site
  reads as a question. *Not when* the mutation is invisible to the caller — a cache fill, a lazily
  built index — where the answer is the same whether or not it happened.
- **CQRS where it earns it: nothing reads canonical state directly.** Reads go through one projection
  function, and that single seam is where filtering lives instead of leaking into every consumer ad
  hoc. Command and event names are the domain's own, with no translation layer — a shared vocabulary
  is lost the first time a name is improved in transit. *Not when* the state has no meaningful
  transitions, or has one consumer: a read model there is ceremony.
- **DRY applies to business rules, not to code that looks alike.** Two functions with the same shape
  and different reasons to change are not duplication. Deduplicate the **rule**, so one place decides
  and everywhere else asks. *Not when* the resemblance is coincidence — extracting a helper from two
  unrelated call sites couples them, and the bill arrives later, when one has to change and cannot.
- **What is allowed to be global: constants.** That is the whole list.
- **Fail loudly where it is cheap.** Assert invalid state and let it crash. A silent wrong answer is
  the failure class this document set exists to fight — [setup-ai-env.md](setup-ai-env.md) is an
  entire document about it one layer down.
- **Keep it small enough to hold.** If the core cannot be read end to end in one sitting, it has
  become clever.

## Testing

- **Tests are named as the behaviour claimed**, not as the function under test. A failing test should
  describe what broke before anyone opens the file.
- **Tests need not mirror the source layout.** Findable beats symmetrical. *When the mirror is
  wanted* it is because a module without a test should be conspicuous — that is a coverage question,
  and layout is a poor way to ask it.
- **Coverage sits where the state is, not where the pixels are.** Behaviour is exercised over plain
  state, in milliseconds, with no surface and no build step. The reason is not purity: surface-driven
  tests are slower and more brittle, and a suite whose coverage lives up there is a suite slow enough
  to stop being run. *Not when* the behaviour genuinely **is** the surface — a drawing tool, an
  interaction that is nothing but pointer precision — where forcing it into the state layer yields
  tests that pass while the screen is wrong. Record that in spec-tech in one line.
- **Surface tests are smoke tests: they prove wiring, not behaviour** — that a control reaches the
  command it claims to, that something was drawn. Anything they *could* assert belongs in a test that
  needs no surface.
- **Anything random is seeded**, and ties between equally valid options break deterministically —
  lowest id, a fixed order — never by iteration order, which may change. *Equally valid* and
  *arbitrary* are different things.

## Development affordances

- **Dev-only affordances are built, and gated.** A fixed fixture state, to reach an interesting
  situation without building it by hand every time; preview pages rendering real output from real
  code; and a gate — a flag, an environment check — so they never ship enabled. Document them as they
  are built: they are forgotten within a month otherwise, and rediscovered by accident much later.

---

## When to break these

Name the rule and the reason in the commit message. A rule broken quietly becomes the new rule by
accident, and nobody ever decides to make that change. Written down, the break is either a fair
exception or evidence the rule needs rewriting, and both are worth having.
