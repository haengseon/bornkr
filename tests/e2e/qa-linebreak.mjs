// 줄바꿈·넘침 자동 검출(테스트 러너 대상 아님): node tests/e2e/qa-linebreak.mjs [label] → docs/impl/qa-linebreak-<label>.json
// 검출: (1) 한글 단어 중간 끊김 (2) 1~2글자 고아줄 (3) 숫자+단위 분리 (4) 칩·배지 내부 줄바꿈 (5) 말줄임으로 잘림 (6) 가로 넘침 (7) 버튼 라벨 2줄
import fs from 'node:fs';
import path from 'node:path';
import { launch, startServer, openPage, toBirth, startLife, ROOT, seedInit, presetInit } from './helpers.mjs';
const label = process.argv[2] || 'after';
const WIDTHS = (process.env.WIDTHS || '280,360,390,430,600,768,900,1366,1920').split(',').map(Number);
const HEIGHT = w => (w < 600 ? 800 : w < 900 ? 1024 : 800);

const DETECT = `(() => {
  const out = [], seen = new Set();
  const vis = el => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none'; };
  const sel = el => el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\\s+/).slice(0, 2).join('.') : '');
  const add = (kind, el, text) => { const k = kind + sel(el) + text; if (seen.has(k)) return; seen.add(k); out.push({ kind, el: sel(el), text: String(text).slice(0, 40) }); };
  const lines = rects => { const ys = []; for (const r of rects) { if (r.width < 1) continue; if (!ys.some(y => Math.abs(y - r.top) < 3)) ys.push(r.top); } return ys.length; };
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let n;
  const UNIT = /\\d[\\d,.]*\\s?(억|만|천|원|세|년|월|일|%|명|㎡|평|배|초)(\\s?원)?/g;
  while ((n = walker.nextNode())) {
    const t = n.textContent; if (!t.trim()) continue;
    const el = n.parentElement; if (!el || ['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(el.tagName) || !vis(el) || el.closest('[aria-hidden="true"], svg, canvas, [hidden]')) continue;
    const cs = getComputedStyle(el);
    for (const m of t.matchAll(UNIT)) { const r = document.createRange(); r.setStart(n, m.index); r.setEnd(n, m.index + m[0].length); if (lines([...r.getClientRects()]) > 1) add('unit-split', el, m[0]); }
    for (const m of t.matchAll(/[가-힣]{2,}/g)) { const r = document.createRange(); r.setStart(n, m.index); r.setEnd(n, m.index + m[0].length); if (lines([...r.getClientRects()]) > 1) add('word-split', el, m[0] + ' [' + cs.wordBreak + ']'); }
    const all = document.createRange(); all.selectNodeContents(n);
    const rs = [...all.getClientRects()].filter(r => r.width > 1);
    if (rs.length > 1 && t.trim().length > 6 && !n.nextSibling) {
      const ys = [...new Set(rs.map(r => Math.round(r.top / 3)))].sort((a, b) => a - b), lastY = ys.at(-1);
      const lastW = rs.filter(r => Math.round(r.top / 3) === lastY).reduce((a, r) => a + r.width, 0), fs = parseFloat(cs.fontSize);
      if (ys.length > 1 && lastW < fs * 2.3) add('orphan', el, t.trim().slice(-12));
    }
  }
  for (const el of document.querySelectorAll('body *')) {
    if (!vis(el) || el.closest('svg, [aria-hidden="true"], [hidden]')) continue;
    const cs = getComputedStyle(el);
    if (cs.textOverflow === 'ellipsis' && el.scrollWidth > el.clientWidth + 1) add('ellipsis-cut', el, el.textContent.trim());
    if (el.scrollWidth > el.clientWidth + 1 && cs.overflowX === 'visible' && !el.querySelector('.is-stamping') && el.clientWidth > 0 && !['HTML', 'BODY'].includes(el.tagName) && cs.display !== 'inline' && cs.textOverflow !== 'ellipsis') add('overflow-x', el, el.scrollWidth + '>' + el.clientWidth);
    if (el.matches('.eff, .fx, .tag, .badge, .risk, .paper__tag, .reveal__tag, .tabbadge') || el.matches('.btn, .seg__btn, .tabbtn, .switch, .ring')) {
      const rects = []; const tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); let tn;
      while ((tn = tw.nextNode())) { if (!tn.textContent.trim() || tn.parentElement.closest('.sr-only, svg')) continue; const r = document.createRange(); r.selectNodeContents(tn); rects.push(...r.getClientRects()); }
      if (lines(rects) > 1 && el.textContent.trim().length > 0) add(el.matches('.btn, .seg__btn, .tabbtn, .switch') ? 'button-2lines' : 'chip-wrap', el, el.textContent.trim());
    }
  }
  if (document.documentElement.scrollWidth > innerWidth + 1) out.push({ kind: 'page-overflow-x', el: 'html', text: document.documentElement.scrollWidth + '>' + innerWidth });
  return out;
})()`;

const browser = await launch(), srv = await startServer();
const res = {}; let total = 0;
const save = () => fs.writeFileSync(path.join(ROOT, 'docs', 'impl', `qa-linebreak-${label}.json`), JSON.stringify(res, null, 1));
const check = async (page, w, state) => {
  await page.clock.runFor(400);
  const found = await page.evaluate(DETECT);
  (res[w] ||= {})[state] = found; total += found.length;
};
const click = (page, sel) => page.evaluate(s => document.querySelector(s)?.click(), sel);
async function runWidth(w) {
  const h = HEIGHT(w);
  let page = await openPage(browser, srv.url, { w, h, clock: true, url: '?motion=off&splash=0', init: presetInit({ speed: 5, auto: false, seen19: true }) });
  await page.clock.runFor(1500);
  await check(page, w, 'home');
  for (const g of ['settings', 'codex', 'archive']) {
    await click(page, `[data-go="${g}"]`); await page.clock.runFor(900);
    await check(page, w, g);
    await click(page, '[data-go="home"]'); await page.clock.runFor(600);
  }
  await click(page, '[data-go="born"]'); await page.clock.runFor(900);
  await check(page, w, 'birth');
  await page.ctx.close();

  page = await openPage(browser, srv.url, { w, h, clock: true, noAutoMajor: true, url: '?motion=off&splash=0', init: seedInit(2) + presetInit({ speed: 5, auto: false, seen19: true }) });
  await toBirth(page); await page.clock.runFor(1500); await startLife(page);
  const done = new Set();
  for (let t = 0; t < 400_000; t += 1000) {
    await page.clock.runFor(1000);
    const st = await page.evaluate(() => ({
      scr: document.body.dataset.screen, age: +document.querySelector('[data-hud=age]')?.textContent,
      choice: !!document.querySelector('.sheet.choice:not(.is-resolved) .option'), major: !!document.querySelector('.sheet.major .major__ok'),
      pop: !!document.querySelector('.sheet'),
    }));
    if (st.scr !== 'life') break;
    if (st.choice) {
      if (!done.has('choice')) { done.add('choice'); await check(page, w, 'choice'); }
      await click(page, '.sheet.choice .option.is-default'); await page.clock.runFor(500);
      if (!done.has('result')) { done.add('result'); await check(page, w, 'result'); }
    } else if (st.major && !done.has('major')) { done.add('major'); await check(page, w, 'major-event'); }
    await click(page, '.choice__ok, .major__ok, .shock__ok');
    if (!st.pop && st.age >= 29 && !done.has('feed')) {
      done.add('feed'); await check(page, w, 'life-main');
      if (await page.evaluate(() => !!document.querySelector('.newsrow'))) { await click(page, '.newsrow'); await page.clock.runFor(500); await check(page, w, 'paper'); await click(page, '.sheet__close'); await page.clock.runFor(400); }
      for (const tab of ['stats', 'issues']) { await click(page, `.lifebar [data-tab="${tab}"]`); await page.clock.runFor(700); await check(page, w, 'tab-' + tab); await click(page, '.sheet__close'); await page.clock.runFor(400); }
      break;
    }
  }
  await page.ctx.close();

  page = await openPage(browser, srv.url, { w, h, clock: true, url: '?motion=off&splash=0', init: seedInit(8) + presetInit({ speed: 5, auto: false, seen19: true }) });
  await toBirth(page); await page.clock.runFor(1500); await startLife(page);
  let seenDeath = false;
  for (let t = 0; t < 120_000; t += 1000) {
    await page.clock.runFor(1000);
    await click(page, '.sheet.choice .option.is-default'); await click(page, '.choice__ok, .major__ok');
    const s = await page.evaluate(() => document.body.dataset.screen);
    if (s === 'death' && !seenDeath) { seenDeath = true; await check(page, w, 'death'); }
    if (s === 'summary') break;
  }
  if ((await page.evaluate(() => document.body.dataset.screen)) === 'summary') {
    await check(page, w, 'summary');
    await click(page, '[data-card="verdict"]'); await page.clock.runFor(1500); await check(page, w, 'share');
  }
  await page.ctx.close();
  save(); console.log(w, JSON.stringify(Object.fromEntries(Object.entries(res[w]).map(([k, v]) => [k, v.length]))));
}
for (const w of WIDTHS) { for (let tryN = 0; tryN < 3; tryN++) { try { total -= Object.values(res[w] || {}).reduce((a, v) => a + v.length, 0); delete res[w]; await runWidth(w); break; } catch (e) { console.log(w, 'retry', String(e.message).slice(0, 80)); } } }
const byKind = {}; for (const w of Object.values(res)) for (const v of Object.values(w)) for (const f of v) byKind[f.kind] = (byKind[f.kind] || 0) + 1;
res._summary = { total, byKind }; save(); console.log(JSON.stringify(res._summary));
srv.stop(); await browser.close();
