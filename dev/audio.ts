import { SOUNDS, soundFor, type Segment, type SoundName } from '../src/audio/sounds';
import { play } from '../src/audio/play';
import type { Event } from '../src/domain/simulation';

/**
 * The `preview` skill's page for the half of doc/spec-style.md that is heard.
 *
 * **Everything is played by calling the real `play()` against the real values**, the same way the
 * visual page draws by calling the real `draw()`. Nothing here re-synthesises a sound or repeats a
 * number: a panel with its own copy of an envelope could go on sounding right after the audio edge
 * stopped, which is the drift this page exists to catch.
 *
 * **The mapping gets panels of its own**, because spec-style's most consequential decision is a
 * silence — a collision that destroyed what it met makes no noise — and a silence is the one thing
 * a list of sounds cannot show.
 */

function element<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const made = document.createElement(tag);
  if (className !== undefined) made.className = className;
  if (text !== undefined) made.textContent = text;
  return made;
}

function required<T extends globalThis.Element>(selector: string): T {
  const found = document.querySelector<T>(selector);
  if (!found) throw new Error(`the document is missing ${selector}`);
  return found;
}

/** The segment as spec-style's table states it, so the page can be read against the document. */
function describe(segment: Segment): string {
  const wave =
    segment.wave.kind === 'pulse' ? `pulse, duty ${segment.wave.duty}` : segment.wave.kind;
  const sweep =
    segment.sweep === undefined ? 'no pitch' : `${segment.sweep.from} → ${segment.sweep.to} Hz`;
  const envelope = `${segment.attack} / ${segment.decay} / ${segment.sustain} / ${segment.release}`;
  return `${wave} · ${segment.milliseconds} ms · ${sweep} · gain ${segment.gain} · A/D/S/R ${envelope} · low-pass ${segment.lowPass} Hz`;
}

function soundPanel(name: SoundName): HTMLElement {
  const sound = SOUNDS[name];
  const total = sound.reduce((sum, segment) => sum + segment.milliseconds, 0);

  const panel = element('figure', 'wide');
  const button = element('button', 'play', `▶ play the ${name} sound`);
  button.addEventListener('click', () => play(name));
  panel.append(button);

  const caption = element('figcaption');
  caption.append(element('span', 'name', name));
  caption.append(element('span', 'role', `${sound.length} segments, one after the other · ${total} ms`));
  for (const [index, segment] of sound.entries()) {
    caption.append(element('span', 'note', `${index + 1}. ${describe(segment)}`));
  }
  panel.append(caption);
  return panel;
}

/**
 * One panel per event doc/spec-domain.md's **DS-6.2** announces, in the shapes that differ in the
 * ear. A collision that destroyed what it met is here precisely because it is silent.
 */
const EVENTS: readonly { readonly what: string; readonly event: Event }[] = [
  { what: 'a collision with the boundary', event: { kind: 'collision', met: 'boundary', destroyed: false } },
  { what: 'a collision with a bat', event: { kind: 'collision', met: 'bat', destroyed: false } },
  { what: 'a collision with a permanent brick', event: { kind: 'collision', met: 'brick', destroyed: false } },
  { what: 'a collision that destroyed the brick it met', event: { kind: 'collision', met: 'brick', destroyed: true } },
  { what: 'an element destroyed', event: { kind: 'element-destroyed', cell: { column: 2, row: 2 } } },
];

function eventPanel(what: string, event: Event): HTMLElement {
  const sound = soundFor(event);

  const panel = element('figure');
  const button = element('button', 'play', sound === undefined ? '▶ (silent)' : `▶ ${sound}`);
  button.disabled = sound === undefined;
  if (sound !== undefined) button.addEventListener('click', () => play(sound));
  panel.append(button);

  const caption = element('figcaption');
  caption.append(element('span', 'name', what));
  caption.append(
    element(
      'span',
      'role',
      sound === undefined ? 'heard as nothing' : `heard as the ${sound} sound`,
    ),
  );
  if (sound === undefined) {
    caption.append(
      element('span', 'note', 'its destruction is what is heard — the two would otherwise smear'),
    );
  }
  panel.append(caption);
  return panel;
}

const sounds = required('#sounds');
for (const name of Object.keys(SOUNDS) as SoundName[]) sounds.append(soundPanel(name));

const events = required('#events');
for (const { what, event } of EVENTS) events.append(eventPanel(what, event));
