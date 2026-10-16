// DOM 공용: 앱 상태·화면 전환·시트·토스트·낭독·복사. 다른 ui 모듈의 허브.
import { loadSettings, saveSettings } from './store.js';
import { enterScreen, motionOff } from './motion.js';

export const S = {
  settings: loadSettings(),
  L: null, clock: null, cert: null, sum: null, view: null, run: 0,
  sources: {},            // src/data/sources.js SOURCES(지연 로드)
};
export const routes = {};
export const go = (name, ...a) => routes[name](...a);

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ESC[c]);
export const sleep = ms => new Promise(r => setTimeout(r, ms));

export const reduced = () => S.settings.reduceMotion || matchMedia('(prefers-reduced-motion: reduce)').matches;

export function applySettings() {
  const r = document.documentElement, s = S.settings;
  if (s.theme === 'light' || s.theme === 'dark') r.dataset.theme = s.theme; else delete r.dataset.theme;
  if (motionOff()) r.dataset.motion = 'off'; else if (s.reduceMotion) r.dataset.motion = 'reduce'; else delete r.dataset.motion;
}
export function setSetting(k, v) {
  S.settings[k] = v;
  saveSettings(S.settings);
  applySettings();
}

// 화면 이력(QA-E-11): 기록관·도감·설정·기록 상세만 이력 한 칸씩 쌓고, 뒤로 가기는 앱 안 이전 화면으로 간다.
// lv = 지금 쌓인 하위 화면('archive'|'codex'|'settings'|'detail'), 이력 state는 { hj, d(깊이) }. 이력 API가 막힌 환경에선 쌓지 않고 일반 이동.
export const SUBS = ['archive', 'codex', 'settings'];
export const PARENT = { archive: 'home', codex: 'home', settings: 'home', detail: 'archive' };
export const nav = { lv: '', popping: false, sheetPop: false };
export function pushScreen(lv) {
  try {
    const d = nav.lv ? (history.state?.d ?? 0) : 0;
    if (!nav.lv) history.replaceState({ hj: 'home', d: 0 }, '');     // 지금 칸은 '앱 안 이전 화면'(홈)으로 표시
    history.pushState({ hj: lv, d: d + 1 }, '');
  } catch {}
  nav.lv = lv;
}

// 화면 하나만 #app에 둔다. body[data-screen]은 디버그·E2E용.
export function show(name, html, { focus = true } = {}) {
  while (sheetOpen()) closeSheet(true);
  if (!SUBS.includes(name) && !(name === 'summary' && nav.lv === 'detail')) nav.lv = '';
  const app = $('#app');
  app.innerHTML = html;
  document.body.dataset.screen = name;
  enterScreen(app.firstElementChild, name);
  scrollTo(0, 0);
  requestAnimationFrame(() => { if (document.body.dataset.screen === name) scrollTo(0, 0); });
  // 하단 바 높이만큼 본문 여백(QA-E-07): 바가 줄바꿈으로 커져도 내용을 가리지 않는다
  const bar = $('.actionbar', app), sec = app.firstElementChild;
  if (bar && globalThis.ResizeObserver) new ResizeObserver(() => { if (bar.isConnected) sec.style.setProperty('--actionbar-h', Math.ceil(bar.offsetHeight) + 'px'); }).observe(bar);
  if (focus) {
    const h = $('h1', app);
    if (h) { h.tabIndex = -1; h.focus({ preventScroll: true }); }
  }
  return app.firstElementChild;
}

export function announce(text) {
  const live = $('#live');
  live.textContent = '';
  setTimeout(() => { live.textContent = text; }, 30);
}

let toastTimer;
export function toast(text, ms = 2400) {
  $('.toast', $('#layer'))?.remove();
  const p = document.createElement('p');
  p.className = 'toast'; p.setAttribute('role', 'status'); p.textContent = text;
  $('#layer').append(p);
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => p.remove(), ms);
}

// 바텀시트(UI-SPEC §7.5). 한 번에 하나. closable=false(선택 시트)면 스크림·Esc로 닫히지 않는다(Esc = 접기).
// 진행 화면에서는 하단 바(.lifebar)를 inert 에서 빼서 시트가 떠 있어도 누를 수 있다.
// 닫을 수 없는 시트(선택·큰 사건) 위에 다른 시트를 열면 그 시트는 숨겨 두었다가(held) 위 시트가 닫히면 되살린다.
let sheet = null;
const suspended = [];
// 브라우저·안드로이드 뒤로 가기로 시트 닫기: 닫을 수 있는 시트가 떠 있는 동안 이력 한 칸(현재 state 복제)을 쌓는다.
// 시트끼리 바뀌어도 칸은 하나. 다른 방법으로 닫히면 setTimeout 뒤에 그 칸을 history.back()으로 걷는다.
// popstate 가 시트 닫기에 쓰였으면 nav.sheetPop = true → main.js 의 화면 이력 처리가 무시한다.
let histPushed = false, skipPops = 0;
const histPush = () => { if (histPushed) return; try { history.pushState({ ...(history.state || {}), hjSheet: 1 }, ''); histPushed = true; } catch {} };
const histPop = () => setTimeout(() => { if (histPushed && !sheet && !suspended.length) { histPushed = false; if (!history.state?.hjSheet) return; skipPops++; try { history.back(); } catch { skipPops--; } } }, 0);
if (typeof addEventListener === 'function') addEventListener('popstate', () => {
  if (skipPops) { skipPops--; nav.sheetPop = true; return; }
  if (histPushed) { histPushed = false; nav.sheetPop = true; if (sheet?.closable) closeSheet(); else if (sheet) histPush(); }
});
export const sheetOpen = () => !!sheet || !!suspended.length;
// 정보 창 아래 숨겨진 결정만 카운트다운을 멈춘다. 결정 아래의 정보 창은 영향을 주지 않는다.
export const sheetHeld = () => suspended.some(s => !s.closable);
const inertTargets = () => { const l = $('#app .life'); return l ? $$('#app .life > :not(.lifebar)') : [$('#app')]; };
const setInert = (list, v) => list.forEach(n => { if (n) n.inert = v; });
export function openSheet({ html, cls = '', label, focus, closable = true, onClose }) {
  const opener = document.activeElement;
  if (sheet?.closable && closable) closeSheet(true);
  if (sheet) {
    sheet.el.hidden = true; sheet.scrim.hidden = true;
    suspended.push(sheet); sheet = null;
  }
  const scrim = document.createElement('div');
  scrim.className = 'scrim';
  const el = document.createElement('section');
  el.className = `sheet ${cls}`.trim();
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-modal', 'true');
  el.innerHTML = `${closable ? '<button class="sheet__handle" type="button" aria-label="닫기"></button>' : ''}${html}`;
  const title = $(label || '.sheet__title', el) || $('h2', el);
  if (title) { title.id ||= 'sheet-title-' + Date.now(); title.tabIndex = -1; el.setAttribute('aria-labelledby', title.id); }
  $('#layer').append(scrim, el);
  document.body.classList.add('is-locked');
  const targets = inertTargets();
  setInert(targets, true);
  const onKey = e => { if (!el.hidden && e.key === 'Escape' && closable) closeSheet(); };
  $('.sheet__handle', el)?.addEventListener('click', () => closeSheet());
  if (closable) scrim.addEventListener('click', () => closeSheet());
  $$('.sheet__close', el).forEach(b => b.addEventListener('click', () => closeSheet()));
  // 포커스 트랩(PC 모달): Tab 이 시트 밖으로 나가지 않게. 모바일 하단 바는 시트 밖에서 계속 눌린다.
  const trap = e => {
    if (e.key !== 'Tab' || !matchMedia('(min-width: 900px)').matches || el.hidden) return;
    const f = $$('button:not([disabled]), a[href], input, select, textarea, summary, [tabindex]:not([tabindex="-1"])', el).filter(x => x.offsetParent !== null);
    if (!f.length) return;
    const first = f[0], last = f.at(-1);
    if (!el.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
    else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };
  document.addEventListener('keydown', trap);
  // 위에서 아래로 끌어 닫기(손잡이·머리글에서 시작). 닫을 수 없는 시트는 끌기 없음.
  if (closable) {
    let y0 = null, dy = 0, t0 = 0, moved = false;
    const grip = [$('.sheet__handle', el), $('.sheet__head', el)].filter(Boolean);
    grip.forEach(g => {
      g.style.touchAction = 'none';
      g.addEventListener('pointerdown', e => { if (e.target.closest('.sheet__close')) return; y0 = e.clientY; dy = 0; moved = false; t0 = e.timeStamp; g.setPointerCapture?.(e.pointerId); });
      g.addEventListener('pointermove', e => { if (y0 == null) return; dy = Math.max(0, e.clientY - y0); if (dy > 6) { moved = true; el.style.animation = 'none'; el.style.transition = 'none'; el.style.transform = `translateY(${dy}px)`; } });
      const end = e => {
        if (y0 == null) return;
        const fast = dy / Math.max(1, e.timeStamp - t0) > .6; y0 = null;
        if (dy > 90 || (fast && dy > 30)) { el.style.transition = 'transform .16s'; el.style.transform = 'translateY(100%)'; setTimeout(() => { if (sheet?.el === el) closeSheet(); }, reduced() ? 0 : 150); }
        else { el.style.transition = 'transform .16s'; el.style.transform = ''; }
      };
      g.addEventListener('pointerup', end); g.addEventListener('pointercancel', end);
      g.addEventListener('click', e => { if (moved) { e.stopImmediatePropagation(); moved = false; } }, true);
    });
  }
  document.addEventListener('keydown', onKey);
  if (closable) histPush();
  sheet = { el, scrim, opener, onKey, trap, onClose, closable, targets };
  const f = (focus && $(focus, el)) || title;
  if (f) { if (!f.matches('button, a, input, textarea')) f.tabIndex = -1; f.focus({ preventScroll: true }); }
  return el;
}
// only: 이 요소의 시트만 닫는다(숨겨 둔 시트가 대상이면 그것을 정리). 없으면 현재 시트.
export function closeSheet(silent = false, only = null) {
  if (only && sheet?.el !== only) {
    const i = suspended.findIndex(s => s.el === only);
    if (i >= 0) { const [h] = suspended.splice(i, 1); h.el.remove(); h.scrim.remove(); document.removeEventListener('keydown', h.onKey); document.removeEventListener('keydown', h.trap); h.onClose?.(); }
    return;
  }
  if (!sheet) return;
  const { el, scrim, opener, onKey, trap, onClose, targets } = sheet;
  sheet = null;
  el.remove(); scrim.remove();
  document.removeEventListener('keydown', onKey); document.removeEventListener('keydown', trap);
  histPop();
  if (suspended.length) {
    sheet = suspended.pop();
    sheet.el.hidden = false; sheet.scrim.hidden = false;
    onClose?.();
    const f = opener?.isConnected && sheet.el.contains(opener) ? opener : $('.choice__prompt, .major__ok, .shock__ok, .sheet__title', sheet.el); f?.focus({ preventScroll: true });
    return;
  }
  document.body.classList.remove('is-locked');
  setInert(targets, false);
  if (!silent) (opener?.isConnected && opener !== document.body ? opener : $('.lifebar [data-act="pause"]'))?.focus({ preventScroll: true });
  onClose?.();
}

// 클립보드 복사: 실패하면 요소 텍스트를 선택해 두고 안내(ARCHITECTURE §17)
export async function copyText(text, el, okMsg, failMsg) {
  try {
    await navigator.clipboard.writeText(text);
    toast(okMsg);
  } catch {
    if (el?.select) el.select();
    else if (el) { const r = document.createRange(); r.selectNodeContents(el); const s = getSelection(); s.removeAllRanges(); s.addRange(r); }
    toast(failMsg);
  }
}
