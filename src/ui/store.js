// localStorage 저장(ARCHITECTURE §14, §19). 모든 접근 try/catch — 실패해도 게임은 메모리 값으로 동작.
const K = { records: 'hj.v1.records', settings: 'hj.v1.settings', current: 'hj.v1.current' };
export const MAX_RECORDS = 30;
export const DEFAULTS = { speed: 1, auto: false, theme: 'system', seen19: false, reduceMotion: false, hideSensitiveCause: false };

function get(key, fallback) {
  try { return JSON.parse(globalThis.localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}
function put(key, v) {
  try { v == null ? globalThis.localStorage.removeItem(key) : globalThis.localStorage.setItem(key, JSON.stringify(v)); } catch {}
}

export const loadSettings = () => {
  const s = { ...DEFAULTS, ...get(K.settings, {}) };
  if (![1, 2, 4].includes(s.speed)) s.speed = 4;   // 예전 10배속 저장값 등 허용 범위 밖은 최대 배속으로
  return s;
};
export const saveSettings = s => put(K.settings, s);

export function loadRecords() {
  const r = get(K.records, []);
  return Array.isArray(r) ? r.filter(x => x && x.seed != null) : [];
}
// 최신이 앞, 같은 id는 교체, 최대 30개
export const pushRecord = (list, rec) => [rec, ...list.filter(r => r.id !== rec.id)].slice(0, MAX_RECORDS);
export function addRecord(rec) { const l = pushRecord(loadRecords(), rec); put(K.records, l); return l; }
export const clearRecords = () => put(K.records, null);

export const loadCurrent = () => { const c = get(K.current, null); return c && c.seed != null ? c : null; };
export const saveCurrent = c => put(K.current, c);
export const clearCurrent = () => put(K.current, null);
