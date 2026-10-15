import { ev, ch } from '../jobs-kit.js';
export default {
  '21112': [
    ev('21112', 'weekend_cells', [26, 58], 0.14, '세포 배양 때문에 주말에도 연구실에 나와 배지를 갈았다.', 'health-2 leisure-3 intellect+1', '주말 실험 유지', { dark: true }),
    ch('21112', 'conference_talk', [28, 58], 0.1, '해외 학회 구두 발표에 초청받았다. 연구비가 빠듯하다.', '어떻게 할까?', [['go', '사비를 보태 다녀온다', 'intellect+3 relations+2 wealth-3 leisure-1', '발표 뒤 공동 연구 제안이 하나 들어왔다.'], ['skip', '이번엔 포스터만 낸다', 'wealth+1 intellect-1 happiness-1', '발표는 동료가 대신 갔다. 논문 작업에 집중했다.']], 'go', '학회 발표 초청', { once: true }),
    ev('21112', 'postdoc_slot', [30, 45], 0.1, '계약 연구원 자리 연장 여부가 결정되지 않아 한 달을 불안하게 보냈다.', 'happiness-3 job+4 wealth-1', '계약직 연구원 불안', { dark: true }),
  ],
  '22231': [
    ev('22231', 'code_review_praise', [24, 50], 0.11, '코드 리뷰에서 구조가 깔끔하다는 칭찬 댓글이 달렸다.', 'happiness+3 intellect+1 relations+1', '코드 리뷰 칭찬'),
    ev('22231', 'layoff_notice', [28, 52], 0.08, '회사가 인력 감축에 들어가 팀이 절반으로 줄었다.', 'happiness-3 job+5 wealth-1', '구조조정', { dark: true, once: true }),
    ch('22231', 'startup_offer', [26, 44], 0.1, '지인이 창업 멤버로 합류해 달라고 연락해 왔다.', '어떻게 할까?', [['join', '합류한다', 'intellect+2 happiness+1 wealth-3 job+2', '월급은 줄었지만 지분 계약서를 받았다.'], ['stay', '지금 회사에 남는다', 'wealth+1 relations+1 happiness-1', '지금 회사에 남았다. 안정은 그대로였다.']], 'stay', '창업 합류 제안', { once: true }),
  ],
  '22234': [
    ev('22234', 'patch_flame', [24, 45], 0.14, '업데이트 뒤 커뮤니티에 비난 글이 이어져 사과문을 썼다.', 'happiness-3 relations-1 conflict+2', '이용자 비난', { dark: true }),
    ev('22234', 'jam_prize', [22, 40], 0.09, '게임 잼에서 만든 작은 게임이 입상해 팀이 기뻐했다.', 'happiness+4 relations+2 intellect+1', '게임 잼 입상', { once: true }),
    ch('22234', 'indie_leap', [26, 42], 0.1, '회사를 나와 독립 개발을 해 볼 수 있는 시점이다.', '어떻게 할까?', [['indie', '독립 개발을 시작한다', 'happiness+2 intellect+2 wealth-3 job+2', '저축을 헐며 첫 프로토타입을 만들었다.'], ['stay', '회사에 남는다', 'wealth+1 leisure-1 happiness-1', '야근은 이어졌지만 급여는 안정적이었다.']], 'stay', '독립 개발 결심', { once: true }),
  ],
  '22242': [
    ev('22242', 'agency_squeeze', [24, 45], 0.13, '하도급 단가가 내려 같은 일을 더 적은 인원으로 해야 했다.', 'happiness-2 wealth-1 leisure-2 job+2', '하도급 단가 압박', { dark: true }),
    ch('22242', 'freelance_gig', [26, 45], 0.1, '프리랜서로 일하면 단가를 높일 수 있다는 제의를 받았다.', '어떻게 할까?', [['free', '프리랜서로 전환한다', 'wealth+3 job+3 relations-1', '단가는 올랐지만 다음 계약을 늘 걱정했다.'], ['stay', '정규직으로 남는다', 'job-1 wealth-1 happiness+1', '월급은 그대로였다. 퇴직금과 보험이 있었다.']], 'stay', '프리랜서 전환 제의', { once: true }),
    ev('22242', 'junior_mentor', [28, 55], 0.1, '신입 개발자에게 알려 준 방식이 팀 표준이 됐다.', 'happiness+3 relations+2 intellect+1', '신입 멘토링'),
  ],
  '22291': [
    ev('22291', 'night_regression', [24, 50], 0.13, '출시 전날 밤 회귀 테스트 목록을 끝까지 돌렸다.', 'health-2 leisure-3 job+1', '출시 전 야간 테스트', { dark: true }),
    ev('22291', 'critical_found', [24, 55], 0.1, '출시 직전 치명적인 결함을 찾아 개발팀이 박수를 쳤다.', 'happiness+3 relations+2 intellect+1', '치명 결함 발견'),
    ch('22291', 'hold_release', [28, 52], 0.1, '결함이 남았지만 일정 때문에 출시를 강행하자는 말이 나왔다.', '어떻게 할까?', [['block', '출시 보류 의견을 낸다', 'conflict+3 happiness+1 relations-2 intellect+1', '보류 의견을 문서로 남겼다. 회의 분위기가 무거웠다.'], ['note', '결함 기록 후 진행한다', 'relations+1 happiness-2 leisure+1', '결함 목록을 남기고 출시했다. 마음이 불편했다.']], 'block', '출시 보류 판단', { once: true }),
  ],
  '22420': [
    ev('22420', 'dashboard_use', [25, 55], 0.11, '내가 만든 대시보드를 영업팀이 매일 아침 보게 됐다.', 'happiness+3 relations+1 intellect+1', '대시보드 활용'),
    ev('22420', 'forced_number', [27, 55], 0.12, '결론을 정해 놓고 숫자를 맞춰 달라는 요청을 받았다.', 'happiness-3 conflict+3 intellect-1', '결론 끼워 맞추기 요구', { dark: true }),
    ch('22420', 'model_offer', [28, 48], 0.1, '새 모델 프로젝트를 맡으면 정시 퇴근이 어려워진다.', '어떻게 할까?', [['take', '프로젝트를 맡는다', 'intellect+3 wealth+1 leisure-3 health-1', '몇 달간 야근이 이어졌지만 모델이 성과를 냈다.'], ['pass', '지금 업무를 지킨다', 'leisure+2 intellect-1 job+1', '업무는 그대로였다. 새 일은 다른 팀원이 가져갔다.']], 'take', '모델 프로젝트 제안', { once: true }),
  ],
  '23123': [
    ev('23123', 'scaffold_check', [24, 55], 0.12, '비계 점검에서 안전 난간이 빠진 곳을 찾아 작업을 멈췄다.', 'conflict+2 happiness-1 relations-1', '비계 안전 점검', { dark: true }),
    ev('23123', 'concrete_night', [24, 52], 0.12, '타설이 밤까지 이어져 새벽에야 현장을 나왔다.', 'health-2 leisure-3 job+1', '야간 타설', { dark: true }),
    ev('23123', 'completion_party', [27, 60], 0.1, '준공 행사에서 시공 담당으로 소개되고 박수를 받았다.', 'happiness+4 relations+2', '준공 행사', { cd: 5 }),
  ],
  '23421': [
    ev('23421', 'shift_pattern', [24, 50], 0.13, '3교대 근무 주기가 바뀌어 몸이 적응하는 데 몇 주가 걸렸다.', 'health-3 leisure-2', '교대 근무 변경', { dark: true }),
    ev('23421', 'process_award', [26, 52], 0.1, '공정 개선 아이디어가 채택돼 사내 포상을 받았다.', 'happiness+3 wealth+1 intellect+1', '공정 개선 포상', { once: true }),
    ch('23421', 'transfer_site', [27, 48], 0.1, '새 공장 라인 증설에 파견 요청이 들어왔다.', '어떻게 할까?', [['go', '파견을 간다', 'wealth+3 intellect+2 relations-3 leisure-1', '타지에서 몇 달 지냈다. 새 라인이 안정됐다.'], ['stay', '기존 라인에 남는다', 'relations+2 leisure+1 wealth-1 job+1', '가족과 지내며 기존 라인을 지켰다.']], 'stay', '라인 증설 파견', { once: true }),
  ],
  '23516': [
    ev('23516', 'recall_review', [26, 55], 0.1, '부품 문제로 시장 조치 회의가 열려 몇 주 동안 원인 분석에 매달렸다.', 'health-1 happiness-3 leisure-2', '부품 이슈 대응', { dark: true }),
    ev('23516', 'test_drive', [25, 55], 0.12, '새 모델 시험 주행에서 목표 성능이 처음 나왔다.', 'happiness+4 intellect+1 relations+1', '시험 주행 성과'),
    ch('23516', 'supplier_pick', [28, 52], 0.1, '협력 업체 둘 중 하나를 골라야 한다. 값과 품질이 다르다.', '어떻게 할까?', [['cheap', '값이 낮은 업체를 쓴다', 'wealth+1 conflict+2 happiness-1 intellect-1', '비용은 줄였지만 샘플 검수가 길어졌다.'], ['quality', '품질이 좋은 업체를 쓴다', 'intellect+1 happiness+1 conflict+1 wealth-2', '비용 승인을 받는 데 설득이 필요했다.']], 'quality', '협력 업체 선정', { once: true }),
  ],
  '23811': [
    ev('23811', 'jetlag_chain', [28, 58], 0.14, '시차가 다른 노선을 연달아 비행해 몸의 리듬이 흐트러졌다.', 'health-3 leisure-2 happiness-1', '시차 누적', { dark: true }),
    ev('23811', 'captain_upgrade', [32, 55], 0.1, '기장 승급 심사를 통과해 왼쪽 좌석에 앉게 됐다.', 'happiness+4 wealth+2 job-2', '기장 승급', { once: true }),
    ch('23811', 'schedule_bid', [28, 58], 0.12, '다음 달 스케줄 신청에서 휴일과 수당 중 하나를 고른다.', '어떻게 할까?', [['rest', '휴일이 많은 편성', 'leisure+3 relations+2 wealth-2', '가족과 보낼 시간이 늘었다. 수당은 줄었다.'], ['pay', '수당이 많은 편성', 'wealth+3 leisure-2 health-1 relations-1', '비행이 많아 수당이 쌓였다. 집에 있는 날은 줄었다.']], 'rest', '스케줄 신청', { cd: 4 }),
  ],
  '23951': [
    ev('23951', 'cad_cert', [22, 45], 0.1, '새 설계 프로그램 자격 시험에 합격해 담당 범위가 넓어졌다.', 'intellect+3 happiness+2 job-2', '자격 취득', { once: true }),
    ev('23951', 'cheap_cad', [26, 58], 0.09, '자동 도면 도구가 나와 외주 단가가 내려갔다.', 'wealth-2 happiness-2 job+3 tech+3', '도면 단가 하락', { dark: true, once: true, years: [2015, 2100] }),
    ch('23951', 'freelance_drawing', [28, 55], 0.1, '여러 사무소에서 도면 외주를 받아 달라는 요청이 왔다.', '어떻게 할까?', [['free', '개인 외주를 겸한다', 'wealth+3 leisure-3 health-1', '퇴근 후 외주 도면을 그렸다. 수입이 늘었다.'], ['firm', '본업만 한다', 'leisure+2 wealth-1 happiness+1', '본업에 집중했다. 저녁 시간이 남았다.']], 'firm', '외주 요청', { once: true }),
  ],
  '24113': [
    ev('24113', 'parent_complaint', [30, 62], 0.12, '진료 대기가 길다며 보호자가 큰 소리로 항의했다.', 'happiness-3 conflict+2 relations-1', '보호자 항의', { dark: true }),
    ev('24113', 'child_hug', [28, 65], 0.1, '낫고 나서 인사하러 온 아이가 그림을 건네고 갔다.', 'happiness+4 relations+2', '아이의 인사', { cd: 5 }),
    ch('24113', 'night_clinic', [32, 58], 0.1, '밤에 열이 오른 아이를 보는 야간 진료를 열자는 제안이 왔다.', '어떻게 할까?', [['open', '야간 진료를 연다', 'wealth+3 leisure-3 health-2 relations+1', '야간 환자가 늘었다. 가족과의 저녁이 줄었다.'], ['day', '낮 진료만 한다', 'leisure+2 health+1 wealth-1 relations-1', '낮에만 환자를 봤다. 야간 응급실이 붐볐다.']], 'day', '야간 진료 결정', { once: true, who: 'self' }),
  ],
  '24120': [
    ev('24120', 'night_duty', [28, 55], 0.13, '야간 당직 중 새벽 응급 환자가 이어져 한숨도 못 잤다.', 'health-3 leisure-2', '야간 당직', { dark: true }),
    ev('24120', 'regular_thanks', [30, 68], 0.11, '오래 다닌 환자가 건강검진 결과가 좋다며 고맙다고 했다.', 'happiness+3 relations+2', '단골 환자의 인사'),
    ch('24120', 'partner_clinic', [34, 58], 0.1, '동료가 공동 개원을 제안했다. 부담과 자율이 함께 온다.', '어떻게 할까?', [['join', '공동 개원한다', 'wealth+1 happiness+1 leisure-2 debt+4000', '임대 보증금을 나눠 냈다. 의사 둘이 환자를 나눠 봤다.'], ['stay', '지금 자리에 남는다', 'leisure+1 relations+1 wealth-1', '월급을 받으며 현재 진료를 이어 갔다.']], 'stay', '공동 개원 제안', { once: true }),
  ],
  '24142': [
    ev('24142', 'implant_case', [30, 62], 0.1, '어려운 임플란트 치료가 끝나고 환자가 처음 크게 웃었다.', 'happiness+4 relations+1', '치료 후 환자 웃음'),
    ev('24142', 'price_war', [32, 62], 0.12, '근처 치과가 치료비를 크게 내려 환자가 줄었다.', 'wealth-3 happiness-2 conflict+1', '치료비 경쟁', { dark: true }),
    ch('24142', 'equipment_buy', [32, 58], 0.1, '새 촬영 장비를 들이면 진료는 정밀해지지만 빚이 는다.', '어떻게 할까?', [['buy', '장비를 들인다', 'intellect+2 wealth-3 happiness+1 debt+4000', '진료 범위가 넓어졌다. 대출 상환 일정을 잡았다.'], ['old', '기존 장비로 간다', 'wealth+1 intellect-1 leisure+1', '기존 장비로 진료했다. 일부 환자는 다른 곳으로 갔다.']], 'old', '장비 투자', { once: true, who: 'self' }),
  ],
  '24312': [
    ev('24312', 'regular_elder', [26, 65], 0.12, '약을 받으러 오던 어르신이 복약 설명이 쉬워 좋다고 하셨다.', 'happiness+3 relations+2', '단골 어르신'),
    ev('24312', 'out_of_stock', [26, 62], 0.11, '약 품절이 이어져 대체 약을 설명하느라 하루가 지나갔다.', 'happiness-2 conflict+2 leisure-1', '의약품 수급 불안', { dark: true }),
    ch('24312', 'chain_offer', [30, 55], 0.1, '큰 약국 체인에서 근무 제안이 왔다.', '어떻게 할까?', [['go', '옮긴다', 'wealth+3 relations-2 leisure-1', '급여는 늘었지만 단골 손님과 멀어졌다.'], ['stay', '남는다', 'relations+2 wealth-1 happiness+1', '지금 약국에 남았다. 손님 이름을 외우는 재미가 있었다.']], 'stay', '체인 약국 제안', { once: true }),
    ev('24312', 'near_miss', [25, 60], 0.09, '비슷한 이름의 약이 섞일 뻔한 것을 조제 전에 찾았다.', 'happiness-2 intellect+1 medical+1', '조제 중 확인', { dark: true, cd: 5 }),
  ],
  '24402': [
    ev('24402', 'patient_thanks', [24, 58], 0.12, '퇴원하는 환자 가족이 병동에 손편지를 남기고 갔다.', 'happiness+4 relations+1', '환자 가족의 편지'),
    ev('24402', 'verbal_abuse', [24, 55], 0.13, '보호자가 간호사실에서 큰 소리로 폭언을 이어 갔다.', 'happiness-3 health-1 conflict+2', '보호자 폭언', { dark: true }),
    ch('24402', 'unit_move', [26, 50], 0.1, '중환자실에서 사람을 구한다. 강도는 높지만 배울 것이 많다.', '어떻게 할까?', [['icu', '중환자실로 옮긴다', 'intellect+3 wealth+1 health-2 leisure-2', '밤낮 없이 배웠다. 전문 기술이 늘었다.'], ['ward', '현재 병동에 남는다', 'leisure+1 relations+1 intellect-1', '익숙한 병동에 남았다. 동료들이 반겼다.']], 'ward', '부서 이동 제안', { once: true }),
    ev('24402', 'short_staff', [24, 55], 0.1, '두 명이 결근해 환자 열 명을 혼자 돌봐야 했다.', 'health-2 happiness-2 leisure-1', '인력 부족', { dark: true, cd: 5 }),
  ],
  '24661': [
    ev('24661', 'walk_again', [23, 58], 0.12, '오래 누워 있던 환자가 두 발로 서서 걸음을 뗐다.', 'happiness+4 relations+1', '보행 재활 성공'),
    ev('24661', 'hand_strain', [26, 60], 0.12, '손목과 허리에 무리가 와 일주일간 치료를 쉬었다.', 'health-3 wealth-1', '치료사 근골격 부담', { dark: true }),
    ch('24661', 'cert_course', [26, 50], 0.1, '전문 치료 자격 과정이 열렸다. 수강료와 주말 시간이 필요하다.', '어떻게 할까?', [['learn', '과정을 듣는다', 'intellect+3 wealth-2 leisure-3', '주말마다 교육장에 갔다. 새 치료 기법을 익혔다.'], ['skip', '이번엔 넘긴다', 'leisure+2 wealth+1 intellect-1', '교육은 미뤘다. 쉬는 주말을 지켰다.']], 'skip', '전문 치료 과정', { once: true }),
  ],
  '24912': [
    ev('24912', 'transport_thanks', [22, 55], 0.1, '이송한 환자의 가족이 센터에 감사 인사를 전하러 왔다.', 'happiness+4 relations+2', '이송 환자 가족의 인사'),
    ev('24912', 'abusive_patient', [22, 52], 0.12, '술에 취한 환자가 이송 중 욕설을 이어 가 대원들이 지쳤다.', 'happiness-3 health-1 conflict+2', '이송 중 욕설', { dark: true }),
    ch('24912', 'transfer_station', [24, 48], 0.1, '출동이 적은 소규모 센터로 옮길 수 있는 기회가 생겼다.', '어떻게 할까?', [['move', '센터를 옮긴다', 'health+2 leisure+2 intellect-1 relations-1', '출동이 줄어 쉬는 시간이 생겼다. 현장 감각은 둔해졌다.'], ['stay', '지금 센터에 남는다', 'intellect+2 health-2 relations+1', '바쁜 센터에서 경험을 계속 쌓았다.']], 'stay', '센터 이동', { once: true }),
  ],
  '24950': [
    ev('24950', 'wage_gap', [22, 58], 0.12, '같은 일을 하는데 병원마다 급여 차이가 크다는 이야기를 들었다.', 'happiness-2 wealth-1 fairness+2', '병원 간 급여 차이', { dark: true }),
    ev('24950', 'regular_patient', [22, 60], 0.11, '자주 오는 환자가 내 이름을 기억하고 인사했다.', 'happiness+3 relations+2', '환자의 인사'),
    ch('24950', 'hospital_move', [24, 50], 0.1, '요양병원에서 급여를 더 주겠다고 한다. 근무는 야간이 많다.', '어떻게 할까?', [['go', '옮긴다', 'wealth+3 health-2 leisure-2', '급여는 늘었다. 야간 근무로 생활 리듬이 바뀌었다.'], ['stay', '의원에 남는다', 'leisure+2 relations+1 wealth-1', '출퇴근 시간이 일정한 곳에서 계속 일했다.']], 'stay', '요양병원 이직', { once: true }),
  ],
};
