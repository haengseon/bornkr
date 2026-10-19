// 엔진 공개 API(ARCHITECTURE §6). DOM 비의존, 결정적(Math.random·Date 없음).
import { newLife } from './birth.js';
import { advance, resolve, finish } from './life.js';
import { createClock as makeClock } from './clock.js';
import { expectedRemainingYears } from './death.js';
import { compareCard, keepPace } from './peers.js';

export { newLife };
export { expectedRemainingYears };
export { peers, compareCard } from './peers.js';
export { explain } from './explain.js';
export { summarize, birthCert } from './summary.js';
export { fill } from './text.js';
export { schoolLabel, eraSchool } from './anachro.js';
export { SCENARIO_FROM } from './life.js';
export { qaTrace } from './qa.js';
export { concernsOf } from './concerns.js';
export { standing } from './standing.js';

const withCard = (L, r) => (keepPace(L), r.compare != null ? { ...r, compare: compareCard(L, r.compare) } : r);

// 1년 진행 → { entries, choice, compare, died }. 대기 중 선택이 있으면 throw.
export const advanceYear = L => withCard(L, advance(L));

// 대기 중 선택 해소 + 그해 남은 처리 → { entries, choice, compare, died }
export const choose = (L, optionId, { auto = false } = {}) => withCard(L, resolve(L, optionId, { auto }));

// 남은 생애를 즉시 끝까지. policy: 'default' | 'cap'(15분 상한) | (L, choiceReq) => optionId
export const runToEnd = (L, policy = 'default') => finish(L, policy);

// 같은 시드 + 선택 기록 → 같은 생애. 기록에 없는 선택(엔진 자동 적용 forced 제외)은 기본값.
export function replay(seed, choices = [], { forced, modelVersion } = {}) {
  const L = newLife({ seed, forced, modelVersion });
  const queue = choices.filter(c => !c.forced && !c.routine);
  let i = 0;
  while (L.alive) {
    if (!L.pending) { advance(L); continue; }
    const c = queue[i], p = L.pending;
    if (c && (c.eventId === p.eventId || (c.eventId === 'sys.life.direction' && p.eventId.startsWith('sys.late.'))) && c.age === p.age) { i++; resolve(L, c.option, { auto: !!c.auto }); }
    else resolve(L, p.defaultId, { auto: true });
  }
  return L;
}

export const createClock = (opts = {}) => makeClock({ remainingYears: expectedRemainingYears, ...opts });
