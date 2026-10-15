import { ev, ch } from '../jobs-kit.js';

export default {
  '44110': [
    ev('44110', 'uniform_check', [21, 50], 0.12, '출근 전 복장과 체중, 화장 점검 항목이 새로 붙었다.', 'happiness-2 fairness+1 conflict+1', '외모 규정', { dark: true, cd: 5 }),
    ev('44110', 'rescue_flight', [22, 55], 0.1, '기내에서 쓰러진 승객을 동료와 응급 처치해 무사히 내려 드렸다.', 'happiness+3 intellect+1 relations+1', '기내 응급 대응'),
    ch('44110', 'seniority_bid', [24, 55], 0.12, '다음 달 노선 배정을 고를 수 있다. 장거리는 수당이 더 붙는다.', '어떻게 할까?', [
      ['long', '장거리를 고른다', 'wealth+2 health-2 relations-1', '장거리 노선 수당이 늘었다. 시차가 몸에 남았다.'],
      ['short', '단거리를 고른다', 'leisure+2 relations+1 wealth-1', '집에서 자는 날이 늘었다. 수당은 줄었다.'],
    ], 'short', '노선 배정'),
  ],
  '44292': [
    ev('44292', 'drunk_round', [20, 58], 0.14, '반말과 신체 접촉이 섞인 라운드가 이어졌다. 웃으며 넘기는 데 지쳤다.', 'happiness-3 relations-1 fairness+1', '진상 손님', { dark: true, cd: 3 }),
    ev('44292', 'repeat_booking', [20, 60], 0.12, '단골 팀이 이번 달 내내 나를 지명했다. 라운드 일정이 빈틈없이 찼다.', 'wealth+2 happiness+2 relations+1', '단골 지명'),
    ch('44292', 'cart_golf', [22, 58], 0.1, '골프장이 카트 이용 방식을 늘려 캐디 동반 라운드가 줄었다.', '어떻게 할까?', [
      ['wait', '배정을 기다린다', 'wealth-2 health+1 leisure+1', '배정을 기다리며 쉬는 날이 늘었다. 수입은 줄었다.'],
      ['move', '다른 골프장을 찾는다', 'wealth+1 relations-2 health-1', '다른 골프장으로 옮겼다. 동료들과 처음부터 얼굴을 익혔다.'],
    ], 'wait', '카트 위주 전환', { once: true, years: [2010, 2100] }),
  ],
  '45110': [
    ev('45110', 'wage_gap', [22, 65], 0.1, '설 연휴 특근 수당을 빼고 월급이 나왔다. 주방 분위기가 가라앉았다.', 'wealth-2 happiness-2 fairness+2', '수당 누락', { dark: true, who: 'wage', cd: 5 }),
    ev('45110', 'regular_review', [24, 68], 0.1, '단골이 가게 후기에 우리 집 맛을 길게 적어 줬다.', 'happiness+3 wealth+1', '단골 후기'),
    ch('45110', 'rent_notice', [28, 68], 0.12, '건물이 팔려 월세를 크게 올리겠다는 통보가 왔다.', '어떻게 할까?', [
      ['stay', '가격을 올리고 버틴다', 'wealth-1 relations-1 housing+1', '메뉴 값을 올렸다. 몇몇 단골이 발길을 줄였다.'],
      ['move', '가게를 옮긴다', 'wealth-2 leisure-2 happiness+1 debt+1500', '조금 외진 곳으로 옮겼다. 이전 비용이 만만치 않았다.'],
    ], 'stay', '임대료 인상', { who: 'self', dark: true }),
  ],
  '45150': [
    ev('45150', 'allergy_alert', [23, 65], 0.1, '알레르기 표기 확인 절차가 강화돼 식단표를 다시 대조했다.', 'intellect+1 leisure-1 happiness-1', '알레르기 확인', { once: true }),
    ev('45150', 'burn_steam', [23, 65], 0.13, '대형 솥 증기에 팔을 데어 이틀 쉬었다.', 'health-2 happiness-1', '조리 중 화상', { dark: true, cd: 3 }),
    ch('45150', 'contract_bid', [28, 65], 0.1, '위탁업체가 바뀐다. 근무 조건을 새 업체와 다시 맺어야 한다.', '어떻게 할까?', [
      ['rehire', '새 업체와 계약한다', 'wealth-1 relations+1 job+1', '새 업체와 다시 계약했다. 연차와 수당은 처음부터 계산됐다.'],
      ['seek', '다른 급식실을 찾는다', 'wealth-1 leisure+1 happiness-1', '다른 급식실을 찾아 면접을 봤다. 몇 주가 비었다.'],
    ], 'rehire', '위탁업체 변경', { who: 'wage', once: true, dark: true }),
  ],
  '45211': [
    ev('45211', 'latte_art', [18, 55], 0.1, '라테 아트를 처음으로 손님 앞에서 제대로 그렸다. 박수를 받았다.', 'happiness+3 intellect+1', '솜씨 인정', { once: true }),
    ev('45211', 'rent_cafe_close', [26, 58], 0.1, '골목에 같은 카페가 세 곳 더 생겼다. 단골 발길이 나뉘었다.', 'wealth-3 happiness-2', '경쟁 카페 증가', { dark: true, who: 'self', cd: 4 }),
    ch('45211', 'barista_cert', [20, 52], 0.12, '바리스타 자격 과정 비용이 부담스럽다. 따 두면 이직에 쓸 수 있다.', '어떻게 할까?', [
      ['take', '과정을 듣는다', 'intellect+2 wealth-1 leisure-2', '쉬는 날 과정을 들었다. 이력서에 한 줄이 늘었다.'],
      ['skip', '현장 경험으로', 'wealth+1 leisure+1 intellect-1', '과정은 접고 일에 집중했다. 경험이 쌓였다.'],
    ], 'skip', '자격 과정'),
  ],
  '45311': [
    ev('45311', 'tab_walkout', [16, 62], 0.1, '일행이 계산하지 않고 나가 버렸다. 금액이 내 몫으로 넘어올까 걱정됐다.', 'wealth-1 happiness-2 fairness+1', '먹튀 손님', { dark: true, who: 'wage', cd: 4 }),
    ev('45311', 'regular_tip', [16, 65], 0.1, '단골 가족이 매번 같은 자리를 부탁하며 이름을 불러 줬다.', 'happiness+2 relations+1 wealth+1', '단골의 인사'),
    ch('45311', 'tablet_order', [20, 62], 0.12, '테이블 태블릿 주문기가 들어와 홀 서빙 인원이 줄어든다고 한다.', '어떻게 할까?', [
      ['adapt', '기기 담당을 맡는다', 'intellect+1 tech+1 happiness-1 relations-1', '기기 점검과 안내를 맡았다. 서빙 시간은 줄었다.'],
      ['move', '다른 가게를 알아본다', 'wealth-1 leisure+1 job+1', '홀 인원이 필요한 다른 가게를 찾아봤다.'],
    ], 'adapt', '무인 주문기', { dark: true, who: 'wage', years: [2018, 2100], once: true }),
  ],
};
