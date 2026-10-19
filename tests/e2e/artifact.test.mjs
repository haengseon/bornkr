// E2E-6 Artifact 배포 제약(ARCHITECTURE §17): title 위치, 외부 리소스, 금지 API, 토큰 색, 폰트 장애, 샌드박스 iframe·claude.hot.
import test from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import {
  startServer, launch, openPage, appErrors, screen, waitScreen, shot, Sim, seedInit, presetInit, SEEDS, checks, ROOT, saveJson, pageText, simToDeath, deathToSummary, menu, pauseClock,
} from './helpers.mjs';

let srv, br;
test.before(async () => { srv = await startServer(); br = await launch(); });
test.after(async () => { await br?.close(); srv?.stop(); });

// core.autocrlf=true 체크아웃은 CRLF — 다크 블록 정규식이 깨지지 않게 LF로 맞춘다
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8').replace(/\r\n/g, '\n');
const walkDir = (d, out = []) => { for (const f of fs.readdirSync(path.join(ROOT, d), { withFileTypes: true })) { const p = path.join(d, f.name); if (f.isDirectory()) walkDir(p, out); else out.push(p); } return out; };
const lineOf = (txt, idx) => txt.slice(0, idx).split('\n').length;

test('E2E-6a 정적 검사: <title> 8KB 안, 금지 API grep, 외부 URL, localStorage, 색 리터럴', () => {
  const c = checks('artifact-static');
  const html = read('index.html');
  const ti = Buffer.from(html).indexOf('<title>');
  c('<title> 이 파일 앞 8KB 안', ti >= 0 && ti < 8192, `offset ${ti}`);
  const title = html.match(/<title>([^<]*)<\/title>/)?.[1];
  c.note('<title> 값', title);
  c('<title> 2~4 단어 이름(Artifact 규약: "Name: explainer" 금지)', title && title.split(/\s+/).length <= 4 && !/:/.test(title), title);
  c.note('UI-SPEC §1 예시 title 은 "태어나보니 대한민국: 한 번뿐인 인생"(콜론형) — 구현은 짧은 이름(fe-notes 의도)', title);
  c('index.html: 외부 <script src> 없음(모듈 상대경로만)', [...html.matchAll(/<script[^>]*src="([^"]+)"/g)].every(m => !/^https?:/.test(m[1])), '');
  const links = [...html.matchAll(/<link[^>]*href="([^"]+)"/g)].map(m => m[1]);
  // rel=canonical 은 자기 배포 주소(a9631f1)를 가리킬 뿐 리소스를 받지 않는다 — 그 밖의 외부 <link>는 Google Fonts만
  const canon = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  c('index.html: <link> 외부는 Google Fonts(googleapis/gstatic) + 자기 canonical(bornkr.click)만', links.filter(h => /^https?:/.test(h)).every(h => /^https:\/\/fonts\.(googleapis|gstatic)\.com/.test(h) || (h === canon && /^https:\/\/bornkr\.click\/$/.test(h))), links.join(' '));
  c('index.html: 폰트 대체 스택(--font-*) + font-display=swap', /display=swap/.test(html) && /--font-sans:[^;]*(sans-serif|system-ui)/.test(read('styles.css')), '');
  c('index.html: lang=ko · viewport-fit=cover · color-scheme meta', /<html lang="ko"/.test(html) && /viewport-fit=cover/.test(html) && /name="color-scheme" content="light dark"/.test(html), '');

  const files = [...walkDir('src').filter(f => f.endsWith('.js')), 'index.html', 'styles.css'];
  const ui = files.filter(f => /^src[\\/](ui|main\.js)/.test(f) || f === 'src\\main.js' || f === 'src/main.js' || f === 'index.html');
  const hits = { dialog: [], print: [], download: [], share: [], tel: [], fetch: [], eval: [], docwrite: [], ext: [], ls: [], cookie: [] };
  for (const f of files) {
    // 주석은 제외(코드 문서화 문구의 "prompt(" 등 오탐 방지). URL의 // 는 보존.
    const t = read(f).replace(/\r/g, '').replace(/(^|[^:])\/\/.*$/gm, '$1').replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' '));
    const find = (re, key) => { for (const m of t.matchAll(re)) hits[key].push(`${f}:${lineOf(t, m.index)} ${m[0].trim().slice(0, 50)}`); };
    find(/(?<![.\w$])(alert|confirm|prompt)\s*\(/g, 'dialog');
    find(/window\.(alert|confirm|prompt|print)\b|\.print\s*\(|\bprint\s*\(\)/g, 'print');
    find(/\bdownload\b/g, 'download');
    find(/navigator\.(share|canShare)/g, 'share');
    find(/tel:/g, 'tel');
    find(/\bfetch\s*\(|XMLHttpRequest|WebSocket|sendBeacon|EventSource/g, 'fetch');
    find(/\beval\s*\(|new Function\s*\(|document\.write/g, 'eval');
    find(/localStorage|indexedDB/g, 'ls');
    // sessionStorage: 카드 접힘 같은 탭 한정 편의값(0ba9a1a) — 같은 줄 try/catch 로 감쌌는지만 본다
    for (const m of t.matchAll(/sessionStorage/g)) { const ln = t.split('\n')[lineOf(t, m.index) - 1]; if (!/index\.html/.test(f) && !/try \{[\s\S]*\} catch/.test(ln)) hits.ls.push(`${f}:${lineOf(t, m.index)} sessionStorage(try/catch 없음)`); }
    find(/document\.cookie/g, 'cookie');
    if (/^src[\\/](ui|main)/.test(f) || f === 'index.html' || f === 'styles.css') find(/https?:\/\/[^\s"'`)]+/g, 'ext');
  }
  c('alert/confirm/prompt 호출 0(grep)', hits.dialog.length === 0, hits.dialog.join(' | '));
  c('window.print 0(grep)', hits.print.length === 0, hits.print.join(' | '));
  c('fetch/XHR/WebSocket/eval/document.write 0', hits.fetch.length === 0 && hits.eval.length === 0, hits.fetch.concat(hits.eval).join(' | '));
  c('document.cookie 0', hits.cookie.length === 0);
  c('localStorage 접근은 src/ui/store.js + index.html 인라인(try/catch)에만, sessionStorage 는 try/catch 안에서만', hits.ls.every(h => /store\.js|index\.html/.test(h) && !/try\/catch 없음/.test(h)), hits.ls.join(' | '));
  const stSrc = read('src/ui/store.js');
  c('store.js: get/put 모두 try/catch', /function get[\s\S]*?try \{[\s\S]*?\} catch/.test(stSrc) && /function put[\s\S]*?try \{[\s\S]*?\} catch/.test(stSrc), '');
  c('index.html 인라인 부트 스크립트 try/catch', /<script>[\s\S]*try \{[\s\S]*localStorage[\s\S]*\} catch/.test(html), '');
  c.note('<a download> 사용(UI-SPEC §5 S11: 쓰지 않는다 / fe-notes: 일반 웹 최상위 창에서만 보조)', hits.download);
  c.note('Web Share 사용(보조 경로: canShare(files)일 때만 버튼 노출)', hits.share);
  c.note('tel: 사용(S15 도움 시트 보조 링크)', hits.tel);
  const extUi = hits.ext.filter(h => !/fonts\.(googleapis|gstatic)\.com|claude\.com/.test(h) && !/^index\.html:\d+ https:\/\/bornkr\.click\/$/.test(h));
  c('UI 코드 외부 URL 은 Google Fonts 외 없음(코드·CSS·HTML)', extUi.length === 0, extUi.join(' | '));
  c.note('UI 코드 외부 URL 목록', hits.ext);

  // 색 토큰: :root 블록 밖 리터럴 색 금지
  const css = read('styles.css');
  const stripBlocks = css
    .replace(/@media \(prefers-color-scheme: dark\) \{\s*:root:not\(\[data-theme="light"\]\) \{[\s\S]*?\n  \}\n\}/, '')
    .replace(/:root\[data-theme="dark"\] \{[\s\S]*?\n\}/, '')
    .replace(/:root \{[\s\S]*?\n\}/, '');
  const lit = [];
  const commentless = stripBlocks.replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' '));
  for (const m of commentless.matchAll(/#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(|\boklch\(|\bcolor\(|:\s*(white|black|red|green|blue|gray|grey|orange|yellow|purple)\b/g)) lit.push(`styles.css:${lineOf(commentless, m.index)} ${m[0]}`);
  c('styles.css: :root 토큰 블록 밖에 리터럴 색 없음', lit.length === 0, lit.slice(0, 8).join(' | '));
  const ui_js = ['src/ui/dom.js', 'src/ui/play.js', 'src/ui/screens.js', 'src/ui/sheets.js', 'src/ui/labels.js'].map(f => [f, read(f)]);
  const litJs = [];
  for (const [f, t] of ui_js) for (const m of t.matchAll(/#[0-9a-fA-F]{6}\b|\brgba?\(|style\.(color|background)/g)) litJs.push(`${f}:${lineOf(t, m.index)} ${m[0]}`);
  c('UI JS(캔버스 제외)에 리터럴 색·색 스타일 조작 없음', litJs.length === 0, litJs.join(' | '));
  const cardsJs = read('src/ui/cards.js');
  const cardLit = [...cardsJs.matchAll(/#[0-9a-fA-F]{6}\b/g)].map(m => `cards.js:${lineOf(cardsJs, m.index)} ${m[0]}`);
  c.note('cards.js 의 #hex 는 토큰 읽기 실패 시 대체값(v(name, fallback))뿐', cardLit.length);
  c('cards.js: 캔버스 색은 --card-* 토큰을 읽는다(getComputedStyle)', /getPropertyValue/.test(cardsJs) && /--card-paper/.test(cardsJs));
  // 다크 패턴 동기화
  const grabVars = blk => Object.fromEntries([...blk.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map(m => [m[1], m[2].trim()]));
  const m1 = css.match(/@media \(prefers-color-scheme: dark\) \{\s*:root:not\(\[data-theme="light"\]\) \{([\s\S]*?)\n  \}\n\}/);
  const m2 = css.match(/:root\[data-theme="dark"\] \{([\s\S]*?)\n\}/);
  c('다크: 두 블록(:root:not([data-theme=light]) 미디어 + [data-theme=dark]) 존재', !!m1 && !!m2, '');
  if (m1 && m2) {
    const a = grabVars(m1[1]), b = grabVars(m2[1]);
    const ka = Object.keys(a), kb = Object.keys(b);
    const diff = ka.filter(k => a[k] !== b[k]).concat(kb.filter(k => !(k in a)));
    c('다크 두 블록의 토큰 값이 동일(시스템 다크 = 수동 다크)', diff.length === 0, diff.join());
    const rootBlk = css.match(/:root \{([\s\S]*?)\n\}/)[1];
    const root = grabVars(rootBlk);
    const required = ['--bg', '--paper', '--ink', '--ink-2', '--ink-3', '--rule', '--accent', '--on-accent', '--seal', '--warn', '--danger'];
    c('다크가 필수 색 토큰을 모두 재정의(--card-* 제외)', required.every(k => k in a), required.filter(k => !(k in a)).join());
    c.note('라이트→다크 재정의 토큰 수', { dark: ka.length });
  }
  c('body { background: var(--bg) }', /body \{[^}]*background: var\(--bg\)/.test(css), '');
  c('색 scheme: 라이트/다크 블록에 color-scheme 선언', /color-scheme: light/.test(css) && (css.match(/color-scheme: dark/g) || []).length >= 2, '');
  // 포커스 가시성 / 모션 규칙
  c('CSS: :focus-visible 3px 링', /:focus-visible \{[^}]*outline: 3px solid var\(--accent\)/.test(css), '');
  c('CSS: prefers-reduced-motion + data-motion=reduce 모두 있음', /prefers-reduced-motion: reduce/.test(css) && /data-motion="reduce"/.test(css), '');
  c.done();
});

test('E2E-6b 네트워크: 완주 중 요청은 localhost + Google Fonts 만, 금지 호출 0', { timeout: 300_000 }, async () => {
  const c = checks('artifact-network');
  const page = await openPage(br, srv.url, { clock: true, init: seedInit(SEEDS.plain) + presetInit({ seen19: false, speed: 4, auto: true }) });
  const sim = new Sim(page);
  await waitScreen(page, 'home');
  await page.click('[data-go="born"]'); await waitScreen(page, 'gate'); await page.click('[data-go="gateOk"]'); await waitScreen(page, 'birth');
  await page.click('[data-act="start"]'); await waitScreen(page, 'life');
  await simToDeath(page, sim); await deathToSummary(page);
  await page.click('[data-card="verdict"]');
  for (let i = 0; i < 40 && !(await page.evaluate(() => (document.querySelector('.share__img')?.src || '').startsWith('data:'))); i++) { await sim.adv(300); await page.waitForTimeout(80); }
  await page.keyboard.press('Escape'); await sim.adv(50);
  await page.click('.sum-more [data-go="archive"]'); await waitScreen(page, 'archive');
  await page.click('.topbar [data-go="home"]'); await waitScreen(page, 'home');
  await page.click('[data-go="codex"]'); await page.waitForSelector('table.stat-table');
  await page.click('.topbar [data-go="home"]'); await waitScreen(page, 'home');
  await page.click('[data-go="settings"]'); await waitScreen(page, 'settings');
  const reqs = page.qa.requests;
  const hosts = {};
  for (const r of reqs) { const u = new URL(r.url); const h = u.protocol === 'data:' ? 'data:' : u.host.replace(/:\d+$/, ''); (hosts[h] ||= new Set()).add(r.type); }
  const ext = Object.keys(hosts).filter(h => h !== 'localhost' && h !== 'data:' && h !== 'blob:');
  c('외부 호스트는 fonts.googleapis.com / fonts.gstatic.com 뿐', ext.every(h => /^fonts\.(googleapis|gstatic)\.com$/.test(h)), ext.join());
  c('fonts.googleapis.com 은 stylesheet 만, gstatic 은 font 만', [...(hosts['fonts.googleapis.com'] || [])].every(t => t === 'stylesheet') && [...(hosts['fonts.gstatic.com'] || [])].every(t => t === 'font'), JSON.stringify(Object.fromEntries(Object.entries(hosts).map(([k, v]) => [k, [...v]]))));
  c('fetch/xhr/websocket/ping 요청 0', !reqs.some(r => ['fetch', 'xhr', 'websocket', 'ping', 'eventsource', 'beacon'].includes(r.type)), reqs.filter(r => ['fetch', 'xhr', 'websocket', 'ping'].includes(r.type)).map(r => r.url).join());
  c('외부 script·image·media 요청 0', !reqs.some(r => !/^http:\/\/localhost|^data:|^blob:/.test(r.url) && ['script', 'image', 'media'].includes(r.type)), '');
  const own = reqs.filter(r => r.url.startsWith(srv.url));
  c.note('자체 요청 수 / 총 요청 수', { own: own.length, total: reqs.length, scripts: own.filter(r => r.type === 'script').length });
  c.note('호스트별 유형', Object.fromEntries(Object.entries(hosts).map(([k, v]) => [k, [...v]])));
  c('실패한 요청 0(폰트 포함)', page.qa.failed.length === 0, page.qa.failed.map(f => f.url.slice(0, 80) + ' ' + f.err).join(' | '));
  c('alert/confirm/prompt/print 런타임 호출 0', (await page.evaluate(() => window.__qa.dialogs)).length === 0 && page.qa.dialogs.length === 0);
  c('콘솔·페이지 에러 0', appErrors(page).length === 0 && page.qa.pageErrors.length === 0, appErrors(page).concat(page.qa.pageErrors).join('|'));
  c.done();
});

// 색 토큰 센티널: 모든 색 토큰을 고유색으로 덮어쓰고, 화면 전체의 계산된 색이 그 집합에 들어가는지
function sentinelAudit() {
  const root = document.documentElement;
  const kill = document.createElement('style'); kill.textContent = '*, *::before, *::after { transition: none !important; animation: none !important; }'; document.head.append(kill);
  const names = [];
  for (const sh of document.styleSheets) { let rules; try { rules = sh.cssRules; } catch { continue; } for (const rule of rules) {
    const styles = rule.style ? [rule] : [...(rule.cssRules || [])];
    for (const r of styles) { if (!r.style) continue; if (!/^:root/.test(r.selectorText || '')) continue; for (const p of r.style) if (p.startsWith('--') && /^(--(bg|paper|paper-2|ink|ink-2|ink-3|rule|rule-2|accent|on-accent|seal|warn|danger|good|scrim|ring-wave|cine-.*|sc-.*|card-.*|news-.*|topic-.*|id-.*))$/.test(p)) names.push(p); }
  } }
  const uniq = [...new Set(names)];
  const set = new Map();
  uniq.forEach((n, i) => { const rgb = [201 + (i % 50), 17 + (i * 3) % 200, 33 + (i * 5) % 200]; set.set(rgb.join(','), n); root.style.setProperty(n, `rgb(${rgb.join(',')})`); });
  root.style.setProperty('--shadow-float', '0 0 0 1px rgb(201,17,33)');
  root.style.setProperty('--shadow-sheet', '0 0 0 1px rgb(201,17,33)');
  root.style.setProperty('--shadow-menu', '0 0 0 1px rgb(201,17,33)');
  const leaks = new Map();
  const parse = s => [...String(s).matchAll(/rgba?\(([^)]+)\)/g)].map(m => m[1].split(/[ ,/]+/).filter(Boolean).slice(0, 4).map(Number));
  const check = (el, pseudo, prop, val) => {
    for (const p of parse(val)) {
      const a = p.length > 3 ? p[3] : 1; if (a === 0) continue;
      if (set.has(p.slice(0, 3).join(','))) continue;
      if (/shadow/.test(prop) && p[0] === 201) continue;
      const key = `${prop}: rgb(${p.slice(0, 3)}) a=${a}`;
      if (!leaks.has(key)) leaks.set(key, []);
      if (leaks.get(key).length < 3) leaks.get(key).push(el.tagName.toLowerCase() + '.' + (typeof el.className === 'string' ? el.className.split(' ').join('.') : '') + (pseudo || ''));
    }
  };
  const props = ['color', 'background-color', 'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color', 'outline-color', 'text-decoration-color', 'box-shadow', 'fill', 'stroke', 'caret-color', 'column-rule-color'];
  let n = 0;
  for (const el of document.querySelectorAll('body, body *')) {
    for (const ps of [null, '::before', '::after']) {
      const cs = getComputedStyle(el, ps);
      if (ps && (cs.content === 'none' || cs.content === 'normal')) continue;
      for (const p of props) {
        if (/^border-/.test(p) && cs.getPropertyValue(p.replace('color', 'style')) === 'none') continue;
        if ((p === 'fill' || p === 'stroke') && (!(el instanceof SVGElement) || el.tagName.toLowerCase() === 'svg')) continue;
        if (p === 'outline-color' && cs.outlineStyle === 'none') continue;
        if (p === 'text-decoration-color' && cs.textDecorationLine === 'none') continue;
        check(el, ps, p, cs.getPropertyValue(p));
      }
      n++;
    }
  }
  return { tokens: uniq.length, elements: n, leaks: [...leaks.entries()].map(([k, v]) => `${k} ← ${v.join(', ')}`) };
}

test('E2E-6c 토큰 센티널: 모든 색 토큰을 덮어써도 화면의 색은 토큰에서만 나온다 + 캔버스 카드 토큰', { timeout: 300_000 }, async () => {
  const c = checks('artifact-tokens');
  const page = await openPage(br, srv.url, { clock: true, init: seedInit(SEEDS.plain) + presetInit({ seen19: true, speed: 4, auto: true }) });
  const sim = new Sim(page);
  const leaks = {};
  const run = async label => { await page.waitForTimeout(450); const r = await page.evaluate(sentinelAudit); leaks[label] = r; return r; };
  await waitScreen(page, 'home');
  const r0 = await run('home');
  c('토큰 수집(:root 색 토큰 ≥ 20개)', r0.tokens >= 20, r0.tokens);
  await page.click('[data-go="born"]'); await waitScreen(page, 'birth'); await sim.adv(300); await run('birth');
  await page.click('[data-act="start"]'); await waitScreen(page, 'life');
  await sim.until(() => !!document.querySelector('.sheet.choice') , { max: 200_000 }); await run('choice');
  await sim.until(() => !document.querySelector('.sheet'), { max: 120_000, step: 250 });
  await menu(page, 'peers'); await page.waitForSelector('.compare-sheet'); await run('compare'); await page.keyboard.press('Escape');
  await sim.until(() => !document.querySelector('.sheet') && +document.querySelector('[data-hud=age]').textContent >= 10, { max: 300_000, step: 250 });
  await run('life');
  await page.click('.sbar [data-tab="stats"]'); await page.waitForSelector('.sheet .metric'); await page.evaluate(() => { document.querySelector('.sheet details.metric').open = true; }); await run('stats-sheet'); await page.keyboard.press('Escape');
  await simToDeath(page, sim); await run('death');
  await page.click('[data-act="sum"]'); await waitScreen(page, 'summary'); await page.evaluate(() => document.querySelectorAll('details').forEach(d => { d.open = true; })); await run('summary');
  // 공유 카드(캔버스) — --card-paper 센티널이 그대로 배경 픽셀이 되는가
  await page.click('[data-card="verdict"]');
  for (let i = 0; i < 40 && !(await page.evaluate(() => (document.querySelector('.share__img')?.src || '').startsWith('data:'))); i++) { await sim.adv(300); await page.waitForTimeout(80); }
  await page.keyboard.press('Escape');
  await page.evaluate(() => { const root = document.documentElement; root.style.setProperty('--card-paper', 'rgb(11, 22, 33)'); root.style.setProperty('--card-ink', 'rgb(44, 55, 66)'); });
  await page.click('[data-card="birth"]');
  for (let i = 0; i < 40 && !(await page.evaluate(() => (document.querySelector('.share__img')?.src || '').startsWith('data:'))); i++) { await sim.adv(300); await page.waitForTimeout(80); }
  await page.waitForTimeout(300);
  const px = await page.evaluate(async () => {
    const im = document.querySelector('.share__img');
    await im.decode().catch(() => {});
    const cv = document.createElement('canvas'); cv.width = cv.height = 8; const ctx = cv.getContext('2d');
    ctx.drawImage(im, 5, 5, 4, 4, 0, 0, 4, 4);
    return { corner: [...ctx.getImageData(1, 1, 1, 1).data].slice(0, 3), w: im.naturalWidth };
  }).catch(e => ({ err: String(e) }));
  c.note('캔버스 모서리 픽셀(센티널 --card-paper rgb(11,22,33))', px);
  c('공유 카드 캔버스 배경색이 --card-paper 토큰을 따른다', px.corner && px.corner.join() === '11,22,33', JSON.stringify(px));
  for (const [label, r] of Object.entries(leaks)) c(`[${label}] 토큰 밖 색 없음(요소 ${r.elements}개 검사)`, r.leaks.length === 0, r.leaks.slice(0, 6).join(' || '));
  saveJson('artifact-token-leaks.json', leaks);
  c.done();
});

test('E2E-6d 폰트 장애: Google Fonts 차단·지연에도 동작(대체 글꼴), 카드 렌더', { timeout: 300_000 }, async () => {
  const c = checks('artifact-fonts');
  // (1) 차단
  {
    const page = await openPage(br, srv.url, { clock: true, init: seedInit(SEEDS.plain) + presetInit({ seen19: true, speed: 4, auto: true }), });
    await page.close();
  }
  const ctx = await br.newContext({ viewport: { width: 390, height: 844 }, locale: 'ko-KR' });
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  const page = await ctx.newPage();
  const errs = [], perrs = [];
  page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|net::ERR/.test(m.text())) errs.push(m.text()); });
  page.on('pageerror', e => perrs.push(String(e)));
  const t0 = Date.now();
  await page.goto(srv.url);
  await page.waitForFunction(() => document.body.dataset.screen === 'home');
  const tHome = Date.now() - t0;
  c('폰트 차단: 홈 렌더(대체 글꼴)', true);
  c.note('폰트 차단 시 홈까지', `${tHome}ms`);
  const fam = await page.evaluate(() => getComputedStyle(document.querySelector('.home__title')).fontFamily);
  c.note('h1 font-family 스택', fam);
  await page.click('[data-go="born"]'); await page.click('[data-go="gateOk"]');
  await page.waitForFunction(() => document.body.dataset.screen === 'birth');
  await page.click('[data-act="share"]');
  const t1 = Date.now();
  await page.waitForFunction(() => (document.querySelector('.share__img')?.src || '').startsWith('data:'), null, { timeout: 15000 });
  const tCard = Date.now() - t1;
  c('폰트 차단: 공유 카드가 대기 상한(1.5초) 근처에서 대체 글꼴로 렌더', tCard < 4000, `${tCard}ms`);
  c('폰트 차단: 에러 0', errs.length === 0 && perrs.length === 0, errs.concat(perrs).join('|'));
  await page.screenshot({ path: path.join(ROOT, 'docs', 'qa', 'shots', 'artifact-fonts-blocked-card.png') });
  await ctx.close();
  // (2) 지연: 스타일시트를 6초 붙잡는다
  const ctx2 = await br.newContext({ viewport: { width: 390, height: 844 }, locale: 'ko-KR' });
  await ctx2.route(/fonts\.googleapis\.com/, async r => { await new Promise(res => setTimeout(res, 6000)); r.continue().catch(() => {}); });
  const p2 = await ctx2.newPage();
  const s0 = Date.now();
  await p2.goto(srv.url, { waitUntil: 'commit' });
  await p2.waitForFunction(() => document.body?.dataset?.screen === 'home', null, { timeout: 30000 });
  const tSlow = Date.now() - s0;
  c.note('Google Fonts CSS 6초 지연 시 홈까지', `${tSlow}ms`);
  c('폰트 CSS 가 느려도 앱 시작이 막히지 않음(홈 ≤ 3초) — 렌더 차단 스타일시트 여부', tSlow <= 3000, `${tSlow}ms (스타일시트가 렌더·모듈 스크립트를 차단하면 6초+)`);
  await ctx2.close();
  c.done();
});

test('E2E-6e Artifact 뷰어 모사: claude.hot 스냅숏·이어 하기, 샌드박스 iframe(저장소·클립보드 차단), 다운로드/공유 보조 경로', { timeout: 300_000 }, async () => {
  const c = checks('artifact-viewer');
  // (1) window.claude.hot
  const hotInit = data => `window.claude = { hot: { data: ${JSON.stringify(data)}, snapshot(fn) { window.__snap = fn; }, ready() { window.__ready = (window.__ready || 0) + 1; } } };`;
  let page = await openPage(br, srv.url, { clock: true, init: hotInit(null) + seedInit(SEEDS.plain) + presetInit({ seen19: true, speed: 1, auto: false }) });
  let sim = new Sim(page);
  await waitScreen(page, 'home');
  const h0 = await page.evaluate(() => ({ ready: window.__ready, snap: typeof window.__snap, home: window.__snap?.() }));
  c('claude.hot: ready() 호출 + snapshot 콜백 등록', h0.ready === 1 && h0.snap === 'function', JSON.stringify(h0));
  c('홈에서는 스냅숏 null', h0.home === null, JSON.stringify(h0.home));
  await page.click('[data-go="born"]'); await waitScreen(page, 'birth'); await page.click('[data-act="start"]'); await waitScreen(page, 'life');
  await sim.adv(30_000);
  const snap = await page.evaluate(() => window.__snap());
  c('진행 중 스냅숏 {seed,choices,elapsed,age,name,year}', snap && snap.seed === SEEDS.plain && Array.isArray(snap.choices) && snap.elapsed > 0 && snap.age >= 1 && !!snap.name, JSON.stringify(snap));
  // 공유 시트의 다운로드 링크는 claude 환경에서 숨김
  await page.close();
  page = await openPage(br, srv.url, { init: hotInit(snap) + seedInit(SEEDS.plain) + presetInit({ seen19: true, speed: 1, auto: false }) });
  await page.waitForFunction(() => document.body.dataset.screen === 'life', null, { timeout: 15000 }).catch(() => {});
  const resumed = await page.evaluate(() => ({ screen: document.body.dataset.screen, age: document.querySelector('[data-hud=age]')?.textContent, banner: document.querySelector('.banner')?.hidden === false, ready: window.__ready }));
  c('hot.data 가 있으면 부팅 시 재현해 진행 화면으로 이어 하기', resumed.screen === 'life' && +resumed.age === snap.age, JSON.stringify({ resumed, snapAge: snap.age }));
  c('이어 하기 시 멈춤 띠 표시', resumed.banner, '');
  c('hot.ready() 호출', resumed.ready === 1, resumed.ready);
  // claude 환경: 다운로드 링크 숨김
  sim = new Sim(page);
  await page.waitForTimeout(100);
  await page.close();

  // (2) 일반 웹 + claude 환경 비교: 공유 시트의 보조 경로
  for (const env of ['web', 'claude']) {
    const p = await openPage(br, srv.url, { clock: true, init: (env === 'claude' ? hotInit(null) : '') + seedInit(SEEDS.short) + presetInit({ seen19: true, speed: 4, auto: true }) });
    const s = new Sim(p);
    await waitScreen(p, 'home'); await p.click('[data-go="born"]'); await waitScreen(p, 'birth'); await p.click('[data-act="start"]'); await waitScreen(p, 'life');
    await simToDeath(p, s, { max: 600_000 }); await deathToSummary(p);
    await p.click('[data-card="verdict"]');
    for (let i = 0; i < 40 && !(await p.evaluate(() => (document.querySelector('.share__img')?.src || '').startsWith('data:'))); i++) { await s.adv(300); await p.waitForTimeout(80); }
    await p.waitForTimeout(300);
    const d = await p.evaluate(() => ({ dl: !!document.querySelector('a[download]'), share: document.querySelector('[data-act=share]') ? !document.querySelector('[data-act=share]').hidden : null, copy: !!document.querySelector('[data-act=copy]'), canShare: typeof navigator.canShare, hint: document.querySelector('.share__hint')?.textContent }));
    c(`[${env}] 기본 경로(길게 눌러 저장 안내 + 문구 복사) 존재`, d.copy && /길게 눌러/.test(d.hint), JSON.stringify(d));
    c.note(`[${env}] <a download> 노출 여부(보조)`, d.dl);
    if (env === 'claude') c('[claude] Artifact 뷰어 환경에서는 <a download> 숨김', !d.dl, JSON.stringify(d));
    c.note(`[${env}] 공유하기 버튼 노출(headless canShare=${d.canShare})`, d.share);
    await p.ctx.close();
  }
  // (3) Web Share: canShare 거짓 → 버튼 숨김, 참 → 버튼 + navigator.share(files)
  for (const can of [false, true]) {
    const p = await openPage(br, srv.url, { clock: true, init: `navigator.canShare = () => ${can}; window.__shared = []; navigator.share = d => { window.__shared.push({ files: (d.files || []).length, text: !!d.text }); return Promise.resolve(); };` + seedInit(SEEDS.short) + presetInit({ seen19: true, speed: 4, auto: true }) });
    const s = new Sim(p);
    await waitScreen(p, 'home'); await p.click('[data-go="born"]'); await waitScreen(p, 'birth');
    await p.click('[data-act="share"]');
    for (let i = 0; i < 40 && !(await p.evaluate(() => (document.querySelector('.share__img')?.src || '').startsWith('data:'))); i++) { await s.adv(300); await p.waitForTimeout(80); }
    await p.waitForTimeout(500);
    const vis = await p.evaluate(() => !document.querySelector('.share__actions [data-act=share]').hidden);
    c(`Web Share: canShare=${can} → 공유하기 버튼 ${can ? '노출' : '숨김'}`, vis === can, vis);
    if (can) { await p.click('.share__actions [data-act=share]'); const sh = await p.evaluate(() => window.__shared); c('공유하기 → navigator.share({files, text})', sh.length === 1 && sh[0].files === 1 && sh[0].text, JSON.stringify(sh)); }
    await p.ctx.close();
  }

  // (4) 샌드박스 iframe: allow-scripts 만(불투명 오리진 → localStorage 접근 SecurityError, 클립보드 차단)
  const host = await openPage(br, srv.url, { clock: true, noHooks: true, url: 'tools-none-404' }).catch(() => null);
  if (host) await host.ctx.close();
  const hostCtx = await br.newContext({ viewport: { width: 390, height: 844 }, locale: 'ko-KR' });
  const hp = await hostCtx.newPage();
  const perrs = [], errs = [];
  hp.on('pageerror', e => perrs.push(String(e)));
  hp.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|net::ERR/.test(m.text())) errs.push(m.text()); });
  await hp.clock.install({ time: new Date('2026-10-15T09:00:00+09:00') });
  await hostCtx.route(/localhost/, async r => { const resp = await r.fetch(); await r.fulfill({ response: resp, headers: { ...resp.headers(), 'access-control-allow-origin': '*' } }); });   // opaque origin 은 모듈 스크립트에 CORS 필요
  await hp.setContent(`<!doctype html><body style="margin:0"><iframe id="g" sandbox="allow-scripts" src="${srv.url}" style="border:0;width:390px;height:844px"></iframe></body>`);
  let fr;
  for (let i = 0; i < 100 && !fr; i++) { fr = hp.frames().find(f => f.url().startsWith(srv.url)); if (!fr) await hp.waitForTimeout(100); }
  await fr.waitForFunction(() => document.body?.dataset?.screen === 'home', null, { timeout: 15000 });
  await pauseClock(hp, new Date('2026-10-15T09:00:05+09:00'), fr);
  const lsErr = await fr.evaluate(() => { try { localStorage.getItem('x'); return 'ok'; } catch (e) { return e.name; } });
  c('샌드박스 iframe: localStorage 접근이 실제로 SecurityError', lsErr === 'SecurityError', lsErr);
  const hs = new Sim(hp);
  await fr.click('[data-go="born"]'); await fr.waitForFunction(() => document.body.dataset.screen === 'gate');
  await fr.click('[data-go="gateOk"]'); await fr.waitForFunction(() => document.body.dataset.screen === 'birth');
  await fr.click('[data-act="start"]'); await fr.waitForFunction(() => document.body.dataset.screen === 'life');
  await fr.click('[data-speed="4"]'); await fr.click('.lifebar [data-act="auto"]');
  let t = 0;
  while (t < 25 * 60_000 && (await fr.evaluate(() => document.body.dataset.screen)) === 'life') {
    if (await fr.$('[data-act="last-record"]')) { await fr.click('[data-act="last-record"]'); break; }      // 마지막 해는 직접 넘김
    await hp.clock.runFor(500); t += 500;
  }
  c('샌드박스 iframe: 저장소 없이도 사망 화면까지 완주', (await fr.evaluate(() => document.body.dataset.screen)) === 'death', await fr.evaluate(() => document.body.dataset.screen));
  await fr.click('[data-act="sum"]'); await fr.waitForFunction(() => document.body.dataset.screen === 'summary');
  await fr.click('[data-card="verdict"]');
  for (let i = 0; i < 40 && !(await fr.evaluate(() => (document.querySelector('.share__img')?.src || '').startsWith('data:'))); i++) { await hp.clock.runFor(300); await hp.waitForTimeout(80); }
  const sd = await fr.evaluate(() => ({ dl: !!document.querySelector('a[download]'), ok: (document.querySelector('.share__img')?.src || '').startsWith('data:image/png') }));
  c('샌드박스 iframe: 공유 카드 렌더 · <a download> 숨김(iframe)', sd.ok && !sd.dl, JSON.stringify(sd));
  await fr.click('[data-act=copy]');
  await hp.waitForTimeout(500);
  const cp = await fr.evaluate(() => ({ toast: document.querySelector('.toast')?.textContent, sel: (() => { const ta = document.querySelector('.share__text'); return ta.selectionEnd - ta.selectionStart; })() }));
  c.note('샌드박스 iframe: 클립보드 복사 결과(허용되면 복사 토스트, 차단되면 선택 토스트)', cp);
  c('샌드박스 iframe: 복사 → 토스트(성공 또는 선택 안내)', /복사했습니다|선택해 두었습니다/.test(cp.toast || ''), JSON.stringify(cp));
  await fr.click('.sheet__close'); await hp.clock.runFor(50);
  await fr.click('.sum-more [data-go="archive"]'); await fr.waitForFunction(() => document.body.dataset.screen === 'archive');
  c('샌드박스 iframe: 기록관 빈 상태(저장 불가)', /아직 끝난 생애가 없습니다/.test(await fr.evaluate(() => document.querySelector('.empty')?.textContent || '')));
  c('샌드박스 iframe: 콘솔·페이지 에러 0', perrs.length === 0 && errs.length === 0, perrs.concat(errs).join('|'));
  await hostCtx.close();
  c.done();
});

test('E2E-6f 배포 위험: 샌드박스 iframe(opaque origin)에서 ES 모듈 다중 파일 — 호스트가 CORS 헤더를 주지 않으면 부팅 실패', { timeout: 120_000 }, async () => {
  const c = checks('artifact-sandbox-cors');
  const ctx = await br.newContext({ viewport: { width: 390, height: 844 }, locale: 'ko-KR' });
  const hp = await ctx.newPage();
  const errs = [];
  hp.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 160)); });
  await hp.setContent(`<!doctype html><body style="margin:0"><iframe sandbox="allow-scripts" src="${srv.url}" style="border:0;width:390px;height:844px"></iframe></body>`);
  await hp.waitForTimeout(4000);
  const fr = hp.frames().find(f => f.url().startsWith(srv.url));
  const screenName = fr ? await fr.evaluate(() => document.body?.dataset?.screen ?? null).catch(() => 'ERR') : 'no-frame';
  const text = fr ? await fr.evaluate(() => document.body?.innerText.slice(0, 60)).catch(() => '') : '';
  c.note('CORS 헤더 없는 호스트 + sandbox="allow-scripts" 에서 4초 뒤 화면', { screen: screenName, text, errors: errs.slice(0, 3) });
  c.note('(배포 위험, 환경 의존) opaque-origin iframe 에서 모듈 스크립트 로드 여부', screenName === 'home' ? '로드됨' : `로드 실패: screen=${screenName}`);
  c('부팅 실패 시(모듈 로드·초기 예외) 사용자에게 안내 문구가 있다 — "불러오는 중입니다." 무한 표시 아님', screenName === 'home' || !/^불러오는 중입니다.?$/.test((text || '').trim()), `screen=${screenName} text="${text}"`);
  await ctx.close();
  c.done();
});
