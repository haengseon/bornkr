// 이슈 10축(GDD §7). 축마다 신호 S_k = 성분 합, 해마다 I ← I + d(S − I).
import { ISSUE_KEYS, ISSUES } from './constants.js';
import { ISSUE_D } from './tuning.js';
import { T, D, yr, isCapital, REGION } from './tables.js';
import { indep } from './act.js';
import { econ, incQuint, kidsAt } from './stats.js';
import { pushReason } from './life.js';
import { won } from './text.js';

const clamp = (x, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, x));
const LABEL = Object.fromEntries(ISSUES.map(i => [i.key, i.label]));
const within = (y, L, n) => y != null && L.year - y <= n;

const ERA_JOB = { 1998: 15, 2009: 8, 2020: 8 };

// 축별 성분 [{ v, text, src? }]. 아동(<15)은 가구 상태(housing·job·living)를 0.5배.
export function signals(L) {
  const kid = L.age < 15, half = kid ? 0.5 : 1, e = econ(L), h = L.home, j = L.job, f = L.family, fl = L.flags, y = L.year;
  const out = {};
  // late: 사건 발생 해보다 나중에 발표·기준인 자료 → 인물 화면에는 plain 문장만 쓰고 원문 수치는 srcNote로 분리(QA #5)
  const ad = (k, v, text, src, late) => { if (v) (out[k] ||= []).push({ v, text, ...(src && { src }), ...(late && { late }) }); };
  for (const k of ISSUE_KEYS) out[k] = [];

  // housing
  ad('housing', 15, '기본');
  const t = h.tenure;
  if (t === 'monthly') ad('housing', 25 * half, '월세살이', 'R05.S1');
  if (t === 'jeonse') ad('housing', 12 * half, '전세살이', 'R05.S1');
  if (h.parents && L.age >= 25) ad('housing', 10, '독립할 나이에 부모 집');
  if (h.owned && e.dsr > 0.3) ad('housing', 10, `원리금 부담 ${Math.round(e.dsr * 100)}%`, 'R05.S2');
  const rir = indep(L) && e.INC > 0 ? (h.rent || 0) * 12 / e.INC : 0;
  if (rir > 0.1) ad('housing', 60 * (rir - 0.1), `소득 대비 주거비 ${Math.round(rir * 100)}%`, 'R05.S1');
  const moves8 = h.moves.filter(m => m.year > y - 8).length;
  if (moves8) ad('housing', 6 * moves8 * half, `이사 ${moves8}회(최근 8년)`, 'R05.S1');
  if (fl.substandard) ad('housing', 10, '최저주거 기준 미달 방', 'R05.S1');
  if (!h.owned && isCapital(h.region) && L.age >= 25 && L.age <= 45) ad('housing', 8, '수도권 무주택', 'R05.S2');
  if (within(fl.fraud, L, 5)) ad('housing', 20, '전세 보증금 피해', 'R05.S4');

  // job
  ad('job', 15 * half, '기본');
  if (kid && L.birth.quintile <= 2) ad('job', 7, '부모의 불안정한 일');
  if (j.status === 'employed' && !j.regular) ad('job', 34, `비정규직 ${j.years + 1}년째`, 'R04.S4');
  if (j.status === 'seeking') ad('job', 40, `구직 ${Math.max(1, j.searchYears) * 12}개월`, 'R04.S3');
  if (j.status === 'self') ad('job', 18, '자영업', 'R04.S4');
  if (j.status === 'employed' && j.regular && (j.public || j.firmSize === 'large')) ad('job', -8, '정년까지 기대할 수 있는 일자리');   // 개인 성분 확대(QA-S-10)
  if ((j.status === 'employed' || j.status === 'self') && (j.firmSize === 'micro' || j.firmSize === 'small')) ad('job', 10, '작은 사업장', 'R04.S5');
  if (j.platform) ad('job', 8, '플랫폼 노동');
  if ((L.tally.jobLosses || 0) + (L.tally.contractEnds || 0) >= 3) ad('job', 8, '여러 번 끊긴 일자리');
  if (within(fl.contractEnd, L, 1)) ad('job', 20, '계약 만료', 'R04.S4');
  const churn = j.history.filter(x => x.to != null && x.to > y - 5).length;
  if (churn) ad('job', 5 * churn, `이직·실직 ${churn}회(최근 5년)`);
  if (j.status === 'employed' && j.regular && L.age >= 50 && L.age < 60) ad('job', 8, '주된 일자리 퇴직 평균 53.0세', 'R04.S7', y < 2025 && { ref: 2025, plain: '주된 일자리를 떠날 나이가 가까움' });
  if (ERA_JOB[y] && L.age >= 15) ad('job', ERA_JOB[y], `${y}년 고용 충격`, 'R04.S8');

  // edu
  const q = L.birth.quintile;
  ad('edu', 15, '기본');
  if (L.age <= 25) ad('edu', 8 * Math.max(0, 3 - q), '가구 형편과 학습 기회', 'R03.S1');
  if (!L.birth.urban && L.age <= 25) ad('edu', 10, '농촌 학교', 'R03.S1');
  if (L.age >= 7 && L.age <= 18) {
    if (L.edu.tutoring === 0 && T('TUTOR_PART')[3] * yr(T('TUTOR_ERA'), y) > 0.7) ad('edu', 12, '사교육 참여율 소득 300만 원 미만 52.8% vs 800만 원 이상 84.9%(2025)', 'R03.S1', y < 2025 && { ref: 2025, plain: '학원·과외를 하지 않는 집' });
    if (L.edu.tutoring === 3) ad('edu', 8, '사교육 월 70만 원 이상', 'R03.S1');
  }
  if (L.money.loans.student > 0) ad('edu', 10, `학자금 대출 ${won(L.money.loans.student)}만 원`, 'R03.S21');
  if (L.edu.retake && L.age <= 25) ad('edu', 8, 'N수', 'R03.S11');
  if (L.edu.dropout) ad('edu', 15, '학업 중단', 'R03.S12');
  else if (L.age >= 19 && L.edu.stage === 'done') { const lv = { mid: 22, high: 15, '2yr': 7, '4yr': -5, grad: -5 }[L.edu.level]; if (lv) ad('edu', lv, '학력에 따라 갈린 일자리 문턱', 'R03.S1'); }
  const sk = kidsAt(L, 7, 18);
  if (sk) ad('edu', 10 * sk, `학령기 자녀 ${sk}명의 사교육비`, 'R03.S1');

  // care
  ad('care', 10, '기본');
  if (f.caringFor) ad('care', (f.caringFor === 'spouse' ? 65 : 60) * (fl.careShare ? 0.6 : 1), `${f.caringFor === 'spouse' ? '배우자' : '부모'} 돌봄 ${L.year - (fl.careStart ?? y) + 1}년째`, 'R06.S33');
  const pre = kidsAt(L, 0, 6);
  if (pre) ad('care', 30 * Math.min(2, pre), `미취학 자녀 ${pre}명`, 'R06.S32');
  if (sk) ad('care', 13 * sk, `학령기 자녀 ${sk}명`);
  if (fl.youngCarer) ad('care', 15, '가족돌봄청년 주당 평균 21.6시간(2022)', 'R06.S33', y < 2022 && { ref: 2022, plain: '가족을 돌보는 청소년' });
  const par = f.parents, old = [par.father, par.mother].some(p => p.alive && p.age >= 75);
  if (old && L.age >= 19 && (f.siblings || 0) <= 1) ad('care', f.siblings ? 8 : 20, f.siblings ? '75세 넘은 부모, 형제 한 명' : '75세 넘은 부모, 형제 없음');
  if (fl.supportUntil >= y) ad('care', 12, '부모 생활비 송금', 'R06.S37');
  if (fl.grandcare) ad('care', 15, '손주 돌봄');

  // medical
  ad('medical', 10, '기본');
  const chronic = L.health.conditions.filter(c => c.active && c.key !== 'cancer' && c.key !== 'injury').length;
  if (chronic) ad('medical', 12 * chronic, `만성질환 ${chronic}개`, 'R02.S12');
  if (L.health.conditions.some(c => c.active && c.key === 'cancer')) ad('medical', 25, '암 치료 중', 'R02.S14');
  if (L.birth.disability) ad('medical', 15, '장애와 치료 접근');
  if (L.aging.ltc) ad('medical', 20, `장기요양 ${L.aging.ltc}등급`, 'R07.S12');
  if (L.birth.healthAccess < 50) ad('medical', (50 - L.birth.healthAccess) / 2, '가까운 종합병원까지 먼 지역', 'R02.S10');
  if (!L.birth.urban) ad('medical', 8, '농촌 의료 접근');
  if (L.money.oop > 0.1 * e.INC && L.money.oop > 0) ad('medical', 10, `본인부담 의료비 연 ${won(L.money.oop)}만 원`, 'R07.S12');
  if (within(fl.unmet, L, 3)) ad('medical', 8, '병원비·거리로 진료를 미룸');
  const acc = (D.ERA_SHOCKS?.values?.[y]?.access) || 0;
  if (acc) ad('medical', -acc, '전공의 이탈로 진료 공백', 'R08.S61');

  // fairness
  const qNow = incQuint(L);
  ad('fairness', 25, '기본');
  ad('fairness', 7 * (3 - qNow), qNow === 1 ? '형편이 어려운 살림' : qNow === 2 ? '빠듯한 살림' : '여유 있는 살림');   // 서열 표현 대신 형편 문구(QA-E-15), 개인 성분 확대(QA-S-10)
  if (L.age >= 19) ad('fairness', 3 * (3 - q), '태어난 집의 형편');
  if (L.birth.year >= 1985 && !h.owned && L.age >= 30 && L.age <= 45) ad('fairness', 8, '같은 나이 부모 세대보다 먼 내 집', 'R05.S2');
  if (j.status === 'employed' && !j.regular) ad('fairness', 10, '같은 일, 다른 고용 형태', 'R04.S5');
  if (L.money.loans.student > 0) ad('fairness', 6, '학자금 대출');
  if (within(fl.fraud, L, 5)) ad('fairness', 8, '전세사기');
  if (within(fl.bankruptLoss, L, 3)) ad('fairness', 6, '사업 부진으로 실직');
  if (y >= 2026 && y <= 2033 && (j.status === 'employed' || j.status === 'self')) ad('fairness', 5, '보험료율 9%→13%(2026~2033)', 'R08.S01');
  if (L.age >= 15) {
    const c = classMob(y);
    ad('fairness', (c.low - 50) * 0.3, `본인 세대 계층 상승 가능성 '높다' ${c.high.toFixed(1)}%(${c.y})`, 'R08.S01', c.y > y && { ref: c.y, plain: '본인 세대의 계층 상승 가능성에 대한 인식' });
  }

  // region
  ad('region', 10, '기본');
  const ext = extinction(L.home.region, y);
  if (ext) ad('region', ext.v, ext.text, 'R08.S13', y < 2025 && { ref: 2025, plain: '사는 지역의 인구 감소' });
  if (!L.birth.urban && !isCapital(h.region)) ad('region', 15, '농촌·소도시');
  if (within(fl.schoolClosed, L, 5)) ad('region', 10, '고향 학교 폐교');
  if (within(fl.toCapital, L, 5) && L.age >= 19) ad('region', 8, '일자리 찾아 수도권으로', 'R08.S16');

  // tech
  ad('tech', 10, '기본');
  if ((j.status === 'employed' || j.status === 'self') && j.ai && y >= 2000) {
    const w = (j.ai === 'high' ? 45 : j.ai === 'mid' ? 30 : 0) * (y >= 2023 ? 1 : 0.6);
    if (w) ad('tech', w, `${j.title} AI 노출 '${j.ai === 'high' ? '높음' : '중간'}'(BOK 2025 분류)`, 'R09.S4', y < 2025 && { ref: 2025, plain: `${j.title} 일의 자동화 영향` });
  }
  if (L.age >= 70 && y >= 2015) ad('tech', 15, '키오스크·앱 예약 장벽', 'R08.S01');
  if (within(fl.aiLoss, L, 5)) ad('tech', 10, '자동화로 줄어든 일');
  if (j.platform) ad('tech', 5, '앱으로 받는 일');
  if ((j.status === 'employed' || j.status === 'self') && (j.major === '2' || j.major === '3') && y >= 1995) ad('tech', 12, '전산화된 사무');
  if (L.age >= 65 && y >= 2010 && ['mid', 'high'].includes(L.edu.level)) ad('tech', 12, '디지털 기기 문턱');

  // conflict
  ad('conflict', 25, '기본');
  if (L.age >= 15) {
    ad('conflict', 0.7 * conflictEra(y), `사회 갈등 인식(${Math.min(Math.max(y, 2022), 2025)})`, 'R08.S08', y < 2022 && { ref: 2022, plain: '사회 갈등 인식' });
  }
  if (within(fl.divorceYear, L, 3)) ad('conflict', 8, '이혼');
  // 개인 성분(QA-S-10): 사는 곳·형편·일·출신·성향에 따라 갈등을 체감하는 정도가 다르다
  if (L.age >= 15) {
    if (isCapital(h.region)) ad('conflict', 12, '사람과 집값이 몰린 수도권');
    ad('conflict', 6 * (3 - qNow), qNow <= 2 ? '빠듯한 살림의 계층 갈등 체감' : '여유 있는 살림');
    ad('conflict', 0.3 * (L.traits.sens - 50), '갈등 소식에 예민한 성향');
    if (j.status === 'employed' && !j.regular) ad('conflict', 6, '고용 형태를 둘러싼 갈등', 'R04.S5');
    if (t === 'monthly' && indep(L)) ad('conflict', 5, '임대료를 둘러싼 갈등');
    if (L.birth.parents.multicultural) ad('conflict', 12, '다문화 가정을 향한 시선');
    if (L.birth.disability) ad('conflict', 8, '장애를 둘러싼 이동권 갈등');
  }
  if (fl.laborDispute && within(fl.laborDispute, L, 3)) ad('conflict', 6, '노사 분쟁 일터');

  // living
  ad('living', 15 * half, '기본');
  if (indep(L) && L.money.livingRatio > 0.7) ad('living', 30 * (L.money.livingRatio - 0.7), '생활비가 가처분소득의 대부분', 'R05.S3');
  const cpi = cpiPct(y);
  if (cpi > 2) ad('living', Math.min(30, 4 * (cpi - 2)) * half, `소비자물가 +${cpi.toFixed(1)}%(${y})`, 'R05.S8');
  if (y === 2022 || y === 2023) ad('living', 10 * half, '전기·가스·수도 +20.2%(2023)', 'R08.S30', y < 2023 && { ref: 2023, plain: '공공요금 인상' });
  const heat = y >= 1990 ? heatDays(y) : 0;
  if (heat) {
    ad('living', heat / 11 * 5, `폭염일수 ${Math.round(heat)}일(${Math.min(y, 2025)})`, 'R08.S25');
    if ((j.status === 'employed' || j.status === 'self') && ['6', '7', '9'].includes(j.major) && heat > 20) ad('living', 10, '야외 노동과 폭염');
    if (L.age >= 65 && f.livingAlone && heat > 20) ad('living', 10, '혼자 사는 노인과 폭염');
  }
  if (L.money.deficitYears > 0) ad('living', 10, '적자 가계', 'R05.S3');
  if (L.age >= 19) ad('living', 6 * (3 - qNow), qNow <= 2 ? '빠듯한 살림의 생활비' : '여유 있는 살림');
  if (t === 'monthly' && indep(L)) ad('living', 6, '다달이 나가는 월세', 'R05.S1');
  return out;
}

// 본인 세대 계층 상승 가능성 '낮다' 응답(%)과 '높다'(%)
function classMob(y) {
  const c = D.CLASS_MOBILITY;
  return { low: yr(c.low.self, y) * 100, high: yr(c.values.self, y) * 100, y: Math.min(Math.max(y, 2009), 2025) };
}
// 사회 갈등 인식(0~1 환산 평균) × 20
function conflictEra(y) {
  const v = Object.values(T('CONFLICT_INDEX')).map(s => yr(s, y));
  return v.reduce((a, b) => a + b, 0) / v.length * 20;
}
const cpiPct = y => yr(T('CPI_INFLATION'), y) * 100;
// 폭염일수: 표에 있는 해만(나머지는 평년)
function heatDays(y) {
  const h = D.HEAT_DAYS;
  return h.values.heat[y] ?? h.normal.heat;
}
// 지방소멸위험지수(2025.6, ×100) + 전국 지수 시대 보정(2000 지수 258.6 → ×.4)
function extinction(region, y) {
  const t = T('REGION_EXTINCTION'), idx = t.byRegion[region];
  if (idx == null) return null;
  const era = Math.min(1, Math.pow(yr(t.national, 2025) / yr(t.national, y), 0.6));
  return { v: Math.max(0, 60 - idx * 0.5) * era, text: `${REGION[region]?.label ?? region} 지방소멸위험지수 ${idx}(2025.6)` };
}

// 인물 화면용 문장(후대 자료는 plain) / 후대 자료 표기
export const plainText = c => (c.late ? c.late.plain : c.text);
export const lateNote = c => (c.late ? `후대 자료(${c.late.ref}년 기준)를 이용한 게임 추정: ${c.text}` : null);

export const signalValue = (L, k, sig = signals(L)) => clamp(sig[k].reduce((a, c) => a + c.v, 0));

// 5단계: 이슈 갱신. 크게 움직인 축은 상위 성분을 reason으로 남긴다.
export function updateIssues(L) {
  const sig = signals(L);
  for (const k of ISSUE_KEYS) {
    const S = signalValue(L, k, sig), old = L.issues[k];
    const nv = clamp(Math.round(old + ISSUE_D * (S - old)));
    L.issues[k] = nv;
    if (Math.abs(nv - old) >= 3) {
      const cand = sig[k].filter(c => c.text !== '기본').sort((a, b) => b.v - a.v);
      const top = cand.find(c => !c.late && c.v >= 0.6 * cand[0].v) ?? cand[0];     // 그 시점에 있던 사실 기반 사유를 우선
      if (top) pushReason(L, k, { year: L.year, age: L.age, text: plainText(top), delta: nv - old, ...(top.src && { src: [top.src] }), ...(top.late && { srcNote: lateNote(top) }) });
    }
  }
}

export const issueLabel = k => LABEL[k];
