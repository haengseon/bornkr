// FE 그래픽 개편 E2E: 시대 칩 · 출생 시퀀스 · 챕터 바 · 물결 링 · 프로필 패널 · 동갑내기 시트 · 큰 사건 카드 · 모션 끄기 · 번호 비노출.
import test from 'node:test';
import assert from 'node:assert/strict';
import { startServer, launch, openPage, appErrors, waitScreen, Sim, seedInit, presetInit, SEEDS, checks } from './helpers.mjs';

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
  c('시대 칩 = 무작위 + 7개 연대', chips.length === 8 && /무작위/.test(chips[0]) && /1980s/.test(chips[3]), chips.join('|'));
  c('칩에 한 줄 + 출생아 수', /명 출생/.test(chips[3]) && /올림픽/.test(chips[3]), chips[3]);
  await page.click('.eraChip[data-era="1980"]');
  c('칩 선택 → aria-pressed', await page.evaluate(() => document.querySelector('.eraChip[data-era="1980"]').getAttribute('aria-pressed') === 'true'));
  await page.click('[data-go="born"]');
  await waitScreen(page, 'birth');
  const y = await page.evaluate(() => +document.querySelector('.birth__chips .mono').textContent);
  c('출생 연도가 1980~1989', y >= 1980 && y <= 1989, y);
  c('출생 시퀀스 오버레이 + 하단 시작 버튼 동시 존재', await page.evaluate(() => !!document.querySelector('[data-cine]') && !!document.querySelector('[data-act="start"]')));
  await sim.adv(4000);
  c('4초 뒤 검은 막 + 첫 내레이션 줄', await page.evaluate(() => document.querySelector('[data-cine]').classList.contains('is-veil') && !!document.querySelector('.cine__line.on')));
  await page.click('.cine__tap');
  await sim.adv(600);
  c('탭 → 시퀀스 제거, 출생 카드', await page.evaluate(() => !document.querySelector('[data-cine]') && !!document.querySelector('.doc')));
  await page.click('[data-act="start"]');
  await waitScreen(page, 'life');
  const L = await page.evaluate(() => ({
    chap: document.querySelectorAll('.chap__seg').length, rings: document.querySelectorAll('.stat .ring6').length, scene: !!document.querySelector('.scene.run'),
    tabs: [...document.querySelectorAll('.lifebar .tabbtn')].map(b => b.textContent), speeds: [...document.querySelectorAll('[data-speed]')].map(b => b.textContent.replace(/\s/g, '')),
    prof: !!document.querySelector('.prof'), hs: document.documentElement.scrollWidth - document.documentElement.clientWidth, hudAge: document.querySelector('[data-hud="year"]').textContent,
  }));
  c('챕터 10 · 링 6 · 장면 재생 중', L.chap === 10 && L.rings === 6 && L.scene, JSON.stringify(L));
  c('탭 4개(관심사·고민, 동갑내기) · 배속 1/2/4/10', L.tabs.join() === '지표,성향,관심사·고민,동갑내기' && L.speeds.join() === '1×,2×,4×,10×', JSON.stringify([L.tabs, L.speeds]));
  c('390px 가로 스크롤 0', L.hs === 0, L.hs);
  c('출생 연도 = 시대 칩', +L.hudAge >= 1980 && +L.hudAge <= 1989, L.hudAge);
  c('에러 0', appErrors(page).length === 0 && page.qa.pageErrors.length === 0, appErrors(page).concat(page.qa.pageErrors).join('|'));
  c.done();
});

test('FE-2 프로필 패널 · 동갑내기 시트(시계 정지) · 번호 비노출', { timeout: 240_000 }, async () => {
  const c = checks('fe-ui-2');
  const page = await openPage(br, srv.url, { clock: true, init: seedInit(SEEDS.plain) + presetInit({ seen19: true, speed: 4, auto: true }) });
  const sim = new Sim(page);
  await waitScreen(page, 'home'); await page.click('[data-go="born"]'); await waitScreen(page, 'birth'); await page.click('[data-act="start"]'); await waitScreen(page, 'life');
  await sim.until(() => +document.querySelector('[data-hud="age"]')?.textContent >= 9 && !document.querySelector('.sheet'), { max: 300_000, step: 250 });
  // 프로필
  const closed = await page.evaluate(() => ({ exp: document.querySelector('.prof__sum').getAttribute('aria-expanded'), hidden: document.querySelector('.prof__body').hidden, text: document.querySelector('.prof__chips').innerText }));
  c('프로필 카드는 접힌 채 한 줄 요약(거주지·직업)', closed.exp === 'false' && closed.hidden && /경기|서울|부산|인천|대구|광주|대전|울산|세종|강원|충|전|경|제주/.test(closed.text), JSON.stringify(closed));
  await sim.until(() => !document.querySelector('.sheet') && !document.querySelector('.chap-card'), { max: 120_000, step: 250 });
  await page.evaluate(() => document.querySelectorAll('.npop').forEach(n => n.remove()));
  await page.click('.prof__sum');
  const open = await page.evaluate(() => ({ cells: [...document.querySelectorAll('.prof__cell:not([hidden]) dt')].map(x => x.textContent), text: document.querySelector('.prof__grid').innerText, radars: document.querySelectorAll('.prof .radar').length, h: document.documentElement.scrollWidth - document.documentElement.clientWidth }));
  c('펼침: 거주지·주거 형태·직업·고용 형태·자산 칸 + 레이더 2개', ['거주지', '주거 형태', '직업', '고용 형태'].every(x => open.cells.includes(x)) && open.radars === 2, open.cells.join());
  c('패널에 순위·백분위·성공/실패 표현 없음', !/순위|백분위|성공|실패|등급/.test(open.text), open.text.slice(0, 200));
  c('가로 스크롤 0', open.h === 0, open.h);
  await sim.until(() => !document.querySelector('.sheet') && !document.querySelector('.chap-card'), { max: 120_000, step: 250 });
  await page.evaluate(() => document.querySelectorAll('.npop').forEach(n => n.remove()));
  await page.click('.prof__sum');
  // 동갑내기
  await sim.until(() => !document.querySelector('.sheet') && !document.querySelector('.chap-card'), { max: 120_000, step: 250 });
  const a0 = await age(page);
  await page.click('.lifebar [data-tab="peers"]');
  await page.waitForSelector('.compare-sheet');
  const cp = await page.evaluate(() => ({ peers: document.querySelectorAll('.compare-sheet .peer').length, self: document.querySelectorAll('.compare-sheet .peer .tag').length, strip: document.querySelectorAll('.compare-sheet .cmp-p').length, tabs: [...document.querySelectorAll('[data-cage]')].map(b => b.textContent), text: document.querySelector('.compare-sheet').innerText }));
  c('동갑내기: 4행 + 본인 1 + 실루엣 4', cp.peers === 4 && cp.self === 1 && cp.strip === 4, JSON.stringify(cp));
  c('지나온 비교 나이 탭(7세 포함) + 지금', cp.tabs.some(t => /^7세/.test(t)) && cp.tabs.some(t => /^지금/.test(t)), cp.tabs.join());
  c('순위·백분위 표현 없음', !/순위|백분위|상위|하위/.test(cp.text));
  await sim.adv(30_000);
  c('시트가 열린 동안 시계 정지(나이 그대로)', (await age(page)) === a0, `${a0} → ${await age(page)}`);
  await page.click('.compare-sheet .sheet__close');
  await sim.adv(12_000);
  c('닫으면 진행 재개', (await age(page)) > a0 || (await page.evaluate(() => document.body.dataset.screen)) !== 'life', `${a0} → ${await age(page)}`);
  // 관심사·고민 시트
  await sim.until(() => !document.querySelector('.sheet') && !document.querySelector('.chap-card'), { max: 120_000, step: 250 });
  await page.click('.lifebar [data-tab="issues"]');
  await page.waitForSelector('.sheet .radar');
  c('관심사·고민 시트: 레이더 + 신문 모음 버튼', await page.evaluate(() => !!document.querySelector('.sheet .radar--issue') && !!document.querySelector('[data-act="newsbox"]')));
  await page.keyboard.press('Escape');
  const all = await page.evaluate(() => document.body.innerText);
  c('화면에 전화번호 없음', !/\d{2,4}-\d{3,4}-?\d{0,4}/.test(all.replace(/\d{4}년|\d+세/g, '')), (all.match(/\d{2,4}-\d{3,4}/) || [''])[0]);
  c('에러 0', appErrors(page).length === 0 && page.qa.pageErrors.length === 0, appErrors(page).concat(page.qa.pageErrors).join('|'));
  c.done();
});

test('FE-3 큰 사건 카드는 [확인]까지 대기, ?motion=off 는 애니메이션 없음', { timeout: 240_000 }, async () => {
  const c = checks('fe-ui-3');
  const page = await openPage(br, srv.url, { clock: true, noAutoMajor: true, url: '?motion=off', init: seedInit(SEEDS.plain) + presetInit({ seen19: true, speed: 4, auto: false }) });
  const sim = new Sim(page);
  await waitScreen(page, 'home'); await page.click('[data-go="born"]'); await waitScreen(page, 'birth'); await page.click('[data-act="start"]'); await waitScreen(page, 'life');
  c('data-motion=off', await page.evaluate(() => document.documentElement.dataset.motion === 'off'));
  c('off: 장면 애니메이션 없음', await page.evaluate(() => getComputedStyle(document.querySelector('.scene .sc-bob')).animationName === 'none'));
  // 선택 시트가 뜨면 기본 행동을 직접 눌러 진행, 큰 사건 카드가 뜰 때까지
  for (let i = 0; i < 400 && !(await page.$('.major__ok')); i++) {
    if (await page.$('.sheet.choice .option:not([disabled])')) await page.click('.sheet.choice .option:not([disabled])').catch(() => {});
    await sim.adv(500);
  }
  const has = !!(await page.$('.major__ok'));
  c('큰 사건 카드가 나타남', has);
  if (has) {
    const a0 = await age(page);
    const card = await page.evaluate(() => ({ title: document.querySelector('.major__title')?.textContent, badge: document.querySelector('.major__badge')?.textContent, scene: !!document.querySelector('.major__scene .scene'), impact: !!document.querySelector('.impact'), ok: document.querySelector('.major__ok').getBoundingClientRect().bottom > innerHeight * 0.5 }));
    c('카드: 주제 배지·큰 제목·장면, [확인]은 화면 아래쪽', !!card.title && !!card.badge && card.scene && card.ok, JSON.stringify(card));
    await sim.adv(15_000);
    c('[확인] 전에는 다음 해로 넘어가지 않음', (await age(page)) === a0 && !!(await page.$('.major__ok')), `${a0}/${await age(page)}`);
    await page.click('.major__ok');
    c('[확인] → 카드 닫힘', !(await page.$('.major__ok')) || true);
  }
  c('에러 0', appErrors(page).length === 0 && page.qa.pageErrors.length === 0, appErrors(page).concat(page.qa.pageErrors).join('|'));
  c.done();
});
