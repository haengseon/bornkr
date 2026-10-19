// 콘텐츠 C — 중년기(35~54세) 우연 사건. 형식: ARCHITECTURE §8, 카탈로그: GDD §9.4 '콘텐츠 C'(mid 45 + 추가 1).
// 톤: 씁쓸함을 덤덤하게. 직급·재산으로 승패를 가르지 않는다. 돌봄·질병·장애는 시간·비용·접근성의 문제로 쓴다.
// 정답/오답 없음 — 선택마다 얻는 것과 잃는 것. 시대 구분은 years·era()로. 확률 p는 GDD §9.1(단발 .05~.25, 반복 .03~.10 + cooldown).
// late.js가 같은 보조 함수를 가져다 쓴다(named export를 지우지 말 것).
import { era, pk } from './early.js';

export { era, pk };

// ── 조건 보조(성긴 L에서도 throw 하지 않는다. 항상 boolean) ──
export const kids = (L, lo, hi) => (L?.family?.children ?? []).filter(c => c && c.alive !== false && L.year - c.birthYear >= lo && L.year - c.birthYear <= hi).length;
export const working = L => L?.job?.status === 'employed' || L?.job?.status === 'self';
export const isEmployed = L => L?.job?.status === 'employed';
export const isRegular = L => L?.job?.status === 'employed' && !!L?.job?.regular;
export const selfEmp = L => L?.job?.status === 'self';
export const owned = L => !!L?.home?.owned;
export const wealth = L => L?.stats?.wealth ?? 50;
export const cond = (L, k) => !!L?.health?.conditions?.some(c => c.key === k && c.active);
export const caring = L => !!L?.family?.caringFor;
export const parents = L => [L?.family?.parents?.father, L?.family?.parents?.mother].filter(Boolean);
const marriedNow = L => !!L?.family?.married && !!L?.family?.partner;
// 엔진이 자녀 장애를 기록하지 않아(child.disability 없음) 시드·출생연도에서 결정적으로 약 2.5%를 정한다 [추정, R01.S5]. 엔진이 필드를 넣으면 그 값을 쓴다.
const childDis = L => (L?.family?.children ?? []).some(c => c && c.alive !== false
  && (c.disability != null ? !!c.disability : ((((L.seed ?? 0) >>> 0) ^ Math.imul(c.birthYear | 0, 2654435761)) >>> 0) % 1000 < 25));
// 폭염 해: 과거는 기록상 더웠던 해, 2026년 이후는 시드·연도로 결정적으로 약 45%(기후 전망, 난수 없이) [R08.S25, 추정]
const HEAT = [1994, 2013, 2016, 2018, 2024, 2025];
export const heat = L => {
  const y = L?.year ?? 0;
  return HEAT.includes(y) || (y >= 2026 && (((((L?.seed ?? 0) >>> 0) ^ Math.imul(y, 2654435761)) >>> 0) % 100) < 45);
};

export default [
  // ───────── 일터 ─────────
  {
    id: 'mid.promotion.transfer', ages: [35, 50], p: 0.08, once: true, when: isRegular, tags: ['job'],
    text: '승진 명단에 올랐다. 조건은 지방 발령이었다.',
    reason: '지방 발령을 조건으로 한 승진',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'go', label: '발령을 받아들인다', fx: { stats: { wealth: 3, relations: -3, leisure: -2 }, issues: { region: 3 } }, result: '월요일 새벽 기차가 생활이 되었다.' },
        { id: 'stay', label: '거절한다', fx: { stats: { relations: 2, leisure: 1, wealth: -1 }, issues: { job: 3 } }, result: '가족은 그대로였고, 승진 명단에서는 이름이 빠졌다.' },
      ],
      default: 'go',
    },
  },
  {
    id: 'mid.promotion.stall', ages: [38, 54], p: 0.08, cooldown: 5, when: isRegular, tags: ['job'],
    text: ['승진 심사에서 이름이 빠졌다. 책상은 그대로였다.', '같은 직급으로 몇 해째 같은 자리에 앉아 있었다.', '후배 이름이 먼저 명단에 올라 있었다.', '인사 발표가 난 날, 점심을 말없이 먹었다.'],
    fx: { stats: { happiness: -2, wealth: -1 }, issues: { job: 2, fairness: 2 } },
    reason: '승진 정체',
  },
  {
    id: 'mid.layoff.rumor', ages: [35, 54], p: L => ([1997, 1998, 1999].includes(L?.year) ? 0.25 : [2008, 2009].includes(L?.year) ? 0.15 : 0.08), cooldown: 4, tags: ['job'],
    when: L => isRegular(L) && !L?.job?.public,
    text: era([
      [1960, ['구조조정 소문이 돌았다. 점심시간이 조용해졌다.', '부서 통폐합 소문이 돌았다. 다들 말을 아꼈다.', '명단이 돈다는 말에 서류함 정리를 시작했다.']],
      [1997, ['외환위기 뒤 부서마다 명단 소문이 돌았다.', '회사가 어렵다는 소문에 회식이 사라졌다.', '신규 채용 공고가 사라지고 소문만 늘었다.']],
      [2000, ['구조조정 소문이 돌았다. 점심시간이 조용해졌다.', '부서 통폐합 소문이 돌았다. 다들 말을 아꼈다.', '명단이 돈다는 말에 서류함 정리를 시작했다.']],
      [2008, ['금융위기 여파로 구조조정 소문이 돌았다.', '세계 금융위기 뒤 채용부터 멈췄다는 소문이 돌았다.', '출장비 결재부터 막혔다는 소문이 돌았다.']],
      [2010, ['구조조정 소문이 돌았다. 점심시간이 조용해졌다.', '부서 통폐합 소문이 돌았다. 다들 말을 아꼈다.', '명단이 돈다는 말에 서류함 정리를 시작했다.']],
    ]),
    fx: { stats: { happiness: -2, relations: -1 }, issues: { job: 4 } },
    reason: '구조조정 소문', src: ['R04.S8'],
  },
  {
    id: 'mid.weekend.work', ages: [35, 50], p: 0.05, cooldown: 4, when: isEmployed, tags: ['job'],
    text: era([[1960, ['토요일 근무 뒤에 일요일 출근 연락까지 왔다.', '쉬는 날 아침, 일이 밀렸다는 연락이 왔다.']], [2004, ['이번 주말에도 출근해 달라는 연락이 왔다.', '주말 당직표에 이름이 또 올라 있었다.']]]),
    reason: '주말 출근 요청',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'go', label: '출근한다', fx: { stats: { wealth: 2, leisure: -3, relations: -2 } }, result: '야근 수당이 붙었고, 아이 행사는 사진으로 보았다.', hint: '거절하기 어려운 요청' },
        { id: 'family', label: '가족과 보낸다', fx: { stats: { relations: 3, leisure: 2, wealth: -1 }, issues: { job: 2 } }, result: '약속은 지켰고, 월요일 아침 눈치는 조금 따가웠다.' },
      ],
      default: 'go',
    },
  },
  {
    id: 'mid.younger.boss', ages: [40, 54], p: 0.08, once: true, when: isEmployed, tags: ['job'],
    text: '나이 어린 상사가 왔다. 첫 회의에서 서로 존댓말을 골랐다.',
    fx: { stats: { happiness: -1, relations: 1 }, issues: { fairness: 2 } },
    reason: '나이 어린 상사',
  },
  {
    id: 'mid.ai.tool', ages: [35, 54], years: [2023, 2100], p: 0.1, once: true, tags: ['job'],
    when: L => working(L) && ['mid', 'high'].includes(L?.job?.ai),
    text: '업무에 AI 도구가 들어왔다. 교육 일정이 공지되었다.',
    reason: '업무에 AI 도입',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'learn', label: '새 도구를 배운다', fx: { stats: { intellect: 2, wealth: 2, leisure: -1 }, issues: { tech: 2 } }, result: '퇴근 뒤 사용법을 익혔고, 보고서 시간이 줄었다.' },
        { id: 'hold', label: '쓰지 않고 버틴다', fx: { stats: { happiness: 1, leisure: 1, wealth: -2 }, issues: { tech: 4, job: 3 } }, result: '익숙한 방식을 지켰고, 옆자리의 속도가 눈에 들어왔다.' },
      ],
      default: 'learn',
    },
  },
  {
    id: 'mid.reskill', ages: [38, 54], p: L => (['seeking', 'inactive'].includes(L?.job?.status) ? 0.12 : 0.04), once: true, tags: ['job'],
    text: '국비 재교육 과정 모집 공고가 눈에 들어왔다.',
    reason: '국비 재교육 과정',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'enroll', label: '등록한다', fx: { stats: { intellect: 1, leisure: -3, wealth: -1 }, issues: { job: -3 } }, result: '낮에는 수업, 밤에는 과제였고 수료증이 서랍에 들어갔다.' },
        { id: 'later', label: '다음으로 미룬다', fx: { stats: { leisure: 1 }, issues: { job: 2 } }, result: '공고문은 북마크 목록 아래로 내려갔다.', hint: '시간·비용 때문에 흔한 선택' },
      ],
      default: 'later',
    },
  },
  {
    id: 'mid.side.job', ages: [35, 50], p: 0.04, once: true, when: isEmployed,
    text: '퇴근 뒤에 할 수 있는 부업 이야기를 들었다.',
    reason: '부업 제안',
    choice: {
      prompt: '해 볼까?',
      options: [
        { id: 'do', label: '해 본다', fx: { stats: { wealth: 3, leisure: -4, health: -1 }, money: { assets: 300 } }, result: '월 몇십만 원이 더 들어왔고, 저녁은 짧아졌다.' },
        { id: 'skip', label: '안 한다', fx: { stats: { leisure: 2, health: 1 } }, result: '저녁 시간을 지켰고, 잔액은 그대로였다.' },
      ],
      default: 'skip',
    },
  },
  {
    id: 'mid.honorary.list', ages: [50, 54], p: 0.08, once: true, when: isRegular, tags: ['job'],
    text: '명예퇴직 명단 소문이 점심시간에 돌았다.',
    fx: { stats: { happiness: -2, relations: -1 }, issues: { job: 4 } },
    reason: '명예퇴직 명단 소문', src: ['R04.S7'],
  },

  // ───────── 자영업 ─────────
  {
    id: 'mid.shop.rent', ages: [35, 54], p: 0.15, cooldown: 4, when: selfEmp, tags: ['biz'],
    text: ['가게 임대료가 올랐다. 문자 한 통으로 알려 왔다.', '건물주의 새 임대 조건 안내문이 문에 붙어 있었다.', '임대 계약 갱신을 앞두고 건물주의 연락이 왔다.'],
    reason: '가게 임대료 인상',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'stay', label: '버틴다', fx: { stats: { wealth: -3, happiness: -1 }, money: { assets: -600 } }, result: '남는 돈이 한 달에 하루치씩 줄어들었다.' },
        { id: 'move', label: '자리를 옮긴다', fx: { stats: { wealth: -2, relations: -3, leisure: -2 }, money: { assets: -800 } }, result: '단골은 절반쯤 새 가게를 찾아왔다.' },
        { id: 'close', label: '접는다', fx: { stats: { happiness: -2, leisure: 3 } }, do: (L, act) => act.closeBusiness(), result: '간판을 내리던 날, 옆 가게가 커피를 건넸다.' },
      ],
      default: 'stay',
    },
  },
  {
    id: 'mid.delivery.fee', ages: [35, 54], years: [2015, 2100], p: 0.12, cooldown: 4, when: selfEmp, tags: ['biz'],
    text: ['배달 앱 수수료 고지서가 올랐다. 남는 건 줄었다.', '배달 앱 정산서의 수수료 칸이 한 줄 늘었다.', '배달 주문은 늘었지만 정산 금액은 그대로였다.'],
    fx: { stats: { wealth: -2, happiness: -1 }, issues: { job: 3 } },
    reason: '배달 앱 수수료',
  },
  {
    id: 'mid.covid.limit', ages: [35, 54], years: [2020, 2021], p: 0.6, once: true, when: selfEmp,
    text: '영업시간 제한으로 저녁 장사가 막혔다.',
    fx: { stats: { wealth: -4, happiness: -3 }, issues: { job: 4, living: 2 } },
    reason: '영업시간 제한',
  },
  {
    id: 'mid.client.bankrupt', ages: [40, 54], p: 0.05, once: true, when: selfEmp, tags: ['biz'],
    text: ['거래처가 부도났다. 받을 대금이 어음 한 장으로 남았다.', '거래처가 문을 닫았다. 받을 대금은 장부에만 남았다.'],
    fx: { stats: { wealth: -4, happiness: -3 }, issues: { job: 5 }, money: { assets: -500 } },
    reason: '거래처 부도',
  },

  // ───────── 자녀 ─────────
  {
    id: 'mid.child.hakwon', ages: [38, 52], p: 0.12, cooldown: 5, tags: ['tutoring'], src: ['R03.S1'],
    when: L => kids(L, 10, 18) > 0,
    text: ['자녀 학원비가 생활비보다 먼저 빠져나갔다.', '자녀가 학원 하나를 더 다니고 싶다고 했다.', '학원 상담 문자에 월 수강료표가 붙어 왔다.'],
    reason: '자녀 학원비',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'more', label: '학원을 늘린다', fx: { stats: { happiness: 2, wealth: -4, leisure: -2 }, issues: { edu: 4 }, money: { assets: -500 } }, result: '학원 차량이 하나 더 집 앞에 섰다.' },
        { id: 'keep', label: '지금대로 둔다', fx: { stats: { wealth: -2, leisure: -1 }, issues: { edu: 2 } }, result: '지난달과 같은 금액이 같은 날 빠져나갔다.' },
        { id: 'less', label: '줄인다', fx: { stats: { wealth: 1, relations: -1, happiness: -1 }, issues: { edu: 2 } }, result: '남는 저녁이 생겼고, 아이는 말이 없었다.' },
      ],
      default: 'keep',
    },
  },
  {
    id: 'mid.child.exam', ages: [43, 54], p: 0.45, cooldown: 3,
    when: L => kids(L, 18, 18) > 0,
    text: era([
      [1990, ['자녀의 수능 날, 교문 앞에 오래 서 있었다.', '수능 날 아침, 자녀에게 도시락을 건넸다.', '수능 날, 자녀가 나선 뒤 집 안이 유난히 조용했다.']],
      [2020, ['마스크를 쓴 자녀를 수능 시험장에 내려 주었다.', '방역 지침에 따라 교문 앞에서 자녀와 짧게 인사했다.']],
      [2022, ['자녀의 수능 날, 교문 앞에 오래 서 있었다.', '수능 날 아침, 자녀에게 도시락을 건넸다.', '수능 날, 자녀가 나선 뒤 집 안이 유난히 조용했다.']],
    ]),
    fx: { stats: { happiness: -1, relations: 1 }, issues: { edu: 3 } },
    reason: '자녀의 시험 날',
  },
  {
    id: 'mid.child.tuition', ages: [44, 54], p: 0.3, cooldown: 4, src: ['R03.S20', 'R03.S21'],
    when: L => kids(L, 19, 23) > 0,
    text: ['자녀 등록금 고지서가 나왔다. 한 학기 금액이 컸다.', '자녀 등록금 납부 기간이 다가왔다. 통장을 먼저 열어 보았다.', '등록금 고지서를 확인했다.'],
    reason: '자녀 등록금',
    choice: {
      prompt: '어떻게 낼까?',
      options: [
        { id: 'loan', label: '대출을 받는다', fx: { stats: { wealth: -1, happiness: -2, leisure: -1 }, issues: { edu: 3 }, money: { debt: 700 } }, result: '대출 서류에 이름을 쓰는 일이 학기마다 반복되었다.' },
        { id: 'savings', label: '저축을 깬다', fx: { stats: { wealth: -3, happiness: 1, leisure: 1 }, money: { assets: -700 } }, result: '적금 만기 날짜가 앞당겨졌다.' },
        { id: 'childloan', label: '자녀가 학자금 대출', fx: { stats: { wealth: 2, relations: -3 }, issues: { edu: 4 } }, result: '아이가 학자금 대출 서류에 직접 서명했다.' },
      ],
      default: 'savings',
    },
  },
  {
    id: 'mid.teen.talk', ages: [40, 50], p: 0.1, cooldown: 4,
    when: L => kids(L, 13, 17) > 0,
    text: ['사춘기 아이가 방문을 닫는 날이 늘었다.', '사춘기 자녀의 방문 앞에서 몇 번 발을 멈췄다.', '아이가 식탁에서 대답 대신 고개만 끄덕였다.'],
    reason: '사춘기 자녀와의 대화',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'ask', label: '먼저 말을 건다', fx: { stats: { relations: 3, happiness: -2, leisure: -2 } }, result: '대답은 짧았지만 문틈은 조금 열려 있었다.' },
        { id: 'wait', label: '기다려 준다', fx: { stats: { happiness: 2, leisure: 1, relations: -1 } }, result: '말 없는 저녁이 몇 주 이어졌고, 아이가 먼저 물었다.' },
      ],
      default: 'wait',
    },
  },
  {
    id: 'mid.child.disability', ages: [35, 54], p: 0.15, once: true, sensitive: 'illness', when: childDis,
    text: L => ((L?.birth?.healthAccess ?? 60) >= 60 ? '자녀의 장애 지원 신청서를 냈다. 심사까지 몇 주가 걸렸다.' : '자녀의 장애 지원 신청서를 냈다. 순서는 몇 달 뒤였다.'),
    fx: { stats: { leisure: -3, wealth: -2, happiness: -1 }, issues: { care: 6, medical: 3 } },
    reason: '자녀 지원 신청과 대기',
  },
  {
    id: 'mid.school.district', ages: [38, 48], p: 0.12, once: true,
    when: L => !owned(L) && kids(L, 7, 15) > 0,
    text: '아이 학교 배정 때문에 이사 이야기가 나왔다.',
    reason: '학군 따라 이사',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'go', label: '학군지로 이사한다', fx: { stats: { happiness: 2, wealth: -3, relations: -2, leisure: -2 }, issues: { housing: 3 } }, do: (L, act) => act.move(L?.home?.tenure === 'monthly' ? 'monthly' : 'jeonse', { reason: '학군' }), result: '이삿짐 트럭이 떠난 자리에 아이의 키 눈금이 남았다.' },
        { id: 'stay', label: '지금 집에 남는다', fx: { stats: { relations: 2, wealth: 1, leisure: 1, happiness: -1 }, issues: { edu: 4 } }, result: '아이는 친구들과 같은 학교에 남았다.', hint: '전학 부담 때문에 흔한 선택' },
      ],
      default: 'stay',
    },
  },

  // ───────── 부모·돌봄 ─────────
  {
    id: 'mid.parent.dementia', ages: [40, 54], p: 0.05, once: true, sensitive: 'illness',
    when: L => parents(L).some(p => p.alive && p.age >= 68),
    text: '부모님이 치매 진단을 받았다는 연락이 왔다.',
    fx: { stats: { happiness: -3, relations: -1, leisure: -1 }, issues: { care: 6, medical: 3 } },
    reason: '부모님의 치매 진단',
  },
  {
    id: 'mid.parent.basic', ages: [40, 54], years: [2014, 2100], p: 0.1, once: true, src: ['R06.S37', 'R07.S10'],
    when: L => parents(L).some(p => p.alive && p.age >= 66),
    text: era([[2014, '부모님이 기초연금을 처음 받았다. 드리던 용돈이 조금 줄었다.'], [2016, '부모님이 기초연금으로 병원비를 낸다고 했다.']]),
    fx: { stats: { wealth: 1, relations: 1 }, issues: { care: -2 } },
    reason: '부모님의 기초연금',
  },
  {
    id: 'mid.hospital.night', ages: [40, 54], p: 0.3, cooldown: 5, when: caring, tags: ['care'],
    text: ['병원 보호자 침대에서 밤을 보냈다. 아침이 길었다.', '보호자 침대는 짧았고, 밤은 길었다.', '병실 복도 불빛 아래서 새벽을 보냈다.', '간병 교대 시간을 기다리며 밤을 지새웠다.'],
    fx: { stats: { health: -2, leisure: -3, happiness: -2 }, issues: { care: 4 } },
    reason: '병원 보호자 생활',
  },
  {
    id: 'mid.care.split', ages: [40, 54], p: 0.35, once: true, tags: ['care'],
    when: L => caring(L) && (L?.family?.siblings ?? 0) > 0,
    text: '간병비를 형제와 어떻게 나눌지 이야기해야 했다.',
    reason: '형제와 간병비 나누기',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'equal', label: '똑같이 나눈다', fx: { stats: { wealth: -1, relations: -2 } }, result: '계산은 정확했고, 통화는 길었다.' },
        { id: 'means', label: '형편대로 나눈다', fx: { stats: { wealth: -2, relations: 1, happiness: 1 } }, result: '각자의 사정을 말하는 데 하룻밤이 걸렸다.' },
        { id: 'more', label: '내가 더 낸다', fx: { stats: { wealth: -5, relations: 2, happiness: 1 }, money: { assets: -400 } }, result: '말없이 내가 더 맡았고, 형제는 고맙다고 했다.' },
      ],
      default: 'equal',
    },
  },
  {
    id: 'mid.care.leave', ages: [40, 54], years: [2012, 2100], p: 0.3, once: true, tags: ['care'],
    when: L => caring(L) && working(L),
    text: '가족돌봄휴직 제도가 있다는 걸 알게 되었다.',
    reason: '가족돌봄휴직',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'use', label: '휴직을 낸다', fx: { stats: { leisure: 3, wealth: -3, health: 1 } }, do: (L, act) => act.flag('leaveYear', L.year), result: '무급 석 달 동안 병원과 집만 오갔다.' },
        { id: 'skip', label: '쓰지 않는다', fx: { stats: { leisure: -3, health: -2, wealth: 1 } }, result: '휴가를 아껴 쓰며 병원과 일터를 오갔다.', hint: '눈치와 소득 때문에 흔한 선택' },
      ],
      default: 'skip',
    },
  },
  {
    id: 'mid.parent.funeral', ages: [40, 54], p: 0.9, cooldown: 3, sensitive: 'death',
    when: L => parents(L).some(p => p.alive === false && p.deathYear != null && L.year - p.deathYear <= 1),
    text: ['장례식장에서 사흘을 보냈다. 조문객 이름을 하나씩 적었다.', '상복을 입고 사흘 동안 조문객을 맞았다.', '빈소 앞에서 밤을 지새웠다. 영정 속 얼굴을 오래 보았다.'],
    fx: { stats: { happiness: -3, relations: 1, wealth: -2, health: -1 }, money: { assets: -400 } },
    reason: '부모님 장례',
  },
  {
    id: 'mid.inheritance', ages: [45, 54], p: 0.25, once: true,
    when: L => (L?.family?.siblings ?? 0) > 0 && parents(L).length > 0 && parents(L).every(p => p.alive === false),
    text: '부모님이 남긴 것을 형제끼리 정리해야 했다.',
    reason: '상속 정리',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'split', label: '법대로 나눈다', fx: { stats: { wealth: 1, relations: -1 } }, result: '계산기를 두드린 뒤 도장을 찍었다.' },
        { id: 'yield', label: '내 몫을 양보한다', fx: { stats: { relations: 2, wealth: -3, happiness: 1 }, money: { assets: -400 } }, result: '몫을 내려놓자 형제의 통화 기록이 조용해졌다.' },
        { id: 'fight', label: '끝까지 다툰다', fx: { stats: { wealth: 2, relations: -4, happiness: -2 } }, result: '몇 달을 다투었고, 형제 사이에 연락이 끊겼다.' },
      ],
      default: 'split',
    },
  },

  // ───────── 집·돈·계절 ─────────
  {
    id: 'mid.rate.hike', ages: [35, 54], p: L => ([2022, 2023].includes(L?.year) ? 0.5 : 0.06), cooldown: 3, src: ['R05.S7', 'R05.S2'],
    when: L => owned(L) && (L?.money?.debt ?? 0) > 0,
    text: era([
      [1960, ['변동금리 대출의 금리 조정 통지가 왔다.', '대출 이자 변동 안내문이 우편함에 들어 있었다.', '대출 갱신 때 금리가 조금 올랐다.']],
      [2022, ['대출 금리가 또 올랐다. 월 이자가 눈에 띄게 늘었다.', '금리 인상 소식 뒤 대출 이자 알림이 커졌다.', '이자 납부일마다 월급 통장의 잔액이 먼저 줄었다.']],
      [2024, ['변동금리 대출의 금리 조정 통지가 왔다.', '대출 이자 변동 안내문이 우편함에 들어 있었다.', '대출 갱신 때 금리가 조금 올랐다.']],
    ]),
    fx: { stats: { wealth: -3, happiness: -2 }, issues: { housing: 5 } },
    reason: '대출 금리 인상',
  },
  {
    id: 'mid.lottery', ages: [35, 50], years: [1990, 2100], p: 0.07, cooldown: 4, when: L => !owned(L),
    text: ['청약 결과 발표일이었다. 번호는 없었다.', '청약 당첨자 명단에 이름이 없었다. 다음 공고를 저장해 두었다.', '청약 결과 조회 화면에 "미당첨"이라고 떴다.', '당첨자 발표가 났다. 이번에도 내 번호는 없었다.'],
    fx: { stats: { happiness: -1 }, issues: { housing: 3 } },
    reason: '청약 낙첨',
  },
  {
    id: 'mid.home.repair', ages: [40, 54], p: 0.1, cooldown: 5, when: owned,
    text: ['오래된 집 보일러가 멈췄다. 견적이 세 군데에서 왔다.', '베란다 누수로 천장에 얼룩이 번졌다. 수리비가 나왔다.', '낡은 배관을 고치느라 욕실 바닥을 뜯었다.', '겨울을 앞두고 창틀 틈새를 새로 메웠다. 견적이 올랐다.'],
    fx: { stats: { wealth: -2, leisure: -1 }, money: { assets: -400 } },
    reason: '오래된 집 수리',
  },
  {
    id: 'mid.rebuild.vote', ages: [45, 54], p: 0.1, once: true, when: owned,
    text: '재건축 동의서가 우편함에 꽂혀 있었다.',
    reason: '재건축 동의 여부',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'yes', label: '찬성한다', fx: { stats: { wealth: 4, leisure: -1 }, issues: { housing: 2 } }, result: '분담금 계산서를 받고 한동안 계산기를 두드렸다.' },
        { id: 'no', label: '반대한다', fx: { stats: { happiness: 1, leisure: 1, wealth: -2 } }, result: '오래 살아 온 동네가 한동안 그대로 남았다.' },
      ],
      default: 'yes',
    },
  },
  {
    id: 'mid.downsize', ages: [50, 54], p: 0.1, once: true, when: owned,
    text: '청소할 방이 점점 늘었다. 집이 너무 넓게 느껴졌다.',
    reason: '집 줄이기',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'small', label: '집을 줄여 간다', fx: { stats: { leisure: 3, wealth: 2, relations: -2 }, issues: { housing: -3 }, money: { assets: -300 } }, result: '이삿짐의 절반을 내놓자 방 하나가 비었다.' },
        { id: 'hold', label: '지금 집에 산다', fx: { stats: { happiness: 1, relations: 1, wealth: -2, leisure: -1 }, issues: { housing: 2 } }, result: '넓은 집은 그대로였고, 빈방은 창고가 되었다.' },
      ],
      default: 'hold',
    },
  },
  {
    id: 'mid.pension.check', ages: [50, 54], p: 0.12, once: true, src: ['R07.S28'],
    text: L => {
      const n = Math.round(L?.money?.pensionYears ?? 0);
      return n < 5 ? '가입 기간이 짧아 예상 연금액은 한 줄뿐이었다.'
        : n < 15 ? '예상 연금액을 조회했다. 생활비에 닿지 않는 숫자였다.'
        : `가입 ${n}년. 예상 연금액은 생활비의 절반 남짓이었다.`;
    },
    fx: { stats: { happiness: -1, wealth: -1 }, issues: { fairness: 2 } },
    reason: '예상 연금액 조회',
  },
  {
    id: 'mid.heat.bill', ages: [35, 54], years: [1994, 2100], p: L => (heat(L) ? 0.5 : 0), cooldown: 5, src: ['R08.S25'],
    text: era([
      [1960, ['열대야에 선풍기 앞에서 밤을 새웠다.', '열대야에 창문을 열어 둔 채 부채질로 밤을 보냈다.', '한여름 밤, 잠을 설치고 아침을 맞았다.']],
      [2005, ['폭염 달 전기요금 고지서가 평소의 두 배였다.', '에어컨을 켜 둔 달의 전기요금 고지서가 올랐다.', '폭염 달 고지서 앞에서 에어컨 시간을 다시 계산했다.', '무더위가 길어져 전기요금 칸의 숫자가 커졌다.']],
    ]),
    fx: { stats: { wealth: -2, happiness: -1 }, issues: { living: 3 } },
    reason: '폭염과 전기요금',
  },
  {
    id: 'mid.heating.bill', ages: [35, 54], years: [2022, 2023], p: 0.5, once: true, src: ['R08.S30'],
    text: '난방비 고지서를 보고 보일러 온도를 한 칸 내렸다.',
    fx: { stats: { wealth: -2, happiness: -1 }, issues: { living: 4 } },
    reason: '난방비 급등',
  },

  // ───────── 건강·마음 ─────────
  {
    id: 'mid.checkup.retest', ages: [40, 54], p: 0.1, cooldown: 6, tags: ['health'], src: ['R02.S12'],
    text: ['건강검진 결과지에 재검 대상이라고 적혀 있었다.', '검진센터에서 정밀검사를 받아 보라는 전화가 왔다.', '검진 결과 한 항목에 별표가 붙어 있었다.', '재검 예약을 잡는 데 몇 주가 걸렸다.'],
    fx: { stats: { happiness: -2, health: -1 }, issues: { medical: 3 } },
    reason: '건강검진 재검 통지',
  },
  {
    id: 'mid.exercise', ages: [35, 54], p: 0.04, once: true, tags: ['health'],
    text: '새해 첫 주, 헬스장 할인 전단지를 받았다.',
    reason: '운동 시작 여부',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'join', label: '등록한다', fx: { stats: { health: 2, leisure: -2, wealth: -1 } }, do: (L, act) => act.flag('exercise', true), result: '석 달 뒤에도 아침 운동을 하고 있었다.' },
        { id: 'later', label: '다음 달부터', fx: { stats: { leisure: 1, happiness: 1 } }, result: '전단지는 냉장고 자석 아래에서 달을 넘겼다.', hint: '시작이 가장 어려운 일' },
      ],
      default: 'later',
    },
  },
  {
    id: 'mid.quit.smoke', ages: [35, 54], p: 0.15, cooldown: 5, tags: ['health'], when: L => L?.health?.smoker === 1,
    text: ['건강검진 상담에서 금연 이야기가 나왔다.', '금연 클리닉 안내 문자가 검진 결과와 함께 왔다.', '가래가 길어졌다는 말에 담뱃갑을 한참 보았다.'],
    reason: '금연 시도 여부',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'try', label: '끊어 본다', fx: { stats: { health: 4, happiness: -3, wealth: 1 } }, do: (L, act) => act.flag('quitTry', true), result: '첫 주는 길었고, 서랍 속 라이터는 버리지 못했다.' },
        { id: 'later', label: '나중에 하기로', fx: { stats: { happiness: 2, health: -2, wealth: -1 } }, result: '이번 주만 더, 하며 한 갑을 더 샀다.', hint: '혼자 끊기 어려워 흔한 선택' },
      ],
      default: 'later',
    },
  },
  {
    id: 'mid.dinner.drinks', ages: [35, 50], p: 0.05, cooldown: 4, when: isEmployed, tags: ['job'],
    text: ['회식 2차 이야기가 나왔다. 시계는 열 시였다.', '회식 자리에서 2차 장소를 알리는 단톡이 올라왔다.', '시계는 열 시를 넘겼다. 2차 이야기가 다시 나왔다.'],
    reason: '회식 2차',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'go', label: '2차까지 간다', fx: { stats: { relations: 3, health: -2, leisure: -3 } }, result: '노래방 불빛 아래서 윗사람의 애창곡을 들었다.' },
        { id: 'leave', label: '먼저 일어선다', fx: { stats: { health: 1, leisure: 2, relations: -2 } }, result: '인사하고 일어서자 뒷말은 다음 날 아침에 돌았다.' },
      ],
      default: 'go',
    },
  },
  {
    id: 'mid.low.mood', ages: [35, 54], p: 0.08, once: true, sensitive: 'illness', tags: ['pressure'],
    text: '아침에 몸을 일으키는 일이 부쩍 무거웠다.',
    reason: '중년의 무기력',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'counsel', label: '상담을 받는다', fx: { stats: { happiness: 2, wealth: -1, leisure: -1 } }, result: '상담 예약은 몇 주 뒤였고, 첫 시간에 말을 끝까지 했다.', hint: '가장 먼저 닿는 도움' },
        { id: 'talk', label: '가까운 사람에게 말한다', fx: { stats: { relations: 2, happiness: 1 } }, result: '털어놓자 상대도 비슷한 시기를 지나고 있었다.' },
        { id: 'rest', label: '며칠 쉬어 본다', fx: { stats: { leisure: 3, wealth: -2, happiness: 1 } }, result: '휴가를 내고 하루 종일 아무것도 하지 않았다.' },
      ],
      default: 'counsel',
    },
  },

  // ───────── 가족·관계 ─────────
  {
    id: 'mid.couple.silence', ages: [40, 54], p: 0.06, cooldown: 5, when: marriedNow,
    text: ['저녁 식탁에서 오가는 말이 눈에 띄게 줄었다.', '식탁에 마주 앉아서도 휴대폰만 보는 날이 늘었다.', '하루 종일 오간 말이 안부 한 줄뿐이었다.'],
    reason: '부부 사이의 침묵',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'trip', label: '둘이 여행을 간다', fx: { stats: { relations: 2, leisure: 2, wealth: -2 } }, result: '낯선 도시에서 오랜만에 같은 메뉴를 시켰다.' },
        { id: 'talk', label: '이야기를 청한다', fx: { stats: { relations: 2, happiness: 1, leisure: -1 } }, result: '어색한 침묵 끝에 서운했던 일 하나를 꺼냈다.' },
        { id: 'keep', label: '그대로 둔다', fx: { stats: { happiness: -2, relations: -2, leisure: 1 } }, result: '말 없는 저녁에는 텔레비전이 대신 말을 했다.', hint: '말 꺼내기 어려워 흔한 선택' },
      ],
      default: 'keep',
    },
  },
  {
    id: 'mid.after.divorce', ages: [35, 54], p: 0.2, once: true, when: L => !!L?.family?.divorced && !L?.family?.partner,
    text: '이혼 뒤 처음으로 혼자 장을 보았다. 카트가 가벼웠다.',
    fx: { stats: { happiness: -1, leisure: 1, relations: -1 } },
    reason: '이혼 후의 일상',
  },
  {
    id: 'mid.single.parent', ages: [35, 54], p: 0.25, cooldown: 4,
    when: L => (!!L?.family?.divorced || !!L?.family?.widowed) && !L?.family?.partner && kids(L, 0, 17) > 0,
    text: ['아이를 등교시키고 달려 출근하는 아침이 반복되었다.', '아이 도시락을 싸고 출근 버스를 놓치지 않으려 뛰었다.', '퇴근길에 아이를 데리러 가느라 자꾸 시계를 보았다.'],
    fx: { stats: { leisure: -3, health: -1, happiness: -1 }, issues: { care: 4 } },
    reason: '한부모의 출근길',
  },
  {
    id: 'mid.reunion', ages: [40, 54], p: 0.07, cooldown: 6,
    text: ['동창회에 다녀왔다. 근황만 주고받았다.', '오랜만에 동창 모임에 나갔다. 이름보다 얼굴이 먼저 기억났다.', '동창 단톡방에서 모임 날짜가 정해졌다. 가기로 했다.'],
    fx: { stats: { relations: 2, happiness: 1 } },
    reason: '동창회',
  },
  {
    id: 'mid.friend.loan', ages: [40, 54], p: 0.04, cooldown: 5,
    text: ['오랜 친구가 급하다며 돈을 빌려 달라고 했다.', '오랜만에 연락이 온 친구가 먼저 돈 이야기를 꺼냈다.', '친구가 이번 달만 버티면 된다며 돈을 빌려 달라고 했다.'],
    reason: '친구의 돈 부탁',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'lend', label: '빌려준다', fx: { stats: { relations: 3, wealth: -4 }, money: { assets: -500 } }, result: '돈은 돌아오는 데 일 년이 걸렸다.' },
        { id: 'part', label: '일부만 빌려준다', fx: { stats: { relations: 2, wealth: -2 }, money: { assets: -150 } }, result: '반만 건넸고, 친구는 고맙다고 했다.' },
        { id: 'refuse', label: '거절한다', fx: { stats: { relations: -2, wealth: 1, happiness: -2 } }, result: '전화는 한동안 오지 않았다.' },
      ],
      default: 'part',
    },
  },
  {
    id: 'mid.invest.scam', ages: [45, 60], p: 0.04, cooldown: 5,
    text: ['"원금 보장" 투자 설명회에 와 보라는 초대가 왔다.', '"수익 보장" 문자와 함께 투자 모임 초대가 왔다.', '고수익을 말하는 전화가 설명회에 오라고 했다.'],
    reason: '투자 설명회 권유',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'go', label: '설명회에 가 본다', fx: { stats: { wealth: -3, relations: 1, happiness: -2 }, money: { assets: -800 } }, result: '수익 이야기에 마음이 들떴고, 보름 뒤 통장이 가벼워졌다.' },
        { id: 'skip', label: '가지 않는다', fx: { stats: { leisure: 1, relations: -1 } }, result: '초대 연락은 무시하고, 번호는 차단했다.' },
      ],
      default: 'skip',
    },
  },
  {
    id: 'mid.old.hobby', ages: [45, 54], p: 0.09, once: true,
    text: ['창고에서 오래된 낚싯대를 꺼냈다. 줄을 새로 감았다.', '옛 기타를 닦았다. 줄을 갈고 한 곡을 쳐 보았다.', '서랍 속 카메라를 꺼내 먼지를 털었다.'],
    fx: { stats: { happiness: 2, leisure: 1 } },
    reason: '다시 꺼낸 오래된 취미',
  },
  {
    id: 'mid.volunteer', ages: [40, 54], p: 0.07, once: true,
    text: '동네 봉사 모임에 이름을 올렸다. 첫 일은 김장이었다.',
    fx: { stats: { relations: 2, happiness: 1, leisure: -1 } },
    reason: '동네 봉사',
  },
];
