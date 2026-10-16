// 게임 전역 어휘. 엔진·콘텐츠·UI가 모두 이 키를 쓴다. 키 이름을 바꾸지 말 것.

export const STATS = [
  { key: 'health', label: '건강', desc: '신체 건강, 치료·회복, 생활 기능' },
  { key: 'intellect', label: '학습', desc: '학습·판단·문제 해결에 쓰이는 인지 자원' },
  { key: 'happiness', label: '행복', desc: '정서적 안정과 일상 만족' },
  { key: 'wealth', label: '재산', desc: '자산·소득·부채를 반영한 경제 완충력' },
  { key: 'relations', label: '관계', desc: '가족·친구·동료·지역사회 연결' },
  { key: 'leisure', label: '여유', desc: '시간·공간·선택권이 남아 있는 정도' },
];

// 성향 5축(0~100). 배경·질병·장애가 성향이나 지력을 결정하지 않는다.
export const TRAITS = [
  { key: 'open', label: '개방성' },
  { key: 'consc', label: '성실성' },
  { key: 'extra', label: '외향성' },
  { key: 'agree', label: '친화성' },
  { key: 'sens', label: '정서 민감성' },
];

// '내 삶에 들어온 뉴스' 체감 지도 10축(0~100, 높을수록 그 이슈를 강하게 겪음). 순위·정치 성향 아님.
export const ISSUES = [
  { key: 'housing', label: '주거 사다리 압박' },
  { key: 'job', label: '일자리 지속 불안' },
  { key: 'edu', label: '교육 기회 격차' },
  { key: 'care', label: '돌봄·부양 부담' },
  { key: 'medical', label: '건강 안전망 의존' },
  { key: 'fairness', label: '세대·계층 공정성 감각' },
  { key: 'region', label: '지역 지속 가능성' },
  { key: 'tech', label: '기술 전환 노출' },
  { key: 'conflict', label: '사회 갈등 피로' },
  { key: 'living', label: '기후·생활비 민감도' },
];

export const STAT_KEYS = STATS.map(s => s.key);
export const TRAIT_KEYS = TRAITS.map(t => t.key);
export const ISSUE_KEYS = ISSUES.map(i => i.key);

// 생애 구간과 현실 시간 예산(합 13분). 결산·공유 2분은 별도.
export const STAGES = [
  { id: 'early', label: '영유아기', from: 0, to: 6, budgetMs: 60_000 },
  { id: 'school', label: '학령기', from: 7, to: 18, budgetMs: 180_000 },
  { id: 'youth', label: '청년기', from: 19, to: 34, budgetMs: 240_000 },
  { id: 'mid', label: '중년기', from: 35, to: 54, budgetMs: 180_000 },
  { id: 'late', label: '노년기', from: 55, to: 120, budgetMs: 120_000 },
];

export const COMPARE_AGES = [7, 19, 29, 42, 55, 70];
export const BASE_YEAR_MS = 15_000;       // 1배속에서 1년 = 현실 15초(고정, 배속으로만 나눈다: 5배속 3초)
export const MIN_YEAR_MS = 1_500;         // 예산 압축 시 하한(1배속 기준)
export const CHOICE_TIMEOUT_MS = 12_000;  // 선택 카운트다운
export const HARD_CAP_MS = Infinity;     // 시간 상한 없음(1년=30초 정책: 1배속 완주는 35~50분이라 15분 상한과 양립 불가)
export const SPEEDS = [1, 2, 3, 4, 5];

// 시간 지평선: 이 해를 넘는 이야기는 없다(먼 미래 추정은 현실성이 떨어진다). 1985년생은 2050년에 65세.
export const HORIZON_YEAR = Infinity;   // 2050 이후에도 사망할 때까지 계속 진행한다
export const BIRTH_YEAR_RANGE = [1960, 1985];

// 17개 시도(현재 행정구역 명칭). since: 독립 시도로 출생 통계가 잡힌 첫 해(그 전은 parent로 합산).
export const REGIONS = [
  { key: 'seoul', label: '서울', full: '서울특별시', capital: true },
  { key: 'busan', label: '부산', full: '부산광역시' },
  { key: 'daegu', label: '대구', full: '대구광역시', since: 1981, parent: 'gyeongbuk' },
  { key: 'incheon', label: '인천', full: '인천광역시', capital: true, since: 1981, parent: 'gyeonggi' },
  { key: 'gwangju', label: '광주', full: '광주광역시', since: 1986, parent: 'jeonnam' },
  { key: 'daejeon', label: '대전', full: '대전광역시', since: 1989, parent: 'chungnam' },
  { key: 'ulsan', label: '울산', full: '울산광역시', since: 1997, parent: 'gyeongnam' },
  { key: 'sejong', label: '세종', full: '세종특별자치시', since: 2012, parent: 'chungnam' },
  { key: 'gyeonggi', label: '경기', full: '경기도', capital: true },
  { key: 'gangwon', label: '강원', full: '강원특별자치도' },
  { key: 'chungbuk', label: '충북', full: '충청북도' },
  { key: 'chungnam', label: '충남', full: '충청남도' },
  { key: 'jeonbuk', label: '전북', full: '전북특별자치도' },
  { key: 'jeonnam', label: '전남', full: '전라남도' },
  { key: 'gyeongbuk', label: '경북', full: '경상북도' },
  { key: 'gyeongnam', label: '경남', full: '경상남도' },
  { key: 'jeju', label: '제주', full: '제주특별자치도' },
];

// 민감 사건 분류. 이 값이 붙은 사건은 비그래픽 문장 + UI가 도움 자원을 먼저 보여 준다.
export const SENSITIVE = ['violence', 'selfharm', 'abuse', 'sexual', 'illness', 'death', 'disaster'];

// 데이터 구분 라벨
export const KINDS = { measured: '통계', projected: '전망', estimated: '게임 추정' };

// 금액 단위: 엔진 내부는 2025년 실질 가치 '만원'.
export const MONEY_UNIT = '만원';
