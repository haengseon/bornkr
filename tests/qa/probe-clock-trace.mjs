// QA-S 연 진행 시계 추적: 구간별 대기·선택·카드 시간 누적. 실행: node tests/qa/probe-clock-trace.mjs [seed]
import * as E from '../../src/engine/index.js';
import { stageOf } from '../../src/engine/clock.js';
const seed = Number(process.argv[2] || 7000090);
let now = 0; const clock = E.createClock({ now: () => now }); const L = E.newLife({ seed }); clock.start();
const rows = [];
let stageStart = {};
while (L.alive) {
  const d = clock.yearDelay(L, 1); const t0 = now; now += Math.ceil(d / 100) * 100;
  const w = now - t0;
  let r = E.advanceYear(L); let extra = 0;
  const handle = r => { if (r.compare && !r.died && L.alive) { now += 8000; extra += 8000; } if (r.choice) { now += 12000 + 1500; extra += 13500; handle(E.choose(L, r.choice.defaultId, { auto: true })); } };
  handle(r);
  if (!L.alive) now += 1200;
  rows.push([L.age, stageOf(L.age).id, Math.round(d / 100) / 10, Math.round(extra / 100) / 10, Math.round(now / 1000)]);
}
const by = {};
for (const [age, st, w, ex, t] of rows) { by[st] ||= { years: 0, wait: 0, extra: 0, endT: 0 }; by[st].years++; by[st].wait += w; by[st].extra += ex; by[st].endT = t; }
console.log(`seed ${seed} death ${L.death.age} total ${(now / 1000).toFixed(0)}s`);
for (const [st, o] of Object.entries(by)) console.log(st, JSON.stringify({ ...o, wait: +o.wait.toFixed(0), extra: +o.extra.toFixed(0) }));
console.log(rows.filter(r => r[0] % 10 === 0).map(r => r.join(':')).join('  '));
