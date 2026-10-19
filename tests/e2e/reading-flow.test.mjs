import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { launch, startServer, openPage } from './helpers.mjs';

test('마지막 해·검정 페이지·사망 기록은 자동결정에서도 직접 넘긴다', { timeout: 90000 }, async () => {
  fs.mkdirSync('output/playwright', { recursive: true });
  const browser = await launch(), srv = await startServer();
  try {
    const page = await openPage(browser, srv.url, { clock: true, url: '?motion=off&splash=0' });
    await page.evaluate(async () => {
      const { newLife } = await import('/src/engine/index.js');
      const { S } = await import('/src/ui/dom.js');
      const { startNew } = await import('/src/ui/play.js');
      S.settings.auto = true; S.settings.speed = 5;
      const L = newLife({ seed: 50, forced: { year: 1970 } });
      L.age = 119; L.year = 2089;
      startNew(L);
    });
    await page.clock.runFor(60000);
    assert.equal(await page.locator('[data-act="last-record"]').count(), 1);
    assert.equal(await page.locator('[data-dcine]').count(), 0);
    await page.clock.runFor(60000);
    assert.equal(await page.evaluate(() => document.body.dataset.screen), 'life');
    await page.screenshot({ path: 'output/playwright/last-year.png' });
    await page.locator('[data-act="last-record"]').click();
    assert.equal(await page.locator('[data-dcine]').count(), 1);
    await page.clock.runFor(60000);
    assert.equal(await page.locator('[data-dcine]').count(), 1);
    await page.screenshot({ path: 'output/playwright/closing-page.png' });
    const buttonBox = await page.locator('[data-act="sum"]').boundingBox();
    assert.ok(buttonBox.y >= 0 && buttonBox.y + buttonBox.height <= 844);
    await page.locator('[data-act="sum"]').click();      // 검정 페이지에서 버튼 한 번으로 결산(F-9)
    assert.equal(await page.evaluate(() => document.body.dataset.screen), 'summary');
    assert.deepEqual(page.qa.pageErrors, []);
    // 실제 사망·민감 사망도 똑같이 직접 넘기며 민감 세부 기록은 검정 페이지에 노출하지 않는다.
    for (const sensitive of [false, true]) {
      await page.evaluate(async sensitive => {
        const { S, routes } = await import('/src/ui/dom.js');
        S.L.death = { age: 79, year: 2049, cause: 'cancer', causeLabel: '암', sensitive };
        S.L.log.push({ kind: 'death', text: '민감 원인 세부 기록' });
        S.sum = null; routes.death();
      }, sensitive);
      await page.clock.runFor(60000);
      assert.equal(await page.locator('[data-dcine]').count(), 1);
      if (sensitive) assert.equal(await page.locator('[data-dcine]').textContent().then(t => t.includes('민감 원인 세부 기록')), false);
    }
  } finally { srv.stop(); await browser.close(); }
});

test('가족 범례·상세는 한 목록이고 휴학 상태는 직업 내역에 보인다', { timeout: 60000 }, async () => {
  const browser = await launch(), srv = await startServer();
  try {
    const page = await openPage(browser, srv.url, { clock: true, url: '?motion=off&splash=0' });
    await page.evaluate(async () => {
      const { newLife } = await import('/src/engine/index.js');
      const { S } = await import('/src/ui/dom.js');
      const { startNew } = await import('/src/ui/play.js');
      const { recordYear } = await import('/src/engine/chronicle.js');
      const { takeLeave } = await import('/src/engine/systems/education.js');
      const { openHistory } = await import('/src/ui/history.js');
      const L = newLife({ seed: 50 });
      L.age = 21; L.year = L.birth.year + 21;
      Object.assign(L.edu, { stage: 'college', left: 3 });
      L.job.status = 'student'; takeLeave(L); recordYear(L);
      L.dailyLife.summary = { year: L.year, routine: { label: '혼자 쉬는 시간', status: 'active' }, ledger: { currencyBaseYear: 2025, income: 3000, totalOutflow: 1500, finalized: true } };
      S.settings.auto = false; startNew(L); openHistory('family');
    });
    assert.equal(await page.locator('[data-card="daily"]').count(), 0);
    assert.doesNotMatch(await page.locator('body').textContent(), /연간 수입|연간 지출/);
    assert.equal(await page.locator('.family-current').count(), 1);
    const members = await page.locator('.family-current li').allTextContents();
    assert.equal(members.filter(t => t.includes('어머니')).length, 1);
    assert.equal(members.filter(t => /^아버지(?:\s|·)/.test(t.trim())).length, 1);
    assert.equal(await page.locator('.family-chart__legend .family-chart__swatch').count() > 0, true);
    await page.screenshot({ path: 'output/playwright/family-details.png' });
    await page.locator('.sheet__close').click();
    await page.evaluate(async () => { const { openHistory } = await import('/src/ui/history.js'); openHistory('job'); });
    assert.match(await page.locator('.sheet__body').textContent(), /휴학 중/);
    assert.deepEqual(page.qa.pageErrors, []);
  } finally { srv.stop(); await browser.close(); }
});

