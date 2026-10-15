// 돈(GDD §5.4). 독립 전에는 부모 가구(household), 독립 후에는 본인·부부 가계(money).
import { T, D, yr, ag, houseYoy } from '../tables.js';
import { indep, refreshDebt, becomeIndependent, addCredit } from '../act.js';
import { annualIncome, econ, kidsAt, lean } from '../stats.js';
import { medicalCost } from './health.js';

const PAY_YEARS = { mortgage: 30, student: 10, credit: 5, business: 7 };
const TUTOR_MONTHLY = [0, 20, 50, 100];

function realRate(y) {
  // 실질 이자 = 기준금리 + 1.5%p − 물가(GDD §5.4), 하한 0.5%
  return Math.max(0.005, yr(T('BASE_RATE'), y) + 0.015 - yr(T('CPI_INFLATION'), y));
}

function childCost(L) {
  let s = 0;
  const cc = T('CHILD_COST');
  for (const c of L.family.children) {
    if (!c.alive || c.leftHome) continue;
    const age = L.year - c.birthYear;
    if (age <= 18) s += ag(cc, age) ?? 0;
    else if (age <= 22) s += (ag(cc, 18) ?? 0) * 0.5 + yr(T('TUITION')['4yr'], L.year) * 0.6;
  }
  return s * yr(T('ERA_INCOME_INDEX'), L.year);
}

export function step(L, ctx) {
  const a = L.age, y = L.year, fl = L.flags, j = L.job;
  const working = j.status === 'employed' || j.status === 'self';
  if (!indep(L) && a >= 19 && (working || L.family.married || a >= 25)) becomeIndependent(L, ctx);
  const eraI = yr(T('ERA_INCOME_INDEX'), y);

  if (!indep(L)) {
    // 부모 가구: 소득 × .82 × (1 − MPC) − 사교육·대학 비용
    const hh = L.household, q = L.birth.quintile;
    let spend = TUTOR_MONTHLY[L.edu.tutoring] * 12 * eraI;
    if (L.edu.stage === 'college' && !L.money.loans.student) spend += yr(T('TUITION')[L.edu.college?.type ?? '4yr'], y);
    if (L.home.tenure === 'dorm') spend += (L.home.rent || 0) * 12;
    hh.netWorth = Math.round(hh.netWorth + hh.income * 0.82 * (1 - T('MPC')[q]) - spend);
    hh.income = Math.round(hh.income * 1.01);
    L.money.oop = medicalCost(L);
    L.money.debtService = 0;
    return;
  }

  const m = L.money, h = L.home, p = L.family.partner;
  const INC = annualIncome(L);
  const disposable = INC * (working || p?.income ? 0.82 : 0.95);     // 연금 생활은 세·보험료 부담이 작다
  const minLiving = (1600 + (p ? 600 : 0)) * eraI;                   // 자녀 몫은 childCost로 따로
  const qNow = Math.min(5, 1 + Math.floor((L.cache?.INCpos ?? econ(L).INCpos) / 20));
  const housing = ['monthly', 'public', 'dorm'].includes(h.tenure) && !h.parents ? (h.rent || 0) * 12 : 0;
  // 소비(월세 포함) = 가처분 × MPC. 최저 생활비+월세는 지키되 버는 것의 90%까지만(나머지는 의료비·이자 몫)(소득이 낮으면 줄여 산다) [추정]
  const living = Math.max(Math.min(minLiving + housing, disposable * 0.9), disposable * T('MPC')[qNow] * (1 - 0.06 * lean(L, 'wealth')));   // 돈 쪽 선택의 누적: 씀씀이 ±6%
  const debtCost = m.debt * realRate(y);
  // 원금 상환(전세대출은 만기 일시, 학자금은 졸업 후)
  let principal = 0;
  for (const [k, n] of Object.entries(PAY_YEARS)) {
    const bal = m.loans[k] || 0;
    if (!bal || (k === 'student' && L.edu.stage !== 'done')) continue;
    const pay = Math.min(bal, Math.max(50, bal / Math.max(1, n - (k === 'mortgage' ? Math.min(29, L.year - (h.boughtYear ?? L.year)) : 0))));
    principal += pay;
    m.loans[k] = bal - pay;
    if (m.loans[k] <= 1) { m.loans[k] = 0; L.flags.paidOff = y; ctx.sys('sys.money.paid_off', { kindLabel: { mortgage: '주택담보대출', student: '학자금 대출', credit: '신용대출', business: '사업자 대출' }[k] }, { quiet: k === 'credit' }); }
  }
  refreshDebt(L);
  // 양육비·의료비는 MPC 소비에 일부 들어 있으므로 절반만 추가로 본다. 형편 따라 양육비도 달라진다 [추정]
  const kids = 0.5 * childCost(L) * Math.max(0.4, Math.min(1.5, (L.cache?.INCpos ?? 50) / 50));
  const support = fl.supportUntil >= y ? (fl.supportAmount || 0) * 12 : 0;
  const care = (fl.careCost && L.family.caringFor ? fl.careCost : 0) + (h.tenure === 'facility' ? 900 * eraI : 0);
  const oop = medicalCost(L);

  let surplus = disposable - living - debtCost - principal - kids - support - care - oop;
  // 모아 둔 돈으로 메울 수 없으면 먼저 씀씀이를 줄인다(최대 25%), 그래도 모자라면 신용대출 [추정: 빚 눈덩이 방지]
  if (surplus < 0 && m.assets + surplus < 0) surplus += Math.min(-(m.assets + surplus), living * 0.25);
  m.income = Math.round(INC); m.oop = oop; m.debtService = Math.round(debtCost + principal);
  m.livingRatio = disposable > 0 ? living / disposable : 1;
  m.assets = Math.round(m.assets + surplus);
  // 적자 = 소비가 가처분소득을 넘은 해(원금 상환은 저축이라 빼고 본다 — 가계동향 '적자가구' 정의)
  if (surplus + principal < 0) {
    m.deficitYears = (m.deficitYears || 0) + 1;
    L.tally.deficit = (L.tally.deficit || 0) + 1;
    if (m.deficitYears === 2) ctx.sys('sys.money.deficit');
  } else m.deficitYears = 0;
  if (m.assets < 0) { addCredit(L, -m.assets); m.assets = 0; }
  m.assets = Math.round(m.assets * 1.01);
  if (h.owned) h.value = Math.round(h.value * (1 + houseYoy(h.regionGroup, y)));
  L.tally.adultYears = (L.tally.adultYears || 0) + 1;
  if (INC > 0 && a < 65) { L.tally.incPos = (L.tally.incPos || 0) + (L.cache?.INCpos ?? 50); L.tally.incPosN = (L.tally.incPosN || 0) + 1; }

  // 국민연금 가입(GDD §5.4)
  if (working && y >= 1988) {
    const pc = T('PENSION_CONTRIB_P'), form = j.status === 'self' ? 'self' : j.regular ? 'regular' : 'nonregular';
    m.pensionYears = (m.pensionYears || 0) + (pc[form] ? yr(pc[form], y) : 0);
  }
  // 의료비가 소득 10%를 넘으면
  if (oop >= 100 && oop > INC * 0.1 && fl.costShown !== y - 1) { fl.costShown = y; ctx.sys('sys.health.cost', { amount: oop }, { quiet: true }); }
  // 개인회생
  const e = econ(L);
  if (e.dsr > 0.6 && e.NW < 0 && !(fl.debtRelief > y - 10) && ctx.chance(0.1)) {
    fl.debtRelief = y;
    m.loans.credit = Math.round(m.loans.credit * 0.3); m.loans.business = Math.round(m.loans.business * 0.3);
    refreshDebt(L);
    ctx.sys('sys.money.debt_relief');
  }
  // 부모 생활비(가구 형편이 어렵고 부모 60세+)
  const par = L.family.parents;
  if (!(fl.supportUntil >= y) && L.birth.quintile <= 2 && [par.father, par.mother].some(x => x.alive && x.age >= 60)
    && ctx.chance(yr(T('SUPPORT_P'), y) * 0.4 / 4)) {
    fl.supportAmount = 30 + 5 * ctx.int(0, 4);
    fl.supportUntil = y + ctx.int(3, 8);
    ctx.sys('sys.money.support_parents', { amount: fl.supportAmount });
  }
}
