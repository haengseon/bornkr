// QA-S 시대 뉴스 전수 출력(정치 중립·실명 수작업 검토용). 실행: node tests/qa/list-era.mjs
import { ERA_EVENTS } from '../../src/content/events/index.js';
for (const e of ERA_EVENTS) {
  const t = e.tiers ? e.tiers.adult : e.text;
  console.log(`${e.id} [${e.years?.join('-')}] w${e.weight ?? 1}${e.sensitive ? ' S:' + e.sensitive : ''} | ${t}${e.tiers?.child ? ' || c: ' + e.tiers.child : ''}`);
}
