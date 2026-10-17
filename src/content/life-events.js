// LIFE-EVENTS-100 원본을 tools/build-life-events.mjs로 정적 컴파일. 개인 발생률은 사용하지 않는다.
export const LIFE_EVENTS = [
  {
    "id": "LIFE-001",
    "domain": "education",
    "years": [
      1960,
      1989
    ],
    "ages": [
      8,
      15
    ],
    "title": "차비와 준비물 사이",
    "text": "준비물을 사고 나니 이번 주 버스비가 모자란다.",
    "eligibility": "재학 중이고 등교비 부족; 도보 대체 경로가 있음",
    "requires": [
      "scenario.LIFE-001.ready"
    ],
    "cooldownYears": 4,
    "choices": [
      {
        "id": "a",
        "label": "걸어 다닌다",
        "text": "교통비 절약·이동시간 증가",
        "personality": {
          "weights": {
            "J": 0.5
          },
          "rationale": "미리 정하는 일정·경계 0.5",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-001.a",
          "actionId": "scenario.LIFE-001.a",
          "status": "implemented",
          "kind": "rule",
          "minutes": 20,
          "cost": 0,
          "record": "walk-to-school",
          "change": "commute",
          "minutesChange": 15
        },
        "effect": {
          "description": "교통비 절약·이동시간 증가",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "다음 학년: 도보 통학이 이어지면 실제 남은 자습·수면시간을 확인해 일정 조정 사건 연결",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "교통비 절약·이동시간 증가 · 장면 시간 20분 · 추가 비용 없음"
      },
      {
        "id": "b",
        "label": "보호자에게 요청한다",
        "text": "버스비를 보태 줄 수 있는지 물어본다. 받을 수 있을지는 아직 모른다.",
        "personality": {
          "weights": {},
          "rationale": "특정 성향과의 연관이 약해 중립",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-001.b",
          "actionId": "scenario.LIFE-001.b",
          "status": "implemented",
          "kind": "request",
          "minutes": 15,
          "cost": 0
        },
        "effect": {
          "description": "버스비를 보태 줄 수 있는지 물어본다. 받을 수 있을지는 아직 모른다.",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "다음 학년: 도보 통학이 이어지면 실제 남은 자습·수면시간을 확인해 일정 조정 사건 연결",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "버스비를 보태 줄 수 있는지 물어본다. 받을 수 있을지는 아직 모른다. · 장면 시간 15분 · 추가 비용 없음 · 승인·거절은 다음 해 현재 여건으로 재확인"
      },
      {
        "id": "c",
        "label": "준비물 공동 사용을 묻는다",
        "text": "동의 시 구매비 감소",
        "personality": {
          "weights": {
            "E": 0.3,
            "F": 0.3
          },
          "rationale": "직접 교류하는 방식 0.3 · 상대의 의사·관계 우선 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-001.c",
          "actionId": "scenario.LIFE-001.c",
          "status": "implemented",
          "kind": "request",
          "minutes": 15,
          "cost": 0
        },
        "effect": {
          "description": "동의 시 구매비 감소",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "다음 학년: 도보 통학이 이어지면 실제 남은 자습·수면시간을 확인해 일정 조정 사건 연결",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "동의 시 구매비 감소 · 장면 시간 15분 · 추가 비용 없음 · 승인·거절은 다음 해 현재 여건으로 재확인"
      }
    ],
    "guard": "먼 거리·위험한 길에서는 도보 선택 제외; 가난을 성적 하락으로 직결하지 않음",
    "followUp": "다음 학년: 도보 통학이 이어지면 실제 남은 자습·수면시간을 확인해 일정 조정 사건 연결",
    "cancelWhen": [
      "source-context-ended",
      "participant-unavailable",
      "required-fact-expired"
    ],
    "source": {
      "file": "docs/design/LIFE-EVENTS-100.json",
      "evidenceLevel": "fictional-scenario"
    },
    "stateDependencies": [
      "edu.stage",
      "confirmed-course-or-school-scenario"
    ],
    "probabilityKind": "game-tuning-not-statistics",
    "ready": true,
    "scenarioProfile": true,
    "implementationStatus": "implemented-conditional-scenario"
  },
  {
    "id": "LIFE-002",
    "domain": "education",
    "years": [
      1960,
      1999
    ],
    "ages": [
      12,
      18
    ],
    "title": "새 참고서 대신 서로 빌리기",
    "text": "친구가 다른 과목 참고서를 빌려주는 대신 내 책도 빌리고 싶어 한다.",
    "eligibility": "재학·소유 참고서 있음; 같은 학급 인물과 교환 제안 기록",
    "requires": [
      "scenario.LIFE-002.ready"
    ],
    "cooldownYears": 4,
    "choices": [
      {
        "id": "a",
        "label": "서로 빌린다",
        "text": "구매 보류·반환 약속 생성",
        "personality": {
          "weights": {
            "E": 0.3,
            "P": 0.3
          },
          "rationale": "직접 교류하는 방식 0.3 · 상황에 맞춘 유연한 조정 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-002.a",
          "actionId": "scenario.LIFE-002.a",
          "status": "implemented",
          "kind": "request",
          "minutes": 15,
          "cost": 0,
          "record": "textbook-exchange"
        },
        "effect": {
          "description": "구매 보류·반환 약속 생성",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "학기 말: 반환 약속 이행 여부를 확인하고 다음 대여의 신뢰 조건으로 사용",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "구매 보류·반환 약속 생성 · 장면 시간 15분 · 추가 비용 없음 · 승인·거절은 다음 해 현재 여건으로 재확인"
      },
      {
        "id": "b",
        "label": "필요한 부분만 함께 본다",
        "text": "공동 공부시간 예약",
        "personality": {
          "weights": {
            "J": 0.4,
            "F": 0.2
          },
          "rationale": "미리 정하는 일정·경계 0.4 · 상대의 의사·관계 우선 0.2",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-002.b",
          "actionId": "scenario.LIFE-002.b",
          "status": "implemented",
          "kind": "request",
          "minutes": 20,
          "cost": 0
        },
        "effect": {
          "description": "공동 공부시간 예약",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "학기 말: 반환 약속 이행 여부를 확인하고 다음 대여의 신뢰 조건으로 사용",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "공동 공부시간 예약 · 장면 시간 20분 · 추가 비용 없음 · 승인·거절은 다음 해 현재 여건으로 재확인"
      },
      {
        "id": "c",
        "label": "거절한다",
        "text": "책과 기존 관계 유지",
        "personality": {
          "weights": {
            "I": 0.3,
            "J": 0.3
          },
          "rationale": "혼자 정리할 시간 0.3 · 미리 정하는 일정·경계 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-002.c",
          "actionId": "scenario.LIFE-002.c",
          "status": "implemented",
          "kind": "hold",
          "minutes": 0,
          "cost": 0
        },
        "effect": {
          "description": "책과 기존 관계 유지",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "학기 말: 반환 약속 이행 여부를 확인하고 다음 대여의 신뢰 조건으로 사용",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "책과 기존 관계 유지 · 추가 시간 없음 · 추가 비용 없음"
      }
    ],
    "guard": "친구에게 없는 책 생성 금지; 거절만으로 우정 급락 금지",
    "followUp": "학기 말: 반환 약속 이행 여부를 확인하고 다음 대여의 신뢰 조건으로 사용",
    "cancelWhen": [
      "source-context-ended",
      "participant-unavailable",
      "required-fact-expired"
    ],
    "source": {
      "file": "docs/design/LIFE-EVENTS-100.json",
      "evidenceLevel": "fictional-scenario"
    },
    "stateDependencies": [
      "edu.stage",
      "confirmed-course-or-school-scenario"
    ],
    "probabilityKind": "game-tuning-not-statistics",
    "ready": true,
    "scenarioProfile": true,
    "implementationStatus": "implemented-conditional-scenario"
  },
  {
    "id": "LIFE-003",
    "domain": "education",
    "years": [
      1960,
      2026
    ],
    "ages": [
      13,
      18
    ],
    "title": "빨리 벌지 더 배울지",
    "text": "집에서는 빨리 일을 시작하길 바라지만 나는 다른 진학 경로도 궁금하다.",
    "eligibility": "학업 지속 중; 취업·진학 경로 미확정; 보호자와 상담 가능한 상태",
    "requires": [
      "scenario.LIFE-003.ready"
    ],
    "cooldownYears": 4,
    "choices": [
      {
        "id": "a",
        "label": "취업 경로를 조사한다",
        "text": "지원 가능한 경로 목록",
        "personality": {
          "weights": {
            "S": 0.3,
            "J": 0.3
          },
          "rationale": "익숙하고 구체적인 수단 0.3 · 미리 정하는 일정·경계 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-003.a",
          "actionId": "scenario.LIFE-003.a",
          "status": "implemented",
          "kind": "record",
          "minutes": 25,
          "cost": 0
        },
        "effect": {
          "description": "지원 가능한 경로 목록",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "졸업 시점: 실제 지원·합격·등록 절차를 통과한 경로만 직업 또는 학적으로 연결",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "지원 가능한 경로 목록 · 장면 시간 25분 · 추가 비용 없음"
      },
      {
        "id": "b",
        "label": "진학 비용을 계산한다",
        "text": "학비·통학 부담 확인",
        "personality": {
          "weights": {
            "N": 0.4,
            "J": 0.3
          },
          "rationale": "새 방법 탐색 0.4 · 미리 정하는 일정·경계 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-003.b",
          "actionId": "scenario.LIFE-003.b",
          "status": "implemented",
          "kind": "record",
          "minutes": 20,
          "cost": 0
        },
        "effect": {
          "description": "학비·통학 부담 확인",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "졸업 시점: 실제 지원·합격·등록 절차를 통과한 경로만 직업 또는 학적으로 연결",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "학비·통학 부담 확인 · 장면 시간 20분 · 추가 비용 없음"
      },
      {
        "id": "c",
        "label": "상담을 함께 받는다",
        "text": "보호자와 대화 기록",
        "personality": {
          "weights": {
            "E": 0.2,
            "F": 0.3
          },
          "rationale": "직접 교류하는 방식 0.2 · 상대의 의사·관계 우선 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-003.c",
          "actionId": "scenario.LIFE-003.c",
          "status": "implemented",
          "kind": "request",
          "minutes": 20,
          "cost": 0
        },
        "effect": {
          "description": "보호자와 대화 기록",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "졸업 시점: 실제 지원·합격·등록 절차를 통과한 경로만 직업 또는 학적으로 연결",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "보호자와 대화 기록 · 장면 시간 20분 · 추가 비용 없음 · 승인·거절은 다음 해 현재 여건으로 재확인"
      }
    ],
    "guard": "상담 한 번으로 합격·화해 보장 금지; 해당 시대 학교·직업 경로만 노출",
    "followUp": "졸업 시점: 실제 지원·합격·등록 절차를 통과한 경로만 직업 또는 학적으로 연결",
    "cancelWhen": [
      "source-context-ended",
      "participant-unavailable",
      "required-fact-expired"
    ],
    "source": {
      "file": "docs/design/LIFE-EVENTS-100.json",
      "evidenceLevel": "fictional-scenario"
    },
    "stateDependencies": [
      "edu.stage",
      "confirmed-course-or-school-scenario"
    ],
    "probabilityKind": "game-tuning-not-statistics",
    "ready": true,
    "scenarioProfile": true,
    "implementationStatus": "implemented-conditional-scenario"
  },
  {
    "id": "LIFE-004",
    "domain": "education",
    "years": [
      1980,
      2026
    ],
    "ages": [
      14,
      18
    ],
    "title": "학원 한 과목을 줄인다면",
    "text": "학원비를 모두 내면 다른 생활비가 빠듯해진다.",
    "eligibility": "유료 학습 이용 중; 가구 적자 또는 비용 분담 충돌",
    "requires": [
      "scenario.LIFE-004.ready"
    ],
    "cooldownYears": 4,
    "choices": [
      {
        "id": "a",
        "label": "한 과목 중단",
        "text": "해당 비용만 감소·빈 시간 생성",
        "personality": {
          "weights": {
            "T": 0.4,
            "J": 0.4
          },
          "rationale": "명시적인 조건·비용 비교 0.4 · 미리 정하는 일정·경계 0.4",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-004.a",
          "actionId": "scenario.LIFE-004.a",
          "status": "implemented",
          "kind": "rule",
          "minutes": 10,
          "cost": 0,
          "change": "tutoring",
          "tutoringDelta": -1
        },
        "effect": {
          "description": "해당 비용만 감소·빈 시간 생성",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "다음 해: 자습 공간·실제 학습시간이 확보됐는지 확인해 공부 방식 재평가",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "해당 비용만 감소·빈 시간 생성 · 장면 시간 10분 · 추가 비용 없음"
      },
      {
        "id": "b",
        "label": "자습 대안 찾기",
        "text": "접근 가능한 장소 탐색",
        "personality": {
          "weights": {
            "N": 0.4,
            "P": 0.2
          },
          "rationale": "새 방법 탐색 0.4 · 상황에 맞춘 유연한 조정 0.2",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-004.b",
          "actionId": "scenario.LIFE-004.b",
          "status": "implemented",
          "kind": "record",
          "minutes": 20,
          "cost": 0
        },
        "effect": {
          "description": "접근 가능한 장소 탐색",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "다음 해: 자습 공간·실제 학습시간이 확보됐는지 확인해 공부 방식 재평가",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "접근 가능한 장소 탐색 · 장면 시간 20분 · 추가 비용 없음"
      },
      {
        "id": "c",
        "label": "유지하고 다른 재량 지출 조정",
        "text": "장부 재계산",
        "personality": {
          "weights": {
            "J": 0.4
          },
          "rationale": "미리 정하는 일정·경계 0.4",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-004.c",
          "actionId": "scenario.LIFE-004.c",
          "status": "implemented",
          "kind": "rule",
          "minutes": 15,
          "cost": 0,
          "record": "discretionary-budget-reviewed"
        },
        "effect": {
          "description": "장부 재계산",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "다음 해: 자습 공간·실제 학습시간이 확보됐는지 확인해 공부 방식 재평가",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "장부 재계산 · 장면 시간 15분 · 추가 비용 없음"
      }
    ],
    "guard": "중단 즉시 학습능력 차감 금지; 무료 공간 이용 가능성 확인",
    "followUp": "다음 해: 자습 공간·실제 학습시간이 확보됐는지 확인해 공부 방식 재평가",
    "cancelWhen": [
      "source-context-ended",
      "participant-unavailable",
      "required-fact-expired"
    ],
    "source": {
      "file": "docs/design/LIFE-EVENTS-100.json",
      "evidenceLevel": "fictional-scenario"
    },
    "stateDependencies": [
      "edu.stage",
      "confirmed-course-or-school-scenario"
    ],
    "probabilityKind": "game-tuning-not-statistics",
    "ready": true,
    "scenarioProfile": true,
    "implementationStatus": "implemented-conditional-scenario"
  },
  {
    "id": "LIFE-005",
    "domain": "education",
    "years": [
      1995,
      2026
    ],
    "ages": [
      15,
      24
    ],
    "title": "면접 날 비는 돌봄 자리",
    "text": "원하는 학교의 면접 날에 가족을 돌볼 사람이 없다.",
    "eligibility": "실제 원서·면접 일정과 가구 돌봄 일정이 겹침",
    "requires": [
      "scenario.LIFE-005.ready"
    ],
    "cooldownYears": 4,
    "choices": [
      {
        "id": "a",
        "label": "가족과 교대 협의",
        "text": "동의 시 일정 확보",
        "personality": {
          "weights": {
            "J": 0.4,
            "F": 0.3
          },
          "rationale": "미리 정하는 일정·경계 0.4 · 상대의 의사·관계 우선 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-005.a",
          "actionId": "scenario.LIFE-005.a",
          "status": "specification-only"
        },
        "effect": {
          "description": "동의 시 일정 확보",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "면접일: 교대가 실제 성립했을 때만 참석; 결과 발표 뒤 합격 여부 기록",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      },
      {
        "id": "b",
        "label": "확인된 돌봄 수단 문의",
        "text": "비용·시간 견적",
        "personality": {
          "weights": {
            "E": 0.2,
            "J": 0.4
          },
          "rationale": "직접 교류하는 방식 0.2 · 미리 정하는 일정·경계 0.4",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-005.b",
          "actionId": "scenario.LIFE-005.b",
          "status": "specification-only"
        },
        "effect": {
          "description": "비용·시간 견적",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "면접일: 교대가 실제 성립했을 때만 참석; 결과 발표 뒤 합격 여부 기록",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      },
      {
        "id": "c",
        "label": "면접 포기",
        "text": "해당 지원만 종료",
        "personality": {
          "weights": {},
          "rationale": "특정 성향과의 연관이 약해 중립",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-005.c",
          "actionId": "scenario.LIFE-005.c",
          "status": "specification-only"
        },
        "effect": {
          "description": "해당 지원만 종료",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "면접일: 교대가 실제 성립했을 때만 참석; 결과 발표 뒤 합격 여부 기록",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      }
    ],
    "guard": "돌봄 인물·책임 없으면 발생 금지; 참석을 합격으로 처리 금지",
    "followUp": "면접일: 교대가 실제 성립했을 때만 참석; 결과 발표 뒤 합격 여부 기록",
    "cancelWhen": [
      "source-context-ended",
      "participant-unavailable",
      "required-fact-expired"
    ],
    "source": {
      "file": "docs/design/LIFE-EVENTS-100.json",
      "evidenceLevel": "fictional-scenario"
    },
    "stateDependencies": [
      "edu.stage",
      "confirmed-course-or-school-scenario"
    ],
    "probabilityKind": "game-tuning-not-statistics",
    "ready": false,
    "implementationStatus": "deferred-state-or-policy-verification",
    "deferredReason": "원본 조건(실제 원서·면접 일정과 가구 돌봄 일정이 겹침)을 만족하는 실제 상태·제도·당사자 입력과 실행 처리가 아직 연결되지 않음. 과거 인물·소유물·진단·공식 통지를 소급 생성하지 않음."
  },
  {
    "id": "LIFE-006",
    "domain": "education",
    "years": [
      2000,
      2026
    ],
    "ages": [
      18,
      29
    ],
    "title": "실습 수업과 마감 근무",
    "text": "빠질 수 없는 실습 시간에 점장이 근무를 부탁한다.",
    "eligibility": "재학·필수 수강 일정 있음; 아르바이트 근무표 충돌",
    "requires": [
      "scenario.LIFE-006.ready"
    ],
    "cooldownYears": 4,
    "choices": [
      {
        "id": "a",
        "label": "근무 교대 요청",
        "text": "수락 시 수업 참석",
        "personality": {
          "weights": {
            "E": 0.2,
            "J": 0.4
          },
          "rationale": "직접 교류하는 방식 0.2 · 미리 정하는 일정·경계 0.4",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-006.a",
          "actionId": "scenario.LIFE-006.a",
          "status": "implemented",
          "kind": "request",
          "minutes": 15,
          "cost": 0
        },
        "effect": {
          "description": "수락 시 수업 참석",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "학기 말: 실제 출석·과제 요건에 따라 이수 판정; 포기한 추가 수당만 기회비용으로 기록",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "수락 시 수업 참석 · 장면 시간 15분 · 추가 비용 없음 · 승인·거절은 다음 해 현재 여건으로 재확인"
      },
      {
        "id": "b",
        "label": "추가 근무 거절",
        "text": "예정 수입 유지",
        "personality": {
          "weights": {
            "J": 0.4
          },
          "rationale": "미리 정하는 일정·경계 0.4",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-006.b",
          "actionId": "scenario.LIFE-006.b",
          "status": "implemented",
          "kind": "rule",
          "minutes": 5,
          "cost": 0,
          "record": "extra-shift-declined"
        },
        "effect": {
          "description": "예정 수입 유지",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "학기 말: 실제 출석·과제 요건에 따라 이수 판정; 포기한 추가 수당만 기회비용으로 기록",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "예정 수입 유지 · 장면 시간 5분 · 추가 비용 없음"
      },
      {
        "id": "c",
        "label": "수업 담당자와 대안 확인",
        "text": "승인 시 일정 변경",
        "personality": {
          "weights": {
            "E": 0.2,
            "P": 0.3
          },
          "rationale": "직접 교류하는 방식 0.2 · 상황에 맞춘 유연한 조정 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-006.c",
          "actionId": "scenario.LIFE-006.c",
          "status": "implemented",
          "kind": "request",
          "minutes": 20,
          "cost": 0
        },
        "effect": {
          "description": "승인 시 일정 변경",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "학기 말: 실제 출석·과제 요건에 따라 이수 판정; 포기한 추가 수당만 기회비용으로 기록",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "승인 시 일정 변경 · 장면 시간 20분 · 추가 비용 없음 · 승인·거절은 다음 해 현재 여건으로 재확인"
      }
    ],
    "guard": "거절을 해고로 자동 연결하지 않음; 기본 급여 중복 삭감 금지",
    "followUp": "학기 말: 실제 출석·과제 요건에 따라 이수 판정; 포기한 추가 수당만 기회비용으로 기록",
    "cancelWhen": [
      "source-context-ended",
      "participant-unavailable",
      "required-fact-expired"
    ],
    "source": {
      "file": "docs/design/LIFE-EVENTS-100.json",
      "evidenceLevel": "fictional-scenario"
    },
    "stateDependencies": [
      "edu.stage",
      "confirmed-course-or-school-scenario"
    ],
    "probabilityKind": "game-tuning-not-statistics",
    "ready": true,
    "scenarioProfile": true,
    "implementationStatus": "implemented-conditional-scenario"
  },
  {
    "id": "LIFE-007",
    "domain": "education",
    "years": [
      2000,
      2026
    ],
    "ages": [
      19,
      45
    ],
    "title": "시험을 하나 더 접수할까",
    "text": "시험 일정이 겹치고 접수비도 만만치 않다.",
    "ready": true,
    "requires": [
      "scenario.LIFE-007.ready"
    ],
    "eligibility": "취업 준비 또는 전직 계획; 응시 가능한 자격시험·접수비 있음",
    "choices": [
      {
        "id": "a",
        "label": "하나만 접수",
        "text": "선택한 비용 차감",
        "personality": {
          "weights": {
            "J": 0.6
          },
          "rationale": "미리 정하는 일정·경계 0.6",
          "authored": true
        },
        "operation": {
          "id": "scenario.LIFE-007.a",
          "actionId": "scenario.LIFE-007.a",
          "status": "implemented",
          "kind": "expense",
          "minutes": 30,
          "cost": 5,
          "record": "exam-registered"
        },
        "effect": {
          "description": "선택한 비용 차감",
          "applyAutomatically": false
        },
        "followUp": {
          "afterYears": 1,
          "description": "발표 시점: 응시·합격/불합격을 각각 남기고 자격 취득 뒤에만 해당 취업 조건 충족 실제 일정이 1년 안에 끝나면 같은 연도 기록에서 처리하고 다음 연도에는 이행 여부만 재확인한다.",
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-facts-invalid",
            "participant-unavailable",
            "context-changed"
          ],
          "automaticSuccess": false,
          "duePolicy": "next-annual-review-after-recorded-deadline"
        },
        "requires": [],
        "hint": "선택한 비용 차감 · 장면 시간 30분 · 5만 원 · 이번 선택에서 지출"
      },
      {
        "id": "b",
        "label": "두 개 접수",
        "text": "비용·준비시간 분배",
        "personality": {
          "weights": {
            "P": 0.4,
            "N": 0.2
          },
          "rationale": "상황에 맞춘 유연한 조정 0.4 · 새 방법 탐색 0.2",
          "authored": true
        },
        "operation": {
          "id": "scenario.LIFE-007.b",
          "actionId": "scenario.LIFE-007.b",
          "status": "implemented",
          "kind": "expense",
          "minutes": 45,
          "cost": 10,
          "record": "two-exams-registered"
        },
        "effect": {
          "description": "비용·준비시간 분배",
          "applyAutomatically": false
        },
        "followUp": {
          "afterYears": 1,
          "description": "발표 시점: 응시·합격/불합격을 각각 남기고 자격 취득 뒤에만 해당 취업 조건 충족 실제 일정이 1년 안에 끝나면 같은 연도 기록에서 처리하고 다음 연도에는 이행 여부만 재확인한다.",
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-facts-invalid",
            "participant-unavailable",
            "context-changed"
          ],
          "automaticSuccess": false,
          "duePolicy": "next-annual-review-after-recorded-deadline"
        },
        "requires": [],
        "hint": "비용·준비시간 분배 · 장면 시간 45분 · 10만 원 · 이번 선택에서 지출"
      },
      {
        "id": "c",
        "label": "다음 회차로 미룸",
        "text": "현재 접수 없음",
        "personality": {
          "weights": {
            "P": 0.4
          },
          "rationale": "상황에 맞춘 유연한 조정 0.4",
          "authored": true
        },
        "operation": {
          "id": "scenario.LIFE-007.c",
          "actionId": "scenario.LIFE-007.c",
          "status": "implemented",
          "kind": "hold",
          "minutes": 0,
          "cost": 0
        },
        "effect": {
          "description": "현재 접수 없음",
          "applyAutomatically": false
        },
        "followUp": {
          "afterYears": 1,
          "description": "발표 시점: 응시·합격/불합격을 각각 남기고 자격 취득 뒤에만 해당 취업 조건 충족 실제 일정이 1년 안에 끝나면 같은 연도 기록에서 처리하고 다음 연도에는 이행 여부만 재확인한다.",
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-facts-invalid",
            "participant-unavailable",
            "context-changed"
          ],
          "automaticSuccess": false,
          "duePolicy": "next-annual-review-after-recorded-deadline"
        },
        "requires": [],
        "hint": "현재 접수 없음 · 추가 시간 없음 · 추가 비용 없음"
      }
    ],
    "cancelWhen": [
      "required-fact-missing-or-expired",
      "source-context-ended",
      "actor-or-counterparty-no-longer-eligible"
    ],
    "guard": "접수→자격 취득 자동 전환 금지; 공무원 시험과 일반 자격증 구분",
    "followUp": "발표 시점: 응시·합격/불합격을 각각 남기고 자격 취득 뒤에만 해당 취업 조건 충족",
    "source": {
      "file": "docs/design/LIFE-EVENTS-100.json",
      "evidenceLevel": "fictional-scenario"
    },
    "stateDependencies": [
      "edu.stage",
      "confirmed-course-or-school-scenario"
    ],
    "probabilityKind": "game-tuning-not-statistics",
    "scenarioProfile": true,
    "implementationStatus": "implemented-conditional-scenario"
  },
  {
    "id": "LIFE-008",
    "domain": "education",
    "years": [
      2020,
      2022
    ],
    "ages": [
      8,
      24
    ],
    "title": "수업에 쓸 화면이 하나뿐",
    "text": "내 수업과 형제자매의 수업이 같은 시간에 열린다.",
    "eligibility": "해당 연도·학교 원격수업 사실 확인; 동거인과 기기 공유",
    "requires": [
      "scenario.LIFE-008.ready"
    ],
    "cooldownYears": 4,
    "choices": [
      {
        "id": "a",
        "label": "사용시간 협의",
        "text": "일정표 생성",
        "personality": {
          "weights": {
            "J": 0.4
          },
          "rationale": "미리 정하는 일정·경계 0.4",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-008.a",
          "actionId": "scenario.LIFE-008.a",
          "status": "specification-only"
        },
        "effect": {
          "description": "일정표 생성",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "다음 학기: 실제 기기 접근과 출석 기록을 확인해 보충수업 여부 연결",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      },
      {
        "id": "b",
        "label": "학교 대여 문의",
        "text": "승인·수령 뒤 기기 접근",
        "personality": {
          "weights": {
            "E": 0.2,
            "J": 0.3
          },
          "rationale": "직접 교류하는 방식 0.2 · 미리 정하는 일정·경계 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-008.b",
          "actionId": "scenario.LIFE-008.b",
          "status": "specification-only"
        },
        "effect": {
          "description": "승인·수령 뒤 기기 접근",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "다음 학기: 실제 기기 접근과 출석 기록을 확인해 보충수업 여부 연결",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      },
      {
        "id": "c",
        "label": "가능한 다른 접속수단 사용",
        "text": "데이터 비용 발생",
        "personality": {
          "weights": {
            "P": 0.3
          },
          "rationale": "상황에 맞춘 유연한 조정 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-008.c",
          "actionId": "scenario.LIFE-008.c",
          "status": "specification-only"
        },
        "effect": {
          "description": "데이터 비용 발생",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "다음 학기: 실제 기기 접근과 출석 기록을 확인해 보충수업 여부 연결",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      }
    ],
    "guard": "전국 모든 학교 동일 운영 가정 금지; 지원금·대여 자동 승인 금지",
    "followUp": "다음 학기: 실제 기기 접근과 출석 기록을 확인해 보충수업 여부 연결",
    "cancelWhen": [
      "source-context-ended",
      "participant-unavailable",
      "required-fact-expired"
    ],
    "source": {
      "file": "docs/design/LIFE-EVENTS-100.json",
      "evidenceLevel": "fictional-scenario"
    },
    "stateDependencies": [
      "edu.stage",
      "confirmed-course-or-school-scenario"
    ],
    "probabilityKind": "game-tuning-not-statistics",
    "ready": false,
    "implementationStatus": "deferred-state-or-policy-verification",
    "deferredReason": "원본 조건(해당 연도·학교 원격수업 사실 확인; 동거인과 기기 공유)을 만족하는 실제 상태·제도·당사자 입력과 실행 처리가 아직 연결되지 않음. 과거 인물·소유물·진단·공식 통지를 소급 생성하지 않음."
  },
  {
    "id": "LIFE-009",
    "domain": "education",
    "years": [
      2005,
      2026
    ],
    "ages": [
      25,
      65
    ],
    "title": "다시 배우는 저녁",
    "text": "퇴근 뒤 들을 만한 수업이 생겼지만 매주 시간을 비워야 한다.",
    "ready": true,
    "requires": [
      "scenario.LIFE-009.ready"
    ],
    "eligibility": "취업 중; 재교육 과정과 근무시간 확인; 수강료 부담 가능",
    "choices": [
      {
        "id": "a",
        "label": "수강",
        "text": "비용·시간 예약",
        "personality": {
          "weights": {
            "N": 0.4,
            "J": 0.4
          },
          "rationale": "새 방법 탐색 0.4 · 미리 정하는 일정·경계 0.4",
          "authored": true
        },
        "operation": {
          "id": "scenario.LIFE-009.a",
          "actionId": "scenario.LIFE-009.a",
          "status": "implemented",
          "kind": "expense",
          "minutes": 40,
          "cost": 12,
          "record": "course-enrolled"
        },
        "effect": {
          "description": "비용·시간 예약",
          "applyAutomatically": false
        },
        "followUp": {
          "afterYears": 1,
          "description": "수료 시점: 실제 출석을 충족하면 수료 기록; 채용 기회가 생길 때만 기술 이력 참조 실제 일정이 1년 안에 끝나면 같은 연도 기록에서 처리하고 다음 연도에는 이행 여부만 재확인한다.",
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-facts-invalid",
            "participant-unavailable",
            "context-changed"
          ],
          "automaticSuccess": false,
          "duePolicy": "next-annual-review-after-recorded-deadline"
        },
        "requires": [],
        "hint": "비용·시간 예약 · 장면 시간 40분 · 12만 원 · 이번 선택에서 지출"
      },
      {
        "id": "b",
        "label": "직장에 일정 조정 요청",
        "text": "합의 시 근무표 변경",
        "personality": {
          "weights": {
            "E": 0.2,
            "J": 0.3
          },
          "rationale": "직접 교류하는 방식 0.2 · 미리 정하는 일정·경계 0.3",
          "authored": true
        },
        "operation": {
          "id": "scenario.LIFE-009.b",
          "actionId": "scenario.LIFE-009.b",
          "status": "implemented",
          "kind": "request",
          "minutes": 15,
          "cost": 0
        },
        "effect": {
          "description": "합의 시 근무표 변경",
          "applyAutomatically": false
        },
        "followUp": {
          "afterYears": 1,
          "description": "수료 시점: 실제 출석을 충족하면 수료 기록; 채용 기회가 생길 때만 기술 이력 참조 실제 일정이 1년 안에 끝나면 같은 연도 기록에서 처리하고 다음 연도에는 이행 여부만 재확인한다.",
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-facts-invalid",
            "participant-unavailable",
            "context-changed"
          ],
          "automaticSuccess": false,
          "duePolicy": "next-annual-review-after-recorded-deadline"
        },
        "requires": [],
        "hint": "합의 시 근무표 변경 · 장면 시간 15분 · 추가 비용 없음 · 승인·거절은 다음 해 현재 여건으로 재확인"
      },
      {
        "id": "c",
        "label": "보류",
        "text": "기존 생활 유지",
        "personality": {
          "weights": {},
          "rationale": "특정 성향과의 연관이 약해 중립",
          "authored": true
        },
        "operation": {
          "id": "scenario.LIFE-009.c",
          "actionId": "scenario.LIFE-009.c",
          "status": "implemented",
          "kind": "hold",
          "minutes": 0,
          "cost": 0
        },
        "effect": {
          "description": "기존 생활 유지",
          "applyAutomatically": false
        },
        "followUp": {
          "afterYears": 1,
          "description": "수료 시점: 실제 출석을 충족하면 수료 기록; 채용 기회가 생길 때만 기술 이력 참조 실제 일정이 1년 안에 끝나면 같은 연도 기록에서 처리하고 다음 연도에는 이행 여부만 재확인한다.",
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-facts-invalid",
            "participant-unavailable",
            "context-changed"
          ],
          "automaticSuccess": false,
          "duePolicy": "next-annual-review-after-recorded-deadline"
        },
        "requires": [],
        "hint": "기존 생활 유지 · 추가 시간 없음 · 추가 비용 없음"
      }
    ],
    "cancelWhen": [
      "required-fact-missing-or-expired",
      "source-context-ended",
      "actor-or-counterparty-no-longer-eligible"
    ],
    "guard": "수료만으로 승진·임금 인상 금지; 나이만으로 학습 불능 처리 금지",
    "followUp": "수료 시점: 실제 출석을 충족하면 수료 기록; 채용 기회가 생길 때만 기술 이력 참조",
    "source": {
      "file": "docs/design/LIFE-EVENTS-100.json",
      "evidenceLevel": "fictional-scenario"
    },
    "stateDependencies": [
      "edu.stage",
      "confirmed-course-or-school-scenario"
    ],
    "probabilityKind": "game-tuning-not-statistics",
    "scenarioProfile": true,
    "implementationStatus": "implemented-conditional-scenario"
  },
  {
    "id": "LIFE-010",
    "domain": "education",
    "years": [
      1990,
      2026
    ],
    "ages": [
      10,
      19
    ],
    "title": "같은 조의 준비물 비용",
    "text": "조별 과제에서 비싼 재료를 사자는 이야기가 나온다.",
    "eligibility": "학교 활동·재료비 요청; 보호자 부담 논의가 가능한 상태",
    "requires": [
      "scenario.LIFE-010.ready"
    ],
    "cooldownYears": 4,
    "choices": [
      {
        "id": "a",
        "label": "저렴한 설계 제안",
        "text": "합의 시 공동비용 감소",
        "personality": {
          "weights": {
            "N": 0.4,
            "T": 0.2
          },
          "rationale": "새 방법 탐색 0.4 · 명시적인 조건·비용 비교 0.2",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-010.a",
          "actionId": "scenario.LIFE-010.a",
          "status": "implemented",
          "kind": "request",
          "minutes": 15,
          "cost": 0
        },
        "effect": {
          "description": "합의 시 공동비용 감소",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "제출 시점: 합의한 역할 이행과 실제 결과로 협업 기억 기록",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "합의 시 공동비용 감소 · 장면 시간 15분 · 추가 비용 없음 · 승인·거절은 다음 해 현재 여건으로 재확인"
      },
      {
        "id": "b",
        "label": "부담 한도 알리기",
        "text": "분담 재협상",
        "personality": {
          "weights": {
            "F": 0.3,
            "J": 0.3
          },
          "rationale": "상대의 의사·관계 우선 0.3 · 미리 정하는 일정·경계 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-010.b",
          "actionId": "scenario.LIFE-010.b",
          "status": "implemented",
          "kind": "request",
          "minutes": 10,
          "cost": 0
        },
        "effect": {
          "description": "분담 재협상",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "제출 시점: 합의한 역할 이행과 실제 결과로 협업 기억 기록",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "분담 재협상 · 장면 시간 10분 · 추가 비용 없음 · 승인·거절은 다음 해 현재 여건으로 재확인"
      },
      {
        "id": "c",
        "label": "기존 안 참여",
        "text": "자기 몫만 차감",
        "personality": {
          "weights": {},
          "rationale": "특정 성향과의 연관이 약해 중립",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-010.c",
          "actionId": "scenario.LIFE-010.c",
          "status": "implemented",
          "kind": "expense",
          "minutes": 20,
          "cost": 1,
          "record": "school-project-materials"
        },
        "effect": {
          "description": "자기 몫만 차감",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "제출 시점: 합의한 역할 이행과 실제 결과로 협업 기억 기록",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "자기 몫만 차감 · 장면 시간 20분 · 1만 원 · 이번 선택에서 지출"
      }
    ],
    "guard": "돈 많이 썼다고 평가 자동 상승 금지; 조원에게 부담 능력 임의 부여 금지",
    "followUp": "제출 시점: 합의한 역할 이행과 실제 결과로 협업 기억 기록",
    "cancelWhen": [
      "source-context-ended",
      "participant-unavailable",
      "required-fact-expired"
    ],
    "source": {
      "file": "docs/design/LIFE-EVENTS-100.json",
      "evidenceLevel": "fictional-scenario"
    },
    "stateDependencies": [
      "edu.stage",
      "confirmed-course-or-school-scenario"
    ],
    "probabilityKind": "game-tuning-not-statistics",
    "ready": true,
    "scenarioProfile": true,
    "implementationStatus": "implemented-conditional-scenario"
  },
  {
    "id": "LIFE-011",
    "domain": "employment",
    "years": [
      1960,
      1989
    ],
    "ages": [
      16,
      35
    ],
    "title": "기숙사 자리와 고향집",
    "text": "공장 기숙사에 들어가면 출퇴근은 줄지만 집에 자주 가기 어렵다.",
    "eligibility": "고용된 사업장·숙소 제안 있음; 가족과 떨어져 거주 가능",
    "requires": [
      "scenario.LIFE-011.ready"
    ],
    "cooldownYears": 4,
    "choices": [
      {
        "id": "a",
        "label": "입주",
        "text": "확정 비용·통근 변경",
        "personality": {
          "weights": {
            "S": 0.3,
            "J": 0.3
          },
          "rationale": "익숙하고 구체적인 수단 0.3 · 미리 정하는 일정·경계 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-011.a",
          "actionId": "scenario.LIFE-011.a",
          "status": "specification-only"
        },
        "effect": {
          "description": "확정 비용·통근 변경",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "다음 해: 실제 방문 횟수와 연락 이력에 따라 가족 접촉 상태 변화",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      },
      {
        "id": "b",
        "label": "기존 집 유지",
        "text": "통근 유지",
        "personality": {
          "weights": {
            "F": 0.4
          },
          "rationale": "상대의 의사·관계 우선 0.4",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-011.b",
          "actionId": "scenario.LIFE-011.b",
          "status": "specification-only"
        },
        "effect": {
          "description": "통근 유지",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "다음 해: 실제 방문 횟수와 연락 이력에 따라 가족 접촉 상태 변화",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      },
      {
        "id": "c",
        "label": "방을 직접 찾기",
        "text": "탐색시간·견적 기록",
        "personality": {
          "weights": {
            "N": 0.3,
            "P": 0.3
          },
          "rationale": "새 방법 탐색 0.3 · 상황에 맞춘 유연한 조정 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-011.c",
          "actionId": "scenario.LIFE-011.c",
          "status": "specification-only"
        },
        "effect": {
          "description": "탐색시간·견적 기록",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "다음 해: 실제 방문 횟수와 연락 이력에 따라 가족 접촉 상태 변화",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      }
    ],
    "guard": "입주 승인 전 주소 변경 금지; 기숙사 조건 시대·사업장 확인",
    "followUp": "다음 해: 실제 방문 횟수와 연락 이력에 따라 가족 접촉 상태 변화",
    "cancelWhen": [
      "source-context-ended",
      "participant-unavailable",
      "required-fact-expired"
    ],
    "source": {
      "file": "docs/design/LIFE-EVENTS-100.json",
      "evidenceLevel": "fictional-scenario"
    },
    "stateDependencies": [
      "job.status",
      "current-workplace-or-contract"
    ],
    "probabilityKind": "game-tuning-not-statistics",
    "ready": false,
    "implementationStatus": "deferred-state-or-policy-verification",
    "deferredReason": "원본 조건(고용된 사업장·숙소 제안 있음; 가족과 떨어져 거주 가능)을 만족하는 실제 상태·제도·당사자 입력과 실행 처리가 아직 연결되지 않음. 과거 인물·소유물·진단·공식 통지를 소급 생성하지 않음."
  },
  {
    "id": "LIFE-012",
    "domain": "employment",
    "years": [
      1970,
      2026
    ],
    "ages": [
      18,
      65
    ],
    "title": "새 기계 앞의 첫 주",
    "text": "익숙한 작업 방식이 바뀌고 교육 시간을 정해야 한다.",
    "eligibility": "현재 직무의 장비 변경 공지; 교육 기회 있음",
    "requires": [
      "scenario.LIFE-012.ready"
    ],
    "cooldownYears": 4,
    "choices": [
      {
        "id": "a",
        "label": "교육 참여",
        "text": "근무·학습시간 배정",
        "personality": {
          "weights": {
            "J": 0.5
          },
          "rationale": "미리 정하는 일정·경계 0.5",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-012.a",
          "actionId": "scenario.LIFE-012.a",
          "status": "implemented",
          "kind": "practice",
          "minutes": 30,
          "cost": 0
        },
        "effect": {
          "description": "근무·학습시간 배정",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "교육 종료: 실제 이수와 업무 적응 기록을 바탕으로 다음 배치 후보 갱신",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "근무·학습시간 배정 · 장면 시간 30분 · 추가 비용 없음"
      },
      {
        "id": "b",
        "label": "동료와 연습 협의",
        "text": "동의 시 공동 일정",
        "personality": {
          "weights": {
            "E": 0.2,
            "P": 0.3
          },
          "rationale": "직접 교류하는 방식 0.2 · 상황에 맞춘 유연한 조정 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-012.b",
          "actionId": "scenario.LIFE-012.b",
          "status": "implemented",
          "kind": "request",
          "minutes": 15,
          "cost": 0
        },
        "effect": {
          "description": "동의 시 공동 일정",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "교육 종료: 실제 이수와 업무 적응 기록을 바탕으로 다음 배치 후보 갱신",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "동의 시 공동 일정 · 장면 시간 15분 · 추가 비용 없음 · 승인·거절은 다음 해 현재 여건으로 재확인"
      },
      {
        "id": "c",
        "label": "배치 상담",
        "text": "승인 시 담당 업무 변경",
        "personality": {
          "weights": {
            "P": 0.4
          },
          "rationale": "상황에 맞춘 유연한 조정 0.4",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-012.c",
          "actionId": "scenario.LIFE-012.c",
          "status": "implemented",
          "kind": "request",
          "minutes": 20,
          "cost": 0
        },
        "effect": {
          "description": "승인 시 담당 업무 변경",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "교육 종료: 실제 이수와 업무 적응 기록을 바탕으로 다음 배치 후보 갱신",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "승인 시 담당 업무 변경 · 장면 시간 20분 · 추가 비용 없음 · 승인·거절은 다음 해 현재 여건으로 재확인"
      }
    ],
    "guard": "장비 도입을 해고로 직결하지 않음; 미교육 위험 노출을 개인 사고 확률로 확정 금지",
    "followUp": "교육 종료: 실제 이수와 업무 적응 기록을 바탕으로 다음 배치 후보 갱신",
    "cancelWhen": [
      "source-context-ended",
      "participant-unavailable",
      "required-fact-expired"
    ],
    "source": {
      "file": "docs/design/LIFE-EVENTS-100.json",
      "evidenceLevel": "fictional-scenario"
    },
    "stateDependencies": [
      "job.status",
      "current-workplace-or-contract"
    ],
    "probabilityKind": "game-tuning-not-statistics",
    "ready": true,
    "scenarioProfile": true,
    "implementationStatus": "implemented-conditional-scenario"
  },
  {
    "id": "LIFE-013",
    "domain": "employment",
    "years": [
      1980,
      2026
    ],
    "ages": [
      18,
      65
    ],
    "title": "직장이 더 멀리 옮겨 간다",
    "text": "사업장이 이전하면 지금보다 출근길이 길어진다.",
    "eligibility": "재직·실제 이전 공지; 기존 통근 경로 기록",
    "requires": [
      "scenario.LIFE-013.ready"
    ],
    "cooldownYears": 4,
    "choices": [
      {
        "id": "a",
        "label": "새 경로로 계속 근무",
        "text": "통근시간·비용 변경",
        "personality": {
          "weights": {
            "J": 0.4
          },
          "rationale": "미리 정하는 일정·경계 0.4",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-013.a",
          "actionId": "scenario.LIFE-013.a",
          "status": "implemented",
          "kind": "request",
          "minutes": 20,
          "cost": 0,
          "change": "commute",
          "minutesChange": 20
        },
        "effect": {
          "description": "통근시간·비용 변경",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "이전 시점: 사업장 위치 확정 후 통근 반영; 이직은 실제 제안·수락 후 실행",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "통근시간·비용 변경 · 장면 시간 20분 · 추가 비용 없음 · 승인·거절은 다음 해 현재 여건으로 재확인"
      },
      {
        "id": "b",
        "label": "가까운 집 탐색",
        "text": "주거 후보 생성",
        "personality": {
          "weights": {
            "N": 0.3,
            "P": 0.3
          },
          "rationale": "새 방법 탐색 0.3 · 상황에 맞춘 유연한 조정 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-013.b",
          "actionId": "scenario.LIFE-013.b",
          "status": "implemented",
          "kind": "record",
          "minutes": 30,
          "cost": 0
        },
        "effect": {
          "description": "주거 후보 생성",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "이전 시점: 사업장 위치 확정 후 통근 반영; 이직은 실제 제안·수락 후 실행",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "주거 후보 생성 · 장면 시간 30분 · 추가 비용 없음"
      },
      {
        "id": "c",
        "label": "다른 일자리 지원",
        "text": "구직 상태 병행",
        "personality": {
          "weights": {
            "N": 0.4,
            "P": 0.3
          },
          "rationale": "새 방법 탐색 0.4 · 상황에 맞춘 유연한 조정 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-013.c",
          "actionId": "scenario.LIFE-013.c",
          "status": "implemented",
          "kind": "request",
          "minutes": 30,
          "cost": 0,
          "record": "application-requested"
        },
        "effect": {
          "description": "구직 상태 병행",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "이전 시점: 사업장 위치 확정 후 통근 반영; 이직은 실제 제안·수락 후 실행",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "구직 상태 병행 · 장면 시간 30분 · 추가 비용 없음 · 승인·거절은 다음 해 현재 여건으로 재확인"
      }
    ],
    "guard": "이사 탐색만으로 보증금 지출 금지; 지원만으로 직장 변경 금지",
    "followUp": "이전 시점: 사업장 위치 확정 후 통근 반영; 이직은 실제 제안·수락 후 실행",
    "cancelWhen": [
      "source-context-ended",
      "participant-unavailable",
      "required-fact-expired"
    ],
    "source": {
      "file": "docs/design/LIFE-EVENTS-100.json",
      "evidenceLevel": "fictional-scenario"
    },
    "stateDependencies": [
      "job.status",
      "current-workplace-or-contract"
    ],
    "probabilityKind": "game-tuning-not-statistics",
    "ready": true,
    "scenarioProfile": true,
    "implementationStatus": "implemented-conditional-scenario"
  },
  {
    "id": "LIFE-014",
    "domain": "employment",
    "years": [
      1997,
      2001
    ],
    "ages": [
      20,
      60
    ],
    "title": "퇴직 제안서가 책상에 놓였다",
    "text": "회사가 인원을 줄이며 선택 기한을 알렸다.",
    "eligibility": "해당 사업장 구조조정 확인; 본인에게 제시된 퇴직 조건 있음",
    "requires": [
      "scenario.LIFE-014.ready"
    ],
    "cooldownYears": 4,
    "choices": [
      {
        "id": "a",
        "label": "조건 확인 후 수락",
        "text": "합의한 종료일 예약",
        "personality": {
          "weights": {
            "T": 0.3,
            "J": 0.3
          },
          "rationale": "명시적인 조건·비용 비교 0.3 · 미리 정하는 일정·경계 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-014.a",
          "actionId": "scenario.LIFE-014.a",
          "status": "implemented",
          "kind": "request",
          "minutes": 25,
          "cost": 0,
          "record": "retirement-terms-review"
        },
        "effect": {
          "description": "합의한 종료일 예약",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "종료일: 확정된 퇴직만 반영; 퇴직금 입금·구직·재취업은 별도 단계",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "합의한 종료일 예약 · 장면 시간 25분 · 추가 비용 없음 · 승인·거절은 다음 해 현재 여건으로 재확인"
      },
      {
        "id": "b",
        "label": "잔류 의사 전달",
        "text": "현재 고용 유지·심사 대기",
        "personality": {
          "weights": {
            "S": 0.4,
            "J": 0.2
          },
          "rationale": "익숙하고 구체적인 수단 0.4 · 미리 정하는 일정·경계 0.2",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-014.b",
          "actionId": "scenario.LIFE-014.b",
          "status": "implemented",
          "kind": "request",
          "minutes": 15,
          "cost": 0
        },
        "effect": {
          "description": "현재 고용 유지·심사 대기",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "종료일: 확정된 퇴직만 반영; 퇴직금 입금·구직·재취업은 별도 단계",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "현재 고용 유지·심사 대기 · 장면 시간 15분 · 추가 비용 없음 · 승인·거절은 다음 해 현재 여건으로 재확인"
      },
      {
        "id": "c",
        "label": "노무 상담",
        "text": "상담시간·확인 정보 기록",
        "personality": {
          "weights": {
            "J": 0.4
          },
          "rationale": "미리 정하는 일정·경계 0.4",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-014.c",
          "actionId": "scenario.LIFE-014.c",
          "status": "implemented",
          "kind": "request",
          "minutes": 30,
          "cost": 0
        },
        "effect": {
          "description": "상담시간·확인 정보 기록",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "종료일: 확정된 퇴직만 반영; 퇴직금 입금·구직·재취업은 별도 단계",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "상담시간·확인 정보 기록 · 장면 시간 30분 · 추가 비용 없음 · 승인·거절은 다음 해 현재 여건으로 재확인"
      }
    ],
    "guard": "경제위기 연도라는 이유로 모든 직장인에게 발생 금지; 수락 전 실직 처리 금지",
    "followUp": "종료일: 확정된 퇴직만 반영; 퇴직금 입금·구직·재취업은 별도 단계",
    "cancelWhen": [
      "source-context-ended",
      "participant-unavailable",
      "required-fact-expired"
    ],
    "source": {
      "file": "docs/design/LIFE-EVENTS-100.json",
      "evidenceLevel": "fictional-scenario"
    },
    "stateDependencies": [
      "job.status",
      "current-workplace-or-contract"
    ],
    "probabilityKind": "game-tuning-not-statistics",
    "ready": true,
    "scenarioProfile": true,
    "implementationStatus": "implemented-conditional-scenario"
  },
  {
    "id": "LIFE-015",
    "domain": "employment",
    "years": [
      1990,
      2026
    ],
    "ages": [
      18,
      65
    ],
    "title": "월급이 들어오지 않은 저녁",
    "text": "급여가 늦어져 이번 달 약정 지출이 빠듯하다.",
    "eligibility": "근로계약상 급여일 경과; 실제 미지급 잔액 있음",
    "requires": [
      "scenario.LIFE-015.ready"
    ],
    "cooldownYears": 4,
    "choices": [
      {
        "id": "a",
        "label": "지급 일정 확인",
        "text": "약속·미수금 유지",
        "personality": {
          "weights": {
            "E": 0.2,
            "J": 0.4
          },
          "rationale": "직접 교류하는 방식 0.2 · 미리 정하는 일정·경계 0.4",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-015.a",
          "actionId": "scenario.LIFE-015.a",
          "status": "specification-only"
        },
        "effect": {
          "description": "약속·미수금 유지",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "다음 지급 시점: 실제 입금액으로 미수금 정산; 미지급 지속 때만 재상담·구직 후보 연결",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      },
      {
        "id": "b",
        "label": "공식 상담 문의",
        "text": "시간·절차 기록",
        "personality": {
          "weights": {
            "J": 0.4,
            "T": 0.2
          },
          "rationale": "미리 정하는 일정·경계 0.4 · 명시적인 조건·비용 비교 0.2",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-015.b",
          "actionId": "scenario.LIFE-015.b",
          "status": "specification-only"
        },
        "effect": {
          "description": "시간·절차 기록",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "다음 지급 시점: 실제 입금액으로 미수금 정산; 미지급 지속 때만 재상담·구직 후보 연결",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      },
      {
        "id": "c",
        "label": "비상자금 사용",
        "text": "현금에서 실제 부족액 충당",
        "personality": {
          "weights": {},
          "rationale": "특정 성향과의 연관이 약해 중립",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-015.c",
          "actionId": "scenario.LIFE-015.c",
          "status": "specification-only"
        },
        "effect": {
          "description": "현금에서 실제 부족액 충당",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "다음 지급 시점: 실제 입금액으로 미수금 정산; 미지급 지속 때만 재상담·구직 후보 연결",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      }
    ],
    "guard": "임금 지연을 횡령·도산으로 단정 금지; 미수금과 현금 이중 수입 금지",
    "followUp": "다음 지급 시점: 실제 입금액으로 미수금 정산; 미지급 지속 때만 재상담·구직 후보 연결",
    "cancelWhen": [
      "source-context-ended",
      "participant-unavailable",
      "required-fact-expired"
    ],
    "source": {
      "file": "docs/design/LIFE-EVENTS-100.json",
      "evidenceLevel": "fictional-scenario"
    },
    "stateDependencies": [
      "job.status",
      "current-workplace-or-contract"
    ],
    "probabilityKind": "game-tuning-not-statistics",
    "ready": false,
    "implementationStatus": "deferred-state-or-policy-verification",
    "deferredReason": "원본 조건(근로계약상 급여일 경과; 실제 미지급 잔액 있음)을 만족하는 실제 상태·제도·당사자 입력과 실행 처리가 아직 연결되지 않음. 과거 인물·소유물·진단·공식 통지를 소급 생성하지 않음."
  },
  {
    "id": "LIFE-016",
    "domain": "employment",
    "years": [
      2000,
      2026
    ],
    "ages": [
      20,
      65
    ],
    "title": "옛 동료에게서 온 채용 소식",
    "text": "함께 일했던 사람이 빈자리가 났다고 알려 준다.",
    "eligibility": "현재 직장 동료와 협업 이력; 새 채용 공고와 소개 동의 있음",
    "requires": [
      "scenario.LIFE-016.ready"
    ],
    "cooldownYears": 4,
    "choices": [
      {
        "id": "a",
        "label": "지원",
        "text": "지원서·면접 일정",
        "personality": {
          "weights": {
            "N": 0.4,
            "P": 0.3
          },
          "rationale": "새 방법 탐색 0.4 · 상황에 맞춘 유연한 조정 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-016.a",
          "actionId": "scenario.LIFE-016.a",
          "status": "specification-only"
        },
        "effect": {
          "description": "지원서·면접 일정",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "채용 결과: 면접·제안·수락이 끝나야 이직; 소개자의 신뢰는 실제 약속 이행으로만 변경",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      },
      {
        "id": "b",
        "label": "조건 문의",
        "text": "임금·근무지 정보 확인",
        "personality": {
          "weights": {
            "T": 0.3,
            "J": 0.3
          },
          "rationale": "명시적인 조건·비용 비교 0.3 · 미리 정하는 일정·경계 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-016.b",
          "actionId": "scenario.LIFE-016.b",
          "status": "specification-only"
        },
        "effect": {
          "description": "임금·근무지 정보 확인",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "채용 결과: 면접·제안·수락이 끝나야 이직; 소개자의 신뢰는 실제 약속 이행으로만 변경",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      },
      {
        "id": "c",
        "label": "거절",
        "text": "현 직장 유지",
        "personality": {
          "weights": {
            "S": 0.3,
            "J": 0.3
          },
          "rationale": "익숙하고 구체적인 수단 0.3 · 미리 정하는 일정·경계 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-016.c",
          "actionId": "scenario.LIFE-016.c",
          "status": "specification-only"
        },
        "effect": {
          "description": "현 직장 유지",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "채용 결과: 면접·제안·수락이 끝나야 이직; 소개자의 신뢰는 실제 약속 이행으로만 변경",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      }
    ],
    "guard": "인맥만으로 합격 보장 금지; 이전에 없는 동료를 오래된 친구처럼 등장 금지",
    "followUp": "채용 결과: 면접·제안·수락이 끝나야 이직; 소개자의 신뢰는 실제 약속 이행으로만 변경",
    "cancelWhen": [
      "source-context-ended",
      "participant-unavailable",
      "required-fact-expired"
    ],
    "source": {
      "file": "docs/design/LIFE-EVENTS-100.json",
      "evidenceLevel": "fictional-scenario"
    },
    "stateDependencies": [
      "job.status",
      "current-workplace-or-contract"
    ],
    "probabilityKind": "game-tuning-not-statistics",
    "ready": false,
    "implementationStatus": "deferred-state-or-policy-verification",
    "deferredReason": "원본 조건(현재 직장 동료와 협업 이력; 새 채용 공고와 소개 동의 있음)을 만족하는 실제 상태·제도·당사자 입력과 실행 처리가 아직 연결되지 않음. 과거 인물·소유물·진단·공식 통지를 소급 생성하지 않음."
  },
  {
    "id": "LIFE-017",
    "domain": "employment",
    "years": [
      2005,
      2026
    ],
    "ages": [
      20,
      55
    ],
    "title": "계약 만료까지 두 달",
    "text": "계약이 끝나기 전에 다음 생활비를 준비해야 한다.",
    "eligibility": "기간제 재직; 계약 종료 예정일·갱신 통지 있음",
    "requires": [
      "scenario.LIFE-017.ready"
    ],
    "cooldownYears": 4,
    "choices": [
      {
        "id": "a",
        "label": "갱신 상담",
        "text": "회사 응답 대기",
        "personality": {
          "weights": {
            "E": 0.2,
            "J": 0.4
          },
          "rationale": "직접 교류하는 방식 0.2 · 미리 정하는 일정·경계 0.4",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-017.a",
          "actionId": "scenario.LIFE-017.a",
          "status": "specification-only"
        },
        "effect": {
          "description": "회사 응답 대기",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "만료일: 실제 갱신 여부에 따라 유지 또는 종료; 지원 중이면 후속 면접 연결",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      },
      {
        "id": "b",
        "label": "다른 곳 지원",
        "text": "구직 일정",
        "personality": {
          "weights": {
            "N": 0.3,
            "J": 0.3
          },
          "rationale": "새 방법 탐색 0.3 · 미리 정하는 일정·경계 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-017.b",
          "actionId": "scenario.LIFE-017.b",
          "status": "specification-only"
        },
        "effect": {
          "description": "구직 일정",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "만료일: 실제 갱신 여부에 따라 유지 또는 종료; 지원 중이면 후속 면접 연결",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      },
      {
        "id": "c",
        "label": "단기 생활비 확보",
        "text": "재량 지출 조정",
        "personality": {
          "weights": {
            "J": 0.5
          },
          "rationale": "미리 정하는 일정·경계 0.5",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-017.c",
          "actionId": "scenario.LIFE-017.c",
          "status": "specification-only"
        },
        "effect": {
          "description": "재량 지출 조정",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "만료일: 실제 갱신 여부에 따라 유지 또는 종료; 지원 중이면 후속 면접 연결",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      }
    ],
    "guard": "만료 전 무조건 실직 처리 금지; 계약 유형·시대 제도 확인",
    "followUp": "만료일: 실제 갱신 여부에 따라 유지 또는 종료; 지원 중이면 후속 면접 연결",
    "cancelWhen": [
      "source-context-ended",
      "participant-unavailable",
      "required-fact-expired"
    ],
    "source": {
      "file": "docs/design/LIFE-EVENTS-100.json",
      "evidenceLevel": "fictional-scenario"
    },
    "stateDependencies": [
      "job.status",
      "current-workplace-or-contract"
    ],
    "probabilityKind": "game-tuning-not-statistics",
    "ready": false,
    "implementationStatus": "deferred-state-or-policy-verification",
    "deferredReason": "원본 조건(기간제 재직; 계약 종료 예정일·갱신 통지 있음)을 만족하는 실제 상태·제도·당사자 입력과 실행 처리가 아직 연결되지 않음. 과거 인물·소유물·진단·공식 통지를 소급 생성하지 않음."
  },
  {
    "id": "LIFE-018",
    "domain": "employment",
    "years": [
      2010,
      2026
    ],
    "ages": [
      20,
      65
    ],
    "title": "직함이 바뀌면 저녁도 바뀐다",
    "text": "새 보직은 수당이 있지만 늦게 끝나는 날이 늘어난다.",
    "eligibility": "확인된 승진/보직 제안; 돌봄·개인 일정과 근무조건 충돌",
    "requires": [
      "scenario.LIFE-018.ready"
    ],
    "cooldownYears": 4,
    "choices": [
      {
        "id": "a",
        "label": "수락",
        "text": "확정 수당·업무시간 적용",
        "personality": {
          "weights": {
            "N": 0.3,
            "J": 0.3
          },
          "rationale": "새 방법 탐색 0.3 · 미리 정하는 일정·경계 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-018.a",
          "actionId": "scenario.LIFE-018.a",
          "status": "implemented",
          "kind": "request",
          "minutes": 20,
          "cost": 0,
          "record": "role-accepted",
          "change": "workload",
          "minutesChange": 20
        },
        "effect": {
          "description": "확정 수당·업무시간 적용",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "다음 해: 실제 시간 충돌이 남아 있을 때만 돌봄·약속 재조정 사건 연결",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "확정 수당·업무시간 적용 · 장면 시간 20분 · 추가 비용 없음 · 승인·거절은 다음 해 현재 여건으로 재확인"
      },
      {
        "id": "b",
        "label": "조건 협의",
        "text": "승인 시 제안 수정",
        "personality": {
          "weights": {
            "E": 0.2,
            "P": 0.3
          },
          "rationale": "직접 교류하는 방식 0.2 · 상황에 맞춘 유연한 조정 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-018.b",
          "actionId": "scenario.LIFE-018.b",
          "status": "implemented",
          "kind": "request",
          "minutes": 25,
          "cost": 0
        },
        "effect": {
          "description": "승인 시 제안 수정",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "다음 해: 실제 시간 충돌이 남아 있을 때만 돌봄·약속 재조정 사건 연결",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "승인 시 제안 수정 · 장면 시간 25분 · 추가 비용 없음 · 승인·거절은 다음 해 현재 여건으로 재확인"
      },
      {
        "id": "c",
        "label": "거절",
        "text": "기존 보직 유지",
        "personality": {
          "weights": {
            "S": 0.3,
            "J": 0.3
          },
          "rationale": "익숙하고 구체적인 수단 0.3 · 미리 정하는 일정·경계 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-018.c",
          "actionId": "scenario.LIFE-018.c",
          "status": "implemented",
          "kind": "hold",
          "minutes": 0,
          "cost": 0
        },
        "effect": {
          "description": "기존 보직 유지",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "다음 해: 실제 시간 충돌이 남아 있을 때만 돌봄·약속 재조정 사건 연결",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "기존 보직 유지 · 추가 시간 없음 · 추가 비용 없음"
      }
    ],
    "guard": "거절을 무능으로 기록 금지; 수당만 올리고 시간 부담 누락 금지",
    "followUp": "다음 해: 실제 시간 충돌이 남아 있을 때만 돌봄·약속 재조정 사건 연결",
    "cancelWhen": [
      "source-context-ended",
      "participant-unavailable",
      "required-fact-expired"
    ],
    "source": {
      "file": "docs/design/LIFE-EVENTS-100.json",
      "evidenceLevel": "fictional-scenario"
    },
    "stateDependencies": [
      "job.status",
      "current-workplace-or-contract"
    ],
    "probabilityKind": "game-tuning-not-statistics",
    "ready": true,
    "scenarioProfile": true,
    "implementationStatus": "implemented-conditional-scenario"
  },
  {
    "id": "LIFE-019",
    "domain": "employment",
    "years": [
      2015,
      2026
    ],
    "ages": [
      20,
      65
    ],
    "title": "수정 요청이 한 번 더 왔다",
    "text": "약속한 작업 범위를 넘는 수정 요청이 들어왔다.",
    "eligibility": "독립 계약·납품 업무 진행; 고객 추가 요구 기록",
    "requires": [
      "scenario.LIFE-019.ready"
    ],
    "cooldownYears": 4,
    "choices": [
      {
        "id": "a",
        "label": "추가 견적 제시",
        "text": "합의 전 수입 없음",
        "personality": {
          "weights": {
            "T": 0.4,
            "J": 0.4
          },
          "rationale": "명시적인 조건·비용 비교 0.4 · 미리 정하는 일정·경계 0.4",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-019.a",
          "actionId": "scenario.LIFE-019.a",
          "status": "specification-only"
        },
        "effect": {
          "description": "합의 전 수입 없음",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "정산일: 검수·합의·실제 지급에 따라 매출 반영; 이후 계약은 별도 제안 필요",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      },
      {
        "id": "b",
        "label": "기존 범위만 마무리",
        "text": "납품 절차 유지",
        "personality": {
          "weights": {
            "J": 0.4
          },
          "rationale": "미리 정하는 일정·경계 0.4",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-019.b",
          "actionId": "scenario.LIFE-019.b",
          "status": "specification-only"
        },
        "effect": {
          "description": "납품 절차 유지",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "정산일: 검수·합의·실제 지급에 따라 매출 반영; 이후 계약은 별도 제안 필요",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      },
      {
        "id": "c",
        "label": "추가 작업 수락",
        "text": "노동시간 증가",
        "personality": {
          "weights": {
            "P": 0.4,
            "F": 0.2
          },
          "rationale": "상황에 맞춘 유연한 조정 0.4 · 상대의 의사·관계 우선 0.2",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-019.c",
          "actionId": "scenario.LIFE-019.c",
          "status": "specification-only"
        },
        "effect": {
          "description": "노동시간 증가",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "정산일: 검수·합의·실제 지급에 따라 매출 반영; 이후 계약은 별도 제안 필요",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      }
    ],
    "guard": "요구 거절만으로 평판 붕괴 금지; 견적을 즉시 현금 처리 금지",
    "followUp": "정산일: 검수·합의·실제 지급에 따라 매출 반영; 이후 계약은 별도 제안 필요",
    "cancelWhen": [
      "source-context-ended",
      "participant-unavailable",
      "required-fact-expired"
    ],
    "source": {
      "file": "docs/design/LIFE-EVENTS-100.json",
      "evidenceLevel": "fictional-scenario"
    },
    "stateDependencies": [
      "job.status",
      "current-workplace-or-contract"
    ],
    "probabilityKind": "game-tuning-not-statistics",
    "ready": false,
    "implementationStatus": "deferred-state-or-policy-verification",
    "deferredReason": "원본 조건(독립 계약·납품 업무 진행; 고객 추가 요구 기록)을 만족하는 실제 상태·제도·당사자 입력과 실행 처리가 아직 연결되지 않음. 과거 인물·소유물·진단·공식 통지를 소급 생성하지 않음."
  },
  {
    "id": "LIFE-020",
    "domain": "employment",
    "years": [
      2020,
      2022
    ],
    "ages": [
      20,
      65
    ],
    "title": "집이 사무실이 된 날",
    "text": "화상회의 시간에 집안일과 돌봄이 겹친다.",
    "eligibility": "직장 원격근무 시행 확인; 거주공간·돌봄 상황 기록",
    "requires": [
      "scenario.LIFE-020.ready"
    ],
    "cooldownYears": 4,
    "choices": [
      {
        "id": "a",
        "label": "동거인과 공간 협의",
        "text": "합의된 사용시간",
        "personality": {
          "weights": {
            "F": 0.3,
            "J": 0.3
          },
          "rationale": "상대의 의사·관계 우선 0.3 · 미리 정하는 일정·경계 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-020.a",
          "actionId": "scenario.LIFE-020.a",
          "status": "implemented",
          "kind": "request",
          "minutes": 20,
          "cost": 0
        },
        "effect": {
          "description": "합의된 사용시간",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "다음 근무기간: 실제 집중시간·돌봄 공백을 보고 근무방식 재협상",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "합의된 사용시간 · 장면 시간 20분 · 추가 비용 없음 · 승인·거절은 다음 해 현재 여건으로 재확인"
      },
      {
        "id": "b",
        "label": "회사에 일정 조정 요청",
        "text": "승인된 회의 변경",
        "personality": {
          "weights": {
            "E": 0.2,
            "J": 0.3
          },
          "rationale": "직접 교류하는 방식 0.2 · 미리 정하는 일정·경계 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-020.b",
          "actionId": "scenario.LIFE-020.b",
          "status": "implemented",
          "kind": "request",
          "minutes": 15,
          "cost": 0
        },
        "effect": {
          "description": "승인된 회의 변경",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "다음 근무기간: 실제 집중시간·돌봄 공백을 보고 근무방식 재협상",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "승인된 회의 변경 · 장면 시간 15분 · 추가 비용 없음 · 승인·거절은 다음 해 현재 여건으로 재확인"
      },
      {
        "id": "c",
        "label": "가능한 외부 공간 이용",
        "text": "실제 이용료·이동시간",
        "personality": {
          "weights": {
            "P": 0.3
          },
          "rationale": "상황에 맞춘 유연한 조정 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-020.c",
          "actionId": "scenario.LIFE-020.c",
          "status": "implemented",
          "kind": "expense",
          "minutes": 45,
          "cost": 3
        },
        "effect": {
          "description": "실제 이용료·이동시간",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "다음 근무기간: 실제 집중시간·돌봄 공백을 보고 근무방식 재협상",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "실제 이용료·이동시간 · 장면 시간 45분 · 3만 원 · 이번 선택에서 지출"
      }
    ],
    "guard": "모든 직종에 원격근무 노출 금지; 집에 있다는 이유로 돌봄 무료 처리 금지",
    "followUp": "다음 근무기간: 실제 집중시간·돌봄 공백을 보고 근무방식 재협상",
    "cancelWhen": [
      "source-context-ended",
      "participant-unavailable",
      "required-fact-expired"
    ],
    "source": {
      "file": "docs/design/LIFE-EVENTS-100.json",
      "evidenceLevel": "fictional-scenario"
    },
    "stateDependencies": [
      "job.status",
      "current-workplace-or-contract"
    ],
    "probabilityKind": "game-tuning-not-statistics",
    "ready": true,
    "scenarioProfile": true,
    "implementationStatus": "implemented-conditional-scenario"
  },
  {
    "id": "LIFE-021",
    "domain": "housing",
    "years": [
      1960,
      1999
    ],
    "ages": [
      18,
      60
    ],
    "title": "상경 첫 달의 잠자리",
    "text": "친척이 잠깐 머물 수 있다고 했지만 방이 넉넉하지 않다.",
    "eligibility": "도시 이주 계획; 현금 부족; 실제 친척의 임시 숙박 제안",
    "requires": [
      "scenario.LIFE-021.ready"
    ],
    "cooldownYears": 4,
    "choices": [
      {
        "id": "a",
        "label": "기한 정해 머무르기",
        "text": "동의 시 임시 주소·분담 약속",
        "personality": {
          "weights": {
            "F": 0.4,
            "J": 0.3
          },
          "rationale": "상대의 의사·관계 우선 0.4 · 미리 정하는 일정·경계 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-021.a",
          "actionId": "scenario.LIFE-021.a",
          "status": "specification-only"
        },
        "effect": {
          "description": "동의 시 임시 주소·분담 약속",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "약속 기한: 새집 확보 여부에 따라 퇴거·기간 재협의; 생활 분담 이행을 관계 기억으로 저장",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      },
      {
        "id": "b",
        "label": "하숙 탐색",
        "text": "가격·통근 후보",
        "personality": {
          "weights": {
            "N": 0.3,
            "P": 0.3
          },
          "rationale": "새 방법 탐색 0.3 · 상황에 맞춘 유연한 조정 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-021.b",
          "actionId": "scenario.LIFE-021.b",
          "status": "specification-only"
        },
        "effect": {
          "description": "가격·통근 후보",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "약속 기한: 새집 확보 여부에 따라 퇴거·기간 재협의; 생활 분담 이행을 관계 기억으로 저장",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      },
      {
        "id": "c",
        "label": "이주 연기",
        "text": "현 거주 유지",
        "personality": {
          "weights": {
            "S": 0.3,
            "J": 0.3
          },
          "rationale": "익숙하고 구체적인 수단 0.3 · 미리 정하는 일정·경계 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-021.c",
          "actionId": "scenario.LIFE-021.c",
          "status": "specification-only"
        },
        "effect": {
          "description": "현 거주 유지",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "약속 기한: 새집 확보 여부에 따라 퇴거·기간 재협의; 생활 분담 이행을 관계 기억으로 저장",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      }
    ],
    "guard": "친척 자산·호의 임의 생성 금지; 임시 동거를 주택 소유로 기록 금지",
    "followUp": "약속 기한: 새집 확보 여부에 따라 퇴거·기간 재협의; 생활 분담 이행을 관계 기억으로 저장",
    "cancelWhen": [
      "source-context-ended",
      "participant-unavailable",
      "required-fact-expired"
    ],
    "source": {
      "file": "docs/design/LIFE-EVENTS-100.json",
      "evidenceLevel": "fictional-scenario"
    },
    "stateDependencies": [
      "home.tenure",
      "current-place-or-contract"
    ],
    "probabilityKind": "game-tuning-not-statistics",
    "ready": false,
    "implementationStatus": "deferred-state-or-policy-verification",
    "deferredReason": "원본 조건(도시 이주 계획; 현금 부족; 실제 친척의 임시 숙박 제안)을 만족하는 실제 상태·제도·당사자 입력과 실행 처리가 아직 연결되지 않음. 과거 인물·소유물·진단·공식 통지를 소급 생성하지 않음."
  },
  {
    "id": "LIFE-022",
    "domain": "housing",
    "years": [
      1960,
      2026
    ],
    "ages": [
      18,
      90
    ],
    "title": "겨울을 앞둔 연료 주문",
    "text": "한꺼번에 사면 돈이 묶이고 나눠 사면 배달을 여러 번 받아야 한다.",
    "eligibility": "해당 주거 난방 설비·계절 부담; 연료 구매 필요",
    "requires": [
      "scenario.LIFE-022.ready"
    ],
    "cooldownYears": 4,
    "choices": [
      {
        "id": "a",
        "label": "일괄 구매",
        "text": "실제 재고·비용 증가",
        "personality": {
          "weights": {
            "J": 0.6
          },
          "rationale": "미리 정하는 일정·경계 0.6",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-022.a",
          "actionId": "scenario.LIFE-022.a",
          "status": "implemented",
          "kind": "expense",
          "minutes": 20,
          "cost": 0,
          "costFrom": "fuel-bulk",
          "record": "fuel-bulk"
        },
        "effect": {
          "description": "실제 재고·비용 증가",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "다음 겨울: 실제 사용량·잔여 재고로 주문 규모 조정",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "실제 재고·비용 증가 · 장면 시간 20분 · 추가 비용 없음"
      },
      {
        "id": "b",
        "label": "분할 구매",
        "text": "첫 물량만 결제",
        "personality": {
          "weights": {
            "P": 0.4
          },
          "rationale": "상황에 맞춘 유연한 조정 0.4",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-022.b",
          "actionId": "scenario.LIFE-022.b",
          "status": "implemented",
          "kind": "expense",
          "minutes": 15,
          "cost": 0,
          "costFrom": "fuel-first",
          "record": "fuel-first"
        },
        "effect": {
          "description": "첫 물량만 결제",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "다음 겨울: 실제 사용량·잔여 재고로 주문 규모 조정",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "첫 물량만 결제 · 장면 시간 15분 · 추가 비용 없음"
      },
      {
        "id": "c",
        "label": "이웃과 공동 주문",
        "text": "합의 시 배달비 분담",
        "personality": {
          "weights": {
            "E": 0.3,
            "F": 0.3
          },
          "rationale": "직접 교류하는 방식 0.3 · 상대의 의사·관계 우선 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-022.c",
          "actionId": "scenario.LIFE-022.c",
          "status": "implemented",
          "kind": "request",
          "minutes": 20,
          "cost": 0,
          "costFrom": "fuel-group",
          "record": "fuel-shared"
        },
        "effect": {
          "description": "합의 시 배달비 분담",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "다음 겨울: 실제 사용량·잔여 재고로 주문 규모 조정",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "합의 시 배달비 분담 · 장면 시간 20분 · 추가 비용 없음 · 승인·거절은 다음 해 현재 여건으로 재확인"
      }
    ],
    "guard": "연탄·기름·가스는 해당 집 설비와 시대에 맞춰 변형; 가격 할인 임의 확정 금지",
    "followUp": "다음 겨울: 실제 사용량·잔여 재고로 주문 규모 조정",
    "cancelWhen": [
      "source-context-ended",
      "participant-unavailable",
      "required-fact-expired"
    ],
    "source": {
      "file": "docs/design/LIFE-EVENTS-100.json",
      "evidenceLevel": "fictional-scenario"
    },
    "stateDependencies": [
      "home.tenure",
      "current-place-or-contract"
    ],
    "probabilityKind": "game-tuning-not-statistics",
    "ready": true,
    "scenarioProfile": true,
    "implementationStatus": "implemented-conditional-scenario"
  },
  {
    "id": "LIFE-023",
    "domain": "housing",
    "years": [
      1970,
      2026
    ],
    "ages": [
      20,
      85
    ],
    "title": "다시 계약할 때가 왔다",
    "text": "집주인이 다음 계약 조건을 알려 왔다.",
    "eligibility": "임차 거주; 갱신 제안·요청 금액 기록",
    "requires": [
      "scenario.LIFE-023.ready"
    ],
    "cooldownYears": 4,
    "choices": [
      {
        "id": "a",
        "label": "새 조건 협의",
        "text": "합의 대기",
        "personality": {
          "weights": {
            "E": 0.2,
            "J": 0.4
          },
          "rationale": "직접 교류하는 방식 0.2 · 미리 정하는 일정·경계 0.4",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-023.a",
          "actionId": "scenario.LIFE-023.a",
          "status": "implemented",
          "kind": "request",
          "minutes": 20,
          "cost": 0
        },
        "effect": {
          "description": "합의 대기",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "만료 시점: 서명·입주·보증금 반환을 각각 확인; 결렬 시 실제 대안으로 이동",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "합의 대기 · 장면 시간 20분 · 추가 비용 없음 · 승인·거절은 다음 해 현재 여건으로 재확인"
      },
      {
        "id": "b",
        "label": "다른 집 탐색",
        "text": "보증금·월세·이사비 견적",
        "personality": {
          "weights": {
            "N": 0.3,
            "J": 0.3
          },
          "rationale": "새 방법 탐색 0.3 · 미리 정하는 일정·경계 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-023.b",
          "actionId": "scenario.LIFE-023.b",
          "status": "implemented",
          "kind": "record",
          "minutes": 30,
          "cost": 0
        },
        "effect": {
          "description": "보증금·월세·이사비 견적",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "만료 시점: 서명·입주·보증금 반환을 각각 확인; 결렬 시 실제 대안으로 이동",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "보증금·월세·이사비 견적 · 장면 시간 30분 · 추가 비용 없음"
      },
      {
        "id": "c",
        "label": "조건 수락",
        "text": "효력일부터 장부 변경",
        "personality": {
          "weights": {
            "S": 0.3,
            "J": 0.3
          },
          "rationale": "익숙하고 구체적인 수단 0.3 · 미리 정하는 일정·경계 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-023.c",
          "actionId": "scenario.LIFE-023.c",
          "status": "implemented",
          "kind": "request",
          "minutes": 15,
          "cost": 0,
          "record": "renewal-requested"
        },
        "effect": {
          "description": "효력일부터 장부 변경",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "만료 시점: 서명·입주·보증금 반환을 각각 확인; 결렬 시 실제 대안으로 이동",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "효력일부터 장부 변경 · 장면 시간 15분 · 추가 비용 없음 · 승인·거절은 다음 해 현재 여건으로 재확인"
      }
    ],
    "guard": "계약 기간·권리·책임은 해당 연도 검증; 인상 요청을 확정 인상으로 기록 금지",
    "followUp": "만료 시점: 서명·입주·보증금 반환을 각각 확인; 결렬 시 실제 대안으로 이동",
    "cancelWhen": [
      "source-context-ended",
      "participant-unavailable",
      "required-fact-expired"
    ],
    "source": {
      "file": "docs/design/LIFE-EVENTS-100.json",
      "evidenceLevel": "fictional-scenario"
    },
    "stateDependencies": [
      "home.tenure",
      "current-place-or-contract"
    ],
    "probabilityKind": "game-tuning-not-statistics",
    "ready": true,
    "scenarioProfile": true,
    "implementationStatus": "implemented-conditional-scenario"
  },
  {
    "id": "LIFE-024",
    "domain": "housing",
    "years": [
      1980,
      2026
    ],
    "ages": [
      18,
      80
    ],
    "title": "늘 타던 버스가 바뀐다",
    "text": "첫차나 경유지가 바뀌어 평소 일정에 맞추기 어렵다.",
    "eligibility": "현재 통근·통학 경로; 해당 지역 노선 변경 공지",
    "requires": [
      "scenario.LIFE-024.ready"
    ],
    "cooldownYears": 4,
    "choices": [
      {
        "id": "a",
        "label": "환승 경로 이용",
        "text": "비용·시간 변경",
        "personality": {
          "weights": {
            "P": 0.4
          },
          "rationale": "상황에 맞춘 유연한 조정 0.4",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-024.a",
          "actionId": "scenario.LIFE-024.a",
          "status": "specification-only"
        },
        "effect": {
          "description": "비용·시간 변경",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "운행 변경 뒤: 실제 지각·교대 충돌이 발생했을 때만 직장 후속 사건 연결",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      },
      {
        "id": "b",
        "label": "출근시간 조정 문의",
        "text": "합의 시 일정 변경",
        "personality": {
          "weights": {
            "E": 0.2,
            "J": 0.4
          },
          "rationale": "직접 교류하는 방식 0.2 · 미리 정하는 일정·경계 0.4",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-024.b",
          "actionId": "scenario.LIFE-024.b",
          "status": "specification-only"
        },
        "effect": {
          "description": "합의 시 일정 변경",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "운행 변경 뒤: 실제 지각·교대 충돌이 발생했을 때만 직장 후속 사건 연결",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      },
      {
        "id": "c",
        "label": "거처 이동 검토",
        "text": "주거 탐색",
        "personality": {
          "weights": {
            "N": 0.3,
            "P": 0.3
          },
          "rationale": "새 방법 탐색 0.3 · 상황에 맞춘 유연한 조정 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-024.c",
          "actionId": "scenario.LIFE-024.c",
          "status": "specification-only"
        },
        "effect": {
          "description": "주거 탐색",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "운행 변경 뒤: 실제 지각·교대 충돌이 발생했을 때만 직장 후속 사건 연결",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      }
    ],
    "guard": "전국 공통 노선 변경 금지; 노선 공지만으로 해고 금지",
    "followUp": "운행 변경 뒤: 실제 지각·교대 충돌이 발생했을 때만 직장 후속 사건 연결",
    "cancelWhen": [
      "source-context-ended",
      "participant-unavailable",
      "required-fact-expired"
    ],
    "source": {
      "file": "docs/design/LIFE-EVENTS-100.json",
      "evidenceLevel": "fictional-scenario"
    },
    "stateDependencies": [
      "home.tenure",
      "current-place-or-contract"
    ],
    "probabilityKind": "game-tuning-not-statistics",
    "ready": false,
    "implementationStatus": "deferred-state-or-policy-verification",
    "deferredReason": "원본 조건(현재 통근·통학 경로; 해당 지역 노선 변경 공지)을 만족하는 실제 상태·제도·당사자 입력과 실행 처리가 아직 연결되지 않음. 과거 인물·소유물·진단·공식 통지를 소급 생성하지 않음."
  },
  {
    "id": "LIFE-025",
    "domain": "housing",
    "years": [
      1990,
      2026
    ],
    "ages": [
      20,
      85
    ],
    "title": "비가 온 뒤 천장에 얼룩",
    "text": "관리 담당자와 수리 일정을 잡아야 한다.",
    "eligibility": "임차 주택 누수 확인; 관리·집주인 연락 채널 있음",
    "requires": [
      "scenario.LIFE-025.ready"
    ],
    "cooldownYears": 4,
    "choices": [
      {
        "id": "a",
        "label": "점검 요청",
        "text": "확인 일정",
        "personality": {
          "weights": {
            "J": 0.5
          },
          "rationale": "미리 정하는 일정·경계 0.5",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-025.a",
          "actionId": "scenario.LIFE-025.a",
          "status": "implemented",
          "kind": "request",
          "minutes": 20,
          "cost": 0
        },
        "effect": {
          "description": "확인 일정",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "점검 뒤: 확인된 원인·책임·수리 완료 여부로 정산과 주거 상태 갱신",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "확인 일정 · 장면 시간 20분 · 추가 비용 없음 · 승인·거절은 다음 해 현재 여건으로 재확인"
      },
      {
        "id": "b",
        "label": "필수 임시 조치",
        "text": "영수증·비용 기록",
        "personality": {
          "weights": {
            "S": 0.3,
            "P": 0.3
          },
          "rationale": "익숙하고 구체적인 수단 0.3 · 상황에 맞춘 유연한 조정 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-025.b",
          "actionId": "scenario.LIFE-025.b",
          "status": "implemented",
          "kind": "expense",
          "minutes": 15,
          "cost": 2,
          "record": "temporary-leak-protection"
        },
        "effect": {
          "description": "영수증·비용 기록",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "점검 뒤: 확인된 원인·책임·수리 완료 여부로 정산과 주거 상태 갱신",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "영수증·비용 기록 · 장면 시간 15분 · 2만 원 · 이번 선택에서 지출"
      },
      {
        "id": "c",
        "label": "일정 조정 후 수리",
        "text": "확정 부담액만 결제",
        "personality": {
          "weights": {
            "J": 0.4
          },
          "rationale": "미리 정하는 일정·경계 0.4",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-025.c",
          "actionId": "scenario.LIFE-025.c",
          "status": "implemented",
          "kind": "request",
          "minutes": 20,
          "cost": 0
        },
        "effect": {
          "description": "확정 부담액만 결제",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "점검 뒤: 확인된 원인·책임·수리 완료 여부로 정산과 주거 상태 갱신",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "확정 부담액만 결제 · 장면 시간 20분 · 추가 비용 없음 · 승인·거절은 다음 해 현재 여건으로 재확인"
      }
    ],
    "guard": "책임 확인 전 임차인 전액 부담 금지; 누수를 질병 발생으로 직결하지 않음",
    "followUp": "점검 뒤: 확인된 원인·책임·수리 완료 여부로 정산과 주거 상태 갱신",
    "cancelWhen": [
      "source-context-ended",
      "participant-unavailable",
      "required-fact-expired"
    ],
    "source": {
      "file": "docs/design/LIFE-EVENTS-100.json",
      "evidenceLevel": "fictional-scenario"
    },
    "stateDependencies": [
      "home.tenure",
      "current-place-or-contract"
    ],
    "probabilityKind": "game-tuning-not-statistics",
    "ready": true,
    "scenarioProfile": true,
    "implementationStatus": "implemented-conditional-scenario"
  },
  {
    "id": "LIFE-026",
    "domain": "housing",
    "years": [
      1990,
      2026
    ],
    "ages": [
      20,
      85
    ],
    "title": "이삿날 계단 앞에서",
    "text": "운송 견적에서 계단 작업과 큰 가구 처리가 빠져 있었다.",
    "eligibility": "이사 확정; 실제 짐·운송 견적·새집 접근 조건 있음",
    "requires": [
      "scenario.LIFE-026.ready"
    ],
    "cooldownYears": 4,
    "choices": [
      {
        "id": "a",
        "label": "견적 재협의",
        "text": "총비용 확인",
        "personality": {
          "weights": {
            "E": 0.2,
            "J": 0.3
          },
          "rationale": "직접 교류하는 방식 0.2 · 미리 정하는 일정·경계 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-026.a",
          "actionId": "scenario.LIFE-026.a",
          "status": "specification-only"
        },
        "effect": {
          "description": "총비용 확인",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "이사 뒤: 실제 지급액·처분품·새 주소 반영; 빠진 가구가 필요한 경우만 구매 후보 연결",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      },
      {
        "id": "b",
        "label": "일부 가구 처분",
        "text": "매각·기증 성립 시 짐 감소",
        "personality": {
          "weights": {
            "T": 0.4,
            "P": 0.2
          },
          "rationale": "명시적인 조건·비용 비교 0.4 · 상황에 맞춘 유연한 조정 0.2",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-026.b",
          "actionId": "scenario.LIFE-026.b",
          "status": "specification-only"
        },
        "effect": {
          "description": "매각·기증 성립 시 짐 감소",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "이사 뒤: 실제 지급액·처분품·새 주소 반영; 빠진 가구가 필요한 경우만 구매 후보 연결",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      },
      {
        "id": "c",
        "label": "운송 방식 변경",
        "text": "가능한 일정 재예약",
        "personality": {
          "weights": {
            "P": 0.4
          },
          "rationale": "상황에 맞춘 유연한 조정 0.4",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-026.c",
          "actionId": "scenario.LIFE-026.c",
          "status": "specification-only"
        },
        "effect": {
          "description": "가능한 일정 재예약",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "이사 뒤: 실제 지급액·처분품·새 주소 반영; 빠진 가구가 필요한 경우만 구매 후보 연결",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      }
    ],
    "guard": "처분 신청만으로 매각 대금 수입 금지; 보유하지 않은 가구 등장 금지",
    "followUp": "이사 뒤: 실제 지급액·처분품·새 주소 반영; 빠진 가구가 필요한 경우만 구매 후보 연결",
    "cancelWhen": [
      "source-context-ended",
      "participant-unavailable",
      "required-fact-expired"
    ],
    "source": {
      "file": "docs/design/LIFE-EVENTS-100.json",
      "evidenceLevel": "fictional-scenario"
    },
    "stateDependencies": [
      "home.tenure",
      "current-place-or-contract"
    ],
    "probabilityKind": "game-tuning-not-statistics",
    "ready": false,
    "implementationStatus": "deferred-state-or-policy-verification",
    "deferredReason": "원본 조건(이사 확정; 실제 짐·운송 견적·새집 접근 조건 있음)을 만족하는 실제 상태·제도·당사자 입력과 실행 처리가 아직 연결되지 않음. 과거 인물·소유물·진단·공식 통지를 소급 생성하지 않음."
  },
  {
    "id": "LIFE-027",
    "domain": "housing",
    "years": [
      2000,
      2026
    ],
    "ages": [
      20,
      85
    ],
    "title": "잠들 무렵 들리는 소리",
    "text": "며칠째 같은 시간에 소음이 이어져 잠을 설친다.",
    "eligibility": "공동주택 거주; 소음 시간·원인 관측; 이웃 접촉 가능",
    "requires": [
      "scenario.LIFE-027.ready"
    ],
    "cooldownYears": 4,
    "choices": [
      {
        "id": "a",
        "label": "관리 창구에 기록 전달",
        "text": "확인 절차",
        "personality": {
          "weights": {
            "J": 0.4
          },
          "rationale": "미리 정하는 일정·경계 0.4",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-027.a",
          "actionId": "scenario.LIFE-027.a",
          "status": "implemented",
          "kind": "request",
          "minutes": 15,
          "cost": 0
        },
        "effect": {
          "description": "확인 절차",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "다음 기간: 실제 소음 변화와 수면 기록으로 해결·재협의 분기",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "확인 절차 · 장면 시간 15분 · 추가 비용 없음 · 승인·거절은 다음 해 현재 여건으로 재확인"
      },
      {
        "id": "b",
        "label": "낮에 대화 요청",
        "text": "동의 시 생활시간 협의",
        "personality": {
          "weights": {
            "E": 0.2,
            "F": 0.3
          },
          "rationale": "직접 교류하는 방식 0.2 · 상대의 의사·관계 우선 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-027.b",
          "actionId": "scenario.LIFE-027.b",
          "status": "implemented",
          "kind": "request",
          "minutes": 20,
          "cost": 0
        },
        "effect": {
          "description": "동의 시 생활시간 협의",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "다음 기간: 실제 소음 변화와 수면 기록으로 해결·재협의 분기",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "동의 시 생활시간 협의 · 장면 시간 20분 · 추가 비용 없음 · 승인·거절은 다음 해 현재 여건으로 재확인"
      },
      {
        "id": "c",
        "label": "자기 공간 조정",
        "text": "가능한 비용·잠자리 변화",
        "personality": {
          "weights": {
            "I": 0.3,
            "P": 0.3
          },
          "rationale": "혼자 정리할 시간 0.3 · 상황에 맞춘 유연한 조정 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-027.c",
          "actionId": "scenario.LIFE-027.c",
          "status": "implemented",
          "kind": "expense",
          "minutes": 25,
          "cost": 2,
          "record": "sleep-space-adjusted"
        },
        "effect": {
          "description": "가능한 비용·잠자리 변화",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "다음 기간: 실제 소음 변화와 수면 기록으로 해결·재협의 분기",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "가능한 비용·잠자리 변화 · 장면 시간 25분 · 2만 원 · 이번 선택에서 지출"
      }
    ],
    "guard": "층간소음 가해자 추정 확정 금지; 항의만으로 이웃 적대 자동 생성 금지",
    "followUp": "다음 기간: 실제 소음 변화와 수면 기록으로 해결·재협의 분기",
    "cancelWhen": [
      "source-context-ended",
      "participant-unavailable",
      "required-fact-expired"
    ],
    "source": {
      "file": "docs/design/LIFE-EVENTS-100.json",
      "evidenceLevel": "fictional-scenario"
    },
    "stateDependencies": [
      "home.tenure",
      "current-place-or-contract"
    ],
    "probabilityKind": "game-tuning-not-statistics",
    "ready": true,
    "scenarioProfile": true,
    "implementationStatus": "implemented-conditional-scenario"
  },
  {
    "id": "LIFE-028",
    "domain": "housing",
    "years": [
      2005,
      2026
    ],
    "ages": [
      20,
      90
    ],
    "title": "남는 방이 커 보이는 집",
    "text": "함께 살던 사람이 떠난 뒤 집은 넓고 관리비는 그대로다.",
    "eligibility": "가구원 감소·빈방 있음; 주거비 부담 지속",
    "requires": [
      "scenario.LIFE-028.ready"
    ],
    "cooldownYears": 4,
    "choices": [
      {
        "id": "a",
        "label": "작은 집 탐색",
        "text": "총이동비 비교",
        "personality": {
          "weights": {
            "N": 0.3,
            "J": 0.3
          },
          "rationale": "새 방법 탐색 0.3 · 미리 정하는 일정·경계 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-028.a",
          "actionId": "scenario.LIFE-028.a",
          "status": "specification-only"
        },
        "effect": {
          "description": "총이동비 비교",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "새 계약 시점: 실제 이사 또는 동거가 성립할 때만 부담 분담 변경",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      },
      {
        "id": "b",
        "label": "현 집 유지",
        "text": "기존 비용",
        "personality": {
          "weights": {
            "S": 0.3,
            "J": 0.3
          },
          "rationale": "익숙하고 구체적인 수단 0.3 · 미리 정하는 일정·경계 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-028.b",
          "actionId": "scenario.LIFE-028.b",
          "status": "specification-only"
        },
        "effect": {
          "description": "기존 비용",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "새 계약 시점: 실제 이사 또는 동거가 성립할 때만 부담 분담 변경",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      },
      {
        "id": "c",
        "label": "확인된 동거 제안 협의",
        "text": "상호 동의 대기",
        "personality": {
          "weights": {
            "E": 0.3,
            "F": 0.3
          },
          "rationale": "직접 교류하는 방식 0.3 · 상대의 의사·관계 우선 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-028.c",
          "actionId": "scenario.LIFE-028.c",
          "status": "specification-only"
        },
        "effect": {
          "description": "상호 동의 대기",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "새 계약 시점: 실제 이사 또는 동거가 성립할 때만 부담 분담 변경",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      }
    ],
    "guard": "사별·독립·이혼 원인은 기존 기록 사용; 빈방 있다고 자동 임대 수입 금지",
    "followUp": "새 계약 시점: 실제 이사 또는 동거가 성립할 때만 부담 분담 변경",
    "cancelWhen": [
      "source-context-ended",
      "participant-unavailable",
      "required-fact-expired"
    ],
    "source": {
      "file": "docs/design/LIFE-EVENTS-100.json",
      "evidenceLevel": "fictional-scenario"
    },
    "stateDependencies": [
      "home.tenure",
      "current-place-or-contract"
    ],
    "probabilityKind": "game-tuning-not-statistics",
    "ready": false,
    "implementationStatus": "deferred-state-or-policy-verification",
    "deferredReason": "원본 조건(가구원 감소·빈방 있음; 주거비 부담 지속)을 만족하는 실제 상태·제도·당사자 입력과 실행 처리가 아직 연결되지 않음. 과거 인물·소유물·진단·공식 통지를 소급 생성하지 않음."
  },
  {
    "id": "LIFE-029",
    "domain": "housing",
    "years": [
      2010,
      2026
    ],
    "ages": [
      18,
      70
    ],
    "title": "방을 보기 전에 입금하라는데",
    "text": "매물을 확인하기 전에 예약금을 보내 달라는 요청을 받았다.",
    "eligibility": "온라인 매물 탐색; 실제 계약 전; 추가 송금 요청 있음",
    "requires": [
      "scenario.LIFE-029.ready"
    ],
    "cooldownYears": 4,
    "choices": [
      {
        "id": "a",
        "label": "현장·서류 확인 요청",
        "text": "계약 보류",
        "personality": {
          "weights": {
            "J": 0.5,
            "T": 0.3
          },
          "rationale": "미리 정하는 일정·경계 0.5 · 명시적인 조건·비용 비교 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-029.a",
          "actionId": "scenario.LIFE-029.a",
          "status": "specification-only"
        },
        "effect": {
          "description": "계약 보류",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "확인 뒤: 권리·계약 조건이 검증된 매물만 계약 후보; 미확인 요청은 기록으로 종료 가능",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      },
      {
        "id": "b",
        "label": "공식 중개 경로로 확인",
        "text": "확인시간",
        "personality": {
          "weights": {
            "J": 0.4,
            "T": 0.3
          },
          "rationale": "미리 정하는 일정·경계 0.4 · 명시적인 조건·비용 비교 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-029.b",
          "actionId": "scenario.LIFE-029.b",
          "status": "specification-only"
        },
        "effect": {
          "description": "확인시간",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "확인 뒤: 권리·계약 조건이 검증된 매물만 계약 후보; 미확인 요청은 기록으로 종료 가능",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      },
      {
        "id": "c",
        "label": "다른 매물 탐색",
        "text": "해당 거래 중단",
        "personality": {
          "weights": {
            "P": 0.4
          },
          "rationale": "상황에 맞춘 유연한 조정 0.4",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-029.c",
          "actionId": "scenario.LIFE-029.c",
          "status": "specification-only"
        },
        "effect": {
          "description": "해당 거래 중단",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "확인 뒤: 권리·계약 조건이 검증된 매물만 계약 후보; 미확인 요청은 기록으로 종료 가능",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      }
    ],
    "guard": "사기라고 단정하지 않음; 선택하지 않은 송금 손실 강제 적용 금지",
    "followUp": "확인 뒤: 권리·계약 조건이 검증된 매물만 계약 후보; 미확인 요청은 기록으로 종료 가능",
    "cancelWhen": [
      "source-context-ended",
      "participant-unavailable",
      "required-fact-expired"
    ],
    "source": {
      "file": "docs/design/LIFE-EVENTS-100.json",
      "evidenceLevel": "fictional-scenario"
    },
    "stateDependencies": [
      "home.tenure",
      "current-place-or-contract"
    ],
    "probabilityKind": "game-tuning-not-statistics",
    "ready": false,
    "implementationStatus": "deferred-state-or-policy-verification",
    "deferredReason": "원본 조건(온라인 매물 탐색; 실제 계약 전; 추가 송금 요청 있음)을 만족하는 실제 상태·제도·당사자 입력과 실행 처리가 아직 연결되지 않음. 과거 인물·소유물·진단·공식 통지를 소급 생성하지 않음."
  },
  {
    "id": "LIFE-030",
    "domain": "housing",
    "years": [
      2010,
      2026
    ],
    "ages": [
      20,
      90
    ],
    "title": "월세가 싼 집의 긴 이동",
    "text": "저렴한 집은 멀고 가까운 집은 생활비를 더 차지한다.",
    "eligibility": "실제 병원·학교·직장 접근 수요; 복수 주거 후보 확보",
    "requires": [
      "scenario.LIFE-030.ready"
    ],
    "cooldownYears": 4,
    "choices": [
      {
        "id": "a",
        "label": "가까운 집 선택",
        "text": "계약 후 주거비 증가·통근 감소",
        "personality": {
          "weights": {
            "J": 0.4,
            "F": 0.2
          },
          "rationale": "미리 정하는 일정·경계 0.4 · 상대의 의사·관계 우선 0.2",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-030.a",
          "actionId": "scenario.LIFE-030.a",
          "status": "specification-only"
        },
        "effect": {
          "description": "계약 후 주거비 증가·통근 감소",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "입주 후: 실제 남는 돈·시간을 비교해 생활 루틴 유지·조정 연결",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      },
      {
        "id": "b",
        "label": "먼 집 선택",
        "text": "주거비 감소·통근 증가",
        "personality": {
          "weights": {
            "T": 0.4,
            "J": 0.4
          },
          "rationale": "명시적인 조건·비용 비교 0.4 · 미리 정하는 일정·경계 0.4",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-030.b",
          "actionId": "scenario.LIFE-030.b",
          "status": "specification-only"
        },
        "effect": {
          "description": "주거비 감소·통근 증가",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "입주 후: 실제 남는 돈·시간을 비교해 생활 루틴 유지·조정 연결",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      },
      {
        "id": "c",
        "label": "탐색 계속",
        "text": "이사 보류·탐색시간",
        "personality": {
          "weights": {
            "N": 0.3,
            "P": 0.3
          },
          "rationale": "새 방법 탐색 0.3 · 상황에 맞춘 유연한 조정 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-030.c",
          "actionId": "scenario.LIFE-030.c",
          "status": "specification-only"
        },
        "effect": {
          "description": "이사 보류·탐색시간",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "입주 후: 실제 남는 돈·시간을 비교해 생활 루틴 유지·조정 연결",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      }
    ],
    "guard": "이사비·보증금 이동 포함; 싼 집 선택을 삶의 질 일괄 하락으로 표현 금지",
    "followUp": "입주 후: 실제 남는 돈·시간을 비교해 생활 루틴 유지·조정 연결",
    "cancelWhen": [
      "source-context-ended",
      "participant-unavailable",
      "required-fact-expired"
    ],
    "source": {
      "file": "docs/design/LIFE-EVENTS-100.json",
      "evidenceLevel": "fictional-scenario"
    },
    "stateDependencies": [
      "home.tenure",
      "current-place-or-contract"
    ],
    "probabilityKind": "game-tuning-not-statistics",
    "ready": false,
    "implementationStatus": "deferred-state-or-policy-verification",
    "deferredReason": "원본 조건(실제 병원·학교·직장 접근 수요; 복수 주거 후보 확보)을 만족하는 실제 상태·제도·당사자 입력과 실행 처리가 아직 연결되지 않음. 과거 인물·소유물·진단·공식 통지를 소급 생성하지 않음."
  },
  {
    "id": "LIFE-031",
    "domain": "finance",
    "years": [
      1960,
      2026
    ],
    "ages": [
      18,
      85
    ],
    "title": "집으로 부칠 돈",
    "text": "가족이 이번 달만 생활비를 보태 달라고 한다.",
    "eligibility": "친척과 실명 관계 있음; 실제 송금 요청; 본인 생활비 여유 확인",
    "requires": [
      "scenario.LIFE-031.ready"
    ],
    "cooldownYears": 4,
    "choices": [
      {
        "id": "a",
        "label": "가능한 한도 송금",
        "text": "본인 현금 감소·수령 기록",
        "personality": {
          "weights": {
            "F": 0.5
          },
          "rationale": "상대의 의사·관계 우선 0.5",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-031.a",
          "actionId": "scenario.LIFE-031.a",
          "status": "implemented",
          "kind": "transfer",
          "minutes": 10,
          "cost": 10,
          "person": "parent"
        },
        "effect": {
          "description": "본인 현금 감소·수령 기록",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "다음 해: 부족이 계속되고 가족 사정이 확인되면 분담 재협의",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "본인 현금 감소·수령 기록 · 장면 시간 10분 · 10만 원 · 이번 선택에서 지출"
      },
      {
        "id": "b",
        "label": "일부만 제안",
        "text": "동의 시 그 금액만 이동",
        "personality": {
          "weights": {
            "F": 0.2,
            "J": 0.3
          },
          "rationale": "상대의 의사·관계 우선 0.2 · 미리 정하는 일정·경계 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-031.b",
          "actionId": "scenario.LIFE-031.b",
          "status": "implemented",
          "kind": "request",
          "minutes": 10,
          "cost": 5,
          "person": "parent"
        },
        "effect": {
          "description": "동의 시 그 금액만 이동",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "다음 해: 부족이 계속되고 가족 사정이 확인되면 분담 재협의",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "동의 시 그 금액만 이동 · 장면 시간 10분 · 5만 원 · 승인 뒤 실행 때만 지출 · 승인·거절은 다음 해 현재 여건으로 재확인"
      },
      {
        "id": "c",
        "label": "어렵다고 설명",
        "text": "현금 유지·요청 응답 기록",
        "personality": {
          "weights": {
            "J": 0.3,
            "T": 0.3
          },
          "rationale": "미리 정하는 일정·경계 0.3 · 명시적인 조건·비용 비교 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-031.c",
          "actionId": "scenario.LIFE-031.c",
          "status": "implemented",
          "kind": "hold",
          "minutes": 0,
          "cost": 0
        },
        "effect": {
          "description": "현금 유지·요청 응답 기록",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "다음 해: 부족이 계속되고 가족 사정이 확인되면 분담 재협의",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "현금 유지·요청 응답 기록 · 추가 시간 없음 · 추가 비용 없음"
      }
    ],
    "guard": "거절을 절연으로 자동 처리 금지; 송금·가구 합산 시 이중 차감 금지",
    "followUp": "다음 해: 부족이 계속되고 가족 사정이 확인되면 분담 재협의",
    "cancelWhen": [
      "source-context-ended",
      "participant-unavailable",
      "required-fact-expired"
    ],
    "source": {
      "file": "docs/design/LIFE-EVENTS-100.json",
      "evidenceLevel": "fictional-scenario"
    },
    "stateDependencies": [
      "money.assets",
      "owned-asset-or-verified-contract"
    ],
    "probabilityKind": "game-tuning-not-statistics",
    "ready": true,
    "scenarioProfile": true,
    "implementationStatus": "implemented-conditional-scenario"
  },
  {
    "id": "LIFE-032",
    "domain": "finance",
    "years": [
      1970,
      2026
    ],
    "ages": [
      20,
      85
    ],
    "title": "지인의 곗돈 제안",
    "text": "아는 사람이 함께 돈을 모으자며 회비와 순번을 설명한다.",
    "eligibility": "공동 적립 모임 참여 제안; 신뢰·회비·순번 정보 확인 가능",
    "requires": [
      "scenario.LIFE-032.ready"
    ],
    "cooldownYears": 4,
    "choices": [
      {
        "id": "a",
        "label": "조건·명단 확인",
        "text": "참여 전 정보 수집",
        "personality": {
          "weights": {
            "T": 0.4,
            "J": 0.4
          },
          "rationale": "명시적인 조건·비용 비교 0.4 · 미리 정하는 일정·경계 0.4",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-032.a",
          "actionId": "scenario.LIFE-032.a",
          "status": "specification-only"
        },
        "effect": {
          "description": "참여 전 정보 수집",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "각 지급기: 실제 납입·수령만 장부 반영; 미납 확인 때만 협의 사건",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      },
      {
        "id": "b",
        "label": "감당 가능한 범위 참여",
        "text": "확정 회비·채권 기록",
        "personality": {
          "weights": {
            "E": 0.3,
            "P": 0.3
          },
          "rationale": "직접 교류하는 방식 0.3 · 상황에 맞춘 유연한 조정 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-032.b",
          "actionId": "scenario.LIFE-032.b",
          "status": "specification-only"
        },
        "effect": {
          "description": "확정 회비·채권 기록",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "각 지급기: 실제 납입·수령만 장부 반영; 미납 확인 때만 협의 사건",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      },
      {
        "id": "c",
        "label": "거절",
        "text": "기존 재정 유지",
        "personality": {
          "weights": {
            "J": 0.4
          },
          "rationale": "미리 정하는 일정·경계 0.4",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-032.c",
          "actionId": "scenario.LIFE-032.c",
          "status": "specification-only"
        },
        "effect": {
          "description": "기존 재정 유지",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "각 지급기: 실제 납입·수령만 장부 반영; 미납 확인 때만 협의 사건",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      }
    ],
    "guard": "시대별 운영 형태 확인; 참여를 사기 손실·큰 수익으로 확정 금지",
    "followUp": "각 지급기: 실제 납입·수령만 장부 반영; 미납 확인 때만 협의 사건",
    "cancelWhen": [
      "source-context-ended",
      "participant-unavailable",
      "required-fact-expired"
    ],
    "source": {
      "file": "docs/design/LIFE-EVENTS-100.json",
      "evidenceLevel": "fictional-scenario"
    },
    "stateDependencies": [
      "money.assets",
      "owned-asset-or-verified-contract"
    ],
    "probabilityKind": "game-tuning-not-statistics",
    "ready": false,
    "implementationStatus": "deferred-state-or-policy-verification",
    "deferredReason": "원본 조건(공동 적립 모임 참여 제안; 신뢰·회비·순번 정보 확인 가능)을 만족하는 실제 상태·제도·당사자 입력과 실행 처리가 아직 연결되지 않음. 과거 인물·소유물·진단·공식 통지를 소급 생성하지 않음."
  },
  {
    "id": "LIFE-033",
    "domain": "finance",
    "years": [
      1980,
      2026
    ],
    "ages": [
      20,
      85
    ],
    "title": "고칠까 새로 살까",
    "text": "냉장고나 세탁기가 멈춰 수리와 교체 비용을 비교하게 됐다.",
    "eligibility": "소유 가전 고장·수리 견적 있음; 실제 대체품 가격 확인",
    "requires": [
      "scenario.LIFE-033.ready"
    ],
    "cooldownYears": 4,
    "choices": [
      {
        "id": "a",
        "label": "수리",
        "text": "확정 수리비·작동 확인",
        "personality": {
          "weights": {
            "S": 0.3,
            "J": 0.3
          },
          "rationale": "익숙하고 구체적인 수단 0.3 · 미리 정하는 일정·경계 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-033.a",
          "actionId": "scenario.LIFE-033.a",
          "status": "implemented",
          "kind": "expense",
          "minutes": 20,
          "cost": 0,
          "costFrom": "repair",
          "record": "appliance-repaired"
        },
        "effect": {
          "description": "확정 수리비·작동 확인",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "다음 기간: 실제 작동 상태와 보증 조건이 있을 때만 재수리·환불 연결",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "확정 수리비·작동 확인 · 장면 시간 20분 · 추가 비용 없음"
      },
      {
        "id": "b",
        "label": "교체",
        "text": "물건·결제 방식 갱신",
        "personality": {
          "weights": {
            "N": 0.3,
            "P": 0.3
          },
          "rationale": "새 방법 탐색 0.3 · 상황에 맞춘 유연한 조정 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-033.b",
          "actionId": "scenario.LIFE-033.b",
          "status": "implemented",
          "kind": "expense",
          "minutes": 30,
          "cost": 0,
          "costFrom": "replacement",
          "record": "appliance-replaced"
        },
        "effect": {
          "description": "물건·결제 방식 갱신",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "다음 기간: 실제 작동 상태와 보증 조건이 있을 때만 재수리·환불 연결",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "물건·결제 방식 갱신 · 장면 시간 30분 · 추가 비용 없음"
      },
      {
        "id": "c",
        "label": "공유 대안 이용",
        "text": "이용료·이동시간",
        "personality": {
          "weights": {
            "P": 0.4
          },
          "rationale": "상황에 맞춘 유연한 조정 0.4",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-033.c",
          "actionId": "scenario.LIFE-033.c",
          "status": "implemented",
          "kind": "request",
          "minutes": 20,
          "cost": 0,
          "record": "appliance-sharing"
        },
        "effect": {
          "description": "이용료·이동시간",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "다음 기간: 실제 작동 상태와 보증 조건이 있을 때만 재수리·환불 연결",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "이용료·이동시간 · 장면 시간 20분 · 추가 비용 없음 · 승인·거절은 다음 해 현재 여건으로 재확인"
      }
    ],
    "guard": "보유 기기·전기 접근 없는 집에는 금지; 교체가 자산 수익처럼 계산되지 않음",
    "followUp": "다음 기간: 실제 작동 상태와 보증 조건이 있을 때만 재수리·환불 연결",
    "cancelWhen": [
      "source-context-ended",
      "participant-unavailable",
      "required-fact-expired"
    ],
    "source": {
      "file": "docs/design/LIFE-EVENTS-100.json",
      "evidenceLevel": "fictional-scenario"
    },
    "stateDependencies": [
      "money.assets",
      "owned-asset-or-verified-contract"
    ],
    "probabilityKind": "game-tuning-not-statistics",
    "ready": true,
    "scenarioProfile": true,
    "implementationStatus": "implemented-conditional-scenario"
  },
  {
    "id": "LIFE-034",
    "domain": "finance",
    "years": [
      1990,
      2026
    ],
    "ages": [
      20,
      85
    ],
    "title": "도장을 빌려 달라는 부탁",
    "text": "가까운 사람이 대출 보증을 부탁한다.",
    "eligibility": "지인 보증 요청; 실제 대출 조건·본인 보증 가능 여부 확인",
    "requires": [
      "scenario.LIFE-034.ready"
    ],
    "cooldownYears": 4,
    "choices": [
      {
        "id": "a",
        "label": "조건 검토",
        "text": "계약 전 상담",
        "personality": {
          "weights": {
            "J": 0.6,
            "T": 0.2
          },
          "rationale": "미리 정하는 일정·경계 0.6 · 명시적인 조건·비용 비교 0.2",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-034.a",
          "actionId": "scenario.LIFE-034.a",
          "status": "specification-only"
        },
        "effect": {
          "description": "계약 전 상담",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "상환기: 실제 연체·청구가 확인된 때만 본인 지급 의무 검토",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      },
      {
        "id": "b",
        "label": "거절하고 다른 도움 제안",
        "text": "동의한 도움만 반영",
        "personality": {
          "weights": {
            "J": 0.4,
            "F": 0.2
          },
          "rationale": "미리 정하는 일정·경계 0.4 · 상대의 의사·관계 우선 0.2",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-034.b",
          "actionId": "scenario.LIFE-034.b",
          "status": "specification-only"
        },
        "effect": {
          "description": "동의한 도움만 반영",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "상환기: 실제 연체·청구가 확인된 때만 본인 지급 의무 검토",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      },
      {
        "id": "c",
        "label": "한도 내 보증 계약",
        "text": "확정 우발채무 기록",
        "personality": {
          "weights": {
            "E": 0.2,
            "F": 0.3
          },
          "rationale": "직접 교류하는 방식 0.2 · 상대의 의사·관계 우선 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-034.c",
          "actionId": "scenario.LIFE-034.c",
          "status": "specification-only"
        },
        "effect": {
          "description": "확정 우발채무 기록",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "상환기: 실제 연체·청구가 확인된 때만 본인 지급 의무 검토",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      }
    ],
    "guard": "해당 연도 보증 제도 확인; 서명 즉시 대출금 전액 현금 차감 금지",
    "followUp": "상환기: 실제 연체·청구가 확인된 때만 본인 지급 의무 검토",
    "cancelWhen": [
      "source-context-ended",
      "participant-unavailable",
      "required-fact-expired"
    ],
    "source": {
      "file": "docs/design/LIFE-EVENTS-100.json",
      "evidenceLevel": "fictional-scenario"
    },
    "stateDependencies": [
      "money.assets",
      "owned-asset-or-verified-contract"
    ],
    "probabilityKind": "game-tuning-not-statistics",
    "ready": false,
    "implementationStatus": "deferred-state-or-policy-verification",
    "deferredReason": "원본 조건(지인 보증 요청; 실제 대출 조건·본인 보증 가능 여부 확인)을 만족하는 실제 상태·제도·당사자 입력과 실행 처리가 아직 연결되지 않음. 과거 인물·소유물·진단·공식 통지를 소급 생성하지 않음."
  },
  {
    "id": "LIFE-035",
    "domain": "finance",
    "years": [
      1990,
      2026
    ],
    "ages": [
      20,
      85
    ],
    "title": "모아 둔 돈을 꺼낼 때",
    "text": "계획했던 구매보다 먼저 꼭 내야 할 비용이 생겼다.",
    "eligibility": "비상예금·지출 목표 있음; 가족/본인 실제 긴급 비용 발생",
    "requires": [
      "scenario.LIFE-035.ready"
    ],
    "cooldownYears": 4,
    "choices": [
      {
        "id": "a",
        "label": "예금 사용",
        "text": "예금 감소·비용 지급",
        "personality": {
          "weights": {
            "J": 0.5
          },
          "rationale": "미리 정하는 일정·경계 0.5",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-035.a",
          "actionId": "scenario.LIFE-035.a",
          "status": "specification-only"
        },
        "effect": {
          "description": "예금 감소·비용 지급",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "다음 해: 실제 잔액·분납 의무를 바탕으로 저축 재개 여부 연결",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      },
      {
        "id": "b",
        "label": "기존 구매 연기",
        "text": "목표 일정 변경",
        "personality": {
          "weights": {
            "J": 0.4
          },
          "rationale": "미리 정하는 일정·경계 0.4",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-035.b",
          "actionId": "scenario.LIFE-035.b",
          "status": "specification-only"
        },
        "effect": {
          "description": "목표 일정 변경",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "다음 해: 실제 잔액·분납 의무를 바탕으로 저축 재개 여부 연결",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      },
      {
        "id": "c",
        "label": "가능한 분납 문의",
        "text": "승인 시 지급 일정 변경",
        "personality": {
          "weights": {
            "E": 0.2,
            "J": 0.3
          },
          "rationale": "직접 교류하는 방식 0.2 · 미리 정하는 일정·경계 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-035.c",
          "actionId": "scenario.LIFE-035.c",
          "status": "specification-only"
        },
        "effect": {
          "description": "승인 시 지급 일정 변경",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "다음 해: 실제 잔액·분납 의무를 바탕으로 저축 재개 여부 연결",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      }
    ],
    "guard": "분납 승인 전 채무 생성 금지; 같은 비용을 생활비와 사건에서 중복 차감 금지",
    "followUp": "다음 해: 실제 잔액·분납 의무를 바탕으로 저축 재개 여부 연결",
    "cancelWhen": [
      "source-context-ended",
      "participant-unavailable",
      "required-fact-expired"
    ],
    "source": {
      "file": "docs/design/LIFE-EVENTS-100.json",
      "evidenceLevel": "fictional-scenario"
    },
    "stateDependencies": [
      "money.assets",
      "owned-asset-or-verified-contract"
    ],
    "probabilityKind": "game-tuning-not-statistics",
    "ready": false,
    "implementationStatus": "deferred-state-or-policy-verification",
    "deferredReason": "원본 조건(비상예금·지출 목표 있음; 가족/본인 실제 긴급 비용 발생)을 만족하는 실제 상태·제도·당사자 입력과 실행 처리가 아직 연결되지 않음. 과거 인물·소유물·진단·공식 통지를 소급 생성하지 않음."
  },
  {
    "id": "LIFE-036",
    "domain": "finance",
    "years": [
      2000,
      2026
    ],
    "ages": [
      20,
      85
    ],
    "title": "청구일과 월급날 사이",
    "text": "곧 수입은 들어오지만 오늘 결제할 현금이 부족하다.",
    "eligibility": "카드·할부 계약 있음; 청구일에 유동 현금 부족",
    "requires": [
      "scenario.LIFE-036.ready"
    ],
    "cooldownYears": 4,
    "choices": [
      {
        "id": "a",
        "label": "보유 현금성 자산 이동",
        "text": "본인 계정 간 이전",
        "personality": {
          "weights": {
            "J": 0.5
          },
          "rationale": "미리 정하는 일정·경계 0.5",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-036.a",
          "actionId": "scenario.LIFE-036.a",
          "status": "specification-only"
        },
        "effect": {
          "description": "본인 계정 간 이전",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "납부기: 실제 납부 여부·약정 조건에 따라 미납 기록; 이후 현금흐름 일정 조정",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      },
      {
        "id": "b",
        "label": "금융사에 납부 조건 확인",
        "text": "확인된 일정",
        "personality": {
          "weights": {
            "E": 0.2,
            "J": 0.3
          },
          "rationale": "직접 교류하는 방식 0.2 · 미리 정하는 일정·경계 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-036.b",
          "actionId": "scenario.LIFE-036.b",
          "status": "specification-only"
        },
        "effect": {
          "description": "확인된 일정",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "납부기: 실제 납부 여부·약정 조건에 따라 미납 기록; 이후 현금흐름 일정 조정",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      },
      {
        "id": "c",
        "label": "재량 지출 중단",
        "text": "가능한 현금 확보",
        "personality": {
          "weights": {
            "J": 0.4
          },
          "rationale": "미리 정하는 일정·경계 0.4",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-036.c",
          "actionId": "scenario.LIFE-036.c",
          "status": "specification-only"
        },
        "effect": {
          "description": "가능한 현금 확보",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "납부기: 실제 납부 여부·약정 조건에 따라 미납 기록; 이후 현금흐름 일정 조정",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      }
    ],
    "guard": "현금 부족을 즉시 파산 처리 금지; 실제 미납 전 신용 하락 확정 금지",
    "followUp": "납부기: 실제 납부 여부·약정 조건에 따라 미납 기록; 이후 현금흐름 일정 조정",
    "cancelWhen": [
      "source-context-ended",
      "participant-unavailable",
      "required-fact-expired"
    ],
    "source": {
      "file": "docs/design/LIFE-EVENTS-100.json",
      "evidenceLevel": "fictional-scenario"
    },
    "stateDependencies": [
      "money.assets",
      "owned-asset-or-verified-contract"
    ],
    "probabilityKind": "game-tuning-not-statistics",
    "ready": false,
    "implementationStatus": "deferred-state-or-policy-verification",
    "deferredReason": "원본 조건(카드·할부 계약 있음; 청구일에 유동 현금 부족)을 만족하는 실제 상태·제도·당사자 입력과 실행 처리가 아직 연결되지 않음. 과거 인물·소유물·진단·공식 통지를 소급 생성하지 않음."
  },
  {
    "id": "LIFE-037",
    "domain": "finance",
    "years": [
      2000,
      2026
    ],
    "ages": [
      20,
      80
    ],
    "title": "대출 이자가 다시 계산됐다",
    "text": "다음 납부일부터 이자 부담이 달라진다는 통지가 왔다.",
    "eligibility": "해당 대출 변동금리 재산정 통지; 원리금·현금흐름 기록",
    "requires": [
      "scenario.LIFE-037.ready"
    ],
    "cooldownYears": 4,
    "choices": [
      {
        "id": "a",
        "label": "장부 재계산",
        "text": "실제 이자 항목 변경",
        "personality": {
          "weights": {
            "J": 0.4
          },
          "rationale": "미리 정하는 일정·경계 0.4",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-037.a",
          "actionId": "scenario.LIFE-037.a",
          "status": "specification-only"
        },
        "effect": {
          "description": "실제 이자 항목 변경",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "다음 재산정기: 잔액·금리·실제 계약 조건으로 재계산",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      },
      {
        "id": "b",
        "label": "대환 조건 비교",
        "text": "승인 전 현 대출 유지",
        "personality": {
          "weights": {
            "T": 0.4,
            "J": 0.4
          },
          "rationale": "명시적인 조건·비용 비교 0.4 · 미리 정하는 일정·경계 0.4",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-037.b",
          "actionId": "scenario.LIFE-037.b",
          "status": "specification-only"
        },
        "effect": {
          "description": "승인 전 현 대출 유지",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "다음 재산정기: 잔액·금리·실제 계약 조건으로 재계산",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      },
      {
        "id": "c",
        "label": "여유자금 일부 상환",
        "text": "원금·현금 동시 감소",
        "personality": {
          "weights": {
            "S": 0.3,
            "J": 0.3
          },
          "rationale": "익숙하고 구체적인 수단 0.3 · 미리 정하는 일정·경계 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-037.c",
          "actionId": "scenario.LIFE-037.c",
          "status": "specification-only"
        },
        "effect": {
          "description": "원금·현금 동시 감소",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "다음 재산정기: 잔액·금리·실제 계약 조건으로 재계산",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      }
    ],
    "guard": "기준금리와 개인 대출금리 동일시 금지; 상환 원금을 소비로 중복 처리 금지",
    "followUp": "다음 재산정기: 잔액·금리·실제 계약 조건으로 재계산",
    "cancelWhen": [
      "source-context-ended",
      "participant-unavailable",
      "required-fact-expired"
    ],
    "source": {
      "file": "docs/design/LIFE-EVENTS-100.json",
      "evidenceLevel": "fictional-scenario"
    },
    "stateDependencies": [
      "money.assets",
      "owned-asset-or-verified-contract"
    ],
    "probabilityKind": "game-tuning-not-statistics",
    "ready": false,
    "implementationStatus": "deferred-state-or-policy-verification",
    "deferredReason": "원본 조건(해당 대출 변동금리 재산정 통지; 원리금·현금흐름 기록)을 만족하는 실제 상태·제도·당사자 입력과 실행 처리가 아직 연결되지 않음. 과거 인물·소유물·진단·공식 통지를 소급 생성하지 않음."
  },
  {
    "id": "LIFE-038",
    "domain": "finance",
    "years": [
      2005,
      2026
    ],
    "ages": [
      18,
      85
    ],
    "title": "쓰지 않는 월정액",
    "text": "예전에는 자주 쓰던 서비스를 최근엔 거의 열지 않았다.",
    "ready": false,
    "requires": [
      "subscription.active",
      "subscription.low-use",
      "subscription.renewal",
      "subscription.shared-use-reviewed"
    ],
    "eligibility": "유료 정기 서비스 이용 이력; 실제 사용 감소·갱신 예정",
    "choices": [
      {
        "id": "a",
        "label": "해지",
        "text": "효력일부터 비용 중단",
        "personality": {
          "weights": {
            "J": 0.4,
            "T": 0.3
          },
          "rationale": "미리 정하는 일정·경계 0.4 · 명시적인 조건·비용 비교 0.3",
          "authored": true
        },
        "operation": {
          "id": "request-subscription-cancellation",
          "status": "specification-only",
          "requiresConsent": false,
          "ledger": "only-confirmed-once",
          "charge": "verified-amount-only",
          "result": "confirmed-response-only",
          "actionId": "request-subscription-cancellation",
          "requiredInputs": [
            "confirmed-source-facts",
            "current-context",
            "unique-operation-id",
            "effective-year"
          ]
        },
        "effect": {
          "description": "효력일부터 비용 중단",
          "applyAutomatically": false
        },
        "followUp": {
          "afterYears": 1,
          "description": "다음 활동 요청: 해지된 서비스 접근이 필요하면 재가입·대체 중 선택 실제 일정이 1년 안에 끝나면 같은 연도 기록에서 처리하고 다음 연도에는 이행 여부만 재확인한다.",
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-facts-invalid",
            "participant-unavailable",
            "context-changed"
          ],
          "automaticSuccess": false,
          "duePolicy": "next-annual-review-after-recorded-deadline"
        },
        "requires": [
          "subscription.cancellation-terms"
        ]
      },
      {
        "id": "b",
        "label": "낮은 요금제로 변경",
        "text": "승인 조건 적용",
        "personality": {
          "weights": {
            "N": 0.3,
            "P": 0.3
          },
          "rationale": "새 방법 탐색 0.3 · 상황에 맞춘 유연한 조정 0.3",
          "authored": true
        },
        "operation": {
          "id": "request-subscription-downgrade",
          "status": "specification-only",
          "requiresConsent": true,
          "ledger": "only-confirmed-once",
          "charge": "verified-amount-only",
          "result": "confirmed-response-only",
          "actionId": "request-subscription-downgrade",
          "requiredInputs": [
            "confirmed-source-facts",
            "current-context",
            "unique-operation-id",
            "effective-year"
          ]
        },
        "effect": {
          "description": "승인 조건 적용",
          "applyAutomatically": false
        },
        "followUp": {
          "afterYears": 1,
          "description": "다음 활동 요청: 해지된 서비스 접근이 필요하면 재가입·대체 중 선택 실제 일정이 1년 안에 끝나면 같은 연도 기록에서 처리하고 다음 연도에는 이행 여부만 재확인한다.",
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-facts-invalid",
            "participant-unavailable",
            "context-changed"
          ],
          "automaticSuccess": false,
          "duePolicy": "next-annual-review-after-recorded-deadline"
        },
        "requires": [
          "subscription.lower-plan-offered"
        ]
      },
      {
        "id": "c",
        "label": "유지",
        "text": "기존 접근·비용 유지",
        "personality": {
          "weights": {
            "S": 0.3,
            "J": 0.3
          },
          "rationale": "익숙하고 구체적인 수단 0.3 · 미리 정하는 일정·경계 0.3",
          "authored": true
        },
        "operation": {
          "id": "retain-subscription",
          "status": "specification-only",
          "requiresConsent": false,
          "ledger": "only-confirmed-once",
          "charge": "verified-amount-only",
          "result": "confirmed-response-only",
          "actionId": "retain-subscription",
          "requiredInputs": [
            "confirmed-source-facts",
            "current-context",
            "unique-operation-id",
            "effective-year"
          ]
        },
        "effect": {
          "description": "기존 접근·비용 유지",
          "applyAutomatically": false
        },
        "followUp": {
          "afterYears": 1,
          "description": "다음 활동 요청: 해지된 서비스 접근이 필요하면 재가입·대체 중 선택 실제 일정이 1년 안에 끝나면 같은 연도 기록에서 처리하고 다음 연도에는 이행 여부만 재확인한다.",
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-facts-invalid",
            "participant-unavailable",
            "context-changed"
          ],
          "automaticSuccess": false,
          "duePolicy": "next-annual-review-after-recorded-deadline"
        },
        "requires": []
      }
    ],
    "cancelWhen": [
      "required-fact-missing-or-expired",
      "source-context-ended",
      "actor-or-counterparty-no-longer-eligible"
    ],
    "guard": "해지 신청 이전 기간 환급 임의 생성 금지; 가족 공동 사용 여부 확인",
    "followUp": "다음 활동 요청: 해지된 서비스 접근이 필요하면 재가입·대체 중 선택",
    "source": {
      "file": "docs/design/LIFE-EVENTS-100.json",
      "evidenceLevel": "fictional-scenario"
    },
    "stateDependencies": [
      "money.assets",
      "owned-asset-or-verified-contract"
    ],
    "probabilityKind": "game-tuning-not-statistics",
    "implementationStatus": "deferred-state-or-policy-verification",
    "deferredReason": "원본 조건(유료 정기 서비스 이용 이력; 실제 사용 감소·갱신 예정)을 만족하는 실제 상태·제도·당사자 입력과 실행 처리가 아직 연결되지 않음. 과거 인물·소유물·진단·공식 통지를 소급 생성하지 않음."
  },
  {
    "id": "LIFE-039",
    "domain": "finance",
    "years": [
      2010,
      2026
    ],
    "ages": [
      20,
      80
    ],
    "title": "계좌가 줄었는데 돈 쓸 날은 다가온다",
    "text": "평가액이 떨어진 자산을 언제 현금으로 바꿀지 고민한다.",
    "eligibility": "기존 투자자산 보유; 실제 평가손익·가까운 지출 예정",
    "requires": [
      "scenario.LIFE-039.ready"
    ],
    "cooldownYears": 4,
    "choices": [
      {
        "id": "a",
        "label": "필요분 매도",
        "text": "체결 금액만 현금·수량 반영",
        "personality": {
          "weights": {
            "J": 0.4,
            "T": 0.4
          },
          "rationale": "미리 정하는 일정·경계 0.4 · 명시적인 조건·비용 비교 0.4",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-039.a",
          "actionId": "scenario.LIFE-039.a",
          "status": "specification-only"
        },
        "effect": {
          "description": "체결 금액만 현금·수량 반영",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "예정 지출일: 실제 현금 잔액으로 구매 가능 여부 판단; 이후 가격은 기존 시장 경로 사용",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      },
      {
        "id": "b",
        "label": "유지하고 구매 연기",
        "text": "지출 목표 변경",
        "personality": {
          "weights": {
            "P": 0.3
          },
          "rationale": "상황에 맞춘 유연한 조정 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-039.b",
          "actionId": "scenario.LIFE-039.b",
          "status": "specification-only"
        },
        "effect": {
          "description": "지출 목표 변경",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "예정 지출일: 실제 현금 잔액으로 구매 가능 여부 판단; 이후 가격은 기존 시장 경로 사용",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      },
      {
        "id": "c",
        "label": "위험 비중 조정",
        "text": "실제 거래 비용 반영",
        "personality": {
          "weights": {
            "N": 0.3,
            "P": 0.3
          },
          "rationale": "새 방법 탐색 0.3 · 상황에 맞춘 유연한 조정 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-039.c",
          "actionId": "scenario.LIFE-039.c",
          "status": "specification-only"
        },
        "effect": {
          "description": "실제 거래 비용 반영",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "예정 지출일: 실제 현금 잔액으로 구매 가능 여부 판단; 이후 가격은 기존 시장 경로 사용",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      }
    ],
    "guard": "보유 이력 없으면 금지; 선택 뒤 가격을 보상·처벌용으로 조작 금지",
    "followUp": "예정 지출일: 실제 현금 잔액으로 구매 가능 여부 판단; 이후 가격은 기존 시장 경로 사용",
    "cancelWhen": [
      "source-context-ended",
      "participant-unavailable",
      "required-fact-expired"
    ],
    "source": {
      "file": "docs/design/LIFE-EVENTS-100.json",
      "evidenceLevel": "fictional-scenario"
    },
    "stateDependencies": [
      "money.assets",
      "owned-asset-or-verified-contract"
    ],
    "probabilityKind": "game-tuning-not-statistics",
    "ready": false,
    "implementationStatus": "deferred-state-or-policy-verification",
    "deferredReason": "원본 조건(기존 투자자산 보유; 실제 평가손익·가까운 지출 예정)을 만족하는 실제 상태·제도·당사자 입력과 실행 처리가 아직 연결되지 않음. 과거 인물·소유물·진단·공식 통지를 소급 생성하지 않음."
  },
  {
    "id": "LIFE-040",
    "domain": "finance",
    "years": [
      2015,
      2026
    ],
    "ages": [
      18,
      85
    ],
    "title": "팔기로 한 물건의 상태",
    "text": "구매자가 사진에 없는 흠집을 확인해 달라고 한다.",
    "eligibility": "중고 물품 소유·거래 제안·대면 또는 배송 경로 있음",
    "requires": [
      "scenario.LIFE-040.ready"
    ],
    "cooldownYears": 4,
    "choices": [
      {
        "id": "a",
        "label": "상태 알리고 가격 협의",
        "text": "합의 후 거래",
        "personality": {
          "weights": {
            "T": 0.3,
            "J": 0.3
          },
          "rationale": "명시적인 조건·비용 비교 0.3 · 미리 정하는 일정·경계 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-040.a",
          "actionId": "scenario.LIFE-040.a",
          "status": "specification-only"
        },
        "effect": {
          "description": "합의 후 거래",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "인도·정산 뒤: 완료 금액만 반영; 이의 제기 시 거래 기록 기반 조정",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      },
      {
        "id": "b",
        "label": "판매 철회",
        "text": "물건 유지",
        "personality": {
          "weights": {
            "J": 0.4
          },
          "rationale": "미리 정하는 일정·경계 0.4",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-040.b",
          "actionId": "scenario.LIFE-040.b",
          "status": "specification-only"
        },
        "effect": {
          "description": "물건 유지",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "인도·정산 뒤: 완료 금액만 반영; 이의 제기 시 거래 기록 기반 조정",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      },
      {
        "id": "c",
        "label": "수선 후 재등록",
        "text": "실제 수선비·시간",
        "personality": {
          "weights": {
            "P": 0.3
          },
          "rationale": "상황에 맞춘 유연한 조정 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-040.c",
          "actionId": "scenario.LIFE-040.c",
          "status": "specification-only"
        },
        "effect": {
          "description": "실제 수선비·시간",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "인도·정산 뒤: 완료 금액만 반영; 이의 제기 시 거래 기록 기반 조정",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      }
    ],
    "guard": "등록만으로 매출 생성 금지; 구매자 만족·평판은 실제 확인된 반응만 저장",
    "followUp": "인도·정산 뒤: 완료 금액만 반영; 이의 제기 시 거래 기록 기반 조정",
    "cancelWhen": [
      "source-context-ended",
      "participant-unavailable",
      "required-fact-expired"
    ],
    "source": {
      "file": "docs/design/LIFE-EVENTS-100.json",
      "evidenceLevel": "fictional-scenario"
    },
    "stateDependencies": [
      "money.assets",
      "owned-asset-or-verified-contract"
    ],
    "probabilityKind": "game-tuning-not-statistics",
    "ready": false,
    "implementationStatus": "deferred-state-or-policy-verification",
    "deferredReason": "원본 조건(중고 물품 소유·거래 제안·대면 또는 배송 경로 있음)을 만족하는 실제 상태·제도·당사자 입력과 실행 처리가 아직 연결되지 않음. 과거 인물·소유물·진단·공식 통지를 소급 생성하지 않음."
  },
  {
    "id": "LIFE-041",
    "domain": "family",
    "years": [
      1960,
      2026
    ],
    "ages": [
      5,
      17
    ],
    "title": "동생이 온 뒤 달라진 저녁",
    "text": "어른들이 아기를 돌보느라 예전처럼 함께 보내는 시간이 줄었다.",
    "eligibility": "동생 출생 확정; 동일 가구; 보호자 생활 일정 변화",
    "requires": [
      "scenario.LIFE-041.ready"
    ],
    "cooldownYears": 4,
    "choices": [
      {
        "id": "a",
        "label": "함께할 시간 요청",
        "text": "보호자 응답·약속",
        "personality": {
          "weights": {
            "E": 0.2,
            "F": 0.4
          },
          "rationale": "직접 교류하는 방식 0.2 · 상대의 의사·관계 우선 0.4",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-041.a",
          "actionId": "scenario.LIFE-041.a",
          "status": "implemented",
          "kind": "request",
          "minutes": 10,
          "cost": 0,
          "person": "parent"
        },
        "effect": {
          "description": "보호자 응답·약속",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "다음 해: 실제 보호자 약속 이행·접촉 횟수로 관계 변화; 동생은 계속 가구 구성에 표시",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "보호자 응답·약속 · 장면 시간 10분 · 추가 비용 없음 · 승인·거절은 다음 해 현재 여건으로 재확인"
      },
      {
        "id": "b",
        "label": "가능한 작은 일 돕기",
        "text": "연령에 맞는 짧은 역할",
        "personality": {
          "weights": {
            "F": 0.3,
            "J": 0.3
          },
          "rationale": "상대의 의사·관계 우선 0.3 · 미리 정하는 일정·경계 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-041.b",
          "actionId": "scenario.LIFE-041.b",
          "status": "implemented",
          "kind": "help",
          "minutes": 10,
          "cost": 0
        },
        "effect": {
          "description": "연령에 맞는 짧은 역할",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "다음 해: 실제 보호자 약속 이행·접촉 횟수로 관계 변화; 동생은 계속 가구 구성에 표시",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "연령에 맞는 짧은 역할 · 장면 시간 10분 · 추가 비용 없음"
      },
      {
        "id": "c",
        "label": "기존 놀이 유지",
        "text": "자기 시간 유지",
        "personality": {
          "weights": {
            "I": 0.3,
            "P": 0.3
          },
          "rationale": "혼자 정리할 시간 0.3 · 상황에 맞춘 유연한 조정 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-041.c",
          "actionId": "scenario.LIFE-041.c",
          "status": "implemented",
          "kind": "hold",
          "minutes": 0,
          "cost": 0
        },
        "effect": {
          "description": "자기 시간 유지",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "다음 해: 실제 보호자 약속 이행·접촉 횟수로 관계 변화; 동생은 계속 가구 구성에 표시",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "자기 시간 유지 · 추가 시간 없음 · 추가 비용 없음"
      }
    ],
    "guard": "아이에게 성인 돌봄 책임 전가 금지; 출생만으로 질투·가족 화목 확정 금지",
    "followUp": "다음 해: 실제 보호자 약속 이행·접촉 횟수로 관계 변화; 동생은 계속 가구 구성에 표시",
    "cancelWhen": [
      "source-context-ended",
      "participant-unavailable",
      "required-fact-expired"
    ],
    "source": {
      "file": "docs/design/LIFE-EVENTS-100.json",
      "evidenceLevel": "fictional-scenario"
    },
    "stateDependencies": [
      "family",
      "living-existing-relative"
    ],
    "probabilityKind": "game-tuning-not-statistics",
    "ready": true,
    "scenarioProfile": true,
    "implementationStatus": "implemented-conditional-scenario"
  },
  {
    "id": "LIFE-042",
    "domain": "family",
    "years": [
      1960,
      2026
    ],
    "ages": [
      13,
      35
    ],
    "title": "방 하나를 나눠 쓰는 규칙",
    "text": "한 사람은 잠들려 하고 다른 사람은 공부나 일을 해야 한다.",
    "ready": true,
    "requires": [
      "scenario.LIFE-042.ready"
    ],
    "eligibility": "형제자매와 공간·물품 공유; 일정 충돌 기록",
    "choices": [
      {
        "id": "a",
        "label": "시간 구역 나누기",
        "text": "상호 합의 일정",
        "personality": {
          "weights": {
            "J": 0.4
          },
          "rationale": "미리 정하는 일정·경계 0.4",
          "authored": true
        },
        "operation": {
          "id": "scenario.LIFE-042.a",
          "actionId": "scenario.LIFE-042.a",
          "status": "implemented",
          "kind": "request",
          "minutes": 20,
          "cost": 0
        },
        "effect": {
          "description": "상호 합의 일정",
          "applyAutomatically": false
        },
        "followUp": {
          "afterYears": 1,
          "description": "다음 기간: 실제 규칙 준수와 갈등 재발 여부로 재협의 실제 일정이 1년 안에 끝나면 같은 연도 기록에서 처리하고 다음 연도에는 이행 여부만 재확인한다.",
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-facts-invalid",
            "participant-unavailable",
            "context-changed"
          ],
          "automaticSuccess": false,
          "duePolicy": "next-annual-review-after-recorded-deadline"
        },
        "requires": [],
        "hint": "상호 합의 일정 · 장면 시간 20분 · 추가 비용 없음 · 승인·거절은 다음 해 현재 여건으로 재확인"
      },
      {
        "id": "b",
        "label": "다른 장소 찾기",
        "text": "접근·이동 부담",
        "personality": {
          "weights": {
            "N": 0.3,
            "P": 0.3
          },
          "rationale": "새 방법 탐색 0.3 · 상황에 맞춘 유연한 조정 0.3",
          "authored": true
        },
        "operation": {
          "id": "scenario.LIFE-042.b",
          "actionId": "scenario.LIFE-042.b",
          "status": "implemented",
          "kind": "rule",
          "minutes": 30,
          "cost": 0,
          "needs": "alternate-space",
          "record": "alternate-study-space"
        },
        "effect": {
          "description": "접근·이동 부담",
          "applyAutomatically": false
        },
        "followUp": {
          "afterYears": 1,
          "description": "다음 기간: 실제 규칙 준수와 갈등 재발 여부로 재협의 실제 일정이 1년 안에 끝나면 같은 연도 기록에서 처리하고 다음 연도에는 이행 여부만 재확인한다.",
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-facts-invalid",
            "participant-unavailable",
            "context-changed"
          ],
          "automaticSuccess": false,
          "duePolicy": "next-annual-review-after-recorded-deadline"
        },
        "requires": [],
        "hint": "접근·이동 부담 · 장면 시간 30분 · 추가 비용 없음"
      },
      {
        "id": "c",
        "label": "가구와 가림막 조정",
        "text": "합의된 비용·공간 변화",
        "personality": {
          "weights": {
            "P": 0.3
          },
          "rationale": "상황에 맞춘 유연한 조정 0.3",
          "authored": true
        },
        "operation": {
          "id": "scenario.LIFE-042.c",
          "actionId": "scenario.LIFE-042.c",
          "status": "implemented",
          "kind": "request",
          "minutes": 20,
          "cost": 0,
          "costFrom": "partition",
          "record": "shared-space-partition"
        },
        "effect": {
          "description": "합의된 비용·공간 변화",
          "applyAutomatically": false
        },
        "followUp": {
          "afterYears": 1,
          "description": "다음 기간: 실제 규칙 준수와 갈등 재발 여부로 재협의 실제 일정이 1년 안에 끝나면 같은 연도 기록에서 처리하고 다음 연도에는 이행 여부만 재확인한다.",
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-facts-invalid",
            "participant-unavailable",
            "context-changed"
          ],
          "automaticSuccess": false,
          "duePolicy": "next-annual-review-after-recorded-deadline"
        },
        "requires": [],
        "hint": "합의된 비용·공간 변화 · 장면 시간 20분 · 추가 비용 없음 · 승인·거절은 다음 해 현재 여건으로 재확인"
      }
    ],
    "cancelWhen": [
      "required-fact-missing-or-expired",
      "source-context-ended",
      "actor-or-counterparty-no-longer-eligible"
    ],
    "guard": "형제자매·동거 기록 없는 인물 생성 금지; 방 개수 임의 증가 금지",
    "followUp": "다음 기간: 실제 규칙 준수와 갈등 재발 여부로 재협의",
    "source": {
      "file": "docs/design/LIFE-EVENTS-100.json",
      "evidenceLevel": "fictional-scenario"
    },
    "stateDependencies": [
      "family",
      "living-existing-relative"
    ],
    "probabilityKind": "game-tuning-not-statistics",
    "implementationStatus": "implemented-conditional-scenario",
    "deferredReason": "원본 조건(형제자매와 공간·물품 공유; 일정 충돌 기록)을 만족하는 실제 상태·제도·당사자 입력과 실행 처리가 아직 연결되지 않음. 과거 인물·소유물·진단·공식 통지를 소급 생성하지 않음.",
    "scenarioProfile": true
  },
  {
    "id": "LIFE-043",
    "domain": "family",
    "years": [
      1970,
      2026
    ],
    "ages": [
      20,
      65
    ],
    "title": "이번에는 고향에 갈 수 있을까",
    "text": "가족 모임 날짜가 근무표와 겹쳤다.",
    "eligibility": "타지 거주; 실제 가족 행사·근무 일정 겹침",
    "requires": [
      "scenario.LIFE-043.ready"
    ],
    "cooldownYears": 4,
    "choices": [
      {
        "id": "a",
        "label": "휴무 교대 요청",
        "text": "동의 시 방문 일정",
        "personality": {
          "weights": {
            "E": 0.2,
            "J": 0.3
          },
          "rationale": "직접 교류하는 방식 0.2 · 미리 정하는 일정·경계 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-043.a",
          "actionId": "scenario.LIFE-043.a",
          "status": "implemented",
          "kind": "request",
          "minutes": 20,
          "cost": 0,
          "person": "parent"
        },
        "effect": {
          "description": "동의 시 방문 일정",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "다음 방문기: 실제 방문·대체 연락 이행을 관계 기억에 반영",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "동의 시 방문 일정 · 장면 시간 20분 · 추가 비용 없음 · 승인·거절은 다음 해 현재 여건으로 재확인"
      },
      {
        "id": "b",
        "label": "짧게 방문",
        "text": "교통비·휴식시간",
        "personality": {
          "weights": {
            "P": 0.4
          },
          "rationale": "상황에 맞춘 유연한 조정 0.4",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-043.b",
          "actionId": "scenario.LIFE-043.b",
          "status": "implemented",
          "kind": "expense",
          "minutes": 45,
          "cost": 4,
          "person": "parent",
          "record": "short-family-visit"
        },
        "effect": {
          "description": "교통비·휴식시간",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "다음 방문기: 실제 방문·대체 연락 이행을 관계 기억에 반영",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "교통비·휴식시간 · 장면 시간 45분 · 4만 원 · 이번 선택에서 지출"
      },
      {
        "id": "c",
        "label": "사정 알리고 다른 날 약속",
        "text": "새 약속 생성",
        "personality": {
          "weights": {
            "F": 0.4,
            "P": 0.2
          },
          "rationale": "상대의 의사·관계 우선 0.4 · 상황에 맞춘 유연한 조정 0.2",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-043.c",
          "actionId": "scenario.LIFE-043.c",
          "status": "implemented",
          "kind": "request",
          "minutes": 10,
          "cost": 0,
          "person": "parent"
        },
        "effect": {
          "description": "새 약속 생성",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "다음 방문기: 실제 방문·대체 연락 이행을 관계 기억에 반영",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "새 약속 생성 · 장면 시간 10분 · 추가 비용 없음 · 승인·거절은 다음 해 현재 여건으로 재확인"
      }
    ],
    "guard": "불참 1회로 절연 금지; 교통수단·연락 방식은 시대별 접근 확인",
    "followUp": "다음 방문기: 실제 방문·대체 연락 이행을 관계 기억에 반영",
    "cancelWhen": [
      "source-context-ended",
      "participant-unavailable",
      "required-fact-expired"
    ],
    "source": {
      "file": "docs/design/LIFE-EVENTS-100.json",
      "evidenceLevel": "fictional-scenario"
    },
    "stateDependencies": [
      "family",
      "living-existing-relative"
    ],
    "probabilityKind": "game-tuning-not-statistics",
    "ready": true,
    "scenarioProfile": true,
    "implementationStatus": "implemented-conditional-scenario"
  },
  {
    "id": "LIFE-044",
    "domain": "family",
    "years": [
      1980,
      2026
    ],
    "ages": [
      20,
      70
    ],
    "title": "퇴근 뒤 일은 누가 할까",
    "text": "최근 한 사람이 집안일을 더 맡고 있다는 이야기가 나왔다.",
    "ready": true,
    "requires": [
      "scenario.LIFE-044.ready"
    ],
    "eligibility": "파트너 존재; 양쪽 근무·가사 부담 기록",
    "choices": [
      {
        "id": "a",
        "label": "역할 다시 나누기",
        "text": "합의된 시간 배분",
        "personality": {
          "weights": {
            "F": 0.4,
            "J": 0.3
          },
          "rationale": "상대의 의사·관계 우선 0.4 · 미리 정하는 일정·경계 0.3",
          "authored": true
        },
        "operation": {
          "id": "scenario.LIFE-044.a",
          "actionId": "scenario.LIFE-044.a",
          "status": "implemented",
          "kind": "request",
          "minutes": 20,
          "cost": 0,
          "person": "partner",
          "change": "chores"
        },
        "effect": {
          "description": "합의된 시간 배분",
          "applyAutomatically": false
        },
        "followUp": {
          "afterYears": 1,
          "description": "다음 해: 실제 분담 이행과 여유시간 변화로 만족·재협의 연결 실제 일정이 1년 안에 끝나면 같은 연도 기록에서 처리하고 다음 연도에는 이행 여부만 재확인한다.",
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-facts-invalid",
            "participant-unavailable",
            "context-changed"
          ],
          "automaticSuccess": false,
          "duePolicy": "next-annual-review-after-recorded-deadline"
        },
        "requires": [],
        "hint": "합의된 시간 배분 · 장면 시간 20분 · 추가 비용 없음 · 승인·거절은 다음 해 현재 여건으로 재확인"
      },
      {
        "id": "b",
        "label": "일부 외부 서비스 검토",
        "text": "실제 접근·비용",
        "personality": {
          "weights": {
            "N": 0.3,
            "P": 0.3
          },
          "rationale": "새 방법 탐색 0.3 · 상황에 맞춘 유연한 조정 0.3",
          "authored": true
        },
        "operation": {
          "id": "scenario.LIFE-044.b",
          "actionId": "scenario.LIFE-044.b",
          "status": "implemented",
          "kind": "record",
          "minutes": 20,
          "cost": 0
        },
        "effect": {
          "description": "실제 접근·비용",
          "applyAutomatically": false
        },
        "followUp": {
          "afterYears": 1,
          "description": "다음 해: 실제 분담 이행과 여유시간 변화로 만족·재협의 연결 실제 일정이 1년 안에 끝나면 같은 연도 기록에서 처리하고 다음 연도에는 이행 여부만 재확인한다.",
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-facts-invalid",
            "participant-unavailable",
            "context-changed"
          ],
          "automaticSuccess": false,
          "duePolicy": "next-annual-review-after-recorded-deadline"
        },
        "requires": [],
        "hint": "실제 접근·비용 · 장면 시간 20분 · 추가 비용 없음"
      },
      {
        "id": "c",
        "label": "현재 역할 유지하되 다른 부담 조정",
        "text": "명시적 합의",
        "personality": {
          "weights": {
            "J": 0.3
          },
          "rationale": "미리 정하는 일정·경계 0.3",
          "authored": true
        },
        "operation": {
          "id": "scenario.LIFE-044.c",
          "actionId": "scenario.LIFE-044.c",
          "status": "implemented",
          "kind": "request",
          "minutes": 20,
          "cost": 0,
          "person": "partner",
          "change": "chores"
        },
        "effect": {
          "description": "명시적 합의",
          "applyAutomatically": false
        },
        "followUp": {
          "afterYears": 1,
          "description": "다음 해: 실제 분담 이행과 여유시간 변화로 만족·재협의 연결 실제 일정이 1년 안에 끝나면 같은 연도 기록에서 처리하고 다음 연도에는 이행 여부만 재확인한다.",
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-facts-invalid",
            "participant-unavailable",
            "context-changed"
          ],
          "automaticSuccess": false,
          "duePolicy": "next-annual-review-after-recorded-deadline"
        },
        "requires": [],
        "hint": "명시적 합의 · 장면 시간 20분 · 추가 비용 없음 · 승인·거절은 다음 해 현재 여건으로 재확인"
      }
    ],
    "cancelWhen": [
      "required-fact-missing-or-expired",
      "source-context-ended",
      "actor-or-counterparty-no-longer-eligible"
    ],
    "guard": "성별로 역할 고정 금지; 합의했다고 가사시간 즉시 소멸 금지",
    "followUp": "다음 해: 실제 분담 이행과 여유시간 변화로 만족·재협의 연결",
    "source": {
      "file": "docs/design/LIFE-EVENTS-100.json",
      "evidenceLevel": "fictional-scenario"
    },
    "stateDependencies": [
      "family",
      "living-existing-relative"
    ],
    "probabilityKind": "game-tuning-not-statistics",
    "scenarioProfile": true,
    "implementationStatus": "implemented-conditional-scenario"
  },
  {
    "id": "LIFE-045",
    "domain": "family",
    "years": [
      1980,
      2026
    ],
    "ages": [
      20,
      65
    ],
    "title": "아이를 데려올 사람이 없다",
    "text": "평소 맡던 사람이 오늘은 등하원을 도울 수 없다고 한다.",
    "eligibility": "실제 자녀·등하원 책임; 양육·근무 일정 충돌",
    "requires": [
      "scenario.LIFE-045.ready"
    ],
    "cooldownYears": 4,
    "choices": [
      {
        "id": "a",
        "label": "근무 조정 문의",
        "text": "승인된 공백",
        "personality": {
          "weights": {
            "E": 0.2,
            "J": 0.4
          },
          "rationale": "직접 교류하는 방식 0.2 · 미리 정하는 일정·경계 0.4",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-045.a",
          "actionId": "scenario.LIFE-045.a",
          "status": "specification-only"
        },
        "effect": {
          "description": "승인된 공백",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "다음 학기: 반복 공백이 확인되면 근무·돌봄 루틴 재설계",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      },
      {
        "id": "b",
        "label": "다른 보호자와 교대",
        "text": "동의 시 부담 이전",
        "personality": {
          "weights": {
            "E": 0.2,
            "F": 0.3
          },
          "rationale": "직접 교류하는 방식 0.2 · 상대의 의사·관계 우선 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-045.b",
          "actionId": "scenario.LIFE-045.b",
          "status": "specification-only"
        },
        "effect": {
          "description": "동의 시 부담 이전",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "다음 학기: 반복 공백이 확인되면 근무·돌봄 루틴 재설계",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      },
      {
        "id": "c",
        "label": "확인된 돌봄 이용",
        "text": "비용·인계 기록",
        "personality": {
          "weights": {
            "J": 0.4
          },
          "rationale": "미리 정하는 일정·경계 0.4",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-045.c",
          "actionId": "scenario.LIFE-045.c",
          "status": "specification-only"
        },
        "effect": {
          "description": "비용·인계 기록",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "다음 학기: 반복 공백이 확인되면 근무·돌봄 루틴 재설계",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      }
    ],
    "guard": "연락 가능한 보호자만 후보; 유아를 혼자 이동시키는 선택 없음",
    "followUp": "다음 학기: 반복 공백이 확인되면 근무·돌봄 루틴 재설계",
    "cancelWhen": [
      "source-context-ended",
      "participant-unavailable",
      "required-fact-expired"
    ],
    "source": {
      "file": "docs/design/LIFE-EVENTS-100.json",
      "evidenceLevel": "fictional-scenario"
    },
    "stateDependencies": [
      "family",
      "living-existing-relative"
    ],
    "probabilityKind": "game-tuning-not-statistics",
    "ready": false,
    "implementationStatus": "deferred-state-or-policy-verification",
    "deferredReason": "원본 조건(실제 자녀·등하원 책임; 양육·근무 일정 충돌)을 만족하는 실제 상태·제도·당사자 입력과 실행 처리가 아직 연결되지 않음. 과거 인물·소유물·진단·공식 통지를 소급 생성하지 않음."
  },
  {
    "id": "LIFE-046",
    "domain": "family",
    "years": [
      1990,
      2026
    ],
    "ages": [
      30,
      80
    ],
    "title": "평일 진료에 함께 가 달라는 말",
    "text": "가족이 혼자 진료 내용을 듣기 어렵다고 도움을 요청했다.",
    "eligibility": "부모 또는 가족에게 실제 진료·동행 요청; 관계·거리 기록",
    "requires": [
      "scenario.LIFE-046.ready"
    ],
    "cooldownYears": 4,
    "choices": [
      {
        "id": "a",
        "label": "동행",
        "text": "이동·휴무시간",
        "personality": {
          "weights": {
            "F": 0.4,
            "J": 0.3
          },
          "rationale": "상대의 의사·관계 우선 0.4 · 미리 정하는 일정·경계 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-046.a",
          "actionId": "scenario.LIFE-046.a",
          "status": "specification-only"
        },
        "effect": {
          "description": "이동·휴무시간",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "진료 뒤: 확인된 필요에 한해 다음 동행·돌봄 예약; 진단은 별도 의료 기록 사용",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      },
      {
        "id": "b",
        "label": "가까운 가족과 분담",
        "text": "동의 시 역할 변경",
        "personality": {
          "weights": {
            "E": 0.2,
            "F": 0.3
          },
          "rationale": "직접 교류하는 방식 0.2 · 상대의 의사·관계 우선 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-046.b",
          "actionId": "scenario.LIFE-046.b",
          "status": "specification-only"
        },
        "effect": {
          "description": "동의 시 역할 변경",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "진료 뒤: 확인된 필요에 한해 다음 동행·돌봄 예약; 진단은 별도 의료 기록 사용",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      },
      {
        "id": "c",
        "label": "가능한 원격 설명 요청",
        "text": "기관·당사자 허용 시 연결",
        "personality": {
          "weights": {
            "N": 0.3,
            "P": 0.3
          },
          "rationale": "새 방법 탐색 0.3 · 상황에 맞춘 유연한 조정 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-046.c",
          "actionId": "scenario.LIFE-046.c",
          "status": "specification-only"
        },
        "effect": {
          "description": "기관·당사자 허용 시 연결",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "진료 뒤: 확인된 필요에 한해 다음 동행·돌봄 예약; 진단은 별도 의료 기록 사용",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      }
    ],
    "guard": "동행 요청만으로 중병·사망 확정 금지; 가족의 동의·실제 접근 확인",
    "followUp": "진료 뒤: 확인된 필요에 한해 다음 동행·돌봄 예약; 진단은 별도 의료 기록 사용",
    "cancelWhen": [
      "source-context-ended",
      "participant-unavailable",
      "required-fact-expired"
    ],
    "source": {
      "file": "docs/design/LIFE-EVENTS-100.json",
      "evidenceLevel": "fictional-scenario"
    },
    "stateDependencies": [
      "family",
      "living-existing-relative"
    ],
    "probabilityKind": "game-tuning-not-statistics",
    "ready": false,
    "implementationStatus": "deferred-state-or-policy-verification",
    "deferredReason": "원본 조건(부모 또는 가족에게 실제 진료·동행 요청; 관계·거리 기록)을 만족하는 실제 상태·제도·당사자 입력과 실행 처리가 아직 연결되지 않음. 과거 인물·소유물·진단·공식 통지를 소급 생성하지 않음."
  },
  {
    "id": "LIFE-047",
    "domain": "family",
    "years": [
      1990,
      2026
    ],
    "ages": [
      25,
      75
    ],
    "title": "이번 달 병원비를 나누는 자리",
    "text": "서로 낼 수 있는 돈과 비울 수 있는 시간이 다르다.",
    "eligibility": "공동 돌봄 대상·실제 비용 있음; 형제자매 분담 논의",
    "requires": [
      "scenario.LIFE-047.ready"
    ],
    "cooldownYears": 4,
    "choices": [
      {
        "id": "a",
        "label": "금전·시간 분담 협의",
        "text": "각자 동의한 몫",
        "personality": {
          "weights": {
            "F": 0.4,
            "J": 0.3
          },
          "rationale": "상대의 의사·관계 우선 0.4 · 미리 정하는 일정·경계 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-047.a",
          "actionId": "scenario.LIFE-047.a",
          "status": "specification-only"
        },
        "effect": {
          "description": "각자 동의한 몫",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "다음 정산: 약속 대비 실제 지급·동행 기록으로 재협의",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      },
      {
        "id": "b",
        "label": "자기 한도 제시",
        "text": "한도 내 부담",
        "personality": {
          "weights": {
            "J": 0.3,
            "T": 0.3
          },
          "rationale": "미리 정하는 일정·경계 0.3 · 명시적인 조건·비용 비교 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-047.b",
          "actionId": "scenario.LIFE-047.b",
          "status": "specification-only"
        },
        "effect": {
          "description": "한도 내 부담",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "다음 정산: 약속 대비 실제 지급·동행 기록으로 재협의",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      },
      {
        "id": "c",
        "label": "공식 지원 조건 문의",
        "text": "확인 전 수입 없음",
        "personality": {
          "weights": {
            "J": 0.4
          },
          "rationale": "미리 정하는 일정·경계 0.4",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-047.c",
          "actionId": "scenario.LIFE-047.c",
          "status": "specification-only"
        },
        "effect": {
          "description": "확인 전 수입 없음",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "다음 정산: 약속 대비 실제 지급·동행 기록으로 재협의",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      }
    ],
    "guard": "가족에게 무한 자산 부여 금지; 소득 낮음을 무관심으로 판정 금지",
    "followUp": "다음 정산: 약속 대비 실제 지급·동행 기록으로 재협의",
    "cancelWhen": [
      "source-context-ended",
      "participant-unavailable",
      "required-fact-expired"
    ],
    "source": {
      "file": "docs/design/LIFE-EVENTS-100.json",
      "evidenceLevel": "fictional-scenario"
    },
    "stateDependencies": [
      "family",
      "living-existing-relative"
    ],
    "probabilityKind": "game-tuning-not-statistics",
    "ready": false,
    "implementationStatus": "deferred-state-or-policy-verification",
    "deferredReason": "원본 조건(공동 돌봄 대상·실제 비용 있음; 형제자매 분담 논의)을 만족하는 실제 상태·제도·당사자 입력과 실행 처리가 아직 연결되지 않음. 과거 인물·소유물·진단·공식 통지를 소급 생성하지 않음."
  },
  {
    "id": "LIFE-048",
    "domain": "family",
    "years": [
      2000,
      2026
    ],
    "ages": [
      20,
      75
    ],
    "title": "따로 살 시간을 정한다면",
    "text": "함께 사는 방식이 맞지 않아 일정 기간 거리를 두자는 말이 나왔다.",
    "eligibility": "현재 파트너; 주거·소득·관계 유지 또는 갈등 기록",
    "requires": [
      "scenario.LIFE-048.ready"
    ],
    "cooldownYears": 4,
    "choices": [
      {
        "id": "a",
        "label": "기간·비용 협의",
        "text": "합의한 별거 계획",
        "personality": {
          "weights": {
            "J": 0.4
          },
          "rationale": "미리 정하는 일정·경계 0.4",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-048.a",
          "actionId": "scenario.LIFE-048.a",
          "status": "specification-only"
        },
        "effect": {
          "description": "합의한 별거 계획",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "약속 기한: 실제 의사·주거·법적 절차에 따라 동거 재개 또는 종료",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      },
      {
        "id": "b",
        "label": "대화·상담 제안",
        "text": "동의 시 예약",
        "personality": {
          "weights": {
            "E": 0.2,
            "F": 0.4
          },
          "rationale": "직접 교류하는 방식 0.2 · 상대의 의사·관계 우선 0.4",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-048.b",
          "actionId": "scenario.LIFE-048.b",
          "status": "specification-only"
        },
        "effect": {
          "description": "동의 시 예약",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "약속 기한: 실제 의사·주거·법적 절차에 따라 동거 재개 또는 종료",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      },
      {
        "id": "c",
        "label": "관계 종료 절차 검토",
        "text": "절차 시작 기록",
        "personality": {
          "weights": {
            "J": 0.4,
            "T": 0.2
          },
          "rationale": "미리 정하는 일정·경계 0.4 · 명시적인 조건·비용 비교 0.2",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-048.c",
          "actionId": "scenario.LIFE-048.c",
          "status": "specification-only"
        },
        "effect": {
          "description": "절차 시작 기록",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "약속 기한: 실제 의사·주거·법적 절차에 따라 동거 재개 또는 종료",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      }
    ],
    "guard": "별거 제안만으로 이혼·재산분할 완료 금지; 상담이 재결합 보장하지 않음",
    "followUp": "약속 기한: 실제 의사·주거·법적 절차에 따라 동거 재개 또는 종료",
    "cancelWhen": [
      "source-context-ended",
      "participant-unavailable",
      "required-fact-expired"
    ],
    "source": {
      "file": "docs/design/LIFE-EVENTS-100.json",
      "evidenceLevel": "fictional-scenario"
    },
    "stateDependencies": [
      "family",
      "living-existing-relative"
    ],
    "probabilityKind": "game-tuning-not-statistics",
    "ready": false,
    "implementationStatus": "deferred-state-or-policy-verification",
    "deferredReason": "원본 조건(현재 파트너; 주거·소득·관계 유지 또는 갈등 기록)을 만족하는 실제 상태·제도·당사자 입력과 실행 처리가 아직 연결되지 않음. 과거 인물·소유물·진단·공식 통지를 소급 생성하지 않음."
  },
  {
    "id": "LIFE-049",
    "domain": "family",
    "years": [
      2000,
      2026
    ],
    "ages": [
      45,
      90
    ],
    "title": "독립하는 자녀에게 어디까지 보탤까",
    "text": "자녀가 첫 거처를 구하며 도움의 범위를 묻는다.",
    "eligibility": "성인 자녀 독립 계획; 본인 여유 현금·주거 상태 있음",
    "requires": [
      "scenario.LIFE-049.ready"
    ],
    "cooldownYears": 4,
    "choices": [
      {
        "id": "a",
        "label": "한도 내 지원",
        "text": "실제 이전액 기록",
        "personality": {
          "weights": {
            "F": 0.4
          },
          "rationale": "상대의 의사·관계 우선 0.4",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-049.a",
          "actionId": "scenario.LIFE-049.a",
          "status": "implemented",
          "kind": "transfer",
          "minutes": 10,
          "cost": 20,
          "person": "child"
        },
        "effect": {
          "description": "실제 이전액 기록",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "이사·상환 시점: 실제 지급·대여 조건과 자녀 동의에 따라 정산",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "실제 이전액 기록 · 장면 시간 10분 · 20만 원 · 이번 선택에서 지출"
      },
      {
        "id": "b",
        "label": "기한부 대여 협의",
        "text": "동의한 가족 채권",
        "personality": {
          "weights": {
            "T": 0.4,
            "J": 0.4
          },
          "rationale": "명시적인 조건·비용 비교 0.4 · 미리 정하는 일정·경계 0.4",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-049.b",
          "actionId": "scenario.LIFE-049.b",
          "status": "implemented",
          "kind": "request",
          "minutes": 20,
          "cost": 0,
          "person": "child"
        },
        "effect": {
          "description": "동의한 가족 채권",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "이사·상환 시점: 실제 지급·대여 조건과 자녀 동의에 따라 정산",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "동의한 가족 채권 · 장면 시간 20분 · 추가 비용 없음 · 승인·거절은 다음 해 현재 여건으로 재확인"
      },
      {
        "id": "c",
        "label": "금전 대신 이사 도움",
        "text": "시간 부담",
        "personality": {
          "weights": {
            "F": 0.3,
            "P": 0.3
          },
          "rationale": "상대의 의사·관계 우선 0.3 · 상황에 맞춘 유연한 조정 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-049.c",
          "actionId": "scenario.LIFE-049.c",
          "status": "implemented",
          "kind": "help",
          "minutes": 60,
          "cost": 0,
          "person": "child"
        },
        "effect": {
          "description": "시간 부담",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "이사·상환 시점: 실제 지급·대여 조건과 자녀 동의에 따라 정산",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "시간 부담 · 장면 시간 60분 · 추가 비용 없음"
      }
    ],
    "guard": "성인 자녀가 없는 생애에는 금지; 도움으로 취업·관계 충성 보장 금지",
    "followUp": "이사·상환 시점: 실제 지급·대여 조건과 자녀 동의에 따라 정산",
    "cancelWhen": [
      "source-context-ended",
      "participant-unavailable",
      "required-fact-expired"
    ],
    "source": {
      "file": "docs/design/LIFE-EVENTS-100.json",
      "evidenceLevel": "fictional-scenario"
    },
    "stateDependencies": [
      "family",
      "living-existing-relative"
    ],
    "probabilityKind": "game-tuning-not-statistics",
    "ready": true,
    "scenarioProfile": true,
    "implementationStatus": "implemented-conditional-scenario"
  },
  {
    "id": "LIFE-050",
    "domain": "family",
    "years": [
      1960,
      2026
    ],
    "ages": [
      8,
      95
    ],
    "title": "남은 사람들이 정리할 것들",
    "text": "장례 뒤에 물건과 연락할 사람, 남은 약속을 정리해야 한다.",
    "eligibility": "실제 가족 사망 기록; 살아 있는 가족과 관계·의례 참여 가능",
    "requires": [
      "scenario.LIFE-050.ready"
    ],
    "cooldownYears": 4,
    "choices": [
      {
        "id": "a",
        "label": "가족과 역할 나누기",
        "text": "동의한 일·시간",
        "personality": {
          "weights": {
            "F": 0.4,
            "J": 0.3
          },
          "rationale": "상대의 의사·관계 우선 0.4 · 미리 정하는 일정·경계 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-050.a",
          "actionId": "scenario.LIFE-050.a",
          "status": "implemented",
          "kind": "request",
          "minutes": 20,
          "cost": 0
        },
        "effect": {
          "description": "동의한 일·시간",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "이후 기념일: 사망한 인물과 공유 기억을 참조한 짧은 회상; 경제 승계는 별도 확정 절차",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "동의한 일·시간 · 장면 시간 20분 · 추가 비용 없음 · 승인·거절은 다음 해 현재 여건으로 재확인"
      },
      {
        "id": "b",
        "label": "자기 기억 남기기",
        "text": "추모 기록",
        "personality": {
          "weights": {
            "I": 0.4,
            "F": 0.2
          },
          "rationale": "혼자 정리할 시간 0.4 · 상대의 의사·관계 우선 0.2",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-050.b",
          "actionId": "scenario.LIFE-050.b",
          "status": "implemented",
          "kind": "record",
          "minutes": 20,
          "cost": 0
        },
        "effect": {
          "description": "추모 기록",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "이후 기념일: 사망한 인물과 공유 기억을 참조한 짧은 회상; 경제 승계는 별도 확정 절차",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "추모 기록 · 장면 시간 20분 · 추가 비용 없음"
      },
      {
        "id": "c",
        "label": "믿는 사람에게 도움 요청",
        "text": "동의 시 동행",
        "personality": {
          "weights": {
            "E": 0.2,
            "F": 0.3
          },
          "rationale": "직접 교류하는 방식 0.2 · 상대의 의사·관계 우선 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-050.c",
          "actionId": "scenario.LIFE-050.c",
          "status": "implemented",
          "kind": "request",
          "minutes": 15,
          "cost": 0
        },
        "effect": {
          "description": "동의 시 동행",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "이후 기념일: 사망한 인물과 공유 기억을 참조한 짧은 회상; 경제 승계는 별도 확정 절차",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "동의 시 동행 · 장면 시간 15분 · 추가 비용 없음 · 승인·거절은 다음 해 현재 여건으로 재확인"
      }
    ],
    "guard": "사망 전 행사 금지; 유산 자동 생성 금지; 어린이는 보호자 지원 장면으로 변형",
    "followUp": "이후 기념일: 사망한 인물과 공유 기억을 참조한 짧은 회상; 경제 승계는 별도 확정 절차",
    "cancelWhen": [
      "source-context-ended",
      "participant-unavailable",
      "required-fact-expired"
    ],
    "source": {
      "file": "docs/design/LIFE-EVENTS-100.json",
      "evidenceLevel": "fictional-scenario"
    },
    "stateDependencies": [
      "family",
      "living-existing-relative"
    ],
    "probabilityKind": "game-tuning-not-statistics",
    "ready": true,
    "scenarioProfile": true,
    "implementationStatus": "implemented-conditional-scenario"
  },
  {
    "id": "LIFE-051",
    "domain": "relationships",
    "years": [
      1960,
      1999
    ],
    "ages": [
      12,
      75
    ],
    "title": "떠나는 친구의 주소",
    "text": "친구가 떠나기 전 새 연락처를 적어 준다.",
    "eligibility": "실제 친구가 타지로 이동 확정; 서신·전화 등 접근 가능",
    "requires": [
      "scenario.LIFE-051.ready"
    ],
    "cooldownYears": 4,
    "choices": [
      {
        "id": "a",
        "label": "편지 약속",
        "text": "연락 루틴",
        "personality": {
          "weights": {
            "F": 0.4,
            "J": 0.3
          },
          "rationale": "상대의 의사·관계 우선 0.4 · 미리 정하는 일정·경계 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-051.a",
          "actionId": "scenario.LIFE-051.a",
          "status": "implemented",
          "kind": "rule",
          "minutes": 10,
          "cost": 0,
          "record": "letter-promise"
        },
        "effect": {
          "description": "연락 루틴",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "다음 해: 실제 답장·연락 이행 때만 관계 접촉 갱신; 주소 변경 시 재확인",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "연락 루틴 · 장면 시간 10분 · 추가 비용 없음"
      },
      {
        "id": "b",
        "label": "형편에 맞춰 전화",
        "text": "실제 연락비",
        "personality": {
          "weights": {
            "E": 0.2,
            "F": 0.3
          },
          "rationale": "직접 교류하는 방식 0.2 · 상대의 의사·관계 우선 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-051.b",
          "actionId": "scenario.LIFE-051.b",
          "status": "implemented",
          "kind": "expense",
          "minutes": 15,
          "cost": 0.2,
          "record": "phone-contact"
        },
        "effect": {
          "description": "실제 연락비",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "다음 해: 실제 답장·연락 이행 때만 관계 접촉 갱신; 주소 변경 시 재확인",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "실제 연락비 · 장면 시간 15분 · 0.2만 원 · 이번 선택에서 지출"
      },
      {
        "id": "c",
        "label": "작별 인사만",
        "text": "공유 기억 저장",
        "personality": {
          "weights": {
            "I": 0.3,
            "P": 0.3
          },
          "rationale": "혼자 정리할 시간 0.3 · 상황에 맞춘 유연한 조정 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-051.c",
          "actionId": "scenario.LIFE-051.c",
          "status": "implemented",
          "kind": "record",
          "minutes": 10,
          "cost": 0
        },
        "effect": {
          "description": "공유 기억 저장",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "다음 해: 실제 답장·연락 이행 때만 관계 접촉 갱신; 주소 변경 시 재확인",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "공유 기억 저장 · 장면 시간 10분 · 추가 비용 없음"
      }
    ],
    "guard": "우표·전화 접근과 시대 확인; 연락 줄었다고 즉시 적대 전환 금지",
    "followUp": "다음 해: 실제 답장·연락 이행 때만 관계 접촉 갱신; 주소 변경 시 재확인",
    "cancelWhen": [
      "source-context-ended",
      "participant-unavailable",
      "required-fact-expired"
    ],
    "source": {
      "file": "docs/design/LIFE-EVENTS-100.json",
      "evidenceLevel": "fictional-scenario"
    },
    "stateDependencies": [
      "dailyLife.people",
      "actual-contact-and-shared-history"
    ],
    "probabilityKind": "game-tuning-not-statistics",
    "ready": true,
    "scenarioProfile": true,
    "implementationStatus": "implemented-conditional-scenario"
  },
  {
    "id": "LIFE-052",
    "domain": "relationships",
    "years": [
      1970,
      2026
    ],
    "ages": [
      18,
      80
    ],
    "title": "모임값을 맞추기 어려운 달",
    "text": "이번 모임 비용이 내 재량 예산을 넘는다.",
    "ready": false,
    "requires": [
      "social.existing-group",
      "social.confirmed-gathering",
      "budget.gathering-pressure"
    ],
    "eligibility": "친구 모임 가입·회비 또는 식사 약속; 본인 예산 압박",
    "choices": [
      {
        "id": "a",
        "label": "저렴한 대안 제안",
        "text": "합의 시 비용 조정",
        "personality": {
          "weights": {
            "E": 0.2,
            "N": 0.3
          },
          "rationale": "직접 교류하는 방식 0.2 · 새 방법 탐색 0.3",
          "authored": true
        },
        "operation": {
          "id": "propose-affordable-gathering",
          "status": "specification-only",
          "requiresConsent": true,
          "ledger": "only-confirmed-once",
          "charge": "verified-amount-only",
          "result": "confirmed-response-only",
          "actionId": "propose-affordable-gathering",
          "requiredInputs": [
            "confirmed-source-facts",
            "current-context",
            "unique-operation-id",
            "effective-year"
          ]
        },
        "effect": {
          "description": "합의 시 비용 조정",
          "applyAutomatically": false
        },
        "followUp": {
          "afterYears": 1,
          "description": "다음 모임: 합의된 비용과 실제 참석 이력에 따라 루틴 갱신 실제 일정이 1년 안에 끝나면 같은 연도 기록에서 처리하고 다음 연도에는 이행 여부만 재확인한다.",
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-facts-invalid",
            "participant-unavailable",
            "context-changed"
          ],
          "automaticSuccess": false,
          "duePolicy": "next-annual-review-after-recorded-deadline"
        },
        "requires": [
          "social.group-contact-channel"
        ]
      },
      {
        "id": "b",
        "label": "이번만 빠지고 다른 약속",
        "text": "연락 유지",
        "personality": {
          "weights": {
            "P": 0.4,
            "F": 0.2
          },
          "rationale": "상황에 맞춘 유연한 조정 0.4 · 상대의 의사·관계 우선 0.2",
          "authored": true
        },
        "operation": {
          "id": "decline-and-propose-another-meeting",
          "status": "specification-only",
          "requiresConsent": false,
          "ledger": "only-confirmed-once",
          "charge": "verified-amount-only",
          "result": "confirmed-response-only",
          "actionId": "decline-and-propose-another-meeting",
          "requiredInputs": [
            "confirmed-source-facts",
            "current-context",
            "unique-operation-id",
            "effective-year"
          ]
        },
        "effect": {
          "description": "연락 유지",
          "applyAutomatically": false
        },
        "followUp": {
          "afterYears": 1,
          "description": "다음 모임: 합의된 비용과 실제 참석 이력에 따라 루틴 갱신 실제 일정이 1년 안에 끝나면 같은 연도 기록에서 처리하고 다음 연도에는 이행 여부만 재확인한다.",
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-facts-invalid",
            "participant-unavailable",
            "context-changed"
          ],
          "automaticSuccess": false,
          "duePolicy": "next-annual-review-after-recorded-deadline"
        },
        "requires": [
          "social.alternate-meeting-proposal"
        ]
      },
      {
        "id": "c",
        "label": "예산 안에서 참석",
        "text": "실제 지출",
        "personality": {
          "weights": {
            "E": 0.3,
            "P": 0.3
          },
          "rationale": "직접 교류하는 방식 0.3 · 상황에 맞춘 유연한 조정 0.3",
          "authored": true
        },
        "operation": {
          "id": "attend-within-budget",
          "status": "specification-only",
          "requiresConsent": false,
          "ledger": "only-confirmed-once",
          "charge": "verified-amount-only",
          "result": "confirmed-response-only",
          "actionId": "attend-within-budget",
          "requiredInputs": [
            "confirmed-source-facts",
            "current-context",
            "unique-operation-id",
            "effective-year"
          ]
        },
        "effect": {
          "description": "실제 지출",
          "applyAutomatically": false
        },
        "followUp": {
          "afterYears": 1,
          "description": "다음 모임: 합의된 비용과 실제 참석 이력에 따라 루틴 갱신 실제 일정이 1년 안에 끝나면 같은 연도 기록에서 처리하고 다음 연도에는 이행 여부만 재확인한다.",
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-facts-invalid",
            "participant-unavailable",
            "context-changed"
          ],
          "automaticSuccess": false,
          "duePolicy": "next-annual-review-after-recorded-deadline"
        },
        "requires": [
          "social.within-budget-attendance-option"
        ]
      }
    ],
    "cancelWhen": [
      "required-fact-missing-or-expired",
      "source-context-ended",
      "actor-or-counterparty-no-longer-eligible"
    ],
    "guard": "가난을 수치·친구 배척으로 자동 서술 금지; 대안은 상대 동의 필요",
    "followUp": "다음 모임: 합의된 비용과 실제 참석 이력에 따라 루틴 갱신",
    "source": {
      "file": "docs/design/LIFE-EVENTS-100.json",
      "evidenceLevel": "fictional-scenario"
    },
    "stateDependencies": [
      "dailyLife.people",
      "actual-contact-and-shared-history"
    ],
    "probabilityKind": "game-tuning-not-statistics",
    "implementationStatus": "deferred-state-or-policy-verification",
    "deferredReason": "원본 조건(친구 모임 가입·회비 또는 식사 약속; 본인 예산 압박)을 만족하는 실제 상태·제도·당사자 입력과 실행 처리가 아직 연결되지 않음. 과거 인물·소유물·진단·공식 통지를 소급 생성하지 않음."
  },
  {
    "id": "LIFE-053",
    "domain": "relationships",
    "years": [
      1980,
      2026
    ],
    "ages": [
      18,
      85
    ],
    "title": "친구가 돈을 빌려 달라고 했다",
    "text": "급한 사정이라고 하지만 언제 갚을지는 아직 분명하지 않다.",
    "eligibility": "친구와 돈 대여 요청; 본인 여유자금·상환 조건 있음",
    "requires": [
      "scenario.LIFE-053.ready"
    ],
    "cooldownYears": 4,
    "choices": [
      {
        "id": "a",
        "label": "상환 조건부터 묻기",
        "text": "합의 대기",
        "personality": {
          "weights": {
            "T": 0.4,
            "J": 0.4
          },
          "rationale": "명시적인 조건·비용 비교 0.4 · 미리 정하는 일정·경계 0.4",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-053.a",
          "actionId": "scenario.LIFE-053.a",
          "status": "implemented",
          "kind": "request",
          "minutes": 15,
          "cost": 0
        },
        "effect": {
          "description": "합의 대기",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "상환기: 실제 지급·연장 합의·미상환을 구분해 신뢰 기록",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "합의 대기 · 장면 시간 15분 · 추가 비용 없음 · 승인·거절은 다음 해 현재 여건으로 재확인"
      },
      {
        "id": "b",
        "label": "감당 가능한 범위 대여",
        "text": "현금·채권 생성",
        "personality": {
          "weights": {
            "F": 0.4,
            "P": 0.2
          },
          "rationale": "상대의 의사·관계 우선 0.4 · 상황에 맞춘 유연한 조정 0.2",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-053.b",
          "actionId": "scenario.LIFE-053.b",
          "status": "implemented",
          "kind": "loan",
          "minutes": 15,
          "cost": 5,
          "record": "personal-loan"
        },
        "effect": {
          "description": "현금·채권 생성",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "상환기: 실제 지급·연장 합의·미상환을 구분해 신뢰 기록",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "현금·채권 생성 · 장면 시간 15분 · 5만 원 · 이번 선택에서 지출"
      },
      {
        "id": "c",
        "label": "대여 거절",
        "text": "현금 유지",
        "personality": {
          "weights": {
            "J": 0.3,
            "T": 0.3
          },
          "rationale": "미리 정하는 일정·경계 0.3 · 명시적인 조건·비용 비교 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-053.c",
          "actionId": "scenario.LIFE-053.c",
          "status": "implemented",
          "kind": "hold",
          "minutes": 0,
          "cost": 0
        },
        "effect": {
          "description": "현금 유지",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "상환기: 실제 지급·연장 합의·미상환을 구분해 신뢰 기록",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "현금 유지 · 추가 시간 없음 · 추가 비용 없음"
      }
    ],
    "guard": "채권을 자산과 현금으로 이중 합산 금지; 거절만으로 친구 삭제 금지",
    "followUp": "상환기: 실제 지급·연장 합의·미상환을 구분해 신뢰 기록",
    "cancelWhen": [
      "source-context-ended",
      "participant-unavailable",
      "required-fact-expired"
    ],
    "source": {
      "file": "docs/design/LIFE-EVENTS-100.json",
      "evidenceLevel": "fictional-scenario"
    },
    "stateDependencies": [
      "dailyLife.people",
      "actual-contact-and-shared-history"
    ],
    "probabilityKind": "game-tuning-not-statistics",
    "ready": true,
    "scenarioProfile": true,
    "implementationStatus": "implemented-conditional-scenario"
  },
  {
    "id": "LIFE-054",
    "domain": "relationships",
    "years": [
      1990,
      2026
    ],
    "ages": [
      18,
      75
    ],
    "title": "한 사람의 이동이 둘의 문제가 될 때",
    "text": "파트너가 다른 지역 기회를 고민하며 앞으로의 생활을 묻는다.",
    "eligibility": "연애 관계; 두 사람의 직장·거주 이동 제안 기록",
    "requires": [
      "scenario.LIFE-054.ready"
    ],
    "cooldownYears": 4,
    "choices": [
      {
        "id": "a",
        "label": "장거리 일정 협의",
        "text": "방문 비용·연락 약속",
        "personality": {
          "weights": {
            "F": 0.3,
            "J": 0.3
          },
          "rationale": "상대의 의사·관계 우선 0.3 · 미리 정하는 일정·경계 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-054.a",
          "actionId": "scenario.LIFE-054.a",
          "status": "specification-only"
        },
        "effect": {
          "description": "방문 비용·연락 약속",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "이동 시점: 실제 수락·이주한 상태에서 관계 유지 방식 갱신",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      },
      {
        "id": "b",
        "label": "함께 이주 검토",
        "text": "각자 일·집 후보",
        "personality": {
          "weights": {
            "N": 0.3,
            "P": 0.3
          },
          "rationale": "새 방법 탐색 0.3 · 상황에 맞춘 유연한 조정 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-054.b",
          "actionId": "scenario.LIFE-054.b",
          "status": "specification-only"
        },
        "effect": {
          "description": "각자 일·집 후보",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "이동 시점: 실제 수락·이주한 상태에서 관계 유지 방식 갱신",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      },
      {
        "id": "c",
        "label": "각자 계획 우선",
        "text": "상대 의사 확인",
        "personality": {
          "weights": {
            "I": 0.3,
            "P": 0.3
          },
          "rationale": "혼자 정리할 시간 0.3 · 상황에 맞춘 유연한 조정 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-054.c",
          "actionId": "scenario.LIFE-054.c",
          "status": "specification-only"
        },
        "effect": {
          "description": "상대 의사 확인",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "이동 시점: 실제 수락·이주한 상태에서 관계 유지 방식 갱신",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      }
    ],
    "guard": "동반 이주로 주인공 자동 취업 금지; 파트너 의사 생략 금지",
    "followUp": "이동 시점: 실제 수락·이주한 상태에서 관계 유지 방식 갱신",
    "cancelWhen": [
      "source-context-ended",
      "participant-unavailable",
      "required-fact-expired"
    ],
    "source": {
      "file": "docs/design/LIFE-EVENTS-100.json",
      "evidenceLevel": "fictional-scenario"
    },
    "stateDependencies": [
      "dailyLife.people",
      "actual-contact-and-shared-history"
    ],
    "probabilityKind": "game-tuning-not-statistics",
    "ready": false,
    "implementationStatus": "deferred-state-or-policy-verification",
    "deferredReason": "원본 조건(연애 관계; 두 사람의 직장·거주 이동 제안 기록)을 만족하는 실제 상태·제도·당사자 입력과 실행 처리가 아직 연결되지 않음. 과거 인물·소유물·진단·공식 통지를 소급 생성하지 않음."
  },
  {
    "id": "LIFE-055",
    "domain": "relationships",
    "years": [
      1990,
      2026
    ],
    "ages": [
      18,
      85
    ],
    "title": "기쁜 초대와 빠듯한 통장",
    "text": "가까운 사람이 결혼식이나 기념 행사에 초대했다.",
    "eligibility": "초대한 실제 행사; 축하 비용과 자기 필수지출 충돌",
    "requires": [
      "scenario.LIFE-055.ready"
    ],
    "cooldownYears": 4,
    "choices": [
      {
        "id": "a",
        "label": "한도 안에서 축하",
        "text": "실제 지출",
        "personality": {
          "weights": {
            "F": 0.3,
            "J": 0.3
          },
          "rationale": "상대의 의사·관계 우선 0.3 · 미리 정하는 일정·경계 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-055.a",
          "actionId": "scenario.LIFE-055.a",
          "status": "implemented",
          "kind": "expense",
          "minutes": 15,
          "cost": 2,
          "record": "celebration"
        },
        "effect": {
          "description": "실제 지출",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "행사 뒤: 실제 만남·연락을 기억에 반영; 선물액으로 친밀도 계산하지 않음",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "실제 지출 · 장면 시간 15분 · 2만 원 · 이번 선택에서 지출"
      },
      {
        "id": "b",
        "label": "편지·도움으로 대신",
        "text": "동의한 시간",
        "personality": {
          "weights": {
            "F": 0.4,
            "P": 0.2
          },
          "rationale": "상대의 의사·관계 우선 0.4 · 상황에 맞춘 유연한 조정 0.2",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-055.b",
          "actionId": "scenario.LIFE-055.b",
          "status": "implemented",
          "kind": "request",
          "minutes": 30,
          "cost": 0
        },
        "effect": {
          "description": "동의한 시간",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "행사 뒤: 실제 만남·연락을 기억에 반영; 선물액으로 친밀도 계산하지 않음",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "동의한 시간 · 장면 시간 30분 · 추가 비용 없음 · 승인·거절은 다음 해 현재 여건으로 재확인"
      },
      {
        "id": "c",
        "label": "참석 어려움 전달",
        "text": "응답 기록",
        "personality": {
          "weights": {
            "I": 0.3,
            "P": 0.3
          },
          "rationale": "혼자 정리할 시간 0.3 · 상황에 맞춘 유연한 조정 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-055.c",
          "actionId": "scenario.LIFE-055.c",
          "status": "implemented",
          "kind": "record",
          "minutes": 10,
          "cost": 0
        },
        "effect": {
          "description": "응답 기록",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "행사 뒤: 실제 만남·연락을 기억에 반영; 선물액으로 친밀도 계산하지 않음",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "응답 기록 · 장면 시간 10분 · 추가 비용 없음"
      }
    ],
    "guard": "행사와 인물 상태 확인; 축의금 지급을 미래 수입 확정으로 처리 금지",
    "followUp": "행사 뒤: 실제 만남·연락을 기억에 반영; 선물액으로 친밀도 계산하지 않음",
    "cancelWhen": [
      "source-context-ended",
      "participant-unavailable",
      "required-fact-expired"
    ],
    "source": {
      "file": "docs/design/LIFE-EVENTS-100.json",
      "evidenceLevel": "fictional-scenario"
    },
    "stateDependencies": [
      "dailyLife.people",
      "actual-contact-and-shared-history"
    ],
    "probabilityKind": "game-tuning-not-statistics",
    "ready": true,
    "scenarioProfile": true,
    "implementationStatus": "implemented-conditional-scenario"
  },
  {
    "id": "LIFE-056",
    "domain": "relationships",
    "years": [
      2000,
      2026
    ],
    "ages": [
      15,
      85
    ],
    "title": "설명을 듣지 못한 채 멀어졌다",
    "text": "서운했던 일 이후 연락이 뜸해졌다.",
    "eligibility": "기존 인물 간 약속 위반 또는 오해 사건 기록",
    "requires": [
      "scenario.LIFE-056.ready"
    ],
    "cooldownYears": 4,
    "choices": [
      {
        "id": "a",
        "label": "자기 경험 말하기",
        "text": "대화 요청",
        "personality": {
          "weights": {
            "E": 0.2,
            "F": 0.4
          },
          "rationale": "직접 교류하는 방식 0.2 · 상대의 의사·관계 우선 0.4",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-056.a",
          "actionId": "scenario.LIFE-056.a",
          "status": "implemented",
          "kind": "request",
          "minutes": 20,
          "cost": 0
        },
        "effect": {
          "description": "대화 요청",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "다음 접촉: 실제 응답·사과·약속 이행에 따라 관계 변화",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "대화 요청 · 장면 시간 20분 · 추가 비용 없음 · 승인·거절은 다음 해 현재 여건으로 재확인"
      },
      {
        "id": "b",
        "label": "상대 설명 기다리기",
        "text": "답변 시 후속",
        "personality": {
          "weights": {
            "P": 0.3,
            "F": 0.3
          },
          "rationale": "상황에 맞춘 유연한 조정 0.3 · 상대의 의사·관계 우선 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-056.b",
          "actionId": "scenario.LIFE-056.b",
          "status": "implemented",
          "kind": "wait",
          "minutes": 0,
          "cost": 0
        },
        "effect": {
          "description": "답변 시 후속",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "다음 접촉: 실제 응답·사과·약속 이행에 따라 관계 변화",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "답변 시 후속 · 추가 시간 없음 · 추가 비용 없음"
      },
      {
        "id": "c",
        "label": "거리 유지",
        "text": "접촉 빈도 조정",
        "personality": {
          "weights": {
            "I": 0.4
          },
          "rationale": "혼자 정리할 시간 0.4",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-056.c",
          "actionId": "scenario.LIFE-056.c",
          "status": "implemented",
          "kind": "rule",
          "minutes": 5,
          "cost": 0,
          "record": "contact-boundary"
        },
        "effect": {
          "description": "접촉 빈도 조정",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "다음 접촉: 실제 응답·사과·약속 이행에 따라 관계 변화",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "접촉 빈도 조정 · 장면 시간 5분 · 추가 비용 없음"
      }
    ],
    "guard": "오해 내용은 기존 사건 ID 인용; 대화만으로 완전 화해 금지",
    "followUp": "다음 접촉: 실제 응답·사과·약속 이행에 따라 관계 변화",
    "cancelWhen": [
      "source-context-ended",
      "participant-unavailable",
      "required-fact-expired"
    ],
    "source": {
      "file": "docs/design/LIFE-EVENTS-100.json",
      "evidenceLevel": "fictional-scenario"
    },
    "stateDependencies": [
      "dailyLife.people",
      "actual-contact-and-shared-history"
    ],
    "probabilityKind": "game-tuning-not-statistics",
    "ready": true,
    "scenarioProfile": true,
    "implementationStatus": "implemented-conditional-scenario"
  },
  {
    "id": "LIFE-057",
    "domain": "relationships",
    "years": [
      2005,
      2026
    ],
    "ages": [
      18,
      85
    ],
    "title": "모임의 대화가 날카로워졌다",
    "text": "같은 소식을 두고 서로 다른 경험을 이야기하다 말이 겹쳤다.",
    "eligibility": "모임 내 실제 정치·사회 의견 충돌; 당사자 발언 기록",
    "requires": [
      "scenario.LIFE-057.ready"
    ],
    "cooldownYears": 4,
    "choices": [
      {
        "id": "a",
        "label": "경험·근거를 나눠 말하기",
        "text": "발언 기록",
        "personality": {
          "weights": {
            "E": 0.2,
            "T": 0.3
          },
          "rationale": "직접 교류하는 방식 0.2 · 명시적인 조건·비용 비교 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-057.a",
          "actionId": "scenario.LIFE-057.a",
          "status": "implemented",
          "kind": "record",
          "minutes": 20,
          "cost": 0
        },
        "effect": {
          "description": "발언 기록",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "다음 모임: 경계 존중 여부로 신뢰·참석 의향 갱신",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "발언 기록 · 장면 시간 20분 · 추가 비용 없음"
      },
      {
        "id": "b",
        "label": "대화 범위 합의",
        "text": "동의한 주제 경계",
        "personality": {
          "weights": {
            "F": 0.3,
            "J": 0.3
          },
          "rationale": "상대의 의사·관계 우선 0.3 · 미리 정하는 일정·경계 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-057.b",
          "actionId": "scenario.LIFE-057.b",
          "status": "implemented",
          "kind": "request",
          "minutes": 15,
          "cost": 0
        },
        "effect": {
          "description": "동의한 주제 경계",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "다음 모임: 경계 존중 여부로 신뢰·참석 의향 갱신",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "동의한 주제 경계 · 장면 시간 15분 · 추가 비용 없음 · 승인·거절은 다음 해 현재 여건으로 재확인"
      },
      {
        "id": "c",
        "label": "자리 벗어나기",
        "text": "접촉 종료",
        "personality": {
          "weights": {
            "I": 0.3,
            "P": 0.3
          },
          "rationale": "혼자 정리할 시간 0.3 · 상황에 맞춘 유연한 조정 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-057.c",
          "actionId": "scenario.LIFE-057.c",
          "status": "implemented",
          "kind": "rule",
          "minutes": 5,
          "cost": 0,
          "record": "discussion-ended"
        },
        "effect": {
          "description": "접촉 종료",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "다음 모임: 경계 존중 여부로 신뢰·참석 의향 갱신",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "접촉 종료 · 장면 시간 5분 · 추가 비용 없음"
      }
    ],
    "guard": "의견을 직업·소득·MBTI에서 자동 추론 금지; 특정 입장 선택에 도덕 보너스 금지",
    "followUp": "다음 모임: 경계 존중 여부로 신뢰·참석 의향 갱신",
    "cancelWhen": [
      "source-context-ended",
      "participant-unavailable",
      "required-fact-expired"
    ],
    "source": {
      "file": "docs/design/LIFE-EVENTS-100.json",
      "evidenceLevel": "fictional-scenario"
    },
    "stateDependencies": [
      "dailyLife.people",
      "actual-contact-and-shared-history"
    ],
    "probabilityKind": "game-tuning-not-statistics",
    "ready": true,
    "scenarioProfile": true,
    "implementationStatus": "implemented-conditional-scenario"
  },
  {
    "id": "LIFE-058",
    "domain": "relationships",
    "years": [
      2010,
      2026
    ],
    "ages": [
      18,
      85
    ],
    "title": "오래된 이름이 다시 뜬다",
    "text": "예전에 함께 시간을 보냈던 사람이 안부를 물었다.",
    "eligibility": "기존 연락처·실제 과거 약속; 해당 인물 재접촉 의사 있음",
    "requires": [
      "scenario.LIFE-058.ready"
    ],
    "cooldownYears": 4,
    "choices": [
      {
        "id": "a",
        "label": "답장하고 짧게 만나기",
        "text": "시간·비용 약속",
        "personality": {
          "weights": {
            "E": 0.3,
            "P": 0.3
          },
          "rationale": "직접 교류하는 방식 0.3 · 상황에 맞춘 유연한 조정 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-058.a",
          "actionId": "scenario.LIFE-058.a",
          "status": "implemented",
          "kind": "request",
          "minutes": 20,
          "cost": 1
        },
        "effect": {
          "description": "시간·비용 약속",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "만남 시점: 이전 공유 기억과 현재 상황을 함께 인용; 실제 약속 이행만 반영",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "시간·비용 약속 · 장면 시간 20분 · 1만 원 · 승인 뒤 실행 때만 지출 · 승인·거절은 다음 해 현재 여건으로 재확인"
      },
      {
        "id": "b",
        "label": "연락만 이어가기",
        "text": "접촉 갱신",
        "personality": {
          "weights": {
            "I": 0.2,
            "F": 0.3
          },
          "rationale": "혼자 정리할 시간 0.2 · 상대의 의사·관계 우선 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-058.b",
          "actionId": "scenario.LIFE-058.b",
          "status": "implemented",
          "kind": "rule",
          "minutes": 10,
          "cost": 0,
          "record": "contact-renewed"
        },
        "effect": {
          "description": "접촉 갱신",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "만남 시점: 이전 공유 기억과 현재 상황을 함께 인용; 실제 약속 이행만 반영",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "접촉 갱신 · 장면 시간 10분 · 추가 비용 없음"
      },
      {
        "id": "c",
        "label": "지금은 어렵다고 알리기",
        "text": "응답 기록",
        "personality": {
          "weights": {
            "I": 0.3,
            "J": 0.2
          },
          "rationale": "혼자 정리할 시간 0.3 · 미리 정하는 일정·경계 0.2",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-058.c",
          "actionId": "scenario.LIFE-058.c",
          "status": "implemented",
          "kind": "record",
          "minutes": 5,
          "cost": 0
        },
        "effect": {
          "description": "응답 기록",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "만남 시점: 이전 공유 기억과 현재 상황을 함께 인용; 실제 약속 이행만 반영",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "응답 기록 · 장면 시간 5분 · 추가 비용 없음"
      }
    ],
    "guard": "새 인물을 오랜 친구로 소급 생성 금지; 재회로 일자리·연애 자동 생성 금지",
    "followUp": "만남 시점: 이전 공유 기억과 현재 상황을 함께 인용; 실제 약속 이행만 반영",
    "cancelWhen": [
      "source-context-ended",
      "participant-unavailable",
      "required-fact-expired"
    ],
    "source": {
      "file": "docs/design/LIFE-EVENTS-100.json",
      "evidenceLevel": "fictional-scenario"
    },
    "stateDependencies": [
      "dailyLife.people",
      "actual-contact-and-shared-history"
    ],
    "probabilityKind": "game-tuning-not-statistics",
    "ready": true,
    "scenarioProfile": true,
    "implementationStatus": "implemented-conditional-scenario"
  },
  {
    "id": "LIFE-059",
    "domain": "relationships",
    "years": [
      2010,
      2026
    ],
    "ages": [
      18,
      80
    ],
    "title": "처음 가는 모임의 빈자리",
    "text": "자주 마주치던 사람이 식사 자리에 함께 오라고 한다.",
    "eligibility": "직장·취미 모임의 실제 새 인물; 초대와 본인 시간 가능",
    "requires": [
      "scenario.LIFE-059.ready"
    ],
    "cooldownYears": 4,
    "choices": [
      {
        "id": "a",
        "label": "짧게 참석",
        "text": "소개·접촉 기록",
        "personality": {
          "weights": {
            "E": 0.5
          },
          "rationale": "직접 교류하는 방식 0.5",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-059.a",
          "actionId": "scenario.LIFE-059.a",
          "status": "implemented",
          "kind": "introduction",
          "minutes": 20,
          "cost": 0
        },
        "effect": {
          "description": "소개·접촉 기록",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "이후 반복 접촉 때만 지인→친구 관계 형성 후보",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "소개·접촉 기록 · 장면 시간 20분 · 추가 비용 없음"
      },
      {
        "id": "b",
        "label": "다음 기회 제안",
        "text": "약속 대기",
        "personality": {
          "weights": {
            "P": 0.3,
            "F": 0.2
          },
          "rationale": "상황에 맞춘 유연한 조정 0.3 · 상대의 의사·관계 우선 0.2",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-059.b",
          "actionId": "scenario.LIFE-059.b",
          "status": "implemented",
          "kind": "request",
          "minutes": 15,
          "cost": 0
        },
        "effect": {
          "description": "약속 대기",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "이후 반복 접촉 때만 지인→친구 관계 형성 후보",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "약속 대기 · 장면 시간 15분 · 추가 비용 없음 · 승인·거절은 다음 해 현재 여건으로 재확인"
      },
      {
        "id": "c",
        "label": "사양",
        "text": "기존 생활 유지",
        "personality": {
          "weights": {
            "I": 0.4
          },
          "rationale": "혼자 정리할 시간 0.4",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-059.c",
          "actionId": "scenario.LIFE-059.c",
          "status": "implemented",
          "kind": "hold",
          "minutes": 0,
          "cost": 0
        },
        "effect": {
          "description": "기존 생활 유지",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "이후 반복 접촉 때만 지인→친구 관계 형성 후보",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "기존 생활 유지 · 추가 시간 없음 · 추가 비용 없음"
      }
    ],
    "guard": "한 번 참석으로 절친 생성 금지; 성격 유형에 따라 거절 강제 금지",
    "followUp": "이후 반복 접촉 때만 지인→친구 관계 형성 후보",
    "cancelWhen": [
      "source-context-ended",
      "participant-unavailable",
      "required-fact-expired"
    ],
    "source": {
      "file": "docs/design/LIFE-EVENTS-100.json",
      "evidenceLevel": "fictional-scenario"
    },
    "stateDependencies": [
      "dailyLife.people",
      "actual-contact-and-shared-history"
    ],
    "probabilityKind": "game-tuning-not-statistics",
    "ready": true,
    "scenarioProfile": true,
    "implementationStatus": "implemented-conditional-scenario"
  },
  {
    "id": "LIFE-060",
    "domain": "relationships",
    "years": [
      1960,
      2026
    ],
    "ages": [
      18,
      90
    ],
    "title": "돌려줄 물건이 남았다",
    "text": "관계는 끝났지만 서로의 물건과 정리할 약속이 남아 있다.",
    "eligibility": "실제 관계 종료 또는 이별 뒤 공동 물건·약속 존재",
    "requires": [
      "scenario.LIFE-060.ready"
    ],
    "cooldownYears": 4,
    "choices": [
      {
        "id": "a",
        "label": "연락해 반환 방법 합의",
        "text": "인계 예약",
        "personality": {
          "weights": {
            "J": 0.4,
            "F": 0.3
          },
          "rationale": "미리 정하는 일정·경계 0.4 · 상대의 의사·관계 우선 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-060.a",
          "actionId": "scenario.LIFE-060.a",
          "status": "specification-only"
        },
        "effect": {
          "description": "인계 예약",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "인계 뒤: 물건 소유·공동 비용 정산; 재결합은 별도 상호 의사 필요",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      },
      {
        "id": "b",
        "label": "허용된 제삼자 통해 전달",
        "text": "동의 확인",
        "personality": {
          "weights": {
            "E": 0.2,
            "F": 0.3
          },
          "rationale": "직접 교류하는 방식 0.2 · 상대의 의사·관계 우선 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-060.b",
          "actionId": "scenario.LIFE-060.b",
          "status": "specification-only"
        },
        "effect": {
          "description": "동의 확인",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "인계 뒤: 물건 소유·공동 비용 정산; 재결합은 별도 상호 의사 필요",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      },
      {
        "id": "c",
        "label": "정리 시점 미루기",
        "text": "미완료 의무 유지",
        "personality": {
          "weights": {
            "P": 0.3
          },
          "rationale": "상황에 맞춘 유연한 조정 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-060.c",
          "actionId": "scenario.LIFE-060.c",
          "status": "specification-only"
        },
        "effect": {
          "description": "미완료 의무 유지",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "인계 뒤: 물건 소유·공동 비용 정산; 재결합은 별도 상호 의사 필요",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      }
    ],
    "guard": "원치 않는 방문·접촉을 강요하는 선택 없음; 물건 반환을 화해로 간주 금지",
    "followUp": "인계 뒤: 물건 소유·공동 비용 정산; 재결합은 별도 상호 의사 필요",
    "cancelWhen": [
      "source-context-ended",
      "participant-unavailable",
      "required-fact-expired"
    ],
    "source": {
      "file": "docs/design/LIFE-EVENTS-100.json",
      "evidenceLevel": "fictional-scenario"
    },
    "stateDependencies": [
      "dailyLife.people",
      "actual-contact-and-shared-history"
    ],
    "probabilityKind": "game-tuning-not-statistics",
    "ready": false,
    "implementationStatus": "deferred-state-or-policy-verification",
    "deferredReason": "원본 조건(실제 관계 종료 또는 이별 뒤 공동 물건·약속 존재)을 만족하는 실제 상태·제도·당사자 입력과 실행 처리가 아직 연결되지 않음. 과거 인물·소유물·진단·공식 통지를 소급 생성하지 않음."
  },
  {
    "id": "LIFE-061",
    "domain": "health",
    "years": [
      1960,
      2026
    ],
    "ages": [
      10,
      90
    ],
    "title": "계속 미뤄 둔 진료",
    "text": "잠깐이면 나을 줄 알았던 불편이 일상에 남아 있다.",
    "eligibility": "실제 불편 증상 기록; 접근 가능한 진료 경로",
    "requires": [
      "scenario.LIFE-061.ready"
    ],
    "cooldownYears": 4,
    "choices": [
      {
        "id": "a",
        "label": "진료 예약",
        "text": "실제 시간·비용",
        "personality": {
          "weights": {
            "J": 0.4
          },
          "rationale": "미리 정하는 일정·경계 0.4",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-061.a",
          "actionId": "scenario.LIFE-061.a",
          "status": "implemented",
          "kind": "request",
          "minutes": 25,
          "cost": 0,
          "record": "appointment-requested"
        },
        "effect": {
          "description": "실제 시간·비용",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "진료일: 의료 모듈이 확인한 소견·검사 결과만 반영",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "실제 시간·비용 · 장면 시간 25분 · 추가 비용 없음 · 승인·거절은 다음 해 현재 여건으로 재확인"
      },
      {
        "id": "b",
        "label": "가능한 일정 확인",
        "text": "예약 후보",
        "personality": {
          "weights": {
            "J": 0.3
          },
          "rationale": "미리 정하는 일정·경계 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-061.b",
          "actionId": "scenario.LIFE-061.b",
          "status": "implemented",
          "kind": "record",
          "minutes": 20,
          "cost": 0
        },
        "effect": {
          "description": "예약 후보",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "진료일: 의료 모듈이 확인한 소견·검사 결과만 반영",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "예약 후보 · 장면 시간 20분 · 추가 비용 없음"
      },
      {
        "id": "c",
        "label": "이번 일정 미루기",
        "text": "미진료 상태 유지",
        "personality": {
          "weights": {
            "P": 0.3
          },
          "rationale": "상황에 맞춘 유연한 조정 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-061.c",
          "actionId": "scenario.LIFE-061.c",
          "status": "implemented",
          "kind": "hold",
          "minutes": 0,
          "cost": 0
        },
        "effect": {
          "description": "미진료 상태 유지",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "진료일: 의료 모듈이 확인한 소견·검사 결과만 반영",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "미진료 상태 유지 · 추가 시간 없음 · 추가 비용 없음"
      }
    ],
    "guard": "미룸을 암·사망으로 확정하지 않음; 증상만으로 진단명 생성 금지",
    "followUp": "진료일: 의료 모듈이 확인한 소견·검사 결과만 반영",
    "cancelWhen": [
      "source-context-ended",
      "participant-unavailable",
      "required-fact-expired"
    ],
    "source": {
      "file": "docs/design/LIFE-EVENTS-100.json",
      "evidenceLevel": "fictional-scenario"
    },
    "stateDependencies": [
      "health",
      "actual-condition-or-user-reported-need"
    ],
    "probabilityKind": "game-tuning-not-statistics",
    "ready": true,
    "scenarioProfile": true,
    "implementationStatus": "implemented-conditional-scenario"
  },
  {
    "id": "LIFE-062",
    "domain": "health",
    "years": [
      1970,
      2026
    ],
    "ages": [
      18,
      85
    ],
    "title": "낮에 자려는데 할 일이 쌓였다",
    "text": "야간 근무 뒤 돌봄과 집안일 때문에 잘 시간이 줄었다.",
    "eligibility": "현재 교대·야간 근무; 실제 수면시간 부족 기록",
    "requires": [
      "scenario.LIFE-062.ready"
    ],
    "cooldownYears": 4,
    "choices": [
      {
        "id": "a",
        "label": "가구 역할 재협의",
        "text": "동의 시 수면시간 확보",
        "personality": {
          "weights": {
            "F": 0.3,
            "J": 0.3
          },
          "rationale": "상대의 의사·관계 우선 0.3 · 미리 정하는 일정·경계 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-062.a",
          "actionId": "scenario.LIFE-062.a",
          "status": "specification-only"
        },
        "effect": {
          "description": "동의 시 수면시간 확보",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "다음 근무기간: 실제 수면·피로와 업무 상태로 루틴 재평가",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      },
      {
        "id": "b",
        "label": "일부 일 미루기",
        "text": "미완료 일정",
        "personality": {
          "weights": {
            "P": 0.3
          },
          "rationale": "상황에 맞춘 유연한 조정 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-062.b",
          "actionId": "scenario.LIFE-062.b",
          "status": "specification-only"
        },
        "effect": {
          "description": "미완료 일정",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "다음 근무기간: 실제 수면·피로와 업무 상태로 루틴 재평가",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      },
      {
        "id": "c",
        "label": "근무표 변경 문의",
        "text": "승인 뒤 적용",
        "personality": {
          "weights": {
            "E": 0.2,
            "J": 0.3
          },
          "rationale": "직접 교류하는 방식 0.2 · 미리 정하는 일정·경계 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-062.c",
          "actionId": "scenario.LIFE-062.c",
          "status": "specification-only"
        },
        "effect": {
          "description": "승인 뒤 적용",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "다음 근무기간: 실제 수면·피로와 업무 상태로 루틴 재평가",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      }
    ],
    "guard": "야간근무만으로 특정 질병 확정 금지; 수면시간과 돌봄시간 중복 배정 금지",
    "followUp": "다음 근무기간: 실제 수면·피로와 업무 상태로 루틴 재평가",
    "cancelWhen": [
      "source-context-ended",
      "participant-unavailable",
      "required-fact-expired"
    ],
    "source": {
      "file": "docs/design/LIFE-EVENTS-100.json",
      "evidenceLevel": "fictional-scenario"
    },
    "stateDependencies": [
      "health",
      "actual-condition-or-user-reported-need"
    ],
    "probabilityKind": "game-tuning-not-statistics",
    "ready": false,
    "implementationStatus": "deferred-state-or-policy-verification",
    "deferredReason": "원본 조건(현재 교대·야간 근무; 실제 수면시간 부족 기록)을 만족하는 실제 상태·제도·당사자 입력과 실행 처리가 아직 연결되지 않음. 과거 인물·소유물·진단·공식 통지를 소급 생성하지 않음."
  },
  {
    "id": "LIFE-063",
    "domain": "health",
    "years": [
      1980,
      2026
    ],
    "ages": [
      18,
      85
    ],
    "title": "담배를 피우는 시간을 바꿀까",
    "text": "쉬는 시간의 습관을 바꾸려니 무엇으로 대신할지 고민된다.",
    "eligibility": "기존 흡연 루틴; 본인 금연 의사 또는 생활비·공간 충돌",
    "requires": [
      "scenario.LIFE-063.ready"
    ],
    "cooldownYears": 4,
    "choices": [
      {
        "id": "a",
        "label": "금연 지원 문의",
        "text": "이용 확인",
        "personality": {
          "weights": {
            "J": 0.4
          },
          "rationale": "미리 정하는 일정·경계 0.4",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-063.a",
          "actionId": "scenario.LIFE-063.a",
          "status": "implemented",
          "kind": "request",
          "minutes": 20,
          "cost": 0,
          "record": "cessation-support-requested"
        },
        "effect": {
          "description": "이용 확인",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "다음 해: 실제 지속·재개 이력을 기록하고 비용 재계산",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "이용 확인 · 장면 시간 20분 · 추가 비용 없음 · 승인·거절은 다음 해 현재 여건으로 재확인"
      },
      {
        "id": "b",
        "label": "흡연 시간·공간 조정",
        "text": "실제 소비·접촉 변화",
        "personality": {
          "weights": {
            "P": 0.3
          },
          "rationale": "상황에 맞춘 유연한 조정 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-063.b",
          "actionId": "scenario.LIFE-063.b",
          "status": "implemented",
          "kind": "rule",
          "minutes": 10,
          "cost": 0,
          "record": "smoking-boundary"
        },
        "effect": {
          "description": "실제 소비·접촉 변화",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "다음 해: 실제 지속·재개 이력을 기록하고 비용 재계산",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "실제 소비·접촉 변화 · 장면 시간 10분 · 추가 비용 없음"
      },
      {
        "id": "c",
        "label": "당장 유지",
        "text": "기존 루틴",
        "personality": {
          "weights": {
            "J": 0.3
          },
          "rationale": "미리 정하는 일정·경계 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-063.c",
          "actionId": "scenario.LIFE-063.c",
          "status": "implemented",
          "kind": "hold",
          "minutes": 0,
          "cost": 0
        },
        "effect": {
          "description": "기존 루틴",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "다음 해: 실제 지속·재개 이력을 기록하고 비용 재계산",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "기존 루틴 · 추가 시간 없음 · 추가 비용 없음"
      }
    ],
    "guard": "선택 한 번으로 평생 금연·건강 완치 확정 금지; 지원 제도 시대 확인",
    "followUp": "다음 해: 실제 지속·재개 이력을 기록하고 비용 재계산",
    "cancelWhen": [
      "source-context-ended",
      "participant-unavailable",
      "required-fact-expired"
    ],
    "source": {
      "file": "docs/design/LIFE-EVENTS-100.json",
      "evidenceLevel": "fictional-scenario"
    },
    "stateDependencies": [
      "health",
      "actual-condition-or-user-reported-need"
    ],
    "probabilityKind": "game-tuning-not-statistics",
    "ready": true,
    "scenarioProfile": true,
    "implementationStatus": "implemented-conditional-scenario"
  },
  {
    "id": "LIFE-064",
    "domain": "health",
    "years": [
      1980,
      2026
    ],
    "ages": [
      18,
      85
    ],
    "title": "한 잔 더 마실지 먼저 나갈지",
    "text": "모임은 이어지지만 다음 날 꼭 지켜야 할 일정이 있다.",
    "eligibility": "실제 음주 모임 반복; 다음 날 일정과 충돌",
    "requires": [
      "scenario.LIFE-064.ready"
    ],
    "cooldownYears": 4,
    "choices": [
      {
        "id": "a",
        "label": "먼저 귀가",
        "text": "추가 소비 없음·귀가시간",
        "personality": {
          "weights": {
            "J": 0.5
          },
          "rationale": "미리 정하는 일정·경계 0.5",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-064.a",
          "actionId": "scenario.LIFE-064.a",
          "status": "specification-only"
        },
        "effect": {
          "description": "추가 소비 없음·귀가시간",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "다음 일정: 실제 귀가·수면·참석 기록으로 피로와 약속 이행 갱신",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      },
      {
        "id": "b",
        "label": "비음주로 머물기",
        "text": "실제 음료·시간",
        "personality": {
          "weights": {
            "P": 0.3
          },
          "rationale": "상황에 맞춘 유연한 조정 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-064.b",
          "actionId": "scenario.LIFE-064.b",
          "status": "specification-only"
        },
        "effect": {
          "description": "실제 음료·시간",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "다음 일정: 실제 귀가·수면·참석 기록으로 피로와 약속 이행 갱신",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      },
      {
        "id": "c",
        "label": "참석 방식 미리 협의",
        "text": "다음 모임 원칙",
        "personality": {
          "weights": {
            "J": 0.4
          },
          "rationale": "미리 정하는 일정·경계 0.4",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-064.c",
          "actionId": "scenario.LIFE-064.c",
          "status": "specification-only"
        },
        "effect": {
          "description": "다음 모임 원칙",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "다음 일정: 실제 귀가·수면·참석 기록으로 피로와 약속 이행 갱신",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      }
    ],
    "guard": "음주 선택을 사고·중독 즉시 발생으로 연결 금지; 운전 귀가 선택 배제",
    "followUp": "다음 일정: 실제 귀가·수면·참석 기록으로 피로와 약속 이행 갱신",
    "cancelWhen": [
      "source-context-ended",
      "participant-unavailable",
      "required-fact-expired"
    ],
    "source": {
      "file": "docs/design/LIFE-EVENTS-100.json",
      "evidenceLevel": "fictional-scenario"
    },
    "stateDependencies": [
      "health",
      "actual-condition-or-user-reported-need"
    ],
    "probabilityKind": "game-tuning-not-statistics",
    "ready": false,
    "implementationStatus": "deferred-state-or-policy-verification",
    "deferredReason": "원본 조건(실제 음주 모임 반복; 다음 날 일정과 충돌)을 만족하는 실제 상태·제도·당사자 입력과 실행 처리가 아직 연결되지 않음. 과거 인물·소유물·진단·공식 통지를 소급 생성하지 않음."
  },
  {
    "id": "LIFE-065",
    "domain": "health",
    "years": [
      1990,
      2026
    ],
    "ages": [
      20,
      90
    ],
    "title": "재검 안내를 받은 뒤",
    "text": "결과지에는 추가 확인이 필요하다고 적혀 있다.",
    "eligibility": "검진 결과에 재검 안내; 실제 대상·기관·비용 확인",
    "requires": [
      "scenario.LIFE-065.ready"
    ],
    "cooldownYears": 4,
    "choices": [
      {
        "id": "a",
        "label": "재검 예약",
        "text": "일정 생성",
        "personality": {
          "weights": {
            "J": 0.5
          },
          "rationale": "미리 정하는 일정·경계 0.5",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-065.a",
          "actionId": "scenario.LIFE-065.a",
          "status": "specification-only"
        },
        "effect": {
          "description": "일정 생성",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "재검 후: 실제 확인 결과에 따라 추적·치료 단계; 정상 확인도 독립 결과",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      },
      {
        "id": "b",
        "label": "기관에 의미 문의",
        "text": "확인 정보",
        "personality": {
          "weights": {
            "T": 0.3,
            "J": 0.3
          },
          "rationale": "명시적인 조건·비용 비교 0.3 · 미리 정하는 일정·경계 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-065.b",
          "actionId": "scenario.LIFE-065.b",
          "status": "specification-only"
        },
        "effect": {
          "description": "확인 정보",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "재검 후: 실제 확인 결과에 따라 추적·치료 단계; 정상 확인도 독립 결과",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      },
      {
        "id": "c",
        "label": "이번 일정 연기",
        "text": "미확인 상태 유지",
        "personality": {
          "weights": {
            "P": 0.3
          },
          "rationale": "상황에 맞춘 유연한 조정 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-065.c",
          "actionId": "scenario.LIFE-065.c",
          "status": "specification-only"
        },
        "effect": {
          "description": "미확인 상태 유지",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "재검 후: 실제 확인 결과에 따라 추적·치료 단계; 정상 확인도 독립 결과",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      }
    ],
    "guard": "재검=암 확정 금지; 검진 접근·비용을 모든 시대 동일 적용 금지",
    "followUp": "재검 후: 실제 확인 결과에 따라 추적·치료 단계; 정상 확인도 독립 결과",
    "cancelWhen": [
      "source-context-ended",
      "participant-unavailable",
      "required-fact-expired"
    ],
    "source": {
      "file": "docs/design/LIFE-EVENTS-100.json",
      "evidenceLevel": "fictional-scenario"
    },
    "stateDependencies": [
      "health",
      "actual-condition-or-user-reported-need"
    ],
    "probabilityKind": "game-tuning-not-statistics",
    "ready": false,
    "implementationStatus": "deferred-state-or-policy-verification",
    "deferredReason": "원본 조건(검진 결과에 재검 안내; 실제 대상·기관·비용 확인)을 만족하는 실제 상태·제도·당사자 입력과 실행 처리가 아직 연결되지 않음. 과거 인물·소유물·진단·공식 통지를 소급 생성하지 않음."
  },
  {
    "id": "LIFE-066",
    "domain": "health",
    "years": [
      1990,
      2026
    ],
    "ages": [
      18,
      90
    ],
    "title": "처방 일정이 생활과 부딪힌다",
    "text": "정해진 복용이나 내원 시간이 바쁜 일정과 겹친다.",
    "eligibility": "실제 치료 처방·복용 일정; 근무나 여행과 충돌",
    "requires": [
      "scenario.LIFE-066.ready"
    ],
    "cooldownYears": 4,
    "choices": [
      {
        "id": "a",
        "label": "의료진에 일정 상담",
        "text": "확인된 대안",
        "personality": {
          "weights": {
            "J": 0.5
          },
          "rationale": "미리 정하는 일정·경계 0.5",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-066.a",
          "actionId": "scenario.LIFE-066.a",
          "status": "implemented",
          "kind": "request",
          "minutes": 20,
          "cost": 0
        },
        "effect": {
          "description": "확인된 대안",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "다음 내원: 실제 이행 기록과 진료 결과로 치료 계획 갱신",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "확인된 대안 · 장면 시간 20분 · 추가 비용 없음 · 승인·거절은 다음 해 현재 여건으로 재확인"
      },
      {
        "id": "b",
        "label": "근무 조정 요청",
        "text": "합의한 시간",
        "personality": {
          "weights": {
            "E": 0.2,
            "J": 0.4
          },
          "rationale": "직접 교류하는 방식 0.2 · 미리 정하는 일정·경계 0.4",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-066.b",
          "actionId": "scenario.LIFE-066.b",
          "status": "implemented",
          "kind": "request",
          "minutes": 15,
          "cost": 0
        },
        "effect": {
          "description": "합의한 시간",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "다음 내원: 실제 이행 기록과 진료 결과로 치료 계획 갱신",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "합의한 시간 · 장면 시간 15분 · 추가 비용 없음 · 승인·거절은 다음 해 현재 여건으로 재확인"
      },
      {
        "id": "c",
        "label": "이동 일정 변경",
        "text": "예약 비용 조정",
        "personality": {
          "weights": {
            "P": 0.3
          },
          "rationale": "상황에 맞춘 유연한 조정 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-066.c",
          "actionId": "scenario.LIFE-066.c",
          "status": "implemented",
          "kind": "request",
          "minutes": 20,
          "cost": 0
        },
        "effect": {
          "description": "예약 비용 조정",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "다음 내원: 실제 이행 기록과 진료 결과로 치료 계획 갱신",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "예약 비용 조정 · 장면 시간 20분 · 추가 비용 없음 · 승인·거절은 다음 해 현재 여건으로 재확인"
      }
    ],
    "guard": "게임 선택으로 임의 용량·중단 지시 없음; 치료 효과 확정 금지",
    "followUp": "다음 내원: 실제 이행 기록과 진료 결과로 치료 계획 갱신",
    "cancelWhen": [
      "source-context-ended",
      "participant-unavailable",
      "required-fact-expired"
    ],
    "source": {
      "file": "docs/design/LIFE-EVENTS-100.json",
      "evidenceLevel": "fictional-scenario"
    },
    "stateDependencies": [
      "health",
      "actual-condition-or-user-reported-need"
    ],
    "probabilityKind": "game-tuning-not-statistics",
    "ready": true,
    "scenarioProfile": true,
    "implementationStatus": "implemented-conditional-scenario"
  },
  {
    "id": "LIFE-067",
    "domain": "health",
    "years": [
      2000,
      2026
    ],
    "ages": [
      18,
      85
    ],
    "title": "돈 들이지 않고 몸을 움직일 곳",
    "text": "운동 비용은 부담스럽지만 가까운 길이나 공간은 이용할 수 있다.",
    "ready": true,
    "requires": [
      "routine.exercise-inactive",
      "access.safe-movement-space",
      "schedule.available-time",
      "budget.exercise-pressure"
    ],
    "eligibility": "걷기·운동 루틴 없음 또는 중단; 안전한 접근 장소·시간 있음",
    "choices": [
      {
        "id": "a",
        "label": "짧은 산책 예약",
        "text": "시간 루틴",
        "personality": {
          "weights": {
            "J": 0.4
          },
          "rationale": "미리 정하는 일정·경계 0.4",
          "authored": true
        },
        "operation": {
          "id": "reserve-short-walk",
          "status": "implemented",
          "requiresConsent": false,
          "ledger": "only-confirmed-once",
          "charge": "verified-amount-only",
          "result": "confirmed-response-only",
          "actionId": "reserve-short-walk",
          "requiredInputs": [
            "confirmed-source-facts",
            "current-context",
            "unique-operation-id",
            "effective-year"
          ]
        },
        "effect": {
          "description": "시간 루틴",
          "applyAutomatically": true
        },
        "followUp": {
          "afterYears": 1,
          "description": "다음 계절: 실제 반복 횟수·몸 상태에 따라 유지·축소·대체 실제 일정이 1년 안에 끝나면 같은 연도 기록에서 처리하고 다음 연도에는 이행 여부만 재확인한다.",
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-facts-invalid",
            "participant-unavailable",
            "context-changed"
          ],
          "automaticSuccess": false,
          "duePolicy": "next-annual-review-after-recorded-deadline"
        },
        "requires": []
      },
      {
        "id": "b",
        "label": "친구와 함께 제안",
        "text": "동의 시 공동 약속",
        "personality": {
          "weights": {
            "E": 0.2,
            "F": 0.3
          },
          "rationale": "직접 교류하는 방식 0.2 · 상대의 의사·관계 우선 0.3",
          "authored": true
        },
        "operation": {
          "id": "invite-existing-friend-to-walk",
          "status": "specification-only",
          "requiresConsent": true,
          "ledger": "only-confirmed-once",
          "charge": "verified-amount-only",
          "result": "confirmed-response-only",
          "actionId": "invite-existing-friend-to-walk",
          "requiredInputs": [
            "confirmed-source-facts",
            "current-context",
            "unique-operation-id",
            "effective-year"
          ]
        },
        "effect": {
          "description": "동의 시 공동 약속",
          "applyAutomatically": false
        },
        "followUp": {
          "afterYears": 1,
          "description": "다음 계절: 실제 반복 횟수·몸 상태에 따라 유지·축소·대체 실제 일정이 1년 안에 끝나면 같은 연도 기록에서 처리하고 다음 연도에는 이행 여부만 재확인한다.",
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-facts-invalid",
            "participant-unavailable",
            "context-changed"
          ],
          "automaticSuccess": false,
          "duePolicy": "next-annual-review-after-recorded-deadline"
        },
        "requires": [
          "social.existing-friend",
          "social.friend-contact-channel"
        ]
      },
      {
        "id": "c",
        "label": "현 일정 유지",
        "text": "변화 없음",
        "personality": {
          "weights": {
            "P": 0.3
          },
          "rationale": "상황에 맞춘 유연한 조정 0.3",
          "authored": true
        },
        "operation": {
          "id": "retain-current-schedule",
          "status": "implemented",
          "requiresConsent": false,
          "ledger": "only-confirmed-once",
          "charge": "verified-amount-only",
          "result": "confirmed-response-only",
          "actionId": "retain-current-schedule",
          "requiredInputs": [
            "confirmed-source-facts",
            "current-context",
            "unique-operation-id",
            "effective-year"
          ]
        },
        "effect": {
          "description": "변화 없음",
          "applyAutomatically": true
        },
        "followUp": {
          "afterYears": 1,
          "description": "다음 계절: 실제 반복 횟수·몸 상태에 따라 유지·축소·대체 실제 일정이 1년 안에 끝나면 같은 연도 기록에서 처리하고 다음 연도에는 이행 여부만 재확인한다.",
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-facts-invalid",
            "participant-unavailable",
            "context-changed"
          ],
          "automaticSuccess": false,
          "duePolicy": "next-annual-review-after-recorded-deadline"
        },
        "requires": []
      }
    ],
    "cancelWhen": [
      "required-fact-missing-or-expired",
      "source-context-ended",
      "actor-or-counterparty-no-longer-eligible"
    ],
    "guard": "산책으로 질병 치료·체중 수치 자동 확정 금지; 접근 어려운 몸 상태 대안 제공",
    "followUp": "다음 계절: 실제 반복 횟수·몸 상태에 따라 유지·축소·대체",
    "source": {
      "file": "docs/design/LIFE-EVENTS-100.json",
      "evidenceLevel": "fictional-scenario"
    },
    "cooldownYears": 3,
    "stateDependencies": [
      "health",
      "actual-condition-or-user-reported-need"
    ],
    "probabilityKind": "game-tuning-not-statistics",
    "implementationStatus": "implemented-confirmed-facts"
  },
  {
    "id": "LIFE-068",
    "domain": "health",
    "years": [
      2000,
      2026
    ],
    "ages": [
      15,
      90
    ],
    "title": "혼자 정리하기 어려운 마음",
    "text": "일상 부담이 이어져 누군가와 이야기할 시간을 생각한다.",
    "eligibility": "본인이 부담·불면·기분 어려움을 표현; 실제 상담 접근 경로",
    "requires": [
      "scenario.LIFE-068.ready"
    ],
    "cooldownYears": 4,
    "choices": [
      {
        "id": "a",
        "label": "믿는 사람에게 이야기",
        "text": "동의한 접촉",
        "personality": {
          "weights": {
            "E": 0.2,
            "F": 0.3
          },
          "rationale": "직접 교류하는 방식 0.2 · 상대의 의사·관계 우선 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-068.a",
          "actionId": "scenario.LIFE-068.a",
          "status": "implemented",
          "kind": "request",
          "minutes": 20,
          "cost": 0,
          "person": "parent-or-partner"
        },
        "effect": {
          "description": "동의한 접촉",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "다음 기간: 실제 지원 경험·주관적 변화 기록; 필요 시 상담 재예약",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "동의한 접촉 · 장면 시간 20분 · 추가 비용 없음 · 승인·거절은 다음 해 현재 여건으로 재확인"
      },
      {
        "id": "b",
        "label": "상담 경로 확인",
        "text": "접수·비용 정보",
        "personality": {
          "weights": {
            "J": 0.3
          },
          "rationale": "미리 정하는 일정·경계 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-068.b",
          "actionId": "scenario.LIFE-068.b",
          "status": "implemented",
          "kind": "record",
          "minutes": 20,
          "cost": 0
        },
        "effect": {
          "description": "접수·비용 정보",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "다음 기간: 실제 지원 경험·주관적 변화 기록; 필요 시 상담 재예약",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "접수·비용 정보 · 장면 시간 20분 · 추가 비용 없음"
      },
      {
        "id": "c",
        "label": "잠시 자기 시간 확보",
        "text": "가능한 일정 조정",
        "personality": {
          "weights": {
            "I": 0.3,
            "P": 0.3
          },
          "rationale": "혼자 정리할 시간 0.3 · 상황에 맞춘 유연한 조정 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-068.c",
          "actionId": "scenario.LIFE-068.c",
          "status": "implemented",
          "kind": "rest",
          "minutes": 20,
          "cost": 0
        },
        "effect": {
          "description": "가능한 일정 조정",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "다음 기간: 실제 지원 경험·주관적 변화 기록; 필요 시 상담 재예약",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "가능한 일정 조정 · 장면 시간 20분 · 추가 비용 없음"
      }
    ],
    "guard": "표현만으로 정신질환 진단 금지; 도움 요청에 의지 보너스·낙인 없음",
    "followUp": "다음 기간: 실제 지원 경험·주관적 변화 기록; 필요 시 상담 재예약",
    "cancelWhen": [
      "source-context-ended",
      "participant-unavailable",
      "required-fact-expired"
    ],
    "source": {
      "file": "docs/design/LIFE-EVENTS-100.json",
      "evidenceLevel": "fictional-scenario"
    },
    "stateDependencies": [
      "health",
      "actual-condition-or-user-reported-need"
    ],
    "probabilityKind": "game-tuning-not-statistics",
    "ready": true,
    "scenarioProfile": true,
    "implementationStatus": "implemented-conditional-scenario"
  },
  {
    "id": "LIFE-069",
    "domain": "health",
    "years": [
      2010,
      2026
    ],
    "ages": [
      40,
      95
    ],
    "title": "익숙한 외출을 계속하려면",
    "text": "이동이나 소통을 돕는 도구를 써 볼 기회가 생겼다.",
    "eligibility": "이동·시청·청취 불편 확인; 실제 보조수단 견적·적합성 평가",
    "requires": [
      "scenario.LIFE-069.ready"
    ],
    "cooldownYears": 4,
    "choices": [
      {
        "id": "a",
        "label": "평가·체험",
        "text": "적합성 확인",
        "personality": {
          "weights": {
            "N": 0.3,
            "P": 0.3
          },
          "rationale": "새 방법 탐색 0.3 · 상황에 맞춘 유연한 조정 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-069.a",
          "actionId": "scenario.LIFE-069.a",
          "status": "specification-only"
        },
        "effect": {
          "description": "적합성 확인",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "실제 이용 뒤: 접근 가능한 활동·유지비·보조 필요를 갱신",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      },
      {
        "id": "b",
        "label": "구입·대여 조건 비교",
        "text": "비용 후보",
        "personality": {
          "weights": {
            "T": 0.3,
            "J": 0.3
          },
          "rationale": "명시적인 조건·비용 비교 0.3 · 미리 정하는 일정·경계 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-069.b",
          "actionId": "scenario.LIFE-069.b",
          "status": "specification-only"
        },
        "effect": {
          "description": "비용 후보",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "실제 이용 뒤: 접근 가능한 활동·유지비·보조 필요를 갱신",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      },
      {
        "id": "c",
        "label": "동행 방식 조정",
        "text": "동의한 시간 부담",
        "personality": {
          "weights": {
            "F": 0.3,
            "P": 0.3
          },
          "rationale": "상대의 의사·관계 우선 0.3 · 상황에 맞춘 유연한 조정 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-069.c",
          "actionId": "scenario.LIFE-069.c",
          "status": "specification-only"
        },
        "effect": {
          "description": "동의한 시간 부담",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "실제 이용 뒤: 접근 가능한 활동·유지비·보조 필요를 갱신",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      }
    ],
    "guard": "고령이라는 이유만으로 장애 생성 금지; 도구로 모든 불편 해소 확정 금지",
    "followUp": "실제 이용 뒤: 접근 가능한 활동·유지비·보조 필요를 갱신",
    "cancelWhen": [
      "source-context-ended",
      "participant-unavailable",
      "required-fact-expired"
    ],
    "source": {
      "file": "docs/design/LIFE-EVENTS-100.json",
      "evidenceLevel": "fictional-scenario"
    },
    "stateDependencies": [
      "health",
      "actual-condition-or-user-reported-need"
    ],
    "probabilityKind": "game-tuning-not-statistics",
    "ready": false,
    "implementationStatus": "deferred-state-or-policy-verification",
    "deferredReason": "원본 조건(이동·시청·청취 불편 확인; 실제 보조수단 견적·적합성 평가)을 만족하는 실제 상태·제도·당사자 입력과 실행 처리가 아직 연결되지 않음. 과거 인물·소유물·진단·공식 통지를 소급 생성하지 않음."
  },
  {
    "id": "LIFE-070",
    "domain": "health",
    "years": [
      2020,
      2022
    ],
    "ages": [
      10,
      95
    ],
    "title": "예정된 외출을 미뤄야 한다",
    "text": "실제 안내에 따라 출근이나 방문 일정을 바꿔야 한다.",
    "eligibility": "해당 지역·시점 감염 대응 안내 확인; 본인 검사·격리 대상 확인",
    "requires": [
      "scenario.LIFE-070.ready"
    ],
    "cooldownYears": 4,
    "choices": [
      {
        "id": "a",
        "label": "기관·직장에 알림",
        "text": "확인된 일정 변경",
        "personality": {
          "weights": {
            "J": 0.5
          },
          "rationale": "미리 정하는 일정·경계 0.5",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-070.a",
          "actionId": "scenario.LIFE-070.a",
          "status": "specification-only"
        },
        "effect": {
          "description": "확인된 일정 변경",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "안내 종료 뒤: 실제 근무·방문 재개; 회복·진단은 의료 기록에 따름",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      },
      {
        "id": "b",
        "label": "필요 물품 도움 요청",
        "text": "동의한 전달",
        "personality": {
          "weights": {
            "F": 0.3
          },
          "rationale": "상대의 의사·관계 우선 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-070.b",
          "actionId": "scenario.LIFE-070.b",
          "status": "specification-only"
        },
        "effect": {
          "description": "동의한 전달",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "안내 종료 뒤: 실제 근무·방문 재개; 회복·진단은 의료 기록에 따름",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      },
      {
        "id": "c",
        "label": "가능한 비대면 방식",
        "text": "접근 비용·시간",
        "personality": {
          "weights": {
            "N": 0.3,
            "P": 0.3
          },
          "rationale": "새 방법 탐색 0.3 · 상황에 맞춘 유연한 조정 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-070.c",
          "actionId": "scenario.LIFE-070.c",
          "status": "specification-only"
        },
        "effect": {
          "description": "접근 비용·시간",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "안내 종료 뒤: 실제 근무·방문 재개; 회복·진단은 의료 기록에 따름",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      }
    ],
    "guard": "모든 인물 일괄 감염 금지; 격리 기간·지원금은 검증 전 적용 금지",
    "followUp": "안내 종료 뒤: 실제 근무·방문 재개; 회복·진단은 의료 기록에 따름",
    "cancelWhen": [
      "source-context-ended",
      "participant-unavailable",
      "required-fact-expired"
    ],
    "source": {
      "file": "docs/design/LIFE-EVENTS-100.json",
      "evidenceLevel": "fictional-scenario"
    },
    "stateDependencies": [
      "health",
      "actual-condition-or-user-reported-need"
    ],
    "probabilityKind": "game-tuning-not-statistics",
    "ready": false,
    "implementationStatus": "deferred-state-or-policy-verification",
    "deferredReason": "원본 조건(해당 지역·시점 감염 대응 안내 확인; 본인 검사·격리 대상 확인)을 만족하는 실제 상태·제도·당사자 입력과 실행 처리가 아직 연결되지 않음. 과거 인물·소유물·진단·공식 통지를 소급 생성하지 않음."
  },
  {
    "id": "LIFE-071",
    "domain": "leisure",
    "years": [
      1960,
      1989
    ],
    "ages": [
      8,
      70
    ],
    "title": "보고 싶은 영화가 동네에 왔다",
    "text": "같이 보자는 사람이 생겼지만 시간과 표값을 맞춰야 한다.",
    "eligibility": "상영관 접근·실제 상영 정보; 여유 시간과 관람 예산 있음",
    "requires": [
      "scenario.LIFE-071.ready"
    ],
    "cooldownYears": 4,
    "choices": [
      {
        "id": "a",
        "label": "함께 관람",
        "text": "티켓·이동·공유 기억",
        "personality": {
          "weights": {
            "E": 0.4
          },
          "rationale": "직접 교류하는 방식 0.4",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-071.a",
          "actionId": "scenario.LIFE-071.a",
          "status": "implemented",
          "kind": "request",
          "minutes": 20,
          "cost": 2,
          "person": "partner"
        },
        "effect": {
          "description": "티켓·이동·공유 기억",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "이후 만남: 실제 관람한 작품·함께한 인물을 기억으로만 참조",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "티켓·이동·공유 기억 · 장면 시간 20분 · 2만 원 · 승인 뒤 실행 때만 지출 · 승인·거절은 다음 해 현재 여건으로 재확인"
      },
      {
        "id": "b",
        "label": "혼자 다른 시간에",
        "text": "자기 일정",
        "personality": {
          "weights": {
            "I": 0.4
          },
          "rationale": "혼자 정리할 시간 0.4",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-071.b",
          "actionId": "scenario.LIFE-071.b",
          "status": "implemented",
          "kind": "expense",
          "minutes": 60,
          "cost": 2,
          "record": "solo-film-visit"
        },
        "effect": {
          "description": "자기 일정",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "이후 만남: 실제 관람한 작품·함께한 인물을 기억으로만 참조",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "자기 일정 · 장면 시간 60분 · 2만 원 · 이번 선택에서 지출"
      },
      {
        "id": "c",
        "label": "다음 기회로 미룸",
        "text": "지출 없음",
        "personality": {
          "weights": {
            "P": 0.3
          },
          "rationale": "상황에 맞춘 유연한 조정 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-071.c",
          "actionId": "scenario.LIFE-071.c",
          "status": "implemented",
          "kind": "hold",
          "minutes": 0,
          "cost": 0
        },
        "effect": {
          "description": "지출 없음",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "이후 만남: 실제 관람한 작품·함께한 인물을 기억으로만 참조",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "지출 없음 · 추가 시간 없음 · 추가 비용 없음"
      }
    ],
    "guard": "관람관 없는 지역에 강제 노출 금지; 영화 감상으로 지능·연애 자동 상승 금지",
    "followUp": "이후 만남: 실제 관람한 작품·함께한 인물을 기억으로만 참조",
    "cancelWhen": [
      "source-context-ended",
      "participant-unavailable",
      "required-fact-expired"
    ],
    "source": {
      "file": "docs/design/LIFE-EVENTS-100.json",
      "evidenceLevel": "fictional-scenario"
    },
    "stateDependencies": [
      "dailyLife.activities",
      "current-access-and-time"
    ],
    "probabilityKind": "game-tuning-not-statistics",
    "ready": true,
    "scenarioProfile": true,
    "implementationStatus": "implemented-conditional-scenario"
  },
  {
    "id": "LIFE-072",
    "domain": "leisure",
    "years": [
      1970,
      2026
    ],
    "ages": [
      10,
      90
    ],
    "title": "끝내지 못한 책의 반납일",
    "text": "끝부분이 궁금하지만 책을 돌려줄 날이 다가왔다.",
    "ready": true,
    "requires": [
      "access.book-lending",
      "book.current-loan",
      "book.return-deadline",
      "book.unfinished-reading"
    ],
    "eligibility": "도서 접근·빌린 책 또는 읽기 루틴; 반환 일정 있음",
    "choices": [
      {
        "id": "a",
        "label": "가능하면 연장",
        "text": "승인된 기한",
        "personality": {
          "weights": {
            "J": 0.5
          },
          "rationale": "미리 정하는 일정·경계 0.5",
          "authored": true
        },
        "operation": {
          "id": "request-loan-extension",
          "status": "implemented",
          "requiresConsent": true,
          "ledger": "only-confirmed-once",
          "charge": "verified-amount-only",
          "result": "confirmed-response-only",
          "actionId": "request-loan-extension",
          "requiredInputs": [
            "confirmed-source-facts",
            "current-context",
            "unique-operation-id",
            "effective-year"
          ]
        },
        "effect": {
          "description": "승인된 기한",
          "applyAutomatically": true
        },
        "followUp": {
          "afterYears": 1,
          "description": "다음 대출: 실제 반납·독서 이력으로 관심 주제 유지 실제 일정이 1년 안에 끝나면 같은 연도 기록에서 처리하고 다음 연도에는 이행 여부만 재확인한다.",
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-facts-invalid",
            "participant-unavailable",
            "context-changed"
          ],
          "automaticSuccess": false,
          "duePolicy": "next-annual-review-after-recorded-deadline"
        },
        "requires": [
          "book.extension-eligible"
        ]
      },
      {
        "id": "b",
        "label": "반납 후 재대출 예약",
        "text": "대기 기록",
        "personality": {
          "weights": {
            "J": 0.4
          },
          "rationale": "미리 정하는 일정·경계 0.4",
          "authored": true
        },
        "operation": {
          "id": "return-and-reserve-book",
          "status": "implemented",
          "requiresConsent": false,
          "ledger": "only-confirmed-once",
          "charge": "verified-amount-only",
          "result": "confirmed-response-only",
          "actionId": "return-and-reserve-book",
          "requiredInputs": [
            "confirmed-source-facts",
            "current-context",
            "unique-operation-id",
            "effective-year"
          ]
        },
        "effect": {
          "description": "대기 기록",
          "applyAutomatically": true
        },
        "followUp": {
          "afterYears": 1,
          "description": "다음 대출: 실제 반납·독서 이력으로 관심 주제 유지 실제 일정이 1년 안에 끝나면 같은 연도 기록에서 처리하고 다음 연도에는 이행 여부만 재확인한다.",
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-facts-invalid",
            "participant-unavailable",
            "context-changed"
          ],
          "automaticSuccess": false,
          "duePolicy": "next-annual-review-after-recorded-deadline"
        },
        "requires": [
          "book.reservation-channel"
        ]
      },
      {
        "id": "c",
        "label": "짧은 읽기시간 확보",
        "text": "다른 재량 일정 조정",
        "personality": {
          "weights": {
            "P": 0.3
          },
          "rationale": "상황에 맞춘 유연한 조정 0.3",
          "authored": true
        },
        "operation": {
          "id": "reserve-reading-time",
          "status": "implemented",
          "requiresConsent": true,
          "ledger": "only-confirmed-once",
          "charge": "verified-amount-only",
          "result": "confirmed-response-only",
          "actionId": "reserve-reading-time",
          "requiredInputs": [
            "confirmed-source-facts",
            "current-context",
            "unique-operation-id",
            "effective-year"
          ]
        },
        "effect": {
          "description": "다른 재량 일정 조정",
          "applyAutomatically": true
        },
        "followUp": {
          "afterYears": 1,
          "description": "다음 대출: 실제 반납·독서 이력으로 관심 주제 유지 실제 일정이 1년 안에 끝나면 같은 연도 기록에서 처리하고 다음 연도에는 이행 여부만 재확인한다.",
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-facts-invalid",
            "participant-unavailable",
            "context-changed"
          ],
          "automaticSuccess": false,
          "duePolicy": "next-annual-review-after-recorded-deadline"
        },
        "requires": [
          "schedule.reading-time-reallocatable"
        ]
      }
    ],
    "cancelWhen": [
      "required-fact-missing-or-expired",
      "source-context-ended",
      "actor-or-counterparty-no-longer-eligible"
    ],
    "guard": "도서관·대여점 접근 시대 확인; 책 한 권으로 직업능력 급증 금지",
    "followUp": "다음 대출: 실제 반납·독서 이력으로 관심 주제 유지",
    "source": {
      "file": "docs/design/LIFE-EVENTS-100.json",
      "evidenceLevel": "fictional-scenario"
    },
    "cooldownYears": 3,
    "stateDependencies": [
      "dailyLife.activities",
      "current-access-and-time"
    ],
    "probabilityKind": "game-tuning-not-statistics",
    "implementationStatus": "implemented-confirmed-facts"
  },
  {
    "id": "LIFE-073",
    "domain": "leisure",
    "years": [
      1980,
      2026
    ],
    "ages": [
      13,
      85
    ],
    "title": "연습 소리와 이웃의 저녁",
    "text": "연습하고 싶은 시간이 다른 사람의 휴식과 겹친다.",
    "eligibility": "악기 보유 또는 대여 접근; 연습 공간·비용 문제",
    "requires": [
      "scenario.LIFE-073.ready"
    ],
    "cooldownYears": 4,
    "choices": [
      {
        "id": "a",
        "label": "연습시간 합의",
        "text": "허용 시간대",
        "personality": {
          "weights": {
            "F": 0.3,
            "J": 0.3
          },
          "rationale": "상대의 의사·관계 우선 0.3 · 미리 정하는 일정·경계 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-073.a",
          "actionId": "scenario.LIFE-073.a",
          "status": "implemented",
          "kind": "request",
          "minutes": 20,
          "cost": 0,
          "record": "practice-time-agreement"
        },
        "effect": {
          "description": "허용 시간대",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "다음 달 또는 다음 연도: 실제 연습 지속·민원 해결 여부로 루틴 갱신",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "허용 시간대 · 장면 시간 20분 · 추가 비용 없음 · 승인·거절은 다음 해 현재 여건으로 재확인"
      },
      {
        "id": "b",
        "label": "공용 공간 예약",
        "text": "실제 이용료·이동",
        "personality": {
          "weights": {
            "N": 0.3,
            "P": 0.3
          },
          "rationale": "새 방법 탐색 0.3 · 상황에 맞춘 유연한 조정 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-073.b",
          "actionId": "scenario.LIFE-073.b",
          "status": "implemented",
          "kind": "request",
          "minutes": 20,
          "cost": 1,
          "record": "shared-practice-space"
        },
        "effect": {
          "description": "실제 이용료·이동",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "다음 달 또는 다음 연도: 실제 연습 지속·민원 해결 여부로 루틴 갱신",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "실제 이용료·이동 · 장면 시간 20분 · 1만 원 · 승인 뒤 실행 때만 지출 · 승인·거절은 다음 해 현재 여건으로 재확인"
      },
      {
        "id": "c",
        "label": "조용한 방식 검토",
        "text": "장비 접근 확인",
        "personality": {
          "weights": {
            "N": 0.3,
            "J": 0.3
          },
          "rationale": "새 방법 탐색 0.3 · 미리 정하는 일정·경계 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-073.c",
          "actionId": "scenario.LIFE-073.c",
          "status": "implemented",
          "kind": "record",
          "minutes": 20,
          "cost": 0
        },
        "effect": {
          "description": "장비 접근 확인",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "다음 달 또는 다음 연도: 실제 연습 지속·민원 해결 여부로 루틴 갱신",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "장비 접근 확인 · 장면 시간 20분 · 추가 비용 없음"
      }
    ],
    "guard": "악기 없으면 금지; 공간 예약으로 공연 기회 자동 부여 금지",
    "followUp": "다음 달 또는 다음 연도: 실제 연습 지속·민원 해결 여부로 루틴 갱신",
    "cancelWhen": [
      "source-context-ended",
      "participant-unavailable",
      "required-fact-expired"
    ],
    "source": {
      "file": "docs/design/LIFE-EVENTS-100.json",
      "evidenceLevel": "fictional-scenario"
    },
    "stateDependencies": [
      "dailyLife.activities",
      "current-access-and-time"
    ],
    "probabilityKind": "game-tuning-not-statistics",
    "ready": true,
    "scenarioProfile": true,
    "implementationStatus": "implemented-conditional-scenario"
  },
  {
    "id": "LIFE-074",
    "domain": "leisure",
    "years": [
      1980,
      2026
    ],
    "ages": [
      18,
      85
    ],
    "title": "매주 모이는 팀에 들어갈까",
    "text": "취미 모임이 생겼지만 빠짐없이 나오기는 어렵다.",
    "eligibility": "실제 취미 모임·회비·고정 일정; 본인 참여 가능",
    "requires": [
      "scenario.LIFE-074.ready"
    ],
    "cooldownYears": 4,
    "choices": [
      {
        "id": "a",
        "label": "참여 범위 협의",
        "text": "합의한 일정·회비",
        "personality": {
          "weights": {
            "E": 0.3,
            "J": 0.3
          },
          "rationale": "직접 교류하는 방식 0.3 · 미리 정하는 일정·경계 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-074.a",
          "actionId": "scenario.LIFE-074.a",
          "status": "implemented",
          "kind": "request",
          "minutes": 20,
          "cost": 2,
          "record": "hobby-group-application"
        },
        "effect": {
          "description": "합의한 일정·회비",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "활동기 종료: 실제 참석·역할 이행을 바탕으로 관계 형성 후보",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "합의한 일정·회비 · 장면 시간 20분 · 2만 원 · 승인 뒤 실행 때만 지출 · 승인·거절은 다음 해 현재 여건으로 재확인"
      },
      {
        "id": "b",
        "label": "가끔 참여",
        "text": "허용된 빈도",
        "personality": {
          "weights": {
            "E": 0.2,
            "P": 0.3
          },
          "rationale": "직접 교류하는 방식 0.2 · 상황에 맞춘 유연한 조정 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-074.b",
          "actionId": "scenario.LIFE-074.b",
          "status": "implemented",
          "kind": "request",
          "minutes": 15,
          "cost": 1
        },
        "effect": {
          "description": "허용된 빈도",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "활동기 종료: 실제 참석·역할 이행을 바탕으로 관계 형성 후보",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "허용된 빈도 · 장면 시간 15분 · 1만 원 · 승인 뒤 실행 때만 지출 · 승인·거절은 다음 해 현재 여건으로 재확인"
      },
      {
        "id": "c",
        "label": "혼자 지속",
        "text": "개인 루틴",
        "personality": {
          "weights": {
            "I": 0.4
          },
          "rationale": "혼자 정리할 시간 0.4",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-074.c",
          "actionId": "scenario.LIFE-074.c",
          "status": "implemented",
          "kind": "practice",
          "minutes": 20,
          "cost": 0
        },
        "effect": {
          "description": "개인 루틴",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "활동기 종료: 실제 참석·역할 이행을 바탕으로 관계 형성 후보",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "개인 루틴 · 장면 시간 20분 · 추가 비용 없음"
      }
    ],
    "guard": "가입만으로 절친·대회 우승 생성 금지; 부담 가능한 무료 대안 확인",
    "followUp": "활동기 종료: 실제 참석·역할 이행을 바탕으로 관계 형성 후보",
    "cancelWhen": [
      "source-context-ended",
      "participant-unavailable",
      "required-fact-expired"
    ],
    "source": {
      "file": "docs/design/LIFE-EVENTS-100.json",
      "evidenceLevel": "fictional-scenario"
    },
    "stateDependencies": [
      "dailyLife.activities",
      "current-access-and-time"
    ],
    "probabilityKind": "game-tuning-not-statistics",
    "ready": true,
    "scenarioProfile": true,
    "implementationStatus": "implemented-conditional-scenario"
  },
  {
    "id": "LIFE-075",
    "domain": "leisure",
    "years": [
      1990,
      2026
    ],
    "ages": [
      15,
      90
    ],
    "title": "갖고 싶던 물건이 나왔다",
    "text": "원하던 물건을 찾았지만 보관 공간과 생활비가 걸린다.",
    "eligibility": "현재 수집·장비 취미; 구매 후보·보관 공간 있음",
    "requires": [
      "scenario.LIFE-075.ready"
    ],
    "cooldownYears": 4,
    "choices": [
      {
        "id": "a",
        "label": "예산 안에서 구매",
        "text": "물건·현금 변화",
        "personality": {
          "weights": {
            "N": 0.3,
            "P": 0.3
          },
          "rationale": "새 방법 탐색 0.3 · 상황에 맞춘 유연한 조정 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-075.a",
          "actionId": "scenario.LIFE-075.a",
          "status": "specification-only"
        },
        "effect": {
          "description": "물건·현금 변화",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "다음 정리 시점: 실제 사용·공간 부담에 따라 유지·처분 선택",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      },
      {
        "id": "b",
        "label": "기존 물건 처분 후 검토",
        "text": "거래 대기",
        "personality": {
          "weights": {
            "T": 0.4,
            "J": 0.4
          },
          "rationale": "명시적인 조건·비용 비교 0.4 · 미리 정하는 일정·경계 0.4",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-075.b",
          "actionId": "scenario.LIFE-075.b",
          "status": "specification-only"
        },
        "effect": {
          "description": "거래 대기",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "다음 정리 시점: 실제 사용·공간 부담에 따라 유지·처분 선택",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      },
      {
        "id": "c",
        "label": "구매 보류",
        "text": "관심만 기록",
        "personality": {
          "weights": {
            "J": 0.3
          },
          "rationale": "미리 정하는 일정·경계 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-075.c",
          "actionId": "scenario.LIFE-075.c",
          "status": "specification-only"
        },
        "effect": {
          "description": "관심만 기록",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "다음 정리 시점: 실제 사용·공간 부담에 따라 유지·처분 선택",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      }
    ],
    "guard": "희소품이라고 자동 시세 상승 금지; 물건 발견률은 통계로 표시하지 않음",
    "followUp": "다음 정리 시점: 실제 사용·공간 부담에 따라 유지·처분 선택",
    "cancelWhen": [
      "source-context-ended",
      "participant-unavailable",
      "required-fact-expired"
    ],
    "source": {
      "file": "docs/design/LIFE-EVENTS-100.json",
      "evidenceLevel": "fictional-scenario"
    },
    "stateDependencies": [
      "dailyLife.activities",
      "current-access-and-time"
    ],
    "probabilityKind": "game-tuning-not-statistics",
    "ready": false,
    "implementationStatus": "deferred-state-or-policy-verification",
    "deferredReason": "원본 조건(현재 수집·장비 취미; 구매 후보·보관 공간 있음)을 만족하는 실제 상태·제도·당사자 입력과 실행 처리가 아직 연결되지 않음. 과거 인물·소유물·진단·공식 통지를 소급 생성하지 않음."
  },
  {
    "id": "LIFE-076",
    "domain": "leisure",
    "years": [
      2000,
      2026
    ],
    "ages": [
      18,
      80
    ],
    "title": "같이 가려니 날짜가 안 맞는다",
    "text": "서로 가능한 휴가와 지출 한도가 다르다.",
    "eligibility": "여행 계획·동행인 동의; 휴가·예산 조건 있음",
    "requires": [
      "scenario.LIFE-076.ready"
    ],
    "cooldownYears": 4,
    "choices": [
      {
        "id": "a",
        "label": "가까운 당일 일정",
        "text": "합의 후 예약",
        "personality": {
          "weights": {
            "F": 0.3,
            "P": 0.3
          },
          "rationale": "상대의 의사·관계 우선 0.3 · 상황에 맞춘 유연한 조정 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-076.a",
          "actionId": "scenario.LIFE-076.a",
          "status": "specification-only"
        },
        "effect": {
          "description": "합의 후 예약",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "출발일: 실제 휴가 승인·예약·동행 여부 확인; 다녀온 장면만 공유 기억",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      },
      {
        "id": "b",
        "label": "각자 일정 존중",
        "text": "별도 여행",
        "personality": {
          "weights": {
            "I": 0.3,
            "P": 0.3
          },
          "rationale": "혼자 정리할 시간 0.3 · 상황에 맞춘 유연한 조정 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-076.b",
          "actionId": "scenario.LIFE-076.b",
          "status": "specification-only"
        },
        "effect": {
          "description": "별도 여행",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "출발일: 실제 휴가 승인·예약·동행 여부 확인; 다녀온 장면만 공유 기억",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      },
      {
        "id": "c",
        "label": "일정 연기",
        "text": "예약 전 비용 없음",
        "personality": {
          "weights": {
            "J": 0.4
          },
          "rationale": "미리 정하는 일정·경계 0.4",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-076.c",
          "actionId": "scenario.LIFE-076.c",
          "status": "specification-only"
        },
        "effect": {
          "description": "예약 전 비용 없음",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "출발일: 실제 휴가 승인·예약·동행 여부 확인; 다녀온 장면만 공유 기억",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      }
    ],
    "guard": "연기만으로 위약금 생성 금지; 여행이 관계 개선 보장하지 않음",
    "followUp": "출발일: 실제 휴가 승인·예약·동행 여부 확인; 다녀온 장면만 공유 기억",
    "cancelWhen": [
      "source-context-ended",
      "participant-unavailable",
      "required-fact-expired"
    ],
    "source": {
      "file": "docs/design/LIFE-EVENTS-100.json",
      "evidenceLevel": "fictional-scenario"
    },
    "stateDependencies": [
      "dailyLife.activities",
      "current-access-and-time"
    ],
    "probabilityKind": "game-tuning-not-statistics",
    "ready": false,
    "implementationStatus": "deferred-state-or-policy-verification",
    "deferredReason": "원본 조건(여행 계획·동행인 동의; 휴가·예산 조건 있음)을 만족하는 실제 상태·제도·당사자 입력과 실행 처리가 아직 연결되지 않음. 과거 인물·소유물·진단·공식 통지를 소급 생성하지 않음."
  },
  {
    "id": "LIFE-077",
    "domain": "leisure",
    "years": [
      2000,
      2026
    ],
    "ages": [
      10,
      90
    ],
    "title": "오늘도 한 판만 더",
    "text": "취미 시간이 길어져 정해 둔 다른 일과 겹친다.",
    "ready": true,
    "requires": [
      "routine.media-active",
      "routine.repeated-schedule-conflict"
    ],
    "eligibility": "게임·미디어 루틴; 실제 약속이나 수면과 반복 충돌",
    "choices": [
      {
        "id": "a",
        "label": "종료시간 정하기",
        "text": "자기 규칙",
        "personality": {
          "weights": {
            "J": 0.5
          },
          "rationale": "미리 정하는 일정·경계 0.5",
          "authored": true
        },
        "operation": {
          "id": "set-media-end-time",
          "status": "implemented",
          "requiresConsent": false,
          "ledger": "only-confirmed-once",
          "charge": "verified-amount-only",
          "result": "confirmed-response-only",
          "actionId": "set-media-end-time",
          "requiredInputs": [
            "confirmed-source-facts",
            "current-context",
            "unique-operation-id",
            "effective-year"
          ]
        },
        "effect": {
          "description": "자기 규칙",
          "applyAutomatically": true
        },
        "followUp": {
          "afterYears": 1,
          "description": "다음 기간: 실제 규칙 이행과 약속 참석을 기준으로 루틴 조정 실제 일정이 1년 안에 끝나면 같은 연도 기록에서 처리하고 다음 연도에는 이행 여부만 재확인한다.",
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-facts-invalid",
            "participant-unavailable",
            "context-changed"
          ],
          "automaticSuccess": false,
          "duePolicy": "next-annual-review-after-recorded-deadline"
        },
        "requires": []
      },
      {
        "id": "b",
        "label": "약속 뒤로 취미 이동",
        "text": "일정 조정",
        "personality": {
          "weights": {
            "P": 0.3
          },
          "rationale": "상황에 맞춘 유연한 조정 0.3",
          "authored": true
        },
        "operation": {
          "id": "move-media-after-commitment",
          "status": "implemented",
          "requiresConsent": true,
          "ledger": "only-confirmed-once",
          "charge": "verified-amount-only",
          "result": "confirmed-response-only",
          "actionId": "move-media-after-commitment",
          "requiredInputs": [
            "confirmed-source-facts",
            "current-context",
            "unique-operation-id",
            "effective-year"
          ]
        },
        "effect": {
          "description": "일정 조정",
          "applyAutomatically": true
        },
        "followUp": {
          "afterYears": 1,
          "description": "다음 기간: 실제 규칙 이행과 약속 참석을 기준으로 루틴 조정 실제 일정이 1년 안에 끝나면 같은 연도 기록에서 처리하고 다음 연도에는 이행 여부만 재확인한다.",
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-facts-invalid",
            "participant-unavailable",
            "context-changed"
          ],
          "automaticSuccess": false,
          "duePolicy": "next-annual-review-after-recorded-deadline"
        },
        "requires": [
          "schedule.media-after-commitment-feasible"
        ]
      },
      {
        "id": "c",
        "label": "함께할 방식 문의",
        "text": "상대 동의 시 공동 활동",
        "personality": {
          "weights": {
            "E": 0.3,
            "F": 0.3
          },
          "rationale": "직접 교류하는 방식 0.3 · 상대의 의사·관계 우선 0.3",
          "authored": true
        },
        "operation": {
          "id": "request-shared-activity",
          "status": "specification-only",
          "requiresConsent": true,
          "ledger": "only-confirmed-once",
          "charge": "verified-amount-only",
          "result": "confirmed-response-only",
          "actionId": "request-shared-activity",
          "requiredInputs": [
            "confirmed-source-facts",
            "current-context",
            "unique-operation-id",
            "effective-year"
          ]
        },
        "effect": {
          "description": "상대 동의 시 공동 활동",
          "applyAutomatically": false
        },
        "followUp": {
          "afterYears": 1,
          "description": "다음 기간: 실제 규칙 이행과 약속 참석을 기준으로 루틴 조정 실제 일정이 1년 안에 끝나면 같은 연도 기록에서 처리하고 다음 연도에는 이행 여부만 재확인한다.",
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-facts-invalid",
            "participant-unavailable",
            "context-changed"
          ],
          "automaticSuccess": false,
          "duePolicy": "next-annual-review-after-recorded-deadline"
        },
        "requires": [
          "social.existing-counterparty",
          "activity.sharing-feasible"
        ]
      }
    ],
    "cancelWhen": [
      "required-fact-missing-or-expired",
      "source-context-ended",
      "actor-or-counterparty-no-longer-eligible"
    ],
    "guard": "게임 이용만으로 중독·사회성 하락 판정 금지; 취미를 노동 보상으로만 취급하지 않음",
    "followUp": "다음 기간: 실제 규칙 이행과 약속 참석을 기준으로 루틴 조정",
    "source": {
      "file": "docs/design/LIFE-EVENTS-100.json",
      "evidenceLevel": "fictional-scenario"
    },
    "cooldownYears": 3,
    "stateDependencies": [
      "dailyLife.activities",
      "current-access-and-time"
    ],
    "probabilityKind": "game-tuning-not-statistics",
    "implementationStatus": "implemented-confirmed-facts"
  },
  {
    "id": "LIFE-078",
    "domain": "leisure",
    "years": [
      2010,
      2026
    ],
    "ages": [
      18,
      90
    ],
    "title": "만든 것을 밖에 내놓는 날",
    "text": "작은 행사에서 작품을 보여 달라는 제안이 왔다.",
    "eligibility": "수선·제작 취미의 실제 반복 이력; 소규모 전시·장터 초대",
    "requires": [
      "scenario.LIFE-078.ready"
    ],
    "cooldownYears": 4,
    "choices": [
      {
        "id": "a",
        "label": "전시 참여",
        "text": "준비·참가비·시간",
        "personality": {
          "weights": {
            "E": 0.3,
            "N": 0.3
          },
          "rationale": "직접 교류하는 방식 0.3 · 새 방법 탐색 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-078.a",
          "actionId": "scenario.LIFE-078.a",
          "status": "specification-only"
        },
        "effect": {
          "description": "준비·참가비·시간",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "행사 뒤: 실제 관람객 반응·거래만 기록; 유급 의뢰는 별도 요청·수락 필요",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      },
      {
        "id": "b",
        "label": "판매 조건 확인",
        "text": "가격·정산 후보",
        "personality": {
          "weights": {
            "T": 0.3,
            "J": 0.3
          },
          "rationale": "명시적인 조건·비용 비교 0.3 · 미리 정하는 일정·경계 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-078.b",
          "actionId": "scenario.LIFE-078.b",
          "status": "specification-only"
        },
        "effect": {
          "description": "가격·정산 후보",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "행사 뒤: 실제 관람객 반응·거래만 기록; 유급 의뢰는 별도 요청·수락 필요",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      },
      {
        "id": "c",
        "label": "이번엔 관람만",
        "text": "입장·이동 비용",
        "personality": {
          "weights": {
            "I": 0.3,
            "P": 0.3
          },
          "rationale": "혼자 정리할 시간 0.3 · 상황에 맞춘 유연한 조정 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-078.c",
          "actionId": "scenario.LIFE-078.c",
          "status": "specification-only"
        },
        "effect": {
          "description": "입장·이동 비용",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "행사 뒤: 실제 관람객 반응·거래만 기록; 유급 의뢰는 별도 요청·수락 필요",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      }
    ],
    "guard": "처음 시작한 취미에 전문가 의뢰 금지; 노출만으로 유명세·수익 확정 금지",
    "followUp": "행사 뒤: 실제 관람객 반응·거래만 기록; 유급 의뢰는 별도 요청·수락 필요",
    "cancelWhen": [
      "source-context-ended",
      "participant-unavailable",
      "required-fact-expired"
    ],
    "source": {
      "file": "docs/design/LIFE-EVENTS-100.json",
      "evidenceLevel": "fictional-scenario"
    },
    "stateDependencies": [
      "dailyLife.activities",
      "current-access-and-time"
    ],
    "probabilityKind": "game-tuning-not-statistics",
    "ready": false,
    "implementationStatus": "deferred-state-or-policy-verification",
    "deferredReason": "원본 조건(수선·제작 취미의 실제 반복 이력; 소규모 전시·장터 초대)을 만족하는 실제 상태·제도·당사자 입력과 실행 처리가 아직 연결되지 않음. 과거 인물·소유물·진단·공식 통지를 소급 생성하지 않음."
  },
  {
    "id": "LIFE-079",
    "domain": "leisure",
    "years": [
      2010,
      2026
    ],
    "ages": [
      18,
      90
    ],
    "title": "주말마다 돌볼 작은 자리",
    "text": "텃밭 자리가 났지만 한동안 물주기와 관리가 필요하다.",
    "eligibility": "공용 텃밭·공간 접근; 실제 참여 자리·관리 일정 있음",
    "requires": [
      "scenario.LIFE-079.ready"
    ],
    "cooldownYears": 4,
    "choices": [
      {
        "id": "a",
        "label": "참여",
        "text": "확정 비용·관리시간",
        "personality": {
          "weights": {
            "J": 0.4
          },
          "rationale": "미리 정하는 일정·경계 0.4",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-079.a",
          "actionId": "scenario.LIFE-079.a",
          "status": "implemented",
          "kind": "request",
          "minutes": 20,
          "cost": 3,
          "record": "garden-participation"
        },
        "effect": {
          "description": "확정 비용·관리시간",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "수확기: 실제 관리·환경 결과로 수확 여부 기록; 소비한 만큼만 식재료 대체",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "확정 비용·관리시간 · 장면 시간 20분 · 3만 원 · 승인 뒤 실행 때만 지출 · 승인·거절은 다음 해 현재 여건으로 재확인"
      },
      {
        "id": "b",
        "label": "공동 관리 협의",
        "text": "동의한 역할",
        "personality": {
          "weights": {
            "E": 0.2,
            "F": 0.3
          },
          "rationale": "직접 교류하는 방식 0.2 · 상대의 의사·관계 우선 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-079.b",
          "actionId": "scenario.LIFE-079.b",
          "status": "implemented",
          "kind": "request",
          "minutes": 15,
          "cost": 0
        },
        "effect": {
          "description": "동의한 역할",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "수확기: 실제 관리·환경 결과로 수확 여부 기록; 소비한 만큼만 식재료 대체",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "동의한 역할 · 장면 시간 15분 · 추가 비용 없음 · 승인·거절은 다음 해 현재 여건으로 재확인"
      },
      {
        "id": "c",
        "label": "구경·교육만",
        "text": "가능한 참여시간",
        "personality": {
          "weights": {
            "N": 0.3,
            "P": 0.3
          },
          "rationale": "새 방법 탐색 0.3 · 상황에 맞춘 유연한 조정 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-079.c",
          "actionId": "scenario.LIFE-079.c",
          "status": "implemented",
          "kind": "practice",
          "minutes": 20,
          "cost": 0
        },
        "effect": {
          "description": "가능한 참여시간",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "수확기: 실제 관리·환경 결과로 수확 여부 기록; 소비한 만큼만 식재료 대체",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "가능한 참여시간 · 장면 시간 20분 · 추가 비용 없음"
      }
    ],
    "guard": "자급자족으로 식비 전액 삭제 금지; 기후·공간 없는 곳에 강제 발생 금지",
    "followUp": "수확기: 실제 관리·환경 결과로 수확 여부 기록; 소비한 만큼만 식재료 대체",
    "cancelWhen": [
      "source-context-ended",
      "participant-unavailable",
      "required-fact-expired"
    ],
    "source": {
      "file": "docs/design/LIFE-EVENTS-100.json",
      "evidenceLevel": "fictional-scenario"
    },
    "stateDependencies": [
      "dailyLife.activities",
      "current-access-and-time"
    ],
    "probabilityKind": "game-tuning-not-statistics",
    "ready": true,
    "scenarioProfile": true,
    "implementationStatus": "implemented-conditional-scenario"
  },
  {
    "id": "LIFE-080",
    "domain": "leisure",
    "years": [
      1960,
      2026
    ],
    "ages": [
      12,
      95
    ],
    "title": "다시 꺼낸 오래된 취미",
    "text": "한동안 못 하던 일을 다시 할 틈이 조금 생겼다.",
    "ready": true,
    "requires": [
      "routine.hobby-paused-history",
      "access.hobby-available",
      "schedule.new-available-time"
    ],
    "eligibility": "기존 취미 중단 기록; 현재 접근성·여유시간 변화",
    "choices": [
      {
        "id": "a",
        "label": "짧게 재개",
        "text": "실제 시간 배정",
        "personality": {
          "weights": {
            "P": 0.4
          },
          "rationale": "상황에 맞춘 유연한 조정 0.4",
          "authored": true
        },
        "operation": {
          "id": "resume-short-hobby-session",
          "status": "implemented",
          "requiresConsent": false,
          "ledger": "only-confirmed-once",
          "charge": "verified-amount-only",
          "result": "confirmed-response-only",
          "actionId": "resume-short-hobby-session",
          "requiredInputs": [
            "confirmed-source-facts",
            "current-context",
            "unique-operation-id",
            "effective-year"
          ]
        },
        "effect": {
          "description": "실제 시간 배정",
          "applyAutomatically": true
        },
        "followUp": {
          "afterYears": 1,
          "description": "다음 해: 실제 지속 여부로 재개·다시 중단 상태 기록 실제 일정이 1년 안에 끝나면 같은 연도 기록에서 처리하고 다음 연도에는 이행 여부만 재확인한다.",
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-facts-invalid",
            "participant-unavailable",
            "context-changed"
          ],
          "automaticSuccess": false,
          "duePolicy": "next-annual-review-after-recorded-deadline"
        },
        "requires": [
          "schedule.hobby-time-feasible"
        ]
      },
      {
        "id": "b",
        "label": "친구에게 함께 제안",
        "text": "동의 시 약속",
        "personality": {
          "weights": {
            "E": 0.2,
            "F": 0.3
          },
          "rationale": "직접 교류하는 방식 0.2 · 상대의 의사·관계 우선 0.3",
          "authored": true
        },
        "operation": {
          "id": "invite-existing-friend-to-hobby",
          "status": "specification-only",
          "requiresConsent": true,
          "ledger": "only-confirmed-once",
          "charge": "verified-amount-only",
          "result": "confirmed-response-only",
          "actionId": "invite-existing-friend-to-hobby",
          "requiredInputs": [
            "confirmed-source-facts",
            "current-context",
            "unique-operation-id",
            "effective-year"
          ]
        },
        "effect": {
          "description": "동의 시 약속",
          "applyAutomatically": false
        },
        "followUp": {
          "afterYears": 1,
          "description": "다음 해: 실제 지속 여부로 재개·다시 중단 상태 기록 실제 일정이 1년 안에 끝나면 같은 연도 기록에서 처리하고 다음 연도에는 이행 여부만 재확인한다.",
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-facts-invalid",
            "participant-unavailable",
            "context-changed"
          ],
          "automaticSuccess": false,
          "duePolicy": "next-annual-review-after-recorded-deadline"
        },
        "requires": [
          "social.existing-friend",
          "social.friend-contact-channel"
        ]
      },
      {
        "id": "c",
        "label": "지금은 보류",
        "text": "중단 상태 유지",
        "personality": {
          "weights": {
            "J": 0.3
          },
          "rationale": "미리 정하는 일정·경계 0.3",
          "authored": true
        },
        "operation": {
          "id": "keep-hobby-paused",
          "status": "implemented",
          "requiresConsent": false,
          "ledger": "only-confirmed-once",
          "charge": "verified-amount-only",
          "result": "confirmed-response-only",
          "actionId": "keep-hobby-paused",
          "requiredInputs": [
            "confirmed-source-facts",
            "current-context",
            "unique-operation-id",
            "effective-year"
          ]
        },
        "effect": {
          "description": "중단 상태 유지",
          "applyAutomatically": true
        },
        "followUp": {
          "afterYears": 1,
          "description": "다음 해: 실제 지속 여부로 재개·다시 중단 상태 기록 실제 일정이 1년 안에 끝나면 같은 연도 기록에서 처리하고 다음 연도에는 이행 여부만 재확인한다.",
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-facts-invalid",
            "participant-unavailable",
            "context-changed"
          ],
          "automaticSuccess": false,
          "duePolicy": "next-annual-review-after-recorded-deadline"
        },
        "requires": []
      }
    ],
    "cancelWhen": [
      "required-fact-missing-or-expired",
      "source-context-ended",
      "actor-or-counterparty-no-longer-eligible"
    ],
    "guard": "과거 취미 이력이 없는 인물에게 추억 소급 생성 금지; 취미로 우울 완치 서술 금지",
    "followUp": "다음 해: 실제 지속 여부로 재개·다시 중단 상태 기록",
    "source": {
      "file": "docs/design/LIFE-EVENTS-100.json",
      "evidenceLevel": "fictional-scenario"
    },
    "cooldownYears": 3,
    "stateDependencies": [
      "dailyLife.activities",
      "current-access-and-time"
    ],
    "probabilityKind": "game-tuning-not-statistics",
    "implementationStatus": "implemented-confirmed-facts"
  },
  {
    "id": "LIFE-081",
    "domain": "digital",
    "years": [
      1980,
      1999
    ],
    "ages": [
      15,
      80
    ],
    "title": "집 전화가 오래 통화 중이다",
    "text": "연락을 기다리는 사람과 오래 이야기하고 싶은 사람이 겹쳤다.",
    "eligibility": "가구 전화 설치·이용 가능; 전화요금·가족 사용 충돌",
    "requires": [
      "scenario.LIFE-081.ready"
    ],
    "cooldownYears": 4,
    "choices": [
      {
        "id": "a",
        "label": "시간 나누기",
        "text": "가구 합의",
        "personality": {
          "weights": {
            "F": 0.3,
            "J": 0.3
          },
          "rationale": "상대의 의사·관계 우선 0.3 · 미리 정하는 일정·경계 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-081.a",
          "actionId": "scenario.LIFE-081.a",
          "status": "implemented",
          "kind": "request",
          "minutes": 15,
          "cost": 0
        },
        "effect": {
          "description": "가구 합의",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "다음 청구: 실제 요금·합의 이행으로 사용 규칙 재논의",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "가구 합의 · 장면 시간 15분 · 추가 비용 없음 · 승인·거절은 다음 해 현재 여건으로 재확인"
      },
      {
        "id": "b",
        "label": "정해진 시간 다시 통화",
        "text": "약속 변경",
        "personality": {
          "weights": {
            "J": 0.4
          },
          "rationale": "미리 정하는 일정·경계 0.4",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-081.b",
          "actionId": "scenario.LIFE-081.b",
          "status": "implemented",
          "kind": "rule",
          "minutes": 10,
          "cost": 0,
          "record": "phone-time-rescheduled"
        },
        "effect": {
          "description": "약속 변경",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "다음 청구: 실제 요금·합의 이행으로 사용 규칙 재논의",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "약속 변경 · 장면 시간 10분 · 추가 비용 없음"
      },
      {
        "id": "c",
        "label": "가능한 외부 전화 이용",
        "text": "실제 비용·이동",
        "personality": {
          "weights": {
            "P": 0.3
          },
          "rationale": "상황에 맞춘 유연한 조정 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-081.c",
          "actionId": "scenario.LIFE-081.c",
          "status": "implemented",
          "kind": "expense",
          "minutes": 25,
          "cost": 0.1,
          "record": "external-phone-used"
        },
        "effect": {
          "description": "실제 비용·이동",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "다음 청구: 실제 요금·합의 이행으로 사용 규칙 재논의",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "실제 비용·이동 · 장면 시간 25분 · 0.1만 원 · 이번 선택에서 지출"
      }
    ],
    "guard": "전화 없는 집·시대에 금지; 통신비를 가구와 개인에 이중 차감 금지",
    "followUp": "다음 청구: 실제 요금·합의 이행으로 사용 규칙 재논의",
    "cancelWhen": [
      "source-context-ended",
      "participant-unavailable",
      "required-fact-expired"
    ],
    "source": {
      "file": "docs/design/LIFE-EVENTS-100.json",
      "evidenceLevel": "fictional-scenario"
    },
    "stateDependencies": [
      "dailyLife.activities",
      "actual-account-or-current-service-access"
    ],
    "probabilityKind": "game-tuning-not-statistics",
    "ready": true,
    "scenarioProfile": true,
    "implementationStatus": "implemented-conditional-scenario"
  },
  {
    "id": "LIFE-082",
    "domain": "digital",
    "years": [
      1995,
      2005
    ],
    "ages": [
      15,
      65
    ],
    "title": "인터넷을 쓰려면 어디로 갈까",
    "text": "필요한 정보를 찾으려면 접속할 장소와 시간을 정해야 한다.",
    "eligibility": "인터넷 이용시설·회선 접근; 학교·일 관련 필요 기록",
    "requires": [
      "scenario.LIFE-082.ready"
    ],
    "cooldownYears": 4,
    "choices": [
      {
        "id": "a",
        "label": "공용 시설 이용",
        "text": "실제 이용시간·비용",
        "personality": {
          "weights": {
            "N": 0.4,
            "P": 0.3
          },
          "rationale": "새 방법 탐색 0.4 · 상황에 맞춘 유연한 조정 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-082.a",
          "actionId": "scenario.LIFE-082.a",
          "status": "implemented",
          "kind": "expense",
          "minutes": 30,
          "cost": 0.3,
          "record": "public-internet-used",
          "needs": "public-internet"
        },
        "effect": {
          "description": "실제 이용시간·비용",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "정보 확인 뒤: 실제 지원·예약으로 이어질 때만 후속 일정 생성",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "실제 이용시간·비용 · 장면 시간 30분 · 0.3만 원 · 이번 선택에서 지출"
      },
      {
        "id": "b",
        "label": "가정 회선 견적",
        "text": "설치 승인 전 지출 없음",
        "personality": {
          "weights": {
            "N": 0.3,
            "J": 0.3
          },
          "rationale": "새 방법 탐색 0.3 · 미리 정하는 일정·경계 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-082.b",
          "actionId": "scenario.LIFE-082.b",
          "status": "implemented",
          "kind": "record",
          "minutes": 20,
          "cost": 0
        },
        "effect": {
          "description": "설치 승인 전 지출 없음",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "정보 확인 뒤: 실제 지원·예약으로 이어질 때만 후속 일정 생성",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "설치 승인 전 지출 없음 · 장면 시간 20분 · 추가 비용 없음"
      },
      {
        "id": "c",
        "label": "가능한 오프라인 문의",
        "text": "이동·대기시간",
        "personality": {
          "weights": {
            "S": 0.3,
            "J": 0.3
          },
          "rationale": "익숙하고 구체적인 수단 0.3 · 미리 정하는 일정·경계 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-082.c",
          "actionId": "scenario.LIFE-082.c",
          "status": "implemented",
          "kind": "help",
          "minutes": 30,
          "cost": 0
        },
        "effect": {
          "description": "이동·대기시간",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "정보 확인 뒤: 실제 지원·예약으로 이어질 때만 후속 일정 생성",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "이동·대기시간 · 장면 시간 30분 · 추가 비용 없음"
      }
    ],
    "guard": "접속 가능 지역·기관 확인; 검색 한 번으로 자격·취업 부여 금지",
    "followUp": "정보 확인 뒤: 실제 지원·예약으로 이어질 때만 후속 일정 생성",
    "cancelWhen": [
      "source-context-ended",
      "participant-unavailable",
      "required-fact-expired"
    ],
    "source": {
      "file": "docs/design/LIFE-EVENTS-100.json",
      "evidenceLevel": "fictional-scenario"
    },
    "stateDependencies": [
      "dailyLife.activities",
      "actual-account-or-current-service-access"
    ],
    "probabilityKind": "game-tuning-not-statistics",
    "ready": true,
    "scenarioProfile": true,
    "implementationStatus": "implemented-conditional-scenario"
  },
  {
    "id": "LIFE-083",
    "domain": "digital",
    "years": [
      2000,
      2026
    ],
    "ages": [
      18,
      85
    ],
    "title": "요금제보다 사용량이 적다",
    "text": "지난 청구서를 보니 쓰지 않는 서비스가 붙어 있다.",
    "eligibility": "휴대전화 보유·실제 요금제와 사용내역 있음",
    "requires": [
      "scenario.LIFE-083.ready"
    ],
    "cooldownYears": 4,
    "choices": [
      {
        "id": "a",
        "label": "내역 확인 후 변경",
        "text": "효력일 비용 조정",
        "personality": {
          "weights": {
            "J": 0.4
          },
          "rationale": "미리 정하는 일정·경계 0.4",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-083.a",
          "actionId": "scenario.LIFE-083.a",
          "status": "implemented",
          "kind": "request",
          "minutes": 15,
          "cost": 0,
          "record": "phone-plan-change"
        },
        "effect": {
          "description": "효력일 비용 조정",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "다음 청구: 실제 할인·위약·부가서비스 해지 반영",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "효력일 비용 조정 · 장면 시간 15분 · 추가 비용 없음 · 승인·거절은 다음 해 현재 여건으로 재확인"
      },
      {
        "id": "b",
        "label": "현 요금 유지",
        "text": "기존 접근",
        "personality": {
          "weights": {
            "S": 0.3,
            "J": 0.3
          },
          "rationale": "익숙하고 구체적인 수단 0.3 · 미리 정하는 일정·경계 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-083.b",
          "actionId": "scenario.LIFE-083.b",
          "status": "implemented",
          "kind": "hold",
          "minutes": 0,
          "cost": 0
        },
        "effect": {
          "description": "기존 접근",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "다음 청구: 실제 할인·위약·부가서비스 해지 반영",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "기존 접근 · 추가 시간 없음 · 추가 비용 없음"
      },
      {
        "id": "c",
        "label": "다른 계약 비교",
        "text": "가입 전 견적만",
        "personality": {
          "weights": {
            "N": 0.3,
            "P": 0.3
          },
          "rationale": "새 방법 탐색 0.3 · 상황에 맞춘 유연한 조정 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-083.c",
          "actionId": "scenario.LIFE-083.c",
          "status": "implemented",
          "kind": "record",
          "minutes": 20,
          "cost": 0
        },
        "effect": {
          "description": "가입 전 견적만",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "다음 청구: 실제 할인·위약·부가서비스 해지 반영",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "가입 전 견적만 · 장면 시간 20분 · 추가 비용 없음"
      }
    ],
    "guard": "예시 광고금액을 확정 요금으로 사용 금지; 약정 확인 전 절감 확정 금지",
    "followUp": "다음 청구: 실제 할인·위약·부가서비스 해지 반영",
    "cancelWhen": [
      "source-context-ended",
      "participant-unavailable",
      "required-fact-expired"
    ],
    "source": {
      "file": "docs/design/LIFE-EVENTS-100.json",
      "evidenceLevel": "fictional-scenario"
    },
    "stateDependencies": [
      "dailyLife.activities",
      "actual-account-or-current-service-access"
    ],
    "probabilityKind": "game-tuning-not-statistics",
    "ready": true,
    "scenarioProfile": true,
    "implementationStatus": "implemented-conditional-scenario"
  },
  {
    "id": "LIFE-084",
    "domain": "digital",
    "years": [
      2005,
      2026
    ],
    "ages": [
      18,
      90
    ],
    "title": "내가 하지 않은 접속 알림",
    "text": "최근 이용 중인 계정에 모르는 접속 알림이 왔다.",
    "eligibility": "현재 계정·서비스 사용; 낯선 로그인 알림 수신 사실",
    "requires": [
      "scenario.LIFE-084.ready"
    ],
    "cooldownYears": 4,
    "choices": [
      {
        "id": "a",
        "label": "공식 경로 확인",
        "text": "기록 조회",
        "personality": {
          "weights": {
            "T": 0.3,
            "J": 0.3
          },
          "rationale": "명시적인 조건·비용 비교 0.3 · 미리 정하는 일정·경계 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-084.a",
          "actionId": "scenario.LIFE-084.a",
          "status": "implemented",
          "kind": "record",
          "minutes": 15,
          "cost": 0
        },
        "effect": {
          "description": "기록 조회",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "확인 뒤: 실제 접근·차단·피해 기록이 있을 때만 복구·정산 연결",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "기록 조회 · 장면 시간 15분 · 추가 비용 없음"
      },
      {
        "id": "b",
        "label": "인증 수단 갱신",
        "text": "확인된 보안 설정",
        "personality": {
          "weights": {
            "J": 0.4
          },
          "rationale": "미리 정하는 일정·경계 0.4",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-084.b",
          "actionId": "scenario.LIFE-084.b",
          "status": "implemented",
          "kind": "rule",
          "minutes": 15,
          "cost": 0,
          "record": "account-authentication-updated"
        },
        "effect": {
          "description": "확인된 보안 설정",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "확인 뒤: 실제 접근·차단·피해 기록이 있을 때만 복구·정산 연결",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "확인된 보안 설정 · 장면 시간 15분 · 추가 비용 없음"
      },
      {
        "id": "c",
        "label": "도움 요청",
        "text": "동의한 지원시간",
        "personality": {
          "weights": {
            "E": 0.2,
            "F": 0.3
          },
          "rationale": "직접 교류하는 방식 0.2 · 상대의 의사·관계 우선 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-084.c",
          "actionId": "scenario.LIFE-084.c",
          "status": "implemented",
          "kind": "request",
          "minutes": 20,
          "cost": 0,
          "person": "parent-or-partner"
        },
        "effect": {
          "description": "동의한 지원시간",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "확인 뒤: 실제 접근·차단·피해 기록이 있을 때만 복구·정산 연결",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "동의한 지원시간 · 장면 시간 20분 · 추가 비용 없음 · 승인·거절은 다음 해 현재 여건으로 재확인"
      }
    ],
    "guard": "알림만으로 개인정보 유출·전액 손실 확정 금지; 구체 비밀정보 표시 없음",
    "followUp": "확인 뒤: 실제 접근·차단·피해 기록이 있을 때만 복구·정산 연결",
    "cancelWhen": [
      "source-context-ended",
      "participant-unavailable",
      "required-fact-expired"
    ],
    "source": {
      "file": "docs/design/LIFE-EVENTS-100.json",
      "evidenceLevel": "fictional-scenario"
    },
    "stateDependencies": [
      "dailyLife.activities",
      "actual-account-or-current-service-access"
    ],
    "probabilityKind": "game-tuning-not-statistics",
    "ready": true,
    "scenarioProfile": true,
    "implementationStatus": "implemented-conditional-scenario"
  },
  {
    "id": "LIFE-085",
    "domain": "digital",
    "years": [
      2010,
      2026
    ],
    "ages": [
      18,
      90
    ],
    "title": "급히 확인하라는 문자",
    "text": "문자에 낯선 주소와 서두르라는 말이 함께 적혀 있다.",
    "eligibility": "금융·택배 등을 사칭하는 미확인 메시지 수신; 해당 채널 접근",
    "requires": [
      "scenario.LIFE-085.ready"
    ],
    "cooldownYears": 4,
    "choices": [
      {
        "id": "a",
        "label": "공식 앱·대표 경로 확인",
        "text": "발신 검증",
        "personality": {
          "weights": {
            "J": 0.4,
            "T": 0.3
          },
          "rationale": "미리 정하는 일정·경계 0.4 · 명시적인 조건·비용 비교 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-085.a",
          "actionId": "scenario.LIFE-085.a",
          "status": "implemented",
          "kind": "record",
          "minutes": 15,
          "cost": 0
        },
        "effect": {
          "description": "발신 검증",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "검증 뒤: 실제 청구·배송 여부만 확정; 신고는 해당 경로 확인 후 기록",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "발신 검증 · 장면 시간 15분 · 추가 비용 없음"
      },
      {
        "id": "b",
        "label": "삭제·차단",
        "text": "연락 종료",
        "personality": {
          "weights": {
            "J": 0.3
          },
          "rationale": "미리 정하는 일정·경계 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-085.b",
          "actionId": "scenario.LIFE-085.b",
          "status": "implemented",
          "kind": "rule",
          "minutes": 5,
          "cost": 0,
          "record": "unverified-message-blocked"
        },
        "effect": {
          "description": "연락 종료",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "검증 뒤: 실제 청구·배송 여부만 확정; 신고는 해당 경로 확인 후 기록",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "연락 종료 · 장면 시간 5분 · 추가 비용 없음"
      },
      {
        "id": "c",
        "label": "믿는 사람에게 확인 요청",
        "text": "지원 접촉",
        "personality": {
          "weights": {
            "E": 0.2,
            "F": 0.3
          },
          "rationale": "직접 교류하는 방식 0.2 · 상대의 의사·관계 우선 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-085.c",
          "actionId": "scenario.LIFE-085.c",
          "status": "implemented",
          "kind": "request",
          "minutes": 15,
          "cost": 0,
          "person": "parent-or-partner"
        },
        "effect": {
          "description": "지원 접촉",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "검증 뒤: 실제 청구·배송 여부만 확정; 신고는 해당 경로 확인 후 기록",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "지원 접촉 · 장면 시간 15분 · 추가 비용 없음 · 승인·거절은 다음 해 현재 여건으로 재확인"
      }
    ],
    "guard": "누르지 않았는데 돈을 잃게 하지 않음; 사기 수법 실행 절차를 묘사하지 않음",
    "followUp": "검증 뒤: 실제 청구·배송 여부만 확정; 신고는 해당 경로 확인 후 기록",
    "cancelWhen": [
      "source-context-ended",
      "participant-unavailable",
      "required-fact-expired"
    ],
    "source": {
      "file": "docs/design/LIFE-EVENTS-100.json",
      "evidenceLevel": "fictional-scenario"
    },
    "stateDependencies": [
      "dailyLife.activities",
      "actual-account-or-current-service-access"
    ],
    "probabilityKind": "game-tuning-not-statistics",
    "ready": true,
    "scenarioProfile": true,
    "implementationStatus": "implemented-conditional-scenario"
  },
  {
    "id": "LIFE-086",
    "domain": "digital",
    "years": [
      2010,
      2026
    ],
    "ages": [
      18,
      90
    ],
    "title": "익숙한 창구 대신 화면이 놓였다",
    "text": "자주 쓰던 서비스의 이용 방식이 달라졌다.",
    "eligibility": "교통·은행·공공서비스 중 실제 온라인 전환 공지; 오프라인 대안 확인",
    "requires": [
      "scenario.LIFE-086.ready"
    ],
    "cooldownYears": 4,
    "choices": [
      {
        "id": "a",
        "label": "안내 받아 이용",
        "text": "실제 완료·소요시간",
        "personality": {
          "weights": {
            "N": 0.3,
            "P": 0.3
          },
          "rationale": "새 방법 탐색 0.3 · 상황에 맞춘 유연한 조정 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-086.a",
          "actionId": "scenario.LIFE-086.a",
          "status": "specification-only"
        },
        "effect": {
          "description": "실제 완료·소요시간",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "다음 이용: 실제 익숙해진 절차·접근 제약을 반영해 대기시간 조정 후보",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      },
      {
        "id": "b",
        "label": "가능한 대면 대안",
        "text": "이동·대기",
        "personality": {
          "weights": {
            "S": 0.3,
            "J": 0.3
          },
          "rationale": "익숙하고 구체적인 수단 0.3 · 미리 정하는 일정·경계 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-086.b",
          "actionId": "scenario.LIFE-086.b",
          "status": "specification-only"
        },
        "effect": {
          "description": "이동·대기",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "다음 이용: 실제 익숙해진 절차·접근 제약을 반영해 대기시간 조정 후보",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      },
      {
        "id": "c",
        "label": "도움 동행 요청",
        "text": "동의한 시간",
        "personality": {
          "weights": {
            "E": 0.2,
            "F": 0.3
          },
          "rationale": "직접 교류하는 방식 0.2 · 상대의 의사·관계 우선 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-086.c",
          "actionId": "scenario.LIFE-086.c",
          "status": "specification-only"
        },
        "effect": {
          "description": "동의한 시간",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "다음 이용: 실제 익숙해진 절차·접근 제약을 반영해 대기시간 조정 후보",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      }
    ],
    "guard": "나이만으로 디지털 무능 판정 금지; 존재하지 않는 창구 대안 노출 금지",
    "followUp": "다음 이용: 실제 익숙해진 절차·접근 제약을 반영해 대기시간 조정 후보",
    "cancelWhen": [
      "source-context-ended",
      "participant-unavailable",
      "required-fact-expired"
    ],
    "source": {
      "file": "docs/design/LIFE-EVENTS-100.json",
      "evidenceLevel": "fictional-scenario"
    },
    "stateDependencies": [
      "dailyLife.activities",
      "actual-account-or-current-service-access"
    ],
    "probabilityKind": "game-tuning-not-statistics",
    "ready": false,
    "implementationStatus": "deferred-state-or-policy-verification",
    "deferredReason": "원본 조건(교통·은행·공공서비스 중 실제 온라인 전환 공지; 오프라인 대안 확인)을 만족하는 실제 상태·제도·당사자 입력과 실행 처리가 아직 연결되지 않음. 과거 인물·소유물·진단·공식 통지를 소급 생성하지 않음."
  },
  {
    "id": "LIFE-087",
    "domain": "digital",
    "years": [
      2010,
      2026
    ],
    "ages": [
      13,
      85
    ],
    "title": "같이 찍힌 사진을 올리기 전에",
    "text": "사진 속 지인이 공개 범위를 묻는다.",
    "eligibility": "실제 사진·글 게시 활동; 등장 인물의 공개 동의 문제",
    "requires": [
      "scenario.LIFE-087.ready"
    ],
    "cooldownYears": 4,
    "choices": [
      {
        "id": "a",
        "label": "동의한 범위로 공개",
        "text": "게시 설정",
        "personality": {
          "weights": {
            "F": 0.4,
            "J": 0.3
          },
          "rationale": "상대의 의사·관계 우선 0.4 · 미리 정하는 일정·경계 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-087.a",
          "actionId": "scenario.LIFE-087.a",
          "status": "implemented",
          "kind": "request",
          "minutes": 15,
          "cost": 0,
          "record": "photo-sharing-consent"
        },
        "effect": {
          "description": "게시 설정",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "이후 확인: 실제 삭제·범위 변경 약속 이행을 신뢰 기억에 반영",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "게시 설정 · 장면 시간 15분 · 추가 비용 없음 · 승인·거절은 다음 해 현재 여건으로 재확인"
      },
      {
        "id": "b",
        "label": "개인 보관",
        "text": "비공개 기록",
        "personality": {
          "weights": {
            "I": 0.3,
            "J": 0.3
          },
          "rationale": "혼자 정리할 시간 0.3 · 미리 정하는 일정·경계 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-087.b",
          "actionId": "scenario.LIFE-087.b",
          "status": "implemented",
          "kind": "rule",
          "minutes": 5,
          "cost": 0,
          "record": "photo-kept-private"
        },
        "effect": {
          "description": "비공개 기록",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "이후 확인: 실제 삭제·범위 변경 약속 이행을 신뢰 기억에 반영",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "비공개 기록 · 장면 시간 5분 · 추가 비용 없음"
      },
      {
        "id": "c",
        "label": "당사자 확인 뒤 수정",
        "text": "승인 대기",
        "personality": {
          "weights": {
            "F": 0.3,
            "J": 0.3
          },
          "rationale": "상대의 의사·관계 우선 0.3 · 미리 정하는 일정·경계 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-087.c",
          "actionId": "scenario.LIFE-087.c",
          "status": "implemented",
          "kind": "request",
          "minutes": 15,
          "cost": 0,
          "record": "photo-edit-consent"
        },
        "effect": {
          "description": "승인 대기",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "이후 확인: 실제 삭제·범위 변경 약속 이행을 신뢰 기억에 반영",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "승인 대기 · 장면 시간 15분 · 추가 비용 없음 · 승인·거절은 다음 해 현재 여건으로 재확인"
      }
    ],
    "guard": "미게시 사진이 퍼졌다고 서술 금지; 동의 거절을 관계 악화로 자동 처리 금지",
    "followUp": "이후 확인: 실제 삭제·범위 변경 약속 이행을 신뢰 기억에 반영",
    "cancelWhen": [
      "source-context-ended",
      "participant-unavailable",
      "required-fact-expired"
    ],
    "source": {
      "file": "docs/design/LIFE-EVENTS-100.json",
      "evidenceLevel": "fictional-scenario"
    },
    "stateDependencies": [
      "dailyLife.activities",
      "actual-account-or-current-service-access"
    ],
    "probabilityKind": "game-tuning-not-statistics",
    "ready": true,
    "scenarioProfile": true,
    "implementationStatus": "implemented-conditional-scenario"
  },
  {
    "id": "LIFE-088",
    "domain": "digital",
    "years": [
      2015,
      2026
    ],
    "ages": [
      18,
      85
    ],
    "title": "편리함의 가격을 확인한 날",
    "text": "앱에서 본 금액과 결제 단계의 총액이 다르다.",
    "eligibility": "배달·예약 서비스 접근; 실제 수수료·거리·시간 후보 있음",
    "requires": [
      "scenario.LIFE-088.ready"
    ],
    "cooldownYears": 4,
    "choices": [
      {
        "id": "a",
        "label": "총액 수락",
        "text": "완료 결제액",
        "personality": {
          "weights": {
            "T": 0.4,
            "J": 0.3
          },
          "rationale": "명시적인 조건·비용 비교 0.4 · 미리 정하는 일정·경계 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-088.a",
          "actionId": "scenario.LIFE-088.a",
          "status": "implemented",
          "kind": "expense",
          "minutes": 10,
          "cost": 3,
          "record": "delivery-purchased"
        },
        "effect": {
          "description": "완료 결제액",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "다음 이용: 실제 선택과 만족을 생활 원칙 후보로 기록",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "완료 결제액 · 장면 시간 10분 · 3만 원 · 이번 선택에서 지출"
      },
      {
        "id": "b",
        "label": "직접 방문",
        "text": "이동시간·해당 구매비",
        "personality": {
          "weights": {
            "S": 0.3,
            "P": 0.3
          },
          "rationale": "익숙하고 구체적인 수단 0.3 · 상황에 맞춘 유연한 조정 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-088.b",
          "actionId": "scenario.LIFE-088.b",
          "status": "implemented",
          "kind": "expense",
          "minutes": 40,
          "cost": 2,
          "record": "in-person-purchased"
        },
        "effect": {
          "description": "이동시간·해당 구매비",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "다음 이용: 실제 선택과 만족을 생활 원칙 후보로 기록",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "이동시간·해당 구매비 · 장면 시간 40분 · 2만 원 · 이번 선택에서 지출"
      },
      {
        "id": "c",
        "label": "구매 보류",
        "text": "지출 없음",
        "personality": {
          "weights": {
            "P": 0.3
          },
          "rationale": "상황에 맞춘 유연한 조정 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-088.c",
          "actionId": "scenario.LIFE-088.c",
          "status": "implemented",
          "kind": "hold",
          "minutes": 0,
          "cost": 0
        },
        "effect": {
          "description": "지출 없음",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "다음 이용: 실제 선택과 만족을 생활 원칙 후보로 기록",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "지출 없음 · 추가 시간 없음 · 추가 비용 없음"
      }
    ],
    "guard": "사용 가능한 지역·업체만; 주문 전 취소를 매출 손실·위약금으로 처리 금지",
    "followUp": "다음 이용: 실제 선택과 만족을 생활 원칙 후보로 기록",
    "cancelWhen": [
      "source-context-ended",
      "participant-unavailable",
      "required-fact-expired"
    ],
    "source": {
      "file": "docs/design/LIFE-EVENTS-100.json",
      "evidenceLevel": "fictional-scenario"
    },
    "stateDependencies": [
      "dailyLife.activities",
      "actual-account-or-current-service-access"
    ],
    "probabilityKind": "game-tuning-not-statistics",
    "ready": true,
    "scenarioProfile": true,
    "implementationStatus": "implemented-conditional-scenario"
  },
  {
    "id": "LIFE-089",
    "domain": "digital",
    "years": [
      2020,
      2026
    ],
    "ages": [
      18,
      85
    ],
    "title": "새 도구로 서류를 만들라는데",
    "text": "직장이나 지원처에서 낯선 도구 사용을 요구한다.",
    "eligibility": "현재 업무·지원 과정에 디지털 도구 요구; 실제 교육·기기 접근",
    "requires": [
      "scenario.LIFE-089.ready"
    ],
    "cooldownYears": 4,
    "choices": [
      {
        "id": "a",
        "label": "공식 안내 학습",
        "text": "교육시간",
        "personality": {
          "weights": {
            "N": 0.3,
            "J": 0.3
          },
          "rationale": "새 방법 탐색 0.3 · 미리 정하는 일정·경계 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-089.a",
          "actionId": "scenario.LIFE-089.a",
          "status": "implemented",
          "kind": "practice",
          "minutes": 30,
          "cost": 0
        },
        "effect": {
          "description": "교육시간",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "제출 뒤: 실제 정확성·요건 충족 여부로 수정 요청; 능력 변화는 반복 학습 기록 참조",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "교육시간 · 장면 시간 30분 · 추가 비용 없음"
      },
      {
        "id": "b",
        "label": "가능한 기존 방식 문의",
        "text": "허용 시 대안",
        "personality": {
          "weights": {
            "P": 0.3
          },
          "rationale": "상황에 맞춘 유연한 조정 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-089.b",
          "actionId": "scenario.LIFE-089.b",
          "status": "implemented",
          "kind": "request",
          "minutes": 20,
          "cost": 0
        },
        "effect": {
          "description": "허용 시 대안",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "제출 뒤: 실제 정확성·요건 충족 여부로 수정 요청; 능력 변화는 반복 학습 기록 참조",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "허용 시 대안 · 장면 시간 20분 · 추가 비용 없음 · 승인·거절은 다음 해 현재 여건으로 재확인"
      },
      {
        "id": "c",
        "label": "동료 검토 요청",
        "text": "동의한 지원시간",
        "personality": {
          "weights": {
            "E": 0.2,
            "F": 0.3
          },
          "rationale": "직접 교류하는 방식 0.2 · 상대의 의사·관계 우선 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-089.c",
          "actionId": "scenario.LIFE-089.c",
          "status": "implemented",
          "kind": "request",
          "minutes": 20,
          "cost": 0
        },
        "effect": {
          "description": "동의한 지원시간",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "제출 뒤: 실제 정확성·요건 충족 여부로 수정 요청; 능력 변화는 반복 학습 기록 참조",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "동의한 지원시간 · 장면 시간 20분 · 추가 비용 없음 · 승인·거절은 다음 해 현재 여건으로 재확인"
      }
    ],
    "guard": "도구 사용만으로 생산성·합격 보장 금지; AI 출력은 사실 검증 없이 행정 결과로 사용 금지",
    "followUp": "제출 뒤: 실제 정확성·요건 충족 여부로 수정 요청; 능력 변화는 반복 학습 기록 참조",
    "cancelWhen": [
      "source-context-ended",
      "participant-unavailable",
      "required-fact-expired"
    ],
    "source": {
      "file": "docs/design/LIFE-EVENTS-100.json",
      "evidenceLevel": "fictional-scenario"
    },
    "stateDependencies": [
      "dailyLife.activities",
      "actual-account-or-current-service-access"
    ],
    "probabilityKind": "game-tuning-not-statistics",
    "ready": true,
    "scenarioProfile": true,
    "implementationStatus": "implemented-conditional-scenario"
  },
  {
    "id": "LIFE-090",
    "domain": "digital",
    "years": [
      1960,
      2026
    ],
    "ages": [
      15,
      95
    ],
    "title": "듣고 보니 확인할 일이 남았다",
    "text": "누군가 알려 준 제도나 일자리 소식이 내 조건에도 맞는지 궁금하다.",
    "eligibility": "중요한 소식 수신; 본인 일정·비용에 영향; 확인 경로 있음",
    "requires": [
      "scenario.LIFE-090.ready"
    ],
    "cooldownYears": 4,
    "choices": [
      {
        "id": "a",
        "label": "원문·담당처 확인",
        "text": "자격·시점 검증",
        "personality": {
          "weights": {
            "T": 0.3,
            "J": 0.3
          },
          "rationale": "명시적인 조건·비용 비교 0.3 · 미리 정하는 일정·경계 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-090.a",
          "actionId": "scenario.LIFE-090.a",
          "status": "specification-only"
        },
        "effect": {
          "description": "자격·시점 검증",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "확인 뒤: 실제 자격·모집·기간이 맞을 때만 신청·지원 후보 생성",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      },
      {
        "id": "b",
        "label": "확인 가능한 사람에게 문의",
        "text": "답변 기록",
        "personality": {
          "weights": {
            "E": 0.2,
            "F": 0.3
          },
          "rationale": "직접 교류하는 방식 0.2 · 상대의 의사·관계 우선 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-090.b",
          "actionId": "scenario.LIFE-090.b",
          "status": "specification-only"
        },
        "effect": {
          "description": "답변 기록",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "확인 뒤: 실제 자격·모집·기간이 맞을 때만 신청·지원 후보 생성",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      },
      {
        "id": "c",
        "label": "행동 보류",
        "text": "기존 상태 유지",
        "personality": {
          "weights": {
            "P": 0.3
          },
          "rationale": "상황에 맞춘 유연한 조정 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-090.c",
          "actionId": "scenario.LIFE-090.c",
          "status": "specification-only"
        },
        "effect": {
          "description": "기존 상태 유지",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "확인 뒤: 실제 자격·모집·기간이 맞을 때만 신청·지원 후보 생성",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      }
    ],
    "guard": "매체는 시대에 맞춰 변형; 소문만으로 지원금·취업·정치 의견 생성 금지",
    "followUp": "확인 뒤: 실제 자격·모집·기간이 맞을 때만 신청·지원 후보 생성",
    "cancelWhen": [
      "source-context-ended",
      "participant-unavailable",
      "required-fact-expired"
    ],
    "source": {
      "file": "docs/design/LIFE-EVENTS-100.json",
      "evidenceLevel": "fictional-scenario"
    },
    "stateDependencies": [
      "dailyLife.activities",
      "actual-account-or-current-service-access"
    ],
    "probabilityKind": "game-tuning-not-statistics",
    "ready": false,
    "implementationStatus": "deferred-state-or-policy-verification",
    "deferredReason": "원본 조건(중요한 소식 수신; 본인 일정·비용에 영향; 확인 경로 있음)을 만족하는 실제 상태·제도·당사자 입력과 실행 처리가 아직 연결되지 않음. 과거 인물·소유물·진단·공식 통지를 소급 생성하지 않음."
  },
  {
    "id": "LIFE-091",
    "domain": "community",
    "years": [
      1960,
      1989
    ],
    "ages": [
      18,
      80
    ],
    "title": "물을 받아 둘 시간을 나누기",
    "text": "공동 급수 시간이 바뀌어 집안 일정과 겹친다.",
    "eligibility": "실제 공동 수도·우물 이용; 지역 공급·사용시간 변경 확인",
    "requires": [
      "scenario.LIFE-091.ready"
    ],
    "cooldownYears": 4,
    "choices": [
      {
        "id": "a",
        "label": "동거인과 교대",
        "text": "동의한 시간",
        "personality": {
          "weights": {
            "J": 0.4
          },
          "rationale": "미리 정하는 일정·경계 0.4",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-091.a",
          "actionId": "scenario.LIFE-091.a",
          "status": "specification-only"
        },
        "effect": {
          "description": "동의한 시간",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "공급 정상화 또는 다음 기간: 실제 물 확보·수고를 기준으로 생활 루틴 복구",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      },
      {
        "id": "b",
        "label": "이웃과 운반 협의",
        "text": "합의한 역할",
        "personality": {
          "weights": {
            "E": 0.2,
            "F": 0.3
          },
          "rationale": "직접 교류하는 방식 0.2 · 상대의 의사·관계 우선 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-091.b",
          "actionId": "scenario.LIFE-091.b",
          "status": "specification-only"
        },
        "effect": {
          "description": "합의한 역할",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "공급 정상화 또는 다음 기간: 실제 물 확보·수고를 기준으로 생활 루틴 복구",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      },
      {
        "id": "c",
        "label": "가능한 다른 공급처 확인",
        "text": "이동·비용",
        "personality": {
          "weights": {
            "N": 0.3,
            "P": 0.3
          },
          "rationale": "새 방법 탐색 0.3 · 상황에 맞춘 유연한 조정 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-091.c",
          "actionId": "scenario.LIFE-091.c",
          "status": "specification-only"
        },
        "effect": {
          "description": "이동·비용",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "공급 정상화 또는 다음 기간: 실제 물 확보·수고를 기준으로 생활 루틴 복구",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      }
    ],
    "guard": "공동 급수 없는 지역 금지; 물 부족을 전염병 자동 발생으로 연결 금지",
    "followUp": "공급 정상화 또는 다음 기간: 실제 물 확보·수고를 기준으로 생활 루틴 복구",
    "cancelWhen": [
      "source-context-ended",
      "participant-unavailable",
      "required-fact-expired"
    ],
    "source": {
      "file": "docs/design/LIFE-EVENTS-100.json",
      "evidenceLevel": "fictional-scenario"
    },
    "stateDependencies": [
      "home",
      "current-local-notice-and-access"
    ],
    "probabilityKind": "game-tuning-not-statistics",
    "ready": false,
    "implementationStatus": "deferred-state-or-policy-verification",
    "deferredReason": "원본 조건(실제 공동 수도·우물 이용; 지역 공급·사용시간 변경 확인)을 만족하는 실제 상태·제도·당사자 입력과 실행 처리가 아직 연결되지 않음. 과거 인물·소유물·진단·공식 통지를 소급 생성하지 않음."
  },
  {
    "id": "LIFE-092",
    "domain": "community",
    "years": [
      1970,
      2026
    ],
    "ages": [
      18,
      90
    ],
    "title": "집 앞 길을 한동안 돌아가야 한다",
    "text": "공사 구간 때문에 늘 다니던 길을 쓸 수 없다.",
    "eligibility": "거주지 실제 공사 공지; 이동·영업·소음 영향 확인",
    "requires": [
      "scenario.LIFE-092.ready"
    ],
    "cooldownYears": 4,
    "choices": [
      {
        "id": "a",
        "label": "우회 경로",
        "text": "시간·비용",
        "personality": {
          "weights": {
            "P": 0.4
          },
          "rationale": "상황에 맞춘 유연한 조정 0.4",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-092.a",
          "actionId": "scenario.LIFE-092.a",
          "status": "implemented",
          "kind": "rule",
          "minutes": 20,
          "cost": 0,
          "record": "temporary-detour"
        },
        "effect": {
          "description": "시간·비용",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "공사 종료일: 실제 통행 가능 상태 확인 뒤 경로 복구; 지연 때만 재안내",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "시간·비용 · 장면 시간 20분 · 추가 비용 없음"
      },
      {
        "id": "b",
        "label": "공사 일정 문의",
        "text": "확인 정보",
        "personality": {
          "weights": {
            "J": 0.4
          },
          "rationale": "미리 정하는 일정·경계 0.4",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-092.b",
          "actionId": "scenario.LIFE-092.b",
          "status": "implemented",
          "kind": "record",
          "minutes": 15,
          "cost": 0
        },
        "effect": {
          "description": "확인 정보",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "공사 종료일: 실제 통행 가능 상태 확인 뒤 경로 복구; 지연 때만 재안내",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "확인 정보 · 장면 시간 15분 · 추가 비용 없음"
      },
      {
        "id": "c",
        "label": "영향 기록 전달",
        "text": "공식 응답 대기",
        "personality": {
          "weights": {
            "E": 0.2,
            "J": 0.3
          },
          "rationale": "직접 교류하는 방식 0.2 · 미리 정하는 일정·경계 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-092.c",
          "actionId": "scenario.LIFE-092.c",
          "status": "implemented",
          "kind": "request",
          "minutes": 15,
          "cost": 0
        },
        "effect": {
          "description": "공식 응답 대기",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "공사 종료일: 실제 통행 가능 상태 확인 뒤 경로 복구; 지연 때만 재안내",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "공식 응답 대기 · 장면 시간 15분 · 추가 비용 없음 · 승인·거절은 다음 해 현재 여건으로 재확인"
      }
    ],
    "guard": "확인되지 않은 지역 개발·집값 상승 생성 금지; 민원이 즉시 공사 중단시키지 않음",
    "followUp": "공사 종료일: 실제 통행 가능 상태 확인 뒤 경로 복구; 지연 때만 재안내",
    "cancelWhen": [
      "source-context-ended",
      "participant-unavailable",
      "required-fact-expired"
    ],
    "source": {
      "file": "docs/design/LIFE-EVENTS-100.json",
      "evidenceLevel": "fictional-scenario"
    },
    "stateDependencies": [
      "home",
      "current-local-notice-and-access"
    ],
    "probabilityKind": "game-tuning-not-statistics",
    "ready": true,
    "scenarioProfile": true,
    "implementationStatus": "implemented-conditional-scenario"
  },
  {
    "id": "LIFE-093",
    "domain": "community",
    "years": [
      1980,
      2026
    ],
    "ages": [
      18,
      90
    ],
    "title": "자주 가던 공간이 문을 줄인다",
    "text": "도서관·회관·체육 공간의 이용 시간이 바뀐다.",
    "eligibility": "실제 지역 공용공간 운영 변경; 본인 이용 루틴 있음",
    "requires": [
      "scenario.LIFE-093.ready"
    ],
    "cooldownYears": 4,
    "choices": [
      {
        "id": "a",
        "label": "대체 시간 이용",
        "text": "일정 변경",
        "personality": {
          "weights": {
            "P": 0.3
          },
          "rationale": "상황에 맞춘 유연한 조정 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-093.a",
          "actionId": "scenario.LIFE-093.a",
          "status": "implemented",
          "kind": "rule",
          "minutes": 20,
          "cost": 0,
          "record": "visit-time-adjusted"
        },
        "effect": {
          "description": "일정 변경",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "다음 운영기: 실제 시간표·기관 응답에 따라 접근 갱신",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "일정 변경 · 장면 시간 20분 · 추가 비용 없음"
      },
      {
        "id": "b",
        "label": "다른 공간 탐색",
        "text": "접근·이동",
        "personality": {
          "weights": {
            "N": 0.3,
            "P": 0.3
          },
          "rationale": "새 방법 탐색 0.3 · 상황에 맞춘 유연한 조정 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-093.b",
          "actionId": "scenario.LIFE-093.b",
          "status": "implemented",
          "kind": "record",
          "minutes": 25,
          "cost": 0
        },
        "effect": {
          "description": "접근·이동",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "다음 운영기: 실제 시간표·기관 응답에 따라 접근 갱신",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "접근·이동 · 장면 시간 25분 · 추가 비용 없음"
      },
      {
        "id": "c",
        "label": "이용 의견 제출",
        "text": "응답 대기",
        "personality": {
          "weights": {
            "E": 0.2,
            "J": 0.3
          },
          "rationale": "직접 교류하는 방식 0.2 · 미리 정하는 일정·경계 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-093.c",
          "actionId": "scenario.LIFE-093.c",
          "status": "implemented",
          "kind": "request",
          "minutes": 15,
          "cost": 0
        },
        "effect": {
          "description": "응답 대기",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "다음 운영기: 실제 시간표·기관 응답에 따라 접근 갱신",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "응답 대기 · 장면 시간 15분 · 추가 비용 없음 · 승인·거절은 다음 해 현재 여건으로 재확인"
      }
    ],
    "guard": "이용 기록 없는 시설 상실로 관계·건강 자동 차감 금지; 제출=정책 변경 금지",
    "followUp": "다음 운영기: 실제 시간표·기관 응답에 따라 접근 갱신",
    "cancelWhen": [
      "source-context-ended",
      "participant-unavailable",
      "required-fact-expired"
    ],
    "source": {
      "file": "docs/design/LIFE-EVENTS-100.json",
      "evidenceLevel": "fictional-scenario"
    },
    "stateDependencies": [
      "home",
      "current-local-notice-and-access"
    ],
    "probabilityKind": "game-tuning-not-statistics",
    "ready": true,
    "scenarioProfile": true,
    "implementationStatus": "implemented-conditional-scenario"
  },
  {
    "id": "LIFE-094",
    "domain": "community",
    "years": [
      1980,
      2026
    ],
    "ages": [
      18,
      90
    ],
    "title": "비가 오기 전에 바꿀 일정",
    "text": "안내된 위험 구간이 오늘의 이동이나 작업 경로와 겹친다.",
    "eligibility": "해당 지역 실제 재난 안내; 거주·이동 경로 영향 확인",
    "requires": [
      "scenario.LIFE-094.ready"
    ],
    "cooldownYears": 4,
    "choices": [
      {
        "id": "a",
        "label": "안전한 일정 연기",
        "text": "약속 조정",
        "personality": {
          "weights": {
            "J": 0.5
          },
          "rationale": "미리 정하는 일정·경계 0.5",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-094.a",
          "actionId": "scenario.LIFE-094.a",
          "status": "specification-only"
        },
        "effect": {
          "description": "약속 조정",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "상황 종료 뒤: 실제 피해 확인이 있을 때만 수리·보험 절차; 피해 없으면 일상 복귀",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      },
      {
        "id": "b",
        "label": "확인된 대체 경로",
        "text": "추가 이동",
        "personality": {
          "weights": {
            "P": 0.4
          },
          "rationale": "상황에 맞춘 유연한 조정 0.4",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-094.b",
          "actionId": "scenario.LIFE-094.b",
          "status": "specification-only"
        },
        "effect": {
          "description": "추가 이동",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "상황 종료 뒤: 실제 피해 확인이 있을 때만 수리·보험 절차; 피해 없으면 일상 복귀",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      },
      {
        "id": "c",
        "label": "필요한 지원 문의",
        "text": "실제 접수",
        "personality": {
          "weights": {
            "E": 0.2,
            "F": 0.3
          },
          "rationale": "직접 교류하는 방식 0.2 · 상대의 의사·관계 우선 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-094.c",
          "actionId": "scenario.LIFE-094.c",
          "status": "specification-only"
        },
        "effect": {
          "description": "실제 접수",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "상황 종료 뒤: 실제 피해 확인이 있을 때만 수리·보험 절차; 피해 없으면 일상 복귀",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      }
    ],
    "guard": "재난 노출만으로 사망·주택 파괴 확정 금지; 위험지역으로 향하는 보상 선택 없음",
    "followUp": "상황 종료 뒤: 실제 피해 확인이 있을 때만 수리·보험 절차; 피해 없으면 일상 복귀",
    "cancelWhen": [
      "source-context-ended",
      "participant-unavailable",
      "required-fact-expired"
    ],
    "source": {
      "file": "docs/design/LIFE-EVENTS-100.json",
      "evidenceLevel": "fictional-scenario"
    },
    "stateDependencies": [
      "home",
      "current-local-notice-and-access"
    ],
    "probabilityKind": "game-tuning-not-statistics",
    "ready": false,
    "implementationStatus": "deferred-state-or-policy-verification",
    "deferredReason": "원본 조건(해당 지역 실제 재난 안내; 거주·이동 경로 영향 확인)을 만족하는 실제 상태·제도·당사자 입력과 실행 처리가 아직 연결되지 않음. 과거 인물·소유물·진단·공식 통지를 소급 생성하지 않음."
  },
  {
    "id": "LIFE-095",
    "domain": "community",
    "years": [
      1990,
      2026
    ],
    "ages": [
      18,
      90
    ],
    "title": "단골집이 마지막 인사를 한다",
    "text": "평소 이용하던 가게가 문을 닫거나 옮긴다고 한다.",
    "eligibility": "같은 생활권 가게 이용 이력; 실제 폐점·이전 안내",
    "requires": [
      "scenario.LIFE-095.ready"
    ],
    "cooldownYears": 4,
    "choices": [
      {
        "id": "a",
        "label": "인사하고 대안 찾기",
        "text": "접촉·새 탐색",
        "personality": {
          "weights": {
            "E": 0.2,
            "F": 0.3
          },
          "rationale": "직접 교류하는 방식 0.2 · 상대의 의사·관계 우선 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-095.a",
          "actionId": "scenario.LIFE-095.a",
          "status": "specification-only"
        },
        "effect": {
          "description": "접촉·새 탐색",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "이후 구매: 실제 새 이용처와 비용·이동시간만 반영",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      },
      {
        "id": "b",
        "label": "이전지 확인",
        "text": "거리·접근 비교",
        "personality": {
          "weights": {
            "N": 0.3,
            "J": 0.3
          },
          "rationale": "새 방법 탐색 0.3 · 미리 정하는 일정·경계 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-095.b",
          "actionId": "scenario.LIFE-095.b",
          "status": "specification-only"
        },
        "effect": {
          "description": "거리·접근 비교",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "이후 구매: 실제 새 이용처와 비용·이동시간만 반영",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      },
      {
        "id": "c",
        "label": "기존 다른 가게 이용",
        "text": "구매 루틴 변경",
        "personality": {
          "weights": {
            "S": 0.3,
            "J": 0.3
          },
          "rationale": "익숙하고 구체적인 수단 0.3 · 미리 정하는 일정·경계 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-095.c",
          "actionId": "scenario.LIFE-095.c",
          "status": "specification-only"
        },
        "effect": {
          "description": "구매 루틴 변경",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "이후 구매: 실제 새 이용처와 비용·이동시간만 반영",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      }
    ],
    "guard": "단골 이력 없는 가게를 추억 장소로 서술 금지; 폐점 이유 임의 확정 금지",
    "followUp": "이후 구매: 실제 새 이용처와 비용·이동시간만 반영",
    "cancelWhen": [
      "source-context-ended",
      "participant-unavailable",
      "required-fact-expired"
    ],
    "source": {
      "file": "docs/design/LIFE-EVENTS-100.json",
      "evidenceLevel": "fictional-scenario"
    },
    "stateDependencies": [
      "home",
      "current-local-notice-and-access"
    ],
    "probabilityKind": "game-tuning-not-statistics",
    "ready": false,
    "implementationStatus": "deferred-state-or-policy-verification",
    "deferredReason": "원본 조건(같은 생활권 가게 이용 이력; 실제 폐점·이전 안내)을 만족하는 실제 상태·제도·당사자 입력과 실행 처리가 아직 연결되지 않음. 과거 인물·소유물·진단·공식 통지를 소급 생성하지 않음."
  },
  {
    "id": "LIFE-096",
    "domain": "community",
    "years": [
      2000,
      2026
    ],
    "ages": [
      18,
      90
    ],
    "title": "주말 두 시간을 보탤까",
    "text": "동네에서 함께 할 일을 모집하지만 내 주말도 넉넉하진 않다.",
    "eligibility": "지역 행사·봉사 실제 모집; 본인 일정·가능 역할 있음",
    "requires": [
      "scenario.LIFE-096.ready"
    ],
    "cooldownYears": 4,
    "choices": [
      {
        "id": "a",
        "label": "가능 역할 참여",
        "text": "시간·실제 이동비",
        "personality": {
          "weights": {
            "E": 0.4
          },
          "rationale": "직접 교류하는 방식 0.4",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-096.a",
          "actionId": "scenario.LIFE-096.a",
          "status": "implemented",
          "kind": "help",
          "minutes": 120,
          "cost": 0
        },
        "effect": {
          "description": "시간·실제 이동비",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "행사 뒤: 실제 함께한 인물·역할을 기억; 반복 참여 때만 네트워크 확장 후보",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "시간·실제 이동비 · 장면 시간 120분 · 추가 비용 없음"
      },
      {
        "id": "b",
        "label": "물품 등 다른 방식 제안",
        "text": "동의한 기여",
        "personality": {
          "weights": {
            "P": 0.3,
            "F": 0.3
          },
          "rationale": "상황에 맞춘 유연한 조정 0.3 · 상대의 의사·관계 우선 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-096.b",
          "actionId": "scenario.LIFE-096.b",
          "status": "implemented",
          "kind": "request",
          "minutes": 20,
          "cost": 0
        },
        "effect": {
          "description": "동의한 기여",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "행사 뒤: 실제 함께한 인물·역할을 기억; 반복 참여 때만 네트워크 확장 후보",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "동의한 기여 · 장면 시간 20분 · 추가 비용 없음 · 승인·거절은 다음 해 현재 여건으로 재확인"
      },
      {
        "id": "c",
        "label": "참여 보류",
        "text": "기존 일정",
        "personality": {
          "weights": {
            "I": 0.3,
            "P": 0.3
          },
          "rationale": "혼자 정리할 시간 0.3 · 상황에 맞춘 유연한 조정 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-096.c",
          "actionId": "scenario.LIFE-096.c",
          "status": "implemented",
          "kind": "hold",
          "minutes": 0,
          "cost": 0
        },
        "effect": {
          "description": "기존 일정",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "행사 뒤: 실제 함께한 인물·역할을 기억; 반복 참여 때만 네트워크 확장 후보",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "기존 일정 · 추가 시간 없음 · 추가 비용 없음"
      }
    ],
    "guard": "봉사를 도덕 점수·취업 보장으로 환산 금지; 무참여 벌점 없음",
    "followUp": "행사 뒤: 실제 함께한 인물·역할을 기억; 반복 참여 때만 네트워크 확장 후보",
    "cancelWhen": [
      "source-context-ended",
      "participant-unavailable",
      "required-fact-expired"
    ],
    "source": {
      "file": "docs/design/LIFE-EVENTS-100.json",
      "evidenceLevel": "fictional-scenario"
    },
    "stateDependencies": [
      "home",
      "current-local-notice-and-access"
    ],
    "probabilityKind": "game-tuning-not-statistics",
    "ready": true,
    "scenarioProfile": true,
    "implementationStatus": "implemented-conditional-scenario"
  },
  {
    "id": "LIFE-097",
    "domain": "community",
    "years": [
      2000,
      2026
    ],
    "ages": [
      18,
      90
    ],
    "title": "이웃이 잠깐 손을 빌려 달란다",
    "text": "자주 마주치던 사람이 짐이나 간단한 일을 도와 달라고 한다.",
    "eligibility": "실제 이웃 도움 요청; 본인 시간·가능 역할; 상호 동의",
    "requires": [
      "scenario.LIFE-097.ready"
    ],
    "cooldownYears": 4,
    "choices": [
      {
        "id": "a",
        "label": "가능한 범위 도움",
        "text": "시간·역할 기록",
        "personality": {
          "weights": {
            "F": 0.4
          },
          "rationale": "상대의 의사·관계 우선 0.4",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-097.a",
          "actionId": "scenario.LIFE-097.a",
          "status": "implemented",
          "kind": "help",
          "minutes": 30,
          "cost": 0
        },
        "effect": {
          "description": "시간·역할 기록",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "후일 같은 인물에게 요청할 수는 있으나 실제 수락 뒤에만 도움 반영",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "시간·역할 기록 · 장면 시간 30분 · 추가 비용 없음"
      },
      {
        "id": "b",
        "label": "다른 시간 제안",
        "text": "동의 시 예약",
        "personality": {
          "weights": {
            "P": 0.3,
            "F": 0.3
          },
          "rationale": "상황에 맞춘 유연한 조정 0.3 · 상대의 의사·관계 우선 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-097.b",
          "actionId": "scenario.LIFE-097.b",
          "status": "implemented",
          "kind": "request",
          "minutes": 15,
          "cost": 0
        },
        "effect": {
          "description": "동의 시 예약",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "후일 같은 인물에게 요청할 수는 있으나 실제 수락 뒤에만 도움 반영",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "동의 시 예약 · 장면 시간 15분 · 추가 비용 없음 · 승인·거절은 다음 해 현재 여건으로 재확인"
      },
      {
        "id": "c",
        "label": "어렵다고 설명",
        "text": "요청 종료",
        "personality": {
          "weights": {
            "J": 0.3
          },
          "rationale": "미리 정하는 일정·경계 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-097.c",
          "actionId": "scenario.LIFE-097.c",
          "status": "implemented",
          "kind": "hold",
          "minutes": 0,
          "cost": 0
        },
        "effect": {
          "description": "요청 종료",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "후일 같은 인물에게 요청할 수는 있으나 실제 수락 뒤에만 도움 반영",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        },
        "hint": "요청 종료 · 추가 시간 없음 · 추가 비용 없음"
      }
    ],
    "guard": "도움 1회로 무조건 보답 보장 금지; 위험·전문 작업은 가능한 역할에서 제외",
    "followUp": "후일 같은 인물에게 요청할 수는 있으나 실제 수락 뒤에만 도움 반영",
    "cancelWhen": [
      "source-context-ended",
      "participant-unavailable",
      "required-fact-expired"
    ],
    "source": {
      "file": "docs/design/LIFE-EVENTS-100.json",
      "evidenceLevel": "fictional-scenario"
    },
    "stateDependencies": [
      "home",
      "current-local-notice-and-access"
    ],
    "probabilityKind": "game-tuning-not-statistics",
    "ready": true,
    "scenarioProfile": true,
    "implementationStatus": "implemented-conditional-scenario"
  },
  {
    "id": "LIFE-098",
    "domain": "community",
    "years": [
      2010,
      2026
    ],
    "ages": [
      18,
      90
    ],
    "title": "동네 예산에서 무엇이 먼저일까",
    "text": "교통·돌봄·공간 등 여러 요구가 같은 예산을 두고 올라왔다.",
    "eligibility": "주민 의견 수렴 실제 공고; 본인 이해관계·접근 경로 있음",
    "requires": [
      "scenario.LIFE-098.ready"
    ],
    "cooldownYears": 4,
    "choices": [
      {
        "id": "a",
        "label": "사용 경험과 근거 제출",
        "text": "의견 기록",
        "personality": {
          "weights": {
            "E": 0.2,
            "T": 0.3
          },
          "rationale": "직접 교류하는 방식 0.2 · 명시적인 조건·비용 비교 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-098.a",
          "actionId": "scenario.LIFE-098.a",
          "status": "specification-only"
        },
        "effect": {
          "description": "의견 기록",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "공식 발표 뒤: 채택·미채택·부분 반영을 실제 결과로 기록하고 접근 변화 적용",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      },
      {
        "id": "b",
        "label": "설명회 참석",
        "text": "시간·정보",
        "personality": {
          "weights": {
            "E": 0.3,
            "N": 0.2
          },
          "rationale": "직접 교류하는 방식 0.3 · 새 방법 탐색 0.2",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-098.b",
          "actionId": "scenario.LIFE-098.b",
          "status": "specification-only"
        },
        "effect": {
          "description": "시간·정보",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "공식 발표 뒤: 채택·미채택·부분 반영을 실제 결과로 기록하고 접근 변화 적용",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      },
      {
        "id": "c",
        "label": "이번에는 참여하지 않기",
        "text": "변화 없음",
        "personality": {
          "weights": {
            "I": 0.3,
            "P": 0.3
          },
          "rationale": "혼자 정리할 시간 0.3 · 상황에 맞춘 유연한 조정 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-098.c",
          "actionId": "scenario.LIFE-098.c",
          "status": "specification-only"
        },
        "effect": {
          "description": "변화 없음",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "공식 발표 뒤: 채택·미채택·부분 반영을 실제 결과로 기록하고 접근 변화 적용",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      }
    ],
    "guard": "개인 제출이 단독 원인인 것처럼 서술 금지; 정치 성향 자동 추론 금지",
    "followUp": "공식 발표 뒤: 채택·미채택·부분 반영을 실제 결과로 기록하고 접근 변화 적용",
    "cancelWhen": [
      "source-context-ended",
      "participant-unavailable",
      "required-fact-expired"
    ],
    "source": {
      "file": "docs/design/LIFE-EVENTS-100.json",
      "evidenceLevel": "fictional-scenario"
    },
    "stateDependencies": [
      "home",
      "current-local-notice-and-access"
    ],
    "probabilityKind": "game-tuning-not-statistics",
    "ready": false,
    "implementationStatus": "deferred-state-or-policy-verification",
    "deferredReason": "원본 조건(주민 의견 수렴 실제 공고; 본인 이해관계·접근 경로 있음)을 만족하는 실제 상태·제도·당사자 입력과 실행 처리가 아직 연결되지 않음. 과거 인물·소유물·진단·공식 통지를 소급 생성하지 않음."
  },
  {
    "id": "LIFE-099",
    "domain": "community",
    "years": [
      2015,
      2026
    ],
    "ages": [
      18,
      90
    ],
    "title": "문턱 하나가 막는 외출",
    "text": "계단이나 안내 방식 때문에 누군가 약속 장소에 들어가기 어렵다.",
    "eligibility": "본인·주변인이 실제 접근 장벽 경험; 당사자 동의·확인 경로 있음",
    "requires": [
      "scenario.LIFE-099.ready"
    ],
    "cooldownYears": 4,
    "choices": [
      {
        "id": "a",
        "label": "접근 가능한 장소로 변경",
        "text": "합의한 이동·비용",
        "personality": {
          "weights": {
            "F": 0.4
          },
          "rationale": "상대의 의사·관계 우선 0.4",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-099.a",
          "actionId": "scenario.LIFE-099.a",
          "status": "specification-only"
        },
        "effect": {
          "description": "합의한 이동·비용",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "다음 약속: 실제 시설 개선·장소 접근을 확인해 경로 갱신",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      },
      {
        "id": "b",
        "label": "시설에 문의",
        "text": "응답 대기",
        "personality": {
          "weights": {
            "E": 0.2,
            "J": 0.3
          },
          "rationale": "직접 교류하는 방식 0.2 · 미리 정하는 일정·경계 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-099.b",
          "actionId": "scenario.LIFE-099.b",
          "status": "specification-only"
        },
        "effect": {
          "description": "응답 대기",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "다음 약속: 실제 시설 개선·장소 접근을 확인해 경로 갱신",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      },
      {
        "id": "c",
        "label": "당사자와 가능한 도움 협의",
        "text": "동의한 지원",
        "personality": {
          "weights": {
            "E": 0.2,
            "F": 0.3
          },
          "rationale": "직접 교류하는 방식 0.2 · 상대의 의사·관계 우선 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-099.c",
          "actionId": "scenario.LIFE-099.c",
          "status": "specification-only"
        },
        "effect": {
          "description": "동의한 지원",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "다음 약속: 실제 시설 개선·장소 접근을 확인해 경로 갱신",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      }
    ],
    "guard": "장애 인물을 교훈용 배경으로 생성 금지; 도움 강요·민원 즉시 해결 금지",
    "followUp": "다음 약속: 실제 시설 개선·장소 접근을 확인해 경로 갱신",
    "cancelWhen": [
      "source-context-ended",
      "participant-unavailable",
      "required-fact-expired"
    ],
    "source": {
      "file": "docs/design/LIFE-EVENTS-100.json",
      "evidenceLevel": "fictional-scenario"
    },
    "stateDependencies": [
      "home",
      "current-local-notice-and-access"
    ],
    "probabilityKind": "game-tuning-not-statistics",
    "ready": false,
    "implementationStatus": "deferred-state-or-policy-verification",
    "deferredReason": "원본 조건(본인·주변인이 실제 접근 장벽 경험; 당사자 동의·확인 경로 있음)을 만족하는 실제 상태·제도·당사자 입력과 실행 처리가 아직 연결되지 않음. 과거 인물·소유물·진단·공식 통지를 소급 생성하지 않음."
  },
  {
    "id": "LIFE-100",
    "domain": "community",
    "years": [
      1960,
      2026
    ],
    "ages": [
      18,
      95
    ],
    "title": "마지막으로 동네 한 바퀴",
    "text": "이사를 앞두고 익숙한 사람들과 장소를 어떻게 남길지 생각한다.",
    "eligibility": "오래 거주한 지역을 떠나는 계획; 실제 이웃·공유 생활 기억 있음",
    "requires": [
      "scenario.LIFE-100.ready"
    ],
    "cooldownYears": 4,
    "choices": [
      {
        "id": "a",
        "label": "인사하고 연락처 교환",
        "text": "상호 동의한 연결",
        "personality": {
          "weights": {
            "E": 0.3,
            "F": 0.3
          },
          "rationale": "직접 교류하는 방식 0.3 · 상대의 의사·관계 우선 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-100.a",
          "actionId": "scenario.LIFE-100.a",
          "status": "specification-only"
        },
        "effect": {
          "description": "상호 동의한 연결",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "이사 뒤: 실제 교류·방문 때만 관계 유지; 옛 동네 기억은 당시 생활 사건 인용",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      },
      {
        "id": "b",
        "label": "기억할 장소 기록",
        "text": "회상 자료",
        "personality": {
          "weights": {
            "I": 0.4,
            "F": 0.2
          },
          "rationale": "혼자 정리할 시간 0.4 · 상대의 의사·관계 우선 0.2",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-100.b",
          "actionId": "scenario.LIFE-100.b",
          "status": "specification-only"
        },
        "effect": {
          "description": "회상 자료",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "이사 뒤: 실제 교류·방문 때만 관계 유지; 옛 동네 기억은 당시 생활 사건 인용",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      },
      {
        "id": "c",
        "label": "이사 준비 우선",
        "text": "추가 접촉 없음",
        "personality": {
          "weights": {
            "J": 0.3
          },
          "rationale": "미리 정하는 일정·경계 0.3",
          "authored": true
        },
        "requires": [],
        "operation": {
          "id": "scenario.LIFE-100.c",
          "actionId": "scenario.LIFE-100.c",
          "status": "specification-only"
        },
        "effect": {
          "description": "추가 접촉 없음",
          "applyAutomatically": false
        },
        "followUp": {
          "description": "이사 뒤: 실제 교류·방문 때만 관계 유지; 옛 동네 기억은 당시 생활 사건 인용",
          "afterYears": 1,
          "requiresReconfirmation": true,
          "cancelIf": [
            "source-context-ended",
            "participant-unavailable"
          ],
          "automaticSuccess": false
        }
      }
    ],
    "guard": "새 동네에서 옛 이웃이 자동 등장하지 않음; 인사 생략을 배신으로 판정 금지",
    "followUp": "이사 뒤: 실제 교류·방문 때만 관계 유지; 옛 동네 기억은 당시 생활 사건 인용",
    "cancelWhen": [
      "source-context-ended",
      "participant-unavailable",
      "required-fact-expired"
    ],
    "source": {
      "file": "docs/design/LIFE-EVENTS-100.json",
      "evidenceLevel": "fictional-scenario"
    },
    "stateDependencies": [
      "home",
      "current-local-notice-and-access"
    ],
    "probabilityKind": "game-tuning-not-statistics",
    "ready": false,
    "implementationStatus": "deferred-state-or-policy-verification",
    "deferredReason": "원본 조건(오래 거주한 지역을 떠나는 계획; 실제 이웃·공유 생활 기억 있음)을 만족하는 실제 상태·제도·당사자 입력과 실행 처리가 아직 연결되지 않음. 과거 인물·소유물·진단·공식 통지를 소급 생성하지 않음."
  }
];

export default LIFE_EVENTS;
