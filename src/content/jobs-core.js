// 핵심 150 직업의 진입 경로·전직 규칙·고유 사건 (GDD §10.5, 원천 R09-core150.csv). 콘텐츠: 직업 DB.
// 사건 DSL은 ARCHITECTURE §8. 문구는 덤덤한 평서문, 실존 기업·인물명 없음, 직업 명칭으로 삶의 승패를 가르지 않는다.
// 진입 경로 문구는 제도 일반론(R09 §6.4 연구자 정리)이라 법령 세부 숫자를 쓰지 않는다. 엔진 해석은 docs/impl/jobs-notes.md.

import { EXTRA, MORE } from './jobs-extra.js';

const S = ['R09.S1'];
// 진입 경로. type: exam(공채·고시, p=연 합격률, years=준비 연한) | license | degree | hire | inherit | self | platform | promote(from=코드[], minYears)
// era:[from,to] = 달력 연도 범위(시대 조건). 그 밖의 필드는 GDD §10.5 그대로.
const E = (type, o) => ({ type, ...o, src: S });
// 전직 규칙: 연 1회 평가. to=직업 코드.
const tr = (to, ages, minYears, p, reason) => ({ to, ages, minYears, p, reason });
// 해당 직업으로 일하는 동안에만 발생. A 코드(직업군인)는 status 'military'도 허용.
const ACTIVE = ['employed', 'self', 'military'];
const on = code => L => L.job?.code === code && ACTIVE.includes(L.job.status);
const onSelf = code => L => L.job?.code === code && L.job.status === 'self';
const onWage = code => L => L.job?.code === code && (L.job.status === 'employed' || L.job.status === 'military');
// 사건: id 'job.{code}.{slug}', tags ['job']. 나머지는 ARCHITECTURE §8 필드.
const ev = (code, slug, e) => ({ id: `job.${code}.${slug}`, tags: ['job'], when: on(code), ...e });
// 핵심 직업 한 건. shared = 같은 소분류 묶음 키('minor:' + jobs.js minor).
const J = (code, minor, o) => ({ code, shared: `minor:${minor}`, ...o });

const BASE = [
  // ───────── A 군인 ─────────
  J('A0120', '장교', {
    entry: [
      E('exam', { minEdu: '4yr', ages: [20, 28], p: 0.3, years: 0, text: '사관학교나 학군단, 학사장교 과정을 거쳐 소위로 임관했다.' }),
    ],
    transitions: [
      tr('35290', [38, 50], 10, 0.03, '전역 후 공무원 경력 채용'),
      tr('41112', [30, 45], 5, 0.02, '경찰 경력 채용'),
      tr('12121', [45, 56], 15, 0.05, '전역 후 기업 총무·안전 담당'),
    ],
    events: [
      ev('A0120', 'transfer', {
        ages: [25, 45], p: 0.15, cooldown: 3,
        text: '근무지 이동 명령이 나왔다. 아이는 학기 중이다.',
        choice: {
          prompt: '가족은 어떻게 할까?',
          options: [
            { id: 'together', label: '함께 이사한다', fx: { stats: { relations: 3, wealth: -1, leisure: -2 } }, result: '짐을 다시 쌌고, 아이가 새 학교에 적응하는 데 한 학기가 걸렸다.' },
            { id: 'alone', label: '혼자 내려간다', fx: { stats: { wealth: 2, relations: -3, happiness: -2 } }, result: '주말마다 이동하는 생활이 시작됐다.' },
          ],
          default: 'together',
        },
        reason: '근무지 이동',
      }),
      ev('A0120', 'promotion_cut', {
        ages: [32, 48], p: 0.11, once: true,
        text: '진급 심사 결과가 나왔다. 이번에도 이름이 없었다.',
        fx: { stats: { happiness: -3 }, issues: { job: 6 } }, reason: '진급 누락',
      }),
    ],
    hazard: 2, burnout: 0.04,
  }),
  J('A0300', '부사관', {
    entry: [
      E('hire', { minEdu: 'high', ages: [18, 27], p: 0.35, text: '부사관 모집에 지원해 합격했고 하사로 임관했다.' }),
    ],
    transitions: [
      tr('A0200', [38, 50], 12, 0.05, '준사관 선발'),
      tr('41231', [45, 58], 10, 0.04, '전역 후 경비·보안 업체'),
      tr('35290', [35, 48], 8, 0.02, '전역 후 공무원 채용'),
    ],
    events: [
      ev('A0300', 'long_service', {
        ages: [24, 33], p: 0.21, once: true,
        text: '장기복무 심사 시기가 왔다. 전역하고 다른 일을 알아볼 수도 있다.',
        choice: {
          prompt: '어떻게 할까?',
          options: [
            { id: 'stay', label: '장기복무 지원', fx: { stats: { happiness: 2, wealth: 2, leisure: -2 }, issues: { job: -4 } }, result: '장기복무에 선발됐다. 숙소와 연금이 앞으로의 계획에 들어왔다.' },
            { id: 'leave', label: '전역 후 준비', fx: { stats: { leisure: 2, wealth: -3, happiness: -1 }, issues: { job: 5 } }, result: '전역 날짜를 정하고 자격증 공부를 시작했다.' },
          ],
          default: 'stay',
        },
        reason: '장기복무 선택',
      }),
      ev('A0300', 'cold_drill', {
        ages: [20, 45], p: 0.09, cooldown: 4,
        text: '혹한기 훈련 중 무릎을 다쳤다. 군 병원에서 치료를 받았다.',
        fx: { stats: { health: -3, leisure: -1 }, issues: { medical: 3 } }, reason: '훈련 중 부상',
      }),
    ],
    hazard: 2, burnout: 0.03,
  }),
  J('A0900', '기타 군인', {
    entry: [
      E('hire', { minEdu: 'none', ages: [18, 28], p: 0, text: '병은 병역 의무로 입대한다. 직업 배정이 아니라 군 복무 시스템에서 처리한다.' }),
    ],
    transitions: [
      tr('A0300', [20, 24], 0, 0.03, '복무 중 부사관 지원'),
    ],
    events: [
      ev('A0900', 'first_leave', {
        when: L => L.mil?.status === 'serving' || on('A0900')(L),
        ages: [19, 28], p: 0.3, once: true,
        text: '첫 휴가를 나왔다. 사흘이 순식간에 지나갈 것 같다.',
        choice: {
          prompt: '휴가를 어떻게 보낼까?',
          options: [
            { id: 'family', label: '집에서 쉰다', fx: { stats: { relations: 2, health: 1, leisure: 1 } }, result: '집밥을 먹고 오래 잤다. 부대로 돌아가는 길이 길게 느껴졌다.' },
            { id: 'friends', label: '친구를 만난다', fx: { stats: { relations: 3, happiness: 2, wealth: -1 } }, result: '친구들과 밤늦게까지 이야기했다. 용돈이 금방 바닥났다.' },
            { id: 'part', label: '아르바이트한다', fx: { stats: { wealth: 2, leisure: -2, happiness: -1 } }, result: '짧은 일을 하고 돈을 조금 모았다.' },
          ],
          default: 'family',
        },
        reason: '첫 휴가',
      }),
      ev('A0900', 'discharge_plan', {
        when: L => L.mil?.status === 'serving' || on('A0900')(L),
        ages: [20, 29], p: 0.25, once: true,
        text: '전역이 몇 달 남았다. 복학, 취업, 일 사이에서 계획이 갈린다.',
        choice: {
          prompt: '전역 후에는?',
          options: [
            { id: 'school', label: '복학 준비', fx: { stats: { intellect: 3, wealth: -2, leisure: 1 }, issues: { edu: -2 } }, result: '학교 일정과 학자금 신청 날짜를 미리 확인해 두었다.' },
            { id: 'work', label: '일부터 구한다', fx: { stats: { wealth: 2, leisure: -2, happiness: -1 }, issues: { job: 2 } }, result: '전역 전에 지원서를 몇 군데 보냈다.' },
          ],
          default: 'school',
        },
        reason: '전역 후 계획',
      }),
    ],
    hazard: 2,
  }),

  // ───────── 1 관리자 ─────────
  J('11121', '의회 의원‧고위 공무원 및 공공단체 임원', {
    entry: [
      E('exam', { minEdu: '4yr', majors: ['soc'], ages: [24, 34], p: 0.05, years: 3, text: '5급 공개경쟁 시험에 합격해 사무관으로 임용됐다.' }),
      E('promote', { from: ['27210', '35290'], minYears: 20, ages: [48, 58], p: 0.08, text: '오랜 근속 끝에 고위직 승진 대상에 올랐다.' }),
    ],
    transitions: [
      tr('11201', [53, 62], 20, 0.03, '퇴직 후 기업 경영진 합류'),
      tr('28151', [52, 62], 20, 0.03, '퇴직 후 컨설턴트'),
      tr('26113', [50, 60], 20, 0.02, '퇴직 후 대학 교수'),
    ],
    events: [
      ev('11121', 'audit_night', {
        ages: [35, 58], p: 0.15, cooldown: 3,
        text: '국회 자료 요구가 몰려 사무실에서 밤을 새운 날이 길어졌다.',
        fx: { stats: { health: -3, leisure: -4, relations: -1 } }, reason: '국회 업무 야근',
      }),
      ev('11121', 'after_career', {
        ages: [50, 60], p: 0.15, once: true,
        text: '승진 경쟁에서 밀렸다. 공직 이후를 생각하게 됐다.',
        choice: {
          prompt: '앞으로를 어떻게 준비할까?',
          options: [
            { id: 'outside', label: '민간 자리 탐색', fx: { stats: { wealth: 3, relations: -1 }, issues: { job: 3 } }, result: '아는 사람들을 만나 민간 쪽 이야기를 들었다.' },
            { id: 'stay', label: '끝까지 남는다', fx: { stats: { happiness: 1, leisure: -2 }, issues: { job: 4 } }, result: '남은 보직에서 일을 마무리하는 데 집중했다.' },
          ],
          default: 'stay',
        },
        reason: '공직 이후 준비',
      }),
    ],
    burnout: 0.05,
  }),
  J('11201', '기업 대표 및 기업 고위 임원', {
    entry: [
      E('inherit', { ages: [33, 60], p: 0.06, text: '부모가 하던 회사를 물려받아 대표가 됐다.' }),
      E('self', { minEdu: 'none', ages: [28, 55], p: 0.04, text: '직접 회사를 세워 대표 자리에 앉았다.' }),
      E('promote', { from: ['11202', '12121', '15111'], minYears: 12, ages: [45, 60], p: 0.05, text: '경영진을 거쳐 대표 자리에 올랐다.' }),
    ],
    transitions: [
      tr('11202', [55, 65], 10, 0.03, '대표에서 고문으로 물러남'),
      tr('28151', [58, 72], 15, 0.04, '경영에서 물러나 자문'),
    ],
    events: [
      ev('11201', 'cashflow', {
        ages: [30, 70], p: 0.12, cooldown: 4,
        text: '거래처 대금이 늦어져 월말 자금이 모자란다. 월급날은 정해져 있다.',
        choice: {
          prompt: '어떻게 메울까?',
          options: [
            { id: 'loan', label: '개인 대출로 메운다', fx: { stats: { wealth: -2, happiness: -1, leisure: 1 }, issues: { job: 2 }, money: { debt: 3000 } }, result: '월급은 제날짜에 나갔고, 이자는 내가 냈다.' },
            { id: 'talk', label: '거래처와 협의', fx: { stats: { relations: -3, happiness: -1, leisure: -1 }, issues: { conflict: 3 } }, result: '며칠 통화한 끝에 대금이 들어왔다. 거래처와는 서먹해졌다.' },
          ],
          default: 'loan',
        },
        reason: '회사 자금 압박',
      }),
      ev('11201', 'succession', {
        ages: [55, 80], p: 0.11, once: true,
        text: '후계 문제로 가족 안에서 말이 오갔다. 결론은 나지 않았다.',
        fx: { stats: { relations: -2, happiness: -2 }, issues: { conflict: 3 } }, reason: '후계 문제',
      }),
    ],
    burnout: 0.04,
  }),
  J('12121', '행정 및 경영 지원 관리자', {
    entry: [
      E('promote', { from: ['37101', '31210', '31110'], minYears: 8, ages: [38, 52], p: 0.12, text: '총무·인사 실무를 오래 해 팀을 이끄는 자리로 옮겼다.' }),
      E('hire', { minEdu: '4yr', majors: ['soc'], ages: [35, 50], p: 0.03, text: '경력 채용으로 지원 부서 관리자가 됐다.' }),
    ],
    transitions: [
      tr('28111', [40, 55], 5, 0.01, '노무사 자격을 따서'),
      tr('28113', [42, 56], 8, 0.01, '헤드헌터로 독립'),
      tr('11202', [50, 58], 15, 0.02, '경영진 합류'),
    ],
    events: [
      ev('12121', 'restructure', {
        ages: [40, 58], p: 0.12, once: true,
        text: '사업 재편으로 감원 대상 명단이 내려왔다. 이름은 다 아는 사람들이다.',
        choice: {
          prompt: '어떻게 정리할까?',
          options: [
            { id: 'rule', label: '기준대로 정리', fx: { stats: { happiness: -4, relations: -3, leisure: 1 }, issues: { conflict: 2 } }, result: '기준표대로 명단을 넘겼다. 며칠 동안 복도에서 눈을 피했다.' },
            { id: 'voluntary', label: '희망퇴직을 먼저', fx: { stats: { happiness: -1, leisure: -2, relations: 1 }, issues: { conflict: 1 } }, result: '면담이 길어졌고 야근이 늘었다. 명단은 줄어 있었다.' },
          ],
          default: 'rule',
        },
        reason: '감원 명단 작성',
      }),
      ev('12121', 'year_end_review', {
        ages: [38, 58], p: 0.12, cooldown: 3,
        text: '연말 평가 면담이 이어졌다. 점수 하나로 한 해를 말해야 했다.',
        fx: { stats: { happiness: -2, leisure: -2 } }, reason: '연말 평가 면담',
      }),
    ],
    burnout: 0.05,
  }),
  J('14111', '건설‧전기 및 생산 관련 관리자', {
    entry: [
      E('promote', { from: ['23123'], minYears: 10, ages: [38, 55], p: 0.1, text: '시공 기술자 경력으로 현장소장이 됐다.' }),
      E('hire', { minEdu: '4yr', majors: ['eng'], ages: [34, 50], p: 0.05, text: '건축·토목 경력으로 현장소장 채용에 붙었다.' }),
    ],
    transitions: [
      tr('23122', [50, 62], 10, 0.03, '감리 기술자로 이직'),
      tr('23631', [50, 62], 10, 0.03, '산업안전 관리로 이직'),
    ],
    events: [
      ev('14111', 'site_accident', {
        ages: [35, 60], p: 0.09, cooldown: 5,
        text: '현장에서 작업자가 다치는 사고가 났다. 사고 조사와 보고가 이어졌다.',
        fx: { stats: { happiness: -4, health: -2 }, issues: { job: 4 } }, reason: '현장 사고 조사',
      }),
      ev('14111', 'schedule_squeeze', {
        ages: [35, 60], p: 0.14, cooldown: 3,
        text: '공기가 밀렸다. 본사는 만회 계획을 요구한다.',
        choice: {
          prompt: '어떻게 대응할까?',
          options: [
            { id: 'night', label: '야간 작업 늘림', fx: { stats: { health: -3, leisure: -3, wealth: 1 }, issues: { job: -2 } }, result: '공정은 따라잡았지만 현장 사람들의 얼굴이 많이 굳었다.' },
            { id: 'extend', label: '공기 연장 요청', fx: { stats: { relations: -1, leisure: 1 }, issues: { job: 3 } }, result: '본사와 회의가 길어졌다. 일정은 조금 늘었다.' },
          ],
          default: 'night',
        },
        reason: '공기 압박',
      }),
    ],
    hazard: 3, burnout: 0.06,
  }),
  J('15111', '판매 및 운송 관리자', {
    entry: [
      E('promote', { from: ['51011', '51022', '51012', '51029'], minYears: 8, ages: [33, 50], p: 0.12, text: '영업 실적을 쌓아 팀을 이끄는 자리를 맡았다.' }),
    ],
    transitions: [
      tr('11201', [45, 58], 12, 0.02, '독립해 회사를 차려'),
      tr('52111', [45, 60], 8, 0.03, '퇴직 후 가게를 인수'),
    ],
    events: [
      ev('15111', 'quota', {
        ages: [33, 58], p: 0.14, cooldown: 3,
        text: '분기 목표가 올랐다. 팀원들은 이미 지쳐 있다.',
        choice: {
          prompt: '팀을 어떻게 이끌까?',
          options: [
            { id: 'lead', label: '직접 영업에 뛴다', fx: { stats: { health: -2, leisure: -3, wealth: 1 }, issues: { job: -2 } }, result: '직접 거래처를 돌았다. 팀원들은 아무 말 없이 따라왔다.' },
            { id: 'adjust', label: '목표 조정 요청', fx: { stats: { relations: 1, happiness: -1 }, issues: { job: 3 } }, result: '상부에 근거를 설명했고, 목표가 일부만 조정됐다.' },
          ],
          default: 'lead',
        },
        reason: '영업 목표 압박',
      }),
      ev('15111', 'client_dinner', {
        ages: [33, 58], p: 0.12, cooldown: 3,
        text: '거래처 접대 자리가 이어져 평일 저녁이 거의 남지 않았다.',
        fx: { stats: { health: -2, leisure: -3, relations: 1 } }, reason: '거래처 접대',
      }),
    ],
    burnout: 0.06,
  }),
  J('15220', '고객 서비스 관리자', {
    entry: [
      E('promote', { from: ['45311', '45110', '45312'], minYears: 6, ages: [28, 50], p: 0.1, text: '홀과 주방 경력을 쌓아 점장이 됐다.' }),
      E('hire', { minEdu: 'high', ages: [28, 50], p: 0.04, text: '외식 업체에 점장으로 채용됐다.' }),
    ],
    transitions: [
      tr('52111', [35, 55], 6, 0.04, '가게를 인수해 점주로'),
      tr('45110', [35, 55], 8, 0.02, '주방으로 돌아가 독립'),
    ],
    events: [
      ev('15220', 'staff_gap', {
        ages: [28, 58], p: 0.14, cooldown: 3,
        text: '직원 둘이 갑자기 그만뒀다. 이번 주 영업은 해야 한다.',
        choice: {
          prompt: '어떻게 메울까?',
          options: [
            { id: 'cover', label: '직접 홀에 선다', fx: { stats: { health: -2, leisure: -3, relations: 1 } }, result: '며칠 동안 서서 일했다. 남은 직원들이 고맙다는 말을 했다.' },
            { id: 'shorten', label: '영업시간을 줄인다', fx: { stats: { wealth: -2, leisure: 2 }, issues: { job: 2 } }, result: '저녁 장사를 접었다. 매출이 그만큼 빠졌다.' },
          ],
          default: 'cover',
        },
        reason: '직원 공백',
      }),
      ev('15220', 'hygiene_check', {
        ages: [28, 58], p: 0.12, cooldown: 3,
        text: '본사 위생 점검이 예고 없이 나왔다. 점검표를 하나씩 채웠다.',
        fx: { stats: { leisure: -2, happiness: -1 } }, reason: '본사 점검',
      }),
    ],
    burnout: 0.06,
  }),
  // ───────── 2 전문가: 연구·정보통신·공학 ─────────
  J('21112', '생명 및 자연과학 관련 전문가', {
    entry: [
      E('degree', { minEdu: 'grad', majors: ['med', 'sci'], ages: [27, 40], p: 0.3, text: '박사과정을 마치고 연구소와 병원 연구직에 자리를 얻었다.' }),
    ],
    transitions: [
      tr('26118', [38, 52], 6, 0.03, '대학 교수 임용'),
      tr('22420', [32, 50], 4, 0.02, '데이터 분석 직무로 이직'),
      tr('28436', [35, 52], 6, 0.02, '의약품 기술 영업으로'),
    ],
    events: [
      ev('21112', 'grant_end', {
        ages: [28, 55], p: 0.14, cooldown: 4,
        text: '연구과제가 끝났다. 다음 과제의 연구비는 아직 확정되지 않았다.',
        choice: {
          prompt: '다음 자리를 어떻게 할까?',
          options: [
            { id: 'extend', label: '계약 연장 수락', fx: { stats: { wealth: 2, happiness: -1 }, issues: { job: 3 } }, result: '석 달 단위로 계약을 이어 가기로 했다.' },
            { id: 'move', label: '다른 연구실 탐색', fx: { stats: { intellect: 2, leisure: -2, relations: -1, wealth: -1 }, issues: { job: 1 } }, result: '지원서를 여러 곳에 냈고, 면접 일정이 겹쳤다.' },
          ],
          default: 'extend',
        },
        reason: '연구과제 종료',
      }),
      ev('21112', 'authorship', {
        ages: [28, 55], p: 0.09, once: true,
        text: '논문 저자 순서를 두고 의견이 갈렸다.',
        choice: {
          prompt: '순서를 어떻게 할까?',
          options: [
            { id: 'claim', label: '기여를 설명한다', fx: { stats: { happiness: 2, relations: -2, intellect: 1 }, issues: { fairness: 2 } }, result: '실험 기록을 정리해 보여 주었다. 순서는 조정됐고 분위기가 어색해졌다.' },
            { id: 'yield', label: '양보한다', fx: { stats: { relations: 1, happiness: -3 }, issues: { fairness: 4 } }, result: '원래 순서대로 투고했다. 다음 논문에서 보자는 말을 들었다.' },
          ],
          default: 'yield',
        },
        reason: '저자 순서 조정',
      }),
    ],
    burnout: 0.05,
  }),
  J('22231', '컴퓨터 시스템 및 소프트웨어 전문가', {
    entry: [
      E('degree', { minEdu: '4yr', majors: ['eng', 'sci'], ages: [23, 35], p: 0.35, text: '컴퓨터 전공을 살려 개발 직군에 채용됐다.' }),
      E('hire', { minEdu: '2yr', ages: [22, 40], p: 0.15, era: [2014, null], text: '교육과정과 포트폴리오로 신입 개발 자리를 얻었다.' }),
    ],
    transitions: [
      tr('22420', [28, 45], 4, 0.03, '데이터 분석 직무로'),
      tr('13502', [35, 50], 8, 0.03, '개발 관리자로 승진'),
      tr('22299', [30, 50], 5, 0.02, '다른 분야 시스템 전문가로'),
    ],
    events: [
      ev('22231', 'release_crunch', {
        ages: [23, 50], p: 0.15, cooldown: 3,
        text: '출시 일정이 당겨졌다. 한 달 가까이 밤 열 시 퇴근이 이어졌다.',
        fx: { stats: { health: -3, leisure: -4, happiness: -1 } }, reason: '출시 직전 야근',
      }),
      ev('22231', 'ai_assist', {
        years: [2023, 2100], ages: [24, 58], p: 0.15, once: true,
        text: '코드 작성 보조 도구가 팀에 들어왔다. 작업량 기준이 달라졌다.',
        choice: {
          prompt: '도구를 어떻게 쓸까?',
          options: [
            { id: 'learn', label: '적극 익힌다', fx: { stats: { intellect: 3, leisure: -3 }, issues: { tech: 4 } }, result: '밤에 쓰는 법을 익혔고, 업무 속도가 눈에 띄게 달라졌다.' },
            { id: 'keep', label: '기존 방식 유지', fx: { stats: { happiness: 2, leisure: 1 }, issues: { tech: 2, job: 3 } }, result: '평소 방식대로 일했다. 팀 평균 속도와의 차이가 조금씩 보였다.' },
          ],
          default: 'learn',
        },
        reason: '작업 도구 변화',
      }),
    ],
    burnout: 0.09,
  }),
  J('22234', '컴퓨터 시스템 및 소프트웨어 전문가', {
    entry: [
      E('degree', { minEdu: '4yr', majors: ['eng', 'sci', 'art'], ages: [22, 34], p: 0.15, text: '전공이나 개인 작품으로 게임 회사 개발직에 채용됐다.' }),
      E('hire', { minEdu: 'high', ages: [20, 35], p: 0.08, era: [2005, null], text: '특성화 과정과 포트폴리오로 게임 회사 신입이 됐다.' }),
    ],
    transitions: [
      tr('22231', [28, 45], 4, 0.04, '일반 소프트웨어 개발로 이직'),
      tr('29553', [28, 45], 4, 0.02, '게임 디자이너로 직무 전환'),
      tr('29554', [28, 45], 4, 0.02, '인터페이스 디자이너로'),
    ],
    events: [
      ev('22234', 'launch_weekend', {
        ages: [23, 45], p: 0.15, cooldown: 3,
        text: '출시가 한 달 남았다. 팀은 주말 근무를 요청했다.',
        choice: {
          prompt: '주말 근무에 어떻게 응할까?',
          options: [
            { id: 'work', label: '주말에 나온다', fx: { stats: { wealth: 2, leisure: -4, health: -2 }, issues: { job: -2 } }, result: '주말 근무가 이어졌고, 출시 날에는 모두 말이 없었다.' },
            { id: 'adjust', label: '일정 조정 요청', fx: { stats: { relations: -1, leisure: 1 }, issues: { job: 3 } }, result: '일정이 일부만 조정됐다. 팀 안에서 의견이 갈렸다.' },
          ],
          default: 'work',
        },
        reason: '출시 직전 주말 근무',
      }),
      ev('22234', 'service_end', {
        ages: [24, 50], p: 0.09, cooldown: 5,
        text: '개발하던 게임의 서비스 종료가 결정됐다. 팀이 해산한다.',
        fx: { stats: { happiness: -3, wealth: -1 }, issues: { job: 6 } }, reason: '프로젝트 종료',
      }),
    ],
    burnout: 0.1,
  }),
  J('22242', '컴퓨터 시스템 및 소프트웨어 전문가', {
    entry: [
      E('hire', { minEdu: '2yr', ages: [20, 38], p: 0.2, era: [1998, null], text: '교육과정을 마치고 중소 IT 회사에 입사했다.' }),
      E('degree', { minEdu: '4yr', majors: ['eng', 'sci'], ages: [23, 34], p: 0.15, text: '전공 지식으로 웹 개발 직군에 채용됐다.' }),
    ],
    transitions: [
      tr('22231', [27, 45], 3, 0.04, '일반 소프트웨어 개발로 이직'),
      tr('22291', [27, 45], 3, 0.02, '품질 관리 직무로'),
      tr('29551', [27, 45], 3, 0.02, '웹 디자이너로 직무 전환'),
    ],
    events: [
      ev('22242', 'dispatch', {
        ages: [23, 50], p: 0.12, cooldown: 3,
        text: '파견 근무지가 바뀌었다. 새 팀에서 같은 도구로 다시 시작했다.',
        fx: { stats: { relations: -2, leisure: -1 }, issues: { job: 3 } }, reason: '파견지 변경',
      }),
      ev('22242', 'stack_shift', {
        ages: [25, 55], p: 0.12, cooldown: 4,
        text: '회사가 쓰던 개발 방식이 바뀌었다. 새로 배워야 할 것이 쌓였다.',
        choice: {
          prompt: '어떻게 따라갈까?',
          options: [
            { id: 'night', label: '퇴근 후 학습', fx: { stats: { intellect: 2, leisure: -3, health: -1 }, issues: { tech: 2 } }, result: '몇 달 동안 퇴근 후에 공부했다. 업무에서 한결 편해졌다.' },
            { id: 'team', label: '팀 안에서 익힌다', fx: { stats: { leisure: 1, intellect: 1 }, issues: { tech: 3, job: 2 } }, result: '일하면서 어깨너머로 배웠다. 속도가 느리다는 말을 들었다.' },
          ],
          default: 'team',
        },
        reason: '기술 전환',
      }),
    ],
    burnout: 0.08,
  }),
  J('22291', '컴퓨터 시스템 및 소프트웨어 전문가', {
    entry: [
      E('hire', { minEdu: '2yr', ages: [21, 38], p: 0.2, era: [1995, null], text: '교육과정을 거쳐 정보 기술 회사 품질 부서에 들어갔다.' }),
    ],
    transitions: [
      tr('22231', [27, 45], 4, 0.03, '개발 직무로 이동'),
      tr('22242', [27, 45], 4, 0.03, '웹 개발 직무로 이동'),
      tr('33201', [30, 55], 5, 0.02, '자료 관리 사무로'),
    ],
    events: [
      ev('22291', 'test_automation', {
        years: [2015, 2100], ages: [26, 58], p: 0.15, once: true,
        text: '손으로 하던 시험 절차가 자동화 도구로 넘어갔다. 맡던 일이 줄었다.',
        choice: {
          prompt: '어떻게 대응할까?',
          options: [
            { id: 'auto', label: '자동화를 배운다', fx: { stats: { intellect: 3, leisure: -2 }, issues: { tech: 3 } }, result: '시험 스크립트를 짜는 일을 맡게 됐다. 일은 달라졌지만 자리는 남았다.' },
            { id: 'move', label: '다른 직무 탐색', fx: { stats: { happiness: -2, leisure: -1, wealth: 1 }, issues: { job: 4 } }, result: '내부 공고와 외부 채용을 같이 보기 시작했다.' },
          ],
          default: 'auto',
        },
        reason: '시험 자동화',
      }),
      ev('22291', 'bug_blame', {
        ages: [24, 58], p: 0.12, cooldown: 3,
        text: '출시 뒤 결함이 발견되자 시험 단계에서 왜 못 잡았느냐는 말이 돌아왔다.',
        fx: { stats: { happiness: -2, relations: -1 } }, reason: '결함 책임 공방',
      }),
    ],
    burnout: 0.06,
  }),
  J('22420', '데이터 전문가', {
    entry: [
      E('degree', { minEdu: '4yr', majors: ['sci', 'eng', 'soc'], ages: [24, 40], p: 0.2, era: [2010, null], text: '통계와 컴퓨터 지식으로 분석 직무에 채용됐다.' }),
      E('promote', { from: ['31110', '22231'], minYears: 3, ages: [27, 45], p: 0.08, era: [2012, null], text: '업무 데이터를 다루다 분석 직무로 옮겼다.' }),
    ],
    transitions: [
      tr('22231', [28, 45], 3, 0.03, '개발 직무로'),
      tr('13502', [36, 52], 7, 0.02, '개발·분석 관리자로'),
      tr('28340', [30, 50], 4, 0.02, '조사 전문가로'),
    ],
    events: [
      ev('22420', 'report_gap', {
        ages: [25, 55], p: 0.14, cooldown: 3,
        text: '분석 결과가 윗선이 기대한 방향과 달랐다. 보고 방식을 정해야 한다.',
        choice: {
          prompt: '어떻게 보고할까?',
          options: [
            { id: 'asis', label: '결과 그대로', fx: { stats: { happiness: 3, relations: -2 }, issues: { conflict: 2 } }, result: '수치와 한계를 그대로 설명했다. 회의실 분위기가 가라앉았다.' },
            { id: 'soften', label: '표현을 조정한다', fx: { stats: { relations: 1, happiness: -3 }, issues: { fairness: 2 } }, result: '결론 문장을 고쳐 보고했다. 그날 밤 오래 마음에 걸렸다.' },
          ],
          default: 'asis',
        },
        reason: '분석 결과 보고',
      }),
      ev('22420', 'data_cleanup', {
        ages: [25, 58], p: 0.12, cooldown: 3,
        text: '데이터 정리가 분석보다 오래 걸린다. 대부분이 형식 맞추기였다.',
        fx: { stats: { happiness: -1, leisure: -2 } }, reason: '데이터 정리 업무',
      }),
    ],
    burnout: 0.06,
  }),
  J('23123', '건축‧토목 공학 기술자 및 시험원', {
    entry: [
      E('degree', { minEdu: '4yr', majors: ['eng'], ages: [23, 35], p: 0.3, text: '건축·토목 전공으로 건설사 공채에 합격했다.' }),
      E('license', { license: 'tech', minEdu: '2yr', majors: ['eng'], ages: [22, 40], p: 0.12, years: 1, text: '기사 자격을 따서 시공 업체에 들어갔다.' }),
    ],
    transitions: [
      tr('14111', [38, 55], 10, 0.06, '현장소장으로 승진'),
      tr('23122', [38, 58], 8, 0.03, '감리 기술자로 이직'),
      tr('23631', [40, 58], 8, 0.02, '산업안전 관리로 이직'),
    ],
    events: [
      ev('23123', 'design_change', {
        ages: [26, 55], p: 0.15, cooldown: 3,
        text: '발주처가 설계 변경을 요구했다. 공기는 그대로라고 한다.',
        choice: {
          prompt: '어떻게 대응할까?',
          options: [
            { id: 'accept', label: '인원을 더 투입', fx: { stats: { health: -3, leisure: -3, wealth: 1 }, issues: { job: -1 } }, result: '추가 인력을 불러 공기를 맞췄다. 현장에서 한 달 동안 잠을 줄였다.' },
            { id: 'negotiate', label: '비용·기간 협의', fx: { stats: { relations: -1, happiness: -1 }, issues: { conflict: 3 } }, result: '협의가 길어졌고, 공기는 일부 늘고 비용은 나눠 지기로 했다.' },
          ],
          default: 'accept',
        },
        reason: '설계 변경과 공기',
      }),
      ev('23123', 'rainy_delay', {
        ages: [24, 58], p: 0.12, cooldown: 3,
        text: '장마가 길어져 공정이 밀렸다. 기술자들이 현장에서 대기했다.',
        fx: { stats: { leisure: -2, happiness: -1 }, issues: { job: 2 } }, reason: '날씨로 공기 지연',
      }),
    ],
    hazard: 2, burnout: 0.06,
  }),
  J('23421', '전기‧전자공학 기술자 및 시험원', {
    entry: [
      E('degree', { minEdu: '4yr', majors: ['eng', 'sci'], ages: [24, 32], p: 0.12, text: '전자·재료 전공으로 반도체 회사 공채에 합격했다.' }),
      E('degree', { minEdu: 'grad', majors: ['eng', 'sci'], ages: [26, 36], p: 0.25, text: '석·박사 연구 경력으로 반도체 연구직에 들어갔다.' }),
    ],
    transitions: [
      tr('23422', [30, 45], 4, 0.03, '시스템반도체 부서로'),
      tr('23423', [30, 48], 4, 0.03, '공정·장비 부서로'),
      tr('26116', [38, 50], 8, 0.01, '대학 교수 임용'),
    ],
    events: [
      ev('23421', 'line_call', {
        ages: [24, 52], p: 0.15, cooldown: 3,
        text: '라인 이상 호출이 새벽에 왔다. 출근해 원인을 찾아야 했다.',
        fx: { stats: { health: -2, leisure: -3, happiness: -1 } }, reason: '새벽 호출',
      }),
      ev('23421', 'cycle_down', {
        ages: [26, 58], p: 0.09, cooldown: 5,
        text: '업황이 꺾여 성과급이 줄었다. 부서 통폐합 이야기도 돈다.',
        fx: { stats: { wealth: -2, happiness: -2 }, issues: { job: 5 } }, reason: '업황 하락',
      }),
    ],
    burnout: 0.08,
  }),
  J('23516', '기계‧로봇공학 기술자 및 시험원', {
    entry: [
      E('degree', { minEdu: '4yr', majors: ['eng'], ages: [24, 33], p: 0.18, text: '기계·전기 전공으로 완성차와 부품사 공채에 합격했다.' }),
      E('degree', { minEdu: 'grad', majors: ['eng'], ages: [26, 36], p: 0.25, text: '대학원 연구 경력으로 연구개발직에 들어갔다.' }),
    ],
    transitions: [
      tr('23520', [30, 48], 4, 0.03, '로봇 연구로 이동'),
      tr('23515', [30, 50], 4, 0.03, '산업기계 설계로'),
      tr('22231', [30, 45], 4, 0.02, '소프트웨어 개발로'),
    ],
    events: [
      ev('23516', 'ev_shift', {
        years: [2015, 2100], ages: [26, 58], p: 0.15, once: true,
        text: '전기차 전환으로 담당하던 엔진 부서가 축소됐다.',
        choice: {
          prompt: '어느 쪽으로 갈까?',
          options: [
            { id: 'move', label: '전동화 부서로', fx: { stats: { intellect: 3, leisure: -2, wealth: 1 }, issues: { tech: 3 } }, result: '배터리와 모터를 공부하며 새 부서에서 처음부터 시작했다.' },
            { id: 'stay', label: '현 부서에 남는다', fx: { stats: { relations: 1, happiness: -2 }, issues: { job: 5, tech: 2 } }, result: '남은 인원으로 기존 모델 유지 업무를 이어 갔다.' },
          ],
          default: 'stay',
        },
        reason: '전동화 전환',
      }),
      ev('23516', 'cause_found', {
        ages: [26, 58], p: 0.1, cooldown: 4,
        text: '몇 달 붙들던 문제의 원인이 마침내 보였다. 팀이 오랜만에 웃었다.',
        fx: { stats: { happiness: 3, intellect: 1, relations: 1 } }, reason: '개발 문제 해결',
      }),
    ],
    burnout: 0.06,
  }),
  J('23811', '항공기‧선박 기관사 및 관제사', {
    entry: [
      E('license', { license: 'tech', minEdu: '2yr', ages: [22, 35], p: 0.1, years: 2, text: '비행 교육과정을 마치고 운송용 조종사 자격을 땄다.' }),
      E('promote', { from: ['A0120'], minYears: 8, ages: [30, 40], p: 0.06, text: '조종 장교로 복무한 뒤 민간 항공사로 옮겼다.' }),
    ],
    transitions: [
      tr('23831', [40, 58], 10, 0.02, '지상 관제 직무로'),
      tr('26129', [45, 62], 15, 0.02, '비행 교관으로'),
    ],
    events: [
      ev('23811', 'medical_recheck', {
        ages: [25, 62], p: 0.11, cooldown: 4,
        text: '신체검사에서 재검 통보를 받았다. 결과가 나올 때까지 비행이 보류됐다.',
        fx: { stats: { happiness: -3 }, issues: { job: 4, medical: 2 } }, reason: '신체검사 재검',
      }),
      ev('23811', 'long_haul', {
        ages: [25, 62], p: 0.12, cooldown: 3,
        text: '장거리 노선이 몇 달 이어졌다. 시차 때문에 가족과 시간이 어긋났다.',
        fx: { stats: { health: -2, relations: -2, wealth: 1 } }, reason: '장거리 비행 일정',
      }),
    ],
    hazard: 2, burnout: 0.04,
  }),
  J('23951', '기타 공학 전문가 및 관련 종사자', {
    entry: [
      E('degree', { minEdu: '2yr', majors: ['eng', 'art'], ages: [20, 32], p: 0.3, text: '건축·도면 작성 자격을 갖추고 설계사무소에 들어갔다.' }),
    ],
    transitions: [
      tr('23123', [28, 45], 4, 0.02, '시공 쪽으로 이동'),
      tr('29531', [28, 50], 4, 0.02, '인테리어 디자이너로'),
      tr('37101', [35, 58], 6, 0.01, '사무 지원 직무로'),
    ],
    events: [
      ev('23951', 'auto_drawing', {
        years: [2018, 2100], ages: [28, 60], p: 0.15, once: true,
        text: '도면을 자동으로 그리는 프로그램이 들어왔다. 맡던 작업 일부가 사라졌다.',
        choice: {
          prompt: '앞으로 어떻게 할까?',
          options: [
            { id: 'review', label: '검수 업무를 맡는다', fx: { stats: { intellect: 2, leisure: -1 }, issues: { tech: 3 } }, result: '프로그램이 그린 도면을 검토하는 일이 주 업무가 됐다.' },
            { id: 'look', label: '다른 일 탐색', fx: { stats: { happiness: -2, leisure: -1, wealth: 1 }, issues: { job: 4 } }, result: '비슷한 직무의 구인 공고를 찾아보기 시작했다.' },
          ],
          default: 'review',
        },
        reason: '도면 자동화',
      }),
      ev('23951', 'revision_night', {
        ages: [22, 60], p: 0.12, cooldown: 3,
        text: '설계 변경이 한꺼번에 내려와 도면을 다시 고쳤다. 납기 전날 밤이었다.',
        fx: { stats: { leisure: -3, health: -1 } }, reason: '설계 변경 대응',
      }),
    ],
    burnout: 0.04,
  }),
  // ───────── 2 전문가: 보건·복지·종교 ─────────
  J('24113', '의사·한의사 및 치과의사', {
    entry: [
      E('license', { license: 'med', minEdu: '4yr', majors: ['med'], ages: [26, 40], p: 0.6, years: 4, text: '의대를 졸업하고 수련 과정을 거쳐 소아청소년과 전문의가 됐다.' }),
    ],
    transitions: [
      tr('26118', [40, 58], 8, 0.02, '대학병원 교수로'),
      tr('21112', [38, 55], 6, 0.02, '연구직으로 이동'),
      tr('24120', [35, 58], 5, 0.02, '일반 진료로 전환'),
    ],
    events: [
      ev('24113', 'flu_season', {
        ages: [28, 62], p: 0.15, cooldown: 3,
        text: '열 오르는 아이들이 몰리는 계절이다. 대기 줄이 병원 밖까지 이어졌다.',
        fx: { stats: { health: -3, leisure: -4 } }, reason: '소아 환자 폭증',
      }),
      ev('24113', 'open_clinic', {
        ages: [34, 55], p: 0.12, once: true,
        text: '동료가 함께 개원하자고 했다. 이 동네는 아이 수가 해마다 줄고 있다.',
        choice: {
          prompt: '개원을 어떻게 할까?',
          options: [
            { id: 'open', label: '개원한다', fx: { stats: { wealth: -2, leisure: -3, happiness: 1 }, issues: { job: 2 }, money: { debt: 8000 } }, result: '대출을 받아 간판을 달았다. 첫 달 대기실은 한산했다.' },
            { id: 'stay', label: '병원에 남는다', fx: { stats: { relations: 1, wealth: -1 }, issues: { job: 1 } }, result: '당직표가 조금 바뀐 것 말고는 그대로였다.' },
          ],
          default: 'stay',
        },
        reason: '개원 결정',
      }),
    ],
    burnout: 0.08,
  }),
  J('24120', '의사·한의사 및 치과의사', {
    entry: [
      E('license', { license: 'med', minEdu: '4yr', majors: ['med'], ages: [25, 38], p: 0.7, years: 1, text: '의대를 졸업하고 의사 국가시험에 합격했다.' }),
    ],
    transitions: [
      tr('13310', [45, 60], 10, 0.03, '병원 관리자로'),
      tr('21112', [35, 55], 6, 0.02, '연구직으로 이동'),
      tr('28211', [35, 55], 6, 0.01, '의료 분야 분석 직무로'),
    ],
    events: [
      ev('24120', 'claim_cut', {
        ages: [28, 68], p: 0.12, cooldown: 3,
        text: '건강보험 심사에서 일부 진료비가 삭감됐다. 이의 신청 서류를 써야 한다.',
        fx: { stats: { wealth: -1, happiness: -1, leisure: -1 } }, reason: '진료비 삭감',
      }),
      ev('24120', 'patient_complaint', {
        ages: [28, 68], p: 0.11, cooldown: 4,
        text: '진료 결과에 불만이 있는 환자가 오래 항의했다. 대기실이 조용해졌다.',
        choice: {
          prompt: '어떻게 응대할까?',
          options: [
            { id: 'listen', label: '끝까지 듣는다', fx: { stats: { relations: 2, leisure: -3 } }, result: '이야기를 끝까지 듣고 진료 기록을 같이 보았다. 한 시간이 지나 있었다.' },
            { id: 'record', label: '기록 남기고 안내', fx: { stats: { happiness: -3, relations: -2, leisure: 1 }, issues: { conflict: 2 } }, result: '진료 내용을 기록하고 절차를 안내했다. 환자는 불만스레 돌아갔다.' },
          ],
          default: 'listen',
        },
        reason: '환자 항의 응대',
      }),
    ],
    burnout: 0.07,
  }),
  J('24142', '의사·한의사 및 치과의사', {
    entry: [
      E('license', { license: 'med', minEdu: '4yr', majors: ['med'], ages: [25, 38], p: 0.7, years: 1, text: '치대를 졸업하고 치과의사 국가시험에 합격했다.' }),
    ],
    transitions: [
      tr('24141', [30, 45], 3, 0.02, '전문의 과정으로'),
      tr('26118', [40, 58], 8, 0.01, '대학 교수로'),
    ],
    events: [
      ev('24142', 'rent_rise', {
        when: onSelf('24142'), ages: [30, 65], p: 0.14, cooldown: 4,
        text: '개원한 건물의 임대료가 올랐다. 같은 층에 치과가 하나 더 들어왔다.',
        choice: {
          prompt: '어떻게 할까?',
          options: [
            { id: 'move', label: '이전한다', fx: { stats: { wealth: -2, leisure: -2, happiness: 1 }, money: { debt: 4000 } }, result: '장비를 옮기는 동안 일주일을 쉬었다. 환자 일부는 오지 않았다.' },
            { id: 'stay', label: '버틴다', fx: { stats: { wealth: -3, happiness: -3 }, issues: { job: 3 } }, result: '올린 임대료를 내기로 하고 진료 시간을 늘렸다.' },
          ],
          default: 'stay',
        },
        reason: '임대료 인상',
      }),
      ev('24142', 'staff_leave', {
        ages: [28, 65], p: 0.12, cooldown: 4,
        text: '함께 일하던 치과위생사가 그만두었다. 새 사람이 구해지지 않았다.',
        fx: { stats: { leisure: -3, happiness: -1 }, issues: { job: 2 } }, reason: '직원 구인난',
      }),
    ],
    burnout: 0.05,
  }),
  J('24312', '약사 및 한약사', {
    entry: [
      E('license', { license: 'med', minEdu: '4yr', majors: ['med'], ages: [24, 38], p: 0.7, years: 1, text: '약대를 졸업하고 약사 국가시험에 합격했다.' }),
    ],
    transitions: [
      tr('21113', [35, 55], 6, 0.02, '제약 연구직으로'),
      tr('28436', [30, 50], 5, 0.02, '의약품 기술 영업으로'),
    ],
    events: [
      ev('24312', 'duty_pharmacy', {
        ages: [26, 65], p: 0.12, cooldown: 3,
        text: '심야 약국 당번이 돌아왔다. 밤 열두 시에 문을 닫는다.',
        fx: { stats: { health: -2, leisure: -3, wealth: 1 } }, reason: '심야 당번',
      }),
      ev('24312', 'robot_dispenser', {
        years: [2015, 2100], ages: [28, 65], p: 0.12, once: true,
        text: '조제 자동화 기기가 약국에 들어왔다. 복약 상담이 중요해졌다.',
        choice: {
          prompt: '어떻게 쓸까?',
          options: [
            { id: 'consult', label: '상담에 시간을 쓴다', fx: { stats: { relations: 3, leisure: -1 }, issues: { tech: 2 } }, result: '조제 시간이 줄어든 만큼 단골 손님 이야기를 오래 들었다.' },
            { id: 'volume', label: '처방 수를 늘린다', fx: { stats: { wealth: 3, leisure: -4 }, issues: { tech: 3 } }, result: '같은 인원으로 더 많은 처방전을 받았다. 점심이 늦어졌다.' },
          ],
          default: 'consult',
        },
        reason: '조제 자동화',
      }),
    ],
    burnout: 0.04,
  }),
  J('24402', '간호사', {
    entry: [
      E('license', { license: 'nurse', minEdu: '2yr', majors: ['med'], ages: [22, 40], p: 0.85, years: 0, text: '간호사 국가시험에 붙었다.' }),
    ],
    transitions: [
      tr('24401', [30, 55], 7, 0.04, '전문간호사 과정'),
      tr('24403', [30, 50], 5, 0.02, '보건교사로'),
      tr('25310', [35, 60], 5, 0.01, '교대 근무를 떠나'),
    ],
    events: [
      ev('24402', 'night_stretch', {
        ages: [22, 58], p: 0.15, cooldown: 3,
        text: '야간 근무가 이어지는 달이다. 낮에 자는 잠이 얕다.',
        fx: { stats: { health: -3, leisure: -3, relations: -1 } }, reason: '교대 근무 지속',
      }),
      ev('24402', 'preceptor', {
        ages: [26, 50], p: 0.11, cooldown: 4,
        text: '신규 간호사가 병동에 들어왔다. 교육을 맡아 달라는 말이 나왔다.',
        choice: {
          prompt: '어떻게 할까?',
          options: [
            { id: 'teach', label: '교육을 맡는다', fx: { stats: { relations: 3, leisure: -3, happiness: 2 } }, result: '내 근무 사이사이에 가르쳤다. 몇 달 뒤 신규가 혼자 라운딩을 돌았다.' },
            { id: 'pass', label: '다른 사람에게 미룬다', fx: { stats: { leisure: 1, relations: -2 } }, result: '교육은 다른 선배가 맡았다. 병동 분위기가 잠깐 서먹해졌다.' },
          ],
          default: 'teach',
        },
        reason: '신규 교육 담당',
      }),
    ],
    hazard: 2, burnout: 0.1,
  }),
  J('24661', '치료‧재활사 및 의료기사', {
    entry: [
      E('license', { license: 'med', minEdu: '2yr', majors: ['med'], ages: [21, 35], p: 0.8, years: 0, text: '물리치료사 면허시험에 합격했다.' }),
    ],
    transitions: [
      tr('24662', [28, 45], 5, 0.02, '작업치료 분야로'),
      tr('29640', [28, 50], 5, 0.03, '운동 트레이너로'),
    ],
    events: [
      ev('24661', 'patient_load', {
        ages: [22, 58], p: 0.14, cooldown: 3,
        text: '하루 치료 건수가 늘었다. 손목과 어깨가 먼저 아파 왔다.',
        fx: { stats: { health: -3, leisure: -1 }, issues: { medical: 2 } }, reason: '치료 건수 증가',
      }),
      ev('24661', 'own_center', {
        ages: [30, 55], p: 0.11, once: true,
        text: '봉직으로 일한 지 여러 해다. 센터를 직접 차려 볼 생각이 들었다.',
        choice: {
          prompt: '어떻게 할까?',
          options: [
            { id: 'open', label: '센터를 연다', fx: { stats: { wealth: -2, leisure: -3, happiness: 1 }, money: { debt: 5000 } }, result: '작은 센터를 열었다. 환자 한 명 한 명이 처음엔 모두 단골이었다.' },
            { id: 'stay', label: '봉직으로 남는다', fx: { stats: { leisure: 1, wealth: -1 }, issues: { job: 1 } }, result: '월급날이 일정한 쪽을 택했다.' },
          ],
          default: 'stay',
        },
        reason: '개원 고민',
      }),
    ],
    burnout: 0.06,
  }),
  J('24912', '기타 보건 전문가 및 관련 종사자', {
    entry: [
      E('exam', { license: 'med', minEdu: '2yr', majors: ['med'], ages: [21, 35], p: 0.08, years: 2, text: '응급구조 자격을 갖추고 소방 공채에 합격했다.' }),
    ],
    transitions: [
      tr('41120', [30, 48], 6, 0.03, '소방관으로 전환'),
      tr('24970', [40, 58], 10, 0.02, '환자안전 관리 직무로'),
    ],
    events: [
      ev('24912', 'night_calls', {
        ages: [22, 55], p: 0.15, cooldown: 3,
        text: '출동이 새벽까지 이어졌다. 끼니를 놓친 채 교대 시간을 맞았다.',
        fx: { stats: { health: -2, leisure: -3 } }, reason: '연속 출동',
      }),
      ev('24912', 'after_call', {
        ages: [22, 55], p: 0.11, cooldown: 4,
        text: '힘든 출동이 있었던 날이다. 퇴근길에도 현장이 머릿속을 떠나지 않았다.',
        choice: {
          prompt: '어떻게 정리할까?',
          options: [
            { id: 'talk', label: '동료와 이야기', fx: { stats: { relations: 3, happiness: 1 } }, result: '휴게실에서 동료와 한참 이야기했다. 서로 비슷한 날이 있었다.' },
            { id: 'counsel', label: '상담을 신청한다', fx: { stats: { happiness: 2, leisure: -1 } }, result: '직장 상담 프로그램을 신청했다. 첫 상담에서 말이 길어졌다.' },
          ],
          default: 'talk',
        },
        reason: '출동 후 마음 돌봄',
      }),
    ],
    hazard: 3, burnout: 0.09,
  }),
  J('24950', '기타 보건 전문가 및 관련 종사자', {
    entry: [
      E('license', { license: 'care', minEdu: 'high', ages: [19, 55], p: 0.6, years: 1, text: '학원 과정과 실습을 마치고 간호조무사 자격을 땄다.' }),
    ],
    transitions: [
      tr('24402', [24, 45], 3, 0.03, '간호학과에 진학해 간호사로'),
      tr('42210', [30, 62], 4, 0.04, '요양보호사로 이동'),
    ],
    events: [
      ev('24950', 'clinic_closed', {
        ages: [20, 62], p: 0.11, cooldown: 4,
        text: '다니던 의원이 문을 닫았다. 다른 곳의 자리를 알아봐야 했다.',
        fx: { stats: { wealth: -2, happiness: -2 }, issues: { job: 5 } }, reason: '의원 폐업',
      }),
      ev('24950', 'study_nursing', {
        ages: [22, 42], p: 0.12, once: true,
        text: '간호사가 되려면 학교에 다시 가야 한다. 일을 하며 다닐 방법도 있다.',
        choice: {
          prompt: '어떻게 할까?',
          options: [
            { id: 'enroll', label: '일하며 진학한다', fx: { stats: { intellect: 2, leisure: -4, wealth: -2 }, issues: { edu: -3 }, money: { debt: 1500 } }, result: '야간과 주말 수업을 다니기 시작했다. 한 학기가 유난히 길었다.' },
            { id: 'keep', label: '지금 일을 유지', fx: { stats: { wealth: 1, leisure: 1 }, issues: { job: 1 } }, result: '지금 일에 집중하기로 했다. 필요하면 나중에 다시 생각할 것이다.' },
          ],
          default: 'keep',
        },
        reason: '간호학 진학 고민',
      }),
    ],
    burnout: 0.06,
  }),
  J('25100', '보육교사', {
    entry: [
      E('license', { license: 'care', minEdu: '2yr', majors: ['edu'], ages: [20, 45], p: 0.7, years: 0, era: [1991, null], text: '보육교사 자격을 갖추고 어린이집에 들어갔다.' }),
    ],
    transitions: [
      tr('26300', [25, 45], 4, 0.03, '유치원 교사로 전환'),
      tr('42113', [28, 55], 4, 0.03, '돌봄 전담으로 전환'),
      tr('42901', [30, 58], 4, 0.01, '산후조리 일로 전환'),
    ],
    events: [
      ev('25100', 'parent_complaint', {
        ages: [20, 58], p: 0.14, cooldown: 3,
        text: '학부모가 하원 시간에 길게 항의했다. 아이 일이라 마음이 쓰였다.',
        choice: {
          prompt: '어떻게 응대할까?',
          options: [
            { id: 'direct', label: '직접 이야기한다', fx: { stats: { relations: 3, happiness: -2, leisure: -2 } }, result: '아이의 하루를 하나씩 설명했다. 학부모의 표정이 조금 풀렸다.' },
            { id: 'director', label: '원장과 함께 만난다', fx: { stats: { happiness: -1, relations: 1, leisure: 2 }, issues: { conflict: 1 } }, result: '면담 자리를 만들었다. 책임이 나눠진 기분이 들었다.' },
          ],
          default: 'direct',
        },
        reason: '학부모 민원',
      }),
      ev('25100', 'sick_day', {
        ages: [20, 58], p: 0.15, cooldown: 3,
        text: '감기가 돌아 아이 절반이 결석했다. 교사도 옮았지만 쉴 수 없었다.',
        fx: { stats: { health: -3, leisure: -1 } }, reason: '감염병 시즌',
      }),
    ],
    burnout: 0.08,
  }),
  J('25310', '사회복지 전문가 및 관련 종사자', {
    entry: [
      E('license', { license: 'social', minEdu: '2yr', majors: ['soc'], ages: [21, 45], p: 0.7, years: 0, era: [1983, null], text: '사회복지사 자격을 갖추고 복지 기관에 채용됐다.' }),
    ],
    transitions: [
      tr('25330', [30, 50], 5, 0.02, '상담 전문가로'),
      tr('35290', [28, 45], 4, 0.02, '복지직 공무원으로'),
      tr('25200', [30, 55], 5, 0.02, '시민단체 활동가로'),
    ],
    events: [
      ev('25310', 'caseload', {
        ages: [22, 58], p: 0.14, cooldown: 4,
        text: '담당 사례가 늘었다. 한 사람에게 쓸 수 있는 시간이 줄었다.',
        fx: { stats: { happiness: -2, leisure: -2 }, issues: { care: 2 } }, reason: '담당 사례 증가',
      }),
      ev('25310', 'project_end', {
        ages: [24, 58], p: 0.11, cooldown: 4,
        text: '위탁받던 사업이 끝난다는 공문이 왔다. 이용자들과 한 약속이 남아 있다.',
        choice: {
          prompt: '어떻게 할까?',
          options: [
            { id: 'follow', label: '이용자 연계에 힘쓴다', fx: { stats: { relations: 3, leisure: -3, happiness: 1 }, issues: { job: 3 } }, result: '이용자 한 명씩 다른 기관으로 이어 주었다. 마지막 날은 늦게 끝났다.' },
            { id: 'job', label: '다음 자리를 찾는다', fx: { stats: { happiness: -2, leisure: -1, wealth: 1 }, issues: { job: 1 } }, result: '이력서를 고쳐 쓰며 남은 업무를 정리했다.' },
          ],
          default: 'follow',
        },
        reason: '위탁 사업 종료',
      }),
    ],
    burnout: 0.08,
  }),
  J('25322', '사회복지 전문가 및 관련 종사자', {
    entry: [
      E('license', { license: 'social', minEdu: '2yr', ages: [24, 55], p: 0.5, years: 1, era: [1998, null], text: '직업상담사 자격을 따서 고용 지원 기관에 채용됐다.' }),
    ],
    transitions: [
      tr('25310', [28, 50], 4, 0.02, '복지 기관으로 이동'),
      tr('36206', [28, 55], 4, 0.02, '민간 알선 업무로'),
    ],
    events: [
      ev('25322', 'placement', {
        ages: [24, 62], p: 0.14, cooldown: 3,
        text: '오래 상담하던 구직자가 취업 소식을 전해 왔다. 마음이 가벼웠다.',
        fx: { stats: { happiness: 2, relations: 1 } }, reason: '상담자 취업',
      }),
      ev('25322', 'agency_contract', {
        ages: [26, 62], p: 0.11, cooldown: 4,
        text: '위탁기관 계약 갱신 심사가 다가왔다. 실적 지표가 새로 붙었다.',
        fx: { stats: { happiness: -2, leisure: -2 }, issues: { job: 4 } }, reason: '위탁 계약 갱신',
      }),
    ],
    burnout: 0.06,
  }),
  J('25411', '종교 관련 종사자', {
    entry: [
      E('degree', { minEdu: 'grad', majors: ['hum'], ages: [28, 42], p: 0.4, years: 3, text: '신학대학원을 마치고 교단에서 안수를 받았다.' }),
    ],
    transitions: [
      tr('25330', [40, 62], 6, 0.02, '상담 전문가로'),
      tr('25310', [35, 58], 5, 0.01, '복지 기관으로 이동'),
    ],
    events: [
      ev('25411', 'tentmaking', {
        ages: [30, 70], p: 0.12, once: true,
        text: '작은 교회의 헌금이 줄었다. 사례비로는 생활이 빠듯하다.',
        choice: {
          prompt: '어떻게 꾸려 갈까?',
          options: [
            { id: 'sidejob', label: '부업을 시작한다', fx: { stats: { wealth: 3, leisure: -3, health: -1 } }, result: '주중 낮에는 다른 일을 하고, 저녁과 주말에 교회 일을 했다.' },
            { id: 'cut', label: '사례비를 줄인다', fx: { stats: { wealth: -4, leisure: 1, happiness: -1 } }, result: '교인들과 상의해 사례비를 조정했다. 집안 살림도 같이 줄었다.' },
          ],
          default: 'sidejob',
        },
        reason: '교회 재정 변화',
      }),
      ev('25411', 'visit_rounds', {
        ages: [30, 75], p: 0.14, cooldown: 3,
        text: '새벽 기도와 심방이 겹치는 주간이다. 쉬는 날이 따로 없었다.',
        fx: { stats: { health: -2, leisure: -3, relations: 1 } }, reason: '심방과 새벽 기도',
      }),
    ],
    burnout: 0.05,
  }),
  // ───────── 2 전문가: 교육 ─────────
  J('26113', '대학교수 및 강사', {
    entry: [
      E('degree', { minEdu: 'grad', majors: ['soc', 'hum', 'sci', 'eng'], ages: [32, 46], p: 0.12, text: '박사 학위와 연구 업적으로 대학 교원에 임용됐다.' }),
    ],
    transitions: [
      tr('13121', [50, 66], 15, 0.03, '대학 보직으로 이동'),
      tr('28151', [45, 62], 8, 0.02, '컨설턴트로 이동'),
      tr('21222', [45, 62], 8, 0.01, '연구소 연구원으로'),
    ],
    events: [
      ev('26113', 'review_cycle', {
        ages: [32, 62], p: 0.14, cooldown: 4,
        text: '재임용 심사가 다가왔다. 논문 편수와 강의 평가가 기준이다.',
        choice: {
          prompt: '이번 학기를 어디에 쓸까?',
          options: [
            { id: 'research', label: '연구에 집중', fx: { stats: { intellect: 2, leisure: -3, relations: -1 }, issues: { job: -1 } }, result: '학회 발표와 논문 투고를 앞당겼다. 학생 면담 시간은 줄었다.' },
            { id: 'teach', label: '강의·지도에 집중', fx: { stats: { relations: 2, happiness: 1 }, issues: { job: 3 } }, result: '강의 평가가 좋게 나왔다. 연구 실적 칸은 비어 있었다.' },
          ],
          default: 'research',
        },
        reason: '재임용 심사',
      }),
      ev('26113', 'dept_merge', {
        years: [2015, 2100], ages: [35, 65], p: 0.11, cooldown: 5,
        text: '입학생이 줄어 학과 통폐합 논의가 시작됐다. 학과 회의가 길어졌다.',
        fx: { stats: { happiness: -2, leisure: -1 }, issues: { job: 5, region: 3 } }, reason: '학과 통폐합 논의',
      }),
    ],
    burnout: 0.05,
  }),
  J('26122', '대학교수 및 강사', {
    entry: [
      E('degree', { minEdu: 'grad', majors: ['hum', 'art'], ages: [27, 46], p: 0.3, text: '석사 이상 학력으로 대학 시간강사에 위촉됐다.' }),
    ],
    transitions: [
      tr('26112', [35, 52], 6, 0.03, '대학 교원 임용'),
      tr('26429', [30, 52], 4, 0.04, '학원 강의로 이동'),
      tr('29122', [30, 52], 4, 0.02, '출판 편집으로 이동'),
    ],
    events: [
      ev('26122', 'class_canceled', {
        ages: [27, 62], p: 0.14, cooldown: 3,
        text: '개강 직전에 강의 배정이 취소됐다. 이번 학기 수입이 사라졌다.',
        fx: { stats: { wealth: -3, happiness: -2 }, issues: { job: 5 } }, reason: '강의 배정 취소',
      }),
      ev('26122', 'load_or_paper', {
        ages: [27, 60], p: 0.12, cooldown: 4,
        text: '강의 배정이 열렸다. 학교 둘을 뛰면 생활비는 되지만 연구 시간이 없다.',
        choice: {
          prompt: '어떻게 할까?',
          options: [
            { id: 'load', label: '여러 학교를 뛴다', fx: { stats: { wealth: 3, leisure: -4, health: -1 }, issues: { job: 1 } }, result: '하루에 학교 둘을 오갔다. 점심은 이동 중에 먹었다.' },
            { id: 'paper', label: '연구 시간을 지킨다', fx: { stats: { intellect: 3, wealth: -2 }, issues: { job: 3 } }, result: '강의는 하나만 맡고 논문을 마무리했다. 통장 잔액은 줄었다.' },
          ],
          default: 'load',
        },
        reason: '강의 배정',
      }),
    ],
    burnout: 0.04,
  }),
  J('26211', '학교 교사', {
    entry: [
      E('exam', { license: 'teach', minEdu: '4yr', majors: ['edu', 'hum'], ages: [23, 38], p: 0.25, years: 2, text: '교직 과정을 마치고 임용시험에 합격했다.' }),
    ],
    transitions: [
      tr('26911', [40, 58], 12, 0.03, '장학사로 이동'),
      tr('13122', [50, 60], 20, 0.04, '교감으로 승진'),
      tr('26421', [30, 55], 5, 0.02, '학원 강사로 이동'),
    ],
    events: [
      ev('26211', 'admission_season', {
        ages: [24, 62], p: 0.15, cooldown: 3,
        text: '입시 철이다. 상담과 서류가 쌓여 점심시간에도 면담이 이어졌다.',
        fx: { stats: { leisure: -3, happiness: -1 } }, reason: '입시 상담 집중',
      }),
      ev('26211', 'parent_call', {
        ages: [24, 62], p: 0.11, cooldown: 4,
        text: '학부모가 늦은 저녁에 전화를 걸어 길게 항의했다.',
        choice: {
          prompt: '어떻게 응대할까?',
          options: [
            { id: 'manager', label: '관리자와 상의', fx: { stats: { leisure: -1, relations: 1 } }, result: '교감과 함께 면담 일정을 잡았다. 혼자 안고 가지 않아도 됐다.' },
            { id: 'self', label: '직접 풀어 본다', fx: { stats: { intellect: 1, relations: 1, happiness: -3, leisure: -2 } }, result: '통화와 면담을 거듭했다. 문제는 풀렸지만 몇 주가 소모됐다.' },
          ],
          default: 'manager',
        },
        reason: '학부모 민원',
      }),
    ],
    burnout: 0.08,
  }),
  J('26220', '학교 교사', {
    entry: [
      E('exam', { license: 'teach', minEdu: '4yr', majors: ['edu'], ages: [22, 36], p: 0.3, years: 1, text: '교대를 마치고 임용시험에 합격했다.' }),
    ],
    transitions: [
      tr('26911', [40, 58], 12, 0.03, '장학사로 이동'),
      tr('13123', [50, 60], 20, 0.04, '교감으로 승진'),
      tr('26300', [28, 50], 4, 0.01, '유치원으로 이동'),
    ],
    events: [
      ev('26220', 'extra_support', {
        ages: [23, 62], p: 0.14, cooldown: 3,
        text: '도움이 더 필요한 아이가 학급에 있다. 수업 준비와 상담이 겹쳤다.',
        choice: {
          prompt: '어떻게 도울까?',
          options: [
            { id: 'time', label: '개별 시간을 낸다', fx: { stats: { relations: 3, happiness: 2, leisure: -3 } }, result: '방과 후 시간을 따로 냈다. 아이가 먼저 인사를 건네는 날이 늘었다.' },
            { id: 'team', label: '지원팀과 연계한다', fx: { stats: { leisure: -2, happiness: 1 }, issues: { care: 1 } }, result: '상담과 지원 기관에 연결했다. 절차 서류가 한꺼번에 쌓였다.' },
          ],
          default: 'team',
        },
        reason: '학급 개별 지원',
      }),
      ev('26220', 'class_merge', {
        years: [2015, 2100], ages: [26, 62], p: 0.11, cooldown: 4,
        text: '아이 수가 줄어 학급이 합쳐졌다. 올해는 다른 학년을 맡게 됐다.',
        fx: { stats: { leisure: -1, happiness: -1 }, issues: { region: 3, job: 2 } }, reason: '학급 수 감소',
      }),
    ],
    burnout: 0.08,
  }),
  J('26300', '유치원 교사', {
    entry: [
      E('license', { license: 'teach', minEdu: '2yr', majors: ['edu'], ages: [20, 36], p: 0.6, years: 0, text: '유아교육 자격을 갖추고 유치원에 채용됐다.' }),
    ],
    transitions: [
      tr('25100', [25, 48], 4, 0.03, '어린이집 교사로 이동'),
      tr('13124', [45, 62], 12, 0.03, '유치원 원장으로'),
      tr('26990', [28, 50], 5, 0.02, '다른 교육기관 교사로'),
    ],
    events: [
      ev('26300', 'enrollment_drop', {
        years: [2012, 2100], ages: [22, 62], p: 0.12, cooldown: 4,
        text: '원아 수가 줄어 반을 하나 줄이게 됐다. 교사 배치가 바뀐다.',
        fx: { stats: { happiness: -2 }, issues: { job: 5, region: 2 } }, reason: '원아 수 감소',
      }),
      ev('26300', 'event_prep', {
        ages: [20, 60], p: 0.15, cooldown: 3,
        text: '재롱 잔치 준비로 몇 주째 퇴근이 늦다. 아이들 얼굴이 떠오른다.',
        fx: { stats: { leisure: -3, happiness: 1, health: -1 } }, reason: '행사 준비',
      }),
    ],
    burnout: 0.07,
  }),
  J('26422', '문리‧기술 및 예능 강사', {
    entry: [
      E('degree', { minEdu: '4yr', majors: ['sci', 'edu', 'eng'], ages: [22, 42], p: 0.2, text: '수학 전공을 살려 학원 강사로 채용됐다.' }),
    ],
    transitions: [
      tr('26481', [28, 50], 3, 0.02, '방문 강사로 이동'),
      tr('26429', [28, 55], 4, 0.03, '다른 과목 강의로'),
      tr('52111', [35, 58], 6, 0.02, '공부방을 직접 열어'),
    ],
    events: [
      ev('26422', 'exam_week', {
        ages: [23, 60], p: 0.15, cooldown: 3,
        text: '시험 기간이다. 보강 수업이 밤 열한 시까지 이어졌다.',
        fx: { stats: { health: -2, leisure: -3, wealth: 1 } }, reason: '시험 기간 보강',
      }),
      ev('26422', 'student_drop', {
        ages: [25, 60], p: 0.12, cooldown: 4,
        text: '수강생 몇이 다른 학원으로 옮겼다. 수강생 수에 따라 내 수입도 줄었다.',
        choice: {
          prompt: '어떻게 대응할까?',
          options: [
            { id: 'change', label: '강의 방식을 바꾼다', fx: { stats: { intellect: 2, leisure: -2 }, issues: { job: 1 } }, result: '교재를 다시 짜고 소규모 반을 열었다. 몇 달 뒤 몇 명이 돌아왔다.' },
            { id: 'hold', label: '그대로 버틴다', fx: { stats: { happiness: -1, wealth: -2 }, issues: { job: 3 } }, result: '수업은 같게 이어 갔다. 수입 명세서가 한 달 사이에 얇아졌다.' },
          ],
          default: 'hold',
        },
        reason: '수강생 이탈',
      }),
    ],
    burnout: 0.06,
  }),
  J('26481', '문리‧기술 및 예능 강사', {
    entry: [
      E('hire', { minEdu: '2yr', ages: [24, 52], p: 0.3, era: [1985, null], text: '학습지 회사와 위탁계약을 맺고 방문 교사가 됐다.' }),
    ],
    transitions: [
      tr('26422', [30, 52], 4, 0.02, '학원 강사로 이동'),
      tr('25100', [30, 52], 4, 0.02, '보육교사로 이동'),
    ],
    events: [
      ev('26481', 'commission_change', {
        ages: [25, 60], p: 0.11, cooldown: 4,
        text: '회사의 수수료 체계가 바뀌었다. 같은 회원 수에도 수입이 줄었다.',
        fx: { stats: { wealth: -2, happiness: -2 }, issues: { fairness: 4 } }, reason: '수수료 체계 변경',
      }),
      ev('26481', 'member_drop', {
        ages: [25, 60], p: 0.12, cooldown: 4,
        text: '관리 회원이 줄었다. 방문 일정에 빈 시간이 생겼다.',
        choice: {
          prompt: '어떻게 메울까?',
          options: [
            { id: 'wide', label: '방문 지역을 넓힌다', fx: { stats: { wealth: 1, health: -1, leisure: -3 } }, result: '이동 거리가 늘었다. 회원은 조금 늘었고 퇴근은 늦어졌다.' },
            { id: 'deep', label: '기존 회원에 집중', fx: { stats: { wealth: -1, relations: 2, leisure: 1 } }, result: '기존 회원 집을 더 자주 들렀다. 소개로 한두 명이 늘었다.' },
          ],
          default: 'deep',
        },
        reason: '회원 감소',
      }),
    ],
    burnout: 0.06,
  }),

  // ───────── 2 전문가: 법률·경영·금융 ─────────
  J('27111', '법률 전문가', {
    entry: [
      E('exam', { license: 'law', minEdu: 'grad', majors: ['soc'], ages: [28, 46], p: 0.04, years: 0, text: '변호사시험에 합격한 뒤 법관 임용 과정을 거쳐 판사가 됐다.' }),
      E('promote', { from: ['27120'], minYears: 7, ages: [35, 50], p: 0.02, text: '변호사 경력을 인정받아 법관에 임용됐다.' }),
    ],
    transitions: [
      tr('27120', [45, 62], 10, 0.05, '퇴직 후 변호사 개업'),
      tr('26113', [50, 66], 15, 0.02, '대학 교수로'),
    ],
    events: [
      ev('27111', 'weekend_records', {
        ages: [30, 62], p: 0.15, cooldown: 3,
        text: '재판 기록이 쌓여 주말에도 사건 기록을 읽었다.',
        fx: { stats: { leisure: -3, health: -1 } }, reason: '사건 기록 처리',
      }),
      ev('27111', 'rotation', {
        ages: [30, 62], p: 0.12, cooldown: 3,
        text: '정기 인사로 근무지가 바뀌었다. 가족은 학교 때문에 남기로 했다.',
        fx: { stats: { relations: -2, leisure: -2 } }, reason: '근무지 이동',
      }),
    ],
    burnout: 0.04,
  }),
  J('27120', '법률 전문가', {
    entry: [
      E('exam', { license: 'law', minEdu: 'grad', majors: ['soc'], ages: [26, 46], p: 0.5, years: 0, text: '로스쿨을 마치고 변호사시험에 합격했다.' }),
    ],
    transitions: [
      tr('27111', [32, 48], 5, 0.02, '법관 임용'),
      tr('27190', [30, 55], 4, 0.03, '기업 법무 직무로'),
      tr('28151', [35, 58], 8, 0.02, '컨설턴트로 이동'),
    ],
    events: [
      ev('27120', 'brief_deadline', {
        ages: [26, 60], p: 0.15, cooldown: 3,
        text: '서면 제출 기한이 겹쳤다. 여러 날 새벽에 퇴근했다.',
        fx: { stats: { health: -3, leisure: -4, wealth: 1 } }, reason: '서면 마감',
      }),
      ev('27120', 'slow_cases', {
        when: onSelf('27120'), ages: [28, 68], p: 0.14, cooldown: 4,
        text: '사건이 뜸한 달이 이어졌다. 사무실 임대료는 어김없이 돌아왔다.',
        choice: {
          prompt: '어떻게 꾸려 갈까?',
          options: [
            { id: 'share', label: '공동 사무실로', fx: { stats: { wealth: 1, relations: 1, leisure: -1 } }, result: '비용을 나누는 공동 사무실로 옮겼다. 동료와 사건 이야기가 늘었다.' },
            { id: 'public', label: '공공 업무를 병행', fx: { stats: { intellect: 1, leisure: -2, wealth: -1 }, issues: { fairness: -2 } }, result: '국선과 공공 사건을 같이 맡았다. 수입은 느리게 늘었다.' },
          ],
          default: 'share',
        },
        reason: '수임 감소',
      }),
    ],
    burnout: 0.08,
  }),
  J('27210', '정부 행정 전문가 및 관련 종사자', {
    entry: [
      E('exam', { minEdu: '4yr', majors: ['soc'], ages: [24, 38], p: 0.05, years: 3, text: '5급 공채나 민간경력 채용으로 정책 부서에 들어갔다.' }),
    ],
    transitions: [
      tr('11121', [48, 58], 20, 0.06, '고위직 승진'),
      tr('28151', [45, 60], 12, 0.02, '퇴직 후 컨설턴트'),
      tr('26113', [48, 62], 12, 0.02, '대학 교수로'),
    ],
    events: [
      ev('27210', 'policy_rewrite', {
        ages: [28, 58], p: 0.15, cooldown: 3,
        text: '위에서 방향이 바뀌어 석 달 치 정책 문서를 처음부터 다시 썼다.',
        fx: { stats: { leisure: -3, happiness: -2 } }, reason: '정책 문서 재작성',
      }),
      ev('27210', 'secondment', {
        ages: [30, 55], p: 0.11, once: true,
        text: '다른 기관으로 파견 근무를 가 보라는 제안이 나왔다.',
        choice: {
          prompt: '어떻게 할까?',
          options: [
            { id: 'go', label: '파견을 간다', fx: { stats: { intellect: 2, relations: -1, leisure: -2 }, issues: { job: -1 } }, result: '새 기관에서 다른 방식의 일을 배웠다. 원래 부서와는 조금 멀어졌다.' },
            { id: 'stay', label: '원래 자리에 남는다', fx: { stats: { relations: 1, leisure: 1 }, issues: { job: 2 } }, result: '승진 심사 때 파견 경력이 비어 있다는 말을 들었다.' },
          ],
          default: 'stay',
        },
        reason: '파견 제안',
      }),
    ],
    burnout: 0.05,
  }),
  J('28111', '인사 및 경영 전문가', {
    entry: [
      E('exam', { license: 'acct', minEdu: '4yr', majors: ['soc'], ages: [25, 46], p: 0.07, years: 3, era: [1986, null], text: '공인노무사 시험에 합격했다.' }),
    ],
    transitions: [
      tr('31210', [35, 55], 5, 0.02, '기업 인사 담당으로'),
      tr('12121', [40, 58], 8, 0.02, '기업 관리자로'),
    ],
    events: [
      ev('28111', 'dismissal_case', {
        ages: [28, 65], p: 0.14, cooldown: 3,
        text: '부당해고를 주장하는 의뢰인이 사측과 합의할지 끝까지 갈지 물었다.',
        choice: {
          prompt: '어떻게 조언할까?',
          options: [
            { id: 'settle', label: '합의를 권한다', fx: { stats: { relations: 1, leisure: 1, wealth: 1 }, issues: { fairness: 2 } }, result: '합의금과 복직 조건을 조율했다. 의뢰인은 아쉬움과 안도를 보였다.' },
            { id: 'fight', label: '끝까지 간다', fx: { stats: { intellect: 1, leisure: -3, wealth: -1 }, issues: { fairness: -2 } }, result: '심문 기일이 몇 번 더 잡혔다. 의뢰인의 몇 달이 사건에 묶였다.' },
          ],
          default: 'settle',
        },
        reason: '해고 분쟁 자문',
      }),
      ev('28111', 'late_fee', {
        ages: [28, 65], p: 0.11, cooldown: 4,
        text: '의뢰인이 수임료 지급을 미뤘다. 사건은 이미 끝나 있었다.',
        fx: { stats: { wealth: -2, happiness: -1 } }, reason: '수임료 지연',
      }),
    ],
    burnout: 0.05,
  }),
  J('28120', '인사 및 경영 전문가', {
    entry: [
      E('exam', { license: 'acct', minEdu: '4yr', majors: ['soc'], ages: [23, 36], p: 0.1, years: 2, text: '공인회계사 시험에 합격했다.' }),
    ],
    transitions: [
      tr('28130', [35, 58], 6, 0.02, '세무사로 개업'),
      tr('12123', [35, 52], 6, 0.03, '기업 재무 부서로'),
      tr('28152', [32, 50], 5, 0.02, '인수합병 자문으로'),
    ],
    events: [
      ev('28120', 'busy_season', {
        ages: [24, 58], p: 0.17, cooldown: 3,
        text: '결산 감사 시즌이다. 두 달 동안 주말이 사라졌다.',
        fx: { stats: { health: -3, leisure: -4, wealth: 1 } }, reason: '감사 시즌',
      }),
      ev('28120', 'audit_tool', {
        years: [2020, 2100], ages: [26, 60], p: 0.12, once: true,
        text: '감사 절차의 상당 부분을 분석 도구가 맡았다. 신입의 일이 줄었다.',
        choice: {
          prompt: '어떻게 할까?',
          options: [
            { id: 'tool', label: '도구를 익힌다', fx: { stats: { intellect: 3, leisure: -2, wealth: 1 }, issues: { tech: 3 } }, result: '데이터 분석 교육을 듣고 감사 방식을 바꿨다.' },
            { id: 'judgment', label: '판단 업무에 집중', fx: { stats: { relations: 1, leisure: -1, happiness: -1 }, issues: { tech: 2, job: 2 } }, result: '고객과의 협의와 판단이 필요한 일에 시간을 더 썼다.' },
          ],
          default: 'tool',
        },
        reason: '감사 도구 도입',
      }),
    ],
    burnout: 0.08,
  }),
  J('28130', '인사 및 경영 전문가', {
    entry: [
      E('exam', { license: 'acct', minEdu: '4yr', majors: ['soc'], ages: [26, 52], p: 0.06, years: 2, text: '세무사 시험에 합격했다.' }),
      E('promote', { from: ['35210'], minYears: 20, ages: [48, 60], p: 0.05, text: '세무 공무원으로 오래 일한 경력으로 세무사가 됐다.' }),
    ],
    transitions: [
      tr('28151', [40, 62], 8, 0.02, '경영 자문으로 이동'),
      tr('28120', [35, 55], 6, 0.01, '회계 법인으로 이동'),
    ],
    events: [
      ev('28130', 'filing_season', {
        ages: [27, 70], p: 0.17, cooldown: 3,
        text: '신고 기간이다. 의뢰인 서류가 한꺼번에 몰려 사무실 불이 꺼지지 않는다.',
        fx: { stats: { health: -2, leisure: -4, wealth: 1 } }, reason: '신고 기간',
      }),
      ev('28130', 'fee_pressure', {
        when: onSelf('28130'), years: [2018, 2100], ages: [30, 70], p: 0.12, cooldown: 4,
        text: '자동 기장 서비스가 늘면서 기장 수수료를 낮춰 달라는 요청이 많아졌다.',
        choice: {
          prompt: '어떻게 대응할까?',
          options: [
            { id: 'lower', label: '수수료를 낮춘다', fx: { stats: { wealth: -3, relations: 2 }, issues: { tech: 2 } }, result: '단골은 지켰고 수입은 줄었다.' },
            { id: 'advise', label: '자문 비중을 늘린다', fx: { stats: { intellect: 2, leisure: -2, wealth: 2 }, issues: { tech: 2 } }, result: '절세 상담과 컨설팅을 따로 내걸었다. 일이 더 복잡해졌다.' },
          ],
          default: 'lower',
        },
        reason: '기장 수수료 경쟁',
      }),
    ],
    burnout: 0.05,
  }),
  J('28151', '인사 및 경영 전문가', {
    entry: [
      E('hire', { minEdu: '4yr', majors: ['soc', 'eng'], ages: [24, 40], p: 0.05, text: '컨설팅 회사 채용에 합격해 분석가로 시작했다.' }),
      E('promote', { from: ['12122', '31110'], minYears: 8, ages: [34, 50], p: 0.03, text: '기획 경력을 살려 컨설턴트로 옮겼다.' }),
    ],
    transitions: [
      tr('11201', [38, 56], 8, 0.03, '고객사 경영진으로'),
      tr('11202', [38, 56], 8, 0.03, '기업 경영진으로 이동'),
    ],
    events: [
      ev('28151', 'project_crunch', {
        ages: [24, 55], p: 0.15, cooldown: 3,
        text: '프로젝트 마감 주간이다. 고객사 사무실에서 밤마다 자료를 고쳤다.',
        fx: { stats: { health: -3, leisure: -4, wealth: 1 } }, reason: '프로젝트 마감',
      }),
      ev('28151', 'up_or_out', {
        ages: [28, 50], p: 0.11, once: true,
        text: '승진 심사에서 한 번 더 보류됐다. 이곳에서는 그것이 신호로 읽힌다.',
        choice: {
          prompt: '어떻게 할까?',
          options: [
            { id: 'again', label: '한 번 더 도전', fx: { stats: { leisure: -3, happiness: -1 }, issues: { job: 2 } }, result: '다음 심사까지 프로젝트를 둘 더 맡았다.' },
            { id: 'leave', label: '다른 곳으로 옮긴다', fx: { stats: { relations: -1, happiness: 1 }, issues: { job: 2 } }, result: '고객사였던 곳에서 연락이 와 면접을 보았다.' },
          ],
          default: 'again',
        },
        reason: '승진 보류',
      }),
    ],
    burnout: 0.09,
  }),
  J('28211', '금융 및 보험 전문가', {
    entry: [
      E('degree', { minEdu: '4yr', majors: ['soc', 'sci'], ages: [24, 38], p: 0.1, text: '금융 회사 채용에 붙어 조사 분석 부서에서 일을 시작했다.' }),
    ],
    transitions: [
      tr('28221', [30, 52], 5, 0.03, '자산 운용으로 이동'),
      tr('28152', [32, 52], 5, 0.02, '인수합병 자문으로'),
      tr('28151', [35, 55], 6, 0.02, '컨설턴트로 이동'),
    ],
    events: [
      ev('28211', 'market_swing', {
        ages: [25, 58], p: 0.12, cooldown: 4,
        text: '시장이 크게 흔들렸다. 보고서 요청이 쏟아졌고 전화가 끊기지 않았다.',
        fx: { stats: { leisure: -3, happiness: -2 }, issues: { job: 2 } }, reason: '시장 급변',
      }),
      ev('28211', 'ai_summary', {
        years: [2023, 2100], ages: [26, 60], p: 0.12, once: true,
        text: '시장 요약 보고서를 프로그램이 쓴다. 분석가의 몫이 달라졌다.',
        choice: {
          prompt: '어떻게 달라질까?',
          options: [
            { id: 'deep', label: '깊이로 승부한다', fx: { stats: { intellect: 2, leisure: -3 }, issues: { tech: 3 } }, result: '현장 방문과 산업 조사를 늘려 보고서의 색을 달리했다.' },
            { id: 'tool', label: '도구와 함께 쓴다', fx: { stats: { leisure: 1, intellect: 1 }, issues: { tech: 4, job: 2 } }, result: '초안은 도구에 맡기고 검토에 시간을 썼다. 속도 기준이 올라갔다.' },
          ],
          default: 'tool',
        },
        reason: '보고서 자동화',
      }),
    ],
    burnout: 0.08,
  }),
  J('28452', '감정‧기술 영업 및 중개 관련 종사자', {
    entry: [
      E('license', { license: 'acct', minEdu: 'high', ages: [28, 68], p: 0.1, years: 1, text: '공인중개사 시험에 합격하고 중개사무소에 들어갔다.' }),
    ],
    transitions: [
      tr('28451', [35, 62], 6, 0.03, '부동산 컨설턴트로'),
      tr('13903', [45, 65], 8, 0.02, '아파트 관리소장으로'),
    ],
    events: [
      ev('28452', 'market_freeze', {
        ages: [28, 72], p: 0.14, cooldown: 4,
        text: '거래가 끊긴 달이 이어졌다. 사무소 월세는 그대로다.',
        fx: { stats: { wealth: -3, happiness: -2 }, issues: { housing: 3 } }, reason: '거래 절벽',
      }),
      ev('28452', 'deal_dispute', {
        ages: [28, 72], p: 0.12, cooldown: 3,
        text: '계약 뒤 집 상태를 두고 양쪽 말이 갈렸다. 두 사람이 사무실로 왔다.',
        choice: {
          prompt: '어떻게 중재할까?',
          options: [
            { id: 'mediate', label: '양쪽을 오가며 조정', fx: { stats: { relations: 2, leisure: -2, wealth: -2 } }, result: '며칠 동안 양쪽과 통화했다. 보수는 깎였지만 거래는 마무리됐다.' },
            { id: 'line', label: '책임 범위를 설명', fx: { stats: { happiness: -1, wealth: 2 }, issues: { conflict: 2 } }, result: '계약서와 확인서를 보여 주며 책임 범위를 설명했다. 분위기는 차가웠다.' },
          ],
          default: 'mediate',
        },
        reason: '계약 분쟁 중재',
      }),
    ],
    burnout: 0.05,
  }),
  // ───────── 2 전문가: 문화·예술·스포츠·식문화 ─────────
  J('29131', '작가 및 언론 관련 전문가', {
    entry: [
      E('hire', { minEdu: '4yr', majors: ['hum', 'soc'], ages: [23, 36], p: 0.04, text: '언론사 공채에 합격해 수습기자가 됐다.' }),
    ],
    transitions: [
      tr('28332', [33, 52], 5, 0.03, '기업 홍보 직무로'),
      tr('29111', [33, 52], 5, 0.02, '방송 작가로'),
      tr('29122', [33, 55], 5, 0.02, '출판 편집으로'),
    ],
    events: [
      ev('29131', 'breaking_night', {
        ages: [24, 58], p: 0.14, cooldown: 3,
        text: '큰 사건이 터져 사흘 동안 사무실에서 눈을 붙였다.',
        fx: { stats: { health: -3, leisure: -4, relations: -1 } }, reason: '긴급 취재',
      }),
      ev('29131', 'click_metric', {
        years: [2010, 2100], ages: [25, 58], p: 0.12, once: true,
        text: '기사 평가에 조회수 지표가 붙었다. 눈길 끄는 제목 요청도 늘었다.',
        choice: {
          prompt: '어떻게 할까?',
          options: [
            { id: 'follow', label: '지표를 따른다', fx: { stats: { wealth: 2, happiness: -3 }, issues: { job: -2 } }, result: '제목을 고쳐 쓰는 일이 늘었다. 평가표 숫자는 좋아졌다.' },
            { id: 'hold', label: '기사 기준을 지킨다', fx: { stats: { happiness: 3, relations: -1 }, issues: { job: 3 } }, result: '제목은 지금처럼 썼다. 면담에서 지표 이야기가 다시 나왔다.' },
          ],
          default: 'hold',
        },
        reason: '조회수 지표 도입',
      }),
    ],
    burnout: 0.07,
  }),
  J('29141', '작가 및 언론 관련 전문가', {
    entry: [
      E('degree', { minEdu: '4yr', majors: ['hum'], ages: [24, 48], p: 0.15, text: '외국어 전공을 살려 번역 회사와 개인 의뢰를 맡기 시작했다.' }),
    ],
    transitions: [
      tr('29142', [28, 52], 4, 0.02, '통역으로 확장'),
      tr('26419', [30, 58], 5, 0.03, '외국어 강사로'),
      tr('29122', [30, 55], 5, 0.02, '출판 편집으로'),
    ],
    events: [
      ev('29141', 'deadline_pileup', {
        ages: [24, 65], p: 0.15, cooldown: 3,
        text: '의뢰 세 건의 마감이 같은 주에 겹쳤다. 잠을 줄여 문장을 다듬었다.',
        fx: { stats: { health: -2, leisure: -3, wealth: 1 } }, reason: '번역 마감 중첩',
      }),
      ev('29141', 'machine_rate', {
        years: [2017, 2100], ages: [26, 65], p: 0.14, once: true,
        text: '기계번역 결과를 고치는 의뢰가 늘었다. 같은 분량의 단가는 내려갔다.',
        choice: {
          prompt: '어떻게 대응할까?',
          options: [
            { id: 'edit', label: '교정 의뢰를 받는다', fx: { stats: { wealth: -3, leisure: -1 }, issues: { tech: 3 } }, result: '건수는 유지했지만 한 건당 수입이 줄었다.' },
            { id: 'niche', label: '전문 분야로 좁힌다', fx: { stats: { intellect: 3, wealth: -2, leisure: -2 }, issues: { tech: 2, job: 2 } }, result: '의료·법률 번역 공부에 시간을 쓰기 시작했다.' },
          ],
          default: 'edit',
        },
        reason: '기계번역 확산',
      }),
    ],
    burnout: 0.05,
  }),
  J('29321', '연극‧영화 및 영상 전문가', {
    entry: [
      E('exam', { minEdu: 'none', ages: [18, 36], p: 0.02, years: 3, text: '극단 활동과 오디션 끝에 작은 배역을 맡기 시작했다.' }),
      E('degree', { minEdu: '4yr', majors: ['art'], ages: [22, 33], p: 0.05, text: '연극영화 전공으로 오디션을 거쳐 캐스팅됐다.' }),
    ],
    transitions: [
      tr('29395', [28, 55], 4, 0.04, '보조 연기자로 이동'),
      tr('29323', [28, 52], 4, 0.02, '성우로 이동'),
      tr('26479', [32, 62], 6, 0.04, '연기 강사로'),
    ],
    events: [
      ev('29321', 'gap_months', {
        ages: [20, 62], p: 0.15, cooldown: 3,
        text: '작품이 끝나고 몇 달째 일정이 비었다. 월세 날짜는 정해져 있다.',
        fx: { stats: { wealth: -3, happiness: -2 }, issues: { job: 3 } }, reason: '작품 사이 공백',
      }),
      ev('29321', 'offer_split', {
        ages: [22, 60], p: 0.11, cooldown: 4,
        text: '배역 제안이 둘 들어왔다. 대사 많은 조연과, 출연료 높은 짧은 광고다.',
        choice: {
          prompt: '어느 쪽을 맡을까?',
          options: [
            { id: 'role', label: '조연을 맡는다', fx: { stats: { happiness: 3, intellect: 2, wealth: -3, leisure: -2 } }, result: '대본을 외우는 밤이 이어졌다. 촬영장의 시간이 오래 마음에 남았다.' },
            { id: 'ad', label: '광고를 맡는다', fx: { stats: { wealth: 4, happiness: -1 } }, result: '하루 촬영으로 몇 달 치 생활비가 들어왔다.' },
          ],
          default: 'ad',
        },
        reason: '배역 제안',
      }),
    ],
    burnout: 0.04,
  }),
  J('29380', '연극‧영화 및 영상 전문가', {
    entry: [
      E('platform', { minEdu: 'none', ages: [16, 60], p: 0.03, era: [2012, null], text: '영상 플랫폼에 채널을 열고 영상을 올리기 시작했다.' }),
    ],
    transitions: [
      tr('29360', [22, 48], 3, 0.04, '영상 편집 일로 이동'),
      tr('28331', [25, 52], 3, 0.03, '광고 직무로 이동'),
      tr('53120', [25, 52], 3, 0.03, '온라인 판매로 이동'),
    ],
    events: [
      ev('29380', 'algorithm_shift', {
        ages: [16, 60], p: 0.14, cooldown: 3,
        text: '플랫폼의 추천 방식이 바뀌어 조회수가 절반 가까이 줄었다.',
        fx: { stats: { wealth: -3, happiness: -2 }, issues: { job: 4, tech: 3 } }, reason: '추천 방식 변경',
      }),
      ev('29380', 'upload_cadence', {
        ages: [16, 55], p: 0.12, cooldown: 4,
        text: '주 세 번 올리던 업로드 일정을 지키기가 점점 힘들다.',
        choice: {
          prompt: '어떻게 할까?',
          options: [
            { id: 'keep', label: '일정을 유지한다', fx: { stats: { health: -2, leisure: -3, wealth: 1 } }, result: '쉬는 날 없이 편집했다. 조회수는 비슷하게 유지됐다.' },
            { id: 'slow', label: '횟수를 줄인다', fx: { stats: { leisure: 2, wealth: -2, happiness: 1 }, issues: { job: 2 } }, result: '업로드를 주 한 번으로 줄였다. 구독자는 일부 떠났고 영상은 길어졌다.' },
          ],
          default: 'keep',
        },
        reason: '업로드 일정 조정',
      }),
    ],
    burnout: 0.1,
  }),
  J('29431', '시각 및 공연 예술가', {
    entry: [
      E('hire', { minEdu: 'none', ages: [18, 40], p: 0.02, text: '공모전과 투고를 거쳐 연재 계약을 맺었다.' }),
    ],
    transitions: [
      tr('29544', [28, 55], 3, 0.04, '삽화가로 이동'),
      tr('29432', [28, 50], 3, 0.02, '만화영화 작업으로'),
      tr('26469', [32, 60], 5, 0.03, '만화 강사로'),
    ],
    events: [
      ev('29431', 'weekly_deadline', {
        ages: [20, 55], p: 0.15, cooldown: 3,
        text: '주간 연재 마감이 이어진다. 손목과 어깨가 먼저 신호를 보냈다.',
        fx: { stats: { health: -3, leisure: -3, wealth: 1 } }, reason: '연재 마감',
      }),
      ev('29431', 'exclusive_offer', {
        ages: [22, 55], p: 0.11, once: true,
        text: '플랫폼이 독점 계약을 제안했다. 고료는 안정되나 다른 곳엔 못 싣는다.',
        choice: {
          prompt: '어떻게 할까?',
          options: [
            { id: 'sign', label: '독점 계약', fx: { stats: { wealth: 4, relations: -1, happiness: -1 }, issues: { job: -2, fairness: 2 } }, result: '고정 원고료가 들어왔다. 작품의 다음 행보가 계약서 안에 들어갔다.' },
            { id: 'free', label: '자유 연재 유지', fx: { stats: { wealth: -2, happiness: 1 }, issues: { job: 3 } }, result: '여러 곳에 나눠 연재하기로 했다. 수입은 달마다 달랐다.' },
          ],
          default: 'sign',
        },
        reason: '독점 계약 제안',
      }),
    ],
    burnout: 0.09,
  }),
  J('29461', '시각 및 공연 예술가', {
    entry: [
      E('exam', { minEdu: 'none', ages: [15, 28], p: 0.02, years: 3, text: '오디션과 연습생 과정을 거쳐 데뷔했다.' }),
    ],
    transitions: [
      tr('29452', [28, 48], 3, 0.03, '작곡·편곡으로 이동'),
      tr('26472', [28, 58], 4, 0.04, '음악 강사로'),
      tr('29333', [28, 50], 3, 0.01, '방송 진행으로'),
    ],
    events: [
      ev('29461', 'off_cycle', {
        ages: [18, 50], p: 0.15, cooldown: 3,
        text: '앨범 활동이 끝나자 일정이 비었다. 다음 앨범은 언제 나올지 모른다.',
        fx: { stats: { wealth: -2, happiness: -2 }, issues: { job: 3 } }, reason: '활동 공백',
      }),
      ev('29461', 'settlement', {
        ages: [19, 45], p: 0.11, once: true,
        text: '정산 내역에 이해되지 않는 항목이 있다. 소속사에 물어볼지 고민한다.',
        choice: {
          prompt: '어떻게 할까?',
          options: [
            { id: 'ask', label: '정식으로 문의', fx: { stats: { happiness: 3, relations: -2 }, issues: { fairness: -2, conflict: 2 } }, result: '서면으로 문의했다. 답변은 늦게 왔고 일부 항목이 정정됐다.' },
            { id: 'skip', label: '일단 넘어간다', fx: { stats: { relations: 1, happiness: -3 }, issues: { fairness: 4 } }, result: '활동에 지장이 없도록 그냥 넘겼다. 마음에 걸린 숫자는 남아 있다.' },
          ],
          default: 'skip',
        },
        reason: '정산 내역 문의',
      }),
    ],
    burnout: 0.07,
  }),
  J('29554', '디자이너', {
    entry: [
      E('degree', { minEdu: '4yr', majors: ['art', 'eng'], ages: [23, 36], p: 0.2, era: [2007, null], text: '디자인 전공과 포트폴리오로 정보 기술 회사에 채용됐다.' }),
      E('hire', { minEdu: '2yr', ages: [22, 40], p: 0.1, era: [2014, null], text: '교육과정과 포트폴리오로 신입 디자이너가 됐다.' }),
    ],
    transitions: [
      tr('29551', [27, 48], 3, 0.03, '웹 디자이너로 이동'),
      tr('22241', [28, 50], 4, 0.03, '서비스 기획으로'),
      tr('29555', [28, 50], 3, 0.02, '실감형 콘텐츠 디자이너로'),
    ],
    events: [
      ev('29554', 'revision_loop', {
        ages: [23, 55], p: 0.15, cooldown: 3,
        text: '시안 수정 요청이 열 번 넘게 돌아왔다. 결국 처음 안으로 돌아갔다.',
        fx: { stats: { happiness: -2, leisure: -2 } }, reason: '시안 수정 반복',
      }),
      ev('29554', 'ai_generate', {
        years: [2023, 2100], ages: [24, 58], p: 0.14, once: true,
        text: '화면 시안을 자동으로 만들어 주는 도구가 팀에 들어왔다.',
        choice: {
          prompt: '어떻게 쓸까?',
          options: [
            { id: 'direct', label: '방향 설정에 집중', fx: { stats: { intellect: 1, leisure: 1 }, issues: { tech: 3, job: 2 } }, result: '도구가 만든 안을 고르고 다듬는 일이 주 업무가 됐다.' },
            { id: 'craft', label: '직접 그리는 일 유지', fx: { stats: { happiness: 1, leisure: -2 }, issues: { tech: 2, job: 3 } }, result: '직접 만든 시안으로 승부했다. 팀의 속도 기준과는 차이가 났다.' },
          ],
          default: 'direct',
        },
        reason: '시안 자동 생성 도구',
      }),
    ],
    burnout: 0.07,
  }),
  J('29620', '스포츠 및 레크리에이션 관련 전문가', {
    entry: [
      E('exam', { minEdu: 'none', ages: [17, 27], p: 0.03, years: 6, text: '어릴 때부터 이어 온 엘리트 훈련 끝에 구단과 실업팀에 입단했다.' }),
    ],
    transitions: [
      tr('29612', [30, 42], 3, 0.08, '코치로 이동'),
      tr('29640', [28, 45], 3, 0.06, '트레이너로 이동'),
      tr('29631', [30, 48], 5, 0.03, '심판으로 이동'),
    ],
    events: [
      ev('29620', 'injury_return', {
        ages: [18, 40], p: 0.12, cooldown: 3,
        text: '시즌 중 부상으로 재활에 들어갔다. 계약 갱신이 걸린 시즌이다.',
        choice: {
          prompt: '복귀 시점은?',
          options: [
            { id: 'rush', label: '서둘러 복귀', fx: { stats: { health: -5, wealth: 2 }, issues: { job: -2 } }, result: '예정보다 일찍 경기에 나섰다. 무릎에는 무거운 감각이 남았다.' },
            { id: 'full', label: '완전히 회복 후', fx: { stats: { health: 2, wealth: -2 }, issues: { job: 3 } }, result: '재활을 끝까지 마쳤다. 그 사이 자리는 다른 선수가 채웠다.' },
          ],
          default: 'full',
        },
        reason: '부상 후 복귀',
      }),
      ev('29620', 'career_end', {
        ages: [30, 41], p: 0.15, once: true,
        text: '선수 생활의 끝이 보이기 시작했다. 다음 일을 생각해야 한다.',
        fx: { stats: { happiness: -1 }, issues: { job: 4 } }, reason: '선수 생활 후반',
      }),
    ],
    hazard: 2, burnout: 0.04,
  }),
  J('29640', '스포츠 및 레크리에이션 관련 전문가', {
    entry: [
      E('hire', { minEdu: '2yr', majors: ['edu'], ages: [20, 46], p: 0.2, era: [1985, null], text: '체육 전공과 자격을 갖추고 운동 센터에 채용됐다.' }),
      E('self', { minEdu: 'none', ages: [26, 52], p: 0.05, text: '개인 수업을 받던 회원들을 모아 직접 시작했다.' }),
    ],
    transitions: [
      tr('29612', [30, 52], 4, 0.03, '코치로 이동'),
      tr('52111', [32, 58], 4, 0.02, '다른 가게를 열어'),
    ],
    events: [
      ev('29640', 'member_slump', {
        ages: [21, 55], p: 0.14, cooldown: 3,
        text: '새해 특수가 지나자 회원 수가 눈에 띄게 줄었다.',
        fx: { stats: { wealth: -2, happiness: -1 }, issues: { job: 2 } }, reason: '회원 수 감소',
      }),
      ev('29640', 'own_studio', {
        ages: [26, 52], p: 0.11, once: true,
        text: '센터에서 오래 일했다. 작은 공간을 얻어 직접 해 볼 생각이 든다.',
        choice: {
          prompt: '어떻게 할까?',
          options: [
            { id: 'open', label: '공간을 연다', fx: { stats: { wealth: -2, leisure: -3, happiness: 1 }, money: { debt: 3500 } }, result: '보증금과 기구 값을 빌려 작은 공간을 열었다. 첫 달 회원은 열 명.' },
            { id: 'stay', label: '소속으로 남는다', fx: { stats: { leisure: 1, wealth: -1 }, issues: { job: 1 } }, result: '월급이 일정한 쪽을 택했다.' },
          ],
          default: 'stay',
        },
        reason: '독립 고민',
      }),
    ],
    burnout: 0.05,
  }),
  J('29701', '식문화 관련 전문가', {
    entry: [
      E('promote', { from: ['45110', '45120', '45130', '45140'], minYears: 8, ages: [30, 56], p: 0.1, text: '조리사로 오래 일해 주방장이 됐다.' }),
    ],
    transitions: [
      tr('15220', [40, 60], 6, 0.03, '점장 겸 관리로 이동'),
      tr('52111', [35, 58], 6, 0.03, '가게를 열어 독립'),
      tr('26463', [38, 62], 8, 0.02, '요리 강사로'),
    ],
    events: [
      ev('29701', 'kitchen_burn', {
        ages: [28, 62], p: 0.14, cooldown: 3,
        text: '바쁜 저녁에 손등에 화상을 입었다. 장갑을 낀 채 주문을 이어 갔다.',
        fx: { stats: { health: -2, leisure: -1 } }, reason: '주방 작업 중 부상',
      }),
      ev('29701', 'cost_pressure', {
        ages: [30, 62], p: 0.12, cooldown: 4,
        text: '재료값이 올라 메뉴 단가가 맞지 않는다.',
        choice: {
          prompt: '어떻게 조정할까?',
          options: [
            { id: 'trim', label: '메뉴를 줄인다', fx: { stats: { leisure: 1, happiness: -2, wealth: -1 }, issues: { living: 2 } }, result: '품목을 줄이고 재료를 겹치게 짰다. 단골 몇이 아쉽다고 했다.' },
            { id: 'price', label: '가격을 올린다', fx: { stats: { relations: -1, wealth: 2 }, issues: { living: 3, conflict: 1 } }, result: '가격표를 고쳤다. 첫 주에는 손님 반응이 조용했다.' },
          ],
          default: 'price',
        },
        reason: '재료값 상승',
      }),
    ],
    burnout: 0.07,
  }),
  // ───────── 3 사무 ─────────
  J('31110', '기획 및 마케팅 사무원', {
    entry: [
      E('hire', { minEdu: '4yr', majors: ['soc', 'eng'], ages: [23, 34], p: 0.15, text: '4년제를 졸업하고 기업 공채에 합격해 기획 부서에 배치됐다.' }),
    ],
    transitions: [
      tr('12122', [38, 52], 10, 0.05, '기획 관리자로 승진'),
      tr('28151', [32, 50], 5, 0.02, '컨설턴트로 이직'),
      tr('22420', [28, 45], 3, 0.02, '데이터 분석 직무로'),
    ],
    events: [
      ev('31110', 'exec_report', {
        ages: [24, 55], p: 0.15, cooldown: 3,
        text: '경영진 보고 전날 자료의 틀이 바뀌었다. 밤 열두 시에 다시 시작했다.',
        fx: { stats: { leisure: -3, happiness: -1, health: -1 } }, reason: '경영진 보고 준비',
      }),
      ev('31110', 'reorg', {
        ages: [28, 55], p: 0.11, cooldown: 4,
        text: '조직 개편으로 기획 부서가 다른 부서와 합쳐진다는 공지가 떴다.',
        choice: {
          prompt: '어떻게 할까?',
          options: [
            { id: 'merge', label: '새 부서에 적응', fx: { stats: { relations: -1, leisure: -1, wealth: 1 }, issues: { job: 2 } }, result: '낯선 팀 사이에서 일하는 방식을 다시 맞췄다.' },
            { id: 'look', label: '이직을 알아본다', fx: { stats: { happiness: -2, leisure: -2 }, issues: { job: 3 } }, result: '퇴근 후 이력서를 고쳐 쓰며 몇 군데 지원했다.' },
          ],
          default: 'merge',
        },
        reason: '조직 개편',
      }),
    ],
    burnout: 0.07,
  }),
  J('31210', '인사 및 교육‧훈련 사무원', {
    entry: [
      E('hire', { minEdu: '4yr', majors: ['soc', 'hum'], ages: [23, 36], p: 0.12, text: '기업 공채에 합격해 인사 부서에서 일을 시작했다.' }),
    ],
    transitions: [
      tr('12121', [38, 55], 8, 0.05, '총무·인사 관리자로'),
      tr('28111', [32, 50], 4, 0.01, '노무사 자격을 준비해'),
      tr('28113', [35, 52], 6, 0.01, '헤드헌터로 독립'),
    ],
    events: [
      ev('31210', 'hiring_season', {
        ages: [24, 55], p: 0.15, cooldown: 3,
        text: '채용 시즌이다. 이력서를 거르고 면접을 조율하다 한 달이 갔다.',
        fx: { stats: { leisure: -3, happiness: -1 } }, reason: '채용 시즌',
      }),
      ev('31210', 'wage_talk', {
        ages: [28, 58], p: 0.11, cooldown: 4,
        text: '임금 협상 자리에서 노조와 경영진 사이에 끼었다.',
        choice: {
          prompt: '어떻게 할까?',
          options: [
            { id: 'between', label: '중간에서 조율', fx: { stats: { leisure: -3, relations: 2 }, issues: { conflict: 2 } }, result: '양쪽 사정을 전하며 몇 주를 보냈다. 합의안이 나온 날 모두 지쳤다.' },
            { id: 'company', label: '회사 안을 설명', fx: { stats: { relations: -3, happiness: -1 }, issues: { conflict: 3 } }, result: '회사 입장을 설명하는 자리에 나섰다. 복도에서 눈 피하는 사람이 생겼다.' },
          ],
          default: 'between',
        },
        reason: '임금 협상',
      }),
    ],
    burnout: 0.06,
  }),
  J('32121', '자재 및 생산관리 사무원', {
    entry: [
      E('hire', { minEdu: '2yr', majors: ['eng'], ages: [22, 38], p: 0.15, text: '제조 업체에 채용돼 생산 일정을 맞추는 일을 맡았다.' }),
    ],
    transitions: [
      tr('14135', [40, 56], 10, 0.04, '생산 관리자로'),
      tr('32110', [28, 50], 4, 0.03, '자재 관리로 이동'),
      tr('15113', [32, 52], 5, 0.01, '무역 관련 직무로'),
    ],
    events: [
      ev('32121', 'supply_delay', {
        ages: [23, 58], p: 0.14, cooldown: 3,
        text: '부품 입고가 늦어져 납기가 흔들린다. 거래처에서 계속 전화가 온다.',
        choice: {
          prompt: '어떻게 대응할까?',
          options: [
            { id: 'rush', label: '급송으로 조달', fx: { stats: { leisure: -3, happiness: -1, wealth: -1 }, issues: { job: -1 } }, result: '비용을 더 들여 부품을 당겼다. 납기는 지켰고 보고서는 길어졌다.' },
            { id: 'adjust', label: '납기 조정 요청', fx: { stats: { relations: -1, happiness: -1 }, issues: { job: 2, conflict: 2 } }, result: '거래처에 사정을 설명하고 납기를 미뤘다. 담당자 목소리가 낮아졌다.' },
          ],
          default: 'adjust',
        },
        reason: '자재 입고 지연',
      }),
      ev('32121', 'system_switch', {
        ages: [24, 58], p: 0.09, cooldown: 5,
        text: '생산 관리 시스템이 새로 바뀌었다. 두 시스템을 한동안 같이 입력했다.',
        fx: { stats: { leisure: -2, intellect: 1 }, issues: { tech: 2 } }, reason: '시스템 교체',
      }),
    ],
    burnout: 0.05,
  }),
  J('33110', '회계 및 경리 사무원', {
    entry: [
      E('hire', { minEdu: '2yr', majors: ['soc'], ages: [21, 40], p: 0.2, text: '회계 자격을 갖추고 중소기업 회계 자리에 들어갔다.' }),
    ],
    transitions: [
      tr('12123', [40, 58], 10, 0.03, '재무 관리자로'),
      tr('28130', [32, 55], 5, 0.01, '세무사 시험에 도전'),
      tr('33201', [30, 58], 4, 0.02, '자료 관리 직무로'),
    ],
    events: [
      ev('33110', 'closing_month', {
        ages: [22, 60], p: 0.15, cooldown: 3,
        text: '결산월이다. 숫자가 맞지 않아 전표를 처음부터 다시 대조했다.',
        fx: { stats: { leisure: -3, health: -1 } }, reason: '결산 대조',
      }),
      ev('33110', 'auto_entry', {
        years: [2018, 2100], ages: [24, 60], p: 0.14, once: true,
        text: '전표를 자동으로 처리하는 프로그램이 도입됐다. 입력하던 일이 줄었다.',
        choice: {
          prompt: '어떻게 대응할까?',
          options: [
            { id: 'review', label: '검토 업무를 맡는다', fx: { stats: { intellect: 1, wealth: 1 }, issues: { tech: 3 } }, result: '자동 처리된 전표의 오류를 찾는 일이 주 업무가 됐다.' },
            { id: 'study', label: '자격 공부를 한다', fx: { stats: { intellect: 3, leisure: -3, wealth: -1 }, issues: { tech: 2, job: 2 } }, result: '퇴근 후 세무와 회계 공부를 시작했다.' },
          ],
          default: 'review',
        },
        reason: '전표 자동 처리',
      }),
    ],
    burnout: 0.05,
  }),
  J('33120', '회계 및 경리 사무원', {
    entry: [
      E('hire', { minEdu: 'high', ages: [19, 42], p: 0.25, text: '상업 계열 과정을 마치고 작은 회사 경리로 들어갔다.' }),
    ],
    transitions: [
      tr('33110', [26, 48], 4, 0.04, '회계 직무로 이동'),
      tr('37101', [28, 56], 4, 0.03, '총무 직무로 이동'),
      tr('34090', [28, 50], 4, 0.02, '금융 사무로'),
    ],
    events: [
      ev('33120', 'cash_gap', {
        ages: [20, 60], p: 0.15, cooldown: 3,
        text: '장부와 통장 잔액이 만 원 단위로 안 맞았다. 종일 영수증을 뒤졌다.',
        fx: { stats: { leisure: -2, happiness: -1 } }, reason: '잔액 대조 오류',
      }),
      ev('33120', 'extra_errands', {
        ages: [20, 60], p: 0.12, cooldown: 4,
        text: '작은 회사라 대표 집안일까지 부탁이 넘어온다. 업무 범위가 흐려졌다.',
        choice: {
          prompt: '어떻게 할까?',
          options: [
            { id: 'line', label: '선을 긋는다', fx: { stats: { happiness: 2, relations: -2 }, issues: { conflict: 2 } }, result: '업무 범위를 정중히 말했다. 한동안 윗사람의 태도가 서먹했다.' },
            { id: 'bear', label: '그냥 맡는다', fx: { stats: { leisure: -3, happiness: -1, relations: 1 } }, result: '부탁을 들어주었다. 요청은 이후에도 이어졌다.' },
          ],
          default: 'bear',
        },
        reason: '업무 범위 문제',
      }),
    ],
    burnout: 0.05,
  }),
  J('34010', '금융 사무 종사자', {
    entry: [
      E('hire', { minEdu: '2yr', ages: [21, 34], p: 0.1, text: '금융 회사 창구 직원으로 채용됐다.' }),
    ],
    transitions: [
      tr('34030', [26, 42], 3, 0.05, '은행 사무로 이동'),
      tr('51032', [28, 52], 3, 0.02, '보험 설계사로'),
      tr('36202', [28, 55], 3, 0.02, '상담 직무로'),
    ],
    events: [
      ev('34010', 'branch_close', {
        years: [2010, 2100], ages: [24, 58], p: 0.12, cooldown: 4,
        text: '지점이 통폐합돼 창구 인원이 줄었다. 남은 직원이 번호표를 더 받는다.',
        fx: { stats: { happiness: -1, leisure: -1 }, issues: { job: 5, tech: 3 } }, reason: '지점 통폐합',
      }),
      ev('34010', 'waiting_anger', {
        ages: [22, 58], p: 0.14, cooldown: 3,
        text: '대기 시간이 길어지자 창구 앞에서 고성이 오갔다. 사과를 여러 번 했다.',
        fx: { stats: { happiness: -2, relations: -1 } }, reason: '창구 민원',
      }),
    ],
    burnout: 0.06,
  }),
  J('34030', '금융 사무 종사자', {
    entry: [
      E('hire', { minEdu: '4yr', majors: ['soc'], ages: [23, 33], p: 0.04, text: '금융 회사 공채에 합격해 영업점에서 일을 시작했다.' }),
    ],
    transitions: [
      tr('13202', [45, 58], 12, 0.03, '금융 관리자로 승진'),
      tr('34090', [28, 50], 4, 0.02, '다른 금융 사무로'),
      tr('28211', [30, 50], 5, 0.01, '분석 직무로'),
    ],
    events: [
      ev('34030', 'product_target', {
        ages: [24, 55], p: 0.14, cooldown: 3,
        text: '금융 상품 판매 목표가 월말마다 내려온다. 필요 없는 고객도 있다.',
        choice: {
          prompt: '어떻게 권유할까?',
          options: [
            { id: 'target', label: '목표를 채운다', fx: { stats: { wealth: 1, happiness: -2 }, issues: { fairness: 2 } }, result: '목표는 채웠다. 마지막 상담 뒤 마음이 무거웠다.' },
            { id: 'fit', label: '고객 상황부터 본다', fx: { stats: { relations: 1, happiness: 1 }, issues: { job: 3 } }, result: '필요한 고객에게만 권했다. 월말 평가표에는 숫자가 모자랐다.' },
          ],
          default: 'target',
        },
        reason: '상품 판매 목표',
      }),
      ev('34030', 'app_shift', {
        years: [2012, 2100], ages: [24, 58], p: 0.11, cooldown: 4,
        text: '업무 대부분이 모바일 앱으로 넘어갔다. 영업점에는 어르신이 늘었다.',
        fx: { stats: { relations: 1 }, issues: { tech: 3, job: 2 } }, reason: '비대면 전환',
      }),
    ],
    burnout: 0.05,
  }),
  J('34052', '금융 사무 종사자', {
    entry: [
      E('hire', { minEdu: 'high', ages: [22, 52], p: 0.2, era: [1990, null], text: '채권추심 회사에 채용돼 연체 채권 담당을 맡았다.' }),
    ],
    transitions: [
      tr('36202', [25, 55], 3, 0.03, '상담 직무로 이동'),
      tr('34022', [30, 56], 4, 0.02, '보험 사무로 이동'),
      tr('36203', [28, 56], 3, 0.02, '방문 상담으로'),
    ],
    events: [
      ev('34052', 'harsh_call', {
        ages: [23, 58], p: 0.15, cooldown: 3,
        text: '통화 너머의 채무자가 한참 소리를 높였다. 통화를 기록으로 남겼다.',
        fx: { stats: { happiness: -3, health: -1 } }, reason: '독촉 통화 스트레스',
      }),
      ev('34052', 'recovery_goal', {
        ages: [23, 58], p: 0.12, cooldown: 4,
        text: '회수율 목표가 올랐다. 어려운 채무자의 상환 계획을 조정할 여지가 있다.',
        choice: {
          prompt: '어떻게 처리할까?',
          options: [
            { id: 'rule', label: '규정대로 독촉', fx: { stats: { wealth: 2, happiness: -3 }, issues: { conflict: 2 } }, result: '독촉 일정을 지켰다. 그 주 실적은 올랐고 마음은 가라앉았다.' },
            { id: 'plan', label: '상환 계획을 조정', fx: { stats: { happiness: 2, relations: 1, wealth: -1 }, issues: { job: 2 } }, result: '분할 상환안을 만들어 보고했다. 실적 면담이 길어졌다.' },
          ],
          default: 'rule',
        },
        reason: '회수 목표와 상환 조정',
      }),
    ],
    burnout: 0.1,
  }),
  J('35210', '정부 행정 사무 종사자', {
    entry: [
      E('exam', { minEdu: 'high', ages: [20, 36], p: 0.07, years: 2, text: '세무직 공무원 시험에 합격해 세무서에 배치됐다.' }),
    ],
    transitions: [
      tr('28130', [45, 60], 20, 0.04, '퇴직 후 세무사로'),
      tr('35290', [28, 52], 5, 0.02, '일반 행정으로 이동'),
      tr('35220', [28, 52], 5, 0.02, '관세 행정으로 이동'),
    ],
    events: [
      ev('35210', 'filing_rush', {
        ages: [21, 58], p: 0.15, cooldown: 3,
        text: '신고 기간이다. 민원 창구에 줄이 이어졌고 상담 전화는 끊기지 않았다.',
        fx: { stats: { leisure: -3, happiness: -1 } }, reason: '신고 기간 민원',
      }),
      ev('35210', 'rotation', {
        ages: [24, 58], p: 0.11, cooldown: 4,
        text: '순환 보직으로 낯선 부서에 가게 됐다. 서류 이름부터 다시 배워야 한다.',
        fx: { stats: { intellect: 1, leisure: -1 }, issues: { job: 1 } }, reason: '순환 보직',
      }),
    ],
    burnout: 0.05,
  }),
  J('35290', '정부 행정 사무 종사자', {
    entry: [
      E('exam', { minEdu: 'high', ages: [19, 38], p: 0.06, years: 3, text: '공무원 시험에 합격해 행정직으로 임용됐다.' }),
    ],
    transitions: [
      tr('35210', [28, 50], 3, 0.02, '세무직으로 이동'),
      tr('27210', [35, 52], 10, 0.01, '정책 직무로 이동'),
      tr('25310', [30, 52], 5, 0.01, '복지 직무로 이동'),
    ],
    events: [
      ev('35290', 'complaint_window', {
        ages: [20, 60], p: 0.14, cooldown: 3,
        text: '민원 창구에서 같은 요구가 세 번 반복됐다. 규정상 해 줄 수 없다.',
        choice: {
          prompt: '어떻게 응대할까?',
          options: [
            { id: 'explain', label: '다시 차분히 설명', fx: { stats: { happiness: -1, leisure: -2, relations: 1 } }, result: '규정과 대안을 한 번 더 설명했다. 민원인은 표정이 굳은 채 돌아갔다.' },
            { id: 'senior', label: '상급자에게 연결', fx: { stats: { happiness: 2, relations: -1 }, issues: { conflict: 1 } }, result: '상급자를 연결했다. 책임이 나뉜 기분이었다.' },
          ],
          default: 'explain',
        },
        reason: '민원 응대',
      }),
      ev('35290', 'rotation', {
        ages: [22, 60], p: 0.12, cooldown: 3,
        text: '정기 인사로 부서가 바뀌었다. 지난해 익힌 업무 방식이 쓸모를 잃었다.',
        fx: { stats: { intellect: 1, leisure: -1 }, issues: { job: 1 } }, reason: '정기 인사',
      }),
    ],
    burnout: 0.04,
  }),
  J('36202', '고객 상담 및 모니터 요원', {
    entry: [
      E('hire', { minEdu: 'high', ages: [19, 52], p: 0.25, era: [1995, null], text: '상담센터에 채용돼 고객 전화를 받기 시작했다.' }),
    ],
    transitions: [
      tr('36201', [28, 56], 3, 0.02, '의료 상담 직무로'),
      tr('53130', [22, 52], 2, 0.03, '판매 상담으로 이동'),
      tr('37101', [28, 56], 3, 0.02, '사무 직무로 이동'),
    ],
    events: [
      ev('36202', 'abusive_call', {
        ages: [20, 58], p: 0.18, cooldown: 3,
        text: '통화 중 고객이 거친 말을 이어 갔다. 매뉴얼대로 통화를 마쳤다.',
        fx: { stats: { happiness: -3, health: -1 } }, reason: '거친 말을 듣는 통화',
      }),
      ev('36202', 'chatbot', {
        years: [2020, 2100], ages: [22, 60], p: 0.14, once: true,
        text: '상담 챗봇이 단순 문의를 가져갔다. 남은 전화는 대체로 더 복잡하다.',
        choice: {
          prompt: '어떻게 할까?',
          options: [
            { id: 'complex', label: '복잡한 상담 담당', fx: { stats: { intellect: 2, relations: 1, happiness: -2, leisure: -1 }, issues: { tech: 3 } }, result: '쉬운 전화가 줄고 풀어야 할 전화가 늘었다. 통화 시간이 길어졌다.' },
            { id: 'bot', label: '챗봇 운영으로 전환', fx: { stats: { leisure: 2, intellect: 1 }, issues: { tech: 4, job: 2 } }, result: '답변 시나리오를 다듬는 일로 옮겼다. 자리가 남을지는 알 수 없다.' },
          ],
          default: 'complex',
        },
        reason: '상담 챗봇 도입',
      }),
    ],
    burnout: 0.12,
  }),
  J('37101', '총무 사무원 및 대학 행정조교', {
    entry: [
      E('hire', { minEdu: '2yr', ages: [21, 42], p: 0.2, text: '중소기업에 채용돼 총무 업무를 맡았다.' }),
    ],
    transitions: [
      tr('12121', [38, 56], 8, 0.04, '총무·인사 관리자로'),
      tr('31210', [28, 50], 4, 0.02, '인사 직무로 이동'),
      tr('37102', [28, 52], 3, 0.02, '대학 행정으로 이동'),
    ],
    events: [
      ev('37101', 'errand_load', {
        ages: [22, 60], p: 0.15, cooldown: 3,
        text: '행사 준비, 비품 주문, 민원 전화가 같은 날 한꺼번에 들어왔다.',
        fx: { stats: { leisure: -2, happiness: -1 } }, reason: '잡무 집중',
      }),
      ev('37101', 'budget_cut', {
        ages: [24, 60], p: 0.11, cooldown: 4,
        text: '비용 절감 지시로 비품과 행사 예산이 줄었다. 불만이 총무에게 왔다.',
        fx: { stats: { relations: -2, happiness: -1 }, issues: { conflict: 2 } }, reason: '예산 삭감 전달',
      }),
    ],
    burnout: 0.05,
  }),
  J('37212', '비서 및 사무 지원 종사자', {
    entry: [
      E('hire', { minEdu: '2yr', ages: [21, 40], p: 0.15, text: '회사에 채용돼 경영진 비서로 일하기 시작했다.' }),
    ],
    transitions: [
      tr('37101', [28, 56], 4, 0.03, '총무 직무로 이동'),
      tr('31110', [30, 50], 4, 0.02, '기획 직무로 이동'),
      tr('31220', [30, 55], 4, 0.02, '교육 업무로 이동'),
    ],
    events: [
      ev('37212', 'boss_change', {
        ages: [23, 58], p: 0.14, cooldown: 4,
        text: '모시던 상사가 바뀌었다. 일정 관리 방식부터 새로 맞춰야 한다.',
        choice: {
          prompt: '어떻게 맞출까?',
          options: [
            { id: 'adapt', label: '새 방식에 맞춘다', fx: { stats: { leisure: -3, relations: 1 } }, result: '새 상사의 습관을 파악하는 데 몇 달이 걸렸다.' },
            { id: 'scope', label: '업무 범위를 협의', fx: { stats: { happiness: 2, relations: -1 }, issues: { conflict: 1 } }, result: '맡을 일과 아닌 일을 정리해 합의했다. 처음엔 어색했다.' },
          ],
          default: 'adapt',
        },
        reason: '상사 교체',
      }),
      ev('37212', 'calendar_tool', {
        years: [2022, 2100], ages: [24, 60], p: 0.12, once: true,
        text: '일정 조율과 회의록을 돕는 프로그램이 들어왔다. 하던 일 일부가 줄었다.',
        fx: { stats: { leisure: 1 }, issues: { tech: 3, job: 3 } }, reason: '일정·회의록 자동화',
      }),
    ],
    burnout: 0.05,
  }),
  J('37239', '비서 및 사무 지원 종사자', {
    entry: [
      E('hire', { minEdu: 'high', ages: [18, 55], p: 0.3, era: [1980, null], text: '단기 계약으로 자료 입력 업무를 맡았다.' }),
    ],
    transitions: [
      tr('37101', [24, 58], 3, 0.03, '총무 직무로 이동'),
      tr('33120', [22, 52], 2, 0.03, '경리 직무로 이동'),
      tr('36202', [22, 55], 2, 0.03, '상담 직무로 이동'),
    ],
    events: [
      ev('37239', 'contract_end', {
        ages: [18, 60], p: 0.15, cooldown: 3,
        text: '계약 기간이 끝났고 재계약은 없다고 했다. 입력은 프로그램이 맡는다.',
        fx: { stats: { wealth: -2, happiness: -2 }, issues: { job: 6, tech: 3 } }, reason: '계약 만료',
      }),
      ev('37239', 'ocr_shift', {
        years: [2018, 2100], ages: [20, 62], p: 0.12, once: true,
        text: '문서를 자동으로 읽는 도구가 들어왔다. 입력하던 일이 검수로 바뀐다.',
        choice: {
          prompt: '어떻게 할까?',
          options: [
            { id: 'check', label: '검수 업무로 전환', fx: { stats: { intellect: 2, leisure: -1 }, issues: { tech: 3 } }, result: '자동으로 입력된 자료를 확인하는 일을 맡았다. 인원은 절반으로 줄었다.' },
            { id: 'other', label: '다른 일을 찾는다', fx: { stats: { happiness: -2, leisure: -2, wealth: 1 }, issues: { job: 4 } }, result: '구직 사이트를 매일 열어 보게 됐다.' },
          ],
          default: 'check',
        },
        reason: '입력 자동화',
      }),
    ],
    burnout: 0.04,
  }),
  // ───────── 4 서비스: 안전·돌봄 ─────────
  J('41112', '경찰‧소방 및 교도 관련 종사자', {
    entry: [
      E('exam', { minEdu: 'high', ages: [20, 33], p: 0.06, years: 2, text: '경찰 공채에 합격해 순경으로 임용됐다.' }),
    ],
    transitions: [
      tr('41111', [28, 42], 4, 0.01, '해양경찰로 이동'),
      tr('15303', [48, 60], 20, 0.04, '퇴직 후 보안 업계'),
      tr('41231', [52, 64], 20, 0.04, '퇴직 후 경비 일'),
    ],
    events: [
      ev('41112', 'night_duty', {
        ages: [21, 58], p: 0.17, cooldown: 3,
        text: '야간 근무가 이어지는 주기다. 지구대에는 새벽에도 신고가 끊기지 않았다.',
        fx: { stats: { health: -3, leisure: -3, relations: -1 } }, reason: '교대 야간 근무',
      }),
      ev('41112', 'scam_reports', {
        years: [2008, 2100], ages: [22, 60], p: 0.12, cooldown: 4,
        text: '보이스피싱 피해 신고가 이어졌다. 돈은 이미 빠져나간 뒤가 많았다.',
        fx: { stats: { happiness: -2, leisure: -1 } }, reason: '피해 신고 응대',
      }),
    ],
    hazard: 2, burnout: 0.07,
  }),
  J('41120', '경찰‧소방 및 교도 관련 종사자', {
    entry: [
      E('exam', { minEdu: 'high', ages: [20, 34], p: 0.06, years: 2, text: '소방공무원 공채에 합격해 소방사로 임용됐다.' }),
    ],
    transitions: [
      tr('24912', [28, 46], 4, 0.02, '구급 업무로 이동'),
      tr('13133', [50, 60], 20, 0.03, '소방 관리자로 승진'),
      tr('23622', [48, 62], 20, 0.03, '소방시설 기술자로'),
    ],
    events: [
      ev('41120', 'smoke_cough', {
        ages: [22, 58], p: 0.11, cooldown: 4,
        text: '화재 출동 뒤 방화복에서 연기 냄새가 며칠 갔다. 기침이 오래 갔다.',
        fx: { stats: { health: -3 }, issues: { medical: 3 } }, reason: '화재 현장 노출',
      }),
      ev('41120', 'standby_cycle', {
        ages: [22, 58], p: 0.15, cooldown: 3,
        text: '대기 근무 주기라 하루 걸러 집을 비웠다. 가족 행사에 또 빠졌다.',
        fx: { stats: { leisure: -3, relations: -2 } }, reason: '교대 근무 주기',
      }),
    ],
    hazard: 3, burnout: 0.07,
  }),
  J('41132', '경찰‧소방 및 교도 관련 종사자', {
    entry: [
      E('exam', { minEdu: 'high', ages: [20, 36], p: 0.06, years: 2, text: '교정직 공무원 시험에 합격해 교정시설에 배치됐다.' }),
    ],
    transitions: [
      tr('13134', [50, 60], 20, 0.03, '교도 관리자로 승진'),
      tr('41112', [26, 40], 4, 0.01, '경찰로 이동'),
      tr('15303', [50, 62], 18, 0.03, '퇴직 후 보안 업계'),
    ],
    events: [
      ev('41132', 'shift_change', {
        ages: [21, 58], p: 0.15, cooldown: 3,
        text: '교대 주기가 바뀌어 잠을 설쳤다. 쉬는 날에도 몸이 시간을 기억했다.',
        fx: { stats: { health: -2, leisure: -2 } }, reason: '교대 근무 주기 변경',
      }),
      ev('41132', 'job_stress', {
        ages: [23, 58], p: 0.11, cooldown: 4,
        text: '높은 긴장 속에서 몇 해를 보냈다. 퇴근 후에도 마음이 가라앉지 않는다.',
        choice: {
          prompt: '어떻게 돌볼까?',
          options: [
            { id: 'counsel', label: '상담 프로그램', fx: { stats: { happiness: 4, leisure: -1 } }, result: '직무 스트레스 상담을 받기 시작했다. 같은 일을 하는 동료도 있었다.' },
            { id: 'swap', label: '근무를 조정한다', fx: { stats: { leisure: 1, relations: -2, health: 1 } }, result: '동료와 교대를 맞바꿔 쉬는 날을 만들었다. 부탁을 갚을 일이 남았다.' },
          ],
          default: 'counsel',
        },
        reason: '직무 스트레스',
      }),
    ],
    hazard: 2, burnout: 0.08,
  }),
  J('41231', '경호 및 보안 관련 종사자', {
    entry: [
      E('hire', { minEdu: 'high', ages: [30, 72], p: 0.3, era: [1976, null], text: '신임 교육을 마치고 경비 업체에 채용돼 건물 경비를 맡았다.' }),
    ],
    transitions: [
      tr('94201', [50, 74], 2, 0.06, '아파트 경비로 이동'),
      tr('41240', [40, 66], 2, 0.03, '보안 관제로 이동'),
    ],
    events: [
      ev('41231', 'long_shift', {
        ages: [30, 75], p: 0.15, cooldown: 3,
        text: '격일로 스물네 시간 근무한다. 휴게 시간에도 순찰 호출이 울렸다.',
        fx: { stats: { health: -3, leisure: -3 } }, reason: '장시간 근무',
      }),
      ev('41231', 'contract_swap', {
        ages: [30, 75], p: 0.11, cooldown: 4,
        text: '경비 용역 업체가 바뀐다고 한다. 고용이 이어질지는 새 업체가 정한다.',
        fx: { stats: { happiness: -2, wealth: -1 }, issues: { job: 5 } }, reason: '용역 업체 교체',
      }),
    ],
    hazard: 2, burnout: 0.05,
  }),
  J('42113', '교사 보조 및 아동 돌봄 종사자', {
    entry: [
      E('hire', { license: 'care', minEdu: 'high', ages: [25, 60], p: 0.15, era: [2004, null], text: '돌봄 교실 전담 인력으로 채용 절차를 거쳐 일하게 됐다.' }),
    ],
    transitions: [
      tr('25100', [28, 56], 3, 0.03, '어린이집 교사로 이동'),
      tr('42191', [28, 60], 3, 0.03, '방문 돌봄으로 이동'),
    ],
    events: [
      ev('42113', 'split_hours', {
        ages: [25, 62], p: 0.14, cooldown: 4,
        text: '근무 시간이 오후로 쪼개져 있다. 하루가 길어도 월급은 짧다.',
        fx: { stats: { wealth: -1, leisure: -1 }, issues: { job: 3 } }, reason: '쪼개진 근무 시간',
      }),
      ev('42113', 'after_school_load', {
        ages: [25, 62], p: 0.12, cooldown: 4,
        text: '돌봄 신청 인원이 늘었다. 간식과 귀가 지도를 혼자 맡는 날이 늘었다.',
        choice: {
          prompt: '어떻게 대응할까?',
          options: [
            { id: 'ask', label: '인력 보강 요청', fx: { stats: { relations: -1, leisure: 1 }, issues: { conflict: 2 } }, result: '학교에 공식으로 요청했다. 답은 느렸고 분위기는 조금 어색해졌다.' },
            { id: 'bear', label: '일단 감당한다', fx: { stats: { health: -2, leisure: -2, relations: 1 } }, result: '아이들 이름을 다 외웠다. 퇴근 때는 목이 쉬어 있었다.' },
          ],
          default: 'bear',
        },
        reason: '돌봄 인원 증가',
      }),
    ],
    burnout: 0.07,
  }),
  J('42191', '교사 보조 및 아동 돌봄 종사자', {
    entry: [
      E('hire', { minEdu: 'high', ages: [25, 62], p: 0.2, text: '교육을 마치고 아이돌보미로 가정 방문 돌봄을 시작했다.' }),
    ],
    transitions: [
      tr('25100', [28, 56], 3, 0.03, '어린이집 교사로 이동'),
      tr('42113', [28, 60], 3, 0.03, '학교 돌봄으로 이동'),
      tr('95120', [28, 62], 2, 0.04, '민간 육아 도우미로'),
    ],
    events: [
      ev('42191', 'last_minute_cancel', {
        ages: [25, 64], p: 0.15, cooldown: 3,
        text: '돌봄 당일 아침에 가정에서 일정을 취소했다. 그날 수입이 비었다.',
        fx: { stats: { wealth: -1, happiness: -1 }, issues: { job: 2 } }, reason: '당일 취소',
      }),
      ev('42191', 'house_rule', {
        ages: [25, 64], p: 0.11, cooldown: 4,
        text: '부모의 요청과 내가 아는 아이 돌봄 방식이 어긋나는 날이 있었다.',
        choice: {
          prompt: '어떻게 할까?',
          options: [
            { id: 'follow', label: '요청대로 한다', fx: { stats: { relations: 1, happiness: -3 } }, result: '부모의 방식을 따랐다. 아이는 평소보다 조금 보챘다.' },
            { id: 'explain', label: '이유를 설명한다', fx: { stats: { happiness: 2, relations: -1 }, issues: { conflict: 1 } }, result: '이유를 설명하고 방법을 조정했다. 부모의 표정이 잠깐 굳었다.' },
          ],
          default: 'follow',
        },
        reason: '돌봄 방식 차이',
      }),
    ],
    burnout: 0.05,
  }),
  J('42210', '요양보호사 및 간병인', {
    entry: [
      E('license', { license: 'care', minEdu: 'high', ages: [35, 72], p: 0.7, years: 0, era: [2008, null], text: '교육 과정을 마치고 요양보호사 자격을 땄다.' }),
    ],
    transitions: [
      tr('42320', [35, 68], 3, 0.03, '장애인 돌봄으로 이동'),
      tr('42220', [35, 68], 2, 0.03, '간병인으로 이동'),
      tr('25391', [40, 66], 4, 0.02, '복지시설 생활 지도로'),
    ],
    events: [
      ev('42210', 'lifting_back', {
        ages: [35, 75], p: 0.15, cooldown: 3,
        text: '이용자를 옮기다 허리를 삐끗했다. 파스를 붙이고 다음 방문을 갔다.',
        fx: { stats: { health: -3, leisure: -1 }, issues: { medical: 2 } }, reason: '이용자 이동 보조',
      }),
      ev('42210', 'home_or_facility', {
        ages: [35, 72], p: 0.11, once: true,
        text: '방문요양은 이동 시간이 일로 안 쳐진다. 시설은 야간이 있지만 일정하다.',
        choice: {
          prompt: '어느 쪽으로 갈까?',
          options: [
            { id: 'home', label: '방문요양 유지', fx: { stats: { relations: 2, wealth: -1, leisure: 1 } }, result: '이용자 댁을 돌며 얼굴을 익혔다. 이동 시간은 여전히 일에 안 들어갔다.' },
            { id: 'facility', label: '시설로 옮긴다', fx: { stats: { wealth: 2, health: -2, leisure: -2 } }, result: '시설 야간 근무표에 이름이 올랐다. 월급 명세서는 조금 두꺼워졌다.' },
          ],
          default: 'home',
        },
        reason: '근무 형태 선택',
      }),
    ],
    hazard: 2, burnout: 0.09,
  }),
  J('42220', '요양보호사 및 간병인', {
    entry: [
      E('hire', { minEdu: 'none', ages: [35, 72], p: 0.3, text: '간병 중개업체에 등록해 병원 환자를 돌보기 시작했다.' }),
    ],
    transitions: [
      tr('42210', [35, 72], 2, 0.05, '요양보호사로 이동'),
      tr('42310', [38, 68], 3, 0.02, '노인 돌봄으로 이동'),
    ],
    events: [
      ev('42220', 'round_the_clock', {
        ages: [35, 75], p: 0.17, cooldown: 3,
        text: '환자 곁을 이틀 내리 지켰다. 밤마다 보호자 침대 끝에서 쪽잠을 잤다.',
        fx: { stats: { health: -3, leisure: -3 } }, reason: '상주 간병',
      }),
      ev('42220', 'sudden_discharge', {
        ages: [35, 75], p: 0.14, cooldown: 3,
        text: '환자가 갑자기 퇴원해 일이 끝났다. 다음 일감을 기다려야 한다.',
        fx: { stats: { wealth: -2, happiness: -1 }, issues: { job: 3 } }, reason: '퇴원으로 일감 중단',
      }),
    ],
    hazard: 2, burnout: 0.08,
  }),
  J('42320', '노인 및 장애인 돌봄 종사자', {
    entry: [
      E('hire', { minEdu: 'none', ages: [30, 70], p: 0.25, era: [2007, null], text: '교육을 마치고 활동지원기관에 등록해 일을 시작했다.' }),
    ],
    transitions: [
      tr('42210', [35, 68], 3, 0.03, '요양보호사로 이동'),
      tr('25391', [38, 66], 4, 0.02, '복지시설 생활 지도로'),
    ],
    events: [
      ev('42320', 'schedule_shift', {
        ages: [30, 72], p: 0.14, cooldown: 3,
        text: '이용자 일정이 바뀌어 근무 시간이 달라졌다. 다음 달 수입을 다시 셌다.',
        fx: { stats: { wealth: -1, leisure: -1 }, issues: { job: 2 } }, reason: '이용자 일정 변경',
      }),
      ev('42320', 'sea_trip', {
        ages: [30, 72], p: 0.11, cooldown: 4,
        text: '이용자와 처음으로 바다에 다녀왔다. 돌아오는 길에 이용자가 오래 웃었다.',
        fx: { stats: { happiness: 3, relations: 2 } }, reason: '이용자와 외출',
      }),
    ],
    hazard: 2, burnout: 0.07,
  }),
  J('42901', '기타 돌봄 및 보건 서비스 종사자', {
    entry: [
      E('hire', { minEdu: 'none', ages: [28, 62], p: 0.2, era: [1996, null], text: '교육을 마치고 산후조리원과 가정 파견 일을 시작했다.' }),
    ],
    transitions: [
      tr('95120', [30, 64], 2, 0.04, '육아 도우미로 이동'),
      tr('42191', [30, 62], 3, 0.03, '방문 아동 돌봄으로'),
    ],
    events: [
      ev('42901', 'night_feed', {
        ages: [28, 65], p: 0.15, cooldown: 3,
        text: '산모와 신생아 곁에서 수유 시간마다 깼다. 일주일째 잠이 모자란다.',
        fx: { stats: { health: -2, leisure: -2 } }, reason: '밤 시간 돌봄',
      }),
      ev('42901', 'client_demand', {
        ages: [28, 65], p: 0.11, cooldown: 4,
        text: '산모 가족이 계약에 없는 집안일까지 부탁했다.',
        choice: {
          prompt: '어떻게 응대할까?',
          options: [
            { id: 'scope', label: '범위를 설명한다', fx: { stats: { happiness: 2, relations: -1 }, issues: { conflict: 1 } }, result: '계약 범위를 부드럽게 설명했다. 가족의 표정이 조금 굳었다.' },
            { id: 'help', label: '일부만 도와준다', fx: { stats: { relations: 1, leisure: -2, health: -1 } }, result: '급한 일만 도왔다. 요청은 다음 날도 이어졌다.' },
          ],
          default: 'scope',
        },
        reason: '업무 범위 요청',
      }),
    ],
    burnout: 0.06,
  }),

  // ───────── 4 서비스: 미용·장례·동물·여가·음식 ─────────
  J('43120', '미용 관련 서비스 종사자', {
    entry: [
      E('license', { license: 'tech', minEdu: 'high', ages: [18, 46], p: 0.7, years: 1, text: '미용사 자격을 따서 미용실에 들어갔다.' }),
      E('self', { license: 'tech', minEdu: 'high', ages: [27, 56], p: 0.1, text: '모은 돈으로 작은 미용실을 열었다.' }),
    ],
    transitions: [
      tr('43151', [25, 50], 3, 0.03, '메이크업으로 이동'),
      tr('43130', [25, 50], 3, 0.02, '네일 쪽으로 이동'),
      tr('26462', [35, 62], 8, 0.02, '미용 강사로'),
    ],
    events: [
      ev('43120', 'rent_hike', {
        when: onSelf('43120'), ages: [27, 68], p: 0.14, cooldown: 4,
        text: '가게 임대료가 올랐다. 단골들은 값을 올려도 올 것 같지만 확신은 없다.',
        choice: {
          prompt: '어떻게 할까?',
          options: [
            { id: 'price', label: '가격을 올린다', fx: { stats: { wealth: 3, relations: -1 }, issues: { living: 2 } }, result: '시술 가격을 조금 올렸다. 손님 몇이 말없이 발길을 줄였다.' },
            { id: 'talk', label: '단골과 의논한다', fx: { stats: { relations: 2, wealth: -3 }, issues: { living: 1 } }, result: '단골들과 이야기하며 조금씩 올리기로 했다. 한 달 수입이 빠듯했다.' },
          ],
          default: 'price',
        },
        reason: '임대료 인상',
      }),
      ev('43120', 'hand_rash', {
        ages: [20, 65], p: 0.15, cooldown: 3,
        text: '염색약 때문에 손이 갈라졌다. 장갑을 껴도 겨울 내내 아팠다.',
        fx: { stats: { health: -2, happiness: -1 } }, reason: '손 피부 질환',
      }),
    ],
    burnout: 0.06,
  }),
  J('43130', '미용 관련 서비스 종사자', {
    entry: [
      E('license', { license: 'tech', minEdu: 'high', ages: [18, 50], p: 0.6, years: 1, era: [1996, null], text: '네일 자격을 따서 네일샵에 들어갔다.' }),
      E('self', { license: 'tech', minEdu: 'high', ages: [24, 56], p: 0.1, era: [1996, null], text: '작은 네일샵을 직접 열었다.' }),
    ],
    transitions: [
      tr('43141', [25, 54], 3, 0.03, '피부 관리로 이동'),
      tr('43151', [25, 54], 3, 0.02, '메이크업으로 이동'),
    ],
    events: [
      ev('43130', 'solvent_smell', {
        ages: [20, 62], p: 0.15, cooldown: 3,
        text: '좁은 가게에서 하루 종일 약품 냄새를 맡았다. 두통이 잦아졌다.',
        fx: { stats: { health: -2, happiness: -1 } }, reason: '약품 냄새 노출',
      }),
      ev('43130', 'booking_app', {
        years: [2015, 2100], ages: [22, 62], p: 0.12, once: true,
        text: '예약 앱에 입점하면 손님이 늘지만 수수료가 붙는다.',
        choice: {
          prompt: '어떻게 할까?',
          options: [
            { id: 'join', label: '앱에 입점한다', fx: { stats: { wealth: 2, relations: -2, leisure: -2 }, issues: { tech: 2 } }, result: '신규 손님이 늘었다. 매출 일부는 수수료로 나갔다.' },
            { id: 'regular', label: '단골 위주 유지', fx: { stats: { relations: 2, wealth: -1 }, issues: { tech: 1 } }, result: '지금처럼 단골 중심으로 가기로 했다. 빈 시간이 아쉬운 날이 있었다.' },
          ],
          default: 'regular',
        },
        reason: '예약 앱 입점',
      }),
    ],
    burnout: 0.05,
  }),
  J('43141', '미용 관련 서비스 종사자', {
    entry: [
      E('license', { license: 'tech', minEdu: 'high', ages: [20, 52], p: 0.6, years: 1, text: '피부미용 자격을 따서 관리실에 들어갔다.' }),
      E('self', { license: 'tech', minEdu: 'high', ages: [26, 58], p: 0.1, text: '모은 돈으로 작은 관리실을 열었다.' }),
    ],
    transitions: [
      tr('43142', [25, 56], 3, 0.03, '체형 관리로 이동'),
      tr('43151', [25, 54], 3, 0.02, '메이크업으로 이동'),
    ],
    events: [
      ev('43141', 'package_refund', {
        ages: [22, 62], p: 0.12, cooldown: 4,
        text: '선결제 회원권을 환불해 달라는 손님이 왔다. 이미 시술을 몇 번 받았다.',
        choice: {
          prompt: '어떻게 처리할까?',
          options: [
            { id: 'rule', label: '규정대로 환불', fx: { stats: { wealth: -1, relations: -2 }, issues: { conflict: 1 } }, result: '이용 횟수를 계산해 규정대로 환불했다. 손님은 조용히 돌아갔다.' },
            { id: 'half', label: '일부 환불로 합의', fx: { stats: { wealth: -2, relations: 2 } }, result: '손님과 이야기해 일부만 돌려주기로 했다. 좋은 인상은 남았다.' },
          ],
          default: 'rule',
        },
        reason: '회원권 환불',
      }),
      ev('43141', 'slow_season', {
        ages: [22, 62], p: 0.14, cooldown: 3,
        text: '겨울이 되자 손님이 뚝 줄었다. 예약표에 빈칸이 늘었다.',
        fx: { stats: { wealth: -2, happiness: -1 } }, reason: '비수기',
      }),
    ],
    burnout: 0.05,
  }),
  J('43232', '혼례 및 장례 종사자', {
    entry: [
      E('license', { license: 'care', minEdu: 'high', ages: [24, 62], p: 0.4, years: 1, text: '장례지도사 자격을 따서 장례식장에 채용됐다.' }),
    ],
    transitions: [
      tr('43231', [28, 64], 3, 0.04, '장례 상담원으로 이동'),
      tr('25391', [36, 64], 4, 0.02, '복지시설 생활 지도로'),
    ],
    events: [
      ev('43232', 'three_days', {
        ages: [24, 65], p: 0.15, cooldown: 3,
        text: '사흘 내내 빈소를 지켰다. 유족의 요청에 맞추느라 거의 잠들지 못했다.',
        fx: { stats: { health: -2, leisure: -3, relations: 1 } }, reason: '밤샘 장례 진행',
      }),
      ev('43232', 'family_split', {
        ages: [26, 65], p: 0.11, cooldown: 4,
        text: '유족들이 장례 절차를 두고 의견이 갈렸다. 사이에 선 사람은 나였다.',
        choice: {
          prompt: '어떻게 조율할까?',
          options: [
            { id: 'listen', label: '각자 의견을 듣는다', fx: { stats: { leisure: -3, relations: 1 } }, result: '한 분씩 따로 이야기를 들었다. 결국 한 자리에 모여 절차가 정해졌다.' },
            { id: 'wish', label: '고인의 뜻을 확인', fx: { stats: { happiness: -1, relations: 2 } }, result: '남기신 말씀과 기록을 확인해 전했다. 분위기가 조용히 가라앉았다.' },
          ],
          default: 'listen',
        },
        reason: '유족 의견 조율',
      }),
    ],
    burnout: 0.06,
  }),
  J('43331', '동물 관련 서비스 종사자', {
    entry: [
      E('hire', { minEdu: 'high', ages: [19, 52], p: 0.3, era: [1995, null], text: '민간 자격 과정을 마치고 반려동물 미용실에 들어갔다.' }),
      E('self', { minEdu: 'high', ages: [25, 56], p: 0.08, era: [1995, null], text: '작은 반려동물 미용실을 직접 열었다.' }),
    ],
    transitions: [
      tr('43321', [26, 54], 3, 0.03, '반려동물 훈련으로 이동'),
      tr('43311', [26, 54], 3, 0.02, '동물 보건 분야로'),
    ],
    events: [
      ev('43331', 'bite', {
        ages: [20, 60], p: 0.14, cooldown: 3,
        text: '겁먹은 개에게 손을 물렸다. 소독을 받고 다음 예약을 이어 갔다.',
        fx: { stats: { health: -2 } }, reason: '작업 중 부상',
      }),
      ev('43331', 'booking_rush', {
        ages: [22, 60], p: 0.12, cooldown: 4,
        text: '예약이 몰려 하루 작업 마릿수가 늘었다. 손목이 따끔거린다.',
        choice: {
          prompt: '어떻게 할까?',
          options: [
            { id: 'more', label: '마릿수를 늘린다', fx: { stats: { wealth: 2, health: -2, leisure: -2 } }, result: '하루에 한 마리씩 더 받았다. 저녁에는 말할 힘도 남지 않았다.' },
            { id: 'limit', label: '예약을 제한한다', fx: { stats: { wealth: -1, health: 1, leisure: 1 } }, result: '하루 마릿수에 상한을 두었다. 대기 손님이 조금 줄었다.' },
          ],
          default: 'limit',
        },
        reason: '예약 폭주',
      }),
    ],
    burnout: 0.05,
  }),
  J('44110', '운송 서비스 종사자', {
    entry: [
      E('hire', { minEdu: '2yr', ages: [20, 31], p: 0.03, text: '항공사 승무원 공채에 합격했다.' }),
    ],
    transitions: [
      tr('44213', [30, 52], 4, 0.02, '관광 통역 안내로'),
      tr('44212', [30, 50], 4, 0.02, '여행 안내로 이동'),
      tr('43191', [30, 52], 4, 0.01, '이미지 컨설팅으로'),
    ],
    events: [
      ev('44110', 'time_zone', {
        ages: [21, 55], p: 0.15, cooldown: 3,
        text: '일주일에 시차가 세 번 바뀌었다. 잠의 리듬이 무너졌다.',
        fx: { stats: { health: -2, relations: -1 } }, reason: '시차와 불규칙 일정',
      }),
      ev('44110', 'grounded', {
        years: [2020, 2022], ages: [21, 58], p: 0.3, once: true,
        text: '운항이 크게 줄어 무급 휴직 통보를 받았다. 비행 일정표가 비었다.',
        fx: { stats: { wealth: -3, happiness: -2 }, issues: { job: 6 } }, reason: '운항 중단과 무급 휴직',
      }),
    ],
    hazard: 2, burnout: 0.06,
  }),
  J('44292', '여가 서비스 종사자', {
    entry: [
      E('hire', { minEdu: 'none', ages: [20, 52], p: 0.3, text: '골프장과 계약을 맺고 캐디로 일하기 시작했다.' }),
    ],
    transitions: [
      tr('45311', [30, 56], 3, 0.03, '음식점 일로 이동'),
      tr('44239', [30, 56], 3, 0.02, '오락 시설 일로 이동'),
      tr('53210', [32, 58], 3, 0.02, '방문 판매로'),
    ],
    events: [
      ev('44292', 'rain_cancel', {
        ages: [20, 58], p: 0.15, cooldown: 3,
        text: '비로 라운드가 취소되는 날이 이어졌다. 나온 날에도 수입은 없다.',
        fx: { stats: { wealth: -2, leisure: 1 } }, reason: '우천 취소',
      }),
      ev('44292', 'fee_talk', {
        ages: [22, 58], p: 0.11, cooldown: 4,
        text: '골프장이 캐디 이용 방식을 바꾸겠다고 했다. 캐디들 의견도 갈렸다.',
        choice: {
          prompt: '어떻게 할까?',
          options: [
            { id: 'join', label: '협상에 참여한다', fx: { stats: { relations: 3, leisure: -2 }, issues: { fairness: -2, conflict: 2 } }, result: '캐디들과 모여 요구를 정리했다. 협상은 길어졌고 쉬는 날이 사라졌다.' },
            { id: 'solo', label: '개인 조건을 본다', fx: { stats: { wealth: 1, relations: -3 }, issues: { fairness: 2 } }, result: '개인 조건을 따로 확인했다. 동료들과의 대화가 줄었다.' },
          ],
          default: 'solo',
        },
        reason: '이용 방식 변경',
      }),
    ],
    burnout: 0.05,
  }),
  J('45110', '조리사', {
    entry: [
      E('hire', { minEdu: 'none', ages: [18, 60], p: 0.35, text: '음식점 주방에 들어가 설거지부터 배우기 시작했다.' }),
      E('self', { minEdu: 'none', ages: [28, 60], p: 0.08, text: '모은 돈과 대출로 작은 식당을 열었다.' }),
    ],
    transitions: [
      tr('29701', [32, 58], 8, 0.04, '주방장으로 승진'),
      tr('15220', [35, 60], 6, 0.02, '점장으로 이동'),
      tr('45150', [30, 62], 4, 0.03, '단체급식으로 이동'),
    ],
    events: [
      ev('45110', 'standing_ache', {
        ages: [22, 68], p: 0.15, cooldown: 3,
        text: '하루 열두 시간을 서서 일한 지 여러 해다. 허리와 무릎이 먼저 말했다.',
        fx: { stats: { health: -3, leisure: -1 }, issues: { medical: 2 } }, reason: '장시간 서서 일함',
      }),
      ev('45110', 'delivery_fee', {
        when: onSelf('45110'), years: [2018, 2100], ages: [28, 70], p: 0.14, cooldown: 4,
        text: '배달 앱 수수료가 또 올랐다. 주문은 늘었는데 남는 돈은 그대로다.',
        choice: {
          prompt: '어떻게 할까?',
          options: [
            { id: 'price', label: '배달 가격을 올린다', fx: { stats: { wealth: 2, relations: -1 }, issues: { living: 2 } }, result: '배달 메뉴 가격만 따로 올렸다. 주문이 조금 줄었다.' },
            { id: 'dine', label: '홀 손님에 집중', fx: { stats: { wealth: -2, leisure: -1, relations: 1 }, issues: { tech: 1 } }, result: '배달 비중을 줄이고 홀을 신경 썼다. 가게가 한동안 조용했다.' },
          ],
          default: 'price',
        },
        reason: '배달 수수료 인상',
      }),
    ],
    burnout: 0.07,
  }),
  J('45150', '조리사', {
    entry: [
      E('license', { license: 'tech', minEdu: 'high', ages: [22, 60], p: 0.5, years: 1, text: '조리 자격을 따고 급식 위탁업체에 채용됐다.' }),
    ],
    transitions: [
      tr('45110', [30, 62], 4, 0.03, '식당 주방으로 이동'),
      tr('45211', [30, 60], 3, 0.02, '카페 일로 이동'),
    ],
    events: [
      ev('45150', 'bulk_cooking', {
        ages: [23, 65], p: 0.15, cooldown: 3,
        text: '대형 솥 앞에서 하루 수백 인분을 만든다. 여름 급식실은 한증막이다.',
        fx: { stats: { health: -3, leisure: -1 } }, reason: '대량 조리 환경',
      }),
      ev('45150', 'meal_budget', {
        ages: [25, 65], p: 0.11, cooldown: 4,
        text: '식단 단가가 동결돼 재료를 줄여야 하는 달이 왔다.',
        choice: {
          prompt: '어떻게 할까?',
          options: [
            { id: 'adjust', label: '식단을 조정한다', fx: { stats: { leisure: -1, happiness: -2 } }, result: '값싼 재료를 쓰는 식단으로 짰다. 급식 평가표가 걱정됐다.' },
            { id: 'raise', label: '영양사에 건의', fx: { stats: { relations: -1, happiness: 1 }, issues: { conflict: 1 } }, result: '영양사를 통해 단가 문제를 건의했다. 답은 느리게 왔다.' },
          ],
          default: 'adjust',
        },
        reason: '급식 단가 동결',
      }),
    ],
    burnout: 0.07,
  }),
  J('45211', '음료 조리 종사자', {
    entry: [
      E('hire', { minEdu: 'high', ages: [18, 48], p: 0.3, era: [1998, null], text: '카페에서 아르바이트로 시작해 음료 만드는 법을 익혔다.' }),
      E('self', { minEdu: 'high', ages: [25, 56], p: 0.07, era: [1998, null], text: '작은 카페를 직접 열었다.' }),
    ],
    transitions: [
      tr('52111', [30, 58], 4, 0.03, '다른 가게를 열어'),
      tr('45220', [25, 50], 3, 0.02, '바텐더로 이동'),
      tr('71010', [26, 52], 3, 0.02, '제빵 쪽으로 이동'),
    ],
    events: [
      ev('45211', 'rush_hour', {
        ages: [18, 55], p: 0.15, cooldown: 3,
        text: '점심 주문이 한꺼번에 몰렸다. 두 시간 동안 물 한 모금 못 마셨다.',
        fx: { stats: { health: -2, leisure: -1 } }, reason: '점심 피크',
      }),
      ev('45211', 'open_cafe', {
        ages: [24, 52], p: 0.11, once: true,
        text: '일하던 카페를 오래 다녔다. 작은 가게를 직접 해 볼 생각이 든다.',
        choice: {
          prompt: '어떻게 할까?',
          options: [
            { id: 'open', label: '가게를 연다', fx: { stats: { wealth: -2, leisure: -3, happiness: 1 }, money: { debt: 4500 } }, result: '보증금과 기계 값을 빌려 가게를 열었다. 첫 달엔 발소리만 컸다.' },
            { id: 'stay', label: '직원으로 남는다', fx: { stats: { leisure: 1, wealth: -1 }, issues: { job: 1 } }, result: '월급이 일정한 쪽을 택했다.' },
          ],
          default: 'stay',
        },
        reason: '카페 개업 고민',
      }),
    ],
    burnout: 0.06,
  }),
  J('45311', '식음료 서비스 종사자', {
    entry: [
      E('hire', { minEdu: 'none', ages: [16, 68], p: 0.4, text: '음식점에 아르바이트로 들어가 홀 서빙을 시작했다.' }),
    ],
    transitions: [
      tr('15220', [28, 56], 6, 0.03, '점장으로 이동'),
      tr('45110', [25, 58], 4, 0.02, '주방 일로 이동'),
      tr('52111', [30, 60], 4, 0.02, '가게를 열어'),
    ],
    events: [
      ev('45311', 'rude_customer', {
        ages: [16, 65], p: 0.17, cooldown: 3,
        text: '손님이 음식이 늦다며 큰 소리로 불평했다. 주방 사정은 말할 수 없었다.',
        fx: { stats: { happiness: -2, relations: -1 } }, reason: '손님 항의',
      }),
      ev('45311', 'weekend_shift', {
        ages: [16, 62], p: 0.12, cooldown: 3,
        text: '주말 근무자가 빠졌다. 수당은 붙지만 쉬는 날이 사라진다.',
        choice: {
          prompt: '어떻게 할까?',
          options: [
            { id: 'work', label: '주말에 나온다', fx: { stats: { wealth: 1, leisure: -3, health: -1 } }, result: '주말 내내 서서 일했다. 수당은 월급날 한 줄로 찍혔다.' },
            { id: 'rest', label: '쉬는 날을 지킨다', fx: { stats: { leisure: 2, relations: -1 } }, result: '주말은 쉬겠다고 했다. 동료들이 한 번 더 말을 꺼냈다.' },
          ],
          default: 'work',
        },
        reason: '주말 근무 요청',
      }),
    ],
    burnout: 0.06,
  }),
  // ───────── 5 판매 ─────────
  J('51011', '영업 종사자', {
    entry: [
      E('hire', { minEdu: '2yr', ages: [22, 42], p: 0.2, era: [1970, null], text: '완성차 영업소에 입사해 신차 판매를 시작했다.' }),
    ],
    transitions: [
      tr('15111', [35, 54], 8, 0.04, '영업 관리자로 승진'),
      tr('51012', [28, 54], 4, 0.03, '중고차 영업으로 이동'),
      tr('51032', [28, 56], 3, 0.02, '보험 설계로 이동'),
    ],
    events: [
      ev('51011', 'month_end', {
        ages: [22, 58], p: 0.15, cooldown: 3,
        text: '월말 실적이 모자란다. 지인에게 부탁하면 한 대는 채울 수 있다.',
        choice: {
          prompt: '어떻게 할까?',
          options: [
            { id: 'ask', label: '지인에게 부탁한다', fx: { stats: { wealth: 2, relations: -2 } }, result: '아는 사람에게 연락했다. 계약은 성사됐고 통화 끝에 어색함이 남았다.' },
            { id: 'skip', label: '이번 달은 넘긴다', fx: { stats: { wealth: -2, happiness: -1 }, issues: { job: 2 } }, result: '실적표 칸이 비었다. 면담에서 다음 달 이야기가 길게 이어졌다.' },
          ],
          default: 'skip',
        },
        reason: '월말 실적',
      }),
      ev('51011', 'direct_sales', {
        years: [2020, 2100], ages: [24, 60], p: 0.11, once: true,
        text: '온라인 직접 판매가 늘어 영업소 방문 고객이 줄었다.',
        fx: { stats: { wealth: -1, happiness: -1 }, issues: { job: 4, tech: 3 } }, reason: '직접 판매 확대',
      }),
    ],
    burnout: 0.06,
  }),
  J('51022', '영업 종사자', {
    entry: [
      E('hire', { minEdu: '2yr', ages: [22, 42], p: 0.2, text: '식품 회사에 입사해 거래처 영업을 맡았다.' }),
    ],
    transitions: [
      tr('15111', [35, 54], 8, 0.04, '영업 관리자로 승진'),
      tr('51029', [28, 54], 3, 0.03, '다른 제품 영업으로'),
    ],
    events: [
      ev('51022', 'price_pressure', {
        ages: [24, 58], p: 0.12, cooldown: 3,
        text: '대형 거래처가 납품 단가를 내려 달라고 한다. 거절하면 진열이 준다.',
        choice: {
          prompt: '어떻게 응할까?',
          options: [
            { id: 'accept', label: '단가를 수용한다', fx: { stats: { wealth: 1, relations: 1, happiness: -1 }, issues: { fairness: 2 } }, result: '물량은 유지됐다. 우리 팀의 이익률 보고는 어두워졌다.' },
            { id: 'hold', label: '단가를 지킨다', fx: { stats: { happiness: 1, leisure: -2, wealth: -1 }, issues: { job: 3, conflict: 2 } }, result: '협상이 길어졌고 진열 면적 일부가 줄었다.' },
          ],
          default: 'accept',
        },
        reason: '납품 단가 요구',
      }),
      ev('51022', 'sample_weekend', {
        ages: [22, 58], p: 0.14, cooldown: 3,
        text: '주말 시식 행사가 연달아 잡혔다. 매장 몇 군데를 오가며 상자를 날랐다.',
        fx: { stats: { leisure: -3, health: -1 } }, reason: '주말 행사',
      }),
    ],
    burnout: 0.05,
  }),
  J('51032', '영업 종사자', {
    entry: [
      E('license', { license: 'acct', minEdu: 'high', ages: [25, 62], p: 0.6, years: 0, text: '보험 모집 자격시험에 합격해 설계사로 위촉됐다.' }),
    ],
    transitions: [
      tr('51031', [30, 60], 4, 0.02, '보험 중개로 이동'),
      tr('34022', [30, 58], 4, 0.02, '보험 사무로 이동'),
      tr('51033', [32, 60], 4, 0.02, '투자 권유 대행으로'),
    ],
    events: [
      ev('51032', 'acquaintance', {
        ages: [25, 62], p: 0.14, cooldown: 3,
        text: '처음 몇 달은 지인 영업이 전부다. 계약은 늘지만 관계가 달라진다.',
        choice: {
          prompt: '어떻게 할까?',
          options: [
            { id: 'ask', label: '지인에게 권한다', fx: { stats: { wealth: 3, relations: -2 } }, result: '몇 건이 성사됐다. 가족 모임에서 보험 이야기만 나왔다.' },
            { id: 'new', label: '새 고객을 찾는다', fx: { stats: { leisure: -3, relations: 1 } }, result: '낯선 사람에게 전화하고 발품을 팔았다. 계약은 느리게 늘었다.' },
          ],
          default: 'ask',
        },
        reason: '초기 영업',
      }),
      ev('51032', 'lapse_clawback', {
        ages: [26, 65], p: 0.12, cooldown: 4,
        text: '계약이 일찍 해지돼 받은 수수료 일부를 돌려줘야 한다.',
        fx: { stats: { wealth: -2, happiness: -1 } }, reason: '수수료 환수',
      }),
    ],
    burnout: 0.06,
  }),
  J('52111', '매장 판매 종사자', {
    entry: [
      E('self', { minEdu: 'none', ages: [28, 66], p: 0.1, text: '퇴직금과 대출로 작은 가게를 인수해 점주가 됐다.' }),
      E('inherit', { ages: [30, 62], p: 0.03, text: '부모가 하던 가게를 이어받았다.' }),
    ],
    transitions: [
      tr('52112', [35, 68], 3, 0.05, '가게를 접고 점장 일로'),
      tr('94201', [55, 72], 3, 0.03, '경비 일로 이동'),
      tr('87231', [40, 64], 3, 0.02, '화물 운전으로 이동'),
    ],
    events: [
      ev('52111', 'wage_rise', {
        ages: [28, 72], p: 0.14, cooldown: 3,
        text: '최저임금이 올랐다. 인건비를 맞추려 내가 직접 서는 시간이 늘었다.',
        choice: {
          prompt: '어떻게 할까?',
          options: [
            { id: 'stand', label: '내가 더 선다', fx: { stats: { health: -2, leisure: -3 } }, result: '야간 시간을 직접 맡았다. 가게는 버텼고 쉬는 날은 줄었다.' },
            { id: 'shorten', label: '영업시간을 줄인다', fx: { stats: { wealth: -2, leisure: 1 } }, result: '심야 영업을 접었다. 단골 몇이 아쉽다고 했다.' },
          ],
          default: 'stand',
        },
        reason: '최저임금 인상',
      }),
      ev('52111', 'lease_renewal', {
        when: onSelf('52111'), ages: [28, 72], p: 0.12, cooldown: 4,
        text: '임대차 계약 갱신 시기다. 건물주가 보증금과 월세를 올리자고 한다.',
        choice: {
          prompt: '어떻게 할까?',
          options: [
            { id: 'accept', label: '올려 준다', fx: { stats: { wealth: -2, happiness: -1, leisure: 1 }, issues: { housing: 2 } }, result: '새 계약서에 도장을 찍었다. 남는 돈이 다시 줄었다.' },
            { id: 'move', label: '이전을 알아본다', fx: { stats: { leisure: -3, wealth: -1, relations: -1 }, issues: { job: 3 } }, result: '새 자리를 알아보고 짐을 옮겼다. 단골 일부가 떠났다.' },
          ],
          default: 'accept',
        },
        reason: '임대차 갱신',
      }),
    ],
    burnout: 0.08,
  }),
  J('52112', '매장 판매 종사자', {
    entry: [
      E('promote', { from: ['52121', '52141', '45311'], minYears: 3, ages: [24, 58], p: 0.1, text: '아르바이트 경력을 인정받아 점장을 맡았다.' }),
      E('hire', { minEdu: 'high', ages: [22, 55], p: 0.08, text: '점포 운영 경력으로 점장 자리에 채용됐다.' }),
    ],
    transitions: [
      tr('52111', [32, 62], 4, 0.05, '점포를 인수해 점주로'),
      tr('15220', [32, 58], 4, 0.02, '외식 점장으로 이동'),
    ],
    events: [
      ev('52112', 'night_cover', {
        ages: [22, 60], p: 0.15, cooldown: 3,
        text: '야간 아르바이트생이 갑자기 결근했다. 대신 설 사람은 점장뿐이다.',
        choice: {
          prompt: '어떻게 할까?',
          options: [
            { id: 'cover', label: '직접 야간을 선다', fx: { stats: { health: -2, leisure: -3, relations: 1 } }, result: '밤 근무를 대신 섰다. 다음 날 아침에도 계산대 앞에 있었다.' },
            { id: 'shorten', label: '영업을 일찍 닫는다', fx: { stats: { wealth: -1, leisure: 1 }, issues: { conflict: 1 } }, result: '야간 문을 닫았다. 본사에 사유서를 써야 했다.' },
          ],
          default: 'cover',
        },
        reason: '야간 결근 대체',
      }),
      ev('52112', 'inventory_gap', {
        ages: [22, 60], p: 0.12, cooldown: 3,
        text: '재고 조사에서 수량이 맞지 않았다. 부족분의 책임을 두고 말이 오갔다.',
        fx: { stats: { happiness: -2, wealth: -1 }, issues: { conflict: 2 } }, reason: '재고 부족 책임',
      }),
    ],
    burnout: 0.07,
  }),
  J('52121', '매장 판매 종사자', {
    entry: [
      E('hire', { minEdu: 'high', ages: [18, 48], p: 0.3, text: '백화점과 매장 채용에 붙어 판매 일을 시작했다.' }),
    ],
    transitions: [
      tr('52112', [26, 56], 4, 0.04, '점장으로 이동'),
      tr('52111', [32, 60], 4, 0.02, '가게를 열어'),
      tr('51099', [28, 52], 3, 0.02, '영업직으로 이동'),
    ],
    events: [
      ev('52121', 'return_dispute', {
        ages: [18, 60], p: 0.14, cooldown: 3,
        text: '입은 흔적이 분명한 옷을 환불해 달라는 손님이 왔다.',
        choice: {
          prompt: '어떻게 응대할까?',
          options: [
            { id: 'rule', label: '규정대로 안내', fx: { stats: { wealth: 1, happiness: -2, relations: -1 }, issues: { conflict: 1 } }, result: '규정을 설명하자 손님의 목소리가 커졌다. 점장이 나와 마무리했다.' },
            { id: 'manager', label: '점장에게 넘긴다', fx: { stats: { leisure: 2, relations: -1 }, issues: { job: 1 } }, result: '점장에게 넘겼다. 손님은 만족하지 못했고 점장의 표정이 굳었다.' },
          ],
          default: 'rule',
        },
        reason: '환불 요구',
      }),
      ev('52121', 'season_sale', {
        ages: [18, 60], p: 0.12, cooldown: 3,
        text: '시즌 세일 기간이다. 몰려든 손님 속에서 옷을 쉬지 않고 다시 접었다.',
        fx: { stats: { leisure: -2, health: -1 } }, reason: '세일 기간 근무',
      }),
    ],
    burnout: 0.05,
  }),
  J('52141', '매장 판매 종사자', {
    entry: [
      E('hire', { minEdu: 'none', ages: [16, 68], p: 0.4, text: '마트와 편의점에 아르바이트로 들어가 계산대를 맡았다.' }),
    ],
    transitions: [
      tr('52112', [24, 60], 3, 0.03, '점장으로 이동'),
      tr('95391', [30, 70], 2, 0.03, '매장 정리 일로 이동'),
      tr('45311', [20, 62], 2, 0.03, '식당 일로 이동'),
    ],
    events: [
      ev('52141', 'self_checkout', {
        years: [2018, 2100], ages: [18, 70], p: 0.15, once: true,
        text: '매장에 무인 계산대가 들어왔다. 근무 시간이 줄 거라는 이야기가 돈다.',
        choice: {
          prompt: '어떻게 할까?',
          options: [
            { id: 'assist', label: '안내·정리를 맡는다', fx: { stats: { relations: 1, intellect: 1, leisure: -1 }, issues: { tech: 3 } }, result: '무인 계산대 옆에서 손님을 돕는 일을 맡았다. 근무 시간은 조금 줄었다.' },
            { id: 'move', label: '다른 일을 알아본다', fx: { stats: { happiness: -2, leisure: -1, wealth: 1 }, issues: { job: 4, tech: 2 } }, result: '구인 공고를 찾아보며 몇 군데 이력서를 냈다.' },
          ],
          default: 'assist',
        },
        reason: '무인 계산대 도입',
      }),
      ev('52141', 'standing_day', {
        ages: [18, 70], p: 0.15, cooldown: 3,
        text: '하루 여덟 시간을 서서 계산했다. 퇴근길에 다리가 퉁퉁 부어 있었다.',
        fx: { stats: { health: -2, leisure: -1 } }, reason: '장시간 서서 근무',
      }),
    ],
    burnout: 0.04,
  }),
  J('53110', '통신 관련 판매 종사자', {
    entry: [
      E('hire', { minEdu: '2yr', ages: [20, 46], p: 0.25, era: [1990, null], text: '통신 대리점에 입사해 단말기 판매를 맡았다.' }),
    ],
    transitions: [
      tr('53120', [25, 52], 3, 0.03, '온라인 판매로 이동'),
      tr('51099', [26, 54], 3, 0.02, '영업직으로 이동'),
      tr('52112', [28, 58], 4, 0.02, '점장으로 이동'),
    ],
    events: [
      ev('53110', 'subsidy_rule', {
        ages: [20, 56], p: 0.11, cooldown: 4,
        text: '단말기 지원금 규정이 바뀌어 한동안 손님이 끊겼다.',
        fx: { stats: { wealth: -2, happiness: -1 }, issues: { job: 3 } }, reason: '지원금 규정 변경',
      }),
      ev('53110', 'online_activation', {
        years: [2015, 2100], ages: [22, 60], p: 0.12, cooldown: 5,
        text: '온라인 개통이 늘어 방문 고객이 줄었다. 인근 대리점이 문을 닫았다.',
        fx: { stats: { wealth: -1 }, issues: { job: 4, tech: 3 } }, reason: '온라인 개통 확대',
      }),
    ],
    burnout: 0.05,
  }),
  J('53120', '통신 관련 판매 종사자', {
    entry: [
      E('platform', { minEdu: 'none', ages: [20, 68], p: 0.1, era: [1999, null], text: '쇼핑몰 플랫폼에 입점해 온라인으로 물건을 팔기 시작했다.' }),
    ],
    transitions: [
      tr('52111', [28, 64], 3, 0.03, '오프라인 가게를 열어'),
      tr('92220', [26, 60], 2, 0.02, '택배 일로 이동'),
      tr('53130', [24, 58], 2, 0.02, '판매 상담으로 이동'),
    ],
    events: [
      ev('53120', 'ad_cost', {
        years: [2005, 2100], ages: [22, 68], p: 0.14, cooldown: 3,
        text: '플랫폼 수수료와 광고비가 올랐다. 광고를 줄이면 노출이 사라진다.',
        choice: {
          prompt: '어떻게 할까?',
          options: [
            { id: 'ad', label: '광고를 유지한다', fx: { stats: { wealth: -2, leisure: -1 }, issues: { tech: 2 } }, result: '광고비를 감당하며 주문을 유지했다. 남는 돈은 줄었다.' },
            { id: 'price', label: '가격을 올린다', fx: { stats: { wealth: 1, relations: -1 }, issues: { living: 2 } }, result: '판매가를 조금 올렸다. 주문이 며칠 뜸했다.' },
          ],
          default: 'ad',
        },
        reason: '플랫폼 수수료·광고비',
      }),
      ev('53120', 'dead_stock', {
        ages: [22, 68], p: 0.12, cooldown: 3,
        text: '유행이 지나 재고가 방 한쪽에 쌓였다. 반품도 함께 들어왔다.',
        fx: { stats: { wealth: -2, happiness: -1 } }, reason: '재고와 반품',
      }),
    ],
    burnout: 0.06,
  }),
  J('53130', '통신 관련 판매 종사자', {
    entry: [
      E('hire', { minEdu: '2yr', ages: [20, 58], p: 0.3, era: [1995, null], text: '텔레마케팅 센터에 채용돼 전화 판매를 시작했다.' }),
    ],
    transitions: [
      tr('36202', [22, 56], 2, 0.03, '상담 직무로 이동'),
      tr('34052', [24, 58], 3, 0.02, '채권 관리로 이동'),
      tr('51099', [26, 56], 3, 0.02, '영업직으로 이동'),
    ],
    events: [
      ev('53130', 'hang_up', {
        ages: [20, 60], p: 0.18, cooldown: 3,
        text: '하루 백 통의 전화 중 대부분이 말없이 끊겼다. 한 통은 거친 말이었다.',
        fx: { stats: { happiness: -2 } }, reason: '거절과 거친 말',
      }),
      ev('53130', 'call_rule', {
        years: [2005, 2100], ages: [22, 60], p: 0.11, cooldown: 5,
        text: '전화 판매 규제가 강화돼 통화 가능 시간대와 대상이 줄었다.',
        fx: { stats: { wealth: -1 }, issues: { job: 4 } }, reason: '전화 판매 규제',
      }),
    ],
    burnout: 0.1,
  }),
  J('53210', '방문 및 노점 판매 종사자', {
    entry: [
      E('hire', { minEdu: 'none', ages: [25, 68], p: 0.25, text: '방문판매 업체와 위촉 계약을 맺고 일을 시작했다.' }),
    ],
    transitions: [
      tr('51032', [28, 62], 3, 0.03, '보험 설계로 이동'),
      tr('53220', [28, 68], 3, 0.03, '노점·이동 판매로'),
      tr('42901', [30, 60], 3, 0.01, '산후조리 일로 이동'),
    ],
    events: [
      ev('53210', 'door_closed', {
        ages: [25, 70], p: 0.17, cooldown: 3,
        text: '하루 종일 문을 두드렸지만 열어 주는 집은 몇 곳뿐이었다.',
        fx: { stats: { happiness: -2, leisure: -1 } }, reason: '방문 거절',
      }),
      ev('53210', 'recruit_offer', {
        ages: [25, 62], p: 0.11, once: true,
        text: '같이 일하던 동료가 판매원을 모집하는 쪽이 돈이 된다고 권했다.',
        choice: {
          prompt: '어떻게 할까?',
          options: [
            { id: 'join', label: '동참한다', fx: { stats: { wealth: 4, relations: -2, happiness: -1 }, issues: { fairness: 3 } }, result: '지인들에게 권유하기 시작했다. 연락 오는 사람이 줄었다.' },
            { id: 'refuse', label: '거절한다', fx: { stats: { relations: -1, wealth: -2 } }, result: '지금 하던 판매에 집중하겠다고 했다. 동료와의 대화가 줄었다.' },
          ],
          default: 'refuse',
        },
        reason: '모집 권유',
      }),
    ],
    burnout: 0.06,
  }),

  // ───────── 6 농림어업 ─────────
  J('61110', '작물 재배 종사자', {
    entry: [
      E('inherit', { minEdu: 'none', ages: [20, 62], p: 0.3, text: '부모에게 논을 물려받아 농사를 이어 갔다.' }),
      E('self', { minEdu: 'none', ages: [32, 66], p: 0.05, era: [1990, null], text: '도시 생활을 접고 귀농해 논농사를 시작했다.' }),
    ],
    transitions: [
      tr('61121', [30, 64], 3, 0.04, '채소 재배로 전환'),
      tr('99110', [50, 74], 5, 0.04, '남의 농사일을 거들며'),
      tr('94201', [55, 74], 3, 0.02, '경비 일로 이동'),
    ],
    events: [
      ev('61110', 'weather_loss', {
        ages: [20, 80], p: 0.15, cooldown: 3,
        text: '태풍과 장마가 겹쳐 논 한쪽이 쓰러졌다. 수확량이 줄 것이다.',
        fx: { stats: { wealth: -3, happiness: -1 }, issues: { living: 3, region: 2 } }, reason: '기상 피해',
      }),
      ev('61110', 'price_slump', {
        ages: [25, 80], p: 0.12, cooldown: 4,
        text: '쌀값이 내려 수확하고도 걱정이다. 농기계 할부금은 그대로다.',
        choice: {
          prompt: '다음 농사를 어떻게 할까?',
          options: [
            { id: 'switch', label: '다른 작물을 섞는다', fx: { stats: { intellect: 2, leisure: -2, wealth: -1 }, issues: { tech: 1 } }, result: '밭 일부에 다른 작물을 심었다. 배우는 데 한 해가 걸렸다.' },
            { id: 'keep', label: '하던 대로 짓는다', fx: { stats: { wealth: -3, happiness: -1 }, issues: { region: 2 } }, result: '같은 방식으로 농사를 이어 갔다. 통장은 얇아졌다.' },
          ],
          default: 'keep',
        },
        reason: '농산물 가격 하락',
      }),
    ],
    hazard: 2, burnout: 0.03,
  }),
  J('61121', '작물 재배 종사자', {
    entry: [
      E('inherit', { minEdu: 'none', ages: [20, 62], p: 0.25, text: '부모의 비닐하우스 농사를 이어받았다.' }),
      E('self', { minEdu: 'none', ages: [30, 66], p: 0.06, era: [1990, null], text: '귀농해 시설 채소 농사를 시작했다.' }),
    ],
    transitions: [
      tr('61130', [30, 64], 3, 0.03, '과수 재배로 전환'),
      tr('53120', [30, 64], 3, 0.02, '온라인 판매로 이동'),
      tr('99110', [50, 74], 5, 0.03, '농업 보조 일로 이동'),
    ],
    events: [
      ev('61121', 'greenhouse_heat', {
        ages: [20, 78], p: 0.15, cooldown: 3,
        text: '한여름 하우스 안은 사십 도를 넘는다. 오전만 일하고도 어지러웠다.',
        fx: { stats: { health: -3, leisure: -1 }, issues: { living: 2 } }, reason: '하우스 폭염 작업',
      }),
      ev('61121', 'wholesale_crash', {
        ages: [22, 78], p: 0.12, cooldown: 4,
        text: '출하가 몰려 도매 가격이 급락했다. 운송비도 안 나올 것 같다.',
        choice: {
          prompt: '어떻게 팔까?',
          options: [
            { id: 'direct', label: '직거래를 시도', fx: { stats: { leisure: -2, wealth: 1, relations: 1 }, issues: { tech: 2 } }, result: '온라인과 지인을 통해 직접 팔았다. 포장하느라 밤이 짧았다.' },
            { id: 'wholesale', label: '그대로 출하', fx: { stats: { wealth: -3, happiness: -1 }, issues: { region: 2 } }, result: '시장에 그대로 냈다. 한 해 소득이 조금 줄었다.' },
          ],
          default: 'wholesale',
        },
        reason: '도매 가격 급락',
      }),
    ],
    hazard: 2, burnout: 0.03,
  }),
  J('61130', '작물 재배 종사자', {
    entry: [
      E('inherit', { minEdu: 'none', ages: [20, 62], p: 0.25, text: '부모의 과수원을 이어받았다.' }),
      E('self', { minEdu: 'none', ages: [32, 66], p: 0.05, era: [1990, null], text: '귀농해 과수원을 시작했다.' }),
    ],
    transitions: [
      tr('61121', [30, 66], 3, 0.03, '채소 재배로 전환'),
      tr('99110', [52, 76], 5, 0.03, '농업 보조 일로 이동'),
    ],
    events: [
      ev('61130', 'frost_bloom', {
        ages: [20, 80], p: 0.12, cooldown: 3,
        text: '꽃이 필 무렵 서리가 내려 올해 열매가 반쯤 줄었다.',
        fx: { stats: { wealth: -3, happiness: -2 }, issues: { living: 3 } }, reason: '개화기 냉해',
      }),
      ev('61130', 'warming_shift', {
        years: [2000, 2100], ages: [28, 78], p: 0.11, once: true,
        text: '해마다 기온이 올라 우리 과수 품종이 점점 맞지 않는다고 한다.',
        choice: {
          prompt: '어떻게 할까?',
          options: [
            { id: 'replant', label: '품종을 바꾼다', fx: { stats: { wealth: -3, leisure: -2, intellect: 2, happiness: 1 }, issues: { living: 2 }, money: { debt: 2000 } }, result: '묘목을 새로 사서 심었다. 첫 수확은 몇 해 뒤로 미뤄졌다.' },
            { id: 'keep', label: '그대로 둔다', fx: { stats: { happiness: -3, wealth: -2 }, issues: { living: 4 } }, result: '기존 나무를 가꿨다. 올해도 과일 색이 고르지 않았다.' },
          ],
          default: 'keep',
        },
        reason: '기후와 품종',
      }),
    ],
    hazard: 2, burnout: 0.03,
  }),
  J('61320', '축산 및 사육 관련 종사자', {
    entry: [
      E('inherit', { minEdu: 'none', ages: [22, 62], p: 0.2, text: '부모의 축사를 이어받아 소를 기르기 시작했다.' }),
      E('self', { minEdu: 'none', ages: [30, 62], p: 0.04, era: [1990, null], text: '귀농해 축사를 짓고 소를 들였다.' }),
    ],
    transitions: [
      tr('61330', [30, 64], 3, 0.02, '돼지 사육으로 전환'),
      tr('99110', [52, 76], 5, 0.03, '농업 보조 일로 이동'),
    ],
    events: [
      ev('61320', 'feed_cost', {
        ages: [22, 78], p: 0.14, cooldown: 3,
        text: '사료값이 올랐다. 송아지 값은 그대로다.',
        choice: {
          prompt: '어떻게 버틸까?',
          options: [
            { id: 'cut', label: '사육 두수를 줄인다', fx: { stats: { wealth: -2, leisure: 2 }, issues: { living: 2 } }, result: '일부를 팔고 축사를 비웠다. 일손이 한결 줄었다.' },
            { id: 'loan', label: '대출로 버틴다', fx: { stats: { wealth: -1, happiness: -3 }, issues: { living: 3 }, money: { debt: 3000 } }, result: '운영 자금을 빌렸다. 이자 날짜가 달력에 하나 더 늘었다.' },
          ],
          default: 'loan',
        },
        reason: '사료값 상승',
      }),
      ev('61320', 'disease_alert', {
        ages: [22, 78], p: 0.09, cooldown: 4,
        text: '가축 전염병 경보로 이동 제한이 걸렸다. 매일 소독하고 출하를 미뤘다.',
        fx: { stats: { leisure: -3, wealth: -2 }, issues: { living: 2 } }, reason: '방역 이동 제한',
      }),
    ],
    hazard: 2, burnout: 0.04,
  }),
  J('63011', '어업 관련 종사자', {
    entry: [
      E('inherit', { minEdu: 'none', ages: [20, 62], p: 0.2, text: '가업으로 양식장을 이어받았다.' }),
      E('hire', { minEdu: 'none', ages: [20, 60], p: 0.15, text: '양식장에 일꾼으로 들어가 일을 배웠다.' }),
    ],
    transitions: [
      tr('63021', [28, 60], 3, 0.02, '조업 일로 이동'),
      tr('99130', [50, 74], 5, 0.03, '어업 보조 일로 이동'),
    ],
    events: [
      ev('63011', 'warm_water', {
        years: [2000, 2100], ages: [20, 75], p: 0.15, cooldown: 3,
        text: '고수온이 이어져 양식 어패류가 집단 폐사했다. 며칠 밤을 바다에서 샜다.',
        fx: { stats: { wealth: -3, happiness: -2, health: -1 }, issues: { living: 3, region: 2 } }, reason: '고수온 피해',
      }),
      ev('63011', 'harvest_timing', {
        ages: [22, 75], p: 0.12, cooldown: 4,
        text: '수온이 오르는 철이다. 지금 거두면 작고, 기다리면 폐사 위험이 커진다.',
        choice: {
          prompt: '출하 시점은?',
          options: [
            { id: 'early', label: '앞당겨 출하', fx: { stats: { wealth: -1, leisure: -3 }, issues: { living: 1 } }, result: '작은 크기로 서둘러 냈다. 값은 낮았지만 손실은 막았다.' },
            { id: 'wait', label: '조금 더 기다린다', fx: { stats: { happiness: -1, wealth: 1, health: -1 }, issues: { living: 3 } }, result: '며칠 더 기다렸다. 일부는 잃었고 일부는 제값을 받았다.' },
          ],
          default: 'early',
        },
        reason: '출하 시점 판단',
      }),
    ],
    hazard: 2, burnout: 0.03,
  }),
  J('63021', '어업 관련 종사자', {
    entry: [
      E('inherit', { minEdu: 'none', ages: [18, 60], p: 0.2, text: '어촌에서 배를 물려받아 조업을 이어 갔다.' }),
      E('hire', { minEdu: 'none', ages: [18, 58], p: 0.15, text: '선원으로 배에 올라 일을 배웠다.' }),
    ],
    transitions: [
      tr('63011', [28, 62], 3, 0.02, '양식 일로 이동'),
      tr('87501', [30, 62], 3, 0.03, '선박 부원으로 이동'),
      tr('99130', [50, 74], 5, 0.03, '어업 보조 일로 이동'),
    ],
    events: [
      ev('63021', 'rough_sea', {
        ages: [18, 70], p: 0.15, cooldown: 3,
        text: '풍랑주의보가 풀리기 전에 나갈 수밖에 없었다. 돌아오는 길이 길었다.',
        fx: { stats: { health: -2, happiness: -1 } }, reason: '험한 바다 조업',
      }),
      ev('63021', 'catch_drop', {
        ages: [22, 72], p: 0.12, cooldown: 4,
        text: '어획량은 줄고 기름값은 올랐다. 출항해도 남는 게 없는 날이 늘었다.',
        choice: {
          prompt: '어떻게 할까?',
          options: [
            { id: 'more', label: '조업일수를 늘린다', fx: { stats: { wealth: 1, health: -2, leisure: -3 } }, result: '쉬는 날 없이 배를 띄웠다. 몸이 먼저 낡아 갔다.' },
            { id: 'cut', label: '비용을 줄인다', fx: { stats: { wealth: -1, leisure: 1, happiness: -1 }, issues: { living: 2 } }, result: '출항 횟수와 어구를 줄였다. 한 해 소득은 눈에 띄게 줄었다.' },
          ],
          default: 'cut',
        },
        reason: '어획량 감소와 유류비',
      }),
    ],
    hazard: 3, burnout: 0.03,
  }),
  J('63023', '어업 관련 종사자', {
    entry: [
      E('inherit', { minEdu: 'none', ages: [15, 60], p: 0.2, text: '어머니와 마을 해녀들에게 물질을 배워 마을 조합에 들어갔다.' }),
    ],
    transitions: [
      tr('63011', [40, 66], 5, 0.02, '양식 일로 이동'),
      tr('99130', [50, 74], 5, 0.04, '어업 보조 일로 이동'),
      tr('44216', [50, 74], 5, 0.03, '문화 해설사로 이동'),
    ],
    events: [
      ev('63023', 'sea_change', {
        ages: [30, 80], p: 0.14, cooldown: 3,
        text: '수온이 달라져 해산물이 눈에 띄게 줄었다. 물에 드는 시간이 길어졌다.',
        fx: { stats: { wealth: -2, health: -1 }, issues: { living: 3, region: 2 } }, reason: '바다 환경 변화',
      }),
      ev('63023', 'show_dive', {
        ages: [35, 80], p: 0.11, once: true,
        text: '마을에서 관광객을 위한 해녀 체험 시연을 해 달라고 한다.',
        choice: {
          prompt: '어떻게 할까?',
          options: [
            { id: 'show', label: '시연에 참여', fx: { stats: { wealth: 1, relations: 2, leisure: -1 }, issues: { region: -2 } }, result: '관광객 앞에서 물질을 보여 주었다. 사진 찍는 사람이 많았다.' },
            { id: 'dive', label: '물질에 집중', fx: { stats: { health: -2, wealth: 1 } }, result: '평소처럼 바다에 들어갔다. 시연은 다른 해녀들이 맡았다.' },
          ],
          default: 'dive',
        },
        reason: '체험 시연 제안',
      }),
    ],
    hazard: 3, burnout: 0.02,
  }),
  // ───────── 7 기능 ─────────
  J('71010', '식품 가공 관련 기능 종사자', {
    entry: [
      E('hire', { minEdu: 'high', ages: [18, 46], p: 0.3, text: '제과제빵 과정을 마치고 빵집에 들어갔다.' }),
      E('self', { minEdu: 'high', ages: [26, 60], p: 0.06, text: '빵집을 직접 열었다.' }),
    ],
    transitions: [
      tr('45211', [26, 52], 3, 0.02, '카페 일로 이동'),
      tr('52111', [30, 62], 4, 0.03, '다른 가게를 열어'),
      tr('71020', [30, 62], 4, 0.02, '떡 제조로 이동'),
    ],
    events: [
      ev('71010', 'dawn_baking', {
        ages: [18, 62], p: 0.15, cooldown: 3,
        text: '새벽 두 시에 출근해 반죽을 시작한다. 낮잠을 자도 몸이 가볍지 않다.',
        fx: { stats: { health: -2, leisure: -2 } }, reason: '새벽 제빵 일정',
      }),
      ev('71010', 'chain_store', {
        ages: [24, 65], p: 0.11, cooldown: 4,
        text: '가게 근처에 대형 제빵 매장이 문을 열었다. 단골 몇이 발길을 줄였다.',
        choice: {
          prompt: '어떻게 대응할까?',
          options: [
            { id: 'signature', label: '대표 메뉴에 집중', fx: { stats: { intellect: 2, leisure: -2 }, issues: { job: 1 } }, result: '잘 나가는 몇 가지에만 힘을 실었다. 단골이 하나둘 돌아왔다.' },
            { id: 'sale', label: '할인 행사를 연다', fx: { stats: { wealth: -3, relations: 1, happiness: -1 }, issues: { job: 2 } }, result: '가격을 내려 손님을 붙잡았다. 마진은 얇아졌다.' },
          ],
          default: 'signature',
        },
        reason: '대형 매장 개점',
      }),
    ],
    burnout: 0.05,
  }),
  J('74062', '금속 성형 관련 기능 종사자', {
    entry: [
      E('hire', { minEdu: 'high', ages: [18, 46], p: 0.3, text: '직업훈련과 현장 경험을 거쳐 용접 일을 시작했다.' }),
    ],
    transitions: [
      tr('23652', [40, 62], 10, 0.02, '비파괴 검사로 이동'),
      tr('75320', [35, 62], 6, 0.03, '설비 정비로 이동'),
      tr('74069', [28, 60], 4, 0.03, '다른 용접 분야로'),
    ],
    events: [
      ev('74062', 'fume_exposure', {
        ages: [20, 62], p: 0.15, cooldown: 3,
        text: '밀폐된 구역에서 용접 연기를 오래 마셨다. 며칠째 기침이 가시지 않았다.',
        fx: { stats: { health: -3 }, issues: { medical: 2 } }, reason: '용접 연기 노출',
      }),
      ev('74062', 'rate_talk', {
        ages: [22, 60], p: 0.12, cooldown: 4,
        text: '공정이 급해져 일당 인상을 요구할 기회가 생겼다. 하청은 난색을 보였다.',
        choice: {
          prompt: '어떻게 할까?',
          options: [
            { id: 'ask', label: '인상을 요구한다', fx: { stats: { wealth: 4, relations: -2 }, issues: { conflict: 2, job: 2 } }, result: '일당이 조금 올랐다. 다음 현장 얘기는 아직 나오지 않았다.' },
            { id: 'stay', label: '그대로 일한다', fx: { stats: { relations: 1, wealth: -2 } }, result: '조용히 공정을 맞췄다. 현장 사람들과의 관계는 편했다.' },
          ],
          default: 'stay',
        },
        reason: '일당 협상',
      }),
    ],
    hazard: 3, burnout: 0.04,
  }),
  J('75101', '자동차 정비원', {
    entry: [
      E('hire', { minEdu: 'high', ages: [18, 42], p: 0.3, text: '특성화 과정과 정비소 견습을 거쳐 정비 일을 시작했다.' }),
    ],
    transitions: [
      tr('75106', [28, 54], 5, 0.03, '전기차 정비로 이동'),
      tr('75109', [26, 58], 4, 0.02, '다른 차종 정비로'),
      tr('75108', [26, 56], 4, 0.02, '튜닝 쪽으로 이동'),
    ],
    events: [
      ev('75101', 'ev_training', {
        years: [2018, 2100], ages: [24, 60], p: 0.15, once: true,
        text: '전기차 입고가 늘었다. 엔진 정비만으로는 일감이 점점 줄 것 같다.',
        choice: {
          prompt: '어떻게 할까?',
          options: [
            { id: 'learn', label: '전기차 교육을 받는다', fx: { stats: { intellect: 3, leisure: -2, wealth: -2 }, issues: { tech: 3 } }, result: '교육과 장비 비용이 들었다. 센터에서 고전압 작업 절차를 새로 배웠다.' },
            { id: 'keep', label: '기존 분야를 유지', fx: { stats: { leisure: 2 }, issues: { tech: 2, job: 4 } }, result: '엔진 정비를 이어 갔다. 입고 대수가 해마다 조금씩 줄었다.' },
          ],
          default: 'keep',
        },
        reason: '전기차 전환',
      }),
      ev('75101', 'lift_strain', {
        ages: [20, 62], p: 0.15, cooldown: 3,
        text: '차 아래에 누워 일하는 시간이 길었다. 허리와 목이 번갈아 아팠다.',
        fx: { stats: { health: -2 } }, reason: '정비 자세 부담',
      }),
    ],
    hazard: 2, burnout: 0.04,
  }),
  J('75106', '자동차 정비원', {
    entry: [
      E('promote', { from: ['75101', '75103'], minYears: 3, ages: [24, 58], p: 0.1, era: [2018, null], text: '내연기관 정비 경력에 전기차 교육을 더해 배터리 정비를 맡았다.' }),
      E('hire', { license: 'tech', minEdu: 'high', ages: [20, 46], p: 0.15, era: [2018, null], text: '정비 자격을 따서 전기차 정비센터에 들어갔다.' }),
    ],
    transitions: [
      tr('75105', [26, 56], 3, 0.04, '전기차 모터 정비로'),
      tr('76224', [28, 56], 4, 0.02, '전기 제어 설비 정비로'),
    ],
    events: [
      ev('75106', 'recall_surge', {
        ages: [22, 62], p: 0.14, cooldown: 3,
        text: '배터리 점검 차량이 한꺼번에 입고됐다. 절차가 길어 하루 건수는 줄었다.',
        fx: { stats: { leisure: -3, health: -1 } }, reason: '점검 입고 집중',
      }),
      ev('75106', 'warranty_dispute', {
        ages: [22, 62], p: 0.11, cooldown: 4,
        text: '보증 수리 범위를 두고 고객과 제조사 기준이 달랐다. 중간은 정비사다.',
        choice: {
          prompt: '어떻게 처리할까?',
          options: [
            { id: 'claim', label: '고객 편에서 청구', fx: { stats: { relations: 2, leisure: -2 }, issues: { conflict: 1 } }, result: '자료를 모아 제조사에 청구했다. 처리 기간이 한 달 넘게 걸렸다.' },
            { id: 'rule', label: '기준대로 안내', fx: { stats: { happiness: -2, relations: -1 } }, result: '기준을 설명했다. 고객은 납득하지 못한 채 돌아갔다.' },
          ],
          default: 'rule',
        },
        reason: '보증 수리 분쟁',
      }),
    ],
    hazard: 2, burnout: 0.04,
  }),
  J('75331', '기계장비 설치 및 정비원', {
    entry: [
      E('license', { license: 'tech', minEdu: 'high', ages: [20, 52], p: 0.4, years: 1, text: '승강기 관련 자격을 따서 설치·정비 업체에 들어갔다.' }),
    ],
    transitions: [
      tr('75332', [26, 58], 4, 0.03, '에스컬레이터 정비로'),
      tr('75333', [26, 58], 4, 0.02, '휠체어 리프트 정비로'),
      tr('76221', [28, 58], 4, 0.02, '건물 전기 정비로'),
    ],
    events: [
      ev('75331', 'solo_call', {
        ages: [21, 60], p: 0.14, cooldown: 3,
        text: '고장 출동이 몰렸다. 두 사람이 나가는 게 원칙이지만 일손이 모자라다.',
        choice: {
          prompt: '어떻게 나갈까?',
          options: [
            { id: 'wait', label: '짝이 올 때까지 대기', fx: { stats: { relations: -2, leisure: -1 }, issues: { job: 2 } }, result: '짝이 올 때까지 기다렸다. 건물 관리소에서는 왜 안 오냐는 전화가 왔다.' },
            { id: 'go', label: '혼자 먼저 나간다', fx: { stats: { health: -2, wealth: 2 }, issues: { job: 1 } }, result: '혼자 현장에 나갔다. 일은 빨리 끝났지만 승강기 통로에서 내내 긴장했다.' },
          ],
          default: 'wait',
        },
        reason: '출동 인력 부족',
      }),
      ev('75331', 'weekend_call', {
        ages: [21, 62], p: 0.15, cooldown: 3,
        text: '주말 대기조에 걸려 주말 내내 호출을 기다렸다. 가족 일정이 취소됐다.',
        fx: { stats: { leisure: -3, relations: -1 } }, reason: '주말 대기',
      }),
    ],
    hazard: 3, burnout: 0.05,
  }),
  J('76120', '전기‧전자기기 설치 및 수리원', {
    entry: [
      E('hire', { minEdu: 'high', ages: [19, 46], p: 0.3, text: '서비스센터 위탁 기사로 들어가 가전 수리를 맡았다.' }),
    ],
    transitions: [
      tr('77233', [24, 56], 3, 0.03, '통신 설치로 이동'),
      tr('76110', [24, 58], 3, 0.02, '사무 기기 수리로'),
      tr('76221', [26, 58], 4, 0.02, '건물 전기 일로 이동'),
    ],
    events: [
      ev('76120', 'visit_quota', {
        ages: [20, 60], p: 0.15, cooldown: 3,
        text: '건당 수수료라 하루 방문 건수를 채워야 한다. 점심은 차 안에서 먹었다.',
        fx: { stats: { health: -1, leisure: -2, wealth: 1 } }, reason: '건당 수수료 일정',
      }),
      ev('76120', 'commission_cut', {
        ages: [22, 60], p: 0.11, cooldown: 4,
        text: '위탁 계약 조건이 바뀌어 건당 수수료가 내려갔다. 작업 시간은 그대로다.',
        choice: {
          prompt: '어떻게 할까?',
          options: [
            { id: 'accept', label: '조건을 받아들인다', fx: { stats: { wealth: -4, happiness: -1 }, issues: { fairness: 3 } }, result: '계약서에 서명했다. 한 달 수입이 눈에 띄게 줄었다.' },
            { id: 'move', label: '다른 센터를 알아본다', fx: { stats: { leisure: -1, relations: -1 }, issues: { job: 3 } }, result: '다른 서비스센터를 찾아 면접을 봤다. 거래처가 바뀌었다.' },
          ],
          default: 'accept',
        },
        reason: '수수료 조건 변경',
      }),
    ],
    burnout: 0.05,
  }),
  J('76221', '전기공', {
    entry: [
      E('license', { license: 'tech', minEdu: 'high', ages: [19, 52], p: 0.4, years: 1, text: '전기 자격을 따서 전기공사 업체에 들어갔다.' }),
    ],
    transitions: [
      tr('76224', [26, 58], 4, 0.03, '전기 제어 설비 정비로'),
      tr('76231', [26, 56], 4, 0.02, '송배전 설비 일로'),
      tr('75320', [28, 60], 5, 0.02, '공업 기계 설비로'),
    ],
    events: [
      ev('76221', 'ceiling_work', {
        ages: [20, 64], p: 0.15, cooldown: 3,
        text: '천장 속 배선 작업은 좁고 어둡다. 먼지를 뒤집어쓴 채 하루를 보냈다.',
        fx: { stats: { health: -2 } }, reason: '천장 배선 작업',
      }),
      ev('76221', 'safety_course', {
        ages: [22, 62], p: 0.11, cooldown: 4,
        text: '안전 교육 이수 일정이 급한 공사 일정과 겹쳤다.',
        choice: {
          prompt: '어느 쪽을 먼저 할까?',
          options: [
            { id: 'course', label: '교육을 먼저 받는다', fx: { stats: { intellect: 2, wealth: -2, happiness: 1 }, issues: { job: 1 } }, result: '하루를 비워 교육을 마쳤다. 현장에서는 하루 늦었다는 말이 돌았다.' },
            { id: 'work', label: '공사를 먼저 마친다', fx: { stats: { wealth: 2, leisure: -3, health: -1 }, issues: { job: 1 } }, result: '공사를 끝낸 뒤에야 교육을 받으러 갔다. 일정은 그만큼 빡빡했다.' },
          ],
          default: 'work',
        },
        reason: '안전 교육 일정',
      }),
    ],
    hazard: 2, burnout: 0.04,
  }),
  J('77233', '방송‧통신장비 관련 설치 및 수리원', {
    entry: [
      E('hire', { minEdu: 'high', ages: [19, 52], p: 0.35, era: [1998, null], text: '통신사 협력업체에 들어가 설치 기사로 일을 시작했다.' }),
    ],
    transitions: [
      tr('76120', [24, 56], 3, 0.03, '가전 수리로 이동'),
      tr('77221', [26, 58], 4, 0.02, '통신 장비 설치로'),
      tr('92220', [24, 58], 2, 0.02, '택배 일로 이동'),
    ],
    events: [
      ev('77233', 'per_install_pay', {
        ages: [20, 60], p: 0.14, cooldown: 3,
        text: '설치 건당 수수료가 개편돼 같은 하루에도 벌이가 들쭉날쭉하다.',
        fx: { stats: { wealth: -2, happiness: -1 }, issues: { fairness: 2 } }, reason: '건당 수수료 개편',
      }),
      ev('77233', 'roof_work', {
        ages: [20, 60], p: 0.12, cooldown: 3,
        text: '옥상과 전신주 위 작업이 이어졌다. 한여름 쇠 난간은 장갑이 필수다.',
        fx: { stats: { health: -2, leisure: -1 } }, reason: '고소 작업',
      }),
    ],
    hazard: 2, burnout: 0.04,
  }),
  J('78210', '건설 관련 기능 종사자', {
    entry: [
      E('hire', { minEdu: 'none', ages: [18, 58], p: 0.3, text: '공사 현장에서 조공으로 시작해 철근 일을 익혔다.' }),
    ],
    transitions: [
      tr('78243', [26, 60], 4, 0.03, '형틀 목공으로 이동'),
      tr('78291', [26, 60], 4, 0.03, '비계 일로 이동'),
      tr('91001', [45, 70], 5, 0.04, '단순 현장 일로 이동'),
    ],
    events: [
      ev('78210', 'site_injury', {
        ages: [20, 65], p: 0.14, cooldown: 3,
        text: '현장에서 철근에 손을 다쳤다. 병원을 다녀오고 일당이 하루 비었다.',
        fx: { stats: { health: -3, wealth: -1 }, issues: { medical: 3 } }, reason: '현장 작업 중 부상',
      }),
      ev('78210', 'team_offer', {
        ages: [28, 60], p: 0.11, once: true,
        text: '반장이 팀을 맡으라고 한다. 일당은 오르지만 팀원 노임도 챙겨야 한다.',
        choice: {
          prompt: '어떻게 할까?',
          options: [
            { id: 'lead', label: '팀을 맡는다', fx: { stats: { wealth: 3, leisure: -3, happiness: -1 }, issues: { job: 2 } }, result: '팀원 일정과 노임을 관리하게 됐다. 월말 계산이 가장 어려웠다.' },
            { id: 'worker', label: '기능공으로 남는다', fx: { stats: { wealth: -1, leisure: 1, happiness: 2 }, issues: { job: 1 } }, result: '지금 하던 일을 그대로 했다. 몸만 쓰면 되는 편이 마음은 가벼웠다.' },
          ],
          default: 'worker',
        },
        reason: '팀 책임 제안',
      }),
    ],
    hazard: 3, burnout: 0.03,
  }),
  J('78243', '건설 관련 기능 종사자', {
    entry: [
      E('hire', { minEdu: 'none', ages: [18, 58], p: 0.3, text: '도제식으로 현장 선배를 따라 형틀 일을 배웠다.' }),
    ],
    transitions: [
      tr('78210', [26, 60], 4, 0.03, '철근 일로 이동'),
      tr('78244', [28, 60], 4, 0.03, '내장 목공으로 이동'),
      tr('91001', [45, 70], 5, 0.04, '단순 현장 일로 이동'),
    ],
    events: [
      ev('78243', 'payday_delay', {
        ages: [20, 65], p: 0.12, cooldown: 3,
        text: '원청에서 하도급으로 이어지는 사이 노임 지급이 한 달 넘게 밀렸다.',
        choice: {
          prompt: '어떻게 할까?',
          options: [
            { id: 'demand', label: '지급을 요구한다', fx: { stats: { relations: -1, leisure: -3 }, issues: { fairness: 2, conflict: 2 } }, result: '반장과 함께 지급을 요구했다. 일부만 먼저 들어왔다.' },
            { id: 'move', label: '다음 현장으로 간다', fx: { stats: { wealth: -2, relations: 1 }, issues: { fairness: 4 } }, result: '밀린 노임은 포기하다시피 하고 새 현장에 나갔다.' },
          ],
          default: 'move',
        },
        reason: '노임 지급 지연',
      }),
      ev('78243', 'knee_wear', {
        ages: [30, 68], p: 0.15, cooldown: 3,
        text: '무릎을 꿇고 거푸집을 짜는 일이 이어졌다. 아침마다 계단이 힘들다.',
        fx: { stats: { health: -3 }, issues: { medical: 2 } }, reason: '관절 부담',
      }),
    ],
    hazard: 3, burnout: 0.03,
  }),
  J('78291', '건설 관련 기능 종사자', {
    entry: [
      E('hire', { minEdu: 'none', ages: [18, 55], p: 0.3, text: '현장 팀에 들어가 비계를 조립하는 일을 시작했다.' }),
    ],
    transitions: [
      tr('78292', [26, 58], 4, 0.03, '칸막이 설치로 이동'),
      tr('78293', [26, 58], 4, 0.02, '건물 해체 일로 이동'),
      tr('91001', [45, 70], 5, 0.04, '단순 현장 일로 이동'),
    ],
    events: [
      ev('78291', 'near_fall', {
        ages: [20, 62], p: 0.14, cooldown: 3,
        text: '높은 곳에서 발판이 흔들려 안전고리에 매달렸다. 그날은 일을 접었다.',
        fx: { stats: { health: -1, happiness: -2 }, issues: { medical: 1 } }, reason: '고소 작업 사고 위험',
      }),
      ev('78291', 'heat_alert', {
        ages: [20, 62], p: 0.12, cooldown: 3,
        text: '폭염 경보로 오후 작업을 쉬라는 권고가 나왔다. 쉬면 일당이 준다.',
        choice: {
          prompt: '어떻게 할까?',
          options: [
            { id: 'rest', label: '오후에는 쉰다', fx: { stats: { wealth: -3, health: 2, leisure: 1 } }, result: '그늘에서 쉬었다. 월말 일당 계산에서 하루가 줄었다.' },
            { id: 'work', label: '일당을 위해 계속', fx: { stats: { wealth: 2, health: -5 } }, result: '물을 마셔 가며 일했다. 저녁에는 두통이 가시지 않았다.' },
          ],
          default: 'work',
        },
        reason: '폭염 작업 중지 권고',
      }),
    ],
    hazard: 3, burnout: 0.03,
  }),
  J('78351', '건축 마감 관련 기능 종사자', {
    entry: [
      E('hire', { minEdu: 'none', ages: [18, 56], p: 0.3, text: '도배 업체에서 조수로 일하며 풀칠부터 배웠다.' }),
      E('self', { minEdu: 'none', ages: [28, 60], p: 0.05, text: '기술을 익혀 도배 일을 직접 받기 시작했다.' }),
    ],
    transitions: [
      tr('78341', [26, 60], 3, 0.03, '바닥재 시공으로 이동'),
      tr('78361', [26, 60], 3, 0.03, '도장 일로 이동'),
      tr('78391', [30, 64], 4, 0.03, '건물 수리로 이동'),
    ],
    events: [
      ev('78351', 'moving_season', {
        ages: [20, 66], p: 0.14, cooldown: 3,
        text: '이사철이라 일감이 몰렸다. 한 달 동안 쉬는 날 없이 방을 돌았다.',
        fx: { stats: { wealth: 2, leisure: -3, health: -1 } }, reason: '이사철 일감 집중',
      }),
      ev('78351', 'low_bid', {
        ages: [24, 66], p: 0.12, cooldown: 4,
        text: '신규 업자가 낮은 단가로 일감을 가져간다. 같은 평수에 값이 다르다.',
        choice: {
          prompt: '어떻게 할까?',
          options: [
            { id: 'match', label: '단가를 낮춘다', fx: { stats: { wealth: 2, leisure: -3, happiness: -1 } }, result: '단가를 맞추고 일을 더 받았다. 손은 바빠졌고 남는 돈은 줄었다.' },
            { id: 'hold', label: '단가를 지킨다', fx: { stats: { wealth: -2, happiness: 2, leisure: 1 }, issues: { job: 2 } }, result: '값을 지켰다. 일감이 줄었지만 단골 소개가 이어졌다.' },
          ],
          default: 'hold',
        },
        reason: '시공 단가 경쟁',
      }),
    ],
    hazard: 3, burnout: 0.03,
  }),
  J('79211', '배관공', {
    entry: [
      E('hire', { minEdu: 'high', ages: [18, 52], p: 0.3, text: '직업훈련을 마치고 설비 업체에 들어갔다.' }),
    ],
    transitions: [
      tr('79212', [26, 58], 4, 0.03, '가스 배관으로 이동'),
      tr('79221', [26, 58], 4, 0.02, '플랜트 배관으로 이동'),
      tr('75361', [28, 60], 5, 0.02, '보일러 설치로 이동'),
    ],
    events: [
      ev('79211', 'night_leak', {
        ages: [20, 65], p: 0.15, cooldown: 3,
        text: '한겨울 새벽에 배관이 터졌다는 전화를 받았다. 눈길을 달려 현장에 갔다.',
        fx: { stats: { health: -2, leisure: -2, wealth: 1 } }, reason: '긴급 누수 출동',
      }),
      ev('79211', 'own_shop', {
        ages: [30, 60], p: 0.11, once: true,
        text: '오래 일한 설비 업체에서 독립할 생각이 든다. 단골도 몇 있다.',
        choice: {
          prompt: '어떻게 할까?',
          options: [
            { id: 'open', label: '독립해 연다', fx: { stats: { wealth: -1, leisure: -3, happiness: 1 }, money: { debt: 2500 } }, result: '공구와 트럭을 갖추고 직접 일감을 받기 시작했다. 연락은 밤낮없이 왔다.' },
            { id: 'stay', label: '업체에 남는다', fx: { stats: { leisure: 1, wealth: -1 }, issues: { job: 1 } }, result: '월급이 일정한 쪽을 택했다.' },
          ],
          default: 'stay',
        },
        reason: '독립 고민',
      }),
    ],
    hazard: 2, burnout: 0.04,
  }),

  // ───────── 8 장치·기계 조작 및 조립 ─────────
  J('83231', '화학‧고무 및 플라스틱 제품 생산기 조작원', {
    entry: [
      E('hire', { minEdu: 'high', ages: [18, 58], p: 0.3, text: '중소 제조업체에 입사해 사출기를 맡았다.' }),
    ],
    transitions: [
      tr('83232', [24, 58], 3, 0.03, '압출기 조작으로 이동'),
      tr('85301', [24, 52], 4, 0.02, '조립라인 조작으로 이동'),
      tr('93099', [40, 68], 4, 0.04, '단순 제조 일로 이동'),
    ],
    events: [
      ev('83231', 'machine_jam', {
        ages: [19, 62], p: 0.12, cooldown: 3,
        text: '금형에 제품이 끼어 꺼내다 손이 닿을 뻔했다. 안전장치가 꺼져 있었다.',
        fx: { stats: { health: -1, happiness: -2 }, issues: { job: 2 } }, reason: '기계 끼임 위험',
      }),
      ev('83231', 'order_surge', {
        ages: [19, 62], p: 0.14, cooldown: 3,
        text: '주문이 몰려 연장 근무 요청이 왔다. 특근 수당은 붙는다.',
        choice: {
          prompt: '어떻게 할까?',
          options: [
            { id: 'overtime', label: '연장 근무 수락', fx: { stats: { wealth: 2, health: -2, leisure: -3 } }, result: '야간까지 기계를 돌렸다. 월급 명세서 숫자는 두꺼워졌다.' },
            { id: 'normal', label: '정시에 퇴근', fx: { stats: { leisure: 1, relations: -1 }, issues: { job: 1 } }, result: '정시에 퇴근했다. 반장의 표정이 다음 날까지 이어졌다.' },
          ],
          default: 'overtime',
        },
        reason: '주문 폭주와 연장 근무',
      }),
    ],
    hazard: 2, burnout: 0.04,
  }),
  J('85301', '자동 조립라인 및 산업용로봇 조작원', {
    entry: [
      E('hire', { minEdu: 'high', ages: [18, 46], p: 0.3, era: [1980, null], text: '특성화 과정을 마치고 제조 공장 생산직 공채에 합격했다.' }),
    ],
    transitions: [
      tr('85302', [26, 54], 4, 0.03, '로봇 조작으로 이동'),
      tr('86201', [28, 58], 5, 0.02, '설비 조작으로 이동'),
      tr('75320', [28, 58], 5, 0.02, '설비 정비로 이동'),
    ],
    events: [
      ev('85301', 'line_speed', {
        ages: [19, 58], p: 0.15, cooldown: 3,
        text: '라인 속도가 올라갔다. 같은 동작을 더 빠르게 되풀이하다 어깨가 굳었다.',
        fx: { stats: { health: -2, leisure: -1 } }, reason: '라인 속도 상향',
      }),
      ev('85301', 'robot_cell', {
        years: [2015, 2100], ages: [22, 60], p: 0.14, once: true,
        text: '공정 일부에 로봇 설비가 들어왔다. 사람 자리가 어디까지 남을지 모른다.',
        choice: {
          prompt: '어떻게 할까?',
          options: [
            { id: 'train', label: '설비 관리 교육', fx: { stats: { intellect: 3, leisure: -2 }, issues: { tech: 3 } }, result: '설비 관리 교육을 받고 로봇 곁에서 일하게 됐다.' },
            { id: 'stay', label: '현 위치를 지킨다', fx: { stats: { happiness: -3, leisure: 1 }, issues: { tech: 3, job: 4 } }, result: '같은 자리에서 일했다. 인원 감축 이야기가 한 번 돌았다.' },
          ],
          default: 'stay',
        },
        reason: '로봇 설비 도입',
      }),
    ],
    hazard: 2, burnout: 0.05,
  }),
  J('85411', '운송차량 조립원', {
    entry: [
      E('hire', { minEdu: 'high', ages: [19, 46], p: 0.2, text: '완성차 공장 생산직 채용에 합격했다.' }),
    ],
    transitions: [
      tr('85412', [26, 56], 4, 0.04, '전기차 조립으로 이동'),
      tr('85421', [26, 56], 4, 0.02, '엔진 조립으로 이동'),
      tr('75101', [28, 56], 5, 0.02, '자동차 정비로 이동'),
    ],
    events: [
      ev('85411', 'night_shift', {
        ages: [19, 58], p: 0.15, cooldown: 3,
        text: '주야 교대 주기가 돌아왔다. 밤샘 뒤 낮잠으로 몸이 풀리지 않는다.',
        fx: { stats: { health: -2, leisure: -2, relations: -1 } }, reason: '주야 교대',
      }),
      ev('85411', 'ev_line', {
        years: [2018, 2100], ages: [24, 60], p: 0.14, once: true,
        text: '전기차 라인이 늘면서 내연기관 라인 인원이 줄 거라는 이야기가 돈다.',
        choice: {
          prompt: '어떻게 할까?',
          options: [
            { id: 'move', label: '전기차 라인 전환', fx: { stats: { intellect: 3, leisure: -2, wealth: 1 }, issues: { tech: 3 } }, result: '전환 교육을 받고 새 라인에 배치됐다. 손에 익는 데 몇 달이 걸렸다.' },
            { id: 'stay', label: '현 라인에 남는다', fx: { stats: { happiness: -2, relations: 1 }, issues: { tech: 3, job: 4 } }, result: '익숙한 라인에서 일했다. 해마다 인원 계획표가 조금씩 줄었다.' },
          ],
          default: 'stay',
        },
        reason: '전기차 전환',
      }),
    ],
    hazard: 2, burnout: 0.05,
  }),
  J('86312', '전기‧전자 부품 및 제품 제조 장치 조작원', {
    entry: [
      E('hire', { minEdu: 'high', ages: [19, 50], p: 0.25, era: [2000, null], text: '배터리 제조 공장에 입사해 설비를 맡았다.' }),
    ],
    transitions: [
      tr('86311', [26, 56], 4, 0.03, '일차전지 설비로 이동'),
      tr('86331', [26, 56], 4, 0.03, '전자 부품 설비로 이동'),
      tr('86201', [28, 58], 5, 0.02, '공장 전기 설비로 이동'),
    ],
    events: [
      ev('86312', 'clean_room', {
        ages: [20, 58], p: 0.15, cooldown: 3,
        text: '무진복을 입고 교대 근무로 설비를 지킨다. 낮과 밤의 구분이 흐려졌다.',
        fx: { stats: { health: -2, leisure: -2 } }, reason: '클린룸 교대 근무',
      }),
      ev('86312', 'plant_expansion', {
        ages: [21, 58], p: 0.12, cooldown: 4,
        text: '공장 증설로 신규 라인 가동이 몰렸다. 특근 요청이 이어진다.',
        choice: {
          prompt: '어떻게 할까?',
          options: [
            { id: 'extra', label: '특근에 나선다', fx: { stats: { wealth: 3, leisure: -4, health: -1 } }, result: '주말에도 라인에 섰다. 월급이 두둑해졌고 주말이 사라졌다.' },
            { id: 'limit', label: '특근을 제한한다', fx: { stats: { leisure: 2, relations: -1 }, issues: { job: 1 } }, result: '평일만 근무하기로 했다. 동료 몇이 아쉬움을 비쳤다.' },
          ],
          default: 'extra',
        },
        reason: '라인 증설과 특근',
      }),
    ],
    hazard: 2, burnout: 0.06,
  }),
  J('86331', '전기‧전자 부품 및 제품 제조 장치 조작원', {
    entry: [
      E('hire', { minEdu: 'high', ages: [18, 50], p: 0.25, era: [1970, null], text: '특성화 과정을 마치고 전자 부품 공장에 입사했다.' }),
    ],
    transitions: [
      tr('86312', [26, 54], 4, 0.03, '이차전지 설비로 이동'),
      tr('86332', [26, 56], 4, 0.02, '전자 제품 설비로'),
      tr('86402', [28, 58], 4, 0.02, '조립 일로 이동'),
    ],
    events: [
      ev('86331', 'shift_pattern', {
        ages: [19, 58], p: 0.15, cooldown: 3,
        text: '4조 교대 편성이 바뀌어 쉬는 요일이 매번 달라졌다. 약속 잡기 어렵다.',
        fx: { stats: { health: -1, relations: -2, leisure: -2 } }, reason: '교대 편성 변경',
      }),
      ev('86331', 'cycle_down', {
        ages: [20, 60], p: 0.11, cooldown: 5,
        text: '업황이 꺾여 감산에 들어갔다. 순번대로 휴업이 돌고 수당이 줄었다.',
        fx: { stats: { wealth: -2, happiness: -1 }, issues: { job: 4 } }, reason: '감산과 휴업',
      }),
    ],
    hazard: 2, burnout: 0.06,
  }),
  J('87210', '자동차 운전원', {
    entry: [
      E('license', { license: 'drive', minEdu: 'none', ages: [26, 68], p: 0.5, years: 0, text: '택시 운전 자격을 따서 택시 회사에 들어갔다.' }),
      E('self', { license: 'drive', minEdu: 'none', ages: [45, 68], p: 0.03, text: '오랜 무사고 운행 끝에 개인택시를 받았다.' }),
    ],
    transitions: [
      tr('87221', [30, 62], 3, 0.03, '버스 운전으로 이동'),
      tr('87293', [30, 66], 2, 0.03, '대리운전으로 이동'),
      tr('41231', [55, 72], 2, 0.03, '경비 일로 이동'),
    ],
    events: [
      ev('87210', 'call_app', {
        years: [2012, 2100], ages: [28, 72], p: 0.14, once: true,
        text: '호출 앱이 퍼져 거리 손님이 줄었다. 앱 콜은 요금이 정해져 온다.',
        choice: {
          prompt: '어떻게 할까?',
          options: [
            { id: 'app', label: '호출 앱에 등록', fx: { stats: { wealth: 2, leisure: -1 }, issues: { tech: 3 } }, result: '앱을 켜 두고 운행했다. 빈 차로 다니는 시간이 줄었다.' },
            { id: 'street', label: '승차 대기 위주', fx: { stats: { wealth: -1, happiness: -1 }, issues: { tech: 2, job: 3 } }, result: '역 앞 대기줄에 서서 손님을 기다렸다. 대기 시간이 길어졌다.' },
          ],
          default: 'app',
        },
        reason: '호출 앱 확산',
      }),
      ev('87210', 'revenue_gap', {
        ages: [26, 72], p: 0.14, cooldown: 3,
        text: '비 오는 연휴에 손님이 없었다. 회사에 내야 할 기본금은 그대로다.',
        fx: { stats: { wealth: -2, happiness: -1 }, issues: { job: 2 } }, reason: '기본 입금액 압박',
      }),
    ],
    hazard: 2, burnout: 0.04,
  }),
  J('87221', '자동차 운전원', {
    entry: [
      E('license', { license: 'drive', minEdu: 'none', ages: [28, 64], p: 0.5, years: 0, text: '버스 운전 자격을 따서 버스 회사에 들어갔다.' }),
    ],
    transitions: [
      tr('87222', [30, 62], 3, 0.03, '시외버스 운전으로 이동'),
      tr('87223', [30, 62], 3, 0.02, '관광버스 운전으로'),
      tr('87210', [30, 64], 3, 0.02, '택시 운전으로 이동'),
    ],
    events: [
      ev('87221', 'split_shift', {
        ages: [28, 66], p: 0.15, cooldown: 3,
        text: '출퇴근 시간대에만 운행하고 낮은 비는 근무표를 받았다. 하루가 길다.',
        fx: { stats: { leisure: -3, health: -1 } }, reason: '분할 근무표',
      }),
      ev('87221', 'restroom_gap', {
        ages: [28, 66], p: 0.12, cooldown: 4,
        text: '배차 간격이 빡빡해 화장실과 식사를 못 챙겼다. 위장이 먼저 탈이 났다.',
        fx: { stats: { health: -2, happiness: -1 }, issues: { medical: 2 } }, reason: '배차 간격 압박',
      }),
    ],
    hazard: 2, burnout: 0.05,
  }),
  J('87231', '자동차 운전원', {
    entry: [
      E('license', { license: 'drive', minEdu: 'none', ages: [25, 66], p: 0.4, years: 0, text: '화물운송 자격을 따서 소형 트럭 운행을 시작했다.' }),
      E('self', { license: 'drive', minEdu: 'none', ages: [28, 62], p: 0.08, text: '할부로 1톤 트럭을 사서 개인 사업자로 일하기 시작했다.' }),
    ],
    transitions: [
      tr('87232', [30, 62], 3, 0.03, '중형 화물차로 이동'),
      tr('87233', [32, 62], 4, 0.02, '대형 화물차로 이동'),
      tr('92220', [26, 60], 2, 0.03, '택배 일로 이동'),
    ],
    events: [
      ev('87231', 'diesel_price', {
        ages: [26, 70], p: 0.14, cooldown: 3,
        text: '경유값이 오르자 하루 벌이가 눈에 띄게 줄었다. 운임은 그대로다.',
        choice: {
          prompt: '어떻게 대응할까?',
          options: [
            { id: 'more', label: '운행 건수를 늘린다', fx: { stats: { wealth: 2, health: -2, leisure: -2 } }, result: '새벽부터 밤까지 짐을 실었다. 몸이 먼저 지쳤다.' },
            { id: 'fare', label: '운임 조정을 요청', fx: { stats: { relations: -2, wealth: -3 }, issues: { conflict: 1 } }, result: '거래처에 운임 조정을 요청했다. 일부 거래처는 다른 차를 찾았다.' },
          ],
          default: 'more',
        },
        reason: '유류비 상승',
      }),
      ev('87231', 'tight_delivery', {
        ages: [26, 70], p: 0.15, cooldown: 3,
        text: '배송이 촉박해 점심을 운전석에서 때웠다. 골목에서 접촉할 뻔했다.',
        fx: { stats: { health: -1, happiness: -2, leisure: -1 } }, reason: '촉박한 배송',
      }),
    ],
    hazard: 2, burnout: 0.04,
  }),
  J('87233', '자동차 운전원', {
    entry: [
      E('license', { license: 'drive', minEdu: 'none', ages: [28, 64], p: 0.3, years: 0, text: '화물운송 자격을 따서 운송사 대형 트럭 기사로 들어갔다.' }),
      E('self', { license: 'drive', minEdu: 'none', ages: [34, 62], p: 0.1, text: '빚을 내 대형 트럭을 사서 지입으로 운행하기 시작했다.' }),
    ],
    transitions: [
      tr('87408', [30, 64], 3, 0.03, '덤프트럭으로 이동'),
      tr('87407', [30, 64], 3, 0.02, '믹서 트럭으로 이동'),
      tr('87231', [42, 70], 5, 0.03, '소형 화물차로 이동'),
    ],
    events: [
      ev('87233', 'freight_rate', {
        ages: [30, 70], p: 0.14, cooldown: 3,
        text: '운임이 내려가고 기름값이 올랐다. 할부금과 보험료는 그대로 나간다.',
        choice: {
          prompt: '어떻게 메울까?',
          options: [
            { id: 'long', label: '장거리를 늘린다', fx: { stats: { wealth: 2, health: -3, relations: -1 } }, result: '장거리 운행을 더 받았다. 집에 들르는 날이 줄었다.' },
            { id: 'pick', label: '일감을 가려 받는다', fx: { stats: { wealth: -2, leisure: 2, happiness: 1 }, issues: { job: 2 } }, result: '운임이 낮은 일은 거절했다. 쉬는 날이 늘었고 통장은 얇아졌다.' },
          ],
          default: 'long',
        },
        reason: '운임 하락과 유류비',
      }),
      ev('87233', 'night_drive', {
        ages: [30, 70], p: 0.15, cooldown: 3,
        text: '장거리 야간 운행 중 졸음이 몰려왔다. 휴게소에서 눈을 붙이고 달렸다.',
        fx: { stats: { health: -3, leisure: -2 } }, reason: '장거리 야간 운행',
      }),
    ],
    hazard: 2, burnout: 0.04,
  }),
  J('87293', '자동차 운전원', {
    entry: [
      E('platform', { license: 'drive', minEdu: 'none', ages: [24, 68], p: 0.2, era: [2012, null], text: '앱에 가입해 대리운전을 시작했다.' }),
      E('hire', { license: 'drive', minEdu: 'none', ages: [24, 66], p: 0.15, era: [1995, 2012], text: '대리운전 업체에 등록해 야간 운행을 시작했다.' }),
    ],
    transitions: [
      tr('87291', [28, 68], 3, 0.03, '기사 운전으로 이동'),
      tr('87210', [30, 66], 2, 0.03, '택시 운전으로 이동'),
      tr('92230', [26, 58], 2, 0.02, '배달 일로 이동'),
    ],
    events: [
      ev('87293', 'fee_deduction', {
        ages: [24, 68], p: 0.15, cooldown: 3,
        text: '사용료와 보험료, 수수료를 떼고 나니 하룻밤 수입이 반쯤 줄었다.',
        fx: { stats: { wealth: -1, happiness: -1 }, issues: { fairness: 2 } }, reason: '수수료와 비용 공제',
      }),
      ev('87293', 'dead_hours', {
        ages: [24, 68], p: 0.14, cooldown: 3,
        text: '새벽에 콜이 끊겼다. 운행이 끝난 곳에서 집까지 올 방법이 마땅치 않다.',
        choice: {
          prompt: '어떻게 할까?',
          options: [
            { id: 'wait', label: '근처에서 기다린다', fx: { stats: { health: -2, leisure: -2, wealth: 1 } }, result: '추운 밤을 길 위에서 보냈다. 다음 콜은 한 시간 뒤에 들어왔다.' },
            { id: 'home', label: '택시로 귀가한다', fx: { stats: { wealth: -1, leisure: 1 } }, result: '택시비를 내고 들어왔다. 오늘 번 돈의 몫이 줄었다.' },
          ],
          default: 'home',
        },
        reason: '새벽 콜 공백',
      }),
    ],
    hazard: 2, burnout: 0.05,
  }),
  J('87304', '물품 이동 장비 조작원', {
    entry: [
      E('license', { license: 'drive', minEdu: 'none', ages: [20, 64], p: 0.5, years: 0, text: '지게차 자격을 따서 물류·제조 현장에 들어갔다.' }),
    ],
    transitions: [
      tr('87301', [30, 62], 4, 0.02, '크레인 운전으로 이동'),
      tr('92111', [22, 64], 2, 0.03, '하역 일로 이동'),
      tr('87309', [28, 62], 3, 0.02, '다른 장비 조작으로'),
    ],
    events: [
      ev('87304', 'warehouse_near_miss', {
        ages: [20, 66], p: 0.14, cooldown: 3,
        text: '좁은 통로에서 걸어오던 직원을 보지 못했다. 간신히 멈췄다.',
        fx: { stats: { happiness: -2, health: -1 }, issues: { job: 1 } }, reason: '물류 현장 아차 사고',
      }),
      ev('87304', 'peak_season', {
        ages: [20, 64], p: 0.12, cooldown: 3,
        text: '물류 성수기에 야간 단기 근무 제안이 왔다. 수당은 높고 시간은 길다.',
        choice: {
          prompt: '어떻게 할까?',
          options: [
            { id: 'night', label: '야간 근무를 받는다', fx: { stats: { wealth: 2, health: -2, leisure: -3 } }, result: '야간에 지게차를 몰았다. 통장은 두둑해졌고 눈은 늘 뻑뻑했다.' },
            { id: 'keep', label: '지금 근무를 유지', fx: { stats: { leisure: 1 }, issues: { job: 1 } }, result: '평소 근무만 했다. 동료 몇은 수당을 더 챙겼다.' },
          ],
          default: 'keep',
        },
        reason: '성수기 야간 근무 제안',
      }),
    ],
    hazard: 3, burnout: 0.04,
  }),
  J('87406', '건설 및 채굴기계 운전원', {
    entry: [
      E('license', { license: 'drive', minEdu: 'none', ages: [22, 64], p: 0.4, years: 0, text: '건설기계 자격을 따서 현장 장비 기사로 일을 시작했다.' }),
      E('self', { license: 'drive', minEdu: 'none', ages: [34, 62], p: 0.06, text: '장비를 할부로 사서 개인 기사로 일하기 시작했다.' }),
    ],
    transitions: [
      tr('87401', [28, 64], 3, 0.03, '굴착기 작업으로 이동'),
      tr('87408', [28, 64], 3, 0.03, '덤프트럭으로 이동'),
      tr('87301', [30, 62], 4, 0.02, '크레인 운전으로 이동'),
    ],
    events: [
      ev('87406', 'idle_days', {
        ages: [24, 70], p: 0.15, cooldown: 3,
        text: '비와 공사 중단으로 장비를 세워 둔 날이 길다. 할부금은 그대로 나간다.',
        fx: { stats: { wealth: -2, happiness: -1 }, issues: { job: 3 } }, reason: '일감 공백',
      }),
      ev('87406', 'equipment_loan', {
        when: onSelf('87406'), ages: [30, 66], p: 0.11, once: true,
        text: '쓰던 장비가 낡았다. 새 장비는 비싸고, 수리비도 만만치 않다.',
        choice: {
          prompt: '어떻게 할까?',
          options: [
            { id: 'new', label: '새 장비를 산다', fx: { stats: { wealth: -2, happiness: 2 }, issues: { job: -1 }, money: { debt: 6000 } }, result: '할부로 새 장비를 샀다. 현장에서 일감이 더 잘 들어왔다.' },
            { id: 'repair', label: '수리해서 쓴다', fx: { stats: { wealth: -1, leisure: -1, happiness: -1 }, issues: { job: 2 } }, result: '수리를 거듭하며 버텼다. 고장 나는 날이 걱정이다.' },
          ],
          default: 'repair',
        },
        reason: '장비 교체 고민',
      }),
    ],
    hazard: 3, burnout: 0.03,
  }),

  // ───────── 9 단순 노무 ─────────
  J('91001', '건설 및 광업 단순 종사자', {
    entry: [
      E('hire', { minEdu: 'none', ages: [18, 72], p: 0.4, text: '인력사무소를 통해 건설 현장 일용직으로 일을 시작했다.' }),
    ],
    transitions: [
      tr('78210', [24, 60], 3, 0.04, '철근 일로 이동'),
      tr('78243', [24, 60], 3, 0.03, '형틀 목공으로 이동'),
      tr('94201', [55, 76], 2, 0.03, '경비 일로 이동'),
    ],
    events: [
      ev('91001', 'rain_idle', {
        ages: [18, 72], p: 0.17, cooldown: 3,
        text: '비가 이어져 새벽 인력사무소에 나가도 일이 없었다. 며칠 일당이 비었다.',
        fx: { stats: { wealth: -2, happiness: -1 }, issues: { job: 3 } }, reason: '우천 휴무',
      }),
      ev('91001', 'insurance_gap', {
        ages: [20, 72], p: 0.11, cooldown: 4,
        text: '다친 동료가 산재 처리로 곤란을 겪었다. 내 일당도 신고 없이 받는다.',
        choice: {
          prompt: '어떻게 할까?',
          options: [
            { id: 'ask', label: '신고를 요구한다', fx: { stats: { relations: -2, happiness: 1 }, issues: { job: 3, fairness: -2 } }, result: '반장에게 일용 신고를 요구했다. 다음 현장에서 부르는 횟수가 줄었다.' },
            { id: 'keep', label: '일당을 그대로 받는다', fx: { stats: { wealth: 3, happiness: -1 }, issues: { fairness: 3, medical: 2 } }, result: '말을 아꼈다. 일당은 그대로였고 마음 한쪽이 불안했다.' },
          ],
          default: 'keep',
        },
        reason: '일용 신고 문제',
      }),
    ],
    hazard: 3, burnout: 0.03,
  }),
  J('92111', '하역‧적재 및 분류 단순 종사자', {
    entry: [
      E('hire', { minEdu: 'none', ages: [18, 62], p: 0.35, text: '인력 알선을 통해 물류센터 상하차 일을 시작했다.' }),
    ],
    transitions: [
      tr('87304', [22, 62], 2, 0.03, '지게차 운전으로 이동'),
      tr('92120', [20, 62], 2, 0.03, '분류 일로 이동'),
      tr('91001', [24, 64], 2, 0.02, '건설 현장 일로 이동'),
    ],
    events: [
      ev('92111', 'heavy_load', {
        ages: [18, 65], p: 0.17, cooldown: 3,
        text: '상자가 쉴 새 없이 쏟아졌다. 하루 몇 톤을 들었다. 허리가 뜨겁다.',
        fx: { stats: { health: -3, leisure: -1 }, issues: { medical: 2 } }, reason: '중량물 반복 작업',
      }),
      ev('92111', 'sudden_cancel', {
        ages: [18, 65], p: 0.14, cooldown: 3,
        text: '당일 아침 일이 없다는 문자가 왔다. 이미 새벽에 일어나 있었다.',
        fx: { stats: { wealth: -1, happiness: -1 }, issues: { job: 3 } }, reason: '당일 일감 취소',
      }),
    ],
    hazard: 2, burnout: 0.04,
  }),
  J('92120', '하역‧적재 및 분류 단순 종사자', {
    entry: [
      E('hire', { minEdu: 'none', ages: [18, 62], p: 0.35, era: [1992, null], text: '물류센터 계약직으로 입사해 화물 분류를 맡았다.' }),
    ],
    transitions: [
      tr('92111', [20, 62], 2, 0.03, '상하차 일로 이동'),
      tr('87304', [22, 62], 2, 0.03, '지게차 운전으로 이동'),
      tr('93091', [24, 64], 2, 0.03, '포장 일로 이동'),
    ],
    events: [
      ev('92120', 'peak_wave', {
        ages: [18, 65], p: 0.15, cooldown: 3,
        text: '명절 전 물량이 밀려왔다. 분류 속도를 못 맞춰 연장 근무가 이어졌다.',
        fx: { stats: { health: -2, leisure: -3, wealth: 1 } }, reason: '명절 물량 집중',
      }),
      ev('92120', 'short_contract', {
        ages: [18, 65], p: 0.14, cooldown: 3,
        text: '계약이 한 달 단위로 쪼개져 있다. 재계약 문자를 기다리는 날이 길다.',
        fx: { stats: { happiness: -2, wealth: -1 }, issues: { job: 4 } }, reason: '단기 계약 반복',
      }),
    ],
    hazard: 2, burnout: 0.04,
  }),
  J('92220', '배달원', {
    entry: [
      E('hire', { minEdu: 'none', ages: [25, 62], p: 0.3, era: [1992, null], text: '택배 대리점과 위탁 계약을 맺고 배송을 시작했다.' }),
    ],
    transitions: [
      tr('87231', [28, 62], 3, 0.03, '소형 화물차로 이동'),
      tr('92230', [24, 58], 2, 0.03, '배달 앱 일로 이동'),
      tr('87233', [32, 62], 4, 0.02, '대형 화물차로 이동'),
    ],
    events: [
      ev('92220', 'peak_delivery', {
        ages: [25, 64], p: 0.15, cooldown: 3,
        text: '명절 물량이 몰려 새벽부터 밤까지 차에 있었다. 이틀째 손목이 부었다.',
        fx: { stats: { health: -3, leisure: -3, wealth: 1 } }, reason: '명절 물량',
      }),
      ev('92220', 'sorting_dispute', {
        ages: [25, 64], p: 0.12, cooldown: 4,
        text: '배송 전 분류 시간은 수수료에 안 들어간다. 그 시간만 두세 시간이다.',
        choice: {
          prompt: '어떻게 할까?',
          options: [
            { id: 'hire', label: '분류 인력을 쓴다', fx: { stats: { wealth: -2, leisure: 2, health: 1 } }, result: '분류 일손을 따로 써 보았다. 수입은 줄었고 아침은 조금 여유로워졌다.' },
            { id: 'self', label: '직접 분류한다', fx: { stats: { health: -2, leisure: -3, wealth: 1 } }, result: '새벽에 나와 직접 분류했다. 하루가 길어졌다.' },
          ],
          default: 'self',
        },
        reason: '분류 작업과 수수료',
      }),
    ],
    hazard: 2, burnout: 0.06,
  }),
  J('92230', '배달원', {
    entry: [
      E('platform', { minEdu: 'none', ages: [18, 66], p: 0.3, era: [2015, null], text: '배달 앱에 라이더로 등록해 이륜차 배달을 시작했다.' }),
    ],
    transitions: [
      tr('92220', [24, 60], 2, 0.03, '택배 일로 이동'),
      tr('87293', [24, 62], 2, 0.03, '대리운전으로 이동'),
      tr('87231', [28, 62], 3, 0.02, '화물 운전으로 이동'),
    ],
    events: [
      ev('92230', 'rain_run', {
        ages: [18, 66], p: 0.17, cooldown: 3,
        text: '비 오는 날은 단가가 오른다. 젖은 도로에서 미끄러져 무릎이 까졌다.',
        fx: { stats: { health: -2, wealth: 1 } }, reason: '빗길 배달',
      }),
      ev('92230', 'rate_cut', {
        ages: [18, 66], p: 0.12, cooldown: 3,
        text: '앱의 건당 배달 단가가 바뀌어 같은 거리의 수입이 내려갔다.',
        choice: {
          prompt: '어떻게 할까?',
          options: [
            { id: 'more', label: '건수를 늘린다', fx: { stats: { wealth: 1, health: -3, leisure: -3 } }, result: '쉬는 시간 없이 콜을 잡았다. 하루 건수는 늘었고 저녁에는 말이 줄었다.' },
            { id: 'side', label: '다른 일을 병행', fx: { stats: { wealth: 1, leisure: -2, happiness: -1 }, issues: { fairness: 2 } }, result: '낮에 다른 일을 구해 두 가지를 번갈아 했다.' },
          ],
          default: 'more',
        },
        reason: '플랫폼 단가 변경',
      }),
    ],
    hazard: 2, burnout: 0.05,
  }),
  J('92291', '배달원', {
    entry: [
      E('hire', { minEdu: 'none', ages: [16, 62], p: 0.3, text: '음식점에 배달 직원으로 들어가 이륜차로 배달했다.' }),
    ],
    transitions: [
      tr('92230', [18, 60], 2, 0.04, '앱 라이더로 이동'),
      tr('45311', [20, 62], 2, 0.03, '홀 서빙으로 이동'),
      tr('92220', [24, 60], 2, 0.02, '택배 일로 이동'),
    ],
    events: [
      ev('92291', 'lunch_rush', {
        ages: [16, 64], p: 0.15, cooldown: 3,
        text: '점심 주문이 한꺼번에 몰렸다. 신호를 넘나들며 시간을 맞췄다.',
        fx: { stats: { health: -2, happiness: -1 } }, reason: '점심 배달 집중',
      }),
      ev('92291', 'shop_closed', {
        ages: [16, 64], p: 0.11, cooldown: 4,
        text: '일하던 음식점이 문을 닫았다. 남은 일당은 며칠 뒤에야 받았다.',
        fx: { stats: { wealth: -1, happiness: -1 }, issues: { job: 5 } }, reason: '가게 폐업',
      }),
    ],
    hazard: 2, burnout: 0.04,
  }),
  J('93099', '제조 관련 단순 종사자', {
    entry: [
      E('hire', { minEdu: 'none', ages: [18, 70], p: 0.4, text: '파견업체를 통해 제조 공장 단순 포장 일을 시작했다.' }),
    ],
    transitions: [
      tr('93091', [20, 66], 2, 0.03, '수동 포장 일로 이동'),
      tr('83231', [24, 58], 3, 0.02, '기계 조작으로 이동'),
      tr('94110', [35, 72], 2, 0.03, '청소 일로 이동'),
    ],
    events: [
      ev('93099', 'dispatch_end', {
        ages: [18, 70], p: 0.17, cooldown: 3,
        text: '파견 계약이 끝났다. 공장이 주문이 줄었다며 인원을 줄였다.',
        fx: { stats: { wealth: -2, happiness: -2 }, issues: { job: 5 } }, reason: '파견 계약 종료',
      }),
      ev('93099', 'line_move', {
        ages: [20, 66], p: 0.11, cooldown: 4,
        text: '공장 라인이 다른 지역으로 옮겨 간다고 한다. 새 공장은 출퇴근이 멀다.',
        choice: {
          prompt: '어떻게 할까?',
          options: [
            { id: 'follow', label: '새 공장으로 간다', fx: { stats: { wealth: 1, leisure: -4, health: -1 }, issues: { region: 2 } }, result: '멀어진 출퇴근길을 매일 오갔다. 일자리는 이어졌다.' },
            { id: 'near', label: '가까운 일을 찾는다', fx: { stats: { leisure: 1, wealth: -2 }, issues: { job: 3 } }, result: '집 가까운 곳에서 일을 구했다. 일당은 조금 줄었다.' },
          ],
          default: 'near',
        },
        reason: '공장 라인 이전',
      }),
    ],
    hazard: 2, burnout: 0.04,
  }),
  J('94110', '청소 관련 종사자', {
    entry: [
      E('hire', { minEdu: 'none', ages: [35, 76], p: 0.4, text: '용역업체에 채용돼 건물 청소 일을 시작했다.' }),
    ],
    transitions: [
      tr('94142', [35, 68], 2, 0.03, '수거 일로 이동'),
      tr('94201', [50, 76], 2, 0.03, '경비 일로 이동'),
      tr('95110', [38, 74], 2, 0.03, '가사 일로 이동'),
    ],
    events: [
      ev('94110', 'wet_floor', {
        ages: [35, 78], p: 0.15, cooldown: 3,
        text: '젖은 바닥을 닦다 미끄러져 허리를 짚었다. 파스를 붙이고 마저 닦았다.',
        fx: { stats: { health: -2, happiness: -1 } }, reason: '낙상과 허리 부담',
      }),
      ev('94110', 'wider_area', {
        ages: [35, 78], p: 0.12, cooldown: 4,
        text: '담당 구역이 넓어졌다. 시간은 그대로고 임금도 그대로다.',
        choice: {
          prompt: '어떻게 할까?',
          options: [
            { id: 'ask', label: '구역 조정을 요청', fx: { stats: { relations: -1, happiness: 1 }, issues: { conflict: 2 } }, result: '관리자에게 구역과 시간을 조정해 달라고 요청했다. 답이 늦게 왔다.' },
            { id: 'fast', label: '빨리 끝낸다', fx: { stats: { health: -2, leisure: -1 } }, result: '휴식 시간을 줄여 구역을 돌았다. 퇴근길 무릎이 먼저 뻣뻣해졌다.' },
          ],
          default: 'fast',
        },
        reason: '담당 구역 확대',
      }),
    ],
    hazard: 2, burnout: 0.04,
  }),
  J('94142', '청소 관련 종사자', {
    entry: [
      E('hire', { minEdu: 'none', ages: [22, 62], p: 0.3, text: '지자체 위탁업체에 채용돼 쓰레기 수거 차량에 올랐다.' }),
    ],
    transitions: [
      tr('94141', [24, 66], 2, 0.03, '재활용품 수거로 이동'),
      tr('87231', [28, 62], 3, 0.02, '소형 화물차로 이동'),
      tr('94110', [38, 70], 2, 0.03, '건물 청소로 이동'),
    ],
    events: [
      ev('94142', 'night_collection', {
        ages: [22, 66], p: 0.15, cooldown: 3,
        text: '어두운 도로변에서 수거 차량에 매달려 일한다. 지나는 차가 가깝다.',
        fx: { stats: { health: -2, leisure: -2 } }, reason: '야간 도로 작업',
      }),
      ev('94142', 'sharp_waste', {
        ages: [22, 66], p: 0.14, cooldown: 3,
        text: '봉투 밖 날카로운 물건에 손을 베였다. 응급 처치만 하고 마저 돌았다.',
        fx: { stats: { health: -2 }, issues: { medical: 2 } }, reason: '수거 중 부상',
      }),
    ],
    hazard: 3, burnout: 0.04,
  }),
  J('94201', '건물 관리원', {
    entry: [
      E('hire', { minEdu: 'none', ages: [45, 78], p: 0.4, era: [1970, null], text: '경비 교육을 마치고 용역업체에 채용돼 아파트 경비를 맡았다.' }),
    ],
    transitions: [
      tr('94209', [50, 78], 2, 0.03, '건물 관리 일로 이동'),
      tr('41231', [45, 76], 2, 0.03, '시설 경비로 이동'),
      tr('99232', [50, 78], 2, 0.02, '주차 안내 일로'),
    ],
    events: [
      ev('94201', 'resident_rude', {
        ages: [45, 80], p: 0.15, cooldown: 3,
        text: '입주민이 주차 문제로 경비실 앞에서 큰 소리를 냈다. 주변이 지켜봤다.',
        choice: {
          prompt: '어떻게 할까?',
          options: [
            { id: 'bear', label: '참고 넘긴다', fx: { stats: { happiness: -4, leisure: 1 } }, result: '고개를 숙이고 사과했다. 퇴근길에 한참 말이 없었다.' },
            { id: 'office', label: '관리사무소에 알린다', fx: { stats: { happiness: 2, relations: -1, leisure: -1 }, issues: { conflict: 2 } }, result: '관리사무소에 상황을 알렸다. 이후 인사하는 입주민이 조금 줄었다.' },
          ],
          default: 'bear',
        },
        reason: '입주민 항의',
      }),
      ev('94201', 'guard_cut', {
        years: [2010, 2100], ages: [45, 80], p: 0.11, cooldown: 5,
        text: '경비 인원을 줄이고 무인 출입 시스템을 도입한다는 공고가 붙었다.',
        fx: { stats: { happiness: -2, wealth: -1 }, issues: { job: 6, tech: 3 } }, reason: '경비 인원 감축',
      }),
    ],
    hazard: 2, burnout: 0.04,
  }),
  J('95110', '가사 및 육아 도우미', {
    entry: [
      E('hire', { minEdu: 'none', ages: [30, 76], p: 0.3, text: '중개업체에 등록해 가정을 돌며 가사 일을 시작했다.' }),
    ],
    transitions: [
      tr('95120', [32, 72], 2, 0.04, '육아 도우미로 이동'),
      tr('94110', [38, 74], 2, 0.03, '건물 청소로 이동'),
      tr('42901', [32, 62], 3, 0.02, '산후조리 일로 이동'),
    ],
    events: [
      ev('95110', 'sudden_cancel', {
        ages: [30, 78], p: 0.15, cooldown: 3,
        text: '단골 가정에서 갑자기 이용을 끊었다. 그 집 몫의 수입이 사라졌다.',
        fx: { stats: { wealth: -2, happiness: -1 }, issues: { job: 3 } }, reason: '가정 이용 중단',
      }),
      ev('95110', 'agency_fee', {
        ages: [30, 78], p: 0.11, cooldown: 4,
        text: '중개업체가 수수료율을 올렸다. 직접 소개받는 길도 있다.',
        choice: {
          prompt: '어떻게 할까?',
          options: [
            { id: 'agency', label: '업체에 남는다', fx: { stats: { wealth: -2, leisure: 1 } }, result: '업체를 통한 일감을 이어 갔다. 수수료만큼 수입이 줄었다.' },
            { id: 'direct', label: '직접 소개로', fx: { stats: { wealth: 3, relations: 1, leisure: -2 }, issues: { job: 2 } }, result: '아는 집을 통해 직접 일감을 받았다. 연락과 일정은 혼자 챙겼다.' },
          ],
          default: 'agency',
        },
        reason: '중개 수수료율 인상',
      }),
    ],
    hazard: 1, burnout: 0.04,
  }),
  J('95120', '가사 및 육아 도우미', {
    entry: [
      E('hire', { minEdu: 'none', ages: [28, 72], p: 0.3, text: '민간 중개업체에 등록해 가정에서 아이를 돌보기 시작했다.' }),
    ],
    transitions: [
      tr('42191', [30, 66], 2, 0.04, '아이돌보미로 이동'),
      tr('95110', [32, 72], 2, 0.03, '가사 일로 이동'),
      tr('42901', [32, 62], 3, 0.02, '산후조리 일로 이동'),
    ],
    events: [
      ev('95120', 'overtime_ask', {
        ages: [28, 74], p: 0.14, cooldown: 3,
        text: '부모의 퇴근이 늦어져 돌봄 시간을 두 시간 더 늘려 달라고 했다.',
        choice: {
          prompt: '어떻게 응할까?',
          options: [
            { id: 'stay', label: '연장해 돌본다', fx: { stats: { wealth: 2, leisure: -2, relations: 2 } }, result: '아이와 저녁을 같이 먹었다. 내 집 귀가 시간은 늦어졌다.' },
            { id: 'decline', label: '정해진 시간만', fx: { stats: { leisure: 1, relations: -2 }, issues: { conflict: 1 } }, result: '정해진 시간까지만 돌보겠다고 말했다. 부모의 표정이 어색해졌다.' },
          ],
          default: 'stay',
        },
        reason: '돌봄 시간 연장 요청',
      }),
      ev('95120', 'child_sick', {
        ages: [28, 74], p: 0.12, cooldown: 3,
        text: '돌보던 아이가 열이 올라 밤새 체온을 쟀다. 부모가 올 때까지 안았다.',
        fx: { stats: { health: -1, leisure: -2, relations: 2 } }, reason: '아이 발열 돌봄',
      }),
    ],
    hazard: 1, burnout: 0.04,
  }),
  J('95220', '음식 관련 단순 종사자', {
    entry: [
      E('hire', { minEdu: 'none', ages: [16, 76], p: 0.4, text: '음식점에 주방 보조로 들어가 설거지와 재료 손질을 맡았다.' }),
    ],
    transitions: [
      tr('45110', [22, 66], 4, 0.03, '조리 일로 이동'),
      tr('45391', [30, 70], 2, 0.03, '병원 배식 일로 이동'),
      tr('95210', [18, 60], 2, 0.03, '패스트푸드 준비로'),
    ],
    events: [
      ev('95220', 'slippery_floor', {
        ages: [16, 78], p: 0.15, cooldown: 3,
        text: '기름진 바닥과 뜨거운 물 사이에서 하루를 보냈다. 손등에 화상이 늘었다.',
        fx: { stats: { health: -2 } }, reason: '주방 작업 환경',
      }),
      ev('95220', 'training_up', {
        ages: [18, 66], p: 0.11, once: true,
        text: '주방장이 불 앞 일을 가르쳐 보겠다고 한다. 힘들어지지만 단가가 오른다.',
        choice: {
          prompt: '어떻게 할까?',
          options: [
            { id: 'learn', label: '배워 보겠다', fx: { stats: { intellect: 1, wealth: 1, leisure: -2, health: -1 } }, result: '칼질과 불 조절을 배우기 시작했다. 하루가 한결 길어졌다.' },
            { id: 'keep', label: '지금 일을 유지', fx: { stats: { leisure: 2, happiness: 1 }, issues: { job: 1 } }, result: '설거지와 손질을 그대로 맡았다. 부담이 덜한 대신 일당은 그대로였다.' },
          ],
          default: 'keep',
        },
        reason: '조리 일 배우기 제안',
      }),
    ],
    hazard: 1, burnout: 0.04,
  }),
  J('99110', '농림어업 관련 단순 종사자', {
    entry: [
      E('hire', { minEdu: 'none', ages: [20, 78], p: 0.4, text: '일손이 모자라는 철에 농가에서 일당으로 일하기 시작했다.' }),
    ],
    transitions: [
      tr('61121', [30, 66], 4, 0.03, '채소 재배로 이동'),
      tr('99130', [40, 76], 3, 0.02, '어업 보조 일로 이동'),
      tr('61110', [32, 66], 4, 0.02, '벼농사로 이동'),
    ],
    events: [
      ev('99110', 'off_season', {
        ages: [20, 80], p: 0.15, cooldown: 3,
        text: '농한기가 시작되자 일이 거의 없다. 일용 소득이 끊긴 겨울이 길다.',
        fx: { stats: { wealth: -2, happiness: -1 }, issues: { job: 3, region: 2 } }, reason: '농한기 일감 부족',
      }),
      ev('99110', 'farm_offer', {
        ages: [25, 70], p: 0.11, once: true,
        text: '자주 가던 농가에서 상시 근무 제안이 왔다. 월급은 일정하나 적다.',
        choice: {
          prompt: '어떻게 할까?',
          options: [
            { id: 'steady', label: '상시로 일한다', fx: { stats: { wealth: -1, happiness: 1, leisure: -1 }, issues: { job: -2 } }, result: '월급이 매달 같은 날 들어왔다. 농사철 아닌 때도 할 일이 생겼다.' },
            { id: 'daily', label: '일당으로 계속', fx: { stats: { wealth: 1, leisure: 1 }, issues: { job: 3 } }, result: '이 집 저 집을 돌며 일당으로 일했다. 겨울이 다시 걱정이었다.' },
          ],
          default: 'daily',
        },
        reason: '상시 고용 제안',
      }),
    ],
    hazard: 2, burnout: 0.03,
  }),
];

// 핵심 150(기본 사건 2개 + jobs-extra의 추가 사건) + 확충 직업. 엔진은 이 배열만 읽는다.
export default [
  ...BASE.map(c => (MORE[c.code] ? { ...c, events: [...c.events, ...MORE[c.code]] } : c)),
  ...EXTRA,
];
