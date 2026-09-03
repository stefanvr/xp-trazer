# Orientation

## AI mandatory instructions for local dev environment

Read it **before running any command**: doc/setup-ai-env.md 

## Workflow

Start with asking the goal of the session.

### Bootstrap

A project is brought into being in this order:

1. **Brainstorm the global idea** — an interview with the owner, run by the `brainstorm` skill.
   Everything it produces is draft and lands in `doc/brainstorm/`.
2. **Scope the first version** — the overarching goal, written to `doc/scope.md`.
3. **Write the minimal specs** — `doc/spec-domain.md`, `doc/spec-app.md`, `doc/spec-style.md`,
   `doc/spec-tech.md` — **in any order**. No dependency is implied between them, so none of them
   blocks another.

A spec that does not exist yet means the sequence has not reached it. That is the plan working, not
something missing.

### Implementation

Any goal that will produce or change code runs the `build` skill first — it decides whether the code
is a proof of wiring or product functionality, and only the second one needs a specification to exist
before it is written.

### GIT

* Always create a branch before starting new goal
* Always commit task size
* Always push commits of the tasks performed, before going back to the user
* Always let the user approve a merge to main for release
* On approval, run the `land` skill **before** merging — it clears `doc/scratchpad/`, and replaces
  the goal in `doc/scope.md` if this landing reached it
* After a merge to main, delete local and remote feature branch

### Understanding the project

This project keeps its decisions in `doc/`. Each document owns exactly one kind of decision, and this
is the routing — which document answers which question.

| Question | Document |
|---|---|
| What is being built now, where does it stop, and what does done mean? | `doc/scope.md` |
| How does the AI work on this machine, and what fails silently? | `doc/setup-ai-env.md` |
| What has to be installed and configured before anyone can develop here? | `doc/setup-dev-env.md` |
| Where does it run, how does it get there, and how do we know it did? | `doc/setup-app-env.md` |
| Which principle settles it when two reasonable approaches both fit? | `doc/guide-general.md` |
| What outranks those principles for this project, and until when? | `doc/guide-override.md` |
| How is the code shaped — modules, seams, what stays testable? | `doc/guide-design.md` |
| Which technologies, and this project's own architecture rules? | `doc/spec-tech.md` |
| What are the rules of the game world? | `doc/spec-domain.md` |
| What do the player and the developer meet — screens, input, flow? | `doc/spec-app.md` |
| How does it look, sound and feel? | `doc/spec-style.md` |

The last three do not exist yet. See **Bootstrap** above: that means the sequence has not reached
them.

**Drafts and working notes own no decision, and are never cited as authority** — `doc/brainstorm/`
holds interview drafts, and `doc/scratchpad/` holds working notes, including discovery snapshots,
cleared when the goal lands.

**`doc/scope.md` holds one overarching goal, and is replaced when that goal is reached.** A
specification outranks it the moment it exists.

**Reading order at session start.** `doc/setup-ai-env.md` before any command, then
`doc/guide-general.md` with `doc/guide-override.md` beside it — never instead of it — then
`doc/scope.md`, then whichever document above owns the decision in front of you.