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
| Host | GitHub Pages | Cloudflare Pages, Netlify, Firebase Hosting — all lost to simplicity. |
| CI | GitHub Actions | Publishing by hand. |

**The host costs the repository its privacy.** GitHub Pages will not serve a private repository
without a paid plan, so the code, the documents and the history are public.

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

**The ball's behaviour is the proof's scaffolding, and is not a domain decision.** Boundary
reflection, the collision count and the acceleration an arrow key applies were written to exercise
the stack, before [spec-domain.md](spec-domain.md) existed to own any of them. **Nothing may cite
them as a rule**, and spec-domain replaces them without owing an argument.

**The code uses spec-domain's names, and that is all it uses of it.** A level of cells, elements,
bats and bat groups, holding and launching, a seed and clearing are all unbuilt. **A spec-domain name
found in `src/` does not mean the rule behind it is implemented.**

**The built page carries the commit it was built from.** A deployment is verified by fetching the
artefact and reading that identifier (**SF-8**), so it is a requirement of the stack rather than a
choice about the surface. What else the page shows is [spec-app.md](spec-app.md)'s, including which
of the proof's instruments survive.

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

### A-2 · One query parameter substitutes the level, and reaches nothing else

`?level=clearing-proof` loads a level built so the end-to-end suite can watch a level be cleared: one
bat, so DS-1.4's draw from the seed has a single candidate, and one destructible element in the
column the resting ball launches up. Any other value, and the absent case, load the authored level.

**Why it exists.** A-1 keeps behaviour testable over plain state, but *clearing arriving on the page*
is wiring, and wiring is only provable on the surface. The authored level cannot be cleared by a
test — unattended it took 28 bricks to 20 in 150 seconds, and steering the bats made it worse — so
without a level built for it, the one readout the player watches for the end of a level is asserted
nowhere.

**What it may never become.** A seam that substitutes a level, and nothing more. No rule, constant or
behaviour is reachable through it, and it is not level selection — that is a product decision
[spec-app.md](spec-app.md) would own, and this is not a back door to making it in code.
