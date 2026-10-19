// QA B1: 신용 한도를 넘는 부족액이 사라지지 않는다 — 부족액만큼 순자산이 줄고, 부채 = 대출 합계.
import test from 'node:test';
import assert from 'node:assert/strict';
import { newLife } from '../../src/engine/index.js';
import { makeCtx } from '../../src/engine/life.js';
import { econ } from '../../src/engine/stats.js';
import { step as settle, livelihood } from '../../src/engine/systems/money.js';
import { creditCap, arrearsOf } from '../../src/engine/act.js';

function broke({ owned = false } = {}) {
  const L = newLife({ seed: 50, modelVersion: 2 });
  Object.assign(L, { age: 40, year: 2025 });
  L.flags = { indep: 2000 }; L.tally = {}; L.lean = {}; L.cache = { INCpos: 20 };
  Object.assign(L.job, { status: 'seeking', wage: 0, platform: false, public: false });
  L.family.partner = null; L.family.children = []; L.family.caringFor = null;
  for (const p of Object.values(L.family.parents)) p.alive = false;
  Object.assign(L.home, { tenure: owned ? 'own' : 'jeonse', parents: false, owned, value: owned ? 50000 : 0, mortgageBalance: 0, deposit: 0, rent: 0 });
  Object.assign(L.aging, { pensionMonthly: 0, basic: 0 });
  L.health.conditions = []; L.pension2 = null; L.rentals = []; L.invest = { w: null, since: 2025 };
  L.edu.stage = 'done'; L.money.assets = 0; L.money.income = 0;
  for (const k in L.money.loans) L.money.loans[k] = 0;
  L.money.loans.credit = Math.round(creditCap(L));                 // 무담보 한도를 이미 다 썼다
  L.money.debt = L.money.loans.credit; L.yr = { asked: false };
  return L;
}
const ctxOf = L => { const c = makeCtx(L); c.chance = () => false; return c; };
const loanSum = L => Object.values(L.money.loans).reduce((a, b) => a + b, 0);

test('한도를 다 쓴 무소득 가구: 생활비·이자만큼 순자산이 줄고 증발액 0', () => {
  const L = broke();
  L.home.deposit = 12000;                                          // 보증금(재산)이 있어 생계급여 대상이 아니다
  for (let i = 0; i < 3; i++) {
    const nw = econ(L).NW;
    settle(L, ctxOf(L));
    const cf = L.money.cashFlow;
    assert.equal(cf.unfunded, 0);
    assert.equal(L.money.debt, loanSum(L));
    assert.equal(L.money.welfare, 0);
    assert.ok(Math.abs(econ(L).NW - (nw + cf.disposable - cf.consumption - cf.interest)) <= 2, `NW ${nw} → ${econ(L).NW}, 급여 ${cf.disposable} 소비 ${cf.consumption} 이자 ${cf.interest}`);
    L.year++;
  }
  assert.ok(arrearsOf(L) > 0);
});

test('집이 있으면 연체분은 집 담보 추가 대출로 옮겨지고 집은 남는다', () => {
  const L = broke({ owned: true });
  settle(L, ctxOf(L));
  assert.equal(arrearsOf(L), 0);
  assert.ok(L.money.loans.mortgage > 0 && L.home.mortgageBalance === L.money.loans.mortgage);
  assert.ok(L.home.owned);
  assert.equal(L.money.debt, loanSum(L));
});

test('생계급여: 무소득·무재산 가구는 받고, 2000년 이전은 생활보호 수준, 재산이 있으면 없다', () => {
  const L = broke();
  settle(L, ctxOf(L));
  assert.ok(L.money.welfare > 0 && L.money.cashFlow.unfunded === 0);
  assert.equal(L.money.debt, loanSum(L));
  const now = livelihood(L, 0);
  L.year = 1995; const old = livelihood(L, 0);
  assert.ok(now > 0 && old > 0 && old < now * 0.6);
  L.year = 2025; L.money.assets = 20000;
  assert.equal(livelihood(L, 0), 0);
});
