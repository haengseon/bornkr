import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../../src/engine/index.js';

function runUntil(pred, tries = 300) {
  for (let s = 0; s < tries; s++) {
    const L = E.newLife({ seed: 41_000_000 + s });
    for (let i = 0; i < 110 && L.alive; i++) {
      E.advanceYear(L);
      if (L.pending && pred(L.pending)) return { L, req: L.pending };
      if (L.pending) E.choose(L, L.pending.defaultId, { auto: true });
    }
  }
  return null;
}
test('실직 뒤 선택지: 비용이 붙고, 선택이 자산·고민·상태에 반영된다', () => {
  const r = runUntil(q => q.eventId === 'sys.job.lost');
  assert.ok(r, '실직 선택이 한 번도 안 나옴');
  const { L, req } = r;
  assert.ok(req.options.length >= 2 && req.options.every(o => o.cost));
  const before = { a: L.money.assets, d: L.money.debt, job: L.issues.job, st: L.job.status };
  const pick = req.options.find(o => o.id === 'learn') || req.options[0];
  E.choose(L, pick.id, {});
  const after = { a: L.money.assets, d: L.money.debt, job: L.issues.job, st: L.job.status, flags: L.flags.lostPlan };
  assert.ok(L.flags.lostPlan?.opt === pick.id);
  assert.ok(after.a !== before.a || after.d !== before.d || after.job !== before.job || after.st !== before.st);
});
test('임대 만료 선택지: 보증금·월세가 계획대로 정산된다', () => {
  const r = runUntil(q => q.eventId === 'sys.home.expire');
  assert.ok(r, '임대 만료 선택이 한 번도 안 나옴');
  const { L, req } = r;
  const plan = req.data.plans.find(p => p.id === 'down') || req.data.plans[0];
  E.choose(L, plan.id, {});
  if (plan.tenure !== 'family') { assert.equal(L.home.deposit, plan.newDep); assert.equal(L.home.rent, plan.rent); }
  assert.equal(L.flags.lastExpire.opt, plan.id);
});
