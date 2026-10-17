// 콘텐츠 A — 영유아기(0~6세) 우연 사건 22건. 형식: ARCHITECTURE §8, 카탈로그: GDD §9.4 '콘텐츠 A'.
// 톤: 아이 시점의 사실, 씁쓸함은 덤덤하게. 가난·장애·다문화·한부모는 결핍이 아니라 구조·접근성으로 쓴다.
// 근거 통계가 있는 사건만 src. 확률 p는 GDD §9.1 가이드(단발 .05~.25, 반복 .03~.10 + cooldown).
// school.js가 같은 보조 함수(era·Q·moved)를 가져다 쓴다.

// era([[시작연도, 문장 | 문장[]], …]) → (L, ctx) => 문장. 해당 연도에 맞는 마지막 행을 쓴다.
export const era = rows => (L, c) => {
  const y = L?.year ?? 2000;
  let t = rows[0][1];
  for (const [from, s] of rows) if (y >= from) t = s;
  return Array.isArray(t) ? (c?.pick ? c.pick(t) : t[0]) : t;
};
// 문장 배열에서 하나 고르는 함수 템플릿(엔진 ctx.pick 사용).
export const pk = arr => (L, c) => (c?.pick ? c.pick(arr) : arr[0]);
export const Q = L => L?.birth?.quintile ?? 3;
// 이번 해에 가구가 이사했는가(엔진: housing이 flags.familyMove 또는 home.moves에 기록)
export const moved = L => L?.flags?.familyMove === L?.year || !!L?.home?.moves?.some?.(m => m.year === L.year);
// 아래 동생이 있는가(형제 수 − 위 형제 수)
const younger = L => L?.family?.siblingMembers
  ? L.family.siblingMembers.filter(s => s.alive && s.birthYear > L.birth.year && s.birthYear <= L.year).length
  : (L?.family?.siblings ?? 0) - ((L?.birth?.order ?? 1) - 1);

export default [
  // ───────── 첫 선택(firstChoice, 4~5세) ─────────
  {
    id: 'early.first.swing', ages: [4, 5], p: 0.06, once: true, tags: ['firstChoice'],
    text: '놀이터에 그네가 하나뿐이었다. 먼저 탄 아이가 내리지 않았다.',
    reason: '놀이터 그네 앞에서의 선택',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'wait', label: '줄 서서 기다린다', fx: { stats: { happiness: 1, relations: 1, leisure: -3 }, traits: { agree: 2 } }, result: '차례가 왔을 때는 해가 기울어 있었다.', hint: '흔한 행동' },
        { id: 'share', label: '같이 타자고 한다', fx: { stats: { relations: 3, happiness: -1 }, traits: { extra: 2 } }, result: '둘이 번갈아 그네를 밀어 주었다.' },
        { id: 'claim', label: '내 차례라고 말한다', fx: { stats: { happiness: 3, leisure: 1, relations: -2 }, traits: { extra: 1, agree: -1 } }, result: '그 애는 내렸고, 한동안 나를 쳐다보았다.' },
      ],
      default: 'wait',
    },
  },
  {
    id: 'early.first.drawing', ages: [4, 5], p: 0.06, once: true, tags: ['firstChoice'],
    text: '선생님이 마음대로 그려 보라며 도화지를 나눠 주었다.',
    reason: '도화지에 무엇을 그릴지 정한 선택',
    choice: {
      prompt: '무엇을 그릴까?',
      options: [
        { id: 'house', label: '우리 집', fx: { stats: { happiness: 2, relations: 1, leisure: -2 }, traits: { consc: 1 } }, result: '엄마가 그림을 냉장고에 붙여 주었다.' },
        { id: 'monster', label: '상상 속 괴물', fx: { stats: { intellect: 3, happiness: 2 }, traits: { open: 2 } }, result: '선생님이 무엇이냐고 물었고, 나는 길게 설명했다.' },
        { id: 'friend', label: '짝꿍 얼굴', fx: { stats: { relations: 3, happiness: 1, leisure: -1 }, traits: { agree: 2 } }, result: '짝꿍은 자기 얼굴이라며 좋아했다.' },
      ],
      default: 'house',
    },
  },
  {
    id: 'early.first.cat', ages: [4, 5], p: 0.06, once: true, tags: ['firstChoice'],
    text: '골목 담벼락 아래 길고양이가 있었다. 손에는 과자가 있었다.',
    reason: '길고양이 앞에서의 선택',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'give', label: '과자를 나눠 준다', fx: { stats: { happiness: 2, leisure: -2 }, traits: { agree: 2 } }, result: '고양이는 과자만 먹고 사라졌다가 며칠 뒤 또 왔다.' },
        { id: 'watch', label: '멀리서 지켜본다', fx: { stats: { intellect: 3, happiness: 1, leisure: 1, relations: -2 }, traits: { open: 1, sens: 1 } }, result: '한참 보다가 엄마 손을 잡고 돌아왔다.' },
        { id: 'ask', label: '엄마에게 물어본다', fx: { stats: { relations: 2, happiness: 1, leisure: -1 }, traits: { consc: 1 } }, result: '엄마는 보기만 하라고 했고, 둘이 나란히 보았다.' },
      ],
      default: 'ask',
    },
  },
  {
    id: 'early.first.snack', ages: [4, 5], p: 0.06, once: true, tags: ['firstChoice'],
    text: '접시에 간식이 하나 남았다. 옆에 앉은 아이의 눈도 그곳에 있었다.',
    reason: '하나 남은 간식 앞에서의 선택',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'eat', label: '내가 먹는다', fx: { stats: { happiness: 3, relations: -2, leisure: 1 }, traits: { agree: -1 } }, result: '간식은 달았고, 옆 아이는 말없이 접시를 보았다.' },
        { id: 'split', label: '반으로 나눈다', fx: { stats: { relations: 2, happiness: 1 }, traits: { agree: 1 } }, result: '반쪽은 작았지만 둘 다 웃었다.', hint: '흔한 행동' },
        { id: 'give', label: '양보한다', fx: { stats: { relations: 3, happiness: 1, leisure: 3 }, traits: { agree: 2 } }, result: '그 애에게 건네고 먼저 놀러 갔다.' },
      ],
      default: 'split',
    },
  },

  {
    id: 'early.first.blocks', ages: [4, 5], p: 0.06, once: true, tags: ['firstChoice'],
    text: '쌓던 블록 탑이 거의 높아졌을 때, 다른 아이가 한 칸을 빼 갔다.',
    reason: '무너진 블록 탑 앞에서의 선택',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'rebuild', label: '다시 쌓는다', fx: { stats: { intellect: 3, leisure: -2, happiness: -1 }, traits: { consc: 2 } }, result: '블록을 다시 쌓았다.', hint: '흔한 행동' },
        { id: 'ask', label: '돌려 달라고 한다', fx: { stats: { happiness: 3, relations: -1, leisure: 1 }, traits: { extra: 1 } }, result: '그 애는 블록을 내밀었고, 우리는 말이 없었다.' },
        { id: 'share', label: '같이 쌓자고 한다', fx: { stats: { relations: 3, happiness: 1, leisure: -1 }, traits: { agree: 2 } }, result: '탑은 둘이 쌓은 만큼 삐뚤빼뚤했다.' },
      ],
      default: 'rebuild',
    },
  },
  {
    id: 'early.first.puddle', ages: [4, 5], p: 0.06, once: true, tags: ['firstChoice'],
    text: '비 갠 아침, 현관 앞에 웅덩이가 크게 고여 있었다.',
    reason: '웅덩이 앞에서의 선택',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'jump', label: '뛰어든다', fx: { stats: { happiness: 3, leisure: 3, health: -2 }, traits: { open: 2 } }, result: '장화 속까지 젖었고, 웃음이 먼저 나왔다.' },
        { id: 'look', label: '물속을 들여다본다', fx: { stats: { intellect: 3, happiness: -1, leisure: -1 }, traits: { open: 1, sens: 1 } }, result: '물에 비친 구름이 내 발에 닿았다.' },
        { id: 'hand', label: '엄마 손을 잡고 간다', fx: { stats: { relations: 2, happiness: -2, health: 1 }, traits: { consc: 1 } }, result: '웅덩이를 크게 돌아 어린이집에 도착했다.', hint: '흔한 행동' },
      ],
      default: 'hand',
    },
  },
  {
    id: 'early.first.balloon', ages: [4, 5], p: 0.06, once: true, tags: ['firstChoice'],
    text: '잔치가 끝나고 풍선이 하나 남았다. 두 아이가 같은 풍선을 보고 있었다.',
    reason: '하나 남은 풍선 앞에서의 선택',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'take', label: '내가 먼저 잡는다', fx: { stats: { happiness: 3, relations: -2, leisure: 1 }, traits: { extra: 1, agree: -1 } }, result: '풍선은 손에 들어왔고, 그 애는 고개를 돌렸다.' },
        { id: 'offer', label: '먼저 건넨다', fx: { stats: { relations: 3, happiness: -3, leisure: -1 }, traits: { agree: 2 } }, result: '그 애가 풍선 줄을 쥐고 오래 웃었다.' },
        { id: 'other', label: '다른 걸 찾는다', fx: { stats: { intellect: 2, leisure: 1, relations: -1 }, traits: { open: 1 } }, result: '구석에서 찌그러진 풍선 하나를 찾아냈다.' },
      ],
      default: 'other',
    },
  },
  {
    id: 'early.first.fall', ages: [4, 5], p: 0.06, once: true, tags: ['firstChoice'],
    text: '달리다 넘어져 무릎이 까졌다. 어른들은 조금 멀리 있었다.',
    reason: '넘어진 뒤의 선택',
    choice: {
      prompt: '어떻게 할까?',
      options: [
        { id: 'stand', label: '스스로 일어난다', fx: { stats: { health: -2, happiness: 1, relations: -1 }, traits: { consc: 1 } }, result: '무릎을 털고 일어나 다시 달렸다.' },
        { id: 'call', label: '엄마를 부른다', fx: { stats: { relations: 3, happiness: 1, leisure: -2 }, traits: { sens: 1 } }, result: '엄마가 달려와 무릎에 호 하고 불어 주었다.', hint: '흔한 행동' },
        { id: 'sit', label: '앉아서 쳐다본다', fx: { stats: { intellect: 2, happiness: -1, health: 1 }, traits: { open: 1 } }, result: '까진 무릎의 빨간 줄을 한참 들여다보았다.' },
      ],
      default: 'call',
    },
  },

  // ───────── 건강·돌봄 ─────────
  {
    id: 'early.night.fever', ages: [0, 3], p: 0.06, cooldown: 3,
    text: (L, c) => {
      const a = L?.birth?.healthAccess ?? 60;
      if (L?.year < 1982 && a < 50) return c.pick(['밤새 열이 내리지 않았다. 아버지가 업고 병원까지 걸었다.', '열이 오른 아이를 이불째 안고 첫차를 기다렸다.', '새벽까지 물수건을 갈았고, 병원 문은 아침에야 열렸다.']);
      if (a < 40) return c.pick(['한밤의 고열이었다. 응급실까지 가는 길이 사십 분이었다.', '열이 오른 밤, 가장 가까운 소아과는 이미 멀리 있었다.', '열이 내리지 않는 밤, 차를 구하는 데 한참이 걸렸다.']);
      return c.pick(['밤중에 열이 올라 응급실에 갔다. 해열제를 맞고 아침에 돌아왔다.', '새벽 응급실 형광등 아래서 체온계를 세 번 쟀다.', '열이 오른 밤, 이마에 손을 얹은 채 아침을 맞았다.']);
    },
    fx: { stats: { health: -2 }, issues: { medical: 2 } },
    reason: '밤중 고열과 응급실',
  },
  {
    id: 'early.vaccine', ages: [0, 1], p: 0.12, once: true,
    text: era([
      [1960, '보건소에서 주사를 맞았다. 예방접종 수첩 칸이 하나 채워졌다.'],
      [1990, '예방접종 수첩의 칸이 또 하나 채워졌다.'],
      [2015, '접종 기록이 앱에 한 줄 쌓였다.'],
    ]),
    fx: { stats: { health: 1 } },
    reason: '예방접종',
  },
  {
    id: 'early.lbw.clinic', ages: [0, 2], p: 0.35, once: true,
    when: L => !!L.birth?.lowBirthWeight,
    text: (L, c) => ((L.birth?.healthAccess ?? 60) < 40
      ? '외래 진료는 하루가 꼬박 걸렸다. 병원이 멀었다.'
      : c.pick(['외래 저울에 올랐다. 성장 곡선을 따라가고 있었다.', '작게 태어난 몸이 외래 기록지에서 조금씩 위로 올라갔다.'])),
    fx: { stats: { health: 1 }, issues: { medical: 2 } },
    reason: '저체중 출생 후 외래 진료',
    src: ['R01.S1'],
    // 카탈로그는 illness였으나 도움 줄(우울·자살 상담)이 영아에게 붙는 문제로 null — 노트 참조
    sensitive: null,
  },
  {
    id: 'early.dev.check', ages: [1, 5], p: 0.1, once: true, years: [2008, 2100],
    text: L => (L.birth?.disability === 'developmental'
      ? '검진에서 발달이 더디다는 말을 들었다. 정밀검사를 안내받았다.'
      : '영유아 검진에서 키와 말을 확인했다. 또래 범위 안이었다.'),
    fx: { stats: { health: 1 }, issues: { medical: 1 } },
    reason: '영유아 건강검진',
    src: ['R01.S1'],
  },
  {
    id: 'early.disability.therapy', ages: [1, 6], p: 0.2, once: true,
    when: L => !!L.birth?.disability,
    text: (L, c) => {
      const t = L.birth.disability;
      if (t === 'developmental') return c.pick(['발달 치료실 대기는 여덟 달이었다. 대기 명단이 길었다.', '치료실은 주 두 번이었고, 자리는 적었다.']);
      if (t === 'physical') return '재활 치료실이 멀어 매주 반나절을 길에서 보냈다.';
      if (t === 'hearing') return '청각 검사와 보청기 조정 일정이 몇 달씩 밀렸다.';
      if (t === 'visual') return '시각 재활 기관은 멀었고, 일정은 몇 달씩 밀렸다.';
      return '치료실 자리는 적었고, 대기는 길었다.';
    },
    fx: { stats: { wealth: -1, leisure: -1 }, issues: { medical: 4, care: 3 } },
    reason: '치료실 대기와 비용',
    src: ['R01.S1'],
    // 카탈로그는 illness였으나 장애를 질병·위기로 읽히게 하지 않으려 null — 노트 참조
    sensitive: null,
  },
  {
    id: 'early.atopy', ages: [1, 6], p: 0.05, once: true, years: [1985, 2100],
    text: ['아토피로 이불을 자주 빨았다. 연고는 늘 곁에 있었다.', '밤마다 가려워 잠을 설쳤다. 엄마는 이불 소재를 바꿨다.'],
    fx: { stats: { health: -1, wealth: -1 } },
    reason: '아토피 관리 비용',
  },

  // ───────── 돌봄·가정·주거 ─────────
  {
    id: 'early.daycare.wait', ages: [1, 4], p: 0.12, once: true, years: [2005, 2100],
    when: L => L.birth?.care === 'daycare' || !!L.birth?.parents?.dualIncome,
    text: era([
      [2005, '집 근처 어린이집 자리가 나기만 기다렸다.'],
      [2013, '국공립 어린이집 대기 번호는 백 번대였다.'],
      [2020, '엄마 휴대폰에는 어린이집 대기 번호가 떠 있었다.'],
    ]),
    fx: { stats: { leisure: -1 }, issues: { care: 3 } },
    reason: '어린이집 대기',
    src: ['R01.S1'],
  },
  {
    id: 'early.grandma', ages: [0, 5], p: 0.2, once: true,
    when: L => L.birth?.care === 'grandparent',
    text: ['낮에는 할머니 등에서 낮잠을 잤다.', '할머니의 된장국 냄새로 하루가 시작되었다.', '할머니가 업고 장에 가는 날이 많았다.'],
    fx: { stats: { relations: 2, happiness: 1 }, issues: { care: 2 } },
    reason: '조부모 손에서 자람',
    src: ['R01.S1'],
  },
  {
    id: 'early.move.lease', ages: [0, 6], p: 0.4, cooldown: 3,
    when: L => moved(L) && ['jeonse', 'monthly'].includes(L.home?.tenure),
    text: ['셋집 계약이 끝나 이삿짐을 쌌다. 아기 짐이 제일 많았다.', '이사하는 날, 젖병과 이불이 먼저 트럭에 올랐다.', '새 집 벽지는 지난집과 색이 달랐다. 한동안 잠이 얕았다.'],
    fx: { stats: { relations: -1, leisure: -1 }, issues: { housing: 3 } },
    reason: '셋집 계약 만기로 이사',
  },
  {
    id: 'early.sibling.jealous', ages: [2, 6], p: 0.2, once: true,
    when: L => younger(L) > 0,
    text: ['엄마 무릎이 동생 자리가 되었다. 나는 옆에 앉았다.', '동생이 울면 엄마가 먼저 일어났다. 나는 이불을 당겼다.', '"네가 큰애잖아"라는 말을 처음 들었다.'],
    fx: { stats: { happiness: -2, relations: -1 } },
    reason: '동생이 생긴 뒤의 서운함',
  },
  {
    id: 'early.parent.overtime', ages: [0, 6], cooldown: 4,
    p: L => (L?.birth?.parents?.dualIncome ? 0.07 : 0.05),
    text: (L, c) => {
      const par = L?.birth?.parents;
      const who = par?.singleParent ? '엄마' : par?.dualIncome ? c.pick(['엄마', '아빠']) : '아빠';
      return c.pick([`${who}는 내가 잠든 뒤에야 돌아왔다.`, `${who}를 기다리다 먼저 잠든 날이 많았다.`, `${who}의 퇴근은 늘 저녁 뉴스 뒤였다.`, `현관문 여는 소리를 기다리다 잠이 들었다.`]);
    },
    fx: { stats: { relations: -1 }, issues: { care: 2 } },
    reason: '부모의 늦은 귀가',
  },
  {
    id: 'early.parents.argue', ages: [2, 6], cooldown: 4,
    p: L => ((L?.stats?.wealth ?? 50) < 40 || Q(L) <= 2 ? 0.08 : 0.03),
    text: (L, c) => c.pick([
      '방문 너머로 큰 목소리가 들렸다. 이불을 끌어올렸다.',
      '어른들의 목소리가 높아졌다. 나는 장난감 소리를 키웠다.',
      '벽 너머 목소리가 높아졌다. 나는 인형을 꼭 안았다.',
      ...((L?.stats?.wealth ?? 50) < 40 ? ['방문 너머 큰 목소리 사이에 "월급"이 섞여 있었다.'] : []),
    ]),
    fx: { stats: { happiness: -2, relations: -1 } },
    reason: '집 안의 큰 목소리',
  },
  {
    id: 'early.rural.bus', ages: [4, 6], p: 0.2, once: true, years: [1990, 2100],
    when: L => L.birth?.urban === false,
    text: ['유치원 버스는 한 시간을 달려서야 닿았다.', '유치원 버스가 마을 세 곳을 돌아 마지막에 나를 태웠다.'],
    fx: { stats: { leisure: -1 }, issues: { region: 3 } },
    reason: '농촌에서 유치원까지의 거리',
  },
  {
    id: 'early.two.languages', ages: [2, 6], p: 0.2, once: true,
    when: L => !!L.birth?.parents?.multicultural,
    text: ['집에서는 엄마의 말, 밖에서는 동네 말을 썼다.', '엄마의 자장가를 아는 사람은 동네에 없었다.'],
    fx: { stats: { relations: 1, happiness: 1 } },
    reason: '두 말이 오가는 집',
  },

  // ───────── 일상 장면(시대별) ─────────
  {
    id: 'early.first.word', ages: [1, 2], p: 0.12, once: true,
    text: ['첫 단어는 "맘마"였다. 온 집이 박수를 쳤다.', '첫 단어는 "물"이었다. 컵을 든 손이 먼저 움직였다.', '첫 단어는 "까까"였다. 어른들이 서로 받아 적었다.'],
    fx: { stats: { intellect: 1, happiness: 1, relations: 1 } },
    reason: '첫 단어',
  },
  {
    id: 'early.dol.photo', ages: [1, 1], p: 0.25, once: true,
    text: era([
      [1960, '돌 사진을 사진관에서 찍었다. 흑백이었다.'],
      [1975, '사진관에서 색동한복을 입고 돌 사진을 찍었다.'],
      [1990, '사진관 돌 사진에는 울기 직전의 표정이 찍혔다.'],
      [2000, ['돌잔치를 열었다. 돌잡이에서 실타래를 집었다.', '돌잔치 뷔페에서 낯선 어른들이 번갈아 안아 주었다.']],
      [2010, ['스튜디오 돌 촬영을 했다. 소품이 아기보다 많았다.', '가족끼리 식당에서 돌상을 차렸다. 돌잡이는 연필이었다.']],
      [2020, '돌잔치는 가족끼리만 했다. 할머니는 영상통화로 함께했다.'],
      [2022, ['돌 영상이 가족 단톡방에 올라갔다.', '돌잔치 대신 가족끼리 집에서 사진을 찍었다.']],
    ]),
    fx: { stats: { relations: 1, happiness: 1 } },
    reason: '돌',
  },
  {
    id: 'early.cartoon', ages: [3, 6], p: 0.12, once: true,
    text: era([
      [1960, '이웃집 TV 앞에 모여 앉아 만화를 보았다.'],
      [1975, '저녁 만화영화 시간이면 TV 앞이 자리다툼이었다.'],
      [1990, '비디오 대여점에서 빌린 만화를 되감아 다시 보았다.'],
      [2000, '케이블 만화 채널을 틀어 달라고 졸랐다.'],
      [2010, '엄마 휴대폰으로 만화 영상을 보았다.'],
      [2020, '태블릿 속 영상을 보며 밥을 먹었다.'],
    ]),
    fx: { stats: { happiness: 2, leisure: 1 } },
    reason: '만화 보는 시간',
  },

  // ───────── 선택 ─────────
  {
    id: 'early.kinder.choice', ages: [5, 6], p: 0.3, once: true, years: [1990, 2100],
    text: '입학 전 마지막 해였다. 낮을 보낼 곳을 정해야 했다.',
    reason: '입학 전 낮 시간을 보낼 곳',
    choice: {
      prompt: '어디로 갈까?',
      options: [
        { id: 'kinder', label: '유치원에 간다', fx: { stats: { intellect: 2, wealth: -1, leisure: -1 } }, result: '노란 가방을 메고 유치원 버스를 타며 글자를 배웠다.', hint: '흔한 선택' },
        { id: 'daycare', label: '어린이집에 남는다', fx: { stats: { relations: 2, leisure: -1 }, issues: { care: -2 } }, result: '친구들과 한 해를 더 보냈고, 저녁까지 불이 켜져 있었다.' },
        { id: 'home', label: '집에서 보낸다', fx: { stats: { happiness: 2, leisure: 2 }, issues: { care: 3 } }, result: '낮은 집에서 보냈고, 가족의 시간표가 내 시간표가 되었다.' },
      ],
      default: 'kinder',
    },
  },
];
