// 시대 뉴스: 신문 지면·토스트 스택·과거 신문. 순수 부분(mediumOf·pickNews·groupByYear)은 Node 테스트 대상.
// 데이터: era 사건(kind 'news') 우선, 없으면 src/content/news-archive.js 의 NEWS_ARCHIVE 에서 그 해 1건. 아카이브가 없어도 동작한다.
import { ISSUES } from '../engine/constants.js';
import { NEWS_ARCHIVE } from '../content/news-archive.js';
import { fxChips, ISSUE_SHORT } from './labels.js';
import { esc, $, openSheet } from './dom.js';
import { reactText } from './reaction-ui.js';

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

// 엔진 news 로그 → 신문 지면 데이터(피드 줄·팝업 공용)
export function newsOfEntry(e, year, L) {
  const [headline, summary] = splitNews(e.text);
  const chips = fxChips(e.effects);
  return { year: e.year ?? year, headline, summary, impact: chips.length ? chips.join(' · ') : '', axes: Object.keys(e.effects?.issues || {}), src: e.src, from: 'era', effects: e.effects, scenario: !!e.scenario, react: L ? reactText(e, L) : '', link: e.link || '', linkFx: e.linkFx || null };
}
// 피드의 '올해의 뉴스' 줄: 신문 아이콘 + 헤드라인 한 줄 + 개인 영향 칩(사건 단위 effects 만). 누르면 신문 지면 팝업.
const NEWS_ICO = '<svg class="newsrow__ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="1.5"/><path d="M7 8h6M7 12h10M7 16h10"/></svg>';
export function newsRowHtml(n, i) {
  return `<button class="newsrow" type="button" data-fn="${i}" aria-label="뉴스 열기: ${esc(n.headline)}"><span class="newsrow__tag">${n.scenario ? '가상 뉴스' : '뉴스'}</span><span class="newsrow__t">${esc(n.headline)}</span></button>${n.link ? `<p class="newsrow__link">→ ${esc(n.link)}</p>` : ''}`;
}

// entries: advanceYear 가 돌려준 로그, archive: NEWS_ARCHIVE|null, seen: Set(이미 보인 해). 1년 최대 1건.
export function pickNews(L, entries = [], archive = null, seen = new Set()) {
  if (seen.has(L.year)) return null;
  const e = entries.find(x => x.kind === 'news' && !x.sensitive);
  let n = null;
  if (e) {
    n = newsOfEntry(e, L.year, L);
  } else {
    const a = (archive || []).find(x => x.year === L.year);
    if (a) n = { year: a.year, headline: a.headline, summary: a.summary || '', impact: a.impact || '', axes: a.axes || [], medium: a.medium, src: a.src, from: 'archive', scenario: !!(a.scenario || a.future), react: reactText({ kind: 'news', id: a.id, year: a.year, text: `${a.headline} ${a.summary ?? ''}`, axes: a.axes }, L) };
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
    ${n.link ? `<p class="paper__link"><b>나에게 닿은 일</b> ${esc(n.link)}</p>` : ''}
    ${n.react ? `<p class="react">${esc(n.react)}</p>` : ''}
    ${n.impact ? `<p class="paper__impact"><b>삶에 준 영향</b> ${esc(n.impact)}</p>` : ''}
    ${tags ? `<p class="paper__tags">${tags}</p>` : ''}
    <p class="paper__note">게임 내 가상 신문입니다. 당시 뉴스를 참고해 다시 쓴 글이며 실제 기사가 아닙니다.${n.scenario || n.future ? ' 2027년 이후는 가상 시나리오입니다.' : ''}</p></article>`;
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
export function newsArchiveHtml(log, { max = Infinity } = {}) {
  const g = groupByYear(log).map(y => ({ ...y, items: y.items.filter(n => n.i >= log.length - max) })).filter(y => y.items.length);
  if (!g.length) return '<p class="empty">아직 받은 뉴스가 없습니다.</p>';
  return `<div class="narch">${g.map(y => `<section class="narch__year"><h4 class="narch__yh"><span class="mono">${y.year}</span>년 <span class="narch__mast">${esc(y.mast)}</span></h4><ul>${y.items.map(n => `<li><button class="narch__item" type="button" data-ni="${n.i}"><span class="narch__t">${esc(n.headline)}</span></button></li>`).join('')}</ul></section>`).join('')}</div>`;
}
export function bindNewsArchive(root, getLog, open) {
  root.addEventListener('click', e => {
    const b = e.target.closest('.narch__item');
    const n = b && getLog()[+b.dataset.ni];
    if (n) open(n);
  });
}

// 신문 지면: 하단 시트(위 핸들·닫기·배경 탭·드래그로 닫기 — openSheet 공통)
export function openPaper(n, onClose) {
  return openSheet({
    cls: 'paper-sheet', onClose,
    html: `<div class="sheet__head"><h2 class="sheet__title">신문</h2><button class="sheet__close" type="button">닫기</button></div><div class="sheet__body">${newsInner(n)}</div>`,
  });
}
