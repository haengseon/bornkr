// 결산(ARCHITECTURE §13, GDD §12). 승패·서열·백분위·금액·직급·사인 없음(사인은 death 상세 필드만).
import { placeLine, placeLabel } from './sigungu.js';
import { sidoAt } from '../data/admin-names.js';
import { STAGES, ISSUES, ISSUE_KEYS, STAT_KEYS } from './constants.js';
import { T, yr } from './tables.js';
import { epilogueOf } from './epilogue.js';
import { deathStory } from './deathstory.js';
import { text, fill, josa } from './text.js';
import { closing, explain } from './explain.js';
import { peers } from './peers.js';
import { stageOf } from './clock.js';
import { QLABEL, ORDER_L, birthLine } from './compare.js';

const EDU_L = { mid: '중졸', high: '고졸', '2yr': '전문대졸', '4yr': '대졸' };
const JOB_L = { 1: '관리 일', 2: '전문 일', 3: '사무 일', 4: '서비스 일', 5: '판매 일', 6: '농사일', 7: '기술 일', 8: '공장 일', 9: '몸 쓰는 일', A: '군 복무' };
const TENURE_L = { own: '자가', jeonse: '전세', monthly: '보증금 있는 월세', public: '공공임대', family: '조부모 집에서 함께' };
const CARE_L = { parent: '낮에도 부모 곁에서', grandparent: '낮에는 할머니 손에서', daycare: '낮에는 어린이집에서' };
const ISSUE_LABEL = Object.fromEntries(ISSUES.map(i => [i.key, i.label]));
const comma = n => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
const mean = a => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);

// 출생 신고서(GDD §12.4, ARCHITECTURE §19). 0세에서도 동작.
export function birthCert(L) {
  const b = L.birth, p = b.parents;
  const father = p.singleParent ? null : `아버지 ${EDU_L[p.fatherEdu]}·${p.fatherJob ? JOB_L[p.fatherJob] : '일을 찾는 중'}`;
  const mother = `어머니 ${EDU_L[p.motherEdu]}·${p.motherJob ? JOB_L[p.motherJob] : '집안일'}`;
  const forms = [p.singleParent && '한부모 가정', p.multicultural && '다문화 가정'].filter(Boolean);
  const homeLine = [TENURE_L[b.tenure], ...forms].join(', ');
  const bt = T('BIRTHS_BY_YEAR'), n = yr(bt, b.year), est = b.year < 1970 || b.year > 2025;
  const eraLine = bt[b.year] != null && !est ? `${b.year}년에 태어난 아이 ${comma(n)}명 중 한 명`
    : `${b.year}년에 태어난 아이 약 ${Math.round(n / 1e4)}만 명 중 한 명${est ? '(추정)' : ''}`;
  const accessLine = b.healthAccess < 35 ? '가까운 소아과까지 차로 40분' : b.healthAccess <= 65 ? '동네 소아과가 있다' : '큰 병원이 가깝다';
  const orderLabel = b.siblings === 0 ? '외동' : ORDER_L[b.order - 1] ?? '막내';
  const qLabel = QLABEL[b.quintile - 1];
  const story = [
    fill('{name|은} {year}년 {month}월, {region}에서 {ord|으로} 태어났다.', { name: L.name, year: b.year, month: b.month, region: b.sigungu ? placeLabel(b.region, b.sigungu, b.dong, b.year) : b.urban ? sidoAt(b.region, b.year) : `${sidoAt(b.region, b.year)}의 농촌 마을`, ord: orderLabel }),
    `집은 ${homeLine}, 형편은 ${qLabel}이었다.`,
    `${CARE_L[b.care]} 자랐다.`,
  ];
  return {
    name: L.name, sex: L.sex === 'M' ? '남' : '여',
    date: `${b.year}.${String(b.month).padStart(2, '0')}.${String(b.day).padStart(2, '0')}`,
    regionLabel: `${b.sigungu ? placeLine(b.region, b.sigungu, b.dong, b.year) : sidoAt(b.region, b.year)} · ${b.urban ? '도시' : '농촌'}`, urban: b.urban,
    quintileLabel: qLabel, parentsLine: [father, mother].filter(Boolean).join(', '), homeLine,
    careLine: CARE_L[b.care], accessLine, eraLine, story, hook: text('end.hook'), birthLine: birthLine(L),
    quintile: b.quintile,               // 화면 내부 로직용 — 표시 금지
  };
}

// 성인기(19~) 이슈 평균 + 사건 가산(GDD §12.2)
function pressures(L) {
  const end = L.death?.age ?? L.age, t = L.tally, out = {};
  ISSUE_KEYS.forEach((k, i) => {
    const v = [];
    for (let a = 19; a <= end; a++) if (L.hist[a]) v.push(L.hist[a].i[i]);
    out[k] = mean(v);
  });
  if ((t.moves || 0) >= 6) out.housing += 10;
  if (L.flags.fraud) out.housing += 15;
  if ((t.jobLosses || 0) >= 2) out.job += 10;
  if ((t.careYears || 0) >= 5) out.care += 10;
  if (L.health.dx.cancer || L.aging.ltc) out.medical += 10;
  return out;
}

// 판정문 수치(생애 누적 압력)와 결산 관심사 수치(말년 가중)는 산식이 다르다(QA #8). 화면 수치는 같은 이름의 결산 값(issues[].value)을 쓰고, 선택에 쓴 누적 압력은 pressure로 따로 둔다.
export const BASIS = {
  lifetime: '성인기(19세~) 평균 + 사건 가산 — 생애 누적 압력',
  'late-weighted': '성인기 평균 70% + 최근 10년 평균 30% — 말년에 가중한 관심도',
};
// 판정문 본문은 회고문(epilogue.js)이 맡는다. 여기서는 계열과 내부 수치(pressure/shown — 테스트·QA용, 화면 비노출)만 낸다.
function verdict(L, iss) {
  const age = L.death?.age ?? L.age;
  const pr = pressures(L);
  const [top, topV] = Object.entries(pr).sort((a, b2) => b2[1] - a[1])[0];
  const family = L.death?.sensitive ? 'neutral' : age < 19 ? 'young' : age < 40 ? 'early' : topV < 45 ? 'quiet' : top;
  if (family === 'young' || family === 'neutral') return { family };
  const shown = iss.find(i => i.key === top)?.value ?? Math.round(topV);       // 아래 결산의 같은 이름 항목과 같은 수치
  return { family, pressure: { key: top, value: Math.round(topV), basis: 'lifetime' }, shown: { key: top, value: shown, basis: 'late-weighted' } };
}

// 생애 연표(GDD §12.3)
const BASE = { birth: 100, death: 100, choice: 20, system: 10, event: 8, news: 6, compare: 0 };
const MILE = {
  'sys.fam.wedding': 40, 'sys.fam.child_born': 40, 'sys.job.first': 30, 'sys.home.bought': 30, 'sys.edu.graduate': 25,
  'sys.fam.parent_death': 30, 'sys.fam.parent_care': 30, 'sys.age.spouse_care': 30, 'sys.fam.divorced': 30, 'sys.job.lose': 25,
  'sys.job.exit_main': 25, 'sys.health.dx_cancer': 25, 'sys.health.dx_cardio': 25, 'sys.health.dx_dementia': 25,
  'sys.home.jeonse_fraud': 30, 'sys.money.independent': 20, 'sys.mil.enlist': 15,
};
// 민감 항목은 범주별 중립 문구로, 범주마다 연표에 한 줄만(QA-S-13)
const NEUTRAL = { illness: '치료가 길어진 해였다.', death: '가까운 사람을 떠나보냈다.', disaster: '큰 재난을 지나 보냈다.' };
const neutral = k => NEUTRAL[k] ?? '힘든 일을 겪었다.';
const sensGroup = k => (k in NEUTRAL ? k : 'hard');
// 결산에는 금액을 쓰지 않는다: 금액이 든 문장은 빼고, 남는 게 없으면 연표 후보에서 제외
const noMoney = t => (t || '').split(/(?<=[.다])\s+/).filter(x => !/\d.*만 원/.test(x)).join(' ').trim();
function timeline(L) {
  const end = L.death?.age ?? L.age, short = end < 30;
  const [lo, hi] = short ? [6, 10] : [10, 16];
  const fxSum = (fx, k, w) => Object.values(fx?.[k] || {}).reduce((s, v) => s + Math.abs(v) * w, 0);
  const cands = L.log.filter(e => e.kind !== 'compare' && !(e.kind === 'system' && e.quiet && !MILE[e.id]) && (e.kind === 'death' || e.sensitive || noMoney(e.text))).map(e => ({
    e, stage: stageOf(e.age).id, group: e.id.split('.').slice(0, 2).join('.'),
    score: BASE[e.kind] + fxSum(e.effects, 'stats', 2) + fxSum(e.effects, 'issues', 0.5) + (MILE[e.id] || 0) + (e.kind === 'choice' && !e.auto ? 10 : 0),
  }));
  const chosen = [], perStage = {};
  const take = c => { chosen.push(c); perStage[c.stage] = (perStage[c.stage] || 0) + 1; c.used = true; };
  const eff = c => c.score - (chosen.some(x => x.group === c.group && Math.abs(x.e.age - c.e.age) <= 3) ? 20 : 0)
    - (c.e.sensitive && c.e.kind !== 'death' && chosen.some(x => x.e.sensitive && x.e.kind !== 'death' && sensGroup(x.e.sensitive) === sensGroup(c.e.sensitive)) ? 1000 : 0);
  for (const c of cands) if (c.e.kind === 'birth' || c.e.kind === 'death') take(c);
  for (const st of STAGES) {                       // 살았던 구간마다 ≥1
    if (st.from > end) continue;
    const best = cands.filter(c => !c.used && c.stage === st.id).sort((a, b) => eff(b) - eff(a))[0];
    if (best && !perStage[st.id]) take(best);
  }
  while (chosen.length < hi) {
    const pool = cands.filter(c => !c.used && (perStage[c.stage] || 0) < 4);
    if (!pool.length) break;
    const best = pool.reduce((a, b) => (eff(b) > eff(a) ? b : a));
    if (chosen.length >= lo && eff(best) < 15) break;
    take(best);
  }
  return chosen.sort((a, b) => a.e.age - b.e.age || L.log.indexOf(a.e) - L.log.indexOf(b.e)).map(({ e }) => ({
    age: e.age, year: e.year, kind: e.kind,
    text: e.kind === 'death' ? (e.horizon ? '관찰 종료.' : '세상을 떠났다.') : e.sensitive ? neutral(e.sensitive) : noMoney(e.text),   // 사망 줄: 나이·연도는 열이 따로 있다(QA-E-16)
    ...(e.sensitive && e.kind !== 'death' && { sensitive: e.sensitive }),
    ...(e.reason && { reason: e.reason }),
    ...(e.kind === 'choice' && { choice: { label: e.label, auto: !!e.auto } }),
  }));
}

function issueList(L) {
  const end = L.death?.age ?? L.age;
  return ISSUE_KEYS.map((k, i) => {
    const adult = [], last = [];
    for (let a = 0; a <= end; a++) {
      const h = L.hist[a];
      if (!h) continue;
      if (a >= 19 || end < 19) adult.push(h.i[i]);
      if (a > end - 10) last.push(h.i[i]);
    }
    const ex = explain(L, k);
    return { key: k, label: ISSUE_LABEL[k], value: Math.round(0.7 * mean(adult) + 0.3 * mean(last)), basis: 'late-weighted', lines: ex.lines.slice(1, 3), src: ex.src, ...(ex.srcNotes && { srcNotes: ex.srcNotes }) };
  }).sort((a, b) => b.value - a.value);
}

// 판정문 사망 블록: 인과 체인(deathstory.js) 끝에 사망 문장을 붙인다. 자해 사망은 체인·사인 없음.
function deathSteps(ds) {
  if (!ds) return null;
  return { ...ds, steps: ds.sensitive || !ds.causeLabel ? [] : [...ds.chain, `${ds.year}년 ${ds.causeLabel}${josa(ds.causeLabel.replace(/\([^)]*\)$/, ''), '으로')} 세상을 떠났다`] };
}

export function summarize(L, opts = {}) {
  const d = L.death;
  const cl = closing(L);
  const iss = issueList(L);
  const statSrc = STAT_KEYS.flatMap(k => explain(L, k).src);
  const all = [...statSrc, ...iss.flatMap(i => i.src), ...Object.values(cl).flatMap(c => c.src)];
  const seen = new Set();
  const v = verdict(L, iss);
  const ep = epilogueOf(L, opts);
  return {
    birthCert: birthCert(L),
    verdict: { main: ep.coda, title: ep.title, lines: [], family: v.family, ...(v.pressure && { pressure: v.pressure, shown: v.shown }) },   // main = 한 줄 총평(기록관·공유 카드 하위호환)
    epilogue: ep,
    deathStory: deathSteps(deathStory(L)),
    timeline: timeline(L),
    closing: cl,
    issues: iss,
    basisNotes: BASIS,
    death: d ? { age: d.age, year: d.year, causeLabel: opts.hideSensitiveCause && d.sensitive ? null : d.causeLabel, sensitive: !!d.sensitive, ...(d.horizon && { horizon: true }) } : null,
    peers: opts.peers === false ? [] : peers(L).map(P => ({
      name: P.name, sex: P.sex, regionLabel: P.regionLabel, deathAge: P.deathAge, ...(P.horizon && { horizon: true }), order: P.order, birthLine: P.birthLine,
      line: P.deathAge != null && P.deathAge < 19
        ? text(P.deathAge < 5 ? 'cmp.dead.young' : 'cmp.dead', { name: P.name, year: P.deathYear })
        : [70, 55, 42, 29, 19].map(a => P.lines[a]).find(Boolean) ?? '',   // 가장 늦은 나이의 한 줄(≤40자, QA-S-34)
    })),
    sources: all.filter(s => !seen.has(s.id) && seen.add(s.id)),
    ...(L.flags.capped != null && { capNotice: text('end.cap') }),
  };
}
