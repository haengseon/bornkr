// 시대 뉴스 아카이브 검증: 연도 커버리지, 필드 형식, 길이 제한, era 연결.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { NEWS_ARCHIVE as A } from '../../src/content/news-archive.js';
import ERA from '../../src/content/events/era.js';
import { ISSUE_KEYS } from '../../src/engine/constants.js';

const SECTIONS = ['economy', 'society', 'life', 'education', 'tech', 'culture', 'sports', 'disaster'];
const eraIds = new Set((Array.isArray(ERA) ? ERA : Object.values(ERA)).map(e => e.id));

test('1960~2026 각 연도 최소 2건', () => {
  for (let y = 1960; y <= 2026; y++) assert.ok(A.filter(n => n.year === y).length >= 2, `${y}년 부족`);
  assert.ok(A.every(n => n.year >= 1960 && (n.year <= 2026 || (n.future && n.year <= 2050))));
});

test('id 유일, 정렬(year, month)', () => {
  assert.equal(new Set(A.map(n => n.id)).size, A.length);
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
    if (n.eraId) assert.ok(eraIds.has(n.eraId), `${n.id} eraId ${n.eraId}`);
    assert.ok(n.src.length >= 1 && n.src.every(u => /^https:\/\/\S+$/.test(u)), `${n.id} src`);
  }
});
