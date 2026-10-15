// 새 관심사·고민이 생기면 피드에 남긴다: ① 생애 단계가 바뀌며 새 관심사가 떠오를 때 ② 어떤 고민이 처음으로 눈에 띄는 수준(55)을 넘을 때. 한 해 1건.
import { concernsOf, stageOf } from './concerns.js';

export function concernWatch(L, ctx) {
  const seen = (L.flags.concernSeen ||= {}), st = stageOf(L.age).id;
  const c = concernsOf(L), items = c.items.filter(i => i.value > 0);
  if (!items.length) return;
  const first = L.flags.concernStage !== st;
  L.flags.concernStage = st;
  let pick = null, how = '';
  if (first) { pick = [...items].sort((a, b) => b.value - a.value)[0]; how = 'stage'; }
  if (!pick) pick = items.filter(i => i.value >= 55 && !seen[st + i.key]).sort((a, b) => b.value - a.value)[0], how = 'rise';
  for (const i of items) if (i.value >= 55) seen[st + i.key] = L.year;       // 이미 넘은 것은 다시 알리지 않는다
  if (!pick || seen[`n${st}${pick.key}`]) return;
  seen[`n${st}${pick.key}`] = L.year;
  const why = pick.reason ? ` ${pick.reason}.` : '';
  const text = how === 'stage' ? `${c.stageLabel}의 새 관심사: ‘${pick.label}’.${why}` : `‘${pick.label}’이 새로운 고민으로 마음에 걸리기 시작했다.${why}`;
  ctx.emit({ kind: 'personal', id: 'sys.concern.new', text, concern: pick.key });
}
