// 가족(GDD §5.6). pre = 1단계 가족 시간 흐름, step = 연애·결혼·출산·이혼·자녀.
import { T, yr, ag, has } from '../tables.js';
import { CAL_MARRY, FAMILY_CAL } from '../tuning.js';
import { qx } from '../death.js';
import { indep, WHO_LABEL, becomeIndependent, homePrice } from '../act.js';
import { assignJob, wageFor, askChildcare } from './career.js';
import { econ, leanOdds } from '../stats.js';
import { sensFields } from '../safety.js';
import { makeGrandparents, ensureKin, familyMembers, changeBond, siblingLabel } from '../kin.js';
import * as R from '../rng.js';
import { inheritShare } from './money.js';

const ORD = ['첫째', '둘째', '셋째', '넷째', '다섯째'];
const SCHOOL = { 7: '초등학교', 13: '중학교', 16: '고등학교' };
const GROUP = { 1: '관리직', 2: '전문직', 3: '사무직', 4: '서비스직', 5: '판매직', 6: '농어민', 7: '기능직', 8: '생산직', 9: '현장 노동자', A: '직업군인' };
const LEVELS = ['mid', 'high', '2yr', '4yr', 'grad'];
const band5 = a => Math.min(a >= 15 ? Math.floor(a / 5) * 5 : 15, 95);

const childLabel = (L, c) => ORD[L.family.children.indexOf(c)] ?? '막내';

export function pre(L, ctx) {
  const f = L.family, y = L.year, a = L.age, fl = L.flags;
  ensureKin(L);
  // 부모
  for (const who of ['father', 'mother']) {
    const p = f.parents[who];
    if (!p.alive) continue;
    p.age++;
    const q = qx(who === 'father' ? 'M' : 'F', p.age, y) * T('MORT_Q')[L.birth.quintile] * (p.care ? 1.5 : 1);
    if (ctx.chance(q)) {
      p.alive = false; p.deathYear = y; p.deathEventId = `parent-death:${who}:${y}`;
      ctx.sys('sys.fam.parent_death', { parentLabel: WHO_LABEL[who], pAge: p.age }, { ...sensFields(L, 'death'), parentId: who, transitionId: p.deathEventId });
      if (f.caringFor === who) ctx.act.endCare('death');   // 사망 문장 뒤에 돌봄 종료(F2-c)
      p.funeralYear = y;
      ctx.sys('sys.fam.parent_funeral', { parentLabel: WHO_LABEL[who] }, { essential: true, parentId: who, causeEventId: p.deathEventId, ...sensFields(L, 'death') });
      const orphan = !f.parents.father.alive && !f.parents.mother.alive;
      const atHome = orphan && a >= 19 && L.home.parents;
      if (atHome) becomeIndependent(L, ctx);          // 부모 집에 살던 성인: 이제 그 집의 가구주(QA-S-32)
      let amount = 0;
      if (orphan && indep(L) && L.household.netWorth > 0) {
        const inh = inheritShare(L.household.netWorth, (f.siblings || 0) + 1, y);   // 상속세·정리 비용 뒤 내 몫 [R17.S7]
        amount = inh.share;
        ctx.act.gain(amount);
        L.tally.inherit = (L.tally.inherit || 0) + amount;
        ctx.sys('sys.money.inheritance', { amount }, { essential: true });   // 큰 목돈: 피드 상한에 묻히면 순자산이 까닭 없이 뛴다
        if (inh.tax > 0) ctx.sys('sys.money.inheritance_tax', { tax: inh.tax });
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
  const newborn = f.siblingMembers.filter(s => s.birthYear === y && !s.announced);
  for (const s of newborn) { s.announced = true; if (!f.parents.mother.alive) { s.alive = false; s.unborn = true; } }
  const arrived = newborn.filter(s => !s.unborn);
  if (arrived.length) {
    fl.siblingBorn = y;
    const vars = { sibling: arrived.length > 1 ? '동생들' : siblingLabel(L, arrived[0]), siblingName: arrived.map(s => s.name).join('·') };
    ctx.sys('sys.fam.sibling_arrived', vars, { essential: true });
    ctx.apply({ stats: { relations: 2, leisure: -2 }, issues: { care: Math.min(6, 2 * arrived.length) } }, { reason: '동생이 태어나 집안의 하루가 달라졌다' });
    if (a >= 4 && !L.pending) ctx.ask({ eventId: 'sys.fam.sibling_welcome', options: ['help', 'play', 'space'], defaultId: 'play', vars, data: { ids: arrived.map(s => s.id) } });
  }
  for (const s of f.siblingMembers) {
    const age = y - s.birthYear;
    if (!s.alive || age < 1) continue;
    const r = R.makeRng(R.hashSeed(L.seed, s.id, y));
    if (R.rand(r) < qx(s.sex, age, y)) {
      s.alive = false; s.deathYear = y;
      ctx.sys('sys.fam.sibling_death', { sibling: siblingLabel(L, s), siblingName: s.name }, { essential: true, ...sensFields(L, 'death') });
    } else if (s.birthYear > L.birth.year && [7, 19].includes(age)) {
      ctx.sys(age === 7 ? 'sys.fam.sibling_school' : 'sys.fam.sibling_adult', { siblingName: s.name });
      changeBond(L, s.id, 2);
    }
  }
  f.siblings = f.siblingMembers.filter(s => s.alive && s.birthYear <= y).length;
  if (a >= 1 && a <= 18 && !L.birth.parents.singleParent && f.parents.father.alive && f.parents.mother.alive && !fl.parentsDivorced && ctx.chance(yr(T('DIVORCE_MARRIED'), y))) {
    fl.parentsDivorced = y;
    L.household.income = Math.round(L.household.income * 0.75);
    ctx.sys('sys.fam.parents_divorce');
  }
  if (f.grandparents > 0 && ctx.chance(a <= 35 ? 0.05 * f.grandparents : Math.max(...(f.gp || []).filter(g => g.alive).map(g => qx(g.sex, L.birth.parents[g.side === 'paternal' ? 'fatherAge' : 'motherAge'] + a + 25, y)), 0))) {
    const gp = (f.gp ||= makeGrandparents(L.seed, f.grandparents));
    const alive = gp.filter(g => g.alive), g = alive[Math.floor(ctx.rand() * alive.length)];   // 개체 하나가 한 번만 죽는다(QA #7)
    g.alive = false; g.deathYear = y;
    f.grandparents = gp.filter(x => x.alive).length;
    ctx.sys('sys.fam.grandparent_death', { gpLabel: g.label }, { quiet: a > 20, grandparent: { id: g.id, side: g.side, label: g.label } });
  }
  // 생존하고 돌봄이 필요한 가족 개체만 대상이 된다. 옛 플래그도 매년 복구한다.
  const careTargets = [
    ...Object.entries(f.parents).filter(([, p]) => p.alive && p.care).map(([id, p]) => ({ id, member: p, label: WHO_LABEL[id] })),
    ...(f.gp || []).filter(g => g.alive && g.care).map(g => ({ id: g.id, member: g, label: g.label })),
  ];
  if (fl.youngCarer && (a > 22 || !careTargets.some(t => t.id === fl.youngCarerTarget))) {
    fl.youngCarer = null; fl.youngCarerTarget = null;
  }
  if (a >= 13 && a <= 18 && !fl.youngCarer && careTargets.length && ctx.chance(0.008)) {
    const target = careTargets[Math.min(careTargets.length - 1, Math.floor(ctx.rand() * careTargets.length))];
    fl.youngCarer = y; fl.youngCarerTarget = target.id; L.tally.youngCarer = 1;
    ctx.sys('sys.fam.young_carer', { place: '학교', who: target.label }, { careTargetId: target.id });
  }
  // 배우자 나이·사망
  const sp = f.partner;
  if (sp) {
    sp.age++;
    spouseWork(L, ctx, sp);
    if (ctx.chance(qx(sp.sex, sp.age, y) * (sp.ltc ? 1.5 : 1))) {
      ctx.act.loseSpouse();
      if (f.caringFor === 'spouse') ctx.act.endCare('death');
    }
  }
  // 자녀
  for (const c of f.children) {
    if (!c.alive) continue;
    const ca = y - c.birthYear;
    if (ctx.chance(qx(c.sex, ca, y))) {
      c.alive = false; c.deathYear = y;
      ctx.sys('sys.fam.child_death', { childLabel: childLabel(L, c) }, sensFields(L, 'death'));
      continue;
    }
    if (SCHOOL[ca]) ctx.sys('sys.fam.child_school', { childLabel: childLabel(L, c), schoolLabel: SCHOOL[ca] }, { quiet: true });
    if (!c.married && ca >= 27 && ca <= 40 && ctx.chance(0.1)) {
      c.married = true; c.marriedYear = y; c.marriageEventId = `child-marriage:${f.children.indexOf(c)}:${y}`;
      if (!c.leftHome) { c.leftHome = true; c.leftHomeYear = y; }
      ctx.sys('sys.fam.child_marry', { childLabel: childLabel(L, c) }, { childId: `child.${f.children.indexOf(c)}`, transitionId: c.marriageEventId });
    } else if (!c.leftHome && ca >= 28 && ca <= 33 && ctx.chance(0.25)) {
      c.leftHome = true; c.leftHomeYear = y;
      ctx.sys('sys.fam.child_leave', { childLabel: childLabel(L, c) }, { childId: `child.${f.children.indexOf(c)}`, transitionId: `child-leave:${f.children.indexOf(c)}:${y}` });
    }
    if (c.married && ca >= 30 && ca <= 40 && ctx.chance(0.08)) {
      c.kids.push(y);
      f.grandchildren = (f.grandchildren || 0) + 1;
      ctx.sys('sys.fam.grandchild');
    }
  }
}

// 배우자 일(QA M1): 해마다 그 나이·시대 고용률을 정상상태로 하는 취업·이직 전이, 어린 자녀가 있으면 아내의 경력단절이 잦다.
// 연금 개시 나이에 은퇴하고 국민연금(가입 10년 이상)·기초연금(본인 수급 가구, 부부 감액 20%)을 받는다.
const empRate = (sex, age, y) => yr(ag(T('EMPLOYMENT_RATE')[sex], Math.min(age, 65)) ?? {}, y) ?? 0.6;
function spouseWork(L, ctx, sp) {
  const y = L.year, era = yr(T('ERA_INCOME_INDEX'), y);
  sp.pensionYears ??= 0;
  if (sp.age >= Math.round(yr(T('PENSION_START_AGE'), y - sp.age))) {
    if (sp.pension == null) {
      const n = sp.pensionYears, pb = T('PENSION_BY_YEARS');
      sp.pension = n >= 10 ? Math.round(12 * pb[n >= 30 ? 30 : n >= 20 ? 20 : 10]) : 0;   // 본인 연금(aging.js)과 같은 표·단위
      if (sp.code) sp.group = '은퇴';
      sp.code = null;
    }
    sp.income = sp.pension + (L.aging?.basic && sp.age >= 65 ? Math.round(L.aging.basic * 12 * 0.8) : 0);
    return;
  }
  const working = sp.income > 0, pEmp = empRate(sp.sex, sp.age, y);
  const babies = L.family.children.some(c => c.alive && y - c.birthYear < 3);
  const out = (sp.regular ? 0.04 : 0.1) * (sp.sex === 'F' && babies ? 3 : 1);
  if (working && ctx.chance(out)) Object.assign(sp, { income: 0, code: null, regular: false, group: '일을 쉬는 사람' });
  else if (!working && ctx.chance(Math.min(0.6, 0.07 * pEmp / Math.max(0.05, 1 - pEmp)) * (sp.sex === 'F' && babies ? 0.3 : 1))) {
    const row = assignJob(L, ctx, { sex: sp.sex, level: sp.edu, age: sp.age, colMajor: null }), regular = ctx.chance(sp.age < 40 ? 0.6 : 0.4);
    Object.assign(sp, { code: row.code, group: GROUP[row.major] ?? '직장인', regular, income: wageFor(L, ctx, row, { regular, firmSize: 'mid', sex: sp.sex, age: sp.age }) });
  } else if (working) sp.income = Math.round(sp.income * era / yr(T('ERA_INCOME_INDEX'), y - 1) * 1.01);
  if (sp.income > 0 && y >= 1988) sp.pensionYears += yr(T('PENSION_CONTRIB_P')[sp.regular ? 'regular' : 'nonregular'], y);
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
  const pEmp = empRate(sex, age, L.year);
  const row = assignJob(L, ctx, { sex, level, age, colMajor: null });
  const working = ctx.chance(pEmp);
  const regular = working && ctx.chance(0.6);
  return {
    age, sex, edu: level, code: working ? row.code : null, group: working ? GROUP[row.major] ?? '직장인' : '일을 쉬는 사람',
    income: working ? wageFor(L, ctx, row, { regular, firmSize: 'mid', sex, age }) : 0, regular, alive: true, ltc: false,
    pensionYears: Math.max(0, L.year - Math.max(1988, L.year - age + 25)) * pEmp * 0.6,   // 결혼 전 가입 이력 근사
  };
}

const married = L => L.family.married && L.family.partner;
function birth(L, ctx) {
  ctx.act.haveChild();
  if (L.family.children.length === 1) askChildcare(L, ctx);
}

export function step(L, ctx) {
  const f = L.family, a = L.age, y = L.year, fl = L.flags;
  ensureKin(L);
  // 과거 숫자 플래그를 복구하고 계획을 현재 배우자와 연결한다.
  if (fl.childPlanned && !fl.childPlan) fl.childPlan = { plannedYear: fl.childPlanned, partnerNo: f.partner?.no ?? null, status: 'planned' };
  const plan = fl.childPlan;
  if (plan?.status === 'planned') {
    if (!married(L) || plan.plannedYear < y || plan.partnerNo !== (f.partner?.no ?? null) || fl.noChild) {
      plan.status = 'cancelled'; plan.endedYear = y; fl.childPlanned = null;
    } else if (plan.plannedYear === y) {
      plan.status = 'completed'; plan.endedYear = y; fl.childPlanned = null; birth(L, ctx);
    }
  }
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
    } else if (fl.marryLater >= y || (typeof fl.single === 'number' && y - fl.single < 10)) {
      // 보류는 3년, 혼자 살기는 10년 동안 다시 묻지 않는다(F-8)
    } else if (fl.laterPartner) {                // 미뤘던 상대: 관계가 이어졌으면 같은 사람과 다시 결혼 이야기가 나온다(B-02)
      const { partner: p, year } = fl.laterPartner;
      fl.laterPartner = null;
      if (ctx.chance(FAMILY_CAL.laterKeep)) {
        p.age += y - year;
        ctx.ask({ eventId: 'sys.fam.marry', options: ['marry', 'later', 'single'], defaultId: 'marry', data: { partner: p }, vars: { partnerAge: p.age, partnerJobGroup: p.group } });
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
      h *= ag(FAMILY_CAL.age[s], a);                   // 초혼 연령 분포 모양(F4-b: 시대별 평균 초혼 연령)
      h *= yr(CAL_MARRY[s], L.birth.year) * Math.exp(FAMILY_CAL.trait * (L.traits.extra - 50) / 15);   // 타고난 성향에 따른 결혼 위험 이질성(QA-S-07)
      if (ctx.chance(Math.min(0.9, h))) {
        const p = makePartner(L, ctx);
        ctx.ask({ eventId: 'sys.fam.marry', options: ['marry', 'later', 'single'], defaultId: 'marry', data: { partner: p }, vars: { partnerAge: p.age, partnerJobGroup: p.group } });
      }
    }
  }
  // 출산(유배우, 여성 나이 기준)
  if (married(L) && !fl.childPlanned && !fl.noChild && !(fl.childWait >= y)) {
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
        ctx.ask({ eventId: 'sys.fam.child', options: ['have', 'wait', 'none'], defaultId: 'have' });
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
  if (a >= 10 && a % 5 === 0 && !L.pending && !L.yr.asked && fl.familyTime !== y) {
    const members = familyMembers(L).filter(x => x.member.alive !== false && x.age >= 4);
    if (members.length) {
      const i = R.int(R.makeRng(R.hashSeed(L.seed, 'family-time', y)), 0, members.length - 1), m = members[i];
      fl.familyTime = y;
      ctx.ask({ eventId: 'sys.fam.relationship', options: ['time', 'talk', 'later'], defaultId: 'talk', vars: { relative: m.label, relativeName: m.member.name || m.label }, data: { id: m.id } });
    }
  }
}

export const choices = {
  'sys.fam.sibling_welcome'(L, ctx, opt, { id, ids = [id] }) {
    for (const key of ids) changeBond(L, key, opt === 'help' ? 10 : opt === 'play' ? 6 : -6);
    ctx.apply({ stats: { relations: opt === 'space' ? -1 : 2, leisure: opt === 'help' ? -3 : opt === 'space' ? 1 : -1 } }, { reason: opt === 'space' ? '동생과 거리를 두었다' : '동생과 보내는 시간이 늘었다' });
  },
  'sys.fam.relationship'(L, ctx, opt, { id }) {
    changeBond(L, id, opt === 'time' ? 10 : opt === 'talk' ? 5 : -6);
    ctx.apply({ stats: { relations: opt === 'later' ? -2 : 2, happiness: opt === 'time' ? 2 : 0, leisure: opt === 'time' ? -3 : opt === 'talk' ? -1 : 1 } }, { reason: opt === 'later' ? '가족과의 약속을 미뤘다' : '가족과 시간을 나눴다' });
  },
  'sys.fam.marry'(L, ctx, opt, { partner }) {
    if (opt === 'marry') return ctx.act.marry(partner);
    if (opt === 'later') { L.flags.marryLater = L.year + 2; L.flags.laterPartner = { partner, year: L.year }; }   // 3년째 되는 해에 다시
    else L.flags.single = L.year;
  },
  'sys.fam.child'(L, ctx, opt) {
    const fl = L.flags;
    if (fl.childPlan?.status === 'planned') { fl.childPlan.status = 'cancelled'; fl.childPlan.endedYear = L.year; }
    fl.childPlanned = null;
    fl.noChild = opt === 'none'; fl.childWait = opt === 'wait' ? L.year + 2 : null;
    fl.childIntent = opt === 'have' ? 'plan' : opt === 'wait' ? 'wait' : 'none';
    if (opt === 'have' && married(L)) {
      fl.childPlanned = L.year + 1;
      fl.childPlan = { plannedYear: fl.childPlanned, partnerNo: L.family.partner.no ?? null, status: 'planned', decidedYear: L.year };
    }
  },
  'sys.fam.divorce'(L, ctx, opt) {
    if (opt === 'divorce') return ctx.act.divorce();
    if (opt === 'counsel') {
      if (L.family.partner) L.family.partner.bond = Math.min(100, (L.family.partner.bond ?? 65) + 10);
      L.flags.counselUntil = L.year + 3;
      ctx.act.spend(200);
      return ctx.apply({ stats: { happiness: 2 } }, { reason: '부부 상담을 받았다' });
    }
    if (L.family.partner) L.family.partner.bond = Math.max(0, (L.family.partner.bond ?? 65) - 10);
    ctx.apply({ stats: { happiness: -4 } }, { reason: '삐걱거리는 결혼 생활을 이어 갔다' });
  },
  'sys.fam.parent_care'(L, ctx, opt, { who }) {
    if (!L.family.parents[who]?.alive) return;
    changeBond(L, who, opt === 'home' ? 8 : 4);
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
