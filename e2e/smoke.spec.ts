import { expect, test } from '@playwright/test';

/**
 * Smoke tests: they prove wiring, not behaviour (guide-design.md). Whether a collision resolves
 * is settled in src/domain/simulation.test.ts, over plain state, in milliseconds. What can only be
 * proven here is that the pieces reach each other at all.
 */

test('the built page reports a real commit rather than unknown', async ({ page }) => {
  await page.goto('/');

  const identifier = page.getByTestId('build-identifier');

  // Not merely present: `unknown` is what a build outside a repository stamps, and it exits 0 (SF-7).
  await expect(identifier).not.toHaveText('unknown');
  await expect(identifier).toHaveText(/^[0-9a-f]{40}(-dirty)?$/);

  // The meta tag is what a deployment check reads, with one request and no browser (SF-8). It has
  // to agree with what the page displays — two sources for one fact is exactly how they drift.
  const shown = (await identifier.textContent()) ?? '';
  await expect(page.locator('meta[name="build-identifier"]')).toHaveAttribute('content', shown);
});

test('the loop runs and the ball reaches the boundary once launched', async ({ page }) => {
  await page.goto('/');

  // The ball is held until the player launches it, so nothing collides before Space.
  await expect(page.getByTestId('collision-count')).toHaveText('0');

  await page.keyboard.press('Space');
  await expect(page.getByTestId('collision-count')).not.toHaveText('0', { timeout: 10_000 });
});

test('an arrow key reaches the simulation', async ({ page }) => {
  await page.goto('/');

  const bat = page.getByTestId('bat-position');
  const before = Number(await bat.textContent());

  await page.keyboard.down('ArrowRight');
  await expect.poll(async () => Number(await bat.textContent())).toBeGreaterThan(before);
  await page.keyboard.up('ArrowRight');
});

test.describe('the small-screen mode', () => {
  // spec-app.md: narrower than 700px *and* touch-capable, never either alone.
  test('shows the touch buttons on a narrow touch device', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 390, height: 780 }, hasTouch: true });
    const page = await context.newPage();
    await page.goto('/');

    await expect(page.locator('#touch-controls')).toBeVisible();

    await context.close();
  });

  test('stays hidden on a narrow window with no touch', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 390, height: 780 }, hasTouch: false });
    const page = await context.newPage();
    await page.goto('/');

    await expect(page.locator('#touch-controls')).toBeHidden();

    await context.close();
  });

  test('stays hidden on a wide touch device', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 1000, height: 800 }, hasTouch: true });
    const page = await context.newPage();
    await page.goto('/');

    await expect(page.locator('#touch-controls')).toBeHidden();

    await context.close();
  });
});

test('something is actually drawn on the canvas', async ({ page }) => {
  await page.goto('/');

  // Counts distinct colours, and knows none of them. Thresholding a channel would couple this to
  // whatever spec-style currently says; "differs from the background" would pass on a canvas nothing
  // ever drew to, since untouched pixels are transparent and differ from it too. More than one
  // colour means something was drawn on top of something.
  //
  // Polled, not sampled once: goto resolves on load, which is before the first animation frame has
  // painted anything. A single read here is a race that fails on a fast machine and passes on a slow one.
  await expect
    .poll(async () =>
      page.evaluate(() => {
        const canvas = document.querySelector('canvas');
        const context = canvas?.getContext('2d');
        if (!canvas || !context) return 0;
        const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
        const seen = new Set<number>();
        for (let index = 0; index < data.length; index += 4) {
          seen.add(
            ((data[index] ?? 0) << 24) |
              ((data[index + 1] ?? 0) << 16) |
              ((data[index + 2] ?? 0) << 8) |
              (data[index + 3] ?? 0),
          );
        }
        return seen.size;
      }),
    )
    .toBeGreaterThan(1);
});
