// 주거(GDD §5.5). home = { tenure, region, regionGroup, parents, moves, rentBurden, owned, value, deposit, rent, contractEnd }
import { bias } from '../sigungu.js';
import { T, D, yr, ag, isCapital, REGION, houseYoy } from '../tables.js';
import { indep, becomeIndependent, homePrice, TENURE_LABEL } from '../act.js';
import { econ } from '../stats.js';
import { won } from '../text.js';
import { HOUSING_CAL, CLASS_CAL } from '../tuning.js';

const RENTER = new Set(['jeonse', 'monthly', 'public']);
const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));

function leaveHome(L, ctx, tenure, reason) {
  becomeIndependent(L, ctx);
  ctx.act.move(tenure, { reason, silent: true });
  if (tenure === 'monthly' && isCapital(L.home.region) && (L.cache?.INCpos ?? 50) < 30 && ctx.chance(0.25)) {
    L.flags.substandard = L.year;
    ctx.sys('sys.home.substandard');
  }
}

export function step(L, ctx) {
  const h = L.home, a = L.age, y = L.year, fl = L.flags;
  if (fl.substandard && h.moves.length && h.moves[h.moves.length - 1].year > fl.substandard) fl.substandard = null;

  // 부모 집에 사는 동안: 가구 이사, 독립 판정
  if (h.parents) {
    const renter = RENTER.has(h.tenure) || h.tenure === 'family';
    if (ctx.chance(renter ? 0.27 : 0.085) && (a < 19 || ctx.chance(0.5))) {
      if (renter && ctx.chance(0.12)) h.tenure = 'own';
      h.moves.push({ year: y, to: h.tenure, reason: '가구 이사' });
      fl.familyMove = y;
      L.tally.moves = (L.tally.moves || 0) + 1;
      ctx.sys('sys.home.family_move', { toLabel: TENURE_LABEL[h.tenure] });
    }
    if (a >= 19 && !L.family.married) {
      if (a <= 34 && ctx.chance(0.08)) return ctx.ask({ eventId: 'sys.home.independence', options: ['stay', 'room', 'jeonse'], defaultId: 'stay' });
      if (a >= 35 && ctx.chance(0.05)) return leaveHome(L, ctx, 'monthly', '독립');
    }
    return;
  }
  // 기숙사: 학업이 끝나면 원룸으로
  if (h.tenure === 'dorm') {
    if (L.edu.stage === 'done' && L.mil.status !== 'serving') leaveHome(L, ctx, 'monthly', '졸업');
    return;
  }
  if (!indep(L) || h.tenure === 'facility') return;

  // 임차 계약 만기(2년)
  if (RENTER.has(h.tenure) && h.contractEnd != null && y >= h.contractEnd) {
    if (ctx.chance(yr(T('RENEWAL'), y))) {
      const rise = Math.max(0, (1 + houseYoy(h.regionGroup, y)) * (1 + houseYoy(h.regionGroup, y - 1)) - 1) + 0.02;
      h.contractEnd = y + 2;
      if (h.tenure === 'jeonse' && h.deposit * rise >= 300) {
        const amount = Math.round(h.deposit * rise / 100) * 100;
        return ctx.ask({ eventId: 'sys.home.renew', options: ['pay', 'cheaper', 'monthly'], defaultId: L.money.assets >= amount ? 'pay' : 'cheaper', data: { amount }, vars: { amount } });
      }
      if (h.tenure === 'monthly') h.rent = Math.round(h.rent * (1 + rise));
      ctx.sys('sys.home.renewed', {}, { quiet: true });
    } else {
      L.tally.invol = (L.tally.invol || 0) + 1;
      ctx.act.move(h.tenure === 'public' ? 'monthly' : h.tenure, { reason: '계약 만기', involuntary: true });
    }
  }
  // 전세사기(GDD §5.5)
  if (h.tenure === 'jeonse' && a < 40 && ctx.chance(yr(T('JEONSE_FRAUD'), y))) {
    h.deposit = 0;
    fl.fraud = y; L.tally.invol = (L.tally.invol || 0) + 1;
    ctx.sys('sys.home.jeonse_fraud');
    ctx.act.move('monthly', { reason: '전세사기', involuntary: true, silent: true });
  }
  // 주택 구입 기회
  if (!h.owned && a >= 25 && a <= 64) {
    const price = Math.round(homePrice(L) * (0.5 + 0.6 * ctx.rand()));
    const ltv = ltvOf(L);
    const afford = clamp((L.money.assets + (h.deposit || 0) + parentHelp(L) + ltv * price) / price, 0, 1.5);
    const cf = D.OWN_TRANSITION.cohortFactor, hc = HOUSING_CAL;
    // OWN_TRANSITION은 실측 전이율이므로 afford는 평균 근처(ref)에서 1이 되는 상대 배수로만 쓴다(QA-S-05)
    const lam = ag(T('OWN_TRANSITION'), a) * ag(hc.own, a) * (L.birth.year >= cf.fromBirthYear ? cf.mult * hc.cohortAdj : 1) * clamp(afford / hc.affordRef, 0.25, 1.5) * (fl.buyWait ? 0.8 : 1) * bias(L, 'tenureBias', 'own', 0.85, 1.15);
    if (ctx.chance(lam)) return ctx.ask({ eventId: 'sys.home.buy', options: ['buy', 'wait'], defaultId: afford < hc.buyMin ? 'wait' : 'buy', data: { price } });
  }
  // 공공임대
  if (h.tenure === 'monthly' && L.birth.quintile <= 2 && y >= 1989 && ctx.chance(0.03)) {
    ctx.act.move('public', { reason: '공공임대', silent: true });
    ctx.sys('sys.home.public_rental');
  }
  // 지역 이동: 비수도권 출생 청년의 수도권행, 40세+ 서울 임차의 경기행
  if (!isCapital(h.region) && a >= 19 && a <= 29 && ctx.chance(0.04)) {
    ctx.act.moveRegion(ctx.chance(0.4) ? 'seoul' : 'gyeonggi');
    if (RENTER.has(h.tenure)) ctx.act.move('monthly', { reason: '일자리', silent: true });
  } else if (h.region === 'seoul' && a >= 40 && RENTER.has(h.tenure) && ctx.chance(0.05)) {
    ctx.act.moveRegion('gyeonggi', { silent: true });
    ctx.act.move(h.tenure === 'public' ? 'monthly' : h.tenure, { reason: '집값', involuntary: true });
  }
  // 실직·이혼 후 부모 집으로
  if ((fl.jobLoss === y || fl.divorceYear === y) && a < 45 && !h.owned && !L.family.partner
    && [L.family.parents.father, L.family.parents.mother].some(p => p.alive) && ctx.chance(0.3)) {
    ctx.act.move('family', { reason: '부모님 집으로', silent: true });
    ctx.sys('sys.home.return_parents');
  }
  // 보유 주택 2년 ±15%
  if (h.owned) {
    if (y - (h.markYear ?? h.boughtYear) >= 2) {
      const r = h.value / (h.valueMark || h.value);
      if (Math.abs(r - 1) >= 0.15) ctx.sys('sys.home.value_jump', { dir: r > 1 ? '올랐다' : '내렸다' });
      h.valueMark = h.value; h.markYear = y;
    }
  }
  const INC = econ(L).INC;
  h.rentBurden = INC > 0 ? Math.round((h.rent || 0) * 12 / INC * 100) / 100 : 0;
}

const ltvOf = L => yr(T('LTV')[L.home.regionGroup], L.year);
// 부모 도움(주택 구입): 부모 생존 & 출생 형편 3분위+ → 부모 가구 순자산의 일부 [추정, 세대 간 이전 경로]
function parentHelp(L) {
  const par = L.family.parents;
  if (!par.father.alive && !par.mother.alive) return 0;
  return Math.round(Math.max(0, L.household.netWorth) * CLASS_CAL.help[L.birth.quintile - 1]);
}

export const choices = {
  'sys.home.independence'(L, ctx, opt) {
    if (opt === 'stay') return ctx.apply({ stats: { leisure: -3, relations: 2 } }, { reason: '부모 집에 머물렀다' });
    leaveHome(L, ctx, opt === 'room' ? 'monthly' : 'jeonse', '독립');
    ctx.sys('sys.home.move', { toLabel: TENURE_LABEL[L.home.tenure], reasonLabel: '독립' });
  },
  'sys.home.renew'(L, ctx, opt, { amount }) {
    const h = L.home;
    if (opt === 'pay') {
      const own = Math.min(Math.max(0, L.money.assets), amount);
      L.money.assets -= own;
      h.deposit += amount;
      if (amount - own > 0) ctx.act.borrow(amount - own, 'jeonse', { silent: true });
      return ctx.apply({ issues: { housing: 4 } }, { reason: `전세 보증금 ${won(amount)}만 원 인상` });
    }
    L.tally.invol = (L.tally.invol || 0) + 1;
    if (opt === 'cheaper') {
      ctx.act.move('jeonse', { reason: '보증금 인상', involuntary: true });
      h.deposit = Math.round(h.deposit * 0.8);
      return ctx.apply({ stats: { leisure: -3 } }, { reason: '더 싼 집으로 옮겼다' });
    }
    ctx.act.move('monthly', { reason: '월세 전환', involuntary: true });
  },
  'sys.home.buy'(L, ctx, opt, { price }) {
    if (opt === 'wait') { L.flags.buyWait = L.year; return; }
    becomeIndependent(L, ctx);
    const help = parentHelp(L);
    if (help) { L.household.netWorth -= help; L.money.assets += help; }
    ctx.act.move('own', { reason: '매수', price, silent: true });
    ctx.sys('sys.home.bought', { regionLabel: REGION[L.home.region]?.label, loan: Math.round(L.money.loans.mortgage) });
  },
};
