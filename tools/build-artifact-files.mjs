// Artifact 멀티파일 배포: dist/page.html(작은 페이지) + dist/app.js(IIFE 번들) + dist/app.css.
// 인라인 번들이 뷰어의 페이지 판별에 오분류되는 문제와 모듈 CORS 문제를 함께 피한다(classic script).
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = f => readFile(path.join(root, f), 'utf8');
const { outputFiles } = await build({
  entryPoints: [path.join(root, 'src/main.js')], bundle: true, format: 'iife', minify: true,
  target: 'es2022', write: false, legalComments: 'none', charset: 'utf8',
});
await mkdir(path.join(root, 'dist'), { recursive: true });
await writeFile(path.join(root, 'dist', 'app.js'), outputFiles[0].text);
await writeFile(path.join(root, 'dist', 'app.css'), await read('styles.css'));
await writeFile(path.join(root, 'dist', 'privacy.html'), await read('src/static/privacy.html'));
for (const f of ['manifest.webmanifest', 'icon.svg', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'apple-touch-icon.png']) await writeFile(path.join(root, 'dist', f), await readFile(path.join(root, 'src/static', f)));

const html = (await read('index.html'))
  .replaceAll('src/static/', '')
  .replace(/<!doctype html>\s*/i, '')
  .replace(/<\/?(html|head|body)\b[^>]*>\s*/gi, '')
  .replace(/<meta\s+(charset|name="viewport")[^>]*>\s*/gi, '')
  .replace(/<link rel="stylesheet" href="styles\.css">/, '<link rel="stylesheet" href="app.css">')
  .replace(/<script type="module" src="src\/main\.js"><\/script>/, '<script src="app.js" defer></script>');
if (!html.includes('app.js') || !html.includes('app.css')) throw new Error('치환 실패');
await writeFile(path.join(root, 'dist', 'page.html'), html);
console.log('page.html', html.length, 'bytes; app.js', outputFiles[0].text.length);
