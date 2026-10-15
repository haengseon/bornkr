// 뉴스 아카이브 A(1960~1984) 검증: 형식·길이·id 유일·연도 범위.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { NEWS_A as A } from '../../src/content/news-archive-a.js';
import { ISSUE_KEYS } from '../../src/engine/constants.js';

const SECTIONS = ['economy', 'society', 'life', 'education', 'tech', 'culture', 'sports', 'disaster'];

test('연도 범위 1960~1984, 연도마다 최소 1건', () => {
  assert.ok(A.every(n => n.year >= 1960 && n.year <= 1984));
  for (let y = 1960; y <= 1984; y++) assert.ok(A.filter(n => n.year === y).length >= 1, `${y}년 부족`);
});

test('id 형식·유일, 정렬', () => {
  assert.equal(new Set(A.map(n => n.id)).size, A.length);
  assert.ok(A.every(n => n.id.startsWith(`n${n.year}-a`) && /^n\d{4}-a\d+$/.test(n.id)));
  for (let i = 1; i < A.length; i++) {
    const a = A[i - 1], b = A[i];
    assert.ok(a.year < b.year || (a.year === b.year && (a.month || 0) <= (b.month || 0)), `정렬 ${b.id}`);
  }
});

test('필드 형식·길이·값 범위', () => {
  for (const n of A) {
    assert.ok(SECTIONS.includes(n.section), `${n.id} section`);
    assert.ok(n.headline && [...n.headline].length <= 24, `${n.id} headline ${[...n.headline].length}`);
    assert.ok(n.summary && [...n.summary].length <= 80, `${n.id} summary ${[...n.summary].length}`);
    assert.ok(n.impact && [...n.impact].length <= 90, `${n.id} impact ${[...n.impact].length}`);
    assert.ok(Array.isArray(n.axes) && n.axes.length >= 1 && n.axes.length <= 2, `${n.id} axes`);
    assert.ok(n.axes.every(k => ISSUE_KEYS.includes(k)), `${n.id} axes key`);
    assert.ok(n.sensitive === null || n.sensitive === 'disaster', `${n.id} sensitive`);
    if (n.section === 'disaster') assert.equal(n.sensitive, 'disaster', `${n.id} disaster 표시`);
    if (n.month != null) assert.ok(Number.isInteger(n.month) && n.month >= 1 && n.month <= 12, `${n.id} month`);
    assert.ok(n.src.length >= 1 && n.src.every(u => /^https:\/\/\S+$/.test(u)), `${n.id} src`);
  }
});
