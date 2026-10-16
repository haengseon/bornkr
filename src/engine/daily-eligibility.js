// 생활 사건 후보의 읽기 전용 자격 검사. 조건을 통과해도 행위 실행을 승인하거나 효과를 적용하지 않는다.
import { LIFE_EVENTS } from '../content/life-events.js';
import { scenarioChoiceAvailable, scenarioChoiceDetails } from './life-event-scenarios.js';

const list = value => Array.isArray(value) ? value : [];
const finite = Number.isFinite;
const unavailable = new Set(['canceled', 'cancelled', 'failed', 'expired', 'rejected']);
const inRange = (value, range) => Array.isArray(range) && range.length === 2 &&
  finite(value) && range.every(finite) && value >= range[0] && value <= range[1];

function livingPerson(L, id) {
  if (typeof id !== 'string' || !id) return false;
  const family = L.family || {};
  const candidates = [
    ...list(L.dailyLife?.people),
    ...Object.entries(family.parents || {}).map(([key, p]) => ({ ...p, id: key })),
    ...list(family.siblingMembers),
    ...list(family.children).map((p, i) => ({ ...p, id: p.id || `child.${i}` })),
    ...(family.partner ? [{ ...family.partner, id: family.partner.id || `spouse.${family.partner.no}` }] : []),
  ];
  const person = candidates.find(p => p?.id === id);
  return !!person && person.alive === true && !person.away && !person.unborn &&
    (person.birthYear == null || finite(person.birthYear) && person.birthYear <= L.year) &&
    (person.deathYear == null || finite(person.deathYear) && person.deathYear > L.year);
}

function sourceExists(L, fact) {
  const sources = [...list(L.log), ...list(L.decisions), ...list(L.dailyLife?.history)];
  return sources.some(source => source &&
    [source.id, source.eventId, source.sourceEventId].includes(fact.sourceEventId) &&
    finite(source.year) && source.year <= fact.year &&
    !unavailable.has(source.status) && !unavailable.has(source.execution));
}

function validFact(L, fact, key) {
  if (!fact || fact.key !== key || typeof fact.id !== 'string' || !fact.id ||
      fact.status !== 'confirmed' || !finite(fact.year) || fact.year > L.year ||
      !finite(fact.validUntil) || fact.validUntil < L.year || fact.validUntil < fact.year ||
      typeof fact.sourceEventId !== 'string' || !fact.sourceEventId ||
      !fact.details || typeof fact.details !== 'object' || Array.isArray(fact.details) ||
      !sourceExists(L, fact)) return false;
  const ids = [fact.personId, fact.details.personId,
    ...list(fact.details.personIds), ...list(fact.details.participantIds)].filter(id => id != null);
  return ids.every(id => livingPerson(L, id));
}

function hasFacts(L, requires) {
  return Array.isArray(requires) && requires.every(key => typeof key === 'string' && key &&
    list(L.dailyLife?.facts).some(fact => validFact(L, fact, key)));
}

function eventContext(L, event) {
  return !!L && L.alive === true && !!event && event.ready === true &&
    inRange(L.year, event.years) && inRange(L.age, event.ages) &&
    !(Number.isFinite(L.dailyLife?.eventLastYear?.[event.id]) &&
      L.year < L.dailyLife.eventLastYear[event.id] + (event.cooldownYears || 1)) &&
    hasFacts(L, event.requires);
}

/** 구현된 선택과 실제 확인 사실을 모두 충족한 선택만 반환한다. */
export function lifeEventOptions(L, event) {
  if (!eventContext(L, event)) return [];
  return list(event.choices).filter(choice => choice && typeof choice.id === 'string' &&
    hasFacts(L, choice.requires) && choice.operation?.status === 'implemented' &&
    typeof choice.operation.actionId === 'string' && !!choice.operation.actionId &&
    (!event.scenarioProfile || scenarioChoiceAvailable(L, event, choice)))
    .map(choice => event.scenarioProfile ? scenarioChoiceDetails(L, event, choice) : choice);
}

/** 실행 가능한 선택이 둘 이상인 후보만 반환한다. 연간 공통 선택 상한은 호출자가 확인한다. */
export function eligibleLifeEvents(L) {
  if (!L || L.alive !== true || !finite(L.year) || !finite(L.age)) return [];
  return LIFE_EVENTS.filter(event => lifeEventOptions(L, event).length >= 2);
}
