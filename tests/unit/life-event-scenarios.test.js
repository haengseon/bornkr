import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { LIFE_EVENTS } from '../../src/content/life-events.js';
import { prepareLifeEventScenarios, scenarioChoiceAvailable, performScenarioChoice,
  scenarioOutcomeHandler } from '../../src/engine/life-event-scenarios.js';
import { eligibleLifeEvents, lifeEventOptions } from '../../src/engine/daily-eligibility.js';
import { eventActions } from '../../src/engine/life-event-actions.js';
import { newLife, advanceYear, choose } from '../../src/engine/index.js';
import { STAGE_CAP } from '../../src/engine/tuning.js';

const life = () => ({ seed: 4, modelVersion: 2, alive: true, age: 30, year: 2010,
  name: '테스트', job: { status: 'employed', code: 'test', years: 5 },
  edu: { stage: 'done' }, home: { tenure: 'monthly', parents: false, region: 'seoul', moves: [] },
  family: { partner: { no: 1, alive: true, income: 100 }, parents: {}, children: [] },
  health: { conditions: [] }, money: { assets: 100, oop: 0 },
  choices: [], log: [], decisions: [], dailyLife: { facts: [], people: [], routines: [], history: [],
    summary: { year: 2010, time: { personal: 180 } }, ledger: {}, scenarios: {} } });
function scene(L, id) {
  const event = LIFE_EVENTS.find(e => e.id === id);
  L.dailyLife.scenarios[id] = { id: `scenario.${id}.${L.year}`, year: L.year, status: 'open',
    context: { scope: 'job', jobCode: L.job.code, jobStatus: L.job.status } };
  const sourceEventId = `source.${id}`;
  L.dailyLife.history.push({ id: sourceEventId, year: L.year, status: 'confirmed' });
  for (const key of event.requires) L.dailyLife.facts.push({ id: `${sourceEventId}:${key}`, key,
    year: L.year, validUntil: L.year, sourceEventId, details: {}, status: 'confirmed' });
  return event;
}

test('100개 사건과 300개 선택의 원본 성향 가중치를 배포 콘텐츠가 보존한다', () => {
  const source = JSON.parse(fs.readFileSync(new URL('../../docs/design/LIFE-EVENTS-100.json', import.meta.url), 'utf8'));
  assert.equal(LIFE_EVENTS.length, 100);
  assert.equal(new Set(LIFE_EVENTS.map(e => e.id)).size, 100);
  for (const event of source.events) {
    const compiled = LIFE_EVENTS.find(e => e.id === event.id);
    assert.deepEqual(compiled.years, event.yearRange);
    assert.deepEqual(compiled.ages, event.ageRange);
    for (const choice of event.choices) {
      assert.deepEqual(compiled.choices.find(c => c.id === choice.id).personality, choice.personality);
    }
  }
});

test('확인된 장면이 없거나 보류된 사건은 선택 가능 후보가 아니다', () => {
  const L = life();
  assert.deepEqual(eligibleLifeEvents(L), []);
  assert.deepEqual(lifeEventOptions(L, LIFE_EVENTS.find(e => !e.ready)), []);
});

test('시나리오 준비는 새 게임에서만, 같은 연도에는 최대 한 번 생성한다', () => {
  const old = life(); old.modelVersion = 1;
  assert.equal(prepareLifeEventScenarios(old), null);
  let found;
  for (let seed = 1; seed < 50 && !found; seed++) {
    const L = life(); L.seed = seed;
    if (prepareLifeEventScenarios(L)) found = L;
  }
  assert.ok(found);
  const before = JSON.stringify(found.dailyLife);
  prepareLifeEventScenarios(found);
  assert.equal(JSON.stringify(found.dailyLife), before);
  assert.equal(Object.keys(found.dailyLife.scenarios).length, 1);
});

test('수강은 자기 현금과 장면 시간을 한 번만 쓰고 자격·직업을 바꾸지 않는다', () => {
  const L = life(), event = scene(L, 'LIFE-009'), choice = event.choices[0];
  const job = { ...L.job };
  const result = eventActions(L, event, choice);
  assert.equal(result.executed, true);
  assert.equal(L.money.assets, 88);
  assert.equal(L.dailyLife.summary.time.personal, 140);
  assert.deepEqual(L.job, job);
  assert.equal(eventActions(L, event, choice).executed, false);
  assert.equal(L.money.assets, 88);
});

test('불가능한 비용·현재와 다른 일자리·부족한 시간은 선택을 차단한다', () => {
  const L = life(), event = scene(L, 'LIFE-009');
  L.money.assets = 0;
  assert.equal(scenarioChoiceAvailable(L, event, event.choices[0]), false);
  L.money.assets = 100; L.job.code = 'changed';
  assert.equal(scenarioChoiceAvailable(L, event, event.choices[0]), false);
  L.job.code = 'test'; L.dailyLife.summary.time.personal = 1;
  assert.equal(scenarioChoiceAvailable(L, event, event.choices[0]), false);
});

test('요청에는 비용 선차감이 없고 직장이 달라지면 다음 해 후속을 취소한다', () => {
  const L = life(), event = scene(L, 'LIFE-009');
  const result = performScenarioChoice(L, event, event.choices[1]);
  assert.equal(result.requested, true);
  assert.equal(L.money.assets, 100);
  const item = { id: 'follow-up', scenarioRecord: result.scenarioRecord };
  L.year++;
  assert.equal(scenarioOutcomeHandler.eligible(L, item), true);
  L.job.code = 'different';
  assert.equal(scenarioOutcomeHandler.eligible(L, item), false);
});

test('시대·나이와 실제 개인 상태가 맞지 않으면 신규 장면도 나오지 않는다', () => {
  const L = life(); L.age = 1; L.year = 1959;
  assert.equal(prepareLifeEventScenarios(L), null);
  assert.equal(L.dailyLife.history.length, 0);
});

test('소유 가전의 현재 수리 견적만 차감하고 작동 상태를 복구한다', () => {
  const L = life();
  L.dailyLife.world = { inventory: [{ id: 'owned-fridge', kind: 'appliance', ownedYear: 2000,
    working: false, repairQuote: 8, replacementQuote: 50 }] };
  const event = scene(L, 'LIFE-033');
  L.dailyLife.scenarios[event.id].context.targetItemId = 'owned-fridge';
  const option = lifeEventOptions(L, event).find(c => c.id === 'a');
  assert.equal(option.operation.cost, 8);
  assert.match(option.hint, /8만 원/);
  assert.equal(eventActions(L, event, option).executed, true);
  assert.equal(L.money.assets, 92);
  assert.equal(L.dailyLife.world.inventory[0].working, true);
});

test('알던 인물에게 빌려준 돈은 현금과 채권으로 한 번만 기록한다', () => {
  const L = life();
  L.dailyLife.people.push({ id: 'known', alive: true, metYear: 2005 });
  L.dailyLife.contacts = [{ personId: 'known', year: 2006, status: 'completed' }];
  const event = scene(L, 'LIFE-053');
  Object.assign(L.dailyLife.scenarios[event.id], { personId: 'known' });
  L.dailyLife.scenarios[event.id].context.personId = 'known';
  const result = eventActions(L, event, event.choices[1]);
  assert.equal(result.executed, true);
  assert.equal(L.money.assets, 95);
  assert.equal(L.dailyLife.personalLoans[0].outstanding, 5);
  assert.equal(eventActions(L, event, event.choices[1]).executed, false);
  assert.equal(L.money.assets, 95);
});

test('새 사건은 전용 구간 한 칸을 쓰고 연간 질문 한 개와 기존 예산을 보존한다', () => {
  for (const seed of [2, 3, 5, 7]) {
    const L = newLife({ seed });
    while (L.alive) {
      if (L.pending) choose(L, L.pending.defaultId, { auto: true }); else advanceYear(L);
    }
    assert.ok(L.choices.some(c => c.eventId.startsWith('LIFE-')), `seed ${seed}의 신규 사건 누락`);
    const byYear = new Map();
    for (const choice of L.choices.filter(c => !c.forced)) byYear.set(choice.year, (byYear.get(choice.year) || 0) + 1);
    assert.ok([...byYear.values()].every(n => n <= 1));
    for (const [stage, counts] of Object.entries(L.stageChoices)) {
      assert.ok((counts.life || 0) <= 1);
      assert.ok(counts.chance <= STAGE_CAP[stage].chance);
      assert.ok(counts.sys <= STAGE_CAP[stage].sys);
    }
  }
});

test('구버전 생애는 전용 생활 사건이나 신규 구간 계수를 추가하지 않는다', () => {
  const L = newLife({ seed: 2, modelVersion: 1 });
  while (L.alive) {
    if (L.pending) choose(L, L.pending.defaultId, { auto: true }); else advanceYear(L);
  }
  assert.equal(L.choices.some(c => c.eventId.startsWith('LIFE-')), false);
  assert.ok(Object.values(L.stageChoices).every(counts => counts.life === undefined));
  assert.equal(L.dailyLife, undefined);
});
