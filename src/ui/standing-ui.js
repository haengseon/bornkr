// 통계 속 내 위치(퍼센티지): 엔진 standing() 결과를 S.standing 한 곳에 캐시(같은 생애·같은 해·같은 시점이면 재사용)해
// 진행 화면 카드 칩과 결산 '이 생애의 위치' 섹션이 함께 쓴다. 금액 없이 퍼센티지만, 추정(est)은 '약'만 붙인다.
import { standing } from '../engine/index.js';
import { S, esc } from './dom.js';

export function standingOf(L, at = 'now') {
  const k = `${L.seed}:${L.birth?.year}:${at}:${at === 'end' || !L.alive ? 'end' : L.year}`;
  if (S.standing?.k !== k) {
    let v = null;
    try { v = standing(L, { at }); } catch (e) { console.error(e); }
    S.standing = { k, v };
  }
  return S.standing.v;
}

export const pctText = it => it ? `${it.est ? '약 ' : ''}${it.label}` : '';
// 카드 요약 줄용 짧은 칩: 한 줄 유지를 위해 '약'은 접근성 이름·툴팁에만
export const pctChip = it => it ? `<span class="pct" title="${esc(pctText(it))} · ${esc(it.basis ?? '')}" aria-label="${esc(pctText(it))}">${esc(it.label)}</span>` : '';

const ROWS = [['asset', '순자산'], ['income', '소득'], ['housing', '주거'], ['age', '수명'], ['cause', '사망 원인'], ['edu', '학력']];
// 결산 섹션. 막대: 상위 N%면 100−N만큼(오른쪽이 상위), 사인은 그 나이대 사망 중 비율.
export function standingHtml(st) {
  if (!st) return '';
  const rows = ROWS.filter(([k]) => st[k]).map(([k, name]) => {
    const it = st[k], cause = k === 'cause', v = Math.max(1, Math.min(100, Math.round(cause ? it.pct : 100 - it.pct)));
    const val = cause ? (it.rank ? `${it.rank}위` : `${Math.round(it.pct)}%`) : pctText(it);     // 사인: 값 칸은 순위, 설명 줄에 전체 라벨
    return `<div class="metric stand__row" data-stand="${k}"><div class="metric__sum"><span class="metric__label">${name}</span><span class="metric__value stand__v">${esc(val)}</span><span class="meter meter--lg" role="img" aria-label="${esc(name)} ${esc(cause ? it.label : val)}"><span class="meter__fill" style="--v:${v}"></span></span><span class="metric__reason">${esc(cause ? `${it.label}. ${it.basis ?? ''}` : it.basis ?? '')}</span></div></div>`;
  });
  if (!rows.length) return '';
  return `<section class="section stand" aria-labelledby="sum-stand">
      <div class="section__head"><h2 class="section__title" id="sum-stand">이 생애의 위치</h2><span class="section__note">대한민국 통계와 비교</span></div>
      ${rows.join('')}
      ${st.notes?.length ? `<ul class="stand__notes">${st.notes.map(t => `<li>${esc(t)}</li>`).join('')}</ul>` : ''}
    </section>`;
}
