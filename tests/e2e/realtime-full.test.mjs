// E2E-2g 실시간 방치 완주(선택 실행, 약 15분): 가짜 시계가 못 보는 타이머 드리프트·렌더 비용까지 포함한 실제 소요.
//   실행: QA_REALTIME=1 node --test tests/e2e/realtime-full.test.mjs
import test from 'node:test';
import {
  startServer, launch, openPage, appErrors, screen, waitScreen, seedInit, presetInit, checks, saveJson,
} from './helpers.mjs';

const RUN = !!process.env.QA_REALTIME;
let srv, br;
test.before(async () => { if (!RUN) return; srv = await startServer(); br = await launch(); });
test.after(async () => { await br?.close(); srv?.stop(); });

async function run(seed) {
  const page = await openPage(br, srv.url, { init: seedInit(seed) + presetInit({ seen19: true, speed: 1, auto: false }) });
  await waitScreen(page, 'home');
  await page.click('[data-go="born"]'); await waitScreen(page, 'birth');
  await page.click('[data-act="start"]'); await waitScreen(page, 'life');
  const t0 = Date.now();
  let toastAt = null, deathAt = null, sumAt = null;
  while (Date.now() - t0 < 17 * 60_000) {
    const s = await page.evaluate(() => ({ sc: document.body.dataset.screen, toast: document.querySelector('.toast')?.textContent || '' })).catch(() => ({ sc: '?' }));
    if (toastAt == null && /시간이 다 되어/.test(s.toast)) toastAt = Date.now() - t0;
    if (deathAt == null && s.sc === 'death') deathAt = Date.now() - t0;
    if (s.sc === 'summary') { sumAt = Date.now() - t0; break; }
    await page.waitForTimeout(500);
  }
  const age = await page.evaluate(() => document.querySelector('.lifehead__years')?.textContent).catch(() => '');
  const errs = appErrors(page).concat(page.qa.pageErrors);
  await page.ctx.close();
  return { seed, deathAt, sumAt, toastAt, age, errs };
}

test('E2E-2g 실시간 방치 완주(1×): 시작 클릭 → 결산 진입', { skip: !RUN, timeout: 20 * 60_000 }, async () => {
  const c = checks('timing-realtime-full');
  const rs = await Promise.all([3, 1].map(run));
  const fmt = ms => ms == null ? '-' : `${Math.floor(ms / 60000)}:${String(Math.round(ms / 1000) % 60).padStart(2, '0')}`;
  for (const r of rs) {
    c(`seed ${r.seed}: 결산 진입 ≤ 15:00(실시간)`, r.sumAt != null && r.sumAt <= 900_000, `death ${fmt(r.deathAt)} summary ${fmt(r.sumAt)} toast ${fmt(r.toastAt)} (${r.age})`);
    c(`seed ${r.seed}: 에러 0`, r.errs.length === 0, r.errs.join('|'));
  }
  c.note('실시간 방치 완주', rs.map(r => ({ seed: r.seed, death: fmt(r.deathAt), summary: fmt(r.sumAt), toast: fmt(r.toastAt), age: r.age })));
  saveJson('timing-realtime-full-raw.json', rs);
  c.done();
});
