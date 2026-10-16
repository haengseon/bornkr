import { LEAN } from './mbti-lean.js';

// 기존에 사람이 지정한 선택별 표만 새 독립 적합도에 연결한다. 문구 키워드 추론은 사용하지 않는다.
export function authoredChoicePersonality(eventId, optionId) {
  const raw = LEAN[eventId]?.[optionId];
  if (!raw) return null;
  const entries = typeof raw === 'string' ? [...raw].map(letter => [letter, 1]) : Object.entries(raw);
  if (!entries.length || entries.some(([key, weight]) => !'EISNTFJP'.includes(key) || !Number.isFinite(weight) || weight < 0)) return null;
  const total = entries.reduce((sum, [, value]) => sum + value, 0);
  // 합이 큰 옛 표만 축소한다. 약한 연관성을 확대하지 않는다.
  const scale = total > 1 ? 1 / total : 1;
  return { weights: Object.fromEntries(entries.map(([key, value]) => [key, value * scale])),
    authored: true, source: 'legacy-authored-lean', rationale: '기존 사건의 명시적 선택 성향을 공통 가중치 범위로 변환' };
}
