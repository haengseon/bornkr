// life-b 사건 스키마·시대어휘·when 안전성 검증.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import EV from '../../src/content/events/life-b.js';
import { eventFrom, needYear } from '../../src/engine/anachro.js';
import { STAT_KEYS, ISSUE_KEYS } from '../../src/engine/constants.js';
import { SOURCES } from '../../src/data/sources.js';
import youth from '../../src/content/events/youth.js';
import mid from '../../src/content/events/mid.js';

const stubs = [
  {}, { year: 1985, age: 30 },
  { year: 2005, age: 40, sex: 'F', home: {}, money: {}, birth: {}, job: {}, family: {}, stats: {}, health: {}, edu: {}, mil: {} },
  { year: 2026, age: 30, sex: 'M', home: { tenure: 'jeonse', parents: false, owned: true }, money: { debt: 5 }, mil: { status: 'serving' }, edu: { stage: 'college', college: {} },
    job: { status: 'employed', regular: true }, health: { smoker: true },
    family: { partner: {}, married: true, marriedYear: 2026, children: [{ birthYear: 2025, alive: true }], parents: { father: { alive: true } } } },
];

test('life-b: 90건 이상, id 유일·접두, 선택 사건 15~25%', () => {
  assert.ok(EV.length >= 90, `${EV.length}`);
  const ids = EV.map(e => e.id);
  assert.equal(new Set(ids).size, ids.length);
  const other = new Set([...youth, ...mid].map(e => e.id));
  for (const id of ids) { assert.match(id, /^life\.b\./); assert.ok(!other.has(id), id); }
  const ch = EV.filter(e => e.choice).length / EV.length;
  assert.ok(ch >= 0.15 && ch <= 0.25, `choice ${ch}`);
});

test('life-b: 스키마(ages 19~44, p, text ≤40, fx 범위, tags)', () => {
  for (const e of EV) {
    assert.ok(e.ages[0] >= 19 && e.ages[1] <= 44 && e.ages[0] <= e.ages[1], e.id);
    if (e.years) assert.ok(e.years[0] >= 1979 && e.years[1] <= 2050 && e.years[0] <= e.years[1], e.id);
    assert.ok(e.p >= 0.03 && e.p <= 0.4, `${e.id} p`);
    assert.ok(e.once || e.cooldown >= 2, e.id);
    assert.ok(typeof e.text === 'string' && e.text.length <= 40, `${e.id} ${e.text.length}`);
    assert.ok(e.reason && e.reason.length <= 40, e.id);
    assert.deepEqual(e.tags, ['life']);
    if (e.src) assert.ok(e.src.every(s => SOURCES[s]), e.id);
    const fxs = e.choice ? e.choice.options.map(o => o.fx) : [e.fx];
    for (const fx of fxs) {
      for (const [k, v] of Object.entries(fx.stats ?? {})) assert.ok(STAT_KEYS.includes(k) && Math.abs(v) <= 5, `${e.id} ${k}`);
      for (const [k, v] of Object.entries(fx.issues ?? {})) assert.ok(ISSUE_KEYS.includes(k) && Math.abs(v) <= 6, `${e.id} ${k}`);
    }
  }
});

test('life-b: 선택 사건 형식(2~3개, label ≤14, result, default, 이사 없음)', () => {
  for (const e of EV.filter(x => x.choice)) {
    const o = e.choice.options;
    assert.ok(o.length >= 2 && o.length <= 3, e.id);
    assert.ok(o.some(x => x.id === e.choice.default), e.id);
    assert.ok(e.choice.prompt && e.choice.prompt.length <= 60, e.id);
    for (const x of o) { assert.ok(x.label.length <= 14 && x.result, `${e.id}.${x.id}`); assert.ok(!x.do, e.id); }
  }
});

test('life-b: when 예외 없음(성긴 L 포함)', () => {
  for (const e of EV) for (const L of stubs) assert.doesNotThrow(() => !!e.when?.(L), e.id);
});

test('life-b: 시대어휘 가드(문구가 요구하는 연도 ≤ 사건 시작 연도)', () => {
  for (const e of EV) {
    const from = e.years?.[0] ?? 1979;
    assert.ok(eventFrom(e) <= from, `${e.id} need ${eventFrom(e)} > ${from}`);
    for (const o of e.choice?.options ?? []) assert.ok(needYear(o.result) <= from, `${e.id}.${o.id}`);
  }
});
