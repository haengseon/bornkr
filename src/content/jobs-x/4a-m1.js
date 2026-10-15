import { ev, ch } from '../jobs-kit.js';

export default {
  '41112': [
    ev('41112', 'dispute_call', [21, 58], 0.14, '부부 싸움 신고 현장에서 양쪽 말을 듣느라 한 시간이 넘게 걸렸다.', 'happiness-2 health-1 conflict+1', '가정 폭력 신고 출동', { dark: true }),
    ch('41112', 'transfer_unit', [26, 55], 0.1, '수사 부서로 옮길 기회가 열렸다.', '어떻게 할까?', [
      ['move', '수사로 옮긴다', 'intellect+2 wealth+1 leisure-2 health-1', '사건 기록 업무가 늘었다. 새로 배우는 일이 많았다.'],
      ['stay', '지구대에 남는다', 'leisure+1 relations+1 intellect-1', '익숙한 팀과 교대 일정을 지켰다.'],
    ], 'stay', '부서 이동'),
    ev('41112', 'lost_child', [21, 58], 0.11, '길 잃은 아이를 찾아 보호자 품에 안겨 주었다.', 'happiness+3 relations+1', '아이 찾기'),
    ev('41112', 'promotion_exam', [26, 52], 0.1, '승진 시험에 합격해 계급이 한 단계 올랐다.', 'wealth+2 happiness+2 intellect+1', '승진', { once: true }),
  ],
  '41120': [
    ev('41120', 'rescue_save', [21, 58], 0.12, '화재 현장에서 주민을 안전하게 대피시켜 감사 인사를 받았다.', 'happiness+3 relations+1', '구조 성과'),
    ev('41120', 'fatigue_after', [21, 58], 0.12, '큰 화재를 몇 건 겪고 나자 잠이 오지 않는 날이 이어졌다.', 'health-2 happiness-3', '현장 후유 스트레스', { dark: true }),
    ch('41120', 'rescue_unit', [24, 52], 0.1, '구조 대원 선발 시험을 보라는 권유가 왔다.', '어떻게 할까?', [
      ['apply', '지원한다', 'intellect+2 health-2 leisure-2', '체력 훈련을 병행했다. 선발되면 일이 더 위험해진다.'],
      ['skip', '지금 업무를 지킨다', 'happiness+1 leisure+1 intellect-1', '현재 팀에서 일하기로 했다.'],
    ], 'skip', '구조대 선발'),
    ev('41120', 'false_call', [21, 58], 0.12, '허위 신고로 한밤중에 출동했다가 아무 일 없이 복귀했다.', 'health-1 happiness-1 leisure-1', '허위 신고 출동', { dark: true }),
  ],
  '41132': [
    ev('41132', 'rehab_letter', [22, 58], 0.1, '출소한 사람이 일자리를 얻었다며 안부 편지를 보내 왔다.', 'happiness+3 relations+1', '교정 보람'),
    ev('41132', 'inmate_tension', [22, 58], 0.13, '수용자 사이 다툼을 말리다 하루 종일 긴장이 풀리지 않았다.', 'health-2 happiness-2 conflict+1', '수용동 긴장', { dark: true }),
    ch('41132', 'counsel_course', [26, 56], 0.1, '수용자 상담 교육 과정에 참여하라는 공지가 왔다.', '어떻게 할까?', [
      ['join', '교육에 참여한다', 'intellect+3 leisure-2 happiness+1', '쉬는 날 교육을 들으며 상담 기법을 익혔다.'],
      ['rest', '휴식을 택한다', 'health+1 leisure+2 intellect-1', '교육은 미루고 쉬었다. 담당 업무는 그대로였다.'],
    ], 'join', '상담 교육'),
    ev('41132', 'understaffed', [22, 58], 0.12, '근무 인원이 모자라 휴가가 번번이 취소됐다.', 'leisure-3 health-1 job+2', '인력 부족', { dark: true, who: 'wage' }),
  ],
  '41231': [
    ev('41231', 'night_fire_drill', [30, 75], 0.12, '한밤 화재 경보가 울려 주민들을 깨워 대피시켰다.', 'happiness+2 relations+1', '대피 안내'),
    ev('41231', 'resident_insult', [30, 75], 0.13, '주차 문제로 입주민에게 욕설을 들었다. 항의할 곳이 마땅치 않았다.', 'happiness-3 conflict+2', '입주민 갑질', { dark: true }),
    ch('41231', 'task_shift', [30, 75], 0.11, '경비 업무에 분리수거 관리와 택배 보관이 더해졌다.', '어떻게 할까?', [
      ['accept', '받아들인다', 'relations+1 health-2 leisure-1', '일이 늘었지만 입주민들과 가까워졌다.'],
      ['clarify', '업무 범위를 묻는다', 'happiness+1 relations-2 conflict+1', '범위를 따지자 분위기가 서먹해졌다.'],
    ], 'accept', '업무 범위'),
    ev('41231', 'cold_post', [30, 75], 0.11, '한겨울 초소에서 밤을 지새우다 감기가 오래 갔다.', 'health-2 leisure-1', '한겨울 근무', { dark: true }),
  ],
  '42113': [
    ev('42113', 'snack_day', [25, 62], 0.12, '간식 시간에 아이들이 직접 만든 카드를 건넸다.', 'happiness+3 relations+1', '아이들의 마음'),
    ev('42113', 'contract_renew', [25, 62], 0.12, '돌봄 전담 인력 재계약 심사가 다가와 마음이 무거웠다.', 'happiness-2 wealth-1 job+3', '재계약 불안', { dark: true, who: 'wage' }),
    ch('42113', 'conflict_kids', [25, 62], 0.1, '아이들끼리 다툼이 커져 학부모가 학교에 찾아왔다.', '어떻게 할까?', [
      ['mediate', '직접 중재한다', 'relations+1 happiness-2 leisure-1', '양쪽 이야기를 듣느라 퇴근이 늦어졌다.'],
      ['report', '담임 교사에게 넘긴다', 'leisure+1 relations-1', '절차대로 전달했다. 학부모는 설명을 더 원했다.'],
    ], 'report', '학부모 항의'),
  ],
  '42191': [
    ev('42191', 'baby_laugh', [25, 64], 0.13, '맡은 아이가 처음으로 이름을 부르며 달려와 안겼다.', 'happiness+3 relations+1', '아이의 애착'),
    ev('42191', 'unpaid_extra', [25, 64], 0.12, '가정에서 계약에 없는 집안일을 거듭 부탁해 선을 긋기 어려웠다.', 'happiness-2 relations-1 conflict+2', '계약 밖 요구', { dark: true }),
    ch('42191', 'family_offer', [25, 64], 0.1, '한 가정이 월 단위 상시 돌봄으로 따로 계약하자고 했다.', '어떻게 할까?', [
      ['direct', '직접 계약한다', 'wealth+2 happiness+1 relations-1 conflict+1', '수입은 안정됐지만 기관과 거리가 생겼다.'],
      ['agency', '기관을 통한다', 'happiness+1 wealth-1 relations+1', '기관 절차를 지켰다. 수수료가 빠져나갔다.'],
    ], 'agency', '직접 계약 제안'),
  ],
  '42210': [
    ev('42210', 'client_thanks', [35, 75], 0.13, '이용자가 오늘도 와 줘서 고맙다며 따뜻한 차를 내밀었다.', 'happiness+3 relations+1', '이용자의 감사'),
    ev('42210', 'night_shift_fac', [35, 72], 0.13, '시설 야간조에서 혼자 열 명 넘게 돌보며 밤을 새웠다.', 'health-3 leisure-2', '야간 근무', { dark: true, who: 'wage' }),
    ch('42210', 'family_complaint', [35, 72], 0.11, '이용자 가족이 돌봄 방식을 두고 불만을 전했다.', '어떻게 할까?', [
      ['listen', '요청을 들어 준다', 'relations+1 happiness-2 leisure-1', '요청대로 일정을 바꿨다. 일이 더 늘었다.'],
      ['explain', '기관과 함께 설명한다', 'intellect+1 happiness-1 conflict+1', '기준을 설명했다. 가족은 일부만 받아들였다.'],
    ], 'listen', '가족 불만'),
    ev('42210', 'unpaid_travel', [35, 72], 0.12, '방문 사이 이동 시간이 일로 쳐지지 않아 시급이 낮게 느껴졌다.', 'wealth-2 happiness-1 fairness+2', '이동 시간 무급', { dark: true }),
  ],
  '42220': [
    ev('42220', 'family_gift', [35, 75], 0.12, '환자가 회복해 퇴원하며 보호자가 따로 감사 인사를 전했다.', 'happiness+3 wealth+1', '보호자의 감사'),
    ev('42220', 'night_alarm', [35, 72], 0.13, '밤마다 환자 호출벨에 깨어 쪽잠으로 한 주를 버텼다.', 'health-3 happiness-1', '야간 호출', { dark: true }),
    ch('42220', 'broker_fee', [35, 72], 0.1, '중개업체가 수수료를 올린다고 알렸다.', '어떻게 할까?', [
      ['stay', '그대로 있는다', 'wealth-2 relations+1', '수수료를 내고 꾸준히 일감을 받았다.'],
      ['direct', '병원 직접 구한다', 'wealth+1 leisure-1 happiness-1', '직접 보호자를 찾았다. 일감이 들쭉날쭉했다.'],
    ], 'stay', '중개 수수료', { dark: true }),
  ],
  '42320': [
    ev('42320', 'client_progress', [30, 72], 0.12, '이용자가 혼자 식사를 해냈다. 한참 박수를 보냈다.', 'happiness+3 relations+1', '이용자의 성취'),
    ev('42320', 'client_mood', [30, 72], 0.12, '이용자가 갑자기 화를 내며 물건을 던져 놀라서 한동안 가슴이 뛰었다.', 'happiness-2 health-1', '이용자의 돌발 행동', { dark: true }),
    ch('42320', 'extra_hours', [30, 72], 0.1, '이용자 가족이 시간을 늘려 달라고 개인적으로 부탁했다.', '어떻게 할까?', [
      ['extend', '시간을 늘린다', 'wealth+1 health-2 leisure-2', '늘어난 시간만큼 몸이 먼저 지쳤다.'],
      ['rule', '제도 범위만 한다', 'leisure+1 relations-1 happiness-1', '정해진 시간만 일했다. 가족이 서운해했다.'],
    ], 'rule', '시간 연장 부탁'),
  ],
  '42901': [
    ev('42901', 'baby_first', [28, 62], 0.12, '산모와 아기가 조리원을 떠나며 고마웠다고 인사했다.', 'happiness+3 relations+1', '산모의 감사'),
    ev('42901', 'wrist_baby', [28, 62], 0.13, '하루 종일 신생아를 안아 올리느라 손목과 어깨가 저렸다.', 'health-3 leisure-1', '반복 동작 부담', { dark: true }),
    ch('42901', 'contract_extend', [28, 62], 0.1, '가정에서 계약 기간을 연장하자고 했다. 다른 일감도 있었다.', '어떻게 할까?', [
      ['extend', '연장한다', 'wealth+2 relations+1 leisure-2', '한 가정에서 몇 주를 더 일했다.'],
      ['other', '다른 가정으로 간다', 'happiness+1 wealth+1 relations-1', '새 계약을 맡았다. 이전 가정이 아쉬워했다.'],
    ], 'extend', '계약 연장'),
    ev('42901', 'slow_season', [28, 62], 0.1, '출생이 줄어 조리원 일감이 줄고 대기 시간이 길어졌다.', 'wealth-3 happiness-1 job+3', '출생 감소', { dark: true, years: [2015, 2100] }),
  ],
  '43120': [
    ev('43120', 'perm_praise', [20, 65], 0.14, '손님이 새 스타일이 마음에 든다며 친구를 데려왔다.', 'happiness+3 wealth+1', '솜씨 인정'),
    ev('43120', 'no_show', [20, 65], 0.13, '예약 손님이 연락도 없이 오지 않아 한 시간이 비었다.', 'wealth-2 happiness-1', '예약 부도', { dark: true, who: 'self' }),
    ch('43120', 'scissors_back', [25, 60], 0.11, '손님 요청이 지나치게 까다로워 두 번째로 머리를 다시 해 달라고 했다.', '어떻게 할까?', [
      ['redo', '무료로 다시 해 준다', 'relations+2 wealth-1 leisure-1', '시간을 더 썼다. 그 손님은 단골이 되었다.'],
      ['explain', '정중히 설명한다', 'happiness-1 relations-1 conflict+1', '머릿결 한계를 설명했다. 손님은 불만을 남기고 갔다.'],
    ], 'explain', '재시술 요구', { dark: true }),
    ev('43120', 'apprentice_long', [18, 35], 0.12, '인턴 시절 샴푸와 청소만 하며 여러 달을 보냈다.', 'health-1 happiness-1 leisure-2', '수련 과정', { dark: true, who: 'wage', once: true }),
  ],
  '43130': [
    ev('43130', 'art_win', [20, 58], 0.12, '정성껏 그린 네일 아트 사진이 후기로 퍼져 예약이 늘었다.', 'happiness+3 wealth+2', '솜씨 인정', { years: [2010, 2100] }),
    ev('43130', 'late_booking', [20, 58], 0.13, '하루 열 명 넘게 시술하며 손목과 허리를 쉬지 못했다.', 'health-3 leisure-1', '반복 시술 부담', { dark: true }),
    ch('43130', 'price_war', [22, 58], 0.11, '근처에 저가 가게가 생겨 가격을 내릴지 고민했다.', '어떻게 할까?', [
      ['cut', '값을 내린다', 'relations+1 wealth-2', '손님은 늘었지만 마진이 얇아졌다.'],
      ['quality', '품질로 승부한다', 'intellect+1 happiness+1 wealth-1', '재료와 디자인을 더 챙겼다. 단골 중심으로 운영했다.'],
    ], 'quality', '가격 경쟁', { who: 'self' }),
  ],
  '43141': [
    ev('43141', 'skin_better', [22, 60], 0.12, '꾸준히 관리받은 손님의 피부가 눈에 띄게 좋아졌다며 고마워했다.', 'happiness+3 relations+1', '손님의 만족'),
    ev('43141', 'trouble_report', [22, 60], 0.12, '관리 뒤 붉어진 피부를 두고 손님이 강하게 항의했다.', 'happiness-3 conflict+2', '항의 응대', { dark: true }),
    ch('43141', 'cert_upgrade', [24, 58], 0.1, '고급 관리 과정을 들으면 시술 폭이 넓어진다는 이야기를 들었다.', '어떻게 할까?', [
      ['study', '과정을 듣는다', 'intellect+3 leisure-2 debt+700', '수강료를 내고 주말을 비웠다. 메뉴가 늘었다.'],
      ['skip', '지금 메뉴로 간다', 'leisure+1 intellect-1 wealth-1', '여유를 택했다. 새 손님을 끌기는 어려웠다.'],
    ], 'skip', '고급 과정'),
    ev('43141', 'chemical_burn', [22, 60], 0.1, '약품 때문에 손이 거칠어져 장갑 없이는 일하기 힘들었다.', 'health-2 happiness-1', '약품 접촉', { dark: true }),
  ],
  '43232': [
    ev('43232', 'family_letter', [24, 66], 0.12, '장례를 치른 유족이 정성 어린 편지로 고마움을 전했다.', 'happiness+3 relations+1', '유족의 감사'),
    ev('43232', 'dawn_call', [24, 66], 0.13, '새벽에 연락이 와 장례식장으로 달려갔다. 아침에야 돌아왔다.', 'health-2 leisure-2', '새벽 호출', { dark: true }),
    ch('43232', 'rite_choice', [24, 66], 0.1, '유족이 종교와 가족 의견이 달라 절차를 하나로 정하지 못했다.', '어떻게 할까?', [
      ['mediate', '직접 중재한다', 'relations+1 happiness-2 leisure-1', '긴 대화를 거쳐 절충안을 냈다. 양쪽이 지쳤다.'],
      ['ask', '대표 상주에게 맡긴다', 'happiness+1 relations-1', '대표자 뜻을 따랐다. 일부 가족은 불편해했다.'],
    ], 'ask', '절차 이견'),
    ev('43232', 'vendor_pressure', [24, 66], 0.1, '장례식장이 물품 판매 목표를 올려 상담이 부담스러워졌다.', 'happiness-2 conflict+1', '판매 압박', { dark: true, who: 'wage' }),
  ],
  '43331': [
    ev('43331', 'cute_owner', [20, 58], 0.13, '미용을 마친 강아지가 가게를 나서며 보호자 품에 폴짝 안겼다.', 'happiness+3 relations+1', '손님과 반려견'),
    ev('43331', 'matted_dog', [20, 58], 0.13, '털이 심하게 엉킨 개를 달래며 세 시간 넘게 작업했다.', 'health-2 leisure-1', '고난도 작업', { dark: true }),
    ch('43331', 'cut_request', [22, 58], 0.11, '보호자가 개에게 무리한 스타일을 요청했다.', '어떻게 할까?', [
      ['follow', '요청대로 한다', 'wealth+1 happiness-2 relations+1', '요청대로 했다. 개가 힘들어한 것이 마음에 남았다.'],
      ['advise', '안전한 방식을 권한다', 'happiness+1 relations-2 wealth-1', '이유를 설명했다. 보호자는 서운해하며 돌아갔다.'],
    ], 'advise', '무리한 요청', { dark: true }),
  ],
};
