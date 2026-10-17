// 자산 운용과 자금 압박(투자 선택지). L.invest = { w:{deposit,stock,fx,realty}, since, last:{year,r,by,delta} }.
// 운용 비중 w는 현금성 자산(L.money.assets)에 곱해지는 비율이고, 매년 그해의 실질 수익률(data/market.js)이 그대로 순자산에 반영된다.
import { indep, homePrice, refreshDebt } from '../act.js';
import { econ } from '../stats.js';
import { creditRate } from '../plans.js';
import { realReturns, ASSET_LABEL, CAUSE } from '../../data/market.js';
import { T, yr, ag } from '../tables.js';
import { ACQ_TAX, RENT_TAX, SIDEJOB, PRIVATE_PENSION, taxKind } from '../../data/incomes.js';
import { realRate, priceChg, yieldOf, vacancyOf, HOLD, RENTAL_LABEL } from './money.js';

const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
const rnd = Math.round;
const BASE = 0.01;       // money.js가 이미 현금성 자산에 주는 연 1%(실질) — 투자 수익은 이를 뺀 초과분만 더한다
export const PORTFOLIOS = {
  safe: { label: '예·적금 중심으로 지킨다', w: { deposit: 0.7 }, risk: '안정형' },
  mix: { label: '예금·주식·달러·부동산에 나눠 담는다', w: { deposit: 0.35, stock: 0.3, fx: 0.1, realty: 0.15 }, risk: '분산형' },
  stock: { label: '주식에 분산 투자한다', w: { stock: 0.6, deposit: 0.2 }, risk: '공격형' },
  gold: { label: '금을 사서 모아 둔다', w: { gold: 0.3, deposit: 0.3 }, risk: '안전 자산' },
  fx: { label: '달러 등 외화 자산을 늘린다', w: { fx: 0.4, deposit: 0.3, stock: 0.1 }, risk: '환율 연동' },
  realty: { label: '소형 부동산(오피스텔·상가)에 투자한다', w: { realty: 0.5, deposit: 0.2 }, risk: '장기·비유동', minAssets: 3000 },
  none: { label: '투자하지 않고 일상에 쓴다', w: {}, risk: '소비' },
};
const group = L => L.home.regionGroup || 'capital';
const sum = w => Object.values(w || {}).reduce((s, v) => s + v, 0);
export function portfolioTurnover(before = {}, after = {}) {
  before ||= {}; after ||= {};
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  return (Array.from(keys).reduce((n, k) => n + Math.abs((after[k] || 0) - (before[k] || 0)), 0) + Math.abs(sum(after) - sum(before))) / 2;
}
const retOf = (w, r) => Object.entries(w).reduce((s, [k, v]) => s + v * (r[k] - BASE), 0);
// 최근 10년(지난해까지) 이 비중이었다면: 평균 실질 수익률·가장 나빴던 해
function history(L, w) {
  const out = []; for (let y = L.year - 10; y < L.year; y++) out.push([y, retOf(w, realReturns(y, group(L)))]);
  const worst = out.reduce((a, b) => (b[1] < a[1] ? b : a));
  return { avg: out.reduce((s, [, v]) => s + v, 0) / out.length, worst: worst[1], worstYear: worst[0] };
}
const pct = v => `${v >= 0 ? '+' : '−'}${Math.abs(Math.round(v * 100))}%`;
function planOptions(L) {
  const A = Math.max(0, L.money.assets), out = [];
  for (const [id, p] of Object.entries(PORTFOLIOS)) {
    if (p.minAssets && A < p.minAssets) continue;
    const h = id === 'none' ? null : history(L, p.w);
    out.push({ id, label: p.label, w: p.w, cost: { invest: rnd(A * sum(p.w)), note: h ? `변경한 자산 비중에 거래비용 1% · ${p.risk} · 최근 10년 평균 연 ${pct(h.avg)}, 가장 나빴던 해 ${pct(h.worst)}(${h.worstYear}년)` : '모아 두지 않고 쓰는 대신 여가와 관계에 쓴다' } });
  }
  return out;
}
// 코스피 −20% 이하였던 해의 다음 해 평균(역사 기록)
function reboundAvg() {
  const dn = []; for (let y = 1982; y < 2025; y++) if (realReturns(y).stock <= -0.2) dn.push(realReturns(y + 1).stock);
  return dn.length ? dn.reduce((s, v) => s + v, 0) / dn.length : 0;
}

export function step(L, ctx) {
  const a = L.age, y = L.year, m = L.money, fl = L.flags, inv = (L.invest ||= { w: null, since: null, last: null });
  if (!indep(L)) return;
  const A = Math.max(0, m.assets);
  // 2) 큰 손실 뒤: 팔지, 버틸지, 더 담을지(역사적 반등 기록을 보여 준다)
  if (inv.last?.year === y - 1 && inv.last.r <= -0.12 && A > 0 && (inv.w?.stock ?? 0) >= 0.3 && !L.yr.asked && fl.panicAsked !== y) {
    fl.panicAsked = y;
    const A2 = Math.max(0, m.assets);
    return ctx.ask({ eventId: 'sys.invest.panic', options: [
      { id: 'sell', label: '더 떨어지기 전에 안전 자산으로 옮긴다', cost: { note: '손실이 확정된다. 이후 반등은 놓친다' } },
      { id: 'hold', label: '그대로 버틴다', cost: { note: `역사적으로 큰 하락(−20% 이하) 다음 해 평균 ${pct(reboundAvg())}이었지만 더 내려간 해도 있었다` } },
      { id: 'add', label: '떨어진 김에 주식 비중을 늘린다', cost: { invest: rnd(A2 * 0.15), note: '맞으면 크게, 틀리면 더 크게 흔들린다' } },
    ], defaultId: 'hold', data: {}, vars: { loss: pct(inv.last.r) } });
  }
  evaluateYear(L, ctx);
  // 3) 주기적 운용 계획(여윳돈이 쌓였을 때)
  if (a >= 25 && a <= 72 && A >= 800 && !L.yr.asked && (inv.since == null ? ctx.chance(0.25) : y - inv.since >= 6 && ctx.chance(0.3))) {
    const opts = planOptions(L);
    return ctx.ask({ eventId: 'sys.invest.plan', options: opts.map(({ id, label, cost }) => ({ id, label, cost })), defaultId: inv.w ? 'mix' : 'safe', data: { plans: opts } });
  }
  // 3-1) 세 주려고 부동산을 산다(여윳돈이 대출 낀 지분만큼 쌓였을 때)
  const own = myRentals(L).length;
  if (a >= 30 && a <= 70 && own < 2 && !L.yr.asked && !(fl.rentalAsked > y - 5) && !m.deficitYears && ctx.chance(0.08)) {
    const opts = rentalOptions(L);
    if (opts.length) {
      fl.rentalAsked = y;
      opts.push({ id: 'no', label: '사지 않고 지금처럼 둔다', cost: { note: '대출·공실 걱정은 없지만 임대료도 없다' } });
      // 기본 행동: 60세 이하이고 대출 없이 현금 3분의 1 이하로 살 수 있는 유형이 있으면 산다, 아니면 보류
      const safe = a <= 60 && opts.find(o => o.loan === 0 && A >= 3 * o.equity);
      return ctx.ask({ eventId: 'sys.invest.rental', options: opts.map(({ id, label, cost }) => ({ id, label, cost })), defaultId: safe?.id ?? 'no', data: { plans: opts } });
    }
  }
  // 3-2) 부업(직장인 30~55세, 겸업이 막힌 공공 부문·직업군인 제외; 빚·적자가 있으면 더 자주, 미취학 자녀가 있으면 덜)
  const j = L.job;
  if (a >= 30 && a <= 55 && j.status === 'employed' && !j.public && j.major !== 'A' && !fl.sidejob && !L.yr.asked && !(fl.sideAsked > y - 6)
    && ctx.chance(0.03 * (m.deficitYears || m.debt > econ(L).INC ? 2 : 1) * (L.family.children.some(c => c.alive && y - c.birthYear <= 6) ? 0.5 : 1))) {
    fl.sideAsked = y;
    const opts = sideOptions(L);
    return ctx.ask({ eventId: 'sys.money.sidejob', options: opts.map(({ id, label, cost }) => ({ id, label, cost })), defaultId: m.deficitYears ? 'deliver' : 'no', data: { plans: opts } });
  }
  // 3-3) 개인연금·IRP 가입(1994 개인연금저축 도입 이후, 일하는 28~50세)
  if (a >= 28 && a <= 50 && y >= PRIVATE_PENSION.values.start && (j.status === 'employed' || j.status === 'self') && !L.pension2 && !L.yr.asked && !(fl.pensAsked > y - 8) && ctx.chance(0.12)) {
    fl.pensAsked = y;
    const opts = pensionOptions(L);
    return ctx.ask({ eventId: 'sys.money.pension', options: opts.map(({ id, label, cost }) => ({ id, label, cost })), defaultId: econ(L).INCpos >= 65 ? 'basic' : 'no', data: { plans: opts } });
  }
  // 3-4) 연금 수령 방식(55세 이후 일을 놓았거나 60세가 되면)
  const pn = L.pension2;
  if (pn && !pn.draw && pn.balance > 0 && a >= 55 && (a >= 60 || j.status !== 'employed') && !L.yr.asked) {
    const opts = drawOptions(L);
    return ctx.ask({ eventId: 'sys.money.pension_draw', options: opts.map(({ id, label, cost }) => ({ id, label, cost })), defaultId: 'annuity', data: { plans: opts } });
  }
  // 4) 자금 압박: 적자가 이어져 바닥나면 집을 줄이거나 씀씀이를 줄이는 갈림길
  if (m.deficitYears >= 2 && A < econ(L).INC * 0.15 && (!fl.crunch || y - fl.crunch >= 3) && !L.yr.asked) {
    fl.crunch = y;
    const h = L.home, living = Math.max(60, rnd(econ(L).INC * 0.25)), plans = [];
    if (h.owned) plans.push({ id: 'sellhome', label: '집을 팔고 전세·월세로 줄여 간다', cost: { cash: Math.max(0, rnd(h.value * 0.97 - (m.loans.mortgage || 0))), note: '집값에서 대출·중개비를 뺀 돈이 들어온다. 이후 집값이 올라도 내 몫이 아니다' } });
    const mine = myRentals(L);
    if (mine.length) {
      const r = mine.reduce((p, q) => (q.value > p.value ? q : p)), pay = rentalLoanShare(L, r);
      plans.push({ id: 'sellrental', label: `세 준 ${RENTAL_OBJ[r.sub] ?? "집을"} 판다`, rentalAt: L.rentals.indexOf(r), cost: { cash: Math.max(0, rnd(r.value * 0.97 - pay)), monthly: rnd(r.rent / 12), note: '매매가에서 남은 대출·중개비를 뺀 돈이 들어오고, 매달 들어오던 임대료는 끊긴다' } });
    }
    if (L.pension2?.balance > 0 && !L.pension2.draw) {
      plans.push({ id: 'cashout', label: '개인연금을 깨서 쓴다', cost: { cash: rnd(L.pension2.balance * (1 - PRIVATE_PENSION.values.lumpTax)), note: '기타소득세 16.5%를 떼고 받는다. 노후에 받을 연금이 사라진다' } });
    }
    plans.push({ id: 'cut', label: '씀씀이를 크게 줄이고 버틴다', cost: { monthly: -rnd(living * 0.15 / 12), note: '2년간 지출 15%를 줄이는 대신 여가와 기분이 줄어든다' } });
    if ([L.family.parents.father, L.family.parents.mother].some(p => p.alive) || L.family.children.some(c => c.alive && y - c.birthYear >= 25)) {
      const aid = clamp(rnd(homePrice(L) * 0.06), 300, 2500);
      plans.push({ id: 'family', label: '가족에게 도움을 청한다', aid, cost: { cash: aid, note: '도움은 받지만 관계에 빚이 남는다' } });
    }
    const need = clamp(rnd(living * 0.5), 200, 3000);
    plans.push({ id: 'loan', label: '신용대출로 일단 버틴다', need, cost: { cash: need, loan: need, monthly: rnd(need * creditRate(L.year) / 12), note: '이자가 매달 나간다' } });
    return ctx.ask({ eventId: 'sys.money.crunch', options: plans.map(({ id, label, cost }) => ({ id, label, cost })), defaultId: 'cut', data: { plans } });
  }
}

function evaluateYear(L, ctx) {
  const inv = L.invest, y = L.year, m = L.money, A = Math.max(0, m.assets);
  if (inv.evaluatedYear === y) return;
  inv.evaluatedYear = y;
  // 1) 지난 선택에 따른 올해 평가손익
  if (inv.w && A > 0) {
    const r = realReturns(y, group(L)), by = {}, pr = retOf(inv.w, r);
    for (const k of Object.keys(inv.w)) by[k] = r[k];
    const delta = rnd(A * pr);
    m.assets = Math.max(0, m.assets + delta);
    L.tally.invGain = (L.tally.invGain || 0) + delta;
    inv.last = { year: y, r: pr, by, delta };
    const big = Object.entries(inv.w).filter(([k, v]) => v >= 0.2 && Math.abs(r[k]) >= 0.25).sort((p, q) => Math.abs(r[q[0]]) - Math.abs(r[p[0]]))[0];
    if (Math.abs(pr) >= 0.1 || big) {
      const k = big?.[0] ?? Object.entries(inv.w).sort((p, q) => Math.abs(r[q[0]] * q[1]) - Math.abs(r[p[0]] * p[1]))[0][0];
      ctx.sys('sys.invest.year', { year: y, cause: CAUSE[y] ?? (r[k] >= 0 ? `${ASSET_LABEL[k]} 시장이 올랐다` : `${ASSET_LABEL[k]} 시장이 내렸다`), asset: ASSET_LABEL[k], dir: pr >= 0 ? `불어났다(평가 ${pct(pr)})` : `줄었다(평가 ${pct(pr)})` });
    }
  }
}

// ── 근로 외 소득원 선택지 [R17] ──
// 공실(평균 4개월)·임대소득세를 뺀 순임대수익률
const netYield = (sub, y) => yieldOf(sub, y) * (1 - vacancyOf(sub, y) * 4 / 12) * (1 - ag(RENT_TAX.values, y)[taxKind(sub)]);
// 이 유형을 지난 10년 가졌다면: 해마다 (가격 변동 + 순임대수익률 − 보유비)의 평균·가장 나빴던 해
function rentalHistory(L, sub) {
  const g = group(L), out = [];
  for (let y = L.year - 10; y < L.year; y++) out.push([y, priceChg(sub, g, y) + netYield(sub, y) - HOLD]);
  const worst = out.reduce((p, q) => (q[1] < p[1] ? q : p));
  return { avg: out.reduce((s, [, v]) => s + v, 0) / out.length, worst: worst[1], worstYear: worst[0] };
}
const pct1 = v => `${(v * 100).toFixed(1)}%`;
const RENTAL_TYPES = [['officetel', 0.35, '오피스텔 한 칸을 사서 월세를 준다', 1985], ['apt', 0.55, '소형 아파트를 한 채 더 사서 세를 준다', 1960], ['shop', 0.6, '동네 상가 1층 점포를 사서 세를 준다', 1960]];
export function rentalOptions(L) {
  const y = L.year, A = Math.max(0, L.money.assets), base = homePrice(L), out = [];
  for (const [sub, f, label, from] of RENTAL_TYPES) {
    if (y < from) continue;
    const value = rnd(base * f), acq = rnd(value * ag(ACQ_TAX.values, y)[sub === 'apt' ? 'apt' : 'other']);
    const need = rnd(value * 0.5 + acq);                         // 담보대출은 가격의 절반까지 [추정: LTV 40~70% 시대 평균]
    if (A * 0.9 < need) continue;
    const equity = Math.min(rnd(A * 0.9), value + acq), loan = value + acq - equity;
    const rent = rnd(value * yieldOf(sub, y)), h = rentalHistory(L, sub), vac = vacancyOf(sub, y);
    const netRent = rnd(value * (netYield(sub, y) - HOLD));
    out.push({ id: sub, sub, label, value, acq, equity, loan, rent, cost: {
      invest: equity, loan, monthly: rnd((loan * realRate(y) - netRent) / 12),
      note: `${RENTAL_LABEL[sub]} ${value}만 원(취득세 ${acq}만 포함, 내 돈 ${equity}만) · 임대수익률 연 ${pct1(yieldOf(sub, y))} · 해마다 공실 위험 ${Math.round(vac * 100)}%(나면 2~6개월 비움) · 최근 10년 이런 투자는 평균 연 ${pct(h.avg)}, 가장 나빴던 해 ${pct(h.worst)}(${h.worstYear}년)`,
    } });
  }
  return out;
}
const RENTAL_OBJ = { apt: '소형 아파트를', officetel: '오피스텔을', shop: '상가를' };
const myRentals = L => (L.rentals || []).filter(r => r.sub);
// 이 부동산 몫의 남은 임대 대출(내가 산 임대 부동산 가치 비례)
function rentalLoanShare(L, r) {
  const tot = myRentals(L).reduce((s, x) => s + x.value, 0);
  return rnd((L.money.loans.rental || 0) * (tot > 0 ? r.value / tot : 1));
}
export function sellRental(L, ctx, at) {
  const r = L.rentals?.[at];
  if (!r) return;
  const pay = rentalLoanShare(L, r);
  L.money.loans.rental = Math.max(0, (L.money.loans.rental || 0) - pay);
  refreshDebt(L);
  ctx.act.gain(rnd(r.value * 0.97 - pay));                       // 중개비·양도 비용 3%
  L.rentals.splice(at, 1);
}
function sideOptions(L) {
  const S = SIDEJOB.values, eraI = yr(T('ERA_INCOME_INDEX'), L.year), on = S.online;
  const online = rnd((on[0] + (on[1] - on[0]) * L.stats.intellect / 100) * eraI), deliver = rnd(S.deliver * eraI);
  return [
    { id: 'deliver', label: '퇴근 뒤와 주말에 배달·대리운전을 한다', income: deliver, cost: { monthly: -rnd(deliver * 0.85 / 12), note: `세금 떼고 월 ${rnd(deliver * 0.85 / 12)}만 원 안팎 · 쉬는 시간과 건강이 해마다 깎인다 · 한 해에 4명 중 1명꼴로 그만둔다` } },
    { id: 'online', label: '온라인 판매·강의 같은 부업을 시작한다', income: online, cost: { monthly: -rnd(online * 0.85 / 12), note: `배운 것이 많을수록 더 번다(지금 기준 월 ${rnd(online * 0.85 / 12)}만 원 안팎) · 쉬는 시간이 줄어든다` } },
    { id: 'no', label: '본업에만 집중한다', cost: { note: '부업하는 사람은 취업자의 2% 안팎(통계청 경제활동인구조사)' } },
  ];
}
// 60세까지 매달 mo씩 넣으면: 최근 10년 평균 수익률(예금 6 : 주식 4)로 불린 적립금을 20년 나눠 받을 때 월 수령액
function pensionProjection(L, mo) {
  let avg = 0; for (let y = L.year - 10; y < L.year; y++) { const r = realReturns(y); avg += (0.6 * r.deposit + 0.4 * r.stock) / 10; }
  let bal = 0; for (let a = L.age; a < 60; a++) bal = bal * (1 + avg) + mo * 12;
  return { avg, monthly: rnd(bal * (1 - PRIVATE_PENSION.values.annuityTax) / 20 / 12) };
}
function pensionOptions(L) {
  const PP = PRIVATE_PENSION.values, cr = L.year >= 2014 && econ(L).INC < 5500 ? PP.creditLow : ag(PP.credit, L.year);
  const mk = (id, label, mo) => { const pr = pensionProjection(L, mo); return { id, label, monthly: mo, cost: { monthly: mo, note: `연 ${rnd(mo * 12 * cr)}만 원 세금 혜택 · 60세까지 넣으면 이후 20년간 월 약 ${pr.monthly}만 원(최근 10년 평균 연 ${pct(pr.avg)} 기준) · 중도 해지하면 16.5% 세금` } }; };
  return [mk('basic', '연금저축·IRP에 매달 조금씩 넣는다', 25), mk('max', '세금 혜택 한도까지 꽉 채워 넣는다', 50),
    { id: 'no', label: '노후는 국민연금과 집으로 버틴다', cost: { note: '지금 쓸 돈이 늘지만 노후 소득원이 하나 줄어든다' } }];
}
function drawOptions(L) {
  const b = L.pension2.balance, PP = PRIVATE_PENSION.values;
  return [
    { id: 'annuity', label: '지금부터 20년 동안 나눠 받는다', cost: { monthly: -rnd(b * (1 - PP.annuityTax) / 20 / 12), note: '연금소득세 3.3~5.5%만 낸다. 남은 돈은 계속 굴러간다' } },
    { id: 'later', label: '65세까지 미뤘다가 10년 동안 받는다', cost: { monthly: -rnd(b * (1 - PP.annuityTax) / 10 / 12), note: '기다리는 동안 적립금이 더 불어나지만, 그 전에는 쓸 수 없다' } },
    { id: 'lump', label: '한꺼번에 찾아 쓴다', cost: { cash: rnd(b * (1 - PP.lumpTax)), note: '기타소득세 16.5%를 뗀다. 퇴직연금 수령 계좌의 96%(2021년)가 일시금을 골랐다' } },
  ];
}

export const choices = {
  'sys.invest.rental'(L, ctx, opt, { plans }) {
    const p = plans.find(x => x.id === opt);
    if (!p || p.id === 'no') return;
    L.money.assets = Math.max(0, L.money.assets - p.equity);
    if (p.loan > 0) ctx.act.borrow(p.loan, 'rental', { silent: true });
    (L.rentals ||= []).push({ kind: 'realty', sub: p.sub, rent: p.rent, since: L.year, region: group(L), value: p.value });
    ctx.apply({ stats: { happiness: 1 }, issues: { living: p.loan > 0 ? 1 : 0 } }, { reason: `${RENTAL_OBJ[p.sub]} 사서 세를 놓았다` });
  },
  'sys.money.sidejob'(L, ctx, opt, { plans }) {
    const p = plans.find(x => x.id === opt);
    if (!p || p.id === 'no') return;
    L.flags.sidejob = { kind: p.id, income: p.income, since: L.year, earned: 0 };
    ctx.apply({ stats: { leisure: -3, ...(p.id === 'deliver' && { health: -1 }) }, issues: { living: -2 } }, { reason: '부업을 시작했다' });
  },
  'sys.money.pension'(L, ctx, opt, { plans }) {
    const p = plans.find(x => x.id === opt);
    if (!p || p.id === 'no') return;
    L.pension2 = { monthly: p.monthly, since: L.year, balance: 0, paidIn: 0 };
    ctx.apply({ issues: { living: -1 } }, { reason: '노후를 위해 개인연금에 들었다' });
  },
  'sys.money.pension_draw'(L, ctx, opt) {
    const pn = L.pension2, PP = PRIVATE_PENSION.values;
    pn.monthly = 0;
    if (opt === 'lump') { ctx.act.gain(rnd(pn.balance * (1 - PP.lumpTax))); pn.balance = 0; pn.draw = 'lump'; return ctx.apply({ stats: { happiness: 1 } }, { reason: '연금을 한꺼번에 찾았다' }); }
    pn.draw = 'annuity';
    if (opt === 'later') { pn.drawAge = Math.max(65, L.age); pn.left = 10; } else { pn.drawAge = L.age; pn.left = 20; }
  },
  'sys.invest.plan'(L, ctx, opt, { plans }) {
    const p = plans.find(x => x.id === opt) || plans[0], inv = L.invest;
    const A = Math.max(0, L.money.assets), moved = portfolioTurnover(inv.w, p.w);
    L.money.assets = Math.max(0, L.money.assets - rnd(A * moved * 0.01));      // 현금 포함 편도 회전율에 거래비용 1%
    inv.w = Object.keys(p.w).length ? { ...p.w } : null; inv.since = L.year; inv.plan = p.id;
    if (p.id === 'none') return ctx.apply({ stats: { leisure: 2, happiness: 1 }, issues: { living: -1 } }, { reason: '모으는 대신 쓰기로 했다' });
    ctx.apply({ issues: { living: p.id === 'safe' ? -1 : 0 } }, { reason: '자산 운용 방식을 정했다' });
  },
  'sys.invest.panic'(L, ctx, opt) {
    const inv = L.invest;
    try {
    if (opt === 'sell') { inv.w = { deposit: 0.7 }; inv.plan = 'safe'; return ctx.apply({ stats: { happiness: 1 } }, { reason: '손실을 확정하고 안전 자산으로 옮겼다' }); }
    if (opt === 'add') { inv.w = { ...inv.w, stock: Math.min(0.85, (inv.w.stock || 0) + 0.15) }; return ctx.apply({ stats: { happiness: -2 } }, { reason: '하락장에서 주식 비중을 늘렸다' }); }
    ctx.apply({ stats: { happiness: -1, health: -1 } }, { reason: '버티며 불안한 해를 보냈다' });
    } finally { evaluateYear(L, ctx); }
  },
  'sys.money.crunch'(L, ctx, opt, { plans }) {
    const p = plans.find(x => x.id === opt) || plans[0], fl = L.flags;
    fl.crunchPlan = { year: L.year, opt: p.id };
    if (L.invest) L.invest.w = null;                   // 급한 돈이 필요해 운용 자산을 정리한다
    if (p.id === 'sellhome') {
      ctx.act.move(L.money.assets > homePrice(L) * 0.25 ? 'jeonse' : 'monthly', { reason: '집을 팔아 현금 마련', involuntary: true, silent: true });
      return ctx.apply({ issues: { housing: 5, living: 3 }, stats: { happiness: -2, leisure: -1 } }, { reason: '집을 팔아 빚과 생활비를 정리했다' });
    }
    if (p.id === 'sellrental') { sellRental(L, ctx, p.rentalAt); return ctx.apply({ issues: { living: 2 }, stats: { happiness: -1 } }, { reason: '세 주던 부동산을 팔아 급한 돈을 마련했다' }); }
    if (p.id === 'cashout') { const pn = L.pension2; ctx.act.gain(rnd(pn.balance * (1 - PRIVATE_PENSION.values.lumpTax))); pn.balance = 0; pn.monthly = 0; pn.draw = 'lump'; return ctx.apply({ issues: { living: 2 }, stats: { happiness: -1 } }, { reason: '노후 연금을 깨서 생활비로 썼다' }); }
    if (p.id === 'cut') { fl.cutUntil = L.year + 2; return ctx.apply({ issues: { living: 3 }, stats: { leisure: -3, happiness: -2 } }, { reason: '씀씀이를 줄이고 버텼다' }); }
    if (p.id === 'family') { ctx.act.gain(p.aid); return ctx.apply({ stats: { relations: -2, happiness: -1 }, issues: { care: 2 } }, { reason: '가족의 도움을 받았다' }); }
    ctx.act.borrow(p.need, 'credit', { silent: true }); ctx.act.gain(p.need);
    ctx.apply({ issues: { living: 4 }, stats: { happiness: -2 } }, { reason: '신용대출로 급한 불을 껐다' });
  },
};
