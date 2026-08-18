const { test, expect } = require('@playwright/test');

test('테트리스 배틀 BGM과 효과음을 실제 브라우저에서 재생한다', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });

  await page.goto('/minigame-paradise/tetris-battle-audio.html');
  await page.getByRole('button', { name: '▶ 배틀 BGM' }).click();
  await expect(page.locator('#player')).toHaveClass(/playing/);
  await expect(page.locator('#status')).toHaveText('배틀 BGM 재생 중');

  await page.getByRole('button', { name: /✦ 테트리스/ }).click();
  await expect(page.locator('#status')).toHaveText('✦ 테트리스 효과음 재생');

  await page.getByRole('button', { name: '♫ 대기실 BGM' }).click();
  await expect(page.locator('#status')).toHaveText('대기실 BGM 재생 중');
  await page.screenshot({ path: 'tests/screenshots/tetris-audio-desktop.png', fullPage: true });

  await page.getByRole('button', { name: '■ 정지' }).click();
  await expect(page.locator('#player')).not.toHaveClass(/playing/);
  await expect(page.locator('#status')).toHaveText('BGM 정지');
  expect(errors).toEqual([]);
});

test('390px 모바일에서 모든 오디오 컨트롤이 화면 안에 표시된다', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/minigame-paradise/tetris-battle-audio.html');
  await expect(page.locator('#player')).toBeVisible();
  await expect(page.locator('[data-sfx]')).toHaveCount(9);
  await page.screenshot({ path: 'tests/screenshots/tetris-audio-mobile.png', fullPage: true });
});
