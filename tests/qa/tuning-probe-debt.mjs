// QA-S 말년 부채 눈덩이 수정안 검증(src 복사본 패치): ① 시설 거주 비용 1,800→900 ② 신용대출 상한 INC×3(최저 3,000) ③ 둘 다.
// 실행: node tests/qa/tuning-probe-debt.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const HERE = path.dirname(fileURLToPath(import.meta.url)), SRC = path.resolve(HERE, '../../src'), OUT = path.resolve(HERE, 'out/variants-debt');
fs.rmSync(OUT, { recursive: true, force: true });
async function variant(name, patches) {
  const dir = path.join(OUT, name, 'src'); fs.cpSync(SRC, dir, { recursive: true });
  for (const [from, to] of patches) { const f = path.join(dir, 'engine/systems/money.js'); const s = fs.readFileSync(f, 'utf8'); if (!s.includes(from)) throw new Error('패치 대상 없음: ' + from); fs.writeFileSync(f, s.replace(from, to)); }
  return import(pathToFileURL(path.join(dir, 'engine/index.js')).href);
}
const FAC = ["h.tenure === 'facility' ? 1800 * eraI : 0", "h.tenure === 'facility' ? 900 * eraI : 0"];
const CAP = ['if (m.assets < 0) { m.loans.credit += -m.assets; m.assets = 0; refreshDebt(L); }', 'if (m.assets < 0) { m.loans.credit = Math.min(m.loans.credit - m.assets, Math.max(3000, INC * 3)); m.assets = 0; refreshDebt(L); }'];
const q = (a, p) => [...a].sort((x, y) => x - y)[Math.floor(p * a.length)];
async function measure(label, E, n = 700) {
  const debts = [], cred80 = [], dsr = [];
  for (let i = 0; i < n; i++) { const L = E.runToEnd(E.newLife({ seed: 4_000_000 + i })); debts.push(L.money.debt); if (L.death.age >= 80) cred80.push(L.money.loans.credit); }
  console.log(`${label}: 사망 시 부채>1억 ${(debts.filter(x => x > 10000).length / n * 100).toFixed(1)}% · >3억 ${(debts.filter(x => x > 30000).length / n * 100).toFixed(1)}% · 최대 ${Math.max(...debts)} · 80+ 신용대출 p50 ${q(cred80, .5)} p90 ${q(cred80, .9)} p99 ${q(cred80, .99)}`);
}
await measure('기준', await variant('base', []));
await measure('① 시설비 900', await variant('fac', [FAC]));
await measure('② 신용대출 상한 INC×3', await variant('cap', [CAP]));
await measure('③ ①+②', await variant('both', [FAC, CAP]));
