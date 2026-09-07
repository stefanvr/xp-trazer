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
| P-1 | *Ended.* **DS-1.4** now places the held ball at the start the room authors, which is the rule this concession was waiting for. The number stays so a citation of it resolves | | |
| P-2 | **DS-7.1** glass refractor | Left out of the played level | The refractor has behaviour |
| P-3 | *Ended.* **DS-8** now gives a trap a rule — it destroys the ball rather than being left out. The number stays so a citation of it resolves | | |
| P-4 | **DS-7.1** monster generator | Stands as a permanent brick, keeping its footprint and its place | The generator has behaviour |
| P-5 | **DS-7.1** bumper | Stands as a permanent brick, keeping its footprint and its place | The bumper has behaviour |

**P-5 is conceded for nothing, and stays in force anyway.** The original places no bumper in any of
its 64 rooms, so the line changes no room today and the suite asserts it over a level built for the
purpose. It is here because the kind exists and the concession is what would happen to one — a
concession removed for being unused would be re-decided in code the moment a bumper arrived.

**One thing is not conceded, and the room holding it stays unplayable.**

- **DS-4.4** — two elements on one cell. Which of the two the ball met has no answer, and inventing
  one would be deciding a rule here. **Room 29, the only room that does it.**

**A bat standing free of both its perpendicular sides used to be the second, and it was the larger by
far — 35 of the 64 rooms.** It is not conceded now; it is simply not a problem. **DS-7.5** and the
**DS-1.6** that gave it force are both withdrawn, because the rule was this project's answer for its
own authored level and no room of the original ever satisfied it.

**Nothing is lost by conceding.** The rooms in the tree hold what the original actually places; the
concessions are applied on the way to being played, so withdrawing one is deleting a line rather than
importing again.

**63 of the 64 rooms are playable under this list.** It was 28 while **DS-1.6** stood, and the 35 it
held back were not held back by anything conceded here — which is why withdrawing one rule moved the
number further than every concession in the table put together.

**Every count above is asserted by the suite, which is the authority.** They are copied here because
the point of the list is what it buys, and that is not readable from the rules alone — where a count
and the suite disagree, this document is the one that is wrong.
