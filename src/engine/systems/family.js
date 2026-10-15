// 가족(GDD §5.6). pre = 1단계 가족 시간 흐름, step = 연애·결혼·출산·이혼·자녀.
import { T, yr, ag, has } from '../tables.js';
import { CAL_MARRY, FAMILY_CAL } from '../tuning.js';
import { qx } from '../death.js';
import { indep, WHO_LABEL, becomeIndependent, homePrice } from '../act.js';
import { assignJob, wageFor, askChildcare } from './career.js';
import { econ, leanOdds } from '../stats.js';
import { sensFields } from '../safety.js';
import { makeGrandparents } from '../kin.js';

const ORD = ['첫째', '둘째', '셋째', '넷째', '다섯째'];
const SCHOOL = { 7: '초등학교', 13: '중학교', 16: '고등학교' };
const GROUP = { 1: '관리직', 2: '전문직', 3: '사무직', 4: '서비스직', 5: '판매직', 6: '농어민', 7: '기능직', 8: '생산직', 9: '현장 노동자', A: '직업군인' };
const LEVELS = ['mid', 'high', '2yr', '4yr', 'grad'];
const band5 = a => Math.min(a >= 15 ? Math.floor(a / 5) * 5 : 15, 95);

const childLabel = (L, c) => ORD[L.family.children.indexOf(c)] ?? '막내';

export function pre(L, ctx) {
  const f = L.family, y = L.year, a = L.age, fl = L.flags;
  // 부모
  for (const who of ['father', 'mother']) {
    const p = f.parents[who];
    if (!p.alive) continue;
    p.age++;
    const q = qx(who === 'father' ? 'M' : 'F', p.age, y) * T('MORT_Q')[L.birth.quintile] * (p.care ? 1.5 : 1);
    if (ctx.chance(q)) {
      p.alive = false; p.deathYear = y;
      if (f.caringFor === who) ctx.act.endCare('death');
      ctx.sys('sys.fam.parent_death', { parentLabel: WHO_LABEL[who], pAge: p.age }, sensFields(L, 'death'));
      const orphan = !f.parents.father.alive && !f.parents.mother.alive;
      const atHome = orphan && a >= 19 && L.home.parents;
      if (atHome) becomeIndependent(L, ctx);          // 부모 집에 살던 성인: 이제 그 집의 가구주(QA-S-32)
      let amount = 0;
      if (orphan && indep(L) && L.household.netWorth > 0) {
        amount = Math.round(L.household.netWorth * 0.8 / ((f.siblings || 0) + 1));
        ctx.act.gain(amount);
        ctx.sys('sys.money.inheritance', { amount });
      }
      if (atHome) {
        const h = L.home;
        h.parents = false;
        if (h.tenure === 'own' && amount > 0) {        // 살던 집을 상속분 안에서 물려받는다
          const v = Math.min(amount, Math.round(homePrice(L) * 0.7));
          L.money.assets -= v;
          Object.assign(h, { owned: true, value: v, valueMark: v, boughtYear: L.year, deposit: 0, rent: 0, contractEnd: null });
        } else ctx.act.move(h.tenure === 'jeonse' ? 'jeonse' : 'monthly', { reason: '부모님 집 정리', silent: true });
      }
    } else if (!p.care && p.age >= 65 && ctx.chance(ag(T('LTC_INC'), p.age))) {
      p.care = true;
      if (a >= 19 && !f.caringFor) {
        const defaultId = y < 2008 ? 'home' : L.stats.wealth >= 40 ? 'facility' : f.siblings > 0 ? 'share' : 'home';
        ctx.ask({ eventId: 'sys.fam.parent_care', options: ['home', 'facility', ...(f.siblings > 0 ? ['share'] : [])], defaultId, data: { who }, vars: { parentLabel: WHO_LABEL[who], who: WHO_LABEL[who] }, careTarget: WHO_LABEL[who] });
      }
    }
  }
  // 아동기: 동생, 부모 이혼, 조부모, 가족돌봄
  if (fl.sibAges?.includes(a)) { fl.siblingBorn = y; ctx.sys('sys.fam.sibling_born'); }
  if (a >= 1 && a <= 18 && !L.birth.parents.singleParent && !fl.parentsDivorced && ctx.chance(yr(T('DIVORCE_MARRIED'), y))) {
    fl.parentsDivorced = y;
    L.household.income = Math.round(L.household.income * 0.75);
    ctx.sys('sys.fam.parents_divorce');
  }
  if (f.grandparents > 0 && a <= 35 && ctx.chance(0.05 * f.grandparents)) {
    const gp = (f.gp ||= makeGrandparents(L.seed, f.grandparents));
    const alive = gp.filter(g => g.alive), g = alive[Math.floor(ctx.rand() * alive.length)];   // 개체 하나가 한 번만 죽는다(QA #7)
    g.alive = false; g.deathYear = y;
    f.grandparents = gp.filter(x => x.alive).length;
    ctx.sys('sys.fam.grandparent_death', { gpLabel: g.label }, { quiet: a > 20, grandparent: { id: g.id, side: g.side, label: g.label } });
  }
  if (a >= 13 && a <= 18 && !fl.youngCarer && ctx.chance(0.008)) {
    fl.youngCarer = y; L.tally.youngCarer = 1;
    ctx.sys('sys.fam.young_carer', { place: '학교', who: ctx.chance(0.5) ? '할머니' : '아픈 엄마' });
  }
  if (fl.youngCarer && a > 22) fl.youngCarer = null;
  // 배우자 나이·사망
  const sp = f.partner;
  if (sp) {
    sp.age++;
    if (sp.income && sp.age >= 65) sp.income = 0;
    else if (sp.income) sp.income = Math.round(sp.income * 1.01);
    if (ctx.chance(qx(sp.sex, sp.age, y) * (sp.ltc ? 1.5 : 1))) {
      if (f.caringFor === 'spouse') ctx.act.endCare('death');
      ctx.act.loseSpouse();
    }
  }
  // 자녀
  for (const c of f.children) {
    if (!c.alive) continue;
    const ca = y - c.birthYear;
    if (ctx.chance(qx(c.sex, ca, y))) {
      c.alive = false;
      ctx.sys('sys.fam.child_death', { childLabel: childLabel(L, c) }, sensFields(L, 'death'));
      continue;
    }
    if (SCHOOL[ca]) ctx.sys('sys.fam.child_school', { childLabel: childLabel(L, c), schoolLabel: SCHOOL[ca] }, { quiet: true });
    if (!c.married && ca >= 27 && ca <= 40 && ctx.chance(0.1)) {
      c.married = true; c.leftHome = true;
      ctx.sys('sys.fam.child_marry', { childLabel: childLabel(L, c) });
    } else if (!c.leftHome && ca >= 28 && ca <= 33 && ctx.chance(0.25)) {
      c.leftHome = true;
      ctx.sys('sys.fam.child_leave', { childLabel: childLabel(L, c) });
    }
    if (c.married && ca >= 30 && ca <= 40 && ctx.chance(0.08)) {
      c.kids.push(y);
      f.grandchildren = (f.grandchildren || 0) + 1;
      ctx.sys('sys.fam.grandchild');
    }
  }
}

function makePartner(L, ctx) {
  const sex = L.sex === 'M' ? 'F' : 'M';
  const gap = ctx.weighted(T('SPOUSE_AGE_GAP'));
  // 키 예: m1_2(남 연상 1~2세), m3_5, m6, same, f1_2(여 연상), f3
  const n = gap === 'same' ? 0 : (k => { const [lo, hi] = (k.match(/\d+/g) || ['1']).map(Number); return ctx.int(lo, hi ?? lo + 2); })(gap);
  const maleOlder = gap.startsWith('m') ? n : gap.startsWith('f') ? -n : 0;
  const age = Math.max(18, L.age + (L.sex === 'M' ? -maleOlder : maleOlder));
  const mine = Math.max(0, LEVELS.indexOf(L.edu.level));
  const level = ctx.chance(0.6) ? LEVELS[mine] : LEVELS[Math.max(0, Math.min(4, mine + (ctx.chance(0.5) ? 1 : -1)))];
  const empl = T('EMPLOYMENT_RATE')[sex];
  const pEmp = yr(ag(empl, Math.min(age, 65)) ?? {}, L.year) ?? 0.6;
  const row = assignJob(L, ctx, { sex, level, age, colMajor: null });
  const working = ctx.chance(pEmp);
  const regular = working && ctx.chance(0.6);
  return {
    age, sex, edu: level, code: working ? row.code : null, group: working ? GROUP[row.major] ?? '직장인' : '일을 쉬는 사람',
    income: working ? wageFor(L, ctx, row, { regular, firmSize: 'mid', sex, age }) : 0, regular, alive: true, ltc: false,
  };
}

const married = L => L.family.married && L.family.partner;
function birth(L, ctx) {
  ctx.act.haveChild();
  if (L.family.children.length === 1) askChildcare(L, ctx);
}

export function step(L, ctx) {
  const f = L.family, a = L.age, y = L.year, fl = L.flags;
  // 계획한 출산
  if (fl.childPlanned === y && married(L)) { fl.childPlanned = null; birth(L, ctx); }
  // 연애
  if (!f.partner && a >= 19 && a <= 50) {
    if (!f.dating && ctx.chance(0.12)) { f.dating = true; ctx.sys('sys.fam.dating', {}, { quiet: true }); }
    else if (f.dating && ctx.chance(0.25)) { f.dating = false; ctx.sys('sys.fam.breakup', {}, { quiet: true }); }
  }
  // 결혼·재혼
  if (!f.partner && a >= 18 && L.mil.status !== 'serving') {
    if (f.divorced || f.widowed) {
      if (ctx.chance(a < 60 ? 0.03 : a < 70 ? 0.01 : 0.002)) {   // QA-S-11: 70세+ 재혼 드묾
        ctx.act.marry(makePartner(L, ctx), { silent: true });       // 상태를 먼저 바꿔 사건 impact가 변화를 잡게 한다
        ctx.sys('sys.fam.remarry', {}, { spouse: { no: f.partner.no, name: f.partner.name, since: f.partner.since } });
      }
    } else {
      const s = L.sex, b = band5(a);
      const mr = T('MARRIAGE_RATE')[s][b], nmT = T('NEVER_MARRIED')[s][b];
      // 미혼 비율 표는 2005~: 1990 이전 = 2005 × .6, 1990~2005 선형(GDD §5.6)
      const f0 = b < 25 ? FAMILY_CAL.nm20 : 0.6;   // 20대 초반 미혼율은 1990년에도 높았다(QA-S-07: 1990 초혼 연령)
      const nmF = y <= 1990 ? f0 : y >= 2005 ? 1 : f0 + (1 - f0) * (y - 1990) / 15;
      const rate = mr ? yr(mr, y) : 0, nm = nmT ? Math.min(1, yr(nmT, y) * nmF) : 1;
      const j = L.job, e = econ(L);
      let h = rate / Math.max(0.02, nm);
      h *= j.status === 'employed' && j.regular ? 1.3 : j.status === 'seeking' || j.status === 'none' || j.status === 'inactive' ? 0.6 : 1;
      if (s === 'M') h *= e.INCpos >= 60 ? 1.2 : e.INCpos < 20 ? 0.6 : 1;
      if (L.home.owned) h *= 1.15;
      h *= L.stats.relations >= 65 ? 1.2 : L.stats.relations < 35 ? 0.7 : 1;
      if (L.edu.stage === 'college' || L.edu.stage === 'grad') h *= 0.4;
      h *= leanOdds(L, 'relations');   // 관계 쪽 선택의 누적(GDD §13.1)
      if (fl.single) h *= FAMILY_CAL.single;
      if (fl.loveBoost >= y) h *= 1.4;                 // 이정표 '고백한다'의 파급
      if (fl.loveFocus >= y) h *= 0.7;
      if (fl.marryLater >= y) h *= 0.5;
      h *= yr(CAL_MARRY[s], L.birth.year) * Math.exp(FAMILY_CAL.trait * (L.traits.extra - 50) / 15);   // 타고난 성향에 따른 결혼 위험 이질성(QA-S-07)
      if (ctx.chance(Math.min(0.9, h))) {
        const p = makePartner(L, ctx);
        ctx.ask({ eventId: 'sys.fam.marry', options: ['marry', 'later', 'single'], defaultId: 'marry', data: { partner: p }, vars: { partnerAge: p.age, partnerJobGroup: p.group } });
      }
    }
  }
  // 출산(유배우, 여성 나이 기준)
  if (married(L) && !fl.childPlanned) {
    const wAge = L.sex === 'F' ? a : f.partner.age;
    if (wAge >= 15 && wAge <= 49) {
      const n = f.children.length;
      // 첫째는 40세 전까지 25~29세 율을 쓴다: 유배우 연령별 출산율은 이미 자녀가 있는 30대가 많아 무자녀 부부의 첫째 위험보다 낮다(QA-S-07)
      let h = yr(ag(T('MARITAL_FERTILITY'), n === 0 && wAge < 40 ? Math.min(wAge, 25) : wAge), y);
      // 표는 2000~: 그 전은 합계출산율 비로 키운다(GDD §5.6 과거 연도 규칙 단순화)
      if (y < 2000) h *= Math.max(1, yr(T('TFR_BY_YEAR'), y) / yr(T('TFR_BY_YEAR'), 2000));
      h *= FAMILY_CAL.parity[Math.min(2, n)];   // QA-S-07: 1970년생 여성 자녀 1.71·무자녀 12.3%
      if (fl.noChild) h *= FAMILY_CAL.noChild;
      if (fl.childWait >= y) h *= 0.5;
      if (fl.infertile) h *= 0.3;
      if (ctx.chance(h)) {
        if (n < 2) ctx.ask({ eventId: 'sys.fam.child', options: ['have', 'wait', 'none'], defaultId: 'have' });
        else birth(L, ctx);
      }
    }
  }
  // 이혼
  if (married(L)) {
    const dur = y - f.marriedYear, e = econ(L);
    let h = yr(T('DIVORCE_MARRIED'), y) * ag(T('DUR_SHAPE'), dur);
    if (e.dsr > 0.4) h *= 1.3;
    if (L.stats.wealth < 30) h *= 1.2;
    if (fl.counselUntil >= y) h *= 0.6;
    h *= leanOdds(L, 'relations', -1);
    if (ctx.chance(h)) ctx.ask({ eventId: 'sys.fam.divorce', options: ['divorce', 'counsel', 'stay'], defaultId: 'divorce' });
  }
  // 혼자 사는가
  const alone = !f.partner && !L.home.parents && L.home.tenure !== 'dorm' && L.home.tenure !== 'facility'
    && !f.children.some(c => c.alive && !c.leftHome) && a >= 19;
  if (alone && !f.livingAlone && a >= 30) ctx.sys('sys.fam.living_alone');
  f.livingAlone = alone;
  if (alone) L.tally.aloneYears = (L.tally.aloneYears || 0) + 1;
  // 돌봄·양육 연수(결산 careBurden)
  if (f.caringFor) L.tally.careYears = (L.tally.careYears || 0) + 1;
}

export const choices = {
  'sys.fam.marry'(L, ctx, opt, { partner }) {
    if (opt === 'marry') return ctx.act.marry(partner);
    if (opt === 'later') L.flags.marryLater = L.year + 2;
    else L.flags.single = true;
  },
  'sys.fam.child'(L, ctx, opt) {
    if (opt === 'have') L.flags.childPlanned = L.year + 1;
    else if (opt === 'wait') L.flags.childWait = L.year + 2;
    else L.flags.noChild = true;
  },
  'sys.fam.divorce'(L, ctx, opt) {
    if (opt === 'divorce') return ctx.act.divorce();
    if (opt === 'counsel') {
      L.flags.counselUntil = L.year + 3;
      ctx.act.spend(200);
      return ctx.apply({ stats: { happiness: 2 } }, { reason: '부부 상담을 받았다' });
    }
    ctx.apply({ stats: { happiness: -4 } }, { reason: '삐걱거리는 결혼 생활을 이어 갔다' });
  },
  'sys.fam.parent_care'(L, ctx, opt, { who }) {
    if (!L.family.parents[who]?.alive) return;
    ctx.act.startCare(who);
    const eraI = yr(T('ERA_INCOME_INDEX'), L.year);
    if (opt === 'home') return ctx.apply({ issues: { care: 12 } }, { reason: `${WHO_LABEL[who]}를 직접 모셨다` });
    if (opt === 'facility') {
      L.flags.careCost = Math.round((1500 + 900 * ctx.rand()) * eraI);
      L.flags.careShare = true;
      return ctx.apply({ issues: { care: 5 } }, { reason: '요양시설 비용' });
    }
    L.flags.careShare = true;
    L.flags.careCost = Math.round(900 * eraI);
    ctx.apply({ issues: { care: 6 } }, { reason: '형제와 돌봄을 나눴다' });
  },
};
