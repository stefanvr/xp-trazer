/**
 * The one place a color lives. doc/spec-style.md owns what these values are; this module is the
 * only thing allowed to spell one out, so the real renderer and doc/spec-style.md's demonstration
 * page (the `style` skill) draw from the same source rather than two copies that can drift apart.
 */

export const BACKGROUND = '#05080d';
export const BOUNDARY = '#123a4d';
export const BALL = '#f5fbff';
export const REMOVABLE_BRICK = '#33ff99';
export const PERMANENT_BRICK = '#ff8a3d';
export const HORIZONTAL_BAT = '#22e0e0';
export const VERTICAL_BAT = '#ff2fd6';

export const GLOW_PIXELS = 18;
