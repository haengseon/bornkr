// QA 로그(QA 리뷰 #10): 같은 시드·선택 경로로 생애를 재현하고 발생 사건 ID·연도를 대조하기 위한 개발자용 순수 함수.
// 개인 입력·표시 문구는 담지 않는다(시드, 선택, 사건 ID·연도·나이만). replay(seed, trace.choices)로 재현된다.
export function qaTrace(L) {
  return {
    v: 1,
    seed: L.seed,
    birthYear: L.birth.year,
    endAge: L.death?.age ?? L.age, endYear: L.death?.year ?? L.year, alive: !!L.alive,
    choices: L.choices.map(c => ({ year: c.year, age: c.age, eventId: c.eventId, option: c.option, auto: !!c.auto, ...(c.forced && { forced: true }) })),
    events: L.log.filter(e => e.id && e.kind !== 'compare').map(e => ({ year: e.year, age: e.age, kind: e.kind, id: e.id, ...(e.quiet && { quiet: true }), ...(e.scenario && { scenario: true }) })),
    decisions: (L.decisions || []).map(d => ({ year: d.year, eventId: d.eventId, option: d.option, result: d.result, execution: d.execution })),
  };
}
