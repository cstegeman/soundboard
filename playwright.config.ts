import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'e2e',
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  use: { baseURL: 'http://localhost:3100', trace: 'on-first-retry' },
  webServer: {
    command: 'npm run dev -- --port 3100 --strictPort',
    url: 'http://localhost:3100',
    reuseExistingServer: !process.env.CI
  }
});
