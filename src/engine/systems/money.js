// 돈(GDD §5.4). 독립 전에는 부모 가구(household), 독립 후에는 본인·부부 가계(money).
import { T, D, yr, ag, houseYoy, regionGroup } from '../tables.js';
import { indep, refreshDebt, becomeIndependent, addCredit, arrearsOf } from '../act.js';
import { annualIncome, econ, kidsAt, lean, otherIncome } from '../stats.js';
import { medicalCost } from './health.js';
import { houseChg, realReturns } from '../../data/market.js';
import { RENTAL_YIELD, VACANCY, PRICE_BETA, RENT_TAX, SIDEJOB, PRIVATE_PENSION, INHERIT_TAX, taxKind } from '../../data/incomes.js';
import { dailyEnabled, annualExpensePlan, recordAnnualLedger, timeBudget } from '../daily-life.js';
import { foodPriceContext, mealExpenseAdjustment } from '../daily-transactions.js';

import { wonAt } from '../text.js';
import { PAY_YEARS, annualPrincipal, syncMortgages } from '../loan-schedules.js';   // rental = 세 주려고 산 부동산의 담보대출(20년 분할)
const TUTOR_MONTHLY = [0, 20, 50, 100];

export function realRate(y) {
  // 실질 이자 = 기준금리 + 1.5%p − 물가(GDD §5.4), 하한 0.5%
  return Math.max(0.005, yr(T('BASE_RATE'), y) + 0.015 - yr(T('CPI_INFLATION'), y));
}

const rnd = Math.round;
const cpiM = y => (y >= 2025 ? 1 : yr(T('CPI_MULT'), y));          // 그해 1원의 2025년 가치
const GROUPS = ['seoul', 'capital', 'metro', 'province'];
export const groupOf = r => (GROUPS.includes(r) ? r : r ? regionGroup(r) : 'capital');
export const RENTAL_LABEL = { apt: '소형 아파트', officetel: '오피스텔', shop: '상가', home: '세 준 집' };
const subOf = r => r.sub || (r.kind === 'home' ? 'home' : 'apt');
export const HOLD = 0.003;                                         // 보유비(재산세·수선·관리 공백) 가치의 연 0.3% [추정, R17]
// 유형별 한 해 가격 변동(지역 주택 변동 × 배수 + 상수)
export const priceChg = (sub, group, y) => { const [b, c] = PRICE_BETA.values[sub] ?? [1, 0]; return houseChg(y, group) * b + c; };
export const yieldOf = (sub, y) => yr(RENTAL_YIELD.values, y)[sub === 'home' ? 'apt' : sub];
export const vacancyOf = (sub, y) => ag(VACANCY.values, y)[sub === 'home' ? 'apt' : sub];
// 임대소득세(총 임대료 대비): 주택은 2019부터 2천만 원(명목) 이하 분리과세, 넘는 몫은 종합과세. 상가는 늘 종합과세 [R17.S3]
export function rentTax(L, y = L.year) {
  const t = ag(RENT_TAX.values, y), cap = 2000 * cpiM(y);
  let home = 0, shop = 0;
  for (const r of L.rentals || []) { const g = (r.rent || 0) * (r.vacant === y ? 1 - (r.vacMonths || 0) / 12 : 1); if (taxKind(subOf(r)) === 'shop') shop += g; else home += g; }
  return rnd((home > cap ? cap * t.home + (home - cap) * t.over : home * t.home) + shop * t.shop);
}
// 상속(간이): 부모 순자산 − 정리 비용 3% − 상속세(일괄공제 5억 명목, 10~50% 누진) → 자녀 수로 나눈 내 몫 [R17.S7]
export function inheritShare(estate, heirs, y) {
  const v = INHERIT_TAX.values, cm = cpiM(y), net = estate * (1 - v.cost);
  let base = net - v.deduct * cm, tax = 0, lo = 0;
  for (const [hi, rate] of v.brackets) {
    if (base <= 0) break;
    const band = Math.min(base, (hi - lo) * cm);
    tax += band * (y < 2000 ? Math.min(rate, v.topBefore2000) : rate); base -= band; lo = hi;
  }
  return { tax: rnd(tax), share: rnd(Math.max(0, net - tax) / Math.max(1, heirs)) };
}

// 임대·연금·부업의 한 해(소득 계산 전): 가치·임대료 갱신, 공실, 연금 수령분, 부업 그만두기
function sideYear(L, ctx) {
  const y = L.year, a = L.age, fl = L.flags;
  for (const r of L.rentals || []) {
    const sub = subOf(r), g = groupOf(r.region);
    if (r.since < y) {
      const ch = priceChg(sub, g, y), before = r.value;
      r.value = rnd(r.value * (1 + ch));
      if (Math.abs(ch) >= 0.1 && r.sub) ctx.sys('sys.money.rental_value', { year: y, kindLabel: RENTAL_LABEL[sub], dir: ch > 0 ? `${wonAt(r.value - before, y)}만 원 올랐다` : `${wonAt(before - r.value, y)}만 원 내렸다` });
      if (r.sub && (y - r.since) % 2 === 0) r.rent = rnd(r.value * yieldOf(sub, y));   // 2년마다 그 시대 시세로 재계약
    }
    if (ctx.chance(vacancyOf(sub, y))) {
      r.vacant = y; r.vacMonths = ctx.int(2, 6);
      ctx.sys('sys.money.vacancy', { year: y, kindLabel: RENTAL_LABEL[sub], months: r.vacMonths, lost: rnd((r.rent || 0) * r.vacMonths / 12), cause: sub === 'shop' && y >= 2020 ? '상권에 빈 점포가 늘어' : '세입자가 계약을 끝내고 나가' });
    }
  }
  if (y === 2019 && (L.rentals || []).some(r => taxKind(subOf(r)) === 'home')) ctx.sys('sys.money.rent_tax');
  const pn = L.pension2;
  if (pn?.draw === 'annuity' && a >= pn.drawAge && pn.left > 0 && pn.balance > 0) {
    pn.payout = rnd(pn.balance / pn.left); pn.balance -= pn.payout; pn.left--; pn.paidYear = y;
    if (pn.left === 0) { pn.balance = 0; ctx.sys('sys.money.pension_done', {}, { quiet: true }); }
  }
  const sj = fl.sidejob, working = L.job.status === 'employed' || L.job.status === 'self';
  if (sj && (!working || a > 60 || ctx.chance(SIDEJOB.values.quit))) {
    ctx.sys('sys.money.sidejob_end', { years: y - sj.since, earned: rnd(sj.earned || 0), why: !working ? '본업이 끊기면서' : a > 60 ? '나이가 들어' : '몸이 버티지 못해' });
    fl.sidejob = null;
  } else if (sj && sj.since < y) ctx.apply({ stats: { leisure: -1, ...(sj.kind === 'deliver' && { health: -1 }) } }, { reason: '부업으로 쉬는 시간이 줄었다' });
}

// 기초생활 생계급여(QA M1): 가구 소득이 선정기준 아래이고 재산이 적으면 그 차액을 보충하고, 월세는 주거급여로 일부 받는다.
// 2025 생계급여 선정기준(기준중위소득 32%, 만원/월) 1~4인 76.5·125.8·160.5·195.1, 5인부터 +34.6. 주거급여 기준임대료(서울 근사) 1인 35 + 1인당 5 [추정]. 시대 소득지수로 환산.
// 2000.10 국민기초생활보장법 시행 전(생활보호법 1961~)은 대상·급여가 좁아 ×0.4 [추정]. 재산: 현금·보증금·집 순자산 1억(2025, 대도시 기본재산공제 근사) 미만.
// 수급 가구는 급여 수준으로 산다: money.step이 생활비 하한을 선정기준(line)으로 낮춘다.
const LIVELIHOOD = [0, 76.5, 125.8, 160.5, 195.1];
export function livelihoodLine(L) {
  const y = L.year, n = 1 + (L.family.partner ? 1 : 0) + L.family.children.filter(c => c.alive && !c.leftHome).length;
  const k = yr(T('ERA_INCOME_INDEX'), y) * (y >= 2001 ? 1 : 0.4);
  return { line: y < 1962 ? 0 : 12 * (LIVELIHOOD[Math.min(4, n)] + 34.6 * Math.max(0, n - 4)) * k, rentCap: 12 * (35 + 5 * (n - 1)) * k };
}
export function livelihood(L, INC, { line, rentCap } = livelihoodLine(L)) {
  const h = L.home, m = L.money, era = yr(T('ERA_INCOME_INDEX'), L.year);
  const wealth = Math.max(0, m.assets) + (h.deposit || 0) + (h.owned ? h.value - (h.mortgageBalance || 0) : 0);
  if (!(INC < line && m.assets < line && wealth < 10000 * era)) return 0;
  const rent = ['monthly', 'public'].includes(h.tenure) && !h.parents ? (h.rent || 0) * 12 : 0;
  return rnd(line - INC + Math.min(rent, rentCap));
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
    if (L.edu.stage === 'college' && !L.edu.leave && !(L.edu.leaveUntil >= L.year) && !L.money.loans.student) spend += yr(T('TUITION')[L.edu.college?.type ?? '4yr'], y);
    if (L.home.tenure === 'dorm') spend += (L.home.rent || 0) * 12;
    hh.netWorth = Math.round(hh.netWorth + hh.income * 0.82 * (1 - T('MPC')[q]) - spend);
    hh.income = Math.round(hh.income * 1.01);
    L.money.oop = medicalCost(L);
    L.money.debtService = 0;
    return;
  }

  // 부모 가구(독립 뒤, QA m1): 순자산이 집값 흐름(자산의 60%를 집으로 근사)을 따르고, 60세 전까지는 저축이 쌓인다 → 상속·부모 도움이 독립 때 값에 묶이지 않는다
  const par = L.family.parents, hh = L.household;
  if (par.father.alive || par.mother.alive) {
    const pa = Math.max(par.father.alive ? par.father.age : 0, par.mother.alive ? par.mother.age : 0);
    if (hh.netWorth > 0) hh.netWorth *= 1 + 0.6 * houseYoy(groupOf(L.birth.region), y);
    if (pa < 60) hh.netWorth += hh.income * 0.82 * (1 - T('MPC')[L.birth.quintile]);
    hh.netWorth = rnd(hh.netWorth);
  }
  const m = L.money, h = L.home, p = L.family.partner;
  const openingCash = m.assets;
  sideYear(L, ctx);
  const INC = annualIncome(L), ox = otherIncome(L);
  // 근로 외 소득은 세금을 따로 뗀다: 임대소득세(연도별 규칙)·부업 15%[추정]·연금소득세 4.4% [R17]
  const rTax = rentTax(L), PP = PRIVATE_PENSION.values;
  const oxNet = ox.rent - rTax + ox.side * 0.85 + ox.pens * (1 - PP.annuityTax) - (L.rentals || []).reduce((s, r) => s + (r.value || 0) * HOLD, 0);
  const lv = livelihoodLine(L), welfare = livelihood(L, INC, lv);
  if (welfare && !m.welfare) ctx.sys(y < 2000 ? 'sys.money.welfare_old' : 'sys.money.welfare', {}, { essential: true });   // 첫 수령·재개 때만(m.welfare = 지난해 급여)
  const disposable = (INC - ox.total) * (working || p?.income ? 0.82 : 0.95) + oxNet + welfare;     // 연금 생활은 세·보험료 부담이 작다
  const minLiving = Math.min((1600 + (p ? 600 : 0)) * eraI * (j.status === 'military' ? 0.3 : 1), welfare ? lv.line : Infinity);   // 자녀 몫은 childCost로 따로. 수급 가구는 급여 수준으로. 복무 중 본인 식비·잠자리는 부대가 댄다 [추정 .3]
  const qNow = Math.min(5, 1 + Math.floor((L.cache?.INCpos ?? econ(L).INCpos) / 20));
  const housing = ['monthly', 'public', 'dorm'].includes(h.tenure) && !h.parents ? (h.rent || 0) * 12 : 0;
  // 소득이 끊겨도 기본 생활비·계약 월세는 사라지지 않는다. 부족분은 현금 인출이나 차입으로 메운다.
  // 생활비 하한은 게임 모형의 기존 연간 금액이며, 근로소득의 유무와 별개다.
  const cut = fl.cutUntil >= y ? 0.85 : 1;           // 자금 압박 때 고른 '씀씀이 줄이기'
  const living = Math.max(minLiving * cut + housing, cut * Math.max(0, disposable) * T('MPC')[qNow] * (1 - 0.06 * lean(L, 'wealth')));   // 돈 쪽 선택의 누적: 씀씀이 ±6%
  const debtCost = m.debt * realRate(y) + arrearsOf(L) * 0.03;      // 신용 한도를 넘긴 연체분은 연체 가산금리 3%p
  // 원금 상환(전세대출은 만기 일시, 학자금은 졸업 후)
  let principal = 0;
  for (const [k, n] of Object.entries(PAY_YEARS)) {
    const bal = m.loans[k] || 0;
    if (!bal || (k === 'student' && L.edu.stage !== 'done')) continue;
    const pay = annualPrincipal(L, k);
    principal += pay;
    m.loans[k] = bal - pay;
    if (m.loans[k] <= 0) { m.loans[k] = 0; L.flags.paidOff = y; ctx.sys('sys.money.paid_off', { kindLabel: { mortgage: '주택담보대출', student: '학자금 대출', credit: '신용대출', business: '사업자 대출', rental: '임대 부동산 대출' }[k] }, { quiet: k === 'credit' }); }
  }
  refreshDebt(L);
  syncMortgages(L);
  // 양육비·의료비는 MPC 소비에 일부 들어 있으므로 절반만 추가로 본다. 형편 따라 양육비도 달라진다 [추정]
  const kids = 0.5 * childCost(L) * Math.max(0.4, Math.min(1.5, (L.cache?.INCpos ?? 50) / 50));
  const support = fl.supportUntil >= y ? (fl.supportAmount || 0) * 12 : 0;
  const care = (fl.careCost && L.family.caringFor ? fl.careCost : 0) + (h.tenure === 'facility' ? 900 * eraI : 0);
  const oop = medicalCost(L);
  // 개인연금 납입(일하는 동안, 60세 전): 저축이라 적립금으로 옮기고 세금 혜택은 돌려받는다 [R17.S6]
  const pn = L.pension2;
  let pensIn = 0;
  if (pn) {
    const r = realReturns(y);
    pn.balance = rnd(pn.balance * (1 + 0.6 * r.deposit + 0.4 * r.stock));      // 예금 6 : 주식 4 운용
    if (pn.monthly && working && a < 60 && !pn.draw) {
      pensIn = pn.monthly * 12;
      pn.balance += pensIn; pn.paidIn = (pn.paidIn || 0) + pensIn;
      pensIn -= rnd(pensIn * (y >= 2014 && INC < 5500 ? PP.creditLow : ag(PP.credit, y)));
    }
  }

  // 새 모형에서는 총액 안의 주거·양육·의료 몫을 분리해 한 번만 차감한다.
  // 모형 1과 1999년 이전은 기존 항목 합산을 쓴다. 기본 생활비 하한은 모든 모형에 적용한다.
  const expenses = dailyEnabled(L) && y >= 1999
    ? annualExpensePlan({ envelope: living, minimumLiving: minLiving * cut, housing, children: kids * 2, medical: oop, support, care })
    : null;
  let mealAdjustment = { discount: 0 };
  if (expenses) {
    const food = foodPriceContext(L), time = timeBudget(L);
    const reserved = L.dailyLife?.mealPolicy?.effectiveYear === y && L.dailyLife.mealPolicy.choiceId === 'cook' ? 30 : 0;
    mealAdjustment = mealExpenseAdjustment(L, { living: expenses.living, foodReferenceAnnual: food.annualFoodReference,
      availableCookingMinutes: time.unmetMinutes > 0 ? 0 : time.personal + reserved });
    expenses.living -= mealAdjustment.discount;
    expenses.consumption -= mealAdjustment.discount;
  }
  const consumption = expenses ? expenses.consumption : living + kids + support + care + oop;
  let surplus = disposable - consumption - debtCost - principal - pensIn;
  // 모아 둔 돈으로 메울 수 없으면 먼저 씀씀이를 줄인다(최대 25%), 그래도 모자라면 신용대출(한도를 넘으면 연체 → 아래 settleArrears) [추정]
  // 이미 신용 한도를 넘겨 더 빌릴 데가 없으면(연체) 빚을 늘리는 대신 최저생계(급여 선정기준) 수준까지 줄여 산다(경제 감사: 연체가 해마다 불어나 평생 연체·개인회생이 흔했다)
  const liv = expenses ? expenses.living : living, cutMax = arrearsOf(L) > 0 ? Math.max(liv * 0.25, liv - lv.line) : liv * 0.25;
  const reduction = surplus < 0 && m.assets + surplus < 0 ? Math.min(-(m.assets + surplus), cutMax) : 0;
  surplus += reduction;
  m.income = Math.round(INC); m.welfare = welfare; m.oop = oop; m.debtService = Math.round(debtCost + principal);
  m.livingRatio = disposable > 0 ? living / disposable : 1;
  m.assets = Math.round(m.assets + surplus);
  // 원금 상환·개인연금 납입은 소비가 아니라 자산 이동이므로 생활 적자와 구분한다.
  const operatingBalance = disposable - (consumption - reduction) - debtCost;
  if (operatingBalance < 0) {
    m.deficitYears = (m.deficitYears || 0) + 1;
    L.tally.deficit = (L.tally.deficit || 0) + 1;
    if (m.deficitYears === 2) ctx.sys('sys.money.deficit');
  } else m.deficitYears = 0;
  const creditBefore = m.loans.credit || 0;
  const fundingGap = Math.max(0, -m.assets);
  if (m.assets < 0) { addCredit(L, -m.assets); m.assets = 0; }
  const creditAdded = Math.max(0, (m.loans.credit || 0) - creditBefore);
  const cashBeforeReturn = m.assets;
  L.tally.finInc = (L.tally.finInc || 0) + rnd(m.assets * 0.01);
  m.assets = Math.round(m.assets * 1.01);
  // 소비·이자는 순자산 감소, 원금 상환·연금 납입은 자산과 부채 사이의 이동으로 구분한다.
  const cashDrawdown = Math.max(0, openingCash - cashBeforeReturn);
  m.cashFlow = { year: y, disposable, consumption: consumption - reduction, interest: debtCost, principal, pension: pensIn,
    operatingBalance, cashDrawdown, financialReturn: m.assets - cashBeforeReturn, creditAdded,
    unfunded: Math.max(0, fundingGap - creditAdded), closingCash: m.assets };
  const livingFromSavings = Math.min(cashDrawdown, Math.max(0, -operatingBalance));
  if (!working && livingFromSavings >= 1) ctx.sys('sys.money.drawdown', { amount: Math.round(livingFromSavings) });
  if (expenses) recordAnnualLedger(L, {
    openingCash, income: INC, welfare, disposable,
    expenses: { living: expenses.living - reduction, housing: expenses.housing,
      children: expenses.children, medical: expenses.medical, care: expenses.care, support: expenses.support },
    interest: debtCost, principal, pension: pensIn, consumption: consumption - reduction,
    totalOutflow: consumption - reduction + debtCost + principal + pensIn,
    adjustment: reduction, creditAdded, financialReturn: m.assets - cashBeforeReturn,
    closingCash: m.assets, unresolved: Math.max(0, fundingGap - creditAdded), mealAdjustment,
    note: '생활비 배분은 게임 모형. 개인연금은 세제효과를 포함한 순납입액. 신용 한도를 넘는 부족액은 연체 빚으로 남는다.',
  });
  // 소득원 구성 기록(QA: tests/qa/income-mix.mjs)
  const T_ = L.tally;
  if (welfare) T_.welfare = (T_.welfare || 0) + welfare;
  T_.workInc = (T_.workInc || 0) + rnd((INC - ox.total) * (working || p?.income ? 0.82 : 0.95));
  T_.rentInc = (T_.rentInc || 0) + rnd(ox.rent - rTax);
  T_.sideInc = (T_.sideInc || 0) + rnd(ox.side * 0.85);
  T_.pensInc = (T_.pensInc || 0) + rnd(ox.pens * (1 - PP.annuityTax));
  if (ox.side && L.flags.sidejob) L.flags.sidejob.earned = (L.flags.sidejob.earned || 0) + ox.side * 0.85;
  if (ox.rent) ctx.sys('sys.money.rent_year', { year: y, net: rnd(ox.rent - rTax), tax: rTax, n: L.rentals.length }, { quiet: true });
  if (h.owned) h.value = Math.round(h.value * (1 + houseYoy(h.regionGroup, y)));
  ctx.act.settleArrears();                            // 연체가 생겼으면 집 담보 추가 대출·연금 해지·집 처분 순으로 정리
  L.tally.adultYears = (L.tally.adultYears || 0) + 1;
  if (INC > 0 && a < 65) { L.tally.incPos = (L.tally.incPos || 0) + (L.cache?.INCpos ?? 50); L.tally.incPosN = (L.tally.incPosN || 0) + 1; }

  // 국민연금 가입(GDD §5.4)
  if (working && y >= 1988) {
    const pc = T('PENSION_CONTRIB_P'), form = j.status === 'self' ? 'self' : j.regular ? 'regular' : 'nonregular';
    m.pensionYears = (m.pensionYears || 0) + (pc[form] ? yr(pc[form], y) : 0);
  }
  // 의료비가 소득 10%를 넘으면
  if (oop >= 100 && oop > INC * 0.1 && fl.costShown !== y - 1) { fl.costShown = y; ctx.sys('sys.health.cost', { amount: oop }, { quiet: true }); }
  // 개인회생(2004.9 시행): 신용 한도를 넘긴 연체가 쌓여 갚을 길이 없을 때만 신청한다. 재신청은 7년 뒤 — 면책 재신청 제한
  const e = econ(L), arrears = arrearsOf(L);
  if (y >= 2004 && arrears > 0 && e.dsr > 0.6 && e.NW < 0 && !(fl.debtRelief > y - 7) && ctx.chance(0.06)) {   // .06: 연체 가구 상당수는 버티거나 다른 정리를 한다(평생 신청 약 5~10% 목표, 법원 통계 누적 신청 약 160만 건 [추정])
    fl.debtRelief = y;
    m.loans.credit = Math.round(m.loans.credit * 0.3); m.loans.business = Math.round(m.loans.business * 0.3);
    refreshDebt(L);
    ctx.sys('sys.money.debt_relief', {}, { essential: true });   // 빚이 크게 줄어드는 해: 피드에 이유가 보여야 한다
  }
  // 부모 생활비(가구 형편이 어렵고 부모 60세+)
  if (!(fl.supportUntil >= y) && L.birth.quintile <= 2 && [par.father, par.mother].some(x => x.alive && x.age >= 60)
    && ctx.chance(yr(T('SUPPORT_P'), y) * 0.4 / 4)) {
    fl.supportAmount = 30 + 5 * ctx.int(0, 4);
    fl.supportUntil = y + ctx.int(3, 8);
    ctx.sys('sys.money.support_parents', { amount: fl.supportAmount });
  }
}
