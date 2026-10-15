// 리드 소유: 모든 사건 병합. 작가는 각자 파일만 수정한다.
import early from './early.js';
import school from './school.js';
import youth from './youth.js';
import mid from './mid.js';
import late from './late.js';
import history from './history.js';
import era from './era.js';
import dark from './dark.js';
import rare from './rare.js';
import catalogA from './catalog-a.js';
import catalogB from './catalog-b.js';
import future from './future.js';

export const ERA_EVENTS = era;
export const EVENTS = [...early, ...school, ...youth, ...mid, ...late, ...history, ...dark, ...rare, ...catalogA, ...catalogB, ...future];
