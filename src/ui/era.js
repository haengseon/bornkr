// 태어날 시대 고르기: 연대 → 출생아 수로 가중한 연도 뽑기(순수). 엔진 newLife({ forced: { year } })에 넘긴다.
import { BIRTH_YEAR_RANGE } from '../engine/constants.js';
import { BIRTHS_BY_YEAR } from '../data/birth.js';

const V = BIRTHS_BY_YEAR.values, KEYS = Object.keys(V).map(Number).sort((a, b) => a - b);
// 표에 없는 해는 앞뒤 해를 이은 선형 보간
export function birthsOf(y) {
  if (V[y] != null) return V[y];
  const hi = KEYS.find(k => k > y), lo = [...KEYS].reverse().find(k => k < y);
  if (hi == null) return V[KEYS.at(-1)];
  if (lo == null) return V[KEYS[0]];
  return V[lo] + (V[hi] - V[lo]) * (y - lo) / (hi - lo);
}
export const ERAS = [
  { decade: 1960, line: '산업화의 시작, 한 집에 아이가 서넛' },
  { decade: 1970, line: '새마을과 중화학공업, 도시로 가는 사람들' },
  { decade: 1980, line: '올림픽과 집값, 명절 대가족' },
];
export const decadeYears = d => Array.from({ length: 10 }, (_, i) => d + i).filter(y => y >= BIRTH_YEAR_RANGE[0] && y <= BIRTH_YEAR_RANGE[1]);
export const decadeBirthsAvg = d => { const ys = decadeYears(d); return ys.reduce((a, y) => a + birthsOf(y), 0) / ys.length; };
// r ∈ [0,1): 출생아 수 가중 추첨
export function pickYear(decade, r) {
  const ys = decadeYears(decade), w = ys.map(birthsOf), tot = w.reduce((a, b) => a + b, 0);
  let x = r * tot;
  for (let i = 0; i < ys.length; i++) { x -= w[i]; if (x < 0) return ys[i]; }
  return ys.at(-1);
}
export const manText = n => `${Math.round(n / 1e4).toLocaleString('en-US')}만`;
