// S04 진행 화면: HUD·피드·하단 바, 연 진행 루프(UI-SPEC §7.1), 선택 시트(S06), 비교 카드(S07),
// 탭 숨김 멈춤(§7.7), 15분 상한(§7.8), 사망 전환(§7.9).
import { newLife, advanceYear, choose, runToEnd, compareCard, expectedRemainingYears, summarize, createClock } from '../engine/index.js';
import { COMPARE_AGES, STATS, STAGES, SPEEDS, ISSUES } from '../engine/constants.js';
import { S, $, $$, esc, show, go, announce, toast, sleep, reduced, setSetting, sheetOpen, sheetHeld, openSheet, closeSheet } from './dom.js';
import { saveCurrent, clearCurrent, addRecord } from './store.js';
import { fxChips, sexLabel, regionShort, nativeAge, stageState, statLevel, josa, kindBadge } from './labels.js';
import { openStats } from './sheets.js';
import { profileOf } from './profile.js';
import { fmtWon, fmtIncome, fmtRent, nominal, money, tenureText, areaText, AREA_GUESS, deltaText } from './format.js';
import { ringSvg, setRing, countTo, radarSvg, morphRadar, iconSvg, optionIcon } from './gauges.js';
import { sceneHtml, mountScene, silhouetteSvg, topicSceneHtml, TOPIC_TITLE } from './scene.js';
import { topicOf, topicOfId, isMajorEntry, isBigEntry, isMajorChoice, diffProfile, effectsOf, CHAPTERS, chapterOf, isShockEntry, riskOf, RESULT_LABEL } from './major.js';
import { fastYear } from './motion.js';
import { pickNews, loadArchive, archiveNow, pushNewsToast, closeNewsToasts, openPaper, newsArchiveHtml, bindNewsArchive } from './news.js';

const TICK = 100;            // 연 대기 틱
const RING_TICK = 250;       // 카운트다운·비교 카드 틱(UI-SPEC §7.2)
const MAX_YEARS_DOM = 40;
const P = { user: false, hidden: false, choice: false, news: false, mini: false, resumeTimer: 0 };
const yearEls = new Map();
let prevStats = null, prevStage = null, scene = null, prevProf = null, prevIssues = null, lastDiff = [], lastDeltas = {}, lastIssueD = {};

// 시계: 직접 멈춤·탭 숨김이면 멈춘다. 자동결정이 꺼져 있으면 팝업(시트·뉴스·작은 카드)이 떠 있는 동안에도 멈춘다
// (선택 시트 자체는 카운트다운이 있어 예외, 그 위에 정보 시트를 열면 멈춘다). 자동결정에서는 흐른다.
const popupHalt = () => !S.settings.auto && ((sheetOpen() && (!P.choice || sheetHeld())) || P.news || P.mini);
const halted = () => P.user || P.hidden || popupHalt();
function syncClock() {
  scene?.pause(P.user || P.hidden || document.hidden);
  if (!S.clock) return;
  if (halted()) S.clock.pause(); else S.clock.resume();
}
// 자동결정이 켜져 있는 동안만 ms 를 센다. 꺼져 있으면 사용자가 닫을 때까지 기다린다. 반환값 = 취소 함수
function autoAfter(ms, fn) {
  let left = ms;
  const t = setInterval(() => { if (S.settings.auto && !sheetHeld() && (left -= 200) <= 0) { clearInterval(t); fn(); } }, 200);
  return () => clearInterval(t);
}
const capped = () => S.clock?.overCap();

// ───────── 시작 ─────────
export function startNew(L) {
  S.L = L;
  S.clock = createClock();
  S.clock.start();
  enterLife(false);
}

// 이어 하기: 같은 시드 + 기록된 선택으로 그 나이까지 다시 진행(엔진 결정성, ARCHITECTURE §14)
export function restore({ seed, choices = [], age = 0, forcedYear }) {
  const L = newLife({ seed, forced: forcedYear ? { year: forcedYear } : undefined });
  const q = choices.filter(c => !c.forced);
  let i = 0;
  years: while (L.alive && L.age < age) {
    advanceYear(L);
    while (L.pending) {
      const c = q[i]?.eventId === L.pending.eventId && (q[i].age ?? L.age) === L.age ? q[i++] : null;
      if (!c && L.age >= age) break years;          // 저장 시점에 열려 있던 선택은 다시 묻는다
      choose(L, c?.option ?? L.pending.defaultId, c?.auto || !c ? { auto: true } : undefined);
    }
  }
  return L;
}
export function startResume(cur) {
  const L = restore(cur);
  if (!L.alive) return false;
  S.L = L;
  S.forced = cur.forcedYear ? { year: cur.forcedYear } : null;
  let shift = 0;
  S.clock = createClock({ now: () => performance.now() + shift });
  S.clock.start();
  shift = Math.max(0, cur.elapsed || 0);       // 활성 경과 시간을 이어 붙인다(15분 상한 유지)
  enterLife(true);
  return true;
}

function enterLife(resumed) {
  const run = ++S.run;
  Object.assign(P, { user: false, hidden: false, choice: false, news: false, mini: false });
  yearEls.clear();
  prevStats = null; prevStage = null; scene = null; prevProf = null; prevIssues = null; lastDiff = []; lastDeltas = {}; lastIssueD = {}; payDir = null; curChap = null; chapSeen.clear();
  newsSeen.clear(); newsLog.length = 0; closeNewsToasts(); loadArchive();
  S.openNewsBox = openNewsBox; S.newsLog = newsLog; S.openPaper = n => openPaper(n, syncClock);
  show('life', lifeHtml(S.L), { focus: false });
  scene = mountScene($('.life'), S.L, { yearMs: S.clock.yearDelay(S.L, 1), speed: S.settings.speed });
  bind(run);
  const recent = new Map();
  for (const e of S.L.log) if (!e.quiet) (recent.get(e.age) || recent.set(e.age, []).get(e.age)).push(e);   // 비교 줄(quiet)도 복원(QA-E-05)
  for (const [a, es] of recent) if (es.every(e => e.kind === 'compare')) recent.delete(a);   // 진행 중과 같게: 다른 줄이 없는 해에는 비교 줄만 따로 만들지 않는다
  [...recent.keys()].slice(-MAX_YEARS_DOM).forEach(a => renderEntries(recent.get(a), null, true));
  updateHud(false);
  if (resumed) bannerPause('멈춰 둔 생애를 불러왔습니다.');
  loop(run);
}

// ───────── 마크업 ─────────
const pauseInner = p => `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true">${p ? '<path d="M7 5l12 7-12 7z" fill="currentColor"/>' : '<path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" fill="currentColor"/>'}</svg><span>${p ? '재개' : '멈춤'}</span>`;
const autoSwitch = () => `<button class="switch" type="button" role="switch" aria-checked="${S.settings.auto}" aria-label="자동결정" data-act="auto"><span aria-hidden="true">자동</span><span class="switch__track" aria-hidden="true"></span></button>`;
function lifeHtml(L) {
  return `<section class="screen screen--paper life" data-screen="life">
  <h1 class="sr-only">생애 진행</h1>
  <div class="life__side">
  <header class="hud">
    <div class="hud__row">
      <p class="hud__age"><span data-hud="age">${L.age}</span><span class="hud__unit">세</span></p>
      <div class="hud__id"><p class="hud__name">${esc(L.name)} <span class="tag">${sexLabel(L.sex)}</span></p>
        <p class="hud__meta"><span class="mono" data-hud="year">${L.year}</span>년 · <span data-hud="region"></span> 거주</p></div>
      <span class="tag tag--ink" data-hud="paused" hidden>멈춤</span>
    </div>
    <div class="banner" role="status" hidden><span></span><button class="btn btn--sm btn--ink" type="button" data-act="resume">이어 가기</button></div>
    <ul class="stats" aria-label="6지표">${STATS.map(s => `<li><button class="stat" type="button" data-stat="${s.key}">${ringSvg(s.key, L.stats[s.key])}<span class="stat__label">${s.label}</span><span class="stat__value"></span><span class="stat__delta" aria-hidden="true"></span></button></li>`).join('')}</ul>
  </header>
  ${sceneHtml(L)}
  <ol class="chap" aria-label="인생 챕터">${CHAPTERS.map(c => `<li class="chap__seg" data-chap="${c.n}"><span class="chap__dot"></span><span class="chap__n">${c.n}</span></li>`).join('')}</ol><p class="chap__label" aria-hidden="true"></p>
  ${profHtml(L)}
  </div>
  <div class="life__feed"><ol class="feed" aria-label="생애 기록"></ol></div>
  <aside class="life__aux" aria-label="보조 패널"><details class="aux" open><summary>과거 신문</summary><div class="aux__news"></div></details><details class="aux" open><summary>관심사·고민</summary><div class="aux__issues"></div></details><div class="aux"><button class="btn btn--block" type="button" data-aux-tab="peers">같은 날 태어난 사람들</button></div></aside>
  <nav class="lifebar" aria-label="진행 조작">
    <div class="lifebar__row">
      <button class="btn lifebar__pause" type="button" aria-pressed="false" data-act="pause">${pauseInner(false)}</button>
      <div class="seg seg--num" role="group" aria-label="배속">${SPEEDS.map(n => `<button class="seg__btn" type="button" data-speed="${n}" aria-pressed="${S.settings.speed === n}" aria-label="${n}배속">${n}×</button>`).join('')}</div>
      ${autoSwitch()}
    </div>
    <div class="lifebar__tabs lifebar__tabs--4">${[['stats', '지표'], ['traits', '성향'], ['issues', '관심사·고민'], ['peers', '동갑내기']].map(([t, l]) => `<button class="tabbtn" type="button" id="lt-${t}" aria-haspopup="dialog" aria-pressed="false" data-tab="${t}">${l}</button>`).join('')}</div>
  </nav>
</section>`;
}

const chips = (fx, lead) => {
  const c = fxChips(fx);
  if (!c.length) return '';
  return `<p class="entry__fx">${lead ? `<span class="fx">${lead}</span>` : ''}${c.map(x => `<span class="fx">${esc(x)}</span>`).join('')}</p>`;
};
function srcLine(src) {
  const id = Array.isArray(src) ? src[0] : src;
  const m = id && S.sources[id];
  return m ? `<span class="entry__src">자료 · ${esc([m.org, m.title, m.year].filter(Boolean).join(' '))} · ${kindBadge(m.kind).label}</span>` : '';
}
const splitNews = t => { const m = String(t).match(/^(.+?[.?!])\s+(.+)$/); return m ? [m[1], m[2]] : [t, '']; };
function choiceParts(e, req) {
  const opt = req?.options?.find(o => o.id === e.option);
  let label = e.label ?? opt?.label, result = e.text;
  if (String(e.text).includes(' → ')) { label ??= e.text.split(' → ').pop(); result = ''; }
  return { label: label ?? '', result };
}
function entryHtml(e, req) {
  const cls = ['entry'];
  let body;
  if (e.kind === 'news') {
    const [title, rest] = splitNews(e.text);
    const future = e.year > new Date().getFullYear() ? ' <span class="badge badge--projected">전망</span>' : '';
    body = `<article class="news" aria-label="시대 뉴스"><p class="news__head"><span>보도자료${future}</span><span class="mono">${e.year}</span></p><p class="news__title">${esc(title)}</p>${rest ? `<p class="news__body">${esc(rest)}</p>` : ''}${chips(e.effects, '내 삶에 들어온 뉴스')}</article>`;
  } else if (e.kind === 'choice') {
    cls.push('entry--choice');
    const { label, result } = choiceParts(e, req);
    body = `<span class="tag entry__kind">선택</span><span class="entry__label">${esc(label)}</span>${e.auto ? ' <span class="tag">기본 행동</span>' : ''}${result ? `<p class="entry__result">${esc(result)}</p>` : ''}${chips(e.effects)}`;
  } else if (e.kind === 'compare') {
    cls.push('entry--quiet');
    body = `<span class="tag entry__kind">비교</span>같은 날 태어난 세 사람의 ${nativeAge(e.age)}.`;
  } else if (e.kind === 'death') {
    cls.push('entry--death');
    body = `<p class="entry__text">${esc(e.text)}</p>`;
  } else {
    body = `<span class="entry__ico">${iconSvg(optionIcon(e.text))}</span>` + esc(e.text) + chips(e.effects) + srcLine(e.src);
  }
  if (e.sensitive) cls.push('entry--sensitive');
  return `<li class="${cls.join(' ')}"${e.kind === 'compare' ? ' data-cmp' : ''}>${body}</li>`;
}

function yearList(age, year, initial) {
  const have = yearEls.get(age);
  if (have?.isConnected) return have;
  const feed = $('.feed');
  const li = document.createElement('li');
  li.className = 'feed__year is-sum' + (initial ? '' : ' is-new');
  li.innerHTML = `<p class="feed__when">${age}세<span class="feed__cal">${year}</span></p><ul class="feed__items"></ul>`;
  feed.prepend(li);
  const ul = $('.feed__items', li);
  yearEls.set(age, ul);
  while (feed.children.length > MAX_YEARS_DOM) {
    const last = feed.lastElementChild;
    for (const [a, el] of yearEls) if (el.parentElement === last) yearEls.delete(a);
    last.remove();
  }
  return ul;
}
// 새 해를 맨 위에 넣는다. 읽던 줄이 밀리지 않게 삽입 높이만큼 스크롤 보정(§7.1)
function renderEntries(entries, req, initial = false) {
  const vis = (entries || []).filter(e => !e.quiet || (initial && e.kind === 'compare'));
  if (!vis.length || !$('.feed')) return;
  const feed = $('.feed'), hudH = $('.hud').offsetHeight, y0 = scrollY, h0 = feed.offsetHeight;
  for (const e of vis) {
    const ul = yearList(e.age, e.year, initial);
    ul.insertAdjacentHTML('beforeend', entryHtml(e, req));
    if (isMajorEntry(e) || e.kind === 'choice' || e.kind === 'news' || e.sensitive) ul.closest('.feed__year').classList.remove('is-sum');
  }
  if (!initial && y0 > $('.life__feed').offsetTop + 4) scrollBy(0, feed.offsetHeight - h0);
  if (!initial) sayBubble(vis);
}

// 장면 말풍선: 민감 항목·뉴스·비교 줄은 말풍선에 올리지 않는다(피드에만)
function sayBubble(vis) {
  const e = [...vis].reverse().find(x => !x.sensitive && x.kind !== 'news' && x.kind !== 'compare' && x.kind !== 'death');
  if (!e || !scene) return;
  const d = Object.values(e.effects?.stats || {}).reduce((a, b) => a + b, 0);
  const txt = e.kind === 'choice' ? (choiceParts(e, null).result || choiceParts(e, null).label) : e.text;
  scene.bubble(String(txt || '').replace(/\s+/g, ' ').slice(0, 70), d > 0 ? 'up' : d < 0 ? 'down' : '');
}

// 데스크톱 우측 보조 패널(≥900px에서만 보임): 과거 신문 + 관심사·고민 막대
function refreshAux() {
  const root = $('.life'), L = S.L;
  if (!root || !L) return;
  const nw = $('.aux__news', root), is = $('.aux__issues', root);
  if (nw) { nw.innerHTML = newsArchiveHtml(newsLog); if (!nw._b) { nw._b = 1; bindNewsArchive(nw); } }
  if (is) is.innerHTML = ISSUES.map(i => [i.key, i.label]).sort((a, b) => L.issues[b[0]] - L.issues[a[0]]).map(([k, l]) => `<div class="aux__row"><span>${esc(l)}</span><span class="mono">${L.issues[k]}</span><span class="meter"><span class="meter__fill" style="--v:${L.issues[k]}"></span></span></div>`).join('');
}
function updateHud(animate = true) {
  const L = S.L, root = $('.life');
  if (!root) return;
  refreshAux();
  $('[data-hud="age"]', root).textContent = L.age;
  $('[data-hud="year"]', root).textContent = L.year;
  $('[data-hud="region"]', root).textContent = regionShort(L.home?.region ?? L.birth?.region);
  const ch = chapterOf(L, null, curChap);
  for (const c of CHAPTERS) {
    const li = $(`[data-chap="${c.n}"]`, root);
    li.classList.toggle('is-done', c.n < ch.n);
    li.classList.toggle('is-current', c.n === ch.n);
    if (c.n === ch.n) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
  }
  $('.chap__label', root).textContent = `제${ch.n}장 ${ch.label}`;
  if (prevStage && prevStage !== ch.n) announce(`${L.age}세, 제${ch.n}장 ${ch.label}이 시작됐습니다.`);
  prevStage = ch.n;
  const pNow = profileOf(L);
  lastDiff = prevProf ? diffProfile(prevProf, pNow, L.year, L.job) : [];
  prevProf = pNow;
  lastDeltas = prevStats ? Object.fromEntries(STATS.map(s => [s.key, L.stats[s.key] - prevStats[s.key]])) : {};
  lastIssueD = prevIssues ? Object.fromEntries(Object.keys(L.issues).map(k => [k, L.issues[k] - (prevIssues[k] ?? L.issues[k])])) : {};
  prevIssues = { ...L.issues };
  root.dataset.fast = fastYear(S.settings.speed) ? '1' : '';
  const ageEl = $('[data-hud="age"]', root);
  if (animate && ageEl.textContent !== String(L.age)) { ageEl.classList.remove('tick'); void ageEl.offsetWidth; ageEl.classList.add('tick'); }
  let big = 0;
  for (const s of STATS) {
    const b = $(`[data-stat="${s.key}"]`, root), v = L.stats[s.key], d = prevStats ? v - prevStats[s.key] : 0, lv = statLevel(v);
    $('.stat__value', b).textContent = v;
    setRing(b, v);
    b.classList.toggle('is-low', lv === 'low');
    b.classList.toggle('is-critical', lv === 'critical');
    b.setAttribute('aria-label', `${s.label} ${v}${lv ? (lv === 'low' ? ', 주의' : ', 위험') : ''}${d ? `, ${Math.abs(d)} ${d > 0 ? '오름' : '내림'}` : ''}, 자세히`);
    if (d) {
      $('.stat__delta', b).textContent = deltaText(d);
      b.dataset.dir = d > 0 ? 'up' : 'down';
      b.classList.toggle('is-big', Math.abs(d) >= 8);
      b.classList.remove('is-changed'); void b.offsetWidth; b.classList.add('is-changed');
      clearTimeout(b._t); b._t = setTimeout(() => b.classList.remove('is-changed'), 1700);
      big = Math.max(big, Math.abs(d));
    }
  }
  if (animate && scene && big >= 8 && !fastYear(S.settings.speed)) { const el = scene.el; el.classList.remove('is-shake'); void el.offsetWidth; el.classList.add('is-shake'); }
  prevStats = { ...L.stats };
  updateProfile(L);
  if (animate && scene) scene.update(L, { yearMs: S.clock?.yearDelay(L, 1), speed: S.settings.speed, dead: !L.alive });
}

// ───────── 멈춤 ─────────
function updatePauseUI() {
  const root = $('.life');
  if (!root) return;
  const paused = P.user || P.hidden;
  $('[data-hud="paused"]', root).hidden = !paused;
  const b = $('[data-act="pause"]', root);
  b.setAttribute('aria-pressed', paused); b.innerHTML = pauseInner(paused);
}
function bannerPause(text) {
  P.hidden = true;
  const bn = $('.life .banner');
  if (bn) { $('span', bn).textContent = text; bn.hidden = false; }
  updatePauseUI(); syncClock();
  clearTimeout(P.resumeTimer);
  P.resumeTimer = setTimeout(resumeHidden, 3000);    // 3초 뒤 자동으로 이어 간다(직접 멈춘 상태는 유지)
}
function resumeHidden() {
  clearTimeout(P.resumeTimer);
  P.hidden = false;
  const bn = $('.life .banner');
  if (bn) bn.hidden = true;
  updatePauseUI(); syncClock();
}
export function persist() {
  const L = S.L;
  if (!L?.alive || !S.clock) return;
  saveCurrent({ forcedYear: S.forced?.year, seed: L.seed, choices: L.choices, elapsed: Math.round(S.clock.elapsed()), age: L.age, name: L.name, year: L.year, at: Date.now() });
}

let unbind = () => {};
function bind(run) {
  unbind();
  const root = $('.life');
  const onVis = () => {
    if (run !== S.run) return;
    if (document.hidden) { P.hidden = true; clearTimeout(P.resumeTimer); syncClock(); persist(); updatePauseUI(); }
    else if (P.hidden) bannerPause('다른 화면에 있는 동안 멈췄습니다.');
  };
  document.addEventListener('visibilitychange', onVis);
  // PC 단축키: Space 멈춤/재개, 1·2·3 배속, ←→ 탭 이동. (Esc 는 시트가 처리, 선택 시트가 열려 있으면 1~3 은 선택지)
  const TABIDS = ['stats', 'traits', 'issues', 'peers'];
  const onKey = e => {
    if (run !== S.run || e.ctrlKey || e.metaKey || e.altKey || document.body.dataset.screen !== 'life') return;
    if (e.target.closest?.('input, textarea, select, [role="switch"], summary, a') || (e.key === ' ' && e.target.closest?.('button'))) return;
    if (e.key === ' ') { e.preventDefault(); $('[data-act="pause"]', root).click(); }
    else if (!P.choice && ['1', '2', '3'].includes(e.key)) $(`[data-speed="${SPEEDS[+e.key - 1]}"]`, root)?.click();
    else if (!P.choice && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) { const i = TABIDS.indexOf(tabId); openTab(TABIDS[(i < 0 ? (e.key === 'ArrowRight' ? 0 : 3) : i + (e.key === 'ArrowRight' ? 1 : 3)) % 4]); }
  };
  document.addEventListener('keydown', onKey);
  unbind = () => { document.removeEventListener('visibilitychange', onVis); document.removeEventListener('keydown', onKey); };
  root.addEventListener('click', e => {
    const ys = e.target.closest('.feed__year.is-sum');
    if (ys && !e.target.closest('button')) { ys.classList.toggle('is-open'); return; }
    const t = e.target.closest('button');
    if (!t) return;
    const act = t.dataset.act;
    if (act === 'pause') {
      if (P.user || P.hidden) { P.user = false; resumeHidden(); toast('재개'); } else { P.user = true; updatePauseUI(); syncClock(); toast('멈춤'); }
    } else if (act === 'resume') { P.user = false; resumeHidden(); }
    else if (act === 'auto') toggleAuto();
    else if (t.dataset.speed) {
      setSetting('speed', +t.dataset.speed);
      root.dataset.fast = fastYear(+t.dataset.speed) ? '1' : '';
      $$('[data-speed]', root).forEach(b => b.setAttribute('aria-pressed', b === t));
      toast(`${t.dataset.speed}배속`, 1200);
    } else if (t.dataset.tab || t.dataset.auxTab) openTab(t.dataset.tab || t.dataset.auxTab);
    else if (act === 'prof') toggleProf();
    else if (t.dataset.stat) openTab('stats', t.dataset.stat);
  });
}
// 하단 탭 = 유일한 탭 줄. 같은 탭을 다시 누르면 시트가 닫히고, 활성 탭은 시트와 함께 바뀐다.
let tabEl = null, tabId = null;
function setTab(id) {
  tabId = id;
  $$('.lifebar .tabbtn').forEach(b => { const on = b.dataset.tab === id; b.setAttribute('aria-pressed', on); b.classList.toggle('is-active', on); });
}
export function openTab(id, focusKey = null) {
  if (tabId === id && tabEl?.isConnected && !tabEl.hidden) { closeSheet(true, tabEl); return; }
  const done = () => { if (tabId === id) setTab(null); syncClock(); };
  if (id === 'peers') openCompare(done);
  else if (id === 'news') openNewsBox();
  else { tabEl = openStats(id, focusKey, done); }
  if (id === 'peers') tabEl = $('.compare-sheet');
  setTab(id);
  syncClock();
}
function toggleAuto() {
  setSetting('auto', !S.settings.auto);
  $$('[data-act="auto"]').forEach(b => b.setAttribute('aria-checked', S.settings.auto));
  toast(S.settings.auto ? '자동결정 켬' : '자동결정 끔', 1400);
}

// ───────── 루프 ─────────
function waitYear(run) {
  let left = S.clock.yearDelay(S.L, 1);     // 1배속 기준 ms, 배속은 틱마다 반영
  return new Promise(res => {
    const step = () => {
      if (run !== S.run) return;
      syncClock();
      if (capped()) return res();
      if (!halted()) left -= TICK * S.settings.speed;
      if (left <= 0) return res();
      setTimeout(step, TICK);
    };
    setTimeout(step, TICK);
  });
}

async function loop(run) {
  const L = S.L;
  try {
    if (L.pending) await handle({ entries: [], choice: L.pending }, run);
    while (L.alive && run === S.run) {
      await waitYear(run);
      if (run !== S.run) return;
      if (capped()) return finishCap(run);
      await handle(advanceYear(L), run);
      if (run !== S.run) return;
      if (!L.alive) return toDeath(run);
      if (capped()) return finishCap(run);
      persist();
    }
  } catch (err) {
    console.error(err);
    if (run !== S.run) return;
    toast('진행 중 문제가 생겼습니다. 남은 생애를 기본 행동으로 마칩니다.', 3000);
    finishCap(run, true);
  }
}

async function handle(r, run, req = null) {
  if (!r) return;
  if (r.chapter) curChap = r.chapter;
  renderEntries(r.entries, req);
  updateHud();
  const sh = (r.entries || []).find(isShockEntry);
  if (sh && S.L.alive && !capped() && run === S.run) { newsSeen.add(S.L.year); await showShock(sh, run); } else maybeNews(r.entries);
  await showMajor(r, run, req);
  if (r.choice && run === S.run) {
    const ctxText = [...(r.entries || [])].reverse().find(e => e.id === r.choice.eventId && e.kind !== 'choice')?.text;
    if (isMajorChoice(r.choice) && run === S.run) await chapterTitle(chapterOf(S.L, r.choice));
    const r2 = await runChoice(r.choice, run, ctxText);
    if (r2) await handle(r2, run, r.choice);
  }
}

async function finishCap(run, quiet = false) {
  if (run !== S.run) return;
  const L = S.L;
  if (!quiet) toast('시간이 다 되어 기본 행동으로 마칩니다.', 3000);
  try {
    if (L.pending) choose(L, L.pending.defaultId, { auto: true });
    if (L.alive) runToEnd(L, 'cap');            // 엔진이 상한 고지(end.cap)를 결산에 남긴다
  } catch (e) { console.error(e); }
  await sleep(reduced() ? 0 : 1200);
  if (run !== S.run) return;
  finishLife();
  go('death');
}

async function toDeath(run) {
  announce(S.L.death?.horizon ? '2050년, 관찰이 끝납니다.' : '마지막 해입니다.');
  scene?.update(S.L, { dead: true });
  await sleep(reduced() ? 0 : 1200);
  if (run !== S.run) return;
  finishLife();
  go('death');
}

// 기록관 저장은 사망 화면을 띄우기 전에(UI-SPEC S09 ①)
function finishLife() {
  S.run++;
  unbind();
  clearTimeout(P.resumeTimer);
  S.clock?.pause();
  closeCompare?.(); closeNewsToasts();
  scene?.pause(true); scene = null;
  closeSheet(true);
  const L = S.L;
  try { S.sum = summarize(L, { hideSensitiveCause: S.settings.hideSensitiveCause }); } catch (e) { console.error(e); S.sum = null; }
  const death = S.sum?.death ?? L.death ?? { age: L.age, year: L.year };
  addRecord({
    id: `${L.seed}-${Date.now()}`, ...(S.forced?.year && { forcedYear: S.forced.year }), seed: L.seed, choices: L.choices, name: L.name, sex: L.sex,
    birthYear: L.birth.year, deathAge: death.age, deathYear: death.year, ...(death.horizon && { horizon: true }), verdictMain: S.sum?.verdict?.main ?? '', at: Date.now(),
    ...(L.flags?.capped != null && { capped: true }),
  });
  clearCurrent();
}

// ───────── 챕터 타이틀 카드(이정표 결정 직전, 챕터당 한 번) ─────────
const chapSeen = new Set();
function chapterTitle(ch) {
  const key = ch.n || `shock${S.L.year}`;
  if (chapSeen.has(key)) return;
  chapSeen.add(key);
  if (S.settings.speed >= 4) return;
  return new Promise(res => {
    const el = document.createElement('div');
    el.className = 'chap-card'; el.setAttribute('role', 'status');
    el.innerHTML = `<p class="chap-card__n">${ch.n ? `제${ch.n}장` : '속보'}</p><p class="chap-card__t">${esc(ch.label)}</p>`;
    $('#layer').append(el);
    let stop = () => {};
    const done = () => { stop(); el.classList.add('is-out'); setTimeout(() => { el.remove(); res(); }, 300); };
    el.addEventListener('click', done);
    el.insertAdjacentHTML('beforeend', '<p class="chap-card__hint">탭하면 계속</p>');
    stop = autoAfter(900, done);
  });
}

// ───────── 시대 충격(속보) 연출 ─────────
function showShock(e, run) {
  const L = S.L, fast = S.settings.auto;
  const m = String(e.text).match(/^(.+?[.?!])\s+(.+)$/), head = m ? m[1] : e.text, rest = m ? m[2] : '';
  const sn = { year: e.year ?? L.year, headline: head, summary: rest, impact: '', axes: Object.keys(e.effects?.issues || {}), from: 'era' };
  newsLog.push(sn); pushNewsToast(sn, item => { openPaper(item, syncClock); syncClock(); }); refreshAux();   // 속보 연출 뒤에도 토스트로 남긴다
  return new Promise(res => {
    const el = openSheet({
      cls: `shock${fast ? ' is-simple' : ''}`, closable: false, label: '.shock__title', focus: '.shock__ok',
      onClose: () => { syncClock(); res(); },
      html: `<div class="shock__stage" aria-hidden="true">
          <p class="shock__band"><span class="shock__tag">속보</span><span class="shock__year mono">${e.year ?? L.year}</span></p>
          <div class="shock__collage"><p>${esc(head)}</p><p>${esc(rest || head)}</p><p>${esc(head)}</p></div>
          <svg class="shock__chart" viewBox="0 0 200 60" preserveAspectRatio="none"><polyline points="0,8 30,10 55,6 80,16 105,24 130,22 150,42 175,52 200,56"/></svg></div>
        <div class="sheet__body shock__body"><p class="major__badge">속보 · 시대의 충격</p>
          <h2 class="shock__title major__title">${esc(head)}</h2>${rest ? `<p class="major__text">${esc(rest)}</p>` : ''}
          ${impactHtml(e)}
          <button class="btn btn--primary btn--block major__ok shock__ok" type="button">확인</button></div>`,
    });
    let stop = () => {};
    const done = () => { stop(); closeSheet(true, el); };
    $('.shock__ok', el).addEventListener('click', done);
    stop = autoAfter(2400, done);       // 자동결정에서만 자동 진행
    syncClock();
  });
}

// ───────── 중대한 사건: 큰 카드 + 영향 + [확인] ─────────
const effChip = e => `<span class="eff eff--${e.tone}"><span class="eff__k">${esc(e.label)}</span><span class="eff__a" aria-hidden="true">${e.arrows}</span><span class="sr-only">${esc(e.text)}</span></span>`;
const deltaChip = (kind, key, d) => { const [e] = effectsOf({ [kind === 'stat' ? 'stats' : 'issues']: { [key]: d } }); return e ? `<span class="eff eff--${e.tone}"><span class="eff__k">${esc(e.label)}</span><span class="eff__a" aria-hidden="true">${d > 0 ? '▲' : '▼'}${Math.abs(d)}</span><span class="sr-only">${esc(e.text)}</span></span>` : ''; };
function impactHtml(e) {
  const fx = e.effects || {}, im = e.impact;
  const toObj = a => Array.isArray(a) ? Object.fromEntries(a.map(x => [x.key, x.delta])) : null;
  const stats = Object.entries(toObj(im?.stats) ?? fx.stats ?? lastDeltas).filter(([, d]) => d);
  const issues = Object.entries(toObj(im?.issues) ?? fx.issues ?? lastIssueD).filter(([, d]) => Math.abs(d) >= 2);
  const profLines = Array.isArray(im?.profile) ? im.profile.map(x => x.text).filter(Boolean) : null;
  const rows = [];
  if (stats.length) rows.push(`<div class="impact__row"><p class="impact__h">지표</p><p class="impact__chips">${stats.map(([k, d]) => deltaChip('stat', k, d)).join('')}</p></div>`);
  if (issues.length) rows.push(`<div class="impact__row"><p class="impact__h">관심사·고민</p><p class="impact__chips">${issues.map(([k, d]) => deltaChip('issue', k, d)).join('')}</p></div>`);
  if (profLines?.length) rows.push(`<div class="impact__row"><p class="impact__h">내 상태</p><ul class="impact__diff">${profLines.map(t => `<li>${esc(t)}</li>`).join('')}</ul></div>`);
  else if (lastDiff.length) rows.push(`<div class="impact__row"><p class="impact__h">내 상태</p><ul class="impact__diff">${lastDiff.map(x => `<li><span class="impact__k">${esc(x.label)}</span> <span class="impact__from">${esc(x.from)}</span> <span aria-hidden="true">→</span><span class="sr-only">에서</span> <b>${esc(x.to)}</b></li>`).join('')}</ul></div>`);
  return rows.length ? `<section class="impact" aria-label="이 일로 바뀐 것"><h3 class="impact__title">이 일로 바뀐 것</h3>${rows.join('')}</section>` : '';
}
function showMajor(r, run, req) {
  const L = S.L;
  if (!L.alive || capped() || run !== S.run) return;
  const pend = r.choice?.eventId;
  const e = (r.entries || []).find(x => isMajorEntry(x) && x.id !== pend);
  if (!e) return;
  const topic = topicOf(e) ?? 'housing';
  const text = e.kind === 'choice' ? (choiceParts(e, req).result || choiceParts(e, req).label) : e.text;
  if (!isBigEntry(e, text)) return miniCard(e, text, topic);
  const m = String(text).match(/^(.+?[.?!])\s+(.+)$/), head = m ? m[1] : text, rest = m ? m[2] : '';
  return new Promise(res => {
    const el = openSheet({
      cls: 'major', closable: false, label: '.major__title', focus: '.major__ok',
      onClose: () => { syncClock(); res(); },
      html: `<div class="major__scene">${topicSceneHtml(topic, L)}</div>
        <div class="sheet__body major__body"><p class="major__badge">${esc(TOPIC_TITLE[topic] ?? '큰 일')}</p>
        <h2 class="major__title">${esc(head)}</h2>${rest ? `<p class="major__text">${esc(rest)}</p>` : ''}
        ${e.result ? `<span class="reveal__tag reveal__tag--${e.result}">${RESULT_LABEL[e.result] ?? ''}</span>` : ''}${e.why ? `<p class="reveal__why"><b>내 선택이 만든 차이</b> ${esc(e.why)}</p>` : ''}
        ${impactHtml(e)}
        <button class="btn btn--primary btn--block major__ok" type="button">확인</button></div>`,
    });
    let stop = () => {};
    const done = () => { stop(); closeSheet(true, el); };
    $('.major__ok', el).addEventListener('click', done);
    stop = autoAfter(2600, done);       // 자동결정에서만 2.6초 뒤 진행, 아니면 [확인]
    syncClock();
  });
}

// 작은 카드(비차단): 가족 사별·진단·일반 상실 등. 하단 바를 가리지 않고, 영향 칩만 얇게 보여 준다.
function miniCard(e, text, topic) {
  $('.mini')?.remove();
  const m = String(text).match(/^(.+?[.?!])\s+(.+)$/), head = m ? m[1] : text;
  const el = document.createElement('aside');
  el.className = 'mini'; el.setAttribute('role', 'status');
  el.innerHTML = `<p class="mini__t"><span class="mini__badge">${esc(TOPIC_TITLE[topic] ?? '소식')}</span> ${esc(head)}</p>${impactHtml(e)}<button class="mini__ok major__ok" type="button">확인</button>`;
  $('#layer').append(el);
  let stop = () => {};
  const close = () => { stop(); el.remove(); P.mini = false; syncClock(); };
  $('.mini__ok', el).addEventListener('click', close);
  stop = autoAfter(3500, close);
  P.mini = true; syncClock();
}

// ───────── 동갑내기(비교 카드): 하단 버튼으로만 연다. 열려 있는 동안 시계는 멈춘다 ─────────
let closeCompare = null;
function peerRows(card) {
  const L = S.L;
  const me = typeof card.me === 'string' ? { line: card.me } : (card.me || {});
  return [...card.peers.map(p => ({ ...p })), { name: L.name, sex: L.sex, region: L.home?.region, ...me, self: true }]
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}
function cardHtml(age) {
  let card;
  try { card = compareCard(S.L, age); } catch (e) { console.error(e); return '<p class="empty">이 나이의 카드를 만들지 못했습니다.</p>'; }
  const rows = peerRows(card);
  return `<div class="cmp-strip" aria-hidden="true">${rows.map(p => `<span class="cmp-p${p.self ? ' is-self' : ''}">${silhouetteSvg(age)}<span class="cmp-n">${esc(p.name)}</span></span>`).join('')}</div>
    <ul class="peer-list">${rows.map(p => `<li class="peer"><span class="peer__name">${esc(p.name)}</span><span class="peer__meta">${sexLabel(p.sex)} · ${esc(regionShort(p.region))}</span>${p.self ? ' <span class="tag">본인</span>' : ''}<p class="peer__line">${esc(p.line || '—')}</p></li>`).join('')}</ul>
    ${card.stat ? `<p class="cap compare__stat">${esc(card.stat)}</p>` : ''}`;
}
function openCompare(onClose) {
  const L = S.L, ages = [...COMPARE_AGES.filter(a => a < L.age), L.age];
  const el = openSheet({
    cls: 'compare-sheet', onClose: () => { closeCompare = null; onClose?.(); syncClock(); },
    html: `<div class="sheet__head"><h2 class="sheet__title">같은 날 태어난 사람들</h2><button class="sheet__close" type="button">닫기</button></div>
      <div class="cmp-tabs" role="group" aria-label="나이 고르기">${ages.map(a => `<button class="seg__btn" type="button" data-cage="${a}">${a === L.age ? `지금 ${a}세` : `${a}세`}</button>`).join('')}</div>
      <div class="sheet__body" data-cbody></div>`,
  });
  closeCompare = () => closeSheet(true);
  const body = $('[data-cbody]', el);
  const sel = a => {
    $$('[data-cage]', el).forEach(b => b.setAttribute('aria-pressed', +b.dataset.cage === a));
    body.innerHTML = `<p class="compare__title">${nativeAge(a)}, 같은 날 태어난 사람들</p>${cardHtml(a)}`;
    body.scrollTop = 0;
  };
  $('.cmp-tabs', el).addEventListener('click', e => { const b = e.target.closest('[data-cage]'); if (b) sel(+b.dataset.cage); });
  sel(L.age);
  syncClock();
}

// ───────── 시대 뉴스: 하단 토스트 스택 → 누르면 신문 지면, 과거 신문 목록 ─────────
const newsSeen = new Set(), newsLog = [];
function maybeNews(entries) {
  const n = pickNews(S.L, entries, archiveNow(), newsSeen);
  if (!n) return;
  newsLog.push(n);
  pushNewsToast(n, item => { openPaper(item, syncClock); syncClock(); });
  refreshAux();
}
function openNewsBox() {
  const el = openSheet({
    onClose: syncClock,
    html: `<div class="sheet__head"><h2 class="sheet__title">과거 신문</h2><button class="sheet__close" type="button">닫기</button></div>
      <div class="sheet__body">${newsArchiveHtml(newsLog)}</div>`,
  });
  bindNewsArchive(el);
  syncClock();
}

// ───────── 프로필 한눈 패널 ─────────
const FIRM = { micro: '영세 사업장', small: '소규모 사업장', mid: '중간 규모', large: '대규모' };
const ESTB = '<span class="est">추정</span>';
const cell = (f, label, wide = '') => `<div class="prof__cell${wide}" data-f="${f}"><dt>${label}</dt><dd></dd></div>`;
function profHtml(L) {
  return `<section class="prof" aria-label="내 현재 상태">
  <button class="prof__sum" type="button" aria-expanded="false" aria-controls="prof-body" data-act="prof"><span class="prof__chips"></span><svg class="prof__chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg></button>
  <div class="prof__body" id="prof-body" hidden>
    <dl class="prof__grid">${cell('home', '거주지')}${cell('dwell', '주거 형태')}${cell('job', '직업')}${cell('emp', '고용 형태')}${cell('pay', '연봉')}${cell('years', '연차')}${cell('rank', '직급')}${cell('bizkind', '업종')}${cell('bizyears', '업력')}${cell('sales', '월 매출')}${cell('profit', '월 순익')}${cell('money', '자산 · 부채', ' prof__cell--wide')}</dl>
    <details class="wealth"><summary class="wealth__sum">자산·금융 <span class="est">추정</span></summary><div class="wealth__body" data-wealth></div></details>
    <div class="prof__charts"><div><p class="prof__sub">내가 마주한 관심사와 고민</p>${radarSvg('issue', L.issues, { size: 210, aria: '관심사·고민 10축 지도' })}</div><div><p class="prof__sub">성향</p>${radarSvg('trait', L.traits, { size: 170, aria: '성향 5축' })}</div></div>
    <p class="prof__note">금액은 그해 가격 기준이고, 작은 글씨는 2026년 환산(약)입니다. '추정'은 게임이 직업·규모·연차로 짐작한 값입니다. 순위나 평가가 아닙니다.</p>
  </div></section>`;
}
function toggleProf() {
  const p = $('.prof'), open = !p.classList.contains('is-open');
  p.classList.toggle('is-open', open);
  $('.prof__sum', p).setAttribute('aria-expanded', open);
  $('.prof__body', p).hidden = !open;
  if (open) updateProfile(S.L, false);
}
let payDir = null, curChap = null;
function updateProfile(L, animate = true) {
  const root = $('.prof');
  if (!root) return;
  const p = profileOf(L), w = p.work, open = root.classList.contains('is-open'), Y = L.year, j = L.job;
  const ms = animate && open ? 700 : 0;
  const mw = v => fmtWon(nominal(v, Y));                                        // 그해 명목 금액
  const incMode = { daily: j.major === '9' && !j.regular, monthly: !j.regular && j.major !== '9' };
  const inc = v => fmtIncome(nominal(v, Y), incMode);
  const incCell = v => inc(v).replace(/^\S+ (약 )?/, '$1');
  const tdy = v => money(v, Y).today ?? '';
  const chip = (ico, html) => `<span class="prof__chip">${iconSvg(ico, 'ico')}${html}</span>`;
  const jobTxt = w.jobLine || (w.school && w.emp.code === 'student' ? w.school : w.emp.label);
  const tenure = p.home.tenure === 'monthly' && Y < 1985 ? '사글세' : p.home.tenureLabel;
  let chips = chip('home', `<b>${esc(p.home.regionLabel)}</b> ${esc(tenure)}`) + chip('work', `<b>${esc(jobTxt)}</b>`);
  if (p.pay) chips += chip('money', (p.biz ? `월 순익 <b>${mw(p.biz.monthlyProfit)}</b>` : `<b>${inc(p.pay.annual)}</b>`) + (payDir && Date.now() < payDir.until ? `<span class="prof__arrow" data-dir="${payDir.dir === '▲' ? 'up' : 'down'}">${payDir.dir}</span>` : ''));
  if (p.years) chips += chip('doc', `${p.biz ? '업력' : '근속'} ${tenureText(p.years.n - 1)}${p.rank && p.rank.label !== '해당 없음' ? ' · ' + esc(p.rank.label) : ''}`);
  $('.prof__chips', root).innerHTML = chips;
  const f = (k, html, show = true) => { const c = $(`[data-f="${k}"]`, root); c.hidden = !show; if (show && html != null) $('dd', c).innerHTML = html; return c; };
  // 숫자 칸: 값은 카운트 애니메이션, 아래 작은 줄은 2026년 환산
  const num = (k, label, v, fmt, extra = '', show = true, tdyFn = null) => {
    const c = f(k, null, show); if (!show) return;
    c.firstChild.textContent = label;
    const dd = $('dd', c);
    if (!$('[data-n]', dd)) dd.innerHTML = `<span data-n></span><span class="prof__arrow" data-a aria-hidden="true"></span>${extra}<small data-t></small>`;
    const sp = $('[data-n]', dd), pv = sp._n;
    if (animate && pv != null && v !== pv && k !== 'years' && k !== 'bizyears') {
      const ar = $('[data-a]', dd); ar.textContent = v > pv ? '▲' : '▼'; ar.dataset.dir = v > pv ? 'up' : 'down';
      c.classList.remove('hl'); void c.offsetWidth; c.classList.add('hl');
      if (k === 'pay' || k === 'profit' || k === 'sales') payDir = { dir: v > pv ? '▲' : '▼', until: Date.now() + 6000 };
    }
    if (sp.dataset.lab !== label) { delete sp._n; sp.dataset.lab = label; }
    if (ms) countTo(sp, v, fmt, ms); else { sp._n = v; sp.textContent = fmt(v); cancelAnimationFrame(sp._raf); }
    $('[data-t]', dd).textContent = tdyFn ? tdyFn(v) : '';
  };
  const biz = p.biz;
  f('home', `${esc(p.home.regionLabel)} · ${p.home.area}<small>${esc(p.home.vibe || '')}<br>이사 ${p.home.moves}회${p.home.recentMove ? ' · 최근 이사' : ''}</small>`);
  const h = L.home || {};
  let dwell = esc(tenure);
  if (p.home.tenure === 'jeonse') dwell += `<small>전세 ${mw(h.deposit || 0)}</small>`;
  else if (p.home.tenure === 'monthly') dwell += `<small>${fmtRent(nominal(h.deposit || 0, Y), nominal(h.rent || 0, Y))}</small>`;
  else if (p.home.tenure === 'own' && h.value) dwell += `<small>시세 ${mw(h.value)}</small>`;
  dwell += `<small>${areaText(AREA_GUESS[p.home.dwelling] ?? 59)}${ESTB}${p.home.dwelling === 'basement' ? ' · 반지하급' : ''}</small>`;
  f('dwell', dwell);
  f('job', `${esc(w.jobLine || (w.school && w.emp.code === 'student' ? w.school : '—'))}<small>${esc([w.major, FIRM[w.firmSize]].filter(Boolean).join(' · '))}</small>`, !biz);
  f('emp', `${esc(w.emp.label)}${w.emp.est ? ESTB : ''}`);
  const payLabel = biz ? '연 순익' : incMode.daily ? '일당' : incMode.monthly ? '월급' : '연봉';
  num('pay', payLabel, p.pay?.annual ?? 0, incCell, biz ? ESTB : '', !!p.pay, tdy);
  num('years', '근속', Math.max(0, (p.years?.n ?? 1) - 1), n => tenureText(n), '', !!p.years && !biz);
  f('rank', p.rank ? `${esc(p.rank.label)}${p.rank.est ? ESTB : ''}<small>${esc(p.rank.sub || '')}</small>` : '—', !!p.rank);
  f('bizkind', biz ? `${esc(biz.kind)}<small>${esc(biz.major)}</small>` : '', !!biz);
  num('bizyears', '업력', biz?.years ?? 0, n => `${Math.round(n)}년`, ESTB, !!biz);
  num('sales', '월 매출(추정)', biz?.monthlySales ?? 0, mw, ESTB, !!biz, tdy);
  num('profit', '월 순익(추정)', biz?.monthlyProfit ?? 0, mw, ESTB, !!biz, tdy);
  f('money', `자산 <b>${mw(p.money.assets)}</b> · 부채 <b>${mw(p.money.debt)}</b><small>주택·보증금 포함 추정 합계${money(p.money.assets, Y).today ? ` · 자산 ${tdy(p.money.assets)}` : ''}</small>`);
  if (open) $('[data-wealth]', root).innerHTML = wealthHtml(p.wealth, Y, mw);
  morphRadar($('.radar--issue', root), L.issues, ms);
  morphRadar($('.radar--trait', root), L.traits, ms);
}
// 자산·금융 카드: 금액은 그해 명목(2026 환산은 한 줄로). 구성비는 추정, 엔진 값(대출·원리금·연금)이 있으면 그 값.
function wealthHtml(w, Y, mw) {
  if (!w) return '';
  const row = (k, v, show = true, strong = false) => show ? `<div class="wealth__row${strong ? ' is-strong' : ''}"><dt>${k}</dt><dd>${v}</dd></div>` : '';
  const amt = v => `<b>${mw(v)}</b>`, tdy = money(w.net, Y).today;
  const g = (t, rows) => `<section class="wealth__grp"><h4>${t}</h4><dl>${rows}</dl></section>`;
  return g('금융자산', row('합계', amt(w.fin.total), true, true) + row('예금·적금', amt(w.fin.deposit)) + row('현금성(입출금·CMA)', amt(w.fin.cash)) + row('금융투자(주식·펀드·연금)', amt(w.fin.invest)))
    + g('비금융자산', row('부동산(자가 시세)', amt(w.nonfin.estate), w.nonfin.estate > 0) + row('전세·월세 보증금', amt(w.nonfin.jeonse), w.nonfin.jeonse > 0) + (w.nonfin.total ? '' : row('부동산·보증금', '없음')))
    + g('부채', row('합계', amt(w.debt.total), true, true) + row('주택담보', amt(w.debt.mortgage), w.debt.mortgage > 0) + row('전세대출', amt(w.debt.jeonse), w.debt.jeonse > 0) + row('학자금', amt(w.debt.student), w.debt.student > 0) + row('신용·기타', amt(w.debt.credit), w.debt.credit > 0))
    + g('순자산', row('자산 − 부채', amt(w.net), true, true) + (tdy ? row('2026년 환산', `<small>${tdy.replace('2026년 환산 ', '')}</small>`) : ''))
    + g('금융 정보', row('월 원리금 상환', w.debt.total ? `<b>${mw(w.monthlyService)}</b>` : '없음') + row('대출 금리(추정)', `연 ${w.rate}%`, w.debt.total > 0) + row('저축률', w.saveRate == null ? '—' : `${w.saveRate}%`) + row('연금 예상', w.pension.monthly ? `월 <b>${mw(w.pension.monthly)}</b>` : (w.pension.accrued ? `적립 ${mw(w.pension.accrued)}` : '아직 없음')))
    + `<p class="wealth__note">예금·현금성·투자 구성과 대출 종류는 나이·소득·직업으로 짐작한 값입니다(엔진 값이 있으면 그 값). 순위나 평가가 아닙니다.</p>`;
}

// ───────── S06 선택 시트 ─────────
function runChoice(req, run, ctxText) {
  return new Promise(resolve => {
    P.choice = true;
    S.clock.choiceStart?.();
    const L = S.L;
    const T0 = S.settings.auto && !req.sensitive ? 1200 : (req.timeoutMs || 12000);
    let left = T0, ringPaused = false, done = false, armed = false, timer;
    const maj = isMajorChoice(req), topic = req.topic ?? topicOfId(req.eventId) ?? 'housing';
    const def = req.options.find(o => o.id === req.defaultId) || req.options[0];
    const josaTail = josa(def.label, '으로').slice(def.label.length);
    const el = openSheet({
      cls: `choice${maj ? ' choice--major' : ''}`, closable: false,
      label: '.choice__prompt', focus: '.choice__prompt',
      html: `${maj ? `<div class="major__scene">${topicSceneHtml(topic, L)}</div>` : ''}<div class="sheet__body">
        ${maj ? `<p class="major__badge">중대한 결정 · ${esc(TOPIC_TITLE[topic] ?? '')}</p>` : ''}<div class="choice__head"><p class="choice__meta">${req.age ?? L.age}세 · <span class="mono">${req.year ?? L.year}</span>년 · 선택</p></div>
        ${ctxText ? `<p class="choice__text">${esc(ctxText)}</p>` : ''}
        <h2 class="choice__prompt">${esc(req.prompt || '어떻게 할까?')}</h2>
        <ol class="options is-arming">${req.options.map((o, i) => `<li style="--i:${i}"><button class="option${o.id === def.id ? ' is-default' : ''}" type="button" data-opt="${esc(o.id)}"><span class="option__ico">${iconSvg(optionIcon(o.label))}</span><span class="option__label">${esc(o.label)}</span><span class="option__side"><span class="option__no">${i + 1}</span>${o.id === def.id ? '<span class="tag">기본</span>' : ''}</span>${o.hint ? `<span class="option__hint">${esc(o.hint)}</span>` : ''}${(() => { const ef = effectsOf(o.effects), rk = riskOf(o); return ef.length || rk ? `<span class="option__eff">${rk ? `<span class="risk risk--${o.risk}">${iconSvg(rk.icon)}<span>${rk.label}</span><span class="risk__bars" aria-hidden="true"><i></i><i></i><i></i></span></span>` : ''}${ef.map(effChip).join('')}</span>` : ''; })()}</button></li>`).join('')}</ol>
        <p class="choice__status" aria-live="polite">시간이 다 되면 '${esc(def.label)}'${josaTail} 정합니다.</p>
        <div class="choice__foot"><button class="ring" type="button" aria-pressed="false" style="--k:1"><svg class="ring__svg" viewBox="0 0 44 44" aria-hidden="true"><circle class="ring__track" cx="22" cy="22" r="19"/><circle class="ring__prog" cx="22" cy="22" r="19"/></svg><span class="ring__num" aria-hidden="true">${Math.ceil(T0 / 1000)}</span></button>${autoSwitch()}</div>
      </div>`,
    });
    if (maj && (S.settings.speed >= 10 || S.settings.auto)) el.classList.add('no-beat');
    const ring = $('.ring', el), num = $('.ring__num', el), opts = $('.options', el);
    const paint = () => {
      ring.style.setProperty('--k', Math.max(0, left / T0).toFixed(3));
      num.textContent = ringPaused ? '멈춤' : Math.max(0, Math.ceil(left / 1000));
    };
    const ringLabel = () => ring.setAttribute('aria-label', `카운트다운 ${ringPaused ? '다시 시작' : '멈추기'}, ${Math.max(0, Math.ceil(left / 1000))}초 남음`);
    ringLabel();
    // 한 번 탭으로 선택: 시트가 뜨기 전에 시작된 탭(이전 [확인]의 잔여 클릭)만 무시한다. 이중 제출은 done 이 막는다.
    const opened = performance.now();
    let lastDown = 0;
    el.addEventListener('pointerdown', () => { lastDown = performance.now(); }, true);
    setTimeout(() => { armed = true; opts.classList.remove('is-arming'); }, 120);
    const onKey = e => {
      const n = +e.key;
      if (armed && n >= 1 && n <= req.options.length) pick(req.options[n - 1].id, false);
    };
    document.addEventListener('keydown', onKey);
    el.addEventListener('click', e => {
      const o = e.target.closest('[data-opt]');
      if (o && (armed || (e.detail > 0 && lastDown > opened)) && !o.disabled) return pick(o.dataset.opt, false);
      if (e.target.closest('.ring')) { ringPaused = !ringPaused; ring.setAttribute('aria-pressed', ringPaused); ringLabel(); paint(); return; }
      if (e.target.closest('[data-act="auto"]')) {
        toggleAuto();
        if (S.settings.auto && !req.sensitive) left = Math.min(left, 1200);
      }
    });
    const tick = () => {
      if (done) return;
      if (run !== S.run) return finish(null);
      syncClock();
      if (capped()) return pick(def.id, true, true);
      if (!ringPaused && !P.hidden && !sheetHeld()) left -= RING_TICK;
      paint();
      if (left <= 0) return pick(def.id, true);
      timer = setTimeout(tick, RING_TICK);
    };
    timer = setTimeout(tick, RING_TICK);

    function pick(id, isAuto, now = false) {
      if (done) return;
      done = true; clearTimeout(timer);
      let r2;
      try { r2 = choose(L, id, isAuto ? { auto: true } : undefined); } catch (err) { console.error(err); r2 = { entries: [] }; }
      const ce = (r2?.entries || []).find(e => e.kind === 'choice');
      const picked = req.options.find(o => o.id === id);
      const parts = ce ? choiceParts(ce, req) : { label: picked?.label, result: '' };
      opts.classList.add('is-done');
      $$('.option', el).forEach(b => {
        const on = b.dataset.opt === id;
        b.classList.toggle('is-picked', on);
        if (on) b.setAttribute('aria-pressed', 'true'); else b.disabled = true;
      });
      ring.remove();
      const st = $('.choice__status', el);
      if (maj) {
        const res = ce?.result ?? r2?.result, why = ce?.why ?? r2?.why, rv = document.createElement('div');
        rv.className = 'reveal'; rv.setAttribute('role', 'status');
        rv.innerHTML = `<div class="reveal__card"><div class="reveal__back">${iconSvg(riskOf(picked)?.icon ?? 'dice')}</div><div class="reveal__front"><span class="reveal__tag reveal__tag--${res || 'none'}">${RESULT_LABEL[res] ?? '선택 완료'}</span><p>${esc(parts.result || parts.label || '')}</p>${why ? `<p class="reveal__why"><b>내 선택이 만든 차이</b> ${esc(why)}</p>` : ''}</div></div>`;
        $('.choice__foot', el).before(rv);
      }
      const p = document.createElement('p');
      p.className = 'choice__result'; p.setAttribute('role', 'status');
      p.innerHTML = `${isAuto ? '<span class="tag">기본 행동</span> ' : ''}${esc(parts.result || parts.label || '')}`;
      if (!maj) st.replaceWith(p); else st.remove();   // 결과 문구는 안내 줄이 있던 자리에(선택지가 밀리지 않게)
      if (now) return finish(r2);
      // 비자동: 결과 카드는 [확인]을 눌러야 닫힌다. 자동결정: 기존처럼 잠시 뒤 진행(자동결정을 중간에 켜도 이어서 센다).
      const ok = document.createElement('button');
      ok.type = 'button'; ok.className = 'btn btn--primary btn--block major__ok choice__ok'; ok.textContent = '확인';
      $('.choice__foot', el).prepend(ok);   // [확인]은 선택지·결과 바로 아래 고정 자리(발 줄)
      let stop = () => {};
      const go = () => { stop(); finish(r2); };
      ok.addEventListener('click', go);
      stop = autoAfter(maj ? 700 : 1500, go);
      ok.focus({ preventScroll: true });
    }
    function finish(r2) {
      document.removeEventListener('keydown', onKey);
      P.choice = false;
      S.clock.choiceEnd?.();
      closeSheet(true, el);
      resolve(r2);
    }
  });
}
