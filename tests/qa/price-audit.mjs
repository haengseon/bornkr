// 부동산 가격 현실 대조(R20). 실행: node tests/qa/price-audit.mjs [N=600]
// (1) 시도·구 단위 게임 매매·전세가(priceAt / regionalPrice, 그해 명목 만원, 시군구 인구 가중 평균)를 KB 평균 아파트값과 비교
// (2) 등급표(HOME_PRICE_TIER × 곡선)와 월세(rentAt) 표 값, (3) N생애 시뮬레이션의 PIR·RIR(2020~2025 독립 가구)을 주거실태조사와 비교.
// 실제 값 출처: docs/research/validation/R20-wage-and-price-audit.md §2.
import { isMainThread, pool, serve } from './lib/pool.mjs';
import * as E from '../../src/engine/index.js';
import { advance, resolve } from '../../src/engine/life.js';
import { candidates, SGG } from '../../src/engine/sigungu.js';
import { priceAt, rentAt } from '../../src/engine/act.js';
import { regionalPrice, cpiOf } from '../../src/data/housing-regional.js';
import { econ } from '../../src/engine/stats.js';
import { T, yr } from '../../src/engine/tables.js';

const N = +process.argv[2] || 600;
const YEARS = [1990, 1995, 2000, 2005, 2010, 2015, 2020, 2022, 2023, 2024, 2025];
// KB 평균 아파트 매매가(명목 만원; 서울 2000 = 부동산114 공급 평당 648만 × 1.3(전용 환산) × 25.45평). 키: 시도 또는 'seoul.<구>'(2025-12 평당가 × 서울 평균 15.08억/평당 5,925.9만)
const REAL = {
  seoul: { 2000: 21400, 2016: 56300, 2017: 60000, 2020: 104300, 2022: 127600, 2023: 118200, 2024: 127300, 2025: 150800 },
  busan: { 2020: 34600, 2024: 40300 }, daegu: { 2020: 35400, 2024: 34300 }, incheon: { 2024: 41000 }, ulsan: { 2024: 31100 }, jeonnam: { 2024: 19300 },
  'seoul.gangnam': { 2025: 312700 }, 'seoul.seocho': { 2025: 284400 }, 'seoul.songpa': { 2025: 230000 }, 'seoul.yongsan': { 2025: 215700 },
  'seoul.seongdong': { 2025: 184700 }, 'seoul.mapo': { 2025: 171800 }, 'seoul.yangcheon': { 2025: 168200 }, 'seoul.gwangjin': { 2025: 166500 },
  'seoul.gangdong': { 2025: 157500 }, 'seoul.jungnang': { 2025: 76100 }, 'seoul.geumcheon': { 2025: 74300 }, 'seoul.gangbuk': { 2025: 73200 }, 'seoul.dobong': { 2025: 68900 },
};
const JEONSE_RATIO = { seoul: { 2024: 0.496, 2025: 0.47 }, all: { 2024: 0.595 } };
const PIR = { seoul: 13.9, capital: 8.7, metro: 6.3, province: 4.0, national: 6.3 };      // 2024 주거실태조사(자가가구 중위)
const RIR = { capital: 0.184, metro: 0.152, province: 0.127, national: 0.158 };

const f = x => (x == null || !Number.isFinite(x) ? '-' : Math.round(x).toLocaleString('en'));
const gap = (g, r) => (r && Number.isFinite(g) ? `${g / r >= 1 ? '+' : ''}${Math.round((g / r - 1) * 100)}%${Math.abs(g / r - 1) > 0.25 ? ' ⚠' : ''}` : '');
// 시도 평균(그해 존재하는 시군구, candidates 인구 가중) — 그해 명목
function sidoMean(region, year, kind = 'sale') {
  let s = 0, w = 0;
  for (const c of candidates(region, year)) {
    const r = c.r, v = kind === 'sale' ? priceAt(r.housingTier, year, r.id) : (regionalPrice(r.id, year, 'jeonse')?.real ?? null);
    if (v == null) continue;
    s += c.p * v / cpiOf(year); w += c.p;
  }
  return w ? s / w : NaN;
}

function work({ from, to }) {
  const out = [];   // [regionGroup, kind('own'|'rent'), ratio]
  for (let s = from; s < to; s++) {
    const L = E.newLife({ seed: 9_300_000 + s });
    while (L.alive) {
      advance(L);
      while (L.pending) resolve(L, L.pending.defaultId, { auto: true });
      if (!L.alive || L.year < 2020 || L.year > 2025 || L.flags.indep == null || L.home.parents) continue;
      const inc = econ(L).INC, h = L.home, g = h.region === 'seoul' ? 'seoul' : h.regionGroup;
      if (inc <= 0) continue;
      if (h.owned && h.value) out.push([g, 'own', h.value / inc]);
      else if (h.tenure === 'monthly' && h.rent) out.push([g, 'rent', h.rent * 12 / inc]);
    }
  }
  return out;
}

if (!isMainThread) serve(work);
else {
  console.log('\n# 부동산 가격 감사 (명목 만원)\n\n## 1. 시도 평균 매매가 (게임 = 시군구 인구 가중, 84㎡ 환산·군은 단독) vs KB 평균 아파트');
  const regions = ['seoul', 'busan', 'daegu', 'incheon', 'gwangju', 'daejeon', 'ulsan', 'gyeonggi', 'gangwon', 'chungbuk', 'chungnam', 'jeonbuk', 'jeonnam', 'gyeongbuk', 'gyeongnam', 'jeju'];
  console.log('| 시도 | ' + YEARS.join(' | ') + ' | 실제(KB) 대조 |');
  console.log('|---|' + YEARS.map(() => '--:').join('|') + '|---|');
  for (const rg of regions) {
    const vals = YEARS.map(y => sidoMean(rg, y));
    const cmp = Object.entries(REAL[rg] || {}).map(([y, v]) => `${y} ${f(v)} (${gap(sidoMean(rg, +y), v)})`).join(', ');
    console.log(`| ${rg} | ${vals.map(f).join(' | ')} | ${cmp} |`);
  }
  console.log('\n## 2. 서울 구별 2025 매매가 vs KB(2025-12 평당가 환산)');
  console.log('| 구 | 게임 | KB | 격차 | kind |');
  console.log('|---|--:|--:|--:|---|');
  for (const [k, v] of Object.entries(REAL).filter(([k]) => k.includes('.'))) {
    const g = regionalPrice(k, 2025, 'sale')?.value;
    console.log(`| ${k} | ${f(g)} | ${f(v[2025])} | ${gap(g, v[2025])} | ${regionalPrice(k, 2025)?.measured ? 'measured' : 'estimated'} |`);
  }
  const gn = ['seoul.gangnam', 'seoul.seocho', 'seoul.songpa'], nb = ['seoul.nowon', 'seoul.dobong', 'seoul.gangbuk'];
  const m = (ids, y) => ids.reduce((a, id) => a + regionalPrice(id, y, 'sale').value, 0) / ids.length;
  console.log('\n강남3구 ÷ 노도강 배율: ' + YEARS.map(y => `${y} ${(m(gn, y) / m(nb, y)).toFixed(2)}`).join(' · ') + '  (실측 2025 ≈ 4.1 = 평당 10,834 ÷ 2,793·노원 2,800 가정; 2005 강남/서울 1.93)');
  console.log('\n## 3. 전세가율 (시도 평균 전세 ÷ 매매)');
  for (const rg of ['seoul', 'gyeonggi', 'busan', 'daegu', 'jeonnam']) console.log(`- ${rg}: ` + YEARS.map(y => `${y} ${(sidoMean(rg, y, 'jeonse') / sidoMean(rg, y)).toFixed(2)}`).join(' · '));
  console.log(`  (실측 KB 서울 아파트 2024-12 ${JEONSE_RATIO.seoul[2024]}·2025 약 .47, 전국 2024-12 ${JEONSE_RATIO.all[2024]}, 서울 2009 .389 저점·2013 .567)`);
  console.log('\n## 4. 등급표(시군구 시세 없을 때) 매매·월세 — 2025 실질');
  console.log('| tier | 매매(2025) | 매매(1990 명목) | 월세/보증금(2025) | 월세(1995 명목) |');
  console.log('|---|--:|--:|--:|--:|');
  for (const t of [1, 2, 3, 4, 5]) {
    const r25 = rentAt(t, 2025), r95 = rentAt(t, 1995);
    console.log(`| ${t} | ${f(priceAt(t, 2025))} | ${f(priceAt(t, 1990) / cpiOf(1990))} | ${r25.rent} / ${f(r25.deposit)} | ${(r95.rent / cpiOf(1995)).toFixed(0)} |`);
  }
  console.log('(실측 2025 서울 원룸 월세 보증금 1,000만 환산 평균 70만 · 강남 92~100 · 강북 41 [다방])');
  const CH = 20, chunks = Array.from({ length: Math.ceil(N / CH) }, (_, i) => ({ from: i * CH, to: Math.min(N, (i + 1) * CH) }));
  const res = (await pool(import.meta.url, chunks)).flat();
  const med = v => { const s = [...v].sort((a, b) => a - b); return s.length ? s[s.length >> 1] : NaN; };
  console.log(`\n## 5. 시뮬레이션 PIR·RIR (N=${N}, 2020~2025 독립 가구 인-년, 중위)`);
  console.log('| 지역군 | PIR 게임 | PIR 실측 | n | RIR 게임 | RIR 실측 | n |');
  console.log('|---|--:|--:|--:|--:|--:|--:|');
  for (const g of ['seoul', 'capital', 'metro', 'province']) {
    const o = res.filter(x => x[0] === g && x[1] === 'own').map(x => x[2]), r = res.filter(x => x[0] === g && x[1] === 'rent').map(x => x[2]);
    console.log(`| ${g} | ${med(o).toFixed(1)} | ${PIR[g]} | ${o.length} | ${(100 * med(r)).toFixed(1)}% | ${RIR[g] ? (100 * RIR[g]).toFixed(1) + '%' : '-'} | ${r.length} |`);
  }
  console.log('(PIR = 보유 주택 가치 ÷ 가구 연소득. 게임 표본은 1960~85년생(2020~25년 35~65세)이라 실측 전체 가구보다 소득이 높다)');
}
