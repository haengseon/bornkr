import { ev, ch } from '../jobs-kit.js';
export default {
  '91001': [
    ev('91001', 'scaffold_close', [20, 72], 0.11, '비계 위에서 자재가 흘러내렸다. 다친 곳은 없었으나 한동안 마음이 쓰였다.', 'health-1 happiness-1', '고소 작업 위험', { dark: true }),
    ev('91001', 'foreman_call', [22, 70], 0.11, '십장이 다음 현장에도 같이 가자고 했다. 일감이 이어진다.', 'happiness+2 job+1 wealth+1', '일 솜씨 인정'),
    ch('91001', 'team_offer', [28, 62], 0.1, '아는 반장이 팀을 꾸려 같이 해 보자고 했다.', '어떻게 할까?', [
      ['join', '팀에 들어간다', 'wealth+2 relations+1 leisure-2', '일당이 올랐다. 쉬는 날이 줄었다.'],
      ['stay', '인력사무소를 계속 다닌다', 'leisure+1 happiness+1 wealth-1', '자유롭게 일했다. 일감은 들쭉날쭉했다.'],
    ], 'join', '팀 합류 제안'),
  ],
  '92111': [
    ev('92111', 'container_unload', [20, 58], 0.12, '컨테이너 안 상자가 열기에 찌그러져 있었다. 땀에 젖어 하루를 보냈다.', 'health-2 leisure-1', '밀폐 상차 작업', { dark: true }),
    ev('92111', 'team_dinner', [20, 62], 0.1, '일이 끝나고 팀원들이 국밥을 샀다. 반장이 내 이름을 기억했다.', 'happiness+2 relations+2', '동료 정'),
    ch('92111', 'night_hub', [20, 55], 0.1, '야간 허브 상하차는 일당이 높다는 제안을 받았다.', '어떻게 할까?', [
      ['night', '야간을 해 본다', 'wealth+3 health-3 relations-1', '일당이 올랐다. 낮에 잠들기가 어려웠다.'],
      ['day', '주간만 한다', 'health+1 relations+1 wealth-1', '생활이 일정했다. 수입은 그대로였다.'],
    ], 'day', '야간 상하차 제안'),
  ],
  '92120': [
    ev('92120', 'sorter_error', [18, 60], 0.12, '분류 오류가 나 반품 상자가 쌓였다. 조장에게 불려 갔다.', 'happiness-2 conflict+1', '분류 실수', { dark: true }),
    ev('92120', 'scan_skill', [18, 60], 0.11, '스캐너 작업에 익숙해져 시간당 분류 건수가 늘었다.', 'happiness+2 job+1 intellect+1', '숙련 인정'),
    ch('92120', 'regular_offer', [20, 58], 0.09, '계약직 중 일부를 무기계약으로 돌린다는 공지가 붙었다.', '어떻게 할까?', [
      ['apply', '신청한다', 'job+2 happiness+1 leisure-2', '평가를 받으려 시간을 더 썼다.'],
      ['pass', '지금 조건을 유지한다', 'leisure+1 job-1 happiness+1', '편했다. 안정은 멀어 보였다.'],
    ], 'apply', '전환 기회'),
  ],
  '92220': [
    ev('92220', 'damaged_box', [24, 62], 0.12, '파손 상자 책임을 두고 대리점과 승강이를 벌였다.', 'happiness-2 conflict+1 wealth-1', '파손 책임 분쟁', { dark: true }),
    ev('92220', 'regular_thanks', [24, 62], 0.11, '매일 오는 배송에 주민이 간식을 건네며 수고한다고 했다.', 'happiness+2 relations+1', '주민 인사'),
    ch('92220', 'new_route', [24, 60], 0.1, '구역이 바뀌어 아파트 단지 대신 단독주택가를 맡게 되었다.', '어떻게 할까?', [
      ['accept', '새 구역을 받는다', 'health-1 wealth+1 intellect+1', '골목 위치를 익히느라 헤맸다. 건수는 늘었다.'],
      ['ask', '원래 구역을 요청한다', 'relations-1 happiness+1 wealth-1', '요청이 일부 받아들여졌다. 눈치가 보였다.'],
    ], 'accept', '구역 변경'),
  ],
  '92230': [
    ev('92230', 'platform_fee', [18, 60], 0.13, '앱 이용료와 보험료가 정산에서 빠져 손에 남는 돈이 줄었다.', 'wealth-3 happiness-1 fairness+1', '수수료 공제', { dark: true, years: [2015, 2060] }),
    ev('92230', 'peak_bonus', [18, 60], 0.11, '프로모션 시간대에 배달을 몰아 건당 단가를 높게 받았다.', 'wealth+3 health-1', '프로모션 수입', { years: [2015, 2060] }),
    ch('92230', 'two_apps', [18, 58], 0.1, '다른 앱에도 가입하면 주문이 더 들어온다고 한다.', '어떻게 할까?', [
      ['both', '두 곳 모두 돌린다', 'wealth+3 health-2 leisure-2', '주문이 늘었다. 쉴 틈이 사라졌다.'],
      ['one', '한 곳만 쓴다', 'leisure+1 happiness+1 wealth-1', '몸은 편했다. 수입은 비슷했다.'],
    ], 'one', '앱 선택', { years: [2015, 2060] }),
  ],
  '92291': [
    ev('92291', 'tip_envelope', [16, 62], 0.1, '단골 사무실에서 봉투에 음료값을 넣어 주었다.', 'happiness+2 wealth+1', '단골 인심'),
    ev('92291', 'cold_ride', [16, 62], 0.12, '한겨울 오토바이에 손이 곱아 하루 쉬고 나가야 했다.', 'health-2 wealth-1', '한파 운행', { dark: true }),
    ch('92291', 'order_late', [16, 62], 0.1, '주방이 늦어져 배달이 지연되었다. 손님이 항의했다.', '어떻게 할까?', [
      ['sorry', '사과하고 조금 서두른다', 'happiness-1 relations+1 health-1', '손님이 이해했다. 신호를 넘기며 서둘렀다.'],
      ['explain', '주방 사정을 설명한다', 'conflict+1 happiness-1 relations-1', '사정은 전달했다. 손님 표정은 풀리지 않았다.'],
    ], 'sorry', '배달 지연'),
  ],
  '93099': [
    ev('93099', 'overtime_order', [18, 68], 0.12, '대량 주문이 들어와 잔업이 이어졌다. 수당이 평소보다 붙었다.', 'wealth+3 leisure-2', '잔업 수당'),
    ev('93099', 'noise_hearing', [20, 68], 0.1, '라인 소음 속에서 지내다 귀가 먹먹해졌다. 병원에 갔다.', 'health-2 medical+1', '소음 노출', { dark: true }),
    ch('93099', 'skill_cert', [20, 60], 0.09, '라인 반장이 설비 조작 교육을 받으라고 권했다.', '어떻게 할까?', [
      ['learn', '교육을 받는다', 'intellect+2 job+1 leisure-2', '설비를 맡았다. 퇴근 후 시간이 줄었다.'],
      ['skip', '지금 일을 유지한다', 'leisure+1 happiness+1 job-1', '여유는 지켰다. 단순 작업이 이어졌다.'],
    ], 'learn', '교육 권유'),
  ],
  '94110': [
    ev('94110', 'rude_resident', [35, 78], 0.12, '지나가던 입주민이 청소가 안 됐다며 크게 나무랐다.', 'happiness-3 conflict+1', '민원 응대', { dark: true }),
    ev('94110', 'kind_note', [35, 78], 0.1, '사무실 직원이 감사 쪽지를 책상 위에 놓았다.', 'happiness+2 relations+1', '감사 쪽지'),
    ch('94110', 'break_room', [35, 76], 0.09, '휴게 공간이 지하 창고 옆이라 좁다. 개선을 요청해 보자는 말이 나왔다.', '어떻게 할까?', [
      ['ask', '동료와 함께 요청한다', 'fairness+2 conflict+1 happiness+1', '일부 개선되었다. 관리 쪽 눈치가 달라졌다.'],
      ['quiet', '조용히 넘어간다', 'happiness-1 conflict-1 health-1', '갈등은 없었다. 불편은 그대로였다.'],
    ], 'ask', '휴게 환경'),
  ],
  '94142': [
    ev('94142', 'holiday_waste', [24, 62], 0.12, '명절 연휴 뒤 쓰레기가 산처럼 쌓여 새벽부터 두 배로 돌았다.', 'health-2 leisure-2 wealth+1', '연휴 물량', { dark: true }),
    ev('94142', 'driver_trust', [24, 62], 0.1, '같이 도는 기사가 일 순서를 잘 챙겨 주어 한결 수월했다.', 'happiness+2 relations+1 job+1', '동료의 도움'),
    ch('94142', 'recycling_sort', [24, 62], 0.09, '분리 배출을 못 지킨 봉투가 많았다. 현장에서 가려내야 한다.', '어떻게 할까?', [
      ['sort', '현장에서 분리한다', 'health-2 job+1 happiness+1', '재활용률이 올라갔다. 시간이 늦어졌다.'],
      ['skip', '그대로 싣는다', 'leisure+1 conflict+1 fairness-1', '일정은 지켰다. 민원 전화가 이어졌다.'],
    ], 'sort', '분리 배출 문제'),
  ],
  '94201': [
    ev('94201', 'night_patrol', [45, 78], 0.12, '새벽 순찰 중 지하주차장 문이 열려 있는 것을 발견해 닫았다.', 'happiness+1 relations+1 job+1', '순찰 성과'),
    ev('94201', 'rest_time_cut', [45, 78], 0.12, '휴게 시간이 줄어든다는 소식에 동료들이 술렁였다.', 'happiness-2 fairness+1 wealth-1', '휴게 시간 축소', { dark: true }),
    ch('94201', 'resident_gift', [45, 78], 0.1, '명절에 주민이 선물을 두고 갔다.', '어떻게 할까?', [
      ['accept', '고맙게 받는다', 'happiness+2 relations+1 conflict+1', '정이 오갔다. 다른 주민 눈이 마음에 걸렸다.'],
      ['return', '정중히 돌려준다', 'fairness+1 relations-1 happiness+1', '규정을 지켰다. 서운해하는 얼굴을 보았다.'],
    ], 'return', '선물 수수'),
  ],
  '95110': [
    ev('95110', 'bright_home', [30, 76], 0.12, '정리를 마친 집을 보고 집주인이 환하게 웃었다. 다음 달 일정도 잡았다.', 'happiness+2 relations+1 wealth+1', '일 솜씨 인정'),
    ev('95110', 'overwork_ask', [30, 76], 0.12, '계약에 없던 대청소를 추가 비용 없이 해 달라는 요청을 받았다.', 'happiness-2 wealth-1 conflict+1', '업무 범위 침범', { dark: true }),
    ch('95110', 'regular_contract', [30, 72], 0.09, '한 집에서 주 5일 고정 일을 맡아 달라고 했다.', '어떻게 할까?', [
      ['fix', '고정으로 받는다', 'wealth+2 leisure-2 job+1', '수입이 안정되었다. 다른 집 일을 못 했다.'],
      ['flex', '여러 집을 계속 돈다', 'leisure+1 relations+1 wealth-1', '일정이 자유로웠다. 수입은 일정하지 않았다.'],
    ], 'fix', '고정 계약 제안'),
  ],
  '95120': [
    ev('95120', 'first_word', [28, 72], 0.1, '돌보던 아이가 처음으로 내 이름을 불렀다.', 'happiness+3 relations+1', '아이의 첫 말'),
    ev('95120', 'camera_watch', [28, 72], 0.11, '집에 카메라가 설치되어 하루 종일 지켜보는 느낌이다.', 'happiness-2 conflict+1', '감시 불편', { dark: true }),
    ch('95120', 'extra_chore', [28, 70], 0.1, '부모가 아이 밥 외에 집안일까지 부탁했다.', '어떻게 할까?', [
      ['help', '부탁을 들어준다', 'relations+2 happiness+1 health-1', '고맙다는 말을 들었다. 몸이 피곤했다.'],
      ['limit', '돌봄 범위를 확인한다', 'conflict+1 wealth+1 happiness+1', '범위를 정리했다. 부모가 서운해했다.'],
    ], 'limit', '업무 범위'),
  ],
  '95220': [
    ev('95220', 'dish_pile', [16, 76], 0.12, '단체 손님이 몰려 설거지가 산처럼 쌓였다. 손이 퉁퉁 불었다.', 'health-2 leisure-1', '단체 손님', { dark: true }),
    ev('95220', 'chef_taste', [16, 70], 0.1, '주방장이 내 손질한 재료를 보고 괜찮다고 말했다.', 'happiness+2 job+1', '손질 솜씨 인정'),
    ch('95220', 'pay_shift', [20, 70], 0.09, '식당이 월급 대신 일당으로 바꾸자고 제안했다.', '어떻게 할까?', [
      ['accept', '일당으로 바꾼다', 'wealth+1 job-1 leisure+1', '쉬는 날이 늘었다. 고정 소득이 사라졌다.'],
      ['refuse', '월급을 유지한다', 'job+1 conflict+1 happiness-1', '안정은 지켰다. 사장 눈치가 달라졌다.'],
    ], 'refuse', '급여 방식 변경', { dark: true }),
  ],
  '99110': [
    ev('99110', 'harvest_rush', [20, 78], 0.12, '수확철이라 해가 뜨기 전부터 밭에 나갔다. 일당이 후하게 붙었다.', 'wealth+3 health-2 leisure-1', '수확 성수기'),
    ev('99110', 'heat_stroke', [20, 78], 0.11, '한낮 비닐하우스에서 어지러워 그늘에서 오래 쉬었다.', 'health-3 medical+1', '폭염 노동', { dark: true }),
    ch('99110', 'migrant_worker', [25, 70], 0.09, '농가에서 외국인 계절 근로자를 더 쓰겠다고 했다.', '어떻게 할까?', [
      ['train', '일을 가르치며 남는다', 'relations+1 job+1 health-1', '인력으로 일을 이었다. 일이 늘었다.'],
      ['move', '다른 농가를 찾는다', 'wealth-1 relations-1 leisure+1', '다른 농가에서 일을 구했다. 단가는 달랐다.'],
    ], 'train', '인력 구조 변화', { dark: true }),
  ],
};
