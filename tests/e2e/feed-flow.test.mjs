import test from 'node:test';
import assert from 'node:assert/strict';
import { launch, startServer, openPage } from './helpers.mjs';

test('한 해의 모든 종류의 기록은 하나씩 표시되고 일시정지·배속·취소를 따른다', { timeout: 60000 }, async () => {
  const browser = await launch(), server = await startServer();
  try {
    const page = await openPage(browser, server.url, { clock: true, url: '?motion=off&splash=0' });
    await page.evaluate(async () => {
      const { newLife } = await import('/src/engine/index.js');
      const { S } = await import('/src/ui/dom.js');
      const { startNew, revealEntries } = await import('/src/ui/play.js');
      const L = newLife({ seed: 50 }); L.age = 35; L.year = L.birth.year + 35;
      S.settings.auto = false; S.settings.speed = 1; startNew(L);
      const entries = ['event', 'choice', 'system', 'news', 'death'].map((kind, i) => ({ kind, id: `test.reveal.${i}`, age: L.age, year: L.year, text: `순차기록 ${i+1}`, label: kind === 'choice' ? '순차기록 선택' : undefined }));
      window.feedFinished = false;
      revealEntries(entries, null, S.run).then(() => { window.feedFinished = true; });
    });
    const rows = page.locator('.feed .entry').filter({ hasText: '순차기록' });
    assert.equal(await rows.count(), 1);
    await page.clock.runFor(1200); assert.equal(await rows.count(), 1);
    await page.locator('[data-act="pause"]').click();
    await page.clock.runFor(3000); assert.equal(await rows.count(), 1);
    await page.locator('[data-act="pause"]').click();
    await page.clock.runFor(300); assert.equal(await rows.count(), 2);
    await page.locator('[data-speed="5"]').click();
    await page.clock.runFor(200); assert.equal(await rows.count(), 2);
    await page.clock.runFor(300); assert.equal(await rows.count(), 3);
    await page.clock.runFor(400); assert.equal(await rows.count(), 4);
    await page.clock.runFor(400); assert.equal(await rows.count(), 5);
    assert.equal(await page.evaluate(() => window.feedFinished), true);
    await page.evaluate(async () => {
      const { S } = await import('/src/ui/dom.js');
      const { revealEntries } = await import('/src/ui/play.js');
      revealEntries([1,2,3].map(i => ({ kind:'system', id:`test.cancel.${i}`, text:`취소검증 ${i}`, age:S.L.age, year:S.L.year })), null, S.run);
      S.run++;
    });
    await page.clock.runFor(3000);
    assert.equal(await page.locator('.feed .entry').filter({ hasText: '취소검증' }).count(), 1);
    assert.deepEqual(page.qa.pageErrors, []);
  } finally { server.stop(); await browser.close(); }
});
