// E2E-1 전체 흐름(가짜 시계): 홈 → 19세 안내 → 출생 신고서 → 진행 → 선택 3경로 → 비교 카드 → 사망 → 결산 → 공유 카드 3종
//        → 기록관(재열람 일치) → 통계 도감 → 설정 → 도움 자원 시트.  UI-SPEC §2·§5·§7, 00-plan 검증 기준.
//        2026-10-19 개편 반영: 게임 화면 광고 영역 없음(5ddecb9), 기본 2배속·읽기 시간 비례 카운트다운(HOOK-30S P0-4, C1),
//        결과·카드는 [확인] 없이 읽기 시간 뒤 닫힘(F-3·C5), 마지막 해 [마지막 페이지로] → 검정 페이지 버튼 1개로 결산(F-9).
import test from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import {
  startServer, launch, openPage, appErrors, screen, waitScreen, shot, Sim, seedInit, SEEDS, checks, SHOTS, saveJson,
  RE_RANK, RE_MONEY, RE_JOBRANK, RE_CAUSE_SENS, forbiddenHits,
} from './helpers.mjs';

let srv, br;
test.before(async () => { srv = await startServer(); br = await launch(); });
test.after(async () => { await br?.close(); srv?.stop(); });

const choiceInfo = page => page.evaluate(() => {
  const el = document.querySelector('.sheet.choice');
  if (!el) return null;
  return {
    done: !!el.querySelector('.options.is-done'),
    key: (el.querySelector('.choice__meta')?.textContent || '') + '|' + (el.querySelector('.choice__prompt')?.textContent || ''),
    num: el.querySelector('.ring__num')?.textContent ?? null,
    n: el.querySelectorAll('[data-opt]').length,
  };
});

// 결과 블록(일반 .choice__result / 중대 .reveal)의 읽기 시간 — 앱 readMs와 같은 셈(접힌 details·sr-only 제외, 초당 9자, 최소 3초).
// 시트가 닫히기 전 마지막으로 본 값을 window.__rms 에 남긴다.
const RESULT_MS = () => { const r = document.querySelector('.sheet.choice .choice__result, .sheet.choice .reveal'); if (r) { const c = r.cloneNode(true); c.querySelectorAll('details, .sr-only').forEach(x => x.remove()); window.__rms = Math.max(3000, c.textContent.replace(/\s+/g, '').length / 9 * 1000); } return !document.querySelector('.sheet.choice'); };

// 선택 시트 하나를 처리하며 진행. onChoice(k, sim)가 시트를 끝낸다. 비교 카드 열림/닫힘 시각을 기록.
async function driveLife(page, sim, { onChoice, step = 250, max = 20 * 60_000, onCompare }) {
  const out = { choices: [], compare: [] };
  let k = 0, cmpOpenAt = null, lastKey = null, t0 = sim.t;
  while (sim.t - t0 < max) {
    const s = await screen(page);
    if (s !== 'life') return Object.assign(out, { screen: s });
    if (await page.$('[data-act="last-record"]')) return Object.assign(out, { screen: 'life-end' });
    const ci = await choiceInfo(page);
    if (ci && !ci.done && ci.key !== lastKey) { lastKey = ci.key; k++; out.choices.push({ k, key: ci.key, at: sim.t }); await onChoice(k, sim, ci); continue; }
    const cmp = await page.evaluate(() => !!document.querySelector('.compare'));
    if (cmp && cmpOpenAt == null) { cmpOpenAt = sim.t; if (onCompare) await onCompare(sim); }
    if (!cmp && cmpOpenAt != null) { out.compare.push({ openAt: cmpOpenAt, closeAt: sim.t, ms: sim.t - cmpOpenAt }); cmpOpenAt = null; }
    await sim.adv(step);
  }
  throw new Error('driveLife 시간 초과');
}

test('E2E-1 전체 흐름(가짜 시계, 390x844)', { timeout: 900_000 }, async t => {
  const c = checks('flow');
  const page = await openPage(br, srv.url, { clock: true, init: seedInit(SEEDS.plain) });
  const sim = new Sim(page);
  await page.ctx.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: srv.url.replace(/\/$/, '') });

  // ── S01 홈
  await t.test('S01 홈', async () => {
    await waitScreen(page, 'home');
    const d = await page.evaluate(() => ({
      h1: document.querySelector('h1')?.textContent, ads: document.querySelectorAll('.ad-slot').length,
      resume: !!document.querySelector('.resume'), menu: [...document.querySelectorAll('.menu .linkrow')].map(b => b.querySelector('.linkrow__title').textContent),
      cta: document.querySelector('.actionbar .btn')?.textContent, facts: document.querySelectorAll('.facts > div').length,
      archiveDesc: document.querySelector('[data-go="archive"] .linkrow__desc')?.textContent,
      focus: document.activeElement?.tagName, title: document.title, lang: document.documentElement.lang,
    }));
    c('S01 h1 = 태어나보니 대한민국', d.h1 === '태어나보니 대한민국', d.h1);
    c('S01 광고 영역 없음(게임 화면 광고 제거 5ddecb9, 광고는 콘텐츠 페이지만 — HOOK-30S §3)', d.ads === 0, d.ads);
    c('S01 이어 하기 없음(첫 방문)', !d.resume);
    c('S01 메뉴 3개 기록관·통계 도감·설정', d.menu.join() === '기록관,통계 도감,설정', d.menu.join());
    c('S01 CTA 태어나기', d.cta === '태어나기', d.cta);
    c('S01 기록 0개 문구', /아직 기록이 없습니다/.test(d.archiveDesc), d.archiveDesc);
    c('S01 첫 포커스 h1', d.focus === 'H1', d.focus);
    c('html lang=ko', d.lang === 'ko');
    await shot(page, 'flow-01-home');
  });

  // ── S02 19세 안내
  await t.test('S02 19세 안내', async () => {
    await page.click('[data-go="born"]');
    await waitScreen(page, 'gate');
    const d = await page.evaluate(() => ({ items: document.querySelectorAll('.notice-list li').length, btns: [...document.querySelectorAll('.actionbar .btn')].map(b => b.textContent), focus: document.activeElement?.tagName, ads: document.querySelectorAll('.ad-slot').length }));
    c('S02 안내 3항', d.items === 3, d.items);
    c('S02 버튼 홈으로 / 확인하고 태어나기', d.btns.join() === '홈으로,확인하고 태어나기', d.btns.join());
    c('S02 첫 포커스 h1', d.focus === 'H1', d.focus);
    c('S02 광고 없음', d.ads === 0);
    await shot(page, 'flow-02-gate');
    await page.click('[data-go="home"]'); await waitScreen(page, 'home');
    await page.click('[data-go="born"]'); await waitScreen(page, 'gate');
    await page.click('[data-go="gateOk"]'); await waitScreen(page, 'birth');
    const seen = await page.evaluate(() => JSON.parse(localStorage.getItem('hj.v1.settings') || '{}').seen19);
    c('seen19 저장', seen === true, seen);
  });

  // ── S03 출생 신고서
  await t.test('S03 출생 신고서', async () => {
    await sim.adv(200);
    await page.click('.cine__tap');            // 출생 시퀀스 건너뛰기 → 출생 카드
    await sim.adv(600);
    const d = await page.evaluate(() => ({
      rows: [...document.querySelectorAll('.form__row')].map(r => r.querySelector('dt').textContent),
      vals: [...document.querySelectorAll('.form__value')].map(r => r.textContent.trim()),
      peers: document.querySelectorAll('[data-peers] .peer').length,
      dots: document.querySelector('.dots')?.getAttribute('aria-label'),
      no: document.querySelector('.doc__no dd')?.textContent, note: document.querySelector('.actionbar__note')?.textContent.trim(),
      btns: [...document.querySelectorAll('.actionbar .btn')].map(b => b.textContent), story: !!document.querySelector('.doc__lede'),
      text: document.querySelector('.birth').innerText,
    }));
    c('S03 서식 8행(돌봄 행 삭제)', d.rows.join() === '성명,출생일,출생지,가구 형편,부모,주거,의료 접근,시대', d.rows.join());
    c('S03 모든 값 비어 있지 않음', d.vals.every(v => v && !/undefined|NaN|null/.test(v)), d.vals.join(' / '));
    c('S03 같은 날 태어난 3명', d.peers === 3, d.peers);
    c('S03 소득 점 aria-label', /다섯 단계 중/.test(d.dots || ''), d.dots);
    c('S03 접수번호 형식', /^\d{4}-\d{4}-\d{4}$/.test(d.no), d.no);
    c('S03 자동 시작 없음 안내', /눌러 주세요/.test(d.note), d.note);
    c('S03 버튼 신고서 공유 / 삶을 시작하기', d.btns.join() === '신고서 공유,삶을 시작하기', d.btns.join());
    c('S03 출생 서술 문단', d.story);
    c('S03 백분위·순위·분위 숫자 텍스트 없음', !RE_RANK.test(d.text) && !/\d\s*분위/.test(d.text), '');
    await shot(page, 'flow-03-birth');
    // 출처 보기 시트
    await page.click('[data-act="src"]');
    await page.waitForSelector('.sheet');
    const sh = await page.evaluate(() => ({ items: document.querySelectorAll('.sheet .src').length, appInert: document.querySelector('#app').inert, locked: document.body.classList.contains('is-locked') }));
    c('S03 출처 시트: 출처 1개 이상', sh.items > 0, sh.items);
    c('S03 시트 열림 → #app inert + 스크롤 잠금', sh.appInert && sh.locked, JSON.stringify(sh));
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => !document.querySelector('.sheet'));
    const back = await page.evaluate(() => ({ focus: document.activeElement?.dataset?.act, inert: document.querySelector('#app').inert }));
    c('S03 Esc 닫힘 → 여는 버튼으로 포커스 복귀', back.focus === 'src' && !back.inert, JSON.stringify(back));
    // 입력(포인터)하면 자동 시작 취소
    await sim.adv(1000);
    await page.mouse.click(5, 300);
    await sim.adv(20000);
    c('S03 무입력 20초 뒤에도 출생 화면(자동 시작 없음)', (await screen(page)) === 'birth', await screen(page));
    await page.click('[data-act="start"]');
    await waitScreen(page, 'life');
  });

  // ── S04 진행 + S06 선택 3경로 + S07 비교 카드
  await t.test('S04~S07 진행·선택·비교', async () => {
    const hud = await page.evaluate(() => ({
      h1: document.querySelector('h1.sr-only')?.textContent, age: document.querySelector('[data-hud=age]').textContent,
      stages: document.querySelectorAll('.chap__seg').length, stats: document.querySelectorAll('.sbar .sbar__i').length,
      tabs: [...document.querySelectorAll('.life-menu__items button')].map(b => b.textContent), speed: [...document.querySelectorAll('[data-speed]')].map(b => b.getAttribute('aria-pressed')),
      auto: document.querySelector('.lifebar [data-act=auto]').getAttribute('aria-checked'), pause: document.querySelector('[data-act=pause]').textContent, ads: document.querySelectorAll('.ad-slot').length,
    }));
    c('S04 h1.sr-only 생애 진행', hud.h1 === '생애 진행');
    c('S04 챕터 10 · 상단 지표 6 · ⋯ 메뉴 5(가족·성향·관심사·뉴스·동갑내기)', hud.stages === 10 && hud.stats === 6 && hud.tabs.join() === '가족,성향,관심사,뉴스,동갑내기', JSON.stringify(hud));
    c('S04 기본 배속 2× 선택(HOOK-30S P0-4)', hud.speed.join() === 'false,true,false,false,false', hud.speed.join());
    c('S04 광고 없음', hud.ads === 0);
    c('S04 자동결정 기본 켬(설정 미저장)', hud.auto === 'true', hud.auto);
    await page.click('.lifebar [data-act="auto"]');          // 직접·무응답 경로를 재려고 끈다(k===3에서 다시 켬)
    await shot(page, 'flow-04-life-start');
    const modes = { direct: null, timeout: null, auto: null };
    const res = await driveLife(page, sim, {
      onChoice: async (k, s, ci) => {
        if (k === 1) {                       // 직접 선택 · 링 멈춤 · 하단 바 일시정지(C2) · 결과 읽기 시간(C5)
          await shot(page, 'flow-05-choice');
          const first = await page.evaluate(() => {
            const el = document.querySelector('.sheet.choice');
            return { defaults: el.querySelectorAll('.option.is-default').length, defTag: el.querySelector('.option.is-default .tag')?.textContent, labels: [...el.querySelectorAll('.option__label')].map(x => x.textContent), hints: [...el.querySelectorAll('.option__hint')].map(x => x.textContent), ring: el.querySelector('.ring__num').textContent, chars: el.querySelector('.sheet__body').textContent.replace(/\s+/g, '').length, activeEl: document.activeElement?.className };
          });
          c('S06 기본 선택지 1개 + 태그 기본', first.defaults === 1 && first.defTag === '기본', JSON.stringify(first));
          c('S06 선택지 라벨 ≤16자(D R2)', first.labels.every(l => l.length <= 16), first.labels.join('|'));
          c('S06 힌트 ≤16자(있으면)', first.hints.every(l => l.length <= 16), first.hints.join('|'));
          // 카운트다운 = max(12초, 본문 글자 수/초당 9자 + 3초), 최대 40초(C1). 첫 틱이 지났을 수 있어 1초 여유
          const want = Math.min(40, Math.max(12, Math.ceil(first.chars / 9 + 3)));
          c('S06 링 시작값 = 글자 수 비례(최소 12초·최대 40초)', +first.ring >= 12 && +first.ring <= 40 && Math.abs(+first.ring - want) <= 1, `ring ${first.ring} / want ${want} (${first.chars}자)`);
          c('S06 첫 포커스 선택 질문(h2)', /choice__prompt/.test(first.activeEl), first.activeEl);
          await s.adv(2000);
          const n1 = await page.evaluate(() => document.querySelector('.ring__num').textContent);
          await page.click('.ring');
          await s.adv(5000);
          const n2 = await page.evaluate(() => ({ num: document.querySelector('.ring__num').textContent, pressed: document.querySelector('.ring').getAttribute('aria-pressed') }));
          c('S06 링 눌러 멈춤(숫자 자리 "멈춤", aria-pressed)', n2.num === '멈춤' && n2.pressed === 'true', `${n1} → ${JSON.stringify(n2)}`);
          await page.click('.ring');
          await s.adv(500);
          const k0 = await page.evaluate(() => document.querySelector('.ring').style.getPropertyValue('--k'));
          await page.click('.lifebar [data-act="pause"]');           // 시트가 떠 있어도 하단 바는 눌린다(C2)
          await s.adv(10_000);
          const p1 = await page.evaluate(() => ({ num: document.querySelector('.ring__num')?.textContent, k: document.querySelector('.ring')?.style.getPropertyValue('--k'), open: !!document.querySelector('.sheet.choice .ring') }));
          c('S06 하단 바 일시정지 중 카운트다운 정지(숫자 Ⅱ, 10초 지나도 링 그대로)', p1.open && p1.num === 'Ⅱ' && p1.k === k0, `${k0} → ${JSON.stringify(p1)}`);
          await page.click('.lifebar [data-act="pause"]');
          modes.direct = true;
          await page.click('[data-opt]:not(.is-default)');
          const done = await page.evaluate(() => ({ resolved: document.querySelector('.sheet.choice').classList.contains('is-resolved'), options: document.querySelectorAll('.sheet.choice .option').length, picked: document.querySelector('.picked dt')?.textContent + ':' + document.querySelector('.picked dd')?.textContent, ring: !!document.querySelector('.sheet.choice .ring'), result: !!document.querySelector('.choice__result, .reveal'), autoTag: [...document.querySelectorAll('.choice__result .tag, .reveal .tag')].some(t => t.textContent === '기본 행동') }));
          c('S06 선택 → 결과 상태(선택지 접힘 · "고른 행동" 1행 · 링 제거 · 결과 블록)', done.resolved && done.options === 0 && /^고른 행동:.+/.test(done.picked) && !done.ring && done.result, JSON.stringify(done));
          c('S06 직접 선택에는 "기본 행동" 태그 없음', !done.autoTag);
          await page.evaluate(RESULT_MS);
          const readMs = await page.evaluate(() => window.__rms);     // 결과는 읽기 시간(초당 9자, 최소 3초) 뒤 [확인] 없이 닫힌다(C5·F-3)
          await s.adv(2600);
          c('S06 결과 2.6초 뒤에도 아직 열림(최소 3초)', await page.evaluate(() => !!document.querySelector('.sheet.choice')));
          await s.adv(readMs - 2600 + 600);
          c('S06 결과 읽기 시간 뒤 저절로 닫힘', await page.evaluate(() => !document.querySelector('.sheet.choice')), `${readMs}ms`);
          const entry = await page.evaluate(() => { const e = document.querySelector('.entry--choice'); return e ? { text: e.textContent, auto: [...e.querySelectorAll('.tag')].some(x => x.textContent === '기본 행동') } : null; });
          c('S04 피드에 선택 기록(직접 → 기본 행동 태그 없음)', entry && !entry.auto, JSON.stringify(entry));
          await page.click('[data-speed="4"]');
          c('배속 4× 선택(aria-pressed)', await page.evaluate(() => document.querySelector('[data-speed="4"]').getAttribute('aria-pressed') === 'true'));
        } else if (k === 2) {                // 카운트다운 무응답 → 기본값
          const t0 = s.t;
          const def = await page.evaluate(() => document.querySelector('.option.is-default .option__label').textContent);
          const ring0 = await page.evaluate(() => +document.querySelector('.ring__num').textContent * 1000);
          await page.evaluate(() => { window.__rms = 0; });
          await s.until(RESULT_MS, { step: 250 });
          const dt = s.t - t0, rMs = await page.evaluate(() => window.__rms);
          const e = await page.evaluate(() => { const e = document.querySelector('.entry--choice'); return e ? { label: e.querySelector('.entry__label')?.textContent, auto: [...e.querySelectorAll('.tag')].some(x => x.textContent === '기본 행동') } : null; });
          modes.timeout = { ms: dt, def, e, ring0, rMs };
          c('S06 무응답: 링 시간(≥12초) + 결과 읽기 시간 뒤 기본값 처리', dt >= 12000 + 3000 - 1000 && dt <= ring0 + rMs + 750, `${dt}ms / ring ${ring0} / result ${rMs}`);
          c('S06 무응답 → 기본 행동 태그 + 기본 선택지가 반영', e?.auto && e.label === def, JSON.stringify({ def, e }));
        } else if (k === 3) {                // 자동결정 모드
          await page.click('.choice__foot [data-act="auto"]');
          const t0 = s.t;
          const sync = await page.evaluate(() => document.querySelector('.lifebar [data-act=auto]').getAttribute('aria-checked'));
          c('S06 자동결정 스위치 ↔ 하단 바 동기', sync === 'true', sync);
          await page.evaluate(() => { window.__rms = 0; });
          await s.until(RESULT_MS, { step: 100 });
          const dt = s.t - t0, rMs = await page.evaluate(() => window.__rms);
          c('S06 자동결정 1.2초 + 결과 읽기 시간', dt >= 1200 + rMs - 300 && dt <= 1200 + rMs + 500, `${dt}ms / result ${rMs}`);
          modes.auto = dt;
        } else {
          await s.until(() => !document.querySelector('.sheet.choice'), { step: 250 });
        }
      },
    });
    c('S07 비교 카드 자동 팝업 없음(하단 [동갑내기]로만 연다)', res.compare.length === 0, JSON.stringify(res.compare));
    c('S04 선택 3경로 모두 실행', !!modes.timeout && modes.auto != null && modes.direct != null, JSON.stringify(modes));
    c.note('driveLife', { choices: res.choices.length, compare: res.compare, modes });
    // 마지막 해: 자동결정이 켜져 있어도 사망 화면으로 저절로 넘어가지 않는다(직접 넘김)
    c('S08 마지막 해에서 멈추고 [마지막 페이지로] 표시', res.screen === 'life-end', res.screen);
    await sim.adv(30_000);
    c('S08 30초 지나도 진행 화면에 머묾', (await screen(page)) === 'life', await screen(page));
    await page.click('[data-act="last-record"]');
  });

  // ── S09 사망
  await t.test('S09 사망', async () => {
    await waitScreen(page, 'death');
    const d = await page.evaluate(() => ({
      text: document.querySelector('.death').innerText, ads: document.querySelectorAll('.ad-slot').length,
      focus: document.activeElement?.className, rec: JSON.parse(localStorage.getItem('hj.v1.records') || '[]').length, cur: localStorage.getItem('hj.v1.current'),
      btn: document.querySelector('.actionbar .btn')?.textContent, btns: document.querySelectorAll('.actionbar .btn').length, note: document.querySelector('.actionbar__note')?.textContent.trim(), sheets: document.querySelectorAll('.sheet').length,
      dcine: !!document.querySelector('[data-dcine]'), dcineText: document.querySelector('[data-dcine]')?.innerText.replace(/\n+/g, ' ') ?? '',
    }));
    c('S09 기록관 저장이 사망 화면보다 먼저(기록 1개)', d.rec === 1, d.rec);
    c('S09 이어 하기 저장 삭제(hj.v1.current)', d.cur == null, d.cur);
    c('S09 첫 포커스 h1', /death__name/.test(d.focus), d.focus);
    c('S09 "세상을 떠났습니다" 문구', /세상을 떠났습니다\./.test(d.text), d.text.replace(/\n/g, ' '));
    c('S09 광고 없음', d.ads === 0);
    c('S09 시트·공유 자동 열림 없음', d.sheets === 0);
    c('S09 직접 넘김 안내 + 버튼 1개 "살아온 날들 돌아보기"(F-9)', /직접 넘겨/.test(d.note) && d.btn === '살아온 날들 돌아보기' && d.btns === 1, `${d.note}/${d.btn}/${d.btns}`);
    c('S09 검정 마지막 페이지(dcine)에 사인 문구', d.dcine && /세상을 떠났습니다/.test(d.dcineText), d.dcineText.slice(0, 120));
    await shot(page, 'flow-07-death');
    await sim.adv(30_000);
    c('S09 자동으로 결산에 넘어가지 않음(30초)', (await screen(page)) === 'death', await screen(page));
    await page.click('[data-act="sum"]');
    c('S09 버튼 한 번으로 결산', (await screen(page)) === 'summary', await screen(page));
  });

  // ── S10 결산
  let live = {};
  await t.test('S10 결산', async () => {
    await waitScreen(page, 'summary');
    const d = await page.evaluate(() => ({
      focus: document.activeElement?.className, scroll: scrollY, ads: document.querySelectorAll('.ad-slot').length, sheets: document.querySelectorAll('.sheet,.scrim').length,
      main: document.querySelector('.verdict__main')?.textContent, epi: document.querySelector('.epi__title')?.textContent, paras: document.querySelectorAll('.verdict .epi__body p').length,
      closing: [...document.querySelectorAll('section[aria-labelledby=sum-closing] .metric')].map(m => m.querySelector('.metric__label').textContent + ':' + m.querySelector('.metric__value').textContent),
      issues: document.querySelectorAll('section[aria-labelledby=sum-issues] .metric').length,
      tl: [...document.querySelectorAll('.timeline .tl')].map(x => x.innerText.replace(/\n+/g, ' ')),
      peers: document.querySelectorAll('section[aria-labelledby=sum-peers] .peer').length, selfPeers: document.querySelectorAll('section[aria-labelledby=sum-peers] .peer .tag').length,
      cards: new Set([...document.querySelectorAll('[data-card]')].map(b => b.dataset.card)).size, more: [...document.querySelectorAll('.sum-more .linkrow__title')].map(b => b.textContent).join(), btns: [...document.querySelectorAll('.actionbar .btn')].map(b => b.textContent),
      full: (() => { const c = document.querySelector('.summary').cloneNode(true); c.querySelector('.stand')?.remove(); return c.innerText; })(), stand: !!document.querySelector('.summary .stand'), head: document.querySelector('.lifehead').innerText.replace(/\n/g, ' '),
    }));
    live = d;
    c('S10 첫 포커스 h1 · 스크롤 맨 위', /lifehead__name/.test(d.focus) && d.scroll === 0, `${d.focus}/${d.scroll}`);
    c('S10 광고 없음(전체)', d.ads === 0, d.ads);
    c('S10 공유 시트 자동 열림 없음', d.sheets === 0, d.sheets);
    c('S10 판정문 주문 + 회고문 제목·문단(이유 목록은 0ba9a1a에서 회고문으로 대체)', !!d.main && !!d.epi && d.paras >= 1, `${d.main} / ${d.epi} / ${d.paras}`);
    c('S10 결산 5지표', d.closing.length === 5, d.closing.join());
    c('S10 뉴스 10축', d.issues === 10, d.issues);
    c('S10 연표 6~16줄', d.tl.length >= 6 && d.tl.length <= 16, d.tl.length);
    c('S10 같은 날 4행 + 본인 1', d.peers === 4 && d.selfPeers === 1, `${d.peers}/${d.selfPeers}`);
    c('S10 카드 3종 + 하단 [같은 출생으로 다시][다시 태어나기](HOOK-30S P0-6)', d.cards === 3 && d.btns.join() === '같은 출생으로 다시,다시 태어나기', `${d.cards} ${d.btns}`);
    c('S10 [기록관]·[시대 선택해 태어나기]는 본문 맨 아래 링크', d.more === '기록관,시대 선택해 태어나기', d.more);
    const fh = forbiddenHits(d.full);
    // '이 생애의 위치'(.stand, 0ef8ffa)는 성인·비민감 사망에만 통계 비교 %를 보이는 의도된 섹션 — 그 밖의 결산 본문은 그대로 금지어 검사.
    // (UI-SPEC §5 S10 '백분위 금지'와 충돌: 보고서에 기재)
    c('S10 승패·백분위·순위·직급 서열 문구 없음(결산 본문, .stand 섹션·부정 안내문 제외)', fh.length === 0, fh.join(' | '));
    c.note('S10 이 생애의 위치(.stand) 섹션 표시', d.stand);
    c.note('S10 결산 화면 안 금액 표기(UI-SPEC은 "만 원" 허용, 카드·공유 문구는 금지)', (d.full.match(new RegExp(RE_MONEY, 'g')) || []).slice(0, 8));
    c('S10 느낌표·이모지 없음', !/!|[\u{1F300}-\u{1FAFF}☀-➿]/u.test(d.full), '');
    await shot(page, 'flow-08-summary-top');
    await shot(page, 'flow-08b-summary-full', { fullPage: true });
    await sim.adv(12000);
    c('S10 결산 직후 12초간 공유 시트·광고 강요 없음', await page.evaluate(() => !document.querySelector('.sheet') && !document.querySelector('.ad-slot')));
  });

  // ── S11 공유 카드 3종
  await t.test('S11 공유 카드 3종', async () => {
    for (const kind of ['birth', 'verdict', 'timeline']) {
      await page.evaluate(() => { window.__qa.canvas = []; });
      await page.click(`[data-card="${kind}"]`);
      await page.waitForSelector('.sheet');
      let ok = false;
      for (let i = 0; i < 40 && !ok; i++) {
        ok = await page.evaluate(() => (document.querySelector('.share__img')?.src || '').startsWith('data:image/png'));
        if (!ok) { await sim.adv(300); await page.waitForTimeout(100); }
      }
      c(`S11 ${kind} 카드 이미지 렌더`, ok);
      const d = await page.evaluate(() => {
        const im = document.querySelector('.share__img');
        return { w: im.naturalWidth, h: im.naturalHeight, alt: im.alt, text: document.querySelector('.share__text').value, hint: document.querySelector('.share__hint')?.textContent, tabs: document.querySelectorAll('.seg [data-kind]').length,
          copyBtn: !!document.querySelector('[data-act=copy]'), canvas: window.__qa.canvas.slice(), src: im.src };
      });
      c(`S11 ${kind} 1080×1350`, d.w === 1080 && d.h === 1350, `${d.w}x${d.h}`);
      c(`S11 ${kind} alt 있음`, d.alt.length > 5, d.alt);
      c(`S11 ${kind} "이미지를 길게 눌러 저장" 안내 + 문구 복사 버튼`, /길게 눌러 저장/.test(d.hint) && d.copyBtn);
      c(`S11 ${kind} 종류 탭 3개`, d.tabs === 3, d.tabs);
      const joined = [d.text, d.alt, ...d.canvas].join('\n');
      // 붙여 넣는 문구·alt: 백분위·순위·직급·금액·사인 모두 없음(cards.js shareText 계약).
      // 캔버스: '나의 인생 기록' 카드(0ef8ffa)가 순자산 금액·비민감 사인을 의도적으로 그린다 → 순위·직급·민감 사인만 금지(UI-SPEC §8.1), 금액·사인은 기록만.
      const said = [d.text, d.alt].join('\n'), drawn = d.canvas.join('\n');
      const CAUSE = /질환|암\(|폐렴|패혈증|뇌혈관|심장|노쇠|알츠하이머|사고|자해|자살|당뇨|간 질환|추락|코로나/;
      c(`S11 ${kind} 문구·alt: 백분위·순위·직급·금액 없음`, !RE_RANK.test(said) && !RE_MONEY.test(said) && !RE_JOBRANK.test(said), (said.match(RE_RANK) || said.match(RE_MONEY) || said.match(RE_JOBRANK) || [''])[0]);
      c(`S11 ${kind} 문구·alt: 사인(원인 문구) 없음`, !CAUSE.test(said), (said.match(CAUSE) || [''])[0]);
      c(`S11 ${kind} 캔버스: 백분위·순위·직급·민감 사인 없음`, !RE_RANK.test(drawn) && !RE_JOBRANK.test(drawn) && !RE_CAUSE_SENS.test(drawn), (drawn.match(RE_RANK) || drawn.match(RE_JOBRANK) || drawn.match(RE_CAUSE_SENS) || [''])[0]);
      c.note(`S11 ${kind} 캔버스 금액·비민감 사인 표기`, { money: (drawn.match(new RegExp(RE_MONEY, 'g')) || []).slice(0, 4), cause: (drawn.match(CAUSE) || [''])[0] });
      c(`S11 ${kind} 문구 말미 "— 태어나보니 대한민국 · bornkr.click"(717d1ce 주소 서명)`, /— 태어나보니 대한민국 · bornkr\.click$/.test(d.text), d.text.slice(-40));
      c(`S11 ${kind} 해시태그·도발 문구 없음`, !/#|너는 몇 살/.test(d.text));
      fs.writeFileSync(path.join(SHOTS, `flow-card-${kind}.png`), Buffer.from(d.src.split(',')[1], 'base64'));
      saveJson(`flow-card-${kind}.json`, { text: d.text, alt: d.alt, canvas: d.canvas });
      await shot(page, `flow-09-share-${kind}`);
      await page.click('[data-act=copy]');
      const clip = await page.evaluate(() => navigator.clipboard.readText().catch(e => 'ERR ' + e.message));
      c(`S11 ${kind} 문구 복사 → 클립보드 일치`, clip.split('\r\n').join('\n') === d.text, clip.slice(0, 40));
      c(`S11 ${kind} 복사 토스트`, await page.evaluate(() => /복사했습니다/.test(document.querySelector('.toast')?.textContent || '')));
      await page.keyboard.press('Escape');
      await page.waitForFunction(() => !document.querySelector('.sheet')); await sim.adv(50);   // 시트 이력 칸 정리(histPop)는 setTimeout(0) — 멈춘 가짜 시계에선 진행해야 돈다
    }
    await page.click('[data-card="verdict"]');
    await page.waitForSelector('.share__text');
    await page.evaluate(() => { window.__w = navigator.clipboard.writeText; navigator.clipboard.writeText = () => Promise.reject(new Error('blocked')); });
    await page.click('[data-act=copy]');
    const sel = await page.evaluate(() => { const ta = document.querySelector('.share__text'); return { sel: ta.selectionEnd - ta.selectionStart, len: ta.value.length, toast: document.querySelector('.toast')?.textContent }; });
    c('S11 복사 실패 → textarea 선택 + 안내 토스트', sel.sel === sel.len && /선택해 두었습니다/.test(sel.toast || ''), JSON.stringify(sel));
    await page.evaluate(() => { navigator.clipboard.writeText = window.__w; });
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => !document.querySelector('.sheet')); await sim.adv(50);
  });

  // ── S12 기록관 + 재열람 일치
  await t.test('S12 기록관·재열람', async () => {
    await page.click('.sum-more [data-go="archive"]');
    await waitScreen(page, 'archive');
    const d = await page.evaluate(() => ({ items: document.querySelectorAll('.records li').length, tally: document.querySelector('.tally')?.innerText.replace(/\n/g, ' '), cap: document.querySelector('.archive__cap')?.textContent, ads: document.querySelectorAll('.ad-slot').length }));
    c('S12 기록 1개 · 이 기기에만 저장 문구', d.items === 1 && /이 기기에만 저장/.test(d.cap), JSON.stringify(d));
    c('S12 목록 광고 영역 없음(5ddecb9)', d.ads === 0, d.ads);
    c('S12 집계에 순위·비교 없음', !RE_RANK.test(d.tally || ''), d.tally);
    await shot(page, 'flow-10-archive');
    await page.click('[data-rec="0"]');
    await page.waitForSelector('.topbar__title');
    const det = await page.evaluate(() => ({
      main: document.querySelector('.verdict__main')?.textContent,
      closing: [...document.querySelectorAll('section[aria-labelledby=sum-closing] .metric')].map(m => m.querySelector('.metric__label').textContent + ':' + m.querySelector('.metric__value').textContent),
      tl: [...document.querySelectorAll('.timeline .tl')].map(x => x.innerText.replace(/\n+/g, ' ')), head: document.querySelector('.lifehead').innerText.replace(/\n/g, ' '),
      ads: document.querySelectorAll('.ad-slot').length, fail: !!document.querySelector('.empty'),
    }));
    const strip = s => s.replace(/결산 · 기록 \S+ /, '');
    c('S12-b 상세: 요약만 남은 실패 화면 아님', !det.fail);
    c('S12-b 재열람 = 결산(판정문 주문 일치)', det.main === live.main, `${det.main} | ${live.main}`);
    c('S12-b 재열람 = 결산(결산 5지표 값 일치)', det.closing.join() === live.closing.join(), `${det.closing.join()} | ${live.closing.join()}`);
    c('S12-b 재열람 = 결산(연표 줄 일치)', det.tl.join('\n') === live.tl.join('\n'), `${det.tl.length} vs ${live.tl.length}`);
    c('S12-b 재열람 = 결산(머리글 사망·향년 일치)', strip(det.head) === strip(live.head), `${det.head} | ${live.head}`);
    c('S12-b 상세 광고 없음', det.ads === 0);
    await shot(page, 'flow-11-archive-detail');
    await page.click('.sum-more [data-go="archive"]');
    await waitScreen(page, 'archive');
  });

  // ── S13 통계 도감
  await t.test('S13 통계 도감', async () => {
    await page.click('[data-go="home"]'); await waitScreen(page, 'home');
    const homeArchive = await page.evaluate(() => document.querySelector('[data-go="archive"] .linkrow__desc').textContent);
    c('S01 기록 1개 → 홈 기록관 설명 갱신', /지난 생애 1개/.test(homeArchive), homeArchive);
    await page.click('[data-go="codex"]');
    await waitScreen(page, 'codex');
    await page.waitForSelector('table.stat-table', { timeout: 10000 });
    const d = await page.evaluate(() => ({
      tables: document.querySelectorAll('table.stat-table').length, rows: [...document.querySelectorAll('.stat-table tbody tr')].map(r => r.innerText.replace(/\s+/g, ' ')), ads: document.querySelectorAll('.ad-slot').length,
      src: document.querySelectorAll('.src-item').length, filters: document.querySelectorAll('.filter [data-filter]').length,
      links: [...document.querySelectorAll('.src-item a')].map(a => a.target + '|' + a.rel),
    }));
    c('S13 주제 표 3개 이상 · 값 행 8개 이상', d.tables >= 3 && d.rows.length >= 8, `${d.tables}/${d.rows.length}`);
    c('S13 모든 값 행에 값·연도·배지(undefined/NaN 없음)', d.rows.every(r => !/undefined|NaN|null/.test(r) && /\d{4}/.test(r)), d.rows.filter(r => /undefined|NaN|null/.test(r) || !/\d{4}/.test(r)).join(' || '));
    c('S13 광고 영역 없음(5ddecb9)', d.ads === 0, d.ads);
    c('S13 출처 목록 50개 이상', d.src >= 50, d.src);
    c('S13 필터 3개(전체·통계·전망)', d.filters === 3, d.filters);
    c('S13 외부 링크 rel=noopener', d.links.every(l => /noopener/.test(l)), d.links.slice(0, 3).join());
    await page.click('[data-filter="measured"]');
    const f = await page.evaluate(() => ({ vis: [...document.querySelectorAll('.stat-table tbody tr')].filter(r => !r.hidden).length, bad: [...document.querySelectorAll('.stat-table tbody tr')].filter(r => !r.hidden && r.dataset.kind !== 'measured').length, pressed: document.querySelector('[data-filter="measured"]').getAttribute('aria-pressed') }));
    c('S13 필터 실측 → 해당 행만', f.bad === 0 && f.vis > 0 && f.pressed === 'true', JSON.stringify(f));
    await page.click('[data-filter="all"]');
    await shot(page, 'flow-12-codex');
  });

  // ── S14 설정 + S15 도움 자원
  await t.test('S14 설정', async () => {
    await page.click('[data-go="home"]'); await waitScreen(page, 'home');
    await page.click('[data-go="settings"]'); await waitScreen(page, 'settings');
    const get = () => page.evaluate(() => ({ ls: JSON.parse(localStorage.getItem('hj.v1.settings') || '{}'), theme: document.documentElement.dataset.theme ?? null, motion: document.documentElement.dataset.motion ?? null, bg: getComputedStyle(document.body).backgroundColor, dur: getComputedStyle(document.documentElement).getPropertyValue('--dur-2').trim(), ads: document.querySelectorAll('.ad-slot').length }));
    let s = await get();
    c('S14 광고 없음', s.ads === 0);
    await page.click('[data-theme-set="dark"]');
    s = await get();
    c('S14 테마 어둡게 → data-theme=dark · 저장 · 배경 어두움(--bg #121C18)', s.theme === 'dark' && s.ls.theme === 'dark' && s.bg === 'rgb(18, 28, 24)', JSON.stringify(s));
    await shot(page, 'flow-13-settings-dark');
    await page.click('[data-theme-set="light"]');
    s = await get(); c('S14 테마 밝게(--bg #EAE6DA)', s.theme === 'light' && s.bg === 'rgb(234, 230, 218)', JSON.stringify(s));
    await page.click('[data-theme-set="system"]');
    s = await get(); c('S14 테마 기기 따라 → data-theme 제거', s.theme === null && s.ls.theme === 'system', JSON.stringify(s));
    await page.click('[data-speed-set="3"]');
    s = await get(); c('S14 기본 배속 3× 저장(기본값 2×와 다른 값)', s.ls.speed === 3, s.ls.speed);
    const autoWas = s.ls.auto;
    await page.click('[data-set="auto"]');
    s = await get(); c('S14 자동결정 스위치 토글·저장', s.ls.auto === !autoWas, `${autoWas} → ${s.ls.auto}`);
    await page.click('[data-set="auto"]');
    await page.click('[data-set="reduceMotion"]');
    s = await get(); c('S14 모션 줄이기 → data-motion=reduce · --dur-2 0ms', s.motion === 'reduce' && s.dur === '0ms' && s.ls.reduceMotion === true, JSON.stringify(s));
    await page.click('[data-set="reduceMotion"]');
    await page.click('[data-set="hideSensitiveCause"]');
    s = await get(); c('S14 민감한 사망 원인 숨기기 저장', s.ls.hideSensitiveCause === true, s.ls.hideSensitiveCause);
    await page.click('[data-set="hideSensitiveCause"]');
    const before = await page.evaluate(() => ({ expanded: document.querySelector('[data-act=ask]').getAttribute('aria-expanded'), hidden: document.querySelector('#confirm-reset').hidden, disabled: document.querySelector('[data-act=ask]').disabled }));
    c('S14 초기 상태: 확인 블록 숨김 · 버튼 활성(기록 1개)', before.hidden && before.expanded === 'false' && !before.disabled, JSON.stringify(before));
    await page.click('[data-act=ask]');
    const open = await page.evaluate(() => ({ expanded: document.querySelector('[data-act=ask]').getAttribute('aria-expanded'), hidden: document.querySelector('#confirm-reset').hidden, focus: document.activeElement?.dataset.act, text: document.querySelector('.confirm__text').textContent, btns: [...document.querySelectorAll('.confirm__actions .btn')].map(b => b.textContent) }));
    c('S14 확인 UI: 페이지 안 블록 · aria-expanded · 그대로 두기 포커스', !open.hidden && open.expanded === 'true' && open.focus === 'keep', JSON.stringify(open));
    c('S14 확인 문구 + [그대로 두기][N개 지우기]', /기록 1개를 지울까요\? 되돌릴 수 없습니다/.test(open.text) && open.btns.join() === '그대로 두기,1개 지우기', JSON.stringify(open));
    await shot(page, 'flow-14-settings-confirm');
    await page.keyboard.press('Escape');
    const esc = await page.evaluate(() => ({ hidden: document.querySelector('#confirm-reset').hidden, focus: document.activeElement?.dataset.act, rec: JSON.parse(localStorage.getItem('hj.v1.records') || '[]').length }));
    c('S14 Esc = 그대로 두기(기록 유지, 포커스 복귀)', esc.hidden && esc.focus === 'ask' && esc.rec === 1, JSON.stringify(esc));
    await page.click('[data-act=ask]'); await page.click('[data-act=keep]');
    c('S14 그대로 두기 → 기록 유지', (await page.evaluate(() => JSON.parse(localStorage.getItem('hj.v1.records') || '[]').length)) === 1);
    await page.click('[data-act=ask]'); await page.click('[data-act=wipe]');
    await page.waitForSelector('.toast');
    const w = await page.evaluate(() => ({ rec: localStorage.getItem('hj.v1.records'), toast: document.querySelector('.toast')?.textContent, disabled: document.querySelector('[data-act=ask]').disabled }));
    c('S14 지운 뒤 기록 0개 · 토스트 "기록을 지웠습니다." · 버튼 비활성', (w.rec == null || w.rec === '[]') && /기록을 지웠습니다/.test(w.toast || '') && w.disabled, JSON.stringify(w));
  });

  await t.test('S15 도움 UI 없음(사용자 결정)', async () => {
    const d = await page.evaluate(() => ({ btn: document.querySelectorAll('[data-help]').length, text: document.body.innerText }));
    c('S15 설정에 도움 버튼·전화번호 없음', d.btn === 0 && !/d{2,4}-d{3,4}/.test(d.text), JSON.stringify(d.btn));
  });

  c('콘솔 에러 0', appErrors(page).length === 0, appErrors(page).join(' | '));
  c('pageerror 0', page.qa.pageErrors.length === 0, page.qa.pageErrors.join(' | '));
  c('alert/confirm/prompt/print 호출 0', (await page.evaluate(() => window.__qa.dialogs)).length === 0 && page.qa.dialogs.length === 0);
  c.done();
});
