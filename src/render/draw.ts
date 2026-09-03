import type { World } from '../domain/simulation';
import { BACKGROUND, BALL, BOUNDARY, GLOW_PIXELS } from './palette';

/**
 * The renderer. It reads the world and draws it, and decides nothing — replacing this should mean
 * replacing a draw function, not rewriting the interaction (guide-design.md).
 *
 * Colors come from ./palette, doc/spec-style.md's one place in code — not repeated here.
 */

export function draw(context: CanvasRenderingContext2D, world: World): void {
  const { width, height } = world.box;

  context.fillStyle = BACKGROUND;
  context.fillRect(0, 0, width, height);

  context.save();
  context.shadowBlur = GLOW_PIXELS;

  context.shadowColor = BOUNDARY;
  context.strokeStyle = BOUNDARY;
  context.lineWidth = 2;
  context.strokeRect(1, 1, width - 2, height - 2);

  context.shadowColor = BALL;
  context.fillStyle = BALL;
  context.beginPath();
  context.arc(world.position.x, world.position.y, world.radius, 0, Math.PI * 2);
  context.fill();

  context.restore();
}
