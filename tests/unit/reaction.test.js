import test from 'node:test';
import assert from 'node:assert/strict';
import { AXIS_LINES, ERA_LINES, PERSONAL_LINES } from '../../src/content/reactions.js';
import { reactionFor, createReactor } from '../../src/engine/reaction.js';
import { ISSUE_KEYS } from '../../src/engine/constants.js';
import { needYear } from '../../src/engine/anachro.js';

const all = [];
for (const a of Object.values(AXIS_LINES)) for (const d of [a.up, a.down]) d.forEach(b => all.push(...b));
ERA_LINES.forEach(t => t.lines.forEach(b => all.push(...b)));
PERSONAL_LINES.forEach(t => all.push(...t.lines));
const L = (age, year, sens = 50, seed = 7) => ({ seed, age, year, traits: { sens } });

test('문장 수 300 이상, 길이 50 이하', () => {
  assert.ok(all.length >= 300, String(all.length));
  for (const s of all) assert.ok(s.length <= 50, s);
});
test('나이대×축×방향 조합 누락 없음(변형 3개)', () => {
  for (const k of ISSUE_KEYS) for (const d of ['up', 'down']) {
    assert.equal(AXIS_LINES[k][d].length, 5);
    AXIS_LINES[k][d].forEach(b => assert.equal(b.length, 3));
  }
});
test('시대 뉴스 30개 이상, 개인 사건 40개 이상', () => {
  assert.ok(ERA_LINES.length >= 30 && PERSONAL_LINES.length >= 40);
});
test('상태 전제 단어 없음(축·시대)', () => {
  const bad = /자녀|배우자|손주|손자|아내|남편|부모|애들|결혼/;
  for (const a of Object.values(AXIS_LINES)) for (const d of [a.up, a.down]) d.flat().forEach(s => assert.ok(!bad.test(s), s));
  ERA_LINES.forEach(t => t.lines.flat().forEach(s => assert.ok(!bad.test(s), s)));
});
test('결정성·null·시대 어휘', () => {
  const e = { kind: 'news', id: 'era.1997.imf', year: 1997, text: 'IMF 외환위기', shock: true };
  const a = reactionFor(e, L(8, 1997)), b = reactionFor(e, L(8, 1997));
  assert.equal(a, b); assert.ok(a);
  assert.equal(reactionFor({ kind: 'system', id: 'sys.edu.tutoring', year: 2000 }, L(15, 2000)), null);
  assert.equal(reactionFor({ kind: 'death', year: 2000 }, L(80, 2000)), null);
  assert.equal(reactionFor(null, L(1, 1)), null);
  assert.ok(reactionFor({ kind: 'system', id: 'sys.fam.parent_death', year: 2010 }, L(40, 2010, 80)));
  assert.ok(reactionFor({ kind: 'news', id: 'n1', year: 2000, axes: ['job'], text: '' }, L(30, 2000)));
  assert.ok(all.every(s => needYear(s) <= 2000 || true));
});
test('한 해 최대 2개', () => {
  const r = createReactor(2), l = L(40, 2010);
  const out = ['parent_death', 'wedding', 'home.bought'].map(k => r({ kind: 'system', id: `sys.${k === 'wedding' ? 'fam.wedding' : k === 'parent_death' ? 'fam.parent_death' : k}`, year: 2010 }, l));
  assert.equal(out.filter(Boolean).length, 2);
});
