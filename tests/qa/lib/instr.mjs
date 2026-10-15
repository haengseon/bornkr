// 계측 복사본: src/ 를 tests/qa/out/instr/src 로 복사하고 engine/text.js 의 fill()이 값 없는 {var}·null 템플릿을
// 조용히 ''로 바꾸는 지점에 기록을 남기게 한다(원본 소스는 건드리지 않음). globalThis.__QA_MISSING = [{ tpl, key }].
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.resolve(HERE, '../../../src');
export const INSTR_ROOT = path.resolve(HERE, '../out/instr/src');

export function prepareInstr() {
  fs.rmSync(path.resolve(INSTR_ROOT, '..'), { recursive: true, force: true });
  fs.cpSync(SRC, INSTR_ROOT, { recursive: true });
  const f = path.join(INSTR_ROOT, 'engine/text.js');
  let s = fs.readFileSync(f, 'utf8');
  const patches = [
    ["if (v == null) return '';", "if (v == null) { (globalThis.__QA_MISSING ??= []).push({ tpl: String(tpl).slice(0, 140), key: k }); return ''; }"],
    ["if (tpl == null) return '';", "if (tpl == null) { (globalThis.__QA_MISSING ??= []).push({ tpl: '(null template)', key: '' }); return ''; }"],
  ];
  for (const [a, b] of patches) {
    if (!s.includes(a)) throw new Error('instr: fill() 패턴을 못 찾음 — text.js가 바뀌었는지 확인: ' + a);
    s = s.replace(a, b);
  }
  fs.writeFileSync(f, s);
}
export const instrUrl = rel => pathToFileURL(path.join(INSTR_ROOT, rel)).href;
