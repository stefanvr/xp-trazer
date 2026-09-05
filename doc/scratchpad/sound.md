# Working notes — the game is heard

**Working notes. No decision lives here**, and nothing may cite this file. Cleared when the goal
lands; the `land` skill gives every item below one of three fates.

---

## Open

### The style preview page now covers half of what spec-style owns

The `style` skill builds a dev-only page demonstrating *"every visual currently named in
`doc/spec-style.md`"*, and says to run it whenever that document changes. `spec-style.md` has just
gained a section the page cannot show, so running the skill after this change demonstrates the
document's visuals and silently omits its sounds.

Nothing is wrong with the skill as written — it says *visual*, and it does that. The gap is that
spec-style now owns something no routine demonstrates, and *the suite is the verification* does not
reach a question like *does this sound right*, which is a judgement rather than an assertion.

**Whose it is:** the skill's, not this goal's. Raised here so the landing gives it a fate rather than
leaving it to be met by someone running `style` and wondering why sound is missing.

## Carried forward, for a goal that is not this one

### The original has bricks that take more than one hit

The owner reports it of the C64 game. Nothing in this project has it: **DS-4.2** destroys a
destructible brick in a single collision, and version one's two levels author nothing else.

It is why **DS-6.4** is a flag on the collision rather than something read off the brick's kind — the
implication *met a destructible brick, therefore destroyed it* holds only while DS-4.2 says so, and
this is the change that ends it.

**Where it belongs:** the goal the owner has sequenced as *extending in level elements and bonuses*.
Recorded here so the reason DS-6.4 exists does not have to be rediscovered from the commit that
wrote it.
