// 사망 모델(GDD §6). 기저 qx(성·연령·달력연도) × 개인 배수 m → 사인 결정.
import { T, yr, ag, band10, has } from './tables.js';
import { MAX_AGE, MORT_NORM, CAUSE_NORM, AGING_CAL } from './tuning.js';
import { incQuint } from './stats.js';
import { helpFor } from './safety.js';
import { fill, text } from './text.js';
import { HORIZON_YEAR } from './constants.js';

const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));

// 스냅숏 하나에서 연령 log 선형 보간
const SNAPK = new WeakMap();
function snapQ(tab, age) {
  let ks = SNAPK.get(tab);
  if (!ks) SNAPK.set(tab, ks = Object.keys(tab).map(Number).sort((a, b) => a - b));
  if (age <= ks[0]) return tab[ks[0]];
  for (let i = 1; i < ks.length; i++) {
    if (age <= ks[i]) {
      const a0 = ks[i - 1], a1 = ks[i], t = (age - a0) / (a1 - a0);
      return Math.exp(Math.log(tab[a0]) * (1 - t) + Math.log(tab[a1]) * t);
    }
  }
  return 1;
}

// 기저 qx(GDD §6.1): 연도 사이 log 선형, 1970 이전 계수, 2025+ 개선율
export function qx(sex, age, year) {
  if (age >= MAX_AGE) return 1;
  const Q = T('QX')[sex], ys = Object.keys(Q).map(Number).sort((a, b) => a - b);
  const first = ys[0], last = ys[ys.length - 1];
  if (year <= first) return Math.min(1, snapQ(Q[first], age) * (year < first ? yr(T('QX_PRE1970_FACTOR'), year) : 1));
  if (year >= last) return Math.min(1, snapQ(Q[last], age) * Math.exp(-ag(T('MORT_IMPROVEMENT'), age) * (year - last)));
  let i = 1;
  while (ys[i] < year) i++;
  const y0 = ys[i - 1], y1 = ys[i], t = (year - y0) / (y1 - y0);
  return Math.exp(Math.log(snapQ(Q[y0], age)) * (1 - t) + Math.log(snapQ(Q[y1], age)) * t);
}

// 출생 코호트별 qx 벡터 캐시(같은 성·출생연도면 재사용)
const COHORT = new Map();
export function cohortQ(sex, birthYear) {
  const k = sex + birthYear;
  let v = COHORT.get(k);
  if (!v) {
    v = new Float64Array(MAX_AGE + 1);
    for (let a = 0; a <= MAX_AGE; a++) v[a] = qx(sex, a, birthYear + a);
    COHORT.set(k, v);
  }
  return v;
}

const COND_M = { hypertension: 1.15, diabetes: 1.4, heart: 1.8, stroke: 1.8, liver: 1.8, copd: 1.6, kidney: 1.7, dementia: 2.0 };

// 개인 배수 m(GDD §6.2), 정규화 포함
export function mult(L, age = L.age) {
  const h = L.health;
  // 아동(독립 전)은 가구 분위 격차를 약하게(0.3제곱)만: 영유아 사망의 소득 격차는 성인보다 작다(QA-S-04)
  let m = L.flags.indep != null ? T('MORT_Q')[incQuint(L)] : Math.pow(T('MORT_Q')[L.birth.quintile], 0.3);
  m *= Math.exp(-0.09 * (T('E0_BY_REGION')[L.home.region] ?? 0));
  m *= clamp(Math.exp((60 - L.stats.health) * 0.02), 0.6, 2.5);
  for (const c of h.conditions) {
    if (!c.active) continue;
    if (c.key === 'cancer') { const y = L.year - c.since; m *= y < 1 ? 3 : y <= 5 ? 2 : 1.1; }
    else m *= COND_M[c.key] ?? 1;
  }
  m *= h.smoker === 1 ? 1.6 : h.smoker === 2 ? 1.2 : 1;
  if (h.drinker) m *= 1.3;
  m *= Math.exp((50 - L.birth.healthAccess) * 0.006);
  if (age >= 50 && L.aging.isolated) m *= 1.15;
  if (L.aging.ltc) m *= L.aging.ltc <= 2 ? AGING_CAL.ltcMort * 1.3 : AGING_CAL.ltcMort;   // 장기요양 인정자 사망 위험(QA-S-08: 유병이 누적되지 않게)
  if (age >= 60 && L.family.widowed && !L.family.partner) m *= 1.1;
  m = clamp(m, 0.3, 6);
  const b = band10(age);
  const [sx, ck] = normKey(L);
  return m * (T('MORT_CAL')[L.sex]?.[b] ?? 1) * (MORT_NORM[sx]?.[ck]?.[b] ?? 1);
}

// MORT_NORM 칸: 성 × 출생 코호트(표의 키 중 출생연도 이하 최댓값 — 5년 단위, QA-S-18)
const NORM_KEYS = {};
export function normKey(L) {
  const ks = (NORM_KEYS[L.sex] ||= Object.keys(MORT_NORM[L.sex] || {}).map(Number).sort((a, b) => a - b));
  let k = ks[0];
  for (const x of ks) if (x <= L.birth.year) k = x;
  return [L.sex, k];
}

export const pDeath = (q, m) => 1 - Math.pow(1 - q, m);

// 조건부 기대여명(시뮬 아님, 결정적). GDD §6.6
export function expectedRemainingYears(L) {
  if (!L.alive) return 0;
  const v = cohortQ(L.sex, L.birth.year), m = mult(L);
  let S = 1, e = 0.5;
  for (let a = L.age; a < MAX_AGE; a++) { S *= 1 - pDeath(v[a], m); e += S; }
  return Math.min(e, Math.max(0, HORIZON_YEAR - L.year));   // 지평선: 2050년까지 남은 햇수를 넘지 않는다
}

// 건강 이력 가중(GDD §6.3 HIST). 자살은 없음.
export const causeBand = age => (age === 0 ? 0 : age < 10 ? 1 : Math.min(80, band10(age)));
export function histWeights(L) {
  const act = k => L.health.conditions.some(c => c.key === k && c.active);
  return {
    cancer: (act('cancer') ? 6 : 1) * (L.health.smoker === 1 ? 1.3 : 1),
    heart: (act('heart') ? 4 : 1) * (act('hypertension') ? 1.5 : 1),
    stroke: (act('stroke') ? 4 : 1) * (act('hypertension') ? 1.5 : 1),
    diabetes: act('diabetes') ? 3 : 1, kidney: act('diabetes') ? 2 : 1,
    alzheimer: act('dementia') ? 6 : 1,
    pneumonia: (act('dementia') ? 1.5 : 1) * (L.aging.ltc ? 1.5 : 1),
    liver: L.health.drinker ? 2 : 1,
    external: (L.job.hazard ?? 0) >= 2 ? 1.5 : 1,
  };
}

// 사인(GDD §6.3). 자살은 성·연령·연도 통계 비율만(어떤 상태로도 가중하지 않음).
// HIST 가중은 사망자 평균으로 나눠(CAUSE_NORM) 전체 사인 구성비가 CAUSE_SHARE에서 벗어나지 않게 한다.
function cause(L, ctx, age) {
  const band = causeBand(age);
  const share = T('CAUSE_SHARE')[L.sex][band], era = T('ERA_CAUSE'), H = histWeights(L), nm = CAUSE_NORM[band] || {};
  const w = {};
  for (const [c, s] of Object.entries(share)) {
    if (c === 'suicide' && age < 10) continue;
    w[c] = s * (era[c] ? yr(era[c], L.year) : 1) * (c === 'suicide' ? 1 : (H[c] ?? 1) / (nm[c] ?? 1));
  }
  return ctx.weighted(w) || 'other';
}

function die(L, ctx, age) {
  const c = cause(L, ctx, age), sensitive = c === 'suicide';
  const labels = T('CAUSE_LABELS');
  L.alive = false;
  L.death = { age, year: L.year, cause: c, causeLabel: labels[c] ?? c, sensitive };
  const vars = { name: L.name, year: L.year, age };
  let line;
  if (age < 5) {
    vars.ageText = age === 0 ? `${ctx.int(1, 11)}개월` : `${age}세`;
    line = text('sys.death.infant', vars, ctx);
  } else line = text('sys.death.line', vars, ctx);
  // 사인은 로그 문장에 쓰지 않는다(GDD §6.4). 도움 자원은 사망 기록에 함께.
  ctx.emit({ kind: 'death', id: 'death', text: line, ...(sensitive && { sensitive: 'selfharm' }), help: helpFor(sensitive ? 'selfharm' : 'death', age) });
}

// 7단계 사망 판정. 나이 a에서 다음 생일 전까지의 위험 q(a)
export function deathStep(L, ctx) {
  const a = L.age;
  if (a >= MAX_AGE || ctx.chance(pDeath(cohortQ(L.sex, L.birth.year)[a], mult(L)))) die(L, ctx, a);
  else if (L.year >= HORIZON_YEAR) observeEnd(L, ctx, a);
}

// 시간 지평선: 사망이 아니라 '관찰 종료'. death 소비 코드가 깨지지 않게 L.death에 horizon 표식으로 남긴다.
function observeEnd(L, ctx, age) {
  L.alive = false;
  L.death = { age, year: L.year, cause: 'horizon', causeLabel: null, sensitive: false, horizon: true };
  ctx.emit({ kind: 'death', id: 'death', horizon: true, text: text('sys.horizon.line', { name: L.name, year: L.year, age }, ctx) });
}

// 첫 해(0세) 위험: 0세 → 1세로 넘어가기 직전에 판정
export function infantStep(L, ctx) {
  if (ctx.chance(pDeath(cohortQ(L.sex, L.birth.year)[0], mult(L, 0)))) { die(L, ctx, 0); return true; }
  return false;
}
