import { test } from 'node:test';
import assert from 'node:assert/strict';
import { REGION_SHARE_BY_YEAR as R, URBAN_SHARE_BY_YEAR as U, sigunguWeight, sigunguShare } from '../../src/data/region-share.js';
import { REGIONS } from '../../src/engine/constants.js';
import { REGIONS_A } from '../../src/data/regions-a.js';
import { REGIONS_B } from '../../src/data/regions-b.js';
import { REGIONS_C } from '../../src/data/regions-c.js';
import { SOURCES } from '../../src/data/sources.js';

const ALL = [...REGIONS_A, ...REGIONS_B, ...REGIONS_C];

test('1960~1985 전 연도 분포 합 1, 17키, 분리 전 지역 0', () => {
  for (let y = 1960; y <= 1985; y++) {
    const s = R.values[y].share;
    assert.equal(Object.keys(s).length, 17);
    assert.ok(Math.abs(Object.values(s).reduce((a, b) => a + b, 0) - 1) < 0.001, String(y));
    for (const g of REGIONS) if (g.since && y < g.since) assert.equal(s[g.key], 0, `${y} ${g.key}`);
  }
  assert.ok(R.values[1985].share.daegu > 0 && R.values[1980].share.daegu === 0);
});
test('수도권 비중 대략 앵커(1960 ~21%, 1985 ~39%)에 부합', () => {
  const cap = y => ['seoul', 'incheon', 'gyeonggi'].reduce((a, k) => a + R.values[y].share[k], 0);
  assert.ok(cap(1960) > 0.18 && cap(1960) < 0.23);
  assert.ok(cap(1985) > 0.36 && cap(1985) < 0.41);
});
test('도시 비중 0~1, 시간에 따라 증가', () => {
  for (const k of Object.keys(U.values[1960])) { assert.ok(U.values[1960][k] >= 0 && U.values[1985][k] <= 1); assert.ok(U.values[1985][k] >= U.values[1960][k]); }
});
test('sigunguWeight 전 id ≥0, 시도 내 정규화 합 1, 미등록 id 0', () => {
  for (const r of ALL) for (const y of [1960, 1985, 2020]) assert.ok(sigunguWeight(r.id, y) >= 0);
  assert.equal(sigunguWeight('nowhere.x', 1970), 0);
  for (const s of REGIONS.map(g => g.key)) assert.ok(Math.abs(Object.values(sigunguShare(s, 1975)).reduce((a, b) => a + b, 0) - 1) < 1e-9);
  assert.ok(sigunguWeight('seoul.nowon', 1975) < sigunguWeight('seoul.nowon', 2000));
});
test('src 등록', () => {
  for (const k of [R.src, U.src]) assert.ok(SOURCES[k], k);
  assert.ok(SOURCES['R10.S3']);
});
