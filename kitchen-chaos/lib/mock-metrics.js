/**
 * @fileoverview Kitchen Chaos 목업 - 경량 피드백 레이어
 * 서빙/이탈/낭비를 단순 누적하고, evaluate()로 밸런스 지표를 계산한다.
 * 이벤트 시스템 없음. 버튼 핸들러에서 직접 호출한다.
 */

const MockMetrics = {
  goldEarned:       0,
  customersServed:  0,
  customersLost:    0,
  comboMax:         0,
  ingredientsWasted: 0,  // 라운드 종료 시 남은 재료 총합
  roundsPlayed:     0,

  reset() {
    this.goldEarned       = 0;
    this.customersServed  = 0;
    this.customersLost    = 0;
    this.comboMax         = 0;
    this.ingredientsWasted = 0;
    this.roundsPlayed     = 0;
  },

  // ── 지표 계산 ──

  /**
   * 밸런스 지표 계산.
   * @returns {{ efficiency: number, failRate: number, wastePerRound: number }}
   */
  evaluate() {
    const served  = this.customersServed;
    const lost    = this.customersLost;
    const total   = served + lost;
    const rounds  = this.roundsPlayed || 1;

    return {
      /** 서빙 1회당 평균 골드 */
      efficiency:    served > 0 ? Math.round(this.goldEarned / served) : 0,
      /** 손님 이탈률 0~1 */
      failRate:      total  > 0 ? parseFloat((lost / total).toFixed(2)) : 0,
      /** 라운드당 재료 낭비 */
      wastePerRound: parseFloat((this.ingredientsWasted / rounds).toFixed(1)),
    };
  },

  // ── UI 렌더링 ──

  /**
   * 피드백 패널을 지정 컨테이너에 렌더링한다.
   * @param {string} containerId
   */
  render(containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;

    const e       = this.evaluate();
    const total   = this.customersServed + this.customersLost;
    const rounds  = this.roundsPlayed;

    // 판정 기준: failRate >30% 위험 / >15% 주의 / 이하 양호
    const failTag  = e.failRate > 0.3  ? '🔴' : e.failRate > 0.15 ? '🟡' : '🟢';
    // 판정 기준: efficiency <50G 위험 / <100G 주의 / 이상 양호
    const effTag   = e.efficiency < 50 ? '🔴' : e.efficiency < 100 ? '🟡' : '🟢';
    // 낭비 경고: 라운드당 3개 초과
    const wasteTag = e.wastePerRound > 3 ? '⚠️ ' : '';

    // 데이터 없을 때
    if (rounds === 0 && total === 0) {
      el.innerHTML = `<div class="metrics-panel metrics-empty">서빙 버튼을 눌러 데이터를 쌓으세요.</div>`;
      return;
    }

    el.innerHTML = `
      <div class="metrics-panel">
        <div class="metrics-header">밸런스 체크 <span class="metrics-rounds">R${rounds}</span></div>
        <div class="metrics-row">
          <span class="metrics-icon">${effTag}</span>
          <span class="metrics-label">서빙 효율</span>
          <span class="metrics-value">${e.efficiency} G/회</span>
        </div>
        <div class="metrics-row">
          <span class="metrics-icon">${failTag}</span>
          <span class="metrics-label">손님 이탈률</span>
          <span class="metrics-value">${(e.failRate * 100).toFixed(0)}%
            <span class="metrics-sub">(${this.customersLost}/${total}명)</span>
          </span>
        </div>
        <div class="metrics-row">
          <span class="metrics-icon">${wasteTag || '📦'}</span>
          <span class="metrics-label">재료 낭비</span>
          <span class="metrics-value">${wasteTag}${e.wastePerRound}개/라운드</span>
        </div>
        <div class="metrics-row">
          <span class="metrics-icon">🔗</span>
          <span class="metrics-label">최대 콤보</span>
          <span class="metrics-value">${this.comboMax}연속</span>
        </div>
        <div class="metrics-total">
          총 획득 골드 <b>${this.goldEarned.toLocaleString()} G</b>
          · 서빙 ${this.customersServed}회
        </div>
      </div>
    `;
  },
};
