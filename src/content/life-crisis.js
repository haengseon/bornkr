// 현년에 일어나는 게임 장면이다. 실제 인물·기관의 응답률이나 법률 기준이 아니다.
const o = (id, label, hint = '') => ({ id, label, hint, personality: { weights: {} } });
export const CRISIS_EVENTS = {
  recoveryDay: { id: 'sys.crisis.recovery_day', prompt: '오늘 할 일이 늦게까지 남았다. 잠과 남은 일의 순서를 어떻게 정할까?', options: [o('sleep', '오늘 남은 일을 멈추고 정해 둔 수면 시간을 지킨다'), o('late', '잠을 한 시간 줄이고 오늘 남은 일을 마저 한다', '오늘 실제로 줄인 수면 시간만 기록하며 과거의 수면 부족을 만들지 않는다.'), o('request', '해야 할 일을 나눌 수 있는지 도움을 요청한다')] },
  supportReply: { id: 'sys.crisis.support_reply', prompt: '앞서 도움을 요청한 곳에서 이번에 가능한 연락 시간을 안내했다.', options: [o('receive', '안내받은 시간에 연락해 실제 지원 대화를 받는다', '개인 시간 15분을 쓰며 한 번의 대화를 완치로 처리하지 않는다.'), o('later', '이번에는 어렵다고 답하고 다음 연락을 기다린다'), o('cancel', '현재 요청을 철회한다')] },
  workDay: { id: 'sys.crisis.work_day', prompt: '몸과 마음이 무거운 아침, 정해진 출근 시간이 다가온다.', options: [o('attend', '정해진 시간에 출근한다'), o('leave', '회사에 연락해 오늘의 휴가를 요청한다', '승인을 받기 전까지는 휴가가 확정되지 않는다.'), o('miss', '회사에 연락하지 않고 오늘 근무를 미룬다', '예정된 근무를 이행하지 않은 현재 기록이 남는다.')] },
  workReview: { id: 'sys.crisis.work_review', prompt: '회사가 앞서 있었던 근무 미이행에 관해 면담을 요청했다.', options: [o('adjust', '정해진 근무를 이행할 수 있도록 일정 조정을 협의한다'), o('attend', '다음 근무부터 기존 일정을 지키겠다고 답한다'), o('miss', '답하지 않고 이번에 예정된 근무도 미룬다', '반복 기록과 회사의 후속 대응으로 이어질 수 있다.')] },
  workNotice: { id: 'sys.crisis.work_notice', prompt: '반복된 근무 미이행 뒤 고용 종료 통지를 받았다. 효력일 전 대응을 정해야 한다.', options: [o('negotiate', '종료 전 일정 조정과 고용 유지 가능성을 다시 협의한다'), o('contest', '종료에 대한 이견을 전달하고 확인 절차를 요청한다'), o('accept', '통지된 효력일에 근무를 마칠 준비를 한다', '정당한 해고라는 법적 판단을 뜻하지 않는다.')] },
  familyDay: { id: 'sys.crisis.family_day', prompt: '오늘 맡기로 함께 정한 집안일이 남아 있다. 배우자와 어떻게 나눌까?', options: [o('do', '약속한 몫을 마친다'), o('renegotiate', '배우자에게 사정을 말하고 오늘 분담을 다시 협의한다'), o('miss', '아무 말 없이 약속한 몫을 하지 않는다')] },
  familyReview: { id: 'sys.crisis.family_review', prompt: '배우자가 반복해서 남겨진 공동 약속 때문에 부담을 느꼈다고 말했다.', options: [o('repair', '실행 가능한 분담을 합의하고 오늘의 몫을 이행한다'), o('separate', '관계를 돌아볼 시간을 갖자고 제안한다', '상대의 동의를 확인하며 법적 혼인·주소·재산은 즉시 바꾸지 않는다.'), o('ignore', '이번 대화와 오늘 약속도 미룬다')] },
  familySeparate: { id: 'sys.crisis.family_separate', prompt: '서로 거리를 두기로 한 뒤 관계의 방향을 다시 이야기할 때가 왔다.', options: [o('repair', '함께 지킬 약속부터 다시 합의한다'), o('end', '혼인을 정리할 의사가 있는지 서로 확인한다'), o('wait', '지금은 결론을 내리지 않고 시간을 더 둔다')] },
  familyConfirm: { id: 'sys.crisis.family_confirm', prompt: '서로 혼인을 정리할 뜻을 확인했다. 필요한 의사 확인과 정리 절차를 계속할까?', options: [o('confirm', '현재도 같은 뜻인지 확인하고 관계 정리 절차를 마친다'), o('pause', '진행을 멈추고 다시 협의한다')] },
  socialMeet: { id: 'sys.crisis.social_meet', prompt: '동네에서 새로 인사를 나눈 이웃이 다음 모임에도 함께하자고 한다.', options: [o('join', '연락을 주고받고 다음 모임 소식을 받기로 한다'), o('alone', '지금은 혼자 쉬는 시간을 갖겠다고 전한다')] },
  socialReply: { id: 'sys.crisis.social_reply', prompt: '연락을 주고받던 이웃에게 이번 모임 소식이 왔다.', options: [o('reply', '이번에 가능한 시간을 답하고 연락을 이어간다'), o('decline', '이번에는 쉬고 싶다고 사정을 전한다'), o('ignore', '연락을 확인하고도 여러 차례 답을 미룬다')] },
  socialRepair: { id: 'sys.crisis.social_repair', prompt: '모임에서 주고받는 연락이 줄었다. 앞으로 어떤 접점을 남기고 싶을까?', options: [o('reconnect', '다시 연락해 작게 참여할 방법을 제안한다'), o('distance', '이 모임에서는 거리를 두고 지내겠다고 알린다'), o('support', '도움을 요청할 수 있는 다른 접점을 알아본다')] },
  exclusion: { id: 'sys.crisis.exclusion', prompt: '모임 운영자가 앞선 갈등 뒤 반복해서 소식을 전달하지 않았다. 이 배제에 어떻게 대응할까?', options: [o('ask', '배제된 이유와 다시 참여할 방법을 확인해 달라고 요청한다'), o('support', '기록을 남기고 다른 지인·상담 창구의 도움을 구한다'), o('leave', '이 모임을 떠나 다른 연결을 찾아본다')] },
  safety: { id: 'sys.crisis.support', prompt: '생활의 여러 어려움이 겹쳐 혼자 버티기 어렵다. 지금 받을 수 있는 도움부터 연결해 보자.', options: [o('accompany', '연락 가능한 사람에게 곁에 있어 달라고 요청한다'), o('professional', '이용 가능한 상담·진료 창구에 연결을 요청한다', '접수와 실제 상담·회복은 별도로 기록한다.'), o('reduce', '당장의 부담 일정을 줄이는 협의를 요청한다')] },
};
