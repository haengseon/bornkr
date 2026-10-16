// Playwright 실측: 가족/일상 카드 배치, 펼침/내역 클릭, 실제 결정과 결과의 공간·제어부.
import assert from 'node:assert/strict';
import { launch, startServer, openPage, saveJson, OUT } from '../e2e/helpers.mjs';
const browser = await launch(), srv = await startServer(), results = [];
const adult = async page => page.evaluate(async () => {
  const E = await import('/src/engine/index.js'), { startNew } = await import('/src/ui/play.js'), { S } = await import('/src/ui/dom.js');
  const L = E.newLife({ seed: 2 });
  while (L.alive && (L.age < 35 || L.pending)) L.pending ? E.choose(L, L.pending.defaultId) : E.advanceYear(L);
  if (!L.alive) throw Error('검증 생애가 성년 전에 종료됨');
  S.settings.auto = false; startNew(L);
});
const measure = () => {
  const card = document.querySelector('[data-card="daily"]'), asset = document.querySelector('[data-card="asset"]');
  const c = card.getBoundingClientRect(), f = asset.getBoundingClientRect(), head = card.querySelector('.pcard__sum').getBoundingClientRect();
  return { assetNext: asset.nextElementSibling === card, sameWidth: Math.abs(c.width-f.width)<1,
    shown: !card.hidden && c.height > 0, headerHeight: head.height,
    nestedSections: card.querySelectorAll('section,details,h2').length,
    pageOverflow: document.documentElement.scrollWidth > innerWidth,
    cardOverflow: card.scrollWidth > card.clientWidth + 1 };
};
try {
  for (const [w,h] of [[320,740],[390,844],[768,1024],[1366,900]]) {
    const page = await openPage(browser,srv.url,{w,h,clock:true,noAutoMajor:true,url:'?motion=off&splash=0'}), errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await adult(page); await page.click('[data-act="pause"]'); await page.clock.runFor(100);
    const timeline = await page.evaluate(()=>{const r=document.querySelector('.feed__year')?.getBoundingClientRect(),bar=document.querySelector('.lifebar').getBoundingClientRect();return {top:r?.top,bottom:r?.bottom,barTop:bar.top,title:!!document.querySelector('.feed-tools'),scroll:scrollY};});
    assert.ok(timeline.top>=0 && timeline.top<timeline.barTop-40,JSON.stringify(timeline));
    assert.equal(timeline.title,false); assert.equal(timeline.scroll,0);
    await page.screenshot({path:`${OUT}/daily-timeline-${w}.png`});
    for(const tab of ['traits','issues','news','peers']) {
      await page.click('.life-menu > summary'); await page.click(`.life-menu [data-tab="${tab}"]`);
      assert.ok(await page.locator('.sheet').count());
      await page.locator('.sheet__close').last().click(); await page.clock.runFor(200);
    }
    await page.click('.life-menu > summary'); await page.click('.life-menu [data-history="family"]');
    assert.equal(await page.locator('.family-history').count(),1);
    await page.locator('.history-sheet .sheet__close').click(); await page.clock.runFor(200);
    assert.equal(await page.locator('.profile-panel,[data-act="profile"]').count(),0);
    for(const kind of ['home','job','asset']) assert.equal(await page.locator(`[data-card="${kind}"]`).isVisible(),true);
    assert.equal(await page.locator('[data-card="family"]').count(),0);
    assert.equal(await page.locator('.life-menu__items button').count(),5);
    const r={w,h,timeline,card:await page.evaluate(measure)};
    assert.equal(r.card.assetNext,true); assert.equal(r.card.sameWidth,true); assert.equal(r.card.shown,true);
    assert.equal(r.card.headerHeight,32);
    assert.equal(r.card.nestedSections,0); assert.equal(r.card.pageOverflow,false); assert.equal(r.card.cardOverflow,false);
    if(w<600) { await page.click('[data-card-toggle="daily"]'); assert.equal(await page.getAttribute('[data-card-toggle="daily"]','aria-expanded'),'true'); }
    await page.locator('[data-card="daily"]').scrollIntoViewIfNeeded();
    await page.screenshot({path:`${OUT}/daily-layout-${w}.png`});
    await page.click('[data-history="daily"]');
    assert.equal(await page.locator('.history-sheet').count(),1);
    await page.click('.history-sheet .sheet__close'); await page.clock.runFor(200);
    await page.evaluate(async()=>{
      const E=await import('/src/engine/index.js'),{S}=await import('/src/ui/dom.js'),{runChoice}=await import('/src/ui/play.js');
      for(let i=0;i<60 && S.L.alive && !S.L.pending;i++) E.advanceYear(S.L);
      if(!S.L.pending) throw Error('실제 결정 생성 실패');
      S.L.pending.major=true;
      void runChoice(S.L.pending,S.run);
    });
    await page.clock.runFor(150);
    r.choice=await page.evaluate(()=>{const e=document.querySelector('.sheet.choice'),f=e.querySelector('.choice__foot'),ring=f.querySelector('.ring');return {height:e.offsetHeight,footHeight:f.offsetHeight,ringWidth:ring.offsetWidth,bottomGap:e.getBoundingClientRect().bottom-f.getBoundingClientRect().bottom,explanations:e.querySelectorAll('.choice__hint,.choice__status').length,overflow:e.scrollWidth>e.clientWidth+1};});
    assert.equal(r.choice.explanations,0); assert.ok(r.choice.ringWidth<=32); assert.ok(r.choice.bottomGap<=1); assert.equal(r.choice.overflow,false);
    await page.screenshot({path:`${OUT}/daily-choice-${w}.png`});
    await page.locator('.sheet.choice .option:not([disabled])').first().click(); await page.clock.runFor(200);
    r.result=await page.evaluate(()=>{const e=document.querySelector('.sheet.choice.is-resolved'),f=e?.querySelector('.choice__foot'),ok=e?.querySelector('.choice__ok');return e?{height:e.offsetHeight,bottomGap:e.getBoundingClientRect().bottom-f.getBoundingClientRect().bottom,ok:!!ok,buttonWidth:ok?.offsetWidth,availableWidth:f.clientWidth-parseFloat(getComputedStyle(f).paddingLeft)-parseFloat(getComputedStyle(f).paddingRight),explanations:e.querySelectorAll('.choice__hint,.choice__status').length}:null;});
    assert.ok(r.result?.ok); assert.ok(r.result.bottomGap<=1); assert.equal(r.result.explanations,0); assert.deepEqual(errors,[]);
    assert.ok(r.result.buttonWidth>=r.result.availableWidth-1);
    await page.screenshot({path:`${OUT}/daily-result-${w}.png`});
    await page.click('.choice__ok'); await page.clock.runFor(250);
    await page.evaluate(async()=>{const E=await import('/src/engine/index.js'),{S,routes}=await import('/src/ui/dom.js');const L=E.newLife({seed:2});E.runToEnd(L);S.L=L;S.sum=E.summarize(L);S.settings.hideSensitiveCause=false;routes.death();});
    await page.clock.runFor(400);
    r.death=await page.evaluate(()=>{const e=document.querySelector('.dcine__details'),r=e.getBoundingClientRect();return {text:e.textContent,top:r.top,bottom:r.bottom,width:r.width,viewport:innerWidth};});
    assert.match(r.death.text,/사망 원인/); assert.match(r.death.text,/2024년 전국 사망자 중 암 전체 24\.8%/); assert.match(r.death.text,/통계청/);
    assert.ok(r.death.top>=0 && r.death.bottom<=h && r.death.width<=w);
    await page.screenshot({path:`${OUT}/daily-death-${w}.png`});
    await page.evaluate(async()=>{const {S,routes}=await import('/src/ui/dom.js');S.settings.hideSensitiveCause=true;routes.death();});
    assert.equal(await page.locator('.dcine__details').count(),0);
    results.push(r); console.log(JSON.stringify(r)); await page.ctx.close();
  }
  saveJson('daily-layout.json',results);
} finally { srv.stop(); await browser.close(); }

