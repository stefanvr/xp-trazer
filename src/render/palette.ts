/**
 * The one place a value doc/spec-style.md decides lives — its colors, and now the type it names for
 * the one word version one puts on a level. That document owns what these values are; this module is
 * the only thing allowed to spell one out, so the real renderer and spec-style's demonstration page
 * (the `style` skill) draw from the same source rather than two copies that can drift apart.
 */

export const BACKGROUND = '#05080d';
export const BOUNDARY = '#123a4d';
export const BALL = '#f5fbff';
export const DESTRUCTIBLE_BRICK = '#33ff99';
export const PERMANENT_BRICK = '#ff8a3d';
export const HORIZONTAL_BAT = '#22e0e0';
export const VERTICAL_BAT = '#ff2fd6';

export const GLOW_PIXELS = 18;

/**
 * The word a cleared level shows. Deliberately the same value as `DESTRUCTIBLE_BRICK`: spec-style's
 * reason is that this is the hue that meant *the objective*, free exactly when the objective is
 * complete. Named separately because it is a separate decision, and one that could later differ.
 */
export const CLEARED_TEXT = DESTRUCTIBLE_BRICK;

/** spec-style: the word, uppercase. One and a half cells tall, a quarter of that between letters. */
export const CLEARED_WORD = 'CLEARED';
export const CLEARED_TEXT_CELLS = 1.5;
export const CLEARED_TRACKING = 0.25;
export const CLEARED_FACE =
  'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
