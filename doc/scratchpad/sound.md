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
