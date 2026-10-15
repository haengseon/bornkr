// 사건·뉴스에 붙는 '마음 한 줄'(순수·결정적). 상태를 바꾸지 않는다. 문장은 src/content/reactions.js.
import { hashSeed } from './rng.js';
import { needYear } from './anachro.js';
import { AXIS_LINES, bucketOf, ERA_LINES, eraBucketOf, PERSONAL_LINES, DECISION_LINES } from '../content/reactions.js';

const usable = (list, year) => list.filter(s => needYear(s) <= year);
const pick = (list, h, year) => { const f = usable(list, year); return f.length ? f[h % f.length] : null; };
const sensIdx = L => { const v = L.traits?.sens ?? 50; return v < 40 ? 0 : v >= 60 ? 2 : 1; };

// 반응이 필요 없는 항목은 null.
export function reactionFor(e, L) {
  if (!e || !L || e.kind === 'death' || e.kind === 'compare') return null;
  const year = e.year ?? L.year ?? 9999, age = e.age ?? L.age ?? 30;
  const id = String(e.id ?? ''), h = hashSeed(L.seed, id || e.text || '', year);
  if (e.kind === 'news' || e.shock || /^era\./.test(id)) {
    const text = `${id} ${e.text ?? ''} ${e.headline ?? ''}`;
    const t = ERA_LINES.find(x => year >= x.from && year <= x.to && x.re.test(text));
    if (t) return pick(t.lines[eraBucketOf(age)], h, year);
    const fx = Object.entries(e.effects?.issues ?? {}).sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))[0];
    const key = fx?.[0] ?? e.axes?.[0], axis = AXIS_LINES[key];
    return axis ? pick(axis[fx && fx[1] < 0 ? 'down' : 'up'][bucketOf(age)], h, year) : null;
  }
  const t = PERSONAL_LINES.find(x => x.re.test(`${id} ${e.option ?? ''}`));
  if (t) return usable([t.lines[sensIdx(L)]], year)[0] ?? null;
  if (e.kind === 'choice' && DECISION_LINES[e.result]) return pick(DECISION_LINES[e.result], h, year);
  return null;
}

// 한 해 최대 max개만 통과시키는 호출기(같은 항목은 같은 답). UI 가 사용한다.
export function createReactor(max = 2) {
  const memo = new Map(), cnt = new Map();
  return (e, L) => {
    if (!e || !L) return '';
    const year = e.year ?? L.year, key = `${L.seed}|${e.id ?? e.text}|${year}`;
    if (memo.has(key)) return memo.get(key);
    let out = reactionFor(e, L) ?? '';
    const yk = `${L.seed}|${year}`;
    if (out) { const c = cnt.get(yk) ?? 0; if (c >= max) out = ''; else cnt.set(yk, c + 1); }
    memo.set(key, out);
    return out;
  };
}
