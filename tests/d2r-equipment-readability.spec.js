const { test, expect } = require('@playwright/test')

const base = 'http://127.0.0.1:8767/d2r-planner/equipment-readability/'
const concepts = ['armory', 'ledger', 'workbench']

for (const concept of concepts) {
  test(`${concept} renders on desktop`, async ({ page }) => {
    const errors = []
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })
    await page.setViewportSize({ width: 1440, height: 1000 })
    await page.goto(`${base}?concept=${concept}`)
    await expect(page.getByRole('heading', { name: '장비 구성' })).toBeVisible()
    await expect(page.locator('#root')).not.toBeEmpty()
    await page.screenshot({ path: `tests/screenshots/d2r-equipment-${concept}-desktop.png`, fullPage: true })
    expect(errors).toEqual([])
  })
}

test('armory changes selected slot', async ({ page }) => {
  await page.goto(`${base}?concept=armory`)
  await page.getByRole('button', { name: /머리 할리퀸 관모/ }).click()
  await expect(page.locator('.item-detail')).toContainText('할리퀸 관모')
})

test('workbench search filters items', async ({ page }) => {
  await page.goto(`${base}?concept=workbench`)
  await page.getByLabel('아이템 검색').fill('Spirit')
  await expect(page.locator('.result')).toHaveCount(1)
  await expect(page.locator('.preview')).toContainText('Spirit')
})

for (const concept of concepts) {
  test(`${concept} renders on mobile`, async ({ page }) => {
    await page.setViewportSize({ width: 412, height: 915 })
    await page.goto(`${base}?concept=${concept}`)
    await expect(page.getByRole('heading', { name: '장비 구성' })).toBeVisible()
    await expect(page.locator('.mobile-nav')).toBeVisible()
    await page.screenshot({ path: `tests/screenshots/d2r-equipment-${concept}-mobile.png`, fullPage: true })
  })
}

test('core equipment text is readable', async ({ page }) => {
  await page.goto(`${base}?concept=armory`)
  const sizes = await page.locator('.slot-card strong, .item-detail h2, .mod').evaluateAll(nodes => nodes.map(node => parseFloat(getComputedStyle(node).fontSize)))
  expect(Math.min(...sizes)).toBeGreaterThanOrEqual(12)
})
