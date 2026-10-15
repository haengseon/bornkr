import { X, E, tr, ev, ch } from '../jobs-kit.js';

export default [
  X('42310', {
    entry: [
      E('hire', { minEdu: 'high', ages: [30, 70], p: 0.3, era: [1985, null], text: '노인복지관 일자리에 채용돼 어르신 돌봄을 맡았다.' }),
      E('hire', { minEdu: 'none', ages: [35, 70], p: 0.25, era: [2008, null], text: '주간보호센터에 들어가 어르신 송영과 돌봄을 시작했다.' }),
    ],
    transitions: [
      tr('42210', [35, 68], 2, 0.05, '요양보호사로 이동'),
      tr('42320', [35, 68], 3, 0.03, '장애인 돌봄으로 이동'),
      tr('25391', [40, 66], 4, 0.02, '복지시설 생활 지도로'),
    ],
    events: [
      ev('42310', 'song_class', [30, 70], 0.14, '어르신들과 노래 교실을 열었다. 오랜만에 큰 웃음이 터졌다.', 'happiness+3 relations+1', '프로그램 호응'),
      ev('42310', 'pickup_shift', [30, 70], 0.13, '송영 차량 운행에 기록 업무까지 겹쳐 퇴근이 늦어졌다.', 'health-2 leisure-2 job+2', '송영·기록 업무', { dark: true, who: 'wage' }),
      ch('42310', 'wandering', [30, 70], 0.1, '산책 중 어르신 한 분이 대열에서 멀어졌다.', '어떻게 할까?', [
        ['follow', '곁에 붙는다', 'happiness+2 leisure-1 relations+1', '손을 잡고 걸었다. 어르신이 곧 안정을 찾았다.'],
        ['rule', '동선을 정한다', 'intellect+1 happiness-1', '산책 동선과 인원 점검표를 새로 만들었다. 번거로워졌다.'],
      ], 'follow', '산책 중 이탈'),
      ev('42310', 'family_visit', [30, 70], 0.1, '어르신 가족이 찾아와 고맙다며 손을 오래 잡았다.', 'happiness+3 relations+2', '가족의 감사', { once: true }),
    ],
    hazard: 1, burnout: 0.07,
  }),

  X('43110', {
    entry: [
      E('license', { license: 'tech', minEdu: 'high', ages: [18, 50], p: 0.7, years: 1, text: '이용사 자격을 따서 이발관 조수로 들어갔다.' }),
      E('self', { license: 'tech', minEdu: 'high', ages: [28, 62], p: 0.2, text: '오래된 이발소 자리를 얻어 간판을 새로 달았다.' }),
    ],
    transitions: [
      tr('43120', [22, 50], 2, 0.05, '미용실로 이동'),
      tr('94201', [55, 74], 3, 0.04, '아파트 경비로 이동'),
    ],
    events: [
      ev('43110', 'regulars', [20, 75], 0.15, '이십 년 넘은 단골이 오늘도 같은 머리를 부탁했다.', 'happiness+3 relations+2', '단골 손님'),
      ev('43110', 'young_leave', [25, 75], 0.12, '손님이 대부분 어르신이라 젊은 층은 발길이 뜸하다.', 'wealth-2 happiness-1 job+2', '손님층 노령화', { dark: true, who: 'self' }),
      ch('43110', 'new_style', [22, 60], 0.1, '젊은 손님이 요즘 머리 모양을 부탁했다.', '어떻게 할까?', [
        ['learn', '새로 배운다', 'intellect+2 wealth+1 leisure-2', '밤에 영상을 보며 가위질을 익혔다. 손님이 조금 늘었다.'],
        ['stay', '하던 대로 한다', 'happiness+1 wealth-1', '아는 솜씨로 정성껏 잘랐다. 그 손님은 다시 오지 않았다.'],
      ], 'learn', '새 유행'),
      ev('43110', 'razor_cut', [20, 75], 0.1, '면도 중 손이 미끄러져 손님 턱에 작은 상처를 냈다.', 'happiness-2 relations-1', '작업 중 실수', { dark: true }),
    ],
    hazard: 1, burnout: 0.05,
  }),

  X('43142', {
    entry: [
      E('hire', { minEdu: 'high', ages: [20, 50], p: 0.3, era: [1990, null], text: '관리실 채용 공고를 보고 들어가 마사지 기술을 익혔다.' }),
      E('self', { minEdu: 'high', ages: [28, 58], p: 0.1, era: [1990, null], text: '모은 돈으로 작은 체형 관리실을 열었다.' }),
    ],
    transitions: [
      tr('43141', [25, 54], 2, 0.04, '피부 관리로 이동'),
      tr('43149', [25, 56], 2, 0.04, '피부·체형 관리로'),
      tr('45311', [28, 56], 3, 0.02, '서비스업 다른 일로'),
    ],
    events: [
      ev('43142', 'wrist_pain', [20, 58], 0.14, '하루 열 명 넘게 시술하자 손목과 어깨가 저렸다.', 'health-3 leisure-1', '반복 동작 부담', { dark: true }),
      ev('43142', 'before_after', [22, 58], 0.12, '관리를 마친 손님이 달라진 몸선을 보고 크게 만족했다.', 'happiness+3 relations+1', '솜씨 인정'),
      ch('43142', 'quota', [22, 55], 0.11, '지점에서 회원권 판매 목표를 올렸다.', '어떻게 할까?', [
        ['push', '적극 권한다', 'wealth+2 relations-2 happiness-1', '수당은 올랐지만 손님과 서먹해진 느낌이다.'],
        ['honest', '필요한 만큼만', 'happiness+1 wealth-2 relations+1', '판매는 줄었다. 단골은 마음 편히 다녔다.'],
      ], 'honest', '판매 목표', { who: 'wage' }),
      ev('43142', 'closing_shop', [25, 62], 0.1, '근처에 큰 관리 업체가 들어서 예약이 줄었다.', 'wealth-3 happiness-1 job+3', '경쟁 업체', { dark: true, who: 'self' }),
    ],
    hazard: 1, burnout: 0.06,
  }),

  X('43143', {
    entry: [
      E('hire', { minEdu: 'none', ages: [28, 68], p: 0.35, text: '목욕탕 일손 구인에 지원해 때밀이 일을 배웠다.' }),
      E('self', { minEdu: 'none', ages: [35, 66], p: 0.1, text: '동네 목욕탕 세신 자리를 계약해 직접 운영했다.' }),
    ],
    transitions: [
      tr('43141', [30, 56], 3, 0.03, '피부 관리로 이동'),
      tr('43149', [30, 58], 3, 0.03, '관리 종사로 이동'),
      tr('94201', [55, 72], 2, 0.03, '건물 관리 일로'),
    ],
    events: [
      ev('43143', 'steam_cough', [28, 72], 0.13, '하루 종일 뜨거운 김 속에 있어 숨이 차고 어지러웠다.', 'health-3 leisure-1', '고온 다습한 작업장', { dark: true }),
      ev('43143', 'tip_regular', [28, 72], 0.14, '단골 손님이 명절이라며 수고비를 넉넉히 놓고 갔다.', 'wealth+2 happiness+2', '단골의 인사'),
      ch('43143', 'bathhouse_close', [30, 72], 0.1, '동네 목욕탕이 낡아 문 닫을 거라는 소문이 돌았다.', '어떻게 할까?', [
        ['move', '다른 곳을 알아본다', 'wealth-1 relations-1 leisure-1', '근처 대형 사우나에 이력서를 냈다. 낯선 곳이라 어색했다.'],
        ['wait', '끝까지 남는다', 'relations+1 happiness+1 wealth-2', '남은 단골들과 마지막 날까지 자리를 지켰다.'],
      ], 'move', '목욕탕 폐업설'),
      ev('43143', 'slip_fall', [28, 72], 0.1, '젖은 바닥에 미끄러져 허리를 다쳐 며칠 쉬었다.', 'health-3 wealth-1', '미끄러운 작업 환경', { dark: true }),
    ],
    hazard: 2, burnout: 0.06,
  }),

  X('43149', {
    entry: [
      E('hire', { minEdu: 'high', ages: [20, 56], p: 0.3, era: [1990, null], text: '관리 센터에 입사해 피부와 체형 관리를 함께 배웠다.' }),
      E('self', { minEdu: 'high', ages: [28, 58], p: 0.1, era: [1990, null], text: '작은 샵을 얻어 피부·체형 관리를 시작했다.' }),
    ],
    transitions: [
      tr('43141', [25, 56], 2, 0.05, '피부 관리로 이동'),
      tr('43142', [25, 56], 2, 0.04, '체형 관리로 이동'),
      tr('43192', [30, 60], 4, 0.02, '이미지 컨설팅으로'),
    ],
    events: [
      ev('43149', 'package_sale', [22, 56], 0.13, '관리 패키지 결제를 마친 손님이 후기를 남겨 주었다.', 'wealth+2 happiness+2', '손님 후기'),
      ev('43149', 'complaint', [22, 56], 0.12, '관리 후 붉어진 피부로 항의하는 손님을 한참 응대했다.', 'happiness-3 relations-1 conflict+2', '항의 응대', { dark: true }),
      ch('43149', 'equipment', [24, 58], 0.1, '새 관리 기기를 들이자는 제안이 왔다.', '어떻게 할까?', [
        ['buy', '할부로 들인다', 'wealth+2 leisure-1 intellect+1 debt+1500', '기기 덕에 메뉴가 늘었다. 달마다 갚을 돈도 생겼다.'],
        ['hold', '손기술로 간다', 'happiness+1 wealth-1 intellect+1', '기존 관리에 집중했다. 손님은 그대로였다.'],
      ], 'hold', '신규 기기 도입', { who: 'self' }),
      ev('43149', 'long_standing', [24, 60], 0.1, '개업 후 처음 만난 손님이 지금도 매달 찾아온다.', 'happiness+2 relations+2', '오랜 단골', { once: true }),
    ],
    hazard: 1, burnout: 0.06,
  }),

  X('43151', {
    entry: [
      E('license', { license: 'tech', minEdu: 'high', ages: [18, 46], p: 0.5, years: 1, era: [1985, null], text: '메이크업 자격을 따서 숍 어시스턴트로 들어갔다.' }),
      E('self', { license: 'tech', minEdu: 'high', ages: [26, 52], p: 0.15, era: [1985, null], text: '독립해 웨딩과 촬영 현장을 직접 뛰기 시작했다.' }),
    ],
    transitions: [
      tr('43120', [24, 50], 2, 0.04, '미용실로 이동'),
      tr('43153', [25, 54], 3, 0.04, '분장 일로 이동'),
      tr('43192', [30, 58], 5, 0.03, '이미지 컨설팅으로'),
    ],
    events: [
      ev('43151', 'dawn_call', [20, 55], 0.14, '새벽 네 시에 신부 숍에 나가 첫 손님을 맞았다.', 'health-2 leisure-2', '새벽 출장 작업', { dark: true }),
      ev('43151', 'bride_thanks', [22, 56], 0.13, '신부가 사진을 보내며 가장 예뻤다고 고마워했다.', 'happiness+3 relations+1', '손님의 감사'),
      ch('43151', 'late_pay', [22, 56], 0.1, '촬영팀이 두 달째 작업비 입금을 미루고 있다.', '어떻게 할까?', [
        ['press', '정식으로 요구한다', 'wealth+2 relations-2 conflict+2', '독촉 끝에 받았다. 다음 의뢰는 끊겼을지 모른다.'],
        ['wait', '조금 더 기다린다', 'relations+1 wealth-2 happiness-1', '관계는 지켰지만 이달 생활비가 빠듯했다.'],
      ], 'press', '작업비 지연', { who: 'self', dark: true }),
      ev('43151', 'portfolio', [20, 50], 0.1, '포트폴리오를 보고 큰 현장에서 함께 일하자고 연락이 왔다.', 'wealth+2 intellect+1 happiness+2', '솜씨 인정', { once: true }),
    ],
    hazard: 1, burnout: 0.06,
  }),

  X('43152', {
    entry: [
      E('hire', { minEdu: 'high', ages: [20, 46], p: 0.3, era: [1990, null], text: '분장 학원을 거쳐 제작 현장 분장팀에 합류했다.' }),
      E('self', { minEdu: 'high', ages: [26, 52], p: 0.2, era: [1990, null], text: '프리랜서로 영화와 공연 분장을 맡아 뛰었다.' }),
    ],
    transitions: [
      tr('43153', [24, 52], 2, 0.05, '분장사로 이동'),
      tr('43151', [24, 50], 2, 0.04, '메이크업으로 이동'),
      tr('43120', [26, 52], 3, 0.02, '미용실로 이동'),
    ],
    events: [
      ev('43152', 'long_shoot', [20, 52], 0.14, '촬영이 이틀째 이어져 분장 도구를 들고 현장을 오갔다.', 'health-2 leisure-2', '촬영 연장', { dark: true }),
      ev('43152', 'prop_praise', [22, 52], 0.12, '만든 분장이 화면에 크게 잡혀 감독이 칭찬했다.', 'happiness+3 intellect+1', '솜씨 인정'),
      ch('43152', 'low_fee', [22, 54], 0.11, '예산이 부족한 작품이 낮은 단가로 참여를 부탁했다.', '어떻게 할까?', [
        ['join', '경력으로 삼는다', 'intellect+2 wealth-2 relations+1', '돈은 적었지만 팀 사람들과 인연이 생겼다.'],
        ['pass', '정중히 거절한다', 'wealth+1 happiness-1', '다른 일정에 집중했다. 그 팀과는 소원해졌다.'],
      ], 'pass', '낮은 단가 제안', { who: 'self' }),
      ev('43152', 'allergy', [20, 52], 0.1, '새 재료에 피부가 부어올라 며칠 작업을 쉬었다.', 'health-2 wealth-1', '재료 알레르기', { dark: true }),
    ],
    hazard: 1, burnout: 0.06,
  }),

  X('43153', {
    entry: [
      E('hire', { minEdu: 'high', ages: [20, 50], p: 0.3, text: '방송·공연 현장에서 분장 보조로 일을 배웠다.' }),
      E('self', { minEdu: 'high', ages: [28, 58], p: 0.15, text: '극단 분장을 맡아 프리랜서로 일했다.' }),
    ],
    transitions: [
      tr('43152', [24, 52], 2, 0.05, '특수 분장으로 이동'),
      tr('43151', [24, 52], 2, 0.04, '메이크업으로 이동'),
      tr('26462', [35, 62], 8, 0.02, '분장 강사로'),
    ],
    events: [
      ev('43153', 'dress_rehearsal', [20, 58], 0.14, '공연 전날 리허설까지 분장을 고치느라 밤을 넘겼다.', 'health-2 leisure-2', '리허설 야근', { dark: true }),
      ev('43153', 'curtain_call', [20, 62], 0.13, '무대가 끝나고 배우들이 분장팀을 불러 함께 인사했다.', 'happiness+3 relations+2', '동료의 인정'),
      ch('43153', 'season_gap', [24, 60], 0.11, '공연이 끝나고 다음 일감이 잡히지 않았다.', '어떻게 할까?', [
        ['side', '다른 일을 겸한다', 'wealth+2 leisure-2 happiness-1', '낮에는 다른 일을 했다. 생활비는 메워졌다.'],
        ['wait', '연락을 기다린다', 'leisure+2 wealth-2 relations+1', '쉬면서 아는 팀에 인사를 돌렸다. 한동안 수입이 비었다.'],
      ], 'side', '일감 공백', { who: 'self', dark: true }),
      ev('43153', 'make_mentor', [28, 60], 0.1, '선배 분장사가 쓰던 붓 세트를 물려주었다.', 'happiness+2 intellect+1', '선배의 인정', { once: true }),
    ],
    hazard: 1, burnout: 0.05,
  }),

  X('42111', {
    entry: [
      E('hire', { license: 'care', minEdu: 'high', ages: [20, 55], p: 0.3, era: [1990, null], text: '유치원에 보조 교사로 채용돼 담임과 반을 꾸렸다.' }),
    ],
    transitions: [
      tr('25100', [24, 54], 2, 0.05, '어린이집 교사로 이동'),
      tr('25200', [26, 56], 3, 0.03, '교사 쪽으로 이동'),
      tr('42191', [26, 58], 3, 0.03, '방문 돌봄으로 이동'),
    ],
    events: [
      ev('42111', 'first_words', [20, 58], 0.14, '말이 늦던 아이가 처음으로 이름을 불러 주었다.', 'happiness+3', '아이의 변화'),
      ev('42111', 'sick_season', [20, 58], 0.14, '독감이 돈 철에 반 아이들 사이에서 감기가 옮아 왔다.', 'health-2 leisure-1', '아이들 감염병', { dark: true }),
      ch('42111', 'parent_request', [22, 58], 0.11, '학부모가 보조 교사에게 따로 사진과 알림을 부탁했다.', '어떻게 할까?', [
        ['accept', '요청에 응한다', 'relations+2 leisure-2 happiness-1', '퇴근 후에도 연락을 받았다. 학부모는 만족했다.'],
        ['route', '담임 교사를 통한다', 'leisure+1 relations-1', '절차를 따랐다. 학부모는 조금 서운해했다.'],
      ], 'route', '학부모 요청'),
      ev('42111', 'contract_end', [20, 58], 0.1, '학기 단위 계약이라 다음 학기 채용 여부를 기다렸다.', 'happiness-2 wealth-1 job+3', '계약 불안정', { dark: true, who: 'wage' }),
    ],
    hazard: 1, burnout: 0.07,
  }),

  X('42112', {
    entry: [
      E('hire', { minEdu: 'high', ages: [22, 60], p: 0.25, era: [2000, null], text: '학교에 교육 실무원으로 채용돼 교사를 도왔다.' }),
      E('hire', { license: 'care', minEdu: 'high', ages: [25, 62], p: 0.15, era: [2004, null], text: '특수학급 보조 인력으로 일을 시작했다.' }),
    ],
    transitions: [
      tr('42113', [26, 60], 2, 0.05, '학교 돌봄으로 이동'),
      tr('25200', [26, 56], 3, 0.03, '교사 쪽으로 이동'),
      tr('42320', [30, 62], 3, 0.03, '장애인 돌봄으로 이동'),
    ],
    events: [
      ev('42112', 'class_help', [22, 62], 0.14, '수업 보조 중 한 학생이 처음으로 문제를 끝까지 풀었다.', 'happiness+3 intellect+1', '학생의 성장'),
      ev('42112', 'vacation_pay', [22, 62], 0.13, '방학 동안 급여가 끊겨 달마다 살림을 줄였다.', 'wealth-3 happiness-1 job+2', '방학 중 무급', { dark: true, who: 'wage' }),
      ch('42112', 'extra_task', [22, 62], 0.11, '행정 서류 정리가 보조 업무에 슬쩍 얹혔다.', '어떻게 할까?', [
        ['take', '그냥 맡는다', 'relations+1 leisure-2 health-1', '서류를 정리하느라 점심을 거른 날이 많았다.'],
        ['ask', '업무 범위를 묻는다', 'happiness+1 relations-2 conflict+2', '범위를 묻자 분위기가 서먹했다. 서류는 줄었다.'],
      ], 'take', '업무 범위', { dark: true }),
      ev('42112', 'graduation_note', [24, 64], 0.1, '졸업식에서 학생이 쓴 짧은 감사 쪽지를 받았다.', 'happiness+3 relations+1', '학생의 감사', { once: true }),
    ],
    hazard: 1, burnout: 0.06,
  }),

  X('42120', {
    entry: [
      E('hire', { license: 'care', minEdu: 'high', ages: [20, 60], p: 0.3, text: '어린이집에 보조 인력으로 들어가 영유아를 돌보기 시작했다.' }),
      E('hire', { minEdu: 'none', ages: [25, 62], p: 0.2, text: '보육 시설 일손 구인을 보고 급식과 청소를 도우며 일했다.' }),
    ],
    transitions: [
      tr('25100', [24, 56], 2, 0.05, '어린이집 교사로 이동'),
      tr('42191', [26, 60], 3, 0.03, '방문 돌봄으로 이동'),
      tr('95120', [28, 62], 2, 0.03, '육아 도우미로 이동'),
    ],
    events: [
      ev('42120', 'nap_time', [20, 62], 0.14, '낮잠 시간이 끝나고 아이들이 하나둘 품으로 파고들었다.', 'happiness+3', '아이들과 지낸 하루'),
      ev('42120', 'lifting_kids', [20, 62], 0.13, '아이들을 안고 내리느라 허리와 무릎이 계속 무거웠다.', 'health-3 leisure-1', '영유아 안기 부담', { dark: true }),
      ch('42120', 'pickup_late', [22, 62], 0.11, '늦게 오는 학부모를 기다리느라 퇴근이 늦어졌다.', '어떻게 할까?', [
        ['wait', '끝까지 돌본다', 'relations+2 leisure-2 health-1', '아이와 함께 기다렸다. 학부모가 연신 고마워했다.'],
        ['rule', '규정을 안내한다', 'leisure+1 relations-2 conflict+2', '시간을 지켜 달라고 말했다. 어색한 분위기가 남았다.'],
      ], 'wait', '늦은 귀가'),
      ev('42120', 'accident_report', [20, 62], 0.1, '아이가 놀다 넘어져 사고 보고서와 학부모 연락이 길게 이어졌다.', 'happiness-2 conflict+2', '사고 후 응대', { dark: true }),
    ],
    hazard: 1, burnout: 0.07,
  }),

  X('42902', {
    entry: [
      E('hire', { minEdu: 'high', ages: [20, 56], p: 0.3, era: [1990, null], text: '재활센터에 보조 인력으로 들어가 치료를 거들었다.' }),
    ],
    transitions: [
      tr('42909', [24, 58], 2, 0.05, '보건 서비스로 이동'),
      tr('42210', [30, 64], 3, 0.03, '요양보호사로 이동'),
      tr('42320', [30, 64], 3, 0.03, '장애인 돌봄으로 이동'),
    ],
    events: [
      ev('42902', 'first_step', [20, 62], 0.14, '재활 중인 환자가 보조기 없이 몇 걸음을 처음 걸었다.', 'happiness+3 relations+1', '환자의 회복'),
      ev('42902', 'transfer_strain', [20, 62], 0.13, '환자를 옮기고 부축하는 일이 겹쳐 허리가 뻐근했다.', 'health-3 leisure-1', '환자 이송 부담', { dark: true }),
      ch('42902', 'certificate_course', [22, 58], 0.1, '치료사 자격 과정을 들어 보자는 이야기가 나왔다.', '어떻게 할까?', [
        ['study', '야간 과정을 듣는다', 'intellect+3 leisure-3 health-1 debt+800', '일하며 공부하느라 주말이 사라졌다.'],
        ['stay', '지금 일에 집중한다', 'happiness+1 intellect-1', '익숙한 일을 이어 갔다. 승진 기회는 멀어졌다.'],
      ], 'study', '자격 과정'),
      ev('42902', 'short_staff', [20, 62], 0.1, '인력이 줄어 보조 한 명이 환자 여럿을 오가며 돌았다.', 'health-2 happiness-1 job+3', '인력 감축', { dark: true, who: 'wage' }),
    ],
    hazard: 1, burnout: 0.07,
  }),

  X('43311', {
    entry: [
      E('license', { license: 'care', minEdu: '2yr', ages: [20, 56], p: 0.6, years: 1, era: [2022, null], text: '동물 보건사 자격을 따서 동물병원에 채용됐다.' }),
    ],
    transitions: [
      tr('43319', [22, 54], 2, 0.04, '수의사 보조로 이동'),
      tr('43331', [24, 54], 2, 0.03, '반려동물 미용으로'),
      tr('43321', [24, 54], 3, 0.03, '반려동물 훈련으로'),
    ],
    events: [
      ev('43311', 'recovery', [22, 58], 0.14, '입원했던 강아지가 건강하게 돌아가는 모습을 보았다.', 'happiness+3 relations+1', '치료 후 회복', { years: [2022, 2100] }),
      ev('43311', 'night_ward', [22, 58], 0.13, '입원 환자 곁을 지키느라 야간 당직이 이어졌다.', 'health-2 leisure-2', '야간 당직', { dark: true, years: [2022, 2100] }),
      ch('43311', 'owner_request', [22, 58], 0.11, '보호자가 진료비를 두고 치료 범위를 줄여 달라고 했다.', '어떻게 할까?', [
        ['explain', '자세히 설명한다', 'relations+1 happiness-1 leisure-1', '시간이 길어졌다. 보호자는 결국 이해해 주었다.'],
        ['refer', '수의사에게 넘긴다', 'happiness+1 relations-1', '역할을 지켰다. 보호자는 설명을 더 듣고 싶어 했다.'],
      ], 'explain', '진료비 상담', { years: [2022, 2100] }),
      ev('43311', 'bite_scratch', [22, 58], 0.1, '예민한 고양이에게 팔을 긁혀 소독받고 근무를 이었다.', 'health-2', '동물 접촉 부상', { dark: true, years: [2022, 2100] }),
    ],
    hazard: 1, burnout: 0.06,
  }),

  X('43319', {
    entry: [
      E('hire', { minEdu: 'high', ages: [19, 55], p: 0.3, era: [1990, null], text: '동물병원 접수와 보조로 일하며 진료를 곁에서 배웠다.' }),
    ],
    transitions: [
      tr('43311', [22, 54], 2, 0.04, '동물 보건 분야로'),
      tr('43331', [22, 54], 2, 0.04, '반려동물 미용으로'),
      tr('43339', [22, 56], 2, 0.03, '반려동물 관리로'),
    ],
    events: [
      ev('43319', 'rescue_case', [19, 58], 0.14, '버려진 새끼 고양이가 치료를 마치고 입양 가정을 찾았다.', 'happiness+3 relations+1', '치료 후 입양'),
      ev('43319', 'overtime_clinic', [19, 58], 0.13, '응급 환자가 몰려 병원이 밤늦도록 불이 꺼지지 않았다.', 'health-2 leisure-2', '응급 진료 연장', { dark: true }),
      ch('43319', 'vet_scold', [20, 58], 0.11, '수술 준비가 늦어졌다며 원장이 큰소리를 냈다.', '어떻게 할까?', [
        ['quiet', '조용히 넘긴다', 'happiness-2 relations+1', '준비 순서를 다시 적어 두고 일을 이어 갔다.'],
        ['speak', '사정을 설명한다', 'relations-1 conflict+2 happiness+1', '이유를 말하자 원장이 조금 누그러졌다. 분위기는 어색했다.'],
      ], 'quiet', '직장 내 갈등', { dark: true, who: 'wage' }),
      ev('43319', 'regular_owner', [20, 60], 0.1, '단골 보호자가 간식을 들고 와 늘 고맙다고 말했다.', 'happiness+2 relations+2', '보호자의 감사'),
    ],
    hazard: 1, burnout: 0.06,
  }),

  X('43321', {
    entry: [
      E('hire', { minEdu: 'high', ages: [20, 56], p: 0.3, era: [2000, null], text: '훈련소에서 보조로 일하다 훈련사 일을 배웠다.' }),
      E('self', { minEdu: 'high', ages: [25, 58], p: 0.15, era: [2005, null], text: '출장 훈련으로 반려견 교육을 직접 시작했다.' }),
    ],
    transitions: [
      tr('43322', [26, 56], 3, 0.04, '행동 상담으로 이동'),
      tr('43331', [24, 54], 2, 0.03, '반려동물 미용으로'),
      tr('43339', [24, 56], 2, 0.03, '반려동물 관리로'),
    ],
    events: [
      ev('43321', 'dog_manners', [20, 58], 0.14, '짖음이 심하던 개가 몇 주 만에 신호를 알아들었다.', 'happiness+3 intellect+1', '훈련 성과'),
      ev('43321', 'owner_blame', [20, 58], 0.13, '보호자가 개의 문제를 훈련사 탓으로 돌려 말다툼이 났다.', 'happiness-3 conflict+2', '보호자 갈등', { dark: true }),
      ch('43321', 'bite_case', [22, 58], 0.11, '공격성이 높은 개의 훈련 의뢰가 들어왔다.', '어떻게 할까?', [
        ['accept', '맡아서 해 본다', 'wealth+2 health-2 intellect+1', '조심하며 훈련했다. 손에 상처가 몇 개 남았다.'],
        ['refer', '전문가를 연결한다', 'happiness+1 wealth-1 relations+1', '더 잘 맞는 전문가를 소개했다. 의뢰비는 놓쳤다.'],
      ], 'refer', '위험한 의뢰'),
      ev('43321', 'lesson_cancel', [22, 60], 0.1, '한겨울이라 출장 수업이 연이어 취소돼 수입이 줄었다.', 'wealth-3 happiness-1', '비수기 취소', { dark: true, who: 'self' }),
    ],
    hazard: 1, burnout: 0.06,
  }),

  X('43322', {
    entry: [
      E('hire', { minEdu: 'high', ages: [22, 58], p: 0.3, era: [2012, null], text: '동물병원과 훈련소 경험을 살려 행동 상담을 시작했다.' }),
      E('self', { minEdu: 'high', ages: [27, 60], p: 0.2, era: [2012, null], text: '온라인 상담과 방문 상담을 직접 열었다.' }),
    ],
    transitions: [
      tr('43321', [24, 56], 2, 0.04, '반려동물 훈련으로'),
      tr('43339', [24, 58], 2, 0.03, '반려동물 관리로'),
      tr('26462', [35, 64], 6, 0.02, '반려동물 강사로'),
    ],
    events: [
      ev('43322', 'anxious_dog', [22, 60], 0.14, '분리불안으로 짖던 개의 하루가 상담 뒤 조금씩 조용해졌다.', 'happiness+3 relations+1', '상담 성과', { years: [2012, 2100] }),
      ev('43322', 'online_review', [22, 60], 0.12, '온라인에 부정적인 후기가 올라와 문의가 눈에 띄게 줄었다.', 'wealth-2 happiness-2', '악성 후기', { dark: true, who: 'self', years: [2012, 2100] }),
      ch('43322', 'fee_dispute', [23, 60], 0.11, '보호자가 상담 후 결과가 없다며 환불을 요구했다.', '어떻게 할까?', [
        ['refund', '환불해 준다', 'wealth-2 happiness+1', '돈을 돌려주고 마음의 짐을 덜었다.'],
        ['explain', '경과를 설명한다', 'intellect+1 happiness-1 conflict+2', '기록을 보여 주며 설득했다. 감정은 풀리지 않았다.'],
      ], 'explain', '상담 환불', { dark: true, years: [2012, 2100] }),
      ev('43322', 'case_study', [24, 62], 0.1, '비슷한 사례가 모여 상담 매뉴얼을 새로 정리했다.', 'intellect+3 happiness+1', '상담 노하우', { years: [2012, 2100] }),
    ],
    hazard: 1, burnout: 0.06,
  }),

  X('43339', {
    entry: [
      E('hire', { minEdu: 'high', ages: [19, 58], p: 0.3, era: [1990, null], text: '반려동물 호텔과 카페에 채용돼 동물을 돌봤다.' }),
      E('self', { minEdu: 'high', ages: [25, 60], p: 0.1, era: [1995, null], text: '작은 반려동물 돌봄 가게를 직접 열었다.' }),
    ],
    transitions: [
      tr('43331', [22, 54], 2, 0.04, '반려동물 미용으로'),
      tr('43321', [22, 54], 2, 0.03, '반려동물 훈련으로'),
      tr('43319', [22, 54], 2, 0.03, '수의사 보조로 이동'),
    ],
    events: [
      ev('43339', 'long_stay', [19, 60], 0.14, '휴가철 맡겨진 강아지가 돌아가는 날 꼬리를 흔들며 안겼다.', 'happiness+3 relations+1', '돌봄 보람'),
      ev('43339', 'holiday_rush', [19, 60], 0.13, '연휴에 돌봄 예약이 몰려 쉬지 못하고 사료를 나르며 지냈다.', 'health-2 leisure-3', '연휴 근무', { dark: true }),
      ch('43339', 'sick_pet', [20, 60], 0.11, '맡은 동물이 밤새 상태가 나빠져 보호자 연락을 고민했다.', '어떻게 할까?', [
        ['call', '바로 연락한다', 'relations+1 happiness-2', '새벽에 연락했다. 보호자는 놀랐지만 곧 병원에 갔다.'],
        ['vet', '병원부터 간다', 'health-2 leisure-1 happiness+1', '직접 동물병원에 데려갔다. 보호자에게는 나중에 알렸다.'],
      ], 'call', '돌봄 중 위급 상황'),
      ev('43339', 'insurance_claim', [22, 62], 0.1, '돌보던 동물이 다치자 책임 소재와 보상을 두고 다퉜다.', 'wealth-3 conflict+3 happiness-2', '배상 분쟁', { dark: true, who: 'self' }),
    ],
    hazard: 1, burnout: 0.06,
  }),

  X('41220', {
    entry: [
      E('hire', { minEdu: 'high', ages: [20, 55], p: 0.2, era: [1962, null], text: '공공기관 청원경찰로 선발돼 청사 경비를 맡았다.' }),
    ],
    transitions: [
      tr('41231', [35, 64], 3, 0.04, '시설 경비로 이동'),
      tr('41240', [35, 62], 3, 0.04, '보안 관제로 이동'),
      tr('41112', [24, 38], 2, 0.01, '경찰 공채로 이동'),
    ],
    events: [
      ev('41220', 'gate_check', [22, 60], 0.14, '청사 출입 통제 중 방문객 안내를 밝게 마쳤다는 칭찬을 들었다.', 'happiness+2 relations+1', '민원인 응대'),
      ev('41220', 'angry_visitor', [22, 60], 0.13, '민원이 풀리지 않은 방문객이 정문에서 크게 소리쳤다.', 'happiness-3 health-1 conflict+2', '민원 항의 응대', { dark: true }),
      ch('41220', 'night_duty_swap', [22, 62], 0.11, '야간 숙직 조에서 교대를 바꿔 달라는 부탁이 왔다.', '어떻게 할까?', [
        ['swap', '바꿔 준다', 'relations+2 leisure-2 health-1', '대신 숙직을 섰다. 동료가 고마워하며 다음엔 도와줬다.'],
        ['decline', '정중히 거절한다', 'leisure+1 relations-1', '가족 일정이 있어 거절했다. 동료가 조금 서운해했다.'],
      ], 'decline', '교대 부탁'),
      ev('41220', 'retire_notice', [50, 64], 0.1, '정년이 가까워 오며 용역 전환 이야기가 들려왔다.', 'happiness-2 wealth-1 job+3', '정년·용역 전환', { dark: true, who: 'wage' }),
    ],
    hazard: 1, burnout: 0.05,
  }),

  X('41233', {
    entry: [
      E('hire', { minEdu: 'high', ages: [22, 60], p: 0.3, era: [1981, null], text: '경비 업체에 채용돼 기계 경비 관제와 출동을 맡았다.' }),
    ],
    transitions: [
      tr('41240', [26, 60], 2, 0.05, '보안 관제로 이동'),
      tr('41231', [30, 66], 2, 0.04, '시설 경비로 이동'),
      tr('41299', [28, 58], 3, 0.03, '보안 종사로 이동'),
    ],
    events: [
      ev('41233', 'false_alarm', [22, 62], 0.14, '오작동 경보가 한 밤에 세 번 울려 같은 건물을 거듭 찾았다.', 'health-1 leisure-2 happiness-1', '오작동 출동', { dark: true }),
      ev('41233', 'cat_and_door', [22, 62], 0.12, '출동 중 잠긴 문 앞 어르신을 도와 무사히 들어가게 했다.', 'happiness+3 relations+1', '출동 후 감사'),
      ch('41233', 'night_dispatch', [22, 60], 0.11, '심야 출동 대기 조가 겹쳐 쉬는 날이 줄 위기다.', '어떻게 할까?', [
        ['take', '수당을 받고 선다', 'wealth+2 health-2 leisure-2', '수당이 늘었지만 잠이 모자랐다.'],
        ['rest', '휴무를 지킨다', 'leisure+2 wealth-1 relations-1', '쉬었다. 팀에는 미안한 마음이 남았다.'],
      ], 'rest', '심야 출동 대기'),
      ev('41233', 'sensor_change', [22, 62], 0.1, '새 센서와 원격 관제가 들어와 출동 건수가 줄었다.', 'intellect+1 happiness-1 tech+3', '무인 경비 확대', { dark: true, years: [2000, 2100] }),
    ],
    hazard: 1, burnout: 0.06,
  }),

  X('41240', {
    entry: [
      E('hire', { minEdu: 'high', ages: [22, 62], p: 0.3, era: [1985, null], text: '보안 업체 관제센터에 채용돼 화면 앞 근무를 시작했다.' }),
    ],
    transitions: [
      tr('41233', [26, 60], 2, 0.04, '기계 경비로 이동'),
      tr('41231', [35, 68], 2, 0.04, '시설 경비로 이동'),
      tr('15303', [40, 62], 5, 0.03, '보안 관리로 이동'),
    ],
    events: [
      ev('41240', 'monitor_eyes', [22, 66], 0.14, '여덟 시간 화면을 지켜보며 눈이 침침하고 어깨가 굳었다.', 'health-2 leisure-1', '장시간 화면 근무', { dark: true }),
      ev('41240', 'caught_early', [22, 66], 0.12, '화면에서 이상 징후를 먼저 알아채 큰 사고를 막았다.', 'happiness+3 intellect+1', '관제 성과'),
      ch('41240', 'night_only', [22, 66], 0.11, '야간 전담으로 옮기면 수당이 오른다는 제안이 왔다.', '어떻게 할까?', [
        ['night', '야간을 맡는다', 'wealth+2 health-3 relations-1', '월급은 늘었지만 낮 시간이 사라졌다.'],
        ['day', '주간을 유지한다', 'health+1 wealth-1 relations+1', '수입은 그대로지만 생활 리듬을 지켰다.'],
      ], 'day', '야간 수당 제안', { who: 'wage' }),
      ev('41240', 'ai_camera', [24, 66], 0.1, '영상 분석 도입으로 관제 인력을 줄인다는 공지가 났다.', 'happiness-2 job+4 tech+3', '인력 감축·자동화', { dark: true, who: 'wage', years: [2018, 2100] }),
    ],
    hazard: 1, burnout: 0.06,
  }),

  X('41292', {
    entry: [
      E('hire', { minEdu: 'high', ages: [25, 68], p: 0.3, era: [1980, null], text: '지자체 위탁 업체에 채용돼 주차 단속원이 됐다.' }),
    ],
    transitions: [
      tr('41231', [35, 68], 2, 0.04, '시설 경비로 이동'),
      tr('41291', [30, 66], 2, 0.04, '매장 감시로 이동'),
      tr('94201', [55, 74], 2, 0.03, '아파트 경비로 이동'),
    ],
    events: [
      ev('41292', 'driver_angry', [25, 70], 0.14, '단속 스티커를 붙이자 운전자가 욕설을 하며 따라왔다.', 'happiness-3 health-1 conflict+3', '단속 항의', { dark: true }),
      ev('41292', 'thank_you', [25, 70], 0.11, '길을 막던 차를 치우자 지나던 시민이 고맙다고 인사했다.', 'happiness+2 relations+1', '시민의 인사'),
      ch('41292', 'quota_press', [25, 68], 0.11, '구역별 단속 건수 목표가 윗선에서 내려왔다.', '어떻게 할까?', [
        ['follow', '목표를 채운다', 'wealth+1 happiness-2 conflict+2', '실적은 맞췄지만 민원이 쌓였다.'],
        ['flex', '계도 위주로 간다', 'relations+1 wealth-1 happiness+1', '경고와 안내를 앞세웠다. 실적 평가는 낮았다.'],
      ], 'flex', '단속 목표', { who: 'wage' }),
      ev('41292', 'summer_heat', [25, 70], 0.1, '폭염 속 골목을 돌며 하루 종일 땀에 젖었다.', 'health-3 leisure-1', '폭염 근무', { dark: true }),
    ],
    hazard: 1, burnout: 0.06,
  }),

  X('41210', {
    entry: [
      E('hire', { minEdu: 'high', ages: [22, 52], p: 0.2, era: [1965, null], text: '경호 업체 교육을 마치고 수행 경호원으로 채용됐다.' }),
      E('self', { minEdu: 'high', ages: [30, 58], p: 0.08, text: '경호 인력 소개로 개별 계약을 맺어 일했다.' }),
    ],
    transitions: [
      tr('41299', [28, 58], 3, 0.04, '보안 종사로 이동'),
      tr('41233', [28, 56], 3, 0.03, '기계 경비로 이동'),
      tr('41231', [40, 66], 3, 0.03, '시설 경비로 이동'),
    ],
    events: [
      ev('41210', 'event_detail', [22, 56], 0.14, '대형 행사 경호를 사고 없이 마치고 팀 인사를 들었다.', 'happiness+3 relations+1', '행사 경호 성공'),
      ev('41210', 'long_stand', [22, 56], 0.13, '열 시간 넘게 서 있느라 무릎과 허리가 굳었다.', 'health-3 leisure-1', '장시간 서서 근무', { dark: true }),
      ch('41210', 'client_ask', [24, 58], 0.11, '고객이 계약에 없는 개인 심부름을 맡기려 했다.', '어떻게 할까?', [
        ['accept', '들어 준다', 'wealth+1 relations+1 happiness-2', '심부름을 하고 팁을 받았다. 선이 흐려졌다.'],
        ['refuse', '계약대로 거절한다', 'happiness+1 relations-2 wealth-1', '업무 범위를 말했다. 고객이 불쾌해했다.'],
      ], 'refuse', '계약 밖 요청', { dark: true }),
      ev('41210', 'quiet_season', [24, 60], 0.1, '행사가 줄어 몇 달째 일정이 비어 수입이 불안했다.', 'wealth-3 happiness-1 job+2', '일감 감소', { dark: true }),
    ],
    hazard: 2, burnout: 0.06,
  }),

  X('41299', {
    entry: [
      E('hire', { minEdu: 'high', ages: [22, 62], p: 0.3, text: '보안 업체에 입사해 행사·시설 안전 요원으로 일했다.' }),
    ],
    transitions: [
      tr('41240', [26, 62], 2, 0.04, '보안 관제로 이동'),
      tr('41231', [35, 68], 2, 0.04, '시설 경비로 이동'),
      tr('41210', [26, 52], 3, 0.03, '경호원으로 이동'),
    ],
    events: [
      ev('41299', 'festival_duty', [22, 62], 0.14, '축제 인파 속 질서를 지켜 무사히 마쳤다는 격려를 받았다.', 'happiness+3 relations+1', '행사 안전 관리'),
      ev('41299', 'shift_cut', [22, 64], 0.13, '용역 단가가 깎여 근무 인원과 수당이 함께 줄었다.', 'wealth-3 happiness-1 job+3', '용역 단가 인하', { dark: true, who: 'wage' }),
      ch('41299', 'drunk_visitor', [22, 62], 0.11, '술에 취한 방문객이 출입을 막자 실랑이를 벌였다.', '어떻게 할까?', [
        ['calm', '차분히 달랜다', 'happiness+1 health-1 leisure-1', '시간을 들여 달랬다. 마지막에는 돌아갔다.'],
        ['call', '관할에 연락한다', 'relations-1 happiness+1', '규정대로 신고했다. 현장은 곧 정리됐다.'],
      ], 'calm', '취객 응대'),
      ev('41299', 'holiday_shift', [22, 64], 0.1, '명절 연휴 근무조에 이름이 올라 가족 모임에 빠졌다.', 'happiness-2 leisure-2 relations-1', '명절 근무', { dark: true }),
    ],
    hazard: 1, burnout: 0.06,
  }),

  X('41234', {
    entry: [
      E('hire', { minEdu: 'high', ages: [24, 64], p: 0.2, era: [1976, null], text: '특수 경비 교육을 마치고 중요 시설에 배치됐다.' }),
    ],
    transitions: [
      tr('41231', [35, 68], 2, 0.05, '시설 경비로 이동'),
      tr('41240', [30, 64], 2, 0.04, '보안 관제로 이동'),
      tr('41232', [28, 60], 2, 0.03, '호송 경비로 이동'),
    ],
    events: [
      ev('41234', 'drill_good', [24, 64], 0.13, '합동 훈련에서 대응이 빨랐다는 평가를 받고 포상을 받았다.', 'happiness+3 intellect+1', '훈련 성과'),
      ev('41234', 'tension_duty', [24, 64], 0.14, '긴장을 풀 수 없는 근무가 이어져 잠이 얕아졌다.', 'health-2 happiness-2 leisure-1', '장시간 긴장', { dark: true }),
      ch('41234', 'post_rotate', [24, 62], 0.11, '배치 시설이 바뀌어 근무지가 멀어진다는 통보가 왔다.', '어떻게 할까?', [
        ['move', '새 근무지로 간다', 'wealth+1 leisure-2 relations-1', '출퇴근이 길어졌다. 수당은 조금 올랐다.'],
        ['keep', '희망 근무지를 낸다', 'leisure+1 wealth-1 happiness+1', '가까운 곳을 요청했다. 승진 평가는 느려졌다.'],
      ], 'move', '근무지 이동', { who: 'wage' }),
      ev('41234', 'contract_swap', [24, 64], 0.1, '경비 용역 계약이 바뀌며 인원 조정 이야기가 나왔다.', 'happiness-2 wealth-1 job+3', '용역 교체', { dark: true, who: 'wage' }),
    ],
    hazard: 1, burnout: 0.06,
  }),

  X('43231', {
    entry: [
      E('hire', { minEdu: 'high', ages: [24, 62], p: 0.3, era: [1990, null], text: '장례식장 상담실에 채용돼 유족 안내를 맡았다.' }),
      E('self', { minEdu: 'high', ages: [30, 64], p: 0.1, era: [1990, null], text: '작은 상조 사무실을 열어 상담을 직접 맡았다.' }),
    ],
    transitions: [
      tr('43232', [26, 62], 2, 0.05, '장례 지도로 이동'),
      tr('43212', [28, 56], 3, 0.02, '혼례 상담으로 이동'),
      tr('25391', [38, 64], 4, 0.02, '복지시설 생활 지도로'),
    ],
    events: [
      ev('43231', 'family_thanks', [24, 66], 0.13, '장례를 마친 유족이 상담해 줘서 마음이 놓였다고 말했다.', 'happiness+3 relations+1', '유족의 감사'),
      ev('43231', 'price_dispute', [24, 66], 0.13, '장례 비용 항목을 두고 유족과 설명이 길어졌다.', 'happiness-2 conflict+2', '비용 갈등', { dark: true }),
      ch('43231', 'package_push', [26, 64], 0.11, '실적 압박으로 고급 장례 상품을 권하라는 지시가 내려왔다.', '어떻게 할까?', [
        ['push', '권한다', 'wealth+2 happiness-2 relations-1', '실적은 올랐다. 마음 한편이 무거웠다.'],
        ['fit', '형편에 맞게 안내한다', 'relations+2 wealth-1 happiness+1', '필요한 만큼만 설명했다. 평가는 낮아졌다.'],
      ], 'fit', '상품 권유', { who: 'wage' }),
      ev('43231', 'back_to_back', [24, 66], 0.1, '상담이 이어져 점심과 저녁을 건너뛴 채 사흘을 보냈다.', 'health-2 leisure-2', '연속 상담', { dark: true }),
    ],
    hazard: 0, burnout: 0.06,
  }),
];
