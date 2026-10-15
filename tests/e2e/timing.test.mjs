// E2E-2 시간: 실시간(홈→출생 카드, 홈→첫 선택) + 가짜 시계(방치 완주, 15분 상한, 2×/4×) + 성능(DOM 수, 연 처리 시간, 힙).
//   00-plan 검증 기준: 15분 이내 · 첫 출생 카드/첫 선택 3분 이내. ARCHITECTURE §12.
import test from 'node:test';
import {
  startServer, launch, openPage, appErrors, screen, waitScreen, shot, Sim, seedInit, presetInit, SEEDS, checks, median, saveJson,
} from './helpers.mjs';

let srv, br;
test.before(async () => { srv = await startServer(); br = await launch(); });
test.after(async () => { await br?.close(); srv?.stop(); });

// ───────── 실시간 ─────────
async function realTrial(kind) {
  const t0 = Date.now();
  const page = await openPage(br, srv.url, {});
  const tLoad = Date.now() - t0;
  await waitScreen(page, 'home');
  const tHome = Date.now() - t0;
  await page.click('[data-go="born"]');
  if ((await screen(page)) === 'gate') await page.click('[data-go="gateOk"]');
  await waitScreen(page, 'birth');
  const tBirth = Date.now() - t0;
  const birthText = await page.evaluate(() => document.querySelector('.form')?.innerText.length);
  await page.click('[data-act="start"]');
  await waitScreen(page, 'life', 30000);
  const tLife = Date.now() - t0;
  // 첫 선택이 오거나, 선택 전에 사망 화면으로 가면(엔진: 3.7% 생애가 4세 전 사망) 그 사실을 기록한다.
  await page.waitForFunction(() => document.querySelector('.sheet.choice') || document.body.dataset.screen !== 'life', null, { timeout: 240_000 });
  const tChoice = Date.now() - t0;
  const earlyDeath = !(await page.evaluate(() => !!document.querySelector('.sheet.choice')));
  const meta = await page.evaluate(() => document.querySelector('.choice__meta')?.textContent.replace(/\s+/g, ' '));
  const errs = appErrors(page).concat(page.qa.pageErrors);
  await page.ctx.close();
  return { kind, tLoad, tHome, tBirth, tLife, tChoice, earlyDeath, meta, birthText, errs };
}

test('E2E-2a 실시간: 홈 로드 → 출생 카드 · 첫 선택(1×)', { timeout: 600_000 }, async () => {
  const c = checks('timing-real');
  // 3회(클릭 시작 2 + 방치해 15초 자동 시작 1) 동시 측정. 동시라서 CPU 경합이 있는 보수적 값.
  const rs = await Promise.all([realTrial('click'), realTrial('auto'), realTrial('click'), realTrial('click')]);
  for (const r of rs) {
    c(`[${r.kind}] 홈 로드→출생 카드 ≤ 10초(ARCH §12)`, r.tBirth <= 10_000, `${r.tBirth}ms`);
    if (r.earlyDeath) { c.note(`[${r.kind}] 첫 선택 전에 사망 화면(4세 전 사망, 엔진 3.7%)`, `${r.tChoice}ms`); }
    else {
      c(`[${r.kind}] 홈 로드→첫 선택 ≤ 3분(00-plan)`, r.tChoice <= 180_000, `${r.tChoice}ms (${r.meta})`);
      c(`[${r.kind}] 첫 선택 ≤ 70~90초 권장(ARCH §12 70초 안팎)`, r.tChoice <= 90_000, `${r.tChoice}ms`);
    }
    c(`[${r.kind}] 에러 0`, r.errs.length === 0, r.errs.join('|'));
  }
  c.note('real trials', rs);
  saveJson('timing-real-raw.json', rs);
  c.done();
});

// ───────── 방치 완주(가짜 시계) ─────────
async function idleRun(seed, speed = 1) {
  const page = await openPage(br, srv.url, { clock: true, init: seedInit(seed) + presetInit({ seen19: true, speed, auto: false }) });
  const sim = new Sim(page);
  await waitScreen(page, 'home');
  await page.click('[data-go="born"]');
  await waitScreen(page, 'birth');
  await page.click('[data-act="start"]');
  await waitScreen(page, 'life');
  const t0 = sim.t;
  let toastAt = null, deathAt = null, sumAt = null, lastAge = 0, nodes = 0, longChoice = 0;
  while (sim.t - t0 < 40 * 60_000) {
    const s = await page.evaluate(() => ({ screen: document.body.dataset.screen, toast: document.querySelector('.toast')?.textContent || '', age: document.querySelector('[data-hud=age]')?.textContent, nodes: document.querySelectorAll('*').length }));
    if (s.age != null) { lastAge = +s.age; nodes = Math.max(nodes, s.nodes); }
    if (toastAt == null && /시간이 다 되어/.test(s.toast)) toastAt = sim.t - t0;
    if (deathAt == null && s.screen === 'death') deathAt = sim.t - t0;
    if (s.screen === 'summary') { sumAt = sim.t - t0; break; }
    await sim.adv(500);
  }
  const d = await page.evaluate(() => ({ years: document.querySelector('.lifehead__years')?.textContent, full: document.querySelector('.summary')?.innerText || '' }));
  const capNote = (d.full.match(/.{0,30}(15분|시간이 다 되|상한).{0,40}/) || [''])[0];
  const deathAge = +(d.years?.match(/향년 (\d+)세/)?.[1] ?? -1);
  const err = appErrors(page).concat(page.qa.pageErrors);
  await page.ctx.close();
  return { seed, speed, deathAt, sumAt, toastAt, capped: toastAt != null, lastAge, deathAge, nodes, capNote, err };
}

test('E2E-2b 방치 완주(가짜 시계, 1×): 출생→사망 화면·결산 진입 ≤ 15:00', { timeout: 900_000 }, async () => {
  const c = checks('timing-idle');
  const seeds = [1, 2, 3, 4, 5, 13, 20, 23, 28, 36, 63, 69, 67, 10];
  const out = [];
  for (let i = 0; i < seeds.length; i += 4) out.push(...await Promise.all(seeds.slice(i, i + 4).map(s => idleRun(s))));
  const fmt = ms => ms == null ? '-' : `${Math.floor(ms / 60000)}:${String(Math.round(ms / 1000) % 60).padStart(2, '0')}`;
  for (const r of out) {
    c(`seed ${r.seed}(향년 ${r.deathAge}): 사망 화면 도달 ≤ 15:00`, r.deathAt != null && r.deathAt <= 900_000, `death ${fmt(r.deathAt)} summary ${fmt(r.sumAt)}`);
    c(`seed ${r.seed}: 결산 진입(사망 화면 8초 자동 포함) ≤ 15:00`, r.sumAt != null && r.sumAt <= 900_000, `${fmt(r.sumAt)} (상한 도달=${r.capped})`);
    c(`seed ${r.seed}: 에러 0`, r.err.length === 0, r.err.join('|'));
  }
  const dts = out.map(r => r.deathAt).filter(x => x != null);
  c.note('방치 완주 표', out.map(r => ({ seed: r.seed, deathAge: r.deathAge, death: fmt(r.deathAt), summary: fmt(r.sumAt), capped: r.capped, toastAt: fmt(r.toastAt), nodes: r.nodes, capNote: r.capNote })));
  c.note('분포', { n: out.length, medianDeath: fmt(median(dts)), maxDeath: fmt(Math.max(...dts)), minDeath: fmt(Math.min(...dts)), over15: out.filter(r => (r.sumAt ?? 1e9) > 900_000).length, capped: out.filter(r => r.capped).length });
  saveJson('timing-idle-raw.json', out);
  c.done();
});

// ───────── 15분 상한 ─────────
test('E2E-2c 15분 상한: 선택 링을 멈춰 방치 → 기본값 → 토스트 → 결산', { timeout: 600_000 }, async () => {
  const c = checks('timing-cap');
  const page = await openPage(br, srv.url, { clock: true, init: seedInit(SEEDS.plain) + presetInit({ seen19: true, speed: 1, auto: false }) });
  const sim = new Sim(page);
  await page.ctx.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: srv.url.slice(0, -1) });
  await waitScreen(page, 'home');
  await page.click('[data-go="born"]'); await waitScreen(page, 'birth');
  await page.click('[data-act="start"]'); await waitScreen(page, 'life');
  const t0 = sim.t;
  await sim.until(() => !!document.querySelector('.sheet.choice'), { max: 5 * 60_000 });
  await sim.adv(800);
  await page.click('.ring');                                      // 카운트다운 멈춤
  const tChoice = sim.t - t0;
  let toastAt = null, deathAt = null, toast = '', age0 = await page.evaluate(() => document.querySelector('[data-hud=age]').textContent);
  while (sim.t - t0 < 20 * 60_000) {
    await sim.adv(1000);
    const s = await page.evaluate(() => ({ screen: document.body.dataset.screen, toast: document.querySelector('.toast')?.textContent || '', open: !!document.querySelector('.sheet.choice') }));
    if (toastAt == null && /시간이 다 되어/.test(s.toast)) { toastAt = sim.t - t0; toast = s.toast; }
    if (s.screen === 'death') { deathAt = sim.t - t0; break; }
  }
  c('상한 도달 전까지 링이 멈춘 채로 선택 시트 유지(15분 상한이 선택 대기 중에도 흐름)', toastAt != null, `choice at ${tChoice}ms`);
  c('상한 토스트 "시간이 다 되어 기본 행동으로 마칩니다."', toast === '시간이 다 되어 기본 행동으로 마칩니다.', toast);
  // 상한은 15:00 − 결산 전환 예약 15초 = 14:45에 발동한다(clock.js CAP_RESERVE_MS, QA-S-01 수정)
  c('상한 토스트 시각 = 출생 후 14:45 ± 1.5초(출생 카드 이후 시계 기준)', toastAt != null && Math.abs(toastAt - 885_000) <= 1500, `${toastAt}ms`);
  c('상한 후 사망 화면까지 ≤ 3초(기본값 처리 + 1.2초)', deathAt != null && deathAt - toastAt <= 3000, `${deathAt - toastAt}ms`);
  await page.waitForTimeout(300);
  const rec = await page.evaluate(() => ({ rec: JSON.parse(localStorage.getItem('hj.v1.records') || '[]'), cur: localStorage.getItem('hj.v1.current') }));
  c('상한 → 기록 1개 저장 · current 삭제', rec.rec.length === 1 && rec.cur == null, `${rec.rec.length}/${rec.cur}`);
  const deathAge = rec.rec[0]?.deathAge;
  c.note('상한 진입 나이 → 사망 나이', { enteredAtAge: age0, deathAge, choicesRecorded: rec.rec[0]?.choices?.length, defaultsAuto: rec.rec[0]?.choices?.filter(x => x.auto).length });
  await shot(page, 'timing-cap-death');
  await sim.until(() => document.body.dataset.screen === 'summary', { max: 15000 });
  const full = await page.evaluate(() => document.querySelector('.summary').innerText);
  const m = full.match(/.{0,40}(15분|시간이 다 되|상한).{0,60}/);
  c('결산에 15분 상한 고지 문구가 있음(엔진 end.cap)', !!m, m ? m[0] : '없음');
  const vr = await page.evaluate(() => [...document.querySelectorAll('.verdict__reasons li')].map(x => x.textContent));
  c.note('판정 이유 줄', vr);
  c.note('상한 고지 위치', m ? m[0] : '없음');
  await shot(page, 'timing-cap-summary', { fullPage: true });
  c('에러 0', appErrors(page).length === 0 && page.qa.pageErrors.length === 0, appErrors(page).concat(page.qa.pageErrors).join('|'));
  c.done();
});

test('E2E-2d 상한 직전 이어 하기(elapsed 14:40, 장수 시드): 상한 → 결산', { timeout: 300_000 }, async () => {
  const c = checks('timing-cap-resume');
  const cur = { seed: SEEDS.long, choices: [], elapsed: 14 * 60_000 + 40_000, age: 30, name: '테스트', year: 2000, at: Date.now() };
  const page = await openPage(br, srv.url, { clock: true, init: seedInit(SEEDS.long) + presetInit({ seen19: true, speed: 1, auto: false }, { 'hj.v1.current': cur }) });
  const sim = new Sim(page);
  await waitScreen(page, 'home');
  const home = await page.evaluate(() => ({ resume: !!document.querySelector('.resume'), text: document.querySelector('.resume')?.innerText.replace(/\n/g, ' ') }));
  c('홈 이어 하기 카드(저장된 생애)', home.resume, home.text);
  await page.click('[data-go="resume"]');
  await waitScreen(page, 'life');
  const r0 = await page.evaluate(() => ({ age: document.querySelector('[data-hud=age]').textContent, banner: !document.querySelector('.banner').hidden, tag: !document.querySelector('[data-hud=paused]').hidden, pause: document.querySelector('[data-act=pause]').textContent }));
  c('이어 하기 → 멈춤 띠·태그·"계속" 3중 표시', r0.banner && r0.tag && r0.pause === '계속', JSON.stringify(r0));
  c('이어 하기 → 저장한 나이 복원(30세)', r0.age === '30', r0.age);
  const t0 = sim.t;
  let toastAt = null;
  while (sim.t - t0 < 120_000) {
    await sim.adv(500);
    const s = await page.evaluate(() => ({ screen: document.body.dataset.screen, toast: document.querySelector('.toast')?.textContent || '' }));
    if (toastAt == null && /시간이 다 되어/.test(s.toast)) toastAt = sim.t - t0;
    if (s.screen === 'death') break;
  }
  c('저장 elapsed 14:40 + 멈춤 3초 → 약 8초 뒤 상한 토스트(14:45 발동, ±3초)', toastAt != null && Math.abs(toastAt - 8_000) <= 3500, `${toastAt}ms`);
  c('상한 후 사망 화면 도달', (await screen(page)) === 'death', await screen(page));
  const rec = await page.evaluate(() => JSON.parse(localStorage.getItem('hj.v1.records') || '[]'));
  c.note('상한 후 사망 나이(엔진 runToEnd cap) — fe-notes "103세" 관찰 확인', { deathAge: rec[0]?.deathAge, from: 30 });
  c('에러 0', appErrors(page).length === 0 && page.qa.pageErrors.length === 0, appErrors(page).concat(page.qa.pageErrors).join('|'));
  c.done();
});

// ───────── 배속 ─────────
test('E2E-2e 배속 1×/2×/4×: 연 간격 비율, 선택 카운트다운은 배속과 무관', { timeout: 300_000 }, async () => {
  const c = checks('timing-speed');
  const res = {};
  for (const speed of [1, 2, 4]) {
    const page = await openPage(br, srv.url, { clock: true, init: seedInit(SEEDS.plain) + presetInit({ seen19: true, speed, auto: false }) });
    const sim = new Sim(page);
    await waitScreen(page, 'home');
    await page.click('[data-go="born"]'); await waitScreen(page, 'birth');
    await page.click('[data-act="start"]'); await waitScreen(page, 'life');
    const stamps = {};
    let age = 0;
    const t0 = sim.t;
    while (age < 4 && sim.t - t0 < 200_000) {
      await sim.adv(100);
      const a = +(await page.evaluate(() => document.querySelector('[data-hud=age]').textContent));
      if (a !== age) { age = a; stamps[a] = sim.t - t0; }
    }
    res[speed] = { stamps, pressed: await page.evaluate(() => [...document.querySelectorAll('[data-speed]')].map(b => b.getAttribute('aria-pressed')).join()) };
    // 선택 카운트다운(5세)은 배속과 무관: 열린 시각 → 기본값 처리
    await sim.until(() => !!document.querySelector('.sheet.choice'), { max: 200_000, step: 100 });
    const o = sim.t;
    await sim.until(() => !document.querySelector('.sheet.choice'), { max: 30_000, step: 100 });
    res[speed].choiceMs = sim.t - o;
    await page.ctx.close();
  }
  const first = s => res[s].stamps[4];
  c('1×: 0→4세 소요', first(1) > 0, `${first(1)}ms`);
  c('2× 는 1× 의 약 1/2(0.4~0.65)', first(2) / first(1) >= 0.4 && first(2) / first(1) <= 0.65, `${(first(2) / first(1)).toFixed(2)}`);
  c('4× 는 1× 의 약 1/4(0.2~0.4)', first(4) / first(1) >= 0.2 && first(4) / first(1) <= 0.4, `${(first(4) / first(1)).toFixed(2)}`);
  for (const s of [1, 2, 4]) c(`${s}×: 선택 카운트다운(무응답→기본값) 12~14.5초 — 배속 무관`, res[s].choiceMs >= 12000 && res[s].choiceMs <= 14500, `${res[s].choiceMs}ms`);
  c.note('배속 측정', res);
  c.done();
});

// ───────── 성능·메모리 ─────────
test('E2E-7 성능·메모리: 완주 후 DOM 노드 수, 연 진행 1회 처리 시간, 3연속 완주 힙 증가', { timeout: 600_000 }, async () => {
  const c = checks('perf');
  // (1) 엔진 단독 연 처리 시간(실시간 시계 페이지에서 performance.now 사용)
  const page0 = await openPage(br, srv.url, {});
  await waitScreen(page0, 'home');
  const eng = await page0.evaluate(async () => {
    const m = await import('/src/engine/index.js');
    const out = { years: [], newLife: [], runToEnd: [], summarize: [], peers: [], replay: [], birthCert: [] };
    for (const seed of [1, 2, 3, 4, 5, 6, 7, 8]) {
      let t = performance.now(); const L = m.newLife({ seed }); out.newLife.push(performance.now() - t);
      t = performance.now(); m.birthCert(L); out.birthCert.push(performance.now() - t);
      t = performance.now(); m.peers(L); out.peers.push(performance.now() - t);
      let guard = 0;
      while (L.alive && guard++ < 200) {
        t = performance.now(); const r = m.advanceYear(L); out.years.push(performance.now() - t);
        if (r.choice) { t = performance.now(); m.choose(L, r.choice.defaultId, { auto: true }); out.years.push(performance.now() - t); }
      }
      t = performance.now(); m.summarize(L); out.summarize.push(performance.now() - t);
      t = performance.now(); m.replay(seed, L.choices); out.replay.push(performance.now() - t);
      const L2 = m.newLife({ seed: seed + 100 }); t = performance.now(); m.runToEnd(L2, 'cap'); out.runToEnd.push(performance.now() - t);
    }
    const st = a => { const s = [...a].sort((x, y) => x - y); return { n: s.length, avg: +(s.reduce((x, y) => x + y, 0) / s.length).toFixed(2), p95: +s[Math.floor(s.length * .95)].toFixed(2), max: +s.at(-1).toFixed(2) }; };
    return Object.fromEntries(Object.entries(out).map(([k, v]) => [k, st(v)]));
  });
  c.note('엔진 처리 시간(ms)', eng);
  c('엔진 advanceYear p95 < 16ms(한 프레임)', eng.years.p95 < 16, JSON.stringify(eng.years));
  c('summarize < 100ms · replay < 100ms · peers < 100ms', eng.summarize.max < 100 && eng.replay.max < 100 && eng.peers.max < 100, JSON.stringify({ s: eng.summarize, r: eng.replay, p: eng.peers }));
  await page0.ctx.close();

  // (2) UI 포함: CDP 메트릭으로 완주 중 스크립트·레이아웃·스타일 시간, 3연속 완주 힙
  const page = await openPage(br, srv.url, { clock: true, init: seedInit(SEEDS.long) + presetInit({ seen19: true, speed: 4, auto: true }) });
  const cdp = await page.ctx.newCDPSession(page);
  await cdp.send('Performance.enable');
  await cdp.send('HeapProfiler.enable');
  const metrics = async () => Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(m => [m.name, m.value]));
  const heap = async () => { await cdp.send('HeapProfiler.collectGarbage'); return (await metrics()).JSHeapUsedSize; };
  const sim = new Sim(page);
  await waitScreen(page, 'home');
  const heap0 = await heap();
  const runs = [];
  for (let k = 0; k < 3; k++) {
    if (k > 0) { await page.click('.actionbar [data-go="again"]'); await waitScreen(page, 'birth'); }
    else { await page.click('[data-go="born"]'); await waitScreen(page, 'birth'); }
    const m0 = await metrics();
    await page.click('[data-act="start"]'); await waitScreen(page, 'life');
    let years = 0, lastAge = -1, nodesLife = 0, maxFeed = 0;
    while ((await screen(page)) === 'life') {
      await sim.adv(500);
      const s = await page.evaluate(() => ({ age: +document.querySelector('[data-hud=age]')?.textContent, nodes: document.querySelectorAll('*').length, feed: document.querySelectorAll('.feed > li').length }));
      if (s.age !== lastAge) { lastAge = s.age; years++; }
      nodesLife = Math.max(nodesLife, s.nodes); maxFeed = Math.max(maxFeed, s.feed);
    }
    const m1 = await metrics();
    await sim.until(() => document.body.dataset.screen === 'summary', { max: 20_000 });
    const nodesSum = await page.evaluate(() => document.querySelectorAll('*').length);
    const js = (m1.ScriptDuration - m0.ScriptDuration) * 1000, lay = (m1.LayoutDuration - m0.LayoutDuration) * 1000, sty = (m1.RecalcStyleDuration - m0.RecalcStyleDuration) * 1000, task = (m1.TaskDuration - m0.TaskDuration) * 1000;
    runs.push({ run: k + 1, years, js: +js.toFixed(0), layout: +lay.toFixed(0), style: +sty.toFixed(0), task: +task.toFixed(0), perYearMs: +(task / Math.max(1, years)).toFixed(2), nodesLife, maxFeed, nodesSum, heapMB: +((await heap()) / 1048576).toFixed(2), listeners: (await cdp.send('Runtime.evaluate', { expression: 'document.querySelectorAll("*").length' })).result.value });
  }
  c.note('UI 완주 3연속(장수 시드, 4×+자동결정)', runs);
  c.note('힙 시작(MB)', +(heap0 / 1048576).toFixed(2));
  c('완주 중 피드 DOM 최대 40개 해', runs.every(r => r.maxFeed <= 40), runs.map(r => r.maxFeed).join());
  c('진행 화면 DOM 노드 < 3000', runs.every(r => r.nodesLife < 3000), runs.map(r => r.nodesLife).join());
  c('결산 DOM 노드 < 3000', runs.every(r => r.nodesSum < 3000), runs.map(r => r.nodesSum).join());
  c('연당 평균 메인 스레드 작업 < 50ms(연 진행 1회 처리)', runs.every(r => r.perYearMs < 50), runs.map(r => r.perYearMs).join());
  const growth = (runs.at(-1).heapMB - runs[0].heapMB);
  c('3연속 완주 힙 증가(2→3회) < 5MB(누수 징후 없음)', growth < 5, `${runs.map(r => r.heapMB).join(' → ')} MB`);
  c('에러 0', appErrors(page).length === 0 && page.qa.pageErrors.length === 0, appErrors(page).concat(page.qa.pageErrors).join('|'));
  c.done();
});

// ───────── 네트워크 조건(모듈 64개 · 1.3MB 비압축) ─────────
test('E2E-2f 네트워크 조건별 홈 진입 시간(CDP 스로틀, 캐시 없음)', { timeout: 300_000 }, async () => {
  const c = checks('timing-network');
  const profiles = [
    ['LTE 12Mbps/70ms', 12 * 1024 * 1024 / 8, 70],
    ['Fast 4G 4Mbps/150ms', 4 * 1024 * 1024 / 8, 150],
    ['Slow 4G 1.6Mbps/150ms', 1.6 * 1024 * 1024 / 8, 150],
  ];
  const res = {};
  for (const [name, bps, lat] of profiles) {
    const ctx = await br.newContext({ viewport: { width: 390, height: 844 }, locale: 'ko-KR' });
    const page = await ctx.newPage();
    const cdp = await ctx.newCDPSession(page);
    await cdp.send('Network.enable');
    await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
    await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: lat, downloadThroughput: bps, uploadThroughput: bps / 2 });
    await ctx.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());          // 폰트는 변수에서 제외(별도 테스트)
    const t0 = Date.now();
    await page.goto(srv.url, { waitUntil: 'commit' });
    await page.waitForFunction(() => document.body?.dataset?.screen === 'home', null, { timeout: 120_000 });
    res[name] = Date.now() - t0;
    await ctx.close();
  }
  c.note('홈 진입까지(ms, 폰트 제외, gzip 없는 개발 서버)', res);
  c('LTE: 홈 ≤ 3초', res['LTE 12Mbps/70ms'] <= 3000, `${res['LTE 12Mbps/70ms']}ms`);
  c('Fast 4G: 홈 ≤ 5초', res['Fast 4G 4Mbps/150ms'] <= 5000, `${res['Fast 4G 4Mbps/150ms']}ms`);
  c('Slow 4G: 홈 ≤ 10초', res['Slow 4G 1.6Mbps/150ms'] <= 10_000, `${res['Slow 4G 1.6Mbps/150ms']}ms`);
  c.done();
});
