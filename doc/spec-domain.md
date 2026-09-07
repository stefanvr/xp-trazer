# Domain specification

**Owns.** The rules of the game world — what exists, what happens, and what makes a level finished.
Independent of any screen.

**Not here.** What the player meets — screens, input, flow, layout — is
[spec-app.md](spec-app.md); how it looks is [spec-style.md](spec-style.md); what it is built with is
[spec-tech.md](spec-tech.md).

**Not specified yet.** Two modes, runs, lives and a map of levels. None of them is named here — a
rule written three goals early is written from a worse understanding, and this is the expensive
place to be wrong.

**This document states the desired state.** Where the code disagrees with a name below, the code is
wrong.

---

## The vocabulary

The domain's words are the code's words, and nothing is renamed in transit.

**What moves a thing is what separates the kinds.** A level places elements, and nothing moves them.
The player moves bats. The ball moves itself.

**Object has no code of its own yet.** Nothing unions an element, a bat and the boundary into one
type today, and nothing needs to. When something does, it cannot be spelled `Object` — TypeScript
reserves that name for the language's own type — so the identifier is a decision for whenever code
first needs one, not a decision this table makes early.

| Term | What it is | In code |
|---|---|---|
| **Level** | The closed space play happens inside, and the authored arrangement in it. Nothing leaves it. | `Level` |
| **Object** | The overarching kind for everything a level places or is bounded by — an element, a bat, or the boundary. A later kind, such as a bonus, joins it without widening the word. | — |
| **Boundary** | The level's edge. | `Boundary` |
| **Cell** | The unit a level's grid is made of. Either empty, or holding one element. | `Cell` |
| **Element** | A fixed thing a level places. | `Element` |
| **Element kind** | Which kind of thing an element is. Four kinds have rules — the bricks and the trap below; **DS-7.1** carries three that have none. | `ElementKind` |
| **Brick** | An element that occupies space in the level. | `Brick` |
| **Destructible brick** | A brick destroyed by a collision with the ball. | `DestructibleBrick` |
| **Permanent brick** | A brick that is never destroyed, and that clearing ignores. | `PermanentBrick` |
| **Trap** | An element that destroys the ball on collision, and unlike a brick is never destroyed itself. | `TrapKind` |
| **Footprint** | The cells one element occupies. | `footprint` |
| **Color id** | What an element or a level is authored to be colored. An id and not a color — [spec-style.md](spec-style.md) says what an id is drawn in. | `colorId` |
| **Origin** | Which room of the original a level was imported from. | `origin` |
| **Bat** | A thing the player moves, lying along one axis. | `Bat` |
| **Bat group** | Every bat of one orientation. A group moves as one thing. | `BatGroup` |
| **Ball** | The moving thing the player never controls directly. | `Ball` |
| **Ball start** | Where a level authors the ball to wait before it travels. | `ballStart` |
| **Held** | The ball before it travels: waiting at the ball start, moved by nothing. | `held` |
| **Launch** | The player setting the held ball travelling. | `launch` |
| **Cleared** | What a level becomes when every destructible element has been destroyed. | `cleared` |
| **Step** | The simulation advancing once. It is the domain's unit of time, and the only one it has. | `step` |
| **Event** | Something that happened in the world. A step yields the events that happened during it. | `Event` |
| **Collision** | The ball meeting a boundary, a bat or a brick — never a trap, which destroys the ball instead of colliding with it. | `Collision` |
| **Seed** | The value every random choice is drawn from, so a level start can be repeated exactly. | `seed` |
| **Game state** | Everything that changes while a level is played. | `GameState` |
| **Run** | One continuous play-through: the lives and score a player carries as levels are cleared and replaced, until it ends. | `Run` |
| **Lives** | The run's count of remaining chances. Starts at five; a ball destroyed spends one. | `lives` |
| **Score** | The run's count of points. A level cleared adds one. | `score` |
| **Game over** | What a run becomes when its lives reach zero. | `gameOver` |

## What happens

Every event, what causes it, and what it leaves changed. Nothing else happens.

| Event | Caused by | Leaves changed |
|---|---|---|
| **Run started** | The player begins playing — opening the page, or restarting a run that is game over | The run's lives are five, and its score is zero. |
| **Level started** | A run beginning, or the player continuing a run whose level was just cleared | The level exists. The ball is held, at the ball start the level authors. |
| **Bat group moved** | The player moves a group | Every bat of that orientation has moved, stopping at the boundary, at an element or at another bat. A travelling ball a bat moved into collides with it; a held ball is not on a bat and does not move with one. |
| **Ball launched** | The player launches it | The ball travels, in a direction drawn from the seed. |
| **Ball moved** | The simulation advanced one step | The ball is somewhere new. |
| **Collision** | The ball and a boundary, a bat or a brick met — either of them may have been the one moving | The ball's direction changes, obeying the law of reflection. |
| **Ball destroyed** | The ball met a trap | The ball returns held, at the ball start, and the run has one fewer life. |
| **Element destroyed** | A collision with the ball | One fewer destructible element. |
| **Level cleared** | The last destructible element was destroyed | The level is cleared, nothing advances after it, and the run's score gains one point. |
| **Game over** | A ball destroyed left the run with no lives | The run is game over, and nothing in it advances further. |

**A level is in one of three states and no others**: the ball is held, the ball is travelling, or the
level is cleared. **Two things now leave the travelling state, and they do not leave it the same
way**: clearing does not return, and a trap sends the ball back to held rather than forward —
**DS-8** owns that. **A run wraps this in two states of its own** — playing, or game over — and
**DS-9** owns those. Losing a life does not touch which of a level's three states it is in: the ball
simply returns held, the way any trap always sent it, and a level still ends, on its own account, only
by being cleared. What ends when a run runs out of lives is the run, and it stops that level's play
rather than giving the level a fourth state of its own.

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
- **DS-1.4** A level starts with the ball held at the ball start it authors. Every level authors one.
- **DS-1.5** A level is in exactly one of three states: the ball is held, the ball is travelling, or
  the level is cleared.
- **DS-1.6** *Withdrawn.* A bat used to be required to have something the ball could not pass on one
  of its two perpendicular sides, so that the side the ball rested and launched from was decided.
  Nothing needs it: **DS-1.4** places the ball and **DS-2.2** aims it, and neither asks what a bat
  has beside it. The number stays so that a citation of it resolves to this rather than to a
  different rule.

  **It was withdrawn because it described this project's own level and not the game being remade.**
  Not one bat in any of the original's sixty-four rooms sits against the level's edge, and reading
  an element beside a bat instead answers no better: most of its bats have either nothing on both
  sides or something on both.
- **DS-1.7** A level authors no bat in the same place as another, and none with less room to slide
  than its own length. Neither is a position play could reach, and neither is one play could undo.
- **DS-1.8** A level authors at least one destructible element. One that authors none satisfies
  **DS-5.1** before it is played, so it is cleared before the player touches it.

**A level may still author its ball start inside an element, and nothing here refuses it.** The ball
would begin held inside a brick and meet it on the first step it travelled — a brick lost to the
level's own layout rather than to the player — which is the same family of mistake as **DS-1.7** and
**DS-1.8**: a position play could not produce. Left unrefused because no level does it; a level
author who reaches this should meet the sentence before meeting the bug.

### DS-2 · The ball

- **DS-2.1** A held ball waits at the ball start, and nothing moves it. It is not on a bat, and a bat
  that moves does not carry it.
- **DS-2.2** Launching sets the ball travelling in a direction drawn from the seed.
- **DS-2.3** A travelling ball advances every step.
- **DS-2.4** A ball that collides changes direction obeying the law of reflection.
- **DS-2.5** The ball's speed never changes. A collision changes where it is going, never how fast.
- **DS-2.6** A bat also turns the ball, by where along the bat it was met. The outer thirds send it
  away from the bat's middle; the middle third leaves its angle as reflection left it. **DS-2.5**
  still holds, so this is a turn and not a push.
- **DS-2.7** The ball is never inside what it collides with. It turns at the surface it met, and a
  bat that moves into the ball puts the ball outside itself — a bat meeting the ball is the same
  collision as the ball meeting the bat, because which of them moved does not change what happened.
- **DS-2.8** A bat's end also turns the ball, split into two zones rather than three: the half nearer
  one side sends it one way and the half nearer the other sends it the other way, and there is no
  middle zone that leaves it alone.

**Without DS-2.6 and DS-2.8 the ball never changes heading.** Reflection off an axis-aligned surface
only ever reverses one component, and **DS-4.4** leaves no other kind of surface to meet — so a ball
keeps the heading it was launched on for as long as it travels, and one launched along an axis
retraces a single line for ever. A bat is the only thing that can put it on a new heading: **DS-2.6**
on its long face, **DS-2.8** on its ends.

**DS-2.8 turns the axis DS-2.6 turns, not the one it is met on.** An end is a face along the bat's own
length, so meeting one is what **DS-2.4** already reverses there — the same axis a long face leaves
alone and **DS-2.6** turns instead. Without a rule of its own, an end left that second axis exactly as
it found it, so a ball meeting only ends, or only the boundary, could retrace a line for ever the same
way one meeting no bat at all does. **Near and far are which half of the end's width the ball met**,
the width being the bat's own thickness rather than its length — an end is one cell wide, too narrow
for a third zone to mean anything the way the long face's middle third does.

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
- **DS-4.4** An element occupies every cell of its footprint, a rectangle of whole cells anchored at
  the cell the level places it in. No two elements share a cell, and no element reaches outside the
  level.
- **DS-4.5** An element is one thing wherever it is met. A collision with any of its cells is a
  collision with it, and destroying it frees every cell of its footprint at once.

**DS-4.4 is what keeps DS-2.4 exact.** An element's surfaces are the outer faces of the cells it
occupies, so they are horizontal or vertical and nothing else, whatever its footprint — a collision
still reflects across one axis, and there is still no other kind of surface to meet. A footprint
larger than one cell makes an element bigger; it does not make it a new shape.

**A level authored elsewhere may place two elements on one cell, and DS-4.4 does not refuse it.** It
is carried like everything else **DS-7** carries, and the level cannot be played: which of the two is
met has no answer, and inventing one would be deciding a rule at the door. One of the original's
rooms does this, which is how it was found.

**DS-4.5 is why a footprint is not the same as a group of elements.** Two bricks side by side are two
things: destroying one leaves the other. One brick two cells wide is one thing: meeting either half
meets all of it, and it goes as a whole. Nothing else in this document distinguishes them.

### DS-5 · Clearing

- **DS-5.1** A level is cleared when every destructible element has been destroyed.
- **DS-5.2** A cleared level does not advance.

### DS-6 · What the domain announces

- **DS-6.1** A step yields the events that happened during it, in the order they happened. A step in
  which none happened yields none.
- **DS-6.2** Three events are announced: **Collision**, **Element destroyed** and **Ball destroyed**.
  No other event this document names is.
- **DS-6.3** A collision names what the ball met — a boundary, a bat or a brick.
- **DS-6.4** A collision says whether it destroyed what it met.
- **DS-6.5** An element destroyed names the element that went.
- **DS-6.6** A collision that destroys an element announces both. The ball turned and the element
  went, and **DS-2.4** and **DS-4.2** are each true of it.
- **DS-6.7** A step may announce several collisions.
- **DS-6.8** A ball destroyed announces alone, never alongside a collision. A trap is not one of the
  things **DS-6.3** lists, and the ball does not turn away from meeting it the way **DS-6.6**'s
  brick-and-collision pair turns away from a brick — it starts over instead.

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

### DS-7 · What a level carries that no rule reads

A level authored elsewhere carries more than the rules above use. **It is carried rather than
dropped**, because a level whose author's intent is thrown away at the door cannot be checked against
what it came from, and nothing would say how much of it went. Each rule below names the datum and the
rule that ignores it.

**A level carrying DS-7.1 cannot be played**, because the rule it needs does not exist. Carrying it
is what makes that answerable rather than invisible.

**This list is meant to shrink, and it has.** A datum leaves it the day a rule reads it, and its
number stays here pointing at the rule that took it over — **DS-7.2** went that way, then
**DS-7.4**. **DS-7.5** left differently and is worth telling apart: nothing came to read it, the rule
that made it matter was withdrawn instead. **DS-7.1's own table shrinks the same way, a kind at a
time rather than a datum**: horizontal trap and vertical trap are the first to leave it, now that
**DS-8** gives them a rule.

- **DS-7.1** A level may place an element of a kind no rule gives behaviour to. It occupies its cells
  and nothing else about it is true — it is not a brick, so **DS-4.2**, **DS-4.3** and **DS-5.1** say
  nothing about it.

  | Kind | In code |
  |---|---|
  | Glass refractor | `GlassRefractor` |
  | Monster generator | `MonsterGenerator` |
  | Bumper | `Bumper` |

  **Horizontal trap and vertical trap left this table for DS-8.** A kind carries no number of its own
  the way a datum does, so there is nothing here for a citation to resolve to — **DS-8** is simply
  where the two went.

- **DS-7.2** *Moved.* A footprint larger than one cell is no longer carried and unread: **DS-4.4**
  says which cells an element occupies and **DS-4.5** what meeting one of them means. The number
  stays so that a citation of it resolves to where it went.
- **DS-7.3** Every element carries a color id, and so does the level. No rule reads either, and
  neither changes anything that happens.
- **DS-7.4** *Moved.* Where the ball starts is no longer carried and unread: **DS-1.4** places the
  held ball there, and every level authors one. The number stays so that a citation of it resolves to
  where it went.
- **DS-7.5** *Withdrawn.* A bat standing free of both its perpendicular sides used to make a level
  unplayable, because **DS-1.6** needed one side blocked to decide where the ball rested and which
  way it left. **DS-1.6** is withdrawn, so a bat's sides decide nothing and there is nothing here to
  carry.
- **DS-7.6** A level carries its origin. Nothing reads it, and it is what a later map would link a
  level back to.

**What is not carried, and is dropped deliberately:** the original's background pattern · its room
topology, which exits lead where and which rooms a game may start in — **DS-7.6**'s origin is what
survives of it · and the bookkeeping of whatever decoded the original, which describes that
decoding rather than the level.

**A level has one color id, and a level authored elsewhere may hold more than one.** The original
colors a room three times over — a color shared by everything in it, a background, and an edge —
where **DS-7.3** carries one id for the level and one for each element. The level's id is its
background, and the other two are dropped. A second id would have to be named, drawn and told apart
from the first, and nothing draws the first yet; the day something does, this is the sentence to come
back to.

### DS-8 · Traps

- **DS-8.1** A trap destroys the ball on collision. Unlike a destructible brick, it is never
  destroyed itself, whatever meets it.
- **DS-8.2** A ball a trap destroys returns held, exactly where **DS-1.4** puts a level's own ball.
  Nothing else about the game changes: an element already destroyed stays destroyed, and the level
  goes on being played.

**A trap is still an element, so DS-4.4 and DS-4.5 still hold**: it occupies whole cells and is one
thing wherever it is met. What DS-4.2, DS-4.3 and DS-5.1 say about a brick, **DS-8.1** says instead
for a trap — a trap is not a brick, and clearing has never counted it either way.

**DS-8.2 is why the ball has somewhere to go back to.** It returns held, at the ball start, the same
place any level starts it — nothing else about the level changes, and it simply plays on the way it
does after any other collision. What a destroyed ball now costs the run is **DS-9.3**'s, not this
rule's: DS-8.2 only ever said where the ball ends up.

### DS-9 · Runs

- **DS-9.1** A run is what carries a player's lives and score across levels. Replacing a level with a
  new one — a fresh run's first, or the next one after a clear — does not reset either.
- **DS-9.2** A run starts with five lives and a score of zero.
- **DS-9.3** A ball destroyed (**DS-8.1**) spends one of the run's lives.
- **DS-9.4** A level cleared (**DS-5.1**) adds one point to the run's score.
- **DS-9.5** A run becomes game over the moment its lives reach zero.
- **DS-9.6** A run that is game over does not advance its level any further — the same way **DS-5.2**
  stops a cleared one, and for the same reason: nothing after it belongs to this level's play any
  more.
- **DS-9.7** A run is in exactly one of two states: playing, or game over.

**A run, not a level, is what a life belongs to.** **DS-1.5** gives a level three states of its own;
**DS-9.7** gives the run around it two more, and the two nest without touching each other — a run's
level is always in one of its three whenever the run itself is playing, and stops changing the moment
the run is not.

**Nothing here needs a player that outlives a run.** Scope's own reason for moving the count off the
level — that a level is drawn, played and replaced, and a life should not be — is satisfied by moving
it up one level, to the run. A player who carries lives *across* runs is what a later arcade mode
would add, and it would be the one to name that thing; nothing this goal does needs it to exist yet.

## What a level is, as data

**A level is a grid of cells.** Its width and height are counted in cells, and a cell is either empty
or holds one element.

**Cells are the only thing elements know about.** An element occupies a rectangle of whole cells —
**DS-4.4** — so every surface in a level is a cell face, horizontal or vertical, never anything else.
That is what makes **DS-2.4** exact rather than approximate: a collision reflects across one axis, and
there is no other kind of surface to meet. A footprint changes how many cells an element covers and
nothing about the surfaces it presents.

**The ball and the bats are continuous; elements are not.**

- A cell has a fixed size, so a level's extent follows from its grid.
- The ball has a position anywhere in that extent, and a size that is the same in every level.
- A bat lies on one row or one column, and has a continuous position along it. **DS-3.3** stops it
  where the next cell along is occupied.
- Every bat is the same length.

**What a level authors, and what it does not.**

| Authored | Not authored |
|---|---|
| The grid's width and height | Which way the ball leaves when it is launched — **DS-2.2** draws it from the seed |
| Which cells hold a destructible brick, a permanent one, or a trap | The ball's size, and every bat's length: the same in every level |
| Where each bat sits, and on which row or column | The seed. A level that authored it would launch the ball the same way every time, which is not a draw |
| Where the ball starts — **DS-1.4** | |
| Everything **DS-7** still carries unread: an element's kind where no rule reads one, every color id, and the level's origin | |

## What a game holds while it runs

A level is what was authored and never changes. The game state is everything that does.

- **The level being played, and the seed it started from.** Neither changes while it runs.
- **Where the ball is, which way it is going, and how fast.**
- **Which destructible elements are still there.**
- **Where each bat group is along its axis.**
- **Whether the ball is held or travelling.**
- **Whether the level is cleared.**

**Events are not held.** A step's events say what changed; the state says what is. Keeping them here
would mean a state that answers *what just happened*, which is true only until the next step and
wrong for every reader who arrives after it.

**The ball's speed is state, even though nothing here changes it.** **DS-2.5** fixes it for
now, but speed is the kind of thing a later rule alters as a game goes on, and something that changes
over time belongs to the state rather than to the level or to a constant. Putting it here costs
nothing now and means such a rule adds a rule rather than a re-modelling.

## What an event is, as data

**An event is a value, and there are three kinds.**

| Event | Carries |
|---|---|
| **Collision** | What the ball met — a boundary, a bat or a brick — and whether the collision destroyed it |
| **Element destroyed** | The cells the element occupied |
| **Ball destroyed** | Nothing. **DS-6.8** says it announces alone, and there is nothing else about it yet worth naming |

**A collision does not say which bat or which brick.** Nothing reads it, and where a brick goes,
**DS-6.5** already names the cells.

**An element destroyed names cells.** A level is a grid of cells, so a cell is what the domain has to
point with; how one is stored is the implementation's business and not this document's. It names all
of them rather than one, because **DS-4.5** frees all of them, and a reader given one cell of a
four-cell brick would leave three behind.

**The destroyed flag is answerable for every collision, and is false for a boundary and a bat.**
Neither can be destroyed, so the question has an answer everywhere rather than existing on one of the
three shapes and not the others.

**An event carries no time.** A step is the unit of time and an event happened during the step that
yielded it, so there is nothing for a moment to add. Written down because the field that would break
this looks harmless: the simulation may not consult the clock, and a timestamp is the clock.

**Nothing is authored and nothing is looked up.** A level authors elements and bats; events are
produced by play, so there is no reference data here.

## Not named, because nothing here needs them

Named as absent rather than left to be rediscovered: **run**, **life**, **arcade**, **journey**,
**map**, **unlocked**, **selection**. None of them is specified.

**DS-7 still names three element kinds and does not break this.** A kind with no rule is a word for
something a level places, not a mechanic — nothing above says what a glass refractor refracts or what
a generator generates, and **map** is named there only as what an origin would one day be read by.
**Hazard and trap left this list the way trap left DS-7.1's table**: **DS-8** says what one does, so
neither is a word withheld any more.
