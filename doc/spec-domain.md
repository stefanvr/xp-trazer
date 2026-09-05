# Domain specification

**Owns.** The rules of the game world — what exists, what happens, and what makes a level finished.
Independent of any screen.

**Not here.** What the player meets — screens, input, flow, layout — is
[spec-app.md](spec-app.md); how it looks is [spec-style.md](spec-style.md); what it is built with is
[spec-tech.md](spec-tech.md).

**Scoped to version one.** Hazards, two modes, runs, lives and a map of levels are not part of it,
and none of them is named here — a rule written three goals early is written from a worse
understanding, and this is the expensive place to be wrong.

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
| **Cell** | The unit a level's grid is made of. Either empty, or holding one element. | `Cell` |
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
| **Step** | The simulation advancing once. It is the domain's unit of time, and the only one it has. | `step` |
| **Event** | Something that happened in the world. A step yields the events that happened during it. | `Event` |
| **Collision** | The ball meeting a boundary, a bat or a brick. | `Collision` |
| **Seed** | The value every random choice is drawn from, so a level start can be repeated exactly. | `seed` |
| **Game state** | Everything that changes while a level is played. | `GameState` |

## What happens

Every event, what causes it, and what it leaves changed. Nothing else happens in version one.

| Event | Caused by | Leaves changed |
|---|---|---|
| **Level started** | The game begins | The level exists. One of its bats, drawn from the seed, holds the ball. |
| **Bat group moved** | The player moves a group | Every bat of that orientation has moved, stopping at the boundary, at an element or at another bat. A held ball moves with its bat; a travelling ball a bat moved into collides with it. |
| **Ball launched** | The player launches it | The ball travels, perpendicular to the bat that held it and away from it. |
| **Ball moved** | The simulation advanced one step | The ball is somewhere new. |
| **Collision** | The ball and a boundary, a bat or a brick met — either of them may have been the one moving | The ball's direction changes, obeying the law of reflection. |
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
either visible. **A number, once issued, is never reused**, so a citation found in old code resolves
to the rule it meant or to nothing, never to a different rule.

### DS-1 · The level

- **DS-1.1** A level is closed. Nothing leaves it.
- **DS-1.2** A level authors where every element and every bat sits.
- **DS-1.3** A level has at least one bat.
- **DS-1.4** A level starts with the ball held by one of its bats, drawn from the seed.
- **DS-1.5** A level is in exactly one of three states: the ball is held, the ball is travelling, or
  the level is cleared.
- **DS-1.6** A bat has something the ball cannot pass on one of its two perpendicular sides — the
  level's edge today, and whatever else is placed against it later. The other side is open.
- **DS-1.7** A level authors no bat in the same place as another, and none with less room to slide
  than its own length. Neither is a position play could reach, and neither is one play could undo.
- **DS-1.8** A level authors at least one destructible element. One that authors none satisfies
  **DS-5.1** before it is played, so it is cleared before the player touches it.

**A level may still author an element where a bat's held ball would rest, and version one does not
refuse it.** Launching would drive the ball straight into that element on the first step — a brick
lost to the level's own layout rather than to the player — which is the same family of mistake as
**DS-1.7** and **DS-1.8**: a position play could not produce. Left unrefused because version one has
exactly one authored level and it does not do this; a second level's author should meet this sentence
before meeting the bug.

### DS-2 · The ball

- **DS-2.1** A held ball rests on its bat and moves with it, on the side **DS-1.6** leaves open.
- **DS-2.2** Launching sets the ball travelling perpendicular to the bat that held it, away from it —
  which is that same open side.
- **DS-2.3** A travelling ball advances every step.
- **DS-2.4** A ball that collides changes direction obeying the law of reflection.
- **DS-2.5** The ball's speed never changes. A collision changes where it is going, never how fast.
- **DS-2.6** A bat also turns the ball, by where along the bat it was met. The outer thirds send it
  away from the bat's middle; the middle third leaves its angle as reflection left it. **DS-2.5**
  still holds, so this is a turn and not a push.
- **DS-2.7** The ball is never inside what it collides with. It turns at the surface it met, and a
  bat that moves into the ball puts the ball outside itself — a bat meeting the ball is the same
  collision as the ball meeting the bat, because which of them moved does not change what happened.

**Without DS-2.6 the game cannot be played.** A ball launched perpendicular to its bat travels along
one axis, and reflection off an axis-aligned surface only ever reverses one component — so the other
stays zero for ever and the ball retraces one line. A bat is the only thing that can put the ball on
a new heading, which is what makes reaching it the point of moving one.

### DS-3 · Bats

- **DS-3.1** Every bat of one orientation belongs to one bat group, and a bat group moves as one
  thing.
- **DS-3.2** A bat group moves along its orientation's axis only.
- **DS-3.3** A bat stops at the boundary, at an element, and at another bat. Two bats never occupy
  the same space.
- **DS-3.4** Bats move whether the ball is held or travelling.

### DS-4 · Elements

- **DS-4.1** An element never moves.
- **DS-4.2** A destructible brick is destroyed by a collision with the ball.
- **DS-4.3** A permanent brick is never destroyed.

### DS-5 · Clearing

- **DS-5.1** A level is cleared when every destructible element has been destroyed.
- **DS-5.2** A cleared level does not advance.

### DS-6 · What the domain announces

- **DS-6.1** A step yields the events that happened during it, in the order they happened. A step in
  which none happened yields none.
- **DS-6.2** Two events are announced: **Collision** and **Element destroyed**. No other event this
  document names is.
- **DS-6.3** A collision names what the ball met — a boundary, a bat or a brick.
- **DS-6.4** A collision says whether it destroyed what it met.
- **DS-6.5** An element destroyed names the element that went.
- **DS-6.6** A collision that destroys an element announces both. The ball turned and the element
  went, and **DS-2.4** and **DS-4.2** are each true of it.
- **DS-6.7** A step may announce several collisions.

**DS-6.4 is not derivable from DS-6.3, and that is the point.** *Which brick was met* answers *was it
destroyed* only while **DS-4.2** destroys one in a single collision. A brick that has to be hit more
than once breaks that implication without touching anything here, and a consumer that had inferred
destruction from the kind would go on inferring it wrongly. The collision says what happened to what
it met, rather than leaving that to be worked out from a rule that may change.

**DS-6.5 names the element although the state also records it.** An event that cannot be understood
without diffing the state it arrived with is not an announcement, and not having to diff is what
**DS-6** is for.

**DS-6.7 is not decoration.** A step can produce a collision from a bat pushing the ball out under
**DS-2.7**, and then one on each axis. A reader who assumed one collision per step would be wrong on
the first bat that moves into a travelling ball.

## What a level is, as data

**A level is a grid of cells.** Its width and height are counted in cells, and a cell is either empty
or holds one element.

**Cells are the only thing elements know about.** An element occupies exactly one cell, so every
surface in a level is a cell face — horizontal or vertical, never anything else. That is what makes
**DS-2.4** exact rather than approximate: a collision reflects across one axis, and there is no other
kind of surface to meet.

**The ball and the bats are continuous; elements are not.**

- A cell has a fixed size, so a level's extent follows from its grid.
- The ball has a position anywhere in that extent, and a size that is the same in every level.
- A bat lies on one row or one column, and has a continuous position along it. **DS-3.3** stops it
  where the next cell along is occupied.
- Every bat is the same length.

**What a level authors, and what it does not.**

| Authored | Not authored |
|---|---|
| The grid's width and height | Where the ball starts — **DS-1.4** draws its bat from the seed |
| Which cells hold a destructible brick, and which hold a permanent one | The ball's size, and every bat's length: the same in every level |
| Where each bat sits, and on which row or column | The seed. A level that authored it would draw the same bat every time, which is not a draw |

## What a game holds while it runs

A level is what was authored and never changes. The game state is everything that does.

- **The level being played, and the seed it started from.** Neither changes while it runs.
- **Where the ball is, which way it is going, and how fast.**
- **Which destructible elements are still there.**
- **Where each bat group is along its axis.**
- **Whether the ball is held — and by which bat — or travelling.**
- **Whether the level is cleared.**

**Events are not held.** A step's events say what changed; the state says what is. Keeping them here
would mean a state that answers *what just happened*, which is true only until the next step and
wrong for every reader who arrives after it.

**The ball's speed is state, even though nothing in version one changes it.** **DS-2.5** fixes it for
now, but speed is the kind of thing a later rule alters as a game goes on, and something that changes
over time belongs to the state rather than to the level or to a constant. Putting it here costs
nothing now and means such a rule adds a rule rather than a re-modelling.

## What an event is, as data

**An event is a value, and there are two kinds.**

| Event | Carries |
|---|---|
| **Collision** | What the ball met — a boundary, a bat or a brick — and whether the collision destroyed it |
| **Element destroyed** | The cell the element occupied |

**A collision does not say which bat or which brick.** Nothing reads it, and where a brick goes,
**DS-6.5** already names the cell.

**An element destroyed names a cell.** A level is a grid of cells, so a cell is what the domain has
to point with; how one is stored is the implementation's business and not this document's.

**The destroyed flag is answerable for every collision, and is false for a boundary and a bat.**
Neither can be destroyed, so the question has an answer everywhere rather than existing on one of the
three shapes and not the others.

**An event carries no time.** A step is the unit of time and an event happened during the step that
yielded it, so there is nothing for a moment to add. Written down because the field that would break
this looks harmless: the simulation may not consult the clock, and a timestamp is the clock.

**Nothing is authored and nothing is looked up.** A level authors elements and bats; events are
produced by play, so there is no reference data here.

## Not named, because version one does not need them

Named as absent rather than left to be rediscovered: **hazard**, **run**, **life**, **arcade**,
**journey**, **map**, **unlocked**, **selection**. None of them is part of version one.
