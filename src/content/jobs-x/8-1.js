import { X, E, tr, ev, ch } from '../jobs-kit.js';
export default [
  X('87291', {
    entry: [
      E('license', { license: 'drive', minEdu: 'none', ages: [24, 64], p: 0.4, years: 0, text: '운전 자격을 갖추고 기업 임원 차량과 통근 승합차 운전을 맡았다.' }),
      E('hire', { license: 'drive', minEdu: 'none', ages: [26, 66], p: 0.2, text: '아는 분의 소개로 병원 송영 승합차를 몰게 되었다.' }),
    ],
    transitions: [tr('87210', [30, 62], 3, 0.03, '택시 운전으로 이동'), tr('87221', [32, 60], 3, 0.03, '버스 운전으로 이동'), tr('87295', [30, 62], 2, 0.03, '구급차 운전으로 이동')],
    events: [
      ev('87291', 'steady_boss', [26, 64], 0.12, '같은 분을 오래 모셨다. 명절에 작은 선물과 인사를 받았다.', 'happiness+2 relations+2', '오랜 고정 승객'),
      ev('87291', 'idle_wait', [26, 64], 0.13, '대기 시간이 길고 호출이 불규칙하다. 주차장에서 쪽잠이 늘었다.', 'health-2 leisure-2 happiness-1', '대기·불규칙 근무', { dark: true }),
      ch('87291', 'late_demand', [28, 64], 0.12, '심야 일정이 이어지며 추가 운행 요청이 왔다.', '어떻게 할까?', [
        ['accept', '요청을 받는다', 'wealth+2 health-2 leisure-1', '수당이 붙었다. 집에 가는 시간이 늦어졌다.'],
        ['limit', '시간을 정해 둔다', 'leisure+1 relations-1 wealth-1', '정해진 시간까지만 맡기로 했다. 눈치를 조금 봤다.'],
      ], 'limit', '심야 추가 운행'),
      ev('87291', 'contract_end', [30, 64], 0.1, '차량 위탁 계약이 끝나 업체가 바뀌었다. 근무 조건을 다시 맞췄다.', 'wealth-2 job-1 happiness-1', '위탁 계약 종료', { dark: true, who: 'wage' }),
    ],
    hazard: 1, burnout: 0.04,
  }),
  X('87232', {
    entry: [
      E('license', { license: 'drive', minEdu: 'none', ages: [25, 62], p: 0.4, years: 0, text: '화물운송 자격을 따서 중형 탑차 배송 기사로 들어갔다.' }),
      E('self', { license: 'drive', minEdu: 'none', ages: [30, 60], p: 0.1, text: '할부로 3.5톤 트럭을 사서 직접 일감을 받기 시작했다.' }),
    ],
    transitions: [tr('87233', [30, 58], 3, 0.04, '대형 화물차로 이동'), tr('87231', [30, 62], 2, 0.03, '소형 화물차로 이동'), tr('87304', [28, 60], 2, 0.03, '지게차 일로 이동')],
    events: [
      ev('87232', 'regular_route', [26, 62], 0.12, '고정 거래처가 생겨 일정한 경로로 다니게 되었다. 하루가 예측된다.', 'wealth+2 happiness+2', '고정 거래처'),
      ev('87232', 'loading_back', [28, 62], 0.13, '상하차를 혼자 하다 허리가 결렸다. 며칠 일을 줄였다.', 'health-3 wealth-1 medical+1', '상하차 부담', { dark: true }),
      ch('87232', 'extra_route', [28, 62], 0.12, '거래처가 새벽 배송 구간을 하나 더 맡아 달라고 했다.', '어떻게 할까?', [
        ['take', '구간을 늘린다', 'wealth+3 health-2 leisure-2', '벌이는 늘었고 잠이 줄었다.'],
        ['keep', '지금 일정 유지', 'leisure+1 happiness+1 wealth-1', '일정을 지켰다. 다른 기사가 그 구간을 맡았다.'],
      ], 'keep', '추가 배송 구간'),
      ev('87232', 'fine_ticket', [28, 64], 0.1, '적재 중량 단속에 걸려 과태료 통지서가 왔다. 거래처와 다툼이 생겼다.', 'wealth-2 conflict+2 happiness-1', '적재 단속 과태료', { dark: true, who: 'self' }),
    ],
    hazard: 2, burnout: 0.05,
  }),
  X('87223', {
    entry: [
      E('license', { license: 'drive', minEdu: 'none', ages: [28, 62], p: 0.3, years: 0, text: '버스 운전 자격을 따서 관광버스 회사에 입사했다.' }),
      E('self', { license: 'drive', minEdu: 'none', ages: [38, 62], p: 0.03, text: '중고 관광버스를 지입으로 사서 직접 운행하게 되었다.' }),
    ],
    transitions: [tr('87222', [30, 60], 3, 0.04, '고속버스 운전으로 이동'), tr('87221', [30, 60], 3, 0.04, '시내버스 운전으로 이동'), tr('87293', [32, 64], 3, 0.03, '대리운전으로 이동')],
    events: [
      ev('87223', 'festival_season', [30, 64], 0.13, '단풍철 단체 예약이 줄줄이 잡혔다. 바쁘지만 수입도 늘었다.', 'wealth+3 leisure-1 happiness+1', '성수기 단체 운행'),
      ev('87223', 'long_wait', [30, 64], 0.13, '승객이 일정을 늦추는 바람에 차 안에서 한참 기다렸다.', 'health-1 happiness-2 relations-1', '일정 지연', { dark: true }),
      ev('87223', 'guest_thanks', [30, 64], 0.1, '학생 단체가 무사히 도착하자 인솔 선생님이 정성껏 인사했다.', 'happiness+3 relations+1', '승객 감사'),
      ev('87223', 'off_season', [30, 64], 0.1, '비수기엔 예약이 뜸해 월급이 줄고 대기 날이 늘었다.', 'wealth-3 job-1 happiness-1', '비수기 일감 감소', { dark: true }),
    ],
    hazard: 1, burnout: 0.04,
  }),
  X('87222', {
    entry: [
      E('license', { license: 'drive', minEdu: 'none', ages: [28, 60], p: 0.3, years: 0, text: '버스 운전 자격을 따서 시외·고속버스 회사에 입사했다.' }),
      E('promote', { from: ['87221'], minYears: 3, ages: [32, 58], p: 0.1, text: '시내버스 경력을 인정받아 장거리 노선으로 옮겼다.' }),
    ],
    transitions: [tr('87221', [32, 62], 3, 0.04, '시내버스로 이동'), tr('87223', [32, 60], 3, 0.03, '관광버스로 이동'), tr('41231', [55, 70], 3, 0.03, '경비 일로 이동')],
    events: [
      ev('87222', 'night_line', [30, 62], 0.13, '심야 노선 배정이 이어져 생활 리듬이 흐트러졌다.', 'health-3 leisure-1', '심야 노선 근무', { dark: true }),
      ev('87222', 'safe_award', [32, 62], 0.1, '무사고 운행 기록으로 표창을 받았다. 가족과 식사했다.', 'happiness+3 relations+1', '무사고 표창', { once: true }),
      ch('87222', 'rest_rule', [30, 62], 0.12, '휴게 시간이 빠듯한 배차표가 나왔다. 동료들이 교대를 제안한다.', '어떻게 할까?', [
        ['swap', '교대 조정에 응한다', 'relations+2 leisure-1 health-1', '서로 맞바꿔 일했다. 쉬는 날이 어긋났다.'],
        ['stay', '배차표대로 간다', 'health-1 wealth+1 relations-1', '정해진 대로 운행했다. 피로가 쌓였다.'],
      ], 'swap', '휴게·배차 조정'),
      ev('87222', 'heavy_snow', [30, 62], 0.1, '폭설로 노선이 막혀 승객과 함께 터미널에서 몇 시간 기다렸다.', 'happiness-1 health-1', '폭설 지연', { dark: true }),
    ],
    hazard: 1, burnout: 0.05,
  }),
  X('87301', {
    entry: [
      E('license', { license: 'drive', minEdu: 'none', ages: [24, 60], p: 0.35, years: 0, text: '크레인 자격을 따서 현장과 공장에서 일을 배웠다.' }),
      E('hire', { license: 'drive', minEdu: 'none', ages: [26, 58], p: 0.2, text: '건설 현장에서 신호수로 일하다 장비 기사로 올라섰다.' }),
    ],
    transitions: [tr('87406', [28, 58], 3, 0.04, '굴착기 운전으로 이동'), tr('87304', [26, 58], 2, 0.04, '지게차로 이동'), tr('87303', [28, 60], 2, 0.03, '호이스트로 이동')],
    events: [
      ev('87301', 'signal_trust', [26, 62], 0.12, '신호수와 손발이 맞아 어려운 양중 작업을 무탈히 마쳤다.', 'happiness+2 relations+2 job+1', '호흡 맞는 양중'),
      ev('87301', 'wind_stop', [26, 62], 0.12, '강풍으로 작업이 중지돼 하루 일당 없이 대기했다.', 'wealth-2 leisure+1', '강풍 작업 중지', { dark: true }),
      ch('87301', 'overload_ask', [30, 62], 0.12, '공기에 쫓긴 현장 소장이 정격보다 무거운 자재를 올려 달라고 했다.', '어떻게 할까?', [
        ['refuse', '규정대로 거절', 'relations-2 happiness+1 intellect+1', '분위기가 굳었다. 다음 날 자재를 나눠 올렸다.'],
        ['split', '나눠서 올린다', 'leisure-2 relations+1 wealth-1', '시간이 늘었지만 갈등은 줄었다.'],
      ], 'refuse', '정격 초과 요구'),
      ev('87301', 'inspection', [26, 62], 0.1, '정기 안전 검사에서 지적 없이 통과해 계속 일할 수 있게 되었다.', 'happiness+2 job+1', '장비 안전 검사', { once: false }),
    ],
    hazard: 3, burnout: 0.05,
  }),
];
