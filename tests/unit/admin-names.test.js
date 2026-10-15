import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SGG, placeLine, placeLabel } from '../../src/engine/sigungu.js';
import { nameAt, sidoAt } from '../../src/data/admin-names.js';

// 그해 쓰이면 안 되는 명칭: [정규식, 금지 조건(year)]
const BAN = [
  [/광역시/, y => y < 1995], [/직할시/, y => y >= 1995], [/세종/, y => y < 2012],
  [/특별자치도/, (y, s) => (s.includes('강원') && y < 2023) || (s.includes('전북') && y < 2024) || (s.includes('제주') && y < 2006)],
  [/창원시 (의창|성산|마산|진해)/, y => y < 2010], [/분당구/, y => y < 1991], [/미추홀구/, y => y < 2018],
  [/(광주|대구|대전|인천)(직할시|광역시)/, (y, s) => (s.includes('광주') && y < 1986) || (s.includes('대전') && y < 1989) || (/대구|인천/.test(s) && y < 1981)],
  [/울산광역시/, y => y < 1997], [/(북|남)제주군/, y => y >= 2006], [/서귀포시/, y => y < 1981],
];

test('표기: 동·교통 없음, 시대착오 명칭 없음, 군은 읍까지 (500 샘플)', () => {
  const ids = [...SGG.keys()];
  let seed = 7; const rnd = n => (seed = (seed * 1103515245 + 12345) % 2147483648) % n;
  for (let i = 0; i < 500; i++) {
    const id = ids[rnd(ids.length)], r = SGG.get(id), year = 1960 + rnd(80), dong = r.dongs[rnd(r.dongs.length)].name;
    for (const s of [placeLine(r.sido, id, dong, year), placeLabel(r.sido, id, dong, year)]) {
      const ctx = `${id} ${dong} ${year}: ${s}`;
      assert.doesNotMatch(s, /\S동(\s|$)|·|생활권|역세권|면(\s|$)|리(\s|$)/, ctx);
      for (const [re, bad] of BAN) if (re.test(s)) assert.ok(!bad(year, s), ctx);
      const last = s.split(' ').at(-1);
      if (/읍$/.test(last)) assert.match(s, /군 \S+읍$/, ctx);       // 읍은 군 아래에서만
      if (/읍$/.test(last)) assert.ok(dong.startsWith(last) || last === '대가야읍', ctx);
    }
  }
});

test('연표 경계', () => {
  assert.equal(sidoAt('gwangju', 1990), '광주직할시');
  assert.equal(sidoAt('gwangju', 1985), '전라남도 광주시');
  assert.equal(sidoAt('busan', 1994), '부산직할시');
  assert.equal(sidoAt('busan', 1995), '부산광역시');
  assert.equal(sidoAt('incheon', 2000), '인천광역시');
  assert.equal(sidoAt('jeju', 2005), '제주도');
  assert.equal(sidoAt('gangwon', 2023), '강원특별자치도');
  assert.equal(placeLine('gyeongnam', 'gyeongnam.changwon', '합성동', 2009), '경남 마산시');
  assert.equal(placeLine('gyeongnam', 'gyeongnam.changwon', '합성동', 2010), '경남 창원시 마산회원구');
  assert.equal(placeLabel('sejong', 'sejong.sejong', '조치원읍', 2012), '세종특별자치시');
  assert.equal(placeLine('daegu', 'daegu.suseong', '범어동', 1975), '경북 대구시 동구');
  assert.equal(placeLine('gyeonggi', 'gyeonggi.seongnam', '정자동', 2000), '경기 성남시 분당구');
  assert.equal(placeLine('gyeongbuk', 'gyeongbuk.uiseong', '의성읍', 1980), '경북 의성군 의성읍');
  assert.equal(placeLine('gyeongbuk', 'gyeongbuk.uiseong', '안계면', 1980), '경북 의성군');
  assert.equal(placeLine('gyeonggi', 'gyeonggi.yeoncheon', '전곡읍', 1984), '경기 연천군');   // 1985 읍 승격
  assert.equal(placeLine('gyeonggi', 'gyeonggi.yeoncheon', '전곡읍', 1985), '경기 연천군 전곡읍');
  assert.equal(placeLine('seoul', 'seoul.gangnam', '역삼동', 1962), '경기 광주군');
  assert.equal(nameAt('daegu.dalseong', 2020, '현풍읍').name, '달성군 현풍읍');
});
