import { createHash } from 'node:crypto';

export const sha = s => createHash('sha256').update(s).digest('hex');
export const norm = s => s.normalize('NFKC').replace(/[\s\p{P}\p{S}]/gu, '').toLowerCase();
export function text(s) {
  return s.replace(/<ref\b[^>]*>[\s\S]*?<\/ref>|<ref\b[^>]*\/>/gi, '')
    .replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, a, b) => b || a)
    .replace(/\{\{[^{}]*\}\}/g, '').replace(/<[^>]*>/g, '')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
    .replace(/&nbsp;|&#160;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/'''?/g, '').replace(/\s+/g, ' ').trim();
}
export function validDate(d) {
  return /^\d{4}-\d\d-\d\d$/.test(d) && !Number.isNaN(Date.parse(d)) && new Date(d).toISOString().slice(0, 10) === d;
}
const date = (y,m,d) => `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
export function parseArchives(html, year) {
  const rows = []; let day;let rowIndex=0;const occupied=[];
  for (const match of html.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)) {
    const cells = [...match[1].matchAll(/<td\b([^>]*)>([\s\S]*?)<\/td>/gi)];
    const dm = match[1].match(/id="search_(\d{4})_(\d{1,2})_(\d{1,2})"/);
    if (dm) day = date(+dm[1],+dm[2],+dm[3]);
    let col=0;
    // Reconstruct logical columns including inherited rowspan cells. Column 1 alone is the event.
    for (const [,attrs,body] of cells) {
      while((occupied[col]||0)>rowIndex)col++;
      const position=col;const span=+(attrs.match(/rowspan="?(\d+)/i)?.[1]||1);
      occupied[col]=rowIndex+span;col++;
      if(position!==1||!day||+day.slice(0,4)!==year)continue;
      const title = text(body);
      if (title && title.length < 180 && validDate(day)) rows.push({date:day,title,source:'archives',url:`https://theme.archives.go.kr/next/chronology/yearRecord.do?year=${year}#search_${year}_${+day.slice(5,7)}_${+day.slice(8,10)}`,license:'rights-unconfirmed',verification:'official-chronology'});
    }
    rowIndex++;
  }
  return rows;
}
const EVENT = /사건|전쟁|전투|혁명|의거|운동|선거|정상회담|협정|조약|선언|참사|사고|붕괴|테러|폭발|침몰|화재|지진|태풍|산불|위기|개혁|파동|항쟁|학살|올림픽|월드컵|아시안 게임|박람회|탄핵|계엄|유행|메르스|코로나|민주화|누리호|천리안|나로호|호주제|의료분쟁|언론 통폐합|금융실명/;
const GENERIC = /^(대한민국|한국|미국|일본|중국|북한|조선민주주의인민공화국|서울|부산|한국전쟁|한국 전쟁|6·25 전쟁|대통령|국회|국무총리|.*선거관리위원회|.*헌법재판소|사건|전쟁|전투|혁명|운동|선거|올림픽|월드컵|아시안 게임|태풍|지진|화재|탄핵|계엄령|코로나19|코로나바이러스감염증-19)$/;
const DOMESTIC = /대한민국|한국|서울|부산|대구|인천|광주|대전|울산|경기도|강원|경상|전라|충청|제주|남북|한일|한미|국군|국회|이승만|박정희|전두환|김영삼|김대중|노무현|이명박|박근혜|문재인|윤석열|이재명/;
export function parseWiki(wiki, year, revision) {
  const out=[]; let active=false, current;
  const refs = wiki.replace(/<ref\b[^>]*>[\s\S]*?<\/ref>/gi,'');
  for (const rawLine of refs.split('\n')) {
    const line=rawLine.replace(/'''?/g,'');
    const heading=line.match(/^(={2,})\s*(.*?)\s*\1\s*$/);
    if (heading && heading[1].length === 2) active=/^(사건|문화|문화와 생활)$/.test(text(heading[2]));
    if (!active) continue;
    const dm = line.match(/^\*+\s*\[?\[?(\d{1,2})월\s*(\d{1,2})일/);
    if (dm) current=date(year,+dm[1],+dm[2]);
    if (!/^\*/.test(line) || !current || !validDate(current)) continue;
    const clean=text(line.replace(/^\*+/,'')).replace(/^\d+월\s*\d+일\s*[-–:]?\s*/, '');
    if (/주년|기념식|예정|예고|계획이다/.test(clean)) continue;
    for (const link of line.matchAll(/\[\[([^\]|#]+)(?:[^\]]*)\]\]/g)) {
      const title=link[1].trim();
      if (!EVENT.test(title) || GENERIC.test(title) || /목록|^(파일|분류|틀|:|\d+월)/.test(title) || title.length < 5) continue;
      if (!DOMESTIC.test(clean) && !/대한민국|한국|남북|한일|한미|[·ㆍ]\d|\d[·ㆍ]|세월호|삼풍|성수|서해|연평|천안함|누리호|나로호|메르스/.test(title)) continue;
      out.push({date:current,title,context:clean,revision,year});
    }
  }
  return out;
}
export function category(title) {
  if (/전쟁|전투|휴전|정전|남침|상륙|파병|핵|미사일|천안함|연평|군사|계엄/.test(title)) return '안보';
  if (/회담|수교|유엔|협정|조약|외교|정상|남북/.test(title)) return '외교';
  if (/선거|대통령|개헌|헌법|혁명|민주|의거|항쟁|탄핵|정부|국회/.test(title)) return '정치';
  if (/경제|금융|은행|화폐|수출|무역|실명|고속|철도|지하철.*개통|산업|개발|보험|연금|최저임금/.test(title)) return '경제·제도';
  if (/참사|사고|붕괴|침몰|화재|수해|태풍|지진|산불|폭발|메르스|코로나|유행/.test(title)) return '재난·보건';
  return '사회·문화';
}
export function score(title) {
  return 1 + (/혁명|전쟁|남침|정전|휴전|개헌|선거|민주화|쿠데타|탄핵|계엄|외환|금융실명|남북.*회담|올림픽|월드컵|참사|붕괴|세월호|코로나|메르스/.test(title)?8:0)
    + (/최초|수교|개통|전면|시행|출범|발발|독립|화폐|고속도로|보험|수출|산불|태풍|지진/.test(title)?3:0)
    - (/방문|성명|회의 개최|기념|순방|담화|선언문|기공식/.test(title)?2:0);
}
export function topic(row) {
  const t=row.title;
  if (/6.?25|한국.?전쟁|남침|인천.?상륙|흥남.?철수|서울.*(수복|탈환)|중공군|중국군|휴전|정전 협정|낙동강|38.?도선/.test(t) && +row.date.slice(0,4)<=1953) return 'korean-war';
  if (/대구.*지하철.*(화재|참사|방화)/.test(t))return 'daegu-subway-fire';
  for (const [key,re] of [['april-revolution',/4.?19|3.?15.*(선거|부정)|이승만.*하야/],['gwangju',/5.?18|광주.*(민주|항쟁)/],['june-democracy',/6월.*(항쟁|민주)|6.?29.*선언/],['sewol',/세월호/],['covid',/코로나|COVID/i],['mers',/메르스/],['yoon-martial-law',/윤석열.*(탄핵|계엄|체포|구속)|12.?3.*계엄/],['imf',/외환.?위기|IMF|국제통화기금.*(금융|구제)/],['media-consolidation',/언론.*통폐합/]]) if(re.test(t))return key;
  return row.qid || norm(t.replace(/발표|실시|개최|시행|체결|발발|선포|공포/g,''));
}
export function select(rows, cap=10) {
  const groups=new Map();
  for (const row of rows) {
    if(/주년|기념식|기념행사|유족회|기념대회|기념일|국민장|장례|사망|국무회의$/.test(row.title))continue;
    const k=topic(row);const g=groups.get(k)||[];g.push(row);groups.set(k,g);
  }
  const grouped=[...groups].map(([key,g])=>{
    g.sort((a,b)=>score(b.title)-score(a.title)||a.date.localeCompare(b.date)||a.title.localeCompare(b.title,'ko'));
    const r=g[0];return {...r,topic:key,category:category(r.title),milestones:g.map(x=>({date:x.date,title:x.title,url:x.url})).filter((x,i,a)=>a.findIndex(y=>y.date===x.date&&y.title===x.title)===i).sort((a,b)=>a.date.localeCompare(b.date))};
  }).sort((a,b)=>score(b.title)-score(a.title)||a.date.localeCompare(b.date)||a.title.localeCompare(b.title,'ko'));
  // Reserve one slot per available category, then fill by score. No minimum padding.
  const chosen=[];
  for(const c of ['정치','안보','외교','경제·제도','재난·보건','사회·문화']) {const r=grouped.find(x=>x.category===c);if(r&&chosen.length<cap)chosen.push(r);}
  for(const r of grouped)if(chosen.length<cap&&!chosen.includes(r))chosen.push(r);
  return chosen.sort((a,b)=>a.date.localeCompare(b.date)||a.title.localeCompare(b.title,'ko'));
}

// Corroborate an event article's structured date field; never match a random year/date in its history.
export function articleDates(wiki){
  return [...new Set(articleDateEvidence(wiki).map(x=>x.date))];
}
export function articleDateEvidence(wiki){
  if(!/<ref\b|\{\{(?:각주|reflist)/i.test(wiki))return [];
  const dates=[];
  const intro=wiki.split(/^==[^=]/m)[0].replace(/<ref\b[^>]*>[\s\S]*?<\/ref>/gi,'');
  for(const m of intro.matchAll(/^\|\s*(날짜|일시|발생일|발생일시|발생일자|시작일|선고일자|선고일|date)\s*=([^\n]*)/gm)){
    const field=m[2].replace(/\[\[|\]\]/g,'');
    const add=d=>dates.push({date:date(+d[1],+d[2],+d[3]),field:m[1]});
    for(const d of field.matchAll(/(?:\[\[)?(19\d{2}|20\d{2})년(?:\]\])?\s*(?:\[\[)?(\d{1,2})월\s*(\d{1,2})일/g))add(d);
    for(const d of field.matchAll(/\{\{\s*(?:날짜|시작 날짜(?:와 나이)?|start date(?: and age)?)\s*\|\s*(19\d{2}|20\d{2})\s*\|\s*(\d{1,2})\s*\|\s*(\d{1,2})/gi))add(d);
    for(const d of field.matchAll(/\b(19\d{2}|20\d{2})-(\d{2})-(\d{2})\b/g))add(d);
  }
  return dates.filter(x=>validDate(x.date));
}
