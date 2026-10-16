// 같은 날 태어난 3명(GDD §11.1)과 비교 카드. 동료는 시드 파생이라 결정적이다.
// 동료는 플레이어와 같은 속도로 산다: peers(L)는 출생 시점엔 출생 정보만 만들고(가볍다),
// 비교 카드·결산이 필요한 나이까지만 이어서 진행한다(QA-E-13·QA-S-28: 출생 화면 long task 제거).
// 진행 순서는 runToEnd(default)와 같아 끝까지 가면 결과가 같다.
import { hashSeed } from './rng.js';
import { newLife } from './birth.js';
import { advance, resolve } from './life.js';
import { isCapital, REGION } from './tables.js';
import { snapshot, statLine, peerLine, compareLine } from './compare.js';

const CACHE = new WeakMap();
const qg = q => (q <= 2 ? 0 : q === 3 ? 1 : 2);
const diverse = all => new Set(all.map(x => qg(x.birth.quintile))).size >= 2
  && new Set(all.map(x => isCapital(x.birth.region))).size >= 2
  && new Set(all.map(x => x.sex)).size >= 2;

function state(L) {
  let st = CACHE.get(L);
  if (st) return st;
  const b = L.birth, lives = [];
  for (let i = 0; i < 3; i++) {
    let P;
    // 다양성 제약: 마지막 동료를 결정적으로 최대 5번 다시 뽑는다
    for (let reroll = 0; reroll < 5; reroll++) {
      P = newLife({ seed: hashSeed(L.seed, 'peer', i, reroll), modelVersion: L.modelVersion ?? 1, forced: { year: b.year, month: b.month, day: b.day } });
      if (i < 2 || diverse([L, ...lives, P])) break;
    }
    lives.push(P);
  }
  lives.sort((x, y) => x.birth.minute - y.birth.minute);
  st = { lives, snaps: lives.map(snapshot) };
  CACHE.set(L, st);
  return st;
}

// 동료를 age세(그해 끝)까지 진행하고 스냅숏을 갱신
function grow(st, age) {
  st.lives.forEach((P, i) => {
    if (!P.alive || (P.age >= age && !P.pending)) return;
    while (P.alive && (P.pending || P.age < age)) {
      if (P.pending) resolve(P, P.pending.defaultId, { auto: true });
      else advance(P);
    }
    Object.assign(st.snaps[i], snapshot(P));
  });
}

// 이미 만든 동료는 플레이어와 같은 해만큼 따라 산다(해마다 ~1ms, 결산 때 몰아서 계산하지 않게)
export function keepPace(L) {
  const st = CACHE.get(L);
  if (st) grow(st, L.age);
}

// 기본: 플레이어의 현재 나이까지(사망했으면 끝까지)
export function peers(L, age = L.alive ? L.age : Infinity) {
  const st = state(L);
  grow(st, age);
  return st.snaps;
}

export function compareCard(L, age) {
  return {
    age,
    stat: statLine(L, age),
    me: { name: L.name, sex: L.sex, region: REGION[L.birth.region]?.label, alive: L.alive && L.age >= age, line: L.cmp?.[age] ?? compareLine(L, age, null), order: L.birth.minute },
    peers: peers(L, age).map(P => ({ name: P.name, sex: P.sex, region: P.regionLabel, order: P.order, birthLine: P.birthLine, ...peerLine(P, age) })),
  };
}
