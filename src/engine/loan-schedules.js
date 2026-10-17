// 원금 회차는 저장 자료에 남긴다. 기존 저장의 잔액은 복구 시점부터 한 회차로 간주한다.
export const PAY_YEARS = { mortgage: 30, student: 10, credit: 5, business: 7, rental: 20 };
export function syncLoan(L, kind) {
  if (!PAY_YEARS[kind]) return;
  const m = L.money, balance = Math.max(0, m.loans[kind] || 0);
  const schedules = m.loanSchedules ||= {};
  const rows = schedules[kind] ||= [];
  const tracked = rows.reduce((n, r) => n + r.balance, 0);
  if (balance > tracked + 0.000001) rows.push({ id: `${kind}.${L.year}.${rows.length}`, startedYear: L.year, initialPrincipal: balance - tracked, balance: balance - tracked, remaining: PAY_YEARS[kind], repaymentStartYear: null });
  let reduction = Math.max(0, tracked - balance);
  for (const r of rows) { const cut = Math.min(reduction, r.balance); r.balance -= cut; reduction -= cut; }
  return rows;
}
export function annualPrincipal(L, kind) {
  const balance = Math.max(0, L.money.loans[kind] || 0), rows = syncLoan(L, kind);
  if (kind === 'student' && L.edu.stage !== 'done') return 0;
  let paid = 0;
  for (const r of rows) {
    if (r.balance <= 0 || r.lastPaidYear === L.year) continue;
    r.repaymentStartYear ??= L.year;
    const pay = Math.min(r.balance, Math.max(50, Math.round(r.balance / Math.max(1, r.remaining))));
    r.balance -= pay; r.remaining = Math.max(0, r.remaining - 1); r.lastPaidYear = L.year; paid += pay;
  }
  return Math.min(balance, paid);
}

// 담보 잔액은 물건마다 보존한다. 옛 저장은 물건 가치 비례로 한 번 배분한다.
export function syncMortgages(L) {
  const properties = [...(L.rentals || []).filter(r => r.kind === 'home' && !r.sub), ...(L.home.owned ? [L.home] : [])];
  const total = L.money.loans.mortgage || 0;
  if (!properties.length) return;
  const tracked = properties.reduce((n, r) => n + (r.mortgageBalance || 0), 0);
  if (properties.some(r => r.mortgageBalance == null)) {
    let left = total; const value = properties.reduce((n, r) => n + (r.value || 0), 0);
    properties.forEach((r, i) => { r.mortgageBalance = i === properties.length - 1 ? left : Math.min(left, Math.round(total * (value ? r.value / value : 1 / properties.length))); left -= r.mortgageBalance; });
  } else if (tracked > total && tracked > 0) {
    let left = total;
    properties.forEach((r, i) => { r.mortgageBalance = i === properties.length - 1 ? left : Math.min(left, Math.round(r.mortgageBalance * total / tracked)); left -= r.mortgageBalance; });
  }
}
