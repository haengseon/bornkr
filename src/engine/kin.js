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
