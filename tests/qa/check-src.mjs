// QA-S 사건 src ID가 SOURCES에 있는지. 실행: node tests/qa/check-src.mjs
import { EVENTS, ERA_EVENTS } from '../../src/content/events/index.js';
import CORE from '../../src/content/jobs-core.js';
import * as D from '../../src/data/index.js';
const miss = {};
const all = [...EVENTS, ...ERA_EVENTS, ...CORE.flatMap(c => [...(c.events || []), ...(c.entry || [])])];
for (const e of all) for (const s of [].concat(e.src || [])) if (!D.SOURCES[s]) (miss[s] ||= []).push(e.id || e.type);
console.log(Object.entries(miss).map(([k, v]) => `${k}: ${v.length}건 (${v.slice(0, 4).join(', ')})`).join('\n') || '모든 src가 SOURCES에 있음');
// 표 src
const tm = [];
for (const [k, v] of Object.entries(D)) if (v && typeof v === 'object' && v.src && !D.SOURCES[v.src]) tm.push(`${k}:${v.src}`);
console.log('표 src 미등록:', tm.join(', ') || '없음');
