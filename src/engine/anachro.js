// 시대착오 어휘 가드(QA 리뷰 #2): 통신·미디어 용어가 보급되기 전 해에는 그 용어가 든 변형 문구를 쓰지 않는다.
// 연도는 '그 말이 일상어가 된 해'를 보수적으로 잡은 값이다(국내 상용화 시점 기준, 사실연표가 아니라 문구 필터).
const TERMS = [
  [/단톡|단체방|단체 채팅|카톡|톡방/, 2010],
  [/문자(?:가|를|는|로|도|만|\s?메시지|\s?한 통|\s?한 줄)|(?:합격|불합격|당첨|확인|안내|부고|안부|결과|이자|예약|재계약|입금|인증|연체) 문자/, 2000],
  [/이력서 파일|파일을 열/, 1998],
  [/알림(?!장)/, 2010],
  [/휴대폰|핸드폰|휴대전화/, 1997],
  [/메일/, 1999],
  [/앱(?=[\s,.·)을를이가에으도은는의]|$)/, 2010],
  [/스마트폰|스마트 ?워치/, 2010],
  [/SNS|인스타|페이스북|트위터|해시태그|팔로워|팔로우/, 2010],
  [/\bAI\b|인공지능|챗봇|생성형/, 2016],
  [/노트북/, 1998],
  [/유튜브|유튜버|구독자|구독 알림|알림 구독|스트리밍|영상 ?통화|화상 ?(?:통화|회의|수업)/, 2008],
  [/온라인|인터넷|페이지를 열/, 1997],
  [/댓글/, 2001],
  [/링크|캡처|블로그/, 2005],
  [/QR|클라우드|와이파이|로그인/, 2010],
  [/모바일/, 2008],
  [/재택/, 2010],
  [/비대면/, 2015],
  [/라이브 방송|실시간 방송/, 2015],
  [/메신저|채팅방/, 2001],
  [/간편 ?결제|카카오페이|네이버페이|토스/, 2015],
  [/사진 보정|보정을 쓴다|사진을 보정/, 2008],
  // 제도·업종이 생기기 전(B-05): 육아휴직 1988.4 · 영유아보육법 1991 · 고용보험 1995.7 · PC방 확산 1998 · 로또6/45 2002.12 · 연금복권 2011
  [/육아휴직/, 1988], [/어린이집/, 1991], [/대리운전/, 1995], [/실업급여|구직급여/, 1995], [/피시방|PC방/, 1998], [/로또/, 2002], [/연금복권/, 2011],
];
const CACHE = new Map();
// 문자열이 쓰이려면 필요한 최소 연도(0 = 제한 없음)
export function needYear(s) {
  if (typeof s !== 'string') return 0;
  let v = CACHE.get(s);
  if (v === undefined) {
    v = 0;
    for (const [re, y] of TERMS) if (y > v && re.test(s)) v = y;
    CACHE.set(s, v);
  }
  return v;
}
// 사건의 정적 문구(변형 배열은 가장 이른 변형 기준, 선택지는 전부)가 요구하는 최소 연도. 함수형 문구는 era()가 책임진다.
export function eventFrom(ev) {
  const first = t => (typeof t === 'string' ? needYear(t) : Array.isArray(t) && t.length && t.every(x => typeof x === 'string') ? Math.min(...t.map(needYear)) : 0);
  let from = first(ev.text);
  for (const o of ev.choice?.options || []) from = Math.max(from, needYear(o.label), needYear(o.result), needYear(o.hint));
  return from;
}

// 학교 명칭의 시대 표기: 1996-03-01 이전에는 '국민학교'(초등학교로 개칭). UI 상태 라벨은 schoolLabel()을 쓴다.
export const SCHOOL_NAME_CHANGE = 1996;
export const eraSchool = (year, s) => (year != null && year < SCHOOL_NAME_CHANGE ? s.replace(/초등학교/g, '국민학교').replace(/초등학생/g, '국민학생') : s);
const STAGE_LABEL = { home: '', daycare: '어린이집', kinder: '유치원', elem: '초등학교', middle: '중학교', high: '고등학교', retake: '재수', college: '대학', grad: '대학원', done: '' };
export const schoolLabel = (L, stage = L?.edu?.stage) => eraSchool(L?.year, STAGE_LABEL[stage] ?? '');
