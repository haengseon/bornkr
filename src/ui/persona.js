// 상단 '나' 줄: 게임용 성향 유형(MBTI 풍, 실제 검사 아님) · 두드러진 성향 · 가장 큰 고민. 순수 함수는 Node 테스트 대상.
// 입력은 L.mbti({EI,SN,TF,JP}) 또는 호환 L.traits({extra,open,agree,consc,sens}) 어느 쪽이든 된다. sens 는 글자에 쓰지 않고 '예민함'으로 따로 본다.
const AX = [['EI', 'extra', 'E', 'I'], ['SN', 'open', 'N', 'S'], ['TF', 'agree', 'F', 'T'], ['JP', 'consc', 'J', 'P']];
export function mbtiOf(t = {}) {
  return AX.map(([k, tk, hi, lo]) => { const v = t[k] ?? t[tk] ?? 50; return { ch: v >= 50 ? hi : lo, vague: Math.abs(v - 50) < 5, v }; });
}
export const mbtiText = t => mbtiOf(t).map(x => x.ch).join('');
const HI = { open: '직관형(N)', consc: '계획형(J)', extra: '외향형(E)', agree: '감정형(F)', sens: '예민함' };
const LO = { open: '현실형(S)', consc: '즉흥형(P)', extra: '내향형(I)', agree: '사고형(T)', sens: '무던함' };
// 값 ≥65 또는 ≤35 인 축 중 50에서 먼 순 상위 n개
export function traitChips(t = {}, n = 2) {
  const get = k => t[k] ?? t[AX.find(a => a[1] === k)?.[0]] ?? 50;
  return Object.keys(HI).map(k => ({ k, v: get(k) })).filter(x => x.v >= 65 || x.v <= 35).sort((a, b) => Math.abs(b.v - 50) - Math.abs(a.v - 50)).slice(0, n).map(x => ({ key: x.k, label: x.v >= 50 ? HI[x.k] : LO[x.k], v: x.v }));
}
