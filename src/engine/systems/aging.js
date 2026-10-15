// 노년(GDD §5.8). aging = { pensionStart, pensionMonthly, basic, ltc:0..5, isolated }
import { T, yr, ag } from '../tables.js';
import { econ } from '../stats.js';
import { sensFields } from '../safety.js';
import { AGING_CAL } from '../tuning.js';

// 키가 '10'·'lt10'·'10_20' 등이어도 숫자 시작값으로 계단 조회
function bandVal(tab, x) {
  let best = null, bk = -Infinity;
  for (const [k, v] of Object.entries(tab)) {
    const n = /^(lt|<|under)/i.test(k) ? 0 : +(String(k).match(/\d+/)?.[0] ?? 0);
    if (n <= x && n >= bk) { bk = n; best = v; }
  }
  return best;
}

export function step(L, ctx) {
  const g = L.aging, a = L.age, y = L.year, fl = L.flags, m = L.money;
  // 국민연금 개시
  if (g.pensionStart == null && a === Math.round(bandVal(T('PENSION_START_AGE'), L.birth.year))) {
    g.pensionStart = y;
    const yrs = m.pensionYears || 0;
    if (yrs < 10) ctx.sys('sys.age.no_pension');   // 최소 가입기간 10년 미만은 반환일시금(노령연금 없음, QA-S-08)
    else {
      const life = L.tally.incPosN ? L.tally.incPos / L.tally.incPosN : 50;
      const pub = L.job.history.filter(h => h.public).reduce((s, h) => s + ((h.to ?? y) - h.from), 0) >= 20;
      g.pensionMonthly = Math.round(bandVal(T('PENSION_BY_YEARS'), yrs) * (0.7 + 0.6 * life / 100) * (pub ? 2 : 1));
      ctx.sys('sys.age.pension_start', { amount: g.pensionMonthly });
    }
  }
  // 기초연금
  if (a >= 65 && y >= 2008 && !g.basic) {
    const e = econ(L);
    if (AGING_CAL.basicW * e.NWpos + (1 - AGING_CAL.basicW) * e.INCpos < AGING_CAL.basicCut) {   // 소득인정액 하위 70% 근사(자산 비중 큼, QA-S-08)
      g.basic = Math.round(yr(T('BASIC_PENSION'), y) * (y <= 2013 ? 0.5 : 1) * 10) / 10;
      ctx.sys('sys.age.basic_pension', { amount: g.basic });
    }
  }
  // 장기요양
  if (a >= 65 && !g.ltc) {
    const dem = L.health.conditions.some(c => c.key === 'dementia' && c.active);
    if (ctx.chance(ag(T('LTC_INC'), a) * AGING_CAL.ltcInc * (L.stats.health < 40 ? AGING_CAL.ltcSick : 1) * (dem ? AGING_CAL.ltcDem : 1))) {
      g.ltc = +ctx.weighted({ 1: 0.05, 2: 0.1, 3: 0.3, 4: 0.4, 5: 0.15 });
      ctx.sys('sys.age.ltc', { grade: g.ltc }, sensFields(L, 'illness'));
      const kids = L.family.children.some(c => c.alive);
      return ctx.ask({ eventId: 'sys.age.residence', options: ['home', 'facility', ...(kids ? ['child'] : [])], defaultId: L.family.partner ? 'home' : 'facility' });
    }
  }
  // 배우자 장기요양 → 돌봄
  const sp = L.family.partner;
  if (sp && sp.age >= 65 && !sp.ltc && ctx.chance(ag(T('LTC_INC'), sp.age))) {
    sp.ltc = true;
    if (!L.family.caringFor) { ctx.act.startCare('spouse'); ctx.sys('sys.age.spouse_care'); }
  }
  // 고립: 5년마다 다시 추첨(해마다 뒤집히지 않게)
  if (a >= 65 && (a - 65) % 5 === 0) {
    const md = T('LONELY_MOD');
    let p = ag(T('LONELY'), a);
    if (L.family.widowed && !sp) p *= md.widowed;
    else if (L.family.divorced && !sp) p *= md.divorced;
    if (m.income < 1200) p *= md.income_lt_1m;
    const was = g.isolated;
    g.isolated = ctx.chance(Math.min(0.95, p * 0.5));
    if (g.isolated && !was) ctx.sys('sys.age.isolated');
  }
  // 노인일자리
  const working = L.job.status === 'employed' || L.job.status === 'self';
  if (a >= 65 && !working && y >= 2004 && L.stats.wealth < 40 && ctx.chance(fl.seniorJob === y - 1 ? 0.7 : 0.15)) {
    if (fl.seniorJob !== y - 1) ctx.sys('sys.age.senior_job');
    fl.seniorJob = y;
  }
  // 손주 돌봄(생애 1회)
  if (a >= 55 && a <= 75 && !fl.grandcareAsked && L.family.children.some(c => c.kids?.some(k => y - k < 6))) {
    fl.grandcareAsked = y;
    return ctx.ask({ eventId: 'sys.age.grandcare', options: ['yes', 'some', 'no'], defaultId: 'some' });
  }
  if (fl.grandcareUntil != null && y > fl.grandcareUntil) { fl.grandcare = 0; fl.grandcareUntil = null; }
  if (fl.grandcare) L.tally.grandcareYears = (L.tally.grandcareYears || 0) + 1;
  if (a >= 70 && y >= 2015 && !fl.digital && ctx.chance(0.1)) { fl.digital = y; ctx.sys('sys.age.digital'); }
}

export const choices = {
  'sys.age.grandcare'(L, ctx, opt) {
    if (opt === 'no') return ctx.apply({ stats: { relations: -2 } }, { reason: '손주 돌봄을 거절했다' });
    const full = opt === 'yes';
    L.flags.grandcare = full ? 10 : 5;
    L.flags.grandcareUntil = L.year + 3;
    ctx.apply({ stats: { relations: full ? 5 : 3, health: full ? -2 : -1 }, issues: { care: full ? 8 : 4 } }, { reason: '손주를 봐 주었다' });
  },
  'sys.age.residence'(L, ctx, opt) {
    if (opt === 'facility') {
      L.health.care = 'facility';
      ctx.act.move('facility', { reason: '요양', silent: true });
      ctx.sys('sys.home.facility');
      return ctx.apply({ stats: { relations: -3 } }, { reason: '요양시설로 옮겼다' });
    }
    L.health.care = 'home';
    if (opt === 'child') { L.flags.withChild = L.year; ctx.apply({ stats: { relations: 2 } }, { reason: '자녀 집으로 옮겼다' }); }
  },
};
