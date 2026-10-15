// CPU 프로파일(자체 시간 상위 함수) — 연 진행 처리 비용 확인용. node tests/e2e/fe-prof.mjs
import { launch, startServer, openPage, waitScreen, seedInit, presetInit, SEEDS } from './helpers.mjs';
const browser = await launch(), srv = await startServer();
const page = await openPage(browser, srv.url, { clock: true, init: seedInit(SEEDS.plain) + presetInit({ seen19: true, speed: 4, auto: true }) });
await waitScreen(page, 'home'); await page.click('[data-go="born"]'); await waitScreen(page, 'birth'); await page.click('[data-act="start"]'); await waitScreen(page, 'life');
const cdp = await page.ctx.newCDPSession(page);
await cdp.send('Profiler.enable'); await cdp.send('Profiler.start');
for (let i = 0; i < 160; i++) await page.clock.runFor(500);
const { profile } = await cdp.send('Profiler.stop');
const self = new Map(); const dt = profile.timeDeltas; const byId = new Map(profile.nodes.map(n => [n.id, n]));
profile.samples.forEach((id, i) => { const n = byId.get(id), k = `${n.callFrame.functionName || '(anon)'} ${n.callFrame.url.split('/').pop()}:${n.callFrame.lineNumber}`; self.set(k, (self.get(k) || 0) + (dt[i] || 0)); });
console.log([...self.entries()].sort((a, b) => b[1] - a[1]).slice(0, 18).map(([k, v]) => `${(v / 1000).toFixed(0).padStart(6)}ms ${k}`).join('\n'));
srv.stop(); await browser.close();
