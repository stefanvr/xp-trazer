import { describe, expect, it } from 'vitest';
import { FIRST_LEVEL } from './first';
import { createGameState } from '../domain/simulation';
import { destructibleCount, levelFromRows } from '../domain/level';

/** Tests are named as the behaviour claimed, not as the function under test — guide-design.md. */

/**
 * The authored level is data, and data can break a rule as easily as code can. Every rule a level
 * must satisfy is checked by `createGameState`, so starting one is the whole test — DS-1.3, DS-1.6
 * and DS-1.7 each refuse there.
 */
describe('the level version one ships', () => {
  it('satisfies every rule a level has to satisfy', () => {
    expect(() => createGameState(levelFromRows(FIRST_LEVEL), 0)).not.toThrow();
  });

  it('has something to clear, or clearing it would mean nothing', () => {
    expect(destructibleCount(levelFromRows(FIRST_LEVEL))).toBeGreaterThan(0);
  });
});
