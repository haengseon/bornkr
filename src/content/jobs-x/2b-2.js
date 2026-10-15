import { X, E, tr, ev, ch } from '../jobs-kit.js';
export default [
  X('28113', {
    entry: [E('hire', { minEdu: '4yr', ages: [26, 50], p: 0.3, era: [1995, null], text: '인사 업무 경력을 살려 헤드헌팅 회사에 들어갔다.' }), E('self', { minEdu: '4yr', ages: [34, 58], p: 0.1, text: '인맥을 바탕으로 1인 서치펌을 열었다.' })],
    transitions: [tr('28111', [32, 55], 4, 0.03, '인사 부서로 이동'), tr('28151', [34, 58], 6, 0.03, '컨설턴트로'), tr('28312', [30, 50], 3, 0.02, '마케팅으로')],
    events: [
      ev('28113', 'placement_fee', [28, 60], 0.14, '추천한 후보자가 최종 합격해 성공 보수가 들어왔다.', 'wealth+3 happiness+2', '성사 보수'),
      ev('28113', 'search_cancelled', [28, 60], 0.12, '몇 주 공들인 채용이 기업 사정으로 취소됐다. 이번 달 수입이 비었다.', 'wealth-2 happiness-2 job+2', '채용 취소', { dark: true }),
      ch('28113', 'poach_request', [30, 58], 0.1, '고객사가 경쟁사의 핵심 인력을 데려와 달라고 했다.', '어떻게 할까?', [
        ['try', '접촉해 본다', 'wealth+2 relations-1 conflict+1', '성사됐지만 업계 평판이 마음에 걸렸다.'],
        ['decline', '정중히 거절한다', 'relations+1 wealth-1 happiness+1', '수입은 놓쳤다. 신뢰는 지켰다.'],
      ], 'decline', '인력 스카우트 요청'),
      ev('28113', 'candidate_drop', [28, 60], 0.12, '입사 하루 전 후보자가 마음을 바꿨다. 고객사에 사과 전화를 돌렸다.', 'happiness-2 relations-1', '입사 포기', { dark: true }),
    ],
    hazard: 0, burnout: 0.06,
  }),
  X('28436', {
    entry: [E('hire', { minEdu: '4yr', majors: ['med', 'sci', 'soc'], ages: [24, 45], p: 0.4, text: '제약사 영업직에 입사해 병원 담당을 맡았다.' })],
    transitions: [tr('28312', [30, 50], 4, 0.03, '마케팅으로 이동'), tr('28433', [30, 52], 4, 0.03, '의료장비 영업으로'), tr('52111', [35, 55], 6, 0.01, '자영 창업으로')],
    events: [
      ev('28436', 'doctor_meeting', [24, 58], 0.14, '대기실에서 반나절을 기다린 끝에 담당 의사와 짧게 인사했다.', 'leisure-1 relations+1', '병원 방문'),
      ev('28436', 'quota_miss', [26, 58], 0.12, '분기 목표를 채우지 못했다. 실적 면담에서 말수가 줄었다.', 'happiness-2 job+3 wealth-1', '실적 압박', { dark: true }),
      ch('28436', 'rebate_hint', [28, 58], 0.1, '거래처에서 은근히 선물을 곁들인 접대를 바라는 눈치다.', '어떻게 할까?', [
        ['clean', '정해진 선에서만 한다', 'happiness+1 relations-1 wealth-1', '실적은 더뎠다. 규정은 지켰다.'],
        ['bend', '관행을 따른다', 'wealth+1 relations+1 fairness+2 happiness-1', '계약은 이어졌지만 마음 한구석이 불편했다.'],
      ], 'clean', '접대 관행'),
      ev('28436', 'regulation_change', [28, 60], 0.1, '영업 활동 규정이 바뀌어 방문 방식이 달라졌다.', 'job+2 tech+1', '제도 변화', { dark: true }),
    ],
    hazard: 0, burnout: 0.06,
  }),
  X('28250', {
    entry: [E('license', { license: 'acct', minEdu: '4yr', ages: [27, 58], p: 0.35, years: 1, text: '손해사정사 시험에 합격해 사정 법인에서 일을 시작했다.' }), E('promote', { from: ['28292'], minYears: 6, ages: [32, 58], p: 0.08, text: '보험사 심사 경력을 살려 손해사정사로 개업했다.' })],
    transitions: [tr('28292', [30, 55], 4, 0.03, '보험사 심사로'), tr('28151', [38, 62], 6, 0.02, '자문 업무로'), tr('27220', [40, 62], 5, 0.02, '행정사로 이동')],
    events: [
      ev('28250', 'fair_adjustment', [28, 65], 0.14, '양쪽 입장을 정리한 사정 보고서로 분쟁이 합의됐다.', 'happiness+2 intellect+1', '합의 성사'),
      ev('28250', 'angry_claimant', [28, 65], 0.12, '보험금이 기대에 못 미친 가입자가 고성으로 항의했다.', 'happiness-2 conflict+2 health-1', '감정 노동', { dark: true }),
      ch('28250', 'commission_pressure', [30, 62], 0.1, '의뢰 보험사가 서둘러 마무리하라고 재촉한다.', '어떻게 할까?', [
        ['rush', '일정에 맞춘다', 'wealth+1 happiness-1 fairness+1', '기한은 지켰다. 서류가 허술하다는 생각이 남았다.'],
        ['detail', '확인을 끝까지 한다', 'intellect+1 relations-1 wealth-1', '기한을 넘겨 의뢰인에게 눈총을 받았다.'],
      ], 'detail', '속도와 정확성'),
      ev('28250', 'field_visit', [28, 62], 0.1, '사고 현장 확인과 서류 작성으로 하루 종일 이동했다.', 'health-1 leisure-1', '현장 조사'),
    ],
    hazard: 0, burnout: 0.05,
  }),
  X('29111', {
    entry: [E('hire', { minEdu: '4yr', majors: ['hum', 'art'], ages: [22, 40], p: 0.2, text: '방송사 공모전과 보조 작가 일을 거쳐 작가가 됐다.' }), E('self', { minEdu: 'none', ages: [24, 50], p: 0.15, text: '대본 공모에 당선돼 자유 작가로 일을 시작했다.' })],
    transitions: [tr('29112', [30, 58], 4, 0.03, '문학 쪽으로'), tr('29122', [30, 58], 4, 0.03, '편집으로 이동'), tr('28331', [30, 55], 4, 0.02, '광고 기획으로')],
    events: [
      ev('29111', 'script_greenlit', [24, 62], 0.12, '기획안이 편성 회의를 통과했다. 오랜만에 기분이 가벼웠다.', 'happiness+3 wealth+1 relations+1', '편성 확정'),
      ev('29111', 'canceled_early', [24, 62], 0.12, '시청률이 낮아 작품이 조기 종영됐다. 잔여 원고료가 줄었다.', 'wealth-2 happiness-2 job+3', '조기 종영', { dark: true }),
      ch('29111', 'rewrite_demand', [26, 60], 0.12, '제작사가 결말을 통째로 바꾸자고 했다.', '어떻게 대응할까?', [
        ['rewrite', '요구대로 고친다', 'wealth+1 relations+1 intellect-1 happiness-1', '대본은 통과했지만 처음 쓴 이야기와 멀어졌다.'],
        ['hold', '원안을 고수한다', 'intellect+1 happiness+1 wealth-1 relations-1', '의견이 갈렸다. 다음 일감이 불확실해졌다.'],
      ], 'rewrite', '창작과 현실'),
      ev('29111', 'delayed_pay', [24, 62], 0.1, '작품은 방송됐는데 원고료 정산이 몇 달째 밀렸다.', 'wealth-2 happiness-1 fairness+2', '원고료 지연', { dark: true }),
    ],
    hazard: 0, burnout: 0.07,
  }),
  X('29112', {
    entry: [E('self', { minEdu: 'none', ages: [20, 60], p: 0.1, text: '신춘문예와 공모를 거치며 책을 내는 작가가 됐다.' }), E('hire', { minEdu: '4yr', majors: ['hum'], ages: [24, 50], p: 0.1, text: '문예 창작 과정을 마치고 문단에 첫 작품을 냈다.' })],
    transitions: [tr('29122', [28, 58], 4, 0.04, '출판 편집으로'), tr('26122', [34, 62], 6, 0.03, '강의로 이동'), tr('29111', [28, 55], 3, 0.03, '방송 작가로')],
    events: [
      ev('29112', 'reader_letter', [22, 75], 0.12, '모르는 독자가 책을 읽고 긴 편지를 보내 왔다.', 'happiness+3 intellect+1', '독자의 편지'),
      ev('29112', 'sales_slump', [24, 75], 0.14, '신간 판매가 바닥이라는 연락을 받았다. 인세는 몇 푼이 안 됐다.', 'wealth-2 happiness-2 job+2', '판매 부진', { dark: true }),
      ch('29112', 'serial_offer', [24, 65], 0.1, '연재 제안이 왔다. 원고료는 괜찮지만 마감이 빡빡하다.', '어떻게 할까?', [
        ['accept', '수락한다', 'wealth+2 intellect+1 leisure-2 health-1', '매주 마감이 돌아와 쓸 시간이 사라졌다.'],
        ['decline', '내 글을 먼저 쓴다', 'happiness+1 intellect+1 wealth-2', '원고료는 놓쳤지만 쓰던 장편이 진척됐다.'],
      ], 'decline', '연재와 창작'),
      ev('29112', 'side_job', [24, 65], 0.12, '글 수입으로 월세를 못 채워 낮에는 일을 병행한다.', 'wealth+1 leisure-2 intellect-1', '생계 병행'),
    ],
    hazard: 0, burnout: 0.06,
  }),
  X('29331', {
    entry: [E('exam', { minEdu: '4yr', ages: [22, 34], p: 0.03, years: 2, text: '방송사 공채 시험과 면접을 통과해 아나운서가 됐다.' }), E('hire', { minEdu: '4yr', ages: [22, 40], p: 0.1, text: '지역 방송이나 케이블 채널에서 진행자로 입사했다.' })],
    transitions: [tr('29333', [28, 45], 3, 0.05, '쇼핑호스트로'), tr('28332', [30, 50], 4, 0.03, '홍보 전문가로'), tr('29339', [30, 55], 4, 0.03, '프리랜서 진행자로')],
    events: [
      ev('29331', 'prime_slot', [24, 55], 0.1, '뉴스 진행 시간대가 앞당겨졌다. 한 달 새 얼굴을 알아보는 사람이 늘었다.', 'happiness+3 relations+1', '진행 기회'),
      ev('29331', 'early_call', [24, 55], 0.14, '새벽 생방송 때문에 한 달째 자정에 잠들어 세 시에 일어났다.', 'health-2 leisure-2', '새벽 방송', { dark: true }),
      ch('29331', 'comment_wave', [24, 55], 0.1, '방송 뒤 외모와 말투를 두고 댓글이 쏟아졌다.', '어떻게 할까?', [
        ['read', '찾아 읽는다', 'intellect+1 happiness-2 health-1', '지적도 있었지만 오래 마음에 남은 말이 많았다.'],
        ['ignore', '보지 않는다', 'happiness+1 intellect-1 relations-1', '편해졌지만 개선할 지점도 놓쳤다.'],
      ], 'ignore', '시청자 반응', { years: [2005, 2060] }),
      ev('29331', 'contract_review', [28, 55], 0.1, '프리랜서 재계약 철이다. 새 얼굴이 투입되면서 진행 시간이 줄었다.', 'wealth-2 job+3 happiness-1', '재계약 불안', { dark: true }),
    ],
    hazard: 0, burnout: 0.06,
  }),
  X('29333', {
    entry: [E('hire', { minEdu: '4yr', ages: [24, 40], p: 0.15, era: [1995, null], text: '홈쇼핑 공채와 오디션을 거쳐 쇼핑호스트가 됐다.' })],
    transitions: [tr('29331', [28, 45], 3, 0.03, '방송 진행으로'), tr('28312', [30, 50], 4, 0.03, '마케팅으로'), tr('52111', [32, 55], 4, 0.03, '쇼핑몰 창업으로')],
    events: [
      ev('29333', 'sold_out', [24, 55], 0.12, '방송 중 준비한 물량이 매진돼 PD와 스태프가 박수를 쳤다.', 'happiness+3 wealth+1 relations+1', '매진 달성'),
      ev('29333', 'rating_drop', [26, 55], 0.12, '새 프로그램에서 판매가 부진해 시간대가 바뀌었다.', 'happiness-2 job+3 wealth-1', '판매 실적', { dark: true }),
      ch('29333', 'script_mismatch', [24, 55], 0.12, '대본에는 효능을 크게 알리라고 적혀 있다.', '어떻게 말할까?', [
        ['follow', '대본대로 말한다', 'wealth+1 happiness-1 fairness+1', '판매는 올랐다. 과장 같아 찜찜했다.'],
        ['soften', '표현을 낮춘다', 'happiness+1 relations-1 wealth-1', '방송 뒤 제작진에게 수정 요청을 받았다.'],
      ], 'soften', '표현의 수위'),
      ev('29333', 'long_live', [24, 55], 0.12, '세 시간 생방송 내내 서서 말했다. 끝나니 목이 쉬어 있었다.', 'health-2 leisure-1', '장시간 생방송', { dark: true }),
    ],
    hazard: 0, burnout: 0.06,
  }),
  X('29531', {
    entry: [E('hire', { minEdu: '4yr', majors: ['art', 'eng'], ages: [22, 40], p: 0.4, text: '인테리어 업체에 들어가 설계와 시공 조율을 배웠다.' }), E('self', { minEdu: '2yr', ages: [30, 58], p: 0.1, text: '경력을 바탕으로 작은 디자인 사무실을 열었다.' })],
    transitions: [tr('29532', [28, 50], 4, 0.03, '디스플레이 디자인으로'), tr('29549', [28, 50], 3, 0.02, '시각 디자인으로'), tr('26461', [32, 58], 5, 0.02, '디자인 강사로')],
    events: [
      ev('29531', 'finished_site', [24, 58], 0.12, '공사를 마친 가게 주인이 첫 손님을 맞으며 환하게 웃었다.', 'happiness+3 relations+1 wealth+1', '시공 완료'),
      ev('29531', 'unpaid_balance', [26, 62], 0.12, '공사 후 잔금을 미루는 건축주 때문에 몇 달을 쫓아다녔다.', 'wealth-2 happiness-2 fairness+2', '잔금 지연', { dark: true, who: 'self' }),
      ch('29531', 'client_taste', [24, 58], 0.12, '건축주가 이미 정한 자재로 시공해 달라고 고집한다.', '어떻게 할까?', [
        ['follow', '요청대로 한다', 'relations+1 wealth+1 happiness-1', '일은 순조롭지만 완성도가 마음에 걸렸다.'],
        ['propose', '대안을 설득한다', 'intellect+1 happiness+1 relations-1 leisure-1', '시간이 더 들었다. 결과에는 만족했다.'],
      ], 'propose', '설계 의견 조율'),
      ev('29531', 'material_price', [26, 60], 0.1, '자재 가격이 뛰어 견적을 다시 내야 했다. 계약 금액은 이미 정해진 뒤였다.', 'wealth-2 happiness-1 conflict+1', '자재 가격 상승', { dark: true }),
    ],
    hazard: 1, burnout: 0.05,
  }),
  X('29551', {
    entry: [E('hire', { minEdu: '2yr', majors: ['art', 'eng'], ages: [20, 38], p: 0.45, era: [1997, null], text: '웹 에이전시에 디자이너로 입사해 화면 시안을 만들었다.' })],
    transitions: [tr('29554', [26, 45], 3, 0.05, '사용자 경험 디자이너로'), tr('22241', [26, 45], 3, 0.03, '웹 기획자로'), tr('29555', [28, 50], 4, 0.02, '실감형 콘텐츠로')],
    events: [
      ev('29551', 'launch_day', [22, 52], 0.12, '석 달 작업한 사이트가 문제없이 열렸다. 가벼운 첫 퇴근을 했다.', 'happiness+3 relations+1', '사이트 오픈'),
      ev('29551', 'template_tools', [24, 55], 0.12, '템플릿 제작 도구가 확산되면서 단가가 낮은 의뢰가 줄었다.', 'wealth-2 tech+2 job+2', '디자인 도구 변화', { dark: true }),
      ch('29551', 'side_project', [22, 52], 0.1, '지인이 사이트 외주를 싸게 부탁했다. 일정이 겹친다.', '어떻게 할까?', [
        ['take', '맡는다', 'wealth+2 leisure-2 health-1', '퇴근 후 작업이 이어졌지만 포트폴리오가 늘었다.'],
        ['pass', '거절한다', 'leisure+1 relations-1 wealth-1', '쉬는 시간은 지켰다. 지인과 서먹해졌다.'],
      ], 'pass', '외주 부탁'),
      ev('29551', 'crunch_release', [22, 50], 0.14, '출시 일정을 앞당겨 야근이 이어졌다. 마지막 주에는 주말도 출근했다.', 'health-2 leisure-3 happiness-1', '출시 마감', { dark: true }),
    ],
    hazard: 0, burnout: 0.07,
  }),
  X('29553', {
    entry: [E('hire', { minEdu: '4yr', majors: ['art', 'eng'], ages: [22, 40], p: 0.3, era: [1995, null], text: '게임사 공채에서 기획 일을 시작했다.' }), E('promote', { from: ['22234'], minYears: 3, ages: [26, 45], p: 0.08, text: '개발 경험을 살려 게임 기획으로 옮겼다.' })],
    transitions: [tr('22234', [26, 45], 3, 0.03, '개발로 이동'), tr('29555', [28, 50], 4, 0.03, '실감형 콘텐츠로'), tr('29554', [28, 50], 4, 0.02, '사용자 경험 디자인으로')],
    events: [
      ev('29553', 'playtest_smile', [22, 50], 0.12, '시험 플레이에서 처음 보는 사람이 기획한 장면에서 웃었다.', 'happiness+3 intellect+1', '시험 플레이 반응'),
      ev('29553', 'project_cancel', [24, 52], 0.1, '일 년 넘게 만든 프로젝트가 중단됐다. 팀이 흩어졌다.', 'happiness-3 job+4 wealth-1', '프로젝트 중단', { dark: true }),
      ch('29553', 'update_deadline', [22, 50], 0.12, '업데이트 일정이 한 주 앞당겨졌다.', '어떻게 대응할까?', [
        ['crunch', '야근으로 맞춘다', 'wealth+1 health-2 leisure-3', '기한은 지켰다. 팀 분위기가 가라앉았다.'],
        ['cut', '기능을 덜어 낸다', 'happiness+1 relations-1 intellect+1', '품질은 지켰지만 이용자 반응이 엇갈렸다.'],
      ], 'cut', '출시 일정'),
      ev('29553', 'review_bomb', [22, 50], 0.1, '출시 후 이용자 평가가 거칠게 쏟아졌다. 회의실이 조용해졌다.', 'happiness-2 health-1', '이용자 평가', { dark: true }),
    ],
    hazard: 0, burnout: 0.08,
  }),
  X('29411', {
    entry: [E('self', { minEdu: 'none', ages: [18, 70], p: 0.2, text: '그림을 그리며 전시와 공모에 작품을 내기 시작했다.' }), E('degree', { minEdu: '4yr', majors: ['art'], ages: [24, 45], p: 0.15, text: '미술 학위를 마치고 작업실을 얻어 작가로 활동했다.' })],
    transitions: [tr('26473', [28, 62], 3, 0.05, '미술 강사로'), tr('29544', [28, 55], 3, 0.03, '삽화가로'), tr('29211', [32, 58], 5, 0.02, '학예 쪽으로')],
    events: [
      ev('29411', 'solo_show', [24, 75], 0.1, '작은 갤러리에서 개인전이 열렸다. 한 점이 팔렸다.', 'happiness+3 wealth+1 relations+1', '개인전'),
      ev('29411', 'rent_squeeze', [24, 75], 0.14, '작업실 월세가 올랐는데 이번 달 판매는 한 점도 없었다.', 'wealth-3 happiness-2 housing+2', '작업실 임대료', { dark: true }),
      ch('29411', 'commission_offer', [24, 70], 0.12, '기업 로비 벽화 의뢰가 왔다. 조건이 까다롭다.', '어떻게 할까?', [
        ['accept', '맡는다', 'wealth+3 happiness-1 intellect-1', '요구대로 다듬었다. 작업은 안정을 주었다.'],
        ['own', '내 작업에 집중한다', 'happiness+2 wealth-2 intellect+1', '수입은 줄었다. 다음 전시 준비가 앞당겨졌다.'],
      ], 'own', '의뢰와 작업'),
      ev('29411', 'teaching_slot', [26, 70], 0.1, '강의 몇 개를 겸하며 작업 시간을 쪼갰다.', 'wealth+1 leisure-1 intellect-1', '생계 병행'),
    ],
    hazard: 0, burnout: 0.05,
  }),
  X('29453', {
    entry: [E('degree', { minEdu: '4yr', majors: ['art'], ages: [22, 45], p: 0.2, text: '음악 학위와 오디션을 거쳐 연주자로 무대에 서기 시작했다.' }), E('self', { minEdu: 'none', ages: [20, 60], p: 0.1, text: '밴드와 세션 활동으로 연주 일을 이어 갔다.' })],
    transitions: [tr('26472', [28, 62], 3, 0.05, '음악 강사로'), tr('29452', [28, 55], 4, 0.03, '작곡·편곡으로'), tr('29451', [35, 62], 8, 0.02, '지휘로')],
    events: [
      ev('29453', 'ensemble_hall', [22, 65], 0.12, '정기 연주회 날 객석에서 박수가 길게 이어졌다.', 'happiness+3 relations+1', '연주회'),
      ev('29453', 'gig_gap', [22, 65], 0.14, '연주 일정이 몇 달째 비었다. 레슨으로 월세를 채웠다.', 'wealth-2 happiness-1 job+2', '무대 공백', { dark: true }),
      ch('29453', 'orchestra_audition', [24, 50], 0.1, '오케스트라 단원 오디션 공고가 났다. 지금 하는 공연 일정과 겹친다.', '어떻게 할까?', [
        ['audition', '준비해 응시한다', 'intellect+1 wealth-1 leisure-2 health-1', '몇 주 연습에 매달렸다. 결과와 별개로 연주가 깊어졌다.'],
        ['stay', '현재 일에 집중한다', 'wealth+1 happiness-1 relations+1', '공연은 무사히 마쳤다. 기회를 놓친 아쉬움이 남았다.'],
      ], 'stay', '진로 선택'),
      ev('29453', 'tendon_pain', [30, 62], 0.1, '연습량이 늘자 손목 통증이 생겨 며칠 쉬었다.', 'health-2 leisure+1', '손목 통증', { dark: true }),
    ],
    hazard: 0, burnout: 0.05,
  }),
  X('29612', {
    entry: [E('promote', { from: ['29620'], minYears: 4, ages: [28, 50], p: 0.15, text: '선수 생활을 마치고 지도자 자격을 따서 코치가 됐다.' }), E('degree', { minEdu: '4yr', majors: ['edu'], ages: [23, 45], p: 0.25, text: '체육 전공 후 팀에 코치로 합류했다.' })],
    transitions: [tr('29611', [38, 60], 8, 0.04, '감독으로 승진'), tr('29640', [30, 55], 3, 0.03, '트레이너로'), tr('26215', [30, 55], 4, 0.02, '체육 교사로')],
    events: [
      ev('29612', 'rookie_grow', [24, 60], 0.12, '지도한 어린 선수가 처음으로 기록을 경신했다.', 'happiness+3 relations+1', '선수 성장'),
      ev('29612', 'contract_end', [26, 60], 0.12, '성적 부진으로 코치진 계약이 갱신되지 않았다.', 'wealth-2 happiness-2 job+4', '계약 만료', { dark: true }),
      ch('29612', 'selection_call', [26, 58], 0.12, '감독이 선수 선발에서 내 의견을 물었다. 가능성과 실적이 갈린다.', '누구를 추천할까?', [
        ['potential', '가능성 있는 선수', 'happiness+1 relations-1 intellect+1', '다음 시즌을 보고 밀었다. 기존 선수가 서운해했다.'],
        ['record', '실적 좋은 선수', 'relations+1 happiness-1 wealth+1', '무난한 선택이었다. 가능성 있는 선수는 벤치에 앉았다.'],
      ], 'record', '선발 판단'),
      ev('29612', 'away_camp', [24, 58], 0.12, '전지훈련과 원정이 이어져 한 달 가까이 집을 비웠다.', 'relations-2 leisure-2', '원정과 전지훈련', { dark: true }),
    ],
    hazard: 1, burnout: 0.05,
  }),
  X('29631', {
    entry: [E('hire', { minEdu: '4yr', majors: ['edu'], ages: [20, 50], p: 0.2, text: '심판 자격과 교육을 마치고 경기 배정을 받기 시작했다.' }), E('promote', { from: ['29620'], minYears: 3, ages: [28, 50], p: 0.1, text: '선수 경력을 살려 심판으로 전향했다.' })],
    transitions: [tr('29612', [28, 50], 3, 0.03, '코치로 이동'), tr('29640', [28, 52], 3, 0.03, '체육 강사로'), tr('29632', [28, 55], 3, 0.02, '기록원으로')],
    events: [
      ev('29631', 'clean_game', [22, 58], 0.12, '경기가 끝나자 양 팀 감독이 판정이 깔끔했다며 악수를 청했다.', 'happiness+3 relations+1', '경기 종료'),
      ev('29631', 'booed_call', [22, 58], 0.14, '애매한 판정 한 번에 관중석 야유가 쏟아졌다. 귀가 길이 길었다.', 'happiness-2 health-1 conflict+1', '판정 시비', { dark: true }),
      ch('29631', 'replay_review', [24, 58], 0.1, '영상 판독이 도입되어 현장 판정이 번복되는 경우가 생겼다.', '어떻게 받아들일까?', [
        ['adapt', '판독에 맞춰 익힌다', 'intellect+1 happiness-1 leisure-1', '판독 절차를 몸에 익히느라 한 시즌을 썼다.'],
        ['resist', '현장 감각을 지킨다', 'happiness+1 intellect-1 relations-1', '고집을 지켰지만 평가 점수가 흔들렸다.'],
      ], 'adapt', '판독 도입', { years: [2010, 2060] }),
      ev('29631', 'low_pay_games', [22, 55], 0.12, '하부 리그 배정이 이어져 교통비를 빼면 수입이 거의 남지 않았다.', 'wealth-2 happiness-1 leisure-1', '배정 수당', { dark: true }),
    ],
    hazard: 1, burnout: 0.04,
  }),
  X('29221', {
    entry: [E('hire', { minEdu: '4yr', majors: ['hum', 'edu'], ages: [23, 50], p: 0.3, text: '사서 자격을 갖추고 공공도서관에 채용됐다.' }), E('exam', { minEdu: '4yr', ages: [24, 40], p: 0.1, years: 2, text: '공채 시험을 거쳐 국공립 도서관 사서가 됐다.' })],
    transitions: [tr('29222', [30, 58], 4, 0.04, '기록물 관리로'), tr('26919', [32, 58], 5, 0.02, '교육 전문가로'), tr('29211', [30, 55], 4, 0.02, '학예 쪽으로')],
    events: [
      ev('29221', 'reading_program', [24, 62], 0.12, '독서 모임에 나온 어르신이 책을 처음 끝까지 읽었다고 했다.', 'happiness+3 relations+1', '독서 프로그램'),
      ev('29221', 'contract_librarian', [24, 58], 0.12, '기간제 계약이 끝나면서 이번 학기 이후 자리가 불투명해졌다.', 'happiness-2 job+3 wealth-1', '계약 만료', { dark: true }),
      ch('29221', 'acquisition_pick', [26, 62], 0.1, '신간 구입 예산이 한정돼 대출 수요와 소장 가치 사이에서 정해야 한다.', '어떻게 채울까?', [
        ['popular', '많이 찾는 책', 'happiness+1 intellect-1 relations+1', '대출은 늘었다. 소장 목록이 가벼워졌다.'],
        ['value', '오래 남길 책', 'intellect+1 happiness-1 relations-1', '이용자 불만이 일부 나왔다. 장서가 깊어졌다.'],
      ], 'value', '장서 구성'),
      ev('29221', 'digital_shift', [26, 62], 0.1, '전자책 대출이 늘어 서가 면적이 줄고 업무가 바뀌었다.', 'tech+2 job+1 intellect+1', '도서관 디지털화', { years: [2010, 2060] }),
    ],
    hazard: 0, burnout: 0.04,
  }),
];
