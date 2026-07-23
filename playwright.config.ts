import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: 'line',
  globalSetup: './e2e/global-setup.ts',
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'retain-on-failure',
    ...devices['Desktop Chrome'],
  },
  webServer: {
    command: 'bun run dev --hostname 127.0.0.1 --port 4173',
    env: {
      API_BASE_URL: 'http://127.0.0.1:4173',
      BETTER_AUTH_URL: 'http://127.0.0.1:4173',
      DB_MODE: 'local',
      SITE_URL: 'http://127.0.0.1:4173',
    },
    url: 'http://127.0.0.1:4173/login',
    reuseExistingServer: false,
    timeout: 120_000,
  },
})
