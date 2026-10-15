// 출생 연도별 시군구 분포 상위 10 + 시도·분위·교통 요약. 실행: node tests/qa/region-dist.mjs [N=500]
import { newLife } from '../../src/engine/birth.js';
const N = +process.argv[2] || 500;
for (const year of [1960, 1970, 1980, 1985]) {
  const c = {}, sido = {}, q = [0, 0, 0, 0, 0], tr = {};
  for (let i = 1; i <= N; i++) { const b = newLife({ seed: 7000 + i, forced: { year } }).birth; c[b.sigungu] = (c[b.sigungu] || 0) + 1; sido[b.region] = (sido[b.region] || 0) + 1; q[b.quintile - 1]++; tr[b.transit] = (tr[b.transit] || 0) + 1; }
  const top = o => Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([k, v]) => `${k} ${(v / N * 100).toFixed(1)}%`).join(', ');
  console.log(`${year}: 시군구 ${top(c)}\n  시도 ${top(sido)}\n  분위 ${q.map(x => (x / N).toFixed(2))} 교통 ${JSON.stringify(tr)}`);
}
