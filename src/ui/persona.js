// 상단 '나' 줄: 게임용 성향 유형(MBTI 풍) · 두드러진 성향 · 가장 큰 고민. 순수 함수는 Node 테스트 대상.
// 실제 성격 검사가 아니다. sens 는 유형 글자에 쓰지 않고 '예민함'으로 따로 본다.
export function mbtiOf(t = {}) {
  const pick = (v, hi, lo) => ({ ch: (v ?? 50) >= 50 ? hi : lo, vague: Math.abs((v ?? 50) - 50) < 5 });
  return [pick(t.extra, 'E', 'I'), pick(t.open, 'N', 'S'), pick(t.agree, 'F', 'T'), pick(t.consc, 'J', 'P')];
}
export const mbtiText = t => mbtiOf(t).map(x => x.ch).join('');
const HI = { open: '호기심 많음', consc: '성실함', extra: '외향적', agree: '배려심 많음', sens: '예민함' };
const LO = { open: '익숙함 선호', consc: '느긋함', extra: '내향적', agree: '직설적', sens: '무던함' };
// 값 ≥65 또는 ≤35 인 축 중 50에서 먼 순 상위 n개
export function traitChips(t = {}, n = 2) {
  return Object.keys(HI).map(k => ({ k, v: t[k] ?? 50 })).filter(x => x.v >= 65 || x.v <= 35).sort((a, b) => Math.abs(b.v - 50) - Math.abs(a.v - 50)).slice(0, n).map(x => ({ key: x.k, label: x.v >= 50 ? HI[x.k] : LO[x.k], v: x.v }));
}
