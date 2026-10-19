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
    return { activityId: id };
  },
  'retain-current-schedule'() { return {}; },
  'request-loan-extension'(L) {
    const id = detailId(L, 'book.current-loan', 'loanId');
    const loan = arr(L.dailyLife.bookLoans).find(l => l.id === id && l.status === 'borrowed');
    if (!loan || !loan.canExtend || loan.extensionYears !== 1) return null;
    loan.dueYear += loan.extensionYears; loan.canExtend = false;
    return { loanId: id };
  },
  'return-and-reserve-book'(L) {
    const id = detailId(L, 'book.current-loan', 'loanId');
    const loan = arr(L.dailyLife.bookLoans).find(l => l.id === id && l.status === 'borrowed');
    if (!loan || !loan.canReserve) return null;
    loan.status = 'returned'; loan.returnedYear = L.year; loan.reservationStatus = 'requested';
    return { loanId: id };
  },
  'reserve-reading-time'(L, e, o) {
    const id = detailId(L, 'book.current-loan', 'loanId');
    if (!arr(L.dailyLife.bookLoans).some(l => l.id === id && l.status === 'borrowed')) return null;
    if (!recordDailyActivity(L, { id: `reading.${id}`, kind: 'reading', status: 'completed', minutes: 10,
      sourceEventId: e.id, choiceId: o.id, accessConfirmed: true })) return null;
    return { loanId: id };
  },
  'set-media-end-time'(L) {
    const id = detailId(L, 'routine.media-active', 'activityId');
    if (!id) return null;
    const rules = L.dailyLife.activityRules ||= {};
    rules[id] = { year: L.year, endTimeSet: true, enforceAfterCommitment: false };
    return { activityId: id };
  },
  'move-media-after-commitment'(L) {
    const id = detailId(L, 'routine.media-active', 'activityId');
    const commitmentId = detailId(L, 'schedule.media-after-commitment-feasible', 'commitmentId');
    if (!id || !arr(L.dailyLife.commitments).some(c => c.id === commitmentId && c.year === L.year && c.status === 'scheduled' && c.afterMediaFeasible)) return null;
    const rules = L.dailyLife.activityRules ||= {};
    rules[id] = { year: L.year, enforceAfterCommitment: true, commitmentId };
    return { activityId: id, commitmentId };
  },
  'resume-short-hobby-session'(L, e, o) {
    const id = detailId(L, 'routine.hobby-paused-history', 'activityId');
    const old = arr(L.dailyLife.activities).filter(a => a.id === id).at(-1);
    if (!old || old.status !== 'paused') return null;
    if (!recordDailyActivity(L, { id, kind: old.kind, status: 'resumed', minutes: 15,
      sourceEventId: e.id, choiceId: o.id, accessConfirmed: true })) return null;
    return { activityId: id };
  },
  'keep-hobby-paused'(L) {
    const id = detailId(L, 'routine.hobby-paused-history', 'activityId');
    if (!id) return null;
    return { activityId: id };
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
  result.text = eligible.result;   // 결과문은 콘텐츠의 선택별 한 문장(LIFE-EVENTS-100 원본)
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
