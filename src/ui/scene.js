// 생애 장면: 인라인 SVG + CSS 애니메이션(외부 이미지 없음). 조용한 종이·잉크 톤의 실루엣 장면.
// sceneModel(L)은 순수(Node 테스트 대상). 해마다 애니메이션을 다시 시작하고(1년 = 계절 한 바퀴, 하루 = 1/4년),
// 멈춤·탭 숨김에서는 animation-play-state 로 정지, 모션 줄이기에서는 CSS 가 정지 장면 + 페이드로 바꾼다.
import { dwellingOf } from './profile.js';

const G = 134, W = 390, HGT = 170;     // 지면 y, 장면 크기(viewBox)
const HOME_X = 20, ME_X = 138;

// ───────── 모델(순수) ─────────
export const stageOf = a => (a < 2 ? 'baby' : a < 7 ? 'child' : a < 19 ? 'teen' : a < 35 ? 'young' : a < 55 ? 'mid' : a < 80 ? 'elder' : 'old');
export const eraOf = y => (y < 1985 ? 'old' : y < 2005 ? 'mid' : y < 2030 ? 'now' : 'future');
const PLACE_BY_MAJOR = { 1: 'office', 2: 'office', 3: 'office', 4: 'shop', 5: 'shop', 6: 'farm', 7: 'factory', 8: 'factory', 9: 'site', A: 'barracks' };

export function placeOf(L) {
  const j = L.job || {}, a = L.age, st = j.status, es = L.edu?.stage;
  if (st === 'military') return 'barracks';
  if (st === 'self') return 'store';
  if (st === 'employed') return j.major === '2' || j.major === '3' ? (j.firmSize === 'large' || j.public ? 'tower' : 'office') : (PLACE_BY_MAJOR[j.major] ?? 'office');
  if (a < 7) return es === 'daycare' || es === 'kinder' ? 'kinder' : null;
  if (st === 'student' || a < 19) return es === 'college' || es === 'grad' ? 'campus' : es === 'retake' ? 'school' : 'school';
  if (st === 'retired' || a >= 65) return 'bench';
  return null;
}

export function sceneModel(L, { dead = false } = {}) {
  const f = L.family || {}, b = L.birth || {}, a = L.age;
  const kids = (f.children || []).filter(c => c.alive !== false && !c.leftHome).map(c => Math.max(0, L.year - (c.birthYear ?? L.year)));
  const spouse = !!(f.partner && f.married && !f.divorced && !f.widowed);
  const parents = a < 19 ? (b.parents?.singleParent ? 1 : 2) : 0;
  return {
    age: a, year: L.year, stage: stageOf(a), era: eraOf(L.year), urban: b.urban !== false,
    dwelling: dwellingOf(L), place: placeOf(L),
    clinic: (L.stats?.health ?? 100) <= 25 || (a >= 85),
    work: L.job?.status === 'employed' || L.job?.status === 'self',
    spouse, kids: kids.slice(0, 3), parents, dead,
    sex: L.sex,
  };
}
// 부분별 키: 바뀐 부분만 다시 그리고 전환 효과를 준다
export const layerKeys = m => ({
  far: `${m.era}|${m.urban}`,
  home: m.dwelling + (m.era === 'old' ? 'o' : ''),
  place: `${m.place}|${m.clinic}`,
  castFx: `${m.place ? 1 : 0}|${m.work}|${m.spouse}|${m.kids.length}|${m.parents}|${m.dead}`,
  cast: `${m.stage}|${m.age < 19 ? m.age : 0}|${m.place ? 1 : 0}|${m.work}|${m.spouse}|${m.kids.map(k => k < 7 ? 'c' : 'k').join('')}|${m.parents}|${m.dead}`,
});

// ───────── 그림 조각 ─────────
const r = (x, y, w, h, c, extra = '') => `<rect class="${c}" x="${x}" y="${y}" width="${w}" height="${h}"${extra}/>`;
const win = (x, y, w, h, lit) => `<rect class="c-win${lit ? ' sc-lit' : ''}" x="${x}" y="${y}" width="${w}" height="${h}" rx="1"/>`;
function grid(x0, y0, cols, rows, dx, dy, w, h, litMod = 3) {
  let s = '';
  for (let i = 0; i < rows; i++) for (let j = 0; j < cols; j++) s += win(x0 + j * dx, y0 + i * dy, w, h, (i * cols + j) % litMod === 1);
  return s;
}
const bounds = (cls, ...p) => `<polygon class="${cls}" points="${p.join(' ')}"/>`;

const HOMES = {
  apt: m => { const rows = m.era === 'old' ? 4 : m.era === 'mid' ? 5 : 6, h = rows * 13 + 8;
    return `${r(0, -h, 58, h, 'c-wall')}${r(-2, -h - 3, 62, 4, 'c-roof')}${grid(6, -h + 7, 4, rows, 13, 13, 8, 7)}${r(24, -12, 10, 12, 'c-door')}`; },
  house: () => `${r(6, -30, 52, 30, 'c-wall')}${bounds('c-roof', '0,-30', '32,-54', '64,-30')}${r(46, -52, 6, 12, 'c-roof')}${win(13, -23, 10, 10, true)}${win(40, -23, 10, 10, false)}${r(28, -17, 9, 17, 'c-door')}`,
  family: () => `${HOMES.house()}${r(66, -16, 18, 16, 'c-wall')}${bounds('c-roof', '64,-16', '75,-26', '86,-16')}`,
  jeonse: () => `${r(0, -48, 50, 48, 'c-wall')}${r(-2, -51, 54, 4, 'c-roof')}${grid(6, -42, 3, 3, 15, 15, 9, 8)}${r(0, -33, 50, 2, 'c-line')}${r(0, -18, 50, 2, 'c-line')}${r(20, -12, 10, 12, 'c-door')}${r(50, -26, 8, 26, 'c-wall')}`,
  monthly: () => `${r(0, -36, 64, 36, 'c-wall')}${r(-2, -39, 68, 4, 'c-roof')}${grid(7, -30, 3, 2, 19, 15, 11, 8)}${r(46, -9, 9, 9, 'c-win')}${r(24, -13, 9, 13, 'c-door')}${r(50, -22, 10, 6, 'c-line')}`,
  basement: () => `${r(0, -38, 62, 38, 'c-wall')}${r(-2, -41, 66, 4, 'c-roof')}${grid(8, -32, 3, 1, 18, 0, 11, 8)}${r(24, -14, 10, 14, 'c-door')}${r(6, 3, 20, 10, 'c-win', ' rx="1"')}<path class="c-line2" d="M11 3v10M16 3v10M21 3v10"/>`,
  public: () => `${r(0, -58, 88, 58, 'c-wall')}${r(34, -66, 14, 66, 'c-wall2')}${grid(6, -50, 3, 4, 12, 12, 8, 7)}${grid(54, -50, 3, 4, 11, 12, 8, 7)}${r(37, -12, 8, 12, 'c-door')}`,
  facility: () => `${r(0, -34, 74, 34, 'c-wall')}${r(-2, -37, 78, 4, 'c-roof')}${r(28, -52, 18, 16, 'c-wall2')}<path class="c-cross" d="M37 -49v10M32 -44h10"/>${grid(6, -26, 5, 1, 12, 0, 8, 8)}${bounds('c-wall2', '74,0', '74,-8', '92,0')}`,
};
const PLACES = {
  school: () => `${r(0, -42, 88, 42, 'c-wall')}${r(36, -52, 16, 12, 'c-wall2')}<circle class="c-win" cx="44" cy="-46" r="4"/>${grid(6, -34, 7, 2, 11, 16, 7, 8)}<path class="c-line2" d="M-6 0V-60"/>${r(-6, -60, 10, 6, 'c-roof')}${r(37, -12, 14, 12, 'c-door')}`,
  campus: () => `${r(0, -40, 92, 40, 'c-wall')}${bounds('c-roof', '-4,-40', '46,-58', '96,-40')}${[8, 26, 44, 62, 80].map(x => r(x, -38, 5, 38, 'c-wall2')).join('')}${r(40, -14, 12, 14, 'c-door')}`,
  kinder: () => `${r(0, -26, 62, 26, 'c-wall')}${bounds('c-roof', '-3,-26', '31,-42', '65,-26')}${win(8, -20, 10, 9, true)}${win(44, -20, 10, 9, false)}${r(26, -14, 10, 14, 'c-door')}<path class="c-line2" d="M72 0V-16M82 0V-16M70 -16H86"/>`,
  office: () => `${r(0, -78, 42, 78, 'c-wall')}${grid(6, -72, 4, 7, 9, 10, 6, 6, 4)}${r(16, -12, 10, 12, 'c-door')}${r(44, -46, 26, 46, 'c-wall2')}${grid(49, -40, 3, 4, 8, 10, 5, 6, 3)}`,
  tower: () => `${r(0, -104, 34, 104, 'c-wall')}${grid(5, -98, 4, 9, 7, 10, 4, 6, 4)}${r(40, -78, 30, 78, 'c-wall2')}${grid(45, -72, 4, 7, 6, 10, 3, 6, 4)}<path class="c-line2" d="M17 -104v-10"/>${r(12, -12, 10, 12, 'c-door')}`,
  shop: () => `${r(0, -36, 62, 36, 'c-wall')}${r(-2, -46, 66, 10, 'c-roof')}${[0, 1, 2, 3, 4, 5].map(i => r(i * 11, -36, 5.5, 6, 'c-win')).join('')}${win(8, -22, 22, 16, true)}${r(40, -22, 12, 22, 'c-door')}`,
  store: () => `${HOMES_STORE()}`,
  factory: () => `${r(0, -34, 70, 34, 'c-wall')}${bounds('c-wall2', '0,-34', '14,-46', '14,-34', '28,-46', '28,-34', '42,-46', '42,-34')}${r(56, -70, 9, 40, 'c-wall2')}<g class="sc-smoke"><circle class="c-cloud" cx="61" cy="-76" r="5"/><circle class="c-cloud" cx="66" cy="-86" r="4"/></g>${win(8, -22, 10, 8, true)}${win(26, -22, 10, 8, false)}${r(46, -18, 10, 18, 'c-door')}`,
  farm: () => `${r(0, -30, 46, 30, 'c-wall')}${bounds('c-roof', '-3,-30', '23,-50', '49,-30')}${r(17, -16, 12, 16, 'c-door')}${[0, 1, 2].map(i => `<path class="c-line2" d="M${54 + i * 9} 0q3 -14 0 -22M${58 + i * 9} 0q3 -12 0 -18"/>`).join('')}`,
  site: () => `${r(0, -26, 40, 26, 'c-wall2', ' opacity=".7"')}${grid(5, -20, 3, 1, 12, 0, 8, 8, 9)}<path class="c-line2" d="M52 0V-88H90M90 -88V-70M52 -88L38 -80"/><path class="c-line2 sc-hook" d="M90 -70v14"/>${r(86, -56, 8, 5, 'c-roof')}`,
  barracks: () => `${bounds('c-wall', '0,0', '28,-40', '56,0')}${bounds('c-door', '22,0', '28,-18', '34,0')}<path class="c-line2" d="M70 0V-52"/>${r(70, -52, 14, 9, 'c-roof')}`,
  bank: () => `${r(0, -50, 84, 50, 'c-wall')}${bounds('c-roof', '-4,-50', '42,-70', '88,-50')}${[8, 24, 40, 56, 70].map(x => r(x, -46, 6, 40, 'c-wall2')).join('')}${r(0, -6, 84, 6, 'c-wall2')}<circle class="c-sun" cx="42" cy="-58" r="5"/>`,
  hospital: () => `${r(0, -64, 100, 64, 'c-wall')}${r(-3, -68, 106, 5, 'c-roof')}${r(36, -86, 28, 22, 'c-wall2')}<path class="c-cross" d="M50 -82v14M43 -75h14"/>${grid(8, -56, 7, 3, 13, 17, 8, 9, 3)}${r(42, -16, 16, 16, 'c-door')}`,
  bench: () => `<path class="c-line2" d="M4 -12h34M8 -12v12M34 -12v12M4 -22h34"/>${r(54, -50, 4, 50, 'c-trunk')}<circle class="c-leaf" cx="56" cy="-58" r="16"/>`,
};
// 자영업 가게: 간판 램프가 깜빡이는 작은 점포
function HOMES_STORE() {
  return `${r(0, -38, 62, 38, 'c-wall')}${r(-2, -48, 66, 10, 'c-roof')}<rect class="sc-sign" x="14" y="-45" width="34" height="5" rx="1"/>${win(8, -28, 24, 18, true)}${r(38, -26, 12, 26, 'c-door')}<circle class="sc-open" cx="56" cy="-24" r="2.5"/>${r(0, 0, 62, 3, 'c-line')}`;
}
const CLINIC = () => `${r(0, -30, 34, 30, 'c-wall')}${r(11, -44, 12, 14, 'c-wall2')}<path class="c-cross" d="M17 -41v8M13 -37h8"/>${win(5, -22, 8, 7, true)}${r(22, -16, 8, 16, 'c-door')}`;

// 먼 풍경(시대·도시/농촌)
const FAR = {
  old: [[0, 20, 16], [24, 26, 20], [54, 18, 14], [76, 24, 22], [104, 20, 16], [128, 28, 24], [160, 20, 16], [184, 26, 22], [214, 20, 14], [238, 24, 20], [266, 28, 24], [298, 20, 16], [322, 26, 20], [352, 24, 14]],
  mid: [[0, 22, 34], [26, 18, 46], [48, 24, 30], [76, 20, 54], [100, 26, 38], [130, 18, 48], [152, 24, 32], [180, 22, 58], [206, 20, 40], [230, 26, 52], [260, 20, 36], [284, 24, 46], [312, 22, 60], [338, 26, 34], [368, 22, 44]],
  now: [[0, 24, 52], [28, 20, 70], [52, 26, 44], [82, 22, 82], [108, 28, 54], [140, 20, 66], [164, 24, 46], [192, 22, 90], [218, 26, 60], [248, 20, 74], [272, 24, 50], [300, 22, 84], [326, 28, 56], [358, 24, 68]],
  future: [[0, 24, 66], [28, 18, 96], [50, 26, 56], [80, 20, 104], [104, 28, 62], [136, 18, 86], [158, 24, 58], [186, 20, 112], [210, 26, 70], [240, 18, 92], [262, 24, 60], [290, 20, 106], [314, 28, 66], [346, 20, 84], [370, 18, 70]],
};
function farLayer(m) {
  if (!m.urban) {
    return `<path class="c-far" d="M0 ${G}V98q40-32 90-8t110 4 90-22 100 14V${G}z"/><path class="c-far2" d="M0 ${G}V112q60-22 120-4t130 0 140-14V${G}z"/>`
      + [40, 120, 250, 330].map((x, i) => `<g transform="translate(${x} ${G - 16 - (i % 2) * 6})">${r(0, 0, 12, 10, 'c-wall', ' opacity=".7"')}${bounds('c-roof', '-2,0', '6,-7', '14,0')}</g>`).join('');
  }
  const gable = m.era === 'old';
  return FAR[m.era].map(([x, w, h]) => gable
    ? `${r(x, G - h + 6, w, h - 6, 'c-far')}${bounds('c-far2', `${x - 2},${G - h + 6}`, `${x + w / 2},${G - h - 4}`, `${x + w + 2},${G - h + 6}`)}`
    : `${r(x, G - h, w, h, 'c-far')}${h > 70 ? r(x + w / 2 - 1, G - h - 8, 2, 8, 'c-far') : ''}`).join('')
    + (m.era === 'old' ? '<path class="c-line2 c-line-far" d="M0 70H390M60 62V134M200 62V134M330 62V134"/>' : '');
}

// ───────── 인물 ─────────
const heightFor = (a, stage) => (stage === 'baby' ? 15 : stage === 'child' ? 21 + a * 1.6 : stage === 'teen' ? 35 + (a - 7) * 1.1 : stage === 'old' ? Math.max(38, 52 - (a - 55) * .35) : stage === 'elder' ? 52 - (a - 55) * .2 : 52);
// 발 중심 (0,0), 위쪽이 -y. opts: self, stage, h, cls, bag, cane, pack, hair
function figure(x, o) {
  const h = o.h, st = o.stage, w = h * .17, hr = h * (st === 'baby' || st === 'child' ? .17 : .12);
  const lean = st === 'old' ? ' transform="rotate(8 0 -' + (h * .4).toFixed(1) + ')"' : st === 'elder' ? ' transform="rotate(3 0 -' + (h * .4).toFixed(1) + ')"' : '';
  const torsoTop = h * (st === 'baby' ? .55 : .74), hipY = h * .38;
  const cls = o.self ? 'c-me' : 'c-fig';
  const body = `<g class="${cls}"${lean}><path class="fg-leg" d="M${-w * .5} 0L${-w * .45} ${-hipY}M${w * .5} 0L${w * .45} ${-hipY}" stroke-width="${(h * .09).toFixed(1)}" stroke-linecap="round" fill="none"/>`
    + `<rect x="${-w}" y="${-torsoTop}" width="${w * 2}" height="${(torsoTop - hipY + 2).toFixed(1)}" rx="${(h * .1).toFixed(1)}"/>`
    + `<circle cx="0" cy="${(-torsoTop - hr * .85).toFixed(1)}" r="${hr.toFixed(1)}"/>`
    + (o.pack ? `<rect class="c-pack" x="${(-w - h * .08).toFixed(1)}" y="${-torsoTop + 2}" width="${(h * .1).toFixed(1)}" height="${(h * .22).toFixed(1)}" rx="1.5"/>` : '')
    + (o.bag ? `<rect class="c-pack" x="${(w * .6).toFixed(1)}" y="${(-hipY - 3).toFixed(1)}" width="${(h * .16).toFixed(1)}" height="${(h * .12).toFixed(1)}" rx="1.5"/>` : '')
    + (o.hair ? `<path class="c-hair" d="M${-hr} ${(-torsoTop - hr * .95).toFixed(1)}a${hr} ${hr} 0 0 1 ${hr * 2} 0" fill="none" stroke-width="2"/>` : '')
    + `</g>`
    + (o.cane ? `<path class="c-line2" d="M${(w * 1.6).toFixed(1)} 0L${(w * 1.4).toFixed(1)} ${-hipY - 2}"/>` : '');
  const mark = o.self ? `<path class="c-mark" d="M-3.5 ${(-h - 10).toFixed(1)}h7l-3.5 5z"/>` : '';
  return `<g class="sc-fig${o.cls ? ' ' + o.cls : ''}" transform="translate(${x} 0)"><g class="sc-bob">${body}${mark}</g></g>`;
}
function castLayer(m) {
  const a = m.age, h = heightFor(a, m.stage);
  let s = '';
  // 가족: 어린 시절엔 보호자, 성인은 배우자·자녀
  const others = [];
  for (let i = 0; i < m.parents; i++) others.push({ x: ME_X - 22 - i * 15, h: 50, stage: 'mid', hair: false, cls: 'sc-fam' });
  if (m.spouse) others.push({ x: ME_X - 18, h: 50 - (m.sex === 'M' ? 2 : 0), stage: a >= 65 ? 'elder' : 'mid', hair: a >= 65, cane: a >= 80, cls: 'sc-fam sc-new-spouse' });
  m.kids.forEach((k, i) => others.push({ x: ME_X + 16 + i * 12, h: heightFor(k, stageOf(k)), stage: stageOf(k), cls: 'sc-fam sc-new-kid', pack: k >= 7 && k < 19 }));
  for (const o of others) s += figure(o.x, o);
  const out = { self: true, stage: m.stage, h, hair: a >= 55, cane: a >= 75, pack: m.stage === 'teen' || (m.place === 'school' || m.place === 'campus'), bag: m.work };
  const mover = m.dead || m.lying ? '' : `<g class="sc-me${m.place && a >= 3 && !m.still ? ' is-commute' : ''}${m.birth ? ' is-born' : ''}">${figure(ME_X, out)}</g>`;
  const flower = m.dead ? `<g class="sc-flower" transform="translate(${ME_X} 0)"><path class="c-line2" d="M0 0V-14"/><circle class="c-snow" cx="0" cy="-17" r="3.4"/><circle class="c-snow" cx="-3.4" cy="-14.5" r="2.6"/><circle class="c-snow" cx="3.4" cy="-14.5" r="2.6"/></g>` : '';
  return s + mover + flower;
}
// 주제 장면의 장식(하트·예식 아치·요람·병상)
function decorHtml(m) {
  const x = ME_X, g = G;
  if (m.decor === 'heart') return `<g class="sc-heart" transform="translate(${x - 9} ${g - 86})"><path class="c-heart" d="M0 8c-9-6-9-15-3-15 2.600 0 3 2 3 3 0-1 .4-3 3-3 6 0 6 9-3 15z" transform="scale(1.4)"/></g>`;
  if (m.decor === 'arch') return `<path class="c-line2 sc-thick" d="M${x - 34} ${g + 6}v-58a25 25 0 0 1 50 0v58"/><circle class="c-snow" cx="${x - 9}" cy="${g - 86}" r="4"/><circle class="c-snow" cx="${x - 30}" cy="${g - 70}" r="3"/><circle class="c-snow" cx="${x + 12}" cy="${g - 70}" r="3"/>`;
  if (m.decor === 'cradle') return `<g transform="translate(${x + 34} ${g + 6})">${r(-14, -12, 28, 5, 'c-roof')}<path class="c-line2" d="M-12 -7v7M12 -7v7M-12 -12v-9M12 -12v-9"/></g>`;
  if (m.decor === 'box') return `<g transform="translate(${x + 16} ${g + 6})">${r(0, -14, 16, 14, 'c-roof')}${r(0, -14, 16, 3, 'c-wall2')}</g>`;
  if (m.decor === 'shutter') return `<g transform="translate(${PLACE_X} ${g})">${r(2, -36, 58, 36, 'c-wall2', ' opacity=".92"')}<path class="c-line2" d="M2 -30h58M2 -24h58M2 -18h58M2 -12h58M2 -6h58"/></g>`;
  if (m.decor === 'coin') return `<g class="sc-heart" transform="translate(${x + 40} ${g - 40})"><circle class="c-sun" r="9"/><path class="c-line2" d="M0 -5v10M-3 -2h5a2 2 0 0 1 0 4h-4"/></g>`;
  if (m.decor === 'bed') return `<g transform="translate(${x - 30} ${g + 6})">${r(0, -14, 70, 6, 'c-wall2')}${r(-2, -26, 4, 26, 'c-door')}${r(68, -20, 4, 20, 'c-door')}<rect class="c-me" x="6" y="-22" width="44" height="8" rx="4"/><circle class="c-me" cx="56" cy="-20" r="6"/>${r(52, -16, 16, 3, 'c-snow')}</g>`;
  return '';
}

// ───────── 조립 ─────────
const TREE = x => `<g transform="translate(${x} ${G})"><rect class="c-trunk" x="-2" y="-18" width="4" height="18"/><circle class="c-leaf sc-leaf" cx="0" cy="-26" r="13"/></g>`;
const PARTICLES = Array.from({ length: 9 }, (_, i) => `<circle class="sc-p" cx="${30 + i * 42}" cy="0" r="${2 + (i % 3) * .6}" style="--d:${(i * 0.37).toFixed(2)}s;--s:${i % 2 ? 18 : -14}px"/>`).join('');

function homePos(m) { return m.dwelling === 'public' || m.dwelling === 'facility' ? HOME_X - 4 : HOME_X; }
const PLACE_X = 252;

export function layerHtml(name, m) {
  if (name === 'far') return farLayer(m);
  if (name === 'home') return m.birth === 'hospital' ? '' : `<g transform="translate(${homePos(m)} ${G})">${HOMES[m.dwelling]?.(m) ?? HOMES.house(m)}</g>`;
  if (name === 'place') return (m.place ? `<g transform="translate(${PLACE_X} ${G})">${PLACES[m.place]()}</g>` : '') + (m.clinic ? `<g transform="translate(${W - 40} ${G})">${CLINIC()}</g>` : '');
  if (name === 'decor') return decorHtml(m);
  return castLayer(m);
}

let SEQ = 0;
export function sceneSvg(m) {
  const gid = `sc-sky${++SEQ}`;
  const dx = m.place ? PLACE_X + 22 - ME_X : 0;
  return `<svg class="scene__svg" viewBox="0 0 ${W} ${HGT}" preserveAspectRatio="xMidYMax slice" role="img" aria-label="${esc(sceneLabel(m))}" style="--dx:${dx}px">
<defs><linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--sc-sky-a)"/><stop offset="1" style="stop-color:var(--sc-sky-b)"/></linearGradient></defs>
<rect width="${W}" height="${HGT}" fill="url(#${gid})"/>
<g class="sc-orbit"><g class="sc-sunwrap"><circle class="c-sun" cx="195" cy="16" r="11"/></g><g class="sc-moonwrap"><circle class="c-moon" cx="195" cy="${G + 118}" r="8"/></g></g>
<g class="sc-clouds"><g class="sc-cl sc-cl1"><ellipse class="c-cloud" cx="60" cy="30" rx="26" ry="7"/><ellipse class="c-cloud" cx="78" cy="25" rx="16" ry="8"/></g><g class="sc-cl sc-cl2"><ellipse class="c-cloud" cx="250" cy="44" rx="22" ry="6"/><ellipse class="c-cloud" cx="264" cy="39" rx="13" ry="7"/></g></g>
<g data-ly="far" class="ly">${layerHtml('far', m)}</g>
<rect class="c-ground" x="0" y="${G}" width="${W}" height="${HGT - G}"/><rect class="c-road" x="0" y="${G + 12}" width="${W}" height="2"/>
<g class="ly-trees">${TREE(194)}${TREE(118)}</g>
<g data-ly="home" class="ly">${layerHtml('home', m)}</g>
<g data-ly="place" class="ly">${layerHtml('place', m)}</g>
<g data-ly="cast" class="ly" transform="translate(0 ${G + 6})">${layerHtml('cast', m)}</g>
<g data-ly="decor">${layerHtml('decor', m)}</g>
<rect class="sc-tint" width="${W}" height="${HGT}"/>
<g class="sc-fall">${PARTICLES}</g>
<rect class="sc-night" width="${W}" height="${HGT}"/>
</svg>`;
}
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const DW = { apt: '아파트', house: '단독주택', family: '가족과 함께 사는 집', jeonse: '전세 빌라', monthly: '월세 연립', basement: '반지하 월세방', public: '임대 아파트', facility: '돌봄 시설' };
const PL = { school: '학교', campus: '대학', kinder: '어린이집', office: '사무실', tower: '큰 회사 건물', shop: '가게', store: '내 가게', factory: '공장', farm: '농장', site: '공사 현장', barracks: '부대', bench: '벤치', hospital: '병원', bank: '은행' };
export const sceneLabel = m => `${m.age}세 장면: ${DW[m.dwelling] ?? '집'}${m.place ? ', ' + PL[m.place] : ''}${m.spouse ? ', 배우자' : ''}${m.kids.length ? ', 자녀 ' + m.kids.length + '명' : ''}${m.dead ? ', 고요한 마지막 장면' : ''}`;

// ───────── 마운트 ─────────
// 반환: { el, update(L, {yearMs, speed}), pause(bool), bubble(text, tone), fx(kind), destroy() }
export function sceneHtml(L, { still = false, dead = false, over = {} } = {}) {
  const m = { ...sceneModel(L, { dead }), ...over };
  return `<figure class="scene${still ? ' is-still' : ''}" data-era="${m.era}" data-stage="${m.stage}" data-dead="${dead}" data-keys='${JSON.stringify(layerKeys(m))}'>${sceneSvg(m)}<p class="scene__bubble" aria-hidden="true" hidden></p></figure>`;
}

export function mountScene(root, L, opts = {}) {
  const el = root.querySelector('.scene');
  if (!el) return null;
  let keys = JSON.parse(el.dataset.keys), bubbleT = 0, last = sceneModel(L);
  const svg = () => el.querySelector('.scene__svg');
  const restart = (yearMs = 12000, speed = 1) => {
    const yr = Math.max(1.5, yearMs / 1000 / speed);
    el.style.setProperty('--yr', yr.toFixed(2) + 's');
    el.style.setProperty('--day', Math.max(2.4, yr / 4).toFixed(2) + 's');
    // 강제 리플로 없이 처음부터 다시: 이미 재생 중이면 애니메이션 시간을 0으로, 아니면 run 클래스를 단다
    if (!el.classList.contains('run')) el.classList.add('run');
    else for (const an of el.getAnimations({ subtree: true })) { try { an.currentTime = 0; } catch {} }
  };
  const api = {
    el, restart,
    update(L2, { yearMs, speed, dead } = {}) {
      const m = sceneModel(L2, { dead }), nk = layerKeys(m);
      for (const name of ['far', 'home', 'place', 'cast']) {
        if (nk[name] === keys[name]) continue;
        const g = el.querySelector(`[data-ly="${name}"]`);
        g.innerHTML = layerHtml(name, m);
        if (name !== 'cast' || nk.castFx !== keys.castFx) { g.classList.remove('is-in'); void g.getBoundingClientRect(); g.classList.add('is-in'); }
        if (name === 'place' || name === 'cast') {
          el.querySelector('.scene__svg').style.setProperty('--dx', (m.place ? PLACE_X + 22 - ME_X : 0) + 'px');
        }
      }
      keys = nk; last = m;
      el.dataset.era = m.era; el.dataset.stage = m.stage; el.dataset.dead = !!dead;
      const s = svg(); if (s) s.setAttribute('aria-label', sceneLabel(m));
      restart(yearMs, speed);
    },
    pause(p) { el.classList.toggle('is-paused', !!p); },
    bubble(text, tone = '') {
      const b = el.querySelector('.scene__bubble');
      if (!b) return;
      clearTimeout(bubbleT);
      b.textContent = text; b.dataset.tone = tone; b.hidden = !text;
      b.classList.remove('is-in'); void b.offsetWidth; b.classList.add('is-in');
      bubbleT = setTimeout(() => { b.hidden = true; }, 5200);
    },
    model: () => last,
  };
  restart(opts.yearMs, opts.speed);
  return api;
}

// 비교 카드·결산용 작은 실루엣(나이에 맞는 키). 색은 currentColor
export function silhouetteSvg(age, { cls = '' } = {}) {
  const st = stageOf(age), h = heightFor(age, st);
  return `<svg class="${cls}" viewBox="-14 -66 28 68" aria-hidden="true" fill="currentColor" stroke="currentColor" stroke-width="0">${figure(0, { h, stage: st, hair: age >= 55, cane: age >= 75 }).replace(/ class="c-(fig|me)"/g, '')}</svg>`;
}

// 중대한 사건·결정 카드의 주제 장면(고정 구도). topic: career|job|love|marriage|housing|child|care|retire|loss
const TOPIC = {
  career: L => ({ place: L.age >= 19 ? 'campus' : 'school' }),
  job: () => ({ place: 'tower' }),
  love: () => ({ spouse: true, place: null, decor: 'heart' }),
  marriage: () => ({ spouse: true, place: null, decor: 'arch' }),
  housing: () => ({ place: null }),
  child: () => ({ spouse: true, kids: [0], place: null, decor: 'cradle' }),
  care: () => ({ place: 'hospital', lying: true, decor: 'bed', clinic: false }),
  retire: () => ({ place: 'bench', stage: 'elder' }),
  loss: () => ({ place: 'bench', stage: 'old' }),
  quit: () => ({ place: 'tower', decor: 'box' }),
  closed: () => ({ place: 'store', decor: 'shutter' }),
  loan: () => ({ place: 'bank', decor: 'coin' }),
  shock: () => ({ place: 'bank', decor: 'coin', stage: 'mid' }),
};
export const TOPIC_TITLE = { career: '입학·졸업·진학', job: '일자리', love: '연애', marriage: '결혼', housing: '집·이사', child: '아이', care: '건강·돌봄', retire: '은퇴', loss: '이별·사별', quit: '퇴사·계약 만료', closed: '폐업', loan: '대출', shock: '시대의 충격' };
export function topicSceneHtml(topic, L) {
  const over = { still: true, ...(TOPIC[topic] ?? TOPIC.housing)(L) };
  const m = { ...sceneModel(L), ...over };
  if (over.kids) m.kids = over.kids;
  return `<figure class="scene scene--topic" data-era="${m.era}" data-stage="${m.stage}" data-dead="false">${sceneSvg(m)}</figure>`;
}
