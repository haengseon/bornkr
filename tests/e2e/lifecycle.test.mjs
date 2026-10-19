// E2E-3 수명주기: 탭 숨김 일시정지·복귀, 새로 고침 후 이어 하기, localStorage 예외 환경 완주, 키보드, 연속 생애.
//   UI-SPEC §7.7 · ARCHITECTURE §14·§17.
import test from 'node:test';
import {
  startServer, launch, openPage, appErrors, screen, waitScreen, shot, Sim, seedInit, presetInit, SEEDS, checks, STORAGE_THROW, menu, pauseClock,
} from './helpers.mjs';

let srv, br;
test.before(async () => { srv = await startServer(); br = await launch(); });
test.after(async () => { await br?.close(); srv?.stop(); });

const PRE = (extra = {}, ls) => presetInit({ seen19: true, speed: 1, auto: false, ...extra }, ls);
async function startGame(opts = {}) {
  const { seed = SEEDS.plain, extra = {}, ls, ...o } = opts;
  const page = await openPage(br, srv.url, { clock: true, init: seedInit(seed) + PRE(extra, ls), ...o });
  const sim = new Sim(page);
  await waitScreen(page, 'home');
  await page.click('[data-go="born"]'); await waitScreen(page, 'birth');
  await page.click('[data-act="start"]'); await waitScreen(page, 'life');
  return { page, sim };
}
const setHidden = (page, h) => page.evaluate(h => {
  Object.defineProperty(document, 'hidden', { configurable: true, get: () => h });
  Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => (h ? 'hidden' : 'visible') });
  document.dispatchEvent(new Event('visibilitychange'));
}, h);
const hud = page => page.evaluate(() => ({
  age: +document.querySelector('[data-hud=age]').textContent, year: +document.querySelector('[data-hud=year]').textContent,
  stats: [...document.querySelectorAll('.sbar__v')].map(x => +x.textContent), name: document.querySelector('.hud__name').firstChild.textContent.trim(),
  tag: !document.querySelector('[data-hud=paused]').hidden, banner: document.querySelector('.banner').hidden ? null : document.querySelector('.banner span').textContent,
  pause: document.querySelector('[data-act=pause]').textContent, pressed: document.querySelector('[data-act=pause]').getAttribute('aria-pressed'),
  ring: document.querySelector('.ring__num')?.textContent ?? null, cmpK: document.querySelector('.compare .timer-line__fill')?.style.getPropertyValue('--k') ?? null,
}));

test('E2E-3a 탭 숨김 → 일시정지·복귀(멈춤 3중 표시, 3초 뒤 재개), 직접 멈춤은 유지', { timeout: 300_000 }, async () => {
  const c = checks('life-visibility');
  const { page, sim } = await startGame();
  await sim.adv(3000);
  const a0 = await hud(page);
  await setHidden(page, true);
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('hj.v1.current') || 'null'));
  c('숨김 → hj.v1.current 저장({seed,choices,elapsed,age,name,year,at})', saved && saved.seed === SEEDS.plain && Array.isArray(saved.choices) && typeof saved.elapsed === 'number' && 'age' in saved && 'at' in saved, JSON.stringify(saved));
  await sim.adv(60_000);
  const a1 = await hud(page);
  c('숨김 60초 동안 나이 그대로(연 진행 정지)', a1.age === a0.age, `${a0.age} → ${a1.age}`);
  await sim.adv(20 * 60_000);
  c('숨김 20분 뒤에도 진행 화면 유지(15분 상한에 숨김 시간 불포함)', (await screen(page)) === 'life', await screen(page));
  await setHidden(page, false);
  const v0 = await hud(page);
  c('복귀 → 멈춤 띠 + 멈춤 태그 + 하단 "재개"(aria-pressed=true) 3중 표시', v0.banner && /멈췄습니다/.test(v0.banner) && v0.tag && v0.pause === '재개' && v0.pressed === 'true', JSON.stringify(v0));
  await shot(page, 'life-visibility-banner');
  await sim.adv(2400);
  const v1 = await hud(page);
  c('복귀 2.4초 시점엔 아직 멈춤', v1.tag && v1.age === a0.age, JSON.stringify(v1));
  await sim.adv(1000);
  const v2 = await hud(page);
  c('복귀 3초 뒤 자동 재개(띠·태그 제거, 버튼 "일시정지")', v2.banner == null && !v2.tag && v2.pause === '일시정지', JSON.stringify(v2));
  await sim.adv(12_000);
  c('재개 뒤 나이가 다시 흐른다', (await hud(page)).age > a0.age, `${a0.age} → ${(await hud(page)).age}`);

  // 직접 멈춰 둔 상태: 숨김·복귀 뒤에도 자동 재개 없음
  await page.click('[data-act=pause]');
  const p0 = await hud(page);
  c('직접 멈춤 → 태그·"재개"', p0.tag && p0.pause === '재개', JSON.stringify(p0));
  await setHidden(page, true); await sim.adv(5000); await setHidden(page, false);
  await sim.adv(10_000);
  const p1 = await hud(page);
  c('직접 멈춘 뒤 숨김·복귀 → 3초 뒤에도 멈춤 유지(자동 재개 안 함)', p1.tag && p1.age === p0.age && p1.pause === '재개', JSON.stringify(p1));
  await page.click('[data-act=pause]');
  c('재개 버튼 → 재개', (await hud(page)).pause === '일시정지');
  // 띠의 [이어 가기] — 선택 시트가 떠 있으면 띠가 스크림 아래라 시트가 없을 때 숨긴다(숨김 동안은 진행이 멈춰 새 시트가 안 뜬다)
  await sim.until(() => !document.querySelector('.sheet'), { max: 120_000 });
  await setHidden(page, true); await sim.adv(1000); await setHidden(page, false);
  await page.click('.banner [data-act=resume]');
  const r = await hud(page);
  c('띠 [이어 가기] → 즉시 재개', r.banner == null && !r.tag, JSON.stringify(r));

  // 선택 시트가 열린 채 숨김
  await sim.until(() => !!document.querySelector('.sheet.choice'), { max: 200_000 });
  await sim.adv(1500);
  const k0 = await hud(page);
  await setHidden(page, true); await sim.adv(30_000);
  const k1 = await page.evaluate(() => ({ open: !!document.querySelector('.sheet.choice'), ring: document.querySelector('.ring__num')?.textContent }));
  c('선택 시트 열린 채 숨김 30초 → 시트 유지, 카운트다운 정지', k1.open && k1.ring === k0.ring, `${k0.ring} → ${k1.ring}`);
  await setHidden(page, false);
  await sim.adv(2000);
  const k2 = await page.evaluate(() => ({ open: !!document.querySelector('.sheet.choice'), ring: document.querySelector('.ring__num')?.textContent }));
  c('복귀 2초: 카운트다운은 3초 뒤 재개(아직 같은 숫자)', k2.open && k2.ring === k0.ring, `${k0.ring} → ${k2.ring}`);
  await sim.adv(4000);
  const k3 = await page.evaluate(() => ({ open: !!document.querySelector('.sheet.choice'), ring: document.querySelector('.ring__num')?.textContent }));
  c('복귀 6초: 카운트다운 재개(숫자 감소)', k3.open && +k3.ring < +k0.ring, `${k0.ring} → ${k3.ring}`);

  // (비교 카드 자동 팝업은 제거됨 — 동갑내기 시트는 fe-ui.test.mjs)
  c('에러 0', appErrors(page).length === 0 && page.qa.pageErrors.length === 0, appErrors(page).concat(page.qa.pageErrors).join('|'));
  c.done();
});

test('E2E-3b 새로 고침 후 이어 하기(hj.v1.current): 상태 일치, 선택 대기 중 새로 고침', { timeout: 300_000 }, async () => {
  const c = checks('life-resume');
  const { page, sim } = await startGame({ seed: SEEDS.plain });
  // 1번 선택은 직접(기본이 아닌 것), 이후 흐름은 4×
  await sim.until(() => !!document.querySelector('.sheet.choice'), { max: 200_000 });
  await sim.adv(800);
  await page.click('[data-opt]:not(.is-default)');
  await sim.until(() => !document.querySelector('.sheet.choice'));   // 결과는 읽기 시간 뒤 닫히고, 그동안 하단 바는 숨는다
  await page.click('[data-speed="4"]');
  await sim.until(() => +document.querySelector('[data-hud=age]').textContent >= 9 && !document.querySelector('.sheet.choice'), { max: 200_000, step: 250 });
  await sim.adv(100);
  const before = await hud(page);
  const feedBefore = await page.evaluate(() => [...document.querySelectorAll('.feed__year')].map(y => y.querySelector('.feed__when').textContent + ':' + y.querySelectorAll('.entry').length));
  // 새로 고침(pagehide → persist)
  await page.reload({ waitUntil: 'load' });
  await waitScreen(page, 'home');
  await pauseClock(page, new Date('2026-10-15T09:10:00+09:00'));   // 새로 고침 뒤에도 시계를 다시 멈춘다(지나간 시각이면 지금 이후로)
  const rs = await page.evaluate(() => ({ text: document.querySelector('.resume')?.innerText.replace(/\n/g, ' '), cur: JSON.parse(localStorage.getItem('hj.v1.current') || 'null') }));
  c('새로 고침 후 홈에 "하던 생애가 있습니다" 이어 하기 카드', /하던 생애가 있습니다/.test(rs.text || '') && rs.text.includes(before.name), rs.text);
  c('hj.v1.current 에 age·name·year 저장', rs.cur && rs.cur.age >= before.age - 1 && rs.cur.name === before.name, JSON.stringify({ age: rs.cur?.age, name: rs.cur?.name, choices: rs.cur?.choices?.length }));
  await shot(page, 'life-resume-home');
  await page.click('[data-go="resume"]');
  await waitScreen(page, 'life');
  const after = await hud(page);
  c('이어 하기 → 같은 이름·나이·연도', after.name === before.name && after.age === before.age && after.year === before.year, `${JSON.stringify(before)} | ${JSON.stringify(after)}`);
  c('이어 하기 → 6지표 값 동일(결정적 재현, 직접 선택 포함)', JSON.stringify(after.stats) === JSON.stringify(before.stats), `${before.stats} | ${after.stats}`);
  c('이어 하기 → 멈춤 띠("멈춰 둔 생애를 불러왔습니다.") + 태그 + 재개', /불러왔습니다/.test(after.banner || '') && after.tag && after.pause === '재개', JSON.stringify(after));
  const feedAfter = await page.evaluate(() => [...document.querySelectorAll('.feed__year')].map(y => y.querySelector('.feed__when').textContent + ':' + y.querySelectorAll('.entry').length));
  // 진행 중인 해(맨 위)는 줄이 한 줄씩 드러나는 중이라 비교에서 뺀다(revealEntries). 지난 해들은 줄 수가 같아야 한다.
  c('이어 하기 → 지난 해 피드(나이별 줄 수) 복원', JSON.stringify(feedAfter.slice(1)) === JSON.stringify(feedBefore.slice(1)), `${feedBefore.slice(1, 5)} | ${feedAfter.slice(1, 5)}`);
  const sel = await page.evaluate(() => JSON.parse(localStorage.getItem('hj.v1.settings') || '{}'));
  c('이어 하기 → 배속 설정 유지(4×)', sel.speed === 4, sel.speed);
  await shot(page, 'life-resume-life');
  await sim.adv(3300);
  const a2 = await hud(page);
  c('3초 뒤 자동 재개 + 이어서 진행', a2.banner == null && !a2.tag, JSON.stringify(a2));
  await sim.adv(30_000);
  c('재개 후 나이 증가', (await hud(page)).age > after.age || (await screen(page)) !== 'life', `${after.age} → ${(await hud(page)).age}`);

  // 선택 대기 중 새로 고침 → 다시 묻는다
  await sim.until(() => !!document.querySelector('.sheet.choice'), { max: 200_000 });
  await sim.adv(1000);
  const ask = () => page.evaluate(() => ({ meta: document.querySelector('.choice__meta')?.textContent, opts: [...document.querySelectorAll('.sheet.choice .option__label')].map(x => x.textContent).join('/'), title: document.querySelector('.choice__prompt')?.textContent }));
  const q1 = await ask();
  await page.reload({ waitUntil: 'load' });
  await waitScreen(page, 'home');
  await page.click('[data-go="resume"]');
  await waitScreen(page, 'life');
  await page.waitForSelector('.sheet.choice', { timeout: 10000 }).catch(() => {});
  await pauseClock(page, new Date('2026-10-15T09:20:00+09:00'));
  const q2 = await ask();
  c('선택 대기 중 새로 고침 → 이어 하기에서 같은 선택(나이·연도·선택지)을 다시 묻는다', q2.meta === q1.meta && q2.opts === q1.opts, `${JSON.stringify(q1)} | ${JSON.stringify(q2)}`);
  // 범용 질문("어떻게 할까?")은 그해 맥락 문장을 제목으로 올린다(HOOK-30S P0-5) — 이어 하기로 다시 물을 때도 같은 제목이어야 한다
  c('다시 묻는 선택의 제목(맥락 문장)도 같다', q2.title === q1.title, `${q1.title} | ${q2.title}`);
  c('에러 0', appErrors(page).length === 0 && page.qa.pageErrors.length === 0, appErrors(page).concat(page.qa.pageErrors).join('|'));
  c.done();
});

test('E2E-3c localStorage 예외 환경에서도 완주(setItem/getItem/removeItem throw)', { timeout: 300_000 }, async () => {
  const c = checks('life-storage-throw');
  const page = await openPage(br, srv.url, { clock: true, storage: 'throw', init: seedInit(SEEDS.plain) });
  const sim = new Sim(page);
  const thrown = await page.evaluate(() => { try { localStorage.setItem('a', 'b'); return false; } catch { return true; } });
  c('환경: Storage.setItem이 실제로 throw', thrown);
  await waitScreen(page, 'home');
  const h = await page.evaluate(() => ({ h1: document.querySelector('h1')?.textContent, resume: !!document.querySelector('.resume') }));
  c('홈 정상 렌더', h.h1 === '태어나보니 대한민국' && !h.resume, JSON.stringify(h));
  await page.click('[data-go="born"]');
  c('저장 불가 → 매번 19세 안내(seen19 저장 불가)', (await screen(page)) === 'gate', await screen(page));
  await page.click('[data-go="gateOk"]'); await waitScreen(page, 'birth');
  await page.click('[data-act="start"]'); await waitScreen(page, 'life');
  await page.click('[data-speed="4"]');
  // 자동결정은 기본 켬(DEFAULTS.auto) — 메모리 토글이 도는지 끄고 다시 켜서 '켬'으로 맞춘다
  const autoOn = () => page.evaluate(() => document.querySelector('.lifebar [data-act=auto]').getAttribute('aria-checked') === 'true');
  if (await autoOn()) await page.click('.lifebar [data-act="auto"]');
  c('저장 불가여도 자동결정 끄기 동작(메모리)', !(await autoOn()));
  await page.click('.lifebar [data-act="auto"]');
  c('저장 불가여도 배속·자동결정 메모리 값으로 동작', await page.evaluate(() => document.querySelector('[data-speed="4"]').getAttribute('aria-pressed') === 'true' && document.querySelector('.lifebar [data-act=auto]').getAttribute('aria-checked') === 'true'));
  await sim.until(() => !!document.querySelector('[data-act="last-record"]'), { max: 20 * 60_000, step: 500 });
  await page.click('[data-act="last-record"]'); await waitScreen(page, 'death');           // 마지막 해·검정 페이지는 직접 넘김(자동 결산 없음)
  c('사망 화면 도달(진행 중 persist/clearCurrent 예외 무시)', true);
  await page.click('[data-act="sum"]'); await waitScreen(page, 'summary');
  const s = await page.evaluate(() => ({ main: document.querySelector('.verdict__main')?.textContent, tl: document.querySelectorAll('.timeline .tl').length }));
  c('결산 렌더', !!s.main && s.tl > 0, JSON.stringify(s));
  await page.click('[data-card="verdict"]');
  await page.waitForSelector('.share__img');
  for (let i = 0; i < 40 && !(await page.evaluate(() => (document.querySelector('.share__img')?.src || '').startsWith('data:'))); i++) { await sim.adv(300); await page.waitForTimeout(80); }
  c('공유 카드 렌더', await page.evaluate(() => (document.querySelector('.share__img')?.src || '').startsWith('data:image/png')));
  await page.keyboard.press('Escape'); await sim.adv(50);
  await page.click('.sum-more [data-go="archive"]'); await waitScreen(page, 'archive');
  const arch = await page.evaluate(() => document.querySelector('.empty')?.textContent);
  c('기록관: 저장 불가 → 빈 상태 문구(크래시 없음)', /아직 끝난 생애가 없습니다/.test(arch || ''), arch);
  await page.click('[data-go="home"]'); await waitScreen(page, 'home');
  await page.click('[data-go="settings"]'); await waitScreen(page, 'settings');
  await page.click('[data-theme-set="dark"]');
  c('설정: 저장 불가여도 테마 즉시 적용(메모리)', await page.evaluate(() => document.documentElement.dataset.theme === 'dark'));
  await page.click('[data-go="home"]'); await waitScreen(page, 'home');
  await page.click('[data-go="born"]'); await waitScreen(page, 'birth');   // 같은 세션 메모리에 seen19=true
  c('에러 0(콘솔·pageerror)', appErrors(page).length === 0 && page.qa.pageErrors.length === 0, appErrors(page).concat(page.qa.pageErrors).join('|'));
  c.done();
});

test('E2E-3d 키보드 조작: 숫자 1~3 선택, Esc는 선택 시트를 닫지 않음, Tab 포커스 링', { timeout: 300_000 }, async () => {
  const c = checks('life-keyboard');
  const { page, sim } = await startGame();
  // 오탭 방지는 이제 '시트가 뜨기 전에 시작된 탭'만 거른다(arming 120ms) — 가짜 시계 단위(250ms)로는 재현할 수 없어 여기선 보지 않는다
  await sim.until(() => !!document.querySelector('.sheet.choice'), { max: 200_000 });
  await sim.adv(300);
  const opt2 = await page.evaluate(() => document.querySelectorAll('[data-opt]')[1]?.querySelector('.option__label').textContent);
  await page.keyboard.press('Escape');
  c('Esc 로 선택 시트가 닫히지 않음', await page.evaluate(() => !!document.querySelector('.sheet.choice')));
  // 포커스 링
  await page.keyboard.press('Tab');
  const ring = await page.evaluate(() => { const e = document.activeElement; const cs = getComputedStyle(e); return { tag: e.className, outline: cs.outlineStyle + ' ' + cs.outlineWidth + ' ' + cs.outlineColor, inSheet: !!e.closest('.sheet') }; });
  c('Tab 포커스는 시트 안(배경 inert) + 3px 링', ring.inSheet && /solid 3px/.test(ring.outline), JSON.stringify(ring));
  await shot(page, 'life-keyboard-focus');
  await page.keyboard.press('2');
  const picked = await page.evaluate(() => document.querySelector('.picked dd')?.textContent);
  c('숫자키 2 → 두 번째 선택지(결과의 "고른 행동")', !!opt2 && picked === opt2, `${opt2} | ${picked}`);
  await page.keyboard.press('Enter');
  c('결과 상태에서 Enter → 시트 닫힘(읽기 시간 기다리지 않음)', await page.evaluate(() => !document.querySelector('.sheet.choice')));
  // 스페이스 = 멈춤 버튼
  await page.focus('[data-act=pause]');
  await page.keyboard.press('Space');
  c('스페이스 = 하단 멈춤 버튼', (await hud(page)).tag);
  await page.keyboard.press('Space');
  c('스페이스 재입력 → 재개', !(await hud(page)).tag);
  // 지표 시트(시트 안 탭 줄은 없어짐 — 상단 지표 버튼으로 연다): Esc 로 닫고 여는 버튼으로 포커스 복귀
  await sim.until(() => !document.querySelector('.sheet'), { max: 120_000 });
  await page.focus('.sbar [data-stat="health"] [data-tab="stats"]');
  await page.keyboard.press('Enter');
  await page.waitForSelector('.sheet #panel-stats');
  await page.keyboard.press('Escape');
  c('Esc → 시트 닫힘 · 여는 버튼으로 포커스', await page.evaluate(() => !document.querySelector('.sheet') && document.activeElement?.dataset?.tab === 'stats'), await page.evaluate(() => document.activeElement?.className));
  c('에러 0', appErrors(page).length === 0 && page.qa.pageErrors.length === 0, appErrors(page).concat(page.qa.pageErrors).join('|'));
  c.done();
});

test('E2E-3e S05 지표·성향·뉴스 시트: 출처·연도·계산 이유 표시(00-plan 검증 기준)', { timeout: 300_000 }, async () => {
  const c = checks('life-stats-sheet');
  const { page, sim } = await startGame({ seed: SEEDS.plain, extra: { speed: 4, auto: true } });
  await sim.until(() => +document.querySelector('[data-hud=age]').textContent >= 12 && !document.querySelector('.sheet') && !document.querySelector('.compare'), { max: 300_000, step: 250 });
  // 자동결정 중에는 시트가 떠도 시계가 흐르는 게 설계(play.js popupHalt) — 멈춤은 자동결정을 끄고 본다
  await page.click('.lifebar [data-act="auto"]');
  await sim.until(() => !document.querySelector('.sheet'), { max: 120_000 });
  await page.click('.sbar [data-tab="stats"]');
  await page.waitForSelector('.sheet .metric');
  const age0 = await hud(page);
  await sim.adv(30_000);
  c('S05 열린 동안 연 진행 멈춤(30초, 자동결정 끔)', (await hud(page)).age === age0.age, `${age0.age} → ${(await hud(page)).age}`);
  const info = await page.evaluate(() => ({ n: document.querySelectorAll('.sheet details.metric').length, title: document.querySelector('.sheet__title').textContent }));
  c('지표 시트: 6지표 details', info.n === 6, JSON.stringify(info));
  const rows = [];
  for (const key of ['health', 'intellect', 'happiness', 'wealth', 'relations', 'leisure']) {
    await page.evaluate(k => { document.querySelector(`details[data-key="${k}"]`).open = true; }, key);
    rows.push(await page.evaluate(k => { const d = document.querySelector(`details[data-key="${k}"]`); return { key: k, reason: d.querySelector('.metric__reason').textContent, src: [...d.querySelectorAll('.src')].map(x => x.textContent), badges: d.querySelectorAll('.src [class*="badge"]').length }; }, key));
  }
  // 지표 시트는 explain 문단 대신 '최근 변화 이유 한 줄 + 출처'만 보인다(설명충 정리, 0ef8ffa). 추정 출처는 배지를 숨긴다(srcList noEst).
  for (const r of rows) {
    c(`지표 ${r.key}: 이유 한 줄 있음`, r.reason.trim().length > 3, r.reason);
    c(`지표 ${r.key}: 출처 있음(기관·통계명·연도)`, r.src.length > 0 && r.src.some(s => /\d{4}/.test(s)), r.src.join(' / ').slice(0, 160));
  }
  c.note('지표 이유·출처 샘플', rows.slice(0, 3));
  await shot(page, 'life-stats-sheet');
  await page.keyboard.press('Escape'); await page.waitForFunction(() => !document.querySelector('.sheet'));
  await menu(page, 'issues'); await page.waitForSelector('.sheet .radar--issue');
  const iss = await page.evaluate(() => [...document.querySelectorAll('.sheet details.metric')].map(d => ({ label: d.querySelector('.metric__label').textContent, v: +d.querySelector('.metric__value').textContent, reason: d.querySelector('.metric__reason').textContent })));
  // 관심사는 나이대별 항목(엔진 concernsOf)이라 개수가 바뀐다 — 값 내림차순 + 사유 1줄만 본다
  c('관심사 시트: 나이대 항목 값 내림차순 + 사유 1줄', iss.length >= 3 && iss.every((x, i) => i === 0 || iss[i - 1].v >= x.v) && iss.every(x => x.reason.trim().length >= 2), JSON.stringify(iss.map(x => [x.label, x.v, x.reason])));
  await shot(page, 'life-issues-sheet');
  await page.keyboard.press('Escape'); await page.waitForFunction(() => !document.querySelector('.sheet'));
  await menu(page, 'traits'); await page.waitForSelector('.sheet .mbti-card');
  const tr = await page.evaluate(() => ({ type: document.querySelector('.sheet .mbti-card__type')?.textContent, axes: document.querySelectorAll('.sheet .mbti-axis').length }));
  c('성향 시트: 19세 미만은 "성향 형성 중"(MBTI 축은 성년 이후)', /형성 중/.test(tr.type || '') && tr.axes === 0, JSON.stringify(tr));
  const pct = await page.evaluate(() => document.querySelector('.sheet').innerText);
  c.note('S05 시트 안 백분위·순위 표기(GDD §4.4: explain 안에서만 허용)', (pct.match(/.{0,20}(백분위|순위|상위 \d|하위 \d).{0,20}/g) || []).slice(0, 5));
  c('에러 0', appErrors(page).length === 0 && page.qa.pageErrors.length === 0, appErrors(page).concat(page.qa.pageErrors).join('|'));
  c.done();
});

test('E2E-3f 설정이 새 생애에 반영(자동결정·배속) + 이어 할 생애가 있을 때 "태어나기"의 덮어쓰기', { timeout: 300_000 }, async () => {
  const c = checks('life-settings-effect');
  const cur = { seed: SEEDS.plain, choices: [], elapsed: 60_000, age: 3, name: '이전생애', year: 1966, at: Date.now() };
  const page = await openPage(br, srv.url, { clock: true, init: seedInit(SEEDS.short) + PRE({ speed: 4, auto: true }, { 'hj.v1.current': cur }) });
  const sim = new Sim(page);
  await waitScreen(page, 'home');
  c('이어 하기 카드 + 태어나기 버튼이 함께 보임', await page.evaluate(() => !!document.querySelector('.resume') && !!document.querySelector('[data-go=born]')));
  // QA-E-04: 이어 할 생애가 있으면 [태어나기]는 페이지 안 확인을 먼저 보이고, 확인 전에는 저장된 생애를 건드리지 않는다
  await page.click('[data-go="born"]');
  await page.waitForTimeout(300);
  const ask = await page.evaluate(() => ({ screen: document.body.dataset.screen, open: !document.querySelector('#confirm-new')?.hidden, saved: JSON.parse(localStorage.getItem('hj.v1.current') || 'null')?.name }));
  c('(UX) 하던 생애가 있을 때 [태어나기] → 페이지 안 확인이 열리고 저장은 그대로', ask.screen === 'home' && ask.open && ask.saved === '이전생애', JSON.stringify(ask));
  await page.click('#confirm-new [data-go="bornNew"]'); await waitScreen(page, 'birth');       // 확인한 뒤에만 새 생애
  // (출생 화면의 "자동결정이 켜져 있습니다." 안내는 초기 소스부터 없음 — 하단 바 반영만 본다)
  await page.click('[data-act="start"]'); await waitScreen(page, 'life');
  const lb = await page.evaluate(() => ({ auto: document.querySelector('.lifebar [data-act=auto]').getAttribute('aria-checked'), sp: [...document.querySelectorAll('[data-speed]')].map(b => b.getAttribute('aria-pressed')).join() }));
  c('설정 배속 4×·자동결정 ON 이 진행 화면 하단 바에 반영(배속 1~5×)', lb.auto === 'true' && lb.sp === 'false,false,false,true,false', JSON.stringify(lb));
  // 진행 저장(persist)은 한 해가 끝날 때 — 0세 '부모님의 첫 결정'(자동 1.2초 + 결과 읽기)이 끼어 첫 해가 길어졌다
  await sim.until(() => JSON.parse(localStorage.getItem('hj.v1.current') || 'null')?.name !== '이전생애' || document.body.dataset.screen !== 'life', { max: 60_000 }).catch(() => {});
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('hj.v1.current') || 'null'));
  c.note('확인 뒤 새 생애 시작 후 hj.v1.current', saved && { name: saved.name, seed: saved.seed, age: saved.age });
  c('확인한 뒤에는 새 생애가 저장을 이어받는다(이전 생애 이름이 아님)', !saved || saved.name !== '이전생애', `저장: ${saved?.name}`);
  c.done();
});

test('E2E-3g 출생 카드는 자동 시작하지 않음 + 비교 카드 조작(계속·Esc·누르는 동안 멈춤·자동결정 4초)', { timeout: 300_000 }, async () => {
  const c = checks('life-auto-compare');
  // (1) 출생 카드는 무입력이어도 자동으로 넘어가지 않는다(시퀀스 끝 포함)
  let page = await openPage(br, srv.url, { clock: true, init: seedInit(SEEDS.plain) + PRE() });
  let sim = new Sim(page);
  await waitScreen(page, 'home'); await page.click('[data-go="born"]'); await waitScreen(page, 'birth');
  await sim.adv(40_000);
  c('S03 무입력 40초 뒤에도 출생 화면', await page.evaluate(() => document.body.dataset.screen === 'birth'));
  await page.close();
  c.done();
});
