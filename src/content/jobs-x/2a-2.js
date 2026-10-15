import { X, E, tr, ev, ch } from '../jobs-kit.js';
export default [
  X('23423', {
    entry: [
      E('degree', { minEdu: '4yr', majors: ['eng', 'sci'], ages: [23, 35], p: 0.35, era: [1985, null], text: '반도체 공정 장비 회사에 엔지니어로 입사했다.' }),
      E('hire', { minEdu: '2yr', ages: [20, 35], p: 0.12, era: [1990, null], text: '설비 보전 경력으로 공정 장비 담당에 채용됐다.' }),
    ],
    transitions: [tr('23421', [28, 45], 4, 0.04, '메모리 분야로'), tr('23631', [35, 52], 8, 0.02, '산업안전 직무로'), tr('14111', [38, 55], 10, 0.02, '생산 책임자로')],
    events: [
      ev('23423', 'tool_down', [24, 52], 0.14, '장비가 멈췄다는 호출에 새벽 클린룸으로 들어갔다.', 'health-2 leisure-3 job+1', '장비 정지 호출', { dark: true }),
      ev('23423', 'yield_up', [24, 55], 0.11, '장비 조건을 손봐 수율이 올랐다. 보고서에 이름이 올랐다.', 'happiness+3 intellect+1 job-2', '수율 개선'),
      ch('23423', 'overseas_install', [27, 50], 0.1, '해외 공장 장비 설치에 몇 달 파견되는 자리가 났다.', '어떻게 할까?', [['go', '다녀온다', 'wealth+3 intellect+2 relations-3 leisure-1', '체류 수당이 붙었다. 가족과는 영상으로 얼굴을 봤다.'], ['stay', '국내에 남는다', 'relations+2 leisure+1 wealth-1 job+1', '일상은 그대로였다. 다음 기회를 기다렸다.']], 'stay', '해외 파견 제의', { once: true }),
      ev('23423', 'chem_alarm', [24, 52], 0.09, '가스 경보가 울려 전원이 대피했고 점검 후 복귀했다.', 'health-1 happiness-2 tech+1', '가스 경보 대피', { dark: true, cd: 5 }),
    ],
    hazard: 2, burnout: 0.07,
  }),
  X('23133', {
    entry: [
      E('degree', { minEdu: '4yr', majors: ['eng'], ages: [23, 35], p: 0.3, text: '토목 전공으로 건설사에 입사해 현장에 배치됐다.' }),
      E('license', { license: 'tech', minEdu: '2yr', majors: ['eng'], ages: [22, 40], p: 0.12, years: 1, text: '토목기사를 따서 시공 업체에 들어갔다.' }),
    ],
    transitions: [tr('14111', [38, 55], 10, 0.06, '현장소장으로'), tr('23122', [38, 58], 8, 0.03, '감리로 이직'), tr('23631', [40, 58], 8, 0.02, '안전 관리로')],
    events: [
      ev('23133', 'earth_work', [24, 55], 0.14, '장마가 길어 토공 일정이 한 달 밀렸다.', 'leisure-2 happiness-2 job+2', '장마 공정 지연', { dark: true }),
      ev('23133', 'bridge_done', [28, 58], 0.1, '교량 상판이 이어져 준공 사진에 이름이 들어갔다.', 'happiness+4 intellect+1', '준공', { once: true }),
      ch('23133', 'site_transfer', [26, 50], 0.12, '지방 현장으로 가라는 발령이 났다. 숙소는 컨테이너다.', '어떻게 할까?', [['go', '현장 숙소로 간다', 'wealth+2 leisure-3 relations-2 intellect+1', '주말에만 집에 갔다. 현장 일은 손에 익어 갔다.'], ['ask', '다른 현장을 요청한다', 'relations+2 happiness+1 wealth-2 job+2', '요청은 받아들여졌지만 인사 평가에 조금 영향이 있었다.']], 'go', '지방 현장 발령', { cd: 5 }),
      ev('23133', 'delay_pay', [25, 55], 0.08, '하청 업체 대금이 늦어져 현장 조율에 시간을 썼다.', 'conflict+3 happiness-2 wealth-1', '하도급 대금 지연', { dark: true, cd: 5 }),
    ],
    hazard: 3, burnout: 0.06,
  }),
  X('23122', {
    entry: [
      E('promote', { from: ['23123', '23133'], minYears: 6, ages: [32, 58], p: 0.1, text: '시공 경력을 살려 감리 업체로 옮겼다.' }),
      E('license', { license: 'tech', minEdu: '4yr', majors: ['eng'], ages: [30, 55], p: 0.1, years: 1, text: '감리 자격을 갖추고 감리 단원이 됐다.' }),
    ],
    transitions: [tr('23631', [40, 60], 6, 0.03, '안전 관리로'), tr('14111', [40, 58], 8, 0.02, '현장 책임자로'), tr('23123', [38, 58], 6, 0.03, '시공 기술자로 복귀')],
    events: [
      ev('23122', 'rebar_check', [32, 62], 0.14, '배근 검측에서 간격이 맞지 않아 재시공을 요구했다.', 'conflict+3 happiness-1 intellect+1', '검측 부적합 통보', { dark: true }),
      ev('23122', 'trust_site', [32, 62], 0.11, '시공사 소장이 검측 기준을 이해해 주며 일이 수월해졌다.', 'happiness+3 relations+2 conflict-2', '현장과의 신뢰'),
      ch('23122', 'quiet_ask', [34, 60], 0.1, '공사가 급하다며 검측을 서류로 넘기자는 요청이 왔다.', '어떻게 할까?', [['hold', '규정대로 현장을 본다', 'conflict+2 happiness+1 relations-2 intellect+1', '현장에 나가 확인했다. 조금 불편한 분위기였다.'], ['soft', '일정을 맞춰 조율한다', 'relations+2 happiness-2 job+2 leisure+1', '서류 확인으로 처리했다. 마음 한구석이 남았다.']], 'hold', '검측 생략 요청', { once: true }),
      ev('23122', 'long_drive', [32, 62], 0.1, '여러 현장을 돌며 하루 몇 백 킬로미터를 운전했다.', 'health-2 leisure-2 wealth+1', '다현장 감리 순회'),
    ],
    hazard: 1, burnout: 0.05,
  }),
  X('23631', {
    entry: [
      E('degree', { minEdu: '4yr', majors: ['eng'], ages: [23, 40], p: 0.25, era: [1982, null], text: '안전 전공으로 제조·건설 업체 안전 관리자로 채용됐다.' }),
      E('promote', { from: ['23123', '23133', '23423'], minYears: 5, ages: [30, 55], p: 0.08, era: [1982, null], text: '현장 경력으로 안전 관리 업무를 맡게 됐다.' }),
    ],
    transitions: [tr('14111', [40, 58], 8, 0.03, '현장 총괄로'), tr('23641', [30, 55], 4, 0.03, '산업보건 관리로'), tr('28151', [40, 58], 8, 0.02, '안전 컨설팅으로')],
    events: [
      ev('23631', 'rail_check', [25, 62], 0.14, '추락 방호를 점검하다 안전모 안 쓴 작업자에게 주의를 줬다.', 'conflict+2 happiness-1 relations-1', '현장 점검 주의', { dark: true }),
      ev('23631', 'zero_accident', [28, 62], 0.1, '무재해 기록이 이어져 현장 전체가 작은 행사를 열었다.', 'happiness+4 relations+2', '무재해 달성'),
      ch('23631', 'schedule_vs_safety', [28, 58], 0.12, '공정이 급한데 작업 중지 요청을 어떻게 할지 고민이 된다.', '어떻게 할까?', [['stop', '작업을 중지시킨다', 'conflict+3 happiness+1 relations-2 intellect+1', '시정이 되기 전까지 작업을 세웠다. 소장과 한동안 서먹했다.'], ['guide', '조치를 보강해 진행한다', 'conflict+1 relations+1 happiness-2 leisure-1', '보강 후 작업을 이어 갔다. 마음 놓이지는 않았다.']], 'stop', '작업 중지 판단', { once: true }),
      ev('23631', 'inspection_week', [25, 62], 0.1, '노동 당국 점검 주간이라 서류와 현장을 밤늦게까지 정리했다.', 'leisure-3 health-1 job+1', '점검 대비', { cd: 5 }),
    ],
    hazard: 1, burnout: 0.07,
  }),
  X('23161', {
    entry: [
      E('degree', { minEdu: '4yr', majors: ['eng'], ages: [23, 38], p: 0.25, text: '지적·측량 전공으로 측량 업체에 입사했다.' }),
      E('license', { license: 'tech', minEdu: '2yr', majors: ['eng'], ages: [20, 40], p: 0.12, years: 1, text: '측량 자격을 따서 현장 측량팀에서 일을 배웠다.' }),
    ],
    transitions: [tr('23164', [28, 48], 5, 0.04, '공간정보 시스템으로'), tr('23133', [28, 50], 5, 0.02, '토목 시공으로'), tr('23951', [28, 45], 4, 0.02, '제도·도면 업무로')],
    events: [
      ev('23161', 'field_heat', [22, 55], 0.14, '한여름에 하루 종일 현장에서 기준점을 잡았다.', 'health-2 leisure-1 wealth+1', '한여름 현장 측량', { dark: true }),
      ev('23161', 'boundary_agree', [25, 60], 0.11, '경계 분쟁이 있던 땅 주인들이 측량 결과를 받아들였다.', 'happiness+3 relations+1 conflict-2', '경계 합의'),
      ch('23161', 'drone_buy', [28, 52], 0.1, '드론 측량이 일반화돼 장비를 새로 사야 하는지 고민이 된다.', '어떻게 할까?', [['buy', '장비와 교육에 투자한다', 'intellect+2 wealth-3 tech-2 job-1', '교육을 받고 장비를 샀다. 단가는 낮아졌지만 작업량은 늘었다.'], ['old', '기존 방식을 유지한다', 'wealth+1 intellect-1 job+3 leisure+1', '기존 방식대로 했다. 의뢰가 조금씩 줄었다.']], 'buy', '드론 측량 도입', { once: true, years: [2015, 2100] }),
      ev('23161', 'unit_price', [26, 60], 0.09, '공공 의뢰 단가가 내려 같은 일을 하고 수입이 줄었다.', 'wealth-2 happiness-2 job+3', '측량 단가 하락', { dark: true, cd: 5 }),
    ],
    hazard: 1, burnout: 0.04,
  }),
  X('23517', {
    entry: [
      E('degree', { minEdu: '4yr', majors: ['eng'], ages: [23, 35], p: 0.3, text: '조선공학 전공으로 조선소 설계 부서에 입사했다.' }),
      E('hire', { minEdu: '2yr', ages: [20, 36], p: 0.1, text: '선박 도장·의장 현장 경력으로 설계 보조에 채용됐다.' }),
    ],
    transitions: [tr('23516', [28, 45], 5, 0.03, '기계 분야로'), tr('23512', [30, 50], 5, 0.02, '플랜트 설계로'), tr('14111', [40, 58], 10, 0.02, '생산 책임자로')],
    events: [
      ev('23517', 'block_design', [24, 55], 0.14, '선박 블록 도면 수정이 몰려 야간 설계가 이어졌다.', 'leisure-3 health-1 intellect+1', '도면 수정 몰림', { dark: true }),
      ev('23517', 'launch_day', [26, 58], 0.1, '진수식 날 내가 설계에 참여한 배가 물에 떴다.', 'happiness+4 relations+1', '진수식', { once: true }),
      ch('23517', 'slump_offer', [28, 55], 0.1, '수주가 줄어 무급 휴직 신청을 받는다는 공지가 났다.', '어떻게 할까?', [['rest', '휴직을 신청한다', 'wealth-2 leisure+3 happiness+1 job+3', '몇 달 쉬며 자격 공부를 했다. 복귀는 약속됐다.'], ['stay', '근무를 이어 간다', 'wealth+1 leisure-1 job-1 happiness-1', '남은 일을 이어 갔다. 팀이 줄어 업무가 늘었다.']], 'stay', '수주 감소 휴직', { once: true, years: [1998, 2100] }),
      ev('23517', 'design_tool', [26, 56], 0.09, '새 설계 도구를 익히느라 한 분기가 빠듯했다.', 'intellect+2 leisure-2 tech+1', '설계 도구 교체', { cd: 5 }),
    ],
    hazard: 1, burnout: 0.05,
  }),
  X('23720', {
    entry: [
      E('degree', { minEdu: '4yr', majors: ['eng', 'sci'], ages: [23, 36], p: 0.3, era: [2005, null], text: '에너지·전기 전공으로 태양광 사업 회사에 입사했다.' }),
      E('promote', { from: ['23412', '23413', '23419'], minYears: 4, ages: [28, 50], p: 0.06, era: [2005, null], text: '발전 경력을 살려 재생에너지 사업에 합류했다.' }),
    ],
    transitions: [tr('23415', [30, 50], 5, 0.03, '전기 감리로'), tr('23419', [28, 48], 4, 0.03, '전기 설비로'), tr('14111', [38, 55], 9, 0.02, '사업장 책임자로')],
    events: [
      ev('23720', 'site_survey', [24, 55], 0.14, '산지 부지를 조사해 발전량을 계산하느라 현장을 다녔다.', 'health-1 intellect+1 leisure-1', '부지 조사'),
      ev('23720', 'subsidy_cut', [27, 58], 0.1, '지원 제도가 줄어 사업성이 낮아졌다는 소식이 돌았다.', 'happiness-2 wealth-1 job+4', '지원 제도 변화', { dark: true, years: [2010, 2100] }),
      ch('23720', 'local_resident', [28, 55], 0.11, '발전소 부지 주민들이 설명회에서 불안을 표했다.', '어떻게 할까?', [['talk', '설명회를 여러 번 연다', 'relations+2 leisure-3 conflict+1 happiness+1', '주민들과 몇 달에 걸쳐 대화했다. 일정은 밀렸다.'], ['law', '인허가 절차대로 진행한다', 'leisure+1 conflict+3 happiness-2 job-1', '절차는 지켰지만 갈등이 길어졌다.']], 'talk', '주민 설명회', { once: true, years: [2010, 2100] }),
      ev('23720', 'storm_panel', [24, 55], 0.09, '태풍으로 패널 일부가 파손돼 복구 일정을 짰다.', 'leisure-2 happiness-2 wealth-1', '태풍 설비 피해', { dark: true, cd: 5 }),
    ],
    hazard: 1, burnout: 0.04,
  }),
  X('23513', {
    entry: [
      E('degree', { minEdu: '4yr', majors: ['eng'], ages: [23, 35], p: 0.3, text: '기계 전공으로 설비 설계 업체에 입사했다.' }),
      E('hire', { minEdu: '2yr', ages: [20, 38], p: 0.1, text: '공조 설비 시공 경력으로 설계·견적 업무에 옮겼다.' }),
    ],
    transitions: [tr('23124', [30, 50], 5, 0.03, '건축설비 설계로'), tr('23516', [28, 45], 5, 0.02, '기계 개발로'), tr('23631', [38, 55], 8, 0.02, '안전 관리로')],
    events: [
      ev('23513', 'summer_peak', [24, 55], 0.14, '한여름 냉방 민원이 몰려 현장과 사무실을 오가며 일했다.', 'leisure-2 health-1 happiness-1', '냉방 성수기 업무', { dark: true }),
      ev('23513', 'efficiency_award', [27, 58], 0.1, '에너지 절감 설계가 건물주에게 호평을 받았다.', 'happiness+3 intellect+1 job-2', '에너지 절감 성과'),
      ch('23513', 'spec_cut', [28, 52], 0.11, '예산 때문에 설계를 한 등급 낮추자는 요청이 왔다.', '어떻게 할까?', [['accept', '요청대로 사양을 낮춘다', 'relations+2 happiness-1 conflict-1 intellect-1', '비용은 맞췄다. 나중 유지보수가 마음에 걸렸다.'], ['push', '효율 근거를 들어 설득한다', 'intellect+1 conflict+2 relations-1 happiness+1', '자료를 만들어 설명했다. 절반을 받아들였다.']], 'push', '사양 하향 요청', { once: true }),
      ev('23513', 'refrigerant_rule', [26, 58], 0.09, '냉매 규제가 바뀌어 설계 기준을 새로 익혔다.', 'intellect+2 leisure-2 tech+2', '냉매 규제 변화', { years: [1995, 2100], cd: 5 }),
    ],
    hazard: 1, burnout: 0.04,
  }),
  X('23416', {
    entry: [
      E('degree', { minEdu: '4yr', majors: ['eng'], ages: [23, 36], p: 0.3, text: '전기 전공으로 전기 안전 점검 기관에 입사했다.' }),
      E('license', { license: 'tech', minEdu: '2yr', majors: ['eng'], ages: [20, 42], p: 0.14, years: 1, text: '전기기사 자격으로 안전 점검 업무를 시작했다.' }),
    ],
    transitions: [tr('23415', [30, 55], 5, 0.03, '전기 감리로'), tr('23631', [35, 58], 6, 0.03, '산업안전 관리로'), tr('14111', [40, 58], 10, 0.02, '설비 책임자로')],
    events: [
      ev('23416', 'old_panel', [24, 58], 0.14, '낡은 분전반에서 열이 오르는 것을 찾아 교체를 안내했다.', 'happiness+2 intellect+1 conflict+1', '위험 설비 발견'),
      ev('23416', 'cold_inspection', [24, 58], 0.13, '혹한 속에 옥외 수전 설비를 점검하다 손이 얼었다.', 'health-2 leisure-1', '혹한 점검', { dark: true }),
      ch('23416', 'fix_or_report', [28, 56], 0.1, '점검처가 큰 비용을 걱정하며 개선을 늦춰 달라고 한다.', '어떻게 할까?', [['report', '기한을 명시해 통보한다', 'conflict+2 happiness+1 relations-2 intellect+1', '서면으로 통보했다. 관계가 서먹해졌다.'], ['wait', '단계적 개선을 제안한다', 'relations+2 happiness-1 conflict-1 intellect-1', '일정을 나눠 정리했다. 속도가 더뎌 신경이 쓰였다.']], 'report', '개선 기한 협의', { once: true }),
      ev('23416', 'near_miss', [24, 56], 0.08, '점검 중 활선 근접 상황이 있어 작업 절차를 다시 점검했다.', 'happiness-2 health-1 tech+1', '활선 근접 점검', { dark: true, cd: 5 }),
    ],
    hazard: 2, burnout: 0.04,
  }),
  X('23622', {
    entry: [
      E('degree', { minEdu: '4yr', majors: ['eng'], ages: [23, 36], p: 0.25, era: [1980, null], text: '소방 설비 업체에 입사해 시공 현장에서 일을 배웠다.' }),
      E('license', { license: 'tech', minEdu: '2yr', majors: ['eng'], ages: [20, 42], p: 0.14, years: 1, era: [1980, null], text: '소방설비기사를 따서 시공 업체에 채용됐다.' }),
    ],
    transitions: [tr('23621', [28, 50], 4, 0.04, '소방설계로'), tr('23623', [35, 58], 6, 0.03, '소방 감리로'), tr('23631', [35, 58], 6, 0.02, '안전 관리로')],
    events: [
      ev('23622', 'sprinkler_work', [24, 58], 0.14, '천장 속에서 배관을 잇느라 하루 종일 먼지를 마셨다.', 'health-2 leisure-1 wealth+1', '천장 배관 작업', { dark: true }),
      ev('23622', 'inspection_pass', [26, 60], 0.12, '완공 검사를 한 번에 통과해 건물주가 인사를 건넸다.', 'happiness+3 relations+1 job-1', '완공 검사 통과'),
      ch('23622', 'cheap_bid', [28, 55], 0.1, '낮은 단가로 입찰하면 일감을 얻지만 수익이 빠듯해진다.', '어떻게 할까?', [['bid', '낮은 단가로 입찰한다', 'wealth-1 job-2 leisure-2 happiness+1', '공사를 땄다. 자재비를 맞추느라 빠듯한 달이 이어졌다.'], ['pass', '입찰을 포기한다', 'wealth+1 leisure+1 job+2 happiness-1', '포기한 공사는 다른 업체가 가져갔다. 일감이 한동안 비었다.']], 'pass', '단가 입찰 판단', { once: true }),
      ev('23622', 'safety_rule', [25, 60], 0.09, '소방 기준이 바뀌어 설비 도면과 시공 기준을 다시 확인했다.', 'intellect+2 leisure-1 tech+1', '소방 기준 개정', { cd: 5 }),
    ],
    hazard: 2, burnout: 0.04,
  }),
];
