// 콘텐츠 C — 45세 이상 삶의 다양한 개인 경험(R12). 형식: ARCHITECTURE §8. 노년의 존엄을 지키고 사실·상태 중심으로 쓴다.
// 자동 사건 ~80%, 선택 사건 ~20%(이사 선택 없음). 가족·건강 조건은 when으로 문장과 맞춘다.
import { kids, working, isEmployed, isRegular, selfEmp, owned, wealth, cond } from './mid.js';

const F = L => L?.family ?? {};
const mate = L => !!F(L).partner;
const widowed = L => !!F(L).widowed && !F(L).partner;
const pAlive = L => ['father', 'mother'].some(k => F(L).parents?.[k]?.alive);
const pGone = L => !pAlive(L);
const sibs = L => (F(L).siblings ?? 0) > 0;
const grand = L => (F(L).grandchildren ?? 0) > 0;
const and = (...f) => L => f.every(g => g(L));
const kd = (lo, hi) => L => kids(L, lo, hi) > 0;

// 자동 사건
const A = (id, ages, p, text, stats, reason, o = {}) => ({
  id: `life.c.${id}`, ages, p, ...(o.once ? { once: true } : { cooldown: o.cd ?? 8 }), tags: ['life'], text,
  fx: { stats, ...(o.issues && { issues: o.issues }) }, reason,
  ...(o.when && { when: o.when }), ...(o.years && { years: o.years }), ...(o.src && { src: o.src }), ...(o.sensitive && { sensitive: o.sensitive }),
});
// 선택 사건: opts = [[label, stats, result], ...] (첫 선택지가 기본값)
const C = (id, ages, p, text, prompt, reason, opts, o = {}) => ({
  id: `life.c.${id}`, ages, p, ...(o.once === false ? { cooldown: o.cd ?? 10 } : { once: true }), tags: ['life'], text, reason,
  ...(o.when && { when: o.when }), ...(o.years && { years: o.years }), ...(o.src && { src: o.src }),
  choice: {
    prompt,
    options: opts.map(([label, stats, result], i) => ({ id: `o${i + 1}`, label, fx: { stats }, result })),
    default: 'o1',
  },
});

export default [
  // ───────── 일터 후반기 ─────────
  A('job.stall', [45, 56], 0.08, '승진 명단에 이름이 오르지 않은 해가 이어졌다.', { happiness: -1, wealth: -1 }, '승진 정체', { when: isRegular, issues: { job: 1 } }),
  A('job.junior.boss', [46, 58], 0.07, '후배가 팀장이 되어 그에게 보고하는 자리가 되었다.', { happiness: -2, relations: -1 }, '후배 상사', { when: isEmployed, cd: 10, issues: { fairness: 1 } }),
  A('job.hope.retire', [46, 57], 0.08, '회사에서 희망퇴직 신청 안내가 돌았다.', { happiness: -2, wealth: -1 }, '희망퇴직 분위기', { when: and(isEmployed, L => L.year >= 1998), cd: 6, issues: { job: 3 }, src: ['R04'] }),
  A('job.duty.change', [47, 58], 0.07, '담당 업무가 바뀌어 처음부터 다시 익혀야 했다.', { intellect: 1, leisure: -1 }, '업무 변경', { when: isRegular }),
  A('job.wage.peak', [55, 60], 0.3, '임금피크제가 적용되어 월급 명세서 금액이 줄었다.', { wealth: -2, happiness: -1 }, '임금피크제', { when: and(isRegular, L => L.year >= 2016), once: true, issues: { fairness: 1 }, src: ['note: 2016 정년 60세 의무화와 임금피크제 확산'] }),
  A('job.living.sheet', [50, 60], 0.1, '퇴직 후 생활비를 항목별로 적은 표를 처음 만들었다.', { wealth: 1, leisure: -1 }, '퇴직 후 생활비 점검', { when: working, once: true }),
  A('job.retrain', [50, 64], 0.07, '재취업 교육 과정에 등록해 평일 오전에 수업을 들었다.', { intellect: 1, relations: 1 }, '재취업 교육', { when: L => L.year >= 2000, cd: 10 }),
  A('job.shop.hours', [45, 65], 0.08, '가게 문을 닫는 시각을 한 시간 앞당겼다.', { leisure: 1, wealth: -1 }, '영업시간 단축', { when: selfEmp }),
  A('job.shop.rent', [45, 65], 0.08, '가게 임대 재계약 철이 되어 임대료를 다시 협의했다.', { wealth: -1, happiness: -1 }, '임대료 재협의', { when: selfEmp, issues: { living: 1 } }),
  A('job.mentor', [52, 62], 0.07, '신입 직원의 교육을 맡아 일을 하나씩 가르쳤다.', { happiness: 1, relations: 1 }, '신입 교육 담당', { when: isEmployed }),
  A('job.mate.leave', [45, 60], 0.08, '입사 동기가 회사를 떠난다는 소식을 들었다.', { relations: -1, happiness: -1 }, '입사 동기의 퇴사', { when: isEmployed, cd: 6 }),
  A('job.study.cert', [50, 65], 0.06, '새 자격증 시험을 준비하며 도서관에 다녔다.', { intellect: 2, leisure: -1 }, '자격증 준비', { cd: 10 }),
  A('job.shift', [45, 58], 0.08, '교대 근무가 몸에 부치기 시작해 휴일에는 잠으로 보냈다.', { health: -1, leisure: -1 }, '교대 근무 부담', { when: L => isEmployed(L) && L?.job?.major === '8', issues: { job: 1 } }),
  A('job.system', [47, 58], 0.07, '새 업무 시스템 사용법을 후배에게 물어 가며 익혔다.', { intellect: 1, happiness: -1 }, '새 업무 시스템', { when: and(isEmployed, L => L.year >= 2000), issues: { tech: 2 } }),
  A('job.pension.look', [50, 64], 0.1, '국민연금 노후준비서비스에서 예상 수령액을 확인했다.', { intellect: 1 }, '예상 연금 확인', { when: L => L.year >= 2008, once: true, src: ['R07'] }),
  C('job.startup.prep', [48, 60], 0.06, '퇴직 뒤에 할 가게를 구상하며 상권을 둘러보았다.', '어떻게 할까?', '창업 준비',
    [['창업 준비를 이어 간다', { wealth: -2, intellect: 1, leisure: -1 }, '창업 교육과 임대 매물 확인으로 주말이 채워졌다.'], ['재취업을 알아본다', { wealth: 1, leisure: -1 }, '이전 경력을 살릴 자리를 알아보러 다녔다.'], ['구상을 접어 둔다', { happiness: 1, wealth: 1 }, '자영업 폐업 소식을 떠올리며 계획을 내려놓았다.']], { when: isEmployed }),
  C('job.shop.heir', [55, 68], 0.08, '가게를 이어받을 사람이 있는지 가족과 이야기를 나누었다.', '어떻게 할까?', '가게 승계 논의',
    [['자녀와 구체적으로 논의', { relations: 1, happiness: 1 }, '자녀는 일 배우는 기간부터 정하자고 했다.'], ['정리하기로 한다', { leisure: 2, wealth: -1 }, '단골들에게 폐점 계획을 천천히 알렸다.']], { when: and(selfEmp, kd(25, 60)) }),
  C('job.checkup.recheck', [45, 70], 0.1, '건강검진에서 재검사를 받으라는 통보가 왔다.', '어떻게 할까?', '검진 재검 통보',
    [['바로 재검을 받는다', { health: 1, leisure: -1 }, '재검 결과는 경과 관찰이었고, 석 달 뒤에 다시 보기로 했다.'], ['일정을 조정해 미룬다', { leisure: 1, health: -1 }, '일이 한가한 달로 재검 날짜를 옮겼다.']], { once: false, cd: 5 }),

  // ───────── 가족 ─────────
  A('fam.exam', [45, 58], 0.12, '자녀의 입시 결과 발표를 기다리며 하루를 보냈다.', { happiness: -1, leisure: -1 }, '자녀 입시', { when: kd(17, 19), cd: 3, issues: { edu: 2 } }),
  A('fam.tuition', [45, 60], 0.12, '자녀 등록금 고지서가 학기마다 날아왔다.', { wealth: -2 }, '자녀 등록금', { when: kd(19, 26), cd: 2, issues: { edu: 2 } }),
  C('fam.wedding.cost', [52, 70], 0.1, '자녀의 결혼 준비로 예식장과 신혼집 비용 이야기가 나왔다.', '어떻게 할까?', '자녀 결혼 비용',
    [['목돈을 보탠다', { wealth: -4, relations: 2 }, '노후 자금 일부를 자녀 결혼 비용으로 보탰다.'], ['예식 비용만 낸다', { wealth: -2, relations: 1 }, '예식장 비용만 부담하고 나머지는 자녀가 마련했다.'], ['각자 마련하게 한다', { wealth: 1, relations: -1 }, '자녀가 대출과 저축으로 비용을 꾸렸다.']], { when: kd(26, 40), src: ['R06'] }),
  A('fam.wedding.seat', [55, 75], 0.1, '자녀의 결혼식에서 혼주석에 앉았다.', { happiness: 3, relations: 2 }, '자녀 결혼식', { when: L => (F(L).children || []).some(c => c.alive && c.married && c.marriedYear === L.year), once: true }),
  A('fam.child.out', [50, 66], 0.1, '자녀가 독립한 뒤 빈 방의 문을 오래 열어 두었다.', { relations: -1, leisure: 1 }, '자녀 독립', { when: L => (F(L).children || []).some(c => c.alive && c.leftHome && c.leftHomeYear === L.year), once: true }),
  A('fam.empty.nest', [50, 64], 0.1, '함께 살던 마지막 자녀가 독립해 저녁상은 둘이 차렸다.', { leisure: 2, happiness: -1 }, '빈 둥지', { when: L => mate(L) && (F(L).children || []).some(c => c.alive && c.leftHome && c.leftHomeYear === L.year) && !(F(L).children || []).some(c => c.alive && !c.leftHome), once: true }),
  A('fam.sonin.call', [56, 80], 0.08, '자녀가 명절 전에 먼저 전화를 걸어 안부를 물었다.', { happiness: 1, relations: 1 }, '자녀의 안부', { when: kd(28, 55), cd: 6 }),
  A('fam.holiday.table', [55, 85], 0.12, '명절에 자녀 식구가 모여 상을 함께 차렸다.', { relations: 2, leisure: -1 }, '명절 모임', { when: kd(25, 60), cd: 3 }),
  A('fam.wallet.photo', [55, 80], 0.1, '손주 사진을 지갑에 넣고 다니며 틈틈이 꺼내 보았다.', { happiness: 2 }, '손주 사진', { when: grand, once: true }),
  C('fam.grand.care', [55, 75], 0.1, '맞벌이하는 자녀가 손주 하원을 맡아 줄 수 있는지 물었다.', '어떻게 할까?', '손주 돌봄 요청',
    [['평일에 맡는다', { relations: 2, health: -2, leisure: -3 }, '평일 오후는 어린이집 앞에서 시작되었다.'], ['주 이틀만 맡는다', { relations: 1, leisure: -1 }, '요일을 정해 손주를 맡기로 했다.'], ['어렵다고 말한다', { leisure: 1, relations: -1 }, '체력이 부쳐 어렵다고 말하고 돌봄 기관을 같이 알아보았다.']], { when: and(grand, kd(28, 50)), once: false, cd: 12, src: ['R06'] }),
  A('fam.grand.school', [60, 80], 0.1, '손주 입학식에 가서 맨 뒷줄에서 사진을 찍었다.', { happiness: 2, relations: 1 }, '손주 입학식', { when: grand, cd: 6 }),
  A('fam.parent.hospital', [45, 66], 0.1, '부모님이 입원해 병원에 오가는 날이 늘었다.', { leisure: -2 }, '부모 병원 수발', { when: pAlive, cd: 5, issues: { care: 3 } }),
  C('fam.parent.cost', [45, 66], 0.07, '부모님 병원비를 형제들과 어떻게 나눌지 이야기했다.', '어떻게 할까?', '부모 병원비 분담',
    [['균등하게 나눈다', { wealth: -1, relations: 1 }, '매달 같은 금액을 모아 병원비 통장을 만들었다.'], ['형편대로 나눈다', { wealth: -1 }, '각자 형편에 맞춰 금액과 병원 방문을 나누었다.'], ['혼자 감당한다', { wealth: -3, relations: -1 }, '말을 꺼내지 못하고 병원비를 직접 냈다.']], { when: and(pAlive, sibs), once: false, cd: 8, src: ['R06'] }),
  A('fam.parent.funeral', [47, 72], 0.05, '부모님의 장례를 치렀다. 조문객이 사흘 내내 이어졌다.', { happiness: -4, relations: 1 }, '부모 상', { when: () => false, cd: 10, sensitive: 'death' }),
  C('fam.rite', [48, 75], 0.08, '부모님 제사를 앞으로 어떻게 지낼지 형제들과 의논했다.', '어떻게 할까?', '제사 방식',
    [['지금처럼 지낸다', { relations: 1, leisure: -2 }, '제사 음식을 나눠 준비하는 날이 이어졌다.'], ['간소하게 줄인다', { leisure: 1 }, '제수를 줄이고 식사로 대신하기로 했다.'], ['절에 모신다', { leisure: 1, wealth: -1 }, '사찰에 위패를 모시고 기일에 찾아가기로 했다.']], { when: pGone }),
  A('fam.parent.things', [48, 75], 0.08, '부모님이 쓰시던 살림을 하나씩 정리했다.', { happiness: -2, relations: 1 }, '부모 유품 정리', { when: pGone, once: true }),
  A('fam.inherit', [50, 75], 0.06, '부모님 재산 정리를 두고 형제들이 여러 번 만났다.', { relations: -1, wealth: 1 }, '부모 재산 정리', { when: and(pGone, sibs), once: true, issues: { fairness: 1 } }),
  A('fam.sibs.meet', [45, 80], 0.1, '형제들이 오랜만에 한자리에 모여 식사했다.', { relations: 2, happiness: 1 }, '형제 모임', { when: sibs, cd: 5 }),
  A('fam.ltc.apply', [50, 72], 0.06, '부모님의 장기요양 등급 신청서를 대신 냈다.', { leisure: -1 }, '부모 요양 등급 신청', { when: and(pAlive, L => L.year >= 2008), cd: 6, issues: { care: 3 }, src: ['R06', 'R07'] }),
  C('fam.child.deposit', [50, 64], 0.08, '자녀가 집 보증금 마련이 어렵다며 도움을 청했다.', '어떻게 할까?', '자녀 주거 지원',
    [['큰 금액을 보탠다', { wealth: -4, relations: 2 }, '적금을 해약해 자녀의 보증금을 보탰다.'], ['일부만 보탠다', { wealth: -2, relations: 1 }, '가능한 만큼만 보태고 나머지는 대출로 마련하게 했다.'], ['보태지 않는다', { wealth: 1, relations: -1 }, '자녀는 대출을 알아보았고 한동안 연락이 뜸했다.']], { when: kd(24, 40), once: false, cd: 10, src: ['R06'] }),
  A('fam.child.wait', [48, 62], 0.08, '자녀의 취업이 늦어져 한집에서 지내는 해가 길어졌다.', { wealth: -1, happiness: -1 }, '자녀 취업 지연', { when: kd(24, 36), cd: 6, issues: { job: 1 } }),
  A('fam.child.abroad', [52, 70], 0.06, '자녀가 해외 근무를 떠나 통화가 안부의 전부가 되었다.', { relations: -1, happiness: -1 }, '자녀 해외 근무', { when: kd(24, 45), once: true }),
  A('fam.photo', [55, 80], 0.07, '온 가족이 모여 사진관에서 가족사진을 찍었다.', { happiness: 2, relations: 2 }, '가족사진', { when: kd(25, 60), once: true }),
  A('fam.child.split', [52, 72], 0.04, '자녀의 이혼 소식을 조용히 전해 들었다.', { happiness: -2, relations: -1 }, '자녀의 이혼', { when: kd(28, 50), cd: 12 }),
  A('fam.hwangap', [59, 62], 0.35, '환갑 날 가족이 모여 식사했다.', { happiness: 2, relations: 2 }, '환갑', { when: L => mate(L) || kids(L, 20, 60) > 0, once: true }),
  A('fam.birthday', [62, 100], 0.1, '가족들이 모여 생신 상을 차려 주었다.', { happiness: 2, relations: 1 }, '생신 모임', { when: kd(20, 70), cd: 5 }),

  // ───────── 건강 ─────────
  A('hlt.menopause', [45, 54], 0.2, '몸이 달아오르고 밤잠을 설치는 날이 늘었다.', { health: -1, happiness: -1 }, '갱년기 증상', { when: L => L?.sex === 'F', once: true }),
  C('hlt.menopause.clinic', [47, 56], 0.12, '갱년기 증상이 길어져 병원 진료를 받을지 생각했다.', '어떻게 할까?', '갱년기 진료',
    [['산부인과 진료를 받는다', { health: 1, wealth: -1 }, '검사 후 증상에 맞는 치료 방법을 안내받았다.'], ['운동과 식사를 바꾼다', { health: 1, leisure: -1 }, '걷기와 식단 조절로 지켜보기로 했다.'], ['그냥 지나가길 기다린다', { happiness: -1 }, '몇 해를 더 불편한 채로 지냈다.']], { when: L => L?.sex === 'F' }),
  A('hlt.checkup.ok', [45, 75], 0.1, '건강검진 결과표의 수치가 모두 정상 범위였다.', { health: 1, happiness: 1 }, '건강검진 정상', { cd: 5 }),
  A('hlt.bp.pill', [50, 90], 0.12, '혈압약을 매일 아침 같은 시각에 챙겨 먹었다.', { leisure: -1 }, '혈압약 복용', { when: L => cond(L, 'hypertension'), cd: 6 }),
  A('hlt.sugar.note', [50, 90], 0.1, '혈당 수치를 적는 수첩이 어느새 한 권을 채웠다.', { leisure: -1 }, '혈당 관리', { when: L => cond(L, 'diabetes'), cd: 6, issues: { medical: 1 } }),
  A('hlt.knee', [55, 88], 0.1, '무릎이 아파 계단 대신 승강기를 찾게 되었다.', { health: -1, leisure: -1 }, '무릎 통증', { when: L => cond(L, 'arthritis'), cd: 6 }),
  C('hlt.knee.op', [60, 82], 0.08, '무릎 통증이 심해 의사가 인공관절 수술을 설명했다.', '어떻게 할까?', '무릎 치료 선택',
    [['수술을 받는다', { health: 2, leisure: -2, wealth: -2 }, '몇 주 입원하고 재활 치료를 받으며 걸음 연습을 했다.'], ['주사와 운동으로 간다', { leisure: -1 }, '정기 주사와 근력 운동으로 통증을 달랬다.']], { when: L => cond(L, 'arthritis'), src: ['R02'] }),
  A('hlt.sleep', [50, 88], 0.1, '새벽에 자주 깨어 아침이 길게 느껴졌다.', { health: -1, happiness: -1 }, '수면 변화', { cd: 5 }),
  C('hlt.implant', [55, 80], 0.1, '치과에서 어금니 임플란트 견적을 받았다.', '어떻게 할까?', '치아 치료 선택',
    [['임플란트를 한다', { health: 1, wealth: -3 }, '석 달에 걸쳐 시술을 받고 다시 질긴 음식을 먹게 되었다.'], ['틀니를 맞춘다', { wealth: -1 }, '비용이 적게 드는 틀니에 적응하는 데 몇 주가 걸렸다.'], ['당분간 미룬다', { wealth: 1, health: -1 }, '한쪽으로만 씹는 습관이 생겼다.']], { src: ['note: 2016년부터 65세 이상 임플란트 건보 적용 대상 확대'] }),
  A('hlt.eye.test', [60, 85], 0.08, '눈이 뿌옇다는 말에 안과에서 검사를 받았다.', { leisure: -1 }, '안과 검사', { cd: 6 }),
  A('hlt.cataract', [62, 88], 0.06, '백내장 수술을 받고 나니 간판 글씨가 또렷하게 보였다.', { health: 1, happiness: 1 }, '백내장 수술', { once: true }),
  A('hlt.fall', [65, 92], 0.05, '욕실 앞에서 미끄러져 며칠 누워 지냈다.', { health: -2, leisure: -1 }, '낙상', { cd: 8, issues: { medical: 2 } }),
  A('hlt.ward', [55, 92], 0.05, '입원 병동에서 며칠을 보냈다. 퇴원하던 날은 맑았다.', { health: -1, wealth: -1 }, '입원', { cd: 6, issues: { medical: 2 }, sensitive: 'illness' }),
  C('hlt.memory', [58, 85], 0.08, '이름이 바로 떠오르지 않는 일이 늘어 걱정이 되었다.', '어떻게 할까?', '기억 걱정',
    [['선별검사를 받는다', { happiness: -1, health: 1 }, '검사 결과는 정상 범위였고 1년 뒤 다시 확인하기로 했다.'], ['조금 더 지켜본다', { leisure: -1 }, '메모 습관을 늘리며 지냈다.']], { cd: 10, once: false }),
  A('hlt.hearing', [60, 90], 0.08, '이비인후과에서 청력 검사를 받고 보청기를 맞췄다.', { relations: 1 }, '청력 보조', { once: true, issues: { medical: 1 } }),
  A('hlt.walk', [50, 85], 0.12, '아침마다 천변을 걷는 것이 하루의 시작이 되었다.', { health: 1, happiness: 1 }, '아침 걷기', { cd: 6 }),
  A('hlt.smoke.clinic', [50, 70], 0.08, '보건소 금연 클리닉에 등록하고 상담을 받았다.', { health: 1, happiness: -1 }, '금연 상담', { when: L => (L?.health?.smoker ?? 0) > 0, cd: 6 }),
  A('hlt.mood', [50, 82], 0.08, '기분이 가라앉는 날이 길어져 상담을 받았다.', { happiness: 1 }, '우울감 상담', { when: L => cond(L, 'depression'), cd: 6, issues: { medical: 1 } }),
  A('hlt.prostate', [58, 82], 0.07, '비뇨기과에서 전립선 검사를 받았다.', { leisure: -1 }, '전립선 검사', { when: L => L?.sex === 'M', cd: 8 }),
  A('hlt.bone', [52, 82], 0.08, '골밀도 검사에서 뼈가 약해졌다는 말을 들었다.', { health: -1 }, '골밀도 저하', { when: L => L?.sex === 'F', once: true, issues: { medical: 1 } }),
  A('hlt.supplement', [52, 85], 0.08, '자녀가 보내 준 영양제가 식탁 한쪽에 쌓였다.', { relations: 1 }, '자녀의 영양제', { when: kd(22, 60), cd: 6 }),
  A('hlt.flu', [62, 92], 0.1, '보건소에서 독감 예방접종을 받았다.', { health: 1 }, '독감 예방접종', { cd: 3 }),

  // ───────── 부부 ─────────
  A('mar.retire.home', [58, 72], 0.1, '부부가 하루 종일 집에서 보내며 서로의 습관을 알아 갔다.', { leisure: 1 }, '은퇴 후 부부의 시간', { when: and(mate, L => !working(L)), once: true }),
  A('mar.walk', [58, 88], 0.1, '부부가 저녁마다 동네를 한 바퀴씩 걸었다.', { health: 1, relations: 2 }, '부부 산책', { when: mate, cd: 6 }),
  C('mar.trip', [55, 78], 0.1, '부부가 함께 갈 여행을 이야기했다.', '어떻게 할까?', '부부 여행',
    [['오래 다녀온다', { happiness: 3, wealth: -2, leisure: 2 }, '열흘 일정으로 처음 가 보는 도시를 다녀왔다.'], ['가까운 곳으로 간다', { happiness: 2, wealth: -1 }, '당일치기 온천과 시장을 돌았다.'], ['미룬다', { wealth: 1, happiness: -1 }, '다음 해로 미룬 일정은 쉽게 잡히지 않았다.']], { when: L => mate(L) && wealth(L) > 40, once: false, cd: 8 }),
  A('mar.chores', [50, 72], 0.08, '집안일 분담을 두고 부부가 오래 이야기를 나누었다.', { relations: 1 }, '집안일 분담', { when: mate, cd: 8 }),
  A('mar.apart', [52, 72], 0.04, '부부가 방과 생활 시간을 따로 두기로 합의했다.', { relations: -1, leisure: 2 }, '따로 지내는 합의', { when: mate, once: true, src: ['note: 졸혼 공식 통계 없음, 황혼이혼 증가 맥락(통계청 혼인이혼통계)'] }),
  A('mar.ward', [60, 88], 0.07, '배우자의 병실 보호자 침대에서 며칠 밤을 지냈다.', { health: -1, relations: 1 }, '배우자 병실', { when: mate, cd: 6, sensitive: 'illness', issues: { care: 2 } }),
  A('mar.anniv', [50, 80], 0.1, '결혼기념일에 부부가 소박한 식사를 했다.', { happiness: 2, relations: 1 }, '결혼기념일', { when: L => mate(L) && F(L).marriedYear != null && L.year - F(L).marriedYear >= 25, cd: 8 }),
  A('mar.widow.paper', [60, 92], 0.1, '사별 후 이름을 바꿔야 하는 서류를 하나씩 처리했다.', { happiness: -2, leisure: -1 }, '사별 후 서류', { when: widowed, once: true, sensitive: 'death' }),
  A('mar.widow.lunch', [60, 92], 0.08, '혼자 지내는 친구들과 점심 모임이 생겼다.', { relations: 2, happiness: 1 }, '혼자 사는 이들의 모임', { when: widowed, cd: 8 }),

  // ───────── 사회 활동 ─────────
  A('soc.alumni', [45, 72], 0.12, '동창 모임에서 서로의 안부를 길게 나누었다.', { relations: 2, happiness: 1 }, '동창 모임', { cd: 4 }),
  A('soc.hometown', [48, 78], 0.08, '고향 향우회 총회에 다녀왔다.', { relations: 2 }, '향우회', { cd: 6 }),
  A('soc.hike', [50, 78], 0.12, '친구들과 주말마다 산행을 이어 갔다.', { health: 1, relations: 1 }, '주말 등산', { cd: 6 }),
  A('soc.center', [65, 92], 0.1, '경로당에서 이웃들과 점심을 함께 먹었다.', { relations: 2 }, '경로당', { cd: 6 }),
  A('soc.welfare', [62, 88], 0.08, '복지관 요가 수업에 등록했다.', { health: 1, relations: 1 }, '복지관 수업', { cd: 8 }),
  C('soc.volunteer', [55, 78], 0.08, '지역 복지시설에서 봉사자를 모집한다는 안내를 보았다.', '어떻게 할까?', '봉사 활동',
    [['정기 봉사에 참여한다', { happiness: 2, relations: 2, leisure: -1 }, '매주 한 번 급식 봉사에 나가기 시작했다.'], ['가끔 일손만 돕는다', { happiness: 1, relations: 1 }, '행사가 있는 날에만 일손을 보탰다.']], { once: false, cd: 12 }),
  A('soc.faith', [50, 90], 0.1, '종교 모임에서 오래 알던 이웃들과 안부를 나누었다.', { relations: 2, happiness: 1 }, '종교 모임', { cd: 5 }),
  A('soc.garden', [55, 85], 0.1, '주말농장 텃밭에 상추와 고추를 심었다.', { health: 1, happiness: 1 }, '텃밭 가꾸기', { cd: 4 }),
  C('soc.digital', [58, 80], 0.1, '주민센터에서 스마트폰 기초 강좌 수강생을 모집했다.', '어떻게 할까?', '스마트폰 배우기',
    [['강좌를 듣는다', { intellect: 2, relations: 1 }, '교실에서 사진 보내는 법과 길찾기를 익혔다.'], ['가족에게 맡긴다', { leisure: 1 }, '필요한 기능만 가족이 설정해 주었다.']], { years: [2012, 2100], src: ['note: 스마트폰 보급 2010년대'] }),
  A('soc.kiosk', [62, 88], 0.08, '무인 주문기 앞에서 직원에게 사용법을 물어 주문했다.', { happiness: -1 }, '무인 주문기', { years: [2019, 2100], cd: 6, issues: { tech: 2 } }),
  A('soc.class', [55, 82], 0.08, '평생학습관에서 서예 강좌를 들었다.', { intellect: 1, happiness: 1 }, '평생학습 수강', { years: [1996, 2100], cd: 6 }),
  A('soc.choir', [55, 82], 0.06, '동네 합창단에 들어가 주 1회 연습에 나갔다.', { happiness: 2, relations: 2 }, '동네 합창단', { once: true }),
  A('soc.bus', [65, 92], 0.08, '어르신 무료 승차 혜택으로 먼 도시까지 다녀왔다.', { leisure: 2, happiness: 1 }, '무료 승차', { cd: 6 }),

  // ───────── 경제 ─────────
  A('eco.pension.first', [60, 66], 0.2, '국민연금 첫 수령일, 통장에 연금이 들어온 것을 확인했다.', { wealth: 1, happiness: 1 }, '첫 연금 수령', { when: L => (L?.aging?.pensionMonthly ?? 0) > 0, once: true, src: ['R07'] }),
  A('eco.pension.none', [62, 75], 0.08, '받을 연금이 적어 생활비 계산이 빠듯했다.', { wealth: -1, happiness: -1 }, '적은 연금', { when: L => (L?.aging?.pensionMonthly ?? 0) === 0, cd: 6, issues: { living: 2 }, src: ['R07'] }),
  C('eco.home.annuity', [58, 78], 0.08, '주택연금 설명회에 다녀와 자료를 챙겨 왔다.', '어떻게 할까?', '주택연금 검토',
    [['신청을 알아본다', { wealth: 2 }, '살던 집에 살며 매달 연금을 받는 조건을 상담했다.'], ['그대로 둔다', { happiness: 1 }, '집은 물려줄 몫으로 남겨 두기로 했다.']], { when: owned, years: [2007, 2100], src: ['note: 한국주택금융공사 주택연금 2007년 도입'] }),
  A('eco.calc', [55, 72], 0.08, '노후 자금을 계산해 보니 모자라는 해가 보였다.', { wealth: -1, happiness: -1 }, '노후 자금 계산', { when: L => wealth(L) < 60, cd: 8, issues: { living: 1 } }),
  A('eco.insurance', [50, 72], 0.07, '보험 증권을 모두 꺼내 보장 내용을 정리했다.', { intellect: 1 }, '보험 점검', { once: true }),
  C('eco.guarantee', [55, 72], 0.06, '자녀가 대출 보증을 서 달라고 부탁했다.', '어떻게 할까?', '자녀 대출 보증 요청',
    [['보증을 선다', { wealth: -3, relations: 2 }, '보증 한도를 정해 서명했다.'], ['정중히 거절한다', { relations: -1, wealth: 1 }, '다른 방법을 같이 찾아보자고 말했다.']], { when: kd(25, 45), once: false, cd: 12 }),
  A('eco.tax', [58, 82], 0.05, '증여·상속 상담을 하러 세무사 사무실을 찾았다.', { intellect: 1 }, '상속 상담', { when: L => owned(L) && wealth(L) > 60, once: true }),
  A('eco.claim', [60, 88], 0.08, '병원비 영수증을 모아 보험금을 청구했다.', { wealth: 1, leisure: -1 }, '병원비 청구', { cd: 4, issues: { medical: 1 } }),

  // ───────── 삶의 정리 ─────────
  C('end.will', [60, 85], 0.06, '남길 재산과 당부를 정리할 때가 되었다고 느꼈다.', '어떻게 할까?', '유언 준비',
    [['유언장을 작성한다', { happiness: 1, relations: 1, wealth: -1 }, '공증 사무실에서 유언장을 작성해 두었다.'], ['가족에게 말로 전한다', { relations: 2 }, '가족이 모인 자리에서 생각을 이야기했다.'], ['아직 미룬다', { leisure: 1 }, '서류철만 서랍에 넣어 두었다.']], { when: L => owned(L) || wealth(L) > 50 }),
  A('end.funeral', [62, 88], 0.06, '상조 상품과 장례 방식을 알아보고 가족과 이야기했다.', { relations: 1 }, '장례 준비', { once: true, sensitive: 'death' }),
  C('end.grave', [60, 85], 0.06, '장묘 방식을 가족과 정해 두기로 했다.', '어떻게 할까?', '장묘 방식',
    [['봉안당을 정한다', { wealth: -1 }, '가까운 봉안당 자리를 예약했다.'], ['수목장을 정한다', { happiness: 1, wealth: -1 }, '숲에서 마지막을 맞는 방식을 택했다.'], ['정하지 않고 둔다', { leisure: 1 }, '자녀에게 뜻을 전하되 결정은 맡기기로 했다.']], { when: kd(20, 70) }),
  A('end.photos', [58, 88], 0.1, '낡은 사진첩을 펼쳐 놓고 사진을 추려 정리했다.', { happiness: 1, relations: 1 }, '사진 정리', { cd: 8 }),
  A('end.friend.funeral', [55, 92], 0.12, '오랜 친구의 부고를 들었다. 장례식장에 다녀왔다.', { happiness: -2, relations: -1 }, '친구의 부고', { cd: 3, sensitive: 'death' }),
  C('end.directive', [62, 88], 0.06, '병원에서 연명의료 계획서 작성에 대한 설명을 들었다.', '어떻게 할까?', '연명의료 의향',
    [['의향서를 작성한다', { happiness: 1, relations: 1 }, '가족에게 내용을 알리고 서류를 제출했다.'], ['시간을 두고 생각한다', { leisure: 1 }, '안내 책자를 받아 와 가족과 읽어 보기로 했다.']], { years: [2018, 2100], src: ['note: 연명의료결정법 2018년 시행'] }),
  A('end.record', [60, 90], 0.08, '진료 기록과 복용 약 목록을 수첩에 따로 정리해 두었다.', { health: 1, intellect: 1 }, '건강 기록 정리', { once: true }),
  A('end.declutter', [60, 88], 0.08, '쓰지 않는 물건을 추려 이웃에게 나누어 주었다.', { relations: 1, leisure: 1 }, '물건 정리', { cd: 8 }),
  A('end.note', [60, 90], 0.07, '자녀에게 남길 말을 공책에 몇 줄씩 적어 두었다.', { happiness: 1, relations: 1 }, '남길 말 적기', { when: kd(20, 70), once: true }),
  A('end.neighbor', [60, 92], 0.07, '오래 사귀던 이웃이 이사 간 뒤로 안부가 뜸해졌다.', { relations: -1 }, '이웃과 멀어짐', { cd: 8 }),
];
