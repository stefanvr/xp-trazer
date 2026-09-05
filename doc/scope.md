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

---

**No goal is set.** The last one was reached and cleared. Run `todo-discovery` for what the documents
have left open, then `scope create` to set the next one.
