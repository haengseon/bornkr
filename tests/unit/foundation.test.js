import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeRng, rand, weighted, normal, hashSeed } from '../../src/engine/rng.js';
import { byYear, byAge, isExtrapolated } from '../../src/engine/lookup.js';

test('rng는 같은 시드에서 같은 수열을 낸다', () => {
  const a = makeRng(42), b = makeRng(42);
  const xs = Array.from({ length: 5 }, () => rand(a));
  assert.deepEqual(xs, Array.from({ length: 5 }, () => rand(b)));
  assert.ok(xs.every(x => x >= 0 && x < 1));
  assert.deepEqual(JSON.parse(JSON.stringify(a)), a); // 상태 직렬화 가능
});

test('weighted는 가중치 비율을 따른다', () => {
  const s = makeRng(7), n = 20000;
  let hits = 0;
  for (let i = 0; i < n; i++) if (weighted(s, { x: 3, y: 1 }) === 'x') hits++;
  assert.ok(Math.abs(hits / n - 0.75) < 0.02);
  assert.equal(weighted(s, { x: 0 }), null);
});

test('normal 평균·표준편차', () => {
  const s = makeRng(9), n = 20000, xs = Array.from({ length: n }, () => normal(s, 50, 10));
  const m = xs.reduce((a, b) => a + b) / n;
  const sd = Math.sqrt(xs.reduce((a, b) => a + (b - m) ** 2, 0) / n);
  assert.ok(Math.abs(m - 50) < 0.5 && Math.abs(sd - 10) < 0.5);
});

test('hashSeed는 결정적이고 입력마다 다르다', () => {
  assert.equal(hashSeed(1, 'peer', 0), hashSeed(1, 'peer', 0));
  assert.notEqual(hashSeed(1, 'peer', 0), hashSeed(1, 'peer', 1));
});

test('byYear 보간·클램프, byAge 계단', () => {
  const s = { 1980: 10, 2000: 30 };
  assert.equal(byYear(s, 1990), 20);
  assert.equal(byYear(s, 1970), 10);
  assert.equal(byYear(s, 2030), 30);
  assert.ok(isExtrapolated(s, 2030) && !isExtrapolated(s, 1990));
  assert.equal(byAge({ 0: 'a', 5: 'b', 10: 'c' }, 7), 'b');
});
