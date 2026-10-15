import { launch, startServer, openPage, toBirth, startLife, seedInit, presetInit } from '../e2e/helpers.mjs';
const browser = await launch(), srv = await startServer();
const page = await openPage(browser, srv.url, { w: 360, h: 780, clock: true, noAutoMajor: true, url: '?motion=off', init: seedInit(7) + presetInit({ speed: 5, auto: true, seen19: true }) });
await toBirth(page); await page.clock.runFor(1500); await startLife(page); await page.clock.runFor(60_000);
console.log(await page.evaluate(() => document.querySelector('[data-persona]').outerHTML.slice(0, 600)));
await browser.close(); srv.stop();
