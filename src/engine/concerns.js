// 생애 단계×시대별 고민(R11). 순수 함수: 현재 L 상태에서 결정적으로 계산, 부작용 없음.
// reason은 인물의 상태 사실만(통계 수치는 basis로 분리). 성인 이후 다수 항목은 L.issues와 signals 재사용.
import { CONCERN_STAGES, CONCERN_ITEMS, BULLY_RATE, STRESS_RATE } from '../data/concerns.js';
import { ISSUE_KEYS } from './constants.js';
import { signals, plainText } from './issues.js';
import { kidsAt } from './stats.js';

const clamp = x => Math.max(0, Math.min(100, Math.round(x)));
const within = (y, L, n) => y != null && L.year - y <= n;

// 성분 누적기: base + Σ add. reason = 양수 성분 상위 2개 텍스트(없으면 fallback)
const mk = base => {
  const parts = [];
  return {
    add(v, text) { if (v > 0 && text) parts.push([v, text]); else if (v < 0) parts.push([v, null]); return this; },
    done(fallback) {
      const value = clamp(base + parts.reduce((a, p) => a + p[0], 0));
      const top = parts.filter(p => p[1]).sort((a, b) => b[0] - a[0]).slice(0, 2).map(p => p[1]);
      return { value, reason: top.length ? top.join(', ') : fallback };
    },
  };
};

const nearest = (tbl, y) => { const ks = Object.keys(tbl).map(Number).sort((a, b) => a - b); const k = [...ks].reverse().find(x => x <= y) ?? ks[0]; return tbl[k]; };
const bully = (y, i) => (y < 2018 ? BULLY_RATE[2018] : nearest(BULLY_RATE, y))[i];
const moves = (L, n) => L.home.moves.filter(m => m.year > L.year - n).length;
const qLabel = q => (q <= 1 ? '형편이 어려운 살림' : q === 2 ? '빠듯한 살림' : null);

// 이슈 축 재사용: 값=L.issues, reason=양수 성분 상위 2개(인물 화면용 plain 문장)
function viaIssue(L, ctx, k, fallback) {
  const sig = (ctx.sig ||= signals(L));
  const top = sig[k].filter(c => c.text !== '기본' && c.v > 0).sort((a, b) => b.v - a.v).slice(0, 2).map(plainText);
  return { value: clamp(L.issues[k]), reason: top.length ? top.join(', ') : fallback };
}
const iss = (k, fb) => (L, ctx) => viaIssue(L, ctx, k, fb);

const CALC = {
  infant: {
    apart(L) {
      const p = L.birth.parents, c = L.birth.care, m = mk(15);
      m.add(p.dualIncome ? 25 : 0, '맞벌이 가구').add(p.singleParent ? 20 : 0, '한 부모 가구')
        .add(c === 'daycare' ? 15 : 0, L.year >= 1991 ? '낮 시간 어린이집' : '낮 시간 탁아 시설').add(c === 'grandparent' ? 8 : 0, '낮에는 조부모 돌봄')
        .add(L.birth.siblings > 0 ? -4 : 0);
      return m.done('부모가 낮에 곁에 있음');
    },
    facility(L) {
      const m = mk(12), dc = L.birth.care === 'daycare';
      m.add(dc ? 22 : 0, '어린이집에서 보내는 하루').add(dc && L.age <= 2 ? 6 : 0, '어린 나이에 시작한 기관 생활')
        .add(dc && L.birth.parents.dualIncome ? 8 : 0, '맞벌이로 긴 이용 시간').add(!dc && L.age >= 3 && L.year >= 2013 ? 10 : 0, '만 3~5세 기관 생활')
        .add(L.traits.sens > 55 ? (L.traits.sens - 50) * 0.2 : 0, '낯선 환경에 예민한 성향');
      return m.done('기관에 다니지 않고 집에서 지냄');
    },
    sick(L) {
      const p = L.birth.parents, m = mk(10), ha = L.birth.healthAccess, ch = L.health.conditions.filter(c => c.active).length;
      m.add(p.dualIncome ? 18 : 0, '부모 모두 일터에 나감').add(p.singleParent ? 18 : 0, '한 부모 가구')
        .add(ha < 50 ? (50 - ha) / 2.5 : 0, '가까운 종합병원까지 먼 지역').add(!L.birth.urban ? 6 : 0, '농촌 지역')
        .add(ch ? 10 : 0, '치료 중인 병').add(L.birth.lowBirthWeight ? 8 : 0, '저체중 출생').add(L.birth.disability ? 10 : 0, '장애와 치료 접근')
        .add(L.year < 1989 ? 8 : 0, '전국민 의료보험이 되기 전');
      return m.done('아플 때 집에 어른이 있음');
    },
    home(L) {
      const m = mk(8), n = moves(L, 5), q = L.birth.quintile, t = L.home.tenure;
      m.add(n * 8, `이사 ${n}회(최근 5년)`).add(t === 'monthly' ? 15 : t === 'jeonse' ? 6 : 0, t === 'monthly' ? '월세살이' : '전세살이')
        .add(L.flags.substandard ? 12 : 0, '최저주거 기준 미달 방').add(q <= 2 ? (3 - q) * 6 : 0, qLabel(q)).add(L.birth.siblings >= 3 ? 5 : 0, '형제 여럿');
      return m.done('옮기지 않고 사는 집');
    },
    safety(L) {
      const m = mk(10);
      m.add(L.age >= 1 && L.age <= 3 ? 8 : 0, '걸음마를 막 뗀 나이').add(L.flags.substandard ? 8 : 0, '최저주거 기준 미달 방')
        .add(L.birth.siblings >= 2 ? 4 : 0, '형제 여럿').add(L.year < 1995 ? 8 : 0, '어린이 보호구역이 아직 없는 동네');
      return m.done('집과 동네에서 큰 위험 요인 없음');
    },
  },
  child: {
    adapt(L) {
      const m = mk(16), n = moves(L, 3);
      m.add(n * 8, `이사 ${n}회(최근 3년)`).add(L.age <= 7 ? 8 : 0, '초등학교 입학 무렵').add(L.traits.sens > 50 ? (L.traits.sens - 50) * 0.3 : 0, '낯가림이 있는 예민한 성향')
        .add(L.birth.disability ? 8 : 0, '장애와 학교 환경').add(L.flags.schoolClosed && within(L.flags.schoolClosed, L, 3) ? 8 : 0, '다니던 학교가 폐교됨')
        .add(L.stats.relations < 45 ? 10 : 0, '친구 관계 지표가 낮은 편');
      return m.done('다니던 학교와 반에 익숙함');
    },
    violence(L) {
      const m = mk(6 + bully(L.year, 0) * 3.2);
      m.add(within(L.flags.victim, L, 3) ? 35 : 0, '학교에서 괴롭힘을 겪은 일').add(L.traits.sens > 55 ? (L.traits.sens - 50) * 0.25 : 0, '관계에 예민한 성향');
      return m.done('같은 반 또래와 큰 갈등 없음');
    },
    edu(L) {
      const t = L.edu.tutoring, m = mk(8);
      m.add([0, 18, 38, 60][t], ['', '학원 1~2곳', '학원·과외 여러 곳', '사교육 월 70만 원 이상'][t]).add(L.age >= 10 ? 6 : 0, '고학년');
      return m.done('학원·과외 없이 지냄');
    },
    alone(L) {
      const p = L.birth.parents, m = mk(8);
      m.add(p.dualIncome ? 24 : 0, '부모 모두 일을 나감').add(p.singleParent ? 20 : 0, '한 부모 가구').add(L.age >= 9 ? 5 : 0, '혼자 집에 오는 나이')
        .add(L.birth.care === 'grandparent' ? -6 : 0).add(L.birth.siblings > 0 ? -6 : 0);
      return m.done('방과 후 집에 어른이 있음');
    },
    screen(L) {
      const y = L.year, m = mk(y >= 2010 ? 12 + Math.min(25, (y - 2009) * 2) : y >= 1999 ? 10 + (y - 1998) : 8);
      m.add(L.age >= 10 ? 6 : 0, '고학년').add(L.birth.parents.dualIncome ? 6 : 0, '부모가 일하는 낮 시간');
      return m.done('화면 앞에서 보내는 시간이 길지 않음');
    },
    home(L) {
      const q = L.birth.quintile, t = L.home.tenure, n = moves(L, 5), m = mk(8);
      m.add(q <= 2 ? (3 - q) * 8 : 0, qLabel(q)).add(t === 'monthly' ? 10 : t === 'jeonse' ? 4 : 0, t === 'monthly' ? '월세살이' : '전세살이')
        .add(n * 5, `이사 ${n}회(최근 5년)`).add(L.flags.substandard ? 12 : 0, '최저주거 기준 미달 방').add(L.birth.parents.singleParent ? 8 : 0, '한 부모 가구');
      return m.done('안정된 집');
    },
  },
  teen: {
    exam(L) {
      const a = L.age, m = mk(12);
      m.add(a <= 15 ? 6 : 0, '중학생').add(a >= 16 && a <= 17 ? 24 : 0, '고등학교 재학').add(a === 18 ? 34 : 0, '대입을 치르는 해')
        .add(L.edu.tutoring * 6, '학원·과외를 다님').add(L.edu.highType === 'vocational' ? -8 : 0).add(L.edu.dropout ? -15 : 0);
      return m.done('입시 부담이 아직 크지 않음');
    },
    peers(L) {
      const m = mk(8 + bully(L.year, L.age <= 15 ? 1 : 2) * 5);
      m.add(within(L.flags.victim, L, 3) ? 35 : 0, '학교에서 괴롭힘을 겪은 일').add(L.traits.sens > 55 ? (L.traits.sens - 50) * 0.25 : 0, '관계에 예민한 성향')
        .add(L.stats.relations < 45 ? 8 : 0, '친구 관계 지표가 낮은 편');
      return m.done('또래와 큰 갈등 없음');
    },
    cyber(L) {
      const y = L.year, m = mk(y >= 2010 ? 10 + Math.min(25, (y - 2009) * 2.2) : 8);
      m.add(L.traits.sens > 55 ? (L.traits.sens - 50) * 0.25 : 0, '관계에 예민한 성향').add(within(L.flags.victim, L, 3) ? 10 : 0, '학교에서 괴롭힘을 겪은 일');
      return m.done(y >= 2010 ? '또래와 메신저·SNS로 이어진 일상' : '인터넷 채팅을 쓰는 또래 사이');
    },
    body(L) {
      const m = mk(12 + Math.min(20, (L.year - 2009) * 1.5));
      m.add(L.traits.sens > 55 ? (L.traits.sens - 50) * 0.3 : 0, '남의 시선에 예민한 성향');
      return m.done('SNS를 쓰는 또래 집단');
    },
    job(L) {
      const y = L.year, a = L.age, m = mk(10);
      m.add(a >= 16 ? 14 : 0, '진로를 정해야 하는 학년').add(a === 18 ? 8 : 0, '졸업을 앞둔 해').add(L.edu.highType === 'vocational' ? 5 : 0, '특성화·실업계 고교')
        .add(L.edu.dropout ? 15 : 0, '학업 중단').add(y >= 1997 && y <= 1999 ? 12 : 0, '외환위기 직후 줄어든 일자리')
        .add(y === 2008 || y === 2009 ? 8 : 0, '금융위기 직후 일자리').add(y === 2020 || y === 2021 ? 6 : 0, '코로나19 직후 일자리');
      return m.done('졸업까지 시간이 남음');
    },
    edu(L) {
      const q = L.birth.quintile, m = mk(8);
      m.add(q <= 2 ? (3 - q) * 10 : 0, qLabel(q)).add(!L.birth.urban ? 10 : 0, '농촌 학교').add(L.edu.tutoring === 0 && q <= 2 ? 10 : 0, '학원·과외를 하지 않는 집')
        .add(L.birth.disability ? 5 : 0, '장애와 학습 환경').add(L.birth.parents.singleParent ? 8 : 0, '한 부모 가구');
      return m.done('학습에 필요한 형편이 갖춰진 집');
    },
    mind(L) {
      const m = mk(8 + 0.35 * nearest(STRESS_RATE, L.year));
      m.add(L.age >= 17 ? 10 : 0, '대입을 앞둔 학년').add(L.traits.sens > 55 ? (L.traits.sens - 50) * 0.25 : 0, '예민한 성향')
        .add(within(L.flags.victim, L, 3) ? 15 : 0, '학교에서 괴롭힘을 겪은 일').add(L.stats.relations < 45 ? 8 : 0, '친구 관계 지표가 낮은 편');
      return m.done('특별한 사건 없이 지냄');
    },
  },
  youngAdult: {
    job: iss('job', '일자리 불안 요인이 크지 않음'),
    edu(L) {
      const st = L.money.loans.student, m = mk(8), col = L.edu.stage === 'college' || L.edu.stage === 'retake';
      m.add(Math.min(45, st / 100), `학자금 대출 ${st}만 원`).add(col && L.birth.quintile <= 2 ? 15 : 0, qLabel(L.birth.quintile)).add(L.edu.retake ? 8 : 0, 'N수')
        .add(col && L.edu.loan > 0 ? 6 : 0, '등록금을 대출로 마련');
      return m.done('등록금·학자금 부담 없음');
    },
    housing: iss('housing', '주거 부담이 크지 않음'),
    love(L) {
      const f = L.family, a = L.age, m = mk(6);
      if (!f.married) m.add(a >= 25 ? 20 + (a - 25) * 4 : 6, `${a}세 미혼`).add(f.dating ? -6 : 0).add(L.flags.loveFocus ? 6 : 0, '연애에 시간을 쓰는 중');
      else m.add(-4);
      return m.done('결혼한 상태');
    },
    living: iss('living', '생활비 부담이 크지 않음'),
    fairness: iss('fairness', '공정성 체감 요인이 크지 않음'),
  },
  adult30: {
    child(L) {
      const f = L.family, n = f.children.length, m = mk(10);
      m.add(f.married && n === 0 ? 25 + (L.age - 30) * 2 : 0, '결혼 후 자녀 없음').add(!f.married && n === 0 ? 10 : 0, '결혼 전').add(L.flags.childWait ? 15 : 0, '출산 시기를 미루는 중')
        .add(n ? 8 : 0, `자녀 ${n}명`);
      return m.done('자녀 계획이 정해져 있음');
    },
    workcare(L) {
      const pre = kidsAt(L, 0, 6), sk = kidsAt(L, 7, 12), j = L.job.status, m = mk(8);
      m.add(Math.min(2, pre) * 28, `미취학 자녀 ${pre}명`).add(sk * 12, `초등 자녀 ${sk}명`).add((pre + sk) && (j === 'employed' || j === 'self') ? 14 : 0, '일하며 아이를 키우는 중')
        .add(within(L.flags.leaveYear, L, 3) ? 8 : 0, '육아휴직 뒤 복귀 시기');
      return m.done('돌볼 어린 자녀 없음');
    },
    housing: iss('housing', '주거 부담이 크지 않음'),
    job: iss('job', '일자리 불안 요인이 크지 않음'),
    living: iss('living', '생활비 부담이 크지 않음'),
  },
  adult40: Object.fromEntries([['edu', '자녀 교육비 부담 없음'], ['care', '부모 돌봄 부담 없음'], ['job', '일자리 불안 요인이 크지 않음'], ['medical', '건강 이상 없음'],
    ['housing', '주거 부담이 크지 않음'], ['living', '생활비 부담이 크지 않음'], ['tech', '기술 변화에 따른 영향이 크지 않음']].map(([k, f]) => [k, iss(k, f)])),
  adult50: {
    job: iss('job', '일자리 불안 요인이 크지 않음'), care: iss('care', '부모 돌봄 부담 없음'),
    kidcost(L) {
      const k = kidsAt(L, 19, 30), m = mk(8);
      m.add(k * 18, `독립·결혼 시기의 자녀 ${k}명`).add(L.money.loans.student > 0 && k ? 8 : 0, '자녀 학자금');
      return m.done('자녀 독립 비용 해당 없음');
    },
    pensionfund(L) {
      const py = L.money.pensionYears, m = mk(22), working = L.job.status === 'employed' || L.job.status === 'self';
      m.add(py < 10 ? 20 : py < 20 ? 8 : 0, `국민연금 가입 ${Math.round(py)}년`).add(!working ? 10 : 0, '소득이 끊긴 상태').add(L.household.netWorth < 0 ? 15 : 0, '빚이 자산보다 많음')
        .add(L.birth.quintile <= 2 ? 8 : 0, qLabel(L.birth.quintile));
      return m.done('연금 가입 기간이 긴 편');
    },
    medical: iss('medical', '건강 이상 없음'), housing: iss('housing', '주거 부담이 크지 않음'),
  },
  senior60: {
    pension(L) {
      const a = L.aging, m = mk(18), pm = a.pensionMonthly;
      m.add(L.age >= 65 && !pm && !a.basic ? 30 : 0, '받는 연금 없음').add(pm > 0 && pm < 40 ? 16 : 0, `국민연금 월 ${pm}만 원`).add(L.age < 65 && a.pensionStart == null ? 10 : 0, '연금을 받기 전')
        .add(L.money.livingRatio > 0.7 ? 12 : 0, '생활비가 소득 대부분').add(L.money.deficitYears > 0 ? 12 : 0, '적자 가계');
      return m.done('연금으로 생활이 이어짐');
    },
    job: iss('job', '일자리 불안 요인이 크지 않음'), medical: iss('medical', '건강 이상 없음'),
    spouse(L) {
      const f = L.family, m = mk(8);
      m.add(f.caringFor === 'spouse' ? 50 : 0, '배우자 돌봄').add(f.widowed ? 35 : 0, '배우자 사별').add(!f.married && !f.widowed ? 15 : 0, '혼자 지냄').add(f.divorced ? 10 : 0, '이혼');
      return m.done('배우자와 함께 지냄');
    },
    care: iss('care', '돌봄 부담 없음'), housing: iss('housing', '주거 부담이 크지 않음'), tech: iss('tech', '기기 사용 어려움이 크지 않음'),
  },
  elder75: {
    dementia(L) {
      const m = mk(8 + (L.age - 75) * 1.5);
      m.add(L.health.conditions.some(c => c.active && c.key === 'dementia') ? 50 : 0, '치매 진단').add(L.age >= 85 ? 8 : 0, '85세 이상');
      return m.done('진단받은 인지 저하 없음');
    },
    care(L) {
      const ltc = L.aging.ltc, f = L.family, m = mk(8);
      m.add(ltc ? 15 + (6 - ltc) * 8 : 0, `장기요양 ${ltc}등급`).add(L.health.care !== 'none' ? 10 : 0, '일상에 도움이 필요함').add(f.caringFor === 'spouse' ? 25 : 0, '배우자 돌봄 중').add(f.livingAlone ? 8 : 0, '혼자 사는 집');
      return m.done('돌봄 없이 지냄');
    },
    isolation(L) {
      const f = L.family, m = mk(8);
      m.add(L.aging.isolated ? 40 : 0, '연락이 끊긴 상태').add(f.livingAlone ? 25 : 0, '혼자 사는 집').add(f.widowed ? 15 : 0, '배우자 사별').add(L.stats.relations < 45 ? 8 : 0, '관계 지표가 낮은 편');
      return m.done('가족·이웃과 왕래함');
    },
    dignity(L) {
      const m = mk(12 + (L.age - 75) * 1.2), ch = L.health.conditions.filter(c => c.active).length;
      m.add(ch * 4, `치료 중인 병 ${ch}개`).add(L.aging.ltc ? 8 : 0, `장기요양 ${L.aging.ltc}등급`).add(L.age >= 85 ? 8 : 0, '85세 이상');
      return m.done('건강한 편');
    },
    medical: iss('medical', '의료비 부담이 크지 않음'), tech: iss('tech', '기기 사용 어려움이 크지 않음'),
  },
};

const inYears = (y, r) => y >= r[0] && y <= r[1];
export const stageOf = age => CONCERN_STAGES.find(s => age >= s.from && age <= s.to) || CONCERN_STAGES[CONCERN_STAGES.length - 1];

export function concernsOf(L) {
  const st = stageOf(L.age), ctx = {}, y = L.year, items = [];
  for (const it of CONCERN_ITEMS[st.id]) {
    if (!inYears(y, it.years)) continue;
    const v = it.eraVariants?.find(e => inYears(y, e.years));
    const { value, reason } = CALC[st.id][it.key](L, ctx);
    items.push({ key: it.key, label: v?.label ?? it.label, desc: v?.desc ?? it.desc, value, reason,
      basis: { src: it.src, kind: it.kind, note: it.note }, ...(it.adultKey && { adultKey: it.adultKey }) });
  }
  const shown = new Set(items.map(i => i.adultKey));
  return { stage: st.id, stageLabel: st.label, items, hiddenAdultKeys: ISSUE_KEYS.filter(k => !shown.has(k)) };
}
