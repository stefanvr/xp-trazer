---
name: session
description: Open a session — run the machine checks, read what a session needs before it can work, and ask what would make this session finished. Takes quick (the default), which reads only the rules a machine already known to work needs, or full, which reads every document the project asks a session to know. Use at the start of a session, before anything else.
---

# Session

**Owns.** How a session opens: which checks it runs, which documents it reads, in which order, and
the question it asks before it starts working.

**Not here.** What each check means and what a bad answer implies — `doc/setup-ai-env.md`, which owns
the machine. How the session then works with the owner — `doc/guide-collaboration.md`. What is being
built — `doc/scope.md`. This skill is the order and nothing else: every fact it would otherwise state
is one of those documents' to state, and a copy here would be the one that goes stale.

**Quick is the default.** Most sessions open on a machine that worked yesterday, and reading
everything again to confirm that costs more than the rest of the opening put together.

---

## Which mode

| | Quick | Full |
|---|---|---|
| The machine checks | ✅ | ✅ |
| Is the default branch actually published | ✅ | ✅ |
| `doc/setup-ai-env.md` | its rules half | the whole document |
| `doc/guide-collaboration.md`, `doc/scope.md` | ✅ | ✅ |
| `doc/guide-general.md` with `doc/guide-override.md`, and the active lesson files | when the session reaches them | ✅ |

**Run full when quick's assumption does not hold** — that this is a machine already known to work:

- **The first session on a machine, or after a fresh clone.** Local configuration is not committed, so
  a clone starts without whatever was set by hand.
- **A check answered something other than its good answer.**
- **Something surprised you** — a command succeeded and did the wrong thing.
- **The session will scaffold, install, deploy or debug CI.** Those meet rules that come up nowhere
  else, and the rules half deliberately does not carry them.

**Quick is not a way past a bad answer.** A check that answers badly makes the session a full one from
that moment, rather than being noted and worked around.

## Quick

1. **Run the checks** in `doc/setup-ai-env.md`'s rules half, and read each answer against the good
   answer given beside it. Anything else, and this becomes a full session.
2. **Check that what the default branch points at is actually published.** The command is in
   `doc/setup-app-env.md` under *Verifying that it actually deployed* — read that section, not the
   whole file. A landing may have deferred this check to now, which is why it is part of opening a
   session and not only part of deploying.
3. **Read**, in this order: `doc/setup-ai-env.md` from the top to the line marking the end of its
   rules half, then `doc/guide-collaboration.md`, then `doc/scope.md`.
4. **Read a lesson file when the session reaches its technology**, and the principles guide when a
   decision needs one to settle it. **The principles and the overrides are read as a pair** —
   `doc/guide-general.md` with `doc/guide-override.md` beside it, never instead of it, because an
   override read alone is an exception without the rule it outranks.
5. **Ask the opening question** `doc/guide-collaboration.md` gives, which is what step 3 read it for.

## Full

The same order, reading whole documents rather than halves: `doc/setup-ai-env.md` entire, every active
lesson the project names, and `doc/guide-general.md` with `doc/guide-override.md` beside it, never
instead of it.

**Report which mode ran**, and why, if it was full. The two look identical afterwards, and only one of
them has actually checked the machine.

## What it touches

Nothing. It reads, checks, and asks.

## When not to run it

- **Mid-session, to look something up.** Read the document that owns the question. This is the
  opening, not a lookup.
- **As a substitute for the checks.** Where a session has already opened and the machine then changes
  underneath it — a different clone, a different branch of the toolchain — the checks are what to
  re-run, not the whole opening.
