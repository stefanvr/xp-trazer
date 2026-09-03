# Technical specification

**Owns.** What technologies chosen either for development purposes or runnning the application — the tech stack and tools.

**Not here.** Anything that owned by the setup-* docs
---

## The stack

| Concern | Choice | Beat |
|---|---|---|
| Language | TypeScript | Plain JavaScript, and no build step at all. |
| Runtime | Node 24 LTS | — |
| Dev server, build | Vite | — |
| Renderer | Canvas 2D | PixiJS. |
| Domain tests | Vitest | `node:test`. |
| Surface tests | Playwright | — |

**No game engine, and that was settled before the comparison.** **A-1** excludes anything that owns
the game loop or couples the simulation to frame time, which is Unity, Godot and Phaser — Phaser's
`update(time, delta)` and its arcade physics are frame-time driven. What is chosen above is a
renderer and a toolchain; the loop is this project's own.

Three of the rejections are worth a line, because each was close:

- **Plain JavaScript with no build step** would have removed a whole class of silent configuration
  failure. It loses the types that *fail loudly where it is cheap* leans on hardest inside a physics
  loop, and with no build there is nothing to stamp the commit identifier that **SF-7** requires.
- **PixiJS** would render a more convincing Tron glow through real WebGL filters, and it does not own
  the loop, so **A-1** survives it. It lost because the look is not this project's risk, and Canvas
  2D `shadowBlur` is already enough.
- **`node:test`** is one fewer dependency. Vitest wins on sharing Vite's module resolution, so domain
  tests and the application read the same imports.

**The page's `bounces` and `vx` readouts are the proof's instruments, not the game's surface.** They
exist so a smoke test can assert that the loop advanced and that a key reached the domain, and they
go when version one's surface arrives. The build identifier beside them stays: **SF-8** verifies a
deployment by fetching the artefact and reading it, never by asking a control API.

**Node's version is pinned at 24 by the machine, not by preference** — `nvm alias default` and
`node -v` agree there today, and **SF-1** is what makes checking that a session-start task rather
than a remembered fact.

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
