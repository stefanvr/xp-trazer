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

**Closed.** The owner gave the rule the specification was missing: *a bat always has a boundary or
future hazard on one side, and the ball rests on the other.* The agent's half-of-the-level proxy
would have answered wrongly for a bat in the middle, which is exactly where a proxy breaks.

It is now **DS-1.6** in `doc/spec-domain.md`, with DS-2.1 and DS-2.2 amended to point at it.
`awayFrom` reads the open side rather than guessing, and fails loudly where there is no answer;
`createGameState` asks for every bat at start, so a level DS-1.6 forbids is refused before play.
The authored level's bats moved to the edges, because under the old proxy they were legal and under
the rule they were not.

## B-3 · The style page says the domain owns no brick or bat type

**Found.** Task 3, while wiring `createGameState`'s new seed through `dev/style.ts`.

**Evidence.** `dev/style.ts` labels three panels *"Shape only — spec-domain.md does not own a brick
type yet"* and *"…does not own a bat type yet"*. `doc/spec-domain.md` owns both, and
`src/domain/level.ts` has them.

**Half fixed here.** The labels said the domain owns no brick or bat type, which is false, so they
now say only what is true: *shape only — not drawn by the real renderer*.

**What is left is the redraw.** The `style` skill says an element the domain models is drawn by
calling the project's real render function rather than re-implemented. spec-domain owns bricks and
bats now, so those three panels should go through `draw()`. That is the style routine's job, not
this goal's.

**Done when** the `style` skill runs and the panels draw bricks and bats through `draw()`.

## B-4 · A bounce stops just short of the surface, by up to one step of travel

**Found.** Chasing the gap the owner saw between ball and bat. Most of it was the renderer drawing a
bat four pixels thinner than the one the collision used, which is fixed. This is what is left.

**What the code does.** `advance` in `src/domain/simulation.ts` offers the next position, and where
something is there it **refuses the move** and reverses the component instead. The ball therefore
turns from wherever it happened to be, not from the surface it met.

**How big.** One step of travel: `BALL_PIXELS_PER_SECOND * STEP_SECONDS`, so 260/120 ≈ **2.2 pixels**
at most, and on average half that. It lasts one frame.

**Why it was written that way.** The comment says it: the step is far shorter than a cell, so
refusing cannot tunnel, and moving to the exact contact point costs a solve the reflection does not
otherwise need.

**Reported as presentation, and that was wrong.** It was written up as no rule being broken, on the
grounds that **DS-2.4** says the ball turns away from what it meets without saying where. That is
silence being read as permission again. The owner asked for it to be fixed, and fixing it turned out
to need the same rule as B-5 below.

**Closed.** **DS-2.7** now says the ball turns at the surface it met. `advance` halves the offered
move ten times to find the largest part of it that stays clear, so the ball goes as far as it can and
turns there — within a five-hundredth of a pixel of the surface, for a boundary, a bat and a brick
alike, because it asks the same `obstacleAt` question rather than re-deriving each surface's geometry
somewhere it could disagree.

## B-5 · A bat moving into the ball trapped it rather than bouncing it

**Found.** By the owner, playing: a ball coming off the boundary with a bat sliding into its path
went *inside* the bat instead of off its end.

**Why.** Bats move before the ball does, so a bat could close over a ball that was clear of it a
moment earlier. Once inside, every move the ball was offered was blocked, so it reversed without
going anywhere — and did so again every step after, on both axes, running the collision count up
while going nowhere.

**The specification did not cover it.** *"Collision — the ball met a boundary, a bat or a brick"* is
written from the ball's side only, and nothing said what happens when the other thing is the one that
moved.

**Closed.** **DS-2.7** says the ball is never inside what it collides with, and that a bat meeting the
ball is the same collision as the ball meeting the bat — which of them moved does not change what
happened. The *"Collision"* and *"Bat group moved"* rows of the event table say so too.

`pushedOutOfBats` puts the ball out along the bat's own axis, which is the only way a bat can meet
it (**DS-3.2**), by the end it is nearer to, travelling away; **DS-2.6** then turns it as it turns
any ball, and an end is the outer third, so the turn sends it off rather than back along the bat. The
far end is tried where the near one is occupied — a bat driving the ball into the corner has nowhere
to put it on the side it is going, and that case is what the 600-step test walks into.
