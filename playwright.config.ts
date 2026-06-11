import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for Astro v4 migration E2E tests.
 *
 * Strategy: Build the site first, then run the preview server.
 * This tests the production-like output, which is what matters for
 * SEO metadata, sitemap, RSS, and JSON-LD regression testing.
 *
 * For development iteration, use `npm run dev` manually and run
 * tests with `npx playwright test --grep @smoke`.
 */
export default defineConfig({
  testDir: './tests/e2e',
  testMatch: '**/*.spec.ts',
  outputDir: './tests/results',

  /* Maximum time a single test can run */
  timeout: 30_000,

  /* Maximum time expect() assertions can wait */
  expect: {
    timeout: 5_000,
  },

  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,

  /* Retry failed tests on CI only */
  retries: process.env.CI ? 1 : 0,

  /* Reporter: concise for CI, verbose for local */
  reporter: process.env.CI ? 'github' : 'list',

  /* Shared settings for all the projects below */
  use: {
    baseURL: 'http://localhost:4321',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  /* Single project: Chromium only for CI speed */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  /* Start the Astro dev server before tests.
   * Using `dev` instead of `preview` avoids requiring a full build cycle
   * during test authoring. Switch to `build && preview` in CI if needed. */
  webServer: {
    command: 'npm run dev',
    port: 4321,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000, // Astro dev server with content collections can take time
  },
});
