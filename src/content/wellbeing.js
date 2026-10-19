// 게임용 지원 행동. 도움 요청·지원 동의·실제 지원은 서로 다른 단계다.
export const SUPPORT_EVENT = 'sys.wellbeing.support';
export const SUPPORT_OPTIONS = [
  { id: 'rest', label: '짧게 쉬는 일정을 잡는다', personality: { weights: {} } },
  { id: 'contact', label: '가족에게 도움을 청한다', personality: { weights: {} } },
  { id: 'keep', label: '당장은 바꾸지 않는다', personality: { weights: {} } },
];
