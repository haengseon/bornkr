// Offline extraction only. No network or game execution; research CSVs stay outside the bundle.
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const root = new URL('../', import.meta.url);
const input = new URL('docs/research/livelihood-daily-life/', root);
const inputs = [];
function csv(name) {
  const bytes = readFileSync(new URL(name, input));
  inputs.push({ file: name, sha256: createHash('sha256').update(bytes).digest('hex') });
  const rows = []; let row = [], field = '', quoted = false;
  const text = bytes.toString('utf8').replace(/^\uFEFF/, '');
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (quoted && text[i + 1] === '"') { field += '"'; i++; }
      else quoted = !quoted;
    } else if (!quoted && (c === ',' || c === '\n')) {
      row.push(field.replace(/\r$/, '')); field = '';
      if (c === '\n') { if (row.some(Boolean)) rows.push(row); row = []; }
    } else field += c;
  }
  if (quoted) throw new Error(`Unclosed CSV field: ${name}`);
  if (field || row.length) { row.push(field.replace(/\r$/, '')); rows.push(row); }
  const headers = rows.shift();
  return rows.map(values => {
    if (values.length !== headers.length) throw new Error(`CSV column mismatch: ${name}`);
    return Object.fromEntries(headers.map((h, i) => [h, values[i]]));
  });
}
const number = r => r.value_status === 'observed' && r.value_numeric.trim() !== '' && Number.isFinite(Number(r.value_numeric)) ? Number(r.value_numeric) : null;
function unique(rows, key) {
  const seen = new Set();
  for (const r of rows) { const k = key(r); if (seen.has(k)) throw new Error(`Duplicate observation: ${k}`); seen.add(k); }
  return rows;
}
const budgetItems = { F: 'total', H: 'food', N: 'health' };
function budget(file) {
  return unique(csv(file).filter(r => r.frequency === 'A' && /^\d{4}$/.test(r.period) && r.measure_code === 'T110' && r.unit === '원' && budgetItems[r.dimension_2_code] && number(r) !== null)
    .map(r => [Number(r.period), r.dimension_1_code, budgetItems[r.dimension_2_code], number(r)]), r => r.slice(0, 3).join(':'));
}
const sizeBudget = budget('observations-household-size-budget.csv');
const headAgeBudget = budget('observations-household-head-age-budget.csv');
const purpose = { A: 'food', B: 'alcoholTobacco', C: 'clothing', D: 'housingUtilities', F: 'health', G: 'transport', I: 'recreation', K: 'restaurantsHotels' };
const months = unique(csv('observations-consumer-price-purpose.csv').filter(r => r.frequency === 'M' && /^\d{6}$/.test(r.period) && r.dimension_1_code === 'T10' && r.measure_code === 'T' && /^2020[＝=]100$/.test(r.unit) && purpose[r.dimension_2_code] && number(r) !== null)
  .map(r => [Number(r.period.slice(0, 4)), Number(r.period.slice(4)), purpose[r.dimension_2_code], number(r)]), r => r.slice(0, 3).join(':'));
const groups = new Map();
for (const [year, month, item, value] of months) {
  if (month < 1 || month > 12 || value <= 0) throw new Error('Invalid CPI observation');
  const key = `${year}:${item}`;
  if (!groups.has(key)) groups.set(key, { year, item, values: [] });
  groups.get(key).values.push(value);
}
const cpi = [], incompleteCpi = [];
for (const { year, item, values } of groups.values()) {
  if (values.length === 12) cpi.push([year, item, Number((values.reduce((a, b) => a + b, 0) / 12).toFixed(6))]);
  else incompleteCpi.push({ year, item, months: values.length });
}
// Select one classification depth only. Never sum sleep parents and children, or travel and commuting.
const activities = { S11: 'sleep', S2: 'work', S3: 'study', S7: 'social', S8: 'leisure', S9: 'travel' };
let rejectedTime = 0;
const time = unique(csv('observations-time-use-age-weekday.csv').flatMap(r => {
  if (r.frequency !== 'A' || !/^\d{4}$/.test(r.period) || r.measure_code !== 'T10' || r.dimension_2_code !== 'S0' || !activities[r.dimension_4_code]) return [];
  const match = /^(\d{1,2}):([0-5]\d)$/.exec(r.value_raw.trim());
  if (r.unit !== '시간:분' || !match) { rejectedTime++; return []; }
  const minutes = Number(match[1]) * 60 + Number(match[2]);
  if (minutes > 1440) throw new Error('Invalid time observation');
  return [[Number(r.period), r.dimension_1_code, r.dimension_3_code, activities[r.dimension_4_code], minutes]];
}), r => r.slice(0, 4).join(':'));
const tables = { sizeBudget, headAgeBudget, cpi, time };
const metadata = {
  version: 'livelihood-2026-10-16-v1', currencyBaseYear: 2025,
  sources: [
    { id: 'sizeBudget', table: 'DT_1L9U105', url: 'https://kosis.kr/statHtml/statHtml.do?orgId=101&tblId=DT_1L9U105', unit: '원/가구/월, 명목' },
    { id: 'headAgeBudget', table: 'DT_1L9U108', url: 'https://kosis.kr/statHtml/statHtml.do?orgId=101&tblId=DT_1L9U108', unit: '원/가구/월, 명목' },
    { id: 'cpi', table: 'DT_1J22001', url: 'https://kosis.kr/statHtml/statHtml.do?orgId=101&tblId=DT_1J22001', unit: '2020=100, 완전한 12개월 산술평균' },
    { id: 'time', table: 'DT_1TS202004', url: 'https://kosis.kr/statHtml/statHtml.do?orgId=101&tblId=DT_1TS202004', unit: '분/일, 성별 계·모든 조사대상 평균' },
  ],
  columns: { sizeBudget: ['year', 'householdSizeCode', 'item', 'monthlyNominalWon'], headAgeBudget: ['year', 'householdHeadAgeCode', 'item', 'monthlyNominalWon'], cpi: ['year', 'item', 'annualIndex'], time: ['year', 'weekdayCode', 'ageCode', 'activity', 'minutesPerDay'] },
  coverage: Object.fromEntries(Object.entries(tables).map(([id, rows]) => [id, { first: Math.min(...rows.map(r => r[0])), last: Math.max(...rows.map(r => r[0])), rows: rows.length }])),
  precise: false,
  reasons: ['가구 소비는 총액·식료품·보건만 확보. 나머지 소비 항목은 미확보', '가구원수와 가구주 연령은 독립 주변분포. 개인 부담 몫·결합분포 미확보', '시간 자료에 가사·돌봄·기타 필수시간이 빠져 하루 1440분 완결 예산을 만들 수 없음', '근로시간·관계망·참여율·개인 고용 전이확률 미확보'],
  incompleteCpi, rejectedTime, inputs,
};
const api = `
/** Exact observed-year lookup only: no future/history backfill or interpolation. */
export function getHouseholdBudget({year, householdSize, headAge, dimension = 'size'} = {}) {
  let code;
  if (dimension === 'size' && Number.isInteger(householdSize) && householdSize > 0) code = householdSize >= 4 ? 'E6' : 'E' + householdSize;
  if (dimension === 'headAge' && Number.isFinite(headAge) && headAge >= 0) code = headAge <= 39 ? 'G1' : headAge <= 49 ? 'G2' : headAge <= 59 ? 'G3' : 'G4';
  const rows = (dimension === 'headAge' ? TABLES.headAgeBudget : TABLES.sizeBudget).filter(r => r[0] === year && r[1] === code);
  return { available: rows.length > 0, precise: false, year, dimension, code: code ?? null, monthlyNominalWon: Object.fromEntries(rows.map(r => [r[2], r[3]])), population: 'household', additiveItems: ['food', 'health'], totalIsParent: true, source: dimension === 'headAge' ? 'headAgeBudget' : 'sizeBudget' };
}
/** For observed item amounts only. Do not rebase an amount already in 2025 real won. */
export function to2025RealManwon(nominalWon, year, item) {
  const from = TABLES.cpi.find(r => r[0] === year && r[1] === item)?.[2];
  const base = TABLES.cpi.find(r => r[0] === 2025 && r[1] === item)?.[2];
  if (!Number.isFinite(nominalWon) || nominalWon < 0 || !from || !base) return null;
  return nominalWon * base / from / 10000;
}
export function getTimeReference({ year, age, weekday = 'A0' } = {}) {
  const code = Number.isFinite(age) && age >= 20 && age < 60 ? 'D' + Math.floor(age / 10) : null;
  const rows = TABLES.time.filter(r => r[0] === year && r[1] === weekday && r[2] === code);
  return { available: rows.length > 0, precise: false, year, ageCode: code, weekday, minutesPerDay: Object.fromEntries(rows.map(r => [r[3], r[4]])), population: 'allSurveyRespondents', source: 'time', reason: '가사·돌봄 등 누락. 취업자 개인 일정으로 사용 불가' };
}
`;
writeFileSync(new URL('src/data/livelihood.js', root), `// Generated by tools/prepare-livelihood.mjs. Do not edit observation arrays manually.\nexport const LIVELIHOOD_DATA = ${JSON.stringify(metadata, null, 2)};\nconst TABLES = ${JSON.stringify(tables)};\n${api}`, 'utf8');
console.log(`Prepared livelihood reference: ${Object.entries(tables).map(([id, rows]) => id + '=' + rows.length).join(', ')}. Precise models remain disabled.`);
