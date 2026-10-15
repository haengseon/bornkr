// 시대 사건(era.js)에 붙는 '나에게 닿은 일'. 키 = era 사건 id, 값 = links 배열(news-general.js 형식).
// 위에서부터 처음 맞는 하나가 적용된다 → 상태별 인과를 위에, 조건 없는 '그 시대 보통 사람' 반응을 맨 끝에 둔다.
const st = L => L.job?.status;
const emp = L => st(L) === 'employed';
const self = L => st(L) === 'self';
const work = L => emp(L) || self(L);
const seek = L => st(L) === 'seeking';
const mil = L => st(L) === 'military';
const retired = L => st(L) === 'retired';
const pubW = L => emp(L) && (!!L.job?.public || L.job?.firmSize === 'public');
const priv = L => emp(L) && !pubW(L);
const big = L => priv(L) && L.job?.firmSize === 'large';
const smallW = L => priv(L) && ['micro', 'small', 'mid'].includes(L.job?.firmSize);
const nonreg = L => emp(L) && !L.job?.regular;
const age = (a, b) => L => (L.age ?? 0) >= a && (L.age ?? 0) <= b;
const adult = age(20, 200);
const young = age(20, 34);
const child = age(0, 6);
const tenant = L => ['jeonse', 'monthly'].includes(L.home?.tenure);
const jeonse = L => L.home?.tenure === 'jeonse';
const monthly = L => L.home?.tenure === 'monthly';
const owner = L => !!L.home?.owned;
const debt = L => (L.money?.debt ?? 0) > 0;
const credit = L => (L.money?.loans?.credit ?? 0) > 0;
const mort = L => (L.money?.loans?.mortgage ?? 0) > 0;
const bizLoan = L => (L.money?.loans?.business ?? 0) > 0;
const saver = L => adult(L) && (L.money?.assets ?? 0) >= 3000;
const poor = L => adult(L) && (L.money?.assets ?? 0) < 1000;
const stg = (...s) => L => s.includes(L.edu?.stage);
const kid = stg('elem');
const teen = stg('middle', 'high', 'retake');
const col = stg('college', 'grad');
const exam = L => (L.edu?.stage === 'high' && L.age >= 17) || L.edu?.stage === 'retake';
const kidAges = L => (L.family?.children ?? []).filter(c => c?.alive !== false && c?.birthYear != null).map(c => L.year - c.birthYear);
const hasKid = (a, b) => L => kidAges(L).some(x => x >= a && x <= b);
const partner = L => !!L.family?.partner;
const elderP = L => ['father', 'mother'].some(p => L.family?.parents?.[p]?.alive && L.family.parents[p].age >= 65);
const rural = L => L.birth?.urban === false;
const quint = L => L.birth?.quintile ?? 3;
const at = (...r) => L => r.includes(L.home?.region);
const capital = at('seoul', 'gyeonggi', 'incheon');
const sick = L => (L.stats?.health ?? 70) < 50;
const and = (...f) => L => f.every(g => g(L));
const or = (...f) => L => f.some(g => g(L));
const not = f => L => !f(L);
const k = (when, line, fx, reason) => ({ when, line, fx, reason });
const g = (line, fx, reason) => ({ line, fx, reason });

export const ERA_LINKS_MAP = {
  'era.1970.saemaeul': [
    k(adult, '마을 길 넓히기 울력에 집집마다 사람을 내보냈다.', { stats: { relations: 1 } }, '새마을 공동 작업'),
    k(age(7, 19), '새벽 마을 청소에 아이들도 빗자루를 들었다.', { stats: { health: 1 } }, '새마을 운동'),
    g('초가지붕이 슬레이트로 바뀌는 걸 지켜봤다.', { issues: { region: -2 } }, '농촌 주택 개량'),
  ],
  'era.1973.oil': [
    k(self, '기름값이 뛰어 가게 연탄과 석유 사기가 버거웠다.', { issues: { living: 3 } }, '유가 급등'),
    k(child, '집 안 난로를 일찍 끄고 이불 속에서 겨울밤을 보냈다.', { stats: { health: -1 } }, '난방 절약'),
    g('밤거리 네온사인이 꺼지고 절약 표어가 붙었다.', { issues: { living: 2 } }, '에너지 절약'),
  ],
  'era.1974.equalize': [
    k(teen, '시험 대신 추첨으로 고등학교가 정해졌다.', { issues: { edu: -2 } }, '고교 추첨 배정'),
    k(age(7, 12), '중학교 입시 걱정은 덜었다는 말을 들었다.', { issues: { edu: -2 } }, '평준화'),
    g('고교 입시가 사라진다는 소식에 의견이 갈렸다.', { issues: { edu: -2 } }, '고교 평준화'),
  ],
  'era.1980.oil': [
    k(self, '원가가 올라 가게 물건값을 다시 매겼다.', { issues: { living: 4 } }, '2차 석유파동'),
    k(and(emp, smallW), '공장 가동이 줄어 잔업 수당이 끊겼다.', { issues: { job: 3 } }, '불황'),
    k(child, '집에서 난방을 줄여 겨울이 유난히 추웠다.', { stats: { health: -1 } }, '난방비 절약'),
    g('물가가 한 해 사이 크게 뛰었다는 말이 오갔다.', { issues: { living: 3 } }, '물가 급등'),
  ],
  'era.1980.tutor.ban': [
    k(teen, '다니던 과외가 끊겨 학교 공부에만 매달렸다.', { issues: { edu: -2 } }, '과외 금지'),
    k(age(7, 12), '형과 누나들 과외 선생님이 오지 않게 됐다.', { issues: { edu: -2 } }, '과외 금지'),
    g('몰래 과외 단속 기사가 실렸다.', { issues: { edu: -2 } }, '과외 금지'),
  ],
  'era.1980.tutor.ban.low': [
    k(teen, '과외 받던 친구들과 출발선이 조금 가까워졌다.', { issues: { fairness: -2 } }, '과외 금지'),
    k(age(0, 12), '집안 형편 걱정이 사교육비로 번지지는 않았다.', { issues: { edu: -2 } }, '과외 금지'),
    g('누구나 학교에서 배운다는 말이 나왔다.', { issues: { edu: -2 } }, '과외 금지'),
  ],
  'era.1981.quota': [
    k(exam, '대학 문이 넓어졌다는 말에 지원 대학을 다시 골랐다.', { issues: { edu: -2 } }, '졸업정원제'),
    k(teen, '대학 정원이 늘었다며 선생님이 격려했다.', { stats: { happiness: 1 } }, '대학 정원 확대'),
    g('들어가긴 쉬워도 졸업은 어렵다는 말이 돌았다.', { issues: { edu: 2 } }, '졸업정원제'),
  ],
  'era.1987.june': [
    k(col, '최루탄 냄새가 밴 옷을 입고 강의실에 들어갔다.', { issues: { conflict: 3 } }, '6월 항쟁'),
    k(and(emp, age(20, 40)), '퇴근길 넥타이 부대 행렬에 섞여 걸었다.', { issues: { conflict: 2, fairness: -2 } }, '6월 항쟁'),
    k(teen, '시내에 나가지 말라는 당부를 들었다.', { issues: { conflict: 2 } }, '시위 정국'),
    g('직선제 개헌 소식에 시대가 바뀐다고들 했다.', { issues: { fairness: -2 } }, '직선제 개헌'),
  ],
  'era.1988.olympics': [
    k(kid, '굴렁쇠 장면을 따라 하며 골목을 뛰어다녔다.', { stats: { happiness: 1 } }, '서울올림픽'),
    k(and(self, at('seoul')), '외국인 손님이 늘어 가게가 바빴다.', { stats: { wealth: 1 } }, '올림픽 특수'),
    k(adult, '올림픽 중계를 보며 나라가 달라진 걸 느꼈다.', { stats: { happiness: 1 } }, '서울올림픽'),
    g('호돌이 그림이 동네 곳곳에 붙었다.', { stats: { relations: 1 } }, '서울올림픽'),
  ],
  'era.1988.house.boom': [
    k(and(jeonse, adult), '전세금 인상 요구에 이사할 곳을 찾아다녔다.', { issues: { housing: 5 } }, '집값·전셋값 급등'),
    k(and(monthly, adult), '월세가 올라 방 한 칸으로 옮겼다.', { issues: { housing: 4, living: 2 } }, '임대료 상승'),
    k(tenant, '집에서 또 이사 얘기가 나왔다.', { issues: { housing: 3 } }, '전셋값 상승'),
    k(owner, '집값이 올랐다는 말이 집안 화제가 됐다.', { stats: { wealth: 1 } }, '집값 상승'),
    g('주택 200만 호 건설 계획이 발표됐다.', { issues: { housing: 2 } }, '주택 대량 공급'),
  ],
  'era.1993.realname': [
    k(self, '거래를 실명 통장으로 옮기며 장부를 정리했다.', { issues: { living: 2 } }, '금융실명제'),
    k(saver, '가명 예금 얘기가 남의 일이 아니라는 이웃도 있었다.', { issues: { fairness: -2 } }, '금융실명제'),
    k(emp, '월급 통장을 실명 확인하러 은행에 들렀다.', { issues: { fairness: -2 } }, '실명 확인'),
    g('검은돈이 사라질 거라는 기대가 돌았다.', { issues: { fairness: -2 } }, '금융실명제'),
  ],
  'era.1994.csat': [
    k(exam, '처음 보는 유형의 시험에 문제집부터 바꿨다.', { issues: { edu: 3 } }, '수능 첫 시행'),
    k(teen, '학력고사 대신 수능이라는 말을 처음 들었다.', { issues: { edu: 2 } }, '입시 개편'),
    k(hasKid(16, 19), '아이 입시 제도가 바뀌어 설명회를 찾아다녔다.', { issues: { edu: 2 } }, '입시 개편'),
    g('사고력 중심 시험이라는 설명이 나왔다.', { issues: { edu: 2 } }, '수능 도입'),
  ],
  'era.1994.bridge': [
    k(and(at('seoul'), or(emp, col)), '출퇴근하던 다리 대신 먼 길을 돌아다녔다.', { stats: { leisure: -1 } }, '성수대교 붕괴'),
    k(hasKid(7, 18), '아이 등굣길 다리를 다시 살펴봤다.', { issues: { care: 2 } }, '시설 안전 불안'),
    g('다리를 건널 때마다 마음이 쓰였다.', { issues: { conflict: 2 } }, '성수대교 붕괴'),
  ],
  'era.1995.sampoong': [
    k(at('seoul'), '큰 건물에 들어설 때 기둥부터 살피게 됐다.', { issues: { conflict: 2 } }, '삼풍백화점 붕괴'),
    k(pubW, '건물 안전 점검 업무가 크게 늘었다.', { stats: { leisure: -1 } }, '안전 점검'),
    g('부실 공사 얘기가 오래 이어졌다.', { issues: { fairness: 2 } }, '삼풍백화점 붕괴'),
  ],
  'era.1996.colleges': [
    k(exam, '지원할 수 있는 대학 목록이 길어졌다.', { issues: { edu: -2 } }, '대학 설립 확대'),
    k(rural, '고향 근처에도 새 대학이 생긴다는 소식이 왔다.', { issues: { region: -2 } }, '지방 대학 신설'),
    g('대학 문이 넓어졌다는 말이 나왔다.', { issues: { edu: -2 } }, '대학 설립 준칙주의'),
  ],
  'era.1997.imf': [
    k(and(big, not(pubW)), '희망퇴직 면담 소문에 일이 손에 잡히지 않았다.', { issues: { job: 5 }, stats: { happiness: -1 } }, '외환위기 감원'),
    k(nonreg, '계약 연장은 없다는 통보를 받았다.', { issues: { job: 6 } }, '외환위기 해고'),
    k(smallW, '거래처가 줄도산해 월급이 몇 달씩 밀렸다.', { issues: { job: 5, living: 3 } }, '연쇄 도산'),
    k(pubW, '공무원도 구조조정이라는 말에 긴장했다.', { issues: { job: 3 } }, '공공 구조조정'),
    k(and(self, or(bizLoan, debt)), '대출 이자가 20%대로 올라 가게 수입을 이자가 먹었다.', { issues: { living: 6 }, money: { assets: -300 } }, '고금리'),
    k(self, '거래처 도산이 이어져 외상값이 쌓였다.', { issues: { living: 5 }, money: { assets: -200 } }, '외상 미수'),
    k(debt, '변동금리가 치솟아 이자가 월급을 먹었다.', { issues: { living: 5 } }, '외환위기 고금리'),
    k(seek, '채용 공고 자체가 사라졌다.', { issues: { job: 6 }, stats: { happiness: -1 } }, '채용 중단'),
    k(col, '졸업 즈음 취업문이 닫혔다는 말을 실감했다.', { issues: { job: 5 } }, '청년 취업난'),
    k(and(tenant, adult), '집주인이 전세금 돌려주기 어렵다는 말을 꺼냈다.', { issues: { housing: 5 } }, '전세금 불안'),
    k(teen, '집에 들어서면 어른들 한숨 소리가 들렸다.', { issues: { living: 3 }, stats: { happiness: -1 } }, '가계 위기'),
    k(age(0, 12), '사 달라던 장난감 얘기를 꺼내지 못했다.', { issues: { living: 2 } }, '가계 긴축'),
    k(adult, '가계부를 다시 쓰며 외식부터 끊었다.', { issues: { living: 4 } }, '외환위기 긴축'),
    g('부도와 실직 소식이 날마다 들렸다.', { issues: { job: 3 } }, '외환위기'),
  ],
  'era.1998.gold': [
    k(and(adult, partner), '장롱 속 돌반지를 꺼내 금 모으기 줄에 섰다.', { stats: { relations: 1 }, money: { assets: -50 } }, '금 모으기'),
    k(adult, '은행 앞 금 모으기 줄에 섰다.', { stats: { relations: 1 } }, '금 모으기'),
    k(age(0, 19), '어른들이 내 돌반지를 들고 은행에 갔다.', { stats: { relations: 1 } }, '금 모으기'),
    g('금 모으기 행렬이 뉴스에 이어졌다.', { issues: { conflict: -2 } }, '금 모으기'),
  ],
  'era.2000.pharm': [
    k(sick, '처방전을 들고 병원과 약국을 오가느라 하루가 걸렸다.', { issues: { medical: 4 } }, '의약분업'),
    k(hasKid(0, 10), '아이 감기약 받으려 병원과 약국을 두 번 들렀다.', { issues: { care: 2, medical: 2 } }, '의약분업'),
    k(and(self, L => /^24[0-9]/.test(L.job?.code ?? '')), '약국 운영 방식이 통째로 바뀌었다.', { issues: { job: 3 } }, '의약분업'),
    g('병원 파업 소식에 진료를 미뤘다.', { issues: { medical: 2 } }, '의료계 파업'),
  ],
  'era.2000.tutor.legal': [
    k(and(teen, L => quint(L) >= 4), '학원 시간표가 저녁까지 빽빽해졌다.', { issues: { edu: 3 }, stats: { leisure: -1 } }, '사교육 확산'),
    k(teen, '친구들이 다니는 학원 얘기에 마음이 조급해졌다.', { issues: { edu: 4, fairness: 2 } }, '사교육 격차'),
    k(hasKid(7, 18), '아이 학원비가 가계부 큰 줄을 차지했다.', { issues: { edu: 3, living: 2 } }, '사교육비'),
    g('과외 금지가 위헌이라는 결정이 나왔다.', { issues: { edu: 2 } }, '과외 금지 위헌'),
  ],
  'era.2002.worldcup': [
    k(teen, '붉은 티를 입고 친구들과 거리 응원에 나갔다.', { stats: { relations: 2, happiness: 1 } }, '거리 응원'),
    k(or(col, young), '광장에서 모르는 사람과 얼싸안고 소리쳤다.', { stats: { relations: 2 } }, '거리 응원'),
    k(emp, '경기 날엔 회사가 일찍 퇴근시켜 줬다.', { stats: { leisure: 1, relations: 1 } }, '월드컵 응원'),
    k(self, '경기 날마다 가게 앞에 TV를 내놓았다.', { stats: { wealth: 1 } }, '월드컵 특수'),
    k(kid, '대~한민국 박수를 학교에서 다 같이 쳤다.', { stats: { happiness: 1 } }, '월드컵 응원'),
    g('거리마다 붉은 물결이 넘쳤다.', { stats: { happiness: 1 } }, '월드컵'),
  ],
  'era.2003.card': [
    k(and(credit, young), '돌려막던 카드 빚이 터져 신용불량 통지를 받았다.', { issues: { living: 6, fairness: 3 }, stats: { happiness: -2 } }, '카드 빚 연체'),
    k(credit, '카드 한도가 갑자기 줄어 돌려막기가 막혔다.', { issues: { living: 5 } }, '카드 한도 축소'),
    k(and(col, not(credit)), '길거리에서 카드 만들라던 권유가 뚝 끊겼다.', { issues: { fairness: 2 } }, '카드 발급 규제'),
    k(and(self, debt), '손님 지갑이 닫혀 대출 상환이 버거워졌다.', { issues: { living: 4 } }, '소비 위축'),
    k(self, '카드 결제 손님이 줄어 매출이 내려앉았다.', { issues: { living: 3 } }, '소비 위축'),
    k(and(emp, young), '동료가 빚 독촉 전화를 받는 걸 봤다.', { issues: { fairness: 2 } }, '카드 빚'),
    k(hasKid(18, 30), '자녀 카드 빚을 대신 갚아야 하나 고민했다.', { issues: { care: 3, living: 3 } }, '자녀 채무'),
    g('신용불량자 수 뉴스가 연일 나왔다.', { issues: { living: 2 } }, '카드대란'),
  ],
  'era.2003.subway': [
    k(and(at('daegu'), or(emp, col, teen)), '지하철을 탈 때마다 비상구부터 찾았다.', { issues: { conflict: 3 } }, '대구 지하철 참사'),
    k(emp, '출퇴근 지하철에서 소화기 위치를 살폈다.', { issues: { conflict: 2 } }, '지하철 안전'),
    g('지하철 내장재 교체 소식이 이어졌다.', { issues: { fairness: 2 } }, '지하철 참사'),
  ],
  'era.2004.fiveday': [
    k(and(big, partner), '토요일마다 식구들과 나들이를 다녔다.', { stats: { leisure: 2, relations: 1 } }, '주5일제'),
    k(or(big, pubW), '토요일 출근이 없어져 여유가 생겼다.', { stats: { leisure: 2 } }, '주5일제'),
    k(smallW, '대기업 얘기일 뿐 우리 회사는 토요일에도 나갔다.', { issues: { fairness: 3 } }, '단계 시행 격차'),
    k(self, '토요일 손님이 늘어 주말에도 문을 열었다.', { stats: { leisure: -1, wealth: 1 } }, '주말 소비'),
    k(teen, '학교도 토요일에 쉬는 날이 생긴다는 말을 들었다.', { stats: { leisure: 1 } }, '주5일 수업'),
    g('주말 여행지마다 차가 막혔다.', { stats: { leisure: 1 } }, '주5일제'),
  ],
  'era.2007.nonreg.law': [
    k(and(nonreg, L => (L.job?.years ?? 0) >= 1), '2년 되기 전에 계약을 끝낼까 불안했다.', { issues: { job: 5 } }, '비정규직법'),
    k(nonreg, '정규직 전환 얘기에 기대와 걱정이 엇갈렸다.', { issues: { job: 3 } }, '비정규직법'),
    k(and(priv, L => !!L.job?.regular), '같은 일 하는 비정규 동료와 처우 얘기가 나왔다.', { issues: { fairness: 2 } }, '차별 시정'),
    k(seek, '구인 공고마다 계약직이 늘었다.', { issues: { job: 3 } }, '계약직 확산'),
    g('비정규직 보호법 시행 뉴스가 나왔다.', { issues: { job: 2 } }, '비정규직법'),
  ],
  'era.2008.gfc': [
    k(and(big, not(pubW)), '수출 물량이 줄어 무급휴직 순번이 돌았다.', { issues: { job: 5 }, stats: { wealth: -1 } }, '금융위기 수출 급감'),
    k(nonreg, '계약 만료와 함께 재계약이 없었다.', { issues: { job: 6 } }, '금융위기 해고'),
    k(smallW, '납품 단가가 깎이고 잔업이 끊겼다.', { issues: { job: 4, living: 2 } }, '하청 단가 인하'),
    k(and(saver, adult), '펀드 수익률이 반토막 나 계좌를 닫았다.', { money: { assets: -500 }, stats: { happiness: -1 } }, '펀드 손실'),
    k(mort, '변동금리 대출 이자가 올라 생활비를 줄였다.', { issues: { living: 5, housing: 2 } }, '대출 이자 상승'),
    k(self, '손님이 줄어 가게 문을 일찍 닫는 날이 늘었다.', { issues: { living: 4 } }, '소비 위축'),
    k(seek, '채용 공고가 반으로 줄었다.', { issues: { job: 5 } }, '채용 축소'),
    k(col, '졸업을 미루고 스펙을 더 쌓기로 했다.', { issues: { job: 4, edu: 2 } }, '졸업 유예'),
    k(pubW, '공무원 시험 경쟁률이 치솟았다는 소식을 들었다.', { issues: { fairness: 2 } }, '안정 직장 쏠림'),
    g('월급 동결 소식에 외식을 줄였다.', { issues: { living: 3 } }, '금융위기'),
  ],
  'era.2008.ltc': [
    k(and(elderP, sick), '부모님 요양 등급 신청서를 냈다.', { issues: { care: -4 } }, '장기요양보험'),
    k(elderP, '부모님 방문 요양 서비스 안내를 받았다.', { issues: { care: -3 } }, '장기요양보험'),
    k(age(65, 200), '요양 등급 판정 조사원이 집에 다녀갔다.', { issues: { care: -3, medical: -2 } }, '장기요양 등급'),
    k(emp, '월급 명세서에 장기요양보험료가 새로 붙었다.', { issues: { living: 2 } }, '보험료 신설'),
    g('요양보호사라는 직업이 생겼다.', { issues: { care: -2 } }, '장기요양보험'),
  ],
  'era.2010.smartphone': [
    k(or(col, young), '지하철에서 다들 화면을 쓸어 넘기기 시작했다.', { issues: { tech: -2 } }, '스마트폰 확산'),
    k(and(adult, age(50, 200)), '새 전화기 사용법을 배우느라 애를 먹었다.', { issues: { tech: 4 } }, '디지털 적응'),
    k(self, '가게 홍보를 새 방식으로 해야 하나 고민했다.', { issues: { tech: 3 } }, '판매 방식 변화'),
    k(teen, '친구들 대화에 끼려면 새 전화기가 필요했다.', { issues: { fairness: 2 } }, '기기 격차'),
    g('터치 화면 전화기 광고가 쏟아졌다.', { issues: { tech: 2 } }, '스마트폰'),
  ],
  'era.2013.childcare': [
    k(hasKid(0, 5), '어린이집 보육료 부담이 크게 줄었다.', { issues: { care: -4, living: -2 } }, '무상보육'),
    k(and(partner, age(25, 39)), '아이 키울 엄두가 조금은 났다.', { issues: { care: -2 } }, '보육 지원'),
    k(hasKid(0, 5), '어린이집 대기 순번은 여전히 길었다.', { issues: { care: 2 } }, '보육 시설 부족'),
    g('0~5세 보육료 전면 지원 소식이 나왔다.', { issues: { care: -2 } }, '무상보육'),
  ],
  'era.2014.sewol': [
    k(hasKid(10, 19), '수학여행 가는 아이를 배웅하며 손을 오래 잡았다.', { issues: { care: 3 } }, '안전 불안'),
    k(teen, '수학여행 일정이 바뀌었다는 안내를 받았다.', { issues: { conflict: 2 } }, '수학여행 변경'),
    k(adult, '노란 리본을 가방에 달았다.', { issues: { conflict: 2 } }, '추모'),
    g('사회 전체가 오래 슬픔에 잠겼다.', { issues: { conflict: 3 } }, '세월호 참사'),
  ],
  'era.2014.basic.pension': [
    k(elderP, '부모님 통장에 기초연금이 들어왔다.', { issues: { care: -2 } }, '기초연금'),
    k(age(65, 200), '매달 받는 기초연금으로 약값을 냈다.', { issues: { medical: -2 } }, '기초연금'),
    g('국민연금과 연계한 감액 논란도 있었다.', { issues: { fairness: 2 } }, '기초연금 도입'),
  ],
  'era.2015.mers': [
    k(sick, '다니던 병원 진료가 미뤄졌다.', { issues: { medical: 4 } }, '메르스 진료 차질'),
    k(hasKid(3, 12), '아이 학교가 휴업해 돌봄을 구하느라 애먹었다.', { issues: { care: 3 } }, '휴업 돌봄'),
    k(self, '손님이 끊겨 매출이 크게 줄었다.', { issues: { living: 3 } }, '감염병 매출 감소'),
    g('마스크를 쓰고 병원 출입을 피했다.', { issues: { medical: 2 } }, '메르스'),
  ],
  'era.2016.candle': [
    k(or(col, young), '주말마다 광장 촛불 행렬에 섞였다.', { issues: { conflict: 2, fairness: -2 } }, '촛불집회'),
    k(and(adult, age(55, 200)), '식구들과 정치 얘기로 의견이 갈렸다.', { issues: { conflict: 3 } }, '세대 갈등'),
    k(teen, '친구들과 시국 얘기를 나눴다.', { issues: { conflict: 2 } }, '촛불 정국'),
    g('주말마다 광장 소식이 이어졌다.', { issues: { conflict: 2 } }, '촛불집회'),
  ],
  'era.2017.impeach': [
    k(adult, '조기 대선 투표소에 줄을 섰다.', { issues: { conflict: -2 } }, '조기 대선'),
    k(teen, '헌법재판소 선고 생중계를 교실에서 봤다.', { stats: { intellect: 1 } }, '탄핵 선고'),
    g('탄핵 결정 생중계를 지켜봤다.', { issues: { conflict: 2 } }, '탄핵 결정'),
  ],
  'era.2020.covid': [
    k(self, '영업 제한으로 매출이 반토막 나 대출을 알아봤다.', { issues: { living: 6 }, money: { assets: -300 } }, '영업 제한'),
    k(nonreg, '근무 일수가 줄어 월급이 쪼그라들었다.', { issues: { job: 5, living: 3 } }, '코로나 고용 충격'),
    k(emp, '재택근무와 출근을 번갈아 했다.', { stats: { leisure: 1, relations: -1 } }, '재택근무'),
    k(seek, '면접이 줄줄이 취소됐다.', { issues: { job: 5 } }, '채용 중단'),
    k(stg('elem', 'middle', 'high'), '화면 너머로 수업을 들었다.', { issues: { edu: 3 }, stats: { relations: -1 } }, '원격 수업'),
    k(col, '캠퍼스 대신 방에서 한 학기를 보냈다.', { stats: { relations: -1 } }, '비대면 강의'),
    k(hasKid(0, 12), '아이 돌봄 공백을 메우느라 휴가를 끌어 썼다.', { issues: { care: 4 } }, '돌봄 공백'),
    k(elderP, '요양원 면회가 막혀 부모님 얼굴을 유리창 너머로 봤다.', { issues: { care: 3 } }, '면회 제한'),
    g('마스크를 사러 약국 앞에 줄을 섰다.', { issues: { medical: 2 } }, '코로나19'),
  ],
  'era.2020.lease.law': [
    k(and(jeonse, adult), '계약갱신청구권을 써서 2년을 더 살 수 있었다.', { issues: { housing: -3 } }, '갱신청구권'),
    k(and(tenant, adult), '새로 구하는 전셋값은 오히려 크게 뛰었다.', { issues: { housing: 4 } }, '신규 전셋값 급등'),
    k(owner, '세입자와 재계약 조건을 두고 말이 오갔다.', { issues: { conflict: 2 } }, '임대차 3법'),
    g('임대차 3법 시행 뉴스가 이어졌다.', { issues: { housing: 2 } }, '임대차 3법'),
  ],
  'era.2021.youngkkeul': [
    k(and(tenant, young), '영끌하면 집을 살 수 있을까 대출 한도를 계산했다.', { issues: { housing: 5, fairness: 3 } }, '영끌 압박'),
    k(and(tenant, adult), '집값이 너무 올라 내 집 꿈을 접었다.', { issues: { housing: 5 } }, '집값 급등'),
    k(and(owner, mort), '집값은 올랐지만 대출 이자가 걱정됐다.', { issues: { living: 2 } }, '고액 대출'),
    k(owner, '집값 오른 얘기를 조심스럽게 했다.', { stats: { wealth: 1 } }, '자산 상승'),
    g('벼락거지라는 말이 유행했다.', { issues: { fairness: 3 } }, '자산 격차'),
  ],
  'era.2022.rates': [
    k(mort, '주택담보대출 이자가 몇 달 새 크게 늘었다.', { issues: { living: 5, housing: 3 } }, '금리 인상'),
    k(credit, '신용대출 금리가 올라 상환 계획을 다시 짰다.', { issues: { living: 4 } }, '금리 인상'),
    k(and(jeonse, debt), '전세대출 이자 때문에 월세가 낫나 계산했다.', { issues: { housing: 3 } }, '전세대출 이자'),
    k(and(self, debt), '사업자 대출 이자가 매출을 갉아먹었다.', { issues: { living: 4 } }, '자영업 대출'),
    g('금리 인상 뉴스가 연일 이어졌다.', { issues: { living: 2 } }, '금리 인상'),
  ],
  'era.2022.itaewon': [
    k(or(young, col), '사람 많은 곳에 가면 출구부터 확인하게 됐다.', { issues: { conflict: 3 } }, '군중 안전'),
    k(hasKid(15, 30), '밤늦게 나가는 아이에게 연락을 자주 했다.', { issues: { care: 2 } }, '안전 불안'),
    g('추모 공간을 지나며 고개를 숙였다.', { issues: { conflict: 2 } }, '이태원 참사'),
  ],
  'era.2023.jeonse.fraud': [
    k(and(jeonse, young), '등기부등본과 보증보험 가입 여부를 몇 번이고 확인했다.', { issues: { housing: 5 } }, '전세사기 불안'),
    k(and(jeonse, adult), '전세금을 돌려받을 수 있을까 밤잠을 설쳤다.', { issues: { housing: 5 }, stats: { happiness: -1 } }, '전세금 반환 불안'),
    k(and(monthly, adult), '전세 대신 월세를 고른 게 다행인가 싶었다.', { issues: { living: 2 } }, '월세 선택'),
    g('전세사기 피해 뉴스가 이어졌다.', { issues: { housing: 3 } }, '전세사기'),
  ],
  'era.2023.energy': [
    k(poor, '난방비 고지서를 보고 보일러를 줄였다.', { issues: { living: 5 }, stats: { health: -1 } }, '난방비 급등'),
    k(self, '전기 요금이 올라 가게 냉난방을 줄였다.', { issues: { living: 4 } }, '전기료 인상'),
    k(and(adult, hasKid(0, 12)), '아이 방 난방만은 줄이지 못했다.', { issues: { living: 3, care: 2 } }, '난방비 부담'),
    g('관리비 고지서에 놀랐다는 얘기가 많았다.', { issues: { living: 3 } }, '에너지 요금'),
  ],
  'era.2024.medical': [
    k(sick, '잡혀 있던 진료와 검사가 몇 달씩 밀렸다.', { issues: { medical: 5 } }, '진료 공백'),
    k(hasKid(0, 10), '아이가 밤에 열이 나 받아 주는 응급실을 찾느라 애먹었다.', { issues: { care: 3, medical: 4 } }, '응급실 공백'),
    k(elderP, '부모님 수술 일정이 미뤄졌다.', { issues: { care: 3, medical: 3 } }, '수술 지연'),
    k(exam, '의대 정원 확대 소식에 입시 전략을 다시 짰다.', { issues: { edu: 3 } }, '의대 증원'),
    g('병원 대기 안내를 기다렸다.', { issues: { medical: 3 } }, '의정 갈등'),
  ],
  'era.2024.martial': [
    k(mil, '부대에 비상이 걸려 밤새 대기했다.', { issues: { conflict: 4 } }, '비상계엄'),
    k(adult, '밤사이 뉴스 속보를 보며 잠을 이루지 못했다.', { issues: { conflict: 3 } }, '비상계엄'),
    k(teen, '다음 날 학교에서 다들 그 얘기뿐이었다.', { issues: { conflict: 2 } }, '계엄 정국'),
    g('국회 앞 소식이 이어졌다.', { issues: { conflict: 3 } }, '비상계엄'),
  ],
  'era.2025.impeach': [
    k(adult, '조기 대선 투표소에 다녀왔다.', { issues: { conflict: -2 } }, '조기 대선'),
    k(teen, '헌법재판소 선고를 교실에서 지켜봤다.', { stats: { intellect: 1 } }, '탄핵 선고'),
    g('파면 결정 생중계를 지켜봤다.', { issues: { conflict: 2 } }, '탄핵 결정'),
  ],
  'era.2025.pension': [
    k(and(work, young), '보험료는 오르는데 받을 때는 어떨지 따져 봤다.', { issues: { fairness: 3 } }, '연금 보험료 인상'),
    k(and(work, age(35, 59)), '보험료율 인상분을 월급 명세서에서 계산해 봤다.', { issues: { living: 2 } }, '연금 보험료 인상'),
    k(self, '지역가입 보험료가 오를 거라는 안내를 받았다.', { issues: { living: 3 } }, '연금 보험료'),
    g('국민연금 개혁 뉴스가 이어졌다.', { issues: { fairness: 2 } }, '국민연금 개혁'),
  ],
  'era.2025.pension.senior': [
    k(retired, '받는 연금이 조금 오른다는 소식에 안도했다.', { issues: { care: -2 } }, '소득대체율 인상'),
    k(work, '일하면서 받는 연금이 깎이지 않을까 따져 봤다.', { issues: { living: 2 } }, '재직자 연금'),
    g('자식 세대 부담 얘기에 마음이 쓰였다.', { issues: { fairness: -2 } }, '연금 개혁'),
  ],
  'era.2026.heat': [
    k(and(self, or(rural, L => /^6/.test(L.job?.code ?? ''))), '폭염에 작물이 타들어 갔다.', { issues: { living: 4, region: 3 } }, '폭염 농작물 피해'),
    k(and(emp, L => /^[789]/.test(L.job?.code ?? '')), '한낮 야외 작업이 중단돼 일정이 밀렸다.', { stats: { health: -1 } }, '폭염 작업 중지'),
    k(age(65, 200), '무더위 쉼터를 찾아 낮 시간을 보냈다.', { issues: { medical: 2 } }, '폭염 건강'),
    k(poor, '에어컨 전기료 걱정에 선풍기로 버텼다.', { issues: { living: 4 }, stats: { health: -1 } }, '냉방비 부담'),
    g('열대야에 잠을 설쳤다.', { issues: { living: 2 } }, '폭염'),
  ],
  'era.2030.aging': [
    k(elderP, '부모님 돌봄을 형제들과 나눌 방법을 의논했다.', { issues: { care: 3 } }, '고령화'),
    k(and(work, age(30, 49)), '내 월급에서 나가는 사회보험료가 또 늘었다.', { issues: { fairness: 2 } }, '부양 부담'),
    k(age(65, 200), '동네에 또래 노인이 부쩍 많아졌다.', { stats: { relations: 1 } }, '초고령사회'),
    g('네 명 중 한 명이 노인이라는 뉴스를 봤다.', { issues: { care: 2 } }, '초고령사회'),
  ],
  'era.2036.aging': [
    k(and(work, age(25, 49)), '부양비 전망 기사에 내 노후를 다시 계산했다.', { issues: { fairness: 3 } }, '부양 부담'),
    k(age(65, 200), '돌봄 서비스 대기 명단에 이름을 올렸다.', { issues: { care: 3 } }, '돌봄 수요'),
    g('일하는 사람 둘이 노인 한 명을 부양한다는 뉴스가 나왔다.', { issues: { fairness: 2 } }, '노년부양비'),
  ],
  'era.2050.aging': [
    k(age(65, 200), '동네 병원과 돌봄 시설이 멀어졌다.', { issues: { care: 3, region: 3 } }, '지역 소멸'),
    k(and(work, age(25, 49)), '세금과 보험료 비중이 커졌다.', { issues: { fairness: 3 } }, '부양 부담'),
    g('빈집과 폐교 소식이 이어졌다.', { issues: { region: 3 } }, '인구 감소'),
  ],
};

// ── 보강 링크: 아이·구직자·직장인 등 흔한 상태에서 이 사건이 닿는 결과(기존 상태별 링크 뒤, 일반 링크 앞에 끼운다)
const kidAll = age(0, 19);
const ERA_EXTRA = {
  'era.1970.saemaeul': [k(kidAll, '새마을 노래가 아침마다 마을 확성기에서 흘러나왔다.', { stats: { relations: 1 } }, '새마을 운동')],
  'era.1973.oil': [k(kidAll, '연탄 아끼라는 말에 방 하나에 식구가 모여 잤다.', { stats: { relations: 1 }, issues: { living: 2 } }, '연료 절약')],
  'era.1974.equalize': [k(age(0, 6), '형 누나들이 중학교 입시 없이 학교에 갔다는 말을 들었다.', { issues: { edu: -2 } }, '평준화')],
  'era.1980.oil': [k(kidAll, '집안 어른들이 물가 얘기로 한숨을 쉬었다.', { issues: { living: 2 } }, '물가 급등'), k(seek, '공장 채용이 끊겨 일자리를 찾기 어려웠다.', { issues: { job: 3 } }, '불황')],
  'era.1980.tutor.ban': [k(kidAll, '동네 과외방 간판이 하나둘 내려갔다.', { issues: { edu: -2 } }, '과외 금지'), k(seek, '과외 아르바이트 자리가 사라졌다.', { issues: { job: 2 } }, '과외 금지')],
  'era.1981.quota': [k(kidAll, '대학생 형 누나가 늘었다는 얘기를 들었다.', { issues: { edu: -2 } }, '대학 정원 확대'), k(mil, '복학하면 졸업이 어렵다는 말을 들었다.', { issues: { edu: 2 } }, '졸업정원제')],
  'era.1987.june': [k(age(7, 19), '거리 최루탄 냄새에 눈물을 흘리며 하굣길을 걸었다.', { issues: { conflict: 2 } }, '시위 정국'), k(seek, '시위 행렬 옆을 지나 면접장에 갔다.', { issues: { conflict: 2 } }, '시위 정국')],
  'era.1988.olympics': [k(kidAll, '올림픽 마스코트 학용품을 자랑했다.', { stats: { happiness: 1 } }, '서울올림픽'), k(seek, '올림픽 경기장 안내 일을 구했다.', { issues: { job: -2 } }, '올림픽 일자리')],
  'era.1988.house.boom': [k(kidAll, '어른들이 집값 얘기를 할 때마다 표정이 굳었다.', { issues: { housing: 2 } }, '집값 급등'), k(seek, '독립은커녕 하숙비도 올랐다.', { issues: { housing: 3 } }, '임대료 상승')],
  'era.1993.realname': [k(kidAll, '어른들이 은행 통장을 정리하러 다녀왔다.', { issues: { fairness: -2 } }, '금융실명제'), k(seek, '정직하게 살면 된다는 말이 와닿았다.', { issues: { fairness: -2 } }, '금융실명제')],
  'era.1994.csat': [k(kidAll, '형 누나들이 새 시험 문제집을 펼쳐 놓았다.', { issues: { edu: 2 } }, '수능 도입'), k(emp, '입사 시험도 바뀌냐는 농담이 회사에 돌았다.', { stats: { relations: 1 } }, '수능 도입'), k(seek, '수능 과외 아르바이트 자리가 늘었다.', { issues: { job: -2 } }, '입시 수요')],
  'era.1994.bridge': [k(age(7, 19), '학교에서 안전 교육 시간이 늘었다.', { issues: { conflict: 2 } }, '안전 교육'), k(seek, '출퇴근 다리 얘기에 서울 생활이 겁이 났다.', { issues: { conflict: 2 } }, '시설 안전'), k(emp, '회사 건물 안전 점검 공지가 붙었다.', { issues: { conflict: 2 } }, '안전 점검')],
  'era.1995.sampoong': [k(kidAll, '사람 많은 건물에 갈 때 어른 손을 꼭 잡았다.', { issues: { conflict: 2 } }, '건물 붕괴 불안'), k(emp, '회사 건물 균열 얘기가 나와 점검을 받았다.', { issues: { conflict: 2 } }, '안전 점검'), k(seek, '부실 공사 뉴스에 세상이 원망스러웠다.', { issues: { fairness: 2 } }, '부실 공사')],
  'era.1996.colleges': [k(emp, '사내 대학 진학 얘기가 나왔다.', { issues: { edu: -2 } }, '대학 확대'), k(seek, '늦깎이로 대학에 가 볼까 생각했다.', { issues: { edu: -2 } }, '대학 확대'), k(kidAll, '대학은 다 가는 곳이라는 말을 들었다.', { issues: { edu: 2 } }, '대학 진학 보편화')],
  'era.2000.pharm': [k(seek, '감기약 하나 받으려 병원부터 들렀다.', { issues: { medical: 2 } }, '의약분업'), k(kidAll, '감기에 걸려 병원과 약국을 두 번 들렀다.', { issues: { medical: 2 } }, '의약분업'), k(emp, '점심시간에 병원과 약국을 오가느라 바빴다.', { stats: { leisure: -1 } }, '의약분업')],
  'era.2000.tutor.legal': [k(seek, '과외 아르바이트로 생활비를 벌었다.', { issues: { job: -2 } }, '과외 합법화'), k(emp, '자녀 학원비 얘기가 동료들 대화를 채웠다.', { issues: { edu: 2 } }, '사교육비')],
  'era.2003.card': [k(seek, '카드 발급 권유가 끊겨 오히려 다행이다 싶었다.', { issues: { fairness: 2 } }, '카드 규제'), k(emp, '월급 압류 얘기가 회사에 돌았다.', { issues: { living: 2 } }, '카드 빚')],
  'era.2003.subway': [k(seek, '지하철을 탈 때 비상구 위치부터 살폈다.', { issues: { conflict: 2 } }, '지하철 안전')],
  'era.2004.fiveday': [k(seek, '주말에 문 여는 가게 아르바이트 자리가 늘었다.', { issues: { job: -2 } }, '주말 일자리')],
  'era.2010.smartphone': [k(emp, '업무 연락이 퇴근 뒤까지 따라왔다.', { stats: { leisure: -1 }, issues: { tech: 2 } }, '상시 연결'), k(seek, '구직 정보를 전화기로 찾아봤다.', { issues: { tech: -2 } }, '모바일 구직')],
  'era.2013.childcare': [k(emp, '동료들 사이 보육료 지원 얘기가 오갔다.', { issues: { care: -2 } }, '무상보육'), k(self, '아이 키우는 손님들 얘기에 보육 지원 소식을 들었다.', { issues: { care: -2 } }, '무상보육'), k(elderP, '손주 돌봄 부담이 조금 줄었다는 말을 들었다.', { issues: { care: -2 } }, '보육 지원')],
  'era.2014.basic.pension': [k(emp, '내 연금과 기초연금 관계를 따져 봤다.', { issues: { fairness: 2 } }, '연금 연계')],
  'era.2015.mers': [k(emp, '회사가 출장과 회식을 줄였다.', { issues: { medical: 2 } }, '감염 예방')],
  'era.2016.candle': [k(emp, '퇴근길에 광장 촛불을 지나쳤다.', { issues: { conflict: 2 } }, '촛불집회'), k(self, '집회 날마다 광장 주변 손님이 늘었다.', { stats: { wealth: 1 } }, '집회 특수')],
  'era.2022.itaewon': [k(emp, '회사 핼러윈 행사가 취소됐다.', { issues: { conflict: 2 } }, '추모 분위기'), k(self, '연말 모임 예약이 줄줄이 취소됐다.', { issues: { living: 2 } }, '소비 위축')],
  'era.2022.rates': [k(emp, '동료들 대출 이자 얘기에 점심 대화가 무거웠다.', { issues: { living: 2 } }, '금리 인상'), k(saver, '예금 이자가 올라 적금을 새로 들었다.', { issues: { living: -2 } }, '고금리 예금')],
  'era.2023.jeonse.fraud': [k(emp, '동료가 전세금을 못 돌려받았다는 얘기를 들었다.', { issues: { housing: 3 } }, '전세사기 확산'), k(owner, '세입자 보증보험 가입을 확인했다.', { issues: { conflict: 2 } }, '임대인 검증')],
  'era.2023.energy': [k(emp, '사무실 난방 온도가 낮아졌다.', { issues: { living: 2 } }, '에너지 절약')],
  'era.2026.heat': [k(emp, '출퇴근길 폭염에 지쳐 퇴근 후엔 쓰러지듯 잤다.', { stats: { health: -1 } }, '폭염')],
  'era.2036.aging': [k(emp, '회사 정년 연장 논의 소식을 들었다.', { issues: { job: 2 } }, '정년 연장')],
  'era.2025.pension': [k(emp, '연금 개혁안을 두고 동료들과 계산기를 두드렸다.', { issues: { fairness: 2 } }, '연금 개혁')],
};
for (const [id, extra] of Object.entries(ERA_EXTRA)) ERA_LINKS_MAP[id].splice(ERA_LINKS_MAP[id].length - 1, 0, ...extra);
