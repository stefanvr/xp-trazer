# The dev pages author no ball start

Kind: **repair**. Matched against `doc/spec-domain.md`'s **DS-1.4** — every level authors where the
ball starts. The rule arrived with goal 4, which ended **P-1** and made `heldAt` throw rather than
place the ball itself. Two dev pages predate the rule and were never brought to it, so both throw
before they draw anything.

**This is not goal 6's work.** It was found while looking at goal 6 and is repaired on the same
branch because the owner asked for it there.

| Page | Why it throws |
|---|---|
| `dev/style.html` | Every panel's rows in `dev/style.ts` are written without a `*`, so `levelFromRows` refuses them at **DS-1.4** |
| `dev/elements.html` | `levelFor` builds its level with `levelFrom` and passes no `ballStart`, so `createGameState` reaches `heldAt` and it throws |
| `dev/levels.html` | Unaffected — it plays imported rooms, and every one of them authors its own start |

**Nothing caught it, and that is the more useful half.** No test in `e2e/` opens any dev page, and
the pages are deliberately outside `vite build`, so the suite that runs against the built page cannot
reach them. Two landings passed with both pages broken.

## What is left

| Task | What makes it checkable |
|---|---|
| Nothing | — |

## Kept for the landing to read

**Both pages author a ball start now**, and the elements page's level building moved to
`dev/panels.ts` so that what a panel is made of is plain state — **A-1** — rather than something only
a browser can reach. `dev/panels.test.ts` asserts every panel level is playable and holds the ball on
the bat, in milliseconds.

**The suite reaches the dev pages for the first time.** `e2e/dev-pages.spec.ts` opens all four and
asserts each loads without throwing, and that three of them draw. It needs a second web server
running the dev one, because the pages are kept out of `vite build` — `playwright.config.ts` says
why, and why putting a dev page into the build to make it testable would be the wrong trade.

**Proven by putting the bug back.** The ball start was removed from `dev/panels.ts` and the `*` from
`dev/style.ts`'s panel rows: two unit tests failed, and four end-to-end tests failed — both dev pages
failing to load and to draw. Reverted, and both suites clean.

**The finding, for whoever reads this at the landing.** A dev page can be broken by a rule change for
two landings and nothing says so, because the suite ran against the built page and the pages are not
in the build. That is now false, and it is the reason to keep the second server rather than a cost
to trim later.
