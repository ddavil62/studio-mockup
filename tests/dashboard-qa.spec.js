/**
 * @fileoverview Spec Dashboard QA 테스트.
 * AC-1 ~ AC-6 + 능동 엣지 탐색을 검증한다.
 */

const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:8765/dashboard/';
const SCREENSHOT_DIR = 'tests/screenshots';

test.describe.configure({ mode: 'serial' });

test.describe('Spec Dashboard QA', () => {
  let consoleErrors = [];
  let pageErrors = [];

  test.beforeEach(async ({ page }) => {
    consoleErrors = [];
    pageErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', (err) => pageErrors.push(err.message));

    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    // index.json 로드 대기 (13MB)
    await page.waitForFunction(
      () => {
        const total = document.getElementById('total-count');
        return total && /\d+ \/ \d+/.test(total.textContent);
      },
      { timeout: 30000 }
    );
  });

  // ── AC-6: 페이지 로딩 ──
  test('AC-6: 페이지가 깨짐 없이 로드된다 (콘솔 에러 0)', async ({ page }) => {
    const totalText = await page.locator('#total-count').textContent();
    expect(totalText).toMatch(/\d+ \/ \d+ items/);
    // 1629 items 확인
    expect(totalText).toContain('/ 1629');

    await page.screenshot({ path: `${SCREENSHOT_DIR}/dashboard-initial-load.png`, fullPage: false });

    // 콘솔 에러 확인 (단, marked CDN 차단은 환경 이슈로 별도 분류)
    const significantErrors = consoleErrors.filter(
      (e) => !/marked|unpkg|ORB/i.test(e)
    );
    console.log('Console errors:', consoleErrors);
    console.log('Page errors:', pageErrors);
    expect(pageErrors).toEqual([]);
    expect(significantErrors).toEqual([]);
  });

  // ── AC-1: 프로젝트 필터 ──
  test('AC-1: 프로젝트 필터(kitchen-chaos) 동작', async ({ page }) => {
    const beforeCount = await page.evaluate(() => {
      return document.querySelectorAll('.spec-card').length;
    });

    await page.click('.proj-chip[data-project="kitchen-chaos"]');
    await page.waitForTimeout(300);

    const cards = await page.$$('.spec-card');
    expect(cards.length).toBeGreaterThan(0);

    // 모든 카드가 kitchen-chaos 인지 확인
    const allKC = await page.evaluate(() => {
      const cards = document.querySelectorAll('.spec-card .badge-proj-kitchen-chaos');
      const allCardsCount = document.querySelectorAll('.spec-card').length;
      return { kc: cards.length, total: allCardsCount };
    });
    expect(allKC.kc).toBe(allKC.total);

    const totalText = await page.locator('#total-count').textContent();
    console.log('AC-1 kitchen-chaos filter:', totalText);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/dashboard-ac1-project-filter.png` });
  });

  // ── AC-2: 날짜 빠른 필터 ──
  test('AC-2: 빠른 기간 필터(최근 7일) 동작', async ({ page }) => {
    await page.click('.quick-btn[data-days="7"]');
    await page.waitForTimeout(300);

    // active 클래스 확인
    const isActive = await page.locator('.quick-btn[data-days="7"]').evaluate(
      (el) => el.classList.contains('active')
    );
    expect(isActive).toBe(true);

    // 날짜 from/to 자동 설정 확인
    const fromVal = await page.locator('#date-from').inputValue();
    const toVal = await page.locator('#date-to').inputValue();
    expect(fromVal).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(toVal).toMatch(/^\d{4}-\d{2}-\d{2}$/);

    const totalText = await page.locator('#total-count').textContent();
    console.log('AC-2 7일 필터:', totalText);
    expect(totalText).not.toContain('1629 / 1629');
    await page.screenshot({ path: `${SCREENSHOT_DIR}/dashboard-ac2-quick-7days.png` });
  });

  test('AC-2b: 직접 날짜 입력 시 빠른 필터 active 해제', async ({ page }) => {
    await page.click('.quick-btn[data-days="30"]');
    await page.waitForTimeout(300);
    let isActive = await page.locator('.quick-btn[data-days="30"]').evaluate(
      (el) => el.classList.contains('active')
    );
    expect(isActive).toBe(true);

    // 날짜 직접 입력
    await page.locator('#date-from').fill('2026-04-01');
    await page.locator('#date-from').dispatchEvent('change');
    await page.waitForTimeout(300);

    isActive = await page.locator('.quick-btn[data-days="30"]').evaluate(
      (el) => el.classList.contains('active')
    );
    expect(isActive).toBe(false);
  });

  // ── AC-3: 에이전트 필터 ──
  test('AC-3: 에이전트 필터(qa) 동작', async ({ page }) => {
    await page.click('.toggle-btn[data-agent="qa"]');
    await page.waitForTimeout(300);

    const allQa = await page.evaluate(() => {
      const cards = document.querySelectorAll('.spec-card');
      let qaCount = 0;
      let nonQaCount = 0;
      cards.forEach((card) => {
        if (card.querySelector('.badge-agent-qa')) qaCount++;
        else nonQaCount++;
      });
      return { qa: qaCount, nonQa: nonQaCount, total: cards.length };
    });
    expect(allQa.qa).toBe(allQa.total);
    expect(allQa.nonQa).toBe(0);

    const totalText = await page.locator('#total-count').textContent();
    console.log('AC-3 qa 필터:', totalText);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/dashboard-ac3-agent-qa.png` });
  });

  // ── AC-4: 상태 필터 ──
  test('AC-4: 상태 필터(PASS) 동작', async ({ page }) => {
    await page.selectOption('#status-filter', 'PASS');
    await page.waitForTimeout(300);

    const allPass = await page.evaluate(() => {
      const cards = document.querySelectorAll('.spec-card');
      let passCount = 0;
      cards.forEach((card) => {
        // PASS 상태 뱃지가 카드에 있는지 또는 PASS 텍스트
        const meta = card.querySelector('.spec-card-meta');
        if (meta && meta.textContent.includes('PASS')) passCount++;
      });
      return { pass: passCount, total: cards.length };
    });
    expect(allPass.pass).toBe(allPass.total);
    expect(allPass.total).toBeGreaterThan(0);

    const totalText = await page.locator('#total-count').textContent();
    console.log('AC-4 PASS 필터:', totalText);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/dashboard-ac4-status-pass.png` });
  });

  test('AC-4b: 상태 필터(FAIL) 동작', async ({ page }) => {
    await page.selectOption('#status-filter', 'FAIL');
    await page.waitForTimeout(300);

    const totalText = await page.locator('#total-count').textContent();
    console.log('AC-4b FAIL 필터:', totalText);
    // 10건 정도라고 리포트에 명시됨
    const match = totalText.match(/(\d+) \/ \d+/);
    if (match) {
      const filtered = parseInt(match[1]);
      expect(filtered).toBeGreaterThan(0);
      expect(filtered).toBeLessThan(50);
    }
    await page.screenshot({ path: `${SCREENSHOT_DIR}/dashboard-ac4-status-fail.png` });
  });

  // ── AC-5: 카드 클릭 → 사이드 패널 ──
  test('AC-5: 카드 클릭 시 사이드 패널 슬라이드인 + 마크다운 렌더링', async ({ page }) => {
    // 첫 번째 카드 클릭
    const firstCard = page.locator('.spec-card').first();
    await expect(firstCard).toBeVisible();
    await firstCard.click();
    await page.waitForTimeout(500);

    // 패널이 열렸는지
    const panel = page.locator('#detail-panel');
    const isHidden = await panel.evaluate((el) => el.classList.contains('hidden'));
    expect(isHidden).toBe(false);

    // 마크다운 본문이 렌더링됐는지 (h1 또는 h2가 있어야)
    const hasContent = await page.evaluate(() => {
      const content = document.querySelector('#panel-content');
      return content && content.innerHTML.length > 100;
    });
    expect(hasContent).toBe(true);

    // 마크다운 헤더가 변환되었는지
    const hasHeader = await page.locator('#panel-content h1, #panel-content h2').count();
    console.log('Panel headers count:', hasHeader);

    await page.screenshot({ path: `${SCREENSHOT_DIR}/dashboard-ac5-panel-open.png` });

    // 닫기 버튼 크기 확인 (P1-1: 36×36)
    const closeBox = await page.locator('#panel-close').boundingBox();
    console.log('Close button size:', closeBox);
    expect(closeBox.width).toBeGreaterThanOrEqual(36);
    expect(closeBox.height).toBeGreaterThanOrEqual(36);

    // 닫기 동작
    await page.click('#panel-close');
    await page.waitForTimeout(400);
    const isHiddenAfterClose = await panel.evaluate((el) => el.classList.contains('hidden'));
    expect(isHiddenAfterClose).toBe(true);
  });

  // ── 능동 탐색: 13.5MB 로딩 안내 문구 ──
  test('능동: 초기 로딩 시 안내 문구 표시', async ({ page }) => {
    // 새 컨텍스트로 처음부터 진입하면서 안내 문구 캡처
    const newPage = await page.context().newPage();
    let earlyText = '';
    newPage.on('framenavigated', async () => {
      try {
        const t = await newPage.evaluate(() => {
          const el = document.querySelector('.empty-state');
          return el ? el.textContent.trim() : '';
        });
        if (t) earlyText = t;
      } catch {}
    });

    await newPage.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    // 진입 직후 즉시 캡처 시도
    const initialMsg = await newPage.evaluate(() => {
      const el = document.querySelector('.empty-state');
      return el ? el.textContent.trim() : '';
    });
    console.log('초기 로딩 안내:', initialMsg);
    // "로딩 중" 또는 "수초 소요" 문구
    expect(initialMsg).toMatch(/로딩|수초/);

    await newPage.close();
  });

  // ── 능동 탐색: 0건 빈 결과 ──
  test('능동: 결과 0건 시 빈 상태 메시지', async ({ page }) => {
    // ember-throne + art-director + FAIL은 매치 0
    await page.click('.proj-chip[data-project="ember-throne"]');
    await page.waitForTimeout(200);
    await page.click('.toggle-btn[data-agent="art-director"]');
    await page.waitForTimeout(200);
    await page.selectOption('#status-filter', 'FAIL');
    await page.waitForTimeout(300);

    const emptyMsg = await page.evaluate(() => {
      const el = document.querySelector('.empty-state');
      return el ? el.textContent.trim() : null;
    });
    console.log('빈 결과 메시지:', emptyMsg);
    expect(emptyMsg).toContain('조건에 맞는 항목이 없습니다');

    await page.screenshot({ path: `${SCREENSHOT_DIR}/dashboard-edge-empty-state.png` });
  });

  // ── 능동 탐색: MAX_RENDER 500 제한 ──
  test('능동: 1629건 중 500건만 렌더 + 안내', async ({ page }) => {
    // 필터 미적용 상태
    const totalText = await page.locator('#total-count').textContent();
    expect(totalText).toContain('/ 1629');

    const cardCount = await page.locator('.spec-card').count();
    console.log('Rendered card count:', cardCount);
    expect(cardCount).toBe(500);

    // 안내 메시지 확인 (empty-state에 grid-column 스타일 적용)
    const truncMsg = await page.evaluate(() => {
      const els = document.querySelectorAll('.empty-state');
      for (const el of els) {
        if (el.textContent.includes('상위') || el.textContent.includes('500')) {
          return el.textContent.trim();
        }
      }
      return null;
    });
    console.log('500 truncation msg:', truncMsg);
    expect(truncMsg).toMatch(/500/);
    expect(truncMsg).toMatch(/필터/);
  });

  // ── 능동 탐색: 차단 키워드(purpose) 파일 인덱싱 ──
  test('능동: purpose 키워드 파일 카드 표시 + 클릭 정상', async ({ page }) => {
    // 키워드 검색으로 purpose 파일 찾기
    await page.fill('#keyword-input', 'purpose');
    await page.waitForTimeout(400);

    const totalText = await page.locator('#total-count').textContent();
    const match = totalText.match(/(\d+) \/ \d+/);
    const filtered = match ? parseInt(match[1]) : 0;
    console.log('purpose 검색 결과:', totalText);
    expect(filtered).toBeGreaterThan(100); // 270건 정도

    // 첫 카드 클릭 → 본문 렌더링
    await page.locator('.spec-card').first().click();
    await page.waitForTimeout(600);

    const panelText = await page.locator('#panel-content').textContent();
    expect(panelText.length).toBeGreaterThan(100);
    console.log('purpose 파일 본문 길이:', panelText.length);

    await page.screenshot({ path: `${SCREENSHOT_DIR}/dashboard-edge-purpose-file.png` });
  });

  // ── 능동 탐색: QA 뱃지 색상 분기 (P0) ──
  test('능동(P0): QA + PASS 뱃지는 녹색, QA + FAIL 뱃지는 적색', async ({ page }) => {
    // qa + PASS
    await page.click('.toggle-btn[data-agent="qa"]');
    await page.waitForTimeout(200);
    await page.selectOption('#status-filter', 'PASS');
    await page.waitForTimeout(300);

    const passBadgeColor = await page.evaluate(() => {
      const card = document.querySelector('.spec-card .badge-agent-qa');
      if (!card) return null;
      return getComputedStyle(card).color;
    });
    console.log('QA+PASS badge color:', passBadgeColor);
    // #22c55e = rgb(34, 197, 94)
    expect(passBadgeColor).toBe('rgb(34, 197, 94)');

    await page.screenshot({ path: `${SCREENSHOT_DIR}/dashboard-edge-qa-pass-badge.png` });

    // qa + FAIL
    await page.selectOption('#status-filter', 'FAIL');
    await page.waitForTimeout(300);

    const failBadgeColor = await page.evaluate(() => {
      const card = document.querySelector('.spec-card .badge-agent-qa');
      if (!card) return null;
      return getComputedStyle(card).color;
    });
    console.log('QA+FAIL badge color:', failBadgeColor);
    // #ef4444 = rgb(239, 68, 68)
    expect(failBadgeColor).toBe('rgb(239, 68, 68)');

    await page.screenshot({ path: `${SCREENSHOT_DIR}/dashboard-edge-qa-fail-badge.png` });
  });

  // ── 능동 탐색: 검색 debounce ──
  test('능동: 키워드 검색 150ms debounce', async ({ page }) => {
    const renderCount = await page.evaluate(() => {
      window.__renderHits = 0;
      const original = document.querySelector('#card-list');
      // MutationObserver로 innerHTML 변경 횟수 측정
      const obs = new MutationObserver(() => { window.__renderHits++; });
      obs.observe(original, { childList: true });
      window.__obs = obs;
      return 0;
    });

    // 빠르게 5글자 입력
    const input = page.locator('#keyword-input');
    await input.fill('');
    await page.waitForTimeout(200);
    await page.evaluate(() => { window.__renderHits = 0; });

    await input.type('phase', { delay: 30 }); // 5글자 × 30ms = 150ms 미만
    await page.waitForTimeout(50); // debounce 직전
    const hitsBeforeDebounce = await page.evaluate(() => window.__renderHits);
    console.log('debounce 이전 렌더 횟수:', hitsBeforeDebounce);

    await page.waitForTimeout(300); // debounce 이후
    const hitsAfter = await page.evaluate(() => window.__renderHits);
    console.log('debounce 이후 렌더 횟수:', hitsAfter);

    // debounce가 작동하면 5번이 아닌 1번만 렌더되어야 함
    // 첫 글자 키 다운 시점부터 마지막까지 ~150ms 내 들어가면 1회만 렌더
    expect(hitsAfter).toBeLessThanOrEqual(2);
  });

  // ── 능동 탐색: 사이드 패널 ESC 닫기 ──
  test('능동: ESC 키로 패널 닫힌다', async ({ page }) => {
    await page.locator('.spec-card').first().click();
    await page.waitForTimeout(400);

    let isHidden = await page.locator('#detail-panel').evaluate(
      (el) => el.classList.contains('hidden')
    );
    expect(isHidden).toBe(false);

    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);

    isHidden = await page.locator('#detail-panel').evaluate(
      (el) => el.classList.contains('hidden')
    );
    expect(isHidden).toBe(true);
  });

  // ── 능동 탐색: 오버레이 클릭으로 닫기 ──
  test('능동: overlay 클릭으로 패널 닫힌다', async ({ page }) => {
    await page.locator('.spec-card').first().click();
    await page.waitForTimeout(400);

    await page.locator('#panel-overlay').click({ force: true });
    await page.waitForTimeout(400);

    const isHidden = await page.locator('#detail-panel').evaluate(
      (el) => el.classList.contains('hidden')
    );
    expect(isHidden).toBe(true);
  });

  // ── 능동 탐색: 필터 초기화 ──
  test('능동: 필터 초기화 버튼 동작', async ({ page }) => {
    // 필터 적용
    await page.click('.proj-chip[data-project="kitchen-chaos"]');
    await page.click('.toggle-btn[data-agent="qa"]');
    await page.selectOption('#status-filter', 'PASS');
    await page.fill('#keyword-input', 'phase');
    await page.waitForTimeout(400);

    // 초기화
    await page.click('#reset-btn');
    await page.waitForTimeout(300);

    const totalText = await page.locator('#total-count').textContent();
    expect(totalText).toContain('1629 / 1629');

    // 모든 active 클래스 제거 확인
    const activeChips = await page.locator('.proj-chip.active').count();
    const activeToggles = await page.locator('.toggle-btn.active').count();
    expect(activeChips).toBe(0);
    expect(activeToggles).toBe(0);

    const statusVal = await page.locator('#status-filter').inputValue();
    expect(statusVal).toBe('all');
    const kwVal = await page.locator('#keyword-input').inputValue();
    expect(kwVal).toBe('');
  });

  // ── 시각적 검증 종합 ──
  test('시각: 필터 바 + 카드 그리드 풀 페이지 캡처', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.screenshot({ path: `${SCREENSHOT_DIR}/dashboard-full-1440.png`, fullPage: false });
  });
});
