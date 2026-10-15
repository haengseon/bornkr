// 올해의 나(개인 일상 기록): 사건이 없는 해에도 상태에서 파생한 개인 한 줄을 만든다(kind:'personal').
// 난수는 시드에서 따로 파생(L.rng·rngC 비소비). 최근 5년 같은 틀 금지, 시대 어휘 가드·국민학교 표기 적용.
import * as R from './rng.js';
import { NOTES } from '../content/personal-notes.js';
import { needYear, eraSchool } from './anachro.js';

// 한 해 최대 max개(서로 다른 틀)
export function yearNotes(L, max = 2) {
  const out = [];
  for (let i = 0; i < max; i++) { const x = yearNote(L, i); if (x) out.push(x); }
  return out;
}

export function yearNote(L, salt = 0) {
  const s = R.makeRng(R.hashSeed(L.seed, 'note', L.age, salt)), used = (L.flags.noteUsed ||= {});
  const cands = [];
  for (const [key, fn] of NOTES) {
    let t;
    try { t = fn(L); } catch { t = null; }
    if (!t || (used[key] != null && L.year - used[key] < 5)) continue;
    const ok = t.filter(x => needYear(x) <= L.year);
    if (ok.length) cands.push([key, ok]);
  }
  if (!cands.length) return null;
  const [key, ts] = cands[Math.floor(R.rand(s) * cands.length)];
  used[key] = L.year;
  return { key, text: eraSchool(L.year, ts[Math.floor(R.rand(s) * ts.length)]) };
}
