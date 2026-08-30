const { test, expect } = require('@playwright/test');

const concepts = [
  { id: 'focus', title: '집중 트리' },
  { id: 'ledger', title: '레벨 원장' },
  { id: 'codex', title: '스킬 도감' },
];
const mockupUrl = concept => `http://127.0.0.1:8766/d2r-planner/skill-readability/index.html?concept=${concept}`;

for (const concept of concepts) {
  test(`${concept.title} 데스크톱 목업이 렌더링된다`, async ({ page }) => {
    const errors = [];
    page.on('console', message => {
      if (message.type() === 'error') errors.push(message.text());
    });

    await page.goto(mockupUrl(concept.id));
    await expect(page.getByRole('heading', { name: '네크로맨서 기술' })).toBeVisible();
    await expect(page.locator('[data-concept].active')).toContainText(concept.title);
    await expect(page.locator('#mockup-root')).not.toBeEmpty();
    expect(errors).toEqual([]);

    await page.screenshot({
      path: `tests/screenshots/d2r-skill-${concept.id}-desktop.png`,
      fullPage: true,
    });
  });
}

test('집중 트리에서 포인트 투자와 계열 전환이 동작한다', async ({ page }) => {
  await page.goto(mockupUrl('focus'));
  await page.getByRole('button', { name: '해골 되살리기 증가' }).click();
  await expect(page.locator('#spent-total')).toHaveText('1');
  await page.getByRole('button', { name: /독과 뼈/ }).click();
  await expect(page.locator('.tree-panel-header')).toContainText('독과 뼈');
});

test('세 시안의 핵심 텍스트는 10px 미만으로 축소되지 않는다', async ({ page }) => {
  for (const concept of concepts) {
    await page.goto(mockupUrl(concept.id));
    const selector = concept.id === 'focus' ? '.node-title' : concept.id === 'ledger' ? '.ledger-skill strong' : '.codex-nav > button';
    const fontSize = await page.locator(selector).first().evaluate(element => Number.parseFloat(getComputedStyle(element).fontSize));
    expect(fontSize).toBeGreaterThanOrEqual(12);
  }
});

test('모바일에서 세 시안 선택과 하단 내비게이션이 유지된다', async ({ page }) => {
  await page.setViewportSize({ width: 412, height: 915 });
  await page.goto(mockupUrl('focus'));
  await expect(page.locator('.mobile-nav')).toBeVisible();

  for (const concept of concepts) {
    await page.getByRole('button', { name: new RegExp(concept.title) }).click();
    await expect(page.locator('[data-concept].active')).toContainText(concept.title);
    await page.screenshot({
      path: `tests/screenshots/d2r-skill-${concept.id}-mobile.png`,
      fullPage: true,
    });
  }
});
