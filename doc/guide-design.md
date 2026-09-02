# Design guidelines

**Owns.** How the code is shaped: what the parts are, which way the dependencies point, where state
lives, and what has to stay testable.

**Not here.** *Which* runtime, framework, renderer or test tool implements any of this — that is
[spec-tech.md](spec-tech.md), which is deliberately still empty. What the game is to play — rules,
levels, feel — is not owned by any document yet, and does not belong here when it is. Which principle
wins when two of these rules disagree is [guide-general.md](guide-general.md).

**Written before the stack, on purpose.** Nothing below names a technology, and that is a constraint
rather than an accident: it forces each rule to be about the shape of the program instead of the habits
of a library. It also gives the rules a use — they are what the stack choice in
[spec-tech.md](spec-tech.md) will be judged against, rather than something retrofitted to justify it.
**If a rule here cannot be stated without naming a framework, it is a technology decision in disguise
and belongs in spec-tech.**

---

## The one rule

> **The game is a function of state and input. Everything else is a projection of state.**

```
next_state = step(previous_state, input, dt)
```

`step` is pure: same inputs, same output, every time. It reads no clock, no keyboard, no random source,
no file. Input is *captured into a value* before the step runs, never read from inside it. Rendering
reads state and produces pixels; it never writes state back.

**Why this one is first.** It is what turns a bug from a story into a value. "The ball sometimes escapes
through the corner" is unfixable; a state and an input sequence that reproduce it every time is a test.
Every other rule below exists to keep this one true.

---

## Dependency direction

| Layer | May depend on | Holds |
|---|---|---|
| **core** | nothing — no I/O, no clock, no globals, no framework | the rules: ball, paddle, bricks, collision, scoring, level state |
| **adapters** | core | renderer, input source, audio, storage, the real clock |
| **composition root** | core and adapters | the single place the two meet, and the only place that wires them |

**The arrow never reverses.** The core must not know that a screen exists, that a frame exists, or that
a player exists. When it needs something from the outside, it takes it as an argument or returns a
request as data — it does not reach for it.

**The check that is hard to fool:** can the core run to completion in a plain test process, with no
display, no canvas, no timer and no event loop? If not, something has leaked across, and the leak is
usually a convenience import added in a hurry.

---

## Determinism is a feature, not a nicety

- **Fixed timestep for the simulation.** The step advances by a constant `dt`. Never step by measured
  wall-clock delta — a slow frame must not change the physics, or a bug becomes unreproducible on a
  different machine, which is the same as unfixable. Render may interpolate between steps; the
  simulation may not.
- **All randomness comes from a seeded generator carried in state.** Never a global random source.

**What determinism buys.** A replay is then just a seed plus an input log — a few hundred bytes that
reproduce a session exactly. That is simultaneously the cheapest possible bug report, the strongest
kind of test a game can have (record, replay, assert the end state), and the only way to be sure a
refactor changed nothing.

It is also the concrete answer to [guide-general.md](guide-general.md)'s "a passing test says the code
ran, not that the output is right": determinism is what makes the output something a test can pin down.

---

## State

**One owned state tree per session, mutated in exactly one place** — inside the step. Everything else
receives it, reads it, and hands it back.

**No hidden state in adapters.** The distinction worth holding: a renderer that keeps the previous
frame to avoid redrawing is caching, and that is fine. A renderer that keeps *where the ball is* is a
second copy of the game, and the two copies will disagree — silently, and usually only under the
conditions that are hardest to reproduce.

**The cost is explicitness**: state gets passed around rather than reached for. Accept it.

---

## Levels and tuning are data, not code

Brick layouts, speeds, spawn rules, level order — data. A level expressed in code cannot be inspected,
diffed, generated, or edited by anyone who is not editing the program, and every one of those is
something this project will want.

This is also the seam where the game gets tuned. Tuning that requires a code change gets done once;
tuning that requires editing a table gets done until it is right.

---

## What is allowed to be global

Constants.

That is the entire list. Anything else global is state that no test can isolate and no replay can
reproduce, which contradicts everything above.

---

## Fail loudly where it is cheap

Assert invalid state in the core during development, and let it crash. A silent wrong answer is the
exact failure class this project is organised against — [setup-ai-env.md](setup-ai-env.md) is a whole
document about it at the environment layer, and the same reasoning applies one layer in. A ball with a
NaN velocity should stop the program, not quietly render nothing.

---

## Keep it small enough to hold

If the core cannot be read end to end in one sitting, it has become clever. Prefer the boring, obvious
version: this is a game with a paddle, a ball and a grid of bricks, and there is no size of cleverness
that pays for itself at that scale.

---

## Deliberately not decided yet

These are real questions that this document is **not** the place to answer, listed so that nobody
mistakes the silence for an oversight:

- The renderer, the runtime, the test runner, the build — [spec-tech.md](spec-tech.md).
- File and module layout in the repository — follows the stack, so it waits for the stack.
- Whether an entity/component arrangement is wanted. Not until something demands it; per
  [guide-general.md](guide-general.md), generality added before it is needed is a guess.

---

## When to break these

Break one when it is genuinely wrong for the case in hand, and name the rule and the reason in the
commit message.

The reason for the naming is not ceremony: a rule that gets broken quietly becomes the new rule by
accident, and nobody ever decides to make that change. Written down, the break is either a fair
exception or evidence that the rule needs rewriting — and both of those are useful.
