// 설명충 회귀 방지(docs/review/2026-10-19/D-verbose.md 규칙 R1·R2·R3·R5·R7). 정규식 기반 콘텐츠 스캔.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { EVENTS, ERA_EVENTS } from '../../src/content/events/index.js';
import { LIFE_EVENTS } from '../../src/content/life-events.js';
import { CRISIS_EVENTS } from '../../src/content/life-crisis.js';
import { SUPPORT_OPTIONS } from '../../src/content/wellbeing.js';
import { SYSTEM_TEXT } from '../../src/content/system-text.js';
import { DEFAULT_TEXT } from '../../src/engine/text.js';
import { VARIANTS } from '../../src/content/variants.js';
import { MILESTONES } from '../../src/content/milestones.js';

// 함수는 건너뛰고 객체·배열 안의 문자열을 모두 모은다.
const strings = (v, out = []) => {
  if (typeof v === 'string') out.push(v);
  else if (Array.isArray(v)) v.forEach(x => strings(x, out));
  else if (v && typeof v === 'object') Object.values(v).forEach(x => strings(x, out));
  return out;
};
// 소스의 문자열 리터럴만(주석 제외).
const literals = file => [...fs.readFileSync(new URL(`../../${file}`, import.meta.url), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
  .matchAll(/'((?:[^'\\\n]|\\.)*)'|`((?:[^`\\]|\\.)*)`/g)].map(m => m[1] ?? m[2]);

const crisis = Object.values(CRISIS_EVENTS);
// 엔진이 만드는 선택지 라벨: `label: …'문자열'…`(삼항 포함)과 mk('id', '라벨', …)의 따옴표 리터럴.
const ENGINE_LABEL_FILES = ['src/engine/plans.js', 'src/engine/systems/invest.js', 'src/engine/daily-activities.js'];
const engineLabels = file => {
  const src = fs.readFileSync(new URL(`../../${file}`, import.meta.url), 'utf8');
  return [...[...src.matchAll(/label:\s*([^\n]*?)(?=,\s*\w+:|\s*\})/g)].flatMap(m => [...m[1].matchAll(/'([^'\n]+)'/g)].map(x => x[1])),
    ...[...src.matchAll(/\bmk\('\w+',\s*'([^'\n]+)'/g)].map(m => m[1])];
};
// 이정표 상황문은 연도별 함수일 수 있어 1960~2100년을 모두 펼친다.
const situations = MILESTONES.flatMap(m => [...new Set(Array.from({ length: 141 }, (_, i) =>
  typeof m.situation === 'function' ? m.situation({ year: 1960 + i }) : m.situation))].map(s => [m.id, s]));

test('R1 엔진 규칙·면책 문장을 화면 문구에 쓰지 않는다', () => {
  const R1 = /처리하지 않|별도로|별도다|뜻하지 않|뜻은 아니|뜻하지는 않|판단하지 않는다|기록은 아니|실제로 [^.]*(썼다|배분)/;
  const files = ['src/content/life-crisis.js', 'src/content/wellbeing.js', 'src/engine/life-crisis.js', 'src/engine/wellbeing.js',
    'src/engine/daily-facts.js', 'src/engine/daily-life.js', 'src/engine/life-event-scenarios.js', 'src/engine/life-event-actions.js', 'src/ui/sheets.js'];
  const bad = files.flatMap(f => literals(f).filter(s => /[가-힣]/.test(s) && R1.test(s)).map(s => `${f}: ${s}`));
  assert.deepEqual(bad, []);
});

test('R2 선택지 라벨은 16자 이하', () => {
  const labels = [
    ...EVENTS.flatMap(e => (e.choice?.options ?? []).map(o => [e.id, o.label])),
    ...LIFE_EVENTS.flatMap(e => e.choices.map(c => [e.id, c.label])),
    ...crisis.flatMap(e => e.options.map(o => [e.id, o.label])),
    ...SUPPORT_OPTIONS.map(o => ['wellbeing', o.label]),
    ...MILESTONES.flatMap(m => m.options.map(o => [m.id, o.label])),
    ...ENGINE_LABEL_FILES.flatMap(f => engineLabels(f).map(l => [f, l])),
  ];
  assert.deepEqual(labels.filter(([, l]) => typeof l === 'string' && l.length > 16), []);
});

test('R3 생활 사건 hint에 금액·시간 숫자를 쓰지 않는다(칩 몫)', () => {
  const bad = LIFE_EVENTS.flatMap(e => e.choices.filter(c => /\d+\s*(만 원|분|%)/.test(c.hint ?? '')).map(c => `${e.id}.${c.id}: ${c.hint}`));
  assert.deepEqual(bad, []);
});

test('R5 사건 reason은 본문 문장을 복사하지 않는다', () => {
  const bad = [...EVENTS, ...ERA_EVENTS].filter(e => typeof e.text === 'string' && typeof e.reason === 'string' &&
    /다\.?$/.test(e.reason) && e.text.startsWith(e.reason.replace(/\.$/, ''))).map(e => `${e.id}: ${e.reason}`);
  assert.deepEqual(bad, []);
});

test('R7 사건문이 곧 뜰 선택을 예고하거나 선택지를 나열하지 않는다', () => {
  const R7 = /정해야 (한다|했다)|골라야 (한다|했다)|모두 가능했다|사이에서 (고민했다|마음이)|이 후보였다/;
  const texts = [
    ...[...EVENTS, ...ERA_EVENTS].filter(e => !/^late\./.test(e.id)).flatMap(e => strings([e.text, e.tiers, e.choice?.prompt]).map(s => [e.id, s])),
    ...LIFE_EVENTS.map(e => [e.id, e.text]),
    ...crisis.map(e => [e.id, e.prompt]),
    ...strings([SYSTEM_TEXT, DEFAULT_TEXT]).map(s => ['text', s]),
    ...strings(VARIANTS).map(s => ['variant', s]),
    ...situations,
  ];
  assert.deepEqual(texts.filter(([, s]) => R7.test(s)).map(x => x.join(': ')), []);
});

test('R12 생활 사건 결과문은 선택마다 한 문장, 숫자·라벨 반복·감정 이름 없음', () => {
  const EMOTION = /마음이|느꼈|서운|막막|불안|외로|안도|든든|아쉬|지쳤|뿌듯|기뻤|슬펐/;
  const bad = LIFE_EVENTS.flatMap(e => e.choices.filter(c => {
    const r = c.result;
    return typeof r !== 'string' || !/^[^.]+다\.$/.test(r) || /\d/.test(r) || r.includes(c.label) || EMOTION.test(r);
  }).map(c => `${e.id}.${c.id}: ${c.result}`));
  assert.deepEqual(bad, []);
});
