// 시계(ARCHITECTURE §12 개정): 1년 = 1배속에서 BASE_YEAR_MS(30초) 고정, 배속(1~5)으로만 나눈다.
// 예산 압축·15분 상한 없음(사용자 결정). 선택·시트 열림 시간은 연 진행과 별개로 흐른다.
import { STAGES, BASE_YEAR_MS, HARD_CAP_MS } from './constants.js';

const EARLY_YEAR_SCALE = 0.4;
const LATE_YEAR_SCALE = 1 / 1.5;
export const stageOf = age => STAGES.find(s => age <= s.to) || STAGES[STAGES.length - 1];

export function createClock({ now = () => performance.now() } = {}) {
  let startAt = null, pausedAt = null, pausedTotal = 0;
  let choiceAt = null, choiceTotal = 0;

  const clock = {
    start() { if (startAt == null) startAt = now(); },
    pause() { if (startAt != null && pausedAt == null) pausedAt = now(); },
    resume() { if (pausedAt != null) { pausedTotal += now() - pausedAt; pausedAt = null; } },
    elapsed() {
      if (startAt == null) return 0;
      return (pausedAt ?? now()) - startAt - pausedTotal;
    },
    choiceStart() { choiceAt = clock.elapsed(); },
    choiceEnd() { if (choiceAt != null) { choiceTotal += clock.elapsed() - choiceAt; choiceAt = null; } },
    choiceTime: () => choiceTotal,
    overCap: () => clock.elapsed() >= HARD_CAP_MS,     // HARD_CAP_MS=Infinity 이므로 항상 false
    // 다음 해까지 대기(ms). 0~4세는 선택이 드물어 한 해를 0.4배로 압축한다(HOOK-30S P0-2).
    // 70세 이후도 1/1.5로 줄인다(E1 페이싱: 노년기는 선택이 드물어 방치 완주가 늘어진다).
    yearDelay(L, speed = 1) { return BASE_YEAR_MS * (L?.age < 5 ? EARLY_YEAR_SCALE : L?.age >= 70 ? LATE_YEAR_SCALE : 1) / (speed > 0 ? speed : 1); },
  };
  return clock;
}
