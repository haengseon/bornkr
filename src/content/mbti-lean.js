// 게임용 성향(MBTI 풍, 실제 검사 아님)의 데이터. 근거: docs/research/personality/R18-mbti.md([확인]/[통설]/[게임 가정] 구분).
// 글자 가중 표기: 'NE' = {N:1,E:1}, 객체 = 글자별 가중. 점수 = Σ 가중 × 그 글자 쪽 기울기(−1~1).

// 시스템 결정: 선택 id별로 어느 글자 쪽 사람이 고를 법한지 [통설 → 게임 가정].
// 기본 행동(시간 초과·자동결정)·'성향 적합' 표시·직접 고른 뒤 축 이동이 이 표를 쓴다.
export const LEAN = {
  'sys.edu.tutoring': { more: { J: 1, S: 0.3 }, keep: { S: 1 }, less: { P: 1, N: 0.3 } },
  'sys.edu.high_type': { general: { J: 1, S: 0.3 }, voc: { S: 1, T: 0.3 }, special: { N: 1, J: 0.3 } },
  'sys.edu.path': { college: { J: 1 }, work: { S: 1, P: 0.3 }, retake: { J: 0.6, N: 0.6 } },
  'sys.job.first_offer': { take: { S: 1, J: 0.3 }, wait: { P: 1, N: 0.3 }, exam: { J: 1, S: 0.5 } },
  'sys.job.offer': { move: { N: 1, E: 0.6, P: 0.4 }, stay: { S: 1, J: 0.6 } },
  'sys.job.business': { open: { N: 1, E: 0.6, T: 0.3 }, job: { S: 1, J: 0.6 } },
  'sys.job.childcare': { leave: { J: 1 }, quit: { F: 1 }, keep: { T: 1 } },
  'sys.job.honorary': { accept: { S: 0.6, P: 0.4 }, stay: { J: 1 } },
  'sys.job.after_main': { work: { J: 1, S: 0.3 }, rest: { P: 1, I: 0.4 }, shop: { N: 1, E: 0.4 } },
  'sys.home.independence': { stay: { I: 0.6, S: 0.6, F: 0.3 }, room: { E: 0.6, P: 0.6 }, jeonse: { J: 1 } },
  'sys.home.renew': { pay: { S: 1 }, cheaper: { J: 0.6, T: 0.6 }, monthly: { P: 1 } },
  'sys.home.buy': { buy: { J: 1, T: 0.3 }, wait: { P: 1, N: 0.3 } },
  'sys.home.expire': { same: { S: 0.6, J: 0.6 }, down: { J: 0.6, T: 0.6 }, monthly: { P: 1 }, family: { F: 0.6, I: 0.6 } },
  'sys.fam.marry': { marry: { F: 0.6, J: 0.6, E: 0.3 }, later: { P: 1 }, single: { I: 0.6, T: 0.6, N: 0.3 } },
  'sys.fam.child': { have: { F: 1, J: 0.3 }, wait: { P: 1 }, none: { T: 0.6, I: 0.4, N: 0.3 } },
  'sys.fam.divorce': { divorce: { T: 1, N: 0.3 }, counsel: { F: 1 }, stay: { S: 0.6, J: 0.6 } },
  'sys.fam.love': { confess: { E: 1, P: 0.6 }, wait: { I: 1, J: 0.4 }, focus: { T: 1, J: 0.3 } },
  'sys.fam.parent_care': { home: { F: 1 }, facility: { T: 1 }, share: { J: 1, E: 0.3 } },
  'sys.age.grandcare': { yes: { F: 1, E: 0.4 }, some: { J: 1 }, no: { T: 0.6, I: 0.6 } },
  'sys.age.residence': { home: { S: 0.6, I: 0.6 }, facility: { T: 1 }, child: { F: 1 } },
  'sys.mil.timing': { now: { S: 1, P: 0.3 }, later: { J: 1 } },
  'sys.era.shock': { hold: { S: 0.6, J: 0.6 }, move: { N: 0.6, E: 0.6 }, cut: { J: 0.6, T: 0.6 }, learn: { N: 0.6, J: 0.6 }, close: { T: 1 }, buy: { N: 0.6, P: 0.6 }, wait: { I: 0.6, S: 0.6 } },
  'sys.chain.biz_crisis': { push: { N: 0.6, P: 0.6, F: 0.3 }, close: { T: 0.6, J: 0.6 } },
  'sys.chain.biz_rebuild': { again: { N: 0.6, E: 0.6 }, work: { S: 0.6, J: 0.6 } },
  'sys.chain.mortgage': { hold: { J: 1, S: 0.3 }, sell: { T: 1 } },
  'sys.chain.exam_retry': { again: { J: 1, I: 0.3 }, quit: { P: 1, T: 0.3 } },
  'sys.job.lost': { seek: { J: 0.6, S: 0.6 }, learn: { N: 0.6, J: 0.6 }, temp: { S: 0.6, P: 0.6 }, shop: { N: 0.6, E: 0.6 }, family: { F: 0.6, I: 0.6 } },
  'sys.invest.plan': { safe: { S: 0.6, J: 0.6 }, mix: { J: 1, T: 0.3 }, stock: { N: 0.6, E: 0.6 }, fx: { N: 0.6, T: 0.6 }, gold: { S: 1 }, realty: { J: 0.6, T: 0.6 }, none: { P: 1 } },
  'sys.invest.panic': { sell: { S: 0.6, F: 0.4 }, hold: { J: 1 }, add: { N: 0.6, T: 0.6 } },
  'sys.money.crunch': { sellhome: { T: 1 }, cut: { J: 1 }, family: { F: 1 }, loan: { P: 1 } },
};
export const LETTER_LABEL = { E: '외향(E)', I: '내향(I)', N: '직관(N)', S: '현실(S)', F: '감정(F)', T: '사고(T)', J: '계획(J)', P: '즉흥(P)' };

// 우연 결정(dec.* 등, 선택 id가 제각각): 선택지의 효과·위험·라벨에서 축을 추정한다 [게임 가정].
const EFFECT = { relations: { E: 0.5, F: 0.4 }, intellect: { N: 0.4, J: 0.3 }, wealth: { T: 0.4, J: 0.4 }, leisure: { P: 0.5, I: 0.2 }, happiness: { F: 0.3, P: 0.3 }, health: { J: 0.3, S: 0.2 } };
const RISK = { high: { N: 0.4, P: 0.4 }, low: { S: 0.4, J: 0.4 } };
const WORDS = [
  [/혼자|조용|집에서|홀로/, { I: 0.6 }], [/함께|같이|모임|친구|사람들|동호회|봉사/, { E: 0.6 }],
  [/계획|모은다|저축|준비|미리|꾸준/, { J: 0.6 }], [/일단|그냥|미룬다|나중에|즉흥|떠난다/, { P: 0.6 }],
  [/새로|도전|창업|해외|유학|배운다|바꾼다/, { N: 0.6 }], [/익숙|하던|그대로|안정|지킨다|유지/, { S: 0.6 }],
  [/마음|돕는다|위로|챙긴다|양보/, { F: 0.6 }], [/따져|계산|비교|조건|효율/, { T: 0.6 }],
];
export function optionLean(o = {}) {
  const w = {};
  const add = (lean, k = 1) => { for (const [ch, v] of Object.entries(lean)) w[ch] = (w[ch] || 0) + v * k; };
  for (const e of o.effects || []) if (EFFECT[e.key]) add(EFFECT[e.key], (e.dir ?? 1) * (e.size ?? 1) * 0.5);
  if (RISK[o.risk]) add(RISK[o.risk]);
  for (const [re, lean] of WORDS) if (re.test(o.label || '')) add(lean);
  return w;
}

// 결과 오즈(stats.leanOdds 에 곱): exp(점수) → 대략 ×0.85~×1.2 [게임 가정]
export const ODDS_LEAN = { relations: { F: 0.1, J: 0.05 }, intellect: { J: 0.12, N: 0.06 }, wealth: { J: 0.1 }, health: { J: 0.08 }, happiness: { E: 0.08, F: -0.04 } };
// 직업 대분류(KSCO) 가중 [통설 → 게임 가정]: 1관리자 2전문가 3사무 4서비스 5판매 6농림어업 7기능원 8장치·기계 9단순노무
export const JOB_LEAN = {
  1: { E: 0.1, T: 0.1, J: 0.1 }, 2: { N: 0.15, I: 0.05 }, 3: { S: 0.1, J: 0.12 }, 4: { E: 0.1, F: 0.12 }, 5: { E: 0.15, P: 0.05 },
  6: { S: 0.1, I: 0.05 }, 7: { S: 0.1, T: 0.1, I: 0.05 }, 8: { S: 0.1, T: 0.05 }, 9: { S: 0.05 },
};
// 지표·고민 증감 배율(1 + 점수) [게임 가정]: F형은 관계 변화에, T형은 일자리 불안에 덜, J형은 집·돈 계획 흔들림에 민감.
export const FX_SCALE = {
  stats: { relations: { F: 0.12, E: 0.04 }, happiness: { F: 0.05 } },
  issues: { job: { F: 0.1 }, care: { F: 0.1 }, conflict: { F: 0.08, I: 0.04 }, housing: { J: 0.08 }, tech: { S: 0.1 }, fairness: { T: 0.06 } },
};

// 한국 16유형 분포(%) [확인]: Myers-Briggs Korea Technical Brief(2020, N=3,998, 편의표본) — R18 §2-1.
export const KR_TYPES = {
  ISTJ: 12.4, ENFP: 10.5, ESTJ: 9.0, ISFP: 8.9, ESFP: 8.8, INFP: 7.8, ISTP: 7.4, ESFJ: 6.6,
  ISFJ: 6.1, ESTP: 5.6, INTP: 4.1, ENTP: 3.4, ENFJ: 2.6, INTJ: 2.5, ENTJ: 2.5, INFJ: 2.0,
};
// 성별 글자 배율 [게임 가정]: 한국 전체 축 비율에 미국·캐나다 표본의 성별 격차(F +30%p 등)를 이식한 R18 §5-1 추정치
// (남 E46·N35·F37·J41%, 여 E51·N35·F67·J45%)를 전체 비율(E48.8·F53.2·J43.6%)로 나눈 값.
export const KR_SEX_AXIS = {
  M: { E: 0.94, I: 1.055, F: 0.70, T: 1.35, J: 0.94, P: 1.046 },
  F: { E: 1.045, I: 0.96, F: 1.26, T: 0.705, J: 1.03, P: 0.975 },
};

// 유형 설명(시트 패널): 한 줄 특징·강점·주의점·큰 결정에서의 경향 [통설, 게임용 서술]
export const TYPE_INFO = {
  ISTJ: ['기록과 절차를 믿는 사람', '약속을 지키고 끝까지 해낸다', '익숙한 방식을 바꾸는 데 오래 걸린다', '안정된 직장·저축·자가 마련처럼 검증된 길을 고른다'],
  ISFJ: ['곁의 사람을 조용히 챙기는 사람', '꼼꼼하고 성실하게 돌본다', '자기 몫을 뒤로 미루다 지친다', '가족과 돌봄을 먼저 두고 무리 없는 쪽을 고른다'],
  ESTJ: ['일을 정리하고 끌고 가는 사람', '현실적이고 추진력이 있다', '남의 방식을 답답해한다', '조건을 따져 빠르게 정하고 계획대로 밀고 간다'],
  ESFJ: ['모임과 관계를 꾸리는 사람', '분위기를 살피고 잘 어울린다', '남의 평가에 흔들린다', '결혼·가족·주변의 기대를 크게 본다'],
  ISFP: ['자기 속도로 사는 사람', '감각이 섬세하고 유연하다', '갈등을 피하다 결정을 미룬다', '마음 편한 쪽, 지금 할 수 있는 쪽을 고른다'],
  INFP: ['속으로 의미를 찾는 사람', '공감이 깊고 자기 가치가 분명하다', '현실 계획이 늦어지기 쉽다', '좋아하는 일과 마음이 가는 길을 오래 고민한다'],
  ENFP: ['새로운 가능성에 끌리는 사람', '사람을 모으고 시작을 잘한다', '마무리와 꾸준함이 약하다', '이직·도전·새 출발을 비교적 쉽게 고른다'],
  ISTP: ['손과 머리로 문제를 푸는 사람', '위기에 침착하고 실용적이다', '감정 표현이 적어 오해를 산다', '필요한 만큼만 하고 자유로운 쪽을 고른다'],
  INFJ: ['멀리 보고 사람을 읽는 사람', '통찰과 신념이 있다', '혼자 짊어지고 소진된다', '자기 원칙에 맞는 길이면 오래 버틴다'],
  ESFP: ['지금 이 순간을 즐기는 사람', '밝고 순발력이 있다', '먼 계획과 돈 관리가 느슨하다', '사람·경험 쪽을 고르고 손해는 나중에 따진다'],
  INTJ: ['혼자 설계도를 그리는 사람', '전략적이고 독립적이다', '남의 감정을 늦게 알아챈다', '긴 계획을 세우고 효율 따라 과감히 옮긴다'],
  INTP: ['원리를 파고드는 사람', '분석이 깊고 생각이 자유롭다', '실행과 마감이 늦다', '흥미가 걸린 쪽을 고르고 정해진 길에 덜 묶인다'],
  ENTJ: ['목표를 세우고 이끄는 사람', '결단과 추진력이 강하다', '밀어붙이다 관계를 놓친다', '승진·창업·투자에서 큰 판을 고른다'],
  ENTP: ['판을 바꿔 보고 싶은 사람', '말이 빠르고 아이디어가 많다', '벌여 놓고 정리를 미룬다', '새 사업·이직 같은 모험을 시험해 본다'],
  ESTP: ['몸으로 부딪혀 보는 사람', '행동이 빠르고 현장에 강하다', '위험을 가볍게 본다', '기회가 보이면 바로 움직이고 손익은 뒤에 본다'],
  ENFJ: ['사람을 북돋는 사람', '이끌고 돌보는 힘이 있다', '남의 일을 떠안는다', '가족·공동체에 보탬이 되는 쪽을 고른다'],
};
