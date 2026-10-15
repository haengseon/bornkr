// 병역(GDD §5.2). L.mil = { status:'none'|'serving'|'done'|'exempt', start, end, plan, months }
import { T, yr } from '../tables.js';

export function step(L, ctx) {
  if (L.sex !== 'M') return;
  const m = L.mil, a = L.age;
  if (a === 18 && m.status === 'none' && (L.birth.disability || ctx.chance(yr(T('MIL_EXEMPT'), L.year)))) {
    m.status = 'exempt';
    return ctx.sys('sys.mil.exempt');
  }
  // 입대 시기(이정표 sys.mil.timing): 기본값은 예전 추첨 그대로(학업 중 20세 .6 / 그 외 19세 .5)
  if (m.status === 'none' && a >= 19 && m.plan == null) {
    const study = ['college', 'grad', 'retake'].includes(L.edu.stage);
    const now = ctx.chance(study ? 0.6 : 0.5);
    m.plan = -1;                                   // 묻는 중
    ctx.ask({ eventId: 'sys.mil.timing', options: ['now', 'later'], defaultId: now ? 'now' : 'later', data: { study } });
    return;
  }
  if (m.status === 'none' && m.plan > 0 && a >= m.plan) return enlist(L, ctx);
  if (m.status === 'serving' && L.year >= m.end) {
    m.status = 'done';
    L.job.status = ['college', 'grad'].includes(L.edu.stage) ? 'student' : 'seeking';
    L.job.searchYears = 0;
    ctx.sys('sys.mil.discharge', { months: m.months });
  }
}

function enlist(L, ctx) {
  const m = L.mil;
  {
    const months = Math.round(yr(T('MIL_MONTHS'), L.year));
    const years = Math.floor(months / 12) + (ctx.chance((months % 12) / 12) ? 1 : 0);
    if (L.job.status === 'employed' || L.job.status === 'self') ctx.act.endJob('입대');
    if (L.edu.stage === 'retake') L.edu.stage = 'done';
    Object.assign(m, { status: 'serving', start: L.year, end: L.year + years, months });
    L.job.status = 'military';
    ctx.sys('sys.mil.enlist');
  }
}

export const choices = {
  'sys.mil.timing'(L, ctx, opt, { study }) {
    const m = L.mil;
    m.plan = opt === 'now' ? (study ? 20 : 19) : (study ? 21 : 20);
    if (m.plan <= L.age) enlist(L, ctx);
  },
};
