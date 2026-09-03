import { createWorld } from '../src/domain/simulation';
import { draw } from '../src/render/draw';
import {
  BACKGROUND,
  GLOW_PIXELS,
  HORIZONTAL_BAT,
  PERMANENT_BRICK,
  DESTRUCTIBLE_BRICK,
  VERTICAL_BAT,
} from '../src/render/palette';

/**
 * The `style` skill's page: one panel per row in doc/spec-style.md's palette table.
 *
 * The level background, boundary and ball already have a domain type and a real draw function, so
 * they are drawn by calling it. A brick or a bat has no domain type yet — spec-domain.md does not
 * own them — so those panels paint the shape and color the spec describes directly, and say so.
 * Inventing a domain type here to avoid saying so would be a product decision smuggled into a
 * demonstration page (build skill's "a proof contains no product decisions").
 */

type Swatch = {
  readonly name: string;
  readonly role: string;
  readonly note?: string;
  readonly paint: (context: CanvasRenderingContext2D, width: number, height: number) => void;
};

function withGlow(
  context: CanvasRenderingContext2D,
  color: string,
  paint: (context: CanvasRenderingContext2D) => void,
): void {
  context.save();
  context.shadowColor = color;
  context.shadowBlur = GLOW_PIXELS;
  context.fillStyle = color;
  paint(context);
  context.restore();
}

function fillBackground(context: CanvasRenderingContext2D, width: number, height: number): void {
  context.fillStyle = BACKGROUND;
  context.fillRect(0, 0, width, height);
}

function centeredRect(width: number, height: number, rectWidth: number, rectHeight: number) {
  return {
    x: (width - rectWidth) / 2,
    y: (height - rectHeight) / 2,
    w: rectWidth,
    h: rectHeight,
  };
}

const swatches: readonly Swatch[] = [
  {
    name: 'Level background',
    role: 'The void everything else sits on',
    paint: fillBackground,
  },
  {
    name: 'Boundary & ball',
    role: 'Drawn by the real renderer (src/render/draw.ts) against a live World',
    paint: (context, width, height) => draw(context, createWorld({ width, height })),
  },
  {
    name: 'Destructible brick',
    role: 'The objective — what clearing removes',
    note: 'Shape only — spec-domain.md does not own a brick type yet',
    paint: (context, width, height) => {
      fillBackground(context, width, height);
      const rect = centeredRect(width, height, 96, 26);
      withGlow(context, DESTRUCTIBLE_BRICK, (c) => c.fillRect(rect.x, rect.y, rect.w, rect.h));
    },
  },
  {
    name: 'Permanent brick',
    role: 'Structure, not a target',
    note: 'Shape only — spec-domain.md does not own a brick type yet',
    paint: (context, width, height) => {
      fillBackground(context, width, height);
      const rect = centeredRect(width, height, 96, 26);
      withGlow(context, PERMANENT_BRICK, (c) => c.fillRect(rect.x, rect.y, rect.w, rect.h));
    },
  },
  {
    name: 'Horizontal bats',
    role: 'One control group',
    note: 'Shape only — spec-domain.md does not own a bat type yet',
    paint: (context, width, height) => {
      fillBackground(context, width, height);
      const rect = centeredRect(width, height, 110, 14);
      withGlow(context, HORIZONTAL_BAT, (c) => c.fillRect(rect.x, rect.y, rect.w, rect.h));
    },
  },
  {
    name: 'Vertical bats',
    role: 'The other control group',
    note: 'Shape only — spec-domain.md does not own a bat type yet',
    paint: (context, width, height) => {
      fillBackground(context, width, height);
      const rect = centeredRect(width, height, 14, 110);
      withGlow(context, VERTICAL_BAT, (c) => c.fillRect(rect.x, rect.y, rect.w, rect.h));
    },
  },
];

const PANEL_WIDTH = 220;
const PANEL_HEIGHT = 150;

function required<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) throw new Error(`the document is missing ${selector}`);
  return element;
}

const gallery = required('#gallery');

for (const swatch of swatches) {
  const canvas = document.createElement('canvas');
  canvas.width = PANEL_WIDTH;
  canvas.height = PANEL_HEIGHT;

  const context = canvas.getContext('2d');
  if (!context) throw new Error('this browser has no 2d canvas context');
  swatch.paint(context, PANEL_WIDTH, PANEL_HEIGHT);

  const figure = document.createElement('figure');
  figure.append(canvas);

  const caption = document.createElement('figcaption');
  const name = document.createElement('span');
  name.className = 'name';
  name.textContent = swatch.name;
  const role = document.createElement('span');
  role.className = 'role';
  role.textContent = swatch.role;
  caption.append(name, role);

  if (swatch.note) {
    const note = document.createElement('span');
    note.className = 'note';
    note.textContent = swatch.note;
    caption.append(note);
  }

  figure.append(caption);
  gallery.append(figure);
}
