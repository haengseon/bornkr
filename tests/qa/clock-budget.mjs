// QA-S 시간 예산(GDD §2·§15.1): UI 연 진행 루프(src/ui/play.js)를 가짜 now로 이산 사건 시뮬레이션.
// 실행: node tests/qa/clock-budget.mjs [생애 수=1000]
//  - 방치(모든 선택 타임아웃) 1×/2×/4×, 능동(선택 8s·카드 3s) 1×, 자동결정 모드 1×/4×
//  - 모델: waitYear 틱 100ms·선택 카운트다운 틱 250ms·선택 후 결과 1.5s·비교 카드 8s(자동 4s)·사망 전환 1.2s·15분 상한 finishCap
import fs from 'node:fs';
import { isMainThread, pool, serve, range, table } from './lib/pool.mjs';
import * as E from '../../src/engine/index.js';
import { HARD_CAP_MS, STAGES, MIN_YEAR_MS, BASE_YEAR_MS, COMPARE_AGES } from '../../src/engine/constants.js';
import { STAGE_CAP } from '../../src/engine/tuning.js';
import { stageOf } from '../../src/engine/clock.js';

const TICK = 100, RING = 250;
const POLICIES = {
  'idle1': { speed: 1, mode: 'idle', birthCard: 15000 },
  'idle2': { speed: 2, mode: 'idle', birthCard: 15000 },
  'idle4': { speed: 4, mode: 'idle', birthCard: 15000 },
  'active1': { speed: 1, mode: 'active', birthCard: 5000, pickMs: 8000, cardMs: 3000 },
  'auto1': { speed: 1, mode: 'auto', birthCard: 15000 },
  'auto4': { speed: 4, mode: 'auto', birthCard: 15000 },
  // 수정안 시제품(QA 제안): yearDelay가 구간 안에 남은 선택·카드 시간을 미리 떼어 둔다(src는 수정하지 않고 아래 fixedClock으로 검증)
  'idle1-fix': { speed: 1, mode: 'idle', birthCard: 15000, fix: true },
  'idle1-fix-cap': { speed: 1, mode: 'idle', birthCard: 15000, fix: true, capNoSleep: true },
};
const HOME_TO_BIRTH = 3000 + 3000;     // 홈 → '태어나기' ≤3s + 출생 연출 3s (GDD §2.3)

// 수정안 시제품: src/engine/clock.js와 같되, 연 대기 계산에서 '구간 안에 앞으로 일어날 선택·비교 카드 시간'을 예산에서 먼저 뺀다.
const EXP_CHOICES = { early: 1.0, school: 4.0, youth: 6.1, mid: 5.6, late: 3.9 };   // 측정값(통계 MC)
function fixedClock({ now, remainingYears }) {
  const base = E.createClock({ now, remainingYears });
  let stageId = null, stageStart = 0, stageTotal = 1;
  const SOFT = 13 * 60_000;
  return {
    ...base,
    yearDelay(L, speed = 1) {
      const el = base.elapsed();
      if (el >= SOFT) return MIN_YEAR_MS / speed;
      const st = stageOf(L.age + 1);
      if (st.id !== stageId) { stageId = st.id; stageStart = el; stageTotal = st.id === 'late' ? Math.max(1, Math.round(remainingYears(L))) : st.to - st.from + 1; }
      const total = stageTotal;
      const left = st.id === 'late' ? Math.max(1, Math.round(remainingYears(L))) : Math.max(1, st.to - L.age);
      const cards = COMPARE_AGES.filter(a => a > L.age && a <= (st.id === 'late' ? L.age + left : st.to)).length;
      const reserve = EXP_CHOICES[st.id] * 13500 * Math.min(1, left / total) + cards * 8000;
      const per = (st.budgetMs - (el - stageStart) - reserve) / left;
      return Math.min(BASE_YEAR_MS * 1.5, Math.max(MIN_YEAR_MS, per)) / speed;
    },
  };
}

function simulate(seed, pol) {
  let now = 0;
  const mk = pol.fix ? fixedClock : E.createClock;
  const clock = mk({ now: () => now, remainingYears: E.expectedRemainingYears });
  const L = E.newLife({ seed });
  clock.start();
  const out = { seed, cap: false, firstChoiceAt: null, firstChoiceAge: null, nChoice: 0, nCard: 0, choiceMs: 0, cardMs: 0, deathAge: null, capAge: null, stageMs: {}, wallMs: 0 };
  const t0 = Date.now();
  const capped = () => clock.overCap();
  const waitYear = () => {
    let left = clock.yearDelay(L, 1);
    for (;;) { now += TICK; if (capped()) return false; left -= TICK * pol.speed; if (left <= 0) return true; }
  };
  const showCard = () => {
    out.nCard++;
    const D = pol.mode === 'auto' ? 4000 : pol.mode === 'active' ? pol.cardMs : 8000;
    let left = D; const s = now;
    for (;;) { now += RING; if (capped()) break; left -= RING; if (left <= 0) break; }
    out.cardMs += now - s;
  };
  const runChoice = req => {
    out.nChoice++;
    if (out.firstChoiceAt == null) { out.firstChoiceAt = now; out.firstChoiceAge = L.age; }
    clock.choiceStart();
    const T0 = pol.mode === 'auto' && !req.sensitive ? 1200 : req.timeoutMs || 12000;
    const want = pol.mode === 'active' ? Math.min(pol.pickMs, T0 - RING) : T0;
    let left = T0, waited = 0, now0 = now, instant = false;
    for (;;) {
      now += RING;
      if (capped()) { instant = true; break; }
      left -= RING; waited += RING;
      if (left <= 0 || waited >= want) break;
    }
    const r2 = E.choose(L, req.defaultId, { auto: pol.mode !== 'active' || waited >= T0 });
    if (!instant) now += 1500;
    clock.choiceEnd();
    out.choiceMs += now - now0;
    return r2;
  };
  const handle = r => {
    if (!r) return;
    if (r.compare && !r.died && L.alive && !capped()) showCard();
    if (r.choice) { const r2 = runChoice(r.choice); handle(r2); }
  };
  const finishCap = () => {
    out.cap = true; out.capAge = L.age;
    if (L.pending) E.choose(L, L.pending.defaultId, { auto: true });
    if (L.alive) E.runToEnd(L, 'cap');
    now += pol.capNoSleep ? 0 : 1200;
  };
  const stageAt = {};
  while (L.alive) {
    if (!waitYear()) { finishCap(); break; }
    const sid = stageOf(L.age + 1).id, t = now;
    handle(E.advanceYear(L));
    stageAt[sid] = (stageAt[sid] || 0) + (now - t);
    if (!L.alive) { now += 1200; break; }
    if (capped()) { finishCap(); break; }
  }
  out.endMs = now;
  out.deathAge = L.death?.age ?? L.age;
  out.stageMs = stageAt;
  out.firstAtHome = out.firstChoiceAt == null ? null : HOME_TO_BIRTH + pol.birthCard + out.firstChoiceAt;
  // 선택 수: 엔진이 상한으로 받은 선택(자동 적용 제외)을 구간별로
  const mine = L.choices.filter(c => !c.forced);
  const per = {};
  for (const c of mine) { const st = stageOf(c.age).id, k = c.eventId.startsWith('sys.') ? 'sys' : 'chance'; (per[st] ||= { sys: 0, chance: 0 })[k]++; }
  out.perStage = per;
  out.capNotice = L.flags.capped != null && E.summarize(L, { peers: false }).capNotice ? 1 : 0;
  out.wallMs = Date.now() - t0;
  return out;
}

function work({ pol, from, to, seed0 }) {
  const res = [];
  for (let i = from; i < to; i++) res.push(simulate(seed0 + i, POLICIES[pol]));
  return res;
}

if (!isMainThread) serve(work);

const q = (a, p) => { const s = [...a].sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(p * s.length))]; };
const mmss = ms => `${Math.floor(ms / 60000)}:${String(Math.round(ms / 1000) % 60).padStart(2, '0')}`;

async function main() {
  const N = Number(process.argv[2] || 1000);
  const jobs = [];
  const ONLY = process.argv[3] ? process.argv[3].split(',') : Object.keys(POLICIES);   // 예: node clock-budget.mjs 1000 idle1,idle1-fix
  for (const pol of ONLY) for (const [from, to] of range(N, 50)) jobs.push({ pol, from, to, seed0: 7_000_000 });
  const parts = await pool(import.meta.url, jobs);
  const by = {};
  jobs.forEach((j, i) => (by[j.pol] ||= []).push(...parts[i]));
  fs.mkdirSync(new URL('./out/', import.meta.url), { recursive: true });
  if (!process.argv[3]) fs.writeFileSync(new URL('./out/clock.json', import.meta.url), JSON.stringify(by));
  const rows = [];
  for (const [pol, a] of Object.entries(by)) {
    const end = a.map(x => x.endMs), fc = a.map(x => x.firstAtHome).filter(x => x != null);
    const capN = a.filter(x => x.cap).length;
    const over = a.filter(x => x.endMs > HARD_CAP_MS).length;
    rows.push([pol, mmss(end.reduce((s, x) => s + x, 0) / a.length), mmss(q(end, 0.5)), mmss(q(end, 0.99)), mmss(Math.max(...end)), `${capN} (${(capN / a.length * 100).toFixed(1)}%)`, over,
      `${(fc.reduce((s, x) => s + x, 0) / fc.length / 1000).toFixed(0)}s`, `${(q(fc, 0.95) / 1000).toFixed(0)}s`, `${(Math.max(...fc) / 1000).toFixed(0)}s`, a.length - fc.length,
      (a.reduce((s, x) => s + x.nChoice, 0) / a.length).toFixed(1)]);
  }
  console.log(table(rows, ['정책', '결산 진입 평균', 'p50', 'p99', '최대', '15분 상한 발동', '>15:00', '첫 선택(홈 기준) 평균', 'p95', '최대', '첫 선택 없음', '선택 노출/생애']));
  // 구간별 선택 수 vs stageCap
  const cap = [];
  for (const st of ['early', 'school', 'youth', 'mid', 'late']) {
    const all = by.idle1 || Object.values(by)[0];
    const sysN = all.map(x => x.perStage[st]?.sys || 0), chN = all.map(x => x.perStage[st]?.chance || 0);
    cap.push([st, `${(sysN.reduce((s, x) => s + x, 0) / all.length).toFixed(2)} (최대 ${Math.max(...sysN)})`, STAGE_CAP[st].sys, `${(chN.reduce((s, x) => s + x, 0) / all.length).toFixed(2)} (최대 ${Math.max(...chN)})`, STAGE_CAP[st].chance,
      sysN.some(x => x > STAGE_CAP[st].sys) || chN.some(x => x > STAGE_CAP[st].chance) ? '불' : '합']);
  }
  console.log('\n' + table(cap, ['구간', '시스템 선택 평균', '상한', '우연 선택 평균', '상한', '상한 위반']));
  // 구간별 소요(방치 1×)
  const sm = ['early', 'school', 'youth', 'mid', 'late'].map(st => { const v = (by.idle1 || Object.values(by)[0]).map(x => x.stageMs[st] || 0); return [st, mmss(v.reduce((s, x) => s + x, 0) / v.length), mmss(q(v, 0.99)), mmss(Math.max(...v))]; });
  console.log('\n' + table(sm, ['구간(방치 1×)', '평균', 'p99', '최대']));
  const slow = (by.idle1 || Object.values(by)[0]).sort((a, b) => b.endMs - a.endMs).slice(0, 5).map(x => `seed ${x.seed}: ${mmss(x.endMs)} (사망 ${x.deathAge}세, 선택 ${x.nChoice}, 카드 ${x.nCard})`);
  console.log('\n방치 1× 최장 5생애:\n' + slow.join('\n'));
  const fcs = (by.idle1 || Object.values(by)[0]).filter(x => x.firstAtHome != null).map(x => x.firstAtHome / 1000).sort((a, b) => a - b);
  console.log(`\n방치 1× 첫 선택(홈 기준) 분포: min ${fcs[0].toFixed(0)}s p50 ${fcs[Math.floor(fcs.length / 2)].toFixed(0)}s p95 ${fcs[Math.floor(fcs.length * 0.95)].toFixed(0)}s max ${fcs[fcs.length - 1].toFixed(0)}s; 첫 선택 나이 분포:`, JSON.stringify((by.idle1 || Object.values(by)[0]).reduce((m, x) => (x.firstChoiceAge != null && (m[x.firstChoiceAge] = (m[x.firstChoiceAge] || 0) + 1), m), {})));
}

if (isMainThread) await main();
