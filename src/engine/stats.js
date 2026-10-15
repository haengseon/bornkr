// 6지표 목표 수렴(GDD §4). 목표식 구성 요소는 explain()도 그대로 쓴다.
import { T, D, yr, ag } from './tables.js';
import { indep } from './act.js';
import { LEAN_CAL, INCOME_CAL, REL_CAL } from './tuning.js';

// 선택의 '방향'(GDD §13.1): 선택한 옵션이 다른 옵션들보다 어느 지표 쪽으로 기울었는지를 지표별 −1~1로 쌓고 해마다 옅어진다.
// 구조 시스템은 이것을 오즈 배수 exp(odds·lean)(±1에서 ×0.6~×1.6)로, 지표 표류는 목표값 가산으로 읽는다.
export const lean = (L, k) => L.lean?.[k] ?? 0;
export const leanOdds = (L, k, sign = 1) => Math.exp(sign * LEAN_CAL.odds * lean(L, k));
export function nudge(L, k, d) {
  if (!d) return;
  const o = (L.lean ||= {});
  o[k] = Math.max(-1, Math.min(1, Math.round(((o[k] || 0) + d) * 1000) / 1000));
}
// 선택한 옵션의 지표 효과 − 같은 사건 옵션 평균 → 방향
export function leanFromChoice(L, options, chosen) {
  const n = options.length;
  for (const k of Object.keys(K_ALL)) {
    const m = options.reduce((s, o) => s + (o.fx?.stats?.[k] || 0), 0) / n;
    nudge(L, k, LEAN_CAL.gain * ((chosen.fx?.stats?.[k] || 0) - m) / 4);
  }
}
const K_ALL = { health: 1, intellect: 1, happiness: 1, wealth: 1, relations: 1, leisure: 1 };

const clamp = (x, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, x));
const K = { health: 0.25, happiness: 0.25, wealth: 0.5, relations: 0.12, leisure: 0.3 };
const COND_PEN = { hypertension: 4, diabetes: 6, heart: 10, stroke: 12, liver: 8, copd: 8, kidney: 8, arthritis: 5, dementia: 10, depression: 4, injury: 6 };

// 분위점 표({P10: v, …} 또는 {10: v, …}) → [[p, v], …]
const BOUNDS = new WeakMap();
function bounds(tab, scale) {
  let b = BOUNDS.get(tab);
  if (!b) BOUNDS.set(tab, b = Object.entries(tab).map(([k, v]) => [+String(k).replace(/\D/g, ''), v]).filter(([p]) => p > 0).sort((x, y) => x[0] - y[0]));
  return b.map(([p, v]) => [p, v * scale]);
}
// 값 x의 백분위(0~100). 첫 분위점 아래는 0까지 선형, 마지막 위는 100에 점근.
export function pctile(x, bs) {
  const [p0, v0] = bs[0], [pn, vn] = bs[bs.length - 1];
  if (x <= v0) return x <= 0 ? 0 : p0 * x / v0;
  for (let i = 1; i < bs.length; i++) {
    const [pa, va] = bs[i - 1], [pb, vb] = bs[i];
    if (x <= vb) return pa + (pb - pa) * (x - va) / (vb - va);
  }
  return pn + (100 - pn) * (1 - vn / x);
}

// 경제 완충력 구성(GDD §4.2)
export function econ(L) {
  const ind = indep(L), m = L.money, p = L.family.partner;
  const NW = ind ? m.assets + (L.home.deposit || 0) + (L.home.owned ? L.home.value : 0) - m.debt : L.household.netWorth;
  const INC = ind ? annualIncome(L) : L.household.income;
  // 가구주 나이: 독립 전에는 부모(어머니 나이 + 본인 나이)
  const head = ind ? L.age : L.birth.parents.motherAge + L.age;
  const nwAge = T('NET_WORTH_BY_AGE'), nwAll = T('NET_WORTH_BOUNDS');
  const median = ag(nwAge, head).median, natMedian = nwAll.P50;
  const NWpos = pctile(NW, bounds(nwAll, median / natMedian * yr(T('ERA_ASSET_INDEX'), L.year)));
  // 독립 후: 가구원 수로 균등화한 소득(÷√가구원)을 같은 시대 균등화 소득 경계로 분위화(QA-S-04). 독립 전: 부모 가구 소득.
  const hh = ind ? 1 + (p ? 1 : 0) + L.family.children.filter(c => c.alive && !c.leftHome).length : 0;
  const eraI = yr(T('ERA_INCOME_INDEX'), L.year);
  const INCpos = ind ? pctile(INC / Math.sqrt(hh), bounds(INCOME_CAL.eq, eraI)) : pctile(INC, bounds(T('INCOME_BOUNDS'), eraI));
  const dsr = INC > 0 ? (m.debtService || 0) / INC : m.debtService > 0 ? 1 : 0;
  const dsrPen = clamp((dsr - 0.3) * 50, 0, 20), defPen = 5 * Math.min(3, m.deficitYears || 0);
  return { NW, INC, hh, NWpos, INCpos, dsr, dsrPen, defPen, partner: !!p, T: clamp(0.5 * NWpos + 0.35 * INCpos + 15 - dsrPen - defPen) };
}

// 올해 가구 연소득(본인 근로·사업 + 배우자 + 연금·기초연금·노인일자리)
export function annualIncome(L) {
  const j = L.job, a = L.aging, p = L.family.partner;
  const work = j.status === 'employed' || j.status === 'self' ? j.wage * (L.flags.leaveYear === L.year ? 0.5 : 1) : 0;
  return work + (p?.income || 0) + 12 * ((a.pensionMonthly || 0) + (a.basic || 0)) + (L.flags.seniorJob === L.year ? T('SENIOR_JOB').monthly * T('SENIOR_JOB').months : 0) + (j.platform && j.status !== 'employed' ? 600 : 0);
}

// 소득 5분위(아동은 가구 q, 성인은 INCpos 5분위, 50세+는 근로기 평균 INCpos와 지금 순자산 위치의 평균 — 은퇴 후 소득만으로 계층이 지워지지 않게, QA-S-04) — 사망·발병 배수용
export function incQuint(L) {
  if (!indep(L)) return L.birth.quintile;
  if (L.age >= 30 && L.tally.incPosN >= 5) return Math.max(1, Math.min(5, 1 + Math.floor((50 + 2.5 * ((L.tally.incPos / L.tally.incPosN + (L.cache?.NWpos ?? econ(L).NWpos)) / 2 - 50)) / 20)));
  return Math.min(5, 1 + Math.floor((L.cache?.INCpos ?? econ(L).INCpos) / 20));
}

export function healthParts(L) {
  const good = L.age >= 65 ? D.SELF_RATED_HEALTH.age65plus : ag(T('SELF_RATED_HEALTH'), L.age);
  const HB = 30 + 55 * good, h = L.health;
  const conds = h.conditions.filter(c => c.active || c.key === 'cancer');
  const condPen = conds.reduce((s, c) => s + (c.key === 'cancer' ? (c.active ? 15 : 5) : COND_PEN[c.key] ?? 0), 0);
  const working = L.job.status === 'employed' || L.job.status === 'self';
  const parts = {
    HB, good, access: 0.1 * (L.birth.healthAccess - 50), condPen, conds,
    smoke: h.smoker === 1 ? 6 : 0, drink: h.drinker ? 3 : 0,
    hazard: working && (L.job.hazard ?? 0) >= 2 ? 4 : 0, exercise: L.flags.exercise ? 3 : 0,
  };
  parts.T = clamp(HB + parts.access - condPen - parts.smoke - parts.drink - parts.hazard + parts.exercise);
  return parts;
}

export const kidsAt = (L, lo, hi) => L.family.children.filter(c => c.alive && !c.leftHome && L.year - c.birthYear >= lo && L.year - c.birthYear <= hi).length;

export function leisureParts(L, e = econ(L)) {
  const j = L.job, f = L.family;
  let work = 0;
  if (j.status === 'employed') work = j.regular ? 10 : 8;
  if (j.status === 'self') work = 14;
  if (work && ((j.hazard ?? 0) >= 2 || ['4', '5', '8'].includes(j.major))) work += 4;
  if (work && j.platform) work += 6;
  if (work && L.home.regionGroup !== 'province' && L.home.regionGroup !== 'metro') work += 3;
  if (j.status === 'military') work = 10;
  const pre = kidsAt(L, 0, 6), school = kidsAt(L, 7, 18);
  const care = (f.caringFor ? (f.caringFor === 'spouse' ? 18 : 15) * (L.flags.careShare ? 0.5 : 1) : 0)
    + (pre >= 2 ? 14 : pre * 8) + Math.min(9, school * 3) + (L.flags.youngCarer ? 12 : 0) + (L.flags.grandcare ? L.flags.grandcare : 0);
  const rir = e.INC > 0 && indep(L) ? (L.home.rent || 0) * 12 / e.INC : 0;
  const housing = L.home.tenure === 'monthly' && indep(L) ? 40 * Math.max(0, rir - 0.1) : 0;
  const debt = 20 * Math.min(e.dsr, 0.6);
  const study = L.age <= 18 ? [0, 4, 8, 12][L.edu.tutoring] + (L.age === 18 ? 4 : 0) : L.edu.stage === 'retake' ? 8 : 0;
  const retired = j.status === 'retired' ? 5 : 0, sick = L.stats.health < 40 ? 10 : 0;
  return { work, care, housing, rir, debt, study, retired, sick, T: clamp(70 - work - care - housing - debt - study + retired - sick) };
}

export function relationsParts(L) {
  const f = L.family, par = f.parents;
  const kids = Math.min(3, f.children.filter(c => c.alive).length);
  const parentsAlive = (par.father.alive ? 1 : 0) + (par.mother.alive ? 1 : 0);
  const belong = ['student', 'employed', 'self', 'military'].includes(L.job.status) || (L.age >= 3 && L.age <= 18 && L.edu.stage !== 'done') ? 3 : 0;
  const recentMoves = L.home.moves.filter(m => m.year > L.year - 3).length;
  const iso = L.aging.isolated ? 5 : 0;
  return {
    partner: f.partner ? 10 : 0, kids: 2 * kids, parents: 2 * parentsAlive, extra: REL_CAL.extra * (L.traits.extra - 50), belong,
    alone: f.livingAlone ? 8 : 0, moves: 2 * recentMoves, iso, sib: REL_CAL.sib * Math.min(3, f.siblings || 0),
    T: clamp(50 + (f.partner ? 10 : 0) + 2 * kids + 2 * parentsAlive + REL_CAL.extra * (L.traits.extra - 50) + REL_CAL.sib * Math.min(3, f.siblings || 0) + belong - (f.livingAlone ? 8 : 0) - 2 * recentMoves - iso),
  };
}

export function issueMean(L) {
  const v = Object.values(L.issues);
  return v.reduce((a, b) => a + b, 0) / v.length;
}

export function happinessT(L) {
  const s = L.stats;
  const dep = L.health.conditions.some(c => c.key === 'depression' && c.active) ? 6 : 0;
  return clamp(55 + 0.25 * (s.health - 60) + 0.2 * (s.relations - 55) + 0.15 * (s.leisure - 50) + 0.1 * (s.wealth - 50) - 0.3 * (issueMean(L) - 35) - dep - (L.aging.isolated ? 5 : 0));
}

// 5단계: 지표 표류
export function driftStats(L) {
  const s = L.stats, e = econ(L);
  // 소득 위치는 몇 해의 평균(항상소득)으로 본다: 독립 후에는 지난 위치와 지수 평균(QA-S-04: 한 해 실직·자녀 수로 계층이 출렁이지 않게)
  const prev = L.cache?.INCpos, indepNow = L.flags.indep != null && L.flags.indep < L.year;
  L.cache = { INCpos: indepNow && prev != null ? Math.round(((1 - INCOME_CAL.smooth) * prev + INCOME_CAL.smooth * e.INCpos) * 10) / 10 : e.INCpos, NWpos: e.NWpos };
  const T_ = {
    health: healthParts(L).T,
    wealth: e.T,
    relations: relationsParts(L).T,
    leisure: leisureParts(L, e).T - (L.mil.status === 'serving' ? 10 : 0),
  };
  T_.happiness = happinessT(L);
  for (const [k, t] of Object.entries(T_)) s[k] = clamp(Math.round(s[k] + K[k] * (t + LEAN_CAL.stat * lean(L, k) - s[k])));
  if (L.lean) for (const k in L.lean) { const v = Math.round(L.lean[k] * LEAN_CAL.decay * 1000) / 1000; if (Math.abs(v) < 0.01) delete L.lean[k]; else L.lean[k] = v; }
  // 지력: 성장만, 감소 없음(GDD §4.1)
  const a = L.age;
  if ((a >= 7 && a <= 18 && a % 2 === 0) || a === 20 || a === 25 || a === 30) s.intellect = Math.min(100, s.intellect + 1);
}

// 파생 상태(요청 4: 상태 의존 진행). 해마다 'pre' 단계 첫머리에 L.derived로 갱신 — 사건 when/p, 이정표 성공 오즈가 읽는다.
export function derive(L) {
  const e = econ(L), j = L.job, h = L.health, f = L.family, fl = L.flags;
  const serious = h.conditions.filter(c => c.active && ['cancer', 'heart', 'stroke', 'dementia', 'kidney', 'copd', 'liver'].includes(c.key)).length;
  const recent = (L.decisions || []).filter(d => d.year >= L.year - 3 && !d.def);
  const bold = recent.filter(d => d.risk === 'high').length, safe = recent.filter(d => d.risk === 'low').length;
  return {
    incomeBand: incQuint(L),                                                  // 1~5(형편)
    debtLoad: !L.money.debt ? 'none' : e.dsr < 0.3 ? 'ok' : e.dsr < 0.6 ? 'heavy' : 'crushing',
    jobStability: j.status === 'employed' ? (j.regular ? (j.public || j.firmSize === 'large' ? 'secure' : 'stable') : 'unstable')
      : j.status === 'self' ? 'unstable' : j.status === 'seeking' ? 'jobless' : 'none',
    healthRisk: Math.min(3, (L.stats.health < 40 ? 1 : 0) + Math.min(1, serious) + (L.age >= 75 ? 1 : 0)),   // 0~3
    learning: L.stats.intellect < 40 ? 'low' : L.stats.intellect < 65 ? 'mid' : 'high',
    boldness: !recent.length ? 'none' : bold > safe ? 'bold' : safe > bold ? 'safe' : 'mixed',   // 최근 3년 이정표 선택 성향
    poor: incQuint(L) === 1 && e.NW <= 0, alone: !!f.livingAlone, isolated: !!L.aging.isolated,
    deficitYears: L.money.deficitYears || 0,
    picks: {                                                                  // 주요 선택 기록(flags 요약)
      single: !!fl.single, noChild: !!fl.noChild, exam: fl.examUntil != null || !!fl.examTries, business: !!fl.business,
      bizPush: fl.bizPush != null, shock: fl.shock?.opt ?? null, love: fl.loveBoost != null ? 'confess' : fl.loveFocus != null ? 'focus' : null,
      tutor: fl.tutorAdj ?? 0, retake: (L.edu.retake || 0) > 0,
    },
  };
}
