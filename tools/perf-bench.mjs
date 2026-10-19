// 엔진 성능 벤치 + 결정성 해시: node tools/perf-bench.mjs [seeds=8]
// 같은 시드의 L.log·summarize 해시를 출력한다(최적화 전후 동일성 비교용).
import { createHash } from 'node:crypto';
import * as m from '../src/engine/index.js';

const N = Number(process.argv[2] || 8);
const out = { years: [], summarize: [] };
const h = createHash('sha256');
const t0 = performance.now();
for (let seed = 1; seed <= N; seed++) {
  const L = m.newLife({ seed });
  while (L.alive) {
    let t = performance.now(); const r = m.advanceYear(L); out.years.push(performance.now() - t);
    if (r.choice) { t = performance.now(); m.choose(L, r.choice.defaultId, { auto: true }); out.years.push(performance.now() - t); }
  }
  const t = performance.now(); const S = m.summarize(L); out.summarize.push(performance.now() - t);
  h.update(JSON.stringify(L.log)); h.update(JSON.stringify(S));
}
const st = a => { const s = [...a].sort((x, y) => x - y); return { n: s.length, avg: +(s.reduce((x, y) => x + y, 0) / s.length).toFixed(2), p95: +s[Math.floor(s.length * .95)].toFixed(2), max: +s.at(-1).toFixed(2) }; };
console.log(JSON.stringify({ total: +(performance.now() - t0).toFixed(0), years: st(out.years), summarize: st(out.summarize), hash: h.digest('hex').slice(0, 16) }));
