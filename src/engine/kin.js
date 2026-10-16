// 가족 개체화(QA 리뷰 #7): 조부모를 친가/외가·성별 개체로, 배우자를 이름·시작연도 개체로 둔다.
// 이름·구성은 시드에서 따로 파생한 난수만 써서 기존 난수 흐름(L.rng/L.rngC)을 건드리지 않는다.
import * as R from './rng.js';
import { SURNAMES, GIVEN_NAMES } from '../content/names.js';

const SLOTS = [['paternal', 'M', '친할아버지'], ['paternal', 'F', '친할머니'], ['maternal', 'M', '외할아버지'], ['maternal', 'F', '외할머니']];

// 태어날 때 생존한 조부모 n명(2~4)을 4칸 중에서 고른다. 목록 항목: { id, side, sex, label, alive, deathYear? }
export function makeGrandparents(seed, n) {
  const s = R.makeRng(R.hashSeed(seed, 'gp'));
  const order = SLOTS.map(sl => [sl, R.rand(s)]).sort((a, b) => a[1] - b[1]).slice(0, Math.max(0, Math.min(4, n))).map(x => x[0]);
  return SLOTS.filter(sl => order.includes(sl)).map(([side, sex, label]) => ({ id: `gp.${side}.${sex}`, side, sex, label, alive: true }));
}

// 배우자 이름: 혼인 순번(no)마다 독립 난수. 출생 10년대·성별 이름 목록의 앞쪽 가중(birth.js와 같은 방식).
export function spouseName(seed, no, sex, birthYear) {
  const s = R.makeRng(R.hashSeed(seed, 'spouse', no));
  const surname = R.weighted(s, SURNAMES.values);
  const dk = String(Math.min(2020, Math.max(1960, Math.floor(birthYear / 10) * 10)));
  const names = GIVEN_NAMES.values[dk][sex];
  return surname + names[+R.weighted(s, Object.fromEntries(names.map((_, i) => [i, 1 / (i + 2)])))];
}

// 독립 난수로 가족을 생성한다. 미래에 태어날 동생은 현재 구성원에서 제외한다.
export function makeSiblings(L) {
  if (!L.birth) return [];
  const older = Math.max(0, (L.birth.order || 1) - 1);
  const years = [...Array.from({ length: older }, (_, i) => L.birth.year - 2 - i * 2),
    ...(L.flags?.sibAges || []).map(a => L.birth.year + a)];
  return years.map((birthYear, i) => {
    const r = R.makeRng(R.hashSeed(L.seed, 'sibling', i)), sex = R.rand(r) < 0.5 ? 'M' : 'F';
    const full = spouseName(R.hashSeed(L.seed, 'sibling-name'), i, sex, birthYear);
    return { id: `sibling.${i}`, name: (L.name || full).slice(0, 1) + full.slice(1), sex, birthYear, alive: true, bond: 60 };
  });
}
export function ensureKin(L) {
  const f = L.family;
  f.siblingMembers ||= makeSiblings(L);
  f.siblings = f.siblingMembers.filter(s => s.birthYear <= L.year && s.alive).length;
  for (const p of Object.values(f.parents || {})) p.bond ??= 65;
  if (f.partner) f.partner.bond ??= 65;
  for (const c of f.children || []) c.bond ??= 65;
}
export function siblingLabel(L, s) {
  if (s.birthYear >= L.birth.year) return s.sex === 'M' ? '남동생' : '여동생';
  return s.sex === 'M' ? (L.sex === 'M' ? '형' : '오빠') : (L.sex === 'M' ? '누나' : '언니');
}
export const bondLabel = n => n >= 75 ? '돈독함' : n >= 50 ? '가까움' : n >= 30 ? '서먹함' : n >= 10 ? '갈등' : '절연';
export function familyMembers(L) {
  const f = L.family || {}, rows = [];
  for (const [id, p] of Object.entries(f.parents || {})) if (!p.away) rows.push({ id, label: id === 'father' ? '아버지' : '어머니', member: p, age: p.age });
  for (const s of f.siblingMembers || makeSiblings(L)) if (s.birthYear <= L.year && !s.unborn) rows.push({ id: s.id, label: siblingLabel(L, s), member: s, age: s.deathYear ? s.deathYear - s.birthYear : L.year - s.birthYear });
  if (f.partner) rows.push({ id: `spouse.${f.partner.no}`, label: '배우자', member: f.partner, age: f.partner.age });
  (f.children || []).forEach((c, i) => rows.push({ id: `child.${i}`, label: `${['첫째', '둘째', '셋째', '넷째', '다섯째'][i] || `${i + 1}번째 자녀`} ${c.sex === 'M' ? '아들' : '딸'}`, member: c, age: L.year - c.birthYear }));
  return rows;
}
export function changeBond(L, id, delta) {
  const m = familyMembers(L).find(x => x.id === id)?.member;
  if (m && m.alive !== false) m.bond = Math.max(0, Math.min(100, (m.bond ?? 65) + delta));
}
