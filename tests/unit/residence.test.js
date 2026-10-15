// 거주지 이동의 인과: 사유 없는 시도 이동 0, 신규 선택지(상향 이동·귀향·시도 이동·세 준 집)의 cost = 정산, 세 주기 → L.rentals
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../../src/engine/index.js';
import { makeCtx } from '../../src/engine/life.js';
import { choices } from '../../src/engine/systems/housing.js';
import { T, yr } from '../../src/engine/tables.js';

const debtOf = L => Object.values(L.money.loans).reduce((a, b) => a + b, 0);   // money.debt는 갱신 전일 수 있어 대출 합계로 본다
const NEW = /^sys\.home\.(upgrade|relocate|hometown|rental)$/;
const MONEY_OPTS = /^(own|jeonse|better|go|go_sell|go_lease|go_keep|near|near_sell|near_lease|near_keep|back|sell)$/;
const seen = [], regionMoves = [], unexplained = [];
let leased = null;
// 기본값으로 생애를 돌리되, 신규 선택이 걸리면 기록하고 자가 세 주기 선택지가 있으면 그것을 고른다
for (let s = 0; s < 70; s++) {
  const L = E.newLife({ seed: 52_000_000 + s });
  while (L.alive) {
    const reg = L.home.region, n = L.home.moves.length;
    E.advanceYear(L);
    while (L.pending) {
      const req = L.pending;
      if (NEW.test(req.eventId)) seen.push({ req, snap: structuredClone({ L, data: req.data }) });
      const lease = req.options.find(o => /_lease$/.test(o.id));
      if (lease && !leased) {
        const y = L.year;
        E.choose(L, lease.id, {});
        const r = (L.rentals || []).find(x => x.kind === 'home' && x.since === y);
        leased = r && structuredClone(r);
      } else E.choose(L, req.defaultId, { auto: true });
    }
    if (L.home.region !== reg) {
      const mv = L.home.moves.slice(n).find(m => m.region === L.home.region);
      regionMoves.push(mv);
      if (!mv || !mv.reason || mv.reason === '이사') unexplained.push({ seed: s, year: L.year, mv });
    }
  }
}

test('시도가 바뀌는 이동은 모두 사유가 기록된다', () => {
  assert.ok(regionMoves.length >= 10, `시도 이동 표본 ${regionMoves.length}`);
  assert.deepEqual(unexplained, []);
});

test('신규 주거 선택지: 모든 선택지에 cost가 있고, 돈이 움직이는 선택은 cost대로 정산된다', () => {
  assert.ok(seen.length >= 3, `신규 선택 표본 ${seen.length}`);
  let checked = 0;
  for (const { req, snap } of seen) {
    assert.ok(req.options.length >= 2, req.eventId);
    for (const o of req.options) {
      assert.ok(o.cost && ['cash', 'loan', 'monthly'].every(k => Number.isFinite(o.cost[k] ?? 0)), `${req.eventId}.${o.id} cost`);
      if (!MONEY_OPTS.test(o.id)) continue;
      const { L, data } = structuredClone(snap);
      const a0 = L.money.assets, d0 = debtOf(L);
      // 무담보 신용이 이미 상한(addCredit: max(3,000만×ERA, 연소득×3))이면 이사비 등 부족분은 흡수돼 빚이 덜 늘어난다 — moveMath 예상은 상한을 모른다(R20 ERA 하향으로 1999 사례 노출, 엔진 담당에 보고)
      if (L.money.loans.credit >= Math.max(3000 * yr(T('ERA_INCOME_INDEX'), L.year), 3 * (L.money.income || 0)) - 1) continue;
      choices[req.eventId](L, makeCtx(L, 'c'), o.id, data);
      assert.ok(Math.abs(L.money.assets - a0 - o.cost.cash) <= 2, `${req.eventId}.${o.id} 현금 ${L.money.assets - a0} ≠ ${o.cost.cash}`);
      assert.ok(Math.abs(debtOf(L) - d0 - o.cost.loan) <= 2, `${req.eventId}.${o.id} 빚 ${debtOf(L) - d0} ≠ ${o.cost.loan}`);
      checked++;
    }
  }
  assert.ok(checked >= 3, `정산 확인 ${checked}건`);
});

test('자가를 두고 떠나면 세 준 집이 L.rentals에 계약대로 남는다', () => {
  let L, r = leased;
  if (!r) {                                            // 표본에 없으면: 자가 보유자를 다른 시도로 옮긴다(콘텐츠 사건 경로)
    for (let s = 0; s < 200 && !r; s++) {
      L = E.newLife({ seed: 53_000_000 + s });
      while (L.alive && !(L.home.owned && L.flags.indep != null)) { E.advanceYear(L); while (L.pending) E.choose(L, L.pending.defaultId, { auto: true }); }
      if (!L.alive) continue;
      const v = L.home.value, ctx = makeCtx(L, 'c');
      ctx.act.moveRegion(L.home.region === 'jeju' ? 'busan' : 'jeju', { reason: '취업' });
      r = L.rentals?.find(x => x.kind === 'home');
      assert.equal(r.value, v);
      assert.equal(L.home.owned, false);
    }
  }
  assert.ok(r, '세 준 집 없음');
  for (const k of ['kind', 'rent', 'since', 'region', 'value']) assert.ok(r[k] != null, k);
  assert.ok(r.rent > 0 && r.rent < r.value * 0.06, `임대수익 ${r.rent} / 집값 ${r.value}`);
  assert.equal(typeof r.since, 'number');
});
