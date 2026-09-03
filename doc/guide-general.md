# General guidelines

**Owns.** The principles this project works by — the ones that settle a question when two reasonable
approaches both fit and something has to choose between them.

**Not here.** The mechanics that need no argument — branch before a goal, commit task-sized, push
before returning, no merge to main without approval — are in [CLAUDE.md](../.claude/CLAUDE.md). What
outranks these principles for the lifetime of this project is [guide-override.md](guide-override.md),
kept separate on purpose: these are written to outlive the project, which is exactly why anything
temporary is stored somewhere deletable. What the machine does is [setup-ai-env.md](setup-ai-env.md), and what it takes to
have one is [setup-dev-env.md](setup-dev-env.md);
which technologies are chosen is [spec-tech.md](spec-tech.md); how the code is shaped is
[guide-design.md](guide-design.md).

**A principle earns its place by ruling something out.** That is the test for adding the next one:
name the decision it would have changed. A principle that would never have changed a decision is a
slogan, and one slogan teaches the reader that the whole list can be skimmed.

---

## Goals and decisions

- Always uncover or understand the goal — including its edge: what done is, in one sentence. A goal
  without an edge can only be abandoned, not finished.
- **Say what a person can do that they could not before, and notice when the answer is nothing.** A
  goal that only moves the platform is sometimes right, but *being next in a dependency chain is not
  the same as being worth doing*, and a technical ordering can pass for a plan for a surprisingly long
  time. Name which one it is.
- A goal never carries an unmade technology decision. The choice becomes the goal in front of it,
  proven by the smallest thing that genuinely exercises it — otherwise the decision gets made
  mid-feature, under delivery pressure, by whoever needed it first.
- Don't build, and don't specify, further than the goal in front of you needs. A rule written three
  goals early is written from a worse understanding, and a specification is the expensive place to be
  wrong — its identifiers are cited from the code and from the tests.
- Don't decide on the owner's behalf — not the product, not the scope. Options and a recommendation,
  then wait. Confirm before it is recorded, not after.
- Which document owns a decision is settled by the routing in [CLAUDE.md](../.claude/CLAUDE.md), not
  by judgement in the moment.

## Development

- Iterate in baby steps: one change at a time, integrated continuously. Nothing that matters lives
  only on this machine.
- Understand before modifying.
- Single responsibility at every level, including a document, a commit and a goal —
  [guide-design.md](guide-design.md) carries the test and its exception, and it is not restated here.
- Keep documentation and implementation synchronised.
- **When a document is repaired, re-read whatever cites it.** A document set has no build to break, so
  a structural fix in one document silently falsifies a sentence in another — and the falsified
  sentence goes on reading as authority.
- Tests are part of the implementation, not an afterthought.
- Leave the project in a better, verifiable state.

## Verification and honesty

- Never hide uncertainty. Report what was verified, not what is believed — the two read identically
  and only one of them is worth anything.
- Prefer external signal to self-report: verify by reading the artefact, not the claim that it was
  produced.
- On anything multi-step, arrange a second reader — a test, a check, or another model.
- Write down the surprise, not the summary. A rule with no observation behind it gets ignored by the
  third session, and rightly so: it reads as someone's preference rather than as something that
  actually happened here.

---

## When two collide

Pick one, and say in the commit message which you applied and what you gave up. That record is the
only way this list gets corrected — a principle that keeps losing is either wrong or badly written,
and neither is visible unless the losses are written down.
