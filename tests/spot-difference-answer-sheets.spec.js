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

test('난이도 피드백을 반영한 장난감 왕국 56~60 정답지를 표시한다', async ({ page }) => {
  const stages = [
    ['toy-kingdom-block-castle-01', '블록 왕국 성문', '가운데 톱니가 사라진 성문 꼭대기 블록'],
    ['toy-kingdom-windup-train-station-02', '태엽 기차역', '짧아진 역 시계의 오른쪽 바늘'],
    ['toy-kingdom-music-box-plaza-03', '오르골 광장', '추가 사라진 가운데 황동 종'],
    ['toy-kingdom-patchwork-dragon-bridge-04', '봉제 용 다리', '아래 금빛 받침이 사라진 가운데 등불'],
    ['toy-kingdom-star-crown-palace-05', '별왕관 궁전', '왼쪽 아래 꼭짓점이 짧아진 가운데 별 등불'],
  ];

  for (const [id, title, answer] of stages) {
    await page.goto(`/minigame-paradise/spot-difference-answer-sheet.html?stage=${id}`);
    await expect(page.locator('.stage-head h1')).toHaveText(title);
    await expect(page.locator('.stage-meta')).toContainText('어려움');
    await expect(page.locator('.answer-list li')).toHaveCount(5);
    await expect(page.locator('.answer-list')).toContainText(answer);
    await expect(page.locator('.sheet img')).toBeVisible();
  }
});

test('64번 첫 차이는 짧아진 목도리 꼬리로 안내한다', async ({ page }) => {
  await page.goto('/minigame-paradise/spot-difference-answer-sheet.html?stage=dragon-academy-moon-observatory-04');
  await expect(page.locator('.answer-list li').first()).toContainText('짧아진 아기 용 목도리의 오른쪽 꼬리');
});
