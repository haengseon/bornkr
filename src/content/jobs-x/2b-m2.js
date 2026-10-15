import { ev, ch } from '../jobs-kit.js';
export default {
  '28111': [
    ev('28111', 'wage_recovered', [28, 66], 0.12, '체불 임금을 받아 낸 노동자가 사무실을 찾아와 인사했다.', 'happiness+3 fairness-1', '체불 해결'),
    ev('28111', 'screaming_client', [28, 66], 0.12, '사건 결과에 불만인 의뢰인이 전화로 길게 항의했다.', 'happiness-2 health-1 conflict+2', '감정 노동', { dark: true }),
    ch('28111', 'both_sides', [30, 64], 0.1, '사측과 근로자 양쪽에서 자문 의뢰가 들어왔다.', '어떻게 할까?', [
      ['company', '사측 자문을 맡는다', 'wealth+3 fairness+1 happiness-1', '안정적인 보수를 받았다. 마음이 개운치는 않았다.'],
      ['worker', '근로자 편에 선다', 'happiness+1 relations+1 wealth-2', '보수는 적었다. 사건 하나하나에 의미가 있었다.'],
    ], 'worker', '의뢰 선택'),
  ],
  '28120': [
    ev('28120', 'exam_pass_junior', [24, 55], 0.1, '데리고 있던 후배가 시험에 합격했다. 점심을 같이 먹었다.', 'happiness+3 relations+1', '후배 합격'),
    ev('28120', 'audit_error', [26, 58], 0.1, '선배 서명 직전 숫자 하나가 어긋난 것을 발견해 몇 날 밤 재검토했다.', 'health-2 happiness-1 leisure-2', '감사 오류 발견', { dark: true }),
    ch('28120', 'client_pressure', [28, 58], 0.1, '고객사가 의견 문구를 부드럽게 해 달라고 요청했다.', '어떻게 할까?', [
      ['hold', '원칙대로 쓴다', 'intellect+1 happiness+1 relations-2 wealth-1', '고객사 관계가 식었다. 감사 조서는 깨끗했다.'],
      ['adjust', '표현을 조율한다', 'relations+1 wealth+1 happiness-1 fairness+1', '문구를 다듬었다. 다음 계약은 이어졌다.'],
    ], 'hold', '독립성과 관계'),
  ],
  '28130': [
    ev('28130', 'refund_news', [27, 68], 0.12, '고객이 환급을 많이 받았다며 사무실에 간식을 들고 왔다.', 'happiness+3 relations+1', '환급 성과'),
    ev('28130', 'audit_notice', [28, 68], 0.1, '의뢰인에게 세무 조사 통지가 왔다. 며칠 밤 자료를 맞춰 보았다.', 'health-2 happiness-2 leisure-2', '세무 조사 대응', { dark: true }),
    ch('28130', 'new_client_offer', [30, 66], 0.1, '큰 법인 기장 의뢰가 들어왔다. 일은 늘고 수수료도 오른다.', '어떻게 할까?', [
      ['accept', '받는다', 'wealth+3 leisure-2 health-1', '직원 채용이 필요해졌다. 수입이 한 단계 올라갔다.'],
      ['hold', '지금 규모를 지킨다', 'leisure+1 happiness+1 wealth-1', '관리 가능한 범위를 지켰다. 기회는 놓쳤다.'],
    ], 'hold', '사무소 규모'),
  ],
  '28151': [
    ev('28151', 'client_thanks', [26, 56], 0.12, '컨설팅 끝에 고객사의 비용이 줄었다. 임원이 직접 인사했다.', 'happiness+3 intellect+1', '컨설팅 성과'),
    ev('28151', 'travel_streak', [26, 55], 0.14, '출장이 이어져 한 달 중 열흘만 집에서 잤다.', 'health-1 relations-2 leisure-2', '출장 누적', { dark: true }),
    ch('28151', 'poach_call', [30, 55], 0.1, '고객사가 임원급 조건으로 이직을 제안했다.', '어떻게 할까?', [
      ['join', '옮긴다', 'wealth+2 leisure+1 relations-1 happiness-1', '조건은 좋아졌다. 그동안의 동료와 멀어졌다.'],
      ['stay', '남는다', 'relations+1 intellect+1 wealth-1', '프로젝트를 끝까지 마치는 쪽을 택했다.'],
    ], 'stay', '이직 제안'),
  ],
  '28211': [
    ev('28211', 'call_right', [27, 58], 0.1, '내놓은 전망이 적중해 고객사 리포트에 인용됐다.', 'happiness+3 intellect+1', '전망 적중'),
    ev('28211', 'layoff_round', [28, 60], 0.1, '실적이 나빠져 리서치 부서 인력이 줄었다. 팀원이 둘 떠났다.', 'happiness-3 job+4 relations-1', '인력 감축', { dark: true }),
    ch('28211', 'bold_report', [28, 58], 0.1, '대세와 반대되는 의견을 보고서에 쓸지 고민한다.', '어떻게 할까?', [
      ['bold', '소신대로 쓴다', 'intellect+2 relations-1 happiness+1 job+1', '반응이 갈렸다. 몇몇은 논리를 인정했다.'],
      ['safe', '다수 의견에 맞춘다', 'relations+1 happiness-1', '무난히 넘어갔다. 마음에는 걸렸다.'],
    ], 'safe', '보고서 방향'),
  ],
  '28452': [
    ev('28452', 'first_home', [28, 72], 0.12, '첫 집을 구하던 부부가 계약서에 도장을 찍고 환하게 웃었다.', 'happiness+3 wealth+2 relations+1', '계약 성사'),
    ev('28452', 'rule_change', [30, 72], 0.1, '중개 수수료 기준이 바뀌어 한 건당 수입이 줄었다.', 'wealth-2 happiness-1 housing+2', '제도 변경', { dark: true }),
    ch('28452', 'both_wishes', [30, 70], 0.1, '매도인은 높게, 매수인은 낮게를 원한다. 시간만 간다.', '어떻게 조율할까?', [
      ['push', '가격 조정을 권한다', 'wealth+2 relations-1 happiness-1', '거래는 성사됐다. 매도인이 섭섭해했다.'],
      ['wait', '시간을 두고 기다린다', 'happiness+1 wealth-1 leisure-1', '서두르지 않았다. 거래는 한 달 늦어졌다.'],
    ], 'wait', '가격 조율'),
  ],
  '29131': [
    ev('29131', 'scoop_praise', [24, 58], 0.1, '취재한 기사가 사회에 반향을 일으켰다. 데스크가 칭찬을 건넸다.', 'happiness+3 intellect+1', '단독 보도'),
    ev('29131', 'angry_calls', [24, 58], 0.14, '기사에 불만을 품은 독자의 항의 전화가 사흘 이어졌다.', 'happiness-2 health-1 conflict+2', '독자 항의', { dark: true }),
    ch('29131', 'source_ask', [26, 58], 0.1, '취재원이 이름을 감춰 달라고 했다. 기사는 설득력이 약해질 수 있다.', '어떻게 쓸까?', [
      ['protect', '익명으로 쓴다', 'relations+1 happiness+1 intellect-1', '신뢰는 지켰다. 기사의 무게는 줄었다.'],
      ['name', '실명으로 요청한다', 'intellect+1 relations-2', '기사는 단단해졌지만 취재원과 멀어졌다.'],
    ], 'protect', '취재원 보호'),
  ],
  '29141': [
    ev('29141', 'book_credit', [24, 68], 0.1, '번역한 책 표지에 이름이 적혀 나왔다. 서점에서 한참 바라봤다.', 'happiness+3 intellect+1', '출간'),
    ev('29141', 'royalty_gap', [24, 68], 0.12, '번역료만 받고 인세 약속이 지켜지지 않았다.', 'wealth-2 happiness-1 fairness+2', '인세 미지급', { dark: true }),
    ch('29141', 'tough_text', [26, 66], 0.1, '난해한 원고 번역 의뢰가 왔다. 마감은 짧다.', '어떻게 할까?', [
      ['take', '맡는다', 'wealth+2 intellect+2 leisure-2 health-1', '밤낮으로 문장을 다듬었다. 실력이 한 단계 늘었다.'],
      ['pass', '정중히 거절한다', 'leisure+1 wealth-1', '무리하지 않았다. 의뢰는 다른 번역가에게 갔다.'],
    ], 'pass', '의뢰 수락'),
  ],
  '29321': [
    ev('29321', 'audition_pass', [20, 58], 0.1, '최종 오디션에서 이름이 불렸다. 연락을 받고 한동안 말이 안 나왔다.', 'happiness+3 wealth+1', '합격'),
    ev('29321', 'pay_delay', [20, 58], 0.12, '촬영이 끝났는데 출연료 지급이 몇 달째 밀렸다.', 'wealth-2 happiness-2 fairness+2', '출연료 지연', { dark: true }),
    ch('29321', 'agency_deal', [20, 50], 0.09, '큰 소속사가 전속 계약을 제안했다. 활동의 자유는 좁아진다.', '어떻게 할까?', [
      ['sign', '계약한다', 'wealth+2 relations+1 happiness-1 leisure-1', '일정이 안정됐다. 선택권은 줄었다.'],
      ['free', '프리랜서로 남는다', 'happiness+1 wealth-1', '일정은 불안정했다. 하고 싶은 작품을 골랐다.'],
    ], 'free', '전속 제안'),
  ],
  '29380': [
    ev('29380', 'subscriber_milestone', [16, 55], 0.1, '구독자 숫자가 처음으로 큰 고비를 넘겼다. 댓글이 따뜻했다.', 'happiness+3 relations+1', '구독자 성과'),
    ev('29380', 'copyright_claim', [18, 55], 0.1, '영상 일부가 저작권 신고를 받아 수익이 정지됐다.', 'wealth-2 happiness-2 fairness+2', '수익 정지', { dark: true }),
    ch('29380', 'brand_deal', [18, 50], 0.1, '업체가 광고성 영상 제작을 제안했다. 구독자 반응이 걱정된다.', '어떻게 할까?', [
      ['accept', '진행한다', 'wealth+3 relations-1 happiness-1', '수입은 들어왔다. 일부 구독자가 떠났다.'],
      ['decline', '거절한다', 'relations+1 happiness+1 wealth-1', '채널의 결을 지켰다. 수입은 다시 줄었다.'],
    ], 'decline', '광고 제안', { years: [2013, 2060] }),
  ],
  '29431': [
    ev('29431', 'reader_comment', [20, 55], 0.12, '독자가 만화 속 대사를 인용하며 힘이 됐다는 글을 남겼다.', 'happiness+3 relations+1', '독자의 반응'),
    ev('29431', 'assistant_leave', [22, 55], 0.1, '함께 일하던 어시스턴트가 갑자기 그만뒀다. 마감을 혼자 감당했다.', 'health-2 leisure-2 happiness-1', '인력 이탈', { dark: true }),
    ch('29431', 'sequel_ask', [24, 55], 0.1, '연재가 인기를 끌어 연장을 제안받았다. 구상한 결말과 다르다.', '어떻게 할까?', [
      ['extend', '연장한다', 'wealth+3 happiness-1 health-1 leisure-1', '수입은 늘었다. 이야기가 흐려졌다.'],
      ['end', '구상대로 끝낸다', 'happiness+2 intellect+1 wealth-2', '아쉬워하는 독자가 많았다. 마지막 컷에 후회는 없었다.'],
    ], 'end', '연재 연장'),
  ],
  '29461': [
    ev('29461', 'fan_message', [18, 48], 0.12, '팬이 보낸 긴 편지를 읽고 무대에 설 힘이 났다.', 'happiness+3 relations+1', '팬의 응원'),
    ev('29461', 'rumor_wave', [18, 48], 0.1, '근거 없는 소문이 퍼져 활동이 조심스러워졌다.', 'happiness-3 relations-1 health-1', '소문과 악성 댓글', { dark: true }),
    ch('29461', 'self_label', [20, 48], 0.09, '독립해서 직접 음반을 낼 기회가 생겼다. 비용과 책임이 모두 늘어난다.', '어떻게 할까?', [
      ['indie', '독립한다', 'happiness+2 intellect+1 wealth-2 leisure-1', '하고 싶은 음악을 했다. 홍보까지 직접 맡았다.'],
      ['stay', '소속사에 남는다', 'wealth+1 relations+1 happiness-1', '안정적인 기반은 지켰다. 선택권은 좁았다.'],
    ], 'stay', '독립 제안'),
  ],
  '29554': [
    ev('29554', 'user_comment', [23, 55], 0.12, '새 화면을 쓴 이용자가 편해졌다는 후기를 남겼다.', 'happiness+3 intellect+1', '이용자 반응'),
    ev('29554', 'scope_creep', [24, 55], 0.14, '요구 사항이 계속 늘어나 출시 직전 화면을 다시 갈아엎었다.', 'health-1 leisure-3 happiness-1', '요구 변경', { dark: true }),
    ch('29554', 'dev_conflict', [24, 55], 0.1, '개발팀이 일정상 디자인을 줄여야 한다고 한다.', '어떻게 대응할까?', [
      ['hold', '핵심은 지킨다', 'intellect+1 relations-1 conflict+1', '의견이 부딪혔다. 이용자 경험은 지켜졌다.'],
      ['yield', '양보한다', 'relations+1 happiness-1 intellect-1', '출시는 제때였다. 아쉬운 화면이 남았다.'],
    ], 'hold', '협업 갈등'),
  ],
  '29620': [
    ev('29620', 'title_game', [18, 40], 0.1, '결승 경기에서 결정적인 득점으로 팀이 이겼다. 라커룸이 시끌벅적했다.', 'happiness+4 relations+1', '우승'),
    ev('29620', 'salary_cut', [20, 40], 0.1, '부진 끝에 연봉이 깎인 계약서가 도착했다.', 'wealth-2 happiness-2 job+3', '계약 조건 하락', { dark: true }),
    ch('29620', 'transfer_offer', [20, 38], 0.1, '다른 팀에서 이적 제안이 왔다. 지금 팀에는 정이 들었다.', '어떻게 할까?', [
      ['move', '이적한다', 'wealth+2 happiness+1 relations-2', '더 많은 출전 기회를 얻었다. 오랜 동료와 헤어졌다.'],
      ['stay', '잔류한다', 'relations+2 wealth-1 happiness+1', '팀을 지켰다. 출전은 보장되지 않았다.'],
    ], 'stay', '이적 제안'),
  ],
  '29640': [
    ev('29640', 'member_before_after', [21, 55], 0.12, '꾸준히 오던 회원이 달라진 몸 사진을 보여 주며 고맙다고 했다.', 'happiness+3 relations+1', '회원의 변화'),
    ev('29640', 'freelance_cancel', [21, 55], 0.14, '당일 취소가 이어져 한 달 수업이 비었다. 보충 수업은 불가능했다.', 'wealth-2 happiness-1 job+2', '수업 취소', { dark: true }),
    ch('29640', 'brand_pt', [24, 52], 0.1, '센터가 단가를 낮추는 대신 회원을 더 보내겠다고 제안했다.', '어떻게 할까?', [
      ['accept', '받아들인다', 'wealth+1 health-2 leisure-2', '수업 수가 늘어 몸이 지쳤다. 단가는 내려갔다.'],
      ['hold', '단가를 지킨다', 'happiness+1 wealth-1', '시간은 지켰다. 회원 수는 늘지 않았다.'],
    ], 'hold', '수업 단가'),
  ],
  '29701': [
    ev('29701', 'regular_praise', [28, 62], 0.12, '단골이 새 손님을 데려와 이 집 국물이 최고라고 했다.', 'happiness+3 wealth+1 relations+1', '단골의 칭찬'),
    ev('29701', 'long_hours', [28, 62], 0.14, '성수기에 일손이 부족해 몇 달째 쉬는 날이 없었다.', 'health-2 leisure-3 happiness-1', '장시간 조리', { dark: true }),
    ch('29701', 'menu_change', [30, 62], 0.1, '새 메뉴를 시험해 보고 싶다. 기존 단골은 익숙한 맛을 원한다.', '어떻게 할까?', [
      ['new', '새 메뉴를 낸다', 'intellect+1 happiness+1 wealth-1 relations-1', '반응은 갈렸다. 젊은 손님이 늘었다.'],
      ['classic', '기존 메뉴를 지킨다', 'relations+1 wealth+1 intellect-1', '단골이 안심했다. 새로움은 없었다.'],
    ], 'classic', '메뉴 개편'),
  ],
};
