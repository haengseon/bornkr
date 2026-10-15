// 관심사·고민(나이대별): 엔진 concernsOf(L) 의 items 를 그대로 쓴다(라벨·항목 하드코딩 없음). 함수가 없거나 실패하면 기존 10축으로 대체.
import * as E from '../engine/index.js';
import { ISSUES } from '../engine/constants.js';
import { ISSUE_SHORT } from './labels.js';
import { esc } from './dom.js';

export function getConcerns(L) {
  try { const c = E.concernsOf?.(L); if (c?.items?.length) return c; } catch (e) { console.error(e); }
  return { stage: 'adult', stageLabel: '', items: ISSUES.map(i => ({ key: i.key, label: i.label, desc: '', value: L.issues[i.key] ?? 0, reason: '' })), hiddenAdultKeys: [] };
}
export const valuesOf = c => Object.fromEntries(c.items.map(i => [i.key, i.value]));
export const axesOf = c => c.items.map(i => ({ key: i.key, label: i.label }));
export const byValue = c => [...c.items].sort((a, b) => b.value - a.value);

// 안 B: 올해 사회의 관심사 = 그해 뉴스(올해의 뉴스)의 axes 상위 2~3개. 개인 관심사와 구분해 접어 둔다(13세 미만은 접힘).
export function societyAxes(log, year, max = 3) {
  const cnt = new Map();
  for (const n of log || []) if (n.year === year) for (const k of n.axes || []) cnt.set(k, (cnt.get(k) || 0) + 1);
  return [...cnt].sort((a, b) => b[1] - a[1]).slice(0, max).map(([k]) => ISSUE_SHORT[k] ?? k);
}
export function societyHtml(log, L) {
  const a = societyAxes(log, L.year);
  return a.length ? `<details class="society"${L.age >= 13 ? ' open' : ''}><summary>올해 사회의 관심사 <small>(그해 뉴스 기준 · 내 관심사와 별개)</small></summary><p>${a.map(x => `<span class="paper__tag">${esc(x)}</span>`).join(' ')}</p></details>` : '';
}
