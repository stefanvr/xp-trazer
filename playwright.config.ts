import { defineConfig, devices } from '@playwright/test';

const PORT = 4173;

/**
 * Surface tests run against the *built* page, not the dev server, because one of the three things
 * they prove is that the build stamped a real commit (SF-7). A dev server would never exercise it.
 */
export default defineConfig({
  testDir: './e2e',
  forbidOnly: !!process.env['CI'],
  reporter: [['list']],
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    ...devices['Desktop Chrome'],
  },
  webServer: {
    command: `npm run build && npm run preview -- --port ${PORT} --strictPort`,
    url: `http://127.0.0.1:${PORT}`,
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
