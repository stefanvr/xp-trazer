import { describe, expect, it } from 'vitest';
import { continueRun, createRun, isGameOver, stepRun, STARTING_LIVES, type Run } from './run';
import { levelFrom, ONE_CELL, type Level } from './level';
import { gameOverProofLevel } from '../levels/game-over-proof';
import type { Input } from './simulation';

/** Tests are named as the behaviour claimed, not as the function under test — guide-design.md. */

const NOTHING_HELD: Input = { left: false, right: false, up: false, down: false, launch: false };
const LAUNCH: Input = { ...NOTHING_HELD, launch: true };

// Built for exactly this: the ball starts in the trap's own cell, so every launch destroys it.
const DESTROYS_THE_BALL: Level = gameOverProofLevel();

/** The same trick, aimed at the level's one destructible brick — clearing it is what the level does. */
const CLEARS_IN_ONE_STEP: Level = levelFrom({
  columns: 5,
  rows: 5,
  elements: [{ kind: 'destructible', column: 2, row: 2, footprint: ONE_CELL, colorId: undefined }],
  bats: [{ orientation: 'horizontal', line: 4, position: 0 }],
  ballStart: { column: 2, row: 2 },
});

/**
 * Launches, then steps until the ball is held again. A trap sends it back in the step after it
 * destroys it — DS-8.2 — so this is only ever used against a level built to destroy the ball, never
 * against one built to be cleared: a cleared level's ball never returns held.
 */
function launchAndSettle(run: Run): Run {
  let next = stepRun(run, LAUNCH).run;
  for (let i = 0; i < 5 && !next.game.ball.held; i += 1) next = stepRun(next, NOTHING_HELD).run;
  return next;
}

/** Launches, then takes the one step that meets the level's one destructible brick. */
function launchAndClear(run: Run): Run {
  return stepRun(stepRun(run, LAUNCH).run, NOTHING_HELD).run;
}

describe('a run', () => {
  it('starts with five lives and no score', () => {
    const run = createRun(DESTROYS_THE_BALL, 0);

    expect(run.lives).toBe(STARTING_LIVES);
    expect(run.score).toBe(0);
    expect(isGameOver(run)).toBe(false);
  });

  it('spends one life when the ball is destroyed', () => {
    const run = createRun(DESTROYS_THE_BALL, 0);

    expect(launchAndSettle(run).lives).toBe(STARTING_LIVES - 1);
  });

  it('is over once the fifth life is spent, and not before the fourth', () => {
    let run = createRun(DESTROYS_THE_BALL, 0);
    for (let i = 0; i < STARTING_LIVES - 1; i += 1) {
      run = launchAndSettle(run);
      expect(isGameOver(run)).toBe(false);
    }

    run = launchAndSettle(run);

    expect(run.lives).toBe(0);
    expect(isGameOver(run)).toBe(true);
  });

  it('does not advance a game-over run any further', () => {
    let run = createRun(DESTROYS_THE_BALL, 0);
    for (let i = 0; i < STARTING_LIVES; i += 1) run = launchAndSettle(run);
    expect(isGameOver(run)).toBe(true);

    const stepped = stepRun(run, LAUNCH);

    expect(stepped.run).toBe(run);
    expect(stepped.events).toEqual([]);
  });

  it('adds one point when a level clears, and no more while it stays cleared', () => {
    const run = createRun(CLEARS_IN_ONE_STEP, 0);

    const cleared = launchAndClear(run);
    expect(cleared.score).toBe(1);

    const stillCleared = stepRun(cleared, LAUNCH).run;
    expect(stillCleared.score).toBe(1);
  });

  it('carries lives and score into the next level, on continuing after a clear', () => {
    const clearedRun = launchAndClear(createRun(CLEARS_IN_ONE_STEP, 0));

    const continued = continueRun(clearedRun, DESTROYS_THE_BALL, 1);

    expect(continued.lives).toBe(clearedRun.lives);
    expect(continued.score).toBe(clearedRun.score);
    expect(continued.game.level).toBe(DESTROYS_THE_BALL);
    expect(continued.game.ball.held).toBe(true);
  });

  it('resets to five lives and no score on a fresh run, even after one that was lost', () => {
    let run = createRun(DESTROYS_THE_BALL, 0);
    for (let i = 0; i < STARTING_LIVES; i += 1) run = launchAndSettle(run);
    expect(isGameOver(run)).toBe(true);

    const fresh = createRun(DESTROYS_THE_BALL, 1);

    expect(fresh.lives).toBe(STARTING_LIVES);
    expect(fresh.score).toBe(0);
    expect(isGameOver(fresh)).toBe(false);
  });
});
