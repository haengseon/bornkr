// 시스템 문구 E: 키 존재·형식·길이·시대 가드·조건 모순 검증.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SYSTEM_TEXT } from '../../src/content/system-text.js';
import E, { ROWS, ok } from '../../src/content/system-text-e.js';
import { DEFAULT_TEXT, fill } from '../../src/engine/text.js';
import { needYear } from '../../src/engine/anachro.js';

const BAD = /씨발|좆|병신|자살|죽어|성기|강간|보수|진보|여자는|남자는|가난한 사람/;
const VARS = { amount: '300', pay: '200', n: 3, months: 18, years: 20, grade: 3, title: '공장 일', reasonLabel: '구조조정', kindLabel: '학자금 대출', toLabel: '전세', regionLabel: '대구', highTypeLabel: '일반고', collegeLabel: '대학', levelLabel: '대학', exam: '수능', childLabel: '딸', childSexLabel: '딸', schoolLabel: '초등학교', parentLabel: '아버지', pAge: 80, gpLabel: '할머니', cancerLabel: '위암', condLabel: '당뇨', disabilityLabel: '난청', reason: '이직' };
const mkL = (year, age, urban, extra = {}) => ({ year, age, birth: { urban, quintile: 3 }, traits: { open: 50, consc: 50, extra: 50, agree: 50, sens: 50 }, family: {}, ...extra });
const LS = [mkL(1962, 5, false), mkL(1985, 17, true), mkL(1999, 30, true, { family: { married: true } }), mkL(2008, 45, false), mkL(2020, 8, true), mkL(2024, 70, false), mkL(2040, 68, true), mkL(1975, 25, false, { traits: { open: 90, consc: 90, extra: 10, agree: 90, sens: 90 } }), mkL(2030, 22, true, { traits: { open: 10, consc: 10, extra: 90, agree: 10, sens: 10 }, birth: { urban: true, quintile: 1 } })];

test('키는 실제 문구 키이고 행 수 ≥6', () => {
  const known = new Set([...Object.keys(SYSTEM_TEXT), ...Object.keys(DEFAULT_TEXT)]);
  for (const k of Object.keys(E)) { assert.ok(known.has(k), k); assert.equal(typeof E[k], 'function'); assert.ok(ROWS[k].length >= 6, k + ' rows'); }
  assert.ok(Object.keys(E).length >= 100);
  assert.ok(Object.values(ROWS).flat().reduce((s, r) => s + r.length - 1, 0) >= 600);
});
test('모든 변형: 길이·금지어·시대 가드·조건 문법', () => {
  const ALLOWED = [/^e60|e80|e90|e00|e10|e20|c19|child|teen|youth|mid|old|rural|urban|poor|rich|wed|solo|[OCEAS][+-]$/];
  for (const [k, rows] of Object.entries(ROWS)) for (const [spec, ...txt] of rows) {
    for (const t of spec.split('&').filter(Boolean)) assert.match(t, /^(e60|e80|e90|e00|e10|e20|c19|child|teen|youth|mid|old|rural|urban|poor|rich|wed|solo|[OCEAS][+-])$/, k + ' spec ' + spec);
    for (const s of txt) {
      assert.ok(s.length <= 40 || /\{/.test(s) && s.replace(/\{[^}]*\}/g, 'XXXX').length <= 40, `${k} 길이 ${s}`);
      assert.doesNotMatch(s, BAD, s);
      const y = spec.includes('e60') ? 1975 : spec.includes('e80') ? 1985 : spec.includes('e90') ? 1995 : spec.includes('e00') ? 2005 : spec.includes('e10') ? 2015 : 0;
      if (y) assert.ok(needYear(s) <= y, `${k} 시대착오 ${s}`);
      if (spec.includes('rural')) assert.doesNotMatch(s, /아파트|지하철/, s);
    }
  }
});
test('함수형: 다양한 L에서 문자열, undefined·미치환 없음, 후보 전부 검사', () => {
  for (const k of Object.keys(E)) for (const L of LS) {
    const seen = [];
    const ctx = { L, pick: a => (seen.push(...a), a[0]) };
    const s = fill(E[k], VARS, ctx);
    assert.equal(typeof s, 'string'); assert.ok(s.length > 0, k);
    for (const c of seen) { const f = fill(c, VARS, ctx); assert.doesNotMatch(f, /undefined|\{|\}|null/, `${k}: ${c}`); }
  }
});
test('조건 모순 금지: 농촌 L에는 도시 전용 변형 없음, 연령 조건 반영', () => {
  assert.equal(ok(mkL(1990, 30, true), 'rural'), false);
  assert.equal(ok(mkL(1990, 30, false), 'rural'), true);
  assert.equal(ok(mkL(2023, 30, true), 'c19'), false);
  assert.equal(ok(mkL(2021, 30, true), 'c19'), true);
  const L = mkL(1962, 5, false), ctx = { L, pick: a => a[a.length - 1] };
  assert.doesNotMatch(E['sys.edu.daycare'](L, ctx), /어린이집|화면|마스크/);
});
