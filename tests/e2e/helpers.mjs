// E2E 공용 헬퍼(QA-B). 서버 기동 · Chromium 열기 · 페이지 수집기 · 가짜 시계 진행 · 화면 이동.
// 실행: npm run test:e2e  (파일마다 서버를 따로 띄운다)
import { chromium } from 'playwright-core';
import { spawn } from 'node:child_process';
import net from 'node:net';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const SHOTS = path.join(ROOT, 'docs', 'qa', 'shots');
export const OUT = path.join(ROOT, 'docs', 'qa', 'out');          // 측정값 JSON(보고서 근거)
fs.mkdirSync(SHOTS, { recursive: true });
fs.mkdirSync(OUT, { recursive: true });

const EXE = process.env.QA_CHROMIUM
  || path.join(process.env.LOCALAPPDATA || '', 'ms-playwright', 'chromium_headless_shell-1234', 'chrome-headless-shell-win64', 'chrome-headless-shell.exe');

export const saveJson = (name, data) => fs.writeFileSync(path.join(OUT, name), JSON.stringify(data, null, 2));

// ───────── 서버 ─────────
const freePort = () => new Promise((res, rej) => {
  const s = net.createServer();
  s.listen(0, () => { const { port } = s.address(); s.close(() => res(port)); });
  s.on('error', rej);
});
export async function startServer() {
  const port = await freePort();
  const proc = spawn(process.execPath, [path.join(ROOT, 'tools', 'serve.mjs'), String(port)], { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'] });
  await new Promise((res, rej) => {
    const t = setTimeout(() => rej(new Error('server start timeout')), 8000);
    proc.stdout.on('data', d => { if (String(d).includes('http://')) { clearTimeout(t); res(); } });
    proc.on('error', rej);
  });
  return { url: `http://localhost:${port}/`, port, stop: () => proc.kill() };
}

export const launch = () => chromium.launch({ executablePath: EXE, args: ['--no-sandbox'] });

// ───────── 페이지 ─────────
// 저장소가 예외를 던지는 환경(ARCHITECTURE §14)
export const STORAGE_THROW = `
  Storage.prototype.setItem = function () { throw new DOMException('quota', 'QuotaExceededError'); };
  Storage.prototype.getItem = function () { throw new DOMException('denied', 'SecurityError'); };
  Storage.prototype.removeItem = function () { throw new DOMException('denied', 'SecurityError'); };
`;
// alert/confirm/prompt/print 호출 기록(런타임 훅) + 공유·클립보드 보조 경로 기록
const HOOKS = `
  window.__qa = { dialogs: [], canvas: [] };
  const ft = CanvasRenderingContext2D.prototype.fillText;
  CanvasRenderingContext2D.prototype.fillText = function (t, ...r) { window.__qa.canvas.push(String(t)); return ft.call(this, t, ...r); };
  // 큰 사건·속보·작은 카드의 [확인]은 이제 선택 사항(읽기 시간 뒤 저절로 닫힘, F-3) — 시나리오를 빨리 돌리려 자동 확인(읽기 시간 검증은 noAutoMajor)
  if (!window.__noAutoMajor) new MutationObserver(() => { const b = document.querySelector('.major__ok'); if (b && !b.__t) { b.__t = 1; setTimeout(() => b.click(), 60); } }).observe(document, { subtree: true, childList: true });
  for (const k of ['alert', 'confirm', 'prompt', 'print']) {
    window[k] = function () { window.__qa.dialogs.push(k); return k === 'confirm' ? false : null; };
  }
`;

/**
 * 새 페이지. opts: { w, h, scheme, reduced, clock, init, noHooks, hasTouch, storage:'throw' }
 * clock:true → 가짜 시계 설치(goto 전) 후 goto 뒤 pauseAt. 이후 page.clock.runFor로 진행.
 */
export async function openPage(browser, baseUrl, opts = {}) {
  const { w = 390, h = 844, scheme = 'light', reduced = 'no-preference', clock = false, init, hasTouch = true, storage, url = '', dpr = 2, permissions } = opts;
  const ctx = await browser.newContext({
    viewport: { width: w, height: h }, deviceScaleFactor: dpr, isMobile: false, hasTouch,
    colorScheme: scheme, reducedMotion: reduced, locale: 'ko-KR', timezoneId: 'Asia/Seoul', permissions,
  });
  const page = await ctx.newPage();
  page.qa = { errors: [], pageErrors: [], console: [], requests: [], failed: [], dialogs: [] };
  page.on('console', m => {
    page.qa.console.push({ type: m.type(), text: m.text() });
    if (m.type() === 'error') page.qa.errors.push(m.text());
  });
  page.on('pageerror', e => page.qa.pageErrors.push(String(e && e.stack || e)));
  page.on('request', r => page.qa.requests.push({ url: r.url(), type: r.resourceType() }));
  page.on('requestfailed', r => page.qa.failed.push({ url: r.url(), err: r.failure()?.errorText }));
  page.on('dialog', d => { page.qa.dialogs.push(d.type()); d.dismiss().catch(() => {}); });
  if (opts.noAutoMajor) await ctx.addInitScript('window.__noAutoMajor = true;');
  if (!opts.noHooks) await ctx.addInitScript(HOOKS);
  if (storage === 'throw') await ctx.addInitScript(STORAGE_THROW);
  if (init) await ctx.addInitScript(init);
  if (clock) await page.clock.install({ time: new Date('2026-10-15T09:00:00+09:00') });
  // 'load' 는 Google Fonts 응답까지 기다려 간헐 지연(30초+)이 생기므로 DOMContentLoaded 로 받고 부팅 화면만 확인한다.
  await page.goto(baseUrl + url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  if (clock || !opts.noBootWait) await page.waitForFunction(() => document.body?.dataset?.screen && document.body.dataset.screen !== 'boot', null, { timeout: 60000 }).catch(() => {});
  if (clock) await pauseClock(page, new Date('2026-10-15T09:00:05+09:00'));
  page.ctx = ctx;
  return page;
}

// 가짜 시계를 at(또는 그보다 뒤, 지금 시각 + 여유)에서 멈춘다. 설치된 시계는 pause 전까지 실시간으로 흐르므로
// 서버·부팅이 느리면 at 이 이미 지나 pauseAt 이 "Cannot fast-forward to the past"로 실패했다(간헐).
// 페이지 시각을 읽어 그 뒤로 클램프하고, 읽은 뒤 pauseAt 사이에 흐른 실시간 때문에 또 실패하면 여유를 늘려 다시 한다.
// frame: 시계를 읽을 프레임(샌드박스 iframe 등). 기본은 page.
export async function pauseClock(page, at, frame = page) {
  for (let i = 0; ; i++) {
    const now = await frame.evaluate(() => Date.now());
    try { return await page.clock.pauseAt(Math.max(+at, now + 250 * 2 ** i)); }
    catch (e) { if (i >= 4 || !/past/i.test(String(e?.message))) throw e; }
  }
}

// 폰트·네트워크 실패는 앱 결함이 아니므로 분리한다.
export const appErrors = page => page.qa.errors.filter(t => !/Failed to load resource|net::ERR|fonts\.(googleapis|gstatic)/.test(t));

// ───────── 화면·진행 ─────────
export const screen = page => page.evaluate(() => document.body.dataset.screen);
export const waitScreen = (page, name, timeout = 15000) =>
  page.waitForFunction(n => document.body.dataset.screen === n, name, { timeout });

// 홈 → (19세 안내) → 출생 신고서
export async function toBirth(page, { confirmGate = true } = {}) {
  await waitScreen(page, 'home');
  await page.click('[data-go="born"]');
  const s = await screen(page);
  if (s === 'gate' && confirmGate) { await page.click('[data-go="gateOk"]'); }
  await waitScreen(page, 'birth');
}
// 출생 신고서 → 진행. 출생 인트로(카드 뒤집기 → 가족사 → "몇 살까지?")가 아직 덮고 있으면 [건너뛰기]로 걷어 낸다.
export async function skipIntro(page) {
  if (await page.$('[data-cine]:not(.is-out)')) await page.click('.cine__tap');
  await page.waitForFunction(() => !document.querySelector('[data-cine]:not(.is-out)'), null, { timeout: 5000 });
}
export async function startLife(page) {
  await skipIntro(page);
  await page.click('[data-act="start"]');
  await waitScreen(page, 'life');
}

// 진행 화면 ⋯ 메뉴(가족·성향·관심사·뉴스·동갑내기)에서 시트 열기 — 예전 하단 탭(.lifebar .tabbtn) 자리
export async function menu(page, tab) {
  await page.click('.life-menu summary');
  await page.click(`.life-menu [data-tab="${tab}"]`);
}

// 가짜 시계를 step씩 진행하며 pred(페이지 안 함수)가 참이 될 때까지. 진행한 가짜 ms를 돌려준다.
export async function runUntil(page, pred, { step = 1000, max = 25 * 60_000, each } = {}) {
  let t = 0;
  while (t < max) {
    if (await page.evaluate(pred)) return t;
    await page.clock.runFor(step);
    t += step;
    if (each) await each(t);
  }
  if (await page.evaluate(pred)) return t;
  throw new Error(`runUntil 시간 초과(${max}ms)`);
}
export const isScreen = name => `document.body.dataset.screen === ${JSON.stringify(name)}`;
export const until = name => new Function(`return document.body.dataset.screen === ${JSON.stringify(name)}`);

// 선택 시트가 열려 있나
export const choiceOpen = page => page.evaluate(() => !!document.querySelector('.sheet.choice'));

export async function shot(page, name, { wait = 400, ...opts } = {}) {
  if (wait) await page.waitForTimeout(wait);                     // CSS 애니메이션(실시간) 끝날 때까지
  await page.screenshot({ path: path.join(SHOTS, name + '.png'), ...opts });
}

// 완주: 선택 시트가 뜨면 handler(page, n)로 처리(없으면 방치). 마지막 해 [마지막 페이지로]는 직접 넘겨야 하므로 눌러 준다.
// 사망 화면 도달까지. 반환 { fakeMs, choices }
export async function playToDeath(page, { handler, step = 500, max = 25 * 60_000 } = {}) {
  let t = 0, n = 0, seen = false;
  while (t < max) {
    const s = await screen(page);
    if (s === 'death' || s === 'summary') return { fakeMs: t, choices: n };
    if (await page.$('[data-act="last-record"]')) { await page.click('[data-act="last-record"]'); continue; }
    if (handler && await choiceOpen(page)) {
      if (!seen) { seen = true; n++; await handler(page, n); }
    } else seen = false;
    await page.clock.runFor(step);
    t += step;
  }
  throw new Error('playToDeath 시간 초과');
}

// 가짜 시계로 마지막 해까지 진행 → [마지막 페이지로] → 사망 화면. 자동결정이어도 마지막 해·사망 화면은 직접 넘긴다.
export async function simToDeath(page, sim, { max = 25 * 60_000, step = 500 } = {}) {
  await sim.until(() => document.body.dataset.screen === 'death' || !!document.querySelector('[data-act="last-record"]'), { max, step });
  if (await page.$('[data-act="last-record"]')) await page.click('[data-act="last-record"]');
  await waitScreen(page, 'death');
}
// 사망 화면 → 결산: 검정 마지막 페이지의 버튼 하나로 넘어간다(F-9)
export async function deathToSummary(page) {
  await waitScreen(page, 'death');
  await page.click('[data-act="sum"]');
  await waitScreen(page, 'summary');
}

export const median = a => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : null; };

// ───────── 결정적 시나리오용 ─────────
// 새 생애의 시드를 고정(UI는 crypto.getRandomValues로 시드를 만든다). seeds는 엔진 스캔으로 고른 값.
// 주의(2026-10-19): 엔진 개편 뒤 아래 주석의 사건이 더는 나오지 않는다(예: 529 → 85세 암, 10·90 민감 선택 없음, plain 67 → 장수).
// safety.test 의 민감 시나리오는 엔진 작업이 끝난 뒤 시드를 다시 스캔해야 한다.
export const SEEDS = {
  plain: 67,        // 23세 사망(선택 8회), 비교 카드 7·19세
  sensDeath: 226,   // 23세, 고의적 자해 사망(민감)
  sensChoice: 24,   // 13세 민감 선택(illness, school.low.mood)
  sensChoiceV: 9,   // 9세 민감 선택(violence, school.bully.witness)
  sensLog: 16,      // 1세 민감 피드(형제 사망)
  infant: 25,       // 0세 사망
  long: 20,         // 107세 사망(15분 상한 압박)
  short: 8,         // 3세 사망, 선택 0회
};
export const seedInit = seed => `(() => { const o = crypto.getRandomValues.bind(crypto);
  crypto.getRandomValues = function (a) { if (a instanceof Uint32Array && a.length === 1) { a[0] = ${seed}; return a; } return o(a); }; })();`;
// 설정을 먼저 심는다(세션당 1회 — 새로 고침 뒤에는 덮어쓰지 않는다)
export const presetInit = (obj, extra = {}) => `(() => { try { if (sessionStorage.getItem('__qa_seeded')) return; sessionStorage.setItem('__qa_seeded', '1');
  localStorage.setItem('hj.v1.settings', JSON.stringify(${JSON.stringify(obj)}));
  const x = ${JSON.stringify(extra)}; for (const k in x) localStorage.setItem(k, JSON.stringify(x[k])); } catch {} })();`;

// 가짜 시계 진행 + 누적(가짜 ms)
export class Sim {
  constructor(page) { this.page = page; this.t = 0; }
  async adv(ms) { await this.page.clock.runFor(ms); this.t += ms; }
  // 조건이 참이 될 때까지 step씩(기본 250ms). 참이 된 시각(t)을 돌려준다.
  async until(pred, { step = 250, max = 25 * 60_000, arg } = {}) {
    const t0 = this.t;
    while (this.t - t0 < max) {
      if (await this.page.evaluate(pred, arg)) return this.t;
      await this.adv(step);
    }
    throw new Error(`Sim.until 시간 초과(${max}ms)`);
  }
}

// 금지 문구(결산·카드·공유 문구): 백분위·순위·직급·금액
// '장기요양 N등급'은 돌봄 제도 사실(사람 서열 아님)이라 등급에서 뺀다
export const RE_RANK = /백분위|순위|상위\s*\d|하위\s*\d|\d\s*%\s*(상위|하위)|(?<!장기요양\s*\d\s*)등급|승리|패배|성공한|실패한/;
export const RE_MONEY = /\d[\d,]*(\.\d+)?\s*(만\s?원|억\s?원?|천\s?원|원\b|만원)/;
export const RE_JOBRANK = /(대리|과장|차장|부장|이사|상무|전무|사장|임원|팀장)(으로|급)|직급\s*[:은이]/;
export const RE_CAUSE_SENS = /자해|자살|극단적/;

export const pageText = (page, sel = 'body') => page.evaluate(s => document.querySelector(s)?.innerText ?? '', sel);

// 소프트 단언: 전부 돌며 실패를 모았다가 마지막에 한 번에 실패시킨다. 결과는 docs/qa/out/<id>.json
import assert from 'node:assert/strict';
export function checks(id) {
  const list = [];
  const f = (name, ok, detail = '') => {
    list.push({ name, ok: !!ok, detail: String(detail ?? '') });
    if (!ok) console.log(`  FAIL [${id}] ${name} ${detail}`);
  };
  f.list = list;
  f.note = (name, detail) => { list.push({ name, ok: true, note: true, detail: typeof detail === 'string' ? detail : JSON.stringify(detail) }); };
  f.done = () => {
    saveJson(`${id}.json`, list);
    const bad = list.filter(x => !x.ok);
    assert.equal(bad.length, 0, bad.map(b => `${b.name} ${b.detail}`).join('\n'));
  };
  return f;
}

// 금지 문구 탐지: "순위가 아니라"처럼 부정하는 안내 문장은 제외하고, 문장 단위로 걸러 낸다.
export function forbiddenHits(text, res = [RE_RANK, RE_JOBRANK]) {
  const hits = [];
  for (const sent of String(text).split(/\n|(?<=[.?!])\s+/)) {
    if (/아니|아님|않습니다|없습니다|아닙니다/.test(sent)) continue;
    for (const re of res) { const m = sent.match(re); if (m) hits.push(`${m[0]} ← ${sent.trim().slice(0, 60)}`); }
  }
  return hits;
}
