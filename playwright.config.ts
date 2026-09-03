import { defineConfig, devices } from '@playwright/test';

const PORT = 4173;

/**
 * Surface tests run against the *built* page, not the dev server, because one of the three things
 * they prove is that the build stamped a real commit (SF-7). A dev server would never exercise it.
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
  webServer: {
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
});
