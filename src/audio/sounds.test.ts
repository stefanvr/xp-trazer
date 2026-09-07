import { describe, expect, it } from 'vitest';
import { COLLISION, DESTRUCTION, TRAP, soundFor } from './sounds';
import type { Event } from '../domain/simulation';

/** Tests are named as the behaviour claimed, not as the function under test — guide-design.md. */

const collision = (met: 'boundary' | 'bat' | 'brick', destroyed: boolean): Event => ({
  kind: 'collision',
  met,
  destroyed,
});
const destruction: Event = { kind: 'element-destroyed', cells: [{ column: 2, row: 2 }] };

describe('what an event sounds like', () => {
  it('gives a boundary the collision sound', () => {
    expect(soundFor(collision('boundary', false))).toBe('collision');
  });

  it('gives a bat the collision sound', () => {
    expect(soundFor(collision('bat', false))).toBe('collision');
  });

  it('gives a permanent brick the collision sound, because a wall is what it is', () => {
    expect(soundFor(collision('brick', false))).toBe('collision');
  });

  it('gives a destroyed element the destruction sound', () => {
    expect(soundFor(destruction)).toBe('destruction');
  });

  it('gives the ball destroyed the trap sound', () => {
    expect(soundFor({ kind: 'ball-destroyed' })).toBe('trap');
  });

  it('says nothing for a collision that destroyed what it met', () => {
    // spec-style: its destruction is what is heard, so the two do not land on the same 60ms.
    expect(soundFor(collision('brick', true))).toBeUndefined();
  });

  it('makes one noise, not two, out of a brick being destroyed', () => {
    // The pair DS-6.6 announces, in the order a step yields them.
    const announced: readonly Event[] = [collision('brick', true), destruction];

    const heard = announced.map(soundFor).filter((sound) => sound !== undefined);

    expect(heard).toEqual(['destruction']);
  });
});

describe('the collision and destruction sounds', () => {
  it('are each two segments, so neither is longer than a tenth of a second', () => {
    for (const sound of [COLLISION, DESTRUCTION]) {
      const total = sound.reduce((sum, segment) => sum + segment.milliseconds, 0);
      expect(total).toBeLessThan(100);
    }
  });

  it('keeps the collision pitched throughout, which is what the ear tells them apart by', () => {
    expect(COLLISION.every((segment) => segment.sweep !== undefined)).toBe(true);
  });

  it('ends the destruction in noise with no pitch at all', () => {
    const last = DESTRUCTION[DESTRUCTION.length - 1];

    expect(last?.wave.kind).toBe('noise');
    expect(last?.sweep).toBeUndefined();
  });
});

describe('the trap sound', () => {
  it('runs longer than a tenth of a second, unlike the other two', () => {
    // spec-style: the tenth-of-a-second rule is about an event that can repeat several times a
    // second, and losing the ball to a trap does not — so this is the recovered length, not a bug.
    const total = TRAP.reduce((sum, segment) => sum + segment.milliseconds, 0);
    expect(total).toBe(175);
  });

  it('opens on noise and closes on a falling sawtooth, the reverse of the destruction', () => {
    expect(TRAP[0]?.wave.kind).toBe('noise');
    expect(TRAP[1]?.wave.kind).toBe('sawtooth');
    expect(TRAP[1]?.sweep).toEqual({ from: 1800, to: 180 });
  });
});
