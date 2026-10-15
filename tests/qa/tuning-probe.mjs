// QA-S 튜닝 제안 검증(코드 수정 없이 런타임에 tuning.js 객체 값을 바꿔 측정). 실행: node tests/qa/tuning-probe.mjs
//  1) CHANCE_SCALE 배수 → 생애당 선택 수(목표 22~30, 구간 기대치 GDD §2.1)
//  2) CAL_MARRY 배수 → 50세 미혼율·평균 초혼 연령
// 주의: 이 스크립트는 값을 '제안'하기 위한 것이며, 채택은 엔진 담당이 tuning.js에서 한다.
import * as E from '../../src/engine/index.js';
import { CHANCE_SCALE, CAL_MARRY, CAL_COLLEGE } from '../../src/engine/tuning.js';
import { advance, resolve } from '../../src/engine/life.js';
import { stageOf } from '../../src/engine/clock.js';

const mean = a => a.reduce((s, x) => s + x, 0) / Math.max(1, a.length);
function lives(n, seed0, forced, until = 999) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const L = E.newLife({ seed: seed0 + i, ...(forced && { forced }) });
    while (L.alive && L.age < until) { advance(L); while (L.pending) resolve(L, L.pending.defaultId, { auto: true }); }
    out.push(L);
  }
  return out;
}
function choiceStats(label, n = 500) {
  const per = { early: [], school: [], youth: [], mid: [], late: [] }, tot = [];
  for (const L of lives(n, 61_000_000)) {
    const c = L.choices.filter(x => !x.forced), by = { early: 0, school: 0, youth: 0, mid: 0, late: 0 };
    for (const x of c) by[stageOf(x.age).id]++;
    for (const k in by) per[k].push(by[k]);
    tot.push(c.length);
  }
  console.log(`${label}: 선택/생애 ${mean(tot).toFixed(1)} (early ${mean(per.early).toFixed(1)} · school ${mean(per.school).toFixed(1)} · youth ${mean(per.youth).toFixed(1)} · mid ${mean(per.mid).toFixed(1)} · late ${mean(per.late).toFixed(1)})  GDD 기대 1.5/7/9/6/3`);
}

choiceStats('현재(CHANCE_SCALE 전부 1)');
for (const sc of [{ early: 1.5, school: 2.5, youth: 1.2, mid: 1.1, late: 1 }, { early: 1.5, school: 3.0, youth: 1.2, mid: 1.2, late: 1 }, { early: 2.0, school: 4.0, youth: 1.3, mid: 1.2, late: 1 }]) {
  Object.assign(CHANCE_SCALE, sc);
  choiceStats(`CHANCE_SCALE ${JSON.stringify(sc)}`);
}
Object.assign(CHANCE_SCALE, { early: 1, school: 1, youth: 1, mid: 1, late: 1 });

// 혼인: CAL_MARRY 배수(출생 1960~2026 전 구간 같은 배수)
function nm(year, sex, n = 1500) {
  const a = lives(n, 62_000_000 + year, { year, sex }, 51).filter(L => L.alive || L.death.age >= 50);
  return { never: a.filter(L => L.family.marriedYear == null).length / a.length, n: a.length };
}
for (const k of [1, 0.7, 0.5]) {
  for (const s of ['M', 'F']) for (const y of [1960, 2026]) CAL_MARRY[s][y] = k;
  const r = [[1965, 'M', 10.9], [1965, 'F', 5.0], [1975, 'M', 21.4], [1975, 'F', 10.9]].map(([y, s, t]) => `${y}년생 ${s} ${(nm(y, s).never * 100).toFixed(1)}%(목표 ${t})`);
  console.log(`CAL_MARRY ×${k}: ${r.join(' · ')}`);
}
for (const s of ['M', 'F']) for (const y of [1960, 2026]) CAL_MARRY[s][y] = 1;

// 진학률: CAL_COLLEGE 연도별
function college(Y, n = 2500) {
  const a = lives(n, 63_000_000 + Y, { year: Y - 18 }, 19).filter(L => L.log.some(x => x.id === 'sys.edu.csat'));
  return a.filter(L => L.log.some(x => x.id === 'sys.edu.college_enter' && x.age <= 18)).length / a.length;
}
const TG = { 1990: 33.2, 2008: 83.8, 2015: 70.8, 2024: 73.6 };
for (const [Y, f] of [[1990, 1], [2008, 1], [2015, 1], [2024, 1], [1990, 1.06], [2008, 1.04], [2015, 0.97], [2024, 0.89]]) {
  CAL_COLLEGE[1960] = f; CAL_COLLEGE[2026] = f;   // yr() 키 캐시 때문에 기존 키 값만 바꾼다(전 구간 같은 배수)
  console.log(`CAL_COLLEGE[${Y}]=${f}: 졸업연도 ${Y} 당해 진학률 ${(college(Y) * 100).toFixed(1)}% (목표 ${TG[Y]})`);
  CAL_COLLEGE[1960] = 1; CAL_COLLEGE[2026] = 1;
}
