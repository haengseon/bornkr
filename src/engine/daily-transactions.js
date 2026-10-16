import { getHouseholdBudget, to2025RealManwon } from '../data/livelihood.js';

export function householdSize(L) {
  return 1 + (L.family?.partner ? 1 : 0) + (L.family?.children || []).filter(c => c.alive && !c.leftHome).length;
}

export function foodPriceContext(L) {
  const year = L.year;
  const previous = to2025RealManwon(10000, year - 1, 'food');
  const current = to2025RealManwon(10000, year, 'food');
  const reference = getHouseholdBudget({ year, householdSize: householdSize(L) });
  const nominal = reference.monthlyNominalWon.food;
  const annual = Number.isFinite(nominal) ? to2025RealManwon(nominal * 12, year, 'food') : null;
  return { available: previous !== null && current !== null && annual !== null,
    year, annualFoodReference: annual, rise: previous && current ? previous / current - 1 : null,
    source: 'DT_1J22001 / DT_1L9U105', kind: 'household-reference' };
}

/** A capped game assumption, not an observed food-price or individual causal effect. */
export function mealExpenseAdjustment(L, { living, foodReferenceAnnual, availableCookingMinutes } = {}) {
  const p = L.dailyLife?.mealPolicy;
  const none = { discount: 0, policyId: null, sourceEventId: null, kind: 'game-assumption' };
  if ((L.modelVersion ?? 1) < 2 || L.age < 19 || !L.alive || !p || p.effectiveYear !== L.year
      || !['own', 'jeonse', 'monthly', 'public'].includes(L.home?.tenure)
      || !['budget', 'cook'].includes(p.choiceId) || p.sourceEventId !== 'sys.daily.meal'
      || p.selectedYear !== L.year - 1 || !Number.isFinite(living) || living <= 0
      || !Number.isFinite(foodReferenceAnnual) || foodReferenceAnnual <= 0) return none;
  if (p.choiceId === 'cook' && !(Number.isFinite(availableCookingMinutes) && availableCookingMinutes >= 30)) return none;
  if (!(L.choices || []).some(c => c.year === p.selectedYear && c.eventId === p.sourceEventId && c.option === p.choiceId)) return none;
  const cook = p.choiceId === 'cook';
  return { discount: Math.min(living * (cook ? .02 : .01), foodReferenceAnnual * (cook ? .1 : .05)),
    policyId: p.id, sourceEventId: p.sourceEventId, choiceId: p.choiceId, kind: 'game-assumption' };
}
