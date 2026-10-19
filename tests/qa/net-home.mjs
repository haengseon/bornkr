// 네트워크 스로틀별 홈 진입 시간(E2E-2f와 같은 조건). 사용: node tests/qa/net-home.mjs [경로=/] — 예: /dist/site/ (npm run build:site 뒤)
import { startServer, launch } from '../e2e/helpers.mjs';
const target = process.argv[2] || '/';
const profiles = [['LTE 12Mbps/70ms', 12 * 1024 * 1024 / 8, 70], ['Fast 4G 4Mbps/150ms', 4 * 1024 * 1024 / 8, 150], ['Slow 4G 1.6Mbps/150ms', 1.6 * 1024 * 1024 / 8, 150]];
const srv = await startServer(), br = await launch(), res = {};
try {
  for (const [name, bps, lat] of profiles) {
    const ctx = await br.newContext({ viewport: { width: 390, height: 844 }, locale: 'ko-KR' });
    const page = await ctx.newPage(), cdp = await ctx.newCDPSession(page);
    let bytes = 0, n = 0;
    cdp.on('Network.loadingFinished', e => { bytes += e.encodedDataLength; n++; });
    await cdp.send('Network.enable');
    await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
    await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: lat, downloadThroughput: bps, uploadThroughput: bps / 2 });
    await ctx.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    const t0 = Date.now();
    await page.goto(srv.url + target.replace(/^\//, ''), { waitUntil: 'commit' });
    await page.waitForFunction(() => document.body?.dataset?.screen === 'home', null, { timeout: 120_000 });
    res[name] = { ms: Date.now() - t0, requests: n, KB: Math.round(bytes / 1024) };
    await ctx.close();
  }
  console.log(target, JSON.stringify(res));
} finally { await br.close(); srv.stop(); }
