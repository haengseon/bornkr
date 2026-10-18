import test from 'node:test';
import assert from 'node:assert/strict';
import { launch, startServer, openPage } from './helpers.mjs';

test('무소득 은퇴자의 현금 감소가 순자산 카드와 연도별 자산 내역에 반영된다', { timeout: 60000 }, async () => {
  const browser = await launch(), server = await startServer();
  try {
    const page = await openPage(browser, server.url, { clock: true, url: '?motion=off&splash=0' });
    await page.evaluate(async () => {
      const { newLife } = await import('/src/engine/index.js');
      const { makeCtx } = await import('/src/engine/life.js');
      const { step } = await import('/src/engine/systems/money.js');
      const { recordYear } = await import('/src/engine/chronicle.js');
      const { S } = await import('/src/ui/dom.js');
      const { startNew } = await import('/src/ui/play.js');
      const L = newLife({ seed: 50, forced: { year: 1960 } });
      Object.assign(L, { age: 64, year: 2024 }); L.flags = { indep: 2000 }; L.tally = {}; L.cache = { INCpos: 20 };
      Object.assign(L.job, { status: 'retired', wage: 0, platform: false });
      L.family.partner = null; L.family.children = []; L.family.caringFor = null;
      for (const p of Object.values(L.family.parents)) p.alive = false;
      Object.assign(L.home, { parents: false, owned: false, tenure: 'jeonse', deposit: 0, value: 0, rent: 0 });
      Object.assign(L.aging, { pensionMonthly: 0, basic: 0 });
      L.health.conditions = []; L.pension2 = null; L.rentals = []; L.lean = {};
      L.money.assets = 10000; for (const k in L.money.loans) L.money.loans[k] = 0; L.money.debt = 0;
      recordYear(L); L.age++; L.year++; const ctx = makeCtx(L); ctx.chance = () => false;
      step(L, ctx); recordYear(L); S.settings.auto = false; startNew(L);
    });
    await page.clock.runFor(1000);
    assert.match((await page.locator('[data-f="net"] [data-n]').textContent()).replace(/\s/g, ''), /8,484만원/);
    assert.match(await page.locator('.feed').textContent(), /모아 둔 현금에서 꺼내 썼다/);
    assert.equal(await page.locator('[data-card="daily"]').count(), 0);
    await page.locator('[data-history="asset"]').click();
    const entries = await page.locator('.history-list li').allTextContents();
    assert.match(entries[0].replace(/\s/g, ''), /2025년.*8,484만원/);
    assert.match(entries[0].replace(/\s/g, ''), /금융자산8,484만원/);
    assert.match(entries[1], /2024년/);
    const balances = await page.evaluate(async () => {
      const { S } = await import('/src/ui/dom.js');
      return [S.L.chronicle[64].asset.net, S.L.chronicle[65].asset.net];
    });
    assert.deepEqual(balances, [10000, 8484]);
    assert.deepEqual(page.qa.pageErrors, []);
  } finally { server.stop(); await browser.close(); }
});
