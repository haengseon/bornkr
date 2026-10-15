// 콘텐츠 D 검증: era 사건, 판정문, 도움 자원, 시스템 문구(비교·결산).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import ERA from '../../src/content/events/era.js';
import { VERDICTS } from '../../src/content/verdicts.js';
import { HELP_LINES, HELP_BY_SENSITIVE } from '../../src/content/help.js';
import TEXT from '../../src/content/system-text-d.js';
import { ISSUE_KEYS, STAT_KEYS, SENSITIVE } from '../../src/engine/constants.js';
import { fill } from '../../src/engine/text.js';

const FILES = ['events/era.js', 'verdicts.js', 'help.js', 'system-text-d.js'];
const strs = v => (Array.isArray(v) ? v : [v]);

// ── era ──
const GDD_ERA_IDS = `era.1970.saemaeul era.1973.oil era.1974.equalize era.1980.oil era.1980.tutor.ban era.1981.quota
era.1987.june era.1988.olympics era.1988.house.boom era.1993.realname era.1994.csat era.1994.bridge era.1995.sampoong
era.1996.colleges era.1997.imf era.1998.gold era.2000.pharm era.2000.tutor.legal era.2002.worldcup era.2003.card
era.2003.subway era.2004.fiveday era.2007.nonreg.law era.2008.gfc era.2008.ltc era.2010.smartphone era.2013.childcare
era.2014.sewol era.2014.basic.pension era.2015.mers era.2016.candle era.2020.covid era.2020.lease.law era.2021.youngkkeul
era.2022.rates era.2022.itaewon era.2023.jeonse.fraud era.2023.energy era.2024.medical era.2024.martial era.2025.pension
era.2026.heat era.2030.aging era.2036.aging era.2050.aging`.split(/\s+/);
const DISASTER = ['era.1994.bridge', 'era.1995.sampoong', 'era.2003.subway', 'era.2014.sewol', 'era.2022.itaewon'];

test('era: 카탈로그 45건 이상, id 유일·GDD 전 항목 포함', () => {
  assert.ok(ERA.length >= 45);
  const ids = ERA.map(e => e.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const id of ids) assert.match(id, /^era\.\d{4}\.[a-z]+(\.[a-z]+)*$/);
  for (const id of GDD_ERA_IDS) assert.ok(ids.includes(id), id);
});

test('era: years·ages·weight·tiers 스키마', () => {
  for (const e of ERA) {
    const [y0, y1] = e.years;
    assert.ok(Number.isInteger(y0) && Number.isInteger(y1) && y0 <= y1 && y0 >= 1960 && y1 <= 2100, e.id);
    const [a0, a1] = e.ages;
    assert.ok(Number.isInteger(a0) && Number.isInteger(a1) && a0 >= 0 && a0 <= a1 && a1 <= 120, e.id);
    assert.ok(Number.isInteger(e.weight) && e.weight >= 1 && e.weight <= 5, e.id);
    assert.equal(e.once, true, e.id);
    assert.equal(e.choice, undefined, `${e.id}: era는 선택 없음`);
    assert.ok(typeof e.reason === 'string' && e.reason.length > 0, e.id);
    assert.deepEqual(Object.keys(e.tiers).sort(), ['adult', 'child', 'teen'], e.id);
    for (const [k, t] of Object.entries(e.tiers)) {
      assert.ok(typeof t === 'string' && t.length >= 8 && t.length <= 40, `${e.id}.${k} (${t.length}자)`);
    }
    assert.equal(e.text, e.tiers.adult);
    if (e.when) assert.doesNotThrow(() => e.when({ home: {}, money: {}, birth: {} }), e.id);
  }
});

test('era: fx 범위(issues ≤12, stats ≤3) · 키 유효', () => {
  for (const e of ERA) {
    assert.ok(e.fx && Object.keys(e.fx).every(k => k === 'stats' || k === 'issues'), e.id);
    for (const [k, v] of Object.entries(e.fx.issues || {})) {
      assert.ok(ISSUE_KEYS.includes(k) && Number.isInteger(v) && Math.abs(v) <= 12, `${e.id} issues.${k}`);
    }
    for (const [k, v] of Object.entries(e.fx.stats || {})) {
      assert.ok(STAT_KEYS.includes(k) && Number.isInteger(v) && Math.abs(v) <= 3, `${e.id} stats.${k}`);
    }
    assert.ok(Object.keys(e.fx.issues || {}).length + Object.keys(e.fx.stats || {}).length > 0, e.id);
  }
});

test('era: 참사는 disaster·수치 없음, 전망은 2027+ 와 \'전망\' 표기', () => {
  for (const e of ERA) {
    assert.ok(!e.sensitive || SENSITIVE.includes(e.sensitive), e.id);
    assert.equal(e.sensitive === 'disaster', DISASTER.includes(e.id), e.id);
    if (e.sensitive === 'disaster') {
      for (const t of Object.values(e.tiers)) assert.doesNotMatch(t, /\d|사망|희생|부상|실종|죽/, `${e.id}: ${t}`);
      assert.equal(e.fx.stats, undefined, `${e.id}: 참사는 지표 효과 없음`);
    }
    assert.equal(e.kind === 'projected', e.years[0] >= 2027, e.id);
    if (e.kind === 'projected') for (const t of Object.values(e.tiers)) assert.match(t, /전망/, `${e.id}: ${t}`);
  }
});

test('era: src 형식, sources.js가 있으면 등록 확인', async () => {
  const PENDING = new Set(); // 리드가 sources.js에 등록 완료
  let SOURCES = null;
  if (existsSync(new URL('../../src/data/sources.js', import.meta.url))) {
    SOURCES = (await import('../../src/data/sources.js')).SOURCES;
  }
  for (const e of ERA) {
    for (const s of e.src || []) {
      assert.match(s, /^(R0\d|GDD)\.[SE]\d+[a-z]?$/, e.id);
      if (SOURCES && !PENDING.has(s)) assert.ok(SOURCES[s], `${e.id}: ${s} 미등록`);
    }
  }
});

test('era: 정치 중립·실명 없음, Math.random 미사용', () => {
  const all = ERA.flatMap(e => Object.values(e.tiers).concat(e.reason)).join('\n');
  assert.doesNotMatch(all, /박정희|전두환|노태우|김영삼|김대중|노무현|이명박|박근혜|문재인|윤석열|이재명|최규하/);
  assert.doesNotMatch(all, /독재|내란|쿠데타|무능|폭정|좌파|우파|보수|진보|친일|종북/);
  for (const f of FILES) assert.doesNotMatch(readFileSync(new URL(`../../src/content/${f}`, import.meta.url), 'utf8'), /Math\.random/);
});

test('era: 출생 1960~2026 생애를 돌리면 모든 사건이 어딘가에서 발생한다(죽은 사건 없음)', () => {
  // eraStep과 같은 규칙(ages·years·once·when → 최대 weight, 동률 추첨)을 결정적 LCG로 모의
  let seed = 12345;
  const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32);
  const fired = new Set();
  for (const tenure of ['own', 'jeonse', 'family'])
    for (const urban of [true, false])
      for (const debt of [0, 5000])
        for (const quintile of [1, 5])
          for (const elder of [false, true])
            for (let birth = 1960; birth <= 2026; birth++)
              for (let rep = 0; rep < 2; rep++) {
                const done = new Set();
                for (let year = birth; year <= Math.min(2100, birth + 100); year++) {
                  const age = year - birth;
                  const L = { age, year, home: { tenure }, birth: { urban, quintile }, money: { debt }, family: { parents: { mother: { alive: true, age: elder ? 70 : 40 } } } };
                  let best = [], top = -1;
                  for (const e of ERA) {
                    if (done.has(e.id) || year < e.years[0] || year > e.years[1] || age < e.ages[0] || age > e.ages[1] || (e.when && !e.when(L))) continue;
                    if (e.weight > top) { top = e.weight; best = [e]; } else if (e.weight === top) best.push(e);
                  }
                  if (best.length) { const pick = best[Math.floor(rnd() * best.length)]; done.add(pick.id); fired.add(pick.id); }
                }
              }
  for (const e of ERA) assert.ok(fired.has(e.id), `${e.id}: 같은 해 더 큰 사건에 항상 밀리거나 조건이 맞지 않음`);
});

// ── verdicts ──
const QTY = { housing: 12, job: 12, edu: 8, care: 10, medical: 8, fairness: 6, region: 6, tech: 5, conflict: 4, living: 6, quiet: 8, early: 6, young: 4, neutral: 4 };

test('verdicts: 계열·수량(합 99)·humor 규칙', () => {
  assert.deepEqual(Object.keys(VERDICTS).sort(), Object.keys(QTY).sort());
  let total = 0;
  for (const [fam, list] of Object.entries(VERDICTS)) {
    assert.equal(list.length, QTY[fam], fam);
    total += list.length;
    for (const v of list) {
      assert.equal(typeof v.humor, 'boolean', fam);
      assert.ok(v.text.length >= 8 && v.text.length <= 70, `${fam}: ${v.text}`);
    }
    const noHumor = list.filter(v => !v.humor).length;
    const expect = fam === 'young' || fam === 'neutral' ? QTY[fam] : fam === 'medical' ? 3 : 0;
    assert.equal(noHumor, expect, `${fam} 무유머 수`);
  }
  assert.equal(total, 99);
  const texts = Object.values(VERDICTS).flat().map(v => v.text);
  assert.equal(new Set(texts).size, texts.length, '중복 문장');
});

test('verdicts: 금지어·변수 규칙', () => {
  for (const [fam, list] of Object.entries(VERDICTS)) {
    for (const { text } of list) {
      assert.doesNotMatch(text, /\d+억|억 ?원|연봉|직급|백분위|순위|상위|하위|성공|실패|승리|패배|행운|부자|학벌|명문/, text);
      assert.doesNotMatch(text, /자살|자해|사인|사망 원인/, text);
      const vars = [...text.matchAll(/\{(\w+)(?:\|[^}]+)?\}/g)].map(m => m[1]);
      if (fam === 'young') assert.ok(vars.every(v => ['name', 'n'].includes(v)), text);
      else if (fam === 'neutral') assert.ok(vars.every(v => ['name', 'year'].includes(v)), text);
      else assert.deepEqual(vars, [], text);
    }
  }
  assert.ok(VERDICTS.neutral.every(v => /\{year\}/.test(v.text)));
});

// ── help ──
test('help: HELP_LINES 형식·확인된 번호만, HELP_BY_SENSITIVE 참조 무결', () => {
  const ids = HELP_LINES.map(h => h.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const id of ['109', '1577-0199', '1388', '1366', '117', '1577-1389', '112', '1588-9191']) assert.ok(ids.includes(id), id);
  assert.ok(!ids.includes('1393') && !HELP_LINES.some(h => /1393/.test(JSON.stringify(h))), '1393은 폐지');
  for (const h of HELP_LINES) {
    assert.match(h.number, /^\d{3,4}(-\d{4})?$/, h.id);
    assert.equal(h.id, h.number);
    assert.ok(h.name && h.org && Array.isArray(h.topics) && h.topics.length > 0, h.id);
    assert.ok(h.hours === null || (typeof h.hours === 'string' && h.hours.length > 0), h.id);
    assert.ok(h.url === null || /^https:\/\//.test(h.url), h.id);
  }
  // R07 §12에서 24시간이 확인된 번호만 hours 값을 둔다
  for (const id of ['1577-0199', '1388', '117', '112', '119', '1588-9191']) assert.equal(HELP_LINES.find(h => h.id === id).hours, null, `${id}: 미확인 시간`);
  for (const k of ['violence', 'abuse', 'sexual', 'illness', 'death', 'selfharm', 'disaster', 'elder']) {
    assert.ok(HELP_BY_SENSITIVE[k]?.length > 0, k);
    for (const id of HELP_BY_SENSITIVE[k]) assert.ok(ids.includes(id), `${k}→${id}`);
  }
  assert.equal(HELP_BY_SENSITIVE.selfharm[0], '109');
  assert.equal(HELP_BY_SENSITIVE.disaster[0], '1588-9191');
});

// ── system-text-d ──
const FACTS = {
  7: 'care_young moved sibling school_enter', 19: 'retake college_capital college_region work military dropout_work',
  29: 'jobseeking nonregular regular self home_parents home_monthly home_jeonse home_own married dating single',
  42: 'caring_parent raising_kids moved job_change job_loss self diagnosis', 55: 'retired_main still_working caring_parent kids_left diagnosis',
  70: 'pension_work pension at_home with_kids facility widowed alone caring',
};
const VARS = { name: '김지훈', region: '경북', workPlace: '병원에서', kids: 2, years: 28, year: 1995, x: 12.3, age: 81, ageText: '7개월', n: 14, m: 5, k: 3, y: 6, a: 2, b: 4 };
const ALLOWED = new Set(Object.keys(VARS));

test('system-text-d: 필수 키 존재·변형 수', () => {
  const need = ['cmp.dead', 'cmp.dead.young', 'sys.death.line', 'sys.death.infant', 'sys.death.help_intro', 'sys.clock.cap', 'sys.auto.line',
    'end.death', 'end.death.young', 'end.cap', 'end.transparency', 'end.hook'];
  for (const [age, facts] of Object.entries(FACTS)) {
    need.push(`cmp.stat.${age}`, `cmp.${age}.default`);
    for (const f of facts.split(' ')) need.push(`cmp.${age}.${f}`);
  }
  for (const k of ['econ', 'health', 'relations', 'autonomy', 'careBurden']) need.push(`end.${k}`, `sys.closing.${k}`);
  for (const k of need) assert.ok(TEXT[k] != null, `키 없음: ${k}`);
  for (const k of Object.keys(TEXT)) {
    if (k === 'end.hook') continue;
    const v = TEXT[k];
    assert.ok(Array.isArray(v) && v.length >= 2 && v.every(s => typeof s === 'string' && s.length > 0), `${k}: 문자열 변형 2개 이상`);
  }
  for (const k of ['econ', 'health', 'relations', 'autonomy', 'careBurden']) assert.ok(TEXT[`end.${k}`].length >= 3, `end.${k} 3변형`);
  assert.equal(TEXT['end.hook'], '이 아이는 무엇을 감당하게 될까요?');
});

test('system-text-d: 금지어·변수·사인 없음', () => {
  for (const [k, v] of Object.entries(TEXT)) {
    for (const s of strs(v)) {
      assert.doesNotMatch(s, /순위|상위|하위|연봉|\d억|억 ?원|등수|사인|사망 원인|자살|자해/, `${k}: ${s}`);
      for (const [, name] of s.matchAll(/\{(\w+)(?:\|[^}]+)?\}/g)) assert.ok(ALLOWED.has(name), `${k}: 미지의 변수 ${name}`);
    }
  }
});

test('system-text-d: 비교 카드 줄 ≤40자(4자 이름·꼬리 합산 기준)', () => {
  const long = { ...VARS, name: '남궁민수' };
  for (const [k, v] of Object.entries(TEXT)) {
    if (!k.startsWith('cmp.')) continue;
    for (const s of v) assert.ok(fill(s, long).length <= 40, `${k}: ${fill(s, long)}`);
  }
  // 29·70세: 첫 사실 + 꼬리 1개 합산
  const heads = { 29: ['jobseeking', 'nonregular', 'regular', 'self', 'default'], 70: ['pension_work', 'pension', 'default'] };
  const tails = { 29: ['home_parents', 'home_monthly', 'home_jeonse', 'home_own', 'married', 'dating', 'single'], 70: ['at_home', 'with_kids', 'facility', 'widowed', 'alone', 'caring'] };
  for (const age of [29, 70]) {
    for (const h of heads[age]) for (const t of tails[age]) for (const hs of TEXT[`cmp.${age}.${h}`]) for (const ts of TEXT[`cmp.${age}.${t}`]) {
      const line = `${fill(hs, VARS)} ${fill(ts, VARS)}`;
      assert.ok(line.length <= 40, `${age} ${h}+${t}: ${line} (${line.length}자)`);
    }
  }
});

test('system-text-d: 사망·결산 문구 렌더', () => {
  for (const s of TEXT['sys.death.line']) assert.match(fill(s, VARS), /1995년/);
  assert.match(fill(TEXT['end.death.young'][0], VARS), /김지훈은 7개월에/);
  assert.match(fill(TEXT['cmp.dead'][0], VARS), /김지훈은 1995년/);
  for (const k of ['econ', 'health', 'relations', 'autonomy', 'careBurden']) for (const s of TEXT[`end.${k}`]) assert.doesNotMatch(fill(s, VARS), /\{|\}/, s);
});
