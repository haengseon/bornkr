// 구조 변화 동작(ARCHITECTURE §7 act). 시스템과 사건의 do(L, act)가 이걸로만 큰 변화를 만든다.
import { T, yr, regionGroup, regionLabel, isCapital } from './tables.js';
import { sensFields } from './safety.js';
import { pickMoveTarget, levelOf } from './sigungu.js';
import { CLASS_CAL } from './tuning.js';

export const LOAN_LABEL = { credit: '신용대출', mortgage: '주택담보대출', jeonse: '전세자금대출', student: '학자금 대출', business: '사업자 대출' };
export const TENURE_LABEL = { own: '자가', jeonse: '전셋집', monthly: '월셋집', public: '공공임대', family: '부모님 집', dorm: '기숙사', facility: '요양시설' };
export const COND_LABEL = {
  hypertension: '고혈압', diabetes: '당뇨', heart: '심장 질환', stroke: '뇌졸중', cancer: '암', liver: '간 질환', copd: '만성 폐질환',
  kidney: '신장 질환', arthritis: '관절염', dementia: '치매', depression: '우울증', injury: '부상',
};

export const indep = L => L.flags.indep != null;
export function refreshDebt(L) {
  const l = L.money.loans;
  L.money.debt = Math.round(Object.values(l).reduce((a, b) => a + b, 0));
}
const tally = (L, k, n = 1) => { L.tally[k] = (L.tally[k] || 0) + n; };

// 모자란 생활비를 신용대출로 메운다. 무담보 신용은 max(3,000만 원(2025 실질), 연소득 × 3)까지만 —
// 넘는 몫은 기초생활 지원·가족 부양·면책으로 흡수된 것으로 본다(QA-S-03, GDD §5.4 빚 눈덩이 방지).
export function addCredit(L, amount) {
  const l = L.money.loans, cap = Math.max(3000 * yr(T('ERA_INCOME_INDEX'), L.year), 3 * (L.money.income || 0));
  l.credit = Math.max(l.credit, Math.min(l.credit + amount, cap));
  refreshDebt(L);
}

// 2025 실질 지역 임대 시세(월세·보증금)를 연도 소득 지수로 환산
export function rentFor(L, ctx, group = L.home.regionGroup) {
  const base = T('RENT_BASE')[group];
  const era = yr(T('ERA_INCOME_INDEX'), L.year);
  return { rent: Math.round(base.rent * era * (0.8 + 0.4 * ctx.rand())), deposit: Math.round(base.deposit * era) };
}
export function homePrice(L, group = L.home.regionGroup) {
  return yr(T('HOME_PRICE')[group], L.year);
}

export function makeAct(L, ctx) {
  const act = {
    flag(name, value = true) { L.flags[name] = value; },

    gain(amount) {
      amount = Math.round(amount);
      if (indep(L)) L.money.assets += amount; else L.household.netWorth += amount;
    },
    spend(amount) {
      amount = Math.round(amount);
      if (!indep(L)) { L.household.netWorth -= amount; return; }
      L.money.assets -= amount;
      if (L.money.assets < 0) { addCredit(L, -L.money.assets); L.money.assets = 0; }
    },
    borrow(amount, kind = 'credit', { silent = false } = {}) {
      amount = Math.round(amount);
      if (amount <= 0) return;
      if (!indep(L) && kind === 'credit') { L.household.netWorth -= amount; return; }
      L.money.loans[kind] = (L.money.loans[kind] || 0) + amount;
      refreshDebt(L);
      if (!silent) ctx.sys('sys.money.loan', { kindLabel: LOAN_LABEL[kind], amount });
    },
    repay(amount) {
      let left = Math.min(Math.round(amount), Math.max(0, L.money.assets));
      for (const k of ['credit', 'business', 'student', 'jeonse', 'mortgage']) {
        const pay = Math.min(left, L.money.loans[k] || 0);
        if (!pay) continue;
        L.money.loans[k] -= pay; L.money.assets -= pay; left -= pay;
        if (L.money.loans[k] <= 0) paidOff(k);
      }
      refreshDebt(L);
    },

    // 이사. tenure: own|jeonse|monthly|public|family|dorm|facility
    move(tenure, { reason = '이사', involuntary = false, price, silent = false, region } = {}) {
      const h = L.home;
      if (region && region !== h.region) act.moveRegion(region, { silent: true });
      // 나가는 집 정산: 보증금 회수 → 전세대출 상환, 자가는 매도
      if (indep(L) && !h.parents) {
        if (h.deposit) { L.money.assets += h.deposit; h.deposit = 0; }
        if (h.owned && tenure !== 'own') sell();
        const jl = Math.min(L.money.loans.jeonse, L.money.assets);
        L.money.loans.jeonse -= jl; L.money.assets -= jl;
      }
      h.parents = tenure === 'family';
      // 독립 후 같은 시도 안 이사: 절반은 소득·주택가에 맞는 다른 시군구로
      if (!h.parents && tenure !== 'facility' && h.sigungu && !region && ctx.chance(0.5)) Object.assign(h, pickMoveTarget(ctx.weighted, h.region, L.year, levelOf(L)));
      h.tenure = tenure; h.rent = 0; h.contractEnd = null;
      if (tenure === 'monthly' || tenure === 'public') {
        const r = rentFor(L, ctx);
        h.rent = tenure === 'public' ? Math.round(r.rent * 0.5) : r.rent;
        payDeposit(tenure === 'public' ? Math.round(r.deposit * 0.3) : r.deposit, 0.5);
        h.contractEnd = L.year + 2;
      } else if (tenure === 'jeonse') {
        const size = 0.35 + 0.35 * ctx.rand();
        payDeposit(Math.round(homePrice(L) * yr(T('JEONSE_RATIO')[h.regionGroup], L.year) * size), 0.8);
        h.contractEnd = L.year + 2;
      } else if (tenure === 'own') {
        const p = Math.round(price ?? homePrice(L));
        const own = Math.max(0, L.money.assets - 300);
        const loan = Math.max(0, p - own);
        L.money.assets -= p - loan;
        if (loan) L.money.loans.mortgage += loan;
        h.owned = true; h.value = p; h.boughtYear = L.year; h.valueMark = p;
      } else if (tenure === 'dorm') {
        h.rent = Math.round(rentFor(L, ctx).rent * 0.5);
      }
      refreshDebt(L);
      h.moves.push({ year: L.year, to: tenure, reason });
      tally(L, 'moves');
      if (involuntary) tally(L, 'invMoves');
      if (!silent) ctx.sys('sys.home.move', { toLabel: TENURE_LABEL[tenure], reasonLabel: reason });
    },
    moveRegion(key, { silent = false } = {}) {
      const h = L.home;
      if (!key || key === h.region) return;
      if (!isCapital(h.region) && isCapital(key)) L.flags.toCapital = L.year;
      h.region = key; h.regionGroup = regionGroup(key);
      Object.assign(h, pickMoveTarget(ctx.weighted, key, L.year, levelOf(L)));
      if (!silent) ctx.sys('sys.home.region_move', { regionLabel: regionLabel(key) });
    },

    startJob(o) {
      const j = L.job, first = !j.history.length;
      j.status = o.self ? 'self' : 'employed';
      Object.assign(j, { code: o.code, title: o.title, major: o.major, band: o.band, ai: o.ai, hazard: o.hazard ?? 1, public: !!o.public, regular: !!o.regular, firmSize: o.firmSize, wage: Math.round(o.wage), years: 0, searchYears: 0, platform: !!o.platform });
      j.history.push({ code: o.code, title: o.title, from: L.year, to: null, reason: null, ...(o.public && { public: true }) });
      if (o.silent) return;
      if (first) {
        ctx.sys('sys.job.first', { title: o.title });
        ctx.sys('sys.money.first_pay', { pay: Math.round(o.wage / 12) }, { quiet: true });
      } else ctx.sys('sys.job.reemploy', { title: o.title });
    },
    endJob(reason) {
      const j = L.job, h = j.history[j.history.length - 1];
      // 40세 이후 10년 넘게 다닌 일을 어떤 이유로든 떠나면 그게 '주된 일자리 퇴직'(고령층 조사 정의, QA-S-06)
      if (!L.flags.mainExited && j.years >= 10 && L.age >= 40 && reason !== '입대') { L.flags.mainExited = L.year; j.mainTenure = j.years; }
      if (h && h.to == null) { h.to = L.year; h.reason = reason; }
      // 정규직 퇴직금(근속 1년 이상)
      if (j.regular && j.years >= 1 && j.status === 'employed') {
        const amount = Math.round(j.wage / 12 * j.years);
        act.gain(amount);
        ctx.sys('sys.money.severance', { amount }, { quiet: true });
      }
      j.status = 'seeking'; j.wage = 0; j.regular = false; j.searchYears = 0; j.platform = false;
    },
    loseJob(reason = '사업 부진') {
      if (L.job.status !== 'employed' && L.job.status !== 'self') return;
      ctx.sys('sys.job.lose', { reasonLabel: reason });
      act.endJob(reason);
      tally(L, 'jobLosses'); L.flags.jobLoss = L.year;
    },
    retire() {
      if (L.job.status === 'employed' || L.job.status === 'self') act.endJob('은퇴');
      L.job.status = 'retired'; L.job.wage = 0;
    },
    // o: 제안 직업 행(없으면 지금·직전 직업). code·major·band·ai·hazard를 그대로 가져간다(QA-S-29)
    startBusiness(title, o = L.job) {
      const amount = 3000 + Math.round(5000 * ctx.rand());
      act.borrow(amount, 'business', { silent: true });
      const t = title || L.job.title || '작은';
      act.startJob({ code: o.code, major: o.major, band: o.band, ai: o.ai, hazard: o.hazard, title: t, self: true, regular: false, firmSize: 'micro', wage: selfIncome(L, ctx), silent: true });
      L.flags.business = L.year;
      ctx.sys('sys.job.business_open', { title: t });
    },
    closeBusiness() {
      L.flags.bizClosed = L.year;
      act.endJob('폐업');
      tally(L, 'jobLosses');
      ctx.sys('sys.job.business_close');
    },

    marry(partner, { silent = false } = {}) {
      const f = L.family;
      f.partner = partner || f.partner;
      if (!f.partner) return;
      f.married = true; f.marriedYear = L.year; f.dating = false;
      L.flags.marryYear = L.year;
      if (!silent) ctx.sys('sys.fam.wedding');
      if (!indep(L)) becomeIndependent(L, ctx);
      act.spend(1500 + Math.round(1500 * ctx.rand()));
      if (L.home.parents || L.home.tenure === 'dorm') act.move('jeonse', { reason: '결혼', silent: true });
    },
    divorce() {
      const f = L.family;
      f.partner = null; f.married = false; f.divorced = true;
      L.flags.divorceYear = L.year; tally(L, 'divorces');
      if (L.home.owned) { sell(0.5); ctx.sys('sys.home.sell'); act.move('monthly', { reason: '이혼', involuntary: true, silent: true }); }
      ctx.sys('sys.fam.divorced');
    },
    loseSpouse() {
      const f = L.family;
      if (!f.partner) return;
      f.partner = null; f.married = false; f.widowed = true;
      L.flags.widowYear = L.year;
      ctx.sys('sys.fam.widowed', {}, sensFields(L, 'death'));
    },
    haveChild() {
      const sex = ctx.chance(0.512) ? 'M' : 'F';
      L.family.children.push({ sex, birthYear: L.year, alive: true, leftHome: false, married: false, kids: [] });
      L.flags.childYear = L.year;
      ctx.sys('sys.fam.child_born', { childSexLabel: sex === 'M' ? '아들' : '딸' });
    },

    addCondition(key) {
      const h = L.health;
      if (h.conditions.some(c => c.key === key && c.active)) return false;
      h.conditions.push({ key, since: L.year, active: true });
      h.dx[key] = L.year;
      tally(L, 'dx');
      return true;
    },
    recover(key) {
      const c = L.health.conditions.find(c => c.key === key && c.active);
      if (!c) return;
      c.active = false; c.until = L.year;
      tally(L, 'recov');
      ctx.sys('sys.health.recover', { condLabel: COND_LABEL[key] || key });
    },

    startCare(who) {
      if (L.family.caringFor) return;
      L.family.caringFor = who; L.flags.careStart = L.year;
      tally(L, 'careStarts'); tally(L, 'invol');
    },
    endCare() {
      const who = L.family.caringFor;
      if (!who) return;
      L.family.caringFor = null;
      ctx.sys('sys.fam.care_end', { who: WHO_LABEL[who] || who });
    },
  };

  function payDeposit(dep, loanShare) {
    if (!indep(L)) return;
    L.home.deposit = dep;
    const own = Math.min(Math.max(0, L.money.assets), dep * (1 - loanShare));
    L.money.assets -= own;
    const rest = dep - own;
    if (rest > 0) L.money.loans.jeonse += rest;
  }
  function sell(share = 1) {
    const h = L.home;
    L.money.assets += Math.round(h.value * share);
    h.owned = false; h.value = 0;
    const m = Math.min(L.money.loans.mortgage, L.money.assets);
    L.money.loans.mortgage -= m; L.money.assets -= m;
    if (L.money.loans.mortgage > 0) { L.money.loans.credit += L.money.loans.mortgage; L.money.loans.mortgage = 0; }
  }
  function paidOff(kind) {
    L.flags.paidOff = L.year;
    if (kind !== 'jeonse') ctx.sys('sys.money.paid_off', { kindLabel: LOAN_LABEL[kind] }, { quiet: true });
  }
  return act;
}

export const WHO_LABEL = { father: '아버지', mother: '어머니', spouse: '배우자', parent: '부모님', grandparent: '할머니' };

// 자영 소득(GDD §5.3: bandBase×.9×lnN(0,.6)×era, 연)
export function selfIncome(L, ctx) {
  const base = T('BAND_BASE')[3];
  return Math.round(base * 12 * 0.9 * Math.exp(ctx.normal(0, 0.6) - 0.18) * yr(T('ERA_INCOME_INDEX'), L.year));
}

// 경제적 독립(GDD §4.2): 부모 이전 [Q1 0 / Q2 300 / Q3 800 / Q4 2,000 / Q5 6,000] × lognormal(.5)
export function becomeIndependent(L, ctx) {
  if (indep(L)) return;
  L.flags.indep = L.year;
  const t = Math.round(CLASS_CAL.transfer[L.birth.quintile - 1] * Math.exp(ctx.normal(0, 0.5) - 0.125));
  L.money.assets += t;
  L.household.netWorth -= t;
  ctx.sys('sys.money.independent', {}, { quiet: true });
}
