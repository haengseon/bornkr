import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ADS, canRequestAds, mountContentAd } from '../../src/site/ads.js';

const approved = { ...ADS, enabled: true };
test('검토 대기 설정에서는 콘텐츠 페이지도 광고 요청을 하지 않는다', () => {
  for (const path of ['/', '/guide.html', '/how-it-works.html', '/privacy.html']) {
    assert.equal(canRequestAds(new URL(`https://bornkr.click${path}`)), false);
  }
});
test('광고를 활성화해도 게임·개인 기록·안내·기타 경로는 허용하지 않는다', () => {
  for (const path of ['/', '/index.html', '/?screen=summary', '/#summary', '/privacy.html', '/about.html', '/contact.html', '/settings', '/archive', '/missing.html']) {
    assert.equal(canRequestAds(new URL(`https://bornkr.click${path}`), approved), false, path);
  }
  assert.ok(canRequestAds(new URL('https://bornkr.click/guide.html'), approved));
  assert.ok(canRequestAds(new URL('https://www.bornkr.click/how-it-works.html'), approved));
});
test('로컬·미리보기·다른 도메인·비 HTTPS에서는 광고하지 않는다', () => {
  for (const url of ['http://bornkr.click/guide.html', 'https://preview.example/guide.html', 'http://localhost:5173/guide.html', 'file:///guide.html']) {
    assert.equal(canRequestAds(new URL(url), approved), false, url);
  }
  assert.equal(canRequestAds(new URL('https://bornkr.click/guide.html'), { ...approved, slot: '' }), false);
});
test('광고 비활성 상태에서는 광고 DOM과 SDK에도 접근하지 않는다', () => {
  const doc = new Proxy({}, { get() { throw new Error('광고 DOM 접근'); } });
  assert.doesNotThrow(() => mountContentAd(doc, { location: { href: 'https://bornkr.click/guide.html' } }));
});
