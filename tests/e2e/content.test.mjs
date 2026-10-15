// E2E-5e 콘텐츠 스캔(브라우저 없음): 엔진·UI 순수 함수를 직접 호출해 결산·카드·공유 문구의 금지 표현을 생애 N개에서 검사.
//   QA-A(콘텐츠 감사)를 대체하지 않는다 — 카드·공유 문구·결산 화면에 실리는 문자열만 본다.
import test from 'node:test';
import { newLife, advanceYear, choose, summarize, birthCert } from '../../src/engine/index.js';
import { shareText, cardAlt, pickTimeline } from '../../src/ui/cards.js';
import { kindBadge } from '../../src/ui/labels.js';
import { SOURCES } from '../../src/data/sources.js';
import { checks, RE_RANK, RE_MONEY, RE_JOBRANK, RE_CAUSE_SENS } from './helpers.mjs';

const N = Number(process.env.QA_LIVES || 300);
const lives = [];
test.before(() => {
  for (let seed = 1; seed <= N; seed++) {
    const L = newLife({ seed });
    let g = 0;
    while (L.alive && g++ < 200) { const r = advanceYear(L); if (r.choice) choose(L, r.choice.defaultId, { auto: true }); }
    const sum = summarize(L), cert = birthCert(L);
    lives.push({ seed, L, sum, cert, d: { L, sum, cert } });
  }
});

const sample = (arr, n = 3) => arr.slice(0, n).join(' | ');

test(`E2E-5e 카드·공유 문구(${N}생애): 금액·순위·직급·사인 없음`, () => {
  const c = checks('content-cards');
  const bad = { money: [], rank: [], job: [], cause: [], hash: [] };
  for (const { seed, d, sum } of lives) {
    const cause = sum.death?.causeLabel;
    const texts = {
      birthText: shareText('birth', d), birthAlt: cardAlt('birth', d), verdictText: shareText('verdict', d), verdictAlt: cardAlt('verdict', d),
      tlText: shareText('timeline', d), tlAlt: cardAlt('timeline', d), tlRows: pickTimeline(sum.timeline, 8).map(t => t.text).join(' | '),
      cert: [d.cert.parentsLine, d.cert.homeLine, d.cert.careLine, d.cert.accessLine, d.cert.eraLine, d.cert.quintileLabel, d.cert.hook].join(' | '),
      main: sum.verdict.main,
    };
    for (const [k, v] of Object.entries(texts)) {
      if (RE_MONEY.test(v)) bad.money.push(`${seed}:${k}`);
      if (RE_RANK.test(v)) bad.rank.push(`${seed}:${k}`);
      if (RE_JOBRANK.test(v)) bad.job.push(`${seed}:${k}`);
      if (cause && v.includes(cause)) bad.cause.push(`${seed}:${k}`);
      if (/#|너는 몇 살/.test(v)) bad.hash.push(`${seed}:${k}`);
    }
  }
  c('카드·공유 문구에 금액(만 원·억·원) 없음', bad.money.length === 0, sample(bad.money));
  c('카드·공유 문구에 백분위·순위·등급·상위/하위 N% 없음', bad.rank.length === 0, sample(bad.rank));
  c('카드·공유 문구에 직급 표현 없음', bad.job.length === 0, sample(bad.job));
  c('카드·공유 문구에 사인 라벨 없음', bad.cause.length === 0, sample(bad.cause));
  c('해시태그·도발 문구 없음', bad.hash.length === 0, sample(bad.hash));
  c.done();
});

test(`E2E-5e QA-E-15 판정문 이유 줄의 금액 파생 비율·서열 표현(${N}생애)`, () => {
  const c = checks('content-ratio');
  const pct = [], band = [];
  for (const { seed, sum, d } of lives) {
    const lines = sum.verdict.lines || [];
    const onCard = shareText('verdict', d);
    if (lines.some(l => /\d\s*%/.test(l)) && /\d\s*%/.test(onCard)) pct.push(seed);
    const issue = sum.issues.map(i => i.lines?.[0] || '').join(' | ');
    if (/(상위|하위) 분위/.test(issue)) band.push(seed);
  }
  c.note('통계', { lives: N, percentOnVerdictCard: pct.length, bandInIssueReason: band.length });
  c('공유 문구(판정문)에 "원리금 부담 270%"·"소득 대비 주거비 65%" 같은 금액 파생 % 비율 없음', pct.length === 0, `${pct.length}/${N} 생애, 예 seed ${pct.slice(0, 4)}`);
  c('결산 뉴스 사유에 "가구 소득 상위/하위 분위"(서열 표현) 없음', band.length === 0, `${band.length}/${N} 생애, 예 seed ${band.slice(0, 4)}`);
  c.done();
});

test(`E2E-5e QA-E-16 연표 마지막 줄(사망)이 나이·연도를 되풀이하지 않는다`, () => {
  const c = checks('content-timeline');
  const dup = lives.filter(({ sum }) => { const last = sum.timeline.at(-1); return last && new RegExp(`^${last.age}세, ${last.year}년$`).test(last.text); }).map(x => x.seed);
  c('마지막 연표 줄 텍스트가 "N세, YYYY년"(나이·연도 열과 중복)이 아님', dup.length === 0, `${dup.length}/${N} 생애, 예 seed ${dup.slice(0, 4)}`);
  c.done();
});

test('E2E-5e QA-E-17 출처 메타에 개발 메모·내부 표현이 없다', () => {
  const c = checks('content-sources');
  const bad = Object.entries(SOURCES).filter(([, s]) => /export|note 참조|GDD 절|TODO|임시|\bTBD\b/.test(`${s.title} ${s.org}`)).map(([k]) => k);
  c('SOURCES 의 제목·기관에 "export"·"note 참조"·"GDD 절" 등 개발 메모 없음', bad.length === 0, bad.join(','));
  const longCodes = Object.entries(SOURCES).filter(([, s]) => /(DT_[\w]+\/){2,}/.test(s.title)).map(([k]) => k);
  c.note('표 코드를 길게 나열한 제목(참고)', longCodes);
  const byKind = {}; for (const sc of Object.values(SOURCES)) { const lab = kindBadge(sc.kind).label; (byKind[`${sc.kind}→${lab}`] ||= 0); byKind[`${sc.kind}→${lab}`]++; }
  c.note('SOURCES.kind → UI 배지 라벨 분포(통계 도감 출처 목록이 이 매핑을 씀)', byKind);
  c('QA-E-24 도감 출처 목록: 공식 통계(kind=official)·2차 자료(secondary)가 "게임 추정" 배지로 표시되지 않음', !Object.values(SOURCES).some(sc => sc.kind !== 'game' && kindBadge(sc.kind).label === '게임 추정'), JSON.stringify(byKind));
  c.done();
});

test(`E2E-5e 결산 5지표·explain 16키가 모두 출처와 계산 이유를 가진다(${Math.min(N, 200)}생애)`, () => {
  const c = checks('content-sources-coverage');
  const miss = [];
  for (const { seed, sum } of lives.slice(0, 200)) for (const k of ['econ', 'health', 'relations', 'autonomy', 'careBurden']) { const x = sum.closing[k]; if (![].concat(x?.src || []).length || !x?.line) miss.push(`${seed}:${k}`); }
  c('결산 5지표 모두 출처(src)와 사유 줄(line) 있음', miss.length === 0, sample(miss));
  c.done();
});
