// QA-S 코호트 e0: 출생연도 고정 표본(1200/년·성)과 자연 표본의 시뮬 vs 해석(m=1) 편차. 실행: node tests/qa/probe-e0.mjs
import * as E from '../../src/engine/index.js';
import { cohortQ } from '../../src/engine/death.js';
import { MAX_AGE } from '../../src/engine/tuning.js';
const an = (sex, y) => { const v = cohortQ(sex, y); let S = 1, e = 0; for (let a = 0; a <= MAX_AGE; a++) { const q = a >= MAX_AGE ? 1 : v[a]; e += S * q * (a + 0.5); S *= 1 - q; } return e; };
for (const y of [1960, 1964, 1969, 1970, 1979, 1980, 1989]) for (const sex of ['M', 'F']) {
  let s = 0, n = 1200;
  for (let i = 0; i < n; i++) s += E.runToEnd(E.newLife({ seed: 95_000_000 + i + y * 7, forced: { year: y, sex } })).death.age + 0.5;
  console.log(`${y}년생 ${sex}: 시뮬 ${(s / n).toFixed(2)} vs 해석 ${an(sex, y).toFixed(2)} → ${(s / n - an(sex, y)).toFixed(2)}`);
}

// ── 자연 추출 표본(6,000생애)의 출생 10년대별 편차 ──
const by = {};
for (let i = 0; i < 6000; i++) {
  const L = E.runToEnd(E.newLife({ seed: 97_000_000 + i }));
  const d = Math.floor(L.birth.year / 10) * 10;
  (by[d] ||= { n: 0, sim: 0, an: 0 }); by[d].n++; by[d].sim += L.death.age + 0.5; by[d].an += an(L.sex, L.birth.year);
}
for (const [k, o] of Object.entries(by)) console.log(`${k}년대생 n=${o.n}: 시뮬 ${(o.sim / o.n).toFixed(2)} vs 해석 ${(o.an / o.n).toFixed(2)} → ${((o.sim - o.an) / o.n).toFixed(2)}`);
