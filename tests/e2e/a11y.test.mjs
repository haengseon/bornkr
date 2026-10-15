// E2E-4e 접근성 구조 점검(axe 없이 자체 규칙): 이름 없는 컨트롤, 중복 id, 깨진 aria 참조, h1 개수·제목 단계, role=tab 연결, 다이얼로그 이름, img alt, 포커스 이동.
//   UI-SPEC §9. 규칙은 페이지 안에서 실행되는 순수 DOM 스캔.
import test from 'node:test';
import {
  startServer, launch, openPage, appErrors, screen, waitScreen, Sim, seedInit, presetInit, SEEDS, checks, saveJson,
} from './helpers.mjs';

let srv, br;
test.before(async () => { srv = await startServer(); br = await launch(); });
test.after(async () => { await br?.close(); srv?.stop(); });

function scan() {
  const out = { noName: [], dupId: [], badRef: [], h1: 0, h1Text: '', headingSkips: [], tabs: [], dialogs: [], imgs: [], nested: [], focusable: 0, noLabelInputs: [], liveRegions: 0 };
  const vis = el => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden'; };
  const inert = el => !!el.closest('[inert]');
  const name = el => {
    const al = el.getAttribute('aria-label'); if (al) return al;
    const lb = el.getAttribute('aria-labelledby'); if (lb) return lb.split(/\s+/).map(id => document.getElementById(id)?.textContent || '').join(' ').trim();
    const t = (el.innerText || el.textContent || '').trim(); if (t) return t;
    if (el.getAttribute('title')) return el.getAttribute('title');
    const img = el.querySelector('img[alt]'); if (img?.alt) return img.alt;
    return '';
  };
  const desc = el => el.tagName.toLowerCase() + (typeof el.className === 'string' && el.className ? '.' + el.className.trim().split(/\s+/).join('.') : '') + (el.dataset?.act ? `[${el.dataset.act}]` : '');
  for (const el of document.querySelectorAll('button, a[href], [role=button], [role=switch], [role=tab], summary, input:not([type=hidden]), textarea, select')) {
    if (!vis(el) || inert(el)) continue;
    out.focusable++;
    if (el.matches('textarea, input, select')) { const lab = el.labels?.length || el.getAttribute('aria-label') || el.getAttribute('aria-labelledby'); if (!lab) out.noLabelInputs.push(desc(el)); continue; }
    if (!name(el)) out.noName.push(desc(el));
  }
  const ids = {};
  for (const el of document.querySelectorAll('[id]')) { ids[el.id] = (ids[el.id] || 0) + 1; }
  out.dupId = Object.entries(ids).filter(([, n]) => n > 1).map(([id, n]) => `${id}×${n}`);
  for (const el of document.querySelectorAll('[aria-labelledby], [aria-controls], [aria-describedby]')) {
    if (inert(el)) continue;
    for (const attr of ['aria-labelledby', 'aria-controls', 'aria-describedby']) {
      const v = el.getAttribute(attr); if (!v) continue;
      for (const id of v.split(/\s+/)) if (!document.getElementById(id)) out.badRef.push(`${desc(el)} ${attr}=${id}`);
    }
  }
  const root = document.querySelector('#app');
  const h1s = [...root.querySelectorAll('h1')].filter(vis);
  out.h1 = h1s.length; out.h1Text = h1s.map(h => h.textContent.trim().slice(0, 20)).join('|');
  let last = 0;
  for (const h of root.querySelectorAll('h1,h2,h3,h4')) { if (!vis(h)) continue; const l = +h.tagName[1]; if (last && l > last + 1) out.headingSkips.push(`h${last}→h${l} "${h.textContent.trim().slice(0, 14)}"`); last = l; }
  for (const t of document.querySelectorAll('[role=tab]')) { if (!vis(t)) continue; const ctl = t.getAttribute('aria-controls'); out.tabs.push({ id: t.id || null, controls: ctl, controlsExists: !!(ctl && document.getElementById(ctl)), selected: t.getAttribute('aria-selected'), tabindex: t.getAttribute('tabindex'), list: t.closest('[role=tablist]') ? 'in-tablist' : 'no-tablist' }); }
  for (const d of document.querySelectorAll('[role=dialog]')) out.dialogs.push({ name: name(d).slice(0, 24), modal: d.getAttribute('aria-modal'), cls: d.className });
  for (const im of document.querySelectorAll('img')) if (vis(im) && !im.hasAttribute('alt')) out.imgs.push(desc(im));
  for (const el of document.querySelectorAll('button button, a button, button a, a a, summary button, summary a')) if (vis(el)) out.nested.push(desc(el));
  out.liveRegions = document.querySelectorAll('[aria-live], [role=status], [role=alert]').length;
  out.lang = document.documentElement.lang;
  out.activeIsBody = document.activeElement === document.body;
  out.activeTag = document.activeElement?.tagName + '.' + (document.activeElement?.className || '');
  return out;
}

test('E2E-4e 접근성 구조: 전 화면 DOM 규칙 스캔', { timeout: 600_000 }, async () => {
  const c = checks('a11y');
  const page = await openPage(br, srv.url, { clock: true, init: seedInit(SEEDS.plain) + presetInit({ seen19: false, speed: 4, auto: true }) });
  const sim = new Sim(page);
  const R = {};
  const S = async label => { await page.waitForTimeout(350); R[label] = await page.evaluate(scan); };
  await waitScreen(page, 'home'); await S('home');
  await page.click('[data-go="born"]'); await waitScreen(page, 'gate'); await S('gate');
  await page.click('[data-go="gateOk"]'); await waitScreen(page, 'birth'); await sim.adv(300); await S('birth');
  await page.click('[data-act="share"]');
  for (let i = 0; i < 30 && !(await page.evaluate(() => (document.querySelector('.share__img')?.src || '').startsWith('data:'))); i++) { await sim.adv(300); await page.waitForTimeout(80); }
  await S('birth-share'); await page.keyboard.press('Escape');
  await page.click('[data-act="start"]'); await waitScreen(page, 'life'); await S('life');
  let gotC = false, gotCmp = false, gotS = false;
  const t0 = sim.t;
  while ((await screen(page)) === 'life' && sim.t - t0 < 20 * 60_000) {
    const s = await page.evaluate(() => ({ ch: !!document.querySelector('.sheet.choice'), cmp: !!document.querySelector('.compare'), sheet: !!document.querySelector('.sheet'), age: +document.querySelector('[data-hud=age]')?.textContent }));
    if (s.ch && !gotC) { gotC = true; await S('choice'); continue; }
    if (!s.sheet && s.age >= 8 && !gotCmp) { gotCmp = true; await page.click('.lifebar [data-tab="peers"]'); await page.waitForSelector('.compare-sheet'); await S('compare'); await page.keyboard.press('Escape'); continue; }
    if (!s.sheet && !s.cmp && s.age >= 12 && !gotS) {
      gotS = true;
      await page.click('[data-tab="stats"]'); await page.waitForSelector('.sheet .metric'); await S('stats-sheet');
      await page.click('.tabs__btn[data-tab="issues"]'); await S('issues-sheet'); await page.keyboard.press('Escape'); continue;
    }
    await sim.adv(250);
  }
  await S('death');
  await page.click('[data-act="sum"]'); await waitScreen(page, 'summary'); await S('summary');
  await page.click('[data-card="verdict"]');
  for (let i = 0; i < 30 && !(await page.evaluate(() => (document.querySelector('.share__img')?.src || '').startsWith('data:'))); i++) { await sim.adv(300); await page.waitForTimeout(80); }
  await S('share-sheet'); await page.keyboard.press('Escape');
  await page.click('.actionbar [data-go="archive"]'); await waitScreen(page, 'archive'); await S('archive');
  await page.click('[data-rec="0"]'); await page.waitForSelector('.topbar__title'); await S('archive-detail');
  await page.click('.actionbar [data-go="archive"]'); await waitScreen(page, 'archive');
  await page.click('.topbar [data-go="home"]'); await waitScreen(page, 'home');
  await page.click('[data-go="codex"]'); await page.waitForSelector('table.stat-table'); await S('codex');
  await page.click('.topbar [data-go="home"]'); await waitScreen(page, 'home');
  await page.click('[data-go="settings"]'); await waitScreen(page, 'settings'); await S('settings');
  // 도움 시트는 사용자 결정으로 제거됨(설정에 [data-help] 없음)
  if (await page.$('#app [data-help]')) throw new Error('도움 버튼이 남아 있음');
  saveJson('a11y-raw.json', R);

  const agg = (key, f = x => x) => Object.entries(R).flatMap(([l, r]) => (Array.isArray(r[key]) ? r[key] : []).map(x => `${l}: ${f(x)}`));
  const noName = agg('noName'); const dup = agg('dupId'); const bad = agg('badRef'); const skips = agg('headingSkips'); const nest = agg('nested'); const imgs = agg('imgs'); const nolabel = agg('noLabelInputs');
  c('이름 없는 버튼·링크·스위치 0', noName.length === 0, noName.join(' | '));
  c('입력(textarea 등) 레이블 연결', nolabel.length === 0, nolabel.join(' | '));
  c('중복 id 0', dup.length === 0, dup.join(' | '));
  c('깨진 aria-labelledby/controls/describedby 참조 0', bad.length === 0, bad.join(' | '));
  c('img alt 속성 있음', imgs.length === 0, imgs.join(' | '));
  c('버튼/링크 중첩 0', nest.length === 0, nest.join(' | '));
  const h1bad = Object.entries(R).filter(([l, r]) => !/sheet|compare|choice|share|issues/.test(l) && r.h1 !== 1).map(([l, r]) => `${l}: h1=${r.h1} (${r.h1Text})`);
  c('화면마다 보이는 h1 정확히 1개(진행 화면은 sr-only h1)', h1bad.length === 0, h1bad.join(' | '));
  c.note('제목 단계 건너뜀(h1→h3 등)', skips);
  c('제목 단계 건너뜀 없음', skips.length === 0, skips.join(' | '));
  c('html lang=ko', Object.values(R).every(r => r.lang === 'ko'));
  const dlg = Object.entries(R).flatMap(([l, r]) => r.dialogs.map(d => ({ l, ...d })));
  c('role=dialog 은 이름(aria-labelledby)과 aria-modal=true 를 가짐', dlg.length > 0 && dlg.every(d => d.name && d.modal === 'true'), JSON.stringify(dlg.filter(d => !d.name || d.modal !== 'true')));
  // 탭(S05는 roving + aria-controls, S11 seg 는?)
  const tabRows = Object.entries(R).flatMap(([l, r]) => r.tabs.map(t => ({ l, ...t })));
  const badTabs = tabRows.filter(t => !t.controls || !t.controlsExists || t.list !== 'in-tablist');
  c('role=tab 은 tablist 안 + aria-controls 가 존재하는 패널을 가리킴', badTabs.length === 0, JSON.stringify(badTabs.slice(0, 4)));
  c.note('S11 공유 시트 role=tab 구조(참고)', tabRows.filter(t => /share/.test(t.l)));
  const noFocus = Object.entries(R).filter(([l, r]) => /^(home|gate|birth|death|summary|archive|codex|settings)/.test(l) && r.activeIsBody).map(([l]) => l);
  c.note('화면 진입 직후 포커스가 body 인 화면(h1 포커스가 아님)', noFocus);
  c('콘솔·페이지 에러 0', appErrors(page).length === 0 && page.qa.pageErrors.length === 0, appErrors(page).concat(page.qa.pageErrors).join('|'));
  c.done();
});
