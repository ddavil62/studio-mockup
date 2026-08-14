const { test, expect } = require('@playwright/test');

test('달빛 주방열차 Stage 1 AI 영상이 목업 페이지에서 재생된다', async ({ page }) => {
  const errors = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto('/minigame-paradise/moonlight-kitchen-ai-stage1.html');
  await expect(page.getByRole('heading', { name: /첫 주문부터/ })).toBeVisible();
  const video = page.locator('#stage-video');
  await expect(video).toBeVisible();
  await expect.poll(() => video.evaluate((element) => element.duration)).toBeGreaterThan(136);
  await expect(video.locator('source')).toHaveAttribute('src', 'assets/moonlight-kitchen-ai-stage1-1280x720.mp4?v=duo-2');
  const duoMoment = page.getByRole('button', { name: '01:18 · 두 AI 병렬 작업' });
  await expect(duoMoment).toHaveAttribute('data-time', '78');
  await expect.poll(() => video.evaluate((element) => element.currentTime)).toBeGreaterThan(.5);
  await page.screenshot({ path: 'tests/screenshots/moonlight-kitchen-ai-stage1-page.png', fullPage: true });
  expect(errors).toEqual([]);
});

test('미니게임천국 메인에서 Stage 1 영상으로 진입할 수 있다', async ({ page }) => {
  await page.goto('/minigame-paradise/index.html');
  const link = page.getByRole('link', { name: 'Stage 1 영상 보기 →' });
  await expect(link).toHaveAttribute('href', 'moonlight-kitchen-ai-stage1.html');
});
