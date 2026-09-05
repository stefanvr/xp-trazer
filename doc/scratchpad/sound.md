# Working notes — the game is heard

**Working notes. No decision lives here**, and nothing may cite this file. Cleared when the goal
lands; the `land` skill gives every item below one of three fates.

---

## Open

### `Obstacle`'s comment names the wrong specification term

`src/domain/collision.ts` documents its `Obstacle` type as *"doc/spec-domain.md's **Collision**"*. It
is not: in the specification a **Collision** is the meeting, and `Obstacle` is the thing met.

The vocabulary activity considered promoting `Obstacle` to a specification term and decided against
it — a collision names one of **Boundary**, **Bat** or **Brick** directly, using words the domain
already owns. So `Obstacle` stays a code-internal helper, and its comment should say that instead of
claiming to be a specification term.

**Not fixed here**, because a specification pass writes specifications; the code change belongs to
the build goal, which will open that file anyway.

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

### spec-tech says the domain is unbuilt, and it is not

`doc/spec-tech.md` still carries this, from when spec-domain was newly written and the code had only
borrowed its words:

> **The code uses spec-domain's names, and that is all it uses of it.** A level of cells, elements,
> bats and bat groups, holding and launching, a seed and clearing are all unbuilt. **A spec-domain
> name found in `src/` does not mean the rule behind it is implemented.**

It is false now. `src/` cites DS-1.2 through DS-5.2 across `level.ts`, `bat.ts`, `collision.ts` and
`simulation.ts`, and `npm test` passes 118 tests over them. Verified rather than assumed: the
citations were counted and the suite was run.

The last sentence is still worth keeping in some form — a cited number is not proof of an
implementation, and **DS-6** is about to be exactly that case, specified and unbuilt. What has to go
is the list of things called unbuilt that are built.

**Not fixed here** — it is a content change to a document this pass was not asked to revise, and the
replacement wording is the owner's call.

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
