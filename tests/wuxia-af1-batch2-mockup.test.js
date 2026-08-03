/**
 * @fileoverview Wuxia AF-1 목업의 승인 프레임과 보류 상태 렌더링을 검증한다.
 */

'use strict';

const path = require('path');
const { chromium } = require('playwright');

/**
 * AF-1 목업의 이미지 로드와 상태 문구를 검증한다.
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
    await page.goto('http://127.0.0.1:8123/wuxia/af1.html', { waitUntil: 'networkidle' });
    // 화면 아래 lazy 이미지까지 실제 요청해 전체 경로를 검증한다.
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
      path: path.join(__dirname, 'screenshots', 'wuxia-af1-batch2-mockup.png'),
      fullPage: false,
    });

    if (
      imageCount !== 153
      || broken.length > 0
      || errors.length > 0
      || !status.includes('이중음')
      || !status.includes('참족')
      || !status.includes('이단족')
      || !status.includes('음사 A')
      || !status.includes('96프레임')
      || headings.length !== 12
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
