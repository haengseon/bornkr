// QA-S 동료 3명 생성 시간(GDD §15.3: 중급 모바일 4× 쓰로틀 ≤ 300ms → 데스크톱 ≤ 75ms 상당). 실행: node tests/qa/perf-peers.mjs [생애 수=150]
import { performance } from 'node:perf_hooks';
import * as E from '../../src/engine/index.js';
const N = Number(process.argv[2] || 150);
const q = (a, p) => [...a].sort((x, y) => x - y)[Math.min(a.length - 1, Math.floor(p * a.length))];
for (const s of [0, 1, 2]) E.peers(E.newLife({ seed: 9_000 + s }));          // 워밍업(JIT·표 캐시)
const t = [], run = [], first = [];
for (let i = 0; i < N; i++) {
  const L = E.newLife({ seed: 81_000_000 + i });
  const t0 = performance.now(); E.runToEnd(L); run.push(performance.now() - t0);
  const t1 = performance.now(); E.peers(L); t.push(performance.now() - t1);
  // 실제 UI 경로: advanceYear가 처음 비교 나이(7세)에 도달하는 호출 시간
  const M = E.newLife({ seed: 81_500_000 + i });
  let worst = 0;
  while (M.alive && M.age < 8) { const a = performance.now(); E.advanceYear(M); while (M.pending) E.choose(M, M.pending.defaultId, { auto: true }); worst = Math.max(worst, performance.now() - a); }
  first.push(worst);
}
const f = x => x.toFixed(0);
console.log(`peers(): 평균 ${f(t.reduce((s, x) => s + x, 0) / N)}ms · p50 ${f(q(t, .5))} · p95 ${f(q(t, .95))} · 최대 ${f(Math.max(...t))} → ×4 쓰로틀 가정 평균 ${f(4 * t.reduce((s, x) => s + x, 0) / N)}ms · p95 ${f(4 * q(t, .95))}ms (기준 ≤300ms)`);
console.log(`runToEnd(): 평균 ${f(run.reduce((s, x) => s + x, 0) / N)}ms · p95 ${f(q(run, .95))}`);
console.log(`7세 비교 카드가 걸린 advanceYear 최장 호출: 평균 ${f(first.reduce((s, x) => s + x, 0) / N)}ms · p95 ${f(q(first, .95))} · 최대 ${f(Math.max(...first))} (×4: p95 ${f(4 * q(first, .95))}ms)`);
