// E2E-5 안전·원칙: 민감 선택/민감 사망(도움 번호 UI 없음), 사인·금액·순위 비노출, 광고 자리, 공유 강요 없음, 이른 사망.
//   ARCHITECTURE §15 · UI-SPEC S04·S06·S09·S10·§10 · 00-plan 데이터 원칙.
import test from 'node:test';
import {
  startServer, launch, openPage, appErrors, screen, waitScreen, shot, Sim, seedInit, presetInit, SEEDS, checks,
  RE_RANK, RE_MONEY, RE_JOBRANK, RE_CAUSE_SENS, forbiddenHits, pageText, simToDeath,
} from './helpers.mjs';

let srv, br;
test.before(async () => { srv = await startServer(); br = await launch(); });
test.after(async () => { await br?.close(); srv?.stop(); });

const PRE = (extra = {}) => presetInit({ seen19: true, speed: 4, auto: true, ...extra });
async function newGame(seed, extra = {}, opts = {}) {
  const page = await openPage(br, srv.url, { clock: true, init: seedInit(seed) + PRE(extra), ...opts });
  await page.ctx.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: srv.url.slice(0, -1) });
  await waitScreen(page, 'home');
  await page.click('[data-go="born"]');
  await waitScreen(page, 'birth');
  await page.click('[data-act="start"]');
  await waitScreen(page, 'life');
  return { page, sim: new Sim(page) };
}
// 사용자 결정(2026-10): 화면 어디에도 전화번호·'도움 받을 곳' 버튼·도움 시트를 두지 않는다. 민감 사건은 비그래픽 한 줄 + 일반 선택지만.
const RE_PHONE = /(?:\d{2,4}-\d{3,4}(?:-\d{4})?|\b(?:109|129|117|1388|1393|1577-\d{4}|1588-\d{4}|112|119)\b)/;

test('E2E-5a 민감 선택(illness 13세·violence 9세): 도움 UI·번호 없음, 20초, 자동결정 단축 없음', { timeout: 300_000 }, async t => {
  const c = checks('safety-choice');
  for (const [name, seed, age] of [['illness', SEEDS.sensChoice, 13], ['violence', SEEDS.sensChoiceV, 9]]) {
    const { page, sim } = await newGame(seed);
    await sim.until(a => +document.querySelector('[data-hud=age]')?.textContent === a && !!document.querySelector('.sheet.choice'), { max: 20 * 60_000, arg: age });
    await sim.adv(800);
    await page.waitForTimeout(500);
    const o = await page.evaluate(() => ({ ...(() => { const x = { box: document.querySelectorAll('.help-box, .help-inline, .help-list, .help-item').length, btn: document.querySelectorAll('[data-help]').length, tel: document.querySelectorAll('a[href^="tel:"]').length, text: document.body.innerText }; return x; })(), ring: document.querySelector('.ring__num')?.textContent, auto: document.querySelector('.lifebar [data-act=auto]')?.getAttribute('aria-checked'), sheet: document.querySelector('.sheet.choice').innerText }));
    c(`[${name}] 도움 박스·버튼·tel 링크 없음`, o.box === 0 && o.btn === 0 && o.tel === 0, JSON.stringify([o.box, o.btn, o.tel]));
    c(`[${name}] 화면에 전화번호 없음`, !RE_PHONE.test(o.text.replace(/\d{4}년|\d+세/g, '')), (o.text.match(RE_PHONE) || [''])[0]);
    c(`[${name}] 민감 선택 카운트다운 20초(엔진 timeoutMs)`, +o.ring >= 19, o.ring);
    await shot(page, `safety-choice-${name}`);
    c(`[${name}] 자동결정 켠 상태 확인`, o.auto === 'true', o.auto);
    await sim.adv(5000);
    const o2 = await page.evaluate(() => ({ open: !!document.querySelector('.sheet.choice'), ring: document.querySelector('.ring__num')?.textContent }));
    c(`[${name}] 자동결정 켜도 민감 선택은 5초 뒤에도 열림(1.2초 단축 없음)`, o2.open && +o2.ring >= 12, JSON.stringify(o2));
    // 남은 카운트다운(링 숫자) + 결과 읽기 시간(초당 9자, 최소 3초 — C5) 뒤 기본값으로 닫힌다
    const t0 = sim.t;
    await sim.until(() => { const r = document.querySelector('.sheet.choice .choice__result, .sheet.choice .reveal'); if (r) { const x = r.cloneNode(true); x.querySelectorAll('details, .sr-only').forEach(n => n.remove()); window.__rms = Math.max(3000, x.textContent.replace(/\s+/g, '').length / 9 * 1000); } return !document.querySelector('.sheet.choice'); }, { step: 250, max: 90_000 });
    const dt = sim.t - t0, left = +o2.ring * 1000, rMs = await page.evaluate(() => window.__rms || 0);
    c(`[${name}] 무응답 → 남은 카운트다운 + 결과 읽기 시간 뒤 기본값`, rMs >= 3000 && dt >= left - 1000 + rMs - 250 && dt <= left + rMs + 750, `${dt}ms / 남은 ${left} / 결과 ${rMs}`);
    c(`[${name}] 콘솔·페이지 에러 0`, appErrors(page).length === 0 && page.qa.pageErrors.length === 0, appErrors(page).concat(page.qa.pageErrors).join('|'));
    await page.ctx.close();
  }
  c.done();
});

test('E2E-5b 민감 피드(재난 1세): 도움 줄·번호 없음, 비그래픽 한 줄만', { timeout: 300_000 }, async t => {
  const c = checks('safety-feed');
  const { page, sim } = await newGame(SEEDS.sensLog);
  await sim.until(() => !!document.querySelector('.entry--sensitive'), { max: 20 * 60_000 });
  await sim.adv(500);
  const d = await page.evaluate(() => ({ n: document.querySelectorAll('.entry--sensitive').length, box: document.querySelectorAll('.help-inline, .help-box, [data-help]').length, text: document.body.innerText }));
  c('재난 민감 피드 항목 발견', d.n >= 1, d.n);
  c('피드에 도움 줄·버튼 없음', d.box === 0, d.box);
  c('화면에 전화번호 없음', !RE_PHONE.test(d.text.replace(/\d{4}년|\d+세/g, '')), (d.text.match(RE_PHONE) || [''])[0]);
  c('콘솔·페이지 에러 0', appErrors(page).length === 0 && page.qa.pageErrors.length === 0, appErrors(page).concat(page.qa.pageErrors).join('|'));
  c.done();
});

test('E2E-5c 민감 사망(자해 23세): 도움 UI 없음 · 자동 넘김 없음 · 사인 비노출 · 카드/결산', { timeout: 300_000 }, async t => {
  const c = checks('safety-death');
  const { page, sim } = await newGame(SEEDS.sensDeath);
  await simToDeath(page, sim, { max: 25 * 60_000 });   // 마지막 해 [마지막 페이지로]는 직접 넘김
  await sim.adv(3000);                           // 한 줄씩 나타나는 연출
  const d = await page.evaluate(() => {
    const inner = document.querySelector('.death__inner');
    return {
      box: document.querySelectorAll('.help-box, [data-help]').length, cause: inner.querySelector('.death__cause').textContent, outside: inner.innerText,
      note: document.querySelector('.actionbar__note')?.textContent ?? null, timer: !!document.querySelector('.timer-line'), btn: document.querySelector('.actionbar .btn').textContent,
      ads: document.querySelectorAll('.ad-slot').length, rec: JSON.parse(localStorage.getItem('hj.v1.records') || '[]').length, text: document.body.innerText,
    };
  });
  c('S09 도움 박스·버튼 없음', d.box === 0, d.box);
  c('S09 화면에 전화번호 없음', !RE_PHONE.test(d.text.replace(/\d{4}|\d+세/g, '')), (d.text.match(RE_PHONE) || [''])[0]);
  c('S09 사인 문구 대신 "세상을 떠났습니다."', d.cause === '세상을 떠났습니다.' && !RE_CAUSE_SENS.test(d.outside), `${d.cause} / ${d.outside.replace(/\n/g, ' ')}`);
  // 사망 화면은 이제 모든 사망에서 직접 넘긴다(F-9: 버튼 하나 "살아온 날들 돌아보기"). 안내 문구는 직접 넘김 안내뿐, 자동 넘김 문구·타이머 없음
  c('S09 민감 사망 자동 넘김 문구·타이머 없음', !/초 뒤|넘어갑니다/.test(d.note ?? '') && !d.timer && d.btn === '살아온 날들 돌아보기', `${d.note}/${d.timer}/${d.btn}`);
  c('S09 광고 없음', d.ads === 0);
  c('S09 기록 저장 완료(사망 화면 전)', d.rec === 1, d.rec);
  await shot(page, 'safety-death-sensitive');
  await sim.adv(60_000);
  c('S09 60초가 지나도 결산으로 넘어가지 않음', (await screen(page)) === 'death', await screen(page));
  await page.click('[data-act="sum"]');
  await waitScreen(page, 'summary');
  const full = await pageText(page, '.summary');
  const hits = full.match(/.{0,25}(자해|자살|극단적).{0,25}/g) || [];
  c('S10 결산 전체에 자해·자살 문구 없음', hits.length === 0, hits.join(' | '));
  const fh = forbiddenHits(full);
  c('S10 순위·직급·백분위 문구 없음', fh.length === 0, fh.join(' | '));
  c('S10 결산에 금액 없음', !RE_MONEY.test(full), (full.match(RE_MONEY) || [''])[0]);
  const head = await page.evaluate(() => document.querySelector('.lifehead__years').textContent);
  c('S10 머리글에 사인 없음(세상을 떠났습니다 / 향년만)', !/(으로|로) 세상을 떠났/.test(head), head);
  c('S10 광고·공유 시트 없음', await page.evaluate(() => !document.querySelector('.ad-slot') && !document.querySelector('.sheet')));
  await shot(page, 'safety-summary-sensitive', { fullPage: true });
  for (const kind of ['birth', 'verdict', 'timeline']) {
    await page.evaluate(() => { window.__qa.canvas = []; });
    await page.click(`[data-card="${kind}"]`);
    await page.waitForSelector('.share__img');
    for (let i = 0; i < 40 && !(await page.evaluate(() => (document.querySelector('.share__img')?.src || '').startsWith('data:'))); i++) { await sim.adv(300); await page.waitForTimeout(80); }
    const k = await page.evaluate(() => ({ text: document.querySelector('.share__text').value, alt: document.querySelector('.share__img').alt, canvas: window.__qa.canvas.slice() }));
    const joined = [k.text, k.alt, ...k.canvas].join('\n');
    c(`카드 ${kind}: 자해·자살·사인 없음`, !RE_CAUSE_SENS.test(joined) && !/(으로|로) 세상을 떠났/.test(joined), (joined.match(/.{0,20}(자해|자살).{0,20}/) || [''])[0]);
    // 금액은 붙여 넣는 문구·alt 에만 금지 — 캔버스 '나의 인생 기록' 카드는 순자산을 의도적으로 그린다(0ef8ffa). 순위·직급은 모두 금지
    c(`카드 ${kind}: 문구·alt 금액 없음 · 전체 순위·직급 없음`, !RE_MONEY.test([k.text, k.alt].join('\n')) && forbiddenHits(joined).length === 0, ([k.text, k.alt].join('\n').match(RE_MONEY) || forbiddenHits(joined) || [''])[0]);
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => !document.querySelector('.sheet'));
  }
  c('콘솔·페이지 에러 0', appErrors(page).length === 0 && page.qa.pageErrors.length === 0, appErrors(page).concat(page.qa.pageErrors).join('|'));
  c.done();
});

test('E2E-5d 이른 사망(0세·3세) · 원인 숨기기 설정', { timeout: 300_000 }, async t => {
  const c = checks('safety-early');
  for (const [name, seed] of [['infant', SEEDS.infant], ['short', SEEDS.short]]) {
    const { page, sim } = await newGame(seed);
    await simToDeath(page, sim, { max: 10 * 60_000 });   // 마지막 해 [마지막 페이지로]는 직접 넘김
    await sim.adv(1300);
    const d = await page.evaluate(() => ({ years: document.querySelector('.death__years').textContent, cause: document.querySelector('.death__cause').textContent, text: document.querySelector('.death').innerText, hb: !!document.querySelector('.help-box'), note: document.querySelector('.actionbar__note')?.textContent }));
    c(`[${name}] 사망 화면 렌더`, !!d.years, d.years);
    c(`[${name}] 기대수명 대비 손실·"덜 살았다" 문구 없음`, !/덜 살|손실|기대수명|기대 수명|짧은 생|안타깝/.test(d.text), d.text.replace(/\n/g, ' '));
    c.note(`[${name}] 사망 화면`, d.text.replace(/\n/g, ' | '));
    await shot(page, `safety-death-${name}`);
    await page.click('[data-act="sum"]');
    await waitScreen(page, 'summary');
    const full = await pageText(page, '.summary');
    const s = await page.evaluate(() => ({ grid: document.querySelector('.lifegrid')?.getAttribute('aria-label'), tl: document.querySelectorAll('.timeline .tl').length, verdict: document.querySelector('.verdict__main')?.textContent, closing: document.querySelectorAll('section[aria-labelledby=sum-closing] .metric').length, head: document.querySelector('.lifehead__years').textContent, peers: document.querySelectorAll('section[aria-labelledby=sum-peers] .peer').length }));
    c(`[${name}] 결산 렌더(판정문·결산·연표·동료)`, !!s.verdict && s.closing === 5 && s.tl >= 1 && s.peers === 4, JSON.stringify(s));
    c(`[${name}] 결산에 순위·직급 없음`, forbiddenHits(full).length === 0, forbiddenHits(full).join('|'));
    c.note(`[${name}] 결산 요약`, s);
    await shot(page, `safety-summary-${name}`, { fullPage: true });
    c(`[${name}] 콘솔·페이지 에러 0`, appErrors(page).length === 0 && page.qa.pageErrors.length === 0, appErrors(page).concat(page.qa.pageErrors).join('|'));
    await page.ctx.close();
  }
  // 원인 숨기기: 비민감 사망(seed 67) → "세상을 떠났습니다."만
  for (const hide of [false, true]) {
    const { page, sim } = await newGame(SEEDS.plain, { hideSensitiveCause: hide });
    await simToDeath(page, sim, { max: 25 * 60_000 });   // 마지막 해 [마지막 페이지로]는 직접 넘김
    await sim.adv(1300);
    const cause = await page.evaluate(() => document.querySelector('.death__cause').textContent);
    c(`원인 숨기기=${hide}: 사망 화면 문구`, hide ? cause === '세상을 떠났습니다.' : /(으로|로) 세상을 떠났습니다\./.test(cause), cause);
    await page.click('[data-act="sum"]'); await waitScreen(page, 'summary');
    const head = await page.evaluate(() => document.querySelector('.lifehead__years').textContent);
    c(`원인 숨기기=${hide}: 결산 머리글`, hide ? !/세상을 떠났|으로$/.test(head) && !/ · .+/.test(head.replace(/^.*향년 \d+세/, '')) : true, head);
    c.note(`원인 숨기기=${hide} 머리글`, head);
    await page.ctx.close();
  }
  c.done();
});
