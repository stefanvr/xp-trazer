/**
 * Turning one decoded room of the original into a level of this project's own.
 *
 * **This module is the only thing that knows the original's shape.** Everything downstream of it
 * speaks doc/spec-domain.md's words, which is what *nothing is renamed in transit* costs at a border
 * — the translation happens once, here, and is tested against a record of the export.
 *
 * **It converts; it does not judge.** A room that cannot be played under today's rules converts
 * exactly like one that can, and `unplayableReasons` in the domain is what answers the difference.
 * Importing only what the current rules support would make this file a second place where those
 * rules are decided.
 *
 * The export itself is not in this tree. What is committed beside the converter is one room's
 * record, as the fixture the suite asserts a converted room against; the generator that reads the
 * whole export is `scripts/import-rooms.ts`.
 */

import { element, bat, type ImportedRoom } from '../levels/room-notation.ts';
import type { ColorId, ElementKind, Footprint } from '../domain/level';

/** The C64 screen the original's rooms are laid out on, in character cells. */
export const ROOM_COLUMNS = 40;
export const ROOM_ROWS = 25;

/**
 * One object of the export, as the decode wrote it down.
 *
 * **An object is identified by its raw `layer`, and never by the name written beside it.**
 * `OBJECT_KINDS` says why. `element_name` is carried for the error message alone, so that a layer
 * this module has no kind for can be reported as the export described it — nothing reads it to
 * decide what an object is.
 *
 * Every field the export also carries and this type does not — `element_id`,
 * `semantic_confidence`, `color`, `screen_address`, `footprint_cells`, `char_codes` — is read by
 * nobody here. `footprint_cells` in particular is not trusted over `OBJECT_KINDS`: the shape a kind
 * occupies is this module's own table, asserted against the export rather than read from it, so a
 * decode that gets one room's footprint wrong is a fixture failure and not a silent difference
 * between rooms.
 */
export type SourceObject = {
  readonly layer: number;
  readonly element_name: string;
  readonly color_index: number;
  readonly row: number;
  readonly col: number;
};

export type SourceBat = {
  readonly x_col: number;
  readonly y_row: number;
  readonly orientation: string;
};

export type SourceRoom = {
  readonly room_index: number;
  readonly objects: readonly SourceObject[];
  readonly bats: readonly SourceBat[];
  readonly ball_start: { readonly x_col: number; readonly y_row: number } | null;
  readonly colors: { readonly background: { readonly index: number } };
};

/**
 * Every object kind the original has, what this project calls it, and the cells it occupies.
 *
 * The two bricks and the solid block are the three the rules read; the other five are **DS-7.1**'s,
 * carried and given no behaviour. **Every one of them is larger than one cell**, which is the
 * original's geometry rather than a decision made here — **DS-7.2** is what carries that. A
 * destructible brick is the only kind with two shapes; the solid block is horizontal alone.
 *
 * **Exported because it is the one place these shapes are written down**, and a second reader —
 * `dev/elements.ts`'s test bed — shows them rather than holding a copy that could drift. It stays
 * this module's knowledge: the domain models a footprint and never learns what the original's
 * inventory is.
 *
 * **Keyed on the export's raw layer, because its names have been wrong three times.** Two decodes
 * and a supplied legend name layers 3, 4 and 7 three different ways, and none of the three matches
 * the original: layer 7 is the monster generator, layer 4 the glass refractor, and layer 3 the
 * bumper, which the stock 64 rooms place nowhere at all. A layer is the field the export promises
 * to keep still — *raw layer and character information is preserved so a later semantic refinement
 * does not invalidate the room data* — and a name is the field it has already moved twice, so the
 * label below is this project's own and nothing here reads the export's.
 *
 * **A shape follows from the layer's character range, and no decode has ever disagreed about one.**
 * Nine characters (`$5A–$62`) occupy 3×3, four (`$52–$55`) occupy 2×2, twelve (`$46–$51`) occupy
 * 3×4. Only which name went with which layer ever moved, which is why getting the names from
 * elsewhere costs nothing here: the geometry was never in question.
 */
export const OBJECT_KINDS = new Map<
  number,
  { readonly label: string; readonly kind: ElementKind; readonly footprint: Footprint }
>([
  [0, { label: 'Horizontal brick', kind: 'destructible', footprint: { columns: 2, rows: 1 } }],
  [1, { label: 'Vertical brick', kind: 'destructible', footprint: { columns: 1, rows: 2 } }],
  [2, { label: 'Dimpled solid block', kind: 'permanent', footprint: { columns: 2, rows: 1 } }],
  [3, { label: 'Bumper', kind: 'bumper', footprint: { columns: 3, rows: 4 } }],
  [4, { label: 'Glass refractor', kind: 'glassRefractor', footprint: { columns: 2, rows: 2 } }],
  [5, { label: 'Horizontal trap', kind: 'horizontalTrap', footprint: { columns: 2, rows: 1 } }],
  [6, { label: 'Vertical trap', kind: 'verticalTrap', footprint: { columns: 1, rows: 2 } }],
  [7, { label: 'Monster generator', kind: 'monsterGenerator', footprint: { columns: 3, rows: 3 } }],
]);

/**
 * The level's own color id — **DS-7.3**.
 *
 * The export gives a room three colors: a shared multicolor, a background color and a border color.
 * The domain carries one, and says which: the level's id is its background, and the other two are
 * dropped.
 */
function levelColorId(room: SourceRoom): ColorId {
  return room.colors.background.index;
}

export function convertRoom(room: SourceRoom): ImportedRoom {
  const elements = room.objects.map((object) => {
    const known = OBJECT_KINDS.get(object.layer);
    if (known === undefined) {
      throw new Error(
        `room ${room.room_index} places an object the import has no kind for: ` +
          `layer ${object.layer}, which the export calls ${object.element_name}`,
      );
    }
    return element(
      known.kind,
      object.col,
      object.row,
      known.footprint.columns,
      known.footprint.rows,
      object.color_index,
    );
  });

  const bats = room.bats.map((source) => {
    if (source.orientation !== 'horizontal' && source.orientation !== 'vertical') {
      throw new Error(
        `room ${room.room_index} places a bat lying along no axis: ${source.orientation}`,
      );
    }
    return bat(source.orientation, source.x_col, source.y_row);
  });

  return {
    origin: { room: room.room_index },
    columns: ROOM_COLUMNS,
    rows: ROOM_ROWS,
    colorId: levelColorId(room),
    ballStart:
      room.ball_start === null
        ? undefined
        : { column: room.ball_start.x_col, row: room.ball_start.y_row },
    bats,
    elements,
  };
}
