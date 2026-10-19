// 정년·고령 재취업·칩 실제 반영값(B-01·M2·M4·m6)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../../src/engine/index.js';
import { makeCtx, apply } from '../../src/engine/life.js';
import * as career from '../../src/engine/systems/career.js';
import { eventImpact } from '../../src/ui/major.js';

function worker(age, year, job) {
  const L = E.newLife({ seed: 7, forced: { year: year - age } });
  L.age = age; L.year = year; L.edu.stage = 'done'; L.edu.level = 'high'; L.mil.status = 'done';
  Object.assign(L.job, { status: 'employed', regular: true, firmSize: 'public', wage: 4000, years: 3, history: [{ code: job.code, title: job.title, from: year - 3, to: null }] }, job);
  return L;
}

test('재취업한 공무원도 정년(2016년 이후 60세)을 넘겨 일하지 않는다', () => {
  const L = worker(61, 2030, { code: '31111', title: '행정직 공무원', public: true, major: '3', band: 3 });
  L.flags.mainExited = 2020;
  career.step(L, makeCtx(L));
  assert.equal(L.job.status, 'retired');
});

test('치매 진단을 받으면 일을 그만둔다', () => {
  const L = worker(70, 2030, { code: '94111', title: '건물 경비원', public: false, major: '9', band: 1, firmSize: 'small' });
  L.health.conditions.push({ key: 'dementia', active: true, since: 2029 });
  career.step(L, makeCtx(L));
  assert.notEqual(L.job.status, 'employed');
});

test('60세 이상 배정: 공공·면허 미보유 면허직·학력 초과 직업 없음', () => {
  const L = worker(66, 2030, { code: '94111', title: '건물 경비원', public: false, major: '9', band: 1 });
  L.flags.licenses = [];
  const ctx = makeCtx(L);
  for (let i = 0; i < 300; i++) {
    const r = career.assignJob(L, ctx, { older: true });
    assert.ok(!r.public, r.name);
    assert.ok(r.edu !== 'license', r.name);
    assert.ok(!['2yr', '4yr', 'grad'].includes(r.edu), r.name);
  }
});

test('75세 이상은 새로 채용되지 않는다', () => {
  const L = worker(76, 2040, {});
  L.job.status = 'seeking'; L.job.searchYears = 0; L.job.history = [];
  const ctx = makeCtx(L); ctx.chance = () => true;
  career.step(L, ctx);
  assert.equal(L.job.status, 'retired');
});

test('사건 칩은 클램프·포화 뒤 실제 반영값을 쓴다', () => {
  const L = E.newLife({ seed: 1 });
  L.stats.happiness = 1;
  const entry = { kind: 'event', id: 'x', effects: { stats: { happiness: -5, health: 20 } } };
  const before = L.stats.health;
  apply(L, entry.effects, { reason: 'x', entry });
  const shown = Object.fromEntries(eventImpact(entry).stats);
  assert.equal(shown.happiness ?? 0, L.stats.happiness - 1);
  assert.equal(shown.health, L.stats.health - before);
});
