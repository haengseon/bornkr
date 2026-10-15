// 정적 호스팅(S3+CloudFront)용 빌드: dist/site/ 에 index.html + 해시 붙은 app.<hash>.js / app.<hash>.css
// 해시 파일은 1년 캐시, index.html만 no-cache로 올리면 배포 즉시 반영된다.
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = f => readFile(path.join(root, f), 'utf8');
const hash = s => crypto.createHash('sha1').update(s).digest('hex').slice(0, 10);

const { outputFiles } = await build({
  entryPoints: [path.join(root, 'src/main.js')], bundle: true, format: 'iife', minify: true,
  target: 'es2022', write: false, legalComments: 'none', charset: 'utf8',
});
const js = outputFiles[0].text, css = await read('styles.css');
const jsName = `app.${hash(js)}.js`, cssName = `app.${hash(css)}.css`;

const html = (await read('index.html'))
  .replaceAll('src/static/', '')
  .replace(/<link rel="stylesheet" href="styles\.css">/, `<link rel="stylesheet" href="${cssName}">`)
  .replace(/<script type="module" src="src\/main\.js"><\/script>/, `<script src="${jsName}" defer></script>`);
if (!html.includes(jsName) || !html.includes(cssName)) throw new Error('index.html 치환 실패');

const STATIC = ['manifest.webmanifest', 'icon.svg', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'apple-touch-icon.png'];
const out = path.join(root, 'dist', 'site');
await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
await Promise.all([
  writeFile(path.join(out, 'index.html'), html),
  writeFile(path.join(out, jsName), js),
  writeFile(path.join(out, cssName), css),
  writeFile(path.join(out, 'ads.txt'), 'google.com, pub-5950509303749076, DIRECT, f08c47fec0942fa0\n', 'utf8'),
  writeFile(path.join(out, 'privacy.html'), await read('src/static/privacy.html')),
  writeFile(path.join(out, 'favicon.ico'), await readFile(path.join(root, 'src/static/icon-192.png'))),   // /favicon.ico 403 방지(PNG 데이터, 브라우저는 내용으로 판별)
  ...STATIC.map(async f => writeFile(path.join(out, f), await readFile(path.join(root, 'src/static', f)))),
]);
console.log(`dist/site: index.html, ads.txt, privacy.html, ${jsName} (${(js.length / 1024).toFixed(0)}KB), ${cssName}`);
