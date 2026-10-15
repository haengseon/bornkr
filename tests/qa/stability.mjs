// QA-S 결정성·안정성·성능. 실행: node tests/qa/stability.mjs [생애 수=10000] [replay 시드 수=1000]
//  - N생애(절반 default·절반 random 정책) 예외 0, 값 범위 0~100 정수, 사망 도달(≤110), 비유한수·undefined 없음, JSON 직렬화
//  - replay(seed, choices) == 원본(로그·사망·summarize), 공개 API(advanceYear/choose) 진행 == runToEnd, 중간 직렬화 후 이어가기
//  - 성능: runToEnd·summarize·peers(동료 3명) 시간
import fs from 'node:fs';
import { performance } from 'node:perf_hooks';
import { isMainThread, pool, serve, range } from './lib/pool.mjs';
import * as E from '../../src/engine/index.js';
import { hashSeed, makeRng, rand } from '../../src/engine/rng.js';
import { MAX_AGE } from '../../src/engine/tuning.js';
import { STAT_KEYS, ISSUE_KEYS, TRAIT_KEYS } from '../../src/engine/constants.js';

const SEED0 = 13_000_000;
const randomPolicy = p => (L, req) => req.options[Math.floor(rand(makeRng(hashSeed(L.seed, 'qa-policy', p, req.age, req.eventId))) * req.options.length)].id;

function badNumbers(o, path, out, depth = 0) {
  if (depth > 12) return;
  if (typeof o === 'number') { if (!Number.isFinite(o)) out.push(path); return; }
  if (o === undefined) { out.push(path + '=undefined'); return; }
  if (Array.isArray(o)) { o.forEach((x, i) => badNumbers(x, `${path}[${i}]`, out, depth + 1)); return; }
  if (o && typeof o === 'object') for (const [k, v] of Object.entries(o)) badNumbers(v, `${path}.${k}`, out, depth + 1);
}
const isInt0100 = v => Number.isInteger(v) && v >= 0 && v <= 100;

function lifeChecks(seed, policyName, R) {
  const t0 = performance.now();
  let L;
  try {
    L = E.newLife({ seed });
    E.runToEnd(L, policyName === 'default' ? 'default' : randomPolicy(1));
  } catch (err) {
    const k = String(err.stack).split('\n').slice(0, 3).join(' | ').slice(0, 300);
    R.exc[k] = (R.exc[k] || 0) + 1; R.excSeeds.push(seed); return;
  }
  R.ms.push(performance.now() - t0);
  R.n++;
  if (L.alive) R.notDead.push(seed);
  else {
    if (L.death.age > MAX_AGE) R.tooOld.push(seed);
    R.maxAge = Math.max(R.maxAge, L.death.age);
    R.ages.push(L.death.age);
  }
  // 값 범위
  let bad = 0;
  for (const h of Object.values(L.hist)) for (const v of [...h.s, ...h.i]) if (!isInt0100(v)) { bad++; if (R.rangeEx.length < 5) R.rangeEx.push({ seed, v }); }
  for (const k of STAT_KEYS) if (!isInt0100(L.stats[k])) bad++;
  for (const k of ISSUE_KEYS) if (!isInt0100(L.issues[k])) bad++;
  for (const k of TRAIT_KEYS) if (!Number.isInteger(L.traits[k]) || L.traits[k] < 5 || L.traits[k] > 95) { bad++; if (R.traitEx.length < 5) R.traitEx.push({ seed, k, v: L.traits[k] }); }
  if (bad) R.rangeBad++;
  const nb = []; badNumbers(L, 'L', nb);
  if (nb.length) { R.nan++; if (R.nanEx.length < 8) R.nanEx.push({ seed, at: nb.slice(0, 4) }); }
  // 단조: 로그 나이 비감소, 연도 = 출생 + 나이
  let prev = -1;
  for (const e of L.log) { if (e.age < prev) { R.logOrder++; break; } prev = e.age; if (e.year !== L.birth.year + e.age) { R.yearMismatch++; if (R.yearEx.length < 3) R.yearEx.push({ seed, e: e.id, age: e.age, year: e.year }); break; } }
  // 자산·부채 정합
  const m = L.money;
  if (m.debt !== Math.round(Object.values(m.loans).reduce((a, b) => a + b, 0))) R.debtMismatch++;
  if (Object.values(m.loans).some(v => v < -0.5)) R.negLoan++;
  if (m.assets < -0.5) R.negAssets++;
  // JSON 왕복
  try { const j = JSON.stringify(L); if (JSON.parse(j).log.length !== L.log.length) R.jsonBad++; } catch { R.jsonBad++; }
  // summarize
  try {
    const t1 = performance.now();
    const S = E.summarize(L, { peers: false });
    R.sumMs.push(performance.now() - t1);
    const nb2 = []; badNumbers(S, 'S', nb2);
    if (nb2.length) { R.sumNan++; if (R.sumNanEx.length < 5) R.sumNanEx.push({ seed, at: nb2.slice(0, 3) }); }
    for (const c of Object.values(S.closing)) if (!isInt0100(c.value)) { R.closingRange++; break; }
    for (const i of S.issues) if (!isInt0100(i.value)) { R.closingRange++; break; }
    if (S.timeline.length < 3) R.shortTimeline++;
    const hi = L.death.age < 30 ? 10 : 16;
    if (S.timeline.length > hi) R.timelineOver++;
  } catch (err) { R.sumExc[String(err.stack).split('\n').slice(0, 2).join(' | ').slice(0, 200)] = (R.sumExc[String(err.stack).split('\n').slice(0, 2).join(' | ').slice(0, 200)] || 0) + 1; }
}

function newR() {
  return { n: 0, exc: {}, excSeeds: [], ms: [], sumMs: [], notDead: [], tooOld: [], maxAge: 0, ages: [], rangeBad: 0, rangeEx: [], traitEx: [], nan: 0, nanEx: [], logOrder: 0, yearMismatch: 0, yearEx: [], debtMismatch: 0, negLoan: 0, negAssets: 0, jsonBad: 0, sumNan: 0, sumNanEx: [], closingRange: 0, shortTimeline: 0, timelineOver: 0, sumExc: {} };
}

function work(job) {
  if (job.type === 'life') {
    const R = newR();
    for (let s = job.from; s < job.to; s++) lifeChecks(SEED0 + s, s % 2 === 0 ? 'default' : 'random', R);
    return R;
  }
  if (job.type === 'replay') {
    const R = { n: 0, logDiff: [], deathDiff: [], sumDiff: [], defDiff: [], apiDiff: [], serDiff: [], choiceN: 0, exc: [] };
    for (let s = job.from; s < job.to; s++) {
      const seed = SEED0 + 5_000_000 + s;
      try {
        const A = E.runToEnd(E.newLife({ seed }), randomPolicy(2));
        const B = E.replay(seed, A.choices);
        R.n++; R.choiceN += A.choices.length;
        if (JSON.stringify(A.log) !== JSON.stringify(B.log)) R.logDiff.push(seed);
        if (JSON.stringify(A.death) !== JSON.stringify(B.death)) R.deathDiff.push(seed);
        if (s % 5 === 0 && JSON.stringify(E.summarize(A, { peers: false })) !== JSON.stringify(E.summarize(B, { peers: false }))) R.sumDiff.push(seed);
        // default replay(seed, []) == runToEnd default
        if (s % 5 === 1) {
          const D = E.runToEnd(E.newLife({ seed })), D2 = E.replay(seed, []);
          if (JSON.stringify(D.log) !== JSON.stringify(D2.log)) R.defDiff.push(seed);
        }
        // 공개 API(advanceYear/choose, UI와 같은 방식) == runToEnd(default)
        if (s % 10 === 2) {
          const X = E.newLife({ seed }); E.runToEnd(X);
          const Y = E.newLife({ seed });
          while (Y.alive) { E.advanceYear(Y); while (Y.pending) E.choose(Y, Y.pending.defaultId, { auto: true }); }
          if (JSON.stringify(X.log) !== JSON.stringify(Y.log)) R.apiDiff.push(seed);
        }
        // 중간 직렬화
        if (s % 10 === 3) {
          const X = E.newLife({ seed });
          while (X.age < 20 + (s % 40) && X.alive) { if (X.pending) E.choose(X, X.pending.defaultId, { auto: true }); else E.advanceYear(X); }
          const Y = JSON.parse(JSON.stringify(X));
          E.runToEnd(X); E.runToEnd(Y);
          if (JSON.stringify(X.log) !== JSON.stringify(Y.log)) R.serDiff.push(seed);
        }
      } catch (err) { R.exc.push(`${seed}: ${String(err.message).slice(0, 120)}`); }
    }
    return R;
  }
  if (job.type === 'perf') {
    const out = { peers: [], peerFirst: [], sumPeers: [], run: [] };
    for (let s = job.from; s < job.to; s++) {
      const seed = SEED0 + 9_000_000 + s;
      const L = E.newLife({ seed });
      let t = performance.now(); E.runToEnd(L); out.run.push(performance.now() - t);
      t = performance.now(); E.peers(L); out.peers.push(performance.now() - t);
      t = performance.now(); E.summarize(L); out.sumPeers.push(performance.now() - t);
    }
    return out;
  }
  if (job.type === 'edge') {
    const res = [];
    const tryIt = (name, fn) => { try { fn(); res.push([name, 'ok']); } catch (e) { res.push([name, `throw: ${String(e.message).slice(0, 80)}`]); } };
    tryIt('newLife() 인자 없음', () => E.runToEnd(E.newLife()));
    tryIt('newLife({seed:0})', () => E.runToEnd(E.newLife({ seed: 0 })));
    tryIt('newLife({seed:-1})', () => E.runToEnd(E.newLife({ seed: -1 })));
    tryIt('newLife({seed:2**32+5})', () => E.runToEnd(E.newLife({ seed: 2 ** 32 + 5 })));
    for (const y of [1960, 2026]) for (const sex of ['M', 'F']) tryIt(`forced ${y} ${sex}`, () => E.runToEnd(E.newLife({ seed: 77, forced: { year: y, sex } })));
    tryIt('forced quintile 1', () => E.runToEnd(E.newLife({ seed: 78, forced: { quintile: 1, region: 'jeju', urban: false } })));
    tryIt('advanceYear while pending → throw', () => { const L = E.newLife({ seed: 5 }); let guard = 0; while (!L.pending && L.alive && guard++ < 100) E.advanceYear(L); if (!L.pending) throw new Error('(pending 없음)'); let thrown = false; try { E.advanceYear(L); } catch { thrown = true; } if (!thrown) throw new Error('pending 중 advanceYear가 예외를 안 던짐'); });
    tryIt('choose without pending → throw', () => { const L = E.newLife({ seed: 5 }); let thrown = false; try { E.choose(L, 'x'); } catch { thrown = true; } if (!thrown) throw new Error('예외 없음'); });
    tryIt('choose(잘못된 id) → 기본값 대체', () => { const L = E.newLife({ seed: 5 }); let g = 0; while (!L.pending && L.alive && g++ < 100) E.advanceYear(L); if (L.pending) E.choose(L, '__nope__'); });
    tryIt('advanceYear after death → throw', () => { const L = E.runToEnd(E.newLife({ seed: 6 })); let thrown = false; try { E.advanceYear(L); } catch { thrown = true; } if (!thrown) throw new Error('예외 없음'); });
    tryIt('summarize(0세 사망)', () => { for (let s = 1; s < 4000; s++) { const L = E.runToEnd(E.newLife({ seed: s })); if (L.death.age === 0) { E.summarize(L); E.birthCert(L); return; } } throw new Error('0세 사망 시드를 못 찾음(4000)'); });
    tryIt('summarize(진행 중 생애)', () => { const L = E.newLife({ seed: 9 }); E.advanceYear(L); E.summarize(L, { peers: false }); });
    tryIt('birthCert(0세)', () => E.birthCert(E.newLife({ seed: 9 })));
    tryIt('explain 모든 키(진행 중 0세)', () => { const L = E.newLife({ seed: 9 }); for (const k of [...STAT_KEYS, ...ISSUE_KEYS, 'econ', 'health', 'relations', 'autonomy', 'careBurden']) E.explain(L, k); });
    tryIt('explain(알 수 없는 키) → throw', () => { let t = false; try { E.explain(E.newLife({ seed: 9 }), 'zzz'); } catch { t = true; } if (!t) throw new Error('예외 없음'); });
    tryIt('compareCard(L, 8)(비교 나이 아님)', () => E.compareCard(E.runToEnd(E.newLife({ seed: 10 })), 8));
    tryIt('createClock yearDelay(L, speed 0)', () => { const c = E.createClock({ now: () => 0 }); c.start(); const v = c.yearDelay(E.newLife({ seed: 1 }), 0); if (!Number.isFinite(v)) throw new Error(`yearDelay(speed=0) = ${v}`); });
    tryIt('createClock pause/resume 중복', () => { let t = 0; const c = E.createClock({ now: () => t }); c.start(); c.pause(); c.pause(); t += 1000; c.resume(); c.resume(); if (c.elapsed() !== 0) throw new Error(`elapsed ${c.elapsed()}`); });
    return res;
  }
}

if (!isMainThread) serve(work);

const q = (a, p) => { const s = [...a].sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(p * s.length))]; };
const sum = a => a.reduce((s, x) => s + x, 0);
async function main() {
  const N = Number(process.argv[2] || 10000), NR = Number(process.argv[3] || 1000);
  const t0 = Date.now();
  const jobs = [...range(N, 250).map(([from, to]) => ({ type: 'life', from, to })), ...range(NR, 50).map(([from, to]) => ({ type: 'replay', from, to })), ...range(200, 20).map(([from, to]) => ({ type: 'perf', from, to })), { type: 'edge' }];
  const parts = await pool(import.meta.url, jobs);
  const lives = parts.filter((_, i) => jobs[i].type === 'life'), reps = parts.filter((_, i) => jobs[i].type === 'replay'), perf = parts.filter((_, i) => jobs[i].type === 'perf'), edge = parts[jobs.findIndex(j => j.type === 'edge')];
  const M = newR();
  for (const R of lives) {
    M.n += R.n; for (const [k, v] of Object.entries(R.exc)) M.exc[k] = (M.exc[k] || 0) + v;
    M.excSeeds.push(...R.excSeeds); M.ms.push(...R.ms); M.sumMs.push(...R.sumMs); M.notDead.push(...R.notDead); M.tooOld.push(...R.tooOld); M.maxAge = Math.max(M.maxAge, R.maxAge); M.ages.push(...R.ages);
    for (const k of ['rangeBad', 'nan', 'logOrder', 'yearMismatch', 'debtMismatch', 'negLoan', 'negAssets', 'jsonBad', 'sumNan', 'closingRange', 'shortTimeline', 'timelineOver']) M[k] += R[k];
    M.rangeEx.push(...R.rangeEx); M.traitEx.push(...R.traitEx); M.nanEx.push(...R.nanEx); M.yearEx.push(...R.yearEx); M.sumNanEx.push(...R.sumNanEx);
    for (const [k, v] of Object.entries(R.sumExc)) M.sumExc[k] = (M.sumExc[k] || 0) + v;
  }
  const RP = { n: 0, logDiff: [], deathDiff: [], sumDiff: [], defDiff: [], apiDiff: [], serDiff: [], exc: [] };
  for (const R of reps) { RP.n += R.n; for (const k of ['logDiff', 'deathDiff', 'sumDiff', 'defDiff', 'apiDiff', 'serDiff', 'exc']) RP[k].push(...R[k]); }
  const P = { peers: [], sumPeers: [], run: [] };
  for (const R of perf) { P.peers.push(...R.peers); P.sumPeers.push(...R.sumPeers); P.run.push(...R.run); }
  const res = { N, M: { ...M, ms: undefined, sumMs: undefined, ages: undefined }, RP, perf: { runMean: sum(P.run) / P.run.length, runP95: q(P.run, 0.95), peersMean: sum(P.peers) / P.peers.length, peersP95: q(P.peers, 0.95), peersMax: Math.max(...P.peers), sumPeersMean: sum(P.sumPeers) / P.sumPeers.length, sumPeersP95: q(P.sumPeers, 0.95), sumNoPeersMean: sum(M.sumMs) / M.sumMs.length, sumNoPeersP95: q(M.sumMs, 0.95) }, edge };
  fs.mkdirSync(new URL('./out/', import.meta.url), { recursive: true });
  fs.writeFileSync(new URL('./out/stability.json', import.meta.url), JSON.stringify(res, null, 1));
  console.log(`생애 ${M.n}/${N} 완료, 예외 ${sum(Object.values(M.exc))}건`, Object.keys(M.exc).length ? JSON.stringify(M.exc) : '');
  console.log(`사망 미도달 ${M.notDead.length}, >${MAX_AGE}세 ${M.tooOld.length}, 최고령 ${M.maxAge}, 평균 ${(sum(M.ages) / M.ages.length).toFixed(2)}세, 100세+ ${M.ages.filter(a => a >= 100).length}`);
  console.log(`값 범위 위반 생애 ${M.rangeBad} ${JSON.stringify(M.rangeEx.slice(0, 3))} · 성향 범위 ${M.traitEx.length} · 비유한수/undefined ${M.nan} ${JSON.stringify(M.nanEx.slice(0, 3))}`);
  console.log(`로그 순서 위반 ${M.logOrder} · 연도≠출생+나이 ${M.yearMismatch} ${JSON.stringify(M.yearEx)} · 부채합 불일치 ${M.debtMismatch} · 음수 대출 ${M.negLoan} · 음수 현금 ${M.negAssets} · JSON 왕복 실패 ${M.jsonBad}`);
  console.log(`Summary: 비유한수 ${M.sumNan} ${JSON.stringify(M.sumNanEx.slice(0, 2))} · closing/이슈 범위 ${M.closingRange} · 연표 <3줄 ${M.shortTimeline} · 연표 상한 초과 ${M.timelineOver} · 예외 ${JSON.stringify(M.sumExc)}`);
  console.log(`replay ${RP.n}시드: 로그 불일치 ${RP.logDiff.length} · 사망 불일치 ${RP.deathDiff.length} · summarize 불일치 ${RP.sumDiff.length} · default replay 불일치 ${RP.defDiff.length} · 공개 API 진행≠runToEnd ${RP.apiDiff.length} · 직렬화 이어가기 불일치 ${RP.serDiff.length} · 예외 ${RP.exc.length}`, RP.logDiff.slice(0, 3), RP.apiDiff.slice(0, 3), RP.exc.slice(0, 3));
  console.log('성능(ms):', JSON.stringify(Object.fromEntries(Object.entries(res.perf).map(([k, v]) => [k, +v.toFixed(1)]))));
  console.log('경계 호출:'); for (const [n, r] of edge) console.log(`  ${r === 'ok' ? '합' : '불'} ${n} ${r === 'ok' ? '' : r}`);
  console.error(`done ${(Date.now() - t0) / 1000}s`);
}

if (isMainThread) await main();
