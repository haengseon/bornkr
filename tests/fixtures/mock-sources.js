// 가짜 출처 레지스트리(ARCHITECTURE §5 형식). 실파일이 없을 때만 E2E가 쓴다.
export const SOURCES = {
  'R01.S1': { org: '통계청', title: '인구동향조사', year: 2025, url: 'https://kosis.kr', kind: 'measured' },
  'R02.S2': { org: '통계청', title: '생명표', year: 2024, url: 'https://kosis.kr', kind: 'measured' },
  'R03.S10': { org: '교육부', title: '교육기본통계', year: 2024, kind: 'measured' },
  'R04.S2': { org: '통계청', title: '경제활동인구조사', year: 2025, kind: 'measured' },
  'R05.S2': { org: '통계청', title: '가계금융복지조사', year: 2024, kind: 'measured' },
  'R07.S3': { org: '통계청', title: '장래인구추계', year: 2023, kind: 'projected' },
  'GDD.E': { org: 'GDD', title: '게임 추정값', year: 2026, kind: 'estimated' },
};
