// 외부 조사 카탈로그 KR-001~125 변환(1/2). 주인공은 1960년 이후 출생이라 1960년 이전, 또는 해당 연도에 성인(≥18)이 될 수 없는 카드는
// 사건이 아니라 family-history-ext.js 가족사로 압축했다. 이 파일에는 연도·나이 창이 실제로 겹치는 4건만 둔다(docs/impl/catalog-notes-a.md).
// 출처: EXT.H08 산업화, EXT.H10 평준화, EXT.H25 시대별 금기와 자율. 확률·효과는 모두 '게임 추정'.

// 고교평준화: 1974 서울·부산, 1975 대구·인천·광주(H10, 검색 확인). 대전 등 중소도시는 1979~80 자료가 갈려 제외(보수).
const LEVELED = { seoul: 1974, busan: 1974, daegu: 1975, incheon: 1975, gwangju: 1975 };

export default [
  // KR-078 초등 과밀학급·2부제. 노출 창: 1960~69년 7~9세(1960~62년생). 2부제 존재는 K3 통설(수치 미확인)이라 문구를 단정하지 않는다.
  {
    id: 'ext.kr078', ages: [7, 9], years: [1960, 1969], once: true,
    when: L => L?.birth?.urban !== false,
    // p 근거: 게임 추정. 1960년대 도시 초등 과밀(K3 통설, 비율 미확인) → 해당 창 도시 아동 중 일부로 0.12.
    p: 0.12,
    text: '같은 교실을 오전반과 오후반이 나누어 쓴다. 집안 일정도 바뀐다.',
    reason: '교실 부족과 수업 시간표',
    src: ['EXT.H08'],
    sensitive: null,
    choice: {
      prompt: '수업 시간을 어떻게 쓸까?',
      options: [
        { id: 'fit', label: '수업 시간에 맞춘다', fx: { stats: { intellect: 1, leisure: -2 }, issues: { edu: 2 } }, result: '시간표에 맞춰 밥 먹는 시간부터 바꿨다.' },
        { id: 'review', label: '친구와 복습한다', fx: { stats: { relations: 2, intellect: 1, leisure: -1 } }, result: '비는 반나절에 친구와 책을 펴 놓고 서로 물었다.' },
        { id: 'ask', label: '교사에게 질문한다', fx: { stats: { intellect: 2, happiness: -1 }, issues: { edu: 1 } }, result: '쉬는 시간이 짧아 질문은 몇 개만 겨우 했다.' },
      ],
      default: 'fit',
    },
  },

  // KR-116 고교평준화 배정. 1974 서울·부산, 1975 대구·인천·광주 해당 지역 14~15세(1959~1964년생 중 1960년대생).
  {
    id: 'ext.kr116', ages: [14, 15], years: [1974, 1979], once: true,
    when: L => { const y = LEVELED[L?.home?.region]; return y != null && L.year >= y; },
    // p 근거: 게임 추정. 해당 지역 중3·고1 학생에게 사실상 전원 적용이지만 진학 이정표와 겹치므로 일반 사건은 낮게 0.15.
    p: 0.15,
    text: '고등학교 배정 방식이 달라졌다. 집안의 입시 이야기도 바뀐다.',
    reason: '고교평준화 배정',
    src: ['EXT.H10'],
    sensitive: null,
    choice: {
      prompt: '배정을 어떻게 받아들일까?',
      options: [
        { id: 'rule', label: '배정 기준을 확인한다', fx: { stats: { intellect: 1, happiness: -1 }, issues: { edu: -2 } }, result: '배정 방식과 통학 구역을 안내문으로 확인했다.' },
        { id: 'commute', label: '통학 여건을 따진다', fx: { stats: { leisure: -2, wealth: -1 }, issues: { edu: 1 } }, result: '버스 노선과 통학 시간을 손으로 적어 보았다.' },
        { id: 'own', label: '자기 공부를 이어간다', fx: { stats: { intellect: 2, leisure: -2 }, issues: { edu: 2 } }, result: '학교와 상관없이 하던 공부를 계속하기로 했다.' },
      ],
      default: 'rule',
    },
  },

  // KR-108 야간 수업. 노출 창: 1976~79년 16~19세 취업 청년. 산업체 특별학급·부설학교는 1977년 제도화(검색 확인), 야간학교는 그 전에도 있었음.
  {
    id: 'ext.kr108', ages: [16, 19], years: [1976, 1979], once: true,
    when: L => L?.job?.status === 'employed' && L?.edu?.stage !== 'college',
    // p 근거: 게임 추정. 1988년 산업체 학교 약 12만 명(검색 확인)에서 거슬러 1970년대 말 근로 청소년 일부 → 0.1.
    p: 0.1,
    text: '낮에는 일하고 밤에는 수업을 들을 수 있다고 한다. 잠은 더 짧아진다.',
    reason: '일과 야간 수업',
    src: ['EXT.H08'],
    sensitive: null,
    choice: {
      prompt: '야간 수업을 어떻게 할까?',
      options: [
        { id: 'enroll', label: '야간학교를 알아본다', fx: { stats: { intellect: 2, health: -2, leisure: -2 }, issues: { edu: -3 } }, result: '입학 조건과 수업 시간을 묻고 돌아왔다.' },
        { id: 'shift', label: '주당 일수를 조정한다', fx: { stats: { leisure: 1, wealth: -2 }, issues: { job: 3 } }, result: '일하는 날을 줄여 달라 했고 답은 며칠 뒤에 온다.' },
        { id: 'work', label: '지금 일을 우선한다', fx: { stats: { wealth: 2, health: -1, intellect: -1 }, issues: { edu: 3 } }, result: '이번엔 일을 택했고, 배울 기회는 미뤄 두었다.' },
      ],
      default: 'enroll',
    },
  },

  // KR-113 두발·복장 단속. 1973년 경범죄처벌법에 장발이 추가, 1976년 강화, 1980~82년 자율화(H25·검색 확인). 노출 창: 1971~79년 15~19세.
  {
    id: 'ext.kr113', ages: [15, 19], years: [1971, 1979], cooldown: 3,
    when: L => L?.birth?.urban !== false,
    // p 근거: 게임 추정. 1973년 장발 단속 적발 1만 2천여 명(검색, 출처 한 건) 대비 청소년 전체가 커서 연 0.08.
    p: 0.08,
    text: '복장과 머리 모양을 두고 단속 이야기가 오간다. 등굣길이 조심스럽다.',
    reason: '두발·복장 단속',
    src: ['EXT.H25'],
    sensitive: null,
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'change', label: '당장 복장을 바꾼다', fx: { stats: { happiness: -2, relations: 1 }, issues: { conflict: 2 } }, result: '머리를 다듬고 옷매무새를 고친 뒤 길을 나섰다.' },
        { id: 'together', label: '동행자와 귀가한다', fx: { stats: { relations: 2, leisure: -1 }, issues: { conflict: 1 } }, result: '친구와 큰길을 피해 함께 돌아왔다.' },
        { id: 'rule', label: '규정을 확인한다', fx: { stats: { intellect: 1, happiness: -1 }, issues: { fairness: 3 } }, result: '무엇이 단속 대상인지 선생님께 물어 적어 두었다.' },
      ],
      default: 'rule',
    },
  },
];
