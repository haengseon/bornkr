import test from 'node:test';
import assert from 'node:assert/strict';
import { newLife, runToEnd, replay, choose, advanceYear } from '../../src/engine/index.js';
import { makeCtx } from '../../src/engine/life.js';
import { step, choices } from '../../src/engine/choice-cadence.js';

const at = age => {
  const L = newLife({ seed: 50 }); L.age = age; L.year = L.birth.year + age;
  L.yr.asked = false; L.lastChoiceAge = age - 3;
  return L;
};

test('5세부터 3년 공백을 보충하고 최근 결정·사망·그해 질문이 있으면 묻지 않는다', () => {
  for (const age of [4, 5, 17, 35, 80, 119]) {
    const L = at(age); step(L, makeCtx(L));
    assert.equal(!!L.pending, age >= 5);
    if (L.pending) {
      assert.equal(L.pending.cadence, true);
      assert.equal(L.pending.options.length, 3);
      assert.ok(L.pending.options.every(o => o.effects.length));
    }
  }
  for (const patch of [{ lastChoiceAge: 34 }, { alive: false }]) {
    const L = at(35); Object.assign(L, patch); step(L, makeCtx(L)); assert.equal(L.pending, null);
  }
  const L = at(35); L.yr.asked = true; step(L, makeCtx(L)); assert.equal(L.pending, null);
});

test('구간 예산을 모두 써도 주기적 선택을 묻고 그 예산은 늘리지 않는다', () => {
  const L = at(70); L.stageChoices.late.sys = 3; L.stageChoices.late.chance = 1;
  step(L, makeCtx(L));
  assert.equal(L.pending.eventId, 'sys.life.direction');
  assert.deepEqual(L.stageChoices.late, { sys: 3, chance: 1, cadence: 1 });
});

test('2년째 만난 생활 선택은 묻되 직전 해에 골랐다면 자동 진행한다', () => {
  for (const gap of [1, 2]) {
    const L = at(35); L.lastChoiceAge = L.age - gap;
    makeCtx(L).ask({ eventId: 'sys.edu.tutoring', options: ['more', 'keep', 'less'], defaultId: 'keep' });
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

test('모델1·2 전체 생애에서 질문 공백은 최대3년이며 수동 선택 재생도 일치한다', () => {
  for (const modelVersion of [1, 2]) for (const seed of [1, 3, 7, 50, 67, 529]) {
    const L = newLife({ seed, modelVersion }), ages = [];
    while (L.alive) {
      if (L.pending) { ages.push(L.age); choose(L, L.pending.options.at(-1).id); }
      else advanceYear(L);
    }
    let last = 2;
    for (const age of ages) { assert.ok(age - last <= 3, `${modelVersion}/${seed}: ${last}→${age}`); last = age; }
    if (L.age >= 5) assert.ok(L.age - last <= 3, `${seed}: 마지막 공백`);
    assert.equal(new Set(ages).size, ages.length);
    const R = replay(seed, L.choices, { modelVersion });
    assert.deepEqual(R.log, L.log); assert.deepEqual(R.choices, L.choices);
  }
});
