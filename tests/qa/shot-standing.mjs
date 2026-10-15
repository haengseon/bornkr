// 통계 위치 UI 스크린샷: 진행 화면 카드 칩(자산·연봉 옆 상위 N%) + 결산 '이 생애의 위치'. node tests/qa/shot-standing.mjs
import path from 'node:path';
import { launch, startServer, openPage, toBirth, startLife, ROOT, seedInit, presetInit } from '../e2e/helpers.mjs';
const browser = await launch(), srv = await startServer(), out = n => path.join(ROOT, 'tests/qa/out', n);
for (const [w, h] of [[360, 780], [1366, 768]]) {
  const page = await openPage(browser, srv.url, { w, h, clock: true, url: '?motion=off&splash=0', init: seedInit(11) + presetInit({ speed: 5, auto: true, seen19: true }) });
  await toBirth(page); await page.clock.runFor(1500); await startLife(page);
  for (let i = 0; i < 60 && await page.evaluate(() => (window.__age = +document.querySelector('.hud')?.textContent.match(/(\d+)\s*세/)?.[1] || 0) < 30); i++) await page.clock.runFor(5000);
  await page.evaluate(() => document.querySelector('.pcards')?.scrollIntoView({ block: 'center' })); await page.clock.runFor(300);
  console.log(w, 'chips', await page.evaluate(() => [...document.querySelectorAll('.pct')].map(e => e.textContent)));
  await page.screenshot({ path: out(`standing-${w}x${h}-life.png`) });
  await page.evaluate(async () => { const e = await import('./src/engine/index.js'); const { S } = await import('./src/ui/dom.js'); try { e.runToEnd(S.L); } catch {} });
  for (let i = 0; i < 40 && await page.evaluate(() => document.body.dataset.screen !== 'death'); i++) await page.clock.runFor(500);
  await page.click('[data-act="sum"]'); await page.clock.runFor(800);
  await page.evaluate(() => document.querySelector('.stand')?.scrollIntoView({ block: 'start' })); await page.clock.runFor(300);
  console.log(w, 'stand', await page.evaluate(() => document.querySelector('.stand')?.innerText.replace(/\n+/g, ' | ').slice(0, 300)));
  await page.screenshot({ path: out(`standing-${w}x${h}-summary.png`) });
  await page.ctx.close();
}
srv.stop(); await browser.close();
