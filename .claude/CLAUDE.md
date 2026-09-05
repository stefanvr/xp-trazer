# Orientation

## AI mandatory instructions for local dev environment

Read it **before running any command**: doc/setup-ai-env.md 

## Workflow

Start with asking the goal of the session.

### Reporting

* Structure it — a table wherever the content has repeating fields
* Mark a question as a question. Never leave an ask implied inside an observation, and say plainly
  when a note needs no answer

### Bootstrap

A project is brought into being in this order:

1. **Brainstorm the global idea** — an interview with the owner, run by the `brainstorm` skill.
   Everything it produces is draft and lands in `doc/brainstorm/`.
2. **Scope the first version** — the overarching goal, written to `doc/scope.md` by the `scope`
   skill in `create` mode.
3. **Write the minimal specs** — `doc/spec-domain.md` (the `domain` skill), `doc/spec-app.md` (the
   `app` skill), `doc/spec-style.md`, `doc/spec-tech.md` — **in any order**. No dependency is implied
   between them, so none of them blocks another.

A spec that does not exist yet means the sequence has not reached it. That is the plan working, not
something missing.

### Implementation

Any goal that will produce or change code runs the `build` skill first — it decides whether the code
is a proof of wiring or product functionality, and only the second one needs a specification to exist
before it is written.

### GIT

* Always create a branch before starting new goal — several goals may share one branch when they
  only make sense together, so the merge lands as one consistent unit
* Always commit task size
* Always push commits of the tasks performed, before going back to the user
* **Experiment — the branch is rewritten before it lands, so its commits are the work and not the
  corrections.** Commit freely while working; then fold each correction into the task it belongs to,
  leaving commits that each build on their own, and force-push. Rewrite first, then run `land`, so
  the landing commit sits on the history that is kept. **Ends when** the rewriting costs more than
  the log is worth, or a second person is working on a branch.
* Always let the user approve a merge to main for release
* On approval, run the `land` skill **before** merging — it clears `doc/scratchpad/`, and where the
  landing looks like it reaches the overarching goal it calls `scope check`, which marks it reached
* **Setting the next overarching goal is never part of a landing** — it is bootstrap step 2, run as
  `scope create`, separately and whenever the owner chooses
* After a merge to main, delete local and remote feature branch

### Understanding the project

This project keeps its decisions in `doc/`. Each document owns exactly one kind of decision, and this
is the routing — which document answers which question.

| Question | Document |
|---|---|
| What is being built now, where does it stop, and what does done mean? | `doc/scope.md` |
| How does the AI work on this machine, and what fails silently? | `doc/setup-ai-env.md` |
| What has gone wrong with a particular technology before? | `doc/lessons/<technology>.md` |
| What has to be installed and configured before anyone can develop here? | `doc/setup-dev-env.md` |
| Where does it run, how does it get there, and how do we know it did? | `doc/setup-app-env.md` |
| Which principle settles it when two reasonable approaches both fit? | `doc/guide-general.md` |
| What outranks those principles for this project, and until when? | `doc/guide-override.md` |
| How is the code shaped — modules, seams, what stays testable? | `doc/guide-design.md` |
| Which technologies, and this project's own architecture rules? | `doc/spec-tech.md` |
| What are the rules of the game world? | `doc/spec-domain.md` |
| What does the player meet — screens, input, flow, layout? | `doc/spec-app.md` |
| How does it look, sound and feel? | `doc/spec-style.md` |

**Drafts and working notes own no decision, and are never cited as authority** — `doc/brainstorm/`
holds interview drafts, and `doc/scratchpad/` holds working notes, including discovery snapshots,
cleared when the goal lands.

**`doc/scope.md` holds one overarching goal, and is replaced when that goal is reached.** A
specification outranks it the moment it exists.

**`doc/lessons/` is a library, not a plan.** One file per technology. A file for a technology this
project does not use is a lesson held for the project that does — never a choice, and never a
backlog.

**Active lessons — read these at session start:**

* `doc/lessons/node.md`
* `doc/lessons/playwright.md`
* `doc/lessons/github-pages.md`
* `doc/lessons/github-actions.md`

**That list is an index, not the authority.** It is the technologies `doc/spec-tech.md` chooses that
have a lesson written, copied here so that reading spec-tech is not a prerequisite for knowing what
to read. Where the list and those two disagree, **the list is wrong**. It can only change at two
moments, and both are moments something else is already being edited: **a chosen technology gains a
lesson file, or a lesson file's technology gets chosen.**

**Reading order at session start.** `doc/setup-ai-env.md` before any command, then the active lessons
above, then
`doc/guide-general.md` with `doc/guide-override.md` beside it — never instead of it — then
`doc/scope.md`, then whichever document above owns the decision in front of you.