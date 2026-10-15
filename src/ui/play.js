// S04 진행 화면: HUD·피드·하단 바, 연 진행 루프(UI-SPEC §7.1), 선택 시트(S06), 비교 카드(S07),
// 탭 숨김 멈춤(§7.7), 시간 상한(§7.8, 현재 없음), 사망 전환(§7.9).
import { newLife, advanceYear, choose, runToEnd, compareCard, expectedRemainingYears, summarize, createClock } from '../engine/index.js';
import { COMPARE_AGES, STATS, STAGES, SPEEDS, ISSUES } from '../engine/constants.js';
import { S, $, $$, esc, show, go, announce, toast, sleep, reduced, setSetting, sheetOpen, sheetHeld, openSheet, closeSheet } from './dom.js';
import { saveCurrent, clearCurrent, addRecord } from './store.js';
import { fxChips, sexLabel, regionShort, nativeAge, stageState, statLevel, josa, kindBadge } from './labels.js';
import { openStats, gaugesHtml } from './sheets.js';
import { profileOf, familyLines, familyText } from './profile.js';
import { fmtWon, fmtIncome, fmtRent, nominal, money, tenureText, areaText, AREA_GUESS, deltaText } from './format.js';
import { ringSvg, setRing, countTo, radarSvg, morphRadar, iconSvg, optionIcon } from './gauges.js';
import { sceneHtml, mountScene, silhouetteSvg, topicSceneHtml, TOPIC_TITLE } from './scene.js';
import { topicOf, topicOfId, isMajorEntry, isBigEntry, isMajorChoice, diffProfile, effectsOf, CHAPTERS, chapterOf, isShockEntry, riskOf, RESULT_LABEL, eventImpact } from './major.js';
import { fastYear } from './motion.js';
import { mbtiOf, mbtiText, traitChips } from './persona.js';
import { getConcerns, valuesOf, axesOf, byValue, societyHtml } from './concerns-adapter.js';
import { reactHtml, reactText } from './reaction-ui.js';
import { pickNews, loadArchive, archiveNow, openPaper, newsArchiveHtml, bindNewsArchive, newsOfEntry, newsRowHtml } from './news.js';

const TICK = 100;            // 연 대기 틱
const RING_TICK = 250;       // 카운트다운·비교 카드 틱(UI-SPEC §7.2)
const MAX_YEARS_DOM = 40;
const P = { user: false, hidden: false, choice: false, news: false, mini: false, resumeTimer: 0 };
const yearEls = new Map();
let prevStats = null, prevStage = null, scene = null, prevProf = null, prevIssues = null, lastDiff = [], lastDeltas = {}, lastIssueD = {};

// 시계: 직접 멈춤·탭 숨김이면 멈춘다. 자동결정이 꺼져 있으면 팝업(시트·뉴스·작은 카드)이 떠 있는 동안에도 멈춘다
// (선택 시트 자체는 카운트다운이 있어 예외, 그 위에 정보 시트를 열면 멈춘다). 자동결정에서는 흐른다.
// 시계를 멈추는 것은 응답이 필요한 모달·사용자가 연 시트뿐. 작은 사건 카드·말풍선·피드 줄은 멈추지 않는다(P.mini/P.news 는 표시용).
const popupHalt = () => !S.settings.auto && sheetOpen() && (!P.choice || sheetHeld());
const halted = () => P.user || P.hidden || popupHalt();
// 배경(장면·게이지·피드 애니메이션)은 시계와 같은 기준으로 멈춘다: 자동결정이 아니고 시트·모달이 열려 있을 때.
const hasPopup = () => !S.settings.auto && sheetOpen();
function syncClock() {
  document.body.classList.toggle('has-popup', hasPopup());
  scene?.pause(P.user || P.hidden || document.hidden || hasPopup());
  paintBadge();
  if (!S.clock) return;
  if (halted()) S.clock.pause(); else S.clock.resume();
}
// 상태 배지(버튼과 분리): 일시정지됨 / 화면 이탈 / 창 읽는 중 멈춤. 자동결정이 켜져 있으면 창이 떠 있어도 진행되므로 표시하지 않는다.
function paintBadge() {
  const b = $('.life [data-hud="paused"]');
  if (!b) return;
  const t = P.user ? '일시정지됨' : P.hidden ? '화면을 떠나 멈춤' : popupHalt() ? '창을 보는 동안 멈춤' : '';
  b.hidden = !t; b.textContent = t;
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
  shift = Math.max(0, cur.elapsed || 0);       // 활성 경과 시간을 이어 붙인다(상한이 있으면 유지)
  enterLife(true);
  return true;
}

function enterLife(resumed) {
  const run = ++S.run;
  Object.assign(P, { user: false, hidden: false, choice: false, news: false, mini: false });
  yearEls.clear();
  prevStats = null; prevStage = null; scene = null; prevProf = null; prevIssues = null; lastDiff = []; lastDeltas = {}; lastIssueD = {}; payDir = null; curChap = null; chapSeen.clear();
  personaKey = ''; topPrev = null; newsSeen.clear(); newsLog.length = 0; feedNews.length = 0; loadArchive();
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
const pauseInner = p => `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true">${p ? '<path d="M7 5l12 7-12 7z" fill="currentColor"/>' : '<path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" fill="currentColor"/>'}</svg><span>${p ? '재개' : '일시정지'}</span>`;
const autoSwitch = () => `<button class="switch" type="button" role="switch" aria-checked="${S.settings.auto}" aria-label="자동결정" data-act="auto"><span aria-hidden="true">자동</span><span class="switch__track" aria-hidden="true"></span></button>`;
function lifeHtml(L) {
  return `<section class="screen screen--paper life" data-screen="life">
  <h1 class="sr-only">생애 진행</h1>
  <div class="life__side">
  <header class="hud">
    <div class="hud__row">
      <p class="hud__age"><span data-hud="age">${L.age}</span><span class="hud__unit">세</span></p>
      <div class="hud__id"><p class="hud__name">${esc(L.name)} <span class="tag">${sexLabel(L.sex)}</span></p>
        <p class="hud__meta"><span class="mono" data-hud="year">${L.year}</span>년 <span class="mono hud__month" data-hud="month">1</span>월 · <span data-hud="region"></span> 거주</p></div>
      <span class="tag tag--ink" data-hud="paused" role="status" hidden>일시정지됨</span>
    </div>
    <div class="persona" data-persona></div>
    <ul class="sbar" aria-label="6지표">${STATS.map(s => `<li class="sbar__i" data-stat="${s.key}" title="${s.label}" aria-label="${s.label} ${L.stats[s.key]}">${ringSvg(s.key, L.stats[s.key])}<span class="sbar__v">${L.stats[s.key]}</span><span class="sbar__d" aria-hidden="true"></span></li>`).join('')}</ul>
    <div class="banner" role="status" hidden><span></span><button class="btn btn--sm btn--ink" type="button" data-act="resume">이어 가기</button></div>
  </header>
  ${sceneHtml(L)}
  <ol class="chap" aria-label="인생 챕터">${CHAPTERS.map(c => `<li class="chap__seg" data-chap="${c.n}"><span class="chap__dot"></span><span class="chap__n">${c.n}</span></li>`).join('')}</ol><p class="chap__label" aria-hidden="true"></p>
  ${cardsHtml(L)}
  </div>
  <div class="life__feed"><ol class="feed" aria-label="생애 기록"></ol></div>
  <aside class="life__aux" aria-label="보조 패널"><details class="aux" open><summary>과거 신문</summary><div class="aux__news"></div></details><details class="aux" open><summary>지표</summary><div class="aux__stats"></div></details><details class="aux" open><summary>관심사·고민</summary><div class="aux__issues"></div></details><div class="aux"><button class="btn btn--block" type="button" data-aux-tab="peers">같은 날 태어난 사람들</button></div></aside>
  <nav class="lifebar" aria-label="진행 조작">
    <div class="lifebar__row">
      <button class="btn lifebar__pause" type="button" aria-pressed="false" aria-label="일시정지" data-act="pause">${pauseInner(false)}</button>
      <div class="seg seg--num" role="group" aria-label="배속">${SPEEDS.map(n => `<button class="seg__btn" type="button" data-speed="${n}" aria-pressed="${S.settings.speed === n}" aria-label="${n}배속">${n}×</button>`).join('')}</div>
      ${autoSwitch()}
    </div>
    <div class="lifebar__tabs lifebar__tabs--4">${[['stats', '지표·성향'], ['issues', '관심사·고민'], ['peers', '동갑내기'], ['news', '신문']].map(([t, l]) => `<button class="tabbtn" type="button" id="lt-${t}" aria-haspopup="dialog" aria-pressed="false" data-tab="${t}">${l}</button>`).join('')}</div>
  </nav>
</section>`;
}

// 피드 줄에는 지표·관심사 증감 칩을 붙이지 않는다(변화는 상단 6지표 ▲▼ 팝업, 결과 카드의 '실제 변화'로만).
const chips = () => '';
const _chipsUnused = (fx, lead) => {
  const c = fxChips(fx);
  if (!c.length) return '';
  return `<p class="entry__fx">${lead ? `<span class="fx">${lead}</span>` : ''}${c.map(x => `<span class="fx">${esc(x)}</span>`).join('')}</p>`;
};
function srcLine(src) {
  const id = Array.isArray(src) ? src[0] : src;
  const m = id && S.sources[id];
  return m ? `<span class="entry__src">자료 · ${esc([m.org, m.title, m.year].filter(Boolean).join(' '))}${kindBadge(m.kind).group === 'estimated' ? '' : ' · ' + kindBadge(m.kind).label}</span>` : '';
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
    cls.push('entry--news');
    const nw = newsOfEntry(e, e.year, S.L);
    body = newsRowHtml(nw, feedNews.push(nw) - 1) + reactHtml(e, S.L);
  } else if (e.kind === 'choice') {
    cls.push('entry--choice');
    const { label, result } = choiceParts(e, req);
    body = `<span class="tag entry__kind">선택</span><span class="entry__label">${esc(label)}</span>${e.auto ? ' <span class="tag">기본 행동</span>' : ''}${result ? `<p class="entry__result">${esc(result)}</p>` : ''}${reactHtml(e, S.L)}${chips(e.effects)}`;
  } else if (e.kind === 'compare') {
    cls.push('entry--quiet');
    body = `<span class="tag entry__kind">비교</span>같은 날 태어난 세 사람의 ${nativeAge(e.age)}.`;
  } else if (e.kind === 'death') {
    cls.push('entry--death');
    body = `<p class="entry__text">${esc(e.text)}</p>`;
  } else {
    const who = e.spouse ? `${/remarry/.test(e.id) ? '새 배우자 ' : /wedding|marry/.test(e.id) ? '배우자 ' : ''}${e.spouse.name ?? ''}(${e.spouse.since ?? e.year}년${e.spouse.end ? `~${e.year}년 ${e.spouse.end === 'widowed' ? '사별' : '이혼'}` : '~'})` : e.grandparent ? e.grandparent.label : '';
    body = `<span class="entry__ico">${iconSvg(optionIcon(e.text))}</span>` + esc(e.text) + (who ? ` <span class="entry__fam">${esc(who)}</span>` : '') + reactHtml(e, S.L) + chips(e.effects) + srcLine(e.src);
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
  const nw = $('.aux__news', root), is = $('.aux__issues', root), gs = $('.aux__stats', root);
  if (gs) gs.innerHTML = gaugesHtml(L);
  if (nw) { nw.innerHTML = newsArchiveHtml(newsLog, { max: 4 }) + (newsLog.length > 4 ? `<button class="btn btn--block" type="button" data-aux-tab="news">전체 보기 (${newsLog.length})</button>` : ''); if (!nw._b) { nw._b = 1; bindNewsArchive(nw, () => newsLog, openNews); } }
  if (is) { const c = getConcerns(L); is.innerHTML = (c.stageLabel ? `<p class="aux__stage cap">${esc(c.stageLabel)}의 관심사·고민</p>` : '') + byValue(c).map(i => `<div class="aux__row" title="${esc(i.reason || i.desc || '')}"><span>${esc(i.label)}</span><span class="mono">${i.value}</span><span class="meter"><span class="meter__fill" style="--v:${i.value}"></span></span></div>`).join('') + societyHtml(newsLog, L); }
}
// '나' 줄: MBTI 풍 4글자(경계는 흐리게) · 성향 칩 2개 · 가장 큰 고민. 눌러서 각 시트를 연다. 값이 같으면 다시 그리지 않는다(애니메이션 없음).
let personaKey = '', topPrev = null;
function updatePersona(L) {
  const el = $('.life [data-persona]'); if (!el) return;
  const c = getConcerns(L), top = byValue(c)[0], ch = traitChips(L.traits, 2), mb = mbtiOf(L.traits), txt = mbtiText(L.traits);
  const d = topPrev && topPrev.key === top?.key ? top.value - topPrev.value : 0;
  const key = txt + ch.map(x => x.label).join() + (top ? top.key + top.value : '') + d;
  if (key === personaKey) return;
  personaKey = key; if (top) topPrev = { key: top.key, value: top.value };
  el.innerHTML = `<button class="persona__mbti" type="button" data-tab="stats" title="게임용 성향 유형(MBTI 풍) — 실제 검사 아님" aria-label="나의 유형 ${txt}, 게임용 성향 유형이며 실제 검사가 아닙니다">${mb.map(x => `<span${x.vague ? ' class="is-vague"' : ''}>${x.ch}</span>`).join('')}</button>`
    + ch.map(x => `<button class="persona__chip" type="button" data-tab="stats" aria-label="성향 ${esc(x.label)}">${esc(x.label)}</button>`).join('')
    + (top ? `<button class="persona__chip persona__chip--top" type="button" data-tab="issues" aria-label="가장 큰 고민 ${esc(top.label)} ${top.value}">고민 ${esc(top.label)} <b>${top.value}</b>${d ? `<span class="prof__arrow" data-dir="${d > 0 ? 'up' : 'down'}">${d > 0 ? '▲' : '▼'}</span>` : ''}</button>` : '');
}
function updateHud(animate = true) {
  const L = S.L, root = $('.life');
  if (!root) return;
  refreshAux(); updatePersona(L);
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
  for (const s of STATS) { // 하단 바 위 6지표 스트립: 값·물결 링·변화 ▲▼ 팝업
    const li = $(`[data-stat="${s.key}"]`), v = L.stats[s.key], d = prevStats ? v - prevStats[s.key] : 0, lv = statLevel(v);
    if (!li) continue;
    $('.sbar__v', li).textContent = v; setRing(li, v);
    li.classList.toggle('is-low', lv === 'low'); li.classList.toggle('is-critical', lv === 'critical');
    if (d) {
      big = Math.max(big, Math.abs(d));
      const de = $('.sbar__d', li); de.textContent = deltaText(d); li.dataset.dir = d > 0 ? 'up' : 'down';
      li.classList.remove('is-changed'); void li.offsetWidth; li.classList.add('is-changed');
      clearTimeout(li._t); li._t = setTimeout(() => li.classList.remove('is-changed'), 1700);
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
  paintBadge();
  const b = $('[data-act="pause"]', root);
  b.setAttribute('aria-pressed', paused); b.setAttribute('aria-label', paused ? '재개' : '일시정지'); b.innerHTML = pauseInner(paused);
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
  // 하단 바 높이(안전 영역 제외)를 --bar-h 로 실측해 시트·피드 여백이 항상 맞게 한다
  const bar = $('.lifebar', root), probe = document.createElement('div');
  probe.style.cssText = 'position:absolute;visibility:hidden;padding-bottom:var(--safe-b)'; document.body.append(probe);
  if (bar && globalThis.ResizeObserver) new ResizeObserver(() => document.documentElement.style.setProperty('--bar-h', Math.max(0, Math.ceil(bar.offsetHeight - probe.offsetHeight)) + 'px')).observe(bar);
  setTimeout(() => probe.remove(), 3000);
  const onVis = () => {
    if (run !== S.run) return;
    if (document.hidden) { P.hidden = true; clearTimeout(P.resumeTimer); syncClock(); persist(); updatePauseUI(); }
    else if (P.hidden) bannerPause('다른 화면에 있는 동안 멈췄습니다.');
  };
  document.addEventListener('visibilitychange', onVis);
  // PC 단축키: Space 일시정지/재개, 1~5 배속, ←→ 탭 이동. (Esc 는 시트가 처리, 선택 시트가 열려 있으면 1~3 은 선택지)
  const TABIDS = ['stats', 'issues', 'peers', 'news'];
  const onKey = e => {
    if (run !== S.run || e.ctrlKey || e.metaKey || e.altKey || document.body.dataset.screen !== 'life') return;
    if (e.target.closest?.('input, textarea, select, [role="switch"], summary, a') || (e.key === ' ' && e.target.closest?.('button'))) return;
    if (e.key === ' ') { e.preventDefault(); $('[data-act="pause"]', root).click(); }
    else if (!P.choice && SPEEDS[+e.key - 1] && /^[1-9]$/.test(e.key)) $(`[data-speed="${SPEEDS[+e.key - 1]}"]`, root)?.click();
    else if (!P.choice && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) { const i = TABIDS.indexOf(tabId); openTab(TABIDS[(i < 0 ? (e.key === 'ArrowRight' ? 0 : 3) : i + (e.key === 'ArrowRight' ? 1 : 3)) % 4]); }
  };
  document.addEventListener('keydown', onKey);
  unbind = () => { document.removeEventListener('visibilitychange', onVis); document.removeEventListener('keydown', onKey); };
  root.addEventListener('click', e => {
    const ct = e.target.closest('[data-card-toggle]');
    if (ct) { toggleCard(ct.dataset.cardToggle); return; }
    const nr = e.target.closest('.newsrow');
    if (nr) { openNews(feedNews[+nr.dataset.fn]); return; }
    const ys = e.target.closest('.feed__year.is-sum');
    if (ys && !e.target.closest('button')) { ys.classList.toggle('is-open'); return; }
    const t = e.target.closest('button');
    if (!t) return;
    const act = t.dataset.act;
    if (act === 'pause') {
      if (P.user || P.hidden) { P.user = false; resumeHidden(); toast('재개'); } else { P.user = true; updatePauseUI(); syncClock(); toast('일시정지'); }
    } else if (act === 'resume') { P.user = false; resumeHidden(); }
    else if (act === 'auto') toggleAuto();
    else if (t.dataset.speed) {
      setSetting('speed', +t.dataset.speed);
      root.dataset.fast = fastYear(+t.dataset.speed) ? '1' : '';
      $$('[data-speed]', root).forEach(b => b.setAttribute('aria-pressed', b === t));
      toast(`${t.dataset.speed}배속`, 1200);
    } else if (t.dataset.tab || t.dataset.auxTab) openTab(t.dataset.tab || t.dataset.auxTab);
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
  const total = S.clock.yearDelay(S.L, 1);
  let left = total, stall = 0;
  setMonth(0);     // 1배속 기준 ms, 배속은 틱마다 반영
  return new Promise(res => {
    const step = () => {
      if (run !== S.run) return;
      syncClock();
      if (capped()) return res();
      // 워치독: 모달·사용자 일시정지가 없는데 시계가 30초(실시간) 넘게 멈춰 있으면 자동 재개
      if (halted() && !P.user && !P.hidden && !document.querySelector('.sheet')) { if ((stall += TICK) > 30000) { console.warn('진행 정지 워치독: 열린 창 없이 멈춰 있어 재개합니다.'); P.mini = P.news = false; $('.mini')?.remove(); stall = 0; syncClock(); } } else stall = 0;
      if (!halted()) left -= TICK * S.settings.speed;
      setMonth(1 - Math.max(0, left) / total);
      if (left <= 0) return res();
      setTimeout(step, TICK);
    };
    setTimeout(step, TICK);
  });
}

// 달력 흐름: 한 해(1배속 15초) 동안 1월→12월. 시계가 멈추면 같이 멈춘다. 월 정보가 엔진에 없으므로 흐름만 보여 준다.
function setMonth(frac) {
  const el = $('.life [data-hud="month"]');
  if (!el) return;
  const m = String(Math.min(12, Math.max(1, Math.floor(frac * 12) + 1)));
  if (el.textContent !== m) { el.textContent = m; el.classList.remove('tick'); void el.offsetWidth; el.classList.add('tick'); }
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

async function handle(r, run, req = null, shown = null) {
  if (!r) return;
  if (r.chapter) curChap = r.chapter;
  renderEntries(r.entries, req);
  updateHud();
  const sh = (r.entries || []).find(isShockEntry);
  let blocked = !!shown;    // 선택 시트가 결과·바뀐 것을 이미 한 화면에 보여 줬다: 이어지는 카드는 확인 없는 작은 카드로(확인은 한 번의 선택에 최대 1번)
  if (sh && S.L.alive && !capped() && run === S.run) { newsSeen.add(S.L.year); await showShock(sh, run); blocked = true; } else maybeNews(r.entries);
  await showMajor(r, run, req, { shown, soft: blocked });
  if (r.choice && run === S.run) {
    const ctxText = [...(r.entries || [])].reverse().find(e => e.id === r.choice.eventId && e.kind !== 'choice')?.text;
    if (isMajorChoice(r.choice) && run === S.run) await chapterTitle(chapterOf(S.L, r.choice));
    const r2 = await runChoice(r.choice, run, ctxText);
    if (r2) await handle(r2, run, r.choice, r2.shown ?? null);
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
  S.clock?.pause(); document.body.classList.remove('has-popup');
  closeCompare?.();
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
    const t = setTimeout(done, 2500);     // 챕터 카드는 정보 연출: 탭하면 바로, 아니면 2.5초 뒤 넘어간다(자동결정과 무관)
    stop = () => clearTimeout(t);
  });
}

// ───────── 시대 충격(속보) 연출 ─────────
function showShock(e, run) {
  const L = S.L, fast = S.settings.auto;
  const m = String(e.text).match(/^(.+?[.?!])\s+(.+)$/), head = m ? m[1] : e.text, rest = m ? m[2] : '';
  const sn = { year: e.year ?? L.year, headline: head, summary: rest, impact: '', axes: Object.keys(e.effects?.issues || {}), from: 'era', react: reactText(e, L) };
  newsLog.push(sn); refreshAux();   // 속보는 연출 뒤 '올해의 뉴스'(피드)·과거 신문에 남는다
  return new Promise(res => {
    const el = openSheet({
      cls: `shock is-resolved${fast ? ' is-simple' : ''}`, closable: false, label: '.shock__title', focus: '.shock__ok',
      onClose: () => { syncClock(); res(); },
      html: `<div class="shock__stage" aria-hidden="true">
          <p class="shock__band"><span class="shock__tag">속보</span><span class="shock__year mono">${e.year ?? L.year}</span></p>
          <div class="shock__collage"><p>${esc(head)}</p><p>${esc(rest || head)}</p><p>${esc(head)}</p></div>
          <svg class="shock__chart" viewBox="0 0 200 60" preserveAspectRatio="none"><polyline points="0,8 30,10 55,6 80,16 105,24 130,22 150,42 175,52 200,56"/></svg></div>
        <div class="sheet__body shock__body"><p class="major__badge">속보 · 시대의 충격</p>
          <h2 class="shock__title major__title">${esc(head)}</h2>${rest ? `<p class="major__text">${esc(rest)}</p>` : ''}${sn.react ? `<p class="react">${esc(sn.react)}</p>` : ''}
          ${impactHtml(e, { year: true })}</div>
        <div class="sheet__foot"><button class="btn btn--primary btn--block major__ok shock__ok" type="button">확인</button></div>`,
    });
    let stop = () => {};
    const done = () => { stop(); closeSheet(true, el); };
    $('.shock__ok', el).addEventListener('click', done);
    stop = autoAfter(3000, done);       // 자동결정에서만 자동 진행(최소 3초, 배속과 무관)
    syncClock();
  });
}

// ───────── 중대한 사건: 큰 카드 + 영향 + [확인] ─────────
const effChip = e => `<span class="eff eff--${e.tone}"><span class="eff__k">${esc(e.label)}</span><span class="eff__a" aria-hidden="true">${e.arrows}</span><span class="sr-only">${esc(e.text)}</span></span>`;
const deltaChip = (kind, key, d) => { const [e] = effectsOf({ [kind === 'stat' ? 'stats' : 'issues']: { [key]: d } }); return e ? `<span class="eff eff--${e.tone}"><span class="eff__k">${esc(e.label)}</span><span class="eff__a" aria-hidden="true">${d > 0 ? '▲' : '▼'}${Math.abs(d)}</span><span class="sr-only">${esc(e.text)}</span></span>` : ''; };
const chipsHtml = (kind, list) => list.map(([k, d]) => deltaChip(kind, k, d)).join('');
const rowHtml = (h, inner) => `<div class="impact__row"><p class="impact__h">${h}</p>${inner}</div>`;
// 확정 결과(사건 단위 데이터만). 연간 합산은 yearHtml 로 따로, 이 일의 결과처럼 보이지 않게 둔다.
function impactHtml(e, { year = false } = {}) {
  const im = eventImpact(e), rows = [];
  if (im.stats.length) rows.push(rowHtml('지표', `<p class="impact__chips">${chipsHtml('stat', im.stats)}</p>`));
  if (im.issues.length) rows.push(rowHtml('관심사·고민', `<p class="impact__chips">${chipsHtml('issue', im.issues)}</p>`));
  if (im.profile.length) rows.push(rowHtml('내 상태', `<ul class="impact__diff">${im.profile.map(t => `<li>${esc(t)}</li>`).join('')}</ul>`));
  const t = e.decision ? '실제 변화' : '이 일로 바뀐 것';
  if (rows.length) return `<section class="impact" aria-label="${t}"><h3 class="impact__title">${t}${e.decision ? ' <span class="impact__sub">(결과로 확정된 변화)</span>' : ''}</h3>${rows.join('')}</section>`;
  return year ? yearHtml(e) : '';
}
// 같은 해의 변화: 그해 지표·관심사·상태 합산. 이 사건만의 결과가 아니므로 접어 두고 보조 스타일로 보여 준다.
function yearHtml(e) {
  if (SOFT_RE_TOPIC.has(topicOf(e))) return '';
  const rows = [];
  const st = Object.entries(lastDeltas).filter(([, d]) => d), is = Object.entries(lastIssueD).filter(([, d]) => Math.abs(d) >= 2);
  if (st.length) rows.push(rowHtml('지표', `<p class="impact__chips">${chipsHtml('stat', st)}</p>`));
  if (is.length) rows.push(rowHtml('관심사·고민', `<p class="impact__chips">${chipsHtml('issue', is)}</p>`));
  if (lastDiff.length) rows.push(rowHtml('내 상태', `<ul class="impact__diff">${lastDiff.map(x => `<li><span class="impact__k">${esc(x.label)}</span> <span class="impact__from">${esc(x.from)}</span> <span aria-hidden="true">→</span><span class="sr-only">에서</span> <b>${esc(x.to)}</b></li>`).join('')}</ul>`));
  return rows.length ? `<details class="impact impact--year"><summary>같은 해의 변화 <span class="impact__sub">(연간 합산 · 이 일만의 결과 아님)</span></summary>${rows.join('')}</details>` : '';
}
const SOFT_RE_TOPIC = new Set(['loss', 'care', 'bereave']);
// 선택 전 안내(예상)는 접어 둔다: 확정 결과와 방향이 다를 수 있다.
// 결과 태그: 엔진이 주는 상태명(resultLabel)을 우선. result(성공/보류/아쉬움)는 지표 보정 판정이라 실행 여부로 읽히지 않게 보조로만.
const EXEC_LABEL = { executed: '실행됨', deferred: '미룸', failed: '실행 안 됨' };
const resultTag = (e, res = e?.result, lab = e?.resultLabel, ex = e?.execution) => (lab || res)
  ? `<span class="reveal__tag reveal__tag--${res || 'none'}">${esc(lab ?? RESULT_LABEL[res] ?? '')}</span>${ex && EXEC_LABEL[ex] && !lab ? ` <span class="tag">${EXEC_LABEL[ex]}</span>` : ''}` : '';
const factsHtml = e => Array.isArray(e?.facts) && e.facts.length ? `<ul class="impact__facts">${e.facts.map(t => `<li>${esc(t)}</li>`).join('')}</ul>` : '';
const whyHtml = why => why ? `<details class="reveal__why"><summary>선택 전 예상 (실제 결과와 다를 수 있음)</summary><p>${esc(why)}</p></details>` : '';
function showMajor(r, run, req, { shown = null, soft = false } = {}) {
  const L = S.L;
  if (!L.alive || capped() || run !== S.run) return;
  const pend = r.choice?.eventId;
  const e = (r.entries || []).find(x => isMajorEntry(x) && x.id !== pend && x !== shown);
  if (!e) return;
  const topic = topicOf(e) ?? 'housing';
  const text = e.kind === 'choice' ? (choiceParts(e, req).result || choiceParts(e, req).label) : e.text;
  if (soft || !isBigEntry(e, text)) return miniCard(e, text, topic);
  const m = String(text).match(/^(.+?[.?!])\s+(.+)$/), head = m ? m[1] : text, rest = m ? m[2] : '';
  return new Promise(res => {
    const el = openSheet({
      cls: 'major is-resolved', closable: false, label: '.major__title', focus: '.major__ok',
      onClose: () => { syncClock(); res(); },
      html: `<div class="major__scene">${topicSceneHtml(topic, L)}</div>
        <div class="sheet__body major__body"><p class="major__badge">${esc(TOPIC_TITLE[topic] ?? '큰 일')}</p>
        <h2 class="major__title">${esc(head)}</h2>${rest ? `<p class="major__text">${esc(rest)}</p>` : ''}${reactHtml(e, L)}
        ${resultTag(e)}${factsHtml(e)}
        ${impactHtml(e, { year: true })}${whyHtml(e.why)}</div>
        <div class="sheet__foot"><button class="btn btn--primary btn--block major__ok" type="button">확인</button></div>`,
    });
    let stop = () => {};
    const done = () => { stop(); closeSheet(true, el); };
    $('.major__ok', el).addEventListener('click', done);
    stop = autoAfter(3000, done);       // 자동결정에서만 3초 뒤 진행(배속과 무관), 아니면 [확인]
    syncClock();
  });
}

// 작은 카드(비차단): 가족 사별·진단·일반 상실 등. 하단 바를 가리지 않고, 영향 칩만 얇게 보여 준다.
function miniCard(e, text, topic) {
  $('.mini')?.remove();
  const m = String(text).match(/^(.+?[.?!])\s+(.+)$/), head = m ? m[1] : text;
  const el = document.createElement('aside');
  el.className = 'mini'; el.setAttribute('role', 'status');
  el.innerHTML = `<p class="mini__t"><span class="mini__badge">${esc(TOPIC_TITLE[topic] ?? '소식')}</span> ${esc(head)}</p>${reactHtml(e, S.L)}${impactHtml(e)}<button class="mini__ok major__ok" type="button">확인</button>`;
  $('#layer').append(el);
  let stop = () => {};
  const close = () => { stop(); el.remove(); P.mini = false; syncClock(); };
  $('.mini__ok', el).addEventListener('click', close);
  const t = setTimeout(close, 3500);       // 비차단: 자동결정과 무관하게 잠시 뒤 닫힌다(소식은 피드에 남아 있다). 시계는 멈추지 않는다.
  stop = () => clearTimeout(t);
  P.mini = true;
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
// 올해의 뉴스: 엔진 news 줄은 피드에 이미 나온다. 없는 해는 연표 자료에서 1건을 피드에 줄로 넣는다(토스트·자동 팝업 없음).
const feedNews = [];
function maybeNews(entries) {
  const n = pickNews(S.L, entries, archiveNow(), newsSeen);
  if (!n) return;
  newsLog.push(n);
  if (n.from === 'archive' && $('.feed')) {
    const ul = yearList(S.L.age, S.L.year, false);
    ul.insertAdjacentHTML('beforeend', `<li class="entry entry--news">${newsRowHtml(n, feedNews.push(n) - 1)}</li>`);
    ul.closest('.feed__year').classList.remove('is-sum');
  }
  refreshAux();
}
const openNews = n => { openPaper(n, syncClock); syncClock(); };
function openNewsBox() {
  const el = openSheet({
    onClose: syncClock,
    html: `<div class="sheet__head"><h2 class="sheet__title">과거 신문</h2><button class="sheet__close" type="button">닫기</button></div>
      <div class="sheet__body">${newsArchiveHtml(newsLog)}</div>`,
  });
  bindNewsArchive(el, () => newsLog, openNews);
  syncClock();
}

// ───────── 메인 상시 카드: 거주 / 직업 / 자산 (접기 없음) ─────────
const FIRM = { micro: '영세 사업장', small: '소규모 사업장', mid: '중간 규모', large: '대규모' };
const ESTB = '';   // '추정' 딱지는 화면에서 제거(값·레이아웃 유지)
const cell = (f, label, wide = '') => `<div class="prof__cell${wide}" data-f="${f}"><dt>${label}</dt><dd></dd></div>`;
// 일자리 선택: 당대 급여(그해 명목 + 2026 환산)와 사회 인식
const jobInfoHtml = list => !list?.length ? '' : `<ul class="jobinfo" aria-label="일자리 정보">${list.map(c => {
  const m = c.wage != null ? money(c.wage, c.year, w => fmtWon(w)) : null;
  return `<li class="jobinfo__c"><p class="jobinfo__h"><b>${esc(c.label)}</b> ${esc(c.title)} <span class="jobinfo__k">${esc(c.kind)}</span></p>${m ? `<p class="jobinfo__pay">연 ${esc(m.nominal)}${m.today ? ` <small>(${esc(m.today)})</small>` : ''}</p>` : ''}${c.perception.map(t => `<p class="jobinfo__p">“${esc(t)}”</p>`).join('')}</li>`;
}).join('')}</ul>`;
// 선택지 비용(그해 명목 + 2026 환산): 현금 증감·새 대출·월 부담
const costHtml = (c, year) => {
  const row = (k, man, sign) => { const m = money(Math.abs(man), year, w => fmtWon(w)); return `<span class="cost__r"><span class="cost__k">${k}</span> <b class="${sign < 0 ? 'is-out' : 'is-in'}">${sign < 0 ? '−' : '+'}${esc(m.nominal)}</b>${m.today ? ` <small>(${esc(m.today)})</small>` : ''}</span>`; };
  const rows = [];
  if (c.invest) { const m = money(c.invest, year, w => fmtWon(w)); rows.push(`<span class="cost__r"><span class="cost__k">운용</span> <b>${esc(m.nominal)}</b>${m.today ? ` <small>(${esc(m.today)})</small>` : ''}</span>`); }
  if (c.cash) rows.push(row('현금', c.cash, c.cash));
  if (c.loan) rows.push(row('새 대출', c.loan, -1));
  if (c.monthly) rows.push(row('매달', c.monthly, -c.monthly));
  return rows.length || c.note ? `<span class="option__cost">${rows.join('')}${c.note ? `<span class="cost__n">${esc(c.note)}</span>` : ''}</span>` : '';
};
const CHEV = '<svg class="pcard__chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
const cardOpen = k => { try { return JSON.parse(sessionStorage.getItem('hj.cards') || '{}')[k] === 1; } catch { return false; } };
const cardSave = (k, v) => { try { const o = JSON.parse(sessionStorage.getItem('hj.cards') || '{}'); o[k] = v ? 1 : 0; sessionStorage.setItem('hj.cards', JSON.stringify(o)); } catch {} };
const card = (k, title, inner) => { const o = cardOpen(k); return `<article class="pcard pcard--${k}${o ? ' is-open' : ''}" data-card="${k}"><button class="pcard__sum" type="button" aria-expanded="${o}" aria-controls="pc-${k}" data-card-toggle="${k}"><span class="pcard__t">${title}</span><span class="pcard__line" data-sum="${k}"></span>${CHEV}</button><div class="pcard__body" id="pc-${k}"${o ? '' : ' hidden'}>${inner}</div></article>`; };
function toggleCard(k) {
  const c = $(`.pcard[data-card="${k}"]`); if (!c) return;
  const open = !c.classList.contains('is-open');
  c.classList.toggle('is-open', open); $('.pcard__sum', c).setAttribute('aria-expanded', open); $('.pcard__body', c).hidden = !open; cardSave(k, open);
}
function cardsHtml() {
  return `<section class="pcards" aria-label="내 현재 상태">
  ${card('home', '거주', `<dl class="pcard__grid">${cell('home', '지역')}${cell('dwell', '주거')}</dl><ul class="pcard__family" data-family aria-label="가족"></ul>`)}
  ${card('job', '직업', `<dl class="pcard__grid">${cell('job', '직업')}${cell('emp', '고용 형태')}${cell('pay', '연봉')}${cell('years', '연차')}${cell('rank', '직급')}${cell('bizkind', '업종')}${cell('bizyears', '업력')}${cell('sales', '월 매출')}${cell('profit', '월 순익')}</dl>`)}
  ${card('asset', '자산', `<dl class="pcard__grid">${cell('net', '순자산')}</dl><div class="pcard__wealth" data-wealth></div>`)}
  </section>
  <p class="prof__note">금액은 그해 가격 기준이고, 작은 글씨는 2026년 환산(약)입니다. 순위나 평가가 아닙니다.</p>`;
}
let payDir = null, curChap = null;
const sumArrow = {};
function updateProfile(L, animate = true) {
  const root = $('.pcards');
  if (!root) return;
  const p = profileOf(L), w = p.work, Y = L.year, j = L.job, h0 = L.home || {};
  const jobS = w.jobLine || (w.school && w.emp.code === 'student' ? w.school : w.emp.label);
  const ms = animate ? 700 : 0;
  const mw = v => fmtWon(nominal(v, Y));                                        // 그해 명목 금액
  const incMode = { daily: j.major === '9' && !j.regular, monthly: !j.regular && j.major !== '9' };
  const inc = v => fmtIncome(nominal(v, Y), incMode);
  const incCell = v => inc(v).replace(/^\S+ (약 )?/, '$1');
  const tdy = v => money(v, Y).today ?? '';
  const tenure = p.home.tenure === 'monthly' && Y < 1985 ? '사글세' : p.home.tenureLabel;
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
  if (p.home.market) dwell += `<small>${esc(p.home.market.text)}${p.home.market.today ? ` (${esc(p.home.market.today)})` : ''}</small>`;
  f('dwell', dwell);
  f('job', `${esc(w.jobLine || (w.school && w.emp.code === 'student' ? w.school : '—'))}<small>${esc([w.major, FIRM[w.firmSize]].filter(Boolean).join(' · '))}</small>`, !biz);
  f('emp', `${esc(w.emp.label)}${w.emp.est ? ESTB : ''}`);
  const payLabel = biz ? '연 순익' : incMode.daily ? '일당' : incMode.monthly ? '월급' : '연봉';
  num('pay', payLabel, p.pay?.annual ?? 0, incCell, biz ? ESTB : '', !!p.pay, tdy);
  num('years', '근속', Math.max(0, (p.years?.n ?? 1) - 1), n => tenureText(n), '', !!p.years && !biz);
  f('rank', p.rank ? `${esc(p.rank.label)}${p.rank.est ? ESTB : ''}<small>${esc(p.rank.sub || '')}</small>` : '—', !!p.rank);
  f('bizkind', biz ? `${esc(biz.kind)}<small>${esc(biz.major)}</small>` : '', !!biz);
  num('bizyears', '업력', biz?.years ?? 0, n => `${Math.round(n)}년`, ESTB, !!biz);
  num('sales', '월 매출', biz?.monthlySales ?? 0, mw, ESTB, !!biz, tdy);
  num('profit', '월 순익', biz?.monthlyProfit ?? 0, mw, ESTB, !!biz, tdy);
  { const fl = $('[data-family]', root); if (fl) { const ls = familyLines(L); fl.innerHTML = ls.map(x => `<li>${esc(familyText(x))}</li>`).join(''); fl.hidden = !ls.length; } }
  { // 접힌 카드의 한 줄 요약(핵심 숫자는 줄이지 않고 보조 문구만 말줄임) + 큰 변화 강조(자동 펼침 없음)
    const net = p.wealth?.net ?? (p.money.assets - p.money.debt), debt = p.money.debt || 0, pay = p.biz ? p.biz.monthlyProfit : p.pay?.annual ?? 0;
    const ten = p.home.tenure === 'jeonse' ? `전세 ${mw(h0.deposit || 0)}` : p.home.tenure === 'monthly' ? `월세 ${mw(h0.rent || 0)}` : tenure;
    const prev = root._prev || {}, arrow = (k, v, thr) => { const o = prev[k]; if (o != null && o !== v) { if (Math.abs(v - o) >= thr) { const c = $(`.pcard[data-card="${prev.cardOf?.[k] ?? k}"]`); } sumArrow[k] = { dir: v > o ? 'up' : 'down', until: Date.now() + 6000 }; } return sumArrow[k] && Date.now() < sumArrow[k].until ? `<span class="prof__arrow" data-dir="${sumArrow[k].dir}">${sumArrow[k].dir === 'up' ? '▲' : '▼'}</span>` : ''; };
    const set = (k, main, key, extra = '') => { const el = $(`[data-sum="${k}"]`, root); if (el) el.innerHTML = `<span class="pcard__main">${esc(main)}</span>${key ? `<b class="pcard__key">${key}</b>` : ''}${extra}`; };
    set('home', `${p.home.regionLabel} · ${p.home.tenureLabel}`, p.home.tenure === 'jeonse' || p.home.tenure === 'monthly' ? ten.replace(/^\S+ /, '') : '');
    set('job', `${jobS} · ${w.emp.label}`, p.pay || p.biz ? (p.biz ? `월 순익 ${mw(p.biz.monthlyProfit)}` : inc(p.pay.annual).replace(/^\S+ /, '')) : '', arrow('pay', pay, 1));
    set('asset', '순자산', mw(net), arrow('net', net, 1) + (debt > 0 ? `<small class="pcard__debt">부채 ${mw(debt)}</small>` : ''));
    const flash = (k, c) => { const el = $(`.pcard[data-card="${c}"]`, root); if (el) { el.classList.remove('hl'); void el.offsetWidth; el.classList.add('hl'); } };
    if (prev.home != null && prev.home !== p.home.regionLabel + p.home.tenure) flash('home', 'home');
    if (prev.job != null && prev.job !== jobS) flash('job', 'job');
    if (prev.net != null && Math.abs(net - prev.net) >= Math.max(500, Math.abs(prev.net) * 0.2)) flash('net', 'asset');
    root._prev = { home: p.home.regionLabel + p.home.tenure, job: jobS, net, pay };
  }
  num('net', '순자산', p.wealth?.net ?? (p.money.assets - p.money.debt), mw, ESTB, true, tdy);
  $('[data-wealth]', root).innerHTML = assetRows(p.wealth, Y, mw);
  { // 나이대가 바뀌면 축이 달라진다: 축 목록이 다르면 그래프를 새로 그린다
    const c = getConcerns(L), sv = $('.radar--issue', root), keys = c.items.map(i => i.key).join(',');
    if (sv && sv.dataset.keys !== keys) { sv.outerHTML = radarSvg('issue', valuesOf(c), { size: 210, aria: '관심사·고민 지도', axes: axesOf(c) }); }
    morphRadar($('.radar--issue', root), valuesOf(c), ms);
  }
  morphRadar($('.radar--trait', root), L.traits, ms);
}
// 자산 카드 본문: 금융·부동산·부채·월 원리금·저축률(추정 표시). 엔진 값이 있으면 그 값.
function assetRows(w, Y, mw) {
  if (!w) return '';
  const r = (k, v, show = true) => show ? `<div class="arow"><dt>${k}</dt><dd>${v}</dd></div>` : '';
  const b = v => `<b>${mw(v)}</b>`;
  return `<dl class="arows">`
    + r('금융자산', b(w.fin.total), w.fin.total > 0) + r('현금성', mw(w.fin.cash), w.fin.cash > 0) + r('예금·적금', mw(w.fin.deposit), w.fin.deposit > 0) + r('투자·연금', mw(w.fin.invest), w.fin.invest > 0)
    + r('부동산(자가)', b(w.nonfin.estate), w.nonfin.estate > 0) + r('보증금', b(w.nonfin.jeonse), w.nonfin.jeonse > 0)
    + r('부채', b(w.debt.total), w.debt.total > 0) + r('주택담보', mw(w.debt.mortgage), w.debt.mortgage > 0) + r('전세대출', mw(w.debt.jeonse), w.debt.jeonse > 0) + r('학자금', mw(w.debt.student), w.debt.student > 0) + r('신용·기타', mw(w.debt.credit), w.debt.credit > 0)
    + r('월 원리금', w.debt.total ? b(w.monthlyService) : '없음') + r('저축률', w.saveRate == null ? '—' : `${w.saveRate}%`) + r('연금 예상', w.pension.monthly ? `월 ${mw(w.pension.monthly)}` : (w.pension.accrued ? `적립 ${mw(w.pension.accrued)}` : '아직 없음'))
    + `</dl><p class="cap">구성은 나이·소득·직업을 바탕으로 한 값입니다(엔진 값이 있으면 그 값).</p>`;
}

// ───────── S06 선택 시트 ─────────
function runChoice(req, run, ctxText) {
  return new Promise(resolve => {
    P.choice = true;
    S.clock.choiceStart?.();
    const L = S.L;
    const T0 = S.settings.auto && !req.sensitive ? 1200 : (req.timeoutMs || 12000);
    let left = T0, ringPaused = false, done = false, armed = false, timer, fin = false, ce0 = null;
    const maj = isMajorChoice(req), topic = req.topic ?? topicOfId(req.eventId) ?? 'housing';
    const def = req.options.find(o => o.id === req.defaultId) || req.options[0];
    const josaTail = josa(def.label, '으로').slice(def.label.length);
    const el = openSheet({
      cls: `choice${maj ? ' choice--major' : ''}`, closable: false,
      label: '.choice__prompt', focus: '.choice__prompt',
      html: `${maj ? `<div class="major__scene">${topicSceneHtml(topic, L)}</div>` : ''}
      <div class="choice__top">${maj ? `<p class="major__badge">중대한 결정 · ${esc(TOPIC_TITLE[topic] ?? '')}</p>` : ''}<p class="choice__meta">${req.age ?? L.age}세 · <span class="mono">${req.year ?? L.year}</span>년 · 선택</p></div>
      <div class="sheet__body">
        ${ctxText ? `<p class="choice__text">${esc(ctxText)}</p>` : ''}
        <h2 class="choice__prompt">${esc(req.prompt || '어떻게 할까?')}</h2>
        ${jobInfoHtml(req.jobInfo)}
        <ol class="options is-arming">${req.options.map((o, i) => `<li style="--i:${i}"><button class="option${o.id === def.id ? ' is-default' : ''}" type="button" data-opt="${esc(o.id)}"><span class="option__ico">${iconSvg(optionIcon(o.label))}</span><span class="option__label">${esc(o.label)}</span><span class="option__side"><span class="option__no">${i + 1}</span>${o.id === def.id ? '<span class="tag">기본</span>' : ''}</span>${o.hint ? `<span class="option__hint">${esc(o.hint)}</span>` : ''}${o.cost ? costHtml(o.cost, req.year ?? L.year) : ''}${(() => { const ef = effectsOf(o.effects), rk = riskOf(o); return ef.length || rk ? `<span class="option__eff">${rk ? `<span class="risk risk--${o.risk}">${iconSvg(rk.icon)}<span>${rk.label}</span><span class="risk__bars" aria-hidden="true"><i></i><i></i><i></i></span></span>` : ''}${ef.length ? '<span class="option__lead">예상</span>' : ''}${ef.map(effChip).join('')}</span>` : ''; })()}</button></li>`).join('')}</ol>
        <p class="choice__status" aria-live="polite">시간이 다 되면 '${esc(def.label)}'${josaTail} 정합니다.</p>
        ${S.choiceHinted ? '' : '<p class="choice__hint cap">선택 시간은 12초이며, 배속과 상관없습니다. 시간이 다 되면 ‘기본’ 표시 행동이 선택됩니다. 자동결정을 켜면 1.2초 뒤 기본 행동으로 진행합니다. 자동결정이 꺼져 있으면 창을 여는 동안 진행이 멈춥니다.</p>'}
      </div>
      <div class="sheet__foot choice__foot"><button class="ring" type="button" aria-pressed="false" style="--k:1"><svg class="ring__svg" viewBox="0 0 44 44" aria-hidden="true"><circle class="ring__track" cx="22" cy="22" r="19"/><circle class="ring__prog" cx="22" cy="22" r="19"/></svg><span class="ring__num" aria-hidden="true">${Math.ceil(T0 / 1000)}</span></button>${autoSwitch()}</div>`,
    });
    S.choiceHinted = true;   // 첫 선택에서만 시간 제한·기본 행동 안내
    syncClock();
    if (maj && ( S.settings.auto)) el.classList.add('no-beat');
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
      const ce = (r2?.entries || []).find(e => e.kind === 'choice'); ce0 = ce || null;
      const picked = req.options.find(o => o.id === id);
      const parts = ce ? choiceParts(ce, req) : { label: picked?.label, result: '' };
      opts.classList.add('is-done');
      $$('.option', el).forEach(b => {
        const on = b.dataset.opt === id;
        b.classList.toggle('is-picked', on);
        if (on) b.setAttribute('aria-pressed', 'true'); else b.disabled = true;
        b.closest('li').hidden = !on;          // 결과 상태: 고른 선택지만 남긴다
      });
      // 결과 상태의 '고른 행동'은 정보 표시: 버튼 모양·포커스 없이 평문 라벨+값 행으로 바꾼다
      const pk = document.createElement('dl'); pk.className = 'picked';
      pk.innerHTML = `<dt>고른 행동</dt><dd>${esc(picked?.label ?? parts.label ?? '')}</dd>`;
      opts.replaceWith(pk);
      ring.remove();
      $('.choice__status', el).remove();
      // 결과 상태: 같은 시트 안에서 결과를 본문 맨 위로(선택지는 접힘). [확인]은 푸터(시트 맨 아래)에 있어 본문을 가리지 않는다.
      el.classList.add('is-resolved');
      const body = $('.sheet__body', el), foot = $('.choice__foot', el), rv = document.createElement('div');
      if (maj) {
        const res = ce?.result ?? r2?.result, why = ce?.why ?? r2?.why;
        rv.className = 'reveal'; rv.setAttribute('role', 'status');
        rv.innerHTML = `<div class="reveal__card"><div class="reveal__back">${iconSvg(riskOf(picked)?.icon ?? 'dice')}</div><div class="reveal__front">${resultTag(ce ?? r2, res, (ce ?? r2)?.resultLabel, (ce ?? r2)?.execution) || '<span class="reveal__tag reveal__tag--none">선택 완료</span>'}<p class="reveal__text">${esc(parts.result || parts.label || '')}</p>${reactHtml(ce ?? r2, S.L)}${factsHtml(ce ?? r2)}</div></div>${ce ? impactHtml(ce) : ''}${whyHtml(why)}`;
      } else {
        rv.className = 'choice__result'; rv.setAttribute('role', 'status');
        rv.innerHTML = `<span class="choice__rlabel">결과</span>${isAuto ? ' <span class="tag">기본 행동</span> ' : ''}<p class="choice__rtext">${esc(parts.result || parts.label || '')}</p>`;
      }
      body.prepend(rv); body.scrollTop = 0;
      if (now) return finish(r2);
      // 비자동: 결과 카드는 [확인]을 눌러야 닫힌다. 자동결정: 기존처럼 잠시 뒤 진행(자동결정을 중간에 켜도 이어서 센다).
      let stop = () => {};
      const go = () => { stop(); finish(r2); };
      if (!maj) {
        // 일반·우연 선택: 확인 없이 결과를 잠시 보여 준 뒤 자동으로 닫는다(탭하면 즉시). 결과 문장은 피드에 남는다.
        const t = setTimeout(go, 2500);
        stop = () => clearTimeout(t);
        el.addEventListener('click', go);
        return;
      }
      // 중대 결정: 결과·실제 변화를 한 화면에 두고 [확인] 1회. 자동결정이면 잠시 뒤 진행.
      const ok = document.createElement('button');
      ok.type = 'button'; ok.className = 'btn btn--primary btn--block major__ok choice__ok'; ok.textContent = '확인';
      foot.prepend(ok);   // [확인]은 시트 맨 아래 푸터(고정)
      ok.addEventListener('click', go);
      stop = autoAfter(3500, go);      // 자동결정에서도 카드 뒤집기(~1.4초) + 결과 읽기 시간 확보: 탭하면 즉시
      ok.focus({ preventScroll: true });
    }
    function finish(r2) {
      if (fin) return; fin = true; setTimeout(syncClock, 0);      // 연타·타이머와 탭이 겹쳐도 한 번만 진행
      if (r2 && ce0) r2.shown = ce0;
      document.removeEventListener('keydown', onKey);
      P.choice = false;
      S.clock.choiceEnd?.();
      closeSheet(true, el);
      resolve(r2);
    }
  });
}
