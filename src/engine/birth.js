// 출생 생성(GDD §3). 추출 순서가 상관을 만든다: 연도 → 날짜 → 성별 → 시도·도시 → 분위 → 모 연령 → 부모 학력 → 고용 → 한부모·다문화 → 형제 → 주거 → 돌봄 → 저체중·장애 → 의료접근성 → 성향 → 이름.
import * as R from './rng.js';
import { T, D, yr, REGION, isCapital, regionGroup } from './tables.js';
import { REGIONS, BIRTH_YEAR_RANGE, STAT_KEYS, ISSUE_KEYS, TRAIT_KEYS, STAGES } from './constants.js';
import { SURNAMES, GIVEN_NAMES } from '../content/names.js';
import { signalValue } from './issues.js';
import { makeGrandparents } from './kin.js';
import { pickSigungu, place, quintileAdjust, bias, TRANSIT_ACCESS, placeLabel } from './sigungu.js';
import { REGION_SHARE_BY_YEAR } from '../data/region-share.js';

const clamp = (x, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, x));
const EDU = ['mid', 'high', '2yr', '4yr'];
const METRO = new Set(['seoul', 'busan', 'daegu', 'incheon', 'gwangju', 'daejeon', 'ulsan']);
const ACCESS_ERA = { 1960: -15, 1980: -8, 2000: 0, 2025: 5 };
let counter = 0, YEAR_W = null;

const isLeap = y => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
const MONTH_DAYS = y => [31, isLeap(y) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

// 부모 학력 분포(남성 기준 + 여성 규칙, GDD §3.2)
function eduDist(cohort, female) {
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
const quantile = (dist, u) => { let c = 0; for (let i = 0; i < dist.length; i++) { c += dist[i]; if (u < c) return EDU[i]; } return EDU[EDU.length - 1]; };
const eduGroup = e => (e === 'mid' ? 'mid' : e === 'high' ? 'high' : 'college');

export function newLife({ seed, forced = {} } = {}) {
  // ponytail: seed 없이 부르면 결정적 카운터 시드. UI는 crypto로 만든 seed를 넘긴다.
  seed = (seed ?? R.hashSeed('life', ++counter)) >>> 0;
  const s = R.makeRng(R.hashSeed(seed, 'birth'));
  const rand = () => R.rand(s), chance = p => rand() < p, N = (m, sd) => R.normal(s, m, sd), W = w => R.weighted(s, w);

  // 연도·날짜·성별
  YEAR_W ||= Object.fromEntries(Array.from({ length: BIRTH_YEAR_RANGE[1] - BIRTH_YEAR_RANGE[0] + 1 }, (_, i) => {
    const y = BIRTH_YEAR_RANGE[0] + i;
    return [y, yr(T('BIRTHS_BY_YEAR'), y)];
  }));
  const year = forced.year ?? +W(YEAR_W);
  const md = MONTH_DAYS(year);
  let month = forced.month, day = forced.day;
  if (month == null || day == null) {
    let doy = R.int(s, 1, isLeap(year) ? 366 : 365);
    month = 1;
    while (doy > md[month - 1]) { doy -= md[month - 1]; month++; }
    day = doy;
  }
  const ratio = yr(T('SEX_RATIO_BY_YEAR'), year);
  const sex = forced.sex ?? (chance(ratio / (100 + ratio)) ? 'M' : 'F');

  // 시도(당시 행정구역: since 이전은 parent로 합산)·도시
  const share = { ...(REGION_SHARE_BY_YEAR.values[year]?.share ?? yr(T('REGION_BIRTH_SHARE'), year)) };
  for (const r of REGIONS) if (r.since > year && share[r.key]) { share[r.parent] += share[r.key]; share[r.key] = 0; }
  const region = forced.region ?? W(share);
  // 시군구·동네·교통: 별도 난수 흐름(메인 흐름 보존). 시군구 urban 등급으로 도시/농촌 정합.
  const sg = R.makeRng(R.hashSeed(seed, 'sgg')), SW = w => R.weighted(sg, w);
  const sgg = pickSigungu(SW, region, year), pl = place(SW, sgg, year);
  const urbanP = sgg.urban >= 4 ? 1 : sgg.urban <= 2 ? 0 : METRO.has(region) ? 0.97 : yr(T('URBAN_SHARE_PROV'), year) + (region === 'gyeonggi' ? 0.1 : 0);
  const urban = forced.urban ?? chance(urbanP);
  const area = isCapital(region) ? 'capital' : urban ? 'urban' : 'rural';
  const qw = quintileAdjust(T('QUINTILE_BY_AREA')[area], region, year, sgg);
  const q = forced.quintile ?? 1 + +W(Object.fromEntries(qw.map((w, i) => [i, w])));

  // 부모
  const motherAge = Math.round(clamp(N(yr(T('MOTHER_AGE_MEAN'), year), 4.5), 17, 46));
  const fatherAge = Math.max(18, Math.round(motherAge + N(3, 2.5)));
  const um = clamp(0.5 * (q - 0.5) / 5 + 0.5 * rand(), 0, 0.9999);
  const motherEdu = quantile(eduDist(year - motherAge, true), um);
  const fatherEdu = quantile(eduDist(year - fatherAge, false), clamp(0.6 * um + 0.4 * rand(), 0, 0.9999));
  const motherEmp = chance(yr(T('MOTHER_EMPLOYED_AT_BIRTH'), year) * (0.85 + 0.075 * (q - 1)));
  const fatherEmp = chance(year === 1998 || year === 1999 ? 0.9 : 0.95);
  const jobOf = (edu, sx) => {
    const w = { ...T('OCC_BY_EDU')[eduGroup(edu)] };
    for (const k in w) w[k] *= T('OCC_SEX_RATIO')[sx][k] ?? 1;
    if (!urban && year < 1990) { const rest = Object.entries(w).filter(([k]) => k !== '6').reduce((a, [, v]) => a + v, 0); w['6'] = rest; }
    return W(w);
  };
  const singleParent = chance(yr(T('NONMARITAL_BIRTH_SHARE'), year) * 0.7 + 0.01);
  const multicultural = chance(yr(T('MULTICULTURAL_BIRTH_SHARE'), year));
  const parents = {
    fatherEdu, motherEdu, fatherJob: fatherEmp ? jobOf(fatherEdu, 'M') : null, motherJob: motherEmp ? jobOf(motherEdu, 'F') : null,
    dualIncome: fatherEmp && motherEmp && !singleParent, singleParent, multicultural, motherAge, fatherAge,
  };

  // 형제(Poisson λ = max(.3, TFR − .6)), 출생 순위
  const lam = Math.max(0.3, yr(T('TFR_BY_YEAR'), year) - 0.6);
  let siblings = 0;
  for (let p = Math.exp(-lam), c = p, u = rand(); u > c && siblings < 8; siblings++) { p *= lam / (siblings + 1); c += p; }
  let order = 1;
  for (let i = 0; i < siblings; i++) if (chance(0.5)) order++;
  const sibAges = Array.from({ length: siblings - (order - 1) }, () => R.int(s, 1, 6)).sort((a, b) => a - b);

  // 주거·돌봄
  const ta = D.TENURE_AT_BIRTH.adjust, tw = { ...yr(T('TENURE_AT_BIRTH'), year) };
  tw.own *= (ta.own.base + ta.own.perQ * (q - 1)) * (urban ? 1 : ta.ruralOwn);
  tw.monthly *= ta.monthly.base + ta.monthly.perQ * (q - 1);
  tw.public *= q <= ta.public.maxQ ? ta.public.mult : 0;
  const tb = sgg.tenureBias ?? {};
  for (const k of ['own', 'jeonse', 'monthly']) if (tw[k] != null) tw[k] *= Math.min(1.3, Math.max(0.75, tb[k] ?? 1));
  const tenure = forced.tenure ?? W(tw);
  const care = forced.care ?? (chance(yr(T('DAYCARE_SHARE'), year)) ? 'daycare' : chance(parents.dualIncome ? 0.55 : 0.15) ? 'grandparent' : 'parent');
  const lowBirthWeight = chance(yr(T('LBW_SHARE'), year));
  const cd = T('CHILD_DISABILITY');
  const disability = forced.disability !== undefined ? forced.disability : chance(cd.rate) ? W(cd.types) : null;
  const healthAccess = Math.round(clamp(50 + 8 * (q - 3) + (urban ? 6 : -8) + (isCapital(region) ? 4 : 0) + yr(ACCESS_ERA, year) + 1.5 * (sgg.urban - 3) + TRANSIT_ACCESS[pl.transit] + N(0, 6), 5, 95));
  const traits = Object.fromEntries(TRAIT_KEYS.map(k => [k, Math.round(clamp(N(50, 15), 5, 95))]));

  // 이름(앞쪽 가중)
  const surname = W(SURNAMES.values);
  const dk = String(Math.min(2020, Math.max(1960, Math.floor(year / 10) * 10)));
  const names = GIVEN_NAMES.values[dk][sex];
  const given = names[+W(Object.fromEntries(names.map((_, i) => [i, 1 / (i + 2)])))];

  // 초기 지표(GDD §3.4)
  const stats = {
    health: Math.round(clamp(72 + 0.1 * (healthAccess - 50) - 4 * lowBirthWeight + N(0, 5))),
    intellect: Math.round(clamp(N(50, 12))),
    happiness: Math.round(clamp(60 + N(0, 8))),
    wealth: Math.round(clamp([15, 30, 45, 60, 78][q - 1] + (tenure === 'own' ? 5 : tenure === 'monthly' ? -5 : 0) + N(0, 4))),
    relations: Math.round(clamp(55 + N(0, 8) + (care === 'grandparent' ? 3 : 0) + Math.min(siblings, 3))),
    leisure: Math.round(clamp(55 + N(0, 6) + 3 * (q - 3) - (parents.dualIncome && care !== 'grandparent' ? 4 : 0) + (pl.transit === 'station' ? 2 : pl.transit === 'remote' ? -2 : 0) - (tenure === 'monthly' ? 3 : 0))),
  };
  const ib = T('INCOME_BOUNDS'), lo = [1200, ib.P20, ib.P40, ib.P60, ib.P80][q - 1];
  const hi = q < 5 ? [ib.P20, ib.P40, ib.P60, ib.P80][q - 1] : ib.P80 * (1 + 1.5 * rand());
  const household = {
    income: Math.round((lo + (hi - lo) * rand()) * yr(T('ERA_INCOME_INDEX'), year)),
    netWorth: Math.round(T('NW_BY_INCOME_Q')[q] * 0.53 * Math.exp(N(0, 0.6) - 0.18) * yr(T('ERA_ASSET_INDEX'), year)),
  };
  const minute = R.int(R.makeRng(R.hashSeed(seed, 'minute')), 0, 1439);

  const L = {
    v: 1, seed, rng: { a: 0 }, rngC: { a: 0 },
    name: surname + given, surname, given, sex,
    birth: {
      year, month, day, minute, region, sigungu: pl.sigungu, dong: pl.dong, transit: pl.transit, urban, quintile: q, parents, tenure, care, lowBirthWeight, disability, healthAccess,
      order, siblings,
    },
    age: 0, year, alive: true, death: null,
    stats, traits,
    issues: Object.fromEntries(ISSUE_KEYS.map(k => [k, 10])),
    reasons: {},
    edu: { stage: 'home', score: 50, tutoring: 0, highType: null, college: null, level: 'mid', loan: 0, retake: 0, leave: 0, gradYear: null, dropout: false, left: 0 },
    job: { status: 'none', code: null, title: null, regular: false, firmSize: null, wage: 0, years: 0, history: [], searchYears: 0, hours: 0, platform: false, mainTenure: 0 },
    home: { tenure, region, sigungu: pl.sigungu, dong: pl.dong, transit: pl.transit, regionGroup: regionGroup(region), parents: true, moves: [], rentBurden: 0, owned: false, value: 0, deposit: 0, rent: 0, contractEnd: null },
    money: { income: 0, assets: 0, debt: 0, pension: 0, pensionYears: 0, severance: 0, deficitYears: 0, debtService: 0, oop: 0, livingRatio: 0, loans: { credit: 0, mortgage: 0, jeonse: 0, student: 0, business: 0 } },
    household,
    family: {
      partner: null, married: false, marriedYear: null, divorced: false, widowed: false, dating: false, children: [],
      parents: { father: { alive: true, age: fatherAge, ...(singleParent && { away: true }) }, mother: { alive: true, age: motherAge } },
      siblings, caringFor: null, livingAlone: false, grandchildren: 0, grandparents: 2 + R.int(s, 0, 2),
    },
    health: { conditions: [], disability, care: 'none', smoker: 0, drinker: false, dx: {} },
    mil: { status: 'none', start: null, end: null, plan: null, months: 0 },
    aging: { pensionStart: null, pensionMonthly: 0, basic: 0, ltc: 0, isolated: false },
    hist: {}, stageChoices: Object.fromEntries(STAGES.map(st => [st.id, { sys: 0, chance: 0 }])),
    flags: { sibAges }, cooldown: {}, fired: {}, tagYear: {}, tally: {}, cache: {},
    log: [], choices: [], pending: null, lastChoiceAge: null,
    yr: { phase: 0, asked: false, start: 0, mark: 0, oop: 0, compare: null },
  };
  // 이슈 초기값: 전 축 10, 지역·생활비는 신호의 50%(GDD §3.4)
  L.family.gp = makeGrandparents(seed, L.family.grandparents);      // 조부모 개체(친가/외가·성별). 숫자 grandparents는 생존 수로 유지
  L.issues.region = Math.round(signalValue(L, 'region') * 0.5);
  L.issues.living = Math.round(signalValue(L, 'living') * 0.5);
  L.hist[0] = { s: STAT_KEYS.map(k => L.stats[k]), i: ISSUE_KEYS.map(k => L.issues[k]) };
  L.log.push({ year, age: 0, kind: 'birth', id: 'birth', text: `${year}년 ${month}월 ${day}일, ${placeLabel(region, pl.sigungu, pl.dong)}에서 태어났다.` });
  L.yr.mark = 1;
  return L;
}
