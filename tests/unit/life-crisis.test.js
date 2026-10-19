import test from 'node:test';
import assert from 'node:assert/strict';
import { CRISIS_EVENTS } from '../../src/content/life-crisis.js';
import { step, choices, ensureCrisis, finishYear, crisisRiskContext } from '../../src/engine/life-crisis.js';
import { settleYear } from '../../src/engine/wellbeing.js';

function life() {
  return { modelVersion: 2, alive: true, year: 2020, age: 30, yr: { asked: false }, pending: null,
    job: { status: 'employed', code: 'job.a', history: [{ from: 2015 }], wage: 3000 },
    family: { married: true, partner: { no: 1, since: 2018, alive: true, bond: 60 }, parents: {} },
    identityStrain: { stress: 14, confusion: 8 }, health: { conditions: [] }, stats: { health: 80, happiness: 60 },
    dailyLife: { facts: [], summary: { year: 2020, time: { sleep: 480, personal: 60, total: 1440 } } }, log: [] };
}
function context(L, response = true) {
  return { asked: [], lost: 0, divorces: 0, chance: () => response,
    ask(req) { this.asked.push(req); }, emit(e) { L.log.push(e); },
    act: { loseJob() { L.job.status = 'seeking'; L.job.wage = 0; this.owner.lost++; },
      divorce() { L.family.married = false; L.family.partner = null; this.owner.divorces++; } },
    init() { this.act.owner = this; return this; } }.init();
}
function next(L) { L.year++; L.age++; L.yr = { asked: false }; L.dailyLife.summary = { year: L.year, time: { sleep: 480, personal: 60, total: 1440 } }; }
const jobKey = L => `${L.job.code}:${L.job.history.length}:${L.job.history.at(-1).from}`;
const spouseKey = L => `${L.family.partner.no}:${L.family.partner.since}`;
function pick(L, ctx, key, option, data = {}) {
  choices[CRISIS_EVENTS[key].id](L, ctx, option, { crisisKey: key,
    ...(key.startsWith('work') && { jobKey: jobKey(L) }), ...(key.startsWith('family') && L.family.partner && { spouseKey: spouseKey(L) }), ...data });
}
function untilNotice(L, ctx) {
  pick(L, ctx, 'workDay', 'miss'); next(L);
  pick(L, ctx, 'workReview', 'miss'); next(L);
  pick(L, ctx, 'workReview', 'miss'); next(L);
}

test('높은 스트레스만으로 과거 실패·병명·고용 종료·이혼·사망을 생성하지 않는다', () => {
  const L = life(), ctx = context(L), before = structuredClone({ job: L.job, family: L.family, health: L.health });
  step(L, ctx); finishYear(L, ctx);
  assert.equal(ctx.asked[0].eventId, CRISIS_EVENTS.recoveryDay.id);
  assert.deepEqual({ job: L.job, family: L.family, health: L.health }, before);
  assert.equal(L.alive, true); assert.equal(ctx.lost, 0); assert.equal(ctx.divorces, 0);
  assert.equal(crisisRiskContext(L).active, false); assert.deepEqual(L.dailyLife.facts, []);
});

test('수면 부족은 현재의 명시적 수면 축소 선택에서만 생기고 시간 총량을 보존한다', () => {
  const L = life(), ctx = context(L); pick(L, ctx, 'recoveryDay', 'late');
  assert.equal(L.dailyLife.summary.time.sleep, 420); assert.equal(L.dailyLife.summary.time.unfinishedWork, 60);
  assert.equal(L.dailyLife.facts.find(f => f.key === 'sleep.shortfall').year, L.year);
  assert.ok(L.dailyLife.facts.every(f => f.sourceEventId === CRISIS_EVENTS.recoveryDay.id));
  assert.equal(L.dailyLife.summary.time.total, 1440);
  const M = life(); pick(M, context(M), 'recoveryDay', 'sleep'); assert.deepEqual(M.dailyLife.facts, []);
});

test('실제 반복 미이행→경고→통지→응답→다음해 효력일을 거쳐서만 해당 고용을 종료한다', () => {
  const L = life(), ctx = context(L); untilNotice(L, ctx);
  assert.equal(L.lifeCrisis.work.misses, 3); assert.equal(L.lifeCrisis.work.warnings, 2);
  assert.equal(L.job.status, 'employed'); assert.equal(ctx.lost, 0);
  pick(L, ctx, 'workNotice', 'accept'); finishYear(L, ctx); assert.equal(ctx.lost, 0);
  next(L); finishYear(L, ctx); assert.equal(ctx.lost, 1); assert.equal(L.job.status, 'seeking');
  finishYear(L, ctx); assert.equal(ctx.lost, 1); assert.equal(L.lifeCrisis.losses[0].kind, 'employment');
  assert.ok(L.lifeCrisis.history.some(e => e.domain === 'employment-end' && e.status === 'completed'));
  assert.ok(L.lifeCrisis.history.some(e => /통지된 날짜에 일자리를 잃었다/.test(e.text)));
});

test('승인 휴가·거절 후 정상 이행·합의된 조정은 무단 근태 위반으로 계산하지 않는다', () => {
  for (const response of [true, false]) {
    const L = life(), ctx = context(L, response); pick(L, ctx, 'workDay', 'leave');
    assert.equal(L.lifeCrisis.work.misses, 0); assert.equal(ctx.lost, 0);
    assert.equal(L.dailyLife.facts.some(f => f.key === 'routine.failure'), false);
  }
  const L = life(), ctx = context(L); pick(L, ctx, 'workDay', 'miss'); next(L); pick(L, ctx, 'workReview', 'adjust');
  assert.equal(L.lifeCrisis.work.misses, 0); assert.equal(L.lifeCrisis.work.stage, 'adjusted');
  next(L); finishYear(L, ctx); assert.equal(ctx.lost, 0);
  assert.ok(L.lifeCrisis.history.some(e => e.domain === 'attendance' && e.approved === false));
});

test('새 일자리·자영업·무직에는 이전 직장의 종료 절차를 적용하지 않는다', () => {
  const L = life(), ctx = context(L); untilNotice(L, ctx); pick(L, ctx, 'workNotice', 'accept'); next(L);
  L.job.code = 'job.b'; L.job.history.push({ from: L.year }); finishYear(L, ctx);
  assert.equal(ctx.lost, 0); assert.equal(L.job.status, 'employed'); assert.equal(L.lifeCrisis.work.stage, 'canceled');
  const M = life(), other = context(M); M.job.status = 'self'; pick(M, other, 'workDay', 'miss');
  assert.equal(M.lifeCrisis.work, null); assert.equal(other.lost, 0);
});

test('현재 공동 약속 실패와 상대 응답·거리두기·양쪽 의사·절차 확인 없이 이혼하지 않는다', () => {
  const L = life(), ctx = context(L); pick(L, ctx, 'familyDay', 'miss'); next(L);
  pick(L, ctx, 'familyDay', 'miss'); next(L); pick(L, ctx, 'familyReview', 'separate');
  assert.equal(L.family.married, true); assert.equal(L.lifeCrisis.family.stage, 'separated');
  const partner = L.family.partner; next(L); pick(L, ctx, 'familySeparate', 'end');
  assert.equal(L.lifeCrisis.family.mutualConsent, true); assert.equal(L.family.partner, partner); assert.equal(ctx.divorces, 0);
  next(L); pick(L, ctx, 'familyConfirm', 'confirm'); assert.equal(ctx.divorces, 1);
  assert.equal(L.family.partner, null); assert.equal(L.lifeCrisis.losses[0].kind, 'relationship');
  pick(L, ctx, 'familyConfirm', 'confirm'); assert.equal(ctx.divorces, 1);
});

test('재협의는 갈등 연쇄를 멈추며 배우자 미동의나 재혼 대상 변경은 이혼을 막는다', () => {
  const L = life(), ctx = context(L); pick(L, ctx, 'familyDay', 'miss'); next(L);
  pick(L, ctx, 'familyReview', 'repair'); assert.equal(L.lifeCrisis.family.missed, 0);
  assert.equal(L.lifeCrisis.family.stage, 'together'); assert.equal(ctx.divorces, 0);
  const M = life(), other = context(M, false); pick(M, other, 'familyReview', 'separate');
  assert.equal(M.lifeCrisis.family.stage, 'conflict'); assert.equal(other.divorces, 0);
  next(M); pick(M, other, 'familyConfirm', 'confirm'); assert.equal(other.divorces, 0);
  const N = life(), third = context(N); const old = spouseKey(N); N.family.partner.no = 2;
  pick(N, third, 'familyDay', 'miss', { spouseKey: old }); assert.equal(N.lifeCrisis.family, null);
});

test('혼자 쉬기와 정중한 불참은 고립이 아니며 실제 배제는 타인의 행동으로 기록한다', () => {
  const L = life(), ctx = context(L); pick(L, ctx, 'socialMeet', 'alone'); finishYear(L, ctx);
  assert.equal(L.lifeCrisis.social.isolatedSince, null); assert.equal(L.lifeCrisis.social.excluded, false);
  next(L); pick(L, ctx, 'socialMeet', 'join'); next(L); pick(L, ctx, 'socialReply', 'decline');
  assert.equal(L.lifeCrisis.social.missedReplies, 0); assert.equal(L.lifeCrisis.social.contact.accessible, true);
  next(L); pick(L, ctx, 'socialReply', 'ignore'); next(L); pick(L, ctx, 'socialReply', 'ignore');
  assert.equal(L.lifeCrisis.social.excluded, true);
  assert.ok(L.lifeCrisis.history.some(e => e.domain === 'exclusion' && e.actor === 'group-organizer'));
  L.family.partner = null; L.family.married = false; finishYear(L, ctx);
  assert.equal(L.lifeCrisis.social.isolatedSince, L.year);
  next(L); pick(L, ctx, 'exclusion', 'ask'); finishYear(L, ctx);
  assert.equal(L.lifeCrisis.social.excluded, false); assert.equal(L.lifeCrisis.social.isolatedSince, null);
});

test('실제 지원 응답을 골라 시간을 쓴 뒤에만 수령 사실과 회복을 기록한다', () => {
  const L = life(), ctx = context(L), c = ensureCrisis(L);
  c.support.push({ id: 'actual.request', year: L.year - 1, status: 'requested', sourceEventId: 'sys.crisis.support' });
  step(L, ctx); assert.equal(ctx.asked[0].eventId, CRISIS_EVENTS.supportReply.id);
  assert.equal(L.dailyLife.facts.some(f => f.key === 'support.received'), false);
  pick(L, ctx, 'supportReply', 'receive', { requestId: 'actual.request' });
  assert.equal(L.dailyLife.summary.time.personal, 45); assert.equal(L.dailyLife.summary.time.support, 15);
  finishYear(L, ctx); assert.equal(c.support[0].status, 'received'); assert.equal(L.wellbeing.identityRecovery.length, 1);
  finishYear(L, ctx); assert.equal(L.wellbeing.identityRecovery.length, 1);
});

test('특정 가족 요청의 응답은 그 당사자 생존·연락 여건을 재확인한다', () => {
  const L = life(), ctx = context(L); L.family.parents = { mother: { alive: false, bond: 70 }, father: { alive: true, bond: 70 } };
  L.wellbeing = { pending: [{ id: 'request.mother', kind: 'support-request', status: 'awaiting-consent', personId: 'mother', dueYear: L.year }] };
  pick(L, ctx, 'supportReply', 'receive', { requestId: 'request.mother', personId: 'mother' });
  assert.equal(L.wellbeing.pending[0].status, 'canceled'); assert.equal(L.dailyLife.facts.length, 0);
  settleYear(L, ctx); assert.equal(L.wellbeing.identityRecovery.length, 0);
});

test('복합위기 위험 문맥은 실제 복합 근거·연속 연말을 요구하고 읽기만 하며 지원 뒤 해제한다', () => {
  const L = life(), ctx = context(L), c = ensureCrisis(L); L.family.partner = null; L.family.married = false;
  c.social = { contact: { id: 'actual.contact', accessible: false }, desiredContact: true, missedReplies: 2, isolatedSince: L.year - 1, excluded: false };
  c.losses.push({ id: 'actual.job.loss', year: L.year - 1, kind: 'employment' });
  const addFacts = () => { L.dailyLife.facts = ['sleep.shortfall', 'routine.failure'].map(key => ({ id: `${key}:${L.year}`, key, year: L.year, validUntil: L.year, status: 'confirmed' })); };
  addFacts(); finishYear(L, ctx); assert.equal(crisisRiskContext(L).persistent, false);
  next(L); addFacts(); finishYear(L, ctx); finishYear(L, ctx);
  assert.equal(crisisRiskContext(L).active, true); assert.equal(crisisRiskContext(L).persistent, true);
  const before = structuredClone(L); const risk = crisisRiskContext(L); assert.deepEqual(L, before); assert.ok(risk.sourceIds.includes('actual.job.loss'));
  c.support.push({ id: 'actual.support', year: L.year, receivedYear: L.year, status: 'received' });
  assert.equal(crisisRiskContext(L).supportReceived, true); assert.equal(crisisRiskContext(L).active, false);
  L.identityStrain.stress = 0; assert.equal(crisisRiskContext(L).severe, false); assert.equal(L.alive, true); assert.deepEqual(L.health.conditions, []);
});

test('구버전·미성년·사망 상태는 새 연쇄나 위험 상태를 만들지 않는다', () => {
  for (const patch of [{ modelVersion: 1 }, { age: 18 }, { alive: false }]) {
    const L = Object.assign(life(), patch), ctx = context(L), before = structuredClone(L);
    step(L, ctx); finishYear(L, ctx); assert.equal(crisisRiskContext(L).active, false); assert.deepEqual(L, before);
  }
  const partial = life(); partial.lifeCrisis = {}; const before = structuredClone(partial);
  assert.equal(crisisRiskContext(partial).active, false); assert.deepEqual(partial, before);
});

test('이웃 모임 거절은 간격을 늘리고 2회면 그 생애에선 끝나며 요양시설·치매에선 묻지 않는다', () => {
  const asks = L => { const ctx = context(L); step(L, ctx); return ctx.asked.filter(r => r.eventId === CRISIS_EVENTS.socialMeet.id).length; };
  const L = life(); L.identityStrain = { stress: 0, confusion: 0 };
  assert.equal(asks(L), 1); pick(L, context(L), 'socialMeet', 'alone');
  const gap = L.lifeCrisis.nextSocialYear - L.year; assert.equal(gap, 4);
  for (let i = 0; i < gap; i++) next(L);
  assert.equal(asks(L), 1); pick(L, context(L), 'socialMeet', 'alone');
  for (let i = 0; i < 30; i++) { next(L); assert.equal(asks(L), 0); }
  const F = life(); F.identityStrain = { stress: 0, confusion: 0 }; F.home = { tenure: 'facility' }; assert.equal(asks(F), 0);
  const D = life(); D.identityStrain = { stress: 0, confusion: 0 }; D.health.conditions = [{ key: 'dementia', active: true }]; assert.equal(asks(D), 0);
});
