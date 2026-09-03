# Orientation

## AI mandatory instructions for local dev environment

Read it **before running any command**: doc/setup-ai-env.md 

## Workflow

Start with asking the goal of the session.

### Bootstrap

A project is brought into being in this order:

1. **Brainstorm the global idea** — an interview with the owner, run by the `brainstorm` skill.
   Everything it produces is draft and lands in `doc/brainstorm/`.
2. **Scope the first version.**
3. **Write the minimal specs** — `doc/spec-domain.md`, `doc/spec-app.md`, `doc/spec-style.md`,
   `doc/spec-tech.md` — **in any order**. No dependency is implied between them, so none of them
   blocks another.

A spec that does not exist yet means the sequence has not reached it. That is the plan working, not
something missing.

### GIT

* Always create a branch before starting new goal
* Always commit task size
* Always push commits of the tasks performed, before going back to the user
* Always let the user approve a merge to main for release
* On approval, run the `land` skill **before** merging — a goal lands with `doc/scratchpad/` cleared
* After a merge to main, delete local and remote feature branch

### Understanding the project

This project keeps its decisions in `doc/`. Each document owns exactly one kind of decision, and this
is the routing — which document answers which question.

| Question | Document |
|---|---|
| How does the AI work on this machine, and what fails silently? | `doc/setup-ai-env.md` |
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

**Reading order at session start.** `doc/setup-ai-env.md` before any command, then
`doc/guide-general.md` with `doc/guide-override.md` beside it — never instead of it — then whichever
document above owns the decision in front of you.