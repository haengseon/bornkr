// 이정표(PROCESS-V2 §1·§2·§4): 인생의 중심 축은 '구경하는 로그'가 아니라 플레이어가 고르는 결정이다.
// - META: 이정표 결정(시스템 선택 ID) → 챕터·주제·선택지별 영향 칩(effects)·위험도(risk). ask()가 ChoiceReq에 붙인다.
// - step: 보장 이정표(연애·독립), 시대 충격 대응(shock), 연쇄 결정(chain) 3종을 만든다(구조 단계, 결정적).
// - 결과(result·why·impact)와 파급(ripple)은 life.js resolveChoice/emit가 META를 읽어 만든다.
import { T, yr, REGION } from './tables.js';
import { indep, homePrice } from './act.js';
import { econ, nudge } from './stats.js';

export const CHAPTERS = [
  { n: 1, id: 'child', title: '유년', from: 0, to: 12 },
  { n: 2, id: 'path', title: '진로', from: 13, to: 19 },
  { n: 3, id: 'work', title: '첫 일', from: 19, to: 29 },
  { n: 4, id: 'indep', title: '독립', from: 22, to: 35 },
  { n: 5, id: 'love', title: '연애·결혼', from: 24, to: 40 },
  { n: 6, id: 'family', title: '가족', from: 28, to: 45 },
  { n: 7, id: 'career', title: '커리어', from: 30, to: 54 },
  { n: 8, id: 'care', title: '부양', from: 40, to: 65 },
  { n: 9, id: 'retire', title: '퇴직', from: 50, to: 70 },
  { n: 10, id: 'late', title: '노후', from: 65, to: 120 },
];
// 나이로 현재 챕터(겹치면 늦게 시작한 쪽)
export const chapterOf = age => [...CHAPTERS].reverse().find(c => age >= c.from && age <= c.to) ?? CHAPTERS[0];

// 영향 칩: [지표/이슈 키, 방향 1|-1, 크기 1|2]. 확률 오즈만 바꾸는 선택도 그 지표 방향으로 적는다.
const E = (...xs) => xs.map(([key, dir, size = 1]) => ({ key, dir, size }));
export const META = {
  'sys.edu.tutoring': { ch: 1, topic: 'career', opts: { more: [E(['intellect', 1], ['leisure', -1], ['edu', 1]), 'mid'], keep: [[], 'low'], less: [E(['leisure', 1], ['intellect', -1]), 'mid'] } },
  'sys.edu.high_type': { ch: 2, topic: 'career', opts: { general: [E(['intellect', 1]), 'low'], voc: [E(['wealth', 1], ['intellect', -1]), 'mid'], special: [E(['intellect', 1, 2], ['leisure', -1], ['wealth', -1]), 'high'] } },
  'sys.edu.path': { ch: 2, topic: 'career', opts: { college: [E(['intellect', 1, 2], ['wealth', -1], ['edu', 1]), 'mid'], work: [E(['wealth', 1], ['intellect', -1], ['job', 1]), 'low'], retake: [E(['intellect', 1], ['leisure', -1, 2], ['wealth', -1]), 'high'] } },
  'sys.mil.timing': { ch: 3, topic: 'job', opts: { now: [E(['leisure', -1], ['relations', 1]), 'low'], later: [E(['intellect', 1], ['leisure', -1]), 'mid'] } },
  'sys.job.first_offer': { ch: 3, topic: 'job', opts: { take: [E(['wealth', 1, 2], ['leisure', -1]), 'low'], wait: [E(['wealth', -1], ['job', 1]), 'mid'], exam: [E(['wealth', -1, 2], ['happiness', -1], ['job', 1]), 'high'] } },
  'sys.chain.exam_retry': { ch: 3, topic: 'job', chain: 'exam', opts: { again: [E(['wealth', -1], ['happiness', -1], ['job', 1]), 'high'], quit: [E(['wealth', 1], ['happiness', 1]), 'low'] } },
  'sys.home.independence': { ch: 4, topic: 'housing', opts: { stay: [E(['relations', 1], ['leisure', -1]), 'low'], room: [E(['leisure', 1], ['wealth', -1], ['housing', 1]), 'mid'], jeonse: [E(['leisure', 1], ['wealth', -1, 2], ['housing', 1]), 'high'] } },
  'sys.home.renew': { ch: 4, topic: 'housing', once: true, opts: { pay: [E(['wealth', -1], ['housing', 1]), 'mid'], cheaper: [E(['leisure', -1], ['relations', -1]), 'low'], monthly: [E(['wealth', -1], ['living', 1]), 'mid'] } },
  'sys.fam.love': { ch: 5, topic: 'love', opts: { confess: [E(['relations', 1, 2], ['happiness', 1], ['leisure', -1]), 'high'], wait: [[], 'low'], focus: [E(['wealth', 1], ['relations', -1]), 'mid'] } },
  'sys.fam.marry': { ch: 5, topic: 'marriage', opts: { marry: [E(['relations', 1, 2], ['wealth', -1], ['leisure', -1]), 'mid'], later: [E(['leisure', 1]), 'low'], single: [E(['leisure', 1, 2], ['relations', -1]), 'mid'] } },
  'sys.fam.divorce': { ch: 5, topic: 'marriage', opts: { divorce: [E(['relations', -1, 2], ['wealth', -1], ['happiness', 1]), 'high'], counsel: [E(['happiness', 1], ['wealth', -1]), 'mid'], stay: [E(['happiness', -1]), 'low'] } },
  'sys.fam.child': { ch: 6, topic: 'child', opts: { have: [E(['relations', 1, 2], ['leisure', -1, 2], ['wealth', -1], ['care', 1]), 'mid'], wait: [E(['leisure', 1]), 'low'], none: [E(['leisure', 1, 2], ['relations', -1]), 'mid'] } },
  'sys.job.childcare': { ch: 6, topic: 'child', opts: { leave: [E(['relations', 1], ['wealth', -1], ['job', 1]), 'mid'], quit: [E(['relations', 1], ['wealth', -1, 2]), 'high'], keep: [E(['wealth', 1], ['leisure', -1, 2], ['care', 1]), 'low'] } },
  'sys.job.offer': { ch: 7, topic: 'job', once: true, opts: { move: [E(['wealth', 1, 2], ['relations', -1], ['job', 1]), 'high'], stay: [[], 'low'] } },
  'sys.job.business': { ch: 7, topic: 'job', opts: { open: [E(['wealth', 1, 2], ['leisure', -1, 2], ['job', 1]), 'high'], job: [E(['job', 1]), 'low'] } },
  'sys.chain.biz_crisis': { ch: 7, topic: 'job', chain: 'business', opts: { push: [E(['wealth', -1, 2], ['happiness', -1], ['job', 1]), 'high'], close: [E(['wealth', -1], ['leisure', 1]), 'mid'] } },
  'sys.chain.biz_rebuild': { ch: 7, topic: 'job', chain: 'business', opts: { again: [E(['wealth', 1, 2], ['leisure', -1, 2]), 'high'], work: [E(['wealth', 1], ['job', 1]), 'low'] } },
  'sys.home.buy': { ch: 7, topic: 'housing', opts: { buy: [E(['wealth', 1, 2], ['leisure', -1], ['housing', 1]), 'high'], wait: [E(['housing', 1]), 'low'] } },
  'sys.chain.mortgage': { ch: 7, topic: 'housing', chain: 'mortgage', opts: { hold: [E(['leisure', -1, 2], ['happiness', -1]), 'mid'], sell: [E(['wealth', -1], ['housing', 1]), 'mid'] } },
  'sys.fam.parent_care': { ch: 8, topic: 'care', opts: { home: [E(['relations', 1], ['leisure', -1, 2], ['care', 1, 2]), 'high'], facility: [E(['wealth', -1, 2], ['care', 1]), 'mid'], share: [E(['wealth', -1], ['leisure', -1], ['care', 1]), 'low'] } },
  'sys.job.honorary': { ch: 9, topic: 'retire', opts: { accept: [E(['wealth', 1], ['job', 1, 2]), 'mid'], stay: [E(['job', 1]), 'high'] } },
  'sys.job.after_main': { ch: 9, topic: 'retire', opts: { work: [E(['wealth', 1], ['leisure', -1]), 'low'], rest: [E(['leisure', 1, 2], ['wealth', -1]), 'mid'], shop: [E(['wealth', 1, 2], ['leisure', -1, 2]), 'high'] } },
  'sys.age.residence': { ch: 10, topic: 'retire', opts: { home: [E(['relations', 1], ['care', 1]), 'mid'], facility: [E(['wealth', -1], ['relations', -1]), 'low'], child: [E(['relations', 1, 2]), 'mid'] } },
  'sys.age.grandcare': { ch: 10, topic: 'care', opts: { yes: [E(['relations', 1, 2], ['health', -1], ['care', 1]), 'mid'], some: [E(['relations', 1]), 'low'], no: [E(['relations', -1], ['leisure', 1]), 'low'] } },
  'sys.era.shock': { ch: 0, topic: 'shock', opts: {
    hold: [E(['job', 1, 2], ['wealth', 1]), 'mid'], move: [E(['wealth', 1], ['job', 1], ['relations', -1]), 'high'],
    cut: [E(['wealth', 1], ['leisure', -1], ['living', 1]), 'low'], learn: [E(['intellect', 1], ['wealth', -1]), 'mid'],
    buy: [E(['wealth', 1, 2], ['leisure', -1, 2], ['housing', 1]), 'high'], wait: [E(['housing', 1]), 'low'], close: [E(['wealth', -1], ['leisure', 1]), 'mid'],
  } },
};

// ChoiceReq에 이정표 필드를 붙인다(META가 없으면 그대로)
export function decorate(L, full) {
  const m = META[full.eventId];
  if (!m || (m.once && L.flags['ms_' + full.eventId])) return full;   // once: 반복되는 결정은 첫 번째만 이정표
  if (m.once) L.flags['ms_' + full.eventId] = L.year;
  const ch = m.ch ? CHAPTERS[m.ch - 1] : chapterOf(L.age);
  full.major = true; full.topic = m.topic; full.chapter = ch.n; full.chapterTitle = ch.title;
  if (m.chain) full.chain = m.chain;
  full.timeoutMs = Math.max(full.timeoutMs, 20000);       // 중대 결정 카운트다운 20초(PROCESS-V2 §3)
  for (const o of full.options) { const d = m.opts[o.id]; if (d) { o.effects = d[0]; o.risk = d[1]; } }
  return full;
}

// 우연 선택 옵션의 영향 칩: fx에서 자동 계산(지표 |Δ|≥2→1, ≥5→2 / 이슈 |Δ|≥3 / 돈)
export function fxEffects(o) {
  const out = [], fx = o.fx || {};
  for (const [k, d] of Object.entries(fx.stats || {})) if (Math.abs(d) >= 2) out.push({ key: k, dir: Math.sign(d), size: Math.abs(d) >= 5 ? 2 : 1 });
  for (const [k, d] of Object.entries(fx.issues || {})) if (Math.abs(d) >= 3) out.push({ key: k, dir: Math.sign(d), size: Math.abs(d) >= 8 ? 2 : 1 });
  const m = fx.money;
  if (m && !out.some(e => e.key === 'wealth')) {
    const net = (m.assets || 0) - (m.debt || 0);
    if (net) out.push({ key: 'wealth', dir: Math.sign(net), size: Math.abs(net) >= 1000 ? 2 : 1 });
  }
  return out;
}
export const fxRisk = o => (fxEffects(o).some(e => e.size === 2) ? 'high' : fxEffects(o).length >= 2 ? 'mid' : 'low');

// ── 시대 충격(PROCESS-V2 §2 '시대 충격 대응 결정') ──
const working = L => L.job.status === 'employed' || L.job.status === 'self';
export const SHOCKS = [
  { year: 1997, id: 'imf', when: L => working(L) || L.money.debt > 0, options: L => (L.job.status === 'self' ? ['hold', 'close', 'cut'] : ['hold', 'move', 'cut']) },
  { year: 2003, id: 'card', when: L => indep(L) && L.age <= 40 && (L.money.loans.credit > 0 || L.money.assets < 1000), options: () => ['cut', 'hold'] },
  { year: 2008, id: 'gfc', when: L => working(L) || L.home.owned, options: () => ['hold', 'cut', 'learn'] },
  { year: 2020, id: 'covid', when: L => working(L) && L.age < 65, options: L => (L.job.status === 'self' ? ['hold', 'close', 'learn'] : ['hold', 'learn', 'move']) },
  { year: 2021, id: 'yeonggeul', when: L => indep(L) && !L.home.owned && L.age >= 25 && L.age <= 45 && L.home.tenure !== 'facility', options: () => ['wait', 'buy'] },
];

// 시스템 단계(생애마다 순서 고정): 보장 이정표 → 시대 충격 → 연쇄
export function step(L, ctx) {
  const a = L.age, y = L.year, fl = L.flags, f = L.family, j = L.job;
  const r = ripple(L);
  if (r) ctx.sys(`sys.ripple.${r.topic}`, { label: r.label, n: 3 }, { summary: true, ripple: r.eventId });
  // 연애 시작(보장): 26세에 짝이 없고 결혼한 적 없으면 한 번
  if (a === 26 && !f.partner && !f.married && !f.divorced && !f.widowed && !fl.loveAsked) {
    fl.loveAsked = y;
    return ctx.ask({ eventId: 'sys.fam.love', options: ['confess', 'wait', 'focus'], defaultId: 'wait' });
  }
  // 독립(보장): 30세까지 부모 집이면 한 번은 묻는다(기본값은 그대로 머묾)
  if (a === 30 && L.home.parents && !f.married && !fl.indepAsked) {
    fl.indepAsked = y;
    return ctx.ask({ eventId: 'sys.home.independence', options: ['stay', 'room', 'jeonse'], defaultId: 'stay' });
  }
  // 시대 충격 대응
  const sh = SHOCKS.find(s => s.year === y);
  if (sh && a >= 19 && sh.when(L)) {
    const options = sh.options(L);
    return ctx.ask({ eventId: 'sys.era.shock', options, defaultId: options[0], data: { shock: sh.id }, vars: { shock: SHOCK_LABEL[sh.id] } });
  }
  // 연쇄 ① 창업 → 폐업 위기 → 재기/정리
  if (j.status === 'self' && fl.business && y - fl.business >= 2 && y - fl.business <= 5 && !fl.bizCrisis && L.stats.wealth < 45) {
    fl.bizCrisis = y;
    return ctx.ask({ eventId: 'sys.chain.biz_crisis', options: ['push', 'close'], defaultId: 'push' });
  }
  if (fl.bizClosed === y - 1 && a < 60 && !fl.bizRebuild) {
    fl.bizRebuild = y;
    return ctx.ask({ eventId: 'sys.chain.biz_rebuild', options: ['again', 'work'], defaultId: 'work' });
  }
  // 연쇄 ② 영끌·매수 → 금리 부담 → 버티기/매도
  if (L.home.owned && L.home.boughtYear >= y - 5 && !fl.mortgageAsked && econ(L).dsr > 0.4) {
    fl.mortgageAsked = y;
    return ctx.ask({ eventId: 'sys.chain.mortgage', options: ['hold', 'sell'], defaultId: 'hold' });
  }
  // 연쇄 ③ 공시 → 불합격 → 한 번 더/그만
  if (fl.examFailed === y && a < 35 && (fl.examTries || 1) < 4) {
    return ctx.ask({ eventId: 'sys.chain.exam_retry', options: ['again', 'quit'], defaultId: 'quit' });
  }
}
const SHOCK_LABEL = { imf: '외환위기', card: '카드 대란', gfc: '금융위기', covid: '코로나19', yeonggeul: '집값 급등' };

export const choices = {
  'sys.fam.love'(L, ctx, opt) {
    if (opt === 'confess') { L.family.dating = true; L.flags.loveBoost = L.year + 3; nudge(L, 'relations', 0.4); }
    if (opt === 'focus') { L.flags.loveFocus = L.year + 3; nudge(L, 'wealth', 0.4); }
  },
  'sys.era.shock'(L, ctx, opt, { shock }) {
    const fl = L.flags, y = L.year;
    fl.shock = { id: shock, opt, year: y };
    if (opt === 'move' && L.job.status === 'employed') { ctx.act.endJob('이직'); fl.waitBoost = y + 1; }
    else if (opt === 'close' && L.job.status === 'self') ctx.act.closeBusiness();
    else if (opt === 'cut') { ctx.act.repay(L.money.assets * 0.5); nudge(L, 'wealth', 0.4); ctx.apply({ stats: { leisure: -3 } }, { reason: '허리띠를 졸랐다' }); }
    else if (opt === 'learn') { ctx.act.spend(300 * yr(T('ERA_INCOME_INDEX'), y)); nudge(L, 'intellect', 0.4); fl.learnUntil = y + 3; }
    else if (opt === 'buy') { ctx.act.move('own', { reason: '매수', price: Math.round(homePrice(L) * 0.7), silent: true }); ctx.sys('sys.home.bought', { regionLabel: REGION[L.home.region]?.label, loan: Math.round(L.money.loans.mortgage) }); }
  },
  'sys.chain.biz_crisis'(L, ctx, opt) {
    if (opt === 'push') { ctx.act.borrow(2000 * yr(T('ERA_INCOME_INDEX'), L.year), 'business', { silent: true }); L.flags.bizPush = L.year + 3; }
    else ctx.act.closeBusiness();
  },
  'sys.chain.biz_rebuild'(L, ctx, opt) {
    if (opt === 'again') ctx.act.startBusiness();
  },
  'sys.chain.mortgage'(L, ctx, opt) {
    if (opt === 'sell') ctx.act.move('jeonse', { reason: '대출 부담', involuntary: true });
    else ctx.apply({ stats: { leisure: -3, happiness: -2 } }, { reason: '대출 이자를 버텼다' });
  },
  'sys.chain.exam_retry'(L, ctx, opt) {
    L.flags.examFailed = null;
    if (opt === 'again') { L.flags.examTries = (L.flags.examTries || 1) + 1; L.flags.examUntil = L.year + 1; ctx.act.spend(500); }
  },
};

// 결정 뒤 몇 해 지나 돌아오는 한 줄(PROCESS-V2 §3-6). 3년 뒤, 이정표 결정 1건씩.
export function ripple(L) {
  const d = (L.decisions || []).find(x => x.year === L.year - 3 && !x.rippled && !x.def);   // 파급은 기본값과 다른 결정만
  if (!d) return null;
  d.rippled = true;
  return { topic: d.topic, label: d.label, eventId: d.eventId };
}
