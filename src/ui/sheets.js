// 바텀시트 내용: 지표·성향·관심사(S05)·출처 목록. (도움 번호 UI는 제거됨)
import { explain } from '../engine/index.js';
import { STATS, TRAITS, ISSUES } from '../engine/constants.js';
import { S, $, $$, esc, openSheet } from './dom.js';
import { kindBadge, srcText, statLevel } from './labels.js';
import { radarSvg, morphRadar, ringSvg } from './gauges.js';
import { getConcerns, valuesOf, axesOf, byValue, societyHtml } from './concerns-adapter.js';
import { profileOf } from './profile.js';
import { fmtWon, nominal, money } from './format.js';
import { newsArchiveHtml, bindNewsArchive } from './news.js';

const shown = { issue: null, trait: null };   // 지난번에 본 값에서 지금 값으로 모핑

// 출처: id 문자열이면 SOURCES에서 찾아 메타로 바꾼다
export const toMetas = src => [].concat(src || []).map(s => typeof s === 'string' ? (S.sources[s] || { title: s }) : s).filter(Boolean);
export function srcList(list, { noEst = false } = {}) {
  list = toMetas(list);
  if (!list?.length) return '';
  return `<ul class="src-list">${list.map(s => {
    const b = s.kind && kindBadge(s.kind), bb = b && !(noEst && b.group === 'estimated') ? b : null;
    return `<li class="src">${bb ? `<span class="${bb.cls}">${bb.label}</span>` : ''}${esc(srcText(s))}</li>`;
  }).join('')}</ul>`;
}

export function openSources(title, list) {
  openSheet({
    html: `<div class="sheet__head"><h2 class="sheet__title">${esc(title)}</h2><button class="sheet__close" type="button">닫기</button></div>
      <div class="sheet__body"><p class="sheet__note">실측·전망·게임 추정을 구분해 적습니다.</p>${srcList(list) || '<p class="cap">출처 목록을 불러오지 못했습니다.</p>'}</div>`,
  });
}

// S05 지표·성향·관심사·고민 시트
const meter = (v, lv = '') => `<span class="meter meter--lg${lv ? ' is-' + lv : ''}"><span class="meter__fill" style="--v:${v}"></span></span>`;
function safeExplain(key) { try { return explain(S.L, key); } catch { return null; } }
function lastReason(key) {
  const r = S.L.reasons?.[key]?.at(-1);
  return r ? `${r.text}(${r.year})` : '';
}
function metricDetails(key, label, value, { warn = false } = {}) {
  const ex = safeExplain(key);
  const reason = lastReason(key) || ex?.lines?.[0] || '아직 기록된 사유가 없습니다.';
  return `<details class="metric" data-key="${key}"><summary class="metric__sum"><span class="metric__label">${esc(label)}</span><span class="metric__value">${value}</span>${meter(value, warn ? statLevel(value) : '')}<span class="metric__reason">${esc(reason)}</span></summary>`
    + `<div class="metric__body">${[S.L.reasons?.[key]?.at(-1)?.srcNote, ...(ex?.srcNotes || [])].filter(Boolean).map(t => `<p class="cap src-note">${esc(t)}</p>`).join('')}${ex?.lines?.length ? `<ul class="explain">${ex.lines.map(l => `<li>${esc(l)}</li>`).join('')}</ul>` : ''}${srcList(ex?.src, { noEst: true })}</div></details>`;
}
function wealthLine(L) {
  const m = profileOf(L).money, a = money(m.assets, L.year), d = money(m.debt, L.year);
  return `<p class="cap wealth-line">자산 <b>${a.nominal}</b> · 부채 <b>${d.nominal}</b>${a.today ? `<br>${a.today}` : ''}</p>`;
}
// 나이대별 항목(엔진 concernsOf): 한 줄 이유는 요약에, 설명·근거(출처·실측/추정)는 펼침에.
function concernDetails(i) {
  const b = i.basis?.kind && kindBadge(i.basis.kind), src = i.basis?.src && srcList(i.basis.src, { noEst: true });
  return `<details class="metric" data-key="${esc(i.key)}"><summary class="metric__sum"><span class="metric__label">${esc(i.label)}</span><span class="metric__value">${i.value}</span>${meter(i.value)}<span class="metric__reason">${esc(i.reason || '')}</span></summary>`
    + `<div class="metric__body">${i.desc ? `<p class="cap">${esc(i.desc)}</p>` : ''}${i.basis?.note ? `<p class="cap src-note">${esc(i.basis.note)}</p>` : ''}${src || ''}</div></details>`;
}
// 6지표 게이지(정보 표시: 누를 수 없다). 메인에서 '지표' 탭·PC 우측 패널로 옮겼다.
export const gaugesHtml = L => `<ul class="gauges" aria-label="6지표">${STATS.map(s => { const v = L.stats[s.key], lv = statLevel(v); return `<li class="gauge${lv ? ' is-' + lv : ''}">${ringSvg(s.key, v)}<span class="gauge__label">${s.label}</span><span class="gauge__value">${v}</span></li>`; }).join('')}</ul>`;
const TABS = [['stats', '지표·성향'], ['traits', '성향'], ['issues', '관심사·고민'], ['peers', '동갑내기']];
const traitsHtml = L => `<p class="sheet__note">성향은 좋고 나쁨이 없습니다. 점선이 50.</p><div class="radar-box">${radarSvg('trait', shown.trait ?? {}, { aria: '성향 5축' })}</div>`
    + TRAITS.map(t => `<div class="metric"><div class="metric__sum"><span class="metric__label">${t.label}</span><span class="metric__value">${L.traits[t.key]}</span>${meter(L.traits[t.key])}</div></div>`).join('')
    + `<p class="trait-note">성향은 가구 배경·질병·장애로 정해지지 않습니다. 사건과 선택이 조금씩 움직입니다.</p>`;
function panel(tab) {
  const L = S.L;
  if (tab === 'traits') return traitsHtml(L);
  if (tab === 'issues') {
    const c = getConcerns(L);
    return `<p class="sheet__note">${esc(c.stageLabel || '')} 내가 요즘 마주한 관심사와 고민(0~100). 순위나 정치 성향이 아닙니다. 강한 순.</p><div class="radar-box">${radarSvg('issue', {}, { size: 280, aria: '관심사·고민 지도', axes: axesOf(c) })}</div>`
      + byValue(c).map(concernDetails).join('') + societyHtml(S.newsLog, L) + `<section class="past-news"><h3 class="past-news__h">과거 신문</h3>${newsArchiveHtml(S.newsLog || [])}</section>`;
  }
  return `<p class="sheet__note">0~100. 누르면 계산 이유와 출처가 나옵니다. 금액은 그해 가격(2026년 환산 약 병기).</p>` + gaugesHtml(L)
    + STATS.map(s => metricDetails(s.key, s.label, L.stats[s.key], { warn: true }) + (s.key === 'wealth' ? wealthLine(L) : '')).join('') + `<h3 class="past-news__h">성향</h3>` + traitsHtml(L);
}
// 탭은 진행 화면 하단 바가 유일한 탭 줄(지표·성향·관심사·고민·동갑내기). 시트는 안쪽 탭 없이 내용만 보여 준다.
export function openStats(tab = 'stats', focusKey = null, onClose) {
  const el = openSheet({
    onClose,
    html: `<div class="sheet__head"><h2 class="sheet__title">${S.L.age}세의 ${(TABS.find(([id]) => id === tab) || TABS[0])[1]}</h2><button class="sheet__close" type="button">닫기</button></div>
      <div class="sheet__body" role="region" id="panel-stats" aria-labelledby="lt-${tab}"></div>`,
  });
  const body = $('.sheet__body', el);
  body.innerHTML = panel(tab);
  if (tab === 'stats') morphRadar($('.radar--trait', body), S.L.traits, 700);
  const kind = tab === 'traits' ? 'trait' : tab === 'issues' ? 'issue' : null;
  if (kind) { const cur = kind === 'trait' ? S.L.traits : valuesOf(getConcerns(S.L)); morphRadar($('.radar', body), cur, 700); shown[kind] = { ...cur }; }
  bindNewsArchive(body, () => S.newsLog || [], n => S.openPaper?.(n));
  if (focusKey) {
    const d = $(`details[data-key="${focusKey}"]`, body);
    if (d) { d.open = true; d.scrollIntoView({ block: 'nearest' }); }
  }
  return el;
}
