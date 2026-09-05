import { SOUNDS, type Segment, type SoundName } from './sounds';

/**
 * The edge that makes a noise — the only file in the project that touches Web Audio.
 *
 * doc/spec-tech.md chooses synthesis over playback: nothing is fetched at runtime, and every sound is
 * built here from the values `./sounds.ts` holds. The shape of the synthesis follows the reference
 * implementation the recovered material ships with, so a parameter in spec-style means there what it
 * meant when the effects were rendered.
 *
 * **A-1 is untouched.** This clock is the edge's, like the animation frame. The simulation announces
 * what happened and never asks when.
 */

/**
 * Built on the first sound, and never before it. A browser will not start audio until the player has
 * acted, and doc/spec-app.md's reason there is nothing to arrange applies here: the first sound
 * cannot precede the first press, because a held ball meets nothing.
 */
let context: AudioContext | undefined;
let silent = false;

/**
 * **A browser with no Web Audio plays the game silently rather than not at all.** *Fail loudly where
 * it is cheap* is guide-design's rule and this is where it is not cheap — losing the whole game over
 * a missing nicety costs more than it saves. Not a departure: the rule carries that condition.
 */
function audio(): AudioContext | undefined {
  if (context !== undefined) return context;
  if (silent) return undefined;

  const Available = window.AudioContext;
  if (Available === undefined) {
    silent = true;
    return undefined;
  }
  context = new Available();
  return context;
}

/**
 * A pulse of a given duty cycle, which Web Audio has no oscillator type for. The Fourier series of a
 * rectangular wave, to 64 harmonics — the reference implementation's, kept rather than approximated
 * with `square`, whose duty is fixed at a half and would lose what the duty values in spec-style
 * distinguish.
 */
function pulseWave(on: AudioContext, duty: number): PeriodicWave {
  const harmonics = 64;
  const real = new Float32Array(harmonics);
  const imaginary = new Float32Array(harmonics);
  for (let n = 1; n < harmonics; n += 1) {
    real[n] = (2 * Math.sin(2 * Math.PI * n * duty)) / (Math.PI * n);
  }
  return on.createPeriodicWave(real, imaginary);
}

/** White noise for the length of the segment — a buffer of random samples, played once. */
function noiseSource(on: AudioContext, seconds: number): AudioBufferSourceNode {
  const samples = Math.max(1, Math.floor(on.sampleRate * seconds));
  const buffer = on.createBuffer(1, samples, on.sampleRate);
  const channel = buffer.getChannelData(0);
  for (let sample = 0; sample < samples; sample += 1) channel[sample] = Math.random() * 2 - 1;

  const source = on.createBufferSource();
  source.buffer = buffer;
  return source;
}

/**
 * Attack, decay, sustain, release — clamped so that a segment shorter than its own envelope still
 * ends when it is supposed to. Whatever is left after A, D and R is the sustain's to hold.
 */
function envelope(on: AudioContext, at: number, segment: Segment): GainNode {
  const total = segment.milliseconds / 1000;
  const attack = Math.min(segment.attack / 1000, total);
  const decay = Math.min(segment.decay / 1000, Math.max(0, total - attack));
  const release = Math.min(segment.release / 1000, Math.max(0, total - attack - decay));
  const hold = Math.max(0, total - attack - decay - release);
  const sustained = segment.gain * segment.sustain;

  const gain = on.createGain();
  gain.gain.setValueAtTime(0, at);
  gain.gain.linearRampToValueAtTime(segment.gain, at + attack);
  gain.gain.linearRampToValueAtTime(sustained, at + attack + decay);
  gain.gain.setValueAtTime(sustained, at + attack + decay + hold);
  gain.gain.linearRampToValueAtTime(0, at + total);
  return gain;
}

function playSegment(on: AudioContext, at: number, segment: Segment): void {
  const seconds = segment.milliseconds / 1000;

  let source: AudioScheduledSourceNode;
  if (segment.wave.kind === 'noise') {
    source = noiseSource(on, seconds);
  } else {
    const oscillator = on.createOscillator();
    if (segment.wave.kind === 'pulse') oscillator.setPeriodicWave(pulseWave(on, segment.wave.duty));
    else oscillator.type = segment.wave.kind;

    if (segment.sweep !== undefined) {
      oscillator.frequency.setValueAtTime(segment.sweep.from, at);
      // Exponential, because pitch is heard that way — and never to zero, which it cannot reach.
      oscillator.frequency.exponentialRampToValueAtTime(
        Math.max(1, segment.sweep.to),
        at + seconds,
      );
    }
    source = oscillator;
  }

  const filter = on.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = segment.lowPass;
  filter.Q.value = 0.7;

  source.connect(envelope(on, at, segment)).connect(filter).connect(on.destination);
  source.start(at);
  source.stop(at + seconds + 0.01);
}

/**
 * Plays one of doc/spec-style.md's two sounds, its segments one after the other.
 *
 * Scheduled a little ahead of `currentTime` so the first segment is not already late by the time it
 * is built; the offset is inaudible and is what stops the attack being clipped.
 */
export function play(name: SoundName): void {
  const on = audio();
  if (on === undefined) return;

  let at = on.currentTime + 0.02;
  for (const segment of SOUNDS[name]) {
    playSegment(on, at, segment);
    at += segment.milliseconds / 1000;
  }
}
