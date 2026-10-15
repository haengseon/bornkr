import { X, E, tr, ev, ch } from '../jobs-kit.js';
export default [
  X('74010', {
    entry: [
      E('hire', { minEdu: 'high', ages: [18, 55], p: 0.4, text: '금형 공장에서 연마와 조립 보조로 일을 시작했다.' }),
      E('self', { minEdu: 'high', ages: [32, 60], p: 0.06, text: '금형 제작 소규모 공방을 열어 주문을 받았다.' }),
    ],
    transitions: [tr('74050', [24, 58], 4, 0.04, '판금 일로 이동'), tr('74069', [24, 55], 3, 0.03, '용접 일로 이동'), tr('75320', [26, 58], 4, 0.04, '공업기계 정비로 이동')],
    events: [
      ev('74010', 'tolerance_pass', [24, 62], 0.12, '공차 0.01 안에 가공이 들어와 검사에서 한 번에 통과했다.', 'happiness+2 intellect+1', '정밀 가공'),
      ev('74010', 'cad_shift', [26, 62], 0.11, '설계 도면이 3D로 바뀌며 새 프로그램을 따로 배워야 했다.', 'intellect+2 leisure-2 tech+1', '설계 방식 변화', { years: [2000, 2060] }),
      ch('74010', 'rush_order', [26, 62], 0.1, '거래처가 납기를 일주일 당겨 달라고 한다.', '어떻게 할까?', [
        ['night', '야근으로 맞춘다', 'wealth+3 health-3 leisure-2', '밤을 새워 맞췄다. 거래처 신뢰가 쌓였다.'],
        ['ask', '일정 조정을 요청', 'health+1 wealth-1 relations-1', '무리한 납기는 피했다. 일감이 줄었다.'],
      ], 'ask', '납기 압박'),
      ev('74010', 'overseas_mold', [28, 64], 0.1, '해외 업체가 저가 금형을 내놓아 국내 주문이 줄었다.', 'wealth-3 happiness-1 job+1', '해외 저가 공세', { dark: true, years: [2005, 2060] }),
    ],
    hazard: 1, burnout: 0.05,
  }),
  X('75104', {
    entry: [
      E('hire', { minEdu: 'high', ages: [18, 55], p: 0.4, text: '정비 공장 판금부에서 퍼티와 도장 보조로 일을 배웠다.' }),
      E('self', { minEdu: 'high', ages: [30, 60], p: 0.1, text: '판금·도장 전문 공업사를 열었다.' }),
    ],
    transitions: [tr('75109', [22, 58], 3, 0.04, '일반 정비로 이동'), tr('78361', [24, 58], 3, 0.04, '건물 도장으로 이동'), tr('74050', [24, 55], 3, 0.03, '판금 가공으로 이동')],
    events: [
      ev('75104', 'color_match', [24, 62], 0.12, '오래된 차의 도색을 감쪽같이 맞춰 손님이 놀랐다.', 'happiness+2 relations+1', '색 맞춤'),
      ev('75104', 'insurance_cut', [26, 62], 0.12, '보험사가 수리비를 깎아 견적이 반으로 줄었다.', 'wealth-3 conflict+1 fairness+1', '수리비 삭감', { dark: true }),
      ch('75104', 'parts_choice', [26, 62], 0.11, '손님이 비용을 줄이려 중고 부품을 요청한다.', '어떻게 할까?', [
        ['used', '중고로 시공', 'relations+1 wealth-1 happiness-1', '비용을 줄였다. 품질이 걱정되었다.'],
        ['new', '새 부품을 권유', 'wealth+2 relations-1 happiness+1', '비용은 늘었다. 손님이 한참 고민했다.'],
      ], 'new', '부품 선택'),
      ev('75104', 'paint_fume', [24, 62], 0.1, '도장 부스에서 신너 냄새에 머리가 띵했다.', 'health-3 medical+1', '유기용제 노출', { dark: true }),
    ],
    hazard: 2, burnout: 0.05,
  }),
  X('75107', {
    entry: [
      E('hire', { minEdu: 'high', ages: [18, 55], p: 0.45, text: '카센터에서 오일 교환과 타이어 정비로 일을 익혔다.' }),
      E('self', { minEdu: 'high', ages: [28, 60], p: 0.12, text: '동네 경정비 카센터를 열었다.' }),
    ],
    transitions: [tr('75109', [22, 58], 3, 0.05, '종합 정비로 이동'), tr('75103', [24, 55], 4, 0.04, '전장 정비로 이동'), tr('75291', [22, 55], 3, 0.03, '오토바이 정비로 이동')],
    events: [
      ev('75107', 'regular_customer', [22, 64], 0.12, '단골 손님이 이웃까지 데려와 가게가 분주했다.', 'relations+2 wealth+2', '단골 손님'),
      ev('75107', 'overcharge_rumor', [24, 62], 0.1, '카센터 바가지 소문 때문에 손님이 한동안 줄었다.', 'wealth-2 happiness-2', '불신', { dark: true }),
      ch('75107', 'ev_wave', [26, 62], 0.1, '전기차 손님이 늘어 경정비 단가가 점점 내려간다.', '어떻게 할까?', [
        ['learn', '전기차 교육', 'intellect+2 wealth-1 leisure-2', '교육을 받으며 새 분야에 발을 들였다.'],
        ['stay', '기존 고객 유지', 'happiness+1 wealth-1 job+1', '단골을 지켰다. 일감은 서서히 줄었다.'],
      ], 'learn', '전기차 전환', { years: [2018, 2060] }),
      ev('75107', 'tire_season', [22, 62], 0.12, '겨울 타이어 교체철에 하루 종일 휠을 갈았다. 허리가 아팠다.', 'health-2 wealth+2 leisure-1', '타이어 교체철'),
    ],
    hazard: 2, burnout: 0.05,
  }),
  X('75291', {
    entry: [
      E('hire', { minEdu: 'high', ages: [16, 50], p: 0.4, text: '오토바이 가게에서 청소와 정비 심부름을 하며 배웠다.' }),
      E('self', { minEdu: 'high', ages: [26, 58], p: 0.12, text: '오토바이 수리점을 열어 라이더 단골을 받았다.' }),
    ],
    transitions: [tr('75107', [20, 55], 3, 0.04, '자동차 경정비로 이동'), tr('75292', [20, 58], 3, 0.03, '자전거 정비로 이동'), tr('75299', [24, 58], 4, 0.03, '운송장비 정비로 이동')],
    events: [
      ev('75291', 'delivery_rush', [20, 58], 0.12, '배달 라이더 단골이 몰려 하루 종일 타이어와 체인만 갈았다.', 'wealth+3 leisure-2', '수리 수요', { years: [2012, 2060] }),
      ev('75291', 'accident_repair', [20, 58], 0.1, '사고 난 오토바이를 맡아 프레임 교정에 한참 걸렸다.', 'happiness-1 wealth+1 leisure-1', '사고 수리', { dark: true }),
      ch('75291', 'custom_job', [22, 58], 0.1, '손님이 튜닝을 요청했는데 단속 규정에 걸릴 수 있다.', '어떻게 할까?', [
        ['legal', '규정 안에서 한다', 'happiness+1 relations-1 wealth-1', '합법 범위로만 손을 봤다. 손님은 아쉬워했다.'],
        ['custom', '요청대로 시공', 'wealth+2 relations+1 happiness-2', '기분은 좋았지만 마음 한켠이 찜찜했다.'],
      ], 'legal', '튜닝 요청'),
      ev('75291', 'winter_slump', [22, 60], 0.1, '한겨울엔 오토바이가 줄어 가게가 한산했다.', 'wealth-2 happiness-1', '겨울 비수기', { dark: true }),
    ],
    hazard: 1, burnout: 0.05,
  }),
  X('75343', {
    entry: [
      E('hire', { minEdu: 'high', ages: [18, 55], p: 0.4, text: '지게차 정비소에서 유압 호스와 포크 점검을 배웠다.' }),
      E('self', { minEdu: 'high', ages: [30, 60], p: 0.08, text: '물류창고 출장 지게차 정비 사업을 시작했다.' }),
    ],
    transitions: [tr('75341', [24, 58], 3, 0.04, '크레인 정비로 이동'), tr('75371', [24, 58], 3, 0.04, '굴삭기 정비로 이동'), tr('75349', [26, 60], 4, 0.04, '이동 장비 정비로 이동')],
    events: [
      ev('75343', 'warehouse_visit', [22, 62], 0.12, '물류창고를 돌며 정기 점검을 했다. 현장 담당이 고맙다고 했다.', 'relations+2 wealth+1', '정기 점검'),
      ev('75343', 'hydraulic_leak', [22, 62], 0.1, '유압 오일이 튀어 작업복이 흠뻑 젖었다. 겨우 마쳤다.', 'health-1 happiness-1 wealth+1', '유압 정비', { dark: true }),
      ch('75343', 'unsafe_unit', [24, 62], 0.1, '고객사가 위험한 지게차를 그냥 쓰게 해 달라고 한다.', '어떻게 할까?', [
        ['refuse', '사용 중지 권고', 'happiness+1 relations-2 wealth-2', '거래가 어긋났다. 마음은 편했다.'],
        ['sign', '서명하고 넘긴다', 'wealth+2 relations+1 happiness-3', '넘어가긴 했지만 찜찜했다.'],
      ], 'refuse', '안전 점검'),
      ev('75343', 'ev_forklift', [26, 62], 0.1, '전동 지게차 비중이 늘어 새 배터리 교육을 받았다.', 'intellect+2 leisure-1 tech+1', '전동화', { years: [2012, 2060] }),
    ],
    hazard: 2, burnout: 0.05,
  }),
  X('75371', {
    entry: [
      E('hire', { minEdu: 'high', ages: [18, 55], p: 0.4, text: '중장비 정비소에서 무한궤도와 유압 펌프 점검을 보며 배웠다.' }),
      E('self', { minEdu: 'high', ages: [30, 60], p: 0.1, text: '현장으로 나가는 출장 중장비 정비 사업을 시작했다.' }),
    ],
    transitions: [tr('75379', [24, 58], 3, 0.04, '건설용 기계 정비로'), tr('75343', [22, 58], 3, 0.04, '지게차 정비로 이동'), tr('75372', [26, 58], 4, 0.03, '광업 기계 정비로')],
    events: [
      ev('75371', 'field_repair', [24, 62], 0.12, '현장 한복판에서 굴삭기를 고쳐 작업이 다시 돌아갔다.', 'happiness+2 relations+1', '현장 출동'),
      ev('75371', 'off_season', [26, 64], 0.11, '건설 경기가 식어 장비 가동이 줄고 정비 일감도 줄었다.', 'wealth-3 happiness-1 living+1', '건설 경기', { dark: true }),
      ch('75371', 'on_call', [26, 62], 0.11, '새벽에 장비가 멈췄다는 급한 전화가 왔다.', '나갈까?', [
        ['go', '바로 출동', 'wealth+3 health-2 leisure-2', '긴급 출장비를 받았다. 졸음을 참으며 운전했다.'],
        ['later', '아침에 간다', 'health+1 wealth-1 relations-1', '한숨 잤지만 고객이 서운해했다.'],
      ], 'go', '야간 호출'),
      ev('75371', 'grease_hand', [24, 64], 0.1, '기름때 묻은 손으로 하루 종일 볼트를 풀었다. 손가락 마디가 굵어졌다.', 'health-1 wealth+1', '중장비 정비'),
    ],
    hazard: 2, burnout: 0.05,
  }),
  X('71031', {
    entry: [
      E('hire', { minEdu: 'high', ages: [18, 55], p: 0.4, text: '정육 가공장에서 발골과 포장 라인에 들어가 일을 배웠다.' }),
      E('self', { minEdu: 'high', ages: [28, 60], p: 0.1, text: '정육점을 차려 직접 손질한 고기를 팔았다.' }),
    ],
    transitions: [tr('71039', [24, 58], 3, 0.04, '정육 관련 일로 이동'), tr('71060', [24, 58], 3, 0.04, '도시락 제조로 이동'), tr('71052', [26, 60], 4, 0.03, '반찬 제조로 이동')],
    events: [
      ev('71031', 'holiday_rush', [22, 62], 0.13, '명절 전 주문이 몰려 새벽부터 작업대 앞에 섰다.', 'wealth+3 health-2 leisure-2', '명절 물량'),
      ev('71031', 'cold_room', [22, 62], 0.12, '냉장실을 오가며 일해 손과 무릎이 시리다.', 'health-3 medical+1', '냉장 작업', { dark: true }),
      ch('71031', 'price_surge', [26, 62], 0.11, '원육 가격이 올라 납품 단가와 맞지 않는다.', '어떻게 할까?', [
        ['pass', '가격을 올린다', 'wealth+1 relations-2 happiness-1', '단골 몇이 떠났다. 마진은 지켰다.'],
        ['absorb', '마진을 줄인다', 'relations+1 wealth-3 happiness+1', '단가를 유지했다. 남는 것이 줄었다.'],
      ], 'pass', '원가 상승'),
      ev('71031', 'knife_skill', [24, 64], 0.1, '칼질이 빨라져 손질 시간이 줄었다. 동료가 비법을 물었다.', 'happiness+2 relations+1', '손기술'),
    ],
    hazard: 1, burnout: 0.06,
  }),
  X('71051', {
    entry: [
      E('hire', { minEdu: 'high', ages: [18, 60], p: 0.4, text: '김치 공장에서 절임과 양념 버무리기 라인에 들어갔다.' }),
      E('self', { minEdu: 'high', ages: [30, 62], p: 0.1, text: '김치 가게를 열어 직접 담근 김치를 팔았다.' }),
    ],
    transitions: [tr('71052', [24, 62], 3, 0.05, '밑반찬 제조로 이동'), tr('71060', [24, 60], 3, 0.04, '도시락 제조로 이동'), tr('71099', [26, 62], 4, 0.03, '식품 가공 관련 일로')],
    events: [
      ev('71051', 'gimjang_rush', [22, 64], 0.14, '김장철에는 하루 수천 포기를 버무려 팔이 올라가지 않았다.', 'wealth+3 health-3 leisure-2', '김장철 물량'),
      ev('71051', 'cabbage_price', [24, 64], 0.11, '배추 값이 널뛰어 납품 단가를 맞추기 어려웠다.', 'wealth-3 happiness-1', '원재료 가격', { dark: true }),
      ch('71051', 'imported_cabbage', [26, 62], 0.1, '거래처가 수입 배추로 바꿔 단가를 낮추자고 한다.', '어떻게 할까?', [
        ['domestic', '국산 고수', 'happiness+1 wealth-3 relations+1', '맛은 지켰다. 마진이 줄었다.'],
        ['import', '수입으로 맞춘다', 'wealth+2 happiness-2 conflict+1', '단가는 맞췄다. 맛은 조금 아쉬웠다.'],
      ], 'domestic', '원재료 선택'),
      ev('71051', 'taste_praise', [24, 64], 0.1, '단골이 한 통 더 주문하며 옛날 맛이라고 말해 주었다.', 'happiness+2 relations+1', '단골 칭찬'),
    ],
    hazard: 1, burnout: 0.05,
  }),
  X('71060', {
    entry: [
      E('hire', { minEdu: 'high', ages: [18, 58], p: 0.4, text: '도시락 제조 공장에서 반찬 라인 조리원으로 입사했다.' }),
      E('self', { minEdu: 'high', ages: [28, 60], p: 0.08, text: '도시락 전문점을 열어 사무실 단체 주문을 받았다.' }),
    ],
    transitions: [tr('71052', [24, 60], 3, 0.04, '밑반찬 제조로 이동'), tr('71051', [24, 60], 3, 0.03, '김치 제조로 이동'), tr('71099', [26, 62], 4, 0.03, '식품 가공 관련 일로')],
    events: [
      ev('71060', 'dawn_line', [20, 60], 0.13, '새벽 세 시에 출근해 오전 배송분을 맞췄다.', 'health-2 leisure-2 wealth+1', '새벽 라인'),
      ev('71060', 'hygiene_audit', [24, 62], 0.1, '위생 점검에서 지적이 나와 라인 전체를 다시 소독했다.', 'happiness-1 job-1 conflict+1', '위생 점검', { dark: true }),
      ch('71060', 'big_contract', [26, 60], 0.1, '대형 사업장 단체 급식 납품 제안이 왔다.', '받을까?', [
        ['take', '계약한다', 'wealth+3 leisure-3 health-2', '물량이 크게 늘었다. 일손이 늘 부족했다.'],
        ['small', '소량만 유지', 'leisure+1 wealth-1 happiness+1', '소규모로 유지했다. 성장은 더뎠다.'],
      ], 'small', '단체 납품'),
      ev('71060', 'foreign_mate', [20, 60], 0.1, '외국인 동료가 같은 라인에 들어와 손짓과 번역 앱으로 일을 나눴다.', 'relations+2 intellect+1', '외국인 동료 협업', { years: [2010, 2060] }),
    ],
    hazard: 1, burnout: 0.06,
  }),
  X('71052', {
    entry: [
      E('hire', { minEdu: 'high', ages: [20, 62], p: 0.4, text: '반찬 가게에서 조리와 포장을 맡아 일을 시작했다.' }),
      E('self', { minEdu: 'high', ages: [30, 62], p: 0.12, text: '동네 반찬 가게를 열어 직접 만든 반찬을 팔았다.' }),
    ],
    transitions: [tr('71051', [24, 62], 3, 0.04, '김치 제조로 이동'), tr('71060', [24, 60], 3, 0.04, '도시락 제조로 이동'), tr('71099', [26, 62], 4, 0.03, '식품 가공 관련 일로')],
    events: [
      ev('71052', 'regular_order', [26, 64], 0.12, '맞벌이 부부 단골이 일주일 치 반찬을 정기 주문했다.', 'wealth+2 relations+1 happiness+1', '정기 주문'),
      ev('71052', 'oil_smell', [24, 64], 0.12, '튀김과 볶음 냄새가 옷에 배어 저녁에도 가시지 않았다.', 'health-2 happiness-1', '조리 환경', { dark: true }),
      ch('71052', 'closing_discount', [26, 62], 0.1, '마감 때 남은 반찬을 어떻게 처리할지 정해야 한다.', '어떻게 할까?', [
        ['sale', '마감 할인 판매', 'wealth+1 relations+1 happiness-1', '조금이라도 팔았다. 정가 손님이 서운해했다.'],
        ['donate', '이웃에 나눔', 'happiness+2 wealth-2 relations+1', '남은 반찬을 나누었다. 손해는 났다.'],
      ], 'sale', '재고 처리'),
      ev('71052', 'large_mart', [28, 64], 0.1, '근처 대형 마트에 반찬 코너가 생겨 손님이 줄었다.', 'wealth-3 happiness-1 job+1', '대형 매장', { dark: true }),
    ],
    hazard: 1, burnout: 0.05,
  }),
];
