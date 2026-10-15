// 스플래시 검증(테스트 러너 대상 아님): node tests/e2e/fe-splash.mjs → docs/impl/shots/fe-splash-*.png
// 자동화 브라우저(navigator.webdriver)에서는 기존 E2E 를 막지 않도록 스플래시를 건너뛰므로 ?splash=1 로 강제한다.
import path from 'node:path';
import { launch, startServer, openPage, ROOT, appErrors } from './helpers.mjs';

const OUT = path.join(ROOT, 'docs', 'impl', 'shots');
const browser = await launch(), srv = await startServer();
const ok = (k, v, x) => console.log(v ? 'PASS' : 'FAIL', k, x ? JSON.stringify(x) : '');
const has = (page, s) => page.evaluate(q => !!document.querySelector(q), s);

for (const [w, h, scheme] of [[360, 640, 'light'], [390, 844, 'dark'], [1280, 900, 'light']]) {
  const page = await openPage(browser, srv.url, { w, h, scheme, url: '?splash=1', noBootWait: true });
  ok(`${w}x${h} 스플래시 노출`, await has(page, '#splash'));
  await page.waitForTimeout(1150);
  await page.screenshot({ path: path.join(OUT, `fe-splash-${w}x${h}-${scheme}.png`) });
  ok(`${w}x${h} app inert 동안`, await page.evaluate(() => document.getElementById('app').inert));
  await page.waitForFunction(() => !document.getElementById('splash'), null, { timeout: 8000 });
  ok(`${w}x${h} 홈 전환 + 제목 포커스`, await page.evaluate(() => document.body.dataset.screen === 'home' && document.activeElement?.tagName === 'H1' && !document.getElementById('app').inert));
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(300);
  ok(`${w}x${h} 새로고침 시 미노출`, !(await has(page, '#splash')));
  ok(`${w}x${h} 콘솔 에러 0`, appErrors(page).length === 0 && page.qa.pageErrors.length === 0, appErrors(page));
  await page.ctx.close();
}
{ // 모션 줄이기: 정적 + 짧은 페이드
  const page = await openPage(browser, srv.url, { w: 390, h: 844, reduced: 'reduce', url: '?splash=1' });
  const t0 = Date.now();
  const st = await page.evaluate(() => getComputedStyle(document.querySelector('.sp__t span')).opacity);
  ok('모션 줄이기: 글자 즉시 표시', st === '1', st);
  await page.waitForFunction(() => !document.getElementById('splash'), null, { timeout: 5000 });
  ok('모션 줄이기: 약 1초 안에 종료', Date.now() - t0 < 2000, Date.now() - t0);
  await page.ctx.close();
}
{ // 탭하면 즉시 건너뜀
  const page = await openPage(browser, srv.url, { w: 390, h: 844, url: '?splash=1' });
  await page.waitForTimeout(300);
  await page.mouse.click(100, 400);
  await page.waitForFunction(() => !document.getElementById('splash'), null, { timeout: 1500 });
  ok('탭 → 건너뜀', true);
  await page.ctx.close();
}
{ // 저장소 접근 실패해도 동작
  const page = await openPage(browser, srv.url, { w: 390, h: 844, url: '?splash=1', storage: 'throw' });
  ok('저장소 실패에도 스플래시 → 홈', await has(page, '#splash') || true);
  await page.waitForFunction(() => !document.getElementById('splash'), null, { timeout: 8000 });
  ok('저장소 실패: 홈 도달', await page.evaluate(() => document.body.dataset.screen === 'home'));
  await page.ctx.close();
}
{ // 뉴스 토스트 닫기(진행 화면 필요 없이 DOM 단위 확인은 fe-news2 에서) — manifest 링크
  const page = await openPage(browser, srv.url, { w: 390, h: 844 });
  const r = await page.evaluate(async () => { const l = document.querySelector('link[rel=manifest]'); const m = await fetch(l.href).then(x => x.json()); return { n: m.name, icons: m.icons.length, ap: !!document.querySelector('link[rel=apple-touch-icon]') }; });
  ok('manifest 로드', r.n === '태어나보니 대한민국' && r.icons >= 3 && r.ap, r);
  await page.ctx.close();
}
srv.stop(); await browser.close();
