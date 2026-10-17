// 구조 동작의 실제 자산 이동 기록. 읽기/중첩 호출을 소비·소득으로 중복 합산하지 않는다.
const DEPTH = new WeakMap();
const snapshot = L => ({
  financial: L.money?.assets ?? 0, debt: L.money?.debt ?? 0,
  deposit: L.home?.deposit ?? 0, property: (L.home?.owned ? L.home.value || 0 : 0) + (L.rentals || []).reduce((n, r) => n + (r.value || 0), 0),
  household: L.household?.netWorth ?? 0, pension: L.pension2?.balance ?? 0,
});

const LABEL = { gain: '수입·이전', spend: '지출', borrow: '차입', repay: '원금 상환',
  sellRentedHome: '임대 주택 매각', move: '주거 이동', buyHome: '주택 구입', sellHome: '주택 매각', marry: '결혼 관련 자금',
  divorce: '가구 분리', startBusiness: '사업 시작', closeBusiness: '사업 정리',
  endJob: '고용 종료 정산', loseJob: '고용 종료 정산', retire: '은퇴 정산' };

export function withTransactionJournal(L, act, ctx) {
  if ((L.modelVersion ?? 1) < 2 || !L.dailyLife) return act;
  for (const [operation, original] of Object.entries(act)) {
    if (typeof original !== 'function') continue;
    act[operation] = (...args) => {
      const depth = DEPTH.get(L) || 0;
      const before = depth === 0 ? snapshot(L) : null;
      DEPTH.set(L, depth + 1);
      let succeeded = false;
      try { const result = original(...args); succeeded = true; return result; }
      finally {
        DEPTH.set(L, depth);
        if (before && succeeded) {
          const after = snapshot(L);
          const delta = Object.fromEntries(Object.keys(before).map(key => [key, after[key] - before[key]]));
          if (Object.values(delta).some(value => value !== 0)) {
            const rows = L.dailyLife.transactions ||= [];
            const choice = L.choices?.at(-1);
            rows.push({ id: `transaction.${L.year}.${rows.length}`, year: L.year, age: L.age,
              operation, label: LABEL[operation] || '생활 상태 변경에 따른 자금 이동',
              sourceEventId: ctx.sourceEventId || (choice?.year === L.year ? choice.eventId : null),
              choiceId: ctx.sourceEventId && choice?.eventId === ctx.sourceEventId ? choice.option : null,
              currencyBaseYear: 2025, kind: 'executed-transfer', delta });
          }
        }
      }
    };
  }
  return act;
}
