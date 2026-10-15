import { X, E, tr, ev, ch } from '../jobs-kit.js';
export default [
  X('78251', {
    entry: [
      E('hire', { minEdu: 'high', ages: [18, 55], p: 0.4, text: '벽돌 현장에서 모르타르를 개며 줄눈 맞추는 법을 배웠다.' }),
      E('self', { minEdu: 'high', ages: [32, 60], p: 0.1, text: '조적 팀을 꾸려 단가 도급을 받았다.' }),
    ],
    transitions: [tr('78310', [24, 58], 3, 0.04, '미장으로 이동'), tr('78253', [24, 58], 3, 0.03, '석재 부설로 이동'), tr('78391', [35, 62], 6, 0.04, '건물 수리로 전환')],
    events: [
      ev('78251', 'wall_straight', [24, 62], 0.12, '수평 실이 팽팽한 벽을 쌓아 감독의 눈에 들었다.', 'happiness+2 job+1', '솜씨 인정'),
      ev('78251', 'wrist_wear', [32, 65], 0.12, '벽돌을 들던 손목이 저려 병원에서 물리치료를 받았다.', 'health-3 medical+2 wealth-1', '손목 질환', { dark: true }),
      ch('78251', 'piece_rate', [26, 62], 0.1, '일당 대신 장당 단가로 받아 보라는 제안이 왔다.', '어떻게 할까?', [
        ['piece', '단가로 받는다', 'wealth+3 health-2', '많이 쌓는 날은 벌이가 늘었다.'],
        ['daily', '일당 유지', 'happiness+1 wealth-1 leisure+1', '벌이는 일정했다. 마음은 편했다.'],
      ], 'daily', '단가제'),
      ev('78251', 'construction_slump', [28, 64], 0.1, '건설 경기가 얼어 현장 수가 줄고 일당 자리가 불안했다.', 'wealth-3 happiness-2 living+1', '건설 경기', { dark: true }),
    ],
    hazard: 2, burnout: 0.05,
  }),
  X('78293', {
    entry: [
      E('hire', { minEdu: 'high', ages: [20, 58], p: 0.4, text: '철거 업체에서 브레이커를 잡고 해체 보조를 시작했다.' }),
      E('self', { minEdu: 'high', ages: [32, 60], p: 0.06, text: '장비를 빌려 철거 소규모 도급을 받았다.' }),
    ],
    transitions: [tr('78499', [24, 58], 3, 0.03, '토목 일로 이동'), tr('78210', [24, 58], 3, 0.04, '건설 기능 일반으로'), tr('79919', [30, 62], 4, 0.03, '세정 일로 이동')],
    events: [
      ev('78293', 'dust_mask', [22, 60], 0.13, '철거 먼지가 자욱해 방진 마스크를 두 번 갈았다.', 'health-2 medical+1', '분진 노출', { dark: true }),
      ev('78293', 'foreign_mate', [22, 60], 0.11, '외국인 동료와 손짓으로 신호를 맞춰 철거 순서를 정했다.', 'relations+2 intellect+1', '외국인 동료 협업'),
      ch('78293', 'asbestos_find', [24, 62], 0.1, '천장에서 석면 의심 자재가 나왔다.', '어떻게 할까?', [
        ['stop', '작업을 멈춘다', 'health+1 wealth-3 conflict+1', '검사를 기다리는 동안 일당이 끊겼다.'],
        ['quiet', '그대로 진행', 'wealth+2 health-4', '일정은 지켰지만 불안이 남았다.'],
      ], 'stop', '유해 자재'),
      ev('78293', 'redevelop_wave', [26, 62], 0.1, '재개발 구역 철거가 한꺼번에 나와 몇 달을 쉬지 못했다.', 'wealth+3 leisure-3 health-1', '재개발 철거'),
    ],
    hazard: 2, burnout: 0.06,
  }),
  X('78112', {
    entry: [
      E('hire', { minEdu: 'high', ages: [20, 55], p: 0.4, text: '철골 건립 팀에서 볼트를 조이고 보를 받는 일로 시작했다.' }),
      E('promote', { from: ['78291', '74069'], minYears: 3, ages: [24, 55], p: 0.08, text: '비계·용접 경험을 살려 철골 건립 팀에 합류했다.' }),
    ],
    transitions: [tr('78120', [22, 55], 3, 0.05, '경량 철골로 이동'), tr('74069', [22, 55], 3, 0.04, '용접 일로 이동'), tr('78291', [24, 58], 3, 0.04, '비계 일로 이동')],
    events: [
      ev('78112', 'high_beam', [22, 55], 0.13, '아득한 높이의 보 위에서 안전고리를 걸고 볼트를 조였다.', 'health-2 happiness+1 wealth+2', '고소 작업'),
      ev('78112', 'safety_check', [24, 58], 0.11, '안전 점검에서 추락 방지망이 부족하다는 지적이 나왔다.', 'conflict+2 happiness-1 fairness+1', '안전 미비', { dark: true }),
      ch('78112', 'night_wind', [24, 55], 0.1, '강풍 예보가 있는데 공정이 밀려 있다.', '작업을 할까?', [
        ['halt', '중단을 요청', 'health+1 wealth-2 conflict+1', '일당은 줄었지만 안전을 지켰다.'],
        ['work', '일정대로 진행', 'wealth+3 health-3', '일은 끝냈다. 하루 종일 마음이 조마조마했다.'],
      ], 'halt', '강풍 작업'),
      ev('78112', 'crew_leader', [30, 60], 0.09, '반장이 되어 팀 일당을 나누고 배치를 맡았다.', 'wealth+2 relations+1 leisure-1', '반장 승진'),
    ],
    hazard: 3, burnout: 0.07,
  }),
  X('78120', {
    entry: [
      E('hire', { minEdu: 'high', ages: [18, 58], p: 0.4, text: '경량 철골 팀에서 스터드를 박고 천장틀을 짜는 일을 배웠다.' }),
      E('self', { minEdu: 'high', ages: [30, 60], p: 0.1, text: '경량 철골·칸막이 시공 팀을 직접 꾸렸다.' }),
    ],
    transitions: [tr('78292', [22, 58], 3, 0.05, '칸막이 시공으로 이동'), tr('78244', [24, 58], 3, 0.04, '내장 목공으로 이동'), tr('78112', [22, 50], 3, 0.03, '철골 건립으로 이동')],
    events: [
      ev('78120', 'ceiling_frame', [22, 62], 0.12, '천장틀이 도면과 한 번에 맞아 검수를 바로 통과했다.', 'happiness+2 job+1', '검수 통과'),
      ev('78120', 'neck_ache', [28, 65], 0.12, '고개를 젖히고 하는 천장 작업에 목과 어깨가 굳었다.', 'health-3 medical+1', '자세 부담', { dark: true }),
      ch('78120', 'sub_contract', [28, 62], 0.1, '원청이 단가를 깎아 하도급 계약을 제안했다.', '받아들일까?', [
        ['accept', '수락한다', 'wealth+2 happiness-1 leisure-2', '일감은 이어졌지만 일손이 더 필요했다.'],
        ['refuse', '거절한다', 'happiness+1 wealth-3 relations+1', '다른 현장을 찾아야 했다.'],
      ], 'accept', '하도급 단가'),
      ev('78120', 'weekend_shift', [22, 60], 0.1, '공기를 맞추려 주말 공정이 잡혔다.', 'wealth+2 leisure-3 health-1', '주말 근무'),
    ],
    hazard: 2, burnout: 0.05,
  }),
  X('78244', {
    entry: [
      E('hire', { minEdu: 'high', ages: [18, 55], p: 0.4, text: '인테리어 목공 팀에서 조수로 몰딩과 문틀을 배웠다.' }),
      E('self', { minEdu: 'high', ages: [30, 60], p: 0.12, text: '인테리어 목공 사무실을 열고 가구 시공을 받았다.' }),
    ],
    transitions: [tr('73021', [24, 58], 4, 0.04, '가구 제조로 이동'), tr('78341', [24, 58], 3, 0.04, '마루 시공으로 이동'), tr('78391', [32, 62], 5, 0.04, '건물 수리로 전환')],
    events: [
      ev('78244', 'built_in', [26, 62], 0.12, '맞춤 붙박이장이 딱 맞아 집주인이 감탄했다.', 'happiness+2 relations+1', '솜씨 인정'),
      ev('78244', 'table_saw', [22, 62], 0.1, '테이블쏘 앞에서 잠깐 집중이 흐트러져 손가락을 살짝 다쳤다.', 'health-3 wealth-2 medical+1', '공구 사고', { dark: true }),
      ch('78244', 'design_change', [28, 62], 0.12, '집주인이 공사 중 설계 변경을 자꾸 요청한다.', '어떻게 할까?', [
        ['charge', '변경비를 청구', 'wealth+2 relations-2 conflict+1', '비용을 정리했다. 분위기가 서먹해졌다.'],
        ['accept', '그냥 맞춰 준다', 'relations+2 wealth-2 leisure-2', '관계는 좋았다. 공기가 늘어졌다.'],
      ], 'charge', '설계 변경'),
      ev('78244', 'remodel_boom', [28, 64], 0.1, '집값이 오르며 리모델링 문의가 이어져 일정이 두 달 밀렸다.', 'wealth+3 leisure-2', '리모델링 수요'),
    ],
    hazard: 2, burnout: 0.05,
  }),
  X('79290', {
    entry: [
      E('hire', { minEdu: 'high', ages: [18, 55], p: 0.4, text: '설비 업체에서 배관 보조로 파이프와 공구를 날랐다.' }),
      E('self', { minEdu: 'high', ages: [30, 60], p: 0.1, text: '배관 설비 업체를 열어 아파트 보수 일을 받았다.' }),
    ],
    transitions: [tr('79212', [24, 58], 3, 0.05, '가스 배관으로 이동'), tr('79221', [24, 55], 3, 0.04, '플랜트 배관으로 이동'), tr('75369', [26, 58], 4, 0.03, '보일러 일로 이동')],
    events: [
      ev('79290', 'winter_burst', [24, 62], 0.13, '한파에 동파가 이어져 열흘 내내 출동했다.', 'wealth+3 health-2 leisure-3', '동파 출동'),
      ev('79290', 'tight_space', [24, 62], 0.1, '좁은 천장 속에서 한참 누워 배관을 이었다. 허리가 뻐근했다.', 'health-2 happiness-1', '좁은 작업 공간', { dark: true }),
      ch('79290', 'old_pipe', [28, 62], 0.11, '오래된 아파트 배관을 부분 보수할지 전체 교체할지 고민이다.', '무엇을 권할까?', [
        ['partial', '부분 보수', 'wealth+1 relations+1 happiness-1', '비용은 줄었다. 몇 해 뒤 다시 터질 수 있다.'],
        ['full', '전체 교체', 'wealth+3 relations-1 leisure-2', '공사가 컸다. 고객은 처음엔 놀랐다.'],
      ], 'partial', '보수 방식'),
      ev('79290', 'lowball_bid', [28, 64], 0.1, '입찰에서 더 낮은 가격이 나와 일감을 놓쳤다.', 'wealth-3 happiness-1 job+1', '저가 입찰', { dark: true }),
    ],
    hazard: 2, burnout: 0.05,
  }),
  X('79212', {
    entry: [
      E('hire', { minEdu: 'high', ages: [20, 55], p: 0.35, text: '도시가스 협력업체에서 배관 보조로 일을 시작했다.' }),
      E('promote', { from: ['79211', '79290'], minYears: 3, ages: [26, 58], p: 0.1, text: '배관 경험을 인정받아 가스 배관을 맡았다.' }),
    ],
    transitions: [tr('79290', [24, 60], 3, 0.04, '일반 배관으로 이동'), tr('75369', [26, 58], 4, 0.04, '보일러 일로 이동'), tr('79221', [26, 55], 4, 0.03, '플랜트 배관으로 이동')],
    events: [
      ev('79212', 'leak_test', [24, 62], 0.12, '기밀 시험을 몇 번 반복해 누설이 없음을 확인했다.', 'intellect+1 happiness+1 job+1', '기밀 검사'),
      ev('79212', 'cold_dawn', [22, 62], 0.12, '새벽 한파 속 도로 굴착 현장에 나가 손이 얼었다.', 'health-2 leisure-1', '야외 한파', { dark: true }),
      ch('79212', 'weekend_alert', [28, 62], 0.1, '주말 가스 민원 대기조를 맡아 달라는 요청이 있다.', '맡을까?', [
        ['duty', '대기조를 맡는다', 'wealth+3 leisure-3 health-1', '수당을 받았다. 휴대폰을 곁에 두고 지냈다.'],
        ['pass', '사양한다', 'leisure+2 wealth-2 relations-1', '쉬었지만 팀 눈치가 보였다.'],
      ], 'duty', '대기조'),
      ev('79212', 'pipe_cert', [26, 60], 0.09, '배관 관련 교육을 수료해 기술 수당이 붙었다.', 'wealth+2 intellect+2', '교육 수료'),
    ],
    hazard: 2, burnout: 0.05,
  }),
  X('79221', {
    entry: [
      E('hire', { minEdu: 'high', ages: [20, 55], p: 0.35, text: '플랜트 협력사에 배관 보조로 입사해 도면을 읽기 시작했다.' }),
      E('promote', { from: ['79290', '74069'], minYears: 3, ages: [26, 55], p: 0.1, text: '배관·용접 경력으로 플랜트 현장에 투입되었다.' }),
    ],
    transitions: [tr('79290', [26, 60], 3, 0.04, '일반 배관으로 이동'), tr('74069', [24, 55], 3, 0.04, '용접 일로 이동'), tr('79222', [26, 55], 4, 0.03, '선박 배관으로 이동')],
    events: [
      ev('79221', 'shutdown_job', [24, 58], 0.13, '정기 보수 기간에 3주 연속 야간 근무를 했다. 수당이 쏠쏠했다.', 'wealth+4 health-3 leisure-3', '셧다운 보수'),
      ev('79221', 'dispatch_far', [24, 58], 0.12, '현장이 바뀌어 지방 숙소에서 석 달을 지냈다.', 'relations-2 wealth+2 region+1', '출장 근무', { dark: true }),
      ch('79221', 'foreign_crew', [26, 60], 0.1, '외국인 노동자 조와 같이 일하게 되어 소통이 어렵다.', '어떻게 풀까?', [
        ['learn', '표현을 배운다', 'intellect+2 relations+1 leisure-1', '현장 용어를 맞춰 보며 손발을 맞췄다.'],
        ['lead', '지시를 간소화', 'happiness-1 wealth+1 relations-1', '말을 줄이니 빠르긴 했지만 서먹했다.'],
      ], 'learn', '외국인 동료'),
      ev('79221', 'pay_gap', [26, 62], 0.1, '원청과 하청의 일당 차이를 알게 되어 마음이 상했다.', 'happiness-2 fairness+2', '일당 격차', { dark: true }),
    ],
    hazard: 2, burnout: 0.06,
  }),
  X('74069', {
    entry: [
      E('hire', { minEdu: 'high', ages: [18, 55], p: 0.4, text: '용접 학원을 수료하고 공장에 보조로 들어갔다.' }),
      E('self', { minEdu: 'high', ages: [30, 60], p: 0.08, text: '용접 공방을 열고 철제 구조물 주문을 받았다.' }),
    ],
    transitions: [tr('74061', [22, 58], 3, 0.04, '가스 용접으로 이동'), tr('78112', [22, 55], 3, 0.04, '철골 건립으로 이동'), tr('79221', [24, 55], 4, 0.04, '플랜트 배관으로 이동')],
    events: [
      ev('74069', 'bead_clean', [20, 62], 0.12, '용접 비드가 깨끗하게 나와 비파괴 검사를 한 번에 통과했다.', 'happiness+2 job+1 intellect+1', '검사 통과'),
      ev('74069', 'arc_eye', [20, 62], 0.12, '순간 아크 불빛에 눈이 따갑다. 하루 쉬며 안정을 취했다.', 'health-2 wealth-1 medical+1', '눈 자극', { dark: true }),
      ch('74069', 'overseas_job', [24, 52], 0.08, '해외 현장 용접 인력 모집이 올라왔다.', '지원할까?', [
        ['go', '지원한다', 'wealth+4 relations-3 leisure-2', '급여가 높았다. 가족과 떨어져 지냈다.'],
        ['stay', '남는다', 'relations+2 wealth-1 happiness+1', '가까이서 일하며 안정을 택했다.'],
      ], 'stay', '해외 현장', { once: true }),
      ev('74069', 'night_fume', [22, 62], 0.1, '야간 작업 중 용접 흄이 매캐해 환기를 요청했다.', 'health-3 conflict+1', '용접 흄', { dark: true }),
    ],
    hazard: 2, burnout: 0.06,
  }),
  X('74050', {
    entry: [
      E('hire', { minEdu: 'high', ages: [18, 55], p: 0.4, text: '판금 공장에서 절곡기와 레이저 가공기 옆에서 일을 배웠다.' }),
      E('self', { minEdu: 'high', ages: [30, 60], p: 0.1, text: '판금 가공 공방을 열어 소량 주문을 받았다.' }),
    ],
    transitions: [tr('74040', [22, 58], 4, 0.04, '제관 일로 이동'), tr('74069', [22, 55], 3, 0.04, '용접 일로 이동'), tr('74010', [24, 55], 4, 0.03, '금형 일로 이동')],
    events: [
      ev('74050', 'bend_drawing', [22, 62], 0.12, '복잡한 도면 하나를 한 번에 접어 내 반장이 칭찬했다.', 'happiness+2 intellect+1', '도면 가공'),
      ev('74050', 'press_scare', [20, 60], 0.11, '프레스 기계 센서가 오작동해 아찔했다. 라인이 한참 멈췄다.', 'happiness-1 health-1 conflict+1', '기계 안전', { dark: true }),
      ch('74050', 'laser_invest', [30, 62], 0.1, '공방에 레이저 가공기를 들일지 고민이다.', '어떻게 할까?', [
        ['buy', '대출로 들인다', 'wealth+3 leisure-2 happiness-1 debt+4000', '일감은 늘었지만 월 상환이 부담이다.'],
        ['outsource', '외주를 준다', 'wealth+1 leisure+1 happiness-1', '비용은 가볍지만 납기가 늦어졌다.'],
      ], 'outsource', '장비 투자', { who: 'self' }),
      ev('74050', 'unit_price_cut', [26, 62], 0.1, '거래처가 개당 단가를 내리라고 요구했다.', 'wealth-3 conflict+1 happiness-1', '단가 인하', { dark: true }),
    ],
    hazard: 2, burnout: 0.06,
  }),
];
