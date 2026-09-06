# Goal 4 — play the real rooms

Kind: **product functionality**. What the player meets when the page opens is
[spec-app.md](../spec-app.md)'s, and it does not yet carry either decision this goal needs — so the
specification pass comes before the code, and the decisions are the owner's.

## What the tree already says

| Fact | Where it came from |
|---|---|
| 28 of 64 rooms are playable once ported | `unplayableReasons(portedLevel(room))` |
| Every room is 40×25 cells — 1280×800 pixels at `CELL_PIXELS` 32 | `extentOf`, all 28 identical |
| 9 of the 28 have **no horizontal bat**; 13 have no vertical one | the bats each room authors |
| A room holds 22 to 170 destructible elements | `destructibleCount` |
| The authored level is 640×480 and is what the 700px breakpoint is justified against | spec-app.md |

## What is left

| Task | What makes it checkable |
|---|---|
| Owner decides how a 1280×800 room is sized on screen, and what happens to the 700px rule whose stated reason was the 640px authored level | `spec-app.md` says it, in the present tense, without citing the scope |
| Record it with the `app` skill | spec-app.md reads as the desired state and nothing cites a level that is no longer played |
| Draw one playable room at random when the page opens, ported | Opening the page twice gives a playable imported room both times |
| Answer the readout that assumes a horizontal bat: 9 of 28 rooms have none, so `bat-position` reads 0 for ever and the existing arrow-key smoke test fails on ~32% of loads | The suite passes repeatedly, and what it asserts is true of *every* playable room rather than of the room it happened to draw |
| End-to-end: opens the page twice, playable both times, at real dimensions, never one marked unplayable | `npm run test:e2e` green, and the assertion made to fail on purpose once |

## Not this goal's to decide

Traps. `doc/spec-domain-porting-todo.md` P-3 leaves them out of every played room, and all 64 rooms
hold at least one. The owner has ruled that goal 4 changes nothing there.
