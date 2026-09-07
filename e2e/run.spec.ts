import { expect, test, type Page } from '@playwright/test';

/**
 * Smoke tests: they prove wiring, not behaviour (guide-design.md). Whether a run spends a life,
 * scores a point, or ends is settled in src/domain/run.test.ts, over plain state, in milliseconds;
 * what the game-over text itself looks like is src/render/draw.test.ts's. What can only be proven
 * here is that continuing, restarting, and the run's own readouts reach the page — the same division
 * src/main.ts's existing clearing test draws, extended rather than duplicated.
 */

/** Whether a readout's text changes from `from` within a second — the answer, not an assertion. */
async function changedFrom(page: Page, testId: string, from: string): Promise<boolean> {
  return page
    .getByTestId(testId)
    .evaluate(
      (element, was) =>
        new Promise<boolean>((resolve) => {
          const started = Date.now();
          const look = () => {
            if (element.textContent !== was) return resolve(true);
            if (Date.now() - started > 1000) return resolve(false);
            requestAnimationFrame(look);
          };
          look();
        }),
      from,
    )
    .catch(() => false);
}

test('continuing after a clear starts a fresh level in the same run', async ({ page }) => {
  await page.goto('/?level=clearing-proof');
  await expect(page.getByTestId('bricks-left')).toHaveText('1');
  await expect(page.getByTestId('lives-left')).toHaveText('5');
  await expect(page.getByTestId('score')).toHaveText('0');

  // Clear it. clearing-proof.ts's own trick: nothing is steered, launching is the whole input.
  await page.keyboard.press('Space');
  await expect(page.getByTestId('bricks-left')).toHaveText('0', { timeout: 10_000 });
  await expect(page.getByTestId('score')).toHaveText('1');

  // Continue. The same level is drawn again — the URL still asks for clearing-proof — so the
  // readout going back to '1' is the fresh level's own brick, not the one just destroyed.
  await page.keyboard.press('Space');
  await expect(page.getByTestId('bricks-left')).toHaveText('1');

  // What survived the new level: DS-9.1.
  await expect(page.getByTestId('score')).toHaveText('1');
  await expect(page.getByTestId('lives-left')).toHaveText('5');
});

test('losing all five lives ends the run, and space restarts it', async ({ page }) => {
  await page.goto('/?level=game-over-proof');
  await expect(page.getByTestId('lives-left')).toHaveText('5');

  // game-over-proof.ts's own trick: every launch meets the trap in one step, however it is aimed.
  for (let life = 5; life >= 1; life -= 1) {
    await expect(page.getByTestId('lives-left')).toHaveText(String(life));
    await page.keyboard.press('Space');
    expect(await changedFrom(page, 'lives-left', String(life))).toBe(true);
  }

  await expect(page.getByTestId('lives-left')).toHaveText('0');

  // Restart: DS-9.2 — five lives, no score, whatever the run's own score had reached.
  await page.keyboard.press('Space');
  await expect(page.getByTestId('lives-left')).toHaveText('5');
  await expect(page.getByTestId('score')).toHaveText('0');
});
