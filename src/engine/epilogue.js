// 인생 회고문(결산 '인생 판정문'): L의 실제 상태에서 별명·문단 3~5개·한 줄 총평을 만든다. 순수·결정적(시드 'epilogue').
// 문장 풀: src/content/epilogue.js. 시대착오는 anachro.needYear로 문단 기준 해에 맞춰 거른다.
import * as R from './rng.js';
import { needYear } from './anachro.js';
import { fill } from './text.js';
import { ISSUE_KEYS, TRAIT_KEYS } from './constants.js';
import { REGION } from './tables.js';
import { SGG } from './sigungu.js';
import * as P from '../content/epilogue.js';

const MAX_PARA = 220;
const TENS = ['', '열', '스물', '서른', '마흔', '쉰', '예순', '일흔', '여든', '아흔'];
const ONES = ['', '하나', '둘', '셋', '넷', '다섯', '여섯', '일곱', '여덟', '아홉'];
const CNT = ['', '한', '두', '세', '네', '다섯', '여섯', '일곱', '여덟', '아홉'];
// 고유어 수: 27 → '스물일곱', 단위 앞(counter) 14 → '열네', 20 → '스무'
export function koNum(n, counter = false) {
  n = Math.max(1, Math.min(99, Math.round(n)));
  const t = Math.floor(n / 10), o = n % 10;
  if (counter && t === 2 && o === 0) return '스무';
  return TENS[t] + (counter ? CNT : ONES)[o];
}
const SEASON = m => (m >= 3 && m <= 5 ? '봄' : m <= 8 && m >= 6 ? '여름' : m >= 9 && m <= 11 ? '가을' : '겨울');
const RANK = /부장|과장|차장|대리|임원|사장|이사|팀장|본부장/;

function facts(L) {
  const b = L.birth, by = b.year, age = L.death?.age ?? L.age, endYear = L.death?.year ?? L.year;
  const reg = REGION[b.region] ?? { full: '', label: '' }, sg = SGG.get(b.sigungu);
  const f = L.family || {}, home = L.home || {}, job = L.job || {};
  const hist = (job.history || []).filter(h => h.code);
  const span = h => (h.to ?? endYear) - h.from;
  const main = hist.reduce((m, h) => (!m || span(h) > span(m) ? h : m), null);
  const moves = (home.moves || []).filter(m => m.year - by >= 19);
  const everTo = k => moves.some(m => m.to === k) || home.tenure === k;
  // 성인기 평균 관심사 최고 축(45 미만이면 quiet)
  let top = null;
  if (age >= 19) {
    const sum = ISSUE_KEYS.map(() => 0); let n = 0;
    for (let a = 19; a <= age; a++) if (L.hist?.[a]) { L.hist[a].i.forEach((v, i) => (sum[i] += v)); n++; }
    const i = sum.indexOf(Math.max(...sum));
    top = n && sum[i] / n >= 45 ? ISSUE_KEYS[i] : 'quiet';
  }
  const tr = L.traits || {};
  const tk = TRAIT_KEYS.reduce((m, k) => (Math.abs((tr[k] ?? 50) - 50) > Math.abs((tr[m] ?? 50) - 50) ? k : m), TRAIT_KEYS[0]);
  const tdev = (tr[tk] ?? 50) - 50;
  const spouses = f.spouses || [];
  const married = spouses.length > 0 || f.marriedYear != null;
  const mYear = spouses[0]?.since ?? f.marriedYear;
  const par = f.parents || {};
  const parGone = ['father', 'mother'].every(k => par[k] && !par[k].alive && par[k].deathYear != null && par[k].deathYear - by >= 20 && par[k].deathYear <= endYear);
  const job1 = hist[0] && !RANK.test(hist[0].title || '') ? hist[0].title : null;
  const c = {
    name: L.name, by, age, endYear, urban: !!b.urban, q: b.quintile, sib: b.siblings ?? f.siblings ?? 0, care: b.care, tenure: b.tenure,
    single: !!b.parents?.singleParent, multi: !!b.parents?.multicultural, male: L.sex === 'M',
    edu: L.edu?.level, retake: (L.edu?.retake || 0) > 0, mil: L.mil?.status === 'done',
    jobs: hist.length, job1, job1Y: hist[0]?.from ?? 0, g: String(main?.code ?? '')[0] ?? '', long: !!main && span(main) >= 15,
    hop: hist.length >= 4, platform: !!job.platform, retired: job.status === 'retired' && hist.length > 0, noWork: !hist.length && age >= 25,
    worked: y => y <= endYear && hist.some(h => h.from <= y && (h.to ?? endYear) >= y),
    moves: moves.length, jeonse: everTo('jeonse'), monthly: everTo('monthly'), pub: everTo('public'),
    owned: !!home.owned || moves.some(m => m.to === 'own'), fraud: !!L.flags?.fraud,
    toCapital: !!L.flags?.toCapital && !REGION[b.region]?.capital,
    married, divorced: !!f.divorced || spouses.some(s => s.end === 'divorce'), widowed: !!f.widowed,
    kids: (f.children || []).length, grand: (f.grandchildren || 0) > 0, parentsGone: parGone,
    spouseCare: married && !f.widowed && age >= 65 && (f.caringFor === 'spouse' || !!f.partner?.ltc),
    top, trait: Math.abs(tdev) >= 12 ? `${tk}${tdev > 0 ? '+' : '-'}` : 'mid', extraHi: (tr.extra ?? 50) >= 60,
    diabetes: !!L.health?.dx?.diabetes, ltc: !!L.aging?.ltc, alone: !!f.livingAlone,
    horizon: !!L.death?.horizon, sens: !!L.death?.sensitive,
    sudden: ['transport', 'fall', 'external'].includes(L.death?.cause),   // 사고사엔 '조용히 눈을 감았다'류를 쓰지 않는다(deathStory와 모순 방지)
  };
  c.vars = {
    name: L.name, year: by, endYear, season: SEASON(b.month), sido: reg.full,
    place: sg ? `${reg.label} ${sg.name}` : reg.full, job1,
    mAge: mYear != null ? koNum(mYear - by) : '', mainYears: main ? `${koNum(span(main), true)} 해` : '',
    movesK: `${koNum(moves.length, true)} 번`,
  };
  return c;
}

const norm = x => (typeof x === 'string' ? [0, x] : x);

export function epilogueOf(L, opts = {}) {
  const c = facts(L);
  const s = R.makeRng(R.hashSeed(L.seed, 'epilogue'));
  const used = new Set();
  const take = (pool, ref = c.endYear) => {
    const cand = (pool || []).map(norm).filter(([f, t]) => (!f || f(c)) && !used.has(t) && needYear(t) <= ref);
    if (!cand.length) return null;
    const t = R.pick(s, cand)[1];
    used.add(t);
    return fill(t, c.vars);
  };
  const traitPool = c.trait === 'mid' ? P.TRAIT.mid : P.TRAIT[c.trait.slice(0, -1)].filter(([h]) => h === (c.trait.endsWith('+') ? 1 : 0)).map(([, t]) => [0, t]);
  const issuePool = P.ISSUE[c.top] ?? P.ISSUE.quiet;
  const bucket = c.horizon ? 'horizon' : c.sens ? 'sensitive' : c.age < 5 ? 'infant' : c.age < 19 ? 'young' : c.age < 40 ? 'early' : c.age < 65 ? 'mid' : 'old';
  const endPool = P.END[bucket];
  const ref = (y) => Math.min(y, c.endYear);

  const paras = [];
  if (c.age < 5) {
    paras.push([take(P.OPEN, c.by), take(P.HOME, c.by)]);
    paras.push([take(P.INFANT), take(P.INFANT)]);
    paras.push([take(P.INFANT), take(endPool)]);
  } else if (c.age < 19) {
    paras.push([take(P.OPEN, c.by), take(P.HOME, c.by), take(P.CHILD, ref(c.by + 8))]);
    paras.push(c.age >= 13 ? [take(P.SCHOOL, ref(c.by + 16)), take(P.KID)] : [take(P.KID), take(P.KID)]);
    paras.push([take(P.KID), take(endPool)]);                         // 아이에게 어른의 성품 문장을 붙이지 않는다
  } else {
    paras.push([take(P.OPEN, c.by), take(P.HOME, c.by), take(P.CHILD, c.by + 8)]);
    paras.push([take(P.SCHOOL, c.by + 16), take(P.EDU, c.by + 22), take(P.EDU, c.by + 22)]);
    if (c.age >= 22) paras.push(c.jobs ? [take(P.WORK1, c.job1Y || c.endYear), take(P.WORK2), take(P.HOUSE)] : [c.noWork ? take(P.NOWORK) : null, take(P.HOUSE), take(P.HOUSE)]);
    if (c.age >= 25) {
      const evs = P.ERA.filter(e => { const a = e.y <= c.endYear ? e.y - c.by : -1; return a >= e.lo && a <= e.hi; });
      const ev = evs.length ? R.pick(s, evs) : null;
      paras.push([take(P.LOVE), take(P.KIDS), (ev && take(ev.t, ev.y)) || take(P.ERA_ANY)]);
    }
    const first = R.chance(s, 0.5);
    paras.push(c.age >= 60
      ? [take(first ? traitPool : issuePool), take(P.LATE), take(endPool)]
      : [take(traitPool), take(issuePool), take(endPool)]);
  }
  const paragraphs = paras.map(ss => ss.filter(Boolean)).filter(ss => ss.length).map((ss, i, all) => {
    const last = i === all.length - 1;
    while (ss.length > 2 && ss.join(' ').length > MAX_PARA) ss.splice(last ? ss.length - 2 : 1, 1);   // 마지막 문단은 끝 문장(맺음)을 지킨다
    return ss.join(' ');
  });

  // 별명
  const spec = P.TITLES_SPECIAL[c.sens ? 'sensitive' : c.age < 5 ? 'infant' : c.age < 19 ? 'young' : ''];
  const titles = spec ? spec : [...P.TITLES.filter(([f]) => f(c)).map(([, t]) => t), ...(c.horizon ? P.TITLES_SPECIAL.horizon : [])];
  const title = fill(titles.length ? R.pick(s, titles) : '한 시대를 건넌 사람', c.vars);

  // 한 줄 총평
  const recent = opts.recent || [];
  const codas = c.horizon && c.age < 19 ? P.CODA.horizon
    : ['sensitive', 'infant', 'young', 'early'].includes(bucket) ? P.CODA[bucket]
      : [...(c.horizon ? P.CODA.horizon : []), ...(c.top === 'job' && !c.jobs ? [] : P.CODA[c.top] || []), ...P.CODA.general];
  const fresh = codas.filter(t => !recent.includes(t));
  const coda = R.pick(s, fresh.length ? fresh : codas);
  return { title, paragraphs, coda };
}
