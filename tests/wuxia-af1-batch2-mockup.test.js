/**
 * @fileoverview Wuxia AF-1 c04 목업의 13종 기술과 승인 상태 렌더링을 검증한다.
 */

'use strict';

const path = require('path');
const { chromium } = require('playwright');

/**
 * AF-1 목업의 이미지 로드와 최신 승인 문구를 검증한다.
 * @returns {Promise<void>}
 */
async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));

  try {
    const baseUrl = process.env.MOCKUP_BASE_URL || 'http://127.0.0.1:8123';
    await page.goto(`${baseUrl}/wuxia/af1.html`, { waitUntil: 'networkidle' });
    await page.locator('img').evaluateAll((images) => images.forEach((image) => {
      image.loading = 'eager';
    }));
    await page.waitForFunction(
      () => Array.from(document.images).every((image) => image.complete),
      null,
      { timeout: 15000 },
    );
    const imageCount = await page.locator('img').count();
    const broken = await page.locator('img').evaluateAll((images) => images
      .filter((image) => !image.complete || image.naturalWidth === 0)
      .map((image) => image.getAttribute('src')));
    const status = await page.locator('.status').innerText();
    const headings = await page.locator('.motion h2').allTextContents();
    await page.screenshot({
      path: path.join(__dirname, 'screenshots', 'wuxia-af1-c04-mockup.png'),
      fullPage: false,
    });

    if (
      imageCount !== 169
      || broken.length > 0
      || errors.length > 0
      || !status.includes('승인 감사 42건')
      || !status.includes('미해소 REVIEW 0')
      || !status.includes('QA PASS')
      || headings.length !== 13
    ) {
      throw new Error(JSON.stringify({ imageCount, broken, errors, status, headingCount: headings.length }));
    }
    console.log(`MOCKUP_BROWSER_TEST: PASS images=${imageCount} motions=${headings.length} broken=0 consoleErrors=0`);
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
