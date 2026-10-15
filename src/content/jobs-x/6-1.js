import { X, E, tr, ev, ch } from '../jobs-kit.js';
export default [
  X('61122', {
    entry: [
      E('inherit', { minEdu: 'none', ages: [20, 62], p: 0.25, text: '부모의 밭을 이어받아 인삼·참깨 같은 특용작물을 키웠다.' }),
      E('self', { minEdu: 'none', ages: [32, 66], p: 0.05, era: [1990, null], text: '귀농해 약초와 버섯 재배를 시작했다.' }),
    ],
    transitions: [tr('61121', [30, 64], 3, 0.04, '시설 채소로 전환'), tr('61130', [32, 66], 3, 0.03, '과수 재배로 전환'), tr('99110', [52, 76], 5, 0.03, '농업 보조 일로 이동')],
    events: [
      ev('61122', 'ginseng_years', [28, 78], 0.1, '인삼밭 육 년근이 자란다. 해가림을 손볼 때마다 한 해가 지나간다.', 'wealth-1 happiness+1 intellect+1 living+1', '장기 재배 작물', { cd: 5 }),
      ev('61122', 'replant_blight', [25, 78], 0.1, '연작 장해로 뿌리가 상했다. 밭을 몇 해 쉬게 해야 한다.', 'wealth-3 happiness-2 living+3', '연작 피해', { dark: true }),
      ch('61122', 'brand_label', [28, 75], 0.1, '직거래장터에서 이력표시를 하면 값을 더 쳐준다고 한다.', '인증을 받을까?', [
        ['cert', '인증을 받는다', 'wealth+2 leisure-2 intellect+1 debt+500', '서류와 검사를 거쳐 표시를 달았다. 단가가 조금 올랐다.'],
        ['skip', '하던 대로 낸다', 'wealth-1 leisure+1 happiness+1', '기존 방식으로 냈다. 일이 단순해서 마음은 편했다.']], 'skip', '인증 제도'),
      ev('61122', 'harvest_buyer', [28, 78], 0.1, '수확철에 오래 거래한 상인이 올해도 전량을 사 가겠다고 했다.', 'wealth+2 happiness+2 relations+1', '단골 거래처', { cd: 4 }),
    ],
    hazard: 1, burnout: 0.03,
  }),
  X('61211', {
    entry: [
      E('inherit', { minEdu: 'none', ages: [20, 62], p: 0.25, text: '부모의 육묘장을 이어받아 모종을 길렀다.' }),
      E('hire', { minEdu: 'none', ages: [20, 60], p: 0.2, text: '육묘장 일꾼으로 들어가 모종 키우는 법을 배웠다.' }),
    ],
    transitions: [tr('61121', [28, 62], 3, 0.04, '시설 채소 농사로 전환'), tr('61212', [28, 62], 3, 0.03, '화훼 재배로 전환'), tr('99110', [50, 74], 5, 0.03, '농업 보조 일로 이동')],
    events: [
      ev('61211', 'spring_rush', [20, 70], 0.15, '봄 파종철에는 주문이 몰려 새벽부터 트레이를 날랐다.', 'health-2 leisure-3 wealth+2', '봄철 성수기', { cd: 3 }),
      ev('61211', 'seedling_disease', [22, 72], 0.1, '모종에 병이 번져 한 동을 통째로 폐기했다. 납품을 맞추기 어렵다.', 'wealth-3 happiness-2 living+2', '모종 병해', { dark: true }),
      ev('61211', 'regular_clients', [25, 75], 0.1, '해마다 모종을 받아 가는 농가가 소개를 해 주어 거래처가 늘었다.', 'wealth+2 relations+2 happiness+1', '거래처 확대', { cd: 4 }),
      ev('61211', 'migrant_teamwork', [22, 70], 0.1, '이주 노동자 동료가 접붙이기 요령을 알려 주었다. 서로 말을 배우며 일을 맞췄다.', 'intellect+1 relations+2 happiness+1', '이주 노동자와 협업', { years: [2004, 2100], once: true }),
    ],
    hazard: 1, burnout: 0.03,
  }),
  X('61212', {
    entry: [
      E('inherit', { minEdu: 'none', ages: [20, 62], p: 0.2, text: '부모의 꽃 하우스를 이어받아 화훼 농사를 지었다.' }),
      E('self', { minEdu: 'none', ages: [28, 64], p: 0.06, era: [1990, null], text: '꽃이 좋아 하우스를 빌려 화훼를 시작했다.' }),
    ],
    transitions: [tr('61121', [28, 62], 3, 0.04, '채소 재배로 전환'), tr('61220', [28, 62], 3, 0.03, '조경 일로 이동'), tr('99110', [50, 74], 5, 0.03, '농업 보조 일로 이동')],
    events: [
      ev('61212', 'ceremony_season', [22, 75], 0.14, '졸업·입학 철에는 꽃이 잘 나가 새벽 경매에 나갔다.', 'wealth+3 leisure-2 happiness+1', '꽃 성수기', { cd: 3 }),
      ev('61212', 'gift_drop', [28, 75], 0.1, '선물 문화가 달라지며 경조 화환 주문이 눈에 띄게 줄었다.', 'wealth-3 happiness-1 living+2', '꽃 수요 감소', { dark: true, years: [2016, 2100] }),
      ch('61212', 'export_chance', [28, 70], 0.1, '수출 상담회에서 해외 바이어가 샘플을 보내 보라고 했다.', '수출에 도전할까?', [
        ['try', '샘플을 보낸다', 'wealth+2 intellect+2 leisure-2 debt+1000', '검역 서류와 포장을 새로 익혔다. 첫 주문은 작았다.'],
        ['stay', '내수에 집중', 'happiness+1 wealth-1 leisure+1', '익숙한 시장에서 꽃을 냈다. 새로 배울 일은 없었다.']], 'stay', '수출 기회'),
      ev('61212', 'heating_bill', [22, 75], 0.12, '겨울 난방비가 올라 하우스 불을 낮추었다. 꽃 상태를 매일 살폈다.', 'wealth-2 leisure-1 living+2', '난방비 부담', { cd: 3, dark: true }),
    ],
    hazard: 1, burnout: 0.03,
  }),
  X('61220', {
    entry: [
      E('hire', { minEdu: 'high', ages: [20, 60], p: 0.3, text: '조경 회사에 들어가 나무 심는 일을 배웠다.' }),
      E('self', { minEdu: 'none', ages: [30, 62], p: 0.08, text: '경력을 쌓아 조경 시공 팀을 꾸렸다.' }),
    ],
    transitions: [tr('61212', [28, 60], 3, 0.03, '화훼 재배로 전환'), tr('62011', [30, 62], 3, 0.03, '산림 쪽으로 이동'), tr('99110', [50, 74], 5, 0.02, '농업 보조 일로 이동')],
    events: [
      ev('61220', 'park_project', [24, 65], 0.12, '아파트 단지 조경 공사가 끝났다. 심은 나무에 새순이 올라왔다.', 'happiness+2 wealth+1 relations+1', '시공 완료', { cd: 4 }),
      ev('61220', 'heat_work', [20, 65], 0.14, '한여름 현장에서 예초기와 삽을 쥐고 일했다. 열이 올라 하루를 쉬었다.', 'health-3 leisure-1', '폭염 야외 작업', { dark: true, cd: 3 }),
      ch('61220', 'low_bid', [28, 65], 0.1, '원청이 단가를 깎아 공사를 맡기겠다고 한다.', '받아들일까?', [
        ['accept', '깎인 단가에 수락', 'wealth+1 leisure-2 health-2 conflict+1', '일은 이었지만 인부를 줄이고 몸으로 때웠다.'],
        ['decline', '거절한다', 'wealth-2 happiness+1 leisure+1', '이번 공사는 놓쳤다. 다른 현장을 알아보며 한 달을 보냈다.']], 'accept', '단가 압박', { who: 'self', dark: true }),
      ev('61220', 'tree_doctor', [26, 65], 0.09, '병든 은행나무를 살려 냈다. 관리소장이 다음 해 계약도 맡기겠다고 했다.', 'happiness+2 wealth+1 intellect+1', '솜씨 인정', { once: true }),
    ],
    hazard: 2, burnout: 0.04,
  }),
  X('61311', {
    entry: [
      E('inherit', { minEdu: 'none', ages: [22, 62], p: 0.2, text: '부모의 젖소 목장을 이어받았다.' }),
      E('hire', { minEdu: 'none', ages: [20, 58], p: 0.15, text: '목장 일꾼으로 들어가 착유와 사양 관리를 배웠다.' }),
    ],
    transitions: [tr('61320', [28, 62], 3, 0.03, '한우 사육으로 전환'), tr('61319', [28, 64], 3, 0.03, '낙농 관련 일로 이동'), tr('99110', [52, 76], 5, 0.03, '농업 보조 일로 이동')],
    events: [
      ev('61311', 'milking_hours', [22, 70], 0.15, '새벽과 저녁 두 번의 착유는 명절에도 멈추지 않는다.', 'health-2 leisure-3 relations-1', '하루 두 번 착유', { dark: true, cd: 3 }),
      ev('61311', 'quota_cut', [28, 75], 0.1, '유업체가 원유 납품량을 줄이라고 통보했다. 남는 우유는 값이 떨어진다.', 'wealth-3 happiness-2 living+2', '원유 감축', { dark: true }),
      ch('61311', 'robot_milker', [30, 70], 0.1, '착유 로봇을 들이면 일손을 덜 수 있다는 소개를 받았다.', '설비를 들일까?', [
        ['buy', '로봇을 들인다', 'leisure+3 wealth-1 tech+2 debt+5000', '큰 빚이 생겼지만 새벽 착유에서 한숨 돌렸다.'],
        ['hand', '손으로 계속한다', 'leisure-2 health-1 wealth+1', '빚 없이 이어 갔다. 새벽 알람은 그대로였다.']], 'hand', '착유 자동화', { years: [2005, 2100] }),
      ev('61311', 'cow_birth', [22, 75], 0.12, '밤샘 끝에 송아지가 무사히 태어났다. 어미도 일어섰다.', 'happiness+2 relations+1 leisure-1', '송아지 출산', { cd: 3 }),
    ],
    hazard: 2, burnout: 0.04,
  }),
  X('61330', {
    entry: [
      E('inherit', { minEdu: 'none', ages: [22, 62], p: 0.2, text: '부모의 양돈장을 이어받았다.' }),
      E('hire', { minEdu: 'none', ages: [20, 58], p: 0.2, text: '양돈 농장에서 모돈 관리와 분만을 거들며 배웠다.' }),
    ],
    transitions: [tr('61320', [28, 62], 3, 0.03, '한우 사육으로 전환'), tr('61399', [28, 64], 3, 0.03, '축산 관련 일로 이동'), tr('99110', [52, 76], 5, 0.03, '농업 보조 일로 이동')],
    events: [
      ev('61330', 'asf_alert', [24, 75], 0.1, '돼지열병 경보로 출입과 출하가 막혔다. 차량 소독으로 하루가 갔다.', 'leisure-3 wealth-2 happiness-2 medical+1', '방역 경보', { dark: true, years: [2019, 2100] }),
      ev('61330', 'odor_complaint', [26, 72], 0.1, '인근 주민이 냄새 민원을 넣었다. 환기와 분뇨 처리 방식을 고쳤다.', 'happiness-2 wealth-1 conflict+2 region+1', '축산 냄새 민원', { dark: true }),
      ch('61330', 'farrowing_night', [24, 65], 0.12, '모돈 두 마리가 같은 밤에 분만 신호를 보인다. 잠을 잘 수 없다.', '어떻게 할까?', [
        ['stay', '밤새 지킨다', 'health-2 wealth+2 leisure-2', '새끼를 모두 받았다. 날이 밝을 때 눈이 따가웠다.'],
        ['help', '이웃을 부른다', 'wealth-1 relations+2 happiness+1', '이웃이 와 주어 한시름 놓았다. 사례로 한 마리를 나눴다.']], 'stay', '야간 분만'),
      ev('61330', 'price_peak', [26, 75], 0.1, '돼지 시세가 올라 출하 값이 좋았다. 밀린 사료 외상을 갚았다.', 'wealth+3 happiness+2 debt-1000', '돼지값 상승', { cd: 5 }),
    ],
    hazard: 2, burnout: 0.04,
  }),
  X('61342', {
    entry: [
      E('inherit', { minEdu: 'none', ages: [22, 62], p: 0.2, text: '부모의 양계장을 이어받아 계란을 냈다.' }),
      E('self', { minEdu: 'none', ages: [30, 62], p: 0.04, era: [1990, null], text: '계사를 지어 산란계를 들였다.' }),
    ],
    transitions: [tr('61341', [28, 62], 3, 0.03, '육계 사육으로 전환'), tr('61399', [28, 64], 3, 0.03, '축산 관련 일로 이동'), tr('99110', [52, 76], 5, 0.03, '농업 보조 일로 이동')],
    events: [
      ev('61342', 'avian_flu', [24, 75], 0.09, '조류 인플루엔자 의심 신고로 계사 앞이 통제되었다. 며칠을 초조하게 보냈다.', 'happiness-3 wealth-2 leisure-2', '조류 방역 통제', { dark: true }),
      ev('61342', 'egg_price', [24, 75], 0.12, '달걀값이 널뛰었다. 산지 가격이 올라 한 달은 숨통이 트였다.', 'wealth+2 happiness+1', '계란 가격 변동', { cd: 4 }),
      ch('61342', 'cage_rule', [28, 70], 0.1, '사육 환경 기준이 바뀌어 계사를 고쳐야 한다는 안내가 왔다.', '어떻게 할까?', [
        ['upgrade', '시설을 고친다', 'wealth-2 happiness+1 intellect+1 debt+4000', '지원금과 대출로 계사를 고쳤다. 닭 상태는 한결 안정되었다.'],
        ['reduce', '규모를 줄인다', 'wealth-1 leisure+2 happiness-1', '마릿수를 줄여 맞췄다. 일은 줄었지만 수입도 줄었다.']], 'reduce', '사육 기준 변경', { years: [2010, 2100] }),
      ev('61342', 'worker_helper', [22, 70], 0.1, '외국인 근로자 동료가 선별 일을 맡아 주었다. 함께 점심을 먹으며 말을 익혔다.', 'relations+2 happiness+1 leisure+1', '이주 노동자와 협업', { once: true, years: [2004, 2100] }),
    ],
    hazard: 2, burnout: 0.04,
  }),
  X('61391', {
    entry: [
      E('inherit', { minEdu: 'none', ages: [25, 64], p: 0.2, text: '아버지에게 벌통을 물려받아 양봉을 이어 갔다.' }),
      E('self', { minEdu: 'none', ages: [30, 66], p: 0.06, era: [1990, null], text: '귀농해 벌통 몇 개로 양봉을 시작했다.' }),
    ],
    transitions: [tr('61122', [30, 66], 3, 0.03, '특용작물 재배로 전환'), tr('61130', [32, 66], 3, 0.03, '과수 재배로 전환'), tr('99110', [52, 76], 5, 0.03, '농업 보조 일로 이동')],
    events: [
      ev('61391', 'blossom_move', [25, 72], 0.14, '아카시아 꽃 철을 따라 벌통을 싣고 남쪽에서 북쪽으로 옮겼다.', 'leisure-2 wealth+2 happiness+1', '이동 양봉', { cd: 3 }),
      ev('61391', 'colony_loss', [26, 75], 0.1, '겨울을 지나며 벌이 많이 줄었다. 봉군을 다시 채워야 한다.', 'wealth-3 happiness-2 living+2', '봉군 폐사', { dark: true }),
      ch('61391', 'honey_label', [28, 72], 0.1, '꿀 시세가 낮다. 소량 직거래와 도매 넘기기 사이에서 고민이다.', '어떻게 팔까?', [
        ['pure', '직접 소량 판매', 'wealth-1 happiness+2 relations+1 leisure-1', '단골에게 소량씩 팔았다. 물량은 적었지만 신뢰가 쌓였다.'],
        ['bulk', '도매로 넘긴다', 'wealth+2 happiness-1 relations-1', '한꺼번에 팔아 현금을 쥐었다. 값은 낮았다.']], 'bulk', '꿀 판로'),
      ev('61391', 'pollination_fee', [28, 72], 0.1, '인근 과수 농가가 수분 작업에 벌통을 빌려 달라고 했다.', 'wealth+2 relations+2', '수분용 벌통 임대', { cd: 4 }),
    ],
    hazard: 1, burnout: 0.03,
  }),
];
