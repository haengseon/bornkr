import test from 'node:test';
import assert from 'node:assert/strict';
import { HOUSING_REGIONAL_A as H } from '../../src/data/housing-regional-a.js';
import { REGIONS_A } from '../../src/data/regions-a.js';

const Y = H.meta.years, F = ['sale', 'jeonse', 'rentDeposit', 'rentMonthly'];
const ids = REGIONS_A.map(r => r.id);
const med = a => a.sort((x, y) => x - y)[a.length >> 1];

test('66개 키 완전성·값 양수/null·필드', () => {
  assert.equal(ids.length, 66);
  for (const id of ids) {
    const r = H[id]; assert.ok(r, id);
    assert.ok(['apt84', 'house', 'tier-est'].includes(r.basis) && ['measured', 'estimated'].includes(r.kind) && r.note.length <= 80, id);
    for (const f of F) for (const y of Y) { const v = r[f][y]; assert.ok(v === null || v > 0, `${id}.${f}.${y}`); }
  }
});
test('서울 2025 중위값 12~15억, 서열', () => {
  const m = med(ids.filter(i => i.startsWith('seoul.')).map(i => H[i].sale[2025]));
  assert.ok(m >= 120000 && m <= 150000, m);
  const s = i => H['seoul.' + i].sale[2025];
  for (const a of ['gangnam', 'seocho', 'songpa']) for (const b of ['dobong', 'gangbuk', 'jungnang']) assert.ok(s(a) > s(b) * 2);
});
test('전세<매매, 연도별 증가(1990~2020), 2022 하락 허용=2025·2026 비교만', () => {
  for (const id of ids) {
    const r = H[id];
    for (const y of Y) if (r.sale[y] !== null) assert.ok(r.jeonse[y] < r.sale[y], `${id} ${y}`);
    const ys = Y.filter(y => y <= 2025 && r.sale[y] !== null);
    for (let i = 1; i < ys.length; i++) assert.ok(r.sale[ys[i]] >= r.sale[ys[i - 1]] * (ys[i] === 2023 ? 0.85 : 0.95), `${id} ${ys[i]}`);   // 2023: KB 서울 2022-09 12.76억 → 2023-07 11.82억 하락(R20)
  }
});
test('신설 전 null', () => assert.equal(H['incheon.yeonsu'].sale[1990], null));
