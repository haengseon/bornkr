import { X, E, tr, ev, ch } from '../jobs-kit.js';

export default [
  X('44211', {
    entry: [
      E('license', { license: 'tech', minEdu: 'high', ages: [22, 60], p: 0.4, years: 1, text: '관광 안내 자격을 따고 여행사에 안내사로 등록했다.' }),
      E('hire', { minEdu: 'high', ages: [22, 55], p: 0.15, text: '여행사 사무직으로 일하다 현장 안내를 맡게 됐다.' }),
    ],
    transitions: [
      tr('44212', [26, 55], 3, 0.04, '해외 여행 안내로'),
      tr('44213', [28, 58], 4, 0.03, '관광 통역 안내로'),
      tr('44216', [38, 65], 5, 0.03, '해설사로 이동'),
    ],
    events: [
      ev('44211', 'full_bus', [22, 62], 0.14, '관광버스 마흔 명의 일정과 식당 예약을 하루 종일 맞췄다.', 'happiness+1 leisure-1 intellect+1', '단체 인솔'),
      ev('44211', 'no_show_tour', [22, 62], 0.13, '폭우로 당일 투어가 취소돼 안내비를 받지 못했다.', 'wealth-2 happiness-1', '투어 취소', { dark: true, cd: 3 }),
      ev('44211', 'shopping_pressure', [22, 60], 0.1, '여행사가 쇼핑점 방문을 일정에 넣으라고 압박했다.', 'happiness-2 conflict+2 fairness+1', '쇼핑 일정 압박', { dark: true, cd: 4 }),
      ch('44211', 'tour_review', [22, 62], 0.11, '고객이 안내가 좋았다며 다음 투어에 나를 지명했다.', '어떻게 할까?', [
        ['agency', '여행사 통해 받는다', 'wealth+1 relations+1 leisure-1', '여행사를 통해 일정을 받았다. 수수료가 빠졌지만 일은 이어졌다.'],
        ['direct', '직접 맡아 본다', 'wealth+2 leisure-2 conflict+1', '고객과 직접 일정을 짰다. 늘어난 일은 혼자 해야 했다.'],
      ], 'agency', '지명 투어'),
    ],
    hazard: 1, burnout: 0.04,
  }),
  X('44212', {
    entry: [
      E('hire', { minEdu: '2yr', ages: [22, 50], p: 0.3, era: [1983, null], text: '해외 패키지 여행사에 입사해 인솔자로 일하기 시작했다.' }),
      E('self', { minEdu: 'high', ages: [28, 58], p: 0.08, era: [1989, null], text: '소규모 맞춤 여행 사업을 시작했다.' }),
    ],
    transitions: [
      tr('44211', [28, 58], 3, 0.04, '국내 여행 안내로'),
      tr('44213', [28, 58], 4, 0.03, '통역 안내로'),
      tr('44110', [24, 36], 3, 0.02, '항공사 승무원으로'),
    ],
    events: [
      ev('44212', 'tour_leader', [24, 58], 0.14, '이십 일 만에 돌아온 귀국편에서 일정표를 접었다. 몸은 지쳤다.', 'health-2 leisure-1 intellect+1', '장기 인솔'),
      ev('44212', 'pandemic_zero', [24, 62], 0.3, '해외 여행길이 막혀 일정이 줄줄이 취소됐다. 일감이 없다.', 'wealth-4 happiness-3 job+6', '여행 중단', { dark: true, once: true, years: [2020, 2022] }),
      ev('44212', 'lost_passport', [24, 60], 0.08, '손님이 여권을 잃어 현지 대사관을 오가며 반나절을 썼다.', 'happiness-1 intellect+1 relations+1', '여권 분실 대응'),
      ch('44212', 'region_pick', [26, 58], 0.1, '새 지역 상품을 맡을 인솔자를 찾는다. 낯선 곳이다.', '어떻게 할까?', [
        ['new', '새 지역을 맡는다', 'intellect+2 leisure-2 health-1', '새 지역 일정을 공부해 인솔했다. 시행착오가 있었다.'],
        ['old', '익숙한 지역을 유지', 'happiness+1 intellect-1 wealth-1', '익숙한 지역만 맡았다. 일은 편했다.'],
      ], 'old', '새 상품 제안'),
    ],
    hazard: 1, burnout: 0.05,
  }),
  X('44213', {
    entry: [
      E('license', { license: 'tech', minEdu: 'high', ages: [22, 60], p: 0.4, years: 1, text: '외국어 시험과 면접을 거쳐 관광통역안내 자격을 땄다.' }),
      E('self', { minEdu: 'high', ages: [28, 62], p: 0.2, text: '프리랜서 통역 가이드로 여행사 일을 받기 시작했다.' }),
    ],
    transitions: [
      tr('44212', [26, 58], 3, 0.04, '해외 여행 안내로'),
      tr('44216', [38, 65], 4, 0.03, '문화관광 해설사로'),
      tr('29141', [30, 58], 5, 0.02, '번역 일로 이동'),
    ],
    events: [
      ev('44213', 'foreign_group', [22, 62], 0.14, '외국 단체 관광객이 궁궐 설명이 쉬웠다며 박수를 보냈다.', 'happiness+3 intellect+1', '손님의 호응'),
      ev('44213', 'idle_season', [22, 62], 0.12, '관광객이 줄어 한 달 내내 일정 요청이 없었다.', 'wealth-3 happiness-1 job+2', '비수기 일감', { dark: true, who: 'self', cd: 3 }),
      ev('44213', 'ai_translator', [24, 62], 0.1, '통역 앱을 쓰는 손님이 늘어 짧은 안내 의뢰가 줄었다.', 'wealth-1 tech+3 job+2', '번역 앱 확산', { dark: true, years: [2018, 2100], cd: 4 }),
      ch('44213', 'cert_langs', [24, 56], 0.1, '두 번째 외국어 안내 자격을 따 볼 기회가 생겼다.', '어떻게 할까?', [
        ['study', '공부한다', 'intellect+3 leisure-3 wealth-1', '퇴근 후 공부해 새 언어 안내로 영역을 넓혔다.'],
        ['skip', '지금 일에 집중', 'wealth+1 leisure+1 intellect-1', '새 언어는 접고 지금 일을 다듬었다.'],
      ], 'skip', '추가 언어 자격'),
    ],
    hazard: 1, burnout: 0.04,
  }),
  X('44216', {
    entry: [
      E('hire', { minEdu: 'high', ages: [40, 70], p: 0.3, era: [2002, null], text: '지자체 해설사 교육을 마치고 숲 해설을 맡게 됐다.' }),
      E('hire', { minEdu: '2yr', ages: [28, 60], p: 0.15, era: [2002, null], text: '지역 문화관광 해설사로 위촉됐다.' }),
    ],
    transitions: [
      tr('44211', [30, 62], 3, 0.03, '국내 여행 안내로'),
      tr('44213', [30, 62], 3, 0.02, '통역 안내로'),
      tr('29640', [30, 60], 3, 0.02, '체험 강사로 이동'),
    ],
    events: [
      ev('44216', 'forest_kids', [30, 72], 0.14, '숲 체험에 온 아이들이 도토리를 쥐고 질문을 쏟아냈다.', 'happiness+3 relations+1', '아이들과의 해설'),
      ev('44216', 'stipend_only', [35, 72], 0.1, '해설 수당이 활동비 수준이라 생활비로는 모자란다.', 'wealth-2 happiness-1 living+1', '낮은 활동비', { dark: true, cd: 4 }),
      ev('44216', 'trail_study', [30, 72], 0.1, '옛 마을 이야기를 공부해 해설 원고를 새로 썼다.', 'intellect+2 happiness+1', '해설 원고'),
      ch('44216', 'weekend_walk', [35, 72], 0.12, '주말 탐방객이 몰려 추가 해설을 부탁받았다.', '어떻게 할까?', [
        ['extra', '추가로 맡는다', 'relations+1 health-2 leisure-2 wealth+1', '주말 내내 걷고 설명했다. 다음 날 다리가 무거웠다.'],
        ['rest', '정해진 만큼만', 'leisure+2 happiness+1 relations-1', '정해진 시간만 해설했다. 일부 손님은 아쉬워했다.'],
      ], 'rest', '추가 해설 요청'),
    ],
    burnout: 0.03,
  }),
  X('44221', {
    entry: [
      E('hire', { minEdu: '2yr', ages: [20, 38], p: 0.3, text: '호텔 프런트와 벨 서비스에 신입으로 입사했다.' }),
      E('hire', { minEdu: 'high', ages: [18, 40], p: 0.15, text: '호텔 하우스키핑에서 시작해 객실 서비스를 맡았다.' }),
    ],
    transitions: [
      tr('44229', [26, 55], 3, 0.03, '다른 숙박업소로'),
      tr('15220', [30, 56], 8, 0.03, '호텔 관리자로 승진'),
      tr('44211', [28, 55], 3, 0.02, '여행 안내로 이동'),
    ],
    events: [
      ev('44221', 'vip_check_in', [20, 55], 0.12, '단체 체크인이 몰린 날 프런트 줄이 로비 끝까지 이어졌다.', 'happiness+1 intellect+1 health-1', '체크인 집중'),
      ev('44221', 'complaint_night', [20, 58], 0.15, '새벽에 투숙객이 방이 시끄럽다며 거듭 전화했다.', 'happiness-2 health-1 conflict+1', '투숙객 항의', { dark: true, cd: 3 }),
      ev('44221', 'guest_thanks', [20, 60], 0.1, '오래 묵은 손님이 떠나며 이름을 불러 인사했다.', 'happiness+2 relations+1', '손님의 인사'),
      ch('44221', 'night_audit', [22, 55], 0.12, '야간 근무 인력이 모자라 주 이틀 더 서 달라는 부탁이 왔다.', '어떻게 할까?', [
        ['take', '야간을 더 선다', 'wealth+2 health-2 leisure-2', '야간 수당이 붙었다. 낮잠으로 버티는 날이 늘었다.'],
        ['decline', '거절한다', 'leisure+2 relations-1 job+1', '거절하자 팀에서 한동안 말이 줄었다.'],
      ], 'decline', '야간 근무 부탁'),
    ],
    hazard: 1, burnout: 0.06,
  }),
  X('44229', {
    entry: [
      E('hire', { minEdu: 'none', ages: [20, 65], p: 0.35, text: '모텔과 게스트하우스에서 프런트 일을 시작했다.' }),
      E('self', { minEdu: 'high', ages: [30, 65], p: 0.15, text: '작은 숙소를 인수해 직접 운영하기 시작했다.' }),
    ],
    transitions: [
      tr('44221', [24, 50], 3, 0.04, '호텔로 이동'),
      tr('41231', [35, 62], 3, 0.02, '시설 경비로'),
      tr('44299', [26, 58], 3, 0.03, '여가 시설 일로'),
    ],
    events: [
      ev('44229', 'night_front', [20, 65], 0.15, '혼자 지키는 야간 프런트에서 새벽까지 손님 응대가 이어졌다.', 'health-2 leisure-1', '야간 프런트', { dark: true, cd: 3 }),
      ev('44229', 'review_five', [22, 65], 0.11, '숙박 앱에 깨끗하다는 후기가 연달아 올라 예약이 늘었다.', 'wealth+2 happiness+2', '숙박 후기', { years: [2012, 2100] }),
      ev('44229', 'ota_commission', [28, 65], 0.12, '예약 플랫폼 수수료가 올라 방을 채워도 남는 돈이 줄었다.', 'wealth-2 happiness-1 fairness+1', '예약 수수료 인상', { dark: true, who: 'self', years: [2014, 2100], cd: 4 }),
      ch('44229', 'renovation', [30, 65], 0.1, '낡은 객실 내부를 고칠 때가 됐다.', '어떻게 할까?', [
        ['reno', '대출로 고친다', 'wealth-1 happiness+1 leisure-1 debt+2500', '객실 몇 개를 먼저 고쳤다. 후기 점수가 조금 올랐다.'],
        ['hold', '버틴다', 'wealth+1 happiness-1', '고치지 않고 요금만 조정했다. 손님 불만이 늘었다.'],
      ], 'hold', '객실 보수', { who: 'self' }),
    ],
    hazard: 1, burnout: 0.05,
  }),
];
