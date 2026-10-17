// 중대 사건이 드문 구간에도 2~3년마다 생활 방향을 직접 고르게 한다.
import { fxEffects } from './milestones.js';

export const due = (L, gap = 3) => L.alive && L.age >= 5 && L.age - (L.lastChoiceAge ?? 2) >= gap;

function plansFor(L) {
  if (L.age < 19) return [
    { id: 'learn', label: '배우는 시간을 늘린다', result: '새로 배우는 시간을 늘리고 노는 시간은 조금 줄였다.', fx: { stats: { intellect: 2, leisure: -2 } } },
    { id: 'play', label: '좋아하는 일을 하며 쉰다', result: '따로 공부하는 시간 대신 좋아하는 일을 하며 쉬었다.', fx: { stats: { leisure: 2, intellect: -1 } } },
    { id: 'people', label: '다른 사람과 어울린다', result: '혼자 보내던 시간 일부를 다른 사람과 함께 보냈다.', fx: { stats: { relations: 2, leisure: -1 } } },
  ];
  if (L.age < 65) return [
    { id: 'organize', label: '생활비와 집안일을 정리한다', result: '시간을 들여 지출과 집안일을 점검하고 생활 계획을 세웠다.', fx: { stats: { intellect: 1, leisure: -2 }, issues: { living: -2 } } },
    { id: 'rest', label: '쉴 시간을 먼저 확보한다', result: '할 일을 더 늘리지 않고 몸을 쉬게 할 시간을 남겼다.', fx: { stats: { health: 2, leisure: 1 } } },
    { id: 'people', label: '사람들과 연락할 시간을 낸다', result: '혼자 쉬던 시간 일부를 아는 사람들과 연락하며 보냈다.', fx: { stats: { relations: 2, leisure: -1 } } },
  ];
  return [
    { id: 'health', label: '몸을 돌보는 시간을 늘린다', result: '다른 일정 일부를 줄이고 몸을 돌볼 시간을 확보했다.', fx: { stats: { health: 2, leisure: -1 } } },
    { id: 'interest', label: '좋아하는 일을 느긋하게 한다', result: '새로운 약속을 늘리는 대신 좋아하는 일을 하며 쉬었다.', fx: { stats: { leisure: 2, relations: -1 } } },
    { id: 'people', label: '아는 사람들과 자주 연락한다', result: '혼자 보내던 시간을 줄이고 아는 사람들과 연락을 이어 갔다.', fx: { stats: { relations: 2, leisure: -1 } } },
  ];
}

export function step(L, ctx) {
  if (!due(L) || L.pending || L.yr.asked) return;
  const plans = plansFor(L);
  ctx.ask({ eventId: 'sys.life.direction', cadence: true,
    prompt: L.age < 19 ? '하루 중 내 마음대로 쓸 수 있는 시간, 어디에 먼저 쓸까?' : '앞으로 몇 해, 남는 시간을 어디에 먼저 쓸까?',
    options: plans.map(p => ({ ...p, effects: fxEffects(p) })), defaultId: plans[0].id, data: { plans } });
}

export const choices = {
  'sys.life.direction'(L, ctx, option, { plans }) {
    const plan = plans.find(p => p.id === option);
    if (plan) ctx.apply(plan.fx, { reason: plan.result });
  },
};
