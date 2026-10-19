// 조사·문장 버그 회귀(2026-10-19 리뷰): 받침 뒤 '를/와', '사인 없이 으로 생이 멈췄다', '비슷하게 삶'.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { newLife, runToEnd, summarize } from '../../src/engine/index.js';
import { jong } from '../../src/engine/text.js';

const BAD_JOSA = /([가-힣])(를|와)(?=의|[^가-힣]|$)/g;   // 받침 있는 글자 뒤 '를'·'와'는 항상 오류
function josaErrors(s) {
  const out = [];
  for (const m of s.matchAll(BAD_JOSA)) if (jong(m[1])) out.push(s.slice(Math.max(0, m.index - 10), m.index + 6));
  return out;
}

test('생애 기록·결산 문장에 조사 오류와 빈 사인이 없다', () => {
  const errs = [];
  for (let seed = 1; seed <= 5; seed++) {   // 수정 전에는 5생애 모두 사인 누락, 3생애에 "딸와의"류가 나왔다
    const L = newLife({ seed });
    runToEnd(L);
    const texts = [...L.log.map(e => e.text || ''), JSON.stringify(summarize(L))];
    for (const t of texts) {
      errs.push(...josaErrors(t).map(x => `seed${seed}: ${x}`));
      if (/(^|[\s.,"])으?로 생이 멈췄다/.test(t)) errs.push(`seed${seed}: 사인 누락`);
      if (/비슷하게 삶/.test(t)) errs.push(`seed${seed}: 비슷하게 삶`);
      if (/[가-힣]는 상대의 확인/.test(t)) errs.push(`seed${seed}: 시나리오 조사`);
    }
  }
  assert.deepEqual(errs, []);
});
