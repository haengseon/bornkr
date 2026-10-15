// 콘텐츠 C — 노년기(55세~) 우연 사건. 형식: ARCHITECTURE §8, 카탈로그: GDD §9.4 '콘텐츠 C'(late 35 + 추가 1).
// 톤: 노년의 존엄을 지킨다. 희화화·동정 없이 일상의 사실만. 질병·치매·장애는 의료 접근성·돌봄·비용의 문제로 쓰고 지력을 깎지 않는다.
// 사별·고립·학대·부고는 비그래픽 한 줄 + sensitive/도움 경로. 고립을 개인 탓으로 그리지 않는다.
// 노년기는 우연 선택 슬롯이 적어(GDD §2.2, late chance 1) 선택 사건 p를 낮게 둔다.
import { pk, kids, working, wealth, cond, owned, heat } from './mid.js';

const exited = L => L?.flags?.mainExited != null;
const idle = L => !working(L) && exited(L);
const widowed = L => !!L?.family?.widowed && !L?.family?.partner;
const addLicense = (L, k) => [...new Set([...(L?.flags?.licenses ?? []), k])];

export default [
  // ───────── 퇴직과 일 ─────────
  {
    id: 'late.farewell', ages: [55, 62], p: 0.5, once: true, when: L => exited(L) && L.year - L.flags.mainExited <= 1,
    text: ['송별회에서 받은 꽃다발이 현관에 오래 놓여 있었다.', '마지막 출근 날, 책상 서랍을 비우는 데 한 시간이 걸렸다.'],
    fx: { stats: { happiness: -1, relations: 1, leisure: 2 } },
    reason: '퇴직 송별회',
  },
  {
    id: 'late.guard.job', ages: [58, 72], p: L => (L?.sex === 'F' ? 0.03 : 0.1), once: true, when: idle, tags: ['oldwork'],
    text: '아파트 경비 모집 공고를 보았다. 격일 근무였다.',
    reason: '아파트 경비 재취업',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        {
          id: 'work', label: '일을 시작한다', fx: { stats: { wealth: 3, leisure: -3, health: -1 } },
          do: (L, act) => act.startJob({ code: '94201', title: '아파트 경비원', major: '9', band: 1, ai: 'low', hazard: 2, public: false, regular: false, firmSize: 'micro', wage: 2000 }),
          result: '격일 24시간 근무였고, 쉬는 날은 잠으로 갔다.', hint: '생활비 때문에 흔한 선택',
        },
        { id: 'rest', label: '쉬기로 한다', fx: { stats: { leisure: 3, wealth: -2, health: 1 } }, do: (L, act) => act.retire(), result: '일하지 않는 아침이 느리게 지나갔다.' },
      ],
      default: 'work',
    },
  },
  {
    id: 'late.cleaning.job', ages: [58, 72], p: L => (L?.sex === 'F' ? 0.08 : 0.03), once: true, tags: ['oldwork'],
    when: L => idle(L) && wealth(L) < 55,
    text: '새벽 네 시, 불 꺼진 건물에 불을 켜고 청소를 시작했다.',
    fx: { stats: { wealth: 2, health: -2, leisure: -3 } },
    do: (L, act) => act.startJob({ code: '94110', title: '건물 청소원', major: '9', band: 1, ai: 'low', hazard: 2, public: false, regular: false, firmSize: 'micro', wage: 1800 }),
    reason: '새벽 청소 일',
  },
  {
    id: 'late.carer.job', ages: [55, 68], p: 0.05, once: true, when: idle, tags: ['oldwork'],
    text: '요양보호사 교육 과정을 마쳤다. 자격증이 서랍에 들어갔다.',
    fx: { stats: { intellect: 1, relations: 1, leisure: -1 } },
    do: (L, act) => act.flag('licenses', addLicense(L, 'care')),
    reason: '요양보호사 자격 취득',
  },
  {
    id: 'late.senior.job', ages: [65, 80], years: [2004, 2100], p: 0.1, once: true, tags: ['oldwork'], src: ['R07.S19'],
    when: L => !working(L) && wealth(L) < 60 && L?.flags?.seniorJob == null,
    text: '동네 노인일자리 모집 공고가 붙었다. 경쟁률이 높았다.',
    reason: '노인일자리 신청',
    choice: {
      prompt: '신청할까?',
      options: [
        { id: 'apply', label: '신청한다', fx: { stats: { wealth: 3, relations: 2, leisure: -2 } }, do: (L, act) => act.flag('seniorJob', L.year), result: '추첨에서 이름이 불려 동네 공익활동을 시작했다.' },
        { id: 'skip', label: '신청하지 않는다', fx: { stats: { leisure: 2, relations: -1, wealth: -1 } }, result: '서류는 서랍에 두었고, 오전이 비어 있었다.' },
      ],
      default: 'apply',
    },
  },
  {
    id: 'late.chicken.shop', ages: [55, 62], p: 0.12, once: true, tags: ['oldwork'],
    when: L => exited(L) && L.year - L.flags.mainExited <= 3 && L?.job?.status !== 'self',
    text: '퇴직금으로 치킨집을 열자는 이야기가 나왔다.',
    reason: '퇴직금으로 가게 열기',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'open', label: '가게를 연다', fx: { stats: { leisure: -4, happiness: 1, relations: 1 } }, do: (L, act) => act.startBusiness('치킨집'), result: '간판을 직접 달았고, 첫 주문은 이웃이 했다.' },
        { id: 'no', label: '열지 않는다', fx: { stats: { wealth: 1, leisure: 2 } }, result: '퇴직금은 통장에 두었고, 치킨은 사 먹기로 했다.' },
      ],
      default: 'no',
    },
  },
  {
    id: 'late.income.gap', ages: [60, 64], p: 0.35, once: true, src: ['R07.S15'],
    when: L => !working(L) && L?.aging?.pensionStart == null,
    text: '정년 뒤 연금이 나오기까지 몇 해가 비어 있었다.',
    fx: { stats: { wealth: -3, happiness: -2 }, issues: { job: 3, fairness: 2 } },
    reason: '연금 수령 전 소득 공백',
  },
  {
    id: 'late.basic.apply', ages: [65, 70], years: [2014, 2100], p: 0.25, once: true, src: ['R07.S10'],
    when: L => (L?.aging?.basic ?? 0) > 0,
    text: ['기초연금 신청서를 들고 주민센터 창구에 앉았다.', '기초연금 안내문을 받고 주민센터 창구를 찾았다.'],
    fx: { stats: { wealth: 1, happiness: 1 } },
    reason: '기초연금 신청',
  },

  // ───────── 가족·관계 ─────────
  {
    id: 'late.grandkids.visit', ages: [60, 80], p: 0.2, cooldown: 4, when: L => (L?.family?.grandchildren ?? 0) > 0,
    text: ['손주들이 다녀간 주말, 집이 한참 조용했다.', '손주가 두고 간 장난감을 한동안 치우지 않았다.', '손주들이 현관에서 신발을 아무렇게나 벗어 두었다.', '손주가 그린 그림이 냉장고 문에 새로 붙었다.'],
    fx: { stats: { happiness: 2, relations: 2, leisure: -1 } },
    reason: '손주들의 방문',
  },
  {
    id: 'late.ask.children', ages: [60, 80], p: 0.06, once: true, src: ['R06.S37'],
    when: L => wealth(L) < 45 && kids(L, 25, 60) > 0,
    text: '생활비가 빠듯했다. 자녀에게 말을 꺼낼지 망설였다.',
    reason: '자녀에게 생활비 말하기',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'ask', label: '생활비를 말한다', fx: { stats: { relations: -1, wealth: 2 }, money: { assets: 600 } }, result: '자녀는 말없이 매달 얼마씩 보내기로 했다.' },
        { id: 'hold', label: '말하지 않는다', fx: { stats: { happiness: -1, wealth: -2, relations: 1 } }, result: '장바구니가 가벼워졌고, 전화는 안부만 물었다.', hint: '자녀 부담을 걱정해 흔한 선택' },
      ],
      default: 'hold',
    },
  },
  {
    id: 'late.child.back', ages: [58, 70], p: 0.08, cooldown: 5,
    when: L => kids(L, 25, 40) > 0,
    text: ['성인 자녀가 월세를 감당하지 못해 집으로 돌아왔다.', '성인 자녀의 짐이 다시 작은 방을 채웠다.', '자녀가 돌아오면서 밥상에 수저가 하나 늘었다.'],
    fx: { stats: { relations: 1, leisure: -2, wealth: -1 }, issues: { care: 3, housing: 2 } },
    reason: '성인 자녀의 귀가',
  },
  {
    id: 'late.spouse.care', ages: [65, 90], p: 0.3, cooldown: 5, sensitive: 'illness', src: ['R07.S18'],
    when: L => L?.family?.caringFor === 'spouse',
    text: ['하루의 대부분이 배우자의 식사와 약 시간으로 채워졌다.', '아침마다 배우자의 약 시간을 먼저 확인했다.', '배우자 곁을 떠나지 못해 장 보는 시간이 줄었다.', '하루가 배우자의 식사 시간에 맞춰 흘렀다.'],
    fx: { stats: { health: -2, leisure: -4, happiness: -2 }, issues: { care: 6 } },
    reason: '배우자 간병의 하루',
  },
  {
    id: 'late.alone.meal', ages: [65, 95], p: 0.15, cooldown: 3, when: widowed,
    text: ['밥을 두 공기 짓던 손이 한 공기에서 멈췄다.', '식탁 맞은편 의자는 그대로 두었다. 밥은 한 공기였다.', '식탁에 반찬을 덜어 놓고 혼자 숟가락을 들었다.', '라디오를 켜 둔 채 혼자 밥을 먹었다.'],
    fx: { stats: { happiness: -2, health: -1, relations: -1 } },
    reason: '혼자 먹는 밥',
  },
  {
    id: 'late.senior.center', ages: [65, 90], p: 0.08, once: true, src: ['R07.S18'],
    text: '동네 경로당 문이 열려 있었다. 들어갈지 망설였다.',
    reason: '경로당 첫 방문',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'go', label: '들어가 본다', fx: { stats: { relations: 3, happiness: 1, leisure: -1 } }, result: '점심 한 상을 같이 먹었고, 내일도 오라는 말을 들었다.' },
        { id: 'stay', label: '집에 머문다', fx: { stats: { leisure: 2, relations: -2 } }, result: '혼자 보내는 오후가 편하기도 하고 길기도 했다.', hint: '처음 들어서기 망설여 흔한 선택' },
      ],
      default: 'stay',
    },
  },
  {
    id: 'late.community', ages: [60, 90], p: 0.08, cooldown: 5,
    text: pk(['성당 구역 모임에서 이웃과 김치를 나눠 먹었다.', '교회 새벽 예배 뒤 이웃과 따뜻한 차를 마셨다.', '마을 회관 모임에서 오랜만에 소리 내어 웃었다.', '절에서 점심 공양을 이웃과 나눠 먹었다.', '경로당에서 윷놀이 판이 벌어졌다. 한 판을 이겼다.', '복지관 노래 교실에서 오랜만에 목청을 높였다.']),
    fx: { stats: { relations: 3, happiness: 2 } },
    reason: '종교·동네 모임',
  },
  {
    id: 'late.lonely.evening', ages: [65, 95], p: 0.12, cooldown: 3, when: L => !!L?.aging?.isolated, src: ['R07.S13'],
    text: ['해가 지고도 긴 저녁이었다. 집 안이 조용했다.', '저녁 뉴스가 끝나자 집 안이 더 조용해졌다.', '불을 켜는 시간이 해 지는 시간보다 늦어졌다.'],
    reason: '긴 저녁',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'call', label: '안부 전화를 건다', fx: { stats: { relations: 2, happiness: 1 } }, result: '신호가 세 번 갔고, 상대가 반갑게 받았다.' },
        { id: 'center', label: '복지관에 가 본다', fx: { stats: { relations: 3, health: 1, leisure: -2 } }, result: '복지관 프로그램 표에서 오전 수업 하나를 골랐다.' },
        { id: 'tv', label: 'TV를 켜 둔다', fx: { stats: { leisure: 1, happiness: -1, relations: -1 } }, result: '화면 소리가 방을 채웠지만 대답은 없었다.' },
      ],
      default: 'call',
    },
  },
  {
    id: 'late.friend.obit', ages: [65, 95], p: 0.15, cooldown: 5, sensitive: 'death',
    text: ['오랜 친구의 부고 문자가 왔다. 장례식장 위치를 한참 보았다.', '오랜 친구의 부고가 왔다. 영정 앞에서 오래 서 있었다.', '오랜 친구의 부고를 받았다. 연락처를 지우지 못했다.', '또 한 사람의 부고 문자가 도착했다.', '친구의 부고를 받고 오래 전화기를 들고 있었다.', '함께 늙던 친구의 부고가 도착했다. 조문 갈 채비를 했다.'],
    fx: { stats: { happiness: -2, relations: -2 } },
    reason: '친구의 부고',
  },
  {
    id: 'late.seventy.reunion', ages: [68, 72], p: 0.3, once: true,
    text: '칠순을 맞아 동창들이 모였다. 오는 사람이 해마다 줄었다.',
    fx: { stats: { relations: 2, happiness: 1 } },
    reason: '칠순 동창 모임',
  },

  // ───────── 디지털·사회 ─────────
  {
    id: 'late.kiosk', ages: [65, 90], years: [2015, 2100], p: 0.12, cooldown: 4,
    text: ['식당 입구에 키오스크만 놓여 있었다. 뒤에 줄이 생겼다.', '병원 접수처에도 키오스크가 놓였다. 줄이 길었다.', '버스 터미널 매표기가 화면으로 바뀌었다.'],
    reason: '키오스크 주문',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'try', label: '직접 눌러 본다', fx: { stats: { happiness: 2, intellect: 2, leisure: -1 }, issues: { tech: 2 } }, result: '화면을 몇 번 헤맨 끝에 주문했고, 영수증이 뿌듯했다.' },
        { id: 'call', label: '직원을 부른다', fx: { stats: { relations: 1, happiness: -1 }, issues: { tech: 4 } }, result: '직원이 대신 눌러 주었고, 뒤의 줄은 조금 길어졌다.', hint: '기기가 낯설어 흔한 선택' },
      ],
      default: 'call',
    },
  },
  {
    id: 'late.phone.class', ages: [65, 85], years: [2012, 2100], p: 0.08, once: true,
    text: '주민센터 스마트폰 교실에서 영상통화를 처음 배웠다.',
    fx: { stats: { intellect: 1, relations: 2, happiness: 1 }, issues: { tech: -2 } },
    reason: '스마트폰 교실',
  },
  {
    id: 'late.scam.call', ages: [60, 90], years: [2006, 2100], p: 0.04, cooldown: 5, when: L => kids(L, 0, 80) > 0,
    text: ['"자녀가 사고를 당했다"는 낯선 전화가 걸려 왔다.', '"자녀가 급하게 돈이 필요하다"는 문자가 낯선 번호로 왔다.', '자녀 이름을 아는 낯선 전화가 합의금을 보내라고 했다.'],
    reason: '보이스피싱 전화',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'hangup', label: '끊는다', fx: { stats: { happiness: -1, leisure: -2 } }, result: '손이 떨렸지만 전화를 끊고 112에 신고했다.' },
        { id: 'verify', label: '자녀에게 확인 전화', fx: { stats: { relations: 1, happiness: -2, leisure: -1 } }, result: '자녀가 바로 받았고, 가슴이 한참 뛰었다.' },
        { id: 'send', label: '시키는 대로 한다', fx: { stats: { wealth: -6, happiness: -3 }, money: { assets: -2000 } }, result: '놀란 마음이 먼저 움직였고, 돈은 돌아오지 않았다.' },
      ],
      default: 'hangup',
    },
  },

  // ───────── 건강·돌봄 ─────────
  {
    id: 'late.knee.surgery', ages: [60, 85], p: 0.06, once: true, sensitive: 'illness',
    when: L => cond(L, 'arthritis') || (L?.stats?.health ?? 100) < 55,
    text: '무릎 통증이 계단을 막았다. 수술 이야기가 나왔다.',
    reason: '무릎 수술 여부',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'do', label: '수술을 받는다', fx: { stats: { health: 5, leisure: -2, wealth: -2 }, money: { assets: -300 } }, result: '대기는 석 달이었고, 재활은 그보다 길었다.' },
        { id: 'wait', label: '미룬다', fx: { stats: { health: -3, wealth: 1, leisure: 1, happiness: -1 } }, result: '진통제와 지팡이로 한 해를 났다.', hint: '비용과 입원이 부담되는 경우' },
      ],
      default: 'wait',
    },
  },
  {
    id: 'late.far.hospital', ages: [65, 90], p: 0.1, cooldown: 4,
    when: L => (L?.birth?.urban === false || L?.home?.regionGroup === 'province') && !!L?.health?.conditions?.some(c => c.active),
    text: ['큰 병원까지 버스를 두 번 갈아탔다. 왕복이 하루였다.', '진료 한 번을 위해 새벽 첫차를 탔다.', '병원 가는 날은 하루를 통째로 비워야 했다.', '읍내에는 없는 진료과라 시내까지 나갔다.'],
    fx: { stats: { health: -1, leisure: -2 }, issues: { medical: 4, region: 3 } },
    reason: '큰 병원까지의 거리',
  },
  {
    id: 'late.cancer.treat', ages: [55, 85], p: 0.95, cooldown: 5, sensitive: 'illness',
    when: L => L?.health?.dx?.cancer === L?.year,
    text: '진단 뒤 치료 계획을 세워야 했다. 병원마다 설명이 달랐다.',
    reason: '암 치료 방식',
    choice: {
      prompt: '치료를 어디서 받을까?',
      options: [
        { id: 'big', label: '서울 큰 병원', fx: { stats: { health: 3, wealth: -5, leisure: -4, relations: -2 }, money: { assets: -300 } }, result: '새벽 기차로 오가며 진료 대기 번호를 받았다.' },
        { id: 'near', label: '가까운 병원', fx: { stats: { health: 1, wealth: -3, leisure: -2 } }, result: '집에서 가까운 병원에서 정해진 날짜에 치료를 받았다.', hint: '거리와 비용 때문에 흔한 선택' },
        { id: 'light', label: '최소한의 치료', fx: { stats: { health: -2, wealth: -1, happiness: 1, leisure: 1 } }, result: '치료는 줄이고, 일상을 지키는 쪽으로 계획을 세웠다.' },
      ],
      default: 'near',
    },
  },
  {
    id: 'late.memory.fade', ages: [70, 95], p: 0.25, cooldown: 3, sensitive: 'illness', when: L => cond(L, 'dementia'),
    text: ['기억이 흐려지는 날이 늘었다. 냉장고에 가족의 메모가 붙었다.', '오늘이 며칠인지 가끔 물었다. 가족이 달력에 큰 글씨로 적었다.', '장 볼 것을 메모지에 적어 갔다가 메모지를 두고 왔다.', '현관문 앞에서 열쇠를 어디 뒀는지 한참 찾았다.'],
    fx: { stats: { happiness: -1, leisure: -2 }, issues: { care: 4, medical: 3 } },
    reason: '기억이 흐려지는 날들',
  },
  {
    id: 'late.care.visit', ages: [70, 95], p: 0.25, cooldown: 3,
    when: L => L?.health?.care === 'home' && (L?.aging?.ltc ?? 0) > 0,
    text: ['방문요양 보호사가 오는 시간이 하루의 기준이 되었다.', '보호사가 두고 간 반찬 통에 오늘 날짜가 적혀 있었다.', '방문요양 보호사가 오는 날이면 청소를 먼저 했다.', '보호사와 점심 반찬을 정하는 일이 하루의 낙이 되었다.'],
    fx: { stats: { relations: 2, happiness: 1, leisure: 1 }, issues: { care: -2 } },
    reason: '방문요양 보호사',
  },
  {
    id: 'late.facility.first', ages: [70, 95], p: 0.35, once: true,
    when: L => L?.health?.care === 'facility' || L?.home?.tenure === 'facility',
    text: '요양원의 첫 밤이었다. 침대 옆에 내 이름표가 붙어 있었다.',
    fx: { stats: { happiness: -2, relations: -1, leisure: -1 }, issues: { medical: 2 } },
    reason: '요양원 입소',
  },
  {
    id: 'late.hearing.aid', ages: [70, 95], p: 0.08, once: true,
    text: '보청기 가격표가 한 달 생활비와 비슷했다.',
    reason: '보청기 구입 여부',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'buy', label: '보청기를 산다', fx: { stats: { relations: 3, happiness: 2, wealth: -3 }, money: { assets: -150 } }, result: '귀 뒤에 작은 기기를 끼우자 빗소리가 또렷했다.' },
        { id: 'delay', label: '미룬다', fx: { stats: { wealth: 1, relations: -2, happiness: -1 } }, result: '텔레비전 소리가 커졌고, 가족은 같은 말을 두 번 했다.', hint: '가격 때문에 미루는 경우가 많다' },
      ],
      default: 'delay',
    },
  },
  {
    id: 'late.neglect', ages: [75, 95], p: 0.002, once: true, sensitive: 'abuse', src: ['R07.S12'],
    when: L => (L?.aging?.ltc ?? 0) > 0 || (L?.stats?.health ?? 100) < 40,
    text: '돌봐 줄 사람이 오지 않는 날이 이어졌다. 상담은 1577-1389.',
    fx: { stats: { health: -3, happiness: -3, relations: -1 }, issues: { care: 4 } },
    reason: '돌봄 방임',
  },

  // ───────── 삶의 정리 ─────────
  {
    id: 'late.funeral.plan', ages: [70, 95], p: 0.05, once: true,
    text: '상조 회사 직원이 찾아와 장례 이야기를 꺼냈다.',
    reason: '상조 가입 여부',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'join', label: '가입한다', fx: { stats: { happiness: 3, relations: 1, wealth: -2 }, money: { assets: -200 } }, result: '월 납입 통장이 하나 늘었고, 마음은 한결 가벼웠다.' },
        { id: 'skip', label: '가입하지 않는다', fx: { stats: { wealth: 1, happiness: -2 } }, result: '가족과 이야기해 두었으니 됐다고 했다.' },
      ],
      default: 'skip',
    },
  },
  {
    id: 'late.will', ages: [70, 95], p: 0.05, once: true, when: L => wealth(L) >= 35 || owned(L),
    text: '남기는 것을 미리 정리해 두자는 생각이 들었다.',
    reason: '재산 정리 방식',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'give', label: '미리 나눈다', fx: { stats: { relations: 3, wealth: -3, happiness: 1 } }, result: '자녀들을 불러 몫을 설명하고 서류를 건넸다.' },
        { id: 'will', label: '유언장을 쓴다', fx: { stats: { happiness: 2, leisure: -1 } }, result: '공증 사무실에서 서류에 이름을 쓰고 인감을 찍었다.' },
        { id: 'keep', label: '그대로 둔다', fx: { stats: { relations: -1, happiness: -2, leisure: 1 } }, result: '말을 꺼내지 못한 채 서류철이 서랍에 남았다.', hint: '말 꺼내기 어려워 흔한 선택' },
      ],
      default: 'keep',
    },
  },
  {
    id: 'late.trip', ages: [60, 75], p: 0.04, once: true,
    text: '한 번쯤 멀리 다녀오자는 이야기가 나왔다.',
    reason: '한 번의 여행',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'go', label: '다녀온다', fx: { stats: { happiness: 3, leisure: 2, wealth: -3 }, money: { assets: -300 } }, result: '가방을 싸는 일부터 즐거웠다.' },
        { id: 'save', label: '아낀다', fx: { stats: { wealth: 1, happiness: -1, leisure: -1 } }, result: '다음에 가자고 했고, 지출은 없었다.' },
      ],
      default: 'save',
    },
  },
  {
    id: 'late.album', ages: [70, 95], p: 0.08, once: true,
    text: '옛 사진을 정리했다.',
    fx: { stats: { happiness: 1, relations: 1 } },
    reason: '옛 사진 정리',
  },
  {
    id: 'late.garden', ages: [60, 85], p: 0.1, once: true,
    text: '빌린 텃밭에 상추를 심었다. 이웃이 모종을 나눠 주었다.',
    fx: { stats: { happiness: 2, health: 1, relations: 1 } },
    reason: '텃밭',
  },

  // ───────── 계절·생활비 ─────────
  {
    id: 'late.heat.shelter', ages: [65, 95], years: [2012, 2100], p: L => (heat(L) ? 0.45 : 0), cooldown: 3, src: ['R08.S25'],
    when: L => !!L?.family?.livingAlone,
    text: ['집 안이 찜통이 되어 무더위 쉼터까지 걸어갔다.', '더위를 피해 경로당 에어컨 앞에 자리를 잡았다.', '낮 기온이 올라 선풍기 앞에서 하루를 보냈다.', '집 안보다 시원한 공원 벤치로 나가 하루를 보냈다.'],
    fx: { stats: { health: -1, relations: 1 }, issues: { living: 3 } },
    reason: '무더위 쉼터',
  },
  {
    id: 'late.cold.room', ages: [65, 95], p: L => ([2022, 2023].includes(L?.year) ? 0.4 : 0.1), cooldown: 5, when: L => wealth(L) < 35,
    text: ['난방을 아끼느라 방 하나만 데우고 지냈다.', '한겨울에도 두꺼운 양말을 겹쳐 신고 보일러를 껐다.', '전기장판 하나로 겨울 저녁을 났다.', '난방비 고지서가 올까 봐 보일러 온도를 낮췄다.'],
    fx: { stats: { health: -2, happiness: -1 }, issues: { living: 4 } },
    reason: '난방을 아끼는 겨울',
  },
];
