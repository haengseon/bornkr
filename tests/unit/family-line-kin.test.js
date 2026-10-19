import test from 'node:test';
import assert from 'node:assert/strict';
import { kinOk, familyLine } from '../../src/ui/screens.js';
import { newLife } from '../../src/engine/index.js';

// 출생 연출 가족사 한 줄이 실제 가족 구성과 어긋나지 않는다(A7)
const L = (o = {}) => ({ seed: 1, sex: o.sex ?? 'F', birth: { year: 1980, order: 1, parents: { singleParent: !!o.single, dualIncome: !!o.dual } }, family: { gp: o.gp ?? [], siblingMembers: o.sibs ?? [] } });
const gp = (side, sex) => ({ side, sex, alive: true });

test('친족어 판별: 없는 조부모·부재 부모·없는 손위 형제 문장은 뺀다', () => {
  assert.equal(kinOk('할아버지는 땅 문서 한 장을 가장 소중히 여겼다.', L()), false);
  assert.equal(kinOk('할아버지는 땅 문서 한 장을 가장 소중히 여겼다.', L({ gp: [gp('paternal', 'M')] })), true);
  assert.equal(kinOk('외할머니는 장터에서 나물을 팔아 자식을 키웠다.', L({ gp: [gp('paternal', 'F')] })), false);
  assert.equal(kinOk('증조할아버지는 토지조사 때 흩어진 문서를 모았다.', L()), true);
  assert.equal(kinOk('아버지는 전쟁 탓에 소학교를 마치지 못했다.', L({ single: true })), false);
  assert.equal(kinOk('큰아버지는 서독 광산에서 3년을 일했다.', L({ single: true })), true);
  assert.equal(kinOk('조부모는 폐지 줍는 이웃을 보며 연금을 챙겼다.', L({ single: true, gp: [gp('maternal', 'F')] })), true);
  assert.equal(kinOk('큰형은 농사를 접고 도시 공장으로 떠났다.', L({ sex: 'M' })), false);
  assert.equal(kinOk('큰형은 농사를 접고 도시 공장으로 떠났다.', L({ sex: 'M', sibs: [{ sex: 'M', birthYear: 1975 }] })), true);
  assert.equal(kinOk('이웃 형은 서울 공장으로 떠나며 인사를 남겼다.', L()), true);
});

test('실제 생애 500개: 가족사 한 줄은 늘 있고 모두 구성과 맞는다', () => {
  for (let s = 1; s <= 500; s++) {
    const l = newLife({ seed: s }), line = familyLine(l);
    assert.ok(line, `seed ${s}`);
    assert.ok(kinOk(line, l), `seed ${s}: ${line}`);
  }
});
