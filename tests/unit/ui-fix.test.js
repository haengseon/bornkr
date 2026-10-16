// QA-E 프론트 수정: 출처 배지 매핑(E-24) · 도움 시트 정렬(E-18) · 화면 이력(E-11) · 기록 capped 표시(E-02)
import test from 'node:test';
import assert from 'node:assert/strict';
import { kindBadge } from '../../src/ui/labels.js';
import { nav, pushScreen, PARENT } from '../../src/ui/dom.js';
import { SOURCES } from '../../src/data/sources.js';

test('kindBadge: 출처 kind(official·secondary·game)와 표 kind(measured·projected·estimated)를 모두 구분', () => {
  const lab = k => kindBadge(k).label;
  assert.equal(lab('official'), '공식 통계');
  assert.equal(lab('secondary'), '2차 자료');
  assert.equal(lab('game'), '게임 추정');
  assert.equal(lab('estimated'), '게임 추정');
  assert.equal(lab('measured'), '통계');
  assert.equal(lab('projected'), '전망');
  assert.equal(lab('???'), '게임 추정');                                   // 모르는 값은 가장 보수적으로
  assert.equal(kindBadge('official').group, 'measured');                 // 도감 필터: 공식·2차 = 실측 출처
  assert.equal(kindBadge('secondary').group, 'measured');
  assert.equal(kindBadge('game').group, 'estimated');
  // 레지스트리 전체: 공식 통계·2차 자료가 "게임 추정"으로 나오지 않는다
  for (const s of Object.values(SOURCES)) if (s.kind !== 'game') assert.notEqual(kindBadge(s.kind).label, '게임 추정');
});

test('pushScreen: 하위 화면만 깊이를 쌓고, 홈 칸은 앱 안 이전 화면으로 표시', () => {
  const log = [];
  globalThis.history = {
    state: null,
    replaceState(s) { this.state = s; log.push(['replace', s]); },
    pushState(s) { this.state = s; log.push(['push', s]); },
  };
  try {
    nav.lv = '';
    pushScreen('archive');
    assert.deepEqual(log, [['replace', { hj: 'home', d: 0 }], ['push', { hj: 'archive', d: 1 }]]);
    pushScreen('detail');
    assert.deepEqual(globalThis.history.state, { hj: 'detail', d: 2 });
    assert.equal(nav.lv, 'detail');
    assert.equal(PARENT.detail, 'archive');
    assert.equal(PARENT.archive, 'home');
  } finally { delete globalThis.history; nav.lv = ''; }
});

test('pushScreen: 이력 API가 막힌 환경(throw)에서도 예외 없이 lv만 갱신', () => {
  globalThis.history = { state: null, replaceState() { throw new Error('sandbox'); }, pushState() { throw new Error('sandbox'); } };
  try { nav.lv = ''; assert.doesNotThrow(() => pushScreen('settings')); assert.equal(nav.lv, 'settings'); }
  finally { delete globalThis.history; nav.lv = ''; }
});
