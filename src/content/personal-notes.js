// 올해의 나 일상 기록 문장틀. 상태(L)에서 파생한 개인 한 줄만 쓴다: 상태에 없는 것은 서술하지 않는다.
// 각 틀: [키, (L)=>문장 배열 | null]. 배열 안 변형은 시드로 고른다. 시대 어휘·국민학교 표기는 엔진(notes.js)이 걸러 준다.
const COND = { hypertension: '고혈압', diabetes: '당뇨', heart: '심장 질환', stroke: '뇌졸중', cancer: '암', liver: '간 질환', copd: '만성 폐질환', kidney: '신장 질환', arthritis: '관절염', dementia: '치매', depression: '우울증' };
const kidsAlive = L => L.family.children.filter(c => c.alive);
const grade = (a, lo, n) => (a - lo + 1 > 0 && a - lo + 1 <= n ? a - lo + 1 : null);
const three = (s, b, c) => [s, b, c];

export const NOTES = [
  ['school', L => {                                   // 영유아·학령: 학년·학교 변화
    const a = L.age, e = L.edu.stage, g = lo => a - lo + 1;
    if (e === 'elem' && grade(a, 7, 6)) return three(`초등학교 ${g(7)}학년이 되었다.`, `초등학교 ${g(7)}학년으로 한 해를 보냈다.`, `초등학교 ${g(7)}학년 교실에서 지냈다.`);
    if (e === 'middle' && grade(a, 13, 3)) return three(`중학교 ${g(13)}학년이 되었다.`, `중학교 ${g(13)}학년으로 한 해를 보냈다.`, `중학교 ${g(13)}학년 교실에서 지냈다.`);
    if (e === 'high' && grade(a, 16, 3)) return three(`고등학교 ${g(16)}학년이 되었다.`, `고등학교 ${g(16)}학년으로 한 해를 보냈다.`, `고등학교 ${g(16)}학년 교실에서 지냈다.`);
    if (e === 'college' && a >= 19 && a <= 23) return three(`대학 ${a - 18}년차가 되었다.`, `대학 ${a - 18}년차로 한 해를 보냈다.`, `대학 ${a - 18}년차 수업을 들었다.`);
    if (a >= 1 && a <= 6) return three(`${a}살이 되었다.`, `${a}살로 한 해를 보냈다.`, `${a}살이 되어 키가 자랐다.`);
    return null;
  }],
  ['work', L => {                                     // 직장 근속·고용 형태
    const j = L.job;
    if (j.status === 'employed' && j.years >= 1) return three(`${j.regular ? '정규직' : '비정규직'}으로 ${j.years}년째 일했다.`, `같은 일터에서 ${j.years}년째 일하고 있다.`, `${j.years}년째 출근하는 한 해였다.`);
    if (j.status === 'self' && j.years >= 1) return three(`자영업을 ${j.years}년째 이어 갔다.`, `가게를 연 지 ${j.years}년째다.`, `${j.years}년째 내 일을 하고 있다.`);
    if (j.status === 'seeking' && j.searchYears >= 1) return three(`${j.searchYears}년째 구직 중이다.`, `구직 ${j.searchYears}년째, 아직 취업하지 못했다.`, `${j.searchYears}년째 일자리를 찾고 있다.`);
    if (j.status === 'retired') return three('일을 마친 뒤의 한 해를 보냈다.', '은퇴 후 일상을 이어 갔다.', '출근하지 않는 한 해를 보냈다.');
    return null;
  }],
  ['health', L => {                                   // 건강
    const act = L.health.conditions.filter(c => c.active && COND[c.key]);
    if (act.length) { const c = COND[act[0].key]; return three(`${c} 관리를 이어 갔다.`, `${c} 때문에 병원에 다녔다.`, `${c} 진료를 정기적으로 받았다.`); }
    if (L.age >= 40 && L.stats.health >= 60) return three('건강검진을 받았고 특별한 이상은 없었다.', '건강하게 한 해를 보냈다.', '병원 갈 일이 거의 없었다.');
    if (L.age >= 20 && L.stats.health < 45) return three('몸이 자주 피곤한 한 해였다.', '컨디션이 좋지 않은 날이 많았다.', '건강이 마음처럼 따라 주지 않았다.');
    return null;
  }],
  ['kids', L => {                                     // 자녀
    const ks = kidsAlive(L).map(c => ({ c, a: L.year - c.birthYear })).filter(x => x.a >= 1 && x.a <= 18 && !x.c.leftHome);
    if (!ks.length) return null;
    const { a } = ks[0];
    const s = a <= 6 ? `${a}살이 된 아이를 돌보았다.` : a <= 12 ? `아이가 초등학교 ${a - 6}학년이 되었다.` : a <= 15 ? `아이가 중학교 ${a - 12}학년이 되었다.` : `아이가 고등학교 ${a - 15}학년이 되었다.`;
    return three(s, '아이와 보내는 시간이 한 해를 채웠다.', '아이 일정에 맞춰 생활했다.');
  }],
  ['parents', L => {                                  // 부모
    const ps = [['아버지', L.family.parents.father], ['어머니', L.family.parents.mother]].filter(([, p]) => p?.alive && p.age >= 65 && L.age >= 20);
    if (!ps.length) return null;
    const [w, p] = ps[0];
    return three(`${w}가 ${p.age}세가 되었다.`, `${w}의 안부를 자주 챙겼다.`, `${w}를 찾아뵙는 일이 늘었다.`);
  }],
  ['partner', L => (L.family.partner && L.age >= 22 ? three('배우자와 함께 한 해를 보냈다.', '배우자와 보내는 시간이 일상이 되었다.', '배우자와 저녁을 함께하는 날이 많았다.') : null)],
  ['relations', L => {                                // 관계
    if (L.age < 8) return null;
    if (L.stats.relations >= 65) return three('가까운 사람들과 자주 만났다.', '친구들과 연락이 이어졌다.', '주변 사람들과 어울리는 날이 많았다.');
    if (L.stats.relations < 40) return three('연락이 뜸해진 사람이 늘었다.', '사람을 만나는 일이 줄었다.', '혼자 보내는 시간이 길어졌다.');
    return null;
  }],
  ['housing', L => {                                  // 주거
    const h = L.home;
    if (L.age < 19) return null;
    if ((h.tenure === 'jeonse' || h.tenure === 'monthly') && h.contractEnd === L.year + 1) return three('다음 해 계약 만료를 앞두고 있다.', '집 계약 갱신을 생각해야 하는 때가 다가왔다.', '살던 집의 계약 만료가 가까워졌다.');
    if (h.owned) return three('내 집에서 한 해를 지냈다.', '자가에서 안정적으로 지냈다.', '살던 집에서 한 해를 보냈다.');
    if (h.parents) return three('부모님 집에서 지냈다.', '부모님과 함께 사는 한 해였다.', '독립하지 않고 집에서 지냈다.');
    return null;
  }],
  ['money', L => {                                    // 돈
    const m = L.money;
    if (L.age < 19) return null;
    if (m.deficitYears >= 1) return three(`적자 가계가 ${m.deficitYears}년째 이어졌다.`, '지출이 수입보다 많은 해였다.', '생활비를 줄이며 지냈다.');
    if (m.debt > 0 && L.job.status === 'employed') return three('대출을 갚아 가며 지냈다.', '대출 상환이 이어졌다.', '매달 대출 원리금을 냈다.');
    if (m.debt === 0 && m.assets > 0 && L.stats.wealth >= 65) return three('저축이 조금씩 쌓였다.', '빚 없이 한 해를 보냈다.', '생활에 여유가 있는 한 해였다.');
    return null;
  }],
  ['leisure', L => {                                  // 여가
    if (L.age < 8) return null;
    if (L.stats.leisure >= 65) return three('여가 시간이 넉넉한 한 해였다.', '쉬는 날을 챙겨 보냈다.', '취미에 시간을 쓸 수 있었다.');
    if (L.stats.leisure < 35) return three('쉴 틈이 적은 한 해였다.', '여가 시간이 거의 없었다.', '바쁘게 한 해를 보냈다.');
    return null;
  }],
  ['mood', L => {                                     // 마음 상태(행복 지표)
    if (L.age < 10) return null;
    if (L.stats.happiness >= 70) return three('마음이 편한 한 해였다.', '웃는 날이 많았다.', '대체로 만족스러운 한 해였다.');
    if (L.stats.happiness < 35) return three('힘든 날이 많은 한 해였다.', '마음이 무거운 날이 이어졌다.', '지치는 일이 많았다.');
    return null;
  }],
  // ── 영유아(1~6) ──
  ['daycare', L => (['daycare', 'kinder'].includes(L.edu.stage) ? three('어린이집에서 하루를 보냈다.', '또래 아이들과 어울리기 시작했다.', '집 밖에서 보내는 시간이 늘었다.') : null)],
  ['toddler', L => (L.age >= 2 && L.age <= 4 ? three('말이 부쩍 늘었다.', '하루가 다르게 자랐다.', '걸음이 빨라지고 말이 늘었다.') : null)],
  ['homeplay', L => (L.age >= 1 && L.age <= 6 ? three('가족과 함께 보내는 시간이 많았다.', '집 안에서 놀며 하루를 보냈다.', '가족의 손을 잡고 동네를 오갔다.') : null)],
  // ── 학령(7~18) ──
  ['exam', L => (['middle', 'high'].includes(L.edu.stage) ? three('시험 기간에 공부하는 시간이 늘었다.', '시험 성적표를 받았다.', '시험 준비로 밤늦게까지 책상에 앉았다.') : null)],
  ['tutoring', L => (L.edu.tutoring > 0 && ['elem', 'middle', 'high'].includes(L.edu.stage) ? three('학원에 다니며 저녁을 보냈다.', '학원 수업이 일과에 들어왔다.', '방과 후에는 학원에 갔다.') : null)],
  ['schoolfriend', L => (L.age >= 7 && L.age <= 18 && L.stats.relations >= 55 ? three('같은 반 친구와 가까워졌다.', '친구들과 어울려 지내는 날이 많았다.', '쉬는 시간이 즐거운 한 해였다.') : null)],
  ['vacation', L => (L.age >= 7 && L.age <= 18 ? three('방학에는 늦잠을 자는 날이 많았다.', '방학 동안 집에서 지냈다.', '방학이 끝나고 다시 학교에 갔다.') : null)],
  // ── 청년·중년(일·돈) ──
  ['colleague', L => (L.job.status === 'employed' && L.stats.relations >= 55 ? three('동료들과 점심을 자주 함께했다.', '직장 동료와 가까워졌다.', '회식과 점심 자리가 이어졌다.') : null)],
  ['boss', L => (L.job.status === 'employed' && L.job.years >= 1 ? three('상사와 업무 방식을 맞춰 갔다.', '맡은 업무가 조금씩 늘었다.', '업무 평가를 받는 시기가 지났다.') : null)],
  ['payday', L => (L.job.status === 'employed' && L.age >= 20 ? three('월급날에 맞춰 지출을 정리했다.', '월급이 들어오면 고정 지출부터 나갔다.', '월급으로 한 달을 꾸렸다.') : null)],
  ['spend', L => (L.age >= 19 && L.stats.wealth < 40 ? three('지출을 줄여야 하는 달이 많았다.', '생활비를 따져 보는 날이 늘었다.', '돈 쓰는 일에 신중해졌다.') : null)],
  ['saving', L => (L.age >= 19 && L.money.debt === 0 && L.stats.wealth >= 55 ? three('저축 목표를 하나 채웠다.', '통장에 모아 둔 돈이 늘었다.', '꾸준히 저축하며 지냈다.') : null)],
  ['dating', L => (L.family.dating && !L.family.partner ? three('만나는 사람과 시간을 보냈다.', '연애를 이어 갔다.', '주말을 함께 보내는 사람이 생겼다.') : null)],
  ['habit', L => (L.age >= 25 && L.stats.health < 55 ? three('체중과 식습관이 신경 쓰이는 해였다.', '잠이 부족한 날이 많았다.', '운동을 시작하려다 미뤘다.') : null)],
  ['hospital', L => (L.age >= 45 && L.health.conditions.some(c => c.active) ? three('병원에 가는 날이 늘었다.', '정기 검사를 받으러 병원에 다녔다.', '진료 예약이 달력에 자리를 잡았다.') : null)],
  ['holiday', L => (L.age >= 25 && (L.family.partner || L.family.parents.father?.alive || L.family.parents.mother?.alive) ? three('명절에 가족이 모였다.', '가족 행사에 참석했다.', '가족과 모이는 날을 챙겼다.') : null)],
  ['trip', L => (L.age >= 20 && L.stats.leisure >= 55 ? three('짧은 여행을 다녀왔다.', '쉬는 날에 가까운 곳으로 나들이를 갔다.', '휴가를 챙겨 쉬었다.') : null)],
  ['neighbor', L => (L.age >= 25 && !L.home.parents && L.stats.relations >= 50 ? three('이웃과 인사를 나누는 사이가 되었다.', '동네에 익숙해졌다.', '사는 동네에서 안부를 묻는 사람이 생겼다.') : null)],
  ['season', L => (L.age >= 5 ? three('계절마다 달라지는 일상을 보냈다.', '더위와 추위를 지나 한 해가 갔다.', '계절이 바뀌는 것을 느끼며 지냈다.') : null)],
  // ── 노년 ──
  ['elder', L => (L.age >= 65 && L.stats.health >= 50 ? three('동네를 걷는 시간이 하루의 일과였다.', '이웃과 산책하며 안부를 나눴다.', '규칙적으로 하루를 보냈다.') : null)],
  ['pensioned', L => (L.age >= 65 && L.money.pension > 0 ? three('연금으로 생활을 꾸렸다.', '연금과 저축으로 생활했다.', '매달 들어오는 연금으로 지냈다.') : null)],
  ['grandkids', L => (L.age >= 55 && (L.family.grandchildren || 0) > 0 ? three('손주 소식이 반가웠다.', '손주와 시간을 보냈다.', '손주가 자라는 것을 지켜봤다.') : null)],
  ['elderhealth', L => (L.age >= 70 ? three('몸의 변화를 느끼는 한 해였다.', '무리하지 않고 지냈다.', '건강을 먼저 챙기며 지냈다.') : null)],
];
