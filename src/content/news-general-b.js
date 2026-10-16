// 종합 뉴스 B: 1990~2009(연 8~10건). 형식은 news-general.js 주석. 실명(기업·개인) 없음, 참사·정치는 사실·중립.
// links: 위에서부터 처음 맞는 하나가 적용(상태별 인과) → 마지막은 조건 없는 '그 시대 보통 사람' 반응. 출처 연표: docs/research/news/R16-news-general-b.md
const W = (...a) => a.map(x => (typeof x === 'number' ? `https://ko.wikipedia.org/wiki/${x}년` : `https://ko.wikipedia.org/wiki/${x}`));
const st = L => L.job?.status;
const emp = L => st(L) === 'employed';
const self = L => st(L) === 'self';
const work = L => emp(L) || self(L);
const seek = L => st(L) === 'seeking';
const mil = L => st(L) === 'military';
const pubW = L => emp(L) && (!!L.job?.public || L.job?.firmSize === 'public');
const priv = L => emp(L) && !pubW(L);
const big = L => priv(L) && L.job?.firmSize === 'large';
const smallW = L => priv(L) && ['micro', 'small', 'mid'].includes(L.job?.firmSize);
const reg = L => priv(L) && !!L.job?.regular;
const nonreg = L => emp(L) && !L.job?.regular;
const adult = L => (L.age ?? 0) >= 20;
const young = L => (L.age ?? 0) >= 20 && (L.age ?? 0) <= 34;
const tenant = L => ['jeonse', 'monthly'].includes(L.home?.tenure);
const jeonse = L => L.home?.tenure === 'jeonse';
const monthly = L => L.home?.tenure === 'monthly';
const owner = L => !!L.home?.owned;
const debt = L => (L.money?.debt ?? 0) > 0;
const credit = L => (L.money?.loans?.credit ?? 0) > 0;
const mort = L => (L.money?.loans?.mortgage ?? 0) > 0;
const saver = L => adult(L) && (L.money?.assets ?? 0) >= 3000;
const poor = L => adult(L) && (L.money?.assets ?? 0) < 1000;
const stg = (...s) => L => s.includes(L.edu?.stage);
const kid = stg('elem');
const teen = stg('middle', 'high', 'retake');
const col = stg('college', 'grad');
const exam = L => (L.edu?.stage === 'high' && L.age >= 17) || L.edu?.stage === 'retake';
const kidAges = L => (L.family?.children ?? []).filter(c => c?.alive !== false && c?.birthYear != null).map(c => L.year - c.birthYear);
const hasKid = (a, b) => L => kidAges(L).some(x => x >= a && x <= b);
const parent = L => kidAges(L).length > 0;
const partner = L => !!L.family?.partner;
const elderP = L => ['father', 'mother'].some(p => L.family?.parents?.[p]?.alive && L.family.parents[p].age >= 65);
const rural = L => L.birth?.urban === false;
const at = (...r) => L => r.includes(L.home?.region);
const capital = at('seoul', 'gyeonggi', 'incheon');
const female = L => L.sex === 'F';
const and = (...f) => L => f.every(g => g(L));
const not = f => L => !f(L);
const or2 = (a, b) => L => a(L) || b(L);
const k = (when, line, fx, reason) => ({ when, line, fx, reason });
const g = (line, fx, reason) => ({ line, fx, reason });

export const NG_B = [
  // ── 1990 ──
  { id: 'ng.1990.merger', years: [1990, 1990], sec: 'politics', headline: '여야 3당 합당, 거대 여당 탄생', summary: '1990년 1월 집권당과 야당 두 곳이 합쳐 국회 의석 3분의 2를 넘는 거대 여당이 생겼다.', src: W(1990, '3당_합당'), links: [
    k(col, '학내 게시판에 정계 개편을 비판하는 대자보가 며칠씩 붙어 있었다.', { issues: { conflict: 3 } }, '3당 합당 논란'),
    k(work, '일터 휴게실에서 정치 얘기가 나오면 다들 말을 아꼈다.', { issues: { conflict: 2 } }, '3당 합당 논란'),
    g('저녁 뉴스마다 정계 개편 소식이 이어졌다.', { issues: { conflict: 2 } }, '3당 합당'),
  ] },
  { id: 'ng.1990.ussr', years: [1990, 1990], sec: 'world', headline: '한국·소련 국교 수립', summary: '1990년 9월 한국과 소련이 수교했다. 냉전 이후 북방 외교의 큰 걸음으로 평가됐다.', src: W(1990, '대한민국-러시아_관계'), links: [
    k(big, '회사가 북방 시장 진출 팀을 꾸린다는 말이 돌았다.', { issues: { job: -2 } }, '북방 교역 기대'),
    k(teen, '사회 시간에 선생님이 바뀌는 세계 지도 얘기를 했다.', { stats: { intellect: 1 } }, '한소 수교 수업'),
    g('소련이 가까워졌다는 말이 신기하게 들렸다.', { issues: { conflict: -2 } }, '한소 수교'),
  ] },
  { id: 'ng.1990.crimewar', years: [1990, 1991], sec: 'society', headline: '정부, 범죄와의 전쟁 선포', summary: '1990년 10월 정부가 조직폭력과 강력범죄를 집중 단속하겠다며 범죄와의 전쟁을 선포했다.', src: W(1990), links: [
    k(self, '가게 앞 유흥가 단속이 잦아져 밤 손님이 줄었다.', { issues: { living: 2 } }, '유흥가 집중 단속'),
    k(teen, '밤늦게 다니지 말라는 잔소리가 부쩍 늘었다.', { stats: { leisure: -1 } }, '강력범죄 불안'),
    k(parent, '아이들 귀갓길을 마중 나가는 날이 늘었다.', { issues: { care: 2 } }, '강력범죄 불안'),
    g('방범 순찰차가 동네를 자주 돌았다.', { issues: { conflict: 2 } }, '범죄와의 전쟁'),
  ] },
  { id: 'ng.1990.flood', years: [1990, 1990], sec: 'disaster', sensitive: 'disaster', headline: '중부 폭우, 한강 제방 붕괴', summary: '1990년 9월 중부 지방 집중호우로 한강 하류 제방이 무너져 경기 고양 일대가 물에 잠겼다.', src: W(1990), links: [
    k(capital, '동네 저지대 집들이 물에 잠겨 이웃끼리 짐을 날랐다.', { stats: { relations: 1 }, issues: { living: 3 } }, '한강 수해'),
    g('수재의연금 모금 방송을 온 가족이 지켜봤다.', { issues: { conflict: -2 } }, '수재민 돕기'),
  ] },
  { id: 'ng.1990.beijing', years: [1990, 1990], sec: 'sports', headline: '베이징 아시안게임 개막', summary: '1990년 9~10월 베이징 아시안게임이 열려 한국은 종합 2위를 차지했다.', src: W(1990, '1990년_아시안_게임'), links: [
    k(kid, '중계를 보느라 숙제를 미뤘다가 혼이 났다.', { stats: { leisure: 1 } }, '아시안게임 중계'),
    k(work, '점심 식당 TV 앞에 사람들이 모여 경기를 봤다.', { stats: { relations: 1 } }, '아시안게임 중계'),
    g('메달 소식에 동네가 잠시 들떴다.', { stats: { happiness: 1 } }, '아시안게임'),
  ] },
  { id: 'ng.1990.newtown', years: [1990, 1990], sec: 'housing', headline: '수도권 신도시 공사 본격화', summary: '집값 안정을 위해 발표된 분당·일산 등 수도권 5개 신도시 건설이 본격화됐다.', src: W(1990, '제1기_신도시'), links: [
    k(and(tenant, capital, adult), '신도시 분양 얘기로 저녁 자리가 길어졌다.', { issues: { housing: -2 } }, '신도시 분양 기대'),
    k(and(tenant, capital), '집에서 신도시로 이사 갈지 말지 얘기가 오갔다.', { issues: { housing: -2 } }, '신도시 이주 검토'),
    k(owner, '주변 아파트 시세가 주춤했다는 말을 들었다.', { issues: { housing: -2 } }, '공급 확대'),
    g('수도권 집 얘기가 뉴스마다 나왔다.', { issues: { housing: 2 } }, '신도시 건설'),
  ] },
  { id: 'ng.1990.jeonse', years: [1990, 1990], sec: 'housing', headline: '전셋값 급등, 세입자 시름', summary: '임대차 기간이 2년으로 늘어난 직후 1990년 봄 전셋값이 크게 올라 세입자 부담이 커졌다.', src: W(1990, '주택임대차보호법'), links: [
    k(and(jeonse, adult), '재계약 때 올려 달라는 전세금이 몇 년 저축만큼 됐다.', { issues: { housing: 5, living: 3 } }, '전셋값 급등'),
    k(and(monthly, adult), '월세도 덩달아 올라 생활비를 줄였다.', { issues: { living: 4 } }, '임대료 상승'),
    k(tenant, '집에서 더 작은 집으로 옮기자는 얘기가 나왔다.', { issues: { housing: 4 } }, '전셋값 급등'),
    k(owner, '집이 있어 다행이라는 말을 자주 했다.', { issues: { housing: -2 } }, '자가 보유'),
    g('신문마다 전세 대란 기사가 실렸다.', { issues: { housing: 2 } }, '전세 대란'),
  ] },
  { id: 'ng.1990.labor', years: [1990, 1990], sec: 'labor', headline: '전국 노동조합 협의체 출범', summary: '1990년 1월 민주노조들이 모여 전국 단위 협의체를 꾸렸다. 임금 협상 때마다 노사 대립이 이어졌다.', src: W(1990), links: [
    k(big, '공장 안에 노조 소식지가 돌았다.', { issues: { conflict: 2, job: -2 } }, '노조 조직화'),
    k(smallW, '임금 협상 소식에 동료들 표정이 엇갈렸다.', { issues: { job: 2 } }, '임금 협상'),
    k(self, '파업 소식이 들리면 납품 일정부터 걱정됐다.', { issues: { living: 2 } }, '노사 분규'),
    g('봄마다 노사 협상 뉴스가 이어졌다.', { issues: { conflict: 2 } }, '노사 갈등'),
  ] },

  // ── 1991 ──
  { id: 'ng.1991.local', years: [1991, 1991], sec: 'politics', headline: '30년 만에 지방의회 선거', summary: '1991년 기초·광역 지방의회 의원 선거가 치러져 중단됐던 지방자치가 다시 시작됐다.', src: W(1991, '대한민국의_지방_선거'), links: [
    k(and(adult, rural), '동네 사람이 지방의원 후보로 나서 마을이 들썩였다.', { issues: { region: -3 } }, '지방의회 부활'),
    k(adult, '처음으로 동네 의원 투표용지를 받아 들었다.', { issues: { region: -2 } }, '지방의회 부활'),
    g('동네 골목마다 선거 벽보가 붙었다.', { issues: { region: -2 } }, '지방의회 선거'),
  ] },
  { id: 'ng.1991.phenol', years: [1991, 1991], sec: 'life', headline: '낙동강 페놀 유출', summary: '1991년 3월 한 공장에서 페놀이 낙동강으로 흘러들어 대구 등지 수돗물에서 악취가 났다.', src: W(1991, '낙동강_페놀_유출_사고'), links: [
    k(and(at('daegu', 'gyeongbuk', 'busan', 'gyeongnam'), adult), '수돗물 대신 끓인 물과 생수를 사서 마셨다.', { issues: { living: 3, medical: 2 } }, '페놀 오염'),
    k(at('daegu', 'gyeongbuk', 'busan', 'gyeongnam'), '집에서 수돗물을 그냥 마시지 말라는 당부를 들었다.', { issues: { living: 2 } }, '페놀 오염'),
    k(parent, '아이들 먹는 물을 따로 사 오게 됐다.', { issues: { living: 2, care: 2 } }, '식수 불안'),
    g('수돗물을 끓여 마시는 집이 늘었다.', { issues: { living: 2 } }, '식수 불안'),
  ] },
  { id: 'ng.1991.un', years: [1991, 1991], sec: 'world', headline: '남북한 유엔 동시 가입', summary: '1991년 9월 남북한이 유엔에 동시에 가입했다.', src: W(1991), links: [
    k(teen, '선생님이 칠판에 유엔 가입국 수를 적어 주었다.', { stats: { intellect: 1 } }, '유엔 가입 수업'),
    k(mil, '부대에서 정세 교육 시간이 따로 잡혔다.', { issues: { conflict: -2 } }, '남북 관계 변화'),
    g('남과 북이 같은 날 가입했다는 소식이 낯설었다.', { issues: { conflict: -2 } }, '유엔 동시 가입'),
  ] },
  { id: 'ng.1991.pingpong', years: [1991, 1991], sec: 'sports', headline: '남북 탁구 단일팀 세계 정상', summary: '1991년 일본 지바 세계탁구선수권에서 남북 단일팀이 여자 단체전 정상에 올랐다.', src: W(1991, '코리아_(탁구_단일팀)'), links: [
    k(kid, '학교 탁구대 앞에 줄이 길어졌다.', { stats: { health: 1 } }, '탁구 붐'),
    k(adult, '한 팀으로 뛴 선수들 모습에 괜히 마음이 뭉클했다.', { stats: { happiness: 1 } }, '남북 단일팀'),
    g('단일팀 우승 장면이 여러 번 방송됐다.', { issues: { conflict: -2 } }, '남북 단일팀'),
  ] },
  { id: 'ng.1991.gulf', years: [1991, 1991], sec: 'world', headline: '걸프전 발발, 유가 들썩', summary: '1991년 1월 다국적군이 이라크를 공격했다. 기름값과 수출 전망이 한때 흔들렸다.', src: W(1991, '걸프_전쟁'), links: [
    k(self, '기름값 오를까 가게 난방을 줄였다.', { issues: { living: 3 } }, '유가 불안'),
    k(big, '중동 현장 인력 철수 얘기가 회사에 돌았다.', { issues: { job: 2 } }, '중동 사업 차질'),
    k(teen, '밤마다 TV에 나오는 전쟁 화면을 지켜봤다.', { issues: { conflict: 2 } }, '전쟁 중계'),
    g('기름값 걱정에 주유소 앞이 붐볐다.', { issues: { living: 2 } }, '걸프전 유가'),
  ] },
  { id: 'ng.1991.bundang', years: [1991, 1991], sec: 'housing', headline: '1기 신도시 첫 입주', summary: '1991년 가을 분당에서 첫 입주가 시작됐다. 서울로 출퇴근하는 신도시 생활이 열렸다.', src: W(1991, '분당신도시'), links: [
    k(and(emp, capital), '출퇴근 버스가 빽빽해져 새벽에 집을 나섰다.', { stats: { leisure: -1 } }, '신도시 통근'),
    k(and(tenant, capital), '신도시로 옮긴 이웃이 넓은 집 얘기를 했다.', { issues: { housing: 2 } }, '신도시 이주'),
    k(not(capital), '서울 근처 새 아파트 얘기는 먼 나라 일 같았다.', { issues: { region: 2 } }, '수도권 집중'),
    g('새 아파트 단지 사진이 신문에 실렸다.', { issues: { housing: -2 } }, '신도시 입주'),
  ] },
  { id: 'ng.1991.suseo', years: [1991, 1991], sec: 'politics', headline: '수서 택지 특혜 의혹', summary: '1991년 초 서울 수서지구 택지 공급을 둘러싼 특혜 의혹으로 국회의원과 공무원들이 구속됐다.', src: W(1991, '수서_비리_사건'), links: [
    k(and(tenant, adult), '집 없는 사람만 손해라는 말을 실감했다.', { issues: { fairness: 3 } }, '택지 특혜 의혹'),
    k(pubW, '청사 분위기가 한동안 얼어붙었다.', { issues: { job: 2 } }, '공직 사정'),
    g('특혜 의혹 뉴스가 연일 이어졌다.', { issues: { fairness: 2 } }, '수서 사건'),
  ] },
  { id: 'ng.1991.accord', years: [1991, 1991], sec: 'politics', headline: '남북기본합의서 채택', summary: '1991년 12월 남북 고위급회담에서 화해와 불가침, 교류 협력을 담은 기본합의서가 채택됐다.', src: W(1991, '남북기본합의서'), links: [
    k(mil, '부대 안에 긴장 완화 얘기가 돌았다.', { issues: { conflict: -3 } }, '남북 합의'),
    k(elderP, '부모님이 고향 소식을 들을 날이 올까 하셨다.', { stats: { relations: 1 } }, '남북 교류 기대'),
    g('남북이 서명했다는 소식에 기대 섞인 말이 오갔다.', { issues: { conflict: -2 } }, '남북기본합의서'),
  ] },

  // ── 1992 ──
  { id: 'ng.1992.china', years: [1992, 1992], sec: 'world', headline: '한국·중국 국교 수립', summary: '1992년 8월 한국과 중국이 수교했다. 교역과 왕래가 빠르게 늘기 시작했다.', src: W(1992, '대한민국-중화인민공화국_관계'), links: [
    k(self, '중국산 물건이 시장에 늘 거라는 말이 돌았다.', { issues: { job: 2 } }, '중국 교역 확대'),
    k(big, '중국 공장 설립 얘기가 회사에서 나왔다.', { issues: { job: 2 } }, '중국 진출'),
    k(teen, '중국어 학원 전단을 처음 봤다.', { issues: { edu: 2 } }, '중국어 수요'),
    g('중국과 수교했다는 소식이 새롭게 들렸다.', { issues: { conflict: -2 } }, '한중 수교'),
  ] },
  { id: 'ng.1992.marathon', years: [1992, 1992], sec: 'sports', headline: '올림픽 마라톤 금메달', summary: '1992년 바르셀로나 올림픽 남자 마라톤에서 한국 선수가 금메달을 땄다.', src: W(1992, '1992년_하계_올림픽'), links: [
    k(kid, '다음 날 운동장에서 다들 마라톤 흉내를 냈다.', { stats: { health: 1 } }, '올림픽 금메달'),
    k(work, '새벽 중계를 보고 출근해 하루 종일 그 얘기였다.', { stats: { relations: 1 } }, '올림픽 금메달'),
    g('결승선 장면이 몇 번이고 다시 방송됐다.', { stats: { happiness: 1 } }, '올림픽 금메달'),
  ] },
  { id: 'ng.1992.satellite', years: [1992, 1992], sec: 'tech', headline: '첫 인공위성 궤도 진입', summary: '1992년 8월 국내 연구진이 만든 첫 과학위성이 발사돼 궤도에 올랐다.', src: W(1992, '우리별_1호'), links: [
    k(teen, '과학 선생님이 위성 얘기로 수업 한 시간을 썼다.', { stats: { intellect: 1 } }, '첫 인공위성'),
    k(col, '공대 지원자 얘기가 학교에서 나왔다.', { issues: { tech: -2 } }, '과학기술 관심'),
    g('우리도 위성을 쏘았다는 소식이 신기했다.', { issues: { tech: 2 } }, '첫 인공위성'),
  ] },
  { id: 'ng.1992.dance', years: [1992, 1993], sec: 'culture', headline: '랩·댄스 가요 열풍', summary: '1992년 데뷔한 랩 댄스 그룹이 큰 인기를 끌며 10대가 이끄는 대중음악 시장이 커졌다.', src: W(1992), links: [
    k(teen, '친구들과 테이프를 돌려 듣고 춤을 따라 했다.', { stats: { happiness: 1, relations: 1 } }, '댄스 가요 열풍'),
    k(hasKid(10, 19), '아이 방에서 새 음악이 크게 흘러나왔다.', { stats: { relations: -1 } }, '세대 차이'),
    k(young, '노래방에서 그 노래를 부르는 후배들을 봤다.', { stats: { leisure: 1 } }, '댄스 가요 열풍'),
    g('가요 프로그램이 10대 얘기로 가득했다.', { stats: { leisure: 1 } }, '가요 열풍'),
  ] },
  { id: 'ng.1992.election', years: [1992, 1992], sec: 'politics', headline: '14대 대선, 문민 후보 당선', summary: '1992년 12월 대통령 선거에서 군 출신이 아닌 후보가 당선돼 이듬해 문민정부가 출범했다.', src: W(1992, '제14대_대한민국_대통령_선거'), links: [
    k(adult, '투표를 마치고 개표 방송을 늦게까지 봤다.', { issues: { conflict: -2 } }, '대선 투표'),
    k(teen, '어른들 저녁 대화가 선거 얘기로 가득했다.', { issues: { conflict: 2 } }, '대선 열기'),
    g('선거 유세 차량이 골목을 돌았다.', { issues: { conflict: 2 } }, '14대 대선'),
  ] },
  { id: 'ng.1992.rapture', years: [1992, 1992], sec: 'society', headline: '종말론 소동, 아무 일 없이', summary: '1992년 10월 한 종교 단체가 예언한 종말 날짜가 아무 일 없이 지나갔다. 재산을 바친 신도 피해가 컸다.', src: W(1992, '다미선교회'), links: [
    k(teen, '학교에서 종말 날짜 얘기로 한바탕 웃었다.', { stats: { relations: 1 } }, '종말론 소동'),
    k(adult, '주변에 재산을 정리한 사람이 있다는 소문을 들었다.', { issues: { conflict: 2 } }, '종말론 피해'),
    g('다음 날 아침 뉴스가 그 얘기로 시작했다.', { issues: { conflict: 2 } }, '종말론 소동'),
  ] },
  { id: 'ng.1992.bankrupt', years: [1992, 1992], sec: 'economy', headline: '중소기업 부도 잇따라', summary: '1992년 경기 둔화와 높은 금리로 중소기업 부도가 크게 늘었다.', src: W(1992), links: [
    k(smallW, '월급날이 하루 이틀씩 밀리는 일이 생겼다.', { issues: { job: 4 } }, '중소기업 자금난'),
    k(self, '거래처 어음이 부도나 물건값을 못 받았다.', { issues: { living: 4 }, money: { assets: -200 } }, '거래처 부도'),
    k(seek, '면접 보러 간 회사가 문을 닫았다는 얘기를 들었다.', { issues: { job: 3 } }, '중소기업 부도'),
    g('동네 공장 몇 곳이 문을 닫았다.', { issues: { job: 2 } }, '중소기업 부도'),
  ] },
  { id: 'ng.1992.housedown', years: [1992, 1992], sec: 'housing', headline: '집값 내림세, 전세 안정', summary: '신도시 입주와 주택 대량 공급으로 1991~1992년 집값과 전셋값이 내림세로 돌아섰다.', src: W(1992, '주택_200만호_건설'), links: [
    k(and(jeonse, adult), '전세 재계약 때 보증금을 올리지 않아도 됐다.', { issues: { housing: -3 } }, '전셋값 안정'),
    k(tenant, '이사 걱정 없이 한 해를 넘겼다.', { issues: { housing: -2 } }, '전셋값 안정'),
    k(and(owner, adult), '집값이 내렸다는 말에 마음이 쓰였다.', { stats: { wealth: -1 } }, '집값 하락'),
    g('집값이 잡혔다는 기사가 나왔다.', { issues: { housing: -2 } }, '집값 안정'),
  ] },

  // ── 1993 ──
  { id: 'ng.1993.assets', years: [1993, 1993], sec: 'politics', headline: '고위공직자 재산 공개', summary: '1993년 새 정부가 고위공직자 재산을 공개하고 대대적인 사정 작업을 벌였다.', src: W(1993, '공직자윤리법'), links: [
    k(pubW, '청사에 감사 바람이 불어 서류를 다시 챙겼다.', { issues: { job: 2 } }, '공직 사정'),
    k(adult, '공개된 재산 목록 기사를 보며 혀를 찼다.', { issues: { fairness: 2 } }, '공직자 재산 공개'),
    g('사정 바람 뉴스가 이어졌다.', { issues: { fairness: -2 } }, '공직자 재산 공개'),
  ] },
  { id: 'ng.1993.expo', years: [1993, 1993], sec: 'culture', headline: '대전 엑스포 개막', summary: '1993년 8~11월 대전에서 국제 박람회가 열려 수학여행과 가족 나들이 인파가 몰렸다.', src: W(1993, '대전_세계_박람회'), links: [
    k(stg('elem', 'middle', 'high'), '줄 서서 본 전시관 얘기를 한참 했다.', { stats: { happiness: 1, intellect: 1 } }, '엑스포 견학'),
    k(hasKid(5, 15), '아이들 손잡고 엑스포 구경을 다녀왔다.', { stats: { relations: 1 } }, '가족 나들이'),
    k(at('chungnam', 'chungbuk', 'daejeon'), '손님이 몰려 동네 식당마다 줄이 섰다.', { issues: { region: -2 } }, '엑스포 특수'),
    g('엑스포 마스코트가 곳곳에 보였다.', { stats: { leisure: 1 } }, '대전 엑스포'),
  ] },
  { id: 'ng.1993.ferry', years: [1993, 1993], sec: 'disaster', sensitive: 'disaster', headline: '서해 여객선 침몰', summary: '1993년 10월 전북 부안 앞바다에서 여객선이 침몰했다. 정원 초과와 무리한 운항이 지적됐다.', src: W(1993, '서해훼리호_침몰_사고'), links: [
    k(at('jeonbuk'), '지역 분향소 앞을 지나며 걸음을 늦췄다.', { issues: { conflict: 2 } }, '여객선 침몰'),
    g('배를 탈 때 구명조끼 위치부터 보게 됐다.', { issues: { conflict: 2 } }, '여객선 침몰'),
  ] },
  { id: 'ng.1993.ur', years: [1993, 1993], sec: 'economy', headline: '우루과이라운드 타결', summary: '1993년 12월 우루과이라운드 협상이 타결돼 쌀을 비롯한 농산물 시장이 단계적으로 열리게 됐다.', src: W(1993, '우루과이_라운드'), links: [
    k(and(rural, adult), '고향 논농사 걱정에 집안 어른들 한숨이 깊어졌다.', { issues: { region: 4 } }, '쌀 시장 개방'),
    k(rural, '마을 회관에 개방 반대 현수막이 걸렸다.', { issues: { region: 3 } }, '쌀 시장 개방'),
    k(self, '수입 농산물 가격 얘기가 시장에 돌았다.', { issues: { living: 2 } }, '농산물 개방'),
    g('쌀 개방 반대 집회 소식이 이어졌다.', { issues: { region: 2 } }, '쌀 시장 개방'),
  ] },
  { id: 'ng.1993.npt', years: [1993, 1993], sec: 'world', headline: '북한 핵확산금지조약 탈퇴 선언', summary: '1993년 3월 북한이 핵확산금지조약 탈퇴를 선언해 한반도 긴장이 높아졌다.', src: W(1993, '북한_핵_문제'), links: [
    k(mil, '부대 경계 근무가 강화됐다.', { issues: { conflict: 3 }, stats: { leisure: -1 } }, '북핵 위기'),
    k(parent, '식구들 비상 식량을 조금 사 두었다.', { issues: { living: 2 } }, '북핵 위기'),
    g('핵 문제 뉴스가 연일 첫머리에 나왔다.', { issues: { conflict: 2 } }, '북핵 위기'),
  ] },
  { id: 'ng.1993.pctong', years: [1993, 1995], sec: 'tech', headline: 'PC통신 가입자 급증', summary: '1990년대 초 전화선 모뎀으로 접속하는 PC통신 서비스 가입자가 빠르게 늘었다.', src: W(1993, 'PC_통신'), links: [
    k(and(teen, L => (L.birth?.quintile ?? 3) >= 3), 'PC통신을 하다 전화 요금이 많이 나와 혼났다.', { issues: { tech: -2 }, stats: { relations: -1 } }, 'PC통신 이용'),
    k(col, '동호회 게시판에서 모르는 사람들과 밤새 글을 주고받았다.', { stats: { relations: 1 }, issues: { tech: -2 } }, 'PC통신 동호회'),
    k(emp, '사무실에 컴퓨터가 들어와 문서 작업을 배웠다.', { issues: { tech: 2 } }, '사무 전산화'),
    g('PC통신이라는 말이 신문에 자주 나왔다.', { issues: { tech: 2 } }, 'PC통신 확산'),
  ] },
  { id: 'ng.1993.army', years: [1993, 1993], sec: 'politics', headline: '군 내부 사조직 해체', summary: '1993년 정부가 군 내부 사조직을 해체하고 관련 장성들을 대거 물러나게 했다.', src: W(1993, '하나회'), links: [
    k(mil, '부대 지휘관이 바뀌었다는 소식이 전해졌다.', { issues: { conflict: -2 } }, '군 개혁'),
    k(adult, '군이 정치에서 물러난다는 말에 시대가 바뀐 걸 느꼈다.', { issues: { fairness: -2 } }, '군 개혁'),
    g('군 인사 개편 뉴스가 이어졌다.', { issues: { conflict: -2 } }, '군 사조직 해체'),
  ] },
  { id: 'ng.1993.mart', years: [1993, 1994], sec: 'economy', headline: '첫 대형 할인점 문 열어', summary: '1993년 서울에 대형 할인점이 처음 문을 열어 물건을 많이 싸게 파는 유통 방식이 퍼지기 시작했다.', src: W(1993, '대형마트'), links: [
    k(self, '가게 손님들이 할인점 얘기를 꺼냈다.', { issues: { job: 2 } }, '대형 할인점 등장'),
    k(and(parent, adult), '주말 장보기를 할인점에서 몰아서 하게 됐다.', { issues: { living: -2 } }, '대형 할인점'),
    g('카트를 끄는 장보기가 새로웠다.', { stats: { leisure: 1 } }, '대형 할인점'),
  ] },

  // ── 1994 ──
  { id: 'ng.1994.heat', years: [1994, 1994], sec: 'life', headline: '기록적 폭염과 가뭄', summary: '1994년 여름 전국에 폭염과 가뭄이 이어져 더위 피해와 전력 부족이 잇따랐다.', src: W(1994), links: [
    k(elderP, '연로한 부모님 집에 선풍기를 들고 갔다.', { issues: { care: 3 } }, '폭염 돌봄'),
    k(self, '더위에 손님이 끊겨 가게 문을 일찍 닫았다.', { issues: { living: 2 } }, '폭염 영업 타격'),
    k(rural, '고향 저수지가 바닥을 드러냈다는 연락이 왔다.', { issues: { region: 3 } }, '가뭄'),
    g('밤에도 더워 잠을 설쳤다.', { stats: { health: -1 }, issues: { living: 2 } }, '1994년 폭염'),
  ] },
  { id: 'ng.1994.nkleader', years: [1994, 1994], sec: 'world', headline: '북한 최고지도자 사망', summary: '1994년 7월 북한 최고지도자가 사망했다. 예정됐던 첫 남북정상회담은 무산됐다.', src: W(1994), links: [
    k(mil, '비상 대기로 휴가가 밀렸다.', { issues: { conflict: 3 }, stats: { leisure: -1 } }, '군 비상 대기'),
    k(adult, '정상회담이 무산됐다는 소식에 아쉬운 말이 오갔다.', { issues: { conflict: 2 } }, '정상회담 무산'),
    g('특별 뉴스가 하루 종일 이어졌다.', { issues: { conflict: 2 } }, '북한 정세 급변'),
  ] },
  { id: 'ng.1994.stockpile', years: [1994, 1994], sec: 'society', headline: '전쟁 위기설에 사재기', summary: '1994년 봄 남북 실무 접촉에서 위협 발언이 나오자 라면과 생수 같은 생필품 사재기가 일었다.', src: W(1994), links: [
    k(and(parent, adult), '라면과 쌀을 넉넉히 사 두었다.', { issues: { living: 2 } }, '생필품 사재기'),
    k(self, '가게 라면 상자가 하루 만에 비었다.', { stats: { wealth: 1 } }, '사재기 수요'),
    k(teen, '집 찬장에 라면이 쌓인 걸 보고 웃었다.', { issues: { conflict: 2 } }, '사재기'),
    g('전쟁 날 일은 없다는 말과 불안이 엇갈렸다.', { issues: { conflict: 2 } }, '전쟁 위기설'),
  ] },
  { id: 'ng.1994.ahyeon', years: [1994, 1994], sec: 'disaster', sensitive: 'disaster', headline: '서울 도심 가스 폭발', summary: '1994년 12월 서울 아현동 가스 공급 시설에서 폭발과 화재가 일어났다.', src: W(1994, '아현동_가스_폭발_사고'), links: [
    k(at('seoul'), '동네 가스 시설 점검 안내문이 붙었다.', { issues: { conflict: 2 } }, '가스 안전 점검'),
    g('가스 밸브를 한 번 더 확인하게 됐다.', { issues: { conflict: 2 } }, '도시가스 사고'),
  ] },
  { id: 'ng.1994.worldcup', years: [1994, 1994], sec: 'sports', headline: '미국 월드컵, 새벽 응원', summary: '1994년 미국 월드컵에서 한국은 조별리그에서 탈락했지만 강팀과 접전을 벌였다.', src: W(1994, '1994년_FIFA_월드컵'), links: [
    k(emp, '새벽 중계를 보고 출근해 하루 종일 졸았다.', { stats: { leisure: 1, health: -1 } }, '월드컵 새벽 중계'),
    k(teen, '친구들과 아침 경기 결과로 떠들었다.', { stats: { relations: 1 } }, '월드컵 화제'),
    g('새벽마다 동네 창문에 불이 켜졌다.', { stats: { happiness: 1 } }, '월드컵 중계'),
  ] },
  { id: 'ng.1994.infohighway', years: [1994, 1995], sec: 'tech', headline: '초고속 정보통신망 계획', summary: '정부가 전국을 광케이블로 잇는 초고속 정보통신망 구축 계획을 내놓았다.', src: W(1994, '초고속정보통신망'), links: [
    k(col, '전공 선택 때 정보통신 학과 얘기가 많아졌다.', { issues: { tech: -2 } }, '정보화 기대'),
    k(emp, '사무실에 컴퓨터 교육 일정이 잡혔다.', { issues: { tech: 3 } }, '사무 정보화'),
    k(teen, '컴퓨터 학원에 다니는 친구가 늘었다.', { issues: { edu: 2 } }, '컴퓨터 교육 수요'),
    g('정보화라는 말이 신문 제목마다 붙었다.', { issues: { tech: 2 } }, '정보화 정책'),
  ] },
  { id: 'ng.1994.pager', years: [1994, 1997], sec: 'tech', headline: '무선호출기 대중화', summary: '1990년대 중반 무선호출기 가입자가 크게 늘어 숫자 암호로 연락하는 문화가 퍼졌다.', src: W(1994, '무선호출기'), links: [
    k(col, '음성 사서함을 들으러 공중전화 앞에 줄을 섰다.', { stats: { relations: 1 } }, '무선호출기'),
    k(emp, '회사가 무선호출기를 나눠 줘 퇴근 후에도 호출이 왔다.', { stats: { leisure: -1 } }, '업무 호출'),
    k(teen, '친구끼리 숫자 암호를 외워 두었다.', { stats: { relations: 1 } }, '삐삐 문화'),
    g('허리춤에서 삐삐 소리가 울리는 게 흔해졌다.', { issues: { tech: 2 } }, '무선호출기'),
  ] },
  { id: 'ng.1994.seoul600', years: [1994, 1994], sec: 'culture', headline: '서울 정도 600년', summary: '1994년 서울이 도읍이 된 지 600년을 맞아 기념 행사와 타임캡슐 매설이 이어졌다.', src: W(1994), links: [
    k(at('seoul'), '동네 기념 행사에 가족이 함께 나갔다.', { stats: { relations: 1 } }, '서울 600년 행사'),
    k(kid, '학교에서 서울의 옛 이름을 배웠다.', { stats: { intellect: 1 } }, '서울 600년 수업'),
    g('기념 행사 소식이 방송에 나왔다.', { stats: { leisure: 1 } }, '서울 정도 600년'),
  ] },

  // ── 1995 ──
  { id: 'ng.1995.localgov', years: [1995, 1995], sec: 'politics', headline: '첫 동시 지방선거', summary: '1995년 6월 단체장과 지방의원을 한꺼번에 뽑는 지방선거로 본격적인 지방자치가 열렸다.', src: W(1995, '제1회_전국동시지방선거'), links: [
    k(and(adult, rural), '군수 후보들이 마을 회관을 돌며 인사했다.', { issues: { region: -3 } }, '지방자치 출범'),
    k(adult, '처음으로 시장·군수를 내 손으로 뽑았다.', { issues: { region: -3 } }, '단체장 직선'),
    k(teen, '선거 공보물을 펼쳐 보며 공약을 읽어 봤다.', { stats: { intellect: 1 } }, '지방선거'),
    g('동네 공약 얘기가 오갔다.', { issues: { region: -2 } }, '지방선거'),
  ] },
  { id: 'ng.1995.trash', years: [1995, 1995], sec: 'life', headline: '쓰레기 종량제 시행', summary: '1995년 1월부터 규격 봉투에 담아 버리는 쓰레기 종량제가 전국에서 시행됐다.', src: W(1995, '쓰레기_종량제'), links: [
    k(self, '가게 쓰레기 봉투값이 새 비용이 됐다.', { issues: { living: 2 } }, '종량제 비용'),
    k(and(parent, adult), '분리수거 요일을 냉장고에 붙여 두었다.', { issues: { living: 2 } }, '쓰레기 종량제'),
    k(kid, '학교에서 분리수거 당번을 맡았다.', { stats: { relations: 1 } }, '분리수거 교육'),
    g('규격 봉투를 사러 가게에 들렀다.', { issues: { living: 2 } }, '쓰레기 종량제'),
  ] },
  { id: 'ng.1995.empins', years: [1995, 1995], sec: 'labor', headline: '고용보험 시행', summary: '1995년 7월 일정 규모 이상 사업장부터 실업급여 등을 주는 고용보험이 시작됐다.', src: W(1995, '고용보험'), links: [
    k(and(priv, L => ['large', 'mid'].includes(L.job?.firmSize)), '월급 명세서에 고용보험료 줄이 새로 생겼다.', { issues: { job: -2 } }, '고용보험 가입'),
    k(and(priv, L => ['micro', 'small'].includes(L.job?.firmSize)), '우리 회사는 아직 적용 대상이 아니라고 했다.', { issues: { job: 2, fairness: 2 } }, '고용보험 사각지대'),
    k(self, '직원 보험료 얘기에 장부를 다시 봤다.', { issues: { living: 2 } }, '고용보험 부담'),
    g('실업 대비 보험이 생겼다는 기사가 났다.', { issues: { job: -2 } }, '고용보험'),
  ] },
  { id: 'ng.1995.daegu', years: [1995, 1995], sec: 'disaster', sensitive: 'disaster', headline: '대구 지하철 공사장 폭발', summary: '1995년 4월 대구 지하철 공사장에서 가스가 폭발해 등굣길 학생 등이 피해를 입었다.', src: W(1995, '대구_상인동_가스_폭발_사고'), links: [
    k(at('daegu'), '공사장 앞을 지날 때마다 마음이 무거웠다.', { issues: { conflict: 2 } }, '대구 가스 폭발'),
    k(hasKid(7, 18), '아이 등굣길을 다시 살펴보게 됐다.', { issues: { care: 2 } }, '안전 불안'),
    g('공사장 안전 점검 뉴스가 이어졌다.', { issues: { conflict: 2 } }, '공사장 사고'),
  ] },
  { id: 'ng.1995.expres', years: [1995, 1996], sec: 'politics', headline: '전직 대통령 두 명 구속', summary: '1995년 비자금 사건과 12·12, 5·18 관련 수사로 전직 대통령 두 명이 잇달아 구속됐다.', src: W(1995, '5·18_민주화운동_등에_관한_특별법'), links: [
    k(and(adult, L => L.age >= 30), '술자리마다 역사 바로 세우기 얘기가 나왔다.', { issues: { fairness: -2 } }, '과거사 청산'),
    k(col, '학교 선배들이 오래 기다린 일이라고 했다.', { issues: { fairness: -2 } }, '과거사 청산'),
    g('재판 소식이 연일 방송됐다.', { issues: { conflict: 2 } }, '전직 대통령 재판'),
  ] },
  { id: 'ng.1995.cable', years: [1995, 1995], sec: 'culture', headline: '케이블TV 개국', summary: '1995년 3월 케이블TV가 개국해 영화·스포츠·만화 전문 채널이 생겼다.', src: W(1995, '케이블_텔레비전'), links: [
    k(kid, '만화 채널을 틀어 놓고 하루를 보냈다.', { stats: { leisure: 1 } }, '케이블 만화 채널'),
    k(and(adult, L => (L.birth?.quintile ?? 3) >= 3), '케이블 설치 기사가 집에 다녀갔다.', { stats: { leisure: 1 } }, '케이블 가입'),
    g('채널 수가 늘었다는 광고가 나왔다.', { stats: { leisure: 1 } }, '케이블TV'),
  ] },
  { id: 'ng.1995.oilspill', years: [1995, 1995], sec: 'society', headline: '남해 대형 기름 유출', summary: '1995년 7월 태풍 속 여수 앞바다에서 유조선이 좌초해 기름이 남해안으로 번졌다.', src: W(1995, '씨프린스호_기름_유출_사고'), links: [
    k(and(self, at('jeonnam', 'gyeongnam', 'busan')), '양식장과 횟집 손님이 끊겼다.', { issues: { living: 4 }, money: { assets: -200 } }, '기름 유출 피해'),
    k(at('jeonnam', 'gyeongnam'), '바닷가 방제 작업에 손을 보탰다.', { stats: { relations: 1 }, issues: { region: 3 } }, '방제 작업'),
    g('검게 물든 해안 사진이 신문에 실렸다.', { issues: { region: 2 } }, '해양 오염'),
  ] },
  { id: 'ng.1995.wto', years: [1995, 1995], sec: 'economy', headline: '세계무역기구 출범', summary: '1995년 1월 세계무역기구가 출범해 농산물과 서비스 시장 개방이 빨라졌다.', src: W(1995, '세계_무역_기구'), links: [
    k(rural, '수입 농산물 얘기에 고향 걱정이 늘었다.', { issues: { region: 3 } }, '농산물 개방'),
    k(self, '수입품이 늘 거라며 가게 물건을 바꿀지 고민했다.', { issues: { job: 2 } }, '시장 개방'),
    k(big, '세계화 구호 아래 해외 영업 교육이 잡혔다.', { stats: { intellect: 1 } }, '세계화'),
    g('세계화라는 말이 일상어가 됐다.', { issues: { tech: 2 } }, '세계화'),
  ] },

  // ── 1996 ──
  { id: 'ng.1996.oecd', years: [1996, 1996], sec: 'economy', headline: 'OECD 가입', summary: '1996년 12월 한국이 경제협력개발기구 회원국이 됐다.', src: W(1996, '경제_협력_개발_기구'), links: [
    k(emp, '선진국 문턱이라는 말에 회식 자리가 들떴다.', { stats: { happiness: 1 } }, 'OECD 가입'),
    k(self, '경기가 계속 좋을 거라며 가게를 넓힐까 생각했다.', { issues: { living: 2 } }, '경기 낙관'),
    k(col, '해외 연수 계획을 세우는 친구들이 늘었다.', { issues: { edu: 2 } }, '해외 연수 붐'),
    g('선진국 클럽 가입 소식이 뉴스에 나왔다.', { issues: { fairness: -2 } }, 'OECD 가입'),
  ] },
  { id: 'ng.1996.elemname', years: [1996, 1996], sec: 'edu', headline: '국민학교, 초등학교로', summary: '1996년 3월 1일 국민학교라는 이름이 초등학교로 바뀌었다.', src: W(1996, '초등학교'), links: [
    k(kid, '학교 간판과 이름표의 학교 이름이 새로 바뀌었다.', { stats: { happiness: 1 } }, '초등학교 개칭'),
    k(hasKid(7, 12), '아이 가정통신문의 학교 이름이 달라졌다.', { stats: { relations: 1 } }, '초등학교 개칭'),
    g('입에 붙은 국민학교라는 말이 한동안 튀어나왔다.', { issues: { edu: -2 } }, '초등학교 개칭'),
  ] },
  { id: 'ng.1996.gangneung', years: [1996, 1996], sec: 'politics', headline: '강릉 해안 잠수함 침투', summary: '1996년 9월 북한 잠수함이 강릉 해안에 좌초하고 무장 인원이 침투해 수색 작전이 이어졌다.', src: W(1996, '강릉_무장공비_침투_사건'), links: [
    k(mil, '작전 소식에 부대가 비상이었다.', { issues: { conflict: 3 }, stats: { leisure: -1 } }, '대침투 작전'),
    k(at('gangwon'), '산에 들어가지 말라는 안내 방송이 나왔다.', { issues: { conflict: 3, region: 2 } }, '작전 지역'),
    g('수색 작전 뉴스가 몇 주간 이어졌다.', { issues: { conflict: 2 } }, '무장 침투'),
  ] },
  { id: 'ng.1996.laborlaw', years: [1996, 1997], sec: 'labor', headline: '노동법 기습 처리, 총파업', summary: '1996년 12월 정리해고 등을 담은 노동법이 국회에서 기습 처리돼 이듬해 초까지 총파업이 이어졌다.', src: W(1996, '노동법_날치기_파동'), links: [
    k(reg, '노조가 파업 참여를 묻는 투표를 했다.', { issues: { job: 3, conflict: 2 } }, '노동법 총파업'),
    k(self, '파업으로 거래처 납품이 밀렸다.', { issues: { living: 2 } }, '총파업 여파'),
    k(col, '거리 집회 소식이 학교에도 퍼졌다.', { issues: { conflict: 2 } }, '노동법 반대 집회'),
    g('추운 날씨에도 집회 소식이 이어졌다.', { issues: { conflict: 3 } }, '노동법 파동'),
  ] },
  { id: 'ng.1996.biff', years: [1996, 1996], sec: 'culture', headline: '첫 부산국제영화제', summary: '1996년 9월 부산에서 첫 국제영화제가 열렸다.', src: W(1996, '부산국제영화제'), links: [
    k(at('busan'), '남포동 거리에 영화 보러 온 사람들이 붐볐다.', { stats: { happiness: 1 }, issues: { region: -2 } }, '영화제 특수'),
    k(col, '영화 동아리 친구들이 부산까지 내려갔다.', { stats: { leisure: 1 } }, '영화제'),
    g('영화제 개막 소식이 방송에 나왔다.', { stats: { leisure: 1 } }, '부산국제영화제'),
  ] },
  { id: 'ng.1996.campus', years: [1996, 1996], sec: 'society', headline: '대학가 통일 행사 강제 해산', summary: '1996년 8월 서울의 한 대학에서 열린 학생 통일 행사가 경찰 진압으로 끝나 대규모 연행이 있었다.', src: W(1996), links: [
    k(col, '학생회 활동을 두고 집에서 걱정을 들었다.', { issues: { conflict: 3 } }, '학생운동 진압'),
    k(hasKid(18, 26), '대학 다니는 아이 귀가가 늦으면 마음을 졸였다.', { issues: { care: 2 } }, '학생 연행 소식'),
    g('대학가 시위 뉴스가 연일 나왔다.', { issues: { conflict: 2 } }, '대학가 시위'),
  ] },
  { id: 'ng.1996.retail', years: [1996, 1996], sec: 'economy', headline: '유통시장 전면 개방', summary: '1996년 유통시장이 전면 개방돼 외국계 대형 매장이 들어오기 시작했다.', src: W(1996, '대형마트'), links: [
    k(self, '큰 매장이 들어온다는 소문에 동네 상인들이 모였다.', { issues: { job: 3 } }, '유통 개방'),
    k(and(adult, parent), '외국계 매장 구경을 다녀왔다.', { stats: { leisure: 1 } }, '대형 매장'),
    g('외국 유통업체 상륙 기사가 실렸다.', { issues: { job: 2 } }, '유통 개방'),
  ] },
  { id: 'ng.1996.atlanta', years: [1996, 1996], sec: 'sports', headline: '애틀랜타 올림픽', summary: '1996년 미국 애틀랜타 올림픽에서 한국은 양궁·레슬링 등에서 금메달을 땄다.', src: W(1996, '1996년_하계_올림픽'), links: [
    k(teen, '새벽 양궁 결승을 보느라 늦잠을 잤다.', { stats: { leisure: 1 } }, '올림픽 중계'),
    k(work, '시차 때문에 아침마다 경기 결과를 물었다.', { stats: { relations: 1 } }, '올림픽 화제'),
    g('메달 소식에 동네가 들떴다.', { stats: { happiness: 1 } }, '올림픽'),
  ] },

  // ── 1997 ──
  { id: 'ng.1997.groupfail', years: [1997, 1997], sec: 'economy', headline: '대기업 그룹 연쇄 부도', summary: '1997년 초 대형 철강 그룹을 시작으로 여러 대기업 그룹이 잇따라 부도를 맞았다.', src: W(1997, '한보_사태'), links: [
    k(priv, '협력업체 대금이 밀린다는 소식에 회사가 술렁였다.', { issues: { job: 4 } }, '연쇄 부도'),
    k(self, '어음 결제가 걱정돼 외상을 줄였다.', { issues: { living: 3 } }, '어음 부도 불안'),
    k(seek, '채용을 미룬다는 회사가 늘었다.', { issues: { job: 3 } }, '채용 축소'),
    g('부도 기사가 경제면을 채웠다.', { issues: { job: 2 } }, '대기업 부도'),
  ] },
  { id: 'ng.1997.carfirm', years: [1997, 1997], sec: 'economy', headline: '대형 자동차사 부도유예', summary: '1997년 7월 대형 자동차 회사가 부도유예 협약 대상이 돼 협력업체와 금융시장이 흔들렸다.', src: W(1997), links: [
    k(smallW, '납품 대금이 끊길까 잔업이 줄었다.', { issues: { job: 4 }, stats: { wealth: -1 } }, '협력업체 위기'),
    k(big, '다음은 어디냐는 말이 사내에 돌았다.', { issues: { job: 3 } }, '대기업 부실'),
    k(self, '거래처가 줄줄이 결제를 미뤘다.', { issues: { living: 3 } }, '결제 지연'),
    g('경제가 심상치 않다는 말이 늘었다.', { issues: { job: 2 } }, '부도유예'),
  ] },
  { id: 'ng.1997.pcs', years: [1997, 1998], sec: 'tech', headline: '개인휴대통신 서비스 개시', summary: '1997년 10월 PCS 서비스가 시작돼 휴대폰 값이 내리고 가입자가 빠르게 늘었다.', src: W(1997, '개인휴대통신'), links: [
    k(and(emp, L => L.age >= 25), '영업용 휴대폰을 처음 장만했다.', { issues: { tech: -2 }, stats: { leisure: -1 } }, '휴대폰 보급'),
    k(col, '친구들이 하나둘 휴대폰을 들고 다녔다.', { stats: { relations: 1 } }, '휴대폰 보급'),
    k(teen, '휴대폰 가진 친구를 다들 부러워했다.', { issues: { fairness: 2 } }, '휴대폰 유행'),
    g('길거리에 휴대폰 대리점이 늘었다.', { issues: { tech: 2 } }, '이동통신 경쟁'),
  ] },
  { id: 'ng.1997.guam', years: [1997, 1997], sec: 'disaster', sensitive: 'disaster', headline: '괌 여객기 추락', summary: '1997년 8월 서울을 떠난 여객기가 괌 공항에 착륙하던 중 추락했다.', src: W(1997, '대한항공_801편_추락_사고'), links: [
    k(work, '여름휴가 비행기 예약을 두고 망설였다.', { issues: { conflict: 2 } }, '항공 사고'),
    g('항공 안전 점검 뉴스가 이어졌다.', { issues: { conflict: 2 } }, '항공 사고'),
  ] },
  { id: 'ng.1997.election', years: [1997, 1997], sec: 'politics', headline: '선거로 첫 여야 정권 교체', summary: '1997년 12월 대통령 선거에서 야당 후보가 당선돼 선거로 정권이 바뀐 첫 사례가 됐다.', src: W(1997, '제15대_대한민국_대통령_선거'), links: [
    k(adult, '경제가 어려운 와중에 투표소로 향했다.', { issues: { conflict: -2 } }, '대선 투표'),
    k(teen, '어른들이 정권이 바뀐다며 밤늦게까지 개표를 봤다.', { issues: { conflict: 2 } }, '대선 개표'),
    g('위기 속 대선 결과가 큰 뉴스가 됐다.', { issues: { conflict: -2 } }, '15대 대선'),
  ] },
  { id: 'ng.1997.hongkong', years: [1997, 1997], sec: 'world', headline: '홍콩, 중국에 반환', summary: '1997년 7월 영국령이던 홍콩이 중국에 반환됐다.', src: W(1997, '홍콩_반환'), links: [
    k(big, '아시아 거점 사무소가 어디로 갈지 회사에서 얘기가 나왔다.', { issues: { job: 2 } }, '홍콩 반환'),
    k(teen, '세계사 시간에 아편전쟁 얘기를 배웠다.', { stats: { intellect: 1 } }, '홍콩 반환 수업'),
    g('반환식 중계가 밤늦게 방송됐다.', { issues: { conflict: -2 } }, '홍콩 반환'),
  ] },
  { id: 'ng.1997.internet', years: [1997, 1998], sec: 'tech', headline: '인터넷 이용자 늘기 시작', summary: '1997년 무렵 PC통신 회사들이 인터넷 접속 서비스를 내놓아 홈페이지와 전자우편 이용이 늘었다.', src: W(1997, '대한민국의_인터넷'), links: [
    k(col, '학교 전산실에서 처음 인터넷 홈페이지를 열어 봤다.', { issues: { tech: -2 }, stats: { intellect: 1 } }, '인터넷 첫 경험'),
    k(teen, '컴퓨터 시간에 인터넷 검색을 배웠다.', { issues: { tech: -2 } }, '정보 교육'),
    k(emp, '회사 전산실이 사내 전자우편을 깔았다.', { issues: { tech: 2 } }, '사무 전산화'),
    g('인터넷이라는 말이 광고에 자주 나왔다.', { issues: { tech: 2 } }, '인터넷 보급'),
  ] },
  { id: 'ng.1997.fx', years: [1997, 1998], sec: 'economy', headline: '환율 달러당 2천 원 육박', summary: '1997년 12월 원·달러 환율이 한때 2천 원 가까이 치솟아 수입 물가가 크게 올랐다.', src: W(1997, '1997년_외환_위기'), links: [
    k(col, '어학연수를 떠난 친구들이 줄줄이 돌아왔다.', { issues: { edu: 3 } }, '환율 급등'),
    k(self, '수입 원자재값이 뛰어 물건값을 올려야 했다.', { issues: { living: 4 } }, '수입 물가 급등'),
    k(and(parent, adult), '기름값과 장바구니 물가에 가계부가 빨개졌다.', { issues: { living: 4 } }, '물가 급등'),
    g('환율 전광판 숫자가 매일 뉴스에 나왔다.', { issues: { living: 3 } }, '환율 급등'),
  ] },

  // ── 1998 ──
  { id: 'ng.1998.layoff', years: [1998, 1998], sec: 'labor', headline: '정리해고제 도입', summary: '1998년 2월 노사정 합의를 거쳐 경영상 이유로 해고할 수 있는 정리해고제가 법에 들어왔다.', src: W(1998, '노사정위원회'), links: [
    k(reg, '부서마다 감원 명단 얘기가 오갔다.', { issues: { job: 6 }, stats: { happiness: -1 } }, '정리해고 불안'),
    k(nonreg, '계약 연장이 안 될 거라는 말을 들었다.', { issues: { job: 5 } }, '고용 불안'),
    k(pubW, '공공기관도 구조조정을 피하지 못한다는 소문이 돌았다.', { issues: { job: 3 } }, '공공 구조조정'),
    k(hasKid(7, 25), '집에서 회사 얘기를 꺼내는 일이 줄었다.', { issues: { job: 3 } }, '가장 고용 불안'),
    g('정리해고라는 말이 뉴스마다 나왔다.', { issues: { job: 3 } }, '정리해고제'),
  ] },
  { id: 'ng.1998.unemp', years: [1998, 1999], sec: 'economy', headline: '실업률 7%대로 치솟아', summary: '1998년 실업률이 7%를 넘고 실업자가 150만 명 안팎으로 늘었다.', src: W(1998), links: [
    k(seek, '면접 볼 회사가 손에 꼽을 만큼 줄었다.', { issues: { job: 6 }, stats: { happiness: -1 } }, '채용 급감'),
    k(col, '선배들 취업 소식이 들리지 않았다.', { issues: { job: 4 } }, '졸업 취업난'),
    k(teen, '친구 아버지가 회사를 그만두셨다는 얘기를 들었다.', { issues: { job: 2 } }, '실직 가정'),
    k(self, '실직자들이 가게를 차리겠다며 상담을 왔다.', { issues: { job: 2 } }, '생계형 창업'),
    g('공원 벤치에 양복 입은 사람이 늘었다는 기사가 났다.', { issues: { job: 3 } }, '대량 실업'),
  ] },
  { id: 'ng.1998.banks', years: [1998, 1998], sec: 'economy', headline: '부실 은행 다섯 곳 퇴출', summary: '1998년 6월 부실 은행 다섯 곳이 문을 닫고 다른 은행으로 넘어갔다.', src: W(1998), links: [
    k(saver, '예금이 안전한지 은행 창구에 확인하러 갔다.', { issues: { living: 2 } }, '예금 불안'),
    k(debt, '대출을 옮겨야 한다는 안내를 받았다.', { issues: { living: 2 } }, '은행 퇴출'),
    g('간판을 내린 은행 지점 사진이 실렸다.', { issues: { fairness: 2 } }, '은행 구조조정'),
  ] },
  { id: 'ng.1998.homeless', years: [1998, 1999], sec: 'society', headline: '거리 노숙인 급증', summary: '외환위기 뒤 일자리를 잃고 거리로 나온 노숙인이 서울역 등 대도시 역 주변에서 크게 늘었다.', src: W(1998, '노숙인'), links: [
    k(and(emp, capital), '출근길 역 대합실 풍경이 낯설어졌다.', { issues: { fairness: 2 } }, '노숙인 증가'),
    k(poor, '남의 일 같지 않아 지출을 더 줄였다.', { issues: { living: 3 } }, '생계 불안'),
    g('무료 급식소 줄이 길어졌다는 뉴스를 봤다.', { issues: { fairness: 2 } }, '노숙인 증가'),
  ] },
  { id: 'ng.1998.kumgang', years: [1998, 1998], sec: 'politics', headline: '금강산 관광선 첫 출항', summary: '1998년 11월 동해항에서 금강산 관광선이 처음 출항했다.', src: W(1998, '금강산_관광'), links: [
    k(elderP, '부모님이 금강산 구경을 가고 싶다고 하셨다.', { stats: { relations: 1 } }, '금강산 관광'),
    k(mil, '남북 교류 소식에 부대 분위기가 조금 누그러졌다.', { issues: { conflict: -2 } }, '남북 교류'),
    g('배를 타고 북녘 산에 간다는 소식이 신기했다.', { issues: { conflict: -2 } }, '금강산 관광'),
  ] },
  { id: 'ng.1998.golf', years: [1998, 1998], sec: 'sports', headline: '맨발 투혼, 골프 메이저 우승', summary: '1998년 7월 한국 여자 선수가 미국 메이저 골프 대회에서 연장 끝에 우승했다.', src: W(1998), links: [
    k(kid, '방송에 나온 맨발 장면을 몇 번이고 봤다.', { stats: { happiness: 1 } }, '골프 우승'),
    k(seek, '힘든 때 버티는 모습에 조금 힘을 얻었다.', { stats: { happiness: 1 } }, '위로가 된 승전보'),
    g('어려운 때 들려온 우승 소식에 위로를 받았다.', { stats: { happiness: 1 } }, '골프 우승'),
  ] },
  { id: 'ng.1998.jiri', years: [1998, 1998], sec: 'disaster', sensitive: 'disaster', headline: '지리산 일대 집중호우', summary: '1998년 7~8월 집중호우로 지리산 계곡 야영객과 주민들이 큰 피해를 입었다.', src: W(1998), links: [
    k(at('jeonnam', 'gyeongnam', 'jeonbuk'), '이웃 고장 수해 복구 소식에 성금을 보탰다.', { stats: { relations: 1 } }, '수해 성금'),
    g('계곡 야영을 조심하라는 안내가 이어졌다.', { issues: { conflict: 2 } }, '집중호우'),
  ] },
  { id: 'ng.1998.japan', years: [1998, 1999], sec: 'culture', headline: '일본 대중문화 단계 개방', summary: '1998년 10월 일본 영화와 출판 만화 등이 처음으로 정식 개방됐다.', src: W(1998, '일본_대중문화_개방'), links: [
    k(teen, '일본 만화와 영화를 정식으로 볼 수 있게 됐다.', { stats: { leisure: 1 } }, '일본 문화 개방'),
    k(col, '일본 영화를 보러 극장에 갔다.', { stats: { leisure: 1 } }, '일본 문화 개방'),
    g('개방 찬반 얘기가 오갔다.', { issues: { conflict: 2 } }, '일본 문화 개방'),
  ] },
  { id: 'ng.1998.broadband', years: [1998, 1999], sec: 'tech', headline: '초고속 인터넷 상용 서비스', summary: '1998년 케이블망을 이용한 초고속 인터넷이 상용화됐고 이듬해 전화선 방식도 나왔다.', src: W(1998, '초고속_인터넷'), links: [
    k(teen, '집에 인터넷 선이 들어와 컴퓨터 앞에 앉는 시간이 늘었다.', { issues: { tech: -2 }, stats: { leisure: 1 } }, '초고속망 보급'),
    k(seek, '실직자 정보화 교육 과정에 등록했다.', { issues: { tech: -2, job: -2 } }, '정보화 교육'),
    k(self, 'PC방을 차리겠다는 지인이 생겼다.', { issues: { job: 2 } }, 'PC방 창업'),
    g('정부가 실업 대책으로 정보화 교육을 늘렸다.', { issues: { tech: 2 } }, '초고속망'),
  ] },

  // ── 1999 ──
  { id: 'ng.1999.venture', years: [1999, 2000], sec: 'economy', headline: '벤처 붐, 코스닥 과열', summary: '1999년 정부 지원과 인터넷 기대감에 벤처 창업이 늘고 코스닥 주가가 급등했다.', src: W(1999, '닷컴_버블'), links: [
    k(and(emp, young), '스톡옵션을 받고 벤처로 옮긴다는 동료가 생겼다.', { issues: { job: 2, tech: -2 } }, '벤처 이직 붐'),
    k(saver, '주변 권유로 코스닥 주식을 조금 샀다.', { issues: { living: 2 } }, '주식 열풍'),
    k(col, '창업 동아리가 학교마다 생겼다.', { issues: { job: -2 } }, '창업 붐'),
    g('벤처 부자 이야기가 신문에 실렸다.', { issues: { fairness: 2 } }, '벤처 붐'),
  ] },
  { id: 'ng.1999.groupbreak', years: [1999, 1999], sec: 'economy', headline: '대형 그룹 워크아웃', summary: '1999년 8월 재계 2위였던 대기업 그룹이 워크아웃에 들어가 사실상 해체 수순을 밟았다.', src: W(1999, '대우그룹'), links: [
    k(big, '계열사 매각 소식에 사원증을 만지작거렸다.', { issues: { job: 5 } }, '그룹 해체'),
    k(smallW, '큰 거래처가 흔들려 일감이 줄었다.', { issues: { job: 4 } }, '협력업체 타격'),
    k(saver, '가입한 투자 상품에 그 회사 채권이 섞였다는 말을 들었다.', { issues: { living: 3 } }, '회사채 손실'),
    g('대마불사는 없다는 말이 돌았다.', { issues: { job: 2 } }, '그룹 해체'),
  ] },
  { id: 'ng.1999.camp', years: [1999, 1999], sec: 'disaster', sensitive: 'disaster', headline: '청소년 수련원 화재', summary: '1999년 6월 경기 화성의 청소년 수련 시설에서 불이 나 캠프에 온 유치원생 등이 희생됐다.', src: W(1999, '씨랜드_청소년수련원_화재_사고'), links: [
    k(hasKid(3, 12), '아이 단체 캠프 신청서를 다시 들여다봤다.', { issues: { care: 3 } }, '수련 시설 안전'),
    g('수련 시설 안전 점검 뉴스가 이어졌다.', { issues: { conflict: 2 } }, '수련원 화재'),
  ] },
  { id: 'ng.1999.pension', years: [1999, 1999], sec: 'labor', headline: '국민연금 도시 자영업자로 확대', summary: '1999년 4월 국민연금이 도시 지역 자영업자 등에게 확대돼 전 국민 연금 시대가 열렸다.', src: W(1999, '국민연금'), links: [
    k(self, '소득 신고서를 받아 들고 보험료를 계산해 봤다.', { issues: { living: 2, care: -2 } }, '연금 가입 확대'),
    k(and(poor, not(work)), '보험료를 낼 형편이 안 돼 납부 예외를 신청했다.', { issues: { care: 2, fairness: 2 } }, '연금 사각지대'),
    k(emp, '연금 고지 논란 뉴스를 보며 내 연금을 따져 봤다.', { issues: { care: -2 } }, '연금 확대'),
    g('연금 소득 신고 논란이 이어졌다.', { issues: { care: -2 } }, '국민연금 확대'),
  ] },
  { id: 'ng.1999.pcbang', years: [1999, 2001], sec: 'tech', headline: 'PC방·온라인 게임 열풍', summary: '초고속망 보급과 함께 PC방이 전국에 크게 늘고 온라인 게임과 전략 게임 대회가 인기를 끌었다.', src: W(1999, 'PC방'), links: [
    k(teen, '방과 후 친구들과 PC방에 들렀다.', { stats: { relations: 1, leisure: 1 } }, 'PC방 문화'),
    k(col, '공강 시간마다 PC방에서 친구들과 게임을 했다.', { stats: { relations: 1 } }, 'PC방 문화'),
    k(self, '골목마다 생긴 PC방에 손님을 뺏겼다.', { issues: { job: 2 } }, 'PC방 급증'),
    k(hasKid(10, 18), '아이가 PC방에서 늦게 들어와 다퉜다.', { stats: { relations: -1 } }, '게임 갈등'),
    g('골목마다 PC방 간판이 걸렸다.', { issues: { tech: 2 } }, 'PC방 확산'),
  ] },
  { id: 'ng.1999.y2k', years: [1999, 1999], sec: 'tech', headline: 'Y2K 대란 우려', summary: '1999년 말 컴퓨터가 2000년을 잘못 인식할 수 있다는 우려에 기관마다 점검을 벌였다.', src: W(1999, '2000년_문제'), links: [
    k(emp, '연말 당직으로 전산 점검을 지켰다.', { stats: { leisure: -1 } }, 'Y2K 대비'),
    k(and(parent, adult), '혹시 몰라 현금과 생수를 조금 챙겨 두었다.', { issues: { living: 2 } }, 'Y2K 불안'),
    g('새천년 카운트다운 속에 별일 없이 해가 바뀌었다.', { stats: { happiness: 1 } }, '새천년'),
  ] },
  { id: 'ng.1999.teacher', years: [1999, 1999], sec: 'edu', headline: '교원노조 합법화', summary: '1999년 7월 교원노조법 시행으로 교사 노동조합이 합법화됐다.', src: W(1999, '전국교직원노동조합'), links: [
    k(teen, '담임 선생님이 노조 얘기를 조심스럽게 꺼냈다.', { issues: { conflict: 2 } }, '교원노조'),
    k(hasKid(7, 18), '학부모 모임에서 교원노조 얘기가 오갔다.', { issues: { edu: 2 } }, '교원노조'),
    g('교원노조 합법화 찬반이 엇갈렸다.', { issues: { conflict: 2 } }, '교원노조 합법화'),
  ] },
  { id: 'ng.1999.yeonpyeong', years: [1999, 1999], sec: 'politics', headline: '서해 연평도 해상 교전', summary: '1999년 6월 연평도 인근 해상에서 남북 해군 함정이 교전했다.', src: W(1999, '제1연평해전'), links: [
    k(mil, '부대에 경계 강화 지시가 내려왔다.', { issues: { conflict: 3 } }, '서해 교전'),
    k(at('incheon'), '섬 주민들 소식에 마음이 쓰였다.', { issues: { conflict: 3 } }, '접경 지역 긴장'),
    g('서해 소식에 주가가 출렁였다는 뉴스가 났다.', { issues: { conflict: 2 } }, '서해 교전'),
  ] },
  { id: 'ng.1999.film', years: [1999, 1999], sec: 'culture', headline: '한국 영화 흥행 신기록', summary: '1999년 첩보 액션 한국 영화가 외화를 제치고 흥행 기록을 새로 썼다.', src: W(1999, '1999년_한국_영화'), links: [
    k(or2(col, young), '친구들과 극장 앞에 길게 줄을 섰다.', { stats: { relations: 1, leisure: 1 } }, '한국 영화 붐'),
    k(teen, '친구들이 본 영화 줄거리를 다 말해 버렸다.', { stats: { relations: 1 } }, '흥행 영화'),
    g('한국 영화 볼 만하다는 말이 늘었다.', { stats: { leisure: 1 } }, '한국 영화 흥행'),
  ] },
  // ── 2000 ──
  { id: 'ng.2000.summit', years: [2000, 2000], sec: 'politics', headline: '분단 후 첫 남북정상회담', summary: '2000년 6월 평양에서 분단 이후 첫 남북정상회담이 열려 6·15 공동선언이 발표됐다.', src: W(2000, '2000년_남북정상회담'), links: [
    k(mil, '부대에 긴장 완화 분위기가 돌았다.', { issues: { conflict: -3 } }, '남북정상회담'),
    k(elderP, '부모님이 TV 앞에서 눈시울을 붉히셨다.', { stats: { relations: 1 } }, '남북정상회담'),
    k(teen, '통일 글짓기 숙제가 나왔다.', { stats: { intellect: 1 } }, '통일 교육'),
    g('두 정상이 손을 맞잡는 장면이 계속 방송됐다.', { issues: { conflict: -2 } }, '남북정상회담'),
  ] },
  { id: 'ng.2000.reunion', years: [2000, 2000], sec: 'society', headline: '이산가족 서울·평양 상봉', summary: '2000년 8월 남북 이산가족 방문단이 서울과 평양을 오가며 15년 만에 상봉이 이뤄졌다.', src: W(2000, '남북_이산가족_상봉'), links: [
    k(elderP, '부모님이 상봉 신청자 명단 얘기를 하셨다.', { stats: { relations: 1 }, issues: { care: 2 } }, '이산가족 상봉'),
    k(adult, '상봉 장면을 보다 같이 눈물을 훔쳤다.', { stats: { relations: 1 } }, '이산가족 상봉'),
    g('상봉 장면이 온종일 방송됐다.', { issues: { conflict: -2 } }, '이산가족 상봉'),
  ] },
  { id: 'ng.2000.welfare', years: [2000, 2001], sec: 'society', headline: '국민기초생활보장제 시행', summary: '2000년 10월 근로 능력과 관계없이 최저생계비에 못 미치는 가구에 생계비를 주는 제도가 시작됐다.', src: W(2000, '국민기초생활보장법'), links: [
    k(and(poor, not(work)), '동사무소에서 수급 상담을 받아 보라는 안내를 들었다.', { issues: { living: -3, medical: -2 } }, '기초생활보장'),
    k(and(poor, nonreg), '소득 기준에 걸릴까 신청서를 두고 망설였다.', { issues: { fairness: 2 } }, '수급 기준'),
    k(pubW, '사회복지 창구 업무가 크게 늘었다.', { stats: { leisure: -1 } }, '복지 행정 확대'),
    g('최저생계비라는 말이 뉴스에 나왔다.', { issues: { fairness: -2 } }, '기초생활보장'),
  ] },
  { id: 'ng.2000.nhis', years: [2000, 2000], sec: 'health', headline: '건강보험 하나로 통합', summary: '2000년 7월 직장·지역 의료보험 조합이 하나의 국민건강보험공단으로 통합됐다.', src: W(2000, '국민건강보험공단'), links: [
    k(self, '지역가입 보험료 고지서가 새로 날아왔다.', { issues: { living: 2 } }, '건강보험 통합'),
    k(emp, '보험증 발급처가 공단으로 바뀌었다.', { issues: { medical: -2 } }, '건강보험 통합'),
    k(L => (L.stats?.health ?? 70) < 50, '병원 갈 일이 잦아 보험 얘기를 꼼꼼히 들었다.', { issues: { medical: 2 } }, '건강보험'),
    g('보험료 형평성 논쟁이 이어졌다.', { issues: { medical: -2 } }, '건강보험 통합'),
  ] },
  { id: 'ng.2000.dotcom', years: [2000, 2001], sec: 'economy', headline: '닷컴 거품 붕괴, 코스닥 급락', summary: '2000년 3월 정점을 찍은 코스닥 지수가 연말까지 80% 가까이 떨어지며 벤처 거품이 꺼졌다.', src: W(2000, '닷컴_버블'), links: [
    k(and(emp, young), '벤처로 옮긴 동료 회사가 문을 닫았다는 소식을 들었다.', { issues: { job: 3, tech: 2 } }, '벤처 거품 붕괴'),
    k(saver, '사 둔 주식이 반토막 아래로 떨어졌다.', { money: { assets: -300 }, stats: { happiness: -1 } }, '주가 폭락'),
    k(col, '창업하겠다던 선배가 취업 준비로 돌아섰다.', { issues: { job: 2 } }, '벤처 붕괴'),
    g('벤처 신화가 무너졌다는 기사가 이어졌다.', { issues: { tech: 2 } }, '닷컴 붕괴'),
  ] },
  { id: 'ng.2000.sydney', years: [2000, 2000], sec: 'sports', headline: '올림픽 남북 공동 입장', summary: '2000년 시드니 올림픽 개막식에서 남북 선수단이 한반도기를 들고 함께 입장했다.', src: W(2000, '2000년_하계_올림픽'), links: [
    k(teen, '개막식 장면을 보며 친구들과 박수를 쳤다.', { stats: { happiness: 1 } }, '공동 입장'),
    k(adult, '같은 깃발 아래 걷는 모습에 마음이 묘했다.', { issues: { conflict: -2 } }, '남북 공동 입장'),
    g('개막식 장면이 여러 번 방송됐다.', { issues: { conflict: -2 } }, '공동 입장'),
  ] },
  { id: 'ng.2000.civic', years: [2000, 2000], sec: 'politics', headline: '시민단체 낙선운동', summary: '2000년 총선을 앞두고 시민단체들이 부적격 후보 명단을 공개하는 낙선운동을 벌였다.', src: W(2000, '제16대_국회의원_선거'), links: [
    k(young, '명단을 확인하고 투표소에 갔다.', { issues: { fairness: -2 } }, '유권자 운동'),
    k(adult, '찬반 논란 속에 후보 경력을 다시 들여다봤다.', { issues: { conflict: 2 } }, '낙선운동 논란'),
    g('낙선 대상 명단 발표가 큰 뉴스가 됐다.', { issues: { fairness: -2 } }, '낙선운동'),
  ] },
  { id: 'ng.2000.nobel', years: [2000, 2000], sec: 'world', headline: '한국인 첫 노벨평화상', summary: '2000년 10월 남북 화해와 민주주의에 기여한 공로로 한국인이 처음 노벨평화상을 받았다.', src: W(2000, '노벨_평화상'), links: [
    k(teen, '사회 시간에 노벨상 얘기를 들었다.', { stats: { intellect: 1 } }, '노벨상 수업'),
    k(adult, '수상 평가를 두고 의견이 갈리기도 했다.', { issues: { conflict: 2 } }, '노벨상 평가'),
    g('첫 노벨상 소식이 뉴스 첫머리에 나왔다.', { stats: { happiness: 1 } }, '노벨평화상'),
  ] },

  // ── 2001 ──
  { id: 'ng.2001.airport', years: [2001, 2001], sec: 'economy', headline: '인천국제공항 개항', summary: '2001년 3월 영종도에 새 국제공항이 문을 열었다.', src: W(2001, '인천국제공항'), links: [
    k(at('incheon'), '공항 일자리 얘기가 동네에 돌았다.', { issues: { job: -2, region: -2 } }, '공항 개항'),
    k(col, '해외 배낭여행 계획을 세웠다.', { stats: { leisure: 1 } }, '해외여행'),
    k(big, '해외 출장 길이 멀어졌다며 투덜댔다.', { stats: { leisure: -1 } }, '공항 이전'),
    g('새 공항 사진이 신문에 실렸다.', { issues: { region: -2 } }, '인천공항'),
  ] },
  { id: 'ng.2001.imfrepay', years: [2001, 2001], sec: 'economy', headline: '구제금융 조기 상환', summary: '2001년 8월 정부가 외환위기 때 IMF에서 빌린 구제금융을 예정보다 앞당겨 모두 갚았다.', src: W(2001, '1997년_외환_위기'), links: [
    k(work, '나라 빚은 갚았는데 내 형편은 그대로라는 말이 오갔다.', { issues: { fairness: 2 } }, '체감 경기 격차'),
    k(seek, '취업 시장은 아직 얼어 있었다.', { issues: { job: 3 } }, '고용 회복 지연'),
    g('외환위기 졸업이라는 말이 뉴스에 나왔다.', { stats: { happiness: 1 } }, 'IMF 상환'),
  ] },
  { id: 'ng.2001.911', years: [2001, 2001], sec: 'world', headline: '미국 9·11 테러', summary: '2001년 9월 미국 뉴욕과 워싱턴에서 항공기 동시 테러가 일어났다.', src: W(2001, '9·11_테러'), links: [
    k(big, '해외 출장 일정이 줄줄이 취소됐다.', { issues: { job: 2 } }, '국제 정세 불안'),
    k(saver, '주가가 급락해 계좌를 들여다봤다.', { issues: { living: 2 } }, '증시 급락'),
    k(col, '유학 준비하던 친구가 계획을 미뤘다.', { issues: { edu: 2 } }, '유학 차질'),
    g('무너지는 건물 화면이 며칠 동안 방송됐다.', { issues: { conflict: 3 } }, '9·11 테러'),
  ] },
  { id: 'ng.2001.snow', years: [2001, 2001], sec: 'life', headline: '중부 기록적 폭설', summary: '2001년 1월 서울 등 중부 지방에 기록적인 폭설이 내려 교통이 마비됐다.', src: W(2001), links: [
    k(and(emp, capital), '눈길에 출근이 몇 시간씩 걸렸다.', { stats: { leisure: -1 } }, '폭설 출근'),
    k(self, '눈 때문에 며칠 장사를 공쳤다.', { issues: { living: 2 } }, '폭설 영업 타격'),
    k(kid, '동네 골목에서 눈사람을 만들었다.', { stats: { happiness: 1 } }, '폭설'),
    g('창밖에 쌓인 눈을 보며 하루를 보냈다.', { issues: { living: 2 } }, '중부 폭설'),
  ] },
  { id: 'ng.2001.maternity', years: [2001, 2002], sec: 'labor', headline: '출산휴가 90일로 확대', summary: '2001년 11월부터 출산 전후 휴가가 60일에서 90일로 늘고 육아휴직 급여가 생겼다.', src: W(2001, '모성보호'), links: [
    k(and(emp, female, partner), '출산휴가를 석 달 쓸 수 있다는 공지를 봤다.', { issues: { care: -3 } }, '모성보호 확대'),
    k(and(emp, female), '휴가는 늘었어도 쓸 수 있을지 눈치가 보였다.', { issues: { care: 2, fairness: 2 } }, '휴가 눈치'),
    k(and(emp, partner, not(female)), '배우자 출산 땐 어떻게 하냐는 얘기가 사내에 돌았다.', { issues: { care: 2 } }, '맞돌봄 부담'),
    g('육아휴직 급여 신설 소식이 나왔다.', { issues: { care: -2 } }, '모성보호'),
  ] },
  { id: 'ng.2001.gamer', years: [2001, 2004], sec: 'culture', headline: '프로게임 리그 열풍', summary: '게임 전문 방송 채널과 프로게이머 리그가 생겨 10~20대 사이에서 큰 인기를 끌었다.', src: W(2001, '스타크래프트_프로리그'), links: [
    k(teen, '친구들과 어젯밤 경기 얘기로 쉬는 시간을 보냈다.', { stats: { relations: 1 } }, '게임 리그'),
    k(col, '경기장에 응원하러 다녀왔다.', { stats: { leisure: 1 } }, '게임 리그'),
    k(hasKid(10, 19), '아이가 프로게이머가 되겠다고 해 걱정했다.', { issues: { edu: 2 } }, '진로 갈등'),
    g('게임도 직업이 된다는 기사가 나왔다.', { issues: { tech: 2 } }, '프로게임'),
  ] },
  { id: 'ng.2001.healthfin', years: [2001, 2001], sec: 'health', headline: '건강보험 재정 바닥', summary: '2001년 의약분업 뒤 진료비 지출이 늘며 건강보험 재정이 적자에 빠져 보험료가 올랐다.', src: W(2001, '국민건강보험'), links: [
    k(emp, '오른 건강보험료가 찍힌 명세서를 받았다.', { issues: { living: 2 } }, '보험료 인상'),
    k(self, '지역 보험료가 또 올라 한숨이 나왔다.', { issues: { living: 3 } }, '보험료 인상'),
    k(L => (L.stats?.health ?? 70) < 50, '본인 부담이 늘까 걱정이 앞섰다.', { issues: { medical: 3 } }, '의료비 부담'),
    g('건강보험 재정 위기 뉴스가 이어졌다.', { issues: { medical: 2 } }, '건강보험 재정'),
  ] },
  { id: 'ng.2001.lowrate', years: [2001, 2002], sec: 'economy', headline: '사상 최저 금리, 대출 급증', summary: '2001년 기준금리가 잇달아 내려 사상 최저 수준이 되자 주택담보대출 등 가계 빚이 빠르게 늘었다.', src: W(2001, '한국은행_기준금리'), links: [
    k(mort, '대출 이자가 줄어 숨통이 트였다.', { issues: { living: -2 } }, '저금리'),
    k(and(saver, not(owner)), '예금 이자로는 안 된다며 집 사자는 얘기가 나왔다.', { issues: { housing: 2 } }, '저금리 투자 압박'),
    k(L => adult(L) && (L.money?.assets ?? 0) >= 1000 && !mort(L), '예금 이자가 줄어 통장 불어나는 재미가 없어졌다.', { issues: { living: 2 } }, '저금리 예금'),
    g('은행마다 대출 광고가 늘었다.', { issues: { housing: 2 } }, '저금리'),
  ] },
  { id: 'ng.2001.women', years: [2001, 2001], sec: 'politics', headline: '여성부 출범', summary: '2001년 1월 여성 정책을 맡는 정부 부처인 여성부가 문을 열었다.', src: W(2001, '여성가족부'), links: [
    k(and(emp, female), '직장 내 성희롱 예방 교육이 처음 잡혔다.', { issues: { fairness: -2 } }, '여성 정책'),
    k(and(female, col), '여성 채용 차별 얘기가 수업에 나왔다.', { issues: { fairness: 2 } }, '채용 차별'),
    g('새 부처 출범 소식이 나왔다.', { issues: { fairness: -2 } }, '여성부 출범'),
  ] },

  // ── 2002 ──
  { id: 'ng.2002.candle', years: [2002, 2002], sec: 'society', headline: '여중생 추모 촛불집회', summary: '2002년 6월 경기 양주에서 미군 장갑차에 여중생 두 명이 숨진 뒤 연말까지 추모 촛불집회가 이어졌다.', src: W(2002, '양주_미군_장갑차_여중생_압사_사건'), links: [
    k(col, '친구들과 광화문 추모 촛불에 나갔다.', { issues: { conflict: 2 }, stats: { relations: 1 } }, '추모 촛불'),
    k(teen, '또래의 일이라 학교 분위기가 무거웠다.', { issues: { conflict: 2 } }, '여중생 사고'),
    k(hasKid(10, 18), '아이와 함께 추모 소식을 보며 말을 아꼈다.', { issues: { care: 2 } }, '여중생 사고'),
    g('추모 촛불 소식이 겨울까지 이어졌다.', { issues: { conflict: 2 } }, '촛불 추모'),
  ] },
  { id: 'ng.2002.yeonpyeong', years: [2002, 2002], sec: 'politics', headline: '서해 교전 다시 발생', summary: '2002년 6월 월드컵 기간 중 연평도 인근에서 남북 해군이 교전해 우리 장병들이 희생됐다.', src: W(2002, '제2연평해전'), links: [
    k(mil, '부대 분위기가 숙연해졌다.', { issues: { conflict: 3 } }, '서해 교전'),
    k(hasKid(19, 24), '자녀 또래 장병들 소식에 밤잠을 설쳤다.', { issues: { care: 3 } }, '군 복무 자녀'),
    g('응원 열기 속 비보에 마음이 무거웠다.', { issues: { conflict: 2 } }, '서해 교전'),
  ] },
  { id: 'ng.2002.rusa', years: [2002, 2002], sec: 'disaster', sensitive: 'disaster', headline: '태풍 루사, 강릉 물난리', summary: '2002년 8월 태풍 루사가 강릉에 하루 870㎜ 넘는 비를 뿌리는 등 전국에 큰 피해를 냈다.', src: W(2002, '태풍_루사'), links: [
    k(at('gangwon'), '수해 복구에 손을 보태며 여름을 보냈다.', { stats: { relations: 1 }, issues: { region: 3 } }, '태풍 피해'),
    k(and(rural, adult), '고향 논밭이 물에 잠겼다는 연락을 받았다.', { issues: { region: 3 } }, '농경지 피해'),
    g('수재의연금 모금이 이어졌다.', { issues: { living: 2 } }, '태풍 루사'),
  ] },
  { id: 'ng.2002.busan', years: [2002, 2002], sec: 'sports', headline: '부산 아시안게임 개최', summary: '2002년 가을 부산 아시안게임이 열렸고 북한 선수단과 응원단도 참가했다.', src: W(2002, '2002년_아시안_게임'), links: [
    k(at('busan'), '경기장 가는 길이 사람들로 붐볐다.', { stats: { happiness: 1 }, issues: { region: -2 } }, '아시안게임 개최'),
    k(teen, '북한 응원단 얘기가 반에서 화제였다.', { stats: { relations: 1 } }, '북한 응원단'),
    g('월드컵에 이어 또 한 번 국제 대회가 열렸다.', { stats: { leisure: 1 } }, '부산 아시안게임'),
  ] },
  { id: 'ng.2002.election', years: [2002, 2002], sec: 'politics', headline: '16대 대선, 젊은 표심 주목', summary: '2002년 12월 대통령 선거에서 인터넷 지지 모임과 젊은 층의 투표가 큰 변수로 떠올랐다.', src: W(2002, '제16대_대한민국_대통령_선거'), links: [
    k(young, '친구들과 투표했는지 서로 물어봤다.', { issues: { fairness: -2 } }, '청년 투표'),
    k(and(adult, L => L.age >= 45), '젊은 사람들과 정치 얘기가 엇갈렸다.', { issues: { conflict: 3 } }, '세대 갈등'),
    g('세대별 투표 성향이 뉴스에 나왔다.', { issues: { conflict: 2 } }, '16대 대선'),
  ] },
  { id: 'ng.2002.lotto', years: [2002, 2003], sec: 'life', headline: '로또 복권 열풍', summary: '2002년 12월 새 방식의 복권이 발매되고 이월 당첨금이 크게 쌓이며 열풍이 불었다.', src: W(2002, '로또_6/45'), links: [
    k(emp, '사무실에서 돈을 모아 번호를 함께 샀다.', { stats: { relations: 1 } }, '로또 열풍'),
    k(poor, '주말마다 복권 몇 장을 사며 버텼다.', { issues: { fairness: 2 } }, '복권 열풍'),
    k(self, '복권 판매점 앞에 줄이 늘어섰다.', { issues: { fairness: 2 } }, '로또 열풍'),
    g('당첨 번호 발표 시간에 TV 앞에 앉았다.', { stats: { leisure: 1 } }, '로또'),
  ] },
  { id: 'ng.2002.house', years: [2002, 2002], sec: 'housing', headline: '아파트값 급등, 강남발 과열', summary: '저금리 속에 2001~2002년 서울 강남을 중심으로 아파트값이 크게 올랐다.', src: W(2002, '대한민국의_부동산_정책'), links: [
    k(and(owner, capital), '집값이 올랐다는 말에 마음이 놓였다.', { issues: { housing: -2 }, stats: { wealth: 1 } }, '집값 상승'),
    k(and(tenant, capital, adult), '전세 재계약 금액에 한숨이 나왔다.', { issues: { housing: 5 } }, '전셋값 상승'),
    k(and(tenant, not(capital), adult), '서울 집값 얘기는 남의 일 같았다.', { issues: { region: 2, fairness: 2 } }, '수도권 격차'),
    k(tenant, '집에서 또 이사 얘기가 나왔다.', { issues: { housing: 3 } }, '전셋값 상승'),
    g('부동산 과열 기사가 이어졌다.', { issues: { housing: 2 } }, '집값 급등'),
  ] },
  { id: 'ng.2002.broadband', years: [2002, 2002], sec: 'tech', headline: '초고속 인터넷 1천만 가입', summary: '2002년 10월 초고속 인터넷 가입자가 1천만을 넘어 가구 보급률이 세계 최고 수준이 됐다.', src: W(2002, '초고속_인터넷'), links: [
    k(teen, '숙제 자료를 인터넷으로 찾는 게 당연해졌다.', { issues: { tech: -2, edu: 2 } }, '정보 격차'),
    k(and(adult, L => L.age >= 45), '인터넷 뱅킹을 배우느라 애를 먹었다.', { issues: { tech: 3 } }, '디지털 적응'),
    k(emp, '업무 대부분이 인터넷으로 돌아갔다.', { issues: { tech: 2 } }, '업무 디지털화'),
    g('IT 강국이라는 말이 자주 나왔다.', { issues: { tech: 2 } }, '초고속망 보급'),
  ] },
  { id: 'ng.2002.minihome', years: [2002, 2005], sec: 'tech', headline: '미니홈피 열풍', summary: '2000년대 초 개인 홈페이지 서비스가 유행해 사진과 배경음악으로 꾸민 미니홈피가 일상이 됐다.', src: W(2002, '싸이월드'), links: [
    k(or2(col, young), '친구 미니홈피 방명록에 안부를 남겼다.', { stats: { relations: 2 } }, '미니홈피'),
    k(teen, '배경음악을 사려고 용돈을 아꼈다.', { stats: { leisure: 1 } }, '미니홈피 꾸미기'),
    k(and(adult, L => L.age >= 40), '아이들이 말하는 미니홈피가 무엇인지 몰랐다.', { issues: { tech: 2 } }, '세대 간 디지털 차이'),
    g('일촌이라는 말이 유행했다.', { issues: { tech: 2 } }, '미니홈피 열풍'),
  ] },

  // ── 2003 ──
  { id: 'ng.2003.iraq', years: [2003, 2004], sec: 'world', headline: '이라크 파병 결정', summary: '2003년 국회가 이라크에 공병·의료 부대를 보내는 파병안을 통과시켰고 찬반 논쟁이 거셌다.', src: W(2003, '이라크_전쟁'), links: [
    k(mil, '파병 지원자 모집 공고가 붙었다.', { issues: { conflict: 2 } }, '이라크 파병'),
    k(col, '파병 반대 서명 운동이 학교에서 열렸다.', { issues: { conflict: 3 } }, '파병 논쟁'),
    k(hasKid(19, 24), '자녀 또래 장병들이 갈까 걱정했다.', { issues: { care: 3 } }, '파병 걱정'),
    g('파병 찬반 토론이 이어졌다.', { issues: { conflict: 2 } }, '이라크 파병'),
  ] },
  { id: 'ng.2003.maemi', years: [2003, 2003], sec: 'disaster', sensitive: 'disaster', headline: '태풍 매미, 남해안 강타', summary: '2003년 9월 태풍 매미가 남해안에 상륙해 부산·경남 등에 큰 피해를 남겼다.', src: W(2003, '태풍_매미'), links: [
    k(at('busan', 'gyeongnam'), '창문에 테이프를 붙이고 밤을 새웠다.', { issues: { living: 3 } }, '태풍 피해'),
    k(and(self, at('busan', 'gyeongnam')), '가게 간판이 날아가 수리비가 들었다.', { money: { assets: -100 }, issues: { living: 3 } }, '태풍 영업 피해'),
    g('추석 연휴 귀성길이 태풍 소식으로 어수선했다.', { issues: { living: 2 } }, '태풍 매미'),
  ] },
  { id: 'ng.2003.sars', years: [2003, 2003], sec: 'health', headline: '사스 공포 확산', summary: '2003년 중국 등에서 사스가 번져 공항 검역이 강화되고 해외여행 취소가 잇따랐다.', src: W(2003, '중증_급성_호흡기_증후군'), links: [
    k(big, '중국 출장이 무기한 미뤄졌다.', { issues: { job: 2 } }, '사스 출장 제한'),
    k(self, '관광객이 줄어 매출이 떨어졌다.', { issues: { living: 2 } }, '사스 매출 감소'),
    k(hasKid(3, 12), '아이 손 씻기를 더 챙겼다.', { issues: { care: 2 } }, '감염 예방'),
    g('공항 열 감지기 화면이 뉴스에 나왔다.', { issues: { medical: 2 } }, '사스'),
  ] },
  { id: 'ng.2003.freight', years: [2003, 2003], sec: 'labor', headline: '화물차 운송 거부 사태', summary: '2003년 5월과 8월 화물차 기사들이 운송을 거부해 항만 수출입 물류가 한때 멈췄다.', src: W(2003, '화물연대'), links: [
    k(smallW, '수출 물량을 제때 못 보내 납기가 밀렸다.', { issues: { job: 2 } }, '물류 차질'),
    k(self, '물건이 제때 안 들어와 진열대가 비었다.', { issues: { living: 2 } }, '물류 차질'),
    k(and(adult, L => L.job?.code?.startsWith?.('87') ?? false), '기름값과 운임 얘기에 공감이 갔다.', { issues: { fairness: 2 } }, '운송 노동'),
    g('항만에 쌓인 컨테이너 사진이 실렸다.', { issues: { conflict: 2 } }, '운송 거부'),
  ] },
  { id: 'ng.2003.capital', years: [2003, 2003], sec: 'politics', headline: '신행정수도 특별법 통과', summary: '2003년 12월 충청권에 행정수도를 옮기는 특별법이 국회를 통과했다.', src: W(2003, '신행정수도의_건설을_위한_특별조치법'), links: [
    k(at('chungnam', 'chungbuk', 'daejeon', 'sejong'), '동네 땅값 얘기가 부쩍 많아졌다.', { issues: { region: -3 } }, '행정수도 기대'),
    k(and(pubW, capital), '부처 이전 얘기로 이사 계산을 해 봤다.', { issues: { housing: 2 } }, '공무원 이전'),
    k(and(adult, capital), '수도 이전 찬반 얘기로 의견이 갈렸다.', { issues: { conflict: 2 } }, '수도 이전 논쟁'),
    g('국토 균형 발전이 뉴스에 자주 나왔다.', { issues: { region: -2 } }, '행정수도'),
  ] },
  { id: 'ng.2003.1029', years: [2003, 2003], sec: 'housing', headline: '10·29 부동산 대책', summary: '2003년 10월 정부가 보유세 강화와 투기지역 대출 규제를 담은 종합 부동산 대책을 내놓았다.', src: W(2003, '대한민국의_부동산_정책'), links: [
    k(mort, '대출 연장 조건이 까다로워졌다는 안내를 받았다.', { issues: { housing: 2 } }, '대출 규제'),
    k(and(tenant, adult), '이번엔 집값이 잡힐까 지켜봤다.', { issues: { housing: -2 } }, '집값 안정 기대'),
    k(and(owner, capital), '세금이 늘 거라는 말에 계산기를 두드렸다.', { issues: { living: 2 } }, '보유세 강화'),
    g('대책 발표 뒤 시장 반응 기사가 이어졌다.', { issues: { housing: 2 } }, '부동산 대책'),
  ] },
  { id: 'ng.2003.neis', years: [2003, 2003], sec: 'edu', headline: '교육행정정보시스템 갈등', summary: '2003년 학생 정보를 전산으로 모으는 교육행정정보시스템을 두고 개인정보 침해 논란이 일었다.', src: W(2003, '교육행정정보시스템'), links: [
    k(teen, '선생님들 사이 분위기가 어수선했다.', { issues: { edu: 2 } }, '학교 갈등'),
    k(hasKid(7, 18), '아이 정보가 어디까지 저장되는지 궁금했다.', { issues: { edu: 2 } }, '학생 정보'),
    g('교육계 갈등 뉴스가 이어졌다.', { issues: { conflict: 2 } }, 'NEIS 갈등'),
  ] },
  { id: 'ng.2003.youthjob', years: [2003, 2004], sec: 'labor', headline: '청년 실업 심화', summary: '2003년 청년층 실업률이 8% 안팎에 머물며 이태백이라는 말이 유행했다.', src: W(2003, '청년실업'), links: [
    k(and(seek, young), '서류 전형에서 번번이 떨어졌다.', { issues: { job: 5 }, stats: { happiness: -1 } }, '청년 실업'),
    k(col, '졸업을 미루고 휴학계를 낼까 고민했다.', { issues: { job: 3, edu: 2 } }, '졸업 유예'),
    k(and(nonreg, young), '정규직 전환 얘기는 들리지 않았다.', { issues: { job: 4 } }, '청년 비정규직'),
    k(hasKid(20, 30), '취업 준비하는 아이 눈치를 보며 말을 아꼈다.', { issues: { care: 2 } }, '자녀 취업난'),
    g('청년 실업 기사가 줄을 이었다.', { issues: { job: 2 } }, '청년 실업'),
  ] },
  { id: 'ng.2003.wellbeing', years: [2003, 2004], sec: 'life', headline: '웰빙 열풍', summary: '2003년 무렵부터 유기농 식품과 요가, 반신욕 같은 건강한 생활 방식이 크게 유행했다.', src: W(2003, '웰빙'), links: [
    k(and(adult, L => L.age >= 25 && L.age <= 45), '퇴근 뒤 운동 강좌에 등록했다.', { stats: { health: 1, leisure: 1 } }, '웰빙 열풍'),
    k(and(parent, adult), '장 볼 때 유기농 코너를 기웃거렸다.', { issues: { living: 2 } }, '유기농 소비'),
    g('웰빙이라는 말이 광고마다 붙었다.', { stats: { leisure: 1 } }, '웰빙'),
  ] },

  // ── 2004 ──
  { id: 'ng.2004.impeach', years: [2004, 2004], sec: 'politics', headline: '대통령 탄핵소추와 기각', summary: '2004년 3월 국회가 대통령 탄핵소추안을 가결했고 5월 헌법재판소가 이를 기각했다.', src: W(2004, '노무현_대통령_탄핵_소추'), links: [
    k(adult, '탄핵 뉴스로 저녁 자리 의견이 갈렸다.', { issues: { conflict: 3 } }, '탄핵 정국'),
    k(col, '도심 촛불 집회 소식이 학교에 퍼졌다.', { issues: { conflict: 2 } }, '탄핵 반대 집회'),
    g('헌법재판소 결정 생중계를 지켜봤다.', { issues: { conflict: 2 } }, '탄핵 심판'),
  ] },
  { id: 'ng.2004.ktx', years: [2004, 2004], sec: 'life', headline: '고속철도 개통', summary: '2004년 4월 경부·호남 고속철도가 개통돼 서울~부산이 3시간 안팎으로 가까워졌다.', src: W(2004, '한국고속철도'), links: [
    k(at('busan', 'daegu', 'gyeongbuk', 'gyeongnam', 'jeonbuk', 'jeonnam', 'chungnam'), '서울 가는 길이 반나절에서 몇 시간으로 줄었다.', { issues: { region: -2 } }, '고속철도 개통'),
    k(emp, '당일치기 출장이 늘었다.', { stats: { leisure: -1 } }, '출장 증가'),
    k(and(adult, not(capital)), '병원은 서울로 가자는 말이 더 쉬워졌다.', { issues: { region: 2 } }, '수도권 쏠림'),
    g('역마다 고속열차 시간표가 붙었다.', { issues: { region: -2 } }, '고속철도'),
  ] },
  { id: 'ng.2004.sexlaw', years: [2004, 2004], sec: 'society', headline: '성매매특별법 시행', summary: '2004년 9월 성매매 알선과 구매를 처벌하는 특별법이 시행돼 집중 단속이 벌어졌다.', src: W(2004, '성매매특별법'), links: [
    k(self, '유흥가 상권이 얼어붙어 손님이 줄었다.', { issues: { living: 2 } }, '유흥 상권 위축'),
    k(and(emp, not(female)), '접대 문화가 바뀌어야 한다는 얘기가 회사에서 나왔다.', { issues: { fairness: -2 } }, '접대 문화 변화'),
    g('단속 현장 뉴스가 이어졌다.', { issues: { conflict: 2 } }, '성매매특별법'),
  ] },
  { id: 'ng.2004.eps', years: [2004, 2004], sec: 'labor', headline: '외국인 고용허가제 시행', summary: '2004년 8월 정부가 외국인 근로자를 합법적으로 고용하는 고용허가제를 시행했다.', src: W(2004, '고용허가제'), links: [
    k(and(priv, L => ['micro', 'small'].includes(L.job?.firmSize)), '공장에 외국인 동료가 늘었다.', { stats: { relations: 1 } }, '외국인 근로자'),
    k(self, '사람 구하기 어려워 외국인 고용을 알아봤다.', { issues: { job: -2 } }, '인력난'),
    k(rural, '고향 농가에도 외국인 일손이 들어왔다.', { issues: { region: -2 } }, '농촌 인력'),
    g('외국인 근로자 소식이 늘었다.', { issues: { conflict: 2 } }, '고용허가제'),
  ] },
  { id: 'ng.2004.unconst', years: [2004, 2004], sec: 'politics', headline: '신행정수도법 위헌 결정', summary: '2004년 10월 헌법재판소가 신행정수도 특별법에 위헌 결정을 내려 계획이 멈췄다.', src: W(2004, '신행정수도의_건설을_위한_특별조치법'), links: [
    k(at('chungnam', 'chungbuk', 'daejeon', 'sejong'), '기대하던 개발 얘기가 쑥 들어갔다.', { issues: { region: 3 } }, '행정수도 무산'),
    k(and(pubW, capital), '이사 걱정을 한시름 덜었다.', { issues: { housing: -2 } }, '이전 보류'),
    g('관습헌법이라는 말이 화제가 됐다.', { issues: { conflict: 2 } }, '위헌 결정'),
  ] },
  { id: 'ng.2004.athens', years: [2004, 2004], sec: 'sports', headline: '아테네 올림픽', summary: '2004년 그리스 아테네 올림픽에서 한국은 양궁·태권도 등에서 금메달을 땄다.', src: W(2004, '2004년_하계_올림픽'), links: [
    k(teen, '새벽 경기를 보느라 학교에서 졸았다.', { stats: { leisure: 1 } }, '올림픽 중계'),
    k(work, '아침마다 메달 얘기로 하루를 시작했다.', { stats: { relations: 1 } }, '올림픽 화제'),
    g('메달 소식에 잠시 웃었다.', { stats: { happiness: 1 } }, '아테네 올림픽'),
  ] },
  { id: 'ng.2004.hallyu', years: [2004, 2005], sec: 'culture', headline: '한국 드라마 일본 열풍', summary: '2004년 한국 드라마가 일본에서 크게 인기를 끌며 한류가 아시아로 번졌다.', src: W(2004, '한류'), links: [
    k(and(self, at('seoul', 'gangwon')), '드라마 촬영지를 찾는 외국 관광객이 늘었다.', { issues: { living: -2, region: -2 } }, '한류 관광'),
    k(and(female, L => L.age >= 35), '해외에서 한국 드라마 인기라니 신기했다.', { stats: { happiness: 1 } }, '한류'),
    g('한류라는 말이 신문에 자주 나왔다.', { stats: { happiness: 1 } }, '한류'),
  ] },
  { id: 'ng.2004.tsunami', years: [2004, 2005], sec: 'world', sensitive: 'disaster', headline: '남아시아 지진해일', summary: '2004년 12월 인도양 대지진으로 지진해일이 일어나 여러 나라에서 큰 피해가 났다.', src: W(2004, '2004년_인도양_지진_해일'), links: [
    k(adult, '구호 성금 모금에 작게나마 보탰다.', { stats: { relations: 1 } }, '해외 재난 구호'),
    g('해외 재난 소식에 연말 분위기가 가라앉았다.', { issues: { conflict: 2 } }, '지진해일'),
  ] },
  { id: 'ng.2004.kaesong', years: [2004, 2005], sec: 'economy', headline: '개성공단 첫 제품 생산', summary: '2004년 12월 개성공단에 입주한 기업에서 첫 제품이 생산됐다.', src: W(2004, '개성공업지구'), links: [
    k(smallW, '공장을 북쪽으로 옮길 수 있다는 말을 들었다.', { issues: { job: 2 } }, '개성공단'),
    k(mil, '남북 협력 소식에 경계 근무 얘기도 달라졌다.', { issues: { conflict: -2 } }, '남북 경협'),
    g('남북 경제 협력 소식이 나왔다.', { issues: { conflict: -2 } }, '개성공단'),
  ] },
  { id: 'ng.2004.badbank', years: [2004, 2004], sec: 'economy', headline: '신용불량자 구제 프로그램', summary: '2004년 신용불량자가 380만 명 안팎으로 늘자 빚을 나눠 갚게 하는 공동 채무 조정이 시작됐다.', src: W(2004, '신용불량자'), links: [
    k(credit, '채무 조정 상담 창구에 서류를 들고 갔다.', { issues: { living: -2, fairness: 2 } }, '채무 조정'),
    k(and(debt, young), '빚 독촉 전화가 와 하루가 무거웠다.', { issues: { living: 3 }, stats: { happiness: -1 } }, '채무 독촉'),
    k(pubW, '채무 조정 창구 민원이 크게 늘었다.', { stats: { leisure: -1 } }, '채무 조정 업무'),
    g('도덕적 해이 논란도 함께 나왔다.', { issues: { fairness: 2 } }, '채무 조정'),
  ] },

  // ── 2005 ──
  { id: 'ng.2005.stemcell', years: [2005, 2006], sec: 'tech', headline: '줄기세포 논문 조작 파문', summary: '2005년 말 세계적 주목을 받던 국내 줄기세포 논문이 조작된 것으로 드러났다.', src: W(2005, '황우석_사태'), links: [
    k(stg('grad'), '연구실에서 연구 윤리 교육이 새로 잡혔다.', { issues: { fairness: 2 } }, '연구 윤리'),
    k(L => (L.stats?.health ?? 70) < 50, '치료에 기대를 걸었던 마음이 허탈해졌다.', { stats: { happiness: -1 } }, '치료 기대 무산'),
    k(teen, '과학자가 꿈이었던 친구가 실망했다.', { issues: { fairness: 2 } }, '과학계 신뢰'),
    g('진실 공방 뉴스가 몇 달간 이어졌다.', { issues: { fairness: 2, conflict: 2 } }, '논문 조작'),
  ] },
  { id: 'ng.2005.831', years: [2005, 2005], sec: 'housing', headline: '8·31 부동산 대책', summary: '2005년 8월 정부가 종합부동산세 강화와 다주택자 양도세 중과를 담은 대책을 내놓았다.', src: W(2005, '종합부동산세'), links: [
    k(and(owner, capital), '보유세 고지서 걱정을 처음 해 봤다.', { issues: { living: 2 } }, '보유세 강화'),
    k(and(tenant, adult), '집값이 잡힐까 기대 반 의심 반이었다.', { issues: { housing: -2 } }, '집값 안정 기대'),
    k(mort, '대출 조이기에 갈아타기 계획을 접었다.', { issues: { housing: 2 } }, '대출 규제'),
    g('세금 폭탄 논란이 뉴스에 나왔다.', { issues: { conflict: 2 } }, '부동산 대책'),
  ] },
  { id: 'ng.2005.cheonggye', years: [2005, 2005], sec: 'life', headline: '청계천 복원 개통', summary: '2005년 10월 도심 고가도로를 걷어 내고 복원한 청계천이 시민에게 개방됐다.', src: W(2005, '청계천'), links: [
    k(and(emp, at('seoul')), '퇴근 뒤 청계천을 따라 걸었다.', { stats: { leisure: 1, health: 1 } }, '도심 산책로'),
    k(and(self, at('seoul')), '공사로 옮겨 간 주변 상가 얘기를 들었다.', { issues: { fairness: 2 } }, '상인 이주'),
    g('개통 첫 주말 인파가 몰렸다는 뉴스를 봤다.', { stats: { leisure: 1 } }, '청계천 복원'),
  ] },
  { id: 'ng.2005.hoju', years: [2005, 2005], sec: 'society', headline: '호주제 폐지 민법 통과', summary: '2005년 3월 민법이 개정돼 호주제가 폐지됐다. 2008년부터 개인별 가족관계등록부로 바뀐다.', src: W(2005, '호주제'), links: [
    k(and(L => !!L.family?.divorced, parent), '아이 성씨를 바꿀 길이 열렸다는 얘기를 들었다.', { issues: { care: -2 } }, '자녀 성 변경'),
    k(and(female, partner), '집안 제사 얘기에서도 조금 숨을 돌렸다.', { issues: { fairness: -2 } }, '가족 제도 변화'),
    g('가족 제도가 바뀐다는 소식이 화제가 됐다.', { issues: { fairness: -2 } }, '호주제 폐지'),
  ] },
  { id: 'ng.2005.birthrate', years: [2005, 2006], sec: 'society', headline: '합계출산율 1.08명', summary: '2005년 합계출산율이 1.08명으로 떨어져 저출산이 국가 과제로 떠올랐다.', src: W(2005, '대한민국의_저출산'), links: [
    k(and(partner, L => L.age >= 25 && L.age <= 39, not(parent)), '아이는 언제 낳느냐는 질문이 늘었다.', { issues: { care: 2 } }, '출산 압박'),
    k(hasKid(0, 6), '둘째 얘기에 고개를 저었다.', { issues: { care: 2, living: 2 } }, '양육비 부담'),
    k(and(young, not(partner)), '결혼과 출산은 먼 얘기 같았다.', { issues: { housing: 2 } }, '결혼 유예'),
    g('출산율 최저 기록 뉴스가 나왔다.', { issues: { care: 2 } }, '저출산'),
  ] },
  { id: 'ng.2005.yangyang', years: [2005, 2005], sec: 'disaster', sensitive: 'disaster', headline: '양양 산불, 고찰 소실', summary: '2005년 4월 강원 양양 산불로 넓은 산림과 오래된 사찰 건물이 불탔다.', src: W(2005, '낙산사'), links: [
    k(at('gangwon'), '산불 조심 안내 방송이 이어졌다.', { issues: { region: 3 } }, '산불 피해'),
    g('불탄 사찰 사진에 안타까워했다.', { issues: { conflict: 2 } }, '양양 산불'),
  ] },
  { id: 'ng.2005.apec', years: [2005, 2005], sec: 'world', headline: '부산 APEC 정상회의', summary: '2005년 11월 부산에서 아시아태평양경제협력체 정상회의가 열렸다.', src: W(2005, '2005년_APEC_정상회의'), links: [
    k(at('busan'), '도로 통제로 출퇴근길이 막혔다.', { stats: { leisure: -1 }, issues: { region: -2 } }, '정상회의 개최'),
    k(big, '해외 바이어 미팅 일정이 늘었다.', { issues: { job: -2 } }, '국제 행사'),
    g('정상들 기념 사진이 신문에 실렸다.', { issues: { conflict: -2 } }, 'APEC'),
  ] },
  { id: 'ng.2005.blog', years: [2005, 2006], sec: 'tech', headline: '블로그·1인 미디어 붐', summary: '2005년 무렵 포털마다 블로그 서비스가 커지며 개인이 글과 사진을 올리는 1인 미디어가 유행했다.', src: W(2005, '블로그'), links: [
    k(or2(col, young), '맛집 사진을 블로그에 올리기 시작했다.', { stats: { leisure: 1 }, issues: { tech: -2 } }, '블로그'),
    k(self, '가게 후기가 블로그에 올라 손님이 늘었다.', { stats: { wealth: 1 } }, '블로그 입소문'),
    k(teen, '좋아하는 가수 소식을 블로그로 찾아봤다.', { stats: { leisure: 1 } }, '블로그'),
    g('파워블로거라는 말이 생겼다.', { issues: { tech: 2 } }, '1인 미디어'),
  ] },
  { id: 'ng.2005.rice', years: [2005, 2005], sec: 'economy', headline: '쌀 협상 비준, 농민 반발', summary: '2005년 11월 쌀 시장 관세화 유예 연장과 수입 확대를 담은 협상 비준안이 국회를 통과했다.', src: W(2005, '쌀_시장_개방'), links: [
    k(and(rural, adult), '고향 쌀값이 떨어질까 집안 어른들이 걱정했다.', { issues: { region: 4 } }, '쌀 개방'),
    k(rural, '마을에 반대 현수막이 걸렸다.', { issues: { region: 3 } }, '쌀 개방 반대'),
    g('농민 집회 소식이 이어졌다.', { issues: { region: 2 } }, '쌀 협상'),
  ] },

  // ── 2006 ──
  { id: 'ng.2006.nuke', years: [2006, 2006], sec: 'world', headline: '북한 첫 핵실험', summary: '2006년 10월 북한이 첫 핵실험을 했다고 발표해 국제 사회가 제재에 나섰다.', src: W(2006, '북한의_핵실험'), links: [
    k(mil, '부대 경계 태세가 높아졌다.', { issues: { conflict: 4 } }, '북핵 실험'),
    k(saver, '주가가 출렁여 계좌를 들여다봤다.', { issues: { living: 2 } }, '증시 불안'),
    k(hasKid(18, 23), '자녀 또래 장병들 생각에 뉴스를 끄지 못했다.', { issues: { care: 2 } }, '안보 불안'),
    g('긴급 뉴스가 하루 종일 이어졌다.', { issues: { conflict: 3 } }, '북핵 실험'),
  ] },
  { id: 'ng.2006.fta', years: [2006, 2006], sec: 'economy', headline: '한미 FTA 협상 개시', summary: '2006년 2월 한미 자유무역협정 협상이 시작돼 농민·노동계의 반대 집회가 이어졌다.', src: W(2006, '한미_자유무역협정'), links: [
    k(rural, '고향 축산 농가에 걱정이 커졌다.', { issues: { region: 3 } }, '농업 개방'),
    k(big, '수출 늘 거라는 회사 전망 보고서를 받았다.', { issues: { job: -2 } }, '수출 기대'),
    k(self, '수입품 가격이 내릴까 기대 반 걱정 반이었다.', { issues: { living: 2 } }, '시장 개방'),
    g('FTA 찬반 집회 소식이 이어졌다.', { issues: { conflict: 2 } }, '한미 FTA'),
  ] },
  { id: 'ng.2006.wbc', years: [2006, 2006], sec: 'sports', headline: '세계 야구 대회 4강', summary: '2006년 3월 첫 월드베이스볼클래식에서 한국 대표팀이 4강에 올랐다.', src: W(2006, '2006년_월드_베이스볼_클래식'), links: [
    k(emp, '점심시간 식당 TV 앞이 응원석이 됐다.', { stats: { relations: 1 } }, '야구 응원'),
    k(teen, '친구들과 다시 야구 얘기를 하기 시작했다.', { stats: { relations: 1 } }, '야구 붐'),
    g('예상 밖 선전에 들뜬 봄이었다.', { stats: { happiness: 1 } }, 'WBC 4강'),
  ] },
  { id: 'ng.2006.bubble', years: [2006, 2006], sec: 'housing', headline: '수도권 집값 다시 급등', summary: '2006년 서울 강남 등 일부 지역 아파트값이 급등해 정부가 3·30, 11·15 대책으로 대출 규제를 강화했다.', src: W(2006, '대한민국의_부동산_정책'), links: [
    k(and(tenant, capital, partner), '결혼하고도 집 장만 계획이 자꾸 멀어졌다.', { issues: { housing: 5 } }, '집값 급등'),
    k(and(tenant, capital, adult), '지금이라도 사야 하나 밤마다 시세를 찾아봤다.', { issues: { housing: 4, fairness: 2 } }, '추격 매수 압박'),
    k(mort, '대출 한도가 줄어 갈아타기를 미뤘다.', { issues: { housing: 2 } }, '대출 규제'),
    k(and(owner, capital), '집값 오른 얘기가 오히려 조심스러웠다.', { stats: { wealth: 1 } }, '자산 상승'),
    g('버블세븐이라는 말이 뉴스에 나왔다.', { issues: { housing: 2 } }, '집값 급등'),
  ] },
  { id: 'ng.2006.pyeongtaek', years: [2006, 2006], sec: 'society', headline: '평택 미군기지 이전 갈등', summary: '2006년 평택 대추리 일대 미군기지 이전 부지를 두고 주민·시민단체와 정부가 충돌했다.', src: W(2006, '평택_대추리'), links: [
    k(at('gyeonggi'), '가까운 동네 일이라 뉴스에 더 귀를 기울였다.', { issues: { conflict: 3, region: 2 } }, '기지 이전 갈등'),
    k(mil, '현장 투입 얘기에 부대가 술렁였다.', { issues: { conflict: 3 } }, '기지 이전'),
    g('강제 철거 현장 화면이 방송됐다.', { issues: { conflict: 2 } }, '평택 기지 갈등'),
  ] },
  { id: 'ng.2006.film', years: [2006, 2006], sec: 'culture', headline: '천만 관객 한국 영화 잇따라', summary: '2000년대 중반 한국 영화가 잇따라 관객 1천만 명을 넘기며 극장가를 이끌었다.', src: W(2006, '천만_관객_영화'), links: [
    k(or2(col, young), '주말마다 친구들과 극장에 갔다.', { stats: { leisure: 1, relations: 1 } }, '한국 영화 붐'),
    k(and(parent, adult), '아이들과 함께 영화관 나들이를 했다.', { stats: { relations: 1 } }, '가족 영화'),
    g('천만 관객이라는 말이 흔해졌다.', { stats: { leisure: 1 } }, '한국 영화'),
  ] },
  { id: 'ng.2006.lowbirth', years: [2006, 2006], sec: 'society', headline: '첫 저출산 기본계획 수립', summary: '2006년 정부가 첫 저출산·고령사회 기본계획을 세워 보육료 지원 등을 넓히기로 했다.', src: W(2006, '저출산고령사회위원회'), links: [
    k(hasKid(0, 5), '어린이집 보육료 지원 안내문을 받았다.', { issues: { care: -3 } }, '보육료 지원'),
    k(elderP, '부모님 노후 돌봄 얘기도 함께 나왔다.', { issues: { care: 2 } }, '고령화'),
    g('저출산 대책 발표 뉴스를 봤다.', { issues: { care: -2 } }, '저출산 계획'),
  ] },
  { id: 'ng.2006.un', years: [2006, 2006], sec: 'world', headline: '한국인 유엔 사무총장 선출', summary: '2006년 10월 한국 외교관 출신이 유엔 사무총장으로 선출됐다.', src: W(2006, '유엔_사무총장'), links: [
    k(col, '국제기구 진로 얘기가 학과에서 나왔다.', { issues: { edu: 2 } }, '국제기구 진로'),
    k(teen, '사회 시간에 유엔 얘기를 배웠다.', { stats: { intellect: 1 } }, '유엔 수업'),
    g('국제 무대 소식이 뉴스에 나왔다.', { stats: { happiness: 1 } }, '유엔 사무총장'),
  ] },

  // ── 2007 ──
  { id: 'ng.2007.fta', years: [2007, 2007], sec: 'economy', headline: '한미 FTA 협상 타결', summary: '2007년 4월 한미 자유무역협정 협상이 타결됐다. 발효는 2012년에 이뤄졌다.', src: W(2007, '한미_자유무역협정'), links: [
    k(rural, '고향 과수원과 축사 걱정이 깊어졌다.', { issues: { region: 4 } }, 'FTA 농업 피해'),
    k(big, '수출 물량이 늘 거라는 기대가 돌았다.', { issues: { job: -2 } }, '수출 기대'),
    k(smallW, '수입 경쟁품이 늘까 회사가 긴장했다.', { issues: { job: 2 } }, '수입 경쟁'),
    g('FTA 타결 소식에 찬반 의견이 엇갈렸다.', { issues: { conflict: 2 } }, '한미 FTA'),
  ] },
  { id: 'ng.2007.taean', years: [2007, 2008], sec: 'society', headline: '태안 앞바다 기름 유출', summary: '2007년 12월 태안 앞바다에서 유조선이 충돌해 기름이 유출됐다. 자원봉사자 100만 명 넘게 방제에 나섰다.', src: W(2007, '삼성-허베이_스피리트호_원유_유출_사고'), links: [
    k(at('chungnam'), '바닷가 생계가 끊긴 이웃들 소식을 들었다.', { issues: { region: 4, living: 3 } }, '기름 유출 피해'),
    k(or2(col, young), '방제 자원봉사 버스에 몸을 실었다.', { stats: { relations: 1 } }, '자원봉사'),
    k(work, '회사에서 단체 방제 봉사를 다녀왔다.', { stats: { relations: 1 } }, '자원봉사'),
    g('기름을 닦아 내는 사람들 사진이 실렸다.', { issues: { conflict: -2 } }, '태안 방제'),
  ] },
  { id: 'ng.2007.summit', years: [2007, 2007], sec: 'politics', headline: '두 번째 남북정상회담', summary: '2007년 10월 평양에서 두 번째 남북정상회담이 열려 10·4 선언이 나왔다.', src: W(2007, '2007년_남북정상회담'), links: [
    k(mil, '군사분계선 소식에 관심이 갔다.', { issues: { conflict: -2 } }, '남북정상회담'),
    k(smallW, '경협 확대 얘기에 회사가 귀를 기울였다.', { issues: { job: -2 } }, '남북 경협'),
    g('정상이 걸어서 군사분계선을 넘는 장면이 방송됐다.', { issues: { conflict: -2 } }, '남북정상회담'),
  ] },
  { id: 'ng.2007.election', years: [2007, 2007], sec: 'politics', headline: '17대 대선, 경제 공약 경쟁', summary: '2007년 12월 대통령 선거가 경제 살리기 공약 경쟁 속에 치러졌다.', src: W(2007, '제17대_대한민국_대통령_선거'), links: [
    k(and(adult, tenant), '집값과 일자리 공약을 꼼꼼히 비교했다.', { issues: { housing: 2 } }, '대선 공약'),
    k(adult, '투표를 마치고 개표 방송을 봤다.', { issues: { conflict: -2 } }, '대선 투표'),
    g('선거 운동 차량이 골목을 돌았다.', { issues: { conflict: 2 } }, '17대 대선'),
  ] },
  { id: 'ng.2007.afghan', years: [2007, 2007], sec: 'world', headline: '아프가니스탄 한국인 피랍', summary: '2007년 7월 아프가니스탄에서 한국인 봉사단이 무장세력에 납치돼 40여 일 만에 풀려났다.', src: W(2007, '아프가니스탄_한국인_납치_사건'), links: [
    k(col, '해외 봉사 계획을 두고 집에서 걱정을 들었다.', { issues: { conflict: 2 } }, '해외 안전'),
    k(adult, '해외 위험 지역 여행 논쟁이 일었다.', { issues: { conflict: 2 } }, '피랍 논쟁'),
    g('협상 소식에 한 달 넘게 뉴스를 지켜봤다.', { issues: { conflict: 2 } }, '아프간 피랍'),
  ] },
  { id: 'ng.2007.grade', years: [2007, 2008], sec: 'edu', headline: '수능 등급제 첫 시행', summary: '2008학년도 수능에서 점수 없이 9등급만 알려 주는 등급제가 처음 시행됐다가 한 해 만에 바뀌었다.', src: W(2007, '대학수학능력시험'), links: [
    k(exam, '한 문제 차이로 등급이 갈려 지원 전략이 꼬였다.', { issues: { edu: 4 }, stats: { happiness: -1 } }, '수능 등급제'),
    k(stg('high', 'middle'), '바뀌는 입시 제도에 선배들 얘기를 귀담아들었다.', { issues: { edu: 2 } }, '입시 제도 변화'),
    k(hasKid(16, 19), '아이 입시 설명회를 쫓아다녔다.', { issues: { edu: 3 } }, '입시 혼란'),
    g('등급제 혼란 뉴스가 이어졌다.', { issues: { edu: 2 } }, '수능 등급제'),
  ] },
  { id: 'ng.2007.pension', years: [2007, 2007], sec: 'labor', headline: '국민연금 받는 돈 줄인다', summary: '2007년 국민연금법이 개정돼 소득대체율을 60%에서 2028년 40%까지 낮추기로 했다.', src: W(2007, '국민연금'), links: [
    k(and(work, L => L.age >= 30 && L.age <= 55), '노후 계산을 다시 해 봤다.', { issues: { care: 2, fairness: 2 } }, '연금 축소'),
    k(and(work, young), '우리 때는 받을 수 있냐는 말이 나왔다.', { issues: { fairness: 3 } }, '세대 형평'),
    k(elderP, '부모님 노후는 연금만으로는 어렵겠다고 생각했다.', { issues: { care: 2 } }, '부모 부양'),
    g('연금 개혁 뉴스가 나왔다.', { issues: { care: 2 } }, '국민연금 개혁'),
  ] },
  { id: 'ng.2007.fund', years: [2007, 2007], sec: 'economy', headline: '주가 2000 돌파, 펀드 열풍', summary: '2007년 7월 종합주가지수가 처음 2000을 넘으며 적립식·해외 펀드 가입이 크게 늘었다.', src: W(2007, '코스피_지수'), links: [
    k(and(emp, saver), '월급에서 떼어 적립식 펀드에 가입했다.', { issues: { living: -2 } }, '펀드 가입'),
    k(and(emp, young), '동료들 수익률 얘기에 조급해졌다.', { issues: { fairness: 2 } }, '투자 열풍'),
    k(self, '은행 창구마다 펀드 권유가 이어졌다.', { issues: { living: 2 } }, '펀드 열풍'),
    g('주가 2000 시대 기사가 나왔다.', { stats: { happiness: 1 } }, '주가 상승'),
  ] },
  { id: 'ng.2007.fakeedu', years: [2007, 2007], sec: 'society', headline: '학력 위조 파문 잇따라', summary: '2007년 문화·종교계 유명 인사들의 학력 위조가 잇따라 드러나 학력 중시 문화 논쟁이 일었다.', src: W(2007, '학력_위조'), links: [
    k(and(seek, L => !['4yr', 'grad'].includes(L.edu?.level)), '이력서 학력란이 유난히 크게 보였다.', { issues: { fairness: 3 } }, '학력 차별'),
    k(col, '졸업장이 전부냐는 토론이 수업에 나왔다.', { issues: { fairness: 2 } }, '학력 중시 문화'),
    g('학력 검증 뉴스가 이어졌다.', { issues: { fairness: 2 } }, '학력 위조'),
  ] },
  { id: 'ng.2007.lawschool', years: [2007, 2008], sec: 'edu', headline: '법학전문대학원 도입 확정', summary: '2007년 7월 로스쿨 법이 국회를 통과해 2009년부터 법학전문대학원이 문을 열게 됐다.', src: W(2007, '법학전문대학원'), links: [
    k(col, '진로 선택지에 로스쿨이 새로 생겼다.', { issues: { edu: 2 } }, '로스쿨 도입'),
    k(seek, '등록금이 비싸다는 말에 일찌감치 포기했다.', { issues: { fairness: 3 } }, '교육비 장벽'),
    g('사법 시험 폐지 논쟁이 이어졌다.', { issues: { fairness: 2 } }, '로스쿨'),
  ] },

  // ── 2008 ──
  { id: 'ng.2008.namdaemun', years: [2008, 2008], sec: 'society', headline: '숭례문 화재', summary: '2008년 2월 국보 숭례문이 방화로 불타 무너졌다.', src: W(2008, '숭례문_방화_사건'), links: [
    k(at('seoul'), '늘 지나던 길목이 텅 비어 보였다.', { issues: { conflict: 2 } }, '숭례문 화재'),
    k(teen, '역사 시간에 문화재 보호 얘기를 들었다.', { stats: { intellect: 1 } }, '문화재 교육'),
    g('불타는 장면에 다들 말을 잃었다.', { issues: { conflict: 2 } }, '숭례문 화재'),
  ] },
  { id: 'ng.2008.beef', years: [2008, 2008], sec: 'society', headline: '쇠고기 수입 반대 촛불', summary: '2008년 5~6월 미국산 쇠고기 수입 재개 협상에 반대하는 촛불집회가 도심에서 이어졌다.', src: W(2008, '2008년_대한민국의_미국산_쇠고기_수입_반대_시위'), links: [
    k(or2(col, teen), '친구들과 촛불집회에 나갔다.', { issues: { conflict: 3 } }, '촛불집회'),
    k(and(self, L => L.job?.code?.startsWith?.('44') ?? false), '식당 원산지 표시판을 새로 걸었다.', { issues: { living: 2 } }, '원산지 표시'),
    k(and(parent, adult), '장 볼 때 원산지 표시를 꼼꼼히 봤다.', { issues: { living: 2 } }, '먹거리 불안'),
    g('광장 촛불 사진이 연일 실렸다.', { issues: { conflict: 3 } }, '쇠고기 촛불'),
  ] },
  { id: 'ng.2008.beijing', years: [2008, 2008], sec: 'sports', headline: '베이징 올림픽', summary: '2008년 베이징 올림픽에서 한국은 수영·역도·야구 등에서 금메달을 땄다.', src: W(2008, '2008년_하계_올림픽'), links: [
    k(teen, '야구 결승을 보며 반 친구들과 소리를 질렀다.', { stats: { happiness: 1, relations: 1 } }, '올림픽 응원'),
    k(work, '점심 식당이 응원석이 됐다.', { stats: { relations: 1 } }, '올림픽 응원'),
    g('금메달 소식이 잇따랐다.', { stats: { happiness: 1 } }, '베이징 올림픽'),
  ] },
  { id: 'ng.2008.oil', years: [2008, 2008], sec: 'economy', headline: '기름값 리터당 2천 원 육박', summary: '2008년 여름 국제 유가가 배럴당 140달러를 넘어 휘발유값이 리터당 2천 원 가까이 올랐다.', src: W(2008, '2000년대_유가_급등'), links: [
    k(self, '배달과 운송비가 늘어 남는 게 없었다.', { issues: { living: 4 } }, '유가 급등'),
    k(emp, '차를 두고 대중교통으로 출근했다.', { issues: { living: 3 }, stats: { leisure: -1 } }, '유가 급등'),
    k(poor, '난방비 걱정이 벌써부터 앞섰다.', { issues: { living: 4 } }, '에너지 비용'),
    g('주유소 가격판 숫자가 뉴스에 나왔다.', { issues: { living: 3 } }, '고유가'),
  ] },
  { id: 'ng.2008.basicpension', years: [2008, 2008], sec: 'health', headline: '기초노령연금 시행', summary: '2008년 1월 소득이 적은 노인에게 매달 일정액을 주는 기초노령연금이 시작됐다.', src: W(2008, '기초노령연금'), links: [
    k(elderP, '부모님이 노령연금을 받게 됐다.', { issues: { care: -2 } }, '기초노령연금'),
    k(and(L => L.age >= 65), '동사무소에서 연금 신청서를 받았다.', { issues: { care: -3 } }, '노령연금 신청'),
    g('노인 연금 시행 소식이 나왔다.', { issues: { care: -2 } }, '기초노령연금'),
  ] },
  { id: 'ng.2008.kiko', years: [2008, 2009], sec: 'economy', headline: '환율 급등, 수출 중기 손실', summary: '2008년 원·달러 환율이 1,500원 가까이 치솟아 환헤지 상품에 가입한 수출 중소기업이 큰 손실을 봤다.', src: W(2008, '키코_사태'), links: [
    k(smallW, '거래처 손실 소식에 상여금이 끊겼다.', { issues: { job: 4 }, stats: { wealth: -1 } }, '환헤지 손실'),
    k(col, '어학연수 계획을 접었다.', { issues: { edu: 3 } }, '환율 급등'),
    k(hasKid(18, 30), '유학 간 아이 송금액이 크게 늘었다.', { issues: { living: 4 } }, '송금 부담'),
    g('환율 전광판이 다시 뉴스에 나왔다.', { issues: { living: 2 } }, '환율 급등'),
  ] },
  { id: 'ng.2008.kumgangstop', years: [2008, 2008], sec: 'politics', headline: '금강산 관광 중단', summary: '2008년 7월 금강산 관광객이 북한군 총격으로 숨지는 사건이 일어나 관광이 중단됐다.', src: W(2008, '금강산_관광객_피격_사건'), links: [
    k(at('gangwon'), '관광객이 끊겨 동해안 상권이 얼어붙었다.', { issues: { region: 3 } }, '관광 중단'),
    k(elderP, '부모님의 금강산 여행 계획이 무산됐다.', { stats: { relations: -1 } }, '관광 중단'),
    g('남북 관계가 다시 얼어붙었다는 뉴스가 나왔다.', { issues: { conflict: 3 } }, '관광객 피격'),
  ] },
  { id: 'ng.2008.jongbu', years: [2008, 2008], sec: 'housing', headline: '종부세 세대 합산 위헌', summary: '2008년 11월 헌법재판소가 종합부동산세의 세대별 합산 과세를 위헌으로 판단했다.', src: W(2008, '종합부동산세'), links: [
    k(and(owner, capital), '돌려받을 세금이 있는지 따져 봤다.', { issues: { living: -2 } }, '종부세 환급'),
    k(and(tenant, adult), '집 가진 사람 세금 얘기에 씁쓸했다.', { issues: { fairness: 3 } }, '자산 격차'),
    g('세금 정책 논쟁이 이어졌다.', { issues: { conflict: 2 } }, '종부세 위헌'),
  ] },

  // ── 2009 ──
  { id: 'ng.2009.flu', years: [2009, 2009], sec: 'health', headline: '신종플루 대유행', summary: '2009년 신종 인플루엔자가 번져 학교 휴업과 행사 취소가 잇따랐고 백신 접종이 시작됐다.', src: W(2009, '2009년_인플루엔자_범유행'), links: [
    k(or2(kid, teen), '교실 앞에서 날마다 체온을 쟀다.', { issues: { medical: 2 } }, '학교 방역'),
    k(hasKid(3, 18), '아이 열이 날 때마다 가슴이 철렁했다.', { issues: { care: 3, medical: 2 } }, '감염 불안'),
    k(L => (L.stats?.health ?? 70) < 50, '예방 접종 순서를 손꼽아 기다렸다.', { issues: { medical: 3 } }, '고위험군 접종'),
    k(self, '손님이 줄어 매출이 떨어졌다.', { issues: { living: 2 } }, '감염병 매출 감소'),
    g('손 소독제가 동났다는 뉴스가 나왔다.', { issues: { medical: 2 } }, '신종플루'),
  ] },
  { id: 'ng.2009.yongsan', years: [2009, 2009], sec: 'disaster', sensitive: 'disaster', headline: '용산 재개발 철거 현장 참사', summary: '2009년 1월 서울 용산 재개발 지역 건물 옥상 농성 진압 과정에서 화재가 나 희생자가 생겼다.', src: W(2009, '용산_참사'), links: [
    k(and(tenant, at('seoul')), '재개발 얘기가 남 일 같지 않았다.', { issues: { housing: 2, conflict: 2 } }, '재개발 갈등'),
    k(self, '세입 상인들 보상 문제에 마음이 쓰였다.', { issues: { fairness: 3 } }, '상가 세입자'),
    g('재개발 보상 논쟁이 이어졌다.', { issues: { conflict: 3 } }, '용산 참사'),
  ] },
  { id: 'ng.2009.hope', years: [2009, 2009], sec: 'labor', headline: '희망근로 사업 시행', summary: '2009년 정부가 경제 위기 대책으로 저소득층에게 공공 일자리를 주는 희망근로 사업을 벌였다.', src: W(2009), links: [
    k(and(seek, L => L.age >= 40), '희망근로 일자리에 신청서를 냈다.', { issues: { job: -2, living: -2 } }, '공공 일자리'),
    k(and(poor, not(work)), '동네 주민센터에서 희망근로 안내를 받았다.', { issues: { living: -2 } }, '희망근로'),
    k(pubW, '희망근로 참가자 관리 업무가 늘었다.', { stats: { leisure: -1 } }, '공공 일자리 업무'),
    g('길 정비하는 희망근로 참가자들이 보였다.', { issues: { job: 2 } }, '희망근로'),
  ] },
  { id: 'ng.2009.intern', years: [2009, 2009], sec: 'labor', headline: '청년인턴 확대', summary: '2009년 정부가 공공기관과 중소기업에 청년인턴 자리를 대거 늘렸다.', src: W(2009), links: [
    k(and(seek, young), '공공기관 청년인턴에 지원해 몇 달 일을 했다.', { issues: { job: -2 } }, '청년인턴'),
    k(col, '인턴 경력 한 줄을 채우려 방학을 썼다.', { issues: { job: 2 } }, '스펙 경쟁'),
    k(and(nonreg, young), '인턴이 끝나면 다시 막막하다는 말이 나왔다.', { issues: { job: 3 } }, '단기 일자리'),
    g('단기 일자리 논쟁이 이어졌다.', { issues: { job: 2 } }, '청년인턴'),
  ] },
  { id: 'ng.2009.bogeum', years: [2009, 2009], sec: 'housing', headline: '보금자리주택 첫 공급', summary: '2009년 수도권 그린벨트를 풀어 싸게 공급하는 공공 보금자리주택 사전예약이 시작됐다.', src: W(2009, '보금자리주택'), links: [
    k(and(tenant, capital, adult), '사전예약 일정을 달력에 적어 두었다.', { issues: { housing: -3 } }, '공공주택 기대'),
    k(and(tenant, not(capital), adult), '수도권 얘기라 마음만 부러웠다.', { issues: { region: 2 } }, '지역 격차'),
    k(and(owner, capital), '주변 집값에 영향이 있을까 지켜봤다.', { issues: { housing: 2 } }, '공급 확대'),
    g('반값 아파트 논쟁이 이어졌다.', { issues: { housing: -2 } }, '보금자리주택'),
  ] },
  { id: 'ng.2009.figure', years: [2009, 2009], sec: 'sports', headline: '피겨 세계선수권 첫 우승', summary: '2009년 3월 한국 선수가 피겨스케이팅 세계선수권에서 처음 우승했다.', src: W(2009, '피겨_스케이팅'), links: [
    k(kid, '아이스링크 강습을 받고 싶다고 졸랐다.', { stats: { leisure: 1 } }, '피겨 붐'),
    k(teen, '경기 영상을 몇 번이고 돌려 봤다.', { stats: { happiness: 1 } }, '피겨 우승'),
    g('피겨 중계 시청률이 화제가 됐다.', { stats: { happiness: 1 } }, '피겨 우승'),
  ] },
  { id: 'ng.2009.rocket', years: [2009, 2009], sec: 'tech', headline: '첫 우주발사체 발사', summary: '2009년 8월 고흥에서 첫 우주발사체가 발사됐으나 위성을 궤도에 올리지는 못했다.', src: W(2009, '나로호'), links: [
    k(teen, '과학 시간에 발사 장면을 다 같이 봤다.', { stats: { intellect: 1 } }, '우주발사체'),
    k(at('jeonnam'), '고흥 발사 소식에 지역이 들떴다.', { issues: { region: -2 } }, '발사 기지'),
    g('카운트다운 생중계를 지켜봤다.', { issues: { tech: 2 } }, '우주발사체'),
  ] },
  { id: 'ng.2009.eitc', years: [2009, 2009], sec: 'labor', headline: '근로장려금 첫 지급', summary: '2009년 9월 일하는 저소득 가구에 현금을 지급하는 근로장려금이 처음 지급됐다.', src: W(2009, '근로장려세제'), links: [
    k(and(nonreg, L => (L.money?.assets ?? 0) < 3000), '근로장려금 안내를 받아 신청서를 냈다.', { issues: { living: -3 } }, '근로장려금'),
    k(and(self, poor), '자영업자는 대상이 아니라는 말에 아쉬웠다.', { issues: { fairness: 2 } }, '제도 사각지대'),
    g('일하는 빈곤층 지원 소식이 나왔다.', { issues: { fairness: -2 } }, '근로장려세제'),
  ] },
  { id: 'ng.2009.strike', years: [2009, 2009], sec: 'labor', headline: '자동차 공장 장기 점거 파업', summary: '2009년 경기 평택의 한 자동차 회사가 대규모 정리해고를 하자 노조가 77일간 공장을 점거했다.', src: W(2009, '쌍용자동차_파업'), links: [
    k(and(reg, L => ['large', 'mid'].includes(L.job?.firmSize)), '해고 소식이 남 일 같지 않았다.', { issues: { job: 3 } }, '정리해고'),
    k(at('gyeonggi'), '가까운 동네 공장 소식에 지역 분위기가 무거웠다.', { issues: { region: 2, conflict: 2 } }, '지역 경제 위기'),
    g('강제 진압 장면이 방송됐다.', { issues: { conflict: 3 } }, '점거 파업'),
  ] },
  { id: 'ng.2009.presidents', years: [2009, 2009], sec: 'politics', headline: '전직 대통령 두 명 서거', summary: '2009년 5월과 8월 전직 대통령 두 명이 잇따라 세상을 떠나 추모 행렬이 이어졌다.', src: W(2009), links: [
    k(adult, '분향소 앞 긴 줄을 지나며 걸음을 늦췄다.', { issues: { conflict: 2 } }, '추모 정국'),
    k(teen, '사회 시간에 현대사 얘기를 들었다.', { stats: { intellect: 1 } }, '현대사 수업'),
    g('추모 행렬 소식이 이어졌다.', { issues: { conflict: 2 } }, '전직 대통령 서거'),
  ] },
];

// ── 보강 링크: 구직자·초등생·중고생·직장인·비경제활동 등 흔한 상태에서 이 뉴스가 닿는 결과(기존 상태별 링크 뒤, 일반 링크 앞에 끼운다)
const inact = L => st(L) === 'inactive';
const EXTRA = {
  'ng.1990.merger': [k(seek, '면접장에서 시국 얘기를 물을까 신문을 챙겨 읽었다.', { stats: { intellect: 1 } }, '시사 준비'), k(kid, '어른들이 저녁 뉴스를 보며 혀를 차는 걸 들었다.', { issues: { conflict: 2 } }, '정치 뉴스')],
  'ng.1990.ussr': [k(seek, '북방 교역 회사 채용 공고가 눈에 띄었다.', { issues: { job: -2 } }, '북방 교역'), k(kid, '지도책에서 소련이 어디 있는지 찾아봤다.', { stats: { intellect: 1 } }, '한소 수교')],
  'ng.1990.crimewar': [k(kid, '학교에서 낯선 사람을 따라가지 말라는 교육을 받았다.', { issues: { care: 2 } }, '범죄 예방 교육'), k(seek, '늦은 귀갓길에 순찰차를 자주 봤다.', { issues: { conflict: 2 } }, '단속 강화')],
  'ng.1990.beijing': [k(teen, '반 친구들과 메달 수를 세며 떠들었다.', { stats: { relations: 1 } }, '아시안게임'), k(seek, '공부하다 말고 중계 화면에 눈이 갔다.', { stats: { leisure: 1 } }, '아시안게임 중계')],
  'ng.1990.newtown': [k(seek, '건설 현장 일자리 공고가 늘었다.', { issues: { job: -2 } }, '신도시 건설 일자리'), k(emp, '건설 경기가 좋다는 말이 회사에 돌았다.', { issues: { job: -2 } }, '건설 경기')],
  'ng.1990.labor': [k(seek, '노사 분규 소식에 지원할 회사를 다시 골랐다.', { issues: { job: 2 } }, '노사 분규'), k(teen, '집안 어른 회사 협상 얘기가 저녁 식탁에 올랐다.', { issues: { conflict: 2 } }, '임금 협상')],
  'ng.1991.local': [k(seek, '선거 사무소 단기 일을 구해 몇 주 일했다.', { issues: { job: -2 } }, '선거 일자리'), k(kid, '학교 담장에 붙은 선거 벽보를 구경했다.', { stats: { intellect: 1 } }, '지방선거')],
  'ng.1991.phenol': [k(kid, '학교에서 수돗물 대신 보리차를 마셨다.', { issues: { living: 2 } }, '식수 불안')],
  'ng.1991.un': [k(seek, '외교 관련 시험 공부를 하는 친구가 늘었다.', { issues: { edu: 2 } }, '국제 진로'), k(kid, '선생님이 유엔 깃발 그림을 보여 주었다.', { stats: { intellect: 1 } }, '유엔 가입')],
  'ng.1991.pingpong': [k(teen, '친구들과 탁구장에 몰려갔다.', { stats: { health: 1 } }, '탁구 붐'), k(seek, '중계를 보며 잠시 시름을 잊었다.', { stats: { happiness: 1 } }, '단일팀 우승')],
  'ng.1991.gulf': [k(seek, '해외 건설 현장 채용 계획이 미뤄졌다.', { issues: { job: 2 } }, '중동 사업 차질'), k(kid, '전쟁 뉴스를 보다 무서워 이불을 뒤집어썼다.', { issues: { conflict: 2 } }, '전쟁 뉴스')],
  'ng.1991.bundang': [k(seek, '신도시 상가 일자리 공고를 찾아봤다.', { issues: { job: -2 } }, '신도시 상권'), k(kid, '새 아파트로 전학 간 친구가 생겼다.', { stats: { relations: -1 } }, '신도시 이주')],
  'ng.1991.suseo': [k(seek, '특혜 뉴스에 공정한 채용이 있나 싶었다.', { issues: { fairness: 2 } }, '특혜 의혹'), k(teen, '사회 시간에 공직 비리 기사로 토론했다.', { stats: { intellect: 1 } }, '시사 토론')],
  'ng.1991.accord': [k(teen, '통일이 가까워졌냐고 선생님께 물었다.', { stats: { intellect: 1 } }, '남북 합의'), k(and(seek, not(female)), '입대 전 남북 관계 소식이 반가웠다.', { issues: { conflict: -2 } }, '긴장 완화')],
  'ng.1992.china': [k(seek, '중국어 할 줄 아는 사람을 찾는 공고가 늘었다.', { issues: { job: -2 } }, '중국 교역'), k(kid, '중국 사람들 얘기가 TV에 자주 나왔다.', { stats: { intellect: 1 } }, '한중 수교')],
  'ng.1992.marathon': [k(teen, '체육 시간 오래달리기에 괜히 힘이 났다.', { stats: { health: 1 } }, '마라톤 금메달'), k(seek, '버티면 된다는 말이 남 얘기 같지 않았다.', { stats: { happiness: 1 } }, '마라톤 금메달')],
  'ng.1992.satellite': [k(kid, '과학 상자로 인공위성 모형을 만들었다.', { stats: { intellect: 1 } }, '첫 인공위성'), k(seek, '이공계 연구소 채용 소식에 관심이 갔다.', { issues: { tech: -2 } }, '과학기술 투자')],
  'ng.1992.dance': [k(kid, '형 누나들 따라 노래를 흥얼거렸다.', { stats: { happiness: 1 } }, '가요 열풍'), k(seek, '음반 가게 아르바이트 자리가 늘었다.', { issues: { job: -2 } }, '음반 시장 성장')],
  'ng.1992.election': [k(kid, '학교 반장 선거를 대선처럼 치렀다.', { stats: { relations: 1 } }, '선거 열기'), k(seek, '취업 공약을 꼼꼼히 읽었다.', { issues: { job: 2 } }, '대선 공약')],
  'ng.1992.rapture': [k(kid, '친구가 세상 끝나는 날 얘기를 해 겁이 났다.', { issues: { conflict: 2 } }, '종말론 소문')],
  'ng.1992.bankrupt': [k(teen, '친구네 아버지 공장이 문을 닫았다는 얘기를 들었다.', { issues: { job: 2 } }, '중소기업 부도'), k(inact, '식구 회사 얘기에 살림을 더 줄였다.', { issues: { living: 2 } }, '가계 긴축')],
  'ng.1992.housedown': [k(seek, '집값 안정 소식에 독립을 꿈꿔 봤다.', { issues: { housing: -2 } }, '집값 안정')],
  'ng.1993.assets': [k(seek, '공무원 시험 공부에 청렴이 화두가 됐다.', { issues: { fairness: -2 } }, '공직 사정'), k(teen, '선생님이 깨끗한 정치를 주제로 글짓기를 냈다.', { stats: { intellect: 1 } }, '사정 바람')],
  'ng.1993.expo': [k(seek, '엑스포 안내 요원 단기 일자리에 지원했다.', { issues: { job: -2 } }, '엑스포 일자리'), k(emp, '회사 단체 관람으로 엑스포에 다녀왔다.', { stats: { leisure: 1 } }, '단체 관람')],
  'ng.1993.ur': [k(seek, '농업 관련 채용이 줄 거라는 말을 들었다.', { issues: { job: 2 } }, '농업 개방'), k(kid, '학교에서 우리 쌀 지키기 표어를 그렸다.', { issues: { region: 2 } }, '쌀 개방')],
  'ng.1993.npt': [k(and(seek, not(female)), '군 입대 시기를 두고 집에서 걱정이 오갔다.', { issues: { conflict: 2 } }, '안보 불안'), k(kid, '민방위 훈련 사이렌에 놀랐다.', { issues: { conflict: 2 } }, '안보 불안')],
  'ng.1993.pctong': [k(seek, 'PC통신 구인 게시판을 뒤져 봤다.', { issues: { tech: -2 } }, 'PC통신 구인'), k(kid, '형 누나가 컴퓨터 앞에서 밤을 새우는 걸 봤다.', { issues: { tech: 2 } }, 'PC통신')],
  'ng.1993.army': [k(and(seek, not(female)), '입대를 앞두고 군대가 달라진다는 말을 들었다.', { issues: { conflict: -2 } }, '군 개혁'), k(teen, '사회 시간에 문민정부라는 말을 배웠다.', { stats: { intellect: 1 } }, '문민정부')],
  'ng.1993.mart': [k(seek, '할인점 계산원 모집 공고가 붙었다.', { issues: { job: -2 } }, '유통 일자리'), k(kid, '할인점 시식 코너를 돌며 신이 났다.', { stats: { happiness: 1 } }, '할인점 나들이')],
  'ng.1994.heat': [k(kid, '학교가 더위로 단축 수업을 했다.', { stats: { leisure: 1 } }, '폭염 단축 수업'), k(teen, '선풍기 하나에 매달려 공부했다.', { stats: { health: -1 } }, '폭염'), k(seek, '더위에 구직 발품 팔기가 힘들었다.', { stats: { health: -1 } }, '폭염')],
  'ng.1994.nkleader': [k(and(seek, not(female)), '입대 날짜를 앞두고 뉴스에 귀를 기울였다.', { issues: { conflict: 2 } }, '안보 불안'), k(kid, '어른들이 전쟁 나느냐고 묻는 걸 들었다.', { issues: { conflict: 2 } }, '안보 불안')],
  'ng.1994.stockpile': [k(kid, '라면이 쌓인 찬장을 보고 신기해했다.', { stats: { happiness: 1 } }, '사재기'), k(seek, '생필품값이 오를까 지갑을 닫았다.', { issues: { living: 2 } }, '물가 불안')],
  'ng.1994.worldcup': [k(kid, '경기 다음 날 반 친구들과 축구를 했다.', { stats: { health: 1 } }, '월드컵 붐'), k(seek, '새벽 경기를 보고 낮에 늦잠을 잤다.', { stats: { leisure: 1 } }, '월드컵 중계')],
  'ng.1994.infohighway': [k(seek, '컴퓨터 자격증 학원에 등록했다.', { issues: { tech: -2, job: -2 } }, '정보화 자격'), k(kid, '학교 컴퓨터실에서 타자 연습을 했다.', { issues: { tech: -2 } }, '컴퓨터 교육')],
  'ng.1994.pager': [k(seek, '면접 연락을 놓칠까 삐삐를 장만했다.', { issues: { tech: -2 } }, '삐삐 연락'), k(kid, '형 누나 허리춤의 삐삐가 부러웠다.', { issues: { fairness: 2 } }, '삐삐 유행')],
  'ng.1994.seoul600': [k(teen, '타임캡슐에 무엇이 들어갔는지 찾아봤다.', { stats: { intellect: 1 } }, '서울 600년')],
  'ng.1995.localgov': [k(seek, '선거 운동원 단기 일을 했다.', { issues: { job: -2 } }, '선거 일자리'), k(kid, '선거 벽보 사진을 보며 후보 얼굴을 외웠다.', { stats: { intellect: 1 } }, '지방선거')],
  'ng.1995.trash': [k(teen, '집안 분리수거가 내 몫이 됐다.', { stats: { relations: 1 } }, '분리수거'), k(seek, '자취방 쓰레기 봉투값도 따로 챙겼다.', { issues: { living: 2 } }, '종량제 비용')],
  'ng.1995.empins': [k(seek, '실업급여라는 게 생긴다는 말을 들었다.', { issues: { job: -2 } }, '고용보험'), k(teen, '집안 어른 월급 명세서에 새 항목이 생겼다고 들었다.', { issues: { job: -2 } }, '고용보험')],
  'ng.1995.expres': [k(seek, '면접 대비로 시사 상식을 정리했다.', { stats: { intellect: 1 } }, '시사 준비'), k(teen, '선생님이 역사 바로 세우기를 설명했다.', { stats: { intellect: 1 } }, '과거사 청산'), k(kid, '어른들이 뉴스를 보며 오래 얘기했다.', { issues: { conflict: 2 } }, '전직 대통령 재판')],
  'ng.1995.cable': [k(teen, '음악 채널을 틀어 놓고 공부했다.', { stats: { leisure: 1 } }, '케이블 음악 채널'), k(seek, '케이블 방송사 채용 공고를 봤다.', { issues: { job: -2 } }, '방송 일자리')],
  'ng.1995.wto': [k(seek, '무역 회사 채용이 늘 거라는 기대를 걸었다.', { issues: { job: -2 } }, '무역 확대'), k(teen, '세계화라는 말로 영어 공부 압박이 커졌다.', { issues: { edu: 2 } }, '세계화 교육')],
  'ng.1996.oecd': [k(seek, '경기가 좋다는데 내 차례는 언제일까 싶었다.', { issues: { job: 2 } }, '체감 격차'), k(teen, '선진국이 됐다는 말에 괜히 뿌듯했다.', { stats: { happiness: 1 } }, 'OECD 가입')],
  'ng.1996.gangneung': [k(and(seek, not(female)), '입대를 앞두고 작전 소식이 남 일 같지 않았다.', { issues: { conflict: 2 } }, '안보 불안'), k(teen, '산에 가지 말라는 안내를 들었다.', { issues: { conflict: 2 } }, '작전 지역')],
  'ng.1996.laborlaw': [k(seek, '정리해고가 쉬워진다는 말에 취업이 더 두려워졌다.', { issues: { job: 3 } }, '노동법 개정'), k(teen, '집회 뉴스를 보며 어른들 회사 걱정을 들었다.', { issues: { conflict: 2 } }, '총파업')],
  'ng.1996.biff': [k(seek, '영화제 자원봉사에 지원했다.', { stats: { relations: 1 } }, '영화제 자원봉사')],
  'ng.1996.campus': [k(seek, '시위 경력은 취업에 불리하다는 말을 들었다.', { issues: { fairness: 2 } }, '학생운동 낙인'), k(teen, '대학 가면 시위하지 말라는 당부를 들었다.', { issues: { conflict: 2 } }, '대학가 시위')],
  'ng.1996.retail': [k(seek, '외국계 매장 직원 모집에 지원했다.', { issues: { job: -2 } }, '유통 일자리'), k(teen, '새로 생긴 큰 매장 구경을 갔다.', { stats: { leisure: 1 } }, '대형 매장')],
  'ng.1996.atlanta': [k(kid, '양궁 흉내를 내며 놀았다.', { stats: { happiness: 1 } }, '올림픽'), k(seek, '새벽 중계를 보며 공부를 미뤘다.', { stats: { leisure: 1 } }, '올림픽 중계')],
  'ng.1997.groupfail': [k(teen, '친구 아버지 회사가 위태롭다는 얘기를 들었다.', { issues: { job: 2 } }, '대기업 부도'), k(kid, '어른들 표정이 어두워진 걸 느꼈다.', { issues: { living: 2 } }, '경기 불안')],
  'ng.1997.carfirm': [k(seek, '자동차 협력업체 채용이 전부 멈췄다.', { issues: { job: 4 } }, '채용 중단'), k(teen, '부모님이 차 바꾸는 계획을 접었다.', { issues: { living: 2 } }, '소비 위축')],
  'ng.1997.pcs': [k(seek, '면접 연락을 받으려 휴대폰을 장만했다.', { issues: { tech: -2, living: 2 } }, '휴대폰 보급'), k(kid, '어른들이 새 휴대폰 자랑하는 걸 봤다.', { issues: { tech: 2 } }, '휴대폰 유행')],
  'ng.1997.election': [k(seek, '취업 공약을 꼼꼼히 읽고 투표했다.', { issues: { job: 2 } }, '대선 공약'), k(kid, '학교에서 선거 놀이가 유행했다.', { stats: { relations: 1 } }, '선거 열기')],
  'ng.1997.hongkong': [k(seek, '홍콩 지사 채용 공고가 눈에 띄었다.', { issues: { job: -2 } }, '해외 일자리'), k(kid, '불꽃놀이 중계를 늦게까지 봤다.', { stats: { leisure: 1 } }, '반환식')],
  'ng.1997.internet': [k(seek, '인터넷 구인 사이트를 처음 써 봤다.', { issues: { tech: -2 } }, '인터넷 구직'), k(kid, '컴퓨터 학원에서 인터넷을 배웠다.', { issues: { tech: -2 } }, '정보 교육')],
  'ng.1997.fx': [k(seek, '외국계 회사 채용까지 끊겼다.', { issues: { job: 4 } }, '외환 위기'), k(teen, '집안 형편이 어려워져 용돈이 깎였다.', { issues: { living: 2 } }, '가계 긴축'), k(emp, '해외 출장과 연수가 줄줄이 취소됐다.', { issues: { job: 3 } }, '긴축 경영')],
  'ng.1998.layoff': [k(seek, '경력자도 쏟아져 나와 경쟁이 더 치열해졌다.', { issues: { job: 5 } }, '해고 급증'), k(teen, '친구 아버지가 회사를 나왔다는 말을 들었다.', { issues: { job: 3 } }, '정리해고'), k(kid, '집안 어른들이 회사 얘기를 쉬쉬했다.', { issues: { living: 2 } }, '가계 불안')],
  'ng.1998.unemp': [k(emp, '살아남았다는 안도와 미안함이 섞였다.', { issues: { job: 3 } }, '생존자 불안'), k(kid, '친구네가 이사를 갔다.', { stats: { relations: -1 } }, '실직 가정'), k(inact, '부업거리를 알아보러 다녔다.', { issues: { living: 3 } }, '가계 보충')],
  'ng.1998.banks': [k(seek, '은행 채용은 기약이 없다는 말을 들었다.', { issues: { job: 3 } }, '금융권 감원'), k(emp, '월급 통장 은행 간판이 바뀌었다.', { issues: { living: 2 } }, '은행 통폐합'), k(teen, '어른들이 은행 걱정을 하는 걸 들었다.', { issues: { living: 2 } }, '금융 불안')],
  'ng.1998.homeless': [k(seek, '오래 쉬면 저렇게 될까 겁이 났다.', { issues: { job: 3 }, stats: { happiness: -1 } }, '실직 불안'), k(teen, '봉사 활동으로 무료 급식소에 갔다.', { stats: { relations: 1 } }, '급식 봉사')],
  'ng.1998.kumgang': [k(seek, '금강산 관광 안내원 모집 소식을 봤다.', { issues: { job: -2 } }, '관광 일자리'), k(teen, '북한 땅을 밟는다는 얘기가 신기했다.', { issues: { conflict: -2 } }, '금강산 관광')],
  'ng.1998.golf': [k(teen, '어려운 때도 해낼 수 있다는 말을 들었다.', { stats: { happiness: 1 } }, '골프 우승'), k(emp, '회사 사람들과 우승 장면 얘기로 웃었다.', { stats: { relations: 1 } }, '골프 우승')],
  'ng.1998.japan': [k(seek, '일본어 공부를 다시 시작했다.', { issues: { edu: 2 } }, '일본 문화 개방')],
  'ng.1998.broadband': [k(kid, '집에서 인터넷 게임을 처음 해 봤다.', { stats: { leisure: 1 } }, '초고속망'), k(emp, '회사 인터넷 속도가 빨라졌다.', { issues: { tech: 2 } }, '업무 정보화')],
  'ng.1999.venture': [k(seek, '벤처 회사 면접을 여러 군데 봤다.', { issues: { job: -2, tech: -2 } }, '벤처 채용'), k(teen, '컴퓨터 잘하면 사장 된다는 말을 들었다.', { issues: { tech: -2 } }, '벤처 붐')],
  'ng.1999.groupbreak': [k(seek, '대기업 공채가 또 줄었다.', { issues: { job: 4 } }, '채용 축소'), k(teen, '대기업도 망한다는 말을 처음 실감했다.', { issues: { job: 2 } }, '그룹 해체')],
  'ng.1999.pension': [k(seek, '취업하면 연금도 들어야 한다는 말을 들었다.', { issues: { care: -2 } }, '국민연금'), k(inact, '연금 가입 여부를 두고 집에서 얘기가 오갔다.', { issues: { care: 2 } }, '연금 사각지대')],
  'ng.1999.pcbang': [k(seek, 'PC방 야간 아르바이트를 구했다.', { issues: { job: -2 }, stats: { health: -1 } }, 'PC방 일자리'), k(kid, '형들 따라 PC방에 처음 가 봤다.', { stats: { leisure: 1 } }, 'PC방')],
  'ng.1999.y2k': [k(seek, '전산 점검 단기 일을 구했다.', { issues: { job: -2 } }, 'Y2K 일자리'), k(teen, '새천년 맞이 카운트다운을 친구들과 봤다.', { stats: { relations: 1 } }, '새천년'), k(kid, '2000년이 되면 컴퓨터가 멈추냐고 물었다.', { issues: { tech: 2 } }, 'Y2K')],
  'ng.1999.teacher': [k(seek, '교사 임용 준비생들 사이에 노조 얘기가 돌았다.', { issues: { conflict: 2 } }, '교원노조'), k(kid, '선생님들이 회의를 한다는 말을 들었다.', { issues: { edu: 2 } }, '교원노조')],
  'ng.1999.yeonpyeong': [k(and(seek, not(female)), '입대를 앞두고 뉴스를 챙겨 봤다.', { issues: { conflict: 2 } }, '안보 불안'), k(teen, '교실에서 전쟁 나느냐는 말이 오갔다.', { issues: { conflict: 2 } }, '서해 교전')],
  'ng.1999.film': [k(seek, '극장 아르바이트에 지원했다.', { issues: { job: -2 } }, '극장가 호황'), k(emp, '퇴근 뒤 동료들과 영화를 봤다.', { stats: { relations: 1 } }, '한국 영화')],
  'ng.2000.summit': [k(seek, '대북 사업 회사 공고가 눈에 띄었다.', { issues: { job: -2 } }, '남북 경협'), k(kid, '학교에서 통일 노래를 불렀다.', { stats: { happiness: 1 } }, '통일 교육')],
  'ng.2000.reunion': [k(teen, '상봉 장면을 보다 할아버지 고향을 물었다.', { stats: { relations: 1 } }, '이산가족'), k(kid, '어른들이 우는 모습을 보고 놀랐다.', { stats: { relations: 1 } }, '이산가족 상봉')],
  'ng.2000.welfare': [k(seek, '오래 일을 못 구하면 신청할 수 있을지 알아봤다.', { issues: { living: -2 } }, '사회 안전망'), k(kid, '학교에서 급식비 지원 안내문을 받아 왔다.', { issues: { living: -2 } }, '저소득 지원')],
  'ng.2000.nhis': [k(seek, '부모님 건강보험에 피부양자로 올라 있었다.', { issues: { medical: -2 } }, '피부양자'), k(teen, '보험증 모양이 바뀌었다.', { issues: { medical: -2 } }, '건강보험 통합')],
  'ng.2000.dotcom': [k(seek, '붙었던 벤처 회사가 입사 전에 문을 닫았다.', { issues: { job: 4 } }, '벤처 붕괴'), k(teen, '컴퓨터만 잘하면 된다는 말이 쏙 들어갔다.', { issues: { tech: 2 } }, '벤처 붕괴')],
  'ng.2000.sydney': [k(kid, '한반도기를 그려 교실에 붙였다.', { stats: { happiness: 1 } }, '공동 입장'), k(seek, '응원하며 잠시 시름을 잊었다.', { stats: { happiness: 1 } }, '올림픽')],
  'ng.2000.civic': [k(seek, '처음 정치에 관심이 생겨 명단을 찾아봤다.', { issues: { fairness: -2 } }, '낙선운동'), k(teen, '선거 얘기가 사회 수업에 나왔다.', { stats: { intellect: 1 } }, '선거 교육')],
  'ng.2000.nobel': [k(kid, '노벨상이 무엇인지 처음 알았다.', { stats: { intellect: 1 } }, '노벨상'), k(seek, '자기소개서 시사 문항에 그 얘기를 썼다.', { stats: { intellect: 1 } }, '시사 준비')],
  'ng.2001.airport': [k(seek, '공항 상주 업체 채용 공고에 지원했다.', { issues: { job: -2 } }, '공항 일자리'), k(teen, '수학여행 비행기를 새 공항에서 탔으면 했다.', { stats: { leisure: 1 } }, '새 공항')],
  'ng.2001.imfrepay': [k(teen, '외환위기는 끝났다는데 집 형편은 그대로였다.', { issues: { fairness: 2 } }, '체감 격차'), k(kid, '어른들이 이제 좀 나아지려나 했다.', { stats: { happiness: 1 } }, '위기 졸업')],
  'ng.2001.911': [k(seek, '항공·여행사 채용이 끊겼다.', { issues: { job: 3 } }, '항공 업계 위축'), k(teen, '세계가 전쟁으로 간다는 말에 겁이 났다.', { issues: { conflict: 2 } }, '테러 불안'), k(kid, 'TV 화면을 보며 무슨 일인지 물었다.', { issues: { conflict: 2 } }, '9·11')],
  'ng.2001.snow': [k(teen, '폭설로 학교가 휴교했다.', { stats: { leisure: 1 } }, '폭설 휴교'), k(seek, '눈길에 면접장 가는 길이 험했다.', { stats: { leisure: -1 } }, '폭설')],
  'ng.2001.maternity': [k(and(seek, female), '출산휴가 쓸 수 있는 회사인지 따져 봤다.', { issues: { care: 2 } }, '모성보호')],
  'ng.2001.gamer': [k(seek, 'PC방에서 경기 중계를 보며 시간을 보냈다.', { stats: { leisure: 1 } }, '게임 리그'), k(kid, '형들 따라 게임 방송을 봤다.', { stats: { leisure: 1 } }, '게임 방송')],
  'ng.2001.healthfin': [k(seek, '부모님 보험료가 올랐다는 말을 들었다.', { issues: { living: 2 } }, '보험료 인상'), k(teen, '병원비가 오른다는 말을 들었다.', { issues: { medical: 2 } }, '의료비')],
  'ng.2001.lowrate': [k(seek, '대출 광고 전단이 우편함에 쌓였다.', { issues: { living: 2 } }, '대출 권유'), k(emp, '동료들이 대출받아 집을 샀다는 얘기를 했다.', { issues: { housing: 2 } }, '대출 증가')],
  'ng.2001.women': [k(and(seek, female), '채용 차별 신고 창구가 생겼다는 말을 들었다.', { issues: { fairness: -2 } }, '여성 정책')],
  'ng.2002.candle': [k(seek, '촛불 추모 행렬에 함께 섰다.', { issues: { conflict: 2 } }, '추모')],
  'ng.2002.yeonpyeong': [k(and(seek, not(female)), '입대 날짜를 받아 둔 터라 뉴스가 가슴에 박혔다.', { issues: { conflict: 3 } }, '서해 교전'), k(teen, '월드컵 응원 중 비보에 교실이 조용해졌다.', { issues: { conflict: 2 } }, '서해 교전')],
  'ng.2002.busan': [k(seek, '경기장 단기 아르바이트를 했다.', { issues: { job: -2 } }, '대회 일자리'), k(kid, '경기 중계를 보며 국기를 흔들었다.', { stats: { happiness: 1 } }, '아시안게임')],
  'ng.2002.election': [k(seek, '청년 일자리 공약을 비교해 보고 투표했다.', { issues: { job: 2 } }, '대선 공약'), k(teen, '인터넷 게시판 선거 논쟁을 구경했다.', { issues: { conflict: 2 } }, '대선 열기')],
  'ng.2002.lotto': [k(seek, '혹시나 하는 마음으로 한 장 샀다.', { issues: { fairness: 2 } }, '로또'), k(teen, '어른들이 번호를 고르는 걸 구경했다.', { stats: { leisure: 1 } }, '로또')],
  'ng.2002.house': [k(seek, '집값 뉴스에 독립은 먼 얘기가 됐다.', { issues: { housing: 3 } }, '집값 급등'), k(emp, '동료들 집값 얘기에 대화가 갈렸다.', { issues: { fairness: 2 } }, '자산 격차')],
  'ng.2002.broadband': [k(seek, '구직 사이트를 하루에도 몇 번씩 들어갔다.', { issues: { tech: -2 } }, '인터넷 구직'), k(kid, '인터넷 숙제를 처음 받았다.', { issues: { tech: -2 } }, '정보 교육')],
  'ng.2002.minihome': [k(seek, '미니홈피 다이어리에 취업 준비 일기를 썼다.', { stats: { relations: 1 } }, '미니홈피'), k(emp, '동료 미니홈피에서 휴가 사진을 봤다.', { stats: { relations: 1 } }, '미니홈피'), k(kid, '언니 오빠 미니홈피를 몰래 구경했다.', { stats: { leisure: 1 } }, '미니홈피')],
  'ng.2003.iraq': [k(and(seek, not(female)), '입대 전 파병 얘기에 마음이 복잡했다.', { issues: { conflict: 2 } }, '파병'), k(teen, '반에서 파병 찬반 토론을 했다.', { stats: { intellect: 1 } }, '파병 토론')],
  'ng.2003.sars': [k(seek, '항공·여행 업계 채용이 다시 멈췄다.', { issues: { job: 3 } }, '사스 여파'), k(teen, '수학여행지가 바뀌었다.', { issues: { medical: 2 } }, '사스'), k(emp, '해외 출장 뒤 열 체크를 받았다.', { issues: { medical: 2 } }, '사스 검역')],
  'ng.2003.freight': [k(seek, '물류 회사 단기 일이 끊겼다.', { issues: { job: 2 } }, '물류 차질'), k(emp, '납품이 밀려 야근이 늘었다.', { stats: { leisure: -1 } }, '물류 차질')],
  'ng.2003.capital': [k(seek, '공공기관이 지방으로 가면 어디에 지원할까 따져 봤다.', { issues: { region: 2 } }, '행정수도'), k(teen, '수도를 옮긴다는 말이 신기했다.', { stats: { intellect: 1 } }, '행정수도')],
  'ng.2003.1029': [k(seek, '집값 잡힐 때까지 부모님 집에 있기로 했다.', { issues: { housing: 2 } }, '주거 독립 지연'), k(emp, '동료들 집 장만 얘기가 쏙 들어갔다.', { issues: { housing: 2 } }, '부동산 대책')],
  'ng.2003.neis': [k(kid, '선생님들 회의가 잦아졌다.', { issues: { edu: 2 } }, '학교 갈등')],
  'ng.2003.youthjob': [k(emp, '신입 공채가 줄어 후배가 안 들어왔다.', { stats: { leisure: -1 } }, '채용 축소'), k(teen, '대학 나와도 취업이 어렵다는 말을 들었다.', { issues: { job: 2, edu: 2 } }, '청년 실업')],
  'ng.2003.wellbeing': [k(seek, '돈 안 드는 걷기 운동을 시작했다.', { stats: { health: 1 } }, '웰빙'), k(teen, '급식 메뉴에 잡곡밥이 나왔다.', { stats: { health: 1 } }, '웰빙 급식')],
  'ng.2004.impeach': [k(seek, '정치 뉴스에 취업 걱정이 더해졌다.', { issues: { conflict: 2 } }, '탄핵 정국'), k(teen, '헌법이 무엇인지 처음 찾아봤다.', { stats: { intellect: 1 } }, '탄핵 정국'), k(kid, '어른들이 뉴스 앞에서 다투는 걸 봤다.', { issues: { conflict: 2 } }, '탄핵 정국')],
  'ng.2004.ktx': [k(seek, '서울 면접을 당일치기로 다녀왔다.', { issues: { region: -2 } }, '고속철도'), k(teen, '고속열차를 타 보고 싶었다.', { stats: { happiness: 1 } }, '고속철도')],
  'ng.2004.sexlaw': [k(seek, '유흥업소 아르바이트 자리가 사라졌다.', { issues: { job: 2 } }, '단속 강화')],
  'ng.2004.eps': [k(seek, '외국인 근로자와 일자리를 다툰다는 말에 고개를 갸웃했다.', { issues: { conflict: 2 } }, '일자리 경쟁')],
  'ng.2004.unconst': [k(seek, '공공기관 이전 계획이 뒤집혀 지원 계획을 바꿨다.', { issues: { job: 2 } }, '이전 무산')],
  'ng.2004.athens': [k(kid, '태권도 학원 친구들이 경기 얘기로 들떴다.', { stats: { happiness: 1 } }, '올림픽'), k(seek, '새벽 중계를 보며 공부를 미뤘다.', { stats: { leisure: 1 } }, '올림픽 중계')],
  'ng.2004.hallyu': [k(seek, '일본어 관광 안내 일을 알아봤다.', { issues: { job: -2 } }, '한류 관광'), k(teen, '외국에서 우리 드라마가 인기라 신기했다.', { stats: { happiness: 1 } }, '한류')],
  'ng.2004.kaesong': [k(seek, '남북 경협 기업 공고를 찾아봤다.', { issues: { job: -2 } }, '개성공단')],
  'ng.2004.badbank': [k(seek, '카드 빚 없이 버틴 게 다행이다 싶었다.', { issues: { fairness: 2 } }, '채무 조정'), k(emp, '월급 압류된 동료 얘기를 들었다.', { issues: { living: 2 } }, '신용불량')],
  'ng.2005.stemcell': [k(seek, '연구원 채용 공고가 줄었다.', { issues: { job: 2 } }, '연구 신뢰 추락'), k(kid, '과학자 얘기를 하다 어른들 표정이 굳었다.', { issues: { fairness: 2 } }, '논문 조작')],
  'ng.2005.831': [k(seek, '집값 안정 기대에 독립 계획을 세워 봤다.', { issues: { housing: -2 } }, '부동산 대책'), k(emp, '동료들 사이 세금 얘기가 오갔다.', { issues: { conflict: 2 } }, '세금 논쟁')],
  'ng.2005.cheonggye': [k(seek, '청계천을 걸으며 머리를 식혔다.', { stats: { leisure: 1 } }, '산책'), k(kid, '청계천 물가에서 발을 담갔다.', { stats: { happiness: 1 } }, '청계천')],
  'ng.2005.hoju': [k(seek, '가족 제도가 바뀐다는 얘기를 들었다.', { issues: { fairness: -2 } }, '호주제 폐지'), k(teen, '사회 시간에 호주제 폐지를 배웠다.', { stats: { intellect: 1 } }, '호주제 폐지')],
  'ng.2005.birthrate': [k(seek, '취업도 못 했는데 결혼은 먼 얘기였다.', { issues: { care: 2 } }, '결혼 유예'), k(kid, '반 학생 수가 줄었다는 말을 들었다.', { issues: { edu: -2 } }, '학령인구 감소')],
  'ng.2005.apec': [k(seek, '행사 통역 아르바이트를 구했다.', { issues: { job: -2 } }, '국제 행사')],
  'ng.2005.blog': [k(seek, '취업 후기 블로그를 찾아 읽었다.', { issues: { tech: -2 } }, '블로그 정보'), k(emp, '회사 홍보 블로그를 맡게 됐다.', { stats: { leisure: -1 } }, '블로그 업무')],
  'ng.2005.rice': [k(seek, '농촌 일손 돕기 봉사에 나섰다.', { stats: { relations: 1 } }, '농촌 봉사')],
  'ng.2006.nuke': [k(and(seek, not(female)), '입대를 앞두고 뉴스에 귀를 기울였다.', { issues: { conflict: 3 } }, '안보 불안'), k(teen, '전쟁 나느냐는 얘기가 교실에 돌았다.', { issues: { conflict: 2 } }, '북핵 실험'), k(emp, '증시 급락 뉴스에 사무실이 술렁였다.', { issues: { conflict: 2 } }, '증시 불안')],
  'ng.2006.fta': [k(seek, '수출 회사 채용이 늘까 기대했다.', { issues: { job: -2 } }, '수출 기대'), k(emp, 'FTA로 우리 업종이 어떻게 될지 회의가 열렸다.', { issues: { job: 2 } }, 'FTA 영향')],
  'ng.2006.wbc': [k(seek, '중계를 보며 잠시 시름을 잊었다.', { stats: { happiness: 1 } }, 'WBC'), k(kid, '야구 글러브를 사 달라고 졸랐다.', { stats: { health: 1 } }, '야구 붐')],
  'ng.2006.bubble': [k(seek, '집값 뉴스에 독립은 꿈도 못 꿨다.', { issues: { housing: 3, fairness: 2 } }, '집값 급등'), k(emp, '월급 모아 집 사기는 글렀다는 말이 오갔다.', { issues: { housing: 3 } }, '집값 급등')],
  'ng.2006.pyeongtaek': [k(and(seek, not(female)), '입대 후 현장에 투입될까 걱정했다.', { issues: { conflict: 2 } }, '기지 갈등')],
  'ng.2006.film': [k(seek, '조조 영화로 하루를 달랬다.', { stats: { leisure: 1 } }, '한국 영화'), k(teen, '친구들과 시험 끝나고 영화를 봤다.', { stats: { relations: 1 } }, '한국 영화')],
  'ng.2006.lowbirth': [k(seek, '아이는커녕 결혼도 먼 얘기였다.', { issues: { care: 2 } }, '결혼 유예'), k(emp, '회사 육아휴직 규정을 찾아봤다.', { issues: { care: -2 } }, '육아 지원')],
  'ng.2006.un': [k(seek, '국제기구 인턴 공고를 찾아봤다.', { issues: { job: -2 } }, '국제기구 진로'), k(kid, '위인전 같은 얘기에 꿈이 하나 늘었다.', { stats: { happiness: 1 } }, '유엔 사무총장')],
  'ng.2007.fta': [k(seek, '수출 기업 채용 소식에 지원서를 냈다.', { issues: { job: -2 } }, '수출 기대'), k(teen, '사회 시간에 FTA 찬반 토론을 했다.', { stats: { intellect: 1 } }, 'FTA 토론')],
  'ng.2007.taean': [k(seek, '방제 일당 일자리에 나갔다.', { issues: { job: -2 } }, '방제 일자리'), k(teen, '학교에서 방제 봉사 신청을 받았다.', { stats: { relations: 1 } }, '자원봉사')],
  'ng.2007.summit': [k(seek, '경협 기업 채용이 늘까 기대했다.', { issues: { job: -2 } }, '남북 경협'), k(teen, '통일 수업 시간이 늘었다.', { stats: { intellect: 1 } }, '통일 교육')],
  'ng.2007.election': [k(seek, '일자리 공약을 비교하고 투표했다.', { issues: { job: 2 } }, '대선 공약'), k(teen, '선거 연령 얘기가 반에서 나왔다.', { stats: { intellect: 1 } }, '선거 교육')],
  'ng.2007.afghan': [k(seek, '해외 봉사 지원 계획을 접었다.', { issues: { conflict: 2 } }, '해외 안전'), k(teen, '해외 위험 지역 얘기를 들었다.', { issues: { conflict: 2 } }, '해외 안전')],
  'ng.2007.pension': [k(seek, '취업해도 연금은 덜 받는다는 말에 허탈했다.', { issues: { fairness: 3 } }, '세대 형평')],
  'ng.2007.fund': [k(seek, '주식 얘기는 남의 세상 같았다.', { issues: { fairness: 2 } }, '자산 격차'), k(teen, '어른들이 펀드 얘기를 하는 걸 들었다.', { stats: { intellect: 1 } }, '펀드 열풍')],
  'ng.2007.fakeedu': [k(seek, '자격증 하나라도 더 따야겠다고 마음먹었다.', { issues: { job: 2 } }, '스펙 경쟁'), k(emp, '회사가 직원 학력 확인을 새로 했다.', { issues: { fairness: 2 } }, '학력 검증')],
  'ng.2007.lawschool': [k(teen, '진로 상담에 로스쿨 얘기가 나왔다.', { issues: { edu: 2 } }, '로스쿨')],
  'ng.2008.namdaemun': [k(seek, '불탄 문 소식에 마음이 무거웠다.', { issues: { conflict: 2 } }, '숭례문 화재'), k(kid, '학교에서 문화재 그림을 그렸다.', { stats: { intellect: 1 } }, '문화재 교육')],
  'ng.2008.beef': [k(seek, '광장 촛불 행렬에 섞여 걸었다.', { issues: { conflict: 2 } }, '촛불집회'), k(emp, '점심 메뉴를 고를 때 원산지를 따졌다.', { issues: { living: 2 } }, '먹거리 불안')],
  'ng.2008.beijing': [k(seek, '응원하며 잠시 걱정을 잊었다.', { stats: { happiness: 1 } }, '올림픽'), k(kid, '수영 금메달 장면을 흉내 냈다.', { stats: { health: 1 } }, '올림픽')],
  'ng.2008.oil': [k(seek, '면접 가는 교통비도 부담이 됐다.', { issues: { living: 3 } }, '고유가'), k(teen, '부모님이 차를 덜 타셨다.', { issues: { living: 2 } }, '고유가')],
  'ng.2008.kiko': [k(seek, '수출 중소기업 채용이 끊겼다.', { issues: { job: 4 } }, '환율 위기'), k(emp, '원자재값이 올라 회사가 비용을 줄였다.', { issues: { job: 3 } }, '환율 급등')],
  'ng.2008.kumgangstop': [k(seek, '관광 업계 채용 소식이 끊겼다.', { issues: { job: 2 } }, '관광 중단'), k(teen, '남북 관계 뉴스가 또 나빠졌다.', { issues: { conflict: 2 } }, '관광 중단')],
  'ng.2008.jongbu': [k(seek, '세금 논쟁보다 집 구할 일이 더 급했다.', { issues: { housing: 2 } }, '주거 불안')],
  'ng.2009.flu': [k(seek, '면접장 입구에서 체온을 쟀다.', { issues: { medical: 2 } }, '방역'), k(emp, '회사에 손 소독제가 놓였다.', { issues: { medical: 2 } }, '직장 방역')],
  'ng.2009.yongsan': [k(seek, '재개발 지역 원룸 시세를 찾아봤다.', { issues: { housing: 2 } }, '재개발')],
  'ng.2009.hope': [k(seek, '청년은 대상이 아니라 다른 일을 찾았다.', { issues: { job: 2 } }, '공공 일자리')],
  'ng.2009.intern': [k(teen, '대학 가서 인턴부터 해야 한다는 말을 들었다.', { issues: { job: 2 } }, '스펙 경쟁')],
  'ng.2009.bogeum': [k(seek, '나중에 청약하려고 청약통장을 만들었다.', { issues: { housing: -2 } }, '청약 준비')],
  'ng.2009.figure': [k(seek, '경기를 보며 힘을 얻었다.', { stats: { happiness: 1 } }, '피겨 우승'), k(emp, '동료들과 경기 얘기로 웃었다.', { stats: { relations: 1 } }, '피겨 우승')],
  'ng.2009.rocket': [k(seek, '항공우주 연구소 채용에 관심이 갔다.', { issues: { tech: -2 } }, '우주 개발'), k(kid, '로켓 그림을 그려 교실에 붙였다.', { stats: { intellect: 1 } }, '우주발사체')],
  'ng.2009.eitc': [k(seek, '일을 구하면 받을 수 있는지 알아봤다.', { issues: { living: -2 } }, '근로장려금')],
  'ng.2009.strike': [k(seek, '정리해고 소식에 취업이 더 두려워졌다.', { issues: { job: 3 } }, '고용 불안'), k(teen, '우리 집 어른 회사도 그럴까 걱정됐다.', { issues: { job: 2 } }, '고용 불안')],
  'ng.2009.presidents': [k(seek, '분향소에 들러 조문했다.', { issues: { conflict: 2 } }, '추모')],
};
for (const n of NG_B) if (EXTRA[n.id]) n.links.splice(n.links.length - 1, 0, ...EXTRA[n.id]);
