// 인생 회고문(src/engine/epilogue.js): 금지어·시대착오·상태 모순·결정성·분량·다양성
import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../../src/engine/index.js';
import { epilogueOf, koNum } from '../../src/engine/epilogue.js';
import { needYear } from '../../src/engine/anachro.js';
import * as P from '../../src/content/epilogue.js';

const FORBID = /선택|기본 행동|점수|분위|백분위|순위|등급|성공|실패|승리|패배|승자|패자|\d\s*원|만\s?원|\d\s*억|연봉|부장|과장|차장|대리|자살|자해|사인|undefined|NaN|null|[{}]|\(이\)|\(으\)|\(을\)|\(은\)/;
const digitsLeft = t => t.replace(/\d{4}년/g, '').replace(/MP3|PC방|IMF/g, '');
const lives = Array.from({ length: 200 }, (_, i) => E.runToEnd(E.newLife({ seed: 71_000 + i, forced: { year: 1950 + (i * 7) % 96, sex: i % 2 ? 'F' : 'M' } })));
const txt = e => [e.title, ...e.paragraphs, e.coda].join(' ');

test('epilogue: 문장 풀 정적 검사 — 금지어·숫자·길이', () => {
  const all = [];
  const walk = x => { if (typeof x === 'string') all.push(x); else if (Array.isArray(x)) x.forEach(walk); else if (x && typeof x === 'object') Object.values(x).forEach(walk); };
  walk(P);
  assert.ok(all.length >= 250, `문장 수 ${all.length}`);
  for (const t of all) {
    const bare = t.replace(/\{\w+\}/g, '').replace(/\((이|으|을|은)\)/g, '');
    assert.doesNotMatch(bare, FORBID, t);
    assert.doesNotMatch(digitsLeft(bare), /\d/, t);
    assert.ok(bare.length <= 110, t);
  }
  for (const t of [...Object.values(P.CODA).flat()]) assert.ok(t.length <= 60, t);
  assert.ok(P.TITLES.length + Object.values(P.TITLES_SPECIAL).flat().length >= 40);
  assert.deepEqual([1, 14, 20, 27, 84].map(n => koNum(n, true)), ['한', '열네', '스무', '스물일곱', '여든네']);
});

test('epilogue: 200생애 금지어·시대착오·상태 모순·분량', () => {
  for (const L of lives) {
    const e = epilogueOf(L), t = txt(e), b = L.birth, end = L.death.year, f = L.family;
    const id = `seed ${L.seed} ${b.year} ${L.death.age}세`;
    assert.ok(e.paragraphs.length >= 3 && e.paragraphs.length <= 5, `${id} 문단 ${e.paragraphs.length}`);
    for (const p of e.paragraphs) {
      assert.ok(p.length <= 220, `${id} ${p.length}: ${p}`);
      assert.ok((p.match(/[.]/g) || []).length >= 2, `${id} 2문장 미만: ${p}`);
      assert.ok(needYear(p) <= end, `${id} 시대착오: ${p}`);
    }
    assert.ok(needYear(e.paragraphs[0]) <= Math.min(b.year + 8, end), `${id} 유년 시대착오: ${e.paragraphs[0]}`);
    assert.doesNotMatch(t, FORBID, `${id}: ${t}`);
    assert.doesNotMatch(digitsLeft(t), /\d/, `${id}: ${t}`);
    if (L.death.causeLabel) assert.ok(!t.includes(L.death.causeLabel), `${id} 사인 노출`);
    if (!f.children.length) assert.doesNotMatch(t, /아이가 태어|아이는 둘|아이가 셋|손주|자식들/, id);
    const married = (f.spouses || []).length > 0 || f.marriedYear != null;
    if (!married) assert.doesNotMatch(t, /결혼했|결혼식|청첩장|축의금|배우자를 먼저/, id);
    else assert.doesNotMatch(t, /결혼하지 않았다/, id);
    if (!(L.job.history || []).length) assert.doesNotMatch(t, /첫 출근|명함|첫 월급|은퇴하던|퇴직 후|출근길 내내/, id);
    if (b.urban) assert.doesNotMatch(t, /논두렁|금줄|전깃불이 들어오|읍내 장날/, id);
    if (L.death.age < 19) assert.doesNotMatch(t, /수능|학력고사|결혼|출근|은퇴/, id);
    assert.ok(e.coda.length <= 60 && e.title.length >= 4);
  }
});

test('epilogue: 영아 사망은 손실 산수·성장 서사 없이', () => {
  let found = 0;
  for (let seed = 1; seed < 4000 && found < 4; seed++) {
    const L = E.newLife({ seed });
    E.advanceYear(L);
    if (L.alive) continue;
    found++;
    const e = epilogueOf(L);
    assert.equal(e.paragraphs.length, 3);
    assert.doesNotMatch(txt(e), /덜|남은|기대수명|아쉽|너무 일찍|짧은 생|짧았|학교|결혼|출근/, txt(e));
  }
  assert.ok(found > 0);
});

test('epilogue: 결정성·summary 연동(main = 한 줄 총평, 이유·투명성 줄 없음)', () => {
  for (const L of lives.slice(0, 20)) {
    assert.deepEqual(epilogueOf(L), epilogueOf(L));
    const again = E.runToEnd(E.newLife({ seed: L.seed, forced: { year: L.birth.year, sex: L.sex } }));
    assert.deepEqual(epilogueOf(again), epilogueOf(L));
    const S = E.summarize(L, { peers: false });
    assert.deepEqual(S.epilogue, epilogueOf(L));
    assert.equal(S.verdict.main, S.epilogue.coda);
    assert.deepEqual(S.verdict.lines, []);
    assert.equal(S.verdict.transparency, undefined);
  }
});

test('epilogue: 다양성 — 100생애 첫 문단 고유율 ≥ 80%, 별명·총평도 고루', () => {
  const es = lives.slice(0, 100).map(L => epilogueOf(L));
  assert.ok(new Set(es.map(e => e.paragraphs[0])).size >= 80);
  assert.ok(new Set(es.map(e => e.title)).size >= 30, `별명 ${new Set(es.map(e => e.title)).size}`);
  assert.ok(new Set(es.map(e => e.coda)).size >= 15, `총평 ${new Set(es.map(e => e.coda)).size}`);
});

test('deathStory: 사인이 있는 생애는 인과 체인 ≥1, 체인 문장은 L 상태와 일치, 회고문과 모순 없음', () => {
  for (const L of lives) {
    const S = E.summarize(L, { peers: false }), ds = S.deathStory, id = `seed ${L.seed}`;
    if (L.death.horizon) { assert.equal(ds, null); continue; }
    assert.equal(ds.year, L.death.year); assert.equal(ds.age, L.death.age);
    if (ds.sensitive) { assert.deepEqual([ds.causeLabel, ds.chain.length, ds.steps.length], [null, 0, 0], id); continue; }
    assert.ok(ds.steps.length >= 1 && ds.steps.at(-1).startsWith(`${ds.year}년 ${ds.causeLabel}`), `${id} ${ds.steps}`);
    const H = L.health, has = (re, ok) => ds.chain.filter(t => re.test(t)).forEach(t => assert.ok(ok(t), `${id} 체인 불일치: ${t}`));
    has(/담배를 시작/, () => L.log.some(e => e.id === 'sys.health.smoke_start'));
    has(/담배를 끊었지만/, () => L.log.some(e => e.id === 'sys.health.quit'));
    has(/끊지 못했다/, () => H.smoker === 1);
    has(/음주/, () => !!H.drinker);
    has(/진단/, t => H.conditions.some(c => t.startsWith(`${c.since}년`)));
    has(/장기요양/, () => !!L.aging.ltc);
    has(/홀로 지내는/, () => !!L.aging.isolated);
    has(/배우자를 먼저/, () => !!L.family.widowed);
    has(/병원이 멀리/, () => !L.birth.urban && L.birth.healthAccess < 35);
    has(/위험이 따르는 일터/, () => (L.job.hazard ?? 0) >= 2);
    const t = txt(S.epilogue);
    if (['transport', 'fall', 'external'].includes(L.death.cause)) assert.doesNotMatch(t, /조용히 (눈을 감았다|길을 나섰다)/, id);
    if (!H.smoker && !L.log.some(e => e.id === 'sys.health.smoke_start')) assert.doesNotMatch(t, /담배/, id);
  }
});
