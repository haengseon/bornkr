// 소득원 구성 측정 [R17]. 실행: node tests/qa/income-mix.mjs [N=3000]
// 65세(또는 그 전 사망 시점) 순자산으로 생애를 줄 세우고, 분위별로 평생 세후 소득원(근로·공적연금 / 임대 / 금융 / 부업 / 사적연금 / 상속) 비중과
// 임대 부동산·부업·개인연금 보유율을 낸다. 결과: 표준출력(마크다운) + tests/qa/out/income-mix.json
import fs from 'node:fs';
import { isMainThread, pool, serve, range, table } from './lib/pool.mjs';
import * as E from '../../src/engine/index.js';
import { advance, resolve } from '../../src/engine/life.js';   // advanceYear는 비교 카드용 동료 생애를 만들어 느리다
import { econ } from '../../src/engine/stats.js';

const SEED0 = 17_000_000;
const KEYS = ['workInc', 'rentInc', 'finInc', 'invGain', 'sideInc', 'pensInc', 'inherit'];

function work([a, b]) {
  const out = [];
  for (let s = a; s < b; s++) {
    const L = E.newLife({ seed: SEED0 + s });
    let nw = null, rental = false, side = false, pens = false;
    while (L.alive) {
      advance(L);
      while (L.pending) resolve(L, L.pending.defaultId, { auto: true });
      if (L.flags.indep != null && L.age <= 65) nw = econ(L).NW;
      rental ||= (L.rentals || []).length > 0; side ||= !!L.flags.sidejob; pens ||= !!L.pension2?.monthly;
    }
    if (nw == null) continue;
    out.push({ nw, by: L.birth.year, rental, side, pens, ...Object.fromEntries(KEYS.map(k => [k, L.tally[k] || 0])) });
  }
  return out;
}

if (!isMainThread) serve(work);
else {
  const N = +(process.argv[2] || 3000);
  const lives = (await pool(import.meta.url, range(N, 50))).flat().sort((x, y) => y.nw - x.nw);
  const q = lives.length, groups = [['상위 20%', lives.slice(0, q * 0.2)], ['20~40%', lives.slice(q * 0.2, q * 0.4)], ['40~60%', lives.slice(q * 0.4, q * 0.6)], ['60~80%', lives.slice(q * 0.6, q * 0.8)], ['하위 20%', lives.slice(q * 0.8)]];
  const rows = groups.map(([name, g]) => {
    const sum = k => g.reduce((s, x) => s + Math.max(0, x[k]), 0);
    const fin = sum('finInc') + g.reduce((s, x) => s + x.invGain, 0);           // 금융 = 현금 이자 1% + 운용 평가손익(손실 포함)
    const parts = { 근로·공적연금: sum('workInc'), 임대: sum('rentInc'), 금융: Math.max(0, fin), 부업: sum('sideInc'), 사적연금: sum('pensInc'), 상속: sum('inherit') };
    const tot = Object.values(parts).reduce((s, v) => s + v, 0) || 1;
    const share = k => `${(100 * g.filter(x => x[k]).length / g.length).toFixed(0)}%`;
    return [name, g.length, Math.round(g.reduce((s, x) => s + x.nw, 0) / g.length).toLocaleString(), ...Object.values(parts).map(v => `${(100 * v / tot).toFixed(1)}%`), share('rental'), share('side'), share('pens')];
  });
  const md = table(rows, ['65세 순자산 분위', '생애 수', '평균 순자산(만)', '근로·공적연금', '임대', '금융', '부업', '사적연금', '상속', '임대 보유', '부업 경험', '개인연금 가입']);
  console.log(md);
  fs.mkdirSync(new URL('./out/', import.meta.url), { recursive: true });
  fs.writeFileSync(new URL('./out/income-mix.json', import.meta.url), JSON.stringify({ N, measured: q, rows }, null, 1));
}
