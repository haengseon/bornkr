// R11 생애 단계×시대별 고민
import test from 'node:test';
import assert from 'node:assert/strict';
import { newLife, concernsOf, advanceYear, choose } from '../../src/engine/index.js';
import { SOURCES } from '../../src/data/sources.js';
import { CONCERN_STAGES } from '../../src/data/concerns.js';

// 같은 인물을 나이·연도만 바꿔 평가(순수 함수 검증용)
const at = (seed, age, year, patch) => { const L = newLife({ seed }); L.age = age; L.year = year; patch?.(L); return L; };
const item = (r, k) => r.items.find(i => i.key === k);

test('단계별 항목 4~7개·키 유일·값 0~100·reason·src 등록, 전 연령×시대', () => {
  for (const seed of [1, 2, 3, 7, 11]) for (const year of [1965, 1975, 1985, 1995, 2005, 2015, 2025, 2045]) for (let age = 0; age <= 95; age += 1) {
    const r = concernsOf(at(seed, age, year));
    const st = CONCERN_STAGES.find(s => age >= s.from && age <= s.to);
    assert.equal(r.stage, st.id);
    assert.ok(r.items.length >= 4 && r.items.length <= 7, `${st.id} ${year} 항목 ${r.items.length}`);
    assert.equal(new Set(r.items.map(i => i.key)).size, r.items.length);
    for (const i of r.items) {
      assert.ok(Number.isInteger(i.value) && i.value >= 0 && i.value <= 100, `${i.key}=${i.value}`);
      assert.ok(i.reason && i.label && i.desc);
      assert.ok(SOURCES[i.basis.src], i.basis.src);
      assert.ok(['measured', 'estimated'].includes(i.basis.kind));
    }
  }
});

test('결정성·입력 비변경', () => {
  const L = at(5, 8, 2025), s = JSON.stringify(L);
  assert.deepEqual(concernsOf(L), concernsOf(L));
  assert.equal(JSON.stringify(L), s);
});

test('0세 맞벌이 vs 비맞벌이: 부모와 떨어지는 시간 차이', () => {
  const a = concernsOf(at(1, 0, 2020, L => { L.birth.parents.dualIncome = true; L.birth.parents.singleParent = false; L.birth.care = 'daycare'; }));
  const b = concernsOf(at(1, 0, 2020, L => { L.birth.parents.dualIncome = false; L.birth.parents.singleParent = false; L.birth.care = 'parent'; }));
  assert.ok(item(a, 'apart').value > item(b, 'apart').value + 20);
  assert.match(item(a, 'apart').reason, /맞벌이/);
});

test('같은 15세, 1965 vs 1985: 라벨·항목이 다르다', () => {
  const a = concernsOf(at(2, 15, 1965)), b = concernsOf(at(2, 15, 1985));
  assert.notEqual(item(a, 'exam').label, item(b, 'exam').label);
  assert.match(item(a, 'exam').label, /예비고사/);
  assert.match(item(b, 'exam').label, /학력고사/);
  assert.notEqual(item(a, 'job').label, item(b, 'job').label);
});

test('시대착오 없음: 2010 이전 스마트폰·SNS, 2000 이전 사이버, 인터넷 이전 PC방', () => {
  for (const [age, year] of [[3, 1975], [9, 1975], [15, 1975], [9, 1985], [15, 1985], [9, 2005], [15, 2005]]) {
    const r = concernsOf(at(3, age, year)), txt = r.items.map(i => i.key + i.label + i.desc).join('|');
    assert.ok(!/스마트폰|SNS/.test(txt), `${year} ${age}세: ${txt}`);
    if (year < 2000) assert.ok(!/사이버|PC방|온라인|인터넷/.test(txt), `${year}: ${txt}`);
  }
  assert.ok(!concernsOf(at(3, 3, 1975)).items.some(i => i.key === 'facility'));        // 1991 이전 어린이집 항목 없음
  const c = concernsOf(at(3, 9, 2025));
  assert.match(item(c, 'screen').label, /스마트폰/);
});

test('2025년 5세에게 시대 변형 적용', () => {
  const r = concernsOf(at(4, 5, 2025, L => { L.birth.care = 'daycare'; }));
  assert.match(item(r, 'facility').desc, /CCTV/);
  assert.match(item(r, 'apart').desc, /무상보육/);
  const o = concernsOf(at(4, 5, 1975));
  assert.match(item(o, 'apart').label, /바쁜 낮/);
});

test('단계 경계 연속성: 5→6, 12→13, 18→19, 29→30, 39→40, 49→50, 59→60, 74→75', () => {
  for (const year of [1975, 2025]) for (const [a, b] of [[5, 6], [12, 13], [18, 19], [29, 30], [39, 40], [49, 50], [59, 60], [74, 75]]) {
    const x = concernsOf(at(6, a, year)), y = concernsOf(at(6, b, year));
    assert.notEqual(x.stage, y.stage);
    assert.ok(x.items.length >= 4 && y.items.length >= 4);
    if (a !== 74 && year === 2025) assert.ok(x.items.some(i => y.items.some(j => j.key === i.key)), `공통 키 없음 ${a}→${b}`);
    assert.ok(item(x, x.items[0].key).value >= 0);
  }
});

test('reason에 미래 통계·연도 수치 없음', () => {
  for (const year of [1965, 1985, 1998, 2005, 2015]) for (let age = 0; age <= 90; age += 3) {
    const r = concernsOf(at(8, age, year, L => { L.flags.victim = year; L.money.loans.student = 3000; }));
    for (const i of r.items) {
      for (const m of i.reason.matchAll(/(?<!\d)((?:19|20)\d\d)(?![\d만])/g)) assert.ok(+m[1] <= year, `${year}: ${i.reason}`);
    }
  }
});

test('성인 이후 value는 L.issues 재사용, hiddenAdultKeys는 미표시 축', () => {
  const L = at(9, 45, 2020, L => { L.issues.housing = 77; });
  const r = concernsOf(L);
  assert.equal(item(r, 'housing').value, 77);
  for (const k of r.hiddenAdultKeys) assert.ok(!r.items.some(i => i.adultKey === k));
});

test('실제 생애 진행 중 오류·범위 이탈 없음 + 성능', () => {
  const L = newLife({ seed: 21 });
  let t = 0, n = 0;
  while (L.alive && L.age < 80) {
    if (L.pending) choose(L, L.pending.defaultId, { auto: true }); else advanceYear(L);
    const s = performance.now(); const r = concernsOf(L); t += performance.now() - s; n++;
    for (const i of r.items) assert.ok(i.value >= 0 && i.value <= 100);
  }
  assert.ok(t / n < 1, `평균 ${(t / n).toFixed(3)}ms`);
});
