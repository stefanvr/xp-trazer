# Goal 3 — import the rooms

The breakdown is empty: every task it held is implemented, and the history holds what was done.

## Findings, for the owner

- **Owner's decision (asked, answered):** only the converted rooms are committed; the export
  (`rooms_full.json`) stays outside the repository. Recorded as **A-3** in `doc/spec-tech.md`. Room
  24's source record is committed beside the converter as the fixture, which is what keeps *the suite
  asserts a converted room against its source* checkable on a machine that does not hold the export.

- **No room is playable, and goal 4 cannot be reached as written.** All 64 rooms break the same five
  rules: **DS-1.8** (no destructible element the rules can read), **DS-7.1** (a kind with no
  behaviour), **DS-7.2** (every original object is larger than one cell), **DS-7.4** (an authored
  ball start) and **DS-7.5** (a bat standing free of both perpendicular sides). Goal 4 asks the suite
  to open a playable imported room twice, so it needs rules that do not exist yet — most of all a
  footprint larger than one cell, which every one of the 8292 imported elements has.

- **A room carries three colors and the domain carries one.** The export gives a shared multicolor,
  a background color and a border color; **DS-7.3** names one color id for the level, so the import
  takes the background color and the other two do not survive. Goal 1's *no datum the export holds is
  silently dropped* did not meet this. It is a question for `spec-domain.md`, not for the converter.
