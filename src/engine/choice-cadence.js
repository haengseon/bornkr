// 중대 사건이 드문 구간에도 오래 비면 직접 고르게 한다.
// - 생활 방향: 6년 넘게 비면, 10년 구간당 1회·생애 3회까지. 기본값은 직전 선택(F-4).
// - 노년 선택(60세+): 6년째 비면 비면 상태에 맞는 노년 결정을 생애 1회씩 묻는다. 결과는 이후 해마다 tick이 이어 간다.
import { fxEffects } from './milestones.js';
import { T, yr } from './tables.js';
import { nudge } from './stats.js';

export const due = (L, gap = 3) => L.alive && L.age >= 5 && L.age - (L.lastChoiceAge ?? 2) >= gap;
const DIRECTION_MAX = 3;

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

// 노년 선택: when(상태 조건) → plans. 고른 결과는 choices가 기존 상태(연금·집·플래그·lean)에 남기고 tick이 해마다 이어 간다.
const kidsAlive = L => L.family.children.some(c => c.alive);
const dementia = L => L.health.conditions.some(c => c.key === 'dementia' && c.active);
const frail = L => (L.aging.ltc || 0) >= 3 || dementia(L);
export const LATE = {
  // 국민연금 연기연금(2007~): 최대 5년, 해마다 7.2% 가산 → 36%
  pension: {
    when: L => L.year >= 2007 && L.aging.pensionStart != null && L.year - L.aging.pensionStart <= 1 && L.aging.pensionMonthly > (L.flags.homePension?.monthly || 0) && !L.aging.deferUntil,
    prompt: '국민연금을 받을 나이가 됐다. 언제부터 받을까?',
    plans: () => [
      { id: 'now', label: '지금부터 받는다', result: '연금을 바로 받기 시작해 다달이 생활비에 보탰다.', fx: { stats: { leisure: 2 } } },
      { id: 'defer', label: '몇 해 미뤄 더 받는다', result: '연금 수령을 미루고 그동안은 모아 둔 돈으로 지냈다.', fx: { stats: { wealth: -2 } } },
    ],
  },
  // 주된 일 뒤 선택(sys.job.after_main)을 거치지 않은 사람만. career가 afterWork를 읽어 해마다 재취업을 시도하거나 멈춘다.
  work: {
    when: L => L.age <= 69 && ['retired', 'seeking', 'inactive'].includes(L.job.status) && L.flags.afterWork == null && !frail(L),
    prompt: '일을 더 할지, 이제 쉴지 정할 때가 됐다.',
    plans: () => [
      { id: 'work', label: '다시 일자리를 찾는다', result: '동네 일자리 공고를 챙겨 보며 다시 일을 찾기 시작했다.', fx: { stats: { wealth: 2, leisure: -2 } } },
      { id: 'rest', label: '일은 이제 놓는다', result: '일자리는 더 찾지 않고 남은 시간을 쉬며 보내기로 했다.', fx: { stats: { leisure: 2 } } },
    ],
  },
  // 주택연금(2007~): 자가에 살고 담보가 작을 때. 월 지급액 ≈ 집값 0.25%(65세 정액형 근사)
  homePension: {
    when: L => L.year >= 2007 && L.age >= 62 && L.home.owned && !L.home.parents && L.home.tenure !== 'facility' && L.home.value > 0 && (L.home.mortgageBalance || 0) <= L.home.value * 0.3 && !L.flags.homePension,
    prompt: '살던 집을 담보로 주택연금을 받을 수 있다.',
    plans: () => [
      { id: 'join', label: '주택연금에 가입한다', result: '집에 그대로 살면서 다달이 연금을 받기 시작했다.', fx: { stats: { happiness: 2 } } },
      { id: 'keep', label: '집을 그대로 남긴다', result: '집은 손대지 않고 지금 수입으로 지내기로 했다.', fx: { stats: { relations: 2 } } },
    ],
  },
  // ponytail: 합가는 플래그(withChild)·고립 해제만 남기고 원래 집의 점유·비용은 그대로 둔다(aging 'child'와 같은 처리)
  together: {
    when: L => L.age >= 70 && !L.family.partner && kidsAlive(L) && L.home.tenure !== 'facility' && !L.flags.withChild,
    prompt: '혼자 지낸 지 오래다. 자녀가 함께 살자고 했다.',
    plans: () => [
      { id: 'join', label: '자녀 집으로 들어간다', result: '짐을 줄여 자녀 집의 방 하나로 옮겼다.', fx: { stats: { relations: 2, leisure: -2 } } },
      { id: 'apart', label: '지금 집에서 따로 산다', result: '고맙다고 하고 익숙한 집에서 혼자 지내기로 했다.', fx: { stats: { leisure: 2 } } },
    ],
  },
  habit: {
    when: L => L.age <= 80 && !frail(L) && !L.flags.lateHabit,
    prompt: '몸이 예전 같지 않다. 검진과 운동을 챙길까?',
    plans: () => [
      { id: 'habit', label: '검진·운동을 습관으로', result: '해마다 검진을 받고 매일 걷는 습관을 들였다.', fx: { stats: { health: 2, leisure: -2 } } },
      { id: 'skip', label: '지금처럼 지낸다', result: '병원은 아플 때만 가고 하던 대로 지냈다.', fx: { stats: { leisure: 2 } } },
    ],
  },
  gift: {
    when: L => L.age >= 72 && !dementia(L) && kidsAlive(L) && L.flags.indep != null && L.money.assets >= 5000,
    prompt: '모아 둔 돈을 자녀에게 미리 나눠 줄까?',
    plans: L => [
      { id: 'give', label: '미리 나눠 준다', result: '모아 둔 돈 일부를 자녀들에게 미리 나눠 주었다.', fx: { stats: { relations: 2 }, money: { assets: -Math.round(L.money.assets * 0.3) } } },
      { id: 'keep', label: '내 노후에 쓴다', result: '돈은 내 노후를 위해 그대로 두기로 했다.', fx: { stats: { happiness: 2 } } },
    ],
  },
  // 고립 위험(aging.isolated, 사망 위험 ×1.15)을 줄이는 대신 시간을 쓴다
  center: {
    when: L => L.age >= 75 && !frail(L) && L.home.tenure !== 'facility' && !L.flags.seniorCenter,
    prompt: '동네 복지관에서 어르신 프로그램 안내가 왔다.',
    plans: () => [
      { id: 'join', label: '복지관에 다닌다', result: '일주일에 몇 번 복지관 수업에 나가 아는 얼굴이 늘었다.', fx: { stats: { relations: 2, leisure: -1 } } },
      { id: 'home', label: '집에서 조용히 지낸다', result: '안내문은 접어 두고 집에서 하던 대로 지냈다.', fx: { stats: { leisure: 2 } } },
    ],
  },
  // 장기요양 3등급 이상을 집에서 버틴 지 오래일 때(aging 'sys.age.residence'의 시설 처리와 같다). 치매여도 가족과 함께 정한다.
  care: {
    when: L => L.age >= 80 && (L.aging.ltc || 0) >= 3 && L.home.tenure !== 'facility',
    prompt: '돌봄이 더 필요해졌다. 가족과 거처를 다시 의논했다.',
    plans: () => [
      { id: 'home', label: '집에서 돌봄을 받는다', result: '방문 돌봄 시간을 늘리고 살던 집에 남았다.', fx: { stats: { relations: 2, leisure: -2 } } },
      { id: 'facility', label: '요양시설로 옮긴다', result: '가족과 상의해 가까운 요양시설로 옮겼다.', fx: { stats: { relations: -2 } } },
    ],
  },
};

// 노년 선택의 해마다 이어지는 결과
function tick(L, ctx) {
  const g = L.aging, fl = L.flags, h = L.home, hp = fl.homePension;
  if (fl.lateTick === L.year) return;
  fl.lateTick = L.year;
  if (g.deferUntil && g.deferUntil <= L.year) { g.pensionMonthly += g.deferAmt; g.deferUntil = g.deferAmt = null; }
  if (hp && (!h.owned || h.tenure === 'facility')) { g.pensionMonthly = Math.max(0, g.pensionMonthly - hp.monthly); fl.homePension = null; }   // 집을 팔거나 시설로 가면 끝
  else if (hp) h.value = Math.max(0, h.value - 12 * hp.monthly);    // ponytail: 받은 만큼 집 지분에서 뺀다, 대출 이자·보증료는 생략
  if (fl.lateHabit && !frail(L)) { nudge(L, 'health', 0.05); ctx.act.spend(Math.round(40 * yr(T('ERA_INCOME_INDEX'), L.year))); }
  if (fl.withChild || fl.seniorCenter) { g.isolated = false; nudge(L, 'relations', 0.05); }
}

const ask = (L, ctx, prompt, plans, defaultId, data) =>
  ctx.ask({ eventId: data?.kind ? `sys.late.${data.kind}` : 'sys.life.direction', cadence: true, prompt, options: plans.map(p => ({ ...p, effects: fxEffects(p) })), defaultId, data: { plans, ...data } });

export function step(L, ctx) {
  if (!L.alive) return;
  if (L.age >= 60) tick(L, ctx);
  if (L.pending || L.yr.asked) return;
  const fl = L.flags;
  if (L.age >= 60 && due(L, 6)) {
    const done = fl.lateAsked ||= {}, k = Object.keys(LATE).find(k => !done[k] && LATE[k].when(L));
    if (k) { done[k] = L.year; const plans = LATE[k].plans(L); return ask(L, ctx, LATE[k].prompt, plans, plans[0].id, { kind: k }); }
  }
  if (!due(L, 6)) return;
  const st = Math.floor(L.age / 10), asked = fl.directionAsked ||= {};
  if (asked[st] || Object.keys(asked).length >= DIRECTION_MAX) return;
  asked[st] = L.year;
  const plans = plansFor(L), last = plans.find(p => p.id === fl.directionLast);
  ask(L, ctx, L.age < 19 ? '하루 중 내 마음대로 쓸 수 있는 시간, 어디에 먼저 쓸까?' : '앞으로 몇 해, 남는 시간을 어디에 먼저 쓸까?', plans, (last ?? plans[0]).id);
}

// 생활 방향과 노년 선택(sys.late.<kind>)은 같은 시트(결과 문장 opt.result)를 쓴다. data.kind가 노년 선택 종류.
function resolvePlan(L, ctx, option, { plans, kind }) {
    const plan = plans.find(p => p.id === option);
    if (!plan) return;
    ctx.apply(plan.fx, { reason: plan.result });
    const g = L.aging, fl = L.flags;
    if (!kind) fl.directionLast = plan.id;
    else if (option === 'defer') { const amt = g.pensionMonthly - (fl.homePension?.monthly || 0); g.pensionMonthly -= amt; g.deferAmt = Math.round(amt * 1.36); g.deferUntil = L.year + 5; }
    else if (option === 'habit') fl.lateHabit = L.year;
    else if (kind === 'work') { fl.afterWork = option; if (option === 'rest') ctx.act.retire(); }
    else if (kind === 'care') { L.health.care = option; if (option === 'facility') { ctx.act.move('facility', { reason: '요양', silent: true }); ctx.sys('sys.home.facility'); } }
    else if (kind === 'center' && option === 'join') { fl.seniorCenter = L.year; g.isolated = false; }
    else if (kind === 'homePension' && option === 'join') { fl.homePension = { year: L.year, monthly: Math.round(L.home.value * 0.0025) }; g.pensionMonthly += fl.homePension.monthly; }
    else if (kind === 'together' && option === 'join') { fl.withChild = L.year; g.isolated = false; }
}
export const choices = { 'sys.life.direction': resolvePlan, ...Object.fromEntries(Object.keys(LATE).map(k => [`sys.late.${k}`, resolvePlan])) };
