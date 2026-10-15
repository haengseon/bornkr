import { X, E, tr, ev, ch } from '../jobs-kit.js';
export default [
  X('61341', {
    entry: [
      E('inherit', { minEdu: 'none', ages: [22, 62], p: 0.2, text: '부모의 계열화 육계 농장을 이어받았다.' }),
      E('hire', { minEdu: 'none', ages: [20, 58], p: 0.2, text: '육계 농장에서 일꾼으로 일하며 사양 관리를 배웠다.' }),
    ],
    transitions: [tr('61342', [28, 62], 3, 0.03, '산란계 사육으로 전환'), tr('61399', [28, 64], 3, 0.03, '축산 관련 일로 이동'), tr('99110', [52, 76], 5, 0.03, '농업 보조 일로 이동')],
    events: [
      ev('61341', 'chick_in', [22, 72], 0.14, '병아리 입식 날이다. 한 달 동안 온도와 환기를 밤낮으로 확인했다.', 'leisure-3 health-1 wealth+1', '입식과 사양', { cd: 3 }),
      ev('61341', 'contract_low', [26, 72], 0.1, '업체가 정한 사육비 단가가 오른 사료값을 따라오지 못한다.', 'wealth-3 happiness-2 fairness+2 conflict+1', '계약 사육 단가', { dark: true, who: 'self' }),
      ch('61341', 'summer_fans', [24, 70], 0.12, '폭염에 닭이 쓰러지는 날이 늘었다. 환기 팬과 냉방을 더하고 싶다.', '어떻게 할까?', [
        ['invest', '냉방 설비를 더한다', 'wealth-2 health+1 happiness+1 debt+3000', '빚을 더했지만 한여름 폐사는 줄었다.'],
        ['manual', '직접 돌며 버틴다', 'health-3 wealth+1 leisure-2', '밤새 계사를 돌았다. 몸이 먼저 지쳤다.']], 'manual', '폭염 대응'),
      ev('61341', 'subsidy_help', [28, 72], 0.1, '지자체 시설 개선 지원이 선정되어 환기 시설을 새로 달았다.', 'wealth+2 happiness+2 living-1', '정부 지원', { once: true }),
    ],
    hazard: 2, burnout: 0.04,
  }),
  X('63012', {
    entry: [
      E('inherit', { minEdu: 'none', ages: [20, 62], p: 0.2, text: '어촌에서 부모의 김 양식장을 이어받았다.' }),
      E('hire', { minEdu: 'none', ages: [20, 60], p: 0.2, text: '김·미역 양식장에서 일꾼으로 일하며 배웠다.' }),
    ],
    transitions: [tr('63019', [28, 62], 3, 0.04, '다른 양식으로 전환'), tr('63021', [28, 60], 3, 0.02, '조업 일로 이동'), tr('99130', [50, 74], 5, 0.03, '어업 보조 일로 이동')],
    events: [
      ev('63012', 'cold_dawn', [20, 70], 0.14, '겨울 새벽 바다에서 김발을 걷었다. 손이 얼어 장갑 속에서 굳었다.', 'health-2 leisure-2 wealth+2', '겨울 수확', { cd: 3 }),
      ev('63012', 'warm_blight', [22, 72], 0.1, '수온이 안 떨어져 김 생육이 나빠졌다. 올해 수확은 평년보다 적다.', 'wealth-3 happiness-2 living+2 region+1', '고수온 피해', { dark: true, years: [2000, 2100] }),
      ch('63012', 'dry_facility', [26, 68], 0.1, '건조 시설을 키우면 가공 일손이 줄 거라 한다.', '어떻게 할까?', [
        ['expand', '시설을 늘린다', 'wealth-1 leisure+2 tech+1 debt+4000', '건조 설비를 들였다. 마르기 기다리는 밤샘이 줄었다.'],
        ['hold', '그대로 한다', 'wealth+1 leisure-2 health-1', '기존 방식으로 가공했다. 물량이 몰리면 잠이 줄었다.']], 'hold', '건조 시설 투자'),
      ev('63012', 'foreign_crew', [22, 68], 0.1, '이주 노동자 동료가 김 작업에서 손이 빠르다고 인정받았다. 함께 배우는 법을 익혔다.', 'relations+2 happiness+1', '이주 노동자와 협업', { once: true, years: [2004, 2100] }),
    ],
    hazard: 2, burnout: 0.03,
  }),
  X('63019', {
    entry: [
      E('inherit', { minEdu: 'none', ages: [20, 62], p: 0.2, text: '가업으로 가두리 양식장을 이어받았다.' }),
      E('hire', { minEdu: 'none', ages: [20, 60], p: 0.2, text: '가두리 양식장 일꾼으로 사료 주는 일부터 배웠다.' }),
    ],
    transitions: [tr('63011', [28, 62], 3, 0.04, '어패류 양식으로 전환'), tr('63012', [28, 62], 3, 0.03, '해조류 양식으로 전환'), tr('99130', [50, 74], 5, 0.03, '어업 보조 일로 이동')],
    events: [
      ev('63019', 'feed_run', [20, 68], 0.13, '새벽에 배를 몰고 가두리에 사료를 줬다. 물고기가 잘 먹으면 하루가 편하다.', 'happiness+1 leisure-1 wealth+1', '일상 사양 관리', { cd: 3 }),
      ev('63019', 'red_tide', [22, 72], 0.1, '적조가 번졌다. 사료를 줄이고 산소를 불어 넣으며 조마조마하게 보냈다.', 'wealth-3 happiness-2 health-1', '적조 피해', { dark: true }),
      ch('63019', 'smart_farm', [28, 66], 0.1, '수온·산소를 알려 주는 센서 설비를 설명받았다.', '어떻게 할까?', [
        ['sensor', '센서를 단다', 'wealth-1 intellect+2 tech+1 leisure+1 debt+2000', '휴대전화로 수온을 확인한다. 밤중에 배 나갈 일이 줄었다.'],
        ['eye', '눈과 경험으로', 'wealth+1 leisure-2 health-1', '경험으로 날씨를 가늠했다. 밤에 자주 깼다.']], 'eye', '양식 스마트화', { years: [2015, 2100] }),
      ev('63019', 'steady_buyer', [24, 72], 0.1, '횟집 단골이 계절마다 물량을 고정으로 사 가기로 했다.', 'wealth+2 happiness+2 relations+1', '고정 거래처', { cd: 5 }),
    ],
    hazard: 2, burnout: 0.03,
  }),
  X('63022', {
    entry: [
      E('inherit', { minEdu: 'none', ages: [20, 62], p: 0.2, text: '강가 마을에서 아버지 배를 물려받아 고기를 잡았다.' }),
      E('hire', { minEdu: 'none', ages: [20, 60], p: 0.15, text: '내수면 어선에서 그물 손질을 배우며 일했다.' }),
    ],
    transitions: [tr('63019', [28, 62], 3, 0.03, '양식 일로 이동'), tr('63021', [28, 58], 3, 0.02, '연안 조업으로 이동'), tr('99130', [50, 74], 5, 0.04, '어업 보조 일로 이동')],
    events: [
      ev('63022', 'dam_change', [28, 75], 0.1, '보와 하굿둑이 늘며 물길이 달라져 어종이 바뀌었다. 그물을 새로 쳤다.', 'wealth-2 happiness-1 region+2 living+1', '물길 변화', { dark: true }),
      ev('63022', 'fresh_fish_day', [22, 72], 0.12, '이른 아침 강물에서 건진 어획물을 단골 식당이 모두 받아 갔다.', 'wealth+2 happiness+1 relations+1', '단골 식당 납품', { cd: 3 }),
      ch('63022', 'fishing_ban', [30, 72], 0.1, '금어기와 수질 문제로 한 철을 쉬어야 할지 고민이다.', '어떻게 할까?', [
        ['wait', '쉬며 기다린다', 'wealth-2 leisure+2 happiness-1', '배를 묶고 쉬었다. 장비를 손보며 한 철을 보냈다.'],
        ['side', '다른 일을 얻는다', 'wealth+1 leisure-2 relations+1', '인근 공사장 일을 얻었다. 몸이 두 곳에서 쓰였다.']], 'wait', '금어기와 수질'),
    ],
    hazard: 2, burnout: 0.03,
  }),
  X('62011', {
    entry: [
      E('hire', { minEdu: 'high', ages: [20, 58], p: 0.25, text: '산림조합이나 임업 법인에 들어가 숲 가꾸기 일을 배웠다.' }),
      E('inherit', { minEdu: 'none', ages: [28, 64], p: 0.1, text: '집안 임야를 물려받아 직접 가꾸기 시작했다.' }),
    ],
    transitions: [tr('62012', [25, 58], 3, 0.04, '벌목 현장으로 이동'), tr('62091', [30, 66], 3, 0.04, '임산물 채취로 이동'), tr('99121', [50, 74], 5, 0.03, '산불 감시 일로 이동')],
    events: [
      ev('62011', 'thinning_work', [22, 65], 0.14, '여름 내내 풀베기와 솎아베기를 했다. 해 질 녘 산이 한결 맑아졌다.', 'health-1 happiness+1 wealth+1 leisure-1', '숲 가꾸기 작업', { cd: 3 }),
      ev('62011', 'pine_wilt', [28, 70], 0.1, '소나무재선충 방제 일이 몰려 휴일도 산에 있었다.', 'health-2 leisure-3 wealth+1', '병해충 방제', { dark: true }),
      ch('62011', 'forest_plan', [30, 68], 0.1, '임야에 조림 보조금을 받으려면 경영 계획을 써야 한다.', '어떻게 할까?', [
        ['plan', '계획을 직접 쓴다', 'intellect+2 wealth+1 leisure-2', '밤마다 서류를 썼다. 보조금이 나와 묘목을 더 심었다.'],
        ['skip', '지금은 건너뛴다', 'leisure+1 wealth-2 happiness-1', '서류 일은 넘겼다. 올해 조림은 작게 끝났다.']], 'plan', '조림 지원'),
      ev('62011', 'wildfire_watch', [26, 68], 0.1, '봄철 산불 조심 기간에 순찰이 이어져 산 위에서 새벽을 맞았다.', 'leisure-2 health-1 relations+1', '산불 조심 기간', { dark: true, cd: 4 }),
    ],
    hazard: 2, burnout: 0.04,
  }),
  X('62012', {
    entry: [
      E('hire', { minEdu: 'high', ages: [20, 55], p: 0.3, text: '벌목 팀에 들어가 안전 수칙과 톱질을 배웠다.' }),
      E('self', { minEdu: 'none', ages: [28, 60], p: 0.05, text: '경력을 쌓아 작은 벌채 팀을 꾸렸다.' }),
    ],
    transitions: [tr('62011', [28, 60], 3, 0.04, '산림 경영 일로 이동'), tr('99129', [50, 74], 5, 0.03, '임업 보조 일로 이동'), tr('73019', [28, 58], 3, 0.02, '목재 가공 일로 이동')],
    events: [
      ev('62012', 'chainsaw_care', [22, 62], 0.14, '체인톱 날을 갈고 보호 장비를 점검한 뒤 작업을 나갔다.', 'health+1 intellect+1', '장비 점검', { cd: 3 }),
      ev('62012', 'steep_slope', [22, 60], 0.12, '가파른 비탈 작업에서 넘어져 며칠을 쉬었다. 조심하라는 말을 들었다.', 'health-3 wealth-1 leisure+1', '산림 작업 사고', { dark: true, cd: 3 }),
      ch('62012', 'rush_order', [24, 60], 0.1, '원목 납기에 쫓겨 우기 전에 일을 끝내야 한다는 요구가 왔다.', '어떻게 할까?', [
        ['push', '인원을 늘려 서두른다', 'wealth+2 health-2 conflict+1', '납기는 맞췄지만 일정이 빠듯해 위험한 날이 늘었다.'],
        ['safe', '일정을 협의한다', 'wealth-1 health+1 conflict+1', '일정을 늦추자고 협의했다. 단가에서 조금 양보했다.']], 'safe', '납기와 안전'),
      ev('62012', 'timber_demand', [24, 62], 0.09, '목재 수요가 늘어 올 한 해 일감이 끊이지 않았다.', 'wealth+3 happiness+1 leisure-1', '목재 수요', { cd: 5 }),
    ],
    hazard: 3, burnout: 0.05,
  }),
  X('62091', {
    entry: [
      E('self', { minEdu: 'none', ages: [28, 70], p: 0.15, text: '산에서 나는 버섯과 산나물을 캐어 팔기 시작했다.' }),
      E('inherit', { minEdu: 'none', ages: [25, 66], p: 0.2, text: '집안 산에서 해마다 나는 산물을 이어 거두었다.' }),
    ],
    transitions: [tr('62011', [30, 66], 3, 0.04, '산림 경영 일로 이동'), tr('61122', [32, 66], 3, 0.04, '특용작물 재배로 전환'), tr('99121', [52, 74], 5, 0.03, '산불 감시 일로 이동')],
    events: [
      ev('62091', 'spring_greens', [25, 78], 0.14, '봄비 뒤 산나물이 올라 새벽부터 산을 탔다. 광주리가 가득 찼다.', 'wealth+2 happiness+2 health-1', '산나물 철', { cd: 3 }),
      ev('62091', 'mushroom_year', [25, 78], 0.1, '가을 비가 일찍 그쳐 송이를 거의 못 땄다. 한 해 소득이 줄었다.', 'wealth-3 happiness-2 living+2', '임산물 흉작', { dark: true }),
      ch('62091', 'aging_trail', [55, 80], 0.1, '산길이 가팔라 무릎이 시리다. 이웃이 같이 가 주겠다고 한다.', '어떻게 할까?', [
        ['team', '함께 다닌다', 'relations+2 wealth-1 health+1', '둘이 나누니 소득은 갈렸지만 길이 한결 덜 무서웠다.'],
        ['alone', '혼자 다닌다', 'wealth+1 health-2 happiness-1', '혼자 조용히 땄다. 내려오는 길에 무릎이 아팠다.']], 'alone', '농촌 고령화'),
      ev('62091', 'direct_sales', [28, 75], 0.1, '장터에서 산나물을 직접 팔자 손님이 말을 걸며 단골이 되었다.', 'wealth+2 happiness+2 relations+2', '직거래 단골', { cd: 5 }),
    ],
    hazard: 2, burnout: 0.02,
  }),
];
