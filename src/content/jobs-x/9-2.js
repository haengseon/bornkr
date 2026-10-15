import { X, E, tr, ev, ch } from '../jobs-kit.js';
export default [
  X('95310', {
    entry: [
      E('hire', { minEdu: 'none', ages: [18, 60], p: 0.4, text: '주유소 아르바이트로 들어가 주유와 세차 안내를 맡았다.' }),
      E('hire', { minEdu: 'none', ages: [30, 65], p: 0.15, text: '주유소 정직원으로 채용되어 교대 근무에 들어갔다.' }),
    ],
    transitions: [tr('99231', [20, 62], 2, 0.05, '주차 관리로 이동'), tr('95391', [20, 55], 1, 0.05, '매장 정리로 이동'), tr('92299', [20, 55], 1, 0.04, '배달 일로 이동')],
    events: [
      ev('95310', 'fuel_fume', [18, 62], 0.11, '기름 냄새와 배기가스 속에서 하루를 보내 두통이 났다.', 'health-2 medical+1', '유증기 노출', { dark: true }),
      ev('95310', 'regular_tip', [18, 62], 0.12, '단골 손님이 수고한다며 음료를 건넸다.', 'happiness+2 relations+1', '단골 인사'),
      ch('95310', 'self_pump', [20, 62], 0.1, '셀프 주유기가 늘어 인력 감축 이야기가 나왔다.', '어떻게 할까?', [
        ['skill', '정비 안내·세차까지 배운다', 'intellect+2 wealth-1 leisure-2', '맡을 일이 넓어졌다. 쉬는 시간이 줄었다.'],
        ['wait', '지금 일만 한다', 'leisure+1 happiness+1 job-2', '편했다. 근무 시간이 줄어들었다.'],
      ], 'skill', '셀프 주유 확대', { dark: true, years: [2005, 2060] }),
      ev('95310', 'night_shift', [18, 55], 0.1, '야간 교대가 이어져 낮에 잠들지 못했다.', 'health-2 leisure-1 wealth+1', '야간 교대'),
    ],
    hazard: 1, burnout: 0.05,
  }),
  X('95391', {
    entry: [
      E('hire', { minEdu: 'none', ages: [18, 65], p: 0.4, era: [1995, null], text: '대형 매장에 들어가 진열대 정리와 재고 채우기를 맡았다.' }),
      E('hire', { minEdu: 'none', ages: [25, 70], p: 0.2, era: [1995, null], text: '새벽 입고 시간대 파트로 채용되어 물건을 정리했다.' }),
    ],
    transitions: [tr('99999', [20, 62], 2, 0.05, '서비스 단순직으로 이동'), tr('95399', [20, 62], 2, 0.05, '판매 보조로 이동'), tr('92120', [22, 58], 2, 0.04, '물류 분류로 이동')],
    events: [
      ev('95391', 'stock_dawn', [18, 65], 0.12, '새벽에 들어온 상자를 풀어 진열대를 다 채웠다. 개점 전에 끝냈다.', 'health-1 job+1 happiness+1', '입고 정리'),
      ev('95391', 'expiry_check', [18, 65], 0.11, '유통기한 점검에서 놓친 물건이 있어 점장에게 지적을 받았다.', 'happiness-2 conflict+1', '검수 실수', { dark: true }),
      ch('95391', 'sale_event', [18, 62], 0.1, '세일 기간이라 주말 근무가 늘어난다고 한다.', '어떻게 할까?', [
        ['work', '주말 근무를 한다', 'wealth+3 leisure-2 health-1', '수당을 받았다. 쉬는 날이 사라졌다.'],
        ['rest', '평일만 일한다', 'leisure+2 relations+1 wealth-2', '쉴 수 있었다. 근무 시간이 줄었다.'],
      ], 'work', '세일 주말 근무'),
      ev('95391', 'schedule_cut', [18, 62], 0.1, '본사 지침으로 정리 인력 시간이 줄었다.', 'wealth-2 job-1', '시간 단축', { dark: true }),
    ],
    hazard: 1, burnout: 0.05,
  }),
  X('95392', {
    entry: [
      E('self', { minEdu: 'none', ages: [18, 70], p: 0.4, text: '전단지 배포 일당 일을 받아 아파트 단지를 돌았다.' }),
      E('hire', { minEdu: 'none', ages: [20, 70], p: 0.2, text: '광고 대행사에 소속되어 벽보 붙이는 일을 맡았다.' }),
    ],
    transitions: [tr('92299', [20, 55], 1, 0.06, '배달 일로 이동'), tr('95391', [20, 60], 1, 0.05, '매장 정리로 이동'), tr('94130', [40, 72], 2, 0.04, '거리 청소로 이동')],
    events: [
      ev('95392', 'rain_flyer', [18, 70], 0.12, '비에 젖은 전단지를 들고 계속 돌았다. 일당은 그대로였다.', 'health-1 wealth-1 happiness-1', '궂은 날씨', { dark: true }),
      ev('95392', 'shop_thanks', [18, 70], 0.11, '개업 가게 사장이 효과가 좋았다며 일당에 웃돈을 얹었다.', 'wealth+2 happiness+2', '광고 효과'),
      ch('95392', 'apartment_ban', [18, 65], 0.1, '단지 경비가 전단지를 붙이지 말라고 막았다.', '어떻게 할까?', [
        ['go', '다른 단지로 옮긴다', 'leisure-1 wealth+1 health-1', '걸음이 늘었다. 일을 마쳤다.'],
        ['ask', '경비에게 사정을 말한다', 'relations+2 wealth-1 happiness+1', '이해를 받았다. 배포 수량은 줄었다.'],
      ], 'go', '출입 제한'),
      ev('95392', 'online_ad', [18, 70], 0.1, '온라인 광고가 늘어 전단지 주문이 줄었다.', 'wealth-2 tech+2 job-1', '광고 매체 변화', { dark: true, years: [2010, 2060] }),
    ],
    hazard: 1, burnout: 0.04,
  }),
  X('92112', {
    entry: [
      E('hire', { minEdu: 'none', ages: [20, 55], p: 0.4, text: '이사 업체에 들어가 가구와 박스를 나르는 일을 배웠다.' }),
      E('self', { minEdu: 'none', ages: [30, 55], p: 0.1, text: '트럭을 마련해 소규모 이사 일감을 직접 받았다.' }),
    ],
    transitions: [tr('92111', [20, 58], 2, 0.05, '하역 일로 이동'), tr('92220', [22, 55], 2, 0.05, '택배 일로 이동'), tr('91001', [22, 58], 2, 0.04, '건설 현장으로 이동')],
    events: [
      ev('92112', 'ladder_truck', [20, 58], 0.12, '고층 이사에 사다리차가 들어와 하루 일이 수월했다.', 'health+1 happiness+1 wealth+1', '장비 도움'),
      ev('92112', 'back_strain', [20, 58], 0.13, '무거운 장롱을 들다 허리를 삐끗했다. 며칠 쉬었다.', 'health-3 wealth-2 medical+1', '허리 부담', { dark: true }),
      ch('92112', 'damage_claim', [22, 58], 0.1, '운반 중 식탁 모서리가 긁혔다. 고객이 보상을 요구했다.', '어떻게 할까?', [
        ['pay', '수리비를 낸다', 'wealth-3 relations+2 happiness+1', '돈이 나갔다. 고객이 후기를 좋게 남겼다.'],
        ['argue', '사진으로 확인을 요청한다', 'wealth+1 conflict+1 happiness-2', '비용은 줄었다. 분위기가 험악해졌다.'],
      ], 'pay', '파손 분쟁'),
      ev('92112', 'peak_move', [20, 58], 0.12, '손 없는 날과 말일이 겹쳐 하루에 세 집을 옮겼다.', 'wealth+3 health-2 leisure-1', '성수기 이사'),
    ],
    hazard: 3, burnout: 0.06,
  }),
  X('92119', {
    entry: [
      E('hire', { minEdu: 'none', ages: [18, 62], p: 0.4, text: '항만 창고에서 적재와 하역 일당을 받기 시작했다.' }),
      E('hire', { minEdu: 'none', ages: [20, 62], p: 0.2, text: '농산물 도매시장에서 상자 나르는 일을 맡았다.' }),
    ],
    transitions: [tr('92111', [20, 60], 2, 0.06, '상하차 일로 이동'), tr('92120', [20, 60], 2, 0.05, '화물 분류로 이동'), tr('92112', [20, 55], 2, 0.04, '이삿짐 운반으로 이동')],
    events: [
      ev('92119', 'night_unload', [18, 62], 0.12, '밤샘 하역이 이어졌다. 일당은 올랐지만 눈이 뻑뻑했다.', 'wealth+3 health-2 leisure-1', '야간 하역'),
      ev('92119', 'forklift_close', [20, 62], 0.11, '지게차가 곁을 스치고 지나갔다. 현장에서 안전 점검을 다시 했다.', 'health-1 happiness-1 conflict+1', '장비 근접', { dark: true }),
      ev('92119', 'foreman_trust', [22, 62], 0.1, '반장이 일 배정 때 나를 먼저 불러 주었다.', 'happiness+2 job+1 relations+1', '신뢰 쌓임'),
      ch('92119', 'wage_delay', [20, 62], 0.1, '소개업체가 일당 지급을 며칠 미루겠다고 했다.', '어떻게 할까?', [
        ['wait', '기다린다', 'wealth-1 relations+1 happiness-1', '며칠 뒤 돈이 들어왔다. 생활이 빠듯했다.'],
        ['switch', '다른 업체로 옮긴다', 'wealth+1 fairness+1 relations-2', '일당을 바로 받는 곳을 찾았다. 익숙한 자리를 잃었다.'],
      ], 'wait', '일당 지연', { dark: true }),
    ],
    hazard: 3, burnout: 0.06,
  }),
  X('99211', {
    entry: [
      E('hire', { minEdu: 'none', ages: [30, 70], p: 0.4, text: '검침 위탁업체에 채용되어 집집마다 계량기를 확인했다.' }),
      E('hire', { minEdu: 'none', ages: [35, 70], p: 0.15, text: '지역 검침 구역을 넘겨받아 매달 순회했다.' }),
    ],
    transitions: [tr('99212', [30, 65], 2, 0.05, '가스 점검으로 이동'), tr('99940', [30, 65], 2, 0.04, '방문 점검으로 이동'), tr('92249', [30, 62], 2, 0.04, '정기 배달로 이동')],
    events: [
      ev('99211', 'dog_bark', [30, 70], 0.11, '대문 안쪽 개가 짖으며 달려들어 놀랐다. 검침은 뒤로 미뤘다.', 'happiness-1 health-1', '위험 구역', { dark: true }),
      ev('99211', 'fast_route', [30, 70], 0.12, '구역 동선을 새로 짜 반나절 일을 끝냈다.', 'happiness+2 leisure+1 job+1', '효율 개선'),
      ch('99211', 'remote_meter', [30, 68], 0.1, '원격 검침기가 늘어 담당 구역이 줄어든다고 한다.', '어떻게 할까?', [
        ['learn', '단말기 점검을 배운다', 'intellect+2 tech+1 leisure-1', '새 장비를 다루게 되었다. 일은 바뀌었다.'],
        ['stay', '남은 구역을 돈다', 'happiness+1 job-2 leisure+1', '익숙한 일이 이어졌다. 일감은 줄었다.'],
      ], 'learn', '원격 검침 확대', { dark: true, years: [2010, 2060] }),
      ev('99211', 'neighbor_chat', [30, 70], 0.1, '할머니가 오래 이야기를 걸며 차를 내주었다.', 'happiness+2 relations+1', '주민과의 대화'),
    ],
    hazard: 1, burnout: 0.04,
  }),
  X('99212', {
    entry: [
      E('hire', { minEdu: 'none', ages: [25, 62], p: 0.4, era: [1978, null], text: '도시가스 점검 업체에 들어가 가정 방문 점검을 시작했다.' }),
      E('promote', { from: ['99211'], minYears: 2, ages: [28, 62], p: 0.1, text: '검침 경력으로 안전 점검 업무를 맡게 되었다.' }),
    ],
    transitions: [tr('99211', [28, 65], 2, 0.05, '검침으로 이동'), tr('99940', [28, 65], 2, 0.04, '대여 제품 점검으로 이동'), tr('94209', [35, 65], 3, 0.04, '건물 관리로 이동')],
    events: [
      ev('99212', 'leak_found', [25, 62], 0.12, '점검 중 배관 연결부 누출을 발견해 밸브를 잠갔다. 집주인이 고마워했다.', 'happiness+2 relations+1 job+1', '안전 조치'),
      ev('99212', 'visit_refuse', [25, 62], 0.12, '방문을 꺼리는 가구가 많아 약속을 몇 번이나 다시 잡았다.', 'happiness-2 leisure-1', '점검 거부', { dark: true }),
      ch('99212', 'quota_visit', [25, 62], 0.1, '월 점검 건수를 채우라는 지시가 내려왔다.', '어떻게 할까?', [
        ['rush', '하루 건수를 늘린다', 'wealth+2 health-2 conflict+1', '건수는 채웠다. 꼼꼼히 보지 못한 곳이 마음에 걸렸다.'],
        ['care', '정해진 만큼 꼼꼼히 본다', 'happiness+2 wealth-1 job-1', '점검은 정확했다. 평가는 평범했다.'],
      ], 'care', '건수 압박'),
      ev('99212', 'night_call', [25, 62], 0.1, '가스 냄새가 난다는 야간 신고에 출동했다.', 'health-1 leisure-2 happiness+1', '야간 출동'),
    ],
    hazard: 1, burnout: 0.05,
  }),
  X('99220', {
    entry: [
      E('hire', { minEdu: 'none', ages: [22, 62], p: 0.4, era: [1980, null], text: '자동판매기 운영 업체에 채용되어 음료를 채우는 일을 맡았다.' }),
      E('self', { minEdu: 'none', ages: [30, 62], p: 0.1, era: [1980, null], text: '자판기 몇 대를 들여 위치를 직접 관리했다.' }),
    ],
    transitions: [tr('92299', [22, 58], 2, 0.05, '배달 일로 이동'), tr('92249', [25, 62], 2, 0.04, '정기 배달로 이동'), tr('95391', [22, 58], 2, 0.04, '매장 정리로 이동')],
    events: [
      ev('99220', 'refill_round', [22, 62], 0.12, '여름철 음료 소진이 빨라 새벽부터 보충을 돌았다.', 'wealth+2 health-1 leisure-1', '성수기 보충'),
      ev('99220', 'machine_broken', [22, 62], 0.12, '누군가 자판기 문을 부수고 동전통을 비웠다. 수리비가 들었다.', 'wealth-2 conflict+1 happiness-1', '기기 훼손', { dark: true }),
      ch('99220', 'site_change', [25, 62], 0.1, '건물주가 자판기 자리 임대료를 올리겠다고 했다.', '어떻게 할까?', [
        ['pay', '올려 주고 둔다', 'wealth-2 happiness+1 job+1', '자리는 지켰다. 마진이 줄었다.'],
        ['move', '다른 자리로 옮긴다', 'wealth-1 leisure-2 intellect+1', '옮긴 곳 매출이 낯설었다. 이동에 시간이 걸렸다.'],
      ], 'pay', '자리 임대료', { dark: true }),
      ev('99220', 'regular_spot', [22, 62], 0.1, '학교 앞 기기가 방학 뒤 다시 잘 팔렸다.', 'happiness+2 wealth+1', '매출 회복'),
    ],
    hazard: 1, burnout: 0.04,
  }),
];
