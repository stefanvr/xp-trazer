import { createGameState, isCleared, step, type Event, type GameState, type Input } from './simulation';
import type { Level } from './level';

/**
 * A run — doc/spec-domain.md's **Run**. Carries a player's lives and score across levels; a level's
 * own game state (./simulation) is replaced whole each time one starts, and this is what survives
 * that replacement. Pure functions over plain types, importing nothing outside the domain —
 * guide-design.md.
 *
 * **DS-9** is what this module implements, cited where it applies.
 */

/** DS-9.2 — a run starts with five lives. */
export const STARTING_LIVES = 5;

export type Run = {
  readonly game: GameState;
  readonly lives: number;
  readonly score: number;
};

/**
 * **DS-9.5** — over the moment lives reach zero. Derived rather than stored, the same reason
 * `isCleared` is asked of what is destroyed rather than kept beside it: a state that held the answer
 * as well as the fact it follows from could hold a wrong one.
 */
export function isGameOver(run: Run): boolean {
  return run.lives <= 0;
}

/**
 * "Run started" — doc/spec-domain.md's *What happens*: five lives, no score, and a level starts.
 * Used both for a run's first level and for restarting one that is over; **DS-9.2** does not
 * distinguish the two.
 */
export function createRun(level: Level, seed: number): Run {
  return { game: createGameState(level, seed), lives: STARTING_LIVES, score: 0 };
}

/**
 * "Level started", caused by the player continuing a run whose level was just cleared — **DS-9.1**:
 * lives and score carry over untouched, and only the level itself is replaced.
 */
export function continueRun(run: Run, level: Level, seed: number): Run {
  return { ...run, game: createGameState(level, seed) };
}

/** What a step left the run: the run after it, and the events that happened during it. */
export type SteppedRun = { readonly run: Run; readonly events: readonly Event[] };

/**
 * Advances a run by one step, over and above what `step` advances a level by.
 *
 * **DS-9.6** — a run that is over does not advance its level any further, asked first for the same
 * reason `step` asks **DS-5.2** first: a game-over run offered input is a no-op, rather than a level
 * that quietly keeps playing underneath its own end.
 */
export function stepRun(run: Run, input: Input): SteppedRun {
  if (isGameOver(run)) return { run, events: [] };

  const wasCleared = isCleared(run.game);
  const { state, events } = step(run.game, input);

  // DS-9.3 — a ball destroyed spends one of the run's lives.
  const ballDestroyed = events.some((event) => event.kind === 'ball-destroyed');
  const lives = ballDestroyed ? run.lives - 1 : run.lives;

  // DS-9.4 — a level cleared adds a point, counted once: the step where clearing first becomes true.
  const nowCleared = isCleared(state);
  const score = !wasCleared && nowCleared ? run.score + 1 : run.score;

  return { run: { game: state, lives, score }, events };
}
