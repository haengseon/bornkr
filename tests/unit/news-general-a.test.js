// 종합 뉴스 A(1960~1989) 검증: 스키마·길이·시대어휘·금지어·링크 조건 안전성·연결 비율.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { NG_A } from '../../src/content/news-general-a.js';
import { STAT_KEYS, ISSUE_KEYS } from '../../src/engine/constants.js';
import { needYear } from '../../src/engine/anachro.js';
import { newLife, advanceYear, choose } from '../../src/engine/index.js';

const SECS = ['sports', 'politics', 'economy', 'society', 'world', 'culture', 'tech', 'life', 'health', 'edu', 'labor', 'housing', 'disaster'];
const BANNED = ['피가', '피를', '칼', '때려', '폭행', '흉기', '주먹', '발로', '자해', '자살', '죽고', '죽을', '성폭', '강간', '불쌍', '결핍', '극복', '비정상', '안타깝', '가난한 집', '장애를 앓', '낙오', '실패', '무능', '게으', '루저', '노력 부족', '탓이', '자초', '초등'];
const len = s => [...s].length;
const texts = n => [n.headline, n.summary, ...n.links.map(k => k.line)];

test('건수·연도 분포: 130건 이상, 해마다 4건 이상', () => {
  assert.ok(NG_A.length >= 130, `${NG_A.length}건`);
  for (let y = 1960; y <= 1989; y++) assert.ok(NG_A.filter(n => n.years[0] === y).length >= 4, `${y}년 부족`);
});

test('스키마: id 유일·접두, years 범위, 길이, sec, fx 키', () => {
  assert.equal(new Set(NG_A.map(n => n.id)).size, NG_A.length);
  for (const n of NG_A) {
    assert.ok(/^ng\.19[6-8]\d\.[a-z0-9]+$/.test(n.id), n.id);
    const [a, b] = n.years;
    assert.ok(a >= 1960 && b <= 1989 && a <= b, `${n.id} years`);
    assert.ok(SECS.includes(n.sec), `${n.id} sec`);
    if (n.sec === 'disaster') assert.equal(n.sensitive, 'disaster', `${n.id} sensitive`);
    assert.ok(len(n.headline) <= 24, `${n.id} headline`);
    assert.ok(len(n.summary) <= 80, `${n.id} summary`);
    assert.ok(n.src.length && n.src.every(u => /^https:\/\/\S+$/.test(u)), `${n.id} src`);
    if (n.weight != null) assert.ok(n.weight >= 1 && n.weight <= 3);
    assert.ok(n.links.length >= 2 && n.links.length <= 4, `${n.id} links 수`);
    assert.ok(!n.links.at(-1).when, `${n.id} 마지막은 일반 링크`);
    for (const k of n.links) {
      assert.ok(k.line && len(k.line) <= 60, `${n.id} line ${k.line}`);
      assert.ok(k.when === undefined || typeof k.when === 'function', `${n.id} when`);
      for (const [key, v] of Object.entries(k.fx?.stats || {})) assert.ok(STAT_KEYS.includes(key) && Math.abs(v) <= 2 && v !== 0, `${n.id} stat ${key}`);
      for (const [key, v] of Object.entries(k.fx?.issues || {})) assert.ok(ISSUE_KEYS.includes(key) && Math.abs(v) <= 6 && v !== 0, `${n.id} issue ${key}`);
      if (k.fx) assert.ok(k.reason, `${n.id} reason`);
    }
  }
});

test('시대어휘·금지어', () => {
  for (const n of NG_A) for (const t of texts(n)) {
    assert.ok(needYear(t) <= n.years[0], `${n.id} 시대착오 "${t}"`);
    for (const w of BANNED) assert.ok(!t.includes(w), `${n.id} 금지어 ${w} "${t}"`);
  }
});

// 여러 출생연도·지역·주거·계층 생애를 1960~1989년 동안 굴리며 해마다 상태 샘플을 모은다.
const STATES = (() => {
  const out = [];
  const tenures = ['own', 'jeonse', 'monthly', 'family'];
  for (let i = 0; out.length < 400; i++) {
    const L = newLife({ seed: 9100 + i, forced: { year: 1960 + (i * 7) % 26, urban: i % 3 !== 0, quintile: 1 + (i % 5), tenure: tenures[i % 4] } });
    while (L.alive && L.year <= 1989) {
      out.push(structuredClone({ ...L, log: [], reasons: {} }));
      if (L.pending) choose(L, L.pending.defaultId, { auto: true }); else advanceYear(L);
    }
  }
  return out;
})();

const eligible = (n, L) => L.year >= n.years[0] && L.year <= n.years[1] && !(n.ages && (L.age < n.ages[0] || L.age > n.ages[1]));

test('링크 조건: 300개 이상 샘플 상태에서 예외 없이 boolean', () => {
  assert.ok(STATES.length >= 300, `샘플 ${STATES.length}`);
  for (const L of STATES) for (const n of NG_A) for (const k of n.links) {
    if (!k.when) continue;
    const r = k.when(L);
    assert.equal(typeof r, 'boolean', `${n.id} "${k.line}" → ${r}`);
  }
});

test('연결 비율: 조건 링크가 실제 상태에 닿는 뉴스 ≥ 60%', () => {
  const hit = NG_A.filter(n => STATES.some(L => eligible(n, L) && n.links.some(k => k.when && k.when(L))));
  assert.ok(hit.length / NG_A.length >= 0.6, `${hit.length}/${NG_A.length}`);
});
