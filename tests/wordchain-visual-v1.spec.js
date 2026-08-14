const { test, expect } = require('@playwright/test');

test('끝말잇기 전장 분리 시안의 공격·보상 연출이 동작한다', async ({ page }) => {
  await page.goto('/minigame-paradise/wordchain-battle-visual-v1.html');
  await expect(page.locator('#battle-stage')).toBeVisible();
  await expect(page.locator('.player-zone')).toHaveCount(2);
  await expect(page.locator('.reward')).toHaveCount(3);
  await expect(page.locator('.menu-item')).toHaveCount(4);
  await expect(page.locator('[data-base-damage="4"] .menu-value span')).toHaveText('6');
  await expect(page.locator('#reward-modal')).not.toHaveClass(/active/);
  await expect(page.locator('.input-timer')).toBeVisible();
  await expect(page.locator('.central-timer')).toHaveCount(0);
  await expect(page.locator('[data-timer-variant]')).toHaveCount(0);

  await page.locator('#play-attack').click();
  await expect(page.locator('#reward-modal')).toHaveClass(/active/);
  await page.locator('[data-reward="attack"]').click();
  await expect(page.locator('#reward-modal')).not.toHaveClass(/active/);
  await expect(page.locator('#me-atk')).toHaveText('4');
  await expect(page.locator('[data-base-damage="4"] .menu-value span')).toHaveText('7');
  await expect(page.locator('[data-base-damage="12"] .menu-value span')).toHaveText('15');
  await expect(page.locator('#opp-hp-text')).toHaveText('73 / 100');

  await page.locator('#reset-demo').click();
  await page.locator('#submit-demo').click();
  await page.locator('[data-reward="defense"]').click();
  await expect(page.locator('#me-def')).toHaveText('2');

  await page.locator('#reset-demo').click();
  await page.locator('#play-finisher').click();
  await expect(page.locator('#projectile')).toHaveClass(/active/);
  await expect(page.locator('#opp-hp-text')).toHaveText('0 / 100', { timeout: 2_000 });
  await expect(page.locator('#defeat-fx')).toHaveClass(/active/);
  await expect(page.locator('#finish-result')).toHaveClass(/active/, { timeout: 3_000 });
  await expect(page.locator('#finish-result')).toContainText('VICTORY');
});

test('390px 모바일에서 전장과 액션 UI가 가로로 넘치지 않는다', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/minigame-paradise/wordchain-battle-visual-v1.html');
  await expect(page.locator('#battle-stage')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await expect(page.locator('.reward')).toHaveCount(3);
  await expect(page.locator('.input-timer')).toBeVisible();
  await page.locator('#submit-demo').click();
  await expect(page.locator('#reward-modal')).toHaveClass(/active/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});

test('미니게임천국 목업 인덱스에서 시안으로 진입할 수 있다', async ({ page }) => {
  await page.goto('/minigame-paradise/index.html');
  const link = page.locator('a[href="wordchain-battle-visual-v1.html"]');
  await expect(link).toHaveCount(2);
  await expect(link.first()).toBeVisible();
});
