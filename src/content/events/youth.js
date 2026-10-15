// 콘텐츠 B — 청년기(19~34세) 우연 사건. 형식: ARCHITECTURE §8, 카탈로그: GDD §9.4 '콘텐츠 B'(55) + 추가 1.
// 톤: 씁쓸함을 덤덤하게. 비혼·무자녀·비진학·비정규를 실패로 그리지 않는다. 직장 명칭·연봉으로 승패를 가르지 않는다.
// 정답/오답 없음 — 선택마다 얻는 것과 잃는 것. 직장 내 괴롭힘·성희롱은 비그래픽 한 줄 + sensitive(도움 줄은 UI가 붙임).
// 시대 구분은 years·era()로. 확률 p는 GDD §9.1 가이드(단발 .05~.25, 반복 .03~.10 + cooldown), 근거 통계가 있으면 src.
// tags는 'y.' 접두(같은 tag 2년 내 재발생 ×.1 — 몰림 억제). 'victim'·'recovery'만 엔진 표준값(피해 플래그·회복 연결).
import { era } from './early.js';

// ── 조건 보조(모두 성긴 L에서도 throw 하지 않게 ?. 사용) ──
const st = L => L?.job?.status;
const working = L => st(L) === 'employed' || st(L) === 'self';
const employed = L => st(L) === 'employed';
const nonreg = L => st(L) === 'employed' && !L.job.regular;
const college = L => L?.edu?.stage === 'college' || L?.edu?.stage === 'grad';
const apart = L => L?.flags?.indep != null && L?.home?.parents === false;      // 부모와 따로 사는 중
const renter = L => ['jeonse', 'monthly', 'public'].includes(L?.home?.tenure) && L?.home?.parents === false;
const married = L => !!(L?.family?.married && L?.family?.partner);
const CAPITAL = ['seoul', 'gyeonggi', 'incheon'];
const kids = L => (L?.family?.children ?? []).filter(c => c.alive);
const hasBaby = (L, n) => kids(L).some(c => L.year - c.birthYear <= n);
const parentsAlive = L => [L?.family?.parents?.father, L?.family?.parents?.mother].filter(p => p?.alive);
const pickOf = (arr, c) => (c?.pick ? c.pick(arr) : arr[0]);
// 선거 연도(국회·대통령·지방, 공표된 사실만)와 선거권 나이(2005 이전 20세, 2005~2019 19세, 2020~ 18세)
const ELECTION = new Set([1985, 1987, 1988, 1992, 1995, 1996, 1997, 1998, 2000, 2002, 2004, 2006, 2007, 2008, 2010, 2012, 2014, 2016, 2017, 2018, 2020, 2022, 2024, 2025]);
const voteAge = y => (y < 2005 ? 20 : y < 2020 ? 19 : 18);

export default [
  // ───────── 입시·대학·군대 ─────────
  {
    id: 'youth.retake.room', ages: [19, 21], p: 0.35, once: true, tags: ['y.campus'],
    when: L => (L?.edu?.retake ?? 0) > 0 && L?.age <= 21,
    text: era([
      [1960, '새벽 여섯 시, 재수 학원 자리에 앉았다. 옆자리도 낯익은 얼굴이었다.'],
      [1993, '모의고사 성적표가 달마다 학원 복도에 붙었다. 이름은 중간쯤이었다.'],
      [2010, ['독서실 총무가 아침마다 불을 켰다. 재수 생활이 그렇게 시작됐다.', '재수 종합반 공지에는 시험까지 남은 날수만 올라왔다.']],
    ]),
    fx: { stats: { intellect: 2, leisure: -3, happiness: -1 }, issues: { edu: 3 } },
    reason: '재수 시절',
  },
  {
    id: 'youth.freshman', ages: [19, 20], p: 0.45, once: true, tags: ['y.campus'],
    when: L => L?.edu?.stage === 'college' && !((L?.edu?.retake ?? 0) > 0 && L?.age < 20),
    text: era([
      [1960, '신입생 환영회에서 막걸리 잔이 돌았다. 선배 이름을 외우다 잠들었다.'],
      [1995, '수련회 버스에서 처음 보는 선배가 노래를 시켰다.'],
      [2010, '단톡방에서 학번 순서로 인사를 했다. 첫 모임은 호프집이었다.'],
      [2020, '입학식도 첫 모임도 화면 속이었다. 동기 얼굴은 반만 알았다.'],
      [2022, '마스크를 벗고 동기들과 처음 사진을 찍었다.'],
    ]),
    fx: { stats: { relations: 3, happiness: 2, leisure: -1 } },
    reason: '신입생 모임',
  },
  {
    id: 'youth.tuition.bill', ages: [19, 24], p: 0.12, once: true, tags: ['y.campus', 'y.money'],
    when: L => L?.edu?.stage === 'college',
    text: era([
      [1960, '등록금 고지서가 식탁에 올라왔다. 금액을 확인했다.'],
      [2012, '등록금 납부 마감일이 다가왔다. 장학금 발표는 아직이었다.'],
    ]),
    reason: '등록금을 마련하는 방식',
    choice: {
      prompt: '등록금을 어떻게 마련할까?',
      options: [
        { id: 'loan', label: '학자금 대출', fx: { stats: { wealth: -2, happiness: -1, leisure: 1 } }, result: '이자는 졸업 뒤의 일로 미뤄 두었다.', do: (L, act) => act.borrow(600, 'student') },
        { id: 'work', label: '알바를 늘린다', fx: { stats: { wealth: 1, leisure: -4, intellect: -1 } }, result: '강의 사이사이에 시급 일을 끼워 넣었다.', do: (L, act) => act.gain(300), hint: '재학 중 일 경험 41%(2026)' },
        { id: 'leave', label: '휴학한다', fx: { stats: { leisure: 3, happiness: 1, wealth: -2, relations: -1 } }, result: '한 학기를 쉬는 동안 통장 잔액만 확인했다.' },
      ],
      default: 'work',
    },
  },
  {
    id: 'youth.cafe.shift', ages: [19, 26], p: 0.18, once: true,
    when: L => ['student', 'seeking', 'none', 'inactive'].includes(st(L)),
    text: era([
      [1960, '분식집에서 일당을 받고 서빙을 했다. 일당은 날마다 달랐다.'],
      [1988, '시급이 법으로 정해졌지만 가게마다 사정이 달랐다.'],
      [1999, '커피 전문점에서 일했다. 시급은 최저임금 언저리였다.'],
      [2018, '카페 시급은 7,530원이었다. 한 시간이면 커피 두 잔 값이었다.'],
      [2019, '카페 시급은 8,350원이었다. 한 시간이면 커피 두 잔 값이었다.'],
      [2020, '카페 시급은 해마다 조금씩 올랐다. 마감 시간은 그대로였다.'],
      [2025, '카페 시급은 10,030원이었다. 한 시간이면 커피 두 잔 값이었다.'],
      [2026, '카페 시급은 10,320원이었다. 한 시간이면 커피 두 잔 값이었다.'],
    ]),
    fx: { stats: { wealth: 2, leisure: -2, relations: 1 } },
    reason: '시급 아르바이트',
  },
  {
    id: 'youth.wage.theft', ages: [19, 27], p: 0.04, once: true, tags: ['y.work'],
    when: L => ['student', 'seeking'].includes(st(L)) || nonreg(L),
    text: '마지막 달 급여가 들어오지 않았다. 가게 주인은 다음 주라고만 했다.',
    reason: '임금이 제때 들어오지 않음',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'complain', label: '노동청에 진정한다', fx: { stats: { wealth: 2, happiness: 1, leisure: -2 } }, result: '진정서를 냈고, 몇 주 뒤 체불액이 입금되었다.', hint: '체불은 노동청에 진정할 수 있다' },
        { id: 'retry', label: '다시 요구한다', fx: { stats: { wealth: 1, relations: -1, happiness: -1 } }, result: '내용증명을 보냈고, 일부를 돌려받았다.', hint: '먼저 직접 요구하는 경우가 흔하다' },
        { id: 'quit', label: '받지 않고 그만둔다', fx: { stats: { leisure: 1, happiness: -2, wealth: -2 } }, result: '이후로는 계약서와 입금 내역을 사진으로 남겼다.' },
      ],
      default: 'retry',
    },
  },
  {
    id: 'youth.leave.year', ages: [20, 24], p: 0.08, once: true, tags: ['y.campus'], src: ['R03.S22'],
    when: L => L?.edu?.stage === 'college' && !L?.edu?.leave,
    text: '한 학기를 쉬어 갈까 자꾸 생각했다. 수강신청 기간이 다가왔다.',
    reason: '휴학을 고민함',
    choice: {
      prompt: '휴학할까?',
      options: [
        { id: 'leave', label: '휴학한다', fx: { stats: { leisure: 3, happiness: 2, wealth: -2 } }, result: '한 학기 동안 학교 밖의 시간표를 직접 짰다.' },
        { id: 'work', label: '휴학하고 일한다', fx: { stats: { wealth: 2, intellect: 1, leisure: -2 } }, result: '휴학계를 내고 일터로 출근했다.' },
        { id: 'stay', label: '계속 다닌다', fx: { stats: { intellect: 2, leisure: -2, happiness: -1 } }, result: '학점은 쌓였고 쉬는 날은 줄었다.', hint: '여성 휴학 경험은 29.6%(2026)' },
      ],
      default: 'stay',
    },
  },
  {
    id: 'youth.mil.letter', ages: [20, 22], p: 0.4, once: true,
    when: L => L?.mil?.status === 'serving',
    text: era([
      [1960, '훈련소로 편지가 한 통 왔다. 글씨만 보고도 누구인지 알았다.'],
      [2005, '내무반 앞으로 편지가 왔다. 취침 전에 두 번 읽었다.'],
      [2020, '일과 뒤 휴대폰을 돌려받아 안부 문자를 읽었다.'],
    ]),
    fx: { stats: { relations: 2, happiness: 1 } },
    reason: '군대에서 받은 편지',
  },
  {
    id: 'youth.mil.injury', ages: [20, 22], p: 0.06, once: true, sensitive: 'illness',
    when: L => L?.mil?.status === 'serving',
    text: ['훈련 중 발목을 다쳤다. 군병원 진료 순번을 기다렸다.', '행군 뒤 무릎이 부었다. 의무대 줄이 길었다.'],
    fx: { stats: { health: -3, leisure: -1, happiness: -1 }, issues: { medical: 2 } },
    reason: '훈련 중 부상',
  },
  {
    id: 'youth.discharge.gap', ages: [22, 24], p: 0.3, once: true, tags: ['y.campus'],
    when: L => L?.mil?.status === 'done' && college(L),
    text: ['복학한 강의실에는 아는 얼굴이 없었다. 후배들이 선배라 불렀다.', '전역 후 첫 학기, 학생증 사진 속 얼굴이 낯설었다.'],
    fx: { stats: { intellect: 1, relations: -1, leisure: -1 } },
    reason: '전역 뒤 복학',
  },
  {
    id: 'youth.exam.week', ages: [19, 24], p: 0.2, cooldown: 4, tags: ['y.campus'],
    when: L => L?.edu?.stage === 'college',
    text: era([
      [1960, ['시험 기간, 열람실 자리를 맡으려 새벽에 줄을 섰다.', '시험 기간, 하숙집 불을 밤새 켜 두고 책을 넘겼다.', '시험 기간, 친구의 필기 노트를 빌려 밤새 베꼈다.']],
      [1995, ['시험 기간, 도서관 불이 꺼질 때까지 자리를 지켰다.', '시험 기간, 학생식당에서 한 끼를 컵라면으로 때웠다.', '시험 기간, 족보를 구하러 선배를 찾아다녔다.']],
      [2012, ['시험 기간, 카페 구석에서 노트북 배터리와 밤을 새웠다.', '시험 기간, 스터디룸 예약이 한 시간 만에 찼다.', '시험 기간, 단톡방에서 요약본을 돌려 보았다.']],
    ]),
    fx: { stats: { intellect: 2, health: -1, leisure: -2 } },
    reason: '시험 기간',
  },
  {
    id: 'youth.friends.meet', ages: [20, 34], p: 0.1, cooldown: 4,
    text: era([
      [1960, ['동기 모임에 참석했다.', '친구들과 호프집에서 밤늦게까지 이야기했다. 계산은 N분의 1이었다.', '동창 연락망으로 소식을 돌려 오랜만에 한자리에 모였다.']],
      [1995, ['동기 모임에 참석했다.', '친구들과 호프집에서 밤늦게까지 이야기했다. 계산은 N분의 1이었다.', 'PC통신 동호회에서 이름만 보던 얼굴들이 한자리에 모였다.']],
      [2002, ['동기 모임에 참석했다.', '친구들과 치킨집에서 밤늦게까지 이야기했다. 계산은 N분의 1이었다.', '메신저와 미니홈피에서만 보던 얼굴들이 한자리에 모였다.']],
      [2010, ['동기 모임에 참석했다.', '친구들과 치킨집에서 밤늦게까지 이야기했다. 계산은 N분의 1이었다.', '단톡방에서만 보던 얼굴들이 한자리에 모였다.']],
    ]),
    fx: { stats: { relations: 2, happiness: 2, wealth: -1 } },
    reason: '친구들과의 모임',
  },

  // ───────── 취업 준비·첫 직장 ─────────
  {
    id: 'youth.spec', ages: [21, 27], p: 0.12, once: true, tags: ['y.jobhunt'],
    when: L => ['student', 'seeking'].includes(st(L)),
    text: era([
      [1960, '이력서에 적을 한 줄이 아직 부족했다.'],
      [1990, '이력서 빈칸이 자꾸 눈에 걸렸다. 어학 점수 칸이었다.'],
      [2012, '이력서의 자격증 칸이 비어 있었다. 공고마다 한 줄씩 있었다.'],
    ]),
    reason: '스펙을 쌓는 방식',
    choice: {
      prompt: '어떻게 준비할까?',
      options: [
        { id: 'academy', label: '학원에 등록한다', fx: { stats: { intellect: 2, wealth: -3, leisure: -2 } }, result: '수강증을 끊고 새벽반에 이름을 올렸다.' },
        { id: 'self', label: '독학한다', fx: { stats: { intellect: 2, leisure: -3, wealth: -1 } }, result: '문제집 한 권을 골라 도서관 구석에 자리를 잡았다.' },
        { id: 'skip', label: '안 한다', fx: { stats: { leisure: 1, happiness: 1 } }, result: '대신 지원서를 한 곳이라도 더 넣었다.' },
      ],
      default: 'self',
    },
  },
  {
    id: 'youth.intern', ages: [22, 28], p: 0.1, once: true, years: [2000, 2100], tags: ['y.jobhunt'],
    when: L => ['student', 'seeking'].includes(st(L)),
    text: '인턴 공고가 올라왔다. 급여는 교통비 수준이었다.',
    reason: '인턴 제안',
    choice: {
      prompt: '지원할까?',
      options: [
        { id: 'take', label: '인턴을 한다', fx: { stats: { intellect: 3, relations: 2, leisure: -3, wealth: -1 } }, result: '두 달 동안 복사기와 친해졌고 이름 석 자를 알렸다.', hint: '경력 칸을 채우려는 선택이 흔하다' },
        { id: 'ask', label: '조건부터 묻는다', fx: { stats: { intellect: 1, relations: 1, leisure: -1 } }, result: '급여와 전환 기준을 물었고, 답은 메일로 왔다.' },
        { id: 'refuse', label: '거절한다', fx: { stats: { leisure: 3, happiness: 2, relations: -1 } }, result: '그 두 달은 지원서와 잠에 썼다.' },
      ],
      default: 'take',
    },
  },
  {
    id: 'youth.civil.exam', ages: [23, 32], p: 0.08, once: true, years: [1998, 2100], tags: ['y.jobhunt'], src: ['R04.S3'],
    when: L => ['student', 'seeking'].includes(st(L)),
    text: era([
      [1998, '외환위기 뒤 공무원 시험 학원 줄이 길어졌다.'],
      [2010, '노량진 골목에는 컵밥 가게와 고시원이 줄지어 있었다.'],
      [2020, '인강으로 공무원 시험을 준비하는 동기가 늘었다.'],
    ]),
    reason: '공무원 시험 준비를 고민함',
    choice: {
      prompt: '시험을 준비할까?',
      options: [
        {
          id: 'start', label: '준비를 시작한다', fx: { stats: { intellect: 2, leisure: -4, wealth: -2, relations: -2 }, issues: { job: 2 } },
          result: '독서실 정기권을 끊고 휴대폰을 서랍에 넣었다.',
          do: (L, act) => { act.flag('civilExam', L.year); act.flag('examUntil', L.year + 2); },
        },
        { id: 'skip', label: '기업 지원을 이어 간다', fx: { stats: { leisure: 1, relations: 1, wealth: -1 } }, result: '공고를 날마다 열어 보며 자기소개서를 고쳤다.', hint: '취업시험 준비자 14.5%(2026)' },
      ],
      default: 'skip',
    },
  },
  {
    id: 'youth.civil.result', ages: [24, 33], p: 0.5, once: true, tags: ['y.jobhunt'],
    when: L => L?.flags?.civilExam != null && (!!L?.job?.public || L.year - L.flags.civilExam >= 2),
    text: (L, c) => pickOf(L?.job?.public
      ? ['합격자 명단에서 내 수험번호를 찾았다. 발령지는 우편으로 왔다.', '합격 통보를 읽고 한참 앉아 있었다. 수험서는 책장 맨 위로 올라갔다.']
      : ['불합격이었다. 합격선과는 두세 문제 차이였다.', '불합격 통보를 읽고 수험서를 책장 아래 칸에 꽂았다.'], c),
    do: (L, act) => act.flag('civilExam', null),
    fx: { stats: { leisure: 2, happiness: 1 } },
    reason: '공무원 시험 결과',
  },
  {
    id: 'youth.rejections', ages: [23, 30], p: 0.3, cooldown: 4, tags: ['y.jobhunt'], src: ['R04.S3'],
    when: L => st(L) === 'seeking',
    text: era([
      [1960, ['지원한 회사에서 연락이 오지 않았다. 전화기를 오래 보았다.', '원서를 낸 곳마다 답이 늦었다. 우편함을 자주 열어 보았다.']],
      [2000, ['메일함에 "아쉽게도"로 시작하는 메일이 쌓였다.', '불합격 문자를 받고도 다음 공고를 열어 보았다.']],
      [2015, ['"아쉽게도"로 시작하는 문자가 쌓였다. 지원 현황표는 칸이 모자랐다.', '지원서를 낼 때마다 자기소개서 첫 문장을 새로 썼다.', '서류 탈락 알림이 이어졌다. 이력서 파일 이름에 번호가 붙었다.']],
    ]),
    fx: { stats: { happiness: -2, wealth: -1 }, issues: { job: 3 } },
    reason: '서류 탈락이 이어짐',
  },
  {
    id: 'youth.first.contract', ages: [23, 30], p: 0.4, once: true, tags: ['y.work'], src: ['R04.S3'],
    when: L => nonreg(L) && (L?.job?.history?.length ?? 0) <= 1 && (L?.job?.years ?? 0) <= 2,
    text: ['1년 계약직으로 입사했다.', '계약직으로 입사했다. 계약서에 종료일이 적혀 있었다.'],
    fx: { stats: { wealth: 1, relations: 1 }, issues: { job: 3 } },
    reason: '1년 계약으로 시작한 첫 직장',
  },
  {
    id: 'youth.commute', ages: [22, 34], p: 0.15, cooldown: 4,
    when: employed,
    text: ['출근길 지하철에서 한 정거장을 서서 졸았다.', '만원 버스에서 손잡이 하나에 몸을 맡기고 갔다.', '출퇴근에 하루 세 시간이 길 위에 있었다.'],
    fx: { stats: { leisure: -2, health: -1 } },
    reason: '출퇴근 시간',
  },
  {
    id: 'youth.salary.day', ages: [22, 34], p: 0.15, cooldown: 4,
    when: employed,
    text: ['월급이 들어오고 이체 알림이 세 번 울렸다. 잔액은 하루 만에 줄었다.', '월급날 오후, 통장 잔액을 확인했다.', '월급 알림이 울린 지 한 시간 만에 카드값이 빠져나갔다.', '월급날 저녁, 통장 잔액을 한 번 더 확인했다.'],
    fx: { stats: { wealth: 1, leisure: -1 } },
    reason: '월급날의 통장',
  },

  // ───────── 일터 ─────────
  {
    id: 'youth.overtime', ages: [24, 34], p: 0.1, cooldown: 4, tags: ['y.work'],
    when: employed,
    text: era([
      [1960, ['퇴근 시간이 지나도 사무실 불은 꺼지지 않았다.', '남은 일을 두고 먼저 일어서는 사람이 없었다.', '막차 시간을 보며 서류를 한 장 더 넘겼다.']],
      [2018, ['주 52시간제가 시작됐지만 우리 팀 불은 아직 켜져 있었다.', '정시 퇴근 안내가 붙었지만 일은 그대로 남아 있었다.', '근무 기록은 여섯 시에 끝났고, 일은 아홉 시에 끝났다.']],
    ]),
    reason: '반복되는 야근',
    choice: {
      prompt: '오늘은 어떻게 할까?',
      options: [
        { id: 'stay', label: '남아서 한다', fx: { stats: { wealth: 2, health: -2, leisure: -4, relations: 1 } }, result: '야식 영수증이 서랍에 쌓였고 수당은 조금 붙었다.', hint: '장시간 근로가 흔한 편이다' },
        { id: 'leave', label: '정시에 퇴근한다', fx: { stats: { leisure: 3, health: 1, relations: -2, wealth: -1 } }, result: '가방을 챙겨 일어서자 몇몇 시선이 따라왔다.' },
        { id: 'prep', label: '이직을 준비한다', fx: { stats: { intellect: 1, leisure: -3, happiness: -1 } }, result: '밤마다 이력서를 꺼내 한 줄씩 고쳤다.' },
      ],
      default: 'stay',
    },
  },
  {
    id: 'youth.work.bullying', ages: [24, 34], p: 0.04, once: true, tags: ['victim', 'y.work'], sensitive: 'violence',
    when: working,
    text: era([
      [1960, ['회의 때마다 상사가 내 이름만 골라 사람들 앞에서 질책했다.', '단체 대화방에서 나만 빠지고 일은 그대로 내게 왔다.']],
      [2019, ['괴롭힘 금지법이 생긴 뒤에도 윗사람의 말투는 그대로였다.', '단체 대화방에서 나만 빠지고 일은 그대로 내게 왔다.']],
    ]),
    fx: { stats: { happiness: -3 } },
    reason: '직장 내 괴롭힘',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'report', label: '회사에 신고한다', fx: { stats: { happiness: 3, relations: -2, leisure: -2 } }, result: '인사팀 면담이 잡혔고 담당자가 내용을 기록으로 남겼다.', hint: '회사·노동청 모두 신고 가능' },
        { id: 'transfer', label: '부서 이동을 요청한다', fx: { stats: { happiness: 2, leisure: 1, relations: -1 } }, result: '새 부서 자리는 창가였고 회의는 조용했다.' },
        { id: 'record', label: '동료와 함께 기록한다', fx: { stats: { relations: 3, happiness: 1, leisure: -1 } }, result: '믿을 만한 동료와 날짜별로 기록을 모아 두었다.' },
      ],
      default: 'report',
    },
  },
  {
    id: 'youth.work.harassment', ages: [22, 34], p: 0.015, once: true, tags: ['victim', 'y.work'], sensitive: 'sexual',
    when: working,
    text: ['회식 자리에서 상사가 불편한 말과 행동을 되풀이했다.', '회의 뒤 상사가 몸에 대한 말을 여러 번 했다.'],
    fx: { stats: { happiness: -3, health: -1, relations: -1 } },
    reason: '직장 내 성희롱',
  },
  {
    id: 'youth.recovery', ages: [22, 34], p: 0.5, once: true, tags: ['recovery'],
    when: L => { const v = L?.flags?.victim; return v != null && L.year - v >= 1 && L.year - v <= 3; },
    text: ['상담센터 선생님이 말했다. "당신 잘못이 아니에요."', '노무사 사무실에서 기록을 날짜순으로 정리했다. "당신 잘못이 아니에요."', '동료가 점심을 같이 먹자고 했다. 이유는 묻지 않았다.'],
    fx: { stats: { happiness: 3, relations: 1, health: 1 } },
    reason: '피해 뒤 안전한 사람과의 대화',
  },
  {
    id: 'youth.burnout', ages: [25, 34], p: 0.07, once: true, tags: ['y.work', 'y.mind'],
    when: working,
    text: ['아침 알람이 울려도 몸이 일어나지 않았다. 지하철을 두 대 보냈다.', '일요일 저녁부터 숨이 얕아졌다. 월요일이 먼저 도착했다.'],
    reason: '번아웃',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'rest', label: '쉰다', fx: { stats: { health: 3, leisure: 4, wealth: -3 } }, result: '연차를 모아 일주일을 쉬었다.' },
        { id: 'push', label: '버틴다', fx: { stats: { wealth: 1, health: -3, happiness: -3 } }, result: '커피 한 잔을 더 마셨고 주말은 잠으로 갔다.', hint: '쉴 수 없는 사정이 흔하다' },
        { id: 'counsel', label: '상담을 받는다', fx: { stats: { happiness: 2, health: 1, wealth: -1, leisure: -1 } }, result: '주 한 번 상담실 의자에 앉아 말하는 연습을 했다.' },
      ],
      default: 'push',
    },
  },
  {
    id: 'youth.rider', ages: [20, 34], p: 0.3, once: true, years: [2015, 2100], tags: ['y.work'],
    when: L => !!L?.job?.platform,
    text: ['알림음이 울릴 때마다 건당 단가를 셈했다. 비 오는 날이 제일 바빴다.', '헬멧을 쓰고 아파트 단지를 돌았다. 별점은 날씨가 정했다.'],
    fx: { stats: { wealth: 1, health: -2, leisure: -1 }, issues: { job: 3 } },
    reason: '배달 라이더의 하루',
  },
  {
    id: 'youth.freelance', ages: [24, 34], p: 0.15, once: true, tags: ['y.work'],
    when: L => st(L) === 'self' || nonreg(L),
    text: ['입금액이 계약 금액보다 3.3% 적었다. 신고는 내 몫이었다.', '5월이 되자 종합소득세 신고 화면 앞에 앉았다.'],
    fx: { stats: { wealth: -1, intellect: 1, leisure: -1 }, issues: { job: 2 } },
    reason: '3.3% 원천징수',
  },
  {
    id: 'youth.startup.idea', ages: [26, 34], p: 0.07, once: true, tags: ['y.work'],
    when: L => ['employed', 'seeking'].includes(st(L)),
    text: '밤마다 같은 아이디어를 노트에 고쳐 적었다. 월급 통장이 먼저 떠올랐다.',
    reason: '창업 아이디어',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'try', label: '주말부터 해 본다', fx: { stats: { leisure: -4, happiness: 2, intellect: 1, wealth: -1 }, money: { assets: -200 } }, result: '주말마다 시제품을 만들었고 첫 주문은 지인이었다.' },
        { id: 'ask', label: '지원사업부터 알아본다', fx: { stats: { intellect: 2, leisure: -2, relations: 1 } }, result: '창업 지원 공고를 모아 일정표에 넣었다.' },
        { id: 'fold', label: '접어 둔다', fx: { stats: { wealth: 1, leisure: 1, happiness: -1 } }, result: '노트는 서랍에 들어갔지만 아이디어는 가끔 꺼내 보았다.' },
      ],
      default: 'fold',
    },
  },

  // ───────── 주거 ─────────
  {
    id: 'youth.mold.room', ages: [20, 30], p: 0.15, once: true, tags: ['y.housing'],
    when: L => L?.home?.tenure === 'monthly' && L?.home?.parents === false,
    text: ['장마 뒤 원룸 벽 모서리에 곰팡이가 번졌다. 집주인은 환기를 권했다.', '창 없는 욕실 천장에 곰팡이가 피었다. 한 달에 한 번 닦았다.'],
    fx: { stats: { health: -2, happiness: -1, wealth: -1 }, issues: { housing: 3 } },
    reason: '곰팡이 핀 월세방',
  },
  {
    id: 'youth.substandard', ages: [20, 32], p: 0.3, once: true, tags: ['y.housing'], src: ['R05.S1'],
    when: L => L?.flags?.substandard != null,
    text: ['창문 높이가 지면과 같았다. 비가 오면 신발부터 안쪽으로 옮겼다.', '보증금에 맞는 방은 그 방뿐이었다. 벽 너머 기침 소리가 들렸다.'],
    fx: { stats: { health: -2, happiness: -2, relations: -1 }, issues: { housing: 5 } },
    reason: '최저주거기준 미달 주거',
  },
  {
    id: 'youth.jeonse.loan', ages: [25, 34], p: 0.14, once: true, tags: ['y.housing'],
    when: L => L?.home?.tenure === 'jeonse' && L?.home?.parents === false,
    text: ['창구에서 전세대출 서류 목록을 받았다. 보증금 금액을 확인했다.', '대출 심사 결과 문자를 기다리며 계약일까지 날짜를 세었다.'],
    fx: { stats: { wealth: -1, happiness: -1 }, issues: { housing: 4 } },
    reason: '전세대출 상담',
  },
  {
    id: 'youth.fraud.news', ages: [25, 34], p: 0.3, once: true, years: [2022, 2024], tags: ['y.housing'], src: ['R05.S4'],
    when: L => ['jeonse', 'monthly'].includes(L?.home?.tenure) && L?.home?.parents === false,
    text: era([
      [2022, '옆 건물 세입자들이 보증금을 못 돌려받았다는 소식이 돌았다.'],
      [2023, '전세사기 특별법 뉴스가 나온 날 처음 등기부등본을 떼어 보았다.'],
      [2024, '건물 단톡방에 "집주인 연락 두절" 글이 올라왔다.'],
    ]),
    fx: { stats: { happiness: -2, wealth: -1 }, issues: { housing: 4, fairness: 2 } },
    reason: '전세사기 소식',
  },
  {
    id: 'youth.fraud.support', ages: [20, 34], p: 0.6, once: true, tags: ['recovery'], src: ['R05.S4'],
    when: L => { const f = L?.flags?.fraud; return f != null && L.year - f >= 1 && L.year - f <= 3; },
    text: '보증금을 받지 못한 뒤 지원 창구 안내문을 찾아 읽었다.',
    reason: '전세사기 피해 지원 연결',
    choice: {
      prompt: '어디에 도움을 청할까?',
      options: [
        { id: 'support', label: '피해 지원을 신청한다', fx: { stats: { wealth: 2, happiness: 1, leisure: -2 } }, result: '피해자 결정 신청서를 냈고 서류 목록은 길었다.', hint: '피해자 결정 신청이 먼저' },
        { id: 'law', label: '법률 상담을 받는다', fx: { stats: { intellect: 1, wealth: 1, happiness: 1, leisure: -1 } }, result: '무료 법률 상담에서 할 일을 순서대로 적어 받았다.' },
        { id: 'talk', label: '가족과 친구에게 알린다', fx: { stats: { relations: 3, happiness: 2 } }, result: '가까운 사람들이 보증금 이야기를 같이 들어 주었다.' },
      ],
      default: 'support',
    },
  },
  {
    id: 'youth.roommate', ages: [20, 28], p: 0.1, once: true, tags: ['y.housing'],
    when: L => (renter(L) || L?.home?.tenure === 'dorm') && !married(L),
    text: '공과금 정산표의 숫자 한 줄이 서로 달랐다.',
    reason: '룸메이트와의 생활비 다툼',
    choice: {
      prompt: '어떻게 정리할까?',
      options: [
        { id: 'half', label: '반반으로 정리한다', fx: { stats: { wealth: -1, relations: 1, leisure: 1 } }, result: '영수증을 반으로 갈랐고 그날은 말이 적었다.' },
        { id: 'rule', label: '기준표를 같이 만든다', fx: { stats: { relations: 2, leisure: -1, intellect: 1 } }, result: '표에 항목별 기준을 적고 서로 확인했다.' },
        { id: 'apart', label: '각자 방을 구한다', fx: { stats: { wealth: -3, leisure: 2, relations: -1 } }, result: '각자 월세방을 알아보며 계약 만료일을 맞췄다.' },
      ],
      default: 'rule',
    },
  },
  {
    id: 'youth.parent.call', ages: [22, 34], p: 0.12, cooldown: 4,
    when: L => apart(L) && parentsAlive(L).length > 0,
    text: ['부모님 전화였다. 밥은 먹었냐는 말이 먼저였다.', '부모님이 용건 없이 전화했다가 날씨 이야기만 하고 끊었다.', '택배 상자가 왔다. 반찬 사이에 손편지가 끼어 있었다.'],
    fx: { stats: { relations: 2, happiness: 1 } },
    reason: '고향 부모님과의 통화',
  },
  {
    id: 'youth.holiday.home', ages: [20, 34], p: 0.12, cooldown: 4,
    when: L => apart(L) && parentsAlive(L).length > 0,
    text: era([
      [1960, ['귀성 열차표를 구하려고 새벽에 역 앞에 줄을 섰다.', '귀성 열차 통로에 서서 다섯 시간을 갔다.']],
      [1995, ['명절 귀성길 고속도로에서 여섯 시간을 보냈다.', '명절 선물 보따리를 들고 터미널 줄에 섰다.']],
      [2010, ['명절 기차표 예매는 시작 일 분 만에 매진되었다.', '명절 연휴 중 하루만 내려가기로 하고 표를 끊었다.']],
    ]),
    fx: { stats: { relations: 2, happiness: 1, leisure: -1 } },
    reason: '명절 귀성',
  },
  {
    id: 'youth.move.in', ages: [19, 30], p: 0.3, once: true,
    when: L => apart(L) && !!L?.home?.moves?.some?.(m => m.year === L.year || m.year === L.year - 1),
    text: ['택배 상자 열 개가 현관에 쌓였다. 첫날 밤은 냉장고 소리만 들렸다.', '전입신고서를 쓰는 데 십 분이 걸렸다. 열쇠가 묵직했다.', '이삿짐을 풀다 보니 부모님 집에서 가져온 물건이 반이었다.'],
    fx: { stats: { happiness: 1, relations: -1, leisure: 1 } },
    reason: '혼자 살기의 첫 주',
  },
  {
    id: 'youth.rent.day', ages: [20, 34], p: 0.15, cooldown: 4, tags: ['y.housing'],
    when: L => L?.home?.tenure === 'monthly' && L?.home?.parents === false,
    text: ['매달 25일, 월세 이체 알림이 월급보다 먼저 울렸다.', '월세 이체일이 돌아왔다. 잔액을 한 번 더 확인했다.', '월세에 관리비를 더하니 주거비 부담이 커졌다.'],
    fx: { stats: { wealth: -1, leisure: -1 }, issues: { housing: 2 } },
    reason: '월세 이체일',
  },

  // ───────── 연애·결혼·출산 ─────────
  {
    id: 'youth.dating.app', ages: [24, 34], p: 0.1, once: true, years: [2015, 2100], tags: ['y.love'],
    when: L => !L?.family?.partner && !married(L),
    text: '친구가 소개팅 앱을 깔아 보라고 했다. 프로필 사진부터 골라야 했다.',
    reason: '소개팅 앱을 쓸지 고민함',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'try', label: '해 본다', fx: { stats: { relations: 3, happiness: 1, leisure: -3, wealth: -1 } }, result: '몇 번의 약속이 잡혔고 한 번은 두 시간을 걸어서 돌아왔다.' },
        { id: 'delete', label: '지운다', fx: { stats: { leisure: 3, happiness: 1, relations: -1 } }, result: '설치 삼 분 만에 지웠고 저녁이 조용해졌다.' },
        { id: 'friend', label: '친구에게 소개를 부탁한다', fx: { stats: { relations: 2, leisure: -1 } }, result: '친구가 연락처를 건넸고 대화는 두 달 이어졌다.' },
      ],
      default: 'delete',
    },
  },
  {
    id: 'youth.blind.date', ages: [24, 34], p: 0.09, cooldown: 5, tags: ['y.love'],
    when: L => !L?.family?.partner && !married(L),
    text: era([
      [1960, ['중매 자리에서 어른들이 먼저 웃었다. 우리는 찻잔만 보았다.', '중매쟁이가 건넨 사진 한 장으로 약속이 잡혔다.']],
      [1985, ['"한번 만나 봐라"는 말과 함께 소개 약속이 잡혔다.', '직장 동료가 괜찮은 사람이 있다며 약속을 잡았다.']],
      [2005, ['친구의 친구를 소개받는 자리가 잡혔다. 메신저로 먼저 안부를 물었다.', '지인이 소개해 준 사람과 문자로 약속 시간을 정했다.']],
      [2015, ['친구가 소개팅 날짜를 잡아 주었다. 카페 위치 링크도 와 있었다.', '소개팅 상대와 메신저로 프로필 사진 몇 장을 주고받았다.']],
    ]),
    reason: '소개팅 자리',
    choice: {
      prompt: '나가 볼까?',
      options: [
        { id: 'go', label: '나가 본다', fx: { stats: { relations: 2, happiness: 2, wealth: -1, leisure: -2 } }, result: '두 시간 이야기했고 헤어질 때 서로 어색하게 웃었다.' },
        { id: 'group', label: '여럿이 만난다', fx: { stats: { relations: 3, happiness: 1, leisure: -1 } }, result: '친구들과 함께한 자리라 어색함이 반으로 줄었다.' },
        { id: 'decline', label: '정중히 거절한다', fx: { stats: { leisure: 3, relations: -3 } }, result: '혼자 보낸 토요일은 조용했고 나쁘지 않았다.' },
      ],
      default: 'go',
    },
  },
  {
    id: 'youth.breakup.after', ages: [20, 34], p: 0.35, cooldown: 6, tags: ['y.love'],
    when: L => !!L?.log?.some?.(e => e.id === 'sys.fam.breakup' && L.year - e.year >= 0 && L.year - e.year <= 1),
    text: ['약속 없는 토요일에 청소를 했다. 서랍에서 영수증 몇 장이 나왔다.', '둘이 가던 가게를 일부러 피해 걸었다.', '대화방을 지우지 못한 채 주말이 지났다.'],
    fx: { stats: { happiness: -2, leisure: 1, relations: -1 } },
    reason: '이별 뒤의 주말',
  },
  {
    id: 'youth.wedding.cost', ages: [27, 34], p: 0.5, once: true, tags: ['y.wedding', 'y.money'], src: ['R06.S23'],
    when: L => married(L) && L?.family?.marriedYear != null && L.year - L.family.marriedYear >= 1 && L.year - L.family.marriedYear <= 3,
    text: '결혼 때 쓴 비용을 다시 정리했다. 합계 칸이 예상보다 길었다.',
    reason: '결혼 비용 정산',
    choice: {
      prompt: '비용을 어떻게 맞출까?',
      options: [
        { id: 'small', label: '규모를 줄인다', fx: { stats: { wealth: 2, happiness: -1, relations: 1, leisure: -2 } }, result: '신혼집은 한 평수 작은 곳으로 정하고 짐을 줄였다.' },
        { id: 'family', label: '양가 도움을 받는다', fx: { stats: { wealth: 3, relations: -1, happiness: -1, leisure: 1 } }, result: '양가에서 보태 주셨고 고마움과 부담이 함께 왔다.' },
        { id: 'loan', label: '대출로 메운다', fx: { stats: { wealth: -3, happiness: 1, leisure: 1 }, money: { debt: 2000 } }, result: '월 상환일이 달력에 새 줄로 올랐다.', hint: '신혼부부 87%가 대출(2024)' },
      ],
      default: 'loan',
    },
  },
  {
    id: 'youth.wedding.gift', ages: [25, 34], p: 0.12, cooldown: 4, tags: ['y.wedding'],
    text: era([
      [1960, ['잔칫집에 부조 봉투를 들고 갔다. 이름을 또박또박 적었다.', '잔칫집 방명록에 이름을 적고 국수를 한 그릇 먹었다.']],
      [1990, ['청첩장이 도착했다. 봉투에 넣을 금액을 몇 번 고쳐 적었다.', '결혼식 축의금을 얼마로 할지 친구에게 물어보았다.']],
      [2020, ['모바일 청첩장이 도착했다. 계좌번호 옆 금액을 한참 보았다.', '축의금 송금 화면에서 금액을 한 번 지우고 다시 적었다.']],
    ]),
    fx: { stats: { wealth: -1, relations: 1 } },
    reason: '경조사비',
  },
  {
    id: 'youth.inlaws', ages: [27, 34], p: 0.1, once: true, tags: ['y.wedding'],
    when: married,
    text: '명절 전날, 양가에 몇 시에 가는지가 안건이 되었다.',
    reason: '양가 명절 일정',
    choice: {
      prompt: '이번에는 어떻게 할까?',
      options: [
        { id: 'alt', label: '해마다 번갈아 간다', fx: { stats: { relations: 1, leisure: -1 } }, result: '올해는 한쪽, 내년은 다른 쪽으로 정하고 달력에 적었다.' },
        { id: 'split', label: '반나절씩 나눠 간다', fx: { stats: { relations: 2, leisure: -3, health: -1 } }, result: '고속도로에서 반나절, 식탁에서 반나절을 보냈다.' },
        { id: 'rest', label: '이번 명절은 쉰다', fx: { stats: { leisure: 3, happiness: 1, relations: -2 } }, result: '연휴에 늦잠을 자고 양가에는 전화로 인사했다.' },
      ],
      default: 'alt',
    },
  },
  {
    id: 'youth.pregnant.work', ages: [27, 34], p: 0.5, cooldown: 4, tags: ['y.baby'],
    when: L => married(L) && L?.flags?.childPlanned === L.year + 1,
    text: (L, c) => pickOf(L?.sex === 'F'
      ? ['배가 불러 온 뒤에도 출근길 지하철은 붐볐다. 자리는 가끔 양보받았다.', '임신 중에도 출근했다. 점심시간마다 누울 곳을 찾았다.', '입덧이 심한 날에도 회의실 의자에 앉아 버텼다.']
      : ['아내가 임신한 뒤로 퇴근 시간표를 다시 짰다.', '병원 일정에 맞춰 휴가를 쪼개 쓰기 시작했다.', '초음파 검사 날짜에 맞춰 반차를 미리 냈다.'], c),
    fx: { stats: { health: -1, leisure: -2, relations: 1 } },
    reason: '임신 중 출근',
  },
  {
    id: 'youth.infertility', ages: [30, 34], p: 0.1, once: true, tags: ['y.baby'], sensitive: 'illness',
    when: L => married(L) && kids(L).length === 0 && L?.family?.marriedYear != null && L.year - L.family.marriedYear >= 3,
    text: '아이 소식 없이 결혼 3년이 지났다. 병원 예약 날짜가 잡혔다.',
    fx: { stats: { happiness: -1 } },
    do: (L, act) => act.flag('infertile', true),
    reason: '난임 진단',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'continue', label: '시술을 이어 간다', fx: { stats: { happiness: 2, health: -2, wealth: -3, leisure: -2, relations: 1 } }, result: '병원 일정에 맞춰 근무표를 다시 짰다.', hint: '병원 상담을 이어 가는 쪽' },
        { id: 'pause', label: '잠시 쉰다', fx: { stats: { happiness: 1, leisure: 2, health: 1, wealth: -1 } }, result: '한 해는 병원 대신 산책로를 걸었다.', do: (L, act) => act.flag('childWait', L.year + 2) },
        { id: 'stop', label: '시술을 그만둔다', fx: { stats: { happiness: 1, relations: 1, wealth: 1, leisure: 1 } }, result: '둘이 사는 집의 저녁을 다시 정하기로 했다.', do: (L, act) => act.flag('noChild', true) },
      ],
      default: 'continue',
    },
  },
  {
    id: 'youth.newborn.night', ages: [26, 34], p: 0.5, once: true, tags: ['y.baby'],
    when: L => hasBaby(L, 1),
    text: ['새벽 세 시, 아기를 안고 거실을 돌았다. 불 켜진 창이 한둘 보였다.', '분유 온도를 손목으로 재며 하루가 날짜 없이 흘렀다.', '아기 울음이 멎자 집이 너무 조용해서 잠이 달아났다.'],
    fx: { stats: { health: -2, leisure: -4, happiness: 1 } },
    reason: '신생아와 보낸 새벽',
  },
  {
    id: 'youth.daycare.wait', ages: [27, 34], p: 0.4, once: true, years: [2005, 2100], tags: ['y.baby'], src: ['R06.S23'],
    when: L => hasBaby(L, 2),
    text: ['국공립 어린이집 대기 명단에 이름을 올렸다. 순번은 느리게 줄었다.', '어린이집 대기 순번을 확인하는 것이 아침 일과가 되었다.'],
    fx: { stats: { leisure: -2, happiness: -1, wealth: -1 }, issues: { care: 3 } },
    reason: '어린이집 대기',
  },
  {
    id: 'youth.return.work', ages: [29, 34], p: 0.4, once: true, tags: ['y.baby'], src: ['R06.S29'],
    when: L => L?.flags?.breakYear != null && employed(L) && (L?.job?.years ?? 9) <= 1,
    text: ['면접관이 이력서의 공백 구간을 짚었다. 사실대로 짧게 답했다.', '경력 공백을 묻는 질문에 준비해 둔 문장을 꺼냈다.'],
    fx: { stats: { happiness: -1, intellect: 1, wealth: 1 } },
    reason: '경력 공백을 묻는 면접',
  },
  {
    id: 'youth.single.evening', ages: [28, 34], p: 0.2, once: true,
    when: L => !L?.family?.partner && apart(L),
    text: ['퇴근길에 장을 보고 국을 끓였다. 텔레비전 소리가 집을 채웠다.', '혼자 먹는 저녁에도 밥상을 제대로 차렸다. 설거지까지가 하루였다.', '저녁 여덟 시, 불을 낮추고 좋아하는 음악을 틀었다.'],
    fx: { stats: { happiness: 2, leisure: 2 } },
    reason: '혼자 사는 저녁의 루틴',
  },
  {
    id: 'youth.friend.weddings', ages: [27, 34], p: 0.15, cooldown: 4, tags: ['y.wedding'],
    when: L => !married(L),
    text: ['주말마다 정장을 입고 예식장에 갔다. 이번 달만 세 번째였다.', '청첩장 단톡방이 달마다 새로 생겼다.', '같은 친구들을 이번 달에만 예식장에서 두 번 만났다.'],
    fx: { stats: { relations: 2, wealth: -2, leisure: -1 } },
    reason: '친구 결혼식이 이어짐',
  },

  // ───────── 생활·돈·건강 ─────────
  {
    id: 'youth.hobby', ages: [20, 34], p: 0.1, once: true,
    text: era([[1960, '쉬는 날 뭘 할지 몰라 텔레비전만 보다가 하루가 갔다.'], [2010, '쉬는 날 뭘 할지 몰라 휴대폰만 보다가 하루가 갔다.']]),
    reason: '취미를 찾음',
    choice: {
      prompt: '무엇을 해 볼까?',
      options: [
        { id: 'run', label: '달리기를 시작한다', fx: { stats: { health: 3, leisure: 1, wealth: -1 } }, result: '운동화를 사고 첫 주에 두 번 나갔다.' },
        { id: 'music', label: '악기를 배운다', fx: { stats: { happiness: 2, intellect: 1, wealth: -2, leisure: -1 } }, result: '기타 줄이 손끝에 자국을 남겼다.' },
        { id: 'club', label: '모임에 나가 본다', fx: { stats: { relations: 3, wealth: -1, leisure: -1 } }, result: '동네 독서 모임에서 이름 대신 닉네임으로 불렸다.' },
      ],
      default: 'run',
    },
  },
  {
    id: 'youth.invest', ages: [22, 34], p: 0.08, once: true, years: [2017, 2100], tags: ['y.money'],
    text: era([
      [2017, '"비트코인"이라는 단어가 점심시간 대화에 끼기 시작했다.'],
      [2020, '주식 계좌를 만든 동료가 점심마다 차트를 보여 주었다.'],
      [2022, '금리가 오르자 점심시간 차트 이야기가 조금 조용해졌다.'],
    ]),
    reason: '투자 권유',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'stock', label: '주식을 산다', fx: { stats: { wealth: 2, leisure: -1, happiness: -1 } }, result: '월급 일부로 적립식 계좌를 열었다.' },
        { id: 'coin', label: '코인을 산다', fx: { stats: { relations: 2, wealth: -3, leisure: -3, health: -1 } }, result: '밤새 시세창을 보다 아침을 맞았다.' },
        { id: 'none', label: '안 한다', fx: { stats: { leisure: 2, happiness: 1, relations: -1 } }, result: '점심 대화에서 한동안 말수가 줄었다.' },
      ],
      default: 'none',
    },
  },
  {
    id: 'youth.card.debt', ages: [20, 27], once: true, years: [2002, 2100], tags: ['y.money'],
    p: L => (L?.year >= 2002 && L?.year <= 2004 ? 0.15 : 0.02),
    text: era([
      [2002, '카드 결제일이 겹쳤다. 현금서비스로 다른 카드를 막았다.'],
      [2006, '카드 두 장의 결제일이 겹쳤다. 한 장으로 다른 한 장을 막았다.'],
    ]),
    reason: '카드 돌려막기',
    choice: {
      prompt: '어떻게 정리할까?',
      options: [
        { id: 'consolidate', label: '대출로 정리한다', fx: { stats: { wealth: -2, happiness: -1 } }, result: '이자율은 낮아졌고 상환 기간은 길어졌다.' },
        { id: 'counsel', label: '신용 상담을 받는다', fx: { stats: { happiness: 2, intellect: 1, leisure: -1 } }, result: '신용회복 상담에서 상환 계획표를 받았다.' },
        { id: 'cut', label: '지출을 줄여 갚는다', fx: { stats: { wealth: 1, leisure: -4, happiness: -1 } }, result: '점심을 도시락으로 바꾸고 외식을 끊었다.' },
      ],
      default: 'counsel',
    },
  },
  {
    id: 'youth.checkup', ages: [25, 34], p: 0.15, once: true,
    when: employed,
    text: (L, c) => pickOf(L?.health?.smoker === 1
      ? ['결과지 한쪽에 금연 상담 안내가 붙어 있었다.', '건강검진 결과지의 흡연 항목에 동그라미가 쳐져 있었다.']
      : ['회사 건강검진 날 공복으로 줄을 섰다. 결과는 대부분 "양호"였다.', '첫 직장 건강검진 결과지의 숫자 몇 개에만 밑줄이 있었다.'], c),
    fx: { stats: { health: 1, happiness: 1 } },
    reason: '첫 직장 건강검진',
  },
  {
    id: 'youth.low.mood', ages: [20, 34], p: 0.05, once: true, tags: ['y.mind'], sensitive: 'illness',
    text: '몇 달째 아무것도 하고 싶지 않았다. 아침이 오면 몸이 무거웠다.',
    fx: { stats: { happiness: -2 } },
    reason: '오래 가는 무거운 마음',
    choice: {
      prompt: '누구에게 말할까?',
      options: [
        { id: 'clinic', label: '병원에 가 본다', fx: { stats: { health: 2, happiness: 3, wealth: -3, leisure: -2 } }, result: '진료실에서 처음으로 이야기를 끝까지 했다.', hint: '전문가와 이야기하는 쪽' },
        { id: 'friend', label: '친구에게 말한다', fx: { stats: { relations: 3, happiness: 2, leisure: -1 } }, result: '친구가 말을 끊지 않고 끝까지 들어 주었다.', hint: '가까운 사람에게 먼저 말하는 쪽' },
        { id: 'family', label: '가족에게 말한다', fx: { stats: { relations: 2, happiness: 1, wealth: 1, leisure: -1 } }, result: '가족이 말없이 밥을 차려 놓고 곁에 앉았다.' },
      ],
      default: 'clinic',
    },
  },
  {
    id: 'youth.parent.hospital', ages: [25, 34], p: 0.06, once: true, sensitive: 'illness',
    when: L => parentsAlive(L).some(p => (p.age ?? 0) >= 50),
    text: (L, c) => {
      const f = L?.family?.parents?.father?.alive, m = L?.family?.parents?.mother?.alive;
      return pickOf(f && !m ? ['아버지가 처음 입원했다. 병실 복도에서 보호자 서명란을 채웠다.']
        : m && !f ? ['어머니가 처음 입원했다. 수납 창구 앞에서 줄을 섰다.']
          : ['부모님 한 분이 처음 입원했다. 보호자 침대는 접이식이었다.', '부모님 한 분이 처음 입원했다. 병원비 정산서를 접어 넣었다.'], c);
    },
    fx: { stats: { happiness: -2, wealth: -1, leisure: -2, relations: 1 }, issues: { care: 3, medical: 2 } },
    reason: '부모의 첫 입원',
  },
  {
    id: 'youth.loan.repay', ages: [25, 34], p: 0.4, once: true, src: ['R03.S21'],
    when: L => (L?.money?.loans?.student ?? 0) > 0 && L?.edu?.stage === 'done',
    text: '졸업 뒤 첫 상환 고지서가 왔다. 원금보다 이자가 먼저 눈에 들어왔다.',
    fx: { stats: { wealth: -2, leisure: -1 } },
    reason: '학자금 상환 시작',
  },

  // ───────── 진로·지역·삶의 선택 ─────────
  {
    id: 'youth.to.seoul', ages: [22, 30], p: 0.09, once: true, tags: ['y.region'],
    when: L => !!L?.home?.region && !CAPITAL.includes(L.home.region) && !married(L),
    text: '서울 회사에서 면접 연락이 왔다. 기차표 값부터 계산했다.',
    reason: '서울로 갈지의 선택',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        {
          id: 'go', label: '서울로 올라간다', fx: { stats: { wealth: 2, relations: -2, leisure: -2 }, issues: { housing: 4 } }, result: '짐을 줄여 올라왔고 월세 계약서에 서명했다.',
          do: (L, act) => { act.moveRegion('seoul', { reason: '취업' }); if (!L?.home?.owned) act.move('monthly', { reason: '일자리', silent: true }); },
        },
        { id: 'stay', label: '고향에 남는다', fx: { stats: { relations: 2, happiness: 1, wealth: -1 }, issues: { region: 3 } }, result: '이 지역 일자리를 다시 알아보며 계절을 보냈다.' },
      ],
      default: 'stay',
    },
  },
  {
    id: 'youth.hometown.job', ages: [22, 30], p: 0.08, once: true, tags: ['y.region'],
    when: L => CAPITAL.includes(L?.home?.region) && !!L?.birth?.region && !CAPITAL.includes(L.birth.region) && !married(L),
    text: era([[1960, '고향 지역 기업의 채용 공고가 신문에 났다.'], [1998, '고향 지역 기업의 채용 공고를 인터넷에서 보았다.'], [2012, '고향 지역 기업의 채용 공고가 알림으로 왔다.']]),
    reason: '고향 일자리를 고민함',
    choice: {
      prompt: '지원할까?',
      options: [
        {
          id: 'apply', label: '고향 일자리에 지원', fx: { stats: { relations: 3, leisure: 2, wealth: -2, happiness: 1 }, issues: { region: -2 } }, result: '짐을 줄여 고향 집 근처에 방을 구했다.',
          do: (L, act) => { act.moveRegion(L?.birth?.region, { reason: '귀향 취업' }); if (!L?.home?.owned) act.move('monthly', { reason: '고향으로', silent: true }); },
        },
        { id: 'stay', label: '수도권에 남는다', fx: { stats: { wealth: 1, relations: -1, leisure: -1 }, issues: { housing: 3 } }, result: '주말 기차표를 몇 장 더 끊게 되었다.', hint: '이미 자리 잡은 곳에 남는 경향' },
      ],
      default: 'stay',
    },
  },
  {
    id: 'youth.working.holiday', ages: [20, 30], p: 0.05, once: true, years: [1995, 2100],
    when: L => !married(L) && L?.mil?.status !== 'serving',
    text: '친구의 워킹홀리데이 출국 소식에 비자 신청 페이지를 열었다.',
    reason: '워킹홀리데이를 고민함',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'go', label: '떠난다', fx: { stats: { happiness: 3, intellect: 2, leisure: 3, relations: -2, wealth: -3 }, money: { assets: -1500 } }, result: '1년짜리 비자를 받아 짐 하나를 들고 출국했다.' },
        { id: 'stay', label: '가지 않는다', fx: { stats: { wealth: 1, relations: 1, leisure: -1, happiness: -1 } }, result: '대신 여름휴가 때 짧게 다녀오기로 했다.', hint: '대부분은 일상을 이어 간다' },
      ],
      default: 'stay',
    },
  },
  {
    id: 'youth.grad.school', ages: [23, 30], p: 0.05, once: true,
    when: L => L?.edu?.level === '4yr' && L?.edu?.stage === 'done',
    text: '지도교수가 대학원 이야기를 꺼냈다. 연구실 문 앞에서 잠시 멈췄다.',
    reason: '대학원 진학 고민',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'go', label: '진학한다', fx: { stats: { intellect: 3, wealth: -3, leisure: -2 } }, result: '연구실 책상 하나가 내 자리가 되었다.' },
        { id: 'work', label: '취업을 이어 간다', fx: { stats: { wealth: 2, relations: 1 } }, result: '지원서를 이어 쓰며 연구실 이야기는 접어 두었다.' },
        { id: 'later', label: '일하다가 나중에 간다', fx: { stats: { intellect: 1, wealth: 1, leisure: -1 } }, result: '입학 안내서를 서랍 위쪽 칸에 넣어 두었다.' },
      ],
      default: 'work',
    },
  },
  {
    id: 'youth.pet', ages: [24, 34], p: 0.08, once: true,
    text: (L, c) => pickOf(renter(L)
      ? ['보호소 사진 속 눈과 마주쳤다. 계약서의 특약이 떠올랐다.']
      : ['보호소 사진 속 눈과 마주쳤다. 집 안 빈자리가 떠올랐다.'], c),
    reason: '반려동물을 들일지의 선택',
    choice: {
      prompt: '데려올까?',
      options: [
        { id: 'adopt', label: '데려온다', fx: { stats: { happiness: 4, relations: 2, wealth: -2, leisure: -2 } }, result: '첫날 밤 낯선 방에서 둘 다 잠들지 못했다.' },
        { id: 'later', label: '아직은 미룬다', fx: { stats: { wealth: 1, leisure: 1, happiness: -2, relations: -1 } }, result: '보호소 소식만 가끔 찾아보았다.', hint: '집 사정 때문에 미루는 경우가 흔하다' },
      ],
      default: 'later',
    },
  },
  {
    id: 'youth.first.vote', ages: [19, 20], once: true, tags: ['y.civic'],
    p: L => (ELECTION.has(L?.year) && L?.age >= voteAge(L.year) ? (L.year >= 2020 ? 0.15 : 0.4) : 0),
    text: era([
      [1960, '투표소에서 처음으로 신분증을 내밀었다. 기표 칸은 생각보다 작았다.'],
      [2020, '투표소 줄에 섰다. 한 표는 작았고 기표소는 좁았다.'],
    ]),
    fx: { stats: { relations: 1, happiness: 1 } },
    reason: '투표소에 간 날',
  },
];
