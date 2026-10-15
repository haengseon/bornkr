import { launch, startServer, openPage, toBirth, startLife, seedInit, presetInit } from '../e2e/helpers.mjs';
const browser = await launch(), srv = await startServer();
const page = await openPage(browser, srv.url, { w: 390, h: 800, clock: true, noAutoMajor: true, url: '?motion=off', init: seedInit(7) + presetInit({ speed: 5, auto: true, seen19: true }) });
await toBirth(page); await page.clock.runFor(1500); await startLife(page); await page.clock.runFor(120_000);
for (let i = 0; i < 6; i++) { console.log(await page.evaluate(() => [...document.querySelectorAll('.sheet')].map(e => e.className + ' | ' + e.textContent.slice(0, 60)))); await page.clock.runFor(2000); }
await browser.close(); srv.stop();
