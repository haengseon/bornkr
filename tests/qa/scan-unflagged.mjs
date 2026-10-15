// QA-S sensitive 미지정인데 죽음·질병·부상 어휘가 있는 사건 목록. 실행: node tests/qa/scan-unflagged.mjs
import { EVENTS } from '../../src/content/events/index.js';
import CORE from '../../src/content/jobs-core.js';
const all = [...EVENTS, ...CORE.flatMap(c => c.events || [])];
const RE = /장례|영정|부고|세상을 떠|돌아가|사망|유골|추모|암 진단|암이|항암|투병|중환자|응급실|수술|치매|입원|호스피스|임종|우울|죽음|죽었|숨졌|사고로|다쳤|골절|화상|부상|추락/;
const strs = v => (typeof v === 'string' ? [v] : Array.isArray(v) ? v.flatMap(strs) : []);
const hit = [];
for (const e of all) {
  if (e.sensitive) continue;
  const t = [...strs(e.text), ...(e.choice?.options || []).flatMap(o => strs(o.result))].filter(x => RE.test(x));
  if (t.length) hit.push(`${e.id} | ${t[0]}`);
}
console.log(hit.length); console.log(hit.join('\n'));
