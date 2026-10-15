import { X, E, tr, ev, ch } from '../jobs-kit.js';
export default [
  X('87292', {
    entry: [
      E('license', { license: 'drive', minEdu: 'none', ages: [24, 64], p: 0.3, years: 0, text: '운전 자격을 갖추고 렌터카 업체에서 차량 인수·인도를 맡았다.' }),
      E('hire', { license: 'drive', minEdu: 'none', ages: [25, 66], p: 0.2, text: '공항 인근 렌터카 지점에서 탁송 기사로 일을 시작했다.' }),
    ],
    transitions: [tr('87291', [28, 62], 2, 0.04, '승용·승합 운전으로 이동'), tr('87293', [28, 64], 2, 0.03, '대리운전으로 이동'), tr('87210', [30, 62], 3, 0.03, '택시 운전으로 이동')],
    events: [
      ev('87292', 'holiday_rush', [25, 62], 0.13, '연휴에 반납 차량이 한꺼번에 몰려 점검할 틈이 없었다.', 'health-1 leisure-2 wealth+2', '연휴 반납 폭주'),
      ev('87292', 'damage_dispute', [25, 62], 0.12, '반납 차량 흠집을 두고 고객과 오래 실랑이를 벌였다.', 'happiness-2 conflict+2 relations-1', '파손 분쟁 감정노동', { dark: true }),
      ev('87292', 'regular_client', [25, 62], 0.1, '출장이 잦은 단골 고객이 차를 맡기며 이름을 불러 주었다.', 'happiness+2 relations+2', '단골 고객'),
      ev('87292', 'ev_charge', [26, 62], 0.1, '전기차가 늘어 충전 상태와 주행거리를 점검할 일이 늘었다.', 'intellect+1 leisure-1', '전기차 대여 증가', { years: [2018, 2060] }),
    ],
    hazard: 1, burnout: 0.04,
  }),
  X('87295', {
    entry: [
      E('license', { license: 'drive', minEdu: 'none', ages: [26, 64], p: 0.3, years: 0, text: '운전 자격과 응급 교육을 마치고 구급차 운전원이 되었다.' }),
      E('hire', { license: 'drive', minEdu: 'none', ages: [26, 62], p: 0.2, text: '병원 이송 업무를 하다 구급차 운전을 맡았다.' }),
    ],
    transitions: [tr('87291', [30, 62], 3, 0.03, '승합차 운전으로 이동'), tr('87221', [30, 60], 3, 0.03, '버스 운전으로 이동'), tr('41231', [55, 70], 3, 0.03, '경비 일로 이동')],
    events: [
      ev('87295', 'fast_arrival', [26, 62], 0.12, '막히는 길을 빠져나가 환자를 제때 병원에 넘겼다. 의료진이 고개를 끄덕였다.', 'happiness+3 relations+1', '신속 이송 보람'),
      ev('87295', 'night_call', [26, 62], 0.14, '당직 중 새벽 출동이 연달아 이어져 잠을 거의 못 잤다.', 'health-3 leisure-1', '야간 출동 누적', { dark: true }),
      ch('87295', 'private_ask', [28, 62], 0.1, '보호자가 비응급 이송을 급히 부탁하며 따로 비용을 건넸다.', '어떻게 할까?', [
        ['follow', '규정대로 접수', 'relations-1 happiness+1 intellect+1', '서류를 거쳐 처리하자 보호자가 서운해했다.'],
        ['help', '사정을 듣고 돕는다', 'relations+2 happiness-1 wealth+1', '돕긴 했지만 나중에 업체에서 주의를 받았다.'],
      ], 'follow', '비응급 이송 부탁'),
      ev('87295', 'abuse_word', [26, 62], 0.1, '출동 현장에서 흥분한 가족에게 거친 말을 들었다.', 'happiness-3 relations-1', '현장 폭언', { dark: true }),
    ],
    hazard: 2, burnout: 0.06,
  }),
  X('87408', {
    entry: [
      E('license', { license: 'drive', minEdu: 'none', ages: [26, 62], p: 0.35, years: 0, text: '건설기계 자격을 따서 덤프트럭 기사로 현장에 나갔다.' }),
      E('self', { license: 'drive', minEdu: 'none', ages: [32, 60], p: 0.12, text: '빚을 내 덤프트럭을 사서 지입으로 일하기 시작했다.' }),
    ],
    transitions: [tr('87407', [28, 60], 3, 0.04, '믹서 트럭으로 이동'), tr('87406', [30, 60], 3, 0.03, '굴착기 운전으로 이동'), tr('87233', [30, 60], 3, 0.04, '대형 화물차로 이동')],
    events: [
      ev('87408', 'full_loads', [28, 62], 0.12, '토목 현장 일감이 이어져 한 달 내내 회차를 채웠다.', 'wealth+3 leisure-1 happiness+1', '일감 풍성'),
      ev('87408', 'load_loan', [30, 62], 0.12, '할부금과 보험료, 타이어값이 겹쳐 통장이 비었다.', 'wealth-2 debt+1000 happiness-1', '할부·유지비 부담', { dark: true, who: 'self' }),
      ev('87408', 'dust_road', [28, 62], 0.1, '먼지 많은 현장 도로를 오가며 기침이 오래갔다.', 'health-2 medical+1', '분진 노출', { dark: true }),
      ch('87408', 'slow_pay', [32, 62], 0.1, '건설사가 운반비를 두 달 늦게 주겠다고 했다.', '어떻게 할까?', [
        ['wait', '기다리며 계속 운행', 'wealth-2 relations+1 happiness-1', '결국 받긴 했지만 그동안 카드로 버텼다.'],
        ['switch', '다른 현장을 알아본다', 'wealth+1 leisure-1 relations-1', '단가는 낮아도 제때 주는 곳으로 옮겼다.'],
      ], 'switch', '운반비 지급 지연'),
    ],
    hazard: 2, burnout: 0.04,
  }),
  X('87407', {
    entry: [
      E('license', { license: 'drive', minEdu: 'none', ages: [26, 62], p: 0.35, years: 0, text: '건설기계 자격을 따서 레미콘 회사에 입사했다.' }),
      E('self', { license: 'drive', minEdu: 'none', ages: [34, 60], p: 0.1, text: '지입 차주로 레미콘 믹서 트럭을 직접 몰기 시작했다.' }),
    ],
    transitions: [tr('87408', [28, 60], 3, 0.04, '덤프트럭으로 이동'), tr('87233', [30, 60], 3, 0.03, '대형 화물차로 이동'), tr('87406', [30, 60], 3, 0.03, '굴착기 운전으로 이동')],
    events: [
      ev('87407', 'pour_day', [28, 62], 0.12, '타설이 한 번에 끝나 현장 반장이 수고했다며 음료를 건넸다.', 'happiness+2 relations+1', '타설 무사 종료'),
      ev('87407', 'wait_hours', [28, 62], 0.13, '현장 준비가 늦어져 믹서 속 콘크리트가 굳을까 마음 졸이며 대기했다.', 'happiness-2 health-1 conflict+1', '현장 대기 지연', { dark: true }),
      ev('87407', 'drum_wash', [28, 62], 0.1, '퇴근 후 믹서 드럼 세척으로 늦게까지 남았다.', 'leisure-2 health-1', '세척 잔업'),
      ch('87407', 'strike_talk', [32, 62], 0.1, '운송 단가를 두고 차주들이 단체 행동을 논의한다.', '어떻게 할까?', [
        ['join', '참여한다', 'relations+2 wealth-2 leisure-1', '며칠 일을 쉬었다. 단가는 조금 올랐다.'],
        ['skip', '운행을 계속한다', 'wealth+1 relations-2 happiness-1', '일은 이어졌지만 동료와의 사이가 서먹해졌다.'],
      ], 'skip', '단가 단체 행동', { who: 'self' }),
    ],
    hazard: 2, burnout: 0.04,
  }),
  X('87112', {
    entry: [
      E('license', { license: 'drive', minEdu: 'high', ages: [24, 40], p: 0.2, years: 0, text: '철도 운전 면허를 따서 기관사 양성 과정을 마쳤다.' }),
      E('hire', { license: 'drive', minEdu: 'high', ages: [22, 36], p: 0.15, text: '철도 공채에 합격해 열차 승무 업무로 들어갔다.' }),
    ],
    transitions: [tr('87113', [28, 52], 3, 0.05, '전동차 기관사로 이동'), tr('87120', [40, 58], 8, 0.05, '관제·운영 업무로 이동'), tr('87221', [35, 58], 5, 0.02, '버스 운전으로 이동')],
    events: [
      ev('87112', 'signal_check', [26, 58], 0.12, '신호 확인을 한 번 더 한 덕에 큰 사고 없이 넘어갔다고 들었다.', 'happiness+2 job+1', '신호 확인 습관'),
      ev('87112', 'night_duty', [26, 58], 0.14, '야간 대기와 새벽 출고가 이어져 생활 리듬이 무너졌다.', 'health-3 leisure-1 relations-1', '야간 교대', { dark: true }),
      ch('87112', 'strain_talk', [30, 58], 0.1, '긴 운행 뒤 상담실에서 휴식 신청을 권했다.', '어떻게 할까?', [
        ['rest', '휴식을 신청', 'health+2 wealth-1 relations-1', '며칠 쉬었다. 동료 근무가 한 번 늘었다.'],
        ['push', '그대로 근무', 'wealth+1 health-2 happiness-1', '근무표대로 뛰었다. 피로가 다시 올라왔다.'],
      ], 'rest', '운행 피로·휴식'),
      ev('87112', 'new_train', [30, 58], 0.1, '새 차량 교육을 받고 첫 시운전을 했다. 조작이 달라 새로 배웠다.', 'intellect+2 happiness+1 leisure-1', '신형 차량 교육'),
    ],
    hazard: 1, burnout: 0.05,
  }),
  X('87113', {
    entry: [
      E('license', { license: 'drive', minEdu: 'high', ages: [24, 40], p: 0.2, years: 0, text: '철도 운전 면허를 따서 도시철도 승무원으로 들어갔다.' }),
      E('promote', { from: ['87112'], minYears: 3, ages: [28, 52], p: 0.1, text: '철도 승무 경력으로 도시철도 전동차 운전에 지원했다.' }),
    ],
    transitions: [tr('87112', [28, 52], 3, 0.04, '철도 기관사로 이동'), tr('87120', [40, 58], 8, 0.05, '관제·역 운영으로 이동'), tr('87221', [35, 58], 5, 0.02, '버스 운전으로 이동')],
    events: [
      ev('87113', 'rush_hour', [26, 58], 0.12, '출퇴근 혼잡 시간에 정차 시간을 맞추느라 신경을 곤두세웠다.', 'happiness-1 health-1 job+1', '출퇴근 혼잡 운행', { dark: true }),
      ev('87113', 'tunnel_night', [26, 58], 0.13, '밤샘 운행이 이어져 어두운 터널 구간이 길게 느껴졌다.', 'health-2 leisure-1', '야간 승무', { dark: true }),
      ev('87113', 'driverless_news', [30, 58], 0.1, '무인 운전 노선 소식이 전해져 승무 인력 이야기가 오갔다.', 'happiness-1 job+2 tech+2', '무인 운전 전환', { years: [2015, 2060] }),
      ev('87113', 'passenger_thanks', [26, 58], 0.1, '급한 승객을 위해 문을 천천히 닫았다. 승객이 목례로 인사했다.', 'happiness+2 relations+1', '승객 감사'),
    ],
    hazard: 1, burnout: 0.05,
  }),
  X('87501', {
    entry: [
      E('hire', { minEdu: 'high', ages: [18, 50], p: 0.3, text: '원양어선 갑판원으로 승선해 로프 매듭부터 배웠다.' }),
      E('hire', { minEdu: 'high', ages: [20, 54], p: 0.2, text: '선박 회사 공고를 보고 화물선 부원 일을 시작했다.' }),
    ],
    transitions: [tr('87509', [28, 58], 4, 0.04, '선박 관련 승무원으로 이동'), tr('87304', [30, 58], 3, 0.03, '항만 지게차로 이동'), tr('87502', [45, 62], 8, 0.03, '등대 일로 이동')],
    events: [
      ev('87501', 'port_call', [20, 58], 0.12, '입항해 며칠 육지에 머물며 가족에게 전화하고 장을 봤다.', 'happiness+3 relations+2 leisure+1', '입항 휴식'),
      ev('87501', 'long_sail', [20, 58], 0.13, '몇 달 승선이 이어져 집안 행사를 건너뛰었다.', 'relations-2 happiness-2 wealth+2', '장기 승선', { dark: true }),
      ch('87501', 'sign_on', [22, 58], 0.11, '선사가 다음 항차 승선 계약 연장을 제안했다.', '어떻게 할까?', [
        ['extend', '연장 계약', 'wealth+3 relations-2 leisure-2', '수입은 늘었고 집에서 보낼 날이 줄었다.'],
        ['home', '하선해 쉰다', 'relations+2 happiness+1 wealth-2', '한동안 가족 곁에 머물렀다. 통장은 얇아졌다.'],
      ], 'home', '승선 계약 연장'),
      ev('87501', 'rough_sea', [20, 58], 0.1, '높은 파도 속에서 갑판 작업이 이어졌다. 며칠간 몸살이 났다.', 'health-3 happiness-1', '악천후 갑판 작업', { dark: true }),
    ],
    hazard: 3, burnout: 0.05,
  }),
  X('87294', {
    entry: [
      E('hire', { minEdu: 'none', ages: [20, 66], p: 0.5, era: [1990, null], text: '식당가 주차대행 업체에 들어가 발레 키를 받기 시작했다.' }),
      E('self', { minEdu: 'none', ages: [28, 62], p: 0.05, era: [1990, null], text: '주차대행 업체를 직접 열어 건물과 계약했다.' }),
    ],
    transitions: [tr('87293', [24, 64], 1, 0.05, '대리운전으로 이동'), tr('41231', [45, 70], 2, 0.04, '경비 일로 이동'), tr('87292', [26, 62], 2, 0.03, '렌터카로 이동')],
    events: [
      ev('87294', 'tip_night', [20, 62], 0.12, '손님이 고맙다며 팁을 두고 갔다. 동료들과 나눠 먹었다.', 'happiness+2 relations+1 wealth+1', '손님 팁'),
      ev('87294', 'scratch_claim', [20, 62], 0.12, '손님 차에 긁힌 자국이 났다며 항의를 받았다.', 'happiness-2 conflict+2 wealth-1', '파손 시비', { dark: true }),
      ch('87294', 'keep_run', [22, 62], 0.1, '좁은 주차장에 차가 몰려 뛰어다니는 일이 길어졌다.', '어떻게 할까?', [
        ['hurry', '속도를 올린다', 'wealth+1 health-2 relations-1', '대기 줄은 줄었다. 무릎이 아팠다.'],
        ['steady', '안전하게 천천히', 'relations+1 wealth-1 happiness+1', '손님 불평이 조금 있었다. 사고는 없었다.'],
      ], 'steady', '피크 시간 대응'),
      ev('87294', 'cold_wait', [20, 62], 0.1, '한겨울 야외에서 몇 시간 서 있다 감기를 달고 살았다.', 'health-2 happiness-1', '야외 대기', { dark: true }),
    ],
    hazard: 1, burnout: 0.04,
  }),
];
