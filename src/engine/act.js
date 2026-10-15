// 구조 변화 동작(ARCHITECTURE §7 act). 시스템과 사건의 do(L, act)가 이걸로만 큰 변화를 만든다.
import { T, yr, regionGroup, regionLabel, isCapital } from './tables.js';
import { sensFields } from './safety.js';
import { pickMoveTarget, levelOf, candidates, place, SGG } from './sigungu.js';
import { econ } from './stats.js';
import { CLASS_CAL } from './tuning.js';
import { spouseName } from './kin.js';
import { regionalPrice } from '../data/housing-regional.js';

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

// ── 주거 가격·예산 (시군구 housingTier 기준, 2025 실질 만원) ──
const curveOf = t => t >= 4 ? 'hi' : t === 3 ? 'mid' : 'lo';
export const tierOfL = L => SGG.get(L.home.sigungu)?.housingTier ?? ({ seoul: 4, capital: 3, metro: 3, province: 2 })[L.home.regionGroup] ?? 3;
// 시군구 시세(R13, 84㎡ 기준·군 지역은 단독주택)가 있으면 그 값, 없으면 등급표. id = 시군구 id
const tierPrice = (tier, year) => T('HOME_PRICE_TIER')[tier] * yr(T('HOME_PRICE_INDEX')[curveOf(tier)], year);
export const priceAt = (tier, year, id) => regionalPrice(id, year, 'sale')?.real ?? tierPrice(tier, year);
// 전세 보증금(84㎡ 기준): 지역 전세 시세, 없으면 매매가 × 전세가율
const jeonseAt = (tier, year, id, rg) => regionalPrice(id, year, 'jeonse')?.real ?? priceAt(tier, year, id) * yr(T('JEONSE_RATIO')[rg], year);
export function homePrice(L, tier = tierOfL(L)) { return Math.round(priceAt(tier, L.year, L.home.sigungu)); }
// 월세는 소형(원룸·투룸) 기준 등급표에 지역 배율: √(지역 84㎡ 월세 × 33/84 ÷ 등급표 월세), .6~1.6
// ponytail: 84㎡ 월세를 면적비로 줄인 근사 — 소형 월세 실측이 생기면 그 값으로 교체
const rentMul = (tier, year, id, base) => { const m = regionalPrice(id, year, 'rentMonthly')?.real; return m ? Math.min(1.6, Math.max(0.6, Math.sqrt(m * 0.4 / base))) : 1; };
export function rentAt(tier, year, cheap = false, id) {
  const base = T('RENT_TIER')[tier], c = T('RENT_TIER').cheap, era = yr(T('ERA_INCOME_INDEX'), year), f = rentMul(tier, year, id, base.rent * era);
  return { rent: Math.max(3, Math.round(base.rent * era * f * (cheap ? c.rent : 1))), deposit: Math.round(base.deposit * era * f * (cheap ? c.deposit : 1)) };
}
export function rentFor(L, ctx, tier = tierOfL(L), cheap = L.home.cheap) {
  const r = rentAt(tier, L.year, cheap, L.home.sigungu);
  return { rent: Math.round(r.rent * (0.85 + 0.3 * ctx.rand())), deposit: r.deposit };
}
// 예산: 소득·가용 자산·대출 한도(연도별 DSR/DTI 상한, 연 원리금 상환 기준)
export function budgetOf(L) {
  const mb = T('MOVE_BUDGET'), y = L.year, INC = Math.max(0, econ(L).INC);
  const r = (yr(T('BASE_RATE'), y) ?? 0.05) + 0.02, n = mb.term;
  const ann = r / (1 - (1 + r) ** -n);
  const help = L.family.parents.father.alive || L.family.parents.mother.alive ? Math.max(0, L.household.netWorth) * CLASS_CAL.help[L.birth.quintile - 1] : 0;
  return { INC, ann, assets: Math.max(0, L.money.assets) + (L.home.deposit || 0) + (L.home.owned ? L.home.value : 0) * 0.9 - (L.home.owned ? L.money.loans.mortgage : 0) + help, loanCap: Math.max(0, yr(mb.dsr, y) * INC / ann - (L.money.debt - (L.home.owned ? L.money.loans.mortgage : 0) - L.money.loans.jeonse)), rentCap: mb.rentCap * INC, jx: mb.jeonseLoanX };
}
export function fits(L, b, tenure, tier, sz = 1, id) {
  const y = L.year;
  if (tenure === 'own') { const p = priceAt(tier, y, id) * sz, ltv = yr(T('LTV')[L.home.regionGroup], y); return p - Math.min(ltv * p, b.loanCap) <= b.assets + b.INC; } // INC: 신용·가족 차입 등 보완 자금
  if (tenure === 'jeonse') { const d = jeonseAt(tier, y, id, L.home.regionGroup) * 0.55; return d - Math.min(0.8 * d, b.jx * b.INC) <= b.assets && d * 0.8 <= b.loanCap + b.assets; }
  const r = rentAt(tier, y, false, id); return r.rent * 12 <= b.rentCap && r.deposit <= b.assets + b.INC;
}
// 같은 시도 안에서 예산에 맞는 (시군구, 점유 형태) 선택. 없으면 점유 형태를 낮추고, 끝까지 없으면 최저 등급의 저가 월세.
function chooseTarget(L, ctx, tenure, region, size) {
  const h = L.home, y = L.year, b = budgetOf(L), cs = candidates(region, y), want = tierOfL(L);
  const ladder = tenure === 'own' ? ['own', 'jeonse', 'monthly'] : tenure === 'jeonse' ? ['jeonse', 'monthly'] : [tenure];
  const pick = list => {
    const cur = list.find(c => c.r.id === h.sigungu);
    if (cur && region === h.region && ctx.chance(T('MOVE_RATE').stay)) return cur.r;
    const w = list.map(c => c.p * Math.exp(-0.8 * Math.abs(c.r.housingTier - want)));
    return list[+ctx.weighted(Object.fromEntries(w.map((x, i) => [i, x])))].r;
  };
  for (const t of ladder) {
    const ok = tenure === 'public' ? cs.filter(c => c.r.housingTier <= 3) : cs.filter(c => fits(L, b, t, c.r.housingTier, size, c.r.id));
    if (ok.length) return { tenure: t, place: place(ctx.weighted, pick(ok), y), cheap: false };
  }
  const low = Math.min(...cs.map(c => c.r.housingTier)), lows = cs.filter(c => c.r.housingTier === low);
  return { tenure: 'monthly', place: place(ctx.weighted, pick(lows), y), cheap: tenure !== 'public' };
}
export const canOwn = (L, ctx, size = 0.8) => { const b = budgetOf(L); return candidates(L.home.region, L.year).some(c => fits(L, b, 'own', c.r.housingTier, size, c.r.id)); };

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
      // 독립 후 이사: 예산에 맞는 (시군구, 점유 형태)만 후보. 부모 집·시설·기숙사·공공임대 외
      let cheap = false;
      if (indep(L) && h.sigungu && tenure !== 'facility' && tenure !== 'dorm' && tenure !== 'family') {
        const size = tenure === 'own' ? Math.min(1.3, Math.max(0.4, (price ?? homePrice(L)) / Math.max(1, homePrice(L)))) : 1;
        const t = chooseTarget(L, ctx, tenure, h.region, size);
        Object.assign(h, t.place);
        tenure = t.tenure; cheap = t.cheap;
        if (tenure === 'own') price = Math.round(homePrice(L) * size);
      }
      h.cheap = cheap;
      h.parents = tenure === 'family';
      h.tenure = tenure; h.rent = 0; h.contractEnd = null;
      if (tenure === 'monthly' || tenure === 'public') {
        const r = rentFor(L, ctx);
        h.rent = tenure === 'public' ? Math.round(r.rent * 0.5) : r.rent;
        payDeposit(tenure === 'public' ? Math.round(r.deposit * 0.3) : r.deposit, 0.5);
        h.contractEnd = L.year + 2;
      } else if (tenure === 'jeonse') {
        const size = 0.45 + 0.2 * ctx.rand();
        payDeposit(Math.round(jeonseAt(tierOfL(L), L.year, h.sigungu, h.regionGroup) * size), 0.8);
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
      // 같은 해 두 번째 이사는 새 기록을 만들지 않고 마지막 이사를 갱신(연 1회 상한)
      const last = h.moves[h.moves.length - 1];
      if (last && last.year === L.year && last.reason !== '독립') { last.to = tenure; last.reason = reason; }
      else { h.moves.push({ year: L.year, to: tenure, reason }); tally(L, 'moves'); }
      if (involuntary) tally(L, 'invMoves');
      if (!silent) ctx.sys('sys.home.move', { toLabel: TENURE_LABEL[tenure], reasonLabel: reason });
    },
    moveRegion(key, { silent = false } = {}) {
      const h = L.home;
      if (!key || key === h.region) return;
      if (!isCapital(h.region) && isCapital(key)) L.flags.toCapital = L.year;
      h.region = key; h.regionGroup = regionGroup(key);
      if (indep(L) && h.sigungu && !h.parents) {
        const t = chooseTarget(L, ctx, 'monthly', key, 1);
        Object.assign(h, t.place);
      } else Object.assign(h, pickMoveTarget(ctx.weighted, key, L.year, levelOf(L)));
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
      L.flags.lastJob = { wage: j.wage, years: j.years, regular: j.regular, title: j.title, year: L.year };   // 직전 일자리(실직 뒤 선택지의 급여·실업급여 계산 근거)
      j.status = 'seeking'; j.wage = 0; j.regular = false; j.searchYears = 0; j.platform = false;
    },
    loseJob(reason = '사업 부진') {
      if (L.job.status !== 'employed' && L.job.status !== 'self') return;
      act.endJob(reason);
      ctx.sys('sys.job.lose', { reasonLabel: reason });
      tally(L, 'jobLosses'); L.flags.jobLoss = L.year;
    },
    retire() {
      if (L.job.status === 'employed' || L.job.status === 'self') act.endJob('은퇴');
      L.job.status = 'retired'; L.job.wage = 0;
    },
    // o: 제안 직업 행(없으면 지금·직전 직업). code·major·band·ai·hazard를 그대로 가져간다(QA-S-29)
    startBusiness(title, o = L.job) {
      const amount = o.capital ?? 3000 + Math.round(5000 * ctx.rand());
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
      if (!f.partner.since) {                          // 새 배우자 개체: 이름·시작연도를 연표에 남긴다(QA #7)
        const no = (f.spouses ||= []).length + 1;
        Object.assign(f.partner, { no, since: L.year, name: spouseName(L.seed, no, f.partner.sex, L.year - f.partner.age) });
        f.spouses.push({ no, name: f.partner.name, since: L.year, until: null, end: null });
      }
      if (!silent) ctx.sys('sys.fam.wedding', {}, { spouse: spouseRef(f.partner) });
      if (!indep(L)) becomeIndependent(L, ctx);
      act.spend(1500 + Math.round(1500 * ctx.rand()));
      if (L.home.parents || L.home.tenure === 'dorm') act.move('jeonse', { reason: '결혼', silent: true });
    },
    divorce() {
      const f = L.family, sp = f.partner;
      f.partner = null; f.married = false; f.divorced = true;
      endSpouse(L, sp, 'divorced');
      L.flags.divorceYear = L.year; tally(L, 'divorces');
      if (L.home.owned) { sell(0.5); ctx.sys('sys.home.sell'); act.move('monthly', { reason: '이혼', involuntary: true, silent: true }); }
      ctx.sys('sys.fam.divorced', {}, sp ? { spouse: { ...spouseRef(sp), end: 'divorced' } } : {});
    },
    loseSpouse() {
      const f = L.family;
      if (!f.partner) return;
      const sp = f.partner;
      f.partner = null; f.married = false; f.widowed = true;
      L.flags.widowYear = L.year;
      endSpouse(L, sp, 'widowed');
      ctx.sys('sys.fam.widowed', {}, { ...sensFields(L, 'death'), spouse: { ...spouseRef(sp), end: 'widowed' } });
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
    endCare(cause) {
      const who = L.family.caringFor;
      if (!who) return;
      L.family.caringFor = null;
      ctx.sys('sys.fam.care_end', { who: WHO_LABEL[who] || who, because: cause === 'death' ? ' 사망으로' : '' });
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

const spouseRef = p => ({ no: p.no, name: p.name, since: p.since });
function endSpouse(L, p, end) {
  const rec = p && L.family.spouses?.find(s => s.no === p.no);
  if (rec) Object.assign(rec, { until: L.year, end });
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
