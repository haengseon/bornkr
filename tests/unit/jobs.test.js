// 직업 DB 불변식: src/data/jobs.js (GDD §10.1)와 src/content/jobs-core.js (GDD §10.5, ARCHITECTURE §8 사건 DSL)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JOBS } from '../../src/data/jobs.js';
import ALL_CORE from '../../src/content/jobs-core.js';
const CORE = ALL_CORE.filter(c => !process.env.JOBS_ONLY || process.env.JOBS_ONLY.split(',').some(p => c.code.startsWith(p))); // 부분 검증: JOBS_ONLY=21,22 등
import { STAT_KEYS, ISSUE_KEYS } from '../../src/engine/constants.js';

const rows = JOBS.values;
const byCode = new Map(rows.map(r => [r.code, r]));
const EDU = ['none', 'high', '2yr', '4yr', 'grad', 'license'];
const GATES = ['med', 'nurse', 'teach', 'law', 'acct', 'care', 'social', 'tech', 'drive'];
const MAJORS = ['med', 'edu', 'eng', 'sci', 'soc', 'hum', 'art'];
const ENTRY_TYPES = ['exam', 'license', 'degree', 'hire', 'inherit', 'self', 'platform', 'promote'];
const len = s => [...s].length;

test('JOBS 메타·행 수·대분류', () => {
  assert.equal(JOBS.src, 'R09.S1');
  assert.equal(JOBS.kind, 'estimated');
  assert.ok(rows.length >= 500, `rows=${rows.length}`);
  const majors = new Set(rows.map(r => r.major));
  for (const m of ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'A']) assert.ok(majors.has(m), `대분류 ${m}`);
});

test('src/data/jobs.js는 tools/build-jobs.mjs 결과와 같다(수동 편집 금지)', () => {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
  const r = spawnSync(process.execPath, ['tools/build-jobs.mjs', '--check'], { cwd: root, encoding: 'utf8' });
  assert.equal(r.status, 0, r.stdout + r.stderr);
});

test('JOBS 필수 필드·값 범위·code 유일', () => {
  assert.equal(byCode.size, rows.length, 'code 중복');
  for (const r of rows) {
    const id = `${r.code} ${r.name}`;
    assert.match(r.code, /^([1-9]\d{4}|A\d{4}|[1-9]Z\d{3})$/, id);
    assert.ok(r.code[0] === r.major, `${id}: 코드 첫 글자와 major 불일치`);
    for (const k of ['name', 'sub', 'minor']) assert.ok(typeof r[k] === 'string' && r[k].length > 0, `${id}.${k}`);
    assert.ok([1, 2, 3, 4].includes(r.skill), id);
    assert.ok(EDU.includes(r.edu), id);
    if (r.edu === 'license') assert.ok(GATES.includes(r.license), `${id}: 자격 관문`);
    else assert.equal(r.license, null, `${id}: license는 edu=license일 때만`);
    assert.ok([1, 2, 3, 4, 5, 6].includes(r.band), id);   // 6 = 의사·치과의사(R20)
    assert.ok(['low', 'mid', 'high'].includes(r.ai), id);
    assert.ok(r.female >= 0 && r.female <= 1, id);
    assert.ok(typeof r.w === 'number' && r.w >= 0, id);
    assert.ok(r.selfShare >= 0 && r.selfShare <= 1, id);
    assert.ok([0, 1, 2, 3].includes(r.hazard), id);
    assert.equal(typeof r.rural, 'boolean', id);
    assert.equal(typeof r.public, 'boolean', id);
    assert.equal(typeof r.core, 'boolean', id);
    assert.ok(Number.isInteger(r.since) && r.since >= 1900 && r.since <= 2100, `${id}: since 미설정`);
    assert.ok(r.until === null || (Number.isInteger(r.until) && r.until > r.since), `${id}: until`);
  }
});

test('JOBS 시대 존재 범위 예시', () => {
  const g = c => byCode.get(c);
  assert.equal(g('22231').since, 1980);   // 범용 소프트웨어 개발자
  assert.equal(g('92230').since, 2015);   // 늘찬배달원
  assert.equal(g('29380').since, 2012);   // 미디어 콘텐츠 창작자
  assert.ok(g('22233').since >= 2000);    // 모바일 앱 개발자
  const past = rows.filter(r => r.until !== null);
  assert.ok(past.length >= 6, '과거 전용 직업');
  assert.ok(past.some(r => r.name.includes('버스 안내')) && past.some(r => r.name === '타자원'));
  assert.ok(rows.filter(r => r.legacy).every(r => r.code.includes('Z') && r.until !== null));
});

test('JOBS 대분류별 취업자 가중 band·ai 분포가 R09 §3.6 표와 ±5%p', () => {
  const TARGET = {
    1: { band: { 5: 100 }, ai: { mid: 100 } },
    2: { band: { 1: 8.7, 2: 19.4, 3: 7.4, 4: 34.8, 5: 29.7 }, ai: { mid: 78.6, high: 10.2, low: 11.2 } },
    3: { band: { 2: 12.6, 3: 17.4, 4: 63.4, 5: 6.5 }, ai: { high: 98.1, low: 1.9 } },
    4: { band: { 1: 64.4, 2: 25.6, 3: 3.6, 4: 6.1, 5: 0.3 }, ai: { low: 100 } },
    5: { band: { 1: 9.9, 2: 68.0, 4: 22.0 }, ai: { high: 67.6, mid: 28.8, low: 3.5 } },
    6: { band: { 2: 100 }, ai: { low: 100 } },
    7: { band: { 1: 1.2, 2: 20.2, 3: 30.2, 4: 48.4 }, ai: { low: 100 } },
    8: { band: { 2: 0.8, 3: 56.5, 4: 30.6, 5: 12.1 }, ai: { low: 100 } },
    9: { band: { 1: 61.9, 2: 30.5, 3: 7.6 }, ai: { low: 100 } },
  };
  for (const [m, t] of Object.entries(TARGET)) {
    const rs = rows.filter(r => r.major === m && !r.legacy);
    const tot = rs.reduce((a, r) => a + r.w, 0);
    const dist = (key, vals) => Object.fromEntries(vals.map(v => [v, 100 * rs.filter(r => String(r[key]) === String(v)).reduce((a, r) => a + r.w, 0) / tot]));
    for (const [key, target] of [['band', t.band], ['ai', t.ai]]) {
      const got = dist(key, key === 'band' ? [1, 2, 3, 4, 5] : ['low', 'mid', 'high']);
      for (const [v, x] of Object.entries(got)) {
        assert.ok(Math.abs(x - (target[v] ?? 0)) <= 5, `대분류 ${m} ${key}=${v}: ${x.toFixed(1)}% vs ${target[v] ?? 0}%`);
      }
    }
  }
});

test('core 450+: jobs.js core 플래그와 jobs-core.js(핵심 150 + 확충)가 일치', () => {
  const flagged = rows.filter(r => r.core).map(r => r.code).sort();
  assert.ok(flagged.length >= 450, `직업 ${flagged.length}`);
  assert.equal(CORE.length, flagged.length);
  assert.deepEqual(CORE.map(c => c.code).sort(), flagged);
  assert.equal(new Set(CORE.map(c => c.code)).size, CORE.length, 'core code 중복');
  assert.equal(CORE.filter(c => c.shared).length, 150, '기본 핵심 150');
});

test('jobs-core: 진입 경로·전직 규칙 스키마', () => {
  for (const c of CORE) {
    const job = byCode.get(c.code);
    assert.ok(job, `${c.code} jobs.js에 없음`);
    if (c.shared !== undefined) assert.equal(c.shared, `minor:${job.minor}`, `${c.code} shared`);
    assert.ok(Array.isArray(c.entry) && c.entry.length >= 1, `${c.code} entry`);
    for (const e of c.entry) {
      assert.ok(ENTRY_TYPES.includes(e.type), `${c.code} entry.type ${e.type}`);
      assert.ok(typeof e.text === 'string' && len(e.text) > 0 && len(e.text) <= 60, `${c.code} entry.text`);
      assert.deepEqual(e.src, ['R09.S1']);
      assert.ok(typeof e.p === 'number' && e.p >= 0 && e.p <= 1, `${c.code} entry.p`);
      if (e.minEdu) assert.ok(['none', 'high', '2yr', '4yr', 'grad'].includes(e.minEdu), `${c.code} minEdu`);
      if (e.license) assert.ok(GATES.includes(e.license), `${c.code} license`);
      for (const m of e.majors ?? []) assert.ok(MAJORS.includes(m), `${c.code} major ${m}`);
      if (e.ages) assert.ok(e.ages.length === 2 && e.ages[0] < e.ages[1] && e.ages[0] >= 15, `${c.code} entry.ages`);
      if (e.era) assert.ok(e.era.length === 2 && (e.era[1] === null || e.era[0] < e.era[1]), `${c.code} entry.era`);
      if (e.type === 'promote') {
        assert.ok(Array.isArray(e.from) && e.from.length > 0 && Number.isFinite(e.minYears), `${c.code} promote`);
        for (const f of e.from) assert.ok(byCode.has(f), `${c.code} promote.from ${f}`);
      }
      if (e.type === 'exam') assert.ok(Number.isFinite(e.years), `${c.code} exam.years`);
    }
    assert.ok(Array.isArray(c.transitions) && c.transitions.length >= 1, `${c.code} transitions`);
    for (const t of c.transitions) {
      assert.ok(byCode.has(t.to), `${c.code} → ${t.to} jobs.js에 없음`);
      assert.notEqual(t.to, c.code);
      assert.ok(t.ages[0] < t.ages[1] && t.ages[0] >= 18, `${c.code} → ${t.to} ages`);
      assert.ok(Number.isFinite(t.minYears) && t.minYears >= 0, `${c.code} → ${t.to} minYears`);
      assert.ok(t.p > 0 && t.p <= 0.2, `${c.code} → ${t.to} p`);
      assert.ok(typeof t.reason === 'string' && len(t.reason) > 0 && len(t.reason) <= 24, `${c.code} → ${t.to} reason`);
    }
    if (c.burnout !== undefined) assert.ok(c.burnout > 0 && c.burnout <= 0.2, `${c.code} burnout`);
    if (c.hazard !== undefined) assert.ok([0, 1, 2, 3].includes(c.hazard));
  }
});

test('jobs-core: license 직업은 같은 관문의 진입 경로를 갖고, 진입 era는 직업 존재 범위 안', () => {
  for (const c of CORE) {
    const job = byCode.get(c.code);
    if (job.edu === 'license' && c.code !== 'A0900') {
      assert.ok(c.entry.some(e => e.license === job.license), `${c.code} 진입 경로에 license '${job.license}' 없음`);
    }
    for (const e of c.entry) {
      if (e.era && e.era[0] !== null) assert.ok(e.era[0] >= job.since, `${c.code} era 시작 ${e.era[0]} < since ${job.since}`);
      if (e.era && e.era[1] !== null && job.until !== null) assert.ok(e.era[1] <= job.until, c.code);
    }
  }
});

const events = CORE.flatMap(c => c.events.map(e => ({ code: c.code, e })));
const BANNED = ['쿠팡', '배민', '배달의민족', '삼성', '현대', '기아', '카카오', '네이버', '유튜브', '인스타', '구글', '애플', '아마존', '넷플릭스', '토스', '당근', '엘지', '롯데', '이마트', '홈플러스', 'CU', 'GS25', '세븐일레븐', '스타벅스', '맥도날드', '우버', '타다', '마켓컬리', '대한항공', '아시아나', 'KTX', '신한', '국민은행', '우리은행', '하나은행'];

test('jobs-core 사건: 직업당 3~5(핵심 150은 4~6), 총 1500+, id 유일, 어두운 사건 비중', () => {
  for (const c of CORE) { const n = c.events.length; const [lo, hi] = c.shared ? [4, 6] : [3, 5]; assert.ok(n >= lo && n <= hi, `${c.code} 사건 수 ${n}`); }
  assert.ok(events.length >= 1500, `events=${events.length}`);
  const dark = events.filter(x => x.e.tags.includes('dark')).length;
  assert.ok(dark / events.length >= 0.25 && dark / events.length <= 0.5, `dark 비중 ${(dark / events.length).toFixed(2)}`);
  for (const c of CORE) assert.ok(c.events.some(e => e.tags.includes('dark')), `${c.code} 어두운 사건 없음`);
  const ids = events.map(x => x.e.id);
  assert.equal(new Set(ids).size, ids.length, 'id 중복');
});

test('jobs-core 사건 스키마 (ARCHITECTURE §8, GDD §9.1)', () => {
  for (const { code, e } of events) {
    assert.match(e.id, new RegExp(`^job\\.${code}\\.[a-z0-9_]+$`), e.id);
    assert.ok(JSON.stringify(e.tags) === '["job"]' || JSON.stringify(e.tags) === '["job","dark"]', e.id);
    assert.ok(Array.isArray(e.ages) && e.ages.length === 2 && e.ages[0] >= 15 && e.ages[0] < e.ages[1] && e.ages[1] <= 100, `${e.id} ages`);
    if (e.years) assert.ok(e.years.length === 2 && e.years[0] < e.years[1], `${e.id} years`);
    assert.equal(typeof e.when, 'function', e.id);
    assert.ok(typeof e.p === 'number' && e.p > 0 && e.p <= 0.3, `${e.id} p`);
    assert.ok(e.once === true || (Number.isInteger(e.cooldown) && e.cooldown >= 3), `${e.id} once|cooldown>=3`);
    assert.ok(typeof e.text === 'string' && len(e.text) > 0 && len(e.text) <= 72, `${e.id} text ${len(e.text)}자`);
    assert.ok(typeof e.reason === 'string' || e.choice, `${e.id} reason`);
    assert.equal(e.sensitive, undefined, `${e.id} 민감 사건 아님`);
    const checkFx = (fx, where) => {
      if (!fx) return;
      for (const [k, v] of Object.entries(fx.stats ?? {})) { assert.ok(STAT_KEYS.includes(k), `${where} stat ${k}`); assert.ok(Math.abs(v) <= 8, `${where} stat ${k}=${v}`); }
      for (const [k, v] of Object.entries(fx.issues ?? {})) { assert.ok(ISSUE_KEYS.includes(k), `${where} issue ${k}`); assert.ok(Math.abs(v) <= 12, `${where} issue ${k}=${v}`); }
      for (const k of Object.keys(fx.money ?? {})) assert.ok(['debt', 'assets'].includes(k), `${where} money ${k}`);
      for (const k of Object.keys(fx)) assert.ok(['stats', 'issues', 'money', 'set'].includes(k), `${where} fx.${k}`);
    };
    checkFx(e.fx, e.id);
    assert.ok(e.fx || e.choice, `${e.id}: 효과 없는 사건`);
    if (e.choice) {
      const ch = e.choice;
      assert.ok(typeof ch.prompt === 'string' && len(ch.prompt) <= 40, `${e.id} prompt`);
      assert.ok(ch.options.length >= 2 && ch.options.length <= 3, `${e.id} 선택지 수`);
      const oids = ch.options.map(o => o.id);
      assert.equal(new Set(oids).size, oids.length, `${e.id} option id 중복`);
      assert.ok(oids.includes(ch.default), `${e.id} default`);
      for (const o of ch.options) {
        assert.ok(typeof o.label === 'string' && len(o.label) <= 14 && len(o.label) > 0, `${e.id}/${o.id} label ${len(o.label)}자`);
        assert.ok(typeof o.result === 'string' && len(o.result) > 0 && len(o.result) <= 72, `${e.id}/${o.id} result`);
        assert.ok(o.fx && (o.fx.stats || o.fx.issues || o.fx.money), `${e.id}/${o.id} fx`);
        checkFx(o.fx, `${e.id}/${o.id}`);
      }
      // 정답/오답 금지: 선택지마다 얻는 것과 잃는 것이 함께 있거나 순 효과가 크게 벌어지지 않는다
      const net = o => Object.values(o.fx.stats ?? {}).reduce((a, b) => a + b, 0) - 0.5 * Object.values(o.fx.issues ?? {}).reduce((a, b) => a + b, 0);
      const nets = ch.options.map(net);
      assert.ok(Math.max(...nets) - Math.min(...nets) <= 10, `${e.id}: 선택지 순효과 차이 ${nets.join('/')}`);
      assert.ok(ch.options.some(o => Object.values(o.fx.stats ?? {}).some(v => v < 0)) , `${e.id}: 잃는 것 없음`);
    }
    const text = JSON.stringify([e.text, e.reason, e.choice]);
    for (const w of BANNED) assert.ok(!text.includes(w), `${e.id}: 실존 기업명 금지 '${w}'`);
  }
});

test('jobs-core 사건 when: 해당 직업 종사 중에만', () => {
  for (const { code, e } of events) {
    const L = status => ({ job: { code, status }, mil: { status: 'none' } });
    const other = { job: { code: '99999', status: 'employed' }, mil: { status: 'none' } };
    assert.equal(e.when(other), false, `${e.id} 다른 직업에서 발생`);
    assert.equal(e.when({ job: { code, status: 'seeking' }, mil: { status: 'none' } }), false, `${e.id} 구직 중 발생`);
    assert.equal(e.when({ job: { code, status: 'retired' }, mil: { status: 'none' } }), false, `${e.id} 은퇴 후 발생`);
    assert.ok(e.when(L('employed')) || e.when(L('self')), `${e.id} 종사 중에도 발생 안 함`);
  }
});

test('jobs-core 사건 연령이 직업 존재 시기·진입 연령과 모순되지 않음', () => {
  for (const { code, e } of events) {
    const job = byCode.get(code);
    if (e.years) assert.ok(e.years[0] >= job.since - 1 || e.years[0] >= 1960, `${e.id} years`);
    if (job.until !== null && e.years) assert.ok(e.years[0] <= job.until, e.id);
  }
});
