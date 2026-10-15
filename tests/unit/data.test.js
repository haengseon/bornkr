// 데이터 모듈(src/data) 검증: 메타 형식·출처·비율 범위·분포 합·연도 키·qx 단조성·e0 정합.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as D from '../../src/data/index.js';
import { REGIONS } from '../../src/engine/constants.js';
import { byYear, byAge, valuesOf } from '../../src/engine/lookup.js';

const { SOURCES, ...TABLES } = D;
const NAMES = Object.keys(TABLES);
const KINDS = ['measured', 'projected', 'estimated'];
const SRC_KINDS = ['official', 'secondary', 'game'];

// 경로(점 구분, '*' = 모든 키)에 해당하는 객체들을 모은다.
const expand = (root, path) => {
  let cur = [root];
  for (const p of path.split('.').filter(Boolean)) cur = cur.flatMap(o => (o && typeof o === 'object' ? (p === '*' ? Object.values(o) : [o[p]]) : []));
  return cur.filter(o => o && typeof o === 'object');
};
const leaves = function* (o) { if (typeof o === 'number') yield o; else if (o && typeof o === 'object') for (const v of Object.values(o)) yield* leaves(v); };

test('SOURCES 항목은 { org, title, year, url, kind } 형식이고 ID는 R0x.Sy 또는 GDD.E', () => {
  for (const [id, s] of Object.entries(SOURCES)) {
    assert.ok(/^(R0[1-9]\.S\d{1,2}|R1[01]\.S\d{1,2}|GDD\.E|EXT\.H\d{2})$/.test(id), `출처 ID 형식: ${id}`);
    for (const k of ['org', 'title', 'url']) assert.ok(typeof s[k] === 'string' && s[k].length > 0, `${id}.${k}`);
    assert.ok(Number.isInteger(s.year), `${id}.year`);
    assert.ok(SRC_KINDS.includes(s.kind), `${id}.kind`);
  }
  // GDD §14.1 지정 ID
  for (const id of ['R01.S1', 'R01.S2', 'R01.S3', 'R01.S4', 'R04.S1', 'R04.S2', 'R04.S3', 'R04.S4', 'R04.S5', 'R04.S6', 'R04.S7', 'R04.S8', 'R09.S1', 'R09.S2', 'R09.S3', 'R09.S4', 'R09.S5', 'GDD.E']) assert.ok(SOURCES[id], `지정 출처 ${id}`);
});

test('모든 export는 { src, year, kind, note?, values } 메타를 갖추고 src는 SOURCES에 존재', () => {
  assert.ok(NAMES.length >= 120, `export 수 ${NAMES.length}`);
  for (const n of NAMES) {
    const t = TABLES[n];
    assert.ok(t && typeof t === 'object', `${n} 객체`);
    assert.ok(SOURCES[t.src], `${n}.src=${t.src} 가 SOURCES에 없음`);
    assert.ok(Number.isInteger(t.year) && t.year >= 1900 && t.year <= 2100, `${n}.year`);
    assert.ok(KINDS.includes(t.kind), `${n}.kind=${t.kind}`);
    assert.ok(t.values !== undefined && t.values !== null, `${n}.values`);
    if (t.kind !== 'measured') assert.ok(typeof t.note === 'string' && t.note.length >= 15, `${n}: ${t.kind} 표는 note 필수`);
    if (t.note !== undefined) assert.equal(typeof t.note, 'string', `${n}.note`);
    assert.deepEqual(valuesOf(t), t.values);
    assert.doesNotThrow(() => JSON.stringify(t), `${n} JSON 직렬화`);
  }
});

test('GDD §14.2의 export가 모두 존재한다 (JOBS 제외)', () => {
  const required = `BIRTHS_BY_YEAR TFR_BY_YEAR SEX_RATIO_BY_YEAR REGION_BIRTH_SHARE URBAN_SHARE_PROV PARENT_EDU_BY_COHORT MOTHER_AGE_MEAN MOTHER_EMPLOYED_AT_BIRTH NONMARITAL_BIRTH_SHARE MULTICULTURAL_BIRTH_SHARE LBW_SHARE CHILD_DISABILITY DAYCARE_SHARE QUINTILE_BY_AREA TENURE_AT_BIRTH
QX QX_PRE1970_FACTOR MORT_IMPROVEMENT E0_TARGET MORT_Q E0_BY_REGION MORT_CAL CAUSE_SHARE ERA_CAUSE SUICIDE_RATE CAUSE_LABELS
SELF_RATED_HEALTH CHRONIC_INCIDENCE CANCER_INCIDENCE CANCER_SURVIVAL_5Y DEMENTIA_INCIDENCE DEPRESSION_INCIDENCE SMOKE_COHORT HIGH_RISK_DRINK DX_COST LTC_INC
TUTOR_PART TUTOR_ERA TUTOR_SPEND_DIST HIGH_TYPE_SHARE COLLEGE_ENTRY_RATE COLLEGE_ENTRY_BY_SEX COLLEGE_BY_HIGH_TYPE FOURYEAR_SHARE CAPITAL_COLLEGE_SHARE MAJOR_SHARE TUITION STUDENT_LOAN RETAKE_SHARE DROPOUT_HIGH SCHOOL_VIOLENCE GRAD_SCHOOL_RATE LEAVE_RATE MIL_MONTHS MIL_EXEMPT
EMPLOYMENT_RATE YOUTH_UNEMP FIRST_JOB_FIND NONREG_SHARE NONREG_WAGE_RATIO FIRM GENDER_WAGE_RATIO AGE_CURVE BAND_BASE ERA_INCOME_INDEX OCC_BY_EDU OCC_SEX_RATIO OCC_AGE_RATIO OCC_ERA MAJOR_AFFINITY EXIT_HAZARD EXIT_REASON MANDATORY_AGE SENIOR_EMPLOYMENT FEMALE_QUIT_MARRY FEMALE_QUIT_BIRTH PARENTAL_LEAVE SELF_CLOSE ERA_SHOCKS
TENURE_SHARE_BY_AGE OWN_TRANSITION RESIDENCE_YEARS RENEWAL HOME_PRICE HOUSE_YOY_REAL JEONSE_RATIO RENT_BASE RIR PIR LTV BASE_RATE JEONSE_FRAUD
NET_WORTH_BOUNDS NET_WORTH_BY_AGE INCOME_BOUNDS NW_BY_INCOME_Q ERA_ASSET_INDEX CPI_INFLATION CPI_MULT MPC CHILD_COST
MARRIAGE_RATE NEVER_MARRIED FIRST_MARRIAGE_AGE SPOUSE_AGE_GAP MARITAL_FERTILITY DIVORCE_MARRIED DUR_SHAPE CHILDLESS_COHORT SUPPORT_P
PENSION_START_AGE PENSION_BY_YEARS PENSION_CONTRIB_P BASIC_PENSION LONELY LONELY_MOD ELDER_EMPLOY_65 SENIOR_JOB
CLASS_MOBILITY CONFLICT_INDEX REGION_EXTINCTION CAPITAL_POP_SHARE HEAT_DAYS ENERGY_CPI`.split(/\s+/);
  assert.deepEqual(required.filter(n => !(n in TABLES)), []);
  assert.ok(!('JOBS' in D), 'jobs.js는 index에 포함하지 않는다');
});

// 값이 0~1 비율이어야 하는 export (연도·연령 시계열의 모든 숫자 잎)
const RATIO = `REGION_BIRTH_SHARE URBAN_SHARE_PROV PARENT_EDU_BY_COHORT MOTHER_EMPLOYED_AT_BIRTH NONMARITAL_BIRTH_SHARE MULTICULTURAL_BIRTH_SHARE LBW_SHARE CHILD_DISABILITY DAYCARE_SHARE QUINTILE_BY_AREA TENURE_AT_BIRTH
QX MORT_IMPROVEMENT CAUSE_SHARE CHRONIC_INCIDENCE CANCER_INCIDENCE CANCER_SURVIVAL_5Y DEMENTIA_INCIDENCE DEPRESSION_INCIDENCE SMOKE_COHORT HIGH_RISK_DRINK LTC_INC SELF_RATED_HEALTH
TUTOR_PART TUTOR_SPEND_DIST HIGH_TYPE_SHARE COLLEGE_ENTRY_RATE COLLEGE_ENTRY_BY_SEX FOURYEAR_SHARE CAPITAL_COLLEGE_SHARE MAJOR_SHARE STUDENT_LOAN RETAKE_SHARE DROPOUT_HIGH SCHOOL_VIOLENCE GRAD_SCHOOL_RATE LEAVE_RATE MIL_EXEMPT
EMPLOYMENT_RATE FIRST_JOB_FIND NONREG_SHARE NONREG_WAGE_RATIO GENDER_WAGE_RATIO OCC_BY_EDU EXIT_HAZARD EXIT_REASON SENIOR_EMPLOYMENT SELF_CLOSE FEMALE_QUIT_MARRY FEMALE_QUIT_BIRTH PARENTAL_LEAVE
TENURE_SHARE_BY_AGE OWN_TRANSITION RENEWAL JEONSE_RATIO RIR LTV BASE_RATE JEONSE_FRAUD
MARRIAGE_RATE NEVER_MARRIED SPOUSE_AGE_GAP MARITAL_FERTILITY DIVORCE_MARRIED CHILDLESS_COHORT SUPPORT_P PENSION_CONTRIB_P LONELY ELDER_EMPLOY_65 CLASS_MOBILITY CONFLICT_INDEX CAPITAL_POP_SHARE`.split(/\s+/);
// 증감률은 음수 허용(−1~1)
const SIGNED = ['HOUSE_YOY_REAL', 'CPI_INFLATION', 'ENERGY_CPI'];

test('비율 export의 모든 값이 0~1 이다 (증감률은 −1~1)', () => {
  for (const n of RATIO) {
    assert.equal(TABLES[n].unit, undefined, `${n}: unit이 있으면 비율 목록에서 빼야 함`);
    for (const v of leaves(TABLES[n].values)) assert.ok(v >= 0 && v <= 1, `${n} 값 ${v}`);
  }
  for (const n of SIGNED) for (const v of leaves(TABLES[n].values)) assert.ok(v >= -1 && v <= 1, `${n} 값 ${v}`);
  // 보조 필드(note 외)도 확인
  for (const v of leaves(D.EXIT_REASON.all)) assert.ok(v >= 0 && v <= 1);
  for (const v of leaves(D.TUTOR_PART.bands)) assert.ok(v >= 0 && v <= 1);
  for (const v of leaves(D.TUTOR_SPEND_DIST.byQuintile)) assert.ok(v >= 0 && v <= 1);
});

test('단위가 다른 export는 unit을 밝힌다', () => {
  for (const n of ['YOUTH_UNEMP', 'PIR', 'REGION_EXTINCTION', 'HEAT_DAYS']) assert.ok(TABLES[n].unit, `${n}.unit`);
  for (const v of leaves(D.YOUTH_UNEMP.values)) assert.ok(v > 0 && v < 30);
});

// 분포(합≈1): [export, 경로, 허용오차]
const DISTS = [
  ['REGION_BIRTH_SHARE', 'values.*'], ['TENURE_AT_BIRTH', 'values.*'], ['TENURE_SHARE_BY_AGE', 'values.*'], ['HIGH_TYPE_SHARE', 'values.*'],
  ['TUTOR_SPEND_DIST', 'values.*'], ['OCC_BY_EDU', 'values.*'], ['SPOUSE_AGE_GAP', 'values'], ['EXIT_REASON', 'values'], ['EXIT_REASON', 'all'],
  ['CAUSE_SHARE', 'values.*.*'], ['CHILD_DISABILITY', 'values.types'],
  // GDD 원문 합계가 .95인 가중치 분포(엔진이 정규화)
  ['MAJOR_SHARE', 'values', 0.06],
];
test('분포 합 ≈ 1 (±0.02)', () => {
  for (const [n, path, tol = 0.02] of DISTS) {
    for (const o of expand(TABLES[n], path)) {
      const sum = [...leaves(o)].reduce((a, b) => a + b, 0);
      assert.ok(Math.abs(sum - 1) <= tol, `${n} ${path} 합 ${sum.toFixed(3)}`);
    }
  }
  for (const arr of Object.values(D.PARENT_EDU_BY_COHORT.values)) assert.ok(Math.abs(arr.reduce((a, b) => a + b) - 1) <= 0.02, `PARENT_EDU ${arr}`);
  for (const arr of Object.values(D.QUINTILE_BY_AREA.values)) assert.ok(Math.abs(arr.reduce((a, b) => a + b) - 1) <= 0.02, 'QUINTILE_BY_AREA');
  for (const arr of Object.values(D.TUTOR_SPEND_DIST.byQuintile)) assert.ok(Math.abs(arr.reduce((a, b) => a + b) - 1) <= 0.02, 'byQuintile');
  // 전국 주변분포: 지역별 출생 분위 가중 평균이 약 0.2
  const share = { capital: 0.55, urban: 0.25, rural: 0.2 };
  for (let q = 0; q < 5; q++) { const m = Object.entries(share).reduce((s, [a, w]) => s + w * D.QUINTILE_BY_AREA.values[a][q], 0); assert.ok(Math.abs(m - 0.2) < 0.02, `분위 ${q + 1} 주변 ${m.toFixed(3)}`); }
});

// 연도 키가 숫자 문자열이어야 하는 위치
const YEARS = [
  ['BIRTHS_BY_YEAR', 'values'], ['TFR_BY_YEAR', 'values'], ['SEX_RATIO_BY_YEAR', 'values'], ['REGION_BIRTH_SHARE', 'values'], ['URBAN_SHARE_PROV', 'values'], ['PARENT_EDU_BY_COHORT', 'values'],
  ['MOTHER_AGE_MEAN', 'values'], ['MOTHER_EMPLOYED_AT_BIRTH', 'values'], ['NONMARITAL_BIRTH_SHARE', 'values'], ['MULTICULTURAL_BIRTH_SHARE', 'values'], ['LBW_SHARE', 'values'], ['DAYCARE_SHARE', 'values'], ['TENURE_AT_BIRTH', 'values'],
  ['QX', 'values.*'], ['QX_PRE1970_FACTOR', 'values'], ['E0_TARGET', 'values.*'], ['E0_TARGET', 'projected.*.*'], ['ERA_CAUSE', 'values.*'], ['SUICIDE_RATE', 'values.byYear.*'],
  ['TUTOR_ERA', 'values'], ['HIGH_TYPE_SHARE', 'values'], ['COLLEGE_ENTRY_RATE', 'values'], ['COLLEGE_ENTRY_BY_SEX', 'values.*'], ['FOURYEAR_SHARE', 'values.byYear'], ['TUITION', 'values.*'], ['RETAKE_SHARE', 'values'], ['DROPOUT_HIGH', 'values'], ['SCHOOL_VIOLENCE', 'values.*'], ['MIL_MONTHS', 'values'], ['MIL_EXEMPT', 'values'],
  ['EMPLOYMENT_RATE', 'values.*.*'], ['YOUTH_UNEMP', 'values'], ['NONREG_SHARE', 'values.*'], ['NONREG_WAGE_RATIO', 'values'], ['GENDER_WAGE_RATIO', 'values'], ['ERA_INCOME_INDEX', 'values'], ['MANDATORY_AGE', 'values'], ['FEMALE_QUIT_MARRY', 'values'], ['FEMALE_QUIT_BIRTH', 'values'], ['PARENTAL_LEAVE', 'values.*'], ['ERA_SHOCKS', 'values'],
  ['RENEWAL', 'values'], ['HOME_PRICE', 'values.*'], ['HOUSE_YOY_REAL', 'values.*'], ['JEONSE_RATIO', 'values.*'], ['LTV', 'values.*'], ['BASE_RATE', 'values'], ['JEONSE_FRAUD', 'values'],
  ['ERA_ASSET_INDEX', 'values'], ['CPI_INFLATION', 'values'], ['CPI_MULT', 'values'],
  ['MARRIAGE_RATE', 'values.*.*'], ['NEVER_MARRIED', 'values.*.*'], ['FIRST_MARRIAGE_AGE', 'values.*'], ['MARITAL_FERTILITY', 'values.*'], ['DIVORCE_MARRIED', 'values'], ['CHILDLESS_COHORT', 'values'], ['SUPPORT_P', 'values'],
  ['PENSION_START_AGE', 'values'], ['BASIC_PENSION', 'values'], ['ELDER_EMPLOY_65', 'values'], ['SENIOR_JOB', 'values.slots'],
  ['CLASS_MOBILITY', 'values.*'], ['CONFLICT_INDEX', 'values.*'], ['REGION_EXTINCTION', 'values.national'], ['CAPITAL_POP_SHARE', 'values'], ['HEAT_DAYS', 'values.*'], ['ENERGY_CPI', 'values.*'],
];
// 연령 구간 시작 나이 키 (숫자 문자열, 0~110)
const AGES = [
  ['MORT_IMPROVEMENT', 'values'], ['QX', 'values.*.*'], ['SUICIDE_RATE', 'values.byAge.*'], ['CAUSE_SHARE', 'values.*'], ['SELF_RATED_HEALTH', 'values'], ['CHRONIC_INCIDENCE', 'values.*.*'], ['CANCER_INCIDENCE', 'values.*'], ['DEMENTIA_INCIDENCE', 'values'],
  ['LTC_INC', 'values'], ['CHILD_COST', 'values'], ['AGE_CURVE', 'values.*'], ['EXIT_HAZARD', 'values.*'], ['SENIOR_EMPLOYMENT', 'values'], ['OWN_TRANSITION', 'values'], ['TENURE_SHARE_BY_AGE', 'values'], ['NET_WORTH_BY_AGE', 'values'],
  ['DUR_SHAPE', 'values'], ['PENSION_BY_YEARS', 'values'], ['LONELY', 'values'], ['OCC_AGE_RATIO', 'values'], ['MORT_CAL', 'values.*'],
];
const numeric = k => /^\d{1,4}$/.test(k);
test('연도 시계열 키는 숫자 문자열(연도)이고 연령표 키는 숫자 문자열(시작 나이)이다', () => {
  for (const [n, path] of YEARS) for (const o of expand(TABLES[n], path)) { const ks = Object.keys(o); assert.ok(ks.length >= 1, `${n} ${path} 비어 있음`); for (const k of ks) assert.ok(numeric(k) && +k >= 1900 && +k <= 2200, `${n} ${path} 연도 키 ${k}`); }
  for (const [n, path] of AGES) for (const o of expand(TABLES[n], path)) for (const k of Object.keys(o)) assert.ok(numeric(k) && +k <= 110, `${n} ${path} 연령 키 ${k}`);
});

test('시계열 값 정렬·결측: 연도 시계열 값은 숫자이고 lookup으로 조회된다', () => {
  assert.ok(byYear(D.BIRTHS_BY_YEAR.values, 1999) > 600000 && byYear(D.BIRTHS_BY_YEAR.values, 2026) === 290000);
  assert.equal(byYear(D.TFR_BY_YEAR.values, 2025), 0.80);
  assert.ok(Math.abs(byYear(D.CPI_MULT.values, 1980) - 5.56) < 0.02);
  assert.equal(D.CPI_MULT.values[2025], 1);
  assert.equal(byAge(D.LTC_INC.values, 70), 0.012);
  assert.equal(byAge(D.PENSION_START_AGE.values, 1955), 61);
  assert.equal(byYear(D.PENSION_START_AGE.values, 1955), 61);
  assert.equal(byYear(D.PENSION_START_AGE.values, 1970), 65);
  assert.equal(byYear(D.MIL_MONTHS.values, 1985), 30);
  assert.equal(byYear(D.MANDATORY_AGE.values, 2020), 60);
  assert.equal(byYear(D.YOUTH_UNEMP.values, 2016), 9.8);
  assert.equal(byYear(D.ERA_INCOME_INDEX.values, 2025), 1);
  assert.ok(byYear(D.ERA_INCOME_INDEX.values, 2040) > 1.1);
});

test('지역 키가 REGIONS와 일치한다', () => {
  const keys = REGIONS.map(r => r.key).sort();
  assert.deepEqual(Object.keys(D.E0_BY_REGION.values).sort(), keys);
  assert.deepEqual(Object.keys(D.REGION_EXTINCTION.values.byRegion).sort(), keys);
  for (const o of Object.values(D.REGION_BIRTH_SHARE.values)) assert.deepEqual(Object.keys(o).sort(), keys);
  // 출생 이전 행정구역 규칙: since 이전 연도에는 신설 광역시 몫이 0 이거나 parent 합산 대상
  assert.equal(D.REGION_BIRTH_SHARE.values[1990].sejong, 0);
  assert.equal(D.REGION_BIRTH_SHARE.values[1990].ulsan, 0);
});

test('CAUSE_SHARE·ERA_CAUSE·CAUSE_LABELS 사인 키가 일치하고 자살은 10세 미만 0', () => {
  const causes = Object.keys(D.CAUSE_LABELS.values).sort();
  assert.equal(causes.length, 18);
  assert.deepEqual(Object.keys(D.ERA_CAUSE.values).sort(), causes);
  for (const sex of ['M', 'F']) for (const [age, o] of Object.entries(D.CAUSE_SHARE.values[sex])) {
    for (const c of Object.keys(o)) assert.ok(causes.includes(c), `사인 키 ${c}`);
    if (+age < 10) assert.ok(!o.suicide, '10세 미만 자살 0');
  }
  assert.deepEqual(Object.keys(D.CAUSE_SHARE.values.M), ['0', '1', '10', '20', '30', '40', '50', '60', '70', '80']);
  // 2025 전국 사인 비중 ≈ 공표(암 24.9, 폐렴 8.5): 연령대 사망자 가중 합성 검증
  const deaths = { 0: 512, 1: 252, 10: 780, 20: 2261, 30: 4406, 40: 10249, 50: 24846, 60: 48499, 70: 72596, 80: 198542 };
  const tot = Object.values(deaths).reduce((a, b) => a + b);
  const share = c => Object.entries(deaths).reduce((s, [a, d]) => s + d * 0.5 * ((D.CAUSE_SHARE.values.M[a][c] || 0) + (D.CAUSE_SHARE.values.F[a][c] || 0)), 0) / tot;
  assert.ok(Math.abs(share('cancer') - 0.249) < 0.02, `암 ${share('cancer')}`);
  assert.ok(Math.abs(share('pneumonia') - 0.085) < 0.02);
  assert.ok(Math.abs(share('suicide') - 0.039) < 0.01);
  for (const [c, v] of Object.entries(D.ERA_CAUSE.values)) for (const x of Object.values(v)) assert.ok(x >= 0 && x < 40, `ERA_CAUSE ${c} ${x}`);
});

// ── QX ──
const interpAge = (tab, age) => {
  const ks = Object.keys(tab).map(Number).sort((a, b) => a - b);
  if (age >= ks[ks.length - 1]) return tab[ks[ks.length - 1]];
  let i = 0; while (ks[i + 1] <= age) i++;
  const f = (age - ks[i]) / (ks[i + 1] - ks[i]);
  return Math.exp(Math.log(tab[ks[i]]) * (1 - f) + Math.log(tab[ks[i + 1]]) * f);
};
const qAt = (sex, age, y) => { // 엔진 GDD §6.1 보간 재현(연도 사이 log 선형, 2025+ 개선)
  const snaps = D.QX.values[sex], ys = Object.keys(snaps).map(Number).sort((a, b) => a - b);
  if (y >= 2024) { const base = interpAge(snaps[2024], age); if (y === 2024) return base; const r = byAge(D.MORT_IMPROVEMENT.values, age); return Math.min(1, base * Math.exp(-r * (y - 2024))); }
  let i = 0; while (i < ys.length - 2 && ys[i + 1] <= y) i++;
  const f = (y - ys[i]) / (ys[i + 1] - ys[i]);
  return Math.exp(Math.log(interpAge(snaps[ys[i]], age)) * (1 - f) + Math.log(interpAge(snaps[ys[i + 1]], age)) * f);
};
const e0 = (sex, y) => { let l = 1, e = 0; for (let a = 0; a < 110; a++) { const q = a >= 100 ? 1 : qAt(sex, a, y); e += l * (1 - q / 2); l *= 1 - q; } return e; };

test('QX: 성별 스냅숏이 대략 단조(10세 이상)이고 남성 ≥ 여성(20세 이상)', () => {
  for (const sex of ['M', 'F']) for (const [y, tab] of Object.entries(D.QX.values[sex])) {
    const ages = Object.keys(tab).map(Number).sort((a, b) => a - b).filter(a => a >= 10);
    for (let i = 1; i < ages.length; i++) assert.ok(tab[ages[i]] >= tab[ages[i - 1]] * 0.9, `${sex} ${y} q(${ages[i]})=${tab[ages[i]]} < q(${ages[i - 1]})`);
    assert.ok(tab[0] > tab[5] && tab[1] < tab[0], `${sex} ${y} 영아 q`);
    assert.equal(tab[100], 1, `${sex} ${y} 종단 q=1`);
    for (const q of Object.values(tab)) assert.ok(q > 0 && q <= 1);
  }
  for (const y of Object.keys(D.QX.values.M)) for (const a of [20, 30, 40, 50, 60, 70, 80]) assert.ok(D.QX.values.M[y][a] >= D.QX.values.F[y][a], `남성 q ≥ 여성 q (${y}, ${a})`);
  // 시대가 내려올수록 같은 연령 q 감소(60세, 1970→2024)
  const ys = Object.keys(D.QX.values.M).map(Number).sort((a, b) => a - b);
  for (let i = 1; i < ys.length; i++) assert.ok(D.QX.values.M[ys[i]][60] <= D.QX.values.M[ys[i - 1]][60] * 1.001, `M 60세 q ${ys[i]}`);
});

test('e0 정합: 스냅숏 연도 e0가 실측과 ±0.9년, 2030·2040·2050 경로가 저위·중위 평균과 ±0.3년', () => {
  for (const sex of ['M', 'F']) for (const y of [1970, 1980, 1990, 2000, 2010, 2020, 2024]) {
    const got = e0(sex, y), want = D.E0_TARGET.values[sex][y];
    assert.ok(Math.abs(got - want) <= 0.9, `${sex} ${y} e0 ${got.toFixed(2)} vs ${want}`);
  }
  for (const sex of ['M', 'F']) for (const y of [2030, 2040, 2050]) {
    const t = (D.E0_TARGET.projected.low[sex][y] + D.E0_TARGET.projected.mid[sex][y]) / 2, got = e0(sex, y);
    assert.ok(Math.abs(got - t) <= 0.3, `${sex} ${y} e0 ${got.toFixed(2)} vs 목표 ${t}`);
  }
  assert.equal(D.QX_PRE1970_FACTOR.values[1960], 1.35);
  assert.equal(D.QX_PRE1970_FACTOR.values[1969], 1.04);
});

test('E0_TARGET: 전망 키는 연도, 남<여, 실측 시계열 증가', () => {
  for (const y of Object.keys(D.E0_TARGET.values.M)) assert.ok(D.E0_TARGET.values.M[y] < D.E0_TARGET.values.F[y]);
  assert.ok(D.E0_TARGET.values.M[2024] > D.E0_TARGET.values.M[1970] + 20);
  for (const sc of ['mid', 'low']) for (const sex of ['M', 'F']) {
    const ys = Object.keys(D.E0_TARGET.projected[sc][sex]).map(Number).sort((a, b) => a - b);
    for (let i = 1; i < ys.length; i++) assert.ok(D.E0_TARGET.projected[sc][sex][ys[i]] >= D.E0_TARGET.projected[sc][sex][ys[i - 1]]);
  }
});

test('교차 일관성: 고교 유형 가중 진학 배수 ≈ 1, 소득 경계 증가, 순자산 분위점 증가, 출생 모 나이 증가', () => {
  const w = D.HIGH_TYPE_SHARE.values[2025];
  const avg = Object.keys(w).reduce((s, k) => s + w[k] * D.COLLEGE_BY_HIGH_TYPE.values[k], 0);
  assert.ok(Math.abs(avg - 1) < 0.03, `고교 유형 가중 ${avg}`);
  const inc = Object.values(D.INCOME_BOUNDS.values), nw = Object.values(D.NET_WORTH_BOUNDS.values), q = Object.values(D.NW_BY_INCOME_Q.values);
  for (const arr of [inc, nw, q]) for (let i = 1; i < arr.length; i++) assert.ok(arr[i] > arr[i - 1]);
  assert.ok(D.MOTHER_AGE_MEAN.values[2025] > D.MOTHER_AGE_MEAN.values[1993]);
  // 이혼·혼인율 규모 상식
  assert.ok(D.MARRIAGE_RATE.values.M[30][2025] > D.MARRIAGE_RATE.values.M[20][2025]);
  assert.ok(D.MARRIAGE_RATE.values.F[25][2000] > D.MARRIAGE_RATE.values.F[35][2000]);
  assert.ok(D.NEVER_MARRIED.values.M[30][2025] > D.NEVER_MARRIED.values.M[30][2005]);
  // 소득 5분위 TUTOR_PART 단조, STUDENT_LOAN 단조 감소, MPC 단조 감소
  const tp = Object.values(D.TUTOR_PART.values), sl = Object.values(D.STUDENT_LOAN.values), mpc = Object.values(D.MPC.values), mq = Object.values(D.MORT_Q.values);
  for (let i = 1; i < 5; i++) { assert.ok(tp[i] > tp[i - 1]); assert.ok(sl[i] < sl[i - 1]); assert.ok(mpc[i] < mpc[i - 1]); assert.ok(mq[i] < mq[i - 1]); }
  // 학자금 대출 평균 ≈ 이용률 14.3%
  assert.ok(Math.abs(sl.reduce((a, b) => a + b) / 5 - 0.143) < 0.01);
  // 시도 e0 차이는 합이 대략 0 근처(전국 대비), 서울이 최고
  assert.equal(Object.entries(D.E0_BY_REGION.values).sort((a, b) => b[1] - a[1])[0][0], 'seoul');
});

test('estimated/projected 표는 GDD 또는 근거를 note에 밝힌다', () => {
  for (const n of NAMES) {
    const t = TABLES[n];
    if (t.kind === 'estimated') assert.ok(/GDD|R0\d|추정/.test(t.note), `${n}: note에 GDD 절 또는 근거 필요`);
  }
  assert.equal(D.MORT_IMPROVEMENT.kind, 'projected');
});
