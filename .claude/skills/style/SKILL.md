---
name: style
description: Build or refresh the dev-only page that demonstrates every visual currently named in doc/spec-style.md, drawn with the project's real render code and real color constants rather than a mockup. Use when spec-style.md changes, before adding a new element to it, or when asked to preview, demonstrate, or check the current visual spec.
---

# Style

**Owns.** Keeping one page that shows, with real render code, every visual
[spec-style.md](../../../doc/spec-style.md) currently names — so "does this still read as a Tron
neon-on-black bat" does not depend on someone remembering what the last session decided.

**Not here.** What the palette and shapes *are* — [spec-style.md](../../../doc/spec-style.md) decides
those; this skill only displays the decision. Whether a color or shape is right is that document's
question, argued on its own terms, never this skill's.

**This is a dev-only affordance**, in [guide-design.md](../../../doc/guide-design.md)'s own sense —
"preview pages rendering real output from real code" — gated so it never ships. It is not a proof or
product functionality in [build](../build/SKILL.md)'s sense, and it does not wait on spec-domain.md or
spec-app.md to exist.

---

## What the page shows

One panel per row in spec-style.md's palette table — a shape or swatch in that color, glowing the way
the spec says everything glows, labelled with the element's name and role. When the table gains a row,
the page is missing a row until this routine runs again.

## How it stays real, not a mockup

- **An element the domain already models is drawn by calling the project's actual render function**,
  not a re-implementation of it. Right now that is the ball and the boundary, drawn by calling
  `draw()` in [src/render/draw.ts](../../../src/render/draw.ts) against a real `World`.
- **An element spec-style.md names ahead of the domain owning it — a brick, a bat — is drawn directly**,
  shape and color taken straight from the spec, and labelled as not yet backed by a domain type. Never
  invent a domain type to justify drawing it; that is [build](../build/SKILL.md)'s "a proof contains no
  product decisions" showing up here too.
- **Every color spec-style.md names lives in one module** — [src/render/palette.ts](../../../src/render/palette.ts)
  — imported by the real renderer, by the application's own stylesheet, and by this page. Two copies
  of a hex the specification decides is exactly the drift this routine exists to catch, so there must
  never be a second copy. **Chrome is not one of those**: spec-style.md leaves UI chrome unowned, so
  this page's own background and text stay in `dev/style.css`. The application's page is not chrome —
  its background sits against the playfield, so it takes the specification's value.

## Where it lives

`dev/style.html`, reachable from `npm run dev` at `/dev/style.html`. Vite serves any HTML file under
the project root in development, while its default *build* entry is `index.html` alone — so this page
is left out of `vite build` with no extra configuration. That omission *is* the gate, and adding
`dev/style.html` to `build.rollupOptions.input` would remove it, so don't.

## Verifying it

Run the dev server, load `/dev/style.html`, and screenshot it — per
[guide-general.md](../../../doc/guide-general.md), a page that builds without error is not a page that
looks right. Check the labelled panel count against spec-style.md's palette table by hand; nothing
enforces that they match, because the routine that would enforce it is the one being run.

## When to run it

- `spec-style.md` gains, loses, or changes an element.
- Before adding a new element to `spec-style.md`, to see the existing set rather than guessing at it
  from the table.
- On request, to check the current visual spec against the eye rather than the document.

## When not to run it

- **To decide what a color or shape should be.** That is `spec-style.md`'s decision, made and confirmed
  there first; this skill only shows what was already decided.
- **For anything spec-domain.md or spec-app.md would own.** This page draws looks, not behaviour,
  input, or flow — a brick that breaks or a bat that moves is a different goal.
