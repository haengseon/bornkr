import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../../src/engine/index.js';
import { makeCtx } from '../../src/engine/life.js';
import * as career from '../../src/engine/systems/career.js';
import * as family from '../../src/engine/systems/family.js';
import { choices as chains } from '../../src/engine/milestones.js';
import { familyLines, familyText, jobLineOf } from '../../src/ui/profile.js';
import { eventById, resolveEventChoice } from '../../src/engine/events.js';

function candidate() {
  const L = E.newLife({ seed: 3, forced: { year: 1980 } });
  L.age = 24; L.year = 2004; L.edu.stage = 'done'; L.edu.level = '4yr';
  L.job.status = 'seeking'; L.mil.status = 'done';
  return L;
}
test('시험 불합격 해에는 일반 취업하지 않고 재도전/구직 전환을 먼저 고른다', () => {
  const L = candidate(), ctx = makeCtx(L);
  ctx.act.preparePublicExam(1);
  L.year++; L.age++;
  ctx.chance = () => false;
  career.step(L, ctx);
  assert.equal(L.job.status, 'seeking');
  assert.equal(L.pending.eventId, 'sys.chain.exam_retry');
  assert.ok(L.log.some(e => e.id === 'sys.job.exam_fail' && e.essential));
  chains['sys.chain.exam_retry'](L, ctx, 'again');
  assert.equal(L.flags.examUntil, L.year + 1);
  assert.equal(jobLineOf(L), '공무원 시험 준비 중');
  chains['sys.chain.exam_retry'](L, ctx, 'quit');
  assert.equal(L.flags.examUntil, null);
  assert.equal(L.job.status, 'seeking');
});
test('공시 합격은 발령 직업과 같은 확정 결과로 기록된다', () => {
  const L = candidate(), ctx = makeCtx(L);
  ctx.act.preparePublicExam(2); L.year++; L.age++;
  ctx.chance = () => true;
  career.step(L, ctx);
  assert.equal(L.job.status, 'employed');
  assert.equal(L.job.public, true);
  assert.equal(L.flags.examUntil, null);
  const pass = L.log.find(e => e.id === 'sys.job.exam_pass');
  assert.ok(pass.essential && pass.text.includes(L.job.title));
  assert.ok(L.flags.examResult.passed);
});
test('준비 방식을 고른 우연 선택도 같은 시험 흐름에 진입한다', () => {
  const L = candidate(), ctx = makeCtx(L, 'c');
  resolveEventChoice(L, ctx, { eventId: 'dec.exam.prep.way' }, 'self', false);
  assert.equal(L.flags.examUntil, L.year + 2);
  assert.equal(eventById('youth.civil.exam').when(L), false);
});
test('미래 동생은 미리 나타나지 않고 출생 때 가족·관계·돌봄과 피드가 바뀐다', () => {
  const L = E.newLife({ seed: 3 }), ctx = makeCtx(L);
  const baby = L.family.siblingMembers.find(s => s.birthYear > L.year);
  assert.ok(baby);
  assert.equal(L.family.siblings, 0);
  assert.ok(!familyLines(L).some(x => x.name === baby.name));
  assert.equal(eventById('early.sibling.jealous').when(L), false);
  L.year = baby.birthYear; L.age = L.year - L.birth.year;
  const care = L.issues.care, leisure = L.stats.leisure;
  ctx.chance = () => false;
  family.pre(L, ctx);
  assert.equal(L.family.siblings, 1);
  assert.ok(familyLines(L).map(familyText).some(s => s.includes(baby.name) && s.includes('0세')));
  assert.ok(L.issues.care > care && L.stats.leisure < leisure);
  assert.ok(L.log.some(e => e.id === 'sys.fam.sibling_arrived' && e.essential && e.text.includes(baby.name)));
  const before = baby.bond;
  family.choices['sys.fam.sibling_welcome'](L, ctx, 'help', { id: baby.id });
  assert.ok(baby.bond > before);
  family.choices['sys.fam.relationship'](L, ctx, 'later', { id: baby.id });
  assert.ok(baby.bond < before + 10);
});
test('동생 출생의 확정 기록은 연간 피드 생략으로 사라지지 않는다', () => {
  const L = E.newLife({ seed: 3 });
  E.advanceYear(L);
  while (L.pending) E.choose(L, L.pending.defaultId, { auto: true });
  const born = L.log.find(e => e.id === 'sys.fam.sibling_arrived');
  assert.ok(born && !born.quiet);
});
