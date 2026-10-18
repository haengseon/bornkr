import test from 'node:test';
import assert from 'node:assert/strict';
import { newLife } from '../../src/engine/index.js';
import { makeCtx } from '../../src/engine/life.js';
import { annualIncome, econ } from '../../src/engine/stats.js';
import { step as settle } from '../../src/engine/systems/money.js';
import { step as invest } from '../../src/engine/systems/invest.js';
import { annualExpensePlan } from '../../src/engine/daily-life.js';
import { wealthOf } from '../../src/ui/profile.js';
import { recordYear } from '../../src/engine/chronicle.js';
import { historyRows } from '../../src/ui/history.js';

function person(status = 'retired', modelVersion = 2) {
  const L = newLife({ seed: 50, modelVersion });
  Object.assign(L, { age: status === 'retired' ? 65 : 35, year: 2025 });
  L.flags = { indep: 2000 }; L.tally = {}; L.lean = {}; L.cache = { INCpos: 20 };
  Object.assign(L.job, { status, wage: 0, platform: false, public: false });
  L.family.partner = null; L.family.children = []; L.family.caringFor = null;
  for (const p of Object.values(L.family.parents)) p.alive = false;
  Object.assign(L.home, { tenure: 'jeonse', parents: false, owned: false, value: 0, deposit: 0, rent: 0 });
  Object.assign(L.aging, { pensionMonthly: 0, basic: 0 });
  L.health.conditions = []; L.pension2 = null; L.rentals = []; L.invest = { w: null, since: 2025 };
  L.edu.stage = 'done'; L.money.assets = 10000;
  for (const k in L.money.loans) L.money.loans[k] = 0;
  L.money.debt = 0; L.yr = { asked: false };
  return L;
}
function context(L) { const ctx = makeCtx(L); ctx.chance = () => false; return ctx; }
const near = (a, b) => assert.ok(Math.abs(a - b) <= 1.01, `${a} != ${b}`);

for (const model of [1, 2]) for (const status of ['retired', 'seeking', 'inactive']) {
  test(`소득 없는 ${status}는 생활비로 현금·순자산 감소: 모형${model}`, () => {
    const L = person(status, model), before = econ(L).NW;
    settle(L, context(L));
    assert.equal(annualIncome(L), 0);
    assert.equal(L.money.cashFlow.consumption, 1600);
    assert.equal(L.money.assets, 8484);
    assert.equal(econ(L).NW, before - 1516);
    assert.equal(L.money.deficitYears, 1);
    assert.ok(L.log.some(e => e.id === 'sys.money.drawdown' && /1,600/.test(e.text)));
  });
}

test('여러 해 무소득이면 해마다 현금 소진, 잔액 부족 때 차입과 자금 압박 연결', () => {
  const L = person(); L.money.assets = 2500;
  let previous = econ(L).NW;
  for (let i = 0; i < 3; i++) {
    L.yr = { asked: false }; settle(L, context(L));
    assert.ok(econ(L).NW < previous); previous = econ(L).NW;
    assert.ok(L.money.assets >= 0); L.year++;
  }
  assert.ok(L.money.loans.credit > 0);
  L.year--; L.yr = { asked: false };
  invest(L, context(L));
  assert.equal(L.pending.eventId, 'sys.money.crunch');
  assert.equal(annualIncome(L), 0);
});

test('생활비를 줄여도 월세는 계약 금액 그대로 내고 양육·의료비는 한 번만 합산', () => {
  const L = person(); Object.assign(L.home, { tenure: 'monthly', rent: 50 });
  L.flags.cutUntil = 2026; settle(L, context(L));
  assert.equal(L.dailyLife.ledger[2025].expenses.housing, 600);
  assert.equal(L.dailyLife.ledger[2025].expenses.living, 1360);
  assert.equal(L.money.cashFlow.consumption, 1960);
  const plan = annualExpensePlan({ envelope: 0, minimumLiving: 1600, housing: 600, children: 400, medical: 200 });
  assert.equal(plan.living, 1600); assert.equal(plan.consumption, 2800);
});

test('적은 연금은 생활비 부족분만 자산에서 쓰고 충분한 연금·배우자 소득은 흑자 가능', () => {
  const low = person(); low.aging.pensionMonthly = 50; settle(low, context(low));
  assert.ok(low.money.assets < 10000); assert.ok(low.money.cashFlow.operatingBalance < 0);
  assert.ok(wealthOf(low).saveRate < 0);
  const enough = person(); enough.aging.pensionMonthly = 300; settle(enough, context(enough));
  assert.ok(enough.money.assets > 10000); assert.ok(enough.money.cashFlow.operatingBalance > 0);
  assert.ok(!enough.log.some(e => e.id === 'sys.money.drawdown'));
  const spouse = person('seeking'); spouse.family.partner = { income: 6000 }; settle(spouse, context(spouse));
  assert.ok(spouse.money.assets > 10000);
});

test('부채 원금 상환은 현금과 부채를 함께 줄여 순자산 손실로 이중 처리하지 않는다', () => {
  const L = person(); L.money.loans.credit = 2000; L.money.debt = 2000;
  const before = econ(L).NW; settle(L, context(L));
  const f = L.money.cashFlow;
  assert.ok(f.principal > 0);
  near(econ(L).NW - before, f.operatingBalance + f.financialReturn);
  assert.equal(L.money.debt, 2000 - f.principal);
});

test('사적연금 납입 때문에 현금이 줄어도 생활 적자로 분류하지 않는다', () => {
  const L = person('employed'); L.job.wage = 4000;
  L.pension2 = { balance: 0, monthly: 150, paidIn: 0 }; L.flags.sentinel = 1;
  settle(L, context(L));
  assert.ok(L.money.cashFlow.operatingBalance > 0);
  assert.ok(L.money.cashFlow.cashDrawdown > 0);
  assert.equal(L.money.deficitYears, 0);
  assert.ok(L.pension2.balance > 0);
});

test('은퇴·휴직에 남은 플랫폼 플래그는 가짜 근로소득을 만들지 않는다', () => {
  for (const status of ['retired', 'inactive', 'self']) {
    const L = person(status); L.job.platform = true;
    assert.equal(annualIncome(L), 0);
  }
  const L = person('seeking'); L.job.platform = true;
  assert.equal(annualIncome(L), 600);
  context(L).act.retire(); assert.equal(L.job.platform, false); assert.equal(annualIncome(L), 0);
});

test('주택 평가이익이 있어도 생활비에 쓴 현금은 구분하고 보증금을 현금처럼 소비하지 않는다', () => {
  const L = person(); L.year = 2021; L.home.owned = true; L.home.tenure = 'own'; L.home.value = 100000;
  const before = econ(L).NW; settle(L, context(L));
  assert.ok(L.money.assets < 10000);
  assert.ok(L.home.value > 100000); assert.ok(econ(L).NW > before);
  const renter = person(); renter.home.deposit = 20000; settle(renter, context(renter));
  assert.equal(renter.home.deposit, 20000); assert.equal(renter.money.assets, 8484);
});

test('수정한 연간 정산은 JSON 저장 후 같은 현금·부채·기록으로 이어진다', () => {
  const A = person('seeking'); settle(A, context(A)); A.year++;
  const B = JSON.parse(JSON.stringify(A));
  settle(A, context(A)); settle(B, context(B));
  assert.deepEqual(A, B);
});

test('사적연금 원금 인출은 현금 소득과 연금 자산 감소를 함께 반영한다', () => {
  const L = person(); L.pension2 = { balance: 10000, draw: 'annuity', drawAge: 65, left: 10, monthly: 0 };
  const before = econ(L).NW; settle(L, context(L));
  const f = L.money.cashFlow, pn = L.pension2;
  const pensionReturn = pn.balance - (10000 - pn.payout);
  near(econ(L).NW - before, f.operatingBalance + f.financialReturn - pn.payout + pensionReturn);
  assert.equal(pn.payout, 1000);
});

test('자산 내역은 집값과 구분할 금융자산 잔액을 보존하고 이전 기록도 읽는다', () => {
  const L = person(); settle(L, context(L)); recordYear(L);
  assert.equal(L.chronicle[L.age].asset.financial, 8484);
  assert.match(historyRows(L, 'asset')[0].text.replace(/\s/g, ''), /금융자산8,484만원/);
  delete L.chronicle[L.age].asset.financial;
  assert.doesNotMatch(historyRows(L, 'asset')[0].text, /금융자산|NaN|undefined/);
});
