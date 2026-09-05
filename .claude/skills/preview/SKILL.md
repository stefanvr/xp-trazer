---
name: preview
description: Build or refresh the dev-only pages that demonstrate everything doc/spec-style.md currently names — the visuals, drawn by the project's real render code and real color constants, and the sounds, played by its real synthesis from its real values, rather than a mockup of either. Use when spec-style.md changes, before adding an element or a sound to it, or when asked to preview, demonstrate, or check the current style spec.
---

# Preview

**Owns.** Keeping the pages that show, with real code, everything
[spec-style.md](../../../doc/spec-style.md) currently names — so "does this still read as a Tron
neon-on-black bat" and "does this still sound like the C64" do not depend on someone remembering what
the last session decided.

**Two pages, one job.** `dev/style.html` shows what the specification decides about the eye, and
`dev/audio.html` what it decides about the ear. They are separate pages because a sound has no shape
to sit beside a swatch, and one job because the reason either exists is identical.

**This skill was called `style` until the specifications got authoring skills of their own.** A
reference to *"the `style` skill"* in a commit older than that rename means this one.

**Not here.** What the palette and shapes *are* — [spec-style.md](../../../doc/spec-style.md) decides
those; this skill only displays the decision. Whether a color or shape is right is that document's
question, argued on its own terms, never this skill's.

**This is a dev-only affordance**, in [guide-design.md](../../../doc/guide-design.md)'s own sense —
"preview pages rendering real output from real code" — gated so it never ships. It is not a proof or
product functionality in [build](../build/SKILL.md)'s sense, and it does not wait on spec-domain.md or
spec-app.md to exist.

---

## What the visual page shows

One panel per row in spec-style.md's palette table — a shape or swatch in that color, glowing the way
the spec says everything glows, labelled with the element's name and role. When the table gains a row,
the page is missing a row until this routine runs again.

## How the visual page stays real, not a mockup

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
  its background sits against the level, so it takes the specification's value.

## What the sound page shows

One panel per sound spec-style names, and **one per event that decides whether a sound happens at
all**. The second set is not decoration: the specification's most consequential decision about sound
is a *silence* — a collision that destroyed what it met makes no noise, because its destruction is
what is heard — and a silence is the one thing a list of sounds cannot show. It gets a panel wearing
a disabled button, so it reads as a decision rather than as a missing one.

Each sound's panel also prints its segments in the specification's own terms — waveform, length,
sweep, gain, envelope, filter — so the page can be read against the document rather than only heard.

## How the sound page stays real, not a mockup

The same rule as the visual page, one layer over:

- **Every sound is played by calling the project's actual `play()`**
  ([src/audio/play.ts](../../../src/audio/play.ts)), never a second synthesis written for the page.
- **Every value spec-style names lives in one module** —
  [src/audio/sounds.ts](../../../src/audio/sounds.ts), what
  [src/render/palette.ts](../../../src/render/palette.ts) is for the colors — imported by the real
  game and by this page. A panel carrying its own copy of an envelope could go on sounding right
  after the audio edge stopped, which is the drift this exists to catch.
- **Which event is heard as what comes from `soundFor`**, the same function the game calls. The page
  cannot show a mapping the game does not have.

**Nothing here waits on a browser's audio gesture.** A page whose panels are buttons is all gesture,
so the first press is the unlock — which is why sound gets a page and not a screenshot.

## Where they live

`dev/style.html` and `dev/audio.html`, reachable from `npm run dev` at `/dev/style.html` and
`/dev/audio.html`. Vite serves any HTML file under the project root in development, while its default
*build* entry is `index.html` alone — so neither page is in `vite build`, with no extra
configuration. **That omission is the gate**, and adding either to `build.rollupOptions.input` would
remove it, so don't. They share `dev/style.css`, because a second stylesheet is a second copy of the
chrome and would drift.

## Looking at them, and listening

Run the dev server, load the page, and screenshot the visual one. Check the panel count against
spec-style.md by hand; nothing enforces that they match, because the routine that would enforce it is
the one being run.

**The sound page has to be listened to, and that is not a weaker check — it is the only one there
is.** An automated test can assert the page asked for a sound; nothing it can assert answers *does
this sound like the C64*.

**Neither is the verification [guide-general.md](../../../doc/guide-general.md) rules out.** That rule
says the suite verifies and the product is not driven by hand to settle a claim — and it is right,
because a claim settled by looking proves one thing once. **Nothing is being claimed here.** These
pages have no purpose but to be looked at and listened to: they are a deliverable for the owner, and
the looking is the product rather than the evidence. The distinction is worth keeping straight,
because a page that *is* the answer and a page driven to *find* the answer look identical while you
are on it.

## When to run it

- `spec-style.md` gains, loses, or changes an element or a sound.
- Before adding either to `spec-style.md`, to meet the existing set rather than guessing at it from
  the tables.
- On request, to check the current style spec against the eye and the ear rather than the document.

## When not to run it

- **To decide what a color, a shape or a sound should be.** That is `spec-style.md`'s decision, made
  and confirmed there first — by the [style](../style/SKILL.md) skill, which authors it. This one only
  shows what was already decided.
- **For anything spec-domain.md or spec-app.md would own.** These pages draw and play looks and
  sounds, not behaviour, input, or flow — a brick that breaks or a bat that moves is a different goal.
