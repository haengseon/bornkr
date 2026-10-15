// UI 순수 헬퍼(DOM 없이): 카드 줄바꿈·연표 고르기·금지어, 조사·고유어 나이·칩, 저장 목록.
import test from 'node:test';
import assert from 'node:assert/strict';
import { wrap, pickTimeline, cardSafe, shareText } from '../../src/ui/cards.js';
import { josa, nativeAge, fxChips, stageState, deathLine, receiptNo, quintileAria, statLevel } from '../../src/ui/labels.js';
import { pushRecord, MAX_RECORDS, loadSettings, DEFAULTS } from '../../src/ui/store.js';
import { STAGES } from '../../src/engine/constants.js';

const m = s => Array.from(s).length * 10;   // 글자당 10px

test('wrap: 어절 단위·긴 어절 글자 단위·문장부호·말줄임', () => {
  assert.deepEqual(wrap('가나 다라 마바', 50, 3, m), ['가나 다라', '마바']);
  assert.deepEqual(wrap('가나다라마바사', 30, 5, m), ['가나다', '라마바', '사']);
  assert.deepEqual(wrap('가나다 .라', 30, 3, m), ['가나다.', '라']);         // 줄 첫 글자 '.'는 앞 줄로
  const out = wrap('하나 둘 셋 넷 다섯 여섯', 30, 2, m);
  assert.equal(out.length, 2);
  assert.ok(out[1].endsWith('…') && m(out[1]) <= 30);
  assert.deepEqual(wrap('', 30, 2, m), []);
});

test('pickTimeline: 민감·금액 제외, 처음·끝 고정, 개수 상한', () => {
  const tl = Array.from({ length: 16 }, (_, i) => ({ age: i * 5, year: 2000 + i * 5, text: `줄 ${i}` }));
  tl[3].sensitive = 'violence';
  tl[4].text = '집을 샀다. 대출 4,800만 원.';
  const p = pickTimeline(tl, 8);
  assert.equal(p.length, 8);
  assert.equal(p[0].age, 0);
  assert.equal(p.at(-1).age, 75);
  assert.ok(p.every(t => !t.sensitive && cardSafe(t.text)));
  assert.deepEqual(pickTimeline(tl.slice(0, 2), 8).length, 2);
});

test('cardSafe: 금액·백분위·순위 차단', () => {
  for (const t of ['대출 48711만 원', '3억 원', '48번째 백분위', '상위 10%', '순위']) assert.equal(cardSafe(t), false, t);
  for (const t of ['이사 7회(최근 8년 4회)', '소득 대비 주거비 31%', '74세, 2061년']) assert.equal(cardSafe(t), true, t);
});

test('shareText: 사인·금액 없이 서명으로 끝남', () => {
  const L = { name: '김민지', birth: { year: 1987, month: 3, day: 12 }, death: { age: 74, year: 2061, causeLabel: '폐렴' } };
  const sum = { death: L.death, verdict: { main: '주문', lines: ['연소득 810만 원', '둘째'] }, timeline: [{ age: 0, year: 1987, text: '태어났다.' }, { age: 74, year: 2061, text: '74세, 2061년' }] };
  const cert = { regionLabel: '경상남도 · 도시', homeLine: '전세.' };
  for (const k of ['birth', 'verdict', 'timeline']) {
    const s = shareText(k, { L, sum, cert });
    assert.ok(s.endsWith('— 태어나보니 대한민국'), k);
    assert.ok(!s.includes('폐렴') && cardSafe(s), k);
  }
  assert.equal(shareText('birth', { L, sum, cert }), '1987년 경상남도에서 태어났다. 전세. 어떤 삶이 될까.\n— 태어나보니 대한민국');
});

test('labels: 조사·고유어 나이·칩·구간·사인 문구', () => {
  assert.equal(josa('폐렴', '으로'), '폐렴으로');
  assert.equal(josa('노쇠', '으로'), '노쇠로');
  assert.equal(josa('싼 곳으로 이사', '으로'), '싼 곳으로 이사로');
  assert.equal(josa('뇌졸중', '으로'), '뇌졸중으로');
  assert.equal(josa('고혈압', '은'), '고혈압은');
  assert.equal(josa('알', '으로'), '알로');                       // ㄹ 받침
  assert.deepEqual([7, 19, 29, 42, 55, 70].map(nativeAge), ['일곱', '열아홉', '스물아홉', '마흔둘', '쉰다섯', '일흔']);
  assert.deepEqual(fxChips({ stats: { wealth: -3 }, issues: { housing: 8 } }), ['재산 ▼3', '주거 ▲8']);
  const st = stageState(STAGES, 35);
  assert.deepEqual(st.map(s => s.state), ['done', 'done', 'done', 'current', 'todo']);
  assert.equal(st[3].p, 0);
  assert.equal(deathLine({ causeLabel: '폐렴' }, false), '폐렴으로 세상을 떠났습니다.');
  assert.equal(deathLine({ causeLabel: '고의적 자해', sensitive: true }, false), '세상을 떠났습니다.');
  assert.equal(deathLine({ causeLabel: '폐렴' }, true), '세상을 떠났습니다.');
  assert.equal(receiptNo({ year: 1987, month: 3, day: 12 }, 1234567), '1987-0312-4567');
  assert.equal(quintileAria(2), '다섯 단계 중 두 번째');
  assert.deepEqual([9, 10, 25, 26].map(statLevel), ['critical', 'critical', 'low', '']);
});

test('store: 기록 최신순·중복 교체·30개 상한, 저장소 없어도 기본 설정', () => {
  let list = [];
  for (let i = 0; i < 35; i++) list = pushRecord(list, { id: 'r' + i, seed: i });
  assert.equal(list.length, MAX_RECORDS);
  assert.equal(list[0].id, 'r34');
  list = pushRecord(list, { id: 'r20', seed: 99 });
  assert.equal(list[0].seed, 99);
  assert.equal(list.filter(r => r.id === 'r20').length, 1);
  assert.deepEqual(loadSettings(), DEFAULTS);
});
