// 통계 위치 UI(DOM 문자열): 결산 섹션·칩 — 퍼센티지만, 추정은 '약'만, 캐시 공유
import test from 'node:test';
import assert from 'node:assert/strict';
import { newLife, runToEnd } from '../../src/engine/index.js';
import { S } from '../../src/ui/dom.js';
import { standingOf, standingHtml, pctChip } from '../../src/ui/standing-ui.js';

test('standingHtml: 순서·라벨·막대, 금액·분위·[추정] 없음', () => {
  for (const seed of [1, 2, 3, 4, 5]) {
    const L = newLife({ seed }); runToEnd(L);
    const st = standingOf(L, 'end'), h = standingHtml(st);
    assert.equal(standingOf(L, 'end'), st, '같은 생애·시점은 S.standing 캐시 재사용');
    assert.equal(S.standing.v, st);
    assert.match(h, /이 생애의 위치/);
    if (st.asset) assert.match(h, /data-stand="asset"[\s\S]*(상위|하위) \d/);
    else assert.doesNotMatch(h, /data-stand="asset"/);
    assert.ok(!/\d+\s*(만\s*)?원|억|분위|\[추정\]/.test(h.replace(/<[^>]+>/g, ' ')), h);
    if (L.death?.sensitive) assert.ok(!/data-stand="cause"/.test(h));
  }
});

test('standingHtml/pctChip: est 는 "약", 사인 막대 = 비율, 없으면 빈 문자열', () => {
  const st = { asset: { pct: 23, label: '상위 23%', basis: 'b', est: true }, cause: { pct: 13, rank: 3, label: '사망 원인 3위 · 13%', basis: 'c', est: false }, notes: [] };
  const h = standingHtml(st);
  assert.match(h, /약 상위 23%/);
  assert.match(h, /data-stand="asset"[\s\S]*--v:77/);
  assert.match(h, /data-stand="cause"[\s\S]*--v:13/);
  assert.ok(h.indexOf('data-stand="asset"') < h.indexOf('data-stand="cause"'));
  assert.equal(standingHtml(null), '');
  assert.equal(pctChip(undefined), '');
  assert.match(pctChip({ label: '상위 5%', est: true }), /aria-label="약 상위 5%">상위 5%</);
});
