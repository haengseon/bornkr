// UI 문구·라벨 헬퍼(순수 — DOM 없음, Node 테스트 가능). UI-SPEC §5 S04 칩 약칭, §11 카피 규칙.
import { STATS, ISSUES, KINDS, REGIONS } from '../engine/constants.js';

export const STAT_LABEL = Object.fromEntries(STATS.map(s => [s.key, s.label]));
export const ISSUE_LABEL = Object.fromEntries(ISSUES.map(i => [i.key, i.label]));
export const ISSUE_SHORT = { housing: '주거', job: '일자리', edu: '교육', care: '돌봄', medical: '의료', fairness: '공정', region: '지역', tech: '기술', conflict: '갈등', living: '생활비' };
export const CLOSING_KEYS = ['econ', 'health', 'relations', 'autonomy', 'careBurden'];
export const CLOSING_LABEL = { econ: '경제 안정', health: '건강·회복', relations: '관계', autonomy: '자율성', careBurden: '돌봄 부담' };

export const MINUS = '−';
export const signed = n => (n > 0 ? '▲' : n < 0 ? '▼' : '–') + Math.abs(Math.round(n));

// 사건 효과 → 칩 문구 ["재산 −3", "주거 +8"]
export function fxChips(fx) {
  if (!fx) return [];
  const out = [];
  for (const [k, d] of Object.entries(fx.stats || {})) if (d && STAT_LABEL[k]) out.push(`${STAT_LABEL[k]} ${signed(d)}`);
  for (const [k, d] of Object.entries(fx.issues || {})) if (d && ISSUE_SHORT[k]) out.push(`${ISSUE_SHORT[k]} ${signed(d)}`);
  return out;
}

export const sexLabel = s => (s === 'F' || s === '여' ? '여' : '남');
const REGION = Object.fromEntries(REGIONS.map(r => [r.key, r]));
export const regionShort = k => REGION[k]?.label ?? k ?? '';
export const regionFull = k => REGION[k]?.full ?? k ?? '';

// 고유어 나이(비교 카드 제목): 29 → "스물아홉"
const TENS = ['', '열', '스물', '서른', '마흔', '쉰', '예순', '일흔', '여든', '아흔'];
const ONES = ['', '하나', '둘', '셋', '넷', '다섯', '여섯', '일곱', '여덟', '아홉'];
export function nativeAge(n) {
  if (!(n > 0 && n < 100)) return `${n}세`;
  return TENS[Math.floor(n / 10)] + ONES[n % 10];
}

const ORD = ['첫', '두', '세', '네', '다섯'];
export const quintileAria = q => `다섯 단계 중 ${ORD[q - 1] ?? ''} 번째`;

// 받침 조사: josa('폐렴', '으로') → '폐렴으로', josa('고혈압', '으로') → '고혈압으로', josa('노쇠', '으로') → '노쇠로'
export function josa(word, j) {
  const c = String(word).trim().slice(-1).charCodeAt(0) - 0xac00;
  const has = c >= 0 && c <= 11171 ? c % 28 : 0;   // 한글 아니면 받침 없음으로
  const pairs = { '은': ['은', '는'], '이': ['이', '가'], '을': ['을', '를'], '과': ['과', '와'], '으로': ['으로', '로'] };
  const [a, b] = pairs[j] || [j, j];
  if (j === '으로') return word + (has && has !== 8 ? a : b);   // ㄹ 받침은 '로'
  return word + (has ? a : b);
}

// 표 kind(measured|projected|estimated)와 출처 kind(official|secondary|game) 두 분류를 모두 받는다(QA-E-24).
// group은 도감 필터용: 공식·2차 자료는 실측 자료의 출처라 '실측', game은 '추정'.
const BADGE = {
  measured: ['measured', KINDS.measured], projected: ['projected', KINDS.projected], estimated: ['estimated', KINDS.estimated],
  official: ['measured', '공식 통계'], secondary: ['secondary', '2차 자료'], game: ['estimated', KINDS.estimated],
};
export function kindBadge(kind) {
  const [k, label] = BADGE[kind] ?? BADGE.estimated;
  return { cls: `badge badge--${k}`, label, group: k === 'secondary' ? 'measured' : k };
}
// sourceMeta { org, title, year } → "통계청 · 생명표 · 2024"
export const srcText = s => (typeof s === 'string' ? s : [s.org, s.title, s.year].filter(Boolean).join(' · '));

const pad2 = n => String(n).padStart(2, '0');
export const mmdd = b => pad2(b.month) + pad2(b.day);
export const dateKo = b => `${b.year}년 ${b.month}월 ${b.day}일`;
export const dateDot = b => `${b.year}.${b.month}.${b.day}`;
export const dateDotSp = b => `${b.year}. ${b.month}. ${b.day}.`;
export const receiptNo = (b, seed) => `${b.year}-${mmdd(b)}-${String(seed ?? '').replace(/\D/g, '').slice(-4).padStart(4, '0')}`;
export const ageText = (a, horizon) => (horizon ? `${a}세` : a < 1 ? '첫해' : `향년 ${a}세`);

// 사인 문구: 민감 원인은 UI 어디에도 쓰지 않고, 설정 '숨기기'면 모든 원인을 숨긴다(UI-SPEC S09 ②).
export function causeLabel(death, hide) {
  if (!death || death.sensitive || hide || !death.causeLabel) return null;
  return death.causeLabel;
}
export const deathLine = (death, hide) => {
  if (death?.horizon) return '이야기는 여기서 멈춥니다. 삶은 계속됩니다.';   // 시간 지평선(2050)
  const c = causeLabel(death, hide);
  return c ? `${josa(c, '으로')} 세상을 떠났습니다.` : '세상을 떠났습니다.';
};

// 생애 구간 진행 표시(UI-SPEC §7.1 updateHud)
export function stageState(stages, age, remaining = 20) {
  return stages.map(st => {
    if (age > st.to) return { id: st.id, label: st.label, state: 'done', p: 1 };
    if (age < st.from) return { id: st.id, label: st.label, state: 'todo', p: 0 };
    const to = st.id === 'late' ? age + Math.max(1, remaining) : st.to;
    return { id: st.id, label: st.label, state: 'current', p: Math.min(1, (age - st.from) / (to - st.from + 1)) };
  });
}

// 지표 경고 단계(UI-SPEC S04): ≤10 위험, ≤25 주의
export const statLevel = v => (v <= 10 ? 'critical' : v <= 25 ? 'low' : '');
