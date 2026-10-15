import { ev, ch } from '../jobs-kit.js';
export default {
  '71010': [
    ev('71010', 'flour_price', [20, 65], 0.11, '밀가루와 버터 값이 올라 가격표를 다시 붙였다.', 'wealth-3 happiness-1', '원재료 가격', { dark: true }),
    ev('71010', 'signature_bread', [22, 65], 0.1, '새로 만든 빵이 입소문을 타 오전에 매진되었다.', 'happiness+3 wealth+2 relations+1', '신메뉴 인기'),
    ch('71010', 'unsold_bread', [22, 62], 0.12, '마감 후 남은 빵이 쌓였다.', '어떻게 할까?', [
      ['discount', '떨이로 판다', 'wealth+1 relations+1 happiness-1', '조금이라도 팔았다. 정가 손님은 눈치를 봤다.'],
      ['donate', '이웃에게 나눈다', 'happiness+2 wealth-2 relations+2', '빵을 나누었다. 손해는 났지만 인사를 받았다.'],
    ], 'discount', '재고 처리'),
  ],
  '74062': [
    ev('74062', 'weld_pass', [20, 62], 0.12, '비파괴 검사를 한 번에 통과해 반장이 어깨를 두드렸다.', 'happiness+2 job+1', '검사 통과'),
    ev('74062', 'arc_eye', [20, 62], 0.11, '아크 불빛에 눈이 따가워 하루 쉬며 안정을 취했다.', 'health-2 wealth-1 medical+1', '눈 자극', { dark: true }),
    ch('74062', 'overseas_offer', [24, 52], 0.08, '해외 플랜트 용접 인력 모집 소식이 들렸다.', '지원할까?', [
      ['go', '지원한다', 'wealth+4 relations-3 leisure-2', '급여가 높았다. 가족과 떨어져 지냈다.'],
      ['stay', '남는다', 'relations+2 wealth-1 happiness+1', '가까운 현장에서 안정을 택했다.'],
    ], 'stay', '해외 현장', { once: true }),
    ev('74062', 'foreign_mate', [22, 60], 0.1, '외국인 동료와 용접 순서를 손으로 그려 가며 맞췄다.', 'relations+2 intellect+1', '외국인 동료 협업', { years: [2005, 2060] }),
  ],
  '75101': [
    ev('75101', 'diagnose_hit', [22, 62], 0.12, '다른 곳에서 못 찾은 고장 원인을 찾아 손님이 놀랐다.', 'happiness+2 intellect+1', '진단 성공'),
    ev('75101', 'oil_burn', [22, 62], 0.11, '뜨거운 엔진 부품에 손을 데어 장갑을 두 겹 꼈다.', 'health-2 wealth-1', '화상 위험', { dark: true }),
    ch('75101', 'upsell_press', [24, 62], 0.12, '사장이 불필요한 부품 교체를 권하라고 한다.', '어떻게 할까?', [
      ['honest', '필요한 것만', 'happiness+1 wealth-2 conflict+1', '손님은 고마워했다. 사장 눈치가 따가웠다.'],
      ['upsell', '권한다', 'wealth+2 happiness-2 relations-1', '매출은 올랐지만 마음이 편하지 않았다.'],
    ], 'honest', '과잉 정비 압박', { who: 'wage' }),
    ev('75101', 'ev_threat', [28, 62], 0.1, '전기차가 늘어 엔진 정비 일감이 서서히 줄었다.', 'wealth-2 tech+1 happiness-1', '기술 전환', { dark: true, years: [2018, 2060] }),
  ],
  '75106': [
    ev('75106', 'battery_cert', [24, 55], 0.1, '고전압 배터리 정비 교육을 마쳐 기술 수당이 붙었다.', 'wealth+2 intellect+2', '교육 수료', { years: [2015, 2060] }),
    ev('75106', 'high_voltage', [24, 55], 0.1, '고전압 배터리 앞에서 절연 장갑을 두 번 확인했다. 긴장이 컸다.', 'health-1 happiness-1 leisure-1', '고전압 작업', { dark: true, years: [2015, 2060] }),
    ch('75106', 'manual_gap', [26, 55], 0.11, '제조사 정비 자료가 부족해 원인을 못 찾는 차가 있다.', '어떻게 할까?', [
      ['trial', '직접 분석', 'intellect+2 leisure-2 happiness+1', '시간이 오래 걸렸지만 원인을 찾았다.'],
      ['return', '제조사에 의뢰', 'leisure+1 wealth-1 relations-1', '일은 넘겼다. 손님은 오래 기다렸다.'],
    ], 'trial', '정비 자료 부족', { years: [2015, 2060] }),
  ],
  '75331': [
    ev('75331', 'maintenance_trust', [25, 62], 0.12, '입주민 대표가 점검 기록을 칭찬하며 계약을 연장했다.', 'happiness+2 relations+1 job+1', '계약 연장'),
    ev('75331', 'shaft_scare', [24, 60], 0.1, '승강로 안에서 좁은 발판 위에 서서 점검하다 아찔했다.', 'health-1 happiness-1', '승강로 작업', { dark: true }),
    ch('75331', 'quota_visit', [26, 60], 0.11, '월 점검 건수가 늘어 한 곳당 시간이 줄었다.', '어떻게 할까?', [
      ['careful', '점검 시간 유지', 'happiness+1 wealth-1 conflict+1', '꼼꼼히 봤다. 다른 건은 밀렸다.'],
      ['fast', '건수를 맞춘다', 'wealth+2 happiness-2 health-1', '건수는 맞췄다. 마음이 급했다.'],
    ], 'careful', '점검 건수', { who: 'wage' }),
  ],
  '76120': [
    ev('76120', 'fix_save', [22, 62], 0.12, '버리려던 냉장고를 고쳐 손님이 환하게 웃었다.', 'happiness+2 relations+1', '수리 성공'),
    ev('76120', 'stair_carry', [24, 60], 0.11, '엘리베이터 없는 5층에 세탁기를 들고 올랐다. 허리가 아팠다.', 'health-3 medical+1', '무거운 설치', { dark: true }),
    ch('76120', 'parts_wait', [24, 60], 0.11, '부품이 한 달 걸린다는 손님에게 새 제품을 권할지 고민이다.', '어떻게 할까?', [
      ['repair', '수리를 기다린다', 'relations+1 happiness+1 wealth-1', '시간이 걸렸다. 손님은 고마워했다.'],
      ['replace', '새 제품을 권한다', 'wealth+2 relations-1 happiness-1', '교체를 도왔다. 수리비는 줄었다.'],
    ], 'repair', '부품 대기'),
    ev('76120', 'cheap_replace', [28, 62], 0.1, '고치는 값이 새로 사는 값과 비슷해 수리 의뢰가 줄었다.', 'wealth-3 happiness-1 job+1', '수리 수요 감소', { dark: true }),
  ],
  '76221': [
    ev('76221', 'trace_find', [24, 62], 0.12, '숨은 누전 원인을 찾아내 건물 관리인이 고마워했다.', 'happiness+2 intellect+1', '고장 진단'),
    ev('76221', 'shock_scare', [22, 60], 0.1, '차단기를 확인하지 않고 작업하다 깜짝 놀랐다. 다친 곳은 없었다.', 'health-1 happiness-1 conflict+1', '감전 위험', { dark: true }),
    ch('76221', 'private_job', [28, 62], 0.1, '지인이 현장 몰래 개인 작업을 부탁한다.', '어떻게 할까?', [
      ['take', '맡는다', 'wealth+2 relations+1 happiness-2', '수입은 늘었다. 회사 눈치가 신경 쓰였다.'],
      ['refuse', '거절한다', 'happiness+1 relations-1 wealth-1', '정리했다. 지인이 서운해했다.'],
    ], 'refuse', '개인 작업 부탁', { who: 'wage' }),
  ],
  '77233': [
    ev('77233', 'speed_fix', [22, 58], 0.12, '속도가 안 나던 집을 점검해 한 번에 해결했다. 이용자가 고맙다고 했다.', 'happiness+2 relations+1', '문제 해결'),
    ev('77233', 'apartment_climb', [22, 58], 0.1, '낡은 건물 배관 틈으로 선을 넣다 먼지를 뒤집어썼다.', 'health-1 happiness-1', '열악한 현장', { dark: true }),
    ch('77233', 'sales_press', [24, 58], 0.11, '설치 중 신규 상품을 권유하라는 목표가 내려왔다.', '어떻게 할까?', [
      ['push', '권유한다', 'wealth+2 relations-2 happiness-1', '실적은 올랐다. 고객이 불편해했다.'],
      ['skip', '시공만 한다', 'relations+1 wealth-1 happiness+1', '시공에 집중했다. 실적은 낮았다.'],
    ], 'skip', '판매 압박', { who: 'wage' }),
  ],
  '78210': [
    ev('78210', 'foreign_crew', [20, 60], 0.12, '외국인 동료와 현장 용어를 몸짓으로 맞춰 가며 일했다.', 'relations+2 intellect+1', '외국인 동료 협업'),
    ev('78210', 'unpaid_wage', [22, 62], 0.11, '일당 보름 치가 밀렸다는 말이 돌아 현장이 술렁였다.', 'wealth-3 fairness+2 happiness-2', '임금 체불', { dark: true }),
    ch('78210', 'aging_body', [40, 66], 0.12, '나이가 들며 체력이 달린다. 힘쓰는 일과 감독 보조를 고민한다.', '어떻게 할까?', [
      ['assist', '보조로 옮긴다', 'health+1 wealth-2 happiness+1', '일당은 줄었지만 몸이 덜 상했다.'],
      ['stay', '그대로 일한다', 'wealth+2 health-3', '벌이는 지켰다. 밤마다 파스를 붙였다.'],
    ], 'assist', '고령화', { }),
  ],
  '78243': [
    ev('78243', 'form_good', [22, 60], 0.11, '거푸집을 뗐더니 모서리가 반듯하게 나와 검수 점수가 높았다.', 'happiness+2 job+1', '검수 통과'),
    ev('78243', 'nail_gun', [20, 58], 0.11, '네일건 반동에 놀라 손을 다쳐 며칠 쉬었다.', 'health-3 wealth-2 medical+1', '공구 사고', { dark: true }),
    ch('78243', 'piece_work', [24, 60], 0.11, '평수당 단가로 받는 공정을 팀이 제안했다.', '어떻게 할까?', [
      ['piece', '단가로 받는다', 'wealth+3 health-2 leisure-1', '빨리 끝낸 날은 수입이 늘었다.'],
      ['daily', '일당을 지킨다', 'happiness+1 wealth-1 leisure+1', '벌이는 일정했다. 속도는 느긋했다.'],
    ], 'daily', '일당·단가'),
  ],
  '78291': [
    ev('78291', 'scaffold_good', [20, 58], 0.11, '비계 조립이 점검을 한 번에 통과해 현장소장이 인정했다.', 'happiness+2 job+1', '안전 점검 통과'),
    ev('78291', 'foreign_mate', [20, 58], 0.12, '외국인 동료가 합류해 신호를 맞추며 조립 순서를 익혔다.', 'relations+2 intellect+1', '외국인 동료 협업'),
    ch('78291', 'no_harness', [22, 58], 0.11, '반장이 빨리 끝내자며 안전고리 없이 올라가라고 한다.', '어떻게 할까?', [
      ['refuse', '고리를 걸고 한다', 'health+1 relations-2 wealth-1', '일이 늦어졌다. 반장 표정이 굳었다.'],
      ['hurry', '서둘러 진행', 'wealth+2 relations+1 health-3', '일은 끝났지만 내내 마음이 불안했다.'],
    ], 'refuse', '안전 갈등', { dark: true }),
  ],
  '78351': [
    ev('78351', 'wallpaper_perfect', [22, 62], 0.11, '무늬가 어긋남 없이 맞아 집주인이 사진을 찍어 갔다.', 'happiness+2 relations+1', '솜씨 인정'),
    ev('78351', 'mold_wall', [24, 64], 0.11, '곰팡이 핀 벽을 뜯다 마스크를 써도 목이 간질거렸다.', 'health-2 medical+1', '곰팡이 노출', { dark: true }),
    ch('78351', 'silk_vs_paint', [26, 62], 0.11, '손님이 비용이 부담된다며 도배 대신 페인트를 묻는다.', '어떻게 말할까?', [
      ['wallpaper', '도배를 권한다', 'wealth+2 relations-1 happiness+1', '견적이 더 나갔지만 마감이 곱다고 했다.'],
      ['paint', '페인트를 권한다', 'wealth-1 relations+1 leisure+1', '손님 사정에 맞췄다. 일은 줄었다.'],
    ], 'wallpaper', '시공 권유'),
  ],
  '79211': [
    ev('79211', 'hot_water', [24, 62], 0.12, '난방 배관 보수를 마쳐 겨울 내내 따뜻하다는 인사를 받았다.', 'happiness+2 relations+1', '보수 성공'),
    ev('79211', 'sewer_smell', [22, 62], 0.1, '하수관에서 올라오는 냄새와 습기 속에서 한참 작업했다.', 'health-2 happiness-1', '열악한 환경', { dark: true }),
    ch('79211', 'night_flood', [24, 62], 0.11, '폭우로 지하 배관이 역류한다며 한밤에 연락이 왔다.', '나갈까?', [
      ['go', '바로 나간다', 'wealth+3 health-2 relations+1', '긴급 출장비를 받고 이웃 신뢰를 얻었다.'],
      ['wait', '아침에 간다', 'health+1 wealth-1 relations-2', '푹 잤지만 피해가 커졌다는 원망을 들었다.'],
    ], 'go', '긴급 출동'),
  ],
};
