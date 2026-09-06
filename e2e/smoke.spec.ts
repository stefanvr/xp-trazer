import { expect, test, type Browser, type Page } from '@playwright/test';

import { PLAYABLE_ROOMS } from '../src/levels/drawn-room';
import { extentOf } from '../src/domain/level';

/**
 * Smoke tests: they prove wiring, not behaviour (guide-design.md). Whether a collision resolves
 * is settled in src/domain/simulation.test.ts, over plain state, in milliseconds. What can only be
 * proven here is that the pieces reach each other at all.
 *
 * **What a test may assume about the level has changed.** The page now opens into a room drawn at
 * random (doc/spec-app.md), so nothing here may depend on the shape of the one it happened to get:
 * 9 of the playable rooms author no horizontal bat, and a test that pressed ArrowRight and waited
 * would fail on about a third of runs. Every assertion below is either true of *every* playable
 * room, or asks the page which room it drew and checks that answer against the domain.
 */

/** Which room numbers the domain says a player may be given — the page must never draw another. */
const PLAYABLE_ROOM_NUMBERS = new Set(PLAYABLE_ROOMS.map((level) => level.origin?.room));

/** Whether the bat readout moves off `from` within a second — the answer, not an assertion. */
async function changedWithin(page: Page, from: number): Promise<boolean> {
  return page
    .getByTestId('bat-position')
    .evaluate(
      (element, was) =>
        new Promise<boolean>((resolve) => {
          const started = Date.now();
          const look = () => {
            if (Number(element.textContent) !== was) return resolve(true);
            if (Date.now() - started > 1000) return resolve(false);
            requestAnimationFrame(look);
          };
          look();
        }),
      from,
    )
    .catch(() => false);
}

/**
 * Drives the bat group the page says it is reporting, and answers whether the group moved.
 *
 * Both directions are tried, because a room may author its bats hard against the end of their
 * travel — **DS-3.3** stops a bat at the boundary, so *press right and expect movement* is only
 * true of a bat with somewhere to go on that side.
 */
async function batMoves(page: Page): Promise<boolean> {
  const group = await page.getByTestId('bat-group').textContent();
  const [forward, back] =
    group === 'vertical' ? (['ArrowDown', 'ArrowUp'] as const) : (['ArrowRight', 'ArrowLeft'] as const);

  for (const key of [forward, back]) {
    const before = Number(await page.getByTestId('bat-position').textContent());
    await page.keyboard.down(key);
    const moved = await changedWithin(page, before);
    await page.keyboard.up(key);
    if (moved) return true;
  }
  return false;
}

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

  // The group the page reports, in whichever direction that group can still travel — a room author
  // may have put its bats hard against either end.
  expect(await batMoves(page)).toBe(true);
});

/**
 * Goal 4's edge, and the one thing about the draw that only the surface can answer: what a player
 * actually opens the page into.
 *
 * Which rooms are playable is settled over plain state in src/levels/drawn-room.test.ts. What is
 * proven here is that the page reaches that set at all — that the level arriving in the browser is
 * an imported room, at the size the original laid it out, and never one the rules cannot play.
 */
test('opening the page drops the player into a playable imported room, at its real size', async ({
  page,
}) => {
  const expected = extentOf(PLAYABLE_ROOMS[0]!);
  const drawn: string[] = [];

  // Twice, because a draw that happened to work once says nothing about the next visitor.
  for (let visit = 0; visit < 2; visit += 1) {
    await page.goto('/');

    const room = await page.getByTestId('room').textContent();
    expect(room, 'the page names no room, so nothing imported was drawn').toMatch(/^\d+$/);
    expect(
      PLAYABLE_ROOM_NUMBERS,
      `room ${room} was drawn, and the rules cannot play it`,
    ).toContain(Number(room));
    drawn.push(room!);

    // The canvas is the level's own extent, undersized only by CSS — doc/spec-app.md: the level is
    // drawn at its own size, and nothing about it changes when it is scaled to fit.
    const canvas = page.locator('canvas#stage');
    await expect(canvas).toHaveAttribute('width', String(expected.width));
    await expect(canvas).toHaveAttribute('height', String(expected.height));
  }

  // Not asserted to differ: the draw may repeat, and doc/spec-app.md says that is what a draw means
  // rather than a fault. Recorded so a run that drew one room twice is readable in the report.
  test.info().annotations.push({ type: 'rooms drawn', description: drawn.join(', ') });
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

test.describe('the touch buttons', () => {
  // Every test opens its own touch-capable, narrow context — the default `page` fixture is neither.
  const touchPage = async (browser: Browser) => {
    const context = await browser.newContext({ viewport: { width: 390, height: 780 }, hasTouch: true });
    return context.newPage();
  };

  /**
   * The button for the group the page reports, in whichever direction that group can still travel,
   * left held. The same care `batMoves` takes for the keyboard, and for the same two reasons: the
   * room drawn may author no horizontal bat, and may author one with nowhere to go on that side.
   */
  const heldButtonThatMoves = async (page: Page) => {
    const group = await page.getByTestId('bat-group').textContent();
    const [forward, back] =
      group === 'vertical' ? (['touch-down', 'touch-up'] as const) : (['touch-right', 'touch-left'] as const);
    const bat = page.getByTestId('bat-position');

    for (const id of [forward, back]) {
      const button = page.locator(`[data-testid="${id}"]`);
      const before = Number(await bat.textContent());
      await button.dispatchEvent('touchstart');
      const moved = await changedWithin(page, before);
      if (moved) return { button, bat };
      await button.dispatchEvent('touchend');
    }
    return undefined;
  };

  test('holding one drives the same bat group its key drives', async ({ browser }) => {
    const page = await touchPage(browser);
    await page.goto('/');

    const held = await heldButtonThatMoves(page);
    expect(held, 'no touch button moved the group the page reports').toBeDefined();
    await held!.button.dispatchEvent('touchend');

    await page.context().close();
  });

  test('releasing one stops the group, the way letting go of a key does', async ({ browser }) => {
    const page = await touchPage(browser);
    await page.goto('/');

    const held = await heldButtonThatMoves(page);
    expect(held, 'no touch button moved the group the page reports').toBeDefined();
    await held!.button.dispatchEvent('touchend');

    const stopped = Number(await held!.bat.textContent());
    await page.waitForTimeout(100);
    expect(Number(await held!.bat.textContent())).toBe(stopped);

    await page.context().close();
  });

  test('tapping launch launches the ball, exactly as Space does', async ({ browser }) => {
    const page = await touchPage(browser);
    await page.goto('/');

    await expect(page.getByTestId('collision-count')).toHaveText('0');

    await page.locator('[data-testid="touch-launch"]').dispatchEvent('touchstart');
    await expect(page.getByTestId('collision-count')).not.toHaveText('0', { timeout: 10_000 });

    await page.context().close();
  });
});

/**
 * The one thing the domain tests cannot reach: that clearing arrives on the page.
 *
 * DS-5.1 counts and DS-5.2 freezes, both settled over plain state in
 * src/domain/simulation.test.ts. What is proven here is only the wiring — that destroying the last
 * destructible element moves the readout the player reads. It runs against a level built for the
 * purpose because the authored one cannot be cleared by a test: unattended it took 28 bricks to 20
 * in 150 seconds, and steering the bats made it worse.
 */
test('clearing reaches the page when the last destructible brick goes', async ({ page }) => {
  await page.goto('/?level=clearing-proof');
  await expect(page.getByTestId('bricks-left')).toHaveText('1');

  // Nothing is steered. The level is built so that launching is the whole input: one bat, so the
  // seed cannot pick a different one, and the brick sits in the column the resting ball launches up.
  await page.keyboard.press('Space');

  await expect(page.getByTestId('bricks-left')).toHaveText('0', { timeout: 10_000 });
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
