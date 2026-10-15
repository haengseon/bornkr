import { test } from 'node:test';
import assert from 'node:assert/strict';
import E from '../../src/content/events/life-c.js';
import { eventFrom } from '../../src/engine/anachro.js';
import { STAT_KEYS, ISSUE_KEYS, SENSITIVE } from '../../src/engine/constants.js';

const opts = e => e.choice?.options ?? [];
test('80건 이상·id 유일·접두', () => {
  assert.ok(E.length >= 80);
  const ids = E.map(e => e.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const id of ids) assert.match(id, /^life\.c\.[a-z]+(\.[a-z]+)*$/);
});
test('스키마: ages·p·tags·text·fx 한도', () => {
  for (const e of E) {
    assert.ok(e.ages[0] >= 45 && e.ages[1] <= 100 && e.ages[0] <= e.ages[1], e.id);
    assert.ok((e.p >= 0.03 && e.p <= 0.12) || (e.once && e.p <= 0.35), `${e.id} p`);
    assert.ok(e.once || e.cooldown > 0, e.id);
    assert.deepEqual(e.tags, ['life']);
    assert.ok(typeof e.reason === 'string' && e.reason.length > 0, e.id);
    if (e.years) assert.ok(e.years[0] <= e.years[1], e.id);
    if (e.sensitive) assert.ok(SENSITIVE.includes(e.sensitive), e.id);
    assert.ok(e.text.length <= 40, `${e.id} 텍스트 ${e.text.length}자`);
    const fxs = [e.fx, ...opts(e).map(o => o.fx)].filter(Boolean);
    for (const fx of fxs) {
      for (const [k, v] of Object.entries(fx.stats ?? {})) assert.ok(STAT_KEYS.includes(k) && Math.abs(v) <= 5, `${e.id} ${k}`);
      for (const [k, v] of Object.entries(fx.issues ?? {})) assert.ok(ISSUE_KEYS.includes(k) && Math.abs(v) <= 6, `${e.id} ${k}`);
    }
    if (e.choice) {
      const os = opts(e);
      assert.ok(os.length >= 2 && os.length <= 3, e.id);
      assert.ok(os.some(o => o.id === e.choice.default), e.id);
      for (const o of os) {
        assert.ok(o.label.length <= 14, `${e.id} label ${o.label.length}자`);
        assert.ok(o.result && o.result.length > 0, e.id);
        assert.ok(!o.do, `${e.id}: 이사/상태 변경 금지`);
      }
    }
  }
});
test('선택 사건 비율 15~25%', () => {
  const r = E.filter(e => e.choice).length / E.length;
  assert.ok(r >= 0.15 && r <= 0.25, String(r));
});
test('when은 성긴 L에서도 예외 없음', () => {
  for (const e of E) if (e.when) for (const L of [{}, { family: {}, home: {}, job: {}, health: { conditions: [] }, year: 2000, age: 60 }]) assert.doesNotThrow(() => e.when(L), e.id);
});
test('시대어휘 가드: years 시작 연도가 문구 요구 연도 이상', () => {
  for (const e of E) assert.ok((e.years?.[0] ?? 1960 + e.ages[0]) >= eventFrom(e), `${e.id} 요구 ${eventFrom(e)}`);
});
