// 바텀시트 내용: 지표·성향·관심사(S05)·출처 목록. (도움 번호 UI는 제거됨)
import { explain } from '../engine/index.js';
import { STATS, ISSUES } from '../engine/constants.js';
import { S, $, $$, esc, openSheet } from './dom.js';
import { kindBadge, srcText, statLevel } from './labels.js';
import { radarSvg, morphRadar, ringSvg } from './gauges.js';
import { getConcerns, valuesOf, axesOf, byValue, societyHtml } from './concerns-adapter.js';
import { profileOf } from './profile.js';
import { fmtWon, nominal, money } from './format.js';
import { newsArchiveHtml, bindNewsArchive } from './news.js';
import { mbtiOf } from './persona.js';
import { TYPE_INFO } from '../content/mbti-lean.js';
import { identityConcernOf } from '../engine/concerns.js';

const shown = { issue: null, trait: null };   // 지난번에 본 값에서 지금 값으로 모핑

// 출처: id 문자열이면 SOURCES에서 찾아 메타로 바꾼다
export const toMetas = src => [].concat(src || []).map(s => typeof s === 'string' ? (S.sources[s] || { title: s }) : s).filter(Boolean);
export function srcList(list, { noEst = true } = {}) {
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
      <div class="sheet__body">${srcList(list) || '<p class="cap">출처 목록을 불러오지 못했습니다.</p>'}</div>`,
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
  const reason = lastReason(key) || '아직 기록된 변화가 없습니다.';
  return `<details class="metric" data-key="${key}"><summary class="metric__sum"><span class="metric__label">${esc(label)}</span><span class="metric__value">${value}</span>${meter(value, warn ? statLevel(value) : '')}<span class="metric__reason">${esc(reason)}</span></summary>`
    + `<div class="metric__body">${srcList(ex?.src)}</div></details>`;
}
function wealthLine(L) {
  const m = profileOf(L).money, a = money(m.assets, L.year), d = money(m.debt, L.year);
  return `<p class="cap wealth-line">자산 <b>${a.nominal}</b> · 부채 <b>${d.nominal}</b>${a.today ? `<br>${a.today}` : ''}</p>`;
}
// 나이대별 항목(엔진 concernsOf): 한 줄 이유는 요약에, 설명·근거(출처·실측/추정)는 펼침에.
function concernDetails(i) {
  const b = i.basis?.kind && kindBadge(i.basis.kind), src = i.basis?.src && srcList(i.basis.src, { noEst: true });
  return `<details class="metric" data-key="${esc(i.key)}"><summary class="metric__sum"><span class="metric__label">${esc(i.label)}</span><span class="metric__value">${i.value}</span>${meter(i.value)}<span class="metric__reason">${esc(i.reason || '')}</span></summary>`
    + `<div class="metric__body">${src || ''}</div></details>`;
}
function identityConcernHtml(L) {
  const state = identityConcernOf(L);
  if (!state) return '';
  const changes = (entry, sign) => [entry.stress ? `스트레스 ${sign}${entry.stress}` : '', entry.confusion ? `혼란 ${sign}${entry.confusion}` : ''].filter(Boolean).join(' · ');
  return `<section class="identity-summary" aria-labelledby="identity-summary-title"><h3 id="identity-summary-title" class="past-news__h">선택과 마음의 부담</h3>`
    + `<p>${esc(state.stageLabel)}</p><dl class="arows"><div class="arow"><dt>스트레스</dt><dd>${state.stress} / 20</dd></div><div class="arow"><dt>정체성 혼란</dt><dd>${state.confusion} / 10</dd></div></dl>`
    + (state.concern ? `<p>${esc(state.concern)}</p>` : '')
    + `<p class="cap">선택으로 쌓인 게임 속 상태야. 기존 고민 점수와는 별도로 기록해.</p><h4>최근 부담이 생긴 선택</h4>`
    + (state.causes.length ? `<ul>${state.causes.map(e => `<li>${esc(e.year)}년 · ${e.prompt ? `${esc(e.prompt)} — ` : ''}${esc(e.label)}<br><span class="cap">${changes(e, '+')}</span></li>`).join('')}</ul>` : '<p class="cap">아직 부담이 쌓인 선택은 없어.</p>')
    + `<h4>최근 회복</h4>`
    + (state.recoveries.length ? `<ul>${state.recoveries.map(e => `<li>${esc(e.year)}년 · ${e.natural ? '새로운 충돌 없이 보낸 해의 회복' : '실제로 받은 지원·휴식에 따른 회복'}<br><span class="cap">${changes(e, '−')}</span></li>`).join('')}</ul>` : '<p class="cap">아직 기록된 회복은 없어. 새로운 충돌이 없는 해에는 부담이 조금씩 줄어들어.</p>')
    + '</section>';
}
// 6지표 게이지(정보 표시: 누를 수 없다). 메인에서 '지표' 탭·PC 우측 패널로 옮겼다.
export const gaugesHtml = L => `<ul class="gauges" aria-label="6지표">${STATS.map(s => { const v = L.stats[s.key], lv = statLevel(v); return `<li class="gauge${lv ? ' is-' + lv : ''}">${ringSvg(s.key, v)}<span class="gauge__label">${s.label}</span><span class="gauge__value">${v}</span></li>`; }).join('')}</ul>`;
const TABS = [['stats', '지표·성향'], ['traits', '성향'], ['issues', '관심사·고민'], ['peers', '동갑내기']];
// 성향 패널: 게임용 MBTI 4축 막대 + 유형 설명(한 줄 특징·강점·주의점·큰 결정 경향)
const MBTI_AX = [['EI', 'E', '외향', 'I', '내향'], ['SN', 'N', '직관', 'S', '현실'], ['TF', 'F', '감정', 'T', '사고'], ['JP', 'J', '계획', 'P', '즉흥']];
const traitsHtml = L => {
  if (L.age < 19) return '<div class="mbti-card"><p class="mbti-card__type">성향 형성 중</p><p>경험과 선택을 통해 성향이 자라납니다. 성년이 되면 유형을 확인할 수 있어요.</p></div>';
  const ax = mbtiOf(L.mbti ?? L.traits ?? {}), ty = ax.map(x => x.ch).join(''), info = TYPE_INFO[ty];
  const bar = ([k, hi, hiL, lo, loL], i) => { const v = ax[i].v, side = v >= 50 ? hi : lo;
    return `<div class="mbti-axis${ax[i].vague ? ' is-vague' : ''}" role="img" aria-label="${loL}(${lo}) ${100 - v} 대 ${hiL}(${hi}) ${v}, ${side} 쪽${ax[i].vague ? ' 약하게' : ''}"><span class="mbti-axis__end${side === lo ? ' is-on' : ''}">${lo} ${loL}</span><span class="mbti-axis__track"><span class="mbti-axis__dot" style="--v:${v}"></span></span><span class="mbti-axis__end${side === hi ? ' is-on' : ''}">${hiL} ${hi}</span></div>`; };
  return `<div class="mbti-card"><p class="mbti-card__type">${L.age < 19 ? '형성 중 · ' : ''}${ty}${info ? ` <span class="mbti-card__one">${esc(info[0])}</span>` : ''}</p>${MBTI_AX.map(bar).join('')}`
    + (info ? `<dl class="mbti-card__info"><dt>강점</dt><dd>${esc(info[1])}</dd><dt>주의할 점</dt><dd>${esc(info[2])}</dd><dt>인생의 큰 결정에서</dt><dd>${esc(info[3])}</dd></dl>` : '')
    + `<p class="cap">예민함 ${L.traits?.sens ?? 50}/100</p></div>`;
};
export function panel(tab) {
  const L = S.L;
  if (tab === 'traits') return traitsHtml(L);
  if (tab === 'issues') {
    const c = getConcerns(L);
    return `<p class="sheet__note">${esc(c.stageLabel || '')}의 관심사·고민</p><div class="radar-box">${radarSvg('issue', {}, { size: 280, aria: '관심사·고민 지도', axes: axesOf(c) })}</div>`
      + identityConcernHtml(L) + byValue(c).map(concernDetails).join('');
  }
  return gaugesHtml(L)
    + STATS.map(s => metricDetails(s.key, s.label, L.stats[s.key], { warn: true }) + (s.key === 'wealth' ? wealthLine(L) : '')).join('') + `<h3 class="past-news__h">성향</h3>` + traitsHtml(L);
}
// 탭은 진행 화면 하단 바가 유일한 탭 줄(지표·성향·관심사·고민·동갑내기). 시트는 안쪽 탭 없이 내용만 보여 준다.
export function openStats(tab = 'stats', focusKey = null, onClose) {
  const el = openSheet({
    onClose,
    html: `<div class="sheet__head"><h2 class="sheet__title">${S.L.age}세의 ${(TABS.find(([id]) => id === tab) || TABS[0])[1]}</h2><button class="sheet__close" type="button">닫기</button></div>
      <div class="sheet__body" role="region" id="panel-stats" aria-label="상세 정보"></div>`,
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
