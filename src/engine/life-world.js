import { hashSeed } from './rng.js';

const list = value => Array.isArray(value) ? value : [];
export const lifeWorldHomeKey = L => [L.home?.region, L.home?.sigungu, L.home?.dong, L.home?.tenure, list(L.home?.moves).length].join('|');
const student = L => ['elem', 'middle', 'high', 'college', 'grad'].includes(L.edu?.stage);
const roll = (L, key) => hashSeed(L.seed, `game-world:${key}`) >>> 0;

/** Current fictional scene assumptions only. No cash, qualifications, contracts or historical choices. */
export function prepareLifeWorld(L, ctx) {
  if (!(L.modelVersion >= 2) || L.alive !== true || !Number.isInteger(L.year) || L.age < 6) return null;
  const d = L.dailyLife ||= {};
  d.history ||= []; d.people ||= [];
  const homeKey = lifeWorldHomeKey(L), school = student(L), schoolKey = `${L.edu?.stage}:${L.edu?.school || ''}`;
  const previous = d.world;
  const homeSame = previous?.homeKey === homeKey;
  const schoolSame = previous?.schoolKey === schoolKey;
  const sourceKind = 'game-world-assumption';
  const urban = L.birth?.urban === true;
  const adultHome = L.age >= 19 && L.home && !['facility', 'dorm'].includes(L.home.tenure);
  const sibling = L.home?.parents ? list(L.family?.siblingMembers).find(s => s.alive === true && !s.unborn && !s.leftHome && s.birthYear <= L.year) : null;
  const digital = { phone: L.age >= 13 && L.year >= 1995, internet: L.year >= 2010 };
  const access = { library: school && L.year >= 1960 || urban && L.year >= 1970,
    cinema: urban && L.year >= 1960, communityGarden: L.year >= 2000 && !urban,
    publicInternet: L.year >= 2000 };
  const inventory = homeSame ? list(previous?.inventory) : [];
  if (adultHome && !inventory.some(i => i.kind === 'appliance') && L.year >= 1985) {
    inventory.push({ id: `world.appliance.${roll(L, homeKey)}`, kind: 'appliance', label: '기본 생활가전',
      ownedYear: L.year, working: true, repairQuote: 5, replacementQuote: 20, sourceKind });
  }
  const heating = adultHome ? homeSame && previous?.heating ? previous.heating : {
    kind: L.year < 1980 ? 'coal' : L.year < 2000 ? 'oil' : 'gas', fuelStock: 1, unitQuote: 2, sourceKind,
  } : null;
  const world = {
    year: L.year, homeKey, schoolKey, sourceKind, currencyBaseYear: 2025,
    schoolRoute: school ? schoolSame && homeSame && previous?.schoolRoute ? previous.schoolRoute : {
      walkSafe: (roll(L, `${homeKey}:${schoolKey}:walk`) % 4) !== 0,
      walkMinutes: 15 + roll(L, `${homeKey}:${schoolKey}:minutes`) % 4 * 5,
      busFare: L.year >= 1960 ? .15 : 0, sourceKind,
    } : null,
    ownedBooks: school ? schoolSame && previous?.ownedBooks?.length ? previous.ownedBooks : [{ id: `world.book.${schoolKey}`, title: '기본 학습용 책', ownedYear: L.year, sourceKind }] : [],
    roomCount: sibling ? 2 : null,
    sharedSpace: sibling ? { siblingId: sibling.id || `sibling.${sibling.birthYear}`, conflictRecorded: false,
      otherPlaceAvailable: school || access.library, partitionQuote: 3, sourceKind } : null,
    inventory: adultHome ? inventory : [], heating, digital, access,
  };
  // Preserve an actual later conflict only while the same sibling and home remain in scope.
  if (homeSame && world.sharedSpace?.siblingId === previous?.sharedSpace?.siblingId && previous?.sharedSpace?.conflictRecorded) world.sharedSpace.conflictRecorded = true;
  for (const p of d.people) if (p.sourceKind === sourceKind && p.role === 'classmate' && (!school || p.schoolKey !== schoolKey)) p.away = true;
  if (school) {
    const id = `world.classmate.${schoolKey}.${L.year}`;
    if (!d.people.some(p => p.sourceKind === sourceKind && p.schoolKey === schoolKey && !p.away)) {
      d.people.push({ id, role: 'classmate', name: '같은 수업에서 처음 인사한 사람', alive: true,
        metYear: L.year, schoolKey, sourceKind, sourceEventId: `world.context.${L.year}` });
    }
  }
  d.world = world;
  const contextKey = `${homeKey}|${schoolKey}|${digital.phone}|${digital.internet}|${!!heating}|${world.inventory.length}`;
  if (previous?.contextKey !== contextKey) {
    const entry = { id: `world.context.${L.year}.${roll(L, contextKey)}`, year: L.year, age: L.age,
      kind: 'world-context', status: 'confirmed', sourceKind, sourceEventId: 'game-world',
      evidenceLevel: 'game-assumption', text: '사는 곳과 다니는 곳, 쓰는 물건이 조금 바뀌었다.' };
    if (!d.history.some(e => e.id === entry.id)) { d.history.push(entry); ctx?.emit?.({ kind: 'personal', ...entry }); }
  }
  world.contextKey = contextKey;
  return world;
}

export const syncLifeWorld = prepareLifeWorld;
