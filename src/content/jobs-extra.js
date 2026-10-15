// 확충 직업(고유 사건·진입 경로·전직 규칙). 대분류별 파트를 합친다. jobs-core.js가 끝에서 병합해 내보낸다.
import a1 from './jobs-extra-1.js';
import a2a from './jobs-extra-2a.js';
import a2b from './jobs-extra-2b.js';
import a3 from './jobs-extra-3.js';
import a4a from './jobs-extra-4a.js';
import a4b from './jobs-extra-4b.js';
import a5 from './jobs-extra-5.js';
import a6 from './jobs-extra-6.js';
import a7 from './jobs-extra-7.js';
import a8 from './jobs-extra-8.js';
import a9 from './jobs-extra-9.js';
import m1 from './jobs-more-1.js';
import m2a from './jobs-more-2a.js';
import m2b from './jobs-more-2b.js';
import m3 from './jobs-more-3.js';
import m4a from './jobs-more-4a.js';
import m4b from './jobs-more-4b.js';
import m5 from './jobs-more-5.js';
import m6 from './jobs-more-6.js';
import m7 from './jobs-more-7.js';
import m8 from './jobs-more-8.js';
import m9 from './jobs-more-9.js';

export const EXTRA = [...a1, ...a2a, ...a2b, ...a3, ...a4a, ...a4b, ...a5, ...a6, ...a7, ...a8, ...a9];
// 핵심 150 직업에 더하는 추가 사건: { 코드: [사건…] }
export const MORE = Object.assign({}, m1, m2a, m2b, m3, m4a, m4b, m5, m6, m7, m8, m9);
export default EXTRA;
