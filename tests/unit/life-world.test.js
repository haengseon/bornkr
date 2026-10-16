import test from 'node:test';
import assert from 'node:assert/strict';
import { prepareLifeWorld, lifeWorldHomeKey } from '../../src/engine/life-world.js';

const life = () => ({ seed: 17, modelVersion: 2, alive: true, year: 2015, age: 15,
  birth: { urban: true }, edu: { stage: 'high' }, job: { status: 'student' },
  family: { siblingMembers: [{ id: 'sibling', birthYear: 2002, alive: true }] },
  home: { parents: true, region: 'seoul', sigungu: 'x', dong: 'y', tenure: 'family', moves: [] },
  money: { assets: 100 }, rng: { a: 23 }, rngC: { a: 45 } });

test('현재 배경은 결정적이며 반복 호출로 물품·인사·기록·난수가 늘지 않는다', () => {
  const L = life();
  const rng = structuredClone([L.rng, L.rngC, L.money]);
  const first = structuredClone(prepareLifeWorld(L));
  const again = prepareLifeWorld(L);
  assert.deepEqual(again, first);
  assert.equal(L.dailyLife.people.length, 1);
  assert.equal(L.dailyLife.history.length, 1);
  assert.deepEqual([L.rng, L.rngC, L.money], rng);
  assert.equal(again.sourceKind, 'game-world-assumption');
  assert.equal(again.sharedSpace.conflictRecorded, false);
  assert.equal(again.ownedBooks.length, 1);
  assert.equal(L.dailyLife.people[0].bond, undefined);
});

test('이사·학교 변경은 현재 배경을 갱신하고 지난 학급 인사를 접촉·친구로 승격하지 않는다', () => {
  const L = life(); prepareLifeWorld(L);
  const previousPerson = L.dailyLife.people[0];
  L.year++; L.age++; L.edu.stage = 'college'; L.home.dong = 'new'; L.home.moves.push({ year: L.year });
  const world = prepareLifeWorld(L);
  assert.equal(world.year, L.year);
  assert.equal(world.homeKey, lifeWorldHomeKey(L));
  assert.equal(previousPerson.away, true);
  assert.equal(L.dailyLife.people.length, 2);
  assert.equal(L.dailyLife.contacts, undefined);
});

test('성인 기본 가전·난방은 현재 게임 가정이며 금전·자산가치·계약은 만들지 않는다', () => {
  const L = life(); L.age = 22; L.edu.stage = 'none'; L.home.parents = false; L.home.tenure = 'monthly';
  const world = prepareLifeWorld(L);
  assert.equal(world.inventory[0].ownedYear, L.year);
  assert.equal(world.inventory[0].working, true);
  assert.equal(world.heating.kind, 'gas');
  assert.equal(world.digital.accountId, undefined);
  assert.equal(world.digital.planMonthly, undefined);
  assert.equal(L.money.assets, 100);
  assert.equal(world.schoolRoute, null);
  assert.equal(world.sharedSpace, null);
});

test('구버전·사망·영유아는 변경하지 않고 시대 이전 디지털 접근은 차단한다', () => {
  for (const patch of [{ modelVersion: 1 }, { alive: false }, { age: 0 }]) {
    const L = Object.assign(life(), patch), before = structuredClone(L);
    assert.equal(prepareLifeWorld(L), null); assert.deepEqual(L, before);
  }
  const L = life(); L.year = 1980;
  const world = prepareLifeWorld(L);
  assert.equal(world.digital.phone, false); assert.equal(world.digital.internet, false);
  assert.equal(world.access.publicInternet, false);
});
