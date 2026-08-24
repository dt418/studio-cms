import { defineConfig, devices } from '@playwright/test'

process.env.SITE_URL = 'http://seo.test:4321'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'list',
  use: {
    // APIRequestContext does not inherit Chromium's host-resolver-rules. Use
    // the bound loopback address for both request and browser fixtures while
    // the generated SEO URLs continue to use SITE_URL=http://seo.test:4321.
    baseURL: 'http://127.0.0.1:4321',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'seo-chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: ['--host-resolver-rules=MAP seo.test 127.0.0.1'],
        },
      },
    },
  ],
  webServer: {
    command: 'node scripts/run-seo-preview.mjs',
    url: 'http://127.0.0.1:4321/',
    timeout: 180 * 1000,
    reuseExistingServer: false,
  },
})
