// 게임용 성향(MBTI 풍) 모델: 출생 분포·결정성·호환 레이어·영향 경로. docs/impl/mbti-notes.md
import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../../src/engine/index.js';
import { traitPick, traitFit, typeOf, axis, fxScale, mbtiOdds, jobBias } from '../../src/engine/mbti.js';
import { KR_TYPES, TYPE_INFO, LEAN, optionLean } from '../../src/content/mbti-lean.js';
import { VARIANTS } from '../../src/content/variants.js';
import { variantText } from '../../src/engine/variants.js';
import { reactionFor, lensOf } from '../../src/engine/reaction.js';
import { MBTI_AXIS_LINES, MBTI_ERA_LINES } from '../../src/content/reactions.js';
import { mbtiText, traitChips } from '../../src/ui/persona.js';
import { needYear } from '../../src/engine/anachro.js';

const lives = Array.from({ length: 1000 }, (_, i) => E.newLife({ seed: i + 1 }));
const setType = (L, ty, d = 30) => { [...ty].forEach((ch, i) => { L.mbti[['EI', 'SN', 'TF', 'JP'][i]] = 'ENFJ'.includes(ch) ? 50 + d : 50 - d; }); return L; };

test('출생 분포: 주요 유형(≥5%)이 한국 분포와 상대 ±25% 이내, 성별 F 비율 차이', () => {
  const c = {}, f = { M: [0, 0], F: [0, 0] };
  for (const L of lives) { c[L.mbtiType] = (c[L.mbtiType] || 0) + 1; f[L.sex][0]++; f[L.sex][1] += L.mbti.TF >= 50; }
  for (const [ty, p] of Object.entries(KR_TYPES)) if (p >= 5) {
    const got = (c[ty] || 0) / 10;
    assert.ok(Math.abs(got - p) / p <= 0.25, `${ty} ${got}% vs ${p}%`);
  }
  assert.ok(f.F[1] / f.F[0] - f.M[1] / f.M[0] > 0.2, '여성 F 비율이 남성보다 뚜렷이 높다');
  for (const L of lives.slice(0, 50)) for (const k of ['EI', 'SN', 'TF', 'JP']) assert.ok(Number.isInteger(L.mbti[k]) && L.mbti[k] >= 5 && L.mbti[k] <= 95);
});

test('결정성: 같은 시드 → 같은 MBTI, 다른 출생 추첨(이름·지역·지표)은 성향 도입 전과 같은 흐름', () => {
  const a = E.newLife({ seed: 42 }), b = E.newLife({ seed: 42 });
  assert.deepEqual(a.mbti, b.mbti); assert.equal(a.mbtiType, b.mbtiType); assert.deepEqual({ ...a.traits }, { ...b.traits });
  assert.equal(typeOf({ EI: 40, SN: 60, TF: 50, JP: 49 }), 'INFP');
});

test('호환 레이어: traits 는 mbti 를 읽고 쓰며, JSON·전개 시 값으로 복사된다', () => {
  const L = E.newLife({ seed: 7 });
  assert.equal(L.traits.extra, L.mbti.EI); assert.equal(L.traits.open, L.mbti.SN); assert.equal(L.traits.agree, L.mbti.TF); assert.equal(L.traits.consc, L.mbti.JP);
  L.traits.extra = L.traits.extra + 3; assert.equal(L.mbti.EI, L.traits.extra);
  const s0 = L.traits.sens; L.traits.sens = s0 + 2; assert.equal(L.traits.sens, Math.min(95, s0 + 2));
  assert.deepEqual(Object.keys(JSON.parse(JSON.stringify(L.traits))).sort(), ['agree', 'consc', 'extra', 'open', 'sens']);
  assert.equal(axis({ traits: { extra: 80 } }, 'EI'), 80);   // 옛 L(traits 만)
  assert.equal(mbtiText(L.traits), mbtiText(L.mbti));
  assert.equal(mbtiText(L.mbti), L.mbtiType);
  assert.deepEqual(traitChips({ EI: 10, SN: 50, TF: 50, JP: 90 }).map(c => c.key), ['consc', 'extra']);
});

test('기본 행동·성향 적합: 같은 선택지에 유형이 다르면 다른 선택', () => {
  const opts = ['marry', 'later', 'single'].map(id => ({ id }));
  const fj = setType(E.newLife({ seed: 1 }), 'ESFJ'), tp = setType(E.newLife({ seed: 1 }), 'INTP');
  assert.equal(traitPick(fj, 'sys.fam.marry', opts, 'later').id, 'marry');
  assert.notEqual(traitPick(tp, 'sys.fam.marry', opts, 'marry').id, 'marry');
  assert.equal(traitFit(fj, 'sys.fam.marry', opts), 'marry');
  assert.notEqual(traitFit(tp, 'sys.fam.marry', opts), 'marry');
  // 애매한 성향은 표시 없음
  assert.equal(traitFit(setType(E.newLife({ seed: 1 }), 'ESFJ', 2), 'sys.fam.marry', opts), null);
  // 우연 결정(id 제각각): 효과·위험·라벨에서 축 추정
  const dec = [{ id: 'join', label: '동아리에 들어간다', effects: [{ key: 'relations', dir: 1, size: 1 }], risk: 'mid' }, { id: 'study', label: '혼자 계획을 세운다', effects: [{ key: 'intellect', dir: 1, size: 1 }], risk: 'low' }];
  assert.ok(optionLean(dec[0]).E > 0 && optionLean(dec[1]).I > 0);
  assert.equal(traitFit(setType(E.newLife({ seed: 2 }), 'ESFP'), 'dec.club.career', dec), 'join');
  assert.equal(traitFit(setType(E.newLife({ seed: 2 }), 'ISTJ'), 'dec.club.career', dec), 'study');
  for (const v of Object.values(LEAN)) for (const w of Object.values(v)) for (const ch of Object.keys(w)) assert.match(ch, /^[EINSFTJP]$/);
});

test('생애 진행: ask 가 fit 을 달고, 직접 고른 선택은 성향을 움직이며, 같은 시드는 같은 결과', () => {
  let fits = 0;
  for (const seed of [11, 12, 13]) {
    const L = E.newLife({ seed });
    for (let i = 0; i < 400 && L.alive; i++) {
      if (L.pending) { if (L.pending.fit) { fits++; assert.ok(L.pending.options.some(o => o.fit && o.id === L.pending.fit)); } E.choose(L, L.pending.defaultId); }
      else E.advanceYear(L);
    }
  }
  assert.ok(fits > 0, '성향 적합 표시가 한 번은 나온다');
});

test('영향 경로: 피드 문구·뉴스 생각·증감 배율·오즈·직업 가중이 유형마다 다르다', () => {
  const base = E.newLife({ seed: 5 }); base.year = 2005; base.age = 30;
  const I = setType(E.newLife({ seed: 5 }), 'ISTJ'), Ex = setType(E.newLife({ seed: 5 }), 'ENFP');
  for (const L of [I, Ex]) { L.year = 2005; L.age = 30; }
  const seen = id => [I, Ex].map(L => new Set(Array.from({ length: 6 }, (_, k) => variantText(id, { ...L, mbti: L.mbti, fired: { [id]: k } }, null, 'B'))));
  const [si, se] = seen('youth.friends.meet');
  assert.ok([...si].some(t => /구석 자리/.test(t)) && ![...se].some(t => /구석 자리/.test(t)));
  assert.ok([...se].some(t => /먼저 말을 걸었다/.test(t)));
  // 뉴스: 같은 뉴스, N/S·T/F 렌즈가 다르면 다른 생각
  const news = { kind: 'news', id: 'n.house', year: 2005, text: '', effects: { issues: { housing: 5 } } };
  const r = ty => reactionFor({ ...news, age: 30 }, setType(E.newLife({ seed: 5 }), ty, 30));
  assert.notEqual(r('ISTJ'), r('INFP'));
  assert.equal(lensOf(setType(E.newLife({ seed: 5 }), 'INTJ'), 8), null);   // 아동은 렌즈 없음
  // 증감 배율: F형 관계 변화 민감, T형 일자리 불안 덜 민감
  const F = setType(E.newLife({ seed: 5 }), 'ESFJ'), T = setType(E.newLife({ seed: 5 }), 'ESTJ');
  assert.ok(fxScale(F, 'stats', 'relations') > fxScale(T, 'stats', 'relations'));
  assert.ok(fxScale(T, 'issues', 'job') < 1 && fxScale(F, 'issues', 'job') > 1);
  assert.ok(mbtiOdds(I, 'intellect') > 1 && mbtiOdds(Ex, 'wealth') < 1);
  assert.ok(jobBias(Ex, '5') > jobBias(I, '5') && jobBias(I, '3') > jobBias(Ex, '3'));
  for (const f of [fxScale(F, 'stats', 'relations'), mbtiOdds(I, 'relations'), jobBias(Ex, '2')]) assert.ok(f > 0.75 && f < 1.35);
});

test('문구: 유형 설명 16종·뉴스 생각 60종 이상·금지어·시대 어휘·상태 전제 단어 없음', () => {
  assert.equal(Object.keys(TYPE_INFO).length, 16);
  const lines = [...Object.values(MBTI_AXIS_LINES).flatMap(a => Object.values(a).flatMap(Object.values)), ...Object.values(MBTI_ERA_LINES).flat()];
  assert.ok(lines.length >= 60, String(lines.length));
  const bad = /깨달|소중|교훈|아름다|감동|행복했다|희망찬|반드시|해야 한다|자녀|배우자|손주|아내|남편|부모|애들|결혼/;
  for (const s of lines) { assert.ok(s.length <= 50, s); assert.doesNotMatch(s, bad, s); assert.equal(needYear(s), 0, s); }
  for (const s of Object.values(TYPE_INFO).flat()) { assert.ok(s.length <= 50, s); assert.doesNotMatch(s, /깨달|소중|교훈|감동|반드시|해야 한다/, s); }
  // 변형: MBTI 조건 변형이 20개 이상
  const mb = Object.values(VARIANTS).flat().filter(v => /chs\.every/.test(String(v.when)) || /has\(/.test(String(v.when)));
  assert.ok(mb.length >= 20, String(mb.length));
});
