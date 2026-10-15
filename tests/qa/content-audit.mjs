// QA-S 콘텐츠·텍스트 감사. 실행: node tests/qa/content-audit.mjs [생애 수=2000]
// (A) 정적: 사건·시스템 문구·판정문·도움 자원 정의 전체  (B) 동적: N생애에서 실제 생성된 로그·선택 요청·Summary·비교 카드
// 계측 복사본(tests/qa/out/instr)을 써서 fill()의 값 없는 {var}를 잡는다. 원본 src는 수정하지 않는다.
import fs from 'node:fs';
import { isMainThread, pool, serve, range } from './lib/pool.mjs';
import { prepareInstr, instrUrl } from './lib/instr.mjs';

if (isMainThread) prepareInstr();
const E = await import(instrUrl('engine/index.js'));
const { advance, resolve } = await import(instrUrl('engine/life.js'));
const TXT = await import(instrUrl('engine/text.js'));
const { EVENTS, ERA_EVENTS } = await import(instrUrl('content/events/index.js'));
const CORE = (await import(instrUrl('content/jobs-core.js'))).default;
const { SYSTEM_TEXT } = await import(instrUrl('content/system-text.js'));
const { VERDICTS } = await import(instrUrl('content/verdicts.js'));
const { HELP_LINES, HELP_BY_SENSITIVE } = await import(instrUrl('content/help.js'));
const NAMES = await import(instrUrl('content/names.js'));
const { JOBS } = await import(instrUrl('data/jobs.js'));
const { stageOf } = await import(instrUrl('engine/clock.js'));
const { jong } = TXT;

// ───────────────────────── 규칙 어휘 ─────────────────────────
const BAD_TOKEN = /undefined|NaN|\[object|\bnull\b|\$\{|\{[^}]*\}|\bInfinity\b|\bfalse\b|\btrue\b/;
const SPACING = /  |\s[,.。]|\.\.|\(\)|\(\s|\s\)|^\s|\s$|[,，]\s*[,，]/;
const FORBIDDEN_JUDGE = /승리|패배|성공한 삶|실패한 삶|패배자|승자|1등|일등|순위|랭킹|명문|일류|SKY|엘리트|금수저|흙수저|낙오|루저|성공자|실패자/;
const RANK_PCT = /(상위|하위)\s?\d+\s?%|\d+\s?%\s?(상위|하위)|백분위|퍼센타일|\d+\s?등(?![가-힣])|\d+위(?![가-힣])|상위권|하위권/;
const GRADE_WORDS = /(?<!\d)등급/;
const RANK_TITLE = /(?<![가-힣])(사원|대리|과장|차장|부장|팀장|실장|본부장|상무|전무|사장|부사장|임원|이사님|대표님|회장님|부장님|과장님|차장님|대리님|팀장님|사장님|임원진|신입 사원|대리급)(?!증)(?![가-힣]{2})/;
const COMPANY = /삼성|현대자동차|현대차|LG|SK하이닉스|SK텔레콤|네이버|카카오|쿠팡|배달의민족|우아한형제들|포스코|롯데|한화|CJ|이마트|토스|당근|하이브|JYP|SM엔터|YG|넥슨|엔씨소프트|넷마블|KT |한국전력|코레일|국민은행|신한은행|하나은행|우리은행|대한항공|아시아나/;
const REAL_PERSONS = /박정희|전두환|노태우|김영삼|김대중|노무현|이명박|박근혜|문재인|윤석열|이재명|이승만|김종필|최규하|윤보선|한동훈|홍준표|안철수|조국|추미애|정주영|이건희|이재용|정몽구|최태원|손흥민|박지성|김연아|박세리|봉준호|이효리|아이유|싸이|유재석|강호동|BTS|방탄소년단|블랙핑크|트럼프|바이든|오바마|시진핑|푸틴|김정일|김정은|김일성|세월호 선장|이준석|심상정|이낙연|오세훈|박원순|김구|안중근|윤봉길|유관순|이순신|세종대왕|스티브 잡스|일론 머스크|빌 게이츠/;
const POLITICS_EVAL = /독재|적폐|종북|친일|좌파|우파|빨갱이|수구|보수 정권|진보 정권|보수 진영|진보 진영|정의로운|불의|심판받|응징|무능한|무능했|실정|폭정|망국|매국|혁명 완수|국민의 승리|국민의 힘|민주주의의 승리|탄핵 찬성|탄핵 반대|부패한 정권|악정|독재자|영웅|역적|반국가|내란 세력|정치 보복|정권 교체의 |쿠데타를 일으킨 |참담|통탄|분노했다|규탄/;
const GRAPHIC = /(?<![가-힣])피(가|를|투성|범벅)|출혈|(?<![가-힣])칼(에|로|을|이|날)|흉기|찌르|찔렸|찔러|목을 졸|목 졸|시체|사체|시신|죽고 싶|죽으려|극단적 선택|스스로 목숨|목숨을 (끊|잃)|손목을|뛰어내|투신|(?<![가-힣])유서|자살|자해|성폭행|강간|성추행|몰카|불법촬영|발로 (찼|차)|주먹|멱살|뺨을|때렸|구타|폭행|얻어맞|두들겨|(?<![가-힣])멍이|멍든|골절|부러졌|부러뜨|비명|신음/;
const MILD_VIOL = /(에게|한테|께|교실|복도|집에서|뒤에서|앞에서)[^.]{0,14}(맞았|맞은 날)|괴롭|따돌|놀렸|욕설|폭언|학대|성희롱|희롱|체벌|훈육|가해|피해자|피해를|폭력/;
const SELFHARM_WORDS = /자살|자해|극단적 선택|스스로 목숨|죽고 싶|죽으려|목숨을 끊|뛰어내|투신|손목을 그|유서/;
const MONEY_BAD = [
  [/(^|[^\d,억])\d{4,}\s?만\s?원/, '천 단위 쉼표 없는 금액'],
  [/\d{2,3},\d{3}\s?만\s?원/, '만 원 단위가 1만 이상인데 억 단위 미환산(12,345만 원)'],
  [/\d만원|\d\s?만원/, '"만원" 붙여쓰기(규약은 "만 원")'],
  [/(^|\s)0\s?만\s?원/, '0만 원'],
  [/-\s?\d[\d,]*\s?만\s?원/, '음수 금액'],
  [/(^|\s)만 원(을|이|가|은|는|의|에|으로|씩|이었|이다|\.|,|$)/, '숫자 없는 "만 원"(값이 비었을 수 있음)'],
  [/\d억\s?0[^\d,]/, '억 뒤 0'],
  [/\d+\.\d+\s?만/, '소수점 금액'],
];
const NUM_WORD = /\d+번째 [가-힣]+이 \d+번/;

// 사건 텍스트 ↔ 생애 상태 정합 규칙(해당 해 말 상태 기준). 위반 후보만 모으고 보고서에서 사람이 분류한다.
const f = L => L.family;
const everWorked = L => L.job.history.length > 0;
const PARENT_KEEP = /장례|돌아가|세상을 떠|제사|유품|상속|향년|추모|묘|산소|납골|기일|생전|떠난|영정|부고|조문/;
const CONSIST = [
  ['spouse-no-partner', /아내|남편|배우자|신혼|혼수|시댁|(?<![가-힣])처가|시부모|장인|장모|결혼 생활|결혼기념|부부 상담|부부가/, L => !(f(L).partner || f(L).married || f(L).divorced || f(L).widowed)],
  ['kid-no-child', /아이를 (키|돌|맡)|아이가 (태어|자|아프|울|열|처음|첫)|아기|육아|어린이집|분유|돌잔치|아들이|딸이|첫째|둘째|막내가|자녀/, L => L.age >= 19 && f(L).children.length === 0],
  ['grand-no-grandchild', /손주|손자|손녀/, L => !(f(L).grandchildren > 0)],
  ['work-never-worked', /출근|퇴근|야근|월급|사무실|상사|팀장|동료|회사|직장|사직서|연차|회식|거래처|납품/, L => L.age >= 19 && !everWorked(L) && L.job.status !== 'military'],
  ['school-adult-no-kid', /담임|숙제|교과서|등교|하교|통지표/, L => L.age >= 22 && f(L).children.length === 0],
  ['college-no-college', /학과|학점|캠퍼스|동아리|교수님|강의실|수강신청|MT/, L => L.age >= 19 && L.age <= 26 && !L.edu.college && L.edu.stage !== 'retake'],
  ['military-not-served', /군대|입대|전역|훈련소|이병|일병|상병|병장|군복무|군 복무|병영|군번/, L => !(L.sex === 'M' && ['serving', 'done'].includes(L.mil.status))],
  ['parents-dead', /(부모님|엄마|아빠|어머니|아버지)(이|가|은|는|께|와|과|의)? /, L => !L.family.parents.father.alive && !L.family.parents.mother.alive],
  ['sibling-only-child', /동생|형제|자매|언니|오빠|누나/, L => (L.family.siblings ?? 0) === 0],
  ['father-single', /아버지|아빠/, L => L.birth.parents.singleParent && L.age <= 18 && !L.birth.parents.fatherAge],
  ['dating-married', /연애|소개팅|썸/, L => !!f(L).partner && f(L).married],
  ['own-house-renter', /집을 샀|내 집 마련|등기/, L => false],
];

// ───────────────────────── 보조 ─────────────────────────
const strs = v => (typeof v === 'string' ? [v] : Array.isArray(v) ? v.flatMap(strs) : v && typeof v === 'object' && v.prompt ? strs(v.prompt) : []);
const MOCK = new Proxy({}, { get: () => '가나다' });
const mockFill = s => String(s).replace(/\{(\w+)(?:\|[^}]+)?\}/g, '가나다').replace(/\(이\)가|이\(가\)|은\(는\)|을\(를\)|과\(와\)|\(으\)로/g, '가');
const vars = s => [...String(s).matchAll(/\{(\w+)(?:\|([^}]+))?\}/g)].map(m => m[1]);
const len = s => [...String(s)].length;

class Flags {
  constructor() { this.m = {}; }
  add(rule, id, text, extra) {
    const r = (this.m[rule] ||= { n: 0, ids: {}, ex: [] });
    r.n++;
    r.ids[id] = (r.ids[id] || 0) + 1;
    if (r.ex.length < 6 && !r.ex.some(x => x.t === text)) r.ex.push({ id, t: String(text).slice(0, 160), ...(extra && { x: extra }) });
  }
}

// ───────────────────────── (A) 정적 감사 ─────────────────────────
function staticAudit() {
  const F = new Flags();
  const all = [...EVENTS, ...CORE.flatMap(c => (c.events || []).map(e => ({ ...e, id: e.id ?? `job.${c.code}`, _core: true }))), ...ERA_EVENTS];
  const ids = new Map();
  let nChoice = 0, nSens = 0, nSelfHarm = 0;
  for (const ev of all) {
    ids.set(ev.id, (ids.get(ev.id) || 0) + 1);
    const texts = [...strs(ev.text), ...(ev.tiers ? Object.values(ev.tiers).flatMap(strs) : [])];
    const isEra = ERA_EVENTS.includes(ev);
    // 길이·토큰
    for (const t of texts) {
      const m = mockFill(t);
      if (len(m) > 40) F.add('S-len-feed>40', ev.id, t, len(m));
      if (BAD_TOKEN.test(m)) F.add('S-bad-token', ev.id, t);
      if (/\{(name|given|title|region)\}(은|는|이|가|을|를|과|와|으로|로)(?![가-힣])/.test(String(t))) F.add('S-hardcoded-josa', ev.id, t);
      if (FORBIDDEN_JUDGE.test(t) || RANK_PCT.test(t) || GRADE_WORDS.test(t)) F.add('S-judge-word', ev.id, t);
      if (COMPANY.test(t)) F.add('S-company-name', ev.id, t);
      if (REAL_PERSONS.test(t)) F.add('S-real-person', ev.id, t);
      if (RANK_TITLE.test(t)) F.add('S-rank-title(직급명)', ev.id, t);
      if (POLITICS_EVAL.test(t)) F.add('S-politics-eval', ev.id, t);
      if (SELFHARM_WORDS.test(t)) F.add('S-selfharm-word', ev.id, t);
      if (GRAPHIC.test(t)) F.add('S-graphic-word', ev.id, t, ev.sensitive || '-');
      if (!ev.sensitive && MILD_VIOL.test(t) && !isEra) F.add('S-violence-unflagged', ev.id, t);
      for (const [re, why] of MONEY_BAD) if (re.test(m)) F.add('S-money-format', ev.id, t, why);
    }
    if (typeof ev.text === 'function') F.add('S-text-is-function(동적 감사에서 확인)', ev.id, '(function)');
    if (ev.sensitive) nSens++;
    if (ev.sensitive === 'selfharm') { nSelfHarm++; F.add('S-selfharm-event-defined', ev.id, ev.id); }
    if (ev.fx?.stats) for (const [k, v] of Object.entries(ev.fx.stats)) if (Math.abs(v) > 8) F.add('S-fx-over', ev.id, `${k} ${v}`);
    if (ev.fx?.issues) for (const [k, v] of Object.entries(ev.fx.issues)) if (Math.abs(v) > 12) F.add('S-fx-over', ev.id, `${k} ${v}`);
    if (!isEra && !ev.ages) F.add('S-no-ages', ev.id, '(ages 없음)');
    // 선택 구조
    if (ev.choice) {
      nChoice++;
      const c = ev.choice, opts = c.options || [];
      const pr = strs(c.prompt)[0] ?? '';
      if (opts.length < 2 || opts.length > 3) F.add('S-choice-count', ev.id, `${opts.length}개`);
      const ids2 = opts.map(o => o.id);
      if (new Set(ids2).size !== ids2.length) F.add('S-choice-dup-id', ev.id, ids2.join(','));
      if (c.default == null) F.add('S-choice-no-default', ev.id, '(default 없음)');
      else if (typeof c.default === 'string' && !ids2.includes(c.default)) F.add('S-choice-default-invalid', ev.id, `${c.default} ∉ ${ids2}`);
      for (const o of opts) {
        if (len(mockFill(o.label)) > 14) F.add('S-label>14', ev.id, o.label, len(o.label));
        if (!o.label) F.add('S-label-empty', ev.id, o.id);
        if (o.result == null || String(o.result).trim() === '') F.add('S-option-no-result', ev.id, `${o.id}: ${o.label}`);
        else {
          for (const r of strs(o.result)) {
            if (len(mockFill(r)) > 40) F.add('S-result>40', ev.id, r, len(mockFill(r)));
            if (BAD_TOKEN.test(mockFill(r))) F.add('S-bad-token', ev.id, r);
            if (FORBIDDEN_JUDGE.test(r) || RANK_PCT.test(r)) F.add('S-judge-word', ev.id, r);
            if (GRAPHIC.test(r)) F.add('S-graphic-word', ev.id, r, ev.sensitive || '-');
            if (COMPANY.test(r)) F.add('S-company-name', ev.id, r);
            if (REAL_PERSONS.test(r)) F.add('S-real-person', ev.id, r);
            if (POLITICS_EVAL.test(r)) F.add('S-politics-eval', ev.id, r);
          }
        }
        if (o.fx?.stats) for (const [k, v] of Object.entries(o.fx.stats)) if (Math.abs(v) > 8) F.add('S-fx-over', ev.id, `${o.id} ${k} ${v}`);
      }
      for (const t of texts.length ? texts : ['']) {
        const total = len(mockFill(pr)) + len(mockFill(t));
        if (total > 80) F.add('S-prompt+text>80(실패선)', ev.id, `${pr} ${t}`, total);
        else if (total > 60) F.add('S-prompt+text>60', ev.id, `${pr} ${t}`, total);
      }
      if (len(mockFill(pr)) > 30) F.add('S-prompt>30', ev.id, pr, len(pr));
      if (ev.sensitive && !ev.choice) {/* 비선택 민감 사건은 정상 */}
    }
    // 선택지 구분: 무차별 효과(같은 fx 합) → 동일 효과 옵션
    if (ev.choice?.options) {
      const sig = ev.choice.options.map(o => JSON.stringify(o.fx || {}));
      if (new Set(sig).size < sig.length) F.add('S-option-identical-fx', ev.id, ev.choice.options.map(o => o.id).join(','));
      // 우연 선택 사건: 옵션 간 즉시 효과(지표 Δ합) 차 3~10, 한 옵션이 모든 지표에서 우월하면 실패
      const sum = ev.choice.options.map(o => Object.values(o.fx?.stats || {}).reduce((s, v) => s + v, 0));
      const spread = Math.max(...sum) - Math.min(...sum);
      if (spread < 3 || spread > 10) F.add('S-option-spread(Δ합 차 3~10 밖)', ev.id, `Δ합 ${sum.join('/')} 차 ${spread}`);
      const K = ['health', 'intellect', 'happiness', 'wealth', 'relations', 'leisure'];
      const vec = ev.choice.options.map(o => K.map(k => o.fx?.stats?.[k] || 0));
      for (let i = 0; i < vec.length; i++) for (let j = 0; j < vec.length; j++) {
        if (i === j) continue;
        const ge = vec[i].every((v, k) => v >= vec[j][k]), gt = vec[i].some((v, k) => v > vec[j][k]);
        if (ge && gt) { F.add('S-option-dominated(우월 옵션 존재)', ev.id, `${ev.choice.options[i].id} ≥ ${ev.choice.options[j].id} (모든 지표)`); }
      }
    }
  }
  for (const [id, n] of ids) if (n > 1) F.add('S-duplicate-event-id', id, `${n}회`);

  // 시스템 문구
  const sysKeys = Object.keys(TXT.DEFAULT_TEXT);
  const allTextKeys = new Set([...sysKeys, ...Object.keys(SYSTEM_TEXT)]);
  for (const k of allTextKeys) {
    const own = SYSTEM_TEXT[k], def = TXT.DEFAULT_TEXT[k];
    const defVars = new Set(strs(def).flatMap(vars));
    const isCmp = k.startsWith('cmp.'), isEnd = k.startsWith('end.') || k.startsWith('sys.closing');
    for (const [src, val] of [['author', own], ['default', def]]) {
      if (val == null) continue;
      if (typeof val === 'function') { F.add('S-sys-text-function(동적 감사)', k, `(${src} function)`); continue; }
      const variants = typeof val === 'object' && !Array.isArray(val) ? strs(val.prompt) : strs(val);
      for (const t of variants) {
        const m = mockFill(t);
        if (BAD_TOKEN.test(m)) F.add('S-bad-token', k, t);
        const lim = 40;
        if (len(m) > lim) F.add(isCmp ? 'S-cmp-line>40' : 'S-len-feed>40', k, t, len(m));
        if (/\{(name|given|title|region)\}(은|는|이|가|을|를|과|와|으로|로)(?![가-힣])/.test(String(t))) F.add('S-hardcoded-josa', k, t);
        if (FORBIDDEN_JUDGE.test(t) || RANK_PCT.test(t)) F.add('S-judge-word', k, t);
        if (RANK_TITLE.test(t)) F.add('S-rank-title(직급명)', k, t);
        if (GRAPHIC.test(t)) F.add('S-graphic-word', k, t, 'sys');
        if (REAL_PERSONS.test(t) || COMPANY.test(t)) F.add('S-real-person/company', k, t);
        if (src === 'author' && def != null && typeof def !== 'function') {
          const extra = vars(t).filter(v => !defVars.has(v) && v !== 'name');
          if (extra.length) F.add('S-author-var-not-in-engine-template', k, t, extra.join(','));
        }
      }
      if (val && typeof val === 'object' && !Array.isArray(val) && val.options) for (const [oid, lab] of Object.entries(val.options)) if (len(lab) > 14) F.add('S-label>14', `${k}.${oid}`, lab, len(lab));
    }
    if (def && typeof def === 'object' && def.options) for (const [oid, lab] of Object.entries(def.options)) if (len(lab) > 14) F.add('S-label>14', `${k}.${oid}`, lab, len(lab));
    // 시스템 선택: 옵션별 결과 문구 키
    if (def && typeof def === 'object' && !Array.isArray(def) && def.options) {
      for (const oid of Object.keys(def.options)) if (!allTextKeys.has(`${k}.${oid}`)) F.add('S-sys-option-no-result-key', k, `${k}.${oid} 없음`);
      const pr = strs(own ?? def)[0] ?? '';
      if (len(mockFill(pr)) > 60) F.add('S-prompt+text>60', k, pr, len(pr));
    }
  }
  // 작가 키 중 엔진이 모르는 키(사용처 없음)
  const unknown = Object.keys(SYSTEM_TEXT).filter(k => !sysKeys.includes(k) && !/^cmp\.|^end\.|^sys\.closing|^sys\.death|^sys\.clock|^sys\.auto/.test(k));
  for (const k of unknown) F.add('S-author-key-unknown-to-engine', k, k);

  // 판정문
  const vcount = {};
  for (const [fam, list] of Object.entries(VERDICTS)) {
    vcount[fam] = list.length;
    for (const v of list) {
      const m = mockFill(v.text);
      if (BAD_TOKEN.test(m.replace(/\{(name|n|year)[^}]*\}/g, ''))) F.add('S-bad-token', `verdict.${fam}`, v.text);
      if (FORBIDDEN_JUDGE.test(v.text) || RANK_PCT.test(v.text) || COMPANY.test(v.text) || REAL_PERSONS.test(v.text)) F.add('S-judge-word', `verdict.${fam}`, v.text);
      if (len(m) > 60) F.add('S-verdict>60', `verdict.${fam}`, v.text, len(m));
      if (/\d+\s?%|\d[\d,]*\s?만\s?원|연봉|월급\s?\d|부장|과장|대리|사원(?!증)/.test(v.text)) F.add('S-verdict-number/rank', `verdict.${fam}`, v.text);
    }
    const dup = list.map(v => v.text).filter((t, i, a) => a.indexOf(t) !== i);
    for (const d of dup) F.add('S-verdict-duplicate', `verdict.${fam}`, d);
  }
  // 도움 자원
  for (const [kind, hs] of Object.entries(HELP_BY_SENSITIVE)) for (const id of hs) if (!HELP_LINES.some(h => h.id === id)) F.add('S-help-missing-line', kind, id);
  for (const k of ['violence', 'abuse', 'sexual', 'illness', 'death', 'disaster', 'elder']) if (!(HELP_BY_SENSITIVE[k] || []).length) F.add('S-help-kind-empty', k, k);

  // 이름 조합 중 실존 인물(blocklist) 충돌
  const NAMES_BAD = [];
  for (const sn of Object.keys(NAMES.SURNAMES.values)) for (const dec of Object.values(NAMES.GIVEN_NAMES.values)) for (const sx of ['M', 'F']) for (const g of dec[sx]) {
    const full = sn + g;
    if (REAL_PERSONS.test(full) && !NAMES_BAD.includes(full)) NAMES_BAD.push(full);
  }
  for (const n of NAMES_BAD) F.add('S-name-combo-real-person', 'names', n);

  // 직업명(JOBS)
  const jobs = JOBS.values || [];
  let jobBad = 0;
  for (const r of jobs) {
    const nm = r.name || '';
    if (/^그 외|^기타|^그밖|분류 안|분류되지|\(기타\)|^다른 /.test(nm)) F.add('S-job-title-residual("그 외"류 잔여 분류명이 생애 문장에 노출)', `job.${r.code}`, nm);
    if (len(nm) > 18) F.add('S-job-title-long(>18자)', `job.${r.code}`, nm, len(nm));
    if (COMPANY.test(nm) || REAL_PERSONS.test(nm)) F.add('S-real-person/company', `job.${r.code}`, nm);
    if (/\d/.test(nm) || /[A-Za-z]{4,}/.test(nm)) F.add('S-job-title-latin/digit', `job.${r.code}`, nm);
    jobBad++;
  }
  return { F: F.m, counts: { events: all.length, era: ERA_EVENTS.length, choiceEvents: nChoice, sensitiveEvents: nSens, selfHarmEvents: nSelfHarm, sysKeys: allTextKeys.size, jobs: jobs.length, verdicts: vcount } };
}

// ───────────────────────── (B) 동적 감사 ─────────────────────────
const SEED0 = 3_000_000;
const SENS_KINDS = ['violence', 'selfharm', 'abuse', 'sexual', 'illness', 'death', 'disaster'];

function auditText(F, kind, id, text, L, ctx = {}) {
  if (text == null || String(text).trim() === '') { F.add('D-empty-text', id, `(${kind}) 빈 문구`); return; }
  const t = String(text);
  if (BAD_TOKEN.test(t)) F.add('D-bad-token', id, t);
  if (SPACING.test(t)) F.add('D-spacing', id, t);
  for (const [re, why] of MONEY_BAD) if (re.test(t)) F.add('D-money-format', id, t, why);
  // 이름 뒤 조사
  if (L && L.name) {
    const re = new RegExp(L.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(은|는|이|가|을|를|과|와)(?![가-힣])', 'g');
    for (const m of t.matchAll(re)) {
      const j = jong(L.name), p = m[1];
      const okP = j ? ['은', '이', '을', '과'] : ['는', '가', '를', '와'];
      if (!okP.includes(p)) F.add('D-josa-name', id, t, `${L.name}${p}`);
    }
  }
  // 직업명 뒤 조사(sys.job.* 문구): 문장 속 '직업명' + 조사
  if (L?.job?.title) {
    const esc = L.job.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(esc + '(은|는|이|가|을|를|과|와|으로|로)(?![가-힣])', 'g');
    for (const m of t.matchAll(re)) {
      const j = jong(L.job.title), p = m[1];
      const okP = j ? (j === 8 ? ['은', '이', '을', '과', '로'] : ['은', '이', '을', '과', '으로']) : ['는', '가', '를', '와', '로'];
      if (!okP.includes(p)) F.add('D-josa-title', id, t, `${L.job.title}${p}`);
    }
  }
  const n = ctx.skipLen ? 0 : len(t);
  const lim = { cmp: 40, feed: 40, result: 40 }[ctx.limit ?? 'feed'];
  if (n > lim) F.add(ctx.limit === 'cmp' ? 'D-cmp-line>40' : ctx.limit === 'result' ? 'D-result>40' : 'D-feed>40', id, t, n);
  if (!ctx.skipJudge && (FORBIDDEN_JUDGE.test(t) || RANK_PCT.test(t) || GRADE_WORDS.test(t))) F.add('D-judge-word', id, t);
  if (!ctx.skipJudge && RANK_TITLE.test(t)) F.add('D-rank-title(직급명)', id, t);
  if (REAL_PERSONS.test(t) || COMPANY.test(t)) F.add('D-real-person/company', id, t);
  if (POLITICS_EVAL.test(t)) F.add('D-politics-eval', id, t);
  if (/(그 외|기타) [가-힣 ·‧]+(종사원|관리자|기사|사무원|조작원|조립원|판매원|종사자|전문가|기술자)/.test(t)) F.add('D-job-title-residual(문장에 "그 외 ○○" 노출)', id, t);
}

function consistency(F, L, entries) {
  for (const e of entries) {
    if (!e.text || e.kind === 'birth' || e.kind === 'death') continue;
    if (/^sys\./.test(e.id)) continue;   // 시스템 줄은 상태 기계가 만든다(시퀀스 검사는 생애 단위)
    if (/^job\.\d/.test(e.id) && /아이|아기|손님|환자|학생/.test(e.text)) continue;   // 직업 사건의 돌봄 대상은 본인 가족이 아니다
    for (const [rule, re, pred] of CONSIST) {
      if (!re.test(e.text)) continue;
      if (rule === 'parents-dead' && PARENT_KEEP.test(e.text)) continue;
      if (rule === 'father-single') continue;
      let bad = false;
      try { bad = pred(L, e); } catch { bad = false; }
      if (bad) F.add(`C-${rule}`, e.id, e.text, `${L.age}세`);
    }
  }
}

// 생애 시퀀스 불변식(L.log 순서)
function sequence(F, L) {
  const log = L.log, idx = id => log.findIndex(e => e.id === id);
  const first = {};
  for (const e of log) if (!(e.id in first)) first[e.id] = e.age;
  const has = id => id in first;
  if (has('sys.fam.divorced') && !has('sys.fam.wedding') && !has('sys.fam.remarry')) F.add('Q-divorce-without-marriage', 'sys.fam.divorced', `seed ${L.seed}`);
  if (has('sys.fam.widowed') && !has('sys.fam.wedding') && !has('sys.fam.remarry')) F.add('Q-widowed-without-marriage', 'sys.fam.widowed', `seed ${L.seed}`);
  if (has('sys.fam.child_born') && !has('sys.fam.wedding') && !has('sys.fam.remarry')) F.add('Q-child-without-marriage', 'sys.fam.child_born', `seed ${L.seed}`);
  if (has('sys.fam.grandchild') && !has('sys.fam.child_born')) F.add('Q-grandchild-without-child', 'sys.fam.grandchild', `seed ${L.seed}`);
  if (has('sys.fam.child_marry') && !has('sys.fam.child_born')) F.add('Q-child-marry-without-child', 'sys.fam.child_marry', `seed ${L.seed}`);
  if (has('sys.job.exit_main') && !L.job.history.length) F.add('Q-exit-without-job-history', 'sys.job.exit_main', `seed ${L.seed}`);
  if (has('sys.age.pension_start') && !L.job.history.length) F.add('Q-pension-without-work', 'sys.age.pension_start', `seed ${L.seed}`);
  if (has('sys.mil.enlist') && L.sex !== 'M') F.add('Q-military-female', 'sys.mil.enlist', `seed ${L.seed}`);
  const deaths = log.filter(e => e.kind === 'death').length;
  if (deaths !== 1) F.add('Q-death-count!=1', 'death', `${deaths}회 seed ${L.seed}`);
  if (log[log.length - 1].kind !== 'death') F.add('Q-after-death-entry', log[log.length - 1].id, `seed ${L.seed}`);
  // 같은 해 부모 사망·자녀 사망 등 이상한 나이
  for (const e of log) {
    const m = e.id === 'sys.fam.parent_death' && e.text.match(/(\d+)세/);
    if (m && (+m[1] < e.age + 16 || +m[1] > 112)) F.add('Q-parent-age-implausible', e.id, e.text, `내 나이 ${e.age}`);
    if (e.id === 'sys.fam.child_born' && L.sex === 'F' && (e.age < 15 || e.age > 49)) F.add('Q-childbirth-age', e.id, `${e.age}세`);
  }
  // 같은 해 같은 문장 반복(quiet 포함)
  const seen = new Map();
  for (const e of log) { const k = e.age + '|' + e.text; if (seen.has(k) && e.kind !== 'compare') F.add('Q-same-text-same-year', e.id, e.text); seen.set(k, 1); }
}

function repeats(L, A) {
  // 피드에 보이는(quiet 아닌) 줄의 같은 문장 반복
  const cnt = new Map();
  for (const e of L.log) if (!e.quiet && e.kind !== 'compare' && e.kind !== 'birth' && e.kind !== 'death') cnt.set(e.text, (cnt.get(e.text) || 0) + 1);
  let dup = 0, lines = 0, maxRep = 0, repLines = 0;
  for (const [t, n] of cnt) { lines += n; if (n > 1) { dup++; repLines += n - 1; maxRep = Math.max(maxRep, n); A.rep[t] = (A.rep[t] || 0) + 1; } }
  A.lifeLines.push(lines); A.lifeDup.push(dup); A.lifeRepLines.push(repLines); A.lifeMaxRep.push(maxRep);
  // id별(같은 사건의 반복 발생)
  const byId = {}, txById = {};
  for (const e of L.log) if (!e.quiet && (e.kind === 'event' || e.kind === 'system')) { byId[e.id] = (byId[e.id] || 0) + 1; (txById[e.id] ||= new Map()).set(e.text, (txById[e.id].get(e.text) || 0) + 1); }
  for (const [id, n] of Object.entries(byId)) {
    if (n >= 3) A.idRep[id] = Math.max(A.idRep[id] || 0, n);
    const tx = txById[id], same = [...tx.values()].reduce((m, v) => Math.max(m, v), 0);
    if (n >= 2) { A.repLives[id] = (A.repLives[id] || 0) + 1; A.repExtra[id] = (A.repExtra[id] || 0) + (n - tx.size); }
    if (same >= 2) A.sameLives[id] = (A.sameLives[id] || 0) + 1;
    const vs = (A.vars[id] ||= []);
    for (const t of tx.keys()) if (vs.length < 40 && !vs.includes(t)) vs.push(t);
  }
}

const SUMMARY_STRICT = /\d+\s?%|백분위|순위|상위|하위|\d+등|연봉|월급\s?\d|직급|\d[\d,]*\s?만\s?원|\d+억|자살|자해|암\(|악성신생물|심장 질환|뇌혈관|폐렴|알츠하이머|노쇠|패혈증|당뇨병|고혈압성|간 질환|신장·비뇨|운수사고|추락|출생 전후기|사고·기타 외인|코로나19|기타 질환/;
function walkStrings(o, path, out) {
  if (o == null) return;
  if (typeof o === 'string') out.push([path, o]);
  else if (Array.isArray(o)) o.forEach((x, i) => walkStrings(x, `${path}[${i}]`, out));
  else if (typeof o === 'object') for (const [k, v] of Object.entries(o)) walkStrings(v, `${path}.${k}`, out);
}

function auditSummary(F, L, S, withPeers) {
  // 결산·공유·비교 카드 후보 문자열: death(상세)·issues(explain 유래)·sources 제외
  const strict = [];
  for (const k of ['birthCert', 'verdict', 'timeline', 'closing', 'peers']) {
    const part = S[k];
    if (!part) continue;
    walkStrings(k === 'closing' ? Object.fromEntries(Object.entries(part).map(([kk, v]) => [kk, { line: v.line, label: v.label }])) : part, k, strict);
  }
  if (S.capNotice) strict.push(['capNotice', S.capNotice]);
  for (const [path, t] of strict) {
    if (path.includes('.quintile') && !path.includes('quintileLabel')) continue;
    if (/^peers\[\d+\]\.line$/.test(path)) { if (len(t) > 40) F.add('D-peer-summary-line>40(19·42·70세 줄을 이어 붙인 결산 동료 줄)', 'summary.peers[].line', t, len(t)); auditText(F, 'summary', 'summary.peers[].line', t, L, { limit: 'cmp', skipLen: true }); continue; }
    auditText(F, 'summary', `summary.${path.replace(/\[\d+\]/g, '[]')}`, t, L, { limit: 'feed', skipLen: !path.startsWith('timeline') });
    if (path.startsWith('birthCert.eraLine') || path.startsWith('birthCert.story') && /\d+명/.test(t)) {/* 출생 인원수는 허용 */}
    else if (SUMMARY_STRICT.test(t) && !/^timeline\[\d+\]\.text$/.test(path)) F.add('D-summary-forbidden-pattern', `summary.${path.replace(/\[\d+\]/g, '[]')}`, t);
    else if (/^timeline\[\d+\]\.text$/.test(path) && SUMMARY_STRICT.test(t)) F.add('D-summary-forbidden-pattern', 'summary.timeline[].text', t);
  }
  // 사인이 death 상세 밖에 노출되는가(전 사인)
  if (L.death) {
    const label = L.death.causeLabel;
    const flat = JSON.stringify({ ...S, death: null, issues: null, sources: null });
    if (label && flat.includes(label)) F.add('D-cause-label-leak', 'summary', `${label} (${L.death.cause})`);
    if (L.death.sensitive) {
      if (/자살|자해/.test(flat)) F.add('D-suicide-word-leak', 'summary', '결산 본문에 자살/자해');
      if (!S.death.sensitive) F.add('D-suicide-flag-missing', 'summary.death', 'sensitive=false');
    }
  }
  // issues(explain 유래)는 참고 집계: 금액·백분위 포함 여부
  for (const i of S.issues) for (const t of i.lines) {
    if (/\d+\s?%|백분위|순위|상위|하위|\d[\d,]*\s?만\s?원/.test(t)) F.add('D-issues-line-has-number/pct(explain 유래, 참고)', `summary.issues.${i.key}`, t);
    auditText(F, 'issues', `summary.issues.${i.key}`, t, L, { skipJudge: true });
  }
  // 판정문
  const v = S.verdict;
  if (!v.main || /\{|undefined/.test(v.main)) F.add('D-verdict-bad', 'verdict', v.main);
  if (L.alive === false && L.death.age < 5 && /덜|남은|기대수명|아쉽|너무 일찍|짧은 생|짧았/.test(JSON.stringify([v, S.timeline]))) F.add('D-infant-loss-wording', 'verdict', v.main);
  if (L.death.age < 5 && /덜|남은|기대수명/.test(JSON.stringify(S))) F.add('D-infant-loss-wording(Summary 전체)', 'summary', `${L.death.age}세`);
}

function auditChoiceReq(F, L, req, entries) {
  const id = req.eventId;
  const isSys = id.startsWith('sys.');
  const ids = req.options.map(o => o.id);
  if (req.options.length < 2 || req.options.length > 3) F.add('D-choice-option-count', id, `${req.options.length}`);
  if (!ids.includes(req.defaultId)) F.add('D-choice-default-not-in-options', id, `${req.defaultId} ∉ ${ids}`);
  for (const o of req.options) {
    if (isSys && o.label === o.id) F.add('D-sys-label-is-raw-id(라벨 없이 내부 id 노출)', id, `${o.id}`);
    if (len(o.label) > 14) F.add('D-label>14', id, o.label, len(o.label));
    if (!o.label) F.add('D-label-empty', id, o.id);
  }
  const ctxText = [...entries].reverse().find(e => e.id === id && e.kind !== 'choice')?.text ?? '';
  const total = len(req.prompt || '') + len(ctxText);
  if (total > 80) F.add('D-prompt+text>80(실패선)', id, `${req.prompt} / ${ctxText}`, total);
  else if (total > 60) F.add('D-prompt+text>60', id, `${req.prompt} / ${ctxText}`, total);
  if (!req.prompt) F.add('D-choice-no-prompt', id, '(prompt 없음)');
  auditText(F, 'prompt', id, req.prompt, L);
  req.options.forEach(o => auditText(F, 'label', id, o.label, L));
  if (req.sensitive) {
    if (req.timeoutMs !== 20000) F.add('D-sensitive-choice-timeout!=20000', id, `${req.timeoutMs}`);
    if (!req.help || !req.help.length) F.add('D-sensitive-choice-no-help', id, '(help 없음)');
  } else if (req.timeoutMs !== 12000) F.add('D-choice-timeout!=12000', id, `${req.timeoutMs}`);
}

function auditEntries(F, A, L, entries) {
  for (const e of entries) {
    const lim = e.kind === 'choice' ? 'result' : 'feed';
    if (e.kind !== 'compare') auditText(F, e.kind, e.id, e.text, L, { limit: lim });
    A.kinds[e.kind] = (A.kinds[e.kind] || 0) + 1;
    A.ids[e.id] = (A.ids[e.id] || 0) + 1;
    if (e.kind === 'choice' && / → /.test(e.text) && e.id.startsWith('sys.')) F.add('D-sys-choice-result-fallback(결과 문구 키 없음, "질문 → 라벨" 대체)', e.id, e.text);
    if (e.kind === 'choice' && e.id.startsWith('sys.') === false && (!e.text || e.text.length < 2)) F.add('D-choice-result-empty', e.id, e.text);
    if (e.sensitive) {
      A.sens[e.sensitive] = (A.sens[e.sensitive] || 0) + 1;
      if (e.sensitive === 'selfharm' && e.kind !== 'death') F.add('D-selfharm-event-fired', e.id, e.text);
      if (!L.flags['__first_' + e.sensitive]) {}
    }
    // 폭력 어휘 ↔ sensitive 플래그
    if (e.kind === 'event' && !e.sensitive && GRAPHIC.test(e.text)) F.add('D-graphic-unflagged', e.id, e.text);
    if (e.kind === 'event' && !e.sensitive && MILD_VIOL.test(e.text)) F.add('D-violence-word-unflagged', e.id, e.text);
    if (e.kind === 'news' && POLITICS_EVAL.test(e.text)) F.add('D-politics-eval', e.id, e.text);
    if (e.kind !== 'compare' && e.sensitive && e.kind !== 'death' && GRAPHIC.test(e.text)) F.add('D-graphic-in-sensitive', e.id, e.text);
  }
}

function runAudit(job) {
  const F = new Flags();
  const A = { kinds: {}, ids: {}, sens: {}, rep: {}, lifeLines: [], lifeDup: [], lifeRepLines: [], lifeMaxRep: [], idRep: {}, verdicts: {}, helpFirst: { n: 0, ok: 0 }, helpDeath: { n: 0, ok: 0 }, suicideDeaths: 0, nLives: 0, peerLines: {}, missing: {}, choiceIds: {}, cmpLens: [], summaryLens: [], repLives: {}, repExtra: {}, sameLives: {}, vars: {} };
  for (let s = job.from; s < job.to; s++) {
    const seed = SEED0 + s;
    const L = E.newLife({ seed });
    A.nLives++;
    globalThis.__QA_MISSING = [];
    const sensSeen = {};
    const step = r => {
      const miss = globalThis.__QA_MISSING; globalThis.__QA_MISSING = [];
      for (const m of miss) { const k = `${m.key} | ${m.tpl}`; F.add('D-missing-var(값 없는 {var}가 빈 문자열로 치환)', m.tpl.slice(0, 40), m.tpl, m.key); A.missing[k] = (A.missing[k] || 0) + 1; }
      auditEntries(F, A, L, r.entries);
      consistency(F, L, r.entries.filter(e => e.kind === 'event' || e.kind === 'choice' || e.kind === 'news' || e.kind === 'compare'));
      for (const e of r.entries) {
        if (e.sensitive && e.kind !== 'death' && !sensSeen[e.sensitive]) {
          sensSeen[e.sensitive] = true; A.helpFirst.n++;
          if (e.help && e.help.length) A.helpFirst.ok++; else F.add('D-sensitive-first-exposure-no-help', e.id, e.text, e.sensitive);
        }
        if (e.kind === 'death') {
          A.helpDeath.n++;
          if (e.help && e.help.length) A.helpDeath.ok++; else F.add('D-death-no-help', e.id, e.text);
        }
      }
    };
    while (L.alive) {
      let r = advance(L); step(r);
      while (L.pending) {
        auditChoiceReq(F, L, L.pending, r.entries);
        A.choiceIds[L.pending.eventId] = (A.choiceIds[L.pending.eventId] || 0) + 1;
        r = resolve(L, L.pending.defaultId, { auto: true }); step(r);
      }
    }
    // 비교 줄(L.cmp)
    for (const [age, line] of Object.entries(L.cmp || {})) { auditText(F, 'compare', `compare.${age}`, line, L, { limit: 'cmp' }); A.cmpLens.push(len(line)); }
    sequence(F, L);
    repeats(L, A);
    // Summary
    const withPeers = s % 10 === 0;
    let S;
    try { S = E.summarize(L, { peers: withPeers }); } catch (err) { F.add('D-summarize-throws', 'summarize', String(err.message)); continue; }
    auditSummary(F, L, S, withPeers);
    A.verdicts[S.verdict.main] = (A.verdicts[S.verdict.main] || 0) + 1;
    A.summaryLens.push(len(JSON.stringify(S.timeline)));
    for (const p of S.peers || []) { auditText(F, 'peer', 'summary.peers[].line', p.line, L, { limit: 'cmp' }); A.peerLines[p.line] = (A.peerLines[p.line] || 0) + 1; }
    if (L.death.sensitive) A.suicideDeaths++;
    // 비교 카드(compareCard) 전체 — 일부 생애만
    if (withPeers) {
      for (const age of [7, 19, 29, 42, 55, 70]) {
        if (!L.cmp?.[age]) continue;
        const c = E.compareCard(L, age);
        auditText(F, 'cmp-stat', `cmp.stat.${age}`, c.stat, L, { limit: 'cmp' });
        auditText(F, 'cmp-me', `cmp.me.${age}`, c.me.line, L, { limit: 'cmp' });
        for (const p of c.peers) {
          auditText(F, 'cmp-peer', `cmp.peer.${age}`, p.line, L, { limit: 'cmp' });
          if (p.line && /\d+\s?%|순위|상위|하위|\d[\d,]*\s?만\s?원|자살|암\(|사인/.test(p.line)) F.add('D-cmp-forbidden-pattern', `cmp.peer.${age}`, p.line);
          if (/자살|자해|암\(|악성|사인|뇌혈관|심장 질환|폐렴|알츠하이머|노쇠/.test(p.line || '')) F.add('D-cmp-cause-leak', `cmp.peer.${age}`, p.line);
        }
        if (/자살|자해|암\(|악성|사인|뇌혈관|심장 질환|폐렴|알츠하이머|노쇠/.test(c.stat + c.me.line)) F.add('D-cmp-cause-leak', `cmp.${age}`, c.stat + c.me.line);
      }
    }
  }
  return { F: F.m, A };
}

if (!isMainThread) serve(runAudit);
else await main();

// ───────────────────────── 메인 ─────────────────────────
async function main() {
  const N = Number(process.argv[2] || 2000);
  const t0 = Date.now();
  const st = staticAudit();
  console.error(`static done ${(Date.now() - t0) / 1000}s`);
  const parts = await pool(import.meta.url, range(N, 100).map(([from, to]) => ({ from, to })));
  // 병합
  const F = {};
  const A = { kinds: {}, ids: {}, sens: {}, rep: {}, lifeLines: [], lifeDup: [], lifeRepLines: [], lifeMaxRep: [], idRep: {}, verdicts: {}, helpFirst: { n: 0, ok: 0 }, helpDeath: { n: 0, ok: 0 }, suicideDeaths: 0, nLives: 0, peerLines: {}, missing: {}, choiceIds: {}, cmpLens: [], summaryLens: [], repLives: {}, repExtra: {}, sameLives: {}, vars: {} };
  const addMap = (a, b) => { for (const [k, v] of Object.entries(b)) a[k] = (a[k] || 0) + v; };
  for (const p of parts) {
    for (const [rule, r] of Object.entries(p.F)) {
      const t = (F[rule] ||= { n: 0, ids: {}, ex: [] });
      t.n += r.n; addMap(t.ids, r.ids);
      for (const x of r.ex) if (t.ex.length < 6 && !t.ex.some(y => y.t === x.t)) t.ex.push(x);
    }
    const a = p.A;
    for (const k of ['kinds', 'ids', 'sens', 'rep', 'verdicts', 'peerLines', 'missing', 'choiceIds', 'repLives', 'repExtra', 'sameLives']) addMap(A[k], a[k]);
    for (const [id, vs] of Object.entries(a.vars)) { const t = (A.vars[id] ||= []); for (const v of vs) if (t.length < 40 && !t.includes(v)) t.push(v); }
    for (const k of ['lifeLines', 'lifeDup', 'lifeRepLines', 'lifeMaxRep', 'cmpLens', 'summaryLens']) A[k].push(...a[k]);
    for (const [id, n] of Object.entries(a.idRep)) A.idRep[id] = Math.max(A.idRep[id] || 0, n);
    A.helpFirst.n += a.helpFirst.n; A.helpFirst.ok += a.helpFirst.ok; A.helpDeath.n += a.helpDeath.n; A.helpDeath.ok += a.helpDeath.ok;
    A.suicideDeaths += a.suicideDeaths; A.nLives += a.nLives;
  }
  // 도달성: 정의된 사건 id 중 2,000생애에서 한 번도 안 나온 것
  const defined = [...EVENTS.map(e => e.id), ...ERA_EVENTS.map(e => e.id), ...CORE.flatMap(c => (c.events || []).map(e => e.id ?? ''))].filter(Boolean);
  const unreached = defined.filter(id => !A.ids[id] && !A.choiceIds[id]);
  const out = { N, static: st, dynamic: { F, kinds: A.kinds, sens: A.sens, helpFirst: A.helpFirst, helpDeath: A.helpDeath, suicideDeaths: A.suicideDeaths, nLives: A.nLives, unreached, definedCount: defined.length } };
  // 반복·다양성
  const mean = a => a.reduce((s, x) => s + x, 0) / Math.max(1, a.length);
  const pct = (a, p) => { const s = [...a].sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(p * s.length))]; };
  const vtot = Object.values(A.verdicts).reduce((s, x) => s + x, 0), vents = Object.entries(A.verdicts).sort((a, b) => b[1] - a[1]);
  const H = -Object.values(A.verdicts).reduce((s, n) => s + (n / vtot) * Math.log2(n / vtot), 0);
  out.diversity = {
    verdictDistinct: vents.length, verdictTop5: vents.slice(0, 5).map(([t, n]) => `${(n / vtot * 100).toFixed(1)}% ${t}`), verdictEntropyBits: +H.toFixed(2),
    lifeFeedLines: mean(A.lifeLines), livesWithDup: A.lifeDup.filter(x => x > 0).length / A.lifeDup.length, dupSentencesPerLife: mean(A.lifeDup), repeatedLinesPerLife: mean(A.lifeRepLines), repeatedShare: mean(A.lifeRepLines) / mean(A.lifeLines),
    maxRep: Math.max(...A.lifeMaxRep), p95Rep: pct(A.lifeMaxRep, 0.95),
    topSameIdRepeat: Object.entries(A.repExtra).sort((a, b) => b[1] - a[1]).slice(0, 25).map(([id, n]) => ({ id, extraRepeats: n, livesRepeating: A.repLives[id], livesSameSentence: A.sameLives[id] || 0, variantsSeen: A.vars[id].length, example: A.vars[id][0] })),
    topRepeatedSentences: Object.entries(A.rep).sort((a, b) => b[1] - a[1]).slice(0, 15), idRepeatMax: Object.entries(A.idRep).sort((a, b) => b[1] - a[1]).slice(0, 12),
    peerLineDistinct: Object.keys(A.peerLines).length, cmpLenMax: Math.max(...A.cmpLens), cmpLenP95: pct(A.cmpLens, 0.95),
  };
  fs.mkdirSync(new URL('./out/', import.meta.url), { recursive: true });
  fs.writeFileSync(new URL('./out/content.json', import.meta.url), JSON.stringify(out, null, 1));
  console.error(`done ${(Date.now() - t0) / 1000}s`);
  // 출력
  const show = (title, Fm) => {
    console.log(`\n## ${title}`);
    for (const [rule, r] of Object.entries(Fm).sort((a, b) => b[1].n - a[1].n)) {
      console.log(`- ${rule}: ${r.n}건 (id ${Object.keys(r.ids).length}종)`);
      for (const x of r.ex.slice(0, 4)) console.log(`    · ${x.id}${x.x ? ` [${x.x}]` : ''}: ${x.t}`);
    }
  };
  console.log(JSON.stringify(st.counts));
  show('정적', st.F);
  show(`동적(N=${A.nLives})`, F);
  const area = id => /^early\./.test(id) ? 'A early' : /^school\./.test(id) ? 'A school' : /^youth\./.test(id) ? 'B youth' : /^mid\./.test(id) ? 'C mid' : /^late\./.test(id) ? 'C late' : /^era\./.test(id) ? 'D era' : /^job\./.test(id) ? 'jobs' : /^sys\./.test(id) ? 'sys-text' : /^cmp|^compare|^summary/.test(id) ? 'engine/summary' : 'other';
  const byArea = {};
  for (const rule of ['D-feed>40', 'D-result>40', 'D-label>14', 'D-prompt+text>60', 'D-prompt+text>80(실패선)', 'D-cmp-line>40']) {
    for (const [id, n] of Object.entries(F[rule]?.ids || {})) { const k = rule + ' | ' + area(id); byArea[k] = byArea[k] || { n: 0, ids: 0 }; byArea[k].n += n; byArea[k].ids++; }
  }
  for (const rule of ['S-len-feed>40', 'S-result>40', 'S-label>14', 'S-prompt+text>60', 'S-option-spread(Δ합 차 3~10 밖)', 'S-option-dominated(우월 옵션 존재)', 'S-option-no-result', 'S-rank-title(직급명)']) {
    for (const [id, n] of Object.entries(st.F[rule]?.ids || {})) { const k = rule + ' | ' + area(id); byArea[k] = byArea[k] || { n: 0, ids: 0 }; byArea[k].n += n; byArea[k].ids++; }
  }
  out.byArea = byArea;
  fs.writeFileSync(new URL('./out/content.json', import.meta.url), JSON.stringify(out, null, 1));
  console.log('\n## 영역별(규칙 | 영역: 건수, 사건 수)');
  for (const [k, v] of Object.entries(byArea).sort()) console.log(`- ${k}: ${v.n}건 / ${v.ids}종`);
  console.log('\n## 요약');
  console.log(JSON.stringify({ kinds: A.kinds, sens: A.sens, helpFirst: A.helpFirst, helpDeath: A.helpDeath, suicideDeaths: A.suicideDeaths, definedEvents: defined.length, unreached: unreached.length, diversity: out.diversity }, null, 1));
  console.log('\n도달 못 한 사건:', unreached.join(', '));
}
