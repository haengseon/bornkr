// 종합 뉴스 B(1990~2009) + 시대 사건 링크(ERA_LINKS) 형식·인과 링크·시대어휘·안전 검증.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { NG_B } from '../../src/content/news-general-b.js';
import { ERA_LINKS_MAP } from '../../src/content/news-era-links.js';
import ERA from '../../src/content/events/era.js';
import { ISSUE_KEYS, STAT_KEYS } from '../../src/engine/constants.js';
import { needYear } from '../../src/engine/anachro.js';
import { newLife, advanceYear, choose } from '../../src/engine/index.js';

const SECS = ['sports', 'politics', 'economy', 'society', 'world', 'culture', 'tech', 'life', 'health', 'edu', 'labor', 'housing', 'disaster'];
const BANNED = /자살|자해|사망 원인|순위|상위|하위|등수|승리|패배|부자 ?순|학벌|명문|억 ?원/;
const len = s => [...s].length;
const ERA_BY_ID = new Map(ERA.map(e => [e.id, e]));

function checkLinks(where, links, from) {
  assert.ok(Array.isArray(links) && links.length >= 2, `${where}: 링크 2개 이상`);
  const last = links[links.length - 1];
  assert.equal(last.when, undefined, `${where}: 마지막 링크는 조건 없음`);
  for (const [i, k] of links.entries()) {
    if (i < links.length - 1) assert.equal(typeof k.when, 'function', `${where}[${i}] when`);
    assert.ok(typeof k.line === 'string' && len(k.line) >= 8 && len(k.line) <= 60, `${where}[${i}] line ${k.line}`);
    assert.ok(typeof k.reason === 'string' && k.reason.length > 0, `${where}[${i}] reason`);
    assert.doesNotMatch(k.line, BANNED, `${where}: ${k.line}`);
    assert.ok(needYear(k.line) <= from, `${where}: 시대어휘(${needYear(k.line)}) ${k.line}`);
    const fx = k.fx || {};
    for (const [s, v] of Object.entries(fx.stats || {})) assert.ok(STAT_KEYS.includes(s) && v !== 0 && Math.abs(v) <= 2, `${where} stat ${s}=${v}`);
    for (const [s, v] of Object.entries(fx.issues || {})) assert.ok(ISSUE_KEYS.includes(s) && Math.abs(v) >= 2 && Math.abs(v) <= 6, `${where} issue ${s}=${v}`);
    if (fx.money) assert.deepEqual(Object.keys(fx.money), ['assets'], `${where} money`);
    assert.ok(Object.keys(fx).every(x => ['stats', 'issues', 'money'].includes(x)), `${where} fx 키`);
  }
}

test('NG_B 스키마: 160건 이상·id 유일·연도 1990~2009·길이·출처', () => {
  assert.ok(NG_B.length >= 160, `건수 ${NG_B.length}`);
  assert.equal(new Set(NG_B.map(n => n.id)).size, NG_B.length);
  const perYear = {};
  for (const n of NG_B) {
    assert.ok(n.id.startsWith('ng.') && n.id.startsWith(`ng.${n.years[0]}.`), n.id);
    assert.ok(n.years[0] >= 1990 && n.years[1] <= 2009 && n.years[0] <= n.years[1], `${n.id} years`);
    assert.ok(SECS.includes(n.sec), `${n.id} sec`);
    assert.ok(len(n.headline) <= 24, `${n.id} headline ${len(n.headline)}`);
    assert.ok(len(n.summary) <= 80, `${n.id} summary ${len(n.summary)}`);
    if (n.sec === 'disaster') assert.equal(n.sensitive, 'disaster', `${n.id} sensitive`);
    assert.ok(n.src.length >= 1 && n.src.every(u => /^https:\/\/\S+$/.test(u)), `${n.id} src`);
    for (const t of [n.headline, n.summary]) {
      assert.doesNotMatch(t, BANNED, `${n.id}: ${t}`);
      assert.ok(needYear(t) <= n.years[0], `${n.id}: 시대어휘 ${t}`);
    }
    checkLinks(n.id, n.links, n.years[0]);
    perYear[n.years[0]] = (perYear[n.years[0]] || 0) + 1;
  }
  for (let y = 1990; y <= 2009; y++) assert.ok((perYear[y] || 0) >= 7, `${y}년 ${perYear[y] || 0}건`);
});

test('ERA_LINKS: era.js 49건 전부, 키 유효, 위기 사건 세분화', () => {
  assert.equal(ERA.length, 49);
  for (const id of Object.keys(ERA_LINKS_MAP)) assert.ok(ERA_BY_ID.has(id), `없는 era id ${id}`);
  for (const e of ERA) {
    const links = ERA_LINKS_MAP[e.id];
    assert.ok(links, `${e.id} 링크 없음`);
    checkLinks(e.id, links, e.years[0]);
  }
  for (const id of ['era.1997.imf', 'era.2003.card', 'era.2008.gfc']) assert.ok(ERA_LINKS_MAP[id].length - 1 >= 5, `${id} 상태별 5개 이상`);
});

// 실제 생애 시뮬에서 그해 상태 L을 표본으로 모아 when을 돌린다(100생애 × 연도 = 수천 개 상태).
const SAMPLE = (() => {
  const out = { calls: 0, errs: [], nb: { pairs: 0, specific: 0 }, era: { pairs: 0, specific: 0 } };
  const run = (L, links, tag) => {
    let hit = -1;
    for (const [i, k] of links.entries()) {
      if (!k.when) continue;
      out.calls++;
      let r;
      try { r = k.when(L); } catch (e) { out.errs.push(`${tag}[${i}] throw ${e.message}`); continue; }
      if (typeof r !== 'boolean') out.errs.push(`${tag}[${i}] 반환 ${typeof r}`);
      if (r && hit < 0) hit = i;
    }
    return hit >= 0;
  };
  for (let s = 1; s <= 100; s++) {
    const L = newLife({ seed: 9000 + s });
    while (L.alive && L.year < 2051) {
      if (L.pending) { choose(L, L.pending.defaultId, { auto: true }); continue; }
      advanceYear(L);
      if (L.pending) continue;
      for (const n of NG_B) {
        if (L.year < n.years[0] || L.year > n.years[1] || (n.ages && (L.age < n.ages[0] || L.age > n.ages[1]))) continue;
        out.nb.pairs++;
        if (run(L, n.links, n.id)) out.nb.specific++;
      }
      for (const e of ERA) {
        if (L.year < e.years[0] || L.year > e.years[1]) continue;
        out.era.pairs++;
        if (run(L, ERA_LINKS_MAP[e.id], e.id)) out.era.specific++;
      }
    }
  }
  return out;
})();

test('모든 when이 표본 L에서 예외 없이 boolean', () => {
  assert.ok(SAMPLE.calls > 10000, `호출 ${SAMPLE.calls}`);
  assert.deepEqual(SAMPLE.errs.slice(0, 10), []);
});

test('연결 비율: 상태별(조건부) 링크가 맞는 비율 ≥ 60%', () => {
  const nb = SAMPLE.nb.specific / SAMPLE.nb.pairs, era = SAMPLE.era.specific / SAMPLE.era.pairs;
  assert.ok(nb >= 0.6, `NG_B 상태별 연결 ${(nb * 100).toFixed(1)}%`);
  assert.ok(era >= 0.6, `ERA 상태별 연결 ${(era * 100).toFixed(1)}%`);
});

test('조사 문서: 인과 샘플 10건 이상', () => {
  const doc = readFileSync(new URL('../../docs/research/R16-news-general-b.md', import.meta.url), 'utf8');
  const samples = doc.split('\n').filter(l => /^- `(ng|era)\.[\w.]+`.*→/.test(l));
  assert.ok(samples.length >= 10, `샘플 ${samples.length}`);
});
