// 중대한 사건·결정: 주제 판별(어댑터), 프로필 변화 비교, 선택지 영향 칩. 순수 함수(DOM 없음).
// 엔진이 entry.major / ChoiceReq.major·topic / option.effects 를 주면 그것을 쓰고, 없으면 eventId 접두사로 추정한다.
import { STATS, ISSUES } from '../engine/constants.js';
import { STAT_LABEL, ISSUE_SHORT } from './labels.js';
import { fmtWon, nominal, fmtIncome } from './format.js';

const RULES = [
  [/^sys\.fam\.(marry|wedding|remarry)$/, 'marriage'],
  [/^sys\.fam\.(child_born|child)$/, 'child'],
  [/^sys\.fam\.dating$/, 'love'],
  [/^sys\.fam\.(widowed|parent_death|divorce|divorced|breakup|grandparent_death)$/, 'loss'],
  [/^sys\.edu\.(college_enter|grad_enter|graduate|path|high_enter|elem_enter|dropout|csat|high_type)$/, 'career'],
  [/^sys\.job\.(retire|exit_main)$/, 'retire'],
  [/^sys\.age\.pension_start$/, 'retire'],
  [/^sys\.job\.(first|first_offer|offer|lose|business_open|business_close|transition|contract_end|reemploy|return)$/, 'job'],
  [/^sys\.mil\.(enlist|discharge)$/, 'job'],
  [/^sys\.home\.(bought|buy|move|region_move|sell|jeonse_fraud|independence)$/, 'housing'],
  [/^sys\.health\.(dx_[a-z]+|disability)$/, 'care'],
];
export const topicOfId = id => { for (const [re, t] of RULES) if (re.test(String(id ?? ''))) return t; return null; };
// 엔진 필드 우선
export const topicOf = e => (e?.topic && e.topic !== 'shock' ? e.topic : null) ?? sceneTopicOf(e) ?? topicOfId(e?.id ?? e?.eventId) ?? null;
export const isMajorEntry = e => !!e && !(e.kind === 'choice' && e.auto) && !e.quiet && e.kind !== 'death' && e.kind !== 'news' && e.kind !== 'compare' && e.major !== false && (e.major === true || !!topicOfId(e.id));
export const isMajorChoice = req => !!req && (req.major === true || (req.major !== false && !!topicOfId(req.eventId)));
// 전체 화면 연출은 본인의 중대한 결정 결과·진로·가족 형성·주거 같은 큰 갈림길에만. 사별·진단·일반 사건은 작은 카드.
const BIG_TOPICS = new Set(['marriage', 'child', 'career', 'retire', 'job', 'housing', 'quit', 'closed']);
const SOFT_RE = /세상을 떠|돌아가|사별|별세|사망|숨을 거|부고|진단|암 |투병|이혼/;
export const isBigEntry = (e, text = e?.text) => !!e && !(e.kind === 'choice' && e.auto) && e.topic !== 'bereave' && e.topic !== 'loss' && e.topic !== 'care' && !SOFT_RE.test(String(text ?? '')) && (e.kind === 'choice' ? true : BIG_TOPICS.has(topicOf(e)));
export const pickMajor = entries => (entries || []).find(isMajorEntry) ?? null;

// ───────── 프로필 변화 ─────────
// a, b: profileOf() 결과, year: 지금 해(명목 환산용). 반환 [{ label, from, to }]
export function diffProfile(a, b, year, job) {
  if (!a || !b) return [];
  const out = [], mw = v => fmtWon(nominal(v, year));
  const ch = (label, x, y) => { if (x !== y && (x || y)) out.push({ label, from: x || '—', to: y || '—' }); };
  ch('거주지', a.home.regionLabel, b.home.regionLabel);
  ch('주거 형태', a.home.tenureLabel, b.home.tenureLabel);
  ch('직업', a.work.jobTitle || a.work.emp.label, b.work.jobTitle || b.work.emp.label);
  ch('고용 형태', a.work.emp.label, b.work.emp.label);
  ch('직급', a.rank?.label === '해당 없음' ? '' : a.rank?.label, b.rank?.label === '해당 없음' ? '' : b.rank?.label);
  const pa = a.pay?.annual ?? 0, pb = b.pay?.annual ?? 0;
  if (pa !== pb && Math.abs(pb - pa) >= Math.max(60, pa * 0.05)) out.push({ label: b.biz ? '연 순익' : (job && !job.regular ? '소득' : '연봉'), from: pa ? fmtIncome(nominal(pa, year), { monthly: false }).replace(/^[^ ]+ /, '') : '—', to: pb ? fmtIncome(nominal(pb, year)).replace(/^[^ ]+ /, '') : '—' });
  const na = a.money.assets - a.money.debt, nb = b.money.assets - b.money.debt;
  if (Math.abs(nb - na) >= Math.max(500, Math.abs(na) * 0.1)) out.push({ label: '자산−부채', from: mw(na), to: mw(nb) });
  return out;
}

// ───────── 영향 칩 ─────────
const STAT_KEYS = new Set(STATS.map(s => s.key));
// 지표 오름=좋음, 관심사·고민 오름=부담 → 'good'|'bad'
export const toneOf = (kind, dir) => ((kind === 'stat') === (dir > 0) ? 'good' : 'bad');
// 입력: option.effects = [{key,dir,size}] 또는 { stats:{k:d}, issues:{k:d} } → [{kind,key,dir,size,label,arrows,text,tone}]
export function effectsOf(src) {
  let list = [];
  if (Array.isArray(src)) list = src.map(e => ({ key: e.key, dir: Math.sign(e.dir || 0), size: e.size === 2 ? 2 : 1, ...(Number.isFinite(e.delta) && { delta: e.delta }) }));
  else if (src && typeof src === 'object') {
    for (const g of ['stats', 'issues']) for (const [k, d] of Object.entries(src[g] || {})) if (d) list.push({ key: k, dir: Math.sign(d), size: Math.abs(d) >= 8 ? 2 : 1 });
  }
  return list.filter(e => e.dir && (STAT_KEYS.has(e.key) || ISSUE_SHORT[e.key])).map(e => {
    const kind = STAT_KEYS.has(e.key) ? 'stat' : 'issue', label = kind === 'stat' ? STAT_LABEL[e.key] : ISSUE_SHORT[e.key];
    const arrows = Number.isFinite(e.delta) ? `${e.dir > 0 ? '▲' : '▼'}${Math.abs(e.delta)}` : (e.dir > 0 ? '▲' : '▼').repeat(e.size);
    return { ...e, kind, label, arrows, tone: toneOf(kind, e.dir), text: `${label} ${e.size === 2 ? '크게 ' : ''}${e.dir > 0 ? '오름' : '내림'}` };
  });
}
// 사건 단위 변화만(entry.impact·effects). 없으면 비어 있다 — 연간 합산(lastDeltas)을 이 일의 결과로 대입하지 않는다.
// 사별·진단 같은 상실 사건에는 좋은 방향(지표 ▲·관심사 ▼)으로 읽히는 칩을 붙이지 않는다.
const SOFT_TOPICS = new Set(['loss', 'care', 'bereave']);
export function eventImpact(e) {
  const fx = e?.effects || {}, im = e?.impact;
  const toObj = a => Array.isArray(a) ? Object.fromEntries(a.map(x => [x.key, x.delta])) : null;
  const soft = SOFT_TOPICS.has(topicOf(e));
  const pick = (kind, o, min) => Object.entries(o || {}).filter(([, d]) => Math.abs(d) >= min && !(soft && toneOf(kind, d) === 'good'));
  return {
    stats: pick('stat', toObj(im?.stats) ?? fx.stats, 1),
    issues: pick('issue', toObj(im?.issues) ?? fx.issues, 2),
    profile: Array.isArray(im?.profile) ? im.profile.map(x => x.text).filter(Boolean) : [],
  };
}
export const ISSUE_KEYS_ALL = ISSUES.map(i => i.key);

// ───────── 챕터(PROCESS-V2 §2) ─────────
// 엔진이 L.chapter / ChoiceReq.chapter 를 주면 그것을 쓰고, 없으면 나이로 추정(이정표 나이대가 겹치므로 시작 나이로 자른다).
export const CHAPTERS = [
  { n: 1, label: '유년', from: 0 }, { n: 2, label: '진로', from: 13 }, { n: 3, label: '첫 일', from: 20 }, { n: 4, label: '독립', from: 24 },
  { n: 5, label: '연애·결혼', from: 27 }, { n: 6, label: '가족', from: 31 }, { n: 7, label: '커리어', from: 36 }, { n: 8, label: '부양', from: 46 },
  { n: 9, label: '퇴직', from: 56 }, { n: 10, label: '노후', from: 66 },
];
export function chapterOf(L, req, hint) {
  const raw = hint ?? req?.chapter ?? L.chapter, n = raw?.n ?? raw;
  if (n === 0) return { n: 0, label: req?.chapterTitle ?? '시대의 충격' };
  if (Number.isInteger(n) && CHAPTERS[n - 1]) return { ...CHAPTERS[n - 1], label: raw?.title ?? req?.chapterTitle ?? CHAPTERS[n - 1].label };
  return [...CHAPTERS].reverse().find(c => L.age >= c.from) ?? CHAPTERS[0];
}

// ───────── 시대 충격(속보) ─────────
const SHOCK_RE = /IMF|외환위기|금융위기|코로나|팬데믹|오일\s?쇼크|석유\s?파동|카드\s?대란/;
export const isShockEntry = () => false;   // 중대 뉴스(속보 연출) 없음: IMF·금융위기도 일반 뉴스 줄로 나온다

// 소주제(장면 그래픽): 퇴사·계약만료, 폐업, 대출
export function sceneTopicOf(e) {
  const id = String(e?.id ?? e?.eventId ?? '');
  if (/^sys\.job\.(lose|contract_end|exit_main)$/.test(id)) return id.endsWith('exit_main') ? 'retire' : 'quit';
  if (/^sys\.job\.business_close$/.test(id)) return 'closed';
  if (/^sys\.money\.(loan|debt_relief|deficit)$/.test(id)) return 'loan';
  return null;
}

// 선택지 위험도
export const RISK = { low: { icon: 'shield', label: '안정', n: 1 }, mid: { icon: 'dice', label: '보통', n: 2 }, high: { icon: 'ladder', label: '승부', n: 3 } };
export const riskOf = o => RISK[o?.risk] ?? null;
export const RESULT_LABEL = { success: '성공', hold: '보류', regret: '아쉬움', miss: '아쉬움' };
