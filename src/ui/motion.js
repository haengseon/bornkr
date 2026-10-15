// 공용 모션: 화면 전환 방향·스위치. 길이·이징은 styles.css 토큰(--dur-fast/base/slow, --ease-out)이 정한다.
// 규칙: transform/opacity 만, 입력을 막지 않는다(애니메이션은 pointer-events 를 건드리지 않음), 전환 중 다른 전환이 오면 DOM 이 교체되며 곧바로 끝난다.
// 끄기: 주소에 ?motion=off (E2E·디버그) → <html data-motion="off">. 설정 '모션 줄이기'/OS 설정 → data-motion="reduce"(짧은 페이드만).

const DEPTH = { home: 0, gate: 1, birth: 1, archive: 1, codex: 1, settings: 1, life: 2, detail: 2, death: 3, summary: 4 };
let last = null;

// 이전 화면 → 새 화면: 앞으로(오른쪽에서) / 뒤로(왼쪽에서) / 같은 깊이는 페이드만
export function dirOf(from, to) {
  if (from == null || DEPTH[from] == null || DEPTH[to] == null) return 'fade';
  return DEPTH[to] > DEPTH[from] ? 'fwd' : DEPTH[to] < DEPTH[from] ? 'back' : 'fade';
}
export function motionOff() {
  try { return new URLSearchParams(location.search).get('motion') === 'off'; } catch { return false; }
}
// show()가 새 화면 요소를 넣은 직후 부른다. life 는 상단·하단 고정 바가 있어 슬라이드 없이 페이드만.
export function enterScreen(el, name) {
  const dir = name === 'life' ? 'fade' : dirOf(last, name);
  last = name;
  if (!el) return dir;
  el.dataset.enter = dir;
  return dir;
}
export const fastYear = speed => speed >= 4;     // 4×·5×: 큰 연출(흔들림·글로우)을 줄인다
