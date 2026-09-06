# Application specification

**Owns.** What the player meets: the screens, the input, the flow between them, and the layout those
screens take.

**Not here.** The rules of the world are [spec-domain.md](spec-domain.md); how anything looks is
[spec-style.md](spec-style.md); which technologies produce any of it is
[spec-tech.md](spec-tech.md).

**Not specified yet.** Level selection on a map, returning to selection after dying, and progress
kept between sessions. None of them is here, and nothing below assumes them.

**This document states the desired state.** Where the code disagrees, the code is wrong.

---

## The story map

### The activity

**Play a level.** One, drawn at random from the original's rooms when the page opens. There is no
menu, no selection, no map, and nothing kept between sessions.

**Only a room the rules can play is ever drawn.** A room the rules cannot play yet is in the tree and
is never put in front of the player — [spec-domain.md](spec-domain.md) says what makes a level
playable, and this document only says that the draw obeys it. The player cannot choose, so opening
the page again is the only way to another room, and getting the same one twice is what a draw means
rather than a fault.

### The steps, and what completes each

| Step | Details |
|---|---|
| **Launch the ball** | The ball starts held, where the level puts it. Left and right move the horizontal bat group, up and down the vertical one, and both are live at once — so a player may place the bats before committing, though not aim, because the ball leaves on a heading it is given rather than one the player chooses. **Space** launches it. |
| **Play until the level is cleared** | The same four keys keep moving both groups while the ball travels. The ball destroys the destructible bricks it collides with. When the last one is gone the level is cleared, stops, and shows the player that it is. |

**Placing the bats before launching is a detail and not a step.** A player can press Space
immediately and the activity still completes, so it is something the launch step allows rather than
something it requires.

**That the cleared level says so is a step's detail; what it says and how it looks is
[spec-style.md](spec-style.md)'s.** A ball that has merely stopped is indistinguishable from a ball
that has stopped working.

## Where the steps surface

**One surface, and no navigation.** Both steps happen on the level itself. Nothing is entered, left,
or returned to — there is no second place for anything to be.

| Step | How the player acts |
|---|---|
| **Launch the ball** | An arrow key **held** moves its bat group for as long as it is held. **Space**, pressed once, launches. |
| **Play until the level is cleared** | The same four keys, the same way. The cleared indication appears on the level, where the player is already looking. |

**No step triggers a sound, and nothing animates.** Sound is not something the player does — it is
what the world does back. What makes a noise happens inside *play until the level is cleared* rather
than completing any step of it, and which things those are is [spec-style.md](spec-style.md)'s to
say. No step waits for a sound, and none is prevented by one.

Still nothing to animate: the ball's motion is the simulation advancing, which
[spec-domain.md](spec-domain.md) owns, not an effect this document asks for.

**The player has always acted before the first sound.** The ball is held until it is launched
— [spec-domain.md](spec-domain.md)'s **DS-1.5** — and a held ball collides with nothing, so nothing
can make a noise before the player's own first press.
Stated rather than arranged: a browser will not start audio until the player has acted, and this game
cannot make a sound before that happens, so there is no unlock step for this document to add.

### Touch acts on the same steps, through on-screen buttons

**No new step, and no new activity.** Touch does not change what a player does — it is a second way
to act on the two steps above, for the screen where a keyboard is not to be had.

**Two bat groups, live at once, is what a keyboard's four held keys give for free and a touchscreen
does not.** A drag on a bat, or a tap on a screen edge, both fail the same test: neither reliably
gives two independent, simultaneous, held inputs on a small screen, and both bat groups being live at
once is not a detail this document may trade away. Five on-screen buttons do, the same way two hands
on a keyboard do: four directional, one per key they replace, and one to launch.

| Step | How the player acts |
|---|---|
| **Launch the ball** | A directional button **held** moves its bat group for as long as it is held, exactly as its key does. The **launch** button, tapped once, launches. |
| **Play until the level is cleared** | The same five buttons, the same way. |

**A button holds exactly the state its key holds, and nothing else.** `touchstart` sets the same flag
`keydown` does; `touchend` clears it. [spec-domain.md](spec-domain.md)'s `Input` is not touched, and
does not need to be — it already asked for four directions and a launch, never for how they arrived.

## Layout

**One screen, and nothing to navigate.** No header, no footer, no menu, no dialog. There is
nothing to put in any of them, and adding one would be a surface with no step behind it.

The screen holds the level, and a line of readouts beside it: the build identifier that
[spec-tech.md](spec-tech.md) keeps, the collision count, the position of a bat group the level
actually has, how many destructible bricks are left, and which room is being played.

**The bat readout follows a group the level has, and names which.** A level may author only one of
the two groups, so a readout fixed to one of them reads zero for ever in every level without it —
an indicator that is always wrong for a third of what it reports stops being read, and the check
that reads it stops meaning anything.

**Which room is being played is a readout because nothing else can be asked from outside.** The draw
is random, so a check has no way to know what it got; without this, *a playable room was drawn* is a
claim nothing can settle from the built page.

**The readouts stay, and they are not the player's.** They were written as temporary proof
instruments and are kept as permanent ones. A built artefact that cannot be interrogated from outside
can only be checked by eye, and these are what an automated check reads to see that the loop is
running and that a key reached the simulation — [spec-tech.md](spec-tech.md)'s argument for the build
identifier, applied to behaviour rather than to provenance. **They sit beside the level and never on
it**, so nothing the player plays inside carries them, and no step needs them.

**The level is drawn at its own size and scaled to fit the space it is given, keeping its aspect
ratio.** A room's size is the room's, not the window's: it is drawn at the extent its own grid comes
to, and the screen shows as much of that as it has room for. **Scaling is the normal case and not an
exception** — a room is larger than the window it is shown in, so it is never shown at 1:1 on any
mode, and a rule that treats fitting as the small screen's special problem is describing a product
that no longer exists.

**Nothing about the level changes when it is scaled.** Not the size of a cell, not how fast the ball
crosses the room, not how far a bat slides. The level is drawn smaller; it is not played smaller.
Scaling is the last thing that happens to it, and [spec-domain.md](spec-domain.md)'s units never hear
about it.

**Desktop-sized, and driven by the keyboard — one of two modes.**

### The small-screen mode

**Both conditions decide it, not either alone.** The screen is narrower than **700px**, *and* the
device reports touch support. A narrow desktop window without touch stays on the keyboard layout —
narrow is not the same as untouchable, and a resized window is not a phone. A wide touch screen also
stays on it — a large touchscreen is assumed to have room and, often, a keyboard.

**700px is a judgement about the device, not about the level.** The level scales to whatever width it
is given in either mode, so its own size decides nothing here; what the number marks is where a
screen is small enough that a keyboard is unlikely and the buttons are what the player has. There is
no more portable reason than that, and the touch condition beside it is doing most of the work.

**The five buttons sit below the level, never over it.** A finger on the level would be a finger on
the ball. The readouts move below the buttons — they are still not the player's, so they take
whatever is left rather than a place chosen for them.

**Each group keeps its own corner**, so a thumb never crosses the other group's buttons to reach its
own:

| | | |
|---|---|---|
| **up** | **launch** | ← one button, across both |
| **down** | **left** | **right** |

The vertical group runs down the left, the horizontal group along the bottom, and launch fills what
is left above them — the largest target of the five, because it is the one pressed under no time
pressure and the one a player new to the game looks for first.

**No other chrome.** The one screen, and the one activity, are the same in both modes — a mode is how
the level's steps are reached, not a second surface.
