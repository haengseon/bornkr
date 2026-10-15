// QA-S 75:25 분산 분해(GDD §13.2). 실행: node tests/qa/variance.mjs [시드 수=2000] [선택지점 표본 상한=120]
//  Y = mean(econ, health, relations, autonomy, 100 − careBurden), 정책 5개(default 1 + random 4), 시드 N
//  share_choice = Var_within / (Var_between + Var_within)
//  + 출생 분위↔econ 상관(random) + 선택 지점별 옵션 간 평균 |ΔY|(CRN: 같은 시드, 해당 선택만 바꿔 다시 돌림)
import fs from 'node:fs';
import { isMainThread, pool, serve, range, table } from './lib/pool.mjs';
import * as E from '../../src/engine/index.js';
import { hashSeed, makeRng, rand } from '../../src/engine/rng.js';
import { advance, resolve } from '../../src/engine/life.js';

const SEED0 = 11_000_000;
const KEYS = ['econ', 'health', 'relations', 'autonomy', 'careBurden'];
const Yof = c => (c.econ.value + c.health.value + c.relations.value + c.autonomy.value + (100 - c.careBurden.value)) / 5;
const closingOf = L => E.summarize(L, { peers: false }).closing;
const randomPolicy = p => (L, req) => req.options[Math.floor(rand(makeRng(hashSeed(L.seed, 'qa-policy', p, req.age, req.eventId))) * req.options.length)].id;

function lifeWith(seed, policy) {
  const L = E.newLife({ seed });
  E.runToEnd(L, policy);
  const c = closingOf(L);
  return { Y: Yof(c), c: KEYS.map(k => c[k].value), q: L.birth.quintile, age: L.death.age, choices: L.choices.filter(x => !x.forced).map(x => [x.eventId, x.age]) };
}

// 선택 지점 변형: eventId의 첫 발생에서 option을 고르고 나머지는 기본값
function variant(seed, eventId, optionId) {
  let done = false;
  const L = E.newLife({ seed });
  E.runToEnd(L, (L, req) => { if (!done && req.eventId === eventId) { done = true; return optionId; } return req.defaultId; });
  return Yof(closingOf(L));
}

function work(job) {
  if (job.type === 'main') {
    const out = [];
    for (let s = job.from; s < job.to; s++) {
      const seed = SEED0 + s;
      const row = { seed, p: [] };
      row.p.push(lifeWith(seed, 'default'));
      for (let p = 1; p <= 4; p++) row.p.push(lifeWith(seed, randomPolicy(p)));
      out.push(row);
    }
    return out;
  }
  if (job.type === 'scan') {        // 선택 지점이 나오는 시드 수집(default 정책)
    const occ = {};
    for (let s = job.from; s < job.to; s++) {
      const seed = SEED0 + 1_000_000 + s;
      const L = E.newLife({ seed });
      while (L.alive) { advance(L); while (L.pending) { const r = L.pending; (occ[r.eventId] ||= []).push([seed, r.options.map(o => o.id)]); resolve(L, r.defaultId, { auto: true }); } }
    }
    return occ;
  }
  if (job.type === 'effect') {
    const res = [];
    for (const [seed, opts] of job.items) {
      const ys = opts.map(o => variant(seed, job.eventId, o));
      let d = 0, n = 0;
      for (let i = 0; i < ys.length; i++) for (let j = i + 1; j < ys.length; j++) { d += Math.abs(ys[i] - ys[j]); n++; }
      res.push(n ? d / n : 0);
    }
    return { eventId: job.eventId, res };
  }
}

if (!isMainThread) serve(work);

const mean = a => a.reduce((s, x) => s + x, 0) / a.length;
const varS = a => { const m = mean(a); return a.reduce((s, x) => s + (x - m) ** 2, 0) / Math.max(1, a.length - 1); };
const corr = (x, y) => { const mx = mean(x), my = mean(y); let sxy = 0, sxx = 0, syy = 0; for (let i = 0; i < x.length; i++) { sxy += (x[i] - mx) * (y[i] - my); sxx += (x[i] - mx) ** 2; syy += (y[i] - my) ** 2; } return sxy / Math.sqrt(sxx * syy); };
const rank = a => { const idx = a.map((v, i) => [v, i]).sort((x, y) => x[0] - y[0]); const r = new Array(a.length); let i = 0; while (i < idx.length) { let j = i; while (j + 1 < idx.length && idx[j + 1][0] === idx[i][0]) j++; for (let k = i; k <= j; k++) r[idx[k][1]] = (i + j) / 2; i = j + 1; } return r; };
const f2 = x => x.toFixed(3);

async function main() {
  const N = Number(process.argv[2] || 2000), CAP = Number(process.argv[3] || 120);
  const t0 = Date.now();
  const parts = await pool(import.meta.url, range(N, 50).map(([from, to]) => ({ type: 'main', from, to })));
  const rows = parts.flat();
  const sh = (sel) => {
    const between = varS(rows.map(r => sel(r.p[0])));
    const within = mean(rows.map(r => varS(r.p.map(sel))));
    return { between, within, share: within / (between + within) };
  };
  const out = [];
  const comp = sh(p => p.Y);
  out.push(['합성 Y', f2(comp.between), f2(comp.within), f2(comp.share), '0.18~0.32', comp.share >= 0.18 && comp.share <= 0.32 ? '합' : '불']);
  KEYS.forEach((k, i) => { const s = sh(p => p.c[i]); out.push([k, f2(s.between), f2(s.within), f2(s.share), '0.10~0.40', s.share >= 0.10 && s.share <= 0.40 ? '합' : '불']); });
  console.log(table(out, ['지표', 'Var_between', 'Var_within', 'share_choice', '합격선', '합/불']));
  // 정책별 평균(방향성)
  const pm = [0, 1, 2, 3, 4].map(i => mean(rows.map(r => r.p[i].Y)));
  console.log(`\n정책별 Y 평균: default ${pm[0].toFixed(2)} · random ${pm.slice(1).map(x => x.toFixed(2)).join(' / ')}`);
  console.log(`default 정책 Y 평균 ${pm[0].toFixed(2)}, SD ${Math.sqrt(varS(rows.map(r => r.p[0].Y))).toFixed(2)}; random 정책 내 SD(시드 내) 평균 ${mean(rows.map(r => Math.sqrt(varS(r.p.map(x => x.Y))))).toFixed(2)}`);
  // 분위↔econ 상관(random 정책 4개 풀링)
  const qx = [], ey = [], ez = [];
  for (const r of rows) for (let p = 1; p <= 4; p++) { qx.push(r.p[p].q); ey.push(r.p[p].c[0]); ez.push(r.p[p].Y); }
  const rho = corr(qx, ey), rhoS = corr(rank(qx), rank(ey)), rhoY = corr(qx, ez);
  const qd = [], ed = [];
  for (const r of rows) { qd.push(r.p[0].q); ed.push(r.p[0].c[0]); }
  console.log(`\n출생 분위↔econ 상관(random 풀링 n=${qx.length}): Pearson ${rho.toFixed(3)} · Spearman ${rhoS.toFixed(3)} (합격 ≥0.35 → ${rho >= 0.35 ? '합' : '불'}) · 분위↔Y ${rhoY.toFixed(3)} · default 정책 Pearson ${corr(qd, ed).toFixed(3)}`);
  const byQ = [1, 2, 3, 4, 5].map(q => { const v = rows.filter(r => r.p[0].q === q).map(r => r.p[0].c[0]); return `Q${q} ${mean(v).toFixed(1)}`; });
  console.log('default 정책 econ 평균(출생 분위별):', byQ.join(' · '));
  console.log(`부수: Y 합성 SD(default) ${Math.sqrt(comp.between).toFixed(2)}`);

  // 선택 지점별 효과
  console.error(`main done ${(Date.now() - t0) / 1000}s; scan…`);
  const scanN = 6000;
  const sparts = await pool(import.meta.url, range(scanN, 200).map(([from, to]) => ({ type: 'scan', from, to })));
  const occ = {};
  for (const p of sparts) for (const [id, arr] of Object.entries(p)) (occ[id] ||= []).push(...arr);
  const jobs = [];
  for (const [id, arr] of Object.entries(occ)) {
    const items = arr.slice(0, CAP);
    for (const [from, to] of range(items.length, 20)) jobs.push({ type: 'effect', eventId: id, items: items.slice(from, to) });
  }
  console.error(`effect jobs ${jobs.length}`);
  const eparts = await pool(import.meta.url, jobs);
  const eff = {};
  for (const p of eparts) (eff[p.eventId] ||= []).push(...p.res);
  const effRows = Object.entries(eff).map(([id, v]) => [id, id.startsWith('sys.') ? '시스템' : '우연', occ[id].length, v.length, mean(v)]).sort((a, b) => a[4] - b[4]);
  fs.mkdirSync(new URL('./out/', import.meta.url), { recursive: true });
  fs.writeFileSync(new URL('./out/variance.json', import.meta.url), JSON.stringify({ N, comp, per: Object.fromEntries(KEYS.map((k, i) => [k, sh(p => p.c[i])])), rho, rhoS, pm, effRows }));
  const tooSmall = effRows.filter(r => r[4] < 0.5), tooBig = effRows.filter(r => r[4] > 8);
  console.log(`\n선택 지점별 옵션 간 평균 |ΔY| (CRN, 표본 ≤${CAP}): 지점 ${effRows.length}개, 0.5 미만 ${tooSmall.length}개, 8 초과 ${tooBig.length}개`);
  const fmt = r => `| ${r[0]} | ${r[1]} | ${r[2]} | ${r[3]} | ${r[4].toFixed(2)} | ${r[4] < 0.5 ? '불(무의미)' : r[4] > 8 ? '불(지배)' : '합'}${r[3] < 30 ? ' (표본<30 참고)' : ''} |`;
  console.log('| 선택 ID | 유형 | 발생(6,000생애) | 변형 표본 | 평균 |ΔY| | 판정 |\n|---|---|---|---|---|---|');
  for (const r of effRows.filter(r => r[1] === '시스템')) console.log(fmt(r));
  console.log('\n(우연 선택: 하위 25 · 상위 10)');
  const ch = effRows.filter(r => r[1] === '우연');
  console.log('| 선택 ID | 유형 | 발생 | 표본 | 평균 |ΔY| | 판정 |\n|---|---|---|---|---|---|');
  for (const r of [...ch.slice(0, 25), ...ch.slice(-10)]) console.log(fmt(r));
  console.log(`\n우연 선택 ${ch.length}개 중 0.5 미만 ${ch.filter(r => r[4] < 0.5).length}개(표본<30 제외 ${ch.filter(r => r[4] < 0.5 && r[3] >= 30).length}개), 8 초과 ${ch.filter(r => r[4] > 8).length}개`);
  console.error(`done ${(Date.now() - t0) / 1000}s`);
}

if (isMainThread) await main();
