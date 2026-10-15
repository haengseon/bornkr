import { X, E, tr, ev, ch } from '../jobs-kit.js';
export default [
  X('22233', {
    entry: [
      E('degree', { minEdu: '4yr', majors: ['eng', 'sci'], ages: [23, 35], p: 0.3, era: [2009, null], text: '앱 개발 직군 공채에 합격해 모바일 팀에 배치됐다.' }),
      E('hire', { minEdu: 'high', ages: [20, 40], p: 0.1, era: [2012, null], text: '포트폴리오 앱을 올려 신입 모바일 개발자로 채용됐다.' }),
    ],
    transitions: [tr('22231', [28, 45], 4, 0.04, '백엔드 개발로 이동'), tr('29554', [28, 42], 4, 0.03, '사용자 경험 설계로'), tr('13502', [35, 50], 8, 0.03, '개발 팀장으로')],
    events: [
      ev('22233', 'store_review', [24, 45], 0.15, '앱 스토어 심사에서 반려가 나와 출시가 이틀 밀렸다.', 'happiness-2 leisure-2 job+2', '앱 심사 반려', { years: [2010, 2100], dark: true }),
      ev('22233', 'os_update', [24, 50], 0.12, '새 OS가 나와 화면이 깨진다는 문의가 몰렸다.', 'leisure-3 intellect+1 tech+2', 'OS 업데이트 대응', { years: [2010, 2100] }),
      ch('22233', 'solo_app', [25, 42], 0.1, '퇴근 후 만든 앱이 작은 수익을 내기 시작했다.', '어떻게 할까?', [['side', '부업으로 계속 키운다', 'wealth+3 leisure-3 health-1', '밤마다 업데이트를 올렸다. 통장에 월 수익이 조금 쌓였다.'], ['hold', '본업에 집중한다', 'leisure+2 wealth-1 job-2', '앱은 그대로 두었다. 주말이 다시 내 것이 됐다.']], 'side', '개인 앱 수익', { once: true, years: [2010, 2100] }),
      ev('22233', 'crunch_launch', [24, 45], 0.1, '출시 전 주에는 매일 막차가 끊긴 뒤 퇴근했다.', 'health-3 leisure-3 job+3', '출시 앞 야근', { dark: true }),
      ev('22233', 'user_thanks', [24, 55], 0.1, '앱 후기에 "덕분에 편해졌다"는 글이 올라왔다.', 'happiness+3 job-2', '이용자 후기', { cd: 5 }),
    ],
    hazard: 0, burnout: 0.07,
  }),
  X('22239', {
    entry: [
      E('degree', { minEdu: '4yr', majors: ['eng', 'sci'], ages: [23, 35], p: 0.3, text: '전산 전공을 살려 업무용 소프트웨어 회사에 입사했다.' }),
      E('hire', { minEdu: '2yr', ages: [22, 40], p: 0.12, text: '실무 교육 과정을 마치고 응용 개발 자리에 채용됐다.' }),
    ],
    transitions: [tr('22231', [28, 45], 4, 0.04, '범용 개발자로'), tr('22291', [28, 45], 4, 0.03, '품질관리 직무로'), tr('13502', [36, 52], 9, 0.03, '개발 관리자로')],
    events: [
      ev('22239', 'legacy_code', [25, 50], 0.14, '십 년 된 코드에 주석 한 줄 없이 수정 요청이 왔다.', 'leisure-2 intellect+1 job+2', '오래된 코드 유지보수'),
      ev('22239', 'customer_bug', [24, 55], 0.14, '고객사에서 새벽에 장애 전화가 왔다. 원인은 설정 오류였다.', 'health-2 happiness-2 conflict+2', '고객사 장애 대응', { dark: true }),
      ch('22239', 'job_offer', [27, 45], 0.1, '연봉을 올려 주겠다는 다른 회사의 제안이 왔다.', '어떻게 할까?', [['go', '옮긴다', 'wealth+3 relations-2 job+2', '인수인계를 마치고 새 회사로 갔다. 낯선 코드 구조를 다시 익혔다.'], ['stay', '남는다', 'relations+2 wealth+1 intellect-1', '남기로 했다. 팀원들과 하던 프로젝트를 이어 갔다.']], 'stay', '이직 제안', { cd: 4 }),
      ev('22239', 'release_done', [24, 55], 0.1, '긴 프로젝트가 납품을 마치고 회식 자리가 마련됐다.', 'happiness+3 relations+2 leisure+1', '프로젝트 납품'),
    ],
    hazard: 0, burnout: 0.06,
  }),
  X('22320', {
    entry: [
      E('degree', { minEdu: '4yr', majors: ['eng', 'sci'], ages: [23, 36], p: 0.25, era: [1998, null], text: '정보보호 전공으로 보안 업체에 입사했다.' }),
      E('license', { license: 'tech', minEdu: '2yr', majors: ['eng'], ages: [22, 40], p: 0.1, years: 1, era: [1998, null], text: '정보보안 자격을 따서 관제 업무로 시작했다.' }),
    ],
    transitions: [tr('22391', [28, 45], 4, 0.04, '디지털 포렌식으로'), tr('22310', [28, 45], 4, 0.03, '네트워크 개발로'), tr('28151', [35, 52], 8, 0.02, '보안 컨설팅으로')],
    events: [
      ev('22320', 'night_alert', [24, 50], 0.15, '관제 화면에 이상 징후 경보가 울려 밤새 로그를 봤다.', 'health-2 leisure-3 tech+1', '보안 경보 대응', { dark: true, years: [1999, 2100] }),
      ev('22320', 'drill_pass', [24, 55], 0.1, '모의 해킹 점검에서 취약점을 먼저 찾아 보고서를 냈다.', 'intellect+2 happiness+2 job-2', '모의 점검 성과', { years: [2002, 2100] }),
      ch('22320', 'patch_delay', [26, 50], 0.12, '긴급 패치를 적용하면 서비스가 잠깐 멈춘다.', '어떻게 할까?', [['now', '바로 적용한다', 'happiness-1 leisure-2 relations-1 tech-2', '점검 창을 당겨 적용했다. 항의가 있었지만 취약점은 막았다.'], ['wait', '정기 점검 때 한다', 'leisure+1 relations+2 tech+1 happiness-2', '일정대로 진행했다. 그 사이 마음이 편치 않았다.']], 'now', '긴급 패치 판단', { years: [2000, 2100] }),
      ev('22320', 'blame_after', [28, 55], 0.09, '사고가 난 뒤 보고서의 책임 소재를 두고 회의가 길어졌다.', 'happiness-3 conflict+3 relations-1', '사고 책임 공방', { dark: true, cd: 5 }),
    ],
    hazard: 0, burnout: 0.08,
  }),
  X('22412', {
    entry: [
      E('degree', { minEdu: '4yr', majors: ['eng', 'sci'], ages: [24, 36], p: 0.25, era: [1990, null], text: '데이터베이스 과목을 살려 시스템 운영 부서에 들어갔다.' }),
      E('promote', { from: ['22231', '22242'], minYears: 3, ages: [28, 45], p: 0.08, text: '개발 경력 뒤 데이터베이스 관리 담당으로 옮겼다.' }),
    ],
    transitions: [tr('22420', [28, 48], 4, 0.04, '데이터 분석가로'), tr('22320', [30, 48], 5, 0.02, '보안 담당으로'), tr('13502', [38, 54], 10, 0.02, 'IT 관리자로')],
    events: [
      ev('22412', 'slow_query', [25, 55], 0.14, '월말 마감 때 쿼리가 느려져 밤새 인덱스를 손봤다.', 'health-2 leisure-3 intellect+1', '월말 성능 장애', { dark: true }),
      ev('22412', 'backup_saved', [25, 58], 0.1, '실수로 지워진 테이블을 백업으로 되살렸다. 감사 인사를 받았다.', 'happiness+3 job-2 relations+1', '백업 복구 성공'),
      ch('22412', 'migration_plan', [28, 52], 0.1, '데이터 이전 작업을 주말 이틀에 몰아서 하자는 안이 나왔다.', '어떻게 할까?', [['weekend', '주말에 몰아서 한다', 'leisure-3 relations-1 tech+2 happiness+1', '이틀 만에 끝났다. 월요일엔 몸이 무거웠다.'], ['split', '한 달에 걸쳐 나눈다', 'leisure+1 intellect+1 job+2 happiness-1', '조금씩 이전했다. 일정은 길어졌고 부담은 나눠졌다.']], 'split', '데이터 이전 일정', { once: true }),
      ev('22412', 'cloud_shift', [30, 55], 0.1, '서버가 클라우드로 옮겨 가며 맡던 장비 업무가 줄었다.', 'intellect+1 happiness-2 tech+3 job+2', '클라우드 전환', { years: [2012, 2100], dark: true, once: true }),
    ],
    hazard: 0, burnout: 0.06,
  }),
  X('22310', {
    entry: [
      E('degree', { minEdu: '4yr', majors: ['eng', 'sci'], ages: [23, 35], p: 0.25, era: [1995, null], text: '네트워크 전공으로 통신 장비 개발사에 입사했다.' }),
      E('hire', { minEdu: '2yr', ages: [22, 38], p: 0.1, era: [1996, null], text: '네트워크 관리 경력을 인정받아 개발 팀에 합류했다.' }),
    ],
    transitions: [tr('22320', [28, 45], 4, 0.04, '정보 보안 직무로'), tr('22231', [28, 45], 4, 0.03, '서버 개발로'), tr('13502', [36, 52], 9, 0.02, '기술 팀장으로')],
    events: [
      ev('22310', 'packet_hunt', [24, 55], 0.14, '패킷 하나가 사라지는 원인을 사흘 만에 찾았다.', 'intellect+2 happiness+2 leisure-1', '장애 원인 추적'),
      ev('22310', 'outage_call', [25, 55], 0.13, '새벽 통화 한 번에 일어나 원격으로 접속했다.', 'health-2 leisure-2 happiness-1', '야간 장애 호출', { dark: true }),
      ch('22310', 'standard_team', [28, 50], 0.1, '표준 기술 회의 파견 요청이 왔다. 출장이 잦아진다.', '어떻게 할까?', [['go', '맡는다', 'intellect+3 leisure-3 relations-1 wealth+1', '해외 회의를 오가며 사람들을 사귀었다. 집에 있는 날이 줄었다.'], ['no', '사양한다', 'leisure+2 relations+1 intellect-1 job+1', '개발에 남았다. 외부 일은 다른 동료가 갔다.']], 'no', '표준 회의 파견', { once: true }),
      ev('22310', 'spec_change', [24, 55], 0.1, '발주처가 규격을 바꿔 한 달 치 작업을 다시 해야 했다.', 'happiness-3 conflict+2 leisure-2', '발주처 규격 변경', { dark: true, cd: 5 }),
    ],
    hazard: 0, burnout: 0.06,
  }),
  X('22241', {
    entry: [
      E('degree', { minEdu: '4yr', majors: ['eng', 'soc', 'hum'], ages: [23, 35], p: 0.3, era: [1996, null], text: '웹 서비스 회사에 기획자로 입사해 화면 설계를 맡았다.' }),
      E('hire', { minEdu: '2yr', ages: [22, 40], p: 0.1, era: [1999, null], text: '운영 경험을 살려 서비스 기획 직무에 채용됐다.' }),
    ],
    transitions: [tr('29554', [27, 45], 3, 0.04, '사용자 경험 디자이너로'), tr('22420', [28, 45], 4, 0.03, '데이터 분석 직무로'), tr('28151', [35, 52], 8, 0.02, '경영 컨설턴트로')],
    events: [
      ev('22241', 'spec_ping_pong', [24, 50], 0.14, '기획서를 세 번 고쳤는데 개발팀과 디자인팀 의견이 달랐다.', 'happiness-2 conflict+3 relations-1', '부서 간 요구 충돌', { dark: true }),
      ev('22241', 'launch_metric', [25, 55], 0.12, '개편한 화면에서 가입 전환율이 눈에 띄게 올랐다.', 'happiness+3 intellect+1 job-2', '개편 성과'),
      ch('22241', 'pivot_request', [28, 50], 0.1, '대표가 서비스 방향을 바꾸자며 기획을 다시 짜라고 했다.', '어떻게 할까?', [['follow', '새 방향대로 다시 쓴다', 'leisure-3 job+1 intellect+2 happiness-1', '밤새 기획서를 새로 썼다. 팀이 다시 속도를 냈다.'], ['argue', '근거를 들어 이견을 낸다', 'conflict+2 happiness+1 intellect+1 relations-1', '데이터를 들고 설득했다. 절반만 받아들여졌다.']], 'follow', '방향 전환 요구', { once: true }),
      ev('22241', 'ai_wireframe', [25, 55], 0.1, '화면 초안을 도구가 몇 분 만에 만들어 내기 시작했다.', 'intellect+1 happiness-1 tech+3', '초안 작성 도구 확산', { years: [2023, 2100], dark: true, once: true }),
    ],
    hazard: 0, burnout: 0.06,
  }),
  X('22510', {
    entry: [
      E('degree', { minEdu: '4yr', majors: ['eng', 'sci'], ages: [23, 36], p: 0.25, era: [1985, null], text: '전산 전공으로 전산실 운영 요원에 채용됐다.' }),
      E('hire', { minEdu: '2yr', ages: [22, 40], p: 0.12, era: [1990, null], text: '자격증을 내세워 시스템 운영 업무에 들어갔다.' }),
    ],
    transitions: [tr('22412', [28, 45], 4, 0.04, '데이터베이스 관리로'), tr('22320', [28, 45], 4, 0.03, '보안 담당으로'), tr('13502', [38, 54], 10, 0.02, 'IT 팀장으로')],
    events: [
      ev('22510', 'night_standby', [24, 55], 0.15, '연휴 동안 당직으로 전산실 호출 대기를 섰다.', 'leisure-3 health-1 wealth+1', '연휴 당직', { dark: true }),
      ev('22510', 'quiet_month', [24, 58], 0.12, '한 달 동안 장애 없이 지나갔다. 운영 보고서가 짧았다.', 'happiness+2 leisure+1', '안정 운영'),
      ch('22510', 'outsource', [30, 55], 0.1, '운영 업무를 외주로 돌린다는 방침이 나왔다.', '어떻게 할까?', [['learn', '관리·감독 업무를 맡는다', 'intellect+2 happiness-1 conflict+1 wealth+1', '외주 업체를 관리하는 일로 바꿨다. 직접 만지는 일이 줄었다.'], ['move', '다른 부서를 알아본다', 'relations-1 job+2 leisure+1 happiness+1', '내부 공고를 보고 지원했다. 낯선 업무가 기다렸다.']], 'learn', '운영 외주화', { once: true, years: [2005, 2100] }),
      ev('22510', 'cert_study', [24, 45], 0.1, '퇴근 후 자격 시험을 준비해 합격 통지를 받았다.', 'intellect+3 leisure-2 happiness+1', '자격 취득', { once: true }),
    ],
    hazard: 0, burnout: 0.05,
  }),
  X('22391', {
    entry: [
      E('degree', { minEdu: '4yr', majors: ['eng', 'sci'], ages: [24, 38], p: 0.2, era: [2005, null], text: '정보보호 전공을 살려 포렌식 업체에서 일을 배웠다.' }),
      E('promote', { from: ['22320', '41112'], minYears: 3, ages: [27, 48], p: 0.06, era: [2005, null], text: '보안·수사 경력으로 포렌식 분석 업무를 맡았다.' }),
    ],
    transitions: [tr('22320', [28, 48], 4, 0.04, '보안 직무로'), tr('28120', [35, 52], 5, 0.01, '법률 자문 분야로'), tr('13502', [38, 54], 10, 0.02, '팀장으로')],
    events: [
      ev('22391', 'image_copy', [25, 55], 0.14, '저장장치를 복제해 분석하는 데 이틀이 걸렸다.', 'leisure-2 intellect+1 tech+1', '증거 복제 작업'),
      ev('22391', 'testify', [28, 58], 0.1, '법정에서 분석 결과를 설명했다. 질문이 오래 이어졌다.', 'happiness-2 intellect+2 conflict+2', '법정 증언', { dark: true }),
      ch('22391', 'private_case', [28, 50], 0.1, '기업에서 비공식 의뢰가 들어왔다. 보수가 좋다.', '어떻게 할까?', [['take', '의뢰를 맡는다', 'wealth+3 happiness-2 conflict+2 leisure-1', '조사를 마쳤지만 결과가 마음에 걸렸다.'], ['pass', '절차대로만 한다', 'wealth-1 happiness+2 intellect+1 job-1', '의뢰는 정식 계약으로만 받겠다고 했다.']], 'pass', '비공식 의뢰', { once: true }),
      ev('22391', 'hard_files', [26, 55], 0.09, '자료 중에 보기 힘든 내용이 섞여 있어 이틀을 쉬었다.', 'happiness-3 health-1', '고된 자료 열람', { dark: true, cd: 5 }),
    ],
    hazard: 0, burnout: 0.09,
  }),
  X('22601', {
    entry: [
      E('degree', { minEdu: '4yr', majors: ['eng'], ages: [22, 35], p: 0.25, text: '통신 장비 회사 현장 기술직으로 입사했다.' }),
      E('license', { license: 'tech', minEdu: '2yr', majors: ['eng'], ages: [20, 40], p: 0.15, years: 1, text: '통신 기사 자격으로 설치·유지보수 업무를 시작했다.' }),
    ],
    transitions: [tr('22310', [28, 45], 5, 0.03, '네트워크 개발로'), tr('23421', [28, 45], 5, 0.02, '전자 분야 개발로'), tr('14111', [38, 55], 10, 0.02, '현장 책임자로')],
    events: [
      ev('22601', 'tower_climb', [22, 50], 0.13, '철탑 위에서 점검하는 날 바람이 세서 작업을 미뤘다.', 'health-2 leisure-1 job+2', '고소 작업 중지', { dark: true }),
      ev('22601', 'storm_restore', [24, 55], 0.12, '태풍 뒤 끊어진 회선을 밤새 복구했다. 수고했다는 말을 들었다.', 'happiness+2 health-2 leisure-2', '재난 복구'),
      ch('22601', 'fiveg_wave', [26, 52], 0.1, '새 규격 장비 교육이 시작됐다. 자격 시험이 따라온다.', '어떻게 할까?', [['study', '야간 교육을 듣는다', 'intellect+3 leisure-3 health-1 job-2', '두 달 동안 교육을 들었다. 새 장비 담당으로 배치됐다.'], ['skip', '기존 장비를 계속 맡는다', 'leisure+2 job+3 intellect-1 happiness+1', '낡은 장비 쪽에 남았다. 일이 서서히 줄었다.']], 'study', '새 규격 교육', { once: true }),
      ev('22601', 'dispatch_cut', [30, 58], 0.09, '유지보수 일부가 협력 업체로 넘어가 팀 인원이 줄었다.', 'wealth-1 happiness-2 job+4', '유지보수 외주 전환', { dark: true, once: true }),
    ],
    hazard: 2, burnout: 0.04,
  }),
  X('22213', {
    entry: [
      E('degree', { minEdu: '4yr', majors: ['eng', 'sci'], ages: [24, 38], p: 0.25, text: '전산 전공으로 시스템 통합 회사 분석 직무에 채용됐다.' }),
      E('promote', { from: ['22231', '22239'], minYears: 4, ages: [28, 48], p: 0.07, text: '개발 경력 뒤 요구사항 분석·설계를 맡게 됐다.' }),
    ],
    transitions: [tr('13502', [36, 52], 8, 0.04, '정보 시스템 관리자로'), tr('28151', [35, 52], 8, 0.02, '컨설턴트로'), tr('22241', [28, 45], 4, 0.03, '서비스 기획으로')],
    events: [
      ev('22213', 'requirement_loop', [26, 52], 0.14, '고객 요구가 회의마다 바뀌어 설계서를 다섯 번 고쳤다.', 'happiness-2 conflict+3 leisure-2', '요구사항 변경', { dark: true }),
      ev('22213', 'clean_design', [26, 55], 0.11, '설계서가 한 번에 통과돼 개발팀에서 고맙다는 말이 나왔다.', 'happiness+3 intellect+1 relations+1', '설계 승인'),
      ch('22213', 'schedule_press', [30, 52], 0.11, '일정이 빠듯하다. 범위를 줄이거나 인원을 늘려야 한다.', '어떻게 할까?', [['cut', '범위를 줄여 설명한다', 'conflict+2 happiness+1 leisure+2 relations-1', '고객이 불만스러워했지만 일정은 지켰다.'], ['add', '인력을 더 요청한다', 'relations+2 leisure-2 happiness-1 wealth+1', '인력이 보충됐다. 인수인계로 매일 설명에 시간을 썼다.']], 'cut', '일정 압박', { once: true }),
      ev('22213', 'audit_review', [30, 58], 0.09, '감리 지적 사항에 답변서를 쓰느라 한 주를 보냈다.', 'leisure-2 intellect+1 conflict+1', '감리 대응', { cd: 5 }),
    ],
    hazard: 0, burnout: 0.05,
  }),
];
