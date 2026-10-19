// 현년에 일어나는 게임 장면이다. 실제 인물·기관의 응답률이나 법률 기준이 아니다.
const o = (id, label, hint = '') => ({ id, label, hint, personality: { weights: {} } });
export const CRISIS_EVENTS = {
  recoveryDay: { id: 'sys.crisis.recovery_day', prompt: '자정이 넘었는데 할 일이 남았다.', options: [o('sleep', '일을 멈추고 잔다'), o('late', '한 시간 덜 자고 마저 한다'), o('request', '일을 나눠 달라고 한다')] },
  supportReply: { id: 'sys.crisis.support_reply', prompt: '앞서 도움을 요청한 곳에서 이번에 가능한 연락 시간을 안내했다.', options: [o('receive', '그 시간에 연락한다'), o('later', '다음 연락을 기다린다'), o('cancel', '요청을 거둔다')] },
  workDay: { id: 'sys.crisis.work_day', prompt: '몸과 마음이 무거운 아침, 정해진 출근 시간이 다가온다.', options: [o('attend', '정해진 시간에 출근한다'), o('leave', '휴가를 요청한다'), o('miss', '연락 없이 결근한다')] },
  workReview: { id: 'sys.crisis.work_review', prompt: '회사가 앞서 있었던 근무 미이행에 관해 면담을 요청했다.', options: [o('adjust', '일정 조정을 협의한다'), o('attend', '다음부터 지키겠다고 한다'), o('miss', '답 없이 또 결근한다')] },
  workNotice: { id: 'sys.crisis.work_notice', prompt: '반복된 결근 끝에 고용 종료 통지를 받았다.', options: [o('negotiate', '다시 협의한다'), o('contest', '이의를 제기한다'), o('accept', '떠날 준비를 한다')] },
  familyDay: { id: 'sys.crisis.family_day', prompt: '오늘 맡기로 함께 정한 집안일이 남아 있다. 배우자와 어떻게 나눌까?', options: [o('do', '약속한 몫을 마친다'), o('renegotiate', '사정을 말하고 다시 나눈다'), o('miss', '말없이 하지 않는다')] },
  familyReview: { id: 'sys.crisis.family_review', prompt: '배우자가 반복해서 남겨진 공동 약속 때문에 부담을 느꼈다고 말했다.', options: [o('repair', '분담을 다시 정한다'), o('separate', '시간을 갖자고 한다'), o('ignore', '이번에도 미룬다')] },
  familySeparate: { id: 'sys.crisis.family_separate', prompt: '서로 거리를 두기로 한 뒤 관계의 방향을 다시 이야기할 때가 왔다.', options: [o('repair', '약속부터 다시 정한다'), o('end', '헤어질 뜻을 묻는다'), o('wait', '시간을 더 둔다')] },
  familyConfirm: { id: 'sys.crisis.family_confirm', prompt: '서로 혼인을 정리할 뜻을 확인했다. 절차를 이어 갈까?', options: [o('confirm', '정리 절차를 마친다'), o('pause', '멈추고 다시 이야기한다')] },
  socialMeet: { id: 'sys.crisis.social_meet', prompt: '동네에서 새로 인사를 나눈 이웃이 다음 모임에도 함께하자고 한다.', options: [o('join', '연락처를 나눈다'), o('alone', '혼자 쉬겠다고 한다')] },
  socialReply: { id: 'sys.crisis.social_reply', prompt: '연락을 주고받던 이웃에게 이번 모임 소식이 왔다.', options: [o('reply', '시간을 맞춰 답한다'), o('decline', '이번엔 쉰다고 답한다'), o('ignore', '답을 미룬다')] },
  socialRepair: { id: 'sys.crisis.social_repair', prompt: '모임에서 주고받는 연락이 줄었다. 앞으로 어떤 접점을 남기고 싶을까?', options: [o('reconnect', '다시 연락해 본다'), o('distance', '거리를 둔다'), o('support', '다른 곳을 알아본다')] },
  exclusion: { id: 'sys.crisis.exclusion', prompt: '모임 소식이 나에게만 오지 않았다.', options: [o('ask', '이유를 묻는다'), o('support', '적어 두고 도움을 구한다'), o('leave', '모임을 떠난다')] },
  safety: { id: 'sys.crisis.support', prompt: '생활의 여러 어려움이 겹쳐 혼자 버티기 어렵다. 지금 받을 수 있는 도움부터 연결해 보자.', options: [o('accompany', '곁에 있어 달라고 한다'), o('professional', '상담 창구에 연락한다'), o('reduce', '일정을 줄여 달라고 한다')] },
};
