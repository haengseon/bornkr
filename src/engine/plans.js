// 일자리 상실·임대 만료 뒤의 '다음 걸음' 계획(순수 계산). 금액은 엔진 단위(2025년 실질 만원)이고, 화면이 그해 명목·2026 환산으로 바꾼다.
// 각 계획: { id, label, cost:{cash,loan,monthly,note}, ...적용에 필요한 값 }. 미리보기와 적용이 같은 숫자를 쓴다.
import { yr, ag, T } from './tables.js';
import { homePrice, budgetOf, parentHelp, ownShare, CASH_BUFFER, indep } from './act.js';
import * as P from '../data/lifeplans.js';

const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
const rnd = n => Math.round(n);
const parentsAlive = L => [L.family.parents.father, L.family.parents.mother].some(p => p.alive);
// 표 값(출처·추정 여부는 data/lifeplans.js note, docs/research/finance/R15-investment-and-plans.md)
const M = P.MOVE_COST.values;
const moveCostOf = (L, newDep = 0) => clamp(rnd(M.base + homePrice(L) * M.perHome + newDep * M.broker), M.min, M.max);   // 포장이사 + 중개보수
export const rentRate = y => yr(P.RENT_CONV.values, y);              // 보증금→월세 전환율(연)
export const jeonseLoanRate = y => yr(P.JEONSE_LOAN_RATE.values, y);
export const creditRate = y => yr(P.CREDIT_RATE.values, y);          // 가계 신용대출 금리(연)
const cpiM = y => (y >= 2025 ? 1 : yr(T('CPI_MULT'), y));          // 그해 1원의 2025년 가치

// 구직급여(고용보험, 1996-07 첫 지급). wage = 연 임금(2025 실질 만원) → { days, daily(그해 명목 원), total(2025 실질 만원) }
export function benefitFor(year, age, insuredYears, wage) {
  const none = { days: 0, daily: 0, total: 0 };
  if (year < 1996 || insuredYears < 1 || !(wage > 0)) return none;
  const rule = ag(P.UI_BENEFIT.values, year), D = ag(P.BENEFIT_DAYS.values, year);
  const days = ag(D.rows, insuredYears)[D.ages.filter(a => age >= a).length];
  if (!days) return none;
  const wageDay = wage * 1e4 / cpiM(year) / 365, floor = yr(P.MIN_WAGE.values, year) * 8 * rule.floorShare;
  const daily = rnd(Math.max(Math.min(wageDay * rule.rate, rule.cap), Math.min(floor, wageDay)));   // 하한은 받던 임금보다 높을 수 없다
  return { days, daily, total: rnd(daily * days * cpiM(year) / 1e4) };
}
// 직업훈련 한 과정의 본인 부담(2025 실질 만원, 훈련장려금 차감)
export function trainingCost(year) {
  const t = ag(P.TRAINING.values, year);
  return rnd(t.course * t.self - t.allowance);
}

// 보증금 이동 정산: 새 집 비용(newDep+이사비)을 (자산 + 회수 보증금 − 갚을 전세대출)에서 내고 모자라면 전세대출
export function settleMove(L, { D, newDep, moveCost }) {
  const m = L.money, A0 = Math.max(0, m.assets), L0 = m.loans.jeonse || 0;
  const jl = Math.min(L0, A0 + D);                       // 나가는 집 보증금으로 먼저 갚는 전세대출
  const avail = A0 + D - jl, need = newDep + moveCost;
  const loanAdd = Math.max(0, rnd(need - avail));
  return { assets: Math.max(0, rnd(avail - need)), loanKeep: L0 - jl, loanAdd, cash: rnd(D - newDep - moveCost) };
}

// 이사 정산 미리보기: act.move의 순서(보증금 회수 → 자가 매도 → 전세대출 상환 → 새 집 보증금·매수가 → 이사비)를 그대로 따른다.
// keep: 'sell'(지금 자가를 판다) | 'lease'·'vacant'(남겨 두고 떠난다: 집값·담보대출은 그대로). lease = 세 준 집의 연 임대수익.
// 반환 cost: cash = 보유 현금(자산) 변화, loan = 빚 총액 변화, monthly = 달마다 나가는 주거비 변화(월세·대출 이자 − 임대수익).
export function moveMath(L, { tenure, dep = 0, price = 0, rent = 0, moveCost = 0, keep = 'sell', lease = 0, home = null }) {
  const m = L.money, h = L.home, J0 = m.loans.jeonse || 0, M0 = m.loans.mortgage || 0;
  let A = m.assets + (h.deposit || 0), J = J0, M = M0, C = 0;
  if (h.owned && keep === 'sell') { A += h.value; const r = Math.min(M, A); A -= r; M -= r; C += M; M = 0; }
  const jl = Math.min(J, A); A -= jl; J -= jl; C += J; J = 0;          // 못 갚은 전세대출은 신용대출로(act capJeonse)
  if (tenure === 'own' && !home) {                                     // act.move와 같은 LTV·DSR 한도, 부모 도움, 남는 몫 신용
    const cap = Math.min(yr(T('LTV')[h.regionGroup], L.year) * price, budgetOf(L, keep !== 'sell').loanCap);
    A += Math.min(parentHelp(L), Math.max(0, price - Math.max(0, A - 300) - cap));
    const own = Math.max(0, A - 300), loan = rnd(Math.min(Math.max(0, price - own), cap)); A -= price - loan; M += loan;
  }
  else if (tenure === 'jeonse' || tenure === 'monthly') { const own = ownShare(A, dep, tenure === 'jeonse' ? 0.8 : 0.5); A -= own; J += dep - own; const over = J - rnd(dep * 0.8); if (over > 0) { J -= over; C += over; } }
  A -= moveCost; if (A < 0) { C -= A; A = 0; }
  const r = jeonseLoanRate(L.year), oldRent = ['monthly', 'public'].includes(h.tenure) ? h.rent || 0 : 0;
  return { cash: rnd(A - m.assets), loan: rnd(J + M + C - J0 - M0), monthly: rnd(rent - oldRent + ((J - J0) * r + (M - M0) * (r + 1 / 30)) / 12 - lease / 12) };
}
export const moveCostFor = moveCostOf;

// 임대 만료(재계약 불가) 계획
export function housingPlans(L, rise) {
  const h = L.home, y = L.year, D = h.deposit || 0, R = h.rent || 0, out = [];
  const mk = (id, label, newDep, rent, extra = {}) => {
    const mc = moveCostOf(L, newDep), s = settleMove(L, { D, newDep, moveCost: mc });
    const monthly = rnd(rent - R + s.loanAdd * jeonseLoanRate(y) / 12);
    out.push({ id, label, newDep, rent, moveCost: mc, settle: s, ...extra, cost: { cash: s.cash, loan: s.loanAdd, monthly } });
  };
  if (h.tenure === 'jeonse') {
    mk('same', '같은 동네 전세를 새로 얻는다', rnd(D * (1 + rise)), 0, { tenure: 'jeonse' });
    mk('down', '외곽 작은 전셋집으로 간다', rnd(D * 0.75), 0, { tenure: 'jeonse', cheaper: true });
    const dep = rnd(D * 0.15), rent = Math.max(5, rnd((D - dep) * rentRate(y) / 12));
    mk('monthly', '보증금을 빼서 월세로 옮긴다', dep, rent, { tenure: 'monthly' });
  } else {
    mk('same', '같은 동네 월셋집을 구한다', D, rnd(R * (1 + rise)), { tenure: 'monthly' });
    mk('down', '더 싼 월세방으로 줄인다', rnd(D * 0.6), rnd(R * 0.7), { tenure: 'monthly', cheaper: true });
  }
  if (parentsAlive(L) && L.age < 55 && !L.family.children.some(c => c.alive)) {
    const s = settleMove(L, { D, newDep: 0, moveCost: 20 });
    out.push({ id: 'family', label: '부모님 집에서 몇 해 모은다', newDep: 0, rent: 0, moveCost: 20, settle: s, tenure: 'family', cost: { cash: s.cash, loan: 0, monthly: -R } });
  }
  return out;
}

// 실직 계획. lost = { wage(연), years, regular }
export function jobPlans(L, lost, offerFn) {
  const y = L.year, w = lost.wage || 0, out = [];
  // ponytail: 가입 이력 대신 정규직·근속 1년 이상을 수급 요건으로 근사(비정규직 가입률 반영은 생략)
  const b = lost.regular ? benefitFor(y, L.age, lost.years || 0, w) : { days: 0, total: 0 };
  const benefit = b.total, months = Math.round(b.days / 30);
  out.push({ id: 'seek', label: benefit ? '실업급여로 같은 일을 찾는다' : '저금으로 같은 일을 찾는다', benefit, cost: { cash: benefit, note: benefit ? `실업급여 ${b.days}일(약 ${months}개월)분` : '실업급여 대상 아님' } });
  const tuition = trainingCost(y);
  out.push({ id: 'learn', label: '직업훈련·자격 과정을 듣는다', tuition, benefit, cost: { cash: benefit - tuition, note: '한 해 동안 구직이 늦어지는 대신 자격을 쌓는다' } });
  const offer = offerFn?.();
  if (offer && L.age < 65) out.push({ id: 'temp', label: '임시·일용 일로 버틴다', offer, cost: { cash: 0, monthly: rnd(offer.wage / 12) * -1, note: '소득은 낮고 계약은 짧다' } });
  if (L.age >= 28 && L.age <= 60) {
    const capital = rnd(8500 * (0.7 + 0.6 * L.stats.wealth / 100));   // 소상공인 평균 창업비용 약 8,500만(2025 실질) [STARTUP_COST]
    const cash = indep(L) ? Math.min(Math.max(0, rnd(L.money.assets) - CASH_BUFFER), capital) : 0, loan = capital - cash;   // act.startBusiness와 같은 순서: 모은 돈 먼저
    out.push({ id: 'shop', label: '퇴직금·대출로 가게를 낸다', capital, cost: { cash: -cash, loan, monthly: rnd(loan * creditRate(L.year) / 12), note: loan ? '모은 돈을 먼저 넣고 모자란 창업 자금은 사업 대출로 빌린다. 성공하면 내 일, 실패하면 빚이 남는다' : '창업 자금을 모은 돈으로 댄다. 실패하면 그 돈을 잃는다' } });
  }
  if (parentsAlive(L) && L.age < 50 && !L.home.owned && !L.family.partner) out.push({ id: 'family', label: '부모님 집에서 숨을 돌린다', cost: { cash: benefit, monthly: 0, note: '생활비는 줄지만 마음은 불편하다' } });
  return out;
}

// 화면용 선택지(라벨+cost)
export const asOptions = plans => plans.map(p => ({ id: p.id, label: p.label, cost: p.cost }));
