// 지표 시각화: 물결 링 게이지 · 레이더(사회 이슈 10축·성향 5축) · 숫자 카운트 · 값 모핑. 외부 에셋 없음(인라인 SVG).
// 순수 부분(radarPoints·waveY)은 Node 단위 테스트 대상. DOM 부분은 reduced()면 즉시 반영한다.
import { STATS, ISSUES, TRAITS } from '../engine/constants.js';
import { ISSUE_SHORT } from './labels.js';

// ───────── 순수 ─────────
export const clamp01 = v => Math.max(0, Math.min(100, Number(v) || 0));
// n축 레이더의 꼭짓점 좌표. 첫 축이 12시 방향, 시계 방향.
export function radarPoints(values, cx, cy, r) {
  const n = values.length;
  return values.map((v, i) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / n, k = (r * clamp01(v)) / 100;
    return [+(cx + k * Math.cos(a)).toFixed(1), +(cy + k * Math.sin(a)).toFixed(1)];
  });
}
const pts = p => p.map(q => q.join(',')).join(' ');
// 링 안 물결 수면 높이(원 지름 38 기준, 0~100 → y 41~3)
export const waveY = v => +(41 - clamp01(v) * 0.38).toFixed(2);

// ───────── 아이콘(24×24 선화) ─────────
const ICON = {
  health: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
  intellect: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/>',
  happiness: '<circle cx="12" cy="12" r="9"/><path d="M8 14c1 1.6 2.4 2.4 4 2.4s3-.8 4-2.4M9 9.5h.01M15 9.5h.01"/>',
  wealth: '<circle cx="12" cy="12" r="9"/><path d="M12 6.5v11M9.5 9.6c0-1 1-1.6 2.5-1.6s2.5.6 2.5 1.6-1 1.4-2.5 1.8-2.5.8-2.5 1.8 1 1.6 2.5 1.6 2.5-.6 2.5-1.6"/>',
  relations: '<circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.3 2.7-5 6-5s6 1.7 6 5M16.5 11a2.5 2.5 0 1 0 0-5M17 15c2.5.2 4 1.7 4 4.5"/>',
  leisure: '<path d="M6 3h12M6 21h12M7 3c0 5 5 6 5 9s-5 4-5 9M17 3c0 5-5 6-5 9s5 4 5 9"/>',
  // 선택지 아이콘
  home: '<path d="M3 11l9-7 9 7M5 10v10h14V10M10 20v-6h4v6"/>',
  work: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5h6v2M3 13h18"/>',
  school: '<path d="M2 9l10-5 10 5-10 5zM6 11.5V16c0 1.5 3 3 6 3s6-1.5 6-3v-4.5"/>',
  money: '<rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/>',
  medical: '<path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6z"/>',
  people: '<circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.3 2.7-5 6-5s6 1.7 6 5M16.5 11a2.5 2.5 0 1 0 0-5M17 15c2.5.2 4 1.7 4 4.5"/>',
  rest: '<path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/>',
  go: '<path d="M4 12h15M13 6l6 6-6 6"/>',
  wait: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  child: '<circle cx="12" cy="7" r="3"/><path d="M7 21v-6a5 5 0 0 1 10 0v6"/>',
  doc: '<path d="M6 3h9l4 4v14H6zM14 3v5h5M9 13h7M9 17h7"/>',
  shop: '<path d="M4 9l1.5-5h13L20 9M4 9v11h16V9M4 9c0 1.7 1.3 3 2.7 3S9.3 10.7 9.3 9c0 1.700 1.300 3 2.700 3s2.700-1.300 2.700-3c0 1.700 1.300 3 2.700 3S20 10.700 20 9"/>',
  shield: '<path d="M12 3l8 3v6c0 5-3.500 8-8 9-4.500-1-8-4-8-9V6z"/>',
  dice: '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8.500 8.500h.01M15.500 8.500h.01M12 12h.01M8.500 15.500h.01M15.500 15.500h.01"/>',
  ladder: '<path d="M8 3v18M16 3v18M8 7h8M8 12h8M8 17h8"/>',
  fit: '<path d="M4 9v6M7 7v10M17 7v10M20 9v6M7 12h10"/>',
};
export const iconSvg = (name, cls = 'ico') => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${ICON[name] ?? ICON.go}</svg>`;

// 선택지 문구 → 아이콘(키워드 규칙, 못 찾으면 화살표)
const OPT_RULES = [
  [/병원|치료|진료|검진|수술|약|건강|돌봄 받|요양/, 'medical'], [/이사|집|주택|전세|월세|분양|매수|청약|독립/, 'home'],
  [/대출|저축|투자|예금|빚|돈|월급|보험|연금|상환|지출|소비/, 'money'], [/아이|출산|육아|임신|자녀|입양/, 'child'],
  [/입학|공부|학원|진학|대학|수능|시험|자격|교육|학교|재수|유학/, 'school'], [/취업|이직|퇴사|창업|가게|사업|일|직장|승진|근무|알바|출근|구직/, 'work'],
  [/결혼|연애|친구|가족|부모|만나|이혼|함께|모임|동거|관계/, 'people'], [/쉬|휴식|여행|취미|운동|여가|산책/, 'rest'],
  [/기다|미루|보류|그대로|참|지켜|거절|안 |하지 않/, 'wait'], [/신청|서류|등록|신고|계약|서명|지원/, 'doc'],
];
export function optionIcon(label = '') {
  for (const [re, k] of OPT_RULES) if (re.test(label)) return k;
  return 'go';
}

// ───────── 물결 링(6지표) ─────────
export function ringSvg(key, v) {
  const id = `rc-${key}`;
  return `<svg class="ring6" viewBox="0 0 44 44" aria-hidden="true" focusable="false">
<defs><clipPath id="${id}"><circle cx="22" cy="22" r="19"/></clipPath></defs>
<circle class="ring6__bg" cx="22" cy="22" r="19"/>
<g clip-path="url(#${id})"><g class="ring6__lv" style="--y:${waveY(v)}"><path class="ring6__wave ring6__wave--b" d="M-44 0q11-4 22 0t22 0t22 0t22 0t22 0t22 0V48H-44z"/><path class="ring6__wave" d="M-44 0q11 4 22 0t22 0t22 0t22 0t22 0t22 0V48H-44z"/></g></g>
<circle class="ring6__edge" cx="22" cy="22" r="19"/>
<g class="ring6__ico" transform="translate(13.6 13.6) scale(.7)" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${ICON[key]}</g></svg>`;
}
export const setRing = (btn, v) => btn.querySelector('.ring6__lv')?.style.setProperty('--y', waveY(v));

// ───────── 레이더 ─────────
const SHORT = Object.fromEntries([...ISSUES.map(i => [i.key, ISSUE_SHORT[i.key] ?? i.label]), ...TRAITS.map(t => [t.key, t.label.replace('정서 ', '')])]);
// kind: 'issue'(10축) | 'trait'(5축, 50 기준 점선)
export function radarSvg(kind, values, { size = 190, aria = '', axes = null } = {}) {
  const keys = (axes ?? (kind === 'trait' ? TRAITS : ISSUES)).map(x => x.key);
  const short = k => { const l = axes?.find(x => x.key === k)?.label; return l ? (l.length > 6 ? l.slice(0, 5) + '…' : l) : SHORT[k]; };
  const vals = keys.map(k => values?.[k] ?? 0);
  const cx = size / 2, cy = size / 2, r = size / 2 - (kind === 'trait' ? 40 : 30);
  const ring = f => pts(radarPoints(keys.map(() => 100 * f), cx, cy, r));
  const lab = radarPoints(keys.map(() => 100), cx, cy, r + 15);
  return `<svg class="radar radar--${kind}" viewBox="0 0 ${size} ${size}" role="img" aria-label="${aria}" data-keys="${keys.join(',')}" data-r="${r}" data-v="${vals.join(',')}">
<polygon class="radar__grid" points="${ring(1)}"/><polygon class="radar__grid${kind === 'trait' ? ' radar__grid--mid' : ''}" points="${ring(.5)}"/>
${radarPoints(keys.map(() => 100), cx, cy, r).map(p => `<line class="radar__axis" x1="${cx}" y1="${cy}" x2="${p[0]}" y2="${p[1]}"/>`).join('')}
<polygon class="radar__shape" points="${pts(radarPoints(vals, cx, cy, r))}"/>
${lab.map((p, i) => `<text class="radar__lab" x="${p[0]}" y="${p[1]}" text-anchor="${p[0] < cx - 4 ? 'end' : p[0] > cx + 4 ? 'start' : 'middle'}" dominant-baseline="middle">${short(keys[i])}</text>`).join('')}</svg>`;
}

// ───────── 애니메이션 ─────────
const prefersReduce = () => document.documentElement.dataset.motion === 'reduce' || matchMedia('(prefers-reduced-motion: reduce)').matches;
const ease = t => 1 - Math.pow(1 - t, 3);
// 같은 요소에서 새 트윈이 시작되면 이전 것은 취소
function tween(el, ms, step) {
  cancelAnimationFrame(el._raf);
  if (prefersReduce() || ms <= 0 || document.hidden) return step(1);
  const t0 = performance.now();
  const f = now => { const t = Math.min(1, (now - t0) / ms); step(ease(t)); if (t < 1) el._raf = requestAnimationFrame(f); };
  el._raf = requestAnimationFrame(f);
}
// 숫자 카운트 업/다운. fmt(n) → 문자열
export function countTo(el, to, fmt = n => String(Math.round(n)), ms = 600) {
  const from = el._n ?? to;
  el._n = to;
  if (from === to) { el.textContent = fmt(to); return; }
  tween(el, ms, k => { el.textContent = fmt(from + (to - from) * k); });
}
// 레이더 모핑: 현재 data-v → values
export function morphRadar(svg, values, ms = 600) {
  if (!svg) return;
  const keys = svg.dataset.keys.split(','), from = svg.dataset.v.split(',').map(Number), to = keys.map(k => values?.[k] ?? 0);
  const size = svg.viewBox.baseVal.width, cx = size / 2, r = +svg.dataset.r, poly = svg.querySelector('.radar__shape');
  svg.dataset.v = to.join(',');
  tween(svg, ms, k => poly.setAttribute('points', pts(radarPoints(from.map((f, i) => f + (to[i] - f) * k), cx, cx, r))));
}

export const STAT_ICON_KEYS = STATS.map(s => s.key);
