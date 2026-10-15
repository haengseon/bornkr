import { ev, ch } from '../jobs-kit.js';
export default {
  '61110': [
    ev('61110', 'aging_village', [45, 80], 0.12, '마을 논이 하나둘 묵는다. 모내기철 일손을 구할 사람이 마을에 거의 없다.', 'happiness-2 relations-1 region+3', '농촌 고령화', { dark: true, cd: 4 }),
    ch('61110', 'migrant_hand', [28, 75], 0.1, '모내기철에 이주 노동자 두 사람이 일을 거들어 주겠다고 한다.', '어떻게 할까?', [
      ['hire', '품삯을 주고 맡긴다', 'wealth-1 leisure+2 relations+1 debt+300', '함께 일하며 서로 말과 일하는 법을 배웠다. 모내기가 하루 빨리 끝났다.'],
      ['alone', '가족끼리 해낸다', 'wealth+1 health-2 leisure-2', '식구들이 총출동했다. 인건비는 아꼈지만 허리가 아팠다.']], 'hire', '외국인 노동자와 일하기', { years: [2004, 2100] }),
    ev('61110', 'direct_payment', [30, 80], 0.1, '쌀 직불금이 통장에 들어왔다. 농기계 수리비를 먼저 갚았다.', 'wealth+2 happiness+1 debt-300', '정부 지원', { cd: 4 }),
    ev('61110', 'combine_breakdown', [30, 78], 0.09, '추수 중 콤바인이 멈췄다. 수리를 기다리는 사이 비 소식이 들렸다.', 'wealth-2 happiness-2 leisure-1', '농기계 고장', { dark: true }),
  ],
  '61121': [
    ev('61121', 'return_farmer', [32, 66], 0.1, '귀농 교육을 받은 이웃이 하우스 일을 묻는다. 요령을 알려 주니 고맙다고 했다.', 'relations+2 happiness+2', '귀농인과 이웃', { once: true, years: [2005, 2100] }),
    ev('61121', 'pest_spread', [22, 78], 0.12, '총채벌레가 하우스 안에 번졌다. 방제를 거듭해도 줄지 않는다.', 'wealth-3 health-1 happiness-2 living+2', '병해충 피해', { dark: true }),
    ch('61121', 'worker_house', [28, 70], 0.1, '이주 노동자의 숙소가 비닐하우스라는 말이 돌아 점검이 나온다고 한다.', '어떻게 할까?', [
      ['fix', '숙소를 제대로 고친다', 'wealth-2 relations+2 happiness+1 debt+1500', '컨테이너 숙소를 새로 마련했다. 일하는 사람 표정이 한결 편해졌다.'],
      ['wait', '점검 때까지 둔다', 'wealth+1 relations-2 happiness-2 conflict+2', '비용은 아꼈지만 마음이 편치 않았다. 결국 서둘러 손봤다.']], 'fix', '농촌 노동 환경', { years: [2010, 2100], who: 'self' }),
    ev('61121', 'smart_farm_support', [28, 70], 0.1, '지자체 스마트팜 지원 사업에 선정되어 환기·관수 장비를 달았다.', 'wealth+2 leisure+2 tech+1 intellect+1', '정부 지원', { once: true, years: [2012, 2100] }),
  ],
  '61130': [
    ev('61130', 'harvest_help', [28, 75], 0.13, '수확철 사과 따는 날, 이웃과 이주 노동자 동료가 일손을 보탰다.', 'relations+2 happiness+2 leisure-1', '수확 품앗이', { cd: 3 }),
    ev('61130', 'hail_strike', [22, 80], 0.1, '우박이 쏟아져 열매마다 흠이 났다. 상품 값을 못 받고 가공용으로 넘겼다.', 'wealth-3 happiness-3 living+2', '우박 피해', { dark: true }),
    ch('61130', 'orchard_labor', [45, 80], 0.1, '가지치기와 적과 일이 힘에 부친다. 일부 과수원을 줄일지 고민이다.', '어떻게 할까?', [
      ['shrink', '면적을 줄인다', 'wealth-2 health+2 happiness-1', '몇 줄을 갈아엎고 다른 작물을 심었다. 몸이 한결 가벼웠다.'],
      ['keep', '그대로 이어 간다', 'wealth+1 health-3 leisure-1', '손이 많이 가는 철마다 병원 신세를 졌다.']], 'keep', '농촌 고령화'),
    ev('61130', 'fruit_label', [28, 75], 0.1, '품평회에서 우리 과일이 당도 상위로 꼽혔다. 소포 주문이 이어졌다.', 'wealth+2 happiness+3 relations+1', '솜씨 인정', { once: true }),
  ],
  '61320': [
    ev('61320', 'calf_price', [24, 78], 0.12, '송아지 값이 올라 시장에서 평소보다 잘 쳐 받았다.', 'wealth+3 happiness+1', '송아지값 상승', { cd: 4 }),
    ch('61320', 'young_return', [50, 80], 0.1, '도시에 간 자식이 축사를 이어받겠다고 연락해 왔다.', '어떻게 할까?', [
      ['teach', '일을 가르쳐 준다', 'relations+2 happiness+2 leisure-1 wealth-1', '함께 새벽 급이를 했다. 서툴렀지만 소가 낯을 덜 가렸다.'],
      ['sell', '정리를 권한다', 'relations-1 happiness-1 wealth+1 leisure+2', '힘든 일이라 말렸다. 서운함이 남았지만 몸은 편해졌다.']], 'teach', '귀농과 농촌 후계', { years: [2000, 2100] }),
    ev('61320', 'barn_fire_scare', [24, 78], 0.09, '축사 전기 합선으로 불이 날 뻔했다. 급히 껐다. 사고는 피했지만 가슴이 뛰었다.', 'happiness-2 health-1 wealth-1', '축사 안전', { dark: true }),
    ev('61320', 'import_beef', [28, 78], 0.1, '수입 소고기 소식에 한우 시세가 흔들렸다. 출하 시점을 두고 며칠 머리를 싸맸다.', 'wealth-2 happiness-2 living+2', '시장 가격 변동', { dark: true, cd: 4 }),
  ],
  '63011': [
    ev('63011', 'young_fish_deal', [24, 70], 0.11, '치어 공급 업체가 우량 개체를 먼저 챙겨 주었다. 올해는 폐사가 적다.', 'wealth+2 happiness+2 relations+1', '거래 신뢰', { cd: 4 }),
    ev('63011', 'diving_ache', [35, 70], 0.11, '그물을 걷고 사료를 푸다 어깨와 허리를 다쳐 쉬었다. 일손을 구하기 쉽지 않다.', 'health-3 wealth-1 leisure+1', '양식 작업 부담', { dark: true }),
    ch('63011', 'foreign_deck', [24, 66], 0.1, '선원 출신 이주 노동자가 양식장 일을 맡고 싶다고 한다. 말이 서툴러 걱정이다.', '어떻게 할까?', [
      ['train', '시간을 들여 가르친다', 'wealth-1 relations+2 intellect+1 leisure-1', '손짓과 그림으로 일을 알려 주었다. 두 달 뒤 든든한 일손이 되었다.'],
      ['pass', '경험자만 쓴다', 'wealth+1 relations-1 leisure-1', '손발 맞는 사람만 쓰자니 구하기 어려워 몸으로 때웠다.']], 'train', '외국인 노동자와 일하기', { years: [2004, 2100] }),
  ],
  '63021': [
    ev('63021', 'good_catch', [20, 70], 0.12, '그물을 올리니 제철 생선이 가득했다. 위판장에서 값이 잘 나왔다.', 'wealth+3 happiness+2', '대풍 조업', { cd: 4 }),
    ev('63021', 'crew_shortage', [28, 70], 0.11, '배 탈 사람이 없어 외국인 선원과 둘이 나갔다. 일이 고된 만큼 서로 의지가 되었다.', 'health-1 relations+2 leisure-1 wealth+1', '외국인 선원과 일하기', { years: [2004, 2100], cd: 4 }),
    ch('63021', 'fuel_subsidy', [30, 70], 0.1, '조업 구역 제한과 기름값 지원 안내가 같은 날 왔다.', '어떻게 할까?', [
      ['near', '가까운 어장만 다닌다', 'wealth-1 health+1 leisure+1', '멀리 안 나가 몸은 덜 힘들었지만 어획은 줄었다.'],
      ['far', '먼 어장에 도전', 'wealth+2 health-2 leisure-2', '기름을 더 쓰며 멀리 나갔다. 귀항하면 지쳐 쓰러졌다.']], 'near', '정부 지원과 규제'),
    ev('63021', 'engine_trouble', [22, 70], 0.09, '출항 직후 엔진이 꺼졌다. 예인선이 올 때까지 바다 위에서 한참을 기다렸다.', 'wealth-2 happiness-2 health-1', '선박 고장', { dark: true }),
  ],
  '63023': [
    ev('63023', 'catch_share', [30, 80], 0.12, '공동 작업장에서 잡은 것을 나누었다. 선배 해녀가 어린 해녀의 몫을 챙겼다.', 'relations+2 happiness+2', '공동체 나눔', { cd: 3 }),
    ev('63023', 'aging_haenyeo', [55, 82], 0.12, '물질을 하는 사람이 해마다 줄어든다. 같이 들어갈 동료가 늘 같은 얼굴이다.', 'happiness-2 relations-1 region+3', '농어촌 고령화', { dark: true, cd: 4 }),
    ch('63023', 'dive_limit', [45, 80], 0.1, '숨이 예전 같지 않다. 물에 드는 시간을 줄이자는 말이 나왔다.', '어떻게 할까?', [
      ['less', '시간을 줄인다', 'health+2 wealth-2 leisure+1', '짧게 들었다. 수확은 줄었지만 몸은 덜 힘들었다.'],
      ['same', '예전처럼 한다', 'wealth+1 health-3 happiness-1', '평소처럼 들었다. 귀가 먹먹한 날이 늘었다.']], 'less', '고령 해녀'),
    ev('63023', 'heritage_support', [40, 82], 0.1, '해녀 문화 보전 지원금이 나와 장비와 휴게 공간이 새로 마련되었다.', 'wealth+1 happiness+2 relations+1 region-2', '정부 지원', { once: true }),
  ],
};
