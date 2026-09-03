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

| Term | What it is | In code |
|---|---|---|
| **Level** | The closed space play happens inside, and the authored arrangement of elements in it. Nothing leaves it. | `Level` |
| **Boundary** | The level's edge. | `Boundary` |
| **Ball** | The single moving thing the player never controls directly. | `Ball` |
| **Element** | Anything a level places: a brick or a bat. | `Element` |
| **Brick** | An element that occupies space in the level and turns the ball away. | `Brick` |
| **Removable brick** | A brick that is removed when the ball meets it. The ball rebounds as it goes. | `RemovableBrick` |
| **Permanent brick** | A brick that is never removed, and that clearing ignores. | `PermanentBrick` |
| **Bat** | An element the player moves, lying along one axis. | `Bat` |
| **Bat group** | Every bat of one orientation. A group moves as one thing. | `BatGroup` |
| **Cleared** | What a level becomes when every removable brick has been removed. | `cleared` |
| **Rebound** | The ball reversing direction on meeting a boundary, a bat or a brick. | `rebound` |

## Not named, because version one does not need them

Named as absent rather than left to be rediscovered: **hazard**, **run**, **life**, **arcade**,
**journey**, **map**, **unlocked**, **selection**. The brainstorm carries all of them and
[scope.md](scope.md) puts them out of version one.
