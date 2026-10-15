// QA-S 말년 부채 눈덩이: 사망 시 부채·신용대출 분위, 시설 거주 비율. 실행: node tests/qa/probe-debt.mjs
import * as E from '../../src/engine/index.js';
import { econ } from '../../src/engine/stats.js';
const N = 800, debts = [], dsrMaxByAge = {}, fac = [];
let over1 = 0, over3 = 0, any = 0, deathDsr = [];
for (let s = 4000000; s < 4000000 + N; s++) {
  const L = E.runToEnd(E.newLife({ seed: s }));
  const d = L.money.debt, c = L.money.loans.credit;
  debts.push([L.death.age, d, c, L.home.tenure, L.health.care]);
  if (d > 10000) over1++; if (d > 30000) over3++; if (c > 0) any++;
  deathDsr.push(econ(L).dsr);
}
const q = (a, p) => { const x = [...a].sort((u, v) => u - v); return x[Math.floor(p * x.length)]; };
const oldOnes = debts.filter(x => x[0] >= 80);
console.log(`N=${N}: 사망 시 부채 >1억 ${(over1 / N * 100).toFixed(1)}% · >3억 ${(over3 / N * 100).toFixed(1)}% · 신용대출 잔액>0 ${(any / N * 100).toFixed(1)}%`);
console.log(`사망 시 부채 분위(만 원): p50 ${q(debts.map(x => x[1]), .5)} p75 ${q(debts.map(x => x[1]), .75)} p90 ${q(debts.map(x => x[1]), .9)} p99 ${q(debts.map(x => x[1]), .99)} max ${Math.max(...debts.map(x => x[1]))}`);
console.log(`80세+ 사망(n=${oldOnes.length}): 신용대출 p50 ${q(oldOnes.map(x => x[2]), .5)} p90 ${q(oldOnes.map(x => x[2]), .9)}; 시설 거주 비율 ${(oldOnes.filter(x => x[3] === 'facility').length / oldOnes.length * 100).toFixed(0)}%`);
console.log('사망 시 DSR(원리금/소득) p50', q(deathDsr, .5).toFixed(2), 'p90', q(deathDsr, .9).toFixed(2), '>1 비율', (deathDsr.filter(x => x > 1).length / N * 100).toFixed(1) + '%');
