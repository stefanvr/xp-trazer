# Goal 6 — re-import from the corrected export

Kind: **repair**. Matched against `doc/spec-tech.md`'s **A-3** — the rooms are converted once and
committed, from an export that stays outside the tree — and against `src/levels/rooms.generated.ts`
as the owner has settled it. Nothing in `doc/spec-domain.md` or `doc/spec-domain-porting-todo.md`
names a footprint size or says which layer of the export carries which kind, so writing both down at
the border is making the code match what it already claims to be sourced from.

## Which object is which, and why no name is trusted

The same two layers have been named four different ways, three of them in writing:

| Objects | Pass-1 export | Pass-2 `ELEMENTS.md` and the JSON | `room-legenda.txt` | **In force** |
|---|---|---|---|---|
| 141, 3×3, 42 rooms — layer 7, `$5A–$62` | Bumper | Glass refractor | Bumper | **Monster generator** |
| 375, 2×2, 28 rooms — layer 4, `$52–$55` | Monster generator | Bumper | Glass refractor | **Glass refractor** |
| 0 placements, 12 chars — layer 3, `$46–$51` | Monster generator | Monster generator (provisional) | Monster generator | **Bumper** |

**The right-hand column is the owner's, from the original itself, and it is what the tree holds.**
The export's own names are not read at all — which is why the converter is keyed on the raw `layer`,
the field the export preserves for exactly this reason (`README.md`: *raw layer and character
information is preserved so a later semantic refinement does not invalidate the room data*).

**The shapes are not in dispute anywhere.** A layer's footprint follows from its char range — nine
characters is 3×3, four is 2×2, twelve is 3×4 — and all four namings agree on them cell for cell.
Only which name goes with which layer ever moved.

**What it changes about play.** The 375 two-by-two objects are now the glass refractor, so **P-2**
leaves them out of the played level; the 141 three-by-three objects are now the monster generator, so
**P-4** stands each one up as a permanent brick where it stood. That is the reverse of what the
previous commit on this branch did, and it moves what the ball meets in 42 rooms and in 28.

## What is left

| Task | What makes it checkable |
|---|---|
| Nothing | — |

## Kept for the landing to read

**The rooms were reproduced, not replaced.** Running `scripts/import-rooms.ts` against
`traz_rooms_all.json` with the layer-keyed table left `src/levels/rooms.generated.ts` and the room-24
fixture byte-for-byte as the owner's own correction had them. That is what says the table and the
committed rooms mean the same thing, and it is a stronger check than any assertion written for it.

**The counts held, and no document needed correcting for them.** Still 63 of the 64 rooms playable,
still room 29 as the sole **DS-4.4** conflict — even though which objects are dropped and which stand
as permanent bricks is now the reverse of what it was. `doc/spec-domain-porting-todo.md` gained one
paragraph, saying that **P-5** is conceded for nothing because the original places no bumper.

**The mutation proof turned up a real hole, and it is the finding worth keeping.** Layers 4 and 7
were swapped in `OBJECT_KINDS` and the rooms regenerated from it — and **the entire suite passed**,
185 tests, because every assertion about the rooms compared them against the table that generated
them. A table that is wrong about a name produces rooms that agree with it perfectly. The counts in
`src/levels/rooms.test.ts` are the answer: they come from the original rather than from the export,
so they are the one thing a renamed layer moves. Re-running the same mutation now fails there, and
only there. Reverted, regenerated, and the unmutated suite clean at 186 unit and 23 end-to-end.

**Where the naming decision lives.** In `src/import/convert.ts`'s comment on `OBJECT_KINDS`, and in
the counts that test asserts. Nothing in `doc/` owns it: it is a fact about the border, and the
border is that module's. This file's table of four namings is the fullest record of how it was
reached, and it goes when the scratchpad is cleared — which is right, because the history keeps it.
