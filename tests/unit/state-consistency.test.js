// 주거·일 상태와 그 표시의 정합성(사용자 신고: 집을 샀는데 월세/전세로 보임, 인턴을 했는데 구직 중으로 보임).
// 여러 시드(기본·무작위 정책)를 해마다 끝 상태로 검사한다.
import test from 'node:test';
import assert from 'node:assert/strict';
import { newLife, advanceYear, choose } from '../../src/engine/index.js';
import { profileOf, TENURE_LABEL } from '../../src/ui/profile.js';
import { makeAct, ownShare } from '../../src/engine/act.js';
import { makeCtx } from '../../src/engine/life.js';
import { step as careerStep } from '../../src/engine/systems/career.js';

const working = s => s === 'employed' || s === 'self';
const SOLD = e => e.id === 'sys.home.move' || e.id === 'sys.home.sell' || e.id === 'sys.home.region_cause' || e.id === 'sys.home.buy_fail'
  || ['sys.chain.mortgage', 'sys.money.crunch', 'sys.home.relocate', 'sys.home.hometown', 'sys.home.expire', 'sys.home.renew', 'sys.job.lost', 'sys.fam.divorce'].includes(e.id);
const ENDED = /^sys\.job\.(lose|business_close|career_break|exit_main|contract_end|retire|lost)$|^sys\.era\.shock$|^sys\.job\.after_main$/;
const START = new Set(['sys.job.first', 'sys.job.reemploy', 'sys.job.return', 'sys.job.business_open', 'sys.job.exam_pass']);

function check(seed, random) {
  const L = newLife({ seed }), bad = [];
  let r = 7 * seed + 1; const rnd = () => ((r = (r * 1103515245 + 12345) >>> 0) / 2 ** 32);
  let at = 0, seen = L.year;
  while (L.alive) {
    if (L.pending) { const o = L.pending.options; choose(L, random ? o[Math.floor(rnd() * o.length)].id : L.pending.defaultId, { auto: !random }); continue; }
    if (L.year === seen) { advanceYear(L); continue; }
    seen = L.year;                                     // 그해 선택까지 모두 끝난 상태
    const h = L.home, j = L.job, y = L.year, tag = `seed ${seed}${random ? 'r' : ''} ${y} ${L.age}세`;
    const ys = L.log.slice(at).filter(e => e.year === y); at = L.log.length;
    // (a) 주거: 소유 ⇔ 자가, 자가에는 보증금·월세·전세대출이 없다
    if (h.owned !== (h.tenure === 'own') && !h.parents) bad.push(`${tag} owned=${h.owned} tenure=${h.tenure}`);
    if (h.owned && !h.parents && (h.deposit > 0 || h.rent > 0 || (L.flags.indep != null && L.money.loans.jeonse > 0))) bad.push(`${tag} 자가인데 보증금 ${h.deposit}·월세 ${h.rent}·전세대출 ${L.money.loans.jeonse}`);
    if (h.tenure === 'monthly' && !h.parents && L.flags.indep != null && !(h.rent > 0)) bad.push(`${tag} 월세인데 월세 0`);
    if (h.parents && L.mil?.status === 'serving' && ys.some(e => e.id === 'sys.home.independence')) bad.push(`${tag} 복무 중 독립 질문`);
    // 집을 샀다는 기록 뒤 같은 해에 그 집을 판 기록이 없으면 그해 끝에 자가여야 한다
    const bi = ys.findIndex(e => e.id === 'sys.home.bought');
    if (bi >= 0 && !h.owned && !ys.slice(bi + 1).some(SOLD)) bad.push(`${tag} 집을 산 해 끝에 ${h.tenure}`);
    // 매수 직후 같은 해에 만기 정산이 새 집을 팔지 않는다(순서 꼬임)
    if (bi >= 0 && ys.slice(bi + 1).some(e => e.id === 'sys.home.expire')) bad.push(`${tag} 매수 뒤 만기 정산`);
    // 표시: 성인이 부모 집에 살면 '부모 집', 아니면 엔진 점유 형태 그대로
    const p = profileOf(L);
    if (L.age >= 19) {
      const want = h.parents ? '부모 집' : TENURE_LABEL[h.tenure];
      if (p.home.tenureLabel !== want) bad.push(`${tag} 표시 ${p.home.tenureLabel} ≠ ${want}`);
    }
    // (b) 일: 일자리를 잡은 기록이 있는 해 끝에는 일하는 중(뒤이어 그만둔 기록이 없으면)
    const si = ys.findIndex(e => START.has(e.id));
    if (si >= 0 && !working(j.status) && !ys.slice(si + 1).some(e => ENDED.test(e.id))) bad.push(`${tag} ${ys[si].id} 뒤 ${j.status}`);
    // 직업 사건은 그 일을 하는 동안에만
    const je = ys.find(e => /^job\./.test(e.id || ''));
    if (je && !working(j.status) && j.status !== 'military' && !ys.some(e => ENDED.test(e.id))) bad.push(`${tag} ${je.id} 인데 ${j.status}`);
    // 짧은 일은 그 기간 동안 그 형태로 보이고, 끝나면 지워진다
    if (j.gig && !working(j.status) && j.status !== 'student' && p.work.emp.label !== j.gig.kind) bad.push(`${tag} 짧은 일 ${j.gig.kind} 표시 ${p.work.emp.label}`);
    if (j.gig && j.gig.until < y) bad.push(`${tag} 끝난 짧은 일이 남음`);
    if (working(j.status) && /^(구직 중|무직|은퇴|일 쉬는 중)$/.test(p.work.emp.label)) bad.push(`${tag} 일하는데 ${p.work.emp.label}`);
    if (!working(j.status) && ['정규직', '비정규직', '시간제', '자영업'].includes(p.work.emp.label)) bad.push(`${tag} 쉬는데 ${p.work.emp.label}`);
  }
  return bad;
}

test('주거·일 상태와 표시가 어긋나지 않는다(기본·무작위 정책, 여러 시드)', () => {
  const seeds = [1044, 1137, 1007, 1048, 1017, 1025, ...Array.from({ length: 14 }, (_, i) => 3000 + i * 37)];
  const bad = seeds.flatMap((s, i) => check(s, i % 2 === 1));
  assert.deepEqual(bad.slice(0, 10), [], `${bad.length}건`);
});

test('짧은 일: 기간 동안 그 형태로 표시, 끝나면 상태 전이를 로그로 남긴다', () => {
  const L = newLife({ seed: 77 });
  L.age = 66; L.year += 66;
  Object.assign(L.job, { status: 'retired', title: '', history: [] });
  L.flags.afterWork = 'rest';                          // 은퇴 뒤 쉬기로 한 사람: career.step이 다른 상태 변화를 만들지 않는다
  makeAct(L, makeCtx(L)).startGig('시니어 일자리');
  assert.equal(profileOf(L).work.emp.label, '시니어 일자리');
  assert.equal(profileOf(L).work.jobLine, '시니어 일자리');
  L.year++; L.age++;
  const n = L.log.length;
  careerStep(L, makeCtx(L));
  assert.ok(L.log.slice(n).some(e => e.id === 'sys.job.gig_end' && e.text.includes('시니어 일자리')), '끝난 기록');
  assert.equal(L.job.gig, null);
  assert.equal(profileOf(L).work.emp.label, '은퇴');
  // 정식 일자리를 잡으면 짧은 일은 지워지고, 일하는 중에는 새로 붙지 않는다
  const act = makeAct(L, makeCtx(L));
  act.startGig('아르바이트');
  act.hire();
  assert.ok(working(L.job.status) && L.job.gig == null);
  act.startGig('인턴');
  assert.equal(L.job.gig, null);
});

test('보증금은 현금부터(비상금 300만 원 남김), 모자라면 대출', () => {
  assert.equal(ownShare(72000, 16000, 0.8), 16000);   // 현금 7.2억이면 전세대출 없이
  assert.equal(ownShare(1000, 5000, 0.8), 1000);      // 최소 자기 부담(20%)은 있는 현금으로
  assert.equal(ownShare(0, 5000, 0.8), 0);
});
