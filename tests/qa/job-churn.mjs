// 직업 이력 변동 측정. 실행: node tests/qa/job-churn.mjs [생애 수=300]
import * as E from '../../src/engine/index.js';
const N = +process.argv[2] || 300; let jobs = 0, codes = 0, majors = 0, same = 0, trans = 0, switches = 0, adults = 0;
const dist = {};
for (let s = 0; s < N; s++) {
  const L = E.runToEnd(E.newLife({ seed: 21_000_000 + s })); const h = L.job.history || [];
  if (!h.length) continue; adults++;
  jobs += h.length; codes += new Set(h.map(x => x.code)).size;
  const ms = h.map(x => x.code?.[0]); majors += new Set(ms).size;
  for (let i = 1; i < h.length; i++) { if (h[i].code?.[0] !== h[i - 1].code?.[0]) switches++; }
  dist[h.length] = (dist[h.length] || 0) + 1;
}
console.log(`성인 ${adults}명 | 직 이력 평균 ${(jobs / adults).toFixed(2)} | 서로 다른 직업 ${(codes / adults).toFixed(2)} | 직업 대분류 종류 ${(majors / adults).toFixed(2)} | 대분류 바뀜/생애 ${(switches / adults).toFixed(2)}`);
console.log('이력 길이 분포', JSON.stringify(dist));
const why = {}; for (let s = 0; s < 150; s++) { const L = E.runToEnd(E.newLife({ seed: 21_000_000 + s })); for (const h of L.job.history) why[h.reason || 'cur'] = (why[h.reason || 'cur'] || 0) + 1; }
console.log('종료 사유', JSON.stringify(why));
