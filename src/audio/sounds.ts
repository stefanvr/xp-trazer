import type { Event } from '../domain/simulation';

/**
 * The one place a sound doc/spec-style.md decides lives — the two sounds' values, and which event
 * makes which. The same job `../render/palette.ts` does for the colors, and for the same reason:
 * that document owns what these are, and one copy here is what stops a second one drifting.
 *
 * **Pure, and knows nothing about Web Audio.** Everything here is data and one function over it, so
 * spec-style's rules are asserted with no browser and no sound — `./play.ts` is the part that has to
 * make a noise.
 */

export type Wave =
  | { readonly kind: 'triangle' }
  | { readonly kind: 'pulse'; readonly duty: number }
  | { readonly kind: 'noise' };

/** A sweep from one frequency to another across the segment. Noise has no pitch, so it has none. */
export type Sweep = { readonly from: number; readonly to: number };

/**
 * One segment of a sound. Attack, decay and release are milliseconds; sustain is a level from 0 to
 * 1 — doc/spec-style.md's table, in its own terms.
 */
export type Segment = {
  readonly wave: Wave;
  readonly milliseconds: number;
  readonly sweep: Sweep | undefined;
  readonly gain: number;
  readonly attack: number;
  readonly decay: number;
  readonly sustain: number;
  readonly release: number;
  readonly lowPass: number;
};

/** A sound is its segments, played one after the other — doc/spec-style.md. */
export type Sound = readonly Segment[];

/**
 * **A collision is pitched and a destruction is not**, which spec-style says is what separates them
 * at speed. The triangle below carries a note; the destruction ends in filtered noise with none.
 */
export const COLLISION: Sound = [
  {
    wave: { kind: 'triangle' },
    milliseconds: 45,
    sweep: { from: 510, to: 330 },
    gain: 0.52,
    attack: 1,
    decay: 10,
    sustain: 0.45,
    release: 25,
    lowPass: 7000,
  },
  {
    wave: { kind: 'pulse', duty: 0.3 },
    milliseconds: 28,
    sweep: { from: 1050, to: 730 },
    gain: 0.22,
    attack: 0,
    decay: 6,
    sustain: 0.3,
    release: 20,
    lowPass: 8000,
  },
];

export const DESTRUCTION: Sound = [
  {
    wave: { kind: 'pulse', duty: 0.25 },
    milliseconds: 42,
    sweep: { from: 820, to: 480 },
    gain: 0.43,
    attack: 0,
    decay: 8,
    sustain: 0.35,
    release: 24,
    lowPass: 5600,
  },
  {
    wave: { kind: 'noise' },
    milliseconds: 20,
    sweep: undefined,
    gain: 0.13,
    attack: 0,
    decay: 4,
    sustain: 0.25,
    release: 14,
    lowPass: 4200,
  },
];

export const SOUNDS = { collision: COLLISION, destruction: DESTRUCTION } as const;

export type SoundName = keyof typeof SOUNDS;

/**
 * What an event sounds like, or nothing — doc/spec-style.md's table.
 *
 * **A collision that destroyed what it met is silent, because its destruction is what is heard.**
 * The ball meeting a destructible brick announces both events (**DS-6.6**), and without this they
 * would land on the same sixty milliseconds and smear into each other. **DS-6.4** is what makes the
 * question answerable here: the collision says whether it destroyed what it met, so nothing has to
 * be correlated with the event that follows it.
 */
export function soundFor(event: Event): SoundName | undefined {
  if (event.kind === 'element-destroyed') return 'destruction';
  return event.destroyed ? undefined : 'collision';
}
