// 게임용 지원 행동. 도움 요청·지원 동의·실제 지원은 서로 다른 단계다.
export const SUPPORT_EVENT = 'sys.wellbeing.support';
export const SUPPORT_OPTIONS = [
  { id: 'rest', label: '남는 시간에 짧게 쉬는 일정을 잡는다', hint: '다음 해에도 하루 15분을 확보할 수 있을 때 회복을 기록한다.', personality: { weights: {} } },
  { id: 'contact', label: '연락 가능한 가족에게 도움을 요청한다', hint: '요청을 전달한다. 상대의 동의와 실제 지원은 별도로 확인한다.', personality: { weights: {} } },
  { id: 'keep', label: '당장은 생활을 바꾸지 않는다', hint: '새로운 지원이나 휴식을 받은 것으로 처리하지 않는다.', personality: { weights: {} } },
];
