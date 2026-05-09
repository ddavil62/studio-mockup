/**
 * @fileoverview Action Tool 와이어프레임 — 본 좌표 입력 + 가변 N 키프레임 + 발주/Export 시안
 * 시안 단계라 Mock 데이터로 동작한다. 실제 PixelLab 호출은 본 구현에서 백엔드로.
 */

// ── 상수 / 데이터 ─────────────────────────────────────────────────

/** 캔버스 크기 (px). 64×64 베이스를 8배 확대. */
const CANVAS_PX = 512;

/** 본 18종 라벨. PixelLab SkeletonLabel과 1:1 대응. */
const BONE_LABELS = [
  'NOSE', 'NECK',
  'LEFT EYE', 'RIGHT EYE', 'LEFT EAR', 'RIGHT EAR',
  'LEFT SHOULDER', 'RIGHT SHOULDER',
  'LEFT ELBOW', 'RIGHT ELBOW',
  'LEFT ARM', 'RIGHT ARM',
  'LEFT HIP', 'RIGHT HIP',
  'LEFT KNEE', 'RIGHT KNEE',
  'LEFT LEG', 'RIGHT LEG',
];

/**
 * 본 하이어라키 — 언리얼 스켈레톤 뷰어 스타일.
 * NECK이 root. depth는 들여쓰기 레벨.
 */
const BONE_HIERARCHY = {
  label: 'NECK',
  children: [
    {
      label: 'NOSE',
      children: [
        { label: 'LEFT EYE',  children: [] },
        { label: 'RIGHT EYE', children: [] },
        { label: 'LEFT EAR',  children: [] },
        { label: 'RIGHT EAR', children: [] },
      ],
    },
    {
      label: 'LEFT SHOULDER',
      children: [{
        label: 'LEFT ELBOW',
        children: [{ label: 'LEFT ARM', children: [] }],
      }],
    },
    {
      label: 'RIGHT SHOULDER',
      children: [{
        label: 'RIGHT ELBOW',
        children: [{ label: 'RIGHT ARM', children: [] }],
      }],
    },
    {
      label: 'LEFT HIP',
      children: [{
        label: 'LEFT KNEE',
        children: [{ label: 'LEFT LEG', children: [] }],
      }],
    },
    {
      label: 'RIGHT HIP',
      children: [{
        label: 'RIGHT KNEE',
        children: [{ label: 'RIGHT LEG', children: [] }],
      }],
    },
  ],
};

/** 골격 연결 — 본 시각화 라인. */
const SKELETON_BONES = [
  ['NOSE', 'NECK'],
  ['NECK', 'LEFT SHOULDER'], ['NECK', 'RIGHT SHOULDER'],
  ['LEFT SHOULDER', 'LEFT ELBOW'], ['LEFT ELBOW', 'LEFT ARM'],
  ['RIGHT SHOULDER', 'RIGHT ELBOW'], ['RIGHT ELBOW', 'RIGHT ARM'],
  ['NECK', 'LEFT HIP'], ['NECK', 'RIGHT HIP'],
  ['LEFT HIP', 'LEFT KNEE'], ['LEFT KNEE', 'LEFT LEG'],
  ['RIGHT HIP', 'RIGHT KNEE'], ['RIGHT KNEE', 'RIGHT LEG'],
];

/** 본 색상 — 부위별 그룹. */
const BONE_COLORS = {
  head: '#ff6a6a',
  neck: '#ffa84a',
  body: '#d4a843',
  arm:  '#4ae8e8',
  leg:  '#9a6aff',
};

function boneColor(label) {
  if (label === 'NOSE' || label.includes('EYE') || label.includes('EAR')) return BONE_COLORS.head;
  if (label === 'NECK') return BONE_COLORS.neck;
  if (label.includes('SHOULDER') || label.includes('HIP')) return BONE_COLORS.body;
  if (label.includes('ELBOW') || label.includes('ARM')) return BONE_COLORS.arm;
  if (label.includes('KNEE') || label.includes('LEG')) return BONE_COLORS.leg;
  return '#fff';
}

/** 라벨 → 자식 라벨 리스트(자기 + 모든 후손) 평탄화. */
function descendantLabels(node, acc = []) {
  acc.push(node.label);
  node.children.forEach(c => descendantLabels(c, acc));
  return acc;
}

/** 트리에서 라벨 노드 찾기. */
function findNode(label, node = BONE_HIERARCHY) {
  if (node.label === label) return node;
  for (const c of node.children) {
    const r = findNode(label, c);
    if (r) return r;
  }
  return null;
}

/** 프레임 길이 제한. */
const N_MIN = 3;
const N_MAX = 48;

// ── 상태 ───────────────────────────────────────────────────────────

const state = {
  /** 무브 데이터 (mock JSON에서 로드, 런타임 mutable). */
  move: null,
  /** 현재 선택 키프레임 인덱스. */
  currentFrame: 0,
  /** 라벨 visibility — true면 표시. 자식 일괄 토글의 결과가 여기에 반영. */
  labelEnabled: Object.fromEntries(BONE_LABELS.map(l => [l, true])),
  /** 트리 노드 펼침 상태 (라벨 → bool). 기본 펼침. */
  treeExpanded: Object.fromEntries(BONE_LABELS.map(l => [l, true])),
  /** 옵션. */
  showLabels: true,
  showBones: true,
  showBase: true,
  snapGrid: false,
  /** 드래그 / 활성 본. */
  dragging: null,
  activeBone: null,
  /** 베이스 이미지 (HTMLImageElement). */
  baseImage: null,
};

// ── 초기화 ─────────────────────────────────────────────────────────

async function init() {
  const raw = await fetch('mock/danji_baegi_12f_linear.json').then(r => r.json());
  // 키프레임에 intent / is_anchor 기본값 부여
  const defaultIntents = ['idle', 'prep', 'antc 시작', 'antc 중간',
    'wind+ ★', 'impact 진입', 'impact 진행', 'impact 진행',
    'impact 진행', 'impact ★', 'recovery', 'idle 복귀'];
  raw.keyframes.forEach((kf, i) => {
    if (!kf.intent) kf.intent = defaultIntents[i] || `자세 ${i + 1}`;
    if (kf.is_anchor === undefined) kf.is_anchor = (i === 4 || i === 9);
  });
  state.move = raw;
  state.baseImage = await loadImage('mock/base.png');

  buildBoneTree();
  rebuildKeyframeUI();
  bindUI();
  selectFrame(0);
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// ── 좌측: 본 하이어라키 트리 ─────────────────────────────────────

function buildBoneTree() {
  const root = document.getElementById('bone-tree');
  root.innerHTML = '';
  renderTreeNode(BONE_HIERARCHY, 0, root);
}

function renderTreeNode(node, depth, container) {
  const row = document.createElement('div');
  row.className = 'tree-row';
  row.dataset.label = node.label;

  // 들여쓰기
  const indent = document.createElement('span');
  indent.className = 'tree-indent';
  indent.style.width = `${depth * 12}px`;
  row.appendChild(indent);

  // 펼침 화살표
  const caret = document.createElement('span');
  caret.className = 'tree-caret';
  if (node.children.length === 0) {
    caret.classList.add('leaf');
  } else {
    caret.textContent = '▶';
    if (state.treeExpanded[node.label]) caret.classList.add('expanded');
    caret.addEventListener('click', (e) => {
      e.stopPropagation();
      state.treeExpanded[node.label] = !state.treeExpanded[node.label];
      buildBoneTree();
    });
  }
  row.appendChild(caret);

  // visibility 아이콘
  const eye = document.createElement('button');
  eye.className = 'tree-eye';
  const visState = computeVisibilityState(node);
  if (visState === 'on') { eye.classList.add('on'); eye.textContent = '●'; eye.title = '표시중 (클릭 = 자기+자식 숨김)'; }
  else if (visState === 'mixed') { eye.classList.add('mixed'); eye.textContent = '◐'; eye.title = '일부 표시 (클릭 = 모두 표시)'; }
  else { eye.classList.add('off'); eye.textContent = '○'; eye.title = '숨김 (클릭 = 자기+자식 표시)'; }
  eye.addEventListener('click', (e) => {
    e.stopPropagation();
    const labels = descendantLabels(node);
    // mixed → 모두 on, on → 모두 off, off → 모두 on
    const target = visState === 'on' ? false : true;
    labels.forEach(l => state.labelEnabled[l] = target);
    buildBoneTree();
    render();
  });
  row.appendChild(eye);

  // 라벨
  const labelEl = document.createElement('span');
  labelEl.className = 'tree-label';
  labelEl.style.color = boneColor(node.label);
  labelEl.innerHTML = `<span class="swatch" style="background:${boneColor(node.label)}"></span>${node.label}`;
  if (state.activeBone === node.label) row.classList.add('selected');
  if (!state.labelEnabled[node.label]) row.classList.add('dimmed');
  row.appendChild(labelEl);

  // 라벨/행 클릭 → 활성 본
  row.addEventListener('click', () => {
    state.activeBone = node.label;
    document.getElementById('active-bone-info').textContent = `선택된 본: ${node.label}`;
    buildBoneTree();
    renderCoordTable();
    render();
  });

  container.appendChild(row);

  // 자식 (펼침 상태일 때만)
  if (node.children.length > 0 && state.treeExpanded[node.label]) {
    node.children.forEach(c => renderTreeNode(c, depth + 1, container));
  }
}

/** 노드의 visibility 상태 계산: on / off / mixed. */
function computeVisibilityState(node) {
  const labels = descendantLabels(node);
  const on = labels.filter(l => state.labelEnabled[l]).length;
  if (on === 0) return 'off';
  if (on === labels.length) return 'on';
  return 'mixed';
}

// ── 우측: 키프레임 트랙 + 가중치 (가변 N) ────────────────────────

function rebuildKeyframeUI() {
  buildKeyframeTrack();
  buildWeightBar();
  updateFrameCountUI();
}

function buildKeyframeTrack() {
  const track = document.getElementById('keyframe-track');
  track.innerHTML = '';
  const N = state.move.keyframes.length;
  // N≤6이면 1행 N열, N>6이면 6열 + 자동 행
  track.style.gridTemplateColumns = `repeat(${Math.min(6, N)}, 1fr)`;
  state.move.keyframes.forEach((kf, i) => {
    const cell = document.createElement('div');
    cell.className = 'kf-cell';
    if (kf.is_anchor) cell.classList.add('anchor');
    cell.innerHTML = `
      <span class="kf-num">K${String(i + 1).padStart(2, '0')}</span>
      <span class="kf-tag">${escapeHTML(kf.intent || '-')}</span>
    `;
    cell.addEventListener('click', () => selectFrame(i));
    track.appendChild(cell);
  });
}

function buildWeightBar() {
  const bar = document.getElementById('weight-bar');
  bar.innerHTML = '';
  bar.style.gridTemplateColumns = `repeat(${state.move.keyframes.length}, 1fr)`;
  state.move.keyframes.forEach((kf, i) => {
    const cell = document.createElement('div');
    cell.className = 'weight-bar-cell';
    cell.title = `K${i + 1}: ${kf.frame_weight}f`;
    cell.innerHTML = `<div class="weight-fill" style="height: ${(kf.frame_weight / 8) * 100}%"></div>`;
    cell.addEventListener('click', () => selectFrame(i));
    bar.appendChild(cell);
  });
}

function updateFrameCountUI() {
  const N = state.move.keyframes.length;
  const sets = Math.ceil(N / 3);
  const remainder = N % 3;
  const padding = remainder ? 3 - remainder : 0;
  const setText = padding
    ? `${sets} set (${N} + ${padding} 패딩 → ${sets * 3})`
    : `${sets} set (${N} ÷ 3)`;
  const input = document.getElementById('frame-count-input');
  if (document.activeElement !== input) input.value = N;
  document.getElementById('frame-set-count').textContent = setText;
  document.getElementById('frame-decr').disabled = N <= N_MIN;
  document.getElementById('frame-incr').disabled = N >= N_MAX;
}

/** N을 target으로 직접 설정. 차이만큼 add/remove. */
function setFrameCount(target) {
  target = Math.max(N_MIN, Math.min(N_MAX, target));
  const current = state.move.keyframes.length;
  const diff = target - current;
  if (diff > 0) addFrames(diff);
  else if (diff < 0) removeFrames(-diff);
  rebuildKeyframeUI();
  if (state.currentFrame >= state.move.keyframes.length) {
    state.currentFrame = state.move.keyframes.length - 1;
  }
  selectFrame(state.currentFrame);
}

function addFrames(count) {
  // 마지막 키프레임의 좌표 + 의도를 복사해 추가
  const last = state.move.keyframes[state.move.keyframes.length - 1];
  for (let i = 0; i < count; i++) {
    const newIdx = state.move.keyframes.length;
    state.move.keyframes.push({
      index: newIdx,
      intent: '자세 ' + (newIdx + 1),
      is_anchor: false,
      frame_weight: last ? last.frame_weight : 2,
      keypoints: last
        ? last.keypoints.map(kp => ({ ...kp }))
        : BONE_LABELS.map(l => ({ label: l, x: 0.5, y: 0.5, z_index: 0 })),
    });
  }
}

function removeFrames(count) {
  for (let i = 0; i < count; i++) {
    if (state.move.keyframes.length <= N_MIN) break;
    state.move.keyframes.pop();
  }
  if (state.currentFrame >= state.move.keyframes.length) {
    state.currentFrame = state.move.keyframes.length - 1;
  }
}

function selectFrame(index) {
  state.currentFrame = index;
  document.querySelectorAll('.kf-cell').forEach((c, i) => {
    c.classList.toggle('active', i === index);
  });
  const kf = state.move.keyframes[index];
  document.getElementById('current-frame-label').textContent = `K${String(index + 1).padStart(2, '0')}`;
  const intentEl = document.getElementById('current-frame-intent');
  if (document.activeElement !== intentEl) intentEl.textContent = kf.intent || '';
  document.getElementById('weight-slider').value = kf.frame_weight;
  document.getElementById('weight-value').textContent = `${kf.frame_weight} frames`;
  document.getElementById('anchor-checkbox').checked = !!kf.is_anchor;
  updateWeightBar();
  updatePaceLabels();
  renderCoordTable();
  render();
}

function updateWeightBar() {
  document.querySelectorAll('.weight-bar-cell').forEach((cell, i) => {
    cell.classList.toggle('active', i === state.currentFrame);
    const fill = cell.querySelector('.weight-fill');
    if (fill) fill.style.height = `${(state.move.keyframes[i].frame_weight / 8) * 100}%`;
  });
}

function updatePaceLabels() {
  const total = state.move.keyframes.reduce((s, kf) => s + kf.frame_weight, 0);
  const seconds = (total / 24).toFixed(2);
  document.getElementById('total-frames').textContent = `${total} frames`;
  document.getElementById('total-seconds').textContent = `${seconds}s`;

  let pace = '중간 콤보';
  if (total <= 12) pace = '빠른 카운터';
  else if (total <= 18) pace = '빠른 콤보';
  else if (total <= 28) pace = '중간 콤보';
  else if (total <= 40) pace = '묵직 무브';
  else pace = 'Sifu/Sekiro급';
  document.getElementById('pace-label').textContent = pace;
}

// ── 중앙: 본 좌표 캔버스 ─────────────────────────────────────────

function render() {
  const canvas = document.getElementById('bone-canvas');
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  ctx.fillStyle = '#0d0d14';
  ctx.fillRect(0, 0, CANVAS_PX, CANVAS_PX);

  if (state.showBase && state.baseImage) {
    ctx.globalAlpha = 0.45;
    ctx.drawImage(state.baseImage, 0, 0, 64, 64, 0, 0, CANVAS_PX, CANVAS_PX);
    ctx.globalAlpha = 1.0;
  }

  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.lineWidth = 1;
  for (let i = 1; i < 10; i++) {
    const p = (i / 10) * CANVAS_PX;
    ctx.beginPath(); ctx.moveTo(p, 0); ctx.lineTo(p, CANVAS_PX); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, p); ctx.lineTo(CANVAS_PX, p); ctx.stroke();
  }

  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.font = '10px Consolas, monospace';
  for (let i = 1; i < 10; i++) {
    ctx.fillText(`${(i / 10).toFixed(1)}`, (i / 10) * CANVAS_PX + 2, 10);
    ctx.fillText(`${(i / 10).toFixed(1)}`, 2, (i / 10) * CANVAS_PX - 2);
  }

  const kpMap = currentKeypointMap();

  if (state.showBones) {
    ctx.lineWidth = 2;
    SKELETON_BONES.forEach(([a, b]) => {
      const ka = kpMap[a], kb = kpMap[b];
      if (!ka || !kb) return;
      if (!state.labelEnabled[a] || !state.labelEnabled[b]) return;
      ctx.strokeStyle = boneColor(a);
      ctx.globalAlpha = 0.6;
      ctx.beginPath();
      ctx.moveTo(ka.x * CANVAS_PX, ka.y * CANVAS_PX);
      ctx.lineTo(kb.x * CANVAS_PX, kb.y * CANVAS_PX);
      ctx.stroke();
      ctx.globalAlpha = 1.0;
    });
  }

  Object.entries(kpMap).forEach(([label, kp]) => {
    if (!state.labelEnabled[label]) return;
    const px = kp.x * CANVAS_PX;
    const py = kp.y * CANVAS_PX;
    const isActive = state.activeBone === label;

    ctx.fillStyle = boneColor(label);
    ctx.beginPath();
    ctx.arc(px, py, isActive ? 7 : 5, 0, Math.PI * 2);
    ctx.fill();

    if (isActive) {
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(px, py, 9, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (state.showLabels) {
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      const txt = label.replace('LEFT ', 'L ').replace('RIGHT ', 'R ');
      ctx.font = '10px Consolas, monospace';
      const w = ctx.measureText(txt).width;
      ctx.fillRect(px + 8, py - 6, w + 6, 12);
      ctx.fillStyle = boneColor(label);
      ctx.fillText(txt, px + 11, py + 3);
    }
  });
}

function currentKeypointMap() {
  const kf = state.move.keyframes[state.currentFrame];
  const map = {};
  kf.keypoints.forEach(kp => { map[kp.label] = kp; });
  return map;
}

// ── 캔버스 인터랙션 (드래그) ─────────────────────────────────────

function bindCanvas() {
  const canvas = document.getElementById('bone-canvas');
  const cursorInfo = document.getElementById('cursor-info');
  const activeBoneInfo = document.getElementById('active-bone-info');

  function canvasToNorm(e) {
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width);
    const y = ((e.clientY - rect.top) / rect.height);
    return { x: clamp01(x), y: clamp01(y) };
  }

  function findBoneAt(norm) {
    const kpMap = currentKeypointMap();
    let best = null, bestDist = 0.04;
    for (const [label, kp] of Object.entries(kpMap)) {
      if (!state.labelEnabled[label]) continue;
      const d = Math.hypot(norm.x - kp.x, norm.y - kp.y);
      if (d < bestDist) { bestDist = d; best = label; }
    }
    return best;
  }

  canvas.addEventListener('mousedown', (e) => {
    const norm = canvasToNorm(e);
    const bone = findBoneAt(norm);
    if (bone) {
      state.dragging = bone;
      state.activeBone = bone;
      activeBoneInfo.textContent = `선택된 본: ${bone}`;
      buildBoneTree();
      renderCoordTable();
      render();
    }
  });

  canvas.addEventListener('mousemove', (e) => {
    const norm = canvasToNorm(e);
    cursorInfo.textContent = `x: ${norm.x.toFixed(3)} / y: ${norm.y.toFixed(3)}`;
    if (!state.dragging) return;
    const kp = currentKeypointMap()[state.dragging];
    if (!kp) return;
    let nx = norm.x, ny = norm.y;
    if (state.snapGrid) {
      nx = Math.round(nx / 0.05) * 0.05;
      ny = Math.round(ny / 0.05) * 0.05;
    }
    kp.x = nx; kp.y = ny;
    renderCoordTable();
    render();
  });

  window.addEventListener('mouseup', () => { state.dragging = null; });
  canvas.addEventListener('mouseleave', () => { cursorInfo.textContent = 'x: -.--- / y: -.---'; });
}

function clamp01(v) { return Math.max(0, Math.min(1, v)); }

// ── 좌표 테이블 (한 번 빌드 + 값 sync) ───────────────────────────

let coordTableInitialized = false;

function renderCoordTable() {
  if (!coordTableInitialized) {
    buildCoordTableRows();
    coordTableInitialized = true;
  }
  syncCoordTableValues();
}

function buildCoordTableRows() {
  const tbody = document.getElementById('coord-table-body');
  tbody.innerHTML = '';
  BONE_LABELS.forEach(label => {
    const tr = document.createElement('tr');
    tr.dataset.label = label;
    tr.innerHTML = `
      <td class="label-cell" style="color:${boneColor(label)}">${label}</td>
      <td><input type="number" class="coord-input" data-axis="x" data-label="${label}"
                 min="0" max="1" step="0.001" value="0"></td>
      <td><input type="number" class="coord-input" data-axis="y" data-label="${label}"
                 min="0" max="1" step="0.001" value="0"></td>
      <td><input type="number" class="coord-input z-axis" data-axis="z" data-label="${label}"
                 step="1" value="0"></td>
      <td class="row-pick" data-label="${label}">선택</td>
    `;
    tbody.appendChild(tr);
  });

  tbody.querySelectorAll('.coord-input').forEach(inp => {
    inp.addEventListener('input', handleCoordInputLive);
    inp.addEventListener('blur', handleCoordInputBlur);
    inp.addEventListener('focus', e => {
      // 편집 시작 시 해당 본을 활성화
      const lbl = e.target.dataset.label;
      state.activeBone = lbl;
      document.getElementById('active-bone-info').textContent = `선택된 본: ${lbl}`;
      buildBoneTree();
      // 행 highlight (값 sync 호출하면 포커스 잃을 수 있어 직접 toggle)
      tbody.querySelectorAll('tr').forEach(tr =>
        tr.classList.toggle('selected', tr.dataset.label === lbl));
      render();
    });
    inp.addEventListener('keydown', e => {
      if (e.key === 'Enter') { e.preventDefault(); e.target.blur(); }
    });
  });

  tbody.querySelectorAll('.row-pick').forEach(el => {
    el.addEventListener('click', () => {
      const lbl = el.dataset.label;
      state.activeBone = lbl;
      document.getElementById('active-bone-info').textContent = `선택된 본: ${lbl}`;
      buildBoneTree();
      syncCoordTableValues();
      render();
    });
  });
}

function syncCoordTableValues() {
  const kpMap = currentKeypointMap();
  const tbody = document.getElementById('coord-table-body');
  tbody.querySelectorAll('tr').forEach(tr => {
    const label = tr.dataset.label;
    tr.classList.toggle('selected', state.activeBone === label);
    const kp = kpMap[label];
    if (!kp) return;
    tr.querySelectorAll('.coord-input').forEach(inp => {
      // 사용자가 편집 중인 input은 외부에서 덮어쓰지 않는다
      if (document.activeElement === inp) return;
      const axis = inp.dataset.axis;
      if (axis === 'x') inp.value = kp.x.toFixed(3);
      else if (axis === 'y') inp.value = kp.y.toFixed(3);
      else if (axis === 'z') inp.value = kp.z_index;
    });
  });
}

function handleCoordInputLive(e) {
  const label = e.target.dataset.label;
  const axis = e.target.dataset.axis;
  const kp = currentKeypointMap()[label];
  if (!kp) return;
  const raw = e.target.value;
  if (raw === '' || raw === '-') return; // 입력 중 일시 빈값 허용
  const v = parseFloat(raw);
  if (isNaN(v)) return;
  if (axis === 'z') {
    kp.z_index = Math.round(v);
  } else {
    kp[axis] = clamp01(v);
  }
  render();
}

function handleCoordInputBlur(e) {
  // blur 시 정상화: clamp + 포맷
  const label = e.target.dataset.label;
  const axis = e.target.dataset.axis;
  const kp = currentKeypointMap()[label];
  if (!kp) return;
  if (axis === 'z') e.target.value = kp.z_index;
  else e.target.value = kp[axis].toFixed(3);
}

// ── 옵션 + 가중치 + 발주 + Export 바인딩 ─────────────────────────

function bindUI() {
  document.getElementById('opt-show-labels').addEventListener('change', e => {
    state.showLabels = e.target.checked; render();
  });
  document.getElementById('opt-show-bones').addEventListener('change', e => {
    state.showBones = e.target.checked; render();
  });
  document.getElementById('opt-show-base').addEventListener('change', e => {
    state.showBase = e.target.checked; render();
  });
  document.getElementById('opt-snap-grid').addEventListener('change', e => {
    state.snapGrid = e.target.checked;
  });

  document.getElementById('weight-slider').addEventListener('input', e => {
    const w = parseInt(e.target.value, 10);
    state.move.keyframes[state.currentFrame].frame_weight = w;
    document.getElementById('weight-value').textContent = `${w} frames`;
    updateWeightBar();
    updatePaceLabels();
  });

  // 트리 전체 표시/숨김
  document.getElementById('bone-tree-all-on').addEventListener('click', () => {
    BONE_LABELS.forEach(l => state.labelEnabled[l] = true);
    buildBoneTree(); render();
  });
  document.getElementById('bone-tree-all-off').addEventListener('click', () => {
    BONE_LABELS.forEach(l => state.labelEnabled[l] = false);
    buildBoneTree(); render();
  });

  // 프레임 추가/삭제 (Shift+클릭 = ±3, 일반 클릭 = ±1)
  document.getElementById('frame-incr').addEventListener('click', (e) => {
    setFrameCount(state.move.keyframes.length + (e.shiftKey ? 3 : 1));
  });
  document.getElementById('frame-decr').addEventListener('click', (e) => {
    setFrameCount(state.move.keyframes.length - (e.shiftKey ? 3 : 1));
  });

  // N 직접 입력
  const frameInput = document.getElementById('frame-count-input');
  frameInput.addEventListener('change', e => {
    const v = parseInt(e.target.value, 10);
    if (isNaN(v)) { e.target.value = state.move.keyframes.length; return; }
    setFrameCount(v);
  });
  frameInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); e.target.blur(); }
  });

  // anchor 토글
  document.getElementById('anchor-checkbox').addEventListener('change', e => {
    state.move.keyframes[state.currentFrame].is_anchor = e.target.checked;
    buildKeyframeTrack();
    selectFrame(state.currentFrame); // 활성 표시 복원
  });

  // intent 자유 텍스트
  const intentEl = document.getElementById('current-frame-intent');
  intentEl.addEventListener('blur', () => {
    state.move.keyframes[state.currentFrame].intent = intentEl.textContent.trim();
    buildKeyframeTrack();
    selectFrame(state.currentFrame);
  });
  intentEl.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); intentEl.blur(); }
  });

  document.getElementById('btn-order').addEventListener('click', triggerOrderMock);

  document.querySelectorAll('[data-export]').forEach(btn => {
    btn.addEventListener('click', () => showExport(btn.dataset.export));
  });

  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('export-modal').addEventListener('click', e => {
    if (e.target.id === 'export-modal') closeModal();
  });

  // 키보드 nudge / 단축키
  window.addEventListener('keydown', (e) => {
    // intent 편집 중이면 단축키 무시
    if (document.activeElement && document.activeElement.isContentEditable) return;

    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault(); triggerOrderMock(); return;
    }
    if (!state.activeBone) return;
    const kp = currentKeypointMap()[state.activeBone];
    if (!kp) return;
    const step = e.shiftKey ? 0.01 : 0.005;
    if (e.key === 'ArrowLeft')  { kp.x = clamp01(kp.x - step); }
    else if (e.key === 'ArrowRight') { kp.x = clamp01(kp.x + step); }
    else if (e.key === 'ArrowUp')    { kp.y = clamp01(kp.y - step); }
    else if (e.key === 'ArrowDown')  { kp.y = clamp01(kp.y + step); }
    else return;
    e.preventDefault();
    renderCoordTable();
    render();
  });

  bindCanvas();
}

// ── 발주 (mock) ───────────────────────────────────────────────────

function triggerOrderMock() {
  const status = document.getElementById('order-status');
  const sheet = document.getElementById('result-sheet');
  const N = state.move.keyframes.length;
  const sets = Math.ceil(N / 3);
  status.textContent = `발주 중 (mock) — ${sets} set × 3 키프레임…`;
  sheet.style.opacity = '0.3';
  let dots = 0;
  const tick = setInterval(() => {
    dots = (dots + 1) % 4;
    status.textContent = `발주 중 (mock) — ${sets} set × 3 키프레임${'.'.repeat(dots)}`;
  }, 250);
  setTimeout(() => {
    clearInterval(tick);
    status.textContent = `✅ ${N} 자세 수신 완료 (mock — 시연용 sheet 표시)`;
    sheet.style.opacity = '1';
  }, 1600);
}

// ── Export (mock) ─────────────────────────────────────────────────

function showExport(kind) {
  const modal = document.getElementById('export-modal');
  const title = document.getElementById('export-modal-title');
  const body = document.getElementById('export-modal-body');

  if (kind === 'json') {
    title.textContent = 'JSON 중간 포맷';
    body.textContent = JSON.stringify(state.move, null, 2);
  } else if (kind === 'godot') {
    title.textContent = 'Godot SpriteFrames Resource (.tres)';
    body.textContent = generateGodotTres();
  } else if (kind === 'phaser') {
    title.textContent = 'Phaser Atlas JSON';
    body.textContent = generatePhaserAtlas();
  }
  modal.hidden = false;
}

function closeModal() {
  document.getElementById('export-modal').hidden = true;
}

function generateGodotTres() {
  const move = state.move;
  let frames = '';
  move.keyframes.forEach((kf, i) => {
    frames += `{
        "duration": ${(kf.frame_weight / 24.0).toFixed(4)},
        "texture": SubResource("AtlasTexture_${String(i).padStart(2, '0')}")
    }, `;
  });
  return `[gd_resource type="SpriteFrames" load_steps=${move.keyframes.length + 2} format=3]

[ext_resource type="Texture2D" path="res://assets/moves/${move.meta.name}.png" id="1"]

; AtlasTexture × ${move.keyframes.length} (각 자세를 sheet에서 64×64 잘라 사용)
${move.keyframes.map((_, i) => `[sub_resource type="AtlasTexture" id="AtlasTexture_${String(i).padStart(2, '0')}"]
atlas = ExtResource("1")
region = Rect2(${i * 64}, 0, 64, 64)`).join('\n\n')}

[resource]
animations = [{
    "frames": [${frames.trim().replace(/,$/, '')}],
    "loop": false,
    "name": &"${move.meta.name}",
    "speed": 24.0
}]
`;
}

function generatePhaserAtlas() {
  const move = state.move;
  const frames = {};
  move.keyframes.forEach((kf, i) => {
    frames[`${move.meta.name}_${String(i).padStart(2, '0')}`] = {
      frame: { x: i * 64, y: 0, w: 64, h: 64 },
      duration: kf.frame_weight * (1000 / 24),
    };
  });
  return JSON.stringify({
    frames,
    meta: {
      app: 'lazyslime-action-tool',
      image: `${move.meta.name}.png`,
      size: { w: 64 * move.keyframes.length, h: 64 },
      scale: '1',
    },
    animations: {
      [move.meta.name]: Object.keys(frames),
    },
  }, null, 2);
}

// ── util ─────────────────────────────────────────────────────────

function escapeHTML(s) {
  return String(s).replace(/[&<>"']/g, c =>
    ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c])
  );
}

// ── boot ─────────────────────────────────────────────────────────

init().catch(err => {
  console.error('[action-tool] 초기화 실패', err);
  document.body.innerHTML += `<div style="color:#ff6a6a; padding: 24px;">초기화 실패: ${err.message}</div>`;
});
