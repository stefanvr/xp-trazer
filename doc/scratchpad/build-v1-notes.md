# Building version one — open items

**Working note. Decides nothing, and is never cited as authority.** Items found while building, each
to be given a fate when this goal lands — fixed here, decided and recorded in the document that owns
it, or deliberately left.

---

## B-1 · Bats can occupy the same space as other bats

**Found.** Task 2, driving both groups to their limits: a horizontal bat on row 13 and a vertical bat
on column 18 cross, and both are drawn in the cell they share.

**The owner calls this a defect.** Recorded as their judgement rather than as an agreed one, because
the agent had argued the opposite — see below.

**Why the code allows it.** **DS-3.3** says a bat stops at the boundary and at an element. A bat is
not an element — the vocabulary makes them different kinds deliberately — so nothing in
`src/domain/bat.ts` consults the other bats when deciding how far a group may travel.

**The agent's mistake, recorded so the reasoning is not repeated.** This was first reported as *the
specification being followed*, on the grounds that DS-3.3 does not mention bats. That is silence
being read as permission. DS-3.3 not mentioning bats means the question was never asked, not that
overlap is allowed.

**Closing it is a specification change before it is a code change.** If bats may not overlap, DS-3.3
gains what a bat stops at, and `doc/spec-domain.md` is where that is decided — which makes it the
`domain` skill's business rather than something to patch in `moveGroup`.

**Open questions if it is fixed**, none of which the specification answers today:

- Does a bat stop at *any* bat, or only one of the other orientation? Two bats of one group cannot
  meet, since a group moves as one and its members are on different lines.
- Does a blocked crossing stop the whole group, the way an element does under **DS-3.1**?
- Is a level whose authored bats already overlap refused at start, as one with too little room for a
  bat now is?
