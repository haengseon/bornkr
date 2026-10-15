// 지역 상세 데이터 1/3(수도권) 불변식
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { REGIONS_A } from '../../src/data/regions-a.js';

const len = s => [...s].length;
const by = k => REGIONS_A.filter(r => r.sido === k);

test('시도별 개수: 서울 25·인천 10·경기 31', () => {
  assert.equal(by('seoul').length, 25);
  assert.equal(by('incheon').length, 10);
  assert.equal(by('gyeonggi').length, 31);
  assert.equal(REGIONS_A.length, 66);
});

test('id 유일·접두사 일치', () => {
  assert.equal(new Set(REGIONS_A.map(r => r.id)).size, REGIONS_A.length);
  for (const r of REGIONS_A) assert.ok(r.id.startsWith(r.sido + '.'), r.id);
});

test('티어 1~5·kind·est·src', () => {
  for (const r of REGIONS_A) {
    for (const k of ['urban', 'incomeTier', 'housingTier', 'eduTier']) assert.ok(Number.isInteger(r[k]) && r[k] >= 1 && r[k] <= 5, `${r.id}.${k}`);
    assert.ok(['구', '시', '군'].includes(r.kind), r.id);
    assert.equal(typeof r.est, 'boolean');
    assert.ok(r.src.length >= 1 && r.notes && r.commute, r.id);
    assert.ok(r.industries.length >= 2 && r.industries.length <= 3, r.id);
  }
});

test('vibe 길이·dongs ≥3·배수 유효', () => {
  for (const r of REGIONS_A) {
    assert.ok(len(r.vibe) <= 30, `${r.id} vibe ${len(r.vibe)}`);
    assert.ok(r.dongs.length >= 3 && r.dongs.length <= 6, r.id);
    for (const d of r.dongs) {
      assert.ok(len(d.vibe) <= 24, `${r.id}/${d.name} vibe ${len(d.vibe)}`);
      assert.ok(Number.isInteger(d.tier) && d.tier >= 1 && d.tier <= 5, `${r.id}/${d.name}`);
    }
    assert.deepEqual(Object.keys(r.occupationBias), ['1', '2', '3', '4', '5', '6', '7', '8', '9']);
    assert.deepEqual(Object.keys(r.tenureBias), ['own', 'jeonse', 'monthly']);
    for (const v of [...Object.values(r.occupationBias), ...Object.values(r.tenureBias)]) assert.ok(Number.isFinite(v) && v > 0 && v < 6, r.id);
  }
});
