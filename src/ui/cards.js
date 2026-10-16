// 공유 카드 3종(UI-SPEC §8): 1080×1350 캔버스 + 공유 시트(S11).
// wrap·pickTimeline·shareText·cardAlt는 순수 함수(Node 테스트), 나머지는 DOM.
import { S, $, $$, openSheet, copyText, toast } from './dom.js';
import { sexLabel, mmdd, dateKo, dateDot, dateDotSp, receiptNo, ageText } from './labels.js';

const W = 1080, H = 1350;
const PUNCT = '.,!?)」』·…%';
const SIGN = '— 태어나보니 대한민국 · bornkr.click';

// 줄바꿈(§8.1): 어절 단위 탐욕 → 긴 어절은 글자 단위 → 문장부호로 시작하는 줄은 앞 줄에 붙임 → 넘치면 "…"
export function wrap(text, maxW, maxLines, measure) {
  const lines = [];
  let cur = '';
  for (const word of String(text ?? '').split(/\s+/).filter(Boolean)) {
    const cand = cur ? `${cur} ${word}` : word;
    if (measure(cand) <= maxW) { cur = cand; continue; }
    if (cur) lines.push(cur);
    cur = '';
    if (measure(word) <= maxW) { cur = word; continue; }
    for (const ch of Array.from(word)) {
      if (cur && measure(cur + ch) > maxW) { lines.push(cur); cur = ''; }
      cur += ch;
    }
  }
  if (cur) lines.push(cur);
  for (let i = 1; i < lines.length; i++) {
    while (lines[i] && PUNCT.includes(lines[i][0])) { lines[i - 1] += lines[i][0]; lines[i] = lines[i].slice(1).trimStart(); }
  }
  const out = lines.filter(Boolean);
  if (out.length > maxLines) {
    let last = Array.from(out[maxLines - 1]);
    while (last.length && measure(last.join('') + '…') > maxW) last.pop();
    out.length = maxLines;
    out[maxLines - 1] = last.join('').trimEnd() + '…';
  }
  return out;
}

// 카드·공유 문구 금지어(§8.1·과제 지시): 금액·백분위·순위·서열
const UNSAFE = /\d[\d,.]*\s*(만\s?원|억|원)|백분위|순위|상위|하위|등급/;
export const cardSafe = t => !UNSAFE.test(String(t ?? ''));

// 연표 줄 고르기(§8.4): 민감·금지어 항목 제외, 첫 줄·마지막 줄 고정, 가운데는 균등 간격
export function pickTimeline(tl, n) {
  const a = (tl || []).filter(t => !t.sensitive && cardSafe(t.text));
  if (a.length <= n) return a;
  if (n < 2) return a.slice(0, n);
  const mid = a.slice(1, -1), k = n - 2;
  return [a[0], ...Array.from({ length: k }, (_, i) => mid[Math.floor((i + 0.5) * mid.length / k)]), a.at(-1)];
}

const regionOnly = cert => String(cert.regionLabel ?? '').split('·')[0].trim();
const noDot = s => String(s ?? '').trim().replace(/[.。]+$/, '');
const lifeOf = d => ({ b: d.L.birth, death: d.sum?.death ?? d.L.death });

// 붙일 문구(§8.5). 백분위·순위·금액·사인 없음 — 엔진 문장을 그대로 쓰고 사인 필드는 읽지 않는다.
export function shareText(kind, d) {
  const { b, death } = lifeOf(d);
  if (kind === 'birth') return `${b.year}년 ${regionOnly(d.cert)}에서 태어났다. ${noDot(d.cert.homeLine)}. 어떤 삶이 될까.\n${SIGN}`;
  if (kind === 'verdict') {
    const v = d.sum.verdict, ep = d.sum.epilogue;
    return ['인생 판정문', ep && `《${ep.title}》`, v.main, SIGN].filter(Boolean).join('\n');
  }
  const rows = pickTimeline(d.sum.timeline, 5).map(t => `· ${t.age}세 ${t.text}`);
  return [`${d.L.name}의 생애 연표(${b.year}–${death.year})`, ...rows, SIGN].join('\n');
}
export function cardAlt(kind, d) {
  const { b, death } = lifeOf(d);
  if (kind === 'birth') return `출생 신고서 카드. ${regionOnly(d.cert)}, ${noDot(d.cert.homeLine)}.`;
  if (kind === 'verdict') return `인생 판정문 카드. ${d.sum.epilogue ? `《${d.sum.epilogue.title}》 ` : ''}${d.sum.verdict.main}`;
  const n = pickTimeline(d.sum.timeline, 8).length;
  return `생애 연표 카드. ${b.year}–${death.year}, 연표 ${n}줄.`;
}

// ───────── 캔버스 ─────────
let fontsP;
function fontsReady() {
  if (!document.fonts?.load) return Promise.resolve();
  return (fontsP ||= Promise.race([
    Promise.all([
      document.fonts.load('800 72px "Nanum Myeongjo"'), document.fonts.load('400 30px "Noto Sans KR"'),
      document.fonts.load('700 30px "Noto Sans KR"'), document.fonts.load('700 28px "Nanum Gothic Coding"'),
    ]).catch(() => {}),
    new Promise(r => setTimeout(r, 1500)),
  ]));
}
function tokens() {
  const cs = getComputedStyle(document.documentElement);
  const v = (n, fb) => cs.getPropertyValue(n).trim() || fb;
  return {
    paper: v('--card-paper', '#FAFAF8'), shade: v('--card-shade', '#ECEDEB'), ink: v('--card-ink', '#15181C'),
    ink2: v('--card-ink-2', '#424851'), ink3: v('--card-ink-3', '#5A616A'), rule: v('--card-rule', '#7E848C'),
    rule2: v('--card-rule-2', '#CDD1D5'), seal: v('--card-seal', '#BF3A22'),
    serif: v('--font-serif', 'serif'), sans: v('--font-sans', 'sans-serif'), num: v('--font-num', 'monospace'),
  };
}

function painter(ctx, C) {
  const f = (w, px, fam) => `${w} ${px}px ${C[fam]}`;
  const p = {
    f,
    text(s, x, y, font, color, align = 'left') { ctx.font = font; ctx.fillStyle = color; ctx.textAlign = align; ctx.fillText(s, x, y); },
    measureWith: font => s => { ctx.font = font; return ctx.measureText(s).width; },
    fit(s, maxW, font) { return wrap(s, maxW, 1, p.measureWith(font))[0] ?? ''; },
    rect(x, y, w, h, color) { ctx.fillStyle = color; ctx.fillRect(x, y, w, h); },
    hline(x1, x2, y, color, w = 1) { p.rect(x1, y - w / 2, x2 - x1, w, color); },
    box(x, y, w, h, color, lw) { ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.strokeRect(x, y, w, h); },
    turned(cx, cy, deg, fn) { ctx.save(); ctx.translate(cx, cy); ctx.rotate(deg * Math.PI / 180); ctx.globalAlpha = 0.92; fn(); ctx.restore(); },
  };
  return p;
}

function frame(p, C, no) {
  p.rect(0, 0, W, H, C.paper);
  p.box(40, 40, 1000, 1270, C.ink, 3);
  p.box(52.5, 52.5, 975, 1245, C.ink, 1);
  p.text(`■ 태어나보니 대한민국 [별지 제${no}호서식]`, 88, 112, p.f(400, 22, 'sans'), C.ink3);
  p.hline(88, 992, 1206, C.rule);
  p.text('태어나보니 대한민국', 88, 1252, p.f(400, 22, 'sans'), C.ink3);
  p.text('태어나보니 대한민국 · bornkr.click', 992, 1252, p.f(700, 24, 'sans'), C.ink, 'right');
}

function drawBirth(p, C, ctx, d) {
  const { cert, L } = d, b = L.birth;
  frame(p, C, 1);
  p.text('출 생 신 고 서', 88, 204, p.f(800, 72, 'serif'), C.ink);
  p.rect(732, 136, 260, 32, C.shade);
  p.box(732.5, 136.5, 259, 83, C.rule, 1);
  p.hline(732, 992, 168, C.rule);
  p.text('접수번호', 748, 159, p.f(400, 20, 'sans'), C.ink3);
  p.text(receiptNo(b, L.seed), 748, 205, p.f(700, 28, 'num'), C.ink);
  p.rect(88, 243, 904, 3, C.ink);
  const region = String(cert.regionLabel ?? '').includes('·') ? cert.regionLabel : `${cert.regionLabel} · ${cert.urban ? '도시' : '농촌'}`;
  const rows = [['성명', `${L.name} (${sexLabel(L.sex)})`], ['출생일', dateKo(b)], ['출생지', region], ['가구 형편', cert.quintileLabel],
    ['부모', cert.parentsLine], ['주거', cert.homeLine], ['돌봄', cert.careLine], ['의료 접근', cert.accessLine], ['시대', cert.eraLine]];
  const vf = p.f(400, 30, 'sans');
  rows.forEach(([label, value], k) => {
    const top = 268 + 74 * k;
    p.rect(88, top, 200, 74, C.shade);
    p.text(label, 108, top + 47, p.f(500, 24, 'sans'), C.ink2);
    p.text(p.fit(String(value ?? '').replace(/\n/g, ', '), 660, vf), 312, top + 49, vf, C.ink);
  });
  for (let k = 0; k <= 9; k++) p.hline(88, 992, 268 + 74 * k, C.rule);
  p.rect(287.5, 268, 1, 666, C.rule);
  p.rect(88, 957, 904, 3, C.ink);
  p.text('이 사람에게 남은 질문', 88, 1010, p.f(400, 22, 'sans'), C.ink3);
  const hf = p.f(800, 46, 'serif');
  wrap(cert.hook || '이 사람은 어떤 해들을 지나게 될까요?', 720, 2, p.measureWith(hf)).forEach((l, i) => p.text(l, 88, 1078 + 62 * i, hf, C.ink));
  p.turned(900, 1080, -8, () => {
    ctx.strokeStyle = C.seal;
    ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(0, 0, 76, 0, Math.PI * 2); ctx.stroke();
    ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, 64, 0, Math.PI * 2); ctx.stroke();
    p.text('접수', 0, 0, p.f(800, 40, 'serif'), C.seal, 'center');
    p.text(dateDot(b), 0, 32, p.f(700, 20, 'num'), C.seal, 'center');
  });
}

function drawVerdict(p, C, ctx, d) {
  const { L, sum } = d, b = L.birth, death = sum.death ?? L.death;
  frame(p, C, 2);
  p.text('인 생 판 정 문', 540, 204, p.f(800, 72, 'serif'), C.ink, 'center');
  p.text('사건', 88, 286, p.f(400, 24, 'sans'), C.ink3);
  p.text(`${death.year}생애${mmdd(b)}`, 232, 286, p.f(400, 28, 'num'), C.ink);
  p.text('당사자', 88, 330, p.f(400, 24, 'sans'), C.ink3);
  const pf = p.f(400, 28, 'sans');
  p.text(p.fit(`${L.name} (${dateDotSp(b)}생 · ${ageText(death.age, death.horizon)})`, 760, pf), 232, 330, pf, C.ink);
  p.hline(88, 992, 362, C.rule);
  const ep = sum.epilogue;
  if (ep) {                                   // 회고문: 별명 + 첫 문단 발췌 + 한 줄 총평
    const tf = p.f(800, 50, 'serif'), title = wrap(`《${ep.title}》`, 904, 2, p.measureWith(tf));
    title.forEach((l, i) => p.text(l, 540, 440 + 68 * i, tf, C.ink, 'center'));
    let y = 440 + 68 * (title.length - 1) + 84;
    const bf = p.f(400, 32, 'serif');
    wrap(ep.paragraphs[0], 904, 4, p.measureWith(bf)).forEach(l => { p.text(l, 88, y, bf, C.ink2); y += 52; });
    const ds = sum.deathStory, cause = ds && !ds.sensitive && !S.settings?.hideSensitiveCause ? ds.causeLabel : null;
    if (ds) {                                 // 사망 연도·직접 사인·인과 체인(자해·숨김 설정이면 연도만)
      y += 24;
      const df = p.f(700, 30, 'sans');
      p.text(p.fit(`${ds.year}년, ${ageText(ds.age)}${cause ? ` — 직접 사인: ${cause}` : ''}`, 904, df), 88, y, df, C.ink);
      y += 46;
      const cf2 = p.f(400, 26, 'sans');
      if (cause && ds.steps?.length) wrap(ds.steps.join(' → '), 904, 3, p.measureWith(cf2)).forEach(l => { p.text(l, 88, y, cf2, C.ink2); y += 40; });
    }
    p.hline(400, 680, y + 8, C.rule);
    const cf = p.f(700, 40, 'serif');
    wrap(sum.verdict.main, 904, y + 124 <= 1056 ? 2 : 1, p.measureWith(cf)).forEach((l, i) => p.text(l, 540, y + 68 + 56 * i, cf, C.ink, 'center'));
  } else {
    const mf = p.f(800, 54, 'serif');
    wrap(sum.verdict.main, 904, 3, p.measureWith(mf)).forEach((l, i) => p.text(l, 88, 498 + 76 * i, mf, C.ink));
  }
  p.text(`${death.year}년`, 840, 1102, p.f(400, 28, 'num'), C.ink2, 'right');
  p.text('태어나보니 대한민국 · bornkr.click', 840, 1156, p.f(800, 38, 'serif'), C.ink, 'right');
  p.turned(920, 1124, 4, () => {
    ctx.strokeStyle = C.seal; ctx.lineWidth = 6; ctx.strokeRect(-64, -64, 128, 128);
    const sf = p.f(800, 46, 'serif');
    [['인', -32, -16], ['생', 32, -16], ['판', -32, 48], ['정', 32, 48]].forEach(([c, x, yy]) => p.text(c, x, yy, sf, C.seal, 'center'));
  });
}

function drawTimeline(p, C, ctx, d) {
  const { L, sum } = d, b = L.birth, death = sum.death ?? L.death, age = death.age;
  frame(p, C, 3);
  p.text('생 애 연 표', 88, 204, p.f(800, 72, 'serif'), C.ink);
  const nf = p.f(700, 34, 'sans');
  p.text(p.fit(L.name, 420, nf), 992, 164, nf, C.ink, 'right');
  p.text(`${b.year} – ${death.year} · ${age}세`, 992, 204, p.f(400, 26, 'num'), C.ink2, 'right');
  p.rect(88, 243, 904, 3, C.ink);
  const events = new Set(pickTimeline(sum.timeline, 99).map(t => t.age));
  const rows = Math.min(6, Math.ceil((age + 1) / 20));
  for (let r = 0; r < rows; r++) {
    const y = 276 + 42 * r;
    p.text(String(20 * r), 140, y + 24, p.f(400, 20, 'num'), C.ink3, 'right');
    for (let c = 0; c < 20; c++) {
      const a = 20 * r + c, x = 152 + 42 * c;
      if (a < age) p.rect(x, y, 34, 34, events.has(a) ? C.ink : C.rule2);
      else if (a === age) { p.rect(x, y, 34, 34, C.paper); p.box(x + 1.5, y + 1.5, 31, 31, C.ink, 3); }
      else p.box(x + 0.5, y + 0.5, 33, 33, C.rule2, 1);
    }
  }
  const lb = 276 + 42 * (rows - 1) + 34 + 44;
  const gf = p.f(400, 20, 'sans');
  p.rect(88, lb - 18, 20, 20, C.rule2); p.text('산 해', 116, lb, gf, C.ink2);
  p.rect(220, lb - 18, 20, 20, C.ink); p.text('연표에 남은 해', 248, lb, gf, C.ink2);
  p.box(432, lb - 17, 18, 18, C.ink, 2); p.text('마지막 해', 460, lb, gf, C.ink2);
  p.hline(88, 992, lb + 28, C.rule);
  const first = lb + 76, n = Math.max(2, Math.floor((1150 - first) / 76) + 1);
  const tf = p.f(400, 28, 'sans');
  pickTimeline(sum.timeline, n).forEach((t, i) => {
    const y = first + 76 * i;
    p.text(`${t.age}세`, 88, y, p.f(700, 28, 'num'), C.ink);
    p.text(String(t.year), 88, y + 28, p.f(400, 20, 'num'), C.ink3);
    p.text(p.fit(t.text, 792, tf), 200, y, tf, C.ink);
    p.hline(88, 992, y + 42, C.rule2);
  });
}

const DRAW = { birth: drawBirth, verdict: drawVerdict, timeline: drawTimeline };
export async function renderCard(kind, d) {
  await fontsReady();
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d');
  ctx.textBaseline = 'alphabetic';
  const C = tokens();
  DRAW[kind](painter(ctx, C), C, ctx, d);
  return cv;
}

// ───────── 공유 시트(S11) ─────────
const KINDS = [['birth', '출생 신고서'], ['verdict', '인생 판정문'], ['timeline', '생애 연표']];
const plainWeb = () => !window.claude && window.top === window;   // Artifact 뷰어(iframe)에선 다운로드 링크 숨김
const viewerUse = () => (typeof globalThis.claude?.use === 'function' ? globalThis.claude.use.bind(globalThis.claude) : null);
const CARD_NAME = { birth: '출생신고서', verdict: '판정문', timeline: '생애연표' };

export function openShare(d, initial = 'verdict', { only = null } = {}) {
  const kinds = only ? KINDS.filter(([k]) => k === only) : KINDS;
  const tabbed = kinds.length > 1;
  const el = openSheet({
    html: `<div class="sheet__head"><h2 class="sheet__title">카드로 남기기</h2><button class="sheet__close" type="button">닫기</button></div>
    <div class="sheet__body">
      ${tabbed ? `<div class="seg" role="tablist" aria-label="카드 종류">${kinds.map(([k, l]) => `<button class="seg__btn" role="tab" type="button" id="sharetab-${k}" aria-controls="share-panel" aria-selected="false" tabindex="-1" data-kind="${k}">${l}</button>`).join('')}</div>` : ''}
      <div class="share__panel"${tabbed ? ' role="tabpanel" id="share-panel"' : ''}>
      <figure class="share__figure"><img class="share__img" width="1080" height="1350" alt="">
        <figcaption class="share__hint">이미지를 길게 눌러 저장하세요. 컴퓨터에서는 오른쪽 클릭.</figcaption></figure>
      <label class="field"><span class="field__label">함께 붙일 문구</span><textarea class="field__input share__text" rows="3" readonly></textarea></label>
      <div class="share__actions"><button class="btn" type="button" data-act="copy">문구 복사</button><button class="btn" type="button" data-act="share" hidden>공유하기</button>${plainWeb() ? '<a class="btn" data-act="save" href="#" download="card.png">이미지 저장</a>' : ''}${viewerUse() ? '<button class="btn" type="button" data-act="dl" hidden>이미지 저장</button>' : ''}</div>
      </div>
    </div>`,
  });
  const img = $('.share__img', el), ta = $('.share__text', el), shareBtn = $('[data-act="share"]', el), save = $('[data-act="save"]', el);
  const dlBtn = $('[data-act="dl"]', el);
  let file = null, blob = null, token = 0, kindNow = initial, downloads = null;
  // Artifact 뷰어: downloads 기능(없으면 최대 10초 뒤 null) — 첫 렌더를 막지 않고, 오면 저장 버튼을 켠다. 호출은 사용자 탭에서만.
  if (dlBtn) Promise.resolve().then(() => viewerUse()('downloads')).then(d => { if (d && el.isConnected) { downloads = d; dlBtn.hidden = false; } }).catch(() => {});
  async function saveToViewer() {
    if (!downloads) return;
    if (!blob) return toast('카드를 아직 그리고 있습니다. 잠시 뒤 다시 눌러 주세요.');
    try {
      await downloads.save({ filename: `태어나보니대한민국-${CARD_NAME[kindNow] ?? '카드'}.png`, data: blob });
      toast('이미지를 저장했습니다.');
    } catch (e) {
      const code = e?.code;
      if (code === 'declined') return;                                  // 사용자가 거절 — 조용히
      if (code === 'rate_limited') return toast('잠시 뒤 다시 눌러 주세요.');
      dlBtn.hidden = true; downloads = null;                            // unavailable 등 — 저장 버튼을 숨긴다
    }
  }
  async function select(kind) {
    const my = ++token;
    kindNow = kind;
    $$('.seg__btn', el).forEach(b => { const on = b.dataset.kind === kind; b.setAttribute('aria-selected', on); b.tabIndex = on ? 0 : -1; });
    if (tabbed) $('.share__panel', el).setAttribute('aria-labelledby', 'sharetab-' + kind);
    ta.value = shareText(kind, d);
    img.alt = cardAlt(kind, d);
    const cv = await renderCard(kind, d);
    if (my !== token || !el.isConnected) return;
    const url = cv.toDataURL('image/png');
    img.src = url;
    if (save) { save.href = url; save.download = `daehanminguk-${kind}.png`; }
    file = null; blob = null; shareBtn.hidden = true;
    cv.toBlob(b => {
      if (!b || my !== token) return;
      blob = b;
      const f = new File([b], `daehanminguk-${kind}.png`, { type: 'image/png' });
      try { if (navigator.canShare?.({ files: [f] })) { file = f; shareBtn.hidden = false; } } catch {}
    }, 'image/png');
  }
  const pick = k => select(k).catch(() => toast('카드를 그리지 못했습니다.'));
  // 탭 화살표 이동(S05와 같은 roving tabindex)
  $('.seg', el)?.addEventListener('keydown', e => {
    const i = kinds.findIndex(([k]) => k === kindNow), n = kinds.length;
    const to = { ArrowRight: (i + 1) % n, ArrowLeft: (i + n - 1) % n, Home: 0, End: n - 1 }[e.key];
    if (to == null) return;
    e.preventDefault();
    pick(kinds[to][0]);
    $(`[data-kind="${kinds[to][0]}"]`, el).focus();
  });
  el.addEventListener('click', e => {
    const k = e.target.closest('[data-kind]');
    if (k) return pick(k.dataset.kind);
    const a = e.target.closest('[data-act]')?.dataset.act;
    if (a === 'copy') copyText(ta.value, ta, '문구를 복사했습니다.', '문구를 선택해 두었습니다. 길게 눌러 복사하세요.');
    if (a === 'share' && file) navigator.share({ files: [file], text: ta.value }).catch(() => {});
    if (a === 'dl') saveToViewer();
  });
  pick(kinds.some(([k]) => k === initial) ? initial : kinds[0][0]);
  return el;
}
