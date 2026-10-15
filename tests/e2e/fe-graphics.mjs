// 그래픽 UI 점검 스크립트(테스트 러너 대상 아님): 한 생애를 돌며 스크린샷·콘솔 에러·가로 스크롤·rAF 간격을 기록한다.
// 실행: node tests/e2e/fe-graphics.mjs [light|dark]  → docs/impl/shots/fe-*.png, docs/impl/fe-graphics-metrics.json
import path from 'node:path';
import fs from 'node:fs';
import { launch, startServer, openPage, toBirth, startLife, ROOT, appErrors, seedInit } from './helpers.mjs';

const OUT = path.join(ROOT, 'docs', 'impl', 'shots');
fs.mkdirSync(OUT, { recursive: true });
const scheme = process.argv[2] === 'dark' ? 'dark' : 'light';
const seed = +(process.argv[3] ?? 42);
const browser = await launch();
const srv = await startServer();
const metrics = { scheme, seed, shots: [] };
const snap = async (page, name) => { await page.waitForTimeout(350); await page.screenshot({ path: path.join(OUT, `fe-${scheme}-${name}.png`) }); metrics.shots.push(name); };

const page = await openPage(browser, srv.url, { clock: true, scheme, init: seedInit(seed) });
await page.screenshot({ path: path.join(OUT, `fe-${scheme}-0-home.png`) });
await toBirth(page);
await page.clock.runFor(1500);
await snap(page, '1-birth');
await startLife(page);
const targets = [3, 8, 16, 24, 32, 45, 60, 75];
let ti = 0, t = 0, picks = 0, majors = 0;
const age = () => page.evaluate(() => +document.querySelector('[data-hud="age"]')?.textContent || 0);
while (t < 20 * 60_000) {
  const scr = await page.evaluate(() => document.body.dataset.screen);
  if (scr !== 'life') break;
  if (await page.evaluate(() => !!document.querySelector('.sheet.choice'))) {
    if (picks++ % 3 === 0) await snap(page, `choice-${picks}`);
    await page.click('.option:not([disabled])').catch(() => {});
    await page.clock.runFor(1800);
    continue;
  }
  if (await page.$('.major__ok')) { if (majors++ % 3 === 0) await snap(page, `major-${majors}`); await page.click('.major__ok').catch(() => {}); await page.clock.runFor(600); continue; }
  const a = await age();
  if (ti < targets.length && a >= targets[ti]) { await snap(page, `life-${targets[ti]}`); ti++; }
  await page.clock.runFor(500); t += 500;
}
for (const n of ['death', 'summary']) {
  await page.waitForFunction(x => document.body.dataset.screen === x, n, { timeout: 20000 }).catch(() => {});
  await page.clock.runFor(1500);
  await snap(page, n);
  if (n === 'death') { await page.click('[data-act="sum"]').catch(() => {}); await page.clock.runFor(800); }
}
metrics.errors = appErrors(page);
metrics.pageErrors = page.qa.pageErrors;
metrics.hscroll = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
await page.ctx.close();

// 실시간 rAF 간격(가짜 시계 없이 6초)
const rt = await openPage(browser, srv.url, { scheme, init: seedInit(seed), noBootWait: false });
await rt.click('[data-go="born"]'); await rt.waitForSelector('[data-go="gateOk"],[data-act="start"]');
if (await rt.$('[data-go="gateOk"]')) await rt.click('[data-go="gateOk"]');
await rt.click('[data-act="start"]');
await rt.waitForSelector('.scene.run');
metrics.frames = await rt.evaluate(() => new Promise(res => {
  const ts = []; const f = t => { ts.push(t); if (ts.length < 360) requestAnimationFrame(f); else { const d = ts.slice(1).map((x, i) => x - ts[i]).sort((a, b) => a - b); res({ n: d.length, median: d[d.length >> 1], p95: d[Math.floor(d.length * .95)], max: d.at(-1) }); } };
  requestAnimationFrame(f);
}));
metrics.rtErrors = appErrors(rt);
await rt.ctx.close();
fs.writeFileSync(path.join(ROOT, 'docs', 'impl', `fe-graphics-metrics-${scheme}.json`), JSON.stringify(metrics, null, 2));
console.log(JSON.stringify({ ...metrics, shots: metrics.shots.length }, null, 1));
srv.stop(); await browser.close();
