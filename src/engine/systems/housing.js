import { syncMortgages } from '../loan-schedules.js';
// 주거(GDD §5.5). home = { tenure, region, regionGroup, parents, moves, rentBurden, owned, value, deposit, rent, contractEnd }
// 이동은 사유가 있어야 일어난다(docs/impl/residence-notes.md): 계약 만기·독립·결혼·출산·학령기·취업·부모 돌봄·은퇴·실직·집값.
// 시도가 바뀌는 이동은 L.home.moves[].reason·from·region에 사유가 남는다. 자가를 두고 떠나면 L.rentals에 세 준 집으로 남는다.
import { SGG, bias } from '../sigungu.js';
import { T, D, yr, ag, isCapital, REGION, houseYoy, regionGroup } from '../tables.js';
import { refreshDebt, indep, becomeIndependent, homePrice, canOwn, TENURE_LABEL, pickTarget, priceAt, jeonseAt, rentAt, leaseIncome, tierOfL, parentHelp, capJeonse } from '../act.js';
import { econ } from '../stats.js';
import { won, wonAt, josa } from '../text.js';
import { HOUSING_CAL } from '../tuning.js';
import { housingPlans, asOptions, settleMove, moveMath, moveCostFor, jeonseLoanRate } from '../plans.js';

const RENTER = new Set(['jeonse', 'monthly', 'public']);
const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
const rnd = Math.round;
// 최근 2년 안에 이사했으면 자발적 이사 확률을 크게 낮춘다(자가는 더)
const recent = L => { const m = L.home.moves, last = m[m.length - 1]; return last && L.year - last.year <= 2 ? T('MOVE_RATE')[L.home.owned ? 'recentOwn' : 'recent'] : 1; };
const lastMove = L => L.home.moves[L.home.moves.length - 1];
const sinceMove = L => L.year - (lastMove(L)?.year ?? L.flags.indep ?? L.year);
const startedJob = L => (L.job.status === 'employed' || L.job.status === 'self') && L.job.history[L.job.history.length - 1]?.from === L.year;
const short = k => REGION[k]?.label ?? k;
const toward = k => `${short(k)}${josa(short(k), '으로')}`;

// ── 시도 이동 목적지(직업의 지역 분포·인구 분포, 추정) ──
const OFFICE = new Set(['1', '2', '3']), FACTORY = new Set(['7', '8']);
const CAPITAL_JOB = { seoul: 4, gyeonggi: 4, incheon: 1 };                                          // 사무·전문·관리직: 수도권 집중
const METRO_JOB = { busan: 2, daegu: 1.5, daejeon: 1.5, gwangju: 1 };                                // 그다음 광역시
const INDUSTRIAL = { ulsan: 3, gyeongnam: 3, gyeongbuk: 2, chungnam: 2, gyeonggi: 2, chungbuk: 1 };   // 제조업 산업단지
const INNOVATION = { jeonbuk: 1, jeonnam: 1.5, gyeongnam: 1, gyeongbuk: 1, chungbuk: 1, gangwon: 1, ulsan: 1, daegu: 1, busan: 1, jeju: 0.5 };   // 공공기관 지방 이전(혁신도시 2013~2019)
const POP = { seoul: 19, gyeonggi: 26, incheon: 6, busan: 7, daegu: 5, gwangju: 3, daejeon: 3, ulsan: 2, gangwon: 3, chungbuk: 3, chungnam: 4, jeonbuk: 3.5, jeonnam: 3.5, gyeongbuk: 5, gyeongnam: 6.5, jeju: 1.3, sejong: 0.7 };
const OUTER = { gyeonggi: 4, incheon: 1 };                                                           // 서울 집값에 밀려 가는 외곽
function pickRegion(ctx, w, y, not) {
  const ok = Object.entries(w).filter(([k]) => k !== not && (REGION[k]?.since ?? 0) <= y);
  return ok.length ? ctx.weighted(ok) : null;
}
// 새 일자리의 지역: 직업군·공공 여부에 따라
function jobDest(L, ctx) {
  const j = L.job, y = L.year, h = L.home, m = String(j.major);
  if (j.public && y >= 2013 && y <= 2019 && isCapital(h.region)) return ctx.chance(0.3) ? pickRegion(ctx, INNOVATION, y) : null;
  if (OFFICE.has(m) && !isCapital(h.region)) return ctx.chance(0.4) ? pickRegion(ctx, ctx.chance(0.75) ? CAPITAL_JOB : METRO_JOB, y, h.region) : null;
  if (FACTORY.has(m)) return ctx.chance(0.12) ? pickRegion(ctx, INDUSTRIAL, y, h.region) : null;
  return null;
}
// 인과 문장(로그·선택 프롬프트)
const CAUSE = {
  취업: '새 일자리를 따라', '일자리 찾아': '일자리를 찾아', '기관 이전': '다니던 기관이 지방으로 옮겨 가', 결혼: '배우자와 살림을 합치려고',
  '부모 돌봄': '홀로 남은 부모님을 돌보려고', '내 집 마련': '집값이 닿는 곳에 내 집을 마련하려고', '은퇴 귀향': '일을 놓고 고향 가까이 살려고', '실직 후 이주': '일을 잃고 생활비를 줄이려고', 집값: '오르는 집값을 감당하기 어려워',
};

function leaveHome(L, ctx, tenure, reason, region) {
  becomeIndependent(L, ctx);
  ctx.act.move(tenure, { reason, silent: true, region });
  if (region) ctx.sys('sys.home.region_cause', { cause: CAUSE[reason] ?? '', regionLabel: short(region) });
  if (tenure === 'monthly' && isCapital(L.home.region) && (L.cache?.INCpos ?? 50) < 30 && ctx.chance(0.25)) {
    L.flags.substandard = L.year;
    ctx.sys('sys.home.substandard');
  }
}

// ── 이사 계획: 목적지(시군구·점유 형태)를 미리 골라 cost와 정산이 같은 숫자를 쓴다 ──
// o: tenure, region, keep('sell'|'lease'|'vacant'), size, strict, minTier, edu, only(시군구 id)
function planTo(L, ctx, id, label, { tenure, region = L.home.region, keep = 'sell', size = 0.8, ...o }) {
  const h = L.home, y = L.year;
  const t = pickTarget(L, ctx, tenure, region, size, { ...o, keepHome: h.owned && keep !== 'sell' });
  if (!t) return null;
  const r = SGG.get(t.place.sigungu), tier = r?.housingTier ?? 3;
  const price = t.tenure === 'own' ? rnd(priceAt(tier, y, r?.id) * size) : 0;
  const rr = t.tenure === 'monthly' ? rentAt(tier, y, t.cheap, r?.id) : null;
  const dep = t.tenure === 'jeonse' ? rnd(jeonseAt(tier, y, r?.id, regionGroup(region)) * 0.55) : rr ? rr.deposit : 0;
  const rent = rr ? rr.rent : 0, lease = h.owned && keep === 'lease' ? leaseIncome(h.sigungu, y, h.value) : 0;
  const moveCost = moveCostFor(L, dep || price);
  const cost = moveMath(L, { tenure: t.tenure, dep, price, rent, moveCost, keep, lease });
  const note = [`${TENURE_LABEL[t.tenure]} · ${r?.name ?? ''}`, price && `집값 ${wonAt(price, y)}만 원`, dep && `보증금 ${wonAt(dep, y)}만 원`, rent && `월세 ${wonAt(rent, y)}만 원`, lease && `세 준 집 임대수익 연 ${wonAt(lease, y)}만 원`].filter(Boolean).join(' · ');   // 그해 명목 금액
  return { id, label, tenure: t.tenure, region, to: t.place, dep, rent, price, keep, moveCost, cost: { ...cost, note } };
}
// 계획 실행: 남겨 둘 집을 먼저 빼고 → 이사(같은 숫자) → 이사비
function carry(L, ctx, p, reason) {
  if (p.keep !== 'sell' && L.home.owned) ctx.act.keepHome(p.keep);
  const from = L.home.region;
  ctx.act.move(p.tenure, { reason, region: p.region, to: p.to, dep: p.dep, rent: p.rent, price: p.price || undefined, silent: true });
  ctx.act.spend(p.moveCost);
  if (L.home.region !== from) ctx.sys('sys.home.region_cause', { cause: CAUSE[reason] ?? '', regionLabel: short(L.home.region) });
}
// 떠나는 계획들: 세입자는 한 가지, 자가는 팔기 / 세 주기 / 비워 두기
function goPlans(L, ctx, pre, where, region, o = {}) {
  const h = L.home, ten = h.tenure === 'jeonse' ? 'jeonse' : 'monthly';
  if (!h.owned) return [planTo(L, ctx, pre, `${where} 옮긴다`, { tenure: ten, region, ...o })].filter(Boolean);
  return [
    planTo(L, ctx, pre + '_sell', `집을 팔고 ${where} 옮긴다`, { tenure: 'own', region, ...o }),
    planTo(L, ctx, pre + '_lease', `집은 세 주고 ${where} 옮긴다`, { tenure: 'jeonse', region, keep: 'lease', ...o }),
    planTo(L, ctx, pre + '_keep', `집은 비워 두고 ${where} 옮긴다`, { tenure: 'jeonse', region, keep: 'vacant', ...o }),
  ].filter(Boolean);
}
const STAY = (id, label, note, monthly = 0) => ({ id, label, cost: { cash: 0, loan: 0, monthly, note } });

// 시도 이동 선택(취업·결혼·실직·은퇴 공통)
function askRelocate(L, ctx, reason, region, o = {}, stayNote = '') {
  const plans = [...goPlans(L, ctx, 'go', toward(region), region, o), STAY('stay', '지금 사는 곳에 남는다', stayNote)];
  if (plans.length < 2) return false;
  L.flags.relocateAsk = L.year;
  const def = plans.find(p => p.id === (['은퇴 귀향', '실직 후 이주'].includes(reason) ? 'go_sell' : 'go_lease')) ?? plans[0];   // 일·가족 때문에 떠나는 자가는 세를 주고, 노후·실직은 판다
  return ctx.ask({ eventId: 'sys.home.relocate', options: asOptions(plans), defaultId: def.id, data: { plans, reason }, vars: { cause: CAUSE[reason], regionLabel: short(region) } });
}

// 상향 이동: 생애 사건·장기 임차 + 다음 단계 문턱(전세 보증금·매수 계약금+대출 한도)을 넘을 때
function upgradeWhy(L) {
  const y = L.year, fl = L.flags, h = L.home;
  const school = L.family.children.some(c => c.alive && [7, 13].includes(y - c.birthYear));
  const ev = fl.marryYear >= y - 1 ? '결혼' : fl.childYear >= y - 1 ? '출산' : school ? '자녀 입학' : startedJob(L) ? '일자리 변화' : fl.renewYear === y ? '계약 만기' : null;
  const n = fl.rentSince != null ? y - fl.rentSince : 0;
  return { ev, school, n, long: RENTER.has(h.tenure) && n >= 8 };
}
const UP_WHY = { 결혼: '결혼으로 살림을 합쳤다.', 출산: '아이가 태어나 방이 좁아졌다.', '자녀 입학': '아이가 학교에 들어갈 나이가 되었다.', '일자리 변화': '일자리가 바뀌었다.', '계약 만기': '계약 만기가 돌아왔다.' };
function tryUpgrade(L, ctx) {
  const h = L.home, a = L.age, w = upgradeWhy(L);
  if (a < 26 || a > 70 || sinceMove(L) < 2 || h.tenure === 'facility' || L.flags.renewYear === L.year) return false;   // 같은 해 재계약 직후엔 옮기지 않는다(B-09)
  const renter = RENTER.has(h.tenure);
  const ownEv = h.owned && tierOfL(L) < 4 && (['결혼', '출산', '자녀 입학'].includes(w.ev) || sinceMove(L) >= 10);   // 자가: 가족 사건 또는 10년+ 거주 뒤 상급지 갈아타기
  if (!renter && !ownEv) return false;
  if (!((w.ev && ctx.chance(renter ? 0.5 : 0.25)) || (w.long && ctx.chance(0.35)) || (!renter && ctx.chance(0.1)))) return false;
  const cur = tierOfL(L), edu = w.school;
  const plans = (renter ? [
    planTo(L, ctx, 'own', '대출을 끼고 집을 산다', { tenure: 'own', strict: true, edu })
      ?? (h.region === 'seoul' ? planTo(L, ctx, 'own', '서울을 떠나 경기·인천에 집을 산다', { tenure: 'own', strict: true, region: pickRegion(ctx, OUTER, L.year) }) : null),
    h.tenure !== 'jeonse' && planTo(L, ctx, 'jeonse', '보증금을 모아 전세로 옮긴다', { tenure: 'jeonse', strict: true, edu }),
    planTo(L, ctx, 'better', '같은 점유 형태로 더 나은 동네에 간다', { tenure: h.tenure === 'jeonse' ? 'jeonse' : 'monthly', strict: true, minTier: cur + 1, edu }),
  ] : [planTo(L, ctx, 'better', '집을 팔고 상급지로 갈아탄다', { tenure: 'own', strict: true, minTier: cur + 1, edu })]).filter(Boolean);
  if (!plans.length) return false;
  plans.push(STAY('stay', '지금 집에 그대로 산다', '이사비와 새 대출 없이 지금대로 산다'));
  const why = w.ev ? UP_WHY[w.ev] : `세 들어 산 지 ${w.n}년째다.`;
  return ctx.ask({ eventId: 'sys.home.upgrade', options: asOptions(plans), defaultId: plans[0].id, data: { plans, reason: w.ev ?? '장기 임차' }, vars: { why } });
}

// 부모 돌봄 귀향: 고향(출생 시도)에 부모 한 분만 남았거나 모두 돌봄이 필요할 때
function careParent(L) {
  const p = L.family.parents, alive = ['father', 'mother'].filter(k => p[k].alive), needy = alive.find(k => p[k].care);
  return needy && (alive.length === 1 || alive.every(k => p[k].care)) ? needy : null;
}
function tryHometown(L, ctx) {
  const h = L.home, b = L.birth, fl = L.flags, who = careParent(L);
  if (!who || h.region === b.region || fl.careShare || L.age < 28 || L.age > 72 || fl.hometownAsk > L.year - 8 || !ctx.chance(0.5)) return false;
  fl.hometownAsk = L.year;
  const eraI = yr(T('ERA_INCOME_INDEX'), L.year), careCost = rnd(1950 * eraI);
  const plans = [
    ...goPlans(L, ctx, 'near', `고향 ${SGG.get(b.sigungu)?.name ?? short(b.region)}${josa(SGG.get(b.sigungu)?.name ?? short(b.region), '으로')}`, b.region, { only: b.sigungu }),
    STAY('bring', '부모님을 지금 집으로 모셔 온다', '방 하나와 돌봄 시간이 더 든다'),
    STAY('facility', '고향 가까운 요양시설에 모신다', '시설 비용이 매달 나간다', rnd(careCost / 12)),
  ];
  const WHO = { father: '아버지', mother: '어머니' };
  return ctx.ask({ eventId: 'sys.home.hometown', options: asOptions(plans), defaultId: (plans.find(p => p.id === 'near_lease') ?? plans[0]).id, data: { plans, who, careCost }, vars: { parentLabel: WHO[who] }, careTarget: WHO[who] });
}

// 세 준 집(kind 'home', 이사로 남겨 둔 집): 임대료를 지역 시세로 갱신, 몇 해 뒤 되팔기·돌아가 살기. 집값 변동·공실·세금은 money.js
function rentals(L, ctx) {
  const h = L.home, y = L.year;
  for (const r of L.rentals || []) if (r.kind === 'home' && !r.sub && !r.empty) r.rent = leaseIncome(r.sigungu, y, r.value);
  if (L.pending || L.yr.asked) return false;
  const r = (L.rentals || []).find(x => x.kind === 'home' && !x.sub && y - x.since >= 3);
  if (!r) return false;
  const back = h.region === r.region && RENTER.has(h.tenure) && !h.owned;
  if (!ctx.chance(back ? 0.4 : L.age >= 70 ? 0.15 : 0.08)) return false;
  syncMortgages(L);
  const m = L.money, proceeds = rnd(r.value * 0.97), repay = Math.min(r.mortgageBalance || 0, proceeds), rate = jeonseLoanRate(y);
  const plans = [];
  if (back) {
    const mc = moveCostFor(L, 0);
    plans.push({ id: 'back', label: '내 집으로 돌아가 산다', home: r, moveCost: mc, cost: { ...((c) => ({ ...c, monthly: c.monthly + rnd(r.rent / 12) }))(moveMath(L, { tenure: 'own', home: r, moveCost: mc })), note: '월세·보증금 대신 내 집에 산다. 임대수익은 끊긴다' } });
  }
  plans.push({ id: 'sell', label: '세 준 집을 판다', proceeds, repay, cost: { cash: proceeds - repay, loan: -repay, monthly: rnd((r.rent - repay * (rate + 1 / 30)) / 12), note: '집값에서 중개비·세금 3%를 뺀 돈으로 대출부터 갚는다' } });
  if (r.empty) plans.push({ id: 'lease', label: '비워 둔 집에 세를 놓는다', cost: { cash: 0, loan: 0, monthly: -rnd(leaseIncome(r.sigungu, y, r.value) / 12), note: '공실·세금을 뺀 임대수익이 들어온다' } });
  plans.push(STAY('keep', '그대로 둔다', r.empty ? '비워 둔 채 집값만 지켜본다' : '임대수익을 계속 받는다'));
  const def = back ? 'back' : L.age >= 70 ? 'sell' : 'keep';
  return ctx.ask({ eventId: 'sys.home.rental', options: asOptions(plans), defaultId: def, data: { plans, at: L.rentals.indexOf(r) }, vars: { regionLabel: short(r.region) } });
}

export function step(L, ctx) {
  const h = L.home, a = L.age, y = L.year, fl = L.flags;
  if (fl.substandard && h.moves.length && h.moves[h.moves.length - 1].year > fl.substandard) fl.substandard = null;

  // 부모 집에 사는 동안: 가구 이사, 독립 판정
  if (h.parents) {
    fl.rentSince = null;
    const renter = RENTER.has(h.tenure) || h.tenure === 'family';
    if (ctx.chance((renter ? T('MOVE_RATE').familyRenter : T('MOVE_RATE').familyOwn) * recent(L)) && (a < 19 || ctx.chance(0.5))) {
      if (renter && ctx.chance(0.12)) h.tenure = 'own';
      const to = ctx.chance(0.1) ? pickRegion(ctx, POP, y, h.region) : null;   // 부모의 직장 때문에 시도를 옮기는 가구 이사
      if (to) ctx.act.moveRegion(to, { silent: true, reason: '부모 직장' });
      else { h.moves.push({ year: y, to: h.tenure, reason: '가구 이사' }); L.tally.moves = (L.tally.moves || 0) + 1; }
      fl.familyMove = y;
      ctx.sys('sys.home.family_move', { toLabel: TENURE_LABEL[h.tenure] });
    }
    // 결혼한 뒤 부모 집에 들어갔거나 부모님이 모두 돌아가셨으면 그 집에 계속 '얹혀' 살지 않는다: 2년쯤 지나 따로 나간다
    const par = L.family.parents, orphan = !par.father.alive && !par.mother.alive;
    if (a >= 19 && L.job.status !== 'military' && ((indep(L) && L.family.married && sinceMove(L) >= 2) || (orphan && ctx.chance(0.5)))) return leaveHome(L, ctx, L.family.married ? 'jeonse' : 'monthly', orphan ? '부모님 별세' : '분가');
    if (a >= 19 && !L.family.married && L.job.status !== 'military' && L.mil?.status !== 'serving') {   // 복무 중에는 독립을 묻지 않는다
      // 다른 지역의 일자리를 잡으면 그곳으로 나간다(청년 수도권행의 주된 경로)
      if (startedJob(L)) { const to = jobDest(L, ctx); if (to && to !== h.region) return leaveHome(L, ctx, 'monthly', '취업', to); }
      if (a <= 34 && ctx.chance(0.08)) return ctx.ask({ eventId: 'sys.home.independence', options: ['stay', 'room', 'jeonse'], defaultId: 'stay' });
      if (a >= 35 && ctx.chance(0.05)) return leaveHome(L, ctx, 'monthly', '독립');
    }
    return;
  }
  // 기숙사: 학업이 끝나면 원룸으로
  if (h.tenure === 'dorm') {
    if (L.edu.stage === 'done' && L.mil.status !== 'serving') leaveHome(L, ctx, 'monthly', '졸업');
    return;
  }
  if (!indep(L) || h.tenure === 'facility') return;
  if (RENTER.has(h.tenure)) fl.rentSince ??= y; else fl.rentSince = null;

  // 임차 계약 만기(2년)
  if (RENTER.has(h.tenure) && h.contractEnd != null && y >= h.contractEnd) {
    // 35세+ 임차인은 같은 집에 오래 머문다(거주기간 R05: 임차 3.6년 평균, 중장년 더 길다)
    const stable = a >= 55 ? 0.3 : a >= 35 ? 0.5 : 1;
    if (ctx.chance(1 - (1 - yr(T('RENEWAL'), y)) * stable)) {
      const rise = Math.max(0, (1 + houseYoy(h.regionGroup, y)) * (1 + houseYoy(h.regionGroup, y - 1)) - 1) + 0.02;
      h.contractEnd = y + 2; fl.renewYear = y;
      if (h.tenure === 'jeonse' && h.deposit * rise >= 300) {
        const amount = Math.round(h.deposit * rise / 100) * 100;
        return ctx.ask({ eventId: 'sys.home.renew', options: ['pay', 'cheaper', 'monthly'], defaultId: L.money.assets >= amount ? 'pay' : 'cheaper', data: { amount }, vars: { amount } });
      }
      if (h.tenure === 'monthly') h.rent = Math.round(h.rent * (1 + rise));
      ctx.sys('sys.home.renewed', {}, { quiet: true });
    } else {
      L.tally.invol = (L.tally.invol || 0) + 1;
      if (h.tenure === 'public') ctx.act.move('monthly', { reason: '계약 만기', involuntary: true });
      else {
        const rise = Math.max(0, (1 + houseYoy(h.regionGroup, y)) * (1 + houseYoy(h.regionGroup, y - 1)) - 1) + 0.02;
        const plans = housingPlans(L, rise);
        ctx.ask({ eventId: 'sys.home.expire', options: asOptions(plans), defaultId: 'same', data: { plans }, vars: { tenureLabel: TENURE_LABEL[h.tenure] } });
      }
    }
  }
  // 전세사기(GDD §5.5)
  if (h.tenure === 'jeonse' && a < 40 && ctx.chance(yr(T('JEONSE_FRAUD'), y))) {
    h.deposit = 0;
    fl.fraud = y; L.tally.invol = (L.tally.invol || 0) + 1;
    ctx.sys('sys.home.jeonse_fraud');
    ctx.act.move('monthly', { reason: '전세사기', involuntary: true, silent: true });
  }
  // 주택 구입 기회
  if (!h.owned && !L.pending && a >= 25 && a <= 64) {   // 만기 선택이 걸린 해에는 묻지 않는다: 매수가 먼저 처리된 뒤 만기 정산이 새 집을 팔던 순서 꼬임
    const sz = 0.5 + 0.6 * ctx.rand(), price = Math.round(homePrice(L) * sz);
    const ltv = ltvOf(L);
    const afford = clamp((L.money.assets + (h.deposit || 0) + parentHelp(L) + ltv * price) / price, 0, 1.5);
    const cf = D.OWN_TRANSITION.cohortFactor, hc = HOUSING_CAL;
    // OWN_TRANSITION은 실측 전이율이므로 afford는 평균 근처(ref)에서 1이 되는 상대 배수로만 쓴다(QA-S-05)
    const lam = ag(T('OWN_TRANSITION'), a) * ag(hc.own, a) * (L.birth.year >= cf.fromBirthYear ? cf.mult * hc.cohortAdj : 1) * clamp(afford / hc.affordRef, 0.25, 1.5) * (fl.buyWait ? 0.8 : 1) * bias(L, 'tenureBias', 'own', 0.85, 1.15);
    // 2년 계약으로 자주 옮기는 임차인은 recent 감쇠에 늘 걸려 첫 집 매수가 막혔다 → 매수엔 √만 적용(F4-a)
    if (canOwn(L, ctx, sz) && ctx.chance(lam * Math.sqrt(recent(L)))) return ctx.ask({ eventId: 'sys.home.buy', options: ['buy', 'wait'], defaultId: afford < hc.buyMin ? 'wait' : 'buy', data: { price } });
  }
  // 공공임대
  if (h.tenure === 'monthly' && L.birth.quintile <= 2 && y >= 1989 && ctx.chance(0.03 * recent(L))) {
    ctx.act.move('public', { reason: '공공임대', silent: true });
    ctx.sys('sys.home.public_rental');
  }
  // 사유가 있는 이동(한 해 한 번, 이미 이사했거나 다른 선택이 걸린 해는 다음 해로)
  if (!L.pending && !L.yr.asked && lastMove(L)?.year !== y) {
    if (tryHometown(L, ctx)) return;
    const j = L.job, b = L.birth;
    if (a >= 22 && a <= 55 && startedJob(L)) {                                            // 취업·전직
      const to = jobDest(L, ctx);
      if (to && to !== h.region && askRelocate(L, ctx, j.public && !isCapital(to) ? '기관 이전' : '취업', to, {}, '먼 출퇴근이나 주말 가족으로 버틴다')) return;
    }
    if (j.status === 'seeking' && a >= 19 && a <= 34 && !isCapital(h.region) && ctx.chance(0.04 * recent(L))) {
      const to = pickRegion(ctx, CAPITAL_JOB, y);
      if (askRelocate(L, ctx, '일자리 찾아', to, {}, '이 지역에서 일자리를 계속 찾는다')) return;
    }
    if (fl.marryYear >= y - 1 && !fl.spouseHome) {                                       // 결혼: 배우자의 생활권
      fl.spouseHome = y;
      if (ctx.chance(0.15)) { const to = pickRegion(ctx, POP, y, h.region); if (to && askRelocate(L, ctx, '결혼', to, {}, '한쪽이 먼 길을 오가며 산다')) return; }
    }
    if ((fl.jobLoss >= y - 1 || fl.bizClosed >= y - 1 || fl.debtRelief >= y - 1) && RENTER.has(h.tenure) && isCapital(h.region) && a <= 60 && ctx.chance(0.2)) {
      const par = L.family.parents, home = !isCapital(b.region) && (par.father.alive || par.mother.alive);
      const to = home ? b.region : h.region === 'seoul' ? pickRegion(ctx, OUTER, y) : null;
      if (to && askRelocate(L, ctx, '실직 후 이주', to, home ? { only: b.sigungu } : {}, '줄인 살림으로 버틴다')) return;
    }
    if (a >= 58 && a <= 75 && (j.status === 'retired' || fl.mainExited) && h.region !== b.region && !fl.retireAsk && ctx.chance(0.015 * (h.owned && isCapital(h.region) ? 1.5 : 1))) {
      fl.retireAsk = y;                                                                      // 은퇴 후 귀향(집값 차익)
      if (askRelocate(L, ctx, '은퇴 귀향', b.region, { only: b.sigungu }, '살던 동네에서 노후를 보낸다')) return;
    }
    if (tryUpgrade(L, ctx)) return;
    // 서울 세입자: 집값 상승기(2001~07·2017~21)·월세 부담에 밀려 경기·인천으로
    const boom = (y >= 2001 && y <= 2007) || (y >= 2017 && y <= 2021);
    if (h.region === 'seoul' && a >= 30 && RENTER.has(h.tenure) && ((h.rentBurden || 0) > 0.25 || boom) && ctx.chance(0.04 * (boom ? 2 : 1) * recent(L))) {
      const to = pickRegion(ctx, OUTER, y);
      ctx.act.move(h.tenure === 'public' ? 'monthly' : h.tenure, { reason: '집값', involuntary: true, region: to, silent: true });
      ctx.sys('sys.home.region_cause', { cause: CAUSE.집값, regionLabel: short(to) });
    }
  }
  if (rentals(L, ctx)) return;
  // 실직·이혼 후 부모 집으로
  if ((fl.jobLoss === y || fl.divorceYear === y) && a < 45 && !h.owned && !L.family.partner
    && [L.family.parents.father, L.family.parents.mother].some(p => p.alive) && ctx.chance(0.3)) {
    ctx.act.move('family', { reason: '부모님 집으로', silent: true });
    ctx.sys('sys.home.return_parents');
  }
  // 보유 주택 2년 ±15%
  if (h.owned) {
    if (y - (h.markYear ?? h.boughtYear) >= 2) {
      const r = h.value / (h.valueMark || h.value);
      if (Math.abs(r - 1) >= 0.15) ctx.sys('sys.home.value_jump', { dir: r > 1 ? '올랐다' : '내렸다' });
      h.valueMark = h.value; h.markYear = y;
    }
  }
  const INC = econ(L).INC;
  h.rentBurden = INC > 0 ? Math.round((h.rent || 0) * 12 / INC * 100) / 100 : 0;
}

const ltvOf = L => yr(T('LTV')[L.home.regionGroup], L.year);

// 임대 만료 뒤 선택: 계획의 보증금·월세·이사비를 그대로 정산하고, 선택이 자산·고민·인간관계에 남긴다
function relocate(L, ctx, plan, reasonText, fx) {
  const h = L.home, before = { D: h.deposit || 0 }, credit0 = L.money.loans.credit || 0;
  const s = settleMove(L, { D: before.D, newDep: plan.newDep, moveCost: plan.moveCost });
  // 계획이 정한 점유 형태·금액 그대로(같은 생활권). 목적지를 다시 고르면 예산 사다리로 전세가 월세로 바뀌고 월세는 0원으로 남았다
  ctx.act.move(plan.tenure, { reason: '계약 만기', involuntary: true, silent: true, to: { sigungu: h.sigungu, dong: h.dong, transit: h.transit }, dep: plan.newDep, rent: plan.rent });
  if (plan.tenure !== 'family') {
    L.money.assets = s.assets; L.money.loans.jeonse = s.loanKeep; L.money.loans.credit = credit0;   // 정산은 settleMove 숫자 하나로: move가 신용대출로 옮긴 전세대출 몫을 되돌려 두 번 세지 않는다
    refreshDebt(L);
    h.deposit = plan.newDep; h.rent = plan.rent; h.contractEnd = L.year + 2; h.cheap = !!plan.cheaper || h.cheap;
    if (s.loanAdd) ctx.act.borrow(s.loanAdd, 'jeonse', { silent: true });
    capJeonse(L);
  } else ctx.act.spend(plan.moveCost);                 // 부모 집: 보증금 회수·전세대출 상환은 move가 이미 했다(s.cash를 더하면 보증금을 두 번 받는다)
  L.flags.lastExpire = { year: L.year, opt: plan.id };
  ctx.apply(fx, { reason: reasonText });
}
const byId = (plans, opt) => plans.find(p => p.id === opt) || plans[0];
const KEEP_FX = { sell: {}, lease: { issues: { housing: -1 } }, vacant: { issues: { housing: 1 } } };
export const choices = {
  'sys.home.expire'(L, ctx, opt, { plans }) {
    if (L.home.owned || !RENTER.has(L.home.tenure)) return;   // 선택을 기다리는 사이 집을 샀거나 옮겼으면 이 계약 정산은 끝났다
    const plan = plans.find(p => p.id === opt) || plans[0];
    const fx = {
      same: { issues: { housing: 3 }, stats: { leisure: -1 } },
      down: { issues: { housing: 4, living: 3 }, stats: { leisure: -2, happiness: -1 } },
      monthly: { issues: { housing: 5, living: 4 }, stats: { happiness: -1 } },
      family: { issues: { housing: -2 }, stats: { relations: -1, leisure: -3, happiness: -2 } },
    }[plan.id];
    relocate(L, ctx, plan, { same: '같은 동네에서 새 계약을 맺었다', down: '집을 줄여 옮겼다', monthly: '전세 보증금을 빼 월세로 옮겼다', family: '부모님 집으로 들어갔다' }[plan.id], fx);
  },
  'sys.home.independence'(L, ctx, opt) {
    if (opt === 'stay') return ctx.apply({ stats: { leisure: -3, relations: 2 } }, { reason: '부모 집에 머물렀다' });
    leaveHome(L, ctx, opt === 'room' ? 'monthly' : 'jeonse', '독립');
    ctx.sys('sys.home.move', { toLabel: TENURE_LABEL[L.home.tenure], reasonLabel: '독립' });
  },
  'sys.home.renew'(L, ctx, opt, { amount }) {
    const h = L.home;
    if (h.tenure !== 'jeonse' || h.owned) return;
    if (opt === 'pay') {
      const own = Math.min(Math.max(0, L.money.assets), amount);
      L.money.assets -= own;
      h.deposit += amount;
      if (amount - own > 0) ctx.act.borrow(amount - own, 'jeonse', { silent: true });
      capJeonse(L);
      return ctx.apply({ issues: { housing: 4 } }, { reason: `전세 보증금 ${wonAt(amount, L.year)}만 원 인상` });
    }
    L.tally.invol = (L.tally.invol || 0) + 1;
    if (opt === 'cheaper') {
      const dep = Math.round(h.deposit * 0.8);
      ctx.act.move('jeonse', { dep, reason: '보증금 인상', involuntary: true });
      return ctx.apply({ stats: { leisure: -3 } }, { reason: '더 싼 집으로 옮겼다' });
    }
    ctx.act.move('monthly', { reason: '월세 전환', involuntary: true });
  },
  'sys.home.buy'(L, ctx, opt, { price }) {
    if (opt === 'wait') { L.flags.buyWait = L.year; return; }
    becomeIndependent(L, ctx);
    const help = parentHelp(L);
    if (help) { L.household.netWorth -= help; L.money.assets += help; }
    ctx.act.move('own', { reason: '매수', price, silent: true });
    if (L.home.owned) ctx.sys('sys.home.bought', { regionLabel: REGION[L.home.region]?.label, loan: Math.round(L.money.loans.mortgage) });
  },
  // 상향 이동: 결혼·출산·학령기·일자리·만기 또는 오랜 임차 끝에 형편이 다음 단계를 넘었을 때
  'sys.home.upgrade'(L, ctx, opt, { plans, reason }) {
    if (opt === 'stay') return ctx.apply({ stats: { leisure: 1 }, issues: { housing: 2 } }, { reason: '지금 집에 머물기로 했다' });
    const p = byId(plans, opt);
    carry(L, ctx, p, p.region !== L.home.region ? '내 집 마련' : { 결혼: '결혼', 출산: '출산', '자녀 입학': '학군' }[reason] ?? (p.tenure === 'own' ? '매수' : '형편이 나아져'));
    if (L.home.owned && p.tenure === 'own') ctx.sys('sys.home.bought', { regionLabel: REGION[L.home.region]?.label, loan: Math.round(L.money.loans.mortgage) });
    ctx.apply({ stats: { happiness: 2, leisure: -1 }, issues: { housing: -4, ...(p.tenure === 'own' && { living: 2 }) } }, { reason: p.tenure === 'own' ? '내 집으로 옮겼다' : '더 나은 집으로 옮겼다' });
  },
  // 부모 돌봄: 고향으로 / 모셔 오기 / 요양시설
  'sys.home.hometown'(L, ctx, opt, { plans, who, careCost }) {
    const fl = L.flags;
    if (L.family.parents[who]?.alive && !L.family.caringFor) ctx.act.startCare(who);
    if (opt === 'bring') return ctx.apply({ stats: { relations: 2, leisure: -3 }, issues: { care: 8, housing: 3 } }, { reason: '부모님을 우리 집으로 모셔 왔다' });
    if (opt === 'facility') { fl.careCost = careCost; fl.careShare = true; return ctx.apply({ stats: { relations: -1 }, issues: { care: 4, living: 3 } }, { reason: '부모님을 요양시설에 모셨다' }); }
    const p = byId(plans, opt);
    carry(L, ctx, p, '부모 돌봄');
    ctx.apply({ stats: { relations: 3, leisure: -2 }, issues: { care: 3, ...KEEP_FX[p.keep]?.issues } }, { reason: '부모님 곁으로 옮겼다' });
  },
  // 사유가 있는 시도 이동(취업·결혼·실직·은퇴)
  'sys.home.relocate'(L, ctx, opt, { plans, reason }) {
    if (opt === 'stay') return ctx.apply({ stats: { leisure: -2, relations: reason === '결혼' ? -2 : 0 }, issues: { region: 2 } }, { reason: '지금 사는 곳에 남았다' });
    const p = byId(plans, opt);
    carry(L, ctx, p, reason);
    ctx.apply({ stats: { relations: reason === '은퇴 귀향' ? 2 : -1, leisure: -1 }, issues: { ...KEEP_FX[p.keep]?.issues } }, { reason: `${CAUSE[reason] ?? ''} 옮겼다` });
  },
  // 세 준 집: 돌아가 살기 / 팔기 / 세 놓기 / 그대로
  'sys.home.rental'(L, ctx, opt, { plans, at }) {
    const r = L.rentals?.[at], p = byId(plans, opt);
    if (!r || opt === 'keep') return;
    if (opt === 'lease') { r.rent = leaseIncome(r.sigungu, L.year, r.value); delete r.empty; return ctx.apply({ issues: { living: -1 } }, { reason: '비워 둔 집에 세를 놓았다' }); }
    if (opt === 'back') {
      ctx.act.move('own', { reason: '세 준 집으로', home: r, to: { sigungu: r.sigungu, dong: r.dong, transit: r.transit }, silent: true });
      ctx.act.spend(p.moveCost);
      return ctx.apply({ stats: { happiness: 2 }, issues: { housing: -4 } }, { reason: '세 줬던 내 집으로 돌아갔다' });
    }
    ctx.act.sellRentedHome(at, p.proceeds);
    ctx.apply({ issues: { living: -2 } }, { reason: '세 준 집을 팔았다' });
  },
};
