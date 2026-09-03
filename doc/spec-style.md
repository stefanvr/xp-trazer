# Style specification

**Owns.** How version one looks. *"Look, sound and feel"* is the routing's full remit
([CLAUDE.md](../.claude/CLAUDE.md)), but sound and everything felt rather than seen have nothing in
`doc/scope.md` yet to attach to — see *What this leaves open*.

**Not here.** The rules of the world — [spec-domain.md](spec-domain.md); what the player and
developer meet — screens, input, flow — [spec-app.md](spec-app.md); which rendering technology draws
any of this — [spec-tech.md](spec-tech.md). This document says what should appear on screen, not what
code produces it.

**Scoped to what `doc/scope.md`'s "In" list needs**, not to the whole game brainstormed in
`doc/brainstorm/2026-09-02.md`. A hazard, a map, a HUD — none of them are in version one, so none of
them get a look here yet.

---

## The reference — Tron, neon on black

Named in `doc/scope.md`'s first-version "In" list, and carried from
[the brainstorm](brainstorm/2026-09-02.md): Tron was the owner's screenshot answer, given "without
hesitation". The C64 heritage of Traz and Arkanoid is a flavour on this project, not a visual
constraint — *"just feels like it"* is the entire argument for it — and it yields to Tron wherever the
two would disagree on how something looks.

**What that means concretely:** a near-black void, thin glowing lines and filled shapes with a glow at
their edge, no textures, no gradients beyond the glow itself. Every element is a distinct neon hue
against the dark — color is how the eye tells one kind of thing from another, not decoration.

## Palette

| Element | Color | Role |
|---|---|---|
| Playfield background | `#05080d` — near-black | The void everything else sits on |
| Boundary / wall | `#123a4d` — dim blue | Marks the closed playfield without competing with play elements |
| Ball | `#f5fbff` — near-white | The one thing that must read first, everywhere, at any speed |
| Removable brick | `#33ff99` — green neon | The objective — what clearing removes |
| Permanent brick | `#ff8a3d` — amber neon | Reads as structure, not as a target; deliberately not in the same hue family as the removable brick |
| Horizontal bats | `#22e0e0` — cyan neon | One control group |
| Vertical bats | `#ff2fd6` — magenta neon | The other control group — a different hue from horizontal, so the two axes are told apart at a glance without reading a label |

No two elements the player must tell apart at a glance share a hue. Brightness is reserved for the
ball because it is the one thing always in motion and never optional to see.

## Line and glow

Everything on the playfield is either a thin glowing line or a filled shape with a glow at its edge.
[spec-tech.md](spec-tech.md) has already chosen Canvas 2D `shadowBlur` as sufficient to produce that
glow; this document is the reason that choice needs to hold, not a restatement of it. If `shadowBlur`
ever stops reading as Tron's glow, that is a reason to reopen the rendering choice in spec-tech, not to
add a rule here.

## What this leaves open

Named rather than guessed at, so a later goal knows what it is deciding rather than rediscovering that
nothing was decided:

- **Sound.** Out of scope for version one (`doc/scope.md`), and brainstorm's either/or on when it
  arrives was answered "yes" — unresolved. Nothing here commits to it being part of the feel or added
  last.
- **HUD / UI chrome.** Version one has no score, no lives, no menu, no map — nothing in scope needs a
  look for any of them yet.
- **Typography.** No text appears in version one's playfield.
- **What would make it visually wrong.** Asked in brainstorm, answered "no idea" — free rather than
  missing, and the cheapest kind of decision to leave for when something forces an answer.
- **The Tron/C64 tension for anything beyond version one.** Brainstorm left it standing rather than
  resolved; version one sidesteps it because scope already committed to Tron. A future level that wants
  C64 chunkiness reopens it.
