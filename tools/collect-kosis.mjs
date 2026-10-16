#!/usr/bin/env node
// One-shot research collection, never imported by the browser or the site build.
import fs from 'node:fs/promises';
import { createWriteStream } from 'node:fs';
import { createGzip, gzipSync, gunzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { once } from 'node:events';
import { pipeline } from 'node:stream/promises';
import { CATALOG } from './kosis/catalog.mjs';
import { API_ROOT, META_PATH, DATA_PATH, KosisError, isFatalAPIError, safeMessage, parseResponse, periodsOf, selectDimensions, planRequests, CSV_HEADERS, normalizeRow, numericValue, validateRows } from './kosis/core.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sha = b => createHash('sha256').update(b).digest('hex');
const pause = ms => new Promise(r => setTimeout(r, ms));
const args = process.argv.slice(2);
const option = (flag, fallback) => { const i = args.indexOf(flag); if (i < 0) return fallback; if (!args[i + 1] || args[i + 1].startsWith('--')) throw new Error(`${flag} 값이 필요합니다`); return args[i + 1]; };
const flags = new Set(['--out', '--only', '--since', '--until', '--delay-ms', '--max-requests', '--plan', '--list', '--help']);
for (let i = 0; i < args.length; i++) { if (!flags.has(args[i])) throw new Error(`알 수 없는 옵션: ${args[i]}`); if (['--out', '--only', '--since', '--until', '--delay-ms', '--max-requests'].includes(args[i])) i++; }
if (args.includes('--help')) {
  console.log('node tools/collect-kosis.mjs [--out docs/research/kosis/run-name] [--only life-table,death-causes] [--since 1960] [--until 2026] [--plan] [--delay-ms 400] [--max-requests 1500]\n동일 --out 경로로 재실행하면 검증된 완료 청크를 재사용합니다. 키: KOSIS_API_KEY 또는 .env.local');
  process.exit(0);
}
if (args.includes('--list')) { for (const s of CATALOG) console.log(`${s.id}: ${s.title} — ${s.purpose}`); process.exit(0); }

// Existing environment takes priority. Never print the key, or a URL containing it.
const providedKey = process.env.KOSIS_API_KEY;
try { process.loadEnvFile(path.join(ROOT, '.env.local')); } catch (e) { if (e.code !== 'ENOENT') throw e; }
if (providedKey) process.env.KOSIS_API_KEY = providedKey;
const key = process.env.KOSIS_API_KEY?.trim();
if (!key || /^(your_|replace|여기에)/i.test(key)) { console.error('.env.local 또는 환경변수 KOSIS_API_KEY에 발급받은 키를 설정하세요.'); process.exit(1); }
const since = Number(option('--since', '1960')), until = Number(option('--until', String(new Date().getUTCFullYear())));
if (!Number.isInteger(since) || !Number.isInteger(until) || since < 1900 || until < since || until > new Date().getUTCFullYear()) throw new Error('연도 범위를 확인하세요 (1900~현재 연도)');
const delay = Number(option('--delay-ms', '400')), maxRequests = Number(option('--max-requests', '1500'));
if (!Number.isFinite(delay) || delay < 200 || !Number.isInteger(maxRequests) || maxRequests < 1) throw new Error('delay는 200ms 이상, max-requests는 양의 정수여야 합니다');
const wanted = option('--only', '').split(',').filter(Boolean);
if (wanted.some(id => !CATALOG.some(s => s.id === id))) throw new Error('알 수 없는 수집 항목 (--list로 확인)');
const catalog = CATALOG.filter(s => !wanted.length || wanted.includes(s.id));
const out = path.resolve(ROOT, option('--out', `docs/research/kosis/${new Date().toISOString().replace(/[:.]/g, '-')}`));
if (!out.startsWith(ROOT + path.sep) || out === ROOT) throw new Error('출력 경로는 프로젝트 안의 하위 디렉터리여야 합니다');
await fs.mkdir(out, { recursive: true });
const manifestPath = path.join(out, 'manifest.json');
const jsonFile = async (file, data) => { await fs.writeFile(file + '.tmp', JSON.stringify(data, null, 2) + '\n'); await fs.rename(file + '.tmp', file); };
let manifest;
try { manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8')); } catch (e) { if (e.code !== 'ENOENT') throw e; }
if (manifest && (manifest.since !== since || manifest.until !== until || JSON.stringify(manifest.catalog) !== JSON.stringify(catalog))) throw new Error('기존 수집과 연도·대상 설정이 다릅니다. 다른 --out 경로를 사용하세요.');
manifest ||= { schemaVersion: 1, startedAt: new Date().toISOString(), since, until, catalog, apiGuide: 'https://kosis.kr/openapi/devGuide/devGuide_0201List.do', datasets: {}, requestCount: 0 };
let count = 0, lastCall = 0;
async function api(endpoint, parameters) {
  for (let attempt = 0; attempt < 3; attempt++) {
    if (count >= maxRequests) throw new KosisError('실행당 최대 요청 수 도달. 같은 --out으로 이어서 실행하세요.', 'BUDGET');
    await pause(Math.max(0, lastCall + delay - Date.now())); lastCall = Date.now(); count++; manifest.requestCount++;
    const u = new URL(endpoint, API_ROOT); u.search = new URLSearchParams({ ...parameters, apiKey: key });
    try {
      const response = await fetch(u, { signal: AbortSignal.timeout(30000), redirect: 'error' });
      if (response.status === 429) throw new KosisError('호출 제한 응답. 요청을 중단합니다.', 'RATE');
      if (!response.ok) { const e = new KosisError(`HTTP ${response.status}`, String(response.status)); if (response.status >= 500) throw e; return Promise.reject(e); }
      return parseResponse(await response.text(), key);
    } catch (e) {
      // Semantic API errors are not retried; no invented fallback data.
      if (e instanceof KosisError && e.code !== '50' && !/^5\d\d$/.test(e.code)) throw e;
      if (attempt === 2) throw new KosisError(e instanceof KosisError ? e.message : `네트워크 오류 (${e.name})`, e.code || 'NETWORK');
      await pause(1000 * 2 ** attempt);
    }
  }
}
const fatal = isFatalAPIError;
const envelope = (endpoint, params, data) => ({ fetchedAt: new Date().toISOString(), endpoint: API_ROOT + endpoint, parameters: params, data });
async function metadata(spec, dir) {
  const file = path.join(dir, 'metadata.json');
  try { return JSON.parse(await fs.readFile(file, 'utf8')); } catch (e) { if (e.code !== 'ENOENT') throw e; }
  const meta = {};
  for (const type of ['TBL', 'ITM', 'PRD', 'SOURCE', 'CMMT']) {
    const params = { method: 'getMeta', type, orgId: spec.orgId, tblId: spec.tblId, format: 'json', jsonVD: 'Y', ...(type === 'PRD' && { detail: 'Y' }) };
    try { meta[type] = envelope(META_PATH, params, await api(META_PATH, params)); }
    catch (e) { if (fatal(e) || ['ITM', 'PRD'].includes(type)) throw e; meta[type] = { error: safeMessage(e.message, key), code: e.code }; }
  }
  await jsonFile(file, meta); return meta;
}
async function exportCsv(dir, files) {
  const dest = path.join(dir, 'observations.csv.gz'), temp = dest + '.tmp';
  const gzip = createGzip(), disk = createWriteStream(temp), done = pipeline(gzip, disk);
  const write = async text => { if (!gzip.write(text)) await once(gzip, 'drain'); };
  await write('\uFEFF' + CSV_HEADERS.join(',') + '\n');
  const periods = new Set(), items = new Set(), units = new Set(); let rows = 0, numeric = 0;
  for (const file of files) {
    const wrapped = JSON.parse(gunzipSync(await fs.readFile(path.join(dir, file.path))).toString('utf8'));
    for (let i = 0; i < wrapped.data.length; i += 1000) {
      const batch = wrapped.data.slice(i, i + 1000);
      await write(batch.map(normalizeRow).join('\n') + '\n');
      for (const r of batch) { rows++; numeric += numericValue(r.DT) != null; periods.add(r.PRD_DE); items.add(r.ITM_NM); if (r.UNIT_NM) units.add(r.UNIT_NM); }
    }
  }
  gzip.end(); await done; await fs.rename(temp, dest);
  const bytes = await fs.readFile(dest);
  return { rows, numeric, symbolsOrMissing: rows - numeric, periods: [...periods].sort(), items: [...items].sort(), units: [...units].sort(), csv: { path: 'observations.csv.gz', bytes: bytes.length, sha256: sha(bytes) } };
}
async function report() {
  manifest.updatedAt = new Date().toISOString();
  await jsonFile(manifestPath, manifest);
  const lines = ['# KOSIS 일회성 자료 수집', '', `시작: ${manifest.startedAt}`, `수집 범위: ${since}~${until} 중 API 실제 수록시점. 연간 우선, 없으면 분기 등 원주기를 보존합니다.`, '', '|항목|상태|관측값 수|실제 기간|', '|---|---|---:|---|'];
  for (const spec of catalog) { const d = manifest.datasets[spec.id]; if (!d) continue; lines.push(`|${spec.title}|${d.status}|${d.rows || 0}|${d.periods?.[0] || ''}~${d.periods?.at(-1) || ''}|`); }
  lines.push('', '각 폴더: metadata.json(분류·단위·시점·출처·주석), selection.json(선택 범위), raw/*.json.gz(원응답과 키 없는 요청 조건), observations.csv.gz(정규화 자료), summary.json(건수·품질·해시·실패).', '', '키와 인증 URL은 저장하지 않습니다. 자료는 게임이나 배포 결과물에 자동 포함되지 않습니다.', '결측·비공개·통계 기호는 0으로 바꾸지 않습니다. 계/소계와 세부 항목이 함께 있으므로 전 행을 합산하면 중복됩니다.', '금액은 원자료 명목 단위입니다. 월평균 임금·가계 소득을 연봉과 혼동하지 마세요. 유병률은 연간 발병확률이 아닙니다.', '기관·조사·분류 개편 전후 수치는 주석과 단위를 검토한 뒤 게임에 반영해야 합니다.', 'CSV unit은 API의 UNIT_NM 원문입니다. 임금 분포의 만원% 같은 혼합 단위나 가계수지의 가구원수 행에 표시된 원은 행의 실제 단위로 그대로 적용하면 안 됩니다. 분류 코드·항목·주석으로 지표를 구분하세요.', '', '실패·빈 청크는 summary.json에 남으며, 일부 수집을 전체 성공으로 표시하지 않습니다.', '동일 옵션과 --out 경로로 재실행하면 완료 청크의 SHA-256과 요청 조건을 검사하고 재사용합니다.');
  await fs.writeFile(path.join(out, 'README.md'), lines.join('\n') + '\n');
}
let stopped = false;
for (const [index, spec] of catalog.entries()) {
  const dir = path.join(out, spec.id); await fs.mkdir(path.join(dir, 'raw'), { recursive: true });
  const previousHashes = new Map((manifest.datasets[spec.id]?.chunks || []).map(c => [c.path, c.sha256]));
  const info = { ...spec, status: 'collecting', chunks: [], failures: [], sourceUrl: `https://kosis.kr/statHtml/statHtml.do?orgId=${spec.orgId}&tblId=${spec.tblId}` };
  manifest.datasets[spec.id] = info;
  console.log(`[${index + 1}/${catalog.length}] ${spec.title} (${spec.tblId})`);
  try {
    const meta = await metadata(spec, dir);
    const periodInfo = periodsOf(meta.PRD.data, { since, until }), selected = selectDimensions(meta.ITM.data, spec);
    const plan = planRequests(spec, selected, periodInfo);
    await jsonFile(path.join(dir, 'selection.json'), { ...selected, ...periodInfo, requests: plan, purpose: spec.purpose });
    if (args.includes('--plan')) { info.status = 'planned'; info.plannedRequests = plan.length; await report(); continue; }
    for (const [i, params] of plan.entries()) {
      const relative = `raw/${String(i + 1).padStart(4, '0')}-${sha(JSON.stringify(params)).slice(0, 12)}.json.gz`, file = path.join(dir, relative);
      try {
        let bytes, stored;
        try { bytes = await fs.readFile(file); if (previousHashes.has(relative) && sha(bytes) !== previousHashes.get(relative)) throw new Error('SHA-256 불일치'); stored = JSON.parse(gunzipSync(bytes).toString('utf8')); if (JSON.stringify(stored.parameters) !== JSON.stringify(params)) throw new Error('청크 요청 조건 불일치'); validateRows(stored.data, spec, params); }
        catch (e) { if (e.code !== 'ENOENT') throw new KosisError('기존 청크가 손상되었습니다. 원본 보존 후 다른 --out으로 재수집하세요.', 'CACHE'); }
        if (!stored) {
          const data = await api(DATA_PATH, params); validateRows(data, spec, params);
          if (!data.length) throw new KosisError('조회 범위에 관측값 없음', 'EMPTY');
          stored = envelope(DATA_PATH, params, data); bytes = gzipSync(JSON.stringify(stored));
          await fs.writeFile(file + '.tmp', bytes); await fs.rename(file + '.tmp', file);
        }
        info.chunks.push({ path: relative, rows: stored.data.length, sha256: sha(bytes), bytes: bytes.length });
        if (i % 10 === 0 || i === plan.length - 1) console.log(`  ${i + 1}/${plan.length} 청크 · ${info.chunks.reduce((n, f) => n + f.rows, 0).toLocaleString()}행`);
      } catch (e) { info.failures.push({ parameters: params, code: e.code || 'ERROR', message: safeMessage(e.message, key) }); if (fatal(e)) { stopped = true; break; } }
      if (i % 10 === 0) await report();
    }
    if (info.chunks.length) Object.assign(info, await exportCsv(dir, info.chunks));
    info.status = info.failures.length ? (info.rows ? 'partial' : 'failed') : info.rows ? 'complete' : 'empty';
  } catch (e) { info.status = 'failed'; info.failures.push({ code: e.code || 'ERROR', message: safeMessage(e.message, key) }); if (fatal(e)) stopped = true; }
  await jsonFile(path.join(dir, 'summary.json'), info); await report();
  console.log(`  ${info.status} · ${(info.rows || 0).toLocaleString()}행${info.failures.length ? ` · 오류 ${info.failures.length}건` : ''}`);
  if (stopped) break;
}
await report();
const finished = Object.values(manifest.datasets), rows = finished.reduce((n, d) => n + (d.rows || 0), 0);
console.log(`저장: ${path.relative(ROOT, out)}\n완료 ${finished.filter(d => d.status === 'complete').length}/${catalog.length}개 표 · ${rows.toLocaleString()}행 · 이번 실행 ${count}요청`);
if (!args.includes('--plan') && (finished.length !== catalog.length || finished.some(d => d.status !== 'complete'))) process.exitCode = 2;
