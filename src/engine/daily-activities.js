import { stageOf } from './clock.js';
import { STAGE_CAP } from './tuning.js';
import { eligibleLifeEvents, lifeEventOptions } from './daily-eligibility.js';
import { recordDailyAccess, recordDailyActivity, collectDailyFacts } from './daily-facts.js';
import { LIFE_EVENTS } from '../content/life-events.js';
import { eventActions } from './life-event-actions.js';
import { prepareLifeEventScenarios } from './life-event-scenarios.js';
import { prepareLifeWorld } from './life-world.js';

export const LIFE_EVENT_STAGE_CAP = 1;

export function step(L, ctx) {
  const d = L.dailyLife;
  if (L.modelVersion < 2 || L.age < 5 || L.year < 1960 || !L.alive || !d?.summary || L.yr.asked || L.pending) return;
  const stage = stageOf(L.age).id;
  prepareLifeWorld(L, ctx);
  prepareLifeEventScenarios(L, ctx);
  collectDailyFacts(L);
  if ((L.stageChoices[stage].life || 0) < LIFE_EVENT_STAGE_CAP) {
    const event = eligibleLifeEvents(L)[0];
    if (event) {
      const options = lifeEventOptions(L, event);
      const defaultOption = options.find(o => ['retain-current-schedule', 'keep-hobby-paused'].includes(o.operation.actionId)) || options.at(-1);
      ctx.ask({ eventId: event.id, prompt: event.text,
        options: options.map(o => ({ id: o.id, label: o.label, hint: o.hint, personality: o.personality })),
        defaultId: defaultOption.id, data: { lifeEventId: event.id } });
      return;
    }
  }
  if (L.age < 19 || L.year < 1999 || !d.routines.length || d.nextActivityYear > L.year || L.stageChoices[stage].sys >= STAGE_CAP[stage].sys) return;
  ctx.ask({ eventId: 'sys.daily.activity', prompt: '남겨 둔 개인 시간에 오늘 할 수 있는 일을 하나 골라 볼까?',
    options: [
      { id: 'access', label: '집 안에서 무리 없이 움직일 공간을 살핀다', hint: '집 안에서 가볍게 움직일 자리가 있는지 살핀다.', personality: { weights: { S: .4, J: .2 } } },
      { id: 'media', label: '개인 시간 15분을 미디어 감상에 쓴다', feasible: d.summary.time.personal >= 15, personality: { weights: { I: .4 } } },
      { id: 'keep', label: '이번에는 따로 활동을 정하지 않는다', personality: { weights: {} } },
    ], defaultId: 'keep' });
}

function chooseActivity(L, ctx, option) {
  const d = L.dailyLife;
  d.nextActivityYear = L.year + 5;
  const sourceEventId = 'sys.daily.activity';
  let completed = false;
  if (option === 'access') completed = recordDailyAccess(L, { id: `home-space.${L.year}`, kind: 'safe-movement-space', sourceEventId, choiceId: option });
  if (option === 'media') completed = recordDailyActivity(L, { id: 'personal-media', kind: 'media', status: 'completed', minutes: 15, accessConfirmed: true, sourceEventId, choiceId: option });
  if (completed) collectDailyFacts(L);
}

export const choices = { 'sys.daily.activity': chooseActivity };

export function resolveLifeEvent(L, ctx, req, optionId) {
  const event = LIFE_EVENTS.find(e => e.id === req.data?.lifeEventId);
  const option = event?.choices.find(o => o.id === optionId);
  const result = eventActions(L, event, option, ctx);
  if (!result.executed) return { executed: false, text: '현재 조건을 다시 확인해 보니 선택한 활동을 진행할 수 없었다.' };
  return result;
}

export function pauseActivities(L, sourceEventId, choiceId) {
  const latest = new Map();
  for (const item of L.dailyLife?.activities || []) latest.set(item.id, item);
  for (const item of latest.values()) if (['completed', 'resumed'].includes(item.status)) {
    recordDailyActivity(L, { id: item.id, kind: item.kind, status: 'paused', minutes: 0, sourceEventId, choiceId });
  }
}
