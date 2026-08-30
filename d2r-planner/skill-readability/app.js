const branches = [
  {
    id: 'summoning', name: '소환', subtitle: '언데드 군단과 골렘',
    skills: [
      ['raise-skeleton', '해골 되살리기', 'Raise Skeleton', 1, 1, 1, [], '죽은 적의 시체에서 해골 전사를 일으켜 함께 싸우게 합니다.'],
      ['skeleton-mastery', '해골 숙련', 'Skeleton Mastery', 1, 3, 1, ['raise-skeleton'], '되살린 해골과 해골 마법학자의 생명력과 공격력을 증가시킵니다.'],
      ['clay-golem', '점토 골렘', 'Clay Golem', 6, 2, 2, [], '점토 골렘을 소환합니다. 골렘의 공격은 적을 둔화시킵니다.'],
      ['raise-mage', '해골 마법학자 되살리기', 'Raise Skeletal Mage', 12, 1, 3, ['raise-skeleton'], '원소 투사체로 공격하는 해골 마법학자를 되살립니다.'],
      ['golem-mastery', '골렘 숙련', 'Golem Mastery', 12, 3, 3, ['clay-golem'], '소환한 골렘의 이동 속도와 생명력을 증가시킵니다.'],
      ['blood-golem', '피 골렘', 'Blood Golem', 18, 2, 4, ['clay-golem'], '적에게 준 피해의 일부를 생명력으로 전환하는 피 골렘을 소환합니다.'],
      ['iron-golem', '강철 골렘', 'Iron Golem', 24, 2, 5, ['blood-golem'], '금속 아이템에서 아이템의 특성을 지닌 강철 골렘을 만듭니다.'],
      ['summon-resist', '소환수 저항', 'Summon Resist', 24, 3, 5, ['golem-mastery'], '모든 소환수가 원소와 독 피해에 더 잘 저항하게 합니다.'],
      ['revive', '부활', 'Revive', 30, 1, 6, ['raise-mage'], '쓰러진 괴물을 되살려 제한된 시간 동안 아군으로 만듭니다.'],
      ['fire-golem', '화염 골렘', 'Fire Golem', 30, 2, 6, ['iron-golem'], '불타는 오라로 주변 적을 도발하는 화염 골렘을 소환합니다.'],
    ],
  },
  {
    id: 'poison', name: '독과 뼈', subtitle: '투사체, 방어, 지속 피해',
    skills: [
      ['teeth', '이빨', 'Teeth', 1, 1, 1, [], '여러 개의 뼈 투사체를 부채꼴로 발사합니다.'],
      ['bone-armor', '뼈 갑옷', 'Bone Armor', 1, 3, 1, [], '뼈의 보호막이 일정량의 물리 피해를 흡수합니다.'],
      ['poison-dagger', '맹독 단도', 'Poison Dagger', 6, 1, 2, [], '단도 공격에 명중률과 지속 독 피해를 추가합니다.'],
      ['corpse-explosion', '시체 폭발', 'Corpse Explosion', 6, 3, 2, ['teeth'], '시체를 폭발시켜 주변 적에게 물리 및 화염 피해를 줍니다.'],
      ['bone-wall', '뼈의 벽', 'Bone Wall', 12, 3, 3, ['bone-armor'], '적의 이동을 차단하는 뼈의 벽을 생성합니다.'],
      ['poison-explosion', '맹독 폭발', 'Poison Explosion', 18, 1, 4, ['poison-dagger'], '시체에서 치명적인 독 구름을 방출합니다.'],
      ['bone-spear', '뼈 창', 'Bone Spear', 18, 2, 4, ['teeth'], '적을 관통하는 날카로운 뼈 창을 발사합니다.'],
      ['bone-prison', '뼈 감옥', 'Bone Prison', 24, 3, 5, ['bone-wall'], '대상을 둘러싸는 뼈의 감옥을 생성합니다.'],
      ['poison-nova', '맹독 확산', 'Poison Nova', 30, 1, 6, ['poison-explosion'], '사방으로 맹독 고리를 퍼뜨려 넓은 범위에 독 피해를 줍니다.'],
      ['bone-spirit', '뼈 영혼', 'Bone Spirit', 30, 2, 6, ['bone-spear'], '적을 추적하는 영혼을 발사해 마법 피해를 줍니다.'],
    ],
  },
  {
    id: 'curses', name: '저주', subtitle: '약화와 전장 통제',
    skills: [
      ['amplify-damage', '피해 증폭', 'Amplify Damage', 1, 2, 1, [], '저주받은 적이 받는 물리 피해를 크게 증가시킵니다.'],
      ['dim-vision', '시야 흐리기', 'Dim Vision', 6, 1, 2, [], '적의 시야를 제한하여 원거리 공격과 추적을 방해합니다.'],
      ['weaken', '약화', 'Weaken', 6, 3, 2, ['amplify-damage'], '저주받은 적이 주는 물리 피해를 감소시킵니다.'],
      ['iron-maiden', '가시 박힌 철관', 'Iron Maiden', 12, 1, 3, ['dim-vision'], '적이 가한 근접 물리 피해의 일부를 되돌려줍니다.'],
      ['terror', '공포', 'Terror', 12, 2, 3, ['amplify-damage'], '저주받은 적이 공포에 질려 달아나게 합니다.'],
      ['confuse', '혼란', 'Confuse', 18, 1, 4, ['iron-maiden'], '저주받은 적이 주변의 다른 대상을 무차별 공격하게 합니다.'],
      ['life-tap', '생명력 추출', 'Life Tap', 18, 3, 4, ['weaken'], '저주받은 적을 공격할 때 생명력을 회복합니다.'],
      ['attract', '유혹', 'Attract', 24, 1, 5, ['confuse'], '한 적을 주변 적들의 집중 공격 대상으로 만듭니다.'],
      ['decrepify', '노화', 'Decrepify', 24, 3, 5, ['terror'], '적의 이동과 공격 속도, 물리 피해, 물리 저항을 낮춥니다.'],
      ['lower-resist', '저항 감소', 'Lower Resist', 30, 3, 6, ['decrepify'], '적의 화염, 냉기, 번개, 독 저항을 낮춥니다.'],
    ],
  },
].map(branch => ({ ...branch, skills: branch.skills.map(([id, name, english, level, col, row, prerequisites, description]) => ({ id, name, english, level, col, row, prerequisites, description })) }))

const state = { concept: new URLSearchParams(location.search).get('concept') || 'focus', branch: 'summoning', selected: 'raise-skeleton', ranks: {} }
const concepts = {
  focus: { badge: 'A', title: '집중 트리', summary: '한 번에 한 계열을 넓게 보여 기존 트리 감성과 가독성을 함께 지키는 안입니다.', note: '전통 트리 유지', detail: '추천안 · 큰 카드와 고정 상세 패널' },
  ledger: { badge: 'B', title: '레벨 원장', summary: '세 계열을 동시에 비교하되 선 대신 레벨 구간과 선행 기술 문구로 관계를 읽는 안입니다.', note: '비교 효율 우선', detail: '세 트리 동시 보기 · 스크롤 친화적' },
  codex: { badge: 'C', title: '스킬 도감', summary: '스킬 목록, 설명, 선행·후속 관계를 분리해 정보 탐색과 모바일 가독성을 최대로 높인 안입니다.', note: '정보 탐색 우선', detail: '상세 설명 중심 · 키보드/터치 친화적' },
}

const byId = id => branches.flatMap(branch => branch.skills).find(skill => skill.id === id)
const branchById = id => branches.find(branch => branch.id === id)
const rank = id => state.ranks[id] || 0
const branchPoints = branch => branch.skills.reduce((sum, skill) => sum + rank(skill.id), 0)
const totalPoints = () => Object.values(state.ranks).reduce((sum, value) => sum + value, 0)
const canAdd = skill => skill.prerequisites.every(id => rank(id) > 0) && rank(skill.id) < 20

function setRank(id, delta) {
  const skill = byId(id)
  if (!skill || (delta > 0 && !canAdd(skill))) return
  const next = Math.max(0, Math.min(20, rank(id) + delta))
  state.ranks[id] = next
  state.selected = id
  render()
}

function nodeMarkup(skill, extra = '') {
  const locked = !skill.prerequisites.every(id => rank(id) > 0)
  return `<article class="skill-node ${rank(skill.id) ? 'invested' : ''} ${locked ? 'locked' : ''} ${state.selected === skill.id ? 'selected' : ''}" data-select="${skill.id}" style="grid-column:${skill.col};grid-row:${skill.row}">
    <div class="node-title">${skill.name}</div>
    <div class="node-meta"><span>요구 ${skill.level}</span><span>투자 <b>${rank(skill.id)}</b>/20</span></div>
    <div class="node-actions"><button data-rank="${skill.id}" data-delta="-1" ${rank(skill.id) <= 0 ? 'disabled' : ''} aria-label="${skill.name} 감소">−</button><strong>${rank(skill.id)}</strong><button data-rank="${skill.id}" data-delta="1" ${canAdd(skill) ? '' : 'disabled'} aria-label="${skill.name} 증가">+</button></div>${extra}
  </article>`
}

function connectorMarkup(branch) {
  const x = [150, 450, 750]
  const y = row => 65 + (row - 1) * 130
  return branch.skills.flatMap(skill => skill.prerequisites.map(parentId => {
    const parent = branch.skills.find(item => item.id === parentId)
    if (!parent) return ''
    const sx = x[parent.col - 1], sy = y(parent.row) + 54, tx = x[skill.col - 1], ty = y(skill.row) - 54, mid = (sy + ty) / 2
    const status = rank(parent.id) && rank(skill.id) ? 'active' : rank(parent.id) ? 'ready' : ''
    return `<path class="${status}" d="M ${sx} ${sy} V ${mid} H ${tx} V ${ty}" />`
  })).join('')
}

function inspectorMarkup(skill) {
  const prerequisites = skill.prerequisites.length ? skill.prerequisites.map(id => byId(id).name).join(', ') : '선행 기술 없음'
  return `<aside class="skill-inspector panel"><span class="inspector-kicker">SELECTED SKILL</span><h2>${skill.name}</h2><small>${skill.english}</small><p>${skill.description}</p><div class="inspector-stats"><div><span>요구 레벨</span><strong>${skill.level}</strong></div><div><span>현재 투자</span><strong>${rank(skill.id)} / 20</strong></div><div><span>장비 보너스</span><strong>+0</strong></div><div><span>최종 레벨</span><strong>${rank(skill.id)}</strong></div></div><div class="prereq"><span>선행 기술</span><strong>${prerequisites}</strong></div></aside>`
}

function focusMarkup() {
  const branch = branchById(state.branch)
  const selected = byId(state.selected) && branch.skills.some(skill => skill.id === state.selected) ? byId(state.selected) : branch.skills[0]
  state.selected = selected.id
  return `<div class="branch-tabs">${branches.map(item => `<button class="${item.id === branch.id ? 'active' : ''}" data-branch="${item.id}"><strong>${item.name}</strong><small>${item.subtitle}</small><span>${branchPoints(item)} P</span></button>`).join('')}</div><div class="focus-layout"><section class="tree-panel panel"><header class="tree-panel-header"><div><small>SKILL TREE</small><strong>${branch.name}</strong></div><span>카드를 선택하면 오른쪽에서 전체 설명을 볼 수 있습니다.</span></header><div class="focus-tree"><svg viewBox="0 0 900 780" preserveAspectRatio="none" aria-hidden="true">${connectorMarkup(branch)}</svg>${branch.skills.map(skill => nodeMarkup(skill)).join('')}</div></section>${inspectorMarkup(selected)}</div>`
}

function ledgerMarkup() {
  return `<div class="ledger-board">${branches.map(branch => `<section class="ledger-branch"><header class="ledger-heading"><div><small>SKILL LEDGER</small><strong>${branch.name}</strong></div><span>${branchPoints(branch)} 포인트</span></header>${[1, 6, 12, 18, 24, 30].map(level => `<div class="tier"><div class="tier-label">LV ${level}</div><div class="tier-skills">${branch.skills.filter(skill => skill.level === level).map(skill => `<article class="ledger-skill ${rank(skill.id) ? 'invested' : ''}" data-select="${skill.id}"><strong>${skill.name}</strong><span>${rank(skill.id)}/20</span><small>${skill.english}</small><em>${skill.prerequisites.length ? `선행 · ${skill.prerequisites.map(id => byId(id).name).join(', ')}` : '선행 기술 없음'}</em><button data-rank="${skill.id}" data-delta="1" ${canAdd(skill) ? '' : 'disabled'}>+ 투자</button></article>`).join('')}</div></div>`).join('')}</section>`).join('')}</div>`
}

function codexMarkup() {
  const branch = branchById(state.branch)
  const selected = byId(state.selected) && branch.skills.some(skill => skill.id === state.selected) ? byId(state.selected) : branch.skills[0]
  state.selected = selected.id
  const parents = selected.prerequisites.map(byId)
  const children = branch.skills.filter(skill => skill.prerequisites.includes(selected.id))
  return `<div class="branch-tabs">${branches.map(item => `<button class="${item.id === branch.id ? 'active' : ''}" data-branch="${item.id}"><strong>${item.name}</strong><small>${item.subtitle}</small><span>${branchPoints(item)} P</span></button>`).join('')}</div><section class="codex-layout"><nav class="codex-nav"><div class="codex-branch-title">${branch.name} · SKILL INDEX</div>${branch.skills.map(skill => `<button class="${skill.id === selected.id ? 'active' : ''}" data-select="${skill.id}">${skill.name}<span>LV ${skill.level}</span></button>`).join('')}</nav><article class="codex-sheet"><small>NECROMANCER SKILL</small><h2>${selected.name}</h2><div class="english">${selected.english}</div><p class="description">${selected.description}</p><div class="rank-control"><button data-rank="${selected.id}" data-delta="-1" ${rank(selected.id) <= 0 ? 'disabled' : ''}>−</button><strong>${rank(selected.id)} / 20</strong><button data-rank="${selected.id}" data-delta="1" ${canAdd(selected) ? '' : 'disabled'}>+</button></div><div class="codex-facts"><div><span>요구 레벨</span><strong>${selected.level}</strong></div><div><span>장비 보너스</span><strong>+0</strong></div><div><span>최종 레벨</span><strong>${rank(selected.id)}</strong></div></div></article><aside class="codex-path"><div class="path-group"><span>REQUIRES · 선행 기술</span>${parents.length ? parents.map(skill => `<div class="path-card"><strong>${skill.name}</strong><small>${rank(skill.id)}/20</small></div>`).join('') : '<div class="path-empty">선행 기술이 없습니다.</div>'}</div><div class="path-group"><span>UNLOCKS · 후속 기술</span>${children.length ? children.map(skill => `<div class="path-card"><strong>${skill.name}</strong><small>LV ${skill.level}</small></div>`).join('') : '<div class="path-empty">마지막 단계의 기술입니다.</div>'}</div></aside></section>`
}

function bindEvents() {
  document.querySelectorAll('[data-concept]').forEach(button => button.addEventListener('click', () => {
    state.concept = button.dataset.concept
    history.replaceState(null, '', `?concept=${state.concept}`)
    render()
  }))
  document.querySelectorAll('[data-branch]').forEach(button => button.addEventListener('click', () => {
    state.branch = button.dataset.branch
    state.selected = branchById(state.branch).skills[0].id
    render()
  }))
  document.querySelectorAll('[data-select]').forEach(card => card.addEventListener('click', event => {
    if (event.target.closest('[data-rank]')) return
    state.selected = card.dataset.select
    const owner = branches.find(branch => branch.skills.some(skill => skill.id === state.selected))
    if (owner) state.branch = owner.id
    render()
  }))
  document.querySelectorAll('[data-rank]').forEach(button => button.addEventListener('click', event => {
    event.stopPropagation()
    setRank(button.dataset.rank, Number(button.dataset.delta))
  }))
  document.getElementById('reset-ranks').onclick = () => { state.ranks = {}; render() }
}

function render() {
  if (!concepts[state.concept]) state.concept = 'focus'
  const concept = concepts[state.concept]
  document.querySelectorAll('[data-concept]').forEach(button => button.classList.toggle('active', button.dataset.concept === state.concept))
  document.getElementById('concept-summary').textContent = concept.summary
  document.getElementById('spent-total').textContent = totalPoints()
  document.getElementById('concept-note').innerHTML = `<b>${concept.badge}</b><div><strong>${concept.title}</strong><p>${concept.summary}</p></div><em>${concept.detail}</em>`
  document.getElementById('mockup-root').innerHTML = state.concept === 'focus' ? focusMarkup() : state.concept === 'ledger' ? ledgerMarkup() : codexMarkup()
  bindEvents()
}

render()
