// IDs verified using KOSIS statisticsSearch/getMeta, 2026-10-16.
// Annual series preferred. Quarterly series are kept as quarters, never labelled annual.
export const CATALOG = [
  ['vital-national', '101', 'DT_1B8000F', '출생·사망·혼인·이혼 추이', '출생연도 가중치와 인구동태의 시대별 기준'],
  ['vital-regional', '101', 'DT_1B8000H', '시도별 인구동태', '출생지역·출산·혼인·이혼의 지역 차이'],
  ['life-table', '101', 'DT_1B42', '완전생명표', '성·1세별 사망확률과 기대여명', { itemPattern: '사망확률|기대여명' }],
  ['death-causes', '101', 'DT_1B34E01', '성·연령별 사망원인', '사인별 실제 사망자수와 사망률; 암 세부 분류 포함'],
  ['first-marriage-age', '101', 'DT_1B83A05', '평균 초혼연령', '성·시도·시대별 혼인 연령'],
  ['divorce-duration', '101', 'DT_1B85006', '혼인지속기간별 이혼', '혼인기간에 따른 가족 변화의 통계 기준'],
  ['employment-age-sex', '101', 'DT_1DA7012S', '성·연령별 경제활동', '고용·실업·비경제활동과 연령별 취업 확률의 기준'],
  ['occupation-sex', '101', 'DT_1DA7E27S', '성·직업별 취업자', '직업 대분류 분포; 직업분류 개정 주석 확인 필요'],
  ['wage-distribution', '101', 'DT_1EP_2021', '임금소득 평균·중위·분포', '급여 수준과 소득 경계값'],
  ['wage-age', '101', 'DT_1EP_2006', '연령대별 임금소득', '연령에 따른 급여 변화'],
  ['wage-sex', '101', 'DT_1EP_2005', '성별 임금소득', '성별 급여 분포의 기준'],
  ['wage-firm-size', '101', 'DT_1EP_2001', '기업규모별 임금소득', '사업장 규모별 급여 차이'],
  ['wage-tenure', '101', 'DT_1EP_2007', '근속기간별 임금소득', '근속과 급여 변화'],
  ['household-assets-debt', '101', 'DT_1HDAAD01', '가구특성별 자산·부채', '자산·부채 평균·중앙값과 보유율'],
  ['household-age-finance', '101', 'DT_1HDAAA06', '가구주 연령별 재무상태', '연령별 자산·부채·소득의 기준'],
  ['household-income-quintile', '101', 'DT_1HDAAB02', '가구특성별 소득분위', '출생 가구 소득과 세대·가구 구조 차이'],
  ['household-budget', '101', 'DT_1L9U107', '소득구간별 가계수지', '생활비·소비·저축; 분기 자료는 분기 그대로 저장'],
  ['housing-tenure', '116', 'DT_MLTM_6908', '지역·소득별 주택 점유형태', '자가·전세·월세 분포의 기준'],
  ['housing-supply', '116', 'DT_MLTM_2100', '주택보급률', '주거 여건과 지역별 주택·가구 수'],
  ['private-education-income', '101', 'DT_1PE209', '가구 소득별 사교육비', '가구 형편과 교육비 부담'],
  ['private-education-region', '101', 'DT_1PE202', '지역별 사교육비', '교육 환경의 지역 차이'],
  ['consumer-prices', '101', 'DT_1J22003', '소비자물가지수', '연도별 화폐가치; 지수 기준연도 확인 필요'],
  ['migration-age-sex', '101', 'DT_1B26001', '성·연령별 인구이동', '시도별 전입·전출과 생애 이사 흐름', { regionalOnly: true }],
  ['smoking-age-sex', '177', 'DT_11702_N001', '현재흡연율 추이', '성·연령별 흡연 습관의 통계 기준'],
  ['hypertension', '177', 'DT_11702_N105', '고혈압 유병률 추이', '진단·건강 상태; 유병률을 연간 발병률로 쓰지 않기'],
  ['diabetes', '177', 'DT_11702_N102', '당뇨병 유병률 추이', '진단·건강 상태; 조사 정의와 연령 범위 보존'],
].map(([id, orgId, tblId, title, purpose, extra = {}]) => ({ id, orgId, tblId, title, purpose, ...extra }));

export const REGIONAL_NAMES = /^(전국|서울특별시|부산광역시|대구광역시|인천광역시|광주광역시|대전광역시|울산광역시|세종특별자치시|경기도|강원도|강원특별자치도|충청북도|충청남도|전라북도|전북특별자치도|전라남도|경상북도|경상남도|제주도|제주특별자치도|전남광주통합특별시)$/;
