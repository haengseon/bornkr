// 시트 하단 라인 실측(테스트 러너 대상 아님): node tests/e2e/fe-sheetline.mjs [label] → docs/impl/fe-sheetline-<label>.json
// 탭별 시트 bottom 이 innerHeight 와 같은지, 하단 바가 시트 위에 보이는지, 선택 시트 선택 전·후 겹침을 잰다.
import fs from 'node:fs';
import path from 'node:path';
import { launch, startServer, openPage, toBirth, startLife, ROOT, seedInit } from './helpers.mjs';

const label = process.argv[2] || 'after';
const browser = await launch(), srv = await startServer();
const res = {};
for (const [w, h] of [[390, 844], [360, 640], [1280, 900]]) {
  const page = await openPage(browser, srv.url, { w, h, clock: true, noAutoMajor: true, url: '?motion=off', init: seedInit(42) });
  await toBirth(page); await page.clock.runFor(1500); await startLife(page); await page.clock.runFor(2000);
  const r = {};
  for (const tab of ['stats', 'traits', 'issues', 'peers']) {
    await page.click(`.lifebar [data-tab="${tab}"]`).catch(() => {}); await page.clock.runFor(400);
    r[tab] = await page.evaluate(() => {
      const s = document.querySelector('.sheet'); if (!s) return null;
      const q = s.getBoundingClientRect(), b = document.querySelector('.lifebar').getBoundingClientRect(), body = s.querySelector('.sheet__body').getBoundingClientRect();
      const top = document.elementFromPoint(b.x + b.width / 2, b.y + 4);
      return { sheetBottom: Math.round(q.bottom), vh: innerHeight, gapToViewport: Math.round(innerHeight - q.bottom), barBottom: Math.round(b.bottom), barOnTop: !!top?.closest('.lifebar'), bodyBottom: Math.round(body.bottom) };
    });
    await page.keyboard.press('Escape'); await page.clock.runFor(300);
  }
  // 드래그 중 하단 라인: 시트가 내려가는 건 의도, 놓은 뒤 복귀 시 bottom 유지
  await page.click('[data-tab="issues"]'); await page.clock.runFor(300);
  const hb = await page.evaluate(() => { const e = document.querySelector('.sheet__handle') || document.querySelector('.sheet__head'); const q = e.getBoundingClientRect(); return { x: q.x + q.width / 2, y: q.y + q.height / 2 }; });
  await page.mouse.move(hb.x, hb.y); await page.mouse.down(); await page.mouse.move(hb.x, hb.y + 30, { steps: 3 }); await page.mouse.up(); await page.clock.runFor(400);
  r.dragBack = await page.evaluate(() => { const s = document.querySelector('.sheet'); return s ? Math.round(innerHeight - s.getBoundingClientRect().bottom) : 'closed'; });
  await page.keyboard.press('Escape'); await page.clock.runFor(300);
  // 선택 시트 전·후
  for (let t = 0; t < 12 * 60_000 && !(await page.evaluate(() => document.querySelector('.sheet.choice .option'))); t += 500) {
    if (await page.evaluate(() => document.querySelector('.major__ok'))) await page.click('.major__ok').catch(() => {});
    await page.clock.runFor(500);
  }
  await page.clock.runFor(1000);
  const geo = () => page.evaluate(() => {
    const o = [...document.querySelectorAll('.sheet.choice .option')].map(e => Math.round(e.getBoundingClientRect().top));
    const ok = document.querySelector('.choice__ok')?.getBoundingClientRect(), bar = document.querySelector('.lifebar').getBoundingClientRect(), last = [...document.querySelectorAll('.sheet.choice .option')].at(-1).getBoundingClientRect();
    const sh = document.querySelector('.sheet.choice').getBoundingClientRect();
    return { optionTops: o, okTop: ok && Math.round(ok.top), okBottom: ok && Math.round(ok.bottom), barTop: Math.round(bar.top), lastOptionBottom: Math.round(last.bottom), overlapOkOnOptions: ok ? ok.top < last.bottom : false, sheetBottomGap: Math.round(innerHeight - sh.bottom) };
  });
  r.choiceBefore = await geo();
  await page.screenshot({ path: path.join(ROOT, 'docs', 'impl', 'shots', `fe-choice-before-${w}x${h}.png`) });
  await page.click('.sheet.choice .option'); await page.clock.runFor(800);
  r.choiceAfter = await geo();
  await page.screenshot({ path: path.join(ROOT, 'docs', 'impl', 'shots', `fe-choice-after-${w}x${h}.png`) });
  res[`${w}x${h}`] = r;
  await page.ctx.close();
}
fs.writeFileSync(path.join(ROOT, 'docs', 'impl', `fe-sheetline-${label}.json`), JSON.stringify(res, null, 1));
for (const [k, v] of Object.entries(res)) console.log(k, JSON.stringify(v));
srv.stop(); await browser.close();
