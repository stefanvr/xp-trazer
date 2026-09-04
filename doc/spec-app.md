# Application specification

**Owns.** What the player meets: the screens, the input, the flow between them, and the layout those
screens take.

**Not here.** The rules of the world are [spec-domain.md](spec-domain.md); how anything looks is
[spec-style.md](spec-style.md); which technologies produce any of it is
[spec-tech.md](spec-tech.md). What is in version one at all is [scope.md](scope.md).

**Scoped to version one.** The brainstorm describes level selection on a map, returning to selection
after dying, and progress kept between sessions. [scope.md](scope.md) puts all of them out, so none
is here.

**This document states the desired state.** Where the code disagrees, the code is wrong.

---

## The story map

### The activity

**Play a level.** One, because [scope.md](scope.md) leaves a player exactly one thing to do: there is
no menu, no selection, no map and nothing kept between sessions.

### The steps, and what completes each

| Step | Details |
|---|---|
| **Launch the ball** | The ball starts held by a bat. Left and right move the horizontal bat group, up and down the vertical one, and both are live at once — so a player may aim before committing, because the held ball travels with the bat holding it. **Space** launches it. |
| **Play until the level is cleared** | The same four keys keep moving both groups while the ball travels. The ball destroys the destructible bricks it collides with. When the last one is gone the level is cleared, stops, and shows the player that it is. |

**Aiming is a detail and not a step.** A player can press Space immediately and the activity still
completes, so aiming is something the launch step allows rather than something it requires.

**That the cleared level says so is a step's detail; what it says and how it looks is
[spec-style.md](spec-style.md)'s.** A ball that has merely stopped is indistinguishable from a ball
that has stopped working.

## Where the steps surface

**One surface, and no navigation.** Both steps happen on the level itself. Nothing is entered, left,
or returned to — there is no second place for anything to be.

| Step | How the player acts |
|---|---|
| **Launch the ball** | An arrow key **held** moves its bat group for as long as it is held. **Space**, pressed once, launches. |
| **Play until the level is cleared** | The same four keys, the same way. The cleared indication appears on the level, where the player is already looking. |

**Nothing triggers sound or animation.** [scope.md](scope.md) puts sound out of version one, and no
step has a transition to animate — the ball's motion is the simulation advancing, which
[spec-domain.md](spec-domain.md) owns, not an effect this document asks for.

## Layout

**One screen, and nothing to navigate.** No header, no footer, no menu, no dialog. Version one has
nothing to put in any of them, and adding one would be a surface with no step behind it.

The screen holds the level, and a line of readouts beside it: the build identifier that
[spec-tech.md](spec-tech.md) keeps, the collision count, the horizontal bat group's position, and how
many destructible bricks are left.

**The readouts stay, and they are not the player's.** They were written as temporary proof
instruments and are kept as permanent ones. A built artefact that cannot be interrogated from outside
can only be checked by eye, and these are what an automated check reads to see that the loop is
running and that a key reached the simulation — [spec-tech.md](spec-tech.md)'s argument for the build
identifier, applied to behaviour rather than to provenance. **They sit beside the level and never on
it**, so nothing the player plays inside carries them, and no step needs them.

**Desktop-sized, and driven by the keyboard.**

## What this leaves open

- **The small-screen mode, and the touch input it needs.** [scope.md](scope.md) puts both in version
  one, to be built after the keyboard one. Two bat groups on two axes have no obvious touch
  equivalent, so it is design work rather than a port, and nothing here constrains it.
