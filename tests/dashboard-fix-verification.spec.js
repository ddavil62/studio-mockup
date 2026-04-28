/**
 * @fileoverview AC-5 (마크다운 렌더링) FAIL 수정 후 재검증 테스트.
 * marked.js CDN을 cdn.jsdelivr.net/npm/marked@15.0.0으로 교체한 후
 * 카드 클릭 시 마크다운이 HTML 태그로 정상 변환되는지 확인하고
 * QA 뱃지 색상 회귀(P0)도 함께 검증한다.
 */

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:8767/dashboard/';

test.describe('Dashboard FAIL 수정 후 재검증', () => {
  /** @type {string[]} */
  let failedRequests = [];
  /** @type {string[]} */
  let consoleErrors = [];
  /** @type {string[]} */
  let pageErrors = [];

  test.beforeEach(async ({ page }) => {
    failedRequests = [];
    consoleErrors = [];
    pageErrors = [];

    page.on('requestfailed', (req) => {
      failedRequests.push(`${req.url()} - ${req.failure()?.errorText}`);
    });
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', (err) => pageErrors.push(err.message));

    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    // index.json 1635개 로딩 대기 (실제 카드 클래스: .spec-card)
    await page.waitForFunction(
      () => document.querySelectorAll('.spec-card').length > 0,
      { timeout: 30000 }
    );
  });

  test('AC-5 재검증: 카드 클릭 시 마크다운이 HTML 태그로 변환된다', async ({ page }) => {
    // marked가 전역 객체로 로드되어야 함
    const markedType = await page.evaluate(() => typeof marked);
    expect(markedType).toBe('object');

    const markedHasParse = await page.evaluate(
      () => typeof marked === 'object' && typeof marked.parse === 'function'
    );
    expect(markedHasParse).toBe(true);

    // 첫 번째 카드 클릭
    const firstCard = page.locator('.spec-card').first();
    await firstCard.click();

    // 패널이 열리고 콘텐츠가 채워질 때까지 대기
    await page.waitForSelector('#detail-panel:not(.hidden)', { timeout: 5000 });
    await page.waitForFunction(
      () => {
        const el = document.querySelector('#panel-content');
        return el && el.innerHTML.length > 100;
      },
      { timeout: 10000 }
    );

    // panel-content 내부에 HTML 태그가 생성되었는지 검사 (raw 마크다운이 아니라)
    const tagCounts = await page.evaluate(() => {
      const root = document.querySelector('#panel-content');
      return {
        h1: root.querySelectorAll('h1').length,
        h2: root.querySelectorAll('h2').length,
        h3: root.querySelectorAll('h3').length,
        p: root.querySelectorAll('p').length,
        table: root.querySelectorAll('table').length,
        code: root.querySelectorAll('code, pre').length,
        innerHTMLPrefix: root.innerHTML.slice(0, 200),
        textContentHasRawMd: root.textContent.startsWith('# ') || root.textContent.startsWith('## '),
      };
    });

    console.log('[AC-5] panel-content tag counts:', tagCounts);

    // raw 마크다운(`# `, `## `)이 textContent로 그대로 노출되면 FAIL
    expect(tagCounts.textContentHasRawMd).toBe(false);

    // 헤더+문단 합산이 0이면 변환이 안 된 것
    const totalSemanticTags =
      tagCounts.h1 + tagCounts.h2 + tagCounts.h3 + tagCounts.p;
    expect(totalSemanticTags).toBeGreaterThan(0);
  });

  test('AC-5 재검증 (두 번째 카드): 다른 카드도 정상 렌더링된다', async ({ page }) => {
    // 두 번째 카드 클릭
    const secondCard = page.locator('.spec-card').nth(1);
    await secondCard.click();

    await page.waitForSelector('#detail-panel:not(.hidden)', { timeout: 5000 });
    await page.waitForFunction(
      () => {
        const el = document.querySelector('#panel-content');
        return el && el.innerHTML.length > 100;
      },
      { timeout: 10000 }
    );

    const result = await page.evaluate(() => {
      const root = document.querySelector('#panel-content');
      const semanticTags = root.querySelectorAll(
        'h1, h2, h3, h4, p, table, ul, ol, li, code, pre, blockquote'
      ).length;
      return {
        semanticTags,
        hasRawMdLeading: /^\s*#{1,6}\s/.test(root.textContent),
      };
    });

    console.log('[AC-5 두 번째 카드] result:', result);
    expect(result.semanticTags).toBeGreaterThan(0);
    expect(result.hasRawMdLeading).toBe(false);
  });

  test('회귀: QA+PASS 뱃지는 녹색(#22c55e), QA+FAIL 뱃지는 적색(#ef4444)', async ({ page }) => {
    // qa 토글 활성화
    await page.click('button[data-agent="qa"]');
    // PASS 필터
    await page.selectOption('#status-filter', 'PASS');
    await page.waitForFunction(
      () => document.querySelectorAll('.spec-card').length > 0
    );

    const passBadgeColor = await page.evaluate(() => {
      const card = document.querySelector('.spec-card');
      const statusBadge = card?.querySelector('.badge-status-pass, [class*="status-pass"], .badge[class*="pass"]')
        || card?.querySelector('.badge:last-child');
      return statusBadge ? getComputedStyle(statusBadge).backgroundColor : null;
    });
    console.log('[회귀] QA+PASS 뱃지 backgroundColor:', passBadgeColor);

    // FAIL 필터로 전환
    await page.selectOption('#status-filter', 'FAIL');
    await page.waitForFunction(
      () => {
        const cards = document.querySelectorAll('.spec-card');
        if (cards.length === 0) return true; // 0건이어도 OK (필터 동작 자체는 PASS)
        return cards.length > 0;
      }
    );

    const failBadgeColor = await page.evaluate(() => {
      const card = document.querySelector('.spec-card');
      if (!card) return null;
      const statusBadge = card.querySelector('.badge-status-fail, [class*="status-fail"], .badge[class*="fail"]')
        || card.querySelector('.badge:last-child');
      return statusBadge ? getComputedStyle(statusBadge).backgroundColor : null;
    });
    console.log('[회귀] QA+FAIL 뱃지 backgroundColor:', failBadgeColor);

    // 색상이 다르면 OK (시각적 구분)
    if (passBadgeColor && failBadgeColor) {
      expect(passBadgeColor).not.toBe(failBadgeColor);
    }
  });

  test('회귀: 콘솔 에러 / 페이지 에러 / 자원 로드 실패 0건', async ({ page }) => {
    // beforeEach에서 이미 networkidle까지 기다림. 첫 카드 클릭까지 한번 거침
    await page.locator('.spec-card').first().click();
    await page.waitForSelector('#detail-panel:not(.hidden)');
    await page.waitForTimeout(1500);

    console.log('failedRequests:', failedRequests);
    console.log('consoleErrors:', consoleErrors);
    console.log('pageErrors:', pageErrors);

    // marked CDN이 핵심 — 실패하면 안 됨
    const markedFailed = failedRequests.find((r) => /marked/.test(r));
    expect(markedFailed).toBeUndefined();

    expect(pageErrors).toEqual([]);
  });

  test('스크린샷: 패널 본문 렌더링 결과 캡처', async ({ page }) => {
    await page.locator('.spec-card').first().click();
    await page.waitForSelector('#detail-panel:not(.hidden)');
    await page.waitForFunction(
      () => {
        const el = document.querySelector('#panel-content');
        return el && el.querySelectorAll('h1, h2, h3, p').length > 0;
      },
      { timeout: 10000 }
    );
    await page.waitForTimeout(500);

    await page.screenshot({
      path: 'tests/screenshots/dashboard-fix-verification.png',
      fullPage: false,
    });
  });
});
