// FE 그래픽 개편 E2E: 시대 칩 · 출생 시퀀스 · 챕터 바 · 상단 지표 · 상태 카드(거주·직업·자산) · 동갑내기 시트 · 큰 사건 카드 · 모션 끄기 · 번호 비노출.
// 2026-10-19 갱신: 출생 연도 1960~1985라 시대 칩은 무작위 + 3개 연대, 6지표 링 → 상단 .sbar(▲▼ 배지), 하단 탭 → ⋯ 메뉴, 배속 1~5×,
// 프로필 패널 → 접이식 상태 카드(.pcard), 신문 모음 버튼 → 메뉴 [뉴스].
import test from 'node:test';
import assert from 'node:assert/strict';
import { startServer, launch, openPage, appErrors, waitScreen, Sim, seedInit, presetInit, SEEDS, checks, menu } from './helpers.mjs';

let srv, br;
test.before(async () => { srv = await startServer(); br = await launch(); });
test.after(async () => { await br?.close(); srv?.stop(); });

const age = page => page.evaluate(() => +document.querySelector('[data-hud="age"]')?.textContent);

test('FE-1 홈 시대 칩 → 출생 연도 범위, 출생 시퀀스 건너뛰기, 진행 화면 구성', { timeout: 240_000 }, async () => {
  const c = checks('fe-ui-1');
  const page = await openPage(br, srv.url, { clock: true, init: seedInit(SEEDS.plain) + presetInit({ seen19: true }) });
  const sim = new Sim(page);
  await waitScreen(page, 'home');
  const chips = await page.evaluate(() => [...document.querySelectorAll('.eraChip')].map(b => b.textContent));
  c('시대 칩 = 무작위 + 3개 연대(1960s~1980s, 출생 범위 1960~1985)', chips.length === 4 && /무작위/.test(chips[0]) && /1960s/.test(chips[1]) && /1980s/.test(chips[3]), chips.join('|'));
  c('칩에 한 줄 + 출생아 수', /명 출생/.test(chips[3]) && /올림픽/.test(chips[3]), chips[3]);
  await page.click('.eraChip[data-era="1980"]');
  c('칩 선택 → aria-pressed', await page.evaluate(() => document.querySelector('.eraChip[data-era="1980"]').getAttribute('aria-pressed') === 'true'));
  await page.click('[data-go="born"]');
  await waitScreen(page, 'birth');
  const y = await page.evaluate(() => +document.querySelector('.birth__chips .mono').textContent);
  c('출생 연도가 1980~1989', y >= 1980 && y <= 1989, y);
  c('출생 시퀀스 오버레이 + 하단 시작 버튼 동시 존재', await page.evaluate(() => !!document.querySelector('[data-cine]') && !!document.querySelector('[data-act="start"]')));
  await sim.adv(4000);
  c('4초 뒤 검은 막 + 손을 떼도 첫 카드(언제)가 뒤집힘', await page.evaluate(() => document.querySelector('[data-cine]').classList.contains('is-veil') && !!document.querySelector('.drawcard.is-open[data-draw="0"]')));
  await page.click('.cine__tap');
  await sim.adv(600);
  c('탭 → 시퀀스 제거, 출생 카드', await page.evaluate(() => !document.querySelector('[data-cine]') && !!document.querySelector('.doc')));
  await page.click('[data-act="start"]');
  await waitScreen(page, 'life');
  const L = await page.evaluate(() => ({
    chap: document.querySelectorAll('.chap__seg').length, rings: document.querySelectorAll('.sbar .sbar__i').length, scene: !!document.querySelector('.scene.run'),
    tabs: [...document.querySelectorAll('.life-menu__items button')].map(b => b.textContent), speeds: [...document.querySelectorAll('[data-speed]')].map(b => b.textContent.replace(/\s/g, '')),
    pcards: [...document.querySelectorAll('.pcard')].map(c => c.dataset.card).join(), hs: document.documentElement.scrollWidth - document.documentElement.clientWidth, hudAge: document.querySelector('[data-hud="year"]').textContent,
  }));
  c('챕터 10 · 상단 지표 6 · 장면 재생 중 · 상태 카드 거주·직업·자산', L.chap === 10 && L.rings === 6 && L.scene && L.pcards === 'home,job,asset', JSON.stringify(L));
  c('⋯ 메뉴 5개(가족·성향·관심사·뉴스·동갑내기) · 배속 1~5×', L.tabs.join() === '가족,성향,관심사,뉴스,동갑내기' && L.speeds.join() === '1×,2×,3×,4×,5×', JSON.stringify([L.tabs, L.speeds]));
  c('390px 가로 스크롤 0', L.hs === 0, L.hs);
  c('출생 연도 = 시대 칩', +L.hudAge >= 1980 && +L.hudAge <= 1989, L.hudAge);
  c('에러 0', appErrors(page).length === 0 && page.qa.pageErrors.length === 0, appErrors(page).concat(page.qa.pageErrors).join('|'));
  c.done();
});

test('FE-2 상태 카드 · 동갑내기 시트(시계 정지) · 번호 비노출', { timeout: 240_000 }, async () => {
  const c = checks('fe-ui-2');
  const page = await openPage(br, srv.url, { clock: true, init: seedInit(SEEDS.plain) + presetInit({ seen19: true, speed: 4, auto: true }) });
  const sim = new Sim(page);
  await waitScreen(page, 'home'); await page.click('[data-go="born"]'); await waitScreen(page, 'birth'); await page.click('[data-act="start"]'); await waitScreen(page, 'life');
  await sim.until(() => +document.querySelector('[data-hud="age"]')?.textContent >= 9 && !document.querySelector('.sheet'), { max: 300_000, step: 250 });
  // 상태 카드(거주·직업·자산): 접힌 채 한 줄 요약
  const closed = await page.evaluate(() => Object.fromEntries([...document.querySelectorAll('.pcard')].map(p => [p.dataset.card, { exp: p.querySelector('.pcard__sum').getAttribute('aria-expanded'), hidden: p.querySelector('.pcard__body').hidden, line: p.querySelector('.pcard__line').innerText }])));
  c('상태 카드는 접힌 채 한 줄 요약(거주 = 지역, 직업 줄 있음)', ['home', 'job', 'asset'].every(k => closed[k]?.exp === 'false' && closed[k].hidden) && /경기|서울|부산|인천|대구|광주|대전|울산|세종|강원|충|전|경|제주/.test(closed.home.line) && !!closed.job.line, JSON.stringify(closed));
  await sim.until(() => !document.querySelector('.sheet') && !document.querySelector('.chap-card'), { max: 120_000, step: 250 });
  await page.evaluate(() => document.querySelectorAll('.npop').forEach(n => n.remove()));
  await page.click('.pcard[data-card="home"] .pcard__sum'); await page.click('.pcard[data-card="job"] .pcard__sum');
  const open = await page.evaluate(() => ({ exp: [...document.querySelectorAll('.pcard--home .pcard__sum, .pcard--job .pcard__sum')].map(b => b.getAttribute('aria-expanded')).join(), cells: [...document.querySelectorAll('.pcard:not(.pcard--asset) .prof__cell:not([hidden]) dt')].map(x => x.textContent),
    text: (() => { const x = document.querySelector('.pcards').cloneNode(true); x.querySelectorAll('.pct').forEach(n => n.remove()); return x.innerText; })(), h: document.documentElement.scrollWidth - document.documentElement.clientWidth }));
  c('펼침: aria-expanded · 지역·주거·직업·고용 형태 칸', open.exp === 'true,true' && ['지역', '주거', '직업', '고용 형태'].every(x => open.cells.includes(x)), `${open.exp} ${open.cells.join()}`);
  // 통계 위치 칩(.pct, 0ef8ffa)은 의도된 퍼센트 표기라 빼고 카드 본문만 검사
  c('카드 본문에 순위·백분위·성공/실패 표현 없음', !/순위|백분위|성공|실패|등급/.test(open.text), open.text.slice(0, 200));
  c('가로 스크롤 0', open.h === 0, open.h);
  await page.click('.pcard[data-card="home"] .pcard__sum'); await page.click('.pcard[data-card="job"] .pcard__sum');
  // 동갑내기
  // 자동결정이 켜져 있으면 시트가 떠 있어도 시계가 흐르는 게 설계(play.js popupHalt). 시계 정지는 자동결정을 끄고 본다.
  await page.click('.lifebar [data-act="auto"]');
  await sim.until(() => !document.querySelector('.sheet') && !document.querySelector('.chap-card'), { max: 120_000, step: 250 });
  const a0 = await age(page);
  await menu(page, 'peers');
  await page.waitForSelector('.compare-sheet');
  const cp = await page.evaluate(() => ({ peers: document.querySelectorAll('.compare-sheet .peer').length, self: document.querySelectorAll('.compare-sheet .peer .tag').length, strip: document.querySelectorAll('.compare-sheet .cmp-p').length, tabs: [...document.querySelectorAll('[data-cage]')].map(b => b.textContent), text: document.querySelector('.compare-sheet').innerText }));
  c('동갑내기: 4행 + 본인 1 + 실루엣 4', cp.peers === 4 && cp.self === 1 && cp.strip === 4, JSON.stringify(cp));
  c('지나온 비교 나이 탭(7세 포함) + 지금', cp.tabs.some(t => /^7세/.test(t)) && cp.tabs.some(t => /^지금/.test(t)), cp.tabs.join());
  c('순위·백분위 표현 없음', !/순위|백분위|상위|하위/.test(cp.text));
  await sim.adv(30_000);
  c('자동결정 끔: 시트가 열린 동안 시계 정지(나이 그대로)', (await age(page)) === a0, `${a0} → ${await age(page)}`);
  await page.click('.compare-sheet .sheet__close');
  await sim.adv(12_000);
  // 재개되면 해가 넘어가거나, 해가 바뀌기 직전의 선택 시트가 뜬다(선택 시트도 시계가 흘러야 나온다)
  c('닫으면 진행 재개', (await age(page)) > a0 || (await page.evaluate(() => document.body.dataset.screen !== 'life' || !!document.querySelector('.sheet.choice'))), `${a0} → ${await age(page)}`);
  // 관심사 시트 · 뉴스(과거 신문) 시트
  await sim.until(() => !document.querySelector('.sheet') && !document.querySelector('.chap-card'), { max: 120_000, step: 250 });
  await menu(page, 'issues');
  await page.waitForSelector('.sheet .radar');
  c('관심사 시트: 관심사 레이더', await page.evaluate(() => !!document.querySelector('.sheet .radar--issue')));
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => !document.querySelector('.sheet'));
  await menu(page, 'news');
  await page.waitForSelector('.sheet .sheet__title');
  c('메뉴 [뉴스] → 과거 신문 시트', await page.evaluate(() => document.querySelector('.sheet .sheet__title').textContent === '과거 신문'));
  await page.keyboard.press('Escape');
  const all = await page.evaluate(() => document.body.innerText);
  c('화면에 전화번호 없음', !/\d{2,4}-\d{3,4}-?\d{0,4}/.test(all.replace(/\d{4}년|\d+세/g, '')), (all.match(/\d{2,4}-\d{3,4}/) || [''])[0]);
  c('에러 0', appErrors(page).length === 0 && page.qa.pageErrors.length === 0, appErrors(page).concat(page.qa.pageErrors).join('|'));
  c.done();
});

test('FE-3 큰 사건 카드는 탭 없이 읽기 시간 뒤 닫힘(일시정지 중엔 유지), ?motion=off 는 애니메이션 없음', { timeout: 240_000 }, async () => {
  const c = checks('fe-ui-3');
  const page = await openPage(br, srv.url, { clock: true, noAutoMajor: true, url: '?motion=off', init: seedInit(SEEDS.plain) + presetInit({ seen19: true, speed: 4, auto: false }) });
  const sim = new Sim(page);
  await waitScreen(page, 'home'); await page.click('[data-go="born"]'); await waitScreen(page, 'birth'); await page.click('[data-act="start"]'); await waitScreen(page, 'life');
  c('data-motion=off', await page.evaluate(() => document.documentElement.dataset.motion === 'off'));
  c('off: 장면 애니메이션 없음', await page.evaluate(() => getComputedStyle(document.querySelector('.scene .sc-bob')).animationName === 'none'));
  // 선택 시트가 뜨면 기본 행동을 직접 눌러 진행, 큰 사건 카드가 뜰 때까지
  for (let i = 0; i < 400 && !(await page.$('.sheet.major')); i++) {
    if (await page.$('.sheet.choice .option:not([disabled])')) await page.click('.sheet.choice .option:not([disabled])').catch(() => {});
    await sim.adv(500);
  }
  const has = !!(await page.$('.sheet.major'));
  c('큰 사건 카드가 나타남', has);
  if (has) {
    const a0 = await age(page);
    const card = await page.evaluate(() => ({ title: document.querySelector('.major__title')?.textContent, badge: document.querySelector('.major__badge')?.textContent, scene: !!document.querySelector('.major__scene .scene'), len: document.querySelector('.major__body').textContent.replace(/\s+/g, '').length }));
    c('카드: 주제 배지·큰 제목·장면', !!card.title && !!card.badge && card.scene, JSON.stringify(card));
    await page.evaluate(() => document.querySelector('.lifebar [data-act="pause"]').click());
    await sim.adv(60_000);
    c('일시정지 중엔 60초 지나도 카드 유지·나이 그대로', (await age(page)) === a0 && !!(await page.$('.sheet.major')), `${a0}/${await age(page)}`);
    await page.evaluate(() => document.querySelector('.lifebar [data-act="pause"]').click());
    await sim.adv(Math.max(3000, card.len / 9 * 1000) + 500);
    c('[확인] 없이 읽기 시간(초당 9자) 뒤 저절로 닫힘(F-3)', !(await page.$('.sheet.major')));
  }
  c('에러 0', appErrors(page).length === 0 && page.qa.pageErrors.length === 0, appErrors(page).concat(page.qa.pageErrors).join('|'));
  c.done();
});
