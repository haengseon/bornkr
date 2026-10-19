import { SUPPORT_EVENT, SUPPORT_OPTIONS } from '../content/wellbeing.js';
import { stageOf } from './clock.js';
import { STAGE_CAP } from './tuning.js';

const enabled = L => L.modelVersion >= 2 && L.age >= 19 && L.alive;
export function ensureWellbeing(L) {
  const w = L.wellbeing ||= {};
  w.identityRecovery ||= []; w.history ||= []; w.pending ||= []; w.sources ||= [];
  w.happinessYears ||= {}; w.nextSupportYear ??= null;
  return w;
}
function familyContact(L) {
  const people = Object.entries(L.family?.parents || {}).map(([id, member]) => ({ id, member, label: id === 'mother' ? '어머니' : '아버지' }));
  if (L.family?.partner) people.push({ id: `spouse.${L.family.partner.no}`, label: '배우자', member: L.family.partner });
  return people.filter(p => p.member.alive === true && !p.member.away && p.member.bond >= 30);
}
const personalMinutes = L => L.dailyLife?.summary?.year === L.year ? L.dailyLife.summary.time?.personal ?? 0 : 0;
const confirmedFacts = L => (L.dailyLife?.facts || []).filter(f => f.status === 'confirmed' && f.year <= L.year && f.validUntil >= L.year);
function record(L, ctx, item) {
  const w = ensureWellbeing(L);
  if (w.history.some(e => e.id === item.id)) return;
  w.history.push({ ...item, year: L.year });
  ctx?.emit?.({ kind: 'personal', ...item });
}

export function refreshEvidence(L) {
  const w = ensureWellbeing(L), facts = confirmedFacts(L);
  // 실제 이행 실패를 만든 적 없이 선택 부담 수치에서 지각·결근을 역산하지 않는다.
  w.identityEvidence = { year: L.year,
    sleepShortfall: facts.some(f => f.key === 'sleep.shortfall'),
    routineFailures: facts.some(f => f.key === 'routine.failure'),
    workload: facts.some(f => f.key === 'work.overload' || f.key === 'care.overload'),
    recoveryUnavailable: facts.some(f => f.key === 'recovery.unavailable') };
  w.sources = facts.filter(f => ['sleep.shortfall', 'routine.failure', 'work.overload', 'care.overload', 'recovery.unavailable'].includes(f.key))
    .map(f => ({ id: f.id, sourceEventId: f.sourceEventId, year: f.year, key: f.key }));
  return w;
}

export function step(L, ctx) {
  if (!enabled(L)) return;
  const w = refreshEvidence(L);
  const identity = L.identityStrain;
  const needsSupport = identity?.concern || (identity?.stress >= 8 && identity?.confusion >= 4);
  const stage = stageOf(L.age).id;
  if (!needsSupport || w.nextSupportYear > L.year || L.pending || L.yr?.asked || (L.stageChoices?.[stage]?.sys ?? 0) >= STAGE_CAP[stage].sys) return;
  const contact = familyContact(L)[0];
  ctx.ask({ eventId: SUPPORT_EVENT, prompt: '마음에 부담이 쌓였다. 지금 가능한 도움과 휴식을 어떻게 살필까?',
    options: SUPPORT_OPTIONS.map(o => ({ ...o, personality: { weights: {} }, feasible: o.id === 'rest' ? personalMinutes(L) >= 15 : o.id === 'contact' ? !!contact : true })),
    defaultId: 'keep', data: { personId: contact?.id, personLabel: contact?.label } });
}

function chooseSupport(L, ctx, option, data = {}) {
  if (!enabled(L)) return;
  const w = ensureWellbeing(L), id = `wellbeing:${L.year}:${option}`;
  if (w.history.some(e => e.id === id)) return;
  w.nextSupportYear = L.year + 3;
  if (option === 'rest' && personalMinutes(L) >= 15) {
    w.pending.push({ id: `${id}:completion`, kind: 'rest', sourceEventId: SUPPORT_EVENT, choiceYear: L.year, dueYear: L.year + 1, status: 'planned' });
    record(L, ctx, { id, text: '짧게 쉬는 일정을 잡았다.' });
  } else if (option === 'contact' && familyContact(L).some(p => p.id === data.personId)) {
    w.pending.push({ id: `${id}:reply`, kind: 'support-request', personId: data.personId, sourceEventId: SUPPORT_EVENT, choiceYear: L.year, dueYear: L.year + 1, status: 'awaiting-consent' });
    record(L, ctx, { id, text: `${data.personLabel || '가족'}에게 도움을 청했다. 답은 아직 없었다.` });
  } else record(L, ctx, { id, text: '당장은 생활을 바꾸지 않고 지내기로 했다.' });
}
export const choices = { [SUPPORT_EVENT]: chooseSupport };

// daily-life의 최신 시간 예산 확정 뒤, identityYear보다 먼저 실행한다.
export function settleYear(L, ctx) {
  if (!enabled(L)) return;
  const w = refreshEvidence(L), facts = confirmedFacts(L);
  for (const item of w.pending) {
    if (!['planned', 'awaiting-consent'].includes(item.status) || item.dueYear > L.year) continue;
    if (item.kind === 'rest') {
      if (personalMinutes(L) < 15) {
        item.status = 'canceled'; item.resolvedAt = L.year;
        record(L, ctx, { id: item.id, text: '일과 돌봄 뒤의 시간이 부족해 예정한 휴식을 이어가지 못했다.' });
        continue;
      }
      const time = L.dailyLife.summary.time;
      time.personal -= 15; time.recovery = (time.recovery || 0) + 15;
      item.status = 'completed'; item.resolvedAt = L.year;
      w.identityRecovery.push({ id: item.id, year: L.year, stress: 2, confusion: 1 });
      record(L, ctx, { id: item.id, text: '남는 시간에 잡아 둔 짧은 휴식 일정을 이어갔다.' });
    } else {
      if (!familyContact(L).some(p => p.id === item.personId)) {
        item.status = 'canceled'; item.resolvedAt = L.year;
        record(L, ctx, { id: item.id, text: '연락 여건이 달라져 가족에게 요청한 지원을 이어가지 않았다.' });
        continue;
      }
      const received = facts.find(f => f.key === 'support.received' && f.personId === item.personId && f.requestId === item.id && f.year > item.choiceYear);
      if (!received) continue; // 요청/동의만으로 회복을 지급하지 않는다.
      item.status = 'completed'; item.resolvedAt = L.year;
      w.identityRecovery.push({ id: item.id, year: L.year, stress: 2, confusion: 1 });
      record(L, ctx, { id: item.id, text: '앞서 청한 가족의 도움을 받았다.' });
    }
  }
}

// identityYear의 회복·후보 평가 뒤 실행. 같은 연도 행복 차감은 총 -3 이내.
export function finishYear(L, ctx) {
  if (!enabled(L)) return;
  const w = ensureWellbeing(L);
  if (Object.hasOwn(w.happinessYears, L.year)) return;
  const stage = L.identityStrain?.stage;
  const requested = stage === 'exhaustion-candidate' ? 3 : stage === 'low-energy-candidate' ? 1 : 0;
  const before = L.stats.happiness;
  const delta = Math.min(3, requested, Math.max(0, before));
  w.happinessYears[L.year] = delta;
  if (!delta) return;
  // ctx.apply는 성향 배율로 연간 상한을 넘길 수 있어 실제 감소량을 직접 고정한다.
  L.stats.happiness = before - delta;
  const reason = { year: L.year, age: L.age, text: '실제로 이어진 생활 이행의 어려움과 회복 부족', delta: -delta };
  const reasons = (L.reasons ||= {}).happiness ||= [];
  reasons.push(reason); if (reasons.length > 12) reasons.shift();
  record(L, ctx, { id: `wellbeing:happiness:${L.year}`, text: `일상에서 힘을 내기 어려운 상태가 이어져 행복이 ${delta} 줄었다.`, effects: { stats: { happiness: -delta } } });
}
