// R13 거주지 가격 C 합리성
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { HOUSING_REGIONAL_C as H } from '../../src/data/housing-regional-c.js';

const ids = [...fs.readFileSync('src/data/regions-c.js', 'utf8').matchAll(/^r\('([a-z.]+)'/gm)].map((m) => m[1]);
const Y = H.meta.years;
const keys = Object.keys(H).filter((k) => k !== 'meta');

test('77개 키 완전성', () => {
  assert.equal(ids.length, 77);
  assert.deepEqual([...keys].sort(), [...ids].sort());
});
test('양수/null, 전세<매매, 2025>1990', () => {
  for (const k of keys) {
    const x = H[k];
    for (const f of ['sale', 'jeonse', 'rentDeposit', 'rentMonthly'])
      for (const y of Y) { const v = x[f][y]; assert.ok(v === null || v > 0, `${k} ${f} ${y}`); }
    for (const y of Y) if (x.sale[y] && x.jeonse[y]) assert.ok(x.jeonse[y] < x.sale[y], `${k} ${y}`);
    assert.ok(x.sale[2025] > x.sale[1990], k);
    assert.ok(['apt84', 'house', 'tier-est'].includes(x.basis) && ['measured', 'estimated'].includes(x.kind));
    assert.ok(x.note.length <= 80, k);
  }
});
test('중심 도시 > 인근 군', () => {
  const gt = (a, b) => assert.ok(H[a].sale[2025] > H[b].sale[2025], `${a} > ${b}`);
  gt('gyeongnam.changwon', 'gyeongnam.haman'); gt('gyeongnam.changwon', 'gyeongnam.uiryeong');
  gt('jeonbuk.jeonju', 'jeonbuk.jinan'); gt('jeonbuk.jeonju', 'jeonbuk.imsil');
  gt('gyeongbuk.pohang', 'gyeongbuk.yeongdeok'); gt('gyeongbuk.pohang', 'gyeongbuk.uljin');
  gt('jeonnam.suncheon', 'jeonnam.gokseong'); gt('gyeongbuk.gumi', 'gyeongbuk.seongju');
});
test('조선 불황: 거제 2015>2020', () => assert.ok(H['gyeongnam.geoje'].sale[2015] > H['gyeongnam.geoje'].sale[2020]));
