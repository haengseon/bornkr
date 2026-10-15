// QA-S 안전·표시 보조 검사(GDD §15.3): 영아·아동 사망 문구, hideSensitiveCause, 자살 사망 Summary 사인 노출, 도움 줄 구성.
// 실행: node tests/qa/safety-checks.mjs
import * as E from '../../src/engine/index.js';
import { CAUSE_LABELS } from '../../src/data/mortality.js';
import { HELP_LINES, HELP_BY_SENSITIVE } from '../../src/content/help.js';

const LOSS = /덜|남은|기대수명|아쉽|너무 일찍|짧은 생|아직 못|못 다|못다|손실|잃어버린/;
const CAUSES = Object.values(CAUSE_LABELS.values);
let infants = 0, young = 0, lossHits = [], causeHits = [], suicides = 0, hideFail = [], sensFlag = 0, helpMissing = 0, helpOrder = 0;
// 영아·아동 사망 표본: 1960~65 출생·저소득·농촌으로 고정해 사망 확률을 키운다
for (let i = 0; i < 6000; i++) {
  const L = E.newLife({ seed: 99_000_000 + i, forced: { year: 1960 + (i % 6), quintile: 1, urban: false } });
  E.runToEnd(L);
  if (L.death.age >= 19) continue;
  young++; if (L.death.age < 5) infants++;
  const S = E.summarize(L, { peers: false });
  const txt = JSON.stringify({ ...S, death: null, sources: null, issues: null });
  if (L.death.age < 5 && LOSS.test(txt)) lossHits.push(`seed ${L.seed} ${L.death.age}세: ${txt.match(LOSS)[0]}`);
  if (CAUSES.some(c => txt.includes(c))) causeHits.push(`seed ${L.seed}: ${CAUSES.find(c => txt.includes(c))}`);
  const dl = L.log.find(e => e.kind === 'death');
  if (L.death.age < 5 && /덜|남은|기대수명/.test(dl.text)) lossHits.push(`death line ${dl.text}`);
}
console.log(`영아·아동 사망 표본 ${young}건(5세 미만 ${infants}건): 손실 산수 문구 ${lossHits.length}건 ${lossHits.slice(0, 3)}, 사인 문자열 노출 ${causeHits.length}건`);

// 자살 사망: hideSensitiveCause, Summary 노출, 도움 줄
for (let i = 0; i < 40000 && suicides < 150; i++) {
  const L = E.newLife({ seed: 101_000_000 + i, forced: { year: 1960 + (i % 40) } });
  E.runToEnd(L);
  if (!L.death.sensitive) continue;
  suicides++;
  const S = E.summarize(L, { peers: false }), H = E.summarize(L, { peers: false, hideSensitiveCause: true });
  if (H.death.causeLabel !== null) hideFail.push(`seed ${L.seed}: hide on인데 causeLabel=${H.death.causeLabel}`);
  if (S.death.causeLabel == null || !S.death.sensitive) hideFail.push(`seed ${L.seed}: hide off인데 causeLabel=${S.death.causeLabel}, sensitive=${S.death.sensitive}`);
  const dl = L.log.find(e => e.kind === 'death');
  if (!dl.sensitive || !dl.help?.length) helpMissing++;
  if (dl.help?.[0]?.id !== '109') helpOrder++;
  if (JSON.stringify({ ...S, death: null, sources: null }).match(/자살|자해|고의적/)) causeHits.push(`seed ${L.seed}: 자살 Summary 노출`);
  if (L.death.age < 19 && !dl.help.some(h => h.id === '1388')) helpMissing++;
}
console.log(`자살 사망 ${suicides}건: hideSensitiveCause 위반 ${hideFail.length} ${hideFail.slice(0, 2)} · 사망 기록 sensitive/help 누락 ${helpMissing} · 첫 도움 줄이 109가 아님 ${helpOrder} · Summary 자살 노출 ${causeHits.length}`);
// 도움 자원 정합
const miss = [];
for (const [k, ids] of Object.entries(HELP_BY_SENSITIVE)) for (const id of ids) if (!HELP_LINES.find(h => h.id === id)) miss.push(`${k}:${id}`);
console.log(`HELP_BY_SENSITIVE → HELP_LINES 참조 누락: ${miss.length ? miss : '없음'} · 도움 자원 ${HELP_LINES.length}개, 번호 중복 ${HELP_LINES.length - new Set(HELP_LINES.map(h => h.number)).size}`);
console.log('1393 포함 여부(폐지 번호):', HELP_LINES.some(h => h.number === '1393') ? '포함(결함)' : '없음');
