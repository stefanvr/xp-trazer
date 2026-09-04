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
