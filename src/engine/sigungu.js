// 시군구 연결: 출생·이사 배정, 라벨, 편향. 데이터는 src/data/regions-*.js(콘텐츠 수정 없음).
import { REGIONS_A } from '../data/regions-a.js';
import { REGIONS_B } from '../data/regions-b.js';
import { REGIONS_C } from '../data/regions-c.js';
import { sigunguWeight } from '../data/region-share.js';
import { REGIONS } from './constants.js';
import { nameAt, sidoAt } from '../data/admin-names.js';

export const SGG = new Map([...REGIONS_A, ...REGIONS_B, ...REGIONS_C].map(r => [r.id, r]));
const ALL = [...SGG.values()];
const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));

// 그 해에 존재한 시군구와 가중. 아직 분리 전인 시도(대구·광주 등)의 시군구는 모 시도에 합산.
const cache = new Map();
export function candidates(region, year) {
  const k = region + year;
  if (cache.has(k)) return cache.get(k);
  const sidos = new Set([region, ...REGIONS.filter(r => r.parent === region && r.since > year).map(r => r.key)]);
  let list = ALL.filter(r => sidos.has(r.sido) && (r.since ?? 0) <= year && (r.until ?? 9999) >= year);
  if (!list.length) list = ALL.filter(r => sidos.has(r.sido));
  const w = list.map(r => sigunguWeight(r.id, year)), s = w.reduce((a, b) => a + b, 0) || 1;
  const out = list.map((r, i) => ({ r, p: w[i] / s }));
  cache.set(k, out);
  return out;
}

// 소득 분위 보정: 시군구 incomeTier 로 분위 가중을 ±12%까지 기울이고, 시도 평균이 같도록 정규화.
const tilt = (tier, i) => 1 + 0.12 * (tier - 3) * (i - 2) / 2;
export function quintileAdjust(w, region, year, sgg) {
  const c = candidates(region, year);
  return w.map((x, i) => x * tilt(sgg.incomeTier, i) / c.reduce((a, { r, p }) => a + p * tilt(r.incomeTier, i), 0));
}

const dongOk = (d, year) => {
  const m = /(\d{4})/.exec(d.note || '');
  return !(m && /입주|개발|조성|준공|신도시|택지/.test(d.note) && year < +m[1]);
};
export function pickDong(W, r, year) {
  const ok = r.dongs.filter(d => dongOk(d, year));
  const l = ok.length ? ok : r.dongs;
  return l[+W(Object.fromEntries(l.map((_, i) => [i, 1])))];
}
export function pickSigungu(W, region, year) {
  const c = candidates(region, year);
  return c[+W(Object.fromEntries(c.map((x, i) => [i, x.p])))].r;
}

// 교통: 도시철도 개통 연도(추정). 수도권 광역철도(1호선 1974~)는 경기 도시 지역에 적용. est
const RAIL = { seoul: 1974, incheon: 1974, gyeonggi: 1974, busan: 1985, daegu: 1997, gwangju: 2004, daejeon: 2006 };
export function transitOf(r, d, year) {
  const t = d?.tier ?? 3, rail = (RAIL[r.sido] ?? 9999) <= year && (r.sido !== 'gyeonggi' || r.urban >= 4);
  if (rail && ((r.urban >= 4 && t >= 3) || (r.urban === 3 && t >= 4))) return 'station';
  if (r.urban >= 4 || (r.urban === 3 && t >= 3)) return 'bus';
  if (r.urban >= 3 || (r.urban === 2 && r.kind !== '군') || t >= 4) return 'car';
  return t >= 3 ? 'car' : 'remote';
}
export const TRANSIT_LABEL = { station: '역세권', bus: '버스 생활권', car: '외곽(차량 필요)', remote: '교통 불편 지역' };
export const place = (W, r, year) => { const d = pickDong(W, r, year); return { sigungu: r.id, dong: d.name, transit: transitOf(r, d, year) }; };
export const TRANSIT_ACCESS = { station: 2, bus: 0, car: -3, remote: -8 };

// 이사: 목적지 시도 안에서 소득·주택가 수준이 맞는 시군구를 가중 추첨. level: 1~5 소득 수준.
export function pickMoveTarget(W, region, year, level) {
  const c = candidates(region, year);
  const r = c[+W(Object.fromEntries(c.map(({ r, p }, i) => [i, p * Math.exp(-0.6 * Math.abs((r.incomeTier + r.housingTier) / 2 - level))])))].r;
  return place(W, r, year);
}
export const levelOf = L => clamp(Math.round(1 + 4 * (L.cache?.INCpos ?? 50) / 100), 1, 5);

export const bias = (L, kind, key, lo = 0.6, hi = 1.6) => clamp(SGG.get(L.home?.sigungu)?.[kind]?.[key] ?? 1, lo, hi);
// 교육 확률 배율: eduTier 3 기준 ±15% 이내
export const eduMult = L => 1 + 0.075 * ((SGG.get(L.home?.sigungu)?.eduTier ?? 3) - 3);

// 거주지 표기: 그해 명칭으로 시·구까지(군은 읍까지), 동·교통은 표기하지 않음. '경상북도 의성군 의성읍', '대구직할시 수성구'
// dong 은 일반구·읍 판정에만 쓴다. year 없으면 현재 명칭.
function label(region, sigungu, dong, year, short) {
  const r = SGG.get(sigungu);
  if (!r) return sidoAt(region, year, short);
  const n = nameAt(sigungu, year, dong), sido = sidoAt(n.sido ?? r.sido, year, short);
  return n.name === sidoAt(r.sido, year) ? n.name : `${sido} ${n.name}`.trim();
}
export const placeLabel = (region, sigungu, dong, year) => label(region, sigungu, dong, year, false);
export const vibeOf = (sigungu, dong) => { const r = SGG.get(sigungu); return (r?.dongs.find(d => d.name === dong)?.vibe) ?? r?.vibe ?? ''; };

// '경북 의성군 의성읍' · '경기 성남시 분당구' (시군구 정보가 없으면 시도 약칭만)
export const placeLine = (region, sigungu, dong, year) => label(region, sigungu, dong, year, true);
