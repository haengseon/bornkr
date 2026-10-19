// 사건·뉴스에 붙는 '마음 한 줄'(순수·결정적). 상태를 바꾸지 않는다. 문장은 src/content/reactions.js.
import { hashSeed } from './rng.js';
import { needYear } from './anachro.js';
import { AXIS_LINES, bucketOf, ERA_LINES, eraBucketOf, PERSONAL_LINES, MBTI_AXIS_LINES, MBTI_ERA_LINES } from '../content/reactions.js';
import { sig } from './mbti.js';

const usable = (list, year) => list.filter(s => needYear(s) <= year);
const pick = (list, h, year) => { const f = usable(list, year); return f.length ? f[h % f.length] : null; };
// 뉴스 렌즈(게임용 성향): S/N·T/F 중 더 뚜렷한 축의 글자(50에서 12 이상), 13세 이상만. 없으면 null.
export function lensOf(L, age) {
  if (age < 13) return null;
  const [ch, v] = [['N', sig(L, 'N')], ['T', sig(L, 'T')]].sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))[0];
  return Math.abs(v) < 0.24 ? null : v > 0 ? ch : ch === 'N' ? 'S' : 'F';
}
const sensIdx = L => { const v = L.traits?.sens ?? 50; return v < 40 ? 0 : v >= 60 ? 2 : 1; };

// 반응이 필요 없는 항목은 null.
export function reactionFor(e, L) {
  if (!e || !L || e.kind === 'death' || e.kind === 'compare') return null;
  const year = e.year ?? L.year ?? 9999, age = e.age ?? L.age ?? 30;
  const id = String(e.id ?? ''), h = hashSeed(L.seed, id || e.text || '', year);
  if (e.kind === 'news' || e.shock || /^era\./.test(id)) {
    const text = `${id} ${e.text ?? ''} ${e.headline ?? ''}`;
    const t = ERA_LINES.find(x => year >= x.from && year <= x.to && x.re.test(text));
    const lens = lensOf(L, age);
    // 시대 사건: 렌즈가 있으면 절반은 유형별 생각, 절반은 시대 공통 문장
    if (t) return lens && h % 2 ? pick(MBTI_ERA_LINES[lens], h >>> 1, year) ?? pick(t.lines[eraBucketOf(age)], h, year) : pick(t.lines[eraBucketOf(age)], h, year);
    const fx = Object.entries(e.effects?.issues ?? {}).sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))[0];
    const key = fx?.[0] ?? e.axes?.[0], axis = AXIS_LINES[key], dir = fx && fx[1] < 0 ? 'down' : 'up';
    if (lens && MBTI_AXIS_LINES[key]) return pick([MBTI_AXIS_LINES[key][dir][lens]], h, year) ?? (axis ? pick(axis[dir][bucketOf(age)], h, year) : null);   // 축 뉴스: 유형별 생각
    if (!axis && lens && (e.shock || /^era\./.test(id))) return pick(MBTI_ERA_LINES[lens], h, year);
    return axis ? pick(axis[dir][bucketOf(age)], h, year) : null;
  }
  const t = PERSONAL_LINES.find(x => x.re.test(`${id} ${e.option ?? ''}`));
  if (t) return usable([t.lines[sensIdx(L)]], year)[0] ?? null;
  return null;
}

// 한 해 최대 max개만 통과시키는 호출기(같은 항목은 같은 답). UI 가 사용한다.
// 같은 틀의 마음 줄('담담히 ~했지만', '~를 따져 보았다', '한숨 돌렸다')은 생애당 한 번만(R9).
const FRAMES = [/담담/, /따져 보았|계산해 보았|계산했다/, /한숨 돌렸/];
export function createReactor(max = 2) {
  const memo = new Map(), cnt = new Map(), framed = new Set();
  return (e, L) => {
    if (!e || !L) return '';
    const year = e.year ?? L.year, key = `${L.seed}|${e.id ?? e.text}|${year}`;
    if (memo.has(key)) return memo.get(key);
    let out = reactionFor(e, L) ?? '';
    const fi = out ? FRAMES.findIndex(re => re.test(out)) : -1;
    if (fi >= 0) { if (framed.has(`${L.seed}|${fi}`)) out = ''; else framed.add(`${L.seed}|${fi}`); }
    const yk = `${L.seed}|${year}`;
    if (out) { const c = cnt.get(yk) ?? 0; if (c >= max) out = ''; else cnt.set(yk, c + 1); }
    memo.set(key, out);
    return out;
  };
}
