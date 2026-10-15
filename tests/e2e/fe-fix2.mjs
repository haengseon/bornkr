// FE fix2 검증 스크립트(테스트 러너 대상 아님): node tests/e2e/fe-fix2.mjs → docs/impl/shots/fe-fix2-*.png, docs/impl/fe-fix2-metrics.json
import path from 'node:path';
import fs from 'node:fs';
import { launch, startServer, openPage, toBirth, startLife, ROOT, appErrors, seedInit } from './helpers.mjs';

const OUT = path.join(ROOT, 'docs', 'impl', 'shots');
fs.mkdirSync(OUT, { recursive: true });
const M = { checks: {} };
const ok = (k, v, extra) => { M.checks[k] = extra === undefined ? v : { ok: v, ...extra }; console.log(v ? 'PASS' : 'FAIL', k, extra ? JSON.stringify(extra) : ''); };
const browser = await launch();
const srv = await startServer();

async function boot(opts = {}) {
  const page = await openPage(browser, srv.url, { clock: true, noAutoMajor: true, url: '?motion=off', init: seedInit(42), ...opts });
  await toBirth(page); await page.clock.runFor(1500); await startLife(page);
  await page.evaluate(() => { const s = JSON.parse(localStorage.getItem('hj.v1.settings') || '{}'); if (s.auto) document.querySelector('[data-act="auto"]')?.click(); });
  return page;
}
const has = (page, sel) => page.evaluate(s => !!document.querySelector(s), sel);
const age = page => page.evaluate(() => +document.querySelector('[data-hud="age"]')?.textContent || 0);
// 선택 시트가 뜨면 한 번 탭 → [확인], 큰 사건 [확인]을 눌러 진행. until() 이 참이면 멈춘다.
async function drive(page, until, max = 20 * 60_000) {
  for (let t = 0; t < max; t += 500) {
    if (await page.evaluate(until)) return t;
    if (await has(page, '.sheet.choice .option:not([disabled])')) { await page.click('.sheet.choice .option:not([disabled])').catch(() => {}); await page.clock.runFor(200); continue; }
    if (await has(page, '.major__ok')) { await page.click('.major__ok').catch(() => {}); await page.clock.runFor(200); continue; }
    if (await has(page, '.npop:not(.is-min) [data-npop="close"]') && !(await page.evaluate(until))) { await page.click('.npop [data-npop="close"]').catch(() => {}); await page.clock.runFor(200); continue; }
    await page.clock.runFor(500);
  }
  throw new Error('drive timeout');
}
const lum = c => { const [r, g, b] = c.map(v => { v /= 255; return v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }); return .2126 * r + .7152 * g + .0722 * b; };
const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };

// ── (e) 지표 칩 높이 전→후 + 스크린샷 1
{
  const page = await boot();
  const h = () => page.evaluate(() => Math.round(document.querySelector('.hud .stats').getBoundingClientRect().height));
  const hud = () => page.evaluate(() => Math.round(document.querySelector('.hud').getBoundingClientRect().height));
  const after = { stats: await h(), hud: await hud() };
  await page.screenshot({ path: path.join(OUT, 'fe-fix2-1-stats.png') });
  await page.evaluate(() => { for (const ss of document.styleSheets) { try { const r = ss.cssRules; for (let i = r.length - 1; i >= 0; i--) if (/^\.hud \.stat/.test(r[i].selectorText || '')) ss.deleteRule(i); } catch {} } });
  const before = { stats: await h(), hud: await hud() };
  M.statChips = { before, after };
  ok('e.stats-height-reduced', after.stats < before.stats, { before, after });
  await page.ctx.close();
}

// ── (a)(c)(f) 비자동: 뉴스 팝업 10분 유지, 하단 탭 elementFromPoint, 시계 정지, 신문 대비
{
  const page = await boot();
  await drive(page, () => !!document.querySelector('.npop:not(.is-min)'));
  const a0 = await age(page);
  await page.screenshot({ path: path.join(OUT, 'fe-fix2-2-news.png') });
  await page.clock.runFor(10 * 60_000);
  ok('a.news-stays-10min', await has(page, '.npop:not(.is-min)') && (await age(page)) === a0, { age0: a0, age1: await age(page) });
  const c = await page.evaluate(() => {
    const px = s => getComputedStyle(document.querySelector(s));
    const rgb = v => v.match(/[\d.]+/g).slice(0, 3).map(Number);
    const bg = rgb(px('.npop__card').backgroundColor);
    const out = {};
    for (const s of ['.npop__name', '.npop__meta', '.npop__head', '.npop__body', '.npop__impact', '.npop__tag']) { const e = document.querySelector(s); if (e) out[s] = { rgb: rgb(getComputedStyle(e).color), fs: parseFloat(getComputedStyle(e).fontSize) }; }
    return { bg, out, alpha: px('.npop__card').backgroundColor };
  });
  const rs = Object.fromEntries(Object.entries(c.out).map(([k, v]) => [k, { ratio: +ratio(v.rgb, c.bg).toFixed(1), fs: v.fs }]));
  M.newsContrast = { bg: c.bg, alpha: c.alpha, rs };
  ok('f.news-contrast>=4.5,fs>=14', Object.values(rs).every(r => r.ratio >= 4.5 && r.fs >= 14) && !/rgba\(.*,\s*0?\.\d+\)/.test(c.alpha), rs);
  // (c) 팝업 위 하단 탭
  const pt = await page.evaluate(() => { const r = document.querySelector('.tabbtn[data-tab="traits"]').getBoundingClientRect(); const x = r.x + r.width / 2, y = r.y + r.height / 2; const e = document.elementFromPoint(x, y); return { x, y, hit: e?.className, inBar: !!e?.closest('.lifebar') }; });
  ok('c.tab-hit-is-bar', pt.inBar, pt);
  await page.mouse.click(pt.x, pt.y);
  await page.clock.runFor(300);
  const sheetTitle = await page.evaluate(() => document.querySelector('.sheet .sheet__title')?.textContent);
  ok('c.tab-opens-sheet', /성향/.test(sheetTitle || ''), { sheetTitle, pressed: await page.evaluate(() => document.querySelector('.tabbtn[data-tab="traits"]').getAttribute('aria-pressed')) });
  const a1 = await age(page);
  await page.clock.runFor(60_000);
  ok('c.clock-stopped-while-open', (await age(page)) === a1, { a1, a2: await age(page) });
  await page.screenshot({ path: path.join(OUT, 'fe-fix2-3-tab-over-popup.png') });
  const single = await page.evaluate(() => document.querySelectorAll('.sheet .tabs, .sheet [role="tab"]').length);
  ok('j.no-duplicate-tabs-in-sheet', single === 0, { single });
  await page.ctx.close();
}

// ── (b) 선택지 1탭
{
  const page = await boot();
  await drive(page, () => !!document.querySelector('.sheet.choice .option'));
  await page.clock.runFor(50);
  const b = await page.evaluate(() => { const r = document.querySelector('.sheet.choice .option').getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; });
  await page.mouse.click(b.x, b.y);
  const picked = await page.evaluate(() => !!document.querySelector('.sheet.choice .option.is-picked'));
  ok('b.one-tap-picks', picked);
  // 이중 제출 방지: 곧바로 다시 눌러도 선택은 1회
  await page.mouse.click(b.x, b.y);
  ok('b.result-needs-confirm', await has(page, '.choice__ok'));
  await page.clock.runFor(60_000);
  ok('a.choice-result-stays', await has(page, '.sheet.choice .choice__ok'));
  await page.ctx.close();
}

// ── (d) 데스크톱 마우스 클릭으로 접기
{
  const page = await boot({ w: 1280, h: 900, hasTouch: false });
  await page.mouse.click(...(await page.evaluate(() => { const r = document.querySelector('.tabbtn[data-tab="stats"]').getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; })));
  await page.clock.runFor(300);
  const hpt = await page.evaluate(() => { const r = document.querySelector('.sheet__handle').getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; });
  const top = await page.evaluate(([x, y]) => document.elementFromPoint(x, y)?.className, hpt);
  await page.mouse.click(...hpt);
  const folded = await has(page, '.sheet.is-folded');
  await page.screenshot({ path: path.join(OUT, 'fe-fix2-4-desktop-fold.png') });
  const hpt2 = await page.evaluate(() => { const r = document.querySelector('.sheet__handle').getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; });
  await page.mouse.click(...hpt2);
  const unfolded = !(await has(page, '.sheet.is-folded'));
  await page.focus('.sheet__handle'); await page.keyboard.press('Enter');
  const kb = await has(page, '.sheet.is-folded');
  await page.keyboard.press('Space');
  const kb2 = !(await has(page, '.sheet.is-folded'));
  await page.keyboard.press('Escape');
  const esc = !(await has(page, '.sheet'));
  ok('d.handle-mouse-fold/unfold+Enter/Space/Esc', folded && unfolded && kb && kb2 && esc, { top, folded, unfolded, kb, kb2, esc });
  await page.ctx.close();
}

M.errors = [];
fs.writeFileSync(path.join(ROOT, 'docs', 'impl', 'fe-fix2-metrics.json'), JSON.stringify(M, null, 2));
await srv.stop(); await browser.close();
process.exit(Object.values(M.checks).every(v => v === true || v?.ok) ? 0 : 1);
