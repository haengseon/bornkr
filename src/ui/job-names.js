import { JOB_TITLE_ALIASES } from '../data/jobs.js';

// JSON으로 읽은 저장 데이터에만 적용한다. 사용자 이름·서사·급여 등은 보존한다.
export function restoreJobNames(value) {
  if (!value || typeof value !== 'object') return value;
  for (const [key, child] of Object.entries(value)) {
    if (['title', 'jobTitle', 'job1'].includes(key) && typeof child === 'string'
        && Object.hasOwn(JOB_TITLE_ALIASES, child)) value[key] = JOB_TITLE_ALIASES[child];
    else if (child && typeof child === 'object') restoreJobNames(child);
  }
  return value;
}
