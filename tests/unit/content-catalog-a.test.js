// 카탈로그 변환(1/2, KR-001~125) 스키마·안전 검증.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import ev from '../../src/content/events/catalog-a.js';
import { FAMILY_HISTORY_EXT as FH } from '../../src/content/family-history-ext.js';
import { SOURCES } from '../../src/data/sources.js';
import { STAT_KEYS, ISSUE_KEYS, SENSITIVE } from '../../src/engine/constants.js';

const sents = s => (s.match(/[.!?](?=\s|$)/g) || []).length;
const dist = (a, b) => {
  let d = 0;
  for (const g of ['stats', 'issues']) for (const k of new Set([...Object.keys(a?.[g] ?? {}), ...Object.keys(b?.[g] ?? {})])) d += Math.abs((a?.[g]?.[k] ?? 0) - (b?.[g]?.[k] ?? 0));
  return d;
};
const mk = (year, age, region) => ({ year, age, birth: { urban: true }, home: { region }, job: { status: 'employed' }, edu: { stage: 'done' } });

test('catalog-a 사건: 스키마·길이·id 유일·p·src', () => {
  assert.equal(new Set(ev.map(e => e.id)).size, ev.length);
  for (const e of ev) {
    assert.match(e.id, /^ext\.kr\d{3}$/);
    assert.ok(e.ages[0] <= e.ages[1] && e.years[0] <= e.years[1], e.id);
    assert.ok(e.years[1] - e.ages[0] >= 1960 + 2, `${e.id}: 1960년생 이후 주인공과 창이 3개 코호트 이상 겹쳐야 함`);
    assert.ok(typeof e.p === 'number' && e.p > 0 && e.p <= 0.15, `${e.id}: p`);
    assert.ok(e.once || e.cooldown >= 3, `${e.id}: once/cooldown`);
    assert.ok(e.text.length <= 60 && sents(e.text) <= 2 && e.reason.length <= 30, e.id);
    assert.ok(!e.sensitive || SENSITIVE.includes(e.sensitive));
    for (const s of e.src) assert.ok(SOURCES[s], `${e.id}: 출처 ${s} 미등록`);
    const o = e.choice.options;
    assert.ok(o.length >= 2 && o.length <= 3 && o.some(x => x.id === e.choice.default));
    for (const x of o) {
      assert.ok(x.label.length <= 14 && x.result && sents(x.result) === 1 && x.result.length <= 40, `${e.id}/${x.id}`);
      for (const [k, v] of Object.entries(x.fx.stats ?? {})) assert.ok(STAT_KEYS.includes(k) && Math.abs(v) <= 8);
      for (const [k, v] of Object.entries(x.fx.issues ?? {})) assert.ok(ISSUE_KEYS.includes(k) && Math.abs(v) <= 12);
    }
    for (let i = 0; i < o.length; i++) for (let j = i + 1; j < o.length; j++) assert.ok(dist(o[i].fx, o[j].fx) >= 3, `${e.id}: 효과 차`);
    assert.doesNotThrow(() => e.when({ year: 2000, age: e.ages[0] }));
    assert.doesNotThrow(() => e.when(mk(e.years[0], e.ages[0], 'seoul')));
  }
});

test('조건: 평준화는 시행 지역·연도 이후만, 야간 수업은 재직자만', () => {
  const e = id => ev.find(x => x.id === id);
  assert.equal(e('ext.kr116').when(mk(1974, 14, 'seoul')), true);
  assert.equal(e('ext.kr116').when(mk(1974, 14, 'daegu')), false);
  assert.equal(e('ext.kr116').when(mk(1975, 14, 'daegu')), true);
  assert.equal(e('ext.kr116').when(mk(1976, 14, 'jeju')), false);
  assert.equal(e('ext.kr108').when({ ...mk(1977, 17, 'seoul'), job: { status: 'none' } }), false);
});

test('family-history-ext: id 유일·길이·cohorts·src 등록', () => {
  assert.equal(new Set(FH.map(f => f.id)).size, FH.length);
  for (const f of FH) {
    assert.ok(f.line.length <= 40 && sents(f.line) === 1, f.id);
    assert.ok(f.cohorts[0] >= 1960 && f.cohorts[0] <= f.cohorts[1], f.id);
    assert.ok(SOURCES[f.src], `${f.id}: 출처 ${f.src}`);
  }
});
