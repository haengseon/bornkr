// 건강(GDD §5.7). health = { conditions:[{key,since,active}], disability, care, smoker:0|1|2, drinker, dx:{key:year} }
import { T, yr, ag } from '../tables.js';
import { COND_LABEL } from '../act.js';
import { sensFields } from '../safety.js';
import { incQuint, leanOdds } from '../stats.js';

const CHRONIC = new Set(['hypertension', 'diabetes', 'arthritis']);
const CARDIO = new Set(['heart', 'stroke']);
const DIS_LABEL = { developmental: '발달장애', physical: '지체장애', hearing: '청각장애', visual: '시각장애' };

export const active = (L, key) => L.health.conditions.some(c => c.key === key && c.active);

function dx(L, ctx, key) {
  if (!ctx.act.addCondition(key)) return;
  const label = COND_LABEL[key];
  if (CHRONIC.has(key)) ctx.sys('sys.health.dx_chronic', { condLabel: label });
  else if (CARDIO.has(key)) ctx.sys('sys.health.dx_cardio', { condLabel: label }, sensFields(L, 'illness'));
  else if (key === 'cancer') ctx.sys('sys.health.dx_cancer', { cancerLabel: label }, sensFields(L, 'illness'));
  else if (key === 'dementia') ctx.sys('sys.health.dx_dementia', {}, sensFields(L, 'illness'));
  else if (key === 'depression') ctx.sys('sys.health.depression', {}, sensFields(L, 'illness'));
  else if (key === 'injury') ctx.sys('sys.health.injury');
}

export function step(L, ctx) {
  const h = L.health, a = L.age, sex = L.sex, b = L.birth;
  if (a === 1 && b.lowBirthWeight) ctx.sys('sys.health.lbw');
  if (b.disability && a === (b.disability === 'developmental' ? 3 : 1)) {
    ctx.sys('sys.health.disability', { disabilityLabel: DIS_LABEL[b.disability] ?? '장애', n: 3 + Math.round(9 * (100 - b.healthAccess) / 100) });
  }
  if (a === 19) {
    if (ctx.chance(yr(T('SMOKE_COHORT')[sex], b.year))) { h.smoker = 1; ctx.sys('sys.health.smoke_start'); }
    h.drinker = ctx.chance(T('HIGH_RISK_DRINK')[sex]);
  }
  if (h.smoker === 1 && a >= 30 && ctx.chance(0.03 * (L.flags.quitTry ? 3 : 1))) { h.smoker = 2; ctx.sys('sys.health.quit'); }

  // 지난해 부상은 회복
  if (active(L, 'injury') && h.dx.injury < L.year) ctx.act.recover('injury');
  // 암 5년 생존 → 관해
  const ca = h.conditions.find(c => c.key === 'cancer' && c.active);
  if (ca && L.year - ca.since >= 5) { ca.active = false; ca.until = L.year; L.tally.recov = (L.tally.recov || 0) + 1; ctx.sys('sys.health.cancer_free'); }
  // 우울 회복
  if (active(L, 'depression') && ctx.chance(0.5 * b.healthAccess / 50)) ctx.act.recover('depression');

  if (a >= 15) {
    const q = incQuint(L), qOdds = q === 1 ? 1.3 : q === 2 ? 1.1 : q === 5 ? 0.85 : 1;
    const smoke = h.smoker === 1;
    for (const [key, bySex] of Object.entries(T('CHRONIC_INCIDENCE'))) {
      if (active(L, key)) continue;
      let p = ag(bySex[sex], a) * qOdds * leanOdds(L, 'health', -1);   // 몸을 챙긴 선택이 쌓이면 발병 오즈 ↓(GDD §13.1)
      if (smoke && CARDIO.has(key)) p *= 1.6;
      if (h.drinker && key === 'hypertension') p *= 1.5;
      if (!b.urban && key === 'hypertension') p *= 1.15;
      if (ctx.chance(p)) dx(L, ctx, key);
    }
    if (!active(L, 'cancer') && ctx.chance(ag(T('CANCER_INCIDENCE')[sex], a) * (smoke ? 1.6 : 1))) dx(L, ctx, 'cancer');
    if (!active(L, 'dementia') && ctx.chance(ag(T('DEMENTIA_INCIDENCE'), a))) dx(L, ctx, 'dementia');
    if (!active(L, 'depression') && ctx.chance(T('DEPRESSION_INCIDENCE')[sex] * (L.stats.happiness < 35 ? 2 : 1) * leanOdds(L, 'happiness', -1))) dx(L, ctx, 'depression');
    if ((L.job.status === 'employed' || L.job.status === 'self') && (L.job.hazard ?? 1) >= 2 && ctx.chance(0.03)) dx(L, ctx, 'injury');
  }
  // 미충족 의료(GDD §5.7)
  if (b.healthAccess < 35 && h.conditions.some(c => c.active) && !(L.flags.unmet >= L.year - 2) && ctx.chance(0.2)) {
    L.flags.unmet = L.year;
    ctx.sys('sys.health.unmet');
  }
}

// 올해 본인부담 의료비(만원): 진단 첫해 DX_COST, 이후 만성 60·암 cancerAfter·치매 300·심혈관 60
export function medicalCost(L) {
  const c = T('DX_COST'), access = L.birth.healthAccess < 40 ? 1.2 : 1;
  let sum = 0;
  for (const x of L.health.conditions) {
    if (!x.active || x.key === 'injury' || x.key === 'depression') continue;
    const first = L.year - x.since <= 1;
    sum += first ? c[x.key] ?? 60 : x.key === 'cancer' ? c.cancerAfter : x.key === 'dementia' ? c.dementia : 60;
  }
  return Math.round(sum * access);
}
