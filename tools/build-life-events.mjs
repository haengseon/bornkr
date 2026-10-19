// 오프라인 작성 도구. 생성된 src 콘텐츠는 docs나 연구 원본을 런타임에 읽지 않는다.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SCENARIO_PROFILES } from '../src/engine/life-event-scenarios.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = JSON.parse(fs.readFileSync(path.join(root, 'docs/design/LIFE-EVENTS-100.json'), 'utf8'));
const target = path.join(root, 'src/content/life-events.js');
const existingText = fs.readFileSync(target, 'utf8').replace(/\r\n/g, '\n');   // autocrlf checkout
const start = existingText.indexOf('[', existingText.indexOf('export const LIFE_EVENTS'));
const end = existingText.indexOf(';\n\nexport default');
const existing = new Map(JSON.parse(existingText.slice(start, end)).map(e => [e.id, e]));
const domains = {
  education: ['edu.stage', 'confirmed-course-or-school-scenario'],
  employment: ['job.status', 'current-workplace-or-contract'],
  housing: ['home.tenure', 'current-place-or-contract'],
  finance: ['money.assets', 'owned-asset-or-verified-contract'],
  family: ['family', 'living-existing-relative'],
  relationships: ['dailyLife.people', 'actual-contact-and-shared-history'],
  health: ['health', 'actual-condition-or-user-reported-need'],
  leisure: ['dailyLife.activities', 'current-access-and-time'],
  digital: ['dailyLife.activities', 'actual-account-or-current-service-access'],
  community: ['home', 'current-local-notice-and-access'],
};
const detailIds = new Set(['LIFE-007', 'LIFE-009', 'LIFE-038', 'LIFE-042', 'LIFE-044', 'LIFE-052', 'LIFE-067', 'LIFE-072', 'LIFE-077', 'LIFE-080']);
const events = source.events.map(e => {
  const old = detailIds.has(e.id) ? existing.get(e.id) : null;
  const profile = SCENARIO_PROFILES[e.id];
  const result = old ? structuredClone(old) : {
    id: e.id, domain: e.domain, years: e.yearRange, ages: e.ageRange,
    title: e.title, text: e.scene, eligibility: e.eligibility,
    requires: [`scenario.${e.id}.ready`], cooldownYears: 4,
    choices: e.choices.map(c => ({ id: c.id, label: c.action, text: c.immediate,
      personality: c.personality, requires: [],
      operation: { id: `scenario.${e.id}.${c.id}`, actionId: `scenario.${e.id}.${c.id}`, status: 'specification-only' },
      effect: { description: c.immediate, applyAutomatically: false },
      followUp: { description: e.followUp, afterYears: 1, requiresReconfirmation: true,
        cancelIf: ['source-context-ended', 'participant-unavailable'], automaticSuccess: false } })),
    guard: e.guard, followUp: e.followUp,
    cancelWhen: ['source-context-ended', 'participant-unavailable', 'required-fact-expired'],
    source: { file: 'docs/design/LIFE-EVENTS-100.json', evidenceLevel: e.evidenceLevel },
  };
  // 결과문(선택 뒤 한 문장)은 원본 JSON이 우선이고, 원본에 없으면 기존 콘텐츠의 문장을 보존한다.
  result.choices.forEach((c, i) => {
    const line = e.choices[i].result ?? existing.get(e.id)?.choices[i]?.result;
    if (line) c.result = line;
  });
  result.stateDependencies = domains[e.domain];
  result.probabilityKind = 'game-tuning-not-statistics';
  if (profile) {
    result.ready = true;
    result.scenarioProfile = true;
    result.implementationStatus = 'implemented-conditional-scenario';
    result.requires = [`scenario.${e.id}.ready`];
    result.choices.forEach((c, i) => {
      c.requires = [];
      c.operation = { id: `scenario.${e.id}.${c.id}`, actionId: `scenario.${e.id}.${c.id}`,
        status: 'implemented', ...profile.steps[i] };
      c.hint = e.choices[i].immediate;   // 시간·비용 숫자는 칩으로만 보인다(설명충 R3)
      c.effect = { description: e.choices[i].immediate, applyAutomatically: false };
    });
  } else if (['LIFE-067', 'LIFE-072', 'LIFE-077', 'LIFE-080'].includes(e.id)) {
    result.implementationStatus = 'implemented-confirmed-facts';
    result.ready = true;
  } else {
    result.ready = false;
    result.implementationStatus = 'deferred-state-or-policy-verification';
    result.deferredReason = `원본 조건(${e.eligibility})을 만족하는 실제 상태·제도·당사자 입력과 실행 처리가 아직 연결되지 않음. 과거 인물·소유물·진단·공식 통지를 소급 생성하지 않음.`;
  }
  return result;
});
if (events.length !== 100 || new Set(events.map(e => e.id)).size !== 100) throw new Error('사건 수 또는 ID 중복');
if (events.some(e => e.choices.length !== 3)) throw new Error('선택 수 불일치');
const text = '// LIFE-EVENTS-100 원본을 tools/build-life-events.mjs로 정적 컴파일. 개인 발생률은 사용하지 않는다.\n' +
  'export const LIFE_EVENTS = ' + JSON.stringify(events, null, 2) + ';\n\nexport default LIFE_EVENTS;\n';
if (process.argv.includes('--check')) {
  if (text !== existingText) { process.exitCode = 1; console.error('생성 콘텐츠가 원본과 다름'); }
} else fs.writeFileSync(target, text);
console.log(`${events.length}개 사건, ${events.filter(e => e.ready).length}개 조건부 처리, ${events.filter(e => !e.ready).length}개 명시 보류`);
