// 직종 연속성: 재취업·이직이 직전 직종과 무관하게 튀지 않는다(생애 대분류 바뀜 평균 ≤1.2).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../../src/engine/index.js';

test('직업 대분류는 생애 평균 1.2번 넘게 바뀌지 않는다', () => {
  let sw = 0, n = 0;
  for (let s = 0; s < 60; s++) {
    const h = E.runToEnd(E.newLife({ seed: 21_000_000 + s })).job.history.filter(x => x.code && x.code[0] !== 'A');
    if (!h.length) continue; n++;
    for (let i = 1; i < h.length; i++) if (h[i].code[0] !== h[i - 1].code[0]) sw++;
  }
  assert.ok(sw / n <= 1.2, `대분류 바뀜/생애 ${(sw / n).toFixed(2)}`);
});
