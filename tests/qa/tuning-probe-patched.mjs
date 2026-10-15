// QA-S 튜닝 제안 검증 2: tuning.js로 바꿀 수 없는 인라인 계수는 src 복사본(tests/qa/out/variants/*)에 패치해 측정한다(원본 src 불변).
// 실행: node tests/qa/tuning-probe-patched.mjs
//  - 출산 parity 계수(family.js:167), 재혼 연령 감쇠(family.js:133), 말년 신용대출 상한(money.js:84)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.resolve(HERE, '../../src');
const OUT = path.resolve(HERE, 'out/variants');
fs.rmSync(OUT, { recursive: true, force: true });

async function variant(name, patches) {
  const dir = path.join(OUT, name, 'src');
  fs.cpSync(SRC, dir, { recursive: true });
  for (const [file, from, to] of patches) {
    const f = path.join(dir, file);
    let s = fs.readFileSync(f, 'utf8');
    if (!s.includes(from)) throw new Error(`${name}: 패치 대상 없음 ${from}`);
    fs.writeFileSync(f, s.replace(from, to));
  }
  return import(pathToFileURL(path.join(dir, 'engine/index.js')).href);
}
const mean = a => a.reduce((s, x) => s + x, 0) / Math.max(1, a.length);

async function kids(E, label, year = 1970) {
  const k = [], ch = [];
  for (let i = 0; i < 2000; i++) {
    const L = E.newLife({ seed: 111_000_000 + i, forced: { year, sex: 'F' } });
    while (L.alive && L.age < 51) { E.advanceYear(L); while (L.pending) E.choose(L, L.pending.defaultId, { auto: true }); }
    if (L.alive || L.death.age >= 50) { k.push(L.family.children.length); ch.push(L.family.children.length === 0 ? 1 : 0); }
  }
  console.log(`${label}: ${year}년생 여성 평균 자녀 ${mean(k).toFixed(2)} (목표 1.71) · 무자녀 ${(mean(ch) * 100).toFixed(1)}% (목표 12.3%)`);
}
async function remarry(E, label) {
  const ages = []; let n = 600;
  for (let i = 0; i < n; i++) { const L = E.runToEnd(E.newLife({ seed: 113_000_000 + i })); for (const e of L.log) if (e.id === 'sys.fam.remarry') ages.push(e.age); }
  console.log(`${label}: 재혼 ${ages.length}건/${n}생애 · 중위 ${[...ages].sort((a, b) => a - b)[Math.floor(ages.length / 2)]}세 · 70세+ ${ages.filter(a => a >= 70).length}건 · 80세+ ${ages.filter(a => a >= 80).length}건`);
}

const base = await variant('base', []);
for (const [a,b,c] of [[1.4,0.8,0.3],[1.5,0.9,0.3],[1.6,0.9,0.35]]) await kids(await variant('p'+a+b+c, [['engine/systems/family.js', 'n === 0 ? 1 : n === 1 ? 0.45 : 0.12', 'n === 0 ? '+a+' : n === 1 ? '+b+' : '+c]]), '제안 ('+a+'/'+b+'/'+c+')');
await kids(base, '기준(parity 1/.45/.12)');
await remarry(base, '기준(60세+ 연 1%)');
await remarry(await variant('remarry-a', [['engine/systems/family.js', 'ctx.chance(a < 60 ? 0.03 : 0.01)', 'ctx.chance(a < 60 ? 0.03 : a < 70 ? 0.01 : 0.002)']]), '제안(60~69 1%, 70+ 0.2%)');
