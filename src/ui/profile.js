import { otherAssets } from '../engine/stats.js';
// 프로필 한눈 패널의 값. 순수 함수(DOM 없음): profileOf(L) → 표시용 값. 엔진이 직접 주지 않는 값(직급·매출 등)은 L에서 파생·추정하고 est 로 표시한다.
// 금액은 모두 만원, 2025년 물가 기준(엔진 단위). 순위·백분위·평가어는 만들지 않는다(ARCHITECTURE §15).
import { REGIONS } from '../engine/constants.js';
import { placeLine, vibeOf } from '../engine/sigungu.js';
import { sidoAt } from '../data/admin-names.js';
import { schoolLabel } from '../engine/index.js';
import { regionalPrice, regionalRow } from '../data/housing-regional.js';
import { money, fmtWon } from './format.js';
import { familyMembers, bondLabel } from '../engine/kin.js';

const REGION = Object.fromEntries(REGIONS.map(r => [r.key, r]));
export const TENURE_LABEL = { own: '자가', jeonse: '전세', monthly: '월세', public: '공공임대', family: '가족 집', dorm: '기숙사', facility: '시설' };
export const STATUS_LABEL = {
  none: '무직', student: '학생', employed: '재직', self: '자영업', military: '군 복무',
  inactive: '일 쉬는 중', seeking: '구직 중', retired: '은퇴',
};
export const MAJOR_LABEL = { 1: '관리직', 2: '전문직', 3: '사무직', 4: '서비스', 5: '판매', 6: '농림어업', 7: '기능·제조', 8: '장치·기계', 9: '단순노무', A: '군인' };
export const SCHOOL_LABEL = { daycare: '어린이집', kinder: '유치원', elem: '초등학교', middle: '중학교', high: '고등학교', college: '대학교', grad: '대학원', retake: '재수·준비' };

const comma = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
// 만원 → "5,400만원" / "1.2억원". 음수는 −.
export function fmtMan(n) {
  n = Math.round(Number(n) || 0);
  const a = Math.abs(n), sg = n < 0 ? '−' : '';
  return a >= 10000 ? `${sg}${(a / 10000).toFixed(1).replace(/\.0$/, '')}억원` : `${sg}${comma(a)}만원`;
}

// 직급 사다리(일반 사무·전문 직군 추정). 기업 규모별로 올라가는 속도가 다르다.
const LADDER = {
  large: [[0, '사원'], [3, '주임'], [5, '대리'], [8, '과장'], [12, '차장'], [16, '부장']],
  mid: [[0, '사원'], [3, '주임'], [6, '대리'], [10, '과장'], [14, '차장'], [18, '부장']],
  small: [[0, '사원'], [4, '주임'], [8, '대리'], [13, '과장']],
  micro: [[0, '직원'], [8, '팀장·실장급']],
};
const pick = (table, y) => table.reduce((acc, [from, label]) => (y >= from ? label : acc), table[0][1]);

// 직급 추정. 반환 { label, sub, est } — 직급 개념이 없으면 '해당 없음' + 직무명.
export function rankOf(job) {
  if (!job || job.status !== 'employed') return null;
  const title = job.title || '';
  if (job.major === '1') return { label: '임원·관리자', sub: title, est: true };
  if (!job.regular) return { label: '해당 없음', sub: `${title}${title ? ' · ' : ''}비정규`, est: false };
  if (job.major === '2' || job.major === '3') {
    const table = LADDER[job.public ? 'large' : (job.firmSize in LADDER ? job.firmSize : 'mid')];
    return { label: pick(table, job.years || 0), sub: title, est: true };
  }
  return { label: '해당 없음', sub: title, est: false };
}

// 자영업 추정: 월 순익 = 연 소득/12, 월 매출 = 순익 ÷ 업종별 이익률(추정)
const MARGIN = { 1: .3, 2: .35, 3: .35, 4: .18, 5: .12, 6: .3, 7: .25, 8: .22, 9: .3 };
export function bizOf(job) {
  if (!job || job.status !== 'self') return null;
  const profit = Math.round((job.wage || 0) / 12), m = MARGIN[job.major] ?? .2;
  return {
    kind: job.title || '자영업', major: MAJOR_LABEL[job.major] ?? '', years: (job.years || 0) + 1,
    monthlyProfit: profit, monthlySales: Math.round(profit / m), margin: m, est: true,
  };
}

// 짧은 일(엔진 job.gig: 인턴·아르바이트 등, 노인일자리 flags.seniorJob): 고용 상태는 그대로지만 그해에는 그 일로 보인다
export const gigOf = L => { const j = L.job || {}; if (j.status === 'employed' || j.status === 'self') return null; return j.gig && j.gig.until >= L.year ? j.gig.kind : L.flags?.seniorJob != null && L.flags.seniorJob === L.year ? '노인일자리' : null; };
const PART_TIME_WAGE = 1800;   // 비정규 + 연 1,800만원 미만 = 시간제로 본다(추정)
export function employmentOf(L) {
  const j = L.job, st = j.status, gig = gigOf(L);
  if (gig && st !== 'student') return { code: 'gig', label: gig };
  if (st === 'seeking' && L.flags?.examUntil != null) return { code: 'exam', label: '공무원 시험 준비 중' };
  if (L.age < 6 && st !== 'employed') return { code: 'child', label: L.age < 2 ? '영아' : '영유아' };
  if (st === 'employed') {
    if (j.regular) return { code: 'regular', label: '정규직' };
    return (j.wage || 0) < PART_TIME_WAGE ? { code: 'part', label: '시간제', est: true } : { code: 'irregular', label: '비정규직' };
  }
  if (st === 'self') return { code: 'self', label: '자영업' };
  if (st === 'student' || (st === 'none' && L.age < 19)) return { code: 'student', label: '학생' };
  if (st === 'retired') return { code: 'retired', label: '은퇴' };
  return { code: st, label: STATUS_LABEL[st] ?? '무직' };
}

export function dwellingOf(L) {
  const h = L.home || {}, care = L.health?.care;
  const t = h.tenure ?? L.birth?.tenure ?? 'family';
  if (care === 'facility' || t === 'facility') return 'facility';
  if (t === 'dorm') return 'public';
  if (t === 'monthly' && ((h.deposit ?? 0) < 1500 || (L.stats?.wealth ?? 50) < 25)) return 'basement';   // 반지하·고시원급 월세(추정)
  return t;
}

// '경기 김포시 양촌읍 · 외곽(차량 필요)'
// 가족 목록(엔진 family.spouses·gp): 이름·관계·시작/종료 연도. 현재 배우자는 '배우자', 사별·이혼은 이전 배우자.
const END = { widowed: '사별', divorced: '이혼' };
export function familyLines(L) {
  const f = L?.family || {}, out = [];
  familyMembers(L).forEach(({ id, label, member: m, age }) => out.push({ id, rel: label, name: m.name || '', age, bond: m.bond ?? 65, from: m.birthYear, to: m.alive === false ? m.deathYear : null, end: m.alive === false ? '별세' : m.care || m.ltc ? '돌봄 중' : '' }));
  (f.spouses || []).filter(s => s.end).forEach(s => out.push({ id: `spouse.${s.no}`, rel: '이전 배우자', name: s.name || '', from: s.since, to: s.until, end: END[s.end] || '' }));
  (f.gp || []).forEach(g => out.push({ rel: g.label, name: '', from: null, to: g.alive ? null : g.deathYear, end: g.alive ? '' : '별세' }));
  return out;
}
export const familyText = x => `${x.rel}${x.name ? ' ' + x.name : ''}${x.end === '별세' ? ` · ${x.to ? x.to + '년 ' : ''}별세${x.bond != null ? ` · ${bondLabel(x.bond)} (${x.bond})` : ''}` : `${Number.isFinite(x.age) ? ` · ${x.age}세` : ''}${x.bond != null ? ` · ${bondLabel(x.bond)} (${x.bond})` : ''}${x.end ? ` · ${x.end}` : ''}`}${x.rel === '이전 배우자' && x.from ? ` (${x.from}~${x.to || ''})` : ''}`;
// 이 동네 그 시대 시세 한 줄(R13 시군구 시세): 자가·가족 집 = 매매, 임차 = 전세. 군 지역(basis house)은 단독주택 시세.
export function marketLineOf(L) {
  const h = L.home || {}, own = !['jeonse', 'monthly', 'public', 'dorm'].includes(h.tenure);
  const r = regionalPrice(h.sigungu, L.year, own ? 'sale' : 'jeonse');
  if (!r) return null;
  const m = money(r.real, L.year, w => fmtWon(Math.round(w / 100) * 100));
  const what = own ? (regionalRow(h.sigungu)?.basis === 'house' ? '단독주택 시세' : '아파트(84㎡) 시세') : '전세 시세';
  return { text: `이 지역 ${what} 약 ${m.nominal}`, today: m.today };
}
export const homeLabel = L => { const h = L.home || {}, b = L.birth || {}; return h.sigungu ? placeLine(h.region, h.sigungu, h.dong, L.year) : sidoAt(h.region ?? b.region, L.year, true); };

// 직업 표시: 일하는 중 = 현재 직업명, 쉬는 중 = '이전 직업: … · 무직/구직 중', 이력이 없으면 구직 중 등 고용 상태.
export function jobLineOf(L) {
  const j = L.job || {}, working = j.status === 'employed' || j.status === 'self';
  if (!working && L.flags?.examUntil != null) return '공무원 시험 준비 중';
  if (working) return j.title || '';
  const prev = j.title || j.history?.at(-1)?.title || '';
  if (j.status === 'student' || (L.age < 19 && !prev)) return '';
  const gig = gigOf(L);
  if (gig) return gig;
  const st = j.status === 'seeking' ? '구직 중' : j.status === 'retired' ? '은퇴' : j.status === 'inactive' ? '일 쉬는 중' : j.status === 'military' ? '군 복무' : '무직';
  return prev ? `이전 직업: ${prev} · ${st}` : (j.status === 'seeking' ? '구직 중' : '');
}

export function profileOf(L) {
  const h = L.home || {}, b = L.birth || {}, j = L.job || {}, mo = L.money || {};
  const region = h.region ?? b.region, rg = REGION[region];
  const tenure = h.parents && L.age >= 19 ? 'family' : h.tenure ?? b.tenure ?? 'family', moves = (h.moves || []).length;   // 성인이 부모 집에 살면 부모의 점유 형태(자가·전세)를 본인 것처럼 보이지 않는다
  const last = (h.moves || []).at(-1);
  const emp = employmentOf(L), working = j.status === 'employed' || j.status === 'self';
  const biz = bizOf(j), rank = rankOf(j);
  const assets = (mo.assets || 0) + otherAssets(L) + (tenure === 'own' ? (h.value || 0) : 0) + ((tenure === 'jeonse' || tenure === 'monthly') ? (h.deposit || 0) : 0);
  return {
    home: {
      region, regionLabel: homeLabel(L) || (rg?.label ?? region ?? ''), vibe: vibeOf(h.sigungu, h.dong), area: b.urban === false ? '농촌' : '도시',
      tenure, tenureLabel: (h.parents || L.age < 19 && h.parents !== false) && !['facility', 'dorm'].includes(tenure) ? '부모 집' : TENURE_LABEL[tenure] ?? '', dwelling: dwellingOf(L),
      moves, recentMove: !!last && L.year - last.year <= 2, lastMoveYear: last?.year ?? null,
      market: marketLineOf(L),
    },
    work: {
      status: j.status ?? 'none', emp, jobLine: jobLineOf(L), jobTitle: working || j.status === 'seeking' || j.status === 'retired' ? (j.title || '') : '',
      school: j.status === 'student' || L.age < 19 ? (schoolLabel(L, L.edu?.stage) || SCHOOL_LABEL[L.edu?.stage] || '') + (L.edu?.leave ? ' · 휴학 중' : '') : '',
      major: MAJOR_LABEL[j.major] ?? '', firmSize: working ? j.firmSize : null,
    },
    pay: working ? { annual: Math.round(j.wage || 0), label: biz ? '연 순익' : '연봉', est: !!biz } : null,
    years: working ? { n: (j.years || 0) + 1 } : null,
    rank, biz,
    money: { assets: Math.round(assets), debt: Math.round(mo.debt || 0), net: Math.round(assets - (mo.debt || 0)) },
    wealth: wealthOf(L),
  };
}

// ───────── 자산·금융 구성 ─────────
// 엔진은 money.assets(금융 단일값)·money.debt·money.loans{}·home.value/deposit·money.debtService·aging 만 준다.
// 구성비(예금·현금성·금융투자)는 연령대+시드 해시로 결정적으로 추정(est:true), 엔진 필드(loans·debtService·pensionMonthly)가 있으면 그것을 우선한다. 금액 단위: 2025 실질 만원.
const hash01 = (...a) => { let h = 2166136261; for (const c of a.join('|')) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return ((h >>> 0) % 1000) / 1000; };
const MORT_RATE = y => (y < 1998 ? 0.10 : y < 2002 ? 0.09 : y < 2012 ? 0.058 : y < 2021 ? 0.035 : 0.045);
export function wealthOf(L) {
  const h = L.home || {}, mo = L.money || {}, ag = L.aging || {}, tenure = h.tenure ?? L.birth?.tenure ?? 'family', age = L.age, year = L.year;
  const fin = Math.max(0, Math.round(mo.assets || 0)), band = Math.floor(age / 5), j = k => hash01(L.seed, band, k) - 0.5;
  // 금융자산 구성비: 청년 = 예금·현금 큼, 중장년 = 투자 비중 커짐(연령 기반 + ±8%p 시드 흔들림)
  const invest = Math.min(0.6, Math.max(0.05, (age < 30 ? 0.12 : age < 50 ? 0.28 : age < 65 ? 0.32 : 0.18) + j(1) * 0.16));
  const cashR = Math.min(0.4, Math.max(0.08, (age < 30 ? 0.3 : age < 50 ? 0.2 : 0.18) + j(2) * 0.1));
  const invA = Math.round(fin * invest), cashA = Math.round(fin * cashR), depA = fin - invA - cashA;
  const estate = tenure === 'own' ? Math.round(h.value || 0) : 0, jeonseDep = (tenure === 'jeonse' || tenure === 'monthly') ? Math.round(h.deposit || 0) : 0;
  const debt = Math.max(0, Math.round(mo.debt || 0)), ln = mo.loans || {}, lsum = Object.values(ln).reduce((a, b) => a + (b || 0), 0);
  let mort, jeo, stu, cre;
  if (lsum > 0) { mort = ln.mortgage || 0; jeo = ln.jeonse || 0; stu = ln.student || 0; cre = (ln.credit || 0) + (ln.business || 0); }
  else {
    mort = tenure === 'own' ? Math.round(debt * 0.7) : 0; jeo = tenure === 'jeonse' ? Math.round(debt * 0.5) : 0;
    stu = age < 40 && ['college', 'grad'].includes(L.edu?.stage) || (age < 40 && (L.edu?.level ?? 0) >= 4) ? Math.round(debt * 0.3) : 0;
    cre = Math.max(0, debt - mort - jeo - stu);
  }
  const loanEst = !(lsum > 0);
  const rate = debt ? (mort * MORT_RATE(year) + jeo * (MORT_RATE(year) - 0.005) + stu * 0.02 + cre * (MORT_RATE(year) + 0.05)) / (mort + jeo + stu + cre || 1) : 0;
  const annualService = mo.debtService > 0 ? mo.debtService : debt ? debt * rate + debt / 20 : 0;   // 이자 + 20년 균등 상환 추정
  const inc = mo.income > 0 ? mo.income : (['employed', 'self'].includes(L.job?.status) ? L.job.wage || 0 : 0);
  const flow = mo.cashFlow?.year === L.year ? mo.cashFlow : null;
  const save = flow ? (flow.disposable > 0 ? flow.operatingBalance / flow.disposable : null) : inc > 0 ? (mo.livingRatio > 0 ? 1 - mo.livingRatio : Math.min(0.4, Math.max(-0.1, (L.stats?.wealth ?? 50) / 200 - 0.05 + j(3) * 0.1))) : null;
  const pension = Math.round((ag.pensionMonthly || 0) + (ag.basic || 0));
  const extra = otherAssets(L);
  const totalAssets = fin + estate + jeonseDep + extra, net = totalAssets - debt;
  return {
    est: true, loanEst, extra, fin: { total: fin, deposit: depA, cash: cashA, invest: invA }, nonfin: { estate, jeonse: jeonseDep, total: estate + jeonseDep },
    debt: { total: debt, mortgage: mort, jeonse: jeo, student: stu, credit: cre }, net, totalAssets,
    monthlyService: Math.round(annualService / 12), rate: debt ? Math.round(rate * 1000) / 10 : 0,
    saveRate: save == null ? null : Math.round(save * 100),
    pension: { monthly: pension, started: !!ag.pensionStart, accrued: Math.round(mo.pension || 0) },
  };
}
