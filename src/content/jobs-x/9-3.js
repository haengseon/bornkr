import { X, E, tr, ev, ch } from '../jobs-kit.js';
export default [
  X('99231', {
    entry: [
      E('hire', { minEdu: 'none', ages: [30, 76], p: 0.4, era: [1985, null], text: '주차장 관리 업체에 채용되어 요금 정산과 출입을 맡았다.' }),
      E('promote', { from: ['99232'], minYears: 2, ages: [30, 70], p: 0.1, text: '주차 안내 경력으로 주차장 관리 담당이 되었다.' }),
    ],
    transitions: [tr('99232', [30, 72], 1, 0.05, '안내 업무로 이동'), tr('94201', [45, 72], 2, 0.05, '경비 일로 이동'), tr('94209', [40, 72], 3, 0.04, '건물 관리로 이동')],
    events: [
      ev('99231', 'fee_dispute', [30, 76], 0.13, '요금 정산 문제로 운전자가 창문 너머로 큰 소리를 냈다.', 'happiness-2 conflict+1', '요금 분쟁', { dark: true }),
      ev('99231', 'regular_driver', [30, 76], 0.1, '단골 차량 운전자가 매일 인사하고 지나간다. 하루가 조금 가볍다.', 'happiness+2 relations+1', '단골 인사'),
      ch('99231', 'unmanned_plan', [35, 72], 0.1, '무인 정산기를 설치한다는 공지가 붙었다.', '어떻게 할까?', [
        ['learn', '기기 관리도 맡는다', 'intellect+2 tech+1 leisure-2', '기기 점검을 맡았다. 일이 늘었다.'],
        ['move', '다른 자리를 알아본다', 'leisure+1 wealth-2 job-1', '시간은 얻었다. 수입이 비는 달이 있었다.'],
      ], 'learn', '무인 정산 도입', { dark: true, years: [2005, 2060] }),
      ev('99231', 'night_cold', [30, 72], 0.1, '겨울 야간 근무에 부스가 추워 감기에 걸렸다.', 'health-2 medical+1', '한파 근무', { dark: true }),
    ],
    hazard: 1, burnout: 0.04,
  }),
  X('92299', {
    entry: [
      E('platform', { minEdu: 'none', ages: [18, 66], p: 0.3, era: [2012, null], text: '배달 앱에 가입해 주문을 받아 자전거와 이륜차로 배달했다.' }),
      E('hire', { minEdu: 'none', ages: [18, 62], p: 0.3, text: '동네 상점에 소속되어 근거리 배달을 시작했다.' }),
    ],
    transitions: [tr('92230', [20, 55], 2, 0.06, '전업 라이더로 이동'), tr('92220', [22, 55], 2, 0.05, '택배 일로 이동'), tr('92291', [20, 55], 2, 0.05, '음식점 배달로 이동')],
    events: [
      ev('92299', 'short_trip', [18, 62], 0.12, '가까운 주문이 연달아 들어와 점심 시간에 건수를 넉넉히 채웠다.', 'wealth+2 happiness+1', '근거리 연속 주문'),
      ev('92299', 'bad_weather_delivery', [18, 62], 0.12, '눈길에서 자전거가 미끄러졌다. 무릎을 다쳐서 며칠 쉬었다.', 'health-2 wealth-2 medical+1', '악천후 운행', { dark: true }),
      ch('92299', 'minimum_order', [18, 62], 0.1, '단가가 낮은 장거리 주문 알림이 연달아 떴다.', '어떻게 할까?', [
        ['take', '모두 받는다', 'wealth+2 health-2 leisure-1', '건수는 늘었다. 몸이 먼저 지쳤다.'],
        ['pick', '골라서 받는다', 'happiness+1 leisure+1 wealth-1', '여유는 있었다. 하루 수입은 줄었다.'],
      ], 'pick', '주문 선택', { years: [2012, 2060] }),
      ev('92299', 'customer_complaint', [18, 62], 0.1, '음식이 식었다는 항의로 평점이 내려갔다. 배달 앱 노출이 줄었다.', 'happiness-2 wealth-1 conflict+1', '평점 하락', { dark: true, years: [2012, 2060] }),
    ],
    hazard: 3, burnout: 0.07,
  }),
  X('92210', {
    entry: [
      E('exam', { minEdu: 'high', ages: [18, 40], p: 0.1, years: 1, text: '우정직 공무원 시험에 합격해 집배원으로 임용되었다.' }),
      E('hire', { minEdu: 'none', ages: [20, 55], p: 0.2, text: '위탁 계약직으로 우편 집배 업무를 시작했다.' }),
    ],
    transitions: [tr('92220', [25, 58], 3, 0.04, '택배 일로 이동'), tr('94209', [40, 62], 5, 0.03, '건물 관리로 이동'), tr('99211', [35, 62], 3, 0.03, '검침으로 이동')],
    events: [
      ev('92210', 'regular_route', [20, 62], 0.12, '십 년 넘게 도는 구역에서 주민들이 반갑게 우편물을 받는다.', 'happiness+2 relations+1', '구역 정착'),
      ev('92210', 'parcel_surge', [20, 62], 0.12, '택배 물량 증가로 집배 구역이 늘었다. 퇴근 시간이 늦어졌다.', 'wealth+1 leisure-2 health-1', '물량 증가', { dark: true }),
      ch('92210', 'route_change', [25, 62], 0.1, '인력 조정으로 구역이 합쳐질 수 있다는 안내가 있었다.', '어떻게 할까?', [
        ['accept', '넓어진 구역을 받아들인다', 'wealth+1 health-2 job+1', '적응하는 데 몇 달이 걸렸다.'],
        ['request', '배치 조정을 요청한다', 'happiness+1 relations-1 job-1', '조정되었다. 동료와는 서먹해졌다.'],
      ], 'accept', '구역 조정'),
      ev('92210', 'heat_wave', [20, 62], 0.1, '폭염 속에서 오토바이로 돌며 땀에 젖었다. 쉬는 시간이 늘었다.', 'health-2 leisure-1', '폭염 근무', { dark: true }),
    ],
    hazard: 2, burnout: 0.05,
  }),
  X('99920', {
    entry: [
      E('hire', { minEdu: 'none', ages: [25, 72], p: 0.4, text: '세탁소에 들어가 다림질과 포장을 도왔다.' }),
      E('self', { minEdu: 'none', ages: [35, 68], p: 0.15, text: '동네에 작은 세탁소를 열어 직접 일했다.' }),
    ],
    transitions: [tr('93091', [25, 62], 2, 0.05, '포장 일로 이동'), tr('94190', [30, 68], 2, 0.04, '청소 일로 이동'), tr('95110', [35, 70], 2, 0.04, '가사 도우미로 이동')],
    events: [
      ev('99920', 'steam_heat', [25, 72], 0.12, '다리미 증기와 열기에 종일 서 있었다. 다리가 부었다.', 'health-2 leisure-1', '증기와 열기', { dark: true }),
      ev('99920', 'loyal_customer', [25, 72], 0.11, '단골이 얼룩이 사라진 옷을 보고 이웃에게 소문을 냈다.', 'happiness+2 relations+1 wealth+1', '솜씨 인정'),
      ch('99920', 'self_laundry', [30, 68], 0.1, '세탁 편의점과 무인 세탁소가 인근에 생겼다.', '어떻게 할까?', [
        ['pickup', '수거 서비스 시작', 'wealth+2 leisure-2 health-1', '단골이 늘었다. 일이 늘었다.'],
        ['keep', '지금처럼 지킨다', 'happiness+1 wealth-2 leisure+1', '평온했다. 손님이 조금 줄었다.'],
      ], 'pickup', '무인 세탁소 등장', { dark: true, years: [2015, 2060] }),
      ev('99920', 'rent_up', [35, 68], 0.1, '가게 월세가 올라 이익이 줄었다.', 'wealth-3 housing+1', '임대료 상승', { dark: true, who: 'self' }),
    ],
    hazard: 1, burnout: 0.04,
  }),
  X('99992', {
    entry: [
      E('platform', { minEdu: 'none', ages: [25, 68], p: 0.3, era: [2012, null], text: '정리 수납 서비스 업체에 등록해 가정을 방문하기 시작했다.' }),
      E('self', { minEdu: 'none', ages: [28, 65], p: 0.1, era: [2012, null], text: '수납 컨설팅 후기를 모아 개인 서비스를 시작했다.' }),
    ],
    transitions: [tr('95110', [28, 66], 2, 0.05, '가사 도우미로 이동'), tr('94190', [28, 66], 2, 0.05, '청소 일로 이동'), tr('99999', [28, 66], 2, 0.04, '서비스 단순직으로 이동')],
    events: [
      ev('99992', 'closet_makeover', [25, 68], 0.12, '정리를 마친 옷장 사진을 보고 고객이 환하게 웃었다.', 'happiness+3 wealth+1', '정리 후 만족'),
      ev('99992', 'cancel_visit', [25, 68], 0.11, '방문 당일 취소 연락이 와 이동 시간만 헛되었다.', 'wealth-2 happiness-1', '당일 취소', { dark: true }),
      ch('99992', 'review_push', [25, 65], 0.1, '고객이 후기를 높게 써 줄 테니 일을 더 해 달라고 했다.', '어떻게 할까?', [
        ['extra', '더 해 준다', 'relations+2 wealth-1 health-1', '후기가 좋게 남았다. 시간은 더 들었다.'],
        ['limit', '정해진 범위만 한다', 'wealth+1 leisure+1 relations-1', '정해진 일만 했다. 후기는 평범했다.'],
      ], 'limit', '후기 압박'),
      ev('99992', 'booking_rise', [25, 68], 0.1, '입소문으로 예약이 늘었다. 한 달 일정이 채워졌다.', 'wealth+3 happiness+1', '예약 증가'),
    ],
    hazard: 1, burnout: 0.04,
  }),
  X('99130', {
    entry: [
      E('hire', { minEdu: 'none', ages: [20, 72], p: 0.4, text: '어선에 선원 보조로 승선해 그물 정리와 선별을 맡았다.' }),
      E('hire', { minEdu: 'none', ages: [25, 72], p: 0.2, text: '수산물 양식장 일손으로 들어가 사료 주는 일을 했다.' }),
    ],
    transitions: [tr('99110', [25, 70], 3, 0.04, '농사일로 이동'), tr('92119', [22, 62], 2, 0.05, '항만 하역으로 이동'), tr('93091', [22, 62], 2, 0.04, '수산 가공 포장으로 이동')],
    events: [
      ev('99130', 'big_catch', [20, 72], 0.11, '그물에 물고기가 가득 올라왔다. 선장이 일당에 보너스를 얹었다.', 'wealth+3 happiness+2', '풍어'),
      ev('99130', 'rough_sea', [20, 72], 0.11, '풍랑 때문에 이틀간 조업을 쉬었다. 일당도 비었다.', 'wealth-2 happiness-1 leisure+1', '기상 악화', { dark: true }),
      ch('99130', 'foreign_crew', [25, 62], 0.09, '선장이 인력을 줄이고 외국인 선원을 더 쓸 계획이라고 했다.', '어떻게 할까?', [
        ['stay', '남아 있는 자리를 지킨다', 'job-1 happiness+1 wealth+1', '일은 이어졌다. 불안은 남았다.'],
        ['move', '육지 일을 알아본다', 'wealth-2 relations+1 leisure+1', '뭍에서 새 일자리를 구했다. 수입은 줄었다.'],
      ], 'stay', '인력 구조 변화', { dark: true }),
      ev('99130', 'harbor_meal', [20, 72], 0.1, '귀항한 날 동료들과 선술집에서 회를 나누었다.', 'happiness+2 relations+2', '선원들의 저녁'),
    ],
    hazard: 3, burnout: 0.05,
  }),
  X('92242', {
    entry: [
      E('hire', { minEdu: 'none', ages: [18, 65], p: 0.4, text: '신문 지국에 소속되어 새벽에 구독 가정을 돌며 배달했다.' }),
      E('self', { minEdu: 'none', ages: [25, 65], p: 0.1, text: '지국 구역 하나를 맡아 직접 배달을 운영했다.' }),
    ],
    transitions: [tr('92249', [20, 62], 2, 0.05, '정기 배달로 이동'), tr('92241', [20, 62], 2, 0.05, '식음료 정기 배달로 이동'), tr('92291', [20, 55], 1, 0.04, '음식점 배달로 이동')],
    events: [
      ev('92242', 'dawn_route', [18, 65], 0.12, '새벽 네 시에 일어나 오전 일과를 시작하기 전에 배달을 끝냈다.', 'health-1 leisure-1 wealth+1', '새벽 배달'),
      ev('92242', 'subscription_drop', [20, 65], 0.12, '구독 해지 연락이 이어져 맡은 구역 부수가 줄었다.', 'wealth-3 happiness-1 job-1', '구독 감소', { dark: true }),
      ch('92242', 'collect_fee', [25, 65], 0.1, '구독료 수금을 미루는 가정이 늘었다.', '어떻게 할까?', [
        ['visit', '직접 찾아가 받는다', 'wealth+2 relations-1 leisure-1', '대부분 받았다. 방문이 마음 불편했다.'],
        ['wait', '조금 기다려 준다', 'relations+1 wealth-2 happiness+1', '관계는 이어졌다. 정산이 부족했다.'],
      ], 'visit', '수금 지연'),
      ev('92242', 'new_year_gift', [18, 65], 0.1, '새해에 독자가 수고한다며 손으로 쓴 감사 인사를 건넸다.', 'happiness+2 relations+1', '독자 감사'),
    ],
    hazard: 1, burnout: 0.04,
  }),
  X('99910', {
    entry: [
      E('self', { minEdu: 'none', ages: [30, 75], p: 0.5, text: '구두 닦는 작은 부스를 열어 손님 구두를 닦기 시작했다.' }),
      E('hire', { minEdu: 'none', ages: [25, 70], p: 0.1, text: '구두 수선점에서 닦기와 굽 갈이를 배웠다.' }),
    ],
    transitions: [tr('99920', [30, 70], 2, 0.05, '세탁·다림질로 이동'), tr('95399', [30, 68], 2, 0.04, '판매 보조로 이동'), tr('94190', [35, 70], 2, 0.03, '청소 일로 이동')],
    events: [
      ev('99910', 'shine_praise', [25, 75], 0.12, '손님이 거울같이 광이 난다며 다음에도 오겠다고 했다.', 'happiness+2 relations+1', '솜씨 인정'),
      ev('99910', 'sneaker_decline', [30, 75], 0.12, '운동화를 신는 사람이 늘어 구두 손님이 줄었다.', 'wealth-3 happiness-1', '손님 감소', { dark: true }),
      ch('99910', 'moving_kiosk', [30, 70], 0.1, '건물 철거로 부스를 옮겨야 한다는 통보가 왔다.', '어떻게 할까?', [
        ['move', '새 자리를 구한다', 'wealth-2 leisure-1 job+1', '새 자리를 얻었다. 손님이 처음부터 다시 생겼다.'],
        ['quit', '수선 일을 겸한다', 'intellect+1 wealth+1 leisure-2', '굽 교체와 수선을 늘렸다. 일이 늘었다.'],
      ], 'move', '자리 이전', { dark: true }),
      ev('99910', 'regular_gift', [30, 75], 0.1, '명절 전에 단골들이 줄지어 와 평소보다 손님이 몰렸다.', 'wealth+2 happiness+1', '명절 대목'),
    ],
    hazard: 1, burnout: 0.03,
  }),
  X('94121', {
    entry: [
      E('hire', { minEdu: 'none', ages: [30, 72], p: 0.4, text: '버스 차고지에 들어가 차량 내부와 외부를 닦는 일을 맡았다.' }),
      E('hire', { minEdu: 'none', ages: [28, 70], p: 0.2, text: '세차장에 채용되어 손세차와 실내 청소를 했다.' }),
    ],
    transitions: [tr('94122', [30, 68], 2, 0.05, '시설장비 청소로 이동'), tr('94110', [35, 70], 2, 0.05, '건물 청소로 이동'), tr('95310', [25, 60], 2, 0.04, '주유 일로 이동')],
    events: [
      ev('94121', 'winter_wash', [28, 72], 0.12, '한겨울 새벽 세차에 손이 얼어 장갑이 젖었다. 며칠 감기를 앓았다.', 'health-2 medical+1', '한파 작업', { dark: true }),
      ev('94121', 'clean_praise', [28, 72], 0.11, '운전자가 차 안이 깨끗하다며 감사 인사를 남겼다.', 'happiness+2 relations+1', '운전자 인사'),
      ch('94121', 'chemical_choice', [28, 70], 0.1, '강한 세제를 쓰면 얼룩이 빨리 빠지지만 손이 쓰라리다.', '어떻게 할까?', [
        ['strong', '강한 세제를 쓴다', 'job+1 wealth+1 health-2', '작업은 빨라졌다. 손이 거칠어졌다.'],
        ['mild', '순한 세제로 닦는다', 'health+1 leisure-1 job-1', '시간이 더 걸렸다. 손은 편했다.'],
      ], 'mild', '세제 선택'),
      ev('94121', 'schedule_rush', [28, 72], 0.1, '노선 증차로 하루에 닦을 차량 수가 늘었다.', 'wealth+1 health-2 leisure-1', '작업량 증가', { dark: true }),
    ],
    hazard: 2, burnout: 0.05,
  }),
];
