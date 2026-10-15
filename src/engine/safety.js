// 도움 자원 연결(ARCHITECTURE §15, §18.4)
import { HELP_LINES, HELP_BY_SENSITIVE } from '../content/help.js';

export function helpFor(kind, age) {
  if (kind === 'abuse' && age >= 65) kind = 'elder';           // 노인학대는 노인보호전문기관
  const ids = [...(HELP_BY_SENSITIVE[kind] || [])];
  if (age != null && age < 19 && (kind === 'selfharm' || kind === 'death')) ids.push('1388');
  return [...new Set(ids)].map(id => HELP_LINES.find(h => h.id === id)).filter(Boolean);
}

// 민감 로그 필드: 같은 종류 첫 노출에만 도움 줄을 붙인다(GDD §9.2)
export function sensFields(L, kind) {
  if (!kind) return {};
  const first = !L.flags['help_' + kind];
  L.flags['help_' + kind] = L.year;
  return { sensitive: kind, ...(first && { help: helpFor(kind, L.age) }) };
}
