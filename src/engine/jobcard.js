// 일자리 제안 카드(순수): 선택지 옆에 보여 줄 당대 급여(2025 실질 연 만원 — 화면이 그해 명목·2026 환산으로 바꾼다)와 사회 인식.
import { PERCEPTION, eraIdx, modifier } from '../content/job-perception.js';
import * as R from './rng.js';

const FIRM_L = { public: '공공 부문', large: '대기업', mid: '중견·중소기업', small: '소규모 사업장', micro: '영세 사업장' };
export function jobCard(L, o, label) {
  const year = L.year, major = /영업|판매/.test(o.title || '') ? '5' : o.major, list = PERCEPTION[major] || PERCEPTION[9], base = list[Math.max(0, eraIdx(year))];
  const s = R.makeRng(R.hashSeed(L.seed, 'jobcard', o.code ?? o.title, year));
  const lines = [R.pick(s, base)];
  const m = modifier(o, year); if (m) lines.push(m);
  return {
    label, title: o.title, wage: o.wage, year,
    kind: [o.self ? '자영' : o.regular ? '정규직' : '비정규직', FIRM_L[o.firmSize]].filter(Boolean).join(' · '),
    perception: lines,
  };
}
