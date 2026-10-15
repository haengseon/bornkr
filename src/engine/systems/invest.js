// 자산 운용과 자금 압박(투자 선택지). L.invest = { w:{deposit,stock,fx,realty}, since, last:{year,r,by,delta} }.
// 운용 비중 w는 현금성 자산(L.money.assets)에 곱해지는 비율이고, 매년 그해의 실질 수익률(data/market.js)이 그대로 순자산에 반영된다.
import { indep, homePrice } from '../act.js';
import { econ } from '../stats.js';
import { creditRate } from '../plans.js';
import { realReturns, ASSET_LABEL, CAUSE } from '../../data/market.js';

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
    out.push({ id, label: p.label, w: p.w, cost: { invest: rnd(A * sum(p.w)), note: h ? `${p.risk} · 최근 10년 평균 연 ${pct(h.avg)}, 가장 나빴던 해 ${pct(h.worst)}(${h.worstYear}년)` : '모아 두지 않고 쓰는 대신 여가와 관계에 쓴다' } });
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
      ctx.sys('sys.invest.year', { cause: CAUSE[y] ?? (r[k] >= 0 ? `${ASSET_LABEL[k]} 시장이 올랐다` : `${ASSET_LABEL[k]} 시장이 내렸다`), asset: ASSET_LABEL[k], dir: pr >= 0 ? `불어났다(평가 ${pct(pr)})` : `줄었다(평가 ${pct(pr)})` });
    }
  }
  // 2) 큰 손실 뒤: 팔지, 버틸지, 더 담을지(역사적 반등 기록을 보여 준다)
  if (inv.last?.year === y - 1 && inv.last.r <= -0.12 && (inv.w?.stock ?? 0) >= 0.3 && !L.yr.asked && fl.panicAsked !== y) {
    fl.panicAsked = y;
    const A2 = Math.max(0, m.assets);
    return ctx.ask({ eventId: 'sys.invest.panic', options: [
      { id: 'sell', label: '더 떨어지기 전에 안전 자산으로 옮긴다', cost: { note: '손실이 확정된다. 이후 반등은 놓친다' } },
      { id: 'hold', label: '그대로 버틴다', cost: { note: `역사적으로 큰 하락(−20% 이하) 다음 해 평균 ${pct(reboundAvg())}이었지만 더 내려간 해도 있었다` } },
      { id: 'add', label: '떨어진 김에 주식 비중을 늘린다', cost: { invest: rnd(A2 * 0.15), note: '맞으면 크게, 틀리면 더 크게 흔들린다' } },
    ], defaultId: 'hold', data: {}, vars: { loss: pct(inv.last.r) } });
  }
  // 3) 주기적 운용 계획(여윳돈이 쌓였을 때)
  if (a >= 25 && a <= 72 && A >= 800 && !L.yr.asked && (inv.since == null ? ctx.chance(0.25) : y - inv.since >= 6 && ctx.chance(0.3))) {
    const opts = planOptions(L);
    return ctx.ask({ eventId: 'sys.invest.plan', options: opts.map(({ id, label, cost }) => ({ id, label, cost })), defaultId: inv.w ? 'mix' : 'safe', data: { plans: opts } });
  }
  // 4) 자금 압박: 적자가 이어져 바닥나면 집을 줄이거나 씀씀이를 줄이는 갈림길
  if (m.deficitYears >= 2 && A < econ(L).INC * 0.15 && (!fl.crunch || y - fl.crunch >= 3) && !L.yr.asked) {
    fl.crunch = y;
    const h = L.home, living = Math.max(60, rnd(econ(L).INC * 0.25)), plans = [];
    if (h.owned) plans.push({ id: 'sellhome', label: '집을 팔고 전세·월세로 줄여 간다', cost: { cash: Math.max(0, rnd(h.value * 0.97 - (m.loans.mortgage || 0))), note: '집값에서 대출·중개비를 뺀 돈이 들어온다. 이후 집값이 올라도 내 몫이 아니다' } });
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

export const choices = {
  'sys.invest.plan'(L, ctx, opt, { plans }) {
    const p = plans.find(x => x.id === opt) || plans[0], inv = L.invest;
    const A = Math.max(0, L.money.assets), moved = Math.abs(sum(p.w) - sum(inv.w));
    L.money.assets = Math.max(0, L.money.assets - rnd(A * moved * 0.01));      // 갈아탈 때 수수료·세금 약 1%
    inv.w = Object.keys(p.w).length ? { ...p.w } : null; inv.since = L.year; inv.plan = p.id;
    if (p.id === 'none') return ctx.apply({ stats: { leisure: 2, happiness: 1 }, issues: { living: -1 } }, { reason: '모으는 대신 쓰기로 했다' });
    ctx.apply({ issues: { living: p.id === 'safe' ? -1 : 0 } }, { reason: '자산 운용 방식을 정했다' });
  },
  'sys.invest.panic'(L, ctx, opt) {
    const inv = L.invest;
    if (opt === 'sell') { inv.w = { deposit: 0.7 }; inv.plan = 'safe'; return ctx.apply({ stats: { happiness: -1 } }, { reason: '손실을 확정하고 안전 자산으로 옮겼다' }); }
    if (opt === 'add') { inv.w = { ...inv.w, stock: Math.min(0.85, (inv.w.stock || 0) + 0.15) }; return ctx.apply({ stats: { happiness: -1 } }, { reason: '하락장에서 주식 비중을 늘렸다' }); }
    ctx.apply({ stats: { happiness: -1, health: -1 } }, { reason: '버티며 불안한 해를 보냈다' });
  },
  'sys.money.crunch'(L, ctx, opt, { plans }) {
    const p = plans.find(x => x.id === opt) || plans[0], fl = L.flags;
    fl.crunchPlan = { year: L.year, opt: p.id };
    if (L.invest) L.invest.w = null;                   // 급한 돈이 필요해 운용 자산을 정리한다
    if (p.id === 'sellhome') {
      ctx.act.move(L.money.assets > homePrice(L) * 0.25 ? 'jeonse' : 'monthly', { reason: '집을 팔아 현금 마련', involuntary: true, silent: true });
      return ctx.apply({ issues: { housing: 5, living: 3 }, stats: { happiness: -2, leisure: -1 } }, { reason: '집을 팔아 빚과 생활비를 정리했다' });
    }
    if (p.id === 'cut') { fl.cutUntil = L.year + 2; return ctx.apply({ issues: { living: 3 }, stats: { leisure: -3, happiness: -2 } }, { reason: '씀씀이를 줄이고 버텼다' }); }
    if (p.id === 'family') { ctx.act.gain(p.aid); return ctx.apply({ stats: { relations: -2, happiness: -1 }, issues: { care: 2 } }, { reason: '가족의 도움을 받았다' }); }
    ctx.act.borrow(p.need, 'credit', { silent: true }); ctx.act.gain(p.need);
    ctx.apply({ issues: { living: 4 }, stats: { happiness: -2 } }, { reason: '신용대출로 급한 불을 껐다' });
  },
};
