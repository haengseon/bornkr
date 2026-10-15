// 직업 콘텐츠 확충용 압축 빌더 (jobs-extra*.js, jobs-more-*.js 공용). 스키마는 jobs-core.js와 동일.
// fx 문자열: 'health-3 leisure-1 job+4 debt+3000' = stats(health·wealth·happiness·relations·leisure·intellect) / issues(job·conflict·fairness·living·medical·tech·region·edu·care·housing) / money(debt·assets).
const STAT = new Set(['health', 'wealth', 'happiness', 'relations', 'leisure', 'intellect']);
const MONEY = new Set(['debt', 'assets']);
export const fx = s => {
  const o = {};
  for (const t of s.trim().split(/\s+/)) {
    const m = /^([a-z]+)([+-]\d+)$/.exec(t);
    if (!m) throw new Error('fx 토큰 오류: ' + t + ' in ' + s);
    const g = STAT.has(m[1]) ? 'stats' : MONEY.has(m[1]) ? 'money' : 'issues';
    (o[g] ||= {})[m[1]] = Number(m[2]);
  }
  return o;
};
const S = ['R09.S1'];
export const E = (type, o) => ({ type, ...o, src: S });
export const tr = (to, ages, minYears, p, reason) => ({ to, ages, minYears, p, reason });
const ACTIVE = ['employed', 'self', 'military'];
const WHEN = {
  any: code => L => L.job?.code === code && ACTIVE.includes(L.job.status),
  self: code => L => L.job?.code === code && L.job.status === 'self',
  wage: code => L => L.job?.code === code && (L.job.status === 'employed' || L.job.status === 'military'),
};
const base = (code, slug, ages, p, text, o) => ({
  id: `job.${code}.${slug}`, tags: o.dark ? ['job', 'dark'] : ['job'], when: WHEN[o.who || 'any'](code),
  ages, p, ...(o.once ? { once: true } : { cooldown: o.cd ?? 4 }), ...(o.years && { years: o.years }), text,
});
// 자동 사건: ev(code, slug, ages, p, text, 'fx', reason, {dark, once, cd, who:'self'|'wage', years})
export const ev = (code, slug, ages, p, text, f, reason, o = {}) => ({ ...base(code, slug, ages, p, text, o), fx: fx(f), reason });
// 선택 사건: ch(code, slug, ages, p, text, prompt, [[id,label,'fx',result],…2~3], defaultId, reason, o)
export const ch = (code, slug, ages, p, text, prompt, opts, def, reason, o = {}) => ({
  ...base(code, slug, ages, p, text, o), choice: { prompt, options: opts.map(([id, label, f, result]) => ({ id, label, fx: fx(f), result })), default: def }, reason,
});
// 직업: X(code, { entry, transitions, events, hazard?, burnout? })
export const X = (code, o) => ({ code, ...o });
