import { ev, ch } from '../jobs-kit.js';
export default {
  '25100': [
    ev('25100', 'note_back', [22, 58], 0.12, '학부모가 알림장 끝에 고맙다는 말을 적어 보냈다.', 'happiness+3 relations+1', '학부모의 한마디'),
    ev('25100', 'unpaid_after_hours', [22, 58], 0.14, '하원 뒤 서류와 교실 정리가 남아 퇴근이 늦다. 초과 수당은 없다.', 'wealth-1 health-1 leisure-2 fairness+2', '무급 초과 근무', { dark: true }),
    ch('25100', 'sub_cover', [22, 55], 0.1, '동료가 쉬는 날 반을 대신 봐 달라고 부탁했다.', '어떻게 할까?', [
      ['help', '맡아 준다', 'relations+2 health-1 leisure-1', '두 반을 오가며 하루가 길었다. 다음 날 동료가 간식을 놓고 갔다.'],
      ['decline', '어렵다고 말한다', 'health+1 relations-1', '무리하지 않았다. 동료가 난감해했다.'],
    ], 'help', '교사 인력 부족'),
  ],
  '25310': [
    ev('25310', 'thank_you_card', [22, 62], 0.12, '이용자 가족이 직접 쓴 감사 카드를 건넸다. 책상 앞에 붙여 두었다.', 'happiness+3 relations+1', '이용자 가족의 인사'),
    ev('25310', 'complaint_visit', [24, 60], 0.12, '이용자가 서비스 시간이 줄었다고 사무실에서 큰 소리를 냈다.', 'happiness-2 health-1 conflict+2', '민원 응대', { dark: true }),
    ch('25310', 'extra_visit', [24, 58], 0.1, '퇴근 직전에 급한 가정 방문 요청이 들어왔다.', '어떻게 할까?', [
      ['go', '지금 방문한다', 'relations+1 happiness+1 health-2 leisure-2', '밤늦게야 돌아왔다. 이용자가 안도했다.'],
      ['next', '내일 아침에 간다', 'health+1 leisure+1 happiness-1', '걱정을 안고 퇴근했다. 다음 날 일찍 찾아갔다.'],
    ], 'next', '긴급 요청과 퇴근'),
  ],
  '25322': [
    ev('25322', 'resume_workshop', [24, 62], 0.12, '이력서 쓰기 수업에서 한 이용자가 처음으로 면접 연락을 받았다.', 'happiness+3 relations+1', '구직자의 변화'),
    ev('25322', 'quota_pressure', [26, 62], 0.12, '취업 연계 실적 목표가 올라 상담 시간이 줄었다.', 'happiness-2 job+2 fairness+1', '실적 압박', { dark: true }),
    ch('25322', 'hard_case', [26, 60], 0.1, '오래 구직하지 못한 이용자가 눈에 띄게 지쳐 보인다.', '어떻게 도울까?', [
      ['deep', '상담을 더 길게 한다', 'relations+1 happiness+1 leisure-1 health-1', '다른 상담이 밀렸다. 이용자가 한결 편해 보였다.'],
      ['refer', '전문 기관에 연결한다', 'intellect+1 relations-1 happiness-1', '절차대로 연결했다. 후속 소식을 기다린다.'],
    ], 'deep', '상담 시간과 연계'),
  ],
  '25411': [
    ev('25411', 'wedding_blessing', [30, 75], 0.1, '오래 알던 교인의 혼례를 맡았다. 눈시울이 붉어졌다.', 'happiness+3 relations+1', '혼례 주례'),
    ev('25411', 'rent_arrears', [30, 75], 0.12, '예배당 월세가 밀렸다. 사례비는 몇 달째 줄여 받았다.', 'wealth-2 happiness-1 housing+2', '교회 재정 악화', { dark: true }),
    ch('25411', 'split_offer', [32, 68], 0.09, '다른 교회에서 부임 제안을 해 왔다. 지금 교인들과 정이 들었다.', '어떻게 할까?', [
      ['move', '옮긴다', 'wealth+2 relations-2 happiness+1', '사례비는 나아졌다. 이별 인사가 길었다.'],
      ['stay', '남는다', 'relations+2 wealth-1 happiness+1', '남은 교인들이 고마워했다. 살림은 그대로 빠듯했다.'],
    ], 'stay', '부임 제안'),
  ],
  '26113': [
    ev('26113', 'lab_award', [32, 66], 0.1, '지도 학생이 학회에서 우수 논문상을 받았다.', 'happiness+3 intellect+2 relations+1', '제자의 성과'),
    ev('26113', 'grant_denied', [32, 66], 0.14, '신청한 연구비가 떨어져 대학원생 인건비 마련이 막막해졌다.', 'wealth-1 happiness-2 intellect-1 job+2', '연구비 탈락', { dark: true }),
    ch('26113', 'sabbatical', [40, 62], 0.1, '연구년 기회가 생겼다. 해외로 갈지, 국내에서 지낼지 정해야 한다.', '어떻게 할까?', [
      ['abroad', '해외로 간다', 'intellect+3 relations-1 wealth-2 leisure+1', '연구는 깊어졌지만 가족과 떨어져 지냈다.'],
      ['home', '국내에 남는다', 'relations+1 intellect+1 wealth-1', '가족과 함께였다. 연구 폭은 크지 않았다.'],
    ], 'home', '연구년 선택'),
  ],
  '26122': [
    ev('26122', 'evaluation_good', [28, 60], 0.12, '강의 평가에서 수강생들의 긍정적인 평이 쏟아졌다.', 'happiness+3 intellect+1', '강의 평가'),
    ev('26122', 'no_stability', [28, 62], 0.14, '방학 중에는 강사료가 나오지 않는다. 학기 사이 석 달이 길었다.', 'wealth-3 happiness-2 job+2', '방학 중 무급', { dark: true }),
    ch('26122', 'new_course', [28, 58], 0.1, '새 교양 강좌를 개설해 달라는 제안이 왔다.', '어떻게 할까?', [
      ['create', '강좌를 만든다', 'intellect+2 wealth+1 leisure-2 health-1', '강의 준비로 한 학기가 바빴다. 수강생이 모였다.'],
      ['keep', '기존 강의를 지킨다', 'leisure+1 intellect-1 wealth-1', '여유는 있었지만 새 기회를 흘려보냈다.'],
    ], 'keep', '강좌 개설'),
  ],
  '26211': [
    ev('26211', 'poem_class', [24, 62], 0.12, '학생이 쓴 시 한 편이 마음에 남았다. 교무실에서 몇 번 읽었다.', 'happiness+3 intellect+1', '수업의 한 장면'),
    ev('26211', 'admin_overload', [24, 60], 0.14, '공문과 행정 업무가 겹쳐 수업 준비에 쓸 시간이 줄었다.', 'health-1 happiness-2 leisure-2 job+2', '행정 업무 과중', { dark: true }),
    ch('26211', 'bad_news', [26, 60], 0.1, '학생이 학업을 두고 부모와 갈등 중이라며 상담을 청했다.', '어떻게 할까?', [
      ['listen', '시간을 내서 듣는다', 'relations+2 happiness+1 leisure-2 health-1', '점심을 거르며 이야기를 들었다. 학생이 한결 밝아졌다.'],
      ['refer', '상담 교사에게 연결한다', 'health+1 relations-1', '전문 상담으로 이어졌다. 내 몫은 덜었다.'],
    ], 'refer', '학생 상담'),
  ],
  '26220': [
    ev('26220', 'first_reading', [23, 60], 0.12, '한글을 더듬던 아이가 처음으로 한 쪽을 끝까지 읽었다.', 'happiness+4 relations+1', '아이의 성장'),
    ev('26220', 'complaint_chain', [24, 60], 0.14, '학부모 민원이 이어져 수업 외 시간에 답변하느라 지쳤다.', 'health-2 happiness-2 conflict+2', '학부모 민원', { dark: true }),
    ch('26220', 'field_trip', [24, 55], 0.1, '현장 체험학습 인솔 날짜가 잡혔다. 책임이 막중하다.', '어떻게 진행할까?', [
      ['go', '예정대로 간다', 'happiness+2 relations+1 health-1 leisure-1', '아이들 웃음소리가 길게 남았다. 하루가 피곤했다.'],
      ['indoor', '교내 활동으로 바꾼다', 'health+1 happiness-1 relations-1', '부담은 줄었다. 아이들이 아쉬워했다.'],
    ], 'indoor', '체험학습 책임'),
  ],
  '26300': [
    ev('26300', 'sleepy_child', [22, 58], 0.12, '낮잠 시간에 처음 혼자 잠든 아이를 안아 눕히며 마음이 놓였다.', 'happiness+3 relations+1', '아이의 적응'),
    ev('26300', 'low_pay_wait', [22, 58], 0.12, '교사 처우 개선 소식은 들리지 않았다. 월급 명세서가 그대로다.', 'wealth-1 happiness-2 fairness+2', '처우 문제', { dark: true }),
    ch('26300', 'parent_gift', [22, 58], 0.1, '학부모가 고급 선물을 건넸다. 거절하기 어렵다.', '어떻게 할까?', [
      ['return', '정중히 돌려준다', 'happiness+1 relations-1 fairness-1', '규정을 설명했다. 어색한 공기가 잠깐 흘렀다.'],
      ['share', '반 모두에게 나눈다', 'relations+1 happiness+1 wealth-1', '아이들이 나눠 먹었다. 학부모도 이해했다.'],
    ], 'return', '선물 관행'),
  ],
  '26422': [
    ev('26422', 'score_jump', [23, 58], 0.12, '고심하던 학생의 성적이 한 단계 올랐다. 학부모의 인사를 받았다.', 'happiness+3 wealth+1 relations+1', '성적 향상'),
    ev('26422', 'branch_closing', [26, 60], 0.12, '학원 분원이 문을 닫는다는 공지가 나왔다. 수업 시수가 줄었다.', 'wealth-2 happiness-2 job+3', '분원 폐쇄', { dark: true }),
    ch('26422', 'private_tutor', [24, 55], 0.1, '학부모가 학원 몰래 개인 과외를 제안했다.', '어떻게 할까?', [
      ['accept', '받아들인다', 'wealth+3 fairness+2 relations-1 happiness-1', '수입은 늘었으나 학원 눈치가 마음에 걸렸다.'],
      ['decline', '거절한다', 'relations+1 wealth-1', '관계는 지켰다. 부수입은 포기했다.'],
    ], 'decline', '개인 과외 제안'),
  ],
  '26481': [
    ev('26481', 'child_hug', [23, 58], 0.12, '방문 수업이 끝나자 아이가 가지 말라며 손을 잡았다.', 'happiness+3 relations+1', '아이와의 정'),
    ev('26481', 'no_show_month', [24, 58], 0.14, '회원 가정이 연락 없이 방문을 거부해 헛걸음을 했다. 그 달 수입이 줄었다.', 'wealth-2 happiness-1 leisure-1', '방문 취소', { dark: true }),
    ch('26481', 'extra_class', [24, 55], 0.1, '회원 가정이 시간 외 수업을 부탁했다. 수수료는 없다.', '어떻게 할까?', [
      ['yes', '들어준다', 'relations+2 happiness+1 leisure-2 health-1', '오래 이어지는 단골 가정이 됐다.'],
      ['no', '정해진 시간만 한다', 'leisure+1 relations-1', '약속을 지켰다. 가정은 서운해했다.'],
    ], 'no', '시간 외 수업'),
  ],
  '27111': [
    ev('27111', 'settlement_word', [32, 64], 0.1, '합의가 이뤄지자 당사자들이 서로 고개를 끄덕이며 법정을 나갔다.', 'happiness+3 fairness-1', '조정 성립'),
    ev('27111', 'caseload_surge', [30, 62], 0.14, '배당 사건이 늘어 재판 일정이 빈틈없이 이어졌다.', 'health-2 leisure-2 happiness-1', '사건 폭증', { dark: true }),
    ch('27111', 'public_attention', [34, 62], 0.09, '주목받는 사건이 배당됐다. 기록과 보도가 모두 부담스럽다.', '어떻게 임할까?', [
      ['steady', '평소처럼 기록에 집중한다', 'intellect+1 health-2 leisure-1', '신중하게 판단했다. 일상이 한동안 사라졌다.'],
      ['recuse', '회피를 신청한다', 'health+1 happiness-1 relations-1', '절차에 따라 다른 재판부로 넘겼다. 마음이 가벼웠다.'],
    ], 'steady', '사건 부담'),
  ],
  '27120': [
    ev('27120', 'client_win', [28, 66], 0.12, '오래 끈 사건에서 의뢰인이 승소했다. 사무실에서 짧게 웃었다.', 'happiness+3 wealth+2', '승소'),
    ev('27120', 'unpaid_fee', [28, 66], 0.12, '수임료 일부를 끝내 받지 못했다. 시간만 들인 사건이 됐다.', 'wealth-3 happiness-1', '수임료 미지급', { dark: true }),
    ch('27120', 'pro_bono', [30, 66], 0.1, '형편이 어려운 이의 사건을 맡아 달라는 요청이 왔다.', '어떻게 할까?', [
      ['take', '맡는다', 'happiness+2 relations+1 wealth-2 leisure-1', '보수는 적었다. 의뢰인이 눈물로 고마워했다.'],
      ['pass', '다른 사건에 집중한다', 'wealth+1 happiness-1 relations-1', '수입 사건에 시간을 썼다. 마음에 걸렸다.'],
    ], 'take', '공익 사건 요청'),
  ],
  '27210': [
    ev('27210', 'policy_adopted', [30, 58], 0.1, '오래 준비한 보고서가 그대로 정책에 반영됐다.', 'happiness+3 intellect+1', '정책 반영'),
    ev('27210', 'blame_game', [30, 58], 0.12, '일이 틀어지자 책임을 서로 미루는 회의가 이어졌다.', 'happiness-2 conflict+3 health-1', '책임 공방', { dark: true }),
    ch('27210', 'deputy_post', [34, 55], 0.1, '더 큰 조직의 자리를 제안받았다. 일은 늘고 퇴근은 더 늦어진다.', '어떻게 할까?', [
      ['accept', '승진한다', 'wealth+2 intellect+1 leisure-2 health-1', '권한은 커졌다. 주말이 줄었다.'],
      ['stay', '지금 자리를 지킨다', 'leisure+1 relations+1 wealth-1', '삶의 균형은 지켰다. 기회는 다음으로 미뤘다.'],
    ], 'stay', '보직 제안'),
  ],
};
