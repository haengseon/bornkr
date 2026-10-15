// QA-S 결함 재현 시드 찾기/확인. 실행: node tests/qa/repro.mjs
import * as E from '../../src/engine/index.js';
import { advance, resolve } from '../../src/engine/life.js';

const S0 = 3_000_000;
const found = {};
const want = (k, n = 2) => (found[k] ||= []).length < n;
for (let s = S0; s < S0 + 3000; s++) {
  const L = E.newLife({ seed: s });
  const ages = {};
  while (L.alive) {
    advance(L);
    if (L.pending) {
      const r = L.pending;
      if (r.eventId === 'sys.edu.path' && r.options.length === 1 && want('edu.path.single')) found['edu.path.single'].push(`seed ${s} age ${L.age} options=${r.options.map(o => o.id)}`);
    }
    while (L.pending) resolve(L, L.pending.defaultId, { auto: true });
  }
  const rem = L.log.filter(e => e.id === 'sys.fam.remarry' && e.age >= 80);
  if (rem.length && want('remarry80')) found.remarry80.push(`seed ${s}: 재혼 ${rem[0].age}세 (사망 ${L.death.age}세)`);
  const bought0 = L.log.find(e => e.id === 'sys.home.bought' && /대출 0만 원/.test(e.text));
  if (bought0 && want('bought0')) found.bought0.push(`seed ${s} age ${bought0.age}: ${bought0.text}`);
  const S = E.summarize(L, { peers: false });
  const nn = S.timeline.filter(t => t.text === '힘든 일을 겪었다.').length;
  if (nn >= 5 && want('neutral5')) found.neutral5.push(`seed ${s}: 연표 ${S.timeline.length}줄 중 "힘든 일을 겪었다." ${nn}줄`);
  const c = L.money.loans.credit;
  if (c > 30000 && want('credit')) found.credit.push(`seed ${s}: 사망 ${L.death.age}세, 신용대출 ${c}만 원, 거주 ${L.home.tenure}, 연금 ${L.aging.pensionMonthly}+기초 ${L.aging.basic}`);
  if (L.job.history[0]?.title === '직업 운동선수' && want('athlete')) found.athlete.push(`seed ${s}: 첫 직업 직업 운동선수 (${L.sex}, 학력 ${L.edu.level}, 출생 ${L.birth.year})`);
  if (L.cmp?.[70] && /배우자/.test(L.cmp[70]) && !L.family.partner && want('cmp70')) found.cmp70.push(`seed ${s}: "${L.cmp[70]}" / partner=null, caringFor=${L.family.caringFor}`);
  if (/^1/.test('') ) {}
}
for (const [k, v] of Object.entries(found)) console.log(`${k}:\n  ` + v.join('\n  '));
