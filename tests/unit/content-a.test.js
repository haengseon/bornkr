// 콘텐츠 A(영유아기·학령기 사건, 이름, 시스템 문구) 스키마·안전 검증. 소유: 콘텐츠 A.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import early from '../../src/content/events/early.js';
import school from '../../src/content/events/school.js';
import { SURNAMES, GIVEN_NAMES } from '../../src/content/names.js';
import TEXT from '../../src/content/system-text-a.js';
import { SENSITIVE, STAT_KEYS, ISSUE_KEYS, TRAIT_KEYS } from '../../src/engine/constants.js';

const ALL = [...early, ...school];

// GDD §9.4 '콘텐츠 A' 카탈로그 70개
const CATALOG = `early.first.swing early.first.drawing early.first.cat early.first.snack early.night.fever early.vaccine early.daycare.wait early.grandma early.move.lease early.first.word early.sibling.jealous early.parent.overtime early.dol.photo early.cartoon early.lbw.clinic early.dev.check early.disability.therapy early.atopy early.kinder.choice early.rural.bus early.two.languages early.parents.argue
school.first.day school.deskmate school.bully.witness school.bully.victim school.recovery.talk school.teacher.cane school.home.cane school.hakwon.more school.hakwon.bus school.tutor.cost school.library.group school.grade.drop school.club school.sports.day school.field.trip school.first.phone school.game.night school.crush school.friend.fallout school.parttime school.debt.calls school.parent.joblost school.transfer school.young.carer school.rural.merge school.free.lunch school.remote.class school.quit.thought school.exam.anxiety school.glasses school.low.mood school.dream.change school.library.book school.contest school.youth.group school.parent.away school.multicultural.tease school.disability.support school.drill school.secret.tutor school.special.prep school.license school.csat.morning school.factory.summer school.sibling.tuition school.allowance school.night.study school.graduation`.split(/\s+/);

// ── 가짜 L·ctx: 함수형 when/p/text를 여러 조건에서 평가 ──
const YEARS = [1962, 1975, 1984, 1992, 1999, 2004, 2012, 2016, 2020, 2021, 2024, 2030];
const PROFILES = [
  {},
  { q: 1, urban: false, access: 20, parents: { singleParent: true }, wealth: 20, tutoring: 0, highType: 'vocational', sens: 90 },
  { q: 5, access: 90, parents: { dualIncome: true, multicultural: true }, disability: 'developmental', lbw: true, care: 'grandparent', order: 2, tutoring: 3, score: 80 },
  { q: 2, disability: 'physical', siblings: 3, parents: { dualIncome: true }, flags: { victim: 2018, youngCarer: true, familyMove: 2000 } },
  { disability: 'hearing', q: 4, care: 'daycare' },
  { disability: 'visual', q: 3, sens: 10 },
];
function mkL(year, age, sex, p = {}) {
  return {
    year, age, sex, seed: 7,
    birth: {
      quintile: p.q ?? 3, urban: p.urban ?? true, healthAccess: p.access ?? 60, parents: p.parents ?? {},
      disability: p.disability ?? null, lowBirthWeight: !!p.lbw, care: p.care ?? 'parent', order: p.order ?? 1,
    },
    stats: { wealth: p.wealth ?? 50 }, traits: { sens: p.sens ?? 50 }, flags: p.flags ?? {},
    family: { siblings: p.siblings ?? 1, caringFor: null }, home: { tenure: 'jeonse', moves: [{ year, to: 'x' }] },
    edu: { tutoring: p.tutoring ?? 1, score: p.score ?? 50, highType: p.highType ?? 'general' },
    household: { netWorth: 1000 },
  };
}
const ctxAt = i => ({ pick: a => a[Math.min(i, a.length - 1)] });
function* scenarios(ev) {
  const [a0, a1] = ev.ages, [y0, y1] = ev.years ?? [1900, 2100];
  for (const y of YEARS) {
    if (y < y0 || y > y1) continue;
    for (const age of new Set([a0, Math.round((a0 + a1) / 2), a1])) for (const sex of ['M', 'F']) for (const p of PROFILES) yield mkL(y, age, sex, p);
  }
  yield mkL((y0 + Math.min(y1, 2030)) >> 1, a0, 'F', {});
}
// 템플릿 값(문자열 | 배열 | 함수)의 모든 변형 문자열
function variants(t, L) {
  if (typeof t === 'string') return [t];
  if (Array.isArray(t)) return t;
  const out = [];
  for (let i = 0; i < 4; i++) out.push(t(L, ctxAt(i)));
  return out;
}
function allText(ev, pick = e => e.text) {
  const set = new Set();
  for (const L of scenarios(ev)) for (const s of variants(pick(ev), L)) set.add(s);
  return [...set];
}

const sentences = s => (s.replace(/"[^"]*"/g, 'Q').match(/[.!?](?=\s|$)/g) || []).length;
const dist = (a, b) => {
  let d = 0;
  for (const g of ['stats', 'issues']) for (const k of new Set([...Object.keys(a?.[g] ?? {}), ...Object.keys(b?.[g] ?? {})])) d += Math.abs((a?.[g]?.[k] ?? 0) - (b?.[g]?.[k] ?? 0));
  return d;
};
const BANNED = ['피가', '피를', '칼', '때려', '폭행', '흉기', '주먹', '발로', '자해', '자살', '죽고', '죽을', '성폭', '강간', '불쌍', '결핍', '극복', '비정상', '안타깝', '가난한 집', '장애를 앓'];
const SILENCE = /참는|참아|침묵|무시|모른 척|모른척|가만히|못 본 척/;

function checkFx(fx, where) {
  if (!fx) return;
  for (const k of Object.keys(fx)) assert.ok(['stats', 'issues', 'money', 'traits', 'set'].includes(k), `${where}: fx 키 ${k}`);
  assert.ok(!fx.money, `${where}: 유년기 사건은 money 대신 stats.wealth로 쓴다`);
  for (const [k, v] of Object.entries(fx.stats ?? {})) { assert.ok(STAT_KEYS.includes(k), `${where}: stat ${k}`); assert.ok(Number.isInteger(v) && Math.abs(v) <= 8, `${where}: stats.${k}=${v}`); }
  for (const [k, v] of Object.entries(fx.issues ?? {})) { assert.ok(ISSUE_KEYS.includes(k), `${where}: issue ${k}`); assert.ok(Number.isInteger(v) && Math.abs(v) <= 12, `${where}: issues.${k}=${v}`); }
  for (const [k, v] of Object.entries(fx.traits ?? {})) { assert.ok(TRAIT_KEYS.includes(k), `${where}: trait ${k}`); assert.ok(Number.isInteger(v) && Math.abs(v) <= 3, `${where}: traits.${k}=${v}`); }
}

test('카탈로그 70개 ID가 모두 구현되고 id가 유일하며 접두사가 맞다', () => {
  const ids = ALL.map(e => e.id);
  assert.equal(new Set(ids).size, ids.length, 'id 중복');
  for (const id of CATALOG) assert.ok(ids.includes(id), `카탈로그 누락: ${id}`);
  assert.ok(early.length >= 22 && school.length >= 48);
  for (const e of early) assert.match(e.id, /^early\./);
  for (const e of school) assert.match(e.id, /^school\./);
});

test('ages·years·p·once·cooldown 형식', () => {
  for (const ev of ALL) {
    const lim = ev.id.startsWith('early.') ? [0, 6] : [7, 18];
    assert.ok(Array.isArray(ev.ages) && ev.ages.length === 2 && ev.ages[0] <= ev.ages[1], `${ev.id}: ages`);
    assert.ok(ev.ages[0] >= lim[0] && ev.ages[1] <= lim[1], `${ev.id}: 나이 범위 ${ev.ages}`);
    if (ev.years) assert.ok(ev.years.length === 2 && ev.years[0] <= ev.years[1], `${ev.id}: years`);
    assert.ok(typeof ev.p === 'number' ? ev.p > 0 && ev.p <= 1 : typeof ev.p === 'function', `${ev.id}: p`);
    assert.ok(typeof ev.reason === 'string' && ev.reason.length <= 30, `${ev.id}: reason(이슈·지표 사유 로그 문구) 필요`);
    if (!ev.once) assert.ok(ev.cooldown >= 3, `${ev.id}: 반복 사건은 cooldown ≥ 3`);
    for (const L of scenarios(ev)) {
      if (typeof ev.p === 'function') { const p = ev.p(L, {}); assert.ok(Number.isFinite(p) && p >= 0 && p <= 1, `${ev.id}: p()=${p}`); }
      if (ev.when) assert.equal(typeof ev.when(L, {}), 'boolean', `${ev.id}: when은 boolean`);
    }
    if (ev.when) assert.doesNotThrow(() => ev.when({ year: 2000, age: ev.ages[0] }, {}), `${ev.id}: 성긴 L에서 when 오류`);
    if (typeof ev.p === 'function') assert.doesNotThrow(() => ev.p({ year: 2000, age: ev.ages[0] }, {}), `${ev.id}: 성긴 L에서 p 오류`);
  }
});

test('문구 길이·문장 수·금지어 (피드 ≤40, 선택 prompt+text ≤60, label ≤14, result 1문장 ≤40)', () => {
  let over30 = 0, total = 0;
  for (const ev of ALL) {
    const texts = allText(ev);
    assert.ok(texts.length > 0 && texts.every(t => typeof t === 'string' && t.length > 0), `${ev.id}: text`);
    for (const t of texts) {
      assert.ok(!/[{}]/.test(t), `${ev.id}: 중괄호 템플릿 금지 "${t}"`);
      assert.ok(sentences(t) <= 2, `${ev.id}: 문장 ${sentences(t)}개 "${t}"`);
      assert.ok(t.length <= (ev.choice ? 40 : 40), `${ev.id}: text ${t.length}자 "${t}"`);
      if (ev.choice) assert.ok(t.length + ev.choice.prompt.length <= 60, `${ev.id}: prompt+text ${t.length + ev.choice.prompt.length}자 "${t}"`);
      total++; if (t.length > 30) over30++;
      for (const w of BANNED) assert.ok(!t.includes(w), `${ev.id}: 금지어 ${w} "${t}"`);
    }
    for (const o of ev.choice?.options ?? []) {
      assert.ok(o.label.length <= 14, `${ev.id}/${o.id}: label ${o.label.length}자`);
      assert.ok(o.result.length <= 40, `${ev.id}/${o.id}: result ${o.result.length}자 "${o.result}"`);
      assert.equal(sentences(o.result), 1, `${ev.id}/${o.id}: result는 1문장 "${o.result}"`);
      assert.ok(!o.hint || o.hint.length <= 24, `${ev.id}/${o.id}: hint 길이`);
      for (const w of BANNED) assert.ok(!(o.result + o.label).includes(w), `${ev.id}/${o.id}: 금지어 ${w}`);
    }
  }
  console.log(`# 피드 문구 ${total}개 중 30자 초과 ${over30}개(권장 한도, 최대 40자)`);
});

test('선택지 구조: 2~3개, default 존재, result·fx 유효, 선택 간 효과 차이 ≥3', () => {
  for (const ev of ALL.filter(e => e.choice)) {
    const c = ev.choice, ids = c.options.map(o => o.id);
    assert.ok(typeof c.prompt === 'string' && c.prompt.length > 0, `${ev.id}: prompt`);
    assert.ok(c.options.length >= 2 && c.options.length <= 3, `${ev.id}: 선택지 수`);
    assert.equal(new Set(ids).size, ids.length, `${ev.id}: 선택지 id 중복`);
    if (typeof c.default === 'function') for (const L of scenarios(ev)) assert.ok(ids.includes(c.default(L, {})), `${ev.id}: default()가 선택지에 없음`);
    else assert.ok(ids.includes(c.default), `${ev.id}: default가 선택지에 없음`);
    for (const o of c.options) { assert.ok(typeof o.result === 'string' && o.result, `${ev.id}/${o.id}: result 필수`); checkFx(o.fx, `${ev.id}/${o.id}`); assert.ok(o.fx, `${ev.id}/${o.id}: fx 필수(무의미 선택 금지)`); }
    for (let i = 0; i < c.options.length; i++) for (let j = i + 1; j < c.options.length; j++) {
      assert.ok(dist(c.options[i].fx, c.options[j].fx) >= 3, `${ev.id}: ${ids[i]}↔${ids[j]} 효과 차이 ${dist(c.options[i].fx, c.options[j].fx)} < 3`);
    }
  }
  for (const ev of ALL) checkFx(ev.fx, ev.id);
  for (const ev of ALL.filter(e => !e.choice)) assert.ok(ev.fx, `${ev.id}: 자동 사건은 fx 필요`);
});

test('firstChoice: 4건 이상, 4~5세, 선택형, once', () => {
  const fc = ALL.filter(e => e.tags?.includes('firstChoice'));
  assert.ok(fc.length >= 4);
  for (const e of fc) {
    assert.ok(e.ages[0] <= 4 && e.ages[1] >= 5, `${e.id}: 5세 포함`);
    assert.ok(e.choice && e.once, `${e.id}: 선택형·once`);
    for (const o of e.choice.options) for (const v of Object.values(o.fx?.stats ?? {})) assert.ok(Math.abs(v) <= 3, `${e.id}: firstChoice 효과는 작게`);
  }
});

test('민감 사건: sensitive 값 유효, 자해 없음, 선택지에 침묵 없음·도움 경로, once', () => {
  const sens = ALL.filter(e => e.sensitive);
  for (const e of sens) {
    assert.ok(SENSITIVE.includes(e.sensitive) && e.sensitive !== 'selfharm', `${e.id}: sensitive ${e.sensitive}`);
    if (['violence', 'abuse', 'sexual'].includes(e.sensitive)) assert.ok(e.once, `${e.id}: 폭력·학대는 once`);
    for (const o of e.choice?.options ?? []) assert.ok(!SILENCE.test(o.label + o.result), `${e.id}/${o.id}: 침묵·참기 선택지 금지`);
  }
  // 폭력 피해·목격·놀림 선택 사건: 알리기(어른) 경로가 default
  for (const id of ['school.bully.witness', 'school.bully.victim', 'school.multicultural.tease']) {
    const e = ALL.find(x => x.id === id);
    assert.ok(e.sensitive === 'violence' && e.choice && e.choice.options.length >= 3, `${id}: 3개 이상의 도움·관계 경로`);
    assert.ok(e.choice.options.find(o => o.id === e.choice.default).hint, `${id}: default에 이유 hint`);
  }
  assert.ok(ALL.find(e => e.id === 'school.bully.victim').tags.includes('victim'), '피해 사건은 victim 태그(회복 사건 연결)');
  assert.ok(ALL.find(e => e.id === 'school.recovery.talk').tags.includes('recovery'));
  const cnt = k => ALL.filter(e => e.sensitive === k).length;
  console.log(`# 민감 사건: violence ${cnt('violence')}, abuse ${cnt('abuse')}, illness ${cnt('illness')}`);
});

test('시대 구분: years가 필요한 사건과 era 문구가 연도별로 달라진다', () => {
  const byId = id => ALL.find(e => e.id === id);
  assert.deepEqual(byId('school.secret.tutor').years, [1980, 1999]);
  assert.ok(byId('school.teacher.cane').years[1] === 2011 && byId('school.night.study').years[1] === 2010);
  assert.ok(byId('school.first.phone').years[0] >= 2000 && byId('school.free.lunch').years[0] >= 2011 && byId('school.drill').years[0] >= 2016);
  assert.deepEqual(byId('school.remote.class').years, [2020, 2021]);
  for (const id of ['early.dol.photo', 'early.cartoon', 'school.first.day', 'school.field.trip', 'school.game.night']) {
    const ev = byId(id);
    const seen = new Set([1965, 1990, 2005, 2015, 2020].map(y => variants(ev.text, mkL(y, ev.ages[0], 'M'))[0]));
    assert.ok(seen.size >= 3, `${id}: 시대별 문구 ${seen.size}종`);
  }
});

test('소스 규칙: Math.random 금지, L 직접 변경 금지', () => {
  for (const f of ['src/content/events/early.js', 'src/content/events/school.js', 'src/content/system-text-a.js', 'src/content/names.js']) {
    const s = readFileSync(new URL('../../' + f, import.meta.url), 'utf8').replace(/\/\/.*$/gm, '');
    assert.ok(!/Math\.random/.test(s), `${f}: Math.random`);
    assert.ok(!/\bL\.[\w.[\]']+\s*(=(?!=)|\+=|-=|\+\+|--)/.test(s), `${f}: 상태 직접 변경`);
  }
});

test('names: 성씨 100개 이상·합≈1, 5년 단위 키별 성별 이름 70개 이상·총 1000개 이상', () => {
  const v = SURNAMES.values, keys = Object.keys(v);
  assert.ok(keys.length >= 100);
  for (const k of keys) assert.match(k, /^[가-힣]$/);
  assert.ok(Object.values(v).every(x => x > 0));
  assert.ok(Math.abs(Object.values(v).reduce((a, b) => a + b, 0) - 1) < 0.005, '성씨 합');
  assert.ok(v['김'] > v['이'] && v['이'] > v['박']);
  assert.ok(SURNAMES.src && SURNAMES.year && SURNAMES.kind);
  const yrs = []; for (let y = 1960; y <= 2025; y += 5) yrs.push(String(y));
  assert.deepEqual(Object.keys(GIVEN_NAMES.values), yrs);
  const all = new Set();
  for (const [dec, g] of Object.entries(GIVEN_NAMES.values)) for (const s of ['M', 'F']) {
    assert.ok(g[s].length >= 70);
    assert.equal(new Set(g[s]).size, g[s].length);
    for (const n of g[s]) { assert.match(n, /^[가-힣]{1,3}$/); all.add(n); }
  }
  assert.ok(all.size >= 1000);
  assert.ok(GIVEN_NAMES.src && GIVEN_NAMES.kind);
});

test('system-text-a: GDD §9.3 배정 키 23개, 변형 2개 이상, 변수·조사 형식', () => {
  const KEYS = ['daycare', 'kinder', 'elem_enter', 'middle_enter', 'tutoring', 'high_type', 'high_enter', 'csat', 'path', 'college_enter', 'no_college', 'retake', 'loan', 'leave', 'dropout', 'graduate', 'grad_enter']
    .map(k => 'sys.edu.' + k).concat(['sys.fam.sibling_born', 'sys.fam.parents_divorce', 'sys.fam.grandparent_death', 'sys.health.lbw', 'sys.health.disability', 'sys.home.family_move']);
  assert.deepEqual(Object.keys(TEXT).sort(), KEYS.sort());
  const CHOICE = { 'sys.edu.tutoring': ['more', 'keep', 'less'], 'sys.edu.high_type': ['general', 'voc', 'special'], 'sys.edu.path': ['college', 'work', 'retake'] };
  const VARS = { exam: '수능', highTypeLabel: '일반고', collegeLabel: '수도권 4년제 대학', levelLabel: '대학교', amount: '727', gpLabel: '할머니', disabilityLabel: '발달장애', n: '8', toLabel: '전셋집' };
  const sample = s => s.replace(/\{(\w+)(?:\|([^}]+))?\}/g, (_, k, j) => { assert.ok(k in VARS, `알 수 없는 변수 ${k}`); assert.ok(!j || ['은', '는', '이', '가', '을', '를', '과', '와', '아', '야', '으로', '로'].includes(j), `조사 ${j}`); return VARS[k] + (j ? '이' : ''); });
  for (const [k, t] of Object.entries(TEXT)) {
    assert.match(k, /^sys\./);
    if (CHOICE[k]) {
      assert.deepEqual(Object.keys(t.options), CHOICE[k], `${k}: 선택지 id`);
      assert.ok(t.prompt.length <= 40 && Object.values(t.options).every(l => l.length <= 14), `${k}: 길이`);
      continue;
    }
    const out = new Set();
    for (const y of YEARS) for (let i = 0; i < 4; i++) for (const s of variants(t, mkL(y, 5, 'M'))) out.add(s);
    assert.ok(out.size >= 2, `${k}: 변형 ${out.size}개`);
    for (const s of out) {
      assert.equal(typeof s, 'string');
      const f = sample(s);
      assert.ok(f.length <= 46, `${k}: ${f.length}자 "${f}"`);
      assert.ok(sentences(f) <= 2, `${k}: 문장 수 "${f}"`);
      for (const w of BANNED) assert.ok(!f.includes(w), `${k}: 금지어 ${w}`);
    }
  }
  assert.match(TEXT['sys.edu.elem_enter'](mkL(1985, 7, 'M'), ctxAt(0)), /국민학교/);
  assert.match(TEXT['sys.edu.elem_enter'](mkL(2005, 7, 'M'), ctxAt(0)), /초등학교/);
});
