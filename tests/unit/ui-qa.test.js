import test from 'node:test';
import assert from 'node:assert/strict';
import { eventImpact, topicOfId, isBigEntry } from '../../src/ui/major.js';
import { societyAxes } from '../../src/ui/concerns-adapter.js';

test('qa-ui: 사건 단위 데이터가 없으면 이 일로 바뀐 것은 비어 있다(연간 합산 대입 없음)', () => {
  const im = eventImpact({ id: 'sys.fam.grandparent_death', text: '친할머니가 세상을 떠났다.' });
  assert.deepEqual(im, { stats: [], issues: [], profile: [] });
});
test('qa-ui: 사별·상실 카드에는 좋은 방향(행복▲·여유▲·관심사▼)의 변화를 붙이지 않는다', () => {
  const e = { id: 'sys.fam.parent_death', impact: { stats: [{ key: 'happiness', delta: 3 }, { key: 'health', delta: -4 }], issues: [{ key: 'care', delta: -3 }, { key: 'living', delta: 5 }], profile: [{ field: 'family', text: '혼자' }] } };
  const im = eventImpact(e);
  assert.deepEqual(im.stats.map(x => x[0]), ['health']);
  assert.deepEqual(im.issues.map(x => x[0]), ['living']);
  assert.deepEqual(im.profile, ['혼자']);
  assert.equal(eventImpact({ id: 'sys.edu.college_enter', impact: { stats: [{ key: 'learning', delta: -2 }, { key: 'wealth', delta: 2 }] } }).stats.length, 2);
});
test('qa-ui: 재혼은 결혼 분류, 큰 카드', () => {
  assert.equal(topicOfId('sys.fam.remarry'), 'marriage');
  assert.equal(isBigEntry({ id: 'sys.fam.remarry', text: '재혼했다.' }), true);
});
test('qa-ui: 올해 사회의 관심사는 그해 뉴스 axes 상위 3개', () => {
  const log = [{ year: 2001, axes: ['job', 'housing'] }, { year: 2001, axes: ['job', 'edu', 'care'] }, { year: 2000, axes: ['tech'] }];
  assert.deepEqual(societyAxes(log, 2001), ['일자리', '주거', '교육']);
});
