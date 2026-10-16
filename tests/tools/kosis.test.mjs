import test from 'node:test';
import assert from 'node:assert/strict';
import { CATALOG } from '../../tools/kosis/catalog.mjs';
import { isFatalAPIError, parseResponse, safeMessage, periodsOf, selectDimensions, planRequests, numericValue, normalizeRow, CSV_HEADERS, validateRows } from '../../tools/kosis/core.mjs';

test('인증키는 정상 응답·오류 메시지와 인코딩된 URL 모두에서 제거된다', () => {
  const key = 'fake+key=DO-NOT-STORE';
  assert.doesNotMatch(safeMessage(`apiKey=${encodeURIComponent(key)}&other=1 ${key}`, key), /DO-NOT-STORE/);
  assert.deepEqual(parseResponse('[{"DT":"0"}]', key), [{ DT: '0' }]);
  assert.throws(() => parseResponse(JSON.stringify({ err: '20', errMsg: `인증키 오류 ${key}` }), key), e => !e.message.includes(key) && e.code === '20');
  assert.throws(() => parseResponse('<html>not json</html>'), /JSON/);
  assert.equal(isFatalAPIError({ code: '40', message: '호출가능건수 제한' }), true);
  assert.equal(isFatalAPIError({ code: '10', message: '인증키 누락' }), true);
  assert.equal(isFatalAPIError({ code: '21', message: '잘못된 요청변수' }), false);
});
test('원자료의 통계 기호와 0을 구분하고 단위·분류를 보존한다', () => {
  for (const s of ['-', '...', 'X', '', '1.2p']) assert.equal(numericValue(s), null);
  assert.equal(numericValue('0'), 0); assert.equal(numericValue('1,234.5'), 1234.5);
  const line = normalizeRow({ ORG_ID: '101', TBL_ID: 'T', DT: '-', UNIT_NM: '만원', C1: 'A', C1_NM: '전체', ITM_NM: '평균, 소득' });
  assert.match(line, /symbol-or-missing/); assert.match(line, /"평균, 소득"/); assert.match(line, /만원/);
  assert.equal(CSV_HEADERS.length, 36);
});
test('연간 수록시점을 우선하며 분기와 5년 통계를 연간으로 바꾸지 않는다', () => {
  assert.deepEqual(periodsOf([{ PRD_SE: '월' }, { PRD_DE: '2025.01' }, { PRD_SE: '년' }, { PRD_DE: '2024' }, { PRD_DE: '2025' }], { since: 2024, until: 2025 }), { prdSe: 'Y', periods: ['2024', '2025'] });
  assert.deepEqual(periodsOf([{ PRD_SE: '분기' }, { PRD_DE: '2025 1/4' }], { since: 2025, until: 2025 }), { prdSe: 'Q', periods: ['202501'] });
  assert.deepEqual(periodsOf([{ PRD_SE: '5년' }, { PRD_DE: '2015' }, { PRD_DE: '2020' }], { since: 1960, until: 2026 }).prdSe, 'F');
  assert.throws(() => periodsOf([{ PRD_SE: '년' }, { PRD_DE: '1950' }], { since: 1960, until: 2026 }));
});
test('API 분류 순서를 쓰고 자료·지역 필터가 실제 코드에 대응한다', () => {
  const meta = [
    { OBJ_ID: 'ITEM', ITM_ID: 'T1', ITM_NM: '사망확률' }, { OBJ_ID: 'ITEM', ITM_ID: 'T2', ITM_NM: '생존자' },
    { OBJ_ID: 'SEX', OBJ_ID_SN: '2', OBJ_NM: '성별', ITM_ID: '0', ITM_NM: '계' },
    { OBJ_ID: 'AREA', OBJ_ID_SN: '1', OBJ_NM: '행정구역별', ITM_ID: '00', ITM_NM: '전국' },
    { OBJ_ID: 'AREA', OBJ_ID_SN: '1', OBJ_NM: '행정구역별', ITM_ID: '11', ITM_NM: '서울특별시' },
    { OBJ_ID: 'AREA', OBJ_ID_SN: '1', OBJ_NM: '행정구역별', ITM_ID: '11110', ITM_NM: '종로구' },
  ];
  const s = selectDimensions(meta, { itemPattern: '사망확률', regionalOnly: true });
  assert.deepEqual(s.items, ['T1']); assert.deepEqual(s.dimensions.map(d => d.parameter), ['objL1', 'objL2']);
  assert.deepEqual(s.dimensions[0].values, ['00', '11']);
});
test('대형 요청을 시점·분류·항목으로 분할하며 셀 누락·중복이 없다', () => {
  const spec = { orgId: '101', tblId: 'T' }, selected = { items: ['I1', 'I2'], dimensions: [{ parameter: 'objL1', values: ['A', 'B', 'C', 'D', 'E'] }] };
  const p = planRequests(spec, selected, { prdSe: 'Y', periods: ['2023', '2024'] }, 4);
  const cells = new Set(); let count = 0;
  for (const q of p) {
    const items = q.itmId.split('+').filter(Boolean), codes = q.objL1.split('+').filter(Boolean);
    assert.ok(items.length * codes.length <= 4);
    assert.equal(q.startPrdDe, q.endPrdDe);
    for (const i of items) for (const c of codes) { count++; cells.add(`${q.startPrdDe}|${i}|${c}`); }
  }
  assert.equal(count, 20); assert.equal(cells.size, 20);
  assert.ok(p.every(q => !('apiKey' in q)));
});
test('다른 표·범위 밖 시점·중복 관측값을 성공으로 저장하지 않는다', () => {
  const spec = { orgId: '101', tblId: 'T' }, params = { startPrdDe: '2024', endPrdDe: '2024' };
  const row = { ORG_ID: '101', TBL_ID: 'T', PRD_SE: 'A', PRD_DE: '2024', ITM_ID: 'I', DT: '0', C1: 'A' };
  assert.doesNotThrow(() => validateRows([row], spec, params));
  assert.throws(() => validateRows([{ ...row, TBL_ID: 'BAD' }], spec, params));
  assert.throws(() => validateRows([{ ...row, PRD_DE: '2025' }], spec, params));
  assert.throws(() => validateRows([row, row], spec, params));
  assert.equal(CATALOG.length, 26); assert.equal(new Set(CATALOG.map(s => s.id)).size, 26);
});
