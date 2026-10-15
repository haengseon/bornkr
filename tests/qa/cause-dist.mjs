// R14 사인 분포 점검. 실행: node tests/qa/cause-dist.mjs [N=2000]   |   node tests/qa/cause-dist.mjs --gen (ERA_CAUSE_AGE 재산출)
// (a) N생애(출생 1960~1985 균등) 사망 연대 × 연령대 사인 구성비 표
// (b) 실측 구성비(통계청 김부연 표1·2: 1983~2003 연령별 / 2025 = CAUSE_SHARE)와 비교: |모형−실측| ≤ max(상대 25%, 절대 3%p)
//     구성비는 '사인 미상(R코드·노쇠)'을 뺀 사인 기준(실측 1980년대 70세+ R코드 40% 같은 기록 공백을 비교에서 제외).
//     판정 1 = 엔진 공식 그대로의 기대 구성비(잡음 없음, 모든 칸) / 판정 2 = 시뮬 칸 중 사망 ≥100.
import { isMainThread, pool, serve, range, table } from './lib/pool.mjs';
import * as E from '../../src/engine/index.js';
import { advance, resolve } from '../../src/engine/life.js';
import { T, yr, ag } from '../../src/engine/tables.js';
import { qx } from '../../src/engine/death.js';

// 통계청 김부연 「한국인의 사망원인 구조 변동추이」 표1(남)·표2(여), % / 연령 0-9,10-19,…,60-69,70+ / 기간 1983-89|1990-94|1995-99|2000-03
const RAW = {
  M: {
    inf: '6.8 5.9 4.1 5.9 5.8 5.2 3.9 2.1|3.5 2.2 2.0 3.9 4.0 3.5 3.2 2.4|2.7 1.2 1.6 3.1 3.5 3.1 2.8 2.4|1.6 1.6 1.8 3.2 3.6 2.9 2.5 2.7',
    tb: '1.7 3.5 3.0 4.8 5.0 4.5 3.4 1.7|0.3 1.2 1.3 2.9 3.1 2.8 2.6 1.9|0.1 0.4 0.9 2.0 2.4 2.1 2.0 1.7|0.1 0.4 0.9 1.6 2.0 1.6 1.6 1.8',
    neo: '4.9 8.1 7.1 13.0 21.2 27.7 23.5 10.1|6.1 8.9 7.1 12.9 22.8 32.6 33.1 17.7|6.6 9.3 7.1 12.8 22.1 33.5 36.5 20.5|5.5 13.2 9.7 15.1 23.4 35.3 39.5 26.3',
    dm: '0.1 0.3 0.4 1.0 1.5 1.9 1.6 0.8|0.1 0.2 0.4 1.4 2.3 3.3 3.5 2.4|0.1 0.1 0.3 1.5 2.8 4.1 4.8 3.4|0.0 0.2 0.6 1.8 3.3 4.6 5.8 4.2',
    circ: '9.4 18.1 13.9 20.1 25.8 30.9 35.2 32.5|4.4 9.3 7.7 13.4 18.4 23.1 30.3 36.2|3.9 4.9 6.1 11.3 15.5 19.8 25.4 27.0|2.4 4.9 6.9 11.7 15.4 18.2 23.1 26.1',
    htn: '0.0 0.5 1.7 4.7 7.9 9.9 10.8 8.7|0.0 0.1 0.3 1.4 3.0 4.6 5.9 7.0|0.0 0.1 0.1 0.4 0.8 1.3 2.1 2.6|0.0 0.0 0.1 0.3 0.5 0.8 1.2 2.0',
    stroke: '1.6 3.0 3.0 5.4 8.7 12.4 16.3 15.6|1.2 1.9 2.0 4.3 7.5 11.1 16.3 19.1|1.0 1.3 1.8 4.1 7.0 10.5 15.2 17.0|0.7 1.5 2.2 4.7 7.5 9.9 14.5 16.6',
    pneu: '11.3 3.9 0.9 0.7 0.8 0.8 0.9 1.1|4.2 1.4 0.4 0.4 0.5 0.6 0.8 1.2|2.3 0.7 0.4 0.4 0.6 0.7 1.0 1.6|1.1 0.6 0.3 0.5 0.6 0.7 0.9 2.1',
    liver: '1.0 2.4 3.4 12.0 17.2 13.3 6.9 2.6|0.5 1.0 2.2 12.1 17.5 13.6 7.0 2.9|0.5 0.5 1.3 10.8 16.9 12.9 6.9 2.4|0.2 0.4 1.2 8.9 16.1 11.4 5.8 2.0',
    R: '9.6 3.8 1.8 2.0 2.4 3.3 15.2 40.0|6.3 2.1 1.0 1.4 1.4 1.7 5.8 20.8|7.7 2.3 2.4 3.7 3.3 2.2 3.7 24.3|6.1 2.2 3.2 4.0 3.5 2.3 2.1 13.7',
    ext: '33.6 44.3 60.4 37.1 17.8 9.4 4.7 2.2|42.6 63.0 72.8 47.0 25.6 14.1 7.5 3.9|38.4 71.4 75.0 48.4 27.0 15.6 8.7 4.1|25.5 63.8 69.1 46.8 25.6 16.0 9.7 5.2',
    trans: '11.7 9.2 18.1 12.9 5.6 2.8 1.3 0.6|19.9 26.1 34.3 22.4 11.6 6.3 3.3 1.7|18.8 39.5 39.5 22.3 11.6 6.9 3.9 1.7|12.0 33.7 31.1 16.9 8.5 5.3 3.6 1.5',
    fall: '3.3 2.6 5.9 4.3 2.3 1.2 0.6 0.3|2.0 1.4 2.6 2.1 1.6 1.0 0.5 0.3|3.0 2.1 3.2 2.9 2.0 1.4 0.8 0.5|2.9 2.1 3.1 3.3 2.5 1.7 1.0 0.8',
    sui: '0.0 5.3 10.0 4.9 2.5 1.4 0.8 0.3|0.0 6.6 9.4 5.7 2.7 1.5 0.8 0.4|0.1 9.3 14.7 10.7 6.0 3.1 1.7 0.7|0.1 11.0 19.4 15.4 8.1 4.7 2.7 1.3',
  },
  F: {
    inf: '8.7 8.4 8.7 7.9 4.4 3.1 2.1 1.3|4.1 3.7 4.8 4.8 3.2 2.0 1.6 1.4|2.9 2.4 3.8 3.6 2.5 2.0 1.7 1.3|1.9 2.3 3.4 2.9 2.6 2.3 1.8 1.7',
    tb: '2.2 5.0 6.5 6.4 3.6 2.2 1.5 0.8|0.6 2.1 3.1 3.6 2.2 1.2 0.9 0.8|0.2 0.9 2.2 2.3 1.5 1.0 0.7 0.7|0.1 0.8 1.8 1.6 1.2 0.8 0.6 0.8',
    neo: '4.8 9.8 15.3 26.1 30.9 28.7 19.8 6.2|6.5 13.2 17.3 30.1 34.9 34.0 26.5 9.9|6.8 13.6 15.5 31.2 37.8 37.4 29.7 10.9|5.6 16.2 18.1 32.9 40.6 42.0 33.8 14.1',
    dm: '0.1 0.6 1.3 1.1 1.5 2.1 2.3 0.9|0.1 0.6 1.5 1.4 2.3 3.7 5.2 2.7|0.1 0.6 1.1 1.5 2.3 4.6 7.5 3.9|0.0 0.4 1.6 1.7 2.6 5.2 8.5 5.3',
    circ: '10.9 21.0 18.7 23.2 32.8 40.2 41.3 33.1|5.1 11.3 12.4 15.4 25.0 33.8 40.3 40.8|4.9 7.4 8.1 11.3 19.2 27.5 35.3 29.8|2.6 6.5 8.0 9.3 16.2 22.5 31.2 30.9',
    htn: '0.0 0.6 1.9 5.4 9.7 12.2 11.2 7.7|0.0 0.1 0.5 2.0 4.7 7.0 7.6 7.5|0.0 0.1 0.3 0.6 1.4 2.5 3.3 3.2|0.0 0.0 0.1 0.3 0.7 1.3 2.2 3.6',
    stroke: '1.7 3.2 3.8 6.1 12.6 18.1 20.5 15.9|1.3 2.6 3.4 5.5 12.0 18.1 22.7 20.6|1.3 2.2 2.8 5.3 11.2 17.1 22.6 18.1|0.9 2.1 3.6 4.6 9.9 14.5 20.3 18.6',
    pneu: '13.9 6.2 2.0 1.2 0.8 0.6 0.7 1.0|5.6 2.8 1.0 0.5 0.5 0.5 0.6 1.0|2.9 0.8 0.6 0.5 0.5 0.5 0.7 1.1|1.4 0.8 0.7 0.5 0.5 0.4 0.6 1.6',
    liver: '1.0 2.8 3.3 4.9 6.4 6.1 3.6 1.4|0.5 1.5 2.0 3.9 6.0 6.0 3.6 1.4|0.6 1.1 1.2 3.3 5.6 6.4 3.5 1.1|0.3 0.5 1.3 3.2 5.2 5.0 3.2 1.0',
    R: '11.6 5.3 3.2 2.7 2.7 4.3 17.7 45.8|7.8 3.0 1.8 1.4 1.4 1.9 7.0 26.9|9.4 2.7 2.5 2.5 2.1 1.5 4.2 33.7|7.0 2.3 2.8 2.6 2.2 1.5 2.0 22.8',
    ext: '24.5 28.6 31.0 21.1 11.7 7.1 4.4 1.7|34.9 45.2 44.4 31.2 18.1 10.9 6.6 2.9|32.8 57.1 55.0 34.8 21.3 11.9 7.0 2.9|21.1 54.3 51.3 35.2 21.2 12.0 7.5 4.5',
    trans: '8.9 5.4 5.0 5.1 3.4 2.2 1.5 0.5|17.4 16.6 15.1 11.2 8.1 5.5 3.4 1.2|17.0 24.9 19.6 12.0 9.0 6.3 3.8 1.2|9.8 22.8 15.5 8.9 6.4 4.9 3.1 1.0',
    fall: '2.6 1.5 1.6 1.5 1.1 0.7 0.4 0.2|1.5 1.3 1.2 0.7 0.5 0.4 0.3 0.3|2.6 2.4 2.2 1.3 0.9 0.6 0.5 0.5|2.3 2.6 1.6 1.3 0.8 0.7 0.6 1.1',
    sui: '0.0 4.6 8.0 4.7 1.9 0.9 0.5 0.2|0.0 7.4 10.9 7.1 2.9 1.2 0.7 0.2|0.1 14.8 19.1 11.5 5.4 2.3 1.1 0.4|0.1 15.7 22.4 16.0 8.1 3.6 2.0 0.8',
  },
};
const PERIODS = [1986, 1992, 1997, 2002], KB = [0, 10, 20, 30, 40, 50, 60, 70];
const GROUPS = ['cancer', 'heart', 'stroke', 'hypertension', 'diabetes', 'pneumonia', 'liver', 'tb', 'infectious', 'transport', 'fall', 'suicide', 'external', 'other'];
const SHORT = { sepsis: '패혈증', kidney: '신장', perinatal: '출생전후기', alzheimer: '알츠하이머', covid: '코로나', cancer: '암', heart: '심장', stroke: '뇌혈관', hypertension: '고혈압', diabetes: '당뇨', pneumonia: '폐렴', liver: '간', tb: '결핵', infectious: '감염', transport: '운수', fall: '추락', suicide: '자살', external: '기타외인', other: '기타', senility: '노쇠·미상' };
const grp = c => T('ERA_CAUSE_AGE').groups[c] ?? c;            // sepsis→infectious, kidney·perinatal·alzheimer·covid→other
const norm = o => { const s = Object.values(o).reduce((a, b) => a + b, 0); return Object.fromEntries(Object.entries(o).map(([k, v]) => [k, s ? v / s : 0])); };

// 실측(사인 미상 제외 구성) REF[sex][period][kb]
const REF = {};
for (const sx of ['M', 'F']) {
  REF[sx] = {};
  const col = Object.fromEntries(Object.entries(RAW[sx]).map(([k, s]) => [k, s.split('|').map(p => p.trim().split(/\s+/).map(Number))]));
  PERIODS.forEach((y, pi) => {
    REF[sx][y] = {};
    KB.forEach((b, bi) => {
      const v = k => col[k][pi][bi];
      const o = {
        cancer: v('neo'), heart: v('circ') - v('htn') - v('stroke'), stroke: v('stroke'), hypertension: v('htn'), diabetes: v('dm'), pneumonia: v('pneu'), liver: v('liver'),
        tb: v('tb'), infectious: v('inf') - v('tb'), transport: v('trans'), fall: v('fall'), suicide: v('sui'), external: v('ext') - v('trans') - v('fall') - v('sui'),
      };
      o.other = 100 - v('inf') - v('neo') - v('dm') - v('circ') - v('pneu') - v('liver') - v('R') - v('ext');
      REF[sx][y][b] = norm(o);
    });
  });
}

// 엔진 공식 그대로의 기대 구성(HIST 가중은 CAUSE_NORM으로 평균 1이라 생략). corr=false면 ERA_CAUSE_AGE 미적용.
function modelBand(sx, band, year, corr = true) {
  const share = T('CAUSE_SHARE')[sx][band], era = T('ERA_CAUSE'), EA = T('ERA_CAUSE_AGE'), ca = corr ? ag(EA[sx], band) || {} : {};
  const w = {};
  for (const [c, s] of Object.entries(share)) {
    if (c === 'suicide' && band < 10) continue;
    const cs = ca[grp(c)];
    w[c] = s * (era[c] ? yr(era[c], year) : 1) * (cs ? yr(cs, year) : 1);
  }
  return norm(w);
}
const known = comp => { const o = {}; for (const [c, v] of Object.entries(comp)) if (c !== 'senility') o[grp(c)] = (o[grp(c)] || 0) + v; return norm(o); };
// 실측 구간(kb) ↔ 엔진 연령대: 0-9 = 0세·1~9세(그해 qx로 가중), 70+ = 70대·80+(사망 6:4 가정)
function bandMix(sx, kb, year) {
  if (kb === 0) { const d0 = qx(sx, 0, year); let d1 = 0; for (let a = 1; a < 10; a++) d1 += qx(sx, a, year); return [[0, d0 / (d0 + d1)], [1, d1 / (d0 + d1)]]; }
  if (kb === 70) return [[70, 0.6], [80, 0.4]];
  return [[kb, 1]];
}
function modelKB(sx, kb, year, corr = true) {
  const o = {};
  for (const [b, w] of bandMix(sx, kb, year)) for (const [g, v] of Object.entries(known(modelBand(sx, b, year, corr)))) o[g] = (o[g] || 0) + w * v;
  return o;
}
const within = (m, r) => Math.abs(m - r) <= Math.max(0.25 * r, 0.03);
const pct = x => (x * 100).toFixed(1);

if (!isMainThread) serve(({ from, to }) => {
  const rows = [];
  for (let s = from; s < to; s++) {
    const L = E.newLife({ seed: 77_000_000 + s });
    while (L.alive) { advance(L); while (L.pending) resolve(L, L.pending.defaultId, { auto: true }); }
    rows.push([L.sex, L.death.age, L.death.year, L.death.cause]);
  }
  return rows;
});

if (isMainThread && process.argv.includes('--gen')) {
  // ERA_CAUSE_AGE 산출: 실측 ÷ 보정 전 모형(사인군별), 2025 = 1. 범위 [0.05, 300], 유효숫자 2자리.
  const out = {};
  for (const sx of ['M', 'F']) {
    out[sx] = {};
    for (const kb of KB) {
      const g = {};
      for (const y of PERIODS) {
        const m = modelKB(sx, kb, y, false), r = REF[sx][y][kb];
        for (const k of GROUPS) {
          if (!m[k] || (kb === 0 && k === 'suicide')) continue;
          (g[k] ||= {})[y] = +Math.min(300, Math.max(0.05, r[k] / m[k])).toPrecision(2);
        }
      }
      for (const k in g) g[k][2025] = 1;
      out[sx][kb] = g;
    }
  }
  for (const sx of ['M', 'F']) {
    console.log(`    ${sx}: {`);
    for (const [kb, g] of Object.entries(out[sx])) console.log(`      ${kb}: { ${Object.entries(g).map(([k, s]) => `${k}: { ${Object.entries(s).map(([y, v]) => `${y}: ${v}`).join(', ')} }`).join(', ')} },`);
    console.log('    },');
  }
} else if (isMainThread) {
  const N = Number(process.argv.find(a => /^\d+$/.test(a)) || 2000);
  const t0 = Date.now();
  const rows = (await pool(import.meta.url, range(N, 250).map(([from, to]) => ({ from, to })))).flat();
  const kbOf = a => (a < 10 ? 0 : Math.min(80, Math.floor(a / 10) * 10));
  const BL = { 0: '0-9', 10: '10대', 20: '20대', 30: '30대', 40: '40대', 50: '50대', 60: '60대', 70: '70대', 80: '80+' };

  // (a) 사망 연대 × 연령대: 사망 수와 상위 4개 사인(엔진 사인 키 그대로, 노쇠·미상 비중 별도)
  const cell = {};
  for (const [, age, year, c] of rows) { const k = `${Math.floor(year / 10) * 10}|${kbOf(age)}`; ((cell[k] ||= {})[c] = (cell[k][c] || 0) + 1); }
  const outA = [];
  for (const k of Object.keys(cell).sort((a, b) => a.split('|')[0] - b.split('|')[0] || a.split('|')[1] - b.split('|')[1])) {
    const o = cell[k], n = Object.values(o).reduce((a, b) => a + b, 0), [dec, b] = k.split('|');
    const top = Object.entries(o).filter(([c]) => c !== 'senility').sort((a, b) => b[1] - a[1]).slice(0, 4).map(([c, v]) => `${SHORT[c] ?? c} ${pct(v / n)}`).join(' · ');
    outA.push([`${dec}년대`, BL[b], n, top, pct((o.senility || 0) / n)]);
  }
  console.log(`(a) ${N}생애 사망 연대 × 연령대 사인 구성(%), 출생 1960~1985 균등\n` + table(outA, ['사망 연대', '연령대', '사망', '상위 사인(%)', '노쇠·미상%']));

  // (b-1) 기대 구성(엔진 공식) vs 실측: 모든 칸
  const fails = [], keyRows = [];
  let cells = 0;
  for (const sx of ['M', 'F']) for (const y of [...PERIODS, 2025]) for (const kb of [0, 10, 20, 30, 40, 50, 60, 70, ...(y === 2025 ? [80] : [])]) {
    const m = y === 2025 ? known(modelBand(sx, kb, y)) : modelKB(sx, kb, y);
    const r = y === 2025 ? known(T('CAUSE_SHARE')[sx][kb]) : REF[sx][y][kb];
    for (const g of GROUPS) { if ((r[g] || 0) < 0.01 && (m[g] || 0) < 0.01) continue; cells++; if (!within(m[g] || 0, r[g] || 0)) fails.push([sx, y, BL[kb], SHORT[g], pct(r[g] || 0), pct(m[g] || 0)]); }
    if ((sx === 'M' && [0, 20, 40].includes(kb)) || (sx === 'F' && kb === 30)) {
      const top = Object.entries(r).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([g]) => g);
      keyRows.push([sx, y, BL[kb], top.map(g => `${SHORT[g]} ${pct(r[g])}/${pct(m[g] || 0)}`).join(' · ')]);
    }
  }
  console.log(`\n(b-1) 기대 구성(엔진 공식) vs 실측 — 대표 칸, '실측/모형' %\n` + table(keyRows, ['성', '연도', '연령대', '상위 4 사인']));
  console.log(`판정 1: ${cells - fails.length}/${cells} 칸 허용 범위(±max(25%, 3%p)) 안`);
  if (fails.length) console.log(table(fails, ['성', '연도', '연령대', '사인', '실측%', '모형%']));

  // (b-2) 시뮬 vs 실측: 기간 칸 중 사망 ≥100
  const PB = [[1983, 1989, 1986], [1990, 1994, 1992], [1995, 1999, 1997], [2000, 2003, 2002], [2024, 2029, 2025]];
  const outB = [];
  let judged = 0, bad = 0;
  for (const sx of ['M', 'F']) for (const [y0, y1, ry] of PB) for (const kb of [0, 10, 20, 30, 40, 50, 60]) {
    const d = rows.filter(([s, a, y]) => s === sx && y >= y0 && y <= y1 && kbOf(a) === kb);
    const g = {}; for (const [, , , c] of d) if (c !== 'senility') g[grp(c)] = (g[grp(c)] || 0) + 1;
    const n = Object.values(g).reduce((a, b) => a + b, 0);
    if (n < 100) continue;
    const r = ry === 2025 ? known(T('CAUSE_SHARE')[sx][kb]) : REF[sx][ry][kb];
    const off = GROUPS.filter(k => (r[k] || 0) >= 0.03 && !within((g[k] || 0) / n, r[k]));
    judged++; if (off.length) bad++;
    outB.push([sx, `${y0}-${y1}`, BL[kb], n, off.map(k => `${SHORT[k]} ${pct(r[k])}→${pct((g[k] || 0) / n)}`).join(' · ') || '합']);
  }
  console.log(`\n(b-2) 시뮬 vs 실측(사망 ≥100 칸, 실측 3% 이상 사인)\n` + (outB.length ? table(outB, ['성', '기간', '연령대', '사망', '벗어난 사인(실측→시뮬)']) : '(해당 칸 없음 — N을 늘릴 것)'));
  console.log(`판정 2: ${judged - bad}/${judged} 칸 통과. 사망 ${rows.length}건, ${((Date.now() - t0) / 1000).toFixed(1)}초`);
}
