const { test, expect } = require('@playwright/test');

test('끝말잇기 전장 분리 시안의 공격·보상 연출이 동작한다', async ({ page }) => {
  await page.goto('/minigame-paradise/wordchain-battle-visual-v1.html');
  await expect(page.locator('#battle-stage')).toBeVisible();
  await expect(page.locator('.player-zone')).toHaveCount(2);
  await expect(page.locator('.reward')).toHaveCount(3);

  await page.locator('#play-attack').click();
  await expect(page.locator('#opp-hp-text')).toHaveText('74 / 100');

  await page.locator('[data-reward="attack"]').click();
  await expect(page.locator('#me-atk')).toHaveText('4');
  await page.locator('[data-reward="defense"]').click();
  await expect(page.locator('#me-def')).toHaveText('2');
});

test('390px 모바일에서 전장과 액션 UI가 가로로 넘치지 않는다', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/minigame-paradise/wordchain-battle-visual-v1.html');
  await expect(page.locator('#battle-stage')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await expect(page.locator('.reward')).toHaveCount(3);
});

test('미니게임천국 목업 인덱스에서 시안으로 진입할 수 있다', async ({ page }) => {
  await page.goto('/minigame-paradise/index.html');
  const link = page.locator('a[href="wordchain-battle-visual-v1.html"]');
  await expect(link).toHaveCount(2);
  await expect(link.first()).toBeVisible();
});
