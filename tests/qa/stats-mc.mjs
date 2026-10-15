// QA-S 통계 정합 몬테카를로(GDD §15.2). 실행: node tests/qa/stats-mc.mjs [N=20000]
// 결과: tests/qa/out/stats.json(원자료 집계) + 표준출력(마크다운 표).
// 방법: default 정책 N생애(자연 추출) + 코호트 고정 표본(forced.year) 병행. 측정 한계는 표의 '비고'에 적는다.
import fs from 'node:fs';
import { isMainThread, pool, serve, Agg, mergeAgg, mean, sd, pct, fx, range, table } from './lib/pool.mjs';
import * as E from '../../src/engine/index.js';
import { qx, mult, pDeath, cohortQ } from '../../src/engine/death.js';
import { T, yr } from '../../src/engine/tables.js';
import { MAX_AGE } from '../../src/engine/tuning.js';
import { ISSUE_KEYS } from '../../src/engine/constants.js';
import { stageOf } from '../../src/engine/clock.js';
import { advance, resolve } from '../../src/engine/life.js';   // advanceYear는 비교 카드용 동료(3생애)를 만들어 느리므로 내부 진행 함수를 직접 쓴다
import { BIRTH_YEAR_RANGE } from '../../src/engine/constants.js';

const SEED0 = 5_000_000;                     // QA 전용 시드 대역(엔진 단위 테스트와 겹치지 않음)
const band = (a, edges) => { for (let i = edges.length - 1; i >= 0; i--) if (a >= edges[i]) return edges[i]; return null; };
const decade = y => Math.floor(y / 10) * 10;

// ── 한 생애를 해마다 직접 진행(runToEnd와 같은 default 정책) ──
function runLife(L, onYear) {
  while (L.alive) {
    let r = advance(L);
    while (L.pending) r = resolve(L, L.pending.defaultId, { auto: true });
    onYear(L, r);
  }
  return L;
}
const isHead = L => L.flags.indep != null && !L.home.parents && L.home.tenure !== 'dorm' && L.home.tenure !== 'facility';
const empl = L => L.job.status === 'employed' || L.job.status === 'self';

// ── 자연 추출 생애 ──
function mcLife(seed, A) {
  const L = E.newLife({ seed });
  const b = L.birth, sex = L.sex;
  A.add(`birth.dec.${decade(b.year)}`);
  let first = null, prevMarried = false, iq50 = null;
  A.add(`mq.${sex}.0`, pDeath(qx(sex, 0, 2024), mult(L, 0)));
  runLife(L, (L, r) => {
    const a = L.age, y = L.year, f = L.family, j = L.job;
    if (a > 0 || L.alive) A.add(`mq.${sex}.${a}`, pDeath(qx(sex, Math.min(a, MAX_AGE), 2024), mult(L, a)));
    if (first == null && f.marriedYear != null) first = { age: f.marriedYear - b.year, year: f.marriedYear };
    if (a === 50 && L.cache?.INCpos != null) iq50 = Math.min(5, 1 + Math.floor(L.cache.INCpos / 20));
    // 이혼율(2023~2027 풀링): 전년말 유배우 → 올해 이혼
    if (y >= 2023 && y <= 2027 && prevMarried && a > 0) {
      const d = L.flags.divorceYear === y;
      A.add('div.rate', d ? 1 : 0);
      if (d) A.add('div.dur20', y - f.marriedYear >= 20 ? 1 : 0);
    }
    prevMarried = !!(f.married && f.partner) && L.alive;
    if (!L.alive) return;
    // 2025 단면
    if (y === 2025) {
      const e = j.status !== 'military';
      const eb = a >= 25 && a <= 29 ? '25-29' : a >= 30 && a <= 39 ? '30-39' : a >= 40 && a <= 49 ? '40-49' : a >= 50 && a <= 59 ? '50-59' : a >= 60 && a <= 64 ? '60-64' : null;
      if (eb && e) A.add(`emp.2025.${eb}`, empl(L) ? 1 : 0);
      if (sex === 'F' && a >= 40 && a <= 44 && e) A.add('emp.2025.F40-44', empl(L) ? 1 : 0);
      if (a >= 20 && a <= 29 && j.status === 'employed') A.add('nonreg.2025.20s', j.regular ? 0 : 1);
      if (isHead(L)) {
        const ob = a <= 29 ? '≤29' : a <= 39 ? '30s' : a <= 49 ? '40s' : a <= 59 ? '50s' : '60+';
        A.add(`own.2025.${ob}`, L.home.owned ? 1 : 0);
      }
    }
    // 65+ 연령별(연도 무관, 가중은 보고서에서 표준화)
    if (a >= 65) {
      const ab = a >= 85 ? '85+' : a >= 80 ? '80-84' : a >= 75 ? '75-79' : a >= 70 ? '70-74' : '65-69';
      A.add(`emp65.${ab}`, empl(L) ? 1 : 0);
      A.add(`pen65.${ab}`, (L.aging.pensionMonthly || L.aging.basic) ? 1 : 0);
    }
    if (a >= 80) A.add(`ltc.${a >= 90 ? '90+' : a >= 85 ? '85-89' : '80-84'}`, L.aging.ltc > 0 ? 1 : 0);
  });
  // ── 생애 단위 ──
  const d = L.death, c = L.choices;
  A.add('death.all', d.age + 0.5);
  A.add(`death.sex.${sex}`, d.age + 0.5);
  A.add(`death.q${b.quintile}`, d.age + 0.5);
  if (b.year >= 1960 && b.year <= 1985) A.add(`death.q${b.quintile}.old`, d.age + 0.5);
  if (iq50 && d.age >= 50) A.add(`death.iq${iq50}`, d.age + 0.5);
  A.add(`cause.raw.${d.cause}`);
  if (d.year >= 2025) {                                   // ERA_CAUSE가 2025 값으로 고정되는 구간만 표준화에 사용
    const cb = d.age === 0 ? 0 : d.age < 10 ? 1 : Math.min(80, Math.floor(d.age / 10) * 10);
    A.add(`cause.${sex}.${cb}.${d.cause}`);
    A.add(`cause.${sex}.${cb}.n`);
  }
  if (d.age >= 100) A.add('death.100plus');
  A.add('death.max', d.age);
  // 선택 수
  const mine = c.filter(x => !x.forced), forced = c.filter(x => x.forced);
  A.add('ch.total', mine.length); A.add('ch.forced', forced.length);
  const perStage = {};
  for (const x of mine) { const st = stageOf(x.age).id, k = x.eventId.startsWith('sys.') ? 'sys' : 'chance'; perStage[`${st}.${k}`] = (perStage[`${st}.${k}`] || 0) + 1; }
  for (const st of ['early', 'school', 'youth', 'mid', 'late']) for (const k of ['sys', 'chance']) A.add(`ch.${st}.${k}`, perStage[`${st}.${k}`] || 0);
  if (L.death.age >= 6) A.add('ch.first.n', mine.some(x => x.age <= 5) ? 1 : 0);
  // 첫 결혼 연령(연도 풀링)
  if (first) {
    if (first.year >= 2024 && first.year <= 2026) A.add(`fm.2025.${sex}`, first.age);
    if (first.year >= 1989 && first.year <= 1991) A.add(`fm.1990.${sex}`, first.age);
  }
  // 주된 일자리 퇴직 나이(1960~71 출생, 55세 이상 생존자)
  if (b.year <= 1971 && d.age >= 55 && L.flags.mainExited) A.add(`exit.${sex}`, L.flags.mainExited - b.year);
  if (b.year <= 1971 && d.age >= 55) A.add(`exit.n.${sex}`, L.flags.mainExited ? 1 : 0);
  // 첫 취업 소요(2015~2035 졸업)
  const e = L.edu;
  if ((e.level === '4yr' || e.level === '2yr') && e.gradYear >= 2015 && e.gradYear <= 2035) {
    const h0 = L.job.history[0];
    if (h0) A.add(`fj.${e.level}`, h0.from - e.gradYear <= 1 ? 1 : 0);
    else A.add(`fj.${e.level}.never`);
  }
  // 이슈 축 생애 평균(19세~) · 최빈 축
  if (d.age >= 19) {
    const m = ISSUE_KEYS.map((k, i) => { let s = 0, n = 0; for (let a = 19; a <= d.age; a++) if (L.hist[a]) { s += L.hist[a].i[i]; n++; } return n ? s / n : 0; });
    ISSUE_KEYS.forEach((k, i) => A.add(`iss.${k}`, m[i]));
    A.add(`iss.top.${ISSUE_KEYS[m.indexOf(Math.max(...m))]}`);
    A.add('iss.top.n');
  }
  return L;
}

// ── 코호트 고정 표본(forced.year) ──
function cohortJob(job, A) {
  const { kind, year, sex, q, n, seed0 } = job;
  for (let i = 0; i < n; i++) {
    const L = E.newLife({ seed: seed0 + i, forced: { year, ...(sex && { sex }), ...(q && { quintile: q }) } });
    const stopAge = { college: 22, hs: 16, tutor: 16, nm: 51, kids: 51, e0: 999 }[kind];
    const tut = {};
    runLife2(L, stopAge, (L) => {
      if (kind === 'tutor' && [7, 10, 13, 16].includes(L.age)) tut[L.age] = L.edu.tutoring;
    });
    if (kind === 'college') {
      if (L.age >= 18 || !L.alive) {
        const reached18 = L.log.some(x => x.id === 'sys.edu.csat');
        if (reached18) {
          const ent = L.log.find(x => x.id === 'sys.edu.college_enter');
          A.add(`college.${year}.n`);
          A.add(`college.${year}.ent19`, ent && ent.age <= 18 ? 1 : 0);
          A.add(`college.${year}.ent22`, ent ? 1 : 0);
        }
      }
    } else if (kind === 'hs') {
      if (L.edu.highType) { A.add(`hs.${L.edu.highType}`); A.add('hs.n'); }
    } else if (kind === 'tutor') {
      { const a = 2025 - year; if (tut[a] != null) A.add(`tutor.${year}.q${q}`, tut[a] > 0 ? 1 : 0); }
    } else if (kind === 'nm') {
      if (L.alive || L.death.age >= 50) A.add(`nm.${year}.${sex}`, L.family.marriedYear == null ? 1 : 0);
    } else if (kind === 'kids') {
      if (L.alive || L.death.age >= 50) { A.add('kids.n', L.family.children.length); A.add('kids.childless', L.family.children.length === 0 ? 1 : 0); A.add('kids.nm', L.family.marriedYear == null ? 1 : 0); }
    } else if (kind === 'e0') {
      A.add(`e0.${year}.${sex}`, L.death.age + 0.5);
    }
  }
}
// stopAge까지만 진행(생존 중이면)
function runLife2(L, stopAge, onYear) {
  while (L.alive && L.age < stopAge) {
    advance(L);
    while (L.pending) resolve(L, L.pending.defaultId, { auto: true });
    onYear(L);
  }
}

// ── 출생 분포(newLife만) ──
function birthJob(job, A) {
  const { n, seed0, year } = job;
  for (let i = 0; i < n; i++) {
    const L = E.newLife({ seed: seed0 + i, ...(year && { forced: { year } }) });
    const b = L.birth, k = year ? `y${year}` : 'all';
    A.add(`bs.${k}.${L.sex}`);
    if (year) A.add(`bs.${k}.reg.${b.region}`);
    else A.add(`bd.${decade(b.year)}`);
    if (!year) A.add(`bsx.${decade(b.year)}.${L.sex}`);
    A.add(`bq.${k}.${b.quintile}`);
  }
}

function work(job) {
  const A = new Agg();
  if (job.type === 'mc') for (let s = job.from; s < job.to; s++) mcLife(SEED0 + s, A);
  else if (job.type === 'cohort') cohortJob(job, A);
  else if (job.type === 'birth') birthJob(job, A);
  return A.m;
}

if (!isMainThread) serve(work);

async function main() {
  const N = Number(process.argv[2] || 20000), SC = Number(process.argv[3] || 1);   // SC: 코호트 표본 배율(스모크용)
  const t0 = Date.now();
  const jobs = range(N, 250).map(([from, to]) => ({ type: 'mc', from, to }));
  // 코호트 표본
  let sd0 = 90_000_000;
  const next = n => { const s = sd0; sd0 += n + 7; return s; };
  for (const Y of [1990, 2000, 2008, 2015, 2024]) jobs.push({ type: 'cohort', kind: 'college', year: Y - 18, n: Math.round(3000 * SC), seed0: next(3000) });
  // 진학률의 졸업연도 표기를 위해 key를 졸업연도로 바꿔 저장(아래 후처리)
  jobs.push({ type: 'cohort', kind: 'hs', year: 2009, n: Math.round(6000 * SC), seed0: next(6000) });
  for (const Yb of [2009, 2012, 2015, 2018]) for (const q of [1, 2, 3, 4, 5]) jobs.push({ type: 'cohort', kind: 'tutor', year: Yb, q, n: Math.round(800 * SC), seed0: next(800) });
  for (const [Yb, sex] of [[1965, 'M'], [1965, 'F'], [1975, 'M'], [1975, 'F']]) jobs.push({ type: 'cohort', kind: 'nm', year: Yb, sex, n: Math.round(3500 * SC), seed0: next(3500) });
  jobs.push({ type: 'cohort', kind: 'kids', year: 1970, sex: 'F', n: Math.round(5000 * SC), seed0: next(5000) });
  for (const Yb of [1960, 1980, 2000, 2020]) for (const sex of ['M', 'F']) jobs.push({ type: 'cohort', kind: 'e0', year: Yb, sex, n: Math.round(2500 * SC), seed0: next(2500) });
  jobs.push({ type: 'birth', n: Math.round(200000 * SC), seed0: next(200000) });
  for (const y of [1970, 1990, 2010, 2025]) jobs.push({ type: 'birth', n: Math.round(100000 * SC), seed0: next(100000), year: y });
  const parts = await pool(import.meta.url, jobs);
  const M = mergeAgg(parts);
  fs.mkdirSync(new URL('./out/', import.meta.url), { recursive: true });
  fs.writeFileSync(new URL('./out/stats.json', import.meta.url), JSON.stringify({ N, raw: Object.fromEntries(Object.entries(M)) }));
  console.error(`done ${(Date.now() - t0) / 1000}s`);
  report(M, N);
}

// ── 리포트 ──
const ok = (v, tgt, tol) => (Math.abs(v - tgt) <= tol ? '합' : '불');
function report(M, N) {
  const rows = [];
  const R = (name, target, meas, tol, note = '', pass) => rows.push([name, target, meas, tol, pass ?? '', note]);
  const T_ = [];
  // 1. 출생연도 분포(10년대 ±1.0%p)
  const bt = T('BIRTHS_BY_YEAR');
  const decTarget = {}; let totalB = 0;
  for (let y = BIRTH_YEAR_RANGE[0]; y <= BIRTH_YEAR_RANGE[1]; y++) { const v = yr(bt, y); decTarget[decade(y)] = (decTarget[decade(y)] || 0) + v; totalB += v; }
  const nAll = Object.keys(M).filter(k => k.startsWith('bd.')).reduce((s, k) => s + M[k][0], 0);
  let worst = 0, line = [];
  for (const d of Object.keys(decTarget).sort()) { const t = decTarget[d] / totalB, m = M[`bd.${d}`][0] / nAll; worst = Math.max(worst, Math.abs(t - m)); line.push(`${d}s ${pct(t)}/${pct(m)}`); }
  rows.push(['출생연도 분포(10년대)', '표 비례', line.join(' · '), '±1.0%p', worst <= 0.01 ? '합' : '불', `최대 편차 ${pct(worst, 2)}%p (n=${nAll})`]);
  // 2. 성비
  const srLines = []; let srOk = true;
  for (const y of [1970, 1990, 2010, 2025]) {
    const m = M[`bs.y${y}.M`][0], f = M[`bs.y${y}.F`][0], t = yr(T('SEX_RATIO_BY_YEAR'), y), got = 100 * m / f;
    srLines.push(`${y}: ${fx(t, 1)}/${fx(got, 1)}`); if (Math.abs(got - t) > 1.5) srOk = false;
  }
  rows.push(['성비(여 100당 남)', '연도별 표', srLines.join(' · '), '±1.5', srOk ? '합' : '불', 'n=100,000/년(forced.year)']);
  // 3. 시도 비중 2025
  const regT = yr(T('REGION_BIRTH_SHARE'), 2025), regN = Object.keys(regT).reduce((s, k) => s + M[`bs.y2025.reg.${k}`][0], 0);
  let regWorst = 0, regLine = [];
  for (const k of Object.keys(regT)) { const t = regT[k], m = M[`bs.y2025.reg.${k}`][0] / regN; if (Math.abs(t - m) > regWorst) { regWorst = Math.abs(t - m); } regLine.push(`${k} ${pct(t)}/${pct(m)}`); }
  rows.push(['시도 비중(2025 출생)', '표(R01 §3)', regLine.slice(0, 6).join(' · ') + ' …', '±1.0%p', regWorst <= 0.01 ? '합' : '불', `최대 편차 ${pct(regWorst, 2)}%p`]);
  // 3b. 분위 주변분포
  const qLine = [1, 2, 3, 4, 5].map(q => `Q${q} ${pct(M[`bq.all.${q}`][0] / nAll)}`).join(' · ');
  const qOk = [1, 2, 3, 4, 5].every(q => Math.abs(M[`bq.all.${q}`][0] / nAll - 0.2) <= 0.01);
  rows.push(['소득분위 주변분포', '각 20.0%', qLine, '±1.0%p', qOk ? '합' : '불', 'GDD §3.1']);
  // 4. 평균 사망 나이
  const an = analyticE0();
  const sim = mean(M['death.all']);
  rows.push(['평균 사망 나이(출생아 가중)', `${fx(an.all, 2)} (해석, m=1)`, `${fx(sim, 2)} (남 ${fx(mean(M['death.sex.M']), 1)} · 여 ${fx(mean(M['death.sex.F']), 1)})`, '±1.0년', ok(sim, an.all, 1.0), `N=${N}; 해석 남 ${fx(an.M, 1)} 여 ${fx(an.F, 1)}`]);
  // 5. 코호트 e0
  for (const Yb of [1960, 1980, 2000, 2020]) {
    for (const sex of ['M', 'F']) {
      const A_ = M[`e0.${Yb}.${sex}`], a0 = analyticCohort(sex, Yb);
      rows.push([`코호트 e0 ${Yb}년생 ${sex === 'M' ? '남' : '여'}`, fx(a0, 2), `${fx(mean(A_), 2)} (n=${A_[0]})`, '±0.7년', ok(mean(A_), a0, 0.7), 'm 적용 시뮬 vs m=1 해석']);
    }
  }
  // 6. 2024 기간 e0
  for (const sex of ['M', 'F']) {
    let S = 1, e = 0;
    for (let a = 0; a < MAX_AGE; a++) {
      const k = M[`mq.${sex}.${a}`]; const p = k[0] ? k[1] / k[0] : 1;
      e += S * (1 - p / 2); S *= 1 - p;
      if (S < 1e-9) break;
    }
    const t = sex === 'M' ? 80.8 : 86.6;
    rows.push([`2024 기간 e0 ${sex === 'M' ? '남' : '여'}`, t, fx(e, 2), '±0.8', ok(e, t, 0.8), '표본 상태 m × 2024 qx 기대 사망확률로 구성(65세+는 미래 달력연도 표본 상태 사용)']);
  }
  // 7. 소득 Q1-Q5 기대수명 차
  const qd = mean(M['death.q5']) - mean(M['death.q1']), qdOld = mean(M['death.q5.old']) - mean(M['death.q1.old']);
  const iqd = mean(M['death.iq5']) - mean(M['death.iq1']);
  rows.push(['소득 Q5−Q1 기대수명 차(출생 분위)', '4~7년', `${fx(qd, 2)}년 (1960~85생 ${fx(qdOld, 2)})`, '4~7', qd >= 4 && qd <= 7 ? '합' : '불', `Q1 ${fx(mean(M['death.q1']), 1)} · Q5 ${fx(mean(M['death.q5']), 1)}`]);
  rows.push(['소득 Q5−Q1 기대수명 차(50세 INCpos 분위)', '4~7년', `${fx(iqd, 2)}년`, '4~7', iqd >= 4 && iqd <= 7 ? '합' : '불', `n(q1)=${M['death.iq1'][0]}, n(q5)=${M['death.iq5'][0]}`]);
  // 8. 사인 비중(표준화)
  const stdShare = causeStd(M);
  const target = { cancer: 24.9, heart: 9.3, pneumonia: 8.5, stroke: 6.8, suicide: 3.9, alzheimer: 3.8 };
  for (const [c, t] of Object.entries(target)) {
    const raw = M[`cause.raw.${c}`][0] / N * 100;
    rows.push([`사인 비중 ${c}`, `${t}%`, `${fx(stdShare[c] * 100, 1)}% (표준화) · ${fx(raw, 1)}% (표본 원값)`, '±1.5%p', Math.abs(stdShare[c] * 100 - t) <= 1.5 ? '합' : '불', '표준화 = 2025 사망 연령대 분포(R02 §3-3)로 가중']);
  }
  // 9. 교육
  for (const [Y, t] of [[1990, 33.2], [2000, 68.0], [2008, 83.8], [2015, 70.8], [2024, 73.6]]) {
    const n = M[`college.${Y - 18}.n`][0], e19 = M[`college.${Y - 18}.ent19`], e22 = M[`college.${Y - 18}.ent22`];
    rows.push([`고교 졸업 코호트 진학률 ${Y}`, `${t}%`, `${pct(e19[1] / n)}% (당해) · ${pct(e22[1] / n)}% (재수 포함)`, '±3%p', Math.abs(e19[1] / n * 100 - t) <= 3 ? '합' : '불', `n=${n}, 졸업연도=출생+18; 표 ${pct(yr(T('COLLEGE_ENTRY_RATE'), Y))}`]);
  }
  const hn = M['hs.n'][0];
  const hs = ['general', 'vocational', 'special'].map(k => M[`hs.${k}`][0] / hn);
  rows.push(['2025 고교 유형 일반(자율 포함)', '82.3%(75.5+6.8)', `${pct(hs[0])}%`, '±2%p', Math.abs(hs[0] * 100 - 82.3) <= 2 ? '합' : '불', '엔진은 자율고를 일반고에 합산']);
  rows.push(['2025 고교 유형 특성화(직업계)', '12.9%', `${pct(hs[1])}%`, '±2%p', Math.abs(hs[1] * 100 - 12.9) <= 2 ? '합' : '불', `n=${hn}`]);
  rows.push(['2025 고교 유형 특목', '4.7%', `${pct(hs[2])}%`, '±2%p', Math.abs(hs[2] * 100 - 4.7) <= 2 ? '합' : '불', '자율고 6.8%는 일반고 합산']);
  for (const q of [1, 2, 3, 4, 5]) {
    const tg = T('TUTOR_PART')[q] * yr(T('TUTOR_ERA'), 2025);
    const cells = [2009, 2012, 2015, 2018].map(Yb => M[`tutor.${Yb}.q${q}`]);
    const n = cells.reduce((s, c) => s + c[0], 0), x = cells.reduce((s, c) => s + c[1], 0) / n;
    rows.push([`사교육 참여 2025 Q${q}`, `${pct(tg)}%`, `${pct(x)}%`, '±5%p', Math.abs(x - tg) <= 0.05 ? '합' : '불', `n=${n} (7·10·13·16세 추첨 시점)`]);
  }
  // 10. 혼인·가족
  for (const sex of ['M', 'F']) {
    const t = FM(sex, 1990), m = M[`fm.1990.${sex}`];
    rows.push([`평균 초혼 연령 1990 ${sex === 'M' ? '남' : '여'}`, t, `${fx(mean(m), 2)} (n=${m[0]})`, '±1.0', ok(mean(m), t, 1.0), '1989~91 혼인 풀링. 출생 1960+ 표본이라 30세 초과 초혼 절단(측정 한계)']);
  }
  for (const sex of ['M', 'F']) {
    const t = FM(sex, 2025), m = M[`fm.2025.${sex}`];
    rows.push([`평균 초혼 연령 2025 ${sex === 'M' ? '남' : '여'}`, t, `${fx(mean(m), 2)} (n=${m[0]})`, '±1.0', ok(mean(m), t, 1.0), '2024~26 혼인 풀링']);
  }
  for (const [Yb, sex, t, tol] of [[1965, 'M', 10.9, 3], [1965, 'F', 5.0, 2.5], [1975, 'M', 21.4, 3], [1975, 'F', 10.9, 2.5]]) {
    const m = M[`nm.${Yb}.${sex}`];
    rows.push([`생애 미혼율(50세) ${Yb + 50}시점 ${sex === 'M' ? '남' : '여'}`, `${t}%`, `${pct(m[1] / m[0])}% (n=${m[0]})`, `±${tol}%p`, Math.abs(m[1] / m[0] * 100 - t) <= tol ? '합' : '불', `${Yb}년생, 50세 생존자 중 혼인 기록 없음`]);
  }
  const dv = M['div.rate'], d20 = M['div.dur20'];
  rows.push(['유배우 이혼율(2025)', '3.5‰', `${fx(dv[1] / dv[0] * 1000, 2)}‰ (이혼 ${dv[1]}건/유배우 ${dv[0]}인년)`, '±0.8', ok(dv[1] / dv[0] * 1000, 3.5, 0.8), '2023~27 풀링(유배우 전년말 기준)']);
  rows.push(['이혼 중 혼인 20년+ 비중(2025)', '36.6%', `${pct(d20[1] / Math.max(1, d20[0]))}% (n=${d20[0]})`, '±6%p', Math.abs(d20[1] / Math.max(1, d20[0]) * 100 - 36.6) <= 6 ? '합' : '불', '표본 1960+ 출생이라 장기 혼인 일부 절단']);
  const kn = M['kids.n'], kc = M['kids.childless'];
  rows.push(['1970 출생 여성 평균 자녀 수', '1.71', `${fx(mean(kn), 2)} (n=${kn[0]})`, '±0.15', ok(mean(kn), 1.71, 0.15), `미혼 ${pct(M['kids.nm'][1] / kn[0])}%`]);
  rows.push(['1970 출생 여성 무자녀 비율', '12.3%', `${pct(kc[1] / kc[0])}%`, '±3%p', Math.abs(kc[1] / kc[0] * 100 - 12.3) <= 3 ? '합' : '불', '']);
  // 11. 주거·고용
  for (const [b, t] of [['≤29', 8.4], ['30s', 33.0], ['40s', 57.9], ['50s', 63.5], ['60+', 68.5]]) {
    const m = M[`own.2025.${b}`];
    rows.push([`2025 가구주 자가 ${b}`, `${t}%`, `${pct(m[1] / Math.max(1, m[0]))}% (n=${m[0]})`, '±6%p', Math.abs(m[1] / Math.max(1, m[0]) * 100 - t) <= 6 ? '합' : '불', b === '60+' ? '표본은 60~65세만(출생 1960+)' : '독립·부모집 비거주 표본']);
  }
  for (const [b, t] of [['25-29', 71.8], ['30-39', 80.8], ['40-49', 79.9], ['50-59', 77.5], ['60-64', 65.0]]) {
    const m = M[`emp.2025.${b}`];
    rows.push([`2025 고용률 ${b}`, `${t}%`, `${pct(m[1] / Math.max(1, m[0]))}% (n=${m[0]})`, '±5%p', Math.abs(m[1] / Math.max(1, m[0]) * 100 - t) <= 5 ? '합' : '불', '취업+자영 / (군 복무 제외 생존자)']);
  }
  { const m = M['emp.2025.F40-44']; rows.push(['2025 여성 40~44 고용률', '67.2%', `${pct(m[1] / Math.max(1, m[0]))}% (n=${m[0]})`, '±6%p', Math.abs(m[1] / Math.max(1, m[0]) * 100 - 67.2) <= 6 ? '합' : '불', '']); }
  { const m = M['nonreg.2025.20s']; rows.push(['2025 20대 비정규 비율', '43.9%', `${pct(m[1] / Math.max(1, m[0]))}% (n=${m[0]})`, '±6%p', Math.abs(m[1] / Math.max(1, m[0]) * 100 - 43.9) <= 6 ? '합' : '불', '임금근로자 중 regular=false']); }
  { const m = M['fj.4yr'], nv = M['fj.4yr.never']; const tot_ = m[0] + nv[0]; rows.push(['첫 취업 1년 이내(4년제 졸, 2015~35 졸업)', '약 69%', `${pct(m[1] / tot_)}% (취업자 중 ${pct(m[1] / m[0])}%, 미취업 ${pct(nv[0] / tot_)}%)`, '±7%p', Math.abs(m[1] / tot_ * 100 - 69) <= 7 ? '합' : '불', `n=${tot_}`]); }
  { const mm = M['exit.M'], mf = M['exit.F'], all = mean([mm[0] + mf[0], mm[1] + mf[1], 0]); rows.push(['주된 일자리 퇴직 평균 나이(1960~71생 55+ 생존)', '53.0 (남 55.3·여 51.1)', `${fx(all, 1)} (남 ${fx(mean(mm), 1)} · 여 ${fx(mean(mf), 1)})`, '±2.0', ok(all, 53.0, 2.0), `n=${mm[0] + mf[0]}, 퇴직 경험자만`]); }
  // 65+ 표준화(2025 65+ 인구 연령 구성 근사)
  const W65 = { '65-69': 0.33, '70-74': 0.265, '75-79': 0.18, '80-84': 0.13, '85+': 0.095 };
  const std = (pre) => Object.entries(W65).reduce((s, [k, w]) => s + w * (M[`${pre}.${k}`][1] / Math.max(1, M[`${pre}.${k}`][0])), 0);
  const e65 = std('emp65'), p65 = std('pen65');
  rows.push(['65+ 고용률(연령 표준화)', '39.5%', `${pct(e65)}% (65-69 ${pct(M['emp65.65-69'][1] / M['emp65.65-69'][0])} · 70-74 ${pct(M['emp65.70-74'][1] / M['emp65.70-74'][0])} · 75-79 ${pct(M['emp65.75-79'][1] / M['emp65.75-79'][0])} · 80+ ${pct(M['emp65.80-84'][1] / M['emp65.80-84'][0])})`, '±5%p', Math.abs(e65 * 100 - 39.5) <= 5 ? '합' : '불', '가중: 2025 65+ 인구 연령 구성 QA 근사(.33/.265/.18/.13/.095)']);
  rows.push(['65+ 공적·기초연금 수령률(표준화)', '91.2%', `${pct(p65)}% (65-69 ${pct(M['pen65.65-69'][1] / M['pen65.65-69'][0])} · 80-84 ${pct(M['pen65.80-84'][1] / M['pen65.80-84'][0])})`, '±5%p', Math.abs(p65 * 100 - 91.2) <= 5 ? '합' : '불', '국민연금 또는 기초연금 수령']);
  const l80 = (M['ltc.80-84'][1] + M['ltc.85-89'][1] + M['ltc.90+'][1]);
  const Wl = { '80-84': 0.57, '85-89': 0.30, '90+': 0.13 };
  const ltcS = Object.entries(Wl).reduce((s, [k, w]) => s + w * (M[`ltc.${k}`][1] / Math.max(1, M[`ltc.${k}`][0])), 0);
  rows.push(['80+ 장기요양 인정 비율(표준화)', '32.9%', `${pct(ltcS)}% (80-84 ${pct(M['ltc.80-84'][1] / M['ltc.80-84'][0])} · 85-89 ${pct(M['ltc.85-89'][1] / M['ltc.85-89'][0])} · 90+ ${pct(M['ltc.90+'][1] / M['ltc.90+'][0])})`, '±6%p', Math.abs(ltcS * 100 - 32.9) <= 6 ? '합' : '불', `가중 .57/.30/.13 (80+ 연령 구성 근사); 80+ 관측 ${l80}건`]);
  // 12. 이슈 축
  const sds = ISSUE_KEYS.map(k => [k, sd(M[`iss.${k}`]), mean(M[`iss.${k}`])]);
  const topN = M['iss.top.n'][0];
  const tops = ISSUE_KEYS.map(k => [k, M[`iss.top.${k}`][0] / topN]);
  rows.push(['이슈 축 생애 평균 표준편차(각 축)', '≥ 8', sds.map(([k, s, m]) => `${k} ${fx(s, 1)}(μ${fx(m, 0)})`).join(' · '), '≥8', sds.every(x => x[1] >= 8) ? '합' : '불', `축 ${sds.filter(x => x[1] < 8).map(x => x[0]).join(',') || '없음'} < 8`]);
  rows.push(['이슈 최빈 상위 축 쏠림', '한 축 < 50%', tops.map(([k, s]) => `${k} ${pct(s, 0)}%`).join(' · '), '<50%', tops.every(x => x[1] < 0.5) ? '합' : '불', `성인(19+) 생애 평균 기준 argmax, n=${topN}`]);
  // 13. 선택 수
  const per = ['early', 'school', 'youth', 'mid', 'late'].map(st => `${st} 시스템 ${fx(mean(M[`ch.${st}.sys`]), 1)}+우연 ${fx(mean(M[`ch.${st}.chance`]), 1)}`).join(' · ');
  rows.push(['선택 수(생애 평균)', '22~30', `${fx(mean(M['ch.total']), 2)} (자동 적용 ${fx(mean(M['ch.forced']), 2)}) ${per}`, '22~30', mean(M['ch.total']) >= 22 && mean(M['ch.total']) <= 30 ? '합' : '불', `5세까지 첫 선택 ${pct(M['ch.first.n'][1] / M['ch.first.n'][0])}% (6세 이상 생존자)`]);
  console.log(table(rows, ['항목', '목표', '측정', '허용', '합/불', '비고']));
  const pass = rows.filter(r => r[4] === '합').length, fail = rows.filter(r => r[4] === '불').length;
  console.log(`\n합 ${pass} / 불 ${fail} / 총 ${rows.length}`);
  fs.writeFileSync(new URL('./out/stats-table.md', import.meta.url), table(rows, ['항목', '목표', '측정', '허용', '합/불', '비고']) + `\n\n합 ${pass} / 불 ${fail} / 총 ${rows.length}\n`);
}

const FM = (sex, y) => T('FIRST_MARRIAGE_AGE')[sex][y];

// m=1 해석 평균 사망 나이(출생아 가중, 성비 가중)
function analyticCohort(sex, birthYear) {
  const v = cohortQ(sex, birthYear); let S = 1, e = 0;
  for (let a = 0; a <= MAX_AGE; a++) { const q = a >= MAX_AGE ? 1 : v[a]; e += S * q * (a + 0.5); S *= 1 - q; }
  return e;
}
function analyticE0() {
  const bt = T('BIRTHS_BY_YEAR'); let wAll = 0, sAll = 0, wM = 0, sM = 0, wF = 0, sF = 0;
  for (let y = BIRTH_YEAR_RANGE[0]; y <= BIRTH_YEAR_RANGE[1]; y++) {
    const w = yr(bt, y), r = yr(T('SEX_RATIO_BY_YEAR'), y), pm = r / (100 + r);
    const em = analyticCohort('M', y), ef = analyticCohort('F', y);
    sAll += w * (pm * em + (1 - pm) * ef); wAll += w;
    sM += w * pm * em; wM += w * pm; sF += w * (1 - pm) * ef; wF += w * (1 - pm);
  }
  return { all: sAll / wAll, M: sM / wM, F: sF / wF };
}
// 사인: 2025 사망 연령대 구성(R02 §3-3 사망자 수)으로 성·연령대별 시뮬 구성비를 가중
function causeStd(M) {
  const deaths = { 0: 512, 1: 252, 10: 780, 20: 2261, 30: 4406, 40: 10249, 50: 24846, 60: 48499, 70: 72596, 80: 198542 };
  const male = 193547 / (193547 + 169421);
  const out = {}; let totW = 0;
  for (const [cb, nD] of Object.entries(deaths)) {
    for (const sex of ['M', 'F']) {
      const n = M[`cause.${sex}.${cb}.n`][0];
      if (!n) continue;
      const w = nD * (sex === 'M' ? male : 1 - male); totW += w;
      for (const k of Object.keys(M)) {
        const pre = `cause.${sex}.${cb}.`;
        if (k.startsWith(pre) && !k.endsWith('.n')) { const c = k.slice(pre.length); out[c] = (out[c] || 0) + w * M[k][0] / n; }
      }
    }
  }
  for (const c of Object.keys(out)) out[c] /= totW;
  return new Proxy(out, { get: (t, k) => t[k] ?? 0 });
}

if (isMainThread) await main();
