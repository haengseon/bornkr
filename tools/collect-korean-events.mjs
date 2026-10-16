#!/usr/bin/env node
// Node 22+, no package dependencies, paid endpoints, keys, or LLM calls.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync, gunzipSync } from 'node:zlib';
import {sha,parseArchives,parseWiki,select,score,validDate,articleDates,articleDateEvidence} from './history/core.mjs';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const args=process.argv.slice(2); const allowed=new Set(['--offline','--refresh','--out','--help']);
for(let i=0;i<args.length;i++){if(!allowed.has(args[i]))throw Error('알 수 없는 옵션: '+args[i]);if(args[i]==='--out'){if(!args[++i]||args[i].startsWith('--'))throw Error('--out 값 필요');}}
if(args.includes('--help')){console.log('node tools/collect-korean-events.mjs [--offline | --refresh] [--out docs/research/news]\n1950~2025, 연도당 최대 10개 사건 묶음. 캐시 기본 재사용.');process.exit(0);}
if(args.includes('--offline')&&args.includes('--refresh'))throw Error('offline/refresh 동시 사용 불가');
const out=path.resolve(ROOT,args.includes('--out')?args[args.indexOf('--out')+1]:'docs/research/news');
if(!out.startsWith(ROOT+path.sep))throw Error('프로젝트 하위 경로만 허용');
const cache=path.join(out,'.cache');await fs.mkdir(cache,{recursive:true});
const offline=args.includes('--offline'),refresh=args.includes('--refresh');
const receipts=[],failures=[],excluded=[];let requests=0;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function get(url,json=false){
  const file=path.join(cache,sha(url)+'.json.gz');let entry;
  if(!refresh)try{entry=JSON.parse(gunzipSync(await fs.readFile(file)));if(entry.url!==url||sha(entry.body)!==entry.sha256)throw Error('캐시 무결성 오류');}catch(e){if(e.code!=='ENOENT')throw e;}
  if(!entry){
    if(offline)throw Error('오프라인 캐시 누락: '+url);
    let last;
    for(let n=0;n<3;n++)try{
      await sleep(250+1000*n);requests++;
      const r=await fetch(url,{headers:{'User-Agent':'BornKR-HistoryCollector/1.0 (https://github.com/haengseon/bornkr; research)'},signal:AbortSignal.timeout(45000)});
      if(!r.ok)throw Error('HTTP '+r.status);
      const body=await r.text();if(json){const j=JSON.parse(body);if(j.error)throw Error(JSON.stringify(j.error));}
      entry={url,retrievedAt:new Date().toISOString(),sha256:sha(body),body};await fs.writeFile(file,gzipSync(JSON.stringify(entry)));break;
    }catch(e){last=e;if(n===2)throw last;}
  }
  receipts.push({url,retrievedAt:entry.retrievedAt,sha256:entry.sha256});return json?JSON.parse(entry.body):entry.body;
}
function api(host,params){const u=new URL(`https://${host}/w/api.php`);u.search=new URLSearchParams({format:'json',formatversion:'2',...params});return u.href;}
const all=[],wiki=[];const sourceYears={};
for(let year=1950;year<=2025;year++){
  sourceYears[year]={official:0,wikiCandidates:0,verifiedWiki:0};
  if(year<=2003)try{
    const html=await get(`https://theme.archives.go.kr/next/chronology/yearRecord.do?year=${year}`);
    const rows=parseArchives(html,year);if(!rows.length)throw Error('연표 파싱 결과 0건: 소스/구조 변경 확인 필요');
    sourceYears[year].official=rows.length;all.push(...rows);
  }catch(e){failures.push({year,source:'archives',error:e.message});}
  // Modern coverage, including the partial last year of the official chronology.
  if(year>=2003)try{
    const j=await get(api('ko.wikipedia.org',{action:'query',prop:'revisions',rvprop:'ids|content',rvslots:'main',titles:`${year}년`}),true);
    const p=j.query.pages[0];if(p.missing||!p.revisions?.length)throw Error('연도 문서 없음');
    const rev=p.revisions[0];const candidates=parseWiki(rev.slots.main.content,year,rev.revid);
    // Bound requests; evaluate at most 45 distinct event articles/year by deterministic relevance score.
    const titles=[...new Set(candidates.sort((a,b)=>score(b.title)-score(a.title)||a.date.localeCompare(b.date)).map(r=>r.title))].slice(0,45);
    const chosen=candidates.filter(r=>titles.includes(r.title));sourceYears[year].wikiCandidates=chosen.length;wiki.push(...chosen);
  }catch(e){failures.push({year,source:'wikipedia',error:e.message});}
  if(year%10===0||year===2025)console.log(`연표 후보 수집 ${year}/2025`);
}
const titles=[...new Set(wiki.map(r=>r.title))].sort();const mapping=new Map(),articles=new Map();
for(let i=0;i<titles.length;i+=40){
  const batch=titles.slice(i,i+40);
  try{const j=await get(api('ko.wikipedia.org',{action:'query',prop:'pageprops|revisions',ppprop:'wikibase_item',rvprop:'ids|content',rvslots:'main',redirects:'1',titles:batch.join('|')}),true);
    const redirects=new Map([...(j.query.normalized||[]),...(j.query.redirects||[])].map(x=>[x.from,x.to]));
    const pages=new Map(j.query.pages.map(p=>[p.title,p]));
    for(const title of batch){let t=title;const seen=new Set();while(redirects.has(t)&&!seen.has(t)){seen.add(t);t=redirects.get(t);}const p=pages.get(t);if(p?.pageprops?.wikibase_item)mapping.set(title,p.pageprops.wikibase_item);if(p?.revisions?.[0])articles.set(title,{dates:articleDates(p.revisions[0].slots.main.content),evidence:articleDateEvidence(p.revisions[0].slots.main.content),revision:p.revisions[0].revid});}
  }catch(e){failures.push({source:'wiki-pageprops',batch:i,error:e.message});}
}
const ids=[...new Set(mapping.values())].sort();const entities=new Map();
for(let i=0;i<ids.length;i+=40)try{
  const j=await get(api('www.wikidata.org',{action:'wbgetentities',ids:ids.slice(i,i+40).join('|'),props:'labels|claims',languages:'ko|en'}),true);
  for(const [id,e] of Object.entries(j.entities))entities.set(id,e);
}catch(e){failures.push({source:'wikidata',batch:i,error:e.message});}
for(const row of wiki){
  const qid=mapping.get(row.title),e=entities.get(qid);
  const dates=['P585','P580'].flatMap(p=>(e?.claims?.[p]||[]).filter(c=>c.rank!=='deprecated').map(c=>c.mainsnak.datavalue?.value).filter(v=>v?.precision>=11&&v.calendarmodel==='http://www.wikidata.org/entity/Q1985727').map(v=>v.time.slice(1,11)));
  // Exact Gregorian day match only; never invent a day from a year/month value.
  const article=articles.get(row.title),structuredMatch=dates.includes(row.date),articleMatch=article?.dates.includes(row.date);
  if(!structuredMatch&&!articleMatch){excluded.push({year:row.year,date:row.date,title:row.title,qid:qid||null,reason:!qid?'no-wikidata-item':!dates.length?'no-day-precision-date':'date-mismatch',wikidataDates:dates,articleDates:article?.dates||[]});continue;}
  const dateField=structuredMatch?'P585/P580':article.evidence.find(x=>x.date===row.date).field;
  all.push({date:row.date,title:row.title+(dateField.startsWith('선고')?' (선고)':''),dateField,...(qid?{qid}:{}),source:structuredMatch?'wikidata':'wikipedia',url:structuredMatch?`https://www.wikidata.org/wiki/${qid}`:`https://ko.wikipedia.org/w/index.php?oldid=${article.revision}`,corroboration:`https://ko.wikipedia.org/w/index.php?oldid=${row.revision}`,license:'CC-BY-SA-4.0',verification:structuredMatch?'wikidata-wikipedia-exact-day':'wikipedia-infobox-date-with-references'});sourceYears[row.year].verifiedWiki++;
}
const events=[],coverage=[];
for(let year=1950;year<=2025;year++){
  const candidates=all.filter(r=>+r.date.slice(0,4)===year);const rows=select(candidates);
  for(const r of rows){r.id=`kr-${year}-${sha(r.topic).slice(0,10)}`;if(r.milestones.length===1)delete r.milestones;events.push(r);}
  coverage.push({year,...sourceYears[year],selected:rows.length,shortfall:Math.max(0,5-rows.length),status:rows.length<5?'below-target':'target-met',note:year===2003?'공식 연표 2월까지, 이후 Wikidata 보완':rows.length<5?'검증 가능한 날짜/사건 후보 부족; 임의 보충 안 함':''});
}
const keys=new Set();for(const e of events){if(keys.has(e.id)||!validDate(e.date)||!e.url||!e.title)throw Error('최종 데이터 무결성 오류');keys.add(e.id);}
await fs.writeFile(path.join(out,'events.json'),JSON.stringify(events)+'\n');
const report={schemaVersion:1,period:[1950,2025],targetPerYear:[5,15],cap:10,selectionVersion:1,count:events.length,bytes:Buffer.byteLength(JSON.stringify(events)+'\n'),sha256:sha(JSON.stringify(events)+'\n'),verificationCounts:Object.fromEntries([...new Set(events.map(x=>x.verification))].map(k=>[k,events.filter(x=>x.verification===k).length])),coverage,excluded,failures,sources:receipts};
await fs.writeFile(path.join(out,'validation.json'),JSON.stringify(report,null,2)+'\n');
const periods=[[1950,1959],[1960,1969],[1970,1979],[1980,1989],[1990,1999],[2000,2009],[2010,2019],[2020,2025]];
const lines=periods.map(([a,b])=>{const c=coverage.filter(x=>x.year>=a&&x.year<=b);return `| ${a}~${b} | ${c.reduce((s,x)=>s+x.selected,0)} | ${c.filter(x=>x.selected>0).length}/${c.length} | ${c.filter(x=>x.selected>=5).length}/${c.length} |`;});
const summary=`\n\n## 이 스냅샷의 검증 결과\n\n총 ${events.length}개 묶음, events.json ${report.bytes} bytes. ${coverage.filter(x=>!x.shortfall).length}/76개 연도가 최소 5건 충족. 소스 실패 ${failures.length}건.\n\n| 구간 | 사건 묶음 | 1건 이상 연도 | 5건 이상 연도 |\n|---|---:|---:|---:|\n${lines.join('\n')}\n\n5건 미만 연도(연도:건수): ${coverage.filter(x=>x.shortfall).map(x=>`${x.year}:${x.selected}`).join(', ')||'없음'}.\n\nSHA-256: ${report.sha256}\n`;
await fs.writeFile(path.join(out,'README.md'),await fs.readFile(path.join(ROOT,'tools/history/README.md'),'utf8')+summary);
await fs.copyFile(path.join(ROOT,'tools/history/sources.json'),path.join(out,'sources.json'));
console.log(JSON.stringify({count:events.length,bytes:report.bytes,yearsAtTarget:coverage.filter(x=>!x.shortfall).length,belowTarget:coverage.filter(x=>x.shortfall).map(x=>`${x.year}:${x.selected}`),failures:failures.length,requests}));
if(failures.length)process.exitCode=2;
