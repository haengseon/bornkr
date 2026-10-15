// 출생지역 분포 — 센서스 기반 시도 인구 → 출생아 분포 (1960~1985), 도시 비중, 시도 내 시군구 가중.
// 한계: 시도별 센서스 원표(KOSIS)는 조사 한도 내 웹 접근 불가 → 아래 POP 는 (a)검증 앵커(서울 1960/70/80/90, 1985 대도시, 수도권 비중 20.8/28.3/35.5/39.1/42.8,
// 전국 총인구, 1966~90 시도 인구밀도표[theme.archives.go.kr/KOSIS])에 맞춘 추정치이며 경북은 '전국−나머지' 잔차. 자세한 구분은 docs/research/R10-region-share.md.
import { REGIONS } from '../engine/constants.js';
import { REGIONS_A } from './regions-a.js';
import { REGIONS_B } from './regions-b.js';
import { REGIONS_C } from './regions-c.js';

const CENSUS = [1960, 1966, 1970, 1975, 1980, 1985, 1990];
const TOTAL = [24989, 29160, 31466, 34679, 37436, 40448, 43411]; // 천 명
// 당시 단위(대구·인천은 모든 센서스 연도에 별도 단위로 두고 1981 전은 모(母)에 합산), 천 명
const POP = {
  seoul: [2445, 3793, 5433, 6889, 8364, 9646, 10613], busan: [1163, 1426, 1881, 2454, 3159, 3517, 3798],
  daegu: [676, 876, 1082, 1311, 1607, 2031, 2229], incheon: [401, 520, 634, 800, 1084, 1387, 1818],
  gyeonggi: [2351, 2600, 2838, 3250, 3842, 4782, 6155], gangwon: [1637, 1822, 1866, 1827, 1791, 1698, 1577],
  chungbuk: [1369, 1549, 1492, 1519, 1424, 1395, 1387], chungnam: [2436, 2860, 2806, 2882, 2950, 3000, 3035], // 대전·세종 포함
  jeonbuk: [2050, 2523, 2440, 2451, 2289, 2200, 2075], jeonnam: [3508, 4060, 4015, 3990, 3822, 3745, 3690], // 광주 포함
  gyeongnam: [3000, 3190, 3150, 3290, 3360, 3620, 3800], jeju: [282, 340, 369, 417, 466, 493, 515], // 울산 포함
};
POP.gyeongbuk = TOTAL.map((t, i) => t - Object.values(POP).reduce((a, v) => a + v[i], 0)); // 잔차(대구 제외)
const KEYS = REGIONS.map(r => r.key);
// 시도 유형별 도시(시부) 상대 배율 — 도시 비중 시도 보정(추정)
const URBAN_MULT = { gyeonggi: 1.5, gyeongnam: 1.3, gyeongbuk: 1.1, chungnam: 1.0, jeonbuk: 0.95, gangwon: 0.9, jeju: 0.9, jeonnam: 0.85, chungbuk: 0.8 };
const METRO = ['seoul', 'busan', 'daegu', 'incheon'];
// 전국 시부 인구 비중: 1985·1990 = 센서스(1990 보도) 확인, 1960~80 = 통상 인용치(원표 미확인 → estimated)
const NAT_URBAN = [0.28, 0.335, 0.412, 0.484, 0.573, 0.654, 0.744];
// 농촌/도시 출산력 배율(농촌 TFR ÷ 도시 TFR) — 1960s 농촌 고출산 근거 추정(원표 미확인)
const RURAL_TFR_RATIO = [1.3, 1.3, 1.3, 1.25, 1.2, 1.15, 1.1];

const interp = (a, y) => {
  const i = Math.min(CENSUS.length - 2, Math.max(0, CENSUS.findLastIndex(c => c <= y)));
  return a[i] + (a[i + 1] - a[i]) * (y - CENSUS[i]) / (CENSUS[i + 1] - CENSUS[i]);
};

// 센서스 연도 index i 의 시도별 도시(시부) 비중
function urbanAt(i) {
  const need0 = NAT_URBAN[i] * TOTAL[i] - METRO.reduce((a, k) => a + POP[k][i], 0); // 비대도시 시부 인구
  const units = Object.keys(POP).filter(k => !METRO.includes(k));
  const f = s => units.reduce((a, k) => a + POP[k][i] * Math.min(0.95, s * URBAN_MULT[k]), 0);
  let lo = 0, hi = 2;
  for (let n = 0; n < 40; n++) { const m = (lo + hi) / 2; f(m) < need0 ? (lo = m) : (hi = m); }
  const u = {};
  METRO.forEach(k => (u[k] = 1));
  units.forEach(k => (u[k] = Math.min(0.95, lo * URBAN_MULT[k])));
  return u;
}
const URBAN_AT = CENSUS.map((_, i) => urbanAt(i));
const r4 = x => Math.round(x * 1e4) / 1e4;
const YEARS = Array.from({ length: 26 }, (_, n) => 1960 + n);

// 연도 y 의 당시 시도 → 17키 분포(출생아 가중, 합 1)
function shareAt(y) {
  const out = Object.fromEntries(KEYS.map(k => [k, 0]));
  const r = interp(RURAL_TFR_RATIO, y);
  for (const k of Object.keys(POP)) {
    const u = interp(URBAN_AT.map(o => o[k]), y);
    const reg = REGIONS.find(g => g.key === k);
    out[reg.since && y < reg.since ? reg.parent : k] += interp(POP[k], y) * (u + (1 - u) * r);
  }
  const s = Object.values(out).reduce((a, b) => a + b, 0);
  return Object.fromEntries(KEYS.map(k => [k, r4(out[k] / s)]));
}

export const REGION_SHARE_BY_YEAR = {
  src: 'R10.S1', year: 1985, kind: 'estimated',
  note: '출생연도 1960~1985 매년, 당시 행정구역 17키(미분리=0, 대구·인천 1981~ 독립, 광주·대전·울산·세종은 모 시도 합산). 센서스 연도(1960·66·70·75·80·85)는 앵커, 사이는 선형 보간. 출생 가중 = 인구 × (도시비중 + 농촌비중 × 농촌/도시 TFR 배율 1.30→1.15). 시도 인구는 서울·수도권·전국·대도시 앵커 외 추정(잔차 경북). 센서스 연도도 시도 원표 미확인이라 measured 로 표기하지 않음.',
  values: Object.fromEntries(YEARS.map(y => [y, {
    kind: 'estimated', anchor: CENSUS.includes(y) ? 'census' : 'interpolated', src: 'R10.S1', year: y,
    note: CENSUS.includes(y) ? '센서스 연도 앵커(시도 값은 추정 포함)' : '센서스 사이 선형 보간', share: shareAt(y),
  }])),
};

export const URBAN_SHARE_BY_YEAR = {
  src: 'R10.S2', year: 1985, kind: 'estimated',
  note: '시도별 시부(도시) 인구 비중. 전국값 1985 65.4%·1990 74.4%는 센서스(1990 보도) 확인, 1960~80은 통상 인용치. 서울·부산·대구·인천=1.0, 나머지는 시도 유형 배율로 전국값에 맞춰 보정(추정). 주의: 시부 ≠ 동부(읍·면 포함 시 지역이 있어 동부 비중은 다소 낮음). 광주·대전·울산은 모 시도에 포함.',
  values: Object.fromEntries(YEARS.map(y => [y, Object.fromEntries(Object.keys(POP).map(k => [k, r4(interp(URBAN_AT.map(o => o[k]), y))]))])),
};

// ---- 시군구 ----
const ALL = [...REGIONS_A, ...REGIONS_B, ...REGIONS_C];
const BASE_CITY = { 5: 1.6, 4: 1.1, 3: 0.6, 2: 0.35, 1: 0.2 };
const BASE_OVR = {
  'seoul.jongno': 0.35, 'seoul.jung': 0.3, 'seoul.songpa': 1.5, 'seoul.gangseo': 1.4, 'seoul.nowon': 1.2,
  'busan.jung': 0.15, 'busan.seo': 0.5, 'busan.dong': 0.4, 'busan.yeongdo': 0.5, 'daegu.jung': 0.3, 'incheon.jung': 0.3, 'incheon.dong': 0.3,
  'gyeonggi.suwon': 2.2, 'gyeonggi.yongin': 2.6, 'gyeonggi.seongnam': 2.2, 'gyeonggi.goyang': 2.2, 'gyeonggi.hwaseong': 2.4,
  'gyeonggi.bucheon': 2.0, 'gyeonggi.namyangju': 1.8, 'gyeonggi.ansan': 1.6, 'gyeonggi.gwacheon': 0.2,
};
// 개발 시기 [시작, 완성, 시작 시 배율]: 신도시·택지 개발지는 완성 해 이전 선형 상승(개발 연혁 기반, 추정)
const DEV = {
  'seoul.gangnam': [1966, 1988, 0.1], 'seoul.seocho': [1966, 1988, 0.1], 'seoul.songpa': [1970, 1990, 0.08], 'seoul.gangdong': [1972, 1990, 0.15],
  'seoul.nowon': [1980, 1992, 0.05], 'seoul.yangcheon': [1983, 1990, 0.3], 'seoul.gangseo': [1975, 2000, 0.2], 'seoul.guro': [1965, 1990, 0.4],
  'seoul.gwanak': [1960, 1985, 0.3], 'seoul.dobong': [1975, 1992, 0.3], 'seoul.eunpyeong': [1970, 2010, 0.4], 'seoul.geumcheon': [1980, 1995, 0.5],
  'gyeonggi.seongnam': [1969, 1995, 0.2], 'gyeonggi.goyang': [1990, 1996, 0.2], 'gyeonggi.anyang': [1970, 1995, 0.35], 'gyeonggi.bucheon': [1980, 1995, 0.25],
  'gyeonggi.gunpo': [1985, 1995, 0.2], 'gyeonggi.ansan': [1976, 1995, 0.05], 'gyeonggi.gwacheon': [1979, 1985, 0.2], 'gyeonggi.hwaseong': [1998, 2020, 0.25],
  'gyeonggi.yongin': [1990, 2015, 0.2], 'gyeonggi.gimpo': [1998, 2020, 0.35], 'gyeonggi.siheung': [1985, 2015, 0.2], 'gyeonggi.gwangmyeong': [1975, 1990, 0.3],
  'gyeonggi.hanam': [1995, 2018, 0.2], 'gyeonggi.paju': [2000, 2020, 0.4], 'gyeonggi.namyangju': [1990, 2015, 0.3], 'gyeonggi.osan': [1990, 2010, 0.3],
  'incheon.yeonsu': [1990, 2012, 0.05], 'incheon.namdong': [1985, 1996, 0.15], 'incheon.seo': [1985, 2015, 0.3], 'incheon.gyeyang': [1985, 1996, 0.3],
  'busan.haeundae': [1980, 1996, 0.35], 'busan.gangseo': [1989, 2020, 0.2], 'busan.saha': [1975, 1990, 0.4], 'busan.geumjeong': [1975, 1992, 0.4],
  'daegu.suseong': [1975, 1995, 0.3], 'daegu.dalseo': [1975, 1995, 0.3], 'daejeon.yuseong': [1975, 1996, 0.3], 'sejong.sejong': [2005, 2020, 0.3],
  'gyeongnam.changwon': [1975, 1995, 0.25],
};
const BYID = new Map(ALL.map(r => [r.id, r]));
const base = r => BASE_OVR[r.id] ?? (r.kind === '시' ? BASE_CITY[r.urban] ?? 0.6 : r.kind === '구' ? 1.0 : 0.15);

// 시도 내 상대 가중(≥0). 농촌·소도시는 과거일수록 상대적으로 큼(도시화), 개발지는 개발 전 작음. 없는 id → 0.
export function sigunguWeight(id, year) {
  const r = BYID.get(id);
  if (!r) return 0;
  const y = Math.min(2020, Math.max(1960, year));
  const d = DEV[id];
  let f = 1;
  if (d) f = y >= d[1] ? 1 : y <= d[0] ? d[2] : d[2] + (1 - d[2]) * (y - d[0]) / (d[1] - d[0]);
  else if (r.urban <= 2) f = 1 + 1.2 * (2020 - y) / 60;
  else if (r.urban === 3) f = 1 + 0.5 * (2020 - y) / 60;
  return base(r) * f;
}
export function sigunguShare(sido, year) {
  const rs = ALL.filter(r => r.sido === sido), w = rs.map(r => sigunguWeight(r.id, year)), s = w.reduce((a, b) => a + b, 0);
  return Object.fromEntries(rs.map((r, i) => [r.id, w[i] / s]));
}
export const SIGUNGU_SHARE_WITHIN_SIDO = {
  src: 'R10.S3', year: 2020, kind: 'estimated',
  note: '2020 인구센서스 시군구 인구는 조사 한도 내 미확인 → 구·시·군 유형·urban 등급 기반 상대 기준값 + 개발 시기(DEV) 보정. 시도 내 정규화는 sigunguShare(sido, year). 시도 경계는 현재 기준(인천·대구 분리 전 지역도 현재 시도 소속).',
  weight: sigunguWeight, share: sigunguShare,
};
