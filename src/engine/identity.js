// 성향은 선택 방법과의 적합도만 나타낸다. 난수·성인 MBTI·질환/사망 확률은 건드리지 않는다.
const LETTERS = { E: ['EI', 1], I: ['EI', -1], N: ['SN', 1], S: ['SN', -1], F: ['TF', 1], T: ['TF', -1], J: ['JP', 1], P: ['JP', -1] };
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const num = v => Number.isFinite(v) ? v : 0;
const available = o => o && o.feasible !== false && o.disabled !== true;
const initial = () => ({ stress: 0, confusion: 0, history: [], lastRecoveryYear: null, appliedOutcomeIds: [], annual: {}, conflictYears: 0, healthBurdenYears: 0, stage: 'stable' });

export function ensureIdentity(L) {
  const state = L.identityStrain ||= initial();
  for (const [k, v] of Object.entries(initial())) if (state[k] == null) state[k] = v;
  state.stress = clamp(num(state.stress), 0, 20);
  state.confusion = clamp(num(state.confusion), 0, 10);
  return state;
}

function fit(L, option) {
  const weights = option?.personality?.weights;
  if (!weights || typeof weights !== 'object' || Array.isArray(weights)) return null;
  const entries = Object.entries(weights);
  if (!entries.length || entries.some(([k, w]) => !LETTERS[k] || !Number.isFinite(w) || w < 0 || w > 1)
      || entries.reduce((s, [, w]) => s + w, 0) > 1 + 1e-9) return null;
  for (const [a, b] of [['E', 'I'], ['N', 'S'], ['F', 'T'], ['J', 'P']]) if (weights[a] > 0 && weights[b] > 0) return null;
  if (entries.some(([k]) => { const v = L.mbti?.[LETTERS[k][0]]; return !Number.isFinite(v) || v < 0 || v > 100; })) return null;
  return entries.reduce((s, [k, w]) => { const [axis, direction] = LETTERS[k]; return s + w * direction * (L.mbti[axis] - 50) / 50; }, 0);
}

// Preview is read-only, including on old saves. options may be reordered without changing scoring.
export function identityPreview(L, req, opt, { auto = false, forced = false } = {}) {
  const adult = L.age >= 19, score = adult ? fit(L, opt) : null;
  const visible = adult && !!opt?.personality?.weights;
  const alignment = score != null && score >= .25 ? 'aligned' : score != null && score <= -.25 ? 'opposed' : 'neutral';
  const constrained = forced || req?.forced === true || opt?.forced === true;
  const alternative = (req?.options || []).some(o => o.id !== opt?.id && available(o));
  let stress = 0, confusion = 0;
  if (alignment === 'opposed' && available(opt) && alternative && !auto && !constrained) {
    const intensity = clamp((-score - .25) / .75, 0, 1), state = L.identityStrain;
    const annual = state?.annual?.[L.year] || {};
    stress = Math.max(0, Math.min(1 + Math.round(3 * intensity), 8 - num(annual.stress), 20 - num(state?.stress)));
    confusion = Math.max(0, Math.min(1 + Math.round(intensity), 4 - num(annual.confusion), 10 - num(state?.confusion)));
  }
  return { visible, score, alignment, stress, confusion, constrained: constrained || !alternative, label: alignment === 'aligned' ? '성향과 잘 맞음' : alignment === 'opposed' ? '성향과 충돌' : '성향과 뚜렷한 관련 없음' };
}

export function applyIdentityChoice(L, req, opt, context = {}) {
  const state = ensureIdentity(L), preview = identityPreview(L, req, opt, context);
  // A request occurrence, rather than event type alone, is the idempotency unit.
  const id = context.outcomeId ?? req.outcomeId ?? req.instanceId ?? `${L.year}:${req.eventId}:${req.occurrence ?? 0}`;
  if (state.appliedOutcomeIds.includes(id)) return { ...preview, stress: 0, confusion: 0, duplicate: true };
  state.appliedOutcomeIds.push(id);
  if (preview.stress || preview.confusion) {
    const annual = state.annual[L.year] ||= { stress: 0, confusion: 0 };
    annual.stress += preview.stress; annual.confusion += preview.confusion;
    state.stress += preview.stress; state.confusion += preview.confusion;
    state.history.push({ id, kind: 'choice', year: L.year, eventId: req.eventId, optionId: opt.id, prompt: req.prompt, label: opt.label, score: preview.score, stress: preview.stress, confusion: preview.confusion });
  }
  return preview;
}

// Call after actual support/rest records are settled, before the annual snapshot.
export function identityYear(L) {
  const state = ensureIdentity(L);
  if (state.lastRecoveryYear === L.year) return state;
  const previousYear = state.lastRecoveryYear;
  if (previousYear != null && previousYear !== L.year - 1) { state.conflictYears = 0; state.healthBurdenYears = 0; }
  const annual = state.annual[L.year] || {}, recovery = [];
  if (!num(annual.stress) && !num(annual.confusion)) recovery.push({ id: `identity:natural:${L.year}`, stress: 2, confusion: 1 });
  for (const entry of L.wellbeing?.identityRecovery || []) if (entry.year === L.year && entry.id && !state.appliedOutcomeIds.includes(entry.id)) recovery.push(entry);
  for (const entry of recovery) {
    if (state.appliedOutcomeIds.includes(entry.id)) continue;
    const stress = Math.min(state.stress, Math.max(0, num(entry.stress)));
    const confusion = Math.min(state.confusion, Math.max(0, num(entry.confusion)));
    state.stress -= stress; state.confusion -= confusion;
    state.appliedOutcomeIds.push(entry.id);
    if (stress || confusion) state.history.push({ id: entry.id, kind: 'recovery', year: L.year, stress: -stress, confusion: -confusion });
  }
  const repeated = state.history.filter(e => e.kind === 'choice' && e.year >= L.year - 4 && e.year <= L.year).length >= 3;
  const entering = repeated && state.stress >= 8 && state.confusion >= 4;
  const retained = repeated && state.stage !== 'stable' && state.stress >= 6 && state.confusion >= 3;
  const conflict = entering || retained;
  state.conflictYears = entering ? state.conflictYears + 1 : 0;
  state.healthBurdenYears = state.stress >= 12 ? state.healthBurdenYears + 1 : 0;
  const evidence = L.wellbeing?.identityEvidence;
  const impaired = state.conflictYears >= 2 && evidence?.year === L.year && evidence.sleepShortfall === true && evidence.routineFailures === true;
  state.stage = impaired ? (evidence.workload === true && evidence.recoveryUnavailable === true ? 'exhaustion-candidate' : 'low-energy-candidate') : conflict ? 'conflict' : 'stable';
  state.concern = conflict ? { id: 'identity-conflict', label: '내 선택과 나다움 사이', since: state.concern?.since ?? L.year } : null;
  state.healthBurdenCandidate = state.healthBurdenYears >= 2;
  // Candidates are evidence for later support events, never an automatic diagnosis or penalty.
  state.lastRecoveryYear = L.year;
  return state;
}
