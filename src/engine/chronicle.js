// 실제 상태의 연말 기록. 같은 해의 선택이 이어지면 마지막 상태로 갱신한다.
import { familyMembers } from './kin.js';
import { otherAssets } from './stats.js';

export function recordYear(L) {
  const h = L.home, j = L.job, m = L.money;
  const assets = m.assets + otherAssets(L) + (h.tenure === 'own' ? h.value : 0) + (['jeonse', 'monthly'].includes(h.tenure) ? h.deposit : 0);
  const row = {
    year: L.year, age: L.age,
    home: { region: h.region, sigungu: h.sigungu, dong: h.dong, tenure: h.tenure, rent: h.rent, deposit: h.deposit },
    job: { status: j.status, title: j.title, wage: j.wage, regular: j.regular, exam: L.flags.examUntil != null, school: L.edu?.stage || '', onLeave: !!L.edu?.leave },
    asset: { assets: Math.round(assets), debt: m.debt, net: Math.round(assets - m.debt), income: m.income },
    family: familyMembers(L).map(({ id, label, member: p }) => ({ id, rel: label, name: p.name || '', alive: p.alive !== false, bond: p.bond ?? 65, ...(p.deathYear != null && { deathYear: p.deathYear }) })),
    ...((L.modelVersion ?? 1) >= 2 && {
      daily: L.dailyLife?.summary ? JSON.parse(JSON.stringify(L.dailyLife.summary)) : null,
      identity: L.identityStrain ? { stress: L.identityStrain.stress, confusion: L.identityStrain.confusion,
        stage: L.identityStrain.stage, concern: L.identityStrain.concern ? { ...L.identityStrain.concern } : null } : null,
    }),
  };
  (L.chronicle ||= {})[L.age] = row;
  return row;
}
