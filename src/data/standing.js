// '통계 속 내 위치'(engine/standing.js) 분포 표 [R19]. 표 형식은 다른 src/data 표와 같다({ src, year, kind, note, values }); index.js에는 넣지 않는다.
// 순자산 분위점·연령대 평균/중앙값·시대 지수는 wealth.js(NET_WORTH_BOUNDS·NET_WORTH_BY_AGE·ERA_ASSET_INDEX)를 그대로 쓴다.

export const WAGE_JOB_CDF = {
  src: 'R04.S6', year: 2024, kind: 'measured',
  note: '임금근로일자리 월 소득(보수) 구간 누적 비중(%, 키 = 구간 상한 만원/월, 2024.12 명목, 세전, 일자리 단위) [R04 §5, 국가데이터처 「2024년 임금근로일자리 소득(보수) 결과」 2026-02-23]. 구간 비중 85만 미만 12.2 · 85~150 8.4 · 150~250 20.9 · 250~350 20.1 · 350~450 11.7 · 450~550 7.8 · 550~650 5.3 · 650~800 5.6 · 800~1,000 3.7 · 1,000+ 4.3. 평균 375·중위 288. 1,000만 원 위는 800~1,000 구간 비(8.0→4.3%)로 맞춘 파레토 꼬리(엔진 계산).',
  values: { 85: 12.2, 150: 20.6, 250: 41.5, 350: 61.6, 450: 73.3, 550: 81.1, 650: 86.4, 800: 92.0, 1000: 95.7 },
};

export const NET_WORTH_NONPOS = {
  src: 'R05.S2', year: 2025, kind: 'estimated',
  note: '순자산 0 이하 가구 비중(0~1). 공표 표에 음수 구간이 따로 없어 추정: P10 = 1,210만 원, 하위 10% 평균 −771만 원(보도 인용, R05 §3.3) → 하위 10% 안에서 약 절반이 0 이하로 보고 .05. 엔진은 0 이하를 이 비중 안에서 부채가 클수록 아래로 놓는다.',
  values: 0.05,
};

export const HOUSING_SPREAD = {
  src: 'R05.S6', year: 2025, kind: 'estimated',
  note: '같은 시군구 안 주택 가치·보증금의 로그 표준편차(σ). 시군구 시세(84㎡ 환산 평균, housing-regional.js)는 평균값이라 같은 동네 안의 면적·연식·유형 차이를 이 폭으로 펼친다. 근거: 아파트 평균 대비 단독·연립·소형 면적 가격 차이(대략 0.5~2배) → σ ≈ .45로 가정.',
  values: 0.45,
};

export const SIDO_HH_SHARE = {
  src: 'R10.S1', year: 2020, kind: 'estimated',
  note: '시도별 인구 비중(%, 현재 시도 경계, 합 ≈ 100)을 가구 비중 근사로 사용. 주민등록·센서스 인구 비중의 근사값(1990 서울 24%·경기 14% → 2020 서울 19%·경기 26%, 수도권 인구 2019 50% 돌파 보도와 일치)이며 시도 원표(KOSIS 인구총조사 시도별 일반가구)는 조사 한도 내 미대조 → 추정. 사이 연도 보간, 2020 이후 2020 값. 시군구 안 배분은 region-share.js sigunguShare.',
  values: {
    1990: { seoul: 24.4, busan: 8.8, daegu: 5.2, incheon: 4.2, gwangju: 2.6, daejeon: 2.4, ulsan: 1.6, sejong: 0.2, gyeonggi: 14.1, gangwon: 3.6, chungbuk: 3.2, chungnam: 4.5, jeonbuk: 4.7, jeonnam: 5.8, gyeongbuk: 6.5, gyeongnam: 7.0, jeju: 1.2 },
    2000: { seoul: 21.4, busan: 8.0, daegu: 5.4, incheon: 5.4, gwangju: 2.9, daejeon: 2.9, ulsan: 2.2, sejong: 0.2, gyeonggi: 19.6, gangwon: 3.2, chungbuk: 3.2, chungnam: 3.8, jeonbuk: 4.1, jeonnam: 4.4, gyeongbuk: 5.8, gyeongnam: 6.6, jeju: 1.1 },
    2020: { seoul: 18.8, busan: 6.5, daegu: 4.6, incheon: 5.7, gwangju: 2.8, daejeon: 2.8, ulsan: 2.2, sejong: 0.7, gyeonggi: 26.0, gangwon: 3.0, chungbuk: 3.1, chungnam: 4.1, jeonbuk: 3.5, jeonnam: 3.5, gyeongbuk: 5.1, gyeongnam: 6.4, jeju: 1.3 },
  },
};

export const HOUSING_ANCHOR = {
  src: 'R05.S2', year: 2025, kind: 'estimated',
  note: '2025 주거 가치 분포의 수준 앵커(만원, 2025): 전세 가구 평균 보증금 21,797 · 보증부월세 등 가구 평균 약 3,610(가계금융복지조사 2025.3, R05 §10.2) · 자가 가구 집값 중앙값 ≈ 자가가구 PIR 6.3배(2024년도 주거실태조사, 2025-11-16 공표) × 가구소득 중앙값 5,800 = 36,500(추정). 시군구 84㎡ 시세 혼합분포를 이 값에 맞춰 배율 조정(실제 거주 주택은 84㎡ 아파트보다 작거나 다른 유형이 많음), 같은 배율을 모든 연도에 쓴다.',
  values: { ownMedian: 36500, jeonseMean: 21797, monthlyMean: 3610 },
};
