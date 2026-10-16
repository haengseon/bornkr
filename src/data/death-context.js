// 통계청 「2024년 사망원인통계 결과」 41쪽. 전국·남녀 전체 사망자 구성비.
// 게임 속 사망 연도의 비율이나 개인의 사망 확률이 아니다. 엔진의 합성 CAUSE_SHARE와 분리한다.
export const DEATH_CONTEXT = {
  year: 2024, total: 358569,
  source: '통계청, 2024년 사망원인통계 결과, 표 4',
  url: 'https://sri.kostat.go.kr/boardDownload.es?bid=218&list_no=438787&seq=4',
  counts: { cancer: 88933, heart: 33539, pneumonia: 30103, stroke: 24612, alzheimer: 12223, diabetes: 11064, sepsis: 7730, hypertension: 8229, liver: 7787, transport: 3451, fall: 2856, perinatal: 612, covid: 3208 },
};
export function deathContext(cause) {
  const count = DEATH_CONTEXT.counts[cause];
  if (!count) return null; // 기타·혼합 분류를 억지로 통계 항목에 맞추지 않는다.
  const labels = { cancer: '암 전체', heart: '심장 질환', pneumonia: '폐렴', stroke: '뇌혈관 질환', alzheimer: '알츠하이머병', diabetes: '당뇨병', sepsis: '패혈증', hypertension: '고혈압성 질환', liver: '간 질환', transport: '운수 사고', fall: '추락 사고', perinatal: '출생전후기 질환', covid: '코로나19' };
  return { ...DEATH_CONTEXT, counts: undefined, label: labels[cause], count, percent: Math.round(count / DEATH_CONTEXT.total * 1000) / 10 };
}
