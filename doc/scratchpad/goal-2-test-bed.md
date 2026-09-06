# Goal 2 — test bed for elements

Kind: proof of wiring. The seam is `dev/elements.ts` calling the real `createGameState`, `step`,
`draw`, `soundFor` and `play` against small levels built for the purpose — the same pattern
`dev/style.ts` and `dev/audio.ts` already use for spec-style.md, generalised to spec-domain.md's
seven element kinds, five of which spec-style.md cannot show because it gives them no color.

Every task is implemented — `dev/elements.html`/`.ts`, `dev/index.html`, and the readouts —
verified against the real dev server with Playwright: all seven panels reachable, the two brick
panels playable and the five DS-7.1 panels correctly not, the anchor brick clearing on Space alone,
steering into the permanent brick blocking without destroying it, and the DS-7.1 panel drawing
nothing for its own element — matching spec-style's "nothing draws them" exactly. `src/main.ts` and
`src/levels/clearing-proof.ts` are untouched.

Nothing is left.
