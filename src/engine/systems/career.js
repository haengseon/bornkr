// 일(GDD §5.3, §10). job = { status, code, title, major, band, ai, hazard, public, regular, firmSize, wage(연), years, history, searchYears, platform, mainTenure }
import { bias } from '../sigungu.js';
import { T, D, yr, ag } from '../tables.js';
import { selfIncome } from '../act.js';
import { JOBS } from '../../data/jobs.js';
import CORE from '../../content/jobs-core.js';
import { LABOR_CAL, CLASS_CAL } from '../tuning.js';
import { leanOdds } from '../stats.js';
import { jobBias } from '../mbti.js';
import { jobPlans, asOptions } from '../plans.js';

const CORE_BY = new Map((CORE || []).map(c => [c.code, c]));
// 핵심 직업 진입 경로 충족(GDD §10.5: 충족 시 배정 ×3)
function entryOk(e, { level, colMajor, age, year, lic }) {
  if (e.minEdu && (EDU_RANK[level] ?? 0) < (EDU_RANK[e.minEdu] ?? 0)) return false;
  if (e.majors && !e.majors.includes(colMajor)) return false;
  if (e.ages && (age < e.ages[0] || age > e.ages[1])) return false;
  if (e.era && (year < (e.era[0] ?? -Infinity) || year > (e.era[1] ?? Infinity))) return false;
  if (e.type === 'license' && e.license && !lic.includes(e.license)) return false;
  return e.type !== 'promote';
}

const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
const EDU_RANK = { none: 0, mid: 0, high: 1, '2yr': 2, '4yr': 3, grad: 4 };
const NONREG_ADJ = { 9: 1.8, 4: 1.4, 2: 0.8, 3: 0.7 };
const REASON = { bankrupt: '사업 부진', layoff: '권고사직', mandatory: '정년', age: '그만둘 나이', other: '개인 사정' };
const working = j => j.status === 'employed' || j.status === 'self';

// ── 직업 표 색인 ──
let BY_MAJOR = null, BY_CODE = null;
function index() {
  if (BY_MAJOR) return;
  BY_MAJOR = {}; BY_CODE = new Map();
  for (const r of JOBS.values) { (BY_MAJOR[r.major] ||= []).push(r); BY_CODE.set(r.code, r); }
}
export const jobByCode = code => (index(), BY_CODE.get(code));

// 표에서 첫 번째로 있는 키의 값
const first = (tab, keys) => { for (const k of keys) if (tab?.[k] != null) return tab[k]; return undefined; };
const eduGroup = lv => (EDU_RANK[lv] >= 2 ? ['college', 'univ', '2yr+', 'high+'] : lv === 'high' ? ['high'] : ['mid', 'low', 'middle']);
const ageBand = a => (a < 30 ? [15, '15', 20] : a < 40 ? [30] : a < 50 ? [40] : a < 60 ? [50] : [60]);

// 직업 배정(GDD §10.2). o: { sex, level, age, rural, colMajor, older, year, licenses }
export function assignJob(L, ctx, o = {}) {
  index();
  const sex = o.sex ?? L.sex, level = o.level ?? L.edu.level, age = o.age ?? L.age, year = o.year ?? L.year;
  const rural = o.rural ?? !L.birth.urban, colMajor = o.colMajor === undefined ? L.edu.college?.major : o.colMajor;
  const lic = o.licenses ?? L.flags.licenses ?? [];
  const byEdu = first(T('OCC_BY_EDU'), eduGroup(level));
  const sexR = T('OCC_SEX_RATIO')[sex], ageR = first(T('OCC_AGE_RATIO'), ageBand(o.older ? 60 : age));
  const era = T('OCC_ERA');
  // 직종은 쉽게 바뀌지 않는다: 일한 적이 있으면 가장 오래 한 일의 대분류·세부 직종 쪽으로 강하게 쏠린다
  const prev = prevJob(L), cont = prev ? (o.older ? 3 : 1) : 0;
  const wm = {};
  for (const m of Object.keys(BY_MAJOR)) {
    const base = byEdu?.[m] ?? 0;
    if (!base) continue;
    wm[m] = (prev && m === prev.major ? 1 + CONT.major * cont : 1) * base * (sexR?.[m] ?? 1) * (ageR?.[m] ?? 1) * (era[m] ? yr(era[m], year) : 1) * (colMajor ? majorAff(colMajor, m) : 1) * bias(L, 'occupationBias', m, 0.5, 2) * jobBias(L, m);   // 성향(MBTI) 약한 편향
  }
  const major = ctx.weighted(wm) ?? '9';
  const mine = EDU_RANK[level] ?? 0;
  const leaf = [];
  for (const r of BY_MAJOR[major]) {
    if (r.since > year || (r.until != null && r.until < year) || !r.w) continue;
    let w = r.w;
    if (r.edu === 'license') w *= lic.includes(r.license) ? 3 : ['drive', 'care', 'tech', 'social', 'acct'].includes(r.license) ? 0.5 : 0;
    else { const need = EDU_RANK[r.edu] ?? 0; w *= need <= mine ? 1 : need === mine + 1 ? 0.2 : 0; }
    if (r.rural) w *= rural ? 3 : 0.3;
    const core = r.core && CORE_BY.get(r.code);
    if (core?.entry?.some(e => entryOk(e, { level, colMajor, age, year, lic }))) w *= 3;
    if (prev && cont) w *= r.code === prev.code ? 1 + CONT.code * cont : r.code.slice(0, 2) === prev.code.slice(0, 2) ? 1 + CONT.sub * cont : 1;
    const fem = r.female ?? 0.446;
    w *= sex === 'F' ? Math.pow(fem / 0.446, 0.7) : Math.pow((1 - fem) / 0.554, 0.7);
    if (w > 0) leaf.push([r, w]);
  }
  if (!leaf.length) return BY_MAJOR[major][0];
  const tot = leaf.reduce((s, x) => s + x[1], 0);
  let r = ctx.rand() * tot;
  for (const [row, w] of leaf) if ((r -= w) < 0) return row;
  return leaf[leaf.length - 1][0];
}
const CONT = { major: 40, code: 80, sub: 25 };
// 가장 오래 일한 이력(없으면 null). 군 복무는 제외
function prevJob(L) {
  const h = (L.job.history || []).filter(x => x.code && !String(x.code).startsWith('A'));
  if (!h.length) return null;
  const best = h.reduce((a, b) => ((b.to ?? L.year) - b.from >= (a.to ?? L.year) - a.from ? b : a));
  return jobByCode(best.code) || null;
}
function majorAff(colMajor, m) {
  const a = T('MAJOR_AFFINITY')[colMajor]?.[m];
  return typeof a === 'number' ? a : a?.w ?? a?.mult ?? 1;
}

// 임금(연, GDD §10.3)
export function wageFor(L, ctx, row, { regular, firmSize, sex = L.sex, age = L.age, year = L.year, sustained = false }) {
  const curve = age >= 60 && sustained ? D.AGE_CURVE.sustained60[sex] : ag(T('AGE_CURVE')[sex], age);
  const era = yr(T('ERA_INCOME_INDEX'), year);
  const m = T('BAND_BASE')[row.band] * curve * (regular ? 1 : 0.65) * (T('FIRM')[firmSize] ?? 1) * era * 0.855 * Math.exp(ctx.normal(0, 0.15) + CLASS_CAL.wageQ * (L.birth.quintile - 3));   // 집안 배경(정보·연결망)에 따른 임금 차 [추정]
  // 하한: 최저 임금 구간(band 1) 기준 월급의 90% [추정: 최저임금 표 미수집]
  return Math.round(Math.max(m, T('BAND_BASE')[1] * 0.9 * era) * 12);
}

function nonregShare(L, age, major) {
  const t = T('NONREG_SHARE'), k = age < 20 ? 15 : age < 30 ? 20 : age < 40 ? 30 : age < 50 ? 40 : age < 60 ? 50 : 60;
  const s = L.year < 2003 ? t[k][2003] * 0.85 : yr(t[k], L.year);
  return clamp(s * (NONREG_ADJ[major] ?? 1) * (age < 30 ? LABOR_CAL.nonregYoung : 1), 0.02, 0.95);
}

// 일자리 제안 만들기(구조 추첨)
export function makeOffer(L, ctx, { older = false, boost = 1 } = {}) {
  // 직업군인: 병역을 마친 남성 첫 일자리에서 드물게(부사관 고졸+채용, 장교 대졸+시험 .3) [추정: 취업자 중 군인 약 0.7%]
  if (!older && L.sex === 'M' && !L.job.history.length && L.mil.status === 'done' && ctx.chance(0.02)) {
    const four = EDU_RANK[L.edu.level] >= 3;
    const row = jobByCode(four && ctx.chance(0.3) ? 'A0120' : 'A0300');
    if (row) return { ...pickRow(row), regular: true, firmSize: 'public', wage: wageFor(L, ctx, row, { regular: true, firmSize: 'public' }) };
  }
  const row = assignJob(L, ctx, { older });
  if (!row.public && ctx.chance((row.selfShare ?? 0) * (older ? 0.5 : 0.6))) {
    return { ...pickRow(row), self: true, regular: false, firmSize: 'micro', wage: selfIncome(L, ctx) };
  }
  const pReg = 1 - nonregShare(L, L.age, row.major) * (older ? 1.4 : 1);
  const regular = ctx.chance(clamp(pReg * boost, 0.02, 0.98));
  let firmSize = 'public';
  if (!row.public) {
    const e = L.edu, pL = (e.level === '4yr' || e.level === 'grad') && e.college?.capital ? 0.3 : EDU_RANK[e.level] >= 2 ? 0.15 : 0.08;
    firmSize = ctx.weighted({ large: pL * boost * (older ? 0.3 : 1), mid: 0.25, small: 0.35, micro: Math.max(0.05, 0.4 - pL) });
  }
  return { ...pickRow(row), regular, firmSize, wage: wageFor(L, ctx, row, { regular, firmSize }) };
}
const pickRow = r => ({ code: r.code, title: r.name, major: r.major, band: r.band, ai: r.ai, hazard: r.hazard, public: !!r.public });

function publicJob(L, ctx) {
  index();
  const mine = EDU_RANK[L.edu.level] ?? 0;
  const rows = JOBS.values.filter(r => r.public && r.edu !== 'license' && (EDU_RANK[r.edu] ?? 0) <= mine && r.major !== '1' && r.major !== 'A' && r.since <= L.year && r.w > 0);
  const tot = rows.reduce((s, r) => s + r.w, 0);
  let x = ctx.rand() * tot;
  const row = rows.find(r => (x -= r.w) < 0) || rows[0];
  return { ...pickRow(row), regular: true, firmSize: 'public', wage: wageFor(L, ctx, row, { regular: true, firmSize: 'public' }) };
}

function careerBreak(L, ctx, reason) {
  // 5년 넘게 다닌 일을 결혼·육아·돌봄·건강으로 그만두면 그게 가장 오래 다닌 일인 경우가 많다(주된 일자리 퇴직, QA-S-06)
  if (!L.flags.mainExited && L.job.years >= 5) { L.flags.mainExited = L.year; L.job.mainTenure = L.job.years; }
  ctx.act.endJob(reason);
  L.job.status = 'inactive';
  L.flags.breakYear = L.year;
  ctx.sys('sys.job.career_break', { reasonLabel: reason });
}

function exitMain(L, ctx, reasonKey) {
  const j = L.job;
  j.mainTenure = j.years;
  L.flags.mainExited = L.year;
  if (reasonKey === 'bankrupt') L.flags.bankruptLoss = L.year;
  ctx.act.endJob(REASON[reasonKey]);                    // 상태를 먼저 바꿔 사건 impact가 변화를 잡게 한다(QA #4)
  ctx.sys('sys.job.exit_main', { years: j.years, reasonLabel: REASON[reasonKey] });
  if (L.age >= 55) ctx.ask({ eventId: 'sys.job.after_main', options: ['work', 'rest', 'shop'], defaultId: L.stats.wealth < 45 ? 'work' : 'rest' });
}

// 재취업(60세+ 고용률 근거). 주된 일자리를 떠나 '다시 일한다'를 고른 사람은 85세 전까지 해마다 다시 구한다(QA-S-06)
function tryReemploy(L, ctx) {
  const p = ag(D.SENIOR_EMPLOYMENT[L.sex], Math.max(60, L.age)) * LABOR_CAL.senior;
  if (L.age < 80 && ctx.chance(p ?? 0)) { ctx.act.startJob(makeOffer(L, ctx, { older: true })); return true; }
  return false;
}

// 일을 잃은 뒤의 다음 걸음: 실업급여·훈련·임시 일·창업·부모 집 중 비용이 보이는 선택
function askLost(L, ctx, reasonLabel) {
  const lost = L.flags.lastJob || { wage: 0, years: 0, regular: false };
  const plans = jobPlans(L, lost, () => { const o = makeOffer(L, ctx, { boost: 0.05 }); return { ...o, regular: false, firmSize: o.firmSize === 'large' ? 'mid' : o.firmSize, wage: Math.round(o.wage * 0.6) }; });
  return ctx.ask({ eventId: 'sys.job.lost', options: asOptions(plans), defaultId: 'seek', data: { plans, lost }, vars: { reasonLabel } });
}

export function step(L, ctx) {
  const j = L.job, a = L.age, fl = L.flags, y = L.year;
  if (j.status === 'military') return;
  if ((j.status === 'none' || j.status === 'student') && a >= 15 && L.edu.stage === 'done') {
    j.status = 'seeking'; j.searchYears = 0;
    ctx.sys('sys.job.search');
  }
  // 지난해 결혼·출산·돌봄·중대 진단(가족·건강 단계가 일 단계 뒤라 한 해 늦게 반영)
  if (working(j) && j.status === 'employed') {
    if (L.sex === 'F' && fl.marryYear === y - 1 && ctx.chance(Math.min(0.85, yr(T('FEMALE_QUIT_MARRY'), y) * LABOR_CAL.quitMarry))) return careerBreak(L, ctx, '결혼');
  }
  if (working(j) && fl.careStart === y - 1 && ctx.chance(L.sex === 'F' ? 0.3 : 0.1)) return careerBreak(L, ctx, '돌봄');
  if (working(j) && ['cancer', 'stroke', 'heart'].some(k => L.health.dx[k] === y - 1) && ctx.chance(0.25)) return careerBreak(L, ctx, '건강');

  if (j.status === 'seeking') return seek(L, ctx);
  if (j.status === 'employed') return employed(L, ctx);
  if (j.status === 'self') return selfEmployed(L, ctx);
  if (j.status === 'inactive') {
    const kids = L.family.children.filter(c => c.alive);
    const youngest = kids.length ? y - Math.max(...kids.map(c => c.birthYear)) : 99;
    if (a >= 60) { j.status = 'retired'; return; }
    if (youngest >= 6 && ctx.chance((a >= 50 ? 0.5 : 1) * LABOR_CAL.ret)) {
      const n = y - (fl.breakYear ?? y);
      ctx.act.startJob({ ...makeOffer(L, ctx, { older: a >= 45 }), silent: true });
      ctx.sys('sys.job.return', { n: Math.max(1, n) });
    }
    return;
  }
  if (j.status === 'retired' && fl.afterWork !== 'rest' && (fl.afterWork === 'work' || (L.age >= 65 && L.stats.wealth < LABOR_CAL.needWork))) tryReemploy(L, ctx);   // 생계가 필요한 은퇴자도 다시 일을 구한다(QA-S-06)
}

function seek(L, ctx) {
  const j = L.job, a = L.age, fl = L.flags, y = L.year;
  j.searchYears++;
  if (a >= 60 && j.searchYears >= 3) { j.status = 'retired'; return; }
  if (fl.examUntil != null) {
    if (y <= (fl.examStarted ?? fl.civilExam ?? -1)) return;
    if (ctx.chance(0.15)) {
      const offer = publicJob(L, ctx);
      fl.examUntil = null; fl.civilExam = null; fl.examFailed = null;
      fl.examResult = { year: y, passed: true };
      ctx.sys('sys.job.exam_pass', { title: offer.title }, { essential: true });
      return ctx.act.startJob({ ...offer, silent: true });
    }
    fl.examResult = { year: y, passed: false };
    ctx.sys('sys.job.exam_fail', {}, { essential: true });
    if (y < fl.examUntil) { ctx.sys('sys.job.exam_continue'); return; }
    fl.examUntil = null; fl.civilExam = null; fl.examFailed = y;
    if (a < 35 && (fl.examTries || 1) < 4) {
      return ctx.ask({ eventId: 'sys.chain.exam_retry', options: ['again', 'quit'], defaultId: 'quit' });
    }
    ctx.sys('sys.job.exam_quit', {}, { essential: true });
    return;                                      // 결과를 정리한 다음 해부터 일반 구직
  }
  if ((j.searchYears === 2 || j.searchYears === 3) && a < 50) ctx.sys('sys.job.search_long', { n: j.searchYears });
  const tab = T('FIRST_JOB_FIND')[L.edu.level] ?? T('FIRST_JOB_FIND').high;
  let p = tab[Math.min(4, j.searchYears)] * Math.sqrt(7.5 / yr(T('YOUTH_UNEMP'), y)) * (j.history.length ? (a < 30 ? LABOR_CAL.find3 : 1) : j.searchYears === 1 ? LABOR_CAL.find : LABOR_CAL.find2) * leanOdds(L, 'wealth');   // find: 첫 일자리 첫해, find2: 그 뒤
  if (a >= 35) p *= a >= 50 ? LABOR_CAL.seek50 : LABOR_CAL.seek35;
  if (L.stats.health < 40) p *= 0.6;
  if (fl.learnUntil >= y) p *= 1.3;
  if (fl.loveFocus >= y) p *= 1.2;
  if (!ctx.chance(clamp(p, 0.02, 0.95))) {
    if (a >= 20 && a <= 60 && y >= 2015 && !j.platform && ctx.chance(0.08)) { j.platform = true; ctx.sys('sys.job.platform'); }
    return;
  }
  const boost = fl.waitBoost === y ? 1.4 : 1;
  const offer = makeOffer(L, ctx, { boost });
  // 첫 제안은 세 번까지만 미룰 수 있고, 35세가 넘으면 묻지 않고 들어간다(QA-S-38)
  if (!j.history.length && (fl.offerSkips || 0) < 3 && a < 35) {
    const exam = EDU_RANK[L.edu.level] >= 1 && y >= 1995;
    return ctx.ask({ eventId: 'sys.job.first_offer', options: ['take', 'wait', ...(exam ? ['exam'] : [])], defaultId: 'take', data: { offer }, vars: { title: offer.title } });
  }
  if (offer.self) return ctx.act.startBusiness(offer.title, offer);
  ctx.act.startJob(offer);
}

function employed(L, ctx) {
  const j = L.job, a = L.age, fl = L.flags, y = L.year;
  j.years++;
  const wr = T('WAGE_RAISE'), eraG = yr(T('ERA_INCOME_INDEX'), y) / yr(T('ERA_INCOME_INDEX'), y - 1);   // 연차 상승 + 시대 실질 임금 성장(R20)
  j.wage = Math.round(j.wage * eraG * (1 + (j.regular ? ag(j.public ? wr.public : wr.regular, a) : wr.nonreg)));
  if (j.regular && [5, 10, 15, 20].includes(j.years)) ctx.sys('sys.job.raise', { n: j.years }, { quiet: true });
  if (!j.regular) {
    if (ctx.chance(LABOR_CAL.convert)) { j.regular = true; return ctx.sys('sys.job.convert'); }
    if (ctx.chance(j.history.length === 1 ? 0.1 : 0.07)) {
      ctx.act.endJob('계약 만료');
      fl.contractEnd = y; L.tally.contractEnds = (L.tally.contractEnds || 0) + 1; L.tally.invol = (L.tally.invol || 0) + 1;
      ctx.sys('sys.job.contract_end');
      return askLost(L, ctx, '계약 만료');
    }
  }
  const shock = T('ERA_SHOCKS')[y]?.job ?? D.ERA_SHOCKS.default?.job ?? 1;
  let pLose = (j.regular ? 0.018 : 0.03) * shock * (j.ai === 'high' && y >= 2025 ? 1.3 : 1) * (j.firmSize === 'micro' ? 1.5 : 1) * (j.public ? 0.2 : 1);
  if (fl.honoraryStay && y - fl.honoraryStay <= 2) pLose *= 2;
  if (fl.leaveYear === y - 1) pLose += 0.1;           // 육아휴직 복귀 해
  if (L.stats.health < 40) pLose *= 2;
  if (fl.shock?.opt === 'hold' && y - fl.shock.year <= 2) pLose *= 1.5;   // 시대 충격에 버티기: 2년간 실직 위험 ↑(이정표 파급)
  if (fl.learnUntil >= y) pLose *= 0.8;                 // 아픈 몸은 일자리를 잃기 쉽다(건강 → 소득 경로, QA-S-04)
  if (ctx.chance(pLose)) {
    const reason = ctx.weighted({ '경영 악화': 0.6, '구조조정': 0.4 });
    if (reason === '경영 악화') fl.bankruptLoss = y;
    if (j.ai === 'high' && y >= 2023 && ctx.chance(0.3)) fl.aiLoss = y;
    L.tally.invol = (L.tally.invol || 0) + 1;
    ctx.act.loseJob(reason);
    return askLost(L, ctx, reason);
  }
  // 주된 일자리 퇴직(GDD §5.3)
  if (!fl.mainExited && j.years >= 5 && a >= (L.sex === 'M' ? 45 : 40)) {
    const man = Math.round(yr(T('MANDATORY_AGE'), y));
    const eh = T('EXIT_HAZARD'), mand = D.EXIT_HAZARD.mandatory ?? { at: 0.45, after: 0.25 };
    const p = j.public ? (a >= man ? 1 : 0.005) : a === man ? mand.at : a > man ? mand.after : (ag(eh[L.sex], a) ?? 0) * LABOR_CAL.exit;
    if (a >= 65 || ctx.chance(p)) {
      const w = { ...T('EXIT_REASON') };
      if (a < man) delete w.mandatory;
      return exitMain(L, ctx, a >= man && (j.public || ctx.chance(0.6)) ? 'mandatory' : ctx.weighted(w));
    }
  }
  // 핵심 직업 전직 규칙(GDD §10.5): 연 1회, 대상 직업의 학력·면허 관문 확인
  for (const t of CORE_BY.get(j.code)?.transitions || []) {
    if (a < t.ages[0] || a > t.ages[1] || j.years < t.minYears || !ctx.chance(t.p)) continue;
    const to = jobByCode(t.to);
    const lic = fl.licenses || [];
    if (!to || (to.edu === 'license' ? !lic.includes(to.license) && !['drive', 'care', 'tech', 'social', 'acct'].includes(to.license) : (EDU_RANK[to.edu] ?? 0) > (EDU_RANK[L.edu.level] ?? 0) + 1)) continue;
    const h = j.history[j.history.length - 1];
    if (h) { h.to = y; h.reason = t.reason; }
    Object.assign(j, pickRow(to), { years: 0, wage: Math.max(j.wage, wageFor(L, ctx, to, { regular: j.regular, firmSize: j.firmSize })) });
    j.history.push({ code: to.code, title: to.name, from: y, to: null, reason: null, ...(to.public && { public: true }) });
    return ctx.sys('sys.job.transition', { title: to.name, reason: t.reason });
  }
  if (j.regular && a >= 50 && a <= 58 && !j.public && !L.yr.asked && ctx.chance(0.06)) {
    return ctx.ask({ eventId: 'sys.job.honorary', options: ['accept', 'stay'], defaultId: 'stay' });
  }
  if (a >= 25 && a <= 49 && j.years >= 3 && !L.yr.asked && ctx.chance(0.12)) {
    const mult = 1.05 + 0.2 * ctx.rand();
    return ctx.ask({ eventId: 'sys.job.offer', options: ['move', 'stay'], defaultId: 'stay', data: { mult, regular: ctx.chance(0.8) } });
  }
  if (j.years >= 10 && a <= 55 && !L.yr.asked && ctx.chance(0.03)) return ctx.ask({ eventId: 'sys.job.business', options: ['open', 'job'], defaultId: 'job' });
  if (j.ai === 'high' && y >= 2024 && !fl.aiShift && ctx.chance(0.1)) { fl.aiShift = y; ctx.sys('sys.job.ai_shift'); }
  if (!j.regular && a >= 20 && a <= 60 && y >= 2015 && !j.platform && ctx.chance(0.08)) { j.platform = true; ctx.sys('sys.job.platform'); }
  if (fl.mainExited && (a >= 85 || (a >= 65 && ctx.chance(0.12)))) { ctx.act.retire(); ctx.sys('sys.job.retire', {}, { quiet: true }); }
}

function selfEmployed(L, ctx) {
  const j = L.job, a = L.age, y = L.year;
  j.years++;
  j.wage = Math.max(0, Math.round(j.wage * Math.exp(ctx.normal(0, 0.1)) * yr(T('ERA_INCOME_INDEX'), y) / yr(T('ERA_INCOME_INDEX'), y - 1)));   // 시대 성장(R20)
  const shock = T('ERA_SHOCKS')[y]?.self ?? D.ERA_SHOCKS.default?.self ?? 1;
  const sh = L.flags.shock, push = L.flags.bizPush >= y ? 0.6 : 1, hold = sh?.opt === 'hold' && y - sh.year <= 2 ? 1.3 : 1;
  if (ctx.chance(T('SELF_CLOSE') * shock * push * hold)) {
    ctx.act.closeBusiness();
    L.tally.invol = (L.tally.invol || 0) + 1;
    if (a >= 60) L.job.status = 'retired';
    return;
  }
  if (a >= 80 || (a >= 65 && ctx.chance(0.1))) { ctx.act.retire(); ctx.sys('sys.job.retire', {}, { quiet: true }); }
}

// 첫아이 출산 해, 일하는 중이면 일을 어떻게 할지(가족 단계에서 호출)
export function askChildcare(L, ctx) {
  if (L.job.status !== 'employed' || L.flags.childcareAsked) return;
  L.flags.childcareAsked = L.year;
  const y = L.year;
  // 여: 2015+는 사용률만큼 휴직, 아니면 퇴직 기준 p로 그만둔다(GDD §5.3 기본값 근거)
  const def = L.sex === 'M' ? 'keep' : y >= 2015 && ctx.chance(yr(T('PARENTAL_LEAVE').F, y)) ? 'leave' : ctx.chance(Math.min(0.85, yr(T('FEMALE_QUIT_BIRTH'), y) * LABOR_CAL.quitBirth)) ? 'quit' : 'keep';
  ctx.ask({ eventId: 'sys.job.childcare', options: ['leave', 'quit', 'keep'], defaultId: def });
}

export const choices = {
  'sys.job.lost'(L, ctx, opt, { plans, lost }) {
    const p = plans.find(x => x.id === opt) || plans[0], j = L.job;
    L.flags.lostPlan = { year: L.year, opt: p.id };
    if (p.benefit) { ctx.act.gain(p.benefit); }
    if (p.id === 'seek') return ctx.apply({ issues: { job: 3 }, stats: { happiness: -1 } }, { reason: '같은 분야부터 다시 구하기 시작했다' });
    if (p.id === 'learn') {
      ctx.act.gain(-p.tuition); L.flags.learnUntil = L.year + 1;
      return ctx.apply({ issues: { job: 2, edu: 3 }, stats: { intellect: 3, leisure: -2 } }, { reason: '훈련 과정에 들어갔다' });
    }
    if (p.id === 'temp') {
      ctx.act.startJob({ ...p.offer, silent: true });
      return ctx.apply({ issues: { job: 4, fairness: 2 }, stats: { health: -1, leisure: -2 } }, { reason: '임시 일자리로 버텼다' });
    }
    if (p.id === 'shop') {
      ctx.act.startBusiness(lost.title, { ...j, capital: p.capital, code: j.code });
      return ctx.apply({ issues: { job: 3 }, stats: { leisure: -3 } }, { reason: '가게를 열었다' });
    }
    if (p.id === 'family') {
      const D = L.home.deposit || 0, mc = 20;
      ctx.act.move('family', { reason: '실직', silent: true });
      L.flags.lostFamily = L.year;
      return ctx.apply({ issues: { housing: -2, job: 3 }, stats: { relations: -1, leisure: -3, happiness: -2 } }, { reason: '부모님 집으로 들어갔다' });
    }
  },
  'sys.job.first_offer'(L, ctx, opt, { offer }) {
    if (opt === 'take') return offer.self ? ctx.act.startBusiness(offer.title, offer) : ctx.act.startJob(offer);
    L.flags.offerSkips = (L.flags.offerSkips || 0) + 1;
    if (opt === 'wait') { L.flags.waitBoost = L.year + 1; return; }
    ctx.act.preparePublicExam(ctx.int(1, 3));
  },
  'sys.job.offer'(L, ctx, opt, { mult, regular }) {
    if (opt !== 'move') return;
    const j = L.job, h = j.history[j.history.length - 1];
    if (h) { h.to = L.year; h.reason = '이직'; }
    j.history.push({ code: j.code, title: j.title, from: L.year, to: null, reason: null });
    j.wage = Math.round(j.wage * mult); j.regular = regular; j.years = 0;
    ctx.apply({ stats: { relations: -3 } }, { reason: '회사를 옮겼다' });
  },
  'sys.job.business'(L, ctx, opt) {
    if (opt === 'open') ctx.act.startBusiness();
  },
  'sys.job.childcare'(L, ctx, opt) {
    if (opt === 'leave') L.flags.leaveYear = L.year;
    else if (opt === 'quit') careerBreak(L, ctx, '육아');
    else ctx.apply({ stats: { leisure: -8 }, issues: { care: 6 } }, { reason: '아이를 키우며 계속 일했다' });
  },
  'sys.job.honorary'(L, ctx, opt) {
    if (opt === 'stay') { L.flags.honoraryStay = L.year; return; }
    ctx.act.gain(Math.round(L.job.wage * 2));
    exitMain(L, ctx, 'layoff');
  },
  'sys.job.after_main'(L, ctx, opt) {
    if (opt === 'shop') return ctx.act.startBusiness();
    ctx.act.retire();
    if (opt === 'rest') { ctx.apply({ stats: { leisure: 8 } }, { reason: '일을 내려놓았다' }); return; }
    L.flags.afterWork = 'work';
    tryReemploy(L, ctx);
  },
};
