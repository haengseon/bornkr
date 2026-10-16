// 종합 뉴스 C 검증: 스키마·길이·시대어휘·금지어·링크 조건 안전성·연결 비율·문서 인과 샘플.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { NG_C as A } from '../../src/content/news-general-c.js';
import { ISSUE_KEYS, STAT_KEYS } from '../../src/engine/constants.js';
import { needYear } from '../../src/engine/anachro.js';
import * as E from '../../src/engine/index.js';

const SECS = ['sports', 'politics', 'economy', 'society', 'world', 'culture', 'tech', 'life', 'health', 'edu', 'labor', 'housing', 'disaster'];
const BANNED = ['피가', '피를', '칼', '때려', '폭행', '흉기', '주먹', '자해', '자살', '죽고', '죽을', '성폭', '강간', '불쌍', '결핍', '극복', '비정상', '안타깝', '가난한 집', '낙오', '실패', '무능', '게으', '루저', '노력 부족', '탓이', '자초'];
const len = s => [...s].length;
const texts = n => [n.headline, n.summary, ...n.links.map(l => l.line)];

test('분량: 170건 이상, 실제 120건 이상, 가상 20건 이상, 2010~2026 연 6건 이상', () => {
  assert.ok(A.length >= 170, `총 ${A.length}`);
  assert.ok(A.filter(n => !n.scenario).length >= 120);
  assert.ok(A.filter(n => n.scenario).length >= 20);
  for (let y = 2010; y <= 2026; y++) assert.ok(A.filter(n => n.years[0] === y && !n.scenario).length >= 6, `${y}년 부족`);
});

test('스키마·길이·id 유일·가상 표시', () => {
  assert.equal(new Set(A.map(n => n.id)).size, A.length);
  for (const n of A) {
    assert.match(n.id, /^ng\.\d{4}\.[a-z0-9]+$/, n.id);
    const [a, b] = n.years;
    assert.ok(a >= 2010 && b <= 2080 && a <= b, `${n.id} years`);
    assert.equal(+n.id.slice(3, 7), a, `${n.id} id 연도`);
    assert.equal(!!n.scenario, a >= 2027, `${n.id} scenario`);
    if (n.scenario) assert.ok(n.summary.startsWith('[가상]'), `${n.id} 가상 표기`);
    assert.ok(SECS.includes(n.sec), `${n.id} sec`);
    assert.ok(len(n.headline) <= 24, `${n.id} headline ${len(n.headline)}`);
    assert.ok(len(n.summary) <= 80, `${n.id} summary ${len(n.summary)}`);
    assert.ok(n.src.length && n.src.every(u => /^https:\/\/\S+$/.test(u)), `${n.id} src`);
    if (n.sec === 'disaster' && !n.scenario) assert.equal(n.sensitive, 'disaster', `${n.id} sensitive`);
    assert.ok(n.links.length >= 3 && n.links.length <= 5, `${n.id} 링크 수`);
    assert.equal(n.links.at(-1).when({}), true, `${n.id} 마지막은 일반 링크`);
    for (const l of n.links) {
      assert.ok(l.line && len(l.line) <= 60, `${n.id} line ${l.line}`);
      assert.ok(typeof l.reason === 'string' && l.reason, `${n.id} reason`);
      for (const [k, v] of Object.entries(l.fx.stats || {})) assert.ok(STAT_KEYS.includes(k) && Math.abs(v) <= 2, `${n.id} stats ${k}`);
      for (const [k, v] of Object.entries(l.fx.issues || {})) assert.ok(ISSUE_KEYS.includes(k) && Math.abs(v) <= 6, `${n.id} issues ${k}`);
      for (const [k, v] of Object.entries(l.fx.money || {})) assert.ok(['assets', 'debt'].includes(k) && Math.abs(v) <= 300, `${n.id} money ${k}`);
    }
  }
});

test('시대어휘 가드·금지어', () => {
  for (const n of A) for (const t of texts(n)) {
    assert.ok(needYear(t) <= n.years[0], `${n.id} 시대착오 "${t}"`);
    for (const w of BANNED) assert.ok(!t.includes(w), `${n.id} 금지어 ${w} "${t}"`);
  }
});

// 실제 생애에서 뽑은 상태 표본 300개: 모든 when이 예외 없이 boolean, 연결 비율 ≥ 60%
test('링크 조건 안전성(300개 표본 L)·연결 비율', () => {
  let samples = 0, eligible = 0, linked = 0;
  for (let seed = 1; samples < 300 && seed < 400; seed++) {
    const L = E.newLife({ seed: seed * 7919 });
    while (L.alive && samples < 300 && L.age < 100) {
      if (L.pending) { E.choose(L, L.pending.defaultId, { auto: true }); continue; }
      E.advanceYear(L);
      if (L.age % 4 !== seed % 4 || L.year < 2010) continue;
      samples++;
      let any = false, hit = false;
      for (const n of A) {
        for (const l of n.links) {
          const r = l.when(L);
          assert.equal(typeof r, 'boolean', `${n.id} when 반환형`);
        }
        if (L.year < n.years[0] || L.year > n.years[1]) continue;
        any = true;
        if (n.links.slice(0, -1).some(l => l.when(L))) hit = true;
      }
      if (any) { eligible++; if (hit) linked++; }
    }
  }
  assert.ok(samples >= 300, `표본 ${samples}`);
  const ratio = linked / eligible;
  console.log(`연결 비율 ${(ratio * 100).toFixed(1)}% (${linked}/${eligible})`);
  assert.ok(ratio >= 0.6, `연결 비율 ${ratio}`);
});

test('문서: 인과 샘플 10건 이상', () => {
  const doc = readFileSync(new URL('../../docs/research/news/R16-news-general-c.md', import.meta.url), 'utf8');
  const rows = doc.split('\n').filter(l => /^\|\s*ng\.\d{4}\.\w+\s*\|/.test(l));
  assert.ok(rows.length >= 10, `샘플 ${rows.length}`);
  for (const r of rows) assert.ok(A.some(n => r.includes(n.id)), `없는 id: ${r}`);
});
