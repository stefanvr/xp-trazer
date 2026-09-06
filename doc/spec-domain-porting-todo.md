# Porting the original's rooms — the concessions in force

**Owns.** What an imported room gives up so that it can be played before every rule it needs exists,
and what would end each concession.

**Not here.** The rules themselves — [spec-domain.md](spec-domain.md) — and how a room is converted,
which is the import's. A concession is a decision about *this* port, not about the world.

**This document is not cleared when a goal lands.** Every entry is in force until the rule it stands
in for is written, which is longer than any one goal. It is not a backlog: nothing here is a plan to
do something, each line is a thing being done right now, and the list shrinks by rules arriving
rather than by anyone working through it.

**A concession that is not here is a rule being decided in code.** `src/levels/porting.ts` applies
exactly this list and nothing else.

---

| # | The rule | What is done instead | Ends when |
|---|---|---|---|
| P-1 | **DS-7.4** a level may author where the ball starts | The authored start is left behind, and **DS-1.4** draws the bat that holds the ball from the seed | A rule reads an authored ball start |
| P-2 | **DS-7.1** glass refractor | Left out of the played level | The refractor has behaviour |
| P-3 | **DS-7.1** horizontal and vertical trap | Left out of the played level | A trap has behaviour |
| P-4 | **DS-7.1** monster generator | Stands as a permanent brick, keeping its footprint and its place | The generator has behaviour |
| P-5 | **DS-7.1** bumper | Stands as a permanent brick, keeping its footprint and its place | The bumper has behaviour |

**Two things are not conceded, and the rooms holding them stay unplayable.**

- **DS-7.5** — a bat standing free of both its perpendicular sides. There is nothing to substitute:
  the side the ball rests and launches from is what the blocked side decides, so a bat with neither
  has no *away*. **35 of the 64 rooms.**
- **DS-4.4** — two elements on one cell. Which of the two the ball met has no answer, and inventing
  one would be deciding a rule here. **Room 29, the only room that does it.**

**Nothing is lost by conceding.** The rooms in the tree hold what the original actually places; the
concessions are applied on the way to being played, so withdrawing one is deleting a line rather than
importing again.

**28 of the 64 rooms are playable under this list.**

**Every count above is asserted by the suite, which is the authority.** They are copied here because
the point of the list is what it buys, and that is not readable from the rules alone — where a count
and the suite disagree, this document is the one that is wrong.
