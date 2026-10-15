// 긴 진행 중 콘솔 오류·선택 시트 비용 표시 확인: node tests/qa/console-run.mjs
import { launch, startServer, openPage, toBirth, startLife, seedInit, presetInit } from '../e2e/helpers.mjs';
const browser = await launch(), srv = await startServer();
const errs = [], costs = new Set();
for (const seed of [3, 11]) {
  const page = await openPage(browser, srv.url, { w: 390, h: 844, clock: true, noAutoMajor: true, url: '?motion=off', init: seedInit(seed) + presetInit({ speed: 5, auto: true, seen19: true }) });
  page.on('pageerror', e => errs.push(String(e))); page.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await toBirth(page); await page.clock.runFor(1500); await startLife(page);
  for (let t = 0; t < 40 * 60_000; t += 2000) {
    await page.clock.runFor(2000);
    const c = await page.evaluate(() => [...document.querySelectorAll('.option__cost, .jobinfo')].map(e => e.textContent.slice(0, 80)));
    c.forEach(x => costs.add(x));
    if (await page.evaluate(() => document.body.dataset.screen !== 'life')) break;
  }
  console.log('seed', seed, 'screen', await page.evaluate(() => document.body.dataset.screen));
  await page.close();
}
console.log('errors', errs.length, errs.slice(0, 3)); console.log('cost samples', [...costs].slice(0, 5));
await browser.close(); srv.stop();
