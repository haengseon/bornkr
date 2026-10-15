// 작가 A 시스템 문구(ARCHITECTURE §9, GDD §9.3): sys.edu.*(17) + sys.fam.sibling_born·parents_divorce·grandparent_death
// + sys.health.lbw·disability + sys.home.family_move. 키당 변형 2~3개, 엔진이 배열이면 pick, 함수면 (L, ctx+vars).
// 템플릿 변수는 엔진이 넘기는 것만 쓴다: exam highTypeLabel collegeLabel levelLabel amount gpLabel disabilityLabel n toLabel.
// 선택 지점 키는 { prompt, options: { id: label } }(라벨 ≤14자).
import { era } from './events/early.js';

export default {
  // ── 교육(GDD §5.1) ──
  'sys.edu.daycare': era([
    [1960, ['동네 탁아소에 맡겨지기 시작했다.', '낮 동안 탁아소에서 지내게 되었다. 해 질 녘에 데리러 왔다.']],
    [1995, ['놀이방에 다니기 시작했다.', '아침마다 놀이방 차가 집 앞에 섰다.']],
    [2005, ['어린이집에 다니기 시작했다.', '아침마다 어린이집 현관에서 신발을 갈아 신었다.', '낮에는 어린이집이 내 집이 되었다.']],
  ]),
  'sys.edu.kinder': ['유치원 가방을 처음 멨다.', '다섯 살, 이름이 적힌 신발장이 처음 생겼다.', '아침마다 선생님께 인사하는 연습을 했다.'],
  'sys.edu.elem_enter': era([
    [1960, ['국민학교에 입학했다.', '국민학생이 되었다. 책가방이 몸보다 커 보였다.']],
    [1996, ['초등학교에 입학했다.', '초등학생이 되었다. 책가방이 몸보다 커 보였다.', '입학식 날, 이름이 불리는 순서를 기다렸다.']],
  ]),
  'sys.edu.middle_enter': ['중학생이 되었다.', '중학교 복도는 초등학교보다 길게 느껴졌다.', '처음으로 과목마다 선생님이 바뀌었다.'],
  'sys.edu.tutoring': {
    prompt: '중학교에 올라가자 학원 이야기가 늘었다.',
    options: { more: '학원을 늘린다', keep: '지금대로', less: '줄인다' },
  },
  'sys.edu.high_type': {
    prompt: '고등학교 원서를 쓸 때가 왔다.',
    options: { general: '일반고', voc: '특성화고', special: '특목·자사고' },
  },
  'sys.edu.high_enter': ['{highTypeLabel}에 들어갔다.', '{highTypeLabel} 교문을 처음 지났다. 교복이 아직 낯설었다.', '{highTypeLabel} 입학식이 열렸다. 시간표는 빈칸 없이 빽빽했다.'],
  'sys.edu.csat': ['{exam|을} 치렀다.', '{exam} 날 아침은 유난히 추웠다. 시험은 하루를 꼬박 썼다.', '{exam} 종이 울렸다. 연필을 내려놓는 손이 떨렸다.'],
  'sys.edu.path': {
    prompt: '졸업 후 갈 길을 정할 때가 왔다.',
    options: { college: '대학에 간다', work: '일을 시작한다', retake: '한 해 더 준비한다' },
  },
  'sys.edu.college_enter': ['{collegeLabel}에 입학했다.', '합격 통지서가 왔고, 곧 {collegeLabel} 신입생이 되었다.', '{collegeLabel} 입학식. 캠퍼스는 생각보다 넓었다.'],
  'sys.edu.no_college': ['대학 대신 일을 찾기로 했다.', '대학 원서를 내지 않았다. 대신 구인 광고를 읽기 시작했다.', '진학하지 않고 일터로 가기로 했다.'],
  'sys.edu.retake': ['한 해 더 시험을 준비했다.', '재수 학원 책상이 올해의 자리가 되었다.', '한 번 더. 작년 문제집을 다시 펼쳤다.'],
  'sys.edu.loan': ['학자금 대출 {amount}만 원을 받았다.', '등록금 {amount}만 원을 학자금 대출로 돌렸다.', '이번 학기 등록금은 대출 {amount}만 원이었다.'],
  'sys.edu.leave': ['한 학기 쉬어 가기로 했다.', '휴학 신청서를 냈다. 학기 중에 처음으로 시간이 남았다.'],
  'sys.edu.dropout': ['학교를 그만두었다.', '자퇴서를 냈다. 교문을 나서는 길이 평소보다 짧았다.', '학교 밖으로 나왔다. 시간표가 사라졌다.'],
  'sys.edu.graduate': ['{levelLabel|을} 졸업했다.', '{levelLabel} 졸업장을 받았다.', '{levelLabel} 졸업식이 끝나고 교문을 나섰다.'],
  'sys.edu.grad_enter': ['대학원에 진학했다.', '대학원 연구실에 내 자리가 생겼다.', '학부 이후에도 공부를 이어 가기로 했다.'],

  // ── 가족·건강·주거(어린 시절) ──
  'sys.fam.sibling_born': ['동생이 태어났다.', '엄마 품에 다른 아기가 안겨 있었다. 동생이었다.', '집에 아기 울음소리가 늘었다. 동생이 생겼다.', '내 방 옆에 작은 요람이 놓였다. 동생이 태어났다.'],
  'sys.fam.parents_divorce': ['부모님이 따로 살게 되었다.', '부모님이 이혼했다. 식탁의 의자가 하나 줄었다.', '부모님이 각자의 집에서 살기로 했다. 이야기는 짧게 끝났다.'],
  'sys.fam.grandparent_death': ['{gpLabel|이} 돌아가셨다.', '{gpLabel|이} 돌아가셨다. 어른들이 우는 모습을 처음 보았다.', '{gpLabel|이} 돌아가셨다. 집에 향 냄새가 며칠 남았다.'],
  'sys.health.lbw': ['작게 태어나 한동안 병원을 오갔다.', '조금 일찍, 조금 작게 태어났다. 퇴원은 몇 주 뒤였다.', '작게 태어난 몸은 한동안 병원 저울 위에 있었다.'],
  'sys.health.disability': ['{disabilityLabel} 진단을 받았다. 치료실 대기는 {n}개월이었다.', '{disabilityLabel|이} 진단서에 적혔다. 대기 명단은 {n}개월짜리였다.', '진단은 {disabilityLabel}. 치료실 자리가 나기까지 {n}개월이 걸렸다.'],
  'sys.home.family_move': ['집이 이사를 했다({toLabel}).', '이삿짐 트럭이 {toLabel|으로} 떠났다. 나도 그 안에 있었다.', '우리 집이 {toLabel|으로} 옮겨 갔다. 방 구조가 모두 달라졌다.', '어른들이 짐을 쌌고, 우리는 {toLabel|으로} 옮겼다.', '새 집은 {toLabel}이었다. 내 방 벽지가 낯설었다.', '{toLabel|으로} 이사했다.'],
};
