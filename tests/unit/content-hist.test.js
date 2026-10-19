// 역사 통합 콘텐츠(history.js, family-history.js) 스키마·길이·id 유일.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import hist from '../../src/content/events/history.js';
import { EVENTS } from '../../src/content/events/index.js';
import { FAMILY_HISTORY as FH } from '../../src/content/family-history.js';
import { STAT_KEYS, ISSUE_KEYS } from '../../src/engine/constants.js';

const sent = s => (s.match(/[.!?](?=\s|$)/g) || []).length;
const fxOk = fx => {
  for (const [k, v] of Object.entries(fx.stats ?? {})) assert.ok(STAT_KEYS.includes(k) && Number.isInteger(v) && Math.abs(v) <= 8, `stat ${k}`);
  for (const [k, v] of Object.entries(fx.issues ?? {})) assert.ok(ISSUE_KEYS.includes(k) && Number.isInteger(v) && Math.abs(v) <= 12, `issue ${k}`);
};

test('hist 사건: 개수·id·형식', () => {
  assert.ok(hist.length >= 15 && hist.length <= 25);
  const all = EVENTS.map(e => e.id);
  assert.equal(new Set(all).size, all.length);
  for (const e of hist) {
    assert.match(e.id, /^hist\.\d{4}\.[a-z.]+$/);
    assert.ok(e.ages[0] <= e.ages[1] && e.years[0] <= e.years[1] && e.p > 0 && e.p <= 1 && e.once, e.id);
    assert.ok(e.reason.length <= 30 && /^K\d$/.test(e.src[0]), e.id);
    assert.ok(e.text.length <= 40 && sent(e.text) <= 2, `${e.id} text`);
    if (e.fx) fxOk(e.fx);
    if (!e.choice) continue;
    const c = e.choice;
    assert.ok(e.text.length + c.prompt.length <= 60, `${e.id} prompt`);
    assert.ok(c.options.length >= 2 && c.options.length <= 3 && c.options.some(o => o.id === c.default));
    for (const o of c.options) {
      assert.ok(o.label.length <= 14 && o.result.length <= 40 && sent(o.result) === 1, `${e.id}/${o.id}`);
      fxOk(o.fx);
    }
  }
});

test('가족사 문장: 20개 이상, ≤40자, 형식', () => {
  assert.ok(FH.length >= 20);
  assert.equal(new Set(FH.map(f => f.id)).size, FH.length);
  for (const f of FH) {
    assert.ok([...f.line].length <= 40, `${f.id} ${[...f.line].length}자`);
    assert.ok(f.cohorts[0] <= f.cohorts[1] && /^K\d$/.test(f.src), f.id);
    assert.ok(!f.regionGroup || ['rural', 'capital'].includes(f.regionGroup), f.id);
  }
});

import { MILESTONES as MS } from '../../src/content/milestones.js';
const BAN = ['피가', '칼', '때려', '폭행', '흉기', '자해', '자살', '죽고', '죽을', '성폭', '강간', '불쌍', '결핍', '극복', '비정상', '안타깝'];
const fxOk2 = f => { fxOk(f); for (const v of Object.values(f.money ?? {})) assert.ok(Number.isInteger(v) && Math.abs(v) <= 30000); };

test('milestones: 스키마·길이·확률·금지어', () => {
  assert.ok(MS.length >= 30);
  assert.equal(new Set(MS.map(m => m.id)).size, MS.length);
  for (const m of MS) {
    assert.match(m.id, /^ms\.[a-z0-9.]+$/);
    assert.ok(m.ages[0] <= m.ages[1] && m.years[0] <= m.years[1] && m.major && m.topic && m.chapter >= 1, m.id);
    assert.ok(!m.when || typeof m.when === 'function');
    if (m.when) assert.doesNotThrow(() => m.when({ year: 2000, age: m.ages[0] }), m.id);
    const ys = [m.years[0], (m.years[0] + m.years[1]) >> 1, m.years[1]];
    for (const y of ys) {
      const s = typeof m.situation === 'function' ? m.situation({ year: y }) : m.situation;
      assert.ok(s.length <= 90 && sent(s) === 2 && !BAN.some(w => s.includes(w)), `${m.id} situation "${s}" (${sent(s)}문장)`);
    }
    assert.ok(m.options.length >= 2 && m.options.length <= 3 && m.options.some(o => o.id === m.default), m.id);
    for (const o of m.options) {
      assert.ok(o.label.length <= 14 && ['low', 'mid', 'high'].includes(o.risk), `${m.id}/${o.id} label/risk`);
      assert.ok(o.odds.success > 0 && o.odds.hold >= 0 && o.odds.success + o.odds.hold <= 1, `${m.id}/${o.id} odds`);
      fxOk2(o.fx);
      for (const k of ['success', 'hold', 'miss']) {
        const r = o.outcomes[k];
        assert.ok(r.text.length <= 40 && sent(r.text) === 1 && !BAN.some(w => r.text.includes(w)), `${m.id}/${o.id}/${k} "${r.text}"`);
        fxOk2(r.fx);
      }
    }
  }
});
