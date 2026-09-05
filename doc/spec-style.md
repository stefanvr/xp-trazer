# Style specification

**Owns.** How version one looks and sounds. *"Look, sound and feel"* is the routing's full remit
([CLAUDE.md](../.claude/CLAUDE.md)); nothing in version one is felt rather than seen or heard — see
*What this leaves open*.

**Not here.** The rules of the world — [spec-domain.md](spec-domain.md); what the player and
developer meet — screens, input, flow — [spec-app.md](spec-app.md); which rendering technology draws
any of this — [spec-tech.md](spec-tech.md). This document says what should appear on screen and what
should be heard, not what code produces either.

**Scoped to what version one needs**, not to the whole game brainstormed in
`doc/brainstorm/2026-09-02.md`. A hazard, a map, a HUD — none of them are in version one, so none of
them gets a look or a sound here yet.

---

## The reference — Tron, neon on black

Version one looks like Tron, and carries it from
[the brainstorm](brainstorm/2026-09-02.md): Tron was the owner's screenshot answer, given "without
hesitation". The C64 heritage of Traz and Arkanoid is a flavour on this project, not a visual
constraint — *"just feels like it"* is the entire argument for it — and it yields to Tron wherever the
two would disagree on how something looks.

**What that means concretely:** a near-black void, thin glowing lines and filled shapes with a glow at
their edge, no textures, no gradients beyond the glow itself. Every element is a distinct neon hue
against the dark — color is how the eye tells one kind of thing from another, not decoration.

**In the ear it is the other way round: the C64 is the reference, and there it does not yield.** The
sentence above is about how something *looks*, and this is the deliberate other half of it — **C64 in
the ear, Tron in the eye**. Tron governs the eye because it was the answer to a question about a
screenshot. Nothing answers that question for sound, and something better does: the game being remade
left its own effects behind, recovered from the original and reconstructed. Tron's own sound is
orchestral, which is not what a sixty-millisecond tick wants to be.

## Palette

| Element | Color | Role |
|---|---|---|
| Level background | `#05080d` — near-black | The void everything else sits on |
| Boundary / wall | `#123a4d` — dim blue | Marks the closed level without competing with play elements |
| Ball | `#f5fbff` — near-white | The one thing that must read first, everywhere, at any speed |
| Destructible brick | `#33ff99` — green neon | The objective — what clearing removes |
| Permanent brick | `#ff8a3d` — amber neon | Reads as structure, not as a target; deliberately not in the same hue family as the destructible brick |
| Horizontal bats | `#22e0e0` — cyan neon | One control group |
| Vertical bats | `#ff2fd6` — magenta neon | The other control group — a different hue from horizontal, so the two axes are told apart at a glance without reading a label |

No two elements the player must tell apart at a glance share a hue. Brightness is reserved for the
ball because it is the one thing always in motion and never optional to see.

## Line and glow

Everything in the level is either a thin glowing line or a filled shape with a glow at its edge.
[spec-tech.md](spec-tech.md) has already chosen Canvas 2D `shadowBlur` as sufficient to produce that
glow; this document is the reason that choice needs to hold, not a restatement of it. If `shadowBlur`
ever stops reading as Tron's glow, that is a reason to reopen the rendering choice in spec-tech, not to
add a rule here.

## Typography

Version one puts exactly one piece of text on the level: the word a cleared level shows.
[spec-app.md](spec-app.md) asks for it — *"a ball that has merely stopped is indistinguishable from a
ball that has stopped working"* — and leaves what it says and looks like here.

| What | Decision |
|---|---|
| The word | `CLEARED`, uppercase |
| Face | The system sans-serif stack. No web font: nothing to load, nothing to ship, and nothing about Tron needs a face this project would have to carry |
| Size | One and a half cells tall, so it scales with the level rather than with the screen |
| Tracking | Wide — a quarter of the size between letters, which is what makes uppercase read as a title rather than as shouting |
| Color | `#33ff99`, the destructible brick's green. **It is the hue that meant *the objective*, and it comes free exactly when the objective is complete** — the last brick wearing it has just gone, so nothing is on screen to confuse it with |
| Placement | Centred on the level, drawn over everything |
| Glow | The same edge glow as everything else |

**No panel, no box, no dimming behind it.** The level stays lit and the word sits on it. A cleared
level is still the thing the player was looking at, and covering it would make finishing look like
leaving.

## Sound

**Two sounds, and nothing else makes a noise.** [spec-domain.md](spec-domain.md)'s **DS-6.2**
announces two events, and each has one sound.

| What happens | What is heard |
|---|---|
| A collision that destroyed nothing — a boundary, a bat, a permanent brick | The **collision** sound |
| An element destroyed | The **destruction** sound |
| A collision that destroyed what it met | Nothing |

**A collision that destroyed what it met is silent, because its destruction is what is heard.** The
ball meeting a destructible brick produces both events — **DS-6.6** — so without this rule two sounds
land on the same sixty milliseconds and smear into each other. **DS-6.4** is what makes the rule
answerable: the collision says whether it destroyed what it met, so nothing has to be correlated to
know whether to stay quiet.

**A permanent brick sounds like a wall.** Not a choice — there is no third effect in the recovered
material, and inventing one would be inventing a sound for this game rather than recovering one.

**The sounds are named for the events that cause them**, so nothing is renamed between the domain and
the ear.

### What to synthesise

Synthesised rather than played back from a recording — that choice is
[spec-tech.md](spec-tech.md)'s. What follows is the sound itself, and it is to this document what the
palette is: the values that decide what the thing *is*, rather than a description of them.

Each sound is two segments, one after the other. Attack, decay and release are in milliseconds;
sustain is a level from 0 to 1. A frequency pair is a sweep from the first to the second across the
segment.

| Sound | Segment | Wave | Length | Frequency | Gain | A / D / S / R | Low-pass |
|---|---|---|---|---|---|---|---|
| **Collision** | 1 | triangle | 45 ms | 510 → 330 Hz | 0.52 | 1 / 10 / 0.45 / 25 | 7000 Hz |
| | 2 | pulse, duty 0.30 | 28 ms | 1050 → 730 Hz | 0.22 | 0 / 6 / 0.30 / 20 | 8000 Hz |
| **Destruction** | 1 | pulse, duty 0.25 | 42 ms | 820 → 480 Hz | 0.43 | 0 / 8 / 0.35 / 24 | 5600 Hz |
| | 2 | noise | 20 ms | — | 0.13 | 0 / 4 / 0.25 / 14 | 4200 Hz |

The collision runs 73 ms and the destruction 62 ms. **Both are shorter than a tenth of a second, and
that is the point** — the ball collides several times a second, and anything longer would overlap
itself rather than mark an event.

**A collision is pitched and a destruction is not.** The collision's triangle carries a note; the
destruction ends in filtered noise with no pitch at all. That is what separates them at speed, the
same way a hue separates two elements — and it is why neither may be retuned toward the other for
being prettier alone.

## What this leaves open

Named rather than guessed at, so a later goal knows what it is deciding rather than rediscovering that
nothing was decided:

- **Music.** There is none, and nothing above says whether there ever is any. The two sounds mark
  events; a score is a different decision and nothing has forced it.
- **Anything the player adjusts.** No volume, no mute. Version one has no place to put a control and
  no screen to put it on.
- **What happens when several sounds land at once.** **DS-6.7** allows a step to announce several
  collisions, and nothing above says whether they all sound, or how loud that is. Left open because
  it needs a running game to answer, and guessing at it now would be guessing.
- **Every sound belonging to a mechanic version one does not have.** The recovered material carries
  eight more — a bat firing, a bumper, a trap, aliens, a pickup, a lost ball. Each arrives with the
  mechanic that causes it, and none of them is a decision this document has deferred.
- **HUD / UI chrome.** Version one has no score, no lives, no menu, no map — nothing in it needs a
  look for any of them yet.
- **Typography beyond the one word above.** Version one's level carries `CLEARED` and nothing else,
  so the face is chosen and nothing else about type is — no scale, no second weight, no body text.
- **What would make it visually wrong.** Asked in brainstorm, answered "no idea" — free rather than
  missing, and the cheapest kind of decision to leave for when something forces an answer.
- **The Tron/C64 tension for anything beyond version one.** Brainstorm left it standing rather than
  resolved. The reference section above settles it for version one by splitting it — Tron in the eye,
  C64 in the ear — which is an answer for these two senses and not a principle to apply to a third. A
  future level that wants C64 chunkiness on screen reopens it.
