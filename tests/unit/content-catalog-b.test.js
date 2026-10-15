// 외부 조사 카탈로그 KR-126~250 변환 사건(catalog-b.js) 스키마·안전 검증.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import EV from '../../src/content/events/catalog-b.js';
import { FAMILY_HISTORY_EXT2 } from '../../src/content/family-history-ext2.js';
import { SOURCES } from '../../src/data/sources.js';
import { SENSITIVE, STAT_KEYS, ISSUE_KEYS } from '../../src/engine/constants.js';

const SRC = readFileSync(new URL('../../src/content/events/catalog-b.js', import.meta.url), 'utf8');
const stubs = [
  {}, { year: 1985, age: 30 },
  { year: 2005, age: 40, sex: 'F', home: {}, money: {}, birth: {}, job: {}, family: {}, stats: {}, health: {} },
  { year: 2026, age: 70, sex: 'M', home: { regionGroup: 'province', tenure: 'jeonse' }, money: { debt: 1, assets: 5000 }, birth: { month: 5, disability: 'x' },
    job: { status: 'employed', major: '7', code: 87210, firmSize: 'small', title: '택시', years: 9, regular: false },
    family: { partner: {}, married: true, children: [{ birthYear: 2010, disability: 'x' }], parents: { father: { alive: true } }, caringFor: 'x' },
    stats: { wealth: 10, relations: 80 }, health: { conditions: [{ active: true }], disability: 'x' } },
];

test('catalog-b: 125건, id ext.126~250 유일', () => {
  assert.equal(EV.length, 125);
  const ids = EV.map(e => e.id);
  assert.equal(new Set(ids).size, ids.length);
  ids.forEach((id, i) => assert.equal(id, `ext.${126 + i}`));
});

test('catalog-b: 스키마(ages·years·p·text·reason·src)', () => {
  for (const e of EV) {
    const [a0, a1] = e.ages, [y0, y1] = e.years;
    assert.ok(Number.isInteger(a0) && a0 >= 0 && a0 <= a1 && a1 <= 120, e.id);
    assert.ok(y0 >= 1960 && y0 <= y1 && y1 <= 2026, e.id);
    assert.ok(typeof e.p === 'number' && e.p >= 0.02 && e.p <= 0.15, `${e.id} p=${e.p}`);
    assert.ok(e.text.length >= 10 && e.text.length <= 60, `${e.id} text ${e.text.length}자`);
    assert.ok(e.reason && e.reason.length <= 40, e.id);
    assert.ok(!e.sensitive || SENSITIVE.includes(e.sensitive), e.id);
    assert.ok(e.src.length > 0 && e.src.every(s => /^EXT\.H\d\d$/.test(s) && SOURCES[s]), `${e.id} src`);
  }
});

test('catalog-b: 모든 사건에 p 근거 주석', () => {
  assert.equal((SRC.match(/\/\/ p 근거:/g) ?? []).length, EV.length);
});

test('catalog-b: 선택지 2~3개, label ≤14, result 있음, default는 무조건 선택지', () => {
  for (const e of EV) {
    const o = e.choice.options;
    assert.ok(o.length >= 2 && o.length <= 3, e.id);
    assert.equal(new Set(o.map(x => x.id)).size, o.length, e.id);
    assert.ok(o.filter(x => !x.when).length >= 2, `${e.id}: 무조건 선택지 2개 이상`);
    const d = o.find(x => x.id === e.choice.default);
    assert.ok(d && !d.when, `${e.id} default`);
    for (const x of o) {
      assert.ok(x.label.length <= 14, `${e.id} ${x.label}`);
      assert.ok(x.result && x.result.length <= 60, `${e.id}.${x.id} result`);
    }
  }
});

test('catalog-b: fx 범위(stats ≤8, issues ≤12, 키 유효), 선택마다 득실', () => {
  for (const e of EV) {
    for (const x of e.choice.options) {
      for (const [k, v] of Object.entries(x.fx.stats ?? {})) assert.ok(STAT_KEYS.includes(k) && Math.abs(v) <= 8, `${e.id}.${x.id} ${k}`);
      for (const [k, v] of Object.entries(x.fx.issues ?? {})) assert.ok(ISSUE_KEYS.includes(k) && Math.abs(v) <= 12, `${e.id}.${x.id} ${k}`);
      for (const v of Object.values(x.fx.money ?? {})) assert.ok(Math.abs(v) <= 1000, e.id);
      const stats = Object.values(x.fx.stats ?? {});
      assert.ok(stats.length > 0, `${e.id}.${x.id} stats 없음`);
    }
  }
});

test('catalog-b: when·option.when 예외 없음, boolean 반환', () => {
  for (const e of EV) for (const L of stubs) {
    assert.doesNotThrow(() => e.when(L), e.id);
    for (const x of e.choice.options) if (x.when) assert.doesNotThrow(() => x.when(L), `${e.id}.${x.id}`);
  }
});

test('catalog-b: 시대착오 방지 — 통합돌봄(250)은 2026 한정·생일 4월 이후·고령/장애', () => {
  const e = EV.find(x => x.id === 'ext.250');
  assert.deepEqual(e.years, [2026, 2026]);
  const base = { age: 70, health: { conditions: [{ active: true }] }, birth: { month: 2 } };
  assert.equal(!!e.when(base), false);
  assert.equal(!!e.when({ ...base, birth: { month: 6 } }), true);
  assert.equal(!!e.when({ age: 40, birth: { month: 6 }, health: { conditions: [{ active: true }] } }), false);
});

test('catalog-b: 제도 시기 — 연금(145)·주52시간(223)·장기요양 이전 간병(194)', () => {
  const g = id => EV.find(x => x.id === id);
  assert.ok(g('ext.145').years[0] >= 1988);
  assert.ok(g('ext.174').years[0] === 1999);
  assert.ok(g('ext.194').years[1] <= 2007);
  const e223 = g('ext.223');
  assert.ok(e223.years[0] >= 2018);
  assert.equal(!!e223.when({ job: { status: 'employed', firmSize: 'small' } }), false);
  assert.equal(!!e223.when({ job: { status: 'employed', firmSize: 'large' } }), true);
});

test('catalog-b: 가족사 EXT2는 형식 유지(비어 있음)', () => {
  assert.ok(Array.isArray(FAMILY_HISTORY_EXT2));
  for (const f of FAMILY_HISTORY_EXT2) assert.ok(f.line.length <= 40 && f.cohorts.length === 2);
});
