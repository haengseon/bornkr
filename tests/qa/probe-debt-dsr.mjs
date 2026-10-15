// QA-S 원리금 부담(DSR>1) 도달 생애 수와 사례. 실행: node tests/qa/probe-debt-dsr.mjs
import * as E from '../../src/engine/index.js';
import { advance, resolve } from '../../src/engine/life.js';
import { econ } from '../../src/engine/stats.js';
let n = 0, hi = 0, tot = 0, mx = 0, ex = [];
for (let s = 3000000; s < 3000600; s++) {
  const L = E.newLife({ seed: s });
  let maxD = 0, atAge = 0, snap = null;
  while (L.alive) { advance(L); while (L.pending) resolve(L, L.pending.defaultId, { auto: true });
    if (L.age >= 19) { const e = econ(L); if (e.dsr > maxD) { maxD = e.dsr; atAge = L.age; snap = { INC: Math.round(e.INC), ds: Math.round(L.money.debtService), loans: JSON.stringify(L.money.loans), job: L.job.status, tenure: L.home.tenure, assets: Math.round(L.money.assets) }; } } }
  tot++; if (maxD > 1) { hi++; if (ex.length < 6) ex.push([s, atAge, maxD.toFixed(2), snap]); }
  mx = Math.max(mx, maxD);
}
console.log('lives with dsr>1 at some age:', hi, '/', tot, 'max', mx.toFixed(2));
for (const e of ex) console.log(JSON.stringify(e));
