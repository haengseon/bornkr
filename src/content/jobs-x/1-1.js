import { X, E, tr, ev, ch } from '../jobs-kit.js';
export default [
  X('13201', {
    entry: [
      E('promote', { from: ['34022', '34021', '51032'], minYears: 10, ages: [38, 55], p: 0.1, text: '보험 심사와 사무를 오래 해 지점·팀 관리자가 됐다.' }),
      E('hire', { minEdu: '4yr', majors: ['soc'], ages: [35, 50], p: 0.04, text: '보험사 경력 채용으로 관리자가 됐다.' }),
    ],
    transitions: [
      tr('13202', [42, 55], 6, 0.04, '금융 관리자로 이동'),
      tr('28151', [50, 60], 12, 0.03, '퇴직 후 리스크 컨설턴트'),
      tr('11202', [52, 60], 15, 0.02, '임원으로 승진'),
    ],
    events: [
      ev('13201', 'loss_ratio', [36, 58], 0.14, '손해율 보고 마감이 겹쳐 주말에 나와 숫자를 맞췄다.', 'health-2 leisure-3 job+2', '손해율 보고 야근', { dark: true, cd: 3 }),
      ch('13201', 'planner_leaves', [38, 58], 0.12, '실적이 좋은 설계사가 다른 회사로 옮기겠다고 했다.', '어떻게 대응할까?', [
        ['keep', '조건을 맞춘다', 'wealth-2 relations+2 happiness+1', '수수료 조건을 조정해 남게 했다. 다른 설계사들 눈치가 마음에 걸렸다.'],
        ['let', '보내준다', 'wealth+1 relations-2 happiness-1', '인사하고 보냈다. 담당 고객 인수인계에 한 달이 걸렸다.'],
      ], 'keep', '설계사 이탈'),
      ev('13201', 'claim_complaint', [35, 60], 0.12, '지급 거절 민원이 올라와 고객과 한 시간 넘게 통화했다.', 'happiness-2 relations-1 conflict+3', '지급 민원 응대', { dark: true }),
      ev('13201', 'team_exam', [35, 58], 0.1, '팀원이 손해사정 시험에 합격했다. 같이 점심을 먹었다.', 'happiness+2 relations+2 job-2', '팀원 자격 취득', { once: true }),
    ],
    hazard: 0, burnout: 0.05,
  }),
  X('13202', {
    entry: [
      E('promote', { from: ['34030', '34090', '34010'], minYears: 10, ages: [38, 55], p: 0.1, text: '창구와 심사 업무를 거쳐 영업점 관리자가 됐다.' }),
      E('hire', { minEdu: '4yr', majors: ['soc'], ages: [34, 50], p: 0.04, text: '금융권 경력 채용으로 팀장급 관리자가 됐다.' }),
    ],
    transitions: [
      tr('12123', [42, 55], 6, 0.04, '재무 관리자로 이동'),
      tr('28211', [40, 52], 8, 0.02, '증권 분석가로 이직'),
      tr('11202', [52, 60], 15, 0.02, '임원으로 승진'),
    ],
    events: [
      ev('13202', 'branch_merge', [38, 58], 0.12, '영업점 통폐합 계획이 내려왔다. 직원 배치를 짜야 한다.', 'happiness-2 relations-1 job+4', '영업점 통폐합', { dark: true }),
      ch('13202', 'npl_review', [38, 58], 0.12, '부실 우려 여신 심사 자료가 올라왔다. 담당자는 아는 사람이다.', '어떻게 처리할까?', [
        ['strict', '원칙대로 심사', 'happiness-1 relations-2 intellect+1', '기준대로 처리했다. 한동안 담당자와 말을 나누지 못했다.'],
        ['review', '재검토 요청', 'relations+1 leisure-2 wealth-1', '보완 자료를 받아 다시 보게 했다. 일정이 늦어졌다.'],
      ], 'strict', '여신 심사 판단'),
      ev('13202', 'fintech_tool', [38, 60], 0.1, '대출 심사에 자동 평가 도구가 들어와 업무 방식이 바뀌었다.', 'intellect+1 leisure-1 tech+3', '심사 자동화', { years: [2018, 2060], dark: true }),
      ev('13202', 'branch_record', [38, 58], 0.1, '영업점이 지역 우수 점포로 뽑혀 단골 고객이 인사를 건넸다.', 'happiness+3 relations+2 job-2', '우수 점포 선정', { once: true }),
    ],
    hazard: 0, burnout: 0.05,
  }),
  X('13310', {
    entry: [
      E('promote', { from: ['24610', '24661', '25310'], minYears: 12, ages: [38, 56], p: 0.08, text: '병원 실무를 오래 해 원무·행정 관리자가 됐다.' }),
      E('hire', { minEdu: '4yr', ages: [34, 52], p: 0.04, text: '병원 경영지원 경력으로 관리자 채용에 붙었다.' }),
    ],
    transitions: [
      tr('13320', [42, 58], 6, 0.03, '복지 시설 관리자로 이동'),
      tr('28151', [50, 60], 12, 0.03, '병원 경영 컨설턴트'),
      tr('35290', [40, 52], 8, 0.02, '보건 행정직으로 이직'),
    ],
    events: [
      ev('13310', 'staff_shortage', [36, 58], 0.14, '야간 간호 인력이 모자라 병동 배치표를 몇 번이나 다시 짰다.', 'happiness-2 leisure-2 job+3', '인력 부족 배치', { dark: true }),
      ch('13310', 'equipment_budget', [38, 58], 0.12, '새 장비 예산은 하나만 승인됐다. 진료과마다 필요하다고 한다.', '어느 쪽을 올릴까?', [
        ['imaging', '영상 장비', 'relations-2 happiness+1 intellect+1', '대기 환자가 줄었다. 다른 과 부장이 한동안 서운해했다.'],
        ['ward', '병동 설비', 'relations+2 wealth-1 happiness+1', '병동 환경이 나아졌다. 영상과 대기는 그대로였다.'],
      ], 'ward', '장비 예산 배분'),
      ev('13310', 'accreditation', [38, 60], 0.1, '의료기관 인증 평가를 무사히 마쳤다. 서류 더미가 사라졌다.', 'happiness+3 relations+1 job-2', '인증 평가 통과', { once: true }),
      ev('13310', 'patient_complaint', [36, 60], 0.12, '대기 시간 항의가 접수돼 접수창구에서 한참 사과했다.', 'happiness-2 conflict+3', '환자 불만 응대', { dark: true }),
    ],
    hazard: 0, burnout: 0.06,
  }),
  X('13320', {
    entry: [
      E('promote', { from: ['25310', '42901'], minYears: 8, ages: [34, 55], p: 0.1, text: '사회복지사로 일하다 시설 관리자 자리를 맡았다.' }),
      E('hire', { minEdu: '4yr', majors: ['soc'], ages: [32, 52], p: 0.04, text: '복지관 관리자 공개 채용에 지원해 붙었다.' }),
    ],
    transitions: [
      tr('13310', [42, 58], 6, 0.03, '의료 행정 관리자로 이동'),
      tr('35290', [38, 52], 8, 0.03, '복지 담당 공무원 경력 채용'),
      tr('25310', [40, 58], 6, 0.03, '현장 사회복지사로 복귀'),
    ],
    events: [
      ev('13320', 'grant_deadline', [36, 58], 0.14, '위탁사업 평가와 보조금 정산 서류가 같은 주에 몰렸다.', 'health-2 leisure-3 job+2', '정산·평가 마감', { dark: true, cd: 3 }),
      ch('13320', 'volunteer_surge', [36, 58], 0.12, '연말에 기부와 자원봉사 신청이 한꺼번에 몰려 들어왔다.', '어떻게 받을까?', [
        ['all', '모두 받는다', 'relations+2 happiness+2 leisure-3', '현장은 북적였고 직원들은 지쳐 돌아갔다.'],
        ['limit', '인원을 제한', 'relations-1 happiness+1 leisure+1', '안전하게 운영했지만 돌려보낸 분들께 사과를 전했다.'],
      ], 'limit', '자원봉사 접수'),
      ev('13320', 'staff_turnover', [34, 58], 0.12, '낮은 처우로 숙련된 직원 두 명이 그만뒀다. 빈자리를 메워야 한다.', 'happiness-2 relations-1 care+3', '직원 이직', { dark: true }),
      ev('13320', 'thanks_letter', [34, 60], 0.1, '이용자 가족이 손으로 쓴 감사 편지를 직원 게시판에 붙였다.', 'happiness+3 relations+2 care-2', '감사 편지', { once: true }),
    ],
    hazard: 0, burnout: 0.07,
  }),
  X('12122', {
    entry: [
      E('promote', { from: ['31110', '28311'], minYears: 8, ages: [36, 52], p: 0.1, text: '기획 업무를 오래 맡아 기획팀장이 됐다.' }),
      E('hire', { minEdu: '4yr', majors: ['soc'], ages: [34, 48], p: 0.04, text: '경력 채용으로 기획 부서 관리자가 됐다.' }),
    ],
    transitions: [
      tr('11202', [48, 58], 12, 0.03, '임원으로 승진'),
      tr('28151', [45, 58], 10, 0.04, '컨설턴트로 독립'),
      tr('12123', [40, 52], 6, 0.03, '재무 관리자로 이동'),
    ],
    events: [
      ev('12122', 'plan_reversal', [36, 56], 0.14, '석 달 준비한 중장기 계획이 경영 회의에서 보류됐다.', 'happiness-3 intellect-1 job+3', '계획 보류', { dark: true }),
      ch('12122', 'ai_report', [36, 58], 0.1, '보고서 초안을 AI 도구가 몇 분 만에 써 준다는 말이 팀에서 나왔다.', '어떻게 쓸까?', [
        ['use', '적극 활용', 'leisure+2 intellect-1 relations-1 tech+2', '시간이 줄었지만 내용을 확인하는 일이 새로 생겼다.'],
        ['limit', '초안만 참고', 'leisure-1 intellect+1 relations+1', '손은 더 갔지만 팀원들이 판단 과정을 같이 익혔다.'],
      ], 'limit', '보고서 AI 활용', { years: [2022, 2060] }),
      ev('12122', 'plan_approved', [36, 58], 0.1, '신사업 계획이 통과돼 팀원들과 현장 일정을 짜기 시작했다.', 'happiness+3 relations+2 intellect+1', '기획안 승인', { once: true }),
      ev('12122', 'target_squeeze', [36, 58], 0.12, '내년 목표가 위에서 먼저 정해졌다. 근거 숫자를 맞춰야 한다.', 'happiness-2 leisure-2 conflict+2', '하향식 목표', { dark: true }),
    ],
    hazard: 0, burnout: 0.05,
  }),
  X('13402', {
    entry: [
      E('promote', { from: ['29541', '29549', '29519', '29551'], minYears: 8, ages: [34, 52], p: 0.1, text: '디자이너로 오래 일해 디자인팀 관리자가 됐다.' }),
      E('hire', { minEdu: '4yr', majors: ['art'], ages: [34, 50], p: 0.04, text: '디자인 총괄 경력직 공고에 붙었다.' }),
    ],
    transitions: [
      tr('29549', [40, 55], 6, 0.04, '현업 디자이너로 복귀'),
      tr('26111', [45, 60], 10, 0.02, '대학 강의를 맡아'),
      tr('28151', [45, 58], 10, 0.02, '브랜드 컨설턴트로 독립'),
    ],
    events: [
      ev('13402', 'feedback_round', [34, 56], 0.14, '시안 수정 요청이 열 번째 돌아왔다. 처음 안과 거의 같아졌다.', 'happiness-2 leisure-2 conflict+2', '수정 요청 반복', { dark: true, cd: 3 }),
      ch('13402', 'junior_portfolio', [34, 56], 0.12, '신입 디자이너의 포트폴리오가 눈에 띄게 좋았다. 예산은 한 명분이다.', '어떻게 할까?', [
        ['hire', '정규직 제안', 'wealth-1 happiness+2 relations+1', '인건비를 조정해 한 자리를 만들었다. 기존 팀원은 일이 늘었다.'],
        ['freelance', '프로젝트 계약', 'wealth+1 happiness-1 relations-1', '단기 계약으로 시작했다. 상대가 더 좋은 조건을 찾아 떠났다.'],
      ], 'hire', '신입 채용 판단'),
      ev('13402', 'award', [34, 58], 0.09, '팀이 만든 디자인이 업계 공모에서 입상했다.', 'happiness+3 relations+2 intellect+1', '디자인 입상', { once: true }),
      ev('13402', 'budget_cut', [34, 58], 0.1, '브랜드 개편 예산이 줄어 외주 작업을 팀 안에서 소화하게 됐다.', 'health-1 leisure-2 job+3', '예산 삭감', { dark: true }),
    ],
    hazard: 0, burnout: 0.06,
  }),
  X('15112', {
    entry: [
      E('promote', { from: ['51011', '51012', '51022', '31124'], minYears: 8, ages: [32, 50], p: 0.1, text: '영업 실적을 쌓아 판매 지점장이 됐다.' }),
      E('self', { minEdu: 'none', ages: [30, 55], p: 0.04, text: '대리점 계약을 맺어 판매점을 직접 열었다.' }),
    ],
    transitions: [
      tr('15111', [40, 55], 6, 0.04, '영업 총괄 관리자로 승진'),
      tr('52111', [42, 58], 8, 0.03, '독립해 가게를 인수'),
      tr('12129', [42, 55], 8, 0.02, '본사 지원 부서로 이동'),
    ],
    events: [
      ev('15112', 'quota_push', [32, 58], 0.14, '월말 판매 목표를 채우려 매장 직원들과 늦게까지 남았다.', 'health-2 relations-1 leisure-2 wealth+1', '월말 판매 목표', { dark: true }),
      ch('15112', 'stock_overhang', [32, 58], 0.12, '재고가 쌓였다. 본사는 할인 행사를 권하고 있다.', '어떻게 정리할까?', [
        ['sale', '할인 행사', 'wealth-2 happiness+1 relations+2', '재고는 줄었다. 단골은 즐거워했고 마진은 얇아졌다.'],
        ['hold', '물량 조정 요청', 'wealth-1 happiness-1 relations+1', '본사와 길게 협의해 일부 물량만 돌렸다.'],
      ], 'sale', '재고 처리'),
      ev('15112', 'top_store', [32, 58], 0.1, '분기 지점 평가에서 상위권에 올라 직원들과 회식을 했다.', 'happiness+3 relations+2 wealth+1', '지점 평가', { once: true }),
      ev('15112', 'customer_regular', [32, 60], 0.12, '오래된 단골이 지인을 여럿 데려와 매장이 오랜만에 북적였다.', 'happiness+2 relations+2 wealth+1', '단골 소개'),
    ],
    hazard: 0, burnout: 0.05,
  }),
  X('15121', {
    entry: [
      E('promote', { from: ['87233', '87232', '32211'], minYears: 8, ages: [36, 55], p: 0.08, text: '기사와 배차 업무를 거쳐 운송 관리자가 됐다.' }),
      E('self', { minEdu: 'none', ages: [34, 58], p: 0.04, text: '운송 사업 허가를 받아 소규모 운송사를 차렸다.' }),
    ],
    transitions: [
      tr('87233', [45, 60], 8, 0.04, '운전대를 다시 잡아'),
      tr('15111', [42, 56], 8, 0.03, '물류 영업 관리자로 이동'),
      tr('12124', [42, 56], 8, 0.02, '구매·자재 관리자로 이동'),
    ],
    events: [
      ev('15121', 'night_dispatch', [36, 60], 0.14, '새벽 배차 전화를 받고 나가 차량 사고 처리를 마칠 때까지 자리를 지켰다.', 'health-2 leisure-3 job+2', '새벽 배차 대응', { dark: true, cd: 3 }),
      ch('15121', 'fuel_rate', [36, 60], 0.12, '유류비가 올라 운임을 다시 협상해야 한다. 거래처는 난색이다.', '어떻게 협상할까?', [
        ['raise', '인상 요청', 'wealth+2 relations-2 happiness-1', '일부 거래처가 단가표를 다시 받아들였고 한 곳은 떠났다.'],
        ['hold', '당분간 유지', 'wealth-2 relations+2 happiness+1', '관계는 지켰다. 마진이 얇은 달이 이어졌다.'],
      ], 'raise', '운임 협상'),
      ev('15121', 'safety_award', [36, 60], 0.09, '무사고 운행 달성 기사들에게 상을 전하며 함께 식사했다.', 'happiness+3 relations+2', '무사고 표창', { once: true }),
      ev('15121', 'driver_shortage', [36, 60], 0.12, '기사 두 명이 그만두면서 남은 기사들의 운행 시간이 길어졌다.', 'happiness-2 relations-1 job+3', '기사 인력 부족', { dark: true }),
    ],
    hazard: 1, burnout: 0.06,
  }),
  X('14131', {
    entry: [
      E('promote', { from: ['71041', '81909', '23910'], minYears: 8, ages: [34, 52], p: 0.08, text: '식품 공장 현장과 품질 업무를 거쳐 생산 관리자가 됐다.' }),
      E('hire', { minEdu: '4yr', majors: ['eng', 'sci'], ages: [30, 48], p: 0.04, text: '식품공학 경력으로 생산팀장 채용에 붙었다.' }),
    ],
    transitions: [
      tr('28153', [42, 56], 8, 0.03, '품질 인증 심사로 이직'),
      tr('11201', [48, 60], 12, 0.02, '독립해 식품 회사를 차려'),
      tr('12124', [40, 54], 8, 0.03, '구매·자재 관리자로 이동'),
    ],
    events: [
      ev('14131', 'line_stop', [34, 58], 0.14, '라인이 새벽에 멈췄다. 납기 전에 복구해야 해 현장에서 밤을 보냈다.', 'health-2 leisure-3 job+2', '라인 정지 복구', { dark: true, cd: 3 }),
      ch('14131', 'recall_choice', [34, 58], 0.1, '원료 검수에서 의심 로트가 나왔다. 출하 일정은 이미 잡혀 있다.', '어떻게 처리할까?', [
        ['hold', '출하 보류', 'happiness+1 relations-2 wealth-2', '물량을 묶고 재검사했다. 영업팀의 항의를 한참 들었다.'],
        ['retest', '빠른 재검사', 'wealth-1 leisure-2 intellect+1', '밤새 시료를 다시 돌렸고, 결과는 기준 안이어서 출하했다.'],
      ], 'hold', '원료 로트 판단'),
      ev('14131', 'haccp_pass', [34, 58], 0.1, '위생 인증 심사를 무사히 통과해 현장 직원들과 박수를 쳤다.', 'happiness+3 relations+2 job-2', '인증 심사 통과', { once: true }),
      ev('14131', 'night_shift_cycle', [34, 58], 0.12, '야간 교대 비중이 높아져 현장 직원들의 컨디션을 살피느라 바빴다.', 'health-2 happiness-1 job+2', '교대 관리 부담', { dark: true }),
    ],
    hazard: 1, burnout: 0.05,
  }),
];
