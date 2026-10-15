// 최소 스모크: 홈 → 출생 → 진행 화면 도달
import test from 'node:test';
import { launch, startServer, openPage, toBirth, startLife } from './helpers.mjs';
test('smoke: 홈→출생→진행', async () => {
  const browser = await launch(), srv = await startServer();
  try {
    const page = await openPage(browser, srv.url, { clock: true, url: '?motion=off&splash=0' });
    await toBirth(page); await page.clock.runFor(1500); await startLife(page);
  } finally { srv.stop(); await browser.close(); }
});
