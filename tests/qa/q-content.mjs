// QA-S 연표 출력 조회 도구: node tests/qa/q-content.mjs <규칙 접두> [static|dynamic] [id 접두]  (먼저 content-audit.mjs 실행)
import fs from 'node:fs';
const J = JSON.parse(fs.readFileSync(new URL('./out/content.json', import.meta.url)));
const [, , rule, scope = 'dynamic', filt] = process.argv;
const F = scope === 'static' ? J.static.F : J.dynamic.F;
const r = F[rule] || Object.entries(F).find(([k]) => k.startsWith(rule))?.[1];
if (!r) { console.log('no rule', Object.keys(F).join('\n')); process.exit(); }
console.log(r.n, 'hits');
for (const [id, n] of Object.entries(r.ids).sort((a, b) => b[1] - a[1])) if (!filt || id.startsWith(filt)) console.log(n, id);
for (const x of r.ex) console.log(' ex', x.id, x.x ?? '', x.t);
