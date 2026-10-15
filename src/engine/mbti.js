// 성향(MBTI 풍)이 직접 고르지 않은 기본 행동에 미치는 영향. 글자 신호 s ∈ [-1,1]: E(+외향)·I, N(+개방)·S, F(+우호)·T, J(+성실)·P.
import { LEAN, LETTER_LABEL } from '../content/mbti-lean.js';

const AXIS = { E: ['extra', 1], I: ['extra', -1], N: ['open', 1], S: ['open', -1], F: ['agree', 1], T: ['agree', -1], J: ['consc', 1], P: ['consc', -1] };
const sig = (L, ch) => { const [k, d] = AXIS[ch]; return d * ((L.traits?.[k] ?? 50) - 50) / 50; };
const score = (L, letters) => [...letters].reduce((s, ch) => s + sig(L, ch), 0);

// 기본 선택 보정: 성향이 뚜렷해서 원래 기본값보다 확실히(0.3 이상) 더 어울리는 선택이 있으면 그것을, 아니면 원래 기본값을 쓴다.
// 반환: { id, mbti:{letter,label}|null } — mbti는 이 기본 선택에 성향이 작용했을 때만.
export function traitPick(L, eventId, options, defaultId) {
  const lean = LEAN[eventId];
  if (!lean || options.length < 2) return { id: defaultId, mbti: null };
  const sc = options.map(o => ({ id: o.id, s: lean[o.id] ? score(L, lean[o.id]) : 0 }));
  const cur = sc.find(x => x.id === defaultId) ?? sc[0];
  const best = sc.reduce((a, b) => (b.s > a.s ? b : a));
  const pickId = best.id !== cur.id && best.s - cur.s >= 0.3 ? best.id : cur.id;
  const letters = lean[pickId];
  const letter = letters && [...letters].map(ch => [ch, sig(L, ch)]).filter(([, v]) => v >= 0.2).sort((a, b) => b[1] - a[1])[0]?.[0];
  return { id: pickId, mbti: letter ? { letter, label: LETTER_LABEL[letter] } : null };
}
