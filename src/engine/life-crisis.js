import { CRISIS_EVENTS } from '../content/life-crisis.js';

const live = L => L?.modelVersion >= 2 && L.age >= 19 && L.alive === true;
const activeYear = (e, L, span = 4) => Number.isInteger(e.year) && e.year <= L.year && e.year >= L.year - span;
export function ensureCrisis(L) {
  const c = L.lifeCrisis ||= {};
  c.history ||= []; c.losses ||= []; c.work ||= null; c.family ||= null;
  c.social ||= { contact: null, missedReplies: 0, desiredContact: false, excluded: false, isolatedSince: null };
  c.support ||= []; c.annual ||= {}; c.nextSocialYear ??= L.year;
  return c;
}
const jobKey = L => L.job?.status === 'employed' ? `${L.job.code}:${L.job.history?.length ?? 0}:${L.job.history?.at(-1)?.from ?? ''}` : null;
const spouseKey = L => L.family?.married && L.family.partner?.alive !== false ? `${L.family.partner.no}:${L.family.partner.since}` : null;
const currentTime = L => L.dailyLife?.summary?.year === L.year ? L.dailyLife.summary.time : null;
const freeTime = L => currentTime(L)?.personal ?? 0;
function recorded(L, ctx, row) {
  const c = ensureCrisis(L);
  if (c.history.some(e => e.id === row.id)) return false;
  const entry = { year: L.year, status: 'confirmed', kind: 'life-crisis', sourceEventId: 'sys.crisis.state', ...row };
  c.history.push(entry);
  ctx?.emit?.({ ...entry, kind: 'personal', gameScenario: true });
  return true;
}
function result(L, ctx, eventId, optionId, text, extra = {}) {
  return recorded(L, ctx, { id: `${eventId}:${L.year}:${optionId}`, sourceEventId: eventId, choiceId: optionId, text, ...extra });
}
function fact(L, key, sourceEventId, choiceId, extra = {}) {
  if (!L.dailyLife) return;
  const f = L.dailyLife.facts ||= [], id = `crisis.fact:${L.year}:${key}:${extra.requestId || choiceId}`;
  if (!f.some(e => e.id === id)) f.push({ id, key, sourceEventId, choiceId, year: L.year, validUntil: L.year + 1, status: 'confirmed', kind: 'game-event', producer: 'life-crisis', ...extra });
}
function chance(ctx, probability) { return ctx?.chance ? ctx.chance(probability) : false; }
function contacts(L) {
  const family = [...Object.values(L.family?.parents || {}), L.family?.partner].filter(Boolean)
    .filter(p => p.alive === true && !p.away && p.bond >= 30);
  return family.length + (L.lifeCrisis?.social.contact?.accessible ? 1 : 0);
}
function specificContact(L, id) {
  const person = id?.startsWith('spouse.') ? (`spouse.${L.family?.partner?.no}` === id ? L.family.partner : null) : L.family?.parents?.[id];
  return person?.alive === true && !person.away && person.bond >= 30;
}
function facts(L) { return (L.dailyLife?.facts || []).filter(f => f.status === 'confirmed' && f.year <= L.year && f.validUntil >= L.year); }
function crisisCondition(L) {
  const identity = L.identityStrain || {}, c = L.lifeCrisis;
  const f = facts(L), impairment = f.some(x => x.key === 'routine.failure') && f.some(x => x.key === 'sleep.shortfall');
  const isolation = c?.social?.isolatedSince != null && c.social.isolatedSince < L.year && c.social.desiredContact && contacts(L) === 0;
  const losses = (c?.losses || []).filter(e => activeYear(e, L, 4));
  return { severe: identity.stress >= 12 && identity.confusion >= 6, impairment, isolation, losses };
}
function ask(L, ctx, key, data = {}) {
  const event = CRISIS_EVENTS[key];
  const options = event.options.map(o => ({ ...o, personality: { weights: {} },
    feasible: key === 'safety' && o.id === 'accompany' ? contacts(L) > 0 : true }));
  const defaultId = key === 'workDay' ? 'attend' : key === 'workReview' ? 'attend' : key === 'workNotice' ? 'contest'
    : key === 'familyDay' ? 'do' : key === 'familyReview' ? 'repair' : key === 'familySeparate' ? 'wait'
    : key === 'familyConfirm' ? 'pause' : key === 'socialMeet' ? 'alone' : key === 'socialReply' ? 'decline'
    : key === 'socialRepair' ? 'support' : key === 'exclusion' ? 'support' : key === 'recoveryDay' ? 'sleep' : key === 'supportReply' ? 'later' : 'professional';
  if (key === 'supportReply') options.find(o => o.id === 'receive').feasible = freeTime(L) >= 15;
  ctx.ask({ eventId: event.id, prompt: event.prompt, options, defaultId,
    sensitive: key === 'safety' ? 'distress' : undefined, data: { ...data, crisisKey: key } });
}

export function step(L, ctx) {
  if (!live(L)) return;
  const c = ensureCrisis(L), key = jobKey(L), spouse = spouseKey(L);
  // 재취업·재혼한 새 관계를 이전 절차의 대상으로 삼지 않는다.
  if (c.work && c.work.jobKey !== key) {
    recorded(L, ctx, { id: `work.canceled:${L.year}:${c.work.jobKey}`, status: 'canceled', text: '일자리 상태가 달라져 이전 직장에 관한 절차를 종료했다.' });
    c.work = null;
  }
  if (c.family && c.family.spouseKey !== spouse) {
    recorded(L, ctx, { id: `family.canceled:${L.year}:${c.family.spouseKey}`, status: 'canceled', text: '배우자 관계가 달라져 이전 관계의 협의 절차를 종료했다.' });
    c.family = null;
  }
  const raw = crisisCondition(L);
  c.current = { year: L.year, ...raw, lossIds: raw.losses.map(e => e.id) };
  if (L.pending || L.yr?.asked || c.annual[L.year]?.asked) return;
  const strained = (L.identityStrain?.stress ?? 0) >= 8 || ['low-energy-candidate', 'exhaustion-candidate'].includes(L.identityStrain?.stage);
  const requests = [...(L.wellbeing?.pending || []).filter(p => p.kind === 'support-request' && p.status === 'awaiting-consent'), ...c.support.filter(p => p.status === 'requested')];
  const dueRequest = requests.find(p => (p.dueYear ?? p.year + 1) <= L.year && !(p.nextReplyYear > L.year));
  if (dueRequest) {
    const personAvailable = !dueRequest.personId || specificContact(L, dueRequest.personId);
    if (personAvailable && chance(ctx, .7)) { ask(L, ctx, 'supportReply', { requestId: dueRequest.id, personId: dueRequest.personId }); return; }
    dueRequest.nextReplyYear = L.year + 1;
    recorded(L, ctx, { id: `${dueRequest.id}:waiting:${L.year}`, status: 'pending', sourceEventId: dueRequest.sourceEventId, text: '앞서 요청한 지원의 가능한 연락 시간을 아직 확인하지 못했다. 지원이나 거절을 받은 것으로 처리하지 않았다.' });
  }
  if (raw.severe && raw.impairment && raw.isolation && raw.losses.length && !(c.nextSafetyYear > L.year)) {
    ask(L, ctx, 'safety'); return;
  }
  if (c.work?.stage === 'notice' && c.work.noticeYear <= L.year) { ask(L, ctx, 'workNotice', { jobKey: key }); return; }
  if (c.work?.stage === 'review' && c.work.dueYear <= L.year) { ask(L, ctx, 'workReview', { jobKey: key }); return; }
  if (c.family?.stage === 'consent' && c.family.dueYear <= L.year) { ask(L, ctx, 'familyConfirm', { spouseKey: spouse }); return; }
  if (c.family?.stage === 'separated' && c.family.dueYear <= L.year) { ask(L, ctx, 'familySeparate', { spouseKey: spouse }); return; }
  if (c.family?.stage === 'conflict' && c.family.dueYear <= L.year) { ask(L, ctx, 'familyReview', { spouseKey: spouse }); return; }
  if (c.social.excluded && !(c.social.nextResponseYear > L.year)) { ask(L, ctx, 'exclusion'); return; }
  if (c.social.missedReplies >= 2 && !(c.social.nextResponseYear > L.year)) { ask(L, ctx, 'socialRepair'); return; }
  if (strained && !(c.nextRecoveryYear > L.year)) { ask(L, ctx, 'recoveryDay'); return; }
  // 지금 이 해에 일어나는 장면이다. 과거의 결근·가사 미이행을 생성하지 않는다.
  const rotation = Math.abs(L.year) % 3;
  if (strained && key && !['ending', 'notice'].includes(c.work?.stage) && (rotation === 0 || !spouse) && !(c.work?.nextCheckYear > L.year)) { ask(L, ctx, 'workDay', { jobKey: key }); return; }
  if (strained && spouse && !(c.family?.nextCheckYear > L.year)) { ask(L, ctx, 'familyDay', { spouseKey: spouse }); return; }
  if (L.year >= c.nextSocialYear && (strained || !c.social.contact)) ask(L, ctx, c.social.contact?.accessible ? 'socialReply' : 'socialMeet');
}

function workChoice(L, ctx, option, data, key) {
  const c = ensureCrisis(L);
  if (!jobKey(L) || jobKey(L) !== data.jobKey) return result(L, ctx, CRISIS_EVENTS[key].id, option, '근무 대상이 달라져 이전 직장의 결정을 적용하지 않았다.', { status: 'canceled' });
  const w = c.work ||= { jobKey: data.jobKey, misses: 0, warnings: 0, stage: 'working' };
  const eventId = CRISIS_EVENTS[key].id;
  if (key === 'workNotice') {
    if (w.stage !== 'notice' || !w.noticeId) return;
    if (option === 'accept') {
      w.stage = 'ending'; w.effectiveYear = L.year + 1;
      result(L, ctx, eventId, option, '통지에 적힌 다음 해 효력일을 확인했다. 그때까지는 현재 일자리에서 근무한다.', { status: 'pending' });
    } else {
      // 이견·협의 자체를 성공으로 만들지 않으며 회사의 실제 응답을 현재 장면에 기록한다.
      const retained = chance(ctx, .6);
      w.stage = retained ? 'adjusted' : 'ending'; w.effectiveYear = retained ? null : L.year + 1; w.nextCheckYear = L.year + 3;
      result(L, ctx, eventId, option, retained ? '회사가 종료 통지를 철회하고 다음 근무의 시간대를 함께 조정했다.' : '회사는 이견을 접수했지만 종료 통지를 철회하지 않았다. 다음 해 효력일을 두고 입장 차이가 남았다.');
    }
    return;
  }
  if (option === 'miss') {
    w.misses++; w.dueYear = L.year + 1; w.stage = 'review';
    const sourceId = `${eventId}:${L.year}:${option}`;
    result(L, ctx, eventId, option, '회사에 연락하지 않은 채 오늘 예정된 근무를 미뤘다.', { domain: 'attendance', jobKey: w.jobKey, approved: false });
    fact(L, 'routine.failure', eventId, option, { jobKey: w.jobKey });
    if (key === 'workReview') {
      w.warnings++;
      recorded(L, ctx, { id: `work.warning:${L.year}:${w.misses}`, sourceEventId: eventId, text: '회사가 반복된 근무 미이행에 대한 경고와 일정 협의를 다시 전달했다.', domain: 'employer-response', sourceIds: [sourceId] });
      if (w.misses >= 3 && w.warnings >= 2 && chance(ctx, .5)) {
        w.stage = 'notice'; w.noticeYear = L.year + 1; w.noticeId = `work.notice:${L.year}`;
        recorded(L, ctx, { id: w.noticeId, sourceEventId: eventId, text: '회사가 고용 종료를 검토한다는 통지와 답변 기회를 보냈다. 아직 고용이 종료된 것은 아니다.', status: 'pending', domain: 'employment-notice' });
      }
    }
    return;
  }
  if (option === 'leave') {
    const approved = chance(ctx, .65);
    w.stage = 'working'; w.nextCheckYear = L.year + 3;
    result(L, ctx, eventId, option, approved ? '회사에서 휴가를 승인해 오늘은 쉬었다.' : '오늘 휴가는 승인되지 않았다. 예정된 시간에 근무했다.', { approved, domain: 'attendance' });
    if (approved) (L.wellbeing ||= {}).identityRecovery ||= [];
    if (approved) L.wellbeing.identityRecovery.push({ id: `crisis.leave:${L.year}`, year: L.year, stress: 1, confusion: 0 });
    return;
  }
  w.stage = option === 'adjust' ? 'adjusted' : 'working'; w.nextCheckYear = L.year + 3;
  if (option === 'adjust') {
    w.misses = 0; w.warnings = 0;
    result(L, ctx, eventId, option, '회사와 다음 근무 시간대를 조정하는 데 합의했다. 오늘 약속한 근무도 마쳤다.');
  } else result(L, ctx, eventId, option, '예정된 시간에 출근해 오늘의 근무를 마쳤다.');
}

function familyChoice(L, ctx, option, data, key) {
  const c = ensureCrisis(L), eventId = CRISIS_EVENTS[key].id;
  if (!spouseKey(L) || spouseKey(L) !== data.spouseKey) return result(L, ctx, eventId, option, '배우자 관계가 달라져 이전 협의의 결정을 적용하지 않았다.', { status: 'canceled' });
  const f = c.family ||= { spouseKey: data.spouseKey, missed: 0, stage: 'together' };
  if (key === 'familyConfirm') {
    if (f.stage !== 'consent' || !f.mutualConsent) return;
    if (option === 'confirm') {
      const id = `${eventId}:${L.year}:${option}`;
      ctx.act.divorce(); f.stage = 'ended';
      c.losses.push({ id, year: L.year, kind: 'relationship', sourceIds: [...(f.causeIds || []), f.consentId] });
      result(L, ctx, eventId, option, '서로의 뜻을 다시 확인한 뒤 필요한 관계 정리 절차를 마쳤다. 부부로 함께하던 시간이 끝났다.', { domain: 'relationship-end', status: 'completed' });
    } else { f.stage = 'separated'; f.mutualConsent = false; f.dueYear = L.year + 2; result(L, ctx, eventId, option, '관계 정리 절차를 멈추고 시간을 두어 다시 협의하기로 했다.'); }
    return;
  }
  if (option === 'end' && key === 'familySeparate') {
    const agrees = chance(ctx, .6);
    f.mutualConsent = agrees; f.stage = agrees ? 'consent' : 'separated'; f.dueYear = L.year + (agrees ? 1 : 2);
    f.consentId = `${eventId}:${L.year}:${option}`;
    result(L, ctx, eventId, option, agrees ? '배우자도 혼인을 정리할 뜻을 밝혔다. 필요한 절차와 앞으로의 생활을 더 이야기하기로 했다.' : '배우자는 지금 관계를 끝내는 데 동의하지 않았다. 혼인 상태를 유지하며 이후 협의를 남겼다.', { mutualConsent: agrees });
    return;
  }
  if (option === 'separate') {
    const agrees = chance(ctx, .7); f.stage = agrees ? 'separated' : 'conflict'; f.dueYear = L.year + 1;
    if (agrees) L.family.partner.separatedSince = L.year;
    result(L, ctx, eventId, option, agrees ? '배우자와 당분간 거리를 두고 관계를 살피기로 했다. 이사나 재산 정리는 아직 결정하지 않았다.' : '배우자는 거리를 두자는 제안에 아직 동의하지 않았다. 공동생활 문제를 다시 협의하기로 했다.');
    return;
  }
  if (option === 'miss' || option === 'ignore') {
    f.missed++; f.causeIds ||= []; f.causeIds.push(`${eventId}:${L.year}:${option}`);
    f.stage = f.missed >= 2 ? 'conflict' : 'together'; f.dueYear = L.year + 1; f.nextCheckYear = L.year + 1;
    result(L, ctx, eventId, option, '오늘 함께 정한 집안일 약속을 말없이 미뤘다. 배우자는 남은 몫이 자신에게 쏠렸다고 부담을 표현했다.', { domain: 'household-agreement', spouseKey: f.spouseKey });
    fact(L, 'routine.failure', eventId, option, { spouseKey: f.spouseKey });
    return;
  }
  if (option === 'wait') { f.dueYear = L.year + 2; result(L, ctx, eventId, option, '현재의 혼인 상태를 유지하며 관계에 대한 결론은 더 뒤에 협의하기로 했다.'); return; }
  const wasSeparated = f.stage === 'separated'; f.stage = 'together'; f.missed = 0; f.mutualConsent = false; f.nextCheckYear = L.year + 3;
  delete L.family.partner.separatedSince;
  result(L, ctx, eventId, option, option === 'renegotiate' || option === 'repair' || wasSeparated ? '배우자와 오늘 할 수 있는 몫을 다시 나누고 약속한 일을 마쳤다.' : '오늘 함께 약속한 집안일을 마쳤다.');
}

function socialChoice(L, ctx, option, key) {
  const c = ensureCrisis(L), s = c.social, eventId = CRISIS_EVENTS[key].id;
  c.nextSocialYear = L.year + 2; s.nextResponseYear = L.year + 2;
  if (key === 'socialMeet') {
    if (option === 'join') { s.contact = { id: `neighbor:${L.year}`, since: L.year, accessible: true }; s.desiredContact = true; s.isolatedSince = null; result(L, ctx, eventId, option, '오늘 새로 인사를 나눈 이웃과 연락처를 나누고 다음 모임 소식을 받기로 했다.'); }
    else result(L, ctx, eventId, option, '지금은 혼자 쉬고 싶다고 사정을 전했다. 이웃은 고개를 끄덕였다.');
    return;
  }
  if (!s.contact) return result(L, ctx, eventId, option, '이어 갈 모임 연락처가 없어 이전 모임의 결정을 적용하지 않았다.', { status: 'canceled' });
  if (key === 'exclusion') {
    if (option === 'ask') {
      const restored = chance(ctx, .55); s.excluded = !restored; s.contact.accessible = restored;
      result(L, ctx, eventId, option, restored ? '운영자가 배제를 멈추고 모임 소식을 다시 전달했다. 배제한 행동의 책임은 운영자에게 남는다.' : '운영자가 요청을 받았지만 아직 모임 소식 전달을 재개하지 않았다. 다른 도움을 구할 여지를 남겼다.', { domain: 'exclusion-response' });
      if (restored) { s.missedReplies = 0; s.isolatedSince = null; }
    } else {
      if (option === 'leave') { s.contact.accessible = false; s.excluded = false; }
      c.support.push({ id: `social.support:${L.year}`, year: L.year, status: 'requested', sourceEventId: eventId });
      result(L, ctx, eventId, option, option === 'leave' ? '소식에서 자꾸 제외되던 모임을 떠나 다른 접점을 찾아보기로 했다.' : '실제 배제 기록을 남기고 다른 지인이나 상담 창구에 도움을 요청했다. 접수·응답·해결은 아직 별도다.');
    }
    return;
  }
  if (option === 'ignore') {
    s.missedReplies++;
    result(L, ctx, eventId, option, '이번 모임 연락에도 답을 미뤘다. 그 모임에서 주고받는 연락이 이전보다 줄었다.', { domain: 'contact-reply' });
    if (s.missedReplies >= 2) {
      s.contact.accessible = false;
      if (chance(ctx, .25)) {
        s.excluded = true;
        recorded(L, ctx, { id: `social.exclusion:${L.year}`, sourceEventId: eventId, text: '모임 운영자가 앞선 갈등 뒤 여러 차례 모임 소식 전달에서 제외했다. 다른 사람의 배제 행동으로 기록하며 당사자의 아픔이나 성향을 정당화 근거로 삼지 않았다.', domain: 'exclusion', actor: 'group-organizer' });
      }
    }
    return;
  }
  if (option === 'distance') { s.contact.accessible = false; s.desiredContact = false; s.missedReplies = 0; s.isolatedSince = null; result(L, ctx, eventId, option, '이 모임과는 당분간 거리를 두고 싶다는 뜻을 전했다.'); return; }
  if (option === 'support') {
    s.desiredContact = true; c.support.push({ id: `social.support:${L.year}`, year: L.year, status: 'requested', sourceEventId: eventId });
    result(L, ctx, eventId, option, '새로운 접점과 도움을 요청할 수 있는 창구를 알아보기 시작했다. 실제 연결 성공은 아직 확인되지 않았다.'); return;
  }
  s.desiredContact = true;
  if (option === 'reconnect') {
    const accepts = chance(ctx, .7); s.contact.accessible = accepts; s.missedReplies = accepts ? 0 : s.missedReplies;
    if (accepts) s.isolatedSince = null;
    result(L, ctx, eventId, option, accepts ? '이웃이 작은 방식으로 모임 소식을 다시 주고받자는 제안을 받아들였다.' : '이웃에게 다시 연락했지만 아직 답을 받지 못했다. 거절이나 배제로 단정하지 않고 응답을 기다린다.');
  } else { s.missedReplies = 0; s.contact.accessible = true; s.isolatedSince = null; result(L, ctx, eventId, option, option === 'decline' ? '이번 모임은 쉬고 싶다고 답했다. 이웃은 사정을 알겠다며 다음에 보자고 했다.' : '가능한 시간을 답했고 이웃과 연락을 이어 갔다.'); }
}

function safetyChoice(L, ctx, option) {
  const c = ensureCrisis(L), id = `crisis.support:${L.year}:${option}`;
  const state = crisisCondition(L);
  if (!(state.severe && state.impairment && state.isolation && state.losses.length)) return;
  if (option === 'accompany' && !contacts(L)) return;
  c.nextSafetyYear = L.year + 2;
  c.support.push({ id, year: L.year, kind: option, status: 'requested', sourceEventId: CRISIS_EVENTS.safety.id });
  result(L, ctx, CRISIS_EVENTS.safety.id, option, option === 'professional' ? '생활 위기 속에서 이용 가능한 상담·진료 창구에 연결을 요청했다. 실제 접수·이용·회복은 별도로 확인한다.' : option === 'accompany' ? '연락 가능한 사람에게 당장 곁에 있어 달라고 요청했다. 동행 여부는 상대의 응답을 확인해야 한다.' : '지금의 부담 일정을 줄일 수 있는지 관계된 사람들과 협의를 요청했다. 요청만으로 일정이 바뀐 것으로 기록하지 않았다.', { sensitive: 'distress', domain: 'crisis-support' });
}

function resolve(L, ctx, option, data = {}) {
  if (!live(L)) return;
  const c = ensureCrisis(L), key = data.crisisKey, event = CRISIS_EVENTS[key];
  if (!event?.options.some(o => o.id === option)) return;
  const duplicate = `${event.id}:${L.year}:${option}`;
  if (c.history.some(e => e.id === duplicate) || c.annual[L.year]?.resolved) return;
  c.annual[L.year] = { asked: true, resolved: true, eventId: event.id };
  if (key === 'recoveryDay') {
    c.nextRecoveryYear = L.year + 3;
    if (option === 'late') {
      const time = currentTime(L), minutes = Math.min(60, Math.max(0, time?.sleep ?? 0));
      if (!minutes) return result(L, ctx, event.id, option, '현재 수면 시간 배정을 확인할 수 없어 수면을 줄였다는 결과를 기록하지 않았다.', { status: 'canceled' });
      time.sleep -= minutes; time.unfinishedWork = (time.unfinishedWork || 0) + minutes;
      result(L, ctx, event.id, option, `오늘 수면 시간 ${minutes}분을 줄이고 남은 일을 처리했다. 이 날의 수면 부족을 실제 선택 기록으로 남겼다.`, { domain: 'sleep', minutes });
      fact(L, 'sleep.shortfall', event.id, option, { minutes });
      fact(L, L.family?.caringFor ? 'care.overload' : 'work.overload', event.id, option);
      fact(L, 'recovery.unavailable', event.id, option);
    } else if (option === 'request') {
      c.support.push({ id: `recovery.request:${L.year}`, year: L.year, status: 'requested', sourceEventId: event.id });
      result(L, ctx, event.id, option, '남은 일을 나눌 수 있는지 지원을 요청했다. 상대의 동의나 실제 지원을 받은 것으로 처리하지 않았다.');
    } else result(L, ctx, event.id, option, '남은 일은 내일로 미루고 오늘은 정해 둔 시간에 잠들었다.');
  }
  else if (key === 'supportReply') {
    const requests = [...(L.wellbeing?.pending || []), ...c.support];
    const target = requests.find(p => p.id === data.requestId && ['awaiting-consent', 'requested'].includes(p.status));
    if (!target) return;
    if (target.personId && !specificContact(L, target.personId)) {
      target.status = 'canceled'; return result(L, ctx, event.id, option, '도움을 요청한 당사자와 연락할 여건이 달라져 이전 연락 약속을 완료하지 않았다.', { status: 'canceled' });
    }
    if (option === 'receive' && freeTime(L) >= 15) {
      const time = currentTime(L); time.personal -= 15; time.support = (time.support || 0) + 15;
      fact(L, 'support.received', event.id, option, { requestId: target.id, minutes: 15, ...(target.personId && { personId: target.personId }) });
      result(L, ctx, event.id, option, '안내받은 시간에 연락해 지금 겪는 어려움을 이야기했다. 다음에 살펴볼 일도 함께 정했다.', { domain: 'support-received', requestId: target.id });
    } else if (option === 'cancel') { target.status = 'canceled'; result(L, ctx, event.id, option, '지금은 연락을 이어가기 어렵다고 말하고 이번 지원 요청을 철회했다.', { status: 'canceled' }); }
    else { target.nextReplyYear = L.year + 1; result(L, ctx, event.id, option, '이번 연락 시간에는 어렵다고 답하고 다음 응답을 기다리기로 했다.'); }
  }
  else if (key.startsWith('work')) workChoice(L, ctx, option, data, key);
  else if (key.startsWith('family')) familyChoice(L, ctx, option, data, key);
  else if (key === 'safety') safetyChoice(L, ctx, option);
  else socialChoice(L, ctx, option, key);
}
export const choices = Object.fromEntries(Object.values(CRISIS_EVENTS).map(event => [event.id, resolve]));

export function finishYear(L, ctx) {
  if (!live(L)) return;
  const c = ensureCrisis(L), w = c.work;
  if (w?.stage === 'ending' && w.effectiveYear <= L.year) {
    if (jobKey(L) === w.jobKey && w.noticeId && w.misses >= 3 && w.warnings >= 2) {
      ctx.act.loseJob('반복 근무 미이행 후 통지 절차에 따른 고용 종료');
      w.stage = 'ended';
      const id = `crisis.job-end:${L.year}:${w.jobKey}`;
      c.losses.push({ id, year: L.year, kind: 'employment', sourceIds: [w.noticeId] });
      recorded(L, ctx, { id, sourceEventId: CRISIS_EVENTS.workNotice.id, text: '통지된 효력일에 해당 일자리가 종료됐다. 근무 미이행·면담·경고·이견 기록을 남겼으며 법적으로 정당한 해고인지는 판단하지 않는다.', status: 'completed', domain: 'employment-end' });
    } else { w.stage = 'canceled'; recorded(L, ctx, { id: `crisis.job-end-canceled:${L.year}`, status: 'canceled', text: '대상 일자리나 절차 조건이 달라져 예정된 고용 종료를 적용하지 않았다.' }); }
  }
  const s = c.social;
  if (s.desiredContact && s.contact && !s.contact.accessible && contacts(L) === 0 && (s.missedReplies >= 2 || s.excluded)) {
    s.isolatedSince ??= L.year;
    recorded(L, ctx, { id: `crisis.isolation:${L.year}`, domain: 'social-isolation', text: '연결을 원하지만 현재 기록에서 바로 연락해 도움을 청할 접점을 찾지 못했다. 혼자 쉬기를 원해서 택한 시간과 구분해 기록했다.' });
  } else s.isolatedSince = null;
  // 실제 받은 지원만 회복/위기 완화에 반영한다. 신청/접수와 구분한다.
  for (const support of c.support.filter(e => e.status === 'requested')) {
    const received = facts(L).find(f => f.key === 'support.received' && f.requestId === support.id && f.year >= support.year);
    if (!received) continue;
    support.status = 'received'; support.receivedYear = L.year;
    const well = L.wellbeing ||= {}; well.identityRecovery ||= [];
    if (!well.identityRecovery.some(e => e.id === support.id)) well.identityRecovery.push({ id: support.id, year: L.year, stress: 3, confusion: 1 });
    recorded(L, ctx, { id: `${support.id}:received`, sourceEventId: support.sourceEventId, status: 'completed', domain: 'support-received', text: '앞서 요청한 지원을 실제로 이용한 기록을 확인했다. 앞으로의 회복 상태는 이어서 살핀다.' });
  }
  const condition = crisisCondition(L), active = condition.severe && condition.impairment && condition.isolation && condition.losses.length > 0;
  const previous = c.riskAnnual;
  c.riskAnnual = { year: L.year, active, consecutive: active ? (previous?.year === L.year ? previous.consecutive : previous?.year === L.year - 1 && previous.active ? previous.consecutive + 1 : 1) : 0 };
}

// 위험값을 새로 뽑거나 확정 진단을 만들지 않는 읽기 전용 계약.
export function crisisRiskContext(L) {
  if (!live(L) || !L.lifeCrisis) return { active: false, severe: false, impairment: false, persistent: false, isolation: false, supportReceived: false, sourceIds: [] };
  const c = L.lifeCrisis, condition = crisisCondition(L);
  const supportReceived = (c.support || []).some(s => s.status === 'received' && s.receivedYear >= L.year - 1 && s.receivedYear <= L.year);
  const persistent = c.riskAnnual?.year >= L.year - 1 && c.riskAnnual?.year <= L.year && c.riskAnnual.consecutive >= 2;
  const active = condition.severe && condition.impairment && condition.isolation && condition.losses.length > 0 && !supportReceived;
  return { active, severe: condition.severe, impairment: condition.impairment, persistent, isolation: condition.isolation, supportReceived,
    sourceIds: [...condition.losses.map(e => e.id), ...facts(L).filter(f => ['routine.failure', 'sleep.shortfall'].includes(f.key)).map(f => f.id), ...(c.history || []).filter(e => e.domain === 'social-isolation' && activeYear(e, L)).map(e => e.id)] };
}
