// 비교 카드(GDD §11). 나이별 '각자 무엇을 겪는 중인가' 한 줄. 순위·숫자 비교·사인 없음.
import { COMPARE_AGES } from './constants.js';
import { T, D, yr, REGION } from './tables.js';
import { text, rawText } from './text.js';
import { jobByCode } from './systems/career.js';
import { kidsAt } from './stats.js';

const working = j => j.status === 'employed' || j.status === 'self';
const PLACE = { 1: '회사에서', 3: '사무실에서', 4: '손님을 맞으며', 5: '매장에서', 6: '논밭에서', 7: '작업장에서', 8: '공장에서', 9: '현장에서', A: '부대에서' };
export function workPlace(L) {
  const j = L.job;
  if (j.major === '2') {
    const sub = jobByCode(j.code)?.sub ?? '';
    return /보건|의료/.test(sub) ? '병원에서' : /교육/.test(sub) ? '학교에서' : '전문 분야에서';
  }
  return PLACE[j.major] ?? '일터에서';
}

// 나이별 사실 우선순위(위에서부터 첫 참) + 꼬리
function facts(L, age) {
  const f = L.family, j = L.job, h = L.home, y = L.year, fl = L.flags;
  const recentMove = n => h.moves.some(m => m.year > y - n);
  const dx = L.health.conditions.some(c => c.active && c.key !== 'injury');
  const caringParent = f.caringFor === 'father' || f.caringFor === 'mother';
  switch (age) {
    case 7: return [[
      ['care_young', fl.youngCarer || !!L.birth.disability], ['moved', recentMove(2)],
      ['sibling', (fl.sibAges?.length ?? 0) > 0], ['school_enter', true]]];
    case 19: return [[
      ['retake', L.edu.stage === 'retake'], ['college_capital', L.edu.stage === 'college' && L.edu.college?.capital],
      ['college_region', L.edu.stage === 'college'], ['dropout_work', L.edu.dropout && working(j)],
      ['work', working(j)], ['military', L.mil.status === 'serving']]];
    case 29: return [[
      ['jobseeking', j.status === 'seeking'], ['nonregular', j.status === 'employed' && !j.regular],
      ['regular', j.status === 'employed'], ['self', j.status === 'self']],
    [['married', !!f.partner], ['home_parents', h.parents], ['home_monthly', h.tenure === 'monthly'],
      ['home_jeonse', h.tenure === 'jeonse'], ['home_own', h.owned], ['dating', f.dating], ['single', true]]];
    case 42: return [[
      ['caring_parent', caringParent], ['raising_kids', kidsAt(L, 0, 18) > 0], ['moved', recentMove(3)],
      ['job_change', j.history.some(x => x.from > y - 3) && j.history.length > 1], ['job_loss', j.status === 'seeking'],
      ['self', j.status === 'self'], ['diagnosis', dx]]];
    case 55: return [[
      ['retired_main', !!fl.mainExited], ['still_working', working(j)], ['caring_parent', caringParent],
      ['kids_left', f.children.length > 0 && f.children.every(c => !c.alive || c.leftHome)], ['diagnosis', dx]]];
    case 70: return [[
      ['pension_work', (L.aging.pensionMonthly || L.aging.basic) && working(j)], ['pension', !!(L.aging.pensionMonthly || L.aging.basic)]],
    [['facility', h.tenure === 'facility'], ['with_kids', !!fl.withChild], ['caring', f.caringFor === 'spouse'], ['caring_parent', caringParent],
      ['widowed', f.widowed && !f.partner], ['alone', f.livingAlone], ['at_home', true]]];
  }
  return [[]];
}

export function compareLine(L, age, ctx) {
  const vars = {
    name: L.name, region: REGION[L.home.region]?.label, workPlace: workPlace(L), kids: kidsAt(L, 0, 18),
    years: L.job.mainTenure || L.job.years,
  };
  const [main, tail] = facts(L, age);
  const key = main.find(([, ok]) => ok)?.[0] ?? 'default';
  let line = text([`cmp.${age}.${key}`, `cmp.${age}.default`], vars, ctx);
  const t = tail?.find(([, ok]) => ok)?.[0];
  if (t && rawText(`cmp.${age}.${t}`)) line += ' ' + text(`cmp.${age}.${t}`, vars, ctx);
  return line;
}

// 6단계: 비교 나이면 내 줄을 기록(동료 카드에도 쓰인다)
export function compareStep(L, ctx) {
  if (!COMPARE_AGES.includes(L.age)) return;
  (L.cmp ||= {})[L.age] = compareLine(L, L.age, ctx);
  L.yr.compare = L.age;
  ctx.emit({ kind: 'compare', id: `compare.${L.age}`, text: L.cmp[L.age], quiet: true });
}

const inRange = (s, y) => { const k = Object.keys(s).map(Number); return y >= Math.min(...k) && y <= Math.max(...k); };
const pct = v => Math.round(v * 1000) / 10;

// 코호트 통계 한 줄(GDD §11.2). 표 범위 밖이면 숫자 없는 줄.
export function statLine(L, age) {
  const y = L.birth.year + age;
  let x = null;
  if (age === 7) x = Math.round(yr(T('BIRTHS_BY_YEAR'), L.birth.year) / 1e4);
  if (age === 19 && inRange(T('COLLEGE_ENTRY_RATE'), y)) x = pct(yr(T('COLLEGE_ENTRY_RATE'), y));
  if (age === 29 && y >= 2003 && inRange(T('NONREG_SHARE')[20], y)) x = pct(yr(T('NONREG_SHARE')[20], y));
  if (age === 42 && Math.abs(y - D.TENURE_SHARE_BY_AGE.year) <= 3) x = pct(T('TENURE_SHARE_BY_AGE')[40].own);
  // 55·70세 줄의 표(주된 일자리 퇴직 평균 나이, 65세+ 연금 수령률)는 데이터 요청 중 — 있으면 쓴다
  if (age === 55 && D.MAIN_JOB_EXIT_AGE && inRange(T('MAIN_JOB_EXIT_AGE'), y)) x = Math.round(yr(T('MAIN_JOB_EXIT_AGE'), y) * 10) / 10;
  if (age === 70 && D.PENSION_RECEIPT_65 && inRange(T('PENSION_RECEIPT_65'), y)) x = pct(yr(T('PENSION_RECEIPT_65'), y));
  return x == null ? text('cmp.stat.none', { year: y }) : text(`cmp.stat.${age}`, { year: age === 7 ? L.birth.year : y, x });
}

const regionLabel = k => REGION[k]?.label ?? k;
export const QLABEL = ['형편이 어려운 집', '빠듯한 집', '보통 형편', '여유가 있는 편', '넉넉한 집'];
export const ORDER_L = ['첫째', '둘째', '셋째', '넷째', '다섯째', '여섯째', '일곱째', '여덟째', '아홉째'];
const TENURE_SHORT = { own: '자가', jeonse: '전세', monthly: '월세', public: '공공임대', family: '조부모 집' };
// 출생 화면용 한 줄(숫자·순위 없음): "경기 · 보통 형편 · 전세 · 첫째"
export function birthLine(P) {
  const b = P.birth;
  const ord = b.siblings === 0 ? '외동' : ORDER_L[b.order - 1] ?? '막내';
  return [regionLabel(b.region) + (b.urban ? '' : ' 농촌'), QLABEL[b.quintile - 1], TENURE_SHORT[b.tenure], ord,
    b.parents.dualIncome ? '맞벌이 가정' : null, b.parents.singleParent ? '한부모 가정' : null].filter(Boolean).join(' · ');
}

// 동료 한 명의 그 나이 줄: 살아 있으면 그 나이 줄, 죽은 뒤에는 결산과 같은 사망 줄(QA-E-22: '—'만 남기지 않는다)
export function peerLine(P, age) {
  if (P.deathAge == null || P.deathAge >= age) return { alive: true, line: P.lines[age] ?? '' };
  if (P.horizon) return { alive: true, line: P.lines[P.deathAge] ?? '' };   // 지평선: 관찰 종료는 사망이 아니다
  return { alive: false, line: text(P.deathAge < 5 ? 'cmp.dead.young' : 'cmp.dead', { name: P.name, year: P.deathYear }) };
}

export function snapshot(P) {
  return {
    name: P.name, sex: P.sex, region: P.birth.region, regionLabel: regionLabel(P.birth.region), order: P.birth.minute, birthLine: birthLine(P),
    deathAge: P.death?.age ?? null, deathYear: P.death?.year ?? null, horizon: !!P.death?.horizon, lines: { ...(P.cmp || {}) },
  };
}
