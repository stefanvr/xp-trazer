# Goal 3 — import the rooms: the breakdown

What is left. A task leaves this file the moment it is implemented; the history keeps what was done.

| Task | What makes it checkable |
|---|---|
| The domain carries what DS-7 names | A level holds an element of a kind no rule reads, an element wider than one cell, a color id on every element and on itself, an authored ball start and its origin — and the existing suite still passes untouched |
| A level says whether it can be played, and why not | Asking an imported room gives back the rules it fails, by number; asking the authored level gives back nothing |
| The converter turns one export room into a level | Room 59's converted elements, bats, ball start and colors match the export record committed beside the test |
| All 64 rooms are in the tree in this project's format | `src/levels/rooms.ts` holds 64 rooms, every object of the export accounted for, and the suite counts them |
| The suite asserts a converted room against its source | Re-running the converter over the committed source fixture reproduces the committed room exactly |

## Findings, as they arrive

- **Owner's decision (asked, answered):** only the converted rooms are committed; the export
  (`rooms_full.json`) stays outside the repository. The single-room source fixture beside the
  converter test is the compromise that keeps *the suite asserts a converted room against its
  source* real in CI, and is the smallest thing that can.
- **No room is playable, and goal 4 cannot be reached without new rules.** Every one of the 64 rooms
  places at least one element kind DS-7.1 carries without behaviour, every one authors a ball start
  (DS-7.4), and every original object is wider or taller than one cell (DS-7.2). Goal 4 asks the
  suite to open a playable imported room twice. Reported to the owner.
