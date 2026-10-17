import { bondLabel } from '../engine/kin.js';
import { esc } from './dom.js';
import { familyLines, familyText } from './profile.js';

const COLORS = ['#3977ba', '#c05b42', '#388566', '#9660b7', '#a47721', '#bb528d', '#35858b', '#6b73aa'];
const signature = p => `${p.rel}|${p.name || ''}`;
export function familySeries(L) {
  const rows = Object.values(L.chronicle || {}).sort((a, b) => a.year - b.year);
  const ids = new Map(rows.flatMap(r => r.family.filter(p => p.id).map(p => [signature(p), p.id])));
  const series = new Map();
  rows.forEach((r, index) => {
    for (const p of r.family) {
      if (!Number.isFinite(p.bond)) continue;
      const id = p.id || ids.get(signature(p)) || signature(p);
      if (!series.has(id)) series.set(id, { id, label: `${p.rel}${p.name ? ' ' + p.name : ''}`, points: [] });
      const s = series.get(id);
      // 사후의 값은 생전 관계 보존용이다. 차트에서 계속 살아 있는 관계처럼 연장하지 않는다.
      if (p.alive === false) continue;
      const last = s.points.at(-1);
      s.points.push({ year: r.year, value: p.bond, gap: !!last && (last.index !== index - 1 || last.year !== r.year - 1), index });
    }
  });
  return [...series.values()].filter(s => s.points.length);
}

export function familyChartHtml(L) {
  const series = familySeries(L);
  const all = series.flatMap(s => s.points), first = Math.min(...all.map(p => p.year)), last = Math.max(...all.map(p => p.year));
  const min = all.length ? first : L.year, max = Math.max(L.year, all.length ? last : min, min + 1);
  const W = 640, H = 540, left = 100, right = 20, top = 36, bottom = 52;
  const x = year => left + (year - min) / (max - min) * (W - left - right);
  const y = value => top + (100 - value) / 100 * (H - top - bottom);
  const tickCount = Math.min(6, max - min + 1);
  const ticks = [...new Set(Array.from({ length: tickCount }, (_, i) => Math.round(min + (max - min) * i / Math.max(1, tickCount - 1))))];
  const axes = [[5, '절연'], [20, '갈등'], [40, '서먹함'], [62.5, '가까움'], [87.5, '돈독함']].map(([v, label]) => `<line x1="${left}" x2="${W - right}" y1="${y(v)}" y2="${y(v)}" class="family-chart__grid"/><text x="${left - 10}" y="${y(v) + 4}" text-anchor="end">${label}</text>`).join('');
  const time = ticks.map(v => `<text x="${x(v)}" y="${H - bottom + 24}" text-anchor="middle">${v}</text>`).join('');
  const paths = series.map((s, i) => {
    const color = COLORS[i % COLORS.length], dash = i >= COLORS.length ? '6 4' : '';
    const d = s.points.map((p, j) => `${j === 0 || p.gap ? 'M' : 'L'}${x(p.year).toFixed(1)},${y(p.value).toFixed(1)}`).join(' ');
    const dots = s.points.map(p => `<circle cx="${x(p.year)}" cy="${y(p.value)}" r="3" fill="${color}"><title>${esc(s.label)} · ${p.year}년 · ${bondLabel(p.value)}</title></circle>`).join('');
    return `<g data-family-series="${esc(s.id)}"><path d="${d}" stroke="${color}" stroke-width="2.5" fill="none"${dash ? ` stroke-dasharray="${dash}"` : ''}/>${dots}</g>`;
  }).join('');
  // 범례와 현재 목록을 하나로 합쳐 같은 사람의 이름·관계가 반복되지 않게 한다.
  const current = familyLines(L), used = new Set();
  const members = current.map(p => {
    const index = series.findIndex(s => !used.has(s.id) && (p.id ? s.id === p.id : s.label === `${p.rel}${p.name ? ' ' + p.name : ''}`));
    if (index >= 0) used.add(series[index].id);
    return { text: familyText(p).replace(/\s*\(\d+\)/g, ''), index };
  });
  series.forEach((s, index) => { if (!used.has(s.id)) members.push({ text: `${s.label} · 마지막 관계 기록 ${s.points.at(-1).year}년 · ${bondLabel(s.points.at(-1).value)}`, index }); });
  const legend = `<ul class="family-chart__legend family-current" aria-label="가족별 관계와 그래프 범례">${members.map(({ text, index }) => `<li>${index >= 0 ? `<span class="family-chart__swatch" style="--series-color:${COLORS[index % COLORS.length]};${index >= COLORS.length ? 'border-top-style:dashed' : ''}" aria-hidden="true"></span>` : '<span class="family-chart__no-series" aria-hidden="true">—</span>'}<span>${esc(text)}</span></li>`).join('')}</ul>`;
  return `<section class="family-history"><h3 class="family-chart__heading">가족 관계의 흐름</h3>${series.length ? `<figure class="family-chart"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="연도별 가족 관계 변화. 세로축은 절연·갈등·서먹함·가까움·돈독함, 가로축은 연도입니다."><text x="12" y="14">관계</text>${axes}${time}${paths}<text x="${W - right}" y="${H - 5}" text-anchor="end">연도</text></svg><figcaption><p class="cap">현재 기준 관계 · ${L.year}년 · 색상은 그래프의 같은 가족을 뜻해요.</p>${legend}</figcaption></figure>` : `<p class="empty">아직 관계 변화 기록이 없습니다.</p>${legend}`}</section>`;
}
