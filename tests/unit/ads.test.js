import test from 'node:test';
import assert from 'node:assert/strict';
import { adMode, loadAdScript, pushAd } from '../../src/ui/ads.js';

const cfg = { enabled: true, client: 'ca-pub-1', slot: '123', productionHosts: ['bornkr.click'] };
const store = v => ({ getItem: () => v });

test('adMode: 호스트·슬롯·플래그·스위치', () => {
  const loc = (hostname, search = '') => ({ hostname, search });
  assert.equal(adMode(cfg, loc('bornkr.click'), store(null)), 'live');
  assert.equal(adMode(cfg, loc('localhost'), store(null)), 'placeholder');
  assert.equal(adMode({ ...cfg, slot: '' }, loc('bornkr.click'), store(null)), 'placeholder');
  assert.equal(adMode({ ...cfg, enabled: false }, loc('bornkr.click'), store(null)), 'placeholder');
  assert.equal(adMode(cfg, loc('bornkr.click', '?ads=off'), store(null)), 'off');
  assert.equal(adMode(cfg, loc('bornkr.click'), store('off')), 'off');
});

test('loadAdScript: 같은 document에는 <script> 1회만, 실패해도 던지지 않음', async () => {
  const added = [];
  const doc = { querySelector: () => null, head: { appendChild: s => added.push(s) }, createElement: () => ({}) };
  const a = loadAdScript(doc, cfg), b = loadAdScript(doc, cfg);
  assert.equal(a, b); assert.equal(added.length, 1);
  assert.match(added[0].src, /adsbygoogle\.js\?client=ca-pub-1$/);
  assert.equal(added[0].async, true); assert.equal(added[0].crossOrigin, 'anonymous');
  added[0].onerror();
  await assert.rejects(a);
  const doc2 = { querySelector: () => ({}), head: { appendChild: () => assert.fail() }, createElement: () => ({}) };
  await loadAdScript(doc2, cfg);   // 기존 태그 재사용
});

test('pushAd: 같은 <ins>에 중복 push 없음', () => {
  const attrs = {}, ins = { getAttribute: k => attrs[k], setAttribute: (k, v) => { attrs[k] = v; } }, win = {};
  assert.equal(pushAd(ins, win), true);
  assert.equal(pushAd(ins, win), false);
  assert.equal(win.adsbygoogle.length, 1);
  assert.equal(pushAd({ getAttribute: k => k === 'data-adsbygoogle-status' ? 'done' : null, setAttribute() {} }, win), false);
});
