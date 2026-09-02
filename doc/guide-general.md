# General guidelines

**Owns.** The principles this project agrees to work by — the ones that settle a question when two
reasonable approaches both fit and something has to choose between them.

**Not here.** The mechanics that are already binding — branch before a goal, commit task-sized, push
before returning, no merge to main without approval — live in [CLAUDE.md](../.claude/CLAUDE.md),
because they need no agreement and no argument. What the machine does is
[setup-ai-env.md](setup-ai-env.md); which technologies are chosen is [spec-tech.md](spec-tech.md);
how the code is shaped is [guide-design.md](guide-design.md). This document decides none of those. It
decides what to do when they conflict.

**A principle earns its place by ruling something out.** That is the whole test. The Agile Manifesto's
principles are quoted far more often than they bite, because most of them cost the reader nothing to
agree with — and a principle nobody can disagree with cannot settle anything. So every principle below
names what it costs and what it forbids. If one of them would never have changed a decision, it is a
slogan: delete it.

**Agreed, not assumed.** These are proposed on a branch. They become binding when the branch is merged
to main, which is what the approval rule in [CLAUDE.md](../.claude/CLAUDE.md) already exists for.
Disagreeing with one now is cheap and expected — that is the point of writing them down before there
is any code to argue about.

---

## The principles

### 1. The routine is the product. The game is the vehicle.

Trazer exists to develop a way of working with an AI agent. The game is what gives that way of working
something real to fail against — a project with no artefact teaches nothing, because nothing can be
wrong. But when the game and the routine pull in different directions, the routine wins: a lesson
written down is worth more than a level shipped.

This principle overrides every other one in the list, which is why it is first.

**The cost.** Features get cut for reasons that have nothing to do with the game being better, and
time gets spent writing documents when it could be spent playing. That is the deal, not a
disappointment.

### 2. Working software over documented intent.

A document describing what the game will do is not evidence that it will. Something you can run is.
Every goal ends with something runnable, and while the project is still being scaffolded, "runnable"
means the smallest thing that proves the pipeline is real — not the smallest thing that looks
finished.

**The cost.** Prototypes get built and thrown away. Some sessions end with something visibly worse
than the plan it replaced.

### 3. Small steps, integrated continuously.

Task-sized commits, pushed before the session ends. Nothing that matters lives only on this machine.
A branch that outlives the goal it was cut for has stopped being reviewed and started being a fork —
and the review is the part that was worth having.

**The cost.** More commits, more pushes, and a history that sometimes shows the work half-finished
rather than only the tidy end state.

### 4. One decision, one place.

Every decision has exactly one document that owns it. When a decision seems to belong in two, the
documents are wrong — that is not a licence to write it in both. Duplicated documentation rots exactly
like duplicated code, and it rots *silently*: both copies go on reading as true long after they have
diverged, and nothing fails.

**The cost.** Sometimes the work is reshaping the document set rather than writing the paragraph you
sat down to write.

### 5. Write down the surprise, not the summary.

What earns a place in these documents is the thing that succeeded while doing the wrong thing — the
observation, with the check that would have caught it. A rule with no observation behind it gets
ignored by the third session, and rightly so: it reads as someone's preference rather than as
something that actually happened here.

This is [setup-ai-env.md](setup-ai-env.md)'s own rule, promoted, because it turned out not to be about
the environment.

**The cost.** Writing it down happens at the exact moment the problem is solved and moving on is most
tempting.

### 6. The simplest thing that could work — then change it without fear.

Design for the game being built, not the engine it might become. Generality added before it is needed
is a guess, and the guess is usually wrong in a way that is expensive to unpick. The permission to
stay this simple comes from being able to change it later, and that comes from tests — so the two are
one principle, not two.

**The cost.** Code gets rewritten that "would have scaled". Occasionally the rewrite is annoying, and
it is still cheaper than the abstraction that was never needed.

### 7. Verify the artefact, never the command.

Exit zero is not evidence. Fetch the page, open the screenshot, play the level. A passing test says
the code ran; it does not say the output is right. This is the most transferable thing the environment
document has learned, and it applies to every layer above it.

**The cost.** Slower loops, and a verification step in things that obviously work — which is precisely
where the silent failures have been found.

### 8. The agent is a pair, not an oracle.

The AI agent's output is reviewed like a colleague's, and it is expected to say what it assumed and
what it actually checked rather than to sound certain. "Do not trust a remembered fact" applies to the
agent's memory first of all. An agent that reports what it verified is useful; an agent that reports
what it believes is a liability that reads identically.

**The cost.** Review time, and an agent that asks more questions than a search box would.

### 9. Stop at done, and say what done was.

Define done before starting the goal, in one sentence. A goal without an edge cannot be finished, only
abandoned — and in a project whose purpose is developing a routine, an abandoned goal teaches nothing,
because there is no signal to learn from.

**The cost.** Some goals get declared done while obviously improvable, and the improvement waits for a
goal of its own.

---

## When two principles collide

The order above is not a priority ranking, with the single exception of the first. When two of them
genuinely conflict, pick one, and say in the commit message which you applied and what you gave up.

That record is the only way this list gets corrected. A principle that keeps losing is either wrong or
badly written, and neither is visible unless the losses are written down.

## Changing this document

Add a principle only when you can name the decision it would have changed. Delete one when it has
never overridden anything — at that point it is decoration, and decoration teaches the reader that
this document can be skimmed.
