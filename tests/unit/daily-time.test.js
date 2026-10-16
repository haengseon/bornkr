import test from 'node:test';
import assert from 'node:assert/strict';
import { timeBudget } from '../../src/engine/daily-life.js';
const life = () => ({ year: 2025, job: { status: 'employed', code: 'jobA' }, edu: { stage: 'none' },
  family: {}, home: { region: 'seoul', tenure: 'monthly' }, dailyLife: {} });
const fields = ['sleep', 'work', 'study', 'commute', 'care', 'housework', 'activity', 'recovery', 'personal'];
test('승인된 당해 일정만 원장에서 파생하고 중복 호출·중복 원장으로 누적하지 않는다', () => {
  const L = life();
  const change = { id: 'approved', year: 2025, kind: 'commute', minutes: 20, eventId: 'LIFE-013' };
  L.dailyLife.scheduleChanges = [change, { ...change }, { ...change, id: 'old', year: 2024 },
    { ...change, id: 'canceled', status: 'canceled' }];
  const before = structuredClone(L);
  const time = timeBudget(L);
  assert.equal(time.commute, 80);
  assert.deepEqual(timeBudget(L), time);
  assert.deepEqual(L, before);
  assert.equal(time.source.filter(s => s.kind === 'approved-schedule').length, 1);
});
test('고용·거주 조건이 달라진 일정과 비정상 값을 배제하고 하루 상한을 지킨다', () => {
  const L = life();
  L.dailyLife.scheduleChanges = [
    { id: 'wrong-job', year: 2025, kind: 'workload', minutes: 20, eventId: 'x', jobCode: 'old' },
    { id: 'wrong-home', year: 2025, kind: 'commute', minutes: 20, eventId: 'y', homeRegion: 'busan' },
    { id: 'nan', year: 2025, kind: 'chores', minutes: NaN, eventId: 'z' },
    { id: 'negative', year: 2025, kind: 'chores', minutes: -9999, eventId: 'n' },
    { id: 'huge', year: 2025, kind: 'workload', minutes: 9999, eventId: 'h' }];
  const t = timeBudget(L);
  assert.equal(t.housework, 0);
  assert.ok(fields.every(f => Number.isFinite(t[f]) && t[f] >= 0 && t[f] <= 1440));
  assert.equal(fields.reduce((sum, key) => sum + t[key], 0), 1440);
  assert.ok(t.unmetMinutes > 0);
  L.job.status = 'seeking';
  assert.equal(timeBudget(L).work, 0);
});
test('조리·실행 활동·완료 휴식은 원인과 함께 남고 계획 휴식은 차감하지 않는다', () => {
  const L = life();
  L.dailyLife.mealPolicy = { id: 'meal', sourceEventId: 'sys.daily.meal', effectiveYear: 2025, choiceId: 'cook' };
  L.dailyLife.activities = [{ id: 'read', year: 2025, status: 'completed', minutes: 15, sourceEventId: 'choice' }];
  L.wellbeing = { pending: [
    { id: 'rest', kind: 'rest', status: 'completed', resolvedAt: 2025, sourceEventId: 'support' },
    { id: 'planned', kind: 'rest', status: 'planned', dueYear: 2025 } ] };
  const t = timeBudget(L);
  assert.equal(t.housework, 90); assert.equal(t.activity, 15); assert.equal(t.recovery, 15);
  assert.equal(fields.reduce((sum, key) => sum + t[key], 0), 1440);
  assert.ok(t.source.some(s => s.sourceEventId === 'choice'));
  assert.ok(t.source.some(s => s.sourceEventId === 'support'));
  assert.equal(t.kind, 'scenario');
});

test('실제 위기 시간은 발생 연도에만 재구성하고 중복 계산하지 않는다', () => {
  const L = life(); L.age = 35;
  const sleep = { id: 'sleep', key: 'sleep.shortfall', producer: 'life-crisis', status: 'confirmed', year: 2025, minutes: 60 };
  L.dailyLife.facts = [sleep, { ...sleep }, { id: 'support', key: 'support.received', producer: 'life-crisis', status: 'confirmed', year: 2025, minutes: 15 }, { ...sleep, id: 'old', year: 2024 }];
  const t = timeBudget(L);
  assert.equal(t.sleep, 420); assert.equal(t.unfinishedWork, 60); assert.equal(t.support, 15);
  assert.equal(Object.entries(t).filter(([k]) => [...fields, 'support', 'unfinishedWork'].includes(k)).reduce((s, [, n]) => s + n, 0), 1440);
  assert.deepEqual(timeBudget(L), t);
});
