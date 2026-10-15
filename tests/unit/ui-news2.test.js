import test from 'node:test';
import assert from 'node:assert/strict';
import { groupByYear, newsInner, newsRowHtml } from '../../src/ui/news.js';

test('news2: 연도별 묶음은 최신 연도가 위, 같은 해 안에서도 최신이 위', () => {
  const g = groupByYear([{ year: 1990, headline: 'a' }, { year: 2001, headline: 'b' }, { year: 1990, headline: 'c' }]);
  assert.deepEqual(g.map(x => x.year), [2001, 1990]);
  assert.deepEqual(g[1].items.map(n => n.headline), ['c', 'a']);
  assert.equal(g[0].mast, '누리 포털 뉴스');
});
test('news2: 피드 뉴스 줄은 개인 영향 없음 표시', () => {
  assert.match(newsRowHtml({ year: 2000, headline: 'H', effects: null }, 0), /개인 영향 없음/);
});
test('news2: 지면은 1종(.paper), 시대별 클래스 없음·HTML 이스케이프', () => {
  const h = newsInner({ year: 1998, headline: '<b>x</b>', summary: 's', impact: 'i', axes: ['job'] });
  assert.match(h, /class="paper"/); assert.ok(!/npop--/.test(h)); assert.ok(!h.includes('<b>x'));
  assert.match(h, /삶에 준 영향/);
});
