// 게임용 성향(MBTI 풍, 실제 검사 아님). 핵심 상태 L.mbti = { EI, SN, TF, JP }(0~100, 50 기준 E·N·F·J 쪽이 높음).
// L.traits 는 호환 레이어: extra←EI, open←SN, agree←TF, consc←JP 를 그대로 읽고 쓰는 접근자, sens 는 '예민도'(타고난 값 + N·F·I 가중).
// 근거·분포: docs/research/personality/R18-mbti.md, 설계: docs/impl/mbti-notes.md.
import * as R from './rng.js';
import { LEAN, LETTER_LABEL, KR_TYPES, KR_SEX_AXIS, optionLean, JOB_LEAN, ODDS_LEAN, FX_SCALE } from '../content/mbti-lean.js';

export const AXES = ['EI', 'SN', 'TF', 'JP'];
const TRAIT_OF = { EI: 'extra', SN: 'open', TF: 'agree', JP: 'consc' };
const LETTER = { E: ['EI', 1], I: ['EI', -1], N: ['SN', 1], S: ['SN', -1], F: ['TF', 1], T: ['TF', -1], J: ['JP', 1], P: ['JP', -1] };
const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));

// 축 값: L.mbti 우선, 없으면(옛 L·테스트용 가짜 L) traits 로
export const axis = (L, k) => L?.mbti?.[k] ?? L?.traits?.[TRAIT_OF[k]] ?? 50;
// 글자 신호 ∈ [-1,1]: 그 글자 쪽으로 얼마나 기울었나
export const sig = (L, ch) => { const [k, d] = LETTER[ch]; return d * (axis(L, k) - 50) / 50; };
// 뚜렷한 선호(기본 ±10 이상)
export const has = (L, ch, th = 10) => sig(L, ch) * 50 >= th;
// 유형 4글자와 축별 흐림(45~55)
export const typeOf = m => AXES.map((k, i) => ((m?.[k] ?? 50) >= 50 ? 'ENFJ' : 'ISTP')[i]).join('');
export const weakOf = m => AXES.map(k => Math.abs((m?.[k] ?? 50) - 50) < 5);

// 호환 레이어: 접근자로 mbti 를 읽고 쓴다(JSON·전개 시 값으로 복사됨). sens 는 타고난 값(base) + 유형 가중.
export function bindTraits(m, sensBase = 50) {
  let base = sensBase;
  const sens = () => clamp(Math.round(base + 0.2 * (m.SN - 50) + 0.2 * (m.TF - 50) - 0.2 * (m.EI - 50)), 5, 95);
  const t = {};
  for (const [k, tk] of Object.entries(TRAIT_OF)) Object.defineProperty(t, tk, { enumerable: true, get: () => m[k], set: v => { m[k] = clamp(Math.round(v), 5, 95); } });
  Object.defineProperty(t, 'sens', { enumerable: true, get: sens, set: v => { base += v - sens(); } });
  return t;
}

// 출생 시 유형: 한국 16유형 분포(성별 축 보정)에서 뽑고, 각 축의 세기는 반정규. 본 난수 흐름과 분리된 해시 RNG(기존 추첨 순서 불변).
export function birthMbti(seed, sex) {
  const r = R.makeRng(R.hashSeed(seed, 'mbti'));
  const adj = KR_SEX_AXIS[sex] ?? {};
  const w = Object.fromEntries(Object.entries(KR_TYPES).map(([ty, p]) => [ty, p * [...ty].reduce((m, ch) => m * (adj[ch] ?? 1), 1)]));
  const ty = R.weighted(r, w);
  return Object.fromEntries(AXES.map((k, i) => [k, Math.round(clamp(50 + ('ENFJ'.includes(ty[i]) ? 1 : -1) * (2 + 16 * Math.abs(R.normal(r))), 5, 95))]));
}
export function initMbti(L, sensBase) {
  const base = birthMbti(L.seed, L.sex);
  L.mbti = Object.fromEntries(AXES.map(k => [k, 50 + Math.sign(base[k] - 50) * Math.max(1, Math.round(Math.abs(base[k] - 50) / 3))]));
  L.traits = bindTraits(L.mbti, sensBase);
  Object.defineProperty(L, 'mbtiType', { enumerable: false, configurable: true, get() { return typeOf(this.mbti); } });
}

// JSON으로 복원된 상태에서도 traits와 mbti가 서로 다른 객체로 갈라지지 않게 한다.
export function restoreMbti(L) {
  if (!L.mbti || Object.getOwnPropertyDescriptor(L.traits || {}, 'extra')?.get) return;
  const m = L.mbti, base = (L.traits?.sens ?? 50) - .2 * (m.SN - 50) - .2 * (m.TF - 50) + .2 * (m.EI - 50);
  L.traits = bindTraits(m, base);
}

// 선택지 점수: 그 선택이 이 사람 성향에 얼마나 어울리나. lean = 'NE' 또는 {N:1,E:0.5}
const score = (L, lean) => (typeof lean === 'string' ? [...lean].map(ch => [ch, 1]) : Object.entries(lean || {})).reduce((s, [ch, w]) => s + w * sig(L, ch), 0);
const leanOf = (eventId, o) => LEAN[eventId]?.[o.id] ?? optionLean(o);
const scored = (L, eventId, options) => options.map(o => ({ id: o.id, s: score(L, leanOf(eventId, o)) }));
const topLetter = (L, lean) => (typeof lean === 'string' ? [...lean] : Object.keys(lean || {})).map(ch => [ch, sig(L, ch)]).filter(([, v]) => v >= 0.2).sort((a, b) => b[1] - a[1])[0]?.[0];

// 기본 행동 보정(직접 고르지 않은 자리): 원래 기본값보다 확실히(0.3 이상) 더 어울리는 선택이 있으면 그것을.
// 반환: { id, mbti:{letter,label}|null } — mbti는 이 기본 선택에 성향이 작용했을 때만.
export function traitPick(L, eventId, options, defaultId) {
  if (!LEAN[eventId] || options.length < 2) return { id: defaultId, mbti: null };
  const sc = scored(L, eventId, options);
  const cur = sc.find(x => x.id === defaultId) ?? sc[0];
  const best = sc.reduce((a, b) => (b.s > a.s ? b : a));
  const pickId = best.id !== cur.id && best.s - cur.s >= 0.3 ? best.id : cur.id;
  const letter = topLetter(L, LEAN[eventId][pickId]);
  return { id: pickId, mbti: letter ? { letter, label: LETTER_LABEL[letter] } : null };
}
// '성향 적합' 표시(추천일 뿐 기본값을 바꾸지 않는다): 가장 어울리는 선택이 2등보다 뚜렷이(0.25 이상) 앞설 때만 그 id, 아니면 null.
export function traitFit(L, eventId, options) {
  if (!L || !options || options.length < 2) return null;
  const sc = scored(L, eventId, options).sort((a, b) => b.s - a.s);
  return sc[0].s >= 0.2 && sc[0].s - sc[1].s >= 0.25 ? sc[0].id : null;
}
// 직접 고른 시스템 선택은 그 선택의 성향 쪽으로 축을 조금(글자당 1) 움직인다.
export function mbtiNudge(L, eventId, optId) {
  const lean = LEAN[eventId]?.[optId];
  if (!lean || !L.mbti || L.age >= 19) return;
  for (const ch of typeof lean === 'string' ? lean : Object.keys(lean)) { const [k, d] = LETTER[ch]; L.mbti[k] = clamp(L.mbti[k] + d, 5, 95); }
}
// 결과 오즈(stats.leanOdds 가 곱함): 지표 쪽 성향 보정 ×0.8~×1.25 정도
export const mbtiOdds = (L, k, sign = 1) => (ODDS_LEAN[k] ? Math.exp(sign * score(L, ODDS_LEAN[k])) : 1);
// 직업 대분류 가중(career.assignJob): ×0.8~×1.25
export const jobBias = (L, major) => (JOB_LEAN[major] ? Math.exp(score(L, JOB_LEAN[major])) : 1);
// 지표·고민 증감 배율(life.apply): F형 관계 변화 민감, T형 일자리 불안 덜 민감 등. 행복·관계는 예민도도 반영(기존 식).
export function fxScale(L, group, k) {
  const base = group === 'stats' && (k === 'happiness' || k === 'relations') ? 0.85 + 0.3 * (L.traits?.sens ?? 50) / 100 : 1;
  const lean = FX_SCALE[group]?.[k];
  return lean ? base * (1 + score(L, lean)) : base;
}

// 성장기의 환경만 성향 형성에 반영. 성인 이후 네 축은 고정한다.
export function growMbti(L) {
  if (!L.mbti || L.age < 1 || L.age >= 19) return;
  const r = R.makeRng(R.hashSeed(L.seed, 'mbti-growth', L.age));
  const env = {
    EI: ((L.stats.relations ?? 50) - 50) / 70,
    SN: ((L.stats.intellect ?? 50) - 50) / 75,
    TF: ((L.stats.relations ?? 50) - 50) / 100 + ((L.family.parents?.mother?.bond ?? 65) - 65) / 100,
    JP: ((L.edu.score ?? 50) - 50) / 80,
  };
  const predisposition = birthMbti(L.seed, L.sex);
  for (const k of AXES) {
    const delta = clamp(Math.round((predisposition[k] - 50) / 20 + env[k] + R.normal(r, 0, .65)), -2, 2);
    L.mbti[k] = clamp(L.mbti[k] + delta, 5, 95);
  }
}
