// 지표·이슈·결산 5지표의 값·계산 이유·출처(ARCHITECTURE §11, GDD §4.4·§7.3·§12.1).
// 백분위 숫자는 여기(explain)에서만 쓴다.
import { STATS, ISSUES, STAT_KEYS, ISSUE_KEYS, KINDS } from './constants.js';
import { D, REGION } from './tables.js';
import { econ, healthParts, leisureParts, relationsParts, issueMean } from './stats.js';
import { signals, plainText, lateNote } from './issues.js';
import { COND_LABEL } from './act.js';
import { text, won } from './text.js';

const LABEL = Object.fromEntries([...STATS, ...ISSUES].map(x => [x.key, x.label]));
const sgn = n => (n > 0 ? `+${n}` : `${n}`);
const r0 = Math.round;

// 출처 메타: SOURCES 항목 + 표의 기준연도·구분(실측/전망/추정)
export function srcMeta(id, table) {
  const S = D.SOURCES?.[id] || {};
  const kind = table?.kind ?? (S.kind === 'game' || id === 'GDD.E' ? 'estimated' : 'measured');
  return { id, org: S.org, title: S.title, url: S.url, year: table?.year ?? S.year, kind, kindLabel: KINDS[kind] };
}
const metas = names => names.map(n => (D[n] ? srcMeta(D[n].src, D[n]) : srcMeta(n)));
const uniq = list => { const seen = new Set(); return list.filter(s => !seen.has(s.id) && seen.add(s.id)); };

function histAt(L, age, idx, group) {
  for (let a = age; a >= 0; a--) if (L.hist[a]) return L.hist[a][group][idx];
  return null;
}
function trend(L, key, value) {
  const si = STAT_KEYS.indexOf(key), ii = ISSUE_KEYS.indexOf(key);
  const past = si >= 0 ? histAt(L, Math.max(0, L.age - 5), si, 's') : histAt(L, Math.max(0, L.age - 5), ii, 'i');
  return `${LABEL[key]} ${value} — 최근 5년 ${sgn(value - (past ?? value))}`;
}
function topReasons(L, key, n, fmt) {
  const sum = new Map();
  for (const r of L.reasons[key] || []) {
    if (r.year <= L.year - 8) continue;
    const k = r.text, o = sum.get(k) || { text: k, delta: 0, year: r.year, src: r.src };
    o.delta += r.delta; o.year = r.year;
    sum.set(k, o);
  }
  return [...sum.values()].sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta)).slice(0, n).map(fmt);
}
// 사건 근거 출처 중 SOURCES에 등록된 것만(미등록 ID는 engine-notes 요청에 기록)
const reasonSrc = (L, key) => (L.reasons[key] || []).flatMap(r => [].concat(r.src || [])).filter(id => D.SOURCES?.[id]).map(id => srcMeta(id));
const footer = s => (s ? `기준 데이터: ${s.org ?? s.id} ${s.year ?? ''}(${s.kindLabel})` : null);

function statLines(L, key) {
  const s = L.stats;
  switch (key) {
    case 'health': {
      const p = healthParts(L);
      const conds = p.conds.map(c => COND_LABEL[c.key]).join('·');
      return [[
        `같은 나이 '건강하다' 응답 ${r0(p.good * 100)}% 기준 ${r0(p.HB)}점`,
        p.conds.length ? `만성질환 ${p.conds.length}개(${conds}) −${p.condPen}` : '진단받은 만성질환 없음',
        `의료 접근성 ${L.birth.healthAccess}(${REGION[L.birth.region]?.label}·가구 형편)`,
      ], ['SELF_RATED_HEALTH', 'CHRONIC_INCIDENCE', 'GDD.E']];
    }
    case 'intellect': {
      const i0 = L.hist[0]?.s[1] ?? s.intellect;
      return [[`출생 시 ${i0}, 이후 학습·경험 ${sgn(s.intellect - i0)}`, '가구 배경·질병·장애와 무관하게 계산합니다'], ['GDD.E']];
    }
    case 'happiness':
      return [[`건강 ${s.health}·관계 ${s.relations}·여유 ${s.leisure}·재산 ${s.wealth}에서 온 몫`, `체감 이슈 평균 ${r0(issueMean(L))}`], ['GDD.E', 'LONELY']];
    case 'wealth': {
      const e = econ(L), head = L.flags.indep != null ? L.age : L.birth.parents.motherAge + L.age;
      const band = head < 30 ? '20대' : head < 40 ? '30대' : head < 50 ? '40대' : head < 60 ? '50대' : '60세 이상';
      return [[
        `가구주 ${band} 순자산 분포에서 ${r0(e.NWpos)}번째 백분위 근처`,
        L.flags.indep != null ? `가구 연소득 ${won(e.INC)}만 원(${e.hh}인 가구, 균등화) → 근로 연령 가구 분포 ${r0(e.INCpos)}번째 백분위` : `부모 가구 연소득 ${won(e.INC)}만 원 → 가구 소득 분포 ${r0(e.INCpos)}번째 백분위`,
        `원리금 상환 비율 ${r0(e.dsr * 100)}%`,
        ...(L.money.deficitYears ? [`적자 ${L.money.deficitYears}년 연속`] : []),
        '금액은 만 원(2025년 물가 기준)',
      ], ['NET_WORTH_BOUNDS', 'INCOME_BOUNDS', 'ERA_ASSET_INDEX']];
    }
    case 'relations': {
      const p = relationsParts(L);
      return [[`배우자 ${p.partner ? '+10' : '0'} · 자녀 ${p.kids / 2}명 +${p.kids} · 부모 생존 ${p.parents / 2}명 +${p.parents}${p.alone ? ' · 1인 가구 −8' : ''}`,
        ...(p.moves ? [`최근 3년 이사 −${p.moves}`] : [])], ['LONELY', 'GDD.E']];
    }
    case 'leisure': {
      const p = leisureParts(L);
      return [[`근로 −${p.work} · 돌봄 −${r0(p.care)} · 주거비(월세 ${r0(p.rir * 100)}%) −${r0(p.housing)} · 부채 −${r0(p.debt)}`,
        ...(p.study ? [`학업 −${p.study}`] : [])], ['RIR', 'GDD.E']];
    }
  }
}

function explainIssue(L, key) {
  const value = L.issues[key], comp = signals(L)[key].filter(c => c.text !== '기본').sort((a, b) => b.v - a.v);
  const lines = [
    trend(L, key, value),
    ...comp.slice(0, 3).map(plainText),
    ...topReasons(L, key, 2, r => `${r.year} ${r.text}`),
    '이 축은 순위가 아니라 이 삶이 겪은 강도입니다',
  ];
  const src = uniq([...comp.filter(c => c.src).map(c => srcMeta(c.src)), ...reasonSrc(L, key)]);
  const srcNotes = comp.slice(0, 3).map(lateNote).filter(Boolean);     // 후대 자료를 쓴 줄의 원문(QA #5)
  return { key, label: LABEL[key], value, lines, src: src.length ? src : [srcMeta('GDD.E')], ...(srcNotes.length && { srcNotes }) };
}

// ── 결산 5지표(GDD §12.1) ──
const mean = a => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);
const clamp = (x, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, x));
function series(L, idx, from = 0, to = L.age) {
  const out = [];
  for (let a = from; a <= to; a++) if (L.hist[a]) out.push(L.hist[a].s[idx]);
  return out;
}
export function closing(L) {
  const t = L.tally, end = L.death?.age ?? L.age, adultYears = Math.max(0, end - 18);
  const S = k => STAT_KEYS.indexOf(k);
  const adult = k => { const s = series(L, S(k), 19); return s.length ? s : series(L, S(k)); };
  const last = (k, n) => series(L, S(k), Math.max(0, end - n + 1), end);
  const deficit = t.deficit || 0, invol = (t.invMoves || 0) + (t.contractEnds || 0) + (t.jobLosses || 0) + (t.careStarts || 0) + (L.flags.fraud ? 1 : 0);
  const kidYears = (lo, hi) => L.family.children.reduce((s, c) => {
    const born = c.birthYear - L.birth.year;            // 내 나이 기준 자녀 출생
    return s + Math.max(0, Math.min(end, born + hi) - Math.max(0, born + lo) + 1);
  }, 0);
  const econV = r0(clamp(0.5 * mean(adult('wealth')) + 0.3 * mean(last('wealth', 5)) + 0.2 * (adultYears ? 100 - 100 * deficit / adultYears : 100)));
  const healthV = r0(clamp(0.6 * mean(series(L, S('health'))) + 0.4 * 100 * ((t.recov || 0) + 1) / ((t.dx || 0) + 1)));
  const relV = r0(clamp(0.6 * mean(series(L, S('relations'))) + 0.4 * mean(last('relations', 10))));
  const autV = r0(clamp(0.6 * mean(adult('leisure')) + 0.4 * (100 - Math.min(100, adultYears ? 120 * invol / adultYears : 0))));
  const pre = kidYears(0, 6), school = kidYears(7, 18);
  // 아이 키운 해(겹치는 해는 한 번): 자녀 중 누군가 0~18세였던 내 나이 수
  const raised = new Set();
  for (const c of L.family.children) { const born = c.birthYear - L.birth.year; for (let a = Math.max(0, born); a <= Math.min(end, born + 18); a++) raised.add(a); }
  const careV = r0(clamp(4 * (t.careYears || 0) + 1.5 * pre + 0.5 * school + 10 * (t.youngCarer ? 1 : 0) + 3 * (t.grandcareYears || 0)));
  // 함께 산 가족(본인 제외, QA-S-39). 성인이 되기 전에 끝난 삶은 부모·형제를 센다
  const young = end < 19, b = L.birth;
  const fam = young ? (b.parents.singleParent ? 1 : 2) + b.siblings : (L.family.partner || L.family.married || L.family.widowed || L.family.divorced ? 1 : 0) + L.family.children.length;
  const yl = young ? text('end.young') : null;     // 영아·아동 사망: 성인기 지표 문구 대신(QA-S-24)
  return {
    econ: { value: econV, label: '경제 안정', line: yl ?? text('end.econ', { n: adultYears, k: deficit }), src: metas(['NET_WORTH_BOUNDS']) },
    health: { value: healthV, label: '건강·회복', line: text('end.health', { n: t.dx || 0, m: t.recov || 0 }), src: metas(['CHRONIC_INCIDENCE', 'SELF_RATED_HEALTH']) },
    relations: { value: relV, label: '관계', line: text('end.relations', { n: fam, y: t.aloneYears || 0 }), src: metas(['LONELY']) },
    autonomy: { value: autV, label: '자율성', line: yl ?? text('end.autonomy', { a: t.invMoves || 0, b: t.contractEnds || 0 }), src: metas(['RIR', 'NONREG_SHARE']) },
    careBurden: { value: careV, label: '돌봄 부담', line: yl ?? text('end.careBurden', { a: t.careYears || 0, b: raised.size }), src: metas(['SUPPORT_P', 'GDD.E']) },
  };
}

// key: 6지표·10축, 결산 5지표는 'closing.<키>'(health·relations가 6지표와 겹치므로, QA-S-25). 겹치지 않는 결산 키는 접두 없이도 된다.
export function explain(L, key) {
  if (key.startsWith('closing.')) return explainClosing(L, key.slice(8));
  if (ISSUE_KEYS.includes(key)) return explainIssue(L, key);
  if (STAT_KEYS.includes(key)) {
    const value = L.stats[key];
    const [comp, tables] = statLines(L, key);
    const src = uniq([...metas(tables), ...reasonSrc(L, key)]);
    const lines = [trend(L, key, value), ...comp, ...topReasons(L, key, 3, r => `${r.text} ${sgn(r.delta)}`), footer(src[0])].filter(Boolean);
    return { key, label: LABEL[key], value, lines, src };
  }
  return explainClosing(L, key);
}
function explainClosing(L, key) {
  const c = closing(L)[key];
  if (!c) throw new Error(`explain: 알 수 없는 키 ${key}`);
  return { key, label: c.label, value: c.value, lines: [`${c.label} ${c.value}`, c.line, footer(c.src[0])].filter(Boolean), src: c.src };
}
