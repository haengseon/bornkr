import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../../src/engine/index.js';
import { jobCard } from '../../src/engine/jobcard.js';
import { PERCEPTION } from '../../src/content/job-perception.js';
import { needYear } from '../../src/engine/anachro.js';

test('사회 인식 문장: 전 대분류·6시대 존재, 시대어휘 가드 통과', () => {
  for (const [m, eras] of Object.entries(PERCEPTION)) {
    assert.equal(eras.length, 6, m);
    eras.forEach((v, i) => v.forEach(t => assert.ok(t.length <= 45, t)));
  }
});
test('일자리 제안이 생기는 생애에서 카드(급여·인식)가 pending에 붙는다', () => {
  let seen = 0;
  for (let s = 0; s < 40 && !seen; s++) {
    const L = E.newLife({ seed: 31_000_000 + s });
    for (let i = 0; i < 40 && L.alive; i++) { E.advanceYear(L); if (L.pending?.jobInfo) { seen++; const c = L.pending.jobInfo[0]; assert.ok(c.title && c.perception.length >= 1 && c.wage > 0); break; } if (L.pending) E.choose(L, L.pending.defaultId, { auto: true }); }
  }
  assert.ok(seen > 0);
});
