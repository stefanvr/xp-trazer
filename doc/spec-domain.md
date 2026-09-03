# Domain specification

**Owns.** The rules of the game world — what exists, what happens, and what makes a level finished.
Independent of any screen.

**Not here.** What the player and the developer meet — screens, input, flow — is
[spec-app.md](spec-app.md); how it looks is [spec-style.md](spec-style.md); what it is built with is
[spec-tech.md](spec-tech.md). What is in version one at all is [scope.md](scope.md).

**Scoped to version one.** The brainstorm describes hazards, two modes, runs, lives and a map of
levels; [scope.md](scope.md) puts every one of them out. None of them is named here — a rule written
three goals early is written from a worse understanding, and this is the expensive place to be wrong.

**This document states the desired state.** Where the code disagrees with a name below, the code is
wrong.

---

## The vocabulary

The domain's words are the code's words, and nothing is renamed in transit.

**What moves a thing is what separates the kinds.** A level places elements, and nothing moves them.
The player moves bats. The ball moves itself.

| Term | What it is | In code |
|---|---|---|
| **Level** | The closed space play happens inside, and the authored arrangement in it. Nothing leaves it. | `Level` |
| **Boundary** | The level's edge. | `Boundary` |
| **Element** | A fixed thing a level places. In version one, every element is a brick. | `Element` |
| **Brick** | An element that occupies space in the level. | `Brick` |
| **Destructible brick** | A brick destroyed by a collision with the ball. | `DestructibleBrick` |
| **Permanent brick** | A brick that is never destroyed, and that clearing ignores. | `PermanentBrick` |
| **Bat** | A thing the player moves, lying along one axis. | `Bat` |
| **Bat group** | Every bat of one orientation. A group moves as one thing. | `BatGroup` |
| **Ball** | The moving thing the player never controls directly. | `Ball` |
| **Held** | The ball before it travels: resting on a bat, and moving with it. | `held` |
| **Launch** | The player setting the held ball travelling. | `launch` |
| **Cleared** | What a level becomes when every destructible element has been destroyed. | `cleared` |
| **Collision** | The ball meeting a boundary, a bat or a brick. | `Collision` |
| **Seed** | The value every random choice is drawn from, so a level start can be repeated exactly. | `seed` |

## What happens

Every event, what causes it, and what it leaves changed. Nothing else happens in version one.

| Event | Caused by | Leaves changed |
|---|---|---|
| **Level started** | The game begins | The level exists. One of its bats, drawn from the seed, holds the ball. |
| **Bat group moved** | The player moves a group | Every bat of that orientation has moved, stopping at the boundary or at an element. A held ball moves with its bat. |
| **Ball launched** | The player launches it | The ball travels, perpendicular to the bat that held it and away from it. |
| **Ball moved** | The simulation advanced one step | The ball is somewhere new. |
| **Collision** | The ball met a boundary, a bat or a brick | The ball's direction changes, obeying the law of reflection. |
| **Element destroyed** | A collision with the ball | One fewer destructible element. |
| **Level cleared** | The last destructible element was destroyed | The level is cleared, and nothing advances after it. |

**A level is in one of three states and no others**: the ball is held, the ball is travelling, or the
level is cleared. Version one has no way to lose, so nothing leaves the middle state except clearing.

**Every event above is caused by something above it, or by the player.** That is what makes this list
finished rather than merely long — an event nothing causes, or one whose result nothing reads, is
the gap this activity exists to find.

## The rules

Numbered so code and tests can cite them. A rule nothing cites is either unbuilt or unnecessary, and
a citation that resolves to nothing is a rule dropped without saying so — the number is what makes
either visible.

### DS-1 · The level

- **DS-1.1** A level is closed. Nothing leaves it.
- **DS-1.2** A level authors where every element and every bat sits.
- **DS-1.3** A level has at least one bat.
- **DS-1.4** A level starts with the ball held by one of its bats, drawn from the seed.
- **DS-1.5** A level is in exactly one of three states: the ball is held, the ball is travelling, or
  the level is cleared.

### DS-2 · The ball

- **DS-2.1** A held ball rests on its bat and moves with it.
- **DS-2.2** Launching sets the ball travelling perpendicular to the bat that held it, away from it.
- **DS-2.3** A travelling ball advances every step.
- **DS-2.4** A ball that collides changes direction obeying the law of reflection.

### DS-3 · Bats

- **DS-3.1** Every bat of one orientation moves together, as one thing.
- **DS-3.2** A bat moves along its own axis only.
- **DS-3.3** A bat stops at the boundary and at an element.
- **DS-3.4** Bats move whether the ball is held or travelling.

### DS-4 · Elements

- **DS-4.1** An element never moves.
- **DS-4.2** A destructible brick is destroyed by a collision with the ball.
- **DS-4.3** A permanent brick is never destroyed.

### DS-5 · Clearing

- **DS-5.1** A level is cleared when every destructible element has been destroyed.
- **DS-5.2** A cleared level does not advance.

## Not named, because version one does not need them

Named as absent rather than left to be rediscovered: **hazard**, **run**, **life**, **arcade**,
**journey**, **map**, **unlocked**, **selection**. The brainstorm carries all of them and
[scope.md](scope.md) puts them out of version one.
