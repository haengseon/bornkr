// 사건 본문 변형(content/variants.js, engine/variants.js) 검증. docs/impl/variants-notes.md 참고.
import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../../src/engine/index.js';
import { VARIANTS } from '../../src/content/variants.js';
import { variantText } from '../../src/engine/variants.js';
import { eventById } from '../../src/engine/events.js';
import { needYear } from '../../src/engine/anachro.js';
import { fill } from '../../src/engine/text.js';

const ids = Object.keys(VARIANTS);
const all = ids.flatMap(id => VARIANTS[id].map(v => ({ id, ...v })));
const sentences = t => t.split(/(?<=[.?!"])\s+/).filter(Boolean);

// 다양한 L: 실제 생애 스냅숏 + 연도·성향·형편을 바꾼 변형
function sampleLives() {
  const out = [];
  for (const seed of [1, 2, 3, 4, 5, 6]) {
    const base = E.newLife({ seed });
    for (const year of [1955, 1975, 1985, 1995, 2005, 2015, 2025, 2045]) {
      for (const t of [10, 50, 90]) {
        out.push({ ...base, year, age: 30, traits: { open: t, consc: t, extra: t, agree: t, sens: t }, birth: { ...base.birth, quintile: 1 + (seed % 5), urban: seed % 2 === 0 } });
      }
    }
  }
  out.push({}, { year: 2000 });
  return out;
}

test('VARIANTS: 150개 사건·500문장 이상, 모든 id가 실제 사건', () => {
  assert.ok(ids.length >= 150, `${ids.length}`);
  assert.ok(all.length >= 500, `${all.length}`);
  for (const id of ids) {
    const ev = eventById(id);
    assert.ok(ev, `없는 사건: ${id}`);
    assert.ok(!id.startsWith('job.') && !ev._code, `직업 사건 제외: ${id}`);
    assert.ok(VARIANTS[id].length >= 3, `${id} 변형 3개 미만`);
  }
});

test('when 은 어떤 L 에서도 예외 없이 boolean 을 돌려준다', () => {
  const lives = sampleLives();
  for (const v of all) for (const L of lives) assert.equal(typeof !!v.when(L), 'boolean', v.id);
});

test('변형 문장: 길이·금지어·시대 어휘(anachro)', () => {
  const bad = /깨달|소중|교훈|아름다|감동|행복했다|희망찬|반드시|해야 한다|천만|[0-9]+(?:%|퍼센트)(?!.*3\.3)/;
  for (const v of all) {
    assert.equal(typeof v.text, 'string');
    assert.ok(v.text.length <= 90, `${v.id} 너무 김: ${v.text}`);
    for (const s of sentences(v.text)) assert.ok(s.length <= 40, `${v.id} 문장 ${s.length}자: ${s}`);
    assert.ok(!bad.test(v.text.replace('3.3%', '')), `${v.id} 금지어: ${v.text}`);
    assert.ok(!/\{[^}]*\}/.test(v.text) || /\{\w+(\|[^}]+)?\}/.test(v.text), `${v.id} 변수 문법`);
  }
  // 변형이 쓰일 수 있는 모든 해에서 문구가 요구하는 시대 이전에는 통과하지 않는다
  const lives = sampleLives().filter(L => L.year);
  for (const v of all) for (const L of lives) if (v.when(L)) assert.ok(needYear(v.text) <= L.year, `${v.id} ${L.year}: ${v.text}`);
});

test('variantText: 같은 시드·해에는 같은 결과, 변형이 없거나 조건 밖이면 원문', () => {
  const L = E.newLife({ seed: 77 });
  L.year = 2005; L.age = 25;
  const id = 'youth.friends.meet';
  const a = variantText(id, L, null, 'BASE'), b = variantText(id, L, null, 'BASE');
  assert.equal(a, b);
  // 형성 중인 성향이 문구 조건을 충족하지 않으면 원문을 유지한다.
  assert.ok(a === 'BASE' || VARIANTS[id].some(v => v.text === a));
  assert.equal(variantText('no.such.event', L, null, 'BASE'), 'BASE');
  assert.equal(variantText('youth.pregnant.work', { ...L, sex: 'M', year: 2005 }, null, 'BASE').includes('아내'), true);
  assert.equal(variantText(id, null, null, 'BASE'), 'BASE');
  // 난수 흐름을 소비하지 않는다
  const ctx = { rand: () => { throw new Error('rand 사용'); }, pick: () => { throw new Error('pick 사용'); } };
  assert.doesNotThrow(() => variantText(id, L, ctx, 'BASE'));
});

test('상태 의존 사건은 사실과 어긋나는 변형을 쓰지 않는다', () => {
  const L = E.newLife({ seed: 9 }); L.year = 2005;
  const f = { ...L, sex: 'F' }, m = { ...L, sex: 'M' };
  for (let y = 2000; y < 2040; y++) {
    assert.ok(!/아내/.test(variantText('youth.pregnant.work', { ...f, year: y }, null, 'B')));
    assert.ok(!/배가 불러|입덧/.test(variantText('youth.pregnant.work', { ...m, year: y }, null, 'B')));
  }
  assert.equal(variantText('mid.pension.check', { ...L, money: { ...L.money, pensionYears: 20 } }, null, 'BASE'), 'BASE');
  assert.equal(variantText('youth.checkup', { ...L, health: { ...L.health, smoker: 1 } }, null, 'BASE'), 'BASE');
});

test('통합: 생애를 끝까지 돌려도 변형 문장이 기록되고 같은 시드는 같은 로그', () => {
  const run = seed => E.runToEnd(E.newLife({ seed }));
  const a = run(21), b = run(21);
  assert.deepEqual(a.log.map(e => e.text), b.log.map(e => e.text));
  let hit = 0;
  for (const seed of [1, 2, 3, 4, 5, 6, 7, 8]) {
    for (const e of run(seed).log) if (e.kind === 'event' && VARIANTS[e.id]?.some(v => fill(v.text, {}, null) === e.text)) hit++;
  }
  assert.ok(hit > 20, `변형 사용 ${hit}회`);
});
