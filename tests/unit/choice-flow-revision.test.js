import test from 'node:test';
import assert from 'node:assert/strict';
import { newLife, replay, runToEnd } from '../../src/engine/index.js';
import { makeCtx, needsPlayerDecision, MAJOR } from '../../src/engine/life.js';
import { eventById } from '../../src/engine/events.js';
import { fxEffects, decorate } from '../../src/engine/milestones.js';
import { isBigEntry, isMajorEntry } from '../../src/ui/major.js';
import { deathStory } from '../../src/engine/deathstory.js';

test('일상은 자동 진행하며 중대 결정 슬롯을 사용하지 않는다', () => {
  const L = newLife({ seed: 42 });
  const count = JSON.stringify(L.stageChoices);
  makeCtx(L).ask({ eventId: 'early.first.drawing', options: [{id:'house',label:'집'},{id:'monster',label:'괴물'}], defaultId: 'house' });
  assert.equal(L.pending, null);
  assert.equal(L.choices.at(-1).auto, true);
  assert.equal(L.choices.at(-1).routine, true);
  assert.equal(JSON.stringify(L.stageChoices), count);
  assert.equal(L.yr.asked, false);
  assert.equal(needsPlayerDecision({eventId:'sys.fam.marry',major:true}), true);
  assert.equal(needsPlayerDecision({eventId:'dec.hobby.spend',major:true}), false);
  assert.equal(needsPlayerDecision({eventId:'sys.crisis.family_confirm'}), true);
  assert.equal(needsPlayerDecision({eventId:'school.low.mood',sensitive:'illness'}), true);   // 민감 선택은 항상 직접 묻는다
});

test('자동 일상 결과는 큰 팝업이 아니다', () => {
  const e = {kind:'choice',id:'early.first.drawing',auto:true,major:true};
  assert.equal(isBigEntry(e), false);
  assert.equal(isMajorEntry(e), false);
});

test('복귀·직종 전환은 표시 보장 대상이다', () => {
  for(const id of ['sys.job.return','sys.job.reemploy','sys.job.transition','sys.job.business_close']) assert.ok(MAJOR.test(id));
});

test('선택지의 작은 변화와 크기 차이도 표시 자료에 남는다', () => {
  const a = fxEffects({fx:{stats:{happiness:1,wealth:-2}}});
  assert.equal(a.find(e=>e.key==='happiness').delta,1);
  assert.equal(a.find(e=>e.key==='wealth').delta,-2);
  const full={eventId:'sys.invest.plan',timeoutMs:20000,options:[{id:'safe'},{id:'stock'}]};
  decorate(newLife({seed:1}),full);
  assert.deepEqual(full.options.map(o=>o.effects),[[],[]]);
  assert.notEqual(full.options[0].hint,full.options[1].hint);
});

test('일상 대응은 시간과 돈의 다른 방향을 만들고 상환은 이익을 복제하지 않는다', () => {
  const side = eventById('dec.side.job').choice.options;
  assert.ok(side.find(o=>o.id==='side').fx.stats.leisure < 0);
  assert.ok(side.find(o=>o.id==='save').fx.stats.leisure > 0);
  const repay=eventById('dec.loan.prepay').choice.options;
  assert.ok(repay.find(o=>o.id==='prepay').fx.stats.happiness > 0);
  assert.ok(repay.find(o=>o.id==='save').fx.stats.happiness < 0);
});

test('출생 의료 접근 지수는 사망 경위에 삽입하지 않는다', () => {
  const L=newLife({seed:1});
  L.birth.healthAccess=1; L.birth.urban=false;
  L.death={year:L.year,age:0,cause:'perinatal',causeLabel:'주산기 질환'};
  assert.ok(!deathStory(L).chain.some(t=>t.includes('병원')));
});

test('모델 1/2 자동 일상 기록이 있어도 수동 선택을 정확히 재생한다', () => {
  for(const modelVersion of [1,2]) {
    const L=newLife({seed:3,modelVersion});
    runToEnd(L,(life,req)=>req.options[(life.age+1)%req.options.length].id);
    assert.ok(L.choices.some(c=>c.routine));
    const copy=replay(3,L.choices,{modelVersion});
    assert.deepEqual(copy.log,L.log);
    assert.deepEqual(copy.choices,L.choices);
  }
});


// 특정 시드의 한 장면 대신 여러 시드의 모든 취업 복귀를 본다(가계 엔진 변경으로 생애 경로가 바뀌어도 의도를 검사)
test('모델2 취업 복귀는 같은 해 후속 뉴스보다 먼저 보인다', () => {
  let n=0;
  for(let seed=1;seed<=20;seed++) {
    const L=runToEnd(newLife({seed,modelVersion:2}));
    L.log.forEach((e,at)=>{
      if(e.id!=='sys.job.return') return;
      n++;
      assert.equal(!!e.quiet,false);
      const news=L.log.findIndex(x=>x.kind==='news' && x.age===e.age);
      assert.ok(news < 0 || at < news, `seed ${seed} age ${e.age}`);
    });
  }
  assert.ok(n > 0);
});
