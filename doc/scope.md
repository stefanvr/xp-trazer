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

**A goal broken into steps ticks each one as it lands**, in place and with its wording untouched, so
what is left is read here rather than reconstructed from the history. The tick is written by
`.claude/skills/scope/SKILL.md` in `check` mode, which every landing runs.

**No backlog, no parked list, no next-up** — `.claude/skills/land/SKILL.md` carries the argument.

**A specification outranks this document the moment it exists.** An answer is recorded here only
while the document that owns it is unwritten, so a goal that holds any tracks where each of its
answers ends up, and checks them off as they leave.

**No specification cites this document.** Not as justification, and not as routing. A goal is cleared
when it is reached, so every citation of it becomes a pointer to nothing — while still reading as
authority to anyone who does not open the file. A specification states its decisions as its own,
which is what owning them means, and how a decision was reached is in the history.

---

## Version three — the real levels

**Done means.** A player who opens the page is dropped into one of the original game's rooms,
imported from the prepared export, picked at random and played at its real dimensions.

**What a person can do that they could not before.** Play the original's own levels rather than one
hand-authored proof — sixty-four rooms in place of one.

**The unmade decision this scope carries.** Whether the export's room data enters the tree as data
and is converted when the application is built, or is converted once and committed in this project's
own level format. A goal may not carry an unmade technology choice, so this one is settled inside
goal 3 before anything else in that goal is written.

### The goals, in order

| | | Goal | Done when |
|---|---|---|---|
| 1 | ✅ | **Stub rules for everything the export carries that is not implemented** — the unsupported element kinds, elements occupying more than one cell, per-object and per-room colors, an authored ball start, and a bat that stands free of every edge | Each one is named in the specification that owns it and marked as carried but not yet honoured. No datum the export holds is silently dropped |
| 2 | ✅ | **Generalise the clearing proof into a test bed for elements**, reached from a dev-only page that also links the existing style and audio pages | Every element the domain names is reachable and exercisable from that page, and the seam that substitutes a level into the played game is unchanged — the page is a separate dev route rather than a widening of it |
| 3 | ✅ | **Import the rooms, every one of them, each carrying whether it can be played** | The export's rooms are in the tree in this project's format; a room that depends on a rule goal 1 only stubbed is marked unplayable rather than omitted; the suite asserts a converted room against its source |
| 3b | ✅ | **Support an element that occupies more than one cell**, so that what the rooms are made of reaches the rules rather than only being carried | The domain gives a footprint larger than one cell surfaces the ball collides with, and a room whose only obstacle was that footprint is no longer unplayable for it |
| 4 | ✅ | **Play them** — the level's dimensions and the sizing it is drawn at follow the real rooms, and one is drawn at random when the page opens | The end-to-end suite opens the page twice, gets a playable imported room both times, at its real dimensions, and never gets one marked unplayable |
| 5 | ✅ | **Add a level preview page**, reachable from the dev index alongside the existing style, audio and elements pages | The dev index links the page; opening it shows one imported room at its real dimensions; pressing keyup or keydown steps to the next or previous room, cycling across all of them, including the ones marked unplayable |
| 6 |   | **Re-import the rooms from the corrected export**, `TRAZ_pass2_updated_importable`, which fixes a range of characters the previous export misclassified and is now identified as the glass refractor | The tree's rooms come from the corrected export; the converter's fixture and every room count the suite asserts are re-checked against it; a room whose only unplayable reason was the misclassified range is playable, or unplayable for a reason that still holds |

**Goal 3b was added once the import had been done, which is what a scope changing mid-flight is
for.** Every object the original places is larger than one cell, so a rule reading only one-cell
footprints reaches nothing the rooms are made of. It is named as its own goal rather than folded into
goal 4, because giving a footprint surfaces is a rule of the world and drawing a room at random is
not.

**Goal 3b alone does not make a room playable, and goal 4 is where that is settled.** An imported
room also places kinds no rule gives behaviour to, authors where the ball starts, and stands its bats
free of both perpendicular sides. Which of those goal 4 needs answered, and how, is goal 4's to find
out.

**Every room is imported, including the ones that cannot yet be played.** Importing only what the
current rules support would make the import a second place where those rules are decided, and would
hide how much of the original is still out of reach. A marker on the room says it, and the random
draw reads the marker.

**Goals 5 and 6 were added once goal 4 was underway, which is the same mid-flight change goal 3b
was.** Neither depends on the other, and neither is a step of goal 4 — a preview page for browsing
the rooms is a dev-only tool, not a rule the played game needs, and a corrected export is a better
source for the same converter, not a new capability. They are named as their own goals rather than
folded into goal 4 or into each other.

**Goal 6 exists because the export itself was wrong, not because a rule was missing.** The
concessions in `spec-domain-porting-todo.md` still stand — glass has no behaviour yet, and P-2 still
leaves it out of the played level — but the previous export misidentified the character range that
draws it, and whatever it was misidentified as may have stood in the ball's way when the original
never put anything there. Correcting the source is separate from giving glass a rule, and only the
second ends the concession.

**Colors are the aspect most easily lost.** They are metadata on every object and on the room's
background, they change nothing about play, and nothing fails when they are dropped — which is
exactly why goal 1 names them and goal 3 is checked against them.
