import { X, E, tr, ev, ch } from '../jobs-kit.js';
export default [
  X('24911', {
    entry: [E('exam', { minEdu: 'high', ages: [20, 32], p: 0.08, years: 2, era: [1983, null], text: '소방공무원 시험에 합격해 구조대에 배치됐다.' })],
    transitions: [tr('23631', [40, 55], 10, 0.03, '안전 관리직으로'), tr('24912', [28, 45], 4, 0.03, '구급 업무로'), tr('35290', [38, 55], 8, 0.02, '행정직으로')],
    events: [
      ev('24911', 'night_call', [22, 55], 0.15, '새벽 출동이 연달아 이어져 눈을 붙이지 못했다.', 'health-3 leisure-2 happiness-1', '연속 출동', { dark: true }),
      ev('24911', 'rescue_thanks', [22, 58], 0.1, '구조한 가족이 센터에 찾아와 손을 잡고 인사했다.', 'happiness+4 relations+2', '구조 후 감사 인사'),
      ch('24911', 'after_scene', [24, 52], 0.1, '힘든 현장을 다녀온 뒤 상담 프로그램을 권유받았다.', '어떻게 할까?', [['talk', '상담을 받는다', 'happiness+2 leisure-1 relations+1 health+1', '몇 번 상담을 받았다. 마음의 짐이 조금 가벼워졌다.'], ['pass', '쉬면서 넘긴다', 'leisure+1 happiness-2 health-1 relations+1', '동료들과 식사하며 넘겼다. 며칠은 잠이 얕았다.']], 'talk', '현장 후 심리 지원', { once: true, years: [2005, 2100] }),
      ev('24911', 'training_sprain', [22, 50], 0.1, '훈련 중 발목을 다쳐 한 달 동안 내근을 했다.', 'health-2 leisure-1 medical+2', '훈련 중 부상', { dark: true }),
    ],
    hazard: 3, burnout: 0.06,
  }),
  X('24610', {
    entry: [E('license', { license: 'med', minEdu: '2yr', majors: ['med'], ages: [21, 35], p: 0.8, years: 0, text: '임상병리사 국가시험에 합격했다.' })],
    transitions: [tr('21312', [28, 45], 4, 0.03, '연구 시험원으로'), tr('24620', [24, 40], 2, 0.02, '영상 분야로'), tr('25310', [35, 52], 8, 0.01, '복지 분야로')],
    events: [
      ev('24610', 'draw_rush', [21, 58], 0.14, '아침 채혈 대기가 길어 점심 없이 오전을 보냈다.', 'health-1 leisure-2 happiness-1', '채혈 대기 폭주', { dark: true }),
      ev('24610', 'finding_caught', [24, 58], 0.1, '검체에서 이상 소견을 먼저 발견해 의사에게 알렸다.', 'happiness+3 intellect+1 job-1', '이상 소견 발견'),
      ch('24610', 'auto_analyzer', [26, 52], 0.1, '새 자동 분석 장비가 들어와 수기 검사가 줄었다.', '어떻게 할까?', [['learn', '장비 관리를 맡는다', 'intellect+2 leisure-2 tech-1 job-1', '장비 교육을 듣고 담당이 됐다. 검사실이 한결 빨라졌다.'], ['old', '수기 검사를 이어 간다', 'leisure+1 intellect-1 job+2 happiness-1', '남은 수기 검사를 맡았다. 담당 업무가 조금씩 줄었다.']], 'learn', '검사 장비 자동화', { once: true }),
      ev('24610', 'infection_scare', [22, 55], 0.08, '감염 의심 검체를 다루게 돼 보호구를 두 겹 착용했다.', 'health-1 happiness-2 medical+1', '감염 검체 취급', { dark: true, cd: 5 }),
    ],
    hazard: 1, burnout: 0.06,
  }),
  X('24620', {
    entry: [E('license', { license: 'med', minEdu: '2yr', majors: ['med'], ages: [21, 35], p: 0.8, years: 0, text: '방사선사 면허를 따고 영상의학과에 입사했다.' })],
    transitions: [tr('24610', [24, 40], 2, 0.02, '검사 분야로'), tr('23433', [28, 45], 4, 0.02, '의료기기 업체로'), tr('24118', [28, 45], 3, 0.01, '영상 판독 관련으로')],
    events: [
      ev('24620', 'xray_rush', [21, 58], 0.14, '응급실 영상 요청이 몰려 한 시간 넘게 쉬지 못했다.', 'health-1 leisure-2', '촬영 폭주', { dark: true }),
      ev('24620', 'clear_image', [24, 58], 0.1, '어려운 자세의 환자를 편하게 안내해 촬영을 마쳤다.', 'happiness+3 relations+1', '촬영 성공'),
      ch('24620', 'dose_note', [24, 55], 0.1, '선량 기록과 장비 점검 일정이 겹쳤다.', '어떻게 할까?', [['check', '점검부터 한다', 'intellect+1 leisure-1 happiness+1 relations-1', '점검을 끝내고 환자를 받았다. 대기실이 잠시 붐볐다.'], ['patient', '환자를 먼저 받는다', 'relations+2 happiness-1 leisure-1 tech+1', '환자를 받고 점검은 퇴근 뒤에 했다.']], 'check', '점검 일정 조율', { once: true }),
      ev('24620', 'mri_overnight', [25, 55], 0.09, '야간 응급 영상 호출이 주 두 번 이어졌다.', 'health-2 leisure-2 wealth+1', '야간 호출', { dark: true, cd: 5 }),
    ],
    hazard: 1, burnout: 0.06,
  }),
  X('24640', {
    entry: [E('license', { license: 'med', minEdu: '2yr', majors: ['med'], ages: [20, 32], p: 0.8, years: 0, text: '치과위생사 면허를 따고 치과에 취업했다.' })],
    transitions: [tr('24142', [25, 40], 6, 0.01, '치과 분야 학업으로'), tr('25310', [32, 50], 6, 0.01, '복지 분야로'), tr('24630', [26, 45], 4, 0.02, '치과기공 업무로')],
    events: [
      ev('24640', 'scaling_day', [20, 55], 0.14, '스케일링 예약이 하루 서른 건 이어져 손목이 뻐근했다.', 'health-2 leisure-1', '스케일링 폭주', { dark: true }),
      ev('24640', 'regular_patient', [21, 58], 0.11, '단골 환자가 정기 검진을 내가 있는 날로 잡았다.', 'happiness+3 relations+2', '단골 환자'),
      ch('24640', 'move_clinic', [23, 45], 0.1, '다른 치과에서 월급을 더 주겠다는 연락이 왔다.', '어떻게 할까?', [['move', '옮긴다', 'wealth+3 relations-2 happiness+1 leisure-1', '새 치과로 옮겼다. 환자와 인사하는 일이 줄었다.'], ['stay', '남는다', 'relations+2 wealth-1 happiness+1', '남기로 했다. 원장님과 환자 모두 반겼다.']], 'stay', '이직 제안', { cd: 5 }),
      ev('24640', 'staff_leave', [22, 50], 0.09, '직원이 한꺼번에 줄어 혼자 두 몫을 감당했다.', 'leisure-2 happiness-2 conflict+2', '인력 공백', { dark: true, cd: 5 }),
    ],
    hazard: 1, burnout: 0.07,
  }),
  X('24630', {
    entry: [E('license', { license: 'med', minEdu: '2yr', majors: ['med'], ages: [20, 35], p: 0.8, years: 0, text: '치과기공사 면허로 기공소에 들어갔다.' })],
    transitions: [tr('24640', [24, 40], 3, 0.02, '치과위생사 업무로'), tr('23433', [28, 45], 4, 0.01, '의료기기 업체로'), tr('29431', [28, 45], 5, 0.01, '공예 분야로')],
    events: [
      ev('24630', 'order_pile', [20, 58], 0.14, '여러 치과에서 주문이 몰려 야간까지 보철물을 만들었다.', 'health-2 leisure-3', '보철 주문 폭주', { dark: true }),
      ev('24630', 'fine_fit', [22, 60], 0.1, '내가 만든 보철물이 한 번에 딱 맞았다는 연락이 왔다.', 'happiness+3 relations+1', '정밀 보철 성공'),
      ch('24630', 'cad_machine', [28, 55], 0.1, '디지털 장비를 들이면 손작업이 줄어든다.', '어떻게 할까?', [['buy', '장비를 들인다', 'intellect+1 wealth-3 tech-2 leisure+1', '장비 값을 대출로 해결했다. 작업은 빨라졌다.'], ['hand', '손작업을 고집한다', 'happiness+1 wealth+1 job+3 leisure-1', '손맛을 아는 곳과 거래를 이어 갔다. 단가 경쟁은 힘들었다.']], 'buy', '디지털 장비 도입', { once: true, years: [2010, 2100], who: 'self' }),
      ev('24630', 'dust_cough', [30, 62], 0.09, '분진을 오래 마셔 기침이 이어져 환기 설비를 바꿨다.', 'health-2 wealth-1 medical+1', '분진 노출', { dark: true, cd: 5 }),
    ],
    hazard: 1, burnout: 0.05,
  }),
  X('24930', {
    entry: [E('license', { license: 'med', minEdu: '2yr', majors: ['med'], ages: [20, 35], p: 0.8, years: 0, text: '안경사 면허를 따서 안경점에 들어갔다.' })],
    transitions: [tr('45110', [28, 50], 3, 0.02, '다른 매장 업무로'), tr('28436', [30, 50], 4, 0.02, '렌즈 영업으로')],
    events: [
      ev('24930', 'sight_test', [20, 58], 0.12, '아이 손님이 시력 검사 뒤 처음 또렷하게 보인다고 웃었다.', 'happiness+3 relations+1', '첫 안경'),
      ev('24930', 'online_price', [24, 60], 0.12, '인터넷 최저가와 비교하며 가격을 깎아 달라는 손님이 늘었다.', 'wealth-1 happiness-2 conflict+1', '가격 비교 압박', { dark: true }),
      ch('24930', 'open_shop', [28, 52], 0.1, '직접 안경원을 열 자리를 알아보게 됐다.', '어떻게 할까?', [['open', '개업한다', 'wealth-3 happiness+1 leisure-2 debt+3500', '보증금과 장비값 대출을 받아 개업했다.'], ['stay', '월급 안경사로 남는다', 'wealth+1 leisure+1 happiness-1', '급여를 받으며 일을 이어 갔다.']], 'stay', '안경원 개업', { once: true, who: 'wage' }),
      ev('24930', 'lease_rise', [30, 62], 0.09, '상가 임대료가 올라 안경원 운영이 빠듯해졌다.', 'wealth-3 happiness-2 housing+1', '임대료 인상', { dark: true, who: 'self', cd: 5 }),
    ],
    hazard: 0, burnout: 0.04,
  }),
  X('24662', {
    entry: [E('license', { license: 'med', minEdu: '2yr', majors: ['med'], ages: [21, 35], p: 0.8, years: 0, era: [1990, null], text: '작업치료사 면허를 따서 재활병원에 취업했다.' })],
    transitions: [tr('24661', [26, 45], 3, 0.02, '물리치료 분야로'), tr('25310', [32, 52], 6, 0.02, '복지 분야로'), tr('24681', [28, 45], 4, 0.02, '언어 재활 분야로')],
    events: [
      ev('24662', 'hand_recover', [22, 58], 0.12, '뇌졸중 환자가 처음으로 젓가락질에 성공했다.', 'happiness+4 relations+1', '재활 성공'),
      ev('24662', 'session_stack', [22, 55], 0.14, '치료 예약이 빼곡해 점심시간까지 환자와 보냈다.', 'health-2 leisure-2', '치료 일정 과밀', { dark: true }),
      ch('24662', 'home_visit', [26, 55], 0.1, '퇴원 환자 집에 방문 재활을 나가 달라는 요청이 왔다.', '어떻게 할까?', [['visit', '방문을 맡는다', 'relations+2 happiness+2 leisure-2 wealth-1', '집 구조를 보고 생활 훈련을 도왔다. 이동 시간이 늘었다.'], ['clinic', '병원 치료에 집중한다', 'leisure+1 happiness-1 relations-1 wealth+1', '병원에서만 만나기로 했다. 퇴원 후 소식이 궁금했다.']], 'clinic', '방문 재활 요청', { once: true }),
      ev('24662', 'insurance_limit', [28, 60], 0.09, '치료 횟수 기준이 줄어 환자에게 설명하기가 어려웠다.', 'happiness-3 conflict+2', '치료 횟수 제한', { dark: true, cd: 5 }),
    ],
    hazard: 1, burnout: 0.07,
  }),
  X('24401', {
    entry: [
      E('license', { license: 'nurse', minEdu: '4yr', majors: ['med'], ages: [28, 50], p: 0.4, years: 2, era: [2003, null], text: '전문간호사 과정을 마치고 자격을 받았다.' }),
      E('promote', { from: ['24402'], minYears: 5, ages: [28, 52], p: 0.08, era: [2003, null], text: '병동 경력을 인정받아 전문 분야 담당이 됐다.' }),
    ],
    transitions: [tr('24403', [32, 55], 5, 0.02, '보건교사로'), tr('25310', [38, 58], 6, 0.01, '복지 분야로'), tr('13502', [40, 58], 8, 0.01, '간호 관리자로')],
    events: [
      ev('24401', 'rounding_expert', [30, 58], 0.12, '내가 담당한 분야의 상담 요청이 병동마다 이어졌다.', 'happiness+2 relations+1 intellect+1', '전문 상담 요청'),
      ev('24401', 'scope_blur', [30, 58], 0.12, '업무 범위가 애매해 의사와 간호사 사이에서 곤란했다.', 'happiness-3 conflict+3', '업무 범위 모호', { dark: true }),
      ch('24401', 'thesis_choice', [30, 52], 0.1, '대학원 박사 과정에 들어갈 기회가 왔다.', '어떻게 할까?', [['study', '박사 과정에 들어간다', 'intellect+3 wealth-3 leisure-3 job-1', '병원 일과 학업을 함께 했다. 몇 년 뒤의 길이 열렸다.'], ['work', '현장을 지킨다', 'wealth+1 leisure+1 intellect-1 happiness+1', '임상에 남기로 했다. 후배 교육 일이 늘었다.']], 'work', '대학원 진학', { once: true }),
      ev('24401', 'long_shift', [30, 58], 0.09, '인력이 비어 전문 업무에 일반 근무까지 겹쳤다.', 'health-2 leisure-2 happiness-1', '인력 부족 근무', { dark: true, cd: 5 }),
    ],
    hazard: 1, burnout: 0.08,
  }),
  X('24111', {
    entry: [E('license', { license: 'med', minEdu: '4yr', majors: ['med'], ages: [28, 40], p: 0.7, years: 4, text: '내과 전공의 과정을 마치고 전문의 자격을 땄다.' })],
    transitions: [tr('21112', [35, 55], 6, 0.02, '연구직으로'), tr('13310', [45, 60], 10, 0.02, '병원 관리자로'), tr('24115', [32, 48], 4, 0.01, '정신건강 분야로')],
    events: [
      ev('24111', 'ward_round', [28, 60], 0.14, '입원 환자가 늘어 주말에도 회진을 돌았다.', 'health-2 leisure-3 happiness-1', '입원 환자 증가', { dark: true }),
      ev('24111', 'chronic_trust', [30, 65], 0.11, '오래 보던 환자가 혈당이 안정됐다며 인사를 건넸다.', 'happiness+3 relations+2', '만성질환 관리 보람'),
      ch('24111', 'open_internal', [35, 55], 0.1, '개원하자는 제안과 병원에 남으라는 권유가 함께 왔다.', '어떻게 할까?', [['open', '개원한다', 'wealth+1 leisure-2 happiness+1 debt+5000', '의원을 열고 간호 인력을 뽑았다. 환자가 늘기까지 몇 달 걸렸다.'], ['stay', '병원에 남는다', 'leisure+1 wealth+1 relations+1 happiness-1', '월급 의사로 남기로 했다. 진료 환경은 그대로였다.']], 'stay', '개원 여부', { once: true, who: 'wage' }),
      ev('24111', 'complaint_letter', [30, 65], 0.08, '환자 가족이 설명이 부족했다며 민원을 넣어 조사가 이어졌다.', 'happiness-3 conflict+3', '환자 민원', { dark: true, cd: 5 }),
    ],
    hazard: 1, burnout: 0.08,
  }),
  X('24132', {
    entry: [E('license', { license: 'med', minEdu: '4yr', majors: ['med'], ages: [24, 38], p: 0.7, years: 1, text: '한의대를 졸업하고 한의사 국가시험에 합격했다.' })],
    transitions: [tr('24131', [30, 50], 4, 0.02, '전문 분야 진료로'), tr('21118', [32, 52], 5, 0.01, '연구직으로'), tr('24320', [30, 55], 5, 0.01, '약재 관련 업무로')],
    events: [
      ev('24132', 'regular_patient', [26, 70], 0.12, '허리 치료를 받던 환자가 가족을 데려왔다.', 'happiness+3 relations+2', '단골 환자'),
      ev('24132', 'slow_month', [28, 65], 0.12, '한의원 환자가 줄어 월 매출이 크게 떨어졌다.', 'wealth-3 happiness-2', '매출 감소', { dark: true, who: 'self' }),
      ch('24132', 'herb_stock', [28, 60], 0.1, '약재 가격이 올라 처방 단가를 조정해야 한다.', '어떻게 할까?', [['raise', '처방 비용을 올린다', 'wealth+2 relations-2 happiness-1', '비용을 올리고 설명했다. 단골 몇이 발길을 줄였다.'], ['hold', '단가를 유지한다', 'relations+2 wealth-2 happiness+1', '단가를 그대로 두었다. 마진이 줄었다.']], 'hold', '약재 가격 대응', { once: true, who: 'self' }),
      ev('24132', 'new_machine', [30, 60], 0.09, '근처 한의원이 늘어 장비와 홍보 경쟁이 심해졌다.', 'happiness-2 wealth-1 conflict+1', '한의원 경쟁', { dark: true, cd: 5 }),
    ],
    hazard: 0, burnout: 0.05,
  }),
  X('24201', {
    entry: [E('license', { license: 'med', minEdu: '4yr', majors: ['med'], ages: [24, 38], p: 0.7, years: 1, text: '수의대를 졸업하고 수의사 면허를 얻어 동물병원에 취직했다.' })],
    transitions: [tr('21118', [30, 52], 5, 0.02, '연구직으로'), tr('24209', [28, 55], 4, 0.02, '다른 수의 분야로'), tr('35290', [30, 50], 4, 0.01, '방역 공무원으로')],
    events: [
      ev('24201', 'old_pet', [26, 65], 0.12, '십오 년을 함께한 반려견을 보호자가 안고 마지막 인사를 했다.', 'happiness-2 relations+1', '노령 반려동물 진료', { dark: true }),
      ev('24201', 'rescue_cat', [25, 65], 0.1, '길에서 다친 고양이를 치료해 새 보호자를 찾아 주었다.', 'happiness+4 relations+1', '구조 동물 치료'),
      ch('24201', 'late_emergency', [26, 55], 0.12, '야간 응급 진료를 열어 두자는 이야기가 나왔다.', '어떻게 할까?', [['open', '야간 진료를 연다', 'wealth+3 leisure-3 health-2 relations+1', '야간 수입이 늘었다. 몸이 먼저 피곤을 알렸다.'], ['close', '낮 진료만 한다', 'leisure+2 health+1 wealth-1 relations-1', '낮 진료만 하기로 했다. 야간 보호자들에게 미안했다.']], 'close', '야간 진료 여부', { once: true }),
      ev('24201', 'vet_cost', [28, 65], 0.09, '진료비가 비싸다는 항의를 받아 설명하는 데 시간을 썼다.', 'happiness-2 conflict+2', '진료비 항의', { dark: true, cd: 5 }),
    ],
    hazard: 1, burnout: 0.07,
  }),
  X('24502', {
    entry: [E('license', { license: 'med', minEdu: '4yr', majors: ['med'], ages: [22, 36], p: 0.75, years: 0, text: '영양사 면허를 따서 급식 기관에 취업했다.' })],
    transitions: [tr('24501', [26, 45], 3, 0.03, '임상 영양사로'), tr('24503', [28, 45], 3, 0.02, '영양교사로'), tr('13310', [38, 55], 8, 0.02, '급식 관리자로')],
    events: [
      ev('24502', 'menu_complaint', [23, 58], 0.14, '식단 민원이 한꺼번에 들어와 식단표를 다시 짰다.', 'happiness-2 conflict+2', '식단 민원', { dark: true }),
      ev('24502', 'clean_plate', [23, 60], 0.11, '새 식단이 잔반을 줄였다는 보고를 받았다.', 'happiness+3 relations+1', '잔반 감소'),
      ch('24502', 'price_squeeze', [26, 55], 0.1, '식재료 값이 올라 단가 안에서 식단을 짜기가 어렵다.', '어떻게 할까?', [['quality', '품질을 지켜 양을 줄인다', 'happiness+1 relations-2 conflict+1', '재료는 지켰지만 양이 줄어 불만이 나왔다.'], ['cost', '대체 식재료로 맞춘다', 'relations+1 happiness-2 intellect+1', '단가는 맞췄지만 마음이 찜찜했다.']], 'quality', '식재료 값 인상', { once: true }),
      ev('24502', 'kitchen_early', [22, 58], 0.1, '새벽 배식 준비로 첫차를 타고 주방에 나갔다.', 'health-1 leisure-2', '이른 조리 준비', { cd: 5 }),
    ],
    hazard: 1, burnout: 0.05,
  }),
  X('24960', {
    entry: [E('license', { license: 'care', minEdu: 'none', ages: [20, 55], p: 0.7, years: 0, text: '안마사 자격을 받아 안마원에서 일을 시작했다.' })],
    transitions: [tr('24661', [30, 50], 6, 0.01, '재활 분야로'), tr('25310', [35, 55], 8, 0.01, '복지 분야로'), tr('29640', [28, 50], 5, 0.01, '운동 지도로')],
    events: [
      ev('24960', 'regular_hand', [22, 70], 0.13, '단골 손님이 한 달에 한 번씩 꼭 찾아와 안부를 나눴다.', 'happiness+3 relations+2', '단골 손님'),
      ev('24960', 'wrist_pain', [28, 70], 0.12, '손목과 어깨 통증이 심해져 며칠 예약을 줄였다.', 'health-3 wealth-1', '손목 통증', { dark: true }),
      ch('24960', 'hotel_shop', [28, 60], 0.1, '큰 숙박 시설 안마실 입점 제안이 왔다. 수수료가 높다.', '어떻게 할까?', [['take', '입점한다', 'wealth+2 leisure-1 relations-1 job-1', '손님이 늘었지만 수수료로 남는 몫이 줄었다.'], ['home', '기존 가게를 유지한다', 'wealth-1 relations+2 leisure+1', '단골 위주로 이어 갔다. 새 손님은 많지 않았다.']], 'home', '입점 제안', { once: true, who: 'self' }),
      ev('24960', 'cheap_massage', [26, 70], 0.09, '저가 마사지 업소가 늘어 손님이 줄었다.', 'wealth-2 happiness-2 job+3', '저가 업소 경쟁', { dark: true, cd: 5 }),
    ],
    hazard: 0, burnout: 0.05,
  }),
  X('24920', {
    entry: [E('license', { license: 'med', minEdu: '2yr', majors: ['med'], ages: [21, 35], p: 0.75, years: 0, text: '위생사 면허를 따서 방역·위생 업체에 취업했다.' })],
    transitions: [tr('23642', [28, 50], 4, 0.02, '산업환경 관리로'), tr('23631', [30, 55], 5, 0.02, '산업안전 관리로'), tr('35290', [28, 45], 3, 0.02, '위생 공무원으로')],
    events: [
      ev('24920', 'summer_pest', [22, 58], 0.14, '여름철 방역 요청이 몰려 하루 여섯 곳을 돌았다.', 'health-2 leisure-2 wealth+1', '여름 방역 성수기'),
      ev('24920', 'chemical_smell', [22, 58], 0.1, '밀폐 공간 소독 뒤 두통이 있어 환기 기준을 다시 확인했다.', 'health-2 happiness-1 medical+1', '약품 노출', { dark: true }),
      ch('24920', 'client_cost', [26, 55], 0.1, '고객이 비용을 줄이려 소독 횟수를 줄이자고 한다.', '어떻게 할까?', [['rule', '기준 횟수를 설명한다', 'happiness+1 conflict+2 relations-1', '기준을 설명했지만 고객 표정이 굳었다.'], ['accept', '고객 뜻대로 줄인다', 'relations+1 happiness-2 wealth-1', '횟수를 줄여 계약을 지켰다. 나중 점검이 걱정이었다.']], 'rule', '소독 횟수 조정', { once: true }),
      ev('24920', 'inspection_pass', [24, 60], 0.09, '위생 점검을 우수하게 마쳐 업체에서 칭찬을 받았다.', 'happiness+3 job-1', '위생 점검 우수', { cd: 5 }),
    ],
    hazard: 1, burnout: 0.04,
  }),
  X('24112', {
    entry: [E('license', { license: 'med', minEdu: '4yr', majors: ['med'], ages: [29, 40], p: 0.7, years: 4, text: '외과 전공의 과정을 마치고 전문의가 됐다.' })],
    transitions: [tr('13310', [45, 60], 10, 0.02, '병원 관리자로'), tr('21112', [35, 55], 6, 0.01, '연구직으로'), tr('24117', [32, 48], 4, 0.01, '다른 진료과로')],
    events: [
      ev('24112', 'long_surgery', [29, 60], 0.13, '열 시간 넘게 이어진 수술을 마치고 식당 구석에서 눈을 붙였다.', 'health-3 leisure-2 happiness+1', '장시간 수술', { dark: true }),
      ev('24112', 'good_recovery', [30, 65], 0.1, '큰 수술을 받은 환자가 걸어서 퇴원했다.', 'happiness+4 relations+1', '환자 회복'),
      ch('24112', 'on_call_roster', [30, 55], 0.11, '당직 일정이 한쪽에 몰려 조정이 필요하다.', '어떻게 할까?', [['take', '당직을 더 맡는다', 'wealth+2 leisure-3 health-1 relations+1', '동료의 부담을 덜었다. 내 주말은 줄었다.'], ['share', '공평하게 나누자고 한다', 'leisure+2 relations-2 happiness+1', '당직 표가 바뀌었다. 팀 분위기가 한동안 서먹했다.']], 'share', '당직 일정 조정', { once: true }),
      ev('24112', 'suit_notice', [32, 65], 0.07, '수술 경과에 이의를 제기하는 통지가 와 서류를 준비했다.', 'happiness-3 conflict+3', '의료 분쟁 통지', { dark: true, cd: 6 }),
    ],
    hazard: 1, burnout: 0.09,
  }),
];
