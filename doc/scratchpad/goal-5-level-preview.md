# Goal 5 — a level preview page

Kind: **proof of wiring**. The seam is `dev/levels.ts` calling the real `portedLevel`,
`unplayableReasons`, `extentOf` and `draw` against the real imported rooms in
`src/levels/rooms.generated.ts` — the same pattern `dev/elements.ts` already uses for
spec-domain.md's element kinds, here reaching every real room instead of a level built for the
purpose. It draws a level once per keypress rather than running the simulation loop: a preview is
not a play, and running `createGameState` over every room would throw for the ones DS-1's own
reasons mark unplayable, which is the thing this page exists to show rather than hide.

## What is left

| Task | What makes it checkable |
|---|---|
| Nothing | — |

## Kept for the landing to read

Driven against the real dev server with Playwright, the way goal 2's `dev/elements.html` was —
`dev/` is left out of `vite build`, so the built-page e2e suite cannot reach it, and neither
`dev/elements.html` nor `dev/style.html` carry a persisted end-to-end test for the same reason.
Checked: the initial room draws at its real 1280×800 extent; ArrowDown 64 times returns to the
starting room, passing through exactly one unplayable room (29, `DS-4.4`, matching
`spec-domain-porting-todo.md`'s count); ArrowUp from the first wraps to the last; the hub links the
page and the page links back; no console or page errors.

**The mutation proof.** The wraparound (`((next % LEVELS.length) + LEVELS.length) % LEVELS.length`)
was changed to a plain `next % LEVELS.length`, which cannot wrap a negative index. The check caught
it two ways: "ArrowUp from start wraps to" reported room 0 instead of 63, and the page itself threw
`Cannot read properties of undefined (reading 'columns')`. Reverted, and the unmutated re-run passed
clean.
