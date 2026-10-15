// 대비·여백 실측(테스트 러너 대상 아님): node tests/e2e/fe-contrast.mjs [label] → docs/impl/fe-contrast-<label>.json
// 라이트·다크 × (진행 화면+하단 바, 선택 시트, 선택 후 시트)에서 글자 대비 < 4.5 인 요소, 선택지 마지막 항목 아래 여백(바 제외)을 잰다.
import fs from 'node:fs';
import path from 'node:path';
import { launch, startServer, openPage, toBirth, startLife, ROOT, seedInit } from './helpers.mjs';

const label = process.argv[2] || 'after';
const browser = await launch(), srv = await startServer();
const AUDIT = () => {
  const parse = c => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return null; const [r, g, b, a = 1] = m[1].split(/[ ,\/]+/).filter(Boolean).map(Number); return { r, g, b, a }; };
  const lum = ({ r, g, b }) => { const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }; return .2126 * f(r) + .7152 * f(g) + .0722 * f(b); };
  const over = (top, bot) => ({ r: top.r * top.a + bot.r * (1 - top.a), g: top.g * top.a + bot.g * (1 - top.a), b: top.b * top.a + bot.b * (1 - top.a), a: 1 });
  const bgOf = el => { const stack = []; for (let e = el; e; e = e.parentElement) { const c = parse(getComputedStyle(e).backgroundColor); if (c && c.a > 0) { stack.push(c); if (c.a >= 1) break; } } let base = { r: 255, g: 255, b: 255, a: 1 }; if (!stack.length || stack[stack.length - 1].a < 1) base = parse(getComputedStyle(document.body).backgroundColor) || base; return stack.reduceRight((acc, c) => over(c, acc), base); };
  const out = [];
  for (const el of document.querySelectorAll('body *')) {
    if (!el.offsetParent && getComputedStyle(el).position !== 'fixed') continue;
    const own = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
    if (!own || el.closest('svg, .sr-only')) continue;
    const cs = getComputedStyle(el), r = el.getBoundingClientRect(); if (+cs.opacity === 0) continue;
    if (!r.width || !r.height || cs.visibility === 'hidden') continue;
    const fg0 = parse(cs.color); if (!fg0) continue;
    let op = 1; for (let e = el; e; e = e.parentElement) op *= +getComputedStyle(e).opacity;
    const bg = bgOf(el), fg = over({ ...fg0, a: fg0.a * op }, bg);
    const L1 = lum(fg), L2 = lum(bg), ratio = (Math.max(L1, L2) + .05) / (Math.min(L1, L2) + .05);
    if (ratio < 4.5) out.push({ el: (el.className || el.tagName).toString().slice(0, 40), text: el.textContent.trim().slice(0, 14), ratio: +ratio.toFixed(2) });
  }
  return out;
};
const res = {};
for (const scheme of ['light', 'dark']) {
  for (const [w, h] of [[360, 640], [390, 844], [1280, 900]]) {
    const page = await openPage(browser, srv.url, { w, h, scheme, clock: true, noAutoMajor: true, url: '?motion=off', init: seedInit(42) });
    await toBirth(page); await page.clock.runFor(1500); await startLife(page);
    const r = { life: await page.evaluate(AUDIT) };
    for (let t = 0; t < 12 * 60_000 && !(await page.evaluate(() => document.querySelector('.sheet.choice .option'))); t += 500) {
      if (await page.evaluate(() => document.querySelector('.major__ok'))) await page.click('.major__ok').catch(() => {});
      await page.clock.runFor(500);
    }
    await page.clock.runFor(1000);
    r.choice = await page.evaluate(AUDIT);
    r.gapBelowLast = await page.evaluate(() => { const o = [...document.querySelectorAll('.sheet.choice .options li')].at(-1), bar = document.querySelector('.lifebar'), sh = document.querySelector('.sheet.choice'); if (!o) return null; const q = o.getBoundingClientRect(), b = bar.getBoundingClientRect(), s = sh.getBoundingClientRect(); const foot = document.querySelector('.choice__foot')?.getBoundingClientRect(); return { lastBottom: Math.round(q.bottom), barTop: Math.round(b.top), sheetBottom: Math.round(s.bottom), footH: foot && Math.round(foot.height), gapToBarOrFoot: Math.round((foot ? foot.top : Math.min(b.top, s.bottom)) - q.bottom), gapAfterFoot: foot ? Math.round(Math.min(b.top, s.bottom) - foot.bottom) : null }; });
    await page.click('.sheet.choice .option').catch(() => {}); await page.clock.runFor(800);
    r.picked = await page.evaluate(AUDIT);
    await page.screenshot({ path: path.join(ROOT, 'docs', 'impl', 'shots', `fe-contrast-${label}-${scheme}-${w}x${h}.png`) });
    res[`${scheme} ${w}x${h}`] = r;
    await page.ctx.close();
  }
}
fs.writeFileSync(path.join(ROOT, 'docs', 'impl', `fe-contrast-${label}.json`), JSON.stringify(res, null, 1));
for (const [k, v] of Object.entries(res)) console.log(k, 'life', v.life.length, 'choice', v.choice.length, 'picked', v.picked.length, JSON.stringify(v.gapBelowLast), JSON.stringify([...v.picked, ...v.choice, ...v.life].slice(0, 6)));
srv.stop(); await browser.close();
