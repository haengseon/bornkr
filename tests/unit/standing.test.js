// 통계 속 내 위치(engine/standing.js, R19)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../../src/engine/index.js';
import { topLabel, netWorthBottom, wageBottom, housingBottom, causeShares } from '../../src/engine/standing.js';
import * as SD from '../../src/data/standing.js';
import { SOURCES } from '../../src/data/sources.js';

const FORBID = /분위|억|[\d,]+\s*(만|천)?\s*원(?!인)/;
const step = L => (L.pending ? E.choose(L, L.pending.defaultId, { auto: true }) : E.advanceYear(L));
const texts = r => [...Object.values(r).flatMap(v => (v && typeof v === 'object' && !Array.isArray(v) ? [v.label, v.basis] : [])), ...r.notes];

test('표 형식: { src, year, kind, note, values }, src는 SOURCES에 있음', () => {
  for (const [n, t] of Object.entries(SD)) {
    assert.ok(SOURCES[t.src], `${n}.src`);
    assert.ok(Number.isInteger(t.year) && ['measured', 'estimated', 'projected'].includes(t.kind), n);
    assert.ok(typeof t.note === 'string' && t.note.length >= 15 && t.values != null, n);
  }
});

test('단조성: 자산·소득·집값이 클수록 상위 %가 작다', () => {
  const xs = [-5000, 0, 500, 3000, 10000, 30000, 80000, 200000, 1e6];
  for (const [f, ys] of [[x => netWorthBottom(x, 45, 2025), xs.filter(x => x > 0)], [x => wageBottom(x, 2010), xs.filter(x => x >= 0)], [x => housingBottom(x, 40, 2000), xs.filter(x => x >= 0)]]) {
    const b = ys.map(f);
    for (let i = 1; i < b.length; i++) assert.ok(b[i] >= b[i - 1], `${ys[i]}`);
    assert.ok(b.every(v => v >= 0 && v <= 100));
  }
  assert.ok(netWorthBottom(23860, 45, 2025) < netWorthBottom(23860, 25, 2025), '같은 금액이면 젊은 연령대에서 더 위');
});

test('같은 실질 금액도 시대마다 다르게 환산된다(1995 3천만 원 > 2025 3천만 원)', () => {
  assert.ok(netWorthBottom(3000, 45, 1995) > netWorthBottom(3000, 45, 2025) + 2);
  assert.ok(wageBottom(3000, 1990) > wageBottom(3000, 2025) + 10);
});

test('라벨 경계: 정수 · 1% 이내 · 하위 1% 이내', () => {
  assert.equal(topLabel(0.4), '상위 1% 이내');
  assert.equal(topLabel(1), '상위 1%');
  assert.equal(topLabel(23.4), '상위 23%');
  assert.equal(topLabel(99), '상위 99%');
  assert.equal(topLabel(99.5), '하위 1% 이내');
});

test('사인 구성비 합 1 · 자해 사망이면 사인 항목이 없다', () => {
  const w = causeShares('M', 45, 2000);
  assert.ok(Math.abs(Object.values(w).reduce((a, b) => a + b, 0) - 1) < 1e-9);
  let L = null;
  for (let s = 0; s < 40 && !L; s++) { const x = E.newLife({ seed: 77_000 + s }); while (x.alive) step(x); if (!x.death.horizon) L = x; }
  const r0 = E.standing(L, { at: 'end' });
  assert.ok(r0.age && r0.age.pct >= 0 && r0.age.pct <= 100 && r0.cause?.rank >= 1);
  L.death = { ...L.death, cause: 'suicide', causeLabel: '고의적 자해', sensitive: true };
  const r = E.standing(L, { at: 'end' });
  assert.equal(r.cause, undefined);
  assert.ok(!JSON.stringify(r).includes('suicide') && !JSON.stringify(r).includes('자해'));
});

test('3,000개 샘플에서 예외 없이 유한값·금지어 없음 · 자산 위치 평균 50±15', () => {
  let n = 0, sum = 0, cnt = 0;
  for (let s = 0; n < 3000; s++) {
    const L = E.newLife({ seed: 5_310_000 + s });
    while (L.alive) {
      step(L);
      const r = E.standing(L, { at: L.alive ? 'now' : 'end' });
      n++;
      for (const k of ['asset', 'income', 'housing', 'age', 'cause', 'edu']) {
        if (!r[k]) continue;
        assert.ok(Number.isFinite(r[k].pct) && r[k].pct >= 0 && r[k].pct <= 100, `${k} ${r[k].pct}`);
        assert.equal(typeof r[k].est, 'boolean');
      }
      for (const t of texts(r)) assert.ok(!FORBID.test(t), `금지어: ${t}`);
      if (r.asset) { sum += r.asset.pct; cnt++; }
    }
  }
  const mean = sum / cnt;
  assert.ok(mean >= 35 && mean <= 65, `자산 상위 % 평균 ${mean.toFixed(1)}`);
});

test('미성년·0원·음수 순자산의 순위는 공표 분포 없이 산정하지 않는다', () => {
  const L = E.newLife({ seed: 23 });
  assert.equal(E.standing(L).asset, undefined);
  L.age = 30; L.year = 2025; L.home.parents = false; L.flags.indep = 2025;
  L.home.owned = false; L.home.deposit = 0; L.money.assets = 0; L.money.debt = 0;
  assert.equal(E.standing(L).asset, undefined);
  L.money.debt = 5000;
  assert.equal(E.standing(L).asset, undefined);
  assert.equal(netWorthBottom(-5000, 30, 2025), null);
  assert.equal(netWorthBottom(0, 30, 2025), null);
});
