// 데이터 표 조회 헬퍼. 데이터 표 형식은 docs/design/ARCHITECTURE.md §5 참고.

// 연도 키 객체({ "1980": x, "1990": y })를 선형 보간. 범위 밖은 끝값 유지.
export function byYear(series, year) {
  const keys = Object.keys(series).map(Number).sort((a, b) => a - b);
  if (!keys.length) return undefined;
  if (year <= keys[0]) return series[keys[0]];
  if (year >= keys[keys.length - 1]) return series[keys[keys.length - 1]];
  for (let i = 1; i < keys.length; i++) {
    const k0 = keys[i - 1], k1 = keys[i];
    if (year <= k1) {
      const v0 = series[k0], v1 = series[k1];
      if (typeof v0 !== 'number' || typeof v1 !== 'number') return year - k0 < k1 - year ? v0 : v1;
      return v0 + (v1 - v0) * ((year - k0) / (k1 - k0));
    }
  }
}

// 표의 연도 범위 밖이면 true → UI에 '게임 추정' 표기.
export function isExtrapolated(series, year) {
  const keys = Object.keys(series).map(Number);
  return year < Math.min(...keys) || year > Math.max(...keys);
}

// 연령 구간 시작값 키 객체({ "0": a, "5": b, "10": c })에서 age가 속한 구간 값(계단 함수).
export function byAge(table, age) {
  let best;
  for (const k of Object.keys(table).map(Number).sort((a, b) => a - b)) {
    if (k <= age) best = table[k];
    else break;
  }
  return best;
}

// 메타가 붙은 표({ src, year, kind, values }) 또는 그냥 값 객체 모두 허용.
export const valuesOf = t => (t && t.values) || t;
