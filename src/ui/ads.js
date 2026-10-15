// 결산 화면 하단 광고 1개. 실제 요청은 운영 호스트 + 슬롯 ID가 있을 때만, 그 외는 자리표시자. 자동 새로고침 없음.
import { ADS } from '../config.js';

const SRC = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
const KEY = 'hj.ads';   // localStorage 'off' 로 끔(개발용)

// 'off' | 'placeholder' | 'live'
export function adMode(cfg = ADS, loc = globalThis.location, store = globalThis.localStorage) {
  try {
    if (new URLSearchParams(loc?.search || '').get('ads') === 'off') return 'off';
    if (store?.getItem(KEY) === 'off') return 'off';
  } catch {}
  return cfg.enabled && cfg.slot && cfg.client && (cfg.productionHosts || []).includes(loc?.hostname) ? 'live' : 'placeholder';
}

const loads = new WeakMap();   // document -> Promise (스크립트 1회만)
export function loadAdScript(doc = document, cfg = ADS, timeout = 8000) {
  if (loads.has(doc)) return loads.get(doc);
  const p = new Promise((resolve, reject) => {
    const old = doc.querySelector?.('script[src*="adsbygoogle.js"]');
    if (old) return resolve();   // 이미 있는 태그는 재사용
    const s = doc.createElement('script');
    s.async = true; s.crossOrigin = 'anonymous';
    s.src = `${SRC}?client=${cfg.client}`;
    const t = setTimeout(() => reject(new Error('timeout')), timeout);
    s.onload = () => { clearTimeout(t); resolve(); };
    s.onerror = () => { clearTimeout(t); reject(new Error('blocked')); };
    doc.head.appendChild(s);
  });
  p.catch(() => {});
  loads.set(doc, p);
  return p;
}

// 같은 <ins>에는 한 번만 push
export function pushAd(ins, win = window) {
  if (ins.getAttribute('data-adsbygoogle-status') || ins.getAttribute('data-ads-pushed')) return false;
  ins.setAttribute('data-ads-pushed', '1');
  (win.adsbygoogle = win.adsbygoogle || []).push({});
  return true;
}

export const adSlotHtml = () => adMode() === 'off' ? ''
  : '<aside class="adzone" aria-label="광고"><p class="adzone__label">광고</p><div class="adzone__box"></div></aside>';

let io = null;
export function mountAd(root = document) {
  try {
    io?.disconnect(); io = null;
    const box = root.querySelector?.('.adzone__box');
    if (!box) return;
    box.textContent = '';   // 재마운트: 이전 <ins> 제거
    if (adMode() !== 'live') { box.innerHTML = '<span class="adzone__ph">광고 영역(미리보기)</span>'; return; }
    const ins = document.createElement('ins');
    ins.className = 'adsbygoogle'; ins.style.display = 'block';
    ins.setAttribute('data-ad-client', ADS.client); ins.setAttribute('data-ad-slot', ADS.slot);
    ins.setAttribute('data-ad-format', 'auto'); ins.setAttribute('data-full-width-responsive', 'true');
    box.appendChild(ins);
    const go = () => loadAdScript().then(() => { if (ins.isConnected) pushAd(ins); }).catch(() => {});
    if (!('IntersectionObserver' in window)) return go();
    io = new IntersectionObserver((es, o) => { if (es.some(e => e.isIntersecting)) { o.disconnect(); io = null; go(); } });
    io.observe(box);
  } catch {}
}
