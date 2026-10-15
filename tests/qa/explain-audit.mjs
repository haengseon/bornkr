// QA-S explain() 감사(GDD §15.1 '모든 주요 지표에 출처·연도·계산 이유'). 실행: node tests/qa/explain-audit.mjs [생애 수=200]
// 200생애 × 체크포인트(7·19·29·42·55·70세·사망 직전) × (6지표 + 10축 + 결산 5지표): lines ≥2, src ≥1, src.year·kind·org 존재, SOURCES 키 존재.
import * as E from '../../src/engine/index.js';
import { advance, resolve } from '../../src/engine/life.js';
import { STAT_KEYS, ISSUE_KEYS } from '../../src/engine/constants.js';
import * as D from '../../src/data/index.js';

const N = Number(process.argv[2] || 200), S0 = 71_000_000;
const KEYS = [...STAT_KEYS, ...ISSUE_KEYS, 'econ', 'autonomy', 'careBurden'];   // 'health'·'relations'는 6지표 키와 겹쳐 explain()으로는 결산 쪽에 닿지 않는다(아래에서 summarize().closing으로 따로 검사)
const CHECK = [7, 19, 29, 42, 55, 70];
const bad = {}, ex = {};
const KINDS = new Set(['measured', 'projected', 'estimated']);
let calls = 0, lifeCheckpoints = 0;
const F = (rule, key, detail) => { bad[rule] = (bad[rule] || 0) + 1; (ex[rule] ||= []).length < 5 && ex[rule].push(`${key}: ${detail}`); };
const BADTXT = /undefined|NaN|\[object|null|\{|\}/;

function checkpoint(L, label) {
  lifeCheckpoints++;
  const CL = E.summarize(L, { peers: false }).closing;
  for (const [k, c] of Object.entries(CL)) {
    calls++;
    if (!c.line || c.line.length < 2) F('closing.line 없음', k + '@' + label, String(c.line));
    if (!c.src?.length) F('closing.src<1', k + '@' + label, '(출처 없음)');
    for (const s of c.src || []) { if (!D.SOURCES?.[s.id]) F('closing SOURCES 키 없음', k, s.id); if (!Number.isFinite(s.year)) F('closing src.year 없음', k, s.id); if (!KINDS.has(s.kind)) F('closing src.kind 이상', k, s.id); }
    if (!Number.isInteger(c.value) || c.value < 0 || c.value > 100) F('closing value 범위', k, String(c.value));
  }
  for (const k of KEYS) {
    let r;
    try { r = E.explain(L, k); calls++; } catch (e) { F('throw', `${k}@${label}`, String(e.message).slice(0, 80)); continue; }
    if (!Array.isArray(r.lines) || r.lines.length < 2) F('lines<2', `${k}@${label}`, JSON.stringify(r.lines));
    if (!Array.isArray(r.src) || r.src.length < 1) F('src<1', `${k}@${label}`, '(출처 없음)');
    for (const s of r.src || []) {
      if (!s.id) F('src.id 없음', k, JSON.stringify(s).slice(0, 80));
      else if (!D.SOURCES?.[s.id]) F('SOURCES에 키 없음', `${k}`, s.id);
      if (!Number.isFinite(s.year)) F('src.year 없음', k, `${s.id}`);
      if (!KINDS.has(s.kind)) F('src.kind 이상', k, `${s.id}:${s.kind}`);
      if (!s.org) F('src.org 없음', k, s.id);
    }
    if (!Number.isInteger(r.value) || r.value < 0 || r.value > 100) F('value 범위', k, String(r.value));
    for (const l of r.lines || []) if (BADTXT.test(l)) F('lines 토큰 이상', `${k}@${label}`, l);
    if (r.lines?.some((l, i) => r.lines.indexOf(l) !== i)) F('lines 중복', `${k}@${label}`, r.lines.join(' | ').slice(0, 120));
  }
}

for (let i = 0; i < N; i++) {
  const L = E.newLife({ seed: S0 + i });
  checkpoint(L, '0');
  while (L.alive) {
    advance(L); while (L.pending) resolve(L, L.pending.defaultId, { auto: true });
    if (CHECK.includes(L.age) && L.alive) checkpoint(L, String(L.age));
  }
  checkpoint(L, 'dead');
}
console.log(`생애 ${N}, 체크포인트 ${lifeCheckpoints}, explain 호출 ${calls}`);
console.log(Object.keys(bad).length ? Object.entries(bad).map(([k, n]) => `불: ${k} ${n}건 예) ${ex[k].join(' ; ')}`).join('\n') : '위반 0');
