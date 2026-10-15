// 종합 뉴스 A(1960~1989): news-general.js 형식. 출처·조사 메모는 docs/research/R16-news-general-a.md.
// 플레이어는 1960~1985년생이라 이 시기엔 0~29세다: 1960~70년대는 '집안 분위기·학교 풍경'(가구 주거·부모 직업·지역),
// 1980년대는 대학생·군인·첫 직장·셋방살이 등 본인 상태로 인과를 잇는다. 링크는 위에서부터 처음 맞는 하나가 적용된다.

const S = new Set(['health', 'intellect', 'happiness', 'wealth', 'relations', 'leisure']);
// 'housing+4 happiness-1' → { issues:{housing:4}, stats:{happiness:-1} }
const f = s => {
  const o = {};
  for (const t of s.split(' ')) { const [k, v] = t.split(/(?=[+-])/); (S.has(k) ? (o.stats ??= {}) : (o.issues ??= {}))[k] = +v; }
  return o;
};
const lk = (when, line, fx, reason) => ({ when, line, ...(fx && { fx: f(fx), reason: reason ?? line }) });
const g = (line, fx, reason) => ({ line, ...(fx && { fx: f(fx), reason: reason ?? line }) });

// 상태 술어(옵셔널 체이닝으로 안전하게)
const A = (L, a, b = 200) => L.age >= a && L.age <= b;
const fj = L => String(L.birth?.parents?.fatherJob ?? '');
const farmH = L => fj(L) === '6';                                   // 농어업 가정
const workH = L => ['7', '8', '9'].includes(fj(L));                 // 공장·현장 일 가정
const rentH = L => ['jeonse', 'monthly'].includes(L.home?.tenure);  // 셋집(가구 기준)
const ownH = L => L.home?.tenure === 'own';
const monH = L => L.home?.tenure === 'monthly';
const rg = L => L.home?.regionGroup;
const seoul = L => rg(L) === 'seoul';
const rural = L => rg(L) === 'province' && L.birth?.urban === false;
const town = L => ['seoul', 'metro', 'capital'].includes(rg(L));
const reg = (L, ...r) => r.includes(L.home?.region);
const st = (L, ...s) => s.includes(L.edu?.stage);
const elem = L => st(L, 'elem');
const teen = L => st(L, 'middle', 'high');
const school = L => st(L, 'elem', 'middle', 'high');
const uni = L => st(L, 'college', 'grad');
const emp = L => ['employed', 'self'].includes(L.job?.status);
const jm = (L, ...m) => emp(L) && m.includes(String(L.job?.major ?? ''));
const factory = L => jm(L, '7', '8');
const office = L => jm(L, '1', '2', '3');
const wage = L => L.job?.status === 'employed';
const seek = L => L.job?.status === 'seeking';
const army = L => L.mil?.status === 'serving';
const kids = L => (L.family?.children?.length ?? 0) > 0;
const indep = L => L.home?.parents === false;
const renter = L => indep(L) && rentH(L);
const owner = L => !!L.home?.owned;
const lowQ = L => (L.birth?.quintile ?? 3) <= 2;
const highQ = L => (L.birth?.quintile ?? 3) >= 4;
const big = L => (L.family?.siblings ?? 0) >= 3;
const debt = L => (L.money?.debt ?? 0) > 0;

const W = t => `https://ko.wikipedia.org/wiki/${t}`;

export const NG_A = [
  // ── 1960 ──
  { id: 'ng.1960.april', years: [1960, 1960], sec: 'politics', headline: '4월 혁명, 정권 교체', summary: '3·15 부정선거에 항의한 시위가 전국으로 번져 정권이 물러나고 과도정부가 들어섰다.', weight: 2, src: [W('4·19_혁명')],
    links: [lk(seoul, '서울 거리 소식에 어른들이 밤늦도록 라디오 곁을 떠나지 못했다.', 'conflict+3', '정국 격변'),
      lk(rural, '읍내에서 들려온 소식을 두고 마을 어른들이 모여 웅성거렸다.', 'conflict+2', '정국 격변'),
      g('세상이 바뀐다는 말이 집집마다 오갔다.', 'conflict+2', '정국 격변')] },
  { id: 'ng.1960.house', years: [1960, 1960], sec: 'politics', headline: '7·29 총선, 양원제 국회', summary: '내각책임제 개헌 뒤 치른 총선으로 민의원·참의원 양원 국회가 처음 구성됐다.', src: [W('제5대_국회의원_선거')],
    links: [lk(rural, '선거 벽보가 마을 담벼락마다 붙어 어른들이 이름을 읽어 보았다.'), g('새 국회가 열린다는 소식이 신문 한 귀퉁이를 채웠다.')] },
  { id: 'ng.1960.spring', years: [1960, 1960], sec: 'economy', headline: '춘궁기 절량 농가 늘어', summary: '봄마다 묵은 곡식이 떨어지는 농가가 많아 정부가 구호 양곡을 풀었다.', src: [W('보릿고개')],
    links: [lk(farmH, '보리가 익기 전까지 집에서 죽 끓이는 날이 늘었다.', 'living+4 health-1', '춘궁기 식량 부족'),
      lk(L => lowQ(L) && rentH(L), '셋방살이 살림에 쌀독이 비어 어른들 한숨이 깊어졌다.', 'living+3', '춘궁기 식량 부족'),
      g('쌀값 이야기가 이웃 사이 인사가 됐다.', 'living+2', '식량 사정')] },
  { id: 'ng.1960.cup', years: [1960, 1960], sec: 'sports', headline: '서울 아시안컵 2연패', summary: '서울 효창운동장에서 열린 아시안컵 축구에서 한국이 우승해 대회 2연패를 이뤘다.', src: [W('1960년_AFC_아시안컵')],
    links: [lk(seoul, '효창운동장 함성이 동네까지 들렸다며 어른들이 들떴다.', 'happiness+1', '축구 우승'), g('축구 우승 소식에 라디오 앞 어른들이 박수를 쳤다.', 'happiness+1', '축구 우승')] },

  // ── 1961 ──
  { id: 'ng.1961.coup', years: [1961, 1961], sec: 'politics', headline: '5·16 군사정변', summary: '군이 정변으로 정권을 잡고 국가재건최고회의를 세웠다. 국회가 해산되고 정당 활동이 멈췄다.', weight: 2, src: [W('5·16_군사정변')],
    links: [lk(town, '거리에 군인이 늘고 통행금지 단속이 엄해져 어른들이 일찍 귀가했다.', 'conflict+3', '정변 후 통제'),
      g('라디오가 연일 혁명공약을 읽어 어른들 말수가 줄었다.', 'conflict+2', '정변')] },
  { id: 'ng.1961.usury', years: [1961, 1961], sec: 'economy', headline: '농어촌 빚 정리 착수', summary: '정부가 농어민의 고리 사채를 신고받아 농협이 대신 갚고 낮은 이자로 바꿔 주는 정리를 벌였다.', src: [W('농어촌고리채정리법')],
    links: [lk(farmH, '집안 빚 이자가 줄어 어른들이 한시름 놓았다.', 'living-2 wealth+1', '고리채 정리'),
      lk(rural, '빚 신고하러 면사무소에 줄을 선 이웃들이 많았다.', 'living-1', '고리채 정리'),
      g('시골 빚 정리 소식이 신문에 실렸다.')] },
  { id: 'ng.1961.tv', years: [1961, 1961], sec: 'culture', headline: '국영 TV 방송 개국', summary: '연말 서울에서 국영 텔레비전 방송이 전파를 쏘았다. 수상기는 아직 매우 드물었다.', src: [W('KBS_1TV')],
    links: [lk(L => seoul(L) && highQ(L), '동네에 몇 대 없는 텔레비전을 보러 이웃이 몰려왔다.', 'relations+1', 'TV 구경'),
      g('텔레비전이라는 물건 이야기가 신기한 소문으로 돌았다.')] },
  { id: 'ng.1961.time', years: [1961, 1961], sec: 'life', headline: '표준시 30분 앞당겨', summary: '8월 10일 표준시 기준 자오선이 동경 127.5도에서 135도로 바뀌어 시계를 30분 앞으로 돌렸다.', src: [W('한국_표준시'), 'https://astro.kasi.re.kr/community/pageView/45'],
    links: [lk(farmH, '시계보다 해를 보고 일하던 집에선 별일 없다며 웃었다.'), g('집집마다 괘종시계 바늘을 30분 돌려 맞췄다.')] },

  // ── 1962 ──
  { id: 'ng.1962.won', years: [1962, 1962], sec: 'economy', headline: '긴급 통화개혁, 환→원', summary: '화폐 단위를 10환=1원으로 바꾸고 예금 인출을 한동안 묶었다.', weight: 2, src: [W('1962년_대한민국의_화폐개혁')],
    links: [lk(L => highQ(L), '묶인 예금이 풀릴 때까지 집안 살림이 빠듯해졌다.', 'living+3 wealth-1', '예금 동결'),
      lk(rentH, '새 돈 바꾸러 은행에 줄 선 어른들이 셋방 월세 걱정을 했다.', 'living+2', '화폐 교환'),
      g('장터에서 환과 원 셈이 헷갈려 실랑이가 잦았다.', 'living+1', '화폐 교환')] },
  { id: 'ng.1962.plan', years: [1962, 1962], sec: 'economy', headline: '경제개발 5개년계획 시작', summary: '전력·비료·시멘트 등 기간산업을 키우는 첫 경제개발 5개년계획이 시작됐다.', src: [W('경제개발_5개년_계획')],
    links: [lk(workH, '공장 일자리가 늘 거라는 말에 어른들이 귀를 세웠다.', 'job-2', '공업화 기대'),
      g('잘살아 보자는 말이 신문 머리기사를 채웠다.')] },
  { id: 'ng.1962.family', years: [1962, 1962], sec: 'health', headline: '가족계획 사업 시작', summary: '정부가 인구 증가를 늦추려 보건소를 통해 피임 보급과 계몽을 시작했다.', src: [W('가족계획사업')],
    links: [lk(big, '형제 많은 우리 집에 보건소 계몽원이 찾아왔다.', 'care+2', '가족계획 계몽'),
      lk(rural, '마을 회관에 가족계획 강연이 열려 어른들이 쑥스러워했다.'), g('알맞게 낳자는 표어가 담벼락에 붙었다.')] },
  { id: 'ng.1962.apt', years: [1962, 1962], sec: 'housing', headline: '서울 첫 단지형 아파트', summary: '서울 마포에 여러 동짜리 아파트 단지가 착공됐다. 연탄 보일러·수세식 변소가 화제였다.', src: [W('마포아파트')],
    links: [lk(L => seoul(L) && rentH(L), '셋방 어른들이 아파트라는 새 집 이야기를 부러워했다.', 'housing+2', '새 주거 형태'),
      g('층층이 쌓은 집이라는 말에 어른들이 고개를 갸웃했다.')] },
  { id: 'ng.1962.ulsan', years: [1962, 1962], sec: 'economy', headline: '울산 공업지구 지정', summary: '울산이 특정 공업지구로 지정돼 정유·비료 공장 건설이 시작됐다.', src: [W('울산공업센터')],
    links: [lk(L => reg(L, 'gyeongnam', 'busan'), '가까운 울산에 공장이 선다며 동네 어른들이 일자리를 셈했다.', 'job-2 region-2', '공업지구 조성'),
      g('바닷가 마을에 공장이 들어선다는 기사가 났다.')] },

  // ── 1963 ──
  { id: 'ng.1963.rice', years: [1963, 1963], sec: 'economy', headline: '흉작에 쌀값 폭등', summary: '전해 흉작으로 쌀값이 크게 올라 정부가 외국 양곡을 들여오고 혼식을 권했다.', src: [W('1963년')],
    links: [lk(L => rentH(L) && town(L), '되쌀 사 먹는 셋방 살림에 밥상이 보리와 국수로 바뀌었다.', 'living+4', '쌀값 폭등'),
      lk(farmH, '쌀값은 올랐지만 팔 쌀이 없어 집안 사정은 그대로였다.', 'living+2', '흉작'),
      g('쌀집 앞 줄이 길어졌다는 이야기가 돌았다.', 'living+2', '쌀값 폭등')] },
  { id: 'ng.1963.miner', years: [1963, 1963], sec: 'labor', headline: '서독 광부 첫 파견', summary: '정부 협정에 따라 한국 광부들이 서독 탄광으로 떠났다. 지원자가 몰려 경쟁이 치열했다.', src: [W('파독_광부')],
    links: [lk(workH, '먼 나라 탄광 일에 지원해 볼까 어른들이 진지하게 상의했다.', 'job+2', '해외 취업 모색'),
      g('독일로 일하러 간다는 사람 이야기가 동네에 퍼졌다.')] },
  { id: 'ng.1963.ramen', years: [1963, 1963], sec: 'life', headline: '국산 인스턴트 라면 첫선', summary: '끓는 물에 삶아 먹는 국산 인스턴트 라면이 처음 나왔다. 값이 싸 분식 장려와 맞물렸다.', src: [W('라면')],
    links: [lk(L => A(L, 2), '처음 맛본 라면 국물에 어린 입이 놀랐다.'), g('봉지에 든 국수라는 말에 어른들이 신기해했다.')] },
  { id: 'ng.1963.civil', years: [1963, 1963], sec: 'politics', headline: '민정 이양, 대통령 선거', summary: '새 헌법에 따라 대통령 직선과 국회의원 총선이 치러져 제3공화국이 출범했다.', src: [W('제5대_대한민국_대통령_선거')],
    links: [lk(L => rural(L) && A(L, 2), '투표하러 읍내까지 걸어가는 어른들을 따라나섰다.'), g('선거 유세 확성기 소리가 골목을 지나갔다.')] },

  // ── 1964 ──
  { id: 'ng.1964.prices', years: [1964, 1964], sec: 'economy', headline: '환율 인상 뒤 물가 급등', summary: '환율이 크게 오른 뒤 생필품 값이 뛰었다. 한 해 물가가 30%가량 올랐다.', src: [W('1964년')],
    links: [lk(rentH, '오른 방세와 연탄값에 셋방 살림이 더 빠듯해졌다.', 'living+4 housing+2', '물가 급등'),
      lk(farmH, '비료값이 올라 농사 셈이 맞지 않는다고 어른들이 걱정했다.', 'living+3', '농자재 값 상승'),
      g('장보기가 무섭다는 말이 집집마다 나왔다.', 'living+2', '물가 급등')] },
  { id: 'ng.1964.export', years: [1964, 1964], sec: 'economy', headline: '수출 1억 달러, 수출의 날', summary: '연간 수출이 처음 1억 달러를 넘어 11월 30일을 수출의 날로 정했다.', src: [W('무역의_날')],
    links: [lk(L => workH(L) && town(L), '공장 잔업이 늘어 어른들 귀가가 늦어졌다.', 'job-2 leisure-1', '수출 증가'),
      g('수출 목표 달성 현수막이 시내에 걸렸다.')] },
  { id: 'ng.1964.vietnam', years: [1964, 1964], sec: 'world', headline: '베트남에 의료지원단 파견', summary: '정부가 남베트남에 의료지원단과 태권도 교관단을 보냈다. 이후 전투부대 파병으로 이어졌다.', src: [W('베트남_전쟁_파병')],
    links: [lk(L => workH(L) && town(L), '군납 일감이 늘었다는 공장 소식에 어른들이 귀를 세웠다.', 'job-1', '파병 특수'), g('먼 나라 전쟁 이야기가 라디오 뉴스에 자주 나왔다.')] },
  { id: 'ng.1964.song', years: [1964, 1964], sec: 'culture', headline: '트로트 한 곡 전국 유행', summary: '여가수의 애절한 트로트가 라디오를 타고 크게 유행했다. 뒤에 왜색 시비로 금지곡이 됐다.', src: [W('동백_아가씨')],
    links: [lk(rural, '장터 전축에서 흘러나온 노래를 어른들이 따라 불렀다.', 'happiness+1', '유행가'),
      g('라디오에서 같은 노래가 하루에도 몇 번씩 나왔다.')] },

  // ── 1965 ──
  { id: 'ng.1965.japan', years: [1965, 1965], sec: 'politics', headline: '한일 국교 정상화', summary: '한일 기본조약이 조인돼 국교가 열리고 청구권 자금이 들어오기로 했다. 반대 시위가 컸다.', src: [W('한일기본조약')],
    links: [lk(L => A(L, 4) && town(L), '시위 소식에 어른들이 대문 밖 출입을 조심했다.', 'conflict+3', '조약 반대 시위'),
      g('일본과 다시 손잡는다는 말에 어른들 의견이 갈렸다.', 'conflict+2', '국교 정상화 논란')] },
  { id: 'ng.1965.troops', years: [1965, 1965], sec: 'world', headline: '베트남 전투부대 파병', summary: '육군·해병 전투부대가 베트남으로 떠났다. 파병 장병 송금과 군납이 외화벌이가 됐다.', src: [W('베트남_전쟁_파병')],
    links: [lk(big, '사촌 형이 배를 타고 남쪽 나라로 간다며 집안이 술렁였다.', 'care+2', '파병'),
      g('부산항 환송식 장면이 대한뉴스에 나왔다.')] },
  { id: 'ng.1965.makgeolli', years: [1965, 1965], sec: 'life', headline: '쌀 막걸리 제한 시작', summary: '양곡관리법 시행으로 쌀 술 빚기가 제한되기 시작해 이듬해 전면 금지됐다. 밀가루 막걸리가 자리를 채웠다.', src: [W('막걸리'), 'https://theme.archives.go.kr/next/koreaOfRecord/sojunMakgeolli.do'],
    links: [lk(farmH, '새참 막걸리 맛이 달라졌다며 들일하는 어른들이 투덜댔다.'), g('술도가 막걸리가 밀가루로 바뀌었다.')] },
  { id: 'ng.1965.fridge', years: [1965, 1965], sec: 'tech', headline: '국산 냉장고 첫 생산', summary: '국내 전자회사가 가정용 냉장고를 처음 만들었다. 값이 비싸 부잣집 물건이었다.', src: [W('냉장고')],
    links: [lk(highQ, '집에 들어온 냉장고 덕에 여름 반찬이 덜 상했다.', 'health+1', '가전 보급'),
      g('얼음 넣지 않는 찬장 이야기에 이웃들이 놀랐다.')] },

  // ── 1966 ──
  { id: 'ng.1966.333', years: [1966, 1966], sec: 'health', headline: '"세 자녀 3년 터울" 표어', summary: '가족계획 표어가 자녀를 셋까지, 3년 터울로, 35세 이전에 낳자는 내용으로 퍼졌다.', src: [W('가족계획사업')],
    links: [lk(big, '형제 많은 집이라 동네 어른들 농담거리가 됐다.'), lk(rural, '이동 시술반 차가 마을에 들어와 어른들이 수군댔다.'), g('보건소 표어가 버스 정류장에 붙었다.')] },
  { id: 'ng.1966.nurse', years: [1966, 1966], sec: 'labor', headline: '서독 간호 인력 파견', summary: '간호사·간호조무사 수천 명이 서독 병원으로 떠났다. 이들의 송금이 외화가 됐다.', src: [W('파독_간호사')],
    links: [lk(L => lowQ(L) && big(L), '독일 간 친척 누나의 송금이 집안 살림에 보탬이 됐다.', 'living-2', '해외 송금'), g('독일로 간 간호사 언니들 편지 이야기가 이웃에서 돌았다.')] },
  { id: 'ng.1966.boxing', years: [1966, 1966], sec: 'sports', headline: '첫 프로복싱 세계 챔피언', summary: '한국 선수가 서울에서 열린 경기에서 이겨 처음으로 프로복싱 세계 타이틀을 땄다.', src: [W('1966년')],
    links: [lk(town, '만화가게 TV 앞에 동네 사람들이 모여 환호했다.', 'happiness+1 relations+1', '함께 본 경기'), g('세계 챔피언 소식에 라디오 앞이 들썩였다.', 'happiness+1', '스포츠 승리')] },
  { id: 'ng.1966.wig', years: [1966, 1969], sec: 'labor', headline: '가발·섬유 수출 호황', summary: '가발·의류·합판이 주력 수출품이 되면서 도시 공장에 젊은 일손이 몰렸다.', src: [W('가발')],
    links: [lk(L => workH(L) && town(L), '공장 일감이 늘어 집안 벌이가 조금 나아졌다.', 'living-2 wealth+1', '수출 공장 일감'),
      lk(rural, '읍내 언니들이 서울 공장 취직하러 줄줄이 떠났다.', 'region+3', '농촌 인구 유출'),
      g('공장 모집 벽보가 시장 기둥마다 붙었다.')] },

  // ── 1967 ──
  { id: 'ng.1967.drought', years: [1967, 1968], sec: 'disaster', sensitive: 'disaster', headline: '남부 지방 대가뭄', summary: '호남 등 남부 지방에 큰 가뭄이 이어져 모내기를 못 한 논이 많았다.', src: [W('1967년')],
    links: [lk(L => farmH(L) && reg(L, 'jeonnam', 'jeonbuk', 'gyeongnam', 'gyeongbuk'), '논이 갈라져 집안 어른들이 밤마다 물을 대러 나갔다.', 'living+4 region+3', '가뭄 피해'),
      lk(farmH, '가뭄 소식에 쌀값이 오를까 어른들이 걱정했다.', 'living+2', '가뭄'), g('기우제 지냈다는 마을 소식이 신문에 실렸다.')] },
  { id: 'ng.1967.guro', years: [1967, 1967], sec: 'economy', headline: '구로 수출공단 준공', summary: '서울 구로에 수출산업공단 첫 단지가 문을 열어 봉제·전자 조립 공장이 들어섰다.', src: [W('한국수출산업공단')],
    links: [lk(L => seoul(L) && workH(L), '공단 일자리가 생겨 집안 어른 출퇴근 길이 바뀌었다.', 'job-2', '공단 일자리'),
      lk(seoul, '구로 쪽 셋방이 공단 일꾼들로 금세 찼다고 했다.', 'housing+1', '공단 수요'), g('공단 준공 소식이 대한뉴스에 나왔다.')] },
  { id: 'ng.1967.anime', years: [1967, 1967], sec: 'culture', headline: '첫 국산 장편 만화영화', summary: '국내 첫 장편 애니메이션이 극장에 걸려 어린이 관객이 몰렸다.', src: [W('홍길동_(1967년_영화)')],
    links: [lk(L => A(L, 4) && town(L), '극장 앞 긴 줄에 서서 만화영화를 처음 봤다.', 'happiness+2', '첫 만화영화'), g('만화영화가 극장에 걸렸다는 소문이 아이들 사이에 돌았다.')] },
  { id: 'ng.1967.vote', years: [1967, 1967], sec: 'politics', headline: '대선·총선 잇따라', summary: '5월 대통령 선거와 6월 국회의원 선거가 치러졌다. 총선은 부정 시비로 시위가 이어졌다.', src: [W('제6대_대한민국_대통령_선거')],
    links: [lk(elem, '선거 날 학교 교실이 투표소가 돼 하루 쉬었다.', 'leisure+1', '임시 휴교'), g('선거철 막걸리 대접 이야기가 골목에 돌았다.')] },

  // ── 1968 ──
  { id: 'ng.1968.reserve', years: [1968, 1968], sec: 'politics', headline: '향토예비군 창설', summary: '1월 무장공비 침투 사건 뒤 예비군이 창설되고 학교 교련과 반공 교육이 강화됐다.', weight: 2, src: [W('향토예비군')],
    links: [lk(elem, '교실에서 반공 포스터 그리기와 웅변 대회가 열렸다.', 'conflict+2', '반공 교육'),
      lk(L => A(L, 4) && workH(L), '어른들이 예비군 훈련에 불려 나가 집이 비는 날이 생겼다.', 'leisure-1', '예비군 훈련'),
      g('간첩 신고 표어가 골목마다 붙었다.', 'conflict+2', '안보 긴장')] },
  { id: 'ng.1968.charter', years: [1968, 1968], sec: 'edu', headline: '국민교육헌장 선포', summary: '정부가 교육 이념을 담은 헌장을 선포했다. 학교마다 학생들이 전문을 외웠다.', src: [W('국민교육헌장')],
    links: [lk(elem, '헌장을 다 외워야 집에 갈 수 있어 교실에 남았다.', 'leisure-1 intellect+1', '헌장 암송'),
      lk(L => A(L, 5, 6), '형·누나들이 외우는 헌장 구절을 따라 중얼거렸다.'), g('헌장 낭독이 라디오에서 흘러나왔다.')] },
  { id: 'ng.1968.id', years: [1968, 1968], sec: 'society', headline: '주민등록증 발급 시작', summary: '18세 이상 국민에게 주민등록번호가 담긴 증을 발급하기 시작했다.', src: [W('주민등록증')],
    links: [lk(rural, '증 받으러 면사무소 앞에 어른들이 줄을 섰다.'), g('어른들 지갑에 사진 붙은 증이 하나씩 생겼다.')] },
  { id: 'ng.1968.tram', years: [1968, 1968], sec: 'life', headline: '서울 전차 운행 끝', summary: '도로 확장과 버스 증가로 서울 시내 전차가 운행을 멈추고 철거됐다.', src: [W('서울_전차')],
    links: [lk(seoul, '전찻길이 걷히고 동네 앞에 버스가 다니기 시작했다.'), g('전차가 사라진다는 기사가 사진과 함께 실렸다.')] },

  // ── 1969 ──
  { id: 'ng.1969.middle', years: [1969, 1971], sec: 'edu', headline: '중학교 무시험 진학 확대', summary: '1969년 서울을 시작으로 중학교 입학시험이 없어지고 추첨 배정이 전국으로 넓어졌다.', src: [W('중학교_무시험_진학제')],
    links: [lk(elem, '중학 입시가 없어져 국민학교 교실 분위기가 한결 느슨해졌다.', 'edu-3 leisure+1', '중학 입시 폐지'),
      lk(L => A(L, 4, 9), '언니 오빠들이 시험 없이 중학교 간다며 어른들이 반겼다.', 'edu-1', '중학 입시 폐지'),
      g('일류 중학교라는 말이 조금씩 사라졌다.')] },
  { id: 'ng.1969.moon', years: [1969, 1969], sec: 'world', headline: '인류 첫 달 착륙', summary: '미국 우주선이 달에 착륙해 우주인이 달 표면을 걸었다. 국내에도 위성 중계됐다.', src: [W('아폴로_11호')],
    links: [lk(L => A(L, 5) && town(L), '전파상 앞 텔레비전으로 달에 선 사람을 보았다.', 'intellect+1 happiness+1', '달 착륙 중계'), lk(rural, '라디오로 들은 달 이야기에 할머니가 고개를 저었다.'), g('달에 사람이 갔다는 소식에 아이들이 들떴다.', 'happiness+1', '달 착륙')] },
  { id: 'ng.1969.mixed', years: [1969, 1969], sec: 'life', headline: '혼분식 장려 강화', summary: '쌀 소비를 줄이려 음식점 쌀밥 판매를 제한하고 학교 도시락 혼식을 권했다.', src: [W('혼분식_장려_운동')],
    links: [lk(elem, '선생님이 도시락 뚜껑을 열어 보리가 섞였는지 살폈다.', 'relations-1', '혼식 검사'), lk(L => A(L, 0, 6), '밥상에 국수와 수제비가 오르는 날이 많아졌다.'), g('분식의 날 안내가 식당 앞에 붙었다.')] },
  { id: 'ng.1969.amend', years: [1969, 1969], sec: 'politics', headline: '3선 개헌 국민투표', summary: '대통령 연임 제한을 고치는 개헌안이 국민투표로 통과됐다. 대학가 반대 시위가 컸다.', src: [W('3선_개헌')],
    links: [lk(seoul, '대학가 시위 소식에 어른들이 저녁 뉴스를 끝까지 지켜봤다.', 'conflict+3', '개헌 반대 시위'), g('개헌 찬반 벽보가 담장에 나란히 붙었다.', 'conflict+2', '개헌 논란')] },
  { id: 'ng.1969.worm', years: [1969, 1969], sec: 'health', headline: '학생 기생충 집단검사', summary: '전국 학생 대상 대변 검사와 구충제 투약이 정례화됐다. 회충 감염률이 매우 높았다.', src: [W('한국건강관리협회')],
    links: [lk(elem, '채변 봉투를 학교에 내고 회충약을 받아 먹었다.', 'health+1', '구충'), g('구충제 먹는 날 안내가 반상회에 돌았다.')] },

  // ── 1970 ──
  { id: 'ng.1970.highway', years: [1970, 1970], sec: 'economy', headline: '경부고속도로 개통', summary: '서울과 부산을 잇는 고속도로가 개통돼 두 도시가 하루 생활권이 됐다.', weight: 2, src: [W('경부고속도로')],
    links: [lk(L => reg(L, 'chungbuk', 'chungnam', 'gyeongbuk', 'daegu'), '고속버스가 읍내를 지나 서울 친척 집이 가까워졌다.', 'region-2 relations+1', '교통 개선'),
      lk(farmH, '고속도로에 땅이 들어간 이웃이 보상금 이야기를 했다.'), g('고속버스 첫 운행 사진이 신문을 채웠다.')] },
  { id: 'ng.1970.wawoo', years: [1970, 1970], sec: 'disaster', sensitive: 'disaster', headline: '시민아파트 붕괴', summary: '서울 마포의 시민아파트 한 동이 준공 넉 달 만에 무너졌다. 부실 공사가 드러났다.', src: [W('와우_시민아파트_붕괴_사고')],
    links: [lk(L => seoul(L) && rentH(L), '서민 아파트도 안전한지 셋방 어른들이 불안해했다.', 'housing+3', '부실 주택 불안'), g('아파트 부실 공사 이야기가 이웃 사이에 돌았다.', 'housing+1', '주택 안전')] },
  { id: 'ng.1970.rat', years: [1970, 1970], sec: 'health', headline: '전국 쥐잡기 운동', summary: '곡식 피해를 줄이려 정한 날 전국에서 일제히 쥐약을 놓았다. 학교는 쥐꼬리를 걷기도 했다.', src: [W('쥐잡기_운동')],
    links: [lk(elem, '쥐꼬리를 숙제로 가져오라는 말에 교실이 술렁였다.'), lk(farmH, '곳간 둘레에 쥐약을 놓는 날 어른들이 아이들을 단속했다.'), g('쥐잡기 날 방송이 동네에 울렸다.')] },
  { id: 'ng.1970.tailor', years: [1970, 1970], sec: 'labor', sensitive: 'disaster', headline: '피복 노동자 분신 항거', summary: '청계천 평화시장의 젊은 재단사가 근로기준법을 지키라며 몸을 불살랐다. 노동 현실이 알려졌다.', src: [W('전태일')],
    links: [lk(L => workH(L) && seoul(L), '하루 열네 시간 일하는 공장 이야기가 남 일 같지 않았다.', 'job+3 fairness+3', '노동 현실'), g('어린 공원들의 긴 노동 이야기가 신문에 실렸다.', 'fairness+2', '노동 현실')] },
  { id: 'ng.1970.sinking', years: [1970, 1970], sec: 'disaster', sensitive: 'disaster', headline: '남해 정기여객선 침몰', summary: '제주와 부산을 오가던 여객선이 정원 초과 상태로 침몰했다. 선박 안전 점검이 강화됐다.', src: [W('남영호_침몰_사고')],
    links: [lk(L => reg(L, 'jeju', 'busan'), '뱃길 소식에 동네 어른들이 한동안 배를 타지 않았다.', 'conflict+1', '해상 사고'), g('여객선 사고 소식에 바닷가 마을이 숙연했다.')] },

  // ── 1971 ──
  { id: 'ng.1971.two', years: [1971, 1971], sec: 'health', headline: '"둘만 낳자" 가족계획', summary: '가족계획 표어가 아들딸 구별 없이 둘만 낳자는 내용으로 바뀌었다.', src: [W('가족계획사업')],
    links: [lk(big, '형제 많은 우리 집이 반에서 놀림감이 됐다.', 'relations-1', '다자녀 시선'), g('둘만 낳자는 표어가 극장 광고에 나왔다.')] },
  { id: 'ng.1971.green', years: [1971, 1971], sec: 'housing', headline: '개발제한구역 첫 지정', summary: '서울 외곽을 시작으로 도시 주변에 그린벨트를 정해 개발을 막았다.', src: [W('개발제한구역')],
    links: [lk(L => farmH(L) && reg(L, 'gyeonggi'), '논밭이 묶여 집 짓기도 팔기도 어렵다고 어른들이 말했다.', 'region+2', '개발 제한'), g('도시 둘레 땅이 묶인다는 기사가 났다.')] },
  { id: 'ng.1971.fire', years: [1971, 1971], sec: 'disaster', sensitive: 'disaster', headline: '서울 도심 호텔 화재', summary: '성탄절 서울 도심 고층 호텔에서 큰불이 나 많은 인명 피해가 났다. 고층 소방 대책이 논의됐다.', src: [W('대연각호텔_화재')],
    links: [lk(seoul, '도심 하늘로 연기가 오르는 걸 보고 어른들이 발을 동동 굴렀다.', 'conflict+1', '도심 화재'), g('고층 건물 화재 소식이 연말 분위기를 가라앉혔다.')] },
  { id: 'ng.1971.vote', years: [1971, 1971], sec: 'politics', headline: '대통령·국회의원 선거', summary: '4월 대통령 선거와 5월 총선이 잇따라 치러졌다. 도시와 농촌 표심이 갈렸다.', src: [W('제7대_대한민국_대통령_선거')],
    links: [lk(L => A(L, 8) && school(L), '선거 날 학교가 투표소가 돼 하루 쉬었다.', 'leisure+1', '임시 휴교'), g('선거 유세장 인파 사진이 신문에 실렸다.')] },
  { id: 'ng.1971.gwangju', years: [1971, 1971], sec: 'housing', headline: '도시 이주민 집단 항의', summary: '서울 판자촌 철거민이 옮겨 간 경기 광주 대단지에서 생활 기반 부족에 항의가 터졌다.', src: [W('광주_대단지_사건')],
    links: [lk(L => seoul(L) && monH(L), '판자촌 철거 이야기에 셋방 어른들이 이사 걱정을 했다.', 'housing+3', '철거 이주 불안'), g('철거민 이주 단지 소식이 신문에 실렸다.', 'housing+1', '도시 이주')] },

  // ── 1972 ──
  { id: 'ng.1972.joint', years: [1972, 1972], sec: 'politics', headline: '7·4 남북공동성명', summary: '남북이 자주·평화·민족 대단결의 통일 원칙에 합의했다고 동시에 발표했다.', src: [W('7·4_남북_공동_성명')],
    links: [lk(L => big(L) || farmH(L), '고향 두고 온 어른들이 혹시나 하며 라디오를 붙들었다.', 'conflict-1', '남북 대화'), g('통일이 오나 하는 이야기가 밥상에 올랐다.', 'conflict-1', '남북 대화')] },
  { id: 'ng.1972.yusin', years: [1972, 1972], sec: 'politics', headline: '10월 유신, 새 헌법', summary: '비상계엄 아래 국회가 해산되고 대통령 간선제 새 헌법이 국민투표로 확정됐다.', weight: 2, src: [W('10월_유신')],
    links: [lk(school, '학교에서 새 헌법 홍보 글짓기를 했다.', 'conflict+1', '유신 홍보'), g('계엄 소식에 어른들이 말을 아꼈다.', 'conflict+3', '정치 통제')] },
  { id: 'ng.1972.debt', years: [1972, 1972], sec: 'economy', headline: '8·3 사채 동결 조치', summary: '기업이 진 사채를 동결해 낮은 이자로 나눠 갚게 한 긴급 조치가 나왔다.', src: [W('8·3_조치')],
    links: [lk(highQ, '집에서 빌려준 돈이 묶였다며 어른들 얼굴이 굳었다.', 'wealth-1 living+2', '사채 동결'), lk(L => workH(L) && town(L), '회사 사정이 풀린다는 말에 공장 어른들이 안도했다.', 'job-1', '기업 부담 완화'), g('사채를 묶었다는 발표가 라디오에 나왔다.')] },
  { id: 'ng.1972.tongil', years: [1972, 1972], sec: 'economy', headline: '다수확 신품종 벼 보급', summary: '수확량이 많은 새 벼 품종이 농가에 본격 보급됐다. 맛은 덜하다는 평이 있었다.', src: [W('통일벼')],
    links: [lk(farmH, '새 볍씨를 받아 심고 소출이 늘었다며 어른들이 반겼다.', 'living-2 wealth+1', '다수확 품종'), g('새 볍씨 밥맛을 두고 이웃끼리 말이 갈렸다.')] },
  { id: 'ng.1972.flood', years: [1972, 1972], sec: 'disaster', sensitive: 'disaster', headline: '중부 지방 집중호우', summary: '8월 중부 지방에 큰비가 내려 서울·경기 저지대 주택이 대거 잠겼다.', src: [W('1972년_8월_대홍수')],
    links: [lk(L => (seoul(L) || reg(L, 'gyeonggi')) && monH(L), '셋방 문턱까지 물이 차 이불을 들고 학교로 피했다.', 'housing+3 health-1', '수해'), lk(L => seoul(L) || reg(L, 'gyeonggi'), '동네 저지대가 잠겨 이웃들이 짐을 날랐다.', 'relations+1', '수해 복구'), g('수재의연금 모금 소식이 라디오에 나왔다.')] },

  // ── 1973 ──
  { id: 'ng.1973.heavy', years: [1973, 1973], sec: 'economy', headline: '중화학공업 육성 선언', summary: '정부가 철강·조선·기계·화학 등 중화학공업을 집중 육성하겠다고 발표했다.', src: [W('중화학공업화_선언')],
    links: [lk(L => workH(L) && reg(L, 'gyeongnam', 'gyeongbuk', 'busan'), '새 공장 일자리 소식에 어른들이 이직을 생각했다.', 'job-2', '중공업 일자리'), g('조선소·제철소 건설 소식이 연일 나왔다.')] },
  { id: 'ng.1973.hair', years: [1973, 1973], sec: 'society', headline: '장발·미니스커트 단속', summary: '경범죄 처벌법이 바뀌어 남자 장발과 짧은 치마를 경찰이 단속했다.', src: [W('경범죄처벌법')],
    links: [lk(teen, '학교 앞에서 두발 검사에 걸린 형들이 머리를 깎였다.', 'fairness+1', '두발 단속'), lk(town, '거리에서 자로 치마 길이를 재는 장면이 화제가 됐다.'), g('머리 길이 단속 이야기가 이발소에서 돌았다.')] },
  { id: 'ng.1973.rites', years: [1973, 1973], sec: 'life', headline: '가정의례법 시행', summary: '허례허식을 줄이려 청첩장 돌리기·화환 진열 등 혼례·장례 관행을 법으로 제한했다.', src: [W('가정의례준칙')],
    links: [lk(rural, '마을 잔치가 간소해졌다며 어른들이 아쉬워했다.'), g('결혼식 답례품을 줄이라는 안내가 붙었다.')] },
  { id: 'ng.1973.tt', years: [1973, 1973], sec: 'sports', headline: '세계탁구 여자 단체 우승', summary: '사라예보 세계탁구선수권에서 한국 여자 대표팀이 단체전 정상에 올랐다.', src: [W('1973년_세계_탁구_선수권_대회')],
    links: [lk(school, '학교 탁구대에 아이들이 줄을 서기 시작했다.', 'happiness+1', '탁구 열풍'), g('카퍼레이드 소식에 동네가 들떴다.', 'happiness+1', '국제대회 우승')] },
  { id: 'ng.1973.dam', years: [1973, 1973], sec: 'economy', headline: '소양강 다목적댐 준공', summary: '홍수를 막고 수도권 물을 대는 큰 다목적댐이 강원에 준공됐다. 수몰 마을 주민이 떠났다.', src: [W('소양강댐')],
    links: [lk(L => reg(L, 'gangwon') && farmH(L), '물에 잠긴 이웃 마을 사람들이 고향을 떠났다.', 'region+3', '수몰 이주'), lk(seoul, '한강 물난리가 줄어들 거라고 어른들이 말했다.'), g('큰 댐 준공 사진이 신문에 실렸다.')] },

  // ── 1974 ──
  { id: 'ng.1974.subway', years: [1974, 1974], sec: 'life', headline: '서울 첫 지하철 개통', summary: '서울역~청량리 지하철이 열리고 수도권 국철과 이어 운행했다.', weight: 2, src: [W('수도권_전철_1호선')],
    links: [lk(seoul, '어른 손잡고 처음 지하철을 타 보았다.', 'happiness+1', '지하철 개통'), lk(L => reg(L, 'gyeonggi', 'incheon'), '전철로 서울 가는 길이 빨라졌다며 어른들이 반겼다.', 'region-1', '통근 편의'), g('땅 밑으로 다니는 기차 소식이 화제가 됐다.')] },
  { id: 'ng.1974.inflation', years: [1974, 1974], sec: 'economy', headline: '석유값 여파로 물가 급등', summary: '석유파동 여파로 한 해 물가가 20%대로 뛰었다. 연탄·버스 요금이 잇따라 올랐다.', src: [W('1974년')],
    links: [lk(monH, '연탄값이 올라 셋방에서 한 장씩 아껴 땠다.', 'living+4 health-1', '연료비 상승'), lk(farmH, '비료·기름값이 올라 농사 셈이 어려워졌다.', 'living+3', '농자재 상승'), g('장바구니 물가 이야기가 반상회 단골이 됐다.', 'living+2', '물가 급등')] },
  { id: 'ng.1974.lunch', years: [1974, 1976], sec: 'edu', headline: '도시락 혼식 검사', summary: '쌀 절약을 위해 학교가 점심 도시락에 잡곡을 섞었는지 검사했다.', ages: [7, 18], src: [W('혼분식_장려_운동')],
    links: [lk(L => school(L) && lowQ(L), '보리 섞인 도시락이 오히려 검사에 쉽게 통과했다.'), lk(school, '흰밥 위에 보리를 얹어 검사를 넘기는 친구가 있었다.', 'relations+1', '도시락 풍경'), g('도시락 검사 이야기가 어른들 술자리 웃음거리였다.')] },
  { id: 'ng.1974.champ', years: [1974, 1974], sec: 'sports', headline: '해외 원정 복싱 세계 정상', summary: '한국 선수가 남아공 원정 경기에서 이겨 프로복싱 세계 타이틀을 차지했다.', src: [W('1974년')],
    links: [lk(L => A(L, 6), '새벽 라디오 중계에 집 안이 들썩였다.', 'happiness+1', '경기 중계'), g('챔피언 귀국 소식에 거리가 붐볐다.')] },
  { id: 'ng.1974.power', years: [1974, 1976], sec: 'life', headline: '농어촌 전기 보급 확대', summary: '농어촌 전기 사업이 빨라져 1970년대 중반 시골 마을에도 전등이 빠르게 들어갔다.', src: [W('한국전력공사')],
    links: [lk(rural, '호롱불 대신 전등이 켜져 밤에도 숙제를 할 수 있었다.', 'intellect+1 region-2', '전기 보급'), lk(farmH, '전기가 들어와 마을에 처음 텔레비전이 생겼다.', 'happiness+1', '전기 보급'), g('전기 들어간 마을 잔치 사진이 신문에 실렸다.')] },

  // ── 1975 ──
  { id: 'ng.1975.saigon', years: [1975, 1975], sec: 'world', headline: '남베트남 패망', summary: '베트남 전쟁이 북베트남의 사이공 점령으로 끝났다. 국내 안보 경각심이 커졌다.', src: [W('사이공_함락')],
    links: [lk(school, '학교에서 안보 궐기 대회가 열렸다.', 'conflict+2', '안보 교육'), g('남의 나라 일이 아니라는 말이 라디오에서 되풀이됐다.', 'conflict+2', '안보 불안')] },
  { id: 'ng.1975.civil', years: [1975, 1975], sec: 'society', headline: '민방위대 창설', summary: '20~50세 남자를 중심으로 민방위대가 만들어져 정기 훈련을 받았다.', src: [W('민방위')],
    links: [lk(L => A(L, 6), '사이렌 울리면 책상 밑에 숨는 훈련을 했다.', 'conflict+1', '민방위 훈련'), g('민방위 날이면 거리 차들이 멈춰 섰다.')] },
  { id: 'ng.1975.youth', years: [1975, 1975], sec: 'culture', headline: '통기타·청바지 청년문화', summary: '포크송과 통기타, 청바지, 생맥주로 대표되는 청년문화가 대학가를 중심으로 번졌다.', src: [W('한국의_포크_음악')],
    links: [lk(L => A(L, 12) && town(L), '라디오 포크송을 공책에 받아 적었다.', 'happiness+1', '청년문화'), g('통기타 메고 다니는 대학생들이 거리에 늘었다.')] },
  { id: 'ng.1975.yeongdong', years: [1975, 1975], sec: 'economy', headline: '영동·동해고속도로 개통', summary: '수도권과 강릉, 동해안을 잇는 고속도로가 열려 강원 영동 길이 짧아졌다.', src: [W('영동고속도로')],
    links: [lk(L => reg(L, 'gangwon'), '대관령 넘는 길이 빨라져 서울 친척 오가기가 쉬워졌다.', 'region-2', '교통 개선'), g('동해안 여행길이 짧아졌다는 기사가 났다.')] },
  { id: 'ng.1975.corps', years: [1975, 1975], sec: 'edu', headline: '학도호국단 결성', summary: '고교·대학에 학도호국단이 조직돼 학생회 대신 군사 훈련과 행사를 맡았다.', src: [W('학도호국단')],
    links: [lk(teen, '형들 교련 사열 연습에 중학교 운동장도 들썩였다.', 'leisure-1', '학도호국단'), g('교련 시간이 늘었다는 이야기가 들렸다.')] },

  // ── 1976 ──
  { id: 'ng.1976.mideast', years: [1976, 1978], sec: 'labor', headline: '중동 건설 붐', summary: '중동 산유국 건설 공사 수주가 늘어 수많은 근로자가 사막 현장으로 떠났다.', weight: 2, src: [W('중동_건설_붐')],
    links: [lk(L => workH(L) && A(L, 0, 15), '집안 어른이 중동 현장으로 떠나 편지와 송금이 오갔다.', 'wealth+1 care+2', '해외 근로'), lk(workH, '사우디 가면 목돈 번다는 말에 어른들이 지원 서류를 썼다.', 'job-1', '해외 취업'), g('중동 근로자 송금이 외화를 늘렸다는 기사가 났다.')] },
  { id: 'ng.1976.car', years: [1976, 1976], sec: 'tech', headline: '첫 국산 고유모델 승용차', summary: '국내 기술로 설계한 첫 고유모델 승용차가 시판돼 택시로 많이 쓰였다.', src: [W('현대_포니')],
    links: [lk(highQ, '집에 국산 승용차가 들어와 동네 아이들이 구경 왔다.', 'happiness+1', '자가용'), lk(town, '새 택시를 처음 타 보고 신기해했다.'), g('국산 차가 수출된다는 말에 어른들이 뿌듯해했다.')] },
  { id: 'ng.1976.gold', years: [1976, 1976], sec: 'sports', headline: '정부 수립 후 첫 올림픽 금', summary: '몬트리올 올림픽 레슬링에서 한국 선수가 정부 수립 뒤 첫 금메달을 땄다.', src: [W('1976년_하계_올림픽')],
    links: [lk(school, '교실에서 레슬링 흉내 내는 아이들이 늘었다.', 'happiness+1', '첫 금메달'), g('첫 금메달 소식에 동네 어른들이 술잔을 들었다.', 'happiness+1', '첫 금메달')] },
  { id: 'ng.1976.jsa', years: [1976, 1976], sec: 'politics', headline: '판문점 충돌로 긴장 고조', summary: '8월 판문점 공동경비구역에서 유엔군이 공격받는 사건이 나 남북 긴장이 높아졌다.', src: [W('판문점_도끼_만행_사건')],
    links: [lk(L => reg(L, 'gyeonggi', 'gangwon'), '접경 마을이라 어른들이 피란 짐 이야기를 꺼냈다.', 'conflict+4', '접경 긴장'), g('전쟁 나는 거 아니냐는 말이 밥상에 올랐다.', 'conflict+2', '안보 긴장')] },
  { id: 'ng.1976.robot', years: [1976, 1976], sec: 'culture', headline: '국산 로봇 만화영화 흥행', summary: '태권도를 하는 거대 로봇이 나오는 국산 만화영화가 여름방학 극장가를 휩쓸었다.', ages: [3, 15], src: [W('로보트_태권_V')],
    links: [lk(L => elem(L) && town(L), '극장에서 본 로봇 주제가를 반 아이들이 다 같이 불렀다.', 'happiness+2 relations+1', '만화영화 열풍'), lk(rural, '읍내 극장 나들이 이야기를 형들에게 들으며 부러워했다.'), g('로봇 딱지와 그림이 골목에 유행했다.', 'happiness+1', '만화 유행')] },

  // ── 1977 ──
  { id: 'ng.1977.insure', years: [1977, 1977], sec: 'health', headline: '직장 의료보험 시작', summary: '500인 이상 사업장 근로자와 가족을 대상으로 의료보험이 처음 시행됐다.', weight: 2, src: [W('국민건강보험')],
    links: [lk(L => ['1', '2', '3'].includes(fj(L)) && town(L), '큰 회사 다니는 집이라 보험증으로 병원비 걱정이 줄었다.', 'medical-3 health+1', '직장 의보 적용'), lk(farmH, '농사짓는 집은 해당이 없어 병원비는 여전히 큰돈이었다.', 'medical+3 fairness+2', '의보 미적용'), g('보험증이 있는 집과 없는 집 이야기가 나왔다.', 'fairness+1', '의보 격차')] },
  { id: 'ng.1977.rice', years: [1977, 1977], sec: 'economy', headline: '쌀 자급 달성 발표', summary: '다수확 품종 덕에 쌀 생산이 늘어 자급을 이뤘다고 정부가 발표했다. 쌀 막걸리가 다시 허용됐다.', src: [W('녹색혁명')],
    links: [lk(farmH, '수매가 잘돼 집에 모처럼 목돈이 들어왔다.', 'wealth+1 living-2', '쌀 증산'), lk(school, '도시락 혼식 검사가 느슨해졌다.'), g('흰 쌀밥 걱정이 줄었다며 어른들이 반겼다.', 'living-1', '쌀 자급')] },
  { id: 'ng.1977.iri', years: [1977, 1977], sec: 'disaster', sensitive: 'disaster', headline: '전북 철도역 화약 폭발', summary: '전북 이리역에서 화약 실은 화물열차가 폭발해 역 일대가 크게 부서졌다.', src: [W('이리역_폭발_사고')],
    links: [lk(L => reg(L, 'jeonbuk'), '가까운 도시 소식에 어른들이 친척 안부를 묻느라 바빴다.', 'conflict+2', '대형 사고'), g('화약 열차 사고 소식에 안전 이야기가 돌았다.')] },
  { id: 'ng.1977.everest', years: [1977, 1977], sec: 'sports', headline: '에베레스트 첫 등정', summary: '한국 원정대가 세계 최고봉 에베레스트에 처음 올랐다.', src: [W('1977년_한국_에베레스트_원정대')],
    links: [lk(school, '산악부에 들겠다는 친구가 늘었다.', 'happiness+1', '등정 소식'), g('세계 최고봉 등정 소식에 신문이 호외를 냈다.')] },
  { id: 'ng.1977.vat', years: [1977, 1977], sec: 'economy', headline: '부가가치세 시행', summary: '물건값에 10% 세금을 붙이는 부가가치세가 시행돼 가게 셈법이 바뀌었다.', src: [W('부가가치세')],
    links: [lk(L => fj(L) === '5', '가게 하는 집이라 장부 정리하느라 밤늦게 불이 켜졌다.', 'leisure-1 living+2', '세제 변화'), g('물건값이 오를까 어른들이 걱정했다.', 'living+1', '부가세 도입')] },

  // ── 1978 ──
  { id: 'ng.1978.nuke', years: [1978, 1978], sec: 'tech', headline: '첫 원자력발전소 가동', summary: '부산 고리에서 국내 첫 원자력발전소가 상업 운전에 들어갔다.', src: [W('고리_원자력_발전소')],
    links: [lk(L => reg(L, 'busan', 'gyeongnam'), '가까운 바닷가에 원전이 돈다며 어른들이 수군댔다.', 'region+1', '원전 입지'), g('원자력 시대가 열렸다는 교과서 이야기가 나왔다.', 'tech+1', '원전 가동')] },
  { id: 'ng.1978.apt', years: [1978, 1978], sec: 'housing', headline: '아파트 분양 과열', summary: '서울 강남 등 아파트 분양에 웃돈이 붙고 투기가 번지자 정부가 투기 억제책을 냈다.', weight: 2, src: [W('8·8_부동산_투기_억제_대책')],
    links: [lk(L => seoul(L) && rentH(L), '셋방 어른들이 아파트 추첨 신청서를 들여다보았다.', 'housing+4', '분양 과열'), lk(L => seoul(L) && ownH(L), '집값이 뛴다는 소문에 이웃 어른들이 들떴다.', 'housing+1', '집값 상승'), g('강남 땅값 이야기가 신문 경제면을 채웠다.', 'housing+2 fairness+1', '부동산 과열')] },
  { id: 'ng.1978.nature', years: [1978, 1978], sec: 'society', headline: '자연보호헌장 선포', summary: '산림과 하천을 지키자는 자연보호헌장이 선포되고 학교마다 정화 활동을 했다.', src: [W('자연보호헌장')],
    links: [lk(school, '주말마다 집게 들고 뒷산 쓰레기를 주웠다.', 'leisure-1 relations+1', '정화 활동'), g('자연보호 표어가 등산로 입구에 걸렸다.')] },
  { id: 'ng.1978.rural', years: [1975, 1978], sec: 'society', headline: '이촌향도, 도시로 대이동', summary: '1970년대 중후반 농촌 젊은이들이 일자리를 찾아 서울과 공업도시로 대거 옮겨 갔다.', src: [W('이촌향도')],
    links: [lk(rural, '마을 분교에 아이가 줄어 반이 합쳐졌다.', 'region+3', '농촌 인구 감소'), lk(L => seoul(L) && monH(L), '시골에서 올라온 사촌이 우리 셋방에 얹혀 지냈다.', 'housing+2 relations+1', '상경 친척'), g('명절이면 고향 가는 열차표 줄이 길게 늘어섰다.')] },
  { id: 'ng.1978.gun', years: [1978, 1978], sec: 'sports', headline: '세계사격선수권 서울 개최', summary: '서울 태릉에서 세계사격선수권이 열렸다. 국내 첫 대형 국제 종합 경기장 운영 경험이었다.', src: [W('1978년')],
    links: [lk(L => seoul(L) && school(L), '학교에서 국제대회 환영 행사 연습에 나갔다.', 'leisure-1', '행사 동원'), g('국제대회를 서울에서 연다는 소식에 어른들이 뿌듯해했다.')] },

  // ── 1979 ──
  { id: 'ng.1979.stabilize', years: [1979, 1979], sec: 'economy', headline: '경제안정화 시책 발표', summary: '과열된 투자와 물가를 잡으려 정부가 긴축 중심의 안정화 시책을 내놓았다.', src: [W('1979년')],
    links: [lk(L => wage(L) && factory(L), '공장 증설이 멈춰 잔업이 줄고 월급봉투가 얇아졌다.', 'job+3 wealth-1', '긴축'), lk(workH, '공장 일감이 줄었다는 어른들 말에 집안이 조용해졌다.', 'job+2 living+2', '긴축'), g('허리띠를 졸라매자는 말이 다시 나왔다.', 'living+1', '긴축')] },
  { id: 'ng.1979.oil2', years: [1979, 1979], sec: 'world', headline: '이란 혁명, 유가 재급등', summary: '이란 혁명으로 원유 공급이 흔들려 국제 유가가 다시 크게 올랐다.', src: [W('1979년_석유_파동')],
    links: [lk(monH, '석유 곤로 기름값이 올라 겨울 난방을 줄였다.', 'living+4 health-1', '유가 상승'), lk(L => emp(L) && jm(L, '8'), '운전 일에 기름값 부담이 커졌다.', 'living+3 job+2', '유가 상승'), g('기름 아껴 쓰자는 캠페인이 다시 시작됐다.', 'living+2', '유가 상승')] },
  { id: 'ng.1979.bm', years: [1979, 1979], sec: 'politics', headline: '부산·마산 대규모 시위', summary: '10월 부산과 마산에서 유신 반대 시위가 크게 일어나 계엄과 위수령이 선포됐다.', src: [W('부마_민주_항쟁')],
    links: [lk(L => reg(L, 'busan', 'gyeongnam') && uni(L), '학교 앞에 군인이 서고 휴교령이 내려졌다.', 'conflict+4 edu+1', '계엄·휴교'), lk(L => reg(L, 'busan', 'gyeongnam'), '시내에 군인이 깔려 어른들이 외출을 삼갔다.', 'conflict+4', '계엄'), g('남쪽 도시 시위 소식이 귓속말로 전해졌다.', 'conflict+2', '정국 불안')] },
  { id: 'ng.1979.1026', years: [1979, 1979], sec: 'politics', headline: '대통령 유고, 비상계엄', summary: '10월 26일 대통령이 피격으로 서거해 비상계엄이 선포되고 정국이 급변했다.', weight: 2, src: [W('10·26_사건')],
    links: [lk(school, '학교마다 분향소가 차려지고 조회가 길어졌다.', 'conflict+2', '국가 애도'), lk(army, '부대에 비상이 걸려 휴가가 모두 취소됐다.', 'leisure-2 conflict+3', '비상계엄'), g('텔레비전이 며칠 동안 같은 화면만 내보냈다.', 'conflict+3', '정국 급변')] },
  { id: 'ng.1979.tv', years: [1979, 1979], sec: 'culture', headline: 'TV 수상기 보급 확산', summary: '1970년대 말 흑백 TV가 도시 가정 대부분에 보급돼 저녁 연속극이 가족 일과가 됐다.', src: [W('대한민국의_텔레비전_방송')],
    links: [lk(L => rural(L) && lowQ(L), 'TV 있는 이웃집 마루에 저녁마다 아이들이 모였다.', 'relations+1', 'TV 마실'), lk(town, '저녁 연속극 시간엔 온 식구가 TV 앞에 모였다.', 'relations+1', '가족 시청'), g('연속극 줄거리가 다음 날 동네 화제가 됐다.')] },

  // ── 1980 ──
  { id: 'ng.1980.gwangju', years: [1980, 1980], sec: 'politics', sensitive: 'disaster', headline: '광주 민주화운동', summary: '5월 광주에서 계엄 확대에 맞선 시민 항쟁이 열흘간 이어졌고 계엄군 진압으로 많은 희생이 났다.', weight: 2, src: [W('5·18_민주화운동')],
    links: [lk(L => reg(L, 'jeonnam'), '시내가 막혀 친척 소식을 며칠이나 알 수 없었다.', 'conflict+6 happiness-2', '광주 항쟁'), lk(uni, '대학에 휴교령이 내려 캠퍼스 문이 닫혔다.', 'conflict+4 edu+2', '휴교령'), g('보도가 통제돼 소문만 귓속말로 돌았다.', 'conflict+3', '보도 통제')] },
  { id: 'ng.1980.minus', years: [1980, 1980], sec: 'economy', headline: '첫 마이너스 성장', summary: '정치 불안과 유가 상승, 흉작이 겹쳐 경제가 처음으로 뒷걸음질 쳤다. 물가는 30% 가까이 올랐다.', weight: 2, src: [W('1980년')],
    links: [lk(L => wage(L) && factory(L), '공장 가동이 줄어 휴업 날이 잦아졌다.', 'job+4 wealth-1', '불황'), lk(seek, '일자리 구하기가 더 어려워져 원서 낼 곳이 줄었다.', 'job+4', '불황'), lk(workH, '어른들 일감이 줄어 집안 살림을 바짝 졸랐다.', 'living+3', '불황'), g('물가가 뛰어 시장 보기가 겁난다는 말이 나왔다.', 'living+3', '물가 급등')] },
  { id: 'ng.1980.cold', years: [1980, 1980], sec: 'disaster', sensitive: 'disaster', headline: '냉해로 벼농사 흉작', summary: '여름 저온으로 벼가 제대로 여물지 않아 쌀 수확이 크게 줄었다. 쌀 수입이 늘었다.', src: [W('1980년')],
    links: [lk(farmH, '쭉정이 벼만 남아 집안 한 해 수입이 반 토막 났다.', 'living+5 wealth-1', '냉해 흉작'), lk(rural, '마을 논이 누렇게 시들어 어른들 한숨이 길었다.', 'region+2', '냉해'), g('쌀값 오를 걱정이 다시 나왔다.', 'living+1', '흉작')] },
  { id: 'ng.1980.color', years: [1980, 1980], sec: 'culture', headline: '컬러 텔레비전 방송', summary: '12월 컬러 TV 방송이 시작돼 수상기 판매가 늘고 옷차림·광고가 화려해졌다.', src: [W('대한민국의_컬러_텔레비전_방송')],
    links: [lk(L => highQ(L) && A(L, 3, 15), '집에 컬러 TV가 들어와 만화가 총천연색이 됐다.', 'happiness+2', '컬러 TV'), lk(L => lowQ(L) && A(L, 3, 15), '컬러 TV 있는 친구 집에 놀러 가 만화를 봤다.', 'relations+1', '컬러 TV'), g('전파상 진열장 앞에 컬러 화면 구경꾼이 모였다.')] },
  { id: 'ng.1980.press', years: [1980, 1980], sec: 'politics', headline: '언론기관 통폐합', summary: '신군부가 신문·방송사를 강제로 합치거나 없앴다. 지방지와 민영 방송이 정리됐다.', src: [W('언론_통폐합')],
    links: [lk(uni, '즐겨 듣던 방송이 사라져 학교 앞 다방 화제가 됐다.', 'conflict+2', '언론 통제'), g('보던 방송 채널이 바뀌어 어른들이 어리둥절했다.', 'conflict+1', '방송 통폐합')] },

  // ── 1981 ──
  { id: 'ng.1981.seoul88', years: [1981, 1981], sec: 'sports', headline: '서울, 올림픽 개최지로', summary: '국제올림픽위원회 총회에서 서울이 1988년 하계 올림픽 개최지로 뽑혔다.', weight: 2, src: [W('1988년_하계_올림픽')],
    links: [lk(L => seoul(L) && ownH(L), '경기장 짓는다는 동네 소문에 집값 이야기가 나왔다.', 'housing+1', '개발 기대'), lk(school, '조회 시간에 올림픽 유치 소식을 들으며 박수를 쳤다.', 'happiness+1', '올림픽 유치'), g('서울에서 올림픽이 열린다는 호외가 나왔다.', 'happiness+1', '올림픽 유치')] },
  { id: 'ng.1981.exam', years: [1981, 1981], sec: 'edu', headline: '본고사 없는 대입 시작', summary: '대학별 본고사가 폐지되고 예비고사 성적과 고교 내신으로 뽑는 입시가 처음 치러졌다.', src: [W('대학입학학력고사')],
    links: [lk(L => st(L, 'high', 'retake'), '내신이 중요해져 학교 시험마다 신경이 곤두섰다.', 'edu+3', '입시 제도 변화'), lk(teen, '선배들 입시 방식이 바뀌었다는 말에 내신을 챙겼다.', 'edu+1', '입시 변화'), g('입시 제도가 또 바뀌었다는 기사가 났다.')] },
  { id: 'ng.1981.gukpung', years: [1981, 1981], sec: 'culture', headline: '정부 주도 대형 축제', summary: '서울 여의도에서 전국 대학생 민속 축제를 내세운 정부 주도 대규모 행사가 닷새간 열렸다.', src: [W('국풍_81')],
    links: [lk(uni, '학교에서 행사 동원 이야기가 나와 친구들 사이 의견이 갈렸다.', 'conflict+2', '동원 행사'), lk(seoul, '여의도 행사장에 구경 가는 이웃이 많았다.'), g('축제 중계가 텔레비전을 채웠다.')] },
  { id: 'ng.1981.debt', years: [1981, 1981], sec: 'economy', headline: '외채 300억 달러 넘어', summary: '중화학 투자와 유가 부담으로 나라 빚이 크게 늘어 외채 문제가 경제 화두가 됐다.', src: [W('1981년')],
    links: [lk(uni, '경제학 수업에서 외채 위기 토론이 뜨거웠다.', 'intellect+1', '외채 논쟁'), g('나라 빚 이야기가 신문 사설에 자주 실렸다.', 'living+1', '외채 부담')] },

  // ── 1982 ──
  { id: 'ng.1982.curfew', years: [1982, 1982], sec: 'society', headline: '야간 통행금지 해제', summary: '1월 5일 36년 넘게 이어진 자정~새벽 4시 통행금지가 접적·해안 지역을 빼고 풀렸다.', weight: 2, src: [W('야간_통행금지')],
    links: [lk(L => uni(L) || (emp(L) && A(L, 19)), '막차 걱정 없이 밤늦게까지 친구들과 어울렸다.', 'leisure+2 relations+1', '통금 해제'), lk(L => jm(L, '4', '5'), '가게 문 닫는 시간이 늦어져 밤 장사가 늘었다.', 'wealth+1 leisure-1', '야간 영업'), lk(teen, '어른들이 밤늦게 들어와도 혼나지 않는다며 웃었다.'), g('자정 사이렌이 사라진 첫날 밤 거리가 북적였다.', 'happiness+1', '통금 해제')] },
  { id: 'ng.1982.baseball', years: [1982, 1982], sec: 'sports', headline: '프로야구 출범', summary: '여섯 구단으로 프로야구가 개막했다. 연고지 구단의 어린이 회원 모집이 큰 인기를 끌었다.', weight: 2, src: [W('KBO_리그')],
    links: [lk(elem, '어린이 회원 점퍼를 입고 학교에 가 반 친구들에게 자랑했다.', 'happiness+2 relations+1', '어린이 회원'), lk(L => A(L, 15), '퇴근 뒤 동네 TV 앞에서 고향 팀을 응원했다.', 'happiness+1 leisure+1', '프로야구'), g('고향 팀 이야기로 동네 어른들이 편을 갈랐다.', 'happiness+1', '프로야구')] },
  { id: 'ng.1982.realname', years: [1982, 1982], sec: 'economy', headline: '금융실명제 추진 발표', summary: '대형 어음 사기 사건 뒤 정부가 가명 금융거래를 막는 실명제 추진을 발표했다가 미뤘다.', src: [W('금융실명제')],
    links: [lk(L => emp(L) && A(L, 20), '월급 통장을 실명으로 바꾸라는 말이 사무실에 돌았다.'), g('큰돈 굴리는 사람들 이야기가 신문을 채웠다.', 'fairness+2', '금융 비리')] },
  { id: 'ng.1982.uniform', years: [1982, 1982], sec: 'edu', headline: '두발·교복 자율화 발표', summary: '정부가 중·고생 두발 자율화와 이듬해 교복 자율화를 발표했다.', ages: [10, 18], src: [W('교복_자율화')],
    links: [lk(teen, '빡빡 깎던 머리를 기를 수 있게 돼 교실이 들떴다.', 'happiness+2', '두발 자율화'), lk(elem, '형들이 머리를 기른다며 거울 앞에 오래 서 있었다.'), g('학생 머리 단속이 풀린다는 소식이 들렸다.')] },
  { id: 'ng.1982.worldbb', years: [1982, 1982], sec: 'sports', headline: '세계야구선수권 우승', summary: '서울에서 열린 세계 아마추어 야구 선수권에서 한국이 결승을 뒤집고 우승했다.', src: [W('1982년_세계_야구_선수권_대회')],
    links: [lk(school, '결승 역전 장면을 다음 날 반 전체가 따라 했다.', 'happiness+1 relations+1', '야구 우승'), g('역전 우승 소식에 동네가 들썩였다.', 'happiness+1', '야구 우승')] },
  { id: 'ng.1982.comic', years: [1982, 1982], sec: 'culture', headline: '어린이 만화잡지 창간', summary: '연재 만화를 묶은 월간 어린이 만화잡지가 나와 만화방·문방구에 줄을 섰다.', ages: [6, 16], src: [W('보물섬_(잡지)')],
    links: [lk(L => elem(L) && lowQ(L), '잡지는 친구한테 빌려 돌려 보며 다음 호를 기다렸다.', 'relations+1', '만화 돌려보기'), lk(elem, '용돈 모아 산 만화잡지를 반 친구들과 돌려 봤다.', 'happiness+1 relations+1', '만화잡지'), g('만화방에 아이들이 몰렸다.')] },

  // ── 1983 ──
  { id: 'ng.1983.uniform', years: [1983, 1983], sec: 'edu', headline: '교복 자율화 시행', summary: '중·고교 교복이 폐지돼 학생들이 사복을 입고 등교했다. 옷값 부담과 유행 경쟁이 생겼다.', ages: [12, 18], src: [W('교복_자율화')],
    links: [lk(L => teen(L) && lowQ(L), '입을 사복이 몇 벌 없어 같은 옷을 돌려 입었다.', 'fairness+2 happiness-1', '사복 부담'), lk(L => teen(L) && highQ(L), '유행하는 상표 옷을 입고 등교해 눈길을 받았다.', 'happiness+1', '사복 등교'), lk(teen, '교복 대신 사복을 입고 학교에 가니 어색하고 설렜다.', 'happiness+1', '교복 자율화'), g('학생들 옷차림이 거리 풍경을 바꿨다.')] },
  { id: 'ng.1983.family', years: [1983, 1983], sec: 'society', headline: '이산가족 찾기 생방송', summary: '공영방송 특별 생방송으로 한국전쟁 때 헤어진 가족 1만여 명이 다시 만났다.', weight: 2, src: [W('이산가족을_찾습니다')],
    links: [lk(L => big(L) || farmH(L), '집안 어른이 옛 가족 이름을 적어 방송국 벽에 붙이러 갔다.', 'relations+1 care+1', '이산가족 찾기'), lk(L => A(L, 6), '온 가족이 밤새 TV 앞에서 눈물바다가 됐다.', 'relations+1', '이산가족 방송'), g('여의도 광장 벽보 행렬이 화면을 채웠다.')] },
  { id: 'ng.1983.kal', years: [1983, 1983], sec: 'world', sensitive: 'disaster', headline: '민항기 소련 영공서 격추', summary: '뉴욕발 서울행 여객기가 소련 전투기에 격추돼 탑승자 전원이 숨졌다.', src: [W('대한항공_007편_격추_사건')],
    links: [lk(school, '학교에서 규탄 대회가 열렸다.', 'conflict+2', '냉전 긴장'), g('냉전 소식에 어른들이 혀를 찼다.', 'conflict+2', '냉전 긴장')] },
  { id: 'ng.1983.youth', years: [1983, 1983], sec: 'sports', headline: '세계청소년축구 4강', summary: '멕시코 세계청소년축구에서 한국 대표팀이 강호들을 꺾고 4강에 올랐다.', src: [W('1983년_FIFA_세계_청소년_선수권_대회')],
    links: [lk(school, '새벽 중계를 보고 학교에서 친구들과 경기 이야기를 했다.', 'happiness+1 relations+1', '축구 열광'), lk(army, '내무반 TV 앞에서 동기들과 함께 응원했다.', 'relations+1', '함께 본 경기'), g('붉은 유니폼 소식에 거리가 들떴다.', 'happiness+1', '축구 4강')] },
  { id: 'ng.1983.travel', years: [1983, 1983], sec: 'life', headline: '50세 이상 관광여행 허용', summary: '해외여행이 50세 이상에 한해 관광 목적으로도 허용됐다. 예치금 조건이 붙었다.', src: [W('해외여행_자유화')],
    links: [lk(highQ, '집안 어른이 처음으로 외국 단체관광을 다녀왔다.', 'happiness+1', '해외 관광'), g('외국 구경 다녀온 이웃 어른 이야기가 동네에 돌았다.')] },
  { id: 'ng.1983.pc', years: [1983, 1985], sec: 'tech', headline: '개인용 컴퓨터 첫 보급', summary: '8비트 국산 PC가 나오고 컴퓨터 학원이 늘었다. 학교 교육용 컴퓨터 보급도 시작됐다.', src: [W('대한민국의_컴퓨터_교육')],
    links: [lk(L => school(L) && highQ(L), '컴퓨터 학원에 다니며 베이직 프로그램을 짰다.', 'intellect+2 tech-2', '컴퓨터 교육'), lk(uni, '전산실 앞에 줄을 서서 단말기를 썼다.', 'tech-1', '전산 교육'), lk(school, '학교에 컴퓨터가 몇 대 들어와 구경만 했다.', 'tech+1', '컴퓨터 격차'), g('컴퓨터 시대가 온다는 기사가 늘었다.', 'tech+1', '정보화')] },

  // ── 1984 ──
  { id: 'ng.1984.pope', years: [1984, 1984], sec: 'culture', headline: '교황 첫 방한', summary: '로마 교황이 처음 한국을 찾아 한국 천주교 순교자 103위를 성인으로 선포했다.', src: [W('1984년_교황_요한_바오로_2세의_대한민국_방문')],
    links: [lk(seoul, '여의도 미사에 가는 이웃들로 버스가 붐볐다.'), g('교황 방문 중계가 며칠간 이어졌다.')] },
  { id: 'ng.1984.la', years: [1984, 1984], sec: 'sports', headline: 'LA 올림픽 종합 10위', summary: '동구권이 불참한 LA 올림픽에서 한국이 금메달 6개로 종합 10위에 올랐다.', src: [W('1984년_하계_올림픽')],
    links: [lk(school, '여름방학 내내 올림픽 중계를 보며 메달 수를 셌다.', 'happiness+1', '올림픽 중계'), g('메달 소식에 다음 서울 올림픽 기대가 커졌다.', 'happiness+1', '올림픽 선전')] },
  { id: 'ng.1984.88road', years: [1984, 1984], sec: 'economy', headline: '대구~광주 고속도로 개통', summary: '영호남을 잇는 올림픽 이름의 고속도로가 열렸다. 지리산 자락을 지나는 2차선 길이었다.', src: [W('광주대구고속도로')],
    links: [lk(L => reg(L, 'jeonnam', 'jeonbuk', 'daegu', 'gyeongbuk', 'gyeongnam'), '영호남 친척 오가는 길이 반나절 줄었다.', 'region-2 relations+1', '교통 개선'), g('동서를 잇는 길이 생겼다는 기사가 났다.')] },
  { id: 'ng.1984.campus', years: [1984, 1984], sec: 'edu', headline: '대학 자율화 조치', summary: '제적 학생 복교, 학내 경찰 철수, 학생회 부활 등 대학 자율화 조치가 이어졌다.', src: [W('학원_자율화_조치')],
    links: [lk(uni, '캠퍼스에서 사복 경찰이 사라지고 학생회 선거가 열렸다.', 'conflict-1 relations+1', '학원 자율화'), lk(L => st(L, 'high'), '대학 가면 달라진다는 선배 말에 귀가 솔깃했다.'), g('대학가 분위기가 달라졌다는 기사가 났다.')] },
  { id: 'ng.1984.flood', years: [1984, 1984], sec: 'disaster', sensitive: 'disaster', headline: '서울·경기 큰물, 남북 구호', summary: '9월 집중호우로 한강 일대가 잠겼다. 북측이 보낸 구호물자를 남측이 처음 받았다.', src: [W('1984년_대한민국_수해')],
    links: [lk(L => (seoul(L) || reg(L, 'gyeonggi')) && monH(L), '셋방에 물이 들어 가재도구를 버렸다.', 'housing+4 wealth-1', '수해'), lk(L => seoul(L) || reg(L, 'gyeonggi'), '동네 저지대 수해 복구에 손을 보탰다.', 'relations+1', '수해 복구'), g('북에서 온 쌀과 옷감 소식이 신기한 화제가 됐다.', 'conflict-1', '남북 교류')] },

  // ── 1985 ──
  { id: 'ng.1985.plaza', years: [1985, 1985], sec: 'world', headline: '플라자 합의, 엔화 강세', summary: '선진국들이 달러 약세에 합의해 엔화가 크게 올랐다. 저유가·저금리와 함께 3저 호황의 바탕이 됐다.', src: [W('플라자_합의')],
    links: [lk(L => wage(L) && factory(L), '수출 주문이 밀려 공장 잔업이 다시 늘었다.', 'job-2 wealth+1 leisure-1', '수출 호황'), lk(uni, '경제 수업에서 3저라는 말을 처음 배웠다.', 'intellect+1', '경제 상식'), g('수출 경기가 살아난다는 기사가 늘었다.', 'job-1', '경기 회복')] },
  { id: 'ng.1985.guro', years: [1985, 1985], sec: 'labor', headline: '공단 노동자 연대 파업', summary: '서울 구로공단의 여러 공장 노동자들이 노조 간부 구속에 항의해 함께 파업했다.', src: [W('구로동맹파업')],
    links: [lk(L => factory(L) && seoul(L), '옆 공장 파업 소식에 우리 라인도 술렁였다.', 'job+3 fairness+3', '연대 파업'), lk(factory, '공단 파업 소식에 작업반장이 잔소리를 늘렸다.', 'job+2 conflict+2', '노사 긴장'), g('공단 노동자들 이야기가 신문 사회면에 실렸다.', 'fairness+1', '노동 문제')] },
  { id: 'ng.1985.reunion', years: [1985, 1985], sec: 'politics', headline: '분단 후 첫 고향방문단', summary: '남북 이산가족 고향방문단과 예술공연단이 서울과 평양을 오갔다.', src: [W('남북_이산가족_고향방문단')],
    links: [lk(L => big(L) || farmH(L), '북에 가족을 둔 어른이 명단에 들기를 바랐다.', 'care+1', '이산가족'), g('평양에서 온 공연단 중계를 신기하게 봤다.', 'conflict-1', '남북 교류')] },
  { id: 'ng.1985.island', years: [1985, 1985], sec: 'edu', headline: '도서·벽지 중학 의무교육', summary: '섬과 산간 벽지부터 중학교 의무교육이 시작돼 수업료 부담이 없어졌다.', src: [W('의무교육')],
    links: [lk(L => rural(L) && (teen(L) || elem(L)), '중학교 수업료가 없어져 집안 학비 걱정이 줄었다.', 'edu-3 living-1', '의무교육 확대'), g('중학교 의무교육이 시골부터 시작됐다는 기사가 났다.', 'edu-1', '의무교육')] },
  { id: 'ng.1985.briquet', years: [1985, 1986], sec: 'health', headline: '연탄가스 중독 사고 잇따라', summary: '겨울마다 연탄 난방 가구에서 일산화탄소 중독 사고가 이어져 환기 경보가 나왔다.', src: [W('연탄가스_중독')],
    links: [lk(monH, '셋방 문틈을 살피고 머리맡에 동치미 국물을 두었다.', 'health-1 housing+2', '연탄가스 위험'), lk(L => renter(L) && !L.family?.married, '자취방 연탄 갈 때마다 창문을 열어 두었다.', 'housing+2', '연탄 난방'), g('연탄가스 조심하라는 방송이 겨울마다 나왔다.')] },

  // ── 1986 ──
  { id: 'ng.1986.ag', years: [1986, 1986], sec: 'sports', headline: '서울 아시안게임 개최', summary: '서울 아시안게임에서 한국이 금메달 93개로 종합 2위를 했다. 올림픽 예행연습이었다.', weight: 2, src: [W('1986년_아시안_게임')],
    links: [lk(L => seoul(L) && school(L), '학교에서 응원단으로 경기장에 동원돼 태극기를 흔들었다.', 'relations+1 leisure-1', '응원 동원'), lk(school, '육상 3관왕 소식에 체육 시간 달리기가 진지해졌다.', 'happiness+1', '아시안게임'), g('금메달 소식이 날마다 이어졌다.', 'happiness+1', '아시안게임')] },
  { id: 'ng.1986.surplus', years: [1986, 1986], sec: 'economy', headline: '3저 호황, 첫 경상흑자', summary: '저유가·저금리·저달러에 힘입어 수출이 급증하고 처음으로 경상수지 흑자를 냈다.', weight: 2, src: [W('3저_호황')],
    links: [lk(L => wage(L) && factory(L), '특근 수당이 붙어 월급봉투가 두꺼워졌다.', 'wealth+1 leisure-1', '수출 호황'), lk(seek, '공장마다 사람을 구해 일자리 찾기가 한결 쉬워졌다.', 'job-4', '고용 증가'), lk(workH, '집안 어른 공장에 잔업이 늘어 살림이 조금 폈다.', 'living-2', '호황'), g('경기가 좋다는 말이 시장 상인들 입에서 나왔다.', 'living-1', '호황')] },
  { id: 'ng.1986.minwage', years: [1986, 1986], sec: 'labor', headline: '최저임금법 제정', summary: '연말 최저임금법이 제정돼 1988년부터 제조업 일부 사업장에 시행하기로 했다.', src: [W('최저임금법')],
    links: [lk(L => wage(L) && factory(L) && !L.job?.regular, '저임금 공장에 최저선이 생긴다니 동료들이 반겼다.', 'fairness-2', '최저임금 도입'), g('임금에 법정 바닥이 생긴다는 기사가 났다.')] },
  { id: 'ng.1986.chernobyl', years: [1986, 1986], sec: 'world', headline: '체르노빌 원전 사고', summary: '소련 체르노빌 원전이 폭발해 방사능이 유럽 넓은 지역으로 퍼졌다.', src: [W('체르노빌_원자력_발전소_사고')],
    links: [lk(L => reg(L, 'busan', 'gyeongnam', 'jeonnam', 'gyeongbuk'), '가까운 원전은 괜찮으냐는 이야기가 동네에 돌았다.', 'region+1', '원전 불안'), g('먼 나라 원전 사고 소식에 방사능이라는 말을 배웠다.')] },
  { id: 'ng.1986.pension', years: [1986, 1986], sec: 'health', headline: '국민연금법 제정', summary: '1988년부터 10인 이상 사업장에 국민연금을 시행하는 법이 만들어졌다.', src: [W('국민연금')],
    links: [lk(L => wage(L) && L.job?.firmSize !== 'micro', '월급에서 연금을 떼게 된다는 말에 동료들이 셈을 했다.'), g('노후 연금 제도가 생긴다는 기사가 났다.')] },

  // ── 1987 ──
  { id: 'ng.1987.strike', years: [1987, 1987], sec: 'labor', headline: '노동자 대투쟁', summary: '6월 항쟁 뒤 7~9월 전국 3천여 사업장에서 임금 인상·노조 결성 요구 파업이 이어졌다.', weight: 2, src: [W('1987년_노동자_대투쟁')],
    links: [lk(L => wage(L) && factory(L), '공장에 노조가 생기고 임금이 두 자릿수로 올랐다.', 'wealth+1 job-2 fairness-2', '노조 결성·임금 인상'), lk(L => wage(L) && office(L), '사무실에도 노조 설립 이야기가 돌았다.', 'conflict+2', '노사 분규'), lk(workH, '집안 어른 공장 파업이 길어져 월급날이 미뤄졌다.', 'living+3 conflict+2', '파업'), g('울산·창원 공단 파업 소식이 연일 이어졌다.', 'conflict+2', '노사 분규')] },
  { id: 'ng.1987.equal', years: [1987, 1987], sec: 'labor', headline: '남녀고용평등법 제정', summary: '모집·승진·정년에서 성차별을 금지하는 남녀고용평등법이 제정됐다.', src: [W('남녀고용평등과_일·가정_양립_지원에_관한_법률')],
    links: [lk(L => L.sex === 'F' && wage(L), '결혼하면 그만둔다는 각서 관행이 문제가 됐다.', 'fairness-2 job-1', '고용 평등'), lk(L => L.sex === 'F' && (uni(L) || seek(L)), '여자라 안 뽑는다는 공고가 줄어들길 기대했다.', 'fairness-1', '고용 평등'), g('직장 내 성차별 금지법 소식이 신문에 실렸다.')] },
  { id: 'ng.1987.phone', years: [1987, 1987], sec: 'tech', headline: '전국 전화 자동화 완성', summary: '국산 전자교환기 보급으로 전화 1천만 회선을 넘고 전국 자동 전화망이 완성됐다.', src: [W('TDX')],
    links: [lk(rural, '교환원 거치지 않고 서울 친척에게 바로 전화를 걸었다.', 'relations+1 region-1', '전화 보급'), lk(renter, '자취방에 전화를 놓으려 청약 순번을 기다렸다.'), g('집집마다 전화기가 놓이기 시작했다.', 'relations+1', '전화 보급')] },
  { id: 'ng.1987.ban', years: [1987, 1987], sec: 'culture', headline: '금지곡 대거 해금', summary: '공연윤리위원회가 그동안 묶었던 가요 수백 곡의 방송 금지를 풀었다.', src: [W('금지곡')],
    links: [lk(uni, '몰래 부르던 노래를 캠퍼스에서 마음껏 불렀다.', 'happiness+1', '금지곡 해금'), g('라디오에 오랜만에 듣는 노래가 흘렀다.')] },
  { id: 'ng.1987.dooly', years: [1987, 1987], sec: 'culture', headline: '국산 TV 만화 인기', summary: '아기 공룡이 주인공인 국산 TV 만화 시리즈가 방영돼 어린이들 사이에 큰 인기를 끌었다.', ages: [3, 14], src: [W('아기공룡_둘리')],
    links: [lk(elem, '만화 끝나면 주제가를 부르며 골목으로 뛰어나갔다.', 'happiness+1', 'TV 만화'), g('만화 캐릭터 학용품이 문방구를 채웠다.')] },

  // ── 1988 ──
  { id: 'ng.1988.minwage', years: [1988, 1988], sec: 'labor', headline: '최저임금 첫 시행', summary: '10인 이상 제조업 사업장에 최저임금이 처음 시행됐다. 시급은 업종에 따라 400원대였다.', weight: 2, src: [W('최저임금제')],
    links: [lk(L => wage(L) && factory(L) && !L.job?.regular, '최저선 아래이던 일당이 올라 월급이 조금 늘었다.', 'wealth+1 fairness-2', '최저임금 시행'), lk(L => wage(L) && factory(L), '공장 막내들 시급이 법정 기준에 맞춰 올랐다.', 'fairness-1', '최저임금 시행'), lk(L => jm(L, '4', '5', '9'), '작은 가게는 아직 적용이 안 돼 바뀐 게 없었다.', 'fairness+2', '적용 제외'), g('최저임금이라는 말이 처음 신문에 실렸다.')] },
  { id: 'ng.1988.pension', years: [1988, 1988], sec: 'health', headline: '국민연금 첫 가입', summary: '10인 이상 사업장 근로자를 대상으로 국민연금이 시작돼 월급에서 보험료를 떼기 시작했다.', src: [W('국민연금')],
    links: [lk(L => wage(L) && L.job?.firmSize !== 'micro', '월급 명세서에 연금 보험료 칸이 새로 생겼다.', 'wealth-1 medical-1', '연금 가입'), lk(L => emp(L), '작은 일터라 연금 가입 대상이 아니었다.', 'fairness+1', '연금 미적용'), g('노후 연금이 생겼다는 소식에 어른들이 셈을 했다.')] },
  { id: 'ng.1988.farm', years: [1988, 1988], sec: 'health', headline: '농어촌 의료보험 시행', summary: '농어촌 지역 주민에게 지역 의료보험이 확대 시행돼 보험증이 생겼다.', src: [W('국민건강보험')],
    links: [lk(farmH, '보험증이 생겨 어른들이 미루던 병원에 다녀왔다.', 'medical-4 health+1', '지역 의보'), lk(rural, '읍내 의원 대기실이 처음으로 붐볐다.', 'medical-2', '지역 의보'), g('시골에도 의료보험이 생겼다는 기사가 났다.')] },
  { id: 'ng.1988.share', years: [1988, 1988], sec: 'economy', headline: '국민주 첫 보급', summary: '공기업 주식을 저소득층 등에 싸게 나눠 주는 국민주가 처음 보급돼 증권사에 줄이 섰다.', src: [W('국민주')],
    links: [lk(L => wage(L) && A(L, 20), '회사 동료들 따라 국민주 청약 줄에 섰다.', 'wealth+1', '국민주 청약'), lk(L => uni(L), '주식 이야기가 처음 학생들 대화에 올랐다.'), g('증권사 앞 장사진이 뉴스에 나왔다.')] },
  { id: 'ng.1988.hearing', years: [1988, 1988], sec: 'politics', headline: '국회 청문회 TV 생중계', summary: '제5공화국 비리와 광주 문제를 다룬 국회 청문회가 TV로 생중계됐다.', src: [W('5공_청문회')],
    links: [lk(uni, '강의실 대신 학생회관 TV 앞에 모여 청문회를 봤다.', 'conflict+2', '청문회'), lk(L => reg(L, 'jeonnam'), '광주 이야기가 화면에 나오자 집안 어른들이 말을 잃었다.', 'conflict+3', '청문회'), g('청문회 중계에 거리 다방들이 붐볐다.', 'conflict+1', '청문회')] },
  { id: 'ng.1988.mobile', years: [1988, 1988], sec: 'tech', headline: '들고 다니는 이동전화 개통', summary: '올림픽을 앞두고 손에 들고 다니는 이동전화 서비스가 시작됐다. 값이 집 한 채 전세금만큼 비쌌다.', src: [W('대한민국의_이동통신')],
    links: [lk(highQ, '집안 어른이 벽돌만 한 이동전화를 들고 와 모두 신기해했다.', 'tech-1', '이동전화'), g('들고 다니는 전화라는 말에 다들 고개를 갸웃했다.')] },

  // ── 1989 ──
  { id: 'ng.1989.newtown', years: [1989, 1989], sec: 'housing', headline: '수도권 1기 신도시 발표', summary: '집값 급등을 잡으려 분당·일산 등 수도권 다섯 곳에 신도시 30만 호 건설 계획을 발표했다.', weight: 2, src: [W('1기_신도시')],
    links: [lk(L => renter(L) && A(L, 25), '분양 소식에 청약 통장을 들여다보게 됐다.', 'housing+4', '신도시 분양'), lk(L => renter(L), '셋방 주인이 올려 달라는 보증금에 신도시 이야기만 들렸다.', 'housing+3', '전셋값 상승'), lk(L => owner(L) || (ownH(L) && !indep(L)), '집값이 더 오른다는 소문에 동네가 들떴다.', 'housing+1', '집값 기대'), g('논밭에 새 도시를 짓는다는 소식에 이웃들이 놀랐다.', 'housing+1', '신도시')] },
  { id: 'ng.1989.lease', years: [1989, 1989], sec: 'housing', headline: '전세 계약 2년 보장', summary: '주택임대차보호법이 바뀌어 임대 기간 보장이 1년에서 2년으로 늘었다.', src: [W('주택임대차보호법')],
    links: [lk(renter, '이사 걱정이 1년 미뤄졌지만 집주인이 보증금을 크게 올렸다.', 'housing+2 living+2', '임대차 개정'), lk(L => rentH(L) && !indep(L), '셋집 계약이 2년이 돼 어른들이 이사 계획을 미뤘다.', 'housing-1', '임대차 보호'), g('전세 계약 기간이 늘었다는 기사가 났다.')] },
  { id: 'ng.1989.medical', years: [1989, 1989], sec: 'health', headline: '도시 자영업자 의료보험', summary: '도시 지역 의료보험이 시행돼 전 국민 의료보험 시대가 열렸다.', weight: 2, src: [W('국민건강보험')],
    links: [lk(L => jm(L, '4', '5') && L.job?.status === 'self', '가게 하는 처지에도 보험증이 생겨 병원 문턱이 낮아졌다.', 'medical-4 health+1', '전 국민 의보'), lk(L => town(L) && ['4', '5'].includes(fj(L)), '장사하는 집에도 보험증이 나와 어른들이 반겼다.', 'medical-3', '도시 지역 의보'), g('이제 누구나 보험증이 있다는 말이 나왔다.', 'medical-1', '의보 확대')] },
  { id: 'ng.1989.travel', years: [1989, 1989], sec: 'life', headline: '해외여행 전면 자유화', summary: '나이 제한 없이 누구나 관광 여권을 받을 수 있게 돼 해외여행이 자유로워졌다.', src: [W('해외여행_자유화')],
    links: [lk(L => uni(L) && highQ(L), '방학 배낭여행 계획을 세우며 여권 사진을 찍었다.', 'happiness+1 leisure+1', '배낭여행'), lk(L => A(L, 20) && lowQ(L), '해외여행은 남 이야기였지만 공항 사진이 부러웠다.', 'fairness+1', '여행 격차'), g('김포공항 출국장이 붐볐다는 기사가 났다.')] },
  { id: 'ng.1989.land', years: [1989, 1989], sec: 'housing', headline: '토지공개념 3법 통과', summary: '땅 투기를 막으려 택지 소유 상한, 개발이익 환수, 토지초과이득세 법안이 통과됐다.', src: [W('토지공개념')],
    links: [lk(L => renter(L), '땅 부자를 잡는다는 소식에 셋방살이 친구들이 기대를 걸었다.', 'fairness-1', '토지 정책'), g('땅 많이 가진 사람에게 세금을 더 물린다는 기사가 났다.')] },
  { id: 'ng.1989.wall', years: [1989, 1989], sec: 'world', headline: '베를린 장벽 붕괴', summary: '동서 베를린을 가르던 장벽이 무너지고 동유럽 공산권 체제가 잇따라 흔들렸다.', weight: 2, src: [W('베를린_장벽_붕괴')],
    links: [lk(uni, '강의실에서 우리 통일은 언제냐는 토론이 벌어졌다.', 'conflict-1 intellect+1', '냉전 해체'), lk(army, '부대 정신교육 내용이 하루아침에 바뀌었다.'), g('장벽 위 사람들 화면을 보며 통일 이야기가 나왔다.', 'conflict-1', '냉전 해체')] },
  { id: 'ng.1989.union', years: [1989, 1989], sec: 'edu', headline: '교사 노조 결성과 해직', summary: '교사들이 노동조합을 결성했으나 불법으로 규정돼 가입 교사 1,500여 명이 해직됐다.', src: [W('전국교직원노동조합')],
    links: [lk(teen, '담임선생님이 학교를 떠나 반 아이들이 술렁였다.', 'edu+2 conflict+2', '교사 해직'), lk(elem, '선생님이 바뀐다는 소문에 교실이 어수선했다.', 'conflict+1', '교사 해직'), g('교사 해직 소식이 연일 신문에 실렸다.', 'conflict+2', '교육 갈등')] },
  { id: 'ng.1989.tallow', years: [1989, 1989], sec: 'life', headline: '라면 우지 파동', summary: '공업용 쇠기름으로 라면을 튀겼다는 고발이 나와 식품 안전 논란이 일었다. 뒤에 무해 판정이 났다.', src: [W('우지_파동')],
    links: [lk(L => renter(L) && !L.family?.married, '자취방 끼니인 라면을 끊어야 하나 고민했다.', 'living+1 health-1', '식품 안전'), lk(army, '부대 라면을 두고 내무반에서 말이 많았다.'), lk(school, '라면을 먹지 말라는 어른들 잔소리가 늘었다.'), g('식품 안전 이야기가 장보기 화제가 됐다.')] },
];
