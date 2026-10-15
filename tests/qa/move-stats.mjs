// 이사 빈도·연령별 이동률·예산 정합 점검. 실행: node tests/qa/move-stats.mjs [N=2000]
import * as E from '../../src/engine/index.js';
import { advance, resolve } from '../../src/engine/life.js';
import { SGG } from '../../src/engine/sigungu.js';

const N = +process.argv[2] || 2000;
const bands = [[0, 18], [19, 24], [25, 34], [35, 54], [55, 64], [65, 120]];
const pop = bands.map(() => [0, 0]);          // [사람-년, 이사 발생 해]
const dec = {};                               // 출생 10년대별 생애 이사 수
let tot = 0, sameYear2 = 0, redo2 = 0, moveEv = 0, tier5Low = 0, lowMoves = 0, overBudget = 0, ownMoves = 0;
const byReason = {};
for (let s = 0; s < N; s++) {
  const L = E.newLife({ seed: 7_000_000 + s });
  let n = 0, lastMoveYear = -9;
  while (L.alive) {
    const before = L.home.moves.length;
    let r = advance(L);
    while (L.pending) r = resolve(L, L.pending.defaultId, { auto: true });
    const a = L.age, h = L.home;
    const b = bands.findIndex(([lo, hi]) => a >= lo && a <= hi);
    const mv = h.moves.slice(before);
    if (a >= 0) { pop[b][0]++; if (mv.length) pop[b][1]++; }
    if (mv.length) {
      n += mv.length; moveEv++;
      if (mv.length > 1) sameYear2++;
      if (L.year - lastMoveYear <= 2 && lastMoveYear > 0) redo2++;
      lastMoveYear = L.year;
      for (const m of mv) byReason[m.reason] = (byReason[m.reason] || 0) + 1;
      const t = SGG.get(h.sigungu)?.housingTier, last = mv[mv.length - 1];
      if (!h.parents && L.flags.indep != null && last.to !== 'facility' && last.to !== 'dorm' && last.to !== 'family') {
        if (L.cache?.INCpos < 20) { lowMoves++; if (t === 5) tier5Low++; }
        if (last.ok === false) overBudget++;
      }
    }
  }
  tot += n;
  const d = Math.floor(L.birth.year / 10) * 10; (dec[d] ||= []).push(n);
}
const f = x => x.toFixed(1);
console.log(`N=${N}  생애 평균 이사 ${f(tot / N)}회  같은해 2회 ${sameYear2}  2년내 재이사 ${redo2}/${moveEv}`);
console.log('연령별 연 이동률: ' + bands.map(([lo, hi], i) => `${lo}-${hi}:${f(100 * pop[i][1] / pop[i][0])}%`).join(' '));
console.log('출생 10년대별 평균: ' + Object.entries(dec).map(([d, v]) => `${d}s:${f(v.reduce((a, b) => a + b, 0) / v.length)}`).join(' '));
console.log(`예산 초과 목적지 ${overBudget}건 / 소득 하위20% tier5 이동 ${tier5Low}/${lowMoves}`);
console.log('사유별: ' + Object.entries(byReason).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}:${(v / N).toFixed(2)}`).join(' '));
