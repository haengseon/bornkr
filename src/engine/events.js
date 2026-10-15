// 우연 사건·시대 뉴스 런타임(ARCHITECTURE §8, GDD §8.1·§9).
import { EVENTS, ERA_EVENTS } from '../content/events/index.js';
import CORE from '../content/jobs-core.js';
import { CHANCE_SCALE, CHOICE_SCALE, CHOICE_GAP, STAGE_CAP, MAX_CHANCE_PER_YEAR } from './tuning.js';
import { stageOf } from './clock.js';
import { fill } from './text.js';
import { sensFields as sens } from './safety.js';
import { REGION } from './tables.js';
import { jobByCode } from './systems/career.js';
import { leanFromChoice } from './stats.js';
import { fxEffects, fxRisk } from './milestones.js';
import { eventFrom } from './anachro.js';

const LIMITED = new Set(['violence', 'abuse', 'sexual']);
let BUCKET = null;
const JOB_EV = new Map();                       // 직업 코드·소분류 → 핵심 직업 사건(나이 버킷에 넣지 않고 그 직업일 때만 본다: 성능)
const BY_ID = new Map();

// 핵심 직업 고유 사건: 그 직업(또는 같은 소분류 묶음)일 때만 후보(GDD §10.5)
function coreEvents() {
  const out = [];
  for (const c of CORE || []) {
    const minor = c.shared?.startsWith('minor:') ? c.shared.slice(6) : null;
    const mine = L => L.job.code === c.code || (minor && L.job.code && jobByCode(L.job.code)?.minor === minor);
    for (const ev of c.events || []) {
      out.push({ ...ev, _code: c.code, _minor: minor, tags: [...new Set([...(ev.tags || []), 'job'])], when: (L, ctx) => mine(L) && (!ev.when || ev.when(L, ctx)) });
    }
  }
  return out;
}

function index() {
  if (BUCKET) return;
  BUCKET = Array.from({ length: 121 }, () => []);
  for (const ev of [...EVENTS, ...coreEvents()]) {
    if (ev.sensitive === 'selfharm') continue;          // 자해 범주 생애 사건은 두지 않는다(§15)
    BY_ID.set(ev.id, ev);
    if (ev._code) { for (const k of [ev._code, ev._minor && 'm:' + ev._minor]) if (k) (JOB_EV.get(k) || JOB_EV.set(k, []).get(k)).push(ev); continue; }
    const [a0, a1] = ev.ages || [0, 120];
    for (let a = Math.max(0, a0); a <= Math.min(120, a1); a++) BUCKET[a].push(ev);
  }
  for (const ev of ERA_EVENTS) BY_ID.set(ev.id, ev);
}
export const eventById = id => (index(), BY_ID.get(id));

export function textVars(L) {
  return {
    name: L.name, given: L.given, region: REGION[L.home.region]?.label ?? L.home.region,
    regionFull: REGION[L.home.region]?.full, year: L.year, age: L.age, title: L.job.title,
  };
}

const FROM = new WeakMap();
const inYears = (ev, y) => {
  let f = FROM.get(ev); if (f === undefined) FROM.set(ev, f = eventFrom(ev));        // 문구가 요구하는 시대(anachro.js)
  return y >= f && (!ev.years || (y >= ev.years[0] && y <= ev.years[1]));
};
const pOf = (ev, L, ctx) => (typeof ev.p === 'function' ? ev.p(L, ctx) : ev.p ?? 0);

function basicOk(L, ev, ctx) {
  if (!inYears(ev, L.year)) return false;
  if (ev.once && L.fired[ev.id]) return false;
  if ((L.cooldown[ev.id] ?? 0) > L.year) return false;
  if (LIMITED.has(ev.sensitive) && (L.tally.sens || 0) >= 2) return false;
  return !ev.when || !!ev.when(L, ctx);
}
function choiceBlocked(L) {
  const st = stageOf(L.age).id;
  return L.yr.asked || !!L.pending || L.stageChoices[st].chance >= STAGE_CAP[st].chance || (CHOICE_GAP === 'chance' ? L.lastChanceAge : L.lastChoiceAge) === L.age - 1;
}

function fire(L, ctx, ev) {
  const vars = textVars(L);
  const txt = fill(ev.text, vars, ctx);
  L.fired[ev.id] = (L.fired[ev.id] || 0) + 1;
  if (ev.cooldown) L.cooldown[ev.id] = L.year + ev.cooldown;
  if (ev.tags?.includes('dark') && L.tagYear.dark !== L.year) L.flags.darkPrev = L.tagYear.dark ?? null;   // 어두운 사건 연타 감시
  for (const t of ev.tags || []) L.tagYear[t] = L.year;
  if (ev.tags?.includes('firstChoice')) L.flags.firstChoice = L.age;
  if (ev.tags?.includes('victim')) L.flags.victim = L.year;
  if (LIMITED.has(ev.sensitive)) L.tally.sens = (L.tally.sens || 0) + 1;
  const entry = ctx.emit({ kind: 'event', id: ev.id, text: txt, ...(ev.reason && { reason: ev.reason }), ...(ev.tags && { tags: ev.tags }), ...(ev.fx && { effects: ev.fx }), ...(ev.src && { src: ev.src }), ...sens(L, ev.sensitive) });
  ctx.apply(ev.fx, { reason: ev.reason ?? txt, src: ev.src });
  ev.do?.(L, ctx.act);
  if (ev.choice) {
    entry.asked = true;
    ctx.ask({
      eventId: ev.id, prompt: fill(ev.choice.prompt, vars, ctx), defaultId: typeof ev.choice.default === 'function' ? ev.choice.default(L, ctx) : ev.choice.default, sensitive: ev.sensitive || undefined,
      options: ev.choice.options.map(o => ({ id: o.id, label: o.label, ...(o.hint && { hint: o.hint }), effects: fxEffects(o), risk: fxRisk(o) })),
    });
  }
}

// 3단계: 시대 뉴스 1년 최대 1건(GDD §8.1)
export function eraStep(L, ctx) {
  index();
  let best = [], top = -Infinity;
  for (const ev of ERA_EVENTS) {
    if (ev.ages && (L.age < ev.ages[0] || L.age > ev.ages[1])) continue;
    if (ev.once !== false && L.fired[ev.id]) continue;
    if (ev.sensitive === 'disaster' && (L.tally.disaster || 0) >= 3) continue;
    if (!basicOk(L, ev, ctx)) continue;
    const w = ev.weight ?? 1;
    if (w > top) { top = w; best = [ev]; } else if (w === top) best.push(ev);
  }
  if (!best.length) return;
  const e = best.length > 1 ? ctx.pick(best) : best[0];
  if (e.p != null && !ctx.chance(pOf(e, L, ctx))) return;
  const tier = L.age <= 6 ? 'child' : L.age <= 14 ? 'teen' : 'adult';
  const txt = fill(e.tiers?.[tier] ?? e.text, textVars(L), ctx);
  L.fired[e.id] = (L.fired[e.id] || 0) + 1;
  if (e.sensitive === 'disaster') L.tally.disaster = (L.tally.disaster || 0) + 1;
  const stats = Object.fromEntries(Object.entries(e.fx?.stats || {}).map(([k, v]) => [k, Math.max(-3, Math.min(3, v))]));
  const fx = e.fx && { ...e.fx, stats };
  ctx.emit({ kind: 'news', id: e.id, text: txt, ...(fx && { effects: fx }), ...(e.src && { src: e.src }), ...sens(L, e.sensitive) });
  ctx.apply(fx, { reason: e.reason ?? txt, src: e.src });
  L.yr.news = e.id;
}

// 4단계: 우연 사건(1년 최대 2건, 선택 1건, 5세 firstChoice 보장)
export function chanceStep(L, ctx) {
  index();
  const age = Math.min(120, L.age), st = stageOf(L.age).id;
  let n = 0;
  if (L.age === 5 && L.flags.firstChoice == null && !L.yr.asked && !L.pending && L.stageChoices[st].chance < STAGE_CAP[st].chance) {
    const fc = BUCKET[age].filter(ev => ev.choice && ev.tags?.includes('firstChoice') && basicOk(L, ev, ctx));
    if (fc.length) { fire(L, ctx, ctx.pick(fc)); n++; }
  }
  const jc = L.job.code, jobEv = jc ? [...(JOB_EV.get(jc) || []), ...(JOB_EV.get('m:' + jobByCode(jc)?.minor) || [])].filter(ev => !ev.ages || (age >= ev.ages[0] && age <= ev.ages[1])) : [];
  const cands = [...BUCKET[age], ...new Set(jobEv)].filter(ev => !L.fired[ev.id] || !ev.once).filter(ev => basicOk(L, ev, ctx));
  // 희귀 사건(tags 'rare'): 별도 풀, 1년 1건·생애 2건(콘텐츠 rare.js)
  if ((L.tally.rare || 0) < 2) {
    for (const ev of cands) if (ev.tags?.includes('rare') && !(ev.choice && choiceBlocked(L)) && ctx.chance(pOf(ev, L, ctx))) { fire(L, ctx, ev); L.tally.rare = (L.tally.rare || 0) + 1; break; }
  }
  // 어두운 사건(tags 'dark'): 2년 연속 났으면 올해는 막는다(3년 연타 금지)
  const darkBlocked = L.tagYear.dark === L.year - 1 && L.flags.darkPrev === L.year - 2;
  for (let i = cands.length - 1; i > 0; i--) {           // 결정적 셔플
    const j = Math.floor(ctx.rand() * (i + 1));
    [cands[i], cands[j]] = [cands[j], cands[i]];
  }
  for (const ev of cands) {
    if (n >= MAX_CHANCE_PER_YEAR) break;
    if (ev.choice && choiceBlocked(L)) continue;
    if (ev.once && L.fired[ev.id]) continue;
    if (ev.tags?.includes('rare') || (darkBlocked && ev.tags?.includes('dark'))) continue;
    let p = pOf(ev, L, ctx) * CHANCE_SCALE[st] * (ev.choice ? CHOICE_SCALE[st] : 1);
    if (ev.tags?.some(t => t !== 'recovery' && L.tagYear[t] >= L.year - 2)) p *= 0.1;
    if (ev.tags?.includes('recovery') && L.flags.victim && L.year - L.flags.victim <= 3) p = Math.max(p, 0.5);
    if (ev.tags?.includes('recovery') && L.tagYear.dark >= L.year - 2) p = Math.max(p, 0.3);   // 어두운 일 뒤 회복 사건 비율 확보
    if (ctx.chance(p)) { fire(L, ctx, ev); n++; }
  }
}

export function resolveEventChoice(L, ctx, req, optId, auto) {
  const ev = eventById(req.eventId);
  const o = ev?.choice?.options.find(x => x.id === optId);
  if (!o) return;
  const txt = fill(o.result, textVars(L), ctx);
  ctx.emit({ kind: 'choice', id: ev.id, option: optId, label: o.label, auto, text: txt, ...(ev.reason && { reason: ev.reason }), ...(o.fx && { effects: o.fx }), ...(ev.src && { src: ev.src }), ...(ev.sensitive && { sensitive: ev.sensitive }) });
  ctx.apply(o.fx, { reason: ev.reason ?? txt, src: ev.src });
  leanFromChoice(L, ev.choice.options, o);
  o.do?.(L, ctx.act);
}
