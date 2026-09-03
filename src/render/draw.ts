import type { World } from '../domain/simulation';

/**
 * The renderer. It reads the world and draws it, and decides nothing — replacing this should mean
 * replacing a draw function, not rewriting the interaction (guide-design.md).
 */

const BACKGROUND = '#04070d';
const LINE = '#31e3ff';
const GLOW_PIXELS = 18;

export function draw(context: CanvasRenderingContext2D, world: World): void {
  const { width, height } = world.box;

  context.fillStyle = BACKGROUND;
  context.fillRect(0, 0, width, height);

  context.save();
  context.shadowColor = LINE;
  context.shadowBlur = GLOW_PIXELS;
  context.strokeStyle = LINE;
  context.fillStyle = LINE;

  context.lineWidth = 2;
  context.strokeRect(1, 1, width - 2, height - 2);

  context.beginPath();
  context.arc(world.position.x, world.position.y, world.radius, 0, Math.PI * 2);
  context.fill();

  context.restore();
}
