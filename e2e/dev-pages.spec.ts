import { expect, test, type Page } from '@playwright/test';

/**
 * The dev pages, opened.
 *
 * **They run against the dev server, not the built page.** Every other spec here runs against the
 * build on purpose — that is where the commit identifier is stamped — and these pages are kept out
 * of the build so they cannot ship. The dev server is the only place they exist, which is why
 * `playwright.config.ts` runs a second one.
 *
 * **What this proves is that each page loads and draws, and nothing more.** A dev page demonstrates
 * a specification against the real code, so what it shows is asserted where that code is — in
 * `dev/panels.test.ts` and in `src/`, over plain state. What could not be asserted anywhere until
 * now is the thing that actually went wrong: a page whose first level throws draws nothing, says
 * nothing, and leaves no failing test behind. Both of these pages were broken that way for two
 * landings.
 */

const DEV_PAGES = [
  { name: 'style', path: '/dev/style.html', canvas: '#cleared' },
  { name: 'elements', path: '/dev/elements.html', canvas: '#stage' },
  { name: 'rooms', path: '/dev/levels.html', canvas: '#stage' },
  // No canvas: the audio page is heard rather than seen. Loading is all there is to assert.
  { name: 'audio', path: '/dev/audio.html', canvas: undefined },
] as const;

/** Whatever the page threw while loading, or nothing. Collected before the first navigation. */
function errorsFrom(page: Page): string[] {
  const thrown: string[] = [];
  page.on('pageerror', (error) => thrown.push(error.message));
  return thrown;
}

for (const { name, path, canvas } of DEV_PAGES) {
  test(`the ${name} dev page loads without throwing`, async ({ page }) => {
    const thrown = errorsFrom(page);

    await page.goto(path);
    await expect(page.locator('h1')).toBeVisible();

    expect(thrown).toEqual([]);
  });

  if (canvas === undefined) continue;

  test(`the ${name} dev page draws something`, async ({ page }) => {
    await page.goto(path);

    // The same reading `smoke.spec.ts` takes of the played page, and for the same reasons: counting
    // distinct colours knows none of them, where thresholding a channel would couple this to
    // whatever spec-style currently says. Polled, because `goto` resolves before the first frame.
    await expect
      .poll(async () =>
        page.evaluate((selector) => {
          const coloursOn = (element: HTMLCanvasElement): number => {
            const context = element.getContext('2d');
            if (!context) return 0;
            const { data } = context.getImageData(0, 0, element.width, element.height);
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
          };

          const canvases = [...document.querySelectorAll<HTMLCanvasElement>(selector)];
          return Math.max(0, ...canvases.map(coloursOn));
        }, canvas),
      )
      .toBeGreaterThan(1);
  });
}
