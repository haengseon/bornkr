// QA-S 전체 재실행: node tests/qa/run-all.mjs [빠르게=fast]
// 각 스크립트의 표준출력을 tests/qa/out/<이름>.txt에 저장한다. 전체 약 30분(8코어), fast는 표본을 줄여 약 8분.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const fast = process.argv[2] === 'fast';
const JOBS = [
  ['stability', fast ? ['2000', '200'] : ['10000', '1000']],
  ['explain-audit', ['200']],
  ['content-audit', fast ? ['500'] : ['2000']],
  ['clock-budget', fast ? ['200'] : ['1000']],
  ['variance', fast ? ['300', '40'] : ['2000', '120']],
  ['stats-mc', fast ? ['2000', '0.1'] : ['20000', '1']],
  ['suicide-bias', fast ? ['5000'] : ['40000']],
  ['safety-checks', []],
  ['perf-peers', ['100']],
  ['misc-probes', fast ? ['300'] : ['1500']],
];
fs.mkdirSync(path.join(here, 'out'), { recursive: true });
for (const [name, args] of JOBS) {
  const t0 = Date.now();
  const r = spawnSync(process.execPath, [path.join(here, `${name}.mjs`), ...args], { encoding: 'utf8', maxBuffer: 1 << 28 });
  fs.writeFileSync(path.join(here, 'out', `${name}.txt`), r.stdout + (r.stderr ? `\n--- stderr ---\n${r.stderr.slice(-2000)}` : ''));
  console.log(`${r.status === 0 ? 'OK  ' : 'FAIL'} ${name} ${args.join(' ')} (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
}
