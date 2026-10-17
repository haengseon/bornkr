import { test } from 'node:test';
import assert from 'node:assert/strict';
import { newLife } from '../../src/engine/birth.js';
import { makeCtx } from '../../src/engine/life.js';
import * as family from '../../src/engine/systems/family.js';
import * as education from '../../src/engine/systems/education.js';
import { resolveEventChoice } from '../../src/engine/events.js';
import events from '../../src/content/events/life-c.js';

function life(modelVersion = 2, age = 30) {
  const L = newLife({ seed: 778, modelVersion });
  L.age = age; L.year = L.birth.year + age;
  L.family.siblingMembers = []; L.family.gp = []; L.family.grandparents = 0;
  L.family.children = []; L.family.partner = null; L.family.married = false;
  for (const p of Object.values(L.family.parents)) Object.assign(p, { age: 45, alive: true, care: false });
  return L;
}
function context(L) {
  const ctx = makeCtx(L), emitted = [], asked = [];
  ctx.chance = () => false; ctx.sys = (id, vars, extra) => emitted.push({ id, vars, extra });
  ctx.ask = req => asked.push(req);
  return { ctx, emitted, asked };
}
for (const model of [1, 2]) {
  test(`model ${model}: 사망 부모의 이혼과 가짜 돌봄을 막는다`, () => {
    for (const alive of [[false, false], [false, true], [true, false]]) {
      const L = life(model, 15), { ctx, emitted } = context(L);
      [L.family.parents.father.alive, L.family.parents.mother.alive] = alive;
      const income = L.household.income;
      ctx.chance = () => true;
      family.pre(L, ctx);
      assert.ok(!emitted.some(e => ['sys.fam.parents_divorce', 'sys.fam.young_carer'].includes(e.id)));
      assert.equal(L.household.income, income);
    }
    const L = life(model, 15), { ctx, emitted } = context(L);
    let call = 0; ctx.chance = () => ++call === 3;
    family.pre(L, ctx);
    assert.ok(emitted.some(e => e.id === 'sys.fam.parents_divorce'));
  });
  test(`model ${model}: 실제 돌봄 대상과 종료를 기록한다`, () => {
    const L = life(model, 15), { ctx, emitted } = context(L);
    ctx.chance = p => p === 0.008;
    family.pre(L, ctx);
    assert.ok(!L.flags.youngCarer);
    L.family.parents.mother.care = true;
    ctx.chance = p => p === 0.008;
    family.pre(L, ctx);
    assert.equal(L.flags.youngCarerTarget, 'mother');
    assert.equal(emitted.find(e => e.id === 'sys.fam.young_carer').extra.careTargetId, 'mother');
    L.family.parents.mother.alive = false;
    family.pre(L, ctx);
    assert.equal(L.flags.youngCarer, null);
  });
  test(`model ${model}: 지난 계획 복구·관계 해소·비출산 의사·셋째 선택`, () => {
    const L = life(model), { ctx, asked } = context(L);
    L.flags.childPlanned = L.year - 1;
    family.step(L, ctx);
    assert.equal(L.flags.childPlanned, null);
    L.family.partner = { no: 2, age: 30, alive: true, sex: 'F' }; L.family.married = true;
    family.choices['sys.fam.child'](L, ctx, 'have');
    assert.equal(L.flags.childPlan.partnerNo, 2);
    ctx.act.divorce(); assert.equal(L.flags.childPlanned, null);
    L.family.partner = { no: 3, age: 30, alive: true, sex: 'F' }; L.family.married = true;
    L.family.children = [{ alive: true }, { alive: true }];
    let born = 0; ctx.act.haveChild = () => born++;
    family.choices['sys.fam.child'](L, ctx, 'none');
    ctx.chance = () => true;
    family.step(L, ctx);
    assert.equal(born, 0); assert.ok(!asked.some(e => e.eventId === 'sys.fam.child'));
    family.choices['sys.fam.child'](L, ctx, 'wait');
    family.step(L, ctx); assert.equal(born, 0);
    family.choices['sys.fam.child'](L, ctx, 'have');
    assert.equal(L.flags.noChild, false);
    L.year++; L.age++; family.step(L, ctx); assert.equal(born, 1);
    ctx.chance = () => false; family.step(L, ctx); assert.equal(born, 1);
    L.flags.childPlan = null; L.flags.childPlanned = null; ctx.chance = () => true;
    family.step(L, ctx);
    assert.ok(asked.some(e => e.eventId === 'sys.fam.child'));
    assert.equal(born, 1);
  });
  test(`model ${model}: 두 휴학 선택이 학적·수업 중지·복학을 바꾼다`, () => {
    for (const [eventId, optionId] of [['youth.leave.year', 'leave'], ['youth.leave.year', 'work'], ['youth.tuition.bill', 'leave']]) {
      const L = life(model, 22), { ctx } = context(L);
      Object.assign(L.edu, { stage: 'college', college: { type: '4yr' }, left: 3, leave: 0 });
      L.mil.status = 'done';
      resolveEventChoice(L, ctx, { eventId }, optionId, false);
      assert.equal(L.edu.leave, 1); assert.equal(L.edu.left, 3);
      L.year++; L.age++; education.step(L, ctx);
      assert.equal(L.edu.left, 3); assert.equal(L.edu.leave, 1);
      L.year++; L.age++; education.step(L, ctx);
      assert.equal(L.edu.leave, 0); assert.equal(L.edu.left, 2);
    }
  });
}
test('자녀 결혼·독립·빈 둥지는 실제 해당 연도 전이에만 연결한다', () => {
  const L = life(2, 56), when = id => events.find(e => e.id === `life.c.fam.${id}`).when(L);
  L.family.partner = { alive: true };
  const c = { alive: true, sex: 'M', birthYear: L.year - 28, leftHome: false, married: false };
  L.family.children = [c];
  for (const id of ['wedding.seat', 'child.out', 'empty.nest', 'parent.funeral']) assert.equal(when(id), false, id);
  Object.assign(c, { married: true, marriedYear: L.year, leftHome: true, leftHomeYear: L.year });
  for (const id of ['wedding.seat', 'child.out', 'empty.nest']) assert.equal(when(id), true, id);
  L.family.children.push({ alive: true, leftHome: false }); assert.equal(when('empty.nest'), false);
  L.year++; assert.equal(when('wedding.seat'), false); assert.equal(when('child.out'), false);
});
test('장례 후속은 부모 사망 때 대상과 원인 사건을 보존하고 한 번만 나온다', () => {
  const L = life(), { ctx, emitted } = context(L);
  ctx.chance = () => true;
  family.pre(L, ctx); family.pre(L, ctx);
  const funerals = emitted.filter(e => e.id === 'sys.fam.parent_funeral');
  assert.equal(funerals.length, 2);
  assert.deepEqual(funerals.map(e => e.extra.parentId), ['father', 'mother']);
  for (const e of funerals) assert.ok(e.extra.causeEventId.includes(e.extra.parentId));
});

test('저장 복원 뒤 예정 출산은 같은 배우자에게 한 번만 실행된다', () => {
  const L = life(), { ctx } = context(L);
  L.family.partner = { no: 1, alive: true, sex: 'F', age: 30 }; L.family.married = true;
  family.choices['sys.fam.child'](L, ctx, 'have');
  const restored = JSON.parse(JSON.stringify(L)), { ctx: rc } = context(restored);
  let born = 0; rc.act.haveChild = () => born++;
  restored.year++; restored.age++;
  family.step(restored, rc); family.step(restored, rc);
  assert.equal(born, 1); assert.equal(restored.flags.childPlan.status, 'completed');
  family.choices['sys.fam.child'](restored, rc, 'have');
  rc.act.loseSpouse();
  assert.equal(restored.flags.childPlanned, null); assert.equal(restored.flags.childPlan.status, 'cancelled');
});
