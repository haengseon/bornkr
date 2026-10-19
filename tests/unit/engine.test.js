// 엔진 불변식(ARCHITECTURE §16): 결정성·값 범위·사망 도달·선택 상한·첫 선택·비교 카드·결산 금지어·조사·직렬화.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../../src/engine/index.js';
import { COMPARE_AGES, STAT_KEYS, ISSUE_KEYS } from '../../src/engine/constants.js';
import { STAGE_CAP } from '../../src/engine/tuning.js';
import { stageOf } from '../../src/engine/clock.js';

const life = seed => E.runToEnd(E.newLife({ seed }));
// 결정적 '무작위' 정책: 선택마다 옵션을 시드·나이로 고른다(QA random 정책과 같은 방식)
const randomPolicy = (L, req) => req.options[(L.seed + req.age * 7) % req.options.length].id;

test('결정성: 같은 시드 → 같은 생애, replay(seed, choices) 재현', () => {
  for (const seed of [1, 2, 3, 77, 2026]) {
    const a = life(seed), b = life(seed);
    assert.deepEqual(a.log, b.log);
    const c = E.runToEnd(E.newLife({ seed }), randomPolicy);
    const r = E.replay(seed, c.choices);
    assert.deepEqual(r.log, c.log);
    assert.deepEqual(r.death, c.death);
  }
});

test('상태는 JSON 직렬화 가능하고, 직렬화 후 이어 가도 같은 생애', () => {
  const A = E.newLife({ seed: 31 });
  while (A.age < 30 && A.alive) { if (A.pending) E.choose(A, A.pending.defaultId, { auto: true }); else E.advanceYear(A); }
  const B = JSON.parse(JSON.stringify(A));
  assert.deepEqual(B, A);
  E.runToEnd(A); E.runToEnd(B);
  assert.deepEqual(B.log, A.log);
});

test('값 범위: 6지표·이슈는 해마다 0~100 정수, 모든 생애가 사망(≤120세)', () => {
  for (let seed = 100; seed < 160; seed++) {
    const L = life(seed);
    assert.equal(L.alive, false);
    assert.ok(L.death.age >= 0 && L.death.age <= 120);
    for (const h of Object.values(L.hist)) for (const v of [...h.s, ...h.i]) assert.ok(Number.isInteger(v) && v >= 0 && v <= 100, `seed ${seed}: ${v}`);
    for (const k of STAT_KEYS) assert.ok(Number.isInteger(L.stats[k]));
    for (const k of ISSUE_KEYS) assert.ok(Number.isInteger(L.issues[k]));
  }
});

test('중대 선택: 해마다 1건, 구간 상한 이하, 5세까지 일상 첫 선택', () => {
  let reached6 = 0, first = 0;
  for (let seed = 200; seed < 300; seed++) {
    const L = life(seed);
    const mine = L.choices.filter(c => !c.forced && !c.routine);
    const perYear = {}, perStage = {};
    for (const c of mine) {
      perYear[c.age] = (perYear[c.age] || 0) + 1;
      if (c.cadence) continue; // 주기적 생활 선택은 중대 결정의 구간 예산과 별도다.
      const st = stageOf(c.age).id, k = c.eventId.startsWith('sys.') ? 'sys' : c.eventId.startsWith('LIFE-') ? 'life' : 'chance';
      (perStage[st] ||= { sys: 0, chance: 0, life: 0 })[k]++;
    }
    assert.ok(Object.values(perYear).every(n => n === 1), `seed ${seed} 한 해 2건`);
    for (const [st, n] of Object.entries(perStage)) {
      assert.ok(n.sys <= STAGE_CAP[st].sys && n.chance <= STAGE_CAP[st].chance && n.life <= (L.modelVersion >= 2 ? 1 : 0), `seed ${seed} ${st} ${JSON.stringify(n)}`);
    }
    if (L.death.age >= 6) { reached6++; if (L.choices.some(c => !c.forced && c.age <= 5)) first++; }
  }
  assert.equal(first, reached6, '6세 이상 산 생애는 모두 5세까지 첫 선택');
});

test('advanceYear/choose 흐름: 대기 중 진행 금지, 비교 카드는 COMPARE_AGES에서만', () => {
  const L = E.newLife({ seed: 4242 });
  const seen = [];
  while (L.alive) {
    const r = L.pending ? E.choose(L, L.pending.defaultId) : E.advanceYear(L);
    if (L.pending) {
      assert.throws(() => E.advanceYear(L));
      assert.equal(L.pending.timeoutMs, L.pending.sensitive || L.pending.major ? 20000 : 12000);   // 이정표(중대 결정)는 20초(PROCESS-V2 §3)
    }
    if (r.compare) {
      seen.push(r.compare.age);
      assert.equal(r.compare.peers.length, 3);
      assert.ok(Number.isInteger(r.compare.me.order));
      assert.ok(r.compare.peers.every(p => Number.isInteger(p.order) && typeof p.line === 'string'));
      assert.ok(typeof r.compare.stat === 'string' && r.compare.stat.length);
    }
  }
  assert.deepEqual(seen, COMPARE_AGES.filter(a => a <= L.death.age));
});

test('동료 3명: 결정적, 같은 날 출생, 출생 시각 순', () => {
  const L = E.newLife({ seed: 555 });
  const a = E.peers(L), b = E.peers(E.newLife({ seed: 555 }));
  assert.deepEqual(a, b);
  assert.equal(a.length, 3);
  for (let i = 1; i < 3; i++) assert.ok(a[i - 1].order <= a[i].order);
});

test('시계: 1년=1배속 15초 고정, 배속 1~5로만 나눔, 일시정지 시간 제외, 시간 상한 없음', () => {
  let t = 0;
  const c = E.createClock({ now: () => t });
  c.start();
  t = 5 * 60_000; c.pause(); t = 20 * 60_000; c.resume();
  assert.equal(c.elapsed(), 5 * 60_000);
  t += 60 * 60_000;
  assert.equal(c.overCap(), false);            // 1년=30초 정책: 15분 상한 없음
  const L = E.newLife({ seed: 1 });
  const want = { 1: 15000, 2: 7500, 3: 5000, 4: 3750, 5: 3000 };
  L.age = 5;
  for (const [sp, ms] of Object.entries(want)) assert.equal(c.yearDelay(L, Number(sp)), ms);
  L.age = 0;                                    // 0~4세는 한 해를 0.4배로 압축(HOOK-30S P0-2)
  assert.equal(c.yearDelay(L, 1), 6000);
  L.age = 70;                                   // 70세 이후는 1/1.5(E1 페이싱)
  assert.equal(c.yearDelay(L, 1), 10000);
});

test('1,000생애 평균 사망 나이 ≈ 출생아 가중 해석 목표(GDD §6.5 ±1.0)', async () => {
  const { cohortQ } = await import('../../src/engine/death.js');
  const { T, yr } = await import('../../src/engine/tables.js');
  let num = 0, den = 0;
  // 관찰 종료(2050)는 없앴다: 모든 생애는 사망으로 끝나므로 목표는 절단 없이 코호트 기대여명
  for (let y = 1960; y <= 1985; y++) {
    const b = yr(T('BIRTHS_BY_YEAR'), y), r = yr(T('SEX_RATIO_BY_YEAR'), y), pm = r / (100 + r);
    const e0 = sex => { const v = cohortQ(sex, y); let S = 1, e = 0.5; for (let a = 0; a < 110; a++) { S *= 1 - v[a]; e += S; } return e; };
    num += b * (pm * e0('M') + (1 - pm) * e0('F')); den += b;
  }
  const target = num / den;
  let sum = 0;
  const N = 1000, t0 = performance.now();
  for (let s = 1; s <= N; s++) sum += life(10000 + s).death.age;
  const ms = (performance.now() - t0) / N;
  const mean = sum / N + 0.5;   // 사망 나이는 만 나이(완료 햇수) → 정확한 사망 시점 평균은 +0.5
  assert.ok(Math.abs(mean - target) <= 1.0, `평균 ${mean.toFixed(2)} vs 목표 ${target.toFixed(2)}`);
  assert.ok(ms <= 70, `runToEnd 평균 ${ms.toFixed(1)}ms`);
});

test('성능: 동료 3명 포함 newLife+runToEnd ≤ 150ms(평균)', () => {
  const t0 = performance.now();
  for (let s = 1; s <= 10; s++) { const L = life(700 + s); E.peers(L); }
  assert.ok((performance.now() - t0) / 10 <= 150);
});

const BANNED = /백분위|순위|상위\s*\d|하위\s*\d|\d+\s*등\b|랭킹|승리|패배|성공한 삶|실패한 삶/;
test('결산 Summary: 필드 존재, 금지어(백분위·순위) 없음, 사인은 death 상세만', () => {
  for (const seed of [5, 6, 7, 8, 9, 10]) {
    const L = life(seed), S = E.summarize(L);
    for (const k of ['birthCert', 'verdict', 'timeline', 'closing', 'issues', 'death', 'peers', 'sources']) assert.ok(S[k] != null, k);
    for (const k of ['econ', 'health', 'relations', 'autonomy', 'careBurden']) {
      const c = S.closing[k];
      assert.ok(Number.isInteger(c.value) && c.value >= 0 && c.value <= 100 && c.label && c.line && c.src.length);
    }
    assert.ok(S.timeline.length >= (L.death.age < 30 ? 2 : 6) && S.timeline.length <= 16);
    assert.equal(S.timeline[0].kind, 'birth');
    assert.equal(S.timeline[S.timeline.length - 1].kind, 'death');
    assert.equal(typeof S.death.sensitive, 'boolean');
    const shown = JSON.stringify([S.birthCert, S.verdict, S.timeline, S.peers]);
    assert.ok(!BANNED.test(shown), shown.match(BANNED)?.[0]);
    assert.ok(!shown.includes(L.death.causeLabel), '사인 노출');
    assert.ok(S.peers.every(p => Number.isInteger(p.order)));
  }
});

test('영아·아동 사망 문구에 손실 산수 없음', () => {
  let found = 0;
  for (let seed = 1; seed < 4000 && found < 3; seed++) {
    const L = E.newLife({ seed });
    E.advanceYear(L);
    if (L.alive) continue;
    found++;
    const S = E.summarize(L, { peers: false });
    const txt = JSON.stringify([L.log, S.verdict, S.timeline]);
    assert.ok(!/덜 살|남은 (해|햇수)|기대수명/.test(txt));
  }
  assert.ok(found > 0);
});

test('explain: 6지표·10축·결산 5지표 모두 lines ≥ 2, src ≥ 1(year·kind)', () => {
  const L = E.newLife({ seed: 88 });
  while (L.alive && L.age < 45) { if (L.pending) E.choose(L, L.pending.defaultId); else E.advanceYear(L); }
  for (const k of [...STAT_KEYS, ...ISSUE_KEYS, 'econ', 'health', 'relations', 'autonomy', 'careBurden']) {
    const x = E.explain(L, k);
    assert.ok(x.lines.length >= 2 && x.src.length >= 1, k);
    assert.ok(x.src.every(s => s.year && s.kind), k);
  }
  const bc = E.birthCert(E.newLife({ seed: 3 }));
  assert.ok(bc.story.length >= 2 && bc.hook && bc.quintile >= 1 && !/\d/.test(bc.quintileLabel));
});

test('fill: 변수·조사 처리', () => {
  assert.equal(E.fill('{name|은} 갔다.', { name: '김지훈' }), '김지훈은 갔다.');
  assert.equal(E.fill('{name|은} 갔다.', { name: '이서아' }), '이서아는 갔다.');
  assert.equal(E.fill('{a|이} {b|가}', { a: '고혈압', b: '치매' }), '고혈압이 치매가');
  assert.equal(E.fill('{a|을} {b|를}', { a: '책', b: '사과' }), '책을 사과를');
  assert.equal(E.fill('{a|과} {b|와}', { a: '동생', b: '누나' }), '동생과 누나와');
  assert.equal(E.fill('{a|으로} {b|으로} {c|로}', { a: '서울', b: '부산', c: '집' }), '서울로 부산으로 집으로');
  assert.equal(E.fill('{n|이} 지났다', { n: 10 }), '10이 지났다');
  assert.equal(E.fill('{n|가} 지났다', { n: 5 }), '5가 지났다');
  assert.equal(E.fill('뇌졸중(으)로 실려 갔다. 고혈압이(가) 나았다. 지훈은(는)', {}), '뇌졸중으로 실려 갔다. 고혈압이 나았다. 지훈은');
  assert.equal(E.fill(['하나', '둘'], {}), '하나');
  assert.equal(E.fill((L, v) => `${v.x}!`, { x: '함수' }), '함수!');
});

