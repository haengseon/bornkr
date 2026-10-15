// 외부 조사 카탈로그(KR-126~KR-250) 선택지 사건 — 팩트체크 후 확률·효과를 정해 변환(docs/impl/catalog-factcheck-b.md, catalog-notes-b.md).
// 형식: ARCHITECTURE §8. id ext.{카드번호}, src EXT.Hxx. 모든 p에 '// p 근거' 주석, 효과·금액은 게임 추정(보수적).
// 선택지 when은 엔진이 지원하면 필터, 미지원이어도 default는 항상 무조건 선택지다. 문의·신청 후속은 flags(ext.k***)에만 기록하고 결과를 보장하지 않는다.
const st = L => L?.job?.status;
const emp = L => st(L) === 'employed';
const self = L => st(L) === 'self';
const working = L => emp(L) || self(L);
const seeking = L => st(L) === 'seeking';
const student = L => st(L) === 'student';
const maj = L => String(L?.job?.major ?? '');
const code = L => String(L?.job?.code ?? '');
const sz = L => L?.job?.firmSize;
const rg = L => L?.home?.regionGroup;
const urban = L => ['seoul', 'capital', 'metro'].includes(rg(L));
const prov = L => rg(L) === 'province';
const tenant = L => ['jeonse', 'monthly'].includes(L?.home?.tenure);
const owned = L => L?.home?.tenure === 'own' || !!L?.home?.owned;
const partner = L => !!L?.family?.partner;
const kidsN = (L, lo = 0, hi = 99) => (L?.family?.children ?? []).filter(c => c && c.alive !== false && L.year - c.birthYear >= lo && L.year - c.birthYear <= hi).length;
const parentsAlive = L => [L?.family?.parents?.father, L?.family?.parents?.mother].filter(p => p && p.alive !== false);
const kin = L => partner(L) || (L?.family?.children ?? []).length > 0 || parentsAlive(L).length > 0;
const ally = L => (L?.stats?.relations ?? 50) >= 30;
const lowW = L => (L?.stats?.wealth ?? 50) < 40;
const canMove = L => (L?.stats?.wealth ?? 50) >= 20;
const hasDebt = L => (L?.money?.debt ?? 0) > 0;
const chronic = L => (L?.health?.conditions ?? []).some(c => c?.active);
const caring = L => !!L?.family?.caringFor;
const dis = L => !!(L?.health?.disability || L?.birth?.disability);

export default [
  // KR-126 conflict / 5월 광주·인접 영향 생활권; 통신·이동 제약
  // p 근거: 영향 생활권 주민 전원이 겪는 단발 사건 → 상한 .15 [게임 추정]
  {
    id: 'ext.126', ages: [18, 70], years: [1980, 1980], p: 0.15, once: true, tags: ['ext'], src: ['EXT.H26'],
    when: L => ['gwangju','jeonnam'].includes(L.home?.region),
    text: '거리와 연락이 불안정하다. 가족이 모두 집에 돌아오지 않았다.',
    reason: '거리와 연락이 불안정하다.',
    sensitive: 'violence',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '가족의 안부를 찾는다', when: L => kin(L), fx: { stats: { happiness: -1, relations: 2, leisure: -1 } }, result: '확인 가능한 연락부터 이어 보았다.' },
        { id: 'b', label: '안전한 곳에 머문다', fx: { stats: { health: 1, leisure: -2, relations: -1 } }, result: '주변 상황을 살피며 이동을 줄였다.' },
        { id: 'd', label: '본 일을 기록한다', fx: { stats: { intellect: 1, happiness: -1 }, issues: { conflict: 2 } }, result: '확인한 사실을 조심스럽게 남겼다.' },
      ],
      default: 'b',
    },
  },
  // KR-127 edu / 재학생; 과외금지 정책 영향
  // p 근거: 과외 금지(1980.7.30) 직후 3년간 학생 전원 노출, 단발 → 상한 [게임 추정]
  {
    id: 'ext.127', ages: [13, 18], years: [1980, 1983], p: 0.15, once: true, tags: ['ext'], src: ['EXT.H25'],
    when: L => student(L),
    text: '과외가 금지됐다는 소식이 왔다. 친구들의 공부 방식은 여전히 다르다.',
    reason: '과외가 금지됐다는 소식이 왔다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '학교 공부를 맞춘다', fx: { stats: { intellect: 1, leisure: -1 } }, result: '수업과 자기 공부에 시간을 나누었다.' },
        { id: 'b', label: '친구와 함께 공부한다', when: L => ally(L), fx: { stats: { intellect: 1, relations: 2, leisure: -1 } }, result: '서로의 자료와 질문을 모았다.' },
        { id: 'd', label: '공개 교재를 찾는다', fx: { stats: { intellect: 1, wealth: 1, leisure: -1 } }, result: '접근 가능한 학습 자료를 더 살폈다.' },
      ],
      default: 'a',
    },
  },
  // KR-128 job / 제조업 노동자; 경기 침체 영향 사업장
  // p 근거: 제조 생산직의 경기 변동 체감 연 4% [게임 추정, 해당 연도 경기 수치는 미검색]
  {
    id: 'ext.128', ages: [18, 65], years: [1980, 1989], p: 0.04, cooldown: 4, tags: ['ext'], src: ['EXT.H09'],
    when: L => emp(L) && ['7','8'].includes(maj(L)),
    text: '주문이 줄어 잔업도 줄었다. 쉬는 시간과 월급이 함께 바뀐다.',
    reason: '주문이 줄어 잔업도 줄었다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '생활비를 조정한다', fx: { stats: { wealth: 1, leisure: -1 }, issues: { job: 2 } }, result: '줄어든 수입에 맞춰 지출을 다시 적었다.' },
        { id: 'b', label: '남는 시간에 배운다', fx: { stats: { intellect: 2, leisure: -3, health: -1 } }, result: '휴식 일부를 기술과 공부에 썼다.' },
        { id: 'c', label: '다른 일자리를 살핀다', fx: { stats: { leisure: -1, relations: -1 }, issues: { job: 1 } }, result: '지금 직장을 유지하며 조건을 비교했다.' },
      ],
      default: 'a',
    },
  },
  // KR-129 housing / 서울·도시권; 재개발 세입자; 이주 요구
  // p 근거: 도시 세입자의 재개발 이주 체감 연 5% [게임 추정, 사건별 시기·지역 추가 검증 필요]
  {
    id: 'ext.129', ages: [18, 65], years: [1980, 1989], p: 0.05, cooldown: 4, tags: ['ext'], src: ['EXT.H08'],
    when: L => urban(L) && tenant(L),
    text: '동네가 바뀐다는 소식과 이주 요구가 같이 왔다.',
    reason: '동네가 바뀐다는 소식과 이주 요구가 같이 왔다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '보상·이주 조건을 묻는다', fx: { stats: { wealth: 1, leisure: -2 }, issues: { housing: 3 } }, result: '세입자에게 적용되는 내용을 따로 확인했다.' },
        { id: 'b', label: '이웃과 자료를 모은다', when: L => ally(L), fx: { stats: { relations: 2, leisure: -2 }, issues: { housing: 2 } }, result: '집마다 다른 상황을 함께 정리했다.' },
        { id: 'c', label: '일터 가까운 방을 찾는다', fx: { stats: { leisure: 1, wealth: -2 }, issues: { housing: 2 } }, result: '주거 면적보다 통근을 먼저 지켰다.' },
      ],
      default: 'a',
    },
  },
  // KR-130 job / 봉제 하청업 자영업자; 납품단가 압박
  // p 근거: 하청 제조 자영업의 단가 압박 연 6% [게임 추정, 봉제 세부 직종은 미적용]
  {
    id: 'ext.130', ages: [18, 65], years: [1980, 1989], p: 0.06, cooldown: 3, tags: ['ext'], src: ['EXT.H08'],
    when: L => self(L) && ['7','8'].includes(maj(L)),
    text: '납품단가는 내려가는데 납기는 짧아졌다.',
    reason: '납품단가는 내려가는데 납기는 짧아졌다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '작업량을 제한한다', fx: { stats: { health: 1, wealth: -2, leisure: 1 } }, result: '지킬 수 있는 약속만 남겼다.' },
        { id: 'b', label: '단가를 협의한다', fx: { stats: { wealth: 2, relations: -1 }, issues: { fairness: 2 } }, result: '원가를 보여 주며 조건을 다시 물었다.' },
        { id: 'c', label: '거래처를 나눈다', fx: { stats: { wealth: 1, leisure: -2, relations: 1 } }, result: '영업에 시간이 들고 의존은 줄었다.' },
      ],
      default: 'a',
    },
  },
  // KR-131 fairness / 서비스업; 여성; 결혼·퇴직 압력 경험
  // p 근거: 결혼 앞둔 여성 재직자 연 8% [게임 추정]
  {
    id: 'ext.131', ages: [21, 35], years: [1980, 1989], p: 0.08, once: true, tags: ['ext'], src: ['EXT.H08'],
    when: L => L.sex==='F' && emp(L) && (partner(L) || !!L.family?.dating),
    text: '결혼 뒤에도 계속 일하겠다는 말에 직장의 반응이 달라졌다.',
    reason: '결혼 뒤에도 계속 일하겠다는 말에 직장의 반응이 달라졌다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '고용 조건을 확인한다', fx: { stats: { intellect: 1, wealth: 1 }, issues: { fairness: 3 } }, result: '관행과 실제 규정을 나누어 물었다.' },
        { id: 'b', label: '동료 경험을 듣는다', when: L => ally(L), fx: { stats: { relations: 2, happiness: -1 }, issues: { fairness: 2 } }, result: '혼자 겪는 일인지 다른 사례를 모았다.' },
        { id: 'c', label: '다른 직장을 찾는다', fx: { stats: { wealth: -2, leisure: -1 }, issues: { job: 3 } }, result: '경력을 이어갈 조건을 새로 비교했다.' },
      ],
      default: 'a',
    },
  },
  // KR-132 care / 농촌; 자녀 도시 거주; 고령 부모 동거
  // p 근거: 농촌 거주 중장년의 자녀 합가 권유 연 5% [게임 추정]
  {
    id: 'ext.132', ages: [50, 65], years: [1980, 1989], p: 0.05, cooldown: 5, tags: ['ext'], src: ['EXT.H08'],
    when: L => prov(L) && kidsN(L,20,99)>=1,
    text: '도시의 자녀에게 올라오라는 말을 들었다. 농사와 병원이 마음에 걸린다.',
    reason: '도시의 자녀에게 올라오라는 말을 들었다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '도시 거처를 살핀다', fx: { stats: { relations: 1, leisure: -1 }, issues: { care: 2 } }, result: '합가 전에 생활 공간과 비용을 확인했다.' },
        { id: 'b', label: '고향에 남는다', fx: { stats: { happiness: 1, relations: 1 }, issues: { region: 3 } }, result: '익숙한 관계와 생업을 이어갔다.' },
        { id: 'c', label: '방문 돌봄을 나눈다', when: L => kin(L), fx: { stats: { relations: 2, leisure: -2 }, issues: { care: 2 } }, result: '자녀들이 오갈 일정부터 정했다.' },
      ],
      default: 'a',
    },
  },
  // KR-133 edu / 실업계·일반계 진학 선택; 학비 부담 가구
  // p 근거: 진학 이정표와 겹치므로 낮게 3% [게임 추정]
  {
    id: 'ext.133', ages: [15, 16], years: [1980, 1989], p: 0.03, once: true, tags: ['ext'], src: ['EXT.H10'],
    when: L => student(L) && (lowW(L) || (L.household?.netWorth ?? 1) < 1000),
    text: '곧 벌이를 시작할 길과 공부를 더 잇는 길을 함께 권유받았다.',
    reason: '곧 벌이를 시작할 길과 공부를 더 잇는 길을 함께 권유받았다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '직업교육을 택한다', fx: { stats: { wealth: 1, intellect: -1 }, issues: { edu: 2 } }, result: '취업 경로를 넓히며 다른 진학 가능성도 살폈다.', do: (L, act) => act.flag('k133a', L.year) },
        { id: 'c', label: '학교 현장을 방문한다', fx: { stats: { intellect: 1, leisure: -1 }, issues: { edu: 1 } }, result: '평판보다 실제 수업과 진로를 확인했다.', do: (L, act) => act.flag('k133c', L.year) },
        { id: 'd', label: '가족 장부를 펼친다', when: L => kin(L), fx: { stats: { relations: 2, happiness: 1, wealth: -1 } }, result: '학비와 생활비를 놓고 선택을 의논했다.' },
      ],
      default: 'c',
    },
  },
  // KR-134 region / 자가용 미보유; 도시 대중교통 통근
  // p 근거: 대중교통 통근자의 노선 변경 체감 연 5% [게임 추정]
  {
    id: 'ext.134', ages: [18, 65], years: [1980, 1989], p: 0.05, cooldown: 4, tags: ['ext'], src: ['EXT.H08'],
    when: L => urban(L) && working(L) && !L.flags?.car,
    text: '새 노선이 생겼다. 환승을 줄이면 비싼 방으로 옮기지 않아도 된다.',
    reason: '새 노선이 생겼다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '새 길을 시험한다', fx: { stats: { leisure: -1, intellect: 1 }, issues: { housing: -1 } }, result: '하루를 써서 실제 통근 시간을 확인했다.' },
        { id: 'b', label: '기존 길을 유지한다', fx: { stats: { leisure: 1, wealth: 1 } }, result: '익숙한 경로와 지출을 남겼다.' },
        { id: 'c', label: '출근 시간을 조정한다', fx: { stats: { leisure: 1, relations: -1, health: 1 } }, result: '혼잡과 가족 일정을 함께 맞췄다.' },
      ],
      default: 'a',
    },
  },
  // KR-135 care / 도시; 제조·사무 근로자; 어린 자녀 있음
  // p 근거: 어린 자녀 둔 도시 근로자의 돌봄 공백 연 6% [게임 추정]
  {
    id: 'ext.135', ages: [18, 65], years: [1980, 1989], p: 0.06, cooldown: 3, tags: ['ext'], src: ['EXT.H08'],
    when: L => urban(L) && emp(L) && kidsN(L,0,6)>=1,
    text: '아이를 맡기는 사람이 쉬게 됐다. 다음 주 근무표는 이미 나왔다.',
    reason: '아이를 맡기는 사람이 쉬게 됐다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '근무 조정을 요청한다', fx: { stats: { relations: -1, leisure: 1 }, issues: { care: 2 } }, result: '돌봄 공백을 직장에 알렸다.' },
        { id: 'b', label: '친족과 시간을 나눈다', when: L => parentsAlive(L).length>0, fx: { stats: { relations: 2, leisure: -1 }, issues: { care: 2 } }, result: '도움을 받으며 다른 날의 부담을 나눴다.' },
        { id: 'c', label: '유급 돌봄을 찾는다', fx: { stats: { wealth: -3, leisure: 1 }, issues: { care: 1 } }, result: '수입 일부가 돌봄 비용으로 옮겨갔다.' },
      ],
      default: 'a',
    },
  },
  // KR-136 job / 야간통금 해제 적용 지역; 야간 서비스업
  // p 근거: 1982.1 통금 해제 해에 한정, 야간 서비스 자영업 전원 [검색 확인]
  {
    id: 'ext.136', ages: [18, 65], years: [1982, 1982], p: 0.15, once: true, tags: ['ext'], src: ['EXT.H11'],
    when: L => self(L) && ['4','5'].includes(maj(L)),
    text: '통행금지가 풀렸다. 가게를 더 늦게 열자는 이야기가 나온다.',
    reason: '통행금지가 풀렸다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '영업을 연장한다', fx: { stats: { wealth: 3, health: -2, leisure: -3 } }, result: '매출 가능성과 야간 노동이 함께 늘었다.' },
        { id: 'b', label: '교대로 문을 지킨다', when: L => ally(L), fx: { stats: { wealth: 1, relations: 1, leisure: -1 } }, result: '새 영업시간을 사람들 사이에 나눴다.' },
        { id: 'c', label: '기존 시간을 지킨다', fx: { stats: { leisure: 1, health: 1, wealth: -1 } }, result: '확장 기회보다 생활의 리듬을 남겼다.' },
      ],
      default: 'c',
    },
  },
  // KR-137 care / 이산가족; 방송 신청·방문 가능한 상황
  // p 근거: 이산가족 상태 필드 없음 → 35세 이상 전체에 낮은 값 [게임 추정, 엔진에 flags.separatedFamily 요청]
  {
    id: 'ext.137', ages: [35, 90], years: [1983, 1983], p: 0.02, once: true, tags: ['ext'], src: ['EXT.H06'],
    when: L => true,
    text: '이산가족을 찾는 방송이 시작됐다. 오래된 사진을 다시 꺼냈다.',
    reason: '이산가족을 찾는 방송이 시작됐다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '신청 자료를 모은다', fx: { stats: { happiness: 1, relations: 1, leisure: -1 } }, result: '이름과 고향·가족관계를 정확히 적었다.', do: (L, act) => act.flag('k137a', L.year) },
        { id: 'b', label: '방송을 챙겨 본다', fx: { stats: { happiness: 1, leisure: -1 } }, result: '생활 일정 사이에 확인하는 시간을 만들었다.' },
        { id: 'd', label: '연락받을 곳을 남긴다', fx: { stats: { relations: 1, happiness: 1 } }, result: '거처가 바뀌어도 찾을 단서를 정했다.', do: (L, act) => act.flag('k137d', L.year) },
      ],
      default: 'a',
    },
  },
  // KR-138 tech / 도시; PC·전산 교육 접근 가능한 사무직
  // p 근거: 사무직의 전산 도입 체감 연 5% [게임 추정]
  {
    id: 'ext.138', ages: [18, 65], years: [1983, 1989], p: 0.05, once: true, tags: ['ext'], src: ['EXT.H08'],
    when: L => urban(L) && emp(L) && maj(L)==='3',
    text: '일터에서 전산을 배울 사람을 찾는다. 익숙한 장부는 손으로 쓴다.',
    reason: '일터에서 전산을 배울 사람을 찾는다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '전산 교육을 듣는다', fx: { stats: { intellect: 2, leisure: -2 }, issues: { tech: 3 } }, result: '배움과 기존 업무를 겹쳐 해야 했다.' },
        { id: 'b', label: '동료와 나눠 배운다', when: L => ally(L), fx: { stats: { intellect: 1, relations: 1 }, issues: { tech: 2 } }, result: '새 기술을 서로 설명하며 익혔다.' },
        { id: 'c', label: '시범 업무를 맡는다', fx: { stats: { intellect: 1, leisure: -1 }, issues: { tech: 2 } }, result: '작은 일부터 바뀐 도구를 써 보았다.' },
      ],
      default: 'c',
    },
  },
  // KR-139 job / 택시·운수업; 야간 근무 제안
  // p 근거: 택시 종사자의 야간 근무 제안 연 8% [게임 추정]
  {
    id: 'ext.139', ages: [18, 65], years: [1983, 1989], p: 0.08, cooldown: 4, tags: ['ext'], src: ['EXT.H08'],
    when: L => code(L)==='87210' && working(L),
    text: '밤 운행은 수입이 다르지만 가족과 만나는 시간도 달라진다.',
    reason: '밤 운행은 수입이 다르지만 가족과 만나는 시간도 달라진다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '야간을 맡는다', fx: { stats: { wealth: 3, health: -2, relations: -2 } }, result: '벌이와 생활 리듬이 함께 바뀌었다.' },
        { id: 'b', label: '주간을 유지한다', fx: { stats: { health: 1, relations: 1, wealth: -1 } }, result: '수입 차이를 감수하며 익숙한 시간을 남겼다.' },
        { id: 'c', label: '교대 간격을 조정한다', when: L => ally(L), fx: { stats: { health: 1, leisure: 1, wealth: -1 } }, result: '잠과 가족 일정을 맞출 방법을 찾았다.' },
      ],
      default: 'b',
    },
  },
  // KR-140 tech / 전자·기계공장; 기술 직무 전환 기회
  // p 근거: 장치·기계 조작직의 자동화 전환 체감 연 5% [게임 추정]
  {
    id: 'ext.140', ages: [18, 65], years: [1984, 1989], p: 0.05, once: true, tags: ['ext'], src: ['EXT.H08'],
    when: L => working(L) && maj(L)==='8',
    text: '자동 설비가 들어온다. 사람을 줄일지 업무를 바꿀지는 아직 모른다.',
    reason: '자동 설비가 들어온다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '설비 교육을 신청한다', fx: { stats: { intellect: 2, leisure: -2 }, issues: { tech: 3 } }, result: '기존 숙련에 새 도구를 더하기 시작했다.' },
        { id: 'b', label: '배치 조건을 묻는다', fx: { stats: { wealth: 1 }, issues: { job: 2 } }, result: '직무와 임금이 어떻게 달라지는지 확인했다.' },
        { id: 'c', label: '동료와 역할을 나눈다', when: L => ally(L), fx: { stats: { relations: 1, intellect: 1 }, issues: { tech: 2 } }, result: '익숙한 일과 새 일을 함께 맡았다.' },
      ],
      default: 'b',
    },
  },
  // KR-141 housing / 무주택 근로 가구; 청약저축 가입 가능
  // p 근거: 무주택 근로자의 청약저축 권유 연 6% [게임 추정, 청약저축 정확한 도입연도 미확인 → 문구 단정 회피]
  {
    id: 'ext.141', ages: [18, 65], years: [1985, 1989], p: 0.06, once: true, tags: ['ext'], src: ['EXT.H08'],
    when: L => !owned(L) && emp(L),
    text: '청약저축을 권하는 말을 들었다. 매달 남는 돈은 일정하지 않다.',
    reason: '청약저축을 권하는 말을 들었다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '작은 금액부터 모은다', fx: { stats: { wealth: 2, leisure: -1 }, issues: { housing: 2 }, money: { assets: 30 } }, result: '생활비를 남기며 주거 자금을 쌓았다.' },
        { id: 'b', label: '자격을 먼저 확인한다', fx: { stats: { intellect: 1 }, issues: { housing: 1 } }, result: '기대보다 가입·신청 조건을 살폈다.' },
        { id: 'c', label: '월세 부담부터 낮춘다', fx: { stats: { wealth: -1, happiness: 1 }, issues: { housing: 3 } }, result: '미래의 집보다 오늘의 지출을 조정했다.' },
      ],
      default: 'b',
    },
  },
  // KR-142 job / 서울; 국제대회 준비 영향 자영업자
  // p 근거: 올림픽 준비기 서울권 자영업 체감 연 8% [게임 추정]
  {
    id: 'ext.142', ages: [18, 65], years: [1986, 1988], p: 0.08, once: true, tags: ['ext'], src: ['EXT.H08'],
    when: L => self(L) && (L.home?.regionGroup==='seoul'||L.home?.regionGroup==='capital'),
    text: '손님이 늘 것이라는 기대가 있다. 가게를 고칠 돈도 필요하다.',
    reason: '손님이 늘 것이라는 기대가 있다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '작은 보수만 한다', fx: { stats: { wealth: 1, leisure: -1 }, money: { assets: -30 } }, result: '큰 확장 대신 필요한 부분을 손봤다.' },
        { id: 'b', label: '영업 준비를 늘린다', fx: { stats: { wealth: 3, leisure: -3, health: -1 }, money: { assets: -60 } }, result: '추가 수입을 기대하며 일손을 보탰다.' },
        { id: 'c', label: '재고를 보수적으로 잡는다', fx: { stats: { wealth: 1, happiness: -1, leisure: 1 } }, result: '손님 수를 장담하지 않고 지출을 묶었다.' },
      ],
      default: 'a',
    },
  },
  // KR-143 conflict / 6월민주항쟁 영향 도시권; 집회 소식 접함
  // p 근거: 1987.6 항쟁 영향 도시권 거주자 단발 → 상한 [게임 추정]
  {
    id: 'ext.143', ages: [18, 70], years: [1987, 1987], p: 0.15, once: true, tags: ['ext'], src: ['EXT.H26'],
    when: L => urban(L),
    text: '거리에서 직선제와 민주화를 요구하는 목소리가 이어졌다.',
    reason: '거리에서 직선제와 민주화를 요구하는 목소리가 이어졌다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '집회에 참여한다', fx: { stats: { happiness: 1, health: -1, leisure: -2 }, issues: { conflict: 3 } }, result: '뜻과 함께 이동·신변의 불확실함도 감수했다.' },
        { id: 'b', label: '가족과 연락을 맞춘다', when: L => kin(L), fx: { stats: { relations: 2, leisure: -1 } }, result: '서로의 위치와 귀가 계획을 챙겼다.' },
        { id: 'c', label: '주변 안부를 묻는다', fx: { stats: { relations: 2, happiness: 1, leisure: -1 } }, result: '참여 여부와 별개로 필요한 도움을 찾았다.' },
      ],
      default: 'c',
    },
  },
  // KR-144 fairness / 노동쟁의 발생 사업장 근로자
  // p 근거: 1987 노동쟁의 확산기 일정 규모 이상 사업장 재직자 [게임 추정]
  {
    id: 'ext.144', ages: [18, 65], years: [1987, 1987], p: 0.1, once: true, tags: ['ext'], src: ['EXT.H26'],
    when: L => emp(L) && sz(L)!=='micro',
    text: '사업장에서 임금과 노동조건을 함께 이야기하기 시작했다.',
    reason: '사업장에서 임금과 노동조건을 함께 이야기하기 시작했다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '요구 논의에 참여한다', fx: { stats: { relations: 2, wealth: -1 }, issues: { conflict: 3, fairness: 2 } }, result: '공동의 목소리와 갈등의 부담이 생겼다.' },
        { id: 'b', label: '근무 기록을 모은다', fx: { stats: { intellect: 1, leisure: -1 }, issues: { fairness: 1 } }, result: '시간과 지급 내역을 대조할 자료를 챙겼다.' },
        { id: 'd', label: '협의 내용을 확인한다', fx: { stats: { intellect: 1, happiness: -1 }, issues: { conflict: 1 } }, result: '소문보다 실제 합의와 절차를 살폈다.' },
      ],
      default: 'b',
    },
  },
  // KR-145 care / 국민연금 적용 10인 이상 사업장 근로자
  // p 근거: 1988.1 국민연금 적용(10인 이상) 시작, 해당 사업장 재직자 [검색 확인]
  {
    id: 'ext.145', ages: [18, 59], years: [1988, 1989], p: 0.15, once: true, tags: ['ext'], src: ['EXT.H12'],
    when: L => emp(L) && sz(L)!=='micro',
    text: '국민연금 공제가 시작됐다. 먼 노후가 이번 급여명세에 들어왔다.',
    reason: '국민연금 공제가 시작됐다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '가입 내역을 본다', fx: { stats: { intellect: 1 }, issues: { medical: 1 } }, result: '신고된 정보와 근무 상태를 대조했다.' },
        { id: 'c', label: '제도 설명을 듣는다', fx: { stats: { intellect: 1, relations: 1 } }, result: '주변 말과 공식 안내를 비교했다.' },
        { id: 'd', label: '다른 저축을 조정한다', fx: { stats: { wealth: 1, happiness: -1 }, issues: { living: 2 } }, result: '연금과 현금 여유의 몫을 다시 나눴다.' },
      ],
      default: 'a',
    },
  },
  // KR-146 medical / 농어촌; 지역 의료보험 적용 대상
  // p 근거: 1988.1 농어촌 지역의료보험 시행, 비도시권 주민 전원 [검색 확인]
  {
    id: 'ext.146', ages: [18, 65], years: [1988, 1989], p: 0.15, once: true, tags: ['ext'], src: ['EXT.H13'],
    when: L => prov(L),
    text: '농어촌 지역 의료보험이 적용된다. 이전과 진료비 계산이 달라졌다.',
    reason: '농어촌 지역 의료보험이 적용된다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '적용 여부를 확인한다', fx: { stats: { intellect: 1 }, issues: { medical: 2 } }, result: '가구와 신고 내용을 다시 살폈다.' },
        { id: 'b', label: '미룬 진료를 예약한다', fx: { stats: { health: 2, leisure: -1 }, issues: { medical: 2 } }, result: '농사와 이동 시간을 맞추어 보았다.' },
        { id: 'c', label: '보험료를 예산에 넣는다', fx: { stats: { wealth: -1, happiness: 1 }, issues: { medical: 1 } }, result: '매달 나갈 돈을 장부에 새로 적었다.' },
      ],
      default: 'a',
    },
  },
  // KR-147 medical / 도시 자영업자; 지역의료보험 적용 대상
  // p 근거: 1989.7 도시지역 의료보험 확대, 도시 자영업 전원 [검색 확인]
  {
    id: 'ext.147', ages: [18, 65], years: [1989, 1989], p: 0.15, once: true, tags: ['ext'], src: ['EXT.H13'],
    when: L => self(L) && urban(L),
    text: '도시지역 의료보험이 시작됐다. 가게 일과 진료를 함께 계획한다.',
    reason: '도시지역 의료보험이 시작됐다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '가입 자료를 챙긴다', fx: { stats: { intellect: 1 }, issues: { medical: 2 } }, result: '소득과 가구 정보를 정리했다.' },
        { id: 'b', label: '보험료 산정을 묻는다', fx: { stats: { wealth: 1, intellect: 1 }, issues: { fairness: 1 } }, result: '예상과 다른 항목을 확인했다.' },
        { id: 'd', label: '가계 예산을 바꾼다', fx: { stats: { wealth: -1, happiness: 1 }, issues: { living: 2 } }, result: '새 고정비와 다른 소비를 조정했다.' },
      ],
      default: 'a',
    },
  },
  // KR-148 living / 해외여행 자유화; 여비 여유·여권 신청 가능
  // p 근거: 1989.1 해외여행 연령 제한 폐지, 성인 전체 단발 [검색 확인]
  {
    id: 'ext.148', ages: [18, 70], years: [1989, 1989], p: 0.12, once: true, tags: ['ext'], src: ['EXT.H14'],
    when: L => true,
    text: '해외여행이 자유로워졌다. 여권은 만들 수 있어도 여비는 따로다.',
    reason: '해외여행이 자유로워졌다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '여권부터 만든다', fx: { stats: { intellect: 1, wealth: -1, leisure: 1 }, money: { assets: -10 } }, result: '여행 계획보다 먼저 준비 비용을 냈다.' },
        { id: 'b', label: '여행비를 모은다', when: L => canMove(L), fx: { stats: { wealth: 1, leisure: -2, happiness: 1 } }, result: '현재의 소비를 줄여 나중의 이동을 남겼다.' },
        { id: 'd', label: '여행을 미룬다', fx: { stats: { happiness: -1, wealth: 1, leisure: 1 } }, result: '주변의 여행 이야기와 자기 살림을 나누어 보았다.' },
      ],
      default: 'a',
    },
  },
  // KR-149 housing / 수도권; 주택 가격·임차료 상승 영향 세입자
  // p 근거: 1989 수도권 임차료 상승기 세입자 단발 [게임 추정, 가격 수치는 미검색]
  {
    id: 'ext.149', ages: [18, 65], years: [1989, 1989], p: 0.12, once: true, tags: ['ext'], src: ['EXT.H08'],
    when: L => (L.home?.regionGroup==='seoul'||L.home?.regionGroup==='capital') && tenant(L),
    text: '같은 동네에 살려면 다음 계약의 목돈이 더 필요하다.',
    reason: '같은 동네에 살려면 다음 계약의 목돈이 더 필요하다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '작은 집을 찾는다', fx: { stats: { leisure: -1, happiness: -1 }, issues: { housing: 2 } }, result: '생활권을 지키고 공간을 줄였다.' },
        { id: 'b', label: '외곽으로 옮긴다', when: L => canMove(L), fx: { stats: { wealth: 1, leisure: -2 }, issues: { housing: 3 } }, result: '주거비와 통근 시간을 맞바꿨다.' },
        { id: 'c', label: '저축 계획을 바꾼다', fx: { stats: { wealth: -2, leisure: 1 }, issues: { housing: 2 } }, result: '다른 목적의 돈을 보증금에 보탰다.' },
      ],
      default: 'a',
    },
  },
  // KR-150 region / 회사 근로자; 주거·통근 때문에 전근 고려
  // p 근거: 일정 규모 이상 사업장 전근 제안 연 6% [게임 추정]
  {
    id: 'ext.150', ages: [25, 55], years: [1989, 1989], p: 0.06, once: true, tags: ['ext'], src: ['EXT.H08'],
    when: L => emp(L) && ['mid','large','public'].includes(sz(L)),
    text: '지방 근무 제안이 왔다. 집값은 달라도 가족의 일은 여기에 있다.',
    reason: '지방 근무 제안이 왔다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '함께 이주를 알아본다', when: L => ally(L) && canMove(L) && (partner(L) || kidsN(L,0,18)>0), fx: { stats: { relations: 1, wealth: 1, leisure: -2 }, issues: { region: 2 } }, result: '가족 모두의 일과 학교를 살폈다.' },
        { id: 'c', label: '현재 근무를 지킨다', fx: { stats: { relations: 1, wealth: -1 }, issues: { job: 1 } }, result: '전근 기회보다 익숙한 생활권을 남겼다.' },
        { id: 'd', label: '지원 조건을 협의한다', fx: { stats: { intellect: 1, wealth: 1, leisure: -1 } }, result: '주거와 이동비가 얼마나 보전되는지 물었다.', do: (L, act) => act.flag('k150d', L.year) },
      ],
      default: 'd',
    },
  },
  // KR-151 housing / 수도권 세입자; 직장 고정; 낮은 주거비 여력
  // p 근거: 전세 2년 갱신 주기와 재계약 불확실성 → 임차 가구 연 12% [게임 추정]
  {
    id: 'ext.151', ages: [18, 65], years: [1990, 1999], p: 0.12, cooldown: 2, tags: ['ext'], src: ['EXT.H20'],
    when: L => (L.home?.regionGroup==='seoul'||L.home?.regionGroup==='capital') && tenant(L) && working(L),
    text: '전세 만기가 온다. 같은 돈으로 구할 수 있는 집이 더 멀어졌다.',
    reason: '전세 만기가 온다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '작은 집을 찾는다', fx: { stats: { leisure: -1, wealth: 1 }, issues: { housing: 2 } }, result: '생활권을 지키며 공간을 줄였다.' },
        { id: 'b', label: '외곽으로 옮긴다', when: L => canMove(L), fx: { stats: { wealth: 2, leisure: -2 }, issues: { housing: 3 } }, result: '보증금 부담을 낮추고 출퇴근 시간을 늘렸다.' },
        { id: 'd', label: '계약 연장을 협의한다', fx: { stats: { intellect: 1, relations: -1 }, issues: { housing: 1 } }, result: '이사를 피할 가능성을 두고 조건을 물었다.', do: (L, act) => act.flag('k151d', L.year) },
      ],
      default: 'd',
    },
  },
  // KR-152 job / 제조업 현장; 기능직; 자격 취득 가능
  // p 근거: 기능·조작직 자격 취득 기회 연 5% [게임 추정]
  {
    id: 'ext.152', ages: [18, 65], years: [1990, 1999], p: 0.05, cooldown: 4, tags: ['ext'], src: ['EXT.H21'],
    when: L => working(L) && ['7','8'].includes(maj(L)),
    text: '자격증을 따면 다른 공정에 지원할 수 있다. 시험 준비는 퇴근 뒤다.',
    reason: '자격증을 따면 다른 공정에 지원할 수 있다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '시험을 준비한다', fx: { stats: { intellect: 3, leisure: -3, health: -1 } }, result: '여가를 줄여 경력의 다른 문을 두드렸다.' },
        { id: 'b', label: '회사 교육을 묻는다', fx: { stats: { intellect: 1, leisure: -1 } }, result: '업무 안에서 배울 수 있는 시간을 찾았다.' },
        { id: 'c', label: '동료와 같이 배운다', when: L => ally(L), fx: { stats: { intellect: 1, relations: 2, leisure: -1 } }, result: '교재와 실습의 부담을 나누었다.' },
      ],
      default: 'b',
    },
  },
  // KR-153 tech / 은행·사무직; 전산 업무 도입
  // p 근거: 사무직 전산화 체감 연 5% [게임 추정]
  {
    id: 'ext.153', ages: [18, 65], years: [1990, 1999], p: 0.05, once: true, tags: ['ext'], src: ['EXT.H21'],
    when: L => emp(L) && maj(L)==='3',
    text: '손으로 하던 업무가 전산으로 바뀐다. 익숙한 속도가 통하지 않는다.',
    reason: '손으로 하던 업무가 전산으로 바뀐다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '교육을 신청한다', fx: { stats: { intellect: 2, leisure: -2 }, issues: { tech: 3 } }, result: '새 도구에 적응할 시간을 확보했다.' },
        { id: 'b', label: '작은 업무부터 바꾼다', fx: { stats: { intellect: 1, happiness: -1 }, issues: { tech: 2 } }, result: '기존 방식과 전산을 대조하며 익혔다.' },
        { id: 'c', label: '동료에게 도움을 청한다', when: L => ally(L), fx: { stats: { intellect: 1, relations: 2 }, issues: { tech: 1 } }, result: '혼자 늦어지던 일을 함께 풀었다.' },
      ],
      default: 'a',
    },
  },
  // KR-154 job / 편의점·소매점 구직자; 야간 근무 제안
  // p 근거: 구직자의 야간 일자리 제안 연 8% [게임 추정]
  {
    id: 'ext.154', ages: [18, 65], years: [1990, 1999], p: 0.08, cooldown: 3, tags: ['ext'], src: ['EXT.H21'],
    when: L => seeking(L),
    text: '야간 일자리가 났다. 낮의 공부나 돌봄과 겹치지는 않는다.',
    reason: '야간 일자리가 났다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '야간 조건을 묻는다', fx: { stats: { intellect: 1 }, issues: { job: 1 } }, result: '시급뿐 아니라 휴식과 귀가 조건을 확인했다.' },
        { id: 'b', label: '주간 일을 더 찾는다', fx: { stats: { leisure: 1, wealth: -1 }, issues: { job: 2 } }, result: '일 시작을 늦추고 생활 리듬을 남겼다.' },
        { id: 'c', label: '짧게 근무해 본다', fx: { stats: { wealth: 1, health: -1, leisure: -2 } }, result: '실제 피로와 남는 수입을 비교했다.' },
      ],
      default: 'a',
    },
  },
  // KR-155 tech / PC통신 이용 가능; 기기·통신비 부담 있음
  // p 근거: PC통신 대중화 이후(하이텔·천리안 등 1990년대 초) 이용 연 6% [게임 추정, 서비스 개시 연도는 기억 기반·미검색]
  {
    id: 'ext.155', ages: [18, 60], years: [1992, 1999], p: 0.06, cooldown: 4, tags: ['ext'], src: ['EXT.H28'],
    when: L => !lowW(L),
    text: '통신 모임에 접속하면 정보를 얻을 수 있다. 이용 시간은 요금이 된다.',
    reason: '통신 모임에 접속하면 정보를 얻을 수 있다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '접속 시간을 정한다', fx: { stats: { intellect: 1, leisure: -1 }, issues: { tech: 2 }, money: { assets: -5 } }, result: '정보와 비용에 하루 한도를 두었다.' },
        { id: 'b', label: '자료를 모아 읽는다', fx: { stats: { intellect: 2, leisure: -1 }, issues: { tech: 1 } }, result: '접속 밖에서 읽을 시간을 늘렸다.' },
        { id: 'd', label: '다른 정보원을 쓴다', fx: { stats: { intellect: 1, relations: 1, wealth: 1 } }, result: '신문과 도서관 등 접근 가능한 길을 남겼다.' },
      ],
      default: 'a',
    },
  },
  // KR-156 care / 맞벌이; 초등 자녀; 방과후 돌봄 공백
  // p 근거: 맞벌이 초등 자녀 하교 공백 연 10% [게임 추정]
  {
    id: 'ext.156', ages: [18, 65], years: [1990, 1999], p: 0.1, cooldown: 3, tags: ['ext'], src: ['EXT.H20'],
    when: L => emp(L) && partner(L) && kidsN(L,6,12)>=1,
    text: '아이의 하교가 퇴근보다 빠르다. 친척에게 매일 부탁하기 어렵다.',
    reason: '아이의 하교가 퇴근보다 빠르다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '퇴근 시간을 상의한다', fx: { stats: { relations: -1, leisure: 1 }, issues: { care: 2 } }, result: '고용 조건과 돌봄 사정을 함께 전했다.' },
        { id: 'b', label: '돌봄비를 예산에 넣는다', fx: { stats: { wealth: -3, leisure: 1 }, issues: { care: 1 } }, result: '소득 일부가 가족의 시간으로 바뀌었다.' },
        { id: 'd', label: '이웃과 돌봄을 나눈다', when: L => ally(L), fx: { stats: { relations: 2, leisure: -1 }, issues: { care: 2 } }, result: '신뢰와 일정 조율이 새 일이 되었다.' },
      ],
      default: 'a',
    },
  },
  // KR-157 housing / 결혼 의논 중; 주거 자금 부족
  // p 근거: 결혼 준비기 주거 자금 부족 연 8% [게임 추정]
  {
    id: 'ext.157', ages: [24, 40], years: [1990, 1999], p: 0.08, once: true, tags: ['ext'], src: ['EXT.H20'],
    when: L => !L.family?.married && (partner(L) || !!L.family?.dating) && lowW(L),
    text: '예식 비용과 신혼집 보증금이 같은 저축을 기다린다.',
    reason: '예식 비용과 신혼집 보증금이 같은 저축을 기다린다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '예식을 줄인다', fx: { stats: { wealth: 2, relations: -1 }, issues: { housing: 1 } }, result: '행사 규모를 낮추고 주거비를 남겼다.' },
        { id: 'b', label: '집의 면적을 줄인다', fx: { stats: { wealth: 1, happiness: -1 }, issues: { housing: 2 } }, result: '가족의 기대와 살림의 크기를 맞췄다.' },
        { id: 'd', label: '가족 지원을 의논한다', when: L => kin(L), fx: { stats: { relations: 1, wealth: 2, happiness: -1 } }, result: '경제 도움과 이후의 관계를 함께 생각했다.' },
      ],
      default: 'a',
    },
  },
  // KR-158 medical / 만성질환 진료 필요; 장거리 병원 이용
  // p 근거: 만성질환자의 평일 정기 진료 일정 충돌 연 10% [게임 추정]
  {
    id: 'ext.158', ages: [18, 65], years: [1990, 1999], p: 0.1, cooldown: 3, tags: ['ext'], src: ['EXT.H13'],
    when: L => chronic(L) && working(L),
    text: '정기 진료일이 평일이다. 약을 받는 일에도 휴가가 필요하다.',
    reason: '정기 진료일이 평일이다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '진료일을 미리 맞춘다', fx: { stats: { health: 2, leisure: -1 }, issues: { medical: 1 } }, result: '근무표와 병원 예약을 함께 관리했다.' },
        { id: 'b', label: '가까운 진료를 묻는다', fx: { stats: { health: 1, relations: 1 }, issues: { medical: 2 } }, result: '가능한 진료와 연계 범위를 확인했다.' },
        { id: 'd', label: '의료비를 따로 모은다', fx: { stats: { wealth: -1, happiness: 1 }, issues: { medical: 1 } }, result: '반복 지출을 가계의 고정 항목으로 넣었다.' },
      ],
      default: 'a',
    },
  },
  // KR-159 edu / 주거 불안 세입자; 자녀 전학 가능성
  // p 근거: 세입자 가구의 이사·전학 고민 연 8% [게임 추정]
  {
    id: 'ext.159', ages: [18, 65], years: [1990, 1999], p: 0.08, cooldown: 3, tags: ['ext'], src: ['EXT.H20'],
    when: L => tenant(L) && kidsN(L,6,17)>=1,
    text: '집을 옮기면 아이 학교도 달라진다. 가까운 집은 보증금이 높다.',
    reason: '집을 옮기면 아이 학교도 달라진다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '생활권 안을 찾는다', fx: { stats: { wealth: -2, leisure: -1 }, issues: { housing: 2 } }, result: '면적과 비용을 조정해 학교를 지키려 했다.' },
        { id: 'b', label: '전학을 준비한다', fx: { stats: { intellect: -1, relations: 1 }, issues: { edu: 2 } }, result: '아이의 의견과 새 통학로를 함께 살폈다.' },
        { id: 'c', label: '계약 조건을 협의한다', fx: { stats: { wealth: 1 }, issues: { housing: 2 } }, result: '이동을 미룰 수 있는지 먼저 물었다.' },
      ],
      default: 'c',
    },
  },
  // KR-160 job / 택시·개인 운송업; 차량 보유
  // p 근거: 차량 보유 운송업의 교체·수리 판단 연 8% [게임 추정]
  {
    id: 'ext.160', ages: [18, 65], years: [1990, 1999], p: 0.08, cooldown: 3, tags: ['ext'], src: ['EXT.H21'],
    when: L => working(L) && /택시|운전|운수|배달/.test(L.job?.title ?? ''),
    text: '차량을 바꾸면 수리비는 줄 수 있다. 할부는 매달 남는다.',
    reason: '차량을 바꾸면 수리비는 줄 수 있다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '수리 견적을 받는다', fx: { stats: { intellect: 1, wealth: 1 } }, result: '교체와 유지의 실제 비용을 비교했다.' },
        { id: 'b', label: '중고 차량을 찾는다', fx: { stats: { wealth: 2, health: -1 }, issues: { living: 1 }, money: { assets: -50 } }, result: '초기 비용과 이후 정비 위험을 함께 따졌다.' },
        { id: 'c', label: '교체를 미룬다', fx: { stats: { wealth: 1, health: -1, leisure: -1 } }, result: '큰돈을 남기고 정비 일정을 더 챙겼다.' },
      ],
      default: 'a',
    },
  },
  // KR-161 edu / 대입 준비; 1994학년도 수능 응시 코호트
  // p 근거: 수능 코호트(1994학년도) 2년간 입시 이정표와 중복되어 낮게 [게임 추정]
  {
    id: 'ext.161', ages: [17, 19], years: [1993, 1994], p: 0.08, once: true, tags: ['ext'], src: ['EXT.H10'],
    when: L => student(L),
    text: '대입 시험 방식이 바뀌었다. 익숙한 문제집과 새 유형이 다르다.',
    reason: '대입 시험 방식이 바뀌었다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '공식 예시를 본다', fx: { stats: { intellect: 2, leisure: -1 }, issues: { edu: 1 } }, result: '유행하는 말보다 시험 안내를 먼저 읽었다.' },
        { id: 'b', label: '학교 자료를 활용한다', fx: { stats: { intellect: 1, wealth: 1, relations: 1 } }, result: '추가 비용을 줄이며 새 유형을 익혔다.' },
        { id: 'c', label: '유료 강의를 비교한다', when: L => !lowW(L), fx: { stats: { intellect: 2, wealth: -2 }, issues: { edu: 3 } }, result: '가계가 감당할 범위의 도움을 찾았다.' },
      ],
      default: 'a',
    },
  },
  // KR-162 living / 폭염 영향 지역; 냉방 취약 주거
  // p 근거: 1994 폭염해 냉방 취약 가구 단발 [게임 추정]
  {
    id: 'ext.162', ages: [18, 70], years: [1994, 1994], p: 0.15, once: true, tags: ['ext'], src: ['EXT.H29'],
    when: L => lowW(L) || L.home?.tenure==='monthly',
    text: '더위가 오래 간다. 잠을 설치니 일의 속도도 떨어진다.',
    reason: '더위가 오래 간다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '낮 일정을 바꾼다', fx: { stats: { health: 1, wealth: -1, leisure: -1 } }, result: '더운 시간의 일을 줄여 생활을 재배치했다.' },
        { id: 'b', label: '냉방비를 더 쓴다', fx: { stats: { health: 2, wealth: -2 }, issues: { living: 3 } }, result: '다른 소비를 줄여 잠과 회복을 챙겼다.' },
        { id: 'c', label: '더 시원한 곳을 찾는다', fx: { stats: { health: 1, leisure: -2, relations: 1 } }, result: '이동 시간과 비용이 추가로 들었다.' },
      ],
      default: 'a',
    },
  },
  // KR-163 care / 농어촌 국민연금 확대 대상; 납부 여력 변동
  // p 근거: 1995.7 농어촌 국민연금 적용(지역가입), 5년 창구 기간 [검색 확인]
  {
    id: 'ext.163', ages: [18, 59], years: [1995, 1999], p: 0.06, once: true, tags: ['ext'], src: ['EXT.H12'],
    when: L => prov(L) && (self(L) || seeking(L) || L.job?.status==='inactive'),
    text: '농어촌에도 연금이 확대됐다. 농사 수입은 매달 같지 않다.',
    reason: '농어촌에도 연금이 확대됐다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '가입 조건을 확인한다', fx: { stats: { intellect: 1 }, issues: { care: 1 } }, result: '소득 신고와 적용 범위를 먼저 살폈다.' },
        { id: 'b', label: '납부 계획을 세운다', fx: { stats: { wealth: -1, happiness: 1 }, issues: { care: 2 } }, result: '수입이 생기는 시기와 고정 지출을 맞췄다.' },
        { id: 'c', label: '상담으로 조정을 묻는다', fx: { stats: { intellect: 1, relations: 1, leisure: -1 } }, result: '당시 가능한 납부 관련 절차를 확인했다.', do: (L, act) => act.flag('k163c', L.year) },
      ],
      default: 'a',
    },
  },
  // KR-164 job / 대형 유통점 인근; 동네 소매상
  // p 근거: 대형 유통점 진출기 소매 자영업 연 8% [게임 추정]
  {
    id: 'ext.164', ages: [18, 65], years: [1995, 1999], p: 0.08, cooldown: 3, tags: ['ext'], src: ['EXT.H21'],
    when: L => self(L) && maj(L)==='5',
    text: '큰 가게가 들어왔다. 단골은 가격을 비교하기 시작했다.',
    reason: '큰 가게가 들어왔다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '품목을 줄여 특화한다', fx: { stats: { wealth: 1, leisure: -1 }, issues: { job: 2 } }, result: '모든 물건 대신 찾는 이유를 좁혔다.' },
        { id: 'b', label: '배달·외상을 조정한다', fx: { stats: { relations: 1, wealth: -1, leisure: -1 } }, result: '단골 편의와 자금 부담을 함께 바꿨다.' },
        { id: 'c', label: '공동 매입을 묻는다', when: L => ally(L), fx: { stats: { wealth: 1, relations: 1 } }, result: '가격 대응을 위해 이웃과 물량을 모았다.' },
      ],
      default: 'a',
    },
  },
  // KR-165 job / 외환위기 영향; 구조조정 대상 사업장
  // p 근거: 외환위기기 구조조정 공지 노출 연 12% [게임 추정, 당시 실업률 6~7%대 체감은 기억 기반·미검색]
  {
    id: 'ext.165', ages: [25, 60], years: [1997, 1999], p: 0.12, cooldown: 2, tags: ['ext'], src: ['EXT.H15'],
    when: L => emp(L),
    text: '회사에서 인원을 줄인다는 공지가 왔다. 내 이름은 아직 모른다.',
    reason: '회사에서 인원을 줄인다는 공지가 왔다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '고용 조건을 확인한다', fx: { stats: { intellect: 1 }, issues: { job: 3 } }, result: '퇴직·잔류 조건을 문서로 비교했다.' },
        { id: 'b', label: '다른 직장을 찾는다', fx: { stats: { leisure: -2, intellect: 1 }, issues: { job: 2 } }, result: '지금 일을 하며 경력 자료를 준비했다.' },
        { id: 'c', label: '가계 비상금을 점검한다', fx: { stats: { wealth: 1, happiness: -1 }, issues: { job: 2 }, money: { assets: 20 } }, result: '확인되지 않은 위기에 지출부터 대비했다.' },
      ],
      default: 'a',
    },
  },
  // KR-166 job / 희망퇴직 제안; 근속·퇴직금 있음
  // p 근거: 장기 재직자 대상 희망퇴직 제안 연 8% [게임 추정]
  {
    id: 'ext.166', ages: [35, 60], years: [1997, 1999], p: 0.08, once: true, tags: ['ext'], src: ['EXT.H15'],
    when: L => emp(L) && (L.job?.years ?? 0) >= 5,
    text: '희망퇴직 조건이 제시됐다. 목돈 다음의 월수입은 정해지지 않았다.',
    reason: '희망퇴직 조건이 제시됐다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '조건을 자세히 묻는다', fx: { stats: { intellect: 1 }, issues: { job: 3 } }, result: '지급일과 이후 보장을 함께 확인했다.' },
        { id: 'b', label: '재취업부터 살핀다', fx: { stats: { leisure: -2, intellect: 1 }, issues: { job: 2 } }, result: '퇴직 여부와 별개로 시장의 조건을 보았다.' },
        { id: 'd', label: '당장 잔류를 택한다', fx: { stats: { happiness: -2, wealth: 1 }, issues: { job: 4 } }, result: '불확실한 직장에 남아 다음 경로를 준비했다.' },
      ],
      default: 'a',
    },
  },
  // KR-167 job / 부도 영향 중소기업 근로자; 임금 체불
  // p 근거: 부도 영향 소규모 사업장 재직자 연 8% [게임 추정]
  {
    id: 'ext.167', ages: [18, 65], years: [1997, 1999], p: 0.08, cooldown: 3, tags: ['ext'], src: ['EXT.H15'],
    when: L => emp(L) && ['micro','small'].includes(sz(L)),
    text: '월급이 밀리고 회사 문이 자주 닫힌다. 방세는 계속 나간다.',
    reason: '월급이 밀리고 회사 문이 자주 닫힌다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '체불 기록을 모은다', fx: { stats: { intellect: 1, leisure: -1 }, issues: { job: 2, fairness: 1 } }, result: '계약과 지급 내역을 정리했다.' },
        { id: 'b', label: '상담 창구를 찾는다', fx: { stats: { intellect: 1, relations: 1 }, issues: { job: 2 } }, result: '당시 가능한 구제 절차와 대상 여부를 물었다.', do: (L, act) => act.flag('k167b', L.year) },
        { id: 'c', label: '새 일자리를 찾는다', fx: { stats: { leisure: -2, wealth: 1 }, issues: { job: 3 } }, result: '돌아올 돈과 앞으로의 벌이를 따로 준비했다.' },
      ],
      default: 'a',
    },
  },
  // KR-168 housing / 변동금리 차입 가구·자영업자; 상환 압박
  // p 근거: 부채 보유자의 이자 급등 체감 연 12% [게임 추정]
  {
    id: 'ext.168', ages: [18, 65], years: [1997, 1999], p: 0.12, cooldown: 2, tags: ['ext'], src: ['EXT.H15'],
    when: L => hasDebt(L),
    text: '대출 이자가 늘었다. 수입이 줄어 상환일이 더 가깝게 느껴진다.',
    reason: '대출 이자가 늘었다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '금융기관과 상의한다', when: L => hasDebt(L), fx: { stats: { intellect: 1, leisure: -1 }, issues: { living: 2 } }, result: '상환 조건 변경 가능성을 확인했다.', do: (L, act) => act.flag('k168a', L.year) },
        { id: 'b', label: '자산 처분을 검토한다', fx: { stats: { wealth: 1, happiness: -2 }, issues: { housing: 2 } }, result: '생활 유지에 필요한 것과 팔 수 있는 것을 나눴다.' },
        { id: 'c', label: '지출을 재배치한다', fx: { stats: { wealth: 1, leisure: -1 }, issues: { living: 2 } }, result: '필수 생활비와 갚을 돈의 순서를 정했다.' },
      ],
      default: 'c',
    },
  },
  // KR-169 edu / 대학 재학생; 가구소득 급감
  // p 근거: IMF기 대학생 가구소득 감소 연 8% [게임 추정]
  {
    id: 'ext.169', ages: [19, 30], years: [1997, 1999], p: 0.08, once: true, tags: ['ext'], src: ['EXT.H15'],
    when: L => student(L),
    text: '집의 소득이 줄었다. 다음 학기 등록금부터 다시 정해야 한다.',
    reason: '집의 소득이 줄었다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '장학·감면을 묻는다', fx: { stats: { intellect: 1 }, issues: { edu: 2 } }, result: '학교에 적용 가능한 도움을 확인했다.', do: (L, act) => act.flag('k169a', L.year) },
        { id: 'b', label: '휴학을 의논한다', fx: { stats: { wealth: 2, intellect: -2 }, issues: { edu: 3 } }, result: '학업을 잠시 멈추고 생활비를 벌 계획을 세웠다.' },
        { id: 'c', label: '일과 수업을 병행한다', fx: { stats: { wealth: 1, health: -1, leisure: -2 }, issues: { edu: 1 } }, result: '수입이 보태지고 회복 시간은 줄었다.' },
      ],
      default: 'a',
    },
  },
  // KR-170 care / 가족 실직; 이전 단일 소득 가구
  // p 근거: 기혼 구직자의 가계 충격(실업률 상승기) [게임 추정]
  {
    id: 'ext.170', ages: [18, 65], years: [1997, 1999], p: 0.15, cooldown: 3, tags: ['ext'], src: ['EXT.H15'],
    when: L => !!L.family?.married && seeking(L),
    text: '가족 한 사람의 실직이 집안 전체의 시간표를 바꾼다.',
    reason: '가족 한 사람의 실직이 집안 전체의 시간표를 바꾼다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '가계 장부를 공유한다', fx: { stats: { relations: 1, happiness: -1 }, issues: { job: 2 } }, result: '수입의 공백을 모두가 보게 했다.' },
        { id: 'b', label: '구직 시간을 나눈다', fx: { stats: { leisure: -1, relations: 1 }, issues: { care: 2 } }, result: '돌봄과 집안일을 조정해 다시 일할 시간을 냈다.' },
        { id: 'd', label: '생활 규모를 줄인다', fx: { stats: { wealth: 1, happiness: -2 }, issues: { living: 2 } }, result: '당장 버틸 기간을 늘리려 지출을 덜었다.' },
      ],
      default: 'a',
    },
  },
  // KR-171 job / 수출업체 근로자; 환율 변화 영향; 실적 변동
  // p 근거: 수출 영향 사업장 재직자 연 5% [게임 추정, 수출업체 여부 필드 없음]
  {
    id: 'ext.171', ages: [18, 65], years: [1998, 1999], p: 0.05, once: true, tags: ['ext'], src: ['EXT.H15'],
    when: L => emp(L) && sz(L)!=='micro',
    text: '환율 변화로 주문은 늘지만 수입 원료 값도 오른다.',
    reason: '환율 변화로 주문은 늘지만 수입 원료 값도 오른다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '실적과 비용을 함께 본다', when: L => ally(L), fx: { stats: { intellect: 1, relations: 1 }, issues: { job: 1 } }, result: '매출 증가와 남는 이익을 구분했다.' },
        { id: 'b', label: '근무 조건을 협의한다', fx: { stats: { relations: -1, wealth: 1 }, issues: { job: 1 } }, result: '주문량에 따른 노동 시간 변화를 물었다.' },
        { id: 'c', label: '새 공정을 배운다', fx: { stats: { intellect: 2, leisure: -2 }, issues: { tech: 1 } }, result: '바뀐 생산에 적응할 숙련을 쌓았다.' },
      ],
      default: 'b',
    },
  },
  // KR-172 job / 졸업 청년; 공채 축소; 저축 여력 낮음
  // p 근거: 공채 축소기 청년 구직자 연 12% [게임 추정]
  {
    id: 'ext.172', ages: [20, 34], years: [1998, 1999], p: 0.12, cooldown: 2, tags: ['ext'], src: ['EXT.H15'],
    when: L => seeking(L),
    text: '공채가 줄었다. 기다릴수록 경력이 아니라 생활비가 쌓인다.',
    reason: '공채가 줄었다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '작은 회사도 지원한다', fx: { stats: { wealth: 1, happiness: -1 }, issues: { job: 2 } }, result: '기업 간판보다 실제 조건을 넓게 비교했다.' },
        { id: 'b', label: '계약직을 알아본다', fx: { stats: { wealth: 1, intellect: 1 }, issues: { job: 3 } }, result: '불안정한 고용과 첫 경력의 가치를 함께 따졌다.' },
        { id: 'c', label: '준비 기간을 정한다', fx: { stats: { leisure: 1, wealth: -1 }, issues: { job: 1 } }, result: '무기한 대기 대신 생활비 한도를 세웠다.' },
      ],
      default: 'c',
    },
  },
  // KR-173 job / 퇴직 후 창업 검토; 퇴직금이 주요 자본
  // p 근거: 퇴직금 보유 퇴직자의 창업 권유 연 10% [게임 추정]
  {
    id: 'ext.173', ages: [35, 60], years: [1998, 1999], p: 0.1, once: true, tags: ['ext'], src: ['EXT.H15'],
    when: L => (seeking(L) || L.job?.status==='retired') && ((L.money?.severance ?? 0) > 0 || (L.money?.assets ?? 0) >= 3000),
    text: '주변에서 퇴직금으로 가게를 열었다. 내 목돈도 비슷한 말을 듣는다.',
    reason: '주변에서 퇴직금으로 가게를 열었다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '작게 시험 판매한다', fx: { stats: { intellect: 1, wealth: -1, leisure: -2 }, issues: { job: 2 } }, result: '큰 임대 계약 전에 수요를 살폈다.' },
        { id: 'c', label: '재취업을 더 찾는다', fx: { stats: { wealth: 1, leisure: -1 }, issues: { job: 2 } }, result: '창업비를 쓰지 않고 다른 수입을 살폈다.' },
        { id: 'd', label: '비상금을 따로 둔다', fx: { stats: { wealth: 1, happiness: 1 }, issues: { job: 1 } }, result: '창업에 써도 생활비 전부는 걸지 않았다.' },
      ],
      default: 'd',
    },
  },
  // KR-174 care / 도시 자영업·지역 가입 대상; 국민연금 확대
  // p 근거: 1999.4 도시지역 국민연금 확대, 도시 자영 전원 [검색 확인]
  {
    id: 'ext.174', ages: [18, 59], years: [1999, 1999], p: 0.15, once: true, tags: ['ext'], src: ['EXT.H12'],
    when: L => self(L) && urban(L),
    text: '도시지역에도 국민연금이 확대됐다. 소득은 신고와 납부로 이어진다.',
    reason: '도시지역에도 국민연금이 확대됐다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '안내를 확인한다', fx: { stats: { intellect: 1 }, issues: { care: 1 } }, result: '적용 대상과 신고 절차를 먼저 읽었다.' },
        { id: 'b', label: '소득 자료를 정리한다', fx: { stats: { intellect: 1, leisure: -1 }, issues: { living: 1 } }, result: '가게와 가구의 돈을 나누어 보았다.' },
        { id: 'c', label: '납부 상담을 받는다', fx: { stats: { intellect: 1, relations: 1 } }, result: '소득 변화 때 쓸 수 있는 절차를 물었다.', do: (L, act) => act.flag('k174c', L.year) },
      ],
      default: 'a',
    },
  },
  // KR-175 tech / PC방 창업 또는 IT 관련 창업 검토; 자본 여력 있음
  // p 근거: 1999 PC방 창업 붐기 자본 보유자 연 4% [게임 추정]
  {
    id: 'ext.175', ages: [20, 45], years: [1999, 1999], p: 0.04, once: true, tags: ['ext'], src: ['EXT.H28'],
    when: L => (L.money?.assets ?? 0) >= 2000,
    text: '인터넷 관련 가게가 늘어난다. 기기 값과 임대료는 먼저 든다.',
    reason: '인터넷 관련 가게가 늘어난다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '입지와 수요를 본다', fx: { stats: { intellect: 1, leisure: -1 }, issues: { tech: 2 } }, result: '유행하는 말 대신 동네의 이용자를 살폈다.' },
        { id: 'b', label: '중고 기기를 비교한다', fx: { stats: { intellect: 1, wealth: 1 }, issues: { tech: 1 } }, result: '초기비와 유지보수 부담을 함께 따졌다.' },
        { id: 'd', label: '창업을 보류한다', fx: { stats: { wealth: 1, happiness: 1 }, issues: { tech: 1 } }, result: '새 기술을 관찰하며 목돈은 지켰다.' },
      ],
      default: 'a',
    },
  },
  // KR-176 tech / 초고속인터넷 이용 가능 가구; 통신비 부담
  // p 근거: 초고속인터넷 보급기 가구의 도입 고민 연 10% [게임 추정]
  {
    id: 'ext.176', ages: [18, 65], years: [2000, 2009], p: 0.1, once: true, tags: ['ext'], src: ['EXT.H28'],
    when: L => !lowW(L),
    text: '집에 인터넷을 들이면 정보를 얻기 쉽다. 매달 요금도 생긴다.',
    reason: '집에 인터넷을 들이면 정보를 얻기 쉽다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '요금제를 비교한다', fx: { stats: { intellect: 1, wealth: 1 }, issues: { tech: 1 } }, result: '속도보다 실제 쓰는 양과 비용을 맞췄다.' },
        { id: 'b', label: '가족이 함께 쓴다', when: L => kin(L) && ally(L), fx: { stats: { relations: 1, intellect: 1 }, issues: { tech: 1 } }, result: '한 회선의 시간과 용도를 나누었다.' },
        { id: 'd', label: '도입을 미룬다', fx: { stats: { wealth: 1, leisure: 1 }, issues: { tech: 2 } }, result: '현재 정보 경로를 쓰며 구입비를 남겼다.' },
      ],
      default: 'a',
    },
  },
  // KR-177 fairness / 비정규 근로자; 같은 작업 정규직과 처우 차이
  // p 근거: 비정규 재직자의 처우 격차 체감 연 10% [게임 추정]
  {
    id: 'ext.177', ages: [18, 65], years: [2000, 2009], p: 0.1, cooldown: 3, tags: ['ext'], src: ['EXT.H21'],
    when: L => emp(L) && !L.job?.regular,
    text: '같은 줄에서 일하지만 계약 갱신과 수당은 다르다.',
    reason: '같은 줄에서 일하지만 계약 갱신과 수당은 다르다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '계약 내용을 확인한다', fx: { stats: { intellect: 1 }, issues: { fairness: 2 } }, result: '관행과 문서의 차이를 먼저 살폈다.' },
        { id: 'b', label: '경력 자료를 모은다', fx: { stats: { intellect: 1, leisure: -1 }, issues: { job: 1 } }, result: '같은 업무를 했다는 기록을 남겼다.' },
        { id: 'c', label: '다른 채용을 알아본다', fx: { stats: { wealth: 1, leisure: -1 }, issues: { job: 2 } }, result: '안정성과 임금을 함께 비교했다.' },
      ],
      default: 'a',
    },
  },
  // KR-178 job / 온라인 판매 가능한 소상인; 초기 비용 제한
  // p 근거: 온라인 판매가 확산되던 시기 소매 자영업 연 8% [게임 추정]
  {
    id: 'ext.178', ages: [18, 65], years: [2000, 2009], p: 0.08, once: true, tags: ['ext'], src: ['EXT.H28'],
    when: L => self(L) && maj(L)==='5',
    text: '손님이 인터넷 가격을 보여 준다. 가게도 판매 방식을 고민한다.',
    reason: '손님이 인터넷 가격을 보여 준다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '일부 상품을 올린다', fx: { stats: { wealth: 1, leisure: -2 }, issues: { tech: 3 } }, result: '사진과 배송처럼 새로운 일이 생겼다.' },
        { id: 'c', label: '배송비를 계산한다', fx: { stats: { intellect: 1, wealth: 1 }, issues: { tech: 1 } }, result: '매출과 실제 남는 돈을 나누었다.' },
        { id: 'd', label: '현장 판매에 집중한다', fx: { stats: { relations: 1, wealth: -1 }, issues: { tech: 1 } }, result: '익숙한 운영을 남기며 품목을 조정했다.' },
      ],
      default: 'd',
    },
  },
  // KR-179 edu / 취업 준비; 어학·자격 수강비 부담
  // p 근거: 취업 준비기 자격·어학 비용 부담 연 12% [게임 추정]
  {
    id: 'ext.179', ages: [19, 40], years: [2000, 2009], p: 0.12, cooldown: 3, tags: ['ext'], src: ['EXT.H21'],
    when: L => seeking(L) || student(L),
    text: '구인 공고마다 자격이 더 적혀 있다. 준비비와 생활비는 같은 통장에서 나간다.',
    reason: '구인 공고마다 자격이 더 적혀 있다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '필수 자격부터 고른다', fx: { stats: { intellect: 2, wealth: -1 }, issues: { edu: 2 } }, result: '모든 항목 대신 지원할 일의 요건을 좁혔다.' },
        { id: 'b', label: '공공 교육을 찾는다', fx: { stats: { intellect: 1, wealth: 1 }, issues: { job: 1 } }, result: '비용을 줄일 경로와 일정을 확인했다.', do: (L, act) => act.flag('k179b', L.year) },
        { id: 'c', label: '일하며 준비한다', fx: { stats: { wealth: 2, intellect: 1, leisure: -2 }, issues: { job: 1 } }, result: '생활비를 벌며 공부 시간이 짧아졌다.' },
      ],
      default: 'a',
    },
  },
  // KR-180 housing / 수도권 무주택; 맞벌이; 장거리 통근
  // p 근거: 수도권 맞벌이 장거리 통근 연 6% [게임 추정]
  {
    id: 'ext.180', ages: [18, 65], years: [2000, 2009], p: 0.06, cooldown: 4, tags: ['ext'], src: ['EXT.H20'],
    when: L => (L.home?.regionGroup==='seoul'||L.home?.regionGroup==='capital') && emp(L) && partner(L),
    text: '집값이 낮은 곳은 회사와 멀다. 두 사람의 출근 방향도 다르다.',
    reason: '집값이 낮은 곳은 회사와 멀다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '중간 지역을 찾는다', fx: { stats: { relations: 1, leisure: 1, wealth: -1 }, issues: { housing: 2 } }, result: '한 사람에게 몰린 통근 부담을 나눴다.' },
        { id: 'c', label: '주거비를 더 쓴다', fx: { stats: { wealth: -2, leisure: 2 }, issues: { housing: 2 } }, result: '현금 여유를 줄여 이동 시간을 샀다.' },
        { id: 'd', label: '현재 집을 유지한다', fx: { stats: { wealth: 1, leisure: -2, health: -1 } }, result: '비용을 남기고 생활 일정을 다시 짰다.' },
      ],
      default: 'd',
    },
  },
  // KR-181 living / 신용카드 사용 가구; 청구액 부담
  // p 근거: 카드 보급기 청구액 부담 연 8% [게임 추정]
  {
    id: 'ext.181', ages: [20, 65], years: [2000, 2009], p: 0.08, cooldown: 3, tags: ['ext'], src: ['EXT.H20'],
    when: L => hasDebt(L) || lowW(L),
    text: '이번 카드대금이 예상보다 크다. 할부는 다음 달에도 남는다.',
    reason: '이번 카드대금이 예상보다 크다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '사용 내역을 펼친다', fx: { stats: { intellect: 1, leisure: -1 }, issues: { living: 2 } }, result: '필수 지출과 미룰 소비를 나누었다.' },
        { id: 'b', label: '신규 할부를 멈춘다', fx: { stats: { wealth: 1, happiness: -1 }, issues: { living: 1 } }, result: '다음 달 고정 부담부터 줄였다.' },
        { id: 'c', label: '상환 상담을 묻는다', when: L => hasDebt(L), fx: { stats: { wealth: 1, happiness: -1 }, issues: { living: 2 } }, result: '가능한 절차와 실제 비용을 확인했다.', do: (L, act) => act.flag('k181c', L.year) },
      ],
      default: 'a',
    },
  },
  // KR-182 job / 택배 기사; 물량 증가; 차량 비용 부담
  // p 근거: 택배 종사자의 물량 증가기 부담 연 8% [게임 추정]
  {
    id: 'ext.182', ages: [18, 65], years: [2000, 2009], p: 0.08, cooldown: 3, tags: ['ext'], src: ['EXT.H21'],
    when: L => working(L) && (code(L)==='92220' || /택배/.test(L.job?.title ?? '')),
    text: '배송 물량이 늘었다. 매출은 늘어도 기름값과 작업 시간도 같이 든다.',
    reason: '배송 물량이 늘었다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '동선을 재조정한다', fx: { stats: { wealth: 1, health: -1, leisure: 1 } }, result: '더 많이 하기보다 빈 이동을 줄이려 했다.' },
        { id: 'b', label: '물량을 제한한다', fx: { stats: { health: 1, leisure: 1, wealth: -2 } }, result: '수입 기대를 낮추고 휴식을 남겼다.' },
        { id: 'c', label: '실비를 장부에 적는다', fx: { stats: { intellect: 1, wealth: 1, leisure: -1 } }, result: '총액에서 차량과 연료 비용을 분리했다.' },
      ],
      default: 'a',
    },
  },
  // KR-183 job / 콜센터 상담원; 감정노동 발생
  // p 근거: 상담 업무 종사자의 감정노동 체감 연 10% [게임 추정]
  {
    id: 'ext.183', ages: [18, 65], years: [2000, 2009], p: 0.1, cooldown: 3, tags: ['ext'], src: ['EXT.H21'],
    when: L => emp(L) && /상담|텔레|콜|고객/.test(L.job?.title ?? ''),
    text: '상담이 끝나도 고객의 말이 오래 남는다. 다음 전화는 곧 온다.',
    reason: '상담이 끝나도 고객의 말이 오래 남는다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '휴식 절차를 묻는다', fx: { stats: { health: 1, happiness: 1 }, issues: { job: 1 } }, result: '업무 사이 회복 시간을 확보하려 했다.' },
        { id: 'b', label: '상담 기록을 남긴다', fx: { stats: { intellect: 1, happiness: -1 }, issues: { fairness: 2 } }, result: '문제가 된 상황을 구체적으로 정리했다.' },
        { id: 'c', label: '동료와 경험을 나눈다', when: L => ally(L), fx: { stats: { relations: 2, happiness: 1 } }, result: '일의 부담을 혼자만의 문제로 두지 않았다.' },
      ],
      default: 'a',
    },
  },
  // KR-184 job / 공단 협력업체; 납기 압박; 교대근무
  // p 근거: 협력업체 교대·납기 압박 연 8% [게임 추정]
  {
    id: 'ext.184', ages: [18, 65], years: [2000, 2009], p: 0.08, cooldown: 2, tags: ['ext'], src: ['EXT.H21'],
    when: L => emp(L) && ['7','8'].includes(maj(L)) && ['micro','small','mid'].includes(sz(L)),
    text: '원청 일정이 바뀌어 주말 작업이 잡혔다. 가족 약속도 이미 있다.',
    reason: '원청 일정이 바뀌어 주말 작업이 잡혔다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '근무 교환을 묻는다', when: L => ally(L), fx: { stats: { relations: 1, leisure: 1 }, issues: { job: 1 } }, result: '동료 일정까지 함께 조정해야 했다.' },
        { id: 'b', label: '추가 근무를 맡는다', fx: { stats: { wealth: 2, health: -1, leisure: -2 } }, result: '수입을 보태고 주말의 회복을 미뤘다.' },
        { id: 'c', label: '일정을 조정해 달라 한다', fx: { stats: { intellect: 1, relations: -1 }, issues: { job: 1 } }, result: '실제 가능한 납기를 작업장에 알렸다.' },
      ],
      default: 'c',
    },
  },
  // KR-185 care / 농촌; 부모 진료 동행; 자녀 타지 거주
  // p 근거: 비도시권 고령 부모 진료 동행 연 10% [게임 추정]
  {
    id: 'ext.185', ages: [35, 65], years: [2000, 2009], p: 0.1, cooldown: 3, tags: ['ext'], src: ['EXT.H20'],
    when: L => prov(L) && parentsAlive(L).length>0,
    text: '부모의 병원 예약이 평일이다. 자녀들은 다른 도시에서 일한다.',
    reason: '부모의 병원 예약이 평일이다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '동행을 교대로 한다', when: L => ally(L) && (L.family?.siblings ?? 0) > 0, fx: { stats: { relations: 2, leisure: -1 }, issues: { care: 1 } }, result: '한 사람의 휴가에 몰린 부담을 나눴다.' },
        { id: 'b', label: '이동 지원을 찾는다', fx: { stats: { intellect: 1, leisure: -1 }, issues: { care: 1 } }, result: '지역에서 이용 가능한 도움을 물었다.', do: (L, act) => act.flag('k185b', L.year) },
        { id: 'c', label: '가까운 진료를 알아본다', fx: { stats: { health: 1, intellect: 1 }, issues: { medical: 2 } }, result: '연계 가능한 치료 범위를 확인했다.' },
      ],
      default: 'c',
    },
  },
  // KR-186 housing / 주거 접근성 제약; 이동 보조 필요한 당사자
  // p 근거: 이동 보조가 필요한 당사자의 주거 접근성 연 10% [게임 추정]
  {
    id: 'ext.186', ages: [18, 65], years: [2000, 2009], p: 0.1, cooldown: 3, tags: ['ext'], src: ['EXT.H20'],
    when: L => dis(L),
    text: '집은 저렴하지만 계단이 많다. 외출 한 번에도 도움이 필요하다.',
    reason: '집은 저렴하지만 계단이 많다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'b', label: '집주인과 개선을 묻는다', fx: { stats: { relations: -1, leisure: 1 }, issues: { housing: 2 } }, result: '동의가 필요한 보수 범위를 확인했다.' },
        { id: 'c', label: '지역 지원을 찾는다', fx: { stats: { leisure: 1, intellect: 1 }, issues: { housing: 1 } }, result: '당시 가능한 이동·주거 지원을 알아보았다.', do: (L, act) => act.flag('k186c', L.year) },
        { id: 'd', label: '도움 일정을 조정한다', fx: { stats: { leisure: 1, health: 1, relations: 1 } }, result: '스스로 할 일과 지원받을 시간을 나누었다.' },
      ],
      default: 'b',
    },
  },
  // KR-187 care / 맞벌이; 영유아; 어린이집 이용 희망
  // p 근거: 맞벌이 영유아 가구의 보육시설 공백 연 12% [게임 추정]
  {
    id: 'ext.187', ages: [18, 65], years: [2000, 2009], p: 0.12, cooldown: 2, tags: ['ext'], src: ['EXT.H20'],
    when: L => emp(L) && partner(L) && kidsN(L,0,5)>=1,
    text: '어린이집 시간이 퇴근보다 짧다. 가까운 곳은 자리가 없다.',
    reason: '어린이집 시간이 퇴근보다 짧다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '대기 신청을 한다', fx: { stats: { leisure: 1, relations: -1 }, issues: { care: 2 } }, result: '시간을 기다리며 임시 돌봄을 함께 준비했다.', do: (L, act) => act.flag('k187a', L.year) },
        { id: 'b', label: '근무시간을 조정한다', fx: { stats: { wealth: -2, leisure: 2 }, issues: { care: 1 } }, result: '임금과 돌봄 공백을 함께 따졌다.' },
        { id: 'd', label: '다른 시설을 찾는다', fx: { stats: { leisure: -1, relations: 1 }, issues: { care: 1 } }, result: '이동거리와 운영시간을 비교했다.' },
      ],
      default: 'a',
    },
  },
  // KR-188 job / IT 기업 근로자; 잦은 일정 변경
  // p 근거: IT 직군의 일정 변경·야근 연 8% [게임 추정]
  {
    id: 'ext.188', ages: [20, 35], years: [2001, 2009], p: 0.08, cooldown: 3, tags: ['ext'], src: ['EXT.H28'],
    when: L => emp(L) && /소프트|정보|컴퓨터|시스템|프로그래|IT/.test(L.job?.title ?? ''),
    text: '서비스 출시가 늦어졌다. 새 기능과 야근이 같은 회의에서 정해진다.',
    reason: '서비스 출시가 늦어졌다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '업무 범위를 협의한다', fx: { stats: { intellect: 1, health: 1 }, issues: { job: 1 } }, result: '할 수 있는 일과 날짜를 구체적으로 나눴다.' },
        { id: 'b', label: '마감을 함께 분담한다', when: L => ally(L), fx: { stats: { relations: 2, health: -1, leisure: -1 } }, result: '추가 수입보다 팀의 시간표를 먼저 바꿨다.' },
        { id: 'c', label: '경력 자료를 정리한다', fx: { stats: { intellect: 2, leisure: -1 }, issues: { tech: 1 } }, result: '외부에 설명할 수 있는 작업을 모았다.' },
      ],
      default: 'a',
    },
  },
  // KR-189 job / 월드컵 시기; 음식점·소매점 자영업
  // p 근거: 2002 월드컵 해 음식·소매 자영업 단발 [게임 추정]
  {
    id: 'ext.189', ages: [18, 65], years: [2002, 2002], p: 0.15, once: true, tags: ['ext'], src: ['EXT.H20'],
    when: L => self(L) && ['4','5'].includes(maj(L)),
    text: '경기 있는 날 주문이 몰린다. 재료를 많이 사면 남을 수도 있다.',
    reason: '경기 있는 날 주문이 몰린다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '예약을 먼저 받는다', fx: { stats: { wealth: 1, happiness: 1, leisure: -1 } }, result: '기대보다 확인된 주문에 재고를 맞췄다.' },
        { id: 'b', label: '한정 메뉴를 낸다', fx: { stats: { wealth: 1, leisure: -1, relations: 1 } }, result: '조리 부담과 선택 폭을 함께 줄였다.' },
        { id: 'd', label: '평소 규모를 지킨다', fx: { stats: { health: 1, leisure: 1, wealth: -1 } }, result: '유행 수요보다 일상의 운영을 남겼다.' },
      ],
      default: 'a',
    },
  },
  // KR-190 living / 카드채무 상환 곤란; 해당 지원 절차 확인 필요
  // p 근거: 2003 카드채무 연체 급증해, 부채 보유자 대상 단발 [게임 추정, 연체자 규모 수치는 미검색]
  {
    id: 'ext.190', ages: [20, 65], years: [2003, 2003], p: 0.15, once: true, tags: ['ext'], src: ['EXT.H15'],
    when: L => hasDebt(L),
    text: '카드 빚을 돌려 막기가 어려워졌다. 납부일이 서로 겹친다.',
    reason: '카드 빚을 돌려 막기가 어려워졌다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '채무 내역을 모은다', fx: { stats: { intellect: 1, leisure: -1 }, issues: { living: 2 } }, result: '누구에게 얼마를 갚는지 먼저 정리했다.' },
        { id: 'b', label: '상담 절차를 찾는다', fx: { stats: { wealth: 1, happiness: -1 }, issues: { living: 2 } }, result: '그해 이용 가능한 조정 제도를 확인했다.', do: (L, act) => act.flag('k190b', L.year) },
        { id: 'c', label: '생활비 계정을 나눈다', fx: { stats: { wealth: 1, leisure: -1 }, issues: { living: 1 } }, result: '필수 지출이 상환과 섞이지 않게 했다.' },
      ],
      default: 'a',
    },
  },
  // KR-191 job / 주40시간제 단계 적용 사업장; 규모·연도 확인
  // p 근거: 주40시간제 단계 시행(2004~2011), 규모별 시행 연도는 기억 기반 추정(마지막 단계 2011.7 확인) [게임 추정]
  {
    id: 'ext.191', ages: [18, 65], years: [2004, 2009], p: 0.12, once: true, tags: ['ext'], src: ['EXT.H27'],
    when: L => emp(L) && ((['large','public'].includes(sz(L)) && L.year>=2005) || (sz(L)==='mid' && L.year>=2007) || (sz(L)==='small' && L.year>=2009)),
    text: '토요일 근무가 달라졌다. 휴일과 수당의 계산도 다시 보게 된다.',
    reason: '토요일 근무가 달라졌다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '취업규칙을 확인한다', fx: { stats: { intellect: 1 }, issues: { fairness: 1 } }, result: '달라진 시간과 임금 체계를 대조했다.' },
        { id: 'b', label: '남는 시간을 쉰다', fx: { stats: { health: 2, leisure: 2, wealth: -1 } }, result: '부족했던 수면과 개인 일정을 챙겼다.' },
        { id: 'c', label: '교육에 시간을 쓴다', fx: { stats: { intellect: 2, leisure: -1 }, issues: { tech: 1 } }, result: '쉬는 날 일부를 새로운 배움에 나눴다.' },
      ],
      default: 'a',
    },
  },
  // KR-192 edu / 학부모; 초중고 자녀; 사교육비 부담
  // p 근거: 학부모의 사교육 추가 고민 연 10% [게임 추정]
  {
    id: 'ext.192', ages: [18, 65], years: [2004, 2009], p: 0.1, cooldown: 3, tags: ['ext'], src: ['EXT.H22'],
    when: L => kidsN(L,6,18)>=1,
    text: '친구들이 학원을 하나 더 다닌다고 한다. 아이의 시간은 이미 차 있다.',
    reason: '친구들이 학원을 하나 더 다닌다고 한다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '아이와 필요를 묻는다', fx: { stats: { relations: 1, intellect: 1 }, issues: { edu: 1 } }, result: '남의 일정과 자기 공부를 나누어 보았다.' },
        { id: 'b', label: '한 과목만 조정한다', fx: { stats: { wealth: -2, intellect: 1 }, issues: { edu: 2 } }, result: '지출과 시간을 모두 늘리지 않기로 했다.' },
        { id: 'd', label: '현재 계획을 유지한다', fx: { stats: { wealth: 1, happiness: -1 }, issues: { edu: 2 } }, result: '비교의 압력과 집안 형편을 따로 놓았다.' },
      ],
      default: 'a',
    },
  },
  // KR-193 region / 비수도권; 지역 대학·회사 선택 청년
  // p 근거: 비수도권 청년의 수도권 진출 고민 연 8% [게임 추정]
  {
    id: 'ext.193', ages: [20, 34], years: [2005, 2009], p: 0.08, cooldown: 3, tags: ['ext'], src: ['EXT.H20'],
    when: L => prov(L) && (seeking(L) || student(L)),
    text: '수도권 일자리와 지역의 일자리 조건을 비교한다. 이주비부터 다르다.',
    reason: '수도권 일자리와 지역의 일자리 조건을 비교한다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '이주비를 계산한다', fx: { stats: { intellect: 1 }, issues: { region: 2 } }, result: '임금에서 월세와 교통비를 빼 보았다.' },
        { id: 'b', label: '지역 일을 택한다', fx: { stats: { relations: 1, wealth: -1 }, issues: { region: 2 } }, result: '가까운 관계와 생활비의 이점을 남겼다.' },
        { id: 'c', label: '단기 체류를 알아본다', fx: { stats: { leisure: -1, intellect: 1 }, issues: { region: 1 } }, result: '정착 전 실제 출퇴근과 방값을 살폈다.' },
      ],
      default: 'a',
    },
  },
  // KR-194 care / 장기요양 전 가족 간병; 유급 돌봄비 부담
  // p 근거: 장기요양보험 시행(2008.7, 확인) 이전 가족 간병 부담, 간병 중인 가구 [게임 추정]
  {
    id: 'ext.194', ages: [18, 65], years: [2005, 2007], p: 0.15, cooldown: 3, tags: ['ext'], src: ['EXT.H20'],
    when: L => caring(L),
    text: '부모 곁을 지키려 휴가를 다 썼다. 돌봄은 다음 달에도 필요하다.',
    reason: '부모 곁을 지키려 휴가를 다 썼다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '형제와 시간을 나눈다', when: L => ally(L) && (L.family?.siblings ?? 0) > 0, fx: { stats: { relations: 2, leisure: -1 }, issues: { care: 1 } }, result: '같은 액수 대신 실제 가능한 시간을 조정했다.' },
        { id: 'b', label: '유급 도움을 찾는다', fx: { stats: { wealth: -2, leisure: 1 }, issues: { care: 2 } }, result: '비용과 돌봄의 연속성을 함께 비교했다.' },
        { id: 'c', label: '직장에 조정을 묻는다', fx: { stats: { relations: -1, intellect: 1 }, issues: { care: 1 } }, result: '그해 가능한 휴가·근무 조건을 확인했다.' },
      ],
      default: 'b',
    },
  },
  // KR-195 housing / 대출 주택 구입 검토; 무주택 가구
  // p 근거: 주택 구입 이정표와 중복되어 낮게 5% [게임 추정]
  {
    id: 'ext.195', ages: [28, 50], years: [2006, 2009], p: 0.05, cooldown: 4, tags: ['ext'], src: ['EXT.H20'],
    when: L => !owned(L) && working(L) && !lowW(L),
    text: '집을 사라는 말이 많다. 감당할 금액과 은행이 빌려줄 돈은 다르다.',
    reason: '집을 사라는 말이 많다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '상환액을 계산한다', fx: { stats: { intellect: 1 }, issues: { housing: 2 } }, result: '대출 한도보다 매달 남는 돈을 먼저 셌다.' },
        { id: 'b', label: '구입을 미룬다', fx: { stats: { wealth: 1, leisure: 1 }, issues: { housing: 3 } }, result: '임차 생활을 이어가며 현금을 남겼다.' },
        { id: 'd', label: '계약 전 서류를 본다', fx: { stats: { intellect: 1, happiness: -1 }, issues: { housing: 1 } }, result: '가격 이야기와 권리관계를 따로 확인했다.' },
      ],
      default: 'a',
    },
  },
  // KR-196 job / 수출 제조업; 원료 수입·해외 주문 영향
  // p 근거: 수출 제조직 환율·주문 변동 체감 연 6% [게임 추정]
  {
    id: 'ext.196', ages: [18, 65], years: [2007, 2009], p: 0.06, once: true, tags: ['ext'], src: ['EXT.H15'],
    when: L => emp(L) && ['7','8'].includes(maj(L)),
    text: '해외 주문과 환율이 함께 출렁인다. 현장 근무표도 자주 바뀐다.',
    reason: '해외 주문과 환율이 함께 출렁인다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '가계 비상금을 남긴다', fx: { stats: { wealth: 1, leisure: -1 }, issues: { living: 2 } }, result: '수당 감소에 대비해 고정비를 점검했다.' },
        { id: 'b', label: '직무 교육을 받는다', fx: { stats: { intellect: 2, leisure: -2 }, issues: { job: 1 } }, result: '변동 속에서도 쓸 수 있는 기술을 더했다.' },
        { id: 'c', label: '근무표를 협의한다', fx: { stats: { relations: 1, leisure: 1 }, issues: { job: 2 } }, result: '가족 일정과 가능한 작업 시간을 알렸다.' },
      ],
      default: 'a',
    },
  },
  // KR-197 job / 금융위기 영향; 신규 구직 청년
  // p 근거: 2008 금융위기 직후 구직자 단발 [게임 추정]
  {
    id: 'ext.197', ages: [19, 45], years: [2008, 2009], p: 0.15, cooldown: 2, tags: ['ext'], src: ['EXT.H15'],
    when: L => seeking(L),
    text: '채용 일정이 미뤄졌다. 기다리는 동안 월세는 계속 나간다.',
    reason: '채용 일정이 미뤄졌다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '지원 업종을 넓힌다', fx: { stats: { intellect: 1, leisure: -1 }, issues: { job: 2 } }, result: '희망 직무와 실제 조건을 다시 비교했다.' },
        { id: 'b', label: '단기 일을 병행한다', fx: { stats: { wealth: 1, leisure: -2 }, issues: { job: 2 } }, result: '준비 시간 일부를 생활비로 바꿨다.' },
        { id: 'd', label: '공공 구직 지원을 찾는다', fx: { stats: { intellect: 1, relations: 1 }, issues: { job: 1 } }, result: '그해 가능한 대상과 교육 경로를 물었다.', do: (L, act) => act.flag('k197d', L.year) },
      ],
      default: 'a',
    },
  },
  // KR-198 care / 7월 이후; 요양 필요 고령자; 장기요양 신청 가능
  // p 근거: 2008.7 노인장기요양보험 시행, 요양 필요 고령자 [검색 확인]
  {
    id: 'ext.198', ages: [65, 90], years: [2008, 2009], p: 0.15, once: true, tags: ['ext'], src: ['EXT.H30'],
    when: L => (L.health?.conditions ?? []).some(c => c?.active) || !!L.health?.disability,
    text: '장기요양보험이 시작됐다. 도움은 신청과 판정 절차를 거쳐야 한다.',
    reason: '장기요양보험이 시작됐다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '인정 신청을 알아본다', fx: { stats: { intellect: 1 }, issues: { care: 2 } }, result: '대상 여부와 준비 자료를 확인했다.', do: (L, act) => act.flag('k198a', L.year) },
        { id: 'b', label: '재가 서비스를 묻는다', fx: { stats: { health: 1 }, issues: { care: 1 } }, result: '집에서 받을 도움의 범위를 알아보았다.', do: (L, act) => act.flag('k198b', L.year) },
        { id: 'c', label: '시설을 비교한다', fx: { stats: { relations: -1, leisure: 1 }, issues: { care: 2 } }, result: '비용과 거리·당사자의 뜻을 함께 살폈다.' },
      ],
      default: 'a',
    },
  },
  // KR-199 job / 음식점 자영업; 소비 위축; 임대료 고정
  // p 근거: 금융위기 소비 위축기 음식점·소매 자영업 연 12% [게임 추정]
  {
    id: 'ext.199', ages: [18, 65], years: [2008, 2009], p: 0.12, cooldown: 2, tags: ['ext'], src: ['EXT.H15'],
    when: L => self(L) && ['4','5'].includes(maj(L)),
    text: '손님은 줄었지만 임대료와 인건비는 정해진 날에 나간다.',
    reason: '손님은 줄었지만 임대료와 인건비는 정해진 날에 나간다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '메뉴 수를 줄인다', fx: { stats: { wealth: 1, leisure: 1 } }, result: '재료 손실과 선택 폭을 함께 낮췄다.' },
        { id: 'b', label: '임대 조건을 상의한다', fx: { stats: { wealth: 1, relations: -1 }, issues: { job: 1 } }, result: '고정비 조정 가능성을 먼저 물었다.' },
        { id: 'c', label: '영업일을 바꾼다', fx: { stats: { health: 1, wealth: -1, leisure: 1 } }, result: '손님이 있는 시간에 노동을 모았다.' },
      ],
      default: 'b',
    },
  },
  // KR-200 medical / 신종플루 유행 영향; 영유아·고령 가족 동거
  // p 근거: 2009 신종플루 유행해, 영유아·고령 가족 가구 단발 [게임 추정]
  {
    id: 'ext.200', ages: [18, 65], years: [2009, 2009], p: 0.15, once: true, tags: ['ext'], src: ['EXT.H31'],
    when: L => kidsN(L,0,6)>=1 || L.age>=65 || parentsAlive(L).length>0,
    text: '감염병 소식이 이어진다. 일과 돌봄의 결석 계획이 필요하다.',
    reason: '감염병 소식이 이어진다.',
    sensitive: 'illness',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '공식 안내를 확인한다', fx: { stats: { intellect: 1, health: 1 }, issues: { medical: 1 } }, result: '소문보다 보건 안내와 진료 경로를 살폈다.' },
        { id: 'c', label: '직장에 절차를 묻는다', when: L => working(L), fx: { stats: { intellect: 1, wealth: -1 }, issues: { job: 1 } }, result: '아플 때의 연락과 휴가 조건을 확인했다.' },
        { id: 'd', label: '방문 일정을 줄인다', fx: { stats: { relations: -1, health: 1, leisure: 1 } }, result: '가족 관계를 유지하며 접촉을 조정했다.' },
      ],
      default: 'a',
    },
  },
  // KR-201 housing / 수도권 임차 가구; 보증금 인상 요구
  // p 근거: 전세 2년 갱신 주기 중 인상 요구 임차 가구 연 12% [게임 추정]
  {
    id: 'ext.201', ages: [18, 65], years: [2010, 2019], p: 0.12, cooldown: 2, tags: ['ext'], src: ['EXT.H20'],
    when: L => (L.home?.regionGroup==='seoul'||L.home?.regionGroup==='capital') && tenant(L),
    text: '보증금 인상 요구가 왔다. 같은 동네를 지키려면 저축을 더 꺼내야 한다.',
    reason: '보증금 인상 요구가 왔다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '계약 조건을 협의한다', fx: { stats: { intellect: 1, leisure: -1 }, issues: { housing: 2 } }, result: '집주인과 금액·기간을 다시 맞췄다.' },
        { id: 'b', label: '작은 집으로 옮긴다', when: L => canMove(L), fx: { stats: { wealth: 1, leisure: -2 }, issues: { housing: 3 } }, result: '생활권을 지키고 공간을 줄였다.' },
        { id: 'c', label: '대출 비용을 비교한다', fx: { stats: { wealth: 1 }, issues: { housing: 3 } }, result: '빌릴 수 있는 돈과 갚을 돈을 따로 셌다.' },
      ],
      default: 'a',
    },
  },
  // KR-202 housing / 월세 거주; 첫 독립; 초임 근로자
  // p 근거: 초임 월세 거주자의 고정비 체감 연 10% [게임 추정]
  {
    id: 'ext.202', ages: [20, 32], years: [2010, 2019], p: 0.1, once: true, tags: ['ext'], src: ['EXT.H20'],
    when: L => L.home?.tenure==='monthly' && emp(L),
    text: '처음 받은 월급에서 월세와 관리비를 빼니 생각보다 적게 남는다.',
    reason: '처음 받은 월급에서 월세와 관리비를 빼니 생각보다 적게 남는다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '고정비를 정리한다', fx: { stats: { intellect: 1 }, issues: { housing: 1 } }, result: '계약 때 보지 못한 비용까지 장부에 넣었다.' },
        { id: 'b', label: '통근 거리를 늘린다', fx: { stats: { wealth: 1, leisure: -2 }, issues: { housing: 2 } }, result: '싼 집을 찾으며 이동 시간을 다시 셌다.' },
        { id: 'c', label: '공공임대를 알아본다', fx: { stats: { intellect: 1 }, issues: { housing: 1 } }, result: '해당 연도 모집과 자격을 확인했다.', do: (L, act) => act.flag('k202c', L.year) },
      ],
      default: 'a',
    },
  },
  // KR-203 job / 간호사; 교대근무; 피로 누적
  // p 근거: 교대근무 간호 인력의 피로 누적 연 10% [게임 추정]
  {
    id: 'ext.203', ages: [18, 65], years: [2010, 2019], p: 0.1, cooldown: 3, tags: ['ext'], src: ['EXT.H21'],
    when: L => emp(L) && /간호/.test(L.job?.title ?? ''),
    text: '다음 달 야간근무가 늘었다. 쉬는 날에도 잠을 맞추기 어렵다.',
    reason: '다음 달 야간근무가 늘었다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '근무표 조정을 청한다', fx: { stats: { health: 1, relations: -1 }, issues: { job: 1 } }, result: '배치와 회복 시간을 함께 이야기했다.' },
        { id: 'b', label: '업무 이동을 살핀다', fx: { stats: { wealth: -1, leisure: 1 }, issues: { job: 2 } }, result: '임금과 근무 형태를 같이 비교했다.' },
        { id: 'c', label: '휴식 일정을 지킨다', fx: { stats: { health: 2, relations: -1, leisure: 1 } }, result: '개인 약속을 줄여 회복 시간을 남겼다.' },
      ],
      default: 'a',
    },
  },
  // KR-204 job / 요양보호사; 방문 업무; 이동시간 비용 부담
  // p 근거: 방문요양 종사자의 이동시간 노동 연 10% [게임 추정]
  {
    id: 'ext.204', ages: [18, 65], years: [2010, 2019], p: 0.1, cooldown: 3, tags: ['ext'], src: ['EXT.H30'],
    when: L => working(L) && (code(L)==='42210' || /요양보호/.test(L.job?.title ?? '')),
    text: '돌봄 시간 사이에 긴 이동이 끼어 있다. 근무표만으로는 하루가 보이지 않는다.',
    reason: '돌봄 시간 사이에 긴 이동이 끼어 있다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '동선을 조정한다', fx: { stats: { health: 1, leisure: 1, wealth: -1 } }, result: '서비스 약속과 이동 시간을 함께 맞췄다.' },
        { id: 'b', label: '기관에 일정을 묻는다', fx: { stats: { intellect: 1 }, issues: { fairness: 2 } }, result: '기록된 노동과 실제 시간을 대조했다.', do: (L, act) => act.flag('k204b', L.year) },
        { id: 'd', label: '이동 기록을 남긴다', fx: { stats: { intellect: 1, relations: 1 }, issues: { fairness: 1 } }, result: '빈 시간처럼 보였던 노동을 적었다.' },
      ],
      default: 'a',
    },
  },
  // KR-205 job / 학원강사; 수강생 감소; 계약 갱신 시점
  // p 근거: 학원 강사의 수강생 감소·계약 갱신 연 8% [게임 추정]
  {
    id: 'ext.205', ages: [18, 65], years: [2010, 2019], p: 0.08, cooldown: 3, tags: ['ext'], src: ['EXT.H21'],
    when: L => working(L) && /학원|강사/.test(L.job?.title ?? ''),
    text: '수강생이 줄었다. 다음 계약의 보장 시간도 줄 수 있다고 한다.',
    reason: '수강생이 줄었다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '계약 조건을 확인한다', fx: { stats: { intellect: 1 }, issues: { job: 2 } }, result: '수업 수와 실제 지급액을 따로 보았다.' },
        { id: 'b', label: '수업 대상을 바꾼다', fx: { stats: { intellect: 1, leisure: -2 }, issues: { job: 1 } }, result: '새 준비 시간을 들여 경로를 넓혔다.' },
        { id: 'd', label: '개인 지출을 낮춘다', fx: { stats: { wealth: 1, happiness: -1 }, issues: { living: 1 } }, result: '수입 변동에 대비해 고정비를 점검했다.' },
      ],
      default: 'a',
    },
  },
  // KR-206 job / 자동차 부품 협력사; 주문·납기 변동
  // p 근거: 제조 협력사 주문 변동 연 6% [게임 추정]
  {
    id: 'ext.206', ages: [18, 65], years: [2010, 2019], p: 0.06, cooldown: 3, tags: ['ext'], src: ['EXT.H21'],
    when: L => emp(L) && ['7','8'].includes(maj(L)),
    text: '거래처 주문이 줄었다. 회사는 근무시간부터 조정하려 한다.',
    reason: '거래처 주문이 줄었다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '고용 유지안을 묻는다', fx: { stats: { intellect: 1 }, issues: { job: 2 } }, result: '휴업과 임금·근무 조건을 확인했다.' },
        { id: 'b', label: '다른 기술을 배운다', fx: { stats: { intellect: 2, leisure: -2 }, issues: { tech: 1 } }, result: '익숙한 공정 밖의 역할을 준비했다.' },
        { id: 'c', label: '가계 예산을 줄인다', fx: { stats: { wealth: 1, happiness: -1 }, issues: { living: 2 } }, result: '수당 감소를 필수 소비와 나누어 계산했다.' },
      ],
      default: 'a',
    },
  },
  // KR-207 job / 영세 자영업; 배달 플랫폼 이용 제안
  // p 근거: 배달 플랫폼 확산기(2010년대) 자영업 연 8% [게임 추정]
  {
    id: 'ext.207', ages: [18, 65], years: [2010, 2019], p: 0.08, once: true, tags: ['ext'], src: ['EXT.H21'],
    when: L => self(L) && ['4','5'].includes(maj(L)),
    text: '배달 주문을 받으면 손님은 늘 수 있다. 수수료와 포장비도 붙는다.',
    reason: '배달 주문을 받으면 손님은 늘 수 있다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '일부 메뉴만 올린다', fx: { stats: { wealth: 1, leisure: -1 }, issues: { tech: 2 } }, result: '새 매출과 추가 비용을 작게 시험했다.' },
        { id: 'b', label: '건당 순익을 계산한다', fx: { stats: { intellect: 1, wealth: 1 }, issues: { tech: 1 } }, result: '주문 금액에서 실제 남는 돈을 보았다.' },
        { id: 'd', label: '매장 운영을 지킨다', fx: { stats: { relations: 1, leisure: 1, wealth: -1 } }, result: '온라인 확장 대신 기존 손님에 집중했다.' },
      ],
      default: 'b',
    },
  },
  // KR-208 job / 택배·배달 종사; 플랫폼·물량 연동 수입
  // p 근거: 배달·택배 종사자의 물량 압박 연 12% [게임 추정]
  {
    id: 'ext.208', ages: [18, 65], years: [2010, 2019], p: 0.12, cooldown: 2, tags: ['ext'], src: ['EXT.H21'],
    when: L => working(L) && (!!L.job?.platform || /택배|배달|배송/.test(L.job?.title ?? '')),
    text: '오늘 더 뛰면 수입은 늘지만 내일 회복 시간은 줄어든다.',
    reason: '오늘 더 뛰면 수입은 늘지만 내일 회복 시간은 줄어든다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '작업량 상한을 정한다', fx: { stats: { health: 1, leisure: 1, wealth: -2 } }, result: '기대 수입을 낮추고 쉬는 시간을 남겼다.' },
        { id: 'b', label: '동선을 바꿔 본다', fx: { stats: { wealth: 1, leisure: -1 }, issues: { tech: 1 } }, result: '추가 노동보다 이동 손실을 줄이려 했다.' },
        { id: 'c', label: '실비를 기록한다', fx: { stats: { intellect: 1 }, issues: { job: 1 } }, result: '매출과 몸·차량에 드는 비용을 나누었다.' },
      ],
      default: 'a',
    },
  },
  // KR-209 edu / 특수교육 지원 필요한 학생의 보호자
  // p 근거: 자녀의 특수교육 필요 가구 단일 조건이 드물어 높게 설정 [게임 추정, 자녀 장애 필드 확인 필요]
  {
    id: 'ext.209', ages: [18, 65], years: [2010, 2019], p: 0.15, cooldown: 3, tags: ['ext'], src: ['EXT.H22'],
    when: L => (L.family?.children ?? []).some(c => c && c.disability),
    text: '학교 지원과 치료 일정이 겹쳤다. 아이의 배움은 이동에도 묶여 있다.',
    reason: '학교 지원과 치료 일정이 겹쳤다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '학교 지원을 상의한다', fx: { stats: { intellect: 1, relations: 1 }, issues: { edu: 2 } }, result: '아이에게 필요한 조정을 구체적으로 전달했다.', do: (L, act) => act.flag('k209a', L.year) },
        { id: 'b', label: '일정을 나누어 잡는다', fx: { stats: { leisure: -1, relations: 1 }, issues: { care: 2 } }, result: '수업과 진료·치료를 덜 겹치게 맞췄다.' },
        { id: 'd', label: '당사자 의견을 듣는다', fx: { stats: { relations: 2, happiness: 1 } }, result: '편한 방식과 힘든 시간을 아이와 함께 살폈다.' },
      ],
      default: 'd',
    },
  },
  // KR-210 fairness / 장애 당사자; 구직 중; 근무환경 조정 필요
  // p 근거: 장애 당사자 구직자 조건 [게임 추정]
  {
    id: 'ext.210', ages: [18, 65], years: [2010, 2019], p: 0.15, cooldown: 2, tags: ['ext'], src: ['EXT.H21'],
    when: L => dis(L) && seeking(L),
    text: '직무는 할 수 있지만 출입과 작업 도구가 맞지 않는다.',
    reason: '직무는 할 수 있지만 출입과 작업 도구가 맞지 않는다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '환경 조정을 요청한다', fx: { stats: { intellect: 1, relations: -1 }, issues: { fairness: 2 } }, result: '필요한 변화와 수행 가능한 일을 나누어 설명했다.' },
        { id: 'b', label: '지원 기관을 찾는다', fx: { stats: { intellect: 1 }, issues: { job: 1 } }, result: '취업·보조공학 지원의 대상 여부를 물었다.', do: (L, act) => act.flag('k210b', L.year) },
        { id: 'c', label: '현장을 먼저 방문한다', fx: { stats: { intellect: 1, leisure: -1 }, issues: { fairness: 1 } }, result: '채용 문구와 실제 접근성을 비교했다.' },
      ],
      default: 'c',
    },
  },
  // KR-211 region / 지역 중소도시; 학교 통폐합 영향 학부모
  // p 근거: 비도시권 학부모의 학교 통폐합 소식 연 8% [게임 추정]
  {
    id: 'ext.211', ages: [18, 65], years: [2010, 2019], p: 0.08, cooldown: 4, tags: ['ext'], src: ['EXT.H20'],
    when: L => prov(L) && kidsN(L,6,17)>=1,
    text: '가까운 학교의 통폐합 이야기가 나왔다. 통학과 돌봄이 함께 달라진다.',
    reason: '가까운 학교의 통폐합 이야기가 나왔다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '통학 지원을 묻는다', fx: { stats: { intellect: 1 }, issues: { region: 2 } }, result: '이동 수단과 실제 시간을 확인했다.', do: (L, act) => act.flag('k211a', L.year) },
        { id: 'b', label: '학부모 의견을 모은다', when: L => ally(L), fx: { stats: { relations: 2, leisure: -1 }, issues: { region: 2 } }, result: '가구마다 다른 사정을 논의에 올렸다.' },
        { id: 'd', label: '현재 거주를 유지한다', fx: { stats: { relations: 1, happiness: 1 }, issues: { region: 3 } }, result: '지역의 관계를 지키며 대안을 찾았다.' },
      ],
      default: 'a',
    },
  },
  // KR-212 fairness / SNS 이용자; 또래의 소득·소비 게시물 노출
  // p 근거: SNS 비교 체감 연 8% [게임 추정]
  {
    id: 'ext.212', ages: [18, 65], years: [2010, 2019], p: 0.08, cooldown: 3, tags: ['ext'], src: ['EXT.H20'],
    when: L => true,
    text: '친구의 집과 여행 사진이 이어진다. 내 생활비 장부는 그대로다.',
    reason: '친구의 집과 여행 사진이 이어진다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '노출 시간을 줄인다', fx: { stats: { happiness: 1, leisure: 1, relations: -1 } }, result: '비교하는 시간을 다른 일에 남겼다.' },
        { id: 'c', label: '내 예산을 다시 본다', fx: { stats: { intellect: 1, wealth: 1 }, issues: { fairness: 1 } }, result: '남의 소비 대신 내 우선순위를 적었다.' },
        { id: 'd', label: '친구에게 안부를 묻는다', fx: { stats: { relations: 2, happiness: 1, leisure: -1 } }, result: '사진 뒤의 사람과 직접 이야기를 나눴다.' },
      ],
      default: 'c',
    },
  },
  // KR-213 job / 주40시간제 적용 5~19인 사업장; 적용 여부 확인
  // p 근거: 2011.7 주40시간제 5~19인 확대(검색 확인), 소규모 재직자 [게임 추정]
  {
    id: 'ext.213', ages: [18, 65], years: [2011, 2019], p: 0.1, once: true, tags: ['ext'], src: ['EXT.H27'],
    when: L => emp(L) && ['micro','small'].includes(sz(L)),
    text: '작은 직장에도 노동시간 기준이 달라졌다. 실제 퇴근 시간은 아직 비슷하다.',
    reason: '작은 직장에도 노동시간 기준이 달라졌다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '근무 기록을 남긴다', fx: { stats: { intellect: 1 }, issues: { fairness: 1 } }, result: '규정과 실제 시간을 나누어 적었다.' },
        { id: 'b', label: '회사에 운영을 묻는다', fx: { stats: { leisure: 1, relations: -1 }, issues: { job: 1 } }, result: '휴일과 수당이 어떻게 바뀌는지 확인했다.' },
        { id: 'c', label: '동료와 일정을 맞춘다', when: L => ally(L), fx: { stats: { relations: 2, leisure: 1 } }, result: '업무량과 휴식의 조정안을 모았다.' },
      ],
      default: 'a',
    },
  },
  // KR-214 edu / 대학생; 국가장학금 신청 가능성; 자격 별도 확인
  // p 근거: 2012 국가장학금 시행 이후 대학생 학기마다 신청 안내 연 12% [검색 확인]
  {
    id: 'ext.214', ages: [19, 30], years: [2012, 2019], p: 0.12, cooldown: 3, tags: ['ext'], src: ['EXT.H22'],
    when: L => student(L),
    text: '장학금 안내가 왔다. 소득 관련 서류와 신청 기한을 챙겨야 한다.',
    reason: '장학금 안내가 왔다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '자격을 확인한다', fx: { stats: { intellect: 1 }, issues: { edu: 1 } }, result: '지원받을 수 있는 항목을 먼저 살폈다.', do: (L, act) => act.flag('k214a', L.year) },
        { id: 'b', label: '서류를 준비한다', fx: { stats: { intellect: 1, leisure: -1, wealth: 1 }, issues: { edu: 1 } }, result: '가구 정보와 증빙을 모으는 시간이 들었다.' },
        { id: 'c', label: '다른 장학금도 찾는다', fx: { stats: { wealth: 1, leisure: -2 }, issues: { edu: 2 } }, result: '한 제도에만 기대지 않고 경로를 넓혔다.' },
      ],
      default: 'a',
    },
  },
  // KR-215 fairness / 신혼·동거 의논; 부모 자금 지원 제안
  // p 근거: 부모 자금 지원 제안 연 6% [게임 추정]
  {
    id: 'ext.215', ages: [26, 40], years: [2013, 2019], p: 0.06, once: true, tags: ['ext'], src: ['EXT.H20'],
    when: L => (partner(L) || !!L.family?.dating) && parentsAlive(L).length>0 && !owned(L),
    text: '부모가 보증금을 돕겠다고 한다. 고마움과 함께 의견도 많아졌다.',
    reason: '부모가 보증금을 돕겠다고 한다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '지원 범위를 적는다', when: L => kin(L), fx: { stats: { intellect: 1, relations: 1 }, issues: { fairness: 2 } }, result: '돈의 성격과 가족 간 기대를 먼저 정리했다.' },
        { id: 'c', label: '지원 없이 계획한다', fx: { stats: { wealth: -1, happiness: 1 }, issues: { housing: 3 } }, result: '주거 조건을 낮추어 독립된 예산을 세웠다.' },
        { id: 'd', label: '파트너와 먼저 상의한다', fx: { stats: { relations: 2, leisure: -1 } }, result: '양가의 기대 전에 둘의 기준을 맞췄다.' },
      ],
      default: 'c',
    },
  },
  // KR-216 conflict / 세월호 참사 관련 소식 접한 주민
  // p 근거: 2014 참사 소식은 전 국민이 접한 단발 사건 → 상한 [게임 추정]
  {
    id: 'ext.216', ages: [18, 70], years: [2014, 2014], p: 0.15, once: true, tags: ['ext'], src: ['EXT.H32'],
    when: L => true,
    text: '참사 소식이 이어진다. 확인되지 않은 말도 같은 화면에 섞여 있다.',
    reason: '참사 소식이 이어진다.',
    sensitive: 'disaster',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '확인된 소식만 본다', fx: { stats: { intellect: 1, happiness: -1 }, issues: { conflict: 2 } }, result: '공식 확인과 전언을 나누어 읽었다.' },
        { id: 'b', label: '가까운 이의 안부를 묻는다', fx: { stats: { relations: 2, happiness: -1 } }, result: '불안한 사람과 일상의 연락을 나눴다.' },
        { id: 'd', label: '화면에서 잠시 쉰다', fx: { stats: { happiness: 1, leisure: 1 } }, result: '소식을 잊지 않으며 일상의 회복 시간을 남겼다.' },
      ],
      default: 'a',
    },
  },
  // KR-217 medical / 메르스 영향 병원 방문 예정 가구
  // p 근거: 2015 감염병 유행 해 진료 예정 가구 단발 [게임 추정]
  {
    id: 'ext.217', ages: [18, 65], years: [2015, 2015], p: 0.15, once: true, tags: ['ext'], src: ['EXT.H31'],
    when: L => chronic(L) || L.age>=65 || kidsN(L,0,6)>=1,
    text: '감염병 소식 때문에 예정된 병원 방문이 걱정된다.',
    reason: '감염병 소식 때문에 예정된 병원 방문이 걱정된다.',
    sensitive: 'illness',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '의료기관에 문의한다', fx: { stats: { intellect: 1, health: 1 }, issues: { medical: 1 } }, result: '필요한 진료와 방문 절차를 확인했다.', do: (L, act) => act.flag('k217a', L.year) },
        { id: 'b', label: '공식 안내를 읽는다', fx: { stats: { intellect: 1, leisure: -1 }, issues: { medical: 1 } }, result: '소문과 보건 안내를 나누어 살폈다.' },
        { id: 'd', label: '진료 일정을 상의한다', fx: { stats: { health: 1, relations: 1 }, issues: { medical: 2 } }, result: '임의로 끊지 않고 의료진과 계획을 맞췄다.' },
      ],
      default: 'd',
    },
  },
  // KR-218 care / 중년; 자녀 양육과 부모 간병 동시 발생
  // p 근거: 양육·간병 동시 부담 가구 연 10% [게임 추정]
  {
    id: 'ext.218', ages: [35, 60], years: [2015, 2019], p: 0.1, cooldown: 3, tags: ['ext'], src: ['EXT.H20'],
    when: L => kidsN(L,6,15)>=1 && caring(L),
    text: '자녀의 하교와 부모의 통원 시간이 겹쳤다. 내 일정은 맨 나중이다.',
    reason: '자녀의 하교와 부모의 통원 시간이 겹쳤다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '돌봄표를 함께 짠다', when: L => ally(L), fx: { stats: { relations: 2, leisure: -1 }, issues: { care: 1 } }, result: '누군가의 당연한 몫이던 시간을 나누었다.' },
        { id: 'b', label: '서비스를 알아본다', fx: { stats: { intellect: 1, leisure: -1 }, issues: { care: 1 } }, result: '대상과 비용·대기 여부를 확인했다.', do: (L, act) => act.flag('k218b', L.year) },
        { id: 'c', label: '근무 조정을 요청한다', fx: { stats: { wealth: -1, leisure: 1 }, issues: { care: 2 } }, result: '돌봄 상황을 일터에도 설명했다.' },
      ],
      default: 'b',
    },
  },
  // KR-219 conflict / 촛불집회 소식 노출; 시민 참여 가능
  // p 근거: 2016~2017 집회 소식 전 국민 노출 단발 → 상한 [게임 추정]
  {
    id: 'ext.219', ages: [18, 70], years: [2016, 2017], p: 0.15, once: true, tags: ['ext'], src: ['EXT.H26'],
    when: L => true,
    text: '광장에 사람들이 모인다. 가족과 동료의 생각이 꼭 같지는 않다.',
    reason: '광장에 사람들이 모인다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '집회에 참여한다', fx: { stats: { happiness: 1, leisure: -2 }, issues: { conflict: 3 } }, result: '시간을 내어 자기 뜻을 표현했다.' },
        { id: 'b', label: '절차와 사실을 읽는다', fx: { stats: { intellect: 1, happiness: -1 }, issues: { conflict: 1 } }, result: '주장과 확인된 내용을 나누어 살폈다.' },
        { id: 'd', label: '대화의 선을 정한다', fx: { stats: { relations: 1, leisure: 1 }, issues: { conflict: 2 } }, result: '관계를 지키며 시사 대화의 시간을 조정했다.' },
      ],
      default: 'b',
    },
  },
  // KR-220 job / 웹툰 보조작가; 외주 계약; 장시간 작업
  // p 근거: 해당 직종 한정 조건이 드물어 높게 설정 [게임 추정]
  {
    id: 'ext.220', ages: [18, 65], years: [2016, 2019], p: 0.15, cooldown: 2, tags: ['ext'], src: ['EXT.H21'],
    when: L => working(L) && /웹툰|만화|일러스트|애니/.test(L.job?.title ?? ''),
    text: '연재 일정이 당겨졌다. 작업 분량과 단가는 그대로다.',
    reason: '연재 일정이 당겨졌다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '범위를 다시 협의한다', fx: { stats: { intellect: 1, wealth: 1 }, issues: { fairness: 2 } }, result: '추가 작업과 납기를 구체적으로 나누었다.' },
        { id: 'b', label: '작업 기록을 남긴다', fx: { stats: { intellect: 1, leisure: -1 }, issues: { fairness: 1 } }, result: '시간과 수정 요청의 양을 적었다.' },
        { id: 'c', label: '일감을 줄여 받는다', fx: { stats: { health: 1, wealth: -2, leisure: 1 } }, result: '수입의 일부 대신 회복 시간을 남겼다.' },
      ],
      default: 'a',
    },
  },
  // KR-221 job / 경비원; 공동주택; 휴게 공간·시간 제약
  // p 근거: 해당 직종 한정 조건이 드물어 높게 설정 [게임 추정]
  {
    id: 'ext.221', ages: [18, 65], years: [2016, 2019], p: 0.15, cooldown: 2, tags: ['ext'], src: ['EXT.H21'],
    when: L => working(L) && /경비|보안|수위/.test(L.job?.title ?? ''),
    text: '휴게시간으로 적힌 시간에도 호출이 온다. 쉬는 곳은 일터와 붙어 있다.',
    reason: '휴게시간으로 적힌 시간에도 호출이 온다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '호출 시간을 기록한다', fx: { stats: { intellect: 1 }, issues: { fairness: 2 } }, result: '명목의 휴식과 실제 업무를 나누었다.' },
        { id: 'b', label: '관리 주체와 상의한다', fx: { stats: { intellect: 1, relations: -1 }, issues: { job: 1 } }, result: '휴게 방식과 업무 범위를 확인했다.' },
        { id: 'c', label: '동료와 교대를 맞춘다', when: L => ally(L), fx: { stats: { relations: 2, health: 1 } }, result: '호출과 쉬는 시간을 나눌 방법을 찾았다.' },
      ],
      default: 'a',
    },
  },
  // KR-222 edu / 학교폭력 경험 학생의 보호자; 학교 절차 적용
  // p 근거: 학교폭력 피해 응답률 초 5.7%·중 2.3%·고 0.8%(R03 §8.1, school.js 주석) × 자녀 있는 가구 → 연 3% [R03 기반]
  {
    id: 'ext.222', ages: [18, 65], years: [2017, 2019], p: 0.03, cooldown: 5, tags: ['ext'], src: ['EXT.H22'],
    when: L => kidsN(L,7,18)>=1,
    text: '아이가 학교 가기를 힘들어한다. 먼저 안전과 사실 확인이 필요하다.',
    reason: '아이가 학교 가기를 힘들어한다.',
    sensitive: 'violence',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '아이의 말을 듣는다', fx: { stats: { relations: 2, happiness: 1, leisure: -1 } }, result: '잘못을 묻기 전에 겪은 일을 확인했다.' },
        { id: 'b', label: '학교에 보호를 요청한다', fx: { stats: { relations: 1, intellect: 1 }, issues: { conflict: 2 } }, result: '당장의 접촉과 등교 부담을 줄일 방안을 물었다.', do: (L, act) => act.flag('k222b', L.year) },
        { id: 'c', label: '상담·지원과 연결한다', fx: { stats: { health: 1, happiness: 1 } }, result: '아이가 원하는 방식의 도움을 찾아보았다.', do: (L, act) => act.flag('k222c', L.year) },
      ],
      default: 'a',
    },
  },
  // KR-223 job / 주52시간제 적용 사업장; 시행 규모·시기 확인
  // p 근거: 2018.7.1 주52시간제 300인 이상·공공 시행(검색 확인), 해당 재직자 [검색 확인]
  {
    id: 'ext.223', ages: [18, 65], years: [2018, 2019], p: 0.15, once: true, tags: ['ext'], src: ['EXT.H17'],
    when: L => emp(L) && ['large','public'].includes(sz(L)),
    text: '노동시간 기준이 바뀌었다. 업무량과 수당은 어떻게 될지 아직 모른다.',
    reason: '노동시간 기준이 바뀌었다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '회사 운영안을 묻는다', fx: { stats: { intellect: 1 }, issues: { fairness: 1 } }, result: '규정과 실제 업무 배치를 함께 확인했다.' },
        { id: 'b', label: '실제 근무를 기록한다', fx: { stats: { intellect: 1, leisure: -1 }, issues: { fairness: 2 } }, result: '퇴근 뒤 업무까지 포함해 시간을 적었다.' },
        { id: 'c', label: '남는 시간을 쉰다', fx: { stats: { health: 2, leisure: 2, wealth: -1 } }, result: '줄어든 노동을 회복에 먼저 썼다.' },
      ],
      default: 'a',
    },
  },
  // KR-224 living / 폭염 기간; 건설·농업 등 야외 노동
  // p 근거: 2018 폭염, 야외 노동 직종(농림·기능·단순노무) 단발 [게임 추정]
  {
    id: 'ext.224', ages: [18, 65], years: [2018, 2019], p: 0.15, cooldown: 3, tags: ['ext'], src: ['EXT.H29'],
    when: L => working(L) && ['6','7','9'].includes(maj(L)),
    text: '더운 시간이 길어진다. 일을 멈추는 시간도 생계와 연결된다.',
    reason: '더운 시간이 길어진다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '작업 시간을 조정한다', fx: { stats: { health: 2, wealth: -1, leisure: 1 }, issues: { living: 2 } }, result: '가능한 범위에서 더위를 피할 시간표를 찾았다.' },
        { id: 'b', label: '휴식·물을 요청한다', fx: { stats: { health: 1, relations: -1 }, issues: { fairness: 2 } }, result: '개인의 인내 대신 작업 조건을 이야기했다.' },
        { id: 'c', label: '몸 상태를 알린다', fx: { stats: { health: 1, happiness: -1, relations: 1 } }, result: '증상을 감추지 않고 현장과 공유했다.' },
      ],
      default: 'a',
    },
  },
  // KR-225 fairness / 자영업자; 단체대화방 불확실한 투자·매출 정보 노출
  // p 근거: 단체 대화방 정보 노출 자영업 단발 [게임 추정]
  {
    id: 'ext.225', ages: [18, 65], years: [2019, 2019], p: 0.12, once: true, tags: ['ext'], src: ['EXT.H20'],
    when: L => self(L),
    text: '단체방에 대박 이야기가 돈다. 손실과 실제 비용을 말하는 사람은 적다.',
    reason: '단체방에 대박 이야기가 돈다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '근거를 직접 확인한다', fx: { stats: { intellect: 1, leisure: -1 }, issues: { fairness: 1 } }, result: '사례와 전체 통계를 나누어 살폈다.' },
        { id: 'b', label: '참여 금액을 정하지 않는다', fx: { stats: { wealth: 1, happiness: 1 } }, result: '정보가 부족한 동안 돈을 움직이지 않았다.' },
        { id: 'c', label: '가계 기준을 적는다', fx: { stats: { intellect: 1 }, issues: { living: 1 } }, result: '유행보다 감당 가능한 손실을 먼저 셌다.' },
      ],
      default: 'a',
    },
  },
  // KR-226 edu / 초중고 보호자; 원격수업; 기기 부족 가구
  // p 근거: 2020 원격수업 전환, 기기 여력 낮은 학부모 [게임 추정]
  {
    id: 'ext.226', ages: [18, 65], years: [2020, 2021], p: 0.15, cooldown: 2, tags: ['ext'], src: ['EXT.H16'],
    when: L => kidsN(L,6,18)>=1 && (L.stats?.wealth ?? 50) < 55,
    text: '두 아이의 수업이 같은 시간에 열린다. 쓸 수 있는 기기는 하나다.',
    reason: '두 아이의 수업이 같은 시간에 열린다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '학교에 대여를 묻는다', fx: { stats: { intellect: 1, relations: 1 }, issues: { edu: 1 } }, result: '기기와 통신 지원 대상 여부를 확인했다.', do: (L, act) => act.flag('k226a', L.year) },
        { id: 'b', label: '기기 시간을 나눈다', fx: { stats: { leisure: -1, intellect: 1 }, issues: { edu: 1 } }, result: '수업 방식에 맞춰 가족의 이용 순서를 조정했다.' },
        { id: 'c', label: '저렴한 기기를 찾는다', fx: { stats: { wealth: -1, intellect: 1 }, issues: { edu: 1 }, money: { assets: -30 } }, result: '생활비 일부를 교육 환경에 썼다.' },
      ],
      default: 'a',
    },
  },
  // KR-227 housing / 재택근무 가능 직무; 좁은 주거; 동거인 있음
  // p 근거: 2020 재택근무 확산, 동거인 있는 임차 재직자 [게임 추정]
  {
    id: 'ext.227', ages: [18, 65], years: [2020, 2021], p: 0.1, once: true, tags: ['ext'], src: ['EXT.H16', 'EXT.H21'],
    when: L => emp(L) && (partner(L) || kidsN(L,0,18)>0) && ['jeonse','monthly'].includes(L.home?.tenure),
    text: '회사 일과 가족 수업이 같은 방에 들어왔다. 조용할 시간도 겹친다.',
    reason: '회사 일과 가족 수업이 같은 방에 들어왔다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '이용 시간을 나눈다', fx: { stats: { leisure: 1, relations: 1 }, issues: { housing: 1 } }, result: '공간 대신 시간의 경계를 정했다.' },
        { id: 'b', label: '근무 조정을 요청한다', fx: { stats: { relations: -1, intellect: 1 }, issues: { housing: 1 } }, result: '집의 조건을 업무 일정과 함께 설명했다.' },
        { id: 'c', label: '작업 공간을 손본다', fx: { stats: { intellect: 1, leisure: 1, wealth: -1 }, money: { assets: -10 } }, result: '작은 비용으로 책상과 소리를 분리하려 했다.' },
      ],
      default: 'a',
    },
  },
  // KR-228 job / 대면 영업 자영업자; 방역 조치 영향
  // p 근거: 2020~2022 방역 조치 영향 대면 영업 자영업 [게임 추정]
  {
    id: 'ext.228', ages: [18, 65], years: [2020, 2022], p: 0.15, cooldown: 2, tags: ['ext'], src: ['EXT.H31'],
    when: L => self(L) && ['4','5'].includes(maj(L)),
    text: '영업이 제한된다. 임대료와 재료비는 매출만큼 빨리 줄지 않는다.',
    reason: '영업이 제한된다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '배달 손익을 계산한다', fx: { stats: { intellect: 1, wealth: 1, leisure: -1 }, issues: { tech: 1 } }, result: '새 매출에서 수수료와 포장비를 따로 뺐다.' },
        { id: 'b', label: '지원 자격을 확인한다', fx: { stats: { intellect: 1 }, issues: { fairness: 1 } }, result: '해당 시점의 대상과 신청 서류를 살폈다.', do: (L, act) => act.flag('k228b', L.year) },
        { id: 'd', label: '임대 조건을 협의한다', fx: { stats: { relations: 1, wealth: -1 }, issues: { housing: 1 } }, result: '수입 변화와 운영 계획을 주인에게 설명했다.' },
      ],
      default: 'b',
    },
  },
  // KR-229 job / 간호·보건·요양 현장 종사; 감염병 업무 부담
  // p 근거: 2020~2022 감염병 대응기 보건·돌봄 종사자 [게임 추정]
  {
    id: 'ext.229', ages: [18, 65], years: [2020, 2022], p: 0.15, cooldown: 2, tags: ['ext'], src: ['EXT.H31'],
    when: L => working(L) && /간호|요양|보건|간병|의료/.test(L.job?.title ?? ''),
    text: '업무가 늘고 가족 만남은 조심스러워졌다. 일과 집 모두에서 긴장한다.',
    reason: '업무가 늘고 가족 만남은 조심스러워졌다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '근무 조정을 요청한다', fx: { stats: { health: 1, leisure: 1 }, issues: { job: 1 } }, result: '연속 근무와 회복 시간을 함께 논의했다.' },
        { id: 'b', label: '가족과 연락을 정한다', when: L => kin(L), fx: { stats: { relations: 2, leisure: -1 } }, result: '접촉을 줄여도 관계를 이어갈 방식을 만들었다.' },
        { id: 'd', label: '업무 기록을 남긴다', fx: { stats: { intellect: 1 }, issues: { job: 1 } }, result: '늘어난 노동과 필요한 인력을 구체적으로 적었다.' },
      ],
      default: 'a',
    },
  },
  // KR-230 job / 공연·행사 프리랜서; 계약 취소
  // p 근거: 해당 직종 한정 조건이 드물어 높게 설정 [게임 추정]
  {
    id: 'ext.230', ages: [18, 65], years: [2020, 2022], p: 0.15, cooldown: 2, tags: ['ext'], src: ['EXT.H21'],
    when: L => working(L) && /공연|행사|연예|배우|음악|연주|무대|무용/.test(L.job?.title ?? ''),
    text: '행사가 취소됐다. 취소된 수입과 이미 쓴 준비비는 다르다.',
    reason: '행사가 취소됐다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '계약서를 확인한다', fx: { stats: { intellect: 1 }, issues: { fairness: 1 } }, result: '취소 조건과 지급 범위를 따로 살폈다.' },
        { id: 'b', label: '온라인 일을 찾는다', fx: { stats: { wealth: 1, intellect: 1, leisure: -1 }, issues: { tech: 2 } }, result: '새 형식에 맞춰 도구와 기술을 준비했다.' },
        { id: 'd', label: '지원 제도를 알아본다', fx: { stats: { wealth: 1, relations: -1 }, issues: { job: 1 } }, result: '당시 적용 대상과 소득 증빙을 확인했다.', do: (L, act) => act.flag('k230d', L.year) },
      ],
      default: 'a',
    },
  },
  // KR-231 job / 플랫폼 배달 노동자; 비 오는 날; 안전 장비 보유
  // p 근거: 플랫폼 배달 종사자의 악천후 노동 연 12% [게임 추정]
  {
    id: 'ext.231', ages: [18, 65], years: [2020, 2026], p: 0.12, cooldown: 3, tags: ['ext'], src: ['EXT.H21'],
    when: L => working(L) && (!!L.job?.platform || /배달|배송|택배/.test(L.job?.title ?? '')),
    text: '비 오는 날 추가 보상이 붙었다. 오래 달릴수록 몸과 장비의 부담도 커진다.',
    reason: '비 오는 날 추가 보상이 붙었다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '오늘 물량을 줄인다', fx: { stats: { health: 1, wealth: -1 } }, result: '추가 수입을 낮추고 위험 노출을 줄였다.' },
        { id: 'b', label: '장비부터 점검한다', fx: { stats: { health: 1, leisure: -1, wealth: -1 }, issues: { job: 1 } }, result: '작업 시작 전에 시간과 정비비를 썼다.' },
        { id: 'd', label: '하루를 쉰다', fx: { stats: { health: 2, leisure: 2, wealth: -2 } }, result: '오늘의 수입을 포기하고 회복 시간을 남겼다.' },
      ],
      default: 'a',
    },
  },
  // KR-232 housing / 임차 주택 계약 예정; 목돈 보증금 필요
  // p 근거: 임차 계약 갱신·신규 계약 연 10% [게임 추정]
  {
    id: 'ext.232', ages: [24, 55], years: [2020, 2026], p: 0.1, cooldown: 3, tags: ['ext'], src: ['EXT.H18'],
    when: L => tenant(L),
    text: '보증금이 싸 보인다. 계약을 서두르라는 연락이 자주 온다.',
    reason: '보증금이 싸 보인다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '권리 서류를 확인한다', fx: { stats: { intellect: 1, leisure: -1 }, issues: { housing: 1 } }, result: '가격과 별개로 소유·권리관계를 살폈다.' },
        { id: 'b', label: '보증 가능성을 묻는다', fx: { stats: { intellect: 1 }, issues: { housing: 1 } }, result: '대상과 요건을 확인하되 안전을 단정하지 않았다.', do: (L, act) => act.flag('k232b', L.year) },
        { id: 'd', label: '계약을 잠시 미룬다', fx: { stats: { leisure: 1, wealth: -1 }, issues: { housing: 2 } }, result: '확인되지 않은 부분을 남겨 둔 채 송금하지 않았다.' },
      ],
      default: 'a',
    },
  },
  // KR-233 living / 부채 보유 가구; 이자·주거비 부담 증가
  // p 근거: 2021.8 기준금리 인상 시작 이후 이자 부담 증가(기억 기반·미검색), 부채 보유 가구 [게임 추정]
  {
    id: 'ext.233', ages: [18, 65], years: [2022, 2026], p: 0.15, cooldown: 3, tags: ['ext'], src: ['EXT.H20'],
    when: L => hasDebt(L),
    text: '갱신한 대출 이자가 늘었다. 생활비를 줄여도 고정비는 무겁다.',
    reason: '갱신한 대출 이자가 늘었다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '상환 구조를 확인한다', fx: { stats: { intellect: 1, leisure: -1 }, issues: { living: 2 } }, result: '금리와 기한·수수료를 함께 살폈다.' },
        { id: 'b', label: '금융 상담을 찾는다', fx: { stats: { intellect: 1, wealth: 1 }, issues: { living: 1 } }, result: '현재 가능한 조정·지원의 대상 여부를 물었다.', do: (L, act) => act.flag('k233b', L.year) },
        { id: 'c', label: '자산과 부채를 정리한다', fx: { stats: { wealth: 1, happiness: -1 }, issues: { housing: 2 } }, result: '팔 수 있는 것과 생활에 필요한 것을 나눴다.' },
      ],
      default: 'a',
    },
  },
  // KR-234 job / 반도체 장비 엔지니어; 교대·당직; 가족 돌봄
  // p 근거: 당직·호출 직군의 가족 일정 충돌 연 12% [게임 추정]
  {
    id: 'ext.234', ages: [18, 65], years: [2021, 2026], p: 0.12, cooldown: 3, tags: ['ext'], src: ['EXT.H21'],
    when: L => emp(L) && /반도체|장비|설비/.test(L.job?.title ?? ''),
    text: '긴급 호출이 가족 진료일과 겹쳤다. 장비는 개인 일정대로 멈추지 않는다.',
    reason: '긴급 호출이 가족 진료일과 겹쳤다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '대체 당직을 요청한다', fx: { stats: { relations: 1, leisure: -1 }, issues: { job: 1 } }, result: '동료 일정과 업무 인수인계를 함께 맞췄다.' },
        { id: 'b', label: '진료 동행을 나눈다', when: L => kin(L), fx: { stats: { relations: 2, leisure: -1 } }, result: '가족 한 사람의 부담을 다른 일정에 나누었다.' },
        { id: 'c', label: '역할 조정을 묻는다', fx: { stats: { intellect: 1, wealth: -1 }, issues: { job: 2 } }, result: '임금과 호출 빈도가 다른 직무를 살폈다.' },
      ],
      default: 'c',
    },
  },
  // KR-235 tech / 번역가·디자이너; 생성형 도구 도입 고객과 계약
  // p 근거: 생성형 AI 확산(2022.11 이후) 이후 해당 직군 연 12% [게임 추정]
  {
    id: 'ext.235', ages: [18, 65], years: [2023, 2026], p: 0.12, cooldown: 3, tags: ['ext'], src: ['EXT.H33'],
    when: L => working(L) && /번역|디자이너|통역|작가/.test(L.job?.title ?? ''),
    text: '고객이 AI로 초안을 만들었다며 단가를 낮추자고 한다. 검수 책임은 그대로다.',
    reason: '고객이 AI로 초안을 만들었다며 단가를 낮추자고 한다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '작업 범위를 다시 적는다', fx: { stats: { intellect: 1, wealth: 1 }, issues: { tech: 2 } }, result: '초안과 검수·책임의 대가를 따로 협의했다.' },
        { id: 'b', label: '도구를 직접 시험한다', fx: { stats: { intellect: 2, leisure: -1 }, issues: { tech: 3 } }, result: '시간을 들여 쓸 수 있는 업무를 구분했다.' },
        { id: 'c', label: '다른 고객을 찾는다', fx: { stats: { wealth: -1, leisure: -2 }, issues: { job: 2 } }, result: '영업 부담을 감수하며 거래 의존을 낮췄다.' },
      ],
      default: 'a',
    },
  },
  // KR-236 tech / 전기차 전환 영향 부품 근로자; 직무교육 제안
  // p 근거: 전동화 전환 영향 제조 재직자 연 6% [게임 추정]
  {
    id: 'ext.236', ages: [18, 65], years: [2022, 2026], p: 0.06, cooldown: 3, tags: ['ext'], src: ['EXT.H33'],
    when: L => emp(L) && ['7','8'].includes(maj(L)),
    text: '새 제품에 맞춘 공정 교육이 열린다. 기존 숙련이 어디까지 쓰일지 모른다.',
    reason: '새 제품에 맞춘 공정 교육이 열린다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '전환 교육을 받는다', fx: { stats: { intellect: 2, leisure: -2 }, issues: { tech: 3 } }, result: '일과 배움을 함께 할 시간이 필요했다.' },
        { id: 'b', label: '배치 계획을 확인한다', fx: { stats: { intellect: 1 }, issues: { job: 1 } }, result: '교육 뒤 직무와 임금 조건을 물었다.' },
        { id: 'd', label: '동료와 정보를 모은다', when: L => ally(L), fx: { stats: { relations: 1, intellect: 1 }, issues: { tech: 2 } }, result: '새 공정의 요구와 각자의 경험을 나누었다.' },
      ],
      default: 'b',
    },
  },
  // KR-237 job / 동네 카페·음식점; 프랜차이즈 제안; 초기 자본 있음
  // p 근거: 자본 보유 자영업자의 프랜차이즈 제안 연 5% [게임 추정]
  {
    id: 'ext.237', ages: [18, 65], years: [2022, 2026], p: 0.05, once: true, tags: ['ext'], src: ['EXT.H21'],
    when: L => self(L) && ['4','5'].includes(maj(L)) && (L.money?.assets ?? 0) >= 3000,
    text: '브랜드를 달면 손님이 온다고 한다. 매출표에는 내 임대료가 빠져 있다.',
    reason: '브랜드를 달면 손님이 온다고 한다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '점포 손익을 다시 센다', fx: { stats: { intellect: 1, wealth: 1 }, issues: { job: 1 } }, result: '브랜드 평균과 우리 가게의 비용을 나누었다.' },
        { id: 'b', label: '기존 점주에게 묻는다', when: L => ally(L), fx: { stats: { relations: 1, intellect: 1 } }, result: '홍보 자료 밖의 운영 경험을 들었다.' },
        { id: 'c', label: '계약 검토를 받는다', fx: { stats: { intellect: 1, wealth: -1, leisure: -1 }, money: { assets: -30 } }, result: '시간과 비용을 들여 조건을 확인했다.' },
      ],
      default: 'a',
    },
  },
  // KR-238 housing / 집중호우 영향 생활권; 침수 위험 주거
  // p 근거: 2022 집중호우 이후 침수 취약 주거 연 6% [게임 추정]
  {
    id: 'ext.238', ages: [18, 65], years: [2022, 2026], p: 0.06, cooldown: 3, tags: ['ext'], src: ['EXT.H29'],
    when: L => urban(L) && (lowW(L) || L.home?.tenure==='monthly'),
    text: '많은 비 예보가 왔다. 집의 낮은 출입구가 신경 쓰인다.',
    reason: '많은 비 예보가 왔다.',
    sensitive: 'disaster',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '대피 경로를 확인한다', fx: { stats: { health: 1, relations: 1, leisure: -1 } }, result: '가족과 이동 시점·연락 방법을 정했다.' },
        { id: 'c', label: '주거 지원을 알아본다', fx: { stats: { intellect: 1 }, issues: { housing: 1 } }, result: '이후 이주·보수 대상과 절차를 확인했다.', do: (L, act) => act.flag('k238c', L.year) },
        { id: 'd', label: '이웃과 연락을 맞춘다', when: L => ally(L), fx: { stats: { relations: 2, leisure: -1 } }, result: '혼자 움직이기 어려운 사람의 상황을 나눴다.' },
      ],
      default: 'a',
    },
  },
  // KR-239 housing / 전세사기 피해 의심·확인; 보증금 미반환
  // p 근거: 전세사기 피해자 결정 누적 약 2.9만 명(2025.3, 검색 확인) ÷ 전세 가구 수백만 → 연 0.3% 미만, 보수적으로 2% [게임 추정]
  {
    id: 'ext.239', ages: [20, 50], years: [2023, 2026], p: 0.02, cooldown: 5, tags: ['ext'], src: ['EXT.H18'],
    when: L => L.home?.tenure==='jeonse',
    text: '계약이 끝났는데 보증금이 돌아오지 않는다. 다음 집도 기다려 주지 않는다.',
    reason: '계약이 끝났는데 보증금이 돌아오지 않는다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '상담과 절차를 확인한다', fx: { stats: { intellect: 1, happiness: -1 }, issues: { housing: 3 } }, result: '현재 법·지원의 적용 대상부터 확인했다.', do: (L, act) => act.flag('k239a', L.year) },
        { id: 'b', label: '자료를 모아 보관한다', fx: { stats: { intellect: 1, leisure: -1 }, issues: { housing: 2 } }, result: '계약과 송금·연락 기록을 한곳에 정리했다.' },
        { id: 'c', label: '임시 거처를 구한다', fx: { stats: { wealth: -2, leisure: -1 }, issues: { housing: 3 } }, result: '권리 문제와 당장 잘 곳을 따로 마련했다.' },
      ],
      default: 'a',
    },
  },
  // KR-240 fairness / SNS 이용자; 지역·연봉·직장 서열표 노출
  // p 근거: SNS 서열표 노출 재직자 연 6% [게임 추정, 서열표 확산 시기는 미검증]
  {
    id: 'ext.240', ages: [20, 45], years: [2023, 2026], p: 0.06, cooldown: 3, tags: ['ext'], src: ['EXT.H20'],
    when: L => emp(L),
    text: '직장 티어표에 내 회사가 있다. 실제 근무시간과 복지는 한 줄도 없다.',
    reason: '직장 티어표에 내 회사가 있다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '생활 조건을 적는다', fx: { stats: { intellect: 1, happiness: 1 }, issues: { fairness: 2 } }, result: '이름값 밖의 임금과 시간·관계를 확인했다.' },
        { id: 'b', label: '자료의 기준을 묻는다', fx: { stats: { intellect: 1 }, issues: { fairness: 1 } }, result: '익명 순위와 실제 통계의 차이를 살폈다.' },
        { id: 'd', label: '추천 노출을 줄인다', fx: { stats: { leisure: 1, happiness: 1 } }, result: '순위표에 쓰던 시간을 다른 일에 돌렸다.' },
      ],
      default: 'a',
    },
  },
  // KR-241 fairness / 결혼 준비·소개 서비스 이용 검토; 상대 의사 존중
  // p 근거: 결혼 정보 서비스 상담 연 4% [게임 추정, 서비스 등급 관행은 미검증]
  {
    id: 'ext.241', ages: [26, 45], years: [2023, 2026], p: 0.04, once: true, tags: ['ext'], src: ['EXT.H20'],
    when: L => !L.family?.married && !partner(L),
    text: '직업과 자산을 등급으로 말하는 상담을 받았다. 서로의 삶은 아직 모른다.',
    reason: '직업과 자산을 등급으로 말하는 상담을 받았다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '평가 기준을 묻는다', fx: { stats: { intellect: 1 }, issues: { fairness: 2 } }, result: '업체의 영업 기준과 개인의 가치를 나누어 보았다.' },
        { id: 'b', label: '생활 계획부터 말한다', fx: { stats: { relations: 1, intellect: 1 } }, result: '돌봄·소비·일에 대한 기대를 함께 확인했다.' },
        { id: 'c', label: '서비스 비용을 비교한다', when: L => !lowW(L), fx: { stats: { wealth: -1, intellect: 1 }, issues: { fairness: 1 } }, result: '성공 약속보다 계약과 환불 조건을 살폈다.', do: (L, act) => act.flag('k241c', L.year) },
      ],
      default: 'a',
    },
  },
  // KR-242 job / 청년 구직자; 부모 지원 종료·부족
  // p 근거: 청년 구직자 부모 지원 소진 연 12% [게임 추정]
  {
    id: 'ext.242', ages: [19, 34], years: [2023, 2026], p: 0.12, cooldown: 2, tags: ['ext'], src: ['EXT.H21'],
    when: L => seeking(L),
    text: '취업 준비를 더 하고 싶지만 생활비가 먼저 끝나 간다.',
    reason: '취업 준비를 더 하고 싶지만 생활비가 먼저 끝나 간다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '지원 직무를 좁힌다', fx: { stats: { intellect: 1, wealth: -1 }, issues: { job: 2 } }, result: '모든 스펙 대신 필요한 준비에 시간을 모았다.' },
        { id: 'b', label: '단기 일을 병행한다', fx: { stats: { wealth: 2, leisure: -2 }, issues: { job: 1 } }, result: '생활비와 준비 시간 사이를 나누었다.' },
        { id: 'c', label: '공공 구직 지원을 묻는다', fx: { stats: { intellect: 1 }, issues: { job: 1 } }, result: '소득·경력·연도별 자격을 확인했다.', do: (L, act) => act.flag('k242c', L.year) },
      ],
      default: 'a',
    },
  },
  // KR-243 region / 인구감소 지역; 대중교통 감편 영향 주민
  // p 근거: 비도시권 대중교통 감편 체감 연 8% [게임 추정]
  {
    id: 'ext.243', ages: [18, 90], years: [2023, 2026], p: 0.08, cooldown: 3, tags: ['ext'], src: ['EXT.H20'],
    when: L => prov(L),
    text: '버스가 줄어 병원과 시장을 하루에 다녀오기 어려워졌다.',
    reason: '버스가 줄어 병원과 시장을 하루에 다녀오기 어려워졌다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '동선을 한날로 묶는다', fx: { stats: { leisure: -1, health: 1 }, issues: { region: 2 } }, result: '일정의 유연성을 줄여 이동을 모았다.' },
        { id: 'b', label: '지역 교통 지원을 묻는다', fx: { stats: { intellect: 1 }, issues: { region: 1 } }, result: '운영 지역과 신청 조건을 확인했다.', do: (L, act) => act.flag('k243b', L.year) },
        { id: 'c', label: '이웃과 이동을 나눈다', when: L => ally(L), fx: { stats: { relations: 2, wealth: 1 }, issues: { region: 1 } }, result: '기름값과 출발 시간을 함께 맞췄다.' },
      ],
      default: 'a',
    },
  },
  // KR-244 job / 학교 교사; 학부모 연락·행정업무 과다
  // p 근거: 교사 직군의 업무 외 연락·행정 부담 연 12% [게임 추정]
  {
    id: 'ext.244', ages: [18, 65], years: [2024, 2026], p: 0.12, cooldown: 3, tags: ['ext'], src: ['EXT.H22'],
    when: L => emp(L) && /교사|교원|교수|강사/.test(L.job?.title ?? ''),
    text: '퇴근 뒤 연락과 행정업무가 겹친다. 수업 준비는 뒤로 밀렸다.',
    reason: '퇴근 뒤 연락과 행정업무가 겹친다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '연락 창구를 정한다', fx: { stats: { health: 1, intellect: 1 }, issues: { job: 1 } }, result: '응답 시간과 공식 전달 방식을 안내했다.' },
        { id: 'b', label: '학교와 분담을 묻는다', when: L => ally(L), fx: { stats: { relations: 2, leisure: 1 }, issues: { job: 1 } }, result: '개인 대응과 조직 업무를 나누어 이야기했다.' },
        { id: 'd', label: '회복 일정을 지킨다', fx: { stats: { health: 2, leisure: 2, wealth: -1 } }, result: '당장 다 끝내기보다 쉴 시간을 확보했다.' },
      ],
      default: 'a',
    },
  },
  // KR-245 care / 노부모·자녀 동시 부양; 경제 여력 낮음
  // p 근거: 샌드위치 세대 저자산 가구 연 10% [게임 추정]
  {
    id: 'ext.245', ages: [38, 62], years: [2024, 2026], p: 0.1, cooldown: 3, tags: ['ext'], src: ['EXT.H20'],
    when: L => kidsN(L,0,22)>=1 && parentsAlive(L).length>0 && lowW(L),
    text: '부모 병원비와 자녀 교육비가 같은 달에 몰렸다. 내 검진도 예약돼 있다.',
    reason: '부모 병원비와 자녀 교육비가 같은 달에 몰렸다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '필수 비용을 나눈다', fx: { stats: { relations: 1, leisure: -1 }, issues: { care: 2 } }, result: '각자의 필요를 듣고 지급 시기를 맞췄다.' },
        { id: 'b', label: '지원 제도를 묻는다', fx: { stats: { intellect: 1 }, issues: { care: 1 } }, result: '의료·돌봄·교육별 적용 대상을 따로 확인했다.', do: (L, act) => act.flag('k245b', L.year) },
        { id: 'd', label: '내 진료도 계획한다', fx: { stats: { health: 2, wealth: -1 }, issues: { medical: 1 } }, result: '나의 돌봄 필요를 가계에서 지우지 않았다.' },
      ],
      default: 'a',
    },
  },
  // KR-246 job / 고령 구직자; 주된 일자리 퇴직; 연금 수입 부족
  // p 근거: 고령 구직자 연 15% (상한) [게임 추정]
  {
    id: 'ext.246', ages: [55, 80], years: [2024, 2026], p: 0.15, cooldown: 2, tags: ['ext'], src: ['EXT.H21'],
    when: L => seeking(L) || L.job?.status==='retired' || L.job?.status==='inactive',
    text: '다시 일을 구한다. 제시된 임금보다 오래 서 있는 시간이 걱정이다.',
    reason: '다시 일을 구한다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '실제 업무를 확인한다', fx: { stats: { intellect: 1, health: 1 }, issues: { job: 2 } }, result: '표시된 직함과 몸에 드는 부담을 나누어 봤다.' },
        { id: 'b', label: '시간제 일을 찾는다', fx: { stats: { wealth: 1, health: 1, leisure: 1 } }, result: '수입을 낮추고 회복할 간격을 남겼다.' },
        { id: 'c', label: '재교육을 알아본다', fx: { stats: { intellect: 2, leisure: -1 }, issues: { job: 1 } }, result: '현재 가능한 훈련과 취업 연계를 물었다.', do: (L, act) => act.flag('k246c', L.year) },
      ],
      default: 'a',
    },
  },
  // KR-247 tech / 디지털 이용 어려움; 은행·의료·행정 서비스 필요
  // p 근거: 고령자 디지털 이용 어려움 연 15% (상한) [게임 추정]
  {
    id: 'ext.247', ages: [65, 90], years: [2024, 2026], p: 0.15, cooldown: 3, tags: ['ext'], src: ['EXT.H28'],
    when: L => true,
    text: '신청은 휴대폰으로 하라고 한다. 인증 화면에서 다시 막혔다.',
    reason: '신청은 휴대폰으로 하라고 한다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '대면 창구를 찾는다', fx: { stats: { relations: 1, leisure: -1 }, issues: { tech: 2 } }, result: '이동 시간을 들여 설명받을 곳을 구했다.' },
        { id: 'b', label: '공식 교육을 묻는다', fx: { stats: { intellect: 2, leisure: -1 }, issues: { tech: 1 } }, result: '반복해서 사용할 방법을 배웠다.', do: (L, act) => act.flag('k247b', L.year) },
        { id: 'c', label: '가족과 함께 익힌다', when: L => kin(L) && ally(L), fx: { stats: { relations: 2, intellect: 1 }, issues: { tech: 1 } }, result: '비밀번호를 넘기기보다 절차를 같이 확인했다.' },
      ],
      default: 'a',
    },
  },
  // KR-248 conflict / 직장인; 가족·단체방 정치 갈등; 미디어 노출 높음
  // p 근거: 단체 대화방 갈등 노출 재직자 연 10% [게임 추정]
  {
    id: 'ext.248', ages: [18, 65], years: [2025, 2026], p: 0.1, cooldown: 2, tags: ['ext'], src: ['EXT.H20'],
    when: L => emp(L),
    text: '단체방의 정치 이야기가 가족 안부보다 길어졌다. 확인되지 않은 영상도 온다.',
    reason: '단체방의 정치 이야기가 가족 안부보다 길어졌다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '출처를 함께 확인한다', when: L => ally(L), fx: { stats: { intellect: 1, relations: 1 }, issues: { conflict: 1 } }, result: '의견과 검증 가능한 사실을 나누어 보았다.' },
        { id: 'b', label: '대화 시간을 제한한다', fx: { stats: { relations: -1, leisure: 1 }, issues: { conflict: -2 } }, result: '관계를 끊지 않으며 반복 논쟁의 선을 정했다.' },
        { id: 'd', label: '알림을 잠시 끈다', fx: { stats: { happiness: 1, leisure: 1, relations: -1 }, issues: { conflict: -3 } }, result: '내 생활을 위한 회복 시간을 남겼다.' },
      ],
      default: 'b',
    },
  },
  // KR-249 fairness / SNS 창작자; 수입 변동; 팔로워 비교 경험
  // p 근거: 플랫폼 기반 창작 직군 연 12% [게임 추정]
  {
    id: 'ext.249', ages: [18, 65], years: [2025, 2026], p: 0.12, cooldown: 3, tags: ['ext'], src: ['EXT.H21', 'EXT.H28'],
    when: L => working(L) && (!!L.job?.platform || /작가|크리에이터|유튜|방송|콘텐츠/.test(L.job?.title ?? '')),
    text: '팔로워는 늘었지만 수입은 다르다. 인기와 생활비는 같은 그래프가 아니다.',
    reason: '팔로워는 늘었지만 수입은 다르다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '수입원을 따로 센다', fx: { stats: { intellect: 1, wealth: 1 }, issues: { fairness: 1 } }, result: '조회수와 실제 정산·비용을 구분했다.' },
        { id: 'b', label: '게시 주기를 낮춘다', fx: { stats: { health: 1, happiness: 1, wealth: -1 } }, result: '성장 속도 대신 회복 시간을 남겼다.' },
        { id: 'c', label: '협업 계약을 확인한다', fx: { stats: { intellect: 1, wealth: 1, leisure: -1 } }, result: '노출 약속보다 대가와 권리를 살폈다.' },
      ],
      default: 'a',
    },
  },
  // KR-250 care / 3월27일 이후; 통합돌봄 필요; 지자체 접수 대상 확인
  // p 근거: 2026.3.27 돌봄통합지원법 시행(검색 확인), 연 단위 상태 한계로 생일 4월 이후 출생자만 노출(보수적) [게임 추정]
  {
    id: 'ext.250', ages: [18, 90], years: [2026, 2026], p: 0.15, once: true, tags: ['ext'], src: ['EXT.H19'],
    when: L => (L.birth?.month ?? 1) >= 4 && (L.age>=65 || dis(L)) && (chronic(L) || L.age>=75),
    text: '사는 곳에서 의료·요양·돌봄을 함께 상담할 수 있다는 안내가 왔다.',
    reason: '사는 곳에서 의료·요양·돌봄을 함께 상담할 수 있다는 안내가 왔다.',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'a', label: '지자체에 상담한다', fx: { stats: { intellect: 1 }, issues: { care: 2, medical: 1 } }, result: '실제 필요와 지원 대상 여부를 함께 확인했다.', do: (L, act) => act.flag('k250a', L.year) },
        { id: 'b', label: '당사자 뜻을 듣는다', fx: { stats: { relations: 1, happiness: 1 }, issues: { care: 1 } }, result: '집과 시설·생활 방식에 대한 바람을 먼저 물었다.' },
        { id: 'd', label: '제공 범위를 확인한다', fx: { stats: { intellect: 1 }, issues: { care: 1 } }, result: '전국 시행과 지역에서 바로 가능한 서비스를 나누었다.' },
      ],
      default: 'b',
    },
  },
];
