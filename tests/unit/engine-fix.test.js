// QA 수정(엔진·밸런스) 회귀 테스트. docs/impl/engine-fix-notes.md 참고.
import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../../src/engine/index.js';
import { makeCtx } from '../../src/engine/life.js';
import { fill } from '../../src/engine/text.js';
import { leanOdds, nudge } from '../../src/engine/stats.js';

const life = seed => E.runToEnd(E.newLife({ seed }));

test('QA-S-02: 선택지가 1개면 묻지 않고 기본 결과를 적용한다(forced)', () => {
  const L = E.newLife({ seed: 42 });
  const ctx = makeCtx(L, 'c');
  assert.equal(ctx.ask({ eventId: 'sys.edu.path', options: ['work'], defaultId: 'work' }), false);
  assert.equal(L.pending, null);
  assert.ok(L.choices.at(-1).forced);
});

test('QA-S-03: 생활비 부족 신용대출은 max(3,000, 연소득×3)을 넘지 않는다', () => {
  const L = E.newLife({ seed: 43 });
  L.flags.indep = L.year; L.year = 2025; L.money.income = 2000;
  makeCtx(L, 'c').act.spend(50_000);
  assert.ok(L.money.loans.credit <= 6000, `${L.money.loans.credit}`);
});

test('QA-S-16: 변형 배열은 같은 생애에서 모두 쓰기 전에는 반복하지 않는다', () => {
  const ctx = makeCtx(E.newLife({ seed: 44 }), 'c');
  const got = new Set(Array.from({ length: 4 }, () => fill(['가', '나', '다', '라'], {}, ctx)));
  assert.equal(got.size, 4);
});

test('QA-E-13: peers(L)는 출생 시점엔 가볍고, 끝까지 가면 즉시 계산과 같다', () => {
  const A = E.newLife({ seed: 45 });
  const early = E.peers(A);
  assert.equal(early.length, 3);
  assert.ok(early.every(p => p.deathAge == null && Object.keys(p.lines).length === 0));
  E.runToEnd(A);
  const B = life(45);
  assert.deepEqual(E.peers(A), E.peers(B));
  assert.ok(E.peers(B).every(p => p.deathAge != null));
});

test('QA-E-15·16, S-13: 판정 이유 줄에 %·분위 없음, 사망 줄은 나이·연도 반복 없음, 민감 중립 문구는 범주당 1줄', () => {
  for (let s = 1; s <= 120; s++) {
    const sum = E.summarize(life(9000 + s), { peers: false });
    for (const l of sum.verdict.lines) assert.ok(!/\d\s*%|분위/.test(l), l);
    const last = sum.timeline.at(-1);
    assert.ok(!/^\d+세, \d+년$/.test(last.text), last.text);
    const sens = sum.timeline.filter(t => t.sensitive).map(t => t.text);
    assert.equal(new Set(sens).size, sens.length, sens.join('|'));
  }
});

test('선택의 방향(GDD §13.1): lean이 쌓이면 구조 오즈가 ×0.6~×1.6 안에서 바뀌고, 해마다 옅어진다', () => {
  const L = E.newLife({ seed: 46 });
  nudge(L, 'relations', 5);
  assert.equal(L.lean.relations, 1);
  const o = leanOdds(L, 'relations');
  assert.ok(o > 1.5 && o < 1.7, `${o}`);
  E.advanceYear(L);
  assert.ok(L.lean.relations < 1);
});

test('PROCESS-V2 이정표: major ChoiceReq에 topic·chapter·options[].effects/risk, 결정 로그에 result·why·impact', () => {
  const topics = new Set();
  for (let s = 1; s <= 40; s++) {
    const L = E.newLife({ seed: 7700 + s });
    while (L.alive) {
      const r = E.advanceYear(L);
      assert.equal(typeof r.summary, 'boolean');
      assert.ok(r.chapter?.n >= 1 && r.chapter?.n <= 10);
      if (!r.choice) continue;
      const c = r.choice;
      if (c.major) {
        topics.add(c.topic);
        assert.ok(c.chapter >= 0 && c.timeoutMs === 20000);
        assert.ok(c.options.every(o => Array.isArray(o.effects) && ['low', 'mid', 'high'].includes(o.risk)));
      }
      E.choose(L, c.defaultId, { auto: true });
    }
    for (const e of L.log.filter(x => x.decision)) {
      assert.ok(['success', 'hold', 'regret'].includes(e.result) && e.why && e.impact);
    }
    const perYear = {};
    for (const e of L.log.filter(x => x.major && !x.decision)) perYear[e.age] = (perYear[e.age] || 0) + 1;
    assert.ok(Object.values(perYear).every(n => n <= 2));
  }
  for (const t of ['career', 'job', 'housing']) assert.ok(topics.has(t), t);
});
