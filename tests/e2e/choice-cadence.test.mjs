import test from 'node:test';
import assert from 'node:assert/strict';
import { launch, startServer, openPage } from './helpers.mjs';

test('5년 공백 뒤 생활 선택이 화면에 나타나고 고른 결과가 기록된다', { timeout: 60000 }, async () => {
  const browser = await launch(), server = await startServer();
  try {
    const page = await openPage(browser, server.url, { clock: true, noAutoMajor: true, url: '?motion=off&splash=0' });
    await page.evaluate(async () => {
      const { newLife } = await import('/src/engine/index.js');
      const { makeCtx } = await import('/src/engine/life.js');
      const { step } = await import('/src/engine/choice-cadence.js');
      const { S } = await import('/src/ui/dom.js');
      const { startNew } = await import('/src/ui/play.js');
      const L = newLife({ seed: 50 });
      L.age = 35; L.year = L.birth.year + 35; L.lastChoiceAge = 29; L.yr.asked = false;
      step(L, makeCtx(L)); S.settings.auto = false; startNew(L);
    });
    await page.clock.runFor(300);
    assert.equal(await page.locator('.sheet.choice .option').count(), 3);
    assert.match(await page.locator('.choice__prompt').textContent(), /앞으로 몇 해/);
    assert.match(await page.locator('[data-opt="organize"]').textContent(), /▼2/);
    assert.match(await page.locator('[data-opt="rest"]').textContent(), /▲1/);
    await page.locator('[data-opt="rest"]').click();
    assert.match(await page.locator('.choice.is-resolved').textContent(), /몸을 쉬게/);
    const picked = await page.evaluate(async () => {
      const { S } = await import('/src/ui/dom.js');
      return S.L.choices.find(c => c.eventId === 'sys.life.direction');
    });
    assert.equal(picked.option, 'rest'); assert.equal(picked.auto, false); assert.equal(picked.cadence, true);
    assert.deepEqual(page.qa.pageErrors, []);
  } finally { server.stop(); await browser.close(); }
});
