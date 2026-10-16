// Actual adult records only. Never infer an activity, diagnosis, relationship or cause of death.
const list = value => Array.isArray(value) ? value : [];
const transferWon = man => `${man < 0 ? '−' : '+'}${Math.round(Math.abs(man) * 10000).toLocaleString('ko-KR')}원`;
export function lifeStoryRecords(L) {
  const end = L.death?.year ?? L.year, age = L.death?.age ?? L.age;
  if ((L.modelVersion ?? 1) < 2 || age < 19 || !Number.isInteger(L.birth?.year)) return [];
  const adult = e => Number.isInteger(e.year) && e.year >= L.birth.year + 19 && e.year <= end;
  const rows = [], seen = new Set();
  const add = (e, source, status, text = e.text) => {
    if (!adult(e) || !e.id || !text || e.sensitive || seen.has(`${source}:${e.id}`)) return;
    seen.add(`${source}:${e.id}`);
    rows.push({ id: e.id, source, year: e.year, age: e.year - L.birth.year, status,
      text: String(text), sourceEventId: e.sourceEventId ?? e.eventId ?? null });
  };
  for (const e of list(L.dailyLife?.history)) {
    if (['daily-observation', 'world-context'].includes(e.kind) || e.sourceKind === 'game-world-assumption') continue;
    const status = e.status === 'canceled' ? 'canceled' : e.status === 'resolved' ? 'reviewed'
      : ['confirmed', 'completed'].includes(e.status) ? 'completed'
        : ['routine', 'plan'].includes(e.kind) ? 'planned' : null;
    if (status) add(e, 'daily', status);
  }
  for (const e of list(L.identityStrain?.history)) {
    if (e.kind === 'choice' && (e.stress > 0 || e.confusion > 0)) add(e, 'identity', 'completed', `「${e.label || '선택'}」 이후 성향과의 충돌로 부담이 늘었다.`);
    if (e.kind === 'recovery' && (e.stress < 0 || e.confusion < 0)) add(e, 'identity', 'completed', '실제로 이행한 휴식·지원 뒤 선택 부담이 일부 줄었다.');
  }
  for (const e of list(L.wellbeing?.history)) {
    const pending = list(L.wellbeing?.pending).find(p => p.id === e.id || e.id === p.id.replace(/:(completion|reply)$/, ''));
    const completion = pending?.id === e.id;
    add(e, 'wellbeing', pending ? completion ? pending.status === 'completed' ? 'completed' : pending.status === 'canceled' ? 'canceled' : 'pending' : 'planned' : 'recorded');
  }
  for (const e of list(L.lifeCrisis?.history)) if (['confirmed', 'completed', 'canceled'].includes(e.status)) add(e, 'crisis', e.status === 'canceled' ? 'canceled' : 'completed');
  const transferLabels = { financial: '금융자산', debt: '대출 잔액', deposit: '보증금', property: '부동산', household: '가구자금', pension: '연금 적립금' };
  for (const e of list(L.dailyLife?.transactions)) {
    if (e.kind !== 'executed-transfer' || e.currencyBaseYear !== 2025) continue;
    const changes = Object.entries(transferLabels).flatMap(([key, label]) => {
      const n = e.delta?.[key];
      return Number.isFinite(n) && n !== 0 ? [`${label} ${transferWon(n)}`] : [];
    });
    if (changes.length) add(e, 'transfer', 'transferred', `${e.label || '자금 이동'} · ${changes.join(' · ')} (2025년 물가 기준, 소득·소비와 구분)`);
  }
  return rows.sort((a, b) => b.year - a.year || a.id.localeCompare(b.id));
}

export function lifeStoryOf(L) {
  const records = lifeStoryRecords(L);
  const settled = records.filter(r => ['completed', 'reviewed', 'canceled'].includes(r.status));
  const highlights = [];
  for (const source of ['crisis', 'daily', 'wellbeing', 'identity']) {
    const row = settled.find(r => r.source === source);
    if (row && highlights.length < 3) highlights.push(row);
  }
  const paragraphs = [];
  const daily = settled.filter(r => r.source === 'daily').slice(0, 2).reverse();
  if (daily.length) paragraphs.push(daily.map(r => `${r.year}년, ${r.text}`).join(' '));
  const burden = settled.filter(r => ['identity', 'wellbeing', 'crisis'].includes(r.source)).slice(0, 2).reverse();
  if (burden.length) paragraphs.push(burden.map(r => `${r.year}년, ${r.text}`).join(' '));
  return { records, highlights, paragraphs };
}
