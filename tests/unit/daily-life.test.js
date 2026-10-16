import { test } from 'node:test';
import assert from 'node:assert/strict';
import { newLife } from '../../src/engine/birth.js';
import { annualExpensePlan, ensureDailyLife, queueDailyOutcome, settleDailyOutcomes, step, recordAnnualLedger, finishDailyYear } from '../../src/engine/daily-life.js';
import { mealExpenseAdjustment } from '../../src/engine/daily-transactions.js';
import { recordDailyActivity, collectDailyFacts } from '../../src/engine/daily-facts.js';
import { eligibleLifeEvents, lifeEventOptions } from '../../src/engine/daily-eligibility.js';
import { eventActions } from '../../src/engine/life-event-actions.js';
import { LIFE_EVENTS } from '../../src/content/life-events.js';

function adult() {
  const L = newLife({ seed: 2468, forced: { year: 1980 } });
  L.age = 25; L.year = 2005;
  L.dailyLife.summary = { year: L.year, time: { personal: 100, total: 1440 }, routine: null };
  return L;
}

test('생활비 총액과 포함 항목은 한 번만 계산하고 초과 필수비는 보존', () => {
  const a = annualExpensePlan({ envelope: 2000, housing: 500, children: 300, medical: 100, support: 50, care: 100 });
  assert.equal(a.living, 1100); assert.equal(a.consumption, 2150);
  const b = annualExpensePlan({ envelope: 200, housing: 500, children: 300, medical: 100, support: 0, care: 0 });
  assert.equal(b.living, 0); assert.equal(b.consumption, 900);
});

test('모델1에는 새 생활 상태나 비용 계산을 소급하지 않는다', () => {
  const L = newLife({ seed: 1, modelVersion: 1 });
  assert.equal(ensureDailyLife(L), null); assert.equal(L.dailyLife, undefined);
});

test('예약은 같은 ID로 중복 등록·실행되지 않고 생애 종료 시 미래 예약도 취소', () => {
  const L = adult(), item = { id: 'review', sourceEventId: 'source', choiceId: 'a', dueYear: 2006, kind: 'review' };
  assert.equal(queueDailyOutcome(L, item), true); assert.equal(queueDailyOutcome(L, item), false);
  L.year = 2006; let n = 0;
  const handlers = { review: { eligible: () => true, apply: () => n++ } };
  settleDailyOutcomes(L, handlers); settleDailyOutcomes(L, handlers); assert.equal(n, 1);
  queueDailyOutcome(L, { ...item, id: 'future', dueYear: 2009 }); L.alive = false;
  settleDailyOutcomes(L, handlers); assert.equal(L.dailyLife.outcomes.future.status, 'canceled');
});

test('연말 현금은 후속 거래를 순변동으로 구분해 기록한다', () => {
  const L = adult();
  recordAnnualLedger(L, { closingCash: 100, expenses: {}, consumption: 200 });
  L.money.assets = 40; finishDailyYear(L);
  assert.equal(L.dailyLife.ledger[2005].closingCash, 40);
  assert.equal(L.dailyLife.ledger[2005].otherCashChange, -60);
  assert.equal(L.dailyLife.ledger[2005].finalized, true);
});

test('선택 상한에서 루틴 조정을 기본값으로 강제 실행하지 않는다', () => {
  const L = adult(); L.yr.asked = false; L.stageChoices.youth.sys = 7;
  L.dailyLife.routines.push({ id: 'quiet', status: 'paused', minimumMinutes: 5 });
  let asks = 0; step(L, { ask: () => asks++, emit: () => {} });
  assert.equal(asks, 0); assert.equal(L.dailyLife.routines[0].status, 'paused');
});

test('식사비 절약은 실제 선택 이후 다음해에만 작게 적용', () => {
  const L = adult();
  L.dailyLife.mealPolicy = { id: 'meal', choiceId: 'budget', sourceEventId: 'sys.daily.meal', selectedYear: 2005, effectiveYear: 2006 };
  const args = { living: 1000, foodReferenceAnnual: 1000, availableCookingMinutes: 30 };
  assert.equal(mealExpenseAdjustment(L, args).discount, 0);
  L.year = 2006; assert.equal(mealExpenseAdjustment(L, args).discount, 0);
  L.choices.push({ year: 2005, eventId: 'sys.daily.meal', option: 'budget' });
  assert.equal(mealExpenseAdjustment(L, args).discount, 10);
  L.year = 2007; assert.equal(mealExpenseAdjustment(L, args).discount, 0);
});

test('활동은 실제 선택·개인 시간 이후에만 기록하고 중단 이력으로 재개 사건 연결', () => {
  const L = adult();
  const data = { id: 'media', kind: 'media', status: 'completed', minutes: 15, accessConfirmed: true, sourceEventId: 'sys.daily.activity', choiceId: 'media' };
  assert.equal(recordDailyActivity(L, data), false);
  L.choices.push({ year: L.year, eventId: data.sourceEventId, option: data.choiceId });
  assert.equal(recordDailyActivity(L, data), true); assert.equal(L.dailyLife.summary.time.personal, 85);
  L.year++; L.dailyLife.summary.year = L.year; L.dailyLife.summary.time.personal = 100;
  L.choices.push({ year: L.year, eventId: 'sys.daily.adjust', option: 'pause' });
  assert.equal(recordDailyActivity(L, { ...data, status: 'paused', minutes: 0, sourceEventId: 'sys.daily.adjust', choiceId: 'pause' }), true);
  collectDailyFacts(L);
  const event = LIFE_EVENTS.find(e => e.id === 'LIFE-080');
  assert.ok(eligibleLifeEvents(L).some(e => e.id === event.id));
  const opt = lifeEventOptions(L, event).find(o => o.operation.actionId === 'resume-short-hobby-session');
  assert.ok(opt);
  L.choices.push({ year: L.year, eventId: event.id, option: opt.id });
  const result = eventActions(L, event, opt);
  assert.equal(result.executed, true);
  const remaining = L.dailyLife.summary.time.personal;
  assert.equal(eventActions(L, event, opt).executed, false);
  assert.equal(L.dailyLife.summary.time.personal, remaining);
});
