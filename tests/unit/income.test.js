// 근로 외 소득원(R17): 임대소득 합산·세금, 선택 → 상태 변화, 정산 일치, 상속세, 표 형식
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../../src/engine/index.js';
import * as I from '../../src/data/incomes.js';
import { annualIncome, otherIncome, econ } from '../../src/engine/stats.js';
import { rentTax, inheritShare } from '../../src/engine/systems/money.js';
import { choices, step as investStep } from '../../src/engine/systems/invest.js';
import { makeAct } from '../../src/engine/act.js';

test('표 형식: src(R17.Sx)·year·kind·note·values', () => {
  for (const [n, t] of Object.entries(I)) {
    if (typeof t === 'function') continue;
    assert.match(t.src, /^R17\.S\d+$/, n);
    assert.ok(Number.isInteger(t.year) && ['measured', 'estimated', 'projected'].includes(t.kind), n);
    assert.ok(typeof t.note === 'string' && t.note.length >= 15, n);
    assert.ok(t.values != null, n);
  }
});

// 독립한 성인 한 명을 만든다
function adult(seed = 77) {
  for (let s = seed; s < seed + 200; s++) {
    const L = E.newLife({ seed: s });
    for (let i = 0; i < 60 && L.alive; i++) {
      E.advanceYear(L);
      if (L.pending) E.choose(L, L.pending.defaultId, { auto: true });
      if (L.flags.indep != null && L.age >= 35 && L.job.status === 'employed') return L;
    }
  }
  throw new Error('성인 없음');
}

test('임대소득: L.rentals 합계가 소득·순자산에 들어가고, 2019부터 주택 임대소득세가 붙는다', () => {
  const L = adult();
  const inc0 = annualIncome(L), nw0 = econ(L).NW;
  L.rentals = [{ kind: 'home', rent: 1200, since: L.year, region: 'seoul', value: 30000 }, { kind: 'realty', sub: 'shop', rent: 800, since: L.year, region: 'metro', value: 20000 }];
  assert.equal(otherIncome(L).rent, 2000);
  assert.equal(annualIncome(L) - inc0, 2000);
  assert.equal(econ(L).NW - nw0, 50000);
  assert.equal(rentTax(L, 2015), 80);                      // 주택 비과세, 상가 10%
  assert.ok(rentTax(L, 2020) > 80);                         // 주택 6% 추가
  L.rentals[0].vacant = L.year; L.rentals[0].vacMonths = 6;
  assert.equal(otherIncome(L).rent, 1400);                  // 공실 6개월 = 절반
});

test('상속세: 5억(명목) 공제 아래는 0, 위는 누진', () => {
  assert.equal(inheritShare(30000, 2, 2024).tax, 0);
  const big = inheritShare(300000, 2, 2024);
  assert.ok(big.tax > 0 && big.share < 300000 * 0.97 / 2);
  assert.ok(inheritShare(300000, 1, 2024).share > big.share);
});

// 특정 선택이 나올 때까지 진행
function findAsk(id, from = 81_000_000, n = 300) {
  for (let s = from; s < from + n; s++) {
    const L = E.newLife({ seed: s });
    for (let i = 0; i < 100 && L.alive; i++) {
      E.advanceYear(L);
      if (L.pending?.eventId === id) return L;
      if (L.pending) E.choose(L, L.pending.defaultId, { auto: true });
    }
  }
  return null;
}

test('임대 부동산 구입: 비용 표시(지분·대출·월 이자·과거 수익)와 선택 뒤 상태가 일치', () => {
  const L = findAsk('sys.invest.rental');
  assert.ok(L, '임대 구입 선택이 안 나옴');
  const req = L.pending, opt = req.options.find(o => o.id !== 'no'), plan = req.data.plans.find(p => p.id === opt.id);
  assert.match(opt.cost.note, /최근 10년.*평균 연.*가장 나빴던 해/);
  assert.equal(opt.cost.invest + opt.cost.loan, plan.value + plan.acq);
  const A0 = L.money.assets, d0 = L.money.debt, n0 = (L.rentals || []).length;
  E.choose(L, opt.id, {});
  assert.equal(L.rentals.length, n0 + 1);
  const r = L.rentals.at(-1);
  assert.equal(r.value, plan.value); assert.equal(r.rent, plan.rent);
  assert.equal(L.money.assets, Math.max(0, A0 - plan.equity));
  assert.equal(L.money.debt - d0, plan.loan);
  let got = 0; for (let i = 0; i < 5 && L.alive; i++) { E.advanceYear(L); if (L.pending) E.choose(L, L.pending.defaultId, { auto: true }); got = L.tally.rentInc || 0; }
  assert.ok(got > 0, '임대 수익이 쌓이지 않음');
});

test('부업: 일상 기본 선택으로 시작한 부업 수입이 실제 소득에 더해진다', () => {
  const L = adult();
  L.age = 35; L.yr = { asked: false }; L.money.assets = 0; L.money.deficitYears = 1;
  L.job.public = false; L.job.major = '2';
  delete L.flags.sidejob; delete L.flags.sideAsked;
  L.invest = { w: null, since: L.year };
  const inc = annualIncome(L);
  let req;
  const ctx = { sys() {}, apply() {}, chance() { return true; },
    ask(p) { req = p; L.yr.asked = true; choices[p.eventId](L, ctx, p.defaultId, p.data); return p; } };
  ctx.act = makeAct(L, ctx);
  investStep(L, ctx);
  assert.equal(req.eventId, 'sys.money.sidejob');
  assert.equal(req.defaultId, 'deliver');
  const plan = req.data.plans.find(p => p.id === req.defaultId);
  assert.equal(L.flags.sidejob.income, plan.income);
  assert.equal(annualIncome(L) - inc, plan.income);
});

test('개인연금: 가입 → 적립금이 쌓여 순자산에 들어가고 수령 선택이 정산된다', () => {
  const L = findAsk('sys.money.pension', 83_000_000);
  assert.ok(L, '연금 선택이 안 나옴');
  E.choose(L, 'max', {});
  assert.equal(L.pension2.monthly, 50);
  for (let i = 0; i < 6 && L.alive; i++) { E.advanceYear(L); if (L.pending) E.choose(L, L.pending.defaultId, { auto: true }); }
  if (L.pension2.draw) return;
  assert.ok(L.pension2.balance > 0, '적립금 없음');
  const lump = Math.round(L.pension2.balance * (1 - I.PRIVATE_PENSION.values.lumpTax)), A0 = L.money.assets;
  const ctx = { act: { gain: a => { L.money.assets += a; } }, apply() {} };
  choices['sys.money.pension_draw'](L, ctx, 'lump');
  assert.equal(L.money.assets - A0, lump);
  assert.equal(L.pension2.balance, 0);
});
