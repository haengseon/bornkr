// 한 해 표시 항목(quiet·compare·birth 제외) 수 분포. 실행: node tests/qa/feed-dist.mjs [생애 수=2000]
import * as E from '../../src/engine/index.js';
const N = +process.argv[2] || 2000;
const hist = {}, kinds = {};
let years = 0;
for (let s = 0; s < N; s++) {
  const L = E.runToEnd(E.newLife({ seed: 12_000_000 + s }));
  const by = {};
  for (const e of L.log) { if (e.quiet || e.kind === 'compare' || e.kind === 'birth' || e.age === 0) continue; (by[e.age] ||= []).push(e); }
  for (let a = 1; a <= (L.death?.age ?? L.age); a++) { const n = Math.min(by[a]?.length ?? 0, 9); hist[n] = (hist[n] || 0) + 1; years++; for (const e of by[a] || []) kinds[e.kind] = (kinds[e.kind] || 0) + 1; }
}
let mean = 0; for (const [k, v] of Object.entries(hist)) mean += k * v;
console.log('| 표시 항목 수 | 해 수 | 비율 |\n|---|---|---|');
for (const k of Object.keys(hist).sort((a, b) => a - b)) console.log(`| ${k} | ${hist[k]} | ${(hist[k] / years * 100).toFixed(1)}% |`);
console.log(`평균 ${(mean / years).toFixed(2)}/해 (${years}해, ${N}생애)`);
console.log('종류별 해당 합/해:', Object.entries(kinds).map(([k, v]) => `${k} ${(v / years).toFixed(2)}`).join(', '));
