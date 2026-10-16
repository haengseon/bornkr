import test from 'node:test';
import assert from 'node:assert/strict';
import { lifeRiskOf, LIFE_RISK_MODEL } from '../../src/engine/life-risk.js';

// 실제 사건 원장과 현재 유효한 이행 기록을 갖춘 복합 위기 상태.
function life() {
  const year = 2025;
  return { year, age: 35, modelVersion: 2, alive: true, stats: { happiness: 60 },
    health: { conditions: [] }, family: { parents: {}, partner: null },
    identityStrain: { stress: 14, confusion: 8 },
    dailyLife: { facts: ['sleep.shortfall', 'routine.failure'].map(key => ({ id: `${key}:${year}`, key, year, validUntil: year, status: 'confirmed' })) },
    lifeCrisis: { history: [{ id: 'isolation.2024', domain: 'social-isolation', year: year - 1, status: 'confirmed' }],
      social: { isolatedSince: year - 2, desiredContact: true, missedReplies: 2, contact: { accessible: false } },
      support: [], losses: [{ id: 'job.loss.2024', year: year - 1, kind: 'employment' }],
      riskAnnual: { year: year - 1, active: true, consecutive: 2 } } };
}
const inactive = risk => {
  assert.equal(risk.active, false); assert.equal(risk.illness, 1);
  assert.equal(risk.mortality, 1); assert.equal(risk.selfharmCause, 1);
};

test('현재 복합 근거와 지속 조건이 함께 있을 때만 게임 위험 문맥을 제공하며 상태를 바꾸지 않는다', () => {
  const L = life(), before = structuredClone(L), risk = lifeRiskOf(L);
  assert.equal(risk.active, true); assert.equal(risk.kind, 'game-assumption');
  assert.equal(risk.illness, LIFE_RISK_MODEL.illness); assert.equal(risk.mortality, 1); assert.equal(risk.selfharmCause, 1);
  assert.ok(risk.sourceIds.includes('job.loss.2024')); assert.deepEqual(L, before);
  risk.sourceIds.push('external-change'); assert.equal(L.lifeCrisis.losses.length, 1);
});

test('우울 진단이 실제 활성 상태일 때만 기존 사망/사인 위험 보정 경로를 연다', () => {
  const L = life();
  L.health.conditions = [{ key: 'depression', active: false }, { key: 'hypertension', active: true }];
  assert.equal(lifeRiskOf(L).mortality, 1); assert.equal(lifeRiskOf(L).selfharmCause, 1);
  L.health.conditions[0].active = true;
  const risk = lifeRiskOf(L);
  assert.equal(risk.illness, 1); assert.equal(risk.mortality, LIFE_RISK_MODEL.mortality);
  assert.equal(risk.selfharmCause, LIFE_RISK_MODEL.selfharmCause);
  assert.equal(L.alive, true); assert.equal(L.health.conditions.length, 2);
});

test('낮은 행복에 이미 반영된 질환 발생 요인과 새 배율을 중복하지 않는다', () => {
  const L = life(); L.stats.happiness = 34;
  assert.equal(lifeRiskOf(L).illness, 1); assert.equal(lifeRiskOf(L).mortality, 1);
  L.stats.happiness = 35; assert.equal(lifeRiskOf(L).illness, LIFE_RISK_MODEL.illness);
  L.health.conditions.push({ key: 'depression', active: true }); assert.equal(lifeRiskOf(L).illness, 1);
});

test('복합 조건 중 하나라도 없거나 현재 근거가 만료되면 보정하지 않는다', () => {
  const edits = [
    L => { L.identityStrain.stress = 11; },
    L => { L.identityStrain.confusion = 5; },
    L => { L.dailyLife.facts = L.dailyLife.facts.filter(f => f.key !== 'routine.failure'); },
    L => { L.dailyLife.facts.forEach(f => { f.validUntil = L.year - 1; }); },
    L => { L.lifeCrisis.social.desiredContact = false; },
    L => { L.lifeCrisis.social.isolatedSince = L.year; },
    L => { L.lifeCrisis.social.contact.accessible = true; },
    L => { L.lifeCrisis.losses = []; },
    L => { L.lifeCrisis.losses[0].year = L.year - 5; },
    L => { L.lifeCrisis.riskAnnual.consecutive = 1; },
    L => { L.lifeCrisis.riskAnnual.year = L.year - 2; },
    L => { L.family.parents.mother = { alive: true, bond: 70 }; },
  ];
  for (const edit of edits) { const L = life(); edit(L); inactive(lifeRiskOf(L)); }
});

test('도움 요청만으로 위험이 해소되지는 않지만 최근 실제 수령 후에는 보정을 멈춘다', () => {
  const L = life(); L.lifeCrisis.support.push({ id: 'support.actual', year: L.year - 1, status: 'requested' });
  assert.equal(lifeRiskOf(L).active, true);
  Object.assign(L.lifeCrisis.support[0], { status: 'received', receivedYear: L.year }); inactive(lifeRiskOf(L));
  L.lifeCrisis.support[0].receivedYear = L.year - 1; inactive(lifeRiskOf(L));
  L.lifeCrisis.support[0].receivedYear = L.year - 2; assert.equal(lifeRiskOf(L).active, true);
});

test('구버전·미성년·사망·빈 상태는 기존 위험을 유지하고 상태를 새로 생성하지 않는다', () => {
  for (const patch of [{ modelVersion: 1 }, { modelVersion: undefined }, { age: 18 }, { alive: false }, { lifeCrisis: undefined }, { lifeCrisis: {} }]) {
    const L = Object.assign(life(), patch), before = structuredClone(L);
    inactive(lifeRiskOf(L)); assert.deepEqual(L, before);
  }
});
