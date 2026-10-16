// 출처 레지스트리 (GDD §14.1). 키 = `R0x.Sy`(리서치 문서 R0x의 출처 y, 문서 표기 그대로) 또는 `GDD.E`.
// 항목: { org, title, year, url, kind } — kind: 'official'(공식 통계·기관 공표) | 'secondary'(보도·위키·학술 인용 2차) | 'game'(게임 디자인 추정).
// url은 리서치 문서에 적힌 것. 문서가 URL을 주지 않은 항목은 기관 누리집/지표 페이지(★ 표시 주석)로 대체 — docs/impl/data-notes.md '요청' 참조.

const _kosis = id => `https://kosis.kr/statHtml/statHtml.do?orgId=101&tblId=${id}`;
const _enara = id => `https://www.index.go.kr/unify/idx-info.do?idxCd=${id}`;

export const SOURCES = {
  'GDD.E': { org: '《태어나보니 대한민국》 게임 설계', title: '통계 표가 없는 값은 게임 설계 단계에서 둔 추정(가정)', year: 2026, url: 'docs/design/GDD.md', kind: 'game' },

  // ── R01 출생·인구·가구 (GDD §14.1 지정) ──
  'R01.S1': { org: '국가데이터처', title: '2025년 출생 통계(확정) 보도자료(2026-08-26)', year: 2026, url: 'https://mods.go.kr/board.es?mid=a10301010000&bid=204&act=view&list_no=446625', kind: 'official' },
  'R01.S2': { org: '세계은행(UN WPP 기반)', title: 'WDI 출생률·합계출산율·총인구 — 1960년대 출생아·TFR 추정', year: 2026, url: 'https://data.worldbank.org/indicator/SP.DYN.TFRT.IN?locations=KR', kind: 'official' },
  'R01.S3': { org: '국가데이터처', title: 'KOSIS 시도별 인구동태·합계출산율', year: 2026, url: _kosis('DT_1B8000H'), kind: 'official' },
  'R01.S4': { org: '국가데이터처', title: '장래인구추계: 2022~2072 (2023-12-14 공표)', year: 2023, url: _kosis('DT_1BPA201'), kind: 'official' },
  // R01.S5·S6은 R01에 출처 ID 목록이 없어 데이터 엔지니어가 부여(§10 장애·§9 보육 본문 출처)
  'R01.S5': { org: '보건복지부', title: '장애인 등록 현황(2024.12월말 기준) — 연령별 등록장애인', year: 2025, url: 'https://www.mohw.go.kr/board.es?mid=a10412000000&bid=0020&act=view&list_no=1485372&tag=&nPage=1', kind: 'official' },
  'R01.S6': { org: '보건복지부·교육부', title: '보육통계 — 어린이집 이용률·유치원 취원율', year: 2026, url: 'https://www.index.go.kr/unity/potal/indicator/IndexInfo.do?cdNo=260&clasCd=12&idxCd=H0020&upCd=9', kind: 'official' },

  // ── R02 수명·사망원인·건강 ──
  'R02.S1': { org: '국가데이터처', title: '2024년 생명표 작성 결과(보도자료, 2025-12-03)', year: 2025, url: 'https://mods.go.kr/board.es?mid=a10301010000&bid=208&act=view&list_no=439533', kind: 'official' },
  'R02.S2': { org: '국가데이터처', title: 'KOSIS 완전생명표(1세별) 1970~2024', year: 2025, url: 'https://kosis.kr/statHtml/statHtml.do?orgId=101&tblId=DT_1B42', kind: 'official' },
  'R02.S3': { org: '국가데이터처', title: '장래 기대수명(장래인구추계 2022~2072)', year: 2023, url: 'https://kosis.kr/statHtml/statHtml.do?orgId=101&tblId=DT_1BPA201', kind: 'official' },
  'R02.S4': { org: '보건복지부·국가데이터처', title: 'e-나라지표 기대수명 및 유병기간 제외 기대수명', year: 2026, url: 'https://www.index.go.kr/unify/idx-info.do?idxCd=2758', kind: 'official' },
  'R02.S5': { org: '정책브리핑(korea.kr)', title: '「2024년 생명표」 정책뉴스(보도자료 전재)', year: 2025, url: 'https://www.korea.kr/news/policyNewsView.do?newsId=156732935', kind: 'secondary' },
  'R02.S6': { org: '국가데이터처', title: '사망원인통계(사망원인 104항목·성·5세 연령별, 2025년분 2026-09-22 공표)', year: 2026, url: _kosis('DT_1B34E01'), kind: 'official' },
  'R02.S7': { org: '국가데이터처', title: '사망원인통계 10대 사인·공표 사인명(e-나라지표 인용)', year: 2026, url: 'https://www.index.go.kr', kind: 'official' }, // ★ R02는 개별 URL 미기재
  'R02.S10': { org: '국가데이터처', title: '시도별 간이생명표 2023(3년 주기 2005~2023)', year: 2024, url: 'https://kosis.kr', kind: 'official' }, // ★
  'R02.S11': { org: '한국건강증진개발원(KHEPI)', title: '소득수준별·지역별 건강수명(건강보험 소득분위 기반, 2008~2020·2030 추계)', year: 2024, url: 'https://www.khepi.or.kr', kind: 'official' }, // ★
  'R02.S12': { org: '질병관리청', title: '국민건강영양조사 2024(만성질환 유병·흡연·음주·건강 인식)', year: 2025, url: _kosis('DT_11702_N105'), kind: 'official' },
  'R02.S13': { org: '보건복지부', title: '2021년 정신건강실태조사(우울장애 유병률)', year: 2022, url: _enara(1441), kind: 'official' },
  'R02.S14': { org: '보건복지부·중앙암등록본부', title: '국가암등록통계 2023 발생·생존율', year: 2025, url: _kosis('DT_117N_A00023'), kind: 'official' },
  'R02.S15': { org: '통계청', title: '김부연, 「한국인의 사망원인 구조 변동추이」(1983~2003 연령별 사망 구성비 표1·표2)', year: 2004, url: 'https://mods.go.kr/boardDownload.es?bid=11912&list_no=382039&seq=1', kind: 'official' },
  'R02.S16': { org: 'J Korean Med Sci', title: 'Lim·Ha·Song, Trends in the Leading Causes of Death in Korea, 1983-2012 (Table 1 연령표준화 사망률)', year: 2014, url: 'https://doi.org/10.3346/jkms.2014.29.12.1597', kind: 'secondary' },

  // ── R03 교육 ──
  'R03.S1': { org: '국가데이터처·교육부', title: '2025년 초중고 사교육비조사(2026-03-12 공표) 및 2007~2025 시계열', year: 2026, url: 'https://mods.go.kr', kind: 'official' }, // ★ R03는 개별 URL 미기재
  'R03.S6': { org: '교육부·한국교육개발원', title: '2025년 교육기본통계(고교 유형별 학생 수, 2025-08-28)', year: 2025, url: 'https://kess.kedi.re.kr', kind: 'official' },
  'R03.S8': { org: '한국청소년정책연구원(NYPI)·교육부·KEDI', title: '청소년통계: 고교 유형별·성별 대학 진학률', year: 2025, url: 'https://www.nypi.re.kr', kind: 'official' },
  'R03.S9': { org: '교육부·한국교육개발원', title: '2025년 직업계고 졸업자 취업통계(2025-11-25)', year: 2025, url: 'https://kess.kedi.re.kr', kind: 'official' }, // ★ R03는 개별 URL 미기재
  'R03.S10': { org: '한국교육개발원(KEDI)', title: '교육통계분석자료집 — 고교 졸업자의 고등교육기관 진학률', year: 2025, url: _enara(1520), kind: 'official' },
  'R03.S11': { org: '교육부·한국교육과정평가원', title: '수능 응시원서 접수 결과 보도자료(학년도별, 졸업생 비율)', year: 2026, url: 'https://www.korea.kr', kind: 'official' },
  'R03.S12': { org: '교육부·KEDI(NYPI 재게재)', title: '교육기본통계 학업중단율(2010~2025학년도)', year: 2026, url: 'https://www.ypec.re.kr', kind: 'official' },
  'R03.S13': { org: '교육부', title: '2026년 1차 학교폭력 실태조사 결과(2026-09-09) 및 과거 판', year: 2026, url: 'https://www.moe.go.kr', kind: 'official' },
  'R03.S16': { org: '한국청소년정책연구원(NYPI)·교육부·질병관리청', title: '청소년통계 — 청소년건강행태조사(2005~2024)·청소년이 고민을 털어놓는 대상', year: 2025, url: 'https://www.nypi.re.kr', kind: 'official' }, // ★
  'R03.S20': { org: '교육부·한국대학교육협의회', title: '4월 대학정보공시 — 대학 평균 등록금(2022~2026학년도)', year: 2026, url: 'https://www.academyinfo.go.kr', kind: 'official' },
  'R03.S21': { org: '교육부·한국장학재단', title: '8월 대학정보공시 — 장학금·학자금 대출', year: 2025, url: _enara(1553), kind: 'official' },
  'R03.S22': { org: '국가데이터처', title: '2026년 5월 경제활동인구조사 청년층 부가조사(2026-07-23)', year: 2026, url: 'https://mods.go.kr', kind: 'official' },
  'R03.S23': { org: '교육부·KEDI', title: '2024년도 고등교육기관 졸업자 취업통계(2025-12-30)', year: 2025, url: 'https://kess.kedi.re.kr', kind: 'official' },

  // ── R04 고용·노동·소득 (GDD §14.1 지정) ──
  'R04.S1': { org: '국가데이터처', title: '2025년 12월 및 연간 고용동향(2026-01-14)', year: 2026, url: 'https://mods.go.kr/board.es?mid=a10301010000&bid=210&act=view&list_no=443017', kind: 'official' },
  'R04.S2': { org: '국가데이터처', title: 'KOSIS 성·연령별 경제활동인구', year: 2026, url: 'https://kosis.kr/statHtml/statHtml.do?orgId=101&tblId=DT_1DA7012S', kind: 'official' },
  'R04.S3': { org: '국가데이터처', title: '2026년 5월 경제활동인구조사 청년층 부가조사', year: 2026, url: 'https://mods.go.kr', kind: 'official' },
  'R04.S4': { org: '국가데이터처', title: '2025년 8월 경제활동인구조사 근로형태별 부가조사(2025-10-22)', year: 2025, url: 'https://mods.go.kr/board.es?mid=a10301010000&bid=210&act=view&list_no=438874', kind: 'official' },
  'R04.S5': { org: '고용노동부', title: '2025년 6월 기준 고용형태별근로실태조사(2026-04-30)', year: 2026, url: 'https://eiec.kdi.re.kr/policy/materialView.do?num=280485', kind: 'official' },
  'R04.S6': { org: '국가데이터처', title: '2024년 임금근로일자리 소득(보수) 결과(2026-02-23)', year: 2026, url: 'https://eiec.kdi.re.kr/policy/materialView.do?num=277139', kind: 'official' },
  'R04.S7': { org: '국가데이터처', title: '2026년 5월 경제활동인구조사 고령층 부가조사(2026-08-05)', year: 2026, url: 'https://mods.go.kr/board.es?mid=a10301010000&bid=210&act=view&list_no=446335', kind: 'official' },
  'R04.S8': { org: '국가데이터처', title: 'e-나라지표 고령자 고용동향(55~64세 고용률·실업률 시계열)', year: 2026, url: 'https://www.index.go.kr', kind: 'official' },

  // ── R05 주거·자산·부채·소비 (R05 JSON sources S1~S13) ──
  'R05.S1': { org: '국토교통부', title: '「2024년도 주거실태조사」 결과 보도자료(2025-11-16)', year: 2025, url: 'https://www.molit.go.kr/USR/NEWS/m_71/dtl.jsp?lcmspage=1&id=95091415', kind: 'official' },
  'R05.S2': { org: '국가데이터처·한국은행·금융감독원', title: '2025년 가계금융복지조사 결과(부록 통계표 1~16, 2025-12-04)', year: 2025, url: 'https://www.bok.or.kr/portal/bbs/B0000501/view.do?menuNo=201264&nttId=10094917', kind: 'official' },
  'R05.S3': { org: '국가데이터처', title: '2025년 4/4분기 가계동향조사 결과(2026-02-26)', year: 2026, url: 'https://www.korea.kr/briefing/policyBriefingView.do?newsId=156746265', kind: 'official' },
  'R05.S4': { org: '국토교통부', title: '전세사기피해지원위원회 8월 결정 현황(2026-09-07)', year: 2026, url: 'https://eiec.kdi.re.kr/policy/materialView.do?num=286404', kind: 'official' },
  'R05.S5': { org: '한국부동산원', title: '전국주택가격동향조사 2025년 12월(2026-01-14) 및 e-나라지표 매매·전세가격 동향', year: 2026, url: 'https://mobile.newsis.com/view/NISX20260114_0003477291', kind: 'secondary' },
  'R05.S6': { org: 'KB부동산(KB국민은행)', title: '월간 KB주택가격동향(2022-09~2026-08 보도 인용)', year: 2026, url: 'https://www.sedaily.com/article/20082317', kind: 'secondary' },
  'R05.S7': { org: '한국은행', title: '기준금리 변동 추이', year: 2026, url: 'https://www.bok.or.kr/portal/singl/baseRate/list.do?dataSeCd=01&menuNo=200643', kind: 'official' },
  'R05.S8': { org: '세계은행 WDI(FRED 경유)', title: '소비자물가 상승률 시계열(대한민국)', year: 2025, url: 'https://fred.stlouisfed.org/data/FPCPITOTLZGKOR', kind: 'official' },
  'R05.S9': { org: 'BIS(FRED 경유)·한국은행', title: '가계신용/GDP, 금융안정보고서 2025-03·06', year: 2025, url: 'https://fred.stlouisfed.org/data/QKRHAM770A.txt', kind: 'official' },
  'R05.S10': { org: '국무조정실', title: '2024년 청년의 삶 실태조사(2025-03-11; 뉴시스 인용 단일보도)', year: 2025, url: 'https://mobile.newsis.com/view/NISX20250311_0003094021', kind: 'secondary' },
  'R05.S11': { org: '통계청(현 국가데이터처)', title: '2020 인구주택총조사(표본) 결과 — 가구·특성항목(2021-12-24)', year: 2021, url: 'https://www.korea.kr/briefing/policyBriefingView.do?newsId=156488382', kind: 'official' },
  'R05.S12': { org: '서울시', title: '2024 서울시 주거실태조사(2025-12-29)·이코노미스트 마이크로데이터 재분석', year: 2025, url: 'https://economist.co.kr/article/view/ecn202608170012', kind: 'secondary' },
  'R05.S13': { org: '나무위키(2차 자료)', title: '10.15·6.27·9.7 대책, DSR, 임대차3법, 전세사기 문서', year: 2026, url: 'https://namu.wiki/w/10.15%20%EB%B6%80%EB%8F%99%EC%82%B0%20%EB%8C%80%EC%B1%85', kind: 'secondary' },

  // ── R06 가족·결혼·출산·돌봄 ──
  'R06.S4': { org: '국가데이터처', title: '2025년 혼인·이혼통계(2026-03-19)', year: 2026, url: 'https://www.index.go.kr/unity/potal/eNara/sub/showStblGams3.do?stts_cd=F002301&idx_cd=F0023&freq=Y&period=1970:2025', kind: 'official' },
  'R06.S8': { org: '국가데이터처', title: 'e-나라지표 평균 초혼연령(인구동향조사)', year: 2026, url: 'https://www.index.go.kr/unity/potal/eNara/sub/showStblGams3.do?stts_cd=F002301&idx_cd=F0023&freq=Y&period=1970:2025', kind: 'official' },
  'R06.S10': { org: '국가데이터처', title: '인구총조사(표본 20%) 연령별 미혼율 2005~2020 및 2025 인구주택총조사 등록센서스(2026-07-28)', year: 2026, url: 'https://www.index.go.kr', kind: 'official' }, // ★ R06는 개별 URL 미기재
  'R06.S18': { org: '국가데이터처', title: '인구동향조사(출생) 순위별 평균 출산연령 1993~2025', year: 2026, url: 'https://www.index.go.kr', kind: 'official' },
  'R06.S21': { org: '국가데이터처', title: '유배우 연령별 출산율 2000·2015·2023·2025(출생통계)', year: 2026, url: 'https://www.index.go.kr', kind: 'official' },
  'R06.S22': { org: '국가데이터처', title: '혼외출산 비율(출생통계 2016~2025)', year: 2026, url: 'https://www.index.go.kr', kind: 'official' },
  'R06.S23': { org: '국가데이터처', title: '신혼부부통계(초혼 5년 이내·혼인 7년 이내 무자녀 비율 2020~2024)', year: 2025, url: 'https://www.index.go.kr', kind: 'official' },
  'R06.S24': { org: '국가데이터처', title: '코호트 완결출산율·무자녀 비율(출생연도별, 장래인구추계 표 2-3 등)', year: 2025, url: 'https://www.index.go.kr', kind: 'official' },
  'R06.S26': { org: '국가데이터처', title: '육아휴직통계 — 육아휴직 사용률(고용보험·행정자료 연계)', year: 2025, url: 'https://www.index.go.kr', kind: 'official' },
  'R06.S28': { org: '국가데이터처', title: '육아휴직통계 — 출산 전후 어머니의 취업 유지', year: 2025, url: 'https://www.index.go.kr', kind: 'official' },
  'R06.S29': { org: '국가데이터처', title: '지역별고용조사 경력단절여성 현황', year: 2025, url: 'https://www.index.go.kr', kind: 'official' },
  'R06.S37': { org: '국가데이터처', title: '사회조사(복지) 60세 이상 생활비 마련 방법(2025-11-11)', year: 2025, url: _enara(2767), kind: 'official' },

  // ── R07 노후·연금 (R07 JSON sources) ──
  'R07.S02': { org: '국민연금공단', title: '국민연금 통계-급여지급 현황(연도별)', year: 2026, url: 'https://www.nps.or.kr/pnsinfo/statistics/getOHAF0115M0.do', kind: 'official' },
  'R07.S03': { org: '국민연금공단', title: '국민연금 통계-금액별 급여수급자 현황(2026.6)', year: 2026, url: 'https://www.nps.or.kr/pnsinfo/statistics/getOHAF0116M0.do', kind: 'official' },
  'R07.S05': { org: '국민연금공단', title: '국민연금 기금현황·수익률', year: 2026, url: 'https://www.nps.or.kr/pnsinfo/statistics/getOHAF0117M0.do', kind: 'official' },
  'R07.S06': { org: '국민연금공단', title: 'FAQ 연금개혁(국민연금법 개정, 2025.3.20 국회 통과)', year: 2026, url: 'https://www.nps.or.kr/pnsinfo/ntpsklg/getOHAF0104M0.do', kind: 'official' },
  'R07.S07': { org: '국민연금공단', title: '연금 종류 및 청구(노령연금 지급연령)', year: 2026, url: 'https://www.nps.or.kr/pnsinfo/ntpsklg/getOHAF0048M0.do', kind: 'official' },
  'R07.S10': { org: '보건복지부', title: '기초연금 공식 사이트(기준연금액·선정기준액 공지)', year: 2026, url: 'https://basicpension.mohw.go.kr/', kind: 'official' },
  'R07.S11': { org: '보건복지부 국회 제출자료(SBS Biz 보도)', title: '기초연금 수급자 2021~2025', year: 2026, url: 'https://biz.sbs.co.kr/amp/article/20000333530', kind: 'secondary' },
  'R07.S12': { org: '국가데이터처', title: '2026 고령자 통계(보도자료 2026-10-01)', year: 2026, url: 'https://mods.go.kr/board.es?act=view&bid=10820&list_no=447294&mid=a10301010000', kind: 'official' },
  'R07.S13': { org: '국가데이터처', title: '2025년 사회조사 결과·통계표(2025-11-11)', year: 2025, url: 'https://mods.go.kr/board.es?act=view&bid=219&list_no=439196&mid=a10301010000', kind: 'official' },
  'R07.S15': { org: 'OECD', title: 'Pensions at a Glance 2025: Korea country note', year: 2025, url: 'https://doi.org/10.1787/e40274c1-en', kind: 'official' },
  'R07.S16': { org: '국가데이터처', title: '2025년 사망원인통계 결과(2026-09-22)', year: 2026, url: 'https://mods.go.kr/board.es?mid=a10301060100&bid=218&act=view&list_no=447102&tag=&nPage=1', kind: 'official' },
  'R07.S17': { org: '보건복지부', title: '2024년 고독사 실태조사 결과(2025-11-27)', year: 2025, url: 'https://www.mohw.go.kr/board.es?mid=a10503010100&bid=0027&act=view&list_no=1488039&tag=&nPage=1', kind: 'official' },
  'R07.S18': { org: '보건복지부·한국보건사회연구원', title: '2023년 노인실태조사 결과 발표(2024-10-17)', year: 2024, url: 'https://www.mohw.go.kr/board.es?mid=a10503010100&bid=0027&act=view&list_no=1483352&tag=&nPage=1', kind: 'official' },
  'R07.S19': { org: '보건복지부', title: '노인일자리, 역대 최대 115만 2천 개 제공(2026-02-01)', year: 2026, url: 'https://www.mohw.go.kr/board.es?mid=a10503010100&bid=0027&act=view&list_no=1488935&tag=&nPage=1', kind: 'official' },
  'R07.S28': { org: '국가데이터처', title: '2024년 연금통계 결과(2026-08-25)', year: 2026, url: 'https://mods.go.kr/board.es?mid=a10301060100&bid=11816&act=view&list_no=446608&tag=&nPage=1', kind: 'official' },
  'R07.S29': { org: '국가데이터처', title: '2024년 퇴직연금통계 결과(2025-12-15)', year: 2025, url: 'https://mods.go.kr/board.es?mid=a10301060100&bid=11816&act=view&list_no=442406&tag=&nPage=1', kind: 'official' },
  'R07.S40': { org: '국가데이터처', title: '2024년 사회조사 결과 통계표(2024-11-12)', year: 2024, url: 'https://mods.go.kr/board.es?mid=a10301060100&bid=219&act=view&list_no=433638&tag=&nPage=1', kind: 'official' },

  // ── R08 사회 이슈 ──
  'R08.S01': { org: '국가데이터처', title: '2025년 사회조사 결과(복지·사회참여·여가·소득과 소비·노동) — 계층 이동 가능성(2025-11-11)', year: 2025, url: 'https://mods.go.kr/board.es?act=view&bid=219&list_no=439196&mid=a10301010000', kind: 'official' },
  'R08.S08': { org: '한국행정연구원(KIPA)', title: '2025년 사회통합실태조사(2026-07-07 공표, 8,305명)', year: 2026, url: 'https://www.kipa.re.kr', kind: 'official' }, // ★
  'R08.S13': { org: '한국고용정보원', title: '지방소멸위험지수 2025 개편(『지역산업과 고용』 2025 가을호, 2025-09-30)', year: 2025, url: 'https://www.keis.or.kr', kind: 'official' }, // ★
  'R08.S16': { org: '통계청(현 국가데이터처)', title: '인구총조사(수도권 인구 비중 1960~2005)', year: 2025, url: 'https://kosis.kr', kind: 'official' }, // ★
  'R08.S24': { org: '기상청', title: '폭염·열대야 정의(1973년 이후 62개 지점 전국 평균)', year: 2025, url: 'https://www.kma.go.kr', kind: 'official' }, // ★
  'R08.S25': { org: '기상청', title: '2025년 연 기후특성(2026-01-06) — 폭염·열대야', year: 2026, url: 'https://www.kma.go.kr', kind: 'official' }, // ★
  'R08.S30': { org: '국가데이터처', title: '2025년 12월 및 연간 소비자물가동향(2025-12-31), 2026-09 월간', year: 2025, url: 'https://mods.go.kr/board.es?mid=a10301010000&bid=213&list_no=447322&act=view', kind: 'official' },
  'R08.S31': { org: '세계은행 WDI', title: '소비자물가 연평균 상승률(2026-10-08 갱신)', year: 2026, url: 'https://data.worldbank.org/indicator/FP.CPI.TOTL.ZG?locations=KR', kind: 'official' },
  'R08.S61': { org: '국회·언론(머니투데이)', title: '60세 정년 법제화(2013-04-30 통과, 2016-01-01·2017-01-01 시행)', year: 2013, url: 'https://www.mt.co.kr/politics/2013/04/23/2013042316178223450', kind: 'secondary' },

  // ── R09 직업 (GDD §14.1 지정) ──
  'R09.S1': { org: '통계청(현 국가데이터처)', title: '고시 제2024-328호 한국표준직업분류(KSCO) 8차 · 신구 연계표', year: 2024, url: 'https://kssc.mods.go.kr:8443/ksscNew_web/kssc/common/selectIntroduce.do?gubun=1&bbsId=ksco_uocms&categoryNameCode=002&categoryMenu=004', kind: 'official' },
  'R09.S2': { org: '국가데이터처', title: '지역별고용조사 2025 상·하반기 — 직업 대분류별 취업자 구성', year: 2026, url: 'https://mods.go.kr', kind: 'official' }, // ★ R09는 개별 URL 미기재
  'R09.S3': { org: '고용노동부', title: '2025년 6월 고용형태별근로실태조사 직종별 임금', year: 2026, url: 'https://eiec.kdi.re.kr/policy/materialView.do?num=280485', kind: 'official' },
  'R09.S4': { org: '한국은행', title: '이슈노트 제2025-2호 「AI와 한국경제」(2025-02-10)', year: 2025, url: 'https://www.bok.or.kr/portal/bbs/P0002353/view.do?nttId=10089704&menuNo=200433', kind: 'official' },
  'R09.S5': { org: '한국고용정보원', title: '2019 대졸자직업이동경로조사(GOMS)', year: 2019, url: 'https://survey.keis.or.kr', kind: 'official' }, // ★
  // 리드 추가(통합): 콘텐츠 D era.js 참조 출처. ★ = 기관 누리집 대체
  'R03.S25': { org: '위키백과(교육부 자료로 교차 확인)', title: '대한민국 교육 제도 연표 — 고교평준화·과외 금지', year: 2026, url: 'https://ko.wikipedia.org/wiki/%EB%8C%80%ED%95%9C%EB%AF%BC%EA%B5%AD%EC%9D%98_%EA%B5%90%EC%9C%A1', kind: 'secondary' },
  'R08.S38': { org: '보건복지부', title: '보건의료 위기경보 경계 발령(2024-02)', year: 2024, url: 'https://www.mohw.go.kr/board.es?mid=a10503000000&bid=0027&act=view&list_no=1480186', kind: 'official' },
  'R08.S43': { org: '국회·헌법재판소', title: '2024-12 비상계엄 해제 요구 결의, 2025-04-04 탄핵심판 선고', year: 2025, url: 'https://www.ccourt.go.kr', kind: 'official' }, // ★
  'R08.S70': { org: '여러 기관(사건별 상이)', title: '시대 사건 연표 1950~2026 — 사건별 원출처는 각 기관의 공표 자료', year: 2026, url: 'https://www.archives.go.kr', kind: 'secondary' }, // ★
  'R06.S32': { org: '국가데이터처', title: '2024년 생활시간조사 — 남녀 가사·돌봄 시간(2025-07-28)', year: 2025, url: _enara(3027), kind: 'official' },
  'R06.S33': { org: '보건복지부·한국보건사회연구원', title: '2022년 가족돌봄청년 실태조사(2023-04-26)', year: 2023, url: 'https://www.mohw.go.kr', kind: 'official' }, // ★
  // 외부 조사 카탈로그(docs/external) 출처 H01~H33 → EXT.Hxx (자료 탐색처·포괄 자료 포함, 사건별 원문 확인은 출시 전 필요)
  "EXT.H01": { org: "국사편찬위원회", title: "우리역사넷 근현대 생활사 탐색", year: 2026, url: "https://contents.history.go.kr/", kind: 'secondary' },
  "EXT.H02": { org: "국사편찬위원회", title: "식민지 시기 농민·노동자의 생활과 운동", year: 2026, url: "https://contents.history.go.kr/front/ta/print.do?levelId=ta_h71_0060_0050_0020_0030&whereStr=", kind: 'secondary' },
  "EXT.H03": { org: "국사편찬위원회", title: "국채보상운동", year: 2026, url: "https://contents.history.go.kr/mobile/kc/view.do?levelId=kc_i401200", kind: 'secondary' },
  "EXT.H04": { org: "국사편찬위원회", title: "3·1운동 사건 정의", year: 2026, url: "https://contents.history.go.kr/lod", kind: 'secondary' },
  "EXT.H05": { org: "국사편찬위원회", title: "전시체제와 강제동원", year: 2026, url: "https://contents.history.go.kr/mobile/kc/view.do?levelId=kc_i400700", kind: 'secondary' },
  "EXT.H06": { org: "국가기록원", title: "6·25전쟁 기록 콘텐츠", year: 2026, url: "https://theme.archives.go.kr/next/625/viewMain.do", kind: 'secondary' },
  "EXT.H07": { org: "국사편찬위원회", title: "농지개혁법", year: 2026, url: "https://contents.history.go.kr/front/hm/view.do?levelId=hm_154_0050", kind: 'secondary' },
  "EXT.H08": { org: "국사편찬위원회", title: "산업화와 경제 성장·사회 변화", year: 2026, url: "https://contents.history.go.kr/front/ta/view.do?levelId=ta_h71_0050_0050_0030_0050", kind: 'secondary' },
  "EXT.H09": { org: "국사편찬위원회", title: "석유파동", year: 2026, url: "https://contents.history.go.kr/mobile/kc/view.do?levelId=kc_i500270", kind: 'secondary' },
  "EXT.H10": { org: "국가기록원", title: "중·고교 평준화", year: 2026, url: "https://theme.archives.go.kr/next/koreaOfRecord/standard.do", kind: 'secondary' },
  "EXT.H11": { org: "국가기록원", title: "야간통행금지 해제", year: 2026, url: "https://theme.archives.go.kr/next/weekly/viewMain.do?selectMonth=201601&selectWeek=1", kind: 'secondary' },
  "EXT.H12": { org: "국민연금공단", title: "국민연금 제도의 확대 과정", year: 2026, url: "https://www.nps.or.kr/pnsinfo/ntpsklg/getOHAF0104M0.do", kind: 'secondary' },
  "EXT.H13": { org: "보건복지부", title: "건강보험 제도 연혁", year: 2026, url: "https://mohw.go.kr/menu.es?mid=a10705010200", kind: 'secondary' },
  "EXT.H14": { org: "국가기록원", title: "해외여행 자유화", year: 2026, url: "https://theme.archives.go.kr/next/koreaOfRecord/globalTravel.do", kind: 'secondary' },
  "EXT.H15": { org: "한국은행", title: "외환·금융위기 기록 탐색", year: 2026, url: "https://archives.bok.or.kr/", kind: 'secondary' },
  "EXT.H16": { org: "교육부", title: "2020 원격수업·온라인 개학 운영 사례", year: 2026, url: "https://www.moe.go.kr/upload/brochureBoard/1/2020/07/1594684963624_10156931487290099.pdf", kind: 'secondary' },
  "EXT.H17": { org: "고용노동부", title: "5~49인 기업 주52시간제 현장지원", year: 2026, url: "https://www.moel.go.kr/news/enews/report/enewsView.do?news_seq=12376", kind: 'secondary' },
  "EXT.H18": { org: "국토교통부", title: "전세사기 피해자 지원 보완방안", year: 2026, url: "https://www.molit.go.kr/USR/NEWS/m_71/dtl.jsp?id=95088878&lcmspage=101", kind: 'secondary' },
  "EXT.H19": { org: "보건복지부", title: "지역사회 통합돌봄", year: 2026, url: "https://mohw.go.kr/integratedcare/", kind: 'secondary' },
  "EXT.H20": { org: "국가 통계기관", title: "한국의 사회동향 2025", year: 2026, url: "https://www.kostat.go.kr/board.es?act=view&bid=246&list_no=442587&mid=a10301150000&nPage=1&ref_bid=&tag=", kind: 'secondary' },
  "EXT.H21": { org: "고용노동부·KOSIS", title: "고용동향·직업별 통계 활용 후보", year: 2026, url: "https://www.moel.go.kr/news/enews/report/enewsView.do?news_seq=18849", kind: 'secondary' },
  "EXT.H22": { org: "교육부", title: "사교육비 조사·교육 관련 자료 후보", year: 2026, url: "https://www.moe.go.kr/boardCnts/viewRenew.do?boardID=340&boardSeq=106117&lev=0&opType=N&page=7&s=moe", kind: 'secondary' },
  "EXT.H23": { org: "한국은행", title: "1962년 긴급통화조치 관련 아카이브", year: 2026, url: "https://archives.bok.or.kr/", kind: 'secondary' },
  "EXT.H24": { org: "국사편찬위원회", title: "새마을운동", year: 2026, url: "https://contents.history.go.kr/mobile/kc/view.do?levelId=kc_i502400", kind: 'secondary' },
  "EXT.H25": { org: "국가기록원", title: "시대별 금기와 자율", year: 2026, url: "https://theme.archives.go.kr/next/tabooAutonomy/menuIntro.do", kind: 'secondary' },
  "EXT.H26": { org: "민주화운동기념사업회·국가기록원", title: "1980 민주화운동·1987 6월항쟁", year: 2026, url: "https://archives.kdemo.or.kr/display/1980.html", kind: 'secondary' },
  "EXT.H27": { org: "고용노동부", title: "주40시간제 단계적 확대", year: 2026, url: "https://www.moel.go.kr/news/enews/report/enewsView.do?news_seq=1398", kind: 'secondary' },
  "EXT.H28": { org: "한국지능정보사회진흥원", title: "디지털정보격차 실태조사", year: 2026, url: "https://www.nia.or.kr/site/nia_kor/ex/bbs/List.do?cbIdx=81623", kind: 'secondary' },
  "EXT.H29": { org: "기상청", title: "기상연감 2018", year: 2026, url: "https://www.kma.go.kr/download_01/yearbook_2018.pdf", kind: 'secondary' },
  "EXT.H30": { org: "보건복지부", title: "2008년 7월 노인장기요양보험 시행 안내", year: 2026, url: "https://www.mohw.go.kr/board.es?act=view&bid=0027&list_no=44518&mid=a10503000000&nPage=1144&tag=", kind: 'secondary' },
  "EXT.H31": { org: "질병관리청·보건당국", title: "감염병 유행 시기와 공식 정보", year: 2026, url: "https://www.kdca.go.kr/board/board.es?act=view&bid=0015&cg_code=&list_no=66585&mid=a40303010000&nPage=512&newsField=", kind: 'secondary' },
  "EXT.H32": { org: "4·16기억저장소", title: "4·16 세월호참사 디지털아카이브", year: 2026, url: "https://www.416archive.org/archives/main", kind: 'secondary' },
  "EXT.H33": { org: "고용노동부", title: "노동시장 AI 인재양성 추진방안", year: 2026, url: "https://www.moel.go.kr/news/enews/report/enewsView.do?news_seq=18752", kind: 'secondary' },
};

// ── R10 출생지역 분포(출생연도 1960~1985) ──
SOURCES['R10.S1'] = { org: '통계청(현 국가데이터처)', title: '인구주택총조사 1966~1990 시도별 인구밀도(국가기록원 인구정책 통계 인용)·1960~90 전국·서울 인구', year: 2025, url: 'https://theme.archives.go.kr/next/populationPolicy/statisticsPopup_04.do', kind: 'official' };
SOURCES['R10.S2'] = { org: '서울신문(통계청 1990 인구주택총조사 보도)', title: '시부 인구 비중 65.4%(1985)→74.4%(1990), 수도권 39.1%→42.7%', year: 1991, url: 'https://www.seoul.co.kr/news/1991/04/13/19910413001002', kind: 'secondary' };
SOURCES['R10.S3'] = { org: '게임 추정', title: '시군구 상대 가중(2020 인구센서스 시군구 인구 미확인 — 유형·개발연혁 보정)', year: 2026, url: 'https://kosis.kr', kind: 'game' };

// ── R11 생애 단계별 고민(concerns) ──
SOURCES['R11.S1'] = { org: '과학기술정보통신부·한국지능정보사회진흥원', title: '2023 스마트폰 과의존 실태조사 — 10~19세 위험군 40.1%(2011 11.4%) (R03 §9.2 인용)', year: 2023, url: 'https://www.nia.or.kr', kind: 'official' };
SOURCES['R11.S2'] = { org: '국가데이터처', title: '2024 생활시간조사 — 10~19세 학습·개인유지 시간(R03 §9.2 인용)', year: 2025, url: 'https://kosis.kr', kind: 'official' };
SOURCES['R11.S3'] = { org: '법제처(일반지식, 재확인 권장)', title: '영유아보육법 — 어린이집 CCTV 설치 의무화(2015)·어린이 보호구역(1995 도입)', year: 2026, url: 'https://www.law.go.kr', kind: 'secondary' };
SOURCES['R11.S4'] = { org: '법제처(일반지식, 재확인 권장)', title: '연명의료결정법(2016 제정, 2018-02 시행)', year: 2026, url: 'https://www.law.go.kr', kind: 'secondary' };
// ── R20 연봉·부동산 현실 대조 ──
SOURCES['R20.S1'] = { org: '보건복지부·한국보건사회연구원 / 고용노동부 / 한국경영자총협회 / 국세청', title: 'R20 연봉 대조: 보건의료인력 실태조사(2020·2023), 매월노동통계 1989~94 보도, 경총 대졸 초임(2025-01 보도), 국세통계 전문직 사업소득(2024 귀속)', year: 2026, url: 'docs/research/validation/R20-wage-and-price-audit.md', kind: 'secondary' };
SOURCES['R20.S2'] = { org: 'KB부동산 / 한국부동산원 / 국토교통부', title: 'R20 부동산 대조: KB 월간 주택가격동향 평균 매매·전세가, 부동산원 월세 통계, 실거래가 요약(보도 인용)', year: 2026, url: 'docs/research/validation/R20-wage-and-price-audit.md', kind: 'secondary' };
