import { S, $, esc, openSheet } from './dom.js';
import { recordYear } from '../engine/chronicle.js';
import { homeLabel, TENURE_LABEL, STATUS_LABEL, SCHOOL_LABEL } from './profile.js';
import { bondLabel } from '../engine/kin.js';
import { money } from './format.js';
import { familyChartHtml } from './family-chart.js';
import { lifeStoryRecords } from '../engine/life-story.js';
import { fmtWon } from './format.js';

const TITLE = { home: '거주 내역', job: '직업·급여 내역', asset: '자산 내역', family: '가족·관계 내역', daily: '생활·선택 내역' };
const LIFE_STATUS = { completed: '실행 기록', reviewed: '후속 확인', canceled: '취소', planned: '정한 원칙·계획', pending: '응답 대기', recorded: '생활 기록', transferred: '자금 이동' };
export function historyRows(L, kind) {
  if (kind === 'daily') {
    const actual = lifeStoryRecords(L).map(r => ({ year: r.year, age: r.age, text: `${LIFE_STATUS[r.status]} · ${r.text}` }));
    const ledgers = Object.values(L.dailyLife?.ledger || {}).filter(r => r.finalized && Number.isInteger(r.year) && r.year >= L.birth.year + 19 && r.year <= (L.death?.year ?? L.year));
    for (const r of ledgers) actual.push({ year: r.year, age: r.year - L.birth.year,
      text: `연간 장부 · 소비 ${fmtWon(r.consumption)} · 연말 현금 ${fmtWon(r.closingCash)} (2025년 물가 기준)` });
    return actual.sort((a, b) => b.year - a.year);
  }
  const rows = Object.values(L.chronicle || {}).sort((a, b) => b.year - a.year);
  const items = rows.map(r => {
    const won = n => money(n || 0, r.year).nominal;
    let text;
    if (kind === 'home') text = `${homeLabel({ home: r.home, year: r.year })} · ${TENURE_LABEL[r.home.tenure] || ''}${r.home.rent ? ` · 월세 ${won(r.home.rent)}` : ''}${r.home.deposit ? ` · 보증금 ${won(r.home.deposit)}` : ''}`;
    if (kind === 'job') {
      const j = r.job, active = ['employed', 'self'].includes(j.status);
      text = j.exam ? '공무원 시험 준비 중' : active ? `${j.title || STATUS_LABEL[j.status]} · ${j.status === 'self' ? '연 순익' : '연봉'} ${won(j.wage)}` : r.age < 6 ? '영유아' : j.status === 'student' ? SCHOOL_LABEL[j.school] || '학생' : `${STATUS_LABEL[j.status] || '성장 중'}${j.title ? ` · 이전 직업 ${j.title}` : ''}`;
    }
    if (kind === 'asset') text = `순자산 ${won(r.asset.net)} · 자산 ${won(r.asset.assets)} · 부채 ${won(r.asset.debt)}`;
    if (kind === 'family') text = r.family.map(p => `${p.rel}${p.name ? ' ' + p.name : ''} · ${p.alive ? '' : '별세 · '}${bondLabel(p.bond)} (${p.bond})`).join('\n') || '기록된 가족 없음';
    return { year: r.year, age: r.age, text };
  });
  // 바뀌지 않은 상태는 연속된 연도끼리 묶어 전환 지점을 찾기 쉽게 한다.
  const grouped = [];
  for (const item of items) {
    const last = grouped.at(-1);
    if (kind !== 'asset' && last?.text === item.text && (last.fromYear ?? last.year) === item.year + 1) {
      last.fromYear = item.year; last.fromAge = item.age;
    } else grouped.push({ ...item });
  }
  return grouped;
}
export function openHistory(kind, onClose) {
  if (!TITLE[kind]) return;
  recordYear(S.L);
  const rows = historyRows(S.L, kind);
  const body = kind === 'family' ? familyChartHtml(S.L) : `<p class="cap">${kind === 'daily' ? '계획·실행·취소를 구분한 기록 · 장부는 2025년 물가 기준' : '연도별 기록 · 금액은 당시 가격'}</p><ol class="history-list">${rows.map(r => `<li><p class="history-list__year">${r.fromYear != null ? r.fromYear + '–' : ''}${r.year}년 · ${r.fromAge != null ? r.fromAge + '–' : ''}${r.age}세</p><p>${esc(r.text)}</p></li>`).join('')}</ol>${!rows.length ? '<p>아직 남은 기록이 없어.</p>' : ''}`;
  const el = openSheet({ onClose, cls: 'history-sheet', html: `<div class="sheet__head"><h2 class="sheet__title">${TITLE[kind]}</h2><button class="sheet__close" type="button">닫기</button></div><div class="sheet__body">${body}</div>` });
  $('.sheet__body', el).scrollTop = 0;
  return el;
}
