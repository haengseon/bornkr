// 콘텐츠 D: 시대 뉴스(GDD §8·§9.4, ARCHITECTURE §8). 1년 최대 1건, 가장 큰 weight가 우선(동률은 추첨).
// tiers: child(0~6) 가구 영향 / teen(7~14) 간접 / adult(15+) 직접. 참사는 사실만(인명 수치·장면 없음), 정치는 중립 사실만.
// src 'R08.S70' = R08 §10 시대 사건 연표(행별 URL). sources.js 등록 요청(docs/impl/content-d-notes.md).
const tenant = L => L.home?.tenure === 'jeonse' || L.home?.tenure === 'monthly';
const hasDebt = L => (L.money?.debt ?? 0) > 0;
const quint = L => L.birth?.quintile ?? 3;
const elderParent = L => ['father', 'mother'].some(p => L.family?.parents?.[p]?.alive && L.family.parents[p].age >= 65);

const RAW = [
  {
    id: 'era.1970.saemaeul', years: [1970, 1975], weight: 2, when: L => L.birth?.urban === false,
    tiers: {
      child: '마을 길이 넓어지고 지붕이 바뀌었다.',
      teen: '마을 사람들이 모여 길을 닦고 지붕을 바꿨다.',
      adult: '새마을운동으로 마을 길과 지붕이 바뀌었다.',
    },
    fx: { issues: { region: -3 } }, reason: '새마을운동 마을 정비', src: ['R08.S70'],
  },
  {
    id: 'era.1973.oil', shock: true, impact: '그 무렵 사람들은 기름 아끼기와 물가 걱정을 일상으로 삼았다.', years: [1973, 1974], weight: 3,
    tiers: {
      child: '기름값이 올라 집 안 살림이 빠듯해졌다.',
      teen: '기름값이 오르자 물건값이 줄줄이 올랐다.',
      adult: '석유파동으로 기름값과 물가가 함께 뛰었다.',
    },
    fx: { issues: { living: 6 } }, reason: '1차 석유파동 물가 급등', src: ['R08.S70'],
  },
  {
    id: 'era.1974.equalize', years: [1974, 1979], weight: 2,
    tiers: {
      child: '고교 배정이 추첨으로 바뀐 지역이 있었다.',
      teen: '고교 배정이 추첨으로 바뀐 지역이 있었다.',
      adult: '고교평준화 적용 지역에서 학교를 추첨으로 배정받았다.',
    },
    fx: { issues: { edu: -2 } }, reason: '고교평준화 추첨 배정', src: ['R03.S25'],
  },
  {
    id: 'era.1980.oil', years: [1980, 1981], weight: 3,
    tiers: {
      child: '물가가 올라 생활비가 늘었다.',
      teen: '물가가 다시 올라 집안이 지출을 줄였다.',
      adult: '2차 석유파동. 시장 물가가 하루가 다르게 뛰었다.',
    },
    fx: { issues: { living: 10 } }, reason: '물가 최고 28.7%', src: ['R05.S8'],
  },
  {
    id: 'era.1980.tutor.ban', years: [1980, 1981], weight: 3, when: L => quint(L) >= 3,
    tiers: {
      child: '과외가 금지된다는 말이 집에 돌았다.',
      teen: '과외가 법으로 금지됐다는 이야기를 들었다.',
      adult: '과외가 금지됐다. 몰래 하는 과외 소문이 돌았다.',
    },
    fx: { issues: { edu: -4 } }, reason: '과외 금지', src: ['R03.S25'],
  },
  {
    id: 'era.1980.tutor.ban.low', years: [1980, 1981], weight: 3, when: L => quint(L) <= 2,
    tiers: {
      child: '과외가 금지된다는 말이 집에 돌았다.',
      teen: '과외가 법으로 금지됐다는 이야기를 들었다.',
      adult: '과외가 금지됐다. 입시 걱정은 집에 그대로 남았다.',
    },
    fx: { issues: { edu: 2 } }, reason: '과외 금지', src: ['R03.S25'],
  },
  {
    id: 'era.1981.quota', years: [1981, 1983], weight: 2,
    tiers: {
      child: '대학에 가는 사람이 늘었다는 뉴스가 나왔다.',
      teen: '대학에 가는 사람이 눈에 띄게 늘었다고 했다.',
      adult: '졸업정원제 뒤 대학 문이 넓어졌다.',
    },
    fx: { issues: { edu: -2 } }, reason: '졸업정원제 · 진학률 27→35%', src: ['R03.S10'],
  },
  {
    id: 'era.1987.june', years: [1987, 1987], weight: 4,
    tiers: {
      child: '어른들이 텔레비전 앞에서 오래 이야기했다.',
      teen: '6월 민주항쟁 뉴스가 연일 나왔다.',
      adult: '6월에 직선제 개헌 요구 시위가 이어졌다. 10월 개헌이 이뤄졌다.',
    },
    fx: { issues: { conflict: 8 } }, reason: '6월 항쟁·직선제 개헌', src: ['R08.S70'],
  },
  {
    id: 'era.1988.olympics', years: [1988, 1988], weight: 3,
    tiers: {
      child: '온 가족이 텔레비전 앞에서 올림픽 중계를 봤다.',
      teen: '서울올림픽 중계에 온 동네가 들떴다.',
      adult: '서울에서 올림픽이 열렸다. 다 같이 중계를 봤다.',
    },
    fx: { stats: { relations: 1 } }, reason: '서울올림픽', src: ['R08.S70'],
  },
  {
    id: 'era.1988.house.boom', years: [1988, 1991], weight: 2,
    tiers: {
      child: '집값 이야기가 어른들 대화에 자주 나왔다.',
      teen: '집값이 뛰어 이사가 어렵다는 말이 돌았다.',
      adult: '집값이 가파르게 올랐고 신도시 공사가 시작됐다.',
    },
    fx: { issues: { housing: 8 } }, reason: '집값 급등·주택 200만 호', src: ['R08.S70'],
  },
  {
    id: 'era.1993.realname', years: [1993, 1993], weight: 2,
    tiers: {
      child: '어른들이 은행 통장 이름 이야기를 했다.',
      teen: '남의 이름으로 된 통장을 못 쓰게 됐다고 들었다.',
      adult: '금융실명제가 시작돼 차명 금융거래가 금지됐다.',
    },
    fx: { issues: { fairness: -3 } }, reason: '금융실명제 시행', src: ['R08.S70'],
  },
  {
    id: 'era.1994.csat', years: [1993, 1994], weight: 2,
    tiers: {
      child: '큰 아이들이 새 시험 이야기에 긴장했다.',
      teen: '대학 입시가 새 시험으로 바뀐다고 했다.',
      adult: '수능이 처음 치러졌다. 대학 입시 시험이 바뀌었다.',
    },
    fx: { issues: { edu: 2 } }, reason: '수능 첫 시행', src: ['R03.S25'],
  },
  {
    id: 'era.1994.bridge', years: [1994, 1994], weight: 3, sensitive: 'disaster',
    tiers: {
      child: '어른들이 뉴스를 보며 말을 아꼈다.',
      teen: '큰 다리가 무너졌다는 뉴스에 학교가 술렁였다.',
      adult: '성수대교 상판 일부가 무너졌다. 안전 관리 책임이 논의됐다.',
    },
    fx: { issues: { conflict: 3 } }, reason: '성수대교 붕괴 뉴스', src: ['R08.S70'],
  },
  {
    id: 'era.1995.sampoong', years: [1995, 1995], weight: 4, sensitive: 'disaster',
    tiers: {
      child: '어른들이 텔레비전 앞에서 한참 말이 없었다.',
      teen: '백화점 건물이 무너졌다는 뉴스에 모두 놀랐다.',
      adult: '삼풍백화점이 무너졌다. 건축물 안전 규제가 강화됐다.',
    },
    fx: { issues: { fairness: 2 } }, reason: '삼풍백화점 붕괴 뉴스', src: ['R08.S70'],
  },
  {
    id: 'era.1996.colleges', years: [1996, 1997], weight: 1,
    tiers: {
      child: '새 대학이 여기저기 생긴다는 이야기가 나왔다.',
      teen: '대학이 많이 생겨 갈 곳이 늘었다고 했다.',
      adult: '대학설립준칙주의로 대학과 정원이 빠르게 늘었다.',
    },
    fx: { issues: { edu: -2 } }, reason: '대학 설립 확대', src: ['R03.S25'],
  },
  {
    id: 'era.1997.imf', shock: true, impact: '그 무렵 사람들은 명예퇴직과 부도 소식 속에서 가계부부터 다시 썼다.', years: [1997, 1998], weight: 5,
    tiers: {
      child: '아빠 엄마가 회사 이야기를 하다 말이 줄었다.',
      teen: '친구 아빠가 회사를 그만뒀다는 말이 돌았다.',
      adult: '외환위기. 구조조정과 실직이 이어졌고 금리가 치솟았다.',
    },
    fx: { issues: { job: 12, living: 8 } }, reason: '외환위기', src: ['R08.S70'],
  },
  {
    id: 'era.1998.gold', years: [1998, 1998], weight: 3,
    tiers: {
      child: '엄마가 장롱 속 금붙이를 꺼내 들고 나섰다.',
      teen: '동네 사람들이 금을 들고 은행 앞에 줄을 섰다.',
      adult: '장롱 속 금반지가 은행 창구로 모였다.',
    },
    fx: { stats: { relations: 1 }, issues: { conflict: -1 } }, reason: '금 모으기 · 약 350만 명', src: ['R08.S70'],
  },
  {
    id: 'era.2000.pharm', years: [2000, 2000], weight: 2,
    tiers: {
      child: '병원에서 약을 받던 길이 달라졌다고 했다.',
      teen: '병원 처방전을 들고 약국에 가게 됐다.',
      adult: '의약분업이 시행돼 처방은 병원, 조제는 약국이 맡았다.',
    },
    fx: { issues: { medical: 3 } }, reason: '의약분업', src: ['R08.S70'],
  },
  {
    id: 'era.2000.tutor.legal', years: [2000, 2001], weight: 2,
    tiers: {
      child: '집집마다 아이 학원 이야기를 하기 시작했다.',
      teen: '과외 금지가 풀리자 학원 가는 친구가 늘었다.',
      adult: '헌재가 과외 금지를 위헌으로 결정하자 사교육이 퍼졌다.',
    },
    fx: { issues: { edu: 6 } }, reason: '과외 금지 위헌·사교육 확산', src: ['R03.S25'],
  },
  {
    id: 'era.2002.worldcup', years: [2002, 2002], weight: 3,
    tiers: {
      child: '어른들이 텔레비전 앞에서 함께 소리를 질렀다.',
      teen: '거리 응원에서 모르는 사람과 손뼉을 마주쳤다.',
      adult: '월드컵 거리 응원에 수많은 사람이 모였다.',
    },
    fx: { stats: { happiness: 2 } }, reason: '월드컵 거리 응원', src: ['R08.S70'],
  },
  {
    id: 'era.2003.card', shock: true, impact: '그 무렵 사람들은 카드 연체 통지서와 채무 조정 상담 창구 앞에서 줄을 섰다.', years: [2003, 2004], weight: 3,
    tiers: {
      child: '카드 이야기가 나오면 부모님이 목소리를 낮췄다.',
      teen: '카드 빚으로 힘든 집이 늘었다는 말이 돌았다.',
      adult: '카드대란으로 연체와 신용불량이 크게 늘었다.',
    },
    fx: { issues: { living: 6, fairness: 3 } }, reason: '카드대란', src: ['R08.S70'],
  },
  {
    id: 'era.2003.subway', years: [2003, 2003], weight: 3, sensitive: 'disaster',
    tiers: {
      child: '어른들이 뉴스를 보다 한동안 말이 없었다.',
      teen: '지하철 화재 뉴스에 교실이 조용해졌다.',
      adult: '대구 지하철 화재. 지하철 안전 기준을 다시 살폈다.',
    },
    fx: { issues: { fairness: 1 } }, reason: '지하철 화재 뉴스',
  },
  {
    id: 'era.2004.fiveday', years: [2004, 2011], weight: 1,
    tiers: {
      child: '토요일에 부모님이 집에 있는 날이 늘었다.',
      teen: '토요일에 학교와 회사가 쉬는 곳이 늘었다.',
      adult: '주 5일제가 단계적으로 시작됐다. 토요일을 쉬는 곳이 늘었다.',
    },
    fx: { stats: { leisure: 3 } }, reason: '주 5일제 단계 시행', src: ['R08.S70'],
  },
  {
    id: 'era.2007.nonreg.law', years: [2007, 2007], weight: 2,
    tiers: {
      child: '어른들이 일자리 계약 이야기를 자주 했다.',
      teen: '계약직 어른들의 일자리 이야기가 뉴스에 나왔다.',
      adult: '비정규직 보호법이 시행됐다. 계약 기간 이야기가 늘었다.',
    },
    fx: { issues: { job: 2 } }, reason: '비정규직 보호법 시행',
  },
  {
    id: 'era.2008.gfc', shock: true, impact: '그 무렵 사람들은 월급 동결과 무급휴직 소식에 지출부터 줄였다.', years: [2008, 2009], weight: 3,
    tiers: {
      child: '집에서 환율과 경기 이야기가 자주 나왔다.',
      teen: '경제가 어렵다는 말이 집에도 학교에도 돌았다.',
      adult: '세계 금융위기로 환율이 뛰고 수출과 일자리가 줄었다.',
    },
    fx: { issues: { job: 8 } }, reason: '세계 금융위기', src: ['R08.S70'],
  },
  {
    id: 'era.2008.ltc', years: [2008, 2008], weight: 3,
    tiers: {
      child: '집안 어른 돌봄을 돕는 제도가 새로 생겼다고 했다.',
      teen: '아픈 어르신을 돕는 새 보험이 시작됐다고 했다.',
      adult: '노인장기요양보험이 시작됐다. 가족이 지던 돌봄을 일부 나눴다.',
    },
    fx: { issues: { care: -4 } }, reason: '노인장기요양보험 시행', src: ['R08.S70'],
  },
  {
    id: 'era.2010.smartphone', years: [2009, 2011], weight: 2,
    tiers: {
      child: '부모님이 작은 화면을 자주 들여다보기 시작했다.',
      teen: '친구들이 스마트폰으로 메시지를 주고받기 시작했다.',
      adult: '스마트폰이 퍼지며 앱으로 하는 일이 하나둘 늘었다.',
    },
    fx: { issues: { tech: 5 } }, reason: '스마트폰 확산', src: ['R08.S70'],
  },
  {
    id: 'era.2013.childcare', years: [2013, 2013], weight: 2,
    tiers: {
      child: '어린이집에 내던 돈을 나라가 대 주기 시작했다.',
      teen: '어린 동생이 있는 집은 보육료 부담이 줄었다.',
      adult: '0~5세 보육료 지원이 소득과 상관없이 확대됐다.',
    },
    fx: { issues: { care: -3 } }, reason: '0~5세 보육료 전면 지원', src: ['R08.S70'],
  },
  {
    id: 'era.2014.sewol', years: [2014, 2014], weight: 4, sensitive: 'disaster',
    tiers: {
      child: '어른들이 뉴스 앞에서 오래 말이 없었다.',
      teen: '학교에서도 한동안 모두 조용히 뉴스를 지켜봤다.',
      adult: '세월호 참사. 안전 규제와 재난 대응을 다시 논의했다.',
    },
    fx: { issues: { conflict: 4 } }, reason: '세월호 참사 뉴스', src: ['R08.S70'],
  },
  {
    id: 'era.2014.basic.pension', years: [2014, 2014], weight: 4, when: elderParent,
    tiers: {
      child: '할머니 할아버지께 매달 나오는 돈이 생겼다.',
      teen: '어르신께 매달 나오는 돈이 생겼다고 했다.',
      adult: '기초연금이 시작돼 부모님 생활비가 조금 달라졌다.',
    },
    fx: { issues: { care: -2, medical: -2 } }, reason: '기초연금 도입', src: ['R08.S70'],
  },
  {
    id: 'era.2015.mers', years: [2015, 2015], weight: 3,
    tiers: {
      child: '병원에 가기 무섭다는 말을 어른들이 했다.',
      teen: '메르스로 마스크를 쓰고 학교가 쉬는 날이 있었다.',
      adult: '메르스가 퍼지며 병원 감염 관리가 크게 달라졌다.',
    },
    fx: { issues: { medical: 4 } }, reason: '메르스 유행', src: ['R08.S70'],
  },
  {
    id: 'era.2016.candle', years: [2016, 2016], weight: 4,
    tiers: {
      child: '어른들이 뉴스를 보며 크게 이야기하는 날이 많았다.',
      teen: '촛불집회 뉴스가 매일 나왔다.',
      adult: '광장 집회가 이어졌고 12월 9일 국회가 탄핵소추안을 가결했다.',
    },
    fx: { issues: { conflict: 6 } }, reason: '촛불집회·탄핵소추', src: ['R08.S70'],
  },
  {
    id: 'era.2017.impeach', years: [2017, 2017], weight: 4,
    tiers: {
      child: '어른들이 뉴스를 보며 크게 이야기하는 날이 많았다.',
      teen: '새 대통령을 뽑는 선거가 앞당겨져 열렸다.',
      adult: '3월 10일 헌재가 탄핵을 결정했고 5월 9일 조기 대선이 치러졌다.',
    },
    fx: { issues: { conflict: 6 } }, reason: '탄핵 결정·조기 대선', src: ['R08.S70'],
  },
  {
    id: 'era.2020.covid', shock: true, impact: '그 무렵 사람들은 마스크를 쓰고 가게 문과 교실 문이 닫히는 것을 지켜보았다.', years: [2020, 2022], weight: 5,
    tiers: {
      child: '마스크를 쓰고 집에서 지내는 날이 길어졌다.',
      teen: '학교 대신 화면 앞에서 수업을 들었다.',
      adult: '코로나19로 마스크와 거리두기가 일상이 됐다.',
    },
    fx: { stats: { relations: -2 }, issues: { medical: 6, job: 6 } }, reason: '코로나19', src: ['R08.S70'],
  },
  {
    id: 'era.2020.lease.law', years: [2020, 2021], weight: 4, when: tenant,
    tiers: {
      child: '이사 갈 집을 두고 부모님이 계약서를 다시 읽었다.',
      teen: '전세 이야기가 부모님 대화에 자주 나왔다.',
      adult: '임대차 3법 시행. 갱신은 쉬워졌고 새 전셋값은 올랐다.',
    },
    fx: { issues: { housing: 3 } }, reason: '임대차 3법 시행', src: ['R08.S70'],
  },
  {
    id: 'era.2021.youngkkeul', shock: true, impact: '그 무렵 사람들은 대출 한도를 계산하며 집을 살지 말지 밤새 고민했다.', years: [2021, 2021], weight: 3,
    tiers: {
      child: '집값 이야기가 식탁에서 끊이지 않았다.',
      teen: '집값이 올라 내 집은 먼 일이라는 말이 돌았다.',
      adult: '아파트값이 뛰었다. 빚을 내 집을 사는 영끌이 늘었다.',
    },
    fx: { issues: { housing: 8, fairness: 6 } }, reason: '아파트값 +14.1% · 영끌', src: ['R05.S5'],
  },
  {
    id: 'era.2022.rates', shock: true, impact: '그 무렵 사람들은 매달 늘어난 대출 이자를 보며 가계부를 다시 펼쳤다.', years: [2022, 2023], weight: 3, when: hasDebt,
    tiers: {
      child: '이자 이야기가 나오면 부모님 표정이 굳었다.',
      teen: '대출 이자가 올라 집안 살림이 팍팍해졌다고 했다.',
      adult: '기준금리가 오르며 대출 이자가 불어났다.',
    },
    fx: { issues: { housing: 6, living: 4 } }, reason: '기준금리 3%대', src: ['R05.S7'],
  },
  {
    id: 'era.2022.itaewon', years: [2022, 2022], weight: 4, sensitive: 'disaster',
    tiers: {
      child: '어른들이 아무 말 없이 한참 뉴스를 봤다.',
      teen: '학교에서 애도하는 조용한 날이 이어졌다.',
      adult: '이태원 참사. 인파 관리와 재난 안전 체계를 다시 논의했다.',
    },
    fx: { issues: { conflict: 2 } }, reason: '이태원 참사 뉴스', src: ['R08.S70'],
  },
  {
    id: 'era.2023.jeonse.fraud', years: [2023, 2024], weight: 4, when: tenant,
    tiers: {
      child: '이사 갈 집 이야기를 하며 부모님이 걱정했다.',
      teen: '전세 보증금 뉴스에 집안 어른들이 귀를 기울였다.',
      adult: '전세사기가 이어졌다. 피해자 지원 특별법이 시행됐다.',
    },
    fx: { issues: { housing: 6 } }, reason: '전세사기 확산·특별법', src: ['R05.S4'],
  },
  {
    id: 'era.2023.energy', years: [2023, 2023], weight: 3,
    tiers: {
      child: '집에서 난방과 전등을 아껴 쓰자는 말이 늘었다.',
      teen: '겨울 난방비 고지서가 집안 이야기가 됐다.',
      adult: '전기·가스·수도 요금 고지서가 무거워졌다.',
    },
    fx: { issues: { living: 8 } }, reason: '공공요금 +20.2%', src: ['R08.S30'],
  },
  {
    id: 'era.2024.medical', shock: true, impact: '그 무렵 사람들은 진료 일정이 밀려 병원 대기 문자를 기다렸다.', years: [2024, 2025], weight: 4,
    tiers: {
      child: '아플 때 갈 병원 걱정이 어른들 말에 섞였다.',
      teen: '의사 선생님들이 병원을 떠난 일이 뉴스에 이어졌다.',
      adult: '의대 정원을 둘러싼 갈등으로 병원 진료에 공백이 생겼다.',
    },
    fx: { issues: { medical: 8 } }, reason: '의정 갈등·진료 공백', src: ['R08.S38'],
  },
  {
    id: 'era.2024.martial', years: [2024, 2024], weight: 4,
    tiers: {
      child: '어른들이 밤늦게까지 뉴스를 켜 두었다.',
      teen: '뉴스가 연일 한 가지 이야기로 채워졌다.',
      adult: '12월 3일 비상계엄이 선포됐다 해제됐고 14일 탄핵소추안이 가결됐다.',
    },
    fx: { issues: { conflict: 6 } }, reason: '비상계엄·탄핵소추', src: ['R08.S43'],
  },
  {
    id: 'era.2025.impeach', years: [2025, 2025], weight: 4,
    tiers: {
      child: '어른들이 뉴스를 보며 크게 이야기하는 날이 많았다.',
      teen: '새 대통령을 뽑는 선거가 앞당겨져 열렸다.',
      adult: '4월 4일 헌재가 파면을 결정했고 6월 3일 조기 대선이 치러졌다.',
    },
    fx: { issues: { conflict: 6 } }, reason: '파면 결정·조기 대선', src: ['R08.S43'],
  },
  {
    id: 'era.2025.pension', years: [2025, 2026], weight: 3, ages: [0, 59],
    tiers: {
      child: '부모님이 연금 보험료 이야기를 했다.',
      teen: '연금 개혁 뉴스에 어른들이 한참 이야기했다.',
      adult: '연금 개혁. 내는 보험료가 해마다 오른다.',
    },
    fx: { issues: { fairness: 5 } }, reason: '보험료율 9→13%(2033)', src: ['R07.S06'],
  },
  {
    id: 'era.2025.pension.senior', years: [2025, 2026], weight: 3, ages: [60, 120],
    tiers: {
      child: '할머니가 받는 연금 이야기가 집에 나왔다.',
      teen: '어르신 연금 이야기가 뉴스에 자주 나왔다.',
      adult: '연금 개혁. 연금 지급 보장이 법에 적혔다.',
    },
    fx: { issues: { fairness: -2 } }, reason: '소득대체율 43%', src: ['R07.S06'],
  },
  {
    id: 'era.2026.heat', years: [2024, 2026], weight: 3,
    tiers: {
      child: '더워서 밖에서 노는 시간이 줄었다.',
      teen: '더위와 열대야로 잠을 설치는 날이 많았다.',
      adult: '기록적 폭염과 열대야가 이어졌다. 에어컨이 필수가 됐다.',
    },
    fx: { issues: { living: 6, region: 3 } }, reason: '기록적 폭염·열대야', src: ['R08.S25'],
  },
  {
    id: 'era.2030.aging', years: [2030, 2030], weight: 2, kind: 'projected',
    tiers: {
      child: '(전망) 어르신이 많아진 동네에서 자란다.',
      teen: '(전망) 65세 이상이 인구의 네 명 중 한 명이 된다.',
      adult: '(전망) 돌봄이 필요한 노인이 크게 는다.',
    },
    fx: { issues: { care: 3 } }, reason: '고령화 전망(65세 이상 25.3%)', src: ['R07.S12'],
  },
  {
    id: 'era.2036.aging', years: [2036, 2036], weight: 2, kind: 'projected',
    tiers: {
      child: '(전망) 아이는 줄고 어르신은 늘어난 나라에서 자란다.',
      teen: '(전망) 생산연령인구가 줄어 연금 걱정이 커진다.',
      adult: '(전망) 생산연령인구 둘이 노인 한 명을 받친다.',
    },
    when: L => !L?.fired?.['future.2035.dependency'],        // 같은 전망을 뉴스와 개인 사건으로 두 번 적용하지 않는다(QA #6)
    fx: { issues: { fairness: 3 } }, reason: '65세 이상 30.9% · 부양비 50.1', src: ['R07.S12'],
  },
  {
    id: 'era.2050.aging', years: [2050, 2050], weight: 2, kind: 'projected',
    tiers: {
      child: '(전망) 어르신이 열 명 중 네 명인 나라에서 자란다.',
      teen: '(전망) 노인을 돌볼 사람이 부족해진다는 이야기가 나온다.',
      adult: '(전망) 생산연령인구 넷이 노인 셋을 받친다.',
    },
    when: L => !L?.fired?.['future.2050.dependency'],
    fx: { issues: { care: 3 } }, reason: '65세 이상 40.1% · 부양비 77.3', src: ['R07.S12'],
  },
];

// 공통 기본값: 1회성(once), 전 연령, 성인 문구를 text 폴백으로.
export default RAW.map(ev => ({ once: true, ages: [0, 120], text: ev.tiers.adult, ...ev }));
