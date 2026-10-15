// 뉴스 아카이브 B(1985~2004) 형식·길이·id 유일·연도 범위 검증.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { NEWS_B as B } from '../../src/content/news-archive-b.js';
import { ISSUE_KEYS } from '../../src/engine/constants.js';

const SECTIONS = ['economy', 'society', 'life', 'education', 'tech', 'culture', 'sports', 'disaster'];

test('연도 범위 1985~2004, id 형식·유일', () => {
  assert.ok(B.every(n => n.year >= 1985 && n.year <= 2004));
  assert.equal(new Set(B.map(n => n.id)).size, B.length);
  for (const n of B) assert.ok(n.id.startsWith(`n${n.year}-b`) && /^[0-9]+$/.test(n.id.split("-b")[1]), n.id);
});

test('정렬(year, month)', () => {
  for (let i = 1; i < B.length; i++) {
    const a = B[i - 1], b = B[i];
    assert.ok(a.year < b.year || (a.year === b.year && (a.month || 0) <= (b.month || 0)), `정렬 ${b.id}`);
  }
});

test('필드 형식·길이·값 범위', () => {
  for (const n of B) {
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
