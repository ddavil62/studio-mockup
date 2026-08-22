const { test, expect } = require('@playwright/test');

test('전체 정답지 목록에서 스테이지 상세 화면으로 진입한다', async ({ page }) => {
  await page.goto('/minigame-paradise/spot-difference-answer-sheets.html');
  await expect(page.locator('.answer-card')).toHaveCount(65);
  await expect(page.locator('#stage-stat')).toHaveText('65개 스테이지');
  await expect(page.locator('#difference-stat')).toHaveText('325개 정답 표시');
  await expect(page.locator('.feedback-link')).toHaveCount(0);

  const firstCard = page.locator('.answer-card').first();
  await expect(firstCard.locator('.sheet-link')).toHaveAttribute('href', 'spot-difference-answer-sheet.html?stage=night-market-01');
  await expect(firstCard.locator('.details-link')).toHaveAttribute('href', 'spot-difference-answer-sheet.html?stage=night-market-01');
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
  await page.locator('.answer-card:visible .sheet-link').click();
  await expect(page).toHaveURL(/spot-difference-answer-sheet\.html\?stage=night-market-01$/);
  await expect(page.locator('#feedback-link')).toBeVisible();
});

test('스테이지 상세 화면에만 피드백 버튼과 정답 항목을 표시한다', async ({ page }) => {
  await page.goto('/minigame-paradise/spot-difference-answer-sheet.html?stage=night-market-01');
  await expect(page.locator('.stage-head h1')).toHaveText('달빛 야시장');
  await expect(page.locator('.answer-list li')).toHaveCount(5);
  const detailImage = page.locator('.sheet img');
  await expect(detailImage).toHaveAttribute('src', /01-night-market-01\.webp$/);
  await expect(detailImage).toBeVisible();
  await expect(page.locator('#feedback-link')).toHaveCount(1);
  const feedbackUrl = await page.locator('#feedback-link').getAttribute('href');
  expect(feedbackUrl).toContain('https://github.com/ddavil62/studio-mockup/issues/new?');
  expect(decodeURIComponent(feedbackUrl)).toContain('[틀린그림찾기 피드백] 01 · 달빛 야시장');
  expect(decodeURIComponent(feedbackUrl)).toContain('ID: night-market-01');
  expect(decodeURIComponent(feedbackUrl)).toContain('spot-difference-answer-sheet.html?stage=night-market-01');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'tests/screenshots/spot-difference-answer-sheet-detail-desktop.png' });
});

test('모바일 상세 화면에서도 피드백 버튼을 표시한다', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/minigame-paradise/spot-difference-answer-sheet.html?stage=night-market-01');
  await expect(page.locator('#feedback-link')).toBeVisible();
  await expect(page.locator('.sheet img')).toBeVisible();
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'tests/screenshots/spot-difference-answer-sheet-detail-mobile.png' });
});

test('난이도 피드백을 반영한 64·65 스테이지 정답지를 표시한다', async ({ page }) => {
  for (const stage of [
    {
      id: 'dragon-academy-moon-observatory-04',
      title: '달빛 천문탑 관측 수업',
      image: /64-dragon-academy-moon-observatory-04\.webp$/,
      answer: '네 꼭짓점으로 바뀐 왼쪽 황금 별 등불',
    },
    {
      id: 'dragon-academy-starlight-graduation-05',
      title: '별구름 졸업 축제',
      image: /65-dragon-academy-starlight-graduation-05\.webp$/,
      answer: '가운데 등불에서 사라진 작은 받침 장식',
    },
  ]) {
    await page.goto(`/minigame-paradise/spot-difference-answer-sheet.html?stage=${stage.id}`);
    await expect(page.locator('.stage-head h1')).toHaveText(stage.title);
    await expect(page.locator('.stage-meta')).toContainText('어려움');
    await expect(page.locator('.answer-list li')).toHaveCount(5);
    await expect(page.locator('.answer-list')).toContainText(stage.answer);
    await expect(page.locator('.sheet img')).toHaveAttribute('src', stage.image);
    await expect(page.locator('.sheet img')).toBeVisible();
  }
});
