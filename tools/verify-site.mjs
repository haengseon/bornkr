// 배포 산출물의 공개 문서·링크·광고 경계를 검증한다. 실제 광고 서버에는 연결하지 않는다.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { PUBLIC_FILES } from '../src/site/pages.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist/site');
const read = f => fs.readFileSync(path.join(root, f), 'utf8');
const pages = ['index.html', ...PUBLIC_FILES.filter(f => f.endsWith('.html'))];
const adPages = new Set(['guide.html', 'how-it-works.html']);
for (const file of [...PUBLIC_FILES, 'ads.txt']) assert.ok(fs.existsSync(path.join(root, file)), `미포함 파일: ${file}`);
for (const file of pages) {
  const html = read(file), here = new URL(file, 'https://bornkr.click/');
  assert.match(html, /<html lang="ko"/);
  assert.match(html, /<h1[\s>]/);
  assert.match(html, /<nav[\s>]/);
  assert.doesNotMatch(html, /<script[^>]+src=["'][^"']*googlesyndication/);
  const adLoaders = [...html.matchAll(/<script[^>]+src="([^"]*content-ads[^"']*)"/g)];
  assert.equal(adLoaders.length, adPages.has(file) ? 1 : 0, `${file}: 광고 로더 경계`);
  for (const [, href] of html.matchAll(/<(?:a|link|script)\b[^>]*\b(?:href|src)="([^"]+)"/g)) {
    if (/^(mailto:|tel:|data:)/.test(href)) continue;
    const url = new URL(href.replaceAll('&amp;', '&'), here);
    if (url.origin !== here.origin) continue;
    const target = url.pathname === '/' ? 'index.html' : decodeURIComponent(url.pathname.slice(1));
    assert.ok(fs.existsSync(path.join(root, target)), `${file} → 누락된 내부 링크 ${href}`);
    if (url.hash && target.endsWith('.html')) assert.ok(read(target).includes(`id="${url.hash.slice(1)}"`), `${file} → 누락된 앵커 ${href}`);
  }
  if (adPages.has(file)) {
    assert.match(html, /<article data-publisher-content>/);
    assert.match(html, /data-content-ad[^>]*hidden/);
  }
}
const game = read('index.html');
assert.match(game, /name="google-adsense-account" content="ca-pub-5950509303749076"/);
assert.doesNotMatch(game, /navigator\.webdriver/);
assert.match(read('ads.txt'), /google\.com, pub-5950509303749076, DIRECT, f08c47fec0942fa0/);
assert.match(read('robots.txt'), /Allow: \/\s/);
assert.match(read('robots.txt'), /Sitemap: https:\/\/bornkr\.click\/sitemap\.xml/);
const map = [...read('sitemap.xml').matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
for (const file of pages) assert.ok(map.includes(`https://bornkr.click/${file === 'index.html' ? '' : file}`), `사이트맵 누락 ${file}`);
for (const [, src] of game.matchAll(/<script[^>]+src="([^"]+)"/g)) assert.doesNotMatch(read(src), /pagead2\.googlesyndication\.com|adsbygoogle/, '게임 번들에 광고 SDK 포함');
console.log(`공개 HTML ${pages.length}개: 내부 링크·앵커·광고 경계·소유 확인·robots·sitemap 통과`);
