// QA-S 안전: 자살 사인이 생애 상태(분위·고난 플래그)로 가중되지 않는가(GDD §6.3, ARCHITECTURE §15). 실행: node tests/qa/suicide-bias.mjs [N=40000]
// 방법: 사망 시점 기준 (성 × 10세 구간)별 자살 비중을 기준선으로 두고, 범주별 관측/기대(O/E)와 z를 본다. 상태와 무관하면 O/E≈1.
import fs from 'node:fs';
import { isMainThread, pool, serve, range, table } from './lib/pool.mjs';
import * as E from '../../src/engine/index.js';
import { advance, resolve } from '../../src/engine/life.js';

const SEED0 = 41_000_000;
const SERIOUS = ['cancer', 'heart', 'stroke', 'dementia', 'kidney', 'liver', 'copd', 'diabetes'];

function work({ from, to }) {
  const rows = [];
  for (let s = from; s < to; s++) {
    const L = E.newLife({ seed: SEED0 + s });
    while (L.alive) { advance(L); while (L.pending) resolve(L, L.pending.defaultId, { auto: true }); }
    const d = L.death;
    if (d.age < 10) { rows.push([d.cause === 'suicide' ? 1 : 0, 0, 0, d.age, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]); continue; }
    const f = L.family, t = L.tally, h = L.health;
    const iq = L.cache?.INCpos != null ? Math.min(5, 1 + Math.floor(L.cache.INCpos / 20)) : 3;
    rows.push([
      d.cause === 'suicide' ? 1 : 0, L.sex === 'M' ? 1 : 0, L.birth.quintile, d.age, iq,
      (t.jobLosses || 0) > 0 ? 1 : 0, L.flags.fraud ? 1 : 0, f.divorced ? 1 : 0, L.money.debt > 0 ? 1 : 0,
      SERIOUS.some(k => h.conditions.some(c => c.key === k && c.active)) ? 1 : 0, h.dx.depression ? 1 : 0, L.stats.happiness < 35 ? 1 : 0, L.stats.wealth < 25 ? 1 : 0,
      (t.deficit || 0) >= 5 ? 1 : 0, L.flags.victim ? 1 : 0, L.job.status === 'seeking' || L.job.status === 'inactive' ? 1 : 0,
    ]);
  }
  return rows;
}

if (!isMainThread) serve(work);

if (isMainThread) {
  const N = Number(process.argv[2] || 40000);
  const parts = await pool(import.meta.url, range(N, 500).map(([from, to]) => ({ from, to })));
  const rows = parts.flat();
  const [SUI, MALE, Q, AGE, IQ] = [0, 1, 2, 3, 4];
  const cats = [
    ['출생 소득분위 Q1', r => r[Q] === 1], ['출생 소득분위 Q2', r => r[Q] === 2], ['출생 소득분위 Q3', r => r[Q] === 3], ['출생 소득분위 Q4', r => r[Q] === 4], ['출생 소득분위 Q5', r => r[Q] === 5],
    ['사망 시 소득분위 하위(1~2)', r => r[IQ] <= 2], ['사망 시 소득분위 상위(4~5)', r => r[IQ] >= 4],
    ['실직 경험 있음', r => r[5] === 1], ['전세사기 경험', r => r[6] === 1], ['이혼 경험', r => r[7] === 1], ['사망 시 부채 있음', r => r[8] === 1],
    ['중대 질환(암·심장·뇌졸중·치매 등) 활성', r => r[9] === 1], ['중대 질환 없음', r => r[9] === 0], ['우울 진단 이력', r => r[10] === 1], ['행복 지표 <35', r => r[11] === 1], ['재산 지표 <25', r => r[12] === 1],
    ['적자 5년 이상', r => r[13] === 1], ['폭력 피해 이력(victim)', r => r[14] === 1], ['구직·무직 상태', r => r[15] === 1],
  ];
  // 기준선: 성 × 10세 구간 자살 비중(10세 이상 사망)
  const base = {};
  for (const r of rows) { if (r[AGE] < 10) continue; const k = `${r[MALE]}|${Math.min(80, Math.floor(r[AGE] / 10) * 10)}`; (base[k] ||= [0, 0]); base[k][0]++; base[k][1] += r[SUI]; }
  const out = [];
  for (const [name, fn] of cats) {
    let n = 0, o = 0, e = 0, v = 0;
    for (const r of rows) {
      if (r[AGE] < 10 || !fn(r)) continue;
      const b = base[`${r[MALE]}|${Math.min(80, Math.floor(r[AGE] / 10) * 10)}`], p = b[1] / b[0];
      n++; o += r[SUI]; e += p; v += p * (1 - p);
    }
    const z = v > 0 ? (o - e) / Math.sqrt(v) : 0;
    out.push([name, n, o, e.toFixed(1), (o / e).toFixed(2), z.toFixed(1), Math.abs(z) > 3 ? '불(편향)' : '합']);
  }
  console.log(table(out, ['범주(10세+ 사망자)', '사망', '자살', '기대(성·연령 기준선)', 'O/E', 'z', '판정(|z|≤3)']));
  const tot = rows.filter(r => r[AGE] >= 10);
  console.log(`\n10세+ 사망 ${tot.length} 중 자살 ${tot.reduce((s, r) => s + r[SUI], 0)} (${(tot.reduce((s, r) => s + r[SUI], 0) / tot.length * 100).toFixed(2)}%); 10세 미만 자살 ${rows.filter(r => r[AGE] < 10 && r[SUI]).length}건`);
  // 무조건부: 출생 분위별 생애 자살 비율(참고; m 곱이 모든 사인에 걸리므로 분위 차는 사망률 차에서 옴)
  const byQ = [1, 2, 3, 4, 5].map(q => { const a = rows.filter(r => r[Q] === q); return `Q${q} ${(a.reduce((s, r) => s + r[SUI], 0) / a.length * 100).toFixed(2)}%`; });
  console.log('출생 분위별 전체 생애 중 자살 사망 비율(참고):', byQ.join(' · '));
  fs.mkdirSync(new URL('./out/', import.meta.url), { recursive: true });
  fs.writeFileSync(new URL('./out/suicide.json', import.meta.url), JSON.stringify({ N, out }));
}
