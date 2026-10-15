// 결정적 난수. 상태는 JSON 직렬화 가능한 { a } 객체에 둔다(재현·재열람용).
// 엔진·콘텐츠 어디서도 Math.random()을 쓰지 않는다.

export function makeRng(seed) {
  return { a: seed >>> 0 };
}

// mulberry32
export function rand(s) {
  let t = (s.a = (s.a + 0x6d2b79f5) | 0);
  t = Math.imul(t ^ (t >>> 15), 1 | t);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

export const chance = (s, p) => rand(s) < p;
export const int = (s, lo, hi) => lo + Math.floor(rand(s) * (hi - lo + 1));
export const pick = (s, arr) => arr[Math.floor(rand(s) * arr.length)];

// weights: { key: w } 또는 [[key, w], ...]. 합이 0이면 null.
export function weighted(s, weights) {
  const entries = Array.isArray(weights) ? weights : Object.entries(weights);
  let total = 0;
  for (const [, w] of entries) total += Math.max(0, w);
  if (total <= 0) return null;
  let r = rand(s) * total;
  for (const [k, w] of entries) {
    r -= Math.max(0, w);
    if (r < 0) return k;
  }
  return entries[entries.length - 1][0];
}

export function normal(s, mean = 0, sd = 1) {
  const u = 1 - rand(s), v = rand(s);
  return mean + sd * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export const clamp = (x, lo = 0, hi = 100) => Math.min(hi, Math.max(lo, x));

// 문자열/숫자 조합 → 32비트 시드 (FNV-1a). 동료(같은 날 태어난 3명) 시드 파생에 사용.
export function hashSeed(...parts) {
  let h = 0x811c9dc5;
  for (const ch of parts.join('|')) {
    h ^= ch.codePointAt(0);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}
