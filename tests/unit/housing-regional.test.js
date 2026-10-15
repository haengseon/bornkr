import test from 'node:test';
import assert from 'node:assert/strict';
import { regionalPrice as P, regionalRow } from '../../src/data/housing-regional.js';
import { cpiMult } from '../../src/ui/format.js';
import { SGG } from '../../src/engine/sigungu.js';
import { priceAt, rentAt } from '../../src/engine/act.js';
import { marketLineOf } from '../../src/ui/profile.js';

const real = (id, y, k = 'sale') => P(id, y, k).real;

test('230개 시군구 모두 조회되고 1960~2050 양수', () => {
  for (const id of SGG.keys()) for (const y of [1960, 1975, 1990, 2003, 2026, 2050]) {
    const r = P(id, y); assert.ok(r && r.real > 0 && Number.isFinite(r.real), `${id} ${y}`);
  }
  assert.equal(P('nowhere', 2000), null);
});

test('서열: 강남 > 노원, 군 지역 < 광역시 중심', () => {
  for (const y of [1990, 2005, 2025]) {
    assert.ok(real('seoul.gangnam', y) > real('seoul.nowon', y), y);
    assert.ok(real('jeonnam.haenam', y) < real('gwangju.seo', y), y);
    assert.ok(real('gyeongnam.hadong', y) < real('busan.haeundae', y), y);
  }
});

test('연도 증가(명목): 1990→2021 단조, 외환위기·2022 하락 예외', () => {
  for (const id of ['seoul.gangnam', 'seoul.nowon', 'busan.haeundae', 'jeonnam.haenam']) {
    let prev = 0;
    for (let y = 1990; y <= 2021; y++) {
      const v = P(id, y).value;
      assert.ok(v >= prev * (y === 1998 ? 0.8 : 0.999), `${id} ${y}`); prev = v;
    }
  }
});

test('실질 변환 = 명목 × cpiMult(ui/format)', () => {
  for (const y of [1970, 1985, 1997, 2013, 2025, 2030]) {
    const r = P('seoul.mapo', y);
    assert.ok(Math.abs(r.real - r.value * cpiMult(y).m) < 1e-6, y);
  }
});

test('보간 경계: 표 연도는 원값, 사이값은 양 끝 사이, null은 인접 연도로', () => {
  const row = regionalRow('seoul.gangnam');
  for (const y of [1990, 2000, 2025, 2026]) assert.ok(Math.abs(P('seoul.gangnam', y).value - row.sale[y]) < 1e-6, y);
  const a = row.sale[2010], b = row.sale[2015], m = P('seoul.gangnam', 2012).value;
  assert.ok(m > Math.min(a, b) && m < Math.max(a, b));
  assert.ok(P('daegu.gunwi', 1993).real > 0);                    // 1990~2000 null → 2005 값에서 곡선 외삽
  assert.equal(P('seoul.gangnam', 2030).est, true);
});

test('엔진: 시군구가 있으면 지역 시세, 없으면 등급표', () => {
  assert.equal(priceAt(5, 2025, 'seoul.gangnam'), real('seoul.gangnam', 2025));
  assert.equal(priceAt(3, 2025), 45000);
  assert.ok(rentAt(5, 2025, false, 'seoul.gangnam').rent > rentAt(1, 2025, false, 'jeonnam.haenam').rent);
});

test('거주 카드 시세 한 줄: 약만 붙고 [추정] 없음', () => {
  const m = marketLineOf({ year: 2010, home: { sigungu: 'seoul.nowon', tenure: 'jeonse' } });
  assert.match(m.text, /^이 지역 전세 시세 약 /);
  assert.match(m.today, /2026년 환산 약/);
  assert.doesNotMatch(m.text + m.today, /추정/);
  assert.match(marketLineOf({ year: 2025, home: { sigungu: 'jeonnam.haenam', tenure: 'own' } }).text, /단독주택/);
});
