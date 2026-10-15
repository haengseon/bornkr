// 선택 시트(긴 선택지 6개·비용·일자리 카드·성향 적합)·결과·사망 에필로그 스크린샷 + [확인]/푸터 가림 측정
// node tests/qa/shot-choice.mjs [라벨]  → tests/qa/out/choice-<라벨>-<WxH>-*.png, 콘솔에 측정 JSON
import path from 'node:path';
import { launch, startServer, openPage, toBirth, startLife, ROOT, seedInit, presetInit } from '../e2e/helpers.mjs';
const label = process.argv[2] || 'now';
const SIZES = (process.env.SIZES || '360x640,360x780,390x844,768x1024,1366x768').split(',').map(s => s.split('x').map(Number));
const out = n => path.join(ROOT, 'tests/qa/out', `choice-${label}-${n}.png`);
const LONG = '아주 긴 선택지 문구입니다. 여러 줄로 줄바꿈되어도 잘리거나 가려지지 않아야 합니다.';
const LONG_RES = '결과 첫째 문장은 충분히 깁니다. 둘째 문장도 두 줄 이상으로 이어지도록 길게 씁니다. 셋째 문장은 한 번 더 늘려 확인 버튼 아래로 밀리는지 봅니다. 마지막 문장은 반드시 끝까지 보여야 합니다.';
const req = major => ({
  eventId: major ? 'housing.qa' : 'qa.plain', major, topic: 'housing', prompt: '이사할 집을 정해야 한다. 어떻게 할까?', defaultId: 'a', fit: 'c', mbti: { label: '계획(J)' }, timeoutMs: 600000,
  jobInfo: major ? [{ label: '가', title: '중견기업 사무직', kind: '정규직', wage: 4200, year: 2010, perception: ['안정적이지만 야근이 잦다는 평'] }] : null,
  options: ['a', 'b', 'c', 'd', 'e', 'f'].map((id, i) => ({ id, label: i === 5 ? LONG : `${i + 1}번 선택지: 전세로 옮긴다`, hint: '보증금이 오르면 대출이 필요하다', risk: i % 3 === 0 ? 'high' : 'low', effects: { stats: { wealth: -3, health: 1 } }, ...(i === 1 && { cost: { cash: -1200, loan: 5000, monthly: 40, note: '금리 4%' } }) })),
});
const measure = () => {
  const sh = document.querySelector('.sheet.choice'); if (!sh) return null;
  const body = sh.querySelector('.sheet__body'), foot = sh.querySelector('.sheet__foot'), r = e => e.getBoundingClientRect();
  body.scrollTop = body.scrollHeight;                        // 본문 끝까지 내려서 마지막 요소가 푸터 위에 완전히 보이는지
  const last = [...body.querySelectorAll('.option, .choice__rtext, .reveal__text, .impact, .reveal__why, .choice__status, .choice__hint')].filter(e => e.offsetParent).at(-1);
  const fb = r(foot), lb = last && r(last), sb = r(sh), ok = sh.querySelector('.choice__ok');
  const hit = ok && (() => { const o = r(ok); return !!document.elementFromPoint(o.left + o.width / 2, o.top + o.height / 2)?.closest('.choice__ok'); })();
  const out = { vh: innerHeight, sheet: [Math.round(sb.top), Math.round(sb.bottom)], foot: [Math.round(fb.top), Math.round(fb.bottom)], last: lb && [Math.round(lb.top), Math.round(lb.bottom)], lastCovered: !!lb && lb.bottom > fb.top + 1, footInView: fb.bottom <= innerHeight + 1, okHit: hit ?? null, fs: { prompt: getComputedStyle(sh.querySelector('.choice__prompt')).fontSize, label: getComputedStyle(sh.querySelector('.option__label') || sh).fontSize }, fit: sh.querySelectorAll('.tag--fit').length };
  body.scrollTop = 0; return out;
};
const browser = await launch(), srv = await startServer(), all = {};
for (const [w, h] of SIZES) {
  const key = `${w}x${h}`, R = all[key] = {};
  const page = await openPage(browser, srv.url, { w, h, clock: true, noAutoMajor: true, url: '?motion=off&splash=0', init: seedInit(3) + presetInit({ speed: 1, auto: false, seen19: true }) });
  await toBirth(page); await page.clock.runFor(1500); await startLife(page); await page.clock.runFor(1500);
  await page.evaluate(() => document.querySelector('.major__ok, .mini__ok')?.click());
  await page.click('[data-act="pause"]');
  for (const major of [false, true]) {
    const k = major ? 'major' : 'plain';
    await page.evaluate(async rq => { const { runChoice } = await import('./src/ui/play.js'); const { S } = await import('./src/ui/dom.js'); window.__rc = runChoice(rq, S.run, '집주인이 계약 만료를 알려 왔다.'); }, req(major));
    await page.clock.runFor(400);
    R[k + 'Pick'] = await page.evaluate(measure);
    await page.screenshot({ path: out(`${key}-${k}-pick`) });
    await page.click('.sheet.choice .option[data-opt="b"]'); await page.clock.runFor(300);
    await page.evaluate(t => { const e = document.querySelector('.choice__rtext, .reveal__text'); if (e) e.textContent = t; }, LONG_RES);
    R[k + 'Result'] = await page.evaluate(measure);
    if (major) await page.screenshot({ path: out(`${key}-${k}-result`) });
    await page.evaluate(() => (document.querySelector('.choice__ok') || document.querySelector('.choice__result'))?.click()); await page.clock.runFor(600);
  }
  // 사망 에필로그: 엔진을 끝까지 돌리고 진행 루프가 사망 화면으로 넘기게 둔다
  await page.click('[data-act="pause"]');
  await page.evaluate(async () => { const e = await import('./src/engine/index.js'); const { S } = await import('./src/ui/dom.js'); try { e.runToEnd(S.L); } catch (x) { console.error(x); } });
  for (let i = 0; i < 40 && await page.evaluate(() => document.body.dataset.screen !== 'death'); i++) await page.clock.runFor(500);
  for (const [t, n] of [[300, 'a'], [2200, 'b'], [2000, 'c']]) { await page.clock.runFor(t); await page.screenshot({ path: out(`${key}-epi-${n}`) }); }
  R.epi = await page.evaluate(() => ({ screen: document.body.dataset.screen, lines: [...document.querySelectorAll('.dcine__line')].map(e => e.textContent) }));
  await page.ctx.close();
}
console.log(JSON.stringify(all, null, 1));
srv.stop(); await browser.close();
