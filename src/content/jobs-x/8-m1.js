import { ev, ch } from '../jobs-kit.js';
export default {
  '83231': [
    ev('83231', 'mold_trial', [20, 58], 0.12, '새 금형 시험 사출에서 불량 없이 첫 제품이 나왔다. 조장이 어깨를 두드렸다.', 'happiness+2 job+1 relations+1', '금형 시험 성공'),
    ev('83231', 'resin_smell', [22, 60], 0.12, '수지를 녹이는 냄새와 열기에 하루 종일 두통이 이어졌다.', 'health-2 happiness-1', '수지 가열 냄새', { dark: true }),
    ch('83231', 'cycle_tune', [24, 58], 0.11, '사출 사이클을 줄이면 물량이 늘지만 불량 위험이 커진다.', '어떻게 할까?', [
      ['fast', '사이클을 줄인다', 'wealth+2 relations-1 health-1', '물량이 늘었다. 불량 선별에 시간이 더 들었다.'],
      ['keep', '현재 설정 유지', 'intellect+1 wealth-1 happiness+1', '품질은 안정적이었다. 목표 물량은 살짝 못 채웠다.'],
    ], 'keep', '사이클 조정'),
  ],
  '85301': [
    ev('85301', 'robot_teach', [22, 56], 0.12, '로봇 티칭 교육을 받고 직접 경로를 수정해 보았다. 기계가 말을 들었다.', 'intellect+2 happiness+1 job+1', '로봇 티칭 교육'),
    ev('85301', 'sensor_stop', [20, 56], 0.13, '센서 오류로 라인이 멈춰 원인을 찾느라 몇 시간 서 있었다.', 'happiness-1 leisure-1 job+1', '센서 오류 대응'),
    ev('85301', 'headcount_cut', [28, 58], 0.1, '자동화율이 오르며 공정 인원이 줄고 희망퇴직 안내가 돌았다.', 'happiness-3 job-3 tech+2', '자동화 인력 감축', { dark: true, who: 'wage' }),
  ],
  '85411': [
    ev('85411', 'award_team', [22, 58], 0.1, '라인 불량률이 가장 낮아 팀이 품질 표창을 받았다. 회식비도 나왔다.', 'happiness+3 relations+2', '품질 표창'),
    ch('85411', 'rotation_pick', [24, 58], 0.12, '공정 순환 배치에서 힘든 도장 공정이나 단조로운 검사 공정 중 하나를 골라야 한다.', '어떻게 할까?', [
      ['paint', '도장 공정', 'wealth+2 health-2 relations+1', '냄새가 독하고 수당이 붙었다.'],
      ['inspect', '검사 공정', 'happiness-1 health+1 intellect+1', '수당은 적고 눈이 피로했지만 몸은 덜 힘들었다.'],
    ], 'inspect', '공정 순환 배치'),
    ev('85411', 'shoulder_pain', [28, 60], 0.12, '의장 라인 팔 올림 작업이 쌓여 어깨 치료를 받으러 다녔다.', 'health-3 medical+2 happiness-1', '반복 작업 어깨 통증', { dark: true }),
  ],
  '86312': [
    ev('86312', 'yield_up', [22, 54], 0.12, '수율 개선 활동이 성과를 내 팀이 보너스를 받았다.', 'happiness+2 wealth+2 relations+1', '수율 개선 성과', { years: [2000, 2060] }),
    ev('86312', 'electrolyte_skin', [24, 56], 0.11, '전해액 취급 구역에서 피부가 따가워 보호구를 다시 점검했다.', 'health-2 happiness-1 conflict+1', '화학물질 취급 불안', { dark: true, years: [2000, 2060] }),
    ch('86312', 'line_transfer', [24, 56], 0.1, '해외 신공장 파견 모집이 올라왔다. 수당은 높지만 몇 년 떠나야 한다.', '어떻게 할까?', [
      ['go', '파견에 지원', 'wealth+3 relations-2 leisure-2 intellect+1', '낯선 곳에서 설비를 세웠다. 가족과 떨어졌다.'],
      ['stay', '국내에 남는다', 'relations+2 happiness+1 wealth-2', '가족 곁에 있었다. 승진 기회는 줄었다.'],
    ], 'stay', '해외 공장 파견', { years: [2005, 2060] }),
  ],
  '86331': [
    ev('86331', 'yield_praise', [20, 54], 0.12, '설비 점검을 꼼꼼히 해 수율이 올랐다. 담당 엔지니어가 이름을 기억했다.', 'happiness+2 job+1 relations+1', '설비 수율 개선'),
    ev('86331', 'eye_strain', [24, 56], 0.13, '현미경 검사와 장시간 모니터 감시로 눈이 늘 뻑뻑했다.', 'health-2 leisure-1', '눈 피로 누적', { dark: true }),
    ev('86331', 'contract_end', [22, 54], 0.1, '업황이 꺾여 협력업체 계약 인원이 줄었다. 재계약은 다음 달 결정이다.', 'job-2 happiness-2 wealth-1', '계약 인원 조정', { dark: true, who: 'wage' }),
    ch('86331', 'cert_exam', [24, 54], 0.1, '설비 보전 기능사 시험을 보면 정비 업무로 옮길 수 있다.', '어떻게 할까?', [
      ['study', '시험 준비', 'intellect+2 leisure-3 job+1', '교대 근무 틈틈이 공부했다. 합격하면 승급 기회가 열린다.'],
      ['rest', '쉴 때 쉰다', 'leisure+2 happiness+1 intellect-1', '쉬는 날을 지켰다. 자격은 다음으로 미뤘다.'],
    ], 'rest', '보전 기능사 도전'),
  ],
  '87210': [
    ev('87210', 'airport_fare', [30, 68], 0.1, '공항 장거리 손님을 태워 하루 벌이가 모처럼 넉넉했다.', 'wealth+3 happiness+1', '장거리 손님'),
    ev('87210', 'drunk_fare', [28, 68], 0.13, '밤에 취객이 시비를 걸어 요금을 두고 한참 실랑이했다.', 'happiness-3 relations-1 conflict+2', '취객 감정노동', { dark: true }),
    ch('87210', 'hours_pick', [30, 66], 0.12, '야간 운행이 요금이 높지만 낮 근무가 몸은 편하다.', '어떻게 할까?', [
      ['night', '야간 운행', 'wealth+3 health-3 relations-1', '벌이는 나았고 잠이 줄었다.'],
      ['day', '주간 운행', 'health+1 relations+1 wealth-1', '낮 승객이 적어 벌이는 조금 줄었다.'],
    ], 'day', '야간·주간 선택'),
    ev('87210', 'thanks_note', [30, 68], 0.09, '길 못 찾던 노인을 병원 앞까지 모셨다. 손주가 인사 전화를 해 왔다.', 'happiness+3 relations+1', '손님 감사', { once: true }),
  ],
  '87221': [
    ev('87221', 'regular_rider', [30, 62], 0.12, '매일 같은 정류장에서 타는 학생이 인사를 건넸다. 하루가 가벼워졌다.', 'happiness+2 relations+1', '단골 승객 인사'),
    ev('87221', 'drunk_ride', [28, 62], 0.12, '막차 시간 취객이 소란을 피웠다. 운행을 멈추고 진정시켰다.', 'happiness-2 health-1 relations-1', '막차 소란 승객', { dark: true }),
    ch('87221', 'route_change', [30, 62], 0.11, '노선 개편으로 배차가 바뀌고 새 노선 지원 모집이 나왔다.', '어떻게 할까?', [
      ['new', '새 노선 지원', 'wealth+1 intellect+1 leisure-2', '길을 새로 익혔다. 기본 시간이 늘었다.'],
      ['old', '기존 노선 유지', 'happiness+1 relations+1 wealth-1', '익숙한 길을 달렸다. 일부 시간이 줄었다.'],
    ], 'old', '노선 개편'),
    ev('87221', 'heat_wave', [30, 62], 0.1, '한여름 냉방이 고장 난 차에서 운행을 이어 가며 땀을 쏟았다.', 'health-2 happiness-1', '냉방 고장 운행', { dark: true }),
  ],
  '87231': [
    ev('87231', 'regular_shop', [26, 66], 0.12, '단골 가게에서 매일 주문을 넣어 주어 일정이 안정됐다.', 'wealth+2 happiness+1', '단골 거래처'),
    ev('87231', 'unpaid_freight', [28, 64], 0.11, '거래처가 운임을 석 달째 미뤘다. 연락이 닿지 않는다.', 'wealth-3 happiness-2 conflict+2 fairness-1', '운임 미수금', { dark: true }),
    ch('87231', 'night_delivery', [26, 62], 0.12, '새벽 배송 단가가 높지만 일정이 빡빡한 일감이 들어왔다.', '어떻게 할까?', [
      ['take', '새벽 일감을 받는다', 'wealth+3 health-2 leisure-2', '수입이 늘었다. 쉬는 날은 줄었다.'],
      ['skip', '낮 일감만 한다', 'health+1 leisure+1 wealth-1', '평소 리듬을 지켰다. 수입은 그대로다.'],
    ], 'skip', '새벽 배송 단가'),
    ev('87231', 'tire_burst', [28, 64], 0.1, '고속도로에서 타이어가 터져 적재물을 내려놓고 한참 기다렸다.', 'happiness-2 wealth-1 health-1', '타이어 파손', { dark: true }),
  ],
  '87233': [
    ev('87233', 'long_haul_pride', [30, 62], 0.1, '긴 장거리를 사고 없이 마치고 돌아오자 동료들이 안부를 물었다.', 'happiness+2 relations+1', '장거리 완주'),
    ev('87233', 'rest_area', [30, 62], 0.12, '화물차 휴게소가 만차여서 갓길에서 쪽잠을 잤다. 허리가 굳었다.', 'health-3 leisure-1', '휴게 공간 부족', { dark: true }),
    ch('87233', 'contract_choice', [32, 62], 0.1, '운송사에서 전속 계약을 제안했다. 안정적이지만 일감을 고를 수 없다.', '어떻게 할까?', [
      ['sign', '전속 계약', 'wealth+2 happiness+1 relations-1 leisure-1', '고정 수입이 생겼다. 선택의 폭이 줄었다.'],
      ['free', '자유 운행 유지', 'leisure+1 happiness+1 wealth-2', '마음대로 골랐지만 공차가 늘었다.'],
    ], 'free', '전속 계약 제안'),
  ],
  '87293': [
    ev('87293', 'good_passenger', [26, 68], 0.12, '손님이 현금으로 팁을 더 얹어 주었다. 그날은 일찍 마쳤다.', 'wealth+2 happiness+2', '손님 팁'),
    ev('87293', 'drunk_curse', [26, 68], 0.13, '취한 손님이 이유 없이 거친 말을 했다. 말없이 운행을 마쳤다.', 'happiness-3 relations-1', '취객 폭언', { dark: true }),
    ch('87293', 'late_call', [26, 66], 0.12, '새벽 장거리 콜이 떴다. 돈은 되지만 돌아올 길이 막막하다.', '어떻게 할까?', [
      ['take', '콜을 잡는다', 'wealth+3 health-2 leisure-1', '수입은 좋았다. 집에 들어오니 해가 떠 있었다.'],
      ['pass', '건너뛴다', 'health+1 leisure+1 wealth-1', '가까운 콜만 하고 일찍 쉬었다.'],
    ], 'pass', '새벽 장거리 콜'),
    ev('87293', 'insurance_up', [30, 68], 0.09, '보험료와 프로그램 이용료가 오르면서 순수입이 줄었다.', 'wealth-2 happiness-1', '보험·이용료 인상', { dark: true }),
  ],
  '87304': [
    ev('87304', 'forklift_skill', [24, 62], 0.12, '팔레트를 한 번에 정확히 쌓아 현장 반장이 칭찬했다.', 'happiness+2 relations+1 job+1', '적재 솜씨 인정'),
    ev('87304', 'back_vibration', [28, 64], 0.12, '진동이 심한 구형 지게차에서 허리를 다쳐 며칠 쉬었다.', 'health-3 medical+1 wealth-1', '장비 진동 부담', { dark: true }),
    ch('87304', 'dispatch_offer', [24, 62], 0.1, '단기 파견 업체가 더 높은 시급을 제시했다. 계약은 석 달 단위다.', '어떻게 할까?', [
      ['move', '옮긴다', 'wealth+2 happiness-1 relations-1', '시급은 올랐지만 재계약 걱정이 늘었다.'],
      ['stay', '지금 직장 유지', 'happiness+1 relations+1 wealth-1', '안정적으로 일했다. 시급은 그대로다.'],
    ], 'stay', '파견 업체 제안'),
  ],
  '87406': [
    ev('87406', 'site_bonus', [26, 62], 0.11, '공기를 앞당긴 현장에서 소장이 약속한 웃돈을 얹어 주었다.', 'wealth+3 happiness+2', '공기 단축 웃돈'),
    ev('87406', 'pay_delay', [28, 64], 0.12, '건설사 자금난으로 장비 대금이 두 달 밀려 할부금을 못 막았다.', 'wealth-3 debt+1000 happiness-2 fairness-1', '대금 지급 지연', { dark: true }),
    ch('87406', 'skill_cert', [26, 60], 0.1, '대형 장비 자격을 따면 큰 현장에 나갈 수 있다. 학원비와 시간이 든다.', '어떻게 할까?', [
      ['get', '자격을 딴다', 'intellect+2 leisure-2 wealth-1', '몇 주 일을 쉬고 시험을 준비했다. 일감 폭이 넓어졌다.'],
      ['skip', '지금 일에 집중', 'wealth+1 leisure+1 intellect-1', '단가 좋은 일을 이어 갔다. 기회는 뒤로 미뤘다.'],
    ], 'skip', '대형 자격 취득'),
    ev('87406', 'bad_ground', [26, 64], 0.1, '비로 굳지 않은 땅에서 장비가 기울어 아찔한 순간을 겪었다.', 'health-1 happiness-2', '연약 지반 작업', { dark: true }),
  ],
};
