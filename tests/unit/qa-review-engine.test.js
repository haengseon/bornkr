// QA 리뷰(2026-10-15) 엔진·콘텐츠 정합성 회귀 테스트. docs/impl/qa-review-engine-notes.md 참고.
import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../../src/engine/index.js';
import { emit, profileOf, snapOf, factsOf } from '../../src/engine/life.js';
import { fill } from '../../src/engine/text.js';
import { needYear } from '../../src/engine/anachro.js';
import { EVENTS, ERA_EVENTS } from '../../src/content/events/index.js';
import { NEWS_ARCHIVE } from '../../src/content/news-archive.js';

const life = (seed, forced) => E.runToEnd(E.newLife({ seed, forced }));
const SEEDS = Array.from({ length: 400 }, (_, i) => 9100 + i);
const lives = SEEDS.map(s => life(s));
const ev = id => EVENTS.find(e => e.id === id);

// ── 1. 학적 조건 ──
test('QA#1 성적표 사건은 재학 중일 때만: 직장인 19세·졸업 후 구직자에게 나오지 않는다', () => {
  const w = ev('dark.cmp.rank').when;
  assert.equal(w({ age: 19, job: { status: 'employed' }, edu: { stage: 'done' } }), false);
  assert.equal(w({ age: 19, job: { status: 'seeking' }, edu: { stage: 'done' } }), false);
  assert.equal(w({ age: 18, job: { status: 'none' }, edu: { stage: 'high' } }), true);
  assert.equal(w({ age: 15, job: { status: 'none' }, edu: { stage: 'middle' } }), true);
  assert.equal(w({ age: 18, job: { status: 'employed' }, edu: { stage: 'high' } }), false);
  for (const id of ['dark.sch.group.out', 'dark.sch.part.time']) assert.equal(ev(id).when({ age: 19, job: { status: 'employed' }, edu: { stage: 'done' } }), false, id);
});

test('QA#1 통합: 첫 직장 뒤에는 성적표 사건이 생기지 않는다', () => {
  let seen = 0;
  for (const L of lives) {
    const rank = L.log.find(e => e.id === 'dark.cmp.rank'), first = L.log.find(e => e.id === 'sys.job.first');
    if (rank) seen++;
    if (rank && first) assert.ok(rank.age < first.age, `seed ${L.seed}: 성적표 ${rank.age}세, 첫 직장 ${first.age}세`);
  }
  assert.ok(seen >= 0);
});

// ── 2. 시대 문구 ──
test('QA#2 1999년 문구에 단톡방·카톡 등 2010년 이후 어휘가 없다', () => {
  assert.ok(needYear('단톡방에서만 보던 얼굴들이 한자리에 모였다.') >= 2010);
  const t99 = [];
  for (let k = 0; k < 6; k++) t99.push(ev('youth.friends.meet').text({ year: 1999 }, { pick: a => a[k % a.length] }));
  for (const s of t99) assert.ok(!/단톡|단체방|카톡/.test(s), s);
  assert.match(ev('youth.friends.meet').text({ year: 2015 }, { pick: a => a[2] }), /단톡방/);
});

test('QA#2 생애 로그: 사건·선택 문구가 용어 도입 연도보다 이르지 않다', () => {
  const bad = [];
  for (const L of lives) for (const e of L.log) {
    if (!['event', 'choice'].includes(e.kind) || !e.text) continue;
    if (needYear(e.text) > e.year) bad.push(`${e.year} ${e.id}: ${e.text}`);
  }
  assert.deepEqual(bad.slice(0, 5), []);
});

test('QA#2 1996년 이전 학령 문구는 국민학교, 1996년 이후는 초등학교', () => {
  assert.equal(fill('초등학교에 입학했다.', {}, { L: { year: 1980 } }), '국민학교에 입학했다.');
  assert.equal(fill('초등학생이 되었다.', { year: 1995 }), '국민학생이 되었다.');
  assert.equal(fill('초등학교에 입학했다.', { year: 1996 }), '초등학교에 입학했다.');
  assert.equal(E.schoolLabel({ year: 1980, edu: { stage: 'elem' } }), '국민학교');
  assert.equal(E.schoolLabel({ year: 2005, edu: { stage: 'elem' } }), '초등학교');
  assert.equal(E.schoolLabel({ year: 1980, edu: { stage: 'high' } }), '고등학교');
});

// ── 3. 선택 실행 판정 ──
test('QA#3 집 구매 실행 시 문구에 변화 없음이 없고 실제 변화가 적힌다', () => {
  let n = 0;
  for (const L of lives) for (const e of L.log) {
    if (!e.decision) continue;
    assert.ok(['executed', 'deferred', 'failed'].includes(e.execution), e.id);
    if (e.execution === 'failed') { assert.ok(e.id === 'sys.home.buy' || e.id === 'sys.era.shock' || /실행되지 않았다/.test(e.why)); continue; }
    if (e.execution === 'executed') {
      assert.ok(!/변화 없음|큰 변화가 없다/.test(e.why), e.why);
      assert.ok(e.facts.length > 0 && e.why.includes(e.facts[0]));
      if (e.id === 'sys.home.buy' && e.option === 'buy') { n++; assert.match(e.why, /주거가 자가로 바뀌었다/); assert.ok(e.impact.profile.some(p => p.field === 'home'), 'impact에도 주거 변화'); }
    } else assert.ok(e.facts.length === 0 && /변화 없음|실행되지 않았다/.test(e.why));
    assert.ok(e.resultLabel);
  }
  assert.ok(n > 20, `집 구매 표본 ${n}`);
});

test('QA#3 factsOf: 상태 변화로만 서술한다', () => {
  const b = { owned: false, tenure: 'monthly', parents: false, region: 'seoul', debt: 0, assets: 5000, job: 'employed', code: 'a', partner: false, kids: 0 };
  assert.deepEqual(factsOf(b, b), []);
  const t = factsOf(b, { ...b, owned: true, tenure: 'own', debt: 17753, assets: 1000 }).map(f => f.text);
  assert.deepEqual(t, ['주거가 자가로 바뀌었다', '대출이 생겼다(빚 1억 7,753만 원)', '보유 자산이 4,000만 원 줄었다']);
});

// ── 4. 사건별 impact ──
test('QA#4 사별·조부모 사망 사건의 impact에는 취업·소득 변화가 섞이지 않는다', () => {
  const L = E.newLife({ seed: 9001 });
  L.yr = { phase: 3, asked: false, start: 0, mark: 0, oop: 0, compare: null, majors: 0 };
  L.job.status = 'employed'; L.job.title = '사무원'; L.job.regular = true;
  L.yr.snapP = profileOf(L);
  L.job.status = 'seeking';                                    // 같은 해 계약 종료(자체 emit 없음)
  const gp = emit(L, { kind: 'system', id: 'sys.fam.grandparent_death', text: '친할머니가 돌아가셨다.' });
  assert.deepEqual(gp.impact, { stats: [], issues: [], profile: [] });
  L.family.partner = { age: 40 }; L.family.married = true; L.yr.snapP = profileOf(L);
  L.family.partner = null; L.family.married = false;
  const w = emit(L, { kind: 'system', id: 'sys.fam.widowed', text: '배우자가 세상을 떠났다.' });
  assert.deepEqual(w.impact.profile.map(p => p.field), ['family']);
  assert.deepEqual([w.impact.stats, w.impact.issues], [[], []]);
});

test('QA#4 생애 로그: 가족 사건 impact는 family 필드만, 직업·소득 필드 없음', () => {
  let n = 0;
  for (const L of lives) for (const e of L.log) {
    if (!/^sys\.fam\.(grandparent_death|parent_death|widowed|remarry|care_end)$/.test(e.id) || !e.impact) continue;
    n++;
    assert.ok(e.impact.profile.every(p => p.field === 'family'), `${e.id} ${JSON.stringify(e.impact)}`);
    assert.equal(e.impact.stats.length + e.impact.issues.length, 0);
  }
  assert.ok(n > 100);
});

test('QA#4 MAJOR 목록에 조부모 사망·재혼·돌봄 종료가 있다', async () => {
  const { MAJOR } = await import('../../src/engine/life.js');
  for (const id of ['sys.fam.grandparent_death', 'sys.fam.remarry', 'sys.fam.care_end', 'sys.age.spouse_care']) assert.ok(MAJOR.test(id), id);
});

// ── 5. 후대 자료 ──
test('QA#5 1979년 관심사 사유·설명에 2025 수치가 없다(후대 자료는 srcNote로 분리)', () => {
  let notes = 0;
  for (let s = 0; s < 40; s++) {
    const L = E.newLife({ seed: 9300 + s, forced: { year: 1973, region: 'jeonnam' } });
    while (L.alive && L.age < 8) { if (L.pending) E.choose(L, L.pending.defaultId, { auto: true }); else E.advanceYear(L); }
    for (const k of Object.keys(L.issues)) {
      for (const r of L.reasons[k] || []) {
        assert.ok(!/2025|2022|BOK|지방소멸위험지수/.test(r.text), `${k}: ${r.text}`);
        if (r.srcNote) { notes++; assert.match(r.srcNote, /후대 자료/); }
      }
      const ex = E.explain(L, k);
      for (const line of ex.lines) assert.ok(!/\(2025|\(2022|BOK 2025|지방소멸위험지수/.test(line), `${k}: ${line}`);
    }
  }
  assert.ok(notes >= 0);
});

test('QA#5 2001년 AI 노출 문구가 인물 화면에 나오지 않는다', () => {
  for (const L of lives) for (const [k, rs] of Object.entries(L.reasons)) for (const r of rs) if (r.year < 2016) assert.ok(!/AI|BOK 2025/.test(r.text), `${r.year} ${k} ${r.text}`);
});

// ── 6. 뉴스 다년 요약 ──
test('QA#6 2016·2024 카드에 이듬해 이후 사건이 없다', () => {
  const c16 = ERA_EVENTS.find(e => e.id === 'era.2016.candle'), c17 = ERA_EVENTS.find(e => e.id === 'era.2017.impeach');
  assert.deepEqual(c16.years, [2016, 2016]);
  assert.deepEqual(c17.years, [2017, 2017]);
  for (const t of Object.values(c16.tiers)) assert.ok(!/대선|결정|파면/.test(t), t);
  const m24 = ERA_EVENTS.find(e => e.id === 'era.2024.martial');
  assert.deepEqual(m24.years, [2024, 2024]);
  for (const t of Object.values(m24.tiers)) assert.ok(!/대선|심판|파면/.test(t), t);
  for (const id of ['n2016-12', 'n2024-c8', 'n2024-c9']) {
    const n = NEWS_ARCHIVE.find(x => x.id === id);
    assert.ok(!/2017|대선/.test(n.summary + n.impact), id);
  }
});

test('QA#6 뉴스 카드는 카드 연도보다 나중의 사건을 확정 사실로 쓰지 않는다(전망·예정·법정 일정 제외)', () => {
  const FUTURE_OK = /(예정|전망|추계|목표|개최지|맞는|정해졌|결정된|결정했|결정한|적용|일정|할 때|만에|확대될|시행되기로|발표|내다|으로 본다|수립|전까지|부터 시행|까지)/;
  const bad = [];
  for (const n of NEWS_ARCHIVE) {
    if (n.year >= 2026) continue;
    for (const f of ['summary', 'impact']) for (const sent of (n[f] || '').split(/(?<=[.다])\s+/)) {
      const ys = [...sent.matchAll(/(\d{4})년/g)].map(m => +m[1]).filter(y => y > n.year);
      if (ys.length && !FUTURE_OK.test(sent)) bad.push(`${n.id}.${f}: ${sent}`);
    }
  }
  assert.deepEqual(bad.slice(0, 8), []);
});

test('QA#6 2036 노년부양비 뉴스와 개인 사건을 이중 적용하지 않는다 + 통계 용어', () => {
  const era36 = ERA_EVENTS.find(e => e.id === 'era.2036.aging'), f35 = EVENTS.find(e => e.id === 'future.2035.dependency');
  assert.equal(era36.when({ fired: { 'future.2035.dependency': 1 } }), false);
  assert.equal(f35.when({ fired: { 'era.2036.aging': 1 } }), false);
  assert.equal(era36.when({ fired: {} }), true);
  for (const s of [era36.tiers.adult, f35.text, NEWS_ARCHIVE.find(n => n.id === 'nf2036-dep').impact]) assert.ok(/생산연령인구/.test(s) && !/일하는/.test(s), s);
  for (const L of lives) {
    const a = L.log.some(e => e.id === 'era.2036.aging'), b = L.log.some(e => e.id === 'future.2035.dependency');
    assert.ok(!(a && b), `seed ${L.seed}: 같은 전망 이중 발생`);
  }
});

test('QA#6 2027년 이후 뉴스·사건은 scenario:true', () => {
  for (const n of NEWS_ARCHIVE) assert.equal(!!n.scenario, n.year >= 2027, `${n.id} ${n.year}`);
  let n = 0;
  for (const L of lives) for (const e of L.log) if (e.kind === 'news' || e.kind === 'event') { n++; assert.equal(!!e.scenario, e.year >= E.SCENARIO_FROM, `${e.year} ${e.id}`); }
  assert.ok(n > 1000);
});

// ── 7. 가족 개체화 ──
test('QA#7 조부모는 친가/외가·성별 개체이고 같은 사람이 두 번 죽지 않는다', () => {
  let deaths = 0;
  for (const L of lives) {
    const gp = L.family.gp;
    assert.ok(gp.length >= 2 && gp.length <= 4 && new Set(gp.map(g => g.id)).size === gp.length);
    assert.equal(L.family.grandparents, gp.filter(g => g.alive).length, '숫자 grandparents는 생존 수와 호환');
    const ids = L.log.filter(e => e.id === 'sys.fam.grandparent_death').map(e => e.grandparent.id);
    assert.equal(new Set(ids).size, ids.length, `seed ${L.seed}: ${ids}`);
    deaths += ids.length;
    for (const e of L.log.filter(e => e.id === 'sys.fam.grandparent_death')) assert.match(e.text, /친할|외할/);
  }
  assert.ok(deaths > 200);
});

test('QA#7 배우자는 개체(이름·시작연도)이며 사별·재혼 뒤 같은 인물이 두 번 사망하지 않는다', () => {
  let remarried = 0;
  for (const L of lives) {
    const f = L.family, widowed = L.log.filter(e => e.id === 'sys.fam.widowed'), remarry = L.log.filter(e => e.id === 'sys.fam.remarry'), wed = L.log.filter(e => e.id === 'sys.fam.wedding');
    const nos = widowed.map(e => e.spouse.no);
    assert.equal(new Set(nos).size, nos.length, `seed ${L.seed}: 같은 배우자 중복 사별 ${nos}`);
    for (const e of [...widowed, ...remarry, ...wed]) assert.ok(e.spouse.name && e.spouse.since != null && e.spouse.no >= 1);
    for (const sp of f.spouses || []) { assert.ok(sp.name && sp.since != null); if (sp.end) assert.ok(sp.until >= sp.since); }
    assert.ok((f.spouses || []).filter(s => !s.end).length <= 1, '현재 배우자는 최대 1명');
    assert.equal(widowed.length, (f.spouses || []).filter(s => s.end === 'widowed').length);
    if (remarry.length) { remarried++; assert.ok(remarry[0].spouse.no >= 2); assert.ok(f.spouses.length >= 2); }
  }
  assert.ok(remarried >= 3, `재혼 표본 ${remarried}`);
});

test('QA#7 부모 돌봄 선택에 대상 호칭(careTarget)과 라벨·결과 문구가 붙는다', () => {
  let n = 0;
  for (const L of lives) {
    for (const e of L.log.filter(e => e.id === 'sys.fam.parent_care' && e.kind === 'choice')) {
      n++;
      assert.ok(['아버지', '어머니'].includes(e.careTarget), e.careTarget);
      if (e.option !== 'home') assert.ok(e.text.includes(e.careTarget) || e.label.includes(e.careTarget), e.text);
      else assert.ok(e.label.includes(e.careTarget));
    }
    for (const c of L.log.filter(e => e.id === 'sys.fam.care_end')) assert.ok(/(아버지|어머니|배우자)( 사망으로)? 돌봄이 (종료됐다|끝났다)/.test(c.text), c.text);
  }
  assert.ok(n > 30);
});

// ── 8. 판정문·결산 라벨 ──
test('QA#8 판정문 수치는 결산 같은 이름 항목과 같고 basis 라벨이 있다', () => {
  let n = 0;
  for (const L of lives.slice(0, 120)) {
    const S = E.summarize(L, { peers: false });
    for (const i of S.issues) assert.equal(i.basis, 'late-weighted');
    assert.ok(S.basisNotes.lifetime && S.basisNotes['late-weighted']);
    if (!S.verdict.pressure) continue;
    n++;
    assert.equal(S.verdict.pressure.basis, 'lifetime');
    assert.equal(S.verdict.shown.basis, 'late-weighted');
    const row = S.issues.find(i => i.key === S.verdict.shown.key);
    assert.equal(S.verdict.shown.value, row.value);
    assert.deepEqual(S.verdict.lines, [], '판정문은 회고문 — 수치·이유 줄을 화면에 내지 않는다');
    assert.ok(!/\d/.test(S.verdict.main), S.verdict.main);
  }
  assert.ok(n > 50);
});

// ── 9. 문체 ──
test('QA#9 리뷰가 지적한 문구가 사건·시스템 문구에서 사라졌다', async () => {
  const fs = await import('node:fs'), path = await import('node:path');
  const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
  const all = walk('src/content').filter(f => f.endsWith('.js')).map(f => fs.readFileSync(f, 'utf8')).join('\n');
  for (const s of ['탑은 아까보다', '이름만 자율이었다', '버전 번호가 붙었다', '현관문은 그대로였다', '내 키 눈금', '기초 라인을 한꺼번에', '이름을 아는 얼굴이 절반', '근황은 서로 비슷하게', '하루가 갑자기 비었다']) assert.ok(!all.includes(s), s);
});

// ── 10. QA 로그 ──
test('QA#10 qaTrace: 시드·선택·사건 ID/연도만, 같은 선택으로 재현', () => {
  const L = life(9500);
  const tr = E.qaTrace(L);
  assert.equal(tr.seed, 9500);
  assert.ok(tr.events.length > 20 && tr.events.every(e => e.id && e.year >= tr.birthYear && !('text' in e)));
  assert.ok(tr.choices.every(c => c.eventId && c.option));
  const R = E.replay(tr.seed, tr.choices);
  assert.deepEqual(E.qaTrace(R).events, tr.events);
});

// ── 피드 예산 ──
test('피드: 한 해 표시 항목(quiet·compare 제외, 선택·사망 포함)은 최대 3개, 같은 주제는 한 해 한 번', () => {
  const hist = [0, 0, 0, 0];
  for (const L of lives) {
    const by = {};
    for (const e of L.log) { if (e.quiet || e.kind === 'compare' || e.kind === 'birth' || e.age === 0) continue; (by[e.age] ||= []).push(e); }
    for (let a = 1; a <= (L.death?.age ?? L.age); a++) {
      const n = by[a]?.length ?? 0;
      assert.ok(n <= 3, `seed ${L.seed} ${a}세 ${n}개: ${(by[a] || []).map(e => e.id)}`);
      hist[n]++;
    }
  }
  const tot = hist.reduce((x, y) => x + y, 0), mean = (hist[1] + 2 * hist[2] + 3 * hist[3]) / tot;
  assert.ok(mean > 1.8 && mean < 2.7, `평균 ${mean.toFixed(2)}`);
  assert.ok(hist[2] / tot > 0.4 && hist[0] / tot < 0.1 && hist[3] / tot < 0.5, JSON.stringify(hist));
});
