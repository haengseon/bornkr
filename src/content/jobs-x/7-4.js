import { X, E, tr, ev, ch } from '../jobs-kit.js';
export default [
  X('71092', {
    entry: [
      E('hire', { minEdu: 'high', ages: [25, 62], p: 0.3, text: '건강원에서 탕제와 즙 내리는 일을 어깨너머로 배웠다.' }),
      E('self', { minEdu: 'high', ages: [32, 65], p: 0.15, text: '동네 건강원을 열어 즙과 탕을 팔았다.' }),
    ],
    transitions: [tr('71099', [30, 64], 4, 0.04, '식품 가공 일로 이동'), tr('71052', [30, 64], 3, 0.03, '반찬 제조로 이동'), tr('52111', [32, 62], 4, 0.03, '다른 가게로 이동')],
    events: [
      ev('71092', 'chuseok_gift', [28, 66], 0.13, '명절 선물 주문이 몰려 가마솥 앞에서 밤을 새웠다.', 'wealth+3 health-2 leisure-2', '명절 주문'),
      ev('71092', 'regular_elder', [30, 68], 0.11, '단골 어르신이 직접 달인 즙이 몸에 맞는다고 인사했다.', 'happiness+2 relations+2', '단골 인정'),
      ch('71092', 'health_claim', [30, 66], 0.1, '손님이 약효를 강하게 말해 달라고 은근히 요구한다.', '어떻게 말할까?', [
        ['honest', '있는 그대로 설명', 'happiness+1 wealth-2 relations-1', '과장하지 않았다. 판매는 줄었다.'],
        ['nod', '맞장구친다', 'wealth+2 happiness-2 conflict+1', '손님은 만족했지만 마음에 걸렸다.'],
      ], 'honest', '효능 설명'),
      ev('71092', 'steam_work', [26, 66], 0.1, '여름에도 가마 앞에서 땀을 쏟아 탈진한 날이 있었다.', 'health-3 leisure-1', '고열 작업', { dark: true }),
    ],
    hazard: 1, burnout: 0.05,
  }),
  X('71020', {
    entry: [
      E('hire', { minEdu: 'high', ages: [20, 62], p: 0.35, text: '떡집에서 쌀을 불리고 찜기를 돌리는 일부터 배웠다.' }),
      E('self', { minEdu: 'high', ages: [30, 62], p: 0.15, text: '동네 떡집을 열었다.' }),
    ],
    transitions: [tr('71010', [26, 60], 3, 0.04, '제빵 일로 이동'), tr('71052', [28, 62], 3, 0.04, '반찬 제조로 이동'), tr('71099', [28, 62], 4, 0.03, '식품 가공 일로 이동')],
    events: [
      ev('71020', 'event_order', [26, 64], 0.13, '돌잔치와 회갑 단체 주문이 한꺼번에 들어와 새벽부터 쪘다.', 'wealth+3 health-2 leisure-2', '행사 주문'),
      ev('71020', 'rice_price', [26, 64], 0.11, '쌀과 재료 값이 올라 가격 표를 다시 붙였다.', 'wealth-3 happiness-1', '원가 상승', { dark: true }),
      ch('71020', 'trend_menu', [28, 62], 0.1, '젊은 손님을 겨냥해 새 디저트 떡을 내 볼 수 있다.', '시도할까?', [
        ['try', '새 메뉴를 낸다', 'wealth+2 intellect+2 leisure-2', '반응이 갈렸지만 젊은 손님이 늘었다.'],
        ['keep', '전통 그대로', 'happiness+1 wealth-1 relations+1', '단골은 반겼다. 신규 손님은 늘지 않았다.'],
      ], 'try', '메뉴 변화'),
      ev('71020', 'cold_water', [26, 66], 0.1, '겨울 새벽 찬물에 쌀을 씻다 손이 트고 관절이 시렸다.', 'health-2 happiness-1', '찬물 작업', { dark: true }),
    ],
    hazard: 1, burnout: 0.05,
  }),
  X('73021', {
    entry: [
      E('hire', { minEdu: 'high', ages: [18, 55], p: 0.4, text: '가구 공장에서 재단과 조립을 하며 일을 배웠다.' }),
      E('self', { minEdu: 'high', ages: [30, 62], p: 0.1, text: '맞춤 가구 공방을 열어 주문 제작을 받았다.' }),
    ],
    transitions: [tr('73022', [26, 62], 3, 0.04, '가구 수리로 이동'), tr('78244', [24, 58], 3, 0.04, '내장 목공으로 이동'), tr('73019', [26, 62], 4, 0.03, '목제품 제조로 이동')],
    events: [
      ev('73021', 'custom_desk', [24, 64], 0.12, '손님이 부탁한 원목 책상이 완성되자 오래 쓰겠다며 사진을 보내왔다.', 'happiness+2 relations+1', '주문 제작'),
      ev('73021', 'cheap_import', [26, 64], 0.12, '저가 조립 가구가 퍼져 공방 주문이 줄었다.', 'wealth-3 happiness-1 job+1', '저가 가구', { dark: true }),
      ch('73021', 'online_sale', [28, 62], 0.11, '온라인 판매를 시작할지 고민이다.', '어떻게 할까?', [
        ['online', '온라인 판매', 'wealth+2 leisure-2 intellect+1', '주문이 늘었다. 포장과 배송에 시간이 들었다.'],
        ['shop', '매장 주문만', 'happiness+1 leisure+1 wealth-2', '느리지만 내 방식대로 일했다.'],
      ], 'online', '판로 선택', { years: [2005, 2060] }),
      ev('73021', 'sawdust', [24, 64], 0.1, '톱밥 먼지가 심해 호흡기가 불편해 병원을 찾았다.', 'health-2 medical+1', '분진 노출', { dark: true }),
    ],
    hazard: 1, burnout: 0.05,
  }),
  X('73040', {
    entry: [
      E('hire', { minEdu: 'high', ages: [18, 55], p: 0.4, text: '간판 제작소에서 시트 컷팅과 조명 배선을 배웠다.' }),
      E('self', { minEdu: 'high', ages: [28, 60], p: 0.1, text: '간판 가게를 열어 상가 주문을 받았다.' }),
    ],
    transitions: [tr('76223', [26, 58], 4, 0.02, '조명 설치로 이동'), tr('78370', [24, 58], 4, 0.03, '새시 설치로 이동'), tr('79999', [28, 62], 5, 0.03, '기능 일반으로 이동')],
    events: [
      ev('73040', 'new_shop_sign', [24, 62], 0.12, '개업하는 가게에 간판을 달아 주자 사장님이 함께 사진을 찍자고 했다.', 'happiness+2 relations+1', '개업 간판'),
      ev('73040', 'ladder_work', [24, 62], 0.12, '사다리 위에서 큰 간판을 달다 팔이 저렸다.', 'health-2 happiness-1', '고소 설치', { dark: true }),
      ch('73040', 'led_shift', [26, 62], 0.1, '채널 간판 주문이 줄고 LED 간판 요청이 늘었다.', '어떻게 할까?', [
        ['led', 'LED로 바꾼다', 'intellect+2 wealth+1 leisure-2', '장비를 바꾸며 시간을 썼다. 주문이 이어졌다.'],
        ['classic', '기존 방식 유지', 'happiness+1 wealth-2 job+1', '손맛은 지켰다. 일감이 줄었다.'],
      ], 'led', '간판 기술 변화'),
      ev('73040', 'slow_commercial', [28, 64], 0.1, '상권이 죽어 간판 교체 주문이 거의 사라졌다.', 'wealth-3 happiness-1 living+1', '상권 침체', { dark: true }),
    ],
    hazard: 2, burnout: 0.05,
  }),
  X('72241', {
    entry: [
      E('hire', { minEdu: 'high', ages: [20, 62], p: 0.3, text: '세탁소 옆 수선 가게에서 재봉틀을 익히며 일을 배웠다.' }),
      E('self', { minEdu: 'high', ages: [28, 65], p: 0.2, text: '동네에 수선 가게를 열었다.' }),
    ],
    transitions: [tr('72249', [28, 62], 3, 0.04, '수선 일로 이동'), tr('72290', [28, 62], 4, 0.03, '의복 제조 일로 이동'), tr('72243', [28, 64], 4, 0.03, '구두 수선으로 이동')],
    events: [
      ev('72241', 'wedding_dress', [28, 64], 0.11, '혼례를 앞둔 손님의 옷을 몸에 맞게 고쳐 주자 눈시울이 붉어졌다.', 'happiness+2 relations+2', '단골 고객'),
      ev('72241', 'eye_strain', [34, 68], 0.12, '작은 바늘땀을 종일 보다 눈이 침침해 안경을 바꿨다.', 'health-2 wealth-1', '눈 피로', { dark: true }),
      ch('72241', 'cheap_fashion', [28, 62], 0.1, '싼 옷은 고치기보다 새로 산다는 손님이 늘었다.', '어떻게 할까?', [
        ['premium', '고급 수선에 집중', 'happiness+1 wealth-1 relations+1', '정장·가죽 수선 위주로 단골을 모았다.'],
        ['volume', '기장 줄임 등 박리다매', 'wealth+2 happiness-2 leisure-2', '건수는 늘었지만 몸이 힘들었다.'],
      ], 'premium', '수선 수요 변화'),
      ev('72241', 'rent_rise', [32, 66], 0.1, '건물 임대료가 올라 가게를 옮길지 고민이 되었다.', 'wealth-3 happiness-2 housing+1', '임대료 상승', { dark: true, who: 'self' }),
    ],
    hazard: 0, burnout: 0.04,
  }),
  X('79920', {
    entry: [
      E('hire', { minEdu: 'high', ages: [20, 58], p: 0.35, text: '방역 업체에서 약제 살포 조수로 일을 익혔다.' }),
      E('self', { minEdu: 'high', ages: [30, 60], p: 0.1, text: '소독·방역 업체를 열어 아파트 단지와 계약했다.' }),
    ],
    transitions: [tr('79919', [26, 60], 3, 0.04, '세정 일로 이동'), tr('79911', [26, 60], 3, 0.03, '배관 세정으로 이동'), tr('79912', [26, 58], 3, 0.03, '외벽 세정으로 이동')],
    events: [
      ev('79920', 'summer_pest', [22, 62], 0.13, '여름철 바퀴·모기 방제 요청이 몰려 하루 여덟 집을 돌았다.', 'wealth+3 health-2 leisure-2', '방제 성수기'),
      ev('79920', 'chemical_mask', [24, 62], 0.11, '약제 냄새가 마스크를 뚫고 올라와 머리가 어지러웠다.', 'health-3 medical+1', '약제 노출', { dark: true }),
      ch('79920', 'complaint_visit', [26, 62], 0.1, '고객이 벌레가 또 나왔다며 재방문을 요구한다.', '어떻게 할까?', [
        ['again', '무료 재방문', 'relations+2 wealth-2 leisure-1', '다시 가서 꼼꼼히 살폈다. 신뢰를 얻었다.'],
        ['explain', '원인을 설명', 'happiness+1 relations-1 wealth+1', '환경 요인을 차분히 설명했다. 불만은 남았다.'],
      ], 'again', '재방문 요청'),
      ev('79920', 'contract_loss', [28, 64], 0.1, '단지 관리소가 바뀌며 방역 계약이 다른 업체로 넘어갔다.', 'wealth-3 happiness-2 job+1', '계약 상실', { dark: true }),
    ],
    hazard: 1, burnout: 0.05,
  }),
  X('77212', {
    entry: [
      E('hire', { minEdu: '2yr', ages: [20, 55], p: 0.35, era: [1996, null], text: '위성방송 설치 협력사에 입사해 안테나와 수신기 설정을 배웠다.' }),
      E('self', { minEdu: '2yr', ages: [28, 58], p: 0.08, era: [1996, null], text: '위성·방송 설치 개인 기사로 일감을 받았다.' }),
    ],
    transitions: [tr('77231', [24, 55], 3, 0.04, '통신 케이블 설치로'), tr('77221', [24, 55], 3, 0.03, '통신장비 수리로 이동'), tr('77190', [24, 55], 3, 0.03, '정보통신기기 수리로')],
    events: [
      ev('77212', 'rooftop_install', [22, 58], 0.12, '옥상 난간에서 안테나 각도를 맞추며 기사 하루를 보냈다.', 'health-1 wealth+1', '옥상 설치'),
      ev('77212', 'per_install_pay', [22, 58], 0.12, '건당 수수료로 받아 비 오는 날은 수입이 비었다.', 'wealth-3 happiness-1 fairness+1', '건당 수수료', { dark: true }),
      ch('77212', 'bundle_target', [24, 58], 0.1, '신규 가입 건수 목표를 채우라는 압박이 늘었다.', '어떻게 할까?', [
        ['push', '권유를 늘린다', 'wealth+2 relations-2 happiness-1', '실적은 올랐다. 고객이 불편해했다.'],
        ['skip', '시공에 집중', 'relations+1 wealth-1 happiness+1', '실적은 낮았다. 불만 접수는 줄었다.'],
      ], 'skip', '가입 목표'),
      ev('77212', 'streaming_shift', [26, 62], 0.1, '인터넷 방송이 퍼지며 위성 설치 건수가 눈에 띄게 줄었다.', 'wealth-3 happiness-1 tech+1', '기술 대체', { dark: true, years: [2012, 2060] }),
    ],
    hazard: 1, burnout: 0.05,
  }),
  X('77231', {
    entry: [
      E('hire', { minEdu: 'high', ages: [20, 55], p: 0.4, text: '통신 공사 협력사에서 케이블 포설과 접속 보조로 일했다.' }),
      E('self', { minEdu: 'high', ages: [30, 58], p: 0.08, text: '통신 케이블 시공 팀을 직접 꾸렸다.' }),
    ],
    transitions: [tr('77232', [22, 55], 3, 0.05, '방송 케이블로 이동'), tr('77222', [24, 55], 3, 0.03, '기지국 설치로 이동'), tr('77233', [22, 55], 3, 0.04, '인터넷 설치로 이동')],
    events: [
      ev('77231', 'pole_work', [22, 55], 0.12, '전신주 위에서 장력을 맞추는 일을 하다 바람이 불어 긴장했다.', 'health-1 happiness-1', '고소 작업', { dark: true }),
      ev('77231', 'storm_restore', [22, 58], 0.12, '태풍 뒤 끊긴 회선을 복구하며 며칠을 밖에서 보냈다.', 'wealth+3 health-3 leisure-3', '재난 복구'),
      ch('77231', 'subcontract_chain', [26, 58], 0.1, '하청이 이어져 일당이 깎인다는 말이 돈다.', '어떻게 할까?', [
        ['talk', '팀으로 협상', 'wealth+1 relations+1 conflict+1', '일당 조건을 조금 올렸다. 눈치가 따랐다.'],
        ['accept', '그냥 일한다', 'wealth+1 happiness-2 leisure+1', '일은 이어졌지만 불만이 쌓였다.'],
      ], 'talk', '하청 단가'),
      ev('77231', 'fiber_upgrade', [24, 60], 0.09, '광케이블 교체 사업이 이어져 석 달치 일감이 확보되었다.', 'wealth+2 happiness+1', '교체 사업', { years: [2000, 2060] }),
    ],
    hazard: 2, burnout: 0.05,
  }),
  X('79121', {
    entry: [
      E('hire', { minEdu: 'high', ages: [18, 55], p: 0.35, text: '귀금속 공방에서 줄질과 땜질을 배우며 세공을 시작했다.' }),
      E('self', { minEdu: 'high', ages: [30, 62], p: 0.2, text: '작은 세공 공방을 열어 주문 제작을 받았다.' }),
    ],
    transitions: [tr('79122', [26, 62], 3, 0.04, '보석 세공으로 이동'), tr('79129', [26, 62], 4, 0.04, '귀금속 일반으로 이동'), tr('79119', [28, 64], 4, 0.03, '공예 일로 이동')],
    events: [
      ev('79121', 'wedding_ring', [24, 64], 0.12, '예비 부부의 반지를 직접 만들어 주고 인사를 받았다.', 'happiness+2 relations+1', '맞춤 반지'),
      ev('79121', 'gold_price', [26, 64], 0.11, '금값이 급등해 재료비 부담이 커졌다.', 'wealth-3 happiness-1', '원자재 가격', { dark: true }),
      ch('79121', 'brand_oem', [28, 62], 0.1, '큰 업체가 대량 하청 제안을 해 왔다.', '어떻게 할까?', [
        ['oem', '하청을 받는다', 'wealth+3 happiness-2 leisure-2', '일감은 안정되었지만 내 디자인은 줄었다.'],
        ['own', '내 작품 고수', 'happiness+2 wealth-2 intellect+1', '손이 가는 작업을 이어갔다. 벌이는 줄었다.'],
      ], 'own', '하청 제안'),
      ev('79121', 'fine_eyes', [34, 66], 0.1, '작은 세공을 오래 해 눈이 피로하고 목이 뻐근했다.', 'health-2 medical+1', '정밀 작업', { dark: true }),
    ],
    hazard: 0, burnout: 0.04,
  }),
  X('79912', {
    entry: [
      E('hire', { minEdu: 'high', ages: [20, 58], p: 0.4, era: [1985, null], text: '외벽 청소 업체에서 로프와 곤돌라 작업 보조로 일을 시작했다.' }),
      E('self', { minEdu: 'high', ages: [30, 60], p: 0.1, era: [1985, null], text: '외벽 청소·유리창 세정 업체를 열었다.' }),
    ],
    transitions: [tr('79919', [24, 58], 3, 0.04, '세정 일로 이동'), tr('78361', [24, 58], 4, 0.03, '도장 일로 이동'), tr('79920', [26, 60], 3, 0.03, '방역 일로 이동')],
    events: [
      ev('79912', 'rope_work', [22, 55], 0.12, '고층 외벽에 로프를 매고 유리를 닦았다. 땅이 아득했다.', 'health-1 happiness-1 wealth+2', '로프 작업', { dark: true }),
      ev('79912', 'spring_clean', [22, 60], 0.12, '봄 청소철에 빌딩 외벽 세정 의뢰가 이어졌다.', 'wealth+3 leisure-2', '청소철 수요'),
      ch('79912', 'wind_day', [22, 56], 0.1, '바람이 센 날인데 계약 기한이 오늘이다.', '작업을 할까?', [
        ['delay', '연기를 요청', 'health+1 wealth-2 relations-1', '일정을 미뤘다. 건물 관리자가 난처해했다.'],
        ['work', '조심하며 진행', 'wealth+2 health-3', '끝냈지만 내내 손에 땀이 났다.'],
      ], 'delay', '강풍 작업'),
      ev('79912', 'drone_clean', [26, 62], 0.09, '드론 세정 장비가 일부 현장에 쓰이며 인력 수요가 조금 줄었다.', 'wealth-2 tech+1 happiness-1', '기술 대체', { dark: true, years: [2018, 2060] }),
    ],
    hazard: 3, burnout: 0.06,
  }),
];
