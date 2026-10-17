import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../../src/engine/index.js';
import { recordYear } from '../../src/engine/chronicle.js';
import { growMbti, mbtiNudge } from '../../src/engine/mbti.js';
import { apply } from '../../src/engine/life.js';
import { epilogueOf } from '../../src/engine/epilogue.js';
import { deathStory } from '../../src/engine/deathstory.js';
import { profileOf, familyLines, familyText } from '../../src/ui/profile.js';
import { historyRows } from '../../src/ui/history.js';
import { familySeries, familyChartHtml } from '../../src/ui/family-chart.js';

test('과거 급여·자산·지역·관계 기록은 현재 상태를 바꿔도 유지된다', () => {
  const L = E.newLife({ seed: 5432 });
  L.age = 25; L.year = L.birth.year + 25;
  Object.assign(L.job, { title: '사무직', status: 'employed', wage: 3000 });
  L.money.assets = 1000; recordYear(L);
  const old = structuredClone(L.chronicle[25]);
  L.age++; L.year++; L.job.wage = 5000; L.money.assets = 9000; L.home.region = 'seoul'; L.family.parents.mother.bond = 5;
  recordYear(L);
  assert.deepEqual(L.chronicle[25], old);
  assert.notEqual(L.chronicle[26].asset.net, old.asset.net);
  assert.equal(L.chronicle[25].job.wage, 3000);
  assert.equal(historyRows(L, 'job')[1].year, old.year);
  assert.match(historyRows(L, 'family')[0].text, /절연/);
  assert.deepEqual(JSON.parse(JSON.stringify(L.chronicle)), L.chronicle);
});

test('성장 환경이 성향을 형성하고 성인 이후 선택·사건에도 네 축은 유지된다', () => {
  const A = E.newLife({ seed: 44 }), B = E.newLife({ seed: 44 });
  Object.assign(A.stats, { relations: 95, intellect: 95 }); A.edu.score = 95;
  Object.assign(B.stats, { relations: 5, intellect: 5 }); B.edu.score = 5;
  for (let age = 1; age < 19; age++) { A.age = B.age = age; growMbti(A); growMbti(B); }
  assert.notDeepEqual(A.mbti, B.mbti);
  A.age = 19; const stable = { ...A.mbti };
  for (let age = 19; age < 80; age++) { A.age = age; growMbti(A); mbtiNudge(A, 'sys.edu.high', 'study'); apply(A, { traits: { extra: 5, open: -5, agree: 5, consc: -5 } }); }
  assert.deepEqual(A.mbti, stable);
});

test('생후 1년 미만 회고문은 일·학교·성인기 회고를 붙이지 않는다', () => {
  const L = E.newLife({ seed: 3 });
  L.alive = false; L.death = { age: 0, year: L.birth.year, cause: 'perinatal', causeLabel: '출생 전후기 질환', sensitive: false };
  const ep = epilogueOf(L);
  assert.match(ep.paragraphs.join(' '), /첫 생일/);
  assert.doesNotMatch(ep.paragraphs.join(' '), /밥을 데우|학교|시험|출근|퇴근|노년|은퇴/);
  assert.deepEqual(ep.choices, []);
});

test('회고의 선택 증거는 직접 고른 행동과 실제 결과만 포함한다', () => {
  const L = E.newLife({ seed: 7 }); L.age = 30; L.year = L.birth.year + 30;
  L.log.push({ kind: 'choice', year: L.year, age: 30, label: '공부를 계속한다', text: '시험을 준비했다.', auto: false });
  L.log.push({ kind: 'choice', year: L.year, age: 30, label: '창업한다', text: '가게를 열었다.', auto: true });
  const ep = epilogueOf(L);
  assert.deepEqual(ep.choices.map(x => x.label), ['공부를 계속한다']);
  assert.equal(ep.choices[0].result, '시험을 준비했다.');
});

test('사망 기록은 사고의 장소·동행을 지어내지 않고 관련 진단과 공표 통계를 구분한다', () => {
  const L = E.newLife({ seed: 88 }); L.age = 40; L.year = L.birth.year + 40;
  L.death = { age: 40, year: L.year, cause: 'transport', causeLabel: '운수사고', sensitive: false };
  L.health.conditions.push({ key: 'cancer', active: true, since: L.year - 3 });
  const ds = deathStory(L);
  assert.doesNotMatch(ds.narrative, /곁에는 어머니|어머니와 함께|차량에 치|병원에서|일터에서/);
  assert.doesNotMatch(ds.chain.join(' '), /암 진단/);
  assert.equal(ds.statistic.year, 2024);
  assert.equal(ds.statistic.total, 358569);
  L.death.sensitive = true;
  assert.equal(deathStory(L).statistic, undefined);
  assert.equal(deathStory(L).narrative, undefined);
});

test('별세한 가족도 생전 관계가 결산에 남는다', () => {
  const L = E.newLife({ seed: 50 });
  Object.assign(L.family.parents.mother, { alive: false, deathYear: L.year, bond: 7 });
  const mother = familyLines(L).find(x => x.rel === '어머니');
  assert.match(familyText(mother), /별세.*절연.*7/);
});

test('가족 차트는 개별 가족 시리즈로 기록 공백과 사후 구간을 끊고 현재 관계만 텍스트로 표시한다', () => {
  const L = E.newLife({ seed: 50 }), year = L.year;
  for (let age = 1; age <= 5; age++) {
    L.age = age; L.year = year + age;
    Object.assign(L.family.parents.mother, { away: age === 2, alive: age < 4, deathYear: age >= 4 ? year + 4 : null, bond: 80 - age * 5 });
    recordYear(L);
  }
  const mother = familySeries(L).find(s => s.id === 'mother');
  assert.deepEqual(mother.points.map(p => p.year), [year, year + 1, year + 3]);
  assert.equal(mother.points.at(-1).gap, true);
  const html = familyChartHtml(L);
  assert.match(html, /현재 기준 관계/);
  const legend = html.split('<figcaption>')[1];
  assert.equal((legend.match(/어머니/g) || []).length, 1);
  assert.equal((html.match(/<ul /g) || []).length, 1);
  assert.doesNotMatch(html, /history-list|연도별 기록/);
  assert.match(html, /절연·갈등·서먹함·가까움·돈독함/);
  assert.doesNotMatch(html, /checkbox|data-series-toggle|관계 65|\(65\)/);
  assert.equal((html.match(/<svg /g) || []).length, 1);
});

test('휴학 학적은 현재 직업 패널과 해당 연도 내역에 함께 표시된다', () => {
  const L = E.newLife({ seed: 50 });
  L.age = 21; L.year = L.birth.year + 21;
  Object.assign(L.edu, { stage: 'college', leave: 1 });
  L.job.status = 'student'; recordYear(L);
  assert.match(profileOf(L).work.school, /휴학 중/);
  assert.match(historyRows(L, 'job')[0].text, /휴학 중/);
  L.edu.leave = 0;
  assert.match(historyRows(L, 'job')[0].text, /휴학 중/);
  assert.doesNotMatch(profileOf(L).work.school, /휴학 중/);
});
