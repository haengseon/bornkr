import { test } from 'node:test';
import assert from 'node:assert/strict';
import { REGIONS_C } from '../../src/data/regions-c.js';

const SIDO = { jeonbuk: 14, jeonnam: 22, gyeongbuk: 23, gyeongnam: 18 };
test('시도별 시군구 수·id 유일', () => {
  for (const [s, n] of Object.entries(SIDO)) assert.equal(REGIONS_C.filter(x => x.sido === s).length, n, s);
  assert.equal(REGIONS_C.length, 77);
  assert.equal(new Set(REGIONS_C.map(x => x.id)).size, 77);
});
test('티어·동네·vibe 길이', () => {
  const ok = v => Number.isInteger(v) && v >= 1 && v <= 5;
  for (const x of REGIONS_C) {
    for (const k of ['urban', 'incomeTier', 'housingTier', 'eduTier']) assert.ok(ok(x[k]), `${x.id}.${k}`);
    assert.ok(x.vibe.length <= 30, `${x.id} vibe ${x.vibe.length}`);
    assert.ok(x.dongs.length >= 2, x.id);
    for (const d of x.dongs) { assert.ok(ok(d.tier), `${x.id}/${d.name}`); assert.ok(d.vibe.length <= 24, `${x.id}/${d.name} ${d.vibe.length}`); }
    assert.ok(x.id.startsWith(x.sido + '.') && x.notes && x.src.length && typeof x.est === 'boolean');
  }
});
