import { X, E, tr, ev, ch } from '../jobs-kit.js';
export default [
  X('26219', {
    entry: [
      E('exam', { license: 'teach', minEdu: '4yr', majors: ['edu', 'hum', 'sci'], ages: [23, 38], p: 0.25, years: 2, text: '교직 이수 뒤 임용시험을 거쳐 중·고등학교 교단에 섰다.' }),
      E('hire', { license: 'teach', minEdu: '4yr', ages: [23, 45], p: 0.12, text: '사립학교 공개 채용에 합격해 교사가 됐다.' }),
    ],
    transitions: [tr('26911', [40, 58], 12, 0.03, '장학사로 이동'), tr('13122', [50, 60], 20, 0.04, '교감으로 승진'), tr('26429', [30, 55], 5, 0.02, '학원 강사로 이동')],
    events: [
      ch('26219', 'club_advisor', [24, 55], 0.12, '동아리 지도교사를 맡아 달라는 부탁이 왔다.', '어떻게 할까?', [
        ['take', '맡는다', 'happiness+2 leisure-2 relations+1', '주말 대회까지 따라다녔다. 아이들 표정이 밝아졌다.'],
        ['pass', '사양한다', 'leisure+1 happiness-1 relations-1', '수업 준비에 집중했다. 서운해하는 눈치였다.'],
      ], 'pass', '방과 후 활동 부담'),
      ev('26219', 'violence_case', [25, 58], 0.1, '학교폭력 사안 조사를 맡았다. 양쪽 학부모 사이에서 몇 주가 갔다.', 'health-2 happiness-2 conflict+3', '사안 처리의 부담', { dark: true }),
      ev('26219', 'graduate_visit', [28, 62], 0.12, '졸업생이 찾아와 그때 해 준 말이 힘이 됐다고 했다.', 'happiness+3 relations+1', '제자의 방문'),
      ev('26219', 'grading_night', [24, 60], 0.14, '서술형 채점이 쌓였다. 이의 신청까지 받느라 밤이 길었다.', 'health-1 leisure-2 conflict+1', '채점과 이의 신청', ),
    ],
    hazard: 0, burnout: 0.05,
  }),
  X('25340', {
    entry: [E('license', { license: 'social', minEdu: '2yr', majors: ['soc', 'edu'], ages: [22, 45], p: 0.6, years: 0, era: [1992, null], text: '청소년 지도사 자격을 따서 청소년 시설에 채용됐다.' })],
    transitions: [tr('25310', [28, 50], 4, 0.03, '사회복지 기관으로'), tr('25330', [30, 52], 5, 0.03, '상담 전문가로'), tr('35290', [28, 45], 4, 0.02, '복지직 공무원으로')],
    events: [
      ev('25340', 'night_outreach', [22, 55], 0.12, '밤거리 아웃리치에서 한 아이가 처음으로 자기 이름을 말해 주었다.', 'happiness+2 relations+1 health-1', '거리 청소년과의 만남'),
      ev('25340', 'budget_cut', [24, 58], 0.1, '수탁 사업 예산이 깎여 프로그램 몇 개가 접혔다.', 'happiness-2 job+3 care+2', '예산 삭감', { dark: true }),
      ch('25340', 'camp_lead', [23, 52], 0.12, '이틀 밤짜리 수련 캠프 인솔을 맡았다.', '야간 순찰은 어떻게 할까?', [
        ['stay', '밤새 곁에 있는다', 'health-2 relations+2 happiness+1', '잠은 모자랐지만 아이들과 가까워졌다.'],
        ['rotate', '교대로 쉰다', 'health+1 relations-1', '교대로 나눠 쉬었다. 아이들과는 거리가 조금 남았다.'],
      ], 'rotate', '캠프 운영 방식'),
      ev('25340', 'parent_trust', [26, 60], 0.1, '학부모 설명회에서 아이가 달라졌다는 말을 들었다.', 'happiness+3 relations+1', '학부모의 인정'),
      ev('25340', 'case_overload', [25, 58], 0.1, '위기 청소년 사례가 한꺼번에 들어와 퇴근이 늦어졌다.', 'health-2 happiness-1 care+2', '사례 과중', { dark: true }),
    ],
    hazard: 0, burnout: 0.07,
  }),
  X('25391', {
    entry: [E('hire', { minEdu: '4yr', majors: ['soc'], ages: [22, 55], p: 0.5, text: '복지시설 구인 공고를 보고 생활지도원으로 입사했다.' })],
    transitions: [tr('25310', [26, 50], 3, 0.04, '사회복지사로 이동'), tr('42113', [30, 55], 3, 0.03, '요양 현장으로'), tr('25330', [32, 55], 5, 0.02, '상담 쪽으로')],
    events: [
      ev('25391', 'night_shift', [22, 60], 0.14, '야간 근무 이틀째다. 새벽에 이용자 한 분이 잠을 못 이뤄 곁을 지켰다.', 'health-2 relations+1 leisure-1', '야간 돌봄 교대', { dark: true }),
      ev('25391', 'birthday_party', [22, 62], 0.12, '이용자 생일 잔치를 준비했다. 서툰 노래에 모두 웃었다.', 'happiness+3 relations+2', '시설의 작은 행사'),
      ch('25391', 'overtime_pay', [24, 58], 0.1, '인력이 모자라 연장 근무를 해 달라는 요청이 왔다.', '어떻게 할까?', [
        ['work', '남아서 한다', 'wealth+2 health-2 leisure-2', '수당은 늘었지만 몸이 무거웠다.'],
        ['decline', '정시에 퇴근한다', 'health+1 relations-1 leisure+1', '동료들이 대신 남았다. 마음이 편치는 않았다.'],
      ], 'decline', '인력 부족과 연장 근무'),
      ev('25391', 'evaluation', [26, 58], 0.1, '시설 평가 시즌이다. 서류 정리에 돌봄 시간이 줄었다.', 'happiness-1 job+2 care+2', '평가 서류 부담', ),
    ],
    hazard: 1, burnout: 0.08,
  }),
  X('25330', {
    entry: [E('degree', { minEdu: '4yr', majors: ['soc', 'hum'], ages: [25, 55], p: 0.4, era: [1990, null], text: '상담 관련 학위와 수련을 마치고 상담소에 자리를 잡았다.' }), E('self', { minEdu: '4yr', ages: [32, 60], p: 0.15, text: '경력을 쌓은 뒤 작은 상담실을 열었다.' })],
    transitions: [tr('25310', [28, 52], 4, 0.03, '복지 기관으로'), tr('26113', [40, 62], 10, 0.02, '대학 강단으로'), tr('25322', [28, 55], 3, 0.03, '직업상담으로')],
    events: [
      ev('25330', 'long_case', [26, 65], 0.12, '오래 만나던 내담자가 한 해를 돌아보며 달라진 점을 말했다.', 'happiness+3 intellect+1', '상담 성과'),
      ev('25330', 'empty_slots', [28, 62], 0.12, '예약이 빈 시간대가 늘어 월 수입이 줄었다.', 'wealth-2 happiness-1 job+2', '예약 감소', { dark: true, who: 'self' }),
      ch('25330', 'supervision', [28, 60], 0.12, '수퍼비전 비용이 부담된다. 이번 분기는 쉬어도 된다고 한다.', '어떻게 할까?', [
        ['attend', '계속 받는다', 'intellect+2 wealth-2 leisure-1', '비용은 들었지만 사례 보는 눈이 넓어졌다.'],
        ['skip', '이번엔 쉰다', 'wealth+1 intellect-1 happiness-1', '비용을 아꼈다. 혼자 고민하는 밤이 늘었다.'],
      ], 'attend', '수련 비용과 성장'),
      ev('25330', 'heavy_stories', [26, 62], 0.1, '무거운 이야기를 연달아 들은 주였다. 퇴근 후에도 잊히지 않았다.', 'health-1 happiness-2 relations-1', '감정 소진', { dark: true }),
    ],
    hazard: 0, burnout: 0.08,
  }),
  X('26239', {
    entry: [E('exam', { license: 'teach', minEdu: '4yr', majors: ['edu'], ages: [23, 38], p: 0.2, years: 2, text: '특수교육 자격을 갖추고 임용시험에 합격했다.' })],
    transitions: [tr('26911', [42, 58], 12, 0.03, '장학사로 이동'), tr('26211', [28, 50], 4, 0.03, '일반학급 교사로'), tr('25330', [32, 55], 6, 0.02, '상담 전문가로')],
    events: [
      ev('26239', 'first_word', [24, 60], 0.12, '말이 느린 아이가 처음으로 내 이름을 불렀다.', 'happiness+4 relations+1', '아이의 작은 변화'),
      ev('26239', 'iep_paperwork', [24, 58], 0.14, '개별화 교육 계획서가 학생 수만큼 쌓였다. 수업 준비 시간이 줄었다.', 'health-1 leisure-2 job+2', '서류 부담', { dark: true }),
      ch('26239', 'inclusion_request', [26, 58], 0.1, '일반학급 통합 수업을 늘려 달라는 보호자 요청이 왔다.', '어떻게 답할까?', [
        ['expand', '시도해 본다', 'happiness+1 relations+1 health-2', '일반학급 교사와 협의를 거듭했다. 아이가 반 친구를 사귀었다.'],
        ['slow', '천천히 늘린다', 'health+1 relations-1 happiness-1', '보호자 마음이 조금 급했다. 아이 속도에 맞췄다.'],
      ], 'slow', '통합교육 요청'),
      ev('26239', 'aide_shortage', [25, 60], 0.1, '보조 인력 배치가 늦어져 한 사람이 여러 아이를 살펴야 했다.', 'health-2 happiness-1 care+2', '인력 부족', { dark: true }),
    ],
    hazard: 1, burnout: 0.07,
  }),
  X('26411', {
    entry: [E('hire', { minEdu: '4yr', ages: [22, 50], p: 0.5, text: '어학원 강사 공고를 보고 수업을 맡기 시작했다.' }), E('self', { minEdu: '4yr', ages: [28, 55], p: 0.15, text: '강사 경력을 바탕으로 소규모 교습소를 열었다.' })],
    transitions: [tr('26419', [28, 55], 3, 0.04, '다른 외국어 강의로'), tr('26217', [28, 50], 4, 0.03, '공교육 교사로'), tr('26492', [30, 58], 5, 0.03, '기업 연수 강사로')],
    events: [
      ev('26411', 'level_test', [22, 58], 0.14, '신학기 레벨 테스트 주간이다. 반 편성에 이틀을 썼다.', 'leisure-1 intellect+1 job+1', '반 편성'),
      ev('26411', 'student_drain', [24, 58], 0.12, '새 어학원이 생기면서 반 하나가 접혔다. 수업 시수가 줄었다.', 'wealth-2 happiness-1 job+3', '수강생 감소', { dark: true }),
      ch('26411', 'online_class', [24, 58], 0.12, '온라인 수업을 병행하자는 제안이 나왔다.', '어떻게 할까?', [
        ['online', '병행한다', 'wealth+2 leisure-2 health-1', '수강생 범위는 넓어졌고 퇴근 후 녹화가 늘었다.'],
        ['offline', '대면만 한다', 'happiness+1 wealth-1 relations+1', '교실의 얼굴들이 남았다. 수입은 제자리였다.'],
      ], 'offline', '수업 방식', { years: [2015, 2040] }),
      ev('26411', 'parent_review', [24, 58], 0.1, '학부모가 시험 점수가 안 오른다며 길게 따졌다.', 'happiness-2 conflict+2', '성과 압박'),
    ],
    hazard: 0, burnout: 0.06,
  }),
  X('26450', {
    entry: [E('license', { license: 'drive', minEdu: 'high', ages: [24, 60], p: 0.5, years: 0, text: '운전 교습 자격을 따고 운전학원에 취업했다.' })],
    transitions: [tr('26492', [32, 60], 5, 0.02, '안전 교육 강사로'), tr('87210', [30, 58], 3, 0.03, '운수 업종으로'), tr('26419', [32, 58], 4, 0.01, '일반 강의로')],
    events: [
      ev('26450', 'first_solo', [24, 62], 0.14, '겁먹던 수강생이 처음 혼자 주차를 해냈다.', 'happiness+3 relations+1', '교습 보람'),
      ev('26450', 'brake_moment', [24, 62], 0.1, '수강생이 당황해 보조 브레이크를 밟았다. 손바닥이 한참 식었다.', 'health-1 happiness-1', '교습 중 긴장', { dark: true }),
      ev('26450', 'slack_season', [25, 62], 0.12, '비수기에는 수강생이 줄어 시간당 수입이 떨어졌다.', 'wealth-2 job+2', '비수기', { dark: true }),
      ch('26450', 'exam_course', [25, 60], 0.1, '시험 코스 위주로만 가르쳐 달라는 수강생이 있다.', '어떻게 가르칠까?', [
        ['course', '요청대로 한다', 'wealth+1 happiness-1 intellect-1', '합격은 빨랐다. 도로 감각은 마음에 걸렸다.'],
        ['road', '도로 위주로 가르친다', 'happiness+1 relations+1 wealth-1', '시간이 더 걸렸다. 수강생이 고맙다고 했다.'],
      ], 'road', '교습 방식'),
    ],
    hazard: 1, burnout: 0.05,
  }),
  X('26462', {
    entry: [E('hire', { minEdu: '4yr', ages: [24, 55], p: 0.45, text: '미용 학원에서 실습 강사로 일을 시작했다.' }), E('promote', { from: ['43120'], minYears: 8, ages: [30, 55], p: 0.1, text: '미용실 경력을 살려 학원 강단에 섰다.' })],
    transitions: [tr('43120', [30, 55], 3, 0.04, '미용실로 복귀'), tr('26469', [30, 58], 4, 0.03, '기능계 강사로'), tr('52111', [32, 55], 4, 0.02, '자영 개업으로')],
    events: [
      ev('26462', 'license_pass', [24, 58], 0.14, '수강생들이 자격 실기를 통과했다. 마네킹 머리를 치우며 함께 웃었다.', 'happiness+3 relations+1', '합격 소식'),
      ev('26462', 'enrollment_dip', [25, 58], 0.12, '수강 정원이 차지 않아 야간반이 폐강됐다.', 'wealth-2 job+3 happiness-1', '야간반 폐강', { dark: true }),
      ch('26462', 'material_cost', [25, 58], 0.1, '실습 재료비 인상분을 수강생에게 얼마나 받을지 정해야 한다.', '어떻게 할까?', [
        ['charge', '재료비를 올린다', 'wealth+2 relations-1 conflict+1', '일부 수강생이 불만을 말했다.'],
        ['absorb', '학원이 부담한다', 'happiness+1 relations+1 wealth-1', '수강생 반응은 좋았다. 운영은 빠듯했다.'],
      ], 'charge', '재료비'),
      ev('26462', 'chemical_smell', [24, 60], 0.12, '약품 냄새 속 종일 수업이 이어져 목이 칼칼했다.', 'health-2 leisure-1', '약품과 환기 부담', ),
    ],
    hazard: 1, burnout: 0.05,
  }),
  X('26472', {
    entry: [E('hire', { minEdu: '4yr', majors: ['art'], ages: [22, 55], p: 0.4, text: '음악 학원에서 레슨 강사로 일을 시작했다.' }), E('self', { minEdu: 'none', ages: [24, 60], p: 0.2, text: '집 근처에 작은 음악 교습소를 열었다.' })],
    transitions: [tr('29453', [26, 50], 3, 0.03, '연주 활동으로'), tr('26211', [28, 50], 5, 0.02, '학교 교사로'), tr('29452', [28, 55], 4, 0.02, '작곡·편곡으로')],
    events: [
      ev('26472', 'recital', [22, 62], 0.14, '제자들의 연주회가 열렸다. 틀려도 끝까지 치는 모습을 지켜봤다.', 'happiness+3 relations+1', '연주회'),
      ev('26472', 'student_quit', [24, 60], 0.12, '입시를 이유로 수강생이 한꺼번에 그만뒀다. 이번 달 수입이 줄었다.', 'wealth-2 job+2 happiness-1', '수강생 이탈', { dark: true }),
      ch('26472', 'contest_prep', [24, 58], 0.1, '대회를 준비하자는 학부모 요청이 들어왔다.', '어떻게 할까?', [
        ['prep', '집중 지도한다', 'intellect+1 wealth+1 leisure-2 health-1', '주말 연습이 이어졌다. 결과와 별개로 아이가 자란 게 보였다.'],
        ['keep', '재미 위주로 간다', 'happiness+1 wealth-1 relations-1', '학부모가 아쉬워했다. 아이는 연습을 즐겼다.'],
      ], 'keep', '대회 요청'),
      ev('26472', 'fingers_ache', [30, 62], 0.1, '하루 열 타임 레슨이 이어지자 어깨와 손목이 먼저 아파 왔다.', 'health-2 leisure-1', '손목·어깨 통증', ),
    ],
    hazard: 0, burnout: 0.06,
  }),
  X('26492', {
    entry: [E('hire', { minEdu: '4yr', ages: [28, 58], p: 0.4, text: '업무 경력을 인정받아 기업 연수 강사로 일을 맡았다.' })],
    transitions: [tr('28151', [32, 58], 5, 0.03, '컨설턴트로 이동'), tr('26919', [35, 60], 6, 0.02, '교육 기획으로'), tr('26429', [32, 58], 4, 0.02, '학원 강사로')],
    events: [
      ev('26492', 'full_audience', [28, 62], 0.14, '강의가 끝나자 수강생들이 질문하러 몰려왔다. 만족도 점수가 높았다.', 'happiness+3 intellect+1 relations+1', '강의 평가'),
      ev('26492', 'budget_freeze', [30, 62], 0.12, '경기가 나빠지자 기업들이 교육 예산부터 줄였다. 의뢰가 뚝 끊겼다.', 'wealth-3 job+3 happiness-1', '교육 예산 감축', { dark: true }),
      ch('26492', 'online_module', [28, 60], 0.12, '과정을 영상 강의로 바꾸자는 제안이 나왔다.', '어떻게 할까?', [
        ['record', '영상으로 만든다', 'wealth+2 relations-1 leisure-2', '촬영과 편집에 몇 주가 갔다. 반복 수입이 생겼다.'],
        ['live', '대면 강의를 지킨다', 'relations+1 happiness+1 wealth-1', '현장 반응을 살피는 맛이 남았다. 의뢰 수는 줄었다.'],
      ], 'live', '강의 방식', { years: [2015, 2040] }),
      ev('26492', 'road_week', [30, 60], 0.1, '지방 출강이 이어져 일주일을 숙소에서 보냈다.', 'health-1 leisure-2 relations-1', '출강 일정', ),
    ],
    hazard: 0, burnout: 0.05,
  }),
  X('27220', {
    entry: [E('license', { license: 'law', minEdu: '4yr', ages: [30, 62], p: 0.4, years: 1, text: '행정사 시험에 합격해 사무소를 차렸다.' }), E('promote', { from: ['35290'], minYears: 20, ages: [50, 62], p: 0.12, text: '공직 경력을 살려 행정사 사무소를 열었다.' })],
    transitions: [tr('27131', [35, 60], 6, 0.02, '법무사로 이동'), tr('28452', [35, 62], 4, 0.02, '중개업으로'), tr('28151', [40, 62], 8, 0.01, '자문 업무로')],
    events: [
      ev('27220', 'appeal_win', [32, 70], 0.14, '의뢰인이 행정심판에서 이겼다. 서류가 길었던 몇 주가 보람으로 돌아왔다.', 'happiness+3 wealth+1', '심판 결과'),
      ev('27220', 'slow_season', [32, 72], 0.14, '의뢰가 뜸한 달이 이어졌다. 사무소 월세는 그대로 나갔다.', 'wealth-2 happiness-1 job+2', '의뢰 감소', { dark: true, who: 'self' }),
      ch('27220', 'low_fee', [32, 70], 0.1, '단골이 수수료를 깎아 달라고 했다.', '어떻게 할까?', [
        ['cut', '깎아 준다', 'relations+1 happiness+1 wealth-2', '단골은 다음 의뢰도 맡겼다. 이번 달은 빠듯했다.'],
        ['hold', '그대로 받는다', 'wealth+1 relations-1 happiness-1', '정해진 금액을 받았다. 분위기가 서먹해졌다.'],
      ], 'hold', '수수료 협상'),
      ev('27220', 'online_apply', [33, 70], 0.1, '온라인 신청이 늘어 서류 대행 의뢰가 눈에 띄게 줄었다.', 'wealth-2 tech+2 job+2', '민원 전산화', { years: [2010, 2060] }),
    ],
    hazard: 0, burnout: 0.04,
  }),
  X('27131', {
    entry: [E('license', { license: 'law', minEdu: '4yr', ages: [28, 62], p: 0.3, years: 3, text: '법무사 시험에 합격해 등기 사무소에 자리를 잡았다.' }), E('promote', { from: ['27190'], minYears: 10, ages: [40, 60], p: 0.05, text: '법원·검찰 근무 경력을 인정받아 법무사가 됐다.' })],
    transitions: [tr('27220', [35, 62], 4, 0.02, '행정사로 이동'), tr('28452', [38, 62], 4, 0.02, '부동산 업무로'), tr('27120', [40, 60], 6, 0.01, '법률 사무로')],
    events: [
      ev('27131', 'closing_day', [30, 70], 0.14, '잔금일에 등기 서류가 한 번에 맞아떨어졌다. 의뢰인이 안도했다.', 'happiness+2 wealth+1', '등기 완료'),
      ev('27131', 'registry_online', [32, 70], 0.1, '전자 신청이 늘어 단순 등기 의뢰가 줄었다.', 'wealth-2 tech+3 job+2', '등기 전산화', { dark: true, years: [2010, 2060] }),
      ch('27131', 'new_client', [32, 70], 0.1, '복잡한 상속 사건 의뢰가 들어왔다. 일정이 빠듯하다.', '어떻게 할까?', [
        ['accept', '맡는다', 'wealth+2 intellect+1 leisure-2 health-1', '서류가 산더미였지만 수입이 늘었다.'],
        ['refer', '다른 곳을 소개한다', 'relations+1 wealth-1 happiness+1', '무리하지 않았다. 의뢰인이 고마워했다.'],
      ], 'accept', '일정과 수입'),
      ev('27131', 'client_default', [32, 70], 0.1, '의뢰인이 보수 지급을 미룬 채 연락이 뜸해졌다.', 'wealth-2 happiness-1 fairness+2', '보수 미지급', { dark: true }),
    ],
    hazard: 0, burnout: 0.04,
  }),
  X('27112', {
    entry: [E('exam', { license: 'law', minEdu: 'grad', majors: ['soc'], ages: [28, 46], p: 0.03, years: 0, text: '변호사시험에 합격한 뒤 검사 임용 과정을 거쳐 검사가 됐다.' }), E('promote', { from: ['27120'], minYears: 5, ages: [32, 48], p: 0.02, text: '변호사 경력으로 검사에 임용됐다.' })],
    transitions: [tr('27120', [40, 62], 10, 0.06, '퇴직 후 변호사 개업'), tr('27190', [40, 60], 8, 0.04, '기업 법무로'), tr('26113', [50, 66], 15, 0.02, '대학 교수로')],
    events: [
      ev('27112', 'night_review', [30, 62], 0.14, '배당받은 사건 기록이 쌓여 밤마다 검토가 이어졌다.', 'health-2 leisure-2', '사건 기록 검토', { dark: true }),
      ev('27112', 'victim_thanks', [30, 62], 0.1, '사건이 마무리되자 피해자 가족이 조용히 고개를 숙였다.', 'happiness+3 fairness-1', '사건 종결'),
      ch('27112', 'transfer_order', [30, 58], 0.1, '다른 지역 발령이 났다. 아이는 학기 중이다.', '가족은 어떻게 할까?', [
        ['together', '함께 옮긴다', 'relations+1 happiness-1 leisure-1', '전학 수속을 서두르고 이삿짐을 쌌다.'],
        ['alone', '혼자 간다', 'wealth-1 relations-2 health-1', '주말 부부가 됐다. 오가는 길이 길었다.'],
      ], 'alone', '정기 인사'),
      ev('27112', 'prosecution_review', [32, 62], 0.1, '수사 지휘 방식이 바뀌어 맡던 업무 범위가 달라졌다.', 'happiness-1 job+3 fairness+1', '제도 변화', ),
    ],
    hazard: 0, burnout: 0.06,
  }),
  X('28312', {
    entry: [E('hire', { minEdu: '4yr', majors: ['soc', 'hum'], ages: [23, 45], p: 0.4, text: '마케팅 부서에 공채로 입사해 기획을 배웠다.' }), E('hire', { minEdu: '2yr', ages: [22, 40], p: 0.2, text: '대행사 인턴을 거쳐 마케터로 일을 시작했다.' })],
    transitions: [tr('28331', [26, 48], 3, 0.04, '광고 대행사로'), tr('28151', [32, 55], 6, 0.03, '컨설턴트로'), tr('52111', [32, 55], 5, 0.02, '자영 창업으로')],
    events: [
      ev('28312', 'campaign_hit', [24, 56], 0.12, '기획한 캠페인의 반응이 예상보다 컸다. 팀이 함께 축하했다.', 'happiness+3 intellect+1 relations+1', '캠페인 성과'),
      ev('28312', 'budget_pullback', [26, 58], 0.12, '분기 실적이 나빠지자 마케팅 예산이 먼저 삭감됐다.', 'happiness-2 job+3 wealth-1', '예산 삭감', { dark: true }),
      ch('28312', 'agency_pitch', [26, 56], 0.1, '대행사 두 곳이 제안서를 들고 왔다. 한쪽은 싸고 한쪽은 경험이 많다.', '어느 쪽을 쓸까?', [
        ['cheap', '저렴한 쪽', 'wealth+1 relations-1 intellect-1', '비용은 줄었으나 수정이 잦았다.'],
        ['skilled', '경험 많은 쪽', 'intellect+1 relations+1 wealth-1', '일은 매끄러웠고 예산이 더 나갔다.'],
      ], 'skilled', '협력사 선정'),
      ev('28312', 'report_loop', [24, 56], 0.14, '임원 보고용 자료를 밤새 세 번 고쳤다. 결론은 처음 안이었다.', 'health-1 leisure-2 happiness-1', '보고 자료 수정', ),
    ],
    hazard: 0, burnout: 0.06,
  }),
  X('28331', {
    entry: [E('hire', { minEdu: '4yr', majors: ['soc', 'hum', 'art'], ages: [23, 45], p: 0.4, text: '광고 대행사 인턴을 거쳐 기획자로 입사했다.' })],
    transitions: [tr('28312', [28, 52], 3, 0.04, '기업 마케팅으로'), tr('29541', [26, 50], 3, 0.03, '디자인 쪽으로'), tr('28332', [28, 52], 4, 0.03, '홍보로 이동')],
    events: [
      ev('28331', 'pitch_win', [24, 56], 0.12, '경쟁 프레젠테이션에서 우리 안이 선정됐다. 팀 전체가 환호했다.', 'happiness+3 relations+1 wealth+1', '수주 성공'),
      ev('28331', 'pitch_loss', [24, 55], 0.14, '프레젠테이션 일주일 전부터 새벽까지 작업했다. 결과는 탈락이었다.', 'health-2 happiness-2 leisure-2', '경쟁 PT 낙선', { dark: true }),
      ch('28331', 'client_revision', [25, 55], 0.12, '광고주가 마지막 날 콘셉트를 바꿔 달라고 했다.', '어떻게 대응할까?', [
        ['rework', '밤새 다시 만든다', 'relations+1 health-2 leisure-2', '광고주는 만족했다. 팀원들이 지쳤다.'],
        ['persuade', '원안을 설득한다', 'intellect+1 relations-1 conflict+1', '원안을 지켰지만 광고주 분위기가 굳었다.'],
      ], 'rework', '막판 수정'),
      ev('28331', 'ad_budget_cut', [27, 58], 0.1, '광고주가 예산을 줄이자 대행 수수료도 함께 줄었다.', 'wealth-2 job+3', '광고 예산 축소', { dark: true }),
    ],
    hazard: 0, burnout: 0.08,
  }),
];
