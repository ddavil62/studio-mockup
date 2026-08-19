const { test, expect } = require('@playwright/test');

test('틀린그림찾기 Humanlike AI 영상이 목업 페이지에서 재생된다', async ({ page }) => {
  const errors = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto('/minigame-paradise/spot-difference-ai-playtest.html');
  await expect(page.getByRole('heading', { name: /정답을 아는 AI가/ })).toBeVisible();
  const video = page.locator('#spot-video');
  await expect(video).toBeVisible();
  await expect.poll(() => video.evaluate((element) => element.duration)).toBeGreaterThan(73);
  await expect(video.locator('source')).toHaveAttribute('src', 'assets/spot-difference-humanlike-ai-1280x720.mp4?v=humanlike-3');
  await expect(page.getByRole('button', { name: '00:12 · 상대 오답 X 공유' })).toHaveAttribute('data-time', '12');
  await expect(page.getByRole('button', { name: '00:37 · ? 위치 힌트 표시' })).toHaveAttribute('data-time', '37');
  await expect(page.getByRole('button', { name: '00:42 · 힌트 위치 클릭 → O' })).toHaveAttribute('data-time', '42');
  await expect.poll(() => video.evaluate((element) => element.currentTime)).toBeGreaterThan(.5);
  await expect(page.getByAltText('틀린그림찾기 달빛 야시장 원본 A')).toBeVisible();
  await expect(page.getByAltText('틀린그림찾기 달빛 야시장 변형 B')).toBeVisible();
  await page.screenshot({ path: 'tests/screenshots/spot-difference-ai-playtest-page.png', fullPage: true });
  expect(errors).toEqual([]);
});

test('미니게임천국 메인에서 Humanlike AI 영상으로 진입할 수 있다', async ({ page }) => {
  await page.goto('/minigame-paradise/index.html');
  await expect(page.getByRole('link', { name: 'Humanlike AI 영상 보기 →' })).toHaveAttribute('href', 'spot-difference-ai-playtest.html');
});
