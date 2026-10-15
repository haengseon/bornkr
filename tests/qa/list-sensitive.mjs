// QA-S 민감(sensitive) 사건 전수와 선택지 출력(비그래픽·기본값 수작업 검토용). 실행: node tests/qa/list-sensitive.mjs
import { EVENTS } from '../../src/content/events/index.js';
for (const e of EVENTS.filter(e => e.sensitive)) {
  const t = Array.isArray(e.text) ? e.text.join(' / ') : typeof e.text === 'function' ? '(fn)' : e.text;
  console.log(`\n${e.id} [${e.sensitive}] ages ${e.ages} once=${!!e.once} p=${typeof e.p === 'function' ? 'fn' : e.p} | ${t}`);
  if (e.choice) { console.log(`   Q: ${e.choice.prompt} default=${e.choice.default}`); for (const o of e.choice.options) console.log(`   - ${o.id}: ${o.label} => ${o.result}${o.hint ? ' (hint ' + o.hint + ')' : ''}`); }
}
