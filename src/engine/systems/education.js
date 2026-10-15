// 교육(GDD §5.1)
import { eduMult } from '../sigungu.js';
import { T, D, yr, isCapital } from '../tables.js';
import { CAL_COLLEGE, SPECIAL_HS, CLASS_CAL } from '../tuning.js';
import { refreshDebt } from '../act.js';
import { lean, leanOdds, nudge } from '../stats.js';

export const HT_LABEL = { general: '일반고', vocational: '특성화고', autonomous: '자율형 고등학교', special: '특목고' };
export const LEVEL_LABEL = { mid: '중학교', high: '고등학교', '2yr': '전문대학', '4yr': '대학교', grad: '대학원' };
const TB = [0, 3, 6, 8];
const clamp = (x, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, x));

// 학습 기회(가구 배경은 '기회'로만 들어간다, GDD §1-5)
function opp(L) {
  const q = L.birth.quintile, f = L.flags;
  return 3 * (q - 3) + TB[L.edu.tutoring]
    + (isCapital(L.home.region) && L.birth.urban ? 2 : 0) - (L.birth.urban ? 0 : 3)
    - (f.victim && L.year - f.victim <= 2 ? 4 : 0)
    - (f.youngCarer ? 5 : 0)
    - (f.familyMove === L.year ? 3 : 0)
    - (f.tutorLess ? 2 : 0);
}

export function pCollege(L, ctx, boost = 1) {
  const e = L.edu, y = L.year + 1;
  const base = yr(T('COLLEGE_ENTRY_BY_SEX')[L.sex], y) * (T('COLLEGE_BY_HIGH_TYPE')[e.highType] ?? 1);
  const p = clamp(base * (1 + 0.012 * (e.score - 50)) * (1 + CLASS_CAL.college * (L.birth.quintile - 3)) * boost, 0.02, 0.98);
  return p * yr(CAL_COLLEGE, y) * leanOdds(L, 'intellect');   // 공부 쪽 선택의 누적(GDD §13.1)
}

function drawCollege(L, ctx) {
  const e = L.edu, fy = T('FOURYEAR_SHARE');
  const s4 = yr(fy.byYear, L.year) * (e.highType === 'vocational' ? fy.vocational / fy.general : 1);
  const type = ctx.chance(s4) ? '4yr' : '2yr';
  const capital = ctx.chance(T('CAPITAL_COLLEGE_SHARE') * (e.score >= 70 ? 1.5 : e.score < 45 ? 0.6 : 1));
  return { type, capital, major: ctx.weighted(T('MAJOR_SHARE')) };
}

function enterCollege(L, ctx, c) {
  const e = L.edu;
  e.stage = 'college'; e.college = c; e.level = 'high';
  e.left = c.type === '4yr' ? 4 : 2 + (ctx.chance(0.3) ? 1 : 0);
  L.job.status = 'student';
  ctx.sys('sys.edu.college_enter', { collegeLabel: (c.capital ? '수도권 ' : '') + (c.type === '4yr' ? '4년제 대학' : '전문대학') });
  // 수도권 대학이면 서울·경기로 옮겨 기숙사(GDD §5.5 강제 독립)
  if (c.capital && !isCapital(L.home.region)) {
    ctx.act.move('dorm', { region: ctx.chance(0.6) ? 'seoul' : 'gyeonggi', silent: true });
    ctx.sys('sys.home.dorm');
  }
}

function noCollege(L, ctx) {
  L.edu.stage = 'done'; L.edu.level = 'high';
  ctx.sys('sys.edu.no_college');
}

function tutorDraw(L, ctx) {
  const q = L.birth.quintile, e = L.edu, adj = L.flags.tutorAdj || 0;
  if (ctx.chance(Math.min(0.98, T('TUTOR_PART')[q] * yr(T('TUTOR_ERA'), L.year) * eduMult(L)))) {
    const d = D.TUTOR_SPEND_DIST.byQuintile[q];
    e.tutoring = clamp(+ctx.weighted({ 1: d[1], 2: d[2], 3: d[3] }) + adj, 1, 3);
  } else e.tutoring = clamp(adj, 0, 3);
}

// 면허 관문(GDD §10.2): 의약 전공 → med .35 / nurse .45, 교육 전공 → 임용(연 .25 응시를 누적해 .4) [추정]
function grantLicenses(L, ctx) {
  const m = L.edu.college?.major, lic = (L.flags.licenses ||= []);
  if (m === 'med') { const k = ctx.weighted({ med: 0.35, nurse: 0.45, other: 0.2 }); if (k !== 'other') lic.push(k); }
  if (m === 'edu' && ctx.chance(0.4)) lic.push('teach');
}

export function step(L, ctx) {
  const e = L.edu, a = L.age;
  if (a === 2 && L.birth.care === 'daycare') { e.stage = 'daycare'; ctx.sys('sys.edu.daycare'); }
  // 유치원 취원 일반화 이전 세대는 형편이 넉넉한 집만 [추정]
  if (a === 5 && (L.year >= 1990 || L.birth.quintile >= 4)) { e.stage = 'kinder'; ctx.sys('sys.edu.kinder'); }
  if (a === 7) {
    e.stage = 'elem';
    e.score = Math.round(clamp(50 + 0.35 * (L.stats.intellect - 50) + opp(L) + ctx.normal(0, 8)));
    ctx.sys('sys.edu.elem_enter');
  }
  if (a >= 7 && a <= 18 && ['elem', 'middle', 'high'].includes(e.stage)) {
    if (a === 7 || a === 10 || a === 13 || a === 16) tutorDraw(L, ctx);
    const target = 50 + 0.4 * (L.stats.intellect - 50) + 0.15 * (L.traits.consc - 50) + opp(L) + 5 * lean(L, 'intellect');
    e.score = Math.round(clamp(e.score + 0.15 * (target - e.score)));
  }
  if (a === 13 && e.stage === 'elem') {
    e.stage = 'middle';
    ctx.sys('sys.edu.middle_enter');
    ctx.ask({ eventId: 'sys.edu.tutoring', options: ['more', 'keep', 'less'], defaultId: 'keep' });
  }
  if (a === 15 && e.stage === 'middle') askHighType(L, ctx);
  if (a === 16 && e.stage === 'middle') {
    e.stage = 'high'; e.highType ||= 'general';
    ctx.sys('sys.edu.high_enter', { highTypeLabel: HT_LABEL[e.highType] });
  }
  if (e.stage === 'high' && a >= 16 && a <= 18) {
    const p = yr(T('DROPOUT_HIGH'), L.year) * (e.score < 35 ? 2 : 1) * (L.birth.quintile <= 2 ? 1.3 : 1);
    if (ctx.chance(p)) {
      e.stage = 'done'; e.level = 'mid'; e.dropout = true;
      ctx.sys('sys.edu.dropout');
      return;
    }
  }
  if (a === 18 && e.stage === 'high') askPath(L, ctx);
  else if (e.stage === 'retake') retakeYear(L, ctx);
  else if ((e.stage === 'college' || e.stage === 'grad') && L.mil.status !== 'serving') collegeYear(L, ctx);
}

function askHighType(L, ctx) {
  const e = L.edu, sh = yr(T('HIGH_TYPE_SHARE'), L.year + 1);
  const special = (e.score >= SPECIAL_HS.score && L.birth.quintile >= 3) || e.score >= SPECIAL_HS.score + 10;   // QA-S-37: 특목·자사고 4.7%
  const w = {
    general: sh.general + sh.autonomous + (special ? 0 : sh.special),
    voc: sh.vocational * (e.score < 45 ? 1.8 : e.score > 60 ? 0.4 : 1),
    ...(special && { special: sh.special * SPECIAL_HS.w }),
  };
  ctx.ask({ eventId: 'sys.edu.high_type', options: ['general', 'voc', ...(special ? ['special'] : [])], defaultId: ctx.weighted(w) });
}

function askPath(L, ctx) {
  const e = L.edu;
  e.level = 'high';
  ctx.sys('sys.edu.csat', { exam: L.year >= 1993 ? '수능' : '학력고사' });
  const admitted = ctx.chance(pCollege(L, ctx));
  const canRetake = !admitted;                // 떨어지면 누구나 한 해 더 볼 수 있다(QA-S-02: 선택지 1개 금지)
  const pRetake = L.year >= 2024 ? 0.3 : L.year >= 2008 ? 0.2 : 0.15;
  const def = admitted ? 'college' : canRetake && e.score >= 55 && L.birth.quintile >= 3 && ctx.chance(pRetake) ? 'retake' : 'work';
  const data = admitted ? { college: drawCollege(L, ctx) } : {};
  ctx.ask({ eventId: 'sys.edu.path', options: [...(admitted ? ['college'] : []), 'work', ...(canRetake ? ['retake'] : [])], defaultId: def, data });
}

function retakeYear(L, ctx) {
  const e = L.edu;
  if (ctx.chance(pCollege(L, ctx, 1.25))) return enterCollege(L, ctx, drawCollege(L, ctx));
  if (e.retake < 3 && ctx.chance(0.25)) {
    e.retake++;
    ctx.act.spend(1000);
    return ctx.sys('sys.edu.retake');
  }
  noCollege(L, ctx);
}

function collegeYear(L, ctx) {
  const e = L.edu, q = L.birth.quintile;
  if (e.stage === 'college' && ctx.chance(T('STUDENT_LOAN')[q])) {
    const amount = Math.round(yr(T('TUITION')[e.college.type], L.year));
    e.loan += amount;
    L.money.loans.student += amount;
    refreshDebt(L);
    if (!L.flags.loanShown) { L.flags.loanShown = L.year; ctx.sys('sys.edu.loan', { amount }); }
  }
  if (L.sex === 'F' && e.stage === 'college' && !e.leave && e.left === 2 && ctx.chance(T('LEAVE_RATE').F)) {
    e.leave = 1;
    return ctx.sys('sys.edu.leave');
  }
  if (--e.left > 0) return;
  if (e.stage === 'grad') {
    e.level = 'grad'; e.stage = 'done'; e.gradYear = L.year;
    if (['soc', 'hum'].includes(e.college?.major) && ctx.chance(0.5 * 0.3)) (L.flags.licenses ||= []).push('law');   // 법학전문대학원·변시 [추정]
    return ctx.sys('sys.edu.graduate', { levelLabel: LEVEL_LABEL.grad });
  }
  e.level = e.college.type; e.gradYear = L.year;
  ctx.sys('sys.edu.graduate', { levelLabel: LEVEL_LABEL[e.level] });
  grantLicenses(L, ctx);
  if (e.level === '4yr' && ctx.chance(T('GRAD_SCHOOL_RATE') * (e.score >= 70 ? 2 : 1))) {
    e.stage = 'grad'; e.left = 2;
    return ctx.sys('sys.edu.grad_enter');
  }
  e.stage = 'done';
}

export const choices = {
  'sys.edu.tutoring'(L, ctx, opt) {
    const e = L.edu;
    if (opt === 'more') {
      L.flags.tutorAdj = 1; e.tutoring = Math.min(3, e.tutoring + 1);
      ctx.apply({ stats: { leisure: -4 }, issues: { edu: 4 } }, { reason: '학원을 늘렸다' });
      nudge(L, 'intellect', 0.4); nudge(L, 'leisure', -0.2);   // 방향이 남는다(QA: tutoring 효과 미미)
    } else if (opt === 'less') {
      L.flags.tutorAdj = -1; L.flags.tutorLess = true; e.tutoring = Math.max(0, e.tutoring - 1);
      ctx.apply({ stats: { leisure: 4 } }, { reason: '학원을 줄였다' });
      nudge(L, 'intellect', -0.2); nudge(L, 'leisure', 0.4);
    }
  },
  'sys.edu.high_type'(L, ctx, opt) {
    L.edu.highType = opt === 'voc' ? 'vocational' : opt;
  },
  'sys.edu.path'(L, ctx, opt, data) {
    const e = L.edu;
    if (opt === 'college' && data.college) return enterCollege(L, ctx, data.college);
    if (opt === 'retake') {
      e.stage = 'retake'; e.retake++;
      ctx.act.spend(1000);
      return ctx.sys('sys.edu.retake');
    }
    noCollege(L, ctx);
  },
};
