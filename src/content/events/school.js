// 콘텐츠 A — 학령기(7~18세) 우연 사건 48건. 형식: ARCHITECTURE §8, 카탈로그: GDD §9.4 '콘텐츠 A'.
// 톤: 아이 시점의 사실. 부모·교사·친구를 조롱하지 않고, 가난·장애·다문화·한부모는 구조·접근성의 문제로 쓴다.
// 학교폭력·학대: 비그래픽 한 줄 + sensitive. 선택지는 도움·관계 경로를 포함하고 '침묵'만 있는 구조를 두지 않는다.
// 정답/오답 없음 — 선택마다 얻는 것과 잃는 것. 시대 구분은 years·era()로.
import { era, pk, Q, moved } from './early.js';

// 학교폭력 피해·목격 응답률(2026 1차 전수, R03 §8.1·§8.2)을 학교급별 기준값으로, 연도 보정은 2026 대비 비율.
// 2013 이전은 조사 정의가 달라 .5로 둔다 [추정].
const VICTIM = { elem: 0.057, mid: 0.023, high: 0.008 };
const WITNESS = { elem: 0.11, mid: 0.068, high: 0.026 };
const VF = [[0, 0.5], [2013, 0.76], [2014, 0.48], [2015, 0.34], [2016, 0.31], [2018, 0.45], [2019, 0.55], [2020, 0.31], [2021, 0.38], [2022, 0.59], [2023, 0.66], [2024, 0.72], [2025, 0.86], [2026, 1]];
const vf = y => VF.reduce((f, [from, v]) => (y >= from ? v : f), VF[0][1]);
const lvl = a => (a <= 12 ? 'elem' : a <= 15 ? 'mid' : 'high');
const poor = L => (L?.household?.netWorth ?? 1) < 0 || (Q(L) <= 2 && (L?.stats?.wealth ?? 50) < 30);

export default [
  // ───────── 입학·교실·친구 ─────────
  {
    id: 'school.first.day', ages: [7, 7], p: 0.4, once: true,
    text: era([
      [1960, '가슴에 손수건과 이름표를 달고 줄을 섰다.'],
      [1986, '이름표를 단 채 운동장에 줄을 섰다. 번호는 키 순이었다.'],
      [2000, '입학식 날, 교문 앞에서 엄마와 사진을 찍었다.'],
      [2020, '입학식 대신 4월에 화면으로 첫 수업을 들었다.'],
      [2021, '마스크를 쓴 입학식이 교실에서 열렸다. 얼굴이 반만 보였다.'],
      [2022, '입학식 날, 교문 앞에서 엄마와 사진을 찍었다.'],
    ]),
    fx: { stats: { happiness: 1, relations: 1 } },
    reason: '입학',
  },
  {
    id: 'school.deskmate', ages: [7, 12], p: 0.1, once: true,
    text: ['짝꿍과 책상 가운데 금을 그었다. 금은 이틀 만에 지워졌다.', '새 짝꿍은 지우개를 자주 빌려 갔다. 돌려주기도 했다.', '짝이 바뀐 날, 옆자리 아이의 필통부터 눈에 들어왔다.'],
    fx: { stats: { relations: 2, happiness: 1 } },
    reason: '짝꿍',
  },
  {
    id: 'school.sports.day', ages: [8, 12], p: 0.12, once: true,
    text: era([
      [1960, '운동회 날 운동장에 만국기가 걸렸다. 도시락이 소풍 같았다.'],
      [1995, ['이어달리기에서 바통을 놓쳤다. 그래도 웃음이 났다.', '운동회 달리기에서 꼴찌를 했다. 그래도 박수를 받았다.']],
    ]),
    fx: { stats: { happiness: 2, relations: 1, health: 1 } },
    reason: '운동회',
  },
  {
    id: 'school.friend.fallout', ages: [10, 17], p: 0.06, cooldown: 4,
    text: ['단짝이 새 무리와 점심을 먹기 시작했다.', '늘 같이 걷던 하굣길을 단짝이 다른 아이들과 걸었다.', '쉬는 시간마다 붙어 다니던 단짝이 다른 자리에 앉았다.', '단짝의 생일 모임 초대 목록에 내 이름이 없었다.'],
    reason: '단짝과 멀어짐',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'reach', label: '먼저 연락한다', fx: { stats: { relations: 2, happiness: -1 } }, result: '먼저 말을 걸었고, 답이 조금 늦게 왔다.' },
        { id: 'wait', label: '기다려 본다', fx: { stats: { happiness: -2, leisure: 1, relations: -1 } }, result: '한동안 혼자 먹었고, 어느 날 다른 아이가 옆에 앉았다.' },
        { id: 'new', label: '다른 친구를 찾는다', fx: { stats: { relations: 1, intellect: 1 } }, result: '도서실에서 같은 책을 읽는 아이를 알게 되었다.' },
      ],
      default: 'wait',
    },
  },
  {
    id: 'school.crush', ages: [13, 18], p: 0.08, once: true,
    text: era([
      [1960, '같은 반 아이에게 마음이 갔다. 복도에서 마주치면 얼굴이 먼저 알았다.'],
      [2000, '메신저 대화명이 바뀔 때마다 그 애 생각이 났다.'],
      [2010, '단톡방에서 그 애의 말투를 몇 번씩 곱씹었다.'],
    ]),
    reason: '첫사랑',
    choice: {
      prompt: '마음을 어떻게 할까?',
      options: [
        { id: 'confess', label: '고백한다', fx: { stats: { relations: 3, happiness: 2, leisure: -2 }, traits: { extra: 2 } }, result: '떨리는 목소리로 말했고, 답은 일주일 뒤에야 왔다.' },
        { id: 'letter', label: '편지만 쓴다', fx: { stats: { intellect: 2, happiness: 1, leisure: -1 }, traits: { open: 1 } }, result: '편지는 서랍에 들어갔고, 문장은 꽤 마음에 들었다.' },
        { id: 'keep', label: '마음에 둔다', fx: { stats: { happiness: -2, leisure: 1 }, traits: { sens: 1 } }, result: '말하지 않았고, 졸업 앨범 속 그 애 얼굴을 오래 보았다.' },
      ],
      default: 'keep',
    },
  },
  {
    id: 'school.club', ages: [13, 17], p: 0.1, once: true,
    text: era([[1960, '특별활동 신청서에는 칸이 하나뿐이었다.'], [1996, '동아리 신청서에는 칸이 하나뿐이었다.']]),
    reason: '동아리 선택',
    choice: {
      prompt: '어디에 쓸까?',
      options: [
        { id: 'broadcast', label: '방송반', fx: { stats: { intellect: 2, relations: 2, leisure: -1 }, traits: { extra: 1 } }, result: '점심시간 방송 원고를 쓰는 일이 생겼다.' },
        { id: 'sports', label: '운동부', fx: { stats: { health: 2, relations: 2, leisure: -4 } }, result: '방과 후 운동장이 내 자리가 되었다.' },
        { id: 'volunteer', label: '봉사 동아리', fx: { stats: { happiness: 3, relations: 2, leisure: -2 } }, result: '격주 토요일마다 복지관에서 도시락을 쌌다.' },
      ],
      default: 'broadcast',
    },
  },
  {
    id: 'school.youth.group', ages: [10, 18], p: 0.05, once: true,
    text: ['일요일마다 교회 청소년부에 갔다. 학교 밖 친구가 생겼다.', '주말 성당 학생회에서 처음으로 학교 밖 친구를 사귀었다.', '청소년 법회에서 처음 절을 해 보았다. 공양이 맛있었다.'],
    fx: { stats: { relations: 3, happiness: 1, leisure: -1 } },
    reason: '학교 밖 모임',
  },
  {
    id: 'school.contest', ages: [10, 17], p: 0.05, once: true,
    text: ['교내 글쓰기 대회에서 상을 받았다. 상장은 문서함에 꽂혔다.', '수학 경시대회에서 장려상을 받았다. 이름이 조회 시간에 불렸다.', '그림 대회 입상 소식을 담임이 먼저 알려 주었다.'],
    fx: { stats: { happiness: 2, intellect: 1, relations: 1 } },
    reason: '대회 입상',
  },
  {
    id: 'school.library.book', ages: [8, 14], p: 0.08, cooldown: 3,
    text: (L, c) => (L?.birth?.urban === false
      ? pk(['학교 도서실의 낡은 책들을 한 권씩 돌려 읽었다.', '도서실 구석의 오래된 전집을 한 권씩 빌렸다.', '이동 도서관 차가 오는 날을 달력에 표시해 두었다.'])(L, c)
      : era([
        [1960, ['학교 도서실에서 빌린 위인전을 하루 만에 다 읽었다.', '도서실 대출 카드가 한 장 가득 찼다.', '쉬는 시간마다 도서실 창가에서 책을 읽었다.']],
        [1990, ['동네 도서관에서 빌린 책을 하루 만에 다 읽었다.', '도서관 대출 한도 열 권을 매번 채워 돌아왔다.', '도서관 열람실 창가 자리가 내 자리가 되었다.']],
      ])(L, c)),
    fx: { stats: { intellect: 2, happiness: 1 } },
    reason: '도서관에서 빌린 책',
  },
  {
    id: 'school.library.group', ages: [13, 18], p: 0.06, once: true,
    text: era([[1960, '방학마다 도서관 열람실에 함께 앉는 모임이 생겼다.'], [2015, '방학마다 스터디 카페 한 칸을 같이 쓰는 모임이 생겼다.']]),
    fx: { stats: { intellect: 2, relations: 1, leisure: -1 } },
    reason: '함께 공부하는 모임',
  },
  {
    id: 'school.dream.change', ages: [12, 16], p: 0.08, once: true,
    text: '장래희망을 적어 내는 날이었다. 작년과 다른 직업을 썼다.',
    reason: '장래희망의 변화',
    choice: {
      prompt: '무엇을 쓸까?',
      options: [
        { id: 'stable', label: '안정적인 직업', fx: { stats: { wealth: 3, intellect: 2, happiness: -2 }, traits: { consc: 1 } }, result: '교사와 공무원 사이에서 오래 고민했다.' },
        { id: 'passion', label: '좋아하는 일', fx: { stats: { happiness: 3, wealth: -1, leisure: -1 }, traits: { open: 2 } }, result: '칸 안에 좋아하는 일을 적었고, 글씨가 조금 커졌다.' },
        { id: 'undecided', label: '아직 모르겠다', fx: { stats: { leisure: 1, wealth: -1, happiness: -1 }, traits: { open: 1 } }, result: '칸을 비워 두었고, 선생님은 괜찮다고 했다.' },
      ],
      default: 'undecided',
    },
  },
  {
    id: 'school.allowance', ages: [9, 14], p: 0.08, once: true,
    text: '명절에 받은 용돈이 한 봉투에 모였다.',
    reason: '용돈을 쓰는 방식',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'save', label: '모은다', fx: { stats: { wealth: 3, happiness: -2, leisure: -1 }, traits: { consc: 1 } }, result: '봉투는 서랍에 넣어 두었고, 저축액이 조금씩 늘었다.' },
        { id: 'spend', label: '문구점에서 쓴다', fx: { stats: { happiness: 3, leisure: 1, wealth: -1 } }, result: '문구점에서 지우개와 스티커를 한 움큼 샀다.' },
        { id: 'share', label: '친구와 나눠 쓴다', fx: { stats: { relations: 3, wealth: -2 } }, result: '떡볶이 값을 번갈아 내자 주머니가 금방 비었다.' },
      ],
      default: 'spend',
    },
  },

  // ───────── 폭력·훈육(비그래픽, 도움 경로 포함) ─────────
  {
    id: 'school.bully.witness', ages: [9, 15], once: true, tags: ['bully'], sensitive: 'violence', src: ['R03.S13'],
    p: L => 0.6 * WITNESS[lvl(L?.age ?? 12)] * vf(L?.year ?? 2026),
    text: ['복도 끝에서 한 아이가 여럿에게 둘러싸여 있었다. 눈이 마주쳤다.', '같은 반 아이 하나가 며칠째 아무도 없는 자리에서 점심을 먹었다.'],
    fx: { stats: { happiness: -2 } },
    reason: '학교에서 괴롭힘을 목격함',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'tell', label: '선생님께 알린다', fx: { stats: { happiness: 2, leisure: 1, relations: -1 } }, result: '선생님이 그 아이를 따로 불렀고, 내 이름은 나오지 않았다.', hint: '어른에게 알리는 쪽' },
        { id: 'stand', label: '그 아이 곁에 선다', fx: { stats: { relations: 3, happiness: -2, leisure: -2 } }, result: '그 애 옆에 앉았고, 둘이 같이 점심을 먹었다.' },
        { id: 'later', label: '나중에 말을 건다', fx: { stats: { relations: 1, happiness: 1, leisure: -1 } }, result: '하굣길에 따라가 괜찮냐고 묻자 그 애가 고개를 끄덕였다.' },
      ],
      default: 'tell',
    },
  },
  {
    id: 'school.bully.victim', ages: [9, 16], once: true, tags: ['victim', 'bully'], sensitive: 'violence', src: ['R03.S13'],
    p: L => VICTIM[lvl(L?.age ?? 12)] * vf(L?.year ?? 2026),
    text: '이유는 없었다. 몇 명이 나만 빼놓고 모이고, 별명으로 불렀다.',
    fx: { stats: { happiness: -3 } },
    reason: '학교폭력 피해',
    choice: {
      prompt: '누구에게 말할까?',
      options: [
        { id: 'teacher', label: '선생님께 말한다', fx: { stats: { happiness: 2, relations: -1 } }, result: '담임이 양쪽을 따로 불렀고, 자리가 바뀌었다.' },
        { id: 'family', label: '가족에게 말한다', fx: { stats: { happiness: 3, relations: 2, leisure: -1 } }, result: '가족이 오래 들어 주었고, 다음 날 함께 학교에 갔다.', hint: '가장 많이 알리는 곳' },
        { id: 'friend', label: '친구에게 말한다', fx: { stats: { relations: 2, happiness: 1 } }, result: '단짝과 점심을 같이 먹었다.' },
      ],
      default: 'family',
    },
  },
  {
    id: 'school.multicultural.tease', ages: [8, 14], p: 0.08, once: true, tags: ['victim', 'bully'], sensitive: 'violence',
    when: L => !!L.birth?.parents?.multicultural,
    text: '같은 반 아이가 엄마의 말투를 흉내 내며 놀렸다.',
    fx: { stats: { happiness: -2 } },
    reason: '다문화 가정에 대한 놀림',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'teacher', label: '선생님께 말한다', fx: { stats: { happiness: 2, leisure: -1 } }, result: '선생님은 그 아이에게 사과를 시켰고, 사과는 짧았다.', hint: '어른에게 알리는 쪽' },
        { id: 'confront', label: '그만하라고 말한다', fx: { stats: { happiness: 1, relations: -3, intellect: 1 } }, result: '떨리는 목소리로 그만하라고 했고, 그 애는 입을 다물었다.' },
        { id: 'friend', label: '친구와 함께 말한다', fx: { stats: { relations: 3, happiness: 1, leisure: -1 } }, result: '단짝이 옆에서 같이 그만하라고 말해 주었다.' },
      ],
      default: 'teacher',
    },
  },
  {
    id: 'school.recovery.talk', ages: [9, 18], p: 0.5, once: true, tags: ['recovery'],
    when: L => { const v = L.flags?.victim; return v != null && L.year - v >= 1 && L.year - v <= 3; },
    text: ['상담실 선생님이 말했다. "네 잘못이 아니야."', '상담센터에서도 같은 말을 들었다. "네 잘못이 아니야."', '단짝이 먼저 "이제 괜찮아?" 하고 물었다. 대답이 길어졌다.'],
    fx: { stats: { happiness: 3, relations: 1 } },
    reason: '피해 뒤 안전한 사람과의 대화',
  },
  {
    id: 'school.teacher.cane', ages: [7, 18], once: true, years: [1960, 2011], tags: ['corporal'], sensitive: 'violence',
    p: L => (L.year <= 1989 ? 0.2 : L.year <= 1999 ? 0.15 : 0.06),
    text: era([
      [1960, ['숙제를 안 한 날, 교실 앞에서 맞았다. 반 전체가 조용했다.', '시험에서 틀린 개수만큼 맞았다. 그때는 흔한 일이라고들 했다.']],
      [2000, '체벌이 줄어드는 때였지만, 그날은 교실 뒤에서 맞았다.'],
    ]),
    fx: { stats: { happiness: -2, relations: -1 } },
    reason: '교사 체벌',
  },
  {
    id: 'school.home.cane', ages: [7, 15], once: true, tags: ['victim', 'corporal'], sensitive: 'abuse',
    p: L => (L.year <= 1989 ? 0.07 : L.year <= 2009 ? 0.05 : 0.03),
    text: era([
      [1960, '집에서 "훈육"이라는 이름으로 맞은 날이 있었다.'],
      [2021, '집에서 맞은 날이 있었다. 법은 이미 그걸 허락하지 않았다.'],
    ]),
    fx: { stats: { happiness: -3, relations: -1 } },
    reason: '집에서의 체벌',
  },

  // ───────── 사교육·성적·입시 ─────────
  {
    id: 'school.hakwon.more', ages: [9, 12], p: 0.1, once: true, years: [1992, 2100], tags: ['tutoring'], src: ['R03.S1'],
    text: era([
      [1992, '동네 친구들이 하나둘 피아노·속셈학원에 다니기 시작했다.'],
      [2000, '반 친구 대부분이 학원을 두세 개씩 다녔다.'],
      [2020, '방과후와 학원 사이로 하루 시간표가 짜여 있었다.'],
    ]),
    reason: '학원을 더 다닐지의 선택',
    choice: {
      prompt: '나도 하나 더 다닐까?',
      options: [
        { id: 'more', label: '하나 더 다닌다', fx: { stats: { intellect: 2, leisure: -3, wealth: -2 }, issues: { edu: 3 } }, result: '학원 가방이 하나 더 늘어 어깨가 무거워졌다.' },
        { id: 'keep', label: '지금대로 둔다', fx: { stats: { leisure: 2, happiness: 1 } }, result: '오후에는 놀이터에 갈 시간이 남았다.' },
        { id: 'arts', label: '예체능으로 바꾼다', fx: { stats: { happiness: 2, health: 1, relations: 1, leisure: -1 } }, result: '문제집 대신 피아노 앞에 앉는 날이 늘었다.' },
      ],
      default: 'keep',
    },
  },
  {
    id: 'school.hakwon.bus', ages: [13, 18], p: 0.08, cooldown: 3, years: [2000, 2100], tags: ['tutoring'], src: ['R03.S1'],
    when: L => (L.edu?.tutoring ?? 0) >= 1,
    text: ['밤 열 시, 학원 버스 창밖으로 편의점 불빛이 지나갔다.', '학원 버스에서 졸다 내릴 정류장을 지나쳤다. 한 번이 아니었다.', '학원 버스 맨 뒷자리에서 숙제를 마저 풀었다.'],
    fx: { stats: { health: -1, leisure: -2 } },
    reason: '밤늦은 학원 일과',
  },
  {
    id: 'school.tutor.cost', ages: [10, 18], p: 0.1, cooldown: 4, tags: ['tutoring'], src: ['R03.S1'],
    when: L => Q(L) <= 3 && (L.edu?.tutoring ?? 0) >= 1,
    text: ['학원비 이체일마다 부모님이 계산기를 한 번 더 두드렸다.', '식탁 위에 학원 영수증이 올라온 날은 대화가 짧았다.', '새 학기 학원비 안내문을 부모님이 두 번 읽었다.', '학원을 하나 더 다니고 싶다는 말을 꺼내지 못했다.'],
    fx: { stats: { wealth: -2, happiness: -1 }, issues: { edu: 4 } },
    reason: '사교육비가 가계에 주는 부담',
  },
  {
    id: 'school.secret.tutor', ages: [13, 18], p: 0.12, once: true, years: [1980, 1999], tags: ['tutoring'], src: ['R03.S25'],
    when: L => Q(L) >= 4,
    text: '과외는 금지된 시절이었다. 아파트 위층에서 몰래 수업이 열렸다.',
    reason: '과외 금지 시절의 선택',
    choice: {
      prompt: '참여할까?',
      options: [
        { id: 'join', label: '몰래 과외를 받는다', fx: { stats: { intellect: 2, wealth: -3, happiness: -1 }, issues: { fairness: 4, edu: 3 } }, result: '문제집을 쇼핑백에 담아 위층으로 올라갔다.', hint: '형편 되는 집에서 흔했다' },
        { id: 'regular', label: '학교 수업에 집중한다', fx: { stats: { intellect: 1, leisure: 1 }, issues: { edu: 2 } }, result: '학교 보충수업에 집중했고, 점수 차이는 오래 남았다.' },
        { id: 'group', label: '친구들과 함께 공부한다', fx: { stats: { relations: 2, intellect: 1, leisure: -1 } }, result: '친구 집에 모여 문제집을 돌려 가며 서로 가르쳤다.' },
      ],
      default: 'join',
    },
  },
  {
    id: 'school.special.prep', ages: [13, 15], p: 0.12, once: true, years: [1995, 2100], tags: ['tutoring'],
    when: L => (L.edu?.score ?? 0) >= 65 && Q(L) >= 4,
    text: '특목고 준비반 설명회에 다녀왔다. 합격 후기가 벽에 붙어 있었다.',
    reason: '특목고 준비반 선택',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'enroll', label: '준비반에 들어간다', fx: { stats: { intellect: 3, leisure: -5, wealth: -2 }, issues: { edu: 5 } }, result: '주 5일, 밤 열 시에 끝나는 반에 이름이 올랐다.', hint: '비슷한 처지에서 흔한 선택' },
        { id: 'regular', label: '학교 공부만 한다', fx: { stats: { leisure: 3, happiness: 1 }, issues: { edu: 1 } }, result: '일반 고교 원서를 쓰는 쪽으로 마음을 정했다.' },
        { id: 'self', label: '문제집으로 혼자 준비한다', fx: { stats: { intellect: 2, leisure: -2 } }, result: '문제집 두 권을 사서 책상 위에 올려 두었다.' },
      ],
      default: 'enroll',
    },
  },
  {
    id: 'school.grade.drop', ages: [13, 18], p: 0.06, cooldown: 4, tags: ['pressure'],
    text: ['성적표의 숫자가 지난번보다 낮았다.', '시험지 맨 위의 점수가 지난번보다 한 줄 낮았다.', '성적표를 받은 날, 집까지 걷는 길이 길었다.'],
    reason: '성적이 떨어진 뒤의 선택',
    choice: {
      prompt: '남은 시간을 어떻게 쓸까?',
      options: [
        { id: 'sleep', label: '잠을 줄인다', fx: { stats: { intellect: 2, health: -3, happiness: -2 } }, result: '새벽까지 불을 켜 두었고, 점수는 올랐지만 눈이 침침했다.', hint: '시험기에 흔한 대처' },
        { id: 'drop', label: '한 과목을 접는다', fx: { stats: { intellect: 1, leisure: 2 }, issues: { edu: 2 } }, result: '한 과목은 접고 나머지에 시간을 몰았다.' },
        { id: 'rest', label: '쉬어 간다', fx: { stats: { happiness: 3, leisure: 3, health: 1 }, issues: { edu: 2 } }, result: '일주일을 쉬었더니 점수는 그대로였고 마음은 나아졌다.' },
      ],
      default: 'sleep',
    },
  },
  {
    id: 'school.exam.anxiety', ages: [16, 18], cooldown: 3, tags: ['pressure'],
    p: L => 0.07 + Math.max(-0.04, Math.min(0.08, ((L?.traits?.sens ?? 50) - 50) * 0.002)),
    text: ['시험 전날 밤, 천장 무늬를 다 외울 때까지 잠이 오지 않았다.', '수학 공식이 천장에 떠다녔다. 새벽 네 시에야 눈을 감았다.', '시험 전날, 같은 쪽을 몇 번이고 다시 읽었다. 잠은 오지 않았다.', '새벽 세 시에 오답 노트를 덮었지만 눈은 말똥했다.'],
    fx: { stats: { health: -1, happiness: -2, leisure: -1 } },
    reason: '시험 전날의 불면',
  },
  {
    id: 'school.night.study', ages: [16, 18], p: 0.2, once: true, years: [1976, 2010],
    text: ['야간자율학습은 오후 10시에 끝났다.', '야자가 끝난 교문 앞은 학원 버스와 부모님 차로 붐볐다.'],
    fx: { stats: { intellect: 1, health: -2, leisure: -3, happiness: -1 } },
    reason: '야간자율학습',
  },
  {
    id: 'school.csat.morning', ages: [18, 18], p: 0.3, once: true, src: ['R03.S25'],
    text: era([
      [1960, '시험 날 아침, 도시락 위에 엿이 하나 놓여 있었다.'],
      [1993, '수능 날 아침, 도시락 위에 "합격"이라 적힌 쪽지가 있었다.'],
      [2017, '수능이 지진 때문에 일주일 미뤄졌다. 도시락은 한 번 더 쌌다.'],
      [2018, '수능 날 아침, 도시락 위에 "합격"이라 적힌 쪽지가 있었다.'],
      [2020, '칸막이와 마스크 사이에서 시험을 쳤다. 도시락은 혼자 먹었다.'],
      [2022, '수능 날 아침, 도시락 위에 "합격"이라 적힌 쪽지가 있었다.'],
    ]),
    fx: { stats: { relations: 1 } },
    reason: '시험 날 아침',
  },
  {
    id: 'school.graduation', ages: [18, 18], p: 0.3, once: true,
    text: era([
      [1960, '졸업식이 끝나고 교문 앞 중국집에서 짜장면을 먹었다.'],
      [1996, '졸업식 날 서로의 교복에 이름을 적어 주었다.'],
      [2012, '졸업식 날 꽃다발을 받았다. 교복은 그날이 마지막이었다.'],
      [2020, '졸업식은 화면으로 열렸다. 앨범은 우편으로 왔다.'],
      [2022, '졸업식 날 꽃다발을 받았다. 교복은 그날이 마지막이었다.'],
    ]),
    fx: { stats: { happiness: 2, relations: 1 } },
    reason: '졸업식',
  },
  {
    id: 'school.quit.thought', ages: [15, 18], p: 0.04, once: true, tags: ['pressure'], src: ['R03.S12'],
    text: '학교에 나가는 일이 점점 버거워졌다. 자퇴라는 말이 떠올랐다.',
    reason: '학교 밖을 생각한 해',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'ged', label: '검정고시를 알아본다', fx: { stats: { happiness: 1, leisure: 2 }, issues: { edu: 4 } }, result: '청소년 상담복지센터에서 안내서를 받아 왔다.' },
        { id: 'stay', label: '일단 다닌다', fx: { stats: { relations: 1, leisure: -1, happiness: -1 } }, result: '졸업까지 남은 날짜를 달력에 지워 가며 다녔다.', hint: '대부분은 졸업까지 다닌다' },
        { id: 'counsel', label: '상담을 받는다', fx: { stats: { happiness: 2, leisure: -1 } }, result: '상담 선생님은 결정은 천천히 해도 된다고 했다.' },
      ],
      default: 'stay',
    },
  },
  {
    id: 'school.low.mood', ages: [13, 18], once: true, tags: ['pressure'], sensitive: 'illness', src: ['R03.S16'],
    p: L => (L?.sex === 'F' ? 0.07 : 0.045),
    text: '몇 주째 마음이 무겁고 아침이 길었다.',
    fx: { stats: { happiness: -3 } },
    reason: '오래 이어진 무거운 마음',
    choice: {
      prompt: '누구에게 털어놓을까?',
      options: [
        { id: 'counselor', label: '상담실에 간다', fx: { stats: { happiness: 2, leisure: -1 } }, result: '점심시간에 상담실 문을 두드렸고, 따뜻한 차를 받았다.', hint: '도움을 구하는 쪽' },
        { id: 'friend', label: '친구에게 털어놓는다', fx: { stats: { relations: 3, happiness: 1 } }, result: '친구는 말을 끊지 않고 끝까지 들어 주었다.' },
        { id: 'family', label: '부모님께 말한다', fx: { stats: { relations: 2, happiness: 2, wealth: -1 }, issues: { medical: 2 } }, result: '부모님은 놀랐고, 그다음엔 함께 병원을 알아봤다.' },
      ],
      default: 'counselor',
    },
  },
  {
    id: 'school.license', ages: [16, 18], p: 0.25, once: true, src: ['R03.S9'],
    when: L => L.edu?.highType === 'vocational',
    text: ['실습실에서 자격증 시험을 보았다. 합격 문자는 점심시간에 왔다.', '자격증 실기 시험 전날까지 실습실 불이 꺼지지 않았다.'],
    fx: { stats: { intellect: 1, happiness: 1, wealth: 1 }, issues: { job: -2 } },
    reason: '자격증 시험',
  },

  // ───────── 가정·주거·돈 ─────────
  {
    id: 'school.debt.calls', ages: [8, 18], p: 0.1, cooldown: 4,
    when: poor,
    text: era([
      [1960, ['집 전화가 울리면 어른이 먼저 달려가 받았다. 목소리가 낮아졌다.', '대문 밖에서 누가 부르면 어른이 먼저 나가 문을 닫았다.', '우편함의 독촉장을 어른이 먼저 걷어 갔다.']],
      [2000, ['부모님 휴대폰이 울리면 화면을 뒤집어 놓았다. 모르는 번호였다.', '모르는 번호의 전화는 받지 말라고 했다. 벨은 오래 울렸다.', '식탁 위 우편물이 열리지 않은 채 쌓여 있었다.']],
    ]),
    fx: { stats: { happiness: -2, wealth: -1 }, issues: { living: 3 } },
    reason: '가계의 빚 독촉',
  },
  {
    id: 'school.parent.joblost', ages: [7, 18], once: true,
    p: L => (L.year >= 1997 && L.year <= 1999 ? 0.12 : L.year === 2009 ? 0.04 : 0.02),
    text: (L, c) => {
      if (L.year >= 1997 && L.year <= 1999) return '아버지의 회사가 문을 닫았다. 저녁 뉴스는 같은 단어를 되풀이했다.';
      const who = L.birth?.parents?.singleParent ? '어머니' : c.pick(['아버지', '어머니']);
      return `${who}가 다니던 회사를 그만두었다. 낮에도 집에 계셨다.`;
    },
    fx: { stats: { happiness: -2, wealth: -3 }, issues: { job: 4, living: 2 } },
    reason: '부모의 실직',
  },
  {
    id: 'school.transfer', ages: [8, 16], p: 0.5, cooldown: 3,
    when: moved,
    text: ['전학 첫날, 칠판 앞에서 이름을 말했다. 아는 얼굴은 없었다.', '새 학교에서 점심 자리를 찾는 데 사흘이 걸렸다.', '전학 온 첫 주, 쉬는 시간마다 교과서만 넘겼다.', '새 교실의 사물함 번호를 찾느라 한참 헤맸다.'],
    fx: { stats: { relations: -2, happiness: -1 } },
    reason: '이사로 인한 전학',
  },
  {
    id: 'school.parent.away', ages: [7, 12], p: 0.04, once: true,
    when: L => !L.birth?.parents?.singleParent,
    text: era([
      [1960, '아버지가 지방 현장으로 나가 주말에만 집에 왔다.'],
      [1976, '아버지는 중동 현장에 나갔다. 편지는 두 달에 한 번 왔다.'],
      [1987, '아버지가 지방으로 발령이 나 주말에만 집에 왔다.'],
    ]),
    fx: { stats: { relations: -1, happiness: -1 }, issues: { care: 2 } },
    reason: '부모의 단신 근무',
  },
  {
    id: 'school.sibling.tuition', ages: [12, 18], p: 0.1, once: true,
    when: L => Q(L) <= 2 && (L.family?.siblings ?? 0) >= 1,
    text: L => (L.sex === 'F' && L.year <= 1995
      ? '형제의 학비가 먼저였다. 내 몫은 조용히 뒤로 밀렸다.'
      : '형제의 학비와 내 학비가 같은 달에 겹쳤다. 식탁의 대화가 줄었다.'),
    reason: '형제 학비와 겹친 해',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'yield', label: '내가 양보한다', fx: { stats: { happiness: -4, relations: 1, wealth: 1 }, issues: { edu: 6 } }, result: '학원을 접고 교재비도 줄이기로 했다.' },
        { id: 'scholarship', label: '장학금을 알아본다', fx: { stats: { intellect: 2, happiness: 1, leisure: -1 }, issues: { edu: 2 } }, result: '장학 공고를 밤마다 읽었고, 서류 마감이 먼저 왔다.', hint: '지원 경로를 찾는 쪽' },
        { id: 'work', label: '일을 보탠다', fx: { stats: { wealth: 3, leisure: -4, health: -1 } }, result: '방학마다 일해 학비를 보탰고, 방학이 짧아졌다.' },
      ],
      default: 'scholarship',
    },
  },
  {
    id: 'school.parttime', ages: [16, 18], once: true, years: [1998, 2100],
    p: L => (Q(L) <= 2 ? 0.12 : Q(L) === 3 ? 0.07 : 0.04),
    text: '방과 후 편의점에서 일할 자리가 났다. 시급은 최저임금이었다.',
    reason: '청소년 아르바이트',
    choice: {
      prompt: '일해 볼까?',
      options: [
        { id: 'work', label: '평일에 한다', fx: { stats: { wealth: 4, leisure: -3, health: -1, relations: 1 } }, result: '첫 월급은 용돈 대신 교통카드 충전에 쓰였다.' },
        { id: 'weekend', label: '주말만 한다', fx: { stats: { wealth: 2, leisure: -1, relations: 1 } }, result: '토요일 네 시간 동안 계산대 앞에서 인사가 늘었다.' },
        { id: 'no', label: '하지 않는다', fx: { stats: { leisure: 3, happiness: 1 } }, result: '방과 후 시간은 그대로 내 것이었고, 지갑은 가벼웠다.' },
      ],
      default: 'weekend',
    },
  },
  {
    id: 'school.factory.summer', ages: [16, 18], once: true, years: [1970, 1999],
    p: L => (Q(L) <= 2 ? 0.15 : Q(L) === 3 ? 0.08 : 0.03),
    text: ['방학 동안 공장 라인에 섰다. 첫 일당은 학용품이 되었다.', '여름방학마다 봉제 공장에서 단추를 달았다. 손끝이 거칠어졌다.'],
    fx: { stats: { wealth: 2, leisure: -3, health: -1, relations: 1 } },
    reason: '방학 공장 일',
  },
  {
    id: 'school.young.carer', ages: [13, 18], p: 0.5, once: true, tags: ['carer'], sensitive: 'illness',
    when: L => !!L.flags?.youngCarer || !!L.family?.caringFor,
    text: '학교가 끝나면 아픈 가족을 돌보는 일이 일과가 되었다.',
    fx: { stats: { leisure: -3, happiness: -1 }, issues: { care: 4 } },
    reason: '가족 돌봄의 시작',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'schedule', label: '방과 후 활동을 줄인다', fx: { stats: { leisure: 2, happiness: -2, relations: -2 }, issues: { edu: 3 } }, result: '동아리와 보충을 빼고 일찍 귀가하기로 했다.' },
        { id: 'support', label: '돌봄 지원을 신청한다', fx: { stats: { happiness: 2, leisure: -1 }, issues: { care: -3 } }, result: '복지사가 집을 다녀갔고, 신청서는 길었다.', hint: '도움을 요청하는 쪽' },
        { id: 'relatives', label: '친척에게 도움을 청한다', fx: { stats: { relations: 2, happiness: 1, leisure: -1 }, issues: { care: -1 } }, result: '친척이 주말마다 교대해 주었고, 고마움이 미안함과 섞였다.' },
      ],
      default: 'support',
    },
  },
  {
    id: 'school.rural.merge', ages: [7, 15], p: 0.12, once: true, years: [1982, 2100],
    when: L => L.birth?.urban === false,
    text: era([
      [1982, '마을 분교가 문을 닫았다. 읍내 학교까지 버스로 다녀야 했다.'],
      [2005, '전교생이 줄어 학교가 다른 학교와 합쳐졌다. 통학이 길어졌다.'],
    ]),
    fx: { stats: { relations: -1, leisure: -1 }, issues: { region: 4 } },
    reason: '농촌 학교 통폐합',
  },
  {
    id: 'school.free.lunch', ages: [7, 15], p: 0.2, once: true, years: [2012, 2100],
    text: '모두 같은 식판을 들었다. 급식비 이야기는 사라졌다.',
    fx: { stats: { happiness: 1 }, issues: { fairness: -2 } },
    reason: '무상급식',
  },
  {
    id: 'school.remote.class', ages: [9, 18], p: 0.6, once: true, years: [2020, 2021], src: ['R03.S25'],
    text: (L, c) => (Q(L) <= 2 && (L.family?.siblings ?? 0) >= 1
      ? '태블릿 한 대를 형제와 시간표로 나눠 썼다.'
      : L.year === 2020
        ? c.pick(['교실 대신 화면 앞에서 출석을 불렀다. 카메라는 꺼 두었다.', '학교 대신 화면으로 하루가 시작되었다. 친구 얼굴은 작은 네모였다.'])
        : '격주로 등교하고 나머지 날은 화면으로 배웠다.'),
    fx: { stats: { relations: -2, happiness: -1 }, issues: { edu: 3, tech: 3 } },
    reason: '원격수업',
  },
  {
    id: 'school.drill', ages: [7, 18], p: 0.1, cooldown: 4, years: [2017, 2100],
    text: ['지진 대피 훈련으로 책상 밑에 들어갔다. 손은 머리 위였다.', '화재 대피 훈련에서 젖은 수건을 입에 대고 운동장으로 나갔다.', '대피 훈련 날, 담임이 출석을 두 번 불렀다.', '비상벨이 울리자 줄을 맞춰 운동장으로 나갔다.'],
    fx: { stats: { happiness: -1 }, issues: { living: 2 } },
    reason: '대피 훈련',
  },

  // ───────── 몸·시대 장면 ─────────
  {
    id: 'school.glasses', ages: [7, 18], p: 0.04, once: true,
    text: L => (Q(L) <= 2
      ? '칠판이 흐려졌지만 말을 미뤘다. 안경값이 얼마인지 알았다.'
      : '칠판 글씨가 흐려졌다. 안경을 쓰자 간판이 또렷해졌다.'),
    fx: { stats: { health: -1, wealth: -1 }, issues: { medical: 1 } },
    reason: '시력 저하와 안경',
  },
  {
    id: 'school.disability.support', ages: [7, 18], p: 0.1, cooldown: 4,
    when: L => !!(L.birth?.disability || L.health?.disability),
    text: (L, c) => {
      const t = L.birth?.disability;
      if (t === 'physical') return c.pick(['교실이 3층인데 엘리베이터가 없어 이동 수업에 늘 늦었다.', '이동 수업 때마다 계단 앞에서 친구의 도움을 기다렸다.']);
      if (t === 'hearing') return c.pick(['청각 지원 장비는 학교에 한 대뿐이라 다른 반에 가 있었다.', '앞자리가 아니면 수업이 잘 들리지 않았고, 자리는 늘 바뀌었다.']);
      if (t === 'visual') return c.pick(['확대 교재는 학기가 반쯤 지나서야 도착했다.', '칠판 글씨를 옮겨 적는 속도가 늘 한 줄씩 늦었다.']);
      return c.pick(['보조 인력은 주 이틀만 왔고, 나머지 날은 담임 혼자였다.', '지원 인력이 쉬는 날에는 수업을 따라가기 더 어려웠다.']);
    },
    fx: { stats: { leisure: -2, happiness: -1 }, issues: { edu: 5 } },
    reason: '통합교육 지원 부족',
  },
  {
    id: 'school.first.phone', ages: [10, 15], p: 0.18, once: true, years: [2000, 2100],
    text: era([
      [2000, '첫 휴대폰은 폴더폰이었다. 문자 하나에도 요금이 붙었다.'],
      [2010, '첫 스마트폰이 생겼다. 요금제는 부모님이 정했다.'],
      [2016, ['첫 스마트폰이 생겼다. 단톡방이 하루 만에 열 개가 되었다.', '휴대폰을 받은 날, 사용 시간 제한 앱도 같이 깔렸다.']],
    ]),
    fx: { stats: { relations: 2, leisure: -1 }, issues: { tech: 3 } },
    reason: '첫 휴대폰',
  },
  {
    id: 'school.game.night', ages: [11, 17], p: 0.06, cooldown: 4,
    text: era([
      [1960, ['만화방 책을 몰래 빌려 와 이불 속에서 밤새 읽었다.', '라디오 연속극을 이불 속에서 끝까지 들었다.']],
      [1985, ['오락실에서 동전이 떨어질 때까지 버텼다.', '오락실 구석에서 형들의 화면을 어깨너머로 구경했다.']],
      [1999, ['PC방에서 밤을 새우고 새벽 첫차를 탔다.', 'PC방 한 시간 요금을 친구와 나눠 냈다.']],
      [2010, ['단톡방에서 약속을 잡아 밤새 게임을 했다. 아침엔 졸았다.', '친구들과 헤드셋을 쓰고 새벽까지 같은 판을 했다.']],
      [2020, ['화상 채팅을 켜 둔 채 새벽까지 게임을 했다.', '이어폰을 낀 채 이불 속에서 밤늦게까지 화면을 보았다.']],
    ]),
    fx: { stats: { happiness: 2, relations: 1, health: -2 } },
    reason: '밤새운 놀이',
  },
  {
    id: 'school.field.trip', ages: [15, 17], p: 0.25, once: true, src: ['R03.S25'],
    text: era([
      [1960, '수학여행으로 경주에 갔다. 불국사 앞에서 단체 사진을 찍었다.'],
      [1990, '제주도 수학여행 밤, 숙소를 몰래 나왔다가 들켰다.'],
      [2014, '그해 봄 수학여행은 취소되었다. 이유는 모두가 알고 있었다.'],
      [2016, '수학여행은 반별 체험학습으로 바뀌었다. 버스는 한 대였다.'],
      [2020, '수학여행은 코로나로 취소되었다. 졸업 앨범에 그 사진은 없다.'],
      [2022, '수학여행이 다시 돌아왔다. 버스 맨 뒷자리에서 노래를 불렀다.'],
    ]),
    fx: { stats: { relations: 1, happiness: 1 } },
    reason: '수학여행',
  },
];
