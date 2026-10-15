// 시대 뉴스: 신문 지면·토스트 스택·과거 신문. 순수 부분(mediumOf·pickNews·groupByYear)은 Node 테스트 대상.
// 데이터: era 사건(kind 'news') 우선, 없으면 src/content/news-archive.js 의 NEWS_ARCHIVE 에서 그 해 1건. 아카이브가 없어도 동작한다.
import { ISSUES } from '../engine/constants.js';
import { NEWS_ARCHIVE } from '../content/news-archive.js';
import { fxChips, ISSUE_SHORT } from './labels.js';
import { esc, $, openSheet } from './dom.js';

// 시대별 매체명(가상). 지면 디자인은 1종으로 통일, 시대감은 마스트헤드 이름·판 표기만 다르다.
export const MEDIA = {
  paper: { id: 'paper', name: '동방일보', sub: '종이 신문', kind: '지면' },
  tv: { id: 'tv', name: '새날 뉴스 9', sub: '방송 뉴스', kind: '방송' },
  portal: { id: 'portal', name: '누리 포털 뉴스', sub: '포털 뉴스', kind: '포털' },
  push: { id: 'push', name: '새날뉴스', sub: '푸시 알림', kind: '알림' },
  short: { id: 'short', name: '요약 카드', sub: 'AI 3줄 요약', kind: '숏폼' },
  holo: { id: 'holo', name: '허공 뉴스', sub: '홀로그램 피드', kind: '홀로' },
};
export const mediumOf = (year, hint) => MEDIA[hint] ?? (year < 1990 ? MEDIA.paper : year < 2000 ? MEDIA.tv : year < 2010 ? MEDIA.portal : year < 2020 ? MEDIA.push : year < 2030 ? MEDIA.short : MEDIA.holo);

const issueLabel = k => ISSUE_SHORT[k] ?? ISSUES.find(i => i.key === k)?.label ?? k;
const splitNews = t => { const m = String(t).match(/^(.+?[.?!])\s+(.+)$/); return m ? [m[1], m[2]] : [String(t), '']; };

// entries: advanceYear 가 돌려준 로그, archive: NEWS_ARCHIVE|null, seen: Set(이미 보인 해). 1년 최대 1건.
export function pickNews(L, entries = [], archive = null, seen = new Set()) {
  if (seen.has(L.year)) return null;
  const e = entries.find(x => x.kind === 'news' && !x.sensitive);
  let n = null;
  if (e) {
    const [headline, summary] = splitNews(e.text);
    const chips = fxChips(e.effects);
    n = { year: e.year ?? L.year, headline, summary, impact: chips.length ? chips.join(' · ') : '', axes: Object.keys(e.effects?.issues || {}), src: e.src, from: 'era' };
  } else {
    const a = (archive || []).find(x => x.year === L.year);
    if (a) n = { year: a.year, headline: a.headline, summary: a.summary || '', impact: a.impact || '', axes: a.axes || [], medium: a.medium, src: a.src, from: 'archive' };
  }
  if (n) seen.add(L.year);
  return n;
}

let archiveCache = NEWS_ARCHIVE;   // 정적 import — Artifact 번들에 포함
export async function loadArchive() { return archiveCache; }
export const archiveNow = () => archiveCache ?? null;

export function newsInner(n) {
  const md = mediumOf(n.year, n.medium);
  const tags = n.axes.map(k => `<span class="paper__tag">${esc(issueLabel(k))}</span>`).join('');
  return `<article class="paper"><p class="paper__mast"><span class="paper__name">${esc(md.name)}</span><span class="paper__date"><span class="mono">${n.year}</span>년 ${esc(md.kind)}판</span></p>
    <h3 class="paper__head">${esc(n.headline)}</h3>
    ${n.summary ? `<p class="paper__body">${esc(n.summary)}</p>` : ''}
    ${n.impact ? `<p class="paper__impact"><b>삶에 준 영향</b> ${esc(n.impact)}</p>` : ''}
    ${tags ? `<p class="paper__tags">${tags}</p>` : ''}</article>`;
}

// 연도별 묶음(최신이 위). 순수 함수: Node 테스트 대상.
export function groupByYear(log = []) {
  const m = new Map();
  log.forEach((n, i) => { (m.get(n.year) || m.set(n.year, []).get(n.year)).push({ ...n, i }); });
  return [...m.keys()].sort((a, b) => b - a).map(year => ({ year, mast: mediumOf(year).name, items: m.get(year).reverse() }));
}
// 토스트에 보일 목록: 가장 최근 max개, 오래된 것부터(맨 아래가 최신)
export const visibleNews = (unread, max = 3) => unread.slice(-max);

// 과거 신문 목록(시트 '관심사·고민'·신문 모음·데스크톱 우측 패널 공용). bindNewsArchive 로 펼침을 연결한다.
export function newsArchiveHtml(log) {
  const g = groupByYear(log);
  if (!g.length) return '<p class="empty">아직 받은 뉴스가 없습니다.</p>';
  return `<div class="narch">${g.map(y => `<section class="narch__year"><h4 class="narch__yh"><span class="mono">${y.year}</span>년 <span class="narch__mast">${esc(y.mast)}</span></h4><ul>${y.items.map(n => `<li><button class="narch__item" type="button" aria-expanded="false" data-ni="${n.i}"><span class="narch__t">${esc(n.headline)}</span></button><div class="narch__paper" hidden>${newsInner(n)}</div></li>`).join('')}</ul></section>`).join('')}</div>`;
}
export function bindNewsArchive(root) {
  root.addEventListener('click', e => {
    const b = e.target.closest('.narch__item');
    if (!b) return;
    const on = b.getAttribute('aria-expanded') !== 'true';
    b.setAttribute('aria-expanded', on);
    b.nextElementSibling.hidden = !on;
  });
}

// 신문 지면: 하단 시트(위 핸들·닫기·배경 탭·드래그로 닫기 — openSheet 공통)
export function openPaper(n, onClose) {
  return openSheet({
    cls: 'paper-sheet', onClose,
    html: `<div class="sheet__head"><h2 class="sheet__title">신문</h2><button class="sheet__close" type="button">닫기</button></div><div class="sheet__body">${newsInner(n)}</div>`,
  });
}

// 뉴스 토스트: 하단 바 위에 한 줄씩 쌓인다(최대 3개, 자동 소멸 없음). FOLD_MS 뒤 '뉴스 N' 배지로 접히고 누르면 펼친다.
// 시계는 멈추지 않는다. 시트·모달이 열리면 CSS 로 가려진다(body.is-locked).
const FOLD_MS = 9000;
let box = null, unread = [], foldT = 0, folded = false, openCb = () => {};
const tIcon = '<svg class="ntoast__ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="1.5"/><path d="M7 8h6M7 12h10M7 16h10"/></svg>';
const X = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
function paintToasts(fresh) {
  if (!box) return;
  const vis = folded ? [] : visibleNews(unread);
  box.innerHTML = (vis.length ? `<div class="ntoasts__bar"><button class="ntoasts__clear" type="button" data-nclear="1">모두 지우기</button><button class="ntoasts__x" type="button" data-nfold="1" aria-label="뉴스 닫기">${X}</button></div>` : '')
    + vis.map(n => `<div class="ntoast-row"><button class="ntoast${n === fresh ? ' is-new' : ''}" type="button" data-nt="${unread.indexOf(n)}" aria-label="새 뉴스 열기: ${esc(n.headline)}">${tIcon}<span class="ntoast__src">${esc(mediumOf(n.year, n.medium).name)} ${n.year}</span><span class="ntoast__t">${esc(n.headline)}</span></button><button class="ntoast__x" type="button" data-nx="${unread.indexOf(n)}" aria-label="이 뉴스 치우기">${X}</button></div>`).join('')
    + (folded && unread.length ? `<div class="ntoasts__badgerow"><button class="ntoasts__badge" type="button" data-nbadge="1">${tIcon}뉴스 ${unread.length}</button><button class="ntoast__x" type="button" data-nclear="1" aria-label="뉴스 모두 지우기">${X}</button></div>` : '');
  box.hidden = !box.innerHTML;
}
const armFold = () => { clearTimeout(foldT); foldT = setTimeout(() => { folded = true; paintToasts(); }, FOLD_MS); };
const dismiss = i => { unread.splice(i, 1); paintToasts(); };
let escBound = false;
export function pushNewsToast(n, onOpen) {
  openCb = onOpen;
  if (!escBound) {   // PC: Esc 로 펼친 스택 접기(시트가 열려 있으면 시트 우선)
    escBound = true;
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && box && !folded && unread.length && !document.querySelector('.sheet')) { folded = true; clearTimeout(foldT); paintToasts(); } });
  }
  if (!box || !box.isConnected) {
    box = document.createElement('div');
    box.className = 'ntoasts'; box.setAttribute('role', 'log'); box.setAttribute('aria-label', '새 뉴스');
    let sx = null, dx = 0, row = null, moved = false;   // 옆으로 밀어 치우기
    box.addEventListener('pointerdown', e => { const t = e.target.closest('.ntoast'); if (!t) return; row = t.parentElement; sx = e.clientX; dx = 0; moved = false; });
    box.addEventListener('pointermove', e => { if (sx == null) return; dx = e.clientX - sx; if (Math.abs(dx) > 8) { moved = true; row.style.transition = 'none'; row.style.transform = `translateX(${dx}px)`; row.style.opacity = String(1 - Math.min(1, Math.abs(dx) / 220)); } });
    const end = () => { if (sx == null) return; const r = row, d = dx; sx = null; if (!moved) return; if (Math.abs(d) > 80) dismiss(+r.querySelector('[data-nx]').dataset.nx); else { r.style.transition = 'transform .15s, opacity .15s'; r.style.transform = ''; r.style.opacity = ''; } };
    box.addEventListener('pointerup', end); box.addEventListener('pointercancel', end);
    box.addEventListener('click', e => {
      if (moved) { moved = false; return; }
      const g = k => e.target.closest(`[${k}]`);
      if (g('data-nclear')) { unread = []; clearTimeout(foldT); paintToasts(); return; }
      if (g('data-nfold')) { folded = true; clearTimeout(foldT); paintToasts(); return; }
      if (g('data-nbadge')) { folded = false; paintToasts(); armFold(); return; }
      const x = g('data-nx'); if (x) return dismiss(+x.dataset.nx);
      const t = g('data-nt');
      if (!t) return;
      const [item] = unread.splice(+t.dataset.nt, 1);
      paintToasts();
      if (item) openCb(item);
    });
    $('#layer').append(box);
  }
  unread.push(n); folded = false;
  paintToasts(n); armFold();
}
export function closeNewsToasts() { clearTimeout(foldT); unread = []; folded = false; box?.remove(); box = null; }
