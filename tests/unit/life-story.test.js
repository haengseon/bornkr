import test from 'node:test';
import assert from 'node:assert/strict';
import { lifeStoryOf, lifeStoryRecords } from '../../src/engine/life-story.js';
import { historyRows } from '../../src/ui/history.js';

const life = () => ({ modelVersion: 2, birth: { year: 2000 }, year: 2025, age: 25,
  dailyLife: { history: [], ledger: {}, activities: [] }, wellbeing: { history: [], pending: [] } });

test('계획·대기는 내역에만 남고 성취·공유 기록으로 바뀌지 않는다', () => {
  const L = life();
  L.dailyLife.history.push({ id: 'plan', year: 2024, kind: 'plan', text: '운동하기로 정했다.' });
  L.wellbeing.pending.push({ id: 'request:reply', status: 'awaiting-consent' });
  L.wellbeing.history.push({ id: 'request', year: 2024, text: '도움을 요청했다.' });
  const story = lifeStoryOf(L);
  assert.equal(story.records.length, 2);
  assert.deepEqual(story.highlights, []);
  assert.deepEqual(story.paragraphs, []);
  assert.match(historyRows(L, 'daily')[0].text, /계획/);
});

test('실제 완료와 취소는 구분하고 미래·미성년·민감 기록은 제외한다', () => {
  const L = life();
  L.dailyLife.history.push(
    { id: 'done', year: 2024, kind: 'activity', status: 'confirmed', text: '15분을 독서에 썼다.' },
    { id: 'cancel', year: 2025, kind: 'follow-up', status: 'canceled', text: '조건이 바뀌어 취소했다.' },
    { id: 'future', year: 2027, status: 'confirmed', text: '미래 기록' },
    { id: 'child', year: 2001, status: 'confirmed', text: '성인 경험' },
    { id: 'sensitive', year: 2024, status: 'confirmed', sensitive: true, text: '비공개' });
  const story = lifeStoryOf(L);
  assert.equal(story.records.length, 2);
  assert.equal(story.records[0].status, 'canceled');
  assert.match(story.paragraphs[0], /취소/);
  assert.doesNotMatch(story.paragraphs.join(''), /친구|배우자|병|사망/);
});

test('영유아 사망과 이전 모형에는 잘못 남은 성인 기록을 소급하지 않는다', () => {
  const L = life();
  L.dailyLife.history.push({ id: 'adult', year: 2024, status: 'confirmed', text: '직장 생활' });
  L.death = { year: 2000, age: 0 };
  assert.deepEqual(lifeStoryRecords(L), []);
  delete L.death; L.modelVersion = 1;
  assert.deepEqual(lifeStoryRecords(L), []);
});

test('휴식 요청과 실제 휴식 완료를 별도 기록으로 구분한다', () => {
  const L = life();
  L.wellbeing.pending.push({ id: 'rest:completion', status: 'completed' });
  L.wellbeing.history.push({ id: 'rest', year: 2023, text: '휴식을 계획했다.' },
    { id: 'rest:completion', year: 2024, text: '휴식 일정을 이어갔다.' });
  const story = lifeStoryOf(L);
  assert.equal(story.records.find(r => r.id === 'rest').status, 'planned');
  assert.equal(story.highlights[0].id, 'rest:completion');
});

test('일상 장부는 화면 내역에서 제외하고 생활 선택 기록은 유지한다', () => {
  const L = life();
  L.dailyLife.ledger[2024] = { year: 2024, finalized: true, consumption: 100, closingCash: 200 };
  L.dailyLife.ledger[2025] = { year: 2025, finalized: false, consumption: 300 };
  const before = structuredClone(L.dailyLife.ledger);
  assert.deepEqual(historyRows(L, 'daily'), []);
  L.dailyLife.history.push({ id: 'done', year: 2024, kind: 'activity', status: 'confirmed', text: '15분을 독서에 썼다.' });
  assert.equal(historyRows(L, 'daily').length, 1);
  assert.match(historyRows(L, 'daily')[0].text, /독서/);
  assert.doesNotMatch(historyRows(L, 'daily')[0].text, /장부|연말 현금/);
  assert.deepEqual(L.dailyLife.ledger, before);
});

test('실행한 자금 이동은 증감을 보여주고 소득·소비·성취로 합산하지 않는다', () => {
  const L = life();
  L.dailyLife.transactions = [{ id: 'transfer', year: 2025, age: 25, operation: 'deposit', label: '보증금 납부',
    sourceEventId: 'home', choiceId: 'move', currencyBaseYear: 2025, kind: 'executed-transfer',
    delta: { financial: -100, deposit: 100, debt: 0 } }];
  const story = lifeStoryOf(L);
  assert.equal(story.records[0].status, 'transferred');
  assert.match(story.records[0].text, /금융자산 −1,000,000원/);
  assert.match(story.records[0].text, /보증금 \+1,000,000원/);
  assert.match(historyRows(L, 'daily')[0].text, /소득·소비와 구분/);
  assert.deepEqual(story.highlights, []);
  assert.deepEqual(story.paragraphs, []);
});

test('미실행·다른 화폐기준·전부 0인 이동은 실제 내역으로 만들지 않는다', () => {
  const L = life();
  const base = { year: 2025, currencyBaseYear: 2025, kind: 'executed-transfer', delta: { debt: 10 } };
  L.dailyLife.transactions = [{ ...base, id: 'plan', kind: 'planned-transfer' },
    { ...base, id: 'old-currency', currencyBaseYear: 2020 },
    { ...base, id: 'zero', delta: { financial: 0, debt: 0 } }];
  assert.deepEqual(lifeStoryRecords(L), []);
});
