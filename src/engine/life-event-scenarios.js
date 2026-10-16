// 현재 장면을 새로 제시하는 게임 시나리오. 통계 발생률·관측 사실로 해석하지 않는다.
import { LIFE_EVENTS } from '../content/life-events.js';
import { hashSeed, makeRng, rand } from './rng.js';

const working = L => ['employed', 'self'].includes(L.job?.status);
const married = L => !!L.family?.partner && L.family.partner.alive !== false;
const parents = L => Object.values(L.family?.parents || {}).some(p => p.alive === true && !p.away);
const studying = L => ['elem', 'middle', 'high', 'retake', 'college', 'grad'].includes(L.edu?.stage);
const independent = L => L.home?.parents === false;
const list = v => Array.isArray(v) ? v : [];
const knownPerson = L => list(L.dailyLife?.people).find(p => p.alive && p.metYear < L.year &&
  list(L.dailyLife?.contacts).some(c => c.personId === p.id && c.status === 'completed'));
const cash = L => Math.max(0, L.money?.assets || 0);
const world = L => L.dailyLife?.world || {};
const owned = (L, kind) => list(world(L).inventory).find(i => i.kind === kind && i.ownedYear <= L.year);
const step = (kind, minutes = 10, cost = 0, extra = {}) => ({ kind, minutes, cost, ...extra });
const request = (minutes = 15, cost = 0, extra = {}) => step('request', minutes, cost, extra);
const hold = () => step('hold', 0);
const note = (minutes = 10) => step('record', minutes);

// 각 행의 a/b/c는 원본 선택의 순서를 따른다. 금액은 2025년 실질 만원, 시간이동은 게임 장면의 분이다.
// 계약 없는 대출·진단·지원금·보증·이직·퇴거를 이 표에서 새로 만들지 않는다.
export const SCENARIO_PROFILES = {
  'LIFE-001': { when: L => studying(L) && world(L).schoolRoute?.walkSafe && parents(L) && L.household?.netWorth < L.household?.income, steps: [step('rule', 20, 0, { record: 'walk-to-school', change: 'commute', minutesChange: 15 }), request(15), request(15)], scope: 'education' },
  'LIFE-002': { when: L => studying(L) && list(world(L).ownedBooks).length > 0, steps: [request(15, 0, { record: 'textbook-exchange' }), request(20), hold()], scope: 'education', introduceClassmate: true },
  'LIFE-003': { when: L => studying(L) && !working(L) && parents(L), steps: [note(25), note(20), request(20)], scope: 'education' },
  'LIFE-004': { when: L => studying(L) && L.edu.tutoring > 0 && L.household?.netWorth < L.household?.income, steps: [step('rule', 10, 0, { change: 'tutoring', tutoringDelta: -1 }), note(20), step('rule', 15, 0, { record: 'discretionary-budget-reviewed' })], scope: 'education' },
  'LIFE-006': { when: L => studying(L) && working(L), steps: [request(15), step('rule', 5, 0, { record: 'extra-shift-declined' }), request(20)], scope: 'job' },
  'LIFE-010': { when: L => studying(L) && parents(L), steps: [request(15), request(10), step('expense', 20, 1, { record: 'school-project-materials' })], scope: 'education' },
  'LIFE-007': { when: L => L.job?.status === 'seeking' && cash(L) >= 5, steps: [step('expense', 30, 5, { record: 'exam-registered' }), step('expense', 45, 10, { record: 'two-exams-registered' }), hold()], scope: 'job', noAutomaticQualification: true },
  'LIFE-009': { when: L => working(L) && cash(L) >= 12, steps: [step('expense', 40, 12, { record: 'course-enrolled' }), request(15), hold()], scope: 'job', noAutomaticQualification: true },
  'LIFE-012': { when: L => L.job?.status === 'employed', steps: [step('practice', 30), request(15), request(20)], scope: 'job' },
  'LIFE-013': { when: L => L.job?.status === 'employed', steps: [request(20, 0, { change: 'commute', minutesChange: 20 }), note(30), request(30, 0, { record: 'application-requested' })], scope: 'job' },
  'LIFE-014': { when: L => L.job?.status === 'employed' && L.job.years >= 5, steps: [request(25, 0, { record: 'retirement-terms-review' }), request(15), request(30)], scope: 'job' },
  'LIFE-018': { when: L => L.job?.status === 'employed' && L.job.years >= 3, steps: [request(20, 0, { record: 'role-accepted', change: 'workload', minutesChange: 20 }), request(25), hold()], scope: 'job' },
  'LIFE-020': { when: L => L.job?.status === 'employed' && married(L), steps: [request(20), request(15), step('expense', 45, 3)], scope: 'job' },
  'LIFE-022': { when: L => ['coal', 'oil'].includes(world(L).heating?.kind) && world(L).heating.fuelStock < 2, steps: [step('expense', 20, 0, { costFrom: 'fuel-bulk', record: 'fuel-bulk' }), step('expense', 15, 0, { costFrom: 'fuel-first', record: 'fuel-first' }), request(20, 0, { costFrom: 'fuel-group', record: 'fuel-shared' })], scope: 'home', introduceNeighbor: true },
  'LIFE-023': { when: L => ['monthly', 'jeonse', 'public'].includes(L.home?.tenure) && independent(L) && L.home.contractEnd <= L.year, steps: [request(20), note(30), request(15, 0, { record: 'renewal-requested' })], scope: 'home' },
  'LIFE-025': { when: L => independent(L) && ['monthly', 'jeonse', 'public'].includes(L.home?.tenure), steps: [request(20), step('expense', 15, 2, { record: 'temporary-leak-protection' }), request(20)], scope: 'home' },
  'LIFE-027': { when: L => independent(L) && ['monthly', 'jeonse', 'own', 'public'].includes(L.home?.tenure), steps: [request(15), request(20), step('expense', 25, 2, { record: 'sleep-space-adjusted' })], scope: 'home' },
  'LIFE-031': { when: L => parents(L) && independent(L) && cash(L) >= 10, steps: [step('transfer', 10, 10, { person: 'parent' }), request(10, 5, { person: 'parent' }), hold()], scope: 'family' },
  'LIFE-033': { when: L => !!owned(L, 'appliance'), steps: [step('expense', 20, 0, { costFrom: 'repair', record: 'appliance-repaired' }), step('expense', 30, 0, { costFrom: 'replacement', record: 'appliance-replaced' }), request(20, 0, { record: 'appliance-sharing' })], scope: 'home', targetItem: 'appliance' },
  'LIFE-041': { when: L => L.home?.parents && list(L.family?.siblingMembers).some(s => s.alive && s.birthYear === L.year), steps: [request(10, 0, { person: 'parent' }), step('help', 10), hold()], scope: 'family' },
  'LIFE-042': { when: L => world(L).sharedSpace?.siblingId && list(L.family?.siblingMembers).some(s => s.id === world(L).sharedSpace.siblingId && s.alive && s.birthYear <= L.year) && world(L).sharedSpace.conflictRecorded === true, steps: [request(20), step('rule', 30, 0, { needs: 'alternate-space', record: 'alternate-study-space' }), request(20, 0, { costFrom: 'partition', record: 'shared-space-partition' })], scope: 'home' },
  'LIFE-043': { when: L => independent(L) && parents(L) && working(L), steps: [request(20, 0, { person: 'parent' }), step('expense', 45, 4, { person: 'parent', record: 'short-family-visit' }), request(10, 0, { person: 'parent' })], scope: 'family' },
  'LIFE-044': { when: L => working(L) && married(L) && L.family.partner.income > 0, steps: [request(20, 0, { person: 'partner', change: 'chores' }), note(20), request(20, 0, { person: 'partner', change: 'chores' })], scope: 'family' },
  'LIFE-049': { when: L => list(L.family?.children).some(c => c.alive && c.leftHome && L.year - c.birthYear >= 19) && cash(L) >= 20, steps: [step('transfer', 10, 20, { person: 'child' }), request(20, 0, { person: 'child' }), step('help', 60, 0, { person: 'child' })], scope: 'family' },
  'LIFE-050': { when: L => Object.values(L.family?.parents || {}).some(p => p.deathYear === L.year) || list(L.family?.siblingMembers).some(p => p.deathYear === L.year), steps: [request(20), note(20), request(15)], scope: 'family' },
  'LIFE-051': { when: L => !!knownPerson(L), steps: [step('rule', 10, 0, { record: 'letter-promise' }), step('expense', 15, .2, { record: 'phone-contact' }), note(10)], scope: 'social', existingPerson: true },
  'LIFE-053': { when: L => !!knownPerson(L) && cash(L) >= 5, steps: [request(15), step('loan', 15, 5, { record: 'personal-loan' }), hold()], scope: 'social', existingPerson: true },
  'LIFE-055': { when: L => !!knownPerson(L) && cash(L) < 100, steps: [step('expense', 15, 2, { record: 'celebration' }), request(30), note(10)], scope: 'social', existingPerson: true },
  'LIFE-056': { when: L => !!knownPerson(L), steps: [request(20), step('wait', 0), step('rule', 5, 0, { record: 'contact-boundary' })], scope: 'social', existingPerson: true },
  'LIFE-057': { when: L => list(L.dailyLife?.socialGroups).some(g => g.joinedYear <= L.year), steps: [note(20), request(15), step('rule', 5, 0, { record: 'discussion-ended' })], scope: 'social' },
  'LIFE-058': { when: L => !!knownPerson(L) && list(L.dailyLife?.contacts).some(c => c.promise && c.year <= L.year - 2), steps: [request(20, 1), step('rule', 10, 0, { record: 'contact-renewed' }), note(5)], scope: 'social', existingPerson: true },
  'LIFE-059': { when: L => working(L) || list(L.dailyLife?.activities).some(a => a.status === 'completed'), steps: [step('introduction', 20), request(15), hold()], scope: 'social', introducePerson: true },
  'LIFE-061': { when: L => list(L.health?.conditions).some(c => c.active), steps: [request(25, 0, { record: 'appointment-requested' }), note(20), hold()], scope: 'health' },
  'LIFE-063': { when: L => L.health?.smoker > 0, steps: [request(20, 0, { record: 'cessation-support-requested' }), step('rule', 10, 0, { record: 'smoking-boundary' }), hold()], scope: 'health' },
  'LIFE-066': { when: L => working(L) && list(L.health?.conditions).some(c => c.active) && list(L.dailyLife?.careSchedules).some(c => c.year === L.year && c.kind === 'prescription'), steps: [request(20), request(15), request(20)], scope: 'health' },
  'LIFE-068': { when: L => L.identityStrain?.stress >= 6 || L.stats?.happiness < 35, steps: [request(20, 0, { person: 'parent-or-partner' }), note(20), step('rest', 20)], scope: 'health' },
  'LIFE-071': { when: L => L.age >= 15 && cash(L) >= 2, steps: [request(20, 2, { person: 'partner' }), step('expense', 60, 2, { record: 'solo-film-visit' }), hold()], scope: 'leisure' },
  'LIFE-073': { when: L => !!owned(L, 'instrument'), steps: [request(20, 0, { record: 'practice-time-agreement' }), request(20, 1, { record: 'shared-practice-space' }), note(20)], scope: 'home', targetItem: 'instrument' },
  'LIFE-074': { when: L => list(L.dailyLife?.activities).some(a => a.status === 'completed'), steps: [request(20, 2, { record: 'hobby-group-application' }), request(15, 1), step('practice', 20)], scope: 'leisure' },
  'LIFE-079': { when: L => L.age >= 19 && independent(L), steps: [request(20, 3, { record: 'garden-participation' }), request(15), step('practice', 20)], scope: 'home' },
  'LIFE-081': { when: L => world(L).digital?.phone && (L.home?.parents || married(L)), steps: [request(15), step('rule', 10, 0, { record: 'phone-time-rescheduled' }), step('expense', 25, .1, { record: 'external-phone-used' })], scope: 'home' },
  'LIFE-082': { when: L => (studying(L) || working(L)) && (world(L).digital?.internet || world(L).access?.publicInternet), steps: [step('expense', 30, .3, { record: 'public-internet-used', needs: 'public-internet' }), note(20), step('help', 30)], scope: 'digital' },
  'LIFE-083': { when: L => world(L).digital?.phone && Number.isFinite(world(L).digital.planMonthly) && world(L).digital.usageLow === true, steps: [request(15, 0, { record: 'phone-plan-change' }), hold(), note(20)], scope: 'digital' },
  'LIFE-084': { when: L => !!world(L).digital?.accountId, steps: [note(15), step('rule', 15, 0, { record: 'account-authentication-updated' }), request(20, 0, { person: 'parent-or-partner' })], scope: 'digital' },
  'LIFE-085': { when: L => L.year >= 2010 && list(L.dailyLife?.activities).some(a => a.kind === 'media'), steps: [note(15), step('rule', 5, 0, { record: 'unverified-message-blocked' }), request(15, 0, { person: 'parent-or-partner' })], scope: 'digital' },
  'LIFE-088': { when: L => L.year >= 2010 && independent(L) && cash(L) >= 3, steps: [step('expense', 10, 3, { record: 'delivery-purchased' }), step('expense', 40, 2, { record: 'in-person-purchased' }), hold()], scope: 'home' },
  'LIFE-089': { when: L => L.year >= 2005 && working(L), steps: [step('practice', 30), request(20), request(20)], scope: 'job' },
  'LIFE-087': { when: L => world(L).digital?.phone && !!knownPerson(L), steps: [request(15, 0, { record: 'photo-sharing-consent' }), step('rule', 5, 0, { record: 'photo-kept-private' }), request(15, 0, { record: 'photo-edit-consent' })], scope: 'social', existingPerson: true },
  'LIFE-092': { when: L => independent(L) && (working(L) || studying(L)), steps: [step('rule', 20, 0, { record: 'temporary-detour' }), note(15), request(15)], scope: 'home' },
  'LIFE-093': { when: L => list(L.dailyLife?.localVisits).some(v => v.region === L.home?.region && v.year >= L.year - 2), steps: [step('rule', 20, 0, { record: 'visit-time-adjusted' }), note(25), request(15)], scope: 'home' },
  'LIFE-097': { when: L => list(L.dailyLife?.people).some(p => p.alive && p.role === 'neighbor' && p.region === L.home?.region), steps: [step('help', 30), request(15), hold()], scope: 'home' },
  'LIFE-096': { when: L => L.age >= 19, steps: [step('help', 120), request(20), hold()], scope: 'home' },
};

export const SCENARIO_RATE = .22; // 게임의 연간 장면 예산. 현실 발생률이 아니다.
// FNV 시드를 확률값으로 직접 쓰면 인접 연도의 결과가 강하게 묶인다. 독립 로컬 난수로 섞는다.
const hash = (...v) => rand(makeRng(hashSeed(...v)));
const scopeSnapshot = (L, scope) => ({ scope, jobCode: L.job?.code, jobStatus: L.job?.status,
  partnerNo: L.family?.partner?.no, region: L.home?.region, moves: L.home?.moves?.length || 0,
  education: L.edu?.stage, actorId: L.name });
const sameScope = (L, s) => s && (!s.personId || list(L.dailyLife?.people).some(p => p.id === s.personId && p.alive === true)) &&
  (!s.targetItemId || list(world(L).inventory).some(i => i.id === s.targetItemId && i.owned !== false && !(Number.isFinite(i.disposedYear) && i.disposedYear <= L.year))) &&
  (!s.parentKey || L.family?.parents?.[s.parentKey]?.alive === true) &&
  (s.childIndex == null || L.family?.children?.[s.childIndex]?.alive === true) &&
  (s.scope !== 'job' || s.jobCode === L.job?.code && s.jobStatus === L.job?.status) &&
  (s.scope !== 'education' || s.education === L.edu?.stage && s.region === L.home?.region && s.moves === (L.home?.moves?.length || 0)) &&
  (s.scope !== 'home' || s.region === L.home?.region && s.moves === (L.home?.moves?.length || 0)) &&
  (s.scope !== 'family' || s.partnerNo === L.family?.partner?.no);

export function scenarioAvailableMinutes(L) {
  if (L.dailyLife?.summary?.year === L.year) return Math.max(0, L.dailyLife.summary.time?.personal || 0);
  return studying(L) ? 90 : working(L) ? 60 : 120; // 장면 예산용 게임 가정, 관측 생활시간이 아니다.
}

function participant(L, person) {
  if (!person) return true;
  if (person === 'partner') return married(L);
  if (person === 'parent') return parents(L);
  if (person === 'child') return list(L.family?.children).some(c => c.alive && c.leftHome);
  return parents(L) || married(L);
}

function resolvedRule(L, event, original) {
  const rule = { ...original };
  const profile = SCENARIO_PROFILES[event.id];
  const targetId = L.dailyLife?.scenarios?.[event.id]?.context?.targetItemId;
  const item = targetId ? list(world(L).inventory).find(i => i.id === targetId) : owned(L, profile.targetItem);
  if (rule.costFrom === 'repair') rule.cost = item?.repairQuote;
  if (rule.costFrom === 'replacement') rule.cost = item?.replacementQuote;
  if (rule.costFrom === 'partition') rule.cost = world(L).sharedSpace?.partitionQuote;
  if (rule.costFrom?.startsWith('fuel-')) {
    const quantity = rule.costFrom === 'fuel-bulk' ? 4 : rule.costFrom === 'fuel-group' ? 2 : 1;
    rule.quantity = quantity;
    rule.cost = world(L).heating?.unitQuote * quantity;
  }
  return rule;
}

function ruleAvailable(L, event, original) {
  const rule = resolvedRule(L, event, original);
  return Number.isFinite(rule.cost) && rule.cost >= 0 && rule.cost <= cash(L) &&
    rule.minutes <= scenarioAvailableMinutes(L) && participant(L, rule.person) &&
    (rule.needs !== 'alternate-space' || world(L).sharedSpace?.otherPlaceAvailable === true) &&
    (rule.needs !== 'public-internet' || world(L).access?.publicInternet === true);
}

/** 실행 직전 현재 견적을 표시한다. 원본 선택의 성향 가중치는 바꾸지 않는다. */
export function scenarioChoiceDetails(L, event, choice) {
  const profile = SCENARIO_PROFILES[event.id];
  const rule = resolvedRule(L, event, profile.steps[event.choices.findIndex(c => c.id === choice.id)]);
  return { ...choice, operation: { ...choice.operation, ...rule },
    hint: `${choice.text} · 시간 ${rule.minutes}분${rule.cost ? ` · ${rule.cost}만 원${rule.kind === 'request' ? '(승인 뒤)' : ''}` : ' · 추가 비용 없음'}` };
}

export function scenarioChoiceAvailable(L, event, choice) {
  const profile = SCENARIO_PROFILES[event.id];
  const scene = L.dailyLife?.scenarios?.[event.id];
  const index = event.choices.findIndex(c => c.id === choice.id);
  const rule = profile?.steps[index];
  return !!profile && !!rule && !!scene && scene.year === L.year && scene.status === 'open' &&
    profile.when(L) && sameScope(L, scene.context) && ruleAvailable(L, event, rule);
}

/** 준비는 과거를 소급하지 않고 그해의 새 제안·관측 장면 한 개만 생성한다. */
export function prepareLifeEventScenarios(L, ctx = {}) {
  const d = L.dailyLife;
  if (!d || !L.alive || L.modelVersion < 2 || L.year < 1960) return null;
  d.scenarios ||= {};
  if (d.scenarioPreparedYear === L.year) return Object.values(d.scenarios).find(s => s.year === L.year && s.status === 'open') || null;
  d.scenarioPreparedYear = L.year;
  if (hash(L.seed, 'life-scenario-rate', L.year) >= SCENARIO_RATE) return null;
  const candidates = LIFE_EVENTS.filter(e => SCENARIO_PROFILES[e.id] && e.ready &&
    L.year >= e.years[0] && L.year <= e.years[1] && L.age >= e.ages[0] && L.age <= e.ages[1] &&
    SCENARIO_PROFILES[e.id].when(L) && !(d.eventLastYear?.[e.id] > L.year - (e.cooldownYears || 4)) &&
    SCENARIO_PROFILES[e.id].steps.filter(s => ruleAvailable(L, e, s)).length >= 2);
  if (!candidates.length) return null;
  const domainCount = domain => list(d.scenarioActions).filter(a => LIFE_EVENTS.find(e => e.id === a.eventId)?.domain === domain).length;
  const eventCount = id => list(d.scenarioActions).filter(a => a.eventId === id).length;
  candidates.sort((a, b) => domainCount(a.domain) - domainCount(b.domain) ||
    eventCount(a.id) - eventCount(b.id) || (d.eventLastYear?.[a.id] || 0) - (d.eventLastYear?.[b.id] || 0) ||
    hash(L.seed, L.year, a.id) - hash(L.seed, L.year, b.id));
  const event = candidates[0], sourceEventId = `scenario.${event.id}.${L.year}`;
  const profile = SCENARIO_PROFILES[event.id];
  const scene = { id: sourceEventId, eventId: event.id, year: L.year, status: 'open',
    context: scopeSnapshot(L, profile.scope), evidenceLevel: 'fictional-current-scene',
    text: event.text, probabilityKind: 'game-tuning-not-statistics' };
  d.scenarios[event.id] = scene;
  if (profile.targetItem) {
    const item = owned(L, profile.targetItem);
    scene.context.targetItemId = item.id;
    if (event.id === 'LIFE-033') { item.working = false; item.breakdownYear = L.year; }
  }
  if (profile.introduceClassmate) {
    const id = `classmate.${sourceEventId}`;
    (d.people ||= []).push({ id, name: '같은 반에서 새로 이야기한 학생', alive: true,
      role: 'classmate', metYear: L.year, sourceEventId, region: L.home?.region });
    scene.personId = id;
    scene.context.personId = id;
    scene.context.bookId = world(L).ownedBooks[0].id;
  }
  if (profile.existingPerson) {
    scene.personId = knownPerson(L).id;
    scene.context.personId = scene.personId;
    if (event.id === 'LIFE-051') scene.context.moveNotice = { year: L.year, personId: scene.personId };
    if (event.id === 'LIFE-053') scene.context.loanRequest = { year: L.year, amount: 5, personId: scene.personId };
  }
  if (profile.introducePerson) {
    const id = `person.${sourceEventId}`;
    (d.people ||= []).push({ id, name: working(L) ? '새로 인사한 직장 동료' : '활동에서 처음 만난 사람',
      alive: true, role: working(L) ? 'colleague' : 'activity-acquaintance',
      metYear: L.year, sourceEventId, region: L.home?.region });
    scene.personId = id;
    scene.context.personId = id;
  }
  if (profile.introduceNeighbor) {
    const id = `neighbor.${sourceEventId}`;
    (d.people ||= []).push({ id, name: '공동 주문 이야기를 나눈 이웃', role: 'neighbor',
      alive: true, metYear: L.year, region: L.home?.region, sourceEventId });
    scene.personId = id; scene.context.personId = id;
  }
  d.history.push({ ...scene, kind: 'scenario-created', status: 'confirmed' });
  const required = new Set([...(event.requires || []), ...event.choices.flatMap(c => c.requires || [])]);
  for (const key of required) {
    d.facts.push({ id: `${sourceEventId}:${key}`, key, year: L.year, validUntil: L.year, sourceEventId,
      status: 'confirmed', details: { scenarioId: sourceEventId, eventId: event.id, fictional: true } });
  }
  return scene;
}

export function performScenarioChoice(L, event, choice) {
  if (!scenarioChoiceAvailable(L, event, choice)) return null;
  const d = L.dailyLife, profile = SCENARIO_PROFILES[event.id];
  const rule = resolvedRule(L, event, profile.steps[event.choices.findIndex(c => c.id === choice.id)]);
  const scene = d.scenarios[event.id];
  if (rule.minutes && d.summary?.year === L.year) {
    d.summary.time.personal -= rule.minutes;
    d.summary.time.activity = (d.summary.time.activity || 0) + rule.minutes;
  }
  const requested = rule.kind === 'request';
  // 요청 단계에서는 견적 금액을 차감하지 않는다. 승인 뒤 실제 실행 시에만 차감한다.
  if (!requested && rule.cost) L.money.assets -= rule.cost;
  if (!requested) applyRecordedChange(L, { rule, context: scene.context, eventId: event.id });
  if (rule.kind === 'loan') (d.personalLoans ||= []).push({ id: `${scene.id}:loan`, personId: scene.personId,
    principal: rule.cost, outstanding: rule.cost, since: L.year, dueYear: L.year + 2, status: 'outstanding' });
  if (!requested && rule.change === 'tutoring') L.edu.tutoring = Math.max(0, L.edu.tutoring + rule.tutoringDelta);
  scene.status = requested ? 'requested' : 'executed';
  const record = { eventId: event.id, optionId: choice.id, label: choice.label,
    rule: { ...rule }, context: { ...scene.context }, status: scene.status, year: L.year,
    spent: requested ? 0 : rule.cost, minutes: rule.minutes };
  if (rule.person === 'parent') record.context.parentKey = Object.keys(L.family.parents).find(key => L.family.parents[key].alive && !L.family.parents[key].away);
  if (rule.person === 'child') record.context.childIndex = L.family.children.findIndex(c => c.alive && c.leftHome);
  (d.scenarioActions ||= []).push(record);
  if (scene.personId && ['introduction', 'record', 'rule', 'expense', 'loan'].includes(rule.kind)) {
    (d.contacts ||= []).push({ id: `${scene.id}:${choice.id}`, personId: scene.personId, year: L.year,
      kind: rule.record || rule.kind, status: 'completed', promise: rule.record === 'letter-promise' });
    if (rule.kind === 'introduction') (d.socialGroups ||= []).push({ id: `group.${scene.id}`, joinedYear: L.year, personId: scene.personId });
  }
  const immediate = requested ? `${choice.label} 쪽으로 요청을 전했다. ${choice.text}는 상대의 확인·승인이 필요하며 아직 적용되지 않았다.` :
    rule.kind === 'hold' ? `${choice.label}. 이번에는 추가 비용과 새 약속을 만들지 않았다.` :
      `${choice.label}. ${choice.text}${rule.cost ? ` · ${rule.cost}만 원을 실제로 썼다.` : ''}${rule.minutes ? ` · 개인 시간 ${rule.minutes}분을 배분했다.` : ''}`;
  return { text: immediate, scenarioId: scene.id, requested, scenarioRecord: record };
}

export const scenarioOutcomeHandler = {
  eligible(L, item) {
    const r = item.scenarioRecord;
    return L.alive && r && !!SCENARIO_PROFILES[r.eventId] && sameScope(L, r.context) &&
      participant(L, r.rule.person) && (r.rule.kind !== 'request' || cash(L) >= r.rule.cost);
  },
  apply(L, item) {
    const d = L.dailyLife, r = item.scenarioRecord;
    d.scenarioSettled ||= {};
    if (d.scenarioSettled[item.id]) return;
    d.scenarioSettled[item.id] = { year: L.year };
    const accepted = r.rule.kind !== 'request' || hash(L.seed, item.id, 'scenario-response') < .7;
    const status = accepted ? 'approved' : 'declined';
    d.history.push({ id: `${item.id}:response`, year: L.year, kind: 'scenario-response',
      eventId: r.eventId, status, text: accepted ? '요청한 방식을 확인하고 가능한 범위에서 받아들이기로 했다.' : '요청한 방식을 받아들이기 어려워 기존 상태를 유지했다.',
      evidenceLevel: 'fictional-response-game-tuning' });
    if (!accepted) return;
    if (r.rule.kind === 'request' && r.rule.cost) L.money.assets -= r.rule.cost;
    if (r.rule.kind === 'request') applyRecordedChange(L, r);
    const executed = { id: `${item.id}:executed`, year: L.year, kind: 'scenario-executed',
      eventId: r.eventId, status: 'confirmed', record: r.rule.record || null,
      text: `${r.label}에 따른 절차를 이행했다. ${r.rule.record?.includes('exam') ? '응시 접수 기록이며 합격·자격 취득 기록은 아니다.' : r.rule.record?.includes('course') ? '수강 기록이며 수료·채용·승진을 뜻하지 않는다.' : '실제 비용과 일정 기록을 남겼다.'}` };
    if (r.rule.change) {
      (d.scheduleChanges ||= []).push({ id: executed.id, year: L.year, kind: r.rule.change,
        minutes: r.rule.minutesChange || 0, eventId: r.eventId, status: 'approved',
        originJobCode: L.job?.code, originJobStatus: L.job?.status,
        originHomeKey: [L.home?.region, L.home?.sigungu, L.home?.dong, L.home?.tenure, L.home?.moves?.length || 0].join('|') });
    }
    d.history.push(executed);
  },
};

function applyRecordedChange(L, record) {
  const { rule, context } = record;
  if (rule.record === 'appliance-repaired' || rule.record === 'appliance-replaced') {
    const item = list(world(L).inventory).find(i => i.id === context.targetItemId);
    if (item) { item.working = true; item.repairedYear = L.year; if (rule.record === 'appliance-replaced') item.replacedYear = L.year; }
  }
  if (rule.record?.startsWith('fuel-') && world(L).heating) world(L).heating.fuelStock += rule.quantity;
  if (rule.record === 'photo-kept-private') (L.dailyLife.photoSettings ||= {})[context.personId] = 'private';
  if (rule.record === 'photo-sharing-consent' || rule.record === 'photo-edit-consent') {
    (L.dailyLife.photoConsents ||= []).push({ year: L.year, personId: context.personId, scope: rule.record });
  }
}
