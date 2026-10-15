// E2E-8 UX 보조 점검: 뒤로 가기, 공유 시트 접힘, 출생 화면 메인 스레드 점유(CPU 4× 스로틀), 데이터 손실 경로.
import test from 'node:test';
import {
  startServer, launch, openPage, appErrors, screen, waitScreen, shot, Sim, seedInit, presetInit, SEEDS, checks,
} from './helpers.mjs';

let srv, br;
test.before(async () => { srv = await startServer(); br = await launch(); });
test.after(async () => { await br?.close(); srv?.stop(); });

test('E2E-8a 브라우저 뒤로 가기(모바일 뒤로 제스처): 화면 이력이 있는가', { timeout: 120_000 }, async () => {
  const c = checks('ux-back');
  const ctx = await br.newContext({ viewport: { width: 390, height: 844 }, locale: 'ko-KR' });
  const page = await ctx.newPage();
  await page.goto('about:blank');
  await page.goto(srv.url, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.body.dataset.screen === 'home');
  await page.click('[data-go="settings"]'); await page.waitForFunction(() => document.body.dataset.screen === 'settings');
  const len = await page.evaluate(() => history.length);
  await page.goBack();
  await page.waitForTimeout(500);
  const where = await page.evaluate(() => ({ href: location.href, screen: document.body?.dataset?.screen ?? null }));
  c.note('설정 화면에서 뒤로 가기 결과', { historyLength: len, ...where });
  c('설정 → 뒤로 가기 → 앱 안 홈으로 복귀(사이트 이탈 아님)', /localhost/.test(where.href) && where.screen === 'home', JSON.stringify(where));
  await ctx.close();
  c.done();
});

test('E2E-8b 공유 시트: [문구 복사]·[공유하기]가 스크롤 없이 보이는가(360×740, 390×844)', { timeout: 180_000 }, async () => {
  const c = checks('ux-share-fold');
  for (const [w, h] of [[360, 740], [390, 844], [430, 932]]) {
    const page = await openPage(br, srv.url, { w, h, clock: true, init: seedInit(SEEDS.plain) + presetInit({ seen19: true }) });
    const sim = new Sim(page);
    await waitScreen(page, 'home'); await page.click('[data-go="born"]'); await waitScreen(page, 'birth'); await sim.adv(200);
    await page.click('[data-act="share"]');
    for (let i = 0; i < 30 && !(await page.evaluate(() => (document.querySelector('.share__img')?.src || '').startsWith('data:'))); i++) { await sim.adv(300); await page.waitForTimeout(80); }
    await page.waitForTimeout(500);
    const g = await page.evaluate(() => { const a = document.querySelector('.share__actions').getBoundingClientRect(); const b = document.querySelector('.sheet__body'); const s = document.querySelector('.sheet').getBoundingClientRect(); return { actionsTop: Math.round(a.top), actionsBottom: Math.round(a.bottom), vh: innerHeight, sheetTop: Math.round(s.top), scrolls: b.scrollHeight > b.clientHeight, hiddenBy: Math.round(b.scrollHeight - b.clientHeight) }; });
    c.note(`${w}×${h} 공유 시트`, g);
    c(`${w}×${h}: 공유 시트의 문구 복사 버튼이 첫 화면에 완전히 보임`, g.actionsBottom <= g.vh, JSON.stringify(g));
    await shot(page, `ux-share-${w}x${h}`);
    await page.ctx.close();
  }
  c.done();
});

test('E2E-8c 출생 화면 메인 스레드 점유(peers 계산): CPU 4× 스로틀', { timeout: 120_000 }, async () => {
  const c = checks('ux-birth-jank');
  const res = [];
  for (const rate of [1, 4]) {
    const page = await openPage(br, srv.url, { init: presetInit({ seen19: true }) });
    const cdp = await page.ctx.newCDPSession(page);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate });
    await page.evaluate(() => { window.__lt = []; new PerformanceObserver(l => l.getEntries().forEach(e => window.__lt.push(Math.round(e.duration)))).observe({ entryTypes: ['longtask'] }); });
    await waitScreen(page, 'home');
    await page.click('[data-go="born"]'); await waitScreen(page, 'birth');
    await page.waitForFunction(() => document.querySelectorAll('[data-peers] .peer').length === 3 && !/찾고 있습니다/.test(document.querySelector('[data-peers]').textContent), null, { timeout: 20_000 });
    await page.waitForTimeout(300);
    const lt = await page.evaluate(() => window.__lt);
    res.push({ rate, longTasks: lt, max: Math.max(0, ...lt) });
    await page.ctx.close();
  }
  c.note('출생 화면 long task(ms)', res);
  c('CPU 1×: 출생 화면 long task < 200ms', res[0].max < 200, JSON.stringify(res[0]));
  c('CPU 4× 스로틀(중저가 폰 근사): long task < 500ms(출생 화면 입력 지연)', res[1].max < 500, JSON.stringify(res[1]));
  c.done();
});
