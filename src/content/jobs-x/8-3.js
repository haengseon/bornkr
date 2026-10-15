import { X, E, tr, ev, ch } from '../jobs-kit.js';
export default [
  X('85421', {
    entry: [
      E('hire', { minEdu: 'high', ages: [18, 50], p: 0.3, text: '엔진 공장 생산직으로 입사해 볼트 체결과 조립 순서를 익혔다.' }),
      E('promote', { from: ['85411'], minYears: 2, ages: [24, 52], p: 0.08, text: '조립 라인 경력을 살려 엔진 조립 공정으로 배치받았다.' }),
    ],
    transitions: [tr('85429', [24, 56], 3, 0.04, '부품 조립으로 이동'), tr('85411', [24, 56], 3, 0.04, '완성차 조립으로 이동'), tr('85511', [26, 56], 3, 0.03, '공업기계 조립으로 이동')],
    events: [
      ev('85421', 'torque_wrench', [20, 58], 0.13, '토크 렌치를 하루 수백 번 쥐다 손목에 파스를 붙였다.', 'health-2 medical+1', '반복 체결 부담', { dark: true }),
      ev('85421', 'quality_pass', [22, 58], 0.12, '내 공정에서 불량이 한 건도 안 나와 조장이 이름을 불러 줬다.', 'happiness+2 job+1 relations+1', '무결점 공정'),
      ch('85421', 'overtime_ask', [24, 58], 0.12, '엔진 물량이 늘어 특근 명단에 이름이 올랐다.', '어떻게 할까?', [
        ['work', '특근한다', 'wealth+3 health-2 leisure-2', '수당이 두둑했다. 주말이 사라졌다.'],
        ['rest', '쉬기로 한다', 'leisure+2 relations+1 wealth-2', '아이와 시간을 보냈다. 조장이 아쉬워했다.'],
      ], 'rest', '특근 요청'),
      ev('85421', 'line_change', [26, 58], 0.1, '신규 엔진 라인이 깔리며 일부 공정 인원이 다른 곳으로 옮겨졌다.', 'job-1 happiness-1 tech+1', '라인 개편 인력 재배치', { dark: true, who: 'wage' }),
    ],
    hazard: 2, burnout: 0.05,
  }),
  X('85432', {
    entry: [
      E('hire', { minEdu: 'high', ages: [18, 55], p: 0.3, text: '조선소 협력업체에 들어가 블록 조립 보조로 일을 시작했다.' }),
      E('hire', { minEdu: 'high', ages: [20, 58], p: 0.2, text: '도크 의장 팀에 들어가 배관과 전선 작업을 도왔다.' }),
    ],
    transitions: [tr('84130', [24, 56], 3, 0.04, '용접 전문으로 이동'), tr('85439', [24, 56], 3, 0.04, '운송장비 조립으로 이동'), tr('85513', [26, 58], 3, 0.03, '건설기계 조립으로 이동')],
    events: [
      ev('85432', 'dock_launch', [22, 60], 0.1, '오래 매달린 선박이 진수식을 마쳤다. 안벽에서 한참 바라봤다.', 'happiness+3 relations+1', '진수 보람', { once: true }),
      ev('85432', 'heat_work', [22, 60], 0.13, '한여름 선체 안에서 작업하다 어지러워 그늘에서 오래 쉬었다.', 'health-3 happiness-1', '폭염 선내 작업', { dark: true }),
      ev('85432', 'sub_cut', [24, 60], 0.12, '수주가 줄어 협력업체 팀 인원이 줄고 일당이 깎였다.', 'wealth-3 job-2 happiness-1', '수주 감소 인원 조정', { dark: true }),
      ch('85432', 'foreign_crew', [26, 60], 0.11, '외국인 노동자가 팀에 새로 들어왔다. 말이 서로 통하지 않는다.', '어떻게 할까?', [
        ['teach', '손짓으로 가르친다', 'relations+2 leisure-1 intellect+1', '시간이 걸렸지만 서로 배우며 작업했다.'],
        ['tell', '반장에게 맡긴다', 'leisure+1 relations-1 happiness-1', '일은 빨랐지만 어색함은 남았다.'],
      ], 'teach', '외국인 팀원 합류'),
    ],
    hazard: 3, burnout: 0.05,
  }),
  X('85433', {
    entry: [
      E('hire', { minEdu: 'high', ages: [20, 50], p: 0.25, era: [1976, null], text: '항공 부품 제조사에 입사해 동체 리벳 작업 보조로 일했다.' }),
      E('degree', { minEdu: '2yr', majors: ['eng'], ages: [20, 40], p: 0.3, era: [1976, null], text: '항공 정비 계열을 마치고 항공기 조립 라인에 배치됐다.' }),
    ],
    transitions: [tr('85432', [24, 56], 3, 0.03, '선박 조립으로 이동'), tr('85439', [24, 56], 3, 0.04, '운송장비 조립으로 이동'), tr('85301', [26, 54], 3, 0.04, '자동 조립 설비로 이동')],
    events: [
      ev('85433', 'tolerance_check', [22, 58], 0.12, '도면과 공차를 맞추는 작업이 정밀해 검사 도장을 받을 때마다 안도했다.', 'intellect+2 happiness+1', '정밀 검수 통과'),
      ev('85433', 'cert_check', [26, 58], 0.1, '정기 인증 심사에서 공정 기록이 완벽하다는 평가를 받았다.', 'happiness+2 job+1 relations+1', '공정 인증 평가'),
      ev('85433', 'order_cancel', [28, 60], 0.1, '항공 수요가 꺾여 주문이 줄고 교대 근무가 축소됐다.', 'wealth-3 job-2 happiness-1', '주문 감소·근무 축소', { dark: true }),
      ch('85433', 'night_class', [24, 56], 0.1, '조립 교육 과정 야간반이 열렸다. 일이 끝난 뒤 들어야 한다.', '어떻게 할까?', [
        ['study', '야간반 수강', 'intellect+3 leisure-3 job+1', '피곤했지만 자격 인정을 받았다.'],
        ['skip', '지금은 쉰다', 'leisure+2 happiness+1 intellect-1', '쉬는 시간은 지켰다. 승급 기회는 뒤로 밀렸다.'],
      ], 'study', '교육 과정 수강'),
    ],
    hazard: 1, burnout: 0.05,
  }),
  X('85431', {
    entry: [
      E('hire', { minEdu: 'high', ages: [18, 54], p: 0.3, text: '철도차량 제작사에 입사해 객차 의장 작업 보조를 맡았다.' }),
      E('degree', { minEdu: '2yr', majors: ['eng'], ages: [20, 40], p: 0.2, text: '기계 계열을 마치고 차량 조립 팀에 배치됐다.' }),
    ],
    transitions: [tr('85439', [24, 56], 3, 0.04, '운송장비 조립으로 이동'), tr('85432', [24, 56], 3, 0.03, '선박 조립으로 이동'), tr('87120', [30, 58], 5, 0.02, '철도 운영 업무로 이동')],
    events: [
      ev('85431', 'new_car_roll', [22, 58], 0.1, '직접 조립한 객차가 시험 선로를 달렸다. 팀원들과 손뼉을 쳤다.', 'happiness+3 relations+2', '신차 출고 보람', { once: true }),
      ev('85431', 'weld_smoke', [24, 58], 0.12, '용접과 도장 연기가 밴 작업장에서 기침이 늘었다.', 'health-2 medical+1', '분진·연기 노출', { dark: true }),
      ev('85431', 'contract_delay', [26, 60], 0.1, '발주처 사정으로 제작 일정이 밀려 휴업과 특근이 번갈아 왔다.', 'wealth-1 leisure-2 happiness-1', '납기 변동', { dark: true }),
      ch('85431', 'lead_offer', [28, 58], 0.1, '조장 자리를 권유받았다. 교대 관리와 보고서가 따라온다.', '어떻게 할까?', [
        ['lead', '맡는다', 'wealth+2 relations+1 leisure-2 happiness-1', '책임과 서류가 늘었다. 수당이 붙었다.'],
        ['stay', '현장에 남는다', 'happiness+2 leisure+1 wealth-1 relations-1', '손으로 만드는 일에 집중했다. 호봉은 그대로다.'],
      ], 'stay', '조장 제의'),
    ],
    hazard: 2, burnout: 0.05,
  }),
  X('85412', {
    entry: [
      E('hire', { minEdu: 'high', ages: [18, 52], p: 0.25, era: [2012, null], text: '전기차 신규 라인 채용에 응해 배터리 팩 조립을 맡았다.' }),
      E('promote', { from: ['85411'], minYears: 2, ages: [24, 54], p: 0.1, era: [2012, null], text: '내연기관 라인 경력자 전환 교육을 받고 전기차 라인에 배치됐다.' }),
    ],
    transitions: [tr('85411', [24, 56], 3, 0.04, '내연기관 조립으로 이동'), tr('86312', [24, 52], 3, 0.04, '이차전지 제조로 이동'), tr('85301', [26, 54], 3, 0.04, '자동 조립 설비로 이동')],
    events: [
      ev('85412', 'hv_training', [22, 58], 0.12, '고전압 작업 교육을 받고 절연 장갑 끼는 법을 몸에 익혔다.', 'intellect+2 job+1', '고전압 안전 교육', { years: [2012, 2060] }),
      ev('85412', 'transition_fear', [26, 58], 0.12, '엔진 라인 사람들이 전기차 전환으로 일자리가 줄까 불안해한다.', 'happiness-2 job+1 tech+2', '전동화 전환 불안', { dark: true, years: [2015, 2060] }),
      ch('85412', 'pack_error', [24, 58], 0.11, '팩 체결 불량이 의심됐다. 라인을 멈출지 지켜볼지 고민이다.', '어떻게 할까?', [
        ['stop', '라인을 세운다', 'relations-2 job+1 intellect+1', '검사에서 이상이 확인됐다. 눈치도 함께 받았다.'],
        ['watch', '출하 전 재점검', 'leisure-1 relations+1 happiness-1', '재점검으로 해결했다. 마음은 불편했다.'],
      ], 'stop', '라인 정지 판단', { years: [2012, 2060] }),
      ev('85412', 'export_surge', [24, 58], 0.1, '수출 물량이 늘어 증산 소식과 함께 야근이 이어졌다.', 'wealth+2 health-1 leisure-1', '수출 증가', { years: [2015, 2060] }),
    ],
    hazard: 2, burnout: 0.05,
  }),
  X('86402', {
    entry: [
      E('hire', { minEdu: 'high', ages: [16, 50], p: 0.4, text: '오디오·영상기기 공장에 입사해 납땜과 조립 일을 시작했다.' }),
      E('hire', { minEdu: 'high', ages: [18, 55], p: 0.2, text: '협력업체 인력 공고를 보고 조립 라인에 자리를 얻었다.' }),
    ],
    transitions: [tr('86403', [22, 54], 3, 0.04, '정밀 기구 조립으로 이동'), tr('86331', [24, 54], 3, 0.04, '전자 부품 제조로 이동'), tr('86404', [22, 54], 3, 0.04, '가전 조립으로 이동')],
    events: [
      ev('86402', 'solder_skill', [18, 54], 0.13, '납땜이 깔끔하다고 반장이 시험 라인에 불러 주었다.', 'happiness+2 job+1 intellect+1', '솜씨 인정'),
      ev('86402', 'solder_fume', [20, 54], 0.12, '플럭스 연기가 눈을 따갑게 해 환기 팬 교체를 요청했다.', 'health-2 conflict+1', '유해 연기 노출', { dark: true }),
      ev('86402', 'model_switch', [20, 56], 0.11, '신제품으로 생산이 바뀌며 라인 일부가 사라졌다. 남은 사람은 일을 다시 익혔다.', 'job-1 happiness-1 tech+1 intellect+1', '모델 교체 라인 변경', { dark: true }),
      ch('86402', 'piece_rate', [20, 54], 0.11, '한 달 물량이 몰려 성과 수당이 붙는 속도 경쟁이 시작됐다.', '어떻게 할까?', [
        ['fast', '속도를 올린다', 'wealth+3 health-2 relations-1', '수당이 올랐다. 눈과 어깨가 무거웠다.'],
        ['quality', '품질을 지킨다', 'intellect+1 wealth-1 relations+1', '검사 통과율은 높았지만 수당은 적었다.'],
      ], 'quality', '성과 수당 경쟁'),
    ],
    hazard: 1, burnout: 0.05,
  }),
  X('86404', {
    entry: [
      E('hire', { minEdu: 'high', ages: [16, 52], p: 0.4, text: '가전 공장 조립 라인에 입사해 냉장고 문짝 조립을 맡았다.' }),
      E('hire', { minEdu: 'high', ages: [18, 55], p: 0.2, text: '가전 협력업체 단기 계약으로 들어와 포장 전 조립을 했다.' }),
    ],
    transitions: [tr('86402', [22, 54], 3, 0.04, '영상·음향 조립으로 이동'), tr('86322', [24, 54], 3, 0.04, '전기제품 제조로 이동'), tr('85301', [26, 54], 3, 0.03, '자동 조립라인으로 이동')],
    events: [
      ev('86404', 'summer_peak', [18, 56], 0.13, '에어컨 성수기에 라인이 쉬지 않았다. 야근 수당이 붙었다.', 'wealth+3 health-1 leisure-2', '성수기 증산'),
      ev('86404', 'conveyor_pace', [18, 56], 0.12, '컨베이어 속도가 빨라져 어깨와 허리가 굳었다.', 'health-3 happiness-1', '라인 속도 부담', { dark: true }),
      ev('86404', 'good_defect', [20, 56], 0.1, '불량이 나기 전에 부품 이상을 잡아 팀 격려를 받았다.', 'happiness+2 relations+1 job+1', '불량 사전 발견'),
      ev('86404', 'overseas_move', [26, 58], 0.08, '생산 일부가 해외 공장으로 옮겨 간다는 소식이 돌아 불안해졌다.', 'happiness-3 job-3 tech+1', '해외 이전 소문', { dark: true, who: 'wage', years: [1995, 2060] }),
    ],
    hazard: 1, burnout: 0.05,
  }),
  X('86321', {
    entry: [
      E('hire', { minEdu: 'high', ages: [18, 52], p: 0.3, text: '전기 부품 공장에서 코일 권선기와 절연 기계를 맡았다.' }),
      E('hire', { minEdu: 'high', ages: [20, 56], p: 0.2, text: '지인 소개로 변압기 부품 제조 업체에 들어갔다.' }),
    ],
    transitions: [tr('86322', [22, 54], 3, 0.04, '전기제품 제조로 이동'), tr('86331', [22, 54], 3, 0.04, '전자 부품 제조로 이동'), tr('86201', [26, 58], 3, 0.03, '전기설비 조작으로 이동')],
    events: [
      ev('86321', 'coil_defect', [20, 58], 0.12, '권선이 흐트러져 한 롯 전체를 다시 감았다. 퇴근이 늦어졌다.', 'leisure-2 happiness-1 job+1', '권선 불량 재작업'),
      ev('86321', 'shock_scare', [22, 58], 0.1, '접지를 확인하지 않고 만졌다가 찌릿했다. 큰 일은 아니었다.', 'health-1 happiness-1', '감전 위험', { dark: true }),
      ev('86321', 'bonus_year', [22, 58], 0.1, '수주가 좋은 해에 성과급이 나와 가족과 외식했다.', 'wealth+3 happiness+2', '성과급 지급'),
      ch('86321', 'machine_learn', [22, 56], 0.1, '신형 권선기가 들어와 숙련 방식이 달라졌다.', '어떻게 할까?', [
        ['learn', '새 기계부터 익힌다', 'intellect+2 leisure-2 job+1', '설정을 익히는 데 몇 주가 걸렸다. 생산성이 올랐다.'],
        ['old', '구형을 계속 쓴다', 'happiness+1 job-1 intellect-1', '익숙한 기계가 편했다. 구형 라인이 줄었다.'],
      ], 'learn', '신형 설비 도입'),
    ],
    hazard: 2, burnout: 0.05,
  }),
  X('84130', {
    entry: [
      E('hire', { minEdu: 'high', ages: [18, 54], p: 0.3, text: '철구조물 공장에 들어가 용접 보조로 일하며 토치를 잡았다.' }),
      E('degree', { minEdu: 'high', majors: ['eng'], ages: [17, 40], p: 0.2, text: '특성화 과정에서 용접 기능을 익히고 공장에 입사했다.' }),
    ],
    transitions: [tr('84160', [24, 58], 3, 0.04, '제관 일로 이동'), tr('85432', [24, 58], 3, 0.04, '선박 조립으로 이동'), tr('84170', [24, 58], 3, 0.04, '판금 일로 이동')],
    events: [
      ev('84130', 'weld_pass', [20, 60], 0.12, '비파괴 검사에서 내 용접부가 한 번에 통과했다.', 'happiness+3 job+1 intellect+1', '용접 검사 통과'),
      ev('84130', 'arc_eye', [22, 62], 0.12, '용접 불빛에 눈이 시려 며칠 쉬었다. 보호구 점검을 요청했다.', 'health-3 happiness-1', '아크 눈 통증', { dark: true }),
      ev('84130', 'fume_cough', [28, 62], 0.1, '흄이 쌓여 건강검진에서 폐 소견이 나왔다. 환기 설비를 바꿔 달라고 했다.', 'health-2 medical+2', '용접 흄 노출', { dark: true }),
      ch('84130', 'night_pay', [24, 60], 0.1, '납기에 맞추려 야간 용접 팀 투입 제안이 왔다.', '어떻게 할까?', [
        ['night', '야간 팀 합류', 'wealth+3 health-2 relations-1', '야간 수당을 받았다. 낮 생활이 틀어졌다.'],
        ['day', '주간에 남는다', 'health+1 relations+1 wealth-1', '낮 시간에 일했다. 수당은 없었다.'],
      ], 'day', '야간 팀 제안'),
    ],
    hazard: 3, burnout: 0.05,
  }),
  X('85105', {
    entry: [
      E('hire', { minEdu: 'high', ages: [18, 55], p: 0.4, text: '금속 부품 공장에서 프레스 라인 보조로 일을 시작했다.' }),
      E('hire', { minEdu: 'none', ages: [20, 58], p: 0.2, text: '소규모 가공 업체에 들어가 절단기와 프레스를 맡았다.' }),
    ],
    transitions: [tr('85107', [24, 56], 3, 0.04, '머시닝센터 조작으로 이동'), tr('85106', [22, 56], 3, 0.04, '절곡기 조작으로 이동'), tr('84170', [24, 56], 3, 0.03, '판금 일로 이동')],
    events: [
      ev('85105', 'die_change', [20, 58], 0.12, '금형 교체를 빨리 마쳐 라인이 쉬지 않았다. 반장이 칭찬했다.', 'happiness+2 relations+1 job+1', '금형 교체 숙련'),
      ev('85105', 'near_press', [20, 60], 0.12, '손이 금형 근처에 있을 때 센서가 멈췄다. 가슴이 철렁했다.', 'happiness-2 health-1 job-1', '프레스 아찔한 순간', { dark: true }),
      ch('85105', 'guard_off', [22, 58], 0.12, '속도를 내려고 센서를 잠시 꺼 두자는 말이 나왔다.', '어떻게 할까?', [
        ['keep', '센서를 켜 둔다', 'relations-2 happiness+1 health+1', '생산량이 줄고 눈총을 받았다. 손은 안전했다.'],
        ['report', '반장에게 말한다', 'relations-1 intellect+1 leisure-1', '점검이 이뤄졌다. 분위기가 어색해졌다.'],
      ], 'keep', '안전장치 해제 압박'),
      ev('85105', 'noise_ear', [24, 60], 0.1, '소음 속에서 오래 일해 귀가 먹먹했다. 귀마개를 바꿨다.', 'health-2 happiness-1', '소음 노출', { dark: true }),
    ],
    hazard: 3, burnout: 0.05,
  }),
  X('85107', {
    entry: [
      E('hire', { minEdu: 'high', ages: [18, 54], p: 0.3, text: '정밀 가공 업체에 입사해 머시닝센터 세팅을 배웠다.' }),
      E('degree', { minEdu: 'high', majors: ['eng'], ages: [17, 40], p: 0.2, text: '특성화 과정에서 CNC 가공을 익혀 공장에 취업했다.' }),
    ],
    transitions: [tr('85101', [24, 56], 2, 0.04, '선반 조작으로 이동'), tr('85104', [24, 56], 2, 0.04, '연삭 조작으로 이동'), tr('85514', [26, 56], 3, 0.03, '공작기계 조립으로 이동')],
    events: [
      ev('85107', 'program_fix', [22, 58], 0.12, '가공 프로그램의 오류를 찾아내 시간을 줄였다. 기술자 인정을 받았다.', 'intellect+2 happiness+2 job+1', '프로그램 오류 수정'),
      ev('85107', 'tool_break', [22, 58], 0.12, '공구가 부러져 가공물이 불량 났다. 원인을 따지는 회의가 길었다.', 'happiness-2 conflict+2 relations-1', '공구 파손 책임 공방', { dark: true }),
      ch('85107', 'skill_cert', [24, 58], 0.11, '기능사 자격 시험 접수가 열렸다. 야근과 공부를 같이 해야 한다.', '어떻게 할까?', [
        ['test', '시험을 본다', 'intellect+2 leisure-3 wealth+1', '몇 달 밤에 책을 봤다. 자격 수당이 붙었다.'],
        ['later', '다음에 미룬다', 'leisure+1 happiness+1 intellect-1', '쉬는 시간을 지켰다. 승급은 한 해 늦춰졌다.'],
      ], 'test', '기능사 시험'),
      ev('85107', 'auto_line', [26, 60], 0.1, '자동화 라인이 들어와 수작업 세팅이 줄고 기능 요구가 달라졌다.', 'job-1 tech+2 intellect+1 happiness-1', '가공 자동화', { dark: true }),
    ],
    hazard: 2, burnout: 0.04,
  }),
];
