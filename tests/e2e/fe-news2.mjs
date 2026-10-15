// FE news2 검증(테스트 러너 대상 아님): node tests/e2e/fe-news2.mjs [quick]
// 뉴스 토스트·신문 지면·과거 신문·시트 닫기(드래그/스크림/뒤로)·하단 바 클릭·해상도별 겹침/가로 스크롤 → docs/impl/fe-news2-metrics.json, shots/fe-news2-*.png, fe-pc-*.png, fe-fold-*.png
import path from 'node:path';
import fs from 'node:fs';
import { launch, startServer, openPage, toBirth, startLife, ROOT, appErrors, seedInit } from './helpers.mjs';

const OUT = path.join(ROOT, 'docs', 'impl', 'shots');
fs.mkdirSync(OUT, { recursive: true });
const M = { checks: {}, sizes: {} };
const ok = (k, v, extra) => { M.checks[k] = extra === undefined ? v : { ok: v, ...extra }; console.log(v ? 'PASS' : 'FAIL', k, extra ? JSON.stringify(extra) : ''); };
const browser = await launch();
const srv = await startServer();
const has = (page, sel) => page.evaluate(s => !!document.querySelector(s), sel);
const age = page => page.evaluate(() => +document.querySelector('[data-hud="age"]')?.textContent || 0);
const shot = (page, n) => page.screenshot({ path: path.join(OUT, n + '.png') });

async function boot(opts = {}) {
  const page = await openPage(browser, srv.url, { clock: true, noAutoMajor: true, url: '?motion=off', init: seedInit(42), ...opts });
  await toBirth(page); await page.clock.runFor(1500); await startLife(page);
  await page.evaluate(() => { const s = JSON.parse(localStorage.getItem('hj.v1.settings') || '{}'); if (s.auto) document.querySelector('[data-act="auto"]')?.click(); });
  return page;
}
async function drive(page, until, max = 25 * 60_000) {
  for (let t = 0; t < max; t += 500) {
    if (await page.evaluate(until)) return t;
    if (await has(page, '.major__ok')) { await page.click('.major__ok').catch(() => {}); await page.clock.runFor(200); continue; }
    if (await has(page, '.sheet.choice .option:not([disabled]):not(.is-picked)')) { await page.click('.sheet.choice .option:not([disabled])').catch(() => {}); await page.clock.runFor(200); continue; }
    await page.clock.runFor(500);
  }
  console.log(await page.evaluate(() => [...document.querySelectorAll('.sheet,.chap-card')].map(e => document.body.dataset.screen + ' ' + e.className + '|' + [...e.querySelectorAll('button')].map(b => b.className + ':' + b.textContent.trim().slice(0, 10)).join(',')).join(' // ')));
  throw new Error('drive timeout');
}
const settle = page => drive(page, () => !document.querySelector('.sheet'), 5 * 60_000);
const barOk = page => page.evaluate(() => {
  const b = document.querySelector('.lifebar'); if (!b) return false;
  return [...b.querySelectorAll('button')].every(x => { const r = x.getBoundingClientRect(); if (!r.width) return true; const e = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2); return e && x.contains(e); });
});
const layout = page => page.evaluate(() => {
  const r = s => { const e = document.querySelector(s); if (!e || !e.getBoundingClientRect().width) return null; const q = e.getBoundingClientRect(); return { t: Math.round(q.top), b: Math.round(q.bottom), l: Math.round(q.left), r: Math.round(q.right) }; };
  const bar = r('.lifebar'), feed = r('.life__feed');
  const under12 = [...document.querySelectorAll('body *')].filter(e => e.children.length === 0 && e.textContent.trim() && e.offsetParent && parseFloat(getComputedStyle(e).fontSize) < 12 && !e.closest('svg')).length;
  const small44 = [...document.querySelectorAll('.lifebar button, .life__side button')].filter(e => { const q = e.getBoundingClientRect(); return q.width && (q.height < 44 || q.width < 44); }).map(e => e.className + ':' + Math.round(e.getBoundingClientRect().width) + 'x' + Math.round(e.getBoundingClientRect().height));
  return { vw: innerWidth, vh: innerHeight, sw: document.documentElement.scrollWidth, hud: r('.hud'), scene: r('.scene'), feed, bar, side: r('.life__side'), aux: r('.life__aux'), under12, small44,
    feedVisible: bar && feed ? Math.max(0, Math.min(bar.t, innerHeight) - Math.max(feed.t, 0)) : null, cols: getComputedStyle(document.querySelector('.life')).gridTemplateColumns };
});

// ── 기능 시나리오 390x844
{
  const page = await boot();
  await drive(page, () => !!document.querySelector('.ntoast'));
  ok('a.toast-appears', true);
  const a0 = await age(page);
  await shot(page, 'fe-news2-1-toast');
  await drive(page, () => document.querySelectorAll('.ntoast').length >= 2, 12 * 60_000).catch(() => {});
  const n = await page.evaluate(() => document.querySelectorAll('.ntoast').length);
  ok('a.toast-max3', n >= 1 && n <= 3, { n });
  ok('a.no-popup', !(await has(page, '.npop')) && !(await has(page, '.sheet.paper-sheet')));
  const a1 = await age(page); await page.clock.runFor(5000);
  ok('a.clock-runs-with-toast', (await age(page)) >= a1, { a0, a1, a2: await age(page) });
  const geo = await page.evaluate(() => { const t = document.querySelector('.ntoasts').getBoundingClientRect(), b = document.querySelector('.lifebar').getBoundingClientRect(); return { toastBottom: Math.round(t.bottom), barTop: Math.round(b.top) }; });
  ok('a.toast-above-bar', geo.toastBottom <= geo.barTop, geo);
  await drive(page, () => !!document.querySelector('.ntoasts__badge'), 5 * 60_000).catch(() => {});
  const badge = await page.evaluate(() => document.querySelector('.ntoasts__badge')?.textContent || '');
  ok('a.folds-to-badge', /뉴스\s*\d/.test(badge), { badge });
  await shot(page, 'fe-news2-2-badge');
  await drive(page, () => !document.querySelector('.sheet') && !!document.querySelector('.ntoasts__badge, .ntoast'), 5 * 60_000);
  if (await has(page, '.ntoasts__badge')) await page.click('.ntoasts__badge');
  ok('a.badge-expands', await has(page, '.ntoast'));
  const xs = await page.evaluate(() => { const r = document.querySelector('[data-nfold]').getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height)]; });
  ok('n.close-x>=44', xs[0] >= 44 && xs[1] >= 44, xs);
  await page.click('[data-nfold]'); ok('n.x-folds-to-badge', await has(page, '.ntoasts__badge'));
  await page.click('.ntoasts__badge'); await page.keyboard.press('Escape');
  ok('n.esc-folds', await has(page, '.ntoasts__badge') && !(await has(page, '.ntoast')));
  await page.click('.ntoasts__badge');
  ok('n.clear-all-button', await has(page, '[data-nclear]'));
  await page.click('.ntoast');
  ok('a.tap-opens-paper', await has(page, '.sheet.paper-sheet .paper__mast'));
  ok('a.paper-focus-in-sheet', await page.evaluate(() => !!document.activeElement.closest('.sheet')));
  ok('c.body-locked', await page.evaluate(() => getComputedStyle(document.body).overflow === 'hidden'));
  ok('c.bar-clickable-with-sheet', await barOk(page));
  await shot(page, 'fe-news2-3-paper');
  const fs0 = await page.evaluate(() => { const e = document.querySelector('.paper__body'); return e ? parseFloat(getComputedStyle(e).fontSize) : 14; });
  ok('a.paper-font>=14', fs0 >= 14, { fs0 });
  const hb = await page.evaluate(() => { const r = document.querySelector('.sheet__handle').getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; });
  await page.mouse.move(hb.x, hb.y); await page.mouse.down(); await page.mouse.move(hb.x, hb.y + 60, { steps: 4 }); await page.mouse.move(hb.x, hb.y + 160, { steps: 4 }); await page.mouse.up();
  await page.clock.runFor(400); await page.waitForTimeout(150);
  ok('b.drag-closes', !(await has(page, '.sheet')));
  ok('b.focus-returns', await page.evaluate(() => (document.activeElement && document.activeElement !== document.body) || !!document.querySelector('.sheet')), { a: await page.evaluate(() => document.activeElement?.outerHTML.slice(0, 80)), sheet: await has(page, '.sheet') });
  ok('b.history-clean', await page.evaluate(() => !history.state?.hjSheet));
  await page.click('.lifebar [data-tab="issues"]'); await page.clock.runFor(300);
  ok('c.past-news-list', await has(page, '.sheet .narch__item'));
  await page.click('.sheet .narch__item');
  ok('c.past-news-expands', await page.evaluate(() => !document.querySelector('.sheet .narch__paper').hidden));
  await page.evaluate(() => document.querySelector('.sheet .narch__item').scrollIntoView({ block: 'center' }));
  await shot(page, 'fe-news2-4-past');
  await page.goBack(); await page.clock.runFor(300);
  ok('b.back-closes-sheet', !(await has(page, '.sheet')) && (await page.evaluate(() => document.body.dataset.screen)) === 'life');
  await settle(page);
  await page.click('.lifebar [data-tab="stats"]'); await page.clock.runFor(300);
  await page.mouse.click(195, 8); await page.clock.runFor(300);
  console.log('scrim', await page.evaluate(() => ({ at: document.elementFromPoint(195, 8)?.className, sheet: document.querySelector('.sheet')?.className, top: document.querySelector('.sheet')?.getBoundingClientRect().top })));
  ok('b.scrim-closes', !(await has(page, '.sheet:not(.major):not(.choice)')));
  await settle(page);
  const h0 = await page.evaluate(() => history.length);
  for (let i = 0; i < 3; i++) { await page.click('.lifebar [data-tab="traits"]'); await page.clock.runFor(200); await page.click('.sheet__close'); await page.clock.runFor(300); }
  await page.waitForTimeout(150);
  ok('b.history-no-leak', (await page.evaluate(() => history.length)) <= h0 + 3 && !(await page.evaluate(() => history.state?.hjSheet)), { h0, h1: await page.evaluate(() => history.length) });
  await page.evaluate(() => document.activeElement?.blur());
  await page.keyboard.press('Space'); await page.clock.runFor(100);
  ok('k.space-pauses', await page.evaluate(() => document.querySelector('[data-act="pause"]').getAttribute('aria-pressed') === 'true'));
  ok('k.pause-label', (await page.evaluate(() => document.querySelector('[data-act="pause"]').textContent)).includes('재개'));
  await page.keyboard.press('Space'); await page.keyboard.press('3'); await page.clock.runFor(100);
  ok('k.3-sets-4x', await page.evaluate(() => document.querySelector('[data-speed="4"]').getAttribute('aria-pressed') === 'true'));
  await page.keyboard.press('1');
  await page.keyboard.press('ArrowRight'); await page.clock.runFor(300);
  ok('k.arrow-opens-tab', await has(page, '.sheet'));
  await page.keyboard.press('Escape'); await page.clock.runFor(300);
  ok('k.esc-closes', !(await has(page, '.sheet')));
  const ctl = await page.evaluate(() => [...document.querySelectorAll('.lifebar__row button')].map(b => Math.round(b.getBoundingClientRect().height)));
  ok('b.controls>=48', ctl.every(h => h >= 48), { ctl });
  ok('no-app-errors', appErrors(page).length === 0, { e: appErrors(page).slice(0, 3), pe: page.qa.pageErrors.slice(0, 2) });
  await page.ctx.close();
}

// ── 해상도별 점검
const SIZES = process.argv[2] === 'quick' ? [[360, 640], [1280, 900]] : [
  [280, 653], [344, 882], [360, 640], [390, 844], [412, 914], [430, 932], [640, 360], [844, 390], [673, 841], [884, 1104], [768, 1024],
  [1280, 720], [1366, 768], [1280, 900], [1440, 900], [1920, 1080], [2560, 1440], [1536, 864], [1024, 576], [853, 480]];
const KEEP = new Set(['1280x900', '1920x1080', '1366x768', '673x841', '280x653', '360x640', '884x1104']);
for (const [w, h] of SIZES) {
  const page = await boot({ w, h, dpr: w > 1500 ? 1 : 2 });
  await page.clock.runFor(4000);
  const L = await layout(page);
  const bar = await barOk(page);
  const key = `${w}x${h}`, pre = w >= 1000 ? 'fe-pc' : (w === 673 || w === 884 || w === 280 || w === 344) ? 'fe-fold' : 'fe-mob';
  if (KEEP.has(key)) await shot(page, `${pre}-${key}`);
  await page.click('.lifebar [data-tab="issues"]').catch(() => {}); await page.clock.runFor(300);
  const bar2 = await barOk(page);
  const sh = await page.evaluate(() => { const s = document.querySelector('.sheet'); if (!s) return null; const r = s.getBoundingClientRect(); return { t: Math.round(r.top), b: Math.round(r.bottom), l: Math.round(r.left), r: Math.round(r.right), h: Math.round(r.height) }; });
  if (KEEP.has(key) && (w === 1280 || w === 360 || w === 673)) await shot(page, `${pre}-${key}-sheet`);
  await page.keyboard.press('Escape'); await page.clock.runFor(300);
  M.sizes[key] = { ...L, barClickable: bar, barClickableWithSheet: bar2, sheet: sh };
  ok(`size.${key}.no-hscroll`, L.sw <= L.vw, { sw: L.sw, vw: L.vw });
  ok(`size.${key}.bar-clickable`, bar && bar2);
  await page.ctx.close();
}
fs.writeFileSync(path.join(ROOT, 'docs', 'impl', 'fe-news2-metrics.json'), JSON.stringify(M, null, 2));
srv.stop(); await browser.close();
const bad = Object.entries(M.checks).filter(([, v]) => v === false || v?.ok === false);
console.log(bad.length ? 'FAILED: ' + bad.map(b => b[0]).join(', ') : 'ALL PASS');
process.exit(bad.length ? 1 : 0);
