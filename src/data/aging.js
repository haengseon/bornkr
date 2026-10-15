// 노후·연금 표 (GDD §5.8 / §14.2). 금액 만원/월, 비율 0~1. 계산 로직 없음.

export const PENSION_START_AGE = {
  src: 'R07.S07', year: 2026, kind: 'measured',
  note: '노령연금 수급개시 연령(세), 키 = 출생연도(적용 시작 출생연도 ~ 다음 구간 직전): ≤1952 60 / 1953~56 61 / 1957~60 62 / 1961~64 63 / 1965~68 64 / 1969+ 65 [R07 §1.3, 국민연금법 부칙]. 2025 개혁에서 불변. 계단 끝점을 모두 적어 선형 보간과 계단 조회가 같은 값을 낸다.',
  values: { 1900: 60, 1952: 60, 1953: 61, 1956: 61, 1957: 62, 1960: 62, 1961: 63, 1964: 63, 1965: 64, 1968: 64, 1969: 65 },
};

export const PENSION_BY_YEARS = {
  src: 'R07.S28', year: 2024, kind: 'measured',
  note: '2024 65세 이상 국민연금 수급자 월평균 수급액(만원/월)을 가입기간 구간(시작 년수)별로 [R07 `nps_65plus_avg_monthly_by_contribution_years_2024`, 2024년 연금통계]: <10년 21.8 / 10~20 44.2 / 20~30 100.5 / 30+ 154.9. otherSurvivor = 유족·기타 30.3. share = 수급자 비중(.186/.508/.160/.017, 기타 .129), 평균 가입기간 14.2년. GDD §5.8 식: × (.7 + .6·평생 INCpos/100).',
  share: { 0: 0.186, 10: 0.508, 20: 0.160, 30: 0.017, otherSurvivor: 0.129 },
  otherSurvivor: 30.3,
  values: { 0: 21.8, 10: 44.2, 20: 100.5, 30: 154.9 },
};

export const PENSION_CONTRIB_P = {
  src: 'R04.S4', year: 2025, kind: 'estimated',
  note: 'GDD §5.4: 연금 가입(보험료 납부) 연 확률 — 고용형태(regular 정규 / nonregular 비정규 / self 자영) → 연도. GDD 명시: 정규 1988~94 .5(대기업) · 1995~98 .6 · 1999+ .95, 비정규 1999+ .37, 자영 1999+ .60. 근거: 국민연금 가입률 정규 87.9%·비정규 37.1% [R04 §3-1], 18~59세 가입률 .811 [R07 S28]. GDD가 정하지 않은 1988~98 비정규(= 정규 × .37/.95)와 자영(1999 이전 0; 농어촌 1995·도시 자영 1999 확대)은 추정 연장.',
  values: {
    regular: { 1988: 0.5, 1994: 0.5, 1995: 0.6, 1998: 0.6, 1999: 0.95 },
    nonregular: { 1988: 0.195, 1994: 0.195, 1995: 0.234, 1998: 0.234, 1999: 0.37 },
    self: { 1988: 0, 1998: 0, 1999: 0.60 },
  },
};

export const BASIC_PENSION = {
  src: 'R07.S10', year: 2026, kind: 'measured',
  note: '기초연금 기준연금액(단독가구 최대, 만원/월). 2022 30.75 · 2023 32.318 · 2024 33.481 · 2025 34.251 · 2026 34.970 실측(전년도 물가 연동) [R07 §2.2]. 2014~2021 = 20 → 30 선형 보간(GDD §5.8 추정, 도입 2014 20만원), 2008~13 = 20 연장(엔진이 기초노령연금 ×.5 적용). 2027+ 물가연동은 엔진(CPI). 선정기준액 단독 2026 247만원.',
  values: { 2008: 20, 2014: 20, 2021: 30, 2022: 30.75, 2023: 32.318, 2024: 33.481, 2025: 34.251, 2026: 34.970 },
};

export const LONELY = {
  src: 'R07.S13', year: 2025, kind: 'measured',
  note: '외로움 경험 비율(자주+가끔) 연령대별, 2025 사회조사(2025 신규 문항, 시계열 없음) [R07 `loneliness_by_age`]. 키 = 연령대 시작 나이(13 = 13~19). age65plus = 65세 이상 전체 .434(65~69는 60대 값 사용, 80+ .521). 전체 .382. GDD §5.8: 고립 = chance(LONELY[age] × LONELY_MOD).',
  age65plus: 0.434,
  values: { 13: 0.303, 20: 0.322, 30: 0.338, 40: 0.388, 50: 0.417, 60: 0.395, 70: 0.417, 80: 0.521 },
};

export const LONELY_MOD = {
  src: 'R07.S13', year: 2025, kind: 'measured',
  note: '외로움 배수 = 집단 외로움 비율 ÷ .434(65+ 기준, GDD §5.8: 사별 .589/.434 · 이혼 .571/.434 · 소득 100만 미만 .576/.434). rates = 원 비율 [R07 `loneliness_modifiers_2025`]. 키: widowed 사별 / divorced 이혼 / married 유배우 / never_married 미혼 / income_lt_1m 월소득 100만 미만 / income_ge_6m 600만+ / life_dissatisfied 삶 불만족 / life_satisfied 삶 만족.',
  rates: { widowed: 0.589, divorced: 0.571, married: 0.355, never_married: 0.356, income_lt_1m: 0.576, income_ge_6m: 0.330, life_dissatisfied: 0.637, life_satisfied: 0.275 },
  values: { widowed: 1.357, divorced: 1.316, married: 0.818, never_married: 0.820, income_lt_1m: 1.327, income_ge_6m: 0.760, life_dissatisfied: 1.468, life_satisfied: 0.634 },
};

export const ELDER_EMPLOY_65 = {
  src: 'R07.S12', year: 2025, kind: 'measured',
  note: '65세 이상 고용률 2015~2025 [R07 `elderly_employment_rate_65plus`, 경제활동인구조사]. QA 대조용(R04.S2 EMPLOYMENT_RATE 65+ 2025 .395와 일치). 2025 실업률 .030.',
  values: { 2015: 0.304, 2016: 0.306, 2017: 0.306, 2018: 0.313, 2019: 0.329, 2020: 0.341, 2021: 0.349, 2022: 0.362, 2023: 0.373, 2024: 0.382, 2025: 0.395 },
};

export const SENIOR_JOB = {
  src: 'R07.S19', year: 2026, kind: 'measured',
  note: '노인일자리 및 사회활동 지원사업 [R07 `senior_job_program_2026`]. slots = 연도별 일자리 수(2025 1,098,000 · 2026 1,152,000), monthly = 공익활동형 월 활동비 29만원, months = 11개월. competency = 역량활용형 월 76.1만원·10개월. 공익활동형 709,000·역량활용형 197,000 개(2026). GDD §5.8: 65+ & wealth<40 & year≥2004 p .15 → 연 29만×11.',
  competency: { monthly: 76.1, months: 10 },
  values: { slots: { 2025: 1098000, 2026: 1152000 }, monthly: 29, months: 11 },
};
