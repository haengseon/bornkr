// 콘텐츠 C(중년기·노년기 사건, 시스템 문구) 스키마·안전 검증. 소유: 콘텐츠 C.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import mid from '../../src/content/events/mid.js';
import late from '../../src/content/events/late.js';
import TEXT from '../../src/content/system-text-c.js';
import { SOURCES } from '../../src/data/sources.js';
import { SENSITIVE, STAT_KEYS, ISSUE_KEYS, TRAIT_KEYS } from '../../src/engine/constants.js';

const ALL = [...mid, ...late];

// GDD §9.4 '콘텐츠 C' 카탈로그 80개(mid 45 + late 35)
const CATALOG = `mid.promotion.transfer mid.layoff.rumor mid.weekend.work mid.younger.boss mid.ai.tool mid.reskill mid.shop.rent mid.delivery.fee mid.covid.limit mid.side.job mid.child.hakwon mid.child.exam mid.child.tuition mid.teen.talk mid.child.disability mid.parent.dementia mid.hospital.night mid.care.split mid.care.leave mid.parent.funeral mid.inheritance mid.rate.hike mid.lottery mid.home.repair mid.rebuild.vote mid.school.district mid.checkup.retest mid.exercise mid.quit.smoke mid.dinner.drinks mid.low.mood mid.couple.silence mid.after.divorce mid.single.parent mid.reunion mid.friend.loan mid.invest.scam mid.honorary.list mid.pension.check mid.downsize mid.old.hobby mid.volunteer mid.heat.bill mid.heating.bill mid.client.bankrupt
late.farewell late.guard.job late.cleaning.job late.senior.job late.chicken.shop late.income.gap late.basic.apply late.grandkids.visit late.ask.children late.child.back late.spouse.care late.alone.meal late.senior.center late.kiosk late.phone.class late.scam.call late.knee.surgery late.far.hospital late.cancer.treat late.memory.fade late.care.visit late.facility.first late.friend.obit late.funeral.plan late.will late.heat.shelter late.cold.room late.garden late.seventy.reunion late.community late.lonely.evening late.neglect late.trip late.album late.hearing.aid`.split(/\s+/);
// 카탈로그 민감 지정(GDD §9.4)
const SENS = { 'mid.child.disability': 'illness', 'mid.parent.dementia': 'illness', 'mid.parent.funeral': 'death', 'mid.low.mood': 'illness', 'late.spouse.care': 'illness', 'late.knee.surgery': 'illness', 'late.cancer.treat': 'illness', 'late.memory.fade': 'illness', 'late.friend.obit': 'death', 'late.neglect': 'abuse' };

// ── 가짜 L·ctx: 함수형 when/p/text를 여러 조건에서 평가 ──
const YEARS = [1998, 2004, 2012, 2016, 2020, 2021, 2022, 2024, 2030, 2040];
const FATHER = (y, dead) => ({ alive: !dead, age: 78, ...(dead && { deathYear: y }) });
const PROFILES = [
  {},
  { status: 'self', regular: false, kids: [8, 18, 20], divorced: true, owned: false, tenure: 'monthly', debt: 0, smoker: 1, wealth: 30, seed: 11 },
  { status: 'retired', exited: true, kids: [30, 33], grandchildren: 2, widowed: true, owned: true, wealth: 30, living_alone: true, isolated: true, region: 'province', urban: false, conds: ['arthritis', 'dementia'], dxNow: 'cancer', ltc: 3, care: 'home', basic: 30, health: 40, sex: 'F' },
  { status: 'seeking', exited: true, kids: [10, 14, 16], married: true, owned: false, tenure: 'jeonse', siblings: 2, caring: 'father', parentsDead: true, access: 20, wealth: 20, ai: 'high', seed: 5 },
  { status: 'inactive', exited: true, kids: [2], married: true, caring: 'spouse', care: 'facility', tenure: 'facility', ltc: 4, py: 2, wealth: 70, access: 90, seed: 99, sex: 'F' },
  { status: 'employed', regular: true, kids: [], married: false, owned: false, tenure: 'jeonse', py: 25, seed: 3, ai: 'low', conds: ['dementia'] },
  { status: 'employed', regular: true, kids: [15], married: true, caring: 'mother', siblings: 1 },
];
function mkL(year, age, sex, p = {}) {
  const sx = p.sex ?? sex;
  const dead = !!p.parentsDead;
  return {
    year, age, sex: sx, seed: p.seed ?? 7,
    birth: { urban: p.urban ?? true, healthAccess: p.access ?? 60 },
    stats: { wealth: p.wealth ?? 50, health: p.health ?? 60 },
    flags: { ...(p.exited && { mainExited: year - 1 }) },
    job: { status: p.status ?? 'employed', regular: p.regular ?? true, public: false, ai: p.ai ?? 'mid' },
    home: { owned: p.owned ?? true, tenure: p.tenure ?? 'own', regionGroup: p.region ?? 'metro' },
    money: { debt: p.debt ?? 5000, pensionYears: p.py ?? 12 },
    family: {
      married: !!p.married, partner: p.married || p.caring === 'spouse' ? { age: age - 2 } : null,
      divorced: !!p.divorced, widowed: !!p.widowed, siblings: p.siblings ?? 1, caringFor: p.caring ?? null,
      livingAlone: !!p.living_alone, grandchildren: p.grandchildren ?? 0,
      children: (p.kids ?? []).map(a => ({ birthYear: year - a, alive: true, leftHome: a >= 25 })),
      parents: { father: FATHER(year, dead), mother: { alive: !dead, age: 76, ...(dead && { deathYear: year - 1 }) } },
    },
    health: { conditions: (p.conds ?? []).map(key => ({ key, active: true })), dx: p.dxNow ? { [p.dxNow]: year } : {}, care: p.care ?? 'none', smoker: p.smoker ?? 0 },
    aging: { pensionStart: null, basic: p.basic ?? 0, ltc: p.ltc ?? 0, isolated: !!p.isolated },
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
  return out.flatMap(x => (Array.isArray(x) ? x : [x]));
}
function allText(ev, pick = e => e.text) {
  const set = new Set();
  for (const L of scenarios(ev)) for (const s of variants(pick(ev), L)) set.add(s);
  return [...set];
}
const pOf = (ev, L) => (typeof ev.p === 'function' ? ev.p(L, {}) : ev.p);
const reachable = ev => { for (const L of scenarios(ev)) if ((!ev.when || ev.when(L, {})) && pOf(ev, L) > 0) return true; return false; };

const sentences = s => (s.replace(/"[^"]*"/g, 'Q').match(/[.!?](?=\s|$)/g) || []).length;
const dist = (a, b) => {
  let d = 0;
  for (const g of ['stats', 'issues']) for (const k of new Set([...Object.keys(a?.[g] ?? {}), ...Object.keys(b?.[g] ?? {})])) d += Math.abs((a?.[g]?.[k] ?? 0) - (b?.[g]?.[k] ?? 0));
  return d;
};
// 희화화·낙인·동정·정답 암시 금지어
const BANNED = ['불쌍', '결핍', '극복', '비정상', '안타깝', '노망', '늙은이', '노인네', '치매 걸린', '치매에 걸린', '정신이 나간', '쓸모', '짐이 되', '폐가 되', '자해', '자살', '고독사', '죽고', '죽을', '피가', '흉기', '때려', '폭행'];
const SILENCE = /참는|참아|침묵|무시|모른 척|모른척|가만히|못 본 척|버틴|버텨|혼자 견/;

function checkFx(fx, where) {
  if (!fx) return;
  for (const k of Object.keys(fx)) assert.ok(['stats', 'issues', 'money', 'traits', 'set'].includes(k), `${where}: fx 키 ${k}`);
  assert.ok(!fx.set, `${where}: fx.set 금지(상태 직접 변경은 act·do로만)`);
  for (const [k, v] of Object.entries(fx.stats ?? {})) {
    assert.ok(STAT_KEYS.includes(k), `${where}: stat ${k}`);
    assert.ok(Number.isInteger(v) && Math.abs(v) <= 8, `${where}: stats.${k}=${v}`);
    assert.ok(!(k === 'intellect' && v < 0), `${where}: 질병·나이로 지력을 깎지 않는다`);
  }
  for (const [k, v] of Object.entries(fx.issues ?? {})) { assert.ok(ISSUE_KEYS.includes(k), `${where}: issue ${k}`); assert.ok(Number.isInteger(v) && Math.abs(v) <= 12, `${where}: issues.${k}=${v}`); }
  for (const [k, v] of Object.entries(fx.traits ?? {})) { assert.ok(TRAIT_KEYS.includes(k), `${where}: trait ${k}`); assert.ok(Number.isInteger(v) && Math.abs(v) <= 3, `${where}: traits.${k}=${v}`); }
  for (const [k, v] of Object.entries(fx.money ?? {})) { assert.ok(['assets', 'debt'].includes(k), `${where}: money.${k}`); assert.ok(Number.isInteger(v) && Math.abs(v) <= 3000, `${where}: money.${k}=${v}`); }
}

test('카탈로그 80개 ID가 모두 구현되고 id가 유일하며 접두사가 맞다', () => {
  const ids = ALL.map(e => e.id);
  assert.equal(new Set(ids).size, ids.length, 'id 중복');
  for (const id of CATALOG) assert.ok(ids.includes(id), `카탈로그 누락: ${id}`);
  assert.equal(CATALOG.length, 80);
  assert.ok(mid.length >= 45 && late.length >= 35);
  for (const e of mid) assert.match(e.id, /^mid\.[a-z]+(\.[a-z]+)*$/);
  for (const e of late) assert.match(e.id, /^late\.[a-z]+(\.[a-z]+)*$/);
});

test('ages·years·p·once·cooldown·when 형식, 모든 사건이 도달 가능', () => {
  for (const ev of ALL) {
    const lim = ev.id.startsWith('mid.') ? [35, 60] : [55, 110];
    assert.ok(Array.isArray(ev.ages) && ev.ages.length === 2 && ev.ages[0] <= ev.ages[1], `${ev.id}: ages`);
    assert.ok(ev.ages[0] >= lim[0] && ev.ages[1] <= lim[1], `${ev.id}: 나이 범위 ${ev.ages}`);
    if (ev.years) assert.ok(ev.years.length === 2 && ev.years[0] <= ev.years[1] && ev.years[0] >= 1960, `${ev.id}: years`);
    assert.ok(typeof ev.p === 'number' ? ev.p > 0 && ev.p <= 1 : typeof ev.p === 'function', `${ev.id}: p`);
    assert.ok(typeof ev.reason === 'string' && ev.reason.length > 0 && ev.reason.length <= 30, `${ev.id}: reason(이슈·지표 사유 로그 문구) 필요`);
    if (!ev.once) assert.ok(ev.cooldown >= 3, `${ev.id}: 반복 사건은 cooldown ≥ 3`);
    for (const L of scenarios(ev)) {
      if (typeof ev.p === 'function') { const p = ev.p(L, {}); assert.ok(Number.isFinite(p) && p >= 0 && p <= 1, `${ev.id}: p()=${p}`); }
      if (ev.when) assert.equal(typeof ev.when(L, {}), 'boolean', `${ev.id}: when은 boolean`);
    }
    // 성긴 L에서도 throw 하지 않는다
    for (const sparse of [{ year: 2000, age: ev.ages[0] }, { year: 2030, age: ev.ages[1], family: {}, health: {}, job: {}, home: {}, flags: {}, money: {}, aging: {}, birth: {}, stats: {} }]) {
      if (ev.when) assert.doesNotThrow(() => ev.when(sparse, {}), `${ev.id}: 성긴 L에서 when 오류`);
      if (typeof ev.p === 'function') assert.doesNotThrow(() => ev.p(sparse, {}), `${ev.id}: 성긴 L에서 p 오류`);
      if (typeof ev.text === 'function') assert.doesNotThrow(() => ev.text(sparse, ctxAt(0)), `${ev.id}: 성긴 L에서 text 오류`);
    }
    assert.ok(reachable(ev), `${ev.id}: 어떤 조건에서도 발생하지 않는다(죽은 사건)`);
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
  }
  console.log(`# 피드 문구 ${total}개 중 30자 초과 ${over30}개(권장 한도, 최대 40자)`);
});

test('선택지 구조: 2~3개, default 존재, result·fx 유효, 선택 간 효과 차이 ≥3, 자동 사건 fx', () => {
  for (const ev of ALL.filter(e => e.choice)) {
    const c = ev.choice, ids = c.options.map(o => o.id);
    assert.ok(typeof c.prompt === 'string' && c.prompt.length > 0 && c.prompt.length <= 20, `${ev.id}: prompt`);
    assert.ok(c.options.length >= 2 && c.options.length <= 3, `${ev.id}: 선택지 수`);
    assert.equal(new Set(ids).size, ids.length, `${ev.id}: 선택지 id 중복`);
    assert.ok(typeof c.default === 'string' && ids.includes(c.default), `${ev.id}: default가 선택지에 없음`);
    for (const o of c.options) {
      assert.ok(typeof o.result === 'string' && o.result, `${ev.id}/${o.id}: result 필수`);
      assert.ok(o.fx, `${ev.id}/${o.id}: fx 필수(무의미 선택 금지)`);
      checkFx(o.fx, `${ev.id}/${o.id}`);
      if (o.do) assert.equal(typeof o.do, 'function');
    }
    for (let i = 0; i < c.options.length; i++) for (let j = i + 1; j < c.options.length; j++) {
      assert.ok(dist(c.options[i].fx, c.options[j].fx) >= 3, `${ev.id}: ${ids[i]}↔${ids[j]} 효과 차이 ${dist(c.options[i].fx, c.options[j].fx)} < 3`);
    }
  }
  for (const ev of ALL) checkFx(ev.fx, ev.id);
  for (const ev of ALL.filter(e => !e.choice)) assert.ok(ev.fx && (Object.keys(ev.fx.stats ?? {}).length || Object.keys(ev.fx.issues ?? {}).length), `${ev.id}: 자동 사건은 fx 필요`);
  const nChoice = ALL.filter(e => e.choice).length;
  console.log(`# 선택 ${nChoice} / 자동 ${ALL.length - nChoice} (선택 비율 ${Math.round(nChoice / ALL.length * 100)}%)`);
});

test('근거: src는 모두 출처 레지스트리에 있다', () => {
  for (const ev of ALL) for (const id of ev.src ?? []) assert.ok(SOURCES[id], `${ev.id}: 미등록 출처 ${id}`);
});

test('민감 사건: 카탈로그 지정 그대로, 자해 없음, 선택지에 침묵 없음, 도움 경로', () => {
  const sens = ALL.filter(e => e.sensitive);
  assert.deepEqual(Object.fromEntries(sens.map(e => [e.id, e.sensitive])), SENS);
  for (const e of sens) {
    assert.ok(SENSITIVE.includes(e.sensitive) && e.sensitive !== 'selfharm', `${e.id}: sensitive ${e.sensitive}`);
    if (['violence', 'abuse', 'sexual'].includes(e.sensitive)) assert.ok(e.once, `${e.id}: 학대는 once`);
    for (const o of e.choice?.options ?? []) assert.ok(!SILENCE.test(o.label + o.result), `${e.id}/${o.id}: 침묵·참기 선택지 금지`);
  }
  // 질병·치매·장애: 지력·성향을 건드리지 않는다
  for (const e of sens) {
    const fxs = [e.fx, ...(e.choice?.options ?? []).map(o => o.fx)].filter(Boolean);
    for (const fx of fxs) { assert.ok(!('intellect' in (fx.stats ?? {})), `${e.id}: 민감 사건은 지력을 건드리지 않는다`); assert.ok(!fx.traits, `${e.id}: traits`); }
  }
  const low = ALL.find(e => e.id === 'mid.low.mood');
  assert.ok(low.choice.options.find(o => o.id === low.choice.default).hint, 'mid.low.mood: default에 이유 hint');
  assert.ok(low.choice.options.every(o => /상담|말한|쉬/.test(o.label)), 'mid.low.mood: 도움·관계·휴식 경로');
  const neglect = ALL.find(e => e.id === 'late.neglect');
  assert.ok(neglect.p <= 0.002 && neglect.once && neglect.text.includes('1577-1389'), 'late.neglect: p ≤ .002, once, 1577-1389 포함');
  const cancer = ALL.find(e => e.id === 'late.cancer.treat');
  assert.equal(cancer.choice.options.length, 3);
  assert.ok(cancer.when({ health: { dx: { cancer: 2030 } }, year: 2030 }) && !cancer.when({ health: { dx: { cancer: 2029 } }, year: 2030 }), 'late.cancer.treat: dx.cancer === year');
  console.log(`# 민감 사건: illness ${sens.filter(e => e.sensitive === 'illness').length}, death ${sens.filter(e => e.sensitive === 'death').length}, abuse ${sens.filter(e => e.sensitive === 'abuse').length}`);
});

test('존엄: 승패·정답 판정 문구, 재산·직급 순위 문구 없음', () => {
  const RANK = /(승자|패자|성공한|실패한|낙오|꼴찌|1등|최고의|출세)/;
  for (const ev of ALL) {
    for (const t of allText(ev)) assert.ok(!RANK.test(t), `${ev.id}: 순위·판정 문구 "${t}"`);
    for (const o of ev.choice?.options ?? []) assert.ok(!RANK.test(o.result + o.label), `${ev.id}/${o.id}`);
  }
});

test('시대 구분: years가 필요한 사건과 era 문구가 연도별로 달라진다', () => {
  const byId = id => ALL.find(e => e.id === id);
  assert.deepEqual(byId('mid.covid.limit').years, [2020, 2021]);
  assert.deepEqual(byId('mid.heating.bill').years, [2022, 2023]);
  assert.ok(byId('mid.ai.tool').years[0] >= 2023 && byId('mid.delivery.fee').years[0] >= 2015 && byId('late.kiosk').years[0] >= 2015);
  assert.ok(byId('mid.care.leave').years[0] >= 2012 && byId('late.senior.job').years[0] >= 2004 && byId('late.basic.apply').years[0] >= 2014);
  const txt = (id, y, age) => variants(byId(id).text, mkL(y, age, 'M'))[0];
  assert.match(txt('mid.layoff.rumor', 1998, 37), /외환위기/);
  assert.doesNotMatch(txt('mid.layoff.rumor', 2010, 45), /외환위기/);
  assert.ok(byId('mid.layoff.rumor').p(mkL(1998, 37, 'M')) > byId('mid.layoff.rumor').p(mkL(2010, 45, 'M')) * 2, '외환위기 해 구조조정 소문 가중');
  assert.match(txt('mid.child.exam', 2020, 45), /마스크/);
  assert.match(txt('mid.parent.basic', 2014, 50), /기초연금을 처음/);
  assert.deepEqual(byId('mid.parent.basic').years, [2014, 2100]);
  assert.match(txt('mid.layoff.rumor', 2008, 40), /금융위기/);
  assert.ok(byId('mid.rate.hike').p(mkL(2022, 45, 'M')) > byId('mid.rate.hike').p(mkL(2016, 45, 'M')) * 3, '2022~23 금리 인상 가중');
  assert.ok(byId('mid.heat.bill').p(mkL(2018, 45, 'M')) > 0 && byId('mid.heat.bill').p(mkL(2019, 45, 'M')) === 0, '폭염 해에만');
  const hot = [2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035].filter(y => byId('mid.heat.bill').p(mkL(y, 45, 'M')) > 0).length;
  assert.ok(hot >= 2 && hot <= 8, `2026년 이후 폭염 해는 시드·연도로 결정적으로 일부만(${hot}/10)`);
  assert.ok(byId('late.heat.shelter').p(mkL(2024, 70, 'M')) > 0 && byId('late.heat.shelter').p(mkL(2021, 70, 'M')) === 0, '폭염 해에만');
  assert.ok(byId('late.cold.room').p(mkL(2022, 70, 'M')) > byId('late.cold.room').p(mkL(2018, 70, 'M')), '난방비 급등 해 가중');
});

test('구조 변화: do는 act로만 호출하고 L을 바꾸지 않는다', () => {
  const calls = [];
  const act = new Proxy({}, { get: (_, name) => (...args) => { calls.push([String(name), args]); } });
  const withDo = [];
  for (const ev of ALL) {
    if (ev.do) withDo.push([ev.id, ev.do]);
    for (const o of ev.choice?.options ?? []) if (o.do) withDo.push([`${ev.id}/${o.id}`, o.do]);
  }
  assert.ok(withDo.length >= 8);
  const ACT_OK = new Set(['flag', 'startJob', 'startBusiness', 'closeBusiness', 'retire', 'move']);
  for (const [id, fn] of withDo) for (const p of PROFILES) {
    const L = mkL(2030, 60, 'M', p), snap = JSON.stringify(L);
    calls.length = 0;
    assert.doesNotThrow(() => fn(L, act), `${id}: do 오류`);
    assert.equal(JSON.stringify(L), snap, `${id}: do가 L을 직접 바꿨다`);
    assert.ok(calls.length >= 1 && calls.every(([n]) => ACT_OK.has(n)), `${id}: act 호출 ${calls.map(c => c[0])}`);
  }
  // 일자리 재취업 사건은 startJob에 필요한 필드를 모두 넘긴다
  for (const id of ['late.guard.job/work', 'late.cleaning.job']) {
    calls.length = 0;
    withDo.find(([k]) => k === id)[1](mkL(2030, 62, 'M'), act);
    const o = calls[0][1][0];
    for (const k of ['code', 'title', 'major', 'band', 'ai', 'hazard', 'regular', 'firmSize', 'wage']) assert.ok(o[k] !== undefined, `${id}: startJob.${k}`);
    assert.ok(o.wage > 0 && o.regular === false);
  }
});

test('소스 규칙: Math.random 금지, L 직접 변경 금지', () => {
  for (const f of ['src/content/events/mid.js', 'src/content/events/late.js', 'src/content/system-text-c.js']) {
    const s = readFileSync(new URL('../../' + f, import.meta.url), 'utf8').replace(/\/\/.*$/gm, '');
    assert.ok(!/Math\.random/.test(s), `${f}: Math.random`);
    assert.ok(!/\bL\.[\w.[\]']+\s*(=(?!=)|\+=|-=|\+\+|--)/.test(s), `${f}: 상태 직접 변경`);
  }
});

test('확률 총량: 대표 조건에서 구간 내 Σp가 GDD §9.1 목표 부근(mid .8×1.5, late .6×1.5)', () => {
  const sum = (arr, L) => arr.reduce((s, e) => s + (L.age >= e.ages[0] && L.age <= e.ages[1] && (!e.years || (L.year >= e.years[0] && L.year <= e.years[1])) && (!e.when || e.when(L, {})) ? pOf(e, L) : 0), 0);
  const rows = [];
  for (const [name, arr, ages, profile, year] of [
    ['mid 직장·자녀', mid, [38, 45, 52], { kids: [12, 17], married: true, status: 'employed', owned: true }, 2012],
    ['mid 자영·이혼', mid, [38, 45, 52], { status: 'self', kids: [8], divorced: true, owned: false }, 2012],
    ['late 퇴직·사별', late, [58, 66, 75], { status: 'retired', exited: true, kids: [30], widowed: true, wealth: 30, grandchildren: 1 }, 2030],
    ['late 부부·건강', late, [70, 80, 88], { status: 'retired', exited: true, kids: [40], married: true, ltc: 3, care: 'home', health: 50, conds: ['arthritis'] }, 2030],
  ]) {
    const ps = ages.map(a => sum(arr, mkL(year, a, 'M', profile)));
    rows.push(`${name}: ${ps.map(p => p.toFixed(2)).join(' / ')}`);
    for (const p of ps) assert.ok(p >= 0.15 && p <= 2.2, `${name}: Σp ${p.toFixed(2)}`);
  }
  console.log('# Σp(연령별) ' + rows.join(' | '));
});

// ── 시스템 문구 ──
test('system-text-c: GDD §9.3 배정 키 29개 + 선택 결과 9개, 변형 2개 이상, 변수·조사 형식', () => {
  const KEYS = ['quit', 'dx_chronic', 'dx_cancer', 'cancer_free', 'dx_cardio', 'dx_dementia', 'depression', 'recover', 'unmet', 'cost'].map(k => 'sys.health.' + k)
    .concat(['pension_start', 'no_pension', 'basic_pension', 'senior_job', 'grandcare', 'ltc', 'residence', 'spouse_care', 'isolated', 'digital'].map(k => 'sys.age.' + k))
    .concat(['parent_death', 'parent_care', 'care_end', 'widowed', 'child_school', 'child_leave', 'child_marry', 'grandchild', 'living_alone'].map(k => 'sys.fam.' + k));
  // 선택 결과 한 줄(엔진 text.js '선택 id.옵션 id' 키): 선택 지점 3곳 × 옵션 3개
  const RESULT = ['sys.fam.parent_care.home', 'sys.fam.parent_care.facility', 'sys.fam.parent_care.share', 'sys.age.grandcare.yes', 'sys.age.grandcare.some', 'sys.age.grandcare.no', 'sys.age.residence.home', 'sys.age.residence.facility', 'sys.age.residence.child'];
  assert.equal(KEYS.length, 29);
  assert.deepEqual(Object.keys(TEXT).sort(), [...KEYS, ...RESULT].sort());
  for (const k of RESULT) assert.ok(TEXT[k.replace(/\.\w+$/, '')], `${k}: 선택 지점 키가 있어야 한다`);
  const CHOICE = { 'sys.age.grandcare': ['yes', 'some', 'no'], 'sys.age.residence': ['home', 'facility', 'child'], 'sys.fam.parent_care': ['home', 'facility', 'share'] };
  const VARS = { condLabel: '고혈압', cancerLabel: '암', amount: '48', grade: '3', parentLabel: '어머니', pAge: '84', who: '배우자', childLabel: '첫째', schoolLabel: '중학교' };
  const sample = s => s.replace(/\{(\w+)(?:\|([^}]+))?\}/g, (_, k, j) => {
    assert.ok(k in VARS, `알 수 없는 변수 ${k}`);
    assert.ok(!j || ['은', '는', '이', '가', '을', '를', '과', '와', '아', '야', '으로', '로'].includes(j), `조사 ${j}`);
    return VARS[k] + (j ? '이' : '');
  });
  const check = (k, s) => {
    assert.equal(typeof s, 'string');
    const f = sample(s);
    assert.ok(f.length <= 46, `${k}: ${f.length}자 "${f}"`);
    assert.ok(sentences(f) <= 2, `${k}: 문장 수 "${f}"`);
    for (const w of BANNED) assert.ok(!f.includes(w), `${k}: 금지어 ${w}`);
  };
  for (const [k, t] of Object.entries(TEXT)) {
    assert.match(k, /^sys\./);
    if (CHOICE[k]) {
      assert.deepEqual(Object.keys(t.options), CHOICE[k], `${k}: 선택지 id`);
      assert.ok(Object.values(t.options).every(l => l.length <= 14), `${k}: label 길이`);
      const ps = [].concat(t.prompt);
      assert.ok(ps.length >= 1 && ps.every(p => typeof p === 'string'), `${k}: prompt`);
      for (const p of ps) { assert.ok(sample(p).length <= 40, `${k}: prompt 길이 "${p}"`); assert.ok(!/…/.test(p)); }
      continue;
    }
    const out = new Set();
    for (const y of YEARS) for (let i = 0; i < 4; i++) for (const s of variants(t, mkL(y, 60, 'M'))) out.add(s);
    assert.ok(out.size >= 2, `${k}: 변형 ${out.size}개`);
    for (const s of out) check(k, s);
  }
  // 시대 문구
  assert.notEqual(TEXT['sys.age.digital'](mkL(2016, 72, 'M'), ctxAt(0)), TEXT['sys.age.digital'](mkL(2024, 72, 'M'), ctxAt(0)));
});

test('system-text-c: 치매·질병·고립 문구는 능력 감점·개인 탓 표현이 없다', () => {
  const bad = /(바보|멍청|똑똑|판단력|지능|게을|못나|자초|탓)/;
  for (const [k, t] of Object.entries(TEXT)) for (const y of [2010, 2030]) for (const s of variants(t.prompt ?? t, mkL(y, 70, 'M'))) assert.ok(!bad.test(s), `${k}: "${s}"`);
});
