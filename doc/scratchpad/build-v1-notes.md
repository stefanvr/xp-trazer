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

## B-2 · Which side of its bat the held ball rests on is not specified

**Found.** Task 3, implementing **DS-2.1** and **DS-2.2**.

**What the specification fixes, and what it does not.** *"A held ball rests on its bat"* does not say
which side, and *"perpendicular to the bat that held it, away from it"* fixes the axis but not the
sign. For a bat with level on both sides — which every bat in the authored level has — both answers
satisfy both rules.

**What the code does, and on what grounds.** `awayFrom` takes the side with more level behind it: a
bat in the top half throws downwards, one in the bottom half throws up. The grounds are **DS-1.1**,
nothing leaves the level — for a bat hard against an edge the other side is outside, so only one
answer is available there, and taking the same rule everywhere makes the behaviour one rule rather
than two.

**Not reported as compliance.** The specification is silent, and silence is not permission — this is
undecided, not decided. It is recorded so the owner gets the choice rather than inheriting the
agent's.

**Done when** DS-2.1 or DS-2.2 says which side, or the owner confirms the derivation and it stops
being open.

## B-3 · The style page says the domain owns no brick or bat type

**Found.** Task 3, while wiring `createGameState`'s new seed through `dev/style.ts`.

**Evidence.** `dev/style.ts` labels three panels *"Shape only — spec-domain.md does not own a brick
type yet"* and *"…does not own a bat type yet"*. `doc/spec-domain.md` owns both, and
`src/domain/level.ts` has them.

**Why it is not fixed here.** The `style` skill says an element the domain models is drawn by calling
the project's real render function, not re-implemented — so the fix is to redraw those panels from
real types, which is that routine's job. Editing the labels alone would leave the page claiming to
demonstrate real code while still painting rectangles by hand.

**Done when** the `style` skill runs and the panels draw bricks and bats through `draw()`.
