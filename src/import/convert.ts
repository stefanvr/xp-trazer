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

/** One object of the export, as the decode wrote it down. */
export type SourceObject = {
  readonly type: string;
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
  readonly room: number;
  readonly objects: readonly SourceObject[];
  readonly bats: readonly SourceBat[];
  readonly ball_start: { readonly x_col: number; readonly y_row: number } | null;
  readonly background_color: number;
};

/**
 * Every object kind the original has, what this project calls it, and the cells it occupies.
 *
 * The two bricks and the solid block are the three the rules read; the other five are **DS-7.1**'s,
 * carried and given no behaviour. **Every one of them is larger than one cell**, which is the
 * original's geometry rather than a decision made here — **DS-7.2** is what carries that.
 */
const KINDS = new Map<string, { readonly kind: ElementKind; readonly footprint: Footprint }>([
  ['Horizontal brick', { kind: 'destructible', footprint: { columns: 2, rows: 1 } }],
  ['Vertical brick', { kind: 'destructible', footprint: { columns: 1, rows: 2 } }],
  ['Dimpled solid block', { kind: 'permanent', footprint: { columns: 2, rows: 1 } }],
  ['Glass refractor', { kind: 'glassRefractor', footprint: { columns: 4, rows: 3 } }],
  ['Monster generator', { kind: 'monsterGenerator', footprint: { columns: 2, rows: 2 } }],
  ['Horizontal trap', { kind: 'horizontalTrap', footprint: { columns: 2, rows: 1 } }],
  ['Vertical trap', { kind: 'verticalTrap', footprint: { columns: 1, rows: 2 } }],
  ['Bumper', { kind: 'bumper', footprint: { columns: 3, rows: 3 } }],
]);

/**
 * The level's own color id — **DS-7.3**.
 *
 * The export gives a room three colors: a shared multicolor, a background color and a border color.
 * The domain carries one, so this takes the background color and the other two do not survive. That
 * is a narrowing, and it is written down here rather than left to be noticed.
 */
function levelColorId(room: SourceRoom): ColorId {
  return room.background_color;
}

export function convertRoom(room: SourceRoom): ImportedRoom {
  const elements = room.objects.map((object) => {
    const known = KINDS.get(object.type);
    if (known === undefined) {
      throw new Error(`room ${room.room} places an object the import has no kind for: ${object.type}`);
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
      throw new Error(`room ${room.room} places a bat lying along no axis: ${source.orientation}`);
    }
    return bat(source.orientation, source.x_col, source.y_row);
  });

  return {
    origin: { room: room.room },
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
