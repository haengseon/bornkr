// 생활 기반 v1. 관측 분포와 개인의 실제 거래·행동은 구분한다.
import { getHouseholdBudget, LIVELIHOOD_DATA } from '../data/livelihood.js';
import { stageOf } from './clock.js';
import { STAGE_CAP } from './tuning.js';
import { eligibleLifeEvents } from './daily-eligibility.js';
import { foodPriceContext } from './daily-transactions.js';
import { pauseActivities } from './daily-activities.js';
import { lifeEventReviewHandler } from './life-event-actions.js';

export const MODEL_VERSION = 2;
export const dailyEnabled = L => (L.modelVersion ?? 1) >= MODEL_VERSION;
const finite = value => Number.isFinite(value) ? value : 0;
const copy = value => JSON.parse(JSON.stringify(value));

export function ensureDailyLife(L) {
  if (!dailyEnabled(L)) return null;
  const d = L.dailyLife ||= {
    version: 1, dataVersion: LIVELIHOOD_DATA.version, facts: [], people: [],
    routines: [], history: [], pending: [], outcomes: {}, ledger: {},
    startedAt: null, nextPlanYear: null, lastYear: null, summary: null, eligibleEventIds: [],
  };
  return d;
}

// 요청·예상은 등록하지 않는다. 실제 확인 기록을 가진 생산자만 호출한다.
export function confirmDailyFact(L, fact) {
  const d = ensureDailyLife(L);
  if (!d || !fact?.id || !fact.key || !fact.sourceEventId || !Number.isInteger(fact.year)
      || fact.year > L.year || !Number.isInteger(fact.validUntil) || fact.validUntil < fact.year) return false;
  if (d.facts.some(f => f.id === fact.id)) return false;
  const sourceExists = [...(L.log || []), ...d.history].some(e => (e.id ?? e.eventId) === fact.sourceEventId && e.year === fact.year);
  if (!sourceExists) return false;
  d.facts.push({ ...copy(fact), status: 'confirmed' });
  return true;
}

// 생존·관계·고용 조건은 실행 시점에 처리기가 다시 확인한다.
export function queueDailyOutcome(L, item) {
  const d = ensureDailyLife(L);
  if (!d || !item?.id || !item.sourceEventId || !item.choiceId || !Number.isInteger(item.dueYear)
      || item.dueYear <= L.year || !item.kind || d.outcomes[item.id] || d.pending.some(x => x.id === item.id)) return false;
  d.pending.push({ ...copy(item), createdAt: L.year, status: 'pending' });
  return true;
}

export function settleDailyOutcomes(L, handlers = {}) {
  const d = ensureDailyLife(L);
  if (!d) return;
  for (const item of d.pending) {
    if (item.status !== 'pending') continue;
    if (!L.alive) {
      item.status = 'canceled'; item.resolvedAt = L.year;
      d.outcomes[item.id] = { status: 'canceled', year: L.year };
      d.history.push({ id: item.id, year: L.year, sourceEventId: item.sourceEventId,
        choiceId: item.choiceId, kind: 'follow-up', status: 'canceled', text: '생애가 끝나 예정된 후속 일을 종료했다.' });
      continue;
    }
    if (item.dueYear > L.year) continue;
    const handler = handlers[item.kind];
    // 미구현 결과는 성공 처리하지 않고 대기 상태로 보존한다.
    if (!handler) continue;
    const allowed = handler.eligible(L, item);
    item.status = allowed ? 'resolved' : 'canceled';
    item.resolvedAt = L.year;
    d.outcomes[item.id] = { status: item.status, year: L.year };
    if (allowed) handler.apply(L, item);
    d.history.push({ id: item.id, sourceEventId: item.sourceEventId, choiceId: item.choiceId,
      year: L.year, kind: 'follow-up', status: item.status, text: item.status === 'canceled' ? '생활 조건이 달라져 예정된 일을 이어가지 않았다.' : item.text });
  }
}

// 기존 총액 생활비 안의 주거·양육·의료 몫을 따로 보여 주고 다시 더하지 않는다.
export function annualExpensePlan({ envelope, minimumLiving = 0, housing, children, medical, support, care }) {
  const fixed = { housing, children, medical, support, care };
  for (const key in fixed) fixed[key] = Math.max(0, finite(fixed[key]));
  const included = fixed.housing + fixed.children + fixed.medical;
  const living = Math.max(0, finite(minimumLiving), finite(envelope) - included);
  return { ...fixed, living, consumption: living + included + fixed.support + fixed.care,
    kind: 'game-model', includedInEnvelope: ['housing', 'children', 'medical'] };
}

export function recordAnnualLedger(L, row) {
  const d = ensureDailyLife(L);
  if (!d || d.ledger[L.year]) return;
  d.ledger[L.year] = { ...copy(row), year: L.year, currencyBaseYear: 2025,
    unit: 'real-manwon', source: 'money.step', kind: 'game-model', finalized: false,
    balanceAfterAnnualBudget: row.closingCash, otherCashChange: 0 };
}

export function timeBudget(L) {
  // 취업·돌봄 교차 관측이 없는 구간: 통계로 가장하지 않는 제한적 시간 대역.
  const working = ['employed', 'self', 'military'].includes(L.job?.status);
  const studying = ['elem', 'middle', 'high', 'college', 'grad'].includes(L.edu?.stage);
  const cooking = L.dailyLife?.mealPolicy?.effectiveYear === L.year && L.dailyLife.mealPolicy.choiceId === 'cook';
  const requested = { sleep: L.age < 13 ? 600 : L.age < 19 ? 540 : 480, work: working ? 480 : 0, study: studying ? 360 : 0,
    commute: working || studying ? 60 : 0, care: L.family?.caringFor ? 120 : 0, housework: 60 };
  const source = Object.entries(requested).map(([field, minutes]) => ({ field, minutes, kind: 'game-assumption', id: `baseline.${field}`, year: L.year }));
  const seen = new Set();
  for (const change of L.dailyLife?.scheduleChanges || []) {
    const field = { commute: 'commute', workload: 'work', chores: 'housework' }[change.kind];
    const id = `${change.eventId}:${change.kind}:${change.year}`;
    if (change.year !== L.year || !field || !change.eventId || seen.has(id) || !Number.isFinite(change.minutes)
        || ['canceled', 'declined', 'pending'].includes(change.status)
        || (field === 'work' || field === 'commute') && !working) continue;
    if (change.jobCode != null && change.jobCode !== L.job?.code) continue;
    if (change.originJobCode != null && change.originJobCode !== L.job?.code) continue;
    if (change.originJobStatus != null && change.originJobStatus !== L.job?.status) continue;
    const homeKey = [L.home?.region, L.home?.sigungu, L.home?.dong, L.home?.tenure, L.home?.moves?.length ?? 0].join('|');
    if (change.originHomeKey != null && change.originHomeKey !== homeKey) continue;
    if (change.homeRegion != null && change.homeRegion !== L.home?.region) continue;
    if (change.homeTenure != null && change.homeTenure !== L.home?.tenure) continue;
    seen.add(id);
    const before = requested[field];
    requested[field] = Math.max(0, Math.min(1440, before + Math.round(change.minutes)));
    source.push({ field, minutes: requested[field] - before, kind: 'approved-schedule', id,
      sourceEventId: change.eventId, year: L.year });
  }
  if (cooking && Object.values(requested).reduce((sum, n) => sum + n, 0) <= 1410) {
    requested.housework += 30;
    source.push({ field: 'housework', minutes: 30, kind: 'game-assumption',
      id: L.dailyLife.mealPolicy.id, sourceEventId: L.dailyLife.mealPolicy.sourceEventId, year: L.year });
  }
  let activity = 0, recovery = 0;
  const addActivity = (id, minutes, sourceEventId, kind, field = 'activity') => {
    if (seen.has(id) || !Number.isFinite(minutes) || minutes <= 0) return;
    seen.add(id);
    const n = Math.min(1440, Math.round(minutes));
    if (field === 'recovery') recovery += n; else activity += n;
    source.push({ field, minutes: n, id, sourceEventId, kind, year: L.year });
  };
  for (const a of L.dailyLife?.activities || []) if (a.year === L.year && ['completed', 'resumed'].includes(a.status)) {
    addActivity(`activity:${a.id}:${a.year}:${a.status}`, a.minutes, a.sourceEventId, 'recorded-activity');
  }
  for (const a of L.dailyLife?.scenarioActions || []) if (a.year === L.year && ['executed', 'requested'].includes(a.status)) {
    addActivity(`scenario:${a.eventId}:${a.optionId}:${a.year}`, a.minutes, a.eventId, 'recorded-procedure');
  }
  for (const a of L.wellbeing?.pending || []) if (a.kind === 'rest' && a.status === 'completed' && a.resolvedAt === L.year) {
    addActivity(a.id, 15, a.sourceEventId, 'recorded-rest', 'recovery');
  }
  requested.activity = activity; requested.recovery = recovery;
  let support = 0;
  for (const fact of L.dailyLife?.facts || []) {
    if (fact.producer !== 'life-crisis' || fact.status !== 'confirmed' || fact.year !== L.year
        || !fact.id || seen.has(fact.id) || !Number.isFinite(fact.minutes) || fact.minutes <= 0) continue;
    seen.add(fact.id);
    if (fact.key === 'sleep.shortfall') {
      const n = Math.min(requested.sleep, fact.minutes);
      requested.sleep -= n; requested.unfinishedWork = (requested.unfinishedWork || 0) + n;
      source.push({ field: 'unfinishedWork', minutes: n, id: fact.id, sourceEventId: fact.sourceEventId, kind: 'recorded-crisis', year: L.year });
    } else if (fact.key === 'support.received') support += fact.minutes;
  }
  if (support) {
    requested.support = support;
    source.push({ field: 'support', minutes: support, kind: 'recorded-crisis', id: `support.${L.year}`, year: L.year });
  }
  let remaining = 1440;
  const assigned = {};
  for (const [key, value] of Object.entries(requested)) { assigned[key] = Math.min(value, remaining); remaining -= assigned[key]; }
  return { kind: 'scenario', ...assigned, personal: remaining, total: 1440, source,
    unmetMinutes: Object.values(requested).reduce((a, b) => a + b, 0) - (1440 - remaining),
    note: '하루 시간 배분은 게임 가정이며 실제 생활시간 관측값을 개인에게 대입한 수치가 아니다.' };
}

function currentRoutine(d) { return d.routines.find(r => r.status === 'active') || d.routines.at(-1) || null; }

const PLAN_OPTIONS = [
  { id: 'quiet', label: '혼자 정리하는 시간을 남긴다', hint: '집에서 쉬는 짧은 시간을 생활 원칙으로 정한다.', personality: { weights: { I: .6 } } },
  { id: 'explore', label: '새로운 관심거리를 조금씩 찾아본다', hint: '별도 구매 없이 가능한 관심사 탐색을 시작한다.', personality: { weights: { N: .5, P: .2 } } },
  { id: 'keep', label: '당분간 지금 생활을 유지한다', hint: '생활 방식은 바꾸지 않는다.', personality: { weights: {} } },
];

function inSlice(L, d) { return L.age >= 19 && L.age <= 34 && L.year >= 1999 && (d.startedAt == null || L.year < d.startedAt + 10); }

export function step(L, ctx) {
  const d = ensureDailyLife(L);
  if (!d || L.age < 5 || L.year < 1960 || !L.alive) return;
  const time = timeBudget(L), routine = currentRoutine(d);
  const previousTime = d.summary?.year === L.year - 1 ? d.summary.time : null;
  d.eligibleEventIds = eligibleLifeEvents(L).map(event => event.id);
  const ledger = d.ledger[L.year] || null;
  const size = 1 + (L.family.partner ? 1 : 0) + (L.family.children || []).filter(c => c.alive && !c.leftHome).length;
  const reference = getHouseholdBudget({ year: L.year, householdSize: size });
  d.summary = { year: L.year, ledger, time, routine: routine ? copy(routine) : null,
    dataReference: { available: reference.available === true, year: L.year, householdSize: size,
      precise: false, reasons: LIVELIHOOD_DATA.reasons } };
  if (d.lastYear !== L.year) {
    d.lastYear = L.year;
    // 활동 완료를 추측하지 않고 생활 원칙의 실행 조건 변화만 기록한다.
    if (routine) {
      const blocked = time.personal < (routine.minimumMinutes || 15);
      const status = blocked ? 'paused' : routine.status === 'paused' ? 'paused' : 'active';
      if (routine.status !== status) {
        routine.status = status; routine.reason = '일·학업·돌봄 뒤에 남는 시간이 부족해 생활 원칙을 잠시 쉬었다.';
        d.history.push({ id: `daily.pause.${L.year}`, year: L.year, kind: 'routine', routineId: routine.id, text: routine.reason });
        ctx.emit({ kind: 'personal', id: 'daily.routine.pause', text: routine.reason });
      }
    }
  }
  // 기존 선택 예산을 다 쓴 해에는 기본 행동으로 몰래 원칙을 정하지 않는다.
  const stage = stageOf(L.age).id;
  if (!inSlice(L, d) || L.yr.asked || L.pending || L.stageChoices[stage].sys >= STAGE_CAP[stage].sys) return;
  if (!d.routines.length && !(d.nextPlanYear > L.year)) {
    ctx.ask({ eventId: 'sys.daily.plan', prompt: '일과 해야 할 일 사이에서 어떤 시간을 남겨 둘까?',
      options: PLAN_OPTIONS.map(o => ({ ...o, personality: copy(o.personality), feasible: time.personal >= 15 || o.id === 'keep' })),
      defaultId: 'keep', data: { daily: true } });
    return;
  }
  const lastLedger = d.ledger[L.year - 1];
  const incomeGap = ledger && lastLedger && lastLedger.income > 0 && ledger.income < lastLedger.income * .5;
  if (incomeGap && !(d.nextIncomeReviewYear > L.year)) {
    ctx.ask({ eventId: 'sys.daily.income-gap', prompt: '지난해보다 수입이 크게 줄었다. 돈을 들이지 않는 개인 시간을 어떻게 남길까?',
      options: [
        { id: 'free', label: '새 지출 없이 쉬거나 관심거리를 살핀다', personality: { weights: { P: .4 } } },
        { id: 'short', label: '해야 할 일을 먼저 하고 짧은 시간을 남긴다', feasible: time.personal >= 5, personality: { weights: { J: .5 } } },
        { id: 'pause', label: '지금은 생활 원칙을 쉬고 형편을 다시 살핀다', personality: { weights: {} } },
      ], defaultId: 'pause', data: { daily: true, sourceYear: L.year - 1, incomeBefore: lastLedger.income, incomeNow: ledger.income } });
    return;
  }
  const food = foodPriceContext(L);
  const independent = ['own', 'jeonse', 'monthly', 'public'].includes(L.home?.tenure);
  if (independent && ledger && food.available && food.rise > .04 && !(d.nextMealReviewYear > L.year)) {
    ctx.ask({ eventId: 'sys.daily.meal', prompt: `${L.year}년 식료품 연평균 물가지수가 지난해보다 ${Math.round(food.rise * 1000) / 10}% 올랐다. 다음 해 식사비용 원칙을 어떻게 정할까?`,
      options: [
        { id: 'budget', label: '더 저렴한 메뉴를 우선 살핀다', hint: '다음 해 생활비 일부를 작게 줄이는 게임 가정이 적용된다.', personality: { weights: { S: .4 } } },
        { id: 'cook', label: '조리 시간을 하루 30분 더 배정한다', hint: '하루 30분을 요리에 더 쓴다. 그날 일정에 여유가 있어야 한다.', feasible: time.personal >= 30, personality: { weights: { J: .5 } } },
        { id: 'keep', label: '지금 비용 원칙을 유지한다', personality: { weights: {} } },
      ], defaultId: 'keep', data: { daily: true, rise: food.rise, sourceYear: L.year } });
    return;
  }
  const budgetChanged = ledger && lastLedger && ledger.disposable < lastLedger.disposable * .8;
  const workChanged = previousTime && time.work > previousTime.work && time.personal < previousTime.personal;
  const paused = currentRoutine(d)?.status === 'paused';
  if (routine && (budgetChanged || workChanged || paused) && !(d.nextReviewYear > L.year)) {
    ctx.ask({ eventId: 'sys.daily.adjust', prompt: paused ? '시간이 빠듯해 쉬고 있는 생활 원칙을 어떻게 할까?' : workChanged ? '일에 배정한 시간이 늘어 개인 시간이 줄었다. 생활 원칙을 어떻게 이어갈까?' : '가용 수입이 줄었다. 남겨 둔 개인 시간을 어떻게 이어갈까?',
      options: [
        { id: 'keep', label: '가능한 범위에서 기존 방식을 지킨다', feasible: time.personal >= 15, personality: { weights: { J: .5 } } },
        { id: 'short', label: '더 짧게 바꿔 이어간다', feasible: time.personal >= 5, personality: { weights: { P: .6 } } },
        { id: 'pause', label: '이번에는 쉬고 나중에 다시 살핀다', personality: { weights: {} } },
      ], defaultId: 'pause', data: { daily: true, routineId: routine.id } });
  }
}

function resolvePlan(L, ctx, option) {
  const d = ensureDailyLife(L);
  if (!d) return;
  if (option === 'keep') { d.nextPlanYear = L.year + 3; return; }
  const label = option === 'quiet' ? '혼자 정리하는 시간' : '새 관심거리 탐색';
  if (!d.routines.some(r => r.id === option)) d.routines.push({ id: option, label, status: 'active', startedAt: L.year, minimumMinutes: 15, cashCost: 0, kind: 'personal-principle' });
  d.startedAt ??= L.year;
  d.history.push({ id: `daily.plan.${L.year}`, year: L.year, kind: 'routine', choiceId: option,
    text: `${label}을 생활 원칙으로 정했다. 별도 비용이 드는 활동이나 만남을 완료한 기록은 아니다.` });
  if (d.summary) d.summary.routine = copy(currentRoutine(d));
}

function resolveAdjustment(L, ctx, option, data) {
  const d = ensureDailyLife(L), routine = d?.routines.find(r => r.id === data.routineId);
  if (!routine) return;
  routine.status = option === 'pause' ? 'paused' : 'active';
  if (option === 'pause') pauseActivities(L, 'sys.daily.adjust', option);
  routine.minimumMinutes = option === 'short' ? 5 : 15;
  routine.reason = option === 'pause' ? '달라진 형편에 맞춰 잠시 쉬기로 했다.' : option === 'short' ? '더 짧은 시간으로 생활 원칙을 조정했다.' : '가능한 범위에서 생활 원칙을 이어가기로 했다.';
  d.nextReviewYear = L.year + 3;
  const id = `daily.adjust.${L.year}`;
  d.history.push({ id, year: L.year, kind: 'routine', routineId: routine.id, choiceId: option, text: routine.reason });
  queueDailyOutcome(L, { id: `${id}.review`, sourceEventId: 'sys.daily.adjust', choiceId: option,
    dueYear: L.year + 1, kind: 'routine-review', routineId: routine.id, text: '앞서 정한 생활 방식과 지금의 여건을 다시 살폈다.' });
  if (d.summary) d.summary.routine = copy(routine);
}

function resolveIncomeGap(L, ctx, option) {
  const d = ensureDailyLife(L);
  if (!d) return;
  d.nextIncomeReviewYear = L.year + 3;
  if (option === 'pause') pauseActivities(L, 'sys.daily.income-gap', option);
  const routine = currentRoutine(d);
  if (routine) {
    routine.status = option === 'pause' ? 'paused' : 'active';
    routine.minimumMinutes = option === 'short' ? 5 : 15;
    routine.reason = option === 'pause' ? '소득 공백 동안 생활 원칙을 쉬기로 했다.' : '소득 공백에 맞춰 추가 지출 없는 개인 시간을 원칙으로 정했다.';
  }
  const id = `daily.income-gap.${L.year}`;
  d.history.push({ id, year: L.year, kind: 'routine', sourceEventId: 'sys.daily.income-gap', choiceId: option,
    text: option === 'pause' ? '수입이 줄어 개인 생활 원칙을 잠시 쉬기로 했다.' : '수입이 줄어 추가 비용 없는 개인 시간을 남기기로 했다. 새 활동이나 만남을 완료한 기록은 아니다.' });
  queueDailyOutcome(L, { id: `${id}.review`, sourceEventId: 'sys.daily.income-gap', choiceId: option,
    dueYear: L.year + 1, kind: 'income-review', previousIncome: d.ledger[L.year]?.income ?? 0,
    text: '수입 공백 뒤 생활 원칙을 현재 형편과 다시 비교했다.' });
}

function resolveMeal(L, ctx, option) {
  const d = ensureDailyLife(L);
  if (!d) return;
  d.nextMealReviewYear = L.year + 3;
  d.mealPolicy = { id: `daily.meal.${L.year}`, sourceEventId: 'sys.daily.meal', choiceId: option,
    selectedYear: L.year, effectiveYear: L.year + 1, kind: 'game-assumption' };
  d.history.push({ id: d.mealPolicy.id, sourceEventId: 'sys.daily.meal', choiceId: option, year: L.year, kind: 'plan',
    text: option === 'cook' ? '다음 해 조리 시간을 더 배정하는 식사비용 원칙을 정했다.' : option === 'budget' ? '다음 해 저렴한 메뉴를 먼저 살피는 식사비용 원칙을 정했다.' : '다음 해에도 현재 식사비용 원칙을 유지하기로 했다.' });
  queueDailyOutcome(L, { id: `${d.mealPolicy.id}.review`, sourceEventId: 'sys.daily.meal', choiceId: option,
    dueYear: L.year + 1, kind: 'meal-review', policyId: d.mealPolicy.id, text: '식사비용 원칙의 당해 장부 적용 여부를 살폈다.' });
}

export const choices = { 'sys.daily.plan': resolvePlan, 'sys.daily.adjust': resolveAdjustment,
  'sys.daily.income-gap': resolveIncomeGap, 'sys.daily.meal': resolveMeal };

export function finishDailyYear(L) {
  const d = ensureDailyLife(L);
  if (!d) return;
  settleDailyOutcomes(L, {
    'life-event-review': lifeEventReviewHandler,
    'income-review': {
      eligible: state => state.age >= 19 && !!state.dailyLife.ledger[state.year],
      apply: (state, item) => { item.incomeNow = state.dailyLife.ledger[state.year].income;
        item.text = item.incomeNow > item.previousIncome ? '수입이 늘어난 기록을 확인했다. 생활 회복이나 활동 완료를 뜻하지는 않는다.' : '수입 공백 이후에도 개인 시간 원칙을 현재 형편에 맞춰 살폈다.'; },
    },
    'meal-review': {
      eligible: (state, item) => state.dailyLife.mealPolicy?.id === item.policyId && !!state.dailyLife.ledger[state.year],
      apply: (state, item) => { const discount = state.dailyLife.ledger[state.year].mealAdjustment?.discount || 0;
        item.text = discount > 0 ? '식사비용 원칙의 작은 절약 가정을 당해 생활비 장부에 반영했다. 실제 식사를 관측한 기록은 아니다.' : '식사비용 원칙을 확인했지만 조건에 맞는 절약 거래는 적용하지 않았다.'; },
    },
    'routine-review': {
      eligible: (state, item) => state.dailyLife.routines.some(r => r.id === item.routineId) && state.age >= 19,
      apply: (state, item) => {
        const r = state.dailyLife.routines.find(x => x.id === item.routineId);
        r.reviewedAt = state.year;
        // 검토는 활동 완료나 회복·친구의 도움을 의미하지 않는다.
      },
    },
  });
  if (d.summary?.year === L.year) d.summary.routine = currentRoutine(d) ? copy(currentRoutine(d)) : null;
  finalizeDailyLedger(L);
}

export function finalizeDailyLedger(L) {
  const d = L.dailyLife, ledger = d?.ledger[L.year];
  if (!ledger) return;
  ledger.closingCash = L.money.assets;
  ledger.otherCashChange = L.money.assets - ledger.balanceAfterAnnualBudget;
  ledger.finalized = true;
  if (d.summary?.year === L.year) d.summary.ledger = copy(ledger);
}
