// E2E-3h 재현 일관성: 직접 선택이 많은 긴 생애에서 (a) 새로 고침 이어 하기 상태 일치 (b) 기록관 replay = 방금 본 결산.
//   ARCHITECTURE §14(결정적 재현), UI-SPEC S12-b.
import test from 'node:test';
import {
  startServer, launch, openPage, appErrors, screen, waitScreen, Sim, seedInit, presetInit, checks, saveJson,
} from './helpers.mjs';

let srv, br;
test.before(async () => { srv = await startServer(); br = await launch(); });
test.after(async () => { await br?.close(); srv?.stop(); });

const hud = page => page.evaluate(() => ({
  age: +document.querySelector('[data-hud=age]').textContent, year: +document.querySelector('[data-hud=year]').textContent,
  stats: [...document.querySelectorAll('.stat__value')].map(x => +x.textContent), name: document.querySelector('.hud__name').firstChild.textContent.trim(),
  feed: [...document.querySelectorAll('.feed__year')].slice(0, 6).map(y => y.querySelector('.feed__when').textContent + '|' + [...y.querySelectorAll('.entry')].filter(e => !e.hasAttribute('data-cmp')).map(e => e.textContent.replace(/\s+/g, ' ').trim()).join('/')),
}));
const summaryDump = page => page.evaluate(() => ({
  main: document.querySelector('.verdict__main')?.textContent, reasons: [...document.querySelectorAll('.verdict__reasons li')].map(x => x.textContent),
  closing: [...document.querySelectorAll('section[aria-labelledby=sum-closing] .metric')].map(m => m.querySelector('.metric__label').textContent + ':' + m.querySelector('.metric__value').textContent + ':' + m.querySelector('.metric__reason').textContent),
  issues: [...document.querySelectorAll('section[aria-labelledby=sum-issues] .metric')].map(m => m.innerText.replace(/\s+/g, ' ')),
  tl: [...document.querySelectorAll('.timeline .tl')].map(x => x.innerText.replace(/\s+/g, ' ')), head: document.querySelector('.lifehead__years').textContent,
  peers: [...document.querySelectorAll('section[aria-labelledby=sum-peers] .peer')].map(x => x.innerText.replace(/\s+/g, ' ')),
  cert: [...document.querySelectorAll('.birth-again .form__value')].map(x => x.textContent.trim()).join('|'),
}));

for (const [seed, pattern] of [[3, 'cycle'], [13, 'last'], [20, 'first']]) {
  test(`E2E-3h 재현 일관성 seed ${seed}(직접 선택 패턴 ${pattern})`, { timeout: 600_000 }, async () => {
    const c = checks(`replay-${seed}`);
    const page = await openPage(br, srv.url, { clock: true, init: seedInit(seed) + presetInit({ seen19: true, speed: 4, auto: false }) });
    const sim = new Sim(page);
    await waitScreen(page, 'home'); await page.click('[data-go="born"]'); await waitScreen(page, 'birth'); await page.click('[data-act="start"]'); await waitScreen(page, 'life');
    let k = 0, picks = 0, reloads = 0;
    const marks = [35, 65];
    const guard = sim.t;
    while ((await screen(page)) === 'life' && sim.t - guard < 25 * 60_000) {
      const s = await page.evaluate(() => ({ open: !!document.querySelector('.sheet.choice .options:not(.is-done)'), n: document.querySelectorAll('.sheet.choice [data-opt]').length, sheet: !!document.querySelector('.sheet'), cmp: !!document.querySelector('.compare'), age: +document.querySelector('[data-hud=age]')?.textContent, banner: !document.querySelector('.banner')?.hidden }));
      if (s.open) {
        await sim.adv(800);
        const idx = pattern === 'first' ? 0 : pattern === 'last' ? s.n - 1 : k % s.n;
        if (await page.evaluate(() => !!document.querySelector('.sheet.choice .options:not(.is-done)'))) { await page.locator('.sheet.choice [data-opt]').nth(idx).click(); picks++; k++; }
        await sim.adv(1700);
        continue;
      }
      if (marks.length && s.age >= marks[0] && !s.sheet && !s.cmp) {
        marks.shift();
        await sim.adv(100);
        const before = await hud(page);
        await page.reload({ waitUntil: 'load' });
        await waitScreen(page, 'home');
        await page.click('[data-go="resume"]'); await waitScreen(page, 'life');
        const after = await hud(page);
        reloads++;
        c(`[${before.age}세] 이어 하기: 나이·연도·이름 일치`, after.age === before.age && after.year === before.year && after.name === before.name, `${before.age}/${after.age}`);
        c(`[${before.age}세] 이어 하기: 6지표 일치(직접 선택 ${picks}회 포함)`, JSON.stringify(after.stats) === JSON.stringify(before.stats), `${before.stats} | ${after.stats}`);
        c(`[${before.age}세] 이어 하기: 피드 최근 해 문구 일치`, JSON.stringify(after.feed) === JSON.stringify(before.feed), JSON.stringify(before.feed.slice(0, 2)) + ' | ' + JSON.stringify(after.feed.slice(0, 2)));
        await sim.adv(3300);
        continue;
      }
      await sim.adv(250);
    }
    await waitScreen(page, 'death');
    await page.click('[data-act="sum"]'); await waitScreen(page, 'summary');
    const live = await summaryDump(page);
    await page.evaluate(() => document.querySelectorAll('details.birth-again').forEach(d => { d.open = true; }));
    const live2 = await summaryDump(page);
    await page.click('.actionbar [data-go="archive"]'); await waitScreen(page, 'archive');
    await page.click('[data-rec="0"]'); await page.waitForSelector('.topbar__title');
    await page.evaluate(() => document.querySelectorAll('details.birth-again').forEach(d => { d.open = true; }));
    const det = await summaryDump(page);
    const rec = await page.evaluate(() => JSON.parse(localStorage.getItem('hj.v1.records') || '[]')[0]);
    c.note('기록', { seed: rec.seed, choices: rec.choices.length, auto: rec.choices.filter(x => x.auto).length, picks, reloads, deathAge: rec.deathAge });
    c('직접 선택 5회 이상 수행(재현 검증 의미)', picks >= 5, picks);
    c('이어 하기 점검 2회 수행', reloads === 2, reloads);
    c('재열람 = 결산: 판정 주문·이유', det.main === live.main && JSON.stringify(det.reasons) === JSON.stringify(live.reasons), `${live.main} | ${det.main} || ${live.reasons} | ${det.reasons}`);
    c('재열람 = 결산: 결산 5지표(값·사유)', JSON.stringify(det.closing) === JSON.stringify(live.closing), JSON.stringify(live.closing.slice(0, 2)) + ' | ' + JSON.stringify(det.closing.slice(0, 2)));
    c('재열람 = 결산: 내 삶에 들어온 뉴스 10축(값·사유)', JSON.stringify(det.issues) === JSON.stringify(live.issues), live.issues.filter((x, i) => x !== det.issues[i]).slice(0, 2).join(' || '));
    c('재열람 = 결산: 연표 전 줄', JSON.stringify(det.tl) === JSON.stringify(live.tl), live.tl.filter((x, i) => x !== det.tl[i]).slice(0, 2).join(' || '));
    c('재열람 = 결산: 같은 날 태어난 사람들', JSON.stringify(det.peers) === JSON.stringify(live.peers), live.peers.filter((x, i) => x !== det.peers[i]).slice(0, 2).join(' || '));
    c('재열람 = 결산: 출생 신고서 값', det.cert === live2.cert, `${live2.cert} | ${det.cert}`);
    c('재열람 = 결산: 머리글(생몰·향년·원인)', det.head === live.head, `${live.head} | ${det.head}`);
    c('콘솔·페이지 에러 0', appErrors(page).length === 0 && page.qa.pageErrors.length === 0, appErrors(page).concat(page.qa.pageErrors).join('|'));
    c.done();
  });
}
