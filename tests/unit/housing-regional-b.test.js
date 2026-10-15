import { test } from 'node:test';
import assert from 'node:assert/strict';
import { HOUSING_REGIONAL_B as H } from '../../src/data/housing-regional-b.js';
import { REGIONS_B } from '../../src/data/regions-b.js';

const Y = H.meta.years, ids = REGIONS_B.map((r) => r.id), F = ['sale', 'jeonse', 'rentDeposit', 'rentMonthly'];

test('87개 키 완전성', () => {
  assert.equal(ids.length, 87);
  for (const id of ids) assert.ok(H[id], id);
});
test('양수 또는 null, 전세<매매, 보증금<전세', () => {
  for (const id of ids) for (const y of Y) {
    for (const f of F) { const v = H[id][f][y]; assert.ok(v === null || v > 0, `${id} ${f} ${y}`); }
    const { sale, jeonse, rentDeposit } = { sale: H[id].sale[y], jeonse: H[id].jeonse[y], rentDeposit: H[id].rentDeposit[y] };
    if (sale !== null) { assert.ok(jeonse < sale, `${id} ${y}`); assert.ok(rentDeposit < jeonse, `${id} ${y}`); }
  }
});
test('null은 존재 이전(since)과 일치, 세종 2012 이전 null', () => {
  for (const r of REGIONS_B) for (const y of Y) {
    const gone = r.since && y < r.since;
    assert.equal(H[r.id].sale[y] === null, !!gone || (r.id === 'sejong.sejong' && y < 2012), `${r.id} ${y}`);
  }
  assert.ok(H['sejong.sejong'].sale[2015] > 0);
});
test('중심구 > 외곽·군 (2025)', () => {
  const s = (k) => H[k].sale[2025];
  assert.ok(s('busan.haeundae') > s('busan.gijang'));
  assert.ok(s('daegu.suseong') > s('daegu.gunwi'));
  assert.ok(s('daejeon.yuseong') > s('daejeon.daedeok'));
  assert.ok(s('chungbuk.cheongju') > s('chungbuk.boeun'));
  assert.ok(s('gangwon.wonju') > s('gangwon.taebaek'));
});
test('대체로 증가 (최초→2025)', () => {
  for (const id of ids) {
    const a = Y.map((y) => H[id].sale[y]).filter((v) => v !== null);
    assert.ok(a[a.length - 2] >= a[0], id);
  }
});
test('kind·basis·note 형식', () => {
  for (const id of ids) {
    assert.ok(['measured', 'estimated'].includes(H[id].kind));
    assert.ok(['apt84', 'house', 'tier-est'].includes(H[id].basis));
    assert.ok(H[id].note.length <= 80);
  }
});
