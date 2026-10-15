// 종합 뉴스(정치·경제·사회·국제·스포츠·문화·IT·사건사고·보건·교육·노동·부동산 등)와 '나에게 닿은 일' 링크. 병합 파일.
// 형식(NEWS_GENERAL 한 건): { id:'ng.1988.olympics', years:[1988,1988], sec:'sports', headline(≤24자), summary(≤80자), ages?:[a,b], weight?:1~3, src:[URL], links:[ { when:L=>bool, line:'나는 …(≤60자, 상태와 모순 없는 인과 문장)', fx:{stats,issues,money}, reason } ] }
// links는 위에서부터 처음 맞는 것 하나가 적용된다. 맞는 링크가 있는 뉴스가 우선 뽑히고, 없으면 사실만 보인다.
// ERA_LINKS: 기존 시대 사건(src/content/events/era.js의 id)에도 같은 형식의 links를 붙인다.
import { NG_A } from './news-general-a.js';
import { NG_B } from './news-general-b.js';
import { NG_C } from './news-general-c.js';
import { ERA_LINKS_MAP } from './news-era-links.js';

export const NEWS_GENERAL = [...NG_A, ...NG_B, ...NG_C];
export const ERA_LINKS = ERA_LINKS_MAP;
