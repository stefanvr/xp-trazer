# Working notes — the game is heard

**Working notes. No decision lives here**, and nothing may cite this file. Cleared when the goal
lands; the `land` skill gives every item below one of three fates.

---

## Open

### Two comments in `src/` cite documents wrongly

Both are comment-only changes, and both belong to the build goal rather than to a specification pass —
it will open both files anyway, to make `step` announce what happened.

**`src/domain/collision.ts`** documents its `Obstacle` type as *"doc/spec-domain.md's **Collision**"*.
It is not: in the specification a **Collision** is the meeting, and `Obstacle` is the thing met. The
vocabulary activity considered promoting `Obstacle` to a specification term and decided against it —
a collision names one of **Boundary**, **Bat** or **Brick** directly, using words the domain already
owns. So `Obstacle` stays a code-internal helper, and the comment should say that instead of claiming
to be a specification term.

**`src/domain/simulation.ts`**, the module comment, says *"the behaviour is not yet"* and lists a
level of cells, elements, bats and bat groups, holding and launching, a seed and clearing as
**absent**. Every one of them is in that file or imported into it. It also cites a paragraph of
`spec-tech.md` that has since been deleted for being stale in exactly the same way, so the citation
now resolves to nothing.

The sentence worth keeping from it is the last one — a spec-domain name in the file does not mean the
rule behind it is built — because **DS-6** is about to be precisely that case.

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
