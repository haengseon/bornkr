// 진행 화면 모바일 스크린샷·영역 측정: node tests/qa/shot-play.mjs [라벨]
import path from 'node:path';
import { launch, startServer, openPage, toBirth, startLife, ROOT, seedInit, presetInit } from '../e2e/helpers.mjs';
const label = process.argv[2] || 'now';
const browser = await launch(), srv = await startServer();
for (const [w, h] of [[360, 640], [360, 780], [390, 844]]) {
  const page = await openPage(browser, srv.url, { w, h, clock: true, noAutoMajor: true, url: '?motion=off', init: seedInit(7) + presetInit({ speed: 5, auto: true, seen19: true }) });
  await toBirth(page); await page.clock.runFor(1500); await startLife(page); await page.clock.runFor(60_000);
  const m = await page.evaluate(() => { const r = s => document.querySelector(s)?.getBoundingClientRect(); const f = s => { const b = r(s); return b && [Math.round(b.top), Math.round(b.bottom)]; };
    return { vh: innerHeight, hud: f('.hud'), feed: f('.life__feed'), bar: f('.lifebar'), prof: f('.prof'), stats: f('.stats'), scrollY: scrollY }; });
  console.log(w + 'x' + h, JSON.stringify(m));
  await page.screenshot({ path: path.join(ROOT, 'tests/qa/out', `play-${label}-${w}x${h}.png`) });
  await page.close();
}
await browser.close(); srv.stop();
