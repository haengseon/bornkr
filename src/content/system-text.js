// 리드 소유: 작가 A~D 시스템 문구 병합(ARCHITECTURE §9).
import a from './system-text-a.js';
import b from './system-text-b.js';
import c from './system-text-c.js';
import d from './system-text-d.js';

export const SYSTEM_TEXT = { ...a, ...b, ...c, ...d };
