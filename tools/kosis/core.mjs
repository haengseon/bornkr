import { REGIONAL_NAMES } from './catalog.mjs';

export const API_ROOT = 'https://kosis.kr/openapi/';
export const META_PATH = 'statisticsData.do';
export const DATA_PATH = 'Param/statisticsParameterData.do';
export function safeMessage(value, key = '') {
  let s = String(value);
  if (key) for (const token of [key, encodeURIComponent(key)]) s = s.split(token).join('[REDACTED]');
  return s.replace(/(apiKey[=":\s]+)[^&\s"<>]+/gi, '$1[REDACTED]');
}
export class KosisError extends Error {
  constructor(message, code = '') { super(message); this.name = 'KosisError'; this.code = String(code); }
}
// Official guide: 10/11 authentication, 20/21 query parameters, 30 no results,
// 31 too many results, 40/41/42 account limits, 50 server error.
export const isFatalAPIError = e => ['BUDGET', 'RATE', '10', '11', '40', '41', '42'].includes(e.code) || /인증|인증키|일일.*초과|하루.*초과/i.test(e.message);
export function parseResponse(text, key = '') {
  let data;
  try { data = JSON.parse(safeMessage(text.replace(/^\uFEFF/, ''), key)); }
  catch { throw new KosisError('JSON이 아닌 API 응답 (응답 본문·인증 URL은 로그에 출력하지 않음)', 'FORMAT'); }
  const error = Array.isArray(data) ? data.find(x => x?.err != null || x?.ERROR_CODE != null) : data;
  if (error?.err != null || error?.ERROR_CODE != null) throw new KosisError(safeMessage(error.errMsg || error.ERROR_MSG || 'KOSIS API 오류', key), error.err ?? error.ERROR_CODE);
  if (!Array.isArray(data)) throw new KosisError('API 배열 응답이 아님', 'SCHEMA');
  return data;
}

const frequency = name => ({ '년': 'Y', '연': 'Y', '연간': 'Y', Y: 'Y', A: 'Y', '분기': 'Q', Q: 'Q', '월': 'M', M: 'M', '반기': 'S', S: 'S' })[name] || (/년/.test(name || '') ? 'F' : name);
export function periodsOf(meta, { since = 1960, until = new Date().getUTCFullYear() } = {}) {
  const byFrequency = new Map(); let freq;
  for (const row of meta) {
    if (row.PRD_SE) { freq = frequency(row.PRD_SE); if (!byFrequency.has(freq)) byFrequency.set(freq, []); }
    if (row.PRD_DE && freq) {
      let v = String(row.PRD_DE);
      if (['Q', 'S'].includes(freq)) { const m = v.match(/^(\d{4})\D+(\d)(?:\/\d)?$/); if (m) v = m[1] + m[2].padStart(2, '0'); }
      v = v.replace(/\D/g, '');
      if (v.length >= 4 && +v.slice(0, 4) >= since && +v.slice(0, 4) <= until) byFrequency.get(freq).push(v);
    }
  }
  const prdSe = ['Y', 'F', 'Q', 'S', 'M'].find(k => byFrequency.get(k)?.length);
  if (!prdSe) throw new KosisError('이 범위에 지원되는 실제 수록시점 없음', 'PERIOD');
  return { prdSe, periods: [...new Set(byFrequency.get(prdSe))].sort() };
}
export function selectDimensions(meta, spec) {
  const groups = new Map();
  for (const row of meta) { const id = row.OBJ_ID; if (!id || !row.ITM_ID) continue; if (!groups.has(id)) groups.set(id, []); groups.get(id).push(row); }
  let items = groups.get('ITEM') || [];
  if (spec.itemPattern) items = items.filter(r => new RegExp(spec.itemPattern).test(r.ITM_NM));
  if (!items.length) throw new KosisError('수집할 자료 항목이 없음', 'ITEMS');
  const dims = [...groups].filter(([id]) => id !== 'ITEM').sort((a, b) => +a[1][0].OBJ_ID_SN - +b[1][0].OBJ_ID_SN).map(([id, rows], i) => {
    const n = Number(rows[0].OBJ_ID_SN || i + 1);
    if (spec.regionalOnly && /행정|지역|시군구|시도/.test(rows[0].OBJ_NM)) rows = rows.filter(r => REGIONAL_NAMES.test(r.ITM_NM));
    if (!rows.length || n < 1 || n > 8) throw new KosisError('분류 순서 또는 지역 필터 확인 필요', 'DIMENSION');
    return { id, name: rows[0].OBJ_NM, parameter: `objL${n}`, values: [...new Set(rows.map(r => r.ITM_ID))] };
  });
  return { items: [...new Set(items.map(r => r.ITM_ID))], dimensions: dims };
}
export function planRequests(spec, selected, periodInfo, cellLimit = 25000) {
  const result = [];
  const split = (items, dimensions, periods) => {
    const size = items.length * dimensions.reduce((n, d) => n * d.values.length, 1) * periods.length;
    if (size > cellLimit) {
      if (periods.length > 1) { const k = Math.ceil(periods.length / 2); split(items, dimensions, periods.slice(0, k)); split(items, dimensions, periods.slice(k)); return; }
      const longest = dimensions.reduce((best, d, i) => d.values.length > (dimensions[best]?.values.length || 1) ? i : best, -1);
      if (longest >= 0 && dimensions[longest].values.length > items.length) {
        const values = dimensions[longest].values, k = Math.ceil(values.length / 2);
        for (const part of [values.slice(0, k), values.slice(k)]) split(items, dimensions.map((d, i) => i === longest ? { ...d, values: part } : d), periods);
        return;
      }
      if (items.length > 1) { const k = Math.ceil(items.length / 2); split(items.slice(0, k), dimensions, periods); split(items.slice(k), dimensions, periods); return; }
      throw new KosisError('단일 셀 요청 분할 불가', 'LIMIT');
    }
    result.push({ method: 'getList', orgId: spec.orgId, tblId: spec.tblId, itmId: items.join('+') + '+', ...Object.fromEntries(dimensions.map(d => [d.parameter, d.values.join('+') + '+'])), prdSe: periodInfo.prdSe, startPrdDe: periods[0], endPrdDe: periods.at(-1), format: 'json', jsonVD: 'Y', smblChk: 'Y' });
  };
  split(selected.items, selected.dimensions, periodInfo.periods);
  return result;
}
export function numericValue(raw) {
  const s = String(raw ?? '').trim().replaceAll(',', '');
  return /^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(s) && Number.isFinite(Number(s)) ? Number(s) : null;
}
export const CSV_HEADERS = ['org_id', 'table_id', 'table_name', 'period_type', 'period', 'item_code', 'item_name', 'unit', 'raw_value', 'value', 'value_status', ...Array.from({ length: 8 }, (_, i) => [`c${i + 1}_code`, `c${i + 1}_name`, `c${i + 1}_classification`]).flat(), 'last_changed'];
export const csvEscape = value => /[",\r\n]/.test(String(value ?? '')) ? '"' + String(value ?? '').replaceAll('"', '""') + '"' : String(value ?? '');
export function normalizeRow(row) {
  const v = numericValue(row.DT);
  return [row.ORG_ID, row.TBL_ID, row.TBL_NM, row.PRD_SE, row.PRD_DE, row.ITM_ID, row.ITM_NM, row.UNIT_NM, row.DT, v, v == null ? 'symbol-or-missing' : 'numeric', ...Array.from({ length: 8 }, (_, i) => [row[`C${i + 1}`], row[`C${i + 1}_NM`], row[`C${i + 1}_OBJ_NM`]]).flat(), row.LST_CHN_DE].map(csvEscape).join(',');
}
export function validateRows(rows, spec, params) {
  const seen = new Set();
  for (const r of rows) {
    if (r.TBL_ID !== spec.tblId || String(r.ORG_ID) !== spec.orgId || r.DT == null || !r.PRD_DE || !r.ITM_ID) throw new KosisError('요청한 표와 불일치하거나 필수 필드가 없는 응답', 'SCHEMA');
    if (String(r.PRD_DE) < params.startPrdDe || String(r.PRD_DE) > params.endPrdDe) throw new KosisError('요청 범위 밖 수록시점', 'PERIOD');
    const key = [r.PRD_SE, r.PRD_DE, r.ITM_ID, ...Array.from({ length: 8 }, (_, i) => r[`C${i + 1}`] || '')].join('|');
    if (seen.has(key)) throw new KosisError('동일 요청 안 중복 관측값', 'DUPLICATE');
    seen.add(key);
  }
}
