// 메인 화면(거주·직업·자산 카드) 스크린샷 + [확인] 횟수 실측: node tests/e2e/qa-main.mjs [before|after]
import fs from 'node:fs';
import path from 'node:path';
import { launch, startServer, openPage, toBirth, startLife, ROOT, seedInit, presetInit } from './helpers.mjs';
const label = process.argv[2] || 'after';
const log = (...a) => fs.appendFileSync(path.join(ROOT, 'docs', 'impl', 'qa-main.log'), a.join(' ') + '\n');
const browser = await launch(), srv = await startServer(), res = {};
for (const [w, h] of [[360, 800], [390, 844], [1366, 768]]) {
  const page = await openPage(browser, srv.url, { w, h, clock: true, noAutoMajor: true, url: '?motion=off', init: seedInit(2) + presetInit({ speed: 5, auto: false, seen19: true }) });
  await toBirth(page); await page.clock.runFor(1500); await startLife(page);
  const taps = { choice: [], cur: null }; let age = 0;
  for (let t = 0; t < 600_000 && age < 30; t += 1000) {
    await page.clock.runFor(1000);
    const s = await page.evaluate(() => {
      const ok = document.querySelector('.choice__ok, .major__ok, .shock__ok');
      const kind = document.querySelector('.sheet.choice--major') ? 'major-choice' : document.querySelector('.sheet.choice') ? 'plain-choice' : document.querySelector('.sheet.shock') ? 'shock' : document.querySelector('.sheet.major') ? 'major-event' : document.querySelector('.mini') ? 'mini' : null;
      let clicked = null;
      if (ok) { ok.click(); clicked = kind; }
      else document.querySelector('.sheet.choice .option.is-default')?.click();
      return { age: +document.querySelector('[data-hud=age]')?.textContent, scr: document.body.dataset.screen, clicked };
    });
    if (s.scr !== 'life') break;
    age = s.age;
    if (s.clicked) log(w, 'confirm', s.clicked, 'age', age);
  }
  await page.clock.runFor(300);
  const m = await page.evaluate(() => ({ cards: [...document.querySelectorAll('.pcard')].map(c => Math.round(c.getBoundingClientRect().height)), feedTop: Math.round(document.querySelector('.life__feed').getBoundingClientRect().top), vh: innerHeight, month: document.querySelector('[data-hud=month]')?.textContent, stats: document.querySelectorAll('.stats .stat').length }));
  res[`${w}x${h}`] = { age, ...m, errors: page.qa.pageErrors };
  await page.screenshot({ path: path.join(ROOT, 'docs', 'impl', 'shots', `main-profile-${label}-${w}x${h}.png`) });
  log(w, JSON.stringify(res[`${w}x${h}`]));
  await page.ctx.close();
}
srv.stop(); await browser.close();
