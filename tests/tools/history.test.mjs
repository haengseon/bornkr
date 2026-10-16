import test from 'node:test';
import assert from 'node:assert/strict';
import {parseArchives,parseWiki,select,validDate,articleDates} from '../../tools/history/core.mjs';

test('official table: rowspan records are not extra events; second same-day event retains date',()=>{
 const html='<tr><td class="days" rowspan="3"><a id="search_1960_4_19"></a>4월 19일</td><td rowspan="2">4.19 혁명 발발</td><td rowspan="2">관련 기록물의 제목</td></tr><tr></tr><tr><td rowspan="1">다른 사건</td><td><a>다른 기록</a></td></tr>';
 const r=parseArchives(html,1960);assert.equal(r.length,2);assert.deepEqual(r.map(x=>x.title),['4.19 혁명 발발','다른 사건']);assert.ok(r.every(x=>x.date==='1960-04-19'));
});
test('invalid calendar date and non-event sections cannot enter candidates',()=>{
 assert.equal(validDate('2025-02-29'),false);assert.equal(validDate('2024-02-29'),true);
 const wiki='== 사건 ==\n* [[3월 1일]]\n** [[대한민국]]에서 [[2025년 대한민국 산불]] 발생\n== 탄생 ==\n* [[4월 1일]] - [[대한민국 선거]]';
 assert.equal(parseWiki(wiki,2025,1).length,1);
 const bold="== 사건 ==\n* [[4월 15일]] - 다른 일\n* '''[[4월 16일]] - [[세월호 침몰 사고]] 발생'''";
 assert.equal(parseWiki(bold,2014,1)[0].date,'2014-04-16');
});
test('group a war and preserve milestones; remove commemorations; never pad years',()=>{
 const row=(date,title)=>({date,title,url:'https://example.org',source:'archives'});
 const r=select([row('1950-06-25','북한, 38 도선 전역에서 남침'),row('1950-09-15','인천 상륙 작전'),row('1950-05-30','국회의원 선거'),row('1950-07-01','전쟁 1주년 기념식')]);
 assert.equal(r.length,2);assert.equal(r.find(x=>x.topic==='korean-war').milestones.length,2);assert.equal(select([]).length,0);
 assert.equal(select(Array.from({length:20},(_,i)=>row('2000-01-01','사건 '+i))).length,10);
});
test('aliases for the Daegu disaster merge across official/Wikimedia titles',()=>{
 const r=select([{date:'2003-02-18',title:'대구지하철 전동차 방화참사 발생',url:'a'},{date:'2003-02-18',title:'대구 지하철 화재 참사',url:'b',qid:'Q1'}]);assert.equal(r.length,1);assert.equal(r[0].milestones.length,2);
});
test('date corroboration is restricted to structured date fields with reference evidence',()=>{
 assert.deepEqual(articleDates('|날짜 = [[2014년]] [[4월 16일]]\n<ref>source</ref>'),['2014-04-16']);
 assert.deepEqual(articleDates('|날짜 = {{시작 날짜|2014|4|16}}\n{{각주}}'),['2014-04-16']);
 assert.deepEqual(articleDates('본문 2014년 4월 16일 <ref>source</ref>'),[]);
 assert.deepEqual(articleDates('|날짜 = 2014년 4월 16일'),[]);
 assert.deepEqual(articleDates('|날짜 = 2025년 2월 29일\n<ref>source</ref>'),[]);
 assert.deepEqual(articleDates('|날짜 = 2014년 4월 16일<ref>확인날짜=2024-04-21</ref>\n== 경과 ==\n|날짜 = 2020년 1월 1일'),['2014-04-16']);
 assert.deepEqual(articleDates('|선고일자 = 2025년 4월 4일\n<ref>source</ref>'),['2025-04-04']);
});
