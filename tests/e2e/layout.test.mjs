// E2E-4 레이아웃·접근성: 360/390/430px × light/dark(시스템 + data-theme) × 전 화면.
//   가로 스크롤 0 · 글자 ≥12px · 탭 타깃 ≥44×44 · 대비 4.5:1(실측) · 포커스 링 · 하단 바 가림 · 한 손(아래 1/3) · 모션 줄이기 · safe-area.
import test from 'node:test';
import {
  startServer, launch, openPage, appErrors, screen, waitScreen, shot, Sim, seedInit, presetInit, SEEDS, checks, saveJson,
} from './helpers.mjs';

let srv, br;
test.before(async () => { srv = await startServer(); br = await launch(); });
test.after(async () => { await br?.close(); srv?.stop(); });

// 페이지 안에서 실행되는 감사 함수 — 직렬화되므로 외부 참조 없이 자급자족.
function audit() {
  const vw = innerWidth, vh = innerHeight;
  const out = { vw, vh, scrollW: document.documentElement.scrollWidth, clientW: document.documentElement.clientWidth, bodyScrollW: document.body.scrollWidth, over: [], small: [], tap: [], contrast: [], minContrast: 99, minFont: 99, textN: 0, tapN: 0, bar: null };
  const rgba = s => { const m = String(s).match(/rgba?\(([^)]+)\)/); if (!m) return [0, 0, 0, 0]; const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1]; };
  const blend = (f, b) => { const a = f[3]; return [f[0] * a + b[0] * (1 - a), f[1] * a + b[1] * (1 - a), f[2] * a + b[2] * (1 - a), 1]; };
  const lum = c => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };
  const bgOf = el => {
    const layers = []; let e = el;
    while (e) { const c = rgba(getComputedStyle(e).backgroundColor); if (c[3] > 0) layers.push(c); if (c[3] >= 0.99) break; e = e.parentElement; }
    let col = layers.length && layers.at(-1)[3] >= 0.99 ? layers.pop() : rgba(getComputedStyle(document.body).backgroundColor);
    if (col[3] < 0.99) col = [255, 255, 255, 1];
    for (let i = layers.length - 1; i >= 0; i--) col = blend(layers[i], col);
    return col;
  };
  const effOpacity = el => { let o = 1; for (let e = el; e; e = e.parentElement) o *= parseFloat(getComputedStyle(e).opacity); return o; };
  const sheetOpen = !!document.querySelector('.sheet');
  const visible = el => { const r = el.getBoundingClientRect(); if (r.width === 0 || r.height === 0) return false; const cs = getComputedStyle(el); return cs.visibility !== 'hidden' && cs.display !== 'none'; };
  const skip = el => el.closest('.sr-only, [hidden], [aria-hidden="true"]') || (sheetOpen && el.closest('#app')) || el.closest('[inert]');
  const desc = el => (el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).join('.') : '') + ' "' + (el.getAttribute('aria-label') || el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 24) + '"');
  const all = [...document.querySelectorAll('body *')];
  for (const el of all) {
    if (!visible(el)) continue;
    // 가로 넘침(스크롤 컨테이너 안은 제외)
    const r = el.getBoundingClientRect();
    if ((r.right > vw + 1 || r.left < -1) && !skip(el)) {
      let scroller = false;
      for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) { const ox = getComputedStyle(p).overflowX; if (ox !== 'visible') { scroller = true; break; } }
      if (!scroller && !el.closest('.sheet__handle') && out.over.length < 6) out.over.push(desc(el) + ` [${Math.round(r.left)},${Math.round(r.right)}]`);
    }
    if (skip(el)) continue;
    const cs = getComputedStyle(el);
    const hasText = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
    if (hasText && !el.matches('svg *')) {
      out.textN++;
      const fs = parseFloat(cs.fontSize);
      out.minFont = Math.min(out.minFont, fs);
      if (fs < 12 - 0.01) out.small.push(desc(el) + ' ' + fs + 'px');
      if (!el.closest(':disabled, [disabled]')) {
        const fg = rgba(cs.color), op = effOpacity(el);
        const bg = bgOf(el);
        const f = blend([fg[0], fg[1], fg[2], fg[3] * op], bg);
        const L1 = lum(f), L2 = lum(bg), ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
        const large = fs >= 24 || (fs >= 18.66 && parseInt(cs.fontWeight, 10) >= 700);
        const need = large ? 3 : 4.5;
        if (ratio < out.minContrast) out.minContrast = +ratio.toFixed(2);
        if (ratio < need) out.contrast.push(desc(el) + ` ${ratio.toFixed(2)}:1 fg ${cs.color} bg rgb(${bg.slice(0, 3).map(Math.round)}) op ${op.toFixed(2)}`);
      }
    }
    // 탭 타깃
    if (el.matches('button, a[href], summary, [role="switch"], [role="tab"], input:not([type=hidden]), select, textarea, [role="button"]') && !el.disabled && cs.pointerEvents !== 'none') {
      out.tapN++;
      if (r.width < 43.5 || r.height < 43.5) out.tap.push(desc(el) + ` ${r.width.toFixed(0)}x${r.height.toFixed(0)}`);
    }
  }
  // 하단 고정 바가 마지막 콘텐츠를 가리지 않는지(맨 아래까지 스크롤한 상태)
  const bar = document.querySelector('.actionbar, .lifebar');
  if (bar && !sheetOpen) {
    const br_ = bar.getBoundingClientRect();
    const host = document.querySelector('.feed > li:last-child') || document.querySelector('.screen__body > :last-child');
    out.bar = { barTop: Math.round(br_.top), barH: Math.round(br_.height), fixed: getComputedStyle(bar).position, padBottom: getComputedStyle(bar).paddingBottom };
    if (host) { const maxY = Math.max(0, document.documentElement.scrollHeight - vh); const hr = host.getBoundingClientRect(); out.bar.lastBottomAtEnd = Math.round(hr.bottom + scrollY - maxY); out.bar.clear = out.bar.lastBottomAtEnd <= br_.top + 1; }
  }
  out.scrollH = document.documentElement.scrollHeight;
  return out;
}

// 한 손 조작: 주 조작 요소 중심이 화면 아래 1/3 안인가
function reach(sels) {
  const vh = innerHeight, res = [];
  for (const s of sels) {
    for (const el of document.querySelectorAll(s)) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      const cy = r.top + r.height / 2;
      res.push({ sel: s, text: (el.textContent || '').trim().slice(0, 12), cy: Math.round(cy), bottomThird: cy >= vh * 2 / 3, bottomHalf: cy >= vh / 2 });
    }
  }
  return res;
}

const COMBOS = [
  { id: '360-light', w: 360, scheme: 'light', theme: null, shots: true },
  { id: '360-dark', w: 360, scheme: 'dark', theme: null, shots: true },
  { id: '390-light', w: 390, scheme: 'light', theme: null, shots: false },
  { id: '390-dark', w: 390, scheme: 'dark', theme: null, shots: true },
  { id: '430-light', w: 430, scheme: 'light', theme: null, shots: true },
  { id: '430-dark', w: 430, scheme: 'dark', theme: null, shots: false },
  { id: '390-sys-light+data-dark', w: 390, scheme: 'light', theme: 'dark', shots: false },
  { id: '390-sys-dark+data-light', w: 390, scheme: 'dark', theme: 'light', shots: false },
];

async function walk(combo) {
  const { w, scheme, theme } = combo;
  const page = await openPage(br, srv.url, { w, h: 844, scheme, clock: true, init: seedInit(SEEDS.sensDeath) + presetInit({ speed: 4, auto: true, theme: theme ?? 'system', seen19: false }) });
  const sim = new Sim(page);
  const res = {}, reachRes = {}, focusRes = {};
  const expectedBg = (theme ?? scheme) === 'dark' ? 'rgb(17, 19, 22)' : 'rgb(230, 232, 234)';
  const A = async (label, { full = false, reachSel = null, focus = false } = {}) => {
    await page.waitForTimeout(450);                                   // 실시간 CSS 애니메이션 종료
    res[label] = await page.evaluate(audit);
    res[label].bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    if (reachSel) reachRes[label] = await page.evaluate(reach, reachSel);
    if (focus) {
      await page.keyboard.press('Tab');
      focusRes[label] = await page.evaluate(() => { const e = document.activeElement; if (!e || e === document.body) return { none: true }; const cs = getComputedStyle(e); return { el: e.tagName + '.' + e.className, style: cs.outlineStyle, width: cs.outlineWidth, color: cs.outlineColor, offset: cs.outlineOffset, matches: e.matches(':focus-visible') }; });
    }
    if (combo.shots) await shot(page, `layout-${combo.id}-${label}`, { wait: 0, fullPage: full });
  };

  await waitScreen(page, 'home');
  await A('home', { reachSel: ['.actionbar .btn'], focus: true });
  await page.click('[data-go="born"]'); await waitScreen(page, 'gate');
  await A('gate', { reachSel: ['.actionbar .btn'] });
  await page.click('[data-go="gateOk"]'); await waitScreen(page, 'birth');
  await sim.adv(300);
  await A('birth', { reachSel: ['.actionbar .btn'], focus: true });
  await page.click('[data-act="share"]');
  for (let i = 0; i < 30 && !(await page.evaluate(() => (document.querySelector('.share__img')?.src || '').startsWith('data:'))); i++) { await sim.adv(300); await page.waitForTimeout(80); }
  await A('birth-share', { reachSel: ['.share__actions .btn', '.sheet__close'] });
  await page.keyboard.press('Escape');
  await page.click('[data-act="src"]'); await A('birth-sources'); await page.keyboard.press('Escape');
  await page.click('[data-act="start"]'); await waitScreen(page, 'life');
  await A('life-start', { reachSel: ['.lifebar button', '.stat'], focus: true });

  let gotChoice = false, gotCompare = false, gotStats = false;
  const t0 = sim.t;
  while ((await screen(page)) === 'life' && sim.t - t0 < 20 * 60_000) {
    const s = await page.evaluate(() => ({ ch: !!document.querySelector('.sheet.choice'), cmp: !!document.querySelector('.compare'), sheet: !!document.querySelector('.sheet'), age: +document.querySelector('[data-hud=age]')?.textContent, helpBox: !!document.querySelector('.sheet.choice .help-box') }));
    if (s.ch && !gotChoice) { gotChoice = true; await A('choice', { reachSel: ['.option', '.ring'] }); continue; }
    if (s.ch && s.helpBox && !res['choice-sensitive']) { await A('choice-sensitive', { reachSel: ['.option'] }); continue; }
    if (!s.sheet && s.age >= 8 && !gotCompare) { gotCompare = true; await page.click('.lifebar [data-tab="peers"]'); await page.waitForSelector('.compare-sheet'); await A('compare', { reachSel: ['.compare-sheet .sheet__close', '.lifebar button'] }); await page.keyboard.press('Escape'); continue; }
    if (!s.sheet && !s.cmp && s.age >= 12 && !gotStats) {
      gotStats = true;
      await page.click('[data-tab="stats"]'); await page.waitForSelector('.sheet .metric');
      await page.evaluate(() => { document.querySelectorAll('.sheet details.metric').forEach((d, i) => { d.open = i < 2; }); });
      await A('stats-sheet', { reachSel: ['.sheet__close', '.tabs__btn'] });
      await page.click('.tabs__btn[data-tab="traits"]'); await A('traits-sheet');
      await page.click('.tabs__btn[data-tab="issues"]'); await page.evaluate(() => { document.querySelector('.sheet details.metric').open = true; }); await A('issues-sheet');
      await page.keyboard.press('Escape');
      continue;
    }
    await sim.adv(250);
  }
  await page.evaluate(() => scrollTo(0, 0));
  await A('death', { reachSel: ['.actionbar .btn'] });
  await page.click('[data-act="sum"]'); await waitScreen(page, 'summary');
  await A('summary-top', { reachSel: ['.actionbar .btn', '[data-card]'] });
  await page.evaluate(() => { document.querySelectorAll('details.metric, details.birth-again').forEach(d => { d.open = true; }); });
  await A('summary-open', { full: true });
  for (const k of ['birth', 'verdict', 'timeline']) {
    await page.evaluate(k => document.querySelector(`[data-card="${k}"]`).scrollIntoView({ block: 'center' }), k);
    await page.click(`[data-card="${k}"]`);
    for (let i = 0; i < 30 && !(await page.evaluate(() => (document.querySelector('.share__img')?.src || '').startsWith('data:'))); i++) { await sim.adv(300); await page.waitForTimeout(80); }
    await A('share-' + k, { reachSel: ['.share__actions .btn'] });
    await page.keyboard.press('Escape');
  }
  await page.evaluate(() => scrollTo(0, 0));
  await page.click('.actionbar [data-go="archive"]'); await waitScreen(page, 'archive');
  await A('archive', { reachSel: ['.record'] });
  await page.click('[data-rec="0"]'); await page.waitForSelector('.topbar__title');
  await A('archive-detail', { reachSel: ['.actionbar .btn'] });
  await page.click('.actionbar [data-go="archive"]'); await waitScreen(page, 'archive');
  await page.click('.topbar [data-go="home"]'); await waitScreen(page, 'home');
  await A('home-with-record');
  await page.click('[data-go="codex"]'); await page.waitForSelector('table.stat-table');
  await A('codex', { full: true });
  await page.click('.topbar [data-go="home"]'); await waitScreen(page, 'home');
  await page.click('[data-go="settings"]'); await waitScreen(page, 'settings');
  await A('settings', { reachSel: ['.seg__btn', '.switch'] });
  await page.click('[data-act=ask]'); await A('settings-confirm', { reachSel: ['.confirm .btn'] });
  await page.keyboard.press('Escape');
  const errs = appErrors(page).concat(page.qa.pageErrors);
  await page.ctx.close();
  return { combo, res, reachRes, focusRes, errs, expectedBg };
}

test('E2E-4a 전 화면 × 8조합 감사(가로 스크롤·글자·탭 타깃·대비·하단 바·포커스)', { timeout: 1_200_000 }, async () => {
  const c = checks('layout');
  const runs = [];
  for (let i = 0; i < COMBOS.length; i += 4) runs.push(...await Promise.all(COMBOS.slice(i, i + 4).map(walk)));
  saveJson('layout-raw.json', runs);
  const labels = new Set(); runs.forEach(r => Object.keys(r.res).forEach(l => labels.add(l)));
  const agg = { over: new Map(), small: new Map(), tap: new Map(), contrast: new Map(), bar: new Map() };
  const addTo = (m, key, where) => { if (!m.has(key)) m.set(key, new Set()); m.get(key).add(where); };
  let minContrast = 99, minFont = 99, screens = 0;
  for (const r of runs) {
    c(`[${r.combo.id}] 배경 토큰 적용(${r.expectedBg})`, Object.values(r.res).every(a => a.bg === r.expectedBg || a.bg === 'rgb(26, 29, 33)' || a.bg === 'rgb(250, 250, 248)') && r.res.home.bg === r.expectedBg, r.res.home.bg);
    c(`[${r.combo.id}] 콘솔·페이지 에러 0`, r.errs.length === 0, r.errs.join('|'));
    for (const [label, a] of Object.entries(r.res)) {
      screens++;
      const where = `${r.combo.id}/${label}`;
      if (a.scrollW > a.clientW || a.bodyScrollW > a.vw) addTo(agg.over, `문서 가로 스크롤 scrollW ${a.scrollW} > ${a.clientW}`, where);
      a.over.forEach(o => addTo(agg.over, o, where));
      a.small.forEach(o => addTo(agg.small, o, where));
      a.tap.forEach(o => addTo(agg.tap, o, where));
      a.contrast.forEach(o => addTo(agg.contrast, o, where));
      if (a.bar && a.bar.clear === false) addTo(agg.bar, `하단 바가 마지막 콘텐츠 가림 (last ${a.bar.lastBottomAtEnd} > barTop ${a.bar.barTop})`, where);
      minContrast = Math.min(minContrast, a.minContrast); minFont = Math.min(minFont, a.minFont);
    }
  }
  const fmt = m => [...m.entries()].map(([k, v]) => `${k}  ← ${[...v].slice(0, 4).join(', ')}${v.size > 4 ? ` 외 ${v.size - 4}` : ''}`);
  c(`가로 스크롤 0·요소 넘침 없음(${screens}개 화면 샘플)`, agg.over.size === 0, fmt(agg.over).join(' || '));
  c('글자 크기 최소 12px', agg.small.size === 0, fmt(agg.small).join(' || '));
  c('탭 타깃 ≥ 44×44', agg.tap.size === 0, fmt(agg.tap).join(' || '));
  c('텍스트 대비 ≥ 4.5:1(큰 글자 3:1) — 실측', agg.contrast.size === 0, fmt(agg.contrast).join(' || '));
  c('하단 고정 바가 마지막 콘텐츠를 가리지 않음', agg.bar.size === 0, fmt(agg.bar).join(' || '));
  c.note('집계', { screens, minContrast, minFont });
  c.note('오프렌더 목록', { over: fmt(agg.over), small: fmt(agg.small), tap: fmt(agg.tap), contrast: fmt(agg.contrast), bar: fmt(agg.bar) });
  // 포커스 링
  const ff = [];
  for (const r of runs) for (const [label, f] of Object.entries(r.focusRes)) ff.push({ id: r.combo.id, label, ...f });
  c('포커스 링 3px solid 가시(Tab 후 :focus-visible)', ff.every(f => !f.none && f.style === 'solid' && parseFloat(f.width) >= 2 && f.matches), JSON.stringify(ff.filter(f => f.none || f.style !== 'solid' || !(parseFloat(f.width) >= 2)).slice(0, 3)));
  c.note('포커스 샘플', ff.slice(0, 6));
  // 한 손(아래 1/3) — 모든 조합 기준 390 light
  const r390 = runs.find(r => r.combo.id === '390-light');
  const rows = [];
  for (const [label, arr] of Object.entries(r390.reachRes)) for (const x of arr) rows.push({ screen: label, ...x });
  const notThird = rows.filter(x => !x.bottomThird);
  c.note('아래 1/3 밖의 주 조작(390×844)', notThird.map(x => `${x.screen}:${x.sel} "${x.text}" cy=${x.cy}`));
  c.note('한 손 도달: 주 조작 전체 수 vs 아래 1/3 수', { total: rows.length, bottomThird: rows.length - notThird.length });
  const primary = rows.filter(x => ['.option', '.lifebar button', '.actionbar .btn'].includes(x.sel));
  c('선택지·배속·탭·멈춤·주 버튼(.option/.lifebar/.actionbar)이 화면 아래 1/3', primary.length > 5 && primary.every(x => x.bottomThird), JSON.stringify(primary.filter(x => !x.bottomThird)));
  const cmp = rows.filter(x => x.screen === 'compare' && x.sel === '.compare-sheet .sheet__close');
  c('비교 카드 [계속]이 화면 아래 1/3(UI-SPEC §4.2 한 손)', cmp.length > 0 && cmp.every(x => x.bottomThird), JSON.stringify(cmp));
  const ringR = rows.filter(x => x.sel === '.ring');
  c('선택 시트 카운트다운 링(멈춤 토글)이 아래 1/3', ringR.length > 0 && ringR.every(x => x.bottomThird), JSON.stringify(ringR));
  c.done();
});

// ───────── 모션 줄이기 · safe-area · 반응형 보조 ─────────
test('E2E-4b prefers-reduced-motion(OS)와 설정 토글이 모든 전환·애니메이션을 0으로', { timeout: 300_000 }, async () => {
  const c = checks('layout-motion');
  const probe = page => page.evaluate(() => {
    const rs = getComputedStyle(document.documentElement);
    const dur = ['--dur-1', '--dur-2', '--dur-3', '--dur-tick'].map(n => rs.getPropertyValue(n).trim());
    const el = sel => document.querySelector(sel);
    const anim = sel => { const e = el(sel); if (!e) return null; const cs = getComputedStyle(e); return { anim: cs.animationDuration, trans: cs.transitionDuration }; };
    return { dur, sheet: anim('.sheet'), scrim: anim('.scrim'), seal: anim('.seal'), fill: anim('.meter__fill'), tl: anim('.timer-line__fill'), btn: anim('.btn'), running: document.getAnimations().filter(a => a.playState === 'running').length, death: anim('.death__inner') };
  });
  const isZero = v => !v || [v.anim, v.trans].every(x => !x || x.split(',').every(p => parseFloat(p) === 0));
  for (const mode of ['os', 'setting']) {
    const page = await openPage(br, srv.url, { clock: true, reduced: mode === 'os' ? 'reduce' : 'no-preference', init: seedInit(SEEDS.plain) + presetInit({ seen19: true, speed: 1, auto: false, reduceMotion: mode === 'setting' }) });
    const sim = new Sim(page);
    await waitScreen(page, 'home');
    await page.click('[data-go="born"]'); await waitScreen(page, 'birth');
    await page.waitForTimeout(100);
    const b = await probe(page);
    c(`[${mode}] --dur-* 전부 0ms`, b.dur.every(x => x === '0ms'), b.dur.join());
    c(`[${mode}] 출생 도장 애니메이션 0s`, isZero(b.seal), JSON.stringify(b.seal));
    c(`[${mode}] 막대·타이머 줄·버튼 전환 0s`, isZero(b.fill) && isZero(b.tl) && isZero(b.btn), JSON.stringify([b.fill, b.tl, b.btn]));
    await page.click('[data-act="share"]'); await page.waitForSelector('.sheet');
    const s = await probe(page);
    c(`[${mode}] 시트·스크림 애니메이션 0s`, isZero(s.sheet) && isZero(s.scrim), JSON.stringify([s.sheet, s.scrim]));
    c(`[${mode}] 실행 중 애니메이션 0개(시트 열림)`, s.running === 0, s.running);
    await page.keyboard.press('Escape');
    await page.click('[data-act="start"]'); await waitScreen(page, 'life');
    await sim.until(() => !!document.querySelector('.sheet.choice'), { max: 200_000 });
    await sim.adv(300);
    const ch = await page.evaluate(() => ({ running: document.getAnimations().filter(a => a.playState === 'running').map(a => a.animationName || a.transitionProperty || a.constructor.name), prog: getComputedStyle(document.querySelector('.ring__prog')).transitionDuration, k: document.querySelector('.ring').style.getPropertyValue('--k') }));
    c(`[${mode}] 선택 링 전환 0s(계단식)`, parseFloat(ch.prog) === 0, ch.prog);
    c(`[${mode}] 선택 시트: 실행 중 애니메이션 0개`, ch.running.length === 0, ch.running.join());
    // 링 숫자는 계속 갱신(카운트다운은 계단식으로 보임)
    const n1 = await page.evaluate(() => document.querySelector('.ring__num').textContent); await sim.adv(3000);
    const n2 = await page.evaluate(() => document.querySelector('.ring__num').textContent);
    c(`[${mode}] 줄이기여도 카운트다운 숫자는 줄어듦`, +n2 < +n1, `${n1} → ${n2}`);
    await page.ctx.close();
  }
  // 줄이기 아닐 때는 실제로 애니메이션이 있음(대조군)
  const pageN = await openPage(br, srv.url, { clock: true, reduced: 'no-preference', init: seedInit(SEEDS.plain) + presetInit({ seen19: true }) });
  await waitScreen(pageN, 'home'); await pageN.click('[data-go="born"]'); await waitScreen(pageN, 'birth');
  const bn = await probe(pageN);
  c('대조군: 줄이기 꺼짐 → --dur-3 420ms, 도장 애니메이션 있음', bn.dur[2] === '420ms' && !isZero(bn.seal), JSON.stringify(bn.dur) + JSON.stringify(bn.seal));
  c.done();
});

test('E2E-4c safe-area(하단 고정 바·시트·토스트)와 상단 고정 요소', { timeout: 300_000 }, async () => {
  const c = checks('layout-safearea');
  const page = await openPage(br, srv.url, { clock: true, init: seedInit(SEEDS.plain) + presetInit({ seen19: true, speed: 4, auto: true }) });
  const cdp = await page.ctx.newCDPSession(page);
  let applied = true;
  try { await cdp.send('Emulation.setSafeAreaInsetsOverride', { insets: { top: 47, bottom: 34, left: 0, right: 0 } }); } catch (e) { applied = false; c.note('CDP safe-area 에뮬레이션 불가', String(e.message).slice(0, 120)); }
  const sim = new Sim(page);
  await waitScreen(page, 'home');
  const css = await (await fetch(srv.url + 'styles.css')).text();
  const rules = {
    actionbar: /\.actionbar\s*\{[^}]*env\(safe-area-inset-bottom|\.actionbar\s*\{[^}]*--safe-b/.test(css),
    lifebar: /\.lifebar\s*\{[^}]*--safe-b/.test(css), sheet: /\.sheet\s*\{[^}]*--safe-b/.test(css), toast: /\.toast\s*\{[^}]*--safe-b/.test(css),
    hud: /\.hud\s*\{[^}]*--safe-t/.test(css), topbar: /\.topbar\s*\{[^}]*--safe-t/.test(css), env: /--safe-b:\s*env\(safe-area-inset-bottom/.test(css) && /--safe-t:\s*env\(safe-area-inset-top/.test(css),
    viewportFit: /viewport-fit=cover/.test(await (await fetch(srv.url)).text()),
  };
  c('CSS: --safe-b/--safe-t = env(safe-area-inset-*) 정의 + viewport-fit=cover', rules.env && rules.viewportFit, JSON.stringify(rules));
  c('CSS: .actionbar·.lifebar·.sheet·.toast 가 --safe-b 사용, .hud·.topbar 가 --safe-t 사용', rules.actionbar && rules.lifebar && rules.sheet && rules.toast && rules.hud && rules.topbar, JSON.stringify(rules));
  if (applied) {
    const pad = () => page.evaluate(() => { const g = s => { const e = document.querySelector(s); return e ? getComputedStyle(e).paddingBottom : null; }; return { actionbar: g('.actionbar'), lifebar: g('.lifebar'), sheet: g('.sheet'), hud: (() => { const e = document.querySelector('.hud'); return e ? getComputedStyle(e).paddingTop : null; })(), topbar: (() => { const e = document.querySelector('.topbar'); return e ? getComputedStyle(e).paddingTop : null; })(), safeB: getComputedStyle(document.documentElement).getPropertyValue('--safe-b') }; });
    await page.click('[data-go="born"]'); await waitScreen(page, 'birth');
    const p1 = await pad();
    c('에뮬레이션 safe-bottom 34px → .actionbar padding-bottom = 12+34 = 46px', p1.actionbar === '46px', JSON.stringify(p1));
    await page.click('[data-act="start"]'); await waitScreen(page, 'life');
    const p2 = await pad();
    c('진행: .lifebar padding-bottom ≥ 34px 반영 · .hud padding-top ≥ 47px 반영', parseFloat(p2.lifebar) >= 34 + 8 - 0.5 && parseFloat(p2.hud) >= 47, JSON.stringify(p2));
    await shot(page, 'layout-safearea-life');
    await sim.until(() => !!document.querySelector('.sheet.choice'), { max: 200_000 });
    await page.waitForTimeout(500);
    const p3 = await pad();
    c('선택 시트 padding-bottom ≥ 34px', parseFloat(p3.sheet) >= 34, JSON.stringify(p3));
    const geo = await page.evaluate(() => { const r = document.querySelector('.sheet').getBoundingClientRect(); const o = [...document.querySelectorAll('.option')].map(x => x.getBoundingClientRect().bottom); return { sheetBottom: r.bottom, vh: innerHeight, lastOptionBottom: Math.max(...o), foot: document.querySelector('.choice__foot')?.getBoundingClientRect().bottom }; });
    c('선택 시트 마지막 요소가 화면 하단 safe-area(34px) 위에 있음', geo.foot <= geo.vh - 34 + 1, JSON.stringify(geo));
    await shot(page, 'layout-safearea-choice');
    await cdp.send('Emulation.setSafeAreaInsetsOverride', { insets: { top: 0, bottom: 0, left: 0, right: 0 } }).catch(() => {});
  }
  c.done();
});

test('E2E-4d 반응형 보조: 가로 모드(844×390)·320px·200% 확대(195px) 가로 스크롤', { timeout: 300_000 }, async () => {
  const c = checks('layout-reflow');
  for (const [name, w, h] of [['landscape', 844, 390], ['320', 320, 640], ['zoom200', 195, 422]]) {
    const page = await openPage(br, srv.url, { w, h, clock: true, init: seedInit(SEEDS.plain) + presetInit({ seen19: true, speed: 4, auto: true }) });
    const sim = new Sim(page);
    await waitScreen(page, 'home');
    const o = {};
    const grab = async label => { await page.waitForTimeout(400); const a = await page.evaluate(audit); o[label] = { over: a.scrollW > a.clientW ? `scrollW ${a.scrollW} > ${a.clientW}` : null, items: a.over, small: a.small.length, tap: a.tap.length }; };
    await grab('home');
    await page.click('[data-go="born"]'); await waitScreen(page, 'birth'); await sim.adv(300); await grab('birth');
    await page.click('[data-act="start"]'); await waitScreen(page, 'life'); await grab('life');
    if (name === 'landscape') {
      const hudH = await page.evaluate(() => ({ hud: document.querySelector('.hud').getBoundingClientRect().height, bar: document.querySelector('.lifebar').getBoundingClientRect().height, vh: innerHeight }));
      c.note('가로 모드 진행 화면: HUD + 하단 바가 차지하는 높이(피드가 보이는 높이)', { ...hudH, feedVisible: hudH.vh - hudH.hud - hudH.bar });
      await shot(page, 'layout-landscape-life');
      o.feedVisible = hudH.vh - hudH.hud - hudH.bar;
    }
    await sim.until(() => !!document.querySelector('.sheet.choice'), { max: 200_000 }); await grab('choice');
    if (name === 'landscape') {
      const g = await page.evaluate(() => { const s = document.querySelector('.sheet'); const b = s.querySelector('.sheet__body'); return { sheetH: s.getBoundingClientRect().height, vh: innerHeight, scrolls: b.scrollHeight > b.clientHeight, optsVisible: [...document.querySelectorAll('.option')].map(x => { const r = x.getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight; }) }; });
      c.note('가로 모드 선택 시트', g);
      await shot(page, 'layout-landscape-choice');
    }
    await sim.until(() => document.body.dataset.screen === 'death', { max: 20 * 60_000, step: 500 });
    await page.click('[data-act="sum"]'); await waitScreen(page, 'summary'); await grab('summary');
    c(`[${name}] 홈·출생·진행·선택·결산 가로 스크롤 0`, Object.entries(o).filter(([k, v]) => typeof v === 'object' && v.over).length === 0, JSON.stringify(Object.entries(o).filter(([k, v]) => typeof v === 'object' && (v.over || v.items.length))));
    c.note(`[${name}] 글자<12 · 탭<44 개수`, Object.fromEntries(Object.entries(o).filter(([k, v]) => typeof v === 'object').map(([k, v]) => [k, `${v.small}/${v.tap}`])));
    await page.ctx.close();
  }
  c.done();
});
