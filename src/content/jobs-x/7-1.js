import { X, E, tr, ev, ch } from '../jobs-kit.js';
export default [
  X('78310', {
    entry: [
      E('hire', { minEdu: 'high', ages: [18, 55], p: 0.4, text: '조공으로 들어가 흙손과 모르타르 개는 법부터 배웠다.' }),
      E('self', { minEdu: 'high', ages: [32, 60], p: 0.08, text: '팀을 꾸려 미장 단가를 직접 받는 오야지가 되었다.' }),
    ],
    transitions: [tr('78342', [25, 55], 4, 0.04, '타일 시공으로 넓힘'), tr('78361', [25, 58], 4, 0.03, '도장 쪽으로 이동'), tr('78391', [35, 62], 6, 0.04, '건물 수리로 전환')],
    events: [
      ev('78310', 'hand_skill', [22, 60], 0.12, '벽면이 거울처럼 펴졌다. 감독이 다음 현장에도 오라고 했다.', 'happiness+2 relations+1 job+1', '솜씨 인정'),
      ev('78310', 'dust_cough', [30, 65], 0.12, '시멘트 가루가 쌓여 기침이 길어졌다. 며칠 쉬었다.', 'health-3 medical+2', '분진 노출', { dark: true }),
      ch('78310', 'machine_plaster', [28, 62], 0.11, '기계 미장이 늘어 손으로 바르는 일감이 줄었다.', '어떻게 할까?', [
        ['learn', '기계를 배운다', 'intellect+2 leisure-2 wealth+1', '분사기를 익혔다. 단가는 낮아도 일감이 이어졌다.'],
        ['hand', '손 마감에 집중', 'happiness+2 wealth-2 job+1', '고급 마감만 골라 받았다. 일이 들쭉날쭉했다.'],
      ], 'learn', '기계화 변화'),
      ev('78310', 'rain_idle', [20, 65], 0.1, '장마철 내내 일이 끊겨 일당 없이 버텼다.', 'wealth-3 leisure+1 living+1', '우천 공치는 날', { dark: true }),
    ],
    hazard: 2, burnout: 0.06,
  }),
  X('78320', {
    entry: [
      E('hire', { minEdu: 'high', ages: [18, 55], p: 0.4, text: '옥상 방수 현장에 보조로 들어가 토치 다루는 법을 배웠다.' }),
      E('self', { minEdu: 'high', ages: [30, 60], p: 0.08, text: '방수 전문 업체를 열어 하도급을 받았다.' }),
    ],
    transitions: [tr('78330', [25, 58], 4, 0.04, '단열 시공으로 이동'), tr('78391', [30, 62], 5, 0.05, '건물 수리로 전환'), tr('78310', [22, 50], 3, 0.03, '미장으로 이동')],
    events: [
      ev('78320', 'leak_callback', [24, 62], 0.13, '시공한 지하 벽에서 물이 샌다고 연락이 와 다시 갔다.', 'happiness-1 job-1 leisure-1', '하자 보수', { dark: true }),
      ev('78320', 'good_review', [24, 62], 0.11, '장마가 지나도 새지 않았다며 집주인이 음료를 건넸다.', 'happiness+2 relations+1', '시공 인정'),
      ch('78320', 'torch_season', [22, 60], 0.11, '여름 옥상 현장은 단가가 높지만 바닥이 뜨겁다.', '일을 받을까?', [
        ['take', '받는다', 'wealth+3 health-3', '일당을 더 받았다. 며칠은 몸이 무거웠다.'],
        ['skip', '다른 현장', 'health+1 wealth-1 relations-1', '쉬운 현장을 골랐다. 소개해 준 이에게 미안했다.'],
      ], 'take', '옥상 방수 성수기'),
      ev('78320', 'fume_smell', [25, 65], 0.1, '밀폐된 지하에서 도료 냄새에 머리가 아파 일찍 나왔다.', 'health-2 medical+1', '환기 부족', { dark: true }),
    ],
    hazard: 2, burnout: 0.05,
  }),
  X('78342', {
    entry: [
      E('hire', { minEdu: 'high', ages: [18, 55], p: 0.4, text: '타일 팀에서 줄눈을 넣고 자재를 나르며 눈썰미를 키웠다.' }),
      E('self', { minEdu: 'high', ages: [30, 60], p: 0.1, text: '타일 시공 사무실을 차려 단가 계약을 맺었다.' }),
    ],
    transitions: [tr('78343', [26, 58], 4, 0.04, '대리석 시공으로 이동'), tr('78349', [25, 58], 3, 0.05, '바닥재 시공으로 이동'), tr('78391', [35, 62], 6, 0.04, '건물 수리로 전환')],
    events: [
      ev('78342', 'bathroom_perfect', [24, 62], 0.12, '욕실 줄눈이 한 치도 어긋나지 않았다. 집주인이 사진을 찍어 갔다.', 'happiness+2 relations+1', '솜씨 인정'),
      ev('78342', 'knee_pain', [32, 65], 0.13, '무릎을 꿇고 하는 일이라 연골이 아프다. 병원에 갔다.', 'health-3 medical+2 wealth-1', '무릎 관절', { dark: true }),
      ch('78342', 'big_order', [28, 60], 0.1, '대형 상가 타일 물량이 들어왔다. 기한이 빠듯하다.', '어떻게 받을까?', [
        ['team', '팀을 늘린다', 'wealth+3 relations-1 leisure-2', '사람을 불러 기한을 맞췄다. 관리가 힘들었다.'],
        ['alone', '혼자 천천히', 'happiness+1 wealth-1 job-1', '작은 일만 하며 마감 품질을 지켰다.'],
      ], 'team', '대형 물량'),
      ev('78342', 'unpaid_balance', [28, 62], 0.1, '시공을 끝냈는데 잔금을 두 달째 못 받았다.', 'wealth-3 fairness+2 happiness-2', '잔금 지연', { dark: true }),
    ],
    hazard: 1, burnout: 0.05,
  }),
  X('78361', {
    entry: [
      E('hire', { minEdu: 'high', ages: [18, 55], p: 0.4, text: '도장 팀에서 퍼티와 사포질로 일을 시작했다.' }),
      E('self', { minEdu: 'high', ages: [30, 62], p: 0.1, text: '도장 전문 가게를 열어 아파트 재도장 일을 받았다.' }),
    ],
    transitions: [tr('78369', [22, 58], 3, 0.04, '건축 도장으로 이동'), tr('78351', [26, 58], 4, 0.04, '도배·마감으로 이동'), tr('75104', [20, 45], 3, 0.02, '차량 도장으로 이동')],
    events: [
      ev('78361', 'repaint_season', [22, 62], 0.13, '아파트 재도장 철이라 몇 달 치 일감이 몰렸다.', 'wealth+3 leisure-2', '재도장 성수기'),
      ev('78361', 'gondola_wind', [24, 60], 0.12, '곤돌라에 매달려 도장하다 강풍에 작업이 중단되었다.', 'happiness-1 wealth-2 job+1', '고소 작업 중단', { dark: true }),
      ch('78361', 'solvent_choice', [24, 62], 0.1, '유성 도료가 싸지만 냄새가 심하다.', '어떤 도료를 쓸까?', [
        ['oil', '유성 도료', 'wealth+2 health-3', '마진이 남았다. 머리가 자주 아팠다.'],
        ['water', '수성 도료', 'health+1 wealth-2 relations+1', '냄새가 덜했다. 건조가 오래 걸려 일정이 밀렸다.'],
      ], 'water', '도료 선택'),
      ev('78361', 'color_pick', [24, 65], 0.1, '고객이 직접 고른 색이 의외로 잘 어울려 칭찬을 받았다.', 'happiness+2 relations+1', '색 매칭'),
    ],
    hazard: 2, burnout: 0.05,
  }),
  X('78341', {
    entry: [
      E('hire', { minEdu: 'high', ages: [18, 55], p: 0.4, text: '마루 시공 팀에서 재단과 접착제 바르는 일부터 배웠다.' }),
      E('self', { minEdu: 'high', ages: [28, 60], p: 0.1, text: '마루 시공 사무실을 열고 입주 청소 업체와 제휴했다.' }),
    ],
    transitions: [tr('78349', [22, 58], 3, 0.05, '바닥재 시공으로 이동'), tr('78244', [24, 58], 4, 0.04, '내장 목공으로 이동'), tr('78391', [32, 62], 5, 0.04, '건물 수리로 전환')],
    events: [
      ev('78341', 'move_in_rush', [22, 62], 0.12, '입주 전 마루 시공이 몰려 주말도 현장에 나갔다.', 'wealth+3 leisure-3', '입주 시즌'),
      ev('78341', 'noise_complaint', [24, 62], 0.12, '재단 소음에 윗집 민원이 들어와 시간을 줄였다.', 'happiness-2 conflict+2 wealth-1', '층간 민원', { dark: true }),
      ch('78341', 'material_swap', [26, 60], 0.1, '고객이 합판 마루를 원목이라고 알고 계약했다.', '어떻게 말할까?', [
        ['tell', '사실대로 설명', 'relations-1 happiness+2 wealth-2', '계약이 줄었지만 마음은 편했다.'],
        ['quiet', '그냥 시공', 'wealth+2 happiness-2 conflict+2', '넘어갔지만 찜찜했다.'],
      ], 'tell', '재료 설명'),
      ev('78341', 'back_strain', [30, 65], 0.1, '허리를 숙이는 일이 이어져 파스를 붙이고 일했다.', 'health-2 medical+1', '허리 부담', { dark: true }),
    ],
    hazard: 1, burnout: 0.05,
  }),
  X('78352', {
    entry: [
      E('hire', { minEdu: 'high', ages: [18, 55], p: 0.35, text: '유리 시공 팀에서 흡착기를 들고 현장을 다녔다.' }),
      E('self', { minEdu: 'high', ages: [30, 60], p: 0.1, text: '유리 가게를 열어 시공과 수리를 같이 받았다.' }),
    ],
    transitions: [tr('78370', [24, 58], 3, 0.05, '새시 시공으로 이동'), tr('78391', [32, 62], 5, 0.04, '건물 수리로 전환'), tr('79992', [30, 62], 5, 0.03, '유리 관련 일로 이동')],
    events: [
      ev('78352', 'big_glass', [24, 60], 0.12, '대형 유리를 크레인으로 올려 한 번에 끼웠다.', 'happiness+2 intellect+1', '대형 시공 성공'),
      ev('78352', 'cut_scare', [22, 62], 0.12, '유리 조각에 손을 베어 며칠 쉬었다.', 'health-3 wealth-2 medical+1', '자상', { dark: true }),
      ch('78352', 'night_call', [28, 62], 0.1, '가게 유리가 깨졌다며 한밤에 급한 연락이 왔다.', '나갈까?', [
        ['go', '바로 나간다', 'wealth+2 relations+1 health-2', '긴급 출장비를 받고 단골이 늘었다.'],
        ['morning', '아침에 간다', 'health+1 wealth-1 relations-1', '푹 잤지만 손님이 다른 데를 불렀다.'],
      ], 'go', '야간 긴급 출동'),
      ev('78352', 'glazing_regulation', [26, 64], 0.09, '안전유리 규격이 바뀌어 자재 단가가 올랐다.', 'wealth-2 job+1', '자재 단가', { dark: true }),
    ],
    hazard: 2, burnout: 0.05,
  }),
  X('78370', {
    entry: [
      E('hire', { minEdu: 'high', ages: [18, 55], p: 0.4, text: '새시 공장에서 가공을 배우고 현장 설치로 넘어갔다.' }),
      E('self', { minEdu: 'high', ages: [28, 60], p: 0.1, text: '새시 교체 전문 가게를 차렸다.' }),
    ],
    transitions: [tr('78352', [22, 58], 3, 0.04, '유리 시공으로 이동'), tr('78330', [25, 58], 4, 0.04, '단열 시공으로 이동'), tr('78391', [32, 62], 5, 0.05, '건물 수리로 전환')],
    events: [
      ev('78370', 'energy_subsidy', [26, 62], 0.12, '단열 새시 교체 지원이 나와 신청 물량이 몰렸다.', 'wealth+3 leisure-2', '교체 수요', { years: [2010, 2060] }),
      ev('78370', 'high_floor', [24, 60], 0.11, '고층에서 새시를 안전줄에 의지해 달았다. 다리가 후들거렸다.', 'health-2 happiness-1', '고소 설치', { dark: true }),
      ch('78370', 'cheap_rival', [28, 62], 0.1, '저가로 받는 업체가 생겨 견적이 밀렸다.', '어떻게 할까?', [
        ['quality', '품질로 승부', 'happiness+1 wealth-2 relations+1', '단가는 지켰고 단골이 남았다.'],
        ['cut', '단가를 낮춘다', 'wealth+2 happiness-2 leisure-1', '일감은 늘었지만 마진이 얇았다.'],
      ], 'quality', '저가 경쟁'),
      ev('78370', 'caulk_comment', [25, 65], 0.09, '틈 마감이 깔끔하다고 소개가 이어졌다.', 'relations+2 wealth+1', '입소문'),
    ],
    hazard: 2, burnout: 0.05,
  }),
  X('78391', {
    entry: [
      E('hire', { minEdu: 'high', ages: [20, 60], p: 0.35, text: '아파트 관리 업체 수리 기사로 입사해 여러 일을 맡았다.' }),
      E('self', { minEdu: 'high', ages: [32, 62], p: 0.12, text: '집수리 사무실을 열고 동네 일을 받았다.' }),
      E('promote', { from: ['78310', '78342', '78361'], minYears: 5, ages: [30, 60], p: 0.12, text: '여러 공정을 익힌 끝에 집수리 전문으로 자리 잡았다.' }),
    ],
    transitions: [tr('78399', [30, 62], 4, 0.04, '마감 일 전반으로 이동'), tr('79290', [28, 60], 4, 0.04, '배관 일로 이동'), tr('76229', [26, 58], 4, 0.02, '내선 전기로 이동')],
    events: [
      ev('78391', 'old_house_rep', [28, 65], 0.12, '낡은 빌라 수리 의뢰가 이어졌다. 어르신 집에서 차를 얻어 마셨다.', 'happiness+2 relations+2', '단골 어르신'),
      ev('78391', 'many_jobs', [28, 62], 0.12, '하루에 세 집을 돌며 도배·수전·전등을 고쳤다. 저녁에 말이 안 나왔다.', 'health-2 leisure-2 wealth+1', '다잡 수리'),
      ch('78391', 'quote_dispute', [30, 64], 0.11, '고객이 견적에 없던 추가 공사를 요구한다.', '어떻게 할까?', [
        ['extra', '추가 비용을 받는다', 'wealth+2 relations-2 conflict+1', '비용을 청구했다. 고객이 기분이 상했다.'],
        ['free', '서비스로 한다', 'relations+2 wealth-2 leisure-1', '그냥 해 줬다. 다음 소개가 이어졌다.'],
      ], 'extra', '추가 공사'),
      ev('78391', 'slow_season', [30, 66], 0.1, '연말에는 전화가 거의 오지 않았다. 통장 잔고만 봤다.', 'wealth-3 happiness-1 living+1', '비수기', { dark: true }),
    ],
    hazard: 1, burnout: 0.05,
  }),
  X('78330', {
    entry: [
      E('hire', { minEdu: 'high', ages: [18, 55], p: 0.4, text: '단열재 시공 팀에서 재단과 압착 접착을 배웠다.' }),
      E('self', { minEdu: 'high', ages: [30, 60], p: 0.08, text: '단열 시공 업체를 열어 하도급 팀을 꾸렸다.' }),
    ],
    transitions: [tr('78320', [24, 58], 3, 0.04, '방수 시공으로 이동'), tr('78370', [24, 58], 3, 0.04, '새시 시공으로 이동'), tr('78391', [32, 62], 5, 0.04, '건물 수리로 전환')],
    events: [
      ev('78330', 'itchy_fiber', [22, 62], 0.12, '단열재 섬유가 팔에 붙어 하루 종일 따가웠다.', 'health-2 happiness-1', '섬유 접촉', { dark: true }),
      ev('78330', 'green_remodel', [26, 62], 0.11, '에너지 절감 리모델링 사업이 늘어 일감이 안정되었다.', 'wealth+3 job+1', '단열 수요', { years: [2010, 2060] }),
      ch('78330', 'mask_choice', [24, 62], 0.1, '보호구가 답답해 벗고 일하는 동료들이 있다.', '어떻게 할까?', [
        ['wear', '끝까지 착용', 'health+1 leisure-1 relations-1', '답답했지만 밤에 기침이 줄었다.'],
        ['loose', '벗고 일한다', 'happiness+1 health-3', '일은 편했다. 저녁에 목이 칼칼했다.'],
      ], 'wear', '보호구 착용'),
      ev('78330', 'roof_heat', [22, 60], 0.1, '한여름 지붕 아래 열기에 일이 늘어졌다.', 'health-2 leisure-1', '여름 현장', { dark: true }),
    ],
    hazard: 2, burnout: 0.05,
  }),
  X('78223', {
    entry: [
      E('hire', { minEdu: 'high', ages: [18, 55], p: 0.45, text: '타설 팀 막내로 들어가 바이브레이터를 잡았다.' }),
      E('promote', { from: ['78243', '78210'], minYears: 3, ages: [24, 55], p: 0.08, text: '현장을 돌다 타설 반장 밑으로 옮겼다.' }),
    ],
    transitions: [tr('78243', [22, 55], 3, 0.04, '형틀 목공으로 이동'), tr('78210', [26, 58], 4, 0.04, '건설 기능 일반으로'), tr('78293', [24, 58], 3, 0.03, '해체 일로 이동')],
    events: [
      ev('78223', 'night_pour', [20, 58], 0.14, '대형 슬라브 타설이 밤까지 이어졌다. 양생 시간을 지켜봤다.', 'health-2 wealth+2 leisure-2', '밤샘 타설'),
      ev('78223', 'pump_pipe', [20, 58], 0.1, '펌프 배관이 막혀 작업이 한참 멈췄다.', 'happiness-1 wealth-1 conflict+1', '배관 막힘', { dark: true }),
      ch('78223', 'overtime_offer', [22, 58], 0.12, '타설이 길어져 연장 수당 이야기가 나왔다.', '남을까?', [
        ['stay', '남아서 마감', 'wealth+3 health-3', '수당을 챙겼다. 집에 가자마자 쓰러져 잤다.'],
        ['leave', '정시 퇴근', 'health+1 relations+1 wealth-2', '약속을 지켰다. 반장 표정이 굳었다.'],
      ], 'stay', '연장 수당'),
      ev('78223', 'good_surface', [24, 60], 0.09, '거푸집을 뗐더니 표면이 매끈하게 나와 현장소장이 칭찬했다.', 'happiness+2 relations+1', '표면 품질'),
    ],
    hazard: 2, burnout: 0.06,
  }),
];
