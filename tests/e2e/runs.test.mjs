// E2E-7 반복 완주: 무작위 시드 3회(방치 1× / 자동결정 4× / 직접 선택 4×) — 콘솔 에러·pageerror 0, 금지 API 호출 0, 결산~도움 시트까지.
import test from 'node:test';
import {
  startServer, launch, openPage, appErrors, screen, waitScreen, Sim, checks, saveJson, presetInit, forbiddenHits, RE_MONEY, pageText,
} from './helpers.mjs';

let srv, br;
test.before(async () => { srv = await startServer(); br = await launch(); });
test.after(async () => { await br?.close(); srv?.stop(); });

async function fullRun(mode) {
  const settings = mode === 'idle' ? { seen19: true, speed: 1, auto: false } : { seen19: true, speed: 4, auto: mode === 'auto' };
  const page = await openPage(br, srv.url, { clock: true, init: presetInit(settings) });
  await page.ctx.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: srv.url.slice(0, -1) });
  const sim = new Sim(page);
  const log = { mode, steps: [] };
  const step = s => log.steps.push(s);
  await waitScreen(page, 'home'); step('home');
  await page.click('[data-go="born"]'); await waitScreen(page, 'birth'); step('birth');
  await sim.adv(200);
  await page.click('[data-act="start"]'); await waitScreen(page, 'life'); step('life');
  let guard = 0, picks = 0;
  while ((await screen(page)) === 'life' && sim.t < 25 * 60_000) {
    if (mode === 'manual' && await page.evaluate(() => !!document.querySelector('.sheet.choice .options:not(.is-done)'))) {
      await sim.adv(800);
      if (await page.evaluate(() => !!document.querySelector('.sheet.choice .options:not(.is-done)'))) { await page.click('[data-opt]:nth-of-type(1)').catch(() => {}); picks++; }
      await sim.adv(1600);
    } else await sim.adv(mode === 'idle' ? 1000 : 500);
    if (++guard > 200_000) break;
  }
  log.lifeFakeSec = Math.round(sim.t / 1000);
  await waitScreen(page, 'death'); step('death');
  await page.click('[data-act="sum"]'); await waitScreen(page, 'summary'); step('summary');
  const sum = await pageText(page, '.summary');
  log.fh = forbiddenHits(sum);
  for (const kind of ['birth', 'verdict', 'timeline']) {
    await page.click(`[data-card="${kind}"]`);
    for (let i = 0; i < 40 && !(await page.evaluate(() => (document.querySelector('.share__img')?.src || '').startsWith('data:'))); i++) { await sim.adv(300); await page.waitForTimeout(60); }
    const k = await page.evaluate(() => ({ ok: (document.querySelector('.share__img')?.src || '').startsWith('data:image/png'), text: document.querySelector('.share__text').value, canvas: window.__qa.canvas.slice() }));
    log['card_' + kind] = k.ok;
    log['cardMoney_' + kind] = RE_MONEY.test([k.text, ...k.canvas].join('\n'));
    log['cardRank_' + kind] = forbiddenHits([k.text, ...k.canvas].join('\n')).length;
    await page.evaluate(() => { window.__qa.canvas = []; });
    await page.keyboard.press('Escape');
  }
  step('cards');
  await page.click('.actionbar [data-go="archive"]'); await waitScreen(page, 'archive');
  await page.click('[data-rec="0"]'); await page.waitForSelector('.topbar__title'); step('archive-detail');
  log.detailMain = await page.evaluate(() => document.querySelector('.verdict__main')?.textContent);
  log.liveMain = sum.match(/주문\n+(.*)/)?.[1];
  await page.click('.actionbar [data-go="archive"]'); await waitScreen(page, 'archive');
  const rec = await page.evaluate(() => JSON.parse(localStorage.getItem('hj.v1.records') || '[]')[0]);
  log.seed = rec?.seed; log.deathAge = rec?.deathAge; log.choices = rec?.choices?.length; log.picks = picks;
  await page.click('.topbar [data-go="home"]'); await waitScreen(page, 'home');
  await page.click('[data-go="codex"]'); await page.waitForSelector('table.stat-table'); step('codex');
  await page.click('.topbar [data-go="home"]'); await waitScreen(page, 'home');
  await page.click('[data-go="settings"]'); await waitScreen(page, 'settings');
  // 다시 태어나기(두 번째 생애 시작 가능)
  await page.click('.topbar [data-go="home"]'); await waitScreen(page, 'home');
  await page.click('[data-go="born"]'); await waitScreen(page, 'birth'); await page.click('[data-act="start"]'); await waitScreen(page, 'life'); step('second-life');
  const age0 = await page.evaluate(() => document.querySelector('[data-hud=age]').textContent);
  log.secondLifeAge0 = age0;
  log.errors = appErrors(page).concat(page.qa.pageErrors);
  log.dialogs = (await page.evaluate(() => window.__qa.dialogs)).length + page.qa.dialogs.length;
  await page.ctx.close();
  return log;
}

test('E2E-7a 무작위 시드 3회 전체 흐름: 콘솔 에러·pageerror 0', { timeout: 900_000 }, async () => {
  const c = checks('runs');
  const logs = await Promise.all(['idle', 'auto', 'manual'].map(fullRun));
  saveJson('runs-raw.json', logs);
  for (const l of logs) {
    const id = `[${l.mode} seed ${l.seed} 향년 ${l.deathAge}]`;
    c(`${id} 전 단계 통과(${l.steps.join('>')})`, l.steps.length >= 9, l.steps.join('>'));
    c(`${id} 콘솔·페이지 에러 0`, l.errors.length === 0, l.errors.join('|'));
    c(`${id} alert/confirm/prompt/print 0`, l.dialogs === 0, l.dialogs);
    c(`${id} 공유 카드 3종 렌더`, l.card_birth && l.card_verdict && l.card_timeline);
    c(`${id} 카드·문구에 금액·순위·직급 없음`, !l.cardMoney_birth && !l.cardMoney_verdict && !l.cardMoney_timeline && !l.cardRank_birth && !l.cardRank_verdict && !l.cardRank_timeline, JSON.stringify([l.cardMoney_birth, l.cardMoney_verdict, l.cardMoney_timeline, l.cardRank_birth, l.cardRank_verdict, l.cardRank_timeline]));
    c(`${id} 결산에 순위·직급·백분위 없음`, l.fh.length === 0, l.fh.join(' | '));
    c(`${id} 기록관 재열람 판정문 일치`, !!l.detailMain && l.detailMain === l.liveMain, `${l.detailMain} | ${l.liveMain}`);
    c(`${id} 두 번째 생애 0세로 시작`, l.secondLifeAge0 === '0', l.secondLifeAge0);
  }
  c.note('3회 요약', logs.map(l => ({ mode: l.mode, seed: l.seed, deathAge: l.deathAge, choices: l.choices, picks: l.picks, fakeSec: l.lifeFakeSec })));
  c.done();
});
