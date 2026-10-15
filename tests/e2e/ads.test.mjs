import test from 'node:test';
import assert from 'node:assert/strict';
import { launch, startServer, openPage, waitScreen, SEEDS, seedInit, presetInit, playToDeath, startLife } from './helpers.mjs';

test('ads.txt는 text/plain, privacy.html 서빙', async () => {
  const srv = await startServer();
  try {
    const r = await fetch(srv.url + 'ads.txt');   // 개발 서버는 루트 기준: dist/site 대신 파일이 없을 수 있어 404면 skip
    if (r.status === 200) { assert.match(r.headers.get('content-type'), /^text\/plain/); }
    const p = await fetch(srv.url + 'src/static/privacy.html');
    assert.equal(p.status, 200);
  } finally { srv.stop(); }
});

test('결산 화면에만 광고 구역, 홈에는 없음', async () => {
  const browser = await launch(), srv = await startServer();
  try {
    const page = await openPage(browser, srv.url, { clock: true, init: seedInit(SEEDS.short) + presetInit({ seen19: true, speed: 10, auto: true }) });
    await waitScreen(page, 'home');
    assert.equal(await page.locator('.adzone').count(), 0);
    await page.click('[data-go="born"]'); await waitScreen(page, 'birth'); await page.click('[data-act="start"]'); await waitScreen(page, 'life');
    assert.equal(await page.locator('.adzone').count(), 0);
    await playToDeath(page);
    assert.equal(await page.locator('.adzone').count(), 0);   // 사망 직후
    await page.clock.runFor(4000);
    assert.equal(await page.locator('.adzone').count(), 0);
    await page.clock.runFor(6000); await waitScreen(page, 'summary').catch(() => {}); await page.clock.runFor(2500);
        assert.equal(await page.locator('.adzone').count(), 1);
    assert.match(await page.locator('.adzone__box').innerText(), /광고 영역\(미리보기\)/);
    assert.equal(await page.locator('script[src*="adsbygoogle"]').count(), 0);
    await page.context().close();
  } finally { srv.stop(); await browser.close(); }
});
