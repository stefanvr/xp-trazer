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
