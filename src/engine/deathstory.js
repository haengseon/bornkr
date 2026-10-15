// 사망 인과 체인(결산 판정문용): 사망 연도·직접 사인 + 그 사인에 실제로 이어진 상태·이력만 시간순으로.
// 사실만 쓴다: 진단 연도·흡연·음주·요양등급·거주 여건·직업 위험 등 L에 기록된 값. 자해 사망은 원인 나열 없이 연도만(safety).
import { COND_LABEL } from './act.js';

// 사인 → 관련 질환 키
const REL = {
  cancer: ['cancer'], heart: ['heart', 'hypertension', 'diabetes'], stroke: ['stroke', 'hypertension', 'diabetes'], diabetes: ['diabetes'],
  kidney: ['kidney', 'diabetes', 'hypertension'], alzheimer: ['dementia'], pneumonia: ['dementia', 'copd'], liver: ['liver'], hypertension: ['hypertension'],
};
const SMOKY = new Set(['cancer', 'heart', 'stroke', 'pneumonia', 'tb']);
const DRINKY = new Set(['liver', 'cancer', 'heart', 'stroke', 'hypertension']);
const FRAIL = new Set(['alzheimer', 'pneumonia', 'senility', 'sepsis', 'fall']);
const FAR = new Set(['cancer', 'heart', 'stroke', 'pneumonia', 'perinatal', 'tb', 'infectious']);
const ACCIDENT = new Set(['transport', 'fall', 'external']);

export function deathStory(L) {
  const d = L.death;
  if (!d || d.horizon) return null;
  const base = { year: d.year, age: d.age, cause: d.cause, causeLabel: d.causeLabel };
  if (d.sensitive) return { ...base, causeLabel: null, chain: [], sensitive: true };
  const c = d.cause, F = [];                                         // F = [연도, 문장]
  const log = id => L.log.find(e => e.id === id);
  const ev = (id, f) => { const e = log(id); if (e) F.push([e.year, f(e)]); };
  if (SMOKY.has(c)) {
    ev('sys.health.smoke_start', e => `${e.age}세에 담배를 시작했다`);
    ev('sys.health.quit', e => `${e.age}세에 담배를 끊었지만 흡연 이력은 남았다`);
    if (L.health.smoker === 1) F.push([d.year, '끝내 담배를 끊지 못했다']);
  }
  if (DRINKY.has(c) && L.health.drinker) F.push([L.birth.year + 30, '고위험 음주 습관이 길게 이어졌다']);
  for (const k of REL[c] || (c === 'sepsis' || c === 'covid' ? L.health.conditions.filter(x => x.active).map(x => x.key) : [])) {
    for (const x of L.health.conditions.filter(y => y.key === k)) {
      const lab = COND_LABEL[k] || k, yrs = (x.until ?? d.year) - x.since;
      F.push([x.since, x.until ? `${x.since}년 ${lab} 진단, ${x.until}년 치료를 마치고 경과를 지켜봤다` : yrs > 0 ? `${x.since}년 ${lab} 진단 후 ${yrs}년을 안고 지냈다` : `${x.since}년 ${lab} 진단`]);
    }
  }
  const g = L.aging || {};
  if (FRAIL.has(c) && g.ltc) F.push([d.year - 1, `장기요양 ${g.ltc}등급의 돌봄이 필요했다`]);
  if (FRAIL.has(c) && g.isolated && d.age >= 60) F.push([d.year - 2, '홀로 지내는 날이 길어졌다']);
  if (d.age >= 60 && L.family?.widowed && !L.family?.partner && (FRAIL.has(c) || c === 'senility')) F.push([d.year - 3, '배우자를 먼저 보냈다']);
  if (FAR.has(c) && L.birth.healthAccess < 35 && !L.birth.urban) F.push([L.birth.year, '가까운 병원이 멀리 있는 동네에서 살았다']);
  if (ACCIDENT.has(c) && (L.job?.hazard ?? 0) >= 2) F.push([d.year - 1, '위험이 따르는 일터에서 일하고 있었다']);
  if ((c === 'tb' && d.year < 1995) || (c === 'infectious' && d.year < 1980)) F.unshift([d.year, c === 'tb' ? '결핵이 아직 흔한 병이던 때였다' : '감염병이 아직 흔하던 시절이었다']);   // R14 시대 사인
  if (c === 'covid' && d.year <= 2024) F.unshift([d.year, `${d.year}년 감염병이 번지던 때였다`]);
  if (L.stats.health < 40 && d.age >= 20) F.push([d.year, '몸을 돌볼 겨를이 적었던 해들이 쌓여 있었다']);
  if (c === 'perinatal' || d.age === 0) F.push([d.year, '태어난 해, 몸이 아주 작고 약했다']);
  if (d.age >= 85 && (c === 'senility' || !F.length)) F.push([d.year, `${d.age}년의 세월이 몸에 쌓여 있었다`]);
  const seen = new Set();
  const chain = F.filter(([, s]) => !seen.has(s) && seen.add(s)).sort((a, b) => a[0] - b[0]).map(([, s]) => s).slice(0, 5);
  return { ...base, chain };
}
