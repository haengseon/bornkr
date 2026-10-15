// 사망·결산 화면 스크린샷(짧은 생애 시드). 실행: node tests/e2e/fe-summary.mjs [light|dark] [seed]
import path from 'node:path';
import { launch, startServer, openPage, ROOT, appErrors, seedInit, presetInit, waitScreen, SEEDS } from './helpers.mjs';
const scheme = process.argv[2] === 'dark' ? 'dark' : 'light', seed = +(process.argv[3] ?? SEEDS.plain);
const OUT = path.join(ROOT, 'docs', 'impl', 'shots');
const browser = await launch(), srv = await startServer();
const page = await openPage(browser, srv.url, { clock: true, scheme, init: seedInit(seed) + presetInit({ seen19: true, speed: 10, auto: true }) });
await waitScreen(page, 'home'); await page.click('[data-go="born"]'); await waitScreen(page, 'birth'); await page.click('[data-act="start"]'); await waitScreen(page, 'life');
for (let i = 0; i < 4000 && (await page.evaluate(() => document.body.dataset.screen)) === 'life'; i++) await page.clock.runFor(500);
await page.clock.runFor(4000);
await page.screenshot({ path: path.join(OUT, `fe-${scheme}-death2.png`) });
await page.clock.runFor(6000);
await waitScreen(page, 'summary').catch(() => {});
await page.clock.runFor(2500);
await page.screenshot({ path: path.join(OUT, `fe-${scheme}-summary-full.png`), fullPage: true });
console.log(JSON.stringify({ errors: appErrors(page), pageErrors: page.qa.pageErrors, screen: await page.evaluate(() => document.body.dataset.screen) }));
await page.ctx.close(); srv.stop(); await browser.close();
