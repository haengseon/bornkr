// 진행 정지 회귀(테스트 러너 대상 아님): node tests/e2e/qa-stall.mjs → docs/impl/qa-stall.json
// 3·5배속으로 10생애를 가상 시계로 돌려, 모달 응답 대기가 아닌데 나이가 40초(가상) 넘게 멈추는 구간이 있는지 본다.
import fs from 'node:fs';
import path from 'node:path';
import { launch, startServer, openPage, toBirth, startLife, ROOT, seedInit, presetInit } from './helpers.mjs';
const browser = await launch(), srv = await startServer(), out = [];
const SEEDS = [1, 2, 3, 5, 8, 13, 21, 34, 55, 89];
for (const [i, seed] of SEEDS.entries()) {
  const speed = i % 2 ? 5 : 3;
  const page = await openPage(browser, srv.url, { w: 390, h: 844, clock: true, noAutoMajor: true, url: '?motion=off', init: seedInit(seed) + presetInit({ speed, auto: false, seen19: true }) });
  await toBirth(page); await page.clock.runFor(1500); await startLife(page);
  let last = '', since = 0, worst = 0, maxAge = 0;
  for (let t = 0; t < 240_000; t += 1000) {
    await page.clock.runFor(1000);
    const s = await page.evaluate(() => {
      const modal = document.querySelector('.sheet, .chap-card');
      if (modal) { const b = document.querySelector('.choice__ok, .major__ok, .shock__ok'); if (b) b.click(); else document.querySelector('.sheet.choice .option.is-default')?.click(); }
      return { age: document.querySelector('[data-hud=age]')?.textContent, scr: document.body.dataset.screen, modal: !!modal };
    });
    if (s.scr !== 'life') break;
    maxAge = Math.max(maxAge, +s.age || 0);
    if (s.age !== last || s.modal) { last = s.age; since = 0; } else since += 1000;
    worst = Math.max(worst, since);
  }
  out.push({ seed, speed, maxAge, worstStallSec: worst / 1000, pageErrors: page.qa.pageErrors.length });
  console.log(JSON.stringify(out.at(-1)));
  await page.ctx.close();
}
fs.writeFileSync(path.join(ROOT, 'docs', 'impl', 'qa-stall.json'), JSON.stringify(out, null, 1));
srv.stop(); await browser.close();
