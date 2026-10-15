// QA-S 보조 탐침: 연표 중립 문구 반복·첫 취업 나이·이사 횟수·직업 희소도·재혼·결산 분포·말년 부채. 실행: node tests/qa/misc-probes.mjs [생애 수=1500]
import * as E from '../../src/engine/index.js';
import { econ } from '../../src/engine/stats.js';

const N = Number(process.argv[2] || 1500), S0 = 31_000_000;
const mean = a => a.reduce((s, x) => s + x, 0) / Math.max(1, a.length);
const q = (a, p) => { const s = [...a].sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(p * s.length))]; };
const pct = (x, n) => `${(x / n * 100).toFixed(1)}%`;

const R = { neutral: [], tlLen: [], firstJobAge: [], noJob: 0, moves: [], movesPerAdultYear: [], invMoves: [], remarry: [], remarryAges: [], firstMarryOld: 0, econ: [], rel: [], aut: [], care: [], hea: [], careZero: 0, jobTitles: {}, firstTitles: {}, jobsPerLife: [], debt80: [], childAges: [], seeking: [], emp80: 0, n80: 0, facilityAtDeath: 0, n65death: 0, houseMoves: [], jobAt65: 0, reempOld: 0, nChildren: [], blankClosing: 0 };
let adults = 0;
for (let i = 0; i < N; i++) {
  const L = E.runToEnd(E.newLife({ seed: S0 + i }));
  const S = E.summarize(L, { peers: false });
  const nt = S.timeline.filter(t => t.text === '힘든 일을 겪었다.').length;
  R.neutral.push(nt); R.tlLen.push(S.timeline.length);
  const h0 = L.job.history[0];
  if (L.death.age >= 25) { adults++; if (h0) R.firstJobAge.push(h0.from - L.birth.year); else R.noJob++; }
  R.moves.push(L.home.moves.length);
  if (L.death.age >= 19) { R.movesPerAdultYear.push(L.home.moves.length / (L.death.age - 18)); R.invMoves.push(L.tally.invMoves || 0); }
  for (const j of L.job.history) { R.jobTitles[j.title] = (R.jobTitles[j.title] || 0) + 1; }
  if (h0) R.firstTitles[h0.title] = (R.firstTitles[h0.title] || 0) + 1;
  R.jobsPerLife.push(L.job.history.length);
  const rem = L.log.filter(e => e.id === 'sys.fam.remarry');
  R.remarry.push(rem.length); for (const e of rem) R.remarryAges.push(e.age);
  R.econ.push(S.closing.econ.value); R.rel.push(S.closing.relations.value); R.aut.push(S.closing.autonomy.value); R.care.push(S.closing.careBurden.value); R.hea.push(S.closing.health.value);
  if (S.closing.careBurden.value === 0) R.careZero++;
  if (L.death.age >= 65) { R.n65death++; if (L.home.tenure === 'facility') R.facilityAtDeath++; }
  if (L.death.age >= 80) R.debt80.push(L.money.loans.credit);
  for (const c of L.family.children) R.childAges.push(c.birthYear - L.birth.year);
  R.nChildren.push(L.family.children.length);
}
console.log(`N=${N}`);
console.log(`[연표 중립 문구] "힘든 일을 겪었다." 생애당 평균 ${mean(R.neutral).toFixed(2)}줄(연표 평균 ${mean(R.tlLen).toFixed(1)}줄, 비중 ${(mean(R.neutral) / mean(R.tlLen) * 100).toFixed(1)}%) · 2줄 이상 생애 ${pct(R.neutral.filter(x => x >= 2).length, N)} · 3줄 이상 ${pct(R.neutral.filter(x => x >= 3).length, N)} · 최대 ${Math.max(...R.neutral)}`);
console.log(`[첫 취업 나이(25세+ 사망)] 중앙 ${q(R.firstJobAge, .5)} · p90 ${q(R.firstJobAge, .9)} · p99 ${q(R.firstJobAge, .99)} · 30세 초과 ${pct(R.firstJobAge.filter(x => x > 30).length, adults)} · 40세 초과 ${pct(R.firstJobAge.filter(x => x > 40).length, adults)} · 평생 무직 ${pct(R.noJob, adults)}`);
console.log(`[이사] 생애 평균 ${mean(R.moves).toFixed(1)}회 p50 ${q(R.moves, .5)} p95 ${q(R.moves, .95)} 최대 ${Math.max(...R.moves)} · 성인 1년당 ${mean(R.movesPerAdultYear).toFixed(3)}회 · 원치 않은 이사 평균 ${mean(R.invMoves).toFixed(1)} p95 ${q(R.invMoves, .95)}`);
console.log(`[직업] 생애당 직업 수 평균 ${mean(R.jobsPerLife).toFixed(1)} p95 ${q(R.jobsPerLife, .95)} 최대 ${Math.max(...R.jobsPerLife)}`);
const top = Object.entries(R.firstTitles).sort((a, b) => b[1] - a[1]);
const nFirst = Object.values(R.firstTitles).reduce((s, x) => s + x, 0);
console.log('[첫 직업 상위 25] ' + top.slice(0, 25).map(([t, n]) => `${t} ${(n / nFirst * 100).toFixed(1)}%`).join(' · '));
const RARE = ['성직자', '관제사', '운동선수', '성악가', '배우', '가수', '조종사', '판사', '검사', '변호사', '의사', '교수', '작곡가', '화가', '무용가', '감독', '연극', '지휘자', '기자', '승무원'];
const rare = Object.entries(R.firstTitles).filter(([t]) => RARE.some(k => t.includes(k)));
console.log('[희소·고학력 직종이 첫 직업으로 나온 빈도] ' + rare.map(([t, n]) => `${t} ${n}(${(n / nFirst * 100).toFixed(2)}%)`).join(' · '));
const allT = Object.entries(R.jobTitles).sort((a, b) => b[1] - a[1]), nAll = allT.reduce((s, [, n]) => s + n, 0);
console.log(`[직업 이력 전체] 서로 다른 직업 ${allT.length}종 / 이력 ${nAll}건 · 상위 10: ` + allT.slice(0, 10).map(([t, n]) => `${t} ${(n / nAll * 100).toFixed(1)}%`).join(' · '));
console.log(`[재혼] 재혼 경험 ${pct(R.remarry.filter(x => x > 0).length, N)} · 재혼 나이 p50 ${q(R.remarryAges, .5)} · 60세+ 재혼 ${R.remarryAges.filter(a => a >= 60).length}건(${pct(R.remarryAges.filter(a => a >= 60).length, N)} 생애) · 70세+ ${R.remarryAges.filter(a => a >= 70).length}건 · 80세+ ${R.remarryAges.filter(a => a >= 80).length}건 · 최고 ${Math.max(...R.remarryAges)}세`);
console.log(`[결산 지표 분포] econ 평균 ${mean(R.econ).toFixed(1)} p10 ${q(R.econ, .1)} p50 ${q(R.econ, .5)} p90 ${q(R.econ, .9)} · ≤15 ${pct(R.econ.filter(x => x <= 15).length, N)} | 건강 ${mean(R.hea).toFixed(1)} | 관계 ${mean(R.rel).toFixed(1)} | 자율성 ${mean(R.aut).toFixed(1)} | 돌봄부담 평균 ${mean(R.care).toFixed(1)} 0점 ${pct(R.careZero, N)}`);
console.log(`[말년] 65+ 사망자 중 시설 거주 ${pct(R.facilityAtDeath, R.n65death)} · 80+ 사망 시 신용대출 p50 ${q(R.debt80, .5)} p75 ${q(R.debt80, .75)} p90 ${q(R.debt80, .9)} p99 ${q(R.debt80, .99)} 만 원`);
const ca = R.childAges;
console.log(`[출산] 자녀 수 평균 ${mean(R.nChildren).toFixed(2)} · 출산 나이(내 나이) p5 ${q(ca, .05)} p50 ${q(ca, .5)} p95 ${q(ca, .95)}`);

// ── 사무직 전제 문구(사원증·출입증)가 현장·매장직 생애에 노출되는 비율(600생애) ──
{
  const by = {}; const ex = [];
  for (let s = 0; s < 600; s++) {
    const L = E.runToEnd(E.newLife({ seed: S0 + s }));
    for (const e of L.log) {
      if (!/사원증|출입증/.test(e.text) || e.kind !== 'system') continue;
      const h = L.job.history.find(x => x.from <= e.year && (x.to == null || x.to >= e.year));
      const t = h?.title || '?', k = /건물 청소원|경비원|농|재배|조작원|운전|배달|판매원|계산원/.test(t) ? '현장·매장·농업직' : '기타';
      by[k] = (by[k] || 0) + 1;
      if (k !== '기타' && ex.length < 3) ex.push(`seed ${S0 + s}: ${t} | ${e.text}`);
    }
  }
  console.log(`[사무직 전제 문구] 사원증·출입증 문구 ${Object.values(by).reduce((a, b) => a + b, 0)}줄 중 현장·매장·농업직 ${by['현장·매장·농업직'] || 0}줄 · 예) ${ex.join(' ; ')}`);
}
