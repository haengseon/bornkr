import { crisisRiskContext } from './life-crisis.js';

// 현실의 의학적 위험비가 아닌 게임 튜닝. 기존 통계 기저위험과 별도로 분리한다.
export const LIFE_RISK_MODEL = Object.freeze({
  version: 1, kind: 'game-assumption', illness: 1.15, mortality: 1.08, selfharmCause: 1.1,
  note: '성년의 지속된 복합 위기와 실제 기능·상실·지지 기록이 모두 확인된 경우만 적용한다. 성향 유형만으로 질병·사망을 결정하지 않는다.',
});

export function lifeRiskOf(L) {
  const none = { active: false, illness: 1, mortality: 1, selfharmCause: 1, sourceIds: [], kind: 'game-assumption' };
  if ((L.modelVersion ?? 1) < 2 || L.age < 19 || !L.alive) return none;
  const context = crisisRiskContext(L);
  if (!context.active || !context.persistent || context.supportReceived || !context.impairment
      || !context.severe || !context.isolation || !context.sourceIds?.length) return none;
  const diagnosed = (L.health?.conditions || []).some(c => c.key === 'depression' && c.active);
  return { active: true,
    // 낮은 행복이 이미 우울 발생 위험에 반영됐으면 새 배율을 겹치지 않는다.
    illness: L.stats.happiness < 35 || diagnosed ? 1 : LIFE_RISK_MODEL.illness,
    mortality: diagnosed ? LIFE_RISK_MODEL.mortality : 1,
    selfharmCause: diagnosed ? LIFE_RISK_MODEL.selfharmCause : 1,
    sourceIds: [...context.sourceIds], kind: LIFE_RISK_MODEL.kind };
}
