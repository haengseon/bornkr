import { ev, ch } from '../jobs-kit.js';
export default {
  '51011': [
    ev('51011', 'delivery_day', [22, 62], 0.12, '출고한 차를 인도하던 날 고객이 가족과 함께 사진을 찍자고 했다.', 'happiness+2 relations+2', '신차 인도'),
    ev('51011', 'supply_delay', [22, 62], 0.13, '생산이 밀려 인도가 몇 달 늦어졌다. 계약 취소 문의가 이어졌다.', 'happiness-2 wealth-2 conflict+2', '인도 지연 항의', { dark: true }),
    ch('51011', 'discount_ask', [24, 62], 0.12, '고객이 옵션을 거의 공짜로 넣어 달라고 하며 계약을 미룬다.', '어떻게 할까?', [
      ['yield', '사비로 일부 보탠다', 'wealth-2 happiness+1 relations+1', '옵션 일부를 내 몫에서 채웠다. 계약서에 도장이 찍혔다.'],
      ['hold', '규정대로 말한다', 'wealth+1 relations-1 happiness-1', '조건을 바꾸기 어렵다고 말했다. 고객은 다른 영업소로 갔다.'],
    ], 'hold', '옵션 할인 요구'),
  ],
  '51022': [
    ev('51022', 'new_listing', [24, 60], 0.12, '새로 낸 거래처에서 우리 제품이 진열대 눈높이에 올라갔다.', 'wealth+2 happiness+2', '신규 입점'),
    ev('51022', 'expiry_return', [24, 60], 0.13, '유통기한 문제로 반품된 물량을 두고 거래처와 책임을 다퉜다.', 'wealth-2 happiness-2 conflict+2', '반품 책임 분쟁', { dark: true }),
    ch('51022', 'event_support', [24, 60], 0.12, '거래처가 행사 지원비를 요구한다. 지원하면 진열이 보장된다.', '어떻게 할까?', [
      ['pay', '지원한다', 'relations+2 wealth-2', '행사를 함께 치렀다. 진열 면적은 유지됐고 팀 예산은 줄었다.'],
      ['skip', '지원하지 않는다', 'wealth+1 relations-1 leisure+1 job+2', '지원을 거절했다. 다음 분기 진열이 조금 밀렸다.'],
    ], 'pay', '행사 지원비 요구'),
  ],
  '51032': [
    ev('51032', 'claim_paid', [26, 65], 0.13, '고객 가족의 사고 보험금이 제때 지급돼 고맙다는 연락을 받았다.', 'happiness+3 relations+2', '보험금 지급'),
    ev('51032', 'cancel_call', [26, 65], 0.14, '오래 관리한 고객이 한꺼번에 해지를 요청했다. 수수료 환수가 걱정이다.', 'happiness-3 wealth-2 relations-1', '대량 해지', { dark: true }),
    ch('51032', 'upsell', [26, 65], 0.12, '고객 형편에 비해 보험료가 큰 상품이 실적에는 유리하다.', '어떻게 설계할까?', [
      ['fit', '형편에 맞춰 설계', 'relations+2 wealth-2 happiness+1', '보험료를 낮춰 설계했다. 고객은 고마워했고 실적은 줄었다.'],
      ['big', '큰 상품을 권한다', 'wealth+3 relations-2 happiness-1', '큰 상품으로 계약했다. 몇 달 뒤 고객이 부담스럽다고 했다.'],
    ], 'fit', '보험 설계 방향'),
    ev('51032', 'training_day', [25, 60], 0.11, '지점 교육에서 새 약관을 배우고 실적 우수자들의 사례를 들었다.', 'intellect+2 happiness+1', '지점 교육', { cd: 5 }),
  ],
  '52111': [
    ev('52111', 'regular_birthday', [28, 72], 0.12, '오래된 단골이 가게 이십 주년이라며 작은 선물을 들고 왔다.', 'happiness+3 relations+2', '단골의 선물', { who: 'self' }),
    ev('52111', 'delivery_fee', [28, 72], 0.14, '배달 앱과 대형 업체에 손님이 몰려 동네 가게 매출이 줄었다. 수수료까지 내야 했다.', 'wealth-3 happiness-1 tech+3', '플랫폼 경쟁과 수수료', { dark: true, who: 'self', years: [2015, 2100] }),
    ch('52111', 'closing_thought', [40, 72], 0.1, '장사는 겨우 유지되지만 쉬는 날이 없다. 가게를 접을지 고민이 이어진다.', '어떻게 할까?', [
      ['keep', '조금 더 해 본다', 'wealth+1 health-2 leisure-2', '가게를 계속 열었다. 단골이 문을 열고 들어오면 마음이 놓였다.'],
      ['close', '정리를 시작한다', 'happiness+1 wealth-2 leisure+2 job+3', '재고를 정리하고 권리금 이야기를 알아봤다. 홀가분하면서도 서운했다.'],
    ], 'keep', '폐업 고민', { once: true, who: 'self' }),
  ],
  '52112': [
    ev('52112', 'staff_praise', [24, 60], 0.12, '새로 들어온 아르바이트생이 일을 빨리 익혀 점장 평가가 올랐다.', 'happiness+2 relations+2', '신입 교육 성과'),
    ev('52112', 'hq_target', [24, 60], 0.14, '본사가 매출 목표를 올려 인건비를 줄이라고 지시했다. 근무표를 다시 짰다.', 'happiness-2 leisure-2 conflict+2', '본사 비용 절감 지시', { dark: true, who: 'wage' }),
    ch('52112', 'staff_conflict', [24, 60], 0.12, '직원 둘이 근무표를 두고 다퉜다. 나는 중간에서 조정해야 한다.', '어떻게 할까?', [
      ['each', '각자 의견을 듣는다', 'relations+1 leisure-2 happiness-1', '각자 이야기를 들었다. 시간은 걸렸지만 두 사람 다 말을 아꼈다.'],
      ['rule', '내가 기준을 정한다', 'leisure+1 relations-2 conflict+1', '기준을 정해 통보했다. 한 직원이 불만을 숨기지 않았다.'],
    ], 'each', '직원 갈등 조정'),
  ],
  '52121': [
    ev('52121', 'repeat_buyer', [18, 60], 0.13, '입어 본 옷이 잘 어울린다고 말해 준 손님이 다음 시즌에도 나를 찾았다.', 'happiness+2 relations+2', '단골 손님'),
    ev('52121', 'rude_customer', [18, 60], 0.14, '입점한 손님이 옷을 던지듯 내려놓으며 점원을 탓했다. 점장은 사과하라고 했다.', 'happiness-3 relations-1 conflict+2', '진상 손님 응대', { dark: true }),
    ch('52121', 'quota_stock', [20, 58], 0.12, '지난 시즌 재고를 직원이 직접 사 가는 판매 독려가 돌았다.', '어떻게 할까?', [
      ['buy', '일부 산다', 'wealth-2 relations+1 happiness-1', '몇 벌을 샀다. 점장과의 사이는 매끄러웠고 월급은 줄었다.'],
      ['pass', '정중히 거절한다', 'wealth+1 relations-1 conflict+1', '필요 없다고 말했다. 이후 근무표에서 눈치가 느껴졌다.'],
    ], 'pass', '재고 구매 독려'),
  ],
  '52141': [
    ev('52141', 'kind_regular', [18, 70], 0.13, '매일 오는 손님이 건네는 짧은 안부가 오전 근무를 가볍게 했다.', 'happiness+2 relations+1', '단골 손님'),
    ev('52141', 'night_shift', [20, 65], 0.14, '심야 근무가 이어지며 낮에는 잠이 오지 않았다. 몸이 처졌다.', 'health-2 leisure-2 happiness-1', '야간 교대 피로', { dark: true, cd: 5 }),
    ch('52141', 'wage_gap', [18, 70], 0.11, '주휴수당이 빠진 것 같다. 점주에게 물어보면 분위기가 어색해질 수 있다.', '어떻게 할까?', [
      ['ask', '정중히 확인한다', 'wealth+2 relations-2 conflict+1', '급여명세를 확인해 달라고 했다. 정산은 맞춰졌고 점주의 표정이 굳었다.'],
      ['let', '그냥 넘긴다', 'wealth-1 happiness-1 relations+1', '말하지 않았다. 매달 잔액을 확인할 때마다 부담이 남았다.'],
    ], 'ask', '급여 확인'),
  ],
  '53110': [
    ev('53110', 'family_plan', [20, 58], 0.13, '가족 결합 요금제를 꼼꼼히 설명해 준 손님이 가족을 데려왔다.', 'happiness+2 wealth+1 relations+1', '요금 상담 성과'),
    ev('53110', 'customer_rage', [20, 58], 0.14, '요금이 높게 나왔다는 손님이 목소리를 높였다. 설명이 닿지 않았다.', 'happiness-3 relations-1 conflict+2', '요금 항의', { dark: true }),
    ch('53110', 'contract_push', [20, 58], 0.12, '본사가 부가 서비스 가입 건수를 매일 확인한다. 고객에게는 선택 사항이다.', '어떻게 권할까?', [
      ['push', '적극 권한다', 'wealth+2 relations-1 happiness-1', '실적은 올랐고 몇 고객은 해지 문의를 했다.'],
      ['skip', '필요한 만큼만', 'wealth-2 relations+2 happiness+1', '필요한 부분만 안내했다. 실적표가 비었지만 고객은 만족했다.'],
    ], 'skip', '부가 서비스 권유'),
  ],
  '53120': [
    ev('53120', 'review_five', [20, 68], 0.13, '구매 후기에서 정성이 좋다는 말이 이어져 재주문이 늘었다.', 'wealth+2 happiness+2', '구매 후기'),
    ev('53120', 'algorithm_drop', [22, 68], 0.13, '플랫폼 노출 순위가 바뀌어 주문이 반 토막이 났다. 이유는 알 수 없었다.', 'wealth-3 happiness-2 tech+3 fairness+2', '노출 순위 변경', { dark: true, years: [2010, 2100] }),
    ch('53120', 'bulk_offer', [22, 68], 0.11, '도매처가 물량을 크게 사면 값을 깎아 주겠다고 한다.', '어떻게 할까?', [
      ['bulk', '크게 들여온다', 'wealth+2 happiness-1', '많이 들여와 단가를 낮췄다. 방 한쪽에 재고가 쌓였다.'],
      ['small', '소량으로 간다', 'wealth-1 happiness+1 leisure+1', '조금씩만 들여왔다. 단가는 높았고 마음은 가벼웠다.'],
    ], 'small', '도매 물량 제안'),
  ],
  '53130': [
    ev('53130', 'kind_voice', [20, 60], 0.12, '끝까지 설명을 들어 준 고객이 고맙다고 말하며 계약했다.', 'happiness+2 wealth+1', '친절한 고객'),
    ev('53130', 'script_pressure', [20, 60], 0.14, '통화 시간이 길면 지적을 받는다. 점심 직후 모니터링 면담이 있었다.', 'happiness-3 health-1 conflict+1', '통화 시간 압박', { dark: true, who: 'wage' }),
    ch('53130', 'angry_call', [20, 60], 0.13, '화가 난 고객이 한참 소리를 지른다. 전화를 먼저 끊을 수는 없다.', '어떻게 할까?', [
      ['listen', '끝까지 듣는다', 'happiness-2 relations+1 intellect+1', '십 분 동안 듣고 사과했다. 고객이 마지막에 목소리를 낮췄다.'],
      ['escalate', '상급자에게 넘긴다', 'happiness-1 leisure+1 conflict+1', '상급자에게 연결했다. 나는 잠시 숨을 돌렸고 평가는 조금 내려갔다.'],
    ], 'listen', '진상 고객 통화'),
  ],
  '53210': [
    ev('53210', 'regular_home', [25, 70], 0.12, '여러 번 찾아간 집에서 물건을 사 주고 차까지 내어 주었다.', 'happiness+2 relations+2 wealth+1', '방문 단골'),
    ev('53210', 'pressure_fee', [25, 70], 0.13, '업체가 판매 수수료 비율을 낮추고 교육비를 따로 걷겠다고 했다.', 'wealth-3 happiness-2 fairness+3', '수수료·교육비', { dark: true }),
    ch('53210', 'return_fee', [25, 68], 0.11, '고객이 며칠 만에 반품을 요구한다. 수수료는 환수 대상이다.', '어떻게 할까?', [
      ['accept', '반품을 받아 준다', 'wealth-2 relations+1 happiness+1', '반품을 받고 수수료를 내줬다. 고객과의 관계는 이어졌다.'],
      ['hold', '규정을 설명한다', 'wealth+1 relations-2 happiness-1', '규정상 어렵다고 설명했다. 고객은 불쾌해하며 연락을 끊었다.'],
    ], 'accept', '반품 요구'),
  ],
};
