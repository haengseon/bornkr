// UI 확인용 가짜 엔진(ARCHITECTURE §6·§13·§19 계약 모양만 흉내). 프로덕션 경로에 넣지 않는다.
// E2E 스크립트가 /src/engine/index.js 요청을 이 파일로 바꿔 준다(상대 import는 두 위치에서 모두 맞게 해석된다).
import { createClock as realClock } from '../../src/engine/clock.js';
import { STATS, ISSUES, COMPARE_AGES } from '../../src/engine/constants.js';

const clamp = v => Math.max(0, Math.min(100, Math.round(v)));
const rngAt = (seed, age, salt = 0) => { let a = (Number(seed) ^ Math.imul(age + 1, 2654435761) ^ salt) >>> 0; return () => ((a = (Math.imul(a, 1664525) + 1013904223) >>> 0) / 2 ** 32); };
const SRC = { org: '통계청', title: '생명표', year: 2024, kind: 'measured' };

export function newLife({ seed } = {}) {
  seed ??= globalThis.__MOCK_SEED ?? Math.floor(Math.random() * 1e9);
  const r = rngAt(seed, -1);
  const deathAge = globalThis.__MOCK_DEATH_AGE ?? 55 + Math.floor(r() * 35);
  return {
    v: 1, seed, name: '김민지', surname: '김', given: '민지', sex: 'F',
    birth: { year: 1987, month: 3, day: 12, region: 'gyeongnam', urban: true, quintile: 2 },
    age: 0, year: 1987, alive: true, death: null,
    stats: Object.fromEntries(STATS.map(s => [s.key, 50])),
    traits: { open: 62, consc: 71, extra: 38, agree: 55, sens: 64 },
    issues: Object.fromEntries(ISSUES.map(i => [i.key, 15])),
    reasons: {}, home: { region: 'gyeongnam', tenure: 'jeonse' },
    log: [{ year: 1987, age: 0, kind: 'birth', id: 'birth', text: '창원의 전세 방 두 칸에서 태어났다.' }],
    choices: [], pending: null, flags: {}, mock: { deathAge, sensDeath: globalThis.__MOCK_SENS_DEATH ?? false },
  };
}

function emit(L, e) { const x = { year: L.year, age: L.age, ...e }; L.log.push(x); return x; }

export function advanceYear(L) {
  if (L.pending) throw new Error('pending choice');
  if (!L.alive) throw new Error('dead');
  L.age++; L.year++;
  const from = L.log.length, r = rngAt(L.seed, L.age);
  for (const s of STATS) {
    const d = Math.round((r() - 0.5) * 8);
    if (!d) continue;
    L.stats[s.key] = clamp(L.stats[s.key] + d);
    (L.reasons[s.key] ||= []).push({ year: L.year, age: L.age, text: '해마다 조금씩 바뀌는 몫', delta: d });
  }
  for (const i of ISSUES) L.issues[i.key] = clamp(L.issues[i.key] + (r() - 0.4) * 4);
  emit(L, { kind: 'system', id: 'sys.mock', text: `${L.age}살이 된 해. 집 근처 골목이 조금 바뀌었다.`, effects: { stats: { happiness: 2 }, issues: { housing: 3 } }, src: ['R02.S2'] });
  if (r() < 0.35) emit(L, { kind: 'news', id: 'era.mock', text: '기준금리가 한 해 동안 여러 차례 올랐다. 전세 대출 이자가 같이 올랐다.', effects: { issues: { housing: 4, living: 3 } } });
  if (r() < 0.2) emit(L, { kind: 'event', id: 'ev.quiet', text: '조용히 지나간 일', quiet: true });
  if (L.age === 15) emit(L, { kind: 'event', id: 'school.bully', text: '친구가 반에서 따돌림을 겪었다.', sensitive: 'violence', help: [HELP[4], HELP[2]] });
  const ask = L.age === 5 || (L.age % 5 === 0 && L.age < 80) || L.age === 16;
  if (ask) {
    const sens = L.age === 16 ? 'violence' : null;
    emit(L, { kind: 'event', id: 'ev.c' + L.age, text: sens ? '몇 달째 반에서 따돌림을 겪고 있다.' : '전세 만기가 다가왔다. 집주인이 보증금을 올리겠다고 했다.', asked: true });
    L.pending = {
      eventId: 'ev.c' + L.age, prompt: sens ? '누구에게 말할까?' : '어떻게 할까?', year: L.year, age: L.age,
      options: [{ id: 'a', label: '대출로 올려 준다', hint: '재산 줄고 주거 압박 늘어남' }, { id: 'b', label: '싼 곳으로 이사', hint: '여유 줄고 출퇴근 길어짐' }, { id: 'c', label: '부모님 집에 들어간다', hint: '돈은 남고 관계가 흔들림' }],
      defaultId: 'b', timeoutMs: sens ? 20000 : 12000, ...(sens && { sensitive: sens, help: [HELP[4], HELP[2]] }),
    };
    return { entries: L.log.slice(from), choice: L.pending, compare: null, died: false };
  }
  return rest(L, from);
}

function rest(L, from) {
  let compare = null;
  if (COMPARE_AGES.includes(L.age)) { compare = compareCard(L, L.age); emit(L, { kind: 'compare', id: 'cmp', text: '비교' }); }
  if (L.age >= L.mock.deathAge) {
    const sens = L.mock.sensDeath;
    L.alive = false;
    L.death = { age: L.age, year: L.year, cause: sens ? 'suicide' : 'pneumonia', causeLabel: sens ? '고의적 자해' : '폐렴', sensitive: sens };
    emit(L, { kind: 'death', id: 'death', text: `${L.name}은 ${L.year}년, ${L.age}세에 세상을 떠났다.`, ...(sens && { sensitive: 'death', help: [HELP[0], HELP[1]] }) });
  }
  return { entries: L.log.slice(from), choice: null, compare, died: !L.alive };
}

export function choose(L, id, { auto = false } = {}) {
  const req = L.pending;
  if (!req) throw new Error('no pending');
  L.pending = null;
  L.choices.push({ year: L.year, age: L.age, eventId: req.eventId, option: id, auto });
  const from = L.log.length;
  emit(L, { kind: 'choice', id: req.eventId, option: id, auto, text: { a: '대출 이자가 월급날을 먼저 찾아왔다.', b: '짐을 싸는 데 주말 두 번이 들었다.', c: '방은 넓어졌고 말수는 줄었다.' }[id], effects: { stats: { wealth: -3 }, issues: { housing: 4 } } });
  return rest(L, from);
}

export function runToEnd(L) {
  while (L.alive) { advanceYear(L); if (L.pending) choose(L, L.pending.defaultId, { auto: true }); }
  return L;
}
export function replay(seed, choices = []) {
  const L = newLife({ seed });
  let i = 0;
  while (L.alive) { advanceYear(L); if (L.pending) { const c = choices[i++]; choose(L, c?.option ?? L.pending.defaultId, { auto: !!c?.auto }); } }
  return L;
}
export const expectedRemainingYears = L => Math.max(1, 84 - L.age);
export const createClock = (opts = {}) => realClock({ ...opts, remainingYears: expectedRemainingYears });

const PEERS = [
  { name: '박준호', sex: 'M', region: 'seoul', order: 212, birthLine: '아파트 자가, 맞벌이 가정', deathAge: 81, line: '연구소에서 정년까지 일했다.' },
  { name: '이수진', sex: 'F', region: 'jeonnam', order: 903, birthLine: '농가, 조부모와 함께', deathAge: 88, line: '고향을 떠나지 않았다.' },
  { name: '최동현', sex: 'M', region: 'gyeonggi', order: 1311, birthLine: '월세, 한부모 가정', deathAge: 63, line: '마지막 10년은 혼자 살았다.' },
];
export const peers = () => PEERS.map(p => ({ ...p }));
export const compareCard = (L, age) => ({
  age, me: { line: '서울 월세 2년 계약. 1년짜리 일.', order: 700 }, stat: '20대 임금근로자 비정규 비율 38%',
  peers: PEERS.map(p => ({ name: p.name, sex: p.sex, region: p.region, order: p.order, alive: age < p.deathAge, line: age < p.deathAge ? '고향 군청에서 일한다. 부모님과 산다.' : `${p.name}은 ${1987 + p.deathAge}년에 세상을 떠났다.` })),
});
export function explain(L, key) {
  const st = STATS.find(s => s.key === key), is = ISSUES.find(i => i.key === key);
  const value = st ? L.stats[key] : L.issues[key];
  return { key, label: (st || is).label, value, lines: [`지금 ${value}.`, '최근 사유: 전세 대출 −3 · 결혼 비용 −2'], src: [SRC, { org: 'GDD', title: '원리금 부담 → 재산 환산 계수', kind: 'estimated' }] };
}
export function birthCert(L) {
  return {
    name: L.name, sex: L.sex, date: '1987.03.12', regionLabel: '경상남도 · 도시', urban: true, quintile: 2, quintileLabel: '빠듯한 집',
    parentsLine: '아버지 고졸·생산직, 어머니 고졸·시간제', homeLine: '전세', careLine: '낮에는 할머니 손에서', accessLine: '동네 소아과가 있다',
    eraLine: '1987년에 태어난 아이 623,831명 중 한 명', hook: '이 아이는 무엇을 감당하게 될까요?', order: 700,
    story: '1987년 3월, 경상남도 창원시의 전세 방 두 칸에서 여자아이가 태어났습니다. 아버지는 공장에, 어머니는 시간제로 일합니다.',
  };
}
export function summarize(L) {
  const d = L.death || { age: L.age, year: L.year };
  const tl = [{ age: 0, year: 1987, text: '창원의 전세 방 두 칸에서 태어났다.', kind: 'birth' }];
  for (const c of L.choices.slice(0, 9)) tl.push({ age: c.age, year: c.year, text: '전세 보증금이 올랐다. 대출로 메웠다.', kind: 'choice', choice: { label: '대출로 올려 준다', auto: c.auto }, reason: '주거 사다리 압박 +9' });
  tl.push({ age: 15, year: 2002, text: '학교에서 힘든 일이 있었다.', kind: 'event', sensitive: true });
  tl.sort((a, b) => a.age - b.age);
  tl.push({ age: d.age, year: d.year, text: `${d.age}세, ${d.year}년`, kind: 'death' });
  const auto = L.choices.filter(c => c.auto).length;
  return {
    birthCert: birthCert(L),
    verdict: { main: '노력은 했습니다. 그러나 전세 만료일도 노력했습니다.', lines: [`주거 사다리 압박 ${L.issues.housing} — 이사 7회(최근 8년 4회)`, `선택 ${L.choices.length}번 중 ${auto}번은 기본 행동으로 넘어갔습니다.`] },
    timeline: tl,
    closing: {
      econ: { value: 31, label: '경제 안정', line: '성인기 40년 중 적자였던 해 9년', src: ['R02.S2'] },
      health: { value: 48, label: '건강·회복', line: '진단 2번, 그중 1번은 회복했다', src: [SRC] },
      relations: { value: 66, label: '관계', line: '함께 산 가족 3명 · 혼자 산 기간 6년', src: [] },
      autonomy: { value: 29, label: '자율성', line: '원치 않은 이사 4번, 계약 만료 3번', src: [] },
      careBurden: { value: 71, label: '돌봄 부담', line: '부모 간병 7년 · 아이 키운 해 12년', src: [] },
    },
    issues: ISSUES.map(i => ({ key: i.key, label: i.label, value: L.issues[i.key], lines: ['지난 8년간 이사 4회, 소득 대비 주거비 31%'], src: [SRC] })),
    death: { age: d.age, year: d.year, causeLabel: d.causeLabel, sensitive: !!d.sensitive },
    peers: PEERS.map(p => ({ name: p.name, sex: p.sex, regionLabel: { seoul: '서울', jeonnam: '전남', gyeonggi: '경기' }[p.region], deathAge: p.deathAge, line: p.line, order: p.order })),
    sources: [SRC, { org: '국토교통부', title: '주거실태조사', year: 2024, kind: 'measured' }, { org: '통계청', title: '장래인구추계', year: 2023, kind: 'projected' }, { org: 'GDD', title: '돌봄 시간 → 여유 환산', kind: 'estimated' }],
  };
}

const HELP = [
  { id: '109', name: '자살예방상담전화', number: '109', hours: '24시간', topics: ['selfharm', 'death'] },
  { id: '1577-0199', name: '정신건강위기상담', number: '1577-0199', hours: '24시간', topics: ['selfharm', 'death', 'illness'] },
  { id: '1388', name: '청소년상담전화', number: '1388', hours: '24시간', desc: '문자 #1388', topics: ['violence', 'abuse'] },
  { id: '1366', name: '여성긴급전화', number: '1366', hours: '24시간', desc: '가정폭력·성폭력', topics: ['sexual'] },
  { id: '117', name: '학교폭력 신고', number: '117', hours: '24시간', topics: ['violence'] },
];
export { HELP as MOCK_HELP };
