// 연간 진행 파이프라인·ctx·선택 처리(ARCHITECTURE §7, GDD §2.2).
// 선택이 생기면 그 단계까지 하고 멈춘다(L.pending). 남은 단계는 choose()가 이어서 처리한다.
// 진행 위치(L.yr.phase)와 난수 상태(L.rng, L.rngC)가 모두 L 안에 있어 직렬화·재현이 된다.
import * as R from './rng.js';
import { CHOICE_TIMEOUT_MS, STAT_KEYS, ISSUE_KEYS } from './constants.js';
import { STAGE_CAP, FEED_DIST, FEED_MAX } from './tuning.js';
import { stageOf } from './clock.js';
import { D } from './tables.js';
import { text, choiceText, rawText, fill, josa } from './text.js';
import { makeAct } from './act.js';
import { helpFor } from './safety.js';
import * as education from './systems/education.js';
import * as military from './systems/military.js';
import * as career from './systems/career.js';
import * as money from './systems/money.js';
import * as housing from './systems/housing.js';
import * as family from './systems/family.js';
import * as health from './systems/health.js';
import * as aging from './systems/aging.js';
import * as milestones from './milestones.js';
import { decorate, chapterOf } from './milestones.js';
import { STATS, ISSUES } from './constants.js';
import { TENURE_LABEL, WHO_LABEL } from './act.js';
import { HT_LABEL } from './systems/education.js';
import { won } from './text.js';
import { eraStep, chanceStep, resolveEventChoice } from './events.js';
import { driftStats, derive } from './stats.js';
import { updateIssues } from './issues.js';
import { compareStep } from './compare.js';
import { deathStep, infantStep } from './death.js';

const SYSTEMS = [education, military, career, money, housing, family, health, aging, milestones];
const SYS_CHOICES = Object.assign({}, ...SYSTEMS.map(s => s.choices || {}));

const PHASES = [
  ['pre', L => { L.derived = derive(L); family.pre(L, makeCtx(L)); }],   // 파생 상태: 그해 사건·이정표가 읽는다
  ...SYSTEMS.map(s => [s, L => s.step(L, makeCtx(L))]),
  ['era', L => eraStep(L, makeCtx(L, 'c'))],
  ['chance', L => chanceStep(L, makeCtx(L, 'c'))],
  ['drift', L => { driftStats(L); updateIssues(L); }],
  ['compare', L => compareStep(L, makeCtx(L, 'c'))],
  ['death', L => deathStep(L, makeCtx(L))],
];

// ctx: 시스템·사망은 구조 흐름(L.rng), 사건·뉴스·선택 결과는 콘텐츠 흐름(L.rngC). GDD §13.1
export function makeCtx(L, stream = 's') {
  const s = stream === 'c' ? L.rngC : L.rng;
  const ctx = {
    L, D,
    rand: () => R.rand(s),
    chance: p => R.rand(s) < p,
    int: (lo, hi) => R.int(s, lo, hi),
    pick: arr => R.pick(s, arr),
    weighted: w => R.weighted(s, w),
    normal: (m = 0, sd = 1) => R.normal(s, m, sd),
    emit: e => emit(L, e),
    apply: (fx, meta) => apply(L, fx, meta),
    get act() { return (this._act ||= makeAct(L, ctx)); },   // act는 쓸 때 만든다(성능)
    ask: req => ask(L, req, ctx),
    text: (id, vars) => text(id, { name: L.name, ...vars }, ctx),
    sys: (id, vars, extra) => emit(L, { kind: 'system', id, text: text(id, { name: L.name, ...vars }, ctx), ...extra }),
  };

  return ctx;
}

export const SCENARIO_FROM = 2027;                  // 이 해부터는 실제 기록이 아닌 가상 시나리오·전망 구간(QA #6)
export function emit(L, e) {
  const entry = { year: L.year, age: L.age, ...e, ...(L.year >= SCENARIO_FROM && (e.kind === 'news' || e.kind === 'event') && { scenario: true }) };
  L.log.push(entry);
  tagMajor(L, entry);
  return entry;
}

const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
export function pushReason(L, key, r) {
  const a = (L.reasons[key] ||= []);
  a.push(r);
  if (a.length > 12) a.shift();
}
function change(L, group, key, d, reason, src) {
  const old = L[group][key];
  const nv = clamp(Math.round(old + d), 0, 100);
  if (nv === old) return 0;
  L[group][key] = nv;
  if (reason) pushReason(L, key, { year: L.year, age: L.age, text: reason, delta: nv - old, ...(src && { src }) });
  return nv - old;
}

// fx: { stats?, issues?, money?, set? } — 클램프·reason 기록 포함(ARCHITECTURE §11)
export function apply(L, fx, meta = {}) {
  if (!fx) return;
  const reason = meta.reason ?? meta.text, src = meta.src;
  for (const [k, d] of Object.entries(fx.stats || {})) {
    if (!(k in L.stats) || !d) continue;
    let dd = clamp(d, -8, 8);
    if (k === 'happiness' || k === 'relations') dd *= 0.85 + 0.3 * L.traits.sens / 100;
    change(L, 'stats', k, dd, reason, src);
  }
  for (const [k, d] of Object.entries(fx.traits || {})) {     // 성향 Δ(사건당 ±5, 5~95)
    if (k in L.traits && d) L.traits[k] = clamp(Math.round(L.traits[k] + clamp(d, -5, 5)), 5, 95);
  }
  for (const [k, d] of Object.entries(fx.issues || {})) {
    if (k in L.issues && d) change(L, 'issues', k, clamp(d, -12, 12), reason, src);
  }
  if (fx.money) {
    const act = makeAct(L, makeCtx(L, 'c'));
    const { debt = 0, assets = 0 } = fx.money;
    if (debt > 0) act.borrow(debt, 'credit', { silent: true });
    if (debt < 0) act.repay(-debt);
    if (assets > 0) act.gain(assets);
    if (assets < 0) act.spend(-assets);
  }
  for (const [path, v] of Object.entries(fx.set || {})) {
    const ks = path.split('.');
    let o = L;
    for (const k of ks.slice(0, -1)) o = o[k] ??= {};
    o[ks[ks.length - 1]] = v;
  }
}

// 선택 요청. 그해 1건·구간 상한(GDD §2.2). 막히면 시스템 선택은 기본값을 바로 적용(auto, forced).
// req: { eventId, options:[id | {id,label,hint}], defaultId, vars?, data?, sensitive?, prompt? }
export function ask(L, req, ctx) {
  const st = stageOf(L.age).id, sc = L.stageChoices[st];
  const isSys = req.eventId.startsWith('sys.');
  const ct = isSys ? choiceText(req.eventId, { name: L.name, ...req.vars }, ctx) : null;
  const options = req.options.map(o => typeof o === 'string' ? { id: o, label: fill(ct.labels[o] ?? o, { name: L.name, ...req.vars }) } : o);
  const full = {
    eventId: req.eventId, prompt: req.prompt ?? ct?.prompt ?? '', options,
    defaultId: options.some(o => o.id === req.defaultId) ? req.defaultId : options[0].id,
    timeoutMs: req.sensitive ? 20000 : CHOICE_TIMEOUT_MS, year: L.year, age: L.age,
    ...(req.sensitive && { sensitive: req.sensitive, help: helpFor(req.sensitive, L.age) }),
    ...(req.data && { data: req.data }),
    ...(req.vars && { vars: req.vars }),
    ...(req.careTarget && { careTarget: req.careTarget }),
  };
  if (isSys) decorate(L, full);                       // 이정표: major·topic·chapter·options[].effects/risk(PROCESS-V2)
  // 선택지가 1개뿐이면 묻지 않고 결과만 적용(QA-S-02, GDD §15.1 선택지 2~3개)
  if (options.length < 2 || L.pending || L.yr.asked || (isSys && sc.sys >= STAGE_CAP[st].sys)) {   // 이정표도 구간 시스템 상한 안(15분 예산)
    if (isSys || options.length < 2) resolveChoice(L, full, full.defaultId, { auto: true, forced: true });
    return false;
  }
  L.yr.asked = true;
  sc[isSys ? 'sys' : 'chance']++;
  L.lastChoiceAge = L.age;
  if (!isSys) L.lastChanceAge = L.age;
  L.pending = full;
  return true;
}

function resolveChoice(L, req, optionId, { auto = false, forced = false } = {}) {
  const opt = req.options.find(o => o.id === optionId) || req.options.find(o => o.id === req.defaultId);
  L.choices.push({ year: L.year, age: L.age, eventId: req.eventId, option: opt.id, auto: !!auto, ...(forced && { forced: true }) });
  const ctx = makeCtx(L, 'c');
  const before = req.major ? { p: profileOf(L), s: snapOf(L) } : null;
  if (req.eventId.startsWith('sys.')) {
    const said = rawText(`${req.eventId}.${opt.id}`) ? text(`${req.eventId}.${opt.id}`, { name: L.name, ...req.vars }, ctx) : `${req.prompt} → ${opt.label}`;
    const entry = emit(L, { kind: forced ? 'system' : 'choice', id: req.eventId, text: said, option: opt.id, label: opt.label, auto: !!auto, ...(req.careTarget && { careTarget: req.careTarget }), ...(forced && { quiet: true }) });
    SYS_CHOICES[req.eventId]?.(L, ctx, opt.id, req.data || {});
    if (before) settle(L, ctx, req, opt, entry, before);
  } else {
    resolveEventChoice(L, ctx, req, opt.id, !!auto);
  }
}

// ── 이정표 결과(PROCESS-V2 §3: 결과 공개·영향 카드·why) ──
const LABEL_OF = Object.fromEntries([...STATS, ...ISSUES].map(x => [x.key, x.label]));
const JOB_ST = { seeking: '일을 찾는 중', student: '학생', military: '군 복무', retired: '은퇴', inactive: '일을 쉬는 중', none: '' };
export function profileOf(L) {
  const j = L.job, f = L.family, kids = f.children.filter(c => c.alive).length;
  return {
    stats: { ...L.stats }, issues: { ...L.issues },
    job: j.status === 'employed' || j.status === 'self' ? `${j.title}${j.status === 'self' ? '(자영)' : j.regular ? '' : '(비정규)'}` : JOB_ST[j.status] ?? '',
    home: L.home.parents ? '부모님 집' : TENURE_LABEL[L.home.tenure] ?? '',
    money: L.money.debt > 0 ? `빚 ${won(L.money.debt)}만 원` : '빚 없음',
    family: `${f.partner ? '배우자와' : f.married ? '' : '혼자'}${kids ? ` 자녀 ${kids}명` : ''}`.trim(),
  };
}
export function impactOf(before, after) {
  const d = g => Object.keys(after[g]).map(key => ({ key, delta: after[g][key] - before[g][key] })).filter(x => x.delta);
  return { stats: d('stats'), issues: d('issues'), profile: ['job', 'home', 'money', 'family'].filter(k => before[k] !== after[k]).map(field => ({ field, text: after[field] })) };
}
const RISK_P = { low: [0.75, 0.05], mid: [0.55, 0.15], high: [0.4, 0.3] };     // [잘 풀림, 아쉬움] 확률
// 상태 의존(요청 4): 진로·일·주거·충격 결정의 성공은 소득 구간·학습·건강 위험에 따라 오즈가 달라진다(×0.6~×1.6)
function successOdds(L, topic) {
  const d = L.derived || derive(L);
  if (!['career', 'job', 'housing', 'shock'].includes(topic)) return 1;
  return Math.max(0.6, Math.min(1.6, Math.exp(0.12 * (d.incomeBand - 3) + (d.learning === 'high' ? 0.15 : d.learning === 'low' ? -0.15 : 0) - 0.15 * Math.max(0, d.healthRisk - 1))));
}
// 호불호 라벨(result)은 확률 보정(±2)일 뿐이다. '실행됐는가'는 상태 변화로 따로 판정한다(QA #3).
const LUCK_REASON = { success: '선택 뒤 기대 방향 지표가 올랐다', regret: '선택 뒤 기대 방향 지표가 내려갔다' };
// 실행 판정용 스냅샷: 주거·부채·자산·일·가족(profileOf의 문자열보다 촘촘하다)
export function snapOf(L) {
  const h = L.home, m = L.money, j = L.job, f = L.family;
  return { owned: !!h.owned, tenure: h.tenure, parents: !!h.parents, region: h.region, debt: Math.round(m.debt), assets: Math.round(m.assets), job: j.status, code: j.code, partner: !!f.partner, kids: f.children.filter(c => c.alive).length,
    stage: L.edu.stage, highType: L.edu.highType, tutoring: L.edu.tutoring, mil: L.mil.status, caring: f.caringFor, planned: L.flags.childPlanned ?? null };
}
const WORKING = s => s === 'employed' || s === 'self';
// 선택이 만든 실제 변화 서술(문구와 impact는 같은 확정 상태에서 나온다)
export function factsOf(b, a) {
  const out = [], mw = n => won(Math.abs(n));
  if (b.owned !== a.owned || b.tenure !== a.tenure || b.parents !== a.parents) {
    const lab = a.parents ? '부모님 집' : TENURE_LABEL[a.tenure] ?? '';
    if (lab) out.push({ kind: 'home', text: `주거가 ${lab}${josa(lab, '으로')} 바뀌었다` });
  } else if (b.region !== a.region) out.push({ kind: 'home', text: '사는 지역이 바뀌었다' });
  const d = a.debt - b.debt;
  if (d > 0) out.push({ kind: 'debt', text: b.debt === 0 ? `대출이 생겼다(빚 ${mw(a.debt)}만 원)` : `빚이 ${mw(d)}만 원 늘었다` });
  else if (d < 0) out.push({ kind: 'debt', text: a.debt === 0 ? '빚을 모두 갚았다' : `빚이 ${mw(d)}만 원 줄었다` });
  const e = a.assets - b.assets;
  if (Math.abs(e) >= 100) out.push({ kind: 'assets', text: `보유 자산이 ${mw(e)}만 원 ${e > 0 ? '늘었다' : '줄었다'}` });
  if (b.job !== a.job || b.code !== a.code) {
    const t = WORKING(b.job) && !WORKING(a.job) ? (a.job === 'retired' ? '은퇴했다' : b.job === 'self' ? '사업을 접었다' : '일을 그만두었다')
      : !WORKING(b.job) && a.job === 'self' ? '사업을 시작했다' : !WORKING(b.job) && a.job === 'employed' ? '취업했다'
      : WORKING(b.job) && WORKING(a.job) ? (b.job === a.job ? '직장을 옮겼다' : a.job === 'self' ? '사업을 시작했다' : '직장에 들어갔다')
      : a.job === 'military' ? '군 복무를 시작했다' : a.job === 'seeking' ? '일을 찾는 중이 되었다' : '';
    if (t) out.push({ kind: 'job', text: t });
  }
  if (b.highType !== a.highType && a.highType) out.push({ kind: 'edu', text: `고등학교 유형이 ${HT_LABEL[a.highType] ?? a.highType}로 정해졌다` });
  if (b.stage !== a.stage && ['college', 'retake'].includes(a.stage)) out.push({ kind: 'edu', text: a.stage === 'retake' ? '재수를 시작했다' : '대학에 입학했다' });
  if (b.tutoring !== a.tutoring) out.push({ kind: 'edu', text: a.tutoring > b.tutoring ? '학원 수강이 늘었다' : '학원 수강이 줄었다' });
  if (b.caring !== a.caring && a.caring) out.push({ kind: 'care', text: `${WHO_LABEL[a.caring] ?? '가족'} 돌봄을 맡게 되었다` });
  if (b.planned !== a.planned && a.planned) out.push({ kind: 'family', text: '출산을 계획했다' });
  if (b.partner !== a.partner) out.push({ kind: 'family', text: a.partner ? '배우자와 함께 살게 되었다' : '배우자와 따로 살게 되었다' });
  if (a.kids > b.kids) out.push({ kind: 'family', text: '자녀가 생겼다' });
  return out;
}
// 상태 이름: 결과 판정(성공/아쉬움) 대신 실제 상태명을 쓴다. 키 '이벤트:선택' 우선, 없으면 변화 종류
const STATE_LABEL = { 'sys.edu.path:college': '대학 입학', 'sys.edu.path:work': '미진학', 'sys.edu.path:retake': '재수', 'sys.home.buy:buy': '주택 매수', 'sys.home.buy:wait': '매수 보류', 'sys.era.shock:buy': '주택 매수', 'sys.era.shock:hold': '현 상태 유지', 'sys.era.shock:wait': '관망', 'sys.job.first_offer:take': '취업', 'sys.job.first_offer:wait': '취업 대기', 'sys.job.first_offer:exam': '시험 준비', 'sys.job.business:open': '창업', 'sys.fam.marry:marry': '결혼', 'sys.fam.divorce:divorce': '이혼', 'sys.home.independence:stay': '독립 보류' };
const KIND_LABEL = { home: '주거 변경', debt: '대출·상환', assets: '자산 변동', job: '일 변경', family: '가족 변화', edu: '학업 변경', care: '돌봄 시작' };
const BUY = new Set(['sys.home.buy:buy', 'sys.era.shock:buy']);
const INTENT = new Set(['sys.home.buy:buy', 'sys.era.shock:buy', 'sys.era.shock:move', 'sys.era.shock:close', 'sys.job.business:open', 'sys.job.offer:move']);   // 상태가 바뀌어야 하는 선택
// 확률 결과를 굴리고(rngC), 잘 풀리면 기대 방향 지표 +2, 아쉬우면 −2를 더한 뒤 영향·이유를 기록한다.
function settle(L, ctx, req, opt, entry, before) {
  const eff = (opt.effects || []).filter(e => e.key in L.stats);
  let result = 'hold';
  if (eff.length) {
    const [p0, pr0] = RISK_P[opt.risk || 'low'], o = successOdds(L, req.topic), u = ctx.rand();
    const ps = p0 * o / (1 - p0 + p0 * o), pr = Math.min(1 - ps, pr0 / o);   // 오즈 배수 적용
    result = u < ps ? 'success' : u > 1 - pr ? 'regret' : 'hold';
    if (result !== 'hold') apply(L, { stats: Object.fromEntries(eff.map(e => [e.key, (result === 'success' ? 2 : -2) * e.dir])) }, { reason: `${opt.label}: ${LUCK_REASON[result]}` });
  }
  const key = `${req.eventId}:${opt.id}`, facts = factsOf(before.s, snapOf(L));
  const missed = BUY.has(key) && !L.home.owned;      // 예산에 맞는 집이 없어 매수가 성사되지 않은 경우(act.move가 다른 점유 형태로 대체)
  const execution = missed || (!facts.length && INTENT.has(key)) ? 'failed' : facts.length ? 'executed' : 'deferred';
  const fl = facts.map(f => f.text).join('. ');
  const line = missed ? `집을 사지 못했다.${fl ? ' ' + fl + '.' : ''}` : execution === 'executed' ? fl + '.' : execution === 'failed' ? '선택했지만 실행되지 않았다.' : '즉시 반영된 변화 없음.';
  const chips = (opt.effects || []).map(e => `${LABEL_OF[e.key] ?? e.key} ${e.dir > 0 ? '▲' : '▼'}`).join(' · ');
  Object.assign(entry, {
    decision: true, major: true, topic: req.topic, chapter: req.chapter, risk: opt.risk ?? 'low', result, execution,
    resultLabel: missed ? '매수 불발' : STATE_LABEL[key] ?? (execution === 'executed' ? KIND_LABEL[facts[0].kind] : execution === 'failed' ? '실행 안 됨' : '변화 없음'),
    facts: facts.map(f => f.text),
    why: `'${opt.label}'${chips ? ` — ${chips}` : ''}. ${line}`,
    impact: impactOf(before.p, profileOf(L)),
  });
  L.yr.snapP = profileOf(L);                    // 이 결정의 변화는 여기서 소진: 뒤따르는 사건의 impact에 섞이지 않게
  (L.decisions ||= []).push({ year: L.year, eventId: req.eventId, option: opt.id, label: opt.label, topic: req.topic, result, execution, risk: opt.risk ?? 'low', ...(opt.id === req.defaultId && { def: true }) });   // 파급은 기본값과 다른 결정만
}

// 구조 변화 로그에 major·impact(프로필) 표시. 한 해 최대 2건(PROCESS-V2·UI 연출).
const MAJOR_FIELD = { fam: 'family', home: 'home', job: 'job', money: 'money', edu: 'job', mil: 'job', health: 'family', age: 'family' };
// 사건별 impact(QA #4): 직전 emit(또는 단계 시작) 이후 이 사건 영역(MAJOR_FIELD)에서 실제로 바뀐 것만. 안 바뀌었으면 빈 profile.
// 연간 변화·다른 사건의 변화는 여기 들어오지 않는다(UI는 impact가 있으면 fallback을 쓰지 않는다).
function tagMajor(L, e) {
  if (e.kind !== 'system' || e.quiet || !MAJOR.test(e.id)) return;
  const p = profileOf(L), prev = L.yr.snapP ?? p;
  L.yr.snapP = p;                                                // 큰 사건마다 기준선을 갱신한다(단계 시작·결정 정산 때도)
  const field = MAJOR_FIELD[e.id.split('.')[1]] ?? 'family';
  e.impact = { stats: [], issues: [], profile: prev[field] !== p[field] ? [{ field, text: p[field], from: prev[field] }] : [] };
  if ((L.yr.majors = (L.yr.majors || 0) + 1) > 2) return;
  e.major = true;
}

// 해마다 표시 상한(GDD §2.4): 넘치는 줄은 quiet. 선택·사망·출생은 항상 표시.
export const MAJOR = /^sys\.(fam\.(wedding|child_born|parent_death|widowed|divorced|grandparent_death|remarry|care_end)|age\.(ltc|spouse_care)|home\.(move|region_move|bought|jeonse_fraud)|job\.(lose|first|exit_main|contract_end)|health\.(dx_cancer|dx_cardio)|mil\.enlist|edu\.(college_enter|graduate))/;
function prio(e) {
  if (e.kind === 'choice' || e.kind === 'death' || e.kind === 'birth' || e.asked) return 0;
  if (e.kind === 'system' && MAJOR.test(e.id)) return 1;
  return { news: 2, event: 3 }[e.kind] ?? 4;
}
// 한 해 표시 항목(피드) 예산: 0개 15%·1개 60%·2개 20%·3개 5%(FEED_DIST), 절대 상한 FEED_MAX=3.
// 선택·사망·출생은 항상 보이고, 나머지는 우선순위(prio) 순으로 예산 안에서만 보인다. 넘친 항목은 quiet(기록·효과는 그대로).
// 예산은 시드에서 따로 파생한 난수로 정해 구조·콘텐츠 난수 흐름을 건드리지 않는다.
const feedTarget = L => (L.yr.feed ??= (u => (u < FEED_DIST[0] ? 0 : u < FEED_DIST[0] + FEED_DIST[1] ? 1 : u < FEED_DIST[0] + FEED_DIST[1] + FEED_DIST[2] ? 2 : 3))(R.rand(R.makeRng(R.hashSeed(L.seed, 'feed', L.age)))));
const topicOf = e => (e.tags?.[0] ?? e.id.split('.').slice(0, 2).join('.'));
function flushQuiet(L) {
  const ys = L.yr, target = Math.min(FEED_MAX, feedTarget(L));
  const year = L.log.slice(ys.start).filter(e => !e.quiet && e.kind !== 'compare' && e.kind !== 'birth');
  const seen = new Set(L.log.slice(ys.start, ys.mark).filter(e => !e.quiet && e.kind !== 'compare').map(topicOf));
  const fresh = L.log.slice(ys.mark).filter(e => !e.quiet).sort((a, b) => prio(a) - prio(b));
  let shown = L.log.slice(ys.start, ys.mark).filter(e => !e.quiet && e.kind !== 'compare' && e.kind !== 'birth').length;
  for (const e of fresh) {
    const t = topicOf(e);
    if (prio(e) === 0) shown++;
    else if (shown < target && !seen.has(t)) { shown++; seen.add(t); }          // 같은 해 같은 주제는 한 번만 보인다
    else e.quiet = true;
  }
  // 선택이 뒤늦게 붙어 상한을 넘으면 낮은 우선순위(나중 것부터)를 quiet로
  for (let over = year.concat(fresh.filter(e => !year.includes(e))).filter(e => !e.quiet).length - FEED_MAX; over > 0; over--) {
    const v = L.log.slice(ys.start).filter(e => !e.quiet && e.kind !== 'compare' && e.kind !== 'birth' && prio(e) > 0).sort((a, b) => prio(b) - prio(a))[0];
    if (!v) break;
    v.quiet = true;
  }
  ys.mark = L.log.length;
}

function endYear(L) {
  const m = L.money;
  m.assets = Math.round(m.assets);
  for (const k in m.loans) m.loans[k] = Math.round(m.loans[k]);
  m.debt = Object.values(m.loans).reduce((x, y) => x + y, 0);
  L.hist[L.age] = { s: STAT_KEYS.map(k => L.stats[k]), i: ISSUE_KEYS.map(k => L.issues[k]) };
}

function run(L, from) {
  while (L.yr.phase < PHASES.length) {
    L.yr.snapP = profileOf(L);                 // 사건별 impact 기준선(QA #4): 단계 시작 시점
    PHASES[L.yr.phase++][1](L);
    if (L.pending || !L.alive) break;
  }
  if (!L.pending) endYear(L);
  flushQuiet(L);
  const ch = chapterOf(L.age);
  // summary: 이정표 결정이 없는 해(빨리감기 한 줄 요약 대상, PROCESS-V2 §1)
  return { entries: L.log.slice(from), choice: L.pending, compare: L.yr.phase > COMPARE_PHASE && L.yr.compare && !L.yr.compareSent ? (L.yr.compareSent = true, L.yr.compare) : null, died: !L.alive,
    summary: !L.pending?.major && !L.log.slice(L.yr.start).some(e => e.decision), chapter: { n: ch.n, title: ch.title } };
}
const COMPARE_PHASE = PHASES.findIndex(p => p[0] === 'compare');

// 1년 진행(비교 카드 객체는 index.js가 붙인다)
export function advance(L) {
  if (L.pending) throw new Error('대기 중인 선택이 있습니다. choose()를 먼저 호출하세요.');
  if (!L.alive) throw new Error('이미 끝난 생애입니다.');
  if (L.age === 0) {                       // 0세 → 1세 사이의 사망 위험(q0)은 첫 진행 직전에 판정
    reseed(L);
    L.yr = { phase: PHASES.length, asked: false, start: L.log.length, mark: L.log.length, oop: 0, compare: null };
    if (infantStep(L, makeCtx(L))) { endYear(L); return run(L, L.yr.start); }
  }
  L.age++; L.year++;
  reseed(L);
  L.yr = { phase: 0, asked: false, start: L.log.length, mark: L.log.length, oop: 0, compare: null };
  return run(L, L.log.length);
}
function reseed(L) {
  L.rng = R.makeRng(R.hashSeed(L.seed, 's', L.age));
  L.rngC = R.makeRng(R.hashSeed(L.seed, 'c', L.age));
}

export function resolve(L, optionId, { auto = false } = {}) {
  const req = L.pending;
  if (!req) throw new Error('대기 중인 선택이 없습니다.');
  L.pending = null;
  const from = L.log.length;
  resolveChoice(L, req, optionId, { auto });
  return run(L, from);
}

// 남은 생애를 끝까지(선택은 정책: 'default' | 'cap'(15분 상한 — 기본값 + 상한 표시) | (L, req) => optionId)
export function finish(L, policy = 'default') {
  if (policy === 'cap') { if (L.alive) L.flags.capped = L.age; policy = 'default'; }
  const fn = typeof policy === 'function' ? policy : null;
  while (L.alive) {
    if (L.pending) resolve(L, fn ? fn(L, L.pending) : L.pending.defaultId, { auto: !fn });
    else advance(L);
  }
  return L;
}
