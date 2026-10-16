// 생활 사건의 실제 처리기. 금전·새 인물·질병을 생성하지 않는다.
import { lifeEventOptions } from './daily-eligibility.js';
import { collectDailyFacts, recordDailyActivity } from './daily-facts.js';
import { performScenarioChoice, scenarioOutcomeHandler } from './life-event-scenarios.js';

const arr = value => Array.isArray(value) ? value : [];
const fact = (L, key) => arr(L.dailyLife?.facts).find(f => f.key === key && f.year === L.year && f.status === 'confirmed');
const detailId = (L, key, id) => fact(L, key)?.details?.[id];

const ACTIONS = {
  'reserve-short-walk'(L, e, o) {
    const id = `exercise.${L.year}`;
    if (!recordDailyActivity(L, { id, kind: 'exercise', status: 'completed', minutes: 15,
      sourceEventId: e.id, choiceId: o.id, accessConfirmed: true })) return null;
    return { text: '확인해 둔 안전한 공간에서 15분 동안 가볍게 움직였다. 다음에도 이어갈 시간을 정해 두었다.', activityId: id };
  },
  'retain-current-schedule'() { return { text: '새 운동 일정을 넣지 않고 현재 일정을 유지했다.' }; },
  'request-loan-extension'(L) {
    const id = detailId(L, 'book.current-loan', 'loanId');
    const loan = arr(L.dailyLife.bookLoans).find(l => l.id === id && l.status === 'borrowed');
    if (!loan || !loan.canExtend || loan.extensionYears !== 1) return null;
    loan.dueYear += loan.extensionYears; loan.canExtend = false;
    return { text: '대여 규칙이 허용하는 범위에서 반납 기한을 한 차례 연장했다.', loanId: id };
  },
  'return-and-reserve-book'(L) {
    const id = detailId(L, 'book.current-loan', 'loanId');
    const loan = arr(L.dailyLife.bookLoans).find(l => l.id === id && l.status === 'borrowed');
    if (!loan || !loan.canReserve) return null;
    loan.status = 'returned'; loan.returnedYear = L.year; loan.reservationStatus = 'requested';
    return { text: '책을 반납하고 다시 빌릴 수 있도록 예약을 요청했다. 다음 대여가 확정된 것은 아니다.', loanId: id };
  },
  'reserve-reading-time'(L, e, o) {
    const id = detailId(L, 'book.current-loan', 'loanId');
    if (!arr(L.dailyLife.bookLoans).some(l => l.id === id && l.status === 'borrowed')) return null;
    if (!recordDailyActivity(L, { id: `reading.${id}`, kind: 'reading', status: 'completed', minutes: 10,
      sourceEventId: e.id, choiceId: o.id, accessConfirmed: true })) return null;
    return { text: '개인 시간에서 10분을 떼어 빌린 책을 더 읽었다. 완독 여부는 따로 남겨 두었다.', loanId: id };
  },
  'set-media-end-time'(L) {
    const id = detailId(L, 'routine.media-active', 'activityId');
    if (!id) return null;
    const rules = L.dailyLife.activityRules ||= {};
    rules[id] = { year: L.year, endTimeSet: true, enforceAfterCommitment: false };
    return { text: '게임·미디어 이용 종료 시간을 정했다. 다음 일정에서 실제로 지켰는지는 별도로 살피기로 했다.', activityId: id };
  },
  'move-media-after-commitment'(L) {
    const id = detailId(L, 'routine.media-active', 'activityId');
    const commitmentId = detailId(L, 'schedule.media-after-commitment-feasible', 'commitmentId');
    if (!id || !arr(L.dailyLife.commitments).some(c => c.id === commitmentId && c.year === L.year && c.status === 'scheduled' && c.afterMediaFeasible)) return null;
    const rules = L.dailyLife.activityRules ||= {};
    rules[id] = { year: L.year, enforceAfterCommitment: true, commitmentId };
    return { text: '이미 잡힌 약속 뒤로 취미 시간을 옮겼다. 약속 참석과 규칙 이행은 나중 기록에서 확인한다.', activityId: id, commitmentId };
  },
  'resume-short-hobby-session'(L, e, o) {
    const id = detailId(L, 'routine.hobby-paused-history', 'activityId');
    const old = arr(L.dailyLife.activities).filter(a => a.id === id).at(-1);
    if (!old || old.status !== 'paused') return null;
    if (!recordDailyActivity(L, { id, kind: old.kind, status: 'resumed', minutes: 15,
      sourceEventId: e.id, choiceId: o.id, accessConfirmed: true })) return null;
    return { text: '예전에 하다가 멈춘 활동을 15분 동안 다시 해 보았다. 재개한 오늘의 기록을 남겼다.', activityId: id };
  },
  'keep-hobby-paused'(L) {
    const id = detailId(L, 'routine.hobby-paused-history', 'activityId');
    if (!id) return null;
    return { text: '지금은 다른 일을 먼저 하기로 하고 취미는 중단한 상태로 두었다.', activityId: id };
  },
};

export const LIFE_EVENT_ACTION_IDS = Object.freeze(Object.keys(ACTIONS));

/** 반환값 executed=false면 선택 결과나 예약 성공으로 기록하지 않는다. */
export function eventActions(L, event, option, ctx = {}) {
  if (!L?.dailyLife || !event || !option) return { executed: false, reason: 'missing-context' };
  collectDailyFacts(L);
  const eligible = lifeEventOptions(L, event).find(o => o.id === option.id);
  const action = eligible && (event.scenarioProfile ? performScenarioChoice : ACTIONS[eligible.operation.actionId]);
  if (!action) return { executed: false, reason: 'conditions-changed' };
  const d = L.dailyLife;
  const outcomeId = `${event.id}:${L.year}:${option.id}`;
  d.actionOutcomes ||= {};
  if (d.actionOutcomes[outcomeId]) return { executed: false, reason: 'already-applied' };
  const result = action(L, event, eligible);
  if (!result) return { executed: false, reason: 'action-declined' };
  d.actionOutcomes[outcomeId] = { year: L.year, eventId: event.id, optionId: option.id };
  d.history.push({ id: outcomeId, eventId: event.id, choiceId: option.id, year: L.year,
    kind: 'life-event-action', status: 'confirmed', ...result });
  d.eventLastYear ||= {};
  d.eventLastYear[event.id] = L.year;
  const followUp = { id: `${outcomeId}:review`, sourceEventId: outcomeId, choiceId: option.id,
    dueYear: L.year + 1, kind: 'life-event-review', eventId: event.id, ...result,
    text: '앞서 조정한 활동과 현재 여건을 다시 살폈다.' };
  if (typeof ctx.queueOutcome === 'function') ctx.queueOutcome(followUp);
  collectDailyFacts(L);
  return { executed: true, ...result, followUp };
}

/** 후속은 이행·회복을 추정하지 않는다. 기록에 남은 대상의 존속만 확인한다. */
export const lifeEventReviewHandler = {
  eligible(L, item) {
    if (item.scenarioRecord) return scenarioOutcomeHandler.eligible(L, item);
    return L.alive === true && (item.activityId ? arr(L.dailyLife?.activities).some(a => a.id === item.activityId) :
      item.loanId ? arr(L.dailyLife?.bookLoans).some(l => l.id === item.loanId) : true);
  },
  apply(L, item) {
    if (item.scenarioRecord) { scenarioOutcomeHandler.apply(L, item); return; }
    L.dailyLife.activityReviews ||= {};
    L.dailyLife.activityReviews[item.id] = { year: L.year, eventId: item.eventId, status: 'reviewed' };
  },
};
