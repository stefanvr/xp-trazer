import { expect, test } from '@playwright/test';

/**
 * Smoke tests: they prove wiring, not behaviour (guide-design.md). Whether a ball bounces correctly
 * is settled in src/domain/simulation.test.ts, over plain state, in milliseconds. What can only be
 * proven here is that the pieces reach each other at all.
 */

test('the built page reports a real commit rather than unknown', async ({ page }) => {
  await page.goto('/');

  const identifier = page.getByTestId('build-identifier');

  // Not merely present: `unknown` is what a build outside a repository stamps, and it exits 0 (SF-7).
  await expect(identifier).not.toHaveText('unknown');
  await expect(identifier).toHaveText(/^[0-9a-f]{40}(-dirty)?$/);
});

test('the loop runs and the ball reaches a wall', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByTestId('bounce-count')).not.toHaveText('0', { timeout: 10_000 });
});

test('an arrow key reaches the simulation', async ({ page }) => {
  await page.goto('/');

  const velocity = page.getByTestId('velocity-x');
  await expect(velocity).toHaveText('0.0');

  await page.keyboard.down('ArrowRight');
  await expect.poll(async () => Number(await velocity.textContent())).toBeGreaterThan(0);
  await page.keyboard.up('ArrowRight');
});

test('something is actually drawn on the canvas', async ({ page }) => {
  await page.goto('/');

  // Polled, not sampled once: goto resolves on load, which is before the first animation frame has
  // painted anything. A single read here is a race that fails on a fast machine and passes on a slow one.
  await expect
    .poll(async () =>
      page.evaluate(() => {
        const canvas = document.querySelector('canvas');
        const context = canvas?.getContext('2d');
        if (!canvas || !context) return 0;
        const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
        let lit = 0;
        for (let index = 0; index < data.length; index += 4) {
          if ((data[index + 2] ?? 0) > 80) lit += 1;
        }
        return lit;
      }),
    )
    .toBeGreaterThan(0);
});
