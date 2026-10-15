import { X, E, tr, ev, ch } from '../jobs-kit.js';
export default [
  X('13903', {
    entry: [
      E('promote', { from: ['94209', '37101', '94201'], minYears: 6, ages: [36, 58], p: 0.08, text: '관리 실무를 오래 해 아파트 관리소장이 됐다.' }),
      E('hire', { minEdu: '4yr', ages: [34, 58], p: 0.04, text: '관리소장 공개 모집에 지원해 입주자대표회의 면접을 통과했다.' }),
    ],
    transitions: [
      tr('94209', [50, 64], 8, 0.03, '규모 작은 건물 관리로 옮겨'),
      tr('13902', [42, 56], 8, 0.03, '부동산 개발 관리자로 이직'),
      tr('37101', [48, 62], 8, 0.02, '총무로 자리를 옮겨'),
    ],
    events: [
      ev('13903', 'resident_complaint', [36, 64], 0.15, '층간소음과 주차 민원이 겹쳐 하루 종일 전화를 받았다.', 'happiness-2 relations-1 conflict+3', '입주민 민원', { dark: true, cd: 3 }),
      ch('13903', 'repair_fund', [38, 64], 0.12, '단지 외벽 보수 시기가 왔다. 장기수선충당금이 넉넉하지 않다.', '어떻게 안내할까?', [
        ['now', '이번에 진행', 'relations-2 happiness+1 intellect+1', '안전을 위해 올해 착수했다. 일부 세대가 부담금에 항의했다.'],
        ['later', '내년으로 미룬다', 'relations+1 happiness-1 leisure+1', '의결을 미뤘다. 균열 점검은 매달 하기로 했다.'],
      ], 'now', '보수 시기 결정'),
      ev('13903', 'contract_renewal', [38, 64], 0.1, '입주자대표회의에서 재계약 심의가 열렸다. 표결은 아슬아슬했다.', 'happiness-2 relations-1 job+3', '재계약 심의', { dark: true }),
      ev('13903', 'resident_thanks', [36, 64], 0.1, '한겨울 보일러 고장을 밤새 해결해 주민들이 고맙다는 쪽지를 붙였다.', 'happiness+3 relations+2', '주민 감사', { once: true }),
    ],
    hazard: 0, burnout: 0.06,
  }),
  X('15211', {
    entry: [
      E('promote', { from: ['44221'], minYears: 6, ages: [32, 52], p: 0.1, text: '프런트와 객실 업무를 거쳐 숙박업소 관리자가 됐다.' }),
      E('self', { minEdu: 'none', ages: [34, 58], p: 0.05, text: '작은 호텔과 게스트하우스를 인수해 직접 운영했다.' }),
      E('hire', { minEdu: '4yr', ages: [30, 48], p: 0.04, text: '숙박업체 경력 채용으로 지배인이 됐다.' }),
    ],
    transitions: [
      tr('15212', [38, 55], 6, 0.03, '여행 관련 관리자로 이동'),
      tr('15220', [38, 56], 6, 0.03, '외식 매장 관리자로 이동'),
      tr('52111', [42, 58], 8, 0.03, '독립해 가게를 인수'),
    ],
    events: [
      ev('15211', 'peak_season', [32, 60], 0.14, '성수기 만실이 이어져 객실 정비와 예약 정리를 직접 돕고 있다.', 'health-2 leisure-3 wealth+2', '성수기 운영', { dark: true, cd: 3 }),
      ch('15211', 'ota_fee', [32, 60], 0.12, '예약 플랫폼 수수료가 올라 객단가가 줄었다.', '어떻게 대응할까?', [
        ['direct', '직접 예약 유도', 'wealth-1 leisure-2 happiness+1', '홈페이지와 단골 혜택을 손봤다. 효과는 천천히 나타났다.'],
        ['stay', '수수료를 감수', 'wealth-2 leisure+1 happiness-1', '예약은 유지됐지만 남는 돈이 줄었다.'],
      ], 'direct', '예약 수수료', { dark: true, years: [2012, 2060] }),
      ev('15211', 'night_guest', [30, 58], 0.12, '새벽 만취 투숙객 항의에 프런트로 내려가 두 시간을 보냈다.', 'health-1 happiness-2 conflict+2', '야간 투숙객 응대', { dark: true }),
      ev('15211', 'repeat_guest', [30, 62], 0.1, '해마다 같은 방을 찾는 손님이 올해도 인사를 건넸다.', 'happiness+3 relations+2', '단골 투숙객', { once: true }),
    ],
    hazard: 0, burnout: 0.06,
  }),
  X('13122', {
    entry: [
      E('promote', { from: ['26219', '26211', '26212', '26213', '26214'], minYears: 20, ages: [48, 60], p: 0.1, text: '오랜 교직 경력과 승진 점수를 쌓아 교감·교장이 됐다.' }),
    ],
    transitions: [
      tr('26990', [55, 62], 10, 0.04, '다시 교실로 돌아가'),
      tr('26111', [56, 64], 15, 0.03, '대학 강의를 맡아'),
      tr('28151', [56, 64], 15, 0.02, '교육 컨설턴트로'),
    ],
    events: [
      ev('13122', 'school_conflict', [48, 62], 0.12, '학부모 민원이 이어져 교감으로서 양쪽 이야기를 듣느라 며칠을 썼다.', 'happiness-2 conflict+3 relations-1', '학교 민원 중재', { dark: true }),
      ch('13122', 'budget_plan', [48, 62], 0.12, '학교 예산이 한정됐다. 시설 보수와 방과후 프로그램 확대가 겹친다.', '어느 쪽에 쓸까?', [
        ['facility', '시설 보수', 'relations+1 happiness+1 intellect-1', '낡은 창호와 화장실을 고쳤다. 방과후 신청은 줄여야 했다.'],
        ['program', '프로그램 확대', 'relations+1 intellect+1 leisure-1', '프로그램이 늘었다. 보수 요청서는 다음 해로 넘겼다.'],
      ], 'facility', '학교 예산 사용'),
      ev('13122', 'graduation', [48, 62], 0.11, '졸업식에서 학생들이 직접 쓴 인사말을 들었다. 한 해가 끝난 느낌이었다.', 'happiness+3 relations+2', '졸업식', { once: true }),
      ev('13122', 'decline_students', [48, 62], 0.1, '학령인구가 줄어 학급 수 조정과 교원 배치를 다시 협의해야 한다.', 'happiness-2 relations-1 job+3', '학급 수 감소', { dark: true }),
    ],
    hazard: 0, burnout: 0.04,
  }),
  X('13133', {
    entry: [
      E('promote', { from: ['41120', '24911'], minYears: 15, ages: [42, 58], p: 0.08, text: '현장 지휘 경험과 승진 시험을 거쳐 소방 간부가 됐다.' }),
    ],
    transitions: [
      tr('23629', [50, 62], 15, 0.03, '소방 안전 기술직으로'),
      tr('35290', [50, 60], 15, 0.02, '재난 안전 행정직으로 이직'),
      tr('23631', [52, 62], 15, 0.03, '산업안전 관리로 이직'),
    ],
    events: [
      ev('13133', 'command_night', [40, 58], 0.14, '대형 화재 현장에서 밤새 지휘하고 아침에 보고서를 썼다.', 'health-3 leisure-3 job+2', '현장 지휘', { dark: true, cd: 3 }),
      ch('13133', 'manpower', [40, 58], 0.12, '출동 인원이 모자란 교대조가 생겼다. 휴일 근무를 부탁해야 한다.', '어떻게 배치할까?', [
        ['overtime', '초과근무 요청', 'relations-1 wealth+2 health-2', '대원들이 응해 줬지만 지친 얼굴이 보였다.'],
        ['rotate', '교대 재편성', 'relations+1 leisure-2 happiness-1', '배치표를 몇 번이나 고쳤다. 불만은 줄었지만 내 일은 늘었다.'],
      ], 'rotate', '교대 인력 배치'),
      ev('13133', 'rescue_commend', [40, 58], 0.1, '구조 활동으로 표창을 받았다. 대원들 이름을 먼저 불렀다.', 'happiness+3 relations+2', '구조 표창', { once: true }),
      ev('13133', 'drill_audit', [40, 58], 0.12, '합동 훈련 평가에서 문제점이 지적돼 개선 보고서를 두 번 써야 했다.', 'happiness-1 leisure-2 job+2', '훈련 평가 지적', { dark: true }),
    ],
    hazard: 2, burnout: 0.06,
  }),
  X('13502', {
    entry: [
      E('promote', { from: ['22231', '22232', '22221'], minYears: 8, ages: [32, 48], p: 0.1, text: '개발자로 일하다 개발팀장·PM을 맡게 됐다.' }),
      E('hire', { minEdu: '4yr', majors: ['eng'], ages: [32, 48], p: 0.04, text: '경력 채용으로 개발 조직 관리자가 됐다.' }),
    ],
    transitions: [
      tr('22231', [40, 52], 6, 0.05, '개발자로 다시 돌아가'),
      tr('11201', [38, 52], 10, 0.03, '창업해 대표가 되어'),
      tr('28151', [45, 58], 12, 0.03, 'IT 컨설턴트로 독립'),
    ],
    events: [
      ev('13502', 'release_crunch', [32, 55], 0.14, '출시 일정이 당겨져 팀원들과 주말 근무 일정을 짜야 했다.', 'health-2 relations-1 leisure-3', '출시 일정 압박', { dark: true, cd: 3 }),
      ch('13502', 'tech_debt', [32, 55], 0.12, '오래된 코드를 새로 짜자는 요구가 나왔다. 영업은 신기능을 기다린다.', '어떻게 결정할까?', [
        ['refactor', '구조 개편', 'intellect+2 happiness+1 relations-2', '두 분기 동안 신기능이 늦었고, 이후 배포가 한결 가벼워졌다.'],
        ['feature', '신기능 우선', 'wealth+1 relations+1 intellect-2', '일정은 지켰다. 개발자들 사이에 한숨이 늘었다.'],
      ], 'refactor', '기술 부채 결정'),
      ev('13502', 'ai_code_tool', [32, 56], 0.1, '코드 작성 보조 도구가 도입돼 팀 생산성과 역할 논의가 시작됐다.', 'intellect+1 leisure+1 tech+3', 'AI 개발 도구 도입', { years: [2022, 2060] }),
      ev('13502', 'team_attrition', [32, 55], 0.11, '핵심 개발자가 이직을 알려 와 일정과 인수인계를 새로 짜야 했다.', 'happiness-2 relations-1 job+3', '핵심 인력 이직', { dark: true }),
    ],
    hazard: 0, burnout: 0.08,
  }),
  X('14135', {
    entry: [
      E('promote', { from: ['23519', '23515', '23514'], minYears: 8, ages: [34, 52], p: 0.08, text: '기계 설계와 현장 경험을 쌓아 생산 관리자가 됐다.' }),
      E('hire', { minEdu: '4yr', majors: ['eng'], ages: [30, 48], p: 0.04, text: '제조업체 경력 채용으로 생산팀장이 됐다.' }),
    ],
    transitions: [
      tr('23631', [45, 58], 8, 0.03, '산업안전 관리로 이직'),
      tr('12124', [40, 54], 8, 0.03, '구매·자재 관리자로 이동'),
      tr('11201', [48, 60], 12, 0.02, '독립해 부품 회사를 차려'),
    ],
    events: [
      ev('14135', 'order_drop', [34, 58], 0.14, '주문 물량이 줄어 가동 시간 조정과 휴업 협의가 이어졌다.', 'happiness-3 relations-1 job+4', '주문 감소', { dark: true }),
      ch('14135', 'automation_cell', [34, 58], 0.12, '조립 라인에 자동화 설비를 들일지 논의 중이다.', '어떻게 의견을 낼까?', [
        ['adopt', '도입을 찬성', 'wealth+1 intellect+1 relations-2 tech+3', '설비가 들어왔고 일부 작업자의 업무가 바뀌었다.'],
        ['phase', '단계적 도입', 'relations+1 happiness+1 leisure-1', '한 공정씩 시범 운영했다. 효과가 나올 때까지 시간이 걸렸다.'],
      ], 'phase', '자동화 설비 도입'),
      ev('14135', 'defect_zero', [34, 58], 0.1, '불량률이 반년째 목표 아래다. 반장들과 함께 밥을 먹었다.', 'happiness+3 relations+2 intellect+1', '불량률 개선', { once: true }),
      ev('14135', 'safety_incident', [34, 58], 0.1, '프레스 공정에서 작업자가 손을 다쳐 사고 보고와 점검이 이어졌다.', 'happiness-2 health-1 job+2', '현장 안전사고', { dark: true }),
    ],
    hazard: 1, burnout: 0.05,
  }),
  X('A0110', {
    entry: [
      E('promote', { from: ['A0120'], minYears: 12, ages: [34, 48], p: 0.2, text: '위관 장교로 근무하다 소령 이상으로 진급했다.' }),
    ],
    transitions: [
      tr('12121', [45, 56], 15, 0.05, '전역 후 기업 총무·안전 담당'),
      tr('35290', [43, 54], 15, 0.04, '전역 후 공무원 경력 채용'),
      tr('28151', [46, 58], 18, 0.02, '전역 후 안보 컨설턴트'),
    ],
    events: [
      ev('A0110', 'staff_exercise', [34, 54], 0.15, '대규모 합동 훈련 기간에 참모로서 며칠 집에 가지 못했다.', 'health-2 relations-2 leisure-3', '훈련 참모 근무', { dark: true, cd: 3 }),
      ch('A0110', 'command_offer', [36, 52], 0.12, '지방 부대 지휘관 보직 제의가 왔다. 가족은 학교 문제가 걸려 있다.', '어떻게 할까?', [
        ['accept', '보직 수락', 'wealth+2 happiness+1 relations-3', '지휘관으로 부임했고, 가족과는 주말에 만났다.'],
        ['decline', '정중히 사양', 'relations+2 happiness+1 wealth-2', '승진 심사에서 이 선택이 어떻게 평가될지 신경이 쓰였다.'],
      ], 'accept', '지휘관 보직'),
      ev('A0110', 'promotion_stall', [38, 54], 0.12, '진급 심사에서 또 누락됐다. 정년 시점을 헤아리게 됐다.', 'happiness-3 relations-1 job+5', '진급 누락', { dark: true, once: true }),
      ev('A0110', 'unit_review', [36, 54], 0.1, '부대 종합평가에서 우수 평가를 받아 간부들과 소박한 회식을 했다.', 'happiness+3 relations+2', '부대 평가', { once: true }),
    ],
    hazard: 1, burnout: 0.05,
  }),
  X('A0200', {
    entry: [
      E('promote', { from: ['A0300'], minYears: 10, ages: [36, 52], p: 0.15, text: '부사관 근무 경력과 선발 시험을 거쳐 준위로 임관했다.' }),
    ],
    transitions: [
      tr('41231', [48, 60], 10, 0.05, '전역 후 경비·보안 업체'),
      tr('35290', [45, 56], 10, 0.03, '전역 후 공무원 채용'),
      tr('94209', [50, 62], 10, 0.03, '전역 후 시설 관리'),
    ],
    events: [
      ev('A0200', 'tech_mentor', [38, 56], 0.14, '정비 분야 후배 부사관들이 찾아와 현장 기술을 물었다.', 'happiness+2 relations+2 intellect+1', '기술 전수'),
      ch('A0200', 'overseas_duty', [38, 54], 0.1, '장기 해외 파견 근무 제의가 왔다. 수당은 두 배에 가깝다.', '어떻게 할까?', [
        ['go', '파견을 간다', 'wealth+3 relations-3 health-1', '가족과 떨어져 일했다. 귀국 후 통장 잔액이 늘어 있었다.'],
        ['stay', '국내 근무 유지', 'relations+2 happiness+1 wealth-2', '아이 졸업식까지 함께 있었다. 다른 기회는 지나갔다.'],
      ], 'stay', '해외 파견 제의'),
      ev('A0200', 'night_alert', [38, 56], 0.12, '비상 대기 소집이 이어져 몇 주째 숙소와 부대만 오갔다.', 'health-2 relations-1 leisure-3', '비상 대기', { dark: true }),
      ev('A0200', 'retire_prep', [46, 58], 0.12, '전역 후 일을 알아보려 하니 경력을 설명할 말부터 정리해야 했다.', 'happiness-2 leisure-1 job+4', '전역 준비 막막함', { dark: true, once: true }),
    ],
    hazard: 2, burnout: 0.04,
  }),
];
