/**
 * @fileoverview Lazy Slime Studio Mockup - 공통 유틸리티
 */

const App = {
  /**
   * 탭 전환 초기화
   * @param {string} containerSelector - 탭 컨테이너 선택자
   */
  initTabs(containerSelector = '.tabs') {
    document.querySelectorAll(containerSelector).forEach(tabBar => {
      tabBar.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const target = btn.dataset.tab;
          tabBar.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const parent = tabBar.parentElement;
          parent.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
          const el = parent.querySelector(`#${target}`);
          if (el) el.classList.add('active');
        });
      });
    });
  },

  /**
   * 필터 버튼 초기화
   * @param {string} selector - 필터 바 선택자
   * @param {Function} callback - 필터 변경 시 콜백
   */
  initFilters(selector, callback) {
    const bar = document.querySelector(selector);
    if (!bar) return;
    bar.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.dataset.filter === 'all') {
          bar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
        } else {
          bar.querySelector('[data-filter="all"]')?.classList.remove('active');
          btn.classList.toggle('active');
        }
        const active = [...bar.querySelectorAll('.filter-btn.active')].map(b => b.dataset.filter);
        callback(active.length === 0 ? ['all'] : active);
      });
    });
  },

  /**
   * 모달 열기/닫기
   * @param {string} modalId - 모달 요소 ID
   * @param {boolean} show - 표시 여부
   */
  modal(modalId, show) {
    const el = document.getElementById(modalId);
    if (!el) return;
    if (show) {
      el.classList.add('active');
      el.addEventListener('click', e => {
        if (e.target === el) App.modal(modalId, false);
      });
    } else {
      el.classList.remove('active');
    }
  },

  /**
   * 스탯 바 HTML 생성
   * @param {Object} stats - 스탯 객체 { HP: 25, MP: 8, ... }
   * @param {Object} maxStats - 최대값 객체 (스케일 기준)
   * @param {Object} [colors] - 스탯별 색상
   * @returns {string} HTML 문자열
   */
  renderStatBars(stats, maxStats, colors = {}) {
    const defaultColors = {
      HP: '#4ae88a', MP: '#4a9eff', ATK: '#e85d3a',
      DEF: '#d4a843', MATK: '#9a6aff', MDEF: '#6a4aff',
      SPD: '#4ae8e8', MOV: '#ff9a4a'
    };
    const c = { ...defaultColors, ...colors };
    return Object.entries(stats).map(([key, val]) => {
      const max = maxStats[key] || 50;
      const pct = Math.min((val / max) * 100, 100);
      return `<div class="stat-bar">
        <span class="label">${key}</span>
        <div class="bar"><div class="bar-fill" style="width:${pct}%;background:${c[key] || '#888'}"></div></div>
        <span class="value">${val}</span>
      </div>`;
    }).join('');
  },

  /**
   * 스프라이트 8방향 뷰어 초기화
   * @param {HTMLCanvasElement} canvas - 대상 캔버스
   * @param {Object} spriteData - { directions: { north: 'url', ... } }
   * @param {number} scale - 확대 배율
   */
  initSpriteViewer(canvas, spriteData, scale = 6) {
    const ctx = canvas.getContext('2d');
    const dirs = ['north-west','north','north-east','west','','east','south-west','south','south-east'];
    let current = 'south';
    let autoRotate = true;
    let dirIndex = 7; // south

    function draw(dir) {
      const img = spriteData.images?.[dir];
      if (!img) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#5a5a6a';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('No sprite', canvas.width / 2, canvas.height / 2);
        return;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    }

    // 자동 회전
    const allDirs = ['south','south-west','west','north-west','north','north-east','east','south-east'];
    if (autoRotate && spriteData.images) {
      let i = 0;
      setInterval(() => {
        current = allDirs[i % allDirs.length];
        draw(current);
        // 활성 방향 버튼 갱신
        const btns = canvas.closest('.sprite-viewer')?.querySelectorAll('.dir-btn');
        btns?.forEach(b => {
          b.classList.toggle('active', b.dataset.dir === current);
        });
        i++;
      }, 500);
    }

    return { draw, setCurrent: d => { current = d; draw(d); } };
  },

  /**
   * 이미지 프리로드
   * @param {string[]} urls - 이미지 URL 배열
   * @returns {Promise<Object>} url->Image 맵
   */
  async preloadImages(urls) {
    const map = {};
    await Promise.all(urls.map(url => new Promise((resolve) => {
      const img = new Image();
      img.onload = () => { map[url] = img; resolve(); };
      img.onerror = () => resolve();
      img.src = url;
    })));
    return map;
  }
};
