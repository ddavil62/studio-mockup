/**
 * @fileoverview Spec Dashboard 클라이언트 로직.
 * index.json을 fetch하여 카드 그리드로 렌더링하고, 필터/검색/상세 패널을
 * 관리한다. lazyslimestudio가 private 레포라서 raw_url fetch 대신 index.json
 * 안에 임베드된 content 필드를 사용해 마크다운을 렌더링한다.
 */

(() => {
  'use strict';

  // ── 정적 메타 데이터 ──
  /** 프로젝트 칩에 표시될 순서/표시명 */
  const PROJECT_LIST = [
    'kitchen-chaos',
    'neon-exodus',
    'ember-throne',
    'fantasydefence',
    'neon-factory',
    'contrail',
    'unknown',
  ];

  /** 에이전트 표시 순서 (HTML과 동일) */
  const AGENT_LIST = ['planner', 'coder', 'qa', 'art-director', 'other'];

  // ── 상태 ──
  /** 전체 항목 (서버 응답) */
  let allItems = [];

  /** 필터 상태. 빈 배열은 "해당 차원 미적용"을 의미한다. */
  const filters = {
    projects: [],
    agents: [],
    status: 'all',
    dateFrom: '',
    dateTo: '',
    keyword: '',
  };

  // ── DOM 캐시 ──
  /** 빈번히 접근되는 DOM 노드 */
  const $ = (sel) => document.querySelector(sel);
  const dom = {
    cardList: null,
    totalCount: null,
    generatedAt: null,
    projectFilter: null,
    agentFilter: null,
    statusFilter: null,
    dateFrom: null,
    dateTo: null,
    keywordInput: null,
    resetBtn: null,
    quickRow: null,
    panel: null,
    panelOverlay: null,
    panelClose: null,
    panelContent: null,
    panelProject: null,
    panelAgent: null,
    panelStatus: null,
    panelFilename: null,
    panelDate: null,
  };

  // ── 유틸 ──

  /**
   * 안전하게 텍스트를 escape하여 HTML로 삽입할 수 있게 한다.
   * @param {string} s
   * @returns {string}
   */
  function esc(s) {
    return String(s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * YYYY-MM-DD 문자열을 Date로 파싱. 'unknown'/잘못된 값은 null.
   * @param {string} s
   * @returns {Date|null}
   */
  function parseDate(s) {
    if (!s || s === 'unknown') return null;
    const d = new Date(s + 'T00:00:00');
    return isNaN(d.getTime()) ? null : d;
  }

  /**
   * Date 객체를 YYYY-MM-DD 문자열로 변환.
   * @param {Date} d
   * @returns {string}
   */
  function fmtDate(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  // ── 초기화 ──

  /**
   * DOM 노드를 캐시하고 기본 이벤트를 바인딩한다.
   */
  function bindDom() {
    dom.cardList = $('#card-list');
    dom.totalCount = $('#total-count');
    dom.generatedAt = $('#generated-at');
    dom.projectFilter = $('#project-filter');
    dom.agentFilter = $('#agent-filter');
    dom.statusFilter = $('#status-filter');
    dom.dateFrom = $('#date-from');
    dom.dateTo = $('#date-to');
    dom.keywordInput = $('#keyword-input');
    dom.resetBtn = $('#reset-btn');
    dom.quickRow = document.querySelector('#filter-bar .toggle-row');
    dom.panel = $('#detail-panel');
    dom.panelOverlay = $('#panel-overlay');
    dom.panelClose = $('#panel-close');
    dom.panelContent = $('#panel-content');
    dom.panelProject = $('#panel-project');
    dom.panelAgent = $('#panel-agent');
    dom.panelStatus = $('#panel-status');
    dom.panelFilename = $('#panel-filename');
    dom.panelDate = $('#panel-date');
  }

  /**
   * 프로젝트 칩들을 동적으로 그리고 토글 이벤트를 바인딩한다.
   */
  function renderProjectChips() {
    const html = PROJECT_LIST.map((proj) => `
      <span class="proj-chip badge-proj-${proj}" data-project="${esc(proj)}">
        <span class="dot"></span>${esc(proj)}
      </span>
    `).join('');
    dom.projectFilter.innerHTML = html;

    dom.projectFilter.addEventListener('click', (e) => {
      const chip = e.target.closest('.proj-chip');
      if (!chip) return;
      const proj = chip.dataset.project;
      const idx = filters.projects.indexOf(proj);
      if (idx >= 0) {
        filters.projects.splice(idx, 1);
        chip.classList.remove('active');
      } else {
        filters.projects.push(proj);
        chip.classList.add('active');
      }
      applyAndRender();
    });
  }

  /**
   * 에이전트 토글, 빠른 기간, 상태/날짜/키워드/리셋 등 모든 컨트롤 이벤트 바인딩.
   */
  function bindFilterEvents() {
    // 에이전트 토글
    dom.agentFilter.addEventListener('click', (e) => {
      const btn = e.target.closest('.toggle-btn');
      if (!btn) return;
      const agent = btn.dataset.agent;
      const idx = filters.agents.indexOf(agent);
      if (idx >= 0) {
        filters.agents.splice(idx, 1);
        btn.classList.remove('active');
      } else {
        filters.agents.push(agent);
        btn.classList.add('active');
      }
      applyAndRender();
    });

    // 상태 select
    dom.statusFilter.addEventListener('change', () => {
      filters.status = dom.statusFilter.value;
      applyAndRender();
    });

    // 날짜 입력
    dom.dateFrom.addEventListener('change', () => {
      filters.dateFrom = dom.dateFrom.value;
      clearQuickButtons();
      applyAndRender();
    });
    dom.dateTo.addEventListener('change', () => {
      filters.dateTo = dom.dateTo.value;
      clearQuickButtons();
      applyAndRender();
    });

    // 빠른 기간 버튼
    document.querySelectorAll('.quick-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const days = Number(btn.dataset.days);
        document.querySelectorAll('.quick-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        if (days === 0) {
          filters.dateFrom = '';
          filters.dateTo = '';
        } else {
          const today = new Date();
          const past = new Date();
          past.setDate(today.getDate() - days);
          filters.dateFrom = fmtDate(past);
          filters.dateTo = fmtDate(today);
        }
        dom.dateFrom.value = filters.dateFrom;
        dom.dateTo.value = filters.dateTo;
        applyAndRender();
      });
    });

    // 키워드 검색 (debounce)
    let kwTimer = null;
    dom.keywordInput.addEventListener('input', () => {
      clearTimeout(kwTimer);
      kwTimer = setTimeout(() => {
        filters.keyword = dom.keywordInput.value.trim().toLowerCase();
        applyAndRender();
      }, 150);
    });

    // 초기화
    dom.resetBtn.addEventListener('click', resetFilters);

    // 패널 닫기
    dom.panelClose.addEventListener('click', closePanel);
    dom.panelOverlay.addEventListener('click', closePanel);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !dom.panel.classList.contains('hidden')) {
        closePanel();
      }
    });
  }

  /**
   * 빠른 기간 버튼의 active 표시를 모두 제거한다.
   * 사용자가 직접 날짜를 입력하면 호출된다.
   */
  function clearQuickButtons() {
    document.querySelectorAll('.quick-btn').forEach((b) => b.classList.remove('active'));
  }

  /**
   * 모든 필터를 초기 상태로 되돌리고 UI도 리셋한다.
   */
  function resetFilters() {
    filters.projects = [];
    filters.agents = [];
    filters.status = 'all';
    filters.dateFrom = '';
    filters.dateTo = '';
    filters.keyword = '';

    document.querySelectorAll('.proj-chip.active').forEach((c) => c.classList.remove('active'));
    document.querySelectorAll('.toggle-btn.active').forEach((c) => c.classList.remove('active'));
    clearQuickButtons();
    dom.statusFilter.value = 'all';
    dom.dateFrom.value = '';
    dom.dateTo.value = '';
    dom.keywordInput.value = '';

    applyAndRender();
  }

  // ── 데이터 로드 ──

  /**
   * index.json을 fetch하여 allItems에 저장한다.
   */
  async function loadIndex() {
    try {
      // 13MB+ 가량 fetch이므로 진입 즉시 명확한 대기 안내를 띄운다 (AD3 P1).
      if (dom.cardList) {
        dom.cardList.innerHTML = `
          <div class="empty-state">
            index.json 로딩 중... 최초 1회 수초 소요될 수 있습니다.
          </div>
        `;
      }
      // 캐시 무력화 (같은 세션에서도 재인덱싱 반영)
      const res = await fetch(`./index.json?v=${Date.now()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      allItems = data.items || [];

      if (dom.generatedAt && data.generated_at) {
        const gd = new Date(data.generated_at);
        const formatted = isNaN(gd.getTime())
          ? data.generated_at
          : `${gd.getFullYear()}-${String(gd.getMonth() + 1).padStart(2, '0')}-${String(gd.getDate()).padStart(2, '0')} ${String(gd.getHours()).padStart(2, '0')}:${String(gd.getMinutes()).padStart(2, '0')}`;
        dom.generatedAt.textContent = `갱신: ${formatted}`;
      }
    } catch (err) {
      console.error('index.json 로드 실패:', err);
      dom.cardList.innerHTML = `
        <div class="empty-state">
          index.json을 불러오지 못했습니다. (${esc(err.message)})<br>
          <small>로컬에서 열었다면 정적 서버를 사용해주세요. 예: <code>npx serve studio-mockup</code></small>
        </div>
      `;
      throw err;
    }
  }

  // ── 필터 적용 ──

  /**
   * 현재 filters 상태에 따라 항목을 걸러내 반환한다.
   * @returns {object[]}
   */
  function applyFilters() {
    const fromD = parseDate(filters.dateFrom);
    const toD = parseDate(filters.dateTo);

    return allItems.filter((item) => {
      // 프로젝트 필터 (빈 배열은 전체 허용)
      if (filters.projects.length > 0 && !filters.projects.includes(item.project)) {
        return false;
      }
      // 에이전트 필터
      if (filters.agents.length > 0 && !filters.agents.includes(item.agent)) {
        return false;
      }
      // 상태 필터
      if (filters.status !== 'all' && item.status !== filters.status) {
        return false;
      }
      // 날짜 필터: unknown 날짜 항목은 from/to가 둘 다 비었을 때만 노출
      if (fromD || toD) {
        const itemD = parseDate(item.date);
        if (!itemD) return false;
        if (fromD && itemD < fromD) return false;
        if (toD && itemD > toD) return false;
      }
      // 키워드 (파일명/제목 부분 일치)
      if (filters.keyword) {
        const hay = `${item.filename} ${item.title}`.toLowerCase();
        if (!hay.includes(filters.keyword)) return false;
      }
      return true;
    });
  }

  /**
   * 필터 적용 후 카드 그리드를 다시 렌더한다.
   */
  function applyAndRender() {
    const filtered = applyFilters();
    renderCards(filtered);
    dom.totalCount.textContent = `${filtered.length} / ${allItems.length} items`;
  }

  // ── 렌더링 ──

  /**
   * 카드 그리드를 그린다. 1000건 이상은 첫 500개만 렌더해 성능을 보장하고
   * 안내 메시지를 추가한다.
   * @param {object[]} items
   */
  function renderCards(items) {
    if (items.length === 0) {
      dom.cardList.innerHTML = `<div class="empty-state">조건에 맞는 항목이 없습니다.</div>`;
      return;
    }

    const MAX_RENDER = 500;
    const slice = items.slice(0, MAX_RENDER);
    const truncatedNote = items.length > MAX_RENDER
      ? `<div class="empty-state" style="grid-column:1/-1;">${items.length}개 중 상위 ${MAX_RENDER}개만 표시됩니다. 필터로 좁혀주세요.</div>`
      : '';

    const html = slice.map((item, i) => cardHtml(item, i)).join('') + truncatedNote;
    dom.cardList.innerHTML = html;

    // 카드 클릭 → 상세 패널 (data-idx는 slice 배열 기준 인덱스)
    dom.cardList.querySelectorAll('.spec-card').forEach((el) => {
      el.addEventListener('click', () => {
        const idx = Number(el.dataset.idx);
        const item = slice[idx];
        if (item) openPanel(item);
      });
    });
  }

  /**
   * 단일 항목을 카드 HTML로 변환한다.
   * @param {object} item
   * @param {number} idx 슬라이스 내 인덱스 (클릭 핸들러 매핑용)
   * @returns {string}
   */
  function cardHtml(item, idx) {
    // QA 에이전트는 뱃지 색이 status에 따라 달라지도록 badge-status-{status} 클래스를 병기한다.
    const agentStatusClass = (item.agent === 'qa' && item.status && item.status !== 'NA')
      ? ` badge-status-${esc(item.status)}`
      : '';
    return `
      <article class="spec-card" data-filename="${esc(item.filename)}" data-idx="${idx}">
        <div class="spec-card-meta">
          <span class="badge badge-proj-${esc(item.project)}">${esc(item.project)}</span>
          <span class="badge badge-agent-${esc(item.agent)}${agentStatusClass}">${esc(item.agent)}</span>
          ${item.status && item.status !== 'NA' ? `<span class="badge badge-status-${esc(item.status)}">${esc(item.status)}</span>` : ''}
          <span class="spec-card-date">${esc(item.date)}</span>
        </div>
        <div class="spec-card-title">${esc(item.title)}</div>
        <div class="spec-card-filename">${esc(item.filename)}</div>
        <div class="spec-card-excerpt">${esc(item.excerpt || '')}</div>
      </article>
    `;
  }

  // ── 상세 패널 ──

  /**
   * 카드 클릭 시 상세 패널을 열고 마크다운을 렌더한다.
   * private 레포라서 raw_url fetch는 시도하지 않고 index.json에 임베드된
   * content를 사용한다. content 필드가 없으면 raw_url로 폴백.
   * @param {object} item
   */
  async function openPanel(item) {
    dom.panelProject.textContent = item.project;
    dom.panelProject.className = `badge badge-proj-${item.project}`;
    dom.panelAgent.textContent = item.agent;
    // QA 에이전트는 뱃지 색이 status에 따라 달라지도록 badge-status-{status}를 병기한다.
    const panelAgentStatusClass = (item.agent === 'qa' && item.status && item.status !== 'NA')
      ? ` badge-status-${item.status}`
      : '';
    dom.panelAgent.className = `badge badge-agent-${item.agent}${panelAgentStatusClass}`;
    if (item.status && item.status !== 'NA') {
      dom.panelStatus.textContent = item.status;
      dom.panelStatus.className = `badge badge-status-${item.status}`;
      dom.panelStatus.style.display = '';
    } else {
      dom.panelStatus.style.display = 'none';
    }
    dom.panelFilename.textContent = item.filename;
    dom.panelDate.textContent = item.date;
    dom.panelContent.innerHTML = '<p style="color:var(--text-muted)">로딩 중…</p>';

    dom.panel.classList.remove('hidden');
    dom.panelOverlay.classList.remove('hidden');
    dom.panelContent.scrollTop = 0;

    let mdText = item.content;
    if (!mdText) {
      // content가 없을 때만 raw_url 폴백 (public 레포 가정)
      try {
        const res = await fetch(item.raw_url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        mdText = await res.text();
      } catch (err) {
        dom.panelContent.innerHTML = `
          <p style="color:var(--accent-red)">본문 로드 실패: ${esc(err.message)}</p>
          <p style="color:var(--text-muted)">private 레포라면 인덱서를 다시 실행해 content를 임베드해 주세요.</p>
        `;
        return;
      }
    }

    // marked.js로 렌더링
    try {
      // marked v5+ 호환 (parse는 동기/비동기 모두 OK)
      const html = (typeof marked === 'object' && marked.parse)
        ? marked.parse(mdText)
        : marked(mdText);
      dom.panelContent.innerHTML = html;
    } catch (err) {
      dom.panelContent.textContent = mdText;
    }
  }

  /**
   * 상세 패널을 닫는다.
   */
  function closePanel() {
    dom.panel.classList.add('hidden');
    dom.panelOverlay.classList.add('hidden');
  }

  // ── 부트스트랩 ──
  document.addEventListener('DOMContentLoaded', async () => {
    bindDom();
    renderProjectChips();
    bindFilterEvents();

    // 빠른 필터 "전체" 기본 선택
    document.querySelector('.quick-btn[data-days="0"]').classList.add('active');

    try {
      await loadIndex();
      applyAndRender();
    } catch {
      // 에러는 loadIndex에서 이미 표시됨
    }
  });

})();
