// 부팅: 설정 적용 → 출처 지연 로드 → 전역 클릭 위임 → (Artifact hot 데이터면 이어서) 홈.
import { S, routes, go, applySettings, toast, nav, pushScreen, SUBS, PARENT } from './ui/dom.js';
import { loadCurrent, clearCurrent } from './ui/store.js';
import { startResume, persist } from './ui/play.js';
import { qaTrace } from './engine/index.js';
import './ui/screens.js';

applySettings();
import('./data/sources.js').then(m => { S.sources = m.SOURCES || {}; }).catch(() => {});

function tryResume(cur) {
  try { return !!cur && startResume(cur); } catch (e) { console.error(e); return false; }
}
routes.resume = () => {
  if (tryResume(loadCurrent())) return;
  clearCurrent();
  toast('이어 할 생애를 불러오지 못했습니다.');
  go('home');
};

// 화면 이력(QA-E-11): 기록관·도감·설정은 이력 한 칸을 쌓고, 뒤로 가기(popstate)는 앱 안 이전 화면으로
try { history.scrollRestoration = 'manual'; } catch {}   // 화면 전환 시 위치는 show()가 맨 위로 되돌린다(뒤로 가기 때 브라우저가 옛 위치를 덮어쓰지 않게)
try { history.replaceState({ hj: 'home', d: 0 }, ''); } catch {}
for (const name of SUBS) {
  const render = routes[name];
  routes[name] = (...a) => { if (!nav.popping && nav.lv !== name) pushScreen(name); nav.lv = name; return render(...a); };
}
addEventListener('popstate', e => {
  if (nav.sheetPop) { nav.sheetPop = false; return; }                   // 시트를 닫는 데 쓰인 뒤로 가기
  if (document.body.dataset.screen === 'life') return;                 // 진행 중에는 건드리지 않는다
  const to = e.state?.hj;
  if (!nav.lv && !(to in PARENT)) return;                              // 앱 안 이력이 아니면 그대로
  nav.popping = true;
  try { go(to === 'detail' ? 'archive' : to in PARENT ? to : 'home'); } finally { nav.popping = false; }
});

document.addEventListener('click', e => {
  const t = e.target.closest('[data-go]');
  if (!t) return;
  const g = t.dataset.go;
  if (g) {
    if (history.state?.d > 0 && PARENT[nav.lv] === g) return history.back();   // 상위 화면 버튼 = 뒤로 가기(이력을 쌓지 않는다)
    return go(g);
  }
});
addEventListener('pagehide', persist);

// Artifact 뷰어: 진행 중 생애를 hot snapshot으로 남기고, 부팅 시 hot.data가 있으면 이어서(ARCHITECTURE §14)
const hot = window.claude?.hot;
try {
  hot?.snapshot?.(() => (S.L?.alive && S.clock && document.body.dataset.screen === 'life'
    ? { forcedYear: S.forced?.year, guess: S.guess, seed: S.L.seed, choices: S.L.choices, elapsed: Math.round(S.clock.elapsed()), age: S.L.age, name: S.L.name, year: S.L.year }
    : null));
} catch {}
if (!(hot?.data?.seed != null && tryResume(hot.data))) go('home');
try { hot?.ready?.(); } catch {}
try { window.__splashReady?.(); } catch {}   // 스플래시: 앱 준비 완료 알림(index.html 인라인)
try { window.__hjQa = () => qaTrace(S.L); } catch {}   // QA 재현 로그(시드·선택 경로·사건 ID)
