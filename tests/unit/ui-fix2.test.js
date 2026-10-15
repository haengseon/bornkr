import test from 'node:test';
import assert from 'node:assert/strict';
import { jobLineOf, wealthOf } from '../../src/ui/profile.js';
import { isBigEntry } from '../../src/ui/major.js';

const L = (o = {}) => ({ seed: 7, age: 40, year: 2020, home: { tenure: 'own', value: 40000 }, birth: {}, money: { assets: 10000, debt: 20000, loans: {} }, aging: {}, stats: { wealth: 50 }, job: { status: 'employed', title: '교사', history: [] }, ...o });

test('jobLineOf: 일하면 현재 직업, 쉬면 이전 직업+상태, 이력 없으면 구직 중', () => {
  assert.equal(jobLineOf(L()), '교사');
  assert.equal(jobLineOf(L({ job: { status: 'seeking', title: '교사', history: [{ title: '교사' }] } })), '이전 직업: 교사 · 구직 중');
  assert.equal(jobLineOf(L({ job: { status: 'none', title: null, history: [{ title: '배달원' }] } })), '이전 직업: 배달원 · 무직');
  assert.equal(jobLineOf(L({ job: { status: 'seeking', title: null, history: [] } })), '구직 중');
});
test('wealthOf: 구성 합계 보존·결정적·엔진 loans 우선', () => {
  const a = wealthOf(L()), b = wealthOf(L());
  assert.deepEqual(a, b);
  assert.equal(a.fin.deposit + a.fin.cash + a.fin.invest, 10000);
  assert.equal(a.debt.mortgage + a.debt.jeonse + a.debt.student + a.debt.credit, 20000);
  assert.equal(a.net, 10000 + 40000 - 20000);
  const e = wealthOf(L({ money: { assets: 100, debt: 500, loans: { credit: 500 }, debtService: 120 } }));
  assert.equal(e.debt.credit, 500); assert.equal(e.monthlyService, 10);
});
test('isBigEntry: 사별·진단은 작은 카드, 본인 결정·진로는 전체 화면', () => {
  assert.equal(isBigEntry({ id: 'sys.fam.parent_death', text: '아버지가 세상을 떠나셨다.' }), false);
  assert.equal(isBigEntry({ id: 'sys.health.dx_cancer', text: '암 진단을 받았다.' }), false);
  assert.equal(isBigEntry({ id: 'sys.edu.college_enter', text: '대학에 입학했다.' }), true);
  assert.equal(isBigEntry({ kind: 'choice', topic: 'loss', text: '선택' }), false);
});
