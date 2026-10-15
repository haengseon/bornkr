// 사건 본문 변형 선택(content/variants.js). when 을 통과한 변형 중 하나를 (시드·사건·연도·횟수)로 결정적으로 고른다.
// 난수 흐름(rngS/rngC)을 소비하지 않으므로 기존 생애의 다른 추첨은 바뀌지 않는다. 없으면 base 를 그대로 돌려준다.
import { VARIANTS } from '../content/variants.js';
import { hashSeed } from './rng.js';
import { needYear } from './anachro.js';

export function variantText(id, L, ctx, base) {
  const vs = VARIANTS[id];
  if (!vs || !L) return base;
  const ok = [];
  for (const v of vs) { try { if (needYear(v.text) <= (L.year ?? 9999) && v.when(L, ctx)) ok.push(v.text); } catch { /* 조건 오류는 건너뜀 */ } }
  if (!ok.length) return base;
  return ok[hashSeed(L.seed ?? 0, 'variant', id, L.year ?? 0, L.fired?.[id] ?? 0) % ok.length];
}
