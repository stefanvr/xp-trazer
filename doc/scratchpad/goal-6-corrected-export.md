# Goal 6 — re-import from the corrected export

Kind: **repair**. Matched against `doc/spec-tech.md`'s **A-3** — the rooms are converted once and
committed, from an export that stays outside the tree — and `src/import/convert.ts`'s own claim that
`OBJECT_KINDS`' footprints are "the original's geometry rather than a decision made here". Nothing in
`doc/spec-domain.md` or `doc/spec-domain-porting-todo.md` names a footprint size or which export a
kind's label comes from, so correcting both is making the code match what it already claims to be
sourced from, not a new decision.

## What the new export actually corrects

Measured directly against `TRAZ_pass2_updated_importable/traz_rooms_all.json` and its `ELEMENTS.md`,
against what is committed today:

| Kind | Committed today | The real export | Consequence |
|---|---|---|---|
| `bumper` (141 instances, footprint 3×3) | Labelled `bumper` | Is **Glass refractor** | Stands as a permanent brick today (P-5); should be dropped (P-2) — the ball is currently blocked by walls 42 rooms' worth of glass that should not be there at all |
| `monsterGenerator` (375 instances, footprint 2×2) | Labelled `monsterGenerator` | Is **Bumper** | No visible effect — both concede to `permanent` (P-4, P-5) — but the carried kind is wrong |
| Real `Monster generator` | 0 instances (matches the export — it places none) | 0 instances, footprint documented as 4×3 | Nothing to fix in the rooms; `OBJECT_KINDS`' own footprint entry is still wrong and feeds `dev/elements.ts`'s demo panel |

So the previous export's decode swapped two labels wholesale — this is not a border case, it is 141
walls that should not exist. Room 29 is confirmed still the sole `DS-4.4` conflict in the new export
(checked directly against `traz_rooms_all.json`, ahead of writing any code), which is what makes it
safe to assume the room numbering itself did not move under the correction.

## What is left

| Task | What makes it checkable |
|---|---|
| Nothing | — |

## Kept for the landing to read

All seven tasks are done: `convert.ts` and `import-rooms.ts` parse the new export's shape; the
footprint table matches `ELEMENTS.md` (glass 3×3, bumper 2×2, monster generator 4×3 — unplaced);
`rooms.generated.ts` and the `room-24` fixture are regenerated from `traz_rooms_all.json`;
`convert.test.ts` and `porting.test.ts` were updated for the new field names and for the corrected
export placing no monster generator anywhere (asserted over a level built for the purpose instead).
`npm run check`, `npm run test` (182 passing) and `npm run test:e2e` (16 passing) are all clean.

**The counts held.** Room 29 is still the sole `DS-4.4` conflict — checked directly against the raw
export before writing any code, and again by the suite after — so 63 of 64 rooms are still playable
and `doc/spec-domain-porting-todo.md`'s quoted counts needed no edit.

**Checked visually.** `dev/levels.html` (goal 5) draws room 0 — which the corrected data gives a
glass refractor — and the two permanent-brick blocks that used to flank its anchor brick are gone,
replaced by empty space. That is `P-2` working on data that is actually glass now, rather than on
data mislabelled as something else.

**The mutation proof.** `OBJECT_KINDS`' glass and bumper footprints were set back to their previous,
wrong values (4×3 and 3×3) and the rooms regenerated from them. The suite caught it hard: 30 rooms
newly failed `DS-4.4` (their now-larger footprints overlapping a neighbour), where before only room
29 did. Reverted, rooms regenerated again from the correct table, and the unmutated suite passed
clean — 182 unit, 16 end-to-end.
