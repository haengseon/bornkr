// 템플릿 채우기·조사 처리·시스템 문구 기본값(ARCHITECTURE §9, §18).
// 작가 문구(SYSTEM_TEXT)에 키가 있으면 그것을, 없으면 아래 DEFAULT_TEXT를 쓴다.
import { SYSTEM_TEXT } from '../content/system-text.js';
import { needYear, eraSchool } from './anachro.js';

const PAIRS = {
  은: ['은', '는'], 는: ['은', '는'], 이: ['이', '가'], 가: ['이', '가'],
  을: ['을', '를'], 를: ['을', '를'], 과: ['과', '와'], 와: ['과', '와'],
  아: ['아', '야'], 야: ['아', '야'], 으로: ['으로', '로'], 로: ['으로', '로'],
};
// 숫자 끝자리의 받침(영·일·이·삼·사·오·육·칠·팔·구): 0 = 없음, 8 = ㄹ
const DIGIT_JONG = [21, 8, 0, 16, 0, 0, 1, 8, 8, 0];

// 마지막 글자의 받침 인덱스(0 = 받침 없음, 8 = ㄹ)
export function jong(word) {
  const m = String(word).match(/[가-힣0-9A-Za-z](?=[^가-힣0-9A-Za-z]*$)/);
  if (!m) return 0;
  const c = m[0], code = c.charCodeAt(0);
  if (code >= 0xac00 && code <= 0xd7a3) return (code - 0xac00) % 28;
  if (c >= '0' && c <= '9') return DIGIT_JONG[+c];
  return /[lmn]/i.test(c) ? (/l/i.test(c) ? 8 : 4) : 0;
}

export function josa(word, j) {
  const pair = PAIRS[j];
  if (!pair) return j;
  const t = jong(word);
  if (pair[0] === '으로') return t === 0 || t === 8 ? '로' : '으로';
  return t ? pair[0] : pair[1];
}

// '사람이(가)', '서울(으)로' 같은 괄호 조사를 앞 글자에 맞춰 정리
const PAREN = /([가-힣0-9A-Za-z])(이\(가\)|은\(는\)|을\(를\)|과\(와\)|와\(과\)|아\(야\)|\(으\)로|\(이\)가|\(은\)는|\(을\)를)/g;
const PAREN_KEY = { '이(가)': '이', '은(는)': '은', '을(를)': '을', '과(와)': '과', '와(과)': '과', '아(야)': '아', '(으)로': '으로', '(이)가': '이', '(은)는': '은', '(을)를': '을' };

// tpl: 문자열 | 문자열[] | (L, vars) => 문자열. ctx(선택)는 배열 변형 선택(pick)과 함수 템플릿의 L 제공.
// 변형 배열에서 이 생애에 아직 안 쓴 변형을 고른다(모두 쓰면 다시 처음부터). 난수는 pick과 같이 1회만 쓴다(QA-S-16).
function pickFresh(arr, ctx) {
  const L = ctx.L;
  if (!L || !ctx.rand || arr.length < 2 || arr.length > 30) return ctx.pick(arr);
  const key = arr.length + ':' + String(arr[0]).slice(0, 24), seen = (L.seen ||= {});
  const all = 2 ** arr.length - 1;
  let used = seen[key] || 0;
  if ((used & all) === all) used = 0;
  const free = [];
  for (let i = 0; i < arr.length; i++) if (!(used & (1 << i))) free.push(i);
  const i = free[Math.floor(ctx.rand() * free.length)];
  seen[key] = used | (1 << i);
  return arr[i];
}

export function fill(tpl, vars = {}, ctx = null) {
  if (Array.isArray(tpl) && ctx?.L?.year) { const ok = tpl.filter(s => needYear(s) <= ctx.L.year); if (ok.length) tpl = ok; }   // 시대착오 변형 제외(QA #2)
  if (Array.isArray(tpl)) tpl = tpl.length ? (ctx ? pickFresh(tpl, ctx) : tpl[0]) : '';
  if (typeof tpl === 'function') tpl = tpl(ctx?.L ?? null, Object.assign(Object.create(ctx), vars));
  if (tpl == null) return '';
  const out = String(tpl)
    .replace(/\{(\w+)(?:\|([^}]+))?\}/g, (_, k, j) => {
      const v = vars[k];
      if (v == null) return '';
      return j ? v + josa(v, j) : String(v);
    })
    .replace(PAREN, (_, c, p) => c + josa(c, PAREN_KEY[p]));
  return eraSchool(vars.year ?? ctx?.L?.year, out);       // 1996 이전 '국민학교' 표기(QA #2)
}

// 금액(만원) 표기: 23150 → '2억 3,150'. 템플릿 쪽에 '만 원'이 붙는다.
export function won(n) {
  n = Math.round(n);
  const c = x => String(x).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  if (Math.abs(n) < 10000) return c(n);
  const eok = Math.trunc(n / 10000), rest = Math.abs(n % 10000);
  return rest ? `${eok}억 ${c(rest)}` : `${eok}억`;
}
const MONEY_VARS = ['amount', 'loan', 'pay'];

// 작가 문구 우선, 없으면 기본값. keys 여러 개면 처음 존재하는 키.
export function rawText(...keys) {
  for (const k of keys) if (SYSTEM_TEXT[k] != null) return SYSTEM_TEXT[k];
  for (const k of keys) if (DEFAULT_TEXT[k] != null) return DEFAULT_TEXT[k];
  return null;
}

export function text(key, vars = {}, ctx) {
  for (const k of MONEY_VARS) if (typeof vars[k] === 'number') vars = { ...vars, [k]: won(vars[k]) };
  let t = rawText(...[].concat(key));
  if (t && typeof t === 'object' && !Array.isArray(t)) t = t.prompt;
  return fill(t, vars, ctx);
}

// 선택 지점 문구: { prompt, labels:{id:label} }
export function choiceText(key, vars = {}, ctx) {
  for (const k of MONEY_VARS) if (typeof vars[k] === 'number') vars = { ...vars, [k]: won(vars[k]) };
  const def = DEFAULT_TEXT[key] || {};
  const own = SYSTEM_TEXT[key];
  const isObj = own && typeof own === 'object' && !Array.isArray(own);
  const prompt = fill(isObj ? own.prompt ?? def.prompt : own ?? def.prompt, vars, ctx);
  return { prompt, labels: { ...def.options, ...(isObj ? own.options : null) } };
}

export const DEFAULT_TEXT = {
  // 교육
  'sys.edu.daycare': '어린이집에 다니기 시작했다.',
  'sys.edu.kinder': '유치원 가방을 처음 멨다.',
  'sys.edu.elem_enter': '초등학교에 입학했다.',
  'sys.edu.middle_enter': '중학생이 되었다.',
  'sys.edu.tutoring': { prompt: '학원을 더 다닐지 정해야 했다.', options: { more: '학원을 늘린다', keep: '지금대로', less: '줄인다' } },
  'sys.edu.high_type': { prompt: '고등학교를 골라야 했다.', options: { general: '일반고', voc: '특성화고', special: '특목·자사고' } },
  'sys.edu.high_enter': '{highTypeLabel}에 들어갔다.',
  'sys.edu.csat': '{exam|을} 치렀다.',
  'sys.edu.path': { prompt: '졸업 후 갈 길을 정해야 했다.', options: { college: '대학에 간다', work: '일을 시작한다', retake: '한 해 더' } },
  'sys.edu.college_enter': '{collegeLabel}에 입학했다.',
  'sys.edu.no_college': '대학 대신 일을 찾기로 했다.',
  'sys.edu.retake': '한 해 더 시험을 준비했다.',
  'sys.edu.loan': '학자금 대출 {amount}만 원을 받았다.',
  'sys.edu.resume': '복학해 남은 수업을 이어 갔다.',
  'sys.edu.leave': '휴학계를 내고 다음 학년도 쉬기로 했다.',
  'sys.edu.dropout': '학교를 그만두었다.',
  'sys.edu.graduate': '{levelLabel|을} 졸업했다.',
  'sys.edu.grad_enter': '대학원에 진학했다.',
  // 이정표(PROCESS-V2) — 작가가 SYSTEM_TEXT에 넣으면 그쪽이 우선
  'sys.mil.timing': { prompt: '입대 시기를 정해야 했다.', options: { now: '바로 간다', later: '학업·일 뒤로 미룬다' } },
  'sys.fam.love': { prompt: '마음이 가는 사람이 생겼다.', options: { confess: '마음을 전한다', wait: '지켜본다', focus: '일에 집중한다' } },
  'sys.era.shock': { prompt: '{shock|이} 내 삶에도 닥쳤다. 어떻게 버틸지 정해야 했다.', options: { hold: '자리를 지킨다', move: '직장을 옮긴다', cut: '빚과 씀씀이를 줄인다', learn: '배움에 투자한다', close: '가게를 정리한다', buy: '지금 집을 산다', wait: '지켜본다' } },
  'sys.chain.biz_crisis': { prompt: '가게 매출이 몇 달째 바닥이었다.', options: { push: '대출로 버틴다', close: '정리한다' } },
  'sys.chain.biz_rebuild': { prompt: '가게를 접은 지 한 해. 다시 해 볼지 정해야 했다.', options: { again: '다시 연다', work: '일자리를 찾는다' } },
  'sys.chain.mortgage': { prompt: '집 대출 이자가 월급의 절반 가까이 되었다.', options: { hold: '버틴다', sell: '팔고 전세로' } },
  'sys.chain.exam_retry': { prompt: '시험에 또 떨어졌다.', options: { again: '한 번 더 본다', quit: '그만두고 취업한다' } },
  'sys.ripple.career': '{n}년 전 고른 길({label})이 지금의 하루를 만들고 있다.',
  'sys.ripple.job': '{n}년 전 일의 결정({label})이 지금 통장에 남아 있다.',
  'sys.ripple.housing': '{n}년 전 집 문제의 결정({label})이 지금 사는 곳을 정했다.',
  'sys.ripple.love': '{n}년 전 마음({label})이 지금의 관계로 이어졌다.',
  'sys.ripple.marriage': '{n}년 전 결혼의 결정({label})이 지금의 식탁을 만들었다.',
  'sys.ripple.child': '{n}년 전 아이 문제의 결정({label})이 지금의 하루를 채운다.',
  'sys.ripple.care': '{n}년 전 돌봄의 결정({label})이 아직 이어지고 있다.',
  'sys.ripple.retire': '{n}년 전 퇴직 무렵의 결정({label})이 지금의 노후를 만들었다.',
  'sys.ripple.shock': '{n}년 전 위기 때의 결정({label})이 지금도 남아 있다.',
  // 병역
  'sys.mil.enlist': '입대했다. 머리가 짧아졌다.',
  'sys.mil.discharge': '전역했다. {months}개월이 지나 있었다.',
  'sys.mil.exempt': '병역이 면제되었다.',
  // 일
  'sys.job.search': '이력서를 쓰기 시작했다.',
  'sys.job.search_long': '취업 준비 {n}년째.',
  'sys.job.first_offer': { prompt: '첫 일자리 제안이 왔다. {title}.', options: { take: '바로 들어간다', wait: '더 준비한다', exam: '공시를 본다' } },
  'sys.job.first': '{title|으로} 첫 출근을 했다.',
  'sys.job.contract_end': '계약 기간이 끝났다.',
  'sys.job.convert': '정규직으로 전환되었다.',
  'sys.job.lose': '일자리를 잃었다({reasonLabel}).',
  'sys.job.reemploy': '다시 일을 구했다: {title}.',
  'sys.job.offer': { prompt: '다른 회사에서 연락이 왔다.', options: { move: '옮긴다', stay: '남는다' } },
  'sys.job.raise': '근속 {n}년. 월급이 조금 올랐다.',
  'sys.job.business': { prompt: '가게를 차려 볼까 하는 마음이 들었다.', options: { open: '가게를 연다', job: '일자리를 찾는다' } },
  'sys.job.business_open': '{title} 일로 가게 문을 열었다.',
  'sys.job.business_close': '가게를 정리했다.',
  'sys.job.childcare': { prompt: '아이가 태어났다. 일을 어떻게 할지 정해야 했다.', options: { leave: '육아휴직', quit: '그만둔다', keep: '그대로 다닌다' } },
  'sys.job.career_break': '일을 그만두었다({reasonLabel}).',
  'sys.job.return': '{n}년 만에 다시 일을 시작했다.',
  'sys.job.honorary': { prompt: '희망퇴직 명단이 돌았다.', options: { accept: '받아들인다', stay: '버틴다' } },
  'sys.job.exit_main': '{years}년 다닌 일을 그만두었다({reasonLabel}).',
  'sys.job.after_main': { prompt: '이제 무엇을 할지 정해야 했다.', options: { work: '다시 일한다', rest: '쉰다', shop: '가게를 연다' } },
  'sys.job.platform': '배달 앱에 라이더로 등록했다.',
  'sys.job.ai_shift': '하던 일의 절반을 프로그램이 하기 시작했다.',
  'sys.job.retire': '일을 완전히 놓았다.',
  'sys.job.transition': '{title|으로} 일을 바꿨다({reason}).',
  // 돈
  'sys.money.first_pay': '첫 월급 {pay}만 원이 들어왔다.',
  'sys.money.independent': '이제 내 돈으로 살기 시작했다.',
  'sys.money.loan': '{kindLabel} {amount}만 원을 빌렸다.',
  'sys.money.paid_off': '{kindLabel|을} 다 갚았다.',
  'sys.money.drawdown': '수입으로 모자란 생활비와 이자 {amount}만 원을 모아 둔 현금에서 꺼내 썼다.',
  'sys.money.deficit': '2년째 버는 것보다 쓰는 게 많았다.',
  'sys.money.debt_relief': '개인회생을 신청했다.',
  'sys.money.inheritance': '부모님이 남긴 {amount}만 원을 나눠 받았다.',
  'sys.money.support_parents': '부모님께 매달 {amount}만 원을 보냈다.',
  'sys.money.severance': '퇴직금 {amount}만 원을 받았다.',
  'sys.money.fraud_loss': '모아 둔 돈 일부가 사라졌다.',
  // 주거
  'sys.home.family_move': '집이 이사를 했다({toLabel}).',
  'sys.home.independence': { prompt: '집을 나와 살지 정해야 했다.', options: { stay: '부모 집에 산다', room: '원룸 월세', jeonse: '전세 대출로' } },
  'sys.home.dorm': '기숙사에 짐을 풀었다.',
  'sys.home.move': '{toLabel|으로} 이사했다({reasonLabel}).',
  'sys.home.renew': { prompt: '계약 만기. 집주인이 {amount}만 원을 올려 달라고 했다.', options: { pay: '올려 준다', cheaper: '싼 곳으로', monthly: '월세로 돌린다' } },
  'sys.home.renewed': '같은 집에서 2년 더 살게 되었다.',
  'sys.home.buy': { prompt: '살 수 있을 것 같은 집이 나왔다.', options: { buy: '대출 끼고 산다', wait: '더 지켜본다' } },
  'sys.home.bought': '{regionLabel}에 집을 샀다. 대출 {loan}만 원.',
  'sys.home.value_jump': '보유 주택의 추정 가격이 {dir}.',
  'sys.home.jeonse_fraud': '보증금을 돌려받지 못하게 되었다.',
  'sys.home.public_rental': '공공임대주택에 당첨되었다.',
  'sys.home.substandard': '창문이 반쯤 땅에 걸친 방이었다.',
  'sys.home.region_move': '{regionLabel|으로} 옮겨 왔다.',
  'sys.home.return_parents': '다시 부모님 집으로 들어갔다.',
  'sys.home.sell': '집을 팔았다.',
  'sys.home.facility': '요양시설로 거처를 옮겼다.',
  // 가족
  'sys.fam.sibling_born': '동생이 태어났다.',
  'sys.fam.parents_divorce': '부모님이 따로 살게 되었다.',
  'sys.fam.grandparent_death': '{gpLabel|이} 돌아가셨다.',
  'sys.fam.parent_funeral': '{parentLabel} 장례를 치렀다. 빈소에서 가족들과 마지막 인사를 나눴다.',
  'sys.fam.parent_death': '{parentLabel|이} 돌아가셨다. {pAge}세.',
  'sys.fam.young_carer': '{place} 끝나면 {who|을} 돌보는 게 일과가 되었다.',
  'sys.fam.dating': '자주 만나는 사람이 생겼다.',
  'sys.fam.breakup': '그 사람과 헤어졌다.',
  'sys.fam.marry': { prompt: '{partnerAge}세 {partnerJobGroup|과} 결혼 이야기가 나왔다.', options: { marry: '결혼한다', later: '조금 더 있다가', single: '혼자 살기로' } },
  'sys.fam.wedding': '결혼했다.',
  'sys.fam.child': { prompt: '아이 이야기를 꺼냈다.', options: { have: '낳기로 한다', wait: '조금 미룬다', none: '낳지 않기로' } },
  'sys.fam.child_born': '{childSexLabel|이} 태어났다.',
  'sys.fam.child_death': '{childLabel|을} 먼저 떠나보냈다.',
  'sys.fam.child_school': '{childLabel|이} {schoolLabel}에 들어갔다.',
  'sys.fam.child_leave': '{childLabel|이} 집을 나갔다.',
  'sys.fam.child_marry': '{childLabel|이} 결혼했다.',
  'sys.fam.grandchild': '손주가 생겼다.',
  'sys.fam.divorce': { prompt: '결혼 생활이 오래 삐걱거렸다.', options: { divorce: '이혼한다', counsel: '상담을 받아 본다', stay: '그냥 산다' } },
  'sys.fam.divorced': '이혼했다.',
  'sys.fam.remarry': '다시 결혼했다.',
  'sys.fam.widowed': '배우자가 세상을 떠났다.',
  'sys.fam.parent_care': { prompt: '{parentLabel|을} 누가 돌볼지 정해야 했다.', options: { home: '{parentLabel|을} 모신다', facility: '{parentLabel} 요양시설', share: '형제와 나눈다' } },
  'sys.fam.care_end': '{who}{because} 돌봄이 종료됐다.',
  'sys.fam.living_alone': '집에 혼자 남았다.',
  // 건강
  'sys.health.lbw': '작게 태어나 한동안 병원을 오갔다.',
  'sys.health.disability': '{disabilityLabel} 진단을 받았다. 치료실 대기는 {n}개월이었다.',
  'sys.health.smoke_start': '담배를 피우기 시작했다.',
  'sys.health.quit': '담배를 끊었다.',
  'sys.health.dx_chronic': '{condLabel} 진단. 약을 먹기 시작했다.',
  'sys.health.dx_cancer': '{cancerLabel} 진단을 받았다.',
  'sys.health.cancer_free': '5년이 지났다. 정기 검진만 남았다.',
  'sys.health.dx_cardio': '{condLabel|으로} 응급실에 실려 갔다.',
  'sys.health.dx_dementia': '치매 진단을 받았다.',
  'sys.health.depression': '마음이 오래 무거웠다. 진료를 받기 시작했다.',
  'sys.health.recover': '{condLabel|이} 나아졌다.',
  'sys.health.injury': '일하다 다쳤다. 석 달을 쉬었다.',
  'sys.health.unmet': '병원비와 거리 때문에 진료를 미뤘다.',
  'sys.health.cost': '병원비가 {amount}만 원 나왔다.',
  // 노년
  'sys.age.pension_start': '국민연금이 매달 {amount}만 원씩 나오기 시작했다.',
  'sys.age.no_pension': '받을 국민연금이 없었다.',
  'sys.age.basic_pension': '기초연금 {amount}만 원이 들어왔다.',
  'sys.age.senior_job': '동네 공익활동 일자리를 얻었다. 한 달 29만 원.',
  'sys.age.grandcare': { prompt: '자식이 손주를 봐 줄 수 있느냐고 물었다.', options: { yes: '맡아 준다', some: '주 2~3일만', no: '어렵다고 한다' } },
  'sys.age.ltc': '장기요양 {grade}등급을 받았다.',
  'sys.age.residence': { prompt: '앞으로 어디서 지낼지 정해야 했다.', options: { home: '집에서 방문요양', facility: '요양시설', child: '자녀 집으로' } },
  'sys.age.spouse_care': '배우자를 돌보는 게 하루의 대부분이 되었다.',
  'sys.age.isolated': '며칠 동안 아무와도 말하지 않았다.',
  'sys.age.digital': '주민센터 대신 앱으로 하라고 했다.',
  // 시스템 선택 결과 한 줄(키 = 선택 id + '.' + 옵션 id)
  'sys.edu.tutoring.more': '학원을 하나 더 늘렸다.',
  'sys.edu.tutoring.keep': '하던 대로 학원을 다녔다.',
  'sys.edu.tutoring.less': '학원을 줄이고 저녁 시간이 생겼다.',
  'sys.edu.high_type.general': '일반고에 원서를 냈다.',
  'sys.edu.high_type.voc': '특성화고에 원서를 냈다.',
  'sys.edu.high_type.special': '특목·자사고 시험을 준비했다.',
  'sys.edu.path.college': '대학에 가기로 했다.',
  'sys.edu.path.work': '바로 일을 찾기로 했다.',
  'sys.edu.path.retake': '한 해 더 준비하기로 했다.',
  'sys.job.first_offer.take': '제안을 받아들였다.',
  'sys.job.first_offer.wait': '조금 더 준비하기로 했다.',
  'sys.job.first_offer.exam': '공무원 시험 준비를 시작했다.',
  'sys.job.offer.move': '회사를 옮기기로 했다.',
  'sys.job.offer.stay': '다니던 곳에 남았다.',
  'sys.job.business.open': '가게를 열기로 했다.',
  'sys.job.business.job': '다시 일자리를 찾기로 했다.',
  'sys.job.childcare.leave': '육아휴직을 냈다.',
  'sys.job.childcare.quit': '일을 그만두고 아이를 보기로 했다.',
  'sys.job.childcare.keep': '일을 계속하며 아이를 키웠다.',
  'sys.job.honorary.accept': '희망퇴직을 받아들였다.',
  'sys.job.honorary.stay': '버티기로 했다.',
  'sys.job.after_main.work': '다시 일을 찾기로 했다.',
  'sys.job.after_main.rest': '쉬기로 했다.',
  'sys.job.after_main.shop': '작은 가게를 열기로 했다.',
  'sys.home.independence.stay': '부모님 집에 더 머물기로 했다.',
  'sys.home.independence.room': '원룸을 얻어 나왔다.',
  'sys.home.independence.jeonse': '전세 대출을 받아 집을 나왔다.',
  'sys.home.renew.pay': '보증금을 올려 주기로 했다.',
  'sys.home.renew.cheaper': '더 싼 집을 찾아 나섰다.',
  'sys.home.renew.monthly': '보증금 일부를 월세로 돌렸다.',
  'sys.home.buy.buy': '대출을 끼고 집을 사기로 했다.',
  'sys.home.buy.wait': '조금 더 지켜보기로 했다.',
  'sys.fam.marry.marry': '결혼하기로 했다.',
  'sys.fam.marry.later': '조금 더 있다가 하기로 했다.',
  'sys.fam.marry.single': '혼자 살기로 했다.',
  'sys.fam.child.have': '아이를 낳기로 했다.',
  'sys.fam.child.wait': '조금 미루기로 했다.',
  'sys.fam.child.none': '아이를 낳지 않기로 했다.',
  'sys.fam.divorce.divorce': '헤어지기로 했다.',
  'sys.fam.divorce.counsel': '부부 상담을 받아 보기로 했다.',
  'sys.fam.divorce.stay': '그냥 살기로 했다.',
  'sys.fam.parent_care.home': '{parentLabel|을} 직접 모시기로 했다.',
  'sys.fam.parent_care.facility': '{parentLabel} 요양시설을 알아봤다.',
  'sys.fam.parent_care.share': '형제들과 {parentLabel} 돌봄을 나누기로 했다.',
  'sys.age.grandcare.yes': '손주를 맡아 주기로 했다.',
  'sys.age.grandcare.some': '일주일에 며칠만 봐 주기로 했다.',
  'sys.age.grandcare.no': '어렵다고 말했다.',
  'sys.age.residence.home': '집에서 방문요양을 받기로 했다.',
  'sys.age.residence.facility': '요양시설에 들어가기로 했다.',
  'sys.age.residence.child': '자녀 집으로 옮기기로 했다.',
  // 사망·시계·선택 투명성(콘텐츠 D 키)
  'sys.death.line': '{name|은} {year}년, {age}세에 세상을 떠났다.',
  'sys.horizon.line': '{year}년. 이야기는 여기서 멈춘다. {name|은} {age}세로 계속 살아간다.',
  'sys.death.infant': '{name|은} {ageText}에 세상을 떠났다.',
  'sys.death.help_intro': '이야기가 무겁게 느껴진다면, 지금 연락할 수 있는 곳이 있습니다.',
  'sys.clock.cap': '시간이 다 되어 기본 행동으로 마칩니다.',
  'sys.auto.line': '선택 {n}번 중 {m}번은 기본 행동으로 넘어갔습니다.',
  // 비교 카드(GDD §11.2, ARCHITECTURE §18.5)
  'cmp.stat.7': '{year}년에 태어난 아이 약 {x}만 명이 함께 입학했다.',
  'cmp.stat.19': '그해 고교 졸업자 진학률 {x}%',
  'cmp.stat.29': '20대 임금근로자 비정규 비율 {x}%',
  'cmp.stat.42': '40대 가구 자가 비율 {x}%',
  'cmp.stat.55': '주된 일자리 퇴직 평균 {x}세',
  'cmp.stat.70': '65세 이상 연금 수령률 {x}%',
  'cmp.stat.none': '{year}년, 같은 날 태어난 사람들.',
  'cmp.7.care_young': '{name|은} 학교가 끝나면 집안 돌봄을 거든다.',
  'cmp.7.moved': '{name|은} 이사를 하고 새 학교에 들어갔다.',
  'cmp.7.sibling': '{name|은} 동생 손을 잡고 학교에 간다.',
  'cmp.7.school_enter': '{name|은} {region}에서 초등학교에 입학했다.',
  'cmp.7.default': '{name|은} {region}에서 일곱 살이 되었다.',
  'cmp.19.retake': '{name|은} 한 번 더 시험을 준비한다.',
  'cmp.19.college_capital': '{name|은} 수도권에서 대학 생활을 시작했다.',
  'cmp.19.college_region': '{name|은} {region}에서 대학에 다닌다.',
  'cmp.19.work': '{name|은} {workPlace} 첫 월급을 받았다.',
  'cmp.19.military': '{name|은} 군복무 중이다.',
  'cmp.19.dropout_work': '{name|은} 학교를 그만두고 일을 한다.',
  'cmp.19.default': '{name|은} 일자리를 알아보고 있다.',
  'cmp.29.jobseeking': '{name|은} 아직 일자리를 찾고 있다.',
  'cmp.29.nonregular': '{name|은} 계약직으로 일한다.',
  'cmp.29.regular': '{name|은} {workPlace} 일한다.',
  'cmp.29.self': '{name|은} 작은 가게를 꾸린다.',
  'cmp.29.default': '{name|은} 집안일을 맡고 있다.',
  'cmp.29.home_parents': '부모님 집에 산다.',
  'cmp.29.home_monthly': '월세 방에 산다.',
  'cmp.29.home_jeonse': '전셋집에 산다.',
  'cmp.29.home_own': '자기 집에 산다.',
  'cmp.29.married': '결혼했다.',
  'cmp.29.dating': '만나는 사람이 있다.',
  'cmp.29.single': '혼자 지낸다.',
  'cmp.42.caring_parent': '{name|은} 부모님 병간호를 하고 있다.',
  'cmp.42.raising_kids': '{name|은} 아이 {kids}명을 키우고 있다.',
  'cmp.42.moved': '{name|은} 또 이삿짐을 쌌다.',
  'cmp.42.job_change': '{name|은} 일터를 옮겼다.',
  'cmp.42.job_loss': '{name|은} 일자리를 잃고 다시 찾는 중이다.',
  'cmp.42.self': '{name|은} 가게 문을 열고 닫는다.',
  'cmp.42.diagnosis': '{name|은} 병원을 오가며 치료를 받고 있다.',
  'cmp.42.default': '{name|은} {workPlace} 하루를 보낸다.',
  'cmp.55.retired_main': '{name|은} {years}년 다닌 일을 그만두었다.',
  'cmp.55.still_working': '{name|은} 여전히 출근한다.',
  'cmp.55.caring_parent': '{name|은} 부모님 병간호를 하고 있다.',
  'cmp.55.kids_left': '{name|은} 자녀를 독립시켰다.',
  'cmp.55.diagnosis': '{name|은} 정기적으로 병원에 간다.',
  'cmp.55.default': '{name|은} 다음 일을 고민하고 있다.',
  'cmp.70.pension_work': '{name|은} 연금을 받으면서도 일을 한다.',
  'cmp.70.pension': '{name|은} 연금으로 생활한다.',
  'cmp.70.at_home': '집에서 지낸다.',
  'cmp.70.with_kids': '자녀 집에서 지낸다.',
  'cmp.70.facility': '요양시설에서 지낸다.',
  'cmp.70.widowed': '배우자를 먼저 보냈다.',
  'cmp.70.alone': '혼자 산다.',
  'cmp.70.caring': '배우자를 돌보고 있다.',
  'cmp.70.default': '{name|은} 하루하루를 보낸다.',
  'cmp.dead': '{name|은} {year}년에 세상을 떠났다.',
  'cmp.dead.young': '{name|은} 첫 몇 해를 함께하지 못했다.',
  // 결산(GDD §12)
  'end.econ': '성인기 {n}년 중 적자였던 해 {k}년',
  'end.econ.paid': '빚을 다 갚은 해: {year}년',
  'end.health': '진단 {n}번, 그중 {m}번은 회복했다',
  'end.relations': '함께 산 가족 {n}명 · 혼자 산 기간 {y}년',
  'end.autonomy': '원치 않은 이사 {a}번, 계약 만료 {b}번',
  'end.careBurden': '부모 간병 {a}년 · 아이 키운 해 {b}년',
  'end.transparency': '선택 {n}번 중 {m}번은 기본 행동으로 넘어갔습니다.',
  'end.young': '어른이 되기 전에 끝난 삶이라 성인기 기록이 없다',
  'end.cap': '시간이 다 되어 남은 해는 기본 행동으로 지나갔습니다.',
  'end.horizon': '{year}년, 이야기는 여기서 멈춥니다. {name|은} {age}세로 계속 살아갑니다.',
  'end.death': '{name|은} {year}년, {age}세에 세상을 떠났습니다.',
  'end.death.young': '{name|은} {ageText}에 세상을 떠났습니다.',
  'end.hook': '이 아이는 무엇을 감당하게 될까요?',
};

// 판정문 기본값(VERDICTS 계열이 비었을 때). 승패·재산·학벌 어휘 없음.
export const DEFAULT_VERDICT = {
  housing: '노력은 했습니다. 그러나 전세 만료일도 노력했습니다.',
  job: '열심히 일했습니다. 계약서도 열심히 끝났습니다.',
  edu: '배움은 공평했습니다. 학원비는 아니었습니다.',
  care: '남을 돌보느라 자기 차례는 늘 다음 달이었습니다.',
  medical: '아픈 건 몸이었고, 계산은 통장이 했습니다.',
  fairness: '줄은 섰습니다. 줄이 자꾸 옮겨졌을 뿐입니다.',
  region: '고향은 남았습니다. 고향에 남은 것이 줄었습니다.',
  tech: '일을 배웠습니다. 일이 먼저 바뀌었습니다.',
  conflict: '뉴스가 시끄러운 해에도 출근은 했습니다.',
  living: '월급은 올랐습니다. 장바구니가 먼저 알았습니다.',
  quiet: '큰일 없이 지나간 해가 많았습니다. 그것도 일이었습니다.',
  early: '짧았습니다. 그 안에 있던 날들은 짧지 않았습니다.',
  young: '{name|은} {n}번의 봄을 보았습니다.',
  neutral: '{name|은} {year}년에 세상을 떠났습니다. 남은 사람들이 그 이름을 기억합니다.',
};
