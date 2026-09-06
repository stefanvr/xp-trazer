import { defineConfig, devices } from '@playwright/test';

const PORT = 4173;
const DEV_PORT = 4174;

/**
 * Surface tests run against the *built* page, not the dev server, because one of the three things
 * they prove is that the build stamped a real commit (SF-7). A dev server would never exercise it.
 *
 * **The one exception is the dev pages, and it is forced rather than chosen** — doc/spec-tech.md's
 * **A-4**. They are kept out of `vite build` so they cannot ship, which also puts them out of reach
 * of the built page, so the only way to assert one loads at all is a second server running the dev
 * one. The split is by project below: everything about the product runs against the build, and
 * `dev-pages.spec.ts` alone runs against the dev server.
 */
export default defineConfig({
  testDir: './e2e',
  forbidOnly: !!process.env['CI'],
  // The `github` reporter turns each failure into a GitHub annotation. Annotations are readable on
  // a public repository without credentials, where the job log and the artifacts are not — so this
  // is what makes a CI-only failure diagnosable by someone who is not a repository admin.
  reporter: process.env['CI']
    ? [['github'], ['list'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    ...devices['Desktop Chrome'],
    // A failure that leaves no evidence costs a round trip to reproduce, and a CI failure cannot be
    // reproduced locally at all. These cost nothing on a passing run.
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'built', testIgnore: /dev-pages\.spec\.ts/ },
    {
      name: 'dev-pages',
      testMatch: /dev-pages\.spec\.ts/,
      use: { baseURL: `http://127.0.0.1:${DEV_PORT}` },
    },
  ],
  webServer: [
    {
      // `--host 127.0.0.1` is load-bearing, not tidiness. Left to itself the preview server binds to
      // `localhost`, which resolves to ::1 on some machines and 127.0.0.1 on others, while the url
      // below is polled as IPv4 — so the server comes up healthy on an address nothing is watching
      // and Playwright waits out its timeout. Binding and polling the same literal address removes
      // name resolution from the question.
      command: `npm run build && npm run preview -- --host 127.0.0.1 --port ${PORT} --strictPort`,
      url: `http://127.0.0.1:${PORT}`,
      reuseExistingServer: false,
      timeout: 120_000,
      // Without these the server's own output is swallowed, and a failure to start reports only that
      // Playwright timed out — which names the symptom and hides every cause.
      stdout: 'pipe',
      stderr: 'pipe',
    },
    {
      // The dev pages' server. Same literal address for the same reason, and a different port so
      // the two can run side by side.
      command: `npm run dev -- --host 127.0.0.1 --port ${DEV_PORT} --strictPort`,
      url: `http://127.0.0.1:${DEV_PORT}/dev/index.html`,
      reuseExistingServer: false,
      timeout: 120_000,
      stdout: 'pipe',
      stderr: 'pipe',
    },
  ],
});
