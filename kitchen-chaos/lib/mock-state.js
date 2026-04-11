/**
 * @fileoverview Kitchen Chaos 목업 - 중앙 상태 저장소
 * 게임 로직 없음. 순수 데이터 + 프리셋만 관리한다.
 */

// ── 재료 목록 (실제 게임과 동일) ──
const INGREDIENT_KEYS = [
  'carrot', 'meat', 'squid', 'pepper', 'cheese',
  'flour', 'egg', 'rice', 'fish', 'mushroom',
];

const INGREDIENT_NAMES = {
  carrot: '당근', meat: '고기', squid: '오징어', pepper: '고추', cheese: '치즈',
  flour: '밀가루', egg: '달걀', rice: '쌀', fish: '생선', mushroom: '버섯',
};

// ── 스타터 레시피 (목업용 간략화) ──
const RECIPES = [
  { id: 'carrot_soup',   nameKo: '당근 수프',     icon: '🍲', tier: 1, ingredients: { carrot: 1 },           baseReward: 20 },
  { id: 'steak_plate',   nameKo: '스테이크 정식', icon: '🥩', tier: 2, ingredients: { meat: 2 },             baseReward: 50 },
  { id: 'mixed_platter', nameKo: '혼합 플래터',   icon: '🍽️', tier: 2, ingredients: { carrot: 2, meat: 1 }, baseReward: 65 },
  { id: 'seafood_pasta', nameKo: '해산물 파스타', icon: '🍝', tier: 2, ingredients: { squid: 1, flour: 1 },  baseReward: 55 },
  { id: 'spicy_stir_fry',nameKo: '매운 볶음',     icon: '🍳', tier: 2, ingredients: { pepper: 1, meat: 1 }, baseReward: 45 },
  { id: 'cheese_fondue', nameKo: '치즈 퐁뒤',     icon: '🧀', tier: 2, ingredients: { cheese: 2 },           baseReward: 60 },
];

// ── 중앙 상태 ──
const MockState = {
  gold: 500,
  comboCount: 0,
  selectedRecipeId: 'carrot_soup',
  ingredients: {
    carrot: 3, meat: 2, squid: 1, pepper: 1, cheese: 0,
    flour: 0, egg: 0, rice: 0, fish: 0, mushroom: 0,
  },

  // ── 상수 참조 ──
  RECIPES,
  INGREDIENT_KEYS,
  INGREDIENT_NAMES,

  // ── 헬퍼 ──
  get selectedRecipe() {
    return RECIPES.find(r => r.id === this.selectedRecipeId) || RECIPES[0];
  },

  /** 선택한 레시피를 서빙할 재료가 충분한지 확인 */
  canServe() {
    const recipe = this.selectedRecipe;
    return Object.entries(recipe.ingredients).every(
      ([key, need]) => (this.ingredients[key] || 0) >= need
    );
  },

  /** 재료 소비 (서빙 성공 시) */
  consumeIngredients() {
    const recipe = this.selectedRecipe;
    Object.entries(recipe.ingredients).forEach(([key, need]) => {
      this.ingredients[key] = Math.max(0, (this.ingredients[key] || 0) - need);
    });
  },

  /** 남은 재료 총합 */
  totalIngredients() {
    return Object.values(this.ingredients).reduce((s, v) => s + v, 0);
  },

  // ── 프리셋 ──
  presets: {
    '정상 운영': {
      gold: 500,
      ingredients: { carrot: 5, meat: 4, squid: 2, pepper: 2, cheese: 1, flour: 1, egg: 0, rice: 0, fish: 0, mushroom: 0 },
      selectedRecipeId: 'carrot_soup',
    },
    '재료 부족': {
      gold: 200,
      ingredients: { carrot: 1, meat: 0, squid: 0, pepper: 0, cheese: 0, flour: 0, egg: 0, rice: 0, fish: 0, mushroom: 0 },
      selectedRecipeId: 'carrot_soup',
    },
    '골드 위기': {
      gold: 10,
      ingredients: { carrot: 6, meat: 5, squid: 3, pepper: 3, cheese: 2, flour: 2, egg: 1, rice: 1, fish: 1, mushroom: 1 },
      selectedRecipeId: 'mixed_platter',
    },
    '풀 재료': {
      gold: 9999,
      ingredients: { carrot: 10, meat: 10, squid: 10, pepper: 10, cheese: 10, flour: 10, egg: 10, rice: 10, fish: 10, mushroom: 10 },
      selectedRecipeId: 'cheese_fondue',
    },
  },

  applyPreset(name) {
    const p = this.presets[name];
    if (!p) return;
    this.gold = p.gold;
    this.ingredients = { ...p.ingredients };
    this.selectedRecipeId = p.selectedRecipeId;
    this.comboCount = 0;
  },
};
