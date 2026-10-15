// QA-S 생애 샘플 훑어보기. 실행: node tests/qa/samples.mjs [개수=20] [seed0] > out/samples.txt
// 층화: 출생 분위·시대·사망 연령대가 고루 나오게 후보 600생애 중 20개를 고른다(default 15 + random 5).
import * as E from '../../src/engine/index.js';
import { hashSeed, makeRng, rand } from '../../src/engine/rng.js';

const N = Number(process.argv[2] || 20), S0 = Number(process.argv[3] || 21_000_000);
const randomPolicy = (L, req) => req.options[Math.floor(rand(makeRng(hashSeed(L.seed, 'qa-sample', req.age, req.eventId))) * req.options.length)].id;
const cands = [];
for (let i = 0; i < 600; i++) {
  const seed = S0 + i, rnd = i % 4 === 3;
  const L = E.runToEnd(E.newLife({ seed }), rnd ? randomPolicy : 'default');
  cands.push({ seed, L, rnd });
}
// 층: (분위 1~5) × (사망 연령대 <30, 30~64, 65~84, 85+) 에서 한 개씩 우선
const bucket = c => `${c.L.birth.quintile}|${c.L.death.age < 30 ? 0 : c.L.death.age < 65 ? 1 : c.L.death.age < 85 ? 2 : 3}`;
const picked = [], seen = new Set();
for (const c of cands) { const b = bucket(c); if (!seen.has(b) && picked.length < N) { seen.add(b); picked.push(c); } }
for (const c of cands) if (picked.length < N && !picked.includes(c)) picked.push(c);
picked.sort((a, b) => a.seed - b.seed);

for (const { seed, L, rnd } of picked.slice(0, N)) {
  const S = E.summarize(L, { peers: true });
  const b = S.birthCert;
  console.log(`\n══════ seed ${seed} (${rnd ? 'random' : 'default'} 정책) ${L.name} · ${b.sex} · ${b.date} · ${b.regionLabel} · ${L.death.age}세 사망(${L.death.year}) ══════`);
  console.log(`출생: ${b.story.join(' ')} | ${b.parentsLine} | ${b.accessLine} | ${b.eraLine}`);
  console.log(`판정문: ${S.verdict.main}`);
  console.log(`   《${S.epilogue.title}》 ${S.epilogue.paragraphs.join(' ¶ ')}`);
  console.log('연표: ' + S.timeline.map(t => `[${t.age}] ${t.text}${t.choice ? ` (${t.choice.label}${t.choice.auto ? '·자동' : ''})` : ''}`).join('  '));
  console.log('결산: ' + Object.entries(S.closing).map(([k, v]) => `${v.label} ${v.value} "${v.line}"`).join(' | '));
  console.log('이슈 상위: ' + S.issues.slice(0, 3).map(i => `${i.label} ${i.value}`).join(', '));
  console.log('동료: ' + S.peers.map(p => `${p.name}(${p.sex}·${p.regionLabel}·${p.deathAge ?? '-'}세) ${p.line}`).join(' // '));
  // 상태 사실(논리 검증용)
  const f = L.family;
  console.log(`[사실] 혼인 ${f.marriedYear ?? '-'} 이혼 ${f.divorced ? 'Y' : 'N'} 사별 ${f.widowed ? 'Y' : 'N'} 자녀 ${f.children.length}(생존 ${f.children.filter(c => c.alive).length}) 손주 ${f.grandchildren || 0} | 학력 ${L.edu.level} | 직업이력 ${L.job.history.map(h => h.title).join(' → ') || '-'} | 주거이동 ${L.home.moves.length}회 | 군 ${L.mil.status} | 선택 ${L.choices.filter(c => !c.forced).length}(자동 ${L.choices.filter(c => !c.forced && c.auto).length})`);
}
