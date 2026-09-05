# Scope

**Owns.** The overarching goal — what is being built now, where it stops, and what done means.

**Not here.** How any of it works. The rules of the world are [spec-domain.md](spec-domain.md), what
the player meets [spec-app.md](spec-app.md), how it looks [spec-style.md](spec-style.md), what it is
built with [spec-tech.md](spec-tech.md).

**Replaced, not appended to.** One overarching goal at a time; a reached goal is cleared rather than
archived, because the commit history already records what landed.

**Reaching a goal and setting the next one are two steps, not one.** The goal is cleared when it is
reached, leaving only a pointer to what comes next; the next goal is set later, whenever a new scope
is chosen. `.claude/skills/scope/SKILL.md` owns both, and neither happens inside a landing.

**Expected to change mid-flight**, on the branch of whatever found the reason.

**No backlog, no parked list, no next-up** — `.claude/skills/land/SKILL.md` carries the argument.

**A specification outranks this document the moment it exists.** An answer is recorded here only
while the document that owns it is unwritten, so a goal that holds any tracks where each of its
answers ends up, and checks them off as they leave.

**No specification cites this document.** Not as justification, and not as routing. A goal is cleared
when it is reached, so every citation of it becomes a pointer to nothing — while still reading as
authority to anyone who does not open the file. A specification states its decisions as its own,
which is what owning them means, and how a decision was reached is in the history.

---

## The goal — the game is heard

**Done means** the ball's collisions and the bricks it destroys are heard, driven by events the
domain announces rather than by the edge inferring them.

**What a person can do that they could not before: hear the game.** Thin, and named as thin —
[guide-override.md](guide-override.md)'s **O-1** is what licenses it. The larger part of the value is
the seam. Today `step` returns a new state and nothing else, so the edge would have to reconstruct
what was hit from a counter the domain incremented and discarded; every mechanic that comes after
this one wants the same announcement, and each would rebuild the same inference.

**The sound is the C64's; the look stays Tron.** A deliberate split, not an oversight.
[spec-style.md](spec-style.md) commits the eye to Tron and treats the C64 heritage as flavour that
yields wherever the two disagree — in the ear it does not yield.

**Web Audio, synthesised rather than played back.** The choice is made rather than carried open, and
this scope is the smallest thing that genuinely exercises it: nothing is fetched at runtime, and the
effects are generated from the same parameter model the reference recordings were rendered from.

### Where it stops

- **Two effects** — a collision, and a brick's destruction. The reference material's other eight
  belong to mechanics that do not exist, and stay unused.
- **Nothing the player adjusts.** No music, no mute, no volume.
- **No animation.** Sharing a trigger is not sharing a goal.
- **No new element, and no event [spec-domain.md](spec-domain.md) does not already name.** The domain
  announces what it already says happens; it gains nothing to announce.

### Where each answer ends up

Checked off the day the document that owns it is written, without removing the row.

| Answer | Document | Moved out |
|---|---|---|
| The domain announces its events — which ones, and what each carries | [spec-domain.md](spec-domain.md) | ☑ |
| That there is sound, what may make it, and that its identity is the C64's | [spec-style.md](spec-style.md) | ☑ |
| Web Audio, synthesised from the parameter model, nothing fetched at runtime | [spec-tech.md](spec-tech.md) | ☐ |
| That the level makes sound — *"Nothing triggers sound or animation"* stops being true | [spec-app.md](spec-app.md) | ☐ |

**How sound is verified belongs to the first goal inside this scope, not to this document.** *The
suite is the verification* stands whatever the answer is: the events are plain data and testable with
no surface, and what a surface test must prove is that the audio was reached at all.
