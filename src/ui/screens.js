// 화면: S01 홈 · S02 안내 · S03 출생 신고서 · S09 사망 · S10 결산 · S12 기록관 · S13 통계 도감 · S14 설정
import { SPEEDS } from '../engine/constants.js';
import { newLife, birthCert, peers, summarize, replay, expectedRemainingYears } from '../engine/index.js';
import { ORDER_L } from '../engine/compare.js';
import { FAMILY_HISTORY } from '../content/family-history.js';
import { FAMILY_HISTORY_EXT } from '../content/family-history-ext.js';
import { S, routes, go, $, $$, esc, show, toast, setSetting, pushScreen, reduced } from './dom.js';
import { loadRecords, loadCurrent, clearRecords } from './store.js';
import {
  sexLabel, regionShort, josa, quintileAria, dateKo, dateDot, dateDotSp, mmdd, receiptNo, ageText, causeLabel, deathLine,
  CLOSING_KEYS, CLOSING_LABEL, kindBadge,
} from './labels.js';
import { srcList, openSources, toMetas } from './sheets.js';
import { openShare } from './cards.js';
import { startNew } from './play.js';
import { sceneHtml, mountScene, silhouetteSvg } from './scene.js';
import { radarSvg, morphRadar, iconSvg } from './gauges.js';
import { TENURE_LABEL, familyLines, familyText } from './profile.js';
import { standingOf, standingHtml } from './standing-ui.js';
import { ERAS, decadeBirthsAvg, pickYear, manText } from './era.js';

const PRIV = '<a class="privlink" href="privacy.html" target="_blank" rel="noopener">개인정보 처리방침</a>';
const SITE_NAV = '<nav class="site-links" aria-label="게임 안내"><a href="guide.html">이용 가이드</a><a href="how-it-works.html">규칙·자료</a><a href="about.html">제작 소개</a><a href="contact.html">문의</a></nav>';
const meter = v => `<span class="meter meter--lg"><span class="meter__fill" style="--v:${v}"></span></span>`;
const opts = () => ({ hideSensitiveCause: S.settings.hideSensitiveCause });

// ───────── S01 홈 ─────────
routes.home = () => {
  S.again = null;
  const recs = loadRecords(), cur = loadCurrent();
  const homeEl = show('home', `<section class="screen has-bar home" data-screen="home"><div class="screen__body">
    <p class="home__formno">생애 시뮬레이션 · 약 15분 <span class="tag">19세 이상</span></p>
    <h1 class="home__title">태어나보니 대한민국</h1>
    <p class="home__sub">한 번뿐인 인생</p>
    ${SITE_NAV}
    <p class="home__lede">대한민국 어딘가에서 태어나 마지막 순간까지 삽니다. 태어날 곳은 고를 수 없습니다. 고를 수 있는 건 생각보다 적습니다.</p>
    <dl class="facts"><div><dt>소요</dt><dd>약 15분</dd></div><div><dt>끝</dt><dd>사망할 때까지</dd></div><div><dt>권장</dt><dd>19세 이상</dd></div></dl>
    ${cur ? `<div class="resume"><div class="resume__text"><p class="resume__title">하던 생애가 있습니다</p><p class="cap">${esc(cur.name ?? '')} · ${cur.age}세(${cur.year ?? ''}년)</p></div><button class="btn" type="button" data-go="resume">이어 하기</button></div>
    <div class="confirm" id="confirm-new" role="group" aria-labelledby="confirm-new-text" hidden>
      <p class="confirm__text" id="confirm-new-text">새로 태어나면 하던 생애(${esc(cur.name ?? '')} · ${cur.age}세)는 이어 할 수 없습니다. 그래도 새로 태어날까요?</p>
      <div class="confirm__actions"><button class="btn" type="button" data-go="resume">하던 생애 이어 하기</button><button class="btn btn--danger-fill" type="button" data-go="bornNew">새로 태어나기</button></div>
    </div>` : ''}
    <section class="era" aria-labelledby="era-t"><h2 class="era__title" id="era-t">태어날 시대</h2>
      <div class="era__chips" role="group" aria-label="태어날 시대">
        <button class="eraChip" type="button" data-era="" aria-pressed="${!S.era}"><span class="eraChip__name">무작위</span><span class="eraChip__line">1960~1985 어느 해든</span></button>
        ${ERAS.map(e => `<button class="eraChip" type="button" data-era="${e.decade}" aria-pressed="${S.era === e.decade}"><span class="eraChip__name">${e.decade}s</span><span class="eraChip__line">${esc(e.line)}</span><span class="eraChip__n">연 ${manText(decadeBirthsAvg(e.decade))} 명 출생</span></button>`).join('')}
      </div></section>
    <nav class="menu" aria-label="메뉴">
      <button class="linkrow" type="button" data-go="archive"><span><span class="linkrow__title">기록관</span><span class="linkrow__desc">${recs.length ? `지난 생애 ${recs.length}개 · 이 기기에만 저장` : '아직 기록이 없습니다'}</span></span></button>
      <button class="linkrow" type="button" data-go="codex"><span><span class="linkrow__title">통계 도감</span><span class="linkrow__desc">출처와 핵심 수치</span></span></button>
      <button class="linkrow" type="button" data-go="settings"><span><span class="linkrow__title">설정</span><span class="linkrow__desc">밝기 · 배속 · 모션</span></span></button>
    </nav>
    <p class="note">질병·사고·폭력·상실을 다루는 장면이 있습니다.</p>
    <p class="note">${PRIV}</p>
  </div>
  <div class="actionbar actionbar--single"><button class="btn btn--primary btn--block" type="button"${cur ? ' aria-controls="confirm-new" aria-expanded="false"' : ''} data-go="born">태어나기</button></div></section>`);
  $('.era__chips', homeEl).addEventListener('click', e => {
    const b = e.target.closest('[data-era]');
    if (!b) return;
    S.era = b.dataset.era ? +b.dataset.era : null;
    $$('[data-era]', homeEl).forEach(x => x.setAttribute('aria-pressed', x === b));
  });
  // Esc로 확인 닫기
  homeEl.addEventListener('keydown', e => {
    const c = $('#confirm-new', homeEl);
    if (e.key === 'Escape' && c && !c.hidden) { c.hidden = true; const b = $('[data-go="born"]', homeEl); b.setAttribute('aria-expanded', 'false'); b.focus(); }
  });
};

// 하던 생애가 있으면 새 생애 전에 페이지 안 확인(QA-E-04). 확인 없이는 저장된 생애를 건드리지 않는다.
function askNew() {
  if (document.body.dataset.screen !== 'home') { const a = S.again; routes.home(); S.again = a; }
  const c = $('#confirm-new');
  if (!c) return false;
  c.hidden = false;
  $('[data-go="born"]')?.setAttribute('aria-expanded', 'true');
  $('[data-go="resume"]', c).focus({ preventScroll: true });
  c.scrollIntoView({ block: 'center' });
  return true;
}

// ───────── S02 19세 안내 ─────────
routes.born = () => (loadCurrent() && askNew() ? undefined : S.settings.seen19 ? go('birth') : go('gate'));
routes.bornNew = () => (S.settings.seen19 ? go('birth') : go('gate'));
routes.gate = () => show('gate', `<section class="screen has-bar" data-screen="gate" aria-labelledby="gate-title"><div class="screen__body">
  <article class="doc"><p class="doc__formno">■ 태어나보니 대한민국 [안내]</p><div class="doc__head"><h1 class="doc__title" id="gate-title">태어나기 전에</h1></div>
  <ol class="notice-list">
    <li>19세 이상을 위해 만들었습니다.</li>
    <li>병·사고·폭력·상실·자해가 나옵니다. 짧게만 적습니다.</li>
    <li>약 15분. 손을 떼도 삶은 흘러갑니다. 선택은 자동결정이 기본(설정에서 끔).</li>
  </ol>
  <p class="gate__line">어디서, 누구로 태어날지는 아무도 고르지 않습니다.</p></article></div>
  <div class="actionbar"><button class="btn" type="button" data-go="home">홈으로</button><button class="btn btn--primary" type="button" data-go="gateOk">확인하고 태어나기</button></div></section>`);
routes.gateOk = () => { setSetting('seen19', true); go('birth'); };
routes['again-era'] = () => { go('home'); const c = $('.eraChip'); c?.scrollIntoView?.({ block: 'center' }); c?.focus?.({ preventScroll: true }); };   // 시대 고르는 홈 영역으로
routes.again = () => go('born');                  // 하던 생애가 있으면 확인을 거친다
// 같은 시드·같은 시대 고정으로 다시 태어난다(HOOK-30S P0-6). 하던 생애가 있으면 같은 확인을 거친다.
routes['again-same'] = () => { const v = S.view; S.again = v ? { seed: v.L.seed, forced: v.forced ?? null } : null; go('born'); };

// ───────── S03 출생 신고서 ─────────
const dots = q => `<span class="dots" role="img" aria-label="${quintileAria(q)}">${[1, 2, 3, 4, 5].map(i => `<i${i <= q ? ' class="is-on"' : ''}></i>`).join('')}</span>`;
function certForm(cert, L, withDots) {
  const b = L.birth, q = cert.quintile ?? b.quintile;
  const region = String(cert.regionLabel ?? '').includes('·') ? cert.regionLabel : `${cert.regionLabel ?? regionShort(b.region)} · ${(cert.urban ?? b.urban) ? '도시' : '농촌'}`;
  const rows = [
    ['성명', `${esc(L.name)} (${sexLabel(L.sex)})`], ['출생일', dateKo(b)], ['출생지', esc(region)],
    ['가구 형편', (withDots && q ? dots(q) : '') + esc(cert.quintileLabel ?? '')],
    ['부모', esc(cert.parentsLine ?? '').replace(/,\s*(어머니)/, '<br>$1')], ['주거', esc(cert.homeLine ?? '')],
    ['의료 접근', esc(cert.accessLine ?? '')], ['시대', esc(cert.eraLine ?? '')],
  ];
  return `<dl class="form">${rows.map(([l, v]) => `<div class="form__row"><dt class="form__label">${l}</dt><dd class="form__value">${v}</dd></div>`).join('')}</dl>`;
}
const peerBirthLine = p => p.birthLine || p.homeLine || '';
const peerLi = (p, line, self) => `<li class="peer"><span class="peer__name">${esc(p.name)}</span><span class="peer__meta">${sexLabel(p.sex)} · ${esc(p.regionLabel ?? regionShort(p.region))}</span>${self ? ' <span class="tag">본인</span>' : ''}${line ? `<p class="peer__line">${esc(line)}</p>` : ''}</li>`;

// 출생 시퀀스(HOOK-30S § 인트로 재기획): 카드 3장(언제·어디서·어떤 집)을 뒤집는다 → 탄생 장면 + 이름 → 가족사 한 줄 → "몇 살까지?" 질문.
// 탭하면 다음 단계로 앞당기고, [건너뛰기]·하단 [삶을 시작하기]로 언제든 나간다. 사망 화면에서 질문의 답을 보여 준다.
const bornAtHospital = b => b.year >= 2000 || (b.year >= 1985 && b.urban !== false);
const CAPITAL = ['seoul', 'incheon', 'gyeonggi'];
const AREA = { yeongnam: ['busan', 'daegu', 'ulsan', 'gyeongbuk', 'gyeongnam'], honam: ['gwangju', 'jeonbuk', 'jeonnam'], chungcheong: ['daejeon', 'sejong', 'chungbuk', 'chungnam'], gangwon: ['gangwon'], jeju: ['jeju'] };
const FH = [...FAMILY_HISTORY, ...FAMILY_HISTORY_EXT];
// 문장 속 친족어가 실제 가족 구성과 어긋나면 뺀다(A7): 출생 때 살아 있는 조부모, 한부모·맞벌이, 손위 형제.
// ponytail: 친족어 정규식 판별. 이모·삼촌·고모·사촌은 엔진이 모형화하지 않아 거르지 않는다(모형화되면 여기에 추가).
export function kinOk(line, L) {
  const p = L.birth.parents, f = L.family || {}, s = line.replace(/이웃(집)? ?형/g, '');
  const gp = f.gp || [], has = (side, sex) => gp.some(g => g.alive && (!side || g.side === side) && (!sex || g.sex === sex));
  const older = (f.siblingMembers || []).filter(m => m.birthYear < L.birth.year || (m.birthYear === L.birth.year && L.birth.order > 1));
  const rules = [
    [/외할아버지/, () => has('maternal', 'M')], [/외할머니/, () => has('maternal', 'F')],
    [/(?<![외조])할아버지/, () => has(null, 'M')], [/(?<!외)할머니/, () => has(null, 'F')],
    [/조부모/, () => has()],
    [/(?<!큰|작은|할)아버지|(?<!조)부모/, () => !p.singleParent], [/맞벌이/, () => p.dualIncome],
    [/형(은|이|과|와|의)|큰형/, () => L.sex === 'M' && older.some(m => m.sex === 'M')],
  ];
  return rules.every(([re, ok]) => !re.test(s) || ok());
}
// 가족사 한 줄: 출생연도·지역권·형편으로 거른 뒤 시드로 고정 선택(같은 출생 = 같은 줄)
export function familyLine(L) {
  const b = L.birth, cap = CAPITAL.includes(b.region);
  const pool = FH.filter(f => b.year >= f.cohorts[0] && b.year <= f.cohorts[1]
    && (!f.regionGroup || (f.regionGroup === 'capital' ? cap : !cap || b.urban === false))
    && (!f.region || AREA[f.region]?.includes(b.region))
    && (!f.wealth || (f.wealth === 'low' ? b.quintile <= 2 : b.quintile >= 4))
    && kinOk(f.line, L));
  return pool.length ? pool[(L.seed >>> 0) % pool.length].line : '';
}
// 출생 때 기대수명(모형, 반올림). 0세가 아니면 같은 시드로 갓 태어난 생애를 다시 만들어 잰다.
export const birthE0 = (L, forced) => {
  try { return Math.round(expectedRemainingYears(L.age === 0 && L.alive ? L : newLife({ seed: L.seed, modelVersion: L.modelVersion, forced: forced ?? undefined }))); } catch { return 0; }
};
function cineHtml(L, cert, e0, same) {
  const b = L.birth, hosp = bornAtHospital(b);
  const place = hosp ? '산부인과 병원' : `${TENURE_LABEL[b.tenure] ?? ''} 집`.trim();
  const ord = b.siblings === 0 ? '외동' : ORDER_L[b.order - 1] ?? '막내';
  const cards = [['언제', `<span class="mono" data-roll>${b.year}</span>년 ${b.month}월`], ['어디서', esc(cert.regionLabel ?? regionShort(b.region))],
    ['어떤 집', `${esc(TENURE_LABEL[b.tenure] ?? '')} · ${esc(cert.quintileLabel ?? '')} ${dots(cert.quintile ?? b.quintile)}`]];
  const lines = [`${L.sex === 'F' ? '딸' : '아들'}, ${ord}. 이름은 ${L.name}.`, familyLine(L), e0 ? `이 아이의 기대수명은 약 ${e0}년.` : ''].filter(Boolean);
  return `<div class="cine is-veil" data-cine><div class="cine__veil"></div>
    <div class="draw"><p class="draw__head">${same ? '같은 집, 같은 날.' : '어디서, 누구로 태어날지는 고를 수 없다.'}</p>
      <ol class="draw__cards">${cards.map(([k, v], i) => `<li><button class="drawcard" type="button" data-draw="${i}"><span class="drawcard__k">${k}</span><span class="drawcard__v">${v}</span></button></li>`).join('')}</ol>
      <p class="draw__hint">카드를 눌러 뒤집으세요</p></div>
    <div class="cine__stage">${sceneHtml(L, { over: { birth: hosp ? 'hospital' : 'home', place: hosp ? 'hospital' : null, still: false } })}<p class="cine__place"><span class="mono">${b.year}</span>년 · ${esc(regionShort(b.region))} · ${esc(place)}</p></div>
    <div class="cine__lines" aria-live="polite">${lines.map(t => `<p class="cine__line">${esc(t)}</p>`).join('')}
      <p class="cine__line cine__q">몇 살까지 살까?</p>
      <div class="cine__line cine__guess">${e0 ? `<button class="btn" type="button" data-guess="under">${e0}세 전에</button><button class="btn" type="button" data-guess="over">${e0}세 넘어서</button>` : '<button class="btn" type="button" data-guess="">지켜보기</button>'}</div></div>
    <button class="cine__tap" type="button" data-act="skip"><span class="cine__skip">건너뛰기</span></button></div>`;
}

routes.birth = () => {
  let L, cert = {};
  const again = S.again, same = !!again;      // [같은 출생으로 다시]: 시드·시대 고정을 그대로(엔진 결정성)
  S.again = null;
  const seed = again?.seed ?? globalThis.crypto?.getRandomValues?.(new Uint32Array(1))[0] ?? Math.floor(Math.random() * 2 ** 32);
  S.forced = again ? again.forced : S.era ? { year: pickYear(S.era, (seed >>> 0) / 2 ** 32) } : null;
  try { L = newLife({ seed, forced: S.forced ?? undefined }); } catch (e) { console.error(e); toast('태어날 곳을 정하지 못했습니다. 잠시 뒤 다시 해 주세요.'); return go('home'); }
  try { cert = birthCert(L) || {}; } catch (e) { console.error(e); }
  S.L = L; S.cert = cert; S.sum = null; S.view = null; S.guess = null;
  const e0 = birthE0(L);
  const b = L.birth;
  const el = show('birth', `<section class="screen has-bar birth" data-screen="birth" aria-labelledby="birth-title"><div class="screen__body">
    <div class="birth__scene"></div>
    <div class="birth__chips"><span class="chip">${iconSvg('home')}${esc(regionShort(b.region))} · ${b.urban === false ? '농촌' : '도시'}</span><span class="chip">${iconSvg('doc')}${esc(TENURE_LABEL[b.tenure] ?? '')}</span><span class="chip">${iconSvg('people')}${dots(cert.quintile ?? b.quintile)}</span><span class="chip">${iconSvg('child')}<span class="mono">${b.year}</span>년 출생</span></div>
    <article class="doc">
      <p class="doc__formno">■ 태어나보니 대한민국 [별지 제1호서식]</p>
      <div class="doc__head"><h1 class="doc__title" id="birth-title">출생신고서</h1><dl class="doc__no"><dt>접수번호</dt><dd>${receiptNo(b, L.seed)}</dd></dl></div>
      ${cert.story ? `<p class="doc__lede">${esc([].concat(cert.story).join(' '))}</p>` : ''}
      ${certForm(cert, L, true)}
      <div class="doc__sign"><p class="doc__foot">자료: 통계청 인구동향조사 외<br><button class="btn btn--quiet btn--sm" type="button" aria-haspopup="dialog" data-act="src">출처 보기</button></p>
        <span class="seal seal--round is-stamping" aria-hidden="true"><span>접수<small>${dateDot(b)}</small></span></span></div>
      <section class="birth__peers" aria-labelledby="birth-peers"><h2 class="birth__peers-title" id="birth-peers">같은 날 태어난 사람들</h2>
        <ul class="peer-list" data-peers><li class="peer"><p class="peer__line">같은 날 태어난 사람을 찾고 있습니다.</p></li></ul></section>
    </article></div>
    ${cineHtml(L, cert, e0, same)}
    <div class="actionbar">
      <p class="actionbar__note">준비되면 [삶을 시작하기]를 눌러 주세요.</p>
      <button class="btn" type="button" aria-haspopup="dialog" data-act="share">신고서 공유</button>
      <button class="btn btn--primary" type="button" data-act="start">삶을 시작하기</button>
    </div></section>`);

  // 같은 날 태어난 3명(엔진이 각자 끝까지 돌림) — 첫 화면을 먼저 그린 뒤 계산
  setTimeout(() => {
    const ul = $('[data-peers]', el);
    if (!ul?.isConnected) return;
    try { ul.innerHTML = [...peers(L)].sort((a, c) => (a.order ?? 0) - (c.order ?? 0)).map(p => peerLi(p, peerBirthLine(p))).join(''); }
    catch (e) { console.error(e); ul.closest('section').hidden = true; }
  }, 60);

  const start = () => startNew(L);   // 출생 카드는 자동으로 넘어가지 않는다: [삶을 시작하기]만
  // 시퀀스: 카드 3장(탭, 손을 떼면 4초 뒤 다음 장이 저절로) → 탄생 장면 + 한 줄씩(초당 약 9자) → 질문에 답하면 출생 카드. 자동 시작 없음
  // 두 번째 생애부터는 카드가 0.5초 간격으로 저절로, 같은 출생이면 처음부터 펼쳐져 있다.
  const cine = $('[data-cine]', el), cts = [], cards = $$('.drawcard', cine), lines = $$('.cine__line', cine);
  const fast = loadRecords().length > 0, rm = reduced();
  let phase = 0, li = 0, tLine;
  const later = (f, ms) => { const t = setTimeout(f, ms); cts.push(t); return t; };
  const endCine = () => {
    cts.forEach(clearTimeout);
    if (!el.isConnected || cine.classList.contains('is-out')) return;
    cine.classList.add('is-out'); setTimeout(() => cine.remove(), 420);
    $('.birth__scene', el).innerHTML = sceneHtml(L);       // 카드 화면의 정지 장면은 건너뛴 뒤에 그린다(출생 화면 첫 렌더 부담 줄이기)
  };
  const readMs = t => 600 + (t.textContent || '').trim().length * 111;   // 초당 약 9자
  const nextLine = () => {
    clearTimeout(tLine);
    const ln = lines[li++];
    if (!ln) return;
    ln.classList.add('on');
    if (ln.classList.contains('cine__q')) { lines[li++]?.classList.add('on'); $('[data-guess]', cine)?.focus({ preventScroll: true }); return; }
    tLine = later(nextLine, readMs(ln));
  };
  const born = () => { phase = 1; cine.classList.add('is-born'); mountScene(cine, L, { yearMs: 9000, speed: 1 }); tLine = later(nextLine, rm ? 300 : 1200); };
  const roll = n => {
    if (rm || !n) return;
    const v = n.textContent; let k = 0;
    const t = setInterval(() => { n.textContent = String(1960 + Math.floor(Math.random() * 66)); if (++k > 12 || !n.isConnected) { clearInterval(t); n.textContent = v; } }, 55);
  };
  let tIdle;
  const flip = i => {
    clearTimeout(tIdle);
    const c = cards[i];
    if (!c || c.classList.contains('is-open')) return;
    c.classList.add('is-open');
    if (i === 0) roll($('[data-roll]', c));
    const rest = cards.findIndex(x => !x.classList.contains('is-open'));
    if (rest < 0) { cine.classList.add('is-drawn'); later(born, fast ? 900 : 1300); }
    else tIdle = later(() => flip(rest), fast ? 500 : 3000);
  };
  if (same) { cards.forEach(c => c.classList.add('is-open')); cine.classList.add('is-drawn'); later(born, 1400); }
  else tIdle = later(() => flip(0), fast ? 400 : 3000);
  cine.addEventListener('click', e => {
    if (e.target.closest('.cine__tap')) return endCine();
    const g = e.target.closest('[data-guess]');
    if (g) { if (g.dataset.guess) S.guess = { seed: L.seed, e0, over: g.dataset.guess === 'over' }; return endCine(); }
    if (phase === 1) return nextLine();
    const c = e.target.closest('[data-draw]');
    flip(c && !c.classList.contains('is-open') ? +c.dataset.draw : cards.findIndex(x => !x.classList.contains('is-open')));
  });
  el.addEventListener('click', e => {
    const a = e.target.closest('[data-act]')?.dataset.act;
    if (a === 'start') start();
    if (a === 'share') openShare({ L, cert }, 'birth', { only: 'birth' });
    if (a === 'src') openSources('출생 자료 출처', cert.src ?? Object.entries(S.sources).filter(([k]) => k.startsWith('R01')).map(([, v]) => v));
  });
};

// ───────── S09 사망 ─────────
routes.death = () => {
  const L = S.L, sum = S.sum, d = sum?.death ?? L.death ?? { age: L.age, year: L.year };
  const sens = !!(d.sensitive ?? L.death?.sensitive);
  const de = [...L.log].reverse().find(e => e.kind === 'death');
  const causeE0 = `<p class="death__cause">${deathLine({ ...L.death, ...d, sensitive: sens }, S.settings.hideSensitiveCause)}</p>
      ${sens || d.horizon || d.age < 19 ? '' : e0Answer(L, d.age)}`;
  const el = show('death', `<section class="screen screen--paper death" data-screen="death" aria-labelledby="death-name">
    <div class="death__inner">
      <div class="death__scene">${sceneHtml(L, { still: true, dead: true })}</div>
      <p class="death__label">${d.horizon ? '관찰 종료' : '마지막 해'}</p>
      <p class="death__year">${d.year}</p>
      <h1 class="death__name" id="death-name">${esc(L.name)}</h1>
      <p class="death__years">${L.birth.year} – ${d.year} · ${ageText(d.age, d.horizon)}</p>
      ${causeE0}
    </div>
    <div class="actionbar actionbar--single">
<p class="actionbar__note">읽고 난 뒤 직접 넘겨 주세요.</p>
      <button class="btn btn--ink btn--block" type="button" data-act="sum">결산 보기</button>
    </div></section>`);
  deathCine(el, L, d, sens ? null : sum?.epilogue?.coda, de, causeE0);
};

// 출생 때 던진 "몇 살까지 살까?"의 답. 민감 사망·19세 미만·관찰 종료에는 부르지 않는다.
function e0Answer(L, age) {
  const g = S.guess?.seed === L.seed ? S.guess : null, e0 = g?.e0 || birthE0(L, S.forced);
  if (!e0) return '';
  const diff = age - e0;
  return `<p class="death__e0">출생 때 기대수명 ${e0}년 · ${diff > 0 ? `${diff}년 더 살았다.` : diff < 0 ? `${-diff}년 짧았다.` : '꼭 그만큼 살았다.'}</p>${g ? `<p class="death__guess">당신의 예상: ${e0}세 ${g.over ? '넘어서' : '전에'}</p>` : ''}`;
}

// 마지막 페이지는 사용자가 한 장씩 넘긴다. 자동결정·배속·모션 설정의 영향을 받지 않는다.
function deathCine(el, L, d, coda, entry, causeE0 = '') {
  const horizon = !!d.horizon;
  const lines = [horizon ? '여기까지의 삶' : '한 사람의 시간이 멈췄습니다', L.name,
    `${L.birth.year}년부터 ${d.year}년까지 · ${ageText(d.age, horizon)}`];
  const closing = horizon ? '관찰은 여기서 끝납니다. 살아온 날들의 기록은 남아 있습니다.'
    : coda || '이름 아래, 함께한 사람들과 지나온 날들이 남았습니다.';
  const finalRecord = !d.sensitive && !L.death?.sensitive ? entry?.text : null;
  el.insertAdjacentHTML('beforeend', `<div class="dcine" data-dcine><div class="dcine__lines">
    ${lines.map((t, i) => `<p class="dcine__line on${i === 1 ? ' dcine__name' : ''}">${esc(t)}</p>`).join('')}
    <p class="dcine__line on dcine__closing">${esc(closing)}</p></div>
    <div class="dcine__details">${causeE0}${finalRecord ? `<p class="dcine__eyebrow">마지막 기록</p><p>${esc(finalRecord)}</p>` : ''}</div></div>`);
  // 버튼 하나로 결산까지(F-9): 사인·기대수명 답을 검정 페이지에 함께 두고, 같은 자리 버튼을 두 번 누르게 하지 않는다.
  const button = $('[data-act="sum"]', el);
  button.textContent = '살아온 날들 돌아보기';
  button.addEventListener('click', () => go('summary'));
}

// ───────── S10 결산 (기록관 상세 S12-b 공용) ─────────
function lifegrid(age, events) {
  let h = '';
  for (let r = 0; r <= Math.floor(age / 10); r++) {
    h += `<span class="lifegrid__dec">${r * 10}</span>`;
    for (let c = 0; c < 10; c++) {
      const a = r * 10 + c;
      h += `<i class="lifegrid__cell${a < age ? (events.has(a) ? ' is-event' : ' is-lived') : a === age ? ' is-death' : ''}"></i>`;
    }
  }
  return `<div class="lifegrid" role="img" aria-label="${age}년을 산 해별 표시. 연표에 남은 해 ${events.size}개.">${h}</div>`;
}
const lifelines = ps => { const mx = Math.max(1, ...ps.map(p => p.deathAge || 0)); return `<div class="lifelines" aria-hidden="true">${ps.map(p => `<div class="lifeline${p.self ? ' is-self' : ''}"><span class="lifeline__name">${esc(p.name)}</span><span class="lifeline__track" style="--w:${Math.round((p.deathAge || 0) / mx * 100)}"><span class="lifeline__bar"></span>${silhouetteSvg(p.deathAge || 0, { cls: 'lifeline__fig' })}</span><span class="lifeline__age">${p.deathAge ?? ''}세</span></div>`).join('')}</div>`; };
function summaryHtml(L, sum, archive) {
  const b = L.birth, d = sum.death ?? L.death, v = sum.verdict ?? { main: '' }, ep = sum.epilogue, ds = sum.deathStory;
  const cause = causeLabel({ ...L.death, ...d }, S.settings.hideSensitiveCause);
  const tl = sum.timeline || [];
  const events = new Set(tl.map(t => t.age));
  const myOrder = b.minute ?? sum.birthCert?.order ?? -1;          // 출생 시각(분) = 동료 order와 같은 척도
  const ps = [...(sum.peers || []).map(p => ({ ...p })), { name: L.name, sex: L.sex, regionLabel: regionShort(b.region), deathAge: d.age, line: '', order: myOrder, self: true }]
    .sort((a, c) => (a.order ?? 0) - (c.order ?? 0));
  const peerLine = p => { const t = p.line || ''; return /^\d+세/.test(t) ? t : `${p.deathAge}세까지.${t ? ' ' + t : ''}`; };
  const issues = [...(sum.issues || [])].sort((a, c) => c.value - a.value);
  return `<section class="screen has-bar summary" data-screen="summary" aria-labelledby="sum-name">
  ${archive ? '<header class="topbar"><button class="back" type="button" data-go="archive">기록관</button><p class="topbar__title">기록 상세</p></header>' : ''}
  <div class="screen__body">
    <header class="lifehead">
      <p class="lifehead__label">결산 · 기록 ${d.year}-${mmdd(b)}</p>
      <h1 class="lifehead__name" id="sum-name">${esc(L.name)}</h1>
      <p class="lifehead__years">${dateDot(b)} – ${d.year} · ${ageText(d.age, d.horizon)}${d.horizon ? ' · 관찰 종료' : cause ? ' · ' + esc(cause) : ''}</p>
    </header>
    <button class="btn btn--primary btn--block summary__share" type="button" aria-haspopup="dialog" data-card="verdict">내 인생 카드 저장·공유</button>
    <article class="doc verdict epi" aria-labelledby="verdict-title">
      <p class="doc__formno">■ 태어나보니 대한민국 [별지 제2호서식]</p>
      <h2 class="verdict__title" id="verdict-title">인생 판정문</h2>
      ${ep ? `<p class="epi__title">${esc(ep.title)}</p>
      <p class="epi__who">${esc(L.name)} · ${b.year}–${d.year}</p>
      <div class="epi__body">${ep.paragraphs.map((t, i) => `<p style="--i:${i}">${esc(t)}</p>`).join('')}</div>
      ${ep.lifeStory?.paragraphs.length ? `<section class="epi__body" aria-label="선택과 생활의 기록"><h3>선택이 남긴 기록</h3>${ep.lifeStory.paragraphs.map(t => `<p>${esc(t)}</p>`).join('')}</section>` : ''}
      ${ep.choices?.length ? `<section class="epi__choices"><h3>내가 고른 순간들</h3><ol>${ep.choices.map(e => `<li><b>${e.year}년 · ${e.age}세</b> ${esc(e.label)}${e.result ? `<p>${esc(e.result)}</p>` : ''}</li>`).join('')}</ol></section>` : ''}<p class="verdict__main epi__coda">${esc(v.main)}</p>` : `<p class="verdict__main">${esc(v.main)}</p>`}
      ${ds ? `<section class="epi__death" aria-label="사망 기록"><p class="epi__deathline"><span class="mono">${ds.year}년</span>, ${ageText(ds.age)}${cause ? ` — 직접 사인: ${esc(cause)}` : ''}</p>${ds.narrative && cause ? `<p class="epi__narrative">${esc(ds.narrative)}</p>` : ''}${ds.statistic && cause ? `<p class="epi__stat">통계 · ${ds.statistic.year}년 전국 사망자 중 ${esc(cause)} 관련 분류 ${ds.statistic.percent}%<small>전체 사망자 ${ds.statistic.total.toLocaleString()}명 기준 · 게임 속 사망 연도와는 별개인 참고 통계<br><a href="${esc(ds.statistic.url)}" target="_blank" rel="noopener">${esc(ds.statistic.source)}</a></small></p>` : ''}${cause && ds.steps?.length ? `<p class="epi__chain">참고 배경 · ${ds.steps.map(esc).join(' · ')}</p>` : ''}</section>` : ''}
      ${sum.capNotice ? `<p class="cap verdict__cap">${esc(sum.capNotice)}</p>` : ''}
      <div class="verdict__sign"><p class="mono">${d.year}년</p><p class="verdict__org">태어나보니 대한민국</p><span class="seal seal--square" aria-hidden="true"><span>인</span><span>생</span><span>판</span><span>정</span></span></div>
    </article>
    ${/* 통계 위치: 민감 사망·19세 미만 사망은 순위·백분위를 보이지 않는다(안전 규칙) */ ''}${d.sensitive || L.death?.sensitive || d.age < 19 ? '' : standingHtml(standingOf(L, 'end'))}
    <section class="section" aria-labelledby="sum-closing">
      <div class="section__head"><h2 class="section__title" id="sum-closing">결산</h2><span class="section__note">0~100 · 누르면 근거</span></div>
      ${CLOSING_KEYS.filter(k => sum.closing?.[k]).map(k => {
        const c = sum.closing[k], body = srcList(c.src);
        return `<details class="metric"><summary class="metric__sum"><span class="metric__label">${esc(c.label ?? CLOSING_LABEL[k])}</span><span class="metric__value">${c.value}</span>${meter(c.value)}<span class="metric__reason">${esc(c.line ?? '')}</span></summary><div class="metric__body">${body}</div></details>`;
      }).join('')}
    </section>
    <section class="section" aria-labelledby="sum-issues">
      <div class="section__head"><h2 class="section__title" id="sum-issues">내가 마주한 관심사·고민</h2><span class="section__note" title="성인기 70% + 최근 10년 30% 가중 평균.">말년 가중 관심도 · 강한 순</span></div>
      <div class="sum-radar">${radarSvg('issue', {}, { size: 280, aria: '관심사·고민 10축 지도' })}</div>
      ${issues.map(i => `<div class="metric"><div class="metric__sum"><span class="metric__label">${esc(i.label)}</span><span class="metric__value">${i.value}</span>${meter(i.value)}<span class="metric__reason">${esc(i.lines?.[0] ?? '')}</span></div></div>`).join('')}
    </section>
    ${familyLines(L).length ? `<section class="section" aria-labelledby="sum-fam"><div class="section__head"><h2 class="section__title" id="sum-fam">가족</h2></div><ul class="famlist">${familyLines(L).map(x => `<li>${esc(familyText(x))}</li>`).join('')}</ul></section>` : ''}
    <section class="section" aria-labelledby="sum-tl">
      <div class="section__head"><h2 class="section__title" id="sum-tl">생애 연표</h2><span class="section__note">1칸 = 1년</span></div>
      ${lifegrid(d.age, events)}
      <p class="legend" aria-hidden="true"><span><i class="lifegrid__cell is-lived"></i>산 해</span><span><i class="lifegrid__cell is-event"></i>연표에 남은 해</span><span><i class="lifegrid__cell is-death"></i>마지막 해</span></p>
      <ol class="timeline">${tl.map(t => `<li class="tl"><p class="tl__age">${t.age}세<span class="tl__year">${t.year}</span></p><p class="tl__text">${esc(t.text)}${t.choice ? ` <span class="tag">선택</span>${t.choice.auto ? ' <span class="tag">기본 행동</span>' : ''}` : ''}${t.reason ? `<span class="tl__reason">${esc(t.reason)}</span>` : ''}</p></li>`).join('')}</ol>
    </section>
    <section class="section" aria-labelledby="sum-peers">
      <div class="section__head"><h2 class="section__title" id="sum-peers">같은 날 태어난 사람들</h2><span class="section__note">태어난 순서</span></div>
      ${lifelines(ps)}
      <ul class="peer-list">${ps.map(p => peerLi(p, peerLine(p), p.self)).join('')}</ul>
      <p class="peers__close">네 사람 모두 같은 날 태어났습니다. 어디서 누구로 태어날지는 아무도 고르지 않았습니다.</p>
    </section>
    <details class="birth-again"><summary>출생 신고서 다시 보기</summary>${certForm(sum.birthCert ?? S.cert ?? {}, L, false)}</details>
    <section class="rest" aria-labelledby="sum-share">
      <p class="rest__text">이름부터 가족·자산까지, 나의 생애를 한 장에 남겨보세요.</p>
      <h2 class="sr-only" id="sum-share">카드로 남기기</h2>
      <div class="cardpick">
        <button class="linkrow" type="button" aria-haspopup="dialog" data-card="birth"><span><span class="linkrow__title">출생 신고서</span><span class="linkrow__desc">어떤 조건에서 시작했는가</span></span></button>
        <button class="linkrow" type="button" aria-haspopup="dialog" data-card="verdict"><span><span class="linkrow__title">내 인생 카드 공유하기</span><span class="linkrow__desc">직업·거주·자산·가족·선택을 한 장에</span></span></button>
        <button class="linkrow" type="button" aria-haspopup="dialog" data-card="timeline"><span><span class="linkrow__title">생애 연표</span><span class="linkrow__desc">무엇을 감당했고, 무엇을 남겼는가</span></span></button>
      </div>
    </section>
    ${sum.sources?.length ? `<details class="birth-again"><summary>출처 ${toMetas(sum.sources).length}개</summary>${srcList(sum.sources)}</details>` : ''}
    <nav class="menu sum-more" aria-label="더 보기">
      <button class="linkrow" type="button" data-go="archive"><span><span class="linkrow__title">${archive ? '기록 목록으로' : '기록관'}</span><span class="linkrow__desc">지난 생애 모아 보기</span></span></button>
      <button class="linkrow" type="button" data-go="again-era"><span><span class="linkrow__title">시대 선택해 태어나기</span><span class="linkrow__desc">태어날 연대를 고릅니다</span></span></button>
    </nav>
  </div>
  <div class="actionbar">
    <p class="actionbar__note">같은 집, 같은 날. 이번엔 다르게 골라 보세요.</p>
    <button class="btn" type="button" data-go="again-same">같은 출생으로 다시</button><button class="btn btn--primary" type="button" data-go="again">다시 태어나기</button>
  </div></section>`;
}
function showSummary(L, sum, archive, forced = S.forced) {
  S.view = { L, sum, cert: sum.birthCert ?? S.cert ?? {}, forced };
  const el = show('summary', summaryHtml(L, sum, archive));
  setTimeout(() => morphRadar($('.sum-radar .radar', el), L.issues, 900), 120);
  el.addEventListener('click', e => {
    const k = e.target.closest('[data-card]')?.dataset.card;
    if (k) openShare(S.view, k);
  });
}
const summaryFail = (rec, archive) => show('summary', `<section class="screen has-bar summary" data-screen="summary" aria-labelledby="sum-name">
  ${archive ? '<header class="topbar"><button class="back" type="button" data-go="archive">기록관</button><p class="topbar__title">기록 상세</p></header>' : ''}
  <div class="screen__body"><header class="lifehead"><p class="lifehead__label">결산</p><h1 class="lifehead__name" id="sum-name">${esc(rec.name)}</h1>
  <p class="lifehead__years">${rec.birthYear} – ${rec.deathYear ?? ''} · ${ageText(rec.deathAge, rec.horizon)}</p></header>
  ${rec.verdictMain ? `<p class="verdict__main">${esc(rec.verdictMain)}</p>` : ''}<p class="empty">이 기록은 요약만 남아 있습니다.</p></div>
  <div class="actionbar"><button class="btn" type="button" data-go="archive">${archive ? '목록으로' : '기록관'}</button><button class="btn" type="button" data-go="again-era">시대 선택해 태어나기</button><button class="btn btn--primary" type="button" data-go="again">다시 태어나기</button></div></section>`);

routes.summary = () => {
  if (!S.sum) { try { S.sum = summarize(S.L, opts()); } catch (e) { console.error(e); } }
  if (!S.sum) return summaryFail({ name: S.L.name, birthYear: S.L.birth.year, deathYear: S.L.death?.year, deathAge: S.L.death?.age ?? S.L.age }, false);
  showSummary(S.L, S.sum, false);
};

// ───────── S12 기록관 ─────────
routes.archive = () => {
  const recs = loadRecords();
  const years = recs.map(r => r.birthYear);
  const el = show('archive', `<section class="screen screen--paper" data-screen="archive">
    <header class="topbar"><button class="back" type="button" data-go="home">홈</button><h1 class="topbar__title">기록관</h1></header>
    <div class="screen__body">
    ${recs.length ? `<dl class="tally"><div><dt>기록</dt><dd>${recs.length}</dd></div><div><dt>태어난 해</dt><dd>${Math.min(...years)}–${Math.max(...years)}</dd></div><div><dt>함께 산 해</dt><dd>${recs.reduce((s, r) => s + (r.deathAge || 0), 0)}년</dd></div></dl>
      <p class="cap archive__cap">이 기기에만 저장됩니다. 최근 30개까지.</p>
      <ol class="records">${recs.map((r, i) => `<li><button class="record" type="button" data-rec="${i}"><span class="record__no">${recs.length - i}</span><span><span class="record__name">${esc(r.name)}</span><span class="record__years">${r.birthYear}–${r.deathYear ?? r.birthYear + r.deathAge} · ${r.deathAge}세</span></span><span class="record__verdict">${esc(r.verdictMain)}</span></button></li>`).join('')}</ol>`
      : '<p class="empty">아직 끝난 생애가 없습니다.</p><button class="btn btn--primary btn--block" type="button" data-go="born">태어나기</button>'}
    </div></section>`);
  el.addEventListener('click', e => {
    const i = e.target.closest('[data-rec]')?.dataset.rec;
    if (i == null) return;
    const rec = recs[+i];
    pushScreen('detail');
    try {
      const L = replay(rec.seed, rec.choices, { ...(rec.forcedYear ? { forced: { year: rec.forcedYear } } : {}), modelVersion: rec.modelVersion ?? 1 });
      if (rec.capped) L.flags.capped = L.age;       // 시간 상한 고지는 replay가 복원하지 않으므로 기록의 표시로(QA-E-02)
      showSummary(L, summarize(L, opts()), true, rec.forcedYear ? { year: rec.forcedYear } : null);
    } catch (err) { console.error(err); summaryFail(rec, true); }
  });
};

// ───────── S13 통계 도감 ─────────
const latest = (vals, max = 2025) => {
  const k = Object.keys(vals || {}).filter(y => /^\d{4}$/.test(y) && +y <= max).sort().at(-1);
  return k ? [vals[k], k] : null;
};
const pct = x => `${(x * 100).toFixed(1)}%`;
const last = fmt => t => { const r = latest(t.values); return r && [fmt(r[0]), r[1]]; };
const CODEX = [
  ['출생·수명', [
    ['합계출산율', 'birth', 'TFR_BY_YEAR', last(v => v.toFixed(2))],
    ['출생아 수', 'birth', 'BIRTHS_BY_YEAR', last(v => `${Math.round(v).toLocaleString('ko-KR')}명`)],
    ['기대수명 남 / 여', 'mortality', 'E0_TARGET', t => { const m = latest(t.values.M), f = latest(t.values.F); return m && f && [`${m[0]} / ${f[0]}`, m[1]]; }],
    ['저체중아 비중', 'birth', 'LBW_SHARE', last(pct)],
    ['어린이집 이용률(0~5세)', 'birth', 'DAYCARE_SHARE', last(pct)],
  ]],
  ['교육', [
    ['대학 진학률', 'education', 'COLLEGE_ENTRY_RATE', last(pct)],
    ['재수생 비중', 'education', 'RETAKE_SHARE', last(pct)],
  ]],
  ['일', [
    ['청년 실업률', 'labor', 'YOUTH_UNEMP', last(v => `${v.toFixed(1)}%`)],
    ['여성 임금 / 남성 임금', 'labor', 'GENDER_WAGE_RATIO', last(pct)],
  ]],
  ['건강', [
    ['암 5년 상대생존율', 'health', 'CANCER_SURVIVAL_5Y', t => [pct(t.values.all), t.year]],
  ]],
];
const MODS = ['birth', 'mortality', 'education', 'labor', 'health'];
routes.codex = async () => {
  const el = show('codex', `<section class="screen screen--paper" data-screen="codex">
    <header class="topbar"><button class="back" type="button" data-go="home">홈</button><h1 class="topbar__title">통계 도감</h1></header>
    <div class="screen__body">
      <div class="seg filter" role="group" aria-label="구분">${[['all', '전체'], ['measured', '통계'], ['projected', '전망']].map(([k, l], i) => `<button class="seg__btn" type="button" data-filter="${k}" aria-pressed="${i === 0}">${l}</button>`).join('')}</div>
      <div data-codex><p class="cap cap--pad">불러오는 중입니다.</p></div>
    </div></section>`);
  const mods = Object.fromEntries((await Promise.allSettled(MODS.map(m => import(`../data/${m}.js`)))).map((r, i) => [MODS[i], r.value || {}]));
  const box = $('[data-codex]', el);
  if (!box?.isConnected) return;
  const srcOf = t => { const s = S.sources[t.src]; return s ? `${s.org ?? ''} ${s.title ?? ''}`.trim() : t.src; };
  const sections = CODEX.map(([topic, rows], si) => {
    const trs = rows.map(([label, mod, name, get]) => {
      const t = mods[mod]?.[name];
      let r = null;
      try { r = t && get(t); } catch {}
      if (!r) return '';
      const bd = kindBadge(t.kind);
      return `<tr data-kind="${bd.group}"><td>${label}<small>${esc(srcOf(t))} · ${r[1]}</small></td><td class="is-num">${esc(r[0])}</td><td>${bd.group === 'estimated' ? '' : `<span class="${bd.cls}">${bd.label}</span>`}</td></tr>`;
    }).join('');
    return trs && `<section class="section" aria-labelledby="cx-${si}"><div class="section__head"><h2 class="section__title" id="cx-${si}">${topic}</h2></div>
      <table class="stat-table"><thead><tr><th scope="col">지표</th><th scope="col" class="is-num">값</th><th scope="col">구분</th></tr></thead><tbody>${trs}</tbody></table></section>`;
  }).filter(Boolean);
  const srcs = Object.values(S.sources);
  const srcHtml = srcs.length ? `<section class="section" aria-labelledby="cx-src"><div class="section__head"><h2 class="section__title" id="cx-src">출처 목록</h2><span class="section__note">${srcs.length}개</span></div><ul>${srcs.map(s => {
    const bd = kindBadge(s.kind);
    const host = s.url ? (() => { try { return new URL(s.url).host; } catch { return ''; } })() : '';
    return `<li class="src-item" data-kind="${bd.group}"><p class="src-item__title">${esc(s.title)}</p><p class="src-item__meta">${bd.group === 'estimated' ? '' : `<span class="${bd.cls}">${bd.label}</span>`} ${esc([s.org, s.year].filter(Boolean).join(' · '))}${host ? ` · <a href="${esc(s.url)}" rel="noopener" target="_blank">${esc(host)}</a>` : ''}</p></li>`;
  }).join('')}</ul></section>` : '<p class="cap cap--pad">출처 목록을 준비하고 있습니다.</p>';
  box.innerHTML = sections.join('') + srcHtml;
  $('.filter', el).addEventListener('click', e => {
    const b = e.target.closest('[data-filter]');
    if (!b) return;
    $$('[data-filter]', el).forEach(x => x.setAttribute('aria-pressed', x === b));
    $$('[data-kind]', box).forEach(r => { r.hidden = b.dataset.filter !== 'all' && r.dataset.kind !== b.dataset.filter; });
    // 결과 0건인 표는 숨기고, 전부 0건이면 안내 · 출처 개수는 '검색 결과 N개 / 전체 M개'
    const tables = $$('.stat-table', box).map(t => t.closest('.section')), vis = tables.filter(sec => { const any = $$('tbody tr', sec).some(r => !r.hidden); sec.hidden = !any; return any; });
    let msg = $('[data-cx-empty]', box);
    if (!msg) { msg = document.createElement('p'); msg.className = 'cap cap--pad'; msg.dataset.cxEmpty = ''; msg.setAttribute('role', 'status'); msg.textContent = '해당 구분의 지표가 없습니다.'; box.prepend(msg); }
    msg.hidden = vis.length > 0;
    const li = $$('.src-item', box), shown = li.filter(x => !x.hidden).length, note = $('#cx-src + .section__note', box);
    if (note) note.textContent = b.dataset.filter === 'all' ? `${li.length}개` : `검색 결과 ${shown}개 / 전체 ${li.length}개`;
  });
};

// ───────── S14 설정 ─────────
const sw = (key, label, desc) => `<div class="setting"><div class="setting__text"><p class="setting__label" id="st-${key}">${label}</p><p class="setting__desc">${desc}</p></div>
  <button class="switch" type="button" role="switch" aria-checked="${!!S.settings[key]}" aria-labelledby="st-${key}" data-set="${key}"><span class="switch__track" aria-hidden="true"></span></button></div>`;
routes.settings = () => {
  const s = S.settings, n = loadRecords().length;
  const el = show('settings', `<section class="screen screen--paper" data-screen="settings">
    <header class="topbar"><button class="back" type="button" data-go="home">홈</button><h1 class="topbar__title">설정</h1></header>
    <div class="screen__body">
      <div class="setting setting--stack"><div class="setting__text"><p class="setting__label" id="st-theme">화면 밝기</p></div>
        <div class="seg" role="group" aria-labelledby="st-theme">${[['system', '기기 따라'], ['light', '밝게'], ['dark', '어둡게']].map(([k, l]) => `<button class="seg__btn" type="button" data-theme-set="${k}" aria-pressed="${(s.theme === 'light' || s.theme === 'dark' ? s.theme : 'system') === k}">${l}</button>`).join('')}</div></div>
      <div class="setting setting--stack"><div class="setting__text"><p class="setting__label" id="st-speed">기본 배속</p><p class="setting__desc">한 해가 흐르는 속도를 정합니다.</p></div>
        <div class="seg seg--num" role="group" aria-labelledby="st-speed">${SPEEDS.map(k => `<button class="seg__btn" type="button" data-speed-set="${k}" aria-pressed="${s.speed === k}">${k}×</button>`).join('')}</div></div>
      ${sw('auto', '자동결정', '기본 행동을 자동으로 선택합니다. 민감한 선택은 제외합니다.')}
      ${sw('reduceMotion', '모션 줄이기', '기기에서 동작 줄이기를 켰다면 늘 적용됩니다.')}
      ${sw('hideSensitiveCause', '민감한 사망 원인 숨기기', '사망 화면·결산에 원인 대신 "세상을 떠났습니다"로 적습니다. 공유 카드에는 원인을 늘 적지 않습니다.')}
      <div class="setting"><div class="setting__text"><p class="setting__label">기록 초기화</p><p class="setting__desc">${n ? `기록관의 기록 ${n}개를 지웁니다.` : '지울 기록이 없습니다.'}</p></div>
        <button class="btn btn--danger" type="button" aria-expanded="false" aria-controls="confirm-reset" data-act="ask"${n ? '' : ' disabled'}>기록 지우기</button></div>
      <div class="confirm" id="confirm-reset" role="group" aria-labelledby="confirm-reset-text" hidden>
        <p class="confirm__text" id="confirm-reset-text">기록 ${n}개를 지울까요? 되돌릴 수 없습니다.</p>
        <div class="confirm__actions"><button class="btn" type="button" data-act="keep">그대로 두기</button><button class="btn btn--danger-fill" type="button" data-act="wipe">${n}개 지우기</button></div>
      </div>
      <p class="note">이 사이트는 Google 광고를 사용할 수 있으며, 자세한 내용은 ${PRIV}을 참고하세요.</p>
    </div></section>`);
  const confirm = $('#confirm-reset', el), ask = $('[data-act="ask"]', el);
  const setConfirm = open => { confirm.hidden = !open; ask.setAttribute('aria-expanded', open); (open ? $('[data-act="keep"]', el) : ask).focus(); };
  el.addEventListener('keydown', e => { if (e.key === 'Escape' && !confirm.hidden) setConfirm(false); });
  el.addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.themeSet) { setSetting('theme', b.dataset.themeSet); $$('[data-theme-set]', el).forEach(x => x.setAttribute('aria-pressed', x === b)); }
    if (b.dataset.speedSet) { setSetting('speed', +b.dataset.speedSet); $$('[data-speed-set]', el).forEach(x => x.setAttribute('aria-pressed', x === b)); }
    if (b.dataset.set) { setSetting(b.dataset.set, !S.settings[b.dataset.set]); b.setAttribute('aria-checked', S.settings[b.dataset.set]); }
    if (b.dataset.act === 'ask') setConfirm(true);
    if (b.dataset.act === 'keep') setConfirm(false);
    if (b.dataset.act === 'wipe') { clearRecords(); go('settings'); toast('기록을 지웠습니다.'); }
  });
};
