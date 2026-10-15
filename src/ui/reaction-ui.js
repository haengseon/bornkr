// '마음 한 줄' UI 조각. 한 해 최대 2개(createReactor). tag 는 버튼 안에서 쓰면 'span'.
import { createReactor } from '../engine/reaction.js';
import { esc } from './dom.js';

const react = createReactor(2);
export const reactText = (e, L) => react(e, L);
export function reactHtml(e, L, tag = 'p') {
  const t = react(e, L);
  return t ? `<${tag} class="react">${esc(t)}</${tag}>` : '';
}
