import { expect, test, type Page } from '@playwright/test';

/**
 * Smoke tests for sound: they prove wiring, not behaviour (guide-design.md). *Which* event makes
 * which noise is settled in src/audio/sounds.test.ts, over plain data, with no browser. What can
 * only be proven here is that the page reaches Web Audio at all.
 *
 * **What this cannot prove is that a human hears anything.** It asserts that the page asked for the
 * right sound, not that a speaker made it. That is the ceiling of an automated check here, and it is
 * worth saying rather than letting a green tick imply more than it means.
 *
 * `AudioContext` is replaced before the app loads, so nothing ships to make this possible — there is
 * no dev-only affordance and nothing to gate. doc/spec-app.md's layout is untouched by it.
 */

/** What the page asked Web Audio for: one entry per source, `kind@startingFrequency`. */
async function recordAudio(page: Page): Promise<void> {
  await page.addInitScript(() => {
    type Asked = { kind: string; from: number | null };
    const asked: Asked[] = [];
    (window as unknown as { __asked: Asked[] }).__asked = asked;

    class Param {
      constructor(private readonly owner: Asked | undefined) {}
      value = 0;
      setValueAtTime(value: number): Param {
        if (this.owner !== undefined && this.owner.from === null) this.owner.from = value;
        return this;
      }
      linearRampToValueAtTime(): Param {
        return this;
      }
      exponentialRampToValueAtTime(): Param {
        return this;
      }
    }

    class Node {
      readonly gain = new Param(undefined);
      readonly Q = new Param(undefined);
      connect(next: unknown): unknown {
        return next;
      }
    }

    class Source extends Node {
      readonly frequency: Param;
      private readonly record: Asked;
      constructor(record: Asked) {
        super();
        this.record = record;
        this.frequency = new Param(record);
      }
      buffer: unknown = undefined;
      set type(kind: string) {
        this.record.kind = kind;
      }
      setPeriodicWave(): void {
        this.record.kind = 'pulse';
      }
      start(): void {}
      stop(): void {}
    }

    class Fake {
      readonly currentTime = 0;
      readonly sampleRate = 44100;
      readonly destination = new Node();
      private make(kind: string): Source {
        const record: Asked = { kind, from: null };
        asked.push(record);
        return new Source(record);
      }
      createOscillator(): Source {
        return this.make('oscillator');
      }
      createBufferSource(): Source {
        return this.make('noise');
      }
      createBuffer(_channels: number, length: number): { getChannelData: () => Float32Array } {
        const data = new Float32Array(length);
        return { getChannelData: () => data };
      }
      createGain(): Node {
        return new Node();
      }
      createBiquadFilter(): Node & { type: string; frequency: Param } {
        return Object.assign(new Node(), { type: '', frequency: new Param(undefined) });
      }
      createPeriodicWave(): unknown {
        return {};
      }
    }

    (window as unknown as { AudioContext: unknown }).AudioContext = Fake;
  });
}

const asked = (page: Page) =>
  page.evaluate(() =>
    (window as unknown as { __asked: { kind: string; from: number | null }[] }).__asked.map(
      (one) => `${one.kind}@${one.from ?? 0}`,
    ),
  );

/**
 * doc/spec-style.md's values, and the reason this test can tell the two sounds apart: only the
 * collision opens on a triangle, and only the destruction ends in noise.
 */
const COLLISION_OPENS = 'triangle@510';
const DESTRUCTION_OPENS = 'pulse@820';
const DESTRUCTION_ENDS = 'noise@0';

test('nothing is asked of the audio before the player acts', async ({ page }) => {
  await recordAudio(page);
  await page.goto('/');

  // spec-app: the ball is held until launched and a held ball meets nothing, so there is no unlock
  // gesture to arrange — the game cannot make a sound before the first press.
  await expect.poll(async () => await asked(page)).toEqual([]);
});

test('destroying a brick is heard as the destruction and not as a collision', async ({ page }) => {
  await recordAudio(page);
  // The level built for the clearing proof: the ball launches straight up into its one brick, so the
  // only collision it has is the one that destroys. spec-style makes that collision silent.
  await page.goto('/?level=clearing-proof');
  await expect(page.getByTestId('bricks-left')).toHaveText('1');

  await page.keyboard.press('Space');
  await expect(page.getByTestId('bricks-left')).toHaveText('0', { timeout: 10_000 });

  const heard = await asked(page);
  expect(heard).toEqual([DESTRUCTION_OPENS, DESTRUCTION_ENDS]);
  expect(heard).not.toContain(COLLISION_OPENS);
});

test('a bounce is heard as the collision sound', async ({ page }) => {
  await recordAudio(page);
  await page.goto('/');

  await page.keyboard.press('Space');

  // The authored level has boundaries and permanent bricks, so a collision that destroys nothing
  // arrives without steering. Polled rather than read once: which comes first depends on the seed.
  await expect.poll(async () => await asked(page), { timeout: 10_000 }).toContain(COLLISION_OPENS);
});

test('the game still runs on a browser with no Web Audio', async ({ page }) => {
  await page.addInitScript(() => {
    delete (window as unknown as { AudioContext?: unknown }).AudioContext;
  });
  await page.goto('/');

  // Losing the whole game over a missing nicety would cost more than it saves, so the audio edge
  // goes quiet and the simulation carries on. This is the assertion that says it does.
  await page.keyboard.press('Space');
  await expect(page.getByTestId('collision-count')).not.toHaveText('0', { timeout: 10_000 });
});
