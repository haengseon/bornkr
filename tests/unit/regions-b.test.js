// 지역 상세 B(부산·대구·광주·대전·울산·세종·강원·충북·충남·제주) 스키마 검증. 소유: 지역 B.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { REGIONS_B } from '../../src/data/regions-b.js';
import { REGIONS } from '../../src/engine/constants.js';

const COUNT = { busan: 16, daegu: 9, gwangju: 5, daejeon: 5, ulsan: 5, sejong: 1, gangwon: 18, chungbuk: 11, chungnam: 15, jeju: 2 };
const keys = new Set(REGIONS.map((r) => r.key));
const tier = (v) => Number.isInteger(v) && v >= 1 && v <= 5;

test('시도별 시군구 수', () => {
  for (const [s, n] of Object.entries(COUNT)) {
    assert.equal(REGIONS_B.filter((r) => r.sido === s).length, n, s);
  }
  assert.equal(REGIONS_B.length, 86 + 1);
});

test('id 유일·sido 유효·티어 1~5', () => {
  assert.equal(new Set(REGIONS_B.map((r) => r.id)).size, REGIONS_B.length);
  for (const r of REGIONS_B) {
    assert.ok(keys.has(r.sido), r.id);
    assert.ok(r.id.startsWith(`${r.sido}.`), r.id);
    assert.ok(['구', '시', '군'].includes(r.kind), r.id);
    for (const f of ['urban', 'incomeTier', 'housingTier', 'eduTier']) assert.ok(tier(r[f]), `${r.id}.${f}`);
  }
});

test('텍스트·동네·배수·출처', () => {
  for (const r of REGIONS_B) {
    assert.ok(r.vibe && r.vibe.length <= 30, `${r.id} vibe ${r.vibe.length}`);
    assert.ok(r.industries.length >= 2 && r.industries.length <= 3, r.id);
    assert.ok(r.commute && r.notes && typeof r.est === 'boolean', r.id);
    assert.ok(r.dongs.length >= 2, r.id);
    for (const d of r.dongs) {
      assert.ok(d.name && d.vibe.length <= 24, `${r.id} ${d.name} ${d.vibe.length}`);
      assert.ok(tier(d.tier), `${r.id} ${d.name}`);
    }
    for (const v of Object.values(r.tenureBias)) assert.ok(v > 0 && v < 3, r.id);
    for (const [k, v] of Object.entries(r.occupationBias || {})) assert.ok(+k >= 1 && +k <= 9 && v > 0 && v <= 4, `${r.id} occ`);
    assert.ok(r.src.length >= 1 && r.src.every((u) => u.startsWith('https://')), r.id);
  }
});
