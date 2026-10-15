// 콘텐츠 확충(가족사 250+·마일스톤 150+·dark 60+·rare 25+) 스키마·길이·id 유일·조건 함수 오류 없음.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FAMILY_HISTORY as FH } from '../../src/content/family-history.js';
import { MILESTONES as MS } from '../../src/content/milestones.js';
import dark from '../../src/content/events/dark.js';
import rare from '../../src/content/events/rare.js';
import { EVENTS } from '../../src/content/events/index.js';
import { STAT_KEYS, ISSUE_KEYS } from '../../src/engine/constants.js';

const sent = s => (s.match(/[.!?](?=\s|$)/g) || []).length;
// 비그래픽·비선정 원칙: 자해·자살·폭력·성적 표현, 비하, 전화번호 형태 금지
const BAN = ['피가', '칼', '때려', '폭행', '흉기', '자해', '자살', '죽고', '죽을', '성폭', '강간', '불쌍', '결핍', '극복', '비정상', '안타깝', '살해', '학대', '성관계', '게으', '무능', '한심'];
const PHONE = /\d{2,4}-\d{3,4}-?\d{0,4}|☎|전화번호|\b(109|1393|1577|1388|112|119)\b/;
const clean = s => !BAN.some(w => s.includes(w)) && !PHONE.test(s);
const fxOk = (f = {}) => {
  for (const [k, v] of Object.entries(f.stats ?? {})) assert.ok(STAT_KEYS.includes(k) && Number.isInteger(v) && Math.abs(v) <= 8, `stat ${k}=${v}`);
  for (const [k, v] of Object.entries(f.issues ?? {})) assert.ok(ISSUE_KEYS.includes(k) && Number.isInteger(v) && Math.abs(v) <= 12, `issue ${k}=${v}`);
  for (const v of Object.values(f.money ?? {})) assert.ok(Number.isInteger(v));
};
// 상태 표본: 성긴 L, 빈 L, 좋은 상태, 나쁜 상태
const L_BAD = { year: 2015, age: 40, sex: 'F', birth: { region: 'jeonnam', urban: false, quintile: 1, parents: { multicultural: true }, disability: 'x' },
  stats: { wealth: 20, health: 30, happiness: 30, relations: 30, leisure: 20 }, job: { status: 'employed', regular: false, platform: true, code: '91110' },
  money: { debt: 8000, assets: 100 }, home: { tenure: 'monthly', parents: false, regionGroup: 'rural' }, family: { partner: 'x', married: true, caringFor: 'father', children: [{ birthYear: 2013, alive: true }], parents: { father: { alive: true, age: 80 }, mother: { alive: false } }, siblings: 1 },
  health: { conditions: [{ key: 'diabetes', active: true }] }, flags: { mainExited: 2014, grandcare: true }, edu: { loan: 1000 } };
const L_GOOD = { year: 2015, age: 40, sex: 'M', birth: { region: 'seoul', urban: true, quintile: 5 }, stats: { wealth: 80, health: 80, happiness: 70, relations: 70, leisure: 60 },
  job: { status: 'employed', regular: true }, money: { debt: 0, assets: 90000 }, home: { tenure: 'own', owned: true, parents: false, regionGroup: 'capital' }, family: { partner: 'x', married: true, children: [] }, health: { conditions: [] } };
const SAMPLES = [null, undefined, {}, { year: 2000, age: 30 }, L_BAD, L_GOOD];

test('가족사 확장: 250개 이상, 길이·id·코호트·지역·형편 필드', () => {
  assert.ok(FH.length >= 250, `${FH.length}개`);
  assert.equal(new Set(FH.map(f => f.id)).size, FH.length);
  const REG = ['yeongnam', 'honam', 'chungcheong', 'gangwon', 'jeju'];
  for (const f of FH) {
    assert.ok([...f.line].length <= 40 && sent(f.line) === 1 && clean(f.line), `${f.id} ${f.line}`);
    assert.ok(f.cohorts[0] >= 1957 && f.cohorts[0] <= f.cohorts[1] && f.cohorts[1] <= 2026, f.id);
    assert.match(f.src, /^K\d$/);
    assert.ok(!f.regionGroup || ['rural', 'capital'].includes(f.regionGroup), f.id);
    assert.ok(!f.region || REG.includes(f.region), f.id);
    assert.ok(!f.wealth || ['low', 'high'].includes(f.wealth), f.id);
  }
  // 코호트·지역·형편 분포
  for (const r of REG) assert.ok(FH.filter(f => f.region === r).length >= 10, r);
  assert.ok(FH.filter(f => f.wealth === 'low').length >= 10 && FH.filter(f => f.wealth === 'high').length >= 10);
  assert.ok(FH.filter(f => f.regionGroup === 'rural').length >= 15 && FH.filter(f => f.regionGroup === 'capital').length >= 15);
  for (const y of [1960, 1975, 1990, 2005, 2020]) assert.ok(FH.filter(f => f.cohorts[0] <= y && y <= f.cohorts[1]).length >= 40, `코호트 ${y}`);
});

test('마일스톤 확장: 150개 이상, 챕터 분포, 형식·효과 상한·when 안전', () => {
  assert.ok(MS.length >= 150, `${MS.length}개`);
  assert.equal(new Set(MS.map(m => m.id)).size, MS.length);
  const TOPICS = ['edu', 'job', 'money', 'housing', 'family', 'care', 'medical'];
  for (let c = 1; c <= 11; c++) assert.ok(MS.filter(m => m.chapter === c).length >= 8, `${c}장`);
  assert.ok(MS.filter(m => m.pool).length >= 110);
  for (const m of MS) {
    assert.ok(TOPICS.includes(m.topic) && m.chapter >= 1 && m.chapter <= 11 && m.major, m.id);
    assert.ok(m.ages[0] <= m.ages[1] && m.years[0] <= m.years[1], m.id);
    // 연령·연도 범위가 1960~2026 출생 코호트와 겹쳐야 발생 가능
    assert.ok(m.years[0] - m.ages[1] <= 2026 && m.years[1] - m.ages[0] >= 1960, `${m.id} 도달 불가 범위`);
    for (const L of SAMPLES) if (m.when) assert.doesNotThrow(() => { const r = m.when(L); assert.ok(typeof r === 'boolean', `${m.id} when 반환`); }, m.id);
    for (const y of [m.years[0], (m.years[0] + m.years[1]) >> 1, m.years[1]]) {
      const s = typeof m.situation === 'function' ? m.situation({ year: y }) : m.situation;
      assert.ok(s.length <= 90 && sent(s) === 2 && clean(s), `${m.id} "${s}"`);
    }
    assert.ok(m.options.length >= 2 && m.options.length <= 3 && m.options.some(o => o.id === m.default), m.id);
    assert.equal(new Set(m.options.map(o => o.id)).size, m.options.length, m.id);
    let hasGain = false, hasLoss = false;
    for (const o of m.options) {
      assert.ok(o.label.length <= 14 && ['low', 'mid', 'high'].includes(o.risk), `${m.id}/${o.id}`);
      assert.ok(o.odds.success > 0 && o.odds.hold >= 0 && o.odds.success + o.odds.hold <= 1, `${m.id}/${o.id} odds`);
      fxOk(o.fx);
      for (const k of ['success', 'hold', 'miss']) {
        const r = o.outcomes[k];
        assert.ok(r.text.length <= 40 && sent(r.text) === 1 && clean(r.text) && r.why.length >= 5 && r.why.length <= 50, `${m.id}/${o.id}/${k} "${r.text}"`);
        fxOk(r.fx);
        for (const v of Object.values(r.fx.money ?? {})) assert.ok(Math.abs(v) <= 30000);
        for (const v of Object.values(r.fx.stats ?? {})) { if (v > 0) hasGain = true; if (v < 0) hasLoss = true; }
      }
    }
    assert.ok(hasGain && hasLoss, `${m.id}: 얻는 것·잃는 것이 함께 있어야 함`);
  }
});

test('dark 사건: 60개 이상, 형식·길이·금지어·조건부 확률', () => {
  assert.ok(dark.length >= 60, `${dark.length}개`);
  const ids = EVENTS.map(e => e.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.ok(dark.every(e => ids.includes(e.id)) && rare.every(e => ids.includes(e.id)));
  let worse = 0, total = 0;
  for (const e of dark) {
    assert.match(e.id, /^dark\.[a-z0-9.]+$/);
    assert.ok(e.tags.includes('dark') && e.ages[0] <= e.ages[1] && e.reason.length <= 30, e.id);
    assert.ok([...e.text].length <= 40 && sent(e.text) <= 2 && clean(e.text) && clean(e.reason), `${e.id} ${e.text}`);
    assert.ok(!e.sensitive, `${e.id}: 비그래픽 사건은 sensitive 지정 불필요`);
    for (const L of SAMPLES) {
      if (e.when) assert.doesNotThrow(() => e.when(L), e.id);
      const p = typeof e.p === 'function' ? e.p(L) : e.p;
      assert.ok(Number.isFinite(p) && p > 0 && p <= 0.3, `${e.id} p=${p}`);
    }
    const pb = typeof e.p === 'function' ? e.p(L_BAD) : e.p, pg = typeof e.p === 'function' ? e.p(L_GOOD) : e.p;
    total++; if (pb > pg) worse++; assert.ok(pb >= pg, `${e.id}: 상태가 나쁠수록 p가 작아지면 안 됨`);
    if (e.fx) fxOk(e.fx);
    if (!e.choice) continue;
    const c = e.choice;
    assert.ok(e.text.length + c.prompt.length <= 60 && c.options.length >= 2 && c.options.length <= 3 && c.options.some(o => o.id === c.default), e.id);
    let gain = false, loss = false;
    for (const o of c.options) {
      assert.ok(o.label.length <= 14 && o.result && [...o.result].length <= 40 && sent(o.result) === 1 && clean(o.result), `${e.id}/${o.id} ${o.result}`);
      fxOk(o.fx);
      assert.ok(o.fx && (o.fx.stats || o.fx.issues || o.fx.money), `${e.id}/${o.id}: 효과 없는 선택지`);
      for (const v of Object.values(o.fx.stats ?? {})) { if (v > 0) gain = true; if (v < 0) loss = true; }
      if ((o.fx.money?.assets ?? 0) > 0) gain = true;
    }
    assert.ok(loss, `${e.id}: 선택에 대가가 있어야 함`);
    assert.ok(gain || c.options.some(o => Object.values(o.fx.issues ?? {}).some(v => v < 0)), `${e.id}: 얻는 것이 있는 선택지 필요`);
  }
  assert.ok(worse / total >= 0.7, `조건부 p 비율 ${worse}/${total}`);
});

test('dark 사건: 주제 범위(괴롭힘·체불·보증금·빚·돌봄·고립·차별·노후 등) 포함', () => {
  const has = k => dark.some(e => e.id.includes(k));
  for (const k of ['bully', 'wage', 'deposit', 'cardbill', 'interest', 'burnout', 'care.', 'divorce|marriage', 'iso.', 'inherit', 'gender', 'region', 'age.interview', 'school.tag', 'disability', 'cmp.', 'old.pension']) {
    assert.ok(k.split('|').some(has), `주제 누락: ${k}`);
  }
});

test('rare 사건: 25개 이상, p 0.0003~0.01, 행운·불운, 후폭풍 선택', () => {
  assert.ok(rare.length >= 25, `${rare.length}개`);
  let lucky = 0, unlucky = 0;
  for (const e of rare) {
    assert.match(e.id, /^rare\.[a-z0-9.]+$/);
    assert.ok(e.tags.includes('rare') && e.once && e.ages[0] <= e.ages[1] && e.reason.length <= 30, e.id);
    assert.ok([...e.text].length <= 40 && sent(e.text) <= 2 && clean(e.text), `${e.id} ${e.text}`);
    for (const L of SAMPLES) {
      if (e.when) assert.doesNotThrow(() => e.when(L), e.id);
      const p = typeof e.p === 'function' ? e.p(L) : e.p;
      assert.ok(p >= 0.0003 && p <= 0.01, `${e.id} p=${p}`);
    }
    fxOk(e.fx);
    const w = (e.fx?.stats?.wealth ?? 0) + (e.fx?.stats?.happiness ?? 0);
    if (w > 0) lucky++; else unlucky++;
    assert.ok(e.choice && e.choice.options.length >= 2 && e.choice.options.length <= 3, `${e.id}: 후폭풍 선택 필요`);
    for (const o of e.choice.options) {
      assert.ok(o.label.length <= 14 && [...o.result].length <= 40 && sent(o.result) === 1 && clean(o.result), `${e.id}/${o.id} ${o.result}`);
      fxOk(o.fx);
    }
  }
  assert.ok(lucky >= 10 && unlucky >= 6, `행운 ${lucky} / 불운 ${unlucky}`);
  const lotto = rare.find(e => e.id === 'rare.lotto.first');
  assert.equal(lotto.p, 0.0003);
  assert.ok(lotto.src[0].includes('8,145,060') && (lotto.fx.money?.assets ?? 0) > 100000);
  assert.ok(lotto.choice.options.some(o => (o.fx.money?.assets ?? 0) <= -20000), '낭비·나눔 후폭풍 선택지');
  assert.ok(rare.find(e => e.id === 'rare.pension.lotto') && rare.find(e => e.id === 'rare.inherit.land') && rare.find(e => e.id === 'rare.redevelop.pay'));
});
