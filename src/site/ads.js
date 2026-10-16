// 검토 대기 중에는 광고 요청을 보내지 않는다. 승인 후에도 검토한 읽기 페이지 2개에만 수동 단위 1개를 허용한다.
export const ADS = Object.freeze({ enabled: false, client: 'ca-pub-5950509303749076', slot: '2563338673' });
export const CONTENT_PATHS = Object.freeze(['/guide.html', '/how-it-works.html']);
export function canRequestAds(url, config = ADS) {
  return config.enabled === true && /^ca-pub-\d+$/.test(config.client) && /^\d+$/.test(config.slot)
    && url.protocol === 'https:' && ['bornkr.click', 'www.bornkr.click'].includes(url.hostname)
    && CONTENT_PATHS.includes(url.pathname);
}
export function mountContentAd(doc = document, win = window) {
  if (!canRequestAds(new URL(win.location.href)) || !doc.querySelector('main article[data-publisher-content]')) return;
  const box = doc.querySelector('[data-content-ad]');
  if (!box) return;
  box.hidden = false;
  let requested = false;
  const request = () => {
    if (requested || !box.isConnected) return;
    requested = true;
    const unit = doc.createElement('ins');
    unit.className = 'adsbygoogle';
    Object.assign(unit.dataset, { adClient: ADS.client, adSlot: ADS.slot, adFormat: 'auto', fullWidthResponsive: 'true' });
    box.append(unit);
    const sdk = doc.createElement('script');
    sdk.async = true; sdk.crossOrigin = 'anonymous';
    sdk.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADS.client}`;
    sdk.onload = () => { try { (win.adsbygoogle ||= []).push({}); } catch { box.hidden = true; } };
    sdk.onerror = () => { box.hidden = true; };
    doc.head.append(sdk);
  };
  if ('IntersectionObserver' in win) {
    const observer = new win.IntersectionObserver(entries => { if (entries.some(e => e.isIntersecting)) { observer.disconnect(); request(); } });
    observer.observe(box);
  } else request();
}
if (typeof document !== 'undefined') mountContentAd();
