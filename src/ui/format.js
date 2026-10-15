// 화면 표기 통일(순수): 금액·연도·변화량·기간·면적. 엔진 값은 '2025년 실질 만원'이고,
// 화면은 그해 명목 금액(주 표기) + 2026년 환산(보조 줄)로 보여 준다. 표시 전용 — 저장값은 그대로.
import { CPI_MULT } from '../data/wealth.js';

const V = CPI_MULT.values, K = Object.keys(V).map(Number).sort((a, b) => a - b);
export const TODAY = 2026;
// 그해 1원이 2025년 몇 원어치인가. 1980 이전은 표에 없어 1980값에서 연 +15% 복리로 거슬러 간 추정(est), 2025 이후는 1.
export function cpiMult(year) {
  if (year >= K.at(-1)) return { m: 1, est: year > K.at(-1) };
  if (year < K[0]) return { m: V[K[0]] * 1.15 ** (K[0] - year), est: true };
  return { m: V[year] ?? V[[...K].reverse().find(k => k < year)], est: false };
}
// 2025년 실질 만원 → 그해 명목 만원
export const nominal = (man, year) => (Number(man) || 0) / cpiMult(year).m;
// 2026년 환산: 2026 물가표가 없어 2025 실질값 그대로(그래서 '약')
export const today = man => Number(man) || 0;

const comma = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
// 만원 → '4억 8,711만 원' · '3,500만 원' · '2억 원' · 1만 원 미만은 '5,000원'. 음수는 −.
export function fmtWon(man) {
  let n = Number(man) || 0;
  const sg = n < 0 ? '−' : '';
  n = Math.abs(n);
  const NB = ' ';    // 금액은 줄 중간에서 갈라지지 않게 숫자·단위 사이를 붙인다
  if (n < 1) return `${sg}${comma(Math.round(n * 10000))}원`;
  n = Math.round(n);
  const eok = Math.floor(n / 10000), rest = n % 10000;
  if (!eok) return `${sg}${comma(rest)}만${NB}원`;
  return `${sg}${eok}억${rest ? `${NB}${comma(rest)}만` : ''}${NB}원`;
}
// 한 번에 두 값: { nominal: 그해 금액 문자열, today: '2026년 환산 약 …'(2025년 이후엔 null), nomMan, estimated }
// fmt: 금액 → 문자열 함수(연봉·월 등 접두를 붙일 때). 기본 fmtWon
export function money(realMan, year, fmt = fmtWon) {
  const nomMan = nominal(realMan, year), c = cpiMult(year);
  const nearNow = year >= TODAY - 1;
  return { nominal: fmt(nomMan), today: nearNow ? null : `2026년 환산 약 ${fmt(today(realMan))}`, nomMan, estimated: c.est };
}
export const fmtMonthly = man => `월 ${fmtWon(man)}`;
export const fmtDaily = man => `일당 약 ${fmtWon(man)}`;
// 소득 표기: 직업에 맞게 연봉·월급·일당. wage = 연 소득(만원)
export function fmtIncome(wage, { daily = false, monthly = false } = {}) {
  if (daily) return fmtDaily(wage / 220);
  if (monthly) return `월급 ${fmtWon(wage / 12)}`;
  return `연봉 ${fmtWon(wage)}`;
}
export const fmtRent = (deposit, rent) => `보증금 ${fmtWon(deposit)} / 월 ${fmtWon(rent)}`;
export const fmtPct = r => `${Math.round(r * 100)}%`;
export const fmtRate = r => `연 ${Math.round(r * 1000) / 10}%`;

export const ageText = a => `${a}세`;
export const yearText = y => `${y}년`;
export const deltaText = d => (d > 0 ? `▲${d}` : d < 0 ? `▼${Math.abs(d)}` : '–');
export function tenureText(years) {
  const y = Math.floor(years || 0);
  return y < 1 ? '1년 미만' : `${y}년`;
}
// 전용면적 ㎡ → '전용 59㎡(약 18평)'
export const areaText = m2 => `전용 ${Math.round(m2)}㎡(약 ${Math.round(m2 / 3.3058)}평)`;
// 주거 형태별 흔한 전용면적(추정)
export const AREA_GUESS = { apt: 84, house: 99, family: 99, jeonse: 59, monthly: 33, basement: 26, public: 39, facility: 20, own: 84 };
