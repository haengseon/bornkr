// 중대 결정(L.decisions) topic 분포. 실행: node tests/qa/decision-topics.mjs [생애 수=200]
import * as E from '../../src/engine/index.js';
const N = +process.argv[2] || 200, by = {}; let tot = 0;
for (let s = 0; s < N; s++) { const L = E.runToEnd(E.newLife({ seed: 13_000_000 + s })); for (const d of L.decisions || []) { by[d.topic] = (by[d.topic] || 0) + 1; tot++; } }
console.log('| topic | 건수 | 비율 |\n|---|---|---|');
for (const [k, v] of Object.entries(by).sort((a, b) => b[1] - a[1])) console.log(`| ${k} | ${v} | ${(v / tot * 100).toFixed(1)}% |`);
console.log(`합계 ${tot} (${(tot / N).toFixed(1)}/생애)`);
