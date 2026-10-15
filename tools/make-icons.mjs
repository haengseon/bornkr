// 아이콘 PNG 생성(1회성, 결과를 src/static 에 커밋): node tools/make-icons.mjs — 헤드리스 Chromium 으로 icon.svg 를 렌더링
import { readFile, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright-core';
import path from 'node:path';
const exe = process.env.QA_CHROMIUM || path.join(process.env.LOCALAPPDATA || '', 'ms-playwright', 'chromium_headless_shell-1234', 'chrome-headless-shell-win64', 'chrome-headless-shell.exe');
const svg = await readFile('src/static/icon.svg', 'utf8');
const b = await chromium.launch({ executablePath: exe });
for (const [name, size, scale] of [['icon-192.png', 192, 1], ['icon-512.png', 512, 1], ['icon-maskable-512.png', 512, .8], ['apple-touch-icon.png', 180, 1]]) {
  const p = await b.newPage({ viewport: { width: size, height: size } });
  await p.setContent(`<body style="margin:0;background:#2341A0"><div style="width:${size}px;height:${size}px;display:grid;place-items:center"><div style="width:${size * scale}px;height:${size * scale}px">${svg.replace('<svg ', '<svg width="100%" height="100%" ')}</div></div>`);
  await writeFile(`src/static/${name}`, await p.screenshot());
}
await b.close();
