import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../../src/engine/index.js';
import { realReturns } from '../../src/data/market.js';

test('시장 수익률: 역사적 사건 방향(외환위기 주식↓·환율↑, 2008, 2022 집값↓)', () => {
  assert.ok(realReturns(1997).stock < -0.3 && realReturns(1997).fx > 0.3);
  assert.ok(realReturns(2008).stock < -0.3 && realReturns(2008).fx > 0.2);
  assert.ok(realReturns(1999).stock > 0.5);
  assert.ok(realReturns(2022, 'seoul').realty < 0);
  assert.deepEqual(realReturns(2040), realReturns(2040));          // 미래 시나리오도 결정적
});
test('투자 계획 선택: 비중이 저장되고 이후 해마다 평가손익이 순자산에 반영된다', () => {
  let found = null;
  for (let s = 0; s < 200 && !found; s++) {
    const L = E.newLife({ seed: 61_000_000 + s });
    for (let i = 0; i < 100 && L.alive && !found; i++) {
      E.advanceYear(L);
      if (L.pending?.eventId === 'sys.invest.plan') { found = { L, req: L.pending }; break; }
      if (L.pending) E.choose(L, L.pending.defaultId, { auto: true });
    }
  }
  assert.ok(found, '운용 계획 선택이 안 나옴');
  const { L, req } = found;
  assert.ok(req.options.every(o => o.cost && (o.cost.invest != null || o.cost.note)));
  E.choose(L, 'stock', {});
  assert.ok(L.invest.w.stock >= 0.5);
  let g = 0; for (let i = 0; i < 25 && L.alive; i++) { E.advanceYear(L); if (L.pending) E.choose(L, L.pending.defaultId, { auto: true }); g = L.tally.invGain || 0; if (g) break; }
  assert.ok(L.tally.invGain !== undefined && L.tally.invGain !== 0, '평가손익이 쌓이지 않음');
});
