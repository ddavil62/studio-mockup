/**
 * @fileoverview Playwright 설정 - studio-mockup QA 전용.
 * 외부 http server(8765)를 가정한다 (테스트 실행 전 별도로 띄워야 함).
 */
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:8765',
    headless: true,
    viewport: { width: 1440, height: 900 },
    actionTimeout: 10_000,
    ignoreHTTPSErrors: true,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
