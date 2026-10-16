import { esc } from './dom.js';
import { fmtWon } from './format.js';

const STATUS = { active: '유지 중', maintained: '유지 중', reduced: '줄이는 중', paused: '잠시 중단', stopped: '중단', resumed: '재개', ended: '종료' };
const row = (label, value) => `<div class="aux__row"><span>${esc(label)}</span><span>${esc(value)}</span></div>`;

// 메인에는 생활 원칙과 연간 수입·지출만. 세부 원장과 선택 기록은 카드의 내역 창에서 본다.
export function dailyLifeHtml(L) {
  if (!(L?.modelVersion >= 2) || L.age < 19) return '';
  const summary = L.dailyLife?.summary;
  if (!summary || !Number.isInteger(summary.year)) return '';
  const { ledger, routine } = summary;
  const amounts = ledger?.currencyBaseYear === 2025 ? [['연간 수입', ledger.income], ['연간 지출', ledger.totalOutflow]]
    .filter(([, value]) => Number.isFinite(value)).map(([label, value]) => row(label, fmtWon(value))).join('') : '';
  if (!amounts && !routine?.label) return '';
  const principle = routine?.label ? row('생활 원칙', routine.label + (STATUS[routine.status] ? ` · ${STATUS[routine.status]}` : '')) : '';
  return `<div class="daily-summary" data-daily-life>${principle}${amounts}${amounts ? `<p class="cap">${esc(summary.year)}년${ledger.finalized ? '' : ' · 정산 중'} · 2025년 물가 기준</p>` : ''}</div>`;
}
