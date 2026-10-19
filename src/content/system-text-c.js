// 작가 C 시스템 문구(ARCHITECTURE §9, GDD §9.3): sys.health.*(10) + sys.age.*(10) + sys.fam.parent_death·parent_care·care_end·widowed·child_school·child_leave·child_marry·grandchild·living_alone.
// 키당 변형 2~3개(엔진이 배열이면 pick, 함수면 (L, vars)). 선택 지점 키(grandcare·residence·parent_care)는 { prompt, options: { id: label } }(prompt는 배열 가능, 라벨 ≤14자).
// 선택 결과 한 줄(엔진 text.js '선택 id.옵션 id' 키)도 이 세 선택 지점에 한해 변형을 둔다: sys.fam.parent_care.* · sys.age.grandcare.* · sys.age.residence.*
// 템플릿 변수는 엔진이 넘기는 것만 쓴다: condLabel cancerLabel amount grade parentLabel pAge who childLabel schoolLabel.
// 질병·치매는 능력이 아니라 진료·돌봄·비용으로 쓴다. 사별·고립은 한 줄 사실만, 개인 탓으로 쓰지 않는다.
import { era } from './events/early.js';

export default {
  // ── 건강(GDD §5.7) ──
  'sys.health.quit': ['담배를 끊었다.', '마지막 한 개비를 버린 지 어느새 한 해가 되었다.', '담배 없는 하루가 습관이 되었다.'],
  'sys.health.dx_chronic': ['{condLabel} 진단. 약을 먹기 시작했다.', '검진 결과는 {condLabel}. 매일 먹는 약이 하나 생겼다.', '{condLabel|이} 진단서에 적혔다. 약 봉투가 식탁에 올랐다.'],
  'sys.health.dx_cancer': ['{cancerLabel} 진단을 받았다.', '조직 검사 결과는 {cancerLabel}. 치료 계획을 세우기로 했다.', '{cancerLabel} 진단이 나왔다. 의사의 설명은 차분했다.'],
  'sys.health.cancer_free': ['5년이 지났다. 정기 검진만 남았다.', '치료 뒤 5년. 달력에는 검진 날짜만 남았다.', '5년째 검진에서 이상 소견이 없었다.'],
  'sys.health.dx_cardio': ['{condLabel|으로} 응급실에 실려 갔다.', '{condLabel|으로} 쓰러져 병원으로 옮겨졌다. 회복에는 시간이 걸렸다.', '{condLabel} 때문에 응급실에서 밤을 보냈다.'],
  'sys.health.dx_dementia': ['치매 진단을 받았다.', '진단명은 치매였다. 가족과 돌봄 계획을 세웠다.', '치매 진단을 받았다. 담당 의사의 설명을 가족과 함께 들었다.'],
  'sys.health.depression': ['마음이 오래 무거웠다. 진료를 받기 시작했다.', '마음이 가라앉는 날이 이어졌다. 진료실 문을 두드렸다.', '오래 기운이 없어 병원을 찾았다. 약과 상담이 시작되었다.'],
  'sys.health.recover': ['{condLabel|이} 나아졌다.', '{condLabel} 치료가 끝났다. 몸이 한결 가벼웠다.', '{condLabel}에서 회복했다. 일상이 돌아왔다.', '{condLabel} 진료 간격이 길어졌다. 병원이 일과에서 빠졌다.', '{condLabel} 검사 결과가 좋아졌다. 의사가 고개를 끄덕였다.'],
  'sys.health.unmet': ['병원비와 거리 때문에 진료를 미뤘다.', '진료 예약일이 다가왔지만 병원이 너무 멀었다.', '병원비와 교통이 부담되어 진료를 한 번 미뤘다.', '약만 먼저 받고 검사는 다음으로 미뤘다.', '병원 가는 하루를 낼 수 없어 예약을 취소했다.', '대기 시간이 길다는 말에 진료를 포기하고 돌아왔다.'],
  'sys.health.cost': ['병원비가 {amount}만 원 나왔다.', '올해 병원비는 {amount}만 원이었다.', '진료비 영수증에 {amount}만 원이 적혀 있었다.'],

  // ── 노년(GDD §5.8) ──
  'sys.age.pension_start': ['국민연금이 매달 {amount}만 원씩 나오기 시작했다.', '첫 국민연금 {amount}만 원이 통장에 찍혔다.', '매달 {amount}만 원, 국민연금이 들어오기 시작했다.'],
  'sys.age.no_pension': ['받을 국민연금이 없었다.', '연금 개시 나이가 되었지만 받을 국민연금은 없었다.', '창구에서 국민연금 가입 기록이 없다는 답을 들었다.'],
  // 출생 1960년 이후라 65세는 2025년부터 — 2014년 이전 기초노령연금 문구는 도달할 수 없어 두지 않는다.
  'sys.age.basic_pension': ['기초연금 {amount}만 원이 들어왔다.', '기초연금 {amount}만 원이 통장에 찍혔다. 매달 같은 날이었다.', '매달 같은 날, 기초연금 {amount}만 원이 들어왔다.'],
  'sys.age.senior_job': ['동네 공익활동 일자리를 얻었다.', '노인일자리에 뽑혀 동네 일을 맡았다.', '주 몇 번 나가는 공익활동을 시작했다. 아침이 생겼다.', '조끼를 입고 골목 안전 지킴이 일을 시작했다.', '복지관 배정표에 내 이름이 올라 있었다. 일은 주 사흘이었다.'],
  'sys.age.grandcare': {
    prompt: ['자식이 손주를 봐 줄 수 있느냐고 물었다.', '맞벌이하는 자식이 손주 돌봄을 부탁해 왔다.'],
    options: { yes: '맡아 준다', some: '주 2~3일만', no: '어렵다고 한다' },
  },
  'sys.age.ltc': ['장기요양 {grade}등급을 받았다.', '장기요양 인정 심사 결과는 {grade}등급이었다.', '심사를 거쳐 장기요양 {grade}등급이 나왔다.'],
  'sys.age.residence': {
    prompt: ['앞으로 어디서 지낼까?', '돌봄을 어디서 받을지 가족과 이야기했다.'],
    options: { home: '집에서 방문요양', facility: '요양시설', child: '자녀 집으로' },
  },
  'sys.age.spouse_care': ['배우자를 돌보는 게 하루의 대부분이 되었다.', '하루가 배우자의 식사와 약 시간에 맞춰 흘렀다.', '배우자 곁을 지키는 일이 일과가 되었다.'],
  'sys.age.isolated': ['며칠 동안 이야기를 나눌 사람이 없었다.', '전화기가 며칠째 조용했다.', '이웃과 마주칠 일 없는 날이 이어졌다.', '혼자 먹는 끼니가 이어졌고, 말은 텔레비전에서만 들렸다.'],
  'sys.age.digital': era([
    [2015, ['주민센터에서도 앱으로 신청하라는 안내를 받았다.', '창구 대신 앱으로 하라는 말을 들었다.']],
    [2020, ['은행 지점이 문을 닫아 앱 사용법을 배워야 했다.', '병원 예약도 앱으로 하라고 했다.']],
  ]),

  // ── 가족(GDD §5.6) ──
  'sys.fam.parent_death': ['{parentLabel|이} 돌아가셨다. {pAge}세.', '{parentLabel|이} 세상을 떠나셨다. 향년 {pAge}세였다.', '{parentLabel|이} 돌아가셨다. 장례 사흘이 흐릿하게 지나갔다.'],
  'sys.fam.parent_care': {
    prompt: ['{parentLabel|을} 누가 돌볼까?', '{parentLabel}의 돌봄을 어떻게 할지 이야기해야 했다.'],
    options: { home: '{parentLabel|을} 모신다', facility: '{parentLabel} 요양시설', share: '형제와 나눈다' },
  },
  'sys.fam.care_end': ['{who}{because} 돌봄이 종료됐다.', '{who}{because} 돌봄이 끝났다.'],
  'sys.fam.widowed': ['배우자가 세상을 떠났다.', '배우자가 세상을 떠났다. 집에 말소리가 줄었다.', '배우자와 마지막 인사를 나눴다. 짧은 인사였다.'],
  'sys.fam.child_school': ['{childLabel|이} {schoolLabel}에 들어갔다.', '{childLabel|이} {schoolLabel} 교문을 처음 지났다.', '{childLabel}의 {schoolLabel} 입학식에 다녀왔다.'],
  'sys.fam.child_leave': ['{childLabel|이} 집을 나갔다.', '{childLabel|이} 짐을 싸서 독립했다. 방이 하나 비었다.', '{childLabel|이} 집을 나가 따로 살기 시작했다.'],
  'sys.fam.child_marry': ['{childLabel|이} 결혼했다.', '{childLabel|이} 결혼했다. 축의금 봉투를 정리하는 밤이 길었다.', '{childLabel}의 결혼식이 열렸다. 혼주석이 낯설었다.'],
  'sys.fam.grandchild': ['손주가 생겼다.', '손주가 태어났다. 이름을 소리 내어 불러 보았다.', '첫 손주를 안았다. 팔이 먼저 기억하고 있었다.'],
  'sys.fam.living_alone': ['집에 혼자 남았다.', '혼자 사는 집이 되었다. 냉장고 소리가 또렷했다.', '혼자 사는 일상이 자리를 잡았다.'],

  // ── 선택 결과 한 줄(선택 지점 3곳 × 옵션) ──
  'sys.fam.parent_care.home': ['{parentLabel|을} 직접 모시기로 했다.', '방 하나를 {parentLabel}의 방으로 바꾸기로 했다.'],
  'sys.fam.parent_care.facility': ['{parentLabel} 요양시설을 알아봤다.', '{parentLabel} 요양시설 몇 곳을 둘러보고 대기를 걸어 두었다.'],
  'sys.fam.parent_care.share': ['형제들과 {parentLabel} 돌봄을 나누기로 했다.', '형제들과 요일을 나눠 {parentLabel} 돌봄 달력을 짰다.'],
  'sys.age.grandcare.yes': ['손주를 맡아 주기로 했다.', '손주 하원 시간에 맞춰 하루를 짜기로 했다.'],
  'sys.age.grandcare.some': ['일주일에 며칠만 봐 주기로 했다.', '주 2~3일, 손주를 돌보기로 했다.'],
  'sys.age.grandcare.no': ['어렵다고 말했다.', '몸이 예전 같지 않다고 솔직히 말했다.'],
  'sys.age.residence.home': ['집에서 방문요양을 받기로 했다.', '살던 집에서 보호사의 방문을 받기로 했다.'],
  'sys.age.residence.facility': ['요양시설에 들어가기로 했다.', '요양시설로 거처를 옮기기로 가족과 정했다.'],
  'sys.age.residence.child': ['자녀 집으로 옮기기로 했다.', '자녀 집의 방 하나로 짐을 옮기기로 했다.'],
};
