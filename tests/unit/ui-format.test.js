import test from 'node:test';
import assert from 'node:assert/strict';
import * as F from '../../src/ui/format.js';
import { nominal, cpiMult, deltaText, tenureText } from '../../src/ui/format.js';
// 화면 금액은 줄바꿈 방지용 NBSP 를 쓴다: 비교는 일반 공백으로 정규화
const nb = f => (...a) => { const r = f(...a); return typeof r === 'string' ? r.replace(/ /g, ' ') : r && typeof r === 'object' ? { ...r, nominal: r.nominal?.replace(/ /g, ' '), today: r.today?.replace(/ /g, ' ') ?? r.today } : r; };
const fmtWon = nb(F.fmtWon), fmtIncome = nb(F.fmtIncome), fmtRent = nb(F.fmtRent), money = nb(F.money), areaText = nb(F.areaText);
import { profileOf, rankOf, bizOf, employmentOf, fmtMan } from '../../src/ui/profile.js';
import { radarPoints, waveY, optionIcon } from '../../src/ui/gauges.js';
import { sceneModel, layerKeys, placeOf } from '../../src/ui/scene.js';
import { mediumOf, pickNews } from '../../src/ui/news.js';
import { pickYear, birthsOf, decadeYears } from '../../src/ui/era.js';
import { newLife, advanceYear, choose } from '../../src/engine/index.js';

test('fmtWon: 통상 금액 표기', () => {
  assert.equal(fmtWon(48711), '4억 8,711만 원');
  assert.equal(fmtWon(3500), '3,500만 원');
  assert.equal(fmtWon(20000), '2억 원');
  assert.equal(fmtWon(0.5), '5,000원');
  assert.equal(fmtWon(-1200), '−1,200만 원');
  assert.equal(fmtIncome(4200), '연봉 4,200만 원');
  assert.equal(fmtIncome(2400, { monthly: true }), '월급 200만 원');
  assert.equal(fmtRent(1000, 50), '보증금 1,000만 원 / 월 50만 원');
  assert.equal(deltaText(3), '▲3'); assert.equal(deltaText(-2), '▼2');
  assert.equal(areaText(59), '전용 59㎡(약 18평)');
  assert.equal(tenureText(0), '1년 미만');
});
test('nominal·money: 그해 명목 + 2026년 환산 병기(현재 근처는 생략)', () => {
  assert.equal(nominal(4200, 2025), 4200);
  assert.ok(Math.abs(nominal(4200, 1990) - 4200 / 3.03) < 1);
  assert.equal(cpiMult(2030).m, 1);
  assert.ok(cpiMult(1970).est && nominal(1000, 1970) < nominal(1000, 1980));
  const m = money(4200, 1990);
  assert.equal(m.nominal, '1,386만 원'); assert.equal(m.today, '2026년 환산 약 4,200만 원');
  assert.equal(money(4200, 2025).today, null);
});
test('rankOf: 직급 추정 규칙', () => {
  const j = o => ({ status: 'employed', regular: true, major: '3', firmSize: 'large', years: 0, title: '경리', ...o });
  assert.equal(rankOf(j()).label, '사원');
  assert.equal(rankOf(j({ years: 9 })).label, '과장');
  assert.equal(rankOf(j({ years: 20 })).label, '부장');
  assert.equal(rankOf(j({ years: 9, firmSize: 'mid' })).label, '대리');
  assert.equal(rankOf(j({ firmSize: 'micro', years: 9 })).label, '팀장·실장급');
  assert.equal(rankOf(j({ major: '1' })).label, '임원·관리자');
  assert.equal(rankOf(j({ major: '7' })).label, '해당 없음');
  assert.equal(rankOf(j({ regular: false })).label, '해당 없음');
  assert.equal(rankOf({ status: 'student' }), null);
});
test('bizOf·employmentOf: 자영업 추정, 고용 형태', () => {
  const b = bizOf({ status: 'self', major: '4', wage: 2160, years: 6, title: '한식당' });
  assert.equal(b.monthlyProfit, 180); assert.equal(b.monthlySales, 1000); assert.equal(b.years, 7); assert.ok(b.est);
  assert.equal(bizOf({ status: 'employed' }), null);
  assert.equal(employmentOf({ age: 30, job: { status: 'employed', regular: false, wage: 1200 } }).label, '시간제');
  assert.equal(employmentOf({ age: 30, job: { status: 'employed', regular: true, wage: 4000 } }).label, '정규직');
  assert.equal(employmentOf({ age: 70, job: { status: 'retired' } }).label, '은퇴');
  assert.equal(fmtMan(12000), '1.2억원');
});

function lifeAt(seed, age) {
  const L = newLife({ seed });
  while (L.alive && L.age < age) { advanceYear(L); while (L.pending) choose(L, L.pending.defaultId, { auto: true }); }
  return L;
}
test('profileOf: 실제 생애에서 값이 채워지고 평가어·순위가 없다', () => {
  for (const seed of [3, 11, 42, 77]) for (const age of [10, 30, 50, 70]) {
    const L = lifeAt(seed, age); if (!L.alive) continue;
    const p = profileOf(L);
    assert.ok(p.home.regionLabel && p.home.tenureLabel !== undefined);
    assert.ok(Number.isFinite(p.money.assets) && Number.isFinite(p.money.debt));
    const working = L.job.status === 'employed' || L.job.status === 'self';
    assert.equal(!!p.pay, working);
    assert.equal(!!p.biz, L.job.status === 'self');
    assert.ok(!/순위|백분위|등급|성공|실패/.test(JSON.stringify(p)));
    const m = sceneModel(L); assert.ok(m.dwelling && m.stage && layerKeys(m).home);
  }
});
test('gauges: 레이더 꼭짓점·물결 높이·선택 아이콘', () => {
  const p = radarPoints([100, 100, 100, 100], 50, 50, 40);
  assert.deepEqual(p[0], [50, 10]); assert.deepEqual(p[1], [90, 50]);
  assert.deepEqual(radarPoints([0, 0, 0], 5, 5, 9).map(x => x.join()), ['5,5', '5,5', '5,5']);
  assert.ok(waveY(100) < waveY(0));
  assert.equal(optionIcon('병원에 간다'), 'medical'); assert.equal(optionIcon('???'), 'go');
});
test('scene: placeOf', () => {
  assert.equal(placeOf({ age: 5, edu: { stage: 'kinder' }, job: { status: 'none' } }), 'kinder');
  assert.equal(placeOf({ age: 30, job: { status: 'self' } }), 'store');
  assert.equal(placeOf({ age: 70, job: { status: 'retired' } }), 'bench');
});
test('news: 시대별 매체, 1년 1건, era 사건 우선·아카이브 대체', () => {
  assert.equal(mediumOf(1975).id, 'paper'); assert.equal(mediumOf(1995).id, 'tv'); assert.equal(mediumOf(2005).id, 'portal');
  assert.equal(mediumOf(2015).id, 'push'); assert.equal(mediumOf(2025).id, 'short'); assert.equal(mediumOf(2040).id, 'holo');
  const seen = new Set(), L = { year: 1998 };
  const e = [{ kind: 'news', year: 1998, text: '외환위기가 닥쳤다. 많은 기업이 문을 닫았다.', effects: { issues: { job: 8 } } }];
  const a = pickNews(L, e, [{ year: 1998, headline: 'X' }], seen);
  assert.equal(a.from, 'era'); assert.deepEqual(a.axes, ['job']);
  assert.equal(pickNews(L, e, null, seen), null);
  assert.equal(pickNews({ year: 2001 }, [], [{ year: 2001, headline: 'H', summary: 'S', axes: ['edu'] }], seen).from, 'archive');
  assert.equal(pickNews({ year: 2002 }, [], null, seen), null);
});
test('era: 연대 안에서 출생아 가중 추첨', () => {
  for (const d of [1960, 1970, 1980]) for (const r of [0, .3, .99]) assert.ok(decadeYears(d).includes(pickYear(d, r)));
  assert.ok(pickYear(1980, 0.9999) <= 1985);
  assert.ok(birthsOf(1988) > birthsOf(1990) * .9);
});
