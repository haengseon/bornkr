// 통계나 난수로 생활 이력을 만들지 않는다. 직접 선택한 활동과 현재 기록만 사실로 변환한다.
const arr = value => Array.isArray(value) ? value : [];
const copy = value => JSON.parse(JSON.stringify(value));
const live = L => L?.alive === true && L.modelVersion >= 2 && L.dailyLife;

function consent(L, input) {
  return arr(L.choices).some(c => c.year === L.year && c.eventId === input.sourceEventId &&
    c.option === input.choiceId && !c.forced && !c.auto);
}

/** 집 안에서 가능한 동작 범위를 직접 살펴본 현재 선택을 기록한다. 치료 효과를 뜻하지 않는다. */
export function recordDailyAccess(L, input) {
  const d = live(L);
  if (!d || !input?.id || input.kind !== 'safe-movement-space' || !consent(L, input)) return false;
  const access = d.access ||= [];
  if (access.some(a => a.id === input.id)) return false;
  access.push({ id: input.id, kind: input.kind, year: L.year, validUntil: L.year + 1,
    confirmed: true, sourceEventId: input.sourceEventId, choiceId: input.choiceId,
    homeRegion: L.home?.region, homeTenure: L.home?.tenure, homeSigungu: L.home?.sigungu,
    homeDong: L.home?.dong, moveCount: L.home?.moves?.length ?? 0 });
  d.history.push({ id: `access.${input.id}`, year: L.year, sourceEventId: input.sourceEventId,
    choiceId: input.choiceId, kind: 'access', status: 'confirmed',
    text: '집 안에서 무리 없이 움직일 공간과 동작 범위를 확인했다. 운동을 완료하거나 질병을 치료했다는 뜻은 아니다.' });
  return true;
}

/** 호출자는 실제 선택을 choices에 먼저 기록한다. 완료는 시간 사용, 중단은 기존 활동 이력을 요구한다. */
export function recordDailyActivity(L, input) {
  const d = live(L);
  if (!d || !input?.id || !['exercise', 'reading', 'media'].includes(input.kind) ||
      !['completed', 'paused', 'resumed'].includes(input.status) || !consent(L, input)) return false;
  const activities = d.activities ||= [];
  const previous = activities.filter(a => a.id === input.id);
  if (previous.some(a => a.year === L.year && a.status === input.status)) return false;
  if (input.status === 'paused' && !previous.some(a => a.status === 'completed' || a.status === 'resumed')) return false;
  if (input.status === 'resumed' && previous.at(-1)?.status !== 'paused') return false;
  const time = d.summary?.year === L.year ? d.summary.time : null;
  const minutes = input.status === 'paused' ? 0 : input.minutes;
  if (!Number.isFinite(minutes) || minutes < 0 || input.status !== 'paused' &&
      (!time || minutes < 1 || minutes > time.personal)) return false;
  if (input.status !== 'paused' && input.accessConfirmed !== true && !previous.some(a => a.accessConfirmed)) return false;
  const row = { id: input.id, kind: input.kind, status: input.status, minutes, year: L.year,
    sourceEventId: input.sourceEventId, choiceId: input.choiceId,
    accessConfirmed: input.accessConfirmed === true || previous.some(a => a.accessConfirmed),
    homeRegion: L.home?.region, homeSigungu: L.home?.sigungu };
  activities.push(row);
  if (minutes) { time.personal -= minutes; time.activity = (time.activity || 0) + minutes; }
  d.history.push({ id: `activity.${input.id}.${L.year}.${input.status}`, year: L.year,
    sourceEventId: input.sourceEventId, choiceId: input.choiceId, kind: 'activity', status: 'confirmed',
    text: input.status === 'paused' ? '이어 오던 활동을 잠시 멈췄다.' : `개인 시간 ${minutes}분을 ${input.kind === 'exercise' ? '가벼운 운동' : input.kind === 'reading' ? '독서' : '게임·미디어 이용'}에 썼다.` });
  return true;
}

/** 실제 대여 확정 선택에서만 호출한다. 책·기관·기한을 임의로 추첨하지 않는다. */
export function recordDailyBookLoan(L, input) {
  const d = live(L);
  if (!d || !input?.id || !input.title || !input.channel || !consent(L, input) ||
      !Number.isInteger(input.dueYear) || input.dueYear < L.year || input.accessConfirmed !== true) return false;
  const loans = d.bookLoans ||= [];
  if (loans.some(l => l.id === input.id)) return false;
  loans.push({ id: input.id, title: input.title, channel: input.channel, dueYear: input.dueYear,
    borrowedYear: L.year, status: 'borrowed', unfinished: true, accessConfirmed: true,
    canExtend: input.canExtend === true, canReserve: input.canReserve === true,
    extensionYears: input.extensionYears === 1 ? 1 : 0,
    sourceEventId: input.sourceEventId, choiceId: input.choiceId });
  d.history.push({ id: `loan.${input.id}.${L.year}`, year: L.year, sourceEventId: input.sourceEventId,
    choiceId: input.choiceId, kind: 'book-loan', status: 'confirmed', text: `${input.title}을 빌렸다. 정해진 기한에 돌려줘야 한다.` });
  return true;
}

/** 기존 약속의 실제 불이행 기록을 참조한다. 게임 이용만으로 충돌·중독을 판정하지 않는다. */
export function recordDailyActivityConflict(L, input) {
  const d = live(L);
  const activity = arr(d?.activities).find(a => a.id === input?.activityId && a.kind === 'media' && a.year === L.year && a.status === 'completed');
  const commitment = arr(d?.commitments).find(c => c.id === input?.commitmentId && c.year === L.year &&
    c.status === 'missed' && c.causeActivityId === input.activityId);
  if (!d || !activity || !commitment) return false;
  const conflicts = d.activityConflicts ||= [];
  const id = `${input.activityId}:${input.commitmentId}`;
  if (conflicts.some(c => c.id === id)) return false;
  conflicts.push({ id, year: L.year, activityId: activity.id, commitmentId: commitment.id });
  return true;
}

/** 현재 원장·시간·실제 대여/활동 이력을 읽어 만료 1년짜리 확인 사실을 생산한다. */
export function collectDailyFacts(L) {
  const d = live(L);
  if (!d || d.summary?.year !== L.year) return [];
  const produced = [];
  const sourceEventId = `daily.observed.${L.year}`;
  const source = { id: sourceEventId, year: L.year, kind: 'daily-observation', status: 'confirmed', text: '현재 기록에 남은 활동·대여·시간 조건을 확인했다.' };
  if (!d.history.some(h => h.id === sourceEventId)) d.history.push(source);
  // 같은 연도 재조회 시 이미 해소된 조건은 살려 두지 않는다.
  d.facts = arr(d.facts).filter(f => f.producer !== 'daily-facts' || f.year !== L.year);
  const put = (key, details = {}) => {
    const fact = { id: `${sourceEventId}:${key}`, key, year: L.year, validUntil: L.year,
      sourceEventId, details: copy(details), status: 'confirmed', producer: 'daily-facts' };
    d.facts.push(fact); produced.push(fact);
  };
  const time = d.summary.time;
  const latest = new Map();
  for (const activity of arr(d.activities)) if (activity.year <= L.year) latest.set(activity.id, activity);
  const paused = [...latest.values()].find(a => a.status === 'paused' && a.accessConfirmed &&
    a.homeRegion === L.home?.region && a.homeSigungu === L.home?.sigungu &&
    arr(d.activities).some(old => old.id === a.id && ['completed', 'resumed'].includes(old.status) && old.year <= a.year));
  const exercise = [...latest.values()].find(a => a.kind === 'exercise');
  const access = arr(d.access).find(a => a.kind === 'safe-movement-space' && a.confirmed === true &&
    a.year <= L.year && a.validUntil >= L.year && a.homeRegion === L.home?.region && a.homeTenure === L.home?.tenure &&
    a.homeSigungu === L.home?.sigungu && a.homeDong === L.home?.dong && a.moveCount === (L.home?.moves?.length ?? 0) &&
    arr(L.choices).some(c => c.eventId === a.sourceEventId && c.option === a.choiceId && c.year === a.year && !c.forced && !c.auto));
  if ((!exercise || exercise.status === 'paused') && access) put('routine.exercise-inactive');
  if (access) put('access.safe-movement-space', { accessId: access.id });
  if (time?.personal >= 15) put('schedule.available-time', { minutes: time.personal });
  const ledger = d.ledger?.[L.year];
  if (ledger && ledger.disposable <= ledger.consumption) put('budget.exercise-pressure', { ledgerYear: L.year });
  if (paused && time?.personal >= 15) {
    for (const key of ['routine.hobby-paused-history', 'access.hobby-available', 'schedule.new-available-time', 'schedule.hobby-time-feasible']) put(key, { activityId: paused.id, kind: paused.kind });
  }
  const media = [...latest.values()].find(a => a.kind === 'media' && ['completed', 'resumed'].includes(a.status));
  if (media) {
    put('routine.media-active', { activityId: media.id });
    const conflicts = arr(d.activityConflicts).filter(c => c.activityId === media.id && c.year >= L.year - 2 && c.year <= L.year);
    if (conflicts.length >= 2) put('routine.repeated-schedule-conflict', { activityId: media.id, conflictIds: conflicts.map(c => c.id) });
    const commitment = arr(d.commitments).find(c => c.year === L.year && c.status === 'scheduled' && c.afterMediaFeasible === true);
    if (commitment) put('schedule.media-after-commitment-feasible', { activityId: media.id, commitmentId: commitment.id });
  }
  const loan = arr(d.bookLoans).find(l => l.status === 'borrowed' && l.unfinished === true && l.accessConfirmed && l.dueYear >= L.year && l.borrowedYear <= L.year);
  if (loan) {
    for (const key of ['access.book-lending', 'book.current-loan', 'book.return-deadline', 'book.unfinished-reading']) put(key, { loanId: loan.id });
    if (loan.canExtend && loan.extensionYears === 1) put('book.extension-eligible', { loanId: loan.id });
    if (loan.canReserve) put('book.reservation-channel', { loanId: loan.id });
    if (time?.personal >= 10) put('schedule.reading-time-reallocatable', { loanId: loan.id, minutes: time.personal });
  }
  return produced;
}
