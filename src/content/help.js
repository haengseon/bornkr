// 콘텐츠 D: 도움 자원(ARCHITECTURE §18.4). R07 §12(2026-10-14 기준) 확인된 값만 옮긴다.
// hours: 공식 문서로 확인된 운영시간만, 미확인은 null(UI는 번호만 표시). 번호는 선택 가능한 텍스트 + 복사 버튼(§17).
// 1393은 2024-01-01 폐지(109로 통합) — 넣지 않는다. 129의 자살상담 기능도 109로 이전됐다.
export const HELP_LINES = [
  { id: '109', name: '자살예방상담전화', number: '109', org: '보건복지부', hours: '24시간 365일', url: null, topics: ['selfharm', 'death', 'disaster'] },
  { id: '1577-0199', name: '정신건강위기상담전화', number: '1577-0199', org: '보건복지부·지역 정신건강복지센터', hours: null, url: null, topics: ['illness', 'selfharm', 'death'] },
  { id: '1388', name: '청소년상담전화', number: '1388', org: '성평등가족부', hours: null, url: null, topics: ['violence', 'abuse', 'youth'] },
  { id: '1366', name: '여성긴급전화', number: '1366', org: '성평등가족부·한국여성인권진흥원', hours: '24시간 365일', url: 'https://women1366.kr', topics: ['sexual', 'violence', 'abuse'] },
  { id: '117', name: '학교폭력 신고·상담', number: '117', org: '경찰청', hours: null, url: null, topics: ['violence', 'youth'] },
  { id: '1577-1389', name: '노인학대 신고전화', number: '1577-1389', org: '노인보호전문기관', hours: '24시간 365일', url: null, topics: ['elder', 'abuse'] },
  { id: '129', name: '보건복지상담센터', number: '129', org: '보건복지부', hours: '평일 09:00~18:00, 긴급지원상담 24시간', url: null, topics: ['welfare', 'elder', 'illness'] },
  { id: '112', name: '경찰 긴급신고', number: '112', org: '경찰청', hours: null, url: null, topics: ['violence', 'abuse', 'sexual', 'emergency'] },
  { id: '119', name: '소방·구급·구조', number: '119', org: '소방청', hours: null, url: null, topics: ['disaster', 'emergency'] },
  { id: '1588-9191', name: '생명의전화', number: '1588-9191', org: '사회복지법인 생명의전화', hours: null, url: 'https://lifeline.or.kr', topics: ['disaster', 'selfharm', 'illness'] },
];

// 민감 분류 → HELP_LINES id 목록(앞쪽이 먼저 보인다)
export const HELP_BY_SENSITIVE = {
  violence: ['117', '1388'],
  abuse: ['112', '1388'],
  sexual: ['1366', '112'],
  illness: ['129', '1577-0199'], // 리드: 신체 질병·부상에도 맞게 복지·의료비 상담(129) 우선, 자살예방(109)은 selfharm·death만
  death: ['109', '1577-0199'],
  selfharm: ['109', '1577-0199'],
  disaster: ['1588-9191'],
  elder: ['1577-1389'],
};
