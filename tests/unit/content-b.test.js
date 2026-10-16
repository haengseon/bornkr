// 콘텐츠 B(청년기 19~34세 사건·시스템 문구) 스키마·안전 검증. 소유: 콘텐츠 B.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import youth from '../../src/content/events/youth.js';
import { EVENTS } from '../../src/content/events/index.js';
import TEXT from '../../src/content/system-text-b.js';
import { SENSITIVE, STAT_KEYS, ISSUE_KEYS, TRAIT_KEYS } from '../../src/engine/constants.js';
import { SOURCES } from '../../src/data/sources.js';
import { fill } from '../../src/engine/text.js';

// GDD §9.4 '콘텐츠 B' 카탈로그 55개 + 작가 추가 사건
const CATALOG = `youth.retake.room youth.freshman youth.tuition.bill youth.cafe.shift youth.wage.theft youth.leave.year youth.mil.letter youth.mil.injury youth.discharge.gap youth.spec youth.intern youth.civil.exam youth.rejections youth.first.contract youth.overtime youth.work.bullying youth.work.harassment youth.recovery youth.burnout youth.rider youth.freelance youth.startup.idea youth.mold.room youth.substandard youth.jeonse.loan youth.fraud.news youth.roommate youth.parent.call youth.dating.app youth.blind.date youth.breakup.after youth.wedding.cost youth.wedding.gift youth.inlaws youth.pregnant.work youth.infertility youth.newborn.night youth.daycare.wait youth.return.work youth.single.evening youth.hobby youth.friend.weddings youth.invest youth.card.debt youth.checkup youth.low.mood youth.to.seoul youth.hometown.job youth.working.holiday youth.grad.school youth.loan.repay youth.parent.hospital youth.pet youth.first.vote`.split(/\s+/);
// 추가 사건: 전세사기 후속 지원(도움 경로), 일상 사건 7건(청년기 연간 기대 건수·20대 초반 공백 보강)
const EXTRA = ['youth.fraud.support', 'youth.exam.week', 'youth.friends.meet', 'youth.commute', 'youth.salary.day', 'youth.holiday.home', 'youth.move.in', 'youth.rent.day'];

// ── 가짜 L·ctx: 함수형 when/p/text를 여러 조건에서 평가 ──
const YEARS = [1982, 1990, 1998, 2003, 2008, 2013, 2017, 2019, 2020, 2022, 2024, 2030];
const STATES = [
  {},
  { job: 'student', stage: 'college', home: 'dorm', parents: true, region: 'busan', mil: 'none' },
  { job: 'student', stage: 'retake', sex: 'M' },
  { job: 'military', stage: 'college', mil: 'serving', sex: 'M' },
  { job: 'student', stage: 'college', mil: 'done', sex: 'M', loan: 1200 },
  { job: 'seeking', stage: 'done', level: 'high', flags: { civilExam: 2015, examUntil: 2017, substandard: 2010 }, region: 'jeonnam', tenure: 'monthly', parents: false, indep: true },
  { job: 'employed', regular: false, tenure: 'monthly', parents: false, platform: true, indep: true, smoker: 1, history: [{}], years: 1 },
  { job: 'employed', regular: true, tenure: 'jeonse', parents: false, married: true, marriedYear: 2012, children: [{ alive: true, birthYear: 2011 }], indep: true, flags: { victim: 2010, fraud: 2011, childPlanned: 2013, breakYear: 2009 }, public: true },
  { job: 'self', tenure: 'own', parents: false, married: true, marriedYear: 2008, region: 'gyeonggi', birthRegion: 'jeonbuk', indep: true, loan: 600, flags: { breakYear: 2009 } },
  { job: 'inactive', sex: 'F', tenure: 'family', parents: true, partner: true, log: [{ id: 'sys.fam.breakup', year: 2010 }, { id: 'sys.fam.breakup', year: 2011 }, { id: 'sys.fam.breakup', year: 2020 }] },
];
function mkL(year, age, s = {}) {
  const married = !!s.married;
  return {
    year, age, sex: s.sex ?? (age % 2 ? 'F' : 'M'), seed: 7,
    birth: { region: s.birthRegion ?? 'busan', quintile: 3, urban: true, healthAccess: 60, parents: {} },
    stats: { wealth: 50 }, traits: { sens: 50 },
    flags: { ...(s.indep || s.job === 'employed' ? { indep: 2005 } : {}), ...(s.flags ?? {}) },
    job: { status: s.job ?? 'employed', regular: s.regular ?? true, public: !!s.public, platform: !!s.platform, history: s.history ?? [{}, {}], years: s.years ?? 3 },
    edu: { stage: s.stage ?? 'done', level: s.level ?? '4yr', leave: 0, loan: 0, retake: s.stage === 'retake' ? 1 : 0 },
    mil: { status: s.mil ?? 'none' },
    home: { tenure: s.home ?? s.tenure ?? 'monthly', region: s.region ?? 'seoul', parents: s.parents ?? false, owned: s.tenure === 'own' },
    family: {
      partner: married || s.partner ? { age: age + 1 } : null, married, marriedYear: s.marriedYear ?? null, children: s.children ?? [],
      parents: { father: { alive: true, age: 58 }, mother: { alive: age % 3 === 0, age: 55 } },
    },
    money: { loans: { student: s.loan ?? 0 } },
    health: { smoker: s.smoker ?? 0 },
    log: s.log ?? [],
  };
}
const ctxAt = i => ({ pick: a => a[Math.min(i, a.length - 1)] });
function* scenarios(ev) {
  const [a0, a1] = ev.ages, [y0, y1] = ev.years ?? [1900, 2100];
  for (const y of YEARS) {
    if (y < y0 || y > y1) continue;
    for (const age of new Set([a0, Math.round((a0 + a1) / 2), a1])) for (const st of STATES) yield mkL(y, age, st);
  }
  yield mkL((y0 + Math.min(y1, 2030)) >> 1, a0, {});
}
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
const BANNED = ['피가', '피를', '칼', '때려', '폭행', '흉기', '주먹', '발로', '자해', '자살', '죽고', '죽을', '성폭', '강간', '불쌍', '결핍', '극복', '비정상', '안타깝', '가난한 집', '장애를 앓', '낙오', '실패', '무능', '게으', '루저', '노력 부족', '탓이', '자초'];
const SILENCE = /참는|참아|침묵|무시|모른 척|모른척|가만히|못 본 척/;
const ACT_OK = new Set(['flag', 'gain', 'spend', 'borrow', 'move', 'moveRegion', 'preparePublicExam']);
const FLAGS_OK = new Set(['civilExam', 'examUntil', 'infertile', 'childWait', 'noChild']);

function checkFx(fx, where) {
  if (!fx) return;
  for (const k of Object.keys(fx)) assert.ok(['stats', 'issues', 'money', 'traits'].includes(k), `${where}: fx 키 ${k}`);
  for (const [k, v] of Object.entries(fx.stats ?? {})) { assert.ok(STAT_KEYS.includes(k), `${where}: stat ${k}`); assert.ok(Number.isInteger(v) && Math.abs(v) <= 8, `${where}: stats.${k}=${v}`); }
  for (const [k, v] of Object.entries(fx.issues ?? {})) { assert.ok(ISSUE_KEYS.includes(k), `${where}: issue ${k}`); assert.ok(Number.isInteger(v) && Math.abs(v) <= 12, `${where}: issues.${k}=${v}`); }
  for (const [k, v] of Object.entries(fx.traits ?? {})) { assert.ok(TRAIT_KEYS.includes(k), `${where}: trait ${k}`); assert.ok(Number.isInteger(v) && Math.abs(v) <= 3, `${where}: traits.${k}=${v}`); }
  for (const [k, v] of Object.entries(fx.money ?? {})) { assert.ok(['debt', 'assets'].includes(k) && Number.isInteger(v) && Math.abs(v) <= 5000, `${where}: money.${k}=${v}`); }
}

test('카탈로그 55개 ID가 모두 구현되고 id가 유일하며 접두사·범위가 맞다', () => {
  const ids = youth.map(e => e.id);
  assert.equal(new Set(ids).size, ids.length, 'id 중복');
  for (const id of CATALOG) assert.ok(ids.includes(id), `카탈로그 누락: ${id}`);
  for (const id of ids) assert.ok(CATALOG.includes(id) || EXTRA.includes(id), `카탈로그 밖 ID(EXTRA에 등록 필요): ${id}`);
  for (const e of youth) assert.match(e.id, /^youth\.[a-z]+(\.[a-z]+)*$/);
  const all = EVENTS.map(e => e.id);
  assert.equal(new Set(all).size, all.length, '전체 사건 id 중복(다른 작가 파일과 충돌)');
  assert.ok(youth.length >= 55);
});

test('ages 19~34·years·p·once·cooldown·reason·tags 형식', () => {
  for (const ev of youth) {
    assert.ok(Array.isArray(ev.ages) && ev.ages.length === 2 && ev.ages[0] <= ev.ages[1], `${ev.id}: ages`);
    assert.ok(ev.ages[0] >= 19 && ev.ages[1] <= 34, `${ev.id}: 나이 범위 ${ev.ages}`);
    if (ev.years) assert.ok(ev.years.length === 2 && ev.years[0] <= ev.years[1], `${ev.id}: years`);
    assert.ok(typeof ev.p === 'number' ? ev.p > 0 && ev.p <= 1 : typeof ev.p === 'function', `${ev.id}: p`);
    assert.ok(typeof ev.reason === 'string' && ev.reason.length > 0 && ev.reason.length <= 30, `${ev.id}: reason`);
    if (!ev.once) assert.ok(ev.cooldown >= 3, `${ev.id}: 반복 사건은 cooldown ≥ 3`);
    if (typeof ev.p === 'number') assert.ok(ev.p <= 0.6, `${ev.id}: p가 너무 큼(연동 조건 사건만 .3 이상)`);
    for (const t of ev.tags ?? []) assert.ok(/^(y\.[a-z]+|victim|recovery)$/.test(t), `${ev.id}: tag ${t}`);
    for (const s of ev.src ?? []) assert.ok(SOURCES[s], `${ev.id}: 등록되지 않은 src ${s}`);
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
  for (const ev of youth) {
    const texts = allText(ev);
    assert.ok(texts.length > 0 && texts.every(t => typeof t === 'string' && t.length > 0), `${ev.id}: text`);
    for (const t of texts) {
      assert.ok(!/[{}]/.test(t), `${ev.id}: 중괄호 템플릿 금지 "${t}"`);
      assert.ok(sentences(t) <= 2, `${ev.id}: 문장 ${sentences(t)}개 "${t}"`);
      assert.ok(t.length <= 40, `${ev.id}: text ${t.length}자 "${t}"`);
      if (ev.choice) assert.ok(t.length + ev.choice.prompt.length <= 60, `${ev.id}: prompt+text ${t.length + ev.choice.prompt.length}자 "${t}"`);
      total++; if (t.length > 30) over30++;
      for (const w of BANNED) assert.ok(!t.includes(w), `${ev.id}: 금지어 ${w} "${t}"`);
    }
    for (const o of ev.choice?.options ?? []) {
      assert.ok(o.label.length <= 14, `${ev.id}/${o.id}: label ${o.label.length}자`);
      assert.ok(o.result.length <= 40, `${ev.id}/${o.id}: result ${o.result.length}자 "${o.result}"`);
      assert.equal(sentences(o.result), 1, `${ev.id}/${o.id}: result는 1문장 "${o.result}"`);
      assert.ok(!o.hint || o.hint.length <= 24, `${ev.id}/${o.id}: hint 길이`);
      for (const w of BANNED) assert.ok(!(o.result + o.label + (o.hint ?? '')).includes(w), `${ev.id}/${o.id}: 금지어 ${w}`);
    }
    if (ev.choice) for (const w of BANNED) assert.ok(!ev.choice.prompt.includes(w), `${ev.id}: prompt 금지어 ${w}`);
  }
  console.log(`# 피드 문구 ${total}개 중 30자 초과 ${over30}개(권장 한도, 최대 40자)`);
});

test('선택지 구조: 2~3개, default 존재, 모든 선택지 result·fx 유효, 선택 간 효과 차이 ≥3', () => {
  for (const ev of youth.filter(e => e.choice)) {
    const c = ev.choice, ids = c.options.map(o => o.id);
    assert.ok(typeof c.prompt === 'string' && c.prompt.length > 0 && c.prompt.length <= 20, `${ev.id}: prompt`);
    assert.ok(c.options.length >= 2 && c.options.length <= 3, `${ev.id}: 선택지 수`);
    assert.equal(new Set(ids).size, ids.length, `${ev.id}: 선택지 id 중복`);
    assert.ok(ids.includes(c.default), `${ev.id}: default가 선택지에 없음`);
    for (const o of c.options) {
      assert.ok(typeof o.result === 'string' && o.result, `${ev.id}/${o.id}: result 필수`);
      assert.ok(o.fx, `${ev.id}/${o.id}: fx 필수(무의미 선택 금지)`);
      checkFx(o.fx, `${ev.id}/${o.id}`);
      assert.ok(!o.do || typeof o.do === 'function');
    }
    for (let i = 0; i < c.options.length; i++) for (let j = i + 1; j < c.options.length; j++) {
      assert.ok(dist(c.options[i].fx, c.options[j].fx) >= 3, `${ev.id}: ${ids[i]}↔${ids[j]} 효과 차이 ${dist(c.options[i].fx, c.options[j].fx)} < 3`);
    }
    // 불리한 기본값(효과 합이 가장 낮은 선택)이면 이유 hint가 있어야 한다(GDD §9.1)
    const sum = o => Object.values(o.fx.stats ?? {}).reduce((a, b) => a + b, 0);
    const worst = Math.min(...c.options.map(sum)), d = c.options.find(o => o.id === c.default);
    if (sum(d) === worst && c.options.some(o => sum(o) > worst)) assert.ok(d.hint, `${ev.id}: 불리한 기본값(${d.id})에는 hint 필요`);
  }
  for (const ev of youth) checkFx(ev.fx, ev.id);
  for (const ev of youth.filter(e => !e.choice)) assert.ok(ev.fx, `${ev.id}: 자동 사건은 fx 필요`);
});

test('do 훅: 허용된 act만, 허용된 플래그만, throw 없음', () => {
  const hooks = [];
  for (const ev of youth) {
    if (ev.do) hooks.push([ev.id, ev.do]);
    for (const o of ev.choice?.options ?? []) if (o.do) hooks.push([`${ev.id}/${o.id}`, o.do]);
  }
  assert.ok(hooks.length >= 8);
  for (const [id, fn] of hooks) for (const s of STATES) {
    const calls = [];
    const act = new Proxy({}, { get: (_, k) => (...a) => { assert.ok(ACT_OK.has(k), `${id}: 허용되지 않은 act.${String(k)}`); if (k === 'flag') assert.ok(FLAGS_OK.has(a[0]), `${id}: 플래그 ${a[0]}`); calls.push([k, ...a]); } });
    assert.doesNotThrow(() => fn(mkL(2012, 26, s), act), `${id}: do 훅 오류`);
    assert.ok(calls.length > 0, `${id}: do 훅이 아무것도 안 함`);
  }
});

test('민감 사건: sensitive 값 유효, 자해 없음, 피해자 탓 없음, 선택지에 침묵 없음·도움 경로, once', () => {
  const sens = youth.filter(e => e.sensitive);
  for (const e of sens) {
    assert.ok(SENSITIVE.includes(e.sensitive) && e.sensitive !== 'selfharm', `${e.id}: sensitive ${e.sensitive}`);
    assert.ok(e.once, `${e.id}: 민감 사건은 once`);
    for (const o of e.choice?.options ?? []) assert.ok(!SILENCE.test(o.label + o.result), `${e.id}/${o.id}: 침묵·참기 선택지 금지`);
    for (const t of allText(e)) assert.ok(!/탓|예민|과민|자초|네 잘못|내 잘못/.test(t), `${e.id}: 피해자 탓 문구 "${t}"`);
  }
  const by = id => youth.find(e => e.id === id);
  assert.equal(by('youth.work.bullying').sensitive, 'violence');
  assert.equal(by('youth.work.harassment').sensitive, 'sexual');
  for (const id of ['youth.mil.injury', 'youth.infertility', 'youth.low.mood', 'youth.parent.hospital']) assert.equal(by(id).sensitive, 'illness', id);
  for (const id of ['youth.work.bullying', 'youth.low.mood', 'youth.infertility']) {
    const e = by(id);
    assert.ok(e.choice && e.choice.options.length >= 3, `${id}: 도움·관계 경로 3개 이상`);
    assert.ok(e.choice.options.find(o => o.id === e.choice.default).hint, `${id}: default에 이유 hint`);
  }
  // 괴롭힘·성희롱은 victim 태그(회복 사건 연결), 회복 사건은 recovery 태그
  for (const id of ['youth.work.bullying', 'youth.work.harassment']) assert.ok(by(id).tags.includes('victim'), `${id}: victim 태그`);
  assert.ok(by('youth.recovery').tags.includes('recovery') && !by('youth.recovery').sensitive);
  assert.ok(by('youth.fraud.support').tags.includes('recovery'), '전세사기 후속 지원 연결');
  // 전세사기 후속: 도움 경로 선택지(지원 신청·법률 상담·가까운 사람)
  assert.deepEqual(by('youth.fraud.support').choice.options.map(o => o.id), ['support', 'law', 'talk']);
  const cnt = k => youth.filter(e => e.sensitive === k).length;
  console.log(`# 민감 사건: violence ${cnt('violence')}, sexual ${cnt('sexual')}, illness ${cnt('illness')}`);
});

test('안전·존엄: 직장·연봉·혼인·출산 여부로 승패를 가르지 않는다', () => {
  const WORDS = /(합격 못한|못난|뒤처|한심|노처녀|노총각|결혼 못|아이 못|애도 없|패배|승리자|성공한 사람|실패한 사람|낙오)/;
  for (const ev of youth) {
    for (const t of allText(ev)) assert.ok(!WORDS.test(t), `${ev.id}: 평가 어휘 "${t}"`);
    for (const o of ev.choice?.options ?? []) assert.ok(!WORDS.test(o.label + o.result), `${ev.id}/${o.id}: 평가 어휘`);
  }
  // 비혼·무자녀·비진학 선택지의 결과는 긍정 효과를 하나 이상 가진다
  for (const [id, opt] of [['youth.infertility', 'stop'], ['youth.inlaws', 'rest'], ['youth.blind.date', 'decline'], ['youth.dating.app', 'delete'], ['youth.spec', 'skip']]) {
    const o = youth.find(e => e.id === id).choice.options.find(x => x.id === opt);
    assert.ok(Object.values(o.fx.stats).some(v => v > 0), `${id}/${opt}: 얻는 것이 있어야 함`);
  }
  assert.ok(youth.find(e => e.id === 'youth.single.evening').fx.stats.happiness > 0, '혼자 사는 저녁은 부정적으로 그리지 않는다');
});

test('시대 구분: years가 필요한 사건과 era 문구가 연도별로 달라진다', () => {
  const by = id => youth.find(e => e.id === id);
  assert.ok(by('youth.rider').years[0] >= 2015 && by('youth.dating.app').years[0] >= 2015 && by('youth.invest').years[0] >= 2017);
  assert.deepEqual(by('youth.fraud.news').years, [2022, 2024]);
  assert.ok(by('youth.working.holiday').years[0] >= 1995 && by('youth.daycare.wait').years[0] >= 2005);
  assert.ok(by('youth.civil.exam').years[0] >= 1998 && by('youth.card.debt').years[0] >= 2002);
  // 카드 돌려막기는 2002~2004에 가중
  assert.ok(by('youth.card.debt').p(mkL(2003, 22), {}) > 3 * by('youth.card.debt').p(mkL(2012, 22), {}));
  // 첫 투표: 선거권 나이·선거 연도에서만
  const vote = by('youth.first.vote');
  assert.equal(vote.p(mkL(2003, 19), {}), 0, '2005년 이전에는 19세에 선거권이 없다');
  assert.ok(vote.p(mkL(2004, 20), {}) > 0 && vote.p(mkL(2013, 19), {}) === 0 && vote.p(mkL(2012, 19), {}) > 0);
  for (const id of ['youth.freshman', 'youth.cafe.shift', 'youth.blind.date', 'youth.wedding.gift', 'youth.rejections', 'youth.mil.letter']) {
    const ev = by(id);
    const seen = new Set([1965, 1990, 2005, 2015, 2020, 2026].map(y => variants(ev.text, mkL(y, ev.ages[0], { mil: 'serving' }))[0]));
    assert.ok(seen.size >= 3, `${id}: 시대별 문구 ${seen.size}종`);
  }
  // 최저임금 숫자는 연도 정합(R08 §8 #12·§10 2018~2019): 7,530(2018) 8,350(2019) 10,030(2025) 10,320(2026)
  const cafe = by('youth.cafe.shift');
  const t = y => variants(cafe.text, mkL(y, 20))[0];
  assert.match(t(2018), /7,530/); assert.match(t(2019), /8,350/); assert.match(t(2025), /10,030/); assert.match(t(2026), /10,320/);
  assert.ok(!/\d,\d{3}원/.test(t(2012)) && !/\d,\d{3}원/.test(t(2021)), '근거 없는 연도에는 숫자를 쓰지 않는다');
});

test('조건(when): 시스템 상태와 연동되는 사건이 맞는 상태에서만 후보가 된다', () => {
  const by = id => youth.find(e => e.id === id);
  const W = (id, L) => by(id).when(L, {});
  assert.ok(W('youth.retake.room', mkL(2010, 19, { job: 'student', stage: 'retake' })) && !W('youth.retake.room', mkL(2010, 19, { stage: 'college' })));
  assert.ok(W('youth.mil.letter', mkL(2010, 21, { mil: 'serving' })) && !W('youth.mil.letter', mkL(2010, 21, { mil: 'none' })));
  assert.ok(W('youth.rider', mkL(2020, 25, { platform: true })) && !W('youth.rider', mkL(2020, 25, {})));
  assert.ok(W('youth.substandard', mkL(2012, 24, { flags: { substandard: 2011 } })) && !W('youth.substandard', mkL(2012, 24, {})));
  assert.ok(W('youth.civil.exam', mkL(2016, 28, { job: 'seeking' })));
  assert.ok(!W('youth.civil.exam', mkL(2016, 28, { job: 'seeking', flags: { examUntil: 2017 } })));
  assert.ok(W('youth.recovery', mkL(2016, 28, { flags: { victim: 2015 } })) && !W('youth.recovery', mkL(2016, 28, { flags: { victim: 2016 } })) && !W('youth.recovery', mkL(2016, 28, { flags: { victim: 2011 } })));
  assert.ok(W('youth.fraud.support', mkL(2024, 28, { flags: { fraud: 2023 } })) && !W('youth.fraud.support', mkL(2024, 28, {})));
  assert.ok(W('youth.breakup.after', mkL(2011, 25, { log: [{ id: 'sys.fam.breakup', year: 2010 }] })) && !W('youth.breakup.after', mkL(2013, 25, { log: [{ id: 'sys.fam.breakup', year: 2010 }] })));
  assert.ok(W('youth.pregnant.work', mkL(2012, 30, { married: true, marriedYear: 2010, flags: { childPlanned: 2013 } })) && !W('youth.pregnant.work', mkL(2012, 30, { married: true, marriedYear: 2010 })));
  assert.ok(W('youth.infertility', mkL(2014, 32, { married: true, marriedYear: 2010, children: [] })) && !W('youth.infertility', mkL(2014, 32, { married: true, marriedYear: 2010, children: [{ alive: true, birthYear: 2012 }] })) && !W('youth.infertility', mkL(2014, 32, {})));
  assert.ok(W('youth.newborn.night', mkL(2012, 30, { children: [{ alive: true, birthYear: 2011 }] })) && !W('youth.newborn.night', mkL(2012, 30, { children: [{ alive: true, birthYear: 2005 }] })));
  assert.ok(W('youth.to.seoul', mkL(2012, 25, { region: 'busan' })) && !W('youth.to.seoul', mkL(2012, 25, { region: 'seoul' })));
  assert.ok(W('youth.hometown.job', mkL(2012, 25, { region: 'seoul', birthRegion: 'busan' })) && !W('youth.hometown.job', mkL(2012, 25, { region: 'seoul', birthRegion: 'seoul' })));
  assert.ok(W('youth.loan.repay', mkL(2016, 27, { loan: 800 })) && !W('youth.loan.repay', mkL(2016, 27, {})));
  assert.ok(W('youth.return.work', mkL(2016, 31, { flags: { breakYear: 2012 }, years: 0 })) && !W('youth.return.work', mkL(2016, 31, { flags: {} })));
  // 결혼·출산 사건은 미혼에게 나오지 않고, 연애·소개 사건은 기혼에게 나오지 않는다
  for (const id of ['youth.inlaws', 'youth.wedding.cost']) assert.ok(!W(id, mkL(2016, 30, {})), `${id}: 미혼 제외`);
  for (const id of ['youth.dating.app', 'youth.blind.date']) assert.ok(!W(id, mkL(2020, 30, { married: true, marriedYear: 2015 })), `${id}: 기혼 제외`);
  // 괴롭힘·성희롱은 일하는 사람에게만
  for (const id of ['youth.work.bullying', 'youth.work.harassment']) assert.ok(W(id, mkL(2016, 28, { job: 'employed' })) && !W(id, mkL(2016, 28, { job: 'seeking' })), `${id}: 재직자만`);
});

test('p 설계: 대표 상태·나이에서 후보 Σp가 구간 목표(1.0×1.5 근방) 범위', () => {
  const reps = [
    ['대학 3학년 21세', 2010, 21, { job: 'student', stage: 'college', parents: true, home: 'family', region: 'busan' }],
    ['구직 24세', 2015, 24, { job: 'seeking', stage: 'done', level: '4yr', tenure: 'monthly' }],
    ['비정규 26세 월세', 2019, 26, { job: 'employed', regular: false, tenure: 'monthly', platform: true, indep: true }],
    ['정규 29세 미혼', 2018, 29, { job: 'employed', regular: true, tenure: 'jeonse', indep: true }],
    ['기혼 31세 아기', 2021, 31, { job: 'employed', married: true, marriedYear: 2018, children: [{ alive: true, birthYear: 2021 }], tenure: 'jeonse', indep: true }],
  ];
  for (const [name, y, age, s] of reps) {
    const L = mkL(y, age, s);
    let sum = 0, n = 0;
    for (const ev of youth) {
      if (age < ev.ages[0] || age > ev.ages[1] || (ev.years && (y < ev.years[0] || y > ev.years[1]))) continue;
      if (ev.when && !ev.when(L, {})) continue;
      const p = typeof ev.p === 'function' ? ev.p(L, {}) : ev.p;
      if (p > 0) { sum += p; n++; }
    }
    console.log(`# Σp(${name}) = ${sum.toFixed(2)} (후보 ${n}건)`);
    assert.ok(sum >= 0.4 && sum <= 4, `${name}: Σp ${sum.toFixed(2)}`);
  }
});

test('소스 규칙: Math.random 금지, L 직접 변경 금지', () => {
  for (const f of ['src/content/events/youth.js', 'src/content/system-text-b.js']) {
    const s = readFileSync(new URL('../../' + f, import.meta.url), 'utf8').replace(/\/\/.*$/gm, '');
    assert.ok(!/Math\.random/.test(s), `${f}: Math.random`);
    assert.ok(!/\bL\.[\w.[\]']+\s*(=(?!=)|\+=|-=|\+\+|--)/.test(s), `${f}: 상태 직접 변경`);
  }
});

test('개수 요약: 선택/자동/민감', () => {
  const choice = youth.filter(e => e.choice).length, sens = youth.filter(e => e.sensitive).length;
  console.log(`# youth ${youth.length}건: 선택 ${choice} / 자동 ${youth.length - choice} / 민감 ${sens}`);
  assert.ok(choice >= 18 && choice <= 30, `선택형 ${choice}`);
});

// ───────── system-text-b ─────────
const SYS_KEYS = [
  ...['enlist', 'discharge', 'exempt'].map(k => 'sys.mil.' + k),
  ...['search', 'search_long', 'first_offer', 'first', 'contract_end', 'convert', 'lose', 'reemploy', 'offer', 'raise', 'business', 'business_open', 'business_close', 'childcare', 'career_break', 'return', 'honorary', 'exit_main', 'after_main', 'platform', 'ai_shift', 'retire', 'transition'].map(k => 'sys.job.' + k),
  ...['first_pay', 'independent', 'loan', 'paid_off', 'deficit', 'debt_relief', 'inheritance', 'support_parents', 'severance', 'fraud_loss'].map(k => 'sys.money.' + k),
  ...['independence', 'dorm', 'move', 'renew', 'renewed', 'buy', 'bought', 'value_jump', 'jeonse_fraud', 'public_rental', 'substandard', 'region_move', 'return_parents', 'sell', 'facility'].map(k => 'sys.home.' + k),
  ...['dating', 'breakup', 'marry', 'wedding', 'child', 'child_born', 'divorce', 'divorced', 'remarry', 'young_carer'].map(k => 'sys.fam.' + k),
  'sys.health.smoke_start', 'sys.health.injury',
];
const CHOICE = {
  'sys.job.first_offer': ['take', 'wait', 'exam'], 'sys.job.offer': ['move', 'stay'], 'sys.job.business': ['open', 'job'], 'sys.job.childcare': ['leave', 'quit', 'keep'],
  'sys.job.honorary': ['accept', 'stay'], 'sys.job.after_main': ['work', 'rest', 'shop'], 'sys.home.independence': ['stay', 'room', 'jeonse'], 'sys.home.renew': ['pay', 'cheaper', 'monthly'],
  'sys.home.buy': ['buy', 'wait'], 'sys.fam.marry': ['marry', 'later', 'single'], 'sys.fam.child': ['have', 'wait', 'none'], 'sys.fam.divorce': ['divorce', 'counsel', 'stay'],
};
// 엔진이 넘기는 변수(각 값은 엔진이 실제로 쓰는 어휘 전부)
const VARS = {
  name: ['김하늘', '이도윤'], months: ['21', '18'], n: ['3', '10'], title: ['사무 보조원', '건설기계운전원', '카페 점원'],
  reason: ['임대료 인상', '근무지 이동', '독립 고민'],
  reasonLabel: ['경영 악화', '구조조정', '사업 부진', '정년', '개인 사정', '결혼', '육아', '돌봄', '건강', '독립', '계약 만기', '전세사기'],
  years: ['7', '12'], pay: ['230', '412'], kindLabel: ['학자금 대출', '신용대출', '주택담보대출', '전세자금대출', '사업자 대출'], amount: ['727', '1,200'],
  toLabel: ['자가', '전셋집', '월셋집', '공공임대', '부모님 집', '기숙사', '요양시설'], regionLabel: ['서울', '경기', '부산', '세종'], loan: ['12000', '8500'], dir: ['올랐다', '내렸다'],
  partnerAge: ['31', '27'], partnerJobGroup: ['관리직', '전문직', '사무직', '서비스직', '일을 쉬는 사람', '직업군인'], childSexLabel: ['아들', '딸'], place: ['학교'], who: ['할머니', '아픈 엄마'],
};
const JOSA = ['은', '는', '이', '가', '을', '를', '과', '와', '아', '야', '으로', '로'];
function renderAll(tpl, L, rounds = 4) {
  const out = new Set();
  const keys = Object.keys(VARS), tryVars = Array.from({ length: 6 }, (_, k) => Object.fromEntries(keys.map(v => [v, VARS[v][k % VARS[v].length]])));
  for (let r = 0; r < rounds; r++) for (const vars of tryVars) out.add(fill(tpl, vars, { L, pick: a => a[(r + a.length) % a.length] }));
  return [...out];
}

const RESULT_KEYS = Object.entries(CHOICE).flatMap(([k, ids]) => ids.map(i => k + '.' + i));
test('system-text-b: GDD §9.3 배정 키 전부(+job.retire·transition, 선택 결과 한 줄 32개), 변형 2개 이상, 변수·조사 형식', () => {
  assert.deepEqual(Object.keys(TEXT).sort(), [...SYS_KEYS, ...RESULT_KEYS].sort());
  assert.equal(SYS_KEYS.length, 3 + 23 + 10 + 15 + 10 + 2);
  assert.equal(RESULT_KEYS.length, 32);
  const rawOf = t => (typeof t === 'function' ? [] : [].concat(typeof t === 'object' && !Array.isArray(t) ? t.prompt : t));
  for (const [k, t] of Object.entries(TEXT)) {
    assert.match(k, /^sys\.(mil|job|money|home|fam|health)\./);
    // 변수 이름·조사 문법
    const src = typeof t === 'function' ? String(t) : JSON.stringify(t);
    for (const m of src.matchAll(/\{(\w+)(?:\|([^}]+))?\}/g)) {
      assert.ok(m[1] in VARS, `${k}: 알 수 없는 변수 ${m[1]}`);
      assert.ok(!m[2] || JOSA.includes(m[2]), `${k}: 조사 ${m[2]}`);
    }
    if (CHOICE[k]) {
      assert.ok(t && typeof t === 'object' && !Array.isArray(t), `${k}: 선택 지점은 { prompt, options }`);
      assert.deepEqual(Object.keys(t.options), CHOICE[k], `${k}: 선택지 id(엔진 약속)`);
      assert.ok(Object.values(t.options).every(l => typeof l === 'string' && l.length > 0 && l.length <= 14), `${k}: 라벨 ≤14자`);
      const ps = [].concat(t.prompt);
      assert.ok(ps.length >= 2, `${k}: prompt 변형 2개 이상`);
      for (const p of ps) for (const s of renderAll(p, null)) {
        assert.ok(s.length <= 50, `${k}: prompt ${s.length}자 "${s}"`);
        assert.ok(sentences(s) <= 2 && !/[{}]/.test(s), `${k}: prompt 형식 "${s}"`);
        for (const w of BANNED) assert.ok(!s.includes(w), `${k}: 금지어 ${w} "${s}"`);
      }
      continue;
    }
    const out = new Set();
    for (const y of YEARS) for (const s of renderAll(t, mkL(y, 25), 3)) out.add(s);
    assert.ok(out.size >= 2, `${k}: 변형 ${out.size}개`);
    const isResult = RESULT_KEYS.includes(k);
    for (const s of out) {
      assert.equal(typeof s, 'string');
      if (isResult) assert.ok(s.length <= 40 && sentences(s) === 1, `${k}: 결과 한 줄은 1문장 ≤40자 "${s}"`);
      assert.ok(s.length > 0 && s.length <= 46, `${k}: ${s.length}자 "${s}"`);
      assert.ok(sentences(s) <= 2, `${k}: 문장 수 "${s}"`);
      assert.ok(!/[{}]|\(\)|\(이\)|\(은\)|\(을\)/.test(s), `${k}: 템플릿 잔여 "${s}"`);
      for (const w of BANNED) assert.ok(!s.includes(w), `${k}: 금지어 ${w} "${s}"`);
    }
    assert.ok(rawOf(t).length === 0 || [].concat(t).length >= 2 || typeof t === 'function', `${k}: 변형 2개 이상`);
  }
});

test('system-text-b: 시대·조사 확인 (병역·외환위기·학자금 대출·결혼·돌봄)', () => {
  const ctx = (L, i = 0) => ({ L, pick: a => a[Math.min(i, a.length - 1)] });
  const f = (k, y, vars = {}, i = 0) => fill(TEXT[k], { name: '김하늘', ...vars }, ctx(mkL(y, 25), i));
  assert.notEqual(f('sys.mil.enlist', 1985, {}, 0), f('sys.mil.enlist', 2015, {}, 0));
  assert.match(f('sys.job.lose', 1998, { reasonLabel: '경영 악화' }, 0), /외환위기/);
  assert.ok(!/외환위기/.test(f('sys.job.lose', 2012, { reasonLabel: '경영 악화' }, 0)));
  assert.match(f('sys.job.search', 1998, {}, 0), /채용 공고|외환위기/);
  assert.equal(f('sys.money.loan', 2015, { kindLabel: '학자금 대출', amount: 700 }, 1), '학자금 대출로 700만 원을 당겨 썼다.');
  assert.equal(f('sys.job.first', 2015, { title: '사무 보조원' }, 0), '사무 보조원으로 첫 출근을 했다.');
  assert.equal(f('sys.home.move', 2015, { toLabel: '월셋집', reasonLabel: '독립' }, 0), '월셋집으로 이사했다(독립).');
  assert.equal(f('sys.home.move', 2015, { toLabel: '전셋집', reasonLabel: '독립' }, 0), '전셋집으로 이사했다(독립).');
  assert.equal(f('sys.fam.child_born', 2015, { childSexLabel: '딸' }, 0), '딸이 태어났다.');
  assert.equal(f('sys.fam.child_born', 2015, { childSexLabel: '아들' }, 0), '아들이 태어났다.');
  assert.equal(f('sys.fam.young_carer', 2015, { place: '학교', who: '할머니' }, 1), '학교를 마치면 곧장 집에 와 할머니를 돌보았다.');
  assert.equal(f('sys.money.paid_off', 2015, { kindLabel: '신용대출' }, 0), '신용대출을 다 갚았다.');
  const marry = TEXT['sys.fam.marry'];
  assert.equal(fill(marry.prompt, { partnerAge: 31, partnerJobGroup: '전문직' }, ctx(null, 0)), '31세 전문직과 결혼 이야기가 나왔다.');
  assert.equal(fill(marry.prompt, { partnerAge: 29, partnerJobGroup: '서비스직' }, ctx(null, 0)), '29세 서비스직과 결혼 이야기가 나왔다.');
});
