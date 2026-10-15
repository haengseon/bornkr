// QA 리뷰 UI 회귀 실측(테스트 러너 대상 아님): node tests/e2e/qa-ui.mjs [before|after]
// 가장 긴 선택지·결과 문구(DOM 치환)로 7개 해상도에서 [확인] 위에 결과 마지막 줄이 완전히 보이는지, 도감 0건 필터, 홈 복귀 scrollY 를 잰다.
// 결과: docs/impl/qa-ui-<label>.json, 스크린샷 docs/impl/shots/qa-ui-<label>-*.png
import fs from 'node:fs';
import path from 'node:path';
import { launch, startServer, openPage, toBirth, startLife, ROOT, seedInit } from './helpers.mjs';

const label = process.argv[2] || 'after';
const SIZES = (process.env.SIZES || "360x640,360x800,390x844,430x932,768x1024,1366x768,1920x1080").split(",").map(s => s.split("x").map(Number));
const SHOT = ['360x800', '768x1024'];
const LONG_OPT = '아주 긴 선택지 문구입니다. 가장 긴 선택 문장이 여러 줄로 줄바꿈되어도 화면 안에서 잘리거나 가려지지 않아야 합니다. 이 문장은 검증용 합성 데이터입니다.';
const LONG_RES = '결과 첫째 문장은 충분히 깁니다. 둘째 문장도 두 줄 이상으로 이어지도록 길게 씁니다. 셋째 문장은 한 번 더 늘려 확인 버튼 아래로 밀리는지 봅니다. 마지막 문장은 반드시 끝까지 보여야 합니다.';
const browser = await launch(), srv = await startServer();
const res = {};
const out = (n) => path.join(ROOT, 'docs', 'impl', 'shots', n);

// 선택 결과 가시성 측정(페이지 안)
const measure = () => {
  const sheet = document.querySelector('.sheet.choice');
  const resEl = document.querySelector('.choice__result, .reveal__front p');
  const ok = document.querySelector('.choice__ok');
  if (!sheet || !resEl) return { err: 'no result el' };
  const tn = []; const w = document.createTreeWalker(resEl, NodeFilter.SHOW_TEXT); let n; while ((n = w.nextNode())) if (n.textContent.trim()) tn.push(n);
  const last = tn.at(-1), r = document.createRange(); r.setStart(last, Math.max(0, last.length - 4)); r.setEnd(last, last.length);
  const rects = [...r.getClientRects()], rc = rects.at(-1);
  const ob = ok?.getBoundingClientRect();
  const top = rc && document.elementFromPoint(rc.left + rc.width / 2, rc.top + rc.height / 2);
  const bar = document.querySelector('.lifebar')?.getBoundingClientRect();
  const sh = sheet.getBoundingClientRect();
  const visible = !!rc && rc.top >= sh.top && rc.bottom <= (ob ? ob.top + 1 : sh.bottom) && (!bar || rc.bottom <= bar.top + 1 || rc.top >= bar.bottom) && !!top && resEl.contains(top);
  return { visible, lastRect: rc && [Math.round(rc.top), Math.round(rc.bottom)], okTop: ob && Math.round(ob.top), okBottom: ob && Math.round(ob.bottom), barTop: bar && Math.round(bar.top), vh: innerHeight, sheet: [Math.round(sh.top), Math.round(sh.bottom)], bodyScrolls: (() => { const b = sheet.querySelector('.sheet__body'); return b ? b.scrollHeight > b.clientHeight + 1 : null; })(), topEl: top?.className || top?.tagName, okVisible: ob ? (() => { const e = document.elementFromPoint(ob.left + ob.width / 2, ob.top + ob.height / 2); return !!e?.closest('.choice__ok'); })() : null };
};

for (const [w, h] of SIZES) {
  const key = `${w}x${h}`, r = res[key] = {};
  const page = await openPage(browser, srv.url, { w, h, clock: true, noAutoMajor: true, url: '?motion=off', init: seedInit(42) });
  await toBirth(page); await page.clock.runFor(1500); await startLife(page); await page.clock.runFor(2000);
  const seen = new Set();
  for (let guard = 0; guard < 60 && seen.size < 2; guard++) {
    for (let t = 0; t < 14 * 60_000 && !(await page.evaluate(() => document.querySelector('.sheet.choice .option'))); t += 500) {
      if (await page.evaluate(() => document.querySelector('.major__ok'))) await page.click('.major__ok').catch(() => {});
      await page.clock.runFor(500);
    }
    await page.clock.runFor(900);
    const kind = await page.evaluate(() => document.querySelector('.sheet.choice--major') ? 'major' : 'plain');
    if (seen.has(kind)) {
      await page.click('.sheet.choice .option'); await page.clock.runFor(900);
      for (let i = 0; i < 6 && await page.evaluate(() => document.querySelector('.choice__ok, .major__ok')); i++) { await page.click('.choice__ok, .major__ok').catch(() => {}); await page.clock.runFor(500); }
      continue;
    }
    seen.add(kind); console.log(w, 'found', kind);
    await page.evaluate(t => { document.querySelectorAll('.sheet.choice .option__label').forEach(e => { e.textContent = t; }); }, LONG_OPT);
    const before = await page.evaluate(() => { const b = document.querySelector('.sheet.choice .sheet__body'); const o = [...document.querySelectorAll('.sheet.choice .option')].at(-1).getBoundingClientRect(); return { lastOptionBottom: Math.round(o.bottom), vh: innerHeight, bodyScrolls: b.scrollHeight > b.clientHeight + 1 }; });
    if (SHOT.includes(key)) await page.screenshot({ path: out(`qa-ui-${label}-${key}-${kind}-pick.png`) });
    await page.click('.sheet.choice .option'); await page.clock.runFor(900);
    await page.evaluate(t => { const e = document.querySelector('.choice__result, .reveal__front p'); if (e) { const tag = e.querySelector('.tag'); e.textContent = t; if (tag) e.prepend(tag); } }, LONG_RES);
    await page.clock.runFor(300);
    const m = await page.evaluate(measure);
    // 내부 스크롤로도 마지막 줄까지 닿는지(본문 끝으로 스크롤 뒤 재측정)
    await page.evaluate(() => { const b = document.querySelector('.sheet.choice .sheet__body'); if (b) b.scrollTop = b.scrollHeight; });
    const m2 = await page.evaluate(measure);
    const focus = await page.evaluate(() => document.activeElement?.className || document.activeElement?.tagName);
    const bodyLock = await page.evaluate(() => document.body.classList.contains('is-locked'));
    if (SHOT.includes(key)) await page.screenshot({ path: out(`qa-ui-${label}-${key}-${kind}-result.png`) });
    r[kind] = { before, result: m, resultAfterScrollEnd: m2, focus, bodyLock };
    await page.click('.choice__ok').catch(() => {}); await page.clock.runFor(600);
    for (let i = 0; i < 4 && await page.evaluate(() => document.querySelector('.major__ok')); i++) { await page.click('.major__ok').catch(() => {}); await page.clock.runFor(500); }
  }
  // 도감 0건 필터 · 홈 복귀 스크롤
  const p2 = await openPage(browser, srv.url, { w, h, clock: true, url: '?motion=off' });
  await p2.click('[data-go="codex"]').catch(() => {}); await p2.clock.runFor(800);
  const chip = await p2.evaluate(() => [...document.querySelectorAll('button')].filter(b => /추정/.test(b.textContent)).map(b => b.textContent.trim().slice(0, 20)));
  const btn = p2.locator('button', { hasText: '추정' }).first();
  if (await btn.count()) { await btn.click(); await p2.clock.runFor(500); }
  r.codex = await p2.evaluate(() => {
    const secs = [...document.querySelectorAll('.codex section, .codex__sec, [data-screen="codex"] section')];
    const empty = secs.filter(s => !s.querySelector('tr td, li, .stat-row, [data-key], .codex__row, .row')).length;
    return { text: document.body.innerText.match(/(검색 결과[^\n]*|전체 \d+개|\d+개)/g)?.slice(0, 4), sections: secs.length, emptyHeaders: empty };
  });
  r.chip = chip;
  await p2.evaluate(() => scrollTo(0, 400)); await p2.click('[data-go="home"]').catch(() => {}); await p2.clock.runFor(800);
  r.homeScrollY = await p2.evaluate(() => scrollY) + '/' + await p2.evaluate(() => document.body.dataset.screen);
  await p2.ctx.close();
  await page.ctx.close();
  console.log(key, JSON.stringify(r));
}
fs.writeFileSync(path.join(ROOT, 'docs', 'impl', `qa-ui-${label}.json`), JSON.stringify(res, null, 1));
srv.stop(); await browser.close();
