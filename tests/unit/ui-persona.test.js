import test from 'node:test';
import assert from 'node:assert/strict';
import { mbtiOf, mbtiText, traitChips } from '../../src/ui/persona.js';
test('persona: 성향 5축 → 4글자(경계 45~55는 흐림), sens 는 글자에 쓰지 않음', () => {
  assert.equal(mbtiText({ extra: 70, open: 60, agree: 52, consc: 30, sens: 90 }), 'ENFP');
  assert.equal(mbtiText({ extra: 10, open: 20, agree: 20, consc: 80 }), 'ISTJ');
  assert.deepEqual(mbtiOf({ extra: 52, open: 40, agree: 50, consc: 49 }).map(x => x.vague), [true, false, true, true]);
});
test('persona: 성향 칩은 ≥65 또는 ≤35 축만, 두드러진 순 상위 2', () => {
  assert.deepEqual(traitChips({ open: 50, consc: 90, extra: 20, agree: 60, sens: 70 }).map(c => c.key), ['consc', 'extra']);
  assert.deepEqual(traitChips({ open: 50, consc: 55, extra: 40, agree: 60, sens: 45 }), []);
});
