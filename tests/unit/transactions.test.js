import test from 'node:test';
import assert from 'node:assert/strict';
import { newLife } from '../../src/engine/birth.js';
import { makeAct } from '../../src/engine/act.js';
import { withTransactionJournal } from '../../src/engine/transactions.js';

test('자금 기록은 실제 차액만 저장하고 조회·무변화는 거래로 만들지 않는다', () => {
  const L = newLife({ seed: 41 }); L.year += 25; L.age = 25; L.flags.indep = L.year;
  const act = makeAct(L, { sourceEventId: 'life.purchase', sys: () => {} });
  act.gain(100); act.spend(30); act.flag('unchanged', true);
  assert.equal(L.money.assets, 70); assert.equal(L.dailyLife.transactions.length, 2);
  assert.equal(L.dailyLife.transactions[0].delta.financial, 100);
  assert.equal(L.dailyLife.transactions[1].delta.financial, -30);
  assert.equal(L.dailyLife.transactions[1].sourceEventId, 'life.purchase');
});

test('동일 act와 다른 act 객체의 중첩 호출은 최상위 거래로 한 번 기록', () => {
  const L = newLife({ seed: 42 });
  const inner = withTransactionJournal(L, { add: n => { L.money.assets += n; } }, {});
  const outer = withTransactionJournal(L, { transfer: () => { inner.add(10); inner.add(20); } }, {});
  outer.transfer();
  assert.equal(L.dailyLife.transactions.length, 1);
  assert.equal(L.dailyLife.transactions[0].operation, 'transfer');
  assert.equal(L.dailyLife.transactions[0].delta.financial, 30);
});

test('모형1에는 새 거래 상태를 생성하지 않고 부모 가구 이전은 개인 현금과 구분', () => {
  const old = newLife({ seed: 43, modelVersion: 1 });
  makeAct(old, {}).gain(10); assert.equal(old.dailyLife, undefined);
  const L = newLife({ seed: 43 }); const before = L.household.netWorth;
  makeAct(L, {}).gain(10);
  assert.equal(L.household.netWorth, before + 10);
  assert.equal(L.dailyLife.transactions[0].delta.household, 10);
  assert.equal(L.dailyLife.transactions[0].delta.financial, 0);
});
