// 시대착오 어휘 스캔: 사건 문구를 연도별로 펼쳐 용어 도입 연도(보수적)보다 이른 해에 나올 수 있는 줄을 찾는다.
import { EVENTS } from '../../src/content/events/index.js';
import CORE from '../../src/content/jobs-core.js';
import { needYear, eventFrom } from '../../src/engine/anachro.js';
// [정규식, 도입 연도(보급 시작)]
export const TERMS = [
  [/단톡|단체방|카톡|톡방|그룹 ?채팅/, 2010], [/합격 문자|불합격 문자|문자 ?(메시지|한 통|가)|문자가|문자를|문자로|문자\b/, 2000],
  [/이력서 파일|파일/, 1996], [/SNS|인스타|페이스북|스토리/, 2010], [/앱\b|앱[을이에으]/, 2010], [/보정/, 2008],
  [/\bAI\b|인공지능|챗봇/, 2016], [/스마트폰/, 2010], [/휴대폰|핸드폰|폰\b/, 1997], [/이메일|메일/, 1999], [/노트북/, 1998],
  [/유튜브|영상 ?통화|스트리밍|구독/, 2008], [/배달/, 1990], [/알림/, 2010], [/링크/, 2005], [/온라인|인터넷/, 1997],
  [/검색/, 1998], [/댓글/, 2000], [/로그인|와이파이|클라우드|QR/, 2010], [/재택/, 2016], [/비대면/, 2020], [/캡처/, 2005], [/라이브/, 2015], [/게시판/, 1993], [/메신저|채팅/, 2000], [/문자 ?메시지|메시지/, 2000], [/화상/, 2010], [/동영상/, 2005], [/블로그/, 2003], [/전자 ?결제|간편 ?결제|페이/, 2012], [/모바일/, 2008], [/해시태그|팔로워|좋아요/, 2010],
];
const strs = (v, y, out) => {
  if (v == null) return;
  if (typeof v === 'string') return void out.add(v);
  if (Array.isArray(v)) return v.forEach(x => strs(x, y, out));
  if (typeof v === 'function') for (let k = 0; k < 4; k++) { try { strs(v({ year: y, age: 30, name: '가', birth: {}, flags: {}, family: {}, job: {}, edu: {}, home: {} }, { pick: a => a[Math.min(k, a.length - 1)], rand: () => 0.5, L: null }), y, out); } catch {} }
};
export function scan(evs, from = 1960, to = 2025) {
  const hits = new Map();
  for (const ev of evs) {
    const y0 = Math.max(from, ev.years?.[0] ?? from), y1 = Math.min(to, ev.years?.[1] ?? to);
    for (let y = Math.max(y0, eventFrom(ev)); y <= y1; y += 1) {   // 엔진 게이트(eventFrom) 통과분만
      const out = new Set();
      strs(ev.text, y, out); strs(ev.reason, y, out);
      for (const o of ev.choice?.options || []) { strs(o.result, y, out); strs(o.label, y, out); }
      for (const s of out) if (needYear(s) <= y) for (const [re, intro] of TERMS) {
        if (y < intro && re.test(s)) { const key = ev.id + '|' + s; if (!hits.has(key)) hits.set(key, { id: ev.id, y, term: String(re.exec(s)?.[0]), intro, s }); }
      }
    }
  }
  return [...hits.values()];
}
if (process.argv[1].endsWith('anachro-scan.mjs')) {
  const evs = [...EVENTS, ...(CORE || []).flatMap(c => (c.events || []).map(e => ({ ...e, id: e.id })))];
  const r = scan(evs);
  for (const h of r) console.log(`${h.id}\t${h.y}\t${h.term}(${h.intro})\t${h.s.slice(0, 70)}`);
  console.error('total', r.length);
}
