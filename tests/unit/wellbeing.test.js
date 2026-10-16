import test from 'node:test';
import assert from 'node:assert/strict';
import { step, choices, settleYear, finishYear, ensureWellbeing } from '../../src/engine/wellbeing.js';
import { ensureIdentity, identityYear } from '../../src/engine/identity.js';
import { SUPPORT_EVENT } from '../../src/content/wellbeing.js';

function life() {
  return { year: 2020, age: 30, modelVersion: 2, alive: true, yr: { asked: false },
    stats: { happiness: 60, health: 80 }, reasons: {}, log: [], job: { status: 'employed' },
    health: { conditions: [] }, family: { parents: { mother: { alive: true, bond: 70 } } },
    dailyLife: { summary: { year: 2020, time: { personal: 30, recovery: 0, total: 1440 } }, facts: [] },
    identityStrain: { stress: 12, confusion: 6, concern: { label: '내 선택과 나다움 사이' }, stage: 'conflict' } };
}
function context(L) {
  const c = { asked: [], entries: [], ask(req) { this.asked.push(req); }, emit(e) { this.entries.push(e); L.log.push({ ...e, year: L.year }); } };
  return c;
}
function nextYear(L, minutes = 30) { L.year++; L.age++; L.dailyLife.summary = { year: L.year, time: { personal: minutes, recovery: 0, total: 1440 } }; }

test('지원 선택은 성년 모델2에만 노출되고 열려 있는 결정·연간 결정과 중첩하지 않는다', () => {
  for (const patch of [{ modelVersion: 1 }, { age: 18 }, { alive: false }, { pending: {} }, { yr: { asked: true } }]) {
    const L = Object.assign(life(), patch), ctx = context(L); step(L, ctx); assert.equal(ctx.asked.length, 0);
  }
  const L = life(), ctx = context(L); step(L, ctx);
  assert.equal(ctx.asked.length, 1); assert.equal(ctx.asked[0].eventId, SUPPORT_EVENT);
  assert.deepEqual(ctx.asked[0].options.map(o => o.personality.weights), [{}, {}, {}]);
});

test('휴식 시간과 실제 연락 가능한 가족에 맞춰 선택 가능 여부를 제한한다', () => {
  const L = life(), ctx = context(L); L.dailyLife.summary.time.personal = 5; L.family.parents.mother.alive = false;
  step(L, ctx); const req = ctx.asked[0];
  assert.equal(req.options.find(o => o.id === 'rest').feasible, false);
  assert.equal(req.options.find(o => o.id === 'contact').feasible, false);
  assert.equal(req.options.find(o => o.id === 'keep').feasible, true);
  const M = life(), other = context(M); M.family.parents.mother.bond = 0; step(M, other);
  assert.equal(other.asked[0].options.find(o => o.id === 'contact').feasible, false);
});

test('높은 부담만으로 실제 수면·근태·관계 실패나 병명·사망을 만들지 않는다', () => {
  const L = life(), ctx = context(L), job = structuredClone(L.job), family = structuredClone(L.family);
  step(L, ctx); assert.equal(L.wellbeing.identityEvidence.routineFailures, false);
  assert.equal(L.wellbeing.identityEvidence.sleepShortfall, false);
  assert.deepEqual(L.wellbeing.sources, []); finishYear(L, ctx);
  assert.equal(L.stats.happiness, 60); assert.deepEqual(L.health.conditions, []);
  assert.deepEqual(L.job, job); assert.deepEqual(L.family, family); assert.equal(L.alive, true);
});

test('확정·유효한 실제 기록만 기능 근거로 연결하고 미래·만료·미확정 기록은 제외한다', () => {
  const L = life(), ctx = context(L);
  L.dailyLife.facts = [
    { id: 'valid', key: 'sleep.shortfall', sourceEventId: 'actual.sleep', year: 2020, validUntil: 2020, status: 'confirmed' },
    { id: 'future', key: 'routine.failure', year: 2021, validUntil: 2022, status: 'confirmed' },
    { id: 'old', key: 'routine.failure', year: 2018, validUntil: 2019, status: 'confirmed' },
    { id: 'pending', key: 'work.overload', year: 2020, validUntil: 2020, status: 'pending' },
  ];
  step(L, ctx); assert.equal(L.wellbeing.identityEvidence.sleepShortfall, true);
  assert.equal(L.wellbeing.identityEvidence.routineFailures, false); assert.equal(L.wellbeing.identityEvidence.workload, false);
  assert.deepEqual(L.wellbeing.sources.map(e => e.sourceEventId), ['actual.sleep']);
});

test('휴식 계획은 즉시 회복하지 않고 다음 해 실제 시간 배정 후 한 번만 회복한다', () => {
  const L = life(), ctx = context(L); choices[SUPPORT_EVENT](L, ctx, 'rest');
  assert.equal(L.wellbeing.identityRecovery.length, 0); settleYear(L, ctx); assert.equal(L.wellbeing.pending[0].status, 'planned');
  nextYear(L); settleYear(L, ctx);
  assert.equal(L.dailyLife.summary.time.personal, 15); assert.equal(L.dailyLife.summary.time.recovery, 15);
  assert.equal(L.wellbeing.pending[0].status, 'completed'); assert.equal(L.wellbeing.identityRecovery.length, 1);
  const snapshot = structuredClone(L.wellbeing); settleYear(L, ctx); assert.deepEqual(L.wellbeing, snapshot);
  ensureIdentity(L); identityYear(L); assert.ok(L.identityStrain.stress < 12);
});

test('다음 해 시간이 사라진 휴식 계획은 취소하며 회복을 소급 생성하지 않는다', () => {
  const L = life(), ctx = context(L); choices[SUPPORT_EVENT](L, ctx, 'rest'); nextYear(L, 0); settleYear(L, ctx);
  assert.equal(L.wellbeing.pending[0].status, 'canceled'); assert.deepEqual(L.wellbeing.identityRecovery, []);
  assert.equal(L.dailyLife.summary.time.recovery, 0); assert.equal(L.identityStrain.stress, 12);
});

test('도움 요청·동의는 실제 지원과 분리하고 요청과 인물이 일치한 지원만 회복한다', () => {
  const L = life(), ctx = context(L); choices[SUPPORT_EVENT](L, ctx, 'contact', { personId: 'mother', personLabel: '어머니' });
  const item = L.wellbeing.pending[0]; assert.equal(item.status, 'awaiting-consent'); assert.deepEqual(L.wellbeing.identityRecovery, []);
  nextYear(L); L.dailyLife.facts.push({ id: 'consent', key: 'support.accepted', personId: 'mother', requestId: item.id, year: L.year, validUntil: L.year, status: 'confirmed' });
  settleYear(L, ctx); assert.equal(item.status, 'awaiting-consent');
  L.dailyLife.facts.push({ id: 'unrelated', key: 'support.received', personId: 'mother', requestId: 'other-request', year: L.year, validUntil: L.year, status: 'confirmed' });
  settleYear(L, ctx); assert.deepEqual(L.wellbeing.identityRecovery, []);
  L.dailyLife.facts.push({ id: 'actual', key: 'support.received', personId: 'mother', requestId: item.id, year: L.year, validUntil: L.year, status: 'confirmed' });
  settleYear(L, ctx); assert.equal(item.status, 'completed'); assert.equal(L.wellbeing.identityRecovery.length, 1);
  settleYear(L, ctx); assert.equal(L.wellbeing.identityRecovery.length, 1);
});

test('가족이 사망하거나 연락 여건이 사라지면 지원 요청을 완료 처리하지 않는다', () => {
  const L = life(), ctx = context(L); choices[SUPPORT_EVENT](L, ctx, 'contact', { personId: 'mother' });
  nextYear(L); L.family.parents.mother.alive = false; settleYear(L, ctx);
  assert.equal(L.wellbeing.pending[0].status, 'canceled'); assert.deepEqual(L.wellbeing.identityRecovery, []);
});

test('지원 선택을 반복 적용하지 않고 다음 지원창까지 간격을 둔다', () => {
  const L = life(), ctx = context(L); choices[SUPPORT_EVENT](L, ctx, 'keep'); choices[SUPPORT_EVENT](L, ctx, 'keep');
  assert.equal(L.wellbeing.history.length, 1); nextYear(L); step(L, ctx); assert.equal(ctx.asked.length, 0);
});

test('실제 기능 저하 후보만 행복에 영향을 주고 동일 연도 총 감소는 최대3이다', () => {
  for (const [stage, expected] of [['stable', 0], ['conflict', 0], ['low-energy-candidate', 1], ['exhaustion-candidate', 3]]) {
    const L = life(), ctx = context(L); L.identityStrain.stage = stage;
    finishYear(L, ctx); finishYear(L, ctx);
    assert.equal(60 - L.stats.happiness, expected); assert.ok(L.wellbeing.happinessYears[L.year] <= 3);
    assert.equal(L.stats.health, 80); assert.equal(L.job.status, 'employed'); assert.deepEqual(L.health.conditions, []); assert.equal(L.alive, true);
  }
  const L = life(), ctx = context(L); L.stats.happiness = 1; L.identityStrain.stage = 'exhaustion-candidate';
  finishYear(L, ctx); assert.equal(L.stats.happiness, 0); assert.equal(ensureWellbeing(L).happinessYears[L.year], 1);
});
