import { X, E, tr, ev, ch } from '../jobs-kit.js';

export default [
  X('45312', {
    entry: [
      E('hire', { minEdu: 'none', ages: [16, 50], p: 0.4, text: '음료 매장 구인 공고를 보고 들어가 주문과 제조를 배웠다.' }),
      E('self', { minEdu: 'high', ages: [25, 56], p: 0.06, text: '권리금 없는 작은 음료 가게 자리를 얻었다.' }),
    ],
    transitions: [
      tr('45211', [20, 45], 2, 0.05, '커피 조리원으로 옮겨'),
      tr('15220', [28, 55], 6, 0.03, '매장 관리자로 승진'),
      tr('45311', [22, 55], 2, 0.03, '식당 홀 일로 이동'),
    ],
    events: [
      ev('45312', 'closing_chores', [16, 55], 0.14, '마감 뒤 기계 세척과 정리로 퇴근이 한 시간 늦어졌다.', 'health-1 leisure-2', '마감 뒤 정리', { dark: true, cd: 3 }),
      ev('45312', 'regular_face', [16, 60], 0.12, '매일 오는 손님이 늘 같은 음료를 주문한다. 이름을 불러 줬다.', 'happiness+2 relations+1', '단골과의 인사'),
      ev('45312', 'kiosk_order', [18, 60], 0.12, '주문대 옆에 무인 주문기가 들어왔다. 계산 일이 줄었다.', 'job+3 tech+2 happiness-1', '무인 주문기 도입', { dark: true, once: true, years: [2018, 2100] }),
      ch('45312', 'new_syrup', [18, 55], 0.12, '신메뉴 시럽 시연을 맡게 됐다. 쉬는 날 연습이 필요하다.', '어떻게 할까?', [
        ['learn', '쉬는 날 연습', 'intellect+2 leisure-3 job-1', '쉬는 날에 시럽 비율을 맞춰 봤다. 시연은 무난히 지나갔다.'],
        ['skip', '근무 중에 익힌다', 'leisure+1 happiness-1 job+1', '근무 틈틈이 익혔다. 첫 주문에서 몇 번 틀렸다.'],
      ], 'learn', '신메뉴 교육'),
    ],
    hazard: 1, burnout: 0.05,
  }),
  X('45313', {
    entry: [
      E('hire', { minEdu: 'none', ages: [19, 55], p: 0.35, text: '술집 홀 아르바이트로 들어가 주문과 안주 나르기를 익혔다.' }),
      E('self', { minEdu: 'high', ages: [28, 58], p: 0.06, text: '동네 골목에 작은 술집을 열었다.' }),
    ],
    transitions: [
      tr('45220', [22, 45], 2, 0.05, '바텐더 일로 옮겨'),
      tr('15220', [28, 55], 5, 0.03, '주점 점장으로'),
      tr('45311', [22, 58], 2, 0.03, '식당 홀로 이동'),
    ],
    events: [
      ev('45313', 'drunk_customer', [19, 58], 0.16, '취한 손님이 반말로 시비를 걸었다. 웃으며 넘겼지만 하루가 무거웠다.', 'happiness-2 relations-1 conflict+1', '취객 응대', { dark: true, cd: 3 }),
      ev('45313', 'late_night', [19, 58], 0.14, '새벽 세 시 마감이 이어졌다. 낮밤이 뒤집혔다.', 'health-2 leisure-1', '심야 영업', { dark: true, cd: 3 }),
      ev('45313', 'tip_regular', [19, 60], 0.11, '단골 테이블이 팁을 건네며 다음에 또 온다고 했다.', 'wealth+1 happiness+2', '단골과 팁'),
      ch('45313', 'last_order', [20, 58], 0.12, '마감 직전 손님이 한 잔만 더 달라고 했다.', '어떻게 할까?', [
        ['serve', '한 잔 더 낸다', 'wealth+2 health-1 happiness-1', '한 잔을 더 냈다. 정리는 그만큼 뒤로 밀렸다.'],
        ['close', '마감한다', 'relations-1 health+1 leisure+1', '마감 시간을 지켰다. 손님이 입을 삐죽였다.'],
      ], 'close', '마감 주문'),
    ],
    hazard: 1, burnout: 0.06,
  }),
  X('45391', {
    entry: [
      E('hire', { minEdu: 'none', ages: [25, 65], p: 0.4, text: '병원 급식실에서 배식과 식기 정리를 맡게 됐다.' }),
      E('hire', { minEdu: 'high', ages: [20, 60], p: 0.2, text: '급식 위탁업체 모집을 보고 병원 배식에 지원했다.' }),
    ],
    transitions: [
      tr('45150', [28, 60], 3, 0.05, '단체급식 조리로 이동'),
      tr('42220', [30, 62], 3, 0.03, '간병 일로 옮겨'),
      tr('45311', [25, 60], 2, 0.03, '식당 홀 일로 이동'),
    ],
    events: [
      ev('45391', 'early_tray', [25, 65], 0.15, '새벽 여섯 시 전에 아침 식판이 병동으로 올라간다. 알람이 네 시다.', 'health-2 leisure-1', '새벽 배식', { dark: true, cd: 3 }),
      ev('45391', 'thanks_note', [25, 68], 0.1, '퇴원하는 환자가 식사 잘 먹었다며 인사를 건넸다.', 'happiness+2 relations+1', '환자의 인사'),
      ev('45391', 'diet_mix_up', [25, 65], 0.1, '치료식 식판이 바뀔 뻔했다. 확인 절차를 한 번 더 만들었다.', 'intellect+1 happiness-1 conflict+1', '식판 확인', { once: true }),
      ch('45391', 'shift_split', [25, 65], 0.12, '명절 연휴 배식 근무표가 나왔다. 연휴 전체가 근무다.', '어떻게 할까?', [
        ['work', '연휴 근무를 한다', 'wealth+2 relations-2 leisure-2', '연휴 수당을 받았다. 가족 모임에는 늦게 도착했다.'],
        ['swap', '동료와 바꾼다', 'relations+1 wealth-1 leisure+1', '동료와 날짜를 맞바꿨다. 다음 달에 갚을 일이 생겼다.'],
      ], 'work', '연휴 근무'),
    ],
    hazard: 1, burnout: 0.04,
  }),
  X('45399', {
    entry: [
      E('hire', { minEdu: 'none', ages: [16, 65], p: 0.4, text: '식당과 뷔페에서 서빙과 설거지를 겸하는 일을 시작했다.' }),
      E('self', { minEdu: 'none', ages: [30, 62], p: 0.06, text: '작은 분식 겸 음료 가게를 인수했다.' }),
    ],
    transitions: [
      tr('45311', [20, 60], 2, 0.05, '홀 서빙 전담으로'),
      tr('45110', [22, 58], 3, 0.03, '주방 일로 이동'),
      tr('15220', [30, 58], 6, 0.03, '점장으로 이동'),
    ],
    events: [
      ev('45399', 'wage_delay', [18, 65], 0.1, '사장이 월급날을 며칠씩 미뤘다. 카드값 날짜가 먼저 왔다.', 'wealth-2 happiness-2 fairness+2 debt+100', '월급 지연', { dark: true, who: 'wage', cd: 5 }),
      ev('45399', 'banquet_rush', [18, 62], 0.13, '단체 예약 서른 명이 한꺼번에 들어와 홀이 비었다 찼다.', 'health-1 relations+1 wealth+1', '단체 예약'),
      ev('45399', 'broke_plates', [16, 60], 0.1, '그릇을 떨어뜨려 깼다. 동료가 괜찮다며 같이 치웠다.', 'happiness+1 relations+1', '동료의 도움'),
      ch('45399', 'two_jobs', [18, 60], 0.12, '낮엔 뷔페, 저녁엔 다른 가게에서 일해 보라는 제안이 왔다.', '어떻게 할까?', [
        ['both', '두 곳 모두 한다', 'wealth+3 health-2 leisure-2', '두 곳을 오갔다. 통장은 불었지만 허리가 먼저 알렸다.'],
        ['one', '한 곳에 집중한다', 'wealth-1 leisure+2 health+1', '한 곳만 하기로 했다. 저녁 시간이 남았다.'],
      ], 'one', '겹치기 근무'),
    ],
    hazard: 1, burnout: 0.06,
  }),
  X('45199', {
    entry: [
      E('hire', { minEdu: 'none', ages: [18, 60], p: 0.4, text: '식당 주방 보조로 들어가 칼질과 재료 손질을 익혔다.' }),
      E('self', { minEdu: 'none', ages: [28, 60], p: 0.1, text: '배운 솜씨로 동네에 작은 식당을 냈다.' }),
    ],
    transitions: [
      tr('29701', [32, 58], 8, 0.04, '주방장으로 승진'),
      tr('45150', [28, 60], 3, 0.03, '급식 조리로 이동'),
      tr('45110', [25, 58], 3, 0.03, '한식 주방으로'),
    ],
    events: [
      ev('45199', 'burn_hand', [20, 65], 0.14, '튀김기 기름이 튀어 손등을 데었다. 며칠 쉬며 약을 발랐다.', 'health-2 leisure+1', '주방 화상', { dark: true, cd: 3 }),
      ev('45199', 'sauce_praise', [22, 65], 0.1, '내가 만든 소스가 인기를 끌어 주방장이 레시피로 쓰자고 했다.', 'happiness+3 intellect+1 job-1', '솜씨 인정'),
      ev('45199', 'inventory_waste', [24, 65], 0.1, '발주가 어긋나 재료가 상해 버렸다. 손실이 급여 이야기로 번졌다.', 'wealth-1 conflict+2 happiness-2', '발주 착오', { dark: true, who: 'wage' }),
      ch('45199', 'menu_cut', [25, 62], 0.12, '식당이 메뉴를 줄이겠다고 한다. 내가 맡은 메뉴도 포함이다.', '어떻게 할까?', [
        ['argue', '메뉴 유지를 건의', 'relations-1 happiness+1 conflict+2', '매출표를 들고 건의했다. 결론은 다음 달로 미뤄졌다.'],
        ['learn', '다른 메뉴를 배운다', 'intellect+2 leisure-2', '새 메뉴를 배우는 쪽을 택했다. 퇴근 후 연습이 늘었다.'],
      ], 'learn', '메뉴 개편'),
    ],
    hazard: 2, burnout: 0.06,
  }),
  X('45212', {
    entry: [
      E('hire', { minEdu: 'none', ages: [22, 60], p: 0.3, text: '전통 찻집에 들어가 차 우리는 법과 다과 만들기를 배웠다.' }),
      E('self', { minEdu: 'high', ages: [28, 62], p: 0.12, text: '한옥 골목에 작은 찻집을 열었다.' }),
    ],
    transitions: [
      tr('45211', [22, 48], 2, 0.04, '커피 조리원으로'),
      tr('71010', [25, 55], 3, 0.03, '떡·제과 쪽으로 이동'),
      tr('45311', [22, 58], 2, 0.03, '식당 일로 이동'),
    ],
    events: [
      ev('45212', 'tea_class', [24, 65], 0.1, '차 우리기 체험 수업을 열었더니 예약이 찼다.', 'wealth+2 happiness+2 relations+1', '체험 수업 인기'),
      ev('45212', 'off_season', [24, 65], 0.13, '비수기에 손님이 뚝 끊겨 찻잎 재고만 쌓였다.', 'wealth-2 happiness-1', '비수기 매출', { dark: true, who: 'self', cd: 3 }),
      ev('45212', 'quiet_shift', [22, 65], 0.12, '찻집 오후는 조용하다. 찻물 끓는 소리를 들으며 장부를 정리했다.', 'happiness+2 leisure+1', '조용한 오후'),
      ch('45212', 'cafe_trend', [24, 60], 0.11, '이웃 가게들이 디저트를 곁들여 팔기 시작했다.', '어떻게 할까?', [
        ['dessert', '디저트를 들인다', 'wealth+1 leisure-2 intellect+1 debt+300', '디저트를 들였다. 준비할 일이 하루 한 시간 늘었다.'],
        ['keep', '차만 고수한다', 'happiness+1 wealth-1', '차 하나만 내는 가게로 남았다. 손님 수는 조금 줄었다.'],
      ], 'keep', '디저트 경쟁'),
    ],
    burnout: 0.04,
  }),
  X('45219', {
    entry: [
      E('hire', { minEdu: 'none', ages: [16, 45], p: 0.4, era: [1990, null], text: '주스·버블티 전문점 아르바이트로 음료 제조를 시작했다.' }),
      E('self', { minEdu: 'high', ages: [24, 55], p: 0.06, era: [1995, null], text: '작은 음료 전문점을 직접 열었다.' }),
    ],
    transitions: [
      tr('45211', [20, 46], 2, 0.05, '커피 조리원으로'),
      tr('52111', [28, 56], 4, 0.03, '다른 가게를 열어'),
      tr('15220', [28, 55], 5, 0.03, '매장 관리자로'),
    ],
    events: [
      ev('45219', 'summer_peak', [16, 50], 0.14, '여름 한낮 냉음료 주문이 쏟아져 얼음을 세 번 채웠다.', 'health-1 wealth+1', '여름 성수기'),
      ev('45219', 'order_app_error', [18, 50], 0.1, '주문 앱 오류로 같은 주문이 열 번 들어왔다. 취소에 한 시간 걸렸다.', 'happiness-2 tech+2', '주문 앱 오류', { dark: true, years: [2015, 2100] }),
      ev('45219', 'recipe_prize', [18, 55], 0.09, '내가 낸 신메뉴 조합이 매장 한정 메뉴로 올라갔다.', 'happiness+3 intellect+1', '신메뉴 채택', { once: true }),
      ch('45219', 'trend_stock', [22, 55], 0.12, '유행하는 재료가 갑자기 많이 팔린다. 재고를 더 들일까.', '어떻게 할까?', [
        ['stock', '재고를 더 들인다', 'wealth+2 happiness-1 debt+200', '재료를 넉넉히 들였다. 유행이 식을까 걱정이었다.'],
        ['tight', '조금씩만 들인다', 'wealth-1 happiness+1', '조금씩 주문했다. 인기 메뉴가 며칠 품절됐다.'],
      ], 'tight', '유행 재고', { who: 'self' }),
    ],
    hazard: 1, burnout: 0.05,
  }),
  X('45220', {
    entry: [
      E('hire', { minEdu: 'high', ages: [21, 45], p: 0.3, text: '바에서 보조로 일하며 술 이름과 칵테일 순서를 외웠다.' }),
      E('self', { minEdu: 'high', ages: [28, 55], p: 0.1, text: '작은 바를 직접 열고 카운터에 섰다.' }),
    ],
    transitions: [
      tr('45313', [24, 55], 3, 0.03, '주점 서비스로 이동'),
      tr('45211', [24, 50], 3, 0.03, '카페 일로 옮겨'),
      tr('15220', [28, 56], 5, 0.03, '바 매니저로'),
    ],
    events: [
      ev('45220', 'signature_drink', [22, 55], 0.1, '내 이름을 붙인 칵테일이 메뉴에 올랐다.', 'happiness+3 intellect+1 relations+1', '시그니처 칵테일'),
      ev('45220', 'owner_late_pay', [22, 55], 0.1, '사장이 이번 달 급여를 반만 먼저 줬다. 나머지는 곧 준다고 한다.', 'wealth-2 happiness-2 fairness+2', '급여 일부 지급', { dark: true, who: 'wage', cd: 5 }),
      ev('45220', 'night_shift', [21, 55], 0.14, '해가 뜰 무렵 퇴근하는 날이 이어져 식사 시간이 흐트러졌다.', 'health-2 leisure-1', '심야 근무', { dark: true, cd: 3 }),
      ch('45220', 'competition', [23, 50], 0.1, '바텐더 경연 대회에 나가 보라는 권유를 받았다.', '어떻게 할까?', [
        ['enter', '대회에 나간다', 'intellect+2 happiness+1 leisure-3 wealth-1', '몇 달 연습해 출전했다. 결과와 별개로 배운 것이 많았다.'],
        ['pass', '가게에 집중한다', 'wealth+1 relations+1 happiness-1', '대회는 접고 가게 일에 집중했다.'],
      ], 'pass', '경연 대회'),
    ],
    hazard: 1, burnout: 0.05,
  }),
  X('45120', {
    entry: [
      E('hire', { minEdu: 'none', ages: [16, 55], p: 0.4, text: '중국집 주방에서 양파 까기부터 시작해 웍을 잡았다.' }),
      E('self', { minEdu: 'none', ages: [28, 62], p: 0.12, text: '모은 돈으로 동네 중국집을 열었다.' }),
    ],
    transitions: [
      tr('29701', [32, 60], 8, 0.04, '주방장으로 승진'),
      tr('45199', [26, 58], 3, 0.03, '다른 주방으로 이동'),
      tr('45191', [28, 62], 4, 0.03, '분식 가게로 옮겨'),
    ],
    events: [
      ev('45120', 'wok_fire', [20, 62], 0.14, '센 불 앞에서 웍을 돌리는 일이 이어져 손목이 시큰거린다.', 'health-2 medical+1', '웍 작업 손목', { dark: true, cd: 3 }),
      ev('45120', 'noodle_pride', [22, 65], 0.1, '직접 뽑은 면이 맛있다며 손님이 포장해 갔다.', 'happiness+3 relations+1', '솜씨 인정'),
      ch('45120', 'delivery_rider', [24, 65], 0.12, '배달 기사가 구하기 어려워 주문이 쌓인다.', '어떻게 할까?', [
        ['hire', '직접 기사를 고용', 'wealth-1 leisure+1 relations+1 job+1', '기사를 고용했다. 인건비가 늘었지만 홀이 안정됐다.'],
        ['app', '배달 앱에 맡긴다', 'wealth-2 leisure+1 tech+1', '앱 배달로 돌렸다. 수수료가 매달 마음에 걸렸다.'],
      ], 'app', '배달 인력', { who: 'self', years: [2012, 2100] }),
      ev('45120', 'rent_pressure', [26, 65], 0.1, '건물주가 월세를 올리겠다고 통보했다. 매출표를 다시 펼쳤다.', 'wealth-3 happiness-2 housing+1', '임대료 인상', { dark: true, who: 'self', cd: 5 }),
    ],
    hazard: 2, burnout: 0.06,
  }),
  X('45130', {
    entry: [
      E('hire', { minEdu: 'high', ages: [19, 45], p: 0.3, text: '양식당 주방 보조로 들어가 소스와 굽기를 익혔다.' }),
      E('degree', { minEdu: '2yr', ages: [20, 40], p: 0.2, text: '조리 관련 학과를 마치고 호텔 주방에 입사했다.' }),
      E('self', { minEdu: 'high', ages: [28, 55], p: 0.08, text: '작은 레스토랑을 대출로 열었다.' }),
    ],
    transitions: [
      tr('29701', [32, 58], 8, 0.04, '셰프로 승진'),
      tr('45140', [26, 55], 3, 0.03, '일식 주방으로 이동'),
      tr('15220', [32, 58], 6, 0.03, '식당 관리자로'),
    ],
    events: [
      ev('45130', 'dinner_service', [20, 55], 0.14, '주말 저녁 코스가 몰려 접시가 줄줄이 나갔다.', 'health-1 intellect+1 happiness+1', '저녁 서비스'),
      ev('45130', 'chef_temper', [20, 55], 0.12, '주방장이 접시를 던지듯 내려놓으며 소리쳤다. 사과는 없었다.', 'happiness-3 conflict+2 relations-1', '주방 위계 갈등', { dark: true, who: 'wage', cd: 4 }),
      ev('45130', 'review_good', [24, 60], 0.09, '손님이 후기에 내 요리를 이름까지 적어 칭찬했다.', 'happiness+3 wealth+1', '요리 후기', { once: true }),
      ch('45130', 'stage_abroad', [22, 40], 0.1, '해외 식당에서 몇 달 일해 보라는 제안이 왔다.', '어떻게 할까?', [
        ['go', '다녀온다', 'intellect+3 wealth-2 relations-2', '해외 주방에서 일했다. 월급은 적었지만 배운 것이 많았다.'],
        ['stay', '남아서 일한다', 'wealth+1 relations+1 intellect-1', '지금 자리에서 승진 기회를 기다리기로 했다.'],
      ], 'stay', '해외 주방 제안', { once: true }),
    ],
    hazard: 2, burnout: 0.06,
  }),
  X('45140', {
    entry: [
      E('hire', { minEdu: 'high', ages: [19, 50], p: 0.3, text: '일식집 주방에 들어가 밥 짓기와 생선 손질부터 배웠다.' }),
      E('self', { minEdu: 'high', ages: [30, 60], p: 0.1, text: '이름을 건 작은 초밥집을 냈다.' }),
    ],
    transitions: [
      tr('29701', [34, 60], 8, 0.04, '주방장으로 승진'),
      tr('45130', [26, 55], 3, 0.03, '양식 주방으로'),
      tr('45110', [28, 60], 3, 0.03, '한식 주방으로'),
    ],
    events: [
      ev('45140', 'knife_skill', [20, 62], 0.1, '선배 앞에서 손질한 생선이 처음으로 합격점을 받았다.', 'intellect+2 happiness+2', '칼질 인정'),
      ev('45140', 'fish_price', [26, 65], 0.13, '수산시장 시세가 뛰어 원가표를 다시 짰다.', 'wealth-2 happiness-1', '재료 시세 상승', { dark: true, who: 'self', cd: 3 }),
      ev('45140', 'omakase_regular', [28, 65], 0.1, '예약 단골이 생겨 손님 앞 카운터가 하루의 중심이 됐다.', 'happiness+2 wealth+1 relations+1', '예약 단골'),
      ch('45140', 'close_day', [26, 65], 0.1, '손님이 적은 날 재료가 남았다.', '어떻게 할까?', [
        ['promo', '당일 할인한다', 'wealth+1 happiness-1 leisure-1', '재료를 정리하려고 할인을 했다. 평소보다 단골이 와 줬다.'],
        ['discard', '품질을 지킨다', 'wealth-2 happiness+1', '신선도가 떨어진 재료는 쓰지 않았다. 손실은 감수했다.'],
      ], 'discard', '남은 재료', { who: 'self' }),
    ],
    hazard: 1, burnout: 0.05,
  }),
  X('45191', {
    entry: [
      E('hire', { minEdu: 'none', ages: [18, 62], p: 0.4, text: '분식집에서 떡볶이 육수와 튀김을 맡아 일을 배웠다.' }),
      E('self', { minEdu: 'none', ages: [26, 62], p: 0.15, text: '학교 앞에 작은 분식집을 열었다.' }),
    ],
    transitions: [
      tr('45110', [26, 60], 4, 0.03, '한식 주방으로'),
      tr('52111', [28, 60], 4, 0.03, '다른 가게를 열어'),
      tr('45399', [24, 60], 2, 0.03, '식음료 서비스로'),
    ],
    events: [
      ev('45191', 'after_school', [20, 65], 0.15, '하교 시간마다 학생들이 몰려 줄이 문 밖까지 이어졌다.', 'wealth+2 health-1 happiness+1', '하교 시간 손님'),
      ev('45191', 'oil_price', [22, 65], 0.12, '식용유와 고춧가루 값이 올랐지만 가격표를 올리기 망설여졌다.', 'wealth-2 living+1 happiness-1', '재료비 상승', { dark: true, who: 'self', cd: 3 }),
      ev('45191', 'old_customer', [26, 68], 0.1, '예전 학생이던 손님이 아이를 데리고 와서 옛 맛이라며 웃었다.', 'happiness+3 relations+1', '옛 손님의 방문'),
      ch('45191', 'frozen_menu', [24, 65], 0.11, '냉동 반조리 식품을 들이면 일이 줄지만 맛이 달라진다.', '어떻게 할까?', [
        ['frozen', '반조리를 들인다', 'leisure+2 wealth+1 happiness-1 relations-1', '반조리 식품을 썼다. 일은 줄었고 몇몇 단골이 말을 아꼈다.'],
        ['homemade', '직접 만든다', 'health-1 happiness+1 relations+1', '손이 가도 직접 만들었다. 새벽 준비가 길어졌다.'],
      ], 'homemade', '반조리 도입', { who: 'self' }),
    ],
    hazard: 1, burnout: 0.06,
  }),
];
