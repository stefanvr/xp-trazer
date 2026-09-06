# Goal 4 — findings

## No real room can be started, and the rule that refuses them cannot be satisfied by any of them

`createGameState` asks `awayFrom` for every bat, and `awayFrom` decides the open side from the
level's edge alone — `bat.line === 0` or the last line. **DS-1.6** is what it implements, and that
rule says *"the level's edge today, and whatever else is placed against it later"*.

Measured against the imported rooms:

| Question | Answer |
|---|---|
| Rooms `unplayableReasons` calls playable | 28 of 64 |
| Of those, rooms `createGameState` will actually start | **0** |
| Bats sitting on an edge line, across all 64 rooms | **0 of 141** |

The original never puts a bat against the screen edge, so the edge-only reading of **DS-1.6** cannot
start any room of it — not one, ever. The "28 playable rooms" that
[spec-domain-porting-todo.md](../spec-domain-porting-todo.md) quotes and the suite asserts is
counting rooms that cannot in fact be played.

## The two modules disagree about what blocks a bat

| Module | What blocks a bat's perpendicular side |
|---|---|
| `src/domain/ball.ts` — `awayFrom` | the level's edge alone |
| `src/domain/playable.ts` — `sidesBlocked` | the edge, **or any element on the adjacent line** |

`unplayableReasons` is the more permissive of the two, which is why a room can pass it and then throw.
One of them is wrong about **DS-1.6**, and *"the level's edge today"* is the sentence that decides
which — but see below, because widening it is not enough either.

## Widening DS-1.6 to count elements does not rescue it

Counting an element on the adjacent line as blocking, across the ported rooms:

| Bats with … | Count |
|---|---|
| no blocked side | 62 |
| exactly one blocked side | 43 |
| both sides blocked | 36 |

Only **14 of 64** rooms have every bat blocked on exactly one side. **DS-1.6** wants exactly one, so
most rooms still have no answer for which way the ball leaves.

## What the original actually did, from the export's own notes

`TRAZ_second_pass/SECOND_PASS.md`, on the room record:

> Ball direction/velocity is **not stored in the room record**. On room load, TRAZ seeds the ball's
> velocity state from CIA timer values, so the launch motion is runtime-generated.

And the room record *does* author where the ball starts — the datum **DS-7.4** carries and **P-1**
currently drops.

So the original decided the ball's start from the room and its direction at random, and never asked
what a bat had beside it. **DS-1.6**'s open-side reasoning is this project's own answer for its one
authored level, and it does not describe the game being remade.
