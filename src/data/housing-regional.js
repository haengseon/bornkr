// 시군구별·시대별 시세 조회(R13 a·b·c 합본). 원자료는 84㎡ 환산 명목 만원(basis 'house' = 단독주택 그대로).
// regionalPrice(id, year, kind) → { value: 그해 명목 만원, real: 2025 실질 만원(엔진 단위), measured, est } | null(자료 없음)
// 표 사이 = 명목 로그선형 보간(null 연도는 건너뛰고 인접 연도끼리), 표 밖(1990 이전·2026 이후) = 등급 곡선(HOME_PRICE_INDEX) 비율로 실질 외삽.
import { HOUSING_REGIONAL_A } from './housing-regional-a.js';
import { HOUSING_REGIONAL_B } from './housing-regional-b.js';
import { HOUSING_REGIONAL_C } from './housing-regional-c.js';
import { REGIONS_A } from './regions-a.js';
import { REGIONS_B } from './regions-b.js';
import { REGIONS_C } from './regions-c.js';
import { HOME_PRICE_INDEX } from './housing.js';
import { CPI_MULT } from './wealth.js';
import { yr } from '../engine/tables.js';

const ALL = { ...HOUSING_REGIONAL_A, ...HOUSING_REGIONAL_B, ...HOUSING_REGIONAL_C };
delete ALL.meta;
const TIER = new Map([...REGIONS_A, ...REGIONS_B, ...REGIONS_C].map(r => [r.id, r.housingTier]));
export const regionalRow = id => ALL[id] ?? null;

// 그해 1원의 2025년 가치 — ui/format.js cpiMult와 같은 규칙(1980 이전 연 15% 외삽, 2025 이후 1)
const CV = CPI_MULT.values;
export const cpiOf = y => (y >= 2025 ? 1 : y < 1980 ? CV[1980] * 1.15 ** (1980 - y) : CV[Math.floor(y)]);
const idx = (id, y) => { const t = TIER.get(id) ?? 3; return yr(HOME_PRICE_INDEX.values[t >= 4 ? 'hi' : t === 3 ? 'mid' : 'lo'], y); };

export function regionalPrice(id, year, kind = 'sale') {
  const r = ALL[id], s = r?.[kind];
  if (!s) return null;
  const pts = Object.keys(s).map(Number).filter(y => s[y] != null).sort((a, b) => a - b);
  if (!pts.length) return null;
  const lo = pts[0], hi = pts.at(-1);
  let real;
  if (year <= lo || year >= hi) {
    const e = year <= lo ? lo : hi;                       // 표 밖: 끝값의 실질 × 등급 곡선 비율
    real = s[e] * cpiOf(e) * idx(id, year) / idx(id, e);
  } else {
    const k = pts.findIndex(y => y >= year), y1 = pts[k], y0 = pts[k - 1];
    const nom = s[y0] * (s[y1] / s[y0]) ** ((year - y0) / (y1 - y0));
    real = nom * cpiOf(year);
  }
  return { value: real / cpiOf(year), real, measured: r.kind === 'measured', est: year < lo || year > hi || r.kind !== 'measured' };
}
