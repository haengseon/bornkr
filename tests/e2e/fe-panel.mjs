// 프로필 패널(펼침)·자영업 패널·노년 장면 스크린샷. 실행: node tests/e2e/fe-panel.mjs [light|dark] [seed] [age,age...]
import path from 'node:path';
import fs from 'node:fs';
import { launch, startServer, openPage, ROOT, appErrors, seedInit, presetInit, waitScreen } from './helpers.mjs';

const OUT = path.join(ROOT, 'docs', 'impl', 'shots');
const scheme = process.argv[2] === 'dark' ? 'dark' : 'light';
const seed = +(process.argv[3] ?? 10);
const ages = (process.argv[4] ?? '31,45,72').split(',').map(Number);
const browser = await launch(), srv = await startServer();
const page = await openPage(browser, srv.url, { clock: true, scheme, init: seedInit(seed) + presetInit({ seen19: true, speed: 10, auto: true }) });
await waitScreen(page, 'home');
await page.click('[data-go="born"]'); await waitScreen(page, 'birth');
await page.click('[data-act="start"]'); await waitScreen(page, 'life');
let ai = 0, t = 0;
while (ai < ages.length && t < 20 * 60_000) {
  if ((await page.evaluate(() => document.body.dataset.screen)) !== 'life') break;
  if (await page.$('.major__ok')) { await page.click('.major__ok').catch(() => {}); }
  const a = await page.evaluate(() => +document.querySelector('[data-hud="age"]')?.textContent || 0);
  if (a >= ages[ai] && !(await page.$('.sheet'))) {
    await page.evaluate(() => { document.querySelectorAll('.npop').forEach(n => n.remove()); const p = document.querySelector('.prof'); if (p && !p.classList.contains('is-open')) document.querySelector('.prof__sum').click(); });
    await page.clock.runFor(900);
    if (await page.$('.sheet')) continue;
    await page.evaluate(() => document.querySelector('.prof')?.scrollIntoView({ block: 'start' }));
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(OUT, `fe-${scheme}-panel-${ages[ai]}.png`) });
    await page.evaluate(() => scrollTo(0, 0));
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(OUT, `fe-${scheme}-scene-${ages[ai]}.png`) });
    ai++;
  }
  await page.clock.runFor(400); t += 400;
}
console.log(JSON.stringify({ shots: ai, errors: appErrors(page), pageErrors: page.qa.pageErrors, hscroll: await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth) }));
await page.ctx.close(); srv.stop(); await browser.close();
