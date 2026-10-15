// QA 공용: worker_threads 풀 + 집계기. 각 qa 스크립트는 같은 파일을 워커로 재실행한다.
//   main:   const res = await pool(import.meta.url, chunks)   // 청크마다 워커에서 work(chunk) 실행
//   worker: export 없이 파일 끝에서 serve(work)
import { Worker, isMainThread, parentPort } from 'node:worker_threads';
import { fileURLToPath } from 'node:url';
import os from 'node:os';

export { isMainThread };

export async function pool(fileUrl, chunks, workers = Math.max(1, os.cpus().length - 1)) {
  const out = new Array(chunks.length);
  let next = 0, done = 0;
  const t0 = Date.now();
  await Promise.all(Array.from({ length: Math.min(workers, chunks.length) }, () => new Promise((resolve, reject) => {
    const w = new Worker(fileURLToPath(fileUrl), { argv: process.argv.slice(2) });
    const feed = () => {
      if (next >= chunks.length) { w.terminate(); resolve(); return; }
      const i = next++;
      w.postMessage({ i, job: chunks[i] });
    };
    w.on('message', m => { out[m.i] = m.out; if (++done % Math.max(1, Math.floor(chunks.length / 10)) === 0) process.stderr.write(`  ${done}/${chunks.length} (${((Date.now() - t0) / 1000).toFixed(0)}s)\n`); feed(); });
    w.on('error', reject);
    feed();
  })));
  return out;
}

export function serve(work) {
  parentPort.on('message', ({ i, job }) => parentPort.postMessage({ i, out: work(job) }));
}

// 집계기: key → [n, sum, sumsq]
export class Agg {
  constructor() { this.m = {}; }
  add(k, x = 1) { const a = (this.m[k] ||= [0, 0, 0]); a[0]++; a[1] += x; a[2] += x * x; }
  toJSON() { return this.m; }
}
export function mergeAgg(list) {
  const m = {};
  for (const o of list) for (const [k, v] of Object.entries(o)) { const a = (m[k] ||= [0, 0, 0]); a[0] += v[0]; a[1] += v[1]; a[2] += v[2]; }
  return new Proxy(m, { get: (t, k) => (k in t ? t[k] : [0, 0, 0]) });
}
export const mean = a => (a[0] ? a[1] / a[0] : NaN);
export const sd = a => (a[0] > 1 ? Math.sqrt(Math.max(0, a[2] / a[0] - (a[1] / a[0]) ** 2)) : NaN);
export const pct = (x, d = 1) => (x * 100).toFixed(d);
export const fx = (x, d = 2) => (Number.isFinite(x) ? x.toFixed(d) : 'NaN');

export function range(n, size) {
  const out = [];
  for (let i = 0; i < n; i += size) out.push([i, Math.min(n, i + size)]);
  return out;
}
export function table(rows, header) {
  const l = ['| ' + header.join(' | ') + ' |', '|' + header.map(() => '---').join('|') + '|'];
  for (const r of rows) l.push('| ' + r.join(' | ') + ' |');
  return l.join('\n');
}
