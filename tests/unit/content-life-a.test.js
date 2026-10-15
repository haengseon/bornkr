// 생활 경험 A(0~18세) 스키마·시대어휘 검증
import { test } from 'node:test';
import assert from 'node:assert/strict';
import life from '../../src/content/events/life-a.js';
import { STAT_KEYS, ISSUE_KEYS } from '../../src/engine/constants.js';
import { eventFrom } from '../../src/engine/anachro.js';

const ctx = { pick: a => a[0] };
const texts = e => (typeof e.text === 'function' ? [e.text({ sex: 'M', year: 1990 }, ctx), e.text({ sex: 'F', year: 1990 }, ctx)] : [].concat(e.text));
const sent = s => (s.match(/[.!?](?=\s|$)/g) || []).length;
const dist = (a, b) => { let d = 0; for (const k of STAT_KEYS) d += Math.abs((a.stats?.[k] ?? 0) - (b.stats?.[k] ?? 0)); return d; };

test('규모·선택 사건 비율', () => {
  assert.ok(life.length >= 70, `사건 ${life.length}`);
  const n = life.filter(e => e.choice).length;
  assert.ok(n / life.length >= 0.15 && n / life.length <= 0.25, `선택 비율 ${n}/${life.length}`);
});

test('스키마', () => {
  const ids = life.map(e => e.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const e of life) {
    assert.match(e.id, /^life\.a\./);
    assert.ok(e.ages[0] >= 0 && e.ages[1] <= 18 && e.ages[0] <= e.ages[1], e.id);
    if (e.years) assert.ok(e.years[0] <= e.years[1], e.id);
    assert.ok(e.p >= 0.03 && e.p <= 0.3, `${e.id} p`);
    assert.ok(e.once || e.cooldown >= 3, e.id);
    assert.ok(e.tags.includes('life') && e.reason.length <= 30, e.id);
    if (e.when) for (const L of [{}, { year: 2000, age: 5 }, { birth: {}, family: {} }]) assert.equal(typeof e.when(L), 'boolean', e.id);
    for (const t of texts(e)) { assert.ok(t.length <= 40, `${e.id} 길이 ${t.length}`); assert.ok(sent(t) <= 2 && /[.!?]$/.test(t), `${e.id} 문장`); }
    const fxs = [e.fx, ...(e.choice?.options.map(o => o.fx) ?? [])].filter(Boolean);
    assert.ok(e.choice || e.fx, e.id);
    for (const f of fxs) {
      for (const [k, v] of Object.entries(f.stats ?? {})) assert.ok(STAT_KEYS.includes(k) && Math.abs(v) <= 4, `${e.id} stat ${k}`);
      for (const [k, v] of Object.entries(f.issues ?? {})) assert.ok(ISSUE_KEYS.includes(k) && Math.abs(v) <= 6, `${e.id} issue ${k}`);
    }
    if (e.choice) {
      const o = e.choice.options;
      assert.ok(o.length >= 2 && o.length <= 3 && o.some(x => x.id === e.choice.default), e.id);
      for (const x of o) { assert.ok(x.label.length <= 14, `${e.id}/${x.id} label`); assert.ok(x.result && x.result.length <= 40 && sent(x.result) === 1, `${e.id}/${x.id} result`); }
      for (let i = 0; i < o.length; i++) for (let j = i + 1; j < o.length; j++) assert.ok(dist(o[i].fx, o[j].fx) >= 3, `${e.id} 선택지 차이`);
      assert.ok(texts(e)[0].length + e.choice.prompt.length <= 60, `${e.id} prompt+text`);
    }
  }
});

test('시대어휘 가드: 문구가 요구하는 연도 <= years 시작', () => {
  for (const e of life) assert.ok(eventFrom(e) <= (e.years?.[0] ?? 0) || eventFrom(e) === 0, `${e.id}: ${eventFrom(e)}`);
});
