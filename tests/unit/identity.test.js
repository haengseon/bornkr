import test from 'node:test';
import assert from 'node:assert/strict';
import { ensureIdentity, identityPreview, applyIdentityChoice, identityYear } from '../../src/engine/identity.js';
import { identityConcernOf } from '../../src/engine/concerns.js';

const life = () => ({ age: 19, year: 2020, modelVersion: 2, alive: true, mbti: { EI: 0, SN: 100, TF: 100, JP: 100 }, stats: { happiness: 70 }, log: [] });
const option = (id, weights) => ({ id, label: id, personality: { weights } });
const request = (...options) => ({ eventId: 'daily.example', options });

test('성년 경계와 독립 적합도: 복수 초록·전부 중립을 허용하고 성인 축을 바꾸지 않는다', () => {
  const L = life(), options = [option('a', { I: .6 }), option('b', { N: .5 }), option('c', { E: 1 })], req = request(...options);
  const before = structuredClone(L);
  assert.deepEqual(options.map(o => identityPreview(L, req, o).alignment), ['aligned', 'aligned', 'opposed']);
  assert.deepEqual(L, before);
  L.age = 18;
  assert.equal(identityPreview(L, req, options[2]).visible, false);
  assert.equal(identityPreview(L, req, options[2]).stress, 0);
  L.age = 19; Object.keys(L.mbti).forEach(k => { L.mbti[k] = 50; });
  assert.deepEqual(options.map(o => identityPreview(L, req, o).alignment), ['neutral', 'neutral', 'neutral']);
});

test('정확한 ±0.25, 글자 부호와 약한 가중치를 증폭하지 않는 계산', () => {
  const L = life(); L.mbti.EI = 75;
  const a = option('a', { E: .5 }), b = option('b', { I: .5 }), weak = option('w', { E: .1 }), req = request(a, b, weak);
  assert.equal(identityPreview(L, req, a).score, .25);
  assert.equal(identityPreview(L, req, a).alignment, 'aligned');
  assert.equal(identityPreview(L, req, b).score, -.25);
  assert.equal(identityPreview(L, req, b).alignment, 'opposed');
  assert.equal(identityPreview(L, req, weak).score, .05);
  assert.equal(identityPreview(L, req, weak).alignment, 'neutral');
  for (const [positive, negative] of [['N', 'S'], ['F', 'T'], ['J', 'P']]) {
    assert.equal(identityPreview(L, req, option('p', { [positive]: 1 })).score, 1);
    assert.equal(identityPreview(L, req, option('n', { [negative]: 1 })).score, -1);
  }
});

test('누락·빈 값·합 초과·음수·양극 중복·잘못된 축은 부담을 만들지 않는다', () => {
  const L = life();
  for (const weights of [undefined, {}, { E: .8, N: .3 }, { E: -1 }, { E: 1.1 }, { E: NaN }, { E: .3, I: .3 }, { X: 1 }]) {
    const o = option('a', weights), p = identityPreview(L, request(o, option('b', {})), o);
    assert.equal(p.alignment, 'neutral'); assert.equal(p.stress, 0); assert.equal(p.confusion, 0);
  }
  delete L.mbti.EI;
  assert.equal(identityPreview(L, request(), option('a', { E: 1 })).score, null);
});

test('불가능한 대안·자동·강제 상황은 감면하고 예상치와 실제 가산은 일치한다', () => {
  const a = option('a', { E: 1 }), b = option('b', { I: 1 }), req = request(a, b);
  for (const context of [{ auto: true }, { forced: true }]) {
    const L = life(); assert.equal(applyIdentityChoice(L, req, a, context).stress, 0); assert.equal(L.identityStrain.stress, 0);
  }
  for (const impossible of [{ ...b, feasible: false }, { ...b, disabled: true }]) assert.equal(identityPreview(life(), request(a, impossible), a).stress, 0);
  assert.equal(identityPreview(life(), { ...req, forced: true }, a).stress, 0);
  const L = life(), before = { ...L.mbti }, preview = identityPreview(L, req, a), applied = applyIdentityChoice(L, req, a);
  assert.equal(applied.stress, preview.stress); assert.equal(L.identityStrain.stress, preview.stress);
  assert.equal(L.identityStrain.confusion, preview.confusion); assert.deepEqual(L.mbti, before);
  assert.equal(identityPreview(life(), request({ ...a, disabled: true }, b), { ...a, disabled: true }).stress, 0);
});

test('동일 결과는 한 번만 적용하고 연간·전체 상한을 지킨다', () => {
  const L = life(), a = option('a', { E: 1 }), req = request(a, option('b', {}));
  applyIdentityChoice(L, req, a, { outcomeId: 'first' });
  const snapshot = structuredClone(L.identityStrain);
  assert.equal(applyIdentityChoice(L, req, a, { outcomeId: 'first' }).duplicate, true);
  assert.deepEqual(L.identityStrain, snapshot);
  for (let year = 2020; year <= 2024; year++) {
    L.year = year;
    for (let i = 0; i < 6; i++) applyIdentityChoice(L, req, a, { outcomeId: `${year}:${i}` });
    assert.ok((L.identityStrain.annual[year]?.stress ?? 0) <= 8); assert.ok((L.identityStrain.annual[year]?.confusion ?? 0) <= 4);
  }
  assert.equal(L.identityStrain.stress, 20); assert.equal(L.identityStrain.confusion, 10);
});

test('지원 회복은 실제 잔량만 감소하고 같은 연도 재호출은 중복 회복하지 않는다', () => {
  const L = life(), s = ensureIdentity(L); s.stress = 1; s.confusion = 1;
  L.wellbeing = { identityRecovery: [{ id: 'support.1', year: 2020, stress: 9, confusion: 9 }] };
  identityYear(L); const before = structuredClone(s); identityYear(L);
  assert.deepEqual(s, before); assert.equal(s.stress, 0); assert.equal(s.confusion, 0);
  assert.equal(s.history.reduce((n, e) => n - e.stress, 0), 1);
});

function setConflict(L) {
  const s = ensureIdentity(L); s.stress = 12; s.confusion = 8;
  s.history = [2018, 2019, 2020].map(year => ({ id: `c${year}`, kind: 'choice', year, stress: 4, confusion: 2 }));
  return s;
}
test('5년 기록 창 이탈·회복 후 임계 미만은 누적 고민을 해제한다', () => {
  const L = life(), s = setConflict(L); identityYear(L); assert.equal(s.stage, 'conflict');
  L.year = 2025; identityYear(L); assert.equal(s.stage, 'stable'); assert.equal(s.concern, null);
  const M = life(), t = setConflict(M); identityYear(M); M.year++; t.stress = 5; t.confusion = 2; identityYear(M);
  assert.equal(t.stage, 'stable');
});

test('연속 연말과 실제 기능 근거가 모두 필요하며 연도 공백은 연속 판정을 끊는다', () => {
  const L = life(), s = setConflict(L); identityYear(L); L.year++;
  L.wellbeing = { identityEvidence: { year: L.year, sleepShortfall: true, routineFailures: true } };
  identityYear(L); assert.equal(s.stage, 'low-energy-candidate');
  const M = life(), t = setConflict(M); identityYear(M); M.year += 2;
  M.wellbeing = { identityEvidence: { year: M.year, sleepShortfall: true, routineFailures: true, workload: true, recoveryUnavailable: true } };
  identityYear(M); assert.notEqual(t.stage, 'exhaustion-candidate');
  const N = life(), u = setConflict(N); identityYear(N); N.year++; identityYear(N);
  assert.equal(u.stage, 'conflict'); assert.equal(N.stats.happiness, 70); assert.equal(N.alive, true);
});

test('고민 요약은 실제 원인·회복 이력만 읽고 기존 고민이나 저장 상태를 바꾸지 않는다', () => {
  const L = life(), a = option('a', { E: 1 }), req = { ...request(a, option('b', {})), prompt: '친구와의 약속' };
  applyIdentityChoice(L, req, a); const before = structuredClone(L);
  const summary = identityConcernOf(L);
  assert.equal(summary.causes[0].prompt, req.prompt); assert.equal(summary.causes[0].label, 'a');
  assert.deepEqual(L, before); L.modelVersion = 1; assert.equal(identityConcernOf(L), null);
});
