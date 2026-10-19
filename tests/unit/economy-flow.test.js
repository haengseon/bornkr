// 가계 경제 흐름 불변식(경제 감사 2026-10-19): 장부 등식, 무직 근로소득 0, 문장 금액의 시대 환산, 제도 시행 연도, 큰 자산 변동의 피드 노출.
import test from 'node:test';
import assert from 'node:assert/strict';
import { newLife } from '../../src/engine/index.js';
import { advance, resolve, makeCtx } from '../../src/engine/life.js';
import { annualIncome, otherIncome } from '../../src/engine/stats.js';
import { text } from '../../src/engine/text.js';
import { T } from '../../src/engine/tables.js';
import * as money from '../../src/engine/systems/money.js';
import * as invest from '../../src/engine/systems/invest.js';

const W = s => s === 'employed' || s === 'self';
const lives = [];
for (let i = 0; i < 16; i++) {
  const L = newLife({ seed: 58_000_000 + i }), years = [];
  while (L.alive) {
    advance(L);
    while (L.pending) resolve(L, L.pending.defaultId, { auto: true });
    if (L.flags.indep == null || !L.alive) continue;
    const j = L.job, ox = otherIncome(L), a = L.aging;
    const work = annualIncome(L) - ox.total - (L.family.partner?.income || 0) - 12 * ((a.pensionMonthly || 0) + (a.basic || 0))
      - (L.flags.seniorJob === L.year ? T('SENIOR_JOB').monthly * T('SENIOR_JOB').months : 0) - (j.platform && j.status === 'seeking' ? 600 : 0);
    years.push({ year: L.year, status: j.status, work });
  }
  lives.push({ L, years });
}

test('장부 등식: 기초 현금 + 처분가능소득 − 지출 = 기말 현금(모자라면 신용대출) + 금융수익', () => {
  let n = 0;
  for (const { L } of lives) for (const r of Object.values(L.dailyLife?.ledger || {})) {
    const flow = r.openingCash + r.disposable - r.totalOutflow;
    assert.ok(Math.abs(r.balanceAfterAnnualBudget - r.financialReturn - Math.max(0, flow)) <= 1, `${L.seed} ${r.year}: ${JSON.stringify(r)}`);
    assert.ok(Math.abs(r.creditAdded + r.unresolved - Math.max(0, -flow)) <= 1, `${L.seed} ${r.year} 부족분 ${-flow} ≠ 신용 ${r.creditAdded}+미해결 ${r.unresolved}`);
    n++;
  }
  assert.ok(n > 200, `장부 ${n}해`);
});

test('일하지 않는 해에는 본인 근로소득이 0', () => {
  for (const { L, years } of lives) for (const y of years) if (!W(y.status)) assert.equal(Math.round(y.work), 0, `${L.seed} ${y.year} ${y.status}`);
});

test('피드 문장 금액은 그해 명목(화면 카드와 같은 환산): 1990년 300 → 99만 원, 2025년은 그대로', () => {
  assert.match(text('sys.money.first_pay', { pay: 300 }, { L: { year: 1990 } }), /99만 원/);
  assert.match(text('sys.money.first_pay', { pay: 300 }, { L: { year: 2025 } }), /300만 원/);
  assert.match(text('sys.money.drawdown', { amount: 300, year: 1990 }), /99만 원/);
});

test('제도 시행 전에는 개인회생·기초생활급여 문장이 없다', () => {
  for (const { L } of lives) for (const e of L.log) {
    if (e.id === 'sys.money.debt_relief') assert.ok(e.year >= 2004, `${L.seed} ${e.year} 개인회생`);
    if (e.id === 'sys.money.welfare') assert.ok(e.year >= 2000, `${L.seed} ${e.year} 기초생활급여`);
  }
});

function adult(year = 2010) {
  const L = newLife({ seed: 61000000 });
  Object.assign(L, { year, age: 40 }); L.flags.indep = 2000;
  Object.assign(L.home, { parents: false, owned: false, tenure: 'jeonse', deposit: 5000, rent: 0 });
  L.family.partner = null; L.family.children = [];
  for (const p of Object.values(L.family.parents)) p.alive = false;
  Object.assign(L.job, { status: 'employed', wage: 4000, regular: true, platform: false });
  L.money.assets = 1000; for (const k in L.money.loans) L.money.loans[k] = 0; L.money.debt = 0;
  L.rentals = []; L.pension2 = null;
  const ctx = makeCtx(L); ctx.chance = () => false; ctx.int = a => a;
  return { L, ctx };
}

test('복무 중에는 생활비 하한이 부대 생활만큼 낮다', () => {
  const out = {};
  for (const status of ['military', 'seeking']) {
    const { L, ctx } = adult();
    Object.assign(L.job, { status, wage: 0 });
    money.step(L, ctx);
    out[status] = L.money.cashFlow.consumption;
  }
  assert.ok(out.military < out.seeking * 0.5, JSON.stringify(out));
});

test('큰 잔고의 운용 손익은 수익률이 작아도 금액과 함께 피드에 꼭 보인다', () => {
  const { L, ctx } = adult(2016);
  L.money.assets = 300000; L.money.income = 4000;
  L.invest = { w: { deposit: 0.35, stock: 0.3, fx: 0.1, realty: 0.15 }, since: 2010, last: null };
  const seen = [];
  ctx.sys = (id, vars, extra) => seen.push({ id, vars, ...extra });
  L.yr = { asked: false };
  invest.step(L, ctx);
  const e = seen.find(x => x.id === 'sys.invest.year');
  assert.ok(Math.abs(L.invest.last.r) < 0.1 && Math.abs(L.invest.last.delta) >= 2000, '수익률은 작고 금액은 큰 해');   // 2016 분산형 약 +1.4%
  assert.ok(e?.essential && /만 원/.test(e.vars.dir), JSON.stringify(e));
});
