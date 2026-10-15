// 데이터 표 접근. 데이터 형태 가정(ARCHITECTURE §5, GDD §14.2)은 이 파일과 각 시스템의 T('이름') 호출에 모여 있다.
import * as D from '../data/index.js';
import { REGIONS } from './constants.js';

export { D };

// 표 values. 없으면 바로 알 수 있게 throw(엔진 안에 대체 값을 두지 않는다).
export function T(name) {
  const t = D[name];
  if (t == null) throw new Error(`데이터 표 없음: ${name}`);
  return t.values ?? t;
}
export const has = name => D[name] != null;

// 연도 키 시계열 보간(lookup.byYear와 같은 규칙, 키 정렬을 캐시해 빠르게). 숫자·배열·객체(키별) 모두 보간.
const KEYS = new WeakMap();
function keysOf(series) {
  let k = KEYS.get(series);
  if (!k) { k = Object.keys(series).map(Number).filter(n => !Number.isNaN(n)).sort((a, b) => a - b); KEYS.set(series, k); }
  return k;
}
function mix(a, b, t) {
  if (typeof a === 'number' && typeof b === 'number') return a + (b - a) * t;
  if (Array.isArray(a)) return a.map((x, i) => mix(x, b[i], t));
  if (a && typeof a === 'object') {
    const o = {};
    for (const key of new Set([...Object.keys(a), ...Object.keys(b || {})])) o[key] = mix(a[key] ?? 0, b?.[key] ?? 0, t);
    return o;
  }
  return t < 0.5 ? a : b;
}
export function yr(series, year) {
  const k = keysOf(series);
  if (!k.length) return undefined;
  if (year <= k[0]) return series[k[0]];
  const last = k[k.length - 1];
  if (year >= last) return series[last];
  let i = 1;
  while (k[i] < year) i++;
  const k0 = k[i - 1], k1 = k[i];
  if (k1 === year) return series[k1];
  return mix(series[k0], series[k1], (year - k0) / (k1 - k0));
}
// 연령 구간 시작값 키 → 계단 조회. 첫 키보다 어리면 첫 값.
export function ag(table, age) {
  const k = keysOf(table);
  let best = k[0];
  for (const x of k) { if (x <= age) best = x; else break; }
  return table[best];
}

export const REGION = Object.fromEntries(REGIONS.map(r => [r.key, r]));
export const isCapital = key => !!REGION[key]?.capital;
const METRO = new Set(['busan', 'daegu', 'gwangju', 'daejeon', 'ulsan']);
// 주거 지역군(GDD §5.5): seoul / capital(경기·인천) / metro / province
export const regionGroup = key => key === 'seoul' ? 'seoul' : isCapital(key) ? 'capital' : METRO.has(key) ? 'metro' : 'province';
export const regionLabel = key => REGION[key]?.full ?? key;

// 해마다 값이 따로 있는 표(실질 주택가격 변동 등): 표 범위 밖은 0
export function houseYoy(group, year) {
  const s = T('HOUSE_YOY_REAL')[group], k = keysOf(s);
  return year < k[0] || year > k[k.length - 1] ? 0 : yr(s, year);
}

export const band10 = age => Math.min(100, Math.floor(age / 10) * 10);
