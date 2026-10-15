import { ev, ch } from '../jobs-kit.js';
const ACTIVE = ['employed', 'self', 'military'];
const serving = e => ({ ...e, when: L => L.mil?.status === 'serving' || (L.job?.code === 'A0900' && ACTIVE.includes(L.job.status)) });
export default {
  '11121': [
    ev('11121', 'policy_blame', [40, 60], 0.12, '정책 실패의 책임 공방 속에서 실무 보고서가 언론에 인용됐다.', 'happiness-3 relations-1 conflict+3', '정책 책임 공방', { dark: true }),
    ch('11121', 'press_brief', [42, 60], 0.12, '국정감사 전날 밤, 답변 자료를 쓰려는데 기관 내부 의견이 갈린다.', '어떻게 정리할까?', [
      ['clear', '사실만 간결히', 'intellect+1 relations-2 happiness+1', '답변은 짧았고 일부 의원실은 못마땅해했다.'],
      ['wide', '폭넓게 설명', 'relations+1 leisure-2 intellect+1', '자료가 두꺼워졌고 밤샘이 길어졌다.'],
    ], 'clear', '감사 답변 준비'),
    ev('11121', 'award_policy', [42, 60], 0.09, '오래 준비한 제도가 시행돼 현장에서 고맙다는 말을 들었다.', 'happiness+4 relations+2', '정책 시행 보람', { once: true }),
  ],
  '11201': [
    ev('11201', 'bank_loan', [38, 62], 0.12, '금리가 올라 대출 이자 부담이 커졌다. 투자 계획을 줄여야 한다.', 'wealth-2 happiness-2 leisure-1 debt+2000', '금리 인상 부담', { dark: true }),
    ch('11201', 'new_market', [36, 62], 0.12, '거래처가 해외 진출 제안을 가져왔다. 자금과 사람이 빠듯하다.', '어떻게 할까?', [
      ['go', '시범 진출', 'wealth-2 intellect+2 leisure-2 debt+2000', '작은 물량으로 시작했다. 현지 일정에 몇 달이 사라졌다.'],
      ['hold', '국내 집중', 'wealth+1 happiness+1 intellect-1', '안정은 지켰다. 기회를 놓쳤다는 생각이 가끔 들었다.'],
    ], 'hold', '해외 진출 제안'),
    ev('11201', 'long_staff', [40, 64], 0.1, '20년 근속 직원들에게 패를 전달하며 함께 사진을 찍었다.', 'happiness+3 relations+3', '장기근속 시상', { once: true }),
    ev('11201', 'strike_talks', [38, 62], 0.11, '임금 교섭이 길어져 양쪽 모두 지쳐 갔다.', 'happiness-2 relations-2 conflict+3', '임금 교섭 장기화', { dark: true, who: 'wage' }),
  ],
  '12121': [
    ev('12121', 'harassment_case', [36, 56], 0.11, '직장 내 괴롭힘 신고가 들어와 양쪽 면담을 몇 주째 이어가고 있다.', 'happiness-3 relations-2 conflict+3', '괴롭힘 조사', { dark: true }),
    ch('12121', 'new_hr_system', [36, 56], 0.1, '인사 평가 제도 개편안을 놓고 노사 양쪽에서 의견이 들어왔다.', '어느 쪽을 반영할까?', [
      ['merit', '성과 비중 확대', 'intellect+1 relations-2 happiness-1', '평가가 선명해졌지만 팀 분위기가 한동안 가라앉았다.'],
      ['balance', '근속 비중 유지', 'relations+2 intellect-1 leisure-1', '반발은 줄었고 젊은 직원들의 불만이 조금 남았다.'],
    ], 'balance', '평가 제도 개편'),
    ev('12121', 'welfare_event', [34, 56], 0.1, '사내 가족의 날 행사를 마쳐 직원들이 고맙다고 인사했다.', 'happiness+3 relations+2', '사내 행사', { once: true }),
  ],
  '14111': [
    ev('14111', 'weather_delay', [38, 60], 0.13, '장마가 길어져 타설 일정이 밀렸고 협력업체 인건비 정산이 걱정이다.', 'happiness-2 leisure-2 job+3', '우천 공기 지연', { dark: true }),
    ch('14111', 'subcontract_dispute', [36, 60], 0.12, '협력업체가 추가 공사비를 요구했다. 본사 승인은 아직이다.', '어떻게 할까?', [
      ['pay', '현장 선 조정', 'relations+2 wealth-1 conflict+2', '일단 공정을 지켰다. 본사와의 정산은 길게 갔다.'],
      ['wait', '승인 후 진행', 'relations-2 leisure-1 happiness-1', '규정대로 기다렸다. 작업이 며칠 멈췄다.'],
    ], 'wait', '추가 공사비 분쟁'),
    ev('14111', 'topping_out', [36, 60], 0.1, '상량식을 열었다. 작업자들과 한 해 고생을 나눴다.', 'happiness+3 relations+3 job-2', '준공 행사', { once: true }),
    ev('14111', 'safety_inspect', [36, 60], 0.11, '노동 당국의 현장 점검이 나와 안전 서류와 시설을 하나씩 확인받았다.', 'happiness-1 leisure-1 job+2', '현장 안전 점검', { dark: true, cd: 4 }),
  ],
  '15111': [
    ev('15111', 'cancel_deal', [34, 58], 0.12, '석 달 공들인 큰 계약이 마지막에 무산됐다. 분기 목표가 흔들린다.', 'happiness-3 wealth-1 job+3', '대형 계약 무산', { dark: true }),
    ch('15111', 'discount_pressure', [34, 58], 0.12, '핵심 거래처가 단가 인하를 요구했다. 안 받으면 다른 업체로 갈 수 있다.', '어떻게 대응할까?', [
      ['accept', '일부 수용', 'wealth-2 relations+2 happiness+1', '마진을 줄이고 계약을 이어갔다. 위에는 이유를 길게 설명했다.'],
      ['firm', '기준 유지', 'wealth+1 relations-2 happiness-1', '거래량이 줄었다. 팀원들은 목표 조정을 바랐다.'],
    ], 'accept', '단가 인하 요구'),
    ev('15111', 'top_seller', [34, 58], 0.1, '팀 후배가 올해 최고 실적을 올려 같이 소고기를 먹었다.', 'happiness+3 relations+2', '팀 실적', { once: true }),
  ],
  '15220': [
    ev('15220', 'rent_hike', [30, 58], 0.11, '건물주가 임대료를 올려 점장인 나도 매출 목표를 다시 받았다.', 'happiness-2 wealth-1 job+3', '임대료 인상', { dark: true }),
    ch('15220', 'peak_hours', [28, 56], 0.12, '연말 예약이 한꺼번에 몰렸다. 홀과 주방 인원은 그대로다.', '어떻게 운영할까?', [
      ['limit', '예약 제한', 'wealth-2 happiness+1 health+1', '손님을 조금 돌려보냈고 직원들은 한숨 돌렸다.'],
      ['full', '전부 받는다', 'wealth+3 health-2 happiness-1', '매출은 좋았다. 직원들이 퇴근 후 말없이 가방을 챙겼다.'],
    ], 'limit', '연말 예약 대응'),
    ev('15220', 'regular_chef', [28, 58], 0.1, '단골 손님이 직원 이름을 기억하며 칭찬 쪽지를 남겼다.', 'happiness+3 relations+2', '단골 칭찬', { once: true }),
  ],
  'A0120': [
    ev('A0120', 'platoon_accident', [24, 40], 0.1, '훈련 중 병사가 다쳐 사고 보고를 쓰고 면담을 이어갔다.', 'happiness-3 relations-1 health-1', '훈련 사고 책임', { dark: true }),
    ch('A0120', 'duty_choice', [24, 40], 0.12, '주말 대기 근무와 가족 행사가 겹쳤다. 대체 인원이 마땅치 않다.', '어떻게 할까?', [
      ['duty', '근무를 선다', 'happiness-1 relations-3 job-1', '근무를 섰다. 집에 늦게 도착해 미안한 말을 했다.'],
      ['swap', '동료와 교대', 'relations+2 happiness+1 leisure-1', '동료가 대신 섰다. 다음 달에 내가 두 번 서기로 했다.'],
    ], 'duty', '근무와 가족 행사'),
    ev('A0120', 'cohort_bond', [24, 42], 0.1, '임관 동기들과 모임을 가져 오랜만에 부대 밖 이야기를 나눴다.', 'happiness+3 relations+3', '동기 모임', {}),
  ],
  'A0300': [
    ev('A0300', 'night_duty', [22, 50], 0.12, '야간 경계 근무와 훈련이 겹쳐 몇 주째 제대로 잠을 못 잤다.', 'health-2 leisure-3 happiness-1', '야간 근무 누적', { dark: true }),
    ch('A0300', 'study_course', [24, 40], 0.12, '군 위탁 교육과 자격 과정 중 하나만 신청할 수 있다.', '어느 쪽을 선택할까?', [
      ['degree', '학위 과정', 'intellect+3 leisure-3 wealth-1', '야간에 온라인 강의를 들었다. 피곤했지만 졸업이 가까워졌다.'],
      ['cert', '기술 자격 과정', 'intellect+2 wealth+1 leisure-1', '짧은 과정에 합격해 전역 후 이력에 한 줄이 늘었다.'],
    ], 'cert', '위탁 교육 선택'),
    ev('A0300', 'unit_award', [24, 46], 0.1, '소대원들과 준비한 사격 대회에서 상위권에 올라 함께 사진을 찍었다.', 'happiness+3 relations+2', '사격 대회 입상', { once: true }),
  ],
  'A0900': [
    serving(ev('A0900', 'guard_night', [19, 28], 0.18, '한겨울 야간 경계 근무를 서며 발끝이 얼 만큼 추웠다.', 'health-2 happiness-2 leisure-1', '혹한기 경계 근무', { dark: true })),
    serving(ch('A0900', 'bunk_conflict', [19, 28], 0.15, '생활관에서 선임과 후임 사이의 크고 작은 갈등이 이어졌다.', '어떻게 지낼까?', [
      ['talk', '직접 이야기', 'relations+2 happiness-1 leisure-1', '어색했지만 몇 번 이야기한 뒤 분위기가 조금 나아졌다.'],
      ['report', '간부에게 상담', 'relations-1 happiness+1 intellect+1', '상담 후 생활관이 재배치됐고 한동안 거리가 생겼다.'],
    ], 'talk', '생활관 갈등')),
    serving(ev('A0900', 'letter_home', [19, 28], 0.18, '집에서 온 편지를 읽으며 남은 날짜를 손가락으로 세어 봤다.', 'happiness+3 relations+2', '가족 편지', { once: true })),
  ],
};
