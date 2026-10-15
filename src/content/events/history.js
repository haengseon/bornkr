// 역사 지식베이스(K1~K5 '게임 활용 제안') 기반 시대 사건. 형식: ARCHITECTURE §8, id hist.{연도}.{slug}.
// 톤: 일상 장면, 짧은 평서 과거형. 정답/오답·평가 없음, 정치 중립, 비그래픽. src는 K 문서 id.
const o = (id, label, stats, issues, result) => ({ id, label, fx: { stats, issues }, result });
const ev = (id, ages, years, p, text, reason, src, prompt, options, extra = {}) => ({
  id, ages, years, p, once: true, text, reason, src: [src], tags: ['hist'], ...extra,
  ...(prompt ? { choice: { prompt, options, default: options[0].id } } : { fx: options }),
});

export default [
  // ───────── 1960~70년대 ─────────
  ev('hist.1962.mixed.rice', [7, 13], [1962, 1975], 0.25, '혼식 검사 날, 도시락에 흰쌀밥이 담겨 있었다.', '혼식 검사 날의 도시락', 'K3', '도시락을 어떻게 할까?', [
    o('keep', '규칙대로 보리를 섞는다', { relations: 1, happiness: -1 }, { living: 2 }, '선생님은 도시락 뚜껑을 열어 보고 지나갔다.'),
    o('hide', '쌀밥을 숨겨 간다', { happiness: 2, relations: -2 }, { fairness: 2 }, '뚜껑을 반쯤만 열고 급히 먹었다.'),
    o('share', '친구와 나눠 먹는다', { relations: 3, wealth: -1 }, { living: 2 }, '두 도시락이 책상 가운데 놓였다.'),
  ]),
  ev('hist.1964.rural.leave', [0, 10], [1960, 1970], 0.2, '밤마다 부모님이 서울 이야기를 나눴다.', '서울행을 두고 한 가족의 고민', 'K3', '가족은 어떻게 했을까?', [
    o('stay', '고향에 남는다', { relations: 3, wealth: -2 }, { region: -3 }, '농사철마다 이웃과 품을 나누며 살았다.'),
    o('go', '온 가족이 떠난다', { wealth: 3, happiness: -2 }, { housing: 3, region: 3 }, '연탄방 한 칸에서 도시살이가 시작되었다.'),
    o('father', '아버지만 먼저 간다', { wealth: 2, relations: -2 }, { job: 2, region: 2 }, '아버지의 편지가 한 달에 한 번 왔다.'),
  ]),
  ev('hist.1966.school.or.work', [12, 16], [1960, 1972], 0.2, '집에서 누가 계속 학교에 다닐지 의논했다.', '형제 사이 진학과 취업 문제', 'K3', '어떻게 할까?', [
    o('work', '일터로 나간다', { wealth: 3, intellect: -2 }, { job: 3, edu: 2 }, '첫 월급봉투를 어머니 손에 건넸다.'),
    o('both', '모두 학교에 보낸다', { intellect: 3, wealth: -3, happiness: 1 }, { edu: 3 }, '살림이 빠듯했지만 책가방은 그대로였다.'),
    o('night', '야학을 병행한다', { intellect: 2, health: -2, wealth: 1 }, { edu: 2, job: 2 }, '낮에는 일하고 밤에는 야학 교실에 앉았다.'),
  ]),
  ev('hist.1969.lottery', [11, 13], [1969, 1971], 0.4, '중학교 배정 추첨기 앞에 학부모들이 모였다.', '중학교 무시험 추첨', 'K3', '배정 결과를 어떻게 받아들일까?', [
    o('accept', '배정 학교에 간다', { happiness: 2, relations: 1 }, { edu: 1 }, '새 교복을 입고 낯선 교문을 들어섰다.'),
    o('transfer', '전학을 알아본다', { relations: -2, wealth: -2 }, { fairness: 2 }, '서류를 들고 몇 곳을 다녔지만 쉽지 않았다.'),
    o('tutor', '과외로 보충한다', { intellect: 3, wealth: -2 }, { edu: 3, fairness: 2 }, '저녁마다 이웃집 방에서 문제집을 풀었다.'),
  ]),
  ev('hist.1970.tv.set', [3, 15], [1965, 1979], 0.15, '이웃집에 한 대뿐인 TV 앞에 동네 아이들이 모였다.', '동네에 한 대뿐인 TV', 'K3', '집에서는 어떻게 했을까?', [
    o('buy', '할부로 TV를 들인다', { leisure: 3, wealth: -3 }, { tech: 2, living: 2 }, '저녁마다 우리 집 마루가 가장 붐볐다.'),
    o('visit', '이웃집에 가서 본다', { relations: 3, leisure: 1 }, { tech: 1 }, '프로가 끝나면 이웃 아주머니가 보리차를 내주었다.'),
    o('radio', '라디오로 만족한다', { wealth: 2, leisure: -1 }, { living: 1 }, '라디오 연속극 시간이 되면 식구가 모였다.'),
  ]),
  ev('hist.1972.village.work', [10, 19], [1970, 1979], 0.25, '이른 아침 마을 길 닦는 일에 사람들이 나왔다.', '마을 공동 작업', 'K3', '어떻게 할까?', [
    o('join', '함께 나간다', { relations: 3, leisure: -2 }, { region: 1 }, '손에 굳은살이 박였고 이웃과 가까워졌다.'),
    o('skip', '빠지고 쉰다', { leisure: 2, relations: -2 }, { region: 1 }, '그날 오후는 조용했지만 말이 돌았다.'),
    o('lead', '조를 맡아 이끈다', { intellect: 2, relations: 1, health: -1 }, { region: 2 }, '명단을 적고 일을 나누는 법을 배웠다.'),
  ], { when: L => L?.birth?.urban === false }),
  ev('hist.1975.hair.check', [15, 19], [1970, 1979], 0.2, '교문 앞에서 머리 길이와 복장 단속이 있었다.', '두발·복장 단속', 'K3', '어떻게 할까?', [
    o('obey', '단속에 따른다', { relations: 1, happiness: -1 }, { fairness: 1 }, '이발소 의자에 앉아 머리를 짧게 깎았다.'),
    o('dodge', '요령껏 피한다', { leisure: 2, relations: 1 }, { fairness: 2 }, '모자를 눌러쓰고 뒷문으로 들어갔다.'),
    o('say', '불만을 글로 적는다', { intellect: 2, happiness: -1 }, { fairness: 3, conflict: 2 }, '일기장에만 몇 줄 적어 두었다.'),
  ]),
  ev('hist.1980.unlearned', [10, 18], [1960, 2005], 0.12, '부모님은 못 배운 것을 자주 입에 올렸다.', '못 배운 부모의 바람', 'K1', '배움에 어떻게 쓸까?', [
    o('hakwon', '학원비를 마련한다', { intellect: 3, wealth: -3 }, { edu: 3 }, '부모님은 학원비 봉투를 따로 모아 두었다.'),
    o('skill', '기술을 배운다', { wealth: 2, intellect: 1, leisure: -2 }, { job: 3 }, '손에 익는 기술이 먼저 생겼다.'),
    o('help', '지원 제도를 알아본다', { happiness: 2, intellect: 1 }, { edu: 2, fairness: 1 }, '면사무소에서 받은 안내문이 책상에 놓였다.'),
  ]),
  // ───────── 1980~90년대 ─────────
  ev('hist.1983.kin.news', [25, 80], [1983, 1990], 0.15, '방송에서 헤어진 가족을 찾는 사연이 이어졌다.', '이산가족 찾기 방송', 'K2', '소식을 어떻게 할까?', [
    o('seek', '연락을 알아본다', { relations: 3, happiness: 1 }, { conflict: 1, region: 1 }, '접수 창구 줄이 길었지만 이름을 적어 냈다.'),
    o('talk', '가족과 먼저 이야기한다', { relations: 3, intellect: 1 }, { care: 1 }, '그날 밤 오랜만에 식구가 둘러앉았다.'),
    o('quiet', '당분간 두고 본다', { happiness: -2, relations: -1 }, { conflict: 1 }, '서랍 속 사진을 한참 꺼내 보았다.'),
  ]),
  ev('hist.1983.uniform', [13, 18], [1983, 1985], 0.4, '교복 자율화로 처음 사복을 입고 등교하는 날이었다.', '교복 자율화', 'K4', '무엇을 입을까?', [
    o('buy', '사복을 사 입는다', { happiness: 3, wealth: -2 }, { living: 2 }, '친구들 옷차림을 보며 한참 눈치를 보았다.'),
    o('uniform', '교복을 그대로 입는다', { wealth: 1, relations: 1 }, { living: 1 }, '몇몇은 교복을 입고 와서 서로 웃었다.'),
    o('save', '용돈을 아낀다', { wealth: 2, leisure: -1 }, { fairness: 1 }, '남은 용돈은 저금통에 넣었다.'),
  ]),
  ev('hist.1987.june', [18, 60], [1987, 1987], 0.4, '6월, 퇴근길 광장 분위기가 평소와 달랐다.', '1987년 6월의 거리', 'K4', '어떻게 할까?', [
    o('go', '광장에 가 본다', { relations: 2, health: -1 }, { conflict: 2, fairness: 2 }, '사람들 사이에서 한참 서 있다가 돌아왔다.'),
    o('work', '일터를 지킨다', { wealth: 2, relations: -1 }, { job: 1 }, '평소처럼 일을 마치고 집으로 갔다.'),
    o('news', '뉴스를 챙겨 본다', { intellect: 2, happiness: -1 }, { conflict: 1 }, '밤늦게까지 라디오와 신문을 번갈아 보았다.'),
  ]),
  ev('hist.1988.olympics', [3, 80], [1988, 1988], 0.6, '동네 골목마다 올림픽 깃발이 걸렸다.', '88 서울올림픽', 'K4', null, { stats: { happiness: 2, leisure: 2, relations: 1 } }),
  ev('hist.1990.newtown', [28, 45], [1989, 1993], 0.2, '신도시 입주 소식에 청약통장 이야기가 오갔다.', '신도시 청약과 전세난', 'K4', '집을 어떻게 구할까?', [
    o('apply', '청약에 도전한다', { wealth: 2, relations: -1 }, { housing: 3 }, '통장을 들고 모델하우스 줄에 섰다.'),
    o('rent', '전세로 옮긴다', { relations: 1, wealth: -2 }, { housing: 3 }, '전세금을 올려 주고 같은 동네에 남았다.'),
    o('move', '신도시로 이주한다', { wealth: 1, health: -2, happiness: 1 }, { housing: 2, region: 2 }, '이사 후 통근 시간이 길어졌다.'),
  ]),
  ev('hist.1994.csat', [17, 19], [1994, 1998], 0.35, '새로 생긴 수능 모의고사를 처음 치렀다.', '수능 도입 초기', 'K4', '공부를 어떻게 할까?', [
    o('hakwon', '학원을 늘린다', { intellect: 3, health: -2, wealth: -2 }, { edu: 3 }, '귀가 시간이 밤 열한 시로 늦어졌다.'),
    o('self', '혼자 정리한다', { intellect: 2, happiness: 1, relations: -1 }, { edu: 2 }, '오답 노트가 한 권씩 쌓였다.'),
    o('talent', '특기 전형을 알아본다', { intellect: 1, happiness: 2 }, { edu: 2, fairness: 1 }, '상담 선생님과 입학 요강을 함께 읽었다.'),
  ]),
  ev('hist.1998.gold', [25, 80], [1998, 1998], 0.5, '금 모으기 행렬이 동네 은행 앞까지 이어졌다.', '금 모으기 참여 결정', 'K4', '어떻게 할까?', [
    o('give', '반지를 내놓는다', { happiness: 1, wealth: -3, relations: 2 }, { living: 2 }, '결혼반지가 저울에 올려졌다.'),
    o('talk', '가족과 상의한다', { relations: 3, wealth: -1 }, { care: 1 }, '식구들이 서랍 속 금붙이를 함께 꺼냈다.'),
    o('watch', '일단 지켜본다', { wealth: 2, relations: -1 }, { living: 2 }, '뉴스를 보며 가계부를 다시 펼쳤다.'),
  ]),
  ev('hist.1998.layoff', [35, 58], [1997, 1999], 0.3, '회사에서 명예퇴직 신청 안내문이 돌았다.', '명예퇴직 안내', 'K4', '어떻게 할까?', [
    o('apply', '명예퇴직을 신청한다', { wealth: 1, happiness: -2, relations: 1 }, { job: 4, care: 2 }, '퇴직금을 받고 한동안 아침이 낯설었다.'),
    o('stay', '버틴다', { wealth: 2, health: -2 }, { job: 3 }, '야근이 늘고 동료 자리가 하나둘 비었다.'),
    o('shift', '전직과 창업을 준비한다', { intellect: 2, wealth: -2, happiness: 1 }, { job: 3, living: 2 }, '퇴근 후 자격증 책을 펼쳤다.'),
  ], { when: L => L?.job?.status === 'employed' }),
  ev('hist.1999.pc.room', [12, 24], [1998, 2003], 0.3, '동네에 PC방이 생겨 친구들이 몰려갔다.', 'PC방과 인터넷 확산', 'K4', '시간을 어떻게 쓸까?', [
    o('pcbang', 'PC방에 간다', { leisure: 3, relations: 2, health: -1 }, { tech: 2 }, '한 시간 요금을 나눠 내고 게임을 했다.'),
    o('course', '컴퓨터 학원에 다닌다', { intellect: 3, leisure: -2, wealth: -1 }, { tech: 3, edu: 1 }, '자격증 시험용 문제집이 책상에 올랐다.'),
    o('study', '공부에 쓴다', { intellect: 2, leisure: -2 }, { edu: 2 }, '친구들이 부르는 날도 책을 폈다.'),
  ]),
  // ───────── 2000년대 이후 ─────────
  ev('hist.2002.cheer', [5, 80], [2002, 2002], 0.6, '경기가 있는 날, 동네 사람들이 한 화면 앞에 모였다.', '2002년 월드컵 응원', 'K4', null, { stats: { happiness: 3, relations: 2, leisure: 1 } }),
  ev('hist.2013.retire.work', [56, 63], [2013, 2035], 0.2, '정년이 다가오자 재취업 상담 창구에 줄이 길었다.', '정년 이후의 일자리', 'K5', '이후를 어떻게 할까?', [
    o('extend', '계속 고용을 택한다', { wealth: 2, health: -1 }, { job: 2 }, '직급은 낮아졌지만 출근은 이어졌다.'),
    o('shop', '작은 가게를 연다', { wealth: -2, happiness: 2, leisure: -1 }, { job: 3, living: 2 }, '퇴직금으로 동네 길목에 가게를 얻었다.'),
    o('part', '단기 일자리를 구한다', { wealth: 1, health: -1, leisure: 1 }, { job: 2, care: 1 }, '계약서 기간은 짧았고 시간은 자유로웠다.'),
  ]),
  ev('hist.2024.kiosk', [62, 90], [2022, 2100], 0.2, '병원 접수 키오스크 앞에서 한참을 망설였다.', '디지털 기기 사용의 벽', 'K5', '어떻게 할까?', [
    o('learn', '디지털 교실에 나간다', { intellect: 3, leisure: -1, relations: 1 }, { tech: 3 }, '주민센터 교실에서 화면 누르는 법을 익혔다.'),
    o('child', '자녀에게 맡긴다', { relations: 2, happiness: -1 }, { care: 2, tech: 1 }, '자녀가 대신 예약해 주고 문자를 보냈다.'),
    o('face', '창구를 계속 이용한다', { happiness: 1, leisure: -1 }, { medical: 2, tech: 1 }, '창구 직원에게 증상을 직접 말했다.'),
  ]),
];
