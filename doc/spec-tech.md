# Technical specification

**Owns.** What technologies chosen either for development purposes or runnning the application — the tech stack and tools.

**Not here.** Anything that owned by the setup-* docs
---

**The stack is not chosen yet.** No runtime, framework, renderer or test runner has been decided, and
nothing below implies one.

## Architecture

This project's application of [guide-design.md](guide-design.md) — rules that are true here and would
not be true on a different project, which is why they are not in that document.

### A-1 · The simulation advances by a fixed step

The simulation advances by a fixed amount the program controls, never by the wall-clock time measured
between frames. Rendering may interpolate between steps; the simulation may not consult the clock.

**Consequence.** Behaviour is a function of state and input, so it is tested over plain state with no
surface and no browser. *Coverage sits where the state is* applies here without exception, and the
"when not to" that rule carries — a product whose behaviour genuinely is the surface — is **not
claimable by this project**. Surface tests stay smoke tests that prove wiring.

**What it rules out.** Any technology that insists on owning the game loop, or that couples physics to
frame time, is excluded before the stack is chosen. Recording it here is what stops that being
rediscovered by violating it.

**What it rests on.** Three rules in [guide-design.md](guide-design.md) become load-bearing rather
than hygienic: the clock is an input, pure computation lives outside the renderer, and anything random
is seeded. Dropping any one of them for convenience breaks this silently — the game still plays, and
only the tests stop being trustworthy, while staying green.
