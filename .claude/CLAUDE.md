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
* After a merge to main, delete local and remote feature branch

### Understanding the project

This project keeps its decisions in `doc/`. Each document owns exactly one kind of decision.

`doc/guide-override.md` holds what currently outranks the general principles. Read it together with
`doc/guide-general.md`, never instead of it.