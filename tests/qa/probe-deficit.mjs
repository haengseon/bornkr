// QA-S 적자 해 비중(그해 소득분위·연령대별). 목표: R05 §5.2 적자가구 Q1 58.7% … Q5 7.3%. 실행: node tests/qa/probe-deficit.mjs
import * as E from '../../src/engine/index.js';
import { advance, resolve } from '../../src/engine/life.js';
const byQ = {}, byAge = {};
for (let s = 0; s < 1200; s++) {
  const L = E.newLife({ seed: 91_000_000 + s }); let prev = 0;
  while (L.alive) { advance(L); while (L.pending) resolve(L, L.pending.defaultId, { auto: true });
    const d = (L.tally.deficit || 0) - prev; prev = L.tally.deficit || 0;
    if (L.age >= 19 && L.age < 65 && L.flags.indep != null) { const q = Math.min(5, 1 + Math.floor((L.cache?.INCpos ?? 50) / 20)); (byQ[q] ||= [0, 0]); byQ[q][0]++; byQ[q][1] += d ? 1 : 0; const b = Math.floor(L.age / 10) * 10; (byAge[b] ||= [0, 0]); byAge[b][0]++; byAge[b][1] += d ? 1 : 0; }
  }
}
const f = o => Object.entries(o).sort().map(([k, v]) => `${k}: ${(v[1] / v[0] * 100).toFixed(1)}% (n=${v[0]})`).join(' · ');
console.log('19~64세 독립 성인 연도 중 적자 해 비중 — 그해 소득분위(INCpos):', f(byQ)); console.log('연령대별:', f(byAge));
