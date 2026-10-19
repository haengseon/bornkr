// 진행 화면 메인 스레드 이벤트 합계(Tracing). 사용: node tests/qa/perf-ui-trace.mjs [sec=8] [fake|idle|real]
//   fake: 가짜 시계 500ms씩(E2E-7 조건) · idle: 가짜 시계 멈춤 · real: 실제 시계 2×(실사용 조건)
import { startServer, launch, openPage, waitScreen, Sim, seedInit, presetInit, SEEDS } from '../e2e/helpers.mjs';
const sec = Number(process.argv[2] || 8), mode = process.argv[3] || 'fake', idle = mode !== 'fake', real = mode === 'real';
const srv = await startServer(), br = await launch();
try {
  const page = await openPage(br, srv.url, { clock: !real, init: seedInit(SEEDS.long) + presetInit({ seen19: true, speed: real ? 2 : 4, auto: true }) });
  const cdp = await page.ctx.newCDPSession(page);
  const sim = new Sim(page);
  await waitScreen(page, 'home');
  await page.click('[data-go="born"]'); await waitScreen(page, 'birth');
  await page.click('[data-act="start"]'); await waitScreen(page, 'life');
  if (real) await page.waitForTimeout(3000); else await sim.adv(3000);
  if (process.env.EXTRA_CSS) await page.addStyleTag({ content: process.env.EXTRA_CSS });   // 실험용 CSS 주입
  const events = [];
  cdp.on('Tracing.dataCollected', e => events.push(...e.value));
  const done = new Promise(r => cdp.once('Tracing.tracingComplete', r));
  await cdp.send('Tracing.start', { categories: process.env.CATS || 'devtools.timeline,disabled-by-default-devtools.timeline', transferMode: 'ReportEvents' });
  const t0 = Date.now(); let n = 0; const age0 = await page.evaluate(() => +document.querySelector('[data-hud=age]')?.textContent);
  while (Date.now() - t0 < sec * 1000) { if (idle) await page.waitForTimeout(100); else { await sim.adv(500); await page.evaluate(() => +document.querySelector('[data-hud=age]')?.textContent); } n++; }
  await cdp.send('Tracing.end'); await done;
  if (process.env.DUMP) (await import('node:fs')).writeFileSync(process.env.DUMP, JSON.stringify(events));
  const main = events.filter(e => e.ph === 'X' && e.dur);
  const tid = String(events.find(e => e.ph === 'M' && e.name === 'thread_name' && e.args?.name === 'CrRendererMain')?.tid);
  const sum = {};
  for (const e of main) if (String(e.tid) === tid) sum[e.name] = (sum[e.name] || 0) + e.dur / 1000;
  const age1 = await page.evaluate(() => +document.querySelector('[data-hud=age]')?.textContent);
  console.log({ realSec: sec, iterations: n, years: age1 - age0 }, Object.entries(sum).sort((a, b) => b[1] - a[1]).slice(0, 30).map(([k, v]) => `${v.toFixed(0).padStart(7)}ms ${k}`).join('\n'));
} finally { await br.close(); srv.stop(); }
