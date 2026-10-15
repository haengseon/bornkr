// 연봉 현실 대조(R20). 실행: node tests/qa/wage-audit.mjs [N=3000]
// 생애마다 해마다 L.job.wage(연, 2025 실질 만원)를 기록 → (1) 직업군 × 연령(25·35·45·55 ±2) 중앙값을 그해 ERA_INCOME_INDEX로 나눈
// "2025 수준 환산" 연봉과 실제 2024~25 통계 비교, (2) 연도별 평균 임금을 그해 명목(÷CPI_MULT)으로 바꿔 실제 명목 평균 월급과 비교.
// 실제 값 출처: docs/research/R20-wage-and-price-audit.md §1.
import { isMainThread, pool, serve } from './lib/pool.mjs';
import * as E from '../../src/engine/index.js';
import { advance, resolve } from '../../src/engine/life.js';
import { T, yr } from '../../src/engine/tables.js';

const N = +process.argv[2] || 3000, SEED0 = 9_100_000;
const AGES = [25, 35, 45, 55];
const YEARS = [1985, 1990, 1995, 2000, 2005, 2010, 2015, 2020, 2024];

// 직업군 판정(제목·대분류). 순서대로 첫 일치.
const GROUPS = [
  ['의사', j => /^(전문의|일반의|한의사|치과의사)|의사$/.test(j.title) && !/수의사/.test(j.title)],
  ['변호사·판검사', j => /변호사|판사|검사$/.test(j.title)],
  ['교사(초중고)', j => /(초등학교|중‧고등학교|중·고등학교|중학교|고등학교|특수.*) ?교사|^교사/.test(j.title) && !/보육|유치원/.test(j.title)],
  ['공무원(교사 외)', j => j.public && j.major !== '2'],
  ['간호사', j => /^간호사|간호사$/.test(j.title) && !/조무/.test(j.title)],
  ['조리사', j => /조리사|주방장|요리사/.test(j.title)],
  ['운전', j => /운전|기사$/.test(j.title) && (j.major === '8' || j.major === '9')],
];
const MAJOR = { 1: '1 관리자', 2: '2 전문가', 3: '3 사무', 4: '4 서비스', 5: '5 판매', 6: '6 농림어업', 7: '7 기능원(건설 등)', 8: '8 장치·조립', 9: '9 단순노무' };

// 실제(2024~25, 연 만원). mean = 평균. 근거는 R20 §1.
//   대분류: 고용형태별근로실태조사 2025.6 상용5인+ 월임금총액(R04 §6) × 0.855(전체 근로자/상용5인+ = 3,834/4,482) × 12
//   핵심 직업: R20 §1-3 표.
const REAL = {
  '1 관리자': 12563 * 0.855 * 12 / 10, '2 전문가': 5149 * 0.855 * 12 / 10, '3 사무': 4942 * 0.855 * 12 / 10, '4 서비스': 230 * 12,   // 서비스는 상용5인+ 비중이 작아 임금근로일자리 소득 2024 숙박음식 188·보건복지 276·협회개인 229 평균 약 230만으로 대체

  '5 판매': 4104 * 0.855 * 12 / 10, '6 농림어업': 3111 * 0.855 * 12 / 10, '7 기능원(건설 등)': 4147 * 0.855 * 12 / 10, '8 장치·조립': 4215 * 0.855 * 12 / 10,
  '9 단순노무': 2631 * 0.855 * 12 / 10,
  '의사': 20000, '변호사·판검사': 10000, '교사(초중고)': 6700, '공무원(교사 외)': 6500, '간호사': 5000, '조리사': 3200, '운전': 4000,
  '자영업': 4000, '전체 임금': 375 * 12,
};
// 연령별 실제(임금근로일자리 소득 2024.12 평균, 월 만원 → 연, R04 §5): 20대 271 · 30대 397 · 40대 469 · 50대 445 · 60대 293
const REAL_AGE = { 25: 271 * 12, 35: 397 * 12, 45: 469 * 12, 55: 445 * 12, 62: 293 * 12 };
// 임금근로자 전체 명목 평균 월임금(만원): 2005~ = 경활 근로형태별 부가조사 8월(R04 §3-3), 1985~2000 = 매월노동통계(10인+ 상용) × .68(2004 전체/상용 비) 추정 (R20 §1-1)
const REAL_NOM = { 1985: 22.1, 1990: 43.7, 1995: 83.1, 2000: 112.2, 2005: 159.1, 2010: 195.0, 2015: 230.4, 2020: 268.1, 2024: 312.8 };
// 대졸 초임(25~29세 4년제+ 정규 첫 일자리, 연 만원): 한국경영자총협회 대졸 정규직 초임(2025-01 보도) 평균 3,675 / 300인+ 5,001 / 300인 미만 3,238 (R20 §1-4)
const REAL_START = { all: 3675, large: 5001, sme: 3238 };

function work({ from, to }) {
  const obs = [];            // [group, age, wage/era, year, wageReal, kind]  kind: e=employed, s=self
  const start = [];          // 4년제 첫 정규직: [firmSize, wage/era]
  for (let s = from; s < to; s++) {
    const L = E.newLife({ seed: SEED0 + s });
    let first = false;
    while (L.alive) {
      advance(L);
      while (L.pending) resolve(L, L.pending.defaultId, { auto: true });
      const j = L.job, a = L.age;
      if (!L.alive || (j.status !== 'employed' && j.status !== 'self') || !j.wage) continue;
      const era = yr(T('ERA_INCOME_INDEX'), L.year);
      const g = j.status === 'self' ? '자영업' : (GROUPS.find(([, f]) => f(j))?.[0] ?? null);
      obs.push([g, MAJOR[j.major] ?? null, a, Math.round(j.wage / era), L.year, j.wage, j.status === 'self' ? 's' : 'e', j.regular ? 1 : 0, j.firmSize]);
      if (!first && j.status === 'employed' && j.regular && ['4yr', 'grad'].includes(L.edu.level) && a <= 32) { first = true; start.push([j.firmSize, Math.round(j.wage / era)]); }
    }
  }
  return { obs, start };
}

if (!isMainThread) serve(work);
else {
  const CH = 30, chunks = Array.from({ length: Math.ceil(N / CH) }, (_, i) => ({ from: i * CH, to: Math.min(N, (i + 1) * CH) }));
  const res = await pool(import.meta.url, chunks);
  const obs = res.flatMap(r => r.obs), start = res.flatMap(r => r.start);
  const med = v => { if (!v.length) return NaN; const s = [...v].sort((a, b) => a - b); return s[s.length >> 1]; };
  const avg = v => v.reduce((a, b) => a + b, 0) / (v.length || 1);
  const near = (a, c) => Math.abs(a - c) <= 2;
  const f = x => (Number.isFinite(x) ? Math.round(x).toLocaleString('en') : '-');
  const gap = (g, r) => (r && Number.isFinite(g) ? `${g / r >= 1 ? '+' : ''}${Math.round((g / r - 1) * 100)}%${Math.abs(g / r - 1) > 0.25 ? ' ⚠' : ''}` : '');

  console.log(`\n# 연봉 감사 N=${N}생애, 관측 ${obs.length.toLocaleString('en')}인-년 (연 만원, 2025 수준 환산 = 연봉 ÷ 그해 ERA_INCOME_INDEX)\n`);
  console.log('## 1. 직업군 × 연령 중앙값 (전 시대 풀링, 2025 수준 환산)');
  console.log('| 직업군 | n | 25세 | 35세 | 45세 | 55세 | 25~59 평균 | 실제 평균(2024~25) | 격차 |');
  console.log('|---|--:|--:|--:|--:|--:|--:|--:|--:|');
  const rows = [...Object.values(MAJOR), ...GROUPS.map(g => g[0]), '자영업'];
  for (const name of rows) {
    const sub = Object.values(MAJOR).includes(name) ? obs.filter(o => o[1] === name && o[6] === 'e') : obs.filter(o => o[0] === name);
    const cells = AGES.map(a => f(med(sub.filter(o => near(o[2], a)).map(o => o[3]))));
    const m = avg(sub.filter(o => o[2] >= 25 && o[2] <= 59).map(o => o[3]));
    console.log(`| ${name} | ${sub.length} | ${cells.join(' | ')} | ${f(m)} | ${f(REAL[name])} | ${gap(m, REAL[name])} |`);
  }
  const emp = obs.filter(o => o[6] === 'e');
  console.log('\n## 2. 연령 곡선 (임금근로자 평균, 2015~2025 관측만 · 2025 수준 환산)');
  console.log('| 나이 | 게임 평균 | 게임 중앙값 | 실제 평균(2024 일자리 소득) | 격차 |');
  console.log('|---|--:|--:|--:|--:|');
  for (const a of [...AGES, 62]) {
    const v = emp.filter(o => near(o[2], a) && o[4] >= 2015 && o[4] <= 2025).map(o => o[3]);
    const v2 = v.length > 30 ? v : emp.filter(o => near(o[2], a)).map(o => o[3]);
    console.log(`| ${a}${v.length > 30 ? '' : '*'} | ${f(avg(v2))} | ${f(med(v2))} | ${f(REAL_AGE[a])} | ${gap(avg(v2), REAL_AGE[a])} |`);
  }
  console.log('(* 2015~2025 관측 부족 → 전 시대)');
  console.log('\n## 3. 정규/비정규 · 기업 규모 (임금근로자 25~59세, 2025 수준 환산 평균)');
  const by = fn => avg(emp.filter(o => o[2] >= 25 && o[2] <= 59 && fn(o)).map(o => o[3]));
  const reg = by(o => o[7]), non = by(o => !o[7]);
  console.log(`| 정규 ${f(reg)} | 비정규 ${f(non)} | 비/정 ${(non / reg).toFixed(2)} (실제 월임금 비 .536, 시간당 .652) |`);
  const fs = ['large', 'public', 'mid', 'small', 'micro'].map(k => [k, by(o => o[8] === k)]);
  console.log('| ' + fs.map(([k, v]) => `${k} ${f(v)}`).join(' | ') + ` | large/(mid·small·micro) ${(fs[0][1] / by(o => ['mid', 'small', 'micro'].includes(o[8]))).toFixed(2)} (실제 대기업/중소 613/307 = 2.00) |`);
  console.log('\n## 4. 대졸(4년제+) 첫 정규직 연봉 (2025 수준 환산)');
  const st = k => start.filter(s => !k || (k === 'large' ? s[0] === 'large' : ['mid', 'small', 'micro'].includes(s[0]))).map(s => s[1]);
  console.log(`| 전체 평균 ${f(avg(st()))} (실제 ${REAL_START.all}, ${gap(avg(st()), REAL_START.all)}) | 대기업 ${f(avg(st('large')))} (실제 ${REAL_START.large}, ${gap(avg(st('large')), REAL_START.large)}) | 중소 ${f(avg(st('sme')))} (실제 ${REAL_START.sme}, ${gap(avg(st('sme')), REAL_START.sme)}) |`);
  console.log('\n## 5. 연도별 명목 평균 월급 (임금근로자) — 게임 표본은 1960~85년생이라 해마다 연령 구성이 달라, 25~34세 값 ÷ 실제의 비(2015=1)로 시대 지수를 본다');
  console.log('| 연도 | 게임 25~34세 명목 월 | 게임 전 연령 명목 월 | 실제 전체 명목 월 | 25~34 ÷ 실제 (2015=1) |');
  console.log('|---|--:|--:|--:|--:|');
  const nomOf = (y, lo, hi) => avg(emp.filter(o => Math.abs(o[4] - y) <= 1 && o[2] >= lo && o[2] <= hi).map(o => o[5])) / 12 / (y >= 2025 ? 1 : yr(T('CPI_MULT'), y));
  const base = nomOf(2015, 25, 34) / REAL_NOM[2015];
  for (const y of YEARS) {
    const n = nomOf(y, 25, 34), all = nomOf(y, 15, 70), r = n / REAL_NOM[y] / base;
    console.log(`| ${y} | ${n > 0 ? n.toFixed(1) : '-'} | ${all.toFixed(1)} | ${REAL_NOM[y]} | ${n > 0 ? r.toFixed(2) + (Math.abs(r - 1) > 0.25 ? ' ⚠' : '') : '-'} |`);
  }
  console.log('\n(1985~2000 실제 값은 매월노동통계 상용 10인+ × .68 추정. 2015~2024 게임 전 연령 값은 30~64세 위주라 실제 전체보다 높은 게 정상)');
}
