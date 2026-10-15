import { X, E, tr, ev, ch } from '../jobs-kit.js';

export default [
  X('44231', {
    entry: [
      E('hire', { minEdu: 'high', ages: [18, 40], p: 0.35, era: [1976, null], text: '놀이공원 운영 요원으로 들어가 어트랙션 안전 관리를 맡았다.' }),
      E('hire', { minEdu: 'none', ages: [18, 55], p: 0.15, era: [1976, null], text: '워터파크 시즌 계약직으로 일하기 시작했다.' }),
    ],
    transitions: [
      tr('44299', [24, 52], 3, 0.03, '여가 시설 일로'),
      tr('44239', [24, 52], 3, 0.03, '오락 시설 일로'),
      tr('15220', [30, 55], 8, 0.02, '시설 관리자로'),
    ],
    events: [
      ev('44231', 'summer_queue', [18, 50], 0.14, '성수기 대기 줄이 두 시간을 넘었다. 안내 방송을 목이 쉬도록 반복했다.', 'health-1 happiness-1 relations+1', '성수기 대기 줄'),
      ev('44231', 'contract_end', [18, 55], 0.12, '시즌이 끝나 계약이 종료됐다. 비수기에는 일감이 없다.', 'wealth-2 happiness-1 job+3', '시즌 계약 종료', { dark: true, who: 'wage', cd: 3 }),
      ev('44231', 'kid_lost_found', [18, 55], 0.1, '길 잃은 아이를 부모에게 찾아 주었다. 부모가 몇 번이나 고개를 숙였다.', 'happiness+3 relations+1', '길 잃은 아이'),
      ch('44231', 'ride_check', [20, 55], 0.12, '점검 중 기구에서 작은 이상 소리가 났다. 줄 선 손님이 많다.', '어떻게 할까?', [
        ['stop', '운행을 멈춘다', 'happiness-1 conflict+1 job+1 intellect+1', '운행을 멈추고 점검을 요청했다. 손님 불만이 쏟아졌지만 원인을 찾았다.'],
        ['report', '끝나고 보고한다', 'wealth+1 happiness-2 fairness+1', '운행을 이어 가다 끝난 뒤 보고했다. 찜찜함이 남았다.'],
      ], 'stop', '기구 점검'),
    ],
    hazard: 2, burnout: 0.05,
  }),
  X('44232', {
    entry: [
      E('hire', { minEdu: 'none', ages: [18, 55], p: 0.35, era: [1991, null], text: '노래방 카운터 아르바이트로 방 배정과 정산을 맡았다.' }),
      E('self', { minEdu: 'none', ages: [30, 62], p: 0.12, era: [1991, null], text: '동네에 노래연습장을 열었다.' }),
    ],
    transitions: [
      tr('44239', [24, 55], 2, 0.04, '오락 시설로 이동'),
      tr('45313', [24, 55], 2, 0.03, '주점 서비스로'),
      tr('44299', [26, 58], 3, 0.03, '여가 시설 일로'),
    ],
    events: [
      ev('44232', 'drunk_group', [18, 58], 0.15, '술에 취한 일행이 시간 연장을 두고 언성을 높였다.', 'happiness-2 conflict+2', '취객 응대', { dark: true, cd: 3 }),
      ev('44232', 'new_songs', [18, 58], 0.1, '신곡 목록을 새로 입력하다 손님이 찾던 노래를 먼저 찾아 줬다.', 'happiness+2 relations+1', '신곡 목록'),
      ev('44232', 'covid_curfew', [22, 62], 0.3, '영업 제한이 이어져 몇 달째 방이 비어 있다. 월세는 그대로다.', 'wealth-4 happiness-2 debt+1500', '영업 제한', { dark: true, once: true, who: 'self', years: [2020, 2022] }),
      ch('44232', 'coin_machine', [22, 58], 0.12, '코인 노래방 기계를 들이면 일손이 줄지만 방이 좁아진다.', '어떻게 할까?', [
        ['coin', '코인 기계를 들인다', 'wealth+1 leisure+2 relations-1 debt+1200', '코인 방으로 바꿨다. 카운터가 한가해졌다.'],
        ['keep', '지금 방식 유지', 'relations+1 leisure-1 wealth-1', '단체 방 중심으로 유지했다. 단골이 편해했다.'],
      ], 'keep', '코인 노래방', { who: 'self', years: [2015, 2100] }),
    ],
    hazard: 1, burnout: 0.05,
  }),
  X('44239', {
    entry: [
      E('hire', { minEdu: 'none', ages: [18, 55], p: 0.35, era: [1975, null], text: 'PC방 아르바이트로 들어가 좌석 관리와 정산을 배웠다.' }),
      E('self', { minEdu: 'none', ages: [26, 60], p: 0.1, era: [1998, null], text: '대출을 받아 PC방을 열었다.' }),
    ],
    transitions: [
      tr('44299', [24, 55], 3, 0.03, '여가 시설 일로'),
      tr('44232', [24, 55], 2, 0.03, '노래방으로'),
      tr('52111', [28, 58], 4, 0.03, '다른 가게를 열어'),
    ],
    events: [
      ev('44239', 'overnight_gamer', [18, 55], 0.14, '밤새 앉아 있던 손님이 요금을 두고 시비를 걸었다. 새벽에 경찰이 왔다.', 'happiness-2 conflict+1 health-1', '심야 손님 시비', { dark: true, cd: 3 }),
      ev('44239', 'update_night', [20, 55], 0.1, '대형 게임 업데이트로 좌석이 꽉 찼다. 팔 음료가 모자랐다.', 'wealth+2 health-1', '업데이트 특수', { years: [2000, 2100] }),
      ev('44239', 'rent_squeeze', [26, 60], 0.12, '모바일 게임이 늘고 손님이 줄어 월세 내기가 빠듯해졌다.', 'wealth-3 happiness-2 housing+1', '손님 감소', { dark: true, who: 'self', years: [2012, 2100], cd: 4 }),
      ch('44239', 'upgrade_pc', [26, 60], 0.11, '손님이 최신 사양을 찾는다. PC를 바꾸려면 큰돈이 든다.', '어떻게 할까?', [
        ['buy', '일부를 교체한다', 'wealth-1 happiness+1 debt+2000 relations+1', '인기 좌석 몇 대를 먼저 바꿨다. 손님이 다시 늘었다.'],
        ['wait', '기존 기기로 간다', 'wealth+1 happiness-1 relations-1', '교체를 미뤘다. 불만이 후기에 조금 올라왔다.'],
      ], 'wait', 'PC 교체', { who: 'self' }),
    ],
    hazard: 1, burnout: 0.05,
  }),
  X('44291', {
    entry: [
      E('hire', { minEdu: '2yr', ages: [21, 38], p: 0.2, era: [1970, null], text: '카지노 딜러 양성 과정을 마치고 영업장에 채용됐다.' }),
    ],
    transitions: [
      tr('44299', [28, 52], 3, 0.03, '여가 시설 일로'),
      tr('44221', [28, 52], 3, 0.03, '호텔 서비스로'),
      tr('15220', [32, 55], 8, 0.02, '영업장 관리자로'),
    ],
    events: [
      ev('44291', 'night_dealer', [21, 55], 0.15, '밤샘 근무가 이어져 낮에 자려 해도 잠이 오지 않는다.', 'health-2 leisure-1', '야간 교대', { dark: true, cd: 3 }),
      ev('44291', 'table_skill', [21, 55], 0.1, '카드 분배가 빨라졌다며 상급 테이블 배치를 받았다.', 'happiness+2 wealth+1 intellect+1', '솜씨 인정'),
      ev('44291', 'angry_player', [21, 55], 0.13, '잃은 손님이 딜러에게 화를 쏟았다. 웃는 표정을 유지해야 했다.', 'happiness-2 relations-1', '손님의 화풀이', { dark: true, cd: 3 }),
      ch('44291', 'rotation', [23, 55], 0.1, '새로 열리는 테이블 팀에서 합류 제안이 왔다. 야간이 길어진다.', '어떻게 할까?', [
        ['join', '합류한다', 'wealth+2 health-2 leisure-2', '새 팀에서 수당이 늘었다. 휴일은 줄었다.'],
        ['stay', '지금 팀에 남는다', 'leisure+1 relations+1 wealth-1', '익숙한 팀에 남았다. 동료들과의 관계는 안정됐다.'],
      ], 'stay', '새 팀 제안'),
    ],
    hazard: 1, burnout: 0.06,
  }),
  X('44293', {
    entry: [
      E('hire', { minEdu: 'high', ages: [18, 35], p: 0.2, era: [1990, null], text: '프로 구단 응원단 오디션에 합격했다.' }),
      E('hire', { minEdu: '2yr', ages: [20, 35], p: 0.15, era: [1990, null], text: '대학 응원단 경력으로 행사 응원 팀에 들어갔다.' }),
    ],
    transitions: [
      tr('29640', [24, 45], 3, 0.04, '스포츠 강사로'),
      tr('44299', [24, 50], 3, 0.03, '여가 서비스로'),
      tr('29321', [22, 38], 3, 0.02, '연기 쪽으로 이동'),
    ],
    events: [
      ev('44293', 'stadium_night', [18, 40], 0.15, '야간 경기에서 세 시간 서서 응원하고 돌아오니 자정이었다.', 'health-1 happiness+1 leisure-1', '야간 경기'),
      ev('44293', 'sprain_pause', [18, 40], 0.1, '공연 연습 중 발목을 접질려 한 주 쉬었다. 대체 인원이 들어왔다.', 'health-2 wealth-1 job+1', '연습 중 발목', { dark: true, cd: 4 }),
      ev('44293', 'fan_event', [18, 40], 0.1, '팬 행사에서 아이들이 같이 춤을 췄다. 표정이 오래 기억에 남았다.', 'happiness+3 relations+1', '팬 행사'),
      ch('44293', 'contract_renew', [20, 38], 0.12, '다음 시즌 계약 조건이 낮아졌다. 다른 팀이 연락을 해 왔다.', '어떻게 할까?', [
        ['renew', '계약을 이어 간다', 'relations+1 wealth-1 happiness+1', '낮아진 조건에도 같은 팀에 남았다. 동료들이 반겼다.'],
        ['move', '다른 팀으로 간다', 'wealth+1 relations-2 happiness-1', '새 팀에서 처음부터 안무를 익혔다. 적응에 시간이 걸렸다.'],
      ], 'renew', '시즌 계약'),
    ],
    hazard: 1, burnout: 0.06,
  }),
  X('44299', {
    entry: [
      E('hire', { minEdu: 'none', ages: [18, 60], p: 0.35, text: '헬스장 프런트와 회원 관리 일을 시작했다.' }),
      E('hire', { minEdu: 'high', ages: [20, 55], p: 0.2, text: '찜질방 운영 요원으로 들어가 시설 관리와 안내를 맡았다.' }),
    ],
    transitions: [
      tr('29640', [24, 50], 3, 0.04, '트레이너로 이동'),
      tr('44239', [24, 55], 3, 0.03, '오락 시설로'),
      tr('15220', [30, 56], 6, 0.03, '시설 관리자로'),
    ],
    events: [
      ev('44299', 'member_drive', [20, 58], 0.13, '신규 회원 등록 목표를 채워 이번 달 성과 수당을 받았다.', 'wealth+2 happiness+1', '회원 등록 목표'),
      ev('44299', 'sauna_clean', [20, 62], 0.14, '찜질방 새벽 청소와 소독을 혼자 맡아 허리가 아팠다.', 'health-2 leisure-1', '시설 청소', { dark: true, cd: 3 }),
      ev('44299', 'rude_member', [20, 58], 0.12, '회원이 기구 사용 규칙을 어기고 항의했다. 원칙대로 설명해도 소용이 없었다.', 'happiness-2 conflict+1 relations-1', '회원 항의', { dark: true, cd: 3 }),
      ch('44299', 'pt_side', [24, 50], 0.11, '회원이 개인 운동 지도를 따로 부탁했다. 센터 규정과 겹친다.', '어떻게 할까?', [
        ['center', '센터 프로그램으로', 'relations+1 wealth+1 leisure-1', '센터 프로그램으로 등록받았다. 수당은 정해진 만큼이었다.'],
        ['solo', '따로 지도한다', 'wealth+2 relations-1 conflict+2', '센터 밖에서 지도했다. 규정 문제로 팀장이 불렀다.'],
      ], 'center', '개인 지도 부탁'),
    ],
    hazard: 1, burnout: 0.05,
  }),
  X('44122', {
    entry: [
      E('hire', { minEdu: '2yr', ages: [20, 35], p: 0.3, text: '철도 승무 업무에 지원해 열차 내 안내와 판매를 맡았다.' }),
      E('hire', { minEdu: 'high', ages: [20, 40], p: 0.15, text: '열차 객실 서비스 위탁 업체에 채용됐다.' }),
    ],
    transitions: [
      tr('44110', [22, 36], 3, 0.02, '항공 승무원으로'),
      tr('44229', [26, 52], 3, 0.03, '숙박 서비스로'),
      tr('44211', [26, 52], 3, 0.03, '여행 안내로'),
    ],
    events: [
      ev('44122', 'long_route', [20, 55], 0.14, '장거리 노선을 왕복하고 숙소에서 쪽잠을 잔 뒤 다시 출근했다.', 'health-2 leisure-1', '장거리 승무', { dark: true, cd: 3 }),
      ev('44122', 'holiday_rush', [20, 55], 0.12, '명절 귀성 열차가 입석까지 가득 찼다. 안내를 마치니 하루가 지났다.', 'happiness+1 wealth+1 health-1', '명절 열차'),
      ev('44122', 'lost_child_ticket', [20, 55], 0.1, '차표를 잃어버린 노인을 도와 목적지까지 안내했다. 감사 편지가 왔다.', 'happiness+3 relations+1', '승객의 감사'),
      ch('44122', 'outsource_offer', [24, 55], 0.1, '객실 서비스를 외부 업체로 돌린다는 설명이 나왔다.', '어떻게 할까?', [
        ['move', '업체 소속을 받아들인다', 'wealth-1 happiness-1 job+1 relations+1', '업체 소속으로 옮겼다. 근무 조건은 그대로였다.'],
        ['leave', '다른 일을 알아본다', 'wealth-2 intellect+1 leisure+1 job+2', '다른 일을 알아보며 몇 달을 보냈다. 불안했지만 숨은 돌렸다.'],
      ], 'move', '위탁 전환', { who: 'wage', once: true }),
    ],
    hazard: 1, burnout: 0.05,
  }),
];
