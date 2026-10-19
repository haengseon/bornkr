import test from 'node:test';
import assert from 'node:assert/strict';
import { newLife, runToEnd, replay, choose, advanceYear } from '../../src/engine/index.js';
import { makeCtx } from '../../src/engine/life.js';
import { step, choices, LATE } from '../../src/engine/choice-cadence.js';

const at = (age, gap = 6) => {
  const L = newLife({ seed: 50 }); L.age = age; L.year = L.birth.year + age;
  L.yr.asked = false; L.lastChoiceAge = age - gap;
  return L;
};
const noLate = L => { L.flags.lateAsked = Object.fromEntries(Object.keys(LATE).map(k => [k, 1])); return L; };

test('5세부터 6년 공백을 보충하고 최근 결정·사망·그해 질문이 있으면 묻지 않는다', () => {
  for (const age of [4, 5, 17, 35, 80, 119]) {
    const L = noLate(at(age)); step(L, makeCtx(L));
    assert.equal(!!L.pending, age >= 5);
    if (L.pending) {
      assert.equal(L.pending.cadence, true);
      assert.equal(L.pending.options.length, 3);
      assert.ok(L.pending.options.every(o => o.effects.length));
    }
  }
  for (const patch of [{ lastChoiceAge: 30 }, { alive: false }]) {
    const L = at(35); Object.assign(L, patch); step(L, makeCtx(L)); assert.equal(L.pending, null);
  }
  const L = at(35); L.yr.asked = true; step(L, makeCtx(L)); assert.equal(L.pending, null);
});

test('생활 방향은 10년 구간당 1회·생애 3회만 묻고 두 번째부터 직전 선택이 기본값이다', () => {
  const L = at(35); step(L, makeCtx(L)); choose(L, 'people');
  L.age = 42; L.year += 7; L.yr.asked = false; L.lastChoiceAge = 37; step(L, makeCtx(L)); assert.equal(L.pending, null);   // 6년 미만
  L.age = 43; L.year += 1; L.yr.asked = false; L.lastChoiceAge = 37; step(L, makeCtx(L));
  assert.equal(L.pending.defaultId, 'people'); choose(L, 'rest');
  L.age = 49; L.year += 6; L.yr.asked = false; L.lastChoiceAge = 43; step(L, makeCtx(L)); assert.equal(L.pending, null);   // 같은 40대
  noLate(L);
  L.age = 55; L.year += 6; L.yr.asked = false; L.lastChoiceAge = 49; step(L, makeCtx(L)); assert.ok(L.pending); choose(L, 'rest');   // 세 번째
  L.age = 65; L.year += 10; L.yr.asked = false; L.lastChoiceAge = 55; step(L, makeCtx(L)); assert.equal(L.pending, null);   // 생애 3회 상한
});

test('구간 예산을 모두 써도 주기적 선택을 묻고 그 예산은 늘리지 않는다', () => {
  const L = noLate(at(70)); L.stageChoices.late.sys = 3; L.stageChoices.late.chance = 1;
  step(L, makeCtx(L));
  assert.equal(L.pending.eventId, 'sys.life.direction');
  assert.deepEqual(L.stageChoices.late, { sys: 3, chance: 1, cadence: 1 });
});

test('2년째 만난 생활 선택은 묻되 직전 해에 골랐거나 루틴이면 자동 진행한다', () => {
  const R = at(35); R.lastChoiceAge = 30;
  makeCtx(R).ask({ eventId: 'sys.edu.tutoring', options: ['more', 'keep', 'less'], defaultId: 'keep' });
  assert.equal(R.pending, null); assert.equal(R.choices.at(-1).routine, true);   // 루틴은 보충 규칙으로 다시 묻지 않는다(F-1)
  for (const gap of [1, 2]) {
    const L = at(35); L.lastChoiceAge = L.age - gap;
    makeCtx(L).ask({ eventId: 'sys.crisis.social_meet', options: ['join', 'alone'], defaultId: 'alone' });
    assert.equal(!!L.pending, gap === 2);
    if (gap === 1) assert.equal(L.choices.at(-1).routine, true);
    else assert.equal(L.pending.cadence, true);
  }
});

test('보충 선택 결과가 실제 지표와 기록에 남고 저장 후에도 동일하게 해소된다', () => {
  const A = at(35); step(A, makeCtx(A));
  const B = JSON.parse(JSON.stringify(A));
  const C = at(35); C.stats.health = 50;
  choices['sys.life.direction'](C, makeCtx(C), 'rest', A.pending.data);
  assert.equal(C.stats.health, 52);
  const a = choose(A, 'rest'), b = choose(B, 'rest');
  assert.deepEqual(A, B); assert.deepEqual(a.entries, b.entries);
  const entry = a.entries.find(e => e.id === 'sys.life.direction' && e.kind === 'choice');
  assert.match(entry.text, /몸을 쉬게/); assert.equal(entry.effects.stats.health, 2);
  assert.equal(A.choices.find(c => c.eventId === 'sys.life.direction' && c.option === 'rest').cadence, true);
});

test('모델1·2 전체 생애에서 60세 전 질문 공백은 최대10년이며 수동 선택 재생도 일치한다', () => {
  for (const modelVersion of [1, 2]) for (const seed of [1, 3, 7, 50, 67, 529]) {
    const L = newLife({ seed, modelVersion }), ages = [];
    while (L.alive) {
      if (L.pending) { ages.push(L.age); choose(L, L.pending.options.at(-1).id); }
      else advanceYear(L);
    }
    let last = 2;   // 생활 방향이 생애 3회로 줄어 60세 전 공백만 보장한다(60세 이후는 노년 선택이 채우되 시설·중증 돌봄 구간은 빌 수 있다)
    for (const age of ages) { if (age < 60) assert.ok(age - last <= 10, `${modelVersion}/${seed}: ${last}→${age}`); last = age; }
    if (L.age >= 5 && L.age < 60) assert.ok(L.age - last <= 10, `${seed}: 마지막 공백`);
    assert.equal(new Set(ages).size, ages.length);
    const R = replay(seed, L.choices, { modelVersion });
    assert.deepEqual(R.log, L.log); assert.deepEqual(R.choices, L.choices);
  }
});

test('노년 선택은 상태에 맞을 때만 생애 1회씩 묻고 고른 결과가 이후 해마다 이어진다', () => {
  const ask = (L, kind) => { L.yr.asked = false; L.pending = null; L.lastChoiceAge = L.age - 6; L.flags.lateAsked = Object.fromEntries(Object.keys(LATE).filter(k => k !== kind).map(k => [k, 1])); step(L, makeCtx(L)); if (L.pending?.data?.kind) assert.equal(L.pending.eventId, `sys.late.${L.pending.data.kind}`); return L.pending?.data?.kind === kind; };
  const pick = (L, o) => { choices['sys.life.direction'](L, makeCtx(L), o, L.pending.data); L.pending = null; };
  const next = (L, n = 1) => { for (let i = 0; i < n; i++) { L.age++; L.year++; L.yr.asked = true; step(L, makeCtx(L)); } };
  // 연기연금: 2007년 이전엔 없고, 미루면 5년간 0 → 36% 가산
  const P = at(63); P.year = 2005; P.aging.pensionStart = 2005; P.aging.pensionMonthly = 100; assert.equal(ask(P, 'pension'), false);
  P.year = 2010; P.aging.pensionStart = 2010; assert.equal(ask(P, 'pension'), true);
  pick(P, 'defer'); assert.equal(P.aging.pensionMonthly, 0); next(P, 4); assert.equal(P.aging.pensionMonthly, 0); next(P); assert.equal(P.aging.pensionMonthly, 136);
  assert.equal(ask(P, 'pension'), false);   // 생애 1회
  // 합가: 배우자가 있거나 자녀가 없으면 묻지 않는다. 합가하면 고립이 풀린다
  const W = at(72); W.family.partner = { age: 72 }; W.family.children = [{ alive: true }]; assert.equal(ask(W, 'together'), false);
  W.family.partner = null; W.family.children = []; assert.equal(ask(W, 'together'), false);
  W.family.children = [{ alive: true }]; W.aging.isolated = true; assert.equal(ask(W, 'together'), true);
  pick(W, 'join'); assert.equal(W.aging.isolated, false); W.aging.isolated = true; next(W); assert.equal(W.aging.isolated, false);
  // 주택연금: 자가일 때만, 받는 만큼 집 지분이 줄고 집을 떠나면 끊긴다
  const H = at(66); H.year = 2015; H.home.owned = false; assert.equal(ask(H, 'homePension'), false);
  Object.assign(H.home, { owned: true, parents: false, tenure: 'own', value: 40000, mortgageBalance: 0 }); H.aging.pensionMonthly = 50;
  assert.equal(ask(H, 'homePension'), true); pick(H, 'join'); assert.equal(H.aging.pensionMonthly, 150);
  next(H); assert.equal(H.home.value, 40000 - 1200);
  H.home.owned = false; next(H); assert.equal(H.aging.pensionMonthly, 50);
  // 검진·운동: 해마다 건강 성향이 쌓인다. 치매면 묻지 않는다
  const E = at(64); E.health.conditions.push({ key: 'dementia', active: true }); assert.equal(ask(E, 'habit'), false);
  E.health.conditions = []; assert.equal(ask(E, 'habit'), true); pick(E, 'habit'); next(E, 3); assert.ok((E.lean?.health ?? 0) > 0.1);
  // 일: 다시 일하기로 하면 career가 읽는 afterWork가 남는다
  const J = at(62); J.job.status = 'retired'; assert.equal(ask(J, 'work'), true); pick(J, 'rest'); assert.equal(J.flags.afterWork, 'rest');
});
