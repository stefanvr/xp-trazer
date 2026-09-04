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

**Closed.** The owner settled it: bats block, just as the boundary and elements do. **DS-3.3** now
names all three, and **DS-1.7** refuses a level that authors one bat inside another or one with less
room to slide than its own length — the second rule already had code and no number to cite.

**The three open questions, answered.**

| Question | Answer |
|---|---|
| Any bat, or only one of the other orientation? | Only the other orientation is ever asked. A group moves as one thing (**DS-3.1**), so its members keep the distance the level gave them and can never close on each other. |
| Does a blocked crossing stop the whole group? | Yes — the same rule as an element. The blocked member speaks for every member. |
| Is an overlapping level refused at start? | Yes, and before the room-to-slide check, because a bat inside another also has no room and that is the misleading answer. |

**Why it needed no geometry of its own.** A bat is exactly one cell thick and sits square on its
line, so it covers exactly one cell of any line that crosses it — `crossedBy` in `src/domain/bat.ts`
answers at a cell, and `spanFor` then stops a bat at another bat by the walk it already did for
elements. It covers that cell only while its length reaches the crossing line, so the same pair
blocks or does not as the other group slides.

**One consequence worth knowing.** The two groups are moved one after the other, so the second is
offered whatever the first left. That is what keeps them apart when both are driven at once, and it
makes right-then-down differ from down-then-right by a step's travel where the two would otherwise
cross. Paid deliberately: the alternative is letting both move against stale positions and undoing
the overlap afterwards.

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

**And it fell further behind.** spec-style gained a **Typography** section for the word a cleared
level shows, and the skill's own rule is that *"when the table gains a row, the page is missing a row
until this routine runs again"*. So the page owed a cleared-word panel as well.

**Closed.** The `style` skill ran. Every element the domain models — bricks and bats included — is
now drawn by calling `draw()` against a real `GameState` reached by real `step` calls, so no panel
can go on looking right after the renderer stops. Eight panels: seven palette rows and the cleared
word, which spans the gallery because the whole decision is how the type reads.

**What that cost, and why it is the right cost.** No panel shows its element alone any more. A level
must have a bat, a ball, a boundary and something to destroy, so all four are in every frame. Each
panel is arranged so its own row is what the eye lands on and says what else is in shot — which is
more honest than a hand-painted rectangle that owes the renderer nothing.

## B-6 · The proof readouts are still on the surface spec-app says they leave

**Found.** Task 5, reading spec-app while building the cleared indication.

**Evidence.** spec-app's *Layout*: *"The screen holds the level, and the build identifier that
spec-tech.md keeps. The collision and velocity readouts beside it are that document's proof
instruments, and they go when this surface arrives."* The surface has arrived — the level is played,
cleared, and says so — and `collision-count`, `bat-position` and `bricks-left` are still beside it.

**Why it was not just done.** Two of them are what `e2e/smoke.spec.ts` reads to prove the loop runs
and that a key reaches the simulation. Removing them removes the tests' only hooks, so this is a
question about what replaces that proof, not a deletion.

**Closed.** The owner kept the readouts and reworded spec-app, so no code changed — the document had
been describing a plan rather than a decision.

What the paragraph says now: the readouts were written as temporary proof instruments and are kept
as permanent ones, because a built artefact that cannot be interrogated from outside can only be
checked by eye. That is spec-tech's argument for the build identifier applied to behaviour instead of
provenance. They sit beside the level and never on it, so no step needs them and nothing the player
plays inside carries them.

*"One screen, and no chrome"* became *"one screen, and nothing to navigate"*, because the old wording
was what made the readouts look like a contradiction. And the sentence had named *"the collision and
velocity readouts"* when there is no velocity readout and there are three — it now names the four
things on screen.

## B-7 · A level may author an element where the held ball rests

**Found.** Rebuilding the style page. Panels with a brick row directly under the bat started with the
held ball drawn *inside* the brick — the panels were rearranged, but the level was legal.

**Why.** **DS-1.4** starts the ball held by a bat and **DS-2.1** rests it on the bat's open side.
Nothing says the cell it rests in must be empty, and `createGameState` checks the bats against each
other and the level, never the ball against an element.

**What it would do in play.** The ball starts inside a brick. Launching drives it straight into that
brick, which is destroyed on the first step — so the level loses a brick to the level's own layout
rather than to the player.

**Not urgent.** No authored level does it, and `src/levels/first.test.ts` would not catch one that
did. It is the same family as **DS-1.7** and **DS-1.8**: a level author can write a position play
could not produce, and the refusals are where that is caught.

**Left.** The owner's call: no authored level does it, and version one has exactly one level. Recorded
here rather than fixed, so a second level's author meets the note before meeting the bug.

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
