// 자산 수익률 표(src/data/market.js)와 실직·임대 계획 상수(src/engine/plans.js)의 역사 방향·정합 검사 [R15]
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as M from '../../src/data/market.js';
import * as P from '../../src/data/lifeplans.js';
import { benefitFor, rentRate, creditRate } from '../../src/engine/plans.js';
import { T, yr } from '../../src/engine/tables.js';

const r = (y, g) => M.realReturns(y, g);
const META = [M.KOSPI_CLOSE, M.STOCK_PRE1977, M.DIV_YIELD, M.USD_YEAREND, M.USD_AVG, M.US_RATE, M.DEPOSIT_RATE, M.INTEREST_TAX, M.CPI_PRE1980, M.RENT_YIELD, M.REALTY_COST, M.GOLD_USD, M.FUTURE, ...Object.values(P)];

test('표 메타 형식: src·year·kind·note·values', () => {
  for (const t of META) {
    assert.match(t.src, /^R15\.S\d+$/);
    assert.ok(Number.isInteger(t.year) && ['measured', 'estimated', 'projected'].includes(t.kind));
    assert.ok(typeof t.note === 'string' && t.note.length >= 15);
    assert.ok(t.values != null);
  }
});

test('역사 방향: 1997·2008 주식↓ 환율↑, 1999·2020 주식↑, 2022 집값↓', () => {
  for (const y of [1997, 2008]) { assert.ok(r(y).stock < -0.3, `${y} stock`); assert.ok(r(y).fx > 0.2, `${y} fx`); }
  assert.ok(r(1999).stock > 0.5 && r(2020).stock > 0.2);
  assert.ok(r(2022, 'seoul').realty < 0);
  assert.ok(r(1998).deposit > 0.03, 'IMF 고금리 예금');
});

test('원자료 일치: 코스피 연말 종가·연말 환율', () => {
  assert.equal(M.KOSPI_CLOSE.values[1997], 376.31);
  assert.equal(M.KOSPI_CLOSE.values[2025], 4214.17);
  assert.equal(M.USD_YEAREND.values[1997], 1415.2);
  assert.equal(M.USD_YEAREND.values[2008], 1257.5);
});

test('인플레 보정: 1980~2025 물가는 CPI_INFLATION과 같고 예금 실질 = 세후 명목/물가', () => {
  for (const y of [1980, 1998, 2022]) assert.equal(M.inflation(y), yr(T('CPI_INFLATION'), y));
  const y = 2023, nom = M.DEPOSIT_RATE.values[y] * (1 - 0.154);
  assert.ok(Math.abs(r(y).deposit - ((1 + nom) / (1 + M.inflation(y)) - 1)) < 1e-12);
  assert.ok(r(1980).deposit < 0, '1980 고물가 실질 마이너스');
});

test('미래 시나리오: 결정적·범위', () => {
  assert.deepEqual(r(2040), r(2040));
  let s = 0; for (let y = 2026; y < 2126; y++) s += r(y).stock;
  assert.ok(s / 100 > 0 && s / 100 < 0.15, `미래 주식 평균 ${s / 100}`);
});

test('값 범위: 1960~2100 모든 자산 실질 수익률이 −70%~+200%', () => {
  for (let y = 1960; y <= 2100; y++) for (const [k, v] of Object.entries(r(y))) assert.ok(Number.isFinite(v) && v > -0.7 && v < 2, `${y} ${k} ${v}`);
});

test('실업급여: 1996 이전 없음, 2019-10 개정 뒤 60%·120~270일, 상한 적용', () => {
  assert.equal(benefitFor(1994, 40, 5, 3000).total, 0);
  const b = benefitFor(2025, 55, 15, 8000);
  assert.equal(b.days, 270); assert.equal(b.daily, 66000);
  assert.equal(benefitFor(2025, 40, 2, 3000).days, 150);
  assert.equal(benefitFor(2010, 45, 12, 5000).days, 210);
  assert.equal(benefitFor(2025, 30, 3, 3000).daily, Math.round(10030 * 8 * 0.8), '저임금은 하한(최저임금 80%)');
});

test('임대·대출 금리: 전월세전환율 하락 추세, 신용대출 2022 인상', () => {
  assert.ok(rentRate(2000) > rentRate(2011) && rentRate(2011) > rentRate(2020));
  assert.ok(creditRate(2023) > creditRate(2021) && creditRate(1998) > 0.15);
});
