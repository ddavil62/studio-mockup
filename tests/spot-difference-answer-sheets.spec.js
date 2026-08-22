const { test, expect } = require('@playwright/test');

test('전체 틀린그림찾기 정답지와 필터를 표시한다', async ({ page }) => {
  await page.goto('/minigame-paradise/spot-difference-answer-sheets.html');
  await expect(page.locator('.answer-card')).toHaveCount(65);
  await expect(page.locator('#stage-stat')).toHaveText('65개 스테이지');
  await expect(page.locator('#difference-stat')).toHaveText('325개 정답 표시');
  await expect(page.locator('.feedback-link')).toHaveCount(65);
  const firstCard = page.locator('.answer-card').first();
  await expect(firstCard.locator('img')).toHaveAttribute('src', /01-night-market-01\.webp$/);
  const feedbackUrl = await firstCard.locator('.feedback-link').getAttribute('href');
  expect(feedbackUrl).toContain('https://github.com/ddavil62/studio-mockup/issues/new?');
  expect(decodeURIComponent(feedbackUrl)).toContain('[틀린그림찾기 피드백] 01 · 달빛 야시장');
  expect(decodeURIComponent(feedbackUrl)).toContain('ID: night-market-01');
  await firstCard.scrollIntoViewIfNeeded();
  await expect(firstCard.locator('img')).toBeVisible();
  await page.waitForLoadState('networkidle');
  await firstCard.screenshot({ path: 'tests/screenshots/spot-difference-answer-sheets-desktop.png' });
  await page.locator('#collection-filter').selectOption('dragon-academy');
  await expect(page.locator('.answer-card:visible')).toHaveCount(5);
  await expect(page.locator('#results')).toHaveText('5개 스테이지 표시 중');
  await page.locator('#collection-filter').selectOption('all');
  await page.locator('#stage-search').fill('우산 패널 색');
  await expect(page.locator('.answer-card:visible')).toHaveCount(1);
  await expect(page.locator('.answer-card:visible h2')).toContainText('달빛 야시장');
});

test('모바일에서도 정답지와 필터가 한 열로 표시된다', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/minigame-paradise/spot-difference-answer-sheets.html');
  await expect(page.locator('.answer-card')).toHaveCount(65);
  await expect(page.locator('#collection-filter')).toBeVisible();
  await expect(page.locator('#stage-search')).toBeVisible();
  await page.screenshot({ path: 'tests/screenshots/spot-difference-answer-sheets-mobile.png' });
});
