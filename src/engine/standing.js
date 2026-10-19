// 통계 속 내 위치(R19): 이 사람의 순자산·소득·주거·수명·사인·학력이 같은 시대 대한민국 분포에서 어디쯤인지.
// 각 항목 { pct: 상위 N%(0~100, 작을수록 상위), label, basis, est }. 라벨에는 퍼센트·순위만 쓰고 금액·'분위'는 쓰지 않는다(결산 화면 규칙).
// 엔진 금액 단위 = 2025 실질 만원. 과거 분포는 2025 분포 × 시대 지수(ERA_ASSET_INDEX·ERA_INCOME_INDEX)로 그해 수준에 맞춘다.
import { T, D, yr, ag } from './tables.js';
import { indep } from './act.js';
import { otherAssets } from './stats.js';
import { cohortQ, causeBand } from './death.js';
import { MAX_AGE } from './tuning.js';
import { regionalPrice } from '../data/housing-regional.js';
import { sigunguShare } from '../data/region-share.js';
import { REGIONS_A } from '../data/regions-a.js';
import { REGIONS_B } from '../data/regions-b.js';
import { REGIONS_C } from '../data/regions-c.js';
import { WAGE_JOB_CDF, NET_WORTH_NONPOS, HOUSING_SPREAD, SIDO_HH_SHARE, HOUSING_ANCHOR } from '../data/standing.js';

const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
// 표준정규 누적분포(Abramowitz–Stegun 7.1.26, 오차 < 1.5e-7)
export function Phi(z) {
  const t = 1 / (1 + 0.3275911 * Math.abs(z) / Math.SQRT2);
  const e = 1 - t * (0.254829592 + t * (-0.284496736 + t * (1.421413741 + t * (-1.453152027 + t * 1.061405429)))) * Math.exp(-z * z / 2);
  return z >= 0 ? (1 + e) / 2 : (1 - e) / 2;
}
const SEX = { M: '남성', F: '여성' };
const causeBandLabel = a => { const b = causeBand(a); return b === 0 ? '0세' : b === 1 ? '1~9세' : b >= 80 ? '80세 이상' : `${b}대`; };
const ageBand = a => (a < 30 ? '29세 이하' : a >= 60 ? '60세 이상' : `${Math.floor(a / 10) * 10}대`);

// 상위 N% 라벨: 정수, 1% 미만 '상위 1% 이내', 99% 초과 '하위 1% 이내'
export function topLabel(pct) {
  if (pct < 1) return '상위 1% 이내';
  if (pct > 99) return '하위 1% 이내';
  return `상위 ${Math.round(pct)}%`;
}
const item = (bottom, basis, est, extra) => {
  const pct = Math.round(clamp(100 - bottom, 0, 100) * 10) / 10;
  return { pct, label: topLabel(pct), basis, est, ...extra };
};
// 분위점 [[p, v], …](v 오름차순, 양수) 사이 로그 보간
function interpLog(x, pts) {
  for (let i = 1; i < pts.length; i++) {
    const [pa, va] = pts[i - 1], [pb, vb] = pts[i];
    if (x <= vb) return pa + (pb - pa) * Math.log(x / va) / Math.log(vb / va);
  }
  return pts.at(-1)[0];
}

// 1) 순자산: 같은 해·같은 연령대 가구 분포에서 아래쪽 비중(0~100)
export function netWorthBottom(nw, headAge, year) {
  if (!Number.isFinite(nw) || nw <= 0) return null; // 비양수 구간의 세부 분포가 없어 순위를 외삽하지 않는다.
  const B = T('NET_WORTH_BOUNDS'), A = ag(T('NET_WORTH_BY_AGE'), headAge);
  const s = A.median / B.P50 * yr(T('ERA_ASSET_INDEX'), year);
  const pts = Object.entries(B).map(([k, v]) => [+k.slice(1), v * s]);
  const neg = 100 * NET_WORTH_NONPOS.values, [p0, v0] = pts[0], [pn, vn] = pts.at(-1);
  if (nw <= v0) return neg + (p0 - neg) * nw / v0;
  if (nw <= vn) return interpLog(nw, pts);
  const sigma = Math.sqrt(2 * Math.log(A.mean / A.median));       // 연령대 평균/중앙값 비 → 로그정규 σ(상위 꼬리)
  return 100 * Phi(1.2816 + Math.log(nw / vn) / sigma);
}
export function netWorthOf(L) {
  if (!indep(L)) return L.household?.netWorth ?? 0;
  const m = L.money, h = L.home;
  return m.assets + (h.deposit || 0) + (h.owned ? h.value : 0) + otherAssets(L) - m.debt;   // stats.js econ()의 NW와 같은 정의(임대 부동산·개인연금 포함)
}

// 2) 소득: 같은 해 임금 일자리 월 소득 분포(2024 분포 × 시대 임금 지수)
const WAGE = Object.entries(WAGE_JOB_CDF.values).map(([v, p]) => [p, +v]);
const TAIL = (() => { const [p1, v1] = WAGE.at(-2), [p2, v2] = WAGE.at(-1); return Math.log((100 - p1) / (100 - p2)) / Math.log(v2 / v1); })();
export function wageBottom(annual, year) {
  const s = T('CPI_MULT')[2024] * yr(T('ERA_INCOME_INDEX'), year) / yr(T('ERA_INCOME_INDEX'), 2024);
  const pts = WAGE.map(([p, v]) => [p, v * s]), x = annual / 12, [p0, v0] = pts[0], [pn, vn] = pts.at(-1);
  if (x <= 0) return 0;
  if (x <= v0) return p0 * x / v0;
  if (x <= vn) return interpLog(x, pts);
  return 100 - (100 - pn) * Math.pow(vn / x, TAIL);
}

// 3) 주거: 같은 연령대 가구의 '사는 집 가치(자가) 또는 보증금(전·월세)' 분포 — 시군구 시세 × 시도 가구 비중 × 점유형태 비율
const SGG = [...REGIONS_A, ...REGIONS_B, ...REGIONS_C];
const MIX = new Map();
function priceMix(year, kind) {
  const k = `${year}|${kind}`;
  let v = MIX.get(k);
  if (!v) {
    const sido = yr(SIDO_HH_SHARE.values, year), share = {};
    v = [];
    for (const r of SGG) {
      const p = regionalPrice(r.id, year, kind)?.real;
      if (!(p > 0)) continue;
      share[r.sido] ||= sigunguShare(r.sido, year);
      const w = (sido[r.sido] || 0) * (share[r.sido][r.id] || 0);
      if (w > 0) v.push([w, p]);
    }
    const W = v.reduce((s, [w]) => s + w, 0);
    v = v.map(([w, p]) => [w / W, p]);
    MIX.set(k, v);
  }
  return v;
}
const mixCdf = (x, mix, f = 1) => mix.reduce((s, [w, p]) => s + w * Phi(Math.log(x / (p * f)) / HOUSING_SPREAD.values), 0);
// 84㎡ 시세 → 실제 거주 주택 수준 배율(2025 앵커에 맞춤, 모든 연도 공통)
let SCALE = null;
function scale() {
  if (SCALE) return SCALE;
  const A = HOUSING_ANCHOR.values, mean = kind => priceMix(2025, kind).reduce((s, [w, p]) => s + w * p, 0) * Math.exp(HOUSING_SPREAD.values ** 2 / 2);
  let lo = 1, hi = 1e7, m = priceMix(2025, 'sale');
  for (let i = 0; i < 60; i++) { const mid = Math.sqrt(lo * hi); if (mixCdf(mid, m) < 0.5) lo = mid; else hi = mid; }
  return (SCALE = { sale: A.ownMedian / lo, jeonse: A.jeonseMean / mean('jeonse'), rentDeposit: A.monthlyMean / mean('rentDeposit') });
}
export function housingBottom(value, headAge, year) {
  const t = ag(T('TENURE_SHARE_BY_AGE'), headAge), f = scale();
  const other = t.other ?? 0;
  if (!(value > 0)) return 100 * other / 2;
  return 100 * (other + t.own * mixCdf(value, priceMix(year, 'sale'), f.sale) + t.jeonse * mixCdf(value, priceMix(year, 'jeonse'), f.jeonse) + t.monthly * mixCdf(value, priceMix(year, 'rentDeposit'), f.rentDeposit));
}

// 4) 수명: 같은 성·출생연도 코호트 생명표(사망 연령 분포)
export function lifeTable(sex, birthYear) {
  const q = cohortQ(sex, birthYear), S = [1];
  for (let a = 0; a < MAX_AGE; a++) S.push(S[a] * (1 - q[a]));
  S.push(0);
  return { S, e0: S.slice(1).reduce((s, x) => s + x, 0) + 0.5 };
}

// 5) 사인: 같은 성·연령대·연도 사인 구성비(death.js cause()의 통계 비율, 개인 건강 이력 가중 제외)
export function causeShares(sex, age, year) {
  const band = causeBand(age), share = T('CAUSE_SHARE')[sex][band], era = T('ERA_CAUSE');
  const EA = T('ERA_CAUSE_AGE'), ca = ag(EA[sex], band) || {}, w = {};
  for (const [c, s] of Object.entries(share)) {
    if (c === 'suicide' && age < 10) continue;
    const cs = ca[EA.groups[c] ?? c];
    w[c] = s * (era[c] ? yr(era[c], year) : 1) * (cs ? yr(cs, year) : 1);
  }
  const tot = Object.values(w).reduce((a, b) => a + b, 0);
  for (const c in w) w[c] /= tot;
  return w;
}

// 6) 학력: 같은 성·출생 코호트 최종 학력 분포 [중졸 이하, 고졸, 전문대, 4년제+] (birth.js eduDist와 같은 규칙)
export function eduDist(cohort, female) {
  const t = D.PARENT_EDU_BY_COHORT, d = [...yr(t.values, cohort)];
  if (female) {
    const r = t.femaleRule;
    if (cohort >= r.reverseFrom) { d[3] += r.reversePlus; d[1] = Math.max(0, d[1] - r.reversePlus); }
    else {
      const k = cohort <= r.untilCohort ? 1 : Math.max(0, (r.zeroAt - cohort) / (r.zeroAt - r.untilCohort));
      const m4 = d[3] * r.shift4yr * k, m2 = d[2] * r.shift2yr * k;
      d[3] -= m4; d[2] -= m2; d[1] += m4 + m2;
    }
  }
  const s = d.reduce((a, b) => a + b, 0);
  return d.map(x => x / s);
}
const EDU_I = { mid: 0, high: 1, '2yr': 2, '4yr': 3, grad: 3 };
const pctText = p => (p < 1 ? '1% 미만' : `${Math.round(p)}%`);

export function standing(L, { at = 'now' } = {}) {
  const end = at === 'end' || !L.alive, notes = [];
  const year = end && L.death ? L.death.year : L.year, age = end && L.death ? L.death.age : L.age;
  const own = indep(L), head = own ? age : (L.birth.parents.motherAge || 30) + age;
  const out = { notes };

  // 순자산
  const nw = netWorthOf(L);
  if (age >= 19 && nw > 0) out.asset = item(netWorthBottom(nw, head, year),
    `${own ? '' : '부모 가구 기준 · '}가구주 ${ageBand(head)} 가구 순자산 분포(2025.3 가계금융복지조사 경계점·연령대 중앙값, ${year}년 수준 환산)`,
    year < 2012 || year > 2025);
  if (age >= 19 && nw > 0 && year < 2012) notes.push('2012년 이전 순자산 분포는 조사 이전이라 2025 분포 모양에 시대 자산 지수를 곱해 추정했다.');

  // 소득(본인 근로·사업소득)
  const j = L.job;
  if ((j.status === 'employed' || j.status === 'self') && j.wage > 0) {
    const self = j.status === 'self';
    out.income = item(wageBottom(j.wage, year),
      self ? '사업소득 — 같은 해 임금 일자리 월 소득 분포로 근사(2024.12 임금근로일자리 소득, 시대 임금 지수 환산)'
        : '같은 해 임금 일자리 월 소득 분포(2024.12 임금근로일자리 소득, 시대 임금 지수 환산)',
      self || year < 2016 || year > 2025, { self });
    if (self) notes.push('자영업 사업소득은 공개된 개인 단위 분포가 없어 임금 일자리 분포로 견줬다.');
  }

  // 주거(독립한 가구만)
  if (own) {
    const h = L.home, v = h.owned ? h.value : h.deposit || 0, t = ag(T('TENURE_SHARE_BY_AGE'), head);
    out.housing = item(housingBottom(v, head, year),
      `가구주 ${ageBand(head)} 가구의 사는 집 가치·보증금 분포(시군구 시세 × 점유형태 비율, 추정)`, true,
      { tenure: h.owned ? 'own' : h.tenure });
    notes.push(`같은 연령대 가구 가운데 자기 집에 사는 비율은 약 ${pctText(100 * t.own)}다.`);
  }

  if (end && L.death) {
    const d = L.death, lt = lifeTable(L.sex, L.birth.year), a = Math.min(d.age, MAX_AGE), cohort = `${L.birth.year}년생 ${SEX[L.sex]}`;
    // 수명: 나보다 오래 산 사람 비율(같은 나이 사망은 절반). 관찰 종료면 '이 나이까지 산 비율'.
    if (d.horizon) {
      out.age = item(100 - 100 * lt.S[a], `${cohort} 생명표 — 관찰 종료 나이까지 생존한 비율`, true, { e0: Math.round(lt.e0) });
      out.age.label = `${cohort} 중 ${pctText(100 * lt.S[a])}만 이 나이까지 산다`;
    } else {
      out.age = item(100 - 100 * (lt.S[a + 1] + (lt.S[a] - lt.S[a + 1]) / 2), `${cohort} 생명표(사망 연령 분포, 2025 이후는 사망률 개선 추계)`, true, { e0: Math.round(lt.e0) });
      const diff = d.age - Math.round(lt.e0);
      notes.push(`같은 해 태어난 ${SEX[L.sex]}의 기대수명은 약 ${Math.round(lt.e0)}세 — ${diff === 0 ? '비슷한' : diff > 0 ? `${diff}년 긴` : `${-diff}년 짧은`} 삶이었다.`);
    }
    // 사인: 자해(sensitive)·관찰 종료는 항목을 두지 않는다
    if (!d.sensitive && !d.horizon && d.cause) {
      const w = causeShares(L.sex, d.age, d.year), rank = Object.keys(w).sort((x, y) => w[y] - w[x]).indexOf(d.cause) + 1, sh = 100 * (w[d.cause] || 0);
      if (rank > 0) out.cause = { pct: Math.round(sh * 10) / 10, rank, label: `같은 성별·나이대 사망 원인 ${rank}위 · 그 나이대 사망의 ${pctText(sh)}`, basis: `${d.year}년 ${SEX[L.sex]} ${causeBandLabel(d.age)} 사인 구성비(사망원인통계 2025 × 시대 보정)`, est: true };
    }
  }

  // 학력(학업을 마친 뒤)
  if (L.edu?.stage === 'done' && L.edu.level in EDU_I) {
    const dist = eduDist(L.birth.year, L.sex === 'F'), i = EDU_I[L.edu.level];
    const above = dist.slice(i + 1).reduce((s, x) => s + x, 0);
    out.edu = item(100 - 100 * (above + dist[i] / 2), `${L.birth.year}년생 ${SEX[L.sex]} 최종 학력 분포(진학률 기반 코호트 추정)`, true);
    notes.push(`같은 해 태어난 ${SEX[L.sex]} 가운데 4년제 대학 이상은 약 ${pctText(100 * dist[3])}다.`);
  }
  return out;
}
